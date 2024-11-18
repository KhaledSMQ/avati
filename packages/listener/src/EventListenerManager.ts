import { debounce } from '@avati/debounce';
import { throttle } from '@avati/throttle';

type EventId = string;
type ElementWeakRef = WeakRef<Element>;

interface EventOptions extends AddEventListenerOptions {
    debounce?: number;
    throttle?: number;
    async?: boolean;
    metadata?: boolean;
    onError?: (error: Error) => void;
    leading?: boolean;
    trailing?: boolean;
    debug?: boolean;
}

interface ListenerMetadata {
    timestamp: number;
    eventId: EventId;
    originalCallback: string;
}

interface ListenerDetails {
    element: ElementWeakRef;
    eventType: string;
    callback: EventListener;
    originalCallback: EventListener;
    options: EventOptions;
    timestamp: number;
}

interface EventMetadata extends Event {
    metadata?: ListenerMetadata;
}

type LimiterType = 'throttle' | 'debounce';
type EventType =
    | 'input'
    | 'change'
    | 'keyup'
    | 'keydown'
    | 'focus'
    | 'blur'
    | 'click'
    | 'mousemove'
    | 'scroll'
    | 'resize'
    | 'wheel';

// Private symbol declarations
const _listeners = Symbol('listeners');
const _weakRefMap = Symbol('weakRefMap');
const _handleWeakRef = Symbol('handleWeakRef');
const _validateParams = Symbol('validateParams');
const _generateEventId = Symbol('generateEventId');
const _eventIdCounter = Symbol('eventIdCounter');

class EventListenerManager {
    public readonly defaultOptions: Readonly<EventOptions>;
    private readonly [_listeners]: Map<EventId, ListenerDetails>;
    private readonly [_weakRefMap]: WeakMap<Element, Set<EventId>>;
    private [_eventIdCounter]: number;
    // TODO - Add more event mappings
    private readonly EVENT_MAPPINGS: Record<LimiterType, Set<EventType>> = {
        debounce: new Set(['input', 'change', 'keyup', 'keydown', 'focus', 'blur', 'click']),
        throttle: new Set(['mousemove', 'scroll', 'resize', 'wheel']),
    } as const;

    constructor() {
        this[_listeners] = new Map<EventId, ListenerDetails>();
        this[_weakRefMap] = new WeakMap<Element, Set<EventId>>();
        this[_eventIdCounter] = 0;

        // Bind methods to preserve context
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);

        this.defaultOptions = Object.freeze({
            capture: false,
            passive: true,
            once: false,
            async: false,
        });
    }

    /**
     * Adds an event listener with advanced options.
     * @param element - The target element to attach the event listener.
     * @param eventType - The type of the event to listen for.
     * @param callback - The callback function to execute when the event is triggered.
     * @param options - Additional options for the event listener.
     * @returns A unique EventId representing the event listener.
     */
    public add(
        element: Element,
        eventType: string,
        callback: EventListener,
        options: EventOptions = {},
    ): EventId {
        this[_validateParams](element, eventType, callback);

        const eventId = this[_generateEventId]();
        const finalOptions: EventOptions = { ...this.defaultOptions, ...options };

        let enhancedCallback: EventListener = callback;

        if (finalOptions.debounce && finalOptions.throttle) {
            throw new Error('Cannot specify both debounce and throttle options');
        }

        // Create the async wrapper first if needed
        if (finalOptions.async) {
            const asyncCallback = async (event: Event): Promise<void> => {
                try {
                    await (callback as (event: Event) => Promise<void>)(event);
                } catch (error) {
                    if (finalOptions.onError && error instanceof Error) {
                        finalOptions.onError(error);
                    } else {
                        throw error;
                    }
                }
            };
            enhancedCallback = asyncCallback as unknown as EventListener;
        }

        // Apply debounce/throttle after async wrapper
        if (finalOptions.debounce) {
            // check recommendation
            this.recommendation(eventType as EventType, 'debounce');
            enhancedCallback = debounce(enhancedCallback, {
                wait: finalOptions.debounce,
                leading: finalOptions.leading,
                trailing: finalOptions.trailing,
                debug: finalOptions.debug,
                onError: finalOptions.onError,
            });
        } else if (finalOptions.throttle) {
            this.recommendation(eventType as EventType, 'throttle');
            enhancedCallback = throttle(enhancedCallback, finalOptions.throttle, {
                leading: finalOptions.leading,
                trailing: finalOptions.trailing,
                onError: finalOptions.onError,
            });
        }

        // Create wrapper that includes event metadata and error handling
        const wrappedCallback: EventListener = async (event: Event) => {
            if (finalOptions.metadata) {
                (event as EventMetadata).metadata = {
                    timestamp: Date.now(),
                    eventId,
                    originalCallback: callback.name || 'anonymous',
                };
            }
            try {
                await enhancedCallback.call(element, event);
            } catch (error) {
                if (finalOptions.onError && error instanceof Error) {
                    finalOptions.onError(error);
                } else {
                    throw error;
                }
            }
            // Handle 'once' option
            if (finalOptions.once) {
                this.remove(eventId);
            }
        };

        // Store listener details
        const listenerDetails: ListenerDetails = {
            element: new WeakRef(element),
            eventType,
            callback: wrappedCallback,
            originalCallback: callback,
            options: finalOptions,
            timestamp: Date.now(),
        };

        this[_listeners].set(eventId, listenerDetails);
        this[_handleWeakRef](element, eventId);

        element.addEventListener(eventType, wrappedCallback, finalOptions);

        return eventId;
    }

    /**
     * Removes an event listener
     */
    public remove(eventId: EventId): boolean {
        const listener = this[_listeners].get(eventId);
        if (!listener) return false;

        const element = listener.element.deref();
        if (element) {
            element.removeEventListener(listener.eventType, listener.callback, listener.options);

            // Remove eventId from _weakRefMap
            const elementRefs = this[_weakRefMap].get(element);
            if (elementRefs) {
                elementRefs.delete(eventId);
                if (elementRefs.size === 0) {
                    this[_weakRefMap].delete(element);
                }
            }
        }

        this[_listeners].delete(eventId);
        return true;
    }

    /**
     * Adds event listener with automatic cleanup
     */
    public addWithCleanup(
        element: Element,
        eventType: string,
        callback: EventListener,
        options: EventOptions = {},
    ): () => void {
        const eventId = this.add(element, eventType, callback, options);
        return () => this.remove(eventId);
    }

    /**
     * Gets all active listeners for an element
     */
    public getListeners(element: Element): Array<{
        eventId: EventId;
        eventType: string;
        options: EventOptions;
        timestamp: number;
    }> {
        const elementRefs = this[_weakRefMap].get(element);
        if (!elementRefs) return [];

        return Array.from(elementRefs)
            .map((eventId) => {
                const listener = this[_listeners].get(eventId);
                if (!listener) return null;

                const el = listener.element.deref();
                if (!el || el !== element) return null;

                return {
                    eventId,
                    eventType: listener.eventType,
                    options: listener.options,
                    timestamp: listener.timestamp,
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }

    /**
     * Removes all listeners from an element
     */
    public removeAll(element: Element): void {
        const elementRefs = this[_weakRefMap].get(element);
        if (!elementRefs) return;

        for (const eventId of elementRefs) {
            this.remove(eventId);
        }

        this[_weakRefMap].delete(element);
    }

    /**
     * Creates a one-time event listener that auto-removes
     */
    public once(
        element: Element,
        eventType: string,
        callback: EventListener,
        options: EventOptions = {},
    ): EventId {
        return this.add(element, eventType, callback, { ...options, once: true });
    }

    /**
     * Validates input parameters
     * @private
     */
    private [_validateParams](element: unknown, eventType: unknown, callback: unknown): void {
        if (
            !(
                element instanceof Element ||
                element instanceof Window ||
                element instanceof global.Document
            )
        ) {
            throw new TypeError('Element must be an instance of Element, Window, or Document');
        }

        if (typeof eventType !== 'string') {
            throw new TypeError('Event type must be a string');
        }

        if (typeof callback !== 'function') {
            throw new TypeError('Callback must be a function');
        }
    }

    /**
     * Generates a unique event ID
     * @private
     */
    private [_generateEventId](): EventId {
        return `event_${++this[_eventIdCounter]}`;
    }

    /**
     * Handles WeakRef management
     * @private
     */
    private [_handleWeakRef](element: Element, eventId: EventId): void {
        let elementRefs = this[_weakRefMap].get(element);
        if (!elementRefs) {
            elementRefs = new Set<EventId>();
            this[_weakRefMap].set(element, elementRefs);
        }
        elementRefs.add(eventId);
    }

    private recommendation(eventType: EventType, limiterType: LimiterType) {
        const oppositeType: LimiterType = limiterType === 'throttle' ? 'debounce' : 'throttle';
        if (this.EVENT_MAPPINGS[oppositeType].has(eventType)) {
            console.warn(
                `Event type '${eventType}' is recommended to be ${oppositeType}d instead of ${limiterType}d.`,
            );
        }
    }
}

// Create singleton instance
const eventManager = new EventListenerManager();

export default eventManager;

// Type exports
export type { EventId, EventOptions, ListenerMetadata, ListenerDetails, EventMetadata };
