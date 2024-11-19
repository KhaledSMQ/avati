/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Computation } from './computation';
import { Signal } from './signal';
import { EffectImpl } from './effect';
/**
 * Manages the global state and context of signal computations
 */
export declare class SignalContext {
    private static instance;
    private computationStack;
    private batchDepth;
    private batchQueue;
    private activeEffects;
    static getInstance(): SignalContext;
    getCurrentComputation(): Computation | undefined;
    pushComputation(computation: Computation): void;
    popComputation(): void;
    isBatching(): boolean;
    beginBatch(): void;
    endBatch(): void;
    addToBatchQueue(signal: Signal<any>): void;
    flushBatchQueue(): void;
    setCurrentComputation(computation: Computation): void;
    registerEffect(effect: EffectImpl): void;
    unregisterEffect(effect: EffectImpl): void;
    isInEffect(): boolean;
}
