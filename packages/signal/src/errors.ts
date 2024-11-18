/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/


/**
 * Disposed signal operations
 */
export class SignalDisposedError extends Error {
    constructor(operation: string) {
        super(`Cannot ${operation} a disposed signal`);
        this.name = 'SignalDisposedError';
    }
}

/**
 * Circular dependency detection
 */
export class CircularDependencyError extends Error {
    constructor(signalName?: string) {
        super(`Circular dependency detected${signalName ? ` in signal "${signalName}"` : ''}`);
        this.name = 'CircularDependencyError';
    }
}
