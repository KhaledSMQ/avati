/**
 * Appends a child to a parent element.
 */
export function appendChildToElement(parent: Element, child: Element | string): Element {
    if (typeof document === 'undefined') {
        return parent;
    }

    if (typeof child === 'string') {
        parent.appendChild(document.createTextNode(child));
    } else {
        parent.appendChild(child);
    }
    return parent;
}

/**
 * Inserts an element before a reference element.
 */
export function insertElementBefore(
    parent: Element,
    newElement: Element,
    referenceElement: Element,
): void {
    if (typeof document === 'undefined') {
        return;
    }

    parent.insertBefore(newElement, referenceElement);
}

/**
 * Clears all children of an element.
 */
export function clearElementChildren(element: Element): void {
    if (typeof document === 'undefined') {
        return;
    }

    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}
