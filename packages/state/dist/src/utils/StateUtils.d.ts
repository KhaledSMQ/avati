import { DeepPartial } from '../types';
export declare class StateUtils {
    /**
     * Deep merges a partial update into the current state
     */
    static deepMerge<T extends Record<string, any>>(target: T, source: DeepPartial<T>): T;
    /**
     * Checks if value is a plain object
     */
    private static isObject;
    /**
     * Clones a value, handling special cases
     */
    private static cloneValue;
}
//# sourceMappingURL=StateUtils.d.ts.map