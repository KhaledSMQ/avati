import { Options, Rk4thSpring } from 'rk-4th-spring';

export interface BoundedOptions extends Options {
    minValue?: number;
    maxValue?: number;
    restitutionCoefficient?: number;
}

export class BoundedAnimation extends Rk4thSpring {
    // Boundary constraints
    minValue: number;
    maxValue: number;
    restitutionCoefficient: number;

    constructor(options: BoundedOptions = {}) {
        super(options);

        // Boundary constraints
        this.minValue = options.minValue !== undefined ? options.minValue : -Infinity;
        this.maxValue = options.maxValue !== undefined ? options.maxValue : Infinity;
        this.restitutionCoefficient =
            options.restitutionCoefficient !== undefined ? options.restitutionCoefficient : 0.2;
    }

    /**
     * Overrides the update method to add boundary constraints and elastic collisions.
     * @param deltaTime - The time elapsed since the last update.
     * @returns Whether the animation should stop.
     */
    update(deltaTime: number): boolean {
        const shouldStop = super.update(deltaTime);

        // Apply position clamping and elastic collision
        if (this.value < this.minValue) {
            this.value = this.minValue;
            this.velocity = -this.velocity * this.restitutionCoefficient;
        } else if (this.value > this.maxValue) {
            this.value = this.maxValue;
            this.velocity = -this.velocity * this.restitutionCoefficient;
        }

        return shouldStop;
    }

    /**
     * Sets the boundary constraints for the animation.
     * @param min - The minimum value.
     * @param max - The maximum value.
     */
    setBounds(min: number, max: number): void {
        this.minValue = min;
        this.maxValue = max;
    }
}
