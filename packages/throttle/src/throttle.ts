/**
 * Options for the throttle function.
 */
type ThrottleOptions = {
    /**
     * Specify if the function should be invoked on the leading edge of the timeout.
     * @default true
     */
    leading?: boolean;

    /**
     * Specify if the function should be invoked on the trailing edge of the timeout.
     * @default true
     */
    trailing?: boolean;

    /**
     * Callback to handle errors thrown by the throttled function.
     */
    onError?: (error: any) => void;
};

/**
 * A throttled function that limits the rate at which a function can fire.
 * It ensures the function is called at most once every `limit` milliseconds.
 *
 * @typeParam T - The type of the function to throttle.
 * @param callback - The function to throttle.
 * @param limit - The time interval in milliseconds to throttle executions to.
 * @param options - Configuration options for throttling behavior.
 * @returns A throttled version of the input function with `cancel` and `flush` methods.
 */
type ThrottledFunction<T extends (...args: any[]) => any> = ((...args: Parameters<T>) => void) & {
    /**
     * Cancels any pending executions of the throttled function.
     */
    cancel: () => void;

    /**
     * Immediately invokes the pending execution of the throttled function.
     */
    flush: () => void;
};

/**
 * Creates a throttled version function that limits the rate at which it executes.
 *
 * @param callback - The function to throttle
 * @param limit - The minimum time (in milliseconds) that must pass between function executions defaults to 120ms
 * @param {ThrottleOptions} options - Configuration options for the throttle behavior
 *
 * @returns A throttled version of the provided callback function
 *
 * @example
 * const throttledHandler = throttle(
 *   (event: MouseEvent) => console.log(event.clientX),
 *   250,
 *   { leading: false, trailing: false }
 * );
 * window.addEventListener('mousemove', throttledHandler);
 */
export function throttle<T extends (...args: any[]) => any>(
    callback: T,
    limit: number = 1000 / 120, // 120 FPS
    options: ThrottleOptions = {}
): ThrottledFunction<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let lastCallTime: number | null = null;
    let savedArgs: Parameters<T> | null = null;
    let savedThis: any = null;
    let isExecuting = false;

    const { leading = true, trailing = true, onError } = options;

    /**
     * Invokes the callback with the saved context and arguments.
     */
    const invokeCallback = () => {
        if (savedArgs === null) return;
        isExecuting = true;
        const startTime = now();
        try {
            callback.apply(savedThis, savedArgs);
        } catch (error) {
            if (onError) {
                onError(error instanceof Error ? error : new Error(String(error)));
            } else {
                throw error;
            }
        } finally {
            isExecuting = false;
        }

        lastCallTime = now();
        savedArgs = null;
        savedThis = null;

        // Track execution time
        const executionTime = now() - startTime;
        if (executionTime > limit) {
            console.warn(
                `Execution time (${executionTime}ms) exceeded throttle limit (${limit}ms)`
            );
        }
    };

    /**
     * Handles trailing edge execution with optimized timing
     */
    const trailingExecute = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;

            if (!isExecuting && trailing && savedArgs) {
                const timeSinceLastCall = lastCallTime ? now() - lastCallTime : Infinity;
                // Only execute if enough time has passed
                if (timeSinceLastCall >= limit) {
                    invokeCallback();
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * Starts the timer for the trailing edge invocation.
     * @param remaining - The remaining time before the callback should be invoked.
     */
    const startTimer = (remaining: number) => {
        timeoutId = setTimeout(() => {
            timeoutId = undefined;
            if (trailing) {
                invokeCallback();
            }
        }, remaining);
    };

    const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();

    /**
     * The throttled function that controls the execution rate of the callback.
     */
    const throttled = function (this: any, ...args: Parameters<T>) {
        const _now = now();

        // Handle first call optimization
        if (lastCallTime === null) {
            if (leading) {
                savedArgs = args;
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                savedThis = this;
                invokeCallback();
                return;
            }
            lastCallTime = _now;
        }

        const remaining = lastCallTime ? limit - (_now - lastCallTime) : 0;
        savedArgs = args;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        savedThis = this;

        if (remaining < 0 || remaining > limit) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = undefined;
            }
            lastCallTime = _now;
            invokeCallback();
        } else if (!timeoutId && trailing) {
            startTimer(remaining);
        }
    } as ThrottledFunction<T>;

    /**
     * Cancels any pending executions and resets the throttle state.
     */
    throttled.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        lastCallTime = null;
        savedArgs = null;
        savedThis = null;
        timeoutId = undefined;
        isExecuting = false;
    };

    /**
     * Immediately invokes the pending execution of the throttled function.
     */
    throttled.flush = () => {
        trailingExecute();
    };

    return throttled;
}
