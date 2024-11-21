/**
 * Type representing the different event types.
 */
export type PubSubEventType =
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
export class PubSub {
    private subscribers: Map<PubSubEventType, Set<Function>>;

    constructor() {
        this.subscribers = new Map<PubSubEventType, Set<Function>>();
    }

    /**
     * Subscribes a handler to a specific event type.
     * @param eventType The event type to subscribe to.
     * @param handler The handler function.
     */
    public subscribe<K extends PubSubEventType>(
        eventType: K,
        handler: () => void | Promise<void>,
    ): void {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Set<Function>());
        }
        this.subscribers.get(eventType)!.add(handler as Function);
    }

    /**
     * Unsubscribes a handler from a specific event type.
     * @param eventType The event type to unsubscribe from.
     * @param handler The handler function to remove.
     */
    public unsubscribe<K extends PubSubEventType>(
        eventType: K,
        handler: () => void | Promise<void> | PubSubHandlers[K],
    ): void {
        if (this.subscribers.has(eventType)) {
            this.subscribers.get(eventType)!.delete(handler as Function);
        }
    }

    /**
     * Publishes an event to all subscribed handlers.
     * Supports asynchronous handlers.
     * @param eventType The type of the event.
     * @param payload The data to pass to the handlers.
     */
    public async publish<K extends PubSubEventType>(
        eventType: K,
        ...payload: K extends 'click' | 'dblclick' | 'contextmenu'
            ? [MouseEvent]
            : [PointerEvent, Map<number, any>]
    ): Promise<void> {
        if (this.subscribers.has(eventType)) {
            const handlers = Array.from(this.subscribers.get(eventType)!);
            const promises = handlers.map((handler) => handler(...payload));
            await Promise.all(promises);
        }
    }

    /**
     * Removes all subscribers for cleanup.
     */
    public clear(): void {
        this.subscribers.clear();
    }
}
