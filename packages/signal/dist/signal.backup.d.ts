/**
 * A TypeScript implementation of the Signal pattern for reactive state management.
 * Signals are reactive primitives that hold values and automatically track dependencies
 * and trigger updates when their values change.
 */
/**
 * Configuration options for creating a Signal
 */
export interface SignalOptions<T> {
    /** Custom equality function to determine if values have changed */
    equals?: (prev: T, next: T) => boolean;
}
/**
 * Interface for objects that can be cleaned up
 */
export interface Disposable {
    dispose(): void;
}
/**
 * Represents a read-only signal that can be subscribed to but not modified
 */
export interface ReadonlySignal<T> {
    readonly value: T;
    subscribe(callback: () => void): () => void;
}
/**
 * Represents a writable signal that can be both read and modified
 */
export interface WritableSignal<T> extends ReadonlySignal<T> {
    value: T;
}
export type Cleanup = void | (() => void);
export type EffectFunction = () => Cleanup;
export type UnsubscribeFunction = () => void;
/**
 * Error thrown when attempting to interact with a disposed signal
 */
export declare class SignalDisposedError extends Error {
    constructor(operation: string);
}
/**
 * Error thrown when a circular dependency is detected in computed signals
 */
export declare class CircularDependencyError extends Error {
    constructor();
}
/**
 * Manages the global state of signal computations and batching
 * Implements the singleton pattern to ensure only one context exists
 */
export declare class SignalContext {
    private static instance;
    private currentComputation;
    private batchDepth;
    static getInstance(): SignalContext;
    getCurrentComputation(): Computation | null;
    setCurrentComputation(computation: Computation | null): void;
    isBatching(): boolean;
    incrementBatch(): void;
    decrementBatch(): void;
}
/**
 * Abstract base class for handling reactive computations
 * Manages dependencies and tracks when recomputation is needed
 */
export declare abstract class Computation implements Disposable {
    protected dirty: boolean;
    protected disposed: boolean;
    dependencies: Set<Signal<any>>;
    protected version: number;
    abstract recompute(): void;
    abstract markDirty(): void;
    isDirty(): boolean;
    isDisposed(): boolean;
    addDependency(signal: Signal<any>): void;
    dispose(): void;
    protected clearDependencies(): void;
    trackDependency(signal: Signal<any>): void;
}
/**
 * Default equality function for comparing signal values
 */
export declare const defaultEquals: <T>(a: T, b: T) => boolean;
/**
 * Core Signal class implementing reactive state management
 * Handles value storage, dependency tracking, and notifications
 */
export declare class Signal<T> implements WritableSignal<T> {
    protected _value: T;
    private version;
    private equals;
    private dependents;
    private subscribers;
    protected disposed: boolean;
    constructor(initialValue: T, options?: SignalOptions<T>);
    /**
     * Gets the current value and tracks dependencies
     */
    get value(): T;
    /**
     * Sets a new value and triggers updates if changed
     */
    set value(newValue: T);
    /**
     * Updates the signal value using a function
     */
    update(fn: (prev: T) => T): void;
    /**
     * Subscribes to value changes and returns cleanup function
     */
    subscribe(callback: () => void): UnsubscribeFunction;
    addDependent(computation: Computation): void;
    removeDependent(computation: Computation): void;
    isDisposed(): boolean;
    /**
     * Cleans up the signal and its dependencies
     */
    dispose(): void;
    /**
     * Notifies all dependents and subscribers of changes
     */
    protected notifyDependents(): void;
}
/**
 * A signal that derives its value from other signals
 * Automatically updates when dependencies change
 */
export declare class ComputedSignal<T> extends Signal<T> {
    private computation;
    constructor(compute: () => T, options?: SignalOptions<T>);
    get value(): T;
    set value(_: T);
    dispose(): void;
}
/**
 * Handles side effects that respond to signal changes
 * Provides cleanup functionality between runs
 */
export declare class Effect implements Disposable {
    private computation;
    private cleanup;
    private disposed;
    constructor(fn: EffectFunction);
    private runEffect;
    dispose(): void;
}
/**
 * Creates a new writable signal with the given initial value
 */
export declare function createSignal<T>(initialValue: T, options?: SignalOptions<T>): Signal<T>;
/**
 * Creates a computed signal that derives its value from other signals
 */
export declare function computed<T>(compute: () => T, options?: SignalOptions<T>): Signal<T>;
/**
 * Creates an effect that runs when its dependencies change
 */
export declare function effect(fn: EffectFunction): Disposable;
/**
 * Batches multiple signal updates to prevent unnecessary recomputations
 */
export declare function batch<T>(fn: () => T): T;
//# sourceMappingURL=signal.backup.d.ts.map