/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { SignalMetrics } from './interfaces';
/**
 * Monitor signal performance metrics
 */
export declare class SignalMonitor {
    private static metrics;
    private static updateTimes;
    static trackUpdate(duration: number): void;
    static trackComputation(depth: number): void;
    static getMetrics(): SignalMetrics;
    static reset(): void;
}
