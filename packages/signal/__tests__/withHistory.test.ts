import { withHistory } from '../src';

describe('withHistory', () => {
    let signal: ReturnType<typeof withHistory<number>>;

    beforeEach(() => {
        signal = withHistory(0, 3);
    });

    it('should initialize with correct value', () => {
        expect(signal.value).toBe(0);
        expect(signal.history.value).toEqual([0]);
    });

    it('should track value changes in history', () => {
        signal.value = 1;
        signal.value = 2;

        expect(signal.history.value).toEqual([0, 1, 2]);
        expect(signal.value).toBe(2);
    });

    it('should respect max history limit', () => {
        signal.value = 1;
        signal.value = 2;
        signal.value = 3;
        signal.value = 4;

        expect(signal.history.value).toEqual([2, 3, 4]);
        expect(signal.value).toBe(4);
    });

    it('should handle undo correctly', () => {
        signal.value = 1;
        signal.value = 2;

        signal.undo();
        expect(signal.value).toBe(1);

        signal.undo();
        expect(signal.value).toBe(0);

        signal.undo(); // Should not change when at start
        expect(signal.value).toBe(0);
    });

    it('should handle redo correctly', () => {
        signal.value = 1;
        signal.value = 2;

        signal.undo();
        signal.undo();

        signal.redo();
        expect(signal.value).toBe(1);

        signal.redo();
        expect(signal.value).toBe(2);

        signal.redo(); // Should not change when at end
        expect(signal.value).toBe(2);
    });

    it('should clear redo history when new value is set', () => {
        signal.value = 1;
        signal.value = 2;
        signal.undo();
        signal.value = 3;

        expect(signal.history.value).toEqual([0, 1, 3]);
        signal.redo(); // Should not change
        expect(signal.value).toBe(3);
    });

    it('should not add duplicate consecutive values', () => {
        signal.value = 1;
        signal.value = 1;
        signal.value = 1;

        expect(signal.history.value).toEqual([0, 1]);
        expect(signal.value).toBe(1);
    });

    it('should maintain correct history after undo/redo operations', () => {
        signal.value = 1;
        signal.value = 2;
        signal.undo();
        signal.value = 3;

        expect(signal.history.value).toEqual([0, 1, 3]);
        expect(signal.value).toBe(3);
    });

    it('should work with custom equality function', () => {
        const objSignal = withHistory({ id: 1 }, 3, {
            equals: (a, b) => {
                return a.id === b.id;
            },
        });

        objSignal.value = { id: 1 }; // Should not add to history
        expect(objSignal.history.value.length).toBe(1); // Initial and this value

        objSignal.value = { id: 2 }; // Should add to history
        expect(objSignal.history.value.length).toBe(2);
    });

    it('should preserve signal reactivity', () => {
        let updates = 0;
        const objSignal = withHistory({ id: 1 }, 3, {
            equals: (a, b) => {
                return a.id === b.id;
            },
        });

        // @ts-ignore
        objSignal.subscribe((v) => {
            updates++;
        });

        objSignal.value = { id: 2 }; // Should not add to history
        expect(objSignal.history.value.length).toBe(2); // Initial and this value

        objSignal.value = { id: 3 }; // Should add to history
        expect(objSignal.history.value.length).toBe(3);

        objSignal.value = { id: 2 }; // Should not add to history
        expect(objSignal.history.value.length).toBe(3); // (2, 3, 2) - we limit to 3 history items
        expect(updates).toBe(4); // Initial value + 3 updates

    });
});
