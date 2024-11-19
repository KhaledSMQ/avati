/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

/**
 * Implementation of useRef hook that maintains a mutable reference
 * that persists across component re-renders.
 *
 * @template T The type of value being stored in the ref
 * @param {T | null} initialValue - The initial value to store in the ref (defaults to null)
 * @returns {MutableRefObject<T | null>} A mutable ref object with a 'current' property
 *
 * @example
 * // Basic usage
 * const myRef = useRef<HTMLDivElement>(null);
 *
 * // With initial value
 * const countRef = useRef<number>(0);
 *
 * @implementation
 * The hook works by:
 * 1. Getting the current hooks context instance
 * 2. Creating/retrieving hook state with the ref value
 * 3. Registering the ref for cleanup handling
 * 4. Returning the mutable ref object
 */
import { MutableRefObject } from '../ref';
import { HooksContext, HookState } from '../hooksContext';

export function useRef<T>(initialValue: T | null = null): MutableRefObject<T | null> {
    // Get the current hooks context singleton instance
    const context = HooksContext.getInstance();

    // Create or retrieve the hook state for this ref
    // The state includes:
    // - value: An object with a 'current' property holding the ref value
    // - type: Identifier marking this as a 'ref' type hook
    const hookState = context.getHookState<HookState>({
        value: { current: initialValue },
        type: 'ref',
    });

    // Register this ref with the context for proper cleanup handling
    // This ensures the ref is properly handled during unmounting
    context.registerRef(hookState.value);

    // Return the mutable ref object that can be used to persist values
    // between renders without triggering re-renders
    return hookState.value;
}
