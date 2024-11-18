import { StateManagerOptions } from './types';
import { StateManager } from './StateManager';
import { StateOperations } from './StateOperations';
import { StateValidator } from './StateValidator';

export class StateManagerFactory {
    public static create<T extends Record<string, any>>(
        initialState: T,
        options: StateManagerOptions = {},
    ): StateManager<T> {
        const stateOps = new StateOperations();
        const validator = new StateValidator();

        return new StateManager<T>(initialState, options, stateOps, validator);
    }
}
