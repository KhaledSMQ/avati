import { Attributes } from './types';
/**
 * Sets multiple attributes on an element.
 * @param element - The target Element (HTMLElement or SVGElement).
 * @param attributes - An object containing key-value pairs of attributes.
 * @param isSvg - Indicates if the element is an SVG element.
 */
export declare function setAttributes(element: Element, attributes: Attributes, isSvg?: boolean): void;
/**
 * Sets a single attribute on an element.
 * @param element - The target Element (HTMLElement or SVGElement).
 * @param key - The attribute name.
 * @param value - The attribute value.
 * @param isSvg - Indicates if the element is an SVG element.
 */
export declare function setAttribute(element: Element, key: string, value: any, isSvg?: boolean): void;
/**
 * Removes an attribute from an element.
 * @param element - The target HTMLElement.
 * @param key - The attribute name to remove.
 */
export declare function removeAttribute(element: HTMLElement, key: string): void;
//# sourceMappingURL=Attribute.d.ts.map