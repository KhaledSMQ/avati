export class BatchScheduler {
    private static instance: BatchScheduler;
    private queue = new Set<() => void>();
    private isBatching = false;
    private isScheduled = false;
    private batchDepth = 0;
    private taskQueue: Array<() => void> = [];

    static getInstance(): BatchScheduler {
        if (!BatchScheduler.instance) {
            BatchScheduler.instance = new BatchScheduler();
        }
        return BatchScheduler.instance;
    }

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

    startBatch(): void {
        this.batchDepth++;
    }

    endBatch(): void {
        this.batchDepth--;
        if (this.batchDepth === 0) {
            this.processQueue();
        }
    }

    private processQueue(): void {
        if (this.batchDepth > 0) {
            return;
        }

        const tasks = [...this.taskQueue];
        this.taskQueue = [];
        this.isScheduled = false;

        try {
            this.isBatching = true;
            tasks.forEach((task) => {
                try {
                    task();
                } catch (error) {
                    console.error('Error in batched task:', error);
                }
            });
        } finally {
            this.isBatching = false;
            if (this.taskQueue.length > 0) {
                this.schedule(() => this.processQueue());
            }
        }
    }
}

// Higher-order function for batch updates
export function batchUpdates<T>(fn: () => T): T {
    const scheduler = BatchScheduler.getInstance();
    scheduler.startBatch();
    try {
        return fn();
    } finally {
        scheduler.endBatch();
    }
}

//
// // Custom hook for batched state updates
// export function useBatchedState<T>(initialState: T): [T, (value: T | ((prev: T) => T)) => void] {
//     const [state, setState] = useState(initialState);
//
//     const batchedSetState = useCallback((value: T | ((prev: T) => T)) => {
//         batchUpdates(() => setState(value));
//     }, []);
//
//     return [state, batchedSetState];
// }
//
// // Integration with signals
// export function createBatchedSignal<T>(initialValue: T) {
//     const signal = new Signal(initialValue);
//     const scheduler = BatchScheduler.getInstance();
//
//     return {
//         get value() { return signal.value; },
//         set value(newValue: T) {
//             scheduler.schedule(() => signal.set(newValue));
//         },
//         subscribe: signal.subscribe.bind(signal)
//     };
// }
