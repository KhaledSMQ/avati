import { HistoryOptions, HistoryState, IHistoryManager } from './types';
import { StateManager } from '../../StateManager';
import { IStateOperations } from '../../types';
export declare class HistoryManager<T extends Record<string, any>> implements IHistoryManager<T> {
    private historyState;
    private readonly options;
    private readonly stateManager;
    private readonly stateOps;
    private isHistoryAction;
    private static readonly DEFAULT_OPTIONS;
    constructor(stateManager: StateManager<T>, stateOps: IStateOperations, options?: HistoryOptions);
    private validateDependencies;
    private createInitialHistoryState;
    private initialize;
    private setupStateSubscription;
    private wrapDispatch;
    private pushState;
    getHistory(): HistoryState<T>;
    private updateState;
    undo(): boolean;
    redo(): boolean;
    revertTo(index: number): boolean;
    clearHistory(): void;
    canUndo(): boolean;
    canRedo(): boolean;
    getHistoryLength(): {
        past: number;
        future: number;
    };
}
//# sourceMappingURL=HistoryManager.d.ts.map