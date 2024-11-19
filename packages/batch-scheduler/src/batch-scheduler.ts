/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

/**
 * Type definitions for task functions and priorities.
 */
type TaskFunction = () => void | Promise<void>;
type Priority = number;

/**
 * Interface representing the options available when scheduling a task.
 */
interface TaskOptions {
    /**
     * The priority level of the task. Higher numbers indicate higher priority.
     * @default 0
     */
    priority?: Priority;

    /**
     * Callback function to handle any errors that occur during task execution.
     */
    onError?: (error: unknown) => void;

    /**
     * A cancellation token that can be used to cancel the scheduled task before it executes.
     */
    cancellationToken?: CancellationToken;

    /**
     * The name of the task. This is used for debugging purposes.
     */
    name?: string;
}

/**
 * Interface representing a scheduled task within the task queue.
 */
interface ScheduledTask {
    task: TaskFunction;
    priority: Priority;
    onError?: (error: unknown) => void;
    token?: CancellationToken;
    promise?: Promise<void>;
}

/**
 * Interface representing a cancellation token for a scheduled task.
 */
interface CancellationToken {
    /**
     * Cancels the scheduled task.
     */
    cancel: () => void;

    /**
     * Indicates whether the task has been cancelled.
     */
    isCancelled: boolean;
}


const log = (...args: any[]) => {
    const now = new Date().toISOString().slice(11, 23);
    console.log('[BatchScheduler]', now, ...args);
};

/**
 * BatchScheduler is responsible for managing and executing tasks in batches.
 * It supports task prioritization, cancellation, error handling, and batching contexts.
 *
 * @example
 * // Retrieve the singleton instance
 * const scheduler = BatchScheduler.getInstance();
 *
 * // Schedule a task
 * scheduler.schedule(() => {
 *     console.log('Task executed.');
 * });
 *
 * // Schedule a high-priority task
 * scheduler.schedule(() => {
 *     console.log('High-priority task executed.');
 * }, { priority: 10 });
 *
 * // Start a batching context
 * scheduler.startBatch();
 *
 * // Schedule tasks within the batch
 * scheduler.schedule(() => {
 *     console.log('Task within batch.');
 * });
 *
 * // End the batching context to process tasks
 * scheduler.endBatch();
 *
 * // Flush pending tasks immediately
 * scheduler.flush();
 *
 * // Shutdown the scheduler
 * scheduler.shutdown();
 */
export class BatchScheduler {
    /**
     * Singleton instance of the BatchScheduler.
     */
    private static instance: BatchScheduler | null = null;

    /**
     * Depth of the current batching context.
     */
    private batchDepth = 0;

    /**
     * Queue of tasks scheduled for execution.
     */
    private taskQueue: ScheduledTask[] = [];

    /**
     * Indicates whether the task queue is scheduled for processing.
     */
    private isScheduled = false;

    /**
     * Indicates whether the scheduler is shutting down.
     */
    private isShuttingDown = false;

    /**
     * Current batch promise.
     * @private
     */
    private currentBatchPromise: Promise<void> | null = null;


    /**
     * Retrieves the singleton instance of the BatchScheduler.
     *
     * @returns {BatchScheduler} The singleton instance.
     *
     * @example
     * const scheduler = BatchScheduler.getInstance();
     */
    public static getInstance(): BatchScheduler {
        if (BatchScheduler.instance === null) {
            BatchScheduler.instance = new BatchScheduler();
        }

        return BatchScheduler.instance;
    }

    /**
     * Schedules a task for execution. Supports task prioritization, cancellation, and error handling.
     *
     * @param {TaskFunction} task - The function to be executed.
     * @param {TaskOptions} [options={}] - Optional settings for the task.
     *
     * @throws {Error} If the scheduler is shutting down.
     *
     * @example
     * // Schedule a simple task
     * scheduler.schedule(() => {
     *     console.log('Task executed.');
     * });
     *
     * @example
     * // Schedule a task with high priority
     * scheduler.schedule(() => {
     *     console.log('High-priority task executed.');
     * }, { priority: 5 });
     *
     * @example
     * // Schedule a task with an error handler
     * scheduler.schedule(() => {
     *     throw new Error('Task error');
     * }, {
     *     onError: (error) => {
     *         console.error('Handled task error:', error);
     *     },
     * });
     *
     * @example
     * // Schedule a task with a cancellation token
     * const token = scheduler.createCancellationToken();
     * scheduler.schedule(() => {
     *     console.log('This task may be cancelled.');
     * }, { cancellationToken: token });
     *
     * // Cancel the task before it executes
     * token.cancel();
     */
    public schedule(task: TaskFunction, options: TaskOptions = {}): void {
        if (this.isShuttingDown) {
            throw new Error('Cannot schedule tasks after shutdown has been initiated.');
        }

        const {
            priority = 0,
            onError,
            cancellationToken: token,
            name = 'anonymous',
        } = options;

        this.taskQueue.push({ task, priority, onError, token });
        log(`Task scheduled: ${name} (priority: ${priority})`);
        // Sort the task queue by priority in descending order.
        this.taskQueue.sort((a, b) => b.priority - a.priority);

        if (!this.isScheduled && this.batchDepth === 0) {
            this.isScheduled = true;
            queueMicrotask(() => {
                this.currentBatchPromise = this.processQueue();
            });
        }
    }

    /**
     * Begins a new batching context. Tasks scheduled within this context
     * will be deferred until the batch ends.
     *
     * @example
     * scheduler.startBatch();
     * // Schedule tasks within the batch
     * scheduler.schedule(() => {
     *     console.log('Task within batch.');
     * });
     * // End the batching context
     * scheduler.endBatch();
     */
    public startBatch(): void {
        this.batchDepth++;
    }

    /**
     * Ends the current batching context. If all batching contexts have ended,
     * pending tasks will be processed.
     *
     * @throws {Error} If there is no batching context to end.
     *
     * @example
     * // Assuming a batching context has been started
     * scheduler.endBatch();
     */
    public endBatch(): void {
        if (this.batchDepth === 0) {
            throw new Error('No batch to end.');
        }

        this.batchDepth--;

        if (this.batchDepth === 0 && this.taskQueue.length > 0) {
            this.currentBatchPromise = this.processQueue();
        }
    }

    /**
     * Processes the task queue, executing tasks in order of priority.
     */
    private async processQueue(): Promise<void> {
        this.isScheduled = false;

        if (this.batchDepth > 0 || this.isShuttingDown) {
            return;
        }

        const tasksToProcess = this.taskQueue;
        this.taskQueue = [];

        for (const scheduledTask of tasksToProcess) {
            if (scheduledTask.token?.isCancelled) {
                continue;
            }

            try {
                const result = scheduledTask.task();

                // If the task returns a promise, we need to wait for it
                if (result instanceof Promise) {
                    scheduledTask.promise = result;
                    await result;
                } else {
                    // For synchronous tasks, we create a resolved promise
                    scheduledTask.promise = Promise.resolve();
                }
            } catch (error) {
                if (scheduledTask.onError) {
                    try {
                        scheduledTask.onError(error);
                    } catch (errorInHandler) {
                        console.error('Error in onError handler:', errorInHandler);
                    }
                } else {
                    console.error('Error in batched task:', error);
                }
            }
        }

        if (this.taskQueue.length > 0 && this.batchDepth === 0) {
            this.isScheduled = true;
            queueMicrotask(() => this.processQueue());
        }
    }

    /**
     * Cancels all pending tasks and prevents new tasks from being scheduled.
     *
     * @example
     * scheduler.shutdown();
     */
    public shutdown(): void {
        this.isShuttingDown = true;
        this.taskQueue = [];
    }

    /**
     * Immediately processes all pending tasks in the queue.
     *
     * @throws {Error} If called within a batching context.
     *
     * @example
     * scheduler.flush();
     */
    public flush(): void {
        if (this.batchDepth > 0) {
            throw new Error('Cannot flush while in a batching context.');
        }

        // Trigger completion of current batch without blocking
        if (this.currentBatchPromise) {
            this.currentBatchPromise.finally()
        }

        // Process any remaining tasks without blocking
        if (this.taskQueue.length > 0) {
            this.currentBatchPromise = this.processQueue();
            this.currentBatchPromise.finally();
        }
    }

    /**
     * Creates a cancellation token that can be used to cancel a scheduled task.
     *
     * @returns {CancellationToken} A new cancellation token.
     *
     * @example
     * const token = scheduler.createCancellationToken();
     * scheduler.schedule(() => {
     *     console.log('This task may be cancelled.');
     * }, { cancellationToken: token });
     *
     * // Cancel the task before it executes
     * token.cancel();
     */
    public createCancellationToken(): CancellationToken {
        let isCancelled = false;

        return {
            cancel: () => {
                isCancelled = true;
            },
            get isCancelled() {
                return isCancelled;
            },
        };
    }
}

/**
 * Executes a function within a batching context. Tasks scheduled within the function
 * will be deferred until the batch ends.
 *
 * @param {() => T} fn - The function to execute.
 *
 * @returns {T} The return value of the executed function.
 *
 * @template T
 *
 * @example
 * batchUpdates(() => {
 *     // Schedule tasks within the batch
 *     scheduler.schedule(() => {
 *         console.log('Task within batch.');
 *     });
 *     // Other synchronous operations
 *     console.log('Batching operations complete.');
 * });
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
