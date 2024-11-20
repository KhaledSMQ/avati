/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
/**
 * Disposed signal operations
 */
export declare class SignalDisposedError extends Error {
    constructor(operation: string);
}
/**
 * Circular dependency detection
 */
export declare class CircularDependencyError extends Error {
    constructor(signalName?: string);
}
