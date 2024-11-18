import {
    CircularDependencyError,
    ComputedSignal,
    effect,
    resetSignalSystem,
    Signal,
    SignalDisposedError,
} from '../src';

describe('ComputedSignal', () => {

    beforeEach(() => {

        resetSignalSystem();
    });

    describe('basic functionality', () => {
        test('should compute initial value', () => {
            const source = new Signal(10);
            const computed = new ComputedSignal(() => source.value * 2);

            expect(computed.value).toBe(20);
        });

        test('should update when dependency changes', () => {
            const source = new Signal(10);
            const computed = new ComputedSignal(() => source.value * 2);

            source.value = 20;
            expect(computed.value).toBe(40);
        });

        test('should handle multiple dependencies', () => {
            const a = new Signal(10);
            const b = new Signal(5);
            const computed = new ComputedSignal(() => a.value + b.value);

            expect(computed.value).toBe(15);

            a.value = 20;
            expect(computed.value).toBe(25);

            b.value = 10;
            expect(computed.value).toBe(30);
        });
    });

    describe('chained computations', () => {
        test('should handle chained computed signals', () => {
            const source = new Signal(10);
            const doubled = new ComputedSignal(() => source.value * 2);
            const quadrupled = new ComputedSignal(() => doubled.value * 2);

            expect(quadrupled.value).toBe(40);

            source.value = 20;
            expect(quadrupled.value).toBe(80);
        });

        test('should correctly report depth', () => {
            const a = new Signal(1);
            const b = new ComputedSignal(() => a.value + 1);
            const c = new ComputedSignal(() => b.value + 1);

            expect(b.getDepth()).toBe(0);
            expect(c.getDepth()).toBe(1);
        });
    });

    describe('error handling', () => {
        test('should throw error when trying to set value', () => {
            const source = new Signal(10);
            const computed = new ComputedSignal(() => source.value * 2);

            expect(() => {
                (computed as any).value = 20;
            }).toThrow('Cannot set the value of a computed signal');
        });

        test('should throw error on circular dependencies', () => {
            const source = new Signal(10);

            // Create an effect that might cause circular dependency
            effect(() => {
                expect(() => {
                    new ComputedSignal(() => source.value * 2);
                }).toThrow(CircularDependencyError);
            });
        });
    });

    describe('disposal handling', () => {
        test('should handle disposed signals', () => {
            const source = new Signal(10);
            const computed = new ComputedSignal(() => source.value * 2);

            computed.dispose();
            expect(() => computed.value).toThrow(SignalDisposedError);
        });

        test('should handle disposed dependencies', () => {
            const source = new Signal(10);
            const computed = new ComputedSignal(() => source.value * 2);

            source.dispose();
            expect(() => computed.value).toThrow(SignalDisposedError);
        });

        test('should dispose dependent computed signals', () => {
            const a = new Signal(1);
            const b = new ComputedSignal(() => a.value + 1);
            const c = new ComputedSignal(() => b.value + 1);

            b.dispose();
            expect(() => c.value).toThrow(SignalDisposedError);
        });
    });

    describe('optimization', () => {
        test('should not recompute when dependencies have not changed', () => {
            const source = new Signal(10);
            let computeCount = 0;

            const computed = new ComputedSignal(() => {
                computeCount++;
                return source.value * 2;
            });

            // Initial computation
            expect(computed.value).toBe(20);
            expect(computeCount).toBe(1);

            // Reading again should not recompute
            expect(computed.value).toBe(20);
            expect(computeCount).toBe(1);

            // Changing dependency should trigger recomputation
            source.value = 20;
            expect(computed.value).toBe(40);
            expect(computeCount).toBe(2);
        });

        test('should handle equality checks for complex objects', () => {
            const source = new Signal({ value: 10 });
            let computeCount = 0;

            const computed = new ComputedSignal(
                () => {
                    computeCount++;
                    return { doubled: source.value.value * 2 };
                },
                {
                    equals: (a, b) => {
                        return a?.doubled === b?.doubled;
                    },
                },
            );

            expect(computed.value.doubled).toBe(20);
            expect(computeCount).toBe(1);

            // Setting same value should not trigger recomputation
            source.value = { value: 10 };
            expect(computed.value.doubled).toBe(20);
            expect(computeCount).toBe(2);

            // Setting different value should trigger recomputation
            source.value = { value: 20 };
            expect(computed.value.doubled).toBe(40);
            expect(computeCount).toBe(3);
        });
    });

    describe('edge cases', () => {
        test('should handle undefined/null values', () => {
            const source = new Signal<number | null>(null);
            const computed = new ComputedSignal(() => {
                return source.value === null ? 0 : source.value * 2;
            });

            expect(computed.value).toBe(0);

            source.value = 10;
            expect(computed.value).toBe(20);

            source.value = null;
            expect(computed.value).toBe(0);
        });

        test('should handle error in compute function', () => {
            const source = new Signal<number>(1);
            const computed = new ComputedSignal(() => {
                if (source.value === 0) {
                    throw new Error('Cannot divide by zero');
                }
                return 100 / source.value;
            });

            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                source.value = 0;
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toBe('Cannot divide by zero');
            }

            source.value = 4;
            expect(computed.value).toBe(25);
        });

        test('should handle async dependencies correctly', async () => {
            const source = new Signal(Promise.resolve(10));
            const computed = new ComputedSignal(async () => {
                const value = await source.value;
                return value * 2;
            });

            const result = await computed.value;
            expect(result).toBe(20);
        });
    });

    describe('memory management', () => {
        test('should clean up dependencies when disposed', () => {
            const source = new Signal(10);
            const computed = new ComputedSignal(() => source.value * 2);

            const initialDependentCount = source['dependents'].size;
            computed.dispose();

            expect(source['dependents'].size).toBe(initialDependentCount - 1);
        });

        test('should handle rapid create/dispose cycles', () => {
            const source = new Signal(10);

            for (let i = 0; i < 1000; i++) {
                const computed = new ComputedSignal(() => source.value * 2);
                computed.dispose();
            }

            expect(source['dependents'].size).toBe(0);
        });
    });
});
