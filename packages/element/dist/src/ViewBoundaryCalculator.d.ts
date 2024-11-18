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
 * Represents a point in 2D space with x and y coordinates.
 *
 * @interface Point2D
 * @property {number} x - The x-coordinate in the 2D space
 * @property {number} y - The y-coordinate in the 2D space
 */
export interface Point2D {
    x: number;
    y: number;
}
/**
 * Represents the dimensions of a rectangular shape.
 *
 * @interface Dimensions
 * @property {number} width - The width of the rectangle
 * @property {number} height - The height of the rectangle
 */
export interface Dimensions {
    width: number;
    height: number;
}
/**
 * Defines margin values for all four sides of a rectangle.
 *
 * @interface Margins
 * @property {number} top - The top margin in pixels
 * @property {number} right - The right margin in pixels
 * @property {number} bottom - The bottom margin in pixels
 * @property {number} left - The left margin in pixels
 */
export interface Margins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
/**
 * Represents a rectangle with position, dimensions, and computed boundaries.
 *
 * @interface Rectangle
 * @extends Point2D
 * @extends Dimensions
 * @property {number} right - The x-coordinate of the right edge (x + width)
 * @property {number} bottom - The y-coordinate of the bottom edge (y + height)
 */
export interface Rectangle extends Point2D, Dimensions {
    right: number;
    bottom: number;
}
/**
 * Defines the complete boundary information for a view, including element bounds,
 * inner content bounds, and outer bounds with margins.
 *
 * @interface ViewBounds
 * @property {Rectangle & { margins: Margins }} element - The original element bounds with margins
 * @property {Rectangle} inner - The inner bounds excluding margins
 * @property {Rectangle} outer - The outer bounds including margins
 */
export interface ViewBounds {
    element: Rectangle & {
        margins: Margins;
    };
    inner: Rectangle;
    outer: Rectangle;
}
/**
 * Interface for views that can participate in boundary calculations.
 *
 * @interface ChildView
 */
export interface ChildView {
    /**
     * Gets the current bounds of the child view.
     *
     * @returns {ViewBounds} The current boundaries of the view
     */
    getBounds(): ViewBounds;
    /**
     * Determines whether this view should be included in layout calculations.
     *
     * @returns {boolean} True if the view should be included in layout
     */
    shouldIncludeInLayout(): boolean;
}
export declare const GetElementBounds: (element: HTMLElement) => Rectangle & {
    margins: Margins;
};
/**
 * Creates a ChildView instance for an HTML element with optional layout inclusion.
 * @param element
 * @param includeInLayout
 * @constructor
 */
export declare const ChildViewElement: (element: HTMLElement, includeInLayout?: boolean) => ChildView;
/**
 * Configuration options for view boundary calculations.
 *
 * @interface ViewConfig
 * @property {Point2D} [offset] - Optional offset to apply to the view position
 * @property {Point2D} [scale] - Optional scale factors for width and height
 */
export interface ViewConfig {
    offset?: Point2D;
    scale?: Point2D;
}
/**
 * Custom error class for boundary calculation related errors.
 *
 * @class BoundaryCalculationError
 * @extends Error
 */
export declare class BoundaryCalculationError extends Error {
    constructor(message: string);
}
/**
 * Manages the calculation of view boundaries and layouts with comprehensive
 * validation and error handling.
 *
 * @class ViewBoundaryCalculator
 */
export declare class ViewBoundaryCalculator {
    /**
     * Validates that a numeric value is finite and within safe bounds.
     *
     * @throws {BoundaryCalculationError} If the value is invalid
     * @param {number} value - The numeric value to validate
     * @param {string} name - The name of the value for error reporting
     */
    private static validateNumber;
    /**
     * Validates a rectangle's dimensions and coordinates for consistency.
     *
     * @throws {BoundaryCalculationError} If the rectangle is invalid
     * @param {Rectangle} rect - The rectangle to validate
     * @param {string} [name='Rectangle'] - Name for error reporting
     */
    private static validateRectangle;
    /**
     * Validates that all margin values are non-negative.
     *
     * @throws {BoundaryCalculationError} If any margin is negative
     * @param {Margins} margins - The margins to validate
     */
    private static validateMargins;
    /**
     * Validates that scale factors are positive numbers.
     *
     * @throws {BoundaryCalculationError} If scale factors are invalid
     * @param {Point2D} scale - The scale factors to validate
     */
    private static validateScale;
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
    static calculateBounds(elementBounds: Rectangle & {
        margins: Margins;
    }, childViews: ChildView[], config?: ViewConfig): ViewBounds;
    /**
     * Creates the initial boundary structure based on the element's bounds, offset, and scale.
     *
     * @param element - The main element's rectangle including margins.
     * @param offset - The offset to apply to the element's position.
     * @param scale - The scale factors to apply to the element's dimensions.
     * @returns The base ViewBounds with initialized inner and outer rectangles.
     */
    private static createBaseBounds;
    /**
     * Calculates the combined bounds of all child views that should be included in the layout.
     *
     * @param childViews - An array of ChildView instances.
     * @returns A combined Rectangle representing the merged bounds of all active child views, or null if none.
     */
    private static calculateCombinedChildBounds;
    /**
     * Creates an empty bounds object with extreme initial values.
     * This serves as a starting point for boundary expansion.
     *
     * @returns A Rectangle initialized with infinite boundaries.
     */
    private static createEmptyBounds;
    /**
     * Expands the target boundary to include the source boundary.
     *
     * @param target - The Rectangle to be expanded.
     * @param source - The Rectangle to include within the target.
     * @returns A new Rectangle representing the expanded boundary.
     */
    private static expandBoundary;
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
    private static combineBounds;
    /**
     * Applies margins to the boundary.
     * Adjusts the x and y positions and extends the right and bottom edges based on margins.
     *
     * @param boundary - The Rectangle to which margins will be applied.
     * @param margins - The Margins to apply.
     * @returns A new Rectangle with margins applied.
     */
    private static applyMargins;
    /**
     * Calculates width and height based on the rectangle's boundaries.
     *
     * @param rect - The Rectangle with updated boundaries.
     * @returns A new Rectangle with calculated width and height.
     */
    private static calculateDimensions;
}
//# sourceMappingURL=ViewBoundaryCalculator.d.ts.map