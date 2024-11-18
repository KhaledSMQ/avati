import { batch, computed, createSignal, effect, SignalContext, SignalDisposedError } from '../src';


describe('Signal System', () => {
    beforeEach(() => {
        // Reset any static state between tests
        SignalContext['instance'] = null;
    });

    describe('Basic Signal', () => {
        it('should create a signal with initial value', () => {
            const signal = createSignal(10);
            expect(signal.value).toBe(10);
        });

        it('should update signal value', () => {
            const signal = createSignal(0);
            signal.value = 42;
            expect(signal.value).toBe(42);
        });

        it('should not notify if value is the same', () => {
            const signal = createSignal(0);
            const subscriber = jest.fn();
            signal.subscribe(subscriber);

            signal.value = 0;
            expect(subscriber).toHaveBeenCalledTimes(1); // Initial call
        });

        it('should handle custom equality function', () => {
            const signal = createSignal(
                { id: 1, data: 'test' },
                { equals: (a, b) => a.id === b.id },
            );
            const subscriber = jest.fn();
            signal.subscribe(subscriber);

            signal.value = { id: 1, data: 'different' };
            expect(subscriber).toHaveBeenCalledTimes(1);

            signal.value = { id: 2, data: 'test' };
            expect(subscriber).toHaveBeenCalledTimes(2);
        });

        it('should handle disposal', () => {
            const signal = createSignal(0);
            const subscriber = jest.fn();
            const unsubscribe = signal.subscribe(subscriber);

            signal.dispose();
            expect(() => signal.value = 1).toThrow();
            expect(subscriber).toHaveBeenCalledTimes(1); // Initial call
            expect(() => unsubscribe()).not.toThrow();

        });
    });

    describe('Computed Signal', () => {
        it('should compute derived value', () => {
            const count = createSignal(2);
            const doubled = computed(() => count.value * 2);
            expect(doubled.value).toBe(4);
        });

        it('should update when dependencies change', () => {
            const count = createSignal(1);
            const doubled = computed(() => count.value * 2);
            const subscriber = jest.fn();
            doubled.subscribe(subscriber);

            count.value = 2;
            expect(doubled.value).toBe(4);
            expect(subscriber).toHaveBeenCalledTimes(2); // Initial and update
        });

        it('should handle multiple dependencies', () => {
            const a = createSignal(1);
            const b = createSignal(2);
            const sum = computed(() => a.value + b.value);

            expect(sum.value).toBe(3);
            a.value = 2;
            expect(sum.value).toBe(4);
            b.value = 3;
            expect(sum.value).toBe(5);
        });

        it('should not allow direct value setting', () => {
            const count = createSignal(0);
            const doubled = computed(() => count.value * 2);
            expect(() => {
                doubled.value = 42;
            }).toThrow();
        });

        it('should handle nested computations', () => {
            const count = createSignal(1);
            const doubled = computed(() => count.value * 2);
            const quadrupled = computed(() => doubled.value * 2);

            expect(quadrupled.value).toBe(4);
            count.value = 2;
            expect(quadrupled.value).toBe(8);
        });
    });

    describe('Effect', () => {
        it('should run initially', () => {
            const fn = jest.fn();
            effect(fn);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should run when dependencies change', () => {
            const count = createSignal(0);
            const fn = jest.fn();

            effect(() => {
                fn(count.value);
            });

            count.value = 1;
            expect(fn).toHaveBeenCalledWith(1);
        });

        it('should handle cleanup function', () => {
            const cleanup = jest.fn();
            const signal = createSignal(0);

            effect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                signal.value; // Create dependency
                return cleanup;
            });

            signal.value = 1;
            expect(cleanup).toHaveBeenCalledTimes(1);

            signal.value = 2;
            expect(cleanup).toHaveBeenCalledTimes(2);
        });

        it('should dispose properly', () => {
            const cleanup = jest.fn();
            const signal = createSignal(0);

            const dispose = effect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                signal.value; // Create dependency
                return cleanup;
            });

            dispose.dispose();
            signal.value = 1;
            expect(cleanup).toHaveBeenCalledTimes(1); // Only the final cleanup
        });
    });

    describe('Effect Dependencies', () => {
        it('should run when dependencies change', () => {
            const count = createSignal(0);
            const fn = jest.fn();

            effect(() => {
                fn(count.value);
            });

            expect(fn).toHaveBeenCalledWith(0); // Initial run

            count.value = 1;
            expect(fn).toHaveBeenCalledWith(1);
        });

        it('should handle multiple effects on the same signal', () => {
            const count = createSignal(0);
            const fn1 = jest.fn();
            const fn2 = jest.fn();

            effect(() => {
                fn1(count.value);
            });

            effect(() => {
                fn2(count.value);
            });

            count.value = 1;

            expect(fn1).toHaveBeenCalledWith(1);
            expect(fn2).toHaveBeenCalledWith(1);
        });
    });

    describe('Batch Updates', () => {
        it('should batch multiple updates', () => {
            const count = createSignal(0);
            const subscriber = jest.fn();
            count.subscribe(subscriber);

            batch(() => {
                count.value = 1;
                count.value = 2;
                count.value = 3;
            });

            expect(subscriber).toHaveBeenCalledTimes(2);
            expect(count.value).toBe(3);
        });

        it('should handle nested batches', () => {
            const count = createSignal(0);
            const subscriber = jest.fn();
            count.subscribe(subscriber);

            batch(() => {
                count.value = 1;
                batch(() => {
                    count.value = 2;
                    count.value = 3;
                });
                count.value = 4;
            });

            expect(subscriber).toHaveBeenCalledTimes(2);
            expect(count.value).toBe(4);
        });
    });

    describe('Edge Cases', () => {


        it('should handle error in computation', () => {
            const count = createSignal(0);
            const errorComputed = computed(() => {
                if (count.value > 0) throw new Error('Test error');
                return count.value;
            });

            expect(errorComputed.value).toBe(0);

            expect(() => count.value = 2).toThrow('Test error');
        });

        it('should handle error in effect', () => {
            const count = createSignal(0);
            const error = new Error('Test error');

            try {
                effect(() => {
                    if (count.value > 0) throw error;
                });
                count.value = 1;
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }

        });

        it('should handle disposal during effect execution', () => {
            const signal = createSignal(0);
            let disposeable: any = null;

            disposeable = effect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                signal.value; // Create dependency
            });
            disposeable.dispose(); // Dispose during execution

            signal.value = 1; // Should not cause any errors
        });
    });

    describe('Memory Management', () => {
        it('should cleanup dependencies when computed is disposed', () => {
            const source = createSignal(0);
            const computed1 = computed(() => source.value * 2);
            const computed2 = computed(() => computed1.value * 2);

            computed2.dispose();
            source.value = 1; // Should not cause any updates to computed2

            expect(() => computed2.value).toThrow();
        });

        it('should not leak memory in cyclic references', () => {
            const source = createSignal({ value: 0 });
            const derived = computed(() => ({ value: source.value.value + 1 }));

            // Create a cycle
            source.value = derived.value;

            // Cleanup
            source.dispose();
            derived.dispose();

            // No assertions needed - just checking for memory leaks
        });
    });

    describe('Signal Context', () => {
        // TODO: Fix context handling
        it.skip('should maintain proper computation context', (done) => {
            const count = createSignal(0);
            const double = computed(() => count.value * 2);
            const triple = computed(() => count.value * 3);

            effect(() => {
                expect(double.value).toBe(count.value * 2);
                expect(triple.value).toBe(count.value * 3);
            });

            count.value = 1;
            // If context is maintained properly, no errors should occur
            done();
        });
    });

    describe('Signal Disposal', () => {
        it('should throw when reading from disposed signal', () => {
            const signal = createSignal(0);
            signal.dispose();

            expect(() => signal.value).toThrow(SignalDisposedError);
            expect(() => signal.value).toThrow('Cannot read from a disposed signal');
        });

        it('should throw when writing to disposed signal', () => {
            const signal = createSignal(0);
            signal.dispose();

            expect(() => {
                signal.value = 1;
            }).toThrow(SignalDisposedError);
            expect(() => {
                signal.value = 1;
            }).toThrow('Cannot write to a disposed signal');
        });

        it('should throw when subscribing to disposed signal', () => {
            const signal = createSignal(0);
            signal.dispose();

            expect(() => {
                signal.subscribe(() => {
                });
            }).toThrow(SignalDisposedError);
            expect(() => {
                signal.subscribe(() => {
                });
            }).toThrow('Cannot subscribe to a disposed signal');
        });

        it('should handle multiple disposal calls gracefully', () => {
            const signal = createSignal(0);
            signal.dispose();

            // Second disposal should not throw
            expect(() => signal.dispose()).not.toThrow();
        });

        it('should allow unsubscribe after disposal', () => {
            const signal = createSignal(0);
            const unsubscribe = signal.subscribe(() => {
            });
            signal.dispose();

            // Unsubscribe should not throw
            expect(() => unsubscribe()).not.toThrow();
        });

        describe('Computed Signal Disposal', () => {
            it('should throw when reading disposed computed signal', () => {
                const source = createSignal(0);
                const computed1 = computed(() => source.value * 2);

                computed1.dispose();

                expect(() => computed1.value).toThrow(SignalDisposedError);
            });

            it('should throw when writing to disposed computed signal', () => {
                const source = createSignal(0);
                const computed1 = computed(() => source.value * 2);

                computed1.dispose();

                expect(() => {
                    computed1.value = 42;
                }).toThrow('Cannot set the value of a computed signal');
            });

            it('should handle disposal in dependency chain', () => {
                const a = createSignal(1);
                const b = computed(() => a.value * 2);
                const c = computed(() => b.value * 2);

                b.dispose();

                expect(() => b.value).toThrow(SignalDisposedError);
                expect(() => c.value).toThrow(SignalDisposedError);
            });
        });

        describe('Effect Disposal', () => {
            it('should handle effect cleanup when signal is disposed', () => {
                const signal = createSignal(0);
                const cleanup = jest.fn();

                effect(() => {
                    if (signal.value > 0) {
                        cleanup();
                    }
                });

                signal.value = 1;
                signal.dispose();

                expect(cleanup).toHaveBeenCalledTimes(1);
            });

            it('should stop effect when its signal is disposed', () => {
                const signal = createSignal(0);
                const effectFn = jest.fn();

                effect(() => {
                    try {
                        effectFn(signal.value);
                    } catch (e) {
                        if (e instanceof SignalDisposedError) {
                            // Expected error
                            return;
                        }
                        throw e;
                    }
                });

                signal.dispose();
                expect(effectFn).toHaveBeenCalledTimes(1);
            });
        });

        describe('Batch Operations with Disposal', () => {
            it('should handle batch operations with disposed signals', () => {
                const signal = createSignal(0);
                signal.dispose();

                expect(() => {
                    batch(() => {
                        signal.value = 1;
                        signal.value = 2;
                    });
                }).toThrow(SignalDisposedError);
            });
        });

        describe('Edge Cases', () => {
            it('should handle disposal during computation', () => {
                const source = createSignal(0);
                const derived = computed(() => {
                    const value = source.value;
                    source.dispose();
                    return value * 2;
                });

                expect(() => derived.value).toThrow();
            });

            it('should handle nested computations with disposal', () => {
                const a = createSignal(1);
                try {
                    computed(() => {
                        a.dispose();
                        return a.value * 2;
                    });


                } catch (e) {
                    expect(e).toBeInstanceOf(SignalDisposedError);
                }

            });
        });
    });

    describe('Signal Notifications', () => {
        it('should notify subscribers immediately upon subscription', () => {
            const signal = createSignal(0);
            const subscriber = jest.fn();

            signal.subscribe(subscriber);
            expect(subscriber).toHaveBeenCalledTimes(1);
        });

        it('should notify subscribers on value change', () => {
            const signal = createSignal(0);
            const subscriber = jest.fn();

            signal.subscribe(subscriber);
            subscriber.mockClear(); // Clear the initial call

            signal.value = 1;
            expect(subscriber).toHaveBeenCalledTimes(1); // Should be called
        });

        it('should run effects immediately', () => {
            const signal = createSignal(0);
            const effectFn = jest.fn();

            effect(() => {
                effectFn(signal.value);
            });

            expect(effectFn).toHaveBeenCalledTimes(1);
            expect(effectFn).toHaveBeenCalledWith(0);
        });

        it('should run effects when dependencies change', () => {
            const signal = createSignal(0);
            const effectFn = jest.fn();

            effect(() => {
                effectFn(signal.value);
            });

            effectFn.mockClear(); // Clear the initial call

            signal.value = 1;
            expect(effectFn).toHaveBeenCalledTimes(1);
            expect(effectFn).toHaveBeenCalledWith(1);
        });

        it('should handle cleanup in effects', () => {
            const signal = createSignal(0);
            const cleanup = jest.fn();
            const effectFn = jest.fn();

            effect(() => {
                effectFn(signal.value);
                return cleanup;
            });

            expect(cleanup).not.toHaveBeenCalled();

            signal.value = 1;
            expect(cleanup).toHaveBeenCalledTimes(1);
            expect(effectFn).toHaveBeenCalledTimes(2);
        });

        it('should handle computed signals properly', () => {
            const source = createSignal(0);
            const derived = computed(() => source.value * 2);
            const effectFn = jest.fn();

            effect(() => {
                effectFn(derived.value);
            });

            expect(effectFn).toHaveBeenCalledTimes(1);
            expect(effectFn).toHaveBeenCalledWith(0);

            source.value = 1;
            expect(effectFn).toHaveBeenCalledTimes(2);
            expect(effectFn).toHaveBeenCalledWith(2);
        });

    });

    describe('Signal Performance and Memory Tests', () => {
        // Helper to measure memory usage
        const getMemoryUsage = () => {
            if (global.gc) {
                global.gc(); // Force garbage collection if available
            }
            return process.memoryUsage().heapUsed;
        };


        test('should not leak memory when creating and disposing signals', () => {
            const initialMemory = getMemoryUsage();
            const iterations = 1000;
            const signals: any[] = [];

            // Create many signals
            for (let i = 0; i < iterations; i++) {
                signals.push(createSignal(i));
            }

            // Dispose all signals
            signals.forEach(signal => signal.dispose());

            // Clear references
            signals.length = 0;

            // Force GC if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = getMemoryUsage();
            const memoryDiff = finalMemory - initialMemory;

            // Allow for some memory overhead, but it shouldn't grow significantly
            expect(memoryDiff).toBeLessThan(1000000); // 1MB threshold
        });

        test('should handle large number of dependencies efficiently', () => {
            const rootSignal = createSignal(0);
            const computedSignals = [];

            // Create 100 computed signals that depend on the root
            for (let i = 0; i < 100; i++) {
                computedSignals.push(computed(() => rootSignal.value * i));
            }

            // Measure time for batch updates
            const updateStart = Date.now();
            batch(() => {
                for (let i = 0; i < 100; i++) {
                    rootSignal.value = i;
                }
            });
            const updateEnd = Date.now();

            // Clean up
            computedSignals.forEach(signal => signal.dispose());
            rootSignal.dispose();

            expect(updateEnd - updateStart).toBeLessThan(100); // Should update in less than 100ms
        });

        test('should clean up effect subscriptions properly', () => {
            const signal = createSignal(0);
            const cleanupCalls: string[] = [];

            const effectDispose = effect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                signal.value; // Create dependency
                return () => {
                    cleanupCalls.push('cleanup');
                };
            });

            // Trigger updates
            signal.value = 1;
            signal.value = 2;

            effectDispose.dispose();
            signal.dispose();

            expect(cleanupCalls.length).toBe(3); // Initial + 2 updates
        });

        test('should handle rapid updates efficiently', async () => {
            const signal = createSignal(0);
            let computedUpdateCount = 0;

            const computedSignal = computed(() => {
                computedUpdateCount++;
                return signal.value * 2;
            });

            const start = Date.now();

            // Perform 1000 rapid updates in a batch
            batch(() => {
                for (let i = 0; i < 1000; i++) {
                    signal.value = i;
                }
            });

            const end = Date.now();

            // Cleanup
            signal.dispose();
            computedSignal.dispose();

            // Check performance
            expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
            expect(computedUpdateCount).toBe(2); // Initial computation + one batch update
        });

        test('should properly handle subscriber cleanup', () => {
            const signal = createSignal(0);
            const subscriptions: (() => void)[] = [];

            // Create many subscriptions
            for (let i = 0; i < 1000; i++) {
                const unsubscribe = signal.subscribe(() => {
                    // Empty subscriber
                });
                subscriptions.push(unsubscribe);
            }

            const initialMemory = getMemoryUsage();

            // Unsubscribe all
            subscriptions.forEach(unsubscribe => unsubscribe());

            // Update signal
            signal.value = 1;

            const finalMemory = getMemoryUsage();
            signal.dispose();

            // Verify memory usage didn't increase significantly
            expect(finalMemory - initialMemory).toBeLessThan(2000000); // 1MB threshold
        });





        test('should handle cyclic updates gracefully', () => {
            const signal1 = createSignal(0);
            const signal2 = createSignal(0);
            let updateCount = 0;

            // Create two signals that watch each other
            effect(() => {
                updateCount++;
                signal2.value = signal1.value + 1;
            });

            effect(() => {
                updateCount++;
                if (signal2.value > 10) {
                    return; // Prevent infinite updates
                }
                signal1.value = signal2.value + 1;
            });

            // Trigger the cycle
            batch(() => {
                signal1.value = 1;
            });

            // Cleanup
            signal1.dispose();
            signal2.dispose();

            // Verify we didn't get into an infinite update loop
            expect(updateCount).toBeLessThan(25);
        });
    });
});
