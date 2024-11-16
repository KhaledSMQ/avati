import { DeepPartial } from '../types';

export class StateUtils {
    /**
     * Deep merges a partial update into the current state
     */
    public static deepMerge<T extends Record<string, any>>(target: T, source: DeepPartial<T>): T {
        const result: T = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                const sourceValue = source[key];
                const targetValue = target[key];

                if (this.isObject(sourceValue) && this.isObject(targetValue)) {
                    result[key] = this.deepMerge(
                        targetValue,
                        sourceValue as DeepPartial<typeof targetValue>
                    );
                } else if (sourceValue !== undefined) {
                    result[key] = this.cloneValue(sourceValue) as T[typeof key];
                }
            }
        }

        return result;
    }

    /**
     * Checks if value is a plain object
     */
    private static isObject(item: unknown): item is Record<string, any> {
        return (
            item !== null &&
            typeof item === 'object' &&
            !Array.isArray(item) &&
            !(item instanceof Date) &&
            !(item instanceof RegExp)
        );
    }

    /**
     * Clones a value, handling special cases
     */
    private static cloneValue<T>(value: T): T {
        if (value instanceof Date) {
            return new Date(value.getTime()) as unknown as T;
        }
        if (value instanceof RegExp) {
            return new RegExp(value.source, value.flags) as unknown as T;
        }
        if (Array.isArray(value)) {
            return value.map((item) => this.cloneValue(item)) as unknown as T;
        }
        if (this.isObject(value)) {
            return this.deepMerge({} as Record<string, any>, value as Record<string, any>) as T;
        }
        return value;
    }
}
