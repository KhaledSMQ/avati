interface MemoizeOptions {
    /** Maximum number of entries in the cache */
    maxCacheSize?: number;
    /** Time-to-live for cache entries in milliseconds */
    ttl?: number;
}
/**
 * Creates a memoized version of a function with optional cache size limit and TTL
 * @param fn - Function to memoize
 * @param options - Memoization options
 * @returns Memoized function
 */
export declare function memoize<Args extends any[], Return>(fn: (...args: Args) => Return, options?: MemoizeOptions): (...args: Args) => Return;
export {};
//# sourceMappingURL=memoize.d.ts.map