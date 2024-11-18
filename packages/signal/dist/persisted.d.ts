/**
 * Copyright (c) 2024 Khaled Sameer
 *
 * Defines storage provider interfaces and implementations for persisting signal values
 * across browser sessions and environments.
 */
import { SignalOptions } from './interfaces';
import { Signal } from './signal';
/**
 * Interface for storage providers to get, set and remove persisted values
 */
export interface StorageProvider<T> {
    /** Retrieves value by key, returns null if not found */
    getItem(key: string): T | null;
    /** Stores value with given key */
    setItem(key: string, value: T): void;
    /** Removes value with given key */
    removeItem(key: string): void;
}
/**
 * Uses browser localStorage for persistent storage across sessions
 * Falls back gracefully when not in browser environment
 */
export declare class LocalStorageProvider<T> implements StorageProvider<T> {
    /**
     * Gets item from localStorage
     * @param key - Key to retrieve
     * @returns Stored value or null if not found/not in browser
     */
    getItem(key: string): T | null;
    /**
     * Sets item in localStorage
     * @param key - Key to store under
     * @param value - Value to store
     */
    setItem(key: string, value: T): void;
    /**
     * Removes item from localStorage
     * @param key - Key to remove
     */
    removeItem(key: string): void;
}
/**
 * Uses browser sessionStorage for temporary storage during session
 * Falls back gracefully when not in browser environment
 */
export declare class SessionStorageProvider<T> implements StorageProvider<T> {
    /**
     * Gets item from sessionStorage
     * @param key - Key to retrieve
     * @returns Stored value or null if not found/not in browser
     */
    getItem(key: string): T | null;
    /**
     * Sets item in sessionStorage
     * @param key - Key to store under
     * @param value - Value to store
     */
    setItem(key: string, value: T): void;
    /**
     * Removes item from sessionStorage
     * @param key - Key to remove
     */
    removeItem(key: string): void;
}
/**
 * In-memory storage provider for testing and SSR environments
 * Data persists only during runtime
 */
export declare class MemoryStorageProvider<T> implements StorageProvider<T> {
    /** Map to store key-value pairs in memory */
    private store;
    /**
     * Gets item from memory store
     * @param key - Key to retrieve
     * @returns Stored value or null if not found
     */
    getItem(key: string): T | null;
    /**
     * Sets item in memory store
     * @param key - Key to store under
     * @param value - Value to store
     */
    setItem(key: string, value: T): void;
    /**
     * Removes item from memory store
     * @param key - Key to remove
     */
    removeItem(key: string): void;
}
export type PersistedSignalStorage<T> = {
    storage?: StorageProvider<T>;
};
export type PersistedSignalSignalOptions<T> = SignalOptions<T> & PersistedSignalStorage<T>;
export declare class Persisted<T> extends Signal<T> {
    private readonly storage;
    private readonly key;
    disposed: boolean;
    constructor(key: string, initialValue: T, storage: StorageProvider<T>, options?: SignalOptions<T>);
    get value(): T;
    set value(newValue: T);
    update(fn: (current: T) => T): void;
    dispose(): void;
    reload(): void;
    clear(): void;
    isDisposed(): boolean;
}
export declare function persisted<T>(key: string, initialValue: T, storage: StorageProvider<T>, options?: SignalOptions<T>): Persisted<T>;
//# sourceMappingURL=persisted.d.ts.map