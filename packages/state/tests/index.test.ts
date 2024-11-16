import { Action, StateManager, StateManagerFactory, StateOperations, StateValidator } from '../src';

interface TestState {
    counter: number;
    todos: string[];
    user: {
        name: string;
        isLoggedIn: boolean;
        preferences: {
            theme: 'light' | 'dark';
            notifications: boolean;
        };
    };
}

// Mock implementations
class MockStateOperations extends StateOperations {
    deepCopy = jest.fn().mockImplementation(super.deepCopy);
    freezeState = jest.fn().mockImplementation(super.freezeState);
}

class MockStateValidator extends StateValidator {
    validateState = jest.fn().mockImplementation(super.validateState);
    validateStateKey = jest.fn().mockImplementation(super.validateStateKey);
}

describe('State Management System', () => {
    // StateOperations Tests
    describe('StateOperations', () => {
        let stateOps: StateOperations;

        beforeEach(() => {
            stateOps = new StateOperations();
        });

        describe('deepCopy', () => {
            test('should create a deep copy of primitive values', () => {
                expect(stateOps.deepCopy(42)).toBe(42);
                expect(stateOps.deepCopy('test')).toBe('test');
                expect(stateOps.deepCopy(true)).toBe(true);
                expect(stateOps.deepCopy(null)).toBe(null);
                expect(stateOps.deepCopy(undefined)).toBe(undefined);
            });

            test('should create a deep copy of arrays', () => {
                const original = [1, [2, 3], { a: 4 }];
                const copy = stateOps.deepCopy(original);

                expect(copy).toEqual(original);
                expect(copy).not.toBe(original);
                expect(copy[1]).not.toBe(original[1]);
                expect(copy[2]).not.toBe(original[2]);
            });

            test('should create a deep copy of nested objects', () => {
                const original = {
                    a: 1,
                    b: { c: 2, d: { e: 3 } },
                    f: [1, { g: 4 }],
                };
                const copy = stateOps.deepCopy(original);

                expect(copy).toEqual(original);
                expect(copy).not.toBe(original);
                expect(copy.b).not.toBe(original.b);
                expect(copy.b.d).not.toBe(original.b.d);
                expect(copy.f).not.toBe(original.f);
                expect(copy.f[1]).not.toBe(original.f[1]);
            });
        });

        describe('freezeState', () => {
            test('should freeze objects deeply', () => {
                const state = {
                    a: 1,
                    b: { c: 2 },
                    d: [1, { e: 3 }],
                };

                const frozen = stateOps.freezeState(state);

                expect(Object.isFrozen(frozen)).toBe(true);
                expect(Object.isFrozen(frozen.b)).toBe(true);
                expect(Object.isFrozen(frozen.d)).toBe(true);
                expect(Object.isFrozen(frozen.d[1])).toBe(true);
            });
        });
    });

    // StateValidator Tests
    describe('StateValidator', () => {
        let validator: StateValidator;

        beforeEach(() => {
            validator = new StateValidator();
        });

        describe('validateState', () => {
            test('should validate correct state objects', () => {
                expect(() => validator.validateState({ a: 1 })).not.toThrow();
            });

            test('should throw for invalid state values', () => {
                expect(() => validator.validateState(null)).toThrow();
                expect(() => validator.validateState(undefined)).toThrow();
                expect(() => validator.validateState([])).toThrow();
                expect(() => validator.validateState(42)).toThrow();
            });
        });

        describe('validateStateKey', () => {
            test('should validate existing keys', () => {
                const state = { a: 1, b: 2 };
                expect(() => validator.validateStateKey(state, 'a')).not.toThrow();
            });

            test('should throw for non-existent keys', () => {
                const state = { a: 1 };
                expect(() =>
                    validator.validateStateKey(state, 'b' as keyof typeof state)
                ).toThrow();
            });
        });
    });

    // StateManager Tests
    describe('StateManager', () => {
        let manager: StateManager<TestState>;
        let mockStateOps: MockStateOperations;
        let mockValidator: MockStateValidator;
        let initialState: TestState;

        beforeEach(() => {
            initialState = {
                counter: 0,
                todos: [],
                user: {
                    name: '',
                    isLoggedIn: false,
                    preferences: {
                        theme: 'light',
                        notifications: true,
                    },
                },
            };

            mockStateOps = new MockStateOperations();
            mockValidator = new MockStateValidator();

            manager = new StateManager<TestState>(
                initialState,
                { debug: true },
                mockStateOps,
                mockValidator
            );
        });

        describe('initialization', () => {
            test('should properly initialize state', () => {
                expect(mockValidator.validateState).toHaveBeenCalledWith(initialState);
                expect(mockStateOps.deepCopy).toHaveBeenCalledWith(initialState);
                expect(mockStateOps.freezeState).toHaveBeenCalled();
            });
        });

        describe('state operations', () => {
            test('should get full state immutably', () => {
                const state = manager.getState();
                state.counter = 42;
                expect(manager.getState().counter).toBe(0);
            });

            test('should get state slice immutably', () => {
                const user = manager.getState('user');
                user.name = 'test';
                expect(manager.getState().user.name).toBe('');
            });

            test('should update state immutably', () => {
                manager.setState({ counter: 42 });
                expect(mockStateOps.deepCopy).toHaveBeenCalled();
                expect(mockStateOps.freezeState).toHaveBeenCalled();
                expect(manager.getState().counter).toBe(42);
            });
        });

        describe('reducers', () => {
            test('should handle reducer registration', () => {
                // @ts-ignore
                const reducer = (state: number, action: Action) => state;
                manager.addReducer('counter', reducer);

                expect(() => {
                    manager.addReducer('counter', reducer);
                }).toThrow();
            });

            test('should handle actions with reducers', () => {
                manager.addReducer('counter', (state: number, action: Action) => {
                    if (action.type === 'INCREMENT') return state + 1;
                    return state;
                });

                manager.dispatch({ type: 'INCREMENT' });
                expect(manager.getState().counter).toBe(1);
            });

            test('should handle multiple reducers', () => {
                manager.addReducer('counter', (state: number, action: Action) => {
                    if (action.type === 'INCREMENT') return state + 1;
                    return state;
                });

                manager.addReducer('todos', (state: string[], action: Action) => {
                    if (action.type === 'ADD_TODO') return [...state, action.payload];
                    return state;
                });

                manager.dispatch({ type: 'INCREMENT' });
                manager.dispatch({ type: 'ADD_TODO', payload: 'test' });

                const state = manager.getState();
                expect(state.counter).toBe(1);
                expect(state.todos).toEqual(['test']);
            });
        });

        describe('subscriptions', () => {
            test('should handle subscriptions', () => {
                const listener = jest.fn();
                const unsubscribe = manager.subscribe(listener);

                manager.setState({ counter: 42 });
                expect(listener).toHaveBeenCalledTimes(1);

                unsubscribe();
                manager.setState({ counter: 43 });
                expect(listener).toHaveBeenCalledTimes(1);
            });

            test('should handle multiple subscribers', () => {
                const listener1 = jest.fn();
                const listener2 = jest.fn();

                manager.subscribe(listener1);
                manager.subscribe(listener2);

                manager.setState({ counter: 42 });

                expect(listener1).toHaveBeenCalledTimes(1);
                expect(listener2).toHaveBeenCalledTimes(1);
            });

            test('should handle subscriber errors', () => {
                const goodListener = jest.fn();
                const badListener = jest.fn().mockImplementation(() => {
                    throw new Error('Listener error');
                });

                manager.subscribe(badListener);
                manager.subscribe(goodListener);

                expect(() => {
                    manager.setState({ counter: 42 });
                }).not.toThrow();

                expect(goodListener).toHaveBeenCalled();
            });
        });
    });

    // StateManagerFactory Tests
    describe('StateManagerFactory', () => {
        test('should create StateManager instance', () => {
            const initialState = {
                counter: 0,
                todos: [],
                user: {
                    name: '',
                    isLoggedIn: false,
                    preferences: {
                        theme: 'light' as const,
                        notifications: true,
                    },
                },
            };

            const store = StateManagerFactory.create(initialState, { debug: true });
            expect(store).toBeInstanceOf(StateManager);
            expect(store.getState()).toEqual(initialState);
        });
    });

    // Integration Tests
    describe('Integration', () => {
        let store: StateManager<TestState>;

        beforeEach(() => {
            store = StateManagerFactory.create<TestState>({
                counter: 0,
                todos: [],
                user: {
                    name: '',
                    isLoggedIn: false,
                    preferences: {
                        theme: 'light',
                        notifications: true,
                    },
                },
            });
        });

        test('should handle complex state updates', () => {
            const listener = jest.fn();
            store.subscribe(listener);

            // Add reducers
            store.addReducer('counter', (state, action) => {
                if (action.type === 'INCREMENT') return state + 1;
                return state;
            });

            store.addReducer('user', (state, action) => {
                if (action.type === 'UPDATE_PREFERENCES') {
                    return {
                        ...state,
                        preferences: {
                            ...state.preferences,
                            ...action.payload,
                        },
                    };
                }
                return state;
            });

            // Dispatch actions
            store.dispatch({ type: 'INCREMENT' });
            store.dispatch({
                type: 'UPDATE_PREFERENCES',
                payload: { theme: 'dark' as const },
            });

            const finalState = store.getState();
            expect(finalState.counter).toBe(1);
            expect(finalState.user.preferences.theme).toBe('dark');
            expect(finalState.user.preferences.notifications).toBe(true);
            expect(listener).toHaveBeenCalledTimes(2);
        });
    });

    describe('StateManager Deep Partial Updates', () => {
        interface TestState {
            user: {
                name: string;
                preferences: {
                    theme: 'light' | 'dark';
                    notifications: {
                        email: boolean;
                        push: {
                            enabled: boolean;
                            quiet: boolean;
                        };
                    };
                };
            };
            counter: number;
            items: Array<{
                id: number;
                value: string;
            }>;
        }

        let stateManager: StateManager<TestState>;

        beforeEach(() => {
            const initialState: TestState = {
                user: {
                    name: 'John',
                    preferences: {
                        theme: 'light',
                        notifications: {
                            email: true,
                            push: {
                                enabled: true,
                                quiet: false,
                            },
                        },
                    },
                },
                counter: 0,
                items: [],
            };

            stateManager = new StateManager<TestState>(initialState);
        });

        test('should handle shallow updates', () => {
            stateManager.setState({ counter: 1 });
            expect(stateManager.getState().counter).toBe(1);
            expect(stateManager.getState().user.name).toBe('John');
        });

        test('should handle deep partial updates', () => {
            stateManager.setState({
                user: {
                    preferences: {
                        notifications: {
                            push: {
                                quiet: true,
                            },
                        },
                    },
                },
            });

            const state = stateManager.getState();
            expect(state.user.preferences.notifications.push.quiet).toBe(true);
            expect(state.user.preferences.notifications.push.enabled).toBe(true);
            expect(state.user.preferences.notifications.email).toBe(true);
            expect(state.user.name).toBe('John');
        });

        test('should handle array updates', () => {
            const newItems = [{ id: 1, value: 'test' }];
            stateManager.setState({ items: newItems });

            const state = stateManager.getState();
            expect(state.items).toEqual(newItems);
            expect(state.items).not.toBe(newItems); // Should be a new reference
        });

        test('should handle multiple nested updates', () => {
            stateManager.setState({
                user: {
                    name: 'Jane',
                    preferences: {
                        theme: 'dark',
                    },
                },
            });

            const state = stateManager.getState();
            expect(state.user.name).toBe('Jane');
            expect(state.user.preferences.theme).toBe('dark');
            expect(state.user.preferences.notifications.email).toBe(true);
        });

        test('should maintain immutability', () => {
            const update = {
                user: {
                    preferences: {
                        theme: 'dark' as const,
                    },
                },
            };

            stateManager.setState(update);
            update.user.preferences.theme = 'light' as any;

            const state = stateManager.getState();
            expect(state.user.preferences.theme).toBe('dark');
        });

        test('should handle undefined and null values', () => {
            stateManager.setState({
                user: {
                    preferences: {
                        notifications: {
                            email: undefined,
                        },
                    },
                },
            });

            const state = stateManager.getState();
            expect(state.user.preferences.notifications.email).toBe(true); // Should keep original value
            expect(state.user.preferences.notifications.push).toEqual({
                enabled: true,
                quiet: false,
            });
        });
    });
});
