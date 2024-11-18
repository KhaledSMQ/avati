/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Signal } from './signal';
/**
 * Represents an item in the queue with priority and timestamp.
 */
export interface QueueItem<T> {
    id: string;
    data: T;
    priority: number;
    timestamp: number;
}
/**
 * A priority queue implementation using signals for reactive state management.
 * Items are ordered by priority (highest first) and timestamp (FIFO for same priority).
 *
 * @example
 * // Basic queue operations
 * const taskQueue = createQueueSignal<string>();
 *
 * // Add tasks with different priorities
 * taskQueue.enqueue("Low priority task", 1);
 * taskQueue.enqueue("High priority task", 3);
 * taskQueue.enqueue("Medium priority task", 2);
 *
 * console.log(taskQueue.peek()); // "High priority task"
 * console.log(taskQueue.dequeue()); // "High priority task"
 * console.log(taskQueue.size()); // 2
 *
 * @example
 * // Task processing with priorities
 * const processingQueue = createQueueSignal<{task: string, urgency: string}>();
 *
 * // Emergency task (priority 3)
 * const emergencyId = processingQueue.enqueue(
 *   {task: "Server down", urgency: "high"},
 *   3
 * );
 *
 * // Regular tasks (priority 1)
 * processingQueue.enqueue({task: "Update docs", urgency: "low"}, 1);
 * processingQueue.enqueue({task: "Code review", urgency: "low"}, 1);
 *
 * // Process emergency first
 * while (!processingQueue.isEmpty()) {
 *   const task = processingQueue.dequeue();
 *   console.log(`Processing: ${task.task}`);
 * }
 *
 * @example
 * // Reactive queue monitoring
 * const downloadQueue = createQueueSignal<string>();
 * const queueSignal = downloadQueue.getQueue();
 *
 * effect(() => {
 *   const items = queueSignal.value;
 *   console.log(`Queue size changed: ${items.length} items`);
 * });
 *
 * downloadQueue.enqueue("file1.txt");
 * downloadQueue.enqueue("file2.txt");
 */
export declare class QueueSignal<T> {
    private queue;
    constructor();
    /**
     * Adds an item to the queue with optional priority.
     * @param data The item to add
     * @param priority Priority level (higher = more priority)
     * @returns Unique ID for the queued item
     */
    enqueue(data: T, priority?: number): string;
    /**
     * Removes and returns the highest priority item.
     * @returns The data of the dequeued item, or undefined if queue is empty
     */
    dequeue(): T | undefined;
    /**
     * Views the next item without removing it.
     * @returns The data of the next item, or undefined if queue is empty
     */
    peek(): T | undefined;
    /**
     * Removes a specific item by its ID.
     * @param id ID of the item to remove
     * @returns true if an item was removed, false otherwise
     */
    remove(id: string): boolean;
    /**
     * Removes all items from the queue.
     */
    clear(): void;
    /**
     * Checks if the queue is empty.
     */
    isEmpty(): boolean;
    /**
     * Returns the number of items in the queue.
     */
    size(): number;
    /**
     * Gets the underlying signal for reactive queue monitoring.
     * @returns Signal containing the queue items
     */
    getQueue(): Signal<QueueItem<T>[]>;
}
/**
 * Creates a new queue signal instance.
 * @example
 * // Basic queue operations
 * const taskQueue = createQueueSignal<string>();
 *
 * // Add tasks with different priorities
 * taskQueue.enqueue("Low priority task", 1);
 * taskQueue.enqueue("High priority task", 3);
 * taskQueue.enqueue("Medium priority task", 2);
 *
 * console.log(taskQueue.peek()); // "High priority task"
 * console.log(taskQueue.dequeue()); // "High priority task"
 * console.log(taskQueue.size()); // 2
 *
 * @example
 * // Task processing with priorities
 * const processingQueue = createQueueSignal<{task: string, urgency: string}>();
 *
 * // Emergency task (priority 3)
 * const emergencyId = processingQueue.enqueue(
 *   {task: "Server down", urgency: "high"},
 *   3
 * );
 *
 * // Regular tasks (priority 1)
 * processingQueue.enqueue({task: "Update docs", urgency: "low"}, 1);
 * processingQueue.enqueue({task: "Code review", urgency: "low"}, 1);
 *
 * // Process emergency first
 * while (!processingQueue.isEmpty()) {
 *   const task = processingQueue.dequeue();
 *   console.log(`Processing: ${task.task}`);
 * }
 *
 * @example
 * // Reactive queue monitoring
 * const downloadQueue = createQueueSignal<string>();
 * const queueSignal = downloadQueue.getQueue();
 *
 * effect(() => {
 *   const items = queueSignal.value;
 *   console.log(`Queue size changed: ${items.length} items`);
 * });
 *
 * @returns A new QueueSignal instance
 */
export declare function createQueueSignal<T>(): QueueSignal<T>;
//# sourceMappingURL=queue.d.ts.map