/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { Computation } from './computation';
export declare class SubscriptionComputation extends Computation {
    private callback;
    constructor(callback: () => void);
    recompute(): void;
}
