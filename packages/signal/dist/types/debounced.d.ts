/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { SignalOptions } from './interfaces';
import { Signal } from './signal';
/**
 * Creates a debounced signal that updates its value after a specified delay
 * when the source signal changes.
 *
 * @param source Source signal to watch for changes
 * @param delay Time in milliseconds to wait before updating output
 * @param options Optional signal configuration
 *
 * @example
 * // Basic debouncing of rapid updates
 * const input = new Signal("");
 * const debouncedInput = debounced(input, 300);
 *
 * input.value = "h";    // t=0ms
 * input.value = "he";   // t=100ms
 * input.value = "hel";  // t=200ms
 * input.value = "hell"; // t=250ms
 *
 * // debouncedInput.value will be "hell" at t=550ms
 *
 * @example
 * // Search input with debouncing
 * const searchQuery = new Signal("");
 * const debouncedSearch = debounced(searchQuery, 500);
 *
 * effect(() => {
 *   // API call only happens 500ms after last keystroke
 *   fetchSearchResults(debouncedSearch.value);
 * });
 *
 * @example
 * // Form validation with debouncing
 * const formData = new Signal({ username: "", email: "" });
 * const debouncedForm = debounced(formData, 400, {
 *   equals: (a, b) => a.username === b.username && a.email === b.email
 * });
 *
 * effect(() => {
 *   // Validation runs 400ms after user stops typing
 *   validateForm(debouncedForm.value);
 * });
 */
export declare function debounced<T>(source: Signal<T>, delay: number, options?: SignalOptions<T>): Signal<T>;
