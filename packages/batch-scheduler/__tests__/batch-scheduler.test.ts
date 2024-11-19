import { BatchScheduler, batchUpdates } from '../src';


const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('BatchScheduler', () => {
    let scheduler: BatchScheduler;

    beforeEach(() => {
        // Reset the singleton instance before each test
        (BatchScheduler as any).instance = null;
        scheduler = BatchScheduler.getInstance();
    });

    test('should execute scheduled tasks', async () => {
        const mockTask = jest.fn();
        scheduler.schedule(mockTask);

        // Wait for microtasks to complete
        await sleep(100);

        expect(mockTask).toHaveBeenCalled();
    });

    test('should execute tasks in order of priority', async () => {
        const results: number[] = [];

        // push 1 to results - low priority
        scheduler.schedule(() => {
            results.push(1);
        }, { priority: 1 });

        // push 2 to results - high priority
        scheduler.schedule(() => {
            results.push(2);
        }, { priority: 5 });

        // push 3 to results - normal priority
        scheduler.schedule(() => {
            results.push(3);
        }, { priority: 3 });

        await sleep(100);

        expect(results).toEqual([2, 3, 1]);
    });

    test('should handle tasks scheduled within a batching context', async () => {
        const mockTask = jest.fn();

        scheduler.startBatch();
        scheduler.schedule(mockTask);
        expect(mockTask).not.toHaveBeenCalled();

        scheduler.endBatch();

        await Promise.resolve();

        expect(mockTask).toHaveBeenCalled();
    });

    test('should not process tasks while in a batching context', async () => {
        const results: number[] = [];

        scheduler.startBatch();
        scheduler.schedule(() => {
            results.push(1);
        });
        scheduler.schedule(() => {
            results.push(2);
        });

        await sleep(100);

        expect(results).toEqual([]); // No tasks should have run yet

        scheduler.endBatch();

        await sleep(100);

        expect(results).toEqual([1, 2]);
    });

    test('should support nested batching contexts', async () => {
        const results: number[] = [];

        scheduler.startBatch();
        scheduler.schedule(() => {
            results.push(1);
        });

        scheduler.startBatch();
        scheduler.schedule(() => {
            results.push(2);
        });
        scheduler.endBatch();

        scheduler.schedule(() => {
            results.push(3);
        });
        scheduler.endBatch();

        await sleep(100);


        expect(results).toEqual([1, 2, 3]);
    });

    test('should handle cancellation of tasks', async () => {
        const mockTask = jest.fn();
        const token = scheduler.createCancellationToken();

        scheduler.schedule(mockTask, { cancellationToken: token });
        token.cancel();

        await sleep(100);

        expect(mockTask).not.toHaveBeenCalled();
    });

    test('should execute onError callback when task throws an error', async () => {
        const error = new Error('Task error');
        const mockOnError = jest.fn();
        const faultyTask = () => {
            throw error;
        };

        scheduler.schedule(faultyTask, { onError: mockOnError });

        await sleep(100);

        expect(mockOnError).toHaveBeenCalledWith(error);
    });

    test('should log error when task throws and no onError is provided', async () => {
        const error = new Error('Task error');
        const faultyTask = () => {
            throw error;
        };

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        scheduler.schedule(faultyTask);

        await sleep(100);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in batched task:', error);
        consoleErrorSpy.mockRestore();
    });

    test('should not execute tasks after shutdown', () => {
        scheduler.shutdown();

        expect(() => {
            scheduler.schedule(() => {
                // This should not execute
            });
        }).toThrow('Cannot schedule tasks after shutdown has been initiated.');
    });

    test('should clear pending tasks on shutdown', async () => {
        const mockTask = jest.fn();

        scheduler.schedule(mockTask);
        scheduler.shutdown();

        await sleep(100);

        expect(mockTask).not.toHaveBeenCalled();
    });

    test('should flush tasks immediately', () => {
        const mockTask = jest.fn();

        scheduler.schedule(mockTask);
        scheduler.flush();

        expect(mockTask).toHaveBeenCalled();
    });

    test('should throw error when flushing inside a batch', () => {
        scheduler.startBatch();
        expect(() => {
            scheduler.flush();
        }).toThrow('Cannot flush while in a batching context.');
    });

    test('batchUpdates should execute tasks after batch ends', async () => {
        const results: number[] = [];

        batchUpdates(() => {
            scheduler.schedule(() => {
                results.push(1);
            });
            scheduler.schedule(() => {
                results.push(2);
            });
            expect(results).toEqual([]);
        });

        await sleep(100);

        expect(results).toEqual([1, 2]);
    });

    test('should process asynchronous tasks', async () => {
        const results: number[] = [];

        scheduler.schedule(async () => {
            await sleep(30);
            results.push(1);
        });

        scheduler.schedule(() => {
            results.push(2);
        }, { priority: 10 });

        await sleep(50);

        expect(results).toEqual([2, 1]);
    });

    test('should process tasks scheduled during processing', async () => {
        const results: number[] = [];

        scheduler.schedule(() => {
            results.push(1);
            scheduler.schedule(() => {
                results.push(2);
            });
        });

        await sleep(100);


        expect(results).toEqual([1, 2]);
    });

    test('should handle errors in onError handler', async () => {
        const error = new Error('Task error');
        const onErrorError = new Error('onError error');
        const faultyTask = () => {
            throw error;
        };
        const faultyOnError = () => {
            throw onErrorError;
        };

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        scheduler.schedule(faultyTask, { onError: faultyOnError });

        await Promise.resolve();

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in onError handler:', onErrorError);
        consoleErrorSpy.mockRestore();
    });

    test('should not proceed if endBatch is called without matching startBatch', () => {
        expect(() => {
            scheduler.endBatch();
        }).toThrow('No batch to end.');
    });

    test('should not allow new tasks to be scheduled after shutdown', () => {
        scheduler.shutdown();

        expect(() => {
            scheduler.schedule(() => {
            });
        }).toThrow('Cannot schedule tasks after shutdown has been initiated.');
    });

    test('should allow creating and using multiple cancellation tokens', async () => {
        const mockTask1 = jest.fn();
        const mockTask2 = jest.fn();

        const token1 = scheduler.createCancellationToken();
        const token2 = scheduler.createCancellationToken();

        scheduler.schedule(mockTask1, { cancellationToken: token1 });
        scheduler.schedule(mockTask2, { cancellationToken: token2 });

        token1.cancel();

        await sleep(100);

        expect(mockTask1).not.toHaveBeenCalled();
        expect(mockTask2).toHaveBeenCalled();
    });
});
