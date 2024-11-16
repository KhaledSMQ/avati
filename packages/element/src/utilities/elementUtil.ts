import { setAttributes } from './Attribute';
import { Attributes } from './types';

/**
 * Creates a new HTML element.
 * @param tagName - The name of the tag to create.
 * @param attributes - An object containing key-value pairs of attributes.
 * @param children - An array of child elements or strings.
 * @returns The created HTMLElement or null if not in a browser environment.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes?: Attributes,
    children?: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] | null {
    if (typeof document === 'undefined') {
        // Server-side environment; return null or a virtual representation if needed
        return null;
    }

    const element = document.createElement(tagName);

    if (attributes) {
        setAttributes(element, attributes);
    }

    if (children && children.length > 0) {
        children.forEach((child) => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
    }

    return element;
}

/**
 * Creates a new SVG element.
 * @param tagName - The name of the SVG tag to create.
 * @param attributes - An object containing key-value pairs of attributes.
 * @param children - An array of child elements or strings.
 * @returns The created SVGElement or null if not in a browser environment.
 */
export function createSvgElement<K extends keyof SVGElementTagNameMap>(
    tagName: K,
    attributes?: Attributes,
    children?: (SVGElement | string)[]
): SVGElementTagNameMap[K] | null {
    if (typeof document === 'undefined') {
        // Server-side environment; return null or a virtual representation if needed
        return null;
    }

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const element = document.createElementNS(SVG_NS, tagName) as SVGElementTagNameMap[K];

    if (attributes) {
        setAttributes(element, attributes, true); // Indicate SVG context
    }

    if (children && children.length > 0) {
        children.forEach((child) => {
            if (typeof child === 'string') {
                // Text nodes are rare in SVG but possible (e.g., <text>)
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
    }

    return element;
}
