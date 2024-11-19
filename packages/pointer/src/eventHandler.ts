/**
 * @fileoverview Advanced pointer event handling with performance optimizations and memory management
 * @version 2.0.0
 */

import { Acceleration2D, PointerState, Position, Position2D, SinglePointerState, Vector2D } from './types';
import { calculateAcceleration, calculateSpeed, calculateVelocity } from './utils';
import { throttle } from '@avatijs/throttle';
import { memoize } from '@avatijs/memoize';

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
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<EventHandlerConfig> = {
    updateThreshold: 16.67, // ~60fps
    movementThreshold: 1, // 1 pixel
    memoizationLimit: 1000,
};

/**
 * Class responsible for handling pointer events and managing pointer state.
 * Implements performance optimizations and memory management best practices.
 */
export class EventHandler {
    /** Current state of all tracked pointers */
    private readonly state: PointerState;

    /** Configuration options */
    private readonly config: Required<EventHandlerConfig>;

    /** WeakMaps for better memory management of temporary data */
    private readonly lastMoveTime: Map<number, number>;
    private readonly lastPosition: Map<number, Position2D>;
    private readonly lastVelocity: Map<number, Vector2D>;

    /** Memoized calculation functions */
    private readonly memoizedCalculateSpeed: typeof calculateSpeed;
    private readonly memoizedCalculateAcceleration: typeof calculateAcceleration;

    /** Throttled update function */
    private readonly throttledUpdateState: (
        pointerId: number,
        position: Position2D,
        allPositions: Position,
        velocity: Vector2D,
        acceleration: Acceleration2D,
        speed: number,
    ) => void;

    /**
     * Creates a new EventHandler instance.
     * @param initialState - Initial pointer state
     * @param config - Configuration options
     */
    constructor(initialState: PointerState, config: EventHandlerConfig = {}) {
        this.state = initialState;
        this.config = { ...DEFAULT_CONFIG, ...config };

        // Initialize WeakMaps for temporary data storage
        this.lastMoveTime = new Map<number, number>();
        this.lastPosition = new Map<number, Position2D>();
        this.lastVelocity = new Map<number, Vector2D>();

        // Initialize memoized calculation functions with options
        this.memoizedCalculateSpeed = memoize(calculateSpeed, {
            maxCacheSize: this.config.memoizationLimit,
            ttl: this.config.updateThreshold * 10, // Cache for 10 update cycles
        });

        this.memoizedCalculateAcceleration = memoize(calculateAcceleration, {
            maxCacheSize: this.config.memoizationLimit,
            ttl: this.config.updateThreshold * 10,
        });

        // Initialize throttled state update
        this.throttledUpdateState = throttle(
            this.updatePointerState.bind(this),
            this.config.updateThreshold,
            {
                trailing: true,
                leading: true,
            },
        );
    }

    /**
     * Handles pointer down events.
     * @param event - The pointer event
     * @throws {Error} If the event is invalid
     */
    public handlePointerDown = (event: PointerEvent): void => {
        try {
            this.validateEvent(event);
            const { pointerId, clientX, clientY } = event;
            this.state.pointers.set(pointerId, {
                isDown: true,
                isInside: true,
                position: { x: clientX, y: clientY },
                allPositions: this.getPointerPosition(event),
                velocity: { vx: 0, vy: 0 },
                acceleration: { ax: 0, ay: 0 },
                speed: 0,
            });
            this.lastMoveTime.set(pointerId, performance.now());
            this.lastPosition.set(pointerId, { x: clientX, y: clientY });
            this.lastVelocity.set(pointerId, { vx: 0, vy: 0 });
        } catch (error) {
            this.handleError('handlePointerDown', error);
        }
    };

    /**
     * Handles pointer move events with optimizations.
     * @param event - The pointer event
     */
    public handlePointerMove = (event: PointerEvent): void => {
        try {
            this.validateEvent(event);
            const { pointerId, clientX, clientY } = event;
            const allPositions = this.getPointerPosition(event);

            if (!this.state.pointers.has(pointerId)) {
                this.state.pointers.set(pointerId, {
                    isDown: false,
                    isInside: true,
                    position: { x: clientX, y: clientY },
                    allPositions: this.getPointerPosition(event),
                    velocity: { vx: 0, vy: 0 },
                    acceleration: { ax: 0, ay: 0 },
                    speed: 0,
                });
                this.lastMoveTime.set(pointerId, performance.now());
                this.lastPosition.set(pointerId, { x: clientX, y: clientY });
                this.lastVelocity.set(pointerId, { vx: 0, vy: 0 });
                return;
            }

            const currentTime = performance.now();
            const lastTime = this.lastMoveTime.get(pointerId) || currentTime;
            const deltaTime = (currentTime - lastTime) / 1000;

            if (deltaTime > this.config.updateThreshold / 1000) {
                const lastPos = this.lastPosition.get(pointerId) || { x: clientX, y: clientY };
                const currentPos = { x: clientX, y: clientY };

                if (this.hasSignificantMovement(lastPos, currentPos)) {
                    this.processPointerMovement(
                        pointerId,
                        allPositions,
                        lastPos,
                        currentPos,
                        deltaTime,
                        currentTime,
                    );
                }
            }
        } catch (error) {
            this.handleError('handlePointerMove', error);
        }
    };

    /**
     * Handles pointer up events.
     * @param event - The pointer event
     */
    public handlePointerUp = (event: PointerEvent): void => {
        try {
            this.validateEvent(event);
            const { pointerId, clientX, clientY } = event;

            if (this.state.pointers.has(pointerId)) {
                const pointer = this.state.pointers.get(pointerId)!;
                this.state.pointers.set(pointerId, {
                    ...pointer,
                    isDown: false,
                    position: { x: clientX, y: clientY },
                });
                this.cleanupPointerData(pointerId);
            }
        } catch (error) {
            this.handleError('handlePointerUp', error);
        }
    };

    /**
     * Handles pointer enter events.
     * @param event - The pointer event
     */
    public handlePointerEnter = (event: PointerEvent): void => {
        try {
            this.validateEvent(event);
            const { pointerId, clientX, clientY } = event;
            const allPositions = this.getPointerPosition(event);

            if (this.state.pointers.has(pointerId)) {
                const pointer = this.state.pointers.get(pointerId)!;
                this.state.pointers.set(pointerId, {
                    ...pointer,
                    isInside: true,
                });
            } else {
                this.initializeNewPointer(pointerId, clientX, clientY, allPositions);
            }
        } catch (error) {
            this.handleError('handlePointerEnter', error);
        }
    };

    /**
     * Handles pointer leave events.
     * @param event - The pointer event
     */
    public handlePointerLeave = (event: PointerEvent): void => {
        try {
            this.validateEvent(event);
            const { pointerId } = event;

            if (this.state.pointers.has(pointerId)) {
                const pointer = this.state.pointers.get(pointerId)!;
                this.state.pointers.set(pointerId, {
                    ...pointer,
                    isInside: false,
                    velocity: { vx: 0, vy: 0 },
                    acceleration: { ax: 0, ay: 0 },
                    speed: 0,
                });
            }
        } catch (error) {
            this.handleError('handlePointerLeave', error);
        }
    };

    /**
     * Handles pointer cancel events.
     * @param event - The pointer event
     */
    public handlePointerCancel = (event: PointerEvent): void => {
        try {
            this.validateEvent(event);
            const { pointerId } = event;

            if (this.state.pointers.has(pointerId)) {
                const pointer = this.state.pointers.get(pointerId)!;
                this.state.pointers.set(pointerId, {
                    ...pointer,
                    isDown: false,
                });
                this.cleanupPointerData(pointerId);
            }
        } catch (error) {
            this.handleError('handlePointerCancel', error);
        }
    };

    /**
     * Retrieves the current state.
     * @returns A deep copy of the current pointer state
     */
    public getState(): PointerState {
        const copy: PointerState = { pointers: new Map() };
        this.state.pointers.forEach((value, key) => {
            copy.pointers.set(key, { ...value });
        });
        return copy;
    }

    /**
     * Resets the state to initial values.
     */
    public resetState(): void {
        this.state.pointers.clear();
        this.cleanup();
    }

    /**
     * Validates incoming pointer events.
     * @param event - The event to validate
     * @throws {Error} If the event is invalid
     */
    private validateEvent(event: PointerEvent): void {
        if (!event || !('pointerId' in event)) {
            throw new Error('Invalid pointer event');
        }
    }

    /**
     * Checks if movement exceeds the threshold.
     * @param lastPos - Previous position
     * @param currentPos - Current position
     * @returns True if movement is significant
     */
    private hasSignificantMovement(lastPos: Position2D, currentPos: Position2D): boolean {
        const deltaX = Math.abs(currentPos.x - lastPos.x);
        const deltaY = Math.abs(currentPos.y - lastPos.y);
        return deltaX > this.config.movementThreshold || deltaY > this.config.movementThreshold;
    }

    /**
     * Processes pointer movement and updates state.
     * @param pointerId - The pointer ID
     * @param allPositions
     * @param lastPos - Previous position
     * @param currentPos - Current position
     * @param deltaTime - Time elapsed
     * @param currentTime - Current timestamp
     */
    private processPointerMovement(
        pointerId: number,
        allPositions: Position,
        lastPos: Position2D,
        currentPos: Position2D,
        deltaTime: number,
        currentTime: number,
    ): void {
        const velocity = calculateVelocity(lastPos, currentPos, deltaTime);
        const speed = this.memoizedCalculateSpeed(velocity.vx, velocity.vy);
        const prevVelocity = this.lastVelocity.get(pointerId) || { vx: 0, vy: 0 };
        const acceleration = this.memoizedCalculateAcceleration(prevVelocity, velocity, deltaTime);
        this.throttledUpdateState(
            pointerId,
            currentPos,
            allPositions,
            velocity,
            acceleration,
            speed,
        );

        this.updateTemporaryData(pointerId, currentTime, currentPos, velocity);
    }

    /**
     * Updates the state for a specific pointer.
     * @param pointerId - The pointer ID
     * @param position - Current position
     * @param allPositions - All position data
     * @param velocity - Current velocity
     * @param acceleration - Current acceleration
     * @param speed - Current speed
     */
    private updatePointerState(
        pointerId: number,
        position: Position2D,
        allPositions: Position,
        velocity: Vector2D,
        acceleration: Acceleration2D,
        speed: number,
    ): void {
        const pointer = this.state.pointers.get(pointerId);
        if (pointer) {
            Object.assign(pointer, {
                position: { ...position },
                velocity: { ...velocity },
                acceleration: { ...acceleration },
                allPositions: { ...allPositions },
                speed,
            });
        }
    }

    /**
     * Updates temporary data for calculations.
     * @param pointerId - The pointer ID
     * @param time - Current timestamp
     * @param position - Current position
     * @param velocity - Current velocity
     */
    private updateTemporaryData(
        pointerId: number,
        time: number,
        position: Position2D,
        velocity: Vector2D,
    ): void {
        this.lastMoveTime.set(pointerId, time);
        this.lastPosition.set(pointerId, { ...position });
        this.lastVelocity.set(pointerId, { ...velocity });
    }

    /**
     * Initializes data for a new pointer.
     * @param pointerId - The pointer ID
     * @param x - Initial X coordinate
     * @param y - Initial Y coordinate
     */
    private initializePointerData(pointerId: number, x: number, y: number): void {
        this.lastMoveTime.set(pointerId, performance.now());
        this.lastPosition.set(pointerId, { x, y });
        this.lastVelocity.set(pointerId, { vx: 0, vy: 0 });
    }

    /**
     * Initializes a new pointer in the state.
     * @param {number} pointerId - The pointer ID
     * @param {number} x - Initial X coordinate
     * @param {number} y - Initial Y coordinate
     * @param {Position} allPositions - Initial position data
     */
    private initializeNewPointer(
        pointerId: number,
        x: number,
        y: number,
        allPositions: Position,
    ): void {
        const initialState: SinglePointerState = {
            isDown: false,
            isInside: true,
            position: { x, y },
            allPositions: allPositions,
            velocity: { vx: 0, vy: 0 },
            acceleration: { ax: 0, ay: 0 },
            speed: 0,
        };
        this.state.pointers.set(pointerId, initialState);
        this.initializePointerData(pointerId, x, y);
    }

    /**
     * Cleans up temporary data for a pointer.
     * @param pointerId - The pointer ID
     */
    private cleanupPointerData(pointerId: number): void {
        this.lastMoveTime.delete(pointerId);
        this.lastPosition.delete(pointerId);
        this.lastVelocity.delete(pointerId);
    }

    /**
     * Performs complete cleanup of all temporary data.
     */
    private cleanup(): void {
        // TODO
    }

    /**
     * Handles errors in event processing.
     * @param methodName - Name of the method where error occurred
     * @param error - The error object
     */
    private handleError(methodName: string, error: unknown): void {
        console.error(`Error in EventHandler.${methodName}:`, error);
        // Additional error handling logic could be added here
    }

    private getPointerPosition(event: PointerEvent): Position {
        return {
            page: {
                x: event.pageX,
                y: event.pageY,
            },
            client: {
                x: event.clientX,
                y: event.clientY,
            },
            screen: {
                x: event.screenX,
                y: event.screenY,
            },
            offset: {
                x: event.offsetX,
                y: event.offsetY,
            },
        };
    }
}
