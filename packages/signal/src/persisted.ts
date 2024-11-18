/**
 * Copyright (c) 2024 Khaled Sameer
 *
 * Defines storage provider interfaces and implementations for persisting signal values
 * across browser sessions and environments.
 */

import { SignalOptions } from './interfaces';
import { Signal } from './signal';
import { effect } from './effect';
import { SignalDisposedError } from './errors';

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
export class LocalStorageProvider<T> implements StorageProvider<T> {
    /**
     * Gets item from localStorage
     * @param key - Key to retrieve
     * @returns Stored value or null if not found/not in browser
     */
    getItem(key: string): T | null {
        if (typeof window === 'undefined') return null;
        const presented = window.localStorage.getItem(key);
        if (presented) {
            return JSON.parse(presented);
        }
        return null;
    }

    /**
     * Sets item in localStorage
     * @param key - Key to store under
     * @param value - Value to store
     */
    setItem(key: string, value: T): void {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Removes item from localStorage
     * @param key - Key to remove
     */
    removeItem(key: string): void {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(key);
    }
}

/**
 * Uses browser sessionStorage for temporary storage during session
 * Falls back gracefully when not in browser environment
 */
export class SessionStorageProvider<T> implements StorageProvider<T> {
    /**
     * Gets item from sessionStorage
     * @param key - Key to retrieve
     * @returns Stored value or null if not found/not in browser
     */
    getItem(key: string): T | null {
        if (typeof window === 'undefined') return null;
        const presented = window.sessionStorage.getItem(key);
        if (presented) {
            return JSON.parse(presented);
        }
        return null;
    }

    /**
     * Sets item in sessionStorage
     * @param key - Key to store under
     * @param value - Value to store
     */
    setItem(key: string, value: T): void {
        if (typeof window === 'undefined') return;
        window.sessionStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Removes item from sessionStorage
     * @param key - Key to remove
     */
    removeItem(key: string): void {
        if (typeof window === 'undefined') return;
        window.sessionStorage.removeItem(key);
    }
}

/**
 * In-memory storage provider for testing and SSR environments
 * Data persists only during runtime
 */
export class MemoryStorageProvider<T> implements StorageProvider<T> {
    /** Map to store key-value pairs in memory */
    private store = new Map<string, T>();

    /**
     * Gets item from memory store
     * @param key - Key to retrieve
     * @returns Stored value or null if not found
     */
    getItem(key: string): T | null {
        return this.store.get(key) ?? null;
    }

    /**
     * Sets item in memory store
     * @param key - Key to store under
     * @param value - Value to store
     */
    setItem(key: string, value: T): void {
        this.store.set(key, value);
    }

    /**
     * Removes item from memory store
     * @param key - Key to remove
     */
    removeItem(key: string): void {
        this.store.delete(key);
    }
}


export type PersistedSignalStorage<T> = {
    storage?: StorageProvider<T>;
}

export type PersistedSignalSignalOptions<T> = SignalOptions<T> & PersistedSignalStorage<T>;

export class Persisted<T> extends Signal<T> {
    disposed = false;
    private readonly storage: StorageProvider<T>;
    private readonly key: string;

    constructor(
        key: string,
        initialValue: T,
        storage: StorageProvider<T>,
        options?: SignalOptions<T>,
    ) {
        const storedValue = storage.getItem(key);
        super(storedValue ?? initialValue, options);

        this.key = key;
        this.storage = storage;

        effect(() => {
            if (this.disposed) return;
            this.storage.setItem(this.key, this.value);
        }, `persist-${key}`);
    }

    get value(): T {
        if (this.disposed) {
            throw new SignalDisposedError('Cannot read from disposed signal');
        }
        return super.value;
    }

    set value(newValue: T) {
        if (this.disposed) {
            throw new SignalDisposedError('Cannot write to disposed signal');
        }
        super.value = newValue;
    }

    update(fn: (current: T) => T): void {
        if (this.disposed) {
            throw new SignalDisposedError('Cannot update disposed signal');
        }
        this.value = fn(this.value);
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.storage.removeItem(this.key);
        super.dispose();
    }

    reload(): void {
        if (this.disposed) {
            throw new SignalDisposedError('Cannot reload disposed signal');
        }
        const value = this.storage.getItem(this.key);
        if (value !== null) {
            this.value = value;
        }
    }

    clear(): void {
        if (this.disposed) {
            throw new SignalDisposedError('Cannot clear disposed signal');
        }
        this.storage.removeItem(this.key);
    }

    isDisposed(): boolean {
        return this.disposed;
    }
}

export function persisted<T>(
    key: string,
    initialValue: T,
    storage: StorageProvider<T>,
    options?: SignalOptions<T>,
): Persisted<T> {
    return new Persisted(key, initialValue, storage, options);
}
