/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Computation } from './computation';
import { SignalOptions } from './interfaces';
import { SignalContext } from './signalContext';
import { Signal } from './signal';
import { CircularDependencyError, SignalDisposedError } from './errors';

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
export class ComputedSignal<T> extends Signal<T> {

    /** Internal computation instance to manage dependencies and recomputation */
    private readonly computation: Computation;

    /** Function that computes the derived value */
    private computeFn: () => T;

    /**
     * Creates a new computed signal
     * @param compute Function that derives the signal value
     * @param options Configuration options for the signal
     */
    constructor(compute: () => T, options: SignalOptions<T> = {}) {
        super(undefined as T, options);
        this.computeFn = compute;

        // Create an anonymous computation class instance
        this.computation = new class extends Computation {
            constructor(private signal: ComputedSignal<T>) {
                super(signal.name);
            }

            /**
             * Recomputes the signal value when dependencies change
             */
            recompute(): void {
                if (this.disposed) return;

                const context = SignalContext.getInstance();
                const prevComputation = context.getCurrentComputation();
                context.setCurrentComputation(this);

                // Prevent circular dependencies through effects
                if (context.isInEffect()) {
                    throw new CircularDependencyError(
                        `Cannot create computed signal that depends on effects`,
                    );
                }

                try {
                    // Check if any dependencies have been disposed
                    for (const dep of this.dependencies) {
                        if (dep.isDisposed()) {
                            this.signal.dispose();
                            throw new SignalDisposedError('read from disposed dependency');
                        }
                    }

                    // Compute new value and update if changed
                    const newValue = this.signal.computeFn();
                    if (!this.signal.equals(this.signal._value, newValue)) {
                        this.signal._value = newValue;
                        this.signal.notifyDependents();
                    }
                } catch (error) {
                    // Handle disposal errors
                    if (error instanceof SignalDisposedError) {
                        this.signal.dispose();
                    }
                    throw error;
                } finally {
                    // Restore previous computation context
                    if (prevComputation) {
                        context.setCurrentComputation(prevComputation);
                    }
                    this.dirty = false;
                }
            }
        }(this);
        // Initial computation
        this.computation.recompute();

    }

    /**
     * Gets the current value of the computed signal
     */
    override get value(): T {
        if (this.disposed) {
            throw new SignalDisposedError('read from');
        }

        // Verify dependencies are still valid
        const dependencies = this.computation['dependencies'] as Set<Signal<any>>;
        for (const dep of dependencies) {
            if (dep.isDisposed()) {
                this.dispose();
                throw new SignalDisposedError('read from disposed dependency');
            }
        }

        // Recompute if dependencies have changed
        if (this.computation.isDirty()) {
            this.computation.recompute();
        }

        // Track this signal as a dependency for other computations
        this.trackDependency();
        return this._value;
    }

    /**
     * Computed signals cannot be set directly
     */
    override set value(_: T) {
        throw new Error('Cannot set the value of a computed signal');
    }

    /**
     * Gets the depth of this signal in the dependency graph
     */
    getDepth(): number {
        return this.computation.getDepth();
    }

    /**
     * Cleans up the signal and its dependencies
     */
    override dispose(): void {
        if (this.disposed) return;

        super.dispose();
        this.computation.dispose();

        // Recursively dispose dependent computed signals
        for (const dependent of this.dependents) {
            // @ts-ignore
            if (dependent instanceof ComputedSignal || dependent['signal'] instanceof ComputedSignal) {
                // @ts-ignore
                const signal = dependent instanceof ComputedSignal ? dependent : dependent['signal'];
                signal.dispose();
            }
        }
    }
}
