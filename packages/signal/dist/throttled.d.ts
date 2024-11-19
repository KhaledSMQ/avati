/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { SignalOptions } from './interfaces';
import { Signal } from './signal';
/**
 * Create a signal that throttles updates
 */
export declare function throttled<T>(source: Signal<T>, interval: number, options?: SignalOptions<T>): Signal<T>;
//# sourceMappingURL=throttled.d.ts.map