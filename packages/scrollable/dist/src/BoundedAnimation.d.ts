import { Options, Rk4thSpring } from 'rk-4th-spring';
export interface BoundedOptions extends Options {
    minValue?: number;
    maxValue?: number;
    restitutionCoefficient?: number;
}
export declare class BoundedAnimation extends Rk4thSpring {
    minValue: number;
    maxValue: number;
    restitutionCoefficient: number;
    constructor(options?: BoundedOptions);
    /**
     * Overrides the update method to add boundary constraints and elastic collisions.
     * @param deltaTime - The time elapsed since the last update.
     * @returns Whether the animation should stop.
     */
    update(deltaTime: number): boolean;
    /**
     * Sets the boundary constraints for the animation.
     * @param min - The minimum value.
     * @param max - The maximum value.
     */
    setBounds(min: number, max: number): void;
}
//# sourceMappingURL=BoundedAnimation.d.ts.map