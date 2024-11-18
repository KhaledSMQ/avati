import { ISignal } from './core_types';
/**
 * Signal value wrapper for reactive state management
 */
export declare class Signal<T> implements ISignal<T> {
    protected _value: T;
    protected _version: number;
    protected _subscribers: Set<() => void>;
    protected _computedSubscribers: Set<ComputedSignal<any>>;
    protected _equals: (prev: T, next: T) => boolean;
    constructor(initialValue: T, options?: {
        equals?: (prev: T, next: T) => boolean;
    });
    get subscribers(): Set<() => void>;
    unsubscribe(callback: () => void): void;
    emit(value: T): void;
    /**
     * Get the current value
     */
    get value(): T;
    /**
     * Set a new value and notify subscribers if changed
     */
    set value(newValue: T);
    /**
     * Update value using a function
     */
    update(fn: (current: T) => T): void;
    /**
     * Subscribe to value changes
     */
    subscribe(callback: () => void): () => void;
    /**
     * Subscribe a computed signal
     */
    _subscribeComputed(computed: ComputedSignal<any>): void;
    /**
     * Unsubscribe a computed signal
     */
    _unsubscribeComputed(computed: ComputedSignal<any>): void;
    /**
     * Notify all subscribers of changes
     */
    protected _notify(): void;
    static _currentComputation: ComputedSignal<any> | null;
    static _trackSignal(signal: Signal<any>): void;
    static _setCurrentComputation(computation: ComputedSignal<any> | null): void;
}
/**
 * Computed signal that derives its value from other signals
 */
export declare class ComputedSignal<T> extends Signal<T> {
    private _compute;
    private _dependencies;
    private _dirty;
    constructor(compute: () => T);
    get value(): T;
    set value(_: T);
    /**
     * Recompute the value if dependencies have changed
     */
    _recompute(): void;
    /**
     * Mark the computed value as dirty when dependencies change
     */
    _markDirty(): void;
}
/**
 * Create a simple signal
 */
export declare function createSignal<T>(initialValue: T, options?: {
    equals?: (prev: T, next: T) => boolean;
}): Signal<T>;
/**
 * Create a computed signal
 */
export declare function computed<T>(compute: () => T): Signal<T>;
/**
 * Create an effect that runs when dependencies change
 */
export declare function effect(fn: () => void): () => void;
/**
 * Batch multiple signal updates
 */
export declare function batch(fn: () => void): void;
