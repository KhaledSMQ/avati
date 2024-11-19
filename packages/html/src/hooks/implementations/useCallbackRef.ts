/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { useRef } from './useRef';
import { RefObject } from '../utils';


export function useCallbackRef<T>(callback: (instance: T | null) => void): RefObject<T> {
    const callbackRef = useRef<T | null>(null);
    const savedCallback = useRef(callback);
    savedCallback.current = callback;

    return {
        get current() {
            return callbackRef.current;
        },
        set current(value: T | null) {
            callbackRef.current = value;
            // @ts-ignore
            savedCallback.current(value);
        },
    };
}
