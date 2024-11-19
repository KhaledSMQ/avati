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

export const isDev = __DEV__;

export function assert(condition: any, message: string): asserts condition {
    if (__DEV__ && !condition) {
        throw new Error(message);
    }
}

export function warn(message: string): void {
    if (__DEV__) {
        console.warn(`[${__PACKAGE_NAME__}]: ${message}`);
    }
}

export function debugLog(message: string, ...args: any[]): void {
    if (__DEV__ && !__SILENT__) {
        const now = new Date();
        // @ts-ignore
        const timeWithMs = now.toISOString().split('T')[1].slice(0, -1);
        console.log(`${timeWithMs} [${__PACKAGE_NAME__}@${__VERSION__}]: ${message}`, ...args);
    }
}
