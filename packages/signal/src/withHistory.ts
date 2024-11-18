/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { SignalOptions } from './interfaces';
import { createSignal } from './createSignal';
import { Signal } from './signal';
import { defaultEquals } from './utility';
import { batch } from './batch';
import { computed } from './computed';

/**
 * Adds undo/redo functionality to a Signal by wrapping it with history tracking
 *
 * @param initialValue Initial value for the signal
 * @param maxHistory Maximum number of history states to maintain
 * @param options Signal configuration options
 * @returns Enhanced signal with undo/redo capabilities and history access
 */
export function withHistory<T>(
    initialValue: T,
    maxHistory: number = 10,
    options?: SignalOptions<T>,
): Signal<T> & {
    undo(): void;
    redo(): void;
    history: Signal<T[]>;
    canUndo: Signal<boolean>;
    canRedo: Signal<boolean>;
} {
    // Use provided equals function or default
    const equalsFn = options?.equals ?? defaultEquals;

    const signal = createSignal(initialValue, {
        ...options,
        equals: equalsFn, // Ensure equals function is properly passed
    });
    const history = createSignal<T[]>([initialValue]);
    const currentIndex = createSignal(0);

    const canUndo = computed(() => currentIndex.value > 0);
    const canRedo = computed(() => currentIndex.value < history.value.length - 1);

    const wrapper = Object.create(signal) as Signal<T> & {
        undo(): void;
        redo(): void;
        history: Signal<T[]>;
        canUndo: Signal<boolean>;
        canRedo: Signal<boolean>;
    };

    wrapper.history = history;
    wrapper.canUndo = canUndo;
    wrapper.canRedo = canRedo;

    // Use batch for atomic updates
    Object.defineProperty(wrapper, 'value', {
        get: () => signal.value,
        set: (newValue: T) => {
            if (!equalsFn(signal.value, newValue)) {
                batch(() => {
                    const newIndex = currentIndex.value + 1;
                    const newHistory = history.value
                        .slice(0, newIndex)
                        .concat([newValue]);

                    if (newHistory.length > maxHistory) {
                        newHistory.shift();
                        currentIndex.value = newIndex - 1;
                    } else {
                        currentIndex.value = newIndex;
                    }

                    history.value = newHistory;
                    signal.value = newValue;
                });
            }
        },
    });

    wrapper.undo = () => {
        if (canUndo.value) {
            batch(() => {
                currentIndex.value--;
                signal.value = history.value[currentIndex.value] as T;
            });
        }
    };

    wrapper.redo = () => {
        if (canRedo.value) {
            batch(() => {
                currentIndex.value++;
                signal.value = history.value[currentIndex.value] as T;
            });
        }
    };

    return wrapper;
}
