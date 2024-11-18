interface MemoizeOptions {
    /** Maximum number of entries in the cache */
    maxCacheSize?: number;
    /** Time-to-live for cache entries in milliseconds */
    ttl?: number;
}

class LRUCache<K, V> {
    private maxSize: number;
    private cache: Map<K, V>;

    constructor(maxSize: number) {
        this.maxSize = maxSize;
        this.cache = new Map<K, V>();
    }

    get(key: K): V | undefined {
        if (!this.cache.has(key)) return undefined;
        const value = this.cache.get(key)!;
        // Move key to the end to mark it as recently used
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove least recently used item
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }

    delete(key: K): void {
        this.cache.delete(key);
    }

    has(key: K): boolean {
        return this.cache.has(key);
    }
}

/**
 * Creates a memoized version of a function with optional cache size limit and TTL
 * @param fn - Function to memoize
 * @param options - Memoization options
 * @returns Memoized function
 */
export function memoize<Args extends any[], Return>(
    fn: (...args: Args) => Return,
    options: MemoizeOptions = {},
): (...args: Args) => Return {
    const { maxCacheSize = Infinity, ttl } = options;
    const cache = new LRUCache<string, { value: Return; timestamp: number }>(maxCacheSize);

    // Unique ID generator for objects
    const objectIDMap = new WeakMap<object, number>();
    let objectIDCounter = 0;

    function getObjectID(obj: object): number {
        if (!objectIDMap.has(obj)) {
            objectIDMap.set(obj, ++objectIDCounter);
        }
        return objectIDMap.get(obj)!;
    }

    function generateKey(args: any[]): string {
        return args
            .map((arg) => {
                if (typeof arg === 'object' && arg !== null) {
                    return `object:${getObjectID(arg)}`;
                } else if (typeof arg === 'function') {
                    return `function:${arg.toString()}`;
                } else {
                    return `primitive:${String(arg)}`;
                }
            })
            .join('|');
    }

    return function(this: any, ...args: Args): Return {
        const key = generateKey(args);
        const now = Date.now();

        const cached = cache.get(key);

        if (cached) {
            if (ttl !== undefined && now - cached.timestamp >= ttl) {
                cache.delete(key);
            } else {
                return cached.value;
            }
        }

        const result = fn.apply(this, args);

        cache.set(key, { value: result, timestamp: now });

        return result;
    };
}
