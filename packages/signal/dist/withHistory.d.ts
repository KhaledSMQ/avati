/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { SignalOptions } from './interfaces';
import { Signal } from './signal';
/**
 * Adds undo/redo functionality to a Signal by wrapping it with history tracking
 *
 * @param initialValue Initial value for the signal
 * @param maxHistory Maximum number of history states to maintain
 * @param options Signal configuration options
 * @returns Enhanced signal with undo/redo capabilities and history access
 */
export declare function withHistory<T>(initialValue: T, maxHistory?: number, options?: SignalOptions<T>): Signal<T> & {
    undo(): void;
    redo(): void;
    history: Signal<T[]>;
    canUndo: Signal<boolean>;
    canRedo: Signal<boolean>;
};
//# sourceMappingURL=withHistory.d.ts.map