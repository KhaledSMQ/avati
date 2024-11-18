/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
/**
 * Core imports for the Signal implementation
 */
import { SignalOptions, WritableSignal } from './interfaces';
import { Computation } from './computation';
import { EqualityFunction, TransformFunction, UnsubscribeFunction } from './types';
/**
 * Signal class implements a reactive primitive that holds a value and notifies dependents of changes.
 * It follows the WritableSignal interface contract for value updates and subscriptions.
 *
 * @template T The type of value held by the signal

 *
 * @example
 * // Basic usage with primitive values
 * const counter = new Signal(0);
 * console.log(counter.value); // 0
 * counter.value = 1;
 * console.log(counter.value); // 1
 *
 * @example
 * // Using update function
 * const counter = new Signal(0);
 * counter.update(current => current + 1); // Increments by 1
 *
 * @example
 * // Subscribing to changes
 * const name = new Signal('John');
 * const unsubscribe = name.subscribe(newValue => {
 *   console.log(`Name changed to: ${newValue}`);
 * });
 * name.value = 'Jane'; // Logs: "Name changed to: Jane"
 * unsubscribe(); // Removes the subscription
 *
 * @example
 * // Using custom equality function for objects
 * const user = new Signal(
 *   { id: 1, name: 'John' },
 *   {
 *     equals: (prev, next) => prev.id === next.id && prev.name === next.name
 *   }
 * );
 *
 * @example
 * // Proper cleanup
 * const signal = new Signal('test');
 * // ... use signal
 * signal.dispose(); // Clean up when done
 *
 * @example
 * // Using with arrays
 * const list = new Signal<number[]>([]);
 * list.update(current => [...current, 1]); // Adds element
 * list.update(current => current.filter(x => x > 0)); // Filters elements
 *
 * @example
 * // Error handling
 * try {
 *   const signal = new Signal('test');
 *   signal.dispose();
 *   signal.value; // Throws SignalDisposedError
 * } catch (error) {
 *   if (error instanceof SignalDisposedError) {
 *     console.log('Signal was disposed');
 *   }
 * }
 *
 * @example
 * // Using with complex objects and custom name
 * interface Todo {
 *   id: number;
 *   text: string;
 *   completed: boolean;
 * }
 *
 * const todos = new Signal<Todo[]>(
 *   [],
 *   {
 *     name: 'todosList',
 *     equals: (prev, next) =>
 *       prev.length === next.length &&
 *       prev.every((todo, index) =>
 *         todo.id === next[index].id &&
 *         todo.text === next[index].text &&
 *         todo.completed === next[index].completed
 *       )
 *   }
 * );
 *
 * @example
 * // Batching updates using SignalContext
 * const firstName = new Signal('John');
 * const lastName = new Signal('Doe');
 *
 */
export declare class Signal<T> implements WritableSignal<T> {
    /**
     * Function to compare previous and next values for equality.
     * Used to determine if dependents should be notified of changes.
     */
    equals: EqualityFunction<T>;
    /**
     * The current value stored in the signal
     */
    protected _value: T;
    /**
     * Set of computations that depend on this signal's value
     */
    protected dependents: Set<Computation>;
    /**
     * Flag indicating whether this signal has been disposed
     */
    protected disposed: boolean;
    /**
     * Optional name for debugging and identification purposes
     */
    name?: string;
    /**
     * Creates a new Signal instance
     *
     * @param initialValue - The initial value of the signal
     * @param options - Configuration options for the signal
     */
    constructor(initialValue: T, options?: SignalOptions<T>);
    /**
     * Gets the current value of the signal.
     * Tracks dependencies and throws if the signal is disposed.
     */
    get value(): T;
    /**
     * Sets a new value for the signal.
     * Only updates and notifies dependents if the new value is different from the current value.
     *
     * @param newValue - The new value to set
     */
    set value(newValue: T);
    /**
     * Gets the current value of the signal without tracking dependencies.
     */
    get_value_bypass_tracking(): T;
    /**
     * Updates the signal's value using a transformation function
     *
     * @param fn - Function that takes the current value and returns a new value
     */
    update(fn: TransformFunction<T>): void;
    /**
     * Creates a subscription to the signal's value changes
     *
     * @param callback - Function to call when the value changes
     * @returns Function to unsubscribe from changes
     */
    subscribe(callback: (value: T) => void): UnsubscribeFunction;
    /**
     * Tracks the current computation as dependent on this signal
     */
    protected trackDependency(): void;
    /**
     * Adds a computation as dependent on this signal
     *
     * @param computation - The computation to add as a dependent
     */
    addDependent(computation: Computation): void;
    /**
     * Removes a computation from this signal's dependents
     *
     * @param computation - The computation to remove
     */
    removeDependent(computation: Computation): void;
    /**
     * Notifies all dependent computations of a value change
     * Handles batching through SignalContext if active
     */
    notifyDependents(): void;
    /**
     * Disposes of the signal and its dependent computations
     * Prevents memory leaks by cleaning up all references
     */
    dispose(): void;
    /**
     * Returns whether the signal has been disposed
     */
    isDisposed(): boolean;
    /**
     * Returns the name of the signal for debugging purposes
     */
    getDependents(): Set<Computation>;
    /**
     * Returns the name of the signal for debugging purposes
     */
    hasDependents(): boolean;
    toString(): string;
}
//# sourceMappingURL=signal.d.ts.map