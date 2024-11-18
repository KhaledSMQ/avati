import { memoize } from '../src/memoize';

describe('memoize function', () => {
    it('should cache the result of a function call', () => {
        const fn = jest.fn((a: number, b: number) => a + b);
        const memoizedFn = memoize(fn);

        expect(memoizedFn(1, 2)).toBe(3);
        expect(memoizedFn(1, 2)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle different arguments correctly', () => {
        const fn = jest.fn((a: number) => a * 2);
        const memoizedFn = memoize(fn);

        expect(memoizedFn(2)).toBe(4);
        expect(memoizedFn(3)).toBe(6);
        expect(memoizedFn(2)).toBe(4);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should respect the maxCacheSize option', () => {
        const fn = jest.fn((a: number) => a * 2);
        const memoizedFn = memoize(fn, { maxCacheSize: 2 });

        expect(memoizedFn(1)).toBe(2); // Cache: [1]
        expect(memoizedFn(2)).toBe(4); // Cache: [1,2]
        expect(memoizedFn(3)).toBe(6); // Cache exceeds max size, LRU eviction occurs
        expect(fn).toHaveBeenCalledTimes(3);

        // The first cached value (1) should have been evicted
        expect(memoizedFn(1)).toBe(2); // Recomputed
        expect(fn).toHaveBeenCalledTimes(4);
    });

    it('should expire cache entries based on ttl', async () => {
        jest.useFakeTimers();
        const fn = jest.fn((a: number) => a * 2);
        const memoizedFn = memoize(fn, { ttl: 1000 }); // 1 second TTL

        expect(memoizedFn(1)).toBe(2);
        expect(fn).toHaveBeenCalledTimes(1);

        // Advance time by 500ms
        jest.advanceTimersByTime(500);
        expect(memoizedFn(1)).toBe(2);
        expect(fn).toHaveBeenCalledTimes(1); // Should use cached value

        // Advance time by another 600ms (total 1100ms)
        jest.advanceTimersByTime(600);
        expect(memoizedFn(1)).toBe(2);
        expect(fn).toHaveBeenCalledTimes(2); // Cache expired, recomputed

        jest.useRealTimers();
    });

    it('should handle functions with complex arguments', () => {
        const fn = jest.fn((obj: { a: number; b: number }) => obj.a + obj.b);
        const memoizedFn = memoize(fn);

        const arg = { a: 1, b: 2 };
        expect(memoizedFn(arg)).toBe(3);
        expect(memoizedFn(arg)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(1);

        const arg2 = { a: 1, b: 2 };
        expect(memoizedFn(arg2)).toBe(3);
        expect(fn).toHaveBeenCalledTimes(2); // Different object references
    });

    it('should handle circular references in arguments', () => {
        const fn = jest.fn((obj: any) => obj.value);
        const memoizedFn = memoize(fn);

        const arg: any = { value: 42 };
        arg.self = arg; // Create circular reference

        expect(memoizedFn(arg)).toBe(42);
        expect(memoizedFn(arg)).toBe(42);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle functions with side effects', () => {
        let counter = 0;
        const fn = jest.fn(() => ++counter);
        const memoizedFn = memoize(fn);

        expect(memoizedFn()).toBe(1);
        expect(memoizedFn()).toBe(1); // Cached result
        expect(counter).toBe(1);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should preserve the this context', () => {
        class Calculator {
            factor = 2;

            multiply = memoize(function(this: Calculator, x: number) {
                return x * this.factor;
            });
        }

        const calc = new Calculator();
        expect(calc.multiply(3)).toBe(6);
        expect(calc.multiply(3)).toBe(6);
        expect(calc.multiply(4)).toBe(8);
    });

    it('should handle functions returning promises', async () => {
        const fn = jest.fn(async (a: number) => a * 2);
        const memoizedFn = memoize(fn);

        const result1 = await memoizedFn(2);
        expect(result1).toBe(4);
        const result2 = await memoizedFn(2);
        expect(result2).toBe(4);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle exceptions thrown by the function', () => {
        const fn = jest.fn((a: number) => {
            if (a < 0) throw new Error('Negative number');
            return a * 2;
        });
        const memoizedFn = memoize(fn);

        expect(() => memoizedFn(-1)).toThrow('Negative number');
        expect(() => memoizedFn(-1)).toThrow('Negative number');
        expect(fn).toHaveBeenCalledTimes(2); // Exceptions are not cached
    });

    it('should handle non-serializable arguments', () => {
        const fn = jest.fn((a: any) => a.value);
        const memoizedFn = memoize(fn);

        const symbolArg = { value: Symbol('test') };
        expect(memoizedFn(symbolArg)).toBe(symbolArg.value);
        expect(memoizedFn(symbolArg)).toBe(symbolArg.value);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle negative TTL (immediate expiration)', () => {
        const fn = jest.fn((a: number) => a * 2);
        const memoizedFn = memoize(fn, { ttl: -100 });

        expect(memoizedFn(1)).toBe(2);
        expect(memoizedFn(1)).toBe(2);
        expect(fn).toHaveBeenCalledTimes(2); // Should not cache results
    });

    it('should work with zero TTL (no caching)', () => {
        const fn = jest.fn((a: number) => a * 2);
        const memoizedFn = memoize(fn, { ttl: 0 });

        expect(memoizedFn(1)).toBe(2);
        expect(memoizedFn(1)).toBe(2);
        expect(fn).toHaveBeenCalledTimes(2); // Should not cache results
    });

    it('should handle multiple memoized functions independently', () => {
        const fn1 = jest.fn((a: number) => a + 1);
        const fn2 = jest.fn((a: number) => a + 2);

        const memoizedFn1 = memoize(fn1);
        const memoizedFn2 = memoize(fn2);

        expect(memoizedFn1(1)).toBe(2);
        expect(memoizedFn1(1)).toBe(2);
        expect(fn1).toHaveBeenCalledTimes(1);

        expect(memoizedFn2(1)).toBe(3);
        expect(memoizedFn2(1)).toBe(3);
        expect(fn2).toHaveBeenCalledTimes(1);
    });
});
