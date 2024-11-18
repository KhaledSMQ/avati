import { IStateOperations } from './types';
export declare class StateOperations implements IStateOperations {
    /**
     * Creates a deep copy of an object
     */
    deepCopy<T>(obj: T): T;
    /**
     * Freezes an object deeply
     */
    freezeState<T>(state: T): Readonly<T>;
}
//# sourceMappingURL=StateOperations.d.ts.map