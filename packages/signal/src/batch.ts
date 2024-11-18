/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/


import { SignalContext } from './signalContext';

/**
 * Batch multiple signal updates to prevent cascading updates
 */
export function batch<T>(fn: () => T): T {
    const context = SignalContext.getInstance();
    context.beginBatch();
    try {
        return fn();
    } finally {
        context.endBatch();
    }
}
