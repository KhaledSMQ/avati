import { SignalOptions, validated } from '../src';

describe('validated', () => {
    it('should create a signal with valid initial value', () => {
        const signal = validated(5, value => value > 0);
        expect(signal.value).toBe(5);
    });

    it('should allow valid value updates', () => {
        const signal = validated(5, value => value > 0);
        signal.value = 10;
        expect(signal.value).toBe(10);
    });

    it('should throw error for invalid value updates', () => {
        const signal = validated(5, value => value > 0);
        expect(() => {
            signal.value = -1;
        }).toThrow('Validation failed');
    });

    it('should handle custom error messages', () => {
        const customMessage = 'Value must be positive';
        const signal = validated(5, value => value > 0 ? true : customMessage);
        expect(() => {
            signal.value = -1;
        }).toThrow(customMessage);
    });

    it('should work with complex objects', () => {
        interface User {
            id: number;
            name: string;
        }

        const initialUser: User = { id: 1, name: 'John' };
        const options: SignalOptions<User> = {
            equals: (a, b) => a.id === b.id && a.name === b.name,
        };

        const signal = validated<User>(
            initialUser,
            user => user.name.length > 0 ? true : 'Name is required',
            options,
        );

        expect(signal.value).toEqual(initialUser);
        expect(() => {
            signal.value = { id: 2, name: '' };
        }).toThrow('Name is required');
    });

    it('should work with array values', () => {
        const signal = validated<number[]>(
            [1, 2, 3],
            arr => arr.every(n => n > 0) || 'All numbers must be positive',
        );

        expect(signal.value).toEqual([1, 2, 3]);
        signal.value = [4, 5, 6];
        expect(signal.value).toEqual([4, 5, 6]);
        expect(() => {
            signal.value = [1, -2, 3];
        }).toThrow('All numbers must be positive');
    });

    it('should preserve signal reactivity', () => {
        const signal = validated(5, value => value > 0);
        let updates = 0;

        signal.subscribe(() => {
            updates++;
        });
        signal.value = 10;
        signal.value = 15;

        expect(updates).toBe(3); // Initial value + 2 updates
    });
});
