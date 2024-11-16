import {
    HistoryManager,
    HistoryManagerFactory,
    HistoryStateError,
    InvalidHistoryOperationError,
    StateManager,
    StateOperations,
} from '../src';

interface TestState {
    counter: number;
    todos: Array<{
        id: number;
        text: string;
        completed: boolean;
    }>;
    user: {
        name: string;
        preferences: {
            theme: 'light' | 'dark';
            notifications: {
                email: boolean;
                push: boolean;
            };
        };
    };
}

describe('History Management System', () => {
    // Test setup helpers
    const createInitialState = (): TestState => ({
        counter: 0,
        todos: [],
        user: {
            name: '',
            preferences: {
                theme: 'light',
                notifications: {
                    email: false,
                    push: false,
                },
            },
        },
    });

    const createTestSetup = (options = {}) => {
        const stateManager = new StateManager<TestState>(createInitialState());
        const stateOps = new StateOperations();
        const history = new HistoryManager<TestState>(stateManager, stateOps, options);
        return { stateManager, history, stateOps };
    };

    describe('Initialization', () => {
        test('should initialize with empty history', () => {
            const { history } = createTestSetup();
            const { past, present, future } = history.getHistory();

            expect(past).toHaveLength(0);
            expect(future).toHaveLength(0);
            expect(present).toEqual(createInitialState());
        });

        test('should throw error when initialized without required dependencies', () => {
            const stateOps = new StateOperations();

            expect(() => new HistoryManager(null as any, stateOps)).toThrow(HistoryStateError);

            expect(() => new HistoryManager({} as any, null as any)).toThrow(HistoryStateError);
        });

        test('should apply default options when none provided', () => {
            const { history } = createTestSetup();

            // Perform multiple actions to test default max length
            const { stateManager } = createTestSetup();
            Array.from({ length: 51 }).forEach((_, i) => {
                stateManager.setState({ counter: i });
            });

            const { past } = history.getHistory();
            expect(past.length).toBeLessThanOrEqual(50);
        });
    });

    describe('State Tracking', () => {
        test('should track all state changes when trackAll is true', () => {
            const { stateManager, history } = createTestSetup({ trackAll: true });

            stateManager.setState({ counter: 1 });
            stateManager.setState({ counter: 2 });
            stateManager.setState({ counter: 3 });

            const { past } = history.getHistory();
            expect(past).toHaveLength(3);
            expect(past[0].counter).toBe(0);
            expect(past[1].counter).toBe(1);
            expect(past[2].counter).toBe(2);
        });

        test('should only track dispatch actions when trackAll is false', () => {
            const { stateManager, history } = createTestSetup({ trackAll: false });

            stateManager.setState({ counter: 1 });
            stateManager.dispatch({ type: 'INCREMENT' });
            stateManager.setState({ counter: 3 });

            const { past } = history.getHistory();
            expect(past).toHaveLength(1);
        });

        test('should respect ignore actions list', () => {
            const { stateManager, history } = createTestSetup({
                trackAll: false,
                ignoreActions: ['IGNORE_ME'],
            });

            stateManager.dispatch({ type: 'INCREMENT' });
            stateManager.dispatch({ type: 'IGNORE_ME' });
            stateManager.dispatch({ type: 'DECREMENT' });

            const { past } = history.getHistory();
            expect(past).toHaveLength(2);
        });

        test('should maintain immutability of history state', () => {
            const { stateManager, history } = createTestSetup({ trackAll: true });

            // Set initial state with nested objects
            stateManager.setState({
                user: {
                    name: 'John',
                    preferences: { theme: 'dark' },
                },
            });

            // Get a copy of the history and attempt to modify it
            const historyCopy = history.getHistory();
            historyCopy.present.user.name = 'Jane';
            historyCopy.present.user.preferences.theme = 'light';

            // Get current history and verify it's unchanged
            const currentHistory = history.getHistory();
            expect(currentHistory.present.user.name).toBe('John');
            expect(currentHistory.present.user.preferences.theme).toBe('dark');

            // Verify original state is unchanged
            const currentState = stateManager.getState();
            expect(currentState.user.name).toBe('John');
            expect(currentState.user.preferences.theme).toBe('dark');
        });

        test('should maintain immutability with arrays', () => {
            const { stateManager, history } = createTestSetup({ trackAll: true });

            // Set initial state with arrays
            stateManager.setState({
                todos: [{ id: 1, text: 'Test', completed: false }],
            });

            // Get a copy and modify it
            const historyCopy = history.getHistory();
            historyCopy.present.todos[0].text = 'Modified';
            historyCopy.present.todos.push({ id: 2, text: 'New', completed: false });

            // Verify original is unchanged
            const currentHistory = history.getHistory();
            expect(currentHistory.present.todos).toHaveLength(1);
            expect(currentHistory.present.todos[0].text).toBe('Test');
        });

        test('should maintain immutability during state updates', () => {
            const { stateManager, history } = createTestSetup();

            // Create a complex nested state
            const initialState = {
                user: {
                    name: 'John',
                    preferences: {
                        theme: 'dark' as const,
                        notifications: {
                            email: true,
                            push: false,
                        },
                    },
                },
            };

            stateManager.setState(initialState);

            // Attempt to modify through history
            const historyCopy = history.getHistory();
            historyCopy.present.user.preferences.notifications.email = false;

            // Verify all levels are protected
            const currentState = stateManager.getState();
            expect(currentState.user.preferences.notifications.email).toBe(true);
        });

        test('should handle repeated state updates while maintaining immutability', () => {
            const { stateManager, history } = createTestSetup({ trackAll: true });

            // Perform multiple updates
            stateManager.setState({
                user: { name: 'John', preferences: { theme: 'dark' } },
            });

            stateManager.setState({
                user: {
                    ...stateManager.getState().user,
                    preferences: { theme: 'light' },
                },
            });

            // Attempt to modify history
            const historyCopy = history.getHistory();
            historyCopy.past[0].user.name = 'Modified';

            // @ts-ignore
            historyCopy.present.user.preferences.theme = 'modified' as const;

            // Verify both past and present states are protected
            const currentHistory = history.getHistory();
            expect(currentHistory.past[1].user.name).toBe('John');
            expect(currentHistory.present.user.preferences.theme).toBe('light');
        });
    });

    describe('Undo/Redo Operations', () => {
        test('should handle basic undo/redo operations', () => {
            const { stateManager, history } = createTestSetup({ trackAll: true });

            stateManager.setState({ counter: 1 });
            stateManager.setState({ counter: 2 });
            stateManager.setState({ counter: 3 });

            expect(history.canUndo()).toBe(true);
            expect(history.canRedo()).toBe(false);

            history.undo();
            expect(stateManager.getState().counter).toBe(2);

            history.undo();
            expect(stateManager.getState().counter).toBe(1);

            expect(history.canRedo()).toBe(true);

            history.redo();
            expect(stateManager.getState().counter).toBe(2);
        });

        test('should handle complex nested state changes', () => {
            const { stateManager, history } = createTestSetup({ trackAll: true });

            stateManager.setState({
                todos: [{ id: 1, text: 'Test', completed: false }],
                user: { name: 'John', preferences: { theme: 'dark' } },
            });

            stateManager.setState({
                todos: [
                    { id: 1, text: 'Test', completed: true },
                    { id: 2, text: 'Test 2', completed: false },
                ],
            });

            history.undo();
            const state = stateManager.getState();
            expect(state.todos).toHaveLength(1);
            expect(state.user.name).toBe('John');
            expect(state.user.preferences.theme).toBe('dark');
        });

        test('should clear future history on new action', () => {
            const { stateManager, history } = createTestSetup({ trackAll: true });

            stateManager.setState({ counter: 1 });
            stateManager.setState({ counter: 2 });

            history.undo();
            expect(history.canRedo()).toBe(true);

            stateManager.setState({ counter: 3 });
            expect(history.canRedo()).toBe(false);
        });

        test('should handle edge cases of undo/redo', () => {
            const { stateManager, history } = createTestSetup();

            expect(history.undo()).toBe(false);
            expect(history.redo()).toBe(false);

            stateManager.setState({ counter: 1 });
            history.undo();

            for (let i = 0; i < 10; i++) {
                expect(history.undo()).toBe(false);
            }

            history.redo();
            for (let i = 0; i < 10; i++) {
                expect(history.redo()).toBe(false);
            }
        });
    });

    describe('Revert Operations', () => {
        test('should revert to specific history index', () => {
            const { stateManager, history } = createTestSetup({ trackAll: true });

            stateManager.setState({ counter: 1 });
            stateManager.setState({ counter: 2 });
            stateManager.setState({ counter: 3 });

            expect(() => history.revertTo(2)).not.toThrow();
            expect(stateManager.getState().counter).toBe(2);
        });

        test('should throw error for invalid revert index', () => {
            const { history } = createTestSetup();

            expect(() => history.revertTo(-1)).toThrow(InvalidHistoryOperationError);
            expect(() => history.revertTo(100)).toThrow(InvalidHistoryOperationError);
        });

        test('should properly update history state after revert', () => {
            const { stateManager, history } = createTestSetup({ trackAll: true });

            [1, 2, 3, 4, 5].forEach((counter) => {
                stateManager.setState({ counter });
            });

            history.revertTo(2);
            const { past, present, future } = history.getHistory();

            expect(past).toHaveLength(2);
            expect(present.counter).toBe(2);
            expect(future).toHaveLength(3);
        });
    });

    describe('History Management', () => {
        test('should enforce max history length', () => {
            const maxLength = 5;
            const { stateManager, history } = createTestSetup({
                maxHistoryLength: maxLength,
                trackAll: true,
            });

            for (let i = 1; i <= 10; i++) {
                stateManager.setState({ counter: i });
            }

            const { past } = history.getHistory();
            expect(past).toHaveLength(maxLength);
            expect(past[0].counter).toBe(5);
        });

        test('should clear history', () => {
            const { stateManager, history } = createTestSetup();

            stateManager.setState({ counter: 1 });
            stateManager.setState({ counter: 2 });

            history.clearHistory();

            const { past, future } = history.getHistory();
            expect(past).toHaveLength(0);
            expect(future).toHaveLength(0);
        });

        test('should provide accurate history length', () => {
            const { stateManager, history } = createTestSetup({ trackAll: true });

            stateManager.setState({ counter: 1 });
            stateManager.setState({ counter: 2 });

            history.undo();

            const { past, future } = history.getHistoryLength();
            expect(past).toBe(1);
            expect(future).toBe(1);
        });
    });

    describe('Factory Creation', () => {
        test('should create history manager with default options', () => {
            const stateManager = new StateManager<TestState>(createInitialState());
            const history = HistoryManagerFactory.create(stateManager);

            expect(history).toBeDefined();
            expect(history.canUndo()).toBe(false);
            expect(history.canRedo()).toBe(false);
        });

        test('should create debug-enabled history manager', () => {
            const stateManager = new StateManager<TestState>(createInitialState());
            const history = HistoryManagerFactory.createWithDebug(stateManager);

            stateManager.setState({ counter: 1 });
            expect(history.getHistory().past).toHaveLength(1);
        });
    });

    describe('Performance and Resource Management', () => {
        test('should handle rapid state changes', () => {
            const { stateManager, history } = createTestSetup();

            const operations = 1000;
            console.time('rapid-state-changes');

            for (let i = 0; i < operations; i++) {
                stateManager.setState({ counter: i });
            }

            console.timeEnd('rapid-state-changes');
            expect(history.getHistory().past.length).toBeLessThanOrEqual(50);
        });

        test('should handle rapid undo/redo operations', () => {
            const { stateManager, history } = createTestSetup();

            for (let i = 0; i < 5; i++) {
                stateManager.setState({ counter: i });
            }

            console.time('rapid-undo-redo');
            for (let i = 0; i < 1000; i++) {
                history.undo();
                history.redo();
            }
            console.timeEnd('rapid-undo-redo');

            expect(stateManager.getState().counter).toBe(4);
        });

        test('should handle large state objects', () => {
            const { stateManager, history } = createTestSetup();

            const largeState = {
                counter: 0,
                todos: Array.from({ length: 1000 }, (_, i) => ({
                    id: i,
                    text: `Todo ${i}`,
                    completed: false,
                })),
                user: {
                    name: 'Test',
                    preferences: {
                        theme: 'light' as const,
                    },
                },
            };

            console.time('large-state-handling');
            stateManager.setState(largeState);
            history.undo();
            history.redo();
            console.timeEnd('large-state-handling');

            expect(stateManager.getState().todos.length).toBe(1000);
        });
    });
});
