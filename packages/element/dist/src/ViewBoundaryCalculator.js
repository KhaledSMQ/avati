/**
 * @fileoverview ViewBoundaryCalculator provides functionality for calculating and managing view boundaries
 * in a hierarchical layout system. It handles coordinate calculations, margin applications, and nested view
 * relationships while ensuring numerical accuracy and proper error handling.
 *
 * @example
 * ```typescript
 * const elementBounds = {
 *   x: 0, y: 0, width: 100, height: 100,
 *   right: 100, bottom: 100,
 *   margins: { top: 10, right: 10, bottom: 10, left: 10 }
 * };
 *
 * const childViews = [myChildView1, myChildView2];
 * const config = { scale: { x: 1.5, y: 1.5 } };
 *
 * const bounds = ViewBoundaryCalculator.calculateBounds(elementBounds, childViews, config);
 * ```
 **/
/**
 * ViewBoundaryCalculator Boundaries Diagram
 *
 * Legend:
 * + : Corner points
 * - : Horizontal edges
 * | : Vertical edges
 * · : Margin area
 * # : Element content area
 * ~ : Child view area (when present)
 **/
/**
 *     Outer Bounds (includes margins)
 *     +------------------------------------------+
 *     |· · · · · · top margin · · · · · · · · · ·|
 *     |· +----------------------------------+ · ·|
 *     |· |             Inner Bounds         | · ·|
 *     |· |  +----------------------------+  | · ·|
 *     |· |  |      Element Bounds        |  | · ·|
 *     |· |  |                            |  | · ·|
 *     |l |  |     ##################     |  | · r|
 *     |e |  |     ##################     |  | · i|
 *     |f |  |     #####Content#####      |  | · g|
 *     |t |  |     ##################     |  | · h|
 *     |  |  |     ##################     |  | · t|
 *     |m |  |          ~~~~~             |  | · ·|
 *     |a |  |      Child Views (~)       |  | · m|
 *     |r |  |          ~~~~~             |  | · a|
 *     |g |  |                            |  | · r|
 *     |i |  |                            |  | · g|
 *     |n |  +----------------------------+  | · i|
 *     |· |                                  | · n|
 *     |· +----------------------------------+ ·  |
 *     |· · · · · bottom margin · · · · · · ·  ·  |
 *     +------------------------------------------+
 **/
/**
 * Coordinate System:
 * - Origin (0,0) is at top-left
 * - X increases right
 * - Y increases down
 *
 * Boundaries:
 * 1. Element Bounds: Basic rectangle of the element
 *    - Position: (x, y)
 *    - Size: width × height
 *    - Right = x + width
 *    - Bottom = y + height
 *
 * 2. Inner Bounds: Contains element and child views
 *    - Expands to contain all child views
 *    - No margins applied
 *    - Must contain element bounds
 *
 * 3. Outer Bounds: Largest boundary
 *    - Includes all margins
 *    - Contains inner bounds + margins
 *    - Final rendered size
 *
 * Margins:
 * - top: Space above content
 * - right: Space to the right
 * - bottom: Space below content
 * - left: Space to the left
 *
 * Child Views:
 * - Can extend beyond element bounds
 * - Contribute to inner bounds
 * - May affect outer bounds
 * - Invalid children are ignored
 *
 * Calculations:
 * 1. Start with element bounds
 * 2. Expand for child views
 * 3. Calculate inner bounds
 * 4. Add margins for outer bounds
 *
 * Example Dimensions:
 * Element: (x:10, y:10, width:100, height:100)
 * Margins: (top:10, right:10, bottom:10, left:10)
 * Inner:   (x:10, y:10, width:120, height:120)
 * Outer:   (x:0, y:0, width:140, height:140)
 **/
/**
 * Child View Impact:
 * +------------------------------------------+
 * |· · · · · · · · · · · · · · · · · · · ·  ·|
 * |· +----------------------------------+ · ·|
 * |· |    Inner (includes children)     | · ·|
 * |· |  +----------------------------+  | · ·|
 * |· |  |      Element              ~|  | · ·|
 * |· |  |                          ~~|  | · ·|
 * |· |  |                         ~~~|  | · ·|
 * |· |  |                       ~~~~~|  | · ·|
 * |· |  |                     ~~~~~~~|  | · ·|
 * |· |  |                   ~~~~~~~~~|  | · ·|
 * |· |  |                 ~~~~~~~~~~~|  | · ·|
 * |· |  |               ~~~~~~~~~~~~~|  | · ·|
 * |· |  +----------------------------+  | · ·|
 * |· |                                  | · ·|
 * |· +----------------------------------+ · ·|
 * |· · · · · · · · · · · · · · · · · · ·  · ·|
 * +------------------------------------------+
 *       Child view extending beyond
 *       element bounds but contained
 *       within inner bounds
 *
 */
import { parsePixelValue } from './utilities';
export const GetElementBounds = (element) => {
    const rect = element.getBoundingClientRect();
    const computedStyle = getComputedStyle(element);
    const margins = {
        top: parseFloat(computedStyle.marginTop),
        right: parseFloat(computedStyle.marginRight),
        bottom: parseFloat(computedStyle.marginBottom),
        left: parseFloat(computedStyle.marginLeft)
    };
    return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
        margins
    };
};
/**
 * Creates a ChildView instance for an HTML element with optional layout inclusion.
 * @param element
 * @param includeInLayout
 * @constructor
 */
export const ChildViewElement = (element, includeInLayout = false) => {
    return {
        shouldIncludeInLayout() {
            return includeInLayout;
        },
        getBounds() {
            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(this.element);
            const margins = {
                top: parsePixelValue(computedStyle.marginTop),
                right: parsePixelValue(computedStyle.marginRight),
                bottom: parsePixelValue(computedStyle.marginBottom),
                left: parsePixelValue(computedStyle.marginLeft)
            };
            const elementBounds = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                right: rect.right,
                bottom: rect.bottom,
                margins
            };
            return {
                element: elementBounds,
                inner: {
                    x: elementBounds.x,
                    y: elementBounds.y,
                    width: elementBounds.width,
                    height: elementBounds.height,
                    right: elementBounds.right,
                    bottom: elementBounds.bottom
                },
                outer: {
                    x: elementBounds.x - margins.left,
                    y: elementBounds.y - margins.top,
                    width: elementBounds.width + margins.left + margins.right,
                    height: elementBounds.height + margins.top + margins.bottom,
                    right: elementBounds.right + margins.right,
                    bottom: elementBounds.bottom + margins.bottom
                }
            };
        },
    };
};
// Constants for validation and precision handling
/**
 * Epsilon value for floating-point comparison operations.
 * Used to handle floating-point precision errors in geometric calculations.
 */
const EPSILON = 0.000001;
/**
 * Maximum safe coordinate value to prevent overflow issues.
 * Coordinates exceeding this value will trigger validation errors.
 */
const MAX_SAFE_COORDINATE = 1e7; // 10 million
/**
 * Custom error class for boundary calculation related errors.
 *
 * @class BoundaryCalculationError
 * @extends Error
 */
export class BoundaryCalculationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BoundaryCalculationError';
    }
}
/**
 * Manages the calculation of view boundaries and layouts with comprehensive
 * validation and error handling.
 *
 * @class ViewBoundaryCalculator
 */
export class ViewBoundaryCalculator {
    /**
     * Validates that a numeric value is finite and within safe bounds.
     *
     * @throws {BoundaryCalculationError} If the value is invalid
     * @param {number} value - The numeric value to validate
     * @param {string} name - The name of the value for error reporting
     */
    static validateNumber(value, name) {
        if (!Number.isFinite(value)) {
            throw new BoundaryCalculationError(`${name} must be a finite number`);
        }
        if (Math.abs(value) > MAX_SAFE_COORDINATE) {
            throw new BoundaryCalculationError(`${name} exceeds maximum safe coordinate value`);
        }
    }
    /**
     * Validates a rectangle's dimensions and coordinates for consistency.
     *
     * @throws {BoundaryCalculationError} If the rectangle is invalid
     * @param {Rectangle} rect - The rectangle to validate
     * @param {string} [name='Rectangle'] - Name for error reporting
     */
    static validateRectangle(rect, name = 'Rectangle') {
        this.validateNumber(rect.x, `${name}.x`);
        this.validateNumber(rect.y, `${name}.y`);
        this.validateNumber(rect.width, `${name}.width`);
        this.validateNumber(rect.height, `${name}.height`);
        this.validateNumber(rect.right, `${name}.right`);
        this.validateNumber(rect.bottom, `${name}.bottom`);
        if (rect.width < 0 || rect.height < 0) {
            throw new BoundaryCalculationError(`${name} cannot have negative dimensions`);
        }
        const calculatedRight = rect.x + rect.width;
        const calculatedBottom = rect.y + rect.height;
        if (Math.abs(calculatedRight - rect.right) > EPSILON ||
            Math.abs(calculatedBottom - rect.bottom) > EPSILON) {
            throw new BoundaryCalculationError(`${name} coordinates are inconsistent with dimensions`);
        }
    }
    /**
     * Validates that all margin values are non-negative.
     *
     * @throws {BoundaryCalculationError} If any margin is negative
     * @param {Margins} margins - The margins to validate
     */
    static validateMargins(margins) {
        if (margins.top < 0 || margins.right < 0 ||
            margins.bottom < 0 || margins.left < 0) {
            throw new BoundaryCalculationError('Margins cannot be negative');
        }
    }
    /**
     * Validates that scale factors are positive numbers.
     *
     * @throws {BoundaryCalculationError} If scale factors are invalid
     * @param {Point2D} scale - The scale factors to validate
     */
    static validateScale(scale) {
        if (scale.x <= 0 || scale.y <= 0) {
            throw new BoundaryCalculationError('Scale factors must be positive');
        }
    }
    /**
     * Calculates view boundaries based on element bounds and child views.
     *
     * @throws {BoundaryCalculationError} If input parameters are invalid
     * @param {Rectangle & { margins: Margins }} elementBounds - The main element bounds
     * @param {ChildView[]} childViews - Array of child views
     * @param {ViewConfig} [config={}] - Optional configuration parameters
     * @returns {ViewBounds} The calculated view boundaries
     *
     * @example
     * ```typescript
     * const bounds = ViewBoundaryCalculator.calculateBounds(
     *   elementBounds,
     *   childViews,
     *   { scale: { x: 2, y: 2 } }
     * );
     * ```
     */
    static calculateBounds(elementBounds, childViews, config = {}) {
        this.validateRectangle(elementBounds, 'elementBounds');
        this.validateMargins(elementBounds.margins);
        const { offset = { x: 0, y: 0 }, scale = { x: 1, y: 1 } } = config;
        this.validateNumber(offset.x, 'offset.x');
        this.validateNumber(offset.y, 'offset.y');
        this.validateScale(scale);
        const baseBounds = this.createBaseBounds(elementBounds, offset, scale);
        const childBounds = this.calculateCombinedChildBounds(childViews);
        const combinedBounds = this.combineBounds(baseBounds, childBounds, elementBounds.margins);
        this.validateRectangle(combinedBounds.inner, 'combinedBounds.inner');
        this.validateRectangle(combinedBounds.outer, 'combinedBounds.outer');
        return combinedBounds;
    }
    /**
     * Creates the initial boundary structure based on the element's bounds, offset, and scale.
     *
     * @param element - The main element's rectangle including margins.
     * @param offset - The offset to apply to the element's position.
     * @param scale - The scale factors to apply to the element's dimensions.
     * @returns The base ViewBounds with initialized inner and outer rectangles.
     */
    static createBaseBounds(element, offset, scale) {
        // Calculate scaled dimensions
        const scaledWidth = element.width * scale.x;
        const scaledHeight = element.height * scale.y;
        // Calculate outer bounds with offset
        const outer = {
            x: offset.x,
            y: offset.y,
            width: scaledWidth,
            height: scaledHeight,
            right: offset.x + scaledWidth,
            bottom: offset.y + scaledHeight,
        };
        // Create inner bounds (original element size)
        const inner = {
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
            right: element.x + element.width,
            bottom: element.y + element.height,
        };
        return {
            element: { ...element },
            inner,
            outer,
        };
    }
    /**
     * Calculates the combined bounds of all child views that should be included in the layout.
     *
     * @param childViews - An array of ChildView instances.
     * @returns A combined Rectangle representing the merged bounds of all active child views, or null if none.
     */
    static calculateCombinedChildBounds(childViews) {
        const activeViews = childViews.filter(view => {
            try {
                return view.shouldIncludeInLayout();
            }
            catch (error) {
                console.warn('Error checking child view layout inclusion:', error);
                return false;
            }
        });
        if (activeViews.length === 0) {
            return null;
        }
        let hasValidBounds = false;
        let combinedBounds = this.createEmptyBounds();
        for (const view of activeViews) {
            try {
                const childBounds = view.getBounds();
                // Validate child bounds before using them
                try {
                    this.validateRectangle(childBounds.inner, 'childBounds.inner');
                    this.validateRectangle(childBounds.outer, 'childBounds.outer');
                    combinedBounds = this.expandBoundary(combinedBounds, childBounds.inner);
                    combinedBounds = this.expandBoundary(combinedBounds, childBounds.outer);
                    hasValidBounds = true;
                }
                catch (error) {
                    console.warn('Invalid child view bounds:', error);
                }
            }
            catch (error) {
                console.warn('Error getting child view bounds:', error);
            }
        }
        // Return null if no valid bounds were processed
        if (!hasValidBounds) {
            return null;
        }
        return this.calculateDimensions(combinedBounds);
    }
    /**
     * Creates an empty bounds object with extreme initial values.
     * This serves as a starting point for boundary expansion.
     *
     * @returns A Rectangle initialized with infinite boundaries.
     */
    static createEmptyBounds() {
        return {
            x: Number.POSITIVE_INFINITY,
            y: Number.POSITIVE_INFINITY,
            width: 0,
            height: 0,
            right: Number.NEGATIVE_INFINITY,
            bottom: Number.NEGATIVE_INFINITY,
        };
    }
    /**
     * Expands the target boundary to include the source boundary.
     *
     * @param target - The Rectangle to be expanded.
     * @param source - The Rectangle to include within the target.
     * @returns A new Rectangle representing the expanded boundary.
     */
    static expandBoundary(target, source) {
        return {
            x: Math.min(target.x, source.x),
            y: Math.min(target.y, source.y),
            right: Math.max(target.right, source.right),
            bottom: Math.max(target.bottom, source.bottom),
            width: 0, // To be recalculated later
            height: 0, // To be recalculated later
        };
    }
    /**
     * Combines base bounds with child bounds and applies margins.
     * This method expands the base inner and outer bounds to include the child bounds
     * and then applies the specified margins to the outer bounds.
     *
     * @param base - The initial base bounds of the element.
     * @param childBounds - The combined bounds of all child views.
     * @param margins - The margins to apply to the outer bounds.
     * @returns The updated ViewBounds after combining with child bounds and applying margins.
     */
    static combineBounds(base, childBounds, margins) {
        const result = {
            element: { ...base.element },
            inner: { ...base.inner },
            outer: { ...base.outer },
        };
        if (childBounds) {
            // Expand inner bounds to include children
            result.inner = ViewBoundaryCalculator.expandBoundary(result.inner, childBounds);
            result.inner = ViewBoundaryCalculator.calculateDimensions(result.inner);
            // Expand outer bounds to include children
            result.outer = ViewBoundaryCalculator.expandBoundary(result.outer, childBounds);
            result.outer = ViewBoundaryCalculator.calculateDimensions(result.outer);
        }
        // Apply margins to all sides of the outer bounds
        result.outer = ViewBoundaryCalculator.applyMargins(result.outer, margins);
        return result;
    }
    /**
     * Applies margins to the boundary.
     * Adjusts the x and y positions and extends the right and bottom edges based on margins.
     *
     * @param boundary - The Rectangle to which margins will be applied.
     * @param margins - The Margins to apply.
     * @returns A new Rectangle with margins applied.
     */
    static applyMargins(boundary, margins) {
        const x = boundary.x - margins.left;
        const y = boundary.y - margins.top;
        const right = boundary.right + margins.right;
        const bottom = boundary.bottom + margins.bottom;
        return {
            x,
            y,
            width: right - x,
            height: bottom - y,
            right,
            bottom,
        };
    }
    /**
     * Calculates width and height based on the rectangle's boundaries.
     *
     * @param rect - The Rectangle with updated boundaries.
     * @returns A new Rectangle with calculated width and height.
     */
    static calculateDimensions(rect) {
        const width = Math.max(0, rect.right - rect.x);
        const height = Math.max(0, rect.bottom - rect.y);
        return {
            x: rect.x,
            y: rect.y,
            width,
            height,
            right: rect.x + width,
            bottom: rect.y + height,
        };
    }
}
//# sourceMappingURL=ViewBoundaryCalculator.js.map