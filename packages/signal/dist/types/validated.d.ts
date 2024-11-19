/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Signal } from './signal';
import { SignalOptions } from './interfaces';
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
export declare function validated<T>(initialValue: T, validator: (value: T) => boolean | string, options?: SignalOptions<T>): Signal<T>;
