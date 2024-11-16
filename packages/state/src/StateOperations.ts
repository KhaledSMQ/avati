import { IStateOperations } from './types';

export class StateOperations implements IStateOperations {
    /**
     * Creates a deep copy of an object
     */
    public deepCopy<T>(obj: T): T {
        // Handle null and undefined
        if (obj === null || obj === undefined) {
            return obj;
        }

        // Handle primitive types
        if (typeof obj !== 'object') {
            return obj;
        }

        // Handle arrays
        if (Array.isArray(obj)) {
            return obj.map((item) => this.deepCopy(item)) as unknown as T;
        }

        // Handle Date objects
        if (obj instanceof Date) {
            return new Date(obj.getTime()) as unknown as T;
        }

        // Handle other objects
        const copy = {} as T;
        Object.entries(obj).forEach(([key, value]) => {
            (copy as any)[key] = this.deepCopy(value);
        });

        return copy;
    }

    /**
     * Freezes an object deeply
     */
    public freezeState<T>(state: T): Readonly<T> {
        if (state === null || typeof state !== 'object') {
            return state;
        }

        const propertyNames = Object.getOwnPropertyNames(state);
        propertyNames.forEach((name) => {
            const value = (state as any)[name];
            if (value && typeof value === 'object') {
                this.freezeState(value);
            }
        });

        return Object.freeze(state);
    }
}
