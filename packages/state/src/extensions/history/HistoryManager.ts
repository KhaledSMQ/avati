import { HistoryOptions, HistoryState, IHistoryManager } from './types';
import { StateManager } from '../../StateManager';
import { Action, IStateOperations } from '../../types';
import { HistoryStateError, InvalidHistoryOperationError } from './errors';

export class HistoryManager<T extends Record<string, any>> implements IHistoryManager<T> {
    private static readonly DEFAULT_OPTIONS: Required<HistoryOptions> = {
        maxHistoryLength: 50,
        trackAll: false,
        ignoreActions: [],
    };
    private historyState: HistoryState<T>;
    private readonly options: Required<HistoryOptions>;
    private readonly stateManager: StateManager<T>;
    private readonly stateOps: IStateOperations;
    private isHistoryAction: boolean = false;

    constructor(
        stateManager: StateManager<T>,
        stateOps: IStateOperations,
        options: HistoryOptions = {},
    ) {
        this.validateDependencies(stateManager, stateOps);

        this.stateManager = stateManager;
        this.stateOps = stateOps;
        this.options = {
            ...HistoryManager.DEFAULT_OPTIONS,
            ...options,
            ignoreActions: [...(options.ignoreActions || [])],
        };

        // Create deep copies for initial state
        this.historyState = {
            past: [],
            present: this.stateOps.deepCopy(this.stateManager.getState()),
            future: [],
        };

        this.initialize();
    }

    public getHistory(): HistoryState<T> {
        // Return a deep copy of the entire history state
        return {
            past: this.historyState.past.map((state) => this.stateOps.deepCopy(state)),
            present: this.stateOps.deepCopy(this.historyState.present),
            future: this.historyState.future.map((state) => this.stateOps.deepCopy(state)),
        };
    }

    public undo(): boolean {
        if (!this.canUndo()) {
            return false;
        }

        this.isHistoryAction = true;
        try {
            const newPast = [...this.historyState.past];
            const newPresent = newPast.pop()!;

            const newState: HistoryState<T> = {
                past: newPast,
                present: this.stateOps.deepCopy(newPresent),
                future: [this.historyState.present, ...this.historyState.future].slice(
                    0,
                    this.options.maxHistoryLength,
                ),
            };

            this.updateState(newState);
            return true;
        } finally {
            this.isHistoryAction = false;
        }
    }

    public redo(): boolean {
        if (!this.canRedo()) {
            return false;
        }

        this.isHistoryAction = true;
        try {
            const newFuture = [...this.historyState.future];
            const newPresent = newFuture.shift()!;

            const newState: HistoryState<T> = {
                past: [...this.historyState.past, this.historyState.present].slice(
                    -this.options.maxHistoryLength,
                ),
                present: this.stateOps.deepCopy(newPresent),
                future: newFuture,
            };

            this.updateState(newState);
            return true;
        } finally {
            this.isHistoryAction = false;
        }
    }

    public revertTo(index: number): boolean {
        if (index < 0 || index >= this.historyState.past.length) {
            throw new InvalidHistoryOperationError(
                `Invalid index: ${index}. Valid range: 0 to ${this.historyState.past.length - 1}`,
            );
        }

        this.isHistoryAction = true;
        try {
            const pastStates = [...this.historyState.past];
            const targetState = pastStates[index] as T;
            const newPast = pastStates.slice(0, index);
            const newFuture = [
                ...pastStates.slice(index + 1),
                this.historyState.present,
                ...this.historyState.future,
            ].slice(0, this.options.maxHistoryLength);

            const newState: HistoryState<T> = {
                past: newPast,
                present: Object.freeze(this.stateOps.deepCopy(targetState)),
                future: newFuture,
            };

            this.updateState(newState);
            return true;
        } finally {
            this.isHistoryAction = false;
        }
    }

    public clearHistory(): void {
        this.historyState = this.createInitialHistoryState();
    }

    public canUndo(): boolean {
        return this.historyState.past.length > 0;
    }

    public canRedo(): boolean {
        return this.historyState.future.length > 0;
    }

    public getHistoryLength(): { past: number; future: number } {
        return {
            past: this.historyState.past.length,
            future: this.historyState.future.length,
        };
    }

    private validateDependencies(stateManager: StateManager<T>, stateOps: IStateOperations): void {
        if (!stateManager) {
            throw new HistoryStateError('StateManager is required');
        }
        if (!stateOps) {
            throw new HistoryStateError('StateOperations is required');
        }
    }

    private createInitialHistoryState(): HistoryState<T> {
        return {
            past: [],
            present: this.stateOps.deepCopy(this.stateManager.getState()),
            future: [],
        };
    }

    private initialize(): void {
        this.setupStateSubscription();
        this.wrapDispatch();
    }

    private setupStateSubscription(): void {
        this.stateManager.subscribe((newState) => {
            if (!this.isHistoryAction && this.options.trackAll) {
                this.pushState(newState);
            }
        });
    }

    private wrapDispatch(): void {
        const originalDispatch = this.stateManager.dispatch.bind(this.stateManager);

        this.stateManager.dispatch = <P>(action: Action<P>): Action<P> => {
            if (this.isHistoryAction) {
                return originalDispatch(action);
            }

            const result = originalDispatch(action);

            if (!this.options.trackAll && !this.options.ignoreActions.includes(action.type)) {
                this.pushState(this.stateManager.getState());
            }

            return result;
        };
    }

    private pushState(newState: T): void {
        // Create deep copies of all states
        this.historyState = {
            past: [
                ...this.historyState.past,
                this.stateOps.deepCopy(this.historyState.present),
            ].slice(-this.options.maxHistoryLength),
            present: this.stateOps.deepCopy(newState),
            future: [],
        };
    }

    private updateState(newState: HistoryState<T>): void {
        // Create deep copies when updating state
        this.historyState = {
            past: newState.past.map((state) => this.stateOps.deepCopy(state)),
            present: this.stateOps.deepCopy(newState.present),
            future: newState.future.map((state) => this.stateOps.deepCopy(state)),
        };
        this.stateManager.setState(this.stateOps.deepCopy(newState.present) as any);
    }
}
