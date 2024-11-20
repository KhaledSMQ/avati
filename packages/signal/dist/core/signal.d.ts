/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
/**
 * Core imports for the Signal implementation
 */
import { SignalOptions } from './interfaces';
import { UnsubscribeFunction } from './types';
import { Base } from './base';
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
export declare class Signal<T> extends Base<T> {
    constructor(initialValue?: T, options?: SignalOptions<T>);
    /**
     * Creates a subscription to the signal's value changes
     *
     * @param callback - Function to call when the value changes
     * @returns Function to unsubscribe from changes
     */
    subscribe(callback: (value: T) => void): UnsubscribeFunction;
}
