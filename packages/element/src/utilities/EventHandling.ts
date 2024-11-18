/**
 * Adds an event listener to an element.
 */
export function addEventListenerToElement<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    event: K,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
): void {
    if (typeof document === 'undefined') {
        return;
    }

    element.addEventListener(event, handler);
}

/**
 * Removes an event listener from an element.
 */
export function removeEventListenerFromElement<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    event: K,
    handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
): void {
    if (typeof document === 'undefined') {
        return;
    }

    element.removeEventListener(event, handler);
}
