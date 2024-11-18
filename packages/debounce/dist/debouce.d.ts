/**
 * Advanced debounce utility with TypeScript support
 * Provides a way to limit the rate at which a function can fire by delaying its execution
 * until after a specified amount of time has elapsed since its last invocation.
 * @module debounce
 */
/**
 * Generic function type that can accept any arguments and return any value
 * Used as a constraint for functions that can be debounced
 */
type AnyFunction = (...args: any[]) => any;
/**
 * Configuration options for the debounce function
 * @interface DebounceOptions
 */
interface DebounceOptions {
    /** Number of milliseconds to delay execution (default: 0) */
    readonly wait?: number;
    /** Whether to execute on the leading edge of the timeout (default: false) */
    readonly leading?: boolean;
    /** Whether to execute on the trailing edge of the timeout (default: true) */
    readonly trailing?: boolean;
    /** Maximum time the function can be delayed before forced execution */
    readonly maxWait?: number;
    /** Enable debug logging for troubleshooting */
    readonly debug?: boolean;
    /** AbortController signal for cancellation */
    readonly signal?: AbortSignal;
    onError?: (error: Error) => void;
}
/**
 * Interface for the debounced function, including utility methods
 * @interface DebouncedFunction
 * @template T - The type of the original function
 */
interface DebouncedFunction<T extends AnyFunction> {
    /** The debounced function that wraps the original */
    (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>>;
    /** Cancels any pending function invocations */
    readonly cancel: () => void;
    /** Immediately executes any pending function call */
    readonly flush: (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
    /** Checks if there are any pending invocations */
    readonly pending: () => boolean;
    /** Cleans up resources used by the debounced function */
    readonly cleanup: () => void;
}
/**
 * Creates a debounced version of the provided function that delays invoking func until after
 * wait milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * @template T - The type of the function to debounce
 * @param {T} func - The function to debounce
 * @param {DebounceOptions} [options={}] - Configuration options
 * @returns {DebouncedFunction<T>} The debounced function
 * @throws {TypeError} If func is not a function
 * @throws {RangeError} If wait or maxWait values are invalid
 * @throws {Error} If neither leading nor trailing is true
 *
 * @example
 * const debouncedFn = debounce(async (x: number) => x * 2, { wait: 1000 });
 * await debouncedFn(5); // Will execute after 1000ms of inactivity
 * const debouncedFn = debounce(
 *    async (x: number) => x * 2,
 *    {
 *      wait: 1000,
 *      onError: (error) => console.error('Error in debounced function:', error)
 *    }
 *  );
 */
declare function debounce<T extends AnyFunction>(func: T, options?: DebounceOptions): DebouncedFunction<T>;
export { debounce, type DebouncedFunction, type DebounceOptions };
//# sourceMappingURL=debouce.d.ts.map