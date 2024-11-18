import { RefObject } from '../core_types';
import { useRef } from './useRef';

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
