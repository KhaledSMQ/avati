import { Acceleration2D } from './types';

/**
 * Calculates velocity based on position and time delta.
 * @param prevPos Previous position.
 * @param currentPos Current position.
 * @param deltaTime Time elapsed in seconds.
 * @returns Velocity vector.
 */
export function calculateVelocity(
    prevPos: { x: number; y: number },
    currentPos: { x: number; y: number },
    deltaTime: number,
): { vx: number; vy: number } {
    const vx = (currentPos.x - prevPos.x) / deltaTime;
    const vy = (currentPos.y - prevPos.y) / deltaTime;
    return { vx, vy };
}

/**
 * Calculates speed from velocity components.
 * @param vx Velocity in x-direction.
 * @param vy Velocity in y-direction.
 * @returns Speed.
 */
export function calculateSpeed(vx: number, vy: number): number {
    return Math.sqrt(vx * vx + vy * vy);
}

/**
 * Calculates acceleration based on current and previous velocities and time delta.
 * @param prevVelocity Previous velocity.
 * @param currentVelocity Current velocity.
 * @param deltaTime Time elapsed in seconds.
 * @returns Acceleration vector.
 */
export function calculateAcceleration(
    prevVelocity: { vx: number; vy: number },
    currentVelocity: { vx: number; vy: number },
    deltaTime: number,
): Acceleration2D {
    const ax = (currentVelocity.vx - prevVelocity.vx) / deltaTime;
    const ay = (currentVelocity.vy - prevVelocity.vy) / deltaTime;
    return { ax, ay };
}
