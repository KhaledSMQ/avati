/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Signal } from './signal';
import type { SignalOptions } from './interfaces';
/**
 * Create a computed signal that derives its value from other signals
 */
export declare function computed<T>(compute: () => T, options?: SignalOptions<T>): Signal<T>;