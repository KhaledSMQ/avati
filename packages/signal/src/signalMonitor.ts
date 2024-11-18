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
export class SignalMonitor {
    private static metrics: SignalMetrics = {
        updates: 0,
        computations: 0,
        maxChainDepth: 0,
        averageUpdateTime: 0,
    };

    private static updateTimes: number[] = [];

    static trackUpdate(duration: number): void {
        this.metrics.updates++;
        this.updateTimes.push(duration);

        if (this.updateTimes.length > 100) {
            this.updateTimes.shift();
        }

        this.metrics.averageUpdateTime =
            this.updateTimes.reduce((a, b) => a + b, 0) / this.updateTimes.length;
    }

    static trackComputation(depth: number): void {
        this.metrics.computations++;
        this.metrics.maxChainDepth = Math.max(this.metrics.maxChainDepth, depth);
    }

    static getMetrics(): SignalMetrics {
        return { ...this.metrics };
    }

    static reset(): void {
        this.metrics = {
            updates: 0,
            computations: 0,
            maxChainDepth: 0,
            averageUpdateTime: 0,
        };
        this.updateTimes = [];
    }
}
