/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/


import { Signal, SignalOptions } from '../core';

/**
 * Represents the state of an asynchronous operation
 * @template T The type of data being fetched
 * @template E The type of error (defaults to Error)
 */
export interface AsyncState<T, E = Error> {
    /** The fetched data */
    data: T | null;
    /** Whether a fetch is in progress */
    loading: boolean;
    /** Any error that occurred during fetch */
    error: E | null;
    /** When the data was last fetched */
    timestamp: number;
}

/**
 * Configuration options for AsyncSignal
 * @template T The type of data being fetched
 * @template E The type of error
 *
 * @example
 * // Basic caching config
 * const options: AsyncSignalOptions<User> = {
 *   cache: {
 *     enabled: true,
 *     ttl: 5 * 60 * 1000 // 5 minutes
 *   }
 * };
 *
 * @example
 * // Retry with exponential backoff
 * const options: AsyncSignalOptions<User> = {
 *   retryConfig: {
 *     attempts: 3,      // Try 3 times
 *     delay: 1000,      // Start with 1s delay
 *     backoffFactor: 2  // Double delay each retry: 1s, 2s, 4s
 *   }
 * };
 *
 * @example
 * // With analytics callbacks
 * const options: AsyncSignalOptions<User> = {
 *   onSuccess: (user) => {
 *     analytics.track('userFetched', { userId: user.id });
 *     updateUI(user);
 *   },
 *   onError: (error) => {
 *     errorReporting.capture(error);
 *     showErrorToast(error.message);
 *   }
 * };
 */
export interface AsyncSignalOptions<T, E = Error> extends SignalOptions<AsyncState<T, E>> {
    cache?: {
        enabled: boolean;   //
        ttl?: number;      // How long to cache results (ms)
    };
    retryConfig?: {
        attempts: number;    // Maximum retry attempts
        delay: number;      // Initial delay between retries (ms)
        backoffFactor: number; // How much to increase delay each retry
    };
    onError?: (error: E) => void;    // Error callback
    onSuccess?: (data: T) => void;   // Success callback
}

/**
 * A Signal subclass for managing asynchronous operations with built-in
 * loading states, caching, and retry logic
 *
 * @template T Type of data being fetched
 * @template E Type of error that can occur
 *
 * @example
 * // User authentication with error handling
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * interface AuthError {
 *   code: 'invalid_credentials' | 'network_error' | 'server_error';
 *   message: string;
 * }
 *
 * const authSignal = new AsyncSignal<User, AuthError>(
 *   async () => {
 *     const response = await fetch('/api/auth');
 *     if (!response.ok) {
 *       throw {
 *         code: 'invalid_credentials',
 *         message: 'Invalid username or password'
 *       };
 *     }
 *     return response.json();
 *   },
 *   {
 *     cache: { enabled: true, ttl: 30 * 60 * 1000 }, // 30min cache
 *     onError: (error) => {
 *       if (error.code === 'invalid_credentials') {
 *         showLoginForm();
 *       } else {
 *         showErrorDialog(error.message);
 *       }
 *     }
 *   }
 * );
 *
 * @example
 * // Real-time search with request cancellation
 * const searchSignal = new AsyncSignal(
 *   async (query: string) => {
 *     const response = await fetch(`/api/search?q=${query}`);
 *     return response.json();
 *   }
 * );
 *
 * searchInput.addEventListener('input', async (e) => {
 *   const results = await searchSignal.fetch(); // Auto-cancels previous
 *   updateSearchResults(results);
 * });
 *
 * @example
 * // File upload with progress tracking
 * const uploadSignal = new AsyncSignal<string>(
 *   async (file: File) => {
 *     const formData = new FormData();
 *     formData.append('file', file);
 *
 *     const response = await fetch('/api/upload', {
 *       method: 'POST',
 *       body: formData
 *     });
 *
 *     if (!response.ok) {
 *       throw new Error('Upload failed');
 *     }
 *
 *     const { url } = await response.json();
 *     return url;
 *   },
 *   {
 *     retryConfig: {
 *       attempts: 3,
 *       delay: 2000,
 *       backoffFactor: 1.5
 *     },
 *     onSuccess: (url) => {
 *       showSuccess(`File uploaded to ${url}`);
 *     }
 *   }
 * );
 *
 * @example
 * // Polling with caching
 * const pollSignal = new AsyncSignal<JobStatus>(
 *   async (jobId: string) => {
 *     const response = await fetch(`/api/jobs/${jobId}`);
 *     return response.json();
 *   },
 *   {
 *     cache: {
 *       enabled: true,
 *       ttl: 5000 // Cache for 5s between polls
 *     }
 *   }
 * );
 *
 * const pollJob = async (jobId: string) => {
 *   while (true) {
 *     const status = await pollSignal.fetch();
 *     if (status.state === 'completed') break;
 *     await new Promise(resolve => setTimeout(resolve, 5000));
 *   }
 * };
 */
export class AsyncSignal<T, E = Error> extends Signal<AsyncState<T, E>> {
    private readonly fetchFn: () => Promise<T>;
    private options: AsyncSignalOptions<T, E>;
    private abortController: AbortController | null = null;

    constructor(
        fetchFn: () => Promise<T>,
        options: AsyncSignalOptions<T, E> = {},
    ) {
        super({
            data: null,
            loading: false,
            error: null,
            timestamp: 0,
        }, options);

        this.fetchFn = fetchFn;
        this.options = options;
    }

    /**
     * Fetches data using the provided fetch function
     * Handles loading states, caching, retries, and error handling
     *
     * @param force Whether to bypass cache and force a new fetch
     * @returns The fetched data or null if fetch failed
     *
     * @example
     * const signal = new AsyncSignal(fetchUser);
     * await signal.fetch(); // Normal fetch, uses cache if valid
     * await signal.fetch(true); // Force fetch, bypass cache
     */
    async fetch(force: boolean = false): Promise<T | null> {
        // Check cache unless forced refresh
        if (this.isCacheValid() && !force) {
            return this.value.data;
        }

        // Cancel any in-flight request
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();

        // Set loading state
        this.value = {
            ...this.value,
            loading: true,
            error: null,
        };

        // Initialize retry loop variables
        let attempts = 0;
        const maxAttempts = this.options.retryConfig?.attempts || 1;
        const delay = this.options.retryConfig?.delay || 1000;
        const backoffFactor = this.options.retryConfig?.backoffFactor || 2;

        // Retry loop
        while (attempts < maxAttempts) {
            try {
                const data = await this.fetchFn();
                // Update state on success
                this.value = {
                    data,
                    loading: false,
                    error: null,
                    timestamp: Date.now(),
                };
                this.options.onSuccess?.(data);
                return data;
            } catch (error) {
                attempts++;
                // If out of retries, set error state
                if (attempts === maxAttempts) {
                    this.value = {
                        ...this.value,
                        loading: false,
                        error: error as E,
                    };
                    this.options.onError?.(error as E);
                    return null;
                }
                // Wait before retrying with exponential backoff
                await new Promise(resolve =>
                    setTimeout(resolve, delay * Math.pow(backoffFactor, attempts - 1)),
                );
            }
        }

        return null;
    }

    /**
     * Forces a fresh fetch, bypassing cache
     */
    refresh(): Promise<T | null> {
        return this.fetch(true);
    }

    /**
     * Cleans up by aborting any in-flight request
     */
    override dispose(): void {
        if (this.abortController) {
            this.abortController.abort();
        }
        super.dispose();
    }

    /**
     * Checks if cached data is still valid based on TTL
     */
    private isCacheValid(): boolean {
        if (!this.options.cache?.enabled) return false;
        if (!this.value.data) return false;

        const ttl = this.options.cache.ttl || 5 * 60 * 1000; // Default 5 minutes
        return Date.now() - this.value.timestamp < ttl;
    }
}

/**
 * Factory function to create AsyncSignal instances
 *
 * @example
 * // Example 1: Simple user fetch with caching
 * const userSignal = asyncSignal(
 *   async () => {
 *     const response = await fetch('/api/user');
 *     return response.json();
 *   },
 *   {
 *     cache: { enabled: true, ttl: 60000 } // Cache for 1 minute
 *   }
 * );
 *
 * @example
 * // Example 2: Weather API with retries
 * const weatherSignal = asyncSignal(
 *   async () => {
 *     const response = await fetch('https://api.weather.com/current');
 *     return response.json();
 *   },
 *   {
 *     retryConfig: {
 *       attempts: 3,
 *       delay: 1000,
 *       backoffFactor: 2
 *     }
 *   }
 * );
 *
 * @example
 * // Example 3: Todo list with error handling
 * const todoSignal = asyncSignal(
 *   async () => {
 *     const response = await fetch('/api/todos');
 *     if (!response.ok) throw new Error('Failed to fetch todos');
 *     return response.json();
 *   },
 *   {
 *     onError: (error) => console.error('Todo fetch failed:', error),
 *     onSuccess: (todos) => console.log('Fetched todos:', todos.length)
 *   }
 * );
 */
export function asyncSignal<T, E = Error>(
    fetchFn: () => Promise<T>,
    options?: AsyncSignalOptions<T, E>,
): AsyncSignal<T, E> {
    return new AsyncSignal(fetchFn, options);
}
