/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { Context } from './context';
import { Computation } from './computation';

export class SubscriptionComputation extends Computation {
    constructor(
        private callback: () => void
    ) {
        super('subscription');
    }

    recompute(): void {
        if (this.disposed) return;
        const context = Context.getInstance();
        const prevComputation = context.getCurrentComputation();
        context.setCurrentComputation(this);

        try {
            this.callback();
        } finally {
            if (prevComputation) {
                context.setCurrentComputation(prevComputation);
            }
            this.dirty = false;
        }
    }
}
