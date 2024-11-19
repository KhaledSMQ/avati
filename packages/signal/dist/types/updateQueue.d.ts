/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Computation } from './computation';
/**
 * Manages the scheduling and processing of signal updates
 * Uses a topological sort to handle updates in the correct order
 */
export declare class UpdateQueue {
    private static instance;
    private queue;
    private processing;
    private updateDepth;
    private maxUpdateDepth;
    static getInstance(): UpdateQueue;
    /**
     * Schedule a computation for update
     */
    schedule(computation: Computation): void;
    /**
     * Process all scheduled updates in dependency order
     */
    private processQueue;
}
