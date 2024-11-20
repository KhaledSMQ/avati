/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Signal } from './signal';
import type { SignalOptions } from './interfaces';
/**
 * Create a new writable signal
 */
export declare function createSignal<T>(initialValue: T, options?: SignalOptions<T>): Signal<T>;
