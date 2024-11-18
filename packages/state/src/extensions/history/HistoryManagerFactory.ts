import { StateManager } from '../../StateManager';
import { HistoryOptions, IHistoryManager } from './types';
import { IStateOperations } from '../../types';
import { StateOperations } from '../../StateOperations';
import { HistoryManager } from './HistoryManager';

export class HistoryManagerFactory {
    /**
     * Creates a new instance of HistoryManager with optional dependencies
     */
    public static create<T extends Record<string, any>>(
        stateManager: StateManager<T>,
        options?: HistoryOptions,
        stateOps?: IStateOperations,
    ): IHistoryManager<T> {
        const operations = stateOps || new StateOperations();
        return new HistoryManager<T>(stateManager, operations, options);
    }

    /**
     * Creates a history manager with time-travel debugging capabilities
     */
    public static createWithDebug<T extends Record<string, any>>(
        stateManager: StateManager<T>,
        options?: HistoryOptions,
    ): IHistoryManager<T> {
        return this.create(stateManager, {
            ...options,
            trackAll: true,
            maxHistoryLength: options?.maxHistoryLength || 100,
        });
    }
}
