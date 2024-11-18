interface ElementPositionInfo {
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
    offsetX: number;
    offsetY: number;
    relativeX: number;
    relativeY: number;
    normalizedX: number;
    normalizedY: number;
    totalScrollLeft: number;
    totalScrollTop: number;
    elementScrollLeft: number;
    elementScrollTop: number;
    absoluteX: number;
    absoluteY: number;
    screenAbsoluteX: number;
    screenAbsoluteY: number;
    transformationMatrix: DOMMatrix;
    inverseTransformationMatrix: DOMMatrix;
    transformedRelativeX: number;
    transformedRelativeY: number;
    elementAbsoluteTop: number;
    elementAbsoluteBottom: number;
    elementAbsoluteLeft: number;
    elementAbsoluteRight: number;
    elementHeight: number;
    elementWidth: number;
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
export declare function getElementPositionInfo(event: PointerEvent, element: HTMLElement): ElementPositionInfo;
export {};
//# sourceMappingURL=ElementInfo.d.ts.map