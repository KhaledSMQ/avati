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
 *     console.debug('Task executed.');
 * });
 *
 * // Schedule a high-priority task
 * scheduler.schedule(() => {
 *     console.debug('High-priority task executed.');
 * }, { priority: 10 });
 *
 * // Start a batching context
 * scheduler.startBatch();
 *
 * // Schedule tasks within the batch
 * scheduler.schedule(() => {
 *     console.debug('Task within batch.');
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
export declare class BatchScheduler {
    /**
     * Singleton instance of the BatchScheduler.
     */
    private static instance;
    /**
     * Depth of the current batching context.
     */
    private batchDepth;
    /**
     * Queue of tasks scheduled for execution.
     */
    private taskQueue;
    /**
     * Indicates whether the task queue is scheduled for processing.
     */
    private isScheduled;
    /**
     * Indicates whether the scheduler is shutting down.
     */
    private isShuttingDown;
    /**
     * Current batch promise.
     * @private
     */
    private currentBatchPromise;
    /**
     * Retrieves the singleton instance of the BatchScheduler.
     *
     * @returns {BatchScheduler} The singleton instance.
     *
     * @example
     * const scheduler = BatchScheduler.getInstance();
     */
    static getInstance(): BatchScheduler;
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
     *     console.debug('Task executed.');
     * });
     *
     * @example
     * // Schedule a task with high priority
     * scheduler.schedule(() => {
     *     console.debug('High-priority task executed.');
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
     *     console.debug('This task may be cancelled.');
     * }, { cancellationToken: token });
     *
     * // Cancel the task before it executes
     * token.cancel();
     */
    schedule(task: TaskFunction, options?: TaskOptions): void;
    /**
     * Begins a new batching context. Tasks scheduled within this context
     * will be deferred until the batch ends.
     *
     * @example
     * scheduler.startBatch();
     * // Schedule tasks within the batch
     * scheduler.schedule(() => {
     *     console.debug('Task within batch.');
     * });
     * // End the batching context
     * scheduler.endBatch();
     */
    startBatch(): void;
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
    endBatch(): void;
    /**
     * Processes the task queue, executing tasks in order of priority.
     */
    private processQueue;
    /**
     * Cancels all pending tasks and prevents new tasks from being scheduled.
     *
     * @example
     * scheduler.shutdown();
     */
    shutdown(): void;
    /**
     * Immediately processes all pending tasks in the queue.
     *
     * @throws {Error} If called within a batching context.
     *
     * @example
     * scheduler.flush();
     */
    flush(): void;
    /**
     * Creates a cancellation token that can be used to cancel a scheduled task.
     *
     * @returns {CancellationToken} A new cancellation token.
     *
     * @example
     * const token = scheduler.createCancellationToken();
     * scheduler.schedule(() => {
     *     console.debug('This task may be cancelled.');
     * }, { cancellationToken: token });
     *
     * // Cancel the task before it executes
     * token.cancel();
     */
    createCancellationToken(): CancellationToken;
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
 *         console.debug('Task within batch.');
 *     });
 *     // Other synchronous operations
 *     console.debug('Batching operations complete.');
 * });
 */
export declare function batchUpdates<T>(fn: () => T): T;
export {};
