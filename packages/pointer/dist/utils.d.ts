import { Acceleration2D } from './types';
/**
 * Calculates velocity based on position and time delta.
 * @param prevPos Previous position.
 * @param currentPos Current position.
 * @param deltaTime Time elapsed in seconds.
 * @returns Velocity vector.
 */
export declare function calculateVelocity(prevPos: {
    x: number;
    y: number;
}, currentPos: {
    x: number;
    y: number;
}, deltaTime: number): {
    vx: number;
    vy: number;
};
/**
 * Calculates speed from velocity components.
 * @param vx Velocity in x-direction.
 * @param vy Velocity in y-direction.
 * @returns Speed.
 */
export declare function calculateSpeed(vx: number, vy: number): number;
/**
 * Calculates acceleration based on current and previous velocities and time delta.
 * @param prevVelocity Previous velocity.
 * @param currentVelocity Current velocity.
 * @param deltaTime Time elapsed in seconds.
 * @returns Acceleration vector.
 */
export declare function calculateAcceleration(prevVelocity: {
    vx: number;
    vy: number;
}, currentVelocity: {
    vx: number;
    vy: number;
}, deltaTime: number): Acceleration2D;
//# sourceMappingURL=utils.d.ts.map