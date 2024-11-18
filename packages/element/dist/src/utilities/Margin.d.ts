export interface MarginValues {
    top: number;
    right: number;
    bottom: number;
    left: number;
    all: string;
}
export type MarginProperty = 'top' | 'right' | 'bottom' | 'left';
/**
 * Gets all margin values for an HTML element
 * @param element - HTML element or CSS selector string
 * @returns Object containing margin values in pixels
 * @throws Error if element not found
 */
export declare function getMargins(element: HTMLElement | string): MarginValues;
/**
 * Gets a specific margin value for an element
 * @param element - HTML element or CSS selector string
 * @param side - Which margin to get (top/right/bottom/left)
 * @returns Margin value in pixels
 */
export declare function getMargin(element: HTMLElement | string, side: MarginProperty): number;
/**
 * Converts CSS pixel string to number
 * @param value - CSS value string (e.g. "10px")
 * @returns Number value without unit
 */
export declare function parsePixelValue(value: string): number;
/**
 * Checks if element has any margin
 * @param element - HTML element or CSS selector string
 * @returns boolean indicating if element has any margin
 */
export declare function hasMargin(element: HTMLElement | string): boolean;
/**
 * Gets the total horizontal margin (left + right)
 * @param element - HTML element or CSS selector string
 * @returns Combined horizontal margin in pixels
 */
export declare function getHorizontalMargin(element: HTMLElement | string): number;
/**
 * Gets the total vertical margin (top + bottom)
 * @param element - HTML element or CSS selector string
 * @returns Combined vertical margin in pixels
 */
export declare function getVerticalMargin(element: HTMLElement | string): number;
//# sourceMappingURL=Margin.d.ts.map