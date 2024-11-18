/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Disposable } from './interfaces';
import { Signal } from './signal';
/**
 * Base class for managing reactive computations
 */
export declare abstract class Computation implements Disposable {
    protected dirty: boolean;
    protected disposed: boolean;
    protected dependencies: Set<Signal<any>>;
    protected dependents: Set<Computation>;
    protected depth: number;
    protected name?: string;
    constructor(name?: string);
    abstract recompute(): void;
    /**
     * Add a dependency to this computation
     */
    addDependency(signal: Signal<any>): void;
    /**
     * Remove a dependency from this computation
     */
    removeDependency(signal: Signal<any>): void;
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
     * Clear all dependencies and update depth
     */
    protected clearDependencies(): void;
    /**
     * Update the computation's depth in the dependency graph
     */
    protected updateDepth(): void;
    /**
     * Check if signal is a dependency of this computation
     * @param signal
     */
    hasSignal(signal: Signal<any>): boolean;
}
//# sourceMappingURL=computation.d.ts.map