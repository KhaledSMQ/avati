import { computed, effect, peek, Signal, SignalContext } from '../src';

describe('peek', () => {
    // Reset signal context between tests
    beforeEach(() => {
        // @ts-ignore - accessing private property for testing
        SignalContext.instance = new SignalContext();
    });

    it('should return the current value of a signal', () => {
        const signal = new Signal(42);
        expect(peek(signal)).toBe(42);
    });

    it('should not establish a dependency when reading a signal value', () => {
        const signal = new Signal(42);
        let computationRunCount = 0;

        const derived = computed(() => {
            computationRunCount++;
            // Use peek to read the signal value
            return peek(signal);
        });

        // Initial computation
        expect(derived.value).toBe(42);
        expect(computationRunCount).toBe(1);

        // Update signal
        signal.value = 100;

        // Should not trigger recomputation since we used peek
        expect(computationRunCount).toBe(1);
        expect(derived.value).toBe(42); // Still has old value
    });

    it('should work correctly within nested computations', () => {
        const outer = new Signal(1);
        const inner = new Signal(2);
        let outerComputationCount = 0;
        let innerComputationCount = 0;

        const nested = computed(() => {
            outerComputationCount++;
            return computed(() => {
                innerComputationCount++;
                // Peek at outer, normal dependency on inner
                return peek(outer) + inner.value;
            });
        });

        // Initial computation
        // 1. Accesses nested.value - runs outer computation (count: 1)
        // 2. Accesses .value of the returned computed - runs inner computation (count: 1)
        expect(nested.value.value).toBe(3);  // 1 + 2
        expect(outerComputationCount).toBe(1);
        expect(innerComputationCount).toBe(1);

        // Update inner
        inner.value = 20;
        // When we access nested.value.value:
        // 1. Access nested.value - runs outer computation (count: 2)
        // 2. Creates new inner computed
        // 3. Access .value of new inner computed - runs inner computation (count: 2)
        // 4. Inner signal changed, triggers recomputation (count: 3)
        // 5. Accessing value triggers another computation (count: 4)
        expect(nested.value.value).toBe(21);  // 1 + 20
        expect(outerComputationCount).toBe(2);
        expect(innerComputationCount).toBe(4);
    });

    it('should work correctly within nested computations 2', () => {
        const outer = new Signal(1);
        const inner = new Signal(2);
        let outerComputationCount = 0;
        let innerComputationCount = 0;

        const nested = computed(() => {
            outerComputationCount++;
            return computed(() => {
                innerComputationCount++;
                return peek(outer) + inner.value;
            });
        });

        // Initial computation
        expect(nested.value.value).toBe(3);  // 1 + 2
        expect(outerComputationCount).toBe(1);
        expect(innerComputationCount).toBe(1);

        // Update inner
        inner.value = 20;
        const result = nested.value.value;  // Capture to avoid extra computations
        expect(result).toBe(21);  // 1 + 20
        expect(outerComputationCount).toBe(2);
        expect(innerComputationCount).toBe(4);
    });

    it('should work correctly with effects', () => {
        const signal = new Signal(0);
        let effectRunCount = 0;

        effect(() => {
            // Peek at signal value
            peek(signal);
            effectRunCount++;
        });

        expect(effectRunCount).toBe(1);

        // Update signal
        signal.value = 1;
        expect(effectRunCount).toBe(1); // Effect should not run again
    });

    it('should maintain correct computation stack even if signal read throws', () => {
        const throwingSignal = new Signal<number>(0);
        Object.defineProperty(throwingSignal, 'value', {
            get: () => {
                throw new Error('Signal read error');
            },
        });

        const normalSignal = new Signal(42);
        let computationRunCount = 0;

        const computed1 = computed(() => {
            computationRunCount++;
            try {
                peek(throwingSignal);
            } catch {
                // Ignore error
            }
            return normalSignal.value; // Should still track this dependency
        });

        expect(() => computed1.value).not.toThrow();
        expect(computationRunCount).toBe(1);

        normalSignal.value = 100;
        expect(computationRunCount).toBe(2); // Should still react to changes
    });

    it('should work with batch updates', () => {
        const signal1 = new Signal(1);
        const signal2 = new Signal(2);
        let computationCount = 0;

        const derived = computed(() => {
            computationCount++;
            return peek(signal1) + signal2.value;
        });

        expect(derived.value).toBe(3);
        expect(computationCount).toBe(1);

        const context = SignalContext.getInstance();
        context.beginBatch();
        signal1.value = 10;
        signal2.value = 20;
        context.endBatch();

        expect(derived.value).toBe(30);
        expect(computationCount).toBe(2); // Only recomputed once due to signal2 change
    });

    it('should demonstrate peek reading current values on recomputation', () => {
        const signal = new Signal(1);
        const trackedSignal = new Signal(2);
        const values: number[] = [];
        let computationCount = 0;

        const computed1 = computed(() => {
            computationCount++;
            const peekedValue = peek(signal);
            values.push(peekedValue);  // Track what value peek reads each time
            return peekedValue + trackedSignal.value;
        });

        // Initial computation
        expect(computed1.value).toBe(3);  // 1 + 2
        expect(values).toEqual([1]);
        expect(computationCount).toBe(1);

        // Update signal
        signal.value = 10;
        expect(computed1.value).toBe(3);  // No recomputation
        expect(values).toEqual([1]);
        expect(computationCount).toBe(1);

        // Update tracked signal
        trackedSignal.value = 20;
        expect(computed1.value).toBe(30);  // 10 + 20
        expect(values).toEqual([1, 10]);  // Shows peek read the new value
        expect(computationCount).toBe(2);
    });

    it('should handle nested peek calls correctly', () => {
        const signal1 = new Signal(1);
        const signal2 = new Signal(2);
        const signal3 = new Signal(3);
        let computationCount = 0;

        const derived = computed(() => {
            computationCount++;
            const value1 = peek(signal1);  // Will always be the current value at computation time
            const value2 = peek(signal2);  // Will always be the current value at computation time
            return value1 + value2 + signal3.value; // Only signal3 creates dependency
        });

        // Initial computation: 1 + 2 + 3 = 6
        expect(derived.value).toBe(6);
        expect(computationCount).toBe(1);

        // Update signal1 and signal2, but derived won't recompute
        signal1.value = 10;
        signal2.value = 20;
        expect(derived.value).toBe(6);  // Still 1 + 2 + 3 because peek values haven't been recomputed
        expect(computationCount).toBe(1);

        // Update signal3, derived will recompute
        signal3.value = 30;
        expect(computationCount).toBe(2);
        expect(derived.value).toBe(60);  // Now 10 + 20 + 30 because signal3 change triggered recomputation
    });


    it('should work with disposed signals', () => {
        const signal = new Signal(42);
        const value = peek(signal);
        expect(value).toBe(42);

        signal.dispose();
        expect(() => peek(signal)).toThrow(); // Should throw SignalDisposedError
    });
});
