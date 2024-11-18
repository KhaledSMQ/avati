/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Signal } from './signal';
import { createSignal } from './createSignal';

/**
 * Represents an item in the queue with priority and timestamp.
 */
export interface QueueItem<T> {
    id: string;          // Unique identifier for the item
    data: T;            // The actual data stored in the queue
    priority: number;   // Priority level (higher numbers = higher priority)
    timestamp: number;  // Used for FIFO ordering within same priority
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
export class QueueSignal<T> {
    private queue: Signal<QueueItem<T>[]>;

    constructor() {
        this.queue = createSignal<QueueItem<T>[]>([]);
    }

    /**
     * Adds an item to the queue with optional priority.
     * @param data The item to add
     * @param priority Priority level (higher = more priority)
     * @returns Unique ID for the queued item
     */
    enqueue(data: T, priority: number = 0): string {
        const id = Math.random().toString(36).substring(2);
        const item: QueueItem<T> = {
            id,
            data,
            priority,
            timestamp: Date.now()
        };

        this.queue.value = [...this.queue.value, item].sort(
            (a, b) => b.priority - a.priority || a.timestamp - b.timestamp
        );

        return id;
    }

    /**
     * Removes and returns the highest priority item.
     * @returns The data of the dequeued item, or undefined if queue is empty
     */
    dequeue(): T | undefined {
        if (this.isEmpty()) return undefined;
        const [item, ...rest] = this.queue.value;
        this.queue.value = rest;
        return item?.data;
    }

    /**
     * Views the next item without removing it.
     * @returns The data of the next item, or undefined if queue is empty
     */
    peek(): T | undefined {
        return this.queue.value[0]?.data;
    }

    /**
     * Removes a specific item by its ID.
     * @param id ID of the item to remove
     * @returns true if an item was removed, false otherwise
     */
    remove(id: string): boolean {
        const initialLength = this.queue.value.length;
        this.queue.value = this.queue.value.filter(item => item.id !== id);
        return initialLength !== this.queue.value.length;
    }

    /**
     * Removes all items from the queue.
     */
    clear(): void {
        this.queue.value = [];
    }

    /**
     * Checks if the queue is empty.
     */
    isEmpty(): boolean {
        return this.queue.value.length === 0;
    }

    /**
     * Returns the number of items in the queue.
     */
    size(): number {
        return this.queue.value.length;
    }

    /**
     * Gets the underlying signal for reactive queue monitoring.
     * @returns Signal containing the queue items
     */
    getQueue(): Signal<QueueItem<T>[]> {
        return this.queue;
    }
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
export function createQueueSignal<T>(): QueueSignal<T> {
    return new QueueSignal<T>();
}
