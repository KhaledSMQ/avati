/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Signal } from '../core';
/**
 * Debug utility to track signal updates
 */
export declare function debug<T>(signal: Signal<T>, name: string): Signal<T>;
