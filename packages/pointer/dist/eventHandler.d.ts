/**
 * @fileoverview Advanced pointer event handling with performance optimizations and memory management
 * @version 2.0.0
 */
import { PointerState } from './types';
/**
 * Configuration options for EventHandler
 */
export interface EventHandlerConfig {
    /** Minimum time between updates in ms */
    updateThreshold?: number;
    /** Minimum movement distance to trigger update in pixels */
    movementThreshold?: number;
    /** Maximum number of cached calculations */
    memoizationLimit?: number;
}
/**
 * Class responsible for handling pointer events and managing pointer state.
 * Implements performance optimizations and memory management best practices.
 */
export declare class EventHandler {
    /** Current state of all tracked pointers */
    private readonly state;
    /** Configuration options */
    private readonly config;
    /** WeakMaps for better memory management of temporary data */
    private readonly lastMoveTime;
    private readonly lastPosition;
    private readonly lastVelocity;
    /** Memoized calculation functions */
    private readonly memoizedCalculateSpeed;
    private readonly memoizedCalculateAcceleration;
    /** Throttled update function */
    private readonly throttledUpdateState;
    /**
     * Creates a new EventHandler instance.
     * @param initialState - Initial pointer state
     * @param config - Configuration options
     */
    constructor(initialState: PointerState, config?: EventHandlerConfig);
    /**
     * Handles pointer down events.
     * @param event - The pointer event
     * @throws {Error} If the event is invalid
     */
    handlePointerDown: (event: PointerEvent) => void;
    /**
     * Handles pointer move events with optimizations.
     * @param event - The pointer event
     */
    handlePointerMove: (event: PointerEvent) => void;
    /**
     * Handles pointer up events.
     * @param event - The pointer event
     */
    handlePointerUp: (event: PointerEvent) => void;
    /**
     * Handles pointer enter events.
     * @param event - The pointer event
     */
    handlePointerEnter: (event: PointerEvent) => void;
    /**
     * Handles pointer leave events.
     * @param event - The pointer event
     */
    handlePointerLeave: (event: PointerEvent) => void;
    /**
     * Handles pointer cancel events.
     * @param event - The pointer event
     */
    handlePointerCancel: (event: PointerEvent) => void;
    /**
     * Retrieves the current state.
     * @returns A deep copy of the current pointer state
     */
    getState(): PointerState;
    /**
     * Resets the state to initial values.
     */
    resetState(): void;
    /**
     * Validates incoming pointer events.
     * @param event - The event to validate
     * @throws {Error} If the event is invalid
     */
    private validateEvent;
    /**
     * Checks if movement exceeds the threshold.
     * @param lastPos - Previous position
     * @param currentPos - Current position
     * @returns True if movement is significant
     */
    private hasSignificantMovement;
    /**
     * Processes pointer movement and updates state.
     * @param pointerId - The pointer ID
     * @param allPositions
     * @param lastPos - Previous position
     * @param currentPos - Current position
     * @param deltaTime - Time elapsed
     * @param currentTime - Current timestamp
     */
    private processPointerMovement;
    /**
     * Updates the state for a specific pointer.
     * @param pointerId - The pointer ID
     * @param position - Current position
     * @param allPositions - All position data
     * @param velocity - Current velocity
     * @param acceleration - Current acceleration
     * @param speed - Current speed
     */
    private updatePointerState;
    /**
     * Updates temporary data for calculations.
     * @param pointerId - The pointer ID
     * @param time - Current timestamp
     * @param position - Current position
     * @param velocity - Current velocity
     */
    private updateTemporaryData;
    /**
     * Initializes data for a new pointer.
     * @param pointerId - The pointer ID
     * @param x - Initial X coordinate
     * @param y - Initial Y coordinate
     */
    private initializePointerData;
    /**
     * Initializes a new pointer in the state.
     * @param {number} pointerId - The pointer ID
     * @param {number} x - Initial X coordinate
     * @param {number} y - Initial Y coordinate
     * @param {Position} allPositions - Initial position data
     */
    private initializeNewPointer;
    /**
     * Cleans up temporary data for a pointer.
     * @param pointerId - The pointer ID
     */
    private cleanupPointerData;
    /**
     * Performs complete cleanup of all temporary data.
     */
    private cleanup;
    /**
     * Handles errors in event processing.
     * @param methodName - Name of the method where error occurred
     * @param error - The error object
     */
    private handleError;
    private getPointerPosition;
}
//# sourceMappingURL=eventHandler.d.ts.map