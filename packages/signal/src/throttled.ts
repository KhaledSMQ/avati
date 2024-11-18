/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { SignalOptions } from './interfaces';
import { createSignal } from './createSignal';
import { effect } from './effect';
import { Signal } from './signal';

/**
 * Create a signal that throttles updates
 */
export function throttled<T>(
    source: Signal<T>,
    interval: number,
    options?: SignalOptions<T>,
): Signal<T> {
    const output = createSignal(source.value, options);
    let lastUpdate = 0;
    let timeoutId: NodeJS.Timeout | undefined;

    effect(() => {
        const value = source.value;
        const now = Date.now();

        if (now - lastUpdate >= interval) {
            output.value = value;
            lastUpdate = now;
        } else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                output.value = value;
                lastUpdate = Date.now();
                timeoutId = undefined;
            }, interval - (now - lastUpdate));
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    });

    return output;
}
