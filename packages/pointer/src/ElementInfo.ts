// Define the Coordinates interface
interface Coordinates {
    top: number;
    bottom: number;
    left: number;
    right: number;
    height: number;
    width: number;
}

// Define the ElementPositionInfo interface
interface ElementPositionInfo {
    // Standard PointerEvent properties
    clientX: number; // Relative to the viewport
    clientY: number;
    pageX: number; // Relative to the document
    pageY: number;
    screenX: number; // Relative to the screen
    screenY: number;
    offsetX: number; // Relative to the event's target element
    offsetY: number;

    // Relative to the element's bounding rectangle
    relativeX: number;
    relativeY: number;

    // Normalized positions (0 to 1)
    normalizedX: number;
    normalizedY: number;

    // Scroll information
    totalScrollLeft: number; // Total horizontal scroll from all scrollable parents
    totalScrollTop: number; // Total vertical scroll from all scrollable parents
    elementScrollLeft: number; // Scroll left of the target element (if scrollable)
    elementScrollTop: number; // Scroll top of the target element (if scrollable)

    // Absolute coordinates
    absoluteX: number; // Absolute X position within the document (pointer)
    absoluteY: number; // Absolute Y position within the document (pointer)

    // Screen-relative absolute coordinates
    screenAbsoluteX: number; // Absolute X position relative to the screen
    screenAbsoluteY: number; // Absolute Y position relative to the screen

    // Transformation details
    transformationMatrix: DOMMatrix; // The element's transformation matrix
    inverseTransformationMatrix: DOMMatrix; // The inverse of the transformation matrix
    transformedRelativeX: number; // Relative X after accounting for transformation
    transformedRelativeY: number; // Relative Y after accounting for transformation

    // Element's Absolute Coordinates
    elementAbsoluteTop: number; // Absolute top position of the element
    elementAbsoluteBottom: number; // Absolute bottom position of the element
    elementAbsoluteLeft: number; // Absolute left position of the element
    elementAbsoluteRight: number; // Absolute right position of the element
    elementHeight: number; // Height of the element
    elementWidth: number; // Width of the element
}

// Utility function to check if an element is scrollable
function isScrollable(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
        (style.overflowX === 'auto' ||
            style.overflowX === 'scroll' ||
            style.overflowY === 'auto' ||
            style.overflowY === 'scroll') &&
        (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight)
    );
}

// Utility function to check if an element has any CSS transforms applied
function hasTransform(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.transform !== 'none';
}

// Utility function to get the transformation matrix of an element
function getTransformationMatrix(element: HTMLElement): DOMMatrix {
    const style = window.getComputedStyle(element);
    const transform = style.transform || 'none';
    return new DOMMatrix(transform);
}

// Utility function to calculate total scroll offsets from all scrollable parent elements
function getTotalScrollOffsets(element: HTMLElement): {
    totalScrollLeft: number;
    totalScrollTop: number;
} {
    let totalScrollLeft = 0;
    let totalScrollTop = 0;
    let currentElement: HTMLElement | null = element.parentElement;

    while (currentElement) {
        if (isScrollable(currentElement)) {
            totalScrollLeft += currentElement.scrollLeft;
            totalScrollTop += currentElement.scrollTop;
        }
        currentElement = currentElement.parentElement;
    }

    return { totalScrollLeft, totalScrollTop };
}

// Utility function to adjust coordinates based on the inverse transformation matrix
function adjustForTransform(
    relativeX: number,
    relativeY: number,
    inverseMatrix: DOMMatrix
): { adjustedX: number; adjustedY: number } {
    const point = new DOMPoint(relativeX, relativeY).matrixTransform(inverseMatrix);
    return { adjustedX: point.x, adjustedY: point.y };
}

// Utility function to get the element's real coordinates
function getRealCoords(el: HTMLElement): Coordinates {
    const { top, bottom, left, right, height, width } = el.getBoundingClientRect();

    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    const adjustedTop = top + scrollTop;
    const adjustedBottom = bottom + scrollTop;
    const adjustedLeft = left + scrollLeft;
    const adjustedRight = right + scrollLeft;

    return {
        top: adjustedTop,
        bottom: adjustedBottom,
        left: adjustedLeft,
        right: adjustedRight,
        height,
        width,
    };
}

/**
 * Calculates various positional metrics for an HTML element based on a PointerEvent,
 * considering all scroll positions, transformations, and providing absolute coordinates.
 * Optionally calculates deltas based on initial positions for drag operations.
 *
 * @param event - The PointerEvent triggered by a user interaction.
 * @param element - The HTMLElement to which the event is relative.
 * @returns An object containing various positional metrics.
 */
export function getElementPositionInfo(
    event: PointerEvent,
    element: HTMLElement
): ElementPositionInfo {
    // Get the bounding rectangle of the element
    const rect = element.getBoundingClientRect();

    // Initial relative positions based on the bounding rectangle
    let relativeX = event.clientX - rect.left;
    let relativeY = event.clientY - rect.top;

    // Retrieve the transformation matrix
    const transformationMatrix = getTransformationMatrix(element);
    let inverseTransformationMatrix = new DOMMatrix();

    // Check if the element has a transformation applied
    if (hasTransform(element)) {
        try {
            inverseTransformationMatrix = transformationMatrix.inverse();
            const transformed = adjustForTransform(
                relativeX,
                relativeY,
                inverseTransformationMatrix
            );
            relativeX = transformed.adjustedX;
            relativeY = transformed.adjustedY;
        } catch (error) {
            console.warn('Failed to invert transformation matrix:', error);
            // If inversion fails, proceed without adjusting
        }
    }

    // Normalize the relative positions between 0 and 1
    const normalizedX = rect.width ? relativeX / rect.width : 0;
    const normalizedY = rect.height ? relativeY / rect.height : 0;

    // Get total scroll offsets from all scrollable parents
    const { totalScrollLeft, totalScrollTop } = getTotalScrollOffsets(element);

    // Check if the target element itself is scrollable
    const isElementScrollable = isScrollable(element);

    const elementScrollLeft = isElementScrollable ? element.scrollLeft : 0;
    const elementScrollTop = isElementScrollable ? element.scrollTop : 0;

    // Calculate absolute coordinates within the document
    const absoluteX = event.pageX;
    const absoluteY = event.pageY;

    // Calculate screen-relative absolute coordinates
    const screenAbsoluteX = event.screenX;
    const screenAbsoluteY = event.screenY;

    // Calculate transformed relative positions
    const transformedRelativeX = relativeX + elementScrollLeft;
    const transformedRelativeY = relativeY + elementScrollTop;

    // Calculate element's absolute coordinates
    const realCoords = getRealCoords(element);

    return {
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        screenX: event.screenX,
        screenY: event.screenY,
        offsetX: event.offsetX,
        offsetY: event.offsetY,
        relativeX: transformedRelativeX, // Adjust relative to content
        relativeY: transformedRelativeY, // Adjust relative to content
        normalizedX: Math.min(Math.max(normalizedX, 0), 1), // Clamp between 0 and 1
        normalizedY: Math.min(Math.max(normalizedY, 0), 1),
        totalScrollLeft: totalScrollLeft,
        totalScrollTop: totalScrollTop,
        elementScrollLeft: elementScrollLeft,
        elementScrollTop: elementScrollTop,
        absoluteX: absoluteX,
        absoluteY: absoluteY,
        screenAbsoluteX: screenAbsoluteX,
        screenAbsoluteY: screenAbsoluteY,
        transformationMatrix: transformationMatrix,
        inverseTransformationMatrix: inverseTransformationMatrix,
        transformedRelativeX: transformedRelativeX,
        transformedRelativeY: transformedRelativeY,
        // Element's Absolute Coordinates
        elementAbsoluteTop: realCoords.top,
        elementAbsoluteBottom: realCoords.bottom,
        elementAbsoluteLeft: realCoords.left,
        elementAbsoluteRight: realCoords.right,
        elementHeight: realCoords.height,
        elementWidth: realCoords.width,
    };
}
