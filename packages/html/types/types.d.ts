/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

declare const __DEV__: boolean;

declare namespace JSX {
    interface Element {
        type: any;
        props: any;
        key?: any;
        ref?: any;
        displayName?: string | null;
    }
}
