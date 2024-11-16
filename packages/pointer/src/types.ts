/**
 * @fileoverview Type definitions for EventHandler
 */

export interface Position {
    screen: Position2D;
    client: Position2D;
    page: Position2D;
    offset: Position2D;
}

/**
 * Represents a 2D position with x and y coordinates
 */
export interface Position2D {
    x: number;
    y: number;
}

/**
 * Represents a 2D vector with x and y components
 */
export interface Vector2D {
    vx: number;
    vy: number;
}

/**
 * Represents acceleration in 2D space
 */
export interface Acceleration2D {
    ax: number;
    ay: number;
}

/**
 * Represents the state of a single pointer
 */
export interface SinglePointerState {
    /** Whether the pointer is currently pressed down */
    readonly isDown: boolean;
    /** Whether the pointer is currently inside the tracked element */
    readonly isInside: boolean;
    /** Current position of the pointer, ClientX, ClientY */
    readonly position: Position2D;
    /** Current position of the pointer, ScreenX, ScreenY */
    readonly allPositions: Position;
    /** Current velocity of the pointer */
    readonly velocity: Vector2D;
    /** Current acceleration of the pointer */
    readonly acceleration: Acceleration2D;
    /** Current speed (magnitude of velocity) */
    readonly speed: number;
}

/**
 * Represents the overall state of all pointers
 */
export interface PointerState {
    /** Map of pointer IDs to their respective states */
    readonly pointers: Map<number, SinglePointerState>;
}

/**
 * Represents possible error types in pointer event handling
 */
export enum PointerEventError {
    INVALID_EVENT = 'INVALID_EVENT',
    INVALID_STATE = 'INVALID_STATE',
    CALCULATION_ERROR = 'CALCULATION_ERROR',
}

/**
 * Custom error class for pointer event handling
 */
export class PointerEventHandlerError extends Error {
    constructor(
        public readonly type: PointerEventError,
        public readonly details: string,
        public readonly originalError?: Error
    ) {
        super(`${type}: ${details}`);
        this.name = 'PointerEventHandlerError';
    }
}
