/**
 * Adds an event listener to an element.
 */
export declare function addEventListenerToElement<K extends keyof HTMLElementEventMap>(element: HTMLElement, event: K, handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): void;
/**
 * Removes an event listener from an element.
 */
export declare function removeEventListenerFromElement<K extends keyof HTMLElementEventMap>(element: HTMLElement, event: K, handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): void;
//# sourceMappingURL=EventHandling.d.ts.map