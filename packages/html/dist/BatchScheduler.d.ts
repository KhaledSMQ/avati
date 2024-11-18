export declare class BatchScheduler {
    private static instance;
    private queue;
    private isBatching;
    private isScheduled;
    private batchDepth;
    private taskQueue;
    static getInstance(): BatchScheduler;
    schedule(callback: () => void, priority?: 'high' | 'normal'): void;
    private processQueue;
    startBatch(): void;
    endBatch(): void;
}
export declare function batchUpdates<T>(fn: () => T): T;
