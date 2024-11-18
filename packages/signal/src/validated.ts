/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { Signal } from './signal';
import { createSignal } from './createSignal';
import { SignalOptions } from './interfaces';
import { computed } from './computed';

/**
 * Creates a Signal with validation capabilities.
 *
 * @template T - Type of value stored in the signal
 * @param initialValue - Starting value of the signal
 * @param validator - Function that validates new values before they're set
 * @param options - Standard SignalOptions configuration
 * @returns A Signal with validation logic applied to value updates
 *
 * @example
 * // Create a signal that only accepts positive numbers
 * const positiveNum = validated(1,
 *   (value) => value > 0 || "Value must be positive"
 * );
 *
 * @example
 * // Create a signal with complex validation and custom equality
 * const user = validated(
 *   { id: 1, name: "John" },
 *   (value) => {
 *     if (!value.name) return "Name is required";
 *     if (value.id < 0) return "ID must be positive";
 *     return true;
 *   },
 *   { equals: (a, b) => a.id === b.id }
 * );
 */
export function validated<T>(
    initialValue: T,
    validator: (value: T) => boolean | string,
    options?: SignalOptions<T>,
): Signal<T> {
    const innerSignal = createSignal(initialValue, options);
    const validationError = computed(() => {
        const result = validator(innerSignal.value);
        if (typeof result === 'string') return result;
        if (!result) return 'Validation failed';
        return null;
    });

    return new Proxy(innerSignal, {
        get(target, prop) {
            if (prop === 'value') {
                const error = validationError.value;
                if (error) throw new Error(error);
                return target.value;
            }
            return target[prop as keyof typeof target];
        },
        set(target, prop, value) {
            if (prop === 'value') {
                const result = validator(value);
                if (typeof result === 'string') throw new Error(result);
                if (!result) throw new Error('Validation failed');
                target.value = value;
            }
            return true;
        },
    });
}
