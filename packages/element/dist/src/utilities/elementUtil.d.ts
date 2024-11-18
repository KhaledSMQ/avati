import { Attributes } from './types';
/**
 * Creates a new HTML element.
 * @param tagName - The name of the tag to create.
 * @param attributes - An object containing key-value pairs of attributes.
 * @param children - An array of child elements or strings.
 * @returns The created HTMLElement or null if not in a browser environment.
 */
export declare function createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, attributes?: Attributes, children?: (HTMLElement | string)[]): HTMLElementTagNameMap[K] | null;
/**
 * Creates a new SVG element.
 * @param tagName - The name of the SVG tag to create.
 * @param attributes - An object containing key-value pairs of attributes.
 * @param children - An array of child elements or strings.
 * @returns The created SVGElement or null if not in a browser environment.
 */
export declare function createSvgElement<K extends keyof SVGElementTagNameMap>(tagName: K, attributes?: Attributes, children?: (SVGElement | string)[]): SVGElementTagNameMap[K] | null;
//# sourceMappingURL=elementUtil.d.ts.map