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
export function getMargins(element: HTMLElement | string): MarginValues {
    const el = typeof element === 'string' ? document.querySelector(element) : element;

    if (!el) {
        throw new Error('Element not found');
    }

    const computedStyle = window.getComputedStyle(el);

    return {
        top: parsePixelValue(computedStyle.marginTop),
        right: parsePixelValue(computedStyle.marginRight),
        bottom: parsePixelValue(computedStyle.marginBottom),
        left: parsePixelValue(computedStyle.marginLeft),
        all: computedStyle.margin,
    };
}

/**
 * Gets a specific margin value for an element
 * @param element - HTML element or CSS selector string
 * @param side - Which margin to get (top/right/bottom/left)
 * @returns Margin value in pixels
 */
export function getMargin(element: HTMLElement | string, side: MarginProperty): number {
    const margins = getMargins(element);
    return margins[side];
}

/**
 * Converts CSS pixel string to number
 * @param value - CSS value string (e.g. "10px")
 * @returns Number value without unit
 */
export function parsePixelValue(value: string): number {
    return parseInt(value, 10) || 0;
}

/**
 * Checks if element has any margin
 * @param element - HTML element or CSS selector string
 * @returns boolean indicating if element has any margin
 */
export function hasMargin(element: HTMLElement | string): boolean {
    const margins = getMargins(element);
    return Object.values(margins).some((value) => typeof value === 'number' && value > 0);
}

/**
 * Gets the total horizontal margin (left + right)
 * @param element - HTML element or CSS selector string
 * @returns Combined horizontal margin in pixels
 */
export function getHorizontalMargin(element: HTMLElement | string): number {
    const margins = getMargins(element);
    return margins.left + margins.right;
}

/**
 * Gets the total vertical margin (top + bottom)
 * @param element - HTML element or CSS selector string
 * @returns Combined vertical margin in pixels
 */
export function getVerticalMargin(element: HTMLElement | string): number {
    const margins = getMargins(element);
    return margins.top + margins.bottom;
}
