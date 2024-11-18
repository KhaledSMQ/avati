/**
 * Type representing the different event types.
 */
export type PubSubEventType = 'pointerdown' | 'pointerup' | 'pointermove' | 'pointerenter' | 'pointerleave' | 'pointercancel' | 'click' | 'dblclick' | 'contextmenu';
/**
 * Type representing the handler functions for each event type.
 */
export interface PubSubHandlers {
    pointerdown?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
    pointerup?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
    pointermove?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
    pointerenter?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
    pointerleave?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
    pointercancel?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
    click?: (event: MouseEvent) => void | Promise<void>;
    dblclick?: (event: MouseEvent) => void | Promise<void>;
    contextmenu?: (event: MouseEvent) => void | Promise<void>;
}
/**
 * PubSub class implementing the publish-subscribe pattern.
 */
export declare class PubSub {
    private subscribers;
    constructor();
    /**
     * Subscribes a handler to a specific event type.
     * @param eventType The event type to subscribe to.
     * @param handler The handler function.
     */
    subscribe<K extends PubSubEventType>(eventType: K, handler: () => void | Promise<void>): void;
    /**
     * Unsubscribes a handler from a specific event type.
     * @param eventType The event type to unsubscribe from.
     * @param handler The handler function to remove.
     */
    unsubscribe<K extends PubSubEventType>(eventType: K, handler: () => void | Promise<void> | PubSubHandlers[K]): void;
    /**
     * Publishes an event to all subscribed handlers.
     * Supports asynchronous handlers.
     * @param eventType The type of the event.
     * @param payload The data to pass to the handlers.
     */
    publish<K extends PubSubEventType>(eventType: K, ...payload: K extends 'click' | 'dblclick' | 'contextmenu' ? [MouseEvent] : [PointerEvent, Map<number, any>]): Promise<void>;
    /**
     * Removes all subscribers for cleanup.
     */
    clear(): void;
}
//# sourceMappingURL=pubsub.d.ts.map