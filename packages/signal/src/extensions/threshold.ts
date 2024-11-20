/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { computed, Signal, SignalOptions } from '../core';
import { peek } from './peek';

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
export function threshold<T extends number>(
    source: Signal<T>,
    delta: number,
    options?: SignalOptions<T>,
): Signal<T> {
    return computed(() => {
        const value = source.value;
        const prevValue = peek(source);
        return Math.abs(value - prevValue) >= delta ? value : prevValue;
    }, {
        ...options,
        equals: (a, b) => Math.abs(a - b) < delta,
    });
}
