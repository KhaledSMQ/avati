/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { createSignal, effect, Signal, SignalOptions } from '../core';

/**
 * Creates a filtered signal that only updates when the predicate returns true.
 * The output signal follows the source signal's values but only changes when
 * the new value satisfies the given predicate.
 *
 * @param source The input signal to filter
 * @param predicate Function that determines if a value should pass through
 * @param options Optional configuration for the output signal
 * @returns A new signal that only updates when predicate returns true
 *
 * @example
 * const numbers = new Signal(0);
 * const evenNumbers = filtered(numbers, n => n % 2 === 0);
 * numbers.value = 1; // evenNumbers remains 0
 * numbers.value = 2; // evenNumbers updates to 2
 */
export function filtered<T>(
    source: Signal<T>,
    predicate: (value: T) => boolean,
    options?: SignalOptions<T>,
): Signal<T> {
    const output = createSignal(source.value, options);

    effect(() => {
        const value = source.value;
        if (predicate(value)) {
            output.value = value;
        }
    });

    return output;
}
