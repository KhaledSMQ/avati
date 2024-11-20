/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/


import { Cleanup, EqualityFunction, TransformFunction } from './types';

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

    /** Name of the signal for debugging purposes */
    name?: string;

    /** Current value of the signal */
    readonly value: T;


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

    /**
     * Removes a computation from this signal's dependents
     *
     * @param computation - The computation to remove
     */
    removeDependent(computation: Disposable): void;

    /**
     * Returns the name of the signal for debugging purposes
     */
    getDependents(): Set<IComputation>;

    /**
     * Adds a computation as dependent on this signal
     *
     * @param computation - The computation to add as a dependent
     */
    addDependent(computation: IComputation): void;


    /**
     * Returns whether the signal has been disposed
     */
    isDisposed(): boolean;


    isCommutable(): boolean;
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


export interface IComputation {
    recompute(): void;

    /**
     * Add a dependency to this computation
     */
    addDependency(signal: WritableSignal<any>): void;

    /**
     * Remove a dependency from this computation
     */
    removeDependency(signal: WritableSignal<any>): void;

    /**
     * Clean up computation resources
     */
    dispose(): void;

    /**
     * Check if computation is dirty
     */
    isDirty(): boolean;

    /**
     * Check if computation has been disposed
     */
    isDisposed(): boolean;

    /**
     * Add a dependent computation, which will be recomputed when this computation updates
     */
    getDepth(): number;

    /**
     * Mark computation as dirty and schedule update
     */
    markDirty(): void;

    /**
     * Check if signal is a dependency of this computation
     * @param signal
     */
    hasSignal(signal: WritableSignal<any>): boolean;

    /**
     * Clear all dependencies and update depth
     */
    clearDependencies(): void;

    /**
     * Update the computation's depth in the dependency graph
     */
    updateDepth(): void;
}

/**
 * Interface for effect objects
 */
export interface IEffect extends Disposable {

    /**
     * Cleanup function to run when the effect is disposed
     */
    cleanup: Cleanup | undefined;


    /**
     * Flag indicating whether the effect has been disposed
     */
    disposed: boolean;

    /**
     * Disposes of the effect, running cleanup and preventing further executions
     */
    dispose(): void;

    /**
     * Executes the effect function and manages cleanup
     * Handles error boundaries for both effect and cleanup execution
     */
    runEffect(): void;
}
