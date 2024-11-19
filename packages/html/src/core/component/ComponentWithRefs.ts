/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { Component } from './Component';

/**
 * Enhanced base component with ref support
 */
export abstract class ComponentWithRefs extends Component {
    private _refCallbacks: Set<() => void> = new Set();

    /**
     * Cleanup all refs when component unmounts
     */
    componentWillUnmount(): void {
        this._refCallbacks.forEach((callback) => callback());
        this._refCallbacks.clear();
        // @ts-ignore
        RefManager.clearRefs(this);
    }

    /**
     * Register a ref callback for cleanup
     */
    protected registerRefCallback(callback: () => void): void {
        this._refCallbacks.add(callback);
    }
}
