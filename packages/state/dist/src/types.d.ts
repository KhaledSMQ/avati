export type DeepPartial<Thing> = Thing extends Function ? Thing : Thing extends Array<infer InferredArrayMember> ? DeepPartialArray<InferredArrayMember> : Thing extends object ? DeepPartialObject<Thing> : Thing | undefined;
export interface DeepPartialArray<Thing> extends Array<DeepPartial<Thing>> {
}
export type DeepPartialObject<Thing> = {
    [Key in keyof Thing]?: DeepPartial<Thing[Key]>;
};
/**
 * Generic type for action objects
 */
export type Action<T = any> = {
    /**
     * Action type
     */
    type: string;
    /**
     * Optional payload
     */
    payload?: T;
};
export type ReducerConfig<T> = {
    [K in keyof T]: Reducer<T[K]>;
};
/**
 * Generic type for reducer functions
 */
export type Reducer<S> = (state: S, action: Action) => S;
/**
 * Listener function type for subscribing to state changes
 */
export type Listener<T> = (state: T, previous?: T | null) => void;
/**
 * Configuration options for StateManager
 */
export interface StateManagerOptions {
    /**
     * Enable debug logging
     */
    readonly debug?: boolean;
    /**
     * Enable state validation
     */
    readonly validateState?: boolean;
}
/**
 * Interface for the core state manager functionality
 */
export interface IStateManager<T> {
    /**
     * Get the current state or a specific slice of state
     * @param key - Optional key to get a specific slice of state
     */
    getState(): T;
    getState<K extends keyof T>(key?: K): K extends keyof T ? T[K] : T;
    /**
     * Update the state with new values
     * @param updates
     */
    setState(updates: DeepPartial<T>): void;
    dispatch<P>(action: Action<P>): Action<P>;
    subscribe(listener: Listener<T>): () => void;
    addReducer<K extends keyof T>(slice: K, reducer: Reducer<T[K]>): void;
    reset(newInitialState?: T): void;
    destroy(): void;
}
/**
 * Interface for state validation
 */
export interface IStateValidator {
    /**
     * Validates the entire state object
     * @param state - State object to validate
     */
    validateState<T extends Record<string, any>>(state: T): boolean;
    /**
     * Validates a specific state key
     * @param state - State object to validate
     * @param key - Key to validate
     */
    validateStateKey<T extends Record<string, any>>(state: T, key: keyof T): boolean;
}
/**
 * Interface for state operations
 */
export interface IStateOperations {
    /**
     * Deep copy an object
     * @param obj - Object to copy
     */
    deepCopy<T>(obj: T): T;
    /**
     * Freeze an object deeply
     * @param state - State object to freeze
     */
    freezeState<T>(state: T): Readonly<T>;
}
//# sourceMappingURL=types.d.ts.map