/**
 * Selects the first element that matches the selector.
 */
export function selectElement<T extends HTMLElement = HTMLElement>(
    selector: string,
    context: ParentNode = document,
): T | null {
    if (typeof document === 'undefined') {
        return null;
    }

    return context.querySelector<T>(selector);
}

/**
 * Selects all elements that match the selector.
 */
export function selectAllElements<T extends HTMLElement = HTMLElement>(
    selector: string,
    context: ParentNode = document,
): NodeListOf<T> {
    return context.querySelectorAll<T>(selector);
}
