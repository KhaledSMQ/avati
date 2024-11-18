/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { SignalOptions } from './interfaces';
import { Signal } from './signal';
/**
 * Creates a Signal that only updates when the source value changes by at least the specified delta.
 * Useful for filtering out small fluctuations in numeric values.
 *
 * @param source - Input Signal containing numeric values
 * @param delta - Minimum change required to trigger an update
 * @param options - Optional Signal configuration
 * @returns A new Signal that updates only on significant changes
 *
 * @example
 * const rawTemp = new Signal(20.0);
 * const filteredTemp = threshold(rawTemp, 0.5);
 * rawTemp.value = 20.2; // filteredTemp stays at 20.0
 * rawTemp.value = 20.6; // filteredTemp updates to 20.6
 */
export declare function threshold<T extends number>(source: Signal<T>, delta: number, options?: SignalOptions<T>): Signal<T>;
//# sourceMappingURL=threshold.d.ts.map