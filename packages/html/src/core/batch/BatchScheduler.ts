/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

export class BatchScheduler {
    private static instance: BatchScheduler;
    private batchDepth = 0;
    private taskQueue: Array<() => void> = [];
    private isScheduled = false;

    static getInstance(): BatchScheduler {
        if (!BatchScheduler.instance) {
            BatchScheduler.instance = new BatchScheduler();
        }
        return BatchScheduler.instance;
    }

    /**
     * Schedules a callback to be executed. High-priority tasks are added to the front of the queue.
     * @param callback - The function to execute.
     * @param priority - Task priority ('high' or 'normal').
     */
    schedule(callback: () => void, priority: 'high' | 'normal' = 'normal'): void {
        if (priority === 'high') {
            this.taskQueue.unshift(callback);
        } else {
            this.taskQueue.push(callback);
        }

        if (!this.isScheduled) {
            this.isScheduled = true;
            queueMicrotask(() => this.processQueue());
        }
    }

    /**
     * Begins a batching context. Tasks scheduled within this context will be deferred until the batch ends.
     */
    startBatch(): void {
        this.batchDepth++;
    }

    /**
     * Ends a batching context. If all batching contexts have ended, pending tasks will be processed.
     */
    endBatch(): void {
        if (this.batchDepth === 0) {
            throw new Error('No batch to end');
        }
        this.batchDepth--;
        if (this.batchDepth === 0 && this.taskQueue.length > 0) {
            this.processQueue();
        }
    }

    private processQueue(): void {
        this.isScheduled = false;

        if (this.batchDepth > 0) {
            return;
        }

        const tasks = [...this.taskQueue];
        this.taskQueue = [];

        tasks.forEach((task) => {
            try {
                task();
            } catch (error) {
                console.error('Error in batched task:', error);
            }
        });

        if (this.taskQueue.length > 0) {
            this.isScheduled = true;
            queueMicrotask(() => this.processQueue());
        }
    }
}

/**
 * Executes a function within a batching context, deferring any scheduled tasks until the batch ends.
 * @param fn - The function to execute.
 * @returns The return value of the executed function.
 */
export function batchUpdates<T>(fn: () => T): T {
    const scheduler = BatchScheduler.getInstance();
    scheduler.startBatch();
    try {
        return fn();
    } finally {
        scheduler.endBatch();
    }
}
