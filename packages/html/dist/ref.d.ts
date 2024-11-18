import { Component, FunctionComponent } from './core_types';
/**
 * Base ref types
 */
export interface RefObject<T> {
    current: T | null;
}
export interface MutableRefObject<T> {
    current: T;
}
export type RefCallback<T> = (instance: T | null) => void;
export type Ref<T> = RefObject<T> | MutableRefObject<T> | RefCallback<T> | null;
/**
 * Create mutable ref object
 */
export declare function createRef<T>(initialValue?: T | null): MutableRefObject<T | null>;
/**
 * Create callback ref
 */
export declare function createCallbackRef<T>(callback: RefCallback<T>): RefCallback<T>;
/**
 * Merge multiple refs into one
 */
export declare function mergeRefs<T>(...refs: Array<Ref<T>>): RefCallback<T>;
/**
 * Forward ref HOC
 */
export declare function forwardRef<T, P = {}>(render: (props: P, ref: Ref<T>) => JSX.Element): FunctionComponent<P & {
    ref?: Ref<T>;
}>;
/**
 * Ref handling utilities
 */
export declare class RefManager {
    private static refs;
    static registerRef(component: Component, ref: Ref<any>): void;
    static unregisterRef(component: Component, ref: Ref<any>): void;
    static clearRefs(component: Component): void;
    static attachRef<T>(ref: Ref<T> | undefined, instance: T | null): void;
}
