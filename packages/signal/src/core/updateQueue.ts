/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { IComputation } from './interfaces';

/**
 * Manages the scheduling and processing of signal updates
 * Uses a topological sort to handle updates in the correct order
 */
export class UpdateQueue {
    private static instance: UpdateQueue;
    private queue = new Set<IComputation>();
    private processing = false;
    private updateDepth = 0;
    private maxUpdateDepth = 1000; // Configurable maximum update depth

    static getInstance(): UpdateQueue {
        if (!this.instance) {
            this.instance = new UpdateQueue();
        }
        return this.instance;
    }

    /**
     * Schedule a computation for update
     */
    schedule(computation: IComputation): void {
        if (this.updateDepth >= this.maxUpdateDepth) {
            throw new Error('Maximum update depth exceeded - possible circular dependency');
        }

        this.queue.add(computation);
        if (!this.processing) {
            this.processQueue();
        }
    }

    /**
     * Process all scheduled updates in dependency order
     */
    private processQueue(): void {
        this.processing = true;
        this.updateDepth++;

        try {
            while (this.queue.size > 0) {
                const computations = Array.from(this.queue);
                this.queue.clear();

                // Sort by dependency depth to ensure correct update order
                computations.sort((a, b) => a.getDepth() - b.getDepth());

                for (const computation of computations) {
                    if (computation.isDirty() && !computation.isDisposed()) {
                        computation.recompute();
                    }
                }
            }
        } finally {
            this.processing = false;
            this.updateDepth--;
        }
    }
}
