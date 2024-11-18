import { PubSubEventType, PubSubHandlers } from './pubsub';
import { PointerState } from './types';
/**
 * Supported pointer and mouse event types.
 */
export type PointerEventType = 'pointerdown' | 'pointerup' | 'pointermove' | 'pointerenter' | 'pointerleave' | 'pointercancel' | 'click' | 'dblclick' | 'contextmenu';
/**
 * Configuration options for the AdvancedPointerEventManager.
 */
export interface PointerEventManagerConfig {
    moveEventTarget?: 'element' | 'window' | 'document';
}
/**
 * AdvancedPointerEventManager manages pointer and mouse events with advanced features.
 */
export declare class AdvancedPointerEventManager {
    private element;
    private eventHandler;
    private config;
    private pubSub;
    private rafId;
    private isUpdating;
    private activeListeners;
    private readonly listenerOptions;
    private events;
    constructor(element: HTMLElement, config?: PointerEventManagerConfig);
    /**
     * Determines the target for pointermove events based on configuration.
     * @param target The target specified in the configuration.
     * @returns The EventTarget to listen to.
     */
    private getMoveEventTarget;
    /**
     * Initializes event listeners.
     */
    private init;
    /**
     * Registers an event handler with optional debouncing.
     * Handlers can be asynchronous functions.
     * @param eventType The type of event to listen for.
     * @param handler The callback function.
     */
    on<K extends PubSubEventType>(eventType: K, handler: PubSubHandlers[K]): void;
    /**
     * Removes an event handler.
     * @param eventType The type of event.
     * @param handler The handler function to remove.
     */
    off<K extends PubSubEventType>(eventType: K, handler: PubSubHandlers[K]): void;
    /**
     * Destroys the manager by removing all event listeners and handlers.
     */
    destroy(): void;
    /**
     * Retrieves the current pointer state.
     * @returns PointerState
     */
    getState(): PointerState;
    /**
     * Internal handler for pointer down events.
     * @param event PointerEvent
     */
    private handlePointerDown;
    /**
     * Internal handler for pointer up events.
     * @param event PointerEvent
     */
    private handlePointerUp;
    /**
     * Internal handler for pointer move events.
     * @param event PointerEvent
     */
    private handlePointerMove;
    /**
     * Internal handler for pointer enter events.
     * @param event PointerEvent
     */
    private handlePointerEnter;
    /**
     * Internal handler for pointer leave events.
     * @param event PointerEvent
     */
    private handlePointerLeave;
    /**
     * Internal handler for pointer cancel events.
     * @param event PointerEvent
     */
    private handlePointerCancel;
    /**
     * Internal handler for click events.
     * @param event MouseEvent
     */
    private handleClick;
    /**
     * Internal handler for double-click events.
     * @param event MouseEvent
     */
    private handleDblClick;
    /**
     * Internal handler for context menu events.
     * @param event MouseEvent
     */
    private handleContextMenu;
    /**
     * Triggers the animation frame loop for continuous updates if not already running.
     */
    private startUpdating;
    /**
     * Stops the animation frame loop if no pointers are active.
     */
    private stopUpdatingIfNecessary;
    /**
     * The animation frame loop that can be used for continuous updates.
     */
    private updateLoop;
    /**
     * Converts PointerState to a Map<number, any> for pub-sub.
     * @returns Map of pointer states.
     */
    private convertStateToMap;
}
//# sourceMappingURL=PointerEventManager.d.ts.map