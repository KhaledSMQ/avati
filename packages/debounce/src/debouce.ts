/**
 * Advanced debounce utility with TypeScript support
 * Provides a way to limit the rate at which a function can fire by delaying its execution
 * until after a specified amount of time has elapsed since its last invocation.
 * @module debounce
 */

/**
 * Timer ID type returned by setTimeout
 * Used for managing timers internally
 */
type TimerId = ReturnType<typeof setTimeout>;

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
    /** Cancels any pending function invocations */
    readonly cancel: () => void;
    /** Immediately executes any pending function call */
    readonly flush: (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
    /** Checks if there are any pending invocations */
    readonly pending: () => boolean;
    /** Cleans up resources used by the debounced function */
    readonly cleanup: () => void;

    /** The debounced function that wraps the original */
    (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>>;
}

/**
 * Internal state management for the debounced function
 * @interface PrivateState
 * @template T - The type of the original function
 * @private
 */
interface PrivateState<T extends AnyFunction> {
    /** Current timer ID for the debounce delay */
    timerId?: TimerId;
    /** Timer ID for the maximum wait limit */
    maxTimerId?: TimerId;
    /** Timestamp of the last function call */
    lastCallTime?: number;
    /** Timestamp of the last successful function invocation */
    lastInvokeTime: number;
    /** Arguments from the most recent function call */
    lastArgs?: Parameters<T>;
    /** Execution context (this) from the most recent call */
    lastThis?: any;
    /** Result from the last function execution */
    result?: Awaited<ReturnType<T>>;
    /** Array of pending promises waiting for resolution */
    pendingPromises: Array<{
        resolve: (value: Awaited<ReturnType<T>>) => void;
        reject: (reason?: any) => void;
    }>;
    /** Flag indicating if the function has been aborted */
    aborted: boolean;
}

/** WeakMap to store private state for each debounced function */
const privateState = new WeakMap<DebouncedFunction<any>, PrivateState<any>>();

/**
 * Creates a logger instance based on debug flag
 * @param debug - Whether debug logging is enabled
 * @returns Object with logging methods
 * @private
 */
const createLogger = (debug: boolean) => ({
    log: (...args: any[]) => debug && console.log('[Debounce]', ...args),
    warn: (...args: any[]) => debug && console.warn('[Debounce]', ...args),
    error: (...args: any[]) => debug && console.error('[Debounce]', ...args),
});

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
function debounce<T extends AnyFunction>(
    func: T,
    options: DebounceOptions = {},
): DebouncedFunction<T> {
    // Input validation
    if (typeof func !== 'function') {
        throw new TypeError('Expected a function');
    }

    const {
        wait = 0,
        leading = false,
        trailing = true,
        maxWait,
        debug = false,
        signal,
        onError,
    } = options;

    // Validate options
    if (wait < 0 || (maxWait !== undefined && maxWait < wait)) {
        throw new RangeError('Invalid wait/maxWait values');
    }

    if (!leading && !trailing) {
        throw new Error('At least one of leading or trailing must be true');
    }

    const logger = createLogger(debug);
    const state: PrivateState<T> = {
        lastInvokeTime: 0,
        pendingPromises: [],
        aborted: false,
    };

    // Setup abort controller handling
    if (signal) {
        signal.addEventListener('abort', () => {
            state.aborted = true;
            cancel();
        });
    }

    /**
     * Cancels all active timers
     * @private
     */
    function cancelTimers(): void {
        if (state.timerId !== undefined) {
            clearTimeout(state.timerId);
            state.timerId = undefined;
            logger.log('Cleared debounce timer');
        }
        if (state.maxTimerId !== undefined) {
            clearTimeout(state.maxTimerId);
            state.maxTimerId = undefined;
            logger.log('Cleared max wait timer');
        }
    }

    /**
     * Cancels any pending function invocations
     * Rejects all pending promises and resets internal state
     */
    function cancel(): void {
        logger.log('Cancelling pending invocations');
        cancelTimers();
        state.lastInvokeTime = 0;
        state.lastArgs = undefined;
        state.lastThis = undefined;
        state.lastCallTime = undefined;
        const error = new Error('Debounced function cancelled');
        handleError(error);
        state.pendingPromises.forEach(({ reject }) =>
            reject(new Error('Debounced function cancelled')),
        );
        state.pendingPromises = [];
    }

    /**
     * Handles errors during function execution
     * @param {Error} error - The error that occurred
     * @private
     */
    function handleError(error: Error): void {
        logger.error('Error occurred:', error);
        if (onError) {
            try {
                onError(error);
            } catch (callbackError) {
                logger.error('Error in onError callback:', callbackError);
            }
        }
    }

    /**
     * Checks if there are any pending function invocations
     * @returns {boolean} True if there are pending invocations
     */
    function pending(): boolean {
        return state.timerId !== undefined;
    }

    /**
     * Determines if the function should be invoked based on timing conditions
     * @param {number} time - Current timestamp
     * @returns {boolean} True if function should be invoked
     * @private
     */
    function shouldInvoke(time: number): boolean {
        if (state.aborted) return false;

        const timeSinceLastCall = state.lastCallTime === undefined ? 0 : time - state.lastCallTime;
        const timeSinceLastInvoke = time - state.lastInvokeTime;

        return (
            state.lastCallTime === undefined ||
            timeSinceLastCall >= wait ||
            timeSinceLastCall < 0 ||
            (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
        );
    }

    /**
     * Executes the underlying function and manages promise resolution
     * @param {number} time - Current timestamp
     * @returns {Promise} Promise resolving to function result
     * @private
     */
    async function invokeFunc(time: number): Promise<Awaited<ReturnType<T>> | void> {
        logger.log(`Invoking function at ${time}`);
        state.lastInvokeTime = time;
        const args = state.lastArgs!;
        const thisArg = state.lastThis;

        state.lastArgs = undefined;
        state.lastThis = undefined;

        try {
            const result = await func.apply(thisArg, args);
            state.result = result;
            state.pendingPromises.forEach(({ resolve }) => resolve(result));
            state.pendingPromises = [];
            logger.log('Function invoked successfully', result);
            return result;
        } catch (error) {
            const wrappedError = error instanceof Error ? error : new Error(String(error));
            logger.error('Error in function invocation:', wrappedError);
            handleError(wrappedError);

            // Clear pending promises after handling error
            const currentPromises = [...state.pendingPromises];
            state.pendingPromises = [];

            // Reject all pending promises
            currentPromises.forEach(({ reject }) => reject(wrappedError));
        }
    }

    /**
     * Starts both the debounce timer and maxWait timer if configured
     * @param {number} time - Current timestamp
     * @private
     */
    function startTimer(time: number): void {
        const remainingTime = remainingWait(time);
        state.timerId = setTimeout(timerExpired, remainingTime);
        logger.log(`Started debounce timer for ${remainingTime}ms`);

        if (maxWait !== undefined && !state.maxTimerId) {
            const timeToMaxWait = maxWait - (time - state.lastCallTime!);
            state.maxTimerId = setTimeout(
                () => {
                    logger.log('Max wait timer expired');
                    cancelTimers();
                    invokeFunc(Date.now());
                },
                Math.max(0, timeToMaxWait),
            );
            logger.log(`Started max wait timer for ${timeToMaxWait}ms`);
        }
    }

    /**
     * Calculates remaining wait time before next execution
     * @param {number} time - Current timestamp
     * @returns {number} Milliseconds until next allowed execution
     * @private
     */
    function remainingWait(time: number): number {
        const timeSinceLastCall = state.lastCallTime ? time - state.lastCallTime : 0;
        return Math.max(0, wait - timeSinceLastCall);
    }

    /**
     * Handles timer expiration
     * @private
     */
    function timerExpired(): void {
        const time = Date.now();
        logger.log('Debounce timer expired');

        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }

        startTimer(time);
    }

    /**
     * Handles leading edge execution
     * @param {number} time - Current timestamp
     * @private
     */
    function leadingEdge(time: number): void {
        logger.log('Leading edge triggered');
        state.lastInvokeTime = time;
        startTimer(time);

        if (leading) {
            invokeFunc(time);
        }
    }

    /**
     * Handles trailing edge execution
     * @param {number} time - Current timestamp
     * @private
     */
    function trailingEdge(time: number): void {
        logger.log('Trailing edge triggered');
        cancelTimers();

        if (trailing && state.lastArgs) {
            invokeFunc(time);
        } else {
            state.pendingPromises.forEach(({ resolve }) => {
                resolve(state.result as Awaited<ReturnType<T>>);
            });
            state.pendingPromises = [];
        }
    }

    /**
     * Immediately executes the debounced function
     * @param {...Parameters<T>} args - Function arguments
     * @returns {Promise<ReturnType<T>>} Promise resolving to function result
     */
    async function flush(...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | void> {
        logger.log('Flush requested');
        const argsToUse = args.length > 0 ? args : state.lastArgs;
        const thisArg = state.lastThis;

        cancelTimers();

        if (argsToUse) {
            state.lastArgs = argsToUse;
            state.lastThis = thisArg;
            return invokeFunc(Date.now());
        }

        return Promise.resolve(state.result!);
    }

    /**
     * Cleans up resources used by the debounced function
     */
    function cleanup(): void {
        logger.log('Cleanup initiated');
        cancel();
        privateState.delete(debounced);
    }

    /**
     * The debounced function that wraps the original
     * @param {...Parameters<T>} args - Function arguments
     * @returns {Promise<ReturnType<T>>} Promise resolving to function result
     */
    const debounced = function(
        this: any,
        ...args: Parameters<T>
    ): Promise<Awaited<ReturnType<T>>> {
        if (state.aborted) {
            return Promise.reject(new Error('Debounced function aborted'));
        }

        const time = Date.now();
        const isInvoking = shouldInvoke(time);

        state.lastArgs = args;
        state.lastThis = this;
        state.lastCallTime = time;

        logger.log('Function called', {
            time,
            isInvoking,
            args,
            pending: pending(),
        });

        return new Promise((resolve, reject) => {
            state.pendingPromises.push({ resolve, reject });

            if (state.timerId === undefined) {
                leadingEdge(time);
            } else {
                cancelTimers();
                startTimer(time);
            }
        });
    } as DebouncedFunction<T>;

    // Store private state
    privateState.set(debounced, state);

    // Add utility methods
    Object.defineProperties(debounced, {
        cancel: { value: cancel, writable: false, configurable: false },
        flush: { value: flush, writable: false, configurable: false },
        pending: { value: pending, writable: false, configurable: false },
        cleanup: { value: cleanup, writable: false, configurable: false },
    });

    return debounced;
}

export { debounce, type DebouncedFunction, type DebounceOptions };
