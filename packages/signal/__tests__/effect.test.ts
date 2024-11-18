import { batch, effect, resetSignalSystem, Signal, SignalDisposedError } from '../src';


describe('Effect', () => {
    // Reset any shared state before each test
    beforeEach(() => {
        // Reset SignalContext singleton if needed
        resetSignalSystem();
    });

    describe('Basic Functionality', () => {
        test('should execute effect immediately upon creation', () => {
            const mockFn = jest.fn();
            effect(mockFn);
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test('should track signal dependencies', () => {
            const count = new Signal(0);
            const mockFn = jest.fn();

            effect(() => {
                mockFn(count.value);
            });

            expect(mockFn).toHaveBeenCalledWith(0);

            count.value = 1;
            expect(mockFn).toHaveBeenCalledWith(1);
            expect(mockFn).toHaveBeenCalledTimes(2);
        });

        test('should handle multiple signal dependencies', () => {
            const firstName = new Signal('John');
            const lastName = new Signal('Doe');
            const mockFn = jest.fn();

            effect(() => {
                mockFn(`${firstName.value} ${lastName.value}`);
            });

            expect(mockFn).toHaveBeenCalledWith('John Doe');

            firstName.value = 'Jane';
            expect(mockFn).toHaveBeenCalledWith('Jane Doe');

            lastName.value = 'Smith';
            expect(mockFn).toHaveBeenCalledWith('Jane Smith');

            expect(mockFn).toHaveBeenCalledTimes(3);
        });
    });

    describe('Cleanup Function', () => {
        test('should call cleanup function when dependencies change', () => {
            const count = new Signal(0);
            const cleanup = jest.fn();

            effect(() => {
                // @ts-ignore
                const value = count.value; // Track dependency
                return cleanup;
            });

            expect(cleanup).not.toHaveBeenCalled();

            count.value = 1;
            expect(cleanup).toHaveBeenCalledTimes(1);

            count.value = 2;
            expect(cleanup).toHaveBeenCalledTimes(2);
        });

        test('should call cleanup function on disposal', () => {
            const cleanup = jest.fn();
            const disposable = effect(() => cleanup);

            expect(cleanup).not.toHaveBeenCalled();
            disposable.dispose();
            expect(cleanup).toHaveBeenCalledTimes(1);
        });

        test('should handle errors in cleanup function', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const count = new Signal(0);

            const disposable = effect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                count.value; // Track dependency
                return () => {
                    throw new Error('Cleanup error');
                };
            });

            count.value = 1; // Trigger cleanup
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in effect cleanup:',
                expect.any(Error),
            );

            disposable.dispose();
            consoleSpy.mockRestore();
        });
    });

    describe('Error Handling', () => {
        test('should handle errors in effect function', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const count = new Signal(0);

            effect(() => {
                if (count.value > 0) {
                    throw new Error('Effect error');
                }
            });

            expect(() => {
                count.value = 1;
            }).toThrow('Effect error');

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in effect:',
                expect.any(Error),
            );

            consoleSpy.mockRestore();
        });

        test('should continue tracking after recovered error', () => {
            const count = new Signal(0);
            const mockFn = jest.fn();

            effect(() => {
                try {
                    if (count.value === 1) {
                        throw new Error('Temporary error');
                    }
                    mockFn(count.value);
                } catch (error) {
                    // Handle error
                }
            });

            expect(mockFn).toHaveBeenCalledWith(0);

            count.value = 1; // Triggers error
            count.value = 2; // Should recover

            expect(mockFn).toHaveBeenCalledWith(2);
        });
    });

    describe('Disposal', () => {
        test('should not rerun effect after disposal', () => {
            const count = new Signal(0);
            const mockFn = jest.fn();

            const disposable = effect(() => {
                mockFn(count.value);
            });

            expect(mockFn).toHaveBeenCalledWith(0);

            disposable.dispose();
            count.value = 1;

            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test('should be safe to dispose multiple times', () => {
            const disposable = effect(() => {
            });

            disposable.dispose();
            expect(() => disposable.dispose()).not.toThrow();
        });

        test('should cleanup all signal subscriptions on disposal', () => {
            const count = new Signal(0);
            const mockFn = jest.fn();

            const disposable = effect(() => {
                mockFn(count.value);
            });

            disposable.dispose();

            // Implementation specific: check if signal's dependents are cleaned up
            expect((count as any).dependents.size).toBe(0);
        });
    });

    describe('Context Handling', () => {
        test('should handle nested effects', () => {
            const outer = new Signal(0);
            const inner = new Signal(0);
            const mockFn = jest.fn();

            effect(() => {
                const outerValue = outer.value;
                effect(() => {
                    mockFn(outerValue, inner.value);
                });
            });

            expect(mockFn).toHaveBeenCalledWith(0, 0);

            outer.value = 1;
            expect(mockFn).toHaveBeenCalledWith(1, 0);

            inner.value = 1;
            expect(mockFn).toHaveBeenCalledWith(1, 1);
        });

        // TODO fix batch updates
        test('should handle batch updates', () => {
            const count1 = new Signal(0);
            const count2 = new Signal(0);
            const mockFn = jest.fn();

            effect(() => {
                mockFn(count1.value, count2.value);
            });

            expect(mockFn).toHaveBeenCalledWith(0, 0);

            batch(() => {
                count1.value = 1;
                count2.value = 1;
            });


            expect(mockFn).toHaveBeenCalledWith(1, 1);
            expect(mockFn).toHaveBeenCalledTimes(2); // Initial + batch
        });
    });

    describe('Memory Management', () => {
        test('should not leak memory when signals are disposed', () => {
            const count = new Signal(0);
            const mockFn = jest.fn();

            effect(() => {
                mockFn(count.value);
            });

            count.dispose();

            // Verify cleanup
            expect((count as any).dependents.size).toBe(0);
        });

        test('should handle signal disposal during effect', () => {
            const count = new Signal(0);
            const mockFn = jest.fn();

            effect(() => {
                mockFn(count.value);
                count.dispose();
            });

            expect(mockFn).toHaveBeenCalledWith(0);
            expect(() => count.value).toThrow(SignalDisposedError);
        });
    });

    describe('Debug Support', () => {
        test('should support named effects', () => {
            const mockFn = jest.fn();
            const effectName = 'TestEffect';

            const dispose = effect(() => {
                mockFn();
            }, effectName);

            // Implementation specific: check if name is stored
            expect((dispose as any).computation.name).toBe(effectName);
        });
    });
});
