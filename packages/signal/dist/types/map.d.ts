/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { SignalOptions } from './interfaces';
import { Signal } from './signal';
/**
 * Creates a new Signal that transforms the value of a source Signal using a mapping function.
 * The resulting Signal updates automatically when the source Signal changes.
 *
 * @param source The input Signal to transform
 * @param transform Function that converts source value type T to output type U
 * @param options Optional configuration for the resulting Signal
 * @returns A new Signal containing the transformed value
 *
 *
 * @example
 * // Basic transformation of primitive values
 * const count = new Signal(5);
 * const doubled = map(count, n => n * 2);
 * console.log(doubled.value); // 10
 * count.value = 10;
 * console.log(doubled.value); // 20
 *
 * @example
 * // Transforming arrays
 * const numbers = new Signal([1, 2, 3]);
 * const doubled = map(numbers, nums => nums.map(n => n * 2));
 * console.log(doubled.value); // [2, 4, 6]
 *
 * @example
 * // Transforming objects with custom options
 * const user = new Signal({ name: 'John', age: 30 });
 * const userSummary = map(
 *   user,
 *   u => `${u.name} is ${u.age} years old`,
 *   { name: 'userSummary' }
 * );
 * console.log(userSummary.value); // "John is 30 years old"
 */
export declare function map<T, U>(source: Signal<T>, transform: (value: T) => U, options?: SignalOptions<U>): Signal<U>;
