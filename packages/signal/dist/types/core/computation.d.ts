/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Disposable, IComputation, type WritableSignal } from './interfaces';
/**
 * Base class for managing reactive computations
 */
export declare abstract class Computation implements Disposable, IComputation {
    protected dirty: boolean;
    protected disposed: boolean;
    protected dependencies: Set<WritableSignal<any>>;
    protected dependents: Set<Computation>;
    protected depth: number;
    protected name?: string;
    abstract recompute(): void;
    constructor(name?: string);
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
