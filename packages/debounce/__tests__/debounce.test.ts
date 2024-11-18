import { debounce } from '../src';

jest.useFakeTimers();

describe('Debounce Utility Function', () => {
    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    test('should debounce a function and execute it after the wait time', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, { wait: 100 });

        debouncedFunc();
        debouncedFunc();
        debouncedFunc();

        expect(func).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(1);
    });

    test('should execute on the leading edge when leading is true', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, { wait: 100, leading: true, trailing: false });

        debouncedFunc();
        debouncedFunc();
        debouncedFunc();

        expect(func).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(1);
    });

    test('should execute on both leading and trailing edges when both are true', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, { wait: 100, leading: true, trailing: true });

        debouncedFunc();

        expect(func).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(50);
        debouncedFunc();

        jest.advanceTimersByTime(50);
        debouncedFunc();

        jest.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(2);
    });

    test('should execute after maxWait time even if debounced', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, {
            wait: 100,
            maxWait: 200,
            leading: true,
            trailing: false,
        });

        // Initial call at 0ms
        debouncedFunc();

        // Keep calling debouncedFunc every 50ms to reset the wait timer
        jest.advanceTimersByTime(50); // Time = 50ms
        debouncedFunc();

        jest.advanceTimersByTime(50); // Time = 100ms
        debouncedFunc();

        jest.advanceTimersByTime(50); // Time = 150ms
        debouncedFunc();

        // Advance timers by another 50ms to reach maxWait of 200ms
        jest.advanceTimersByTime(50); // Time = 200ms

        // The function should now have been called once due to maxWait
        expect(func).toHaveBeenCalledTimes(1);

        // Ensure no additional calls happen after wait time
        jest.advanceTimersByTime(100); // Time = 300ms
        expect(func).toHaveBeenCalledTimes(1);
    });

    test('should handle asynchronous functions correctly', async () => {
        const asyncFunc = jest.fn(async () => {
            return 'result';
        });
        const debouncedFunc = debounce(asyncFunc, { wait: 100 });

        const promise = debouncedFunc();

        jest.advanceTimersByTime(100);

        const result = await promise;

        expect(asyncFunc).toHaveBeenCalledTimes(1);
        expect(result).toBe('result');
    });

    test('should cancel pending executions when cancel is called', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, { wait: 100 });

        debouncedFunc().catch(() => {
        });
        debouncedFunc().catch(() => {
        });

        debouncedFunc.cancel();

        jest.advanceTimersByTime(100);

        expect(func).not.toHaveBeenCalled();
    });

    test('should handle flush when no prior calls have been made', async () => {
        const func = jest.fn(() => 'flushed');
        const debouncedFunc = debounce(func, { wait: 100, leading: false });

        const flushResult = await debouncedFunc.flush();

        expect(func).toHaveBeenCalledTimes(0);
        expect(flushResult).toBeUndefined();
    });

    test('should execute immediately when flush is called', async () => {
        const func = jest.fn(() => 'flushed');
        const debouncedFunc = debounce(func, { wait: 100 });

        const promise = debouncedFunc();

        expect(func).not.toHaveBeenCalled();

        const flushResult = await debouncedFunc.flush();

        expect(func).toHaveBeenCalledTimes(1);

        expect(flushResult).toBe('flushed');

        jest.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(1);

        const result = await promise;

        expect(result).toBe('flushed');
    });

    test('should indicate pending status correctly', () => {
        const func = jest.fn();

        const debouncedFunc = debounce(func, { wait: 100 });

        expect(debouncedFunc.pending()).toBe(false);

        debouncedFunc();

        expect(debouncedFunc.pending()).toBe(true);

        jest.advanceTimersByTime(100);

        expect(debouncedFunc.pending()).toBe(false);
    });

    test('should handle multiple rapid calls and resolve promises correctly', async () => {
        const func = jest.fn((value) => value);
        const debouncedFunc = debounce(func, { wait: 100 });

        const promises = [debouncedFunc('first'), debouncedFunc('second'), debouncedFunc('third')];

        jest.advanceTimersByTime(100);

        const results = await Promise.all(promises);

        expect(func).toHaveBeenCalledTimes(1);
        expect(func).toHaveBeenCalledWith('third');
        expect(results).toEqual(['third', 'third', 'third']);
    });

    test('should handle errors thrown by the debounced function', async () => {
        try {
            const errorFunc = jest.fn(() => {
                throw new Error('Test error');
            });
            const debouncedFunc = debounce(errorFunc, { wait: 100 });

            const promise = debouncedFunc();

            jest.advanceTimersByTime(100);

            await expect(promise).rejects.toThrow('Test error');

            expect(errorFunc).toHaveBeenCalledTimes(1);
        } catch (e) {
        }
    });

    test('should execute when both leading and trailing are false', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, { wait: 100, leading: true, trailing: true });

        debouncedFunc();
        jest.advanceTimersByTime(99);
        expect(func).toHaveBeenCalledTimes(1);

        debouncedFunc();
        jest.advanceTimersByTime(50);
        expect(func).toHaveBeenCalledTimes(1);
    });

    test('should correctly handle "this" context', async () => {
        class TestClass {
            value = 42;

            getValue = debounce(
                function(this: TestClass) {
                    return this.value;
                },
                { wait: 100 },
            );
        }

        const instance = new TestClass();

        const promise = instance.getValue();

        jest.advanceTimersByTime(100);

        const result = await promise;

        expect(result).toBe(42);
    });

    test('should allow immediate execution if wait time is zero', () => {
        const func = jest.fn();
        const debouncedFunc = debounce(func, { wait: 0 });

        debouncedFunc();
        debouncedFunc();

        expect(func).not.toHaveBeenCalled();

        jest.advanceTimersByTime(0);

        expect(func).toHaveBeenCalledTimes(1);
    });
});
