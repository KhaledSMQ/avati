import { Attributes } from './types';

/**
 * Sets multiple attributes on an element.
 * @param element - The target Element (HTMLElement or SVGElement).
 * @param attributes - An object containing key-value pairs of attributes.
 * @param isSvg - Indicates if the element is an SVG element.
 */
export function setAttributes(
    element: Element,
    attributes: Attributes,
    isSvg: boolean = false
): void {
    Object.entries(attributes).forEach(([key, value]) => {
        setAttribute(element, key, value, isSvg);
    });
}
/**
 * Sets a single attribute on an element.
 * @param element - The target Element (HTMLElement or SVGElement).
 * @param key - The attribute name.
 * @param value - The attribute value.
 * @param isSvg - Indicates if the element is an SVG element.
 */
export function setAttribute(
    element: Element,
    key: string,
    value: any,
    isSvg: boolean = false
): void {
    if (key === 'className') {
        // @ts-ignore
        element.className.baseVal = value; // SVG elements use baseVal for className
    } else if (key === 'style' && typeof value === 'object') {
        // @ts-ignore
        Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.substring(2).toLowerCase();
        element.addEventListener(event, value);
    } else if (key in element) {
        // Type casting to any to avoid TypeScript errors for certain properties
        (element as any)[key] = value;
    } else {
        if (isSvg) {
            element.setAttributeNS(null, key, value);
        } else {
            element.setAttribute(key, value);
        }
    }
}

/**
 * Removes an attribute from an element.
 * @param element - The target HTMLElement.
 * @param key - The attribute name to remove.
 */
export function removeAttribute(element: HTMLElement, key: string): void {
    if (key === 'className') {
        element.className = '';
    } else if (key === 'style') {
        element.removeAttribute('style');
    } else if (key.startsWith('on')) {
        const event = key.substring(2).toLowerCase();
        // Note: To remove an event listener, you need a reference to the handler
        console.warn(
            `Cannot remove event listener for ${event}. You need to keep a reference to the handler.`
        );
    } else {
        element.removeAttribute(key);
    }
}
