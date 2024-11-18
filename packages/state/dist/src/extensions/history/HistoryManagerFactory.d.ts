import { StateManager } from '../../StateManager';
import { HistoryOptions, IHistoryManager } from './types';
import { IStateOperations } from '../../types';
export declare class HistoryManagerFactory {
    /**
     * Creates a new instance of HistoryManager with optional dependencies
     */
    static create<T extends Record<string, any>>(stateManager: StateManager<T>, options?: HistoryOptions, stateOps?: IStateOperations): IHistoryManager<T>;
    /**
     * Creates a history manager with time-travel debugging capabilities
     */
    static createWithDebug<T extends Record<string, any>>(stateManager: StateManager<T>, options?: HistoryOptions): IHistoryManager<T>;
}
//# sourceMappingURL=HistoryManagerFactory.d.ts.map