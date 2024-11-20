/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
/** Common types used throughout the implementation */
export type Cleanup = void | (() => void);
export type EffectFunction<T = void> = () => T | Cleanup;
export type UnsubscribeFunction = () => void;
export type TransformFunction<T> = (current: T) => T;
/** Equality function to compare values of the same type */
export type EqualityFunction<T> = (prev: T, next: T) => boolean;
export type VoidCallbackFunction<T> = (value: T) => void;
