/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { Disposable, IComputation, IEffect, WritableSignal } from './interfaces';

/**
 * Manages the global state and context of signal computations
 */
export class Context {
    private static instance: Context;
    private computationStack: IComputation[] = [];
    private batchDepth = 0;
    private batchQueue = new Set<WritableSignal<any>>();
    private activeEffects = new Set<Disposable>();

    static getInstance(): Context {
        if (!this.instance) {
            this.instance = new Context();
        }
        return this.instance;
    }

    getCurrentComputation(): IComputation | undefined {
        return this.computationStack[this.computationStack.length - 1];
    }

    pushComputation(computation: IComputation): void {
        // Check for circular dependencies
        if (computation && this.computationStack.includes(computation)) {
            // throw new CircularDependencyError();
            return;
        }
        // we can push undefined to the stack
        this.computationStack.push(computation);
    }

    popComputation(): void {
        this.computationStack.pop();
    }

    isBatching(): boolean {
        return this.batchDepth > 0;
    }

    beginBatch(): void {
        this.batchDepth++;
    }

    endBatch(): void {
        this.batchDepth--;
        if (this.batchDepth === 0) {
            this.flushBatchQueue();
        }
    }

    addToBatchQueue(signal: WritableSignal<any>): void {
        this.batchQueue.add(signal);
    }

    flushBatchQueue(): void {
        // Create a new Set for unique signals
        const uniqueSignals = new Set(this.batchQueue);
        this.batchQueue.clear();

        // Get all dependent computations
        const computations = new Set<IComputation>();

        for (const signal of uniqueSignals) {
            for (const dependent of signal.getDependents()) {
                computations.add(dependent);
            }
        }
        // Mark all computations as dirty
        for (const computation of computations) {
            computation.markDirty();
        }
    }

    setCurrentComputation(computation: IComputation): void {
        this.computationStack[this.computationStack.length - 1] = computation;
    }


    registerEffect(effect: IEffect): void {
        this.activeEffects.add(effect);
    }

    unregisterEffect(effect: IEffect): void {
        this.activeEffects.delete(effect);
    }

    // Add this method to check if we're currently in an effect
    isInEffect(): boolean {
        return this.activeEffects.size > 0;
    }
}
