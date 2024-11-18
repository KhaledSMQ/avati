import { map, Signal } from '../src';


describe('map', () => {
    let cleanup: (() => void)[] = [];

    afterEach(() => {
        cleanup.forEach(fn => fn());
        cleanup = [];
    });

    it('should transform primitive values', () => {
        const source = new Signal(5);
        const doubled = map(source, n => n * 2);
        cleanup.push(() => source.dispose(), () => doubled.dispose());

        expect(doubled.value).toBe(10);

        source.value = 10;
        expect(doubled.value).toBe(20);
    });

    it('should transform arrays', () => {
        const source = new Signal([1, 2, 3]);
        const doubled = map(source, arr => arr.map(n => n * 2));
        cleanup.push(() => source.dispose(), () => doubled.dispose());

        expect(doubled.value).toEqual([2, 4, 6]);

        source.value = [2, 3, 4];
        expect(doubled.value).toEqual([4, 6, 8]);
    });

    it('should transform objects', () => {
        const source = new Signal({ name: 'John', age: 30 });
        const formatted = map(
            source,
            user => `${user.name} is ${user.age} years old`,
            { name: 'userSummary' },
        );
        cleanup.push(() => source.dispose(), () => formatted.dispose());

        expect(formatted.value).toBe('John is 30 years old');

        source.value = { name: 'Jane', age: 25 };
        expect(formatted.value).toBe('Jane is 25 years old');
    });

    it('should respect custom equality functions', () => {
        const source = new Signal({ id: 1, name: 'John' });
        let transformCalls = 0;

        const mapped = map(
            source,
            user => {
                transformCalls++;
                return { ...user, uppercase: user.name.toUpperCase() };
            },
            {
                equals: (a, b) => {
                    if (!a || !b) return false;
                    return a.id === b.id;
                },
            },
        );
        cleanup.push(() => source.dispose(), () => mapped.dispose());

        expect(mapped.value).toEqual({ id: 1, name: 'John', uppercase: 'JOHN' });
        expect(transformCalls).toBe(1);

        // Should not trigger transform due to custom equality
        source.value = { id: 1, name: 'Jane' };
        expect(transformCalls).toBe(2);

        // Should trigger transform due to different id
        source.value = { id: 2, name: 'Jane' };
        expect(transformCalls).toBe(3);
    });

    it('should handle undefined and null values', () => {
        const source = new Signal<number | undefined | null>(5);
        const doubled = map(source, n => n != null ? n * 2 : 0);
        cleanup.push(() => source.dispose(), () => doubled.dispose());

        expect(doubled.value).toBe(10);

        source.value = undefined;
        expect(doubled.value).toBe(0);

        source.value = null;
        expect(doubled.value).toBe(0);
    });

    it('should dispose properly', () => {
        const source = new Signal(5);
        const doubled = map(source, n => n * 2);

        doubled.dispose();
        source.dispose();

        expect(() => doubled.value).toThrow();
        expect(() => source.value).toThrow();
    });
});
