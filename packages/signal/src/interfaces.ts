/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/



import { EqualityFunction, TransformFunction, VoidCallbackFunction } from './types';

/**
 * Configuration options for Signal creation
 */
export interface SignalOptions<T> {
    /** equality function to compare values, defaults to strict equality */
    equals?: EqualityFunction<T>;

    /** Name of the signal for debugging purposes */
    name?: string;
}

/**
 * Interface for objects that can be cleaned up
 */
export interface Disposable {
    /** Cleanup resources used by this object */
    dispose(): void;
}

/**
 * Read-only signal interface
 */
export interface ReadonlySignal<T> {
    /** Current value of the signal */
    readonly value: T;

    /** Subscribe to value changes */
    subscribe(callback: VoidCallbackFunction<T>): () => void;

    /** Subscribe to value changes */
    dispose(): void;
}

/**
 * Writable signal interface
 */
export interface WritableSignal<T> extends ReadonlySignal<T> {
    /** Get or set the signal's value */
    value: T;

    /** Update the signal's value using a transformation function */
    update(fn: TransformFunction<T>): void;

}


/**
 * Interface for performance metrics
 */
export interface SignalMetrics {
    updates: number;
    computations: number;
    maxChainDepth: number;
    averageUpdateTime: number;
}
