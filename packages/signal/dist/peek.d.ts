/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Signal } from './signal';
/**
 * Retrieves the current value of a signal without establishing a dependency relationship.
 * This is useful when you want to read a signal's value without having the current computation
 * track it as a dependency, effectively "peeking" at the value without subscribing to changes.
 *
 * @template T The type of value held by the signal
 * @param signal The signal whose value you want to peek at
 * @returns The current value of the signal
 *
 * @description
 * The function works by temporarily manipulating the computation stack:
 * 1. Stores the current computation (if any) from the context
 * 2. Pushes undefined as a temporary computation to prevent dependency tracking
 * 3. Reads the signal's value
 * 4. Restores the previous computation state
 *
 * This approach ensures that when we read the signal's value, it won't be tracked
 * as a dependency in any active computation scope.
 *
 * @example
 * const counter = new Signal(0);
 * // Reading value normally would create a dependency
 * const normalRead = counter.value;
 * // Peeking at value doesn't create a dependency
 * const peekedValue = peek(counter);
 *
 * @example
 * // Useful in computed signals when you need a value for calculation
 * // but don't want to track changes to that specific signal
 * const total = computed(() => {
 *   const current = counter.value;  // Creates dependency
 *   const threshold = peek(maxValue);  // Reads value without dependency
 *   return current > threshold ? current : threshold;
 * });
 */
export declare function peek<T>(signal: Signal<T>): T;
//# sourceMappingURL=peek.d.ts.map