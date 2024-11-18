import { persisted, SignalDisposedError, StorageProvider } from '../src';


class TestStorage<T> implements StorageProvider<T> {
    private store = new Map<string, T>();

    getItem = jest.fn((key: string): T | null => this.store.get(key) ?? null);
    setItem = jest.fn((key: string, value: T): void => {
        this.store.set(key, value);
    });
    removeItem = jest.fn((key: string): void => {
        this.store.delete(key);
    });
    clear = jest.fn((): void => {
        this.store.clear();
    });
}


describe('persisted', () => {
    let storage: TestStorage<unknown>;

    beforeEach(() => {
        storage = new TestStorage();
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with stored value', () => {
            storage.setItem('test-key', 'stored-value');
            const signal = persisted('test-key', 'initial', storage);
            expect(signal.value).toBe('stored-value');
            expect(storage.getItem).toHaveBeenCalledWith('test-key');
        });

        it('should initialize with initial value when no stored value exists', () => {
            const signal = persisted('test-key', 'initial', storage);
            expect(signal.value).toBe('initial');
        });

        it('should handle null stored value', () => {
            storage.setItem('test-key', null);
            const signal = persisted('test-key', 'initial', storage);
            expect(signal.value).toBe('initial');
        });
    });

    describe('Value Operations', () => {
        it('should persist value changes', () => {
            const signal = persisted('test-key', 'initial', storage);
            signal.value = 'new-value';
            expect(storage.setItem).toHaveBeenCalledWith('test-key', 'new-value');
        });

        it('should update value using update function', () => {
            const signal = persisted<{ count: number }>('test-key', { count: 0 }, storage as StorageProvider<{
                count: number
            }>);
            signal.update(v => ({ count: v.count + 1 }));
            expect(storage.setItem).toHaveBeenCalledWith('test-key', { count: 1 });
        });

        it('should respect custom equality function', () => {
            const equals = (a: any, b: any) => {
                if (a === undefined) {
                    return b === undefined;
                }
                return a.id === b.id;
            };
            const signal = persisted('test-key', { id: 1, value: 'a' }, storage, { equals });

            signal.value = { id: 1, value: 'b' };
            signal.value = { id: 2, value: 'b' };
            expect(storage.setItem).toHaveBeenCalledWith('test-key', { id: 2, value: 'b' });
        });
    });

    describe('Storage Operations', () => {
        it('should reload value from storage', () => {
            const signal = persisted('test-key', 'initial', storage);
            storage.setItem('test-key', 'updated-externally');
            signal.reload();
            expect(signal.value).toBe('updated-externally');
        });

        it('should clear storage', () => {
            const signal = persisted('test-key', 'initial', storage);
            signal.clear();
            expect(storage.removeItem).toHaveBeenCalledWith('test-key');
        });

        it('should handle multiple signals independently', () => {
            const signal1 = persisted('key1', 'value1', storage);
            const signal2 = persisted('key2', 'value2', storage);

            signal1.value = 'updated1';
            signal2.value = 'updated2';

            expect(storage.setItem).toHaveBeenCalledWith('key1', 'updated1');
            expect(storage.setItem).toHaveBeenCalledWith('key2', 'updated2');
        });
    });

    describe('Disposal', () => {
        it('should handle disposal correctly', () => {
            const signal = persisted('test-key', 'initial', storage);
            signal.dispose();

            expect(signal.isDisposed()).toBe(true);
            expect(storage.removeItem).toHaveBeenCalledWith('test-key');
        });

        it('should throw on operations after disposal', () => {
            const signal = persisted('test-key', 'initial', storage);
            signal.dispose();

            expect(() => signal.value).toThrow(SignalDisposedError);
            expect(() => {
                signal.value = 'new';
            }).toThrow(SignalDisposedError);
            expect(() => signal.update(v => v)).toThrow(SignalDisposedError);
            expect(() => signal.reload()).toThrow(SignalDisposedError);
            expect(() => signal.clear()).toThrow(SignalDisposedError);
        });

        it('should ignore multiple dispose calls', () => {
            const signal = persisted('test-key', 'initial', storage);
            signal.dispose();
            signal.dispose();
            expect(storage.removeItem).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        it('should handle storage errors gracefully', () => {

            try {
                storage.setItem.mockImplementationOnce(() => {
                    throw new Error('Storage error');
                });
                const signal = persisted('test-key', 'initial', storage);
                signal.value = 'new';

            } catch (e) {
                expect(e).toBeInstanceOf(Error);
                expect(e.message).toBe('Storage error');
            }
        });

        it('should handle reload with missing value', () => {
            const signal = persisted('test-key', 'initial', storage);
            storage.getItem.mockReturnValueOnce(null);
            signal.reload();
            expect(signal.value).toBe('initial');
        });
    });
});
