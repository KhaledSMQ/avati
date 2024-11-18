import { Options } from 'rk-4th-spring';
export type Direction = 'vertical' | 'horizontal' | 'both' | 'auto';
export interface ScrollableOptions {
    direction?: Direction;
    bounce?: boolean;
    springOptions?: Options;
    onScroll?: (position: Position) => void;
    onScrollStart?: () => void;
    onScrollEnd?: () => void;
    speed?: number;
    acceleration?: number;
    velocity?: Position;
    useRAF?: boolean;
    smoothingFactor?: number;
    precision?: number;
    maskFeatherSize?: string;
    maskOpacity?: number;
}
export interface Position {
    x: number;
    y: number;
}
interface Bounds {
    containerWidth: number;
    containerHeight: number;
    contentWidth: number;
    contentHeight: number;
    maxX: number;
    minX: number;
    maxY: number;
    minY: number;
}
export declare class Scrollable {
    private container;
    private content;
    private options;
    private observer;
    private isDragging;
    private isScrollingWithWheel;
    private startPos;
    private lastPos;
    private currentPos;
    private targetPos;
    private velocity;
    private lastTimestamp;
    private rafId;
    private scrollEndTimeoutId;
    private verticalSpring;
    private horizontalSpring;
    private bounds;
    private readonly onDragStartBound;
    private readonly onDragMoveBound;
    private readonly onDragEndBound;
    private readonly onWheelBound;
    private detectedDirection;
    constructor(container: HTMLElement, options?: ScrollableOptions);
    private init;
    private detectScrollDirection;
    private initializeSprings;
    private attachEventListeners;
    private setupContainer;
    private get canScrollVertically();
    private get canScrollHorizontally();
    private handleVerticalSpringUpdate;
    private handleHorizontalSpringUpdate;
    private handleSpringEnd;
    private applyMask;
    private updateMask;
    private updateVerticalMask;
    private updateHorizontalMask;
    private computeBounds;
    private onDragStart;
    private onDragMove;
    private onDragEnd;
    private onWheel;
    private scroll;
    private updateTransform;
    private applyTransform;
    private bounceBack;
    private checkBounceNeeded;
    private applyHorizontalBounce;
    private applyVerticalBounce;
    private getEventPosition;
    private setScrollPosition;
    private stopAnimations;
    private debounceScrollEnd;
    private clamp;
    /**
     * Update the scroll direction
     * @param direction
     */
    updateScrollDirection(direction: Direction): void;
    /**
     * Programmatically scroll to a specific position with animation
     */
    scrollTo(x: number, y: number, animate?: boolean): void;
    /**
     * Programmatically scroll by a specific amount with animation
     */
    scrollBy(deltaX: number, deltaY: number, animate?: boolean): void;
    /**
     * Get the current scroll position
     */
    getScrollPosition(): Position;
    /**
     * Get the current scroll bounds
     */
    getBounds(): Bounds;
    /**
     * Check if the content is currently scrolling
     */
    isScrolling(): boolean;
    /**
     * Force a recalculation of the scroll bounds
     */
    recalculateBounds(): void;
    /**
     * Destroy the Scrollable instance and clean up all resources
     */
    destroy(): void;
}
export {};
//# sourceMappingURL=Scrollable.d.ts.map