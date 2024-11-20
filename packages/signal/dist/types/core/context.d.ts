/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { IComputation, IEffect, WritableSignal } from './interfaces';
/**
 * Manages the global state and context of signal computations
 */
export declare class Context {
    private static instance;
    private computationStack;
    private batchDepth;
    private batchQueue;
    private activeEffects;
    static getInstance(): Context;
    getCurrentComputation(): IComputation | undefined;
    pushComputation(computation: IComputation): void;
    popComputation(): void;
    isBatching(): boolean;
    beginBatch(): void;
    endBatch(): void;
    addToBatchQueue(signal: WritableSignal<any>): void;
    flushBatchQueue(): void;
    setCurrentComputation(computation: IComputation): void;
    registerEffect(effect: IEffect): void;
    unregisterEffect(effect: IEffect): void;
    isInEffect(): boolean;
}
