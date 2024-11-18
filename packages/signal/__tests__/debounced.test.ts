import { debounced, effect, Signal } from '../src';


describe('debounced', () => {
    // Mock timers for testing
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('initial value matches source signal', () => {
        const source = new Signal('initial');
        const debouncedSignal = debounced(source, 100);
        expect(debouncedSignal.value).toBe('initial');
    });

    test('debounces value updates', () => {
        const source = new Signal('initial');
        const debouncedSignal = debounced(source, 100);

        source.value = 'change1';
        source.value = 'change2';
        source.value = 'change3';

        expect(debouncedSignal.value).toBe('initial');

        jest.advanceTimersByTime(99);
        expect(debouncedSignal.value).toBe('initial');

        jest.advanceTimersByTime(1);
        expect(debouncedSignal.value).toBe('change3');
    });

    test('respects custom equality function', () => {
        const source = new Signal({ id: 1, value: 'test' });
        const debouncedSignal = debounced(source, 100, {
            equals: (a, b) => a.id === b.id,
        });

        source.value = { id: 1, value: 'changed' };
        jest.advanceTimersByTime(100);
        expect(debouncedSignal.value).toEqual({ id: 1, value: 'test' });

        source.value = { id: 2, value: 'changed' };
        jest.advanceTimersByTime(100);
        expect(debouncedSignal.value).toEqual({ id: 2, value: 'changed' });
    });

    test('cancels pending updates when source changes', () => {
        const source = new Signal('initial');
        const debouncedSignal = debounced(source, 100);
        const callback = jest.fn();

        effect(() => {
            callback(debouncedSignal.value);
        });

        callback.mockClear();

        source.value = 'change1';
        jest.advanceTimersByTime(50);
        source.value = 'change2';
        jest.advanceTimersByTime(50);
        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(50);
        expect(callback).toHaveBeenCalledWith('change2');
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('cleanup on effect disposal', () => {
        const source = new Signal('initial');
        const debouncedSignal = debounced(source, 100);
        let cleanup: (() => void) | undefined;

        const effectInstance = effect(() => {
            // @ts-ignore
            const value = source.value;
            cleanup = () => {
                // Effect cleanup
            };
            return cleanup;
        });

        source.value = 'change';
        effectInstance.dispose();

        jest.advanceTimersByTime(100);
        expect(debouncedSignal.value).toBe('change');
    });

    test('handles rapid successive updates', () => {
        const source = new Signal(0);
        const debouncedSignal = debounced(source, 50);
        const updates: number[] = [];

        effect(() => {
            updates.push(debouncedSignal.value);
        });

        updates.length = 0;

        for (let i = 1; i <= 10; i++) {
            source.value = i;
            jest.advanceTimersByTime(45 + i);
        }

        jest.advanceTimersByTime(50);
        expect(updates).toEqual([5, 6, 7, 8, 9, 10]);
    });
});
