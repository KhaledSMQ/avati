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
declare const _listeners: unique symbol;
declare const _weakRefMap: unique symbol;
declare const _handleWeakRef: unique symbol;
declare const _validateParams: unique symbol;
declare const _generateEventId: unique symbol;
declare const _eventIdCounter: unique symbol;
declare class EventListenerManager {
    private readonly [_listeners];
    private readonly [_weakRefMap];
    private [_eventIdCounter];
    readonly defaultOptions: Readonly<EventOptions>;
    private readonly EVENT_MAPPINGS;
    constructor();
    /**
     * Validates input parameters
     * @private
     */
    private [_validateParams];
    /**
     * Generates a unique event ID
     * @private
     */
    private [_generateEventId];
    /**
     * Handles WeakRef management
     * @private
     */
    private [_handleWeakRef];
    private recommendation;
    /**
     * Adds an event listener with advanced options.
     * @param element - The target element to attach the event listener.
     * @param eventType - The type of the event to listen for.
     * @param callback - The callback function to execute when the event is triggered.
     * @param options - Additional options for the event listener.
     * @returns A unique EventId representing the event listener.
     */
    add(element: Element, eventType: string, callback: EventListener, options?: EventOptions): EventId;
    /**
     * Removes an event listener
     */
    remove(eventId: EventId): boolean;
    /**
     * Adds event listener with automatic cleanup
     */
    addWithCleanup(element: Element, eventType: string, callback: EventListener, options?: EventOptions): () => void;
    /**
     * Gets all active listeners for an element
     */
    getListeners(element: Element): Array<{
        eventId: EventId;
        eventType: string;
        options: EventOptions;
        timestamp: number;
    }>;
    /**
     * Removes all listeners from an element
     */
    removeAll(element: Element): void;
    /**
     * Creates a one-time event listener that auto-removes
     */
    once(element: Element, eventType: string, callback: EventListener, options?: EventOptions): EventId;
}
declare const eventManager: EventListenerManager;
export default eventManager;
export type { EventId, EventOptions, ListenerMetadata, ListenerDetails, EventMetadata, };
//# sourceMappingURL=EventListenerManager.d.ts.map