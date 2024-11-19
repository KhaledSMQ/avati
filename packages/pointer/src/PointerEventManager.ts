import { EventHandler } from './eventHandler';
import { PubSub, PubSubEventType, PubSubHandlers } from './pubsub';
import { PointerState, SinglePointerState } from './types';
import { eventManager } from '@avatijs/listener';

/**
 * Supported pointer and mouse event types.
 */
export type PointerEventType =
    | 'pointerdown'
    | 'pointerup'
    | 'pointermove'
    | 'pointerenter'
    | 'pointerleave'
    | 'pointercancel'
    | 'click'
    | 'dblclick'
    | 'contextmenu';

/**
 * Configuration options for the AdvancedPointerEventManager.
 */
export interface PointerEventManagerConfig {
    moveEventTarget?: 'element' | 'window' | 'document'; // Target for pointermove events
}

/**
 * AdvancedPointerEventManager manages pointer and mouse events with advanced features.
 */
export class AdvancedPointerEventManager {
    private element: HTMLElement;
    private eventHandler: EventHandler;
    // @ts-ignore
    private config: PointerEventManagerConfig;
    private pubSub: PubSub;
    private rafId: number | null;
    private isUpdating: boolean;
    private activeListeners: Set<PointerEventType>;
    private readonly listenerOptions = {
        passive: true,
        capture: false,
    };

    private events: (() => void)[] = [];

    constructor(element: HTMLElement, config?: PointerEventManagerConfig) {
        this.element = element;
        this.config = config || { moveEventTarget: 'element' };
        this.eventHandler = new EventHandler({
            pointers: new Map<number, SinglePointerState>(),
        });
        this.pubSub = new PubSub();
        this.rafId = null;
        this.isUpdating = false;
        this.activeListeners = new Set();
        this.init();
    }

    /**
     * Registers an event handler with optional debouncing.
     * Handlers can be asynchronous functions.
     * @param eventType The type of event to listen for.
     * @param handler The callback function.
     */
    public on<K extends PubSubEventType>(eventType: K, handler: PubSubHandlers[K]): void {
        if (handler) {
            this.activeListeners.add(eventType);
            // @ts-ignore
            this.pubSub.subscribe(eventType, handler);
        }
    }

    /**
     * Removes an event handler.
     * @param eventType The type of event.
     * @param handler The handler function to remove.
     */
    public off<K extends PubSubEventType>(eventType: K, handler: PubSubHandlers[K]): void {
        if (handler) {
            // @ts-ignore
            this.pubSub.unsubscribe(eventType, handler);
        }
    }

    /**
     * Destroys the manager by removing all event listeners and handlers.
     */
    public destroy(): void {
        this.events.forEach((clean) => clean());
        this.pubSub.clear();
        this.eventHandler.resetState();
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
        }
    }

    /**
     * Retrieves the current pointer state.
     * @returns PointerState
     */
    public getState(): PointerState {
        return this.eventHandler.getState();
    }

    /**
     * Determines the target for pointermove events based on configuration.
     * @param target The target specified in the configuration.
     * @returns The EventTarget to listen to.
     */
    // @ts-ignore
    private getMoveEventTarget(target: 'element' | 'window' | 'document'): EventTarget {
        switch (target) {
            case 'window':
                return window;
            case 'document':
                return document;
            case 'element':
            default:
                return this.element;
        }
    }

    /**
     * Initializes event listeners.
     */
    private init(): void {
        // Bind event handlers

        this.events = [
            eventManager.addWithCleanup(
                this.element,
                'pointerdown',
                this.handlePointerDown,
                this.listenerOptions,
            ),

            // @ts-ignore // TODO - Add pointerup event listener to the window
            eventManager.addWithCleanup(
                window,
                'pointerup',
                this.handlePointerUp,
                this.listenerOptions,
            ),

            // @ts-ignore  // TODO - Add pointermove event listener to the moveEventTarget
            eventManager.addWithCleanup(window, 'pointermove', this.handlePointerMove, {
                throttle: 1000 / 120, // 120fps
                debug: true,
            }),
            eventManager.addWithCleanup(this.element, 'pointerenter', this.handlePointerEnter),
            eventManager.addWithCleanup(this.element, 'pointerleave', this.handlePointerLeave),
            eventManager.addWithCleanup(this.element, 'pointercancel', this.handlePointerCancel),
            eventManager.addWithCleanup(this.element, 'click', this.handleClick),
            eventManager.addWithCleanup(this.element, 'dblclick', this.handleDblClick),
            eventManager.addWithCleanup(this.element, 'contextmenu', this.handleContextMenu),
        ];
    }

    /**
     * Internal handler for pointer down events.
     * @param event PointerEvent
     */
    private handlePointerDown = async (event: any): Promise<void> => {
        this.eventHandler.handlePointerDown(event);
        await this.pubSub.publish('pointerdown', event, this.convertStateToMap());
        this.startUpdating();
    };

    /**
     * Internal handler for pointer up events.
     * @param event PointerEvent
     */
    private handlePointerUp = async (event: any): Promise<void> => {
        this.eventHandler.handlePointerUp(event);
        await this.pubSub.publish('pointerup', event, this.convertStateToMap());
        this.stopUpdatingIfNecessary();
    };

    /**
     * Internal handler for pointer move events.
     * @param event PointerEvent
     */
    private handlePointerMove = (event: any) => {
        this.eventHandler.handlePointerMove(event);
        this.pubSub.publish('pointermove', event, this.convertStateToMap()).catch(console.error);
    };

    /**
     * Internal handler for pointer enter events.
     * @param event PointerEvent
     */
    private handlePointerEnter = async (event: any): Promise<void> => {
        this.eventHandler.handlePointerEnter(event);
        await this.pubSub.publish('pointerenter', event, this.convertStateToMap());
    };

    /**
     * Internal handler for pointer leave events.
     * @param event PointerEvent
     */
    private handlePointerLeave = async (event: any): Promise<void> => {
        this.eventHandler.handlePointerLeave(event);
        await this.pubSub.publish('pointerleave', event, this.convertStateToMap());
    };

    /**
     * Internal handler for pointer cancel events.
     * @param event PointerEvent
     */
    private handlePointerCancel = async (event: any): Promise<void> => {
        this.eventHandler.handlePointerCancel(event);
        await this.pubSub.publish('pointercancel', event, this.convertStateToMap());
        this.stopUpdatingIfNecessary();
    };

    /**
     * Internal handler for click events.
     * @param event MouseEvent
     */
    private handleClick = async (event: any): Promise<void> => {
        await this.pubSub.publish('click', event);
    };

    /**
     * Internal handler for double-click events.
     * @param event MouseEvent
     */
    private handleDblClick = async (event: any): Promise<void> => {
        await this.pubSub.publish('dblclick', event);
    };

    /**
     * Internal handler for context menu events.
     * @param event MouseEvent
     */
    private handleContextMenu = async (event: any): Promise<void> => {
        await this.pubSub.publish('contextmenu', event);
    };

    /**
     * Triggers the animation frame loop for continuous updates if not already running.
     */
    private startUpdating(): void {
        if (!this.isUpdating) {
            this.isUpdating = true;
            this.rafId = requestAnimationFrame(this.updateLoop);
        }
    }

    /**
     * Stops the animation frame loop if no pointers are active.
     */
    private stopUpdatingIfNecessary(): void {
        const state = this.getState();
        if (state.pointers.size === 0 && this.isUpdating) {
            this.isUpdating = false;
            if (this.rafId !== null) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }
    }

    /**
     * The animation frame loop that can be used for continuous updates.
     */
    private updateLoop = (): void => {
        // Users can extend this method for custom continuous updates if needed
        // Currently, it ensures the loop continues while updating
        if (this.isUpdating) {
            this.rafId = requestAnimationFrame(this.updateLoop);
        }
    };

    /**
     * Converts PointerState to a Map<number, any> for pub-sub.
     * @returns Map of pointer states.
     */
    private convertStateToMap(): Map<number, any> {
        const state = this.getState();
        const stateMap = new Map<number, any>();
        state.pointers.forEach((value, key) => {
            stateMap.set(key, { ...value });
        });
        return stateMap;
    }
}
