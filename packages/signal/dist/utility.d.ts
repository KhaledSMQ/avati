/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Signal } from './signal';
/**
 * Default equality function for comparing signal values
 * Uses Object.is for strict equality comparison
 */
export declare const defaultEquals: <T>(a: T, b: T) => boolean;
/**
 * Custom JSON serializer for signals
 * Useful for debugging and persistence
 */
export declare const serializeSignal: <T>(signal: Signal<T>) => string;
/**
 * Type guard to check if a value is a Signal
 */
export declare function isSignal<T>(value: any): value is Signal<T>;
/**
 * Get the current computation depth of a signal chain
 */
export declare function getSignalDepth(signal: Signal<any>): number;
/**
 * Check if a signal is part of a circular dependency chain
 */
export declare function hasCircularDependency(signal: Signal<any>): boolean;
/**
 * Reset the entire signal system state
 * Useful for testing and debugging
 */
export declare function resetSignalSystem(): void;
//# sourceMappingURL=utility.d.ts.map