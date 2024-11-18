/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { SignalOptions } from './interfaces';
import { Signal } from './signal';
/**
 * Create a signal that synchronizes its value with localStorage
 */
export declare function persistedSignal<T>(key: string, initialValue: T, options?: SignalOptions<T>): Signal<T>;
//# sourceMappingURL=persistedSignal.d.ts.map