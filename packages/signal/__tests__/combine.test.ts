import { batch, combine, computed, Signal, SignalDisposedError } from '../src';


describe('combine function', () => {
    // Helper to create multiple signals for testing
    const createTestSignals = () => ({
        stringSignal: new Signal<string>('test', { name: 'stringSignal' }),
        numberSignal: new Signal<number>(42, { name: 'numberSignal' }),
        booleanSignal: new Signal<boolean>(true, { name: 'booleanSignal' }),
    });

    it('should combine multiple signals into a single signal', () => {
        const { stringSignal, numberSignal, booleanSignal } = createTestSignals();

        const combined = combine([stringSignal, numberSignal, booleanSignal]);

        expect(combined.value).toEqual(['test', 42, true]);
    });

    it('should update when any input signal changes', () => {
        const { stringSignal, numberSignal, booleanSignal } = createTestSignals();

        const combined = combine([stringSignal, numberSignal, booleanSignal]);
        let updateCount = 0;

        // Track updates
        combined.subscribe(() => {
            updateCount++;
        });

        // Modify each signal and verify updates
        stringSignal.value = 'new value';
        expect(combined.value).toEqual(['new value', 42, true]);

        numberSignal.value = 100;
        expect(combined.value).toEqual(['new value', 100, true]);

        booleanSignal.value = false;
        expect(combined.value).toEqual(['new value', 100, false]);

        // Should have updated three times
        expect(updateCount).toBe(4);
    });

    it('should handle empty array of signals', () => {
        const combined = combine([]);
        expect(combined.value).toEqual([]);
    });

    it('should respect custom equality function', () => {
        const sig1 = new Signal<number[]>([1, 2, 3]);
        const sig2 = new Signal<string[]>(['a', 'b']);

        let updateCount = 0;

        const combined = combine([sig1, sig2], {
            equals: (prev, next) => {
                if (prev == next) return true;
                if (!prev || !next) return false;

                // Custom equality: only care about array lengths
                return prev.every((arr, idx) => arr.length === next[idx].length);
            },
        });

        combined.subscribe(() => {
            updateCount++;
        });

        // Should not trigger update (same lengths)
        sig1.value = [4, 5, 3];
        expect(updateCount).toBe(1); // Only 1 because sig2 didn't change

        // Should trigger update (different length)
        sig1.value = [1, 2];
        expect(updateCount).toBe(2); // Now it should update
    });

    it('should handle signals of different types', () => {
        const numberSignal = new Signal<number>(1);
        const stringSignal = new Signal<string>('hello');
        const objectSignal = new Signal<{ id: number }>({ id: 1 });
        const arraySignal = new Signal<number[]>([1, 2, 3]);

        const combined = combine([
            numberSignal,
            stringSignal,
            objectSignal,
            arraySignal,
        ]);

        expect(combined.value).toEqual([
            1,
            'hello',
            { id: 1 },
            [1, 2, 3],
        ]);
    });

    it('should handle null and undefined values', () => {
        const sig1 = new Signal<null>(null);
        const sig2 = new Signal<undefined>(undefined);

        const combined = combine([sig1, sig2]);

        expect(combined.value).toEqual([null, undefined]);
    });

    it('should properly dispose combined signal', () => {
        const { stringSignal, numberSignal } = createTestSignals();
        const combined = combine([stringSignal, numberSignal]);

        combined.dispose();

        expect(() => combined.value).toThrow(SignalDisposedError);

        // Original signals should still work
        expect(() => stringSignal.value).not.toThrow();
        expect(() => numberSignal.value).not.toThrow();
    });

    it('should handle disposal of input signals', () => {
        const { stringSignal, numberSignal } = createTestSignals();
        const combined = combine([stringSignal, numberSignal]);

        stringSignal.dispose();

        // Combined signal should still work with remaining signals
        expect(() => combined.value).toThrow(); // Should throw because we're trying to access disposed signal

        // Other original signal should still work
        expect(() => numberSignal.value).not.toThrow();
    });

    it('should support batched updates', () => {
        const { stringSignal, numberSignal, booleanSignal } = createTestSignals();
        const combined = combine([stringSignal, numberSignal, booleanSignal]);
        let updateCount = 0;

        combined.subscribe(() => {
            updateCount++;
        });

        // Batch multiple updates
        batch(() => {
            stringSignal.value = 'batch update';
            numberSignal.value = 999;
            booleanSignal.value = false;
        });

        // Should have only updated once despite three changes
        expect(updateCount).toBe(2); // Initial + batch update
        expect(combined.value).toEqual(['batch update', 999, false]);
    });

    it('should work with computed signals', () => {
        const baseSignal = new Signal<number>(5);
        const computedSignal = computed(() => baseSignal.value * 2);

        const combined = combine([baseSignal, computedSignal]);

        expect(combined.value).toEqual([5, 10]);

        baseSignal.value = 10;
        expect(combined.value).toEqual([10, 20]);
    });


});
