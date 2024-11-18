/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Disposable } from './interfaces';
import { EffectFunction } from './types';
/**
 * Implementation of reactive effects that automatically track and respond to signal changes.
 * Effects are used to perform side effects in response to reactive updates.
 *
 * @example
 * // Basic effect usage
 * const count = new Signal(0);
 * const dispose = effect(() => {
 *   console.log(`Count changed to: ${count.value}`);
 * });
 * count.value = 1; // Logs: "Count changed to: 1"
 * dispose(); // Cleanup effect
 *
 * @example
 * // Effect with cleanup
 * const visible = new Signal(true);
 * const dispose = effect(() => {
 *   if (visible.value) {
 *     const element = document.createElement('div');
 *     document.body.appendChild(element);
 *     // Return cleanup function
 *     return () => {
 *       document.body.removeChild(element);
 *     };
 *   }
 * });
 *
 * @example
 * // Named effect for debugging
 * const timer = new Signal(0);
 * const dispose = effect(() => {
 *   console.log(`Timer: ${timer.value}`);
 * }, 'timerLogger');
 *
 * @example
 * // Effect with multiple dependencies
 * const firstName = new Signal('John');
 * const lastName = new Signal('Doe');
 * const dispose = effect(() => {
 *   console.log(`Name changed to: ${firstName.value} ${lastName.value}`);
 * });
 *
 * @example
 * // Effect with error handling
 * const data = new Signal<string | Error>(null);
 * const dispose = effect(() => {
 *   try {
 *     if (data.value instanceof Error) {
 *       console.error('Error:', data.value);
 *     } else {
 *       console.log('Data:', data.value);
 *     }
 *   } catch (error) {
 *     console.error('Effect error:', error);
 *   }
 * });
 */
export declare class EffectImpl implements Disposable {
    /**
     * The computation that tracks dependencies and handles recomputation
     */
    private computation;
    /**
     * Cleanup function from the previous effect execution
     */
    private cleanup;
    /**
     * Flag indicating whether the effect has been disposed
     */
    private disposed;
    /**
     * Creates a new effect instance
     *
     * @param fn - The effect function that may return a cleanup function
     * @param name - Optional name for debugging purposes
     */
    constructor(fn: EffectFunction, name?: string);
    /**
     * Executes the effect function and manages cleanup
     * Handles error boundaries for both effect and cleanup execution
     */
    private runEffect;
    /**
     * Disposes of the effect, running cleanup and preventing further executions
     */
    dispose(): void;
}
/**
 * Creates a new effect that automatically tracks and responds to signal changes
 *
 * @param fn - Effect function that may return a cleanup function
 * @param name - Optional name for debugging purposes
 * @returns A disposable object to cleanup the effect
 *
 * @example
 * // DOM manipulation effect
 * const isVisible = new Signal(true);
 * const dispose = effect(() => {
 *   const element = document.querySelector('.target');
 *   element.style.display = isVisible.value ? 'block' : 'none';
 * });
 *
 * @example
 * // Effect with async operations
 * const userId = new Signal<number | null>(null);
 * const dispose = effect(() => {
 *   const id = userId.value;
 *   if (id !== null) {
 *     let cancelled = false;
 *     fetchUserData(id).then(data => {
 *       if (!cancelled) {
 *         // Handle data
 *       }
 *     });
 *     return () => {
 *       cancelled = true;
 *     };
 *   }
 * });
 */
export declare function effect(fn: EffectFunction, name?: string): Disposable;
//# sourceMappingURL=effect.d.ts.map