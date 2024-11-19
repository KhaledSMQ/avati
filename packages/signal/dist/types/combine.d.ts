/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { SignalOptions } from './interfaces';
import { Signal } from './signal';
/**
 * Combines multiple signals into a single signal containing an array of their values.
 * When any of the input signals change, the combined signal updates with all current values.
 *
 * @template T - Tuple type representing the types of values from each input signal
 *
 * @param signals - An array of signals to combine. Each signal can have a different type,
 *                 represented by the corresponding type in the tuple T.
 * @param options - Optional configuration options for the resulting signal, including
 *                 custom equality comparison and naming.
 *
 * @returns A new signal containing an array of the current values from all input signals.
 *          The returned signal updates whenever any input signal changes.
 *
 * @example
 * // Combining signals of different types
 * const nameSignal = new Signal<string>('John');
 * const ageSignal = new Signal<number>(25);
 * const activeSignal = new Signal<boolean>(true);
 *
 * const combined = combine([nameSignal, ageSignal, activeSignal]);
 * console.log(combined.value); // ['John', 25, true]
 *
 * nameSignal.value = 'Jane';
 * console.log(combined.value); // ['Jane', 25, true]
 *
 * @example
 * // Using with custom equality function
 * const combined = combine([sig1, sig2], {
 *   equals: (prev, next) =>
 *     prev.length === next.length &&
 *     prev.every((val, idx) => Object.is(val, next[idx]))
 * });
 */
export declare function combine<T extends any[]>(signals: {
    [K in keyof T]: Signal<T[K]>;
}, options?: SignalOptions<T>): Signal<T>;
