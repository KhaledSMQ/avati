/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { EffectState, HooksContext, HookState } from '../hooksContext';
import { DependencyList, EffectCallback } from './types';
import { Environment } from '../environment';


/**
 * Validation utilities with proper type predicates
 */
const Validators = {
    isEffectCallback(value: unknown): value is EffectCallback {
        return typeof value === 'function';
    },

    isDepsArray(value: unknown): value is any[] | undefined {
        return value === undefined || Array.isArray(value);
    },

    checkDependencies(deps: any[]): void {
        if (!Environment.isDevelopment()) return;

        deps.forEach((dep, index) => {
            if (typeof dep === 'function') {
                console.warn(
                    'useEffect received a function as a dependency at index',
                    index,
                    '\nThis may cause unnecessary effect reruns.',
                    '\nConsider using a ref or state for function dependencies.'
                );
            }

            if (dep && typeof dep === 'object' && !Object.isFrozen(dep)) {
                console.warn(
                    'useEffect received a mutable object as a dependency at index',
                    index,
                    '\nThis may cause unnecessary effect reruns.',
                    '\nConsider using a primitive value or useMemo.'
                );
            }

            if (dep === null || dep === undefined) {
                console.warn(
                    'useEffect received null or undefined as a dependency at index',
                    index,
                    '\nThis might indicate a missing dependency.'
                );
            }
        });
    }
};

/**
 * Helper to check if dependencies have changed
 */
function haveDepsChanged(oldDeps: any[] | undefined, newDeps: any[] | undefined): boolean {
    // No deps means run every time
    if (!newDeps) {
        return true;
    }

    // First run or length changed
    if (!oldDeps || oldDeps.length !== newDeps.length) {
        return true;
    }

    // Compare each dependency
    return newDeps.some((dep, i) => !Object.is(dep, oldDeps[i]));
}

/**
 * useEffect hook for handling side effects in components
 *
 * @param effect - Function containing side-effect logic and optional cleanup
 * @param deps - Optional array of dependencies to control effect execution
 *
 * @example
 * // Effect that runs on every render
 * useEffect(() => {
 *   console.log('Component rendered');
 * });
 *
 * @example
 * // Effect that runs only when count changes
 * useEffect(() => {
 *   console.log('Count changed:', count);
 *   // Cleanup function
 *   return () => console.log('Cleaning up');
 * }, [count]);
 *
 * @example
 * // Effect that runs only once on mount
 * useEffect(() => {
 *   const handler = () => console.log('Window resized');
 *   window.addEventListener('resize', handler);
 *   return () => window.removeEventListener('resize', handler);
 * }, []);
 *
 * @throws {TypeError} When effect is not a function or deps is not an array
 */
export function useEffect(effect: EffectCallback, deps?: DependencyList): void {
    // Input validation
    if (!Validators.isEffectCallback(effect)) {
        throw new TypeError(
            `useEffect first argument must be a function, received: ${typeof effect}`
        );
    }

    if (!Validators.isDepsArray(deps)) {
        throw new TypeError(
            `useEffect second argument must be an array or undefined, received: ${typeof deps}`
        );
    }

    // Development mode checks
    if (Environment.isDevelopment() && deps) {
        Validators.checkDependencies(deps);
    }

    // Get hooks context
    const context = HooksContext.getInstance();

    // Get or initialize effect state
    const hookState = context.getHookState<EffectState>({
        type: 'effect',
        effect,
        deps,
        depsChanged: true,
    });

    // Check if dependencies have changed
    hookState.depsChanged = haveDepsChanged(hookState.deps, deps);

    // Update state
    if (hookState.depsChanged) {
        hookState.deps = deps;
    }
    hookState.effect = effect;
}

/**
 * Type guard to check if a hook state is an effect state
 */
export function isEffectState(state: HookState): state is EffectState {
    return state.type === 'effect';
}
