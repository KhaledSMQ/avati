import { filtered, Signal } from '../src';


describe('filtered', () => {
    it('should create a signal with initial value that passes predicate', () => {
        const source = new Signal(2);
        const even = filtered(source, n => n % 2 === 0);
        expect(even.value).toBe(2);
    });

    it('should update when new value passes predicate', () => {
        const source = new Signal(1);
        const even = filtered(source, n => n % 2 === 0);
        source.value = 2;
        expect(even.value).toBe(2);
    });

    it('should not update when new value fails predicate', () => {
        const source = new Signal(2);
        const even = filtered(source, n => n % 2 === 0);
        source.value = 3;
        expect(even.value).toBe(2);
    });

    it('should work with custom equality function', () => {
        const source = new Signal({ id: 1, value: 'test' });
        const filtered1 = filtered(
            source,
            obj => obj.id > 0,
            {
                equals: (a, b) => {

                    return a.id === b.id;
                },
            },
        );

        const newValue = { id: 2, value: 'different' };
        source.value = newValue;
        expect(filtered1.value).toBe(newValue);
    });

    it('should handle cleanup properly', () => {
        const source = new Signal(0);
        const evenSignal = filtered(source, n => n % 2 === 0);

        evenSignal.dispose();
        expect(() => evenSignal.value).toThrow();
    });

    it('should work with complex predicates', () => {
        const source = new Signal({ count: 0, valid: true });
        const validWithEvenCount = filtered(
            source,
            obj => obj.valid && obj.count % 2 === 0,
        );

        expect(validWithEvenCount.value).toEqual({ count: 0, valid: true });

        source.value = { count: 1, valid: true };
        expect(validWithEvenCount.value).toEqual({ count: 0, valid: true });

        source.value = { count: 2, valid: true };
        expect(validWithEvenCount.value).toEqual({ count: 2, valid: true });
    });
});
