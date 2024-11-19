/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
declare global {
    let __DEV__: boolean;
    let __SILENT__: boolean;
    let __VERSION__: string;
    let __PACKAGE_NAME__: string;
    let __TEST__: boolean;
    let __BROWSER__: boolean;
}
export declare const isDev: boolean;
export declare function assert(condition: any, message: string): asserts condition;
export declare function warn(message: string): void;
export declare function debugLog(message: string, ...args: any[]): void;
