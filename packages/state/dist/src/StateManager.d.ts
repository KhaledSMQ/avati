import { Action, DeepPartial, IStateManager, IStateOperations, IStateValidator, Listener, Reducer, StateManagerOptions } from './types';
export declare class StateManager<T extends Record<string, any>> implements IStateManager<T> {
    private state;
    private previous_state;
    private readonly initialState;
    private readonly listeners;
    private readonly reducers;
    private isDispatching;
    private readonly stateOps;
    private readonly validator;
    private readonly logger;
    constructor(initialState: T, options?: StateManagerOptions, stateOps?: IStateOperations, validator?: IStateValidator);
    getState(): T;
    getState<K extends keyof T>(key: K): T[K];
    /**
     * Updates state with deep partial updates
     */
    setState(updates: DeepPartial<T>): void;
    subscribe(listener: Listener<T>): () => void;
    addReducer<K extends keyof T>(slice: K, reducer: Reducer<T[K]>): void;
    dispatch<P>(action: Action<P>): Action<P>;
    reset(newInitialState?: T): void;
    destroy(): void;
    private notifyListeners;
}
//# sourceMappingURL=StateManager.d.ts.map