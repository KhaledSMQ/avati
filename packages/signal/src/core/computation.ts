/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { Disposable, IComputation, type WritableSignal } from './interfaces';
import { UpdateQueue } from './updateQueue';

/**
 * Base class for managing reactive computations
 */
export abstract class Computation implements Disposable, IComputation {
    protected dirty = true;
    protected disposed = false;
    protected dependencies = new Set<WritableSignal<any>>();
    protected dependents = new Set<Computation>();
    protected depth = 0;
    protected name?: string;

    abstract recompute(): void;

    constructor(name?: string) {
        this.name = name;
    }


    /**
     * Add a dependency to this computation
     */
    addDependency(signal: WritableSignal<any>): void {
        if (!this.dependencies.has(signal)) {
            this.dependencies.add(signal);
            if (signal.constructor.name == 'ComputedSignal') {
                this.updateDepth();
            }
        }
    }

    /**
     * Remove a dependency from this computation
     */
    removeDependency(signal: WritableSignal<any>): void {
        if (this.dependencies.delete(signal)) {
            this.updateDepth();
        }
    }

    /**
     * Clean up computation resources
     */
    dispose(): void {
        if (this.disposed) return;

        this.disposed = true;
        this.clearDependencies();
        this.dependents.clear();
    }

    /**
     * Check if computation is dirty
     */
    isDirty(): boolean {
        return this.dirty;
    }

    /**
     * Check if computation has been disposed
     */
    isDisposed(): boolean {
        return this.disposed;
    }

    /**
     * Add a dependent computation, which will be recomputed when this computation updates
     */
    getDepth(): number {
        return this.depth;
    }

    /**
     * Mark computation as dirty and schedule update
     */
    markDirty(): void {

        if (!this.disposed) {
            this.dirty = true;
            UpdateQueue.getInstance().schedule(this);
        }
    }

    /**
     * Check if signal is a dependency of this computation
     * @param signal
     */
    hasSignal(signal: WritableSignal<any>): boolean {
        return this.dependencies.has(signal);
    }

    /**
     * Clear all dependencies and update depth
     */
    clearDependencies(): void {
        for (const dep of this.dependencies) {
            dep.removeDependent(this);
        }
        this.dependencies.clear();
        this.updateDepth();
    }

    /**
     * Update the computation's depth in the dependency graph
     */
    updateDepth(): void {
        const oldDepth = this.depth;
        let maxDepth = 0;

        for (const dep of this.dependencies) {
            if (dep.constructor.name == 'ComputedSignal') {
                // @ts-ignore TODO use concrete type
                maxDepth = Math.max(maxDepth, dep.getDepth() + 1);
            }
        }

        if (oldDepth !== maxDepth) {
            this.depth = maxDepth;
            // Propagate depth update to dependents
            for (const dependent of this.dependents) {
                dependent.updateDepth();
            }
        }
    }
}
