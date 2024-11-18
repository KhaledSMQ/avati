/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/


import { ComputedSignal } from './computedSignal';
import { UpdateQueue } from './updateQueue';
import { SignalMonitor } from './signalMonitor';
import { Signal } from './signal';
import { SignalContext } from './signalContext';

/**
 * Default equality function for comparing signal values
 * Uses Object.is for strict equality comparison
 */
export const defaultEquals = <T>(a: T, b: T): boolean => Object.is(a, b);

/**
 * Custom JSON serializer for signals
 * Useful for debugging and persistence
 */
export const serializeSignal = <T>(signal: Signal<T>): string => {
    return JSON.stringify({
        value: signal.value,
        // @ts-ignore - accessing protected property for serialization
        name: signal['name'],
        // @ts-ignore - accessing protected property for serialization
        disposed: signal['disposed'],
    });
};

/**
 * Type guard to check if a value is a Signal
 */
export function isSignal<T>(value: any): value is Signal<T> {
    return value instanceof Signal;
}

/**
 * Get the current computation depth of a signal chain
 */
export function getSignalDepth(signal: Signal<any>): number {
    if (signal instanceof ComputedSignal) {
        return signal.getDepth();
    }
    return 0;
}

/**
 * Check if a signal is part of a circular dependency chain
 */
export function hasCircularDependency(signal: Signal<any>): boolean {
    const visited = new Set<Signal<any>>();
    const recursionStack = new Set<Signal<any>>();

    function dfs(current: Signal<any>): boolean {
        if (recursionStack.has(current)) {
            return true;
        }
        if (visited.has(current)) {
            return false;
        }

        visited.add(current);
        recursionStack.add(current);

        // @ts-ignore - accessing protected property for cycle detection
        const dependents = current['dependents'] || new Set();
        for (const dependent of dependents) {
            // @ts-ignore - accessing protected property for cycle detection
            if (dependent['computation']?.signal && dfs(dependent['computation'].signal)) {
                return true;
            }
        }

        recursionStack.delete(current);
        return false;
    }

    return dfs(signal);
}

/**
 * Reset the entire signal system state
 * Useful for testing and debugging
 */
export function resetSignalSystem(): void {
    // @ts-ignore
    SignalContext['instance'] = undefined;
    // @ts-ignore
    UpdateQueue['instance'] = undefined;
    SignalMonitor.reset();
}

