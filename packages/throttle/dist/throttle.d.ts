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
export declare function throttle<T extends (...args: any[]) => any>(callback: T, limit?: number, // 120 FPS
options?: ThrottleOptions): ThrottledFunction<T>;
export {};
//# sourceMappingURL=throttle.d.ts.map