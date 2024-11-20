import { Signal } from './signal';
import type { SignalOptions } from './interfaces';
/**
 * Signal that derives its value from other signals
 *
 * @example
 * // Create base signals
 * const firstName = new Signal('John');
 * const lastName = new Signal('Doe');
 *
 * // Create a computed signal that depends on firstName and lastName
 * const fullName = new ComputedSignal(() => {
 *   return `${firstName.value} ${lastName.value}`;
 * });
 *
 * console.log(fullName.value); // Output: "John Doe"
 *
 * // When a dependency changes, the computed value updates automatically
 * firstName.value = 'Jane';
 * console.log(fullName.value); // Output: "Jane Doe"
 */
export declare class ComputedSignal<T> extends Signal<T> {
    /** Internal computation instance to manage dependencies and recomputation */
    private readonly computation;
    /** Function that computes the derived value */
    private computeFn;
    /**
     * Creates a new computed signal
     * @param compute Function that derives the signal value
     * @param options Configuration options for the signal
     */
    constructor(compute: () => T, options?: SignalOptions<T>);
    /**
     * Gets the current value of the computed signal
     */
    get value(): T;
    /**
     * Computed signals cannot be set directly
     */
    set value(_: T);
    /**
     * Gets the depth of this signal in the dependency graph
     */
    getDepth(): number;
    /**
     * Cleans up the signal and its dependencies
     */
    dispose(): void;
}
