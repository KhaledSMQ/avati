/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/


/**
 * Utility type for valid dependency arrays
 * Ensures all elements are valid dependency types
 */
export type DependencyList = ReadonlyArray<unknown>;

/**
 * Type for the effect callback function
 * Can return void or a cleanup function
 */
export type EffectCallback = () => (void | Destructor);

/**
 * Type for cleanup function
 */
export type Destructor = () => void;
