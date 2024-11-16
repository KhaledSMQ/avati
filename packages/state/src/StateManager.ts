import {
    Action,
    DeepPartial,
    IStateManager,
    IStateOperations,
    IStateValidator,
    Listener,
    Reducer,
    StateManagerOptions,
} from './types';
import { ConsoleLogger } from '@avati/logger';
import { StateOperations } from './StateOperations';
import { StateValidator } from './StateValidator';
import { StateUtils } from './utils/StateUtils';

export class StateManager<T extends Record<string, any>> implements IStateManager<T> {
    private state: T;
    private previous_state: T | null;
    private readonly initialState: T;
    private readonly listeners: Set<Listener<T>>;
    private readonly reducers: Map<keyof T, Reducer<T[keyof T]>>;
    private isDispatching: boolean;

    private readonly stateOps: IStateOperations;
    private readonly validator: IStateValidator;
    private readonly logger: ConsoleLogger;

    constructor(
        initialState: T,
        options: StateManagerOptions = {},
        stateOps: IStateOperations = new StateOperations(),
        validator: IStateValidator = new StateValidator()
    ) {
        this.stateOps = stateOps;
        this.validator = validator;
        this.validator.validateState(initialState);
        this.logger = ConsoleLogger.getInstance({
            debugMode: options.debug || false,
            prefix: 'StateManager',
        });

        this.state = this.stateOps.freezeState(this.stateOps.deepCopy(initialState));
        this.previous_state = null;
        this.initialState = this.stateOps.freezeState(this.stateOps.deepCopy(initialState));
        this.listeners = new Set();
        this.reducers = new Map();
        this.isDispatching = false;
    }

    public getState(): T;
    public getState<K extends keyof T>(key: K): T[K];
    public getState<K extends keyof T>(key?: K): T | T[K] {
        this.logger.debug('Getting state', key || 'full state');
        const state = key ? this.state[key] : this.state;
        return this.stateOps.deepCopy(state) as any;
    }

    /**
     * Updates state with deep partial updates
     */
    public setState(updates: DeepPartial<T>): void {
        // Validate all top-level keys first
        Object.keys(updates).forEach((key) => {
            if (this.validator.validateStateKey(this.state, key as keyof T)) {
                this.logger.debug(`Validating state key: ${key}`);
            }
        });

        // Create merged state
        const mergedState = StateUtils.deepMerge(this.state, updates);

        // Create final state with deep copy and freeze
        const nextState = this.stateOps.deepCopy(mergedState);
        this.previous_state = this.state;
        this.state = this.stateOps.freezeState(nextState);

        this.notifyListeners();
    }

    public subscribe(listener: Listener<T>): () => void {
        if (typeof listener !== 'function') {
            throw new Error('Listener must be a function');
        }

        this.logger.debug('New subscriber added');
        this.listeners.add(listener);

        return () => {
            this.logger.debug('Subscriber removed');
            this.listeners.delete(listener);
        };
    }

    public addReducer<K extends keyof T>(slice: K, reducer: Reducer<T[K]>): void {
        if (typeof reducer !== 'function') {
            throw new Error('Reducer must be a function');
        }

        if (this.reducers.has(slice)) {
            throw new Error(`Reducer already exists for slice: ${String(slice)}`);
        }
        this.logger.debug('Adding reducer for slice', slice);
        this.reducers.set(slice, reducer as Reducer<T[keyof T]>);
    }

    public dispatch<P>(action: Action<P>): Action<P> {
        if (this.isDispatching) {
            throw new Error('Reducers may not dispatch actions');
        }

        if (!action || typeof action !== 'object' || !action.type) {
            throw new Error('Action must be an object with a type property');
        }

        try {
            this.isDispatching = true;
            const nextState = this.stateOps.deepCopy(this.state);
            let hasChanged = false;

            this.reducers.forEach((reducer, slice) => {
                const currentSliceState = this.stateOps.deepCopy(this.state[slice]);
                const nextSliceState = reducer(currentSliceState, action);

                if (nextSliceState !== currentSliceState) {
                    nextState[slice] = nextSliceState;
                    hasChanged = true;
                }
            });

            if (hasChanged) {
                this.logger.debug('State updated via dispatch', { action, nextState });
                this.state = this.stateOps.freezeState(nextState);
                this.notifyListeners();
            }

            return action;
        } finally {
            this.isDispatching = false;
        }
    }

    public reset(newInitialState?: T): void {
        if (newInitialState) {
            this.validator.validateState(newInitialState);
            this.state = this.stateOps.freezeState(this.stateOps.deepCopy(newInitialState));
        } else {
            this.state = this.stateOps.freezeState(this.stateOps.deepCopy(this.initialState));
        }
        this.logger.debug('State reset', this.state);
        this.notifyListeners();
    }

    public destroy(): void {
        this.listeners.clear();
        this.reducers.clear();
        this.reset();
        this.logger.debug('StateManager destroyed');
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => {
            try {
                listener(this.state, this.previous_state);
            } catch (error) {
                this.logger.error('Error in state change listener', error as Error);
            }
        });
    }
}
