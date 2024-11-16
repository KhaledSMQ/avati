/**
 * Removes an element from the DOM.
 */
export function removeElement(element: Element): void {
    if (typeof document === 'undefined') {
        return;
    }

    if (element.parentElement) {
        element.parentElement.removeChild(element);
    }
}
