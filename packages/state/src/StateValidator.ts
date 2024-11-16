import { IStateValidator } from './types';

export class StateValidator implements IStateValidator {
    /**
     * Validates the entire state object
     */
    public validateState<T>(state: T): boolean {
        if (!state || typeof state !== 'object' || Array.isArray(state)) {
            throw new Error('State must be a non-null object');
        }
        return true;
    }

    /**
     * Validates a specific state key
     */
    public validateStateKey<T extends object>(state: T, key: keyof T): boolean {
        if (!state.hasOwnProperty(key)) {
            throw new Error(`Invalid state key: ${String(key)}`);
        }
        return true;
    }
}
