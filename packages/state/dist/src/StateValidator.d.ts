import { IStateValidator } from './types';
export declare class StateValidator implements IStateValidator {
    /**
     * Validates the entire state object
     */
    validateState<T>(state: T): boolean;
    /**
     * Validates a specific state key
     */
    validateStateKey<T extends object>(state: T, key: keyof T): boolean;
}
//# sourceMappingURL=StateValidator.d.ts.map