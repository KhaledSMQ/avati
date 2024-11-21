import { Options, Rk4thSpring } from 'rk-4th-spring';

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

export class Scrollable {
    private container: HTMLElement;
    private content: HTMLElement;
    private options: Required<ScrollableOptions>;
    private observer: ResizeObserver;

    private isDragging: boolean = false;
    private isScrollingWithWheel: boolean = false;
    // @ts-ignore
    private startPos: Position = { x: 0, y: 0 };
    private lastPos: Position = { x: 0, y: 0 };
    private currentPos: Position = { x: 0, y: 0 };
    private targetPos: Position = { x: 0, y: 0 };
    // @ts-ignore
    private velocity: Position = { x: 0, y: 0 };
    private lastTimestamp: number = 0;
    private rafId: number | null = null;
    private scrollEndTimeoutId: number | null = null;

    private verticalSpring: Rk4thSpring | null = null;
    private horizontalSpring: Rk4thSpring | null = null;

    private bounds: Bounds = {
        containerWidth: 0,
        containerHeight: 0,
        contentWidth: 0,
        contentHeight: 0,
        maxX: 0,
        minX: 0,
        maxY: 0,
        minY: 0,
    };

    private readonly onDragStartBound: (e: MouseEvent | TouchEvent) => void;
    private readonly onDragMoveBound: (e: MouseEvent | TouchEvent) => void;
    private readonly onDragEndBound: (e: MouseEvent | TouchEvent) => void;
    private readonly onWheelBound: (e: WheelEvent) => void;
    private detectedDirection: Exclude<Direction, 'auto'> = 'both';

    constructor(container: HTMLElement, options: ScrollableOptions = {}) {
        this.container = container;
        this.content = container.firstElementChild as HTMLElement;

        this.options = {
            direction: 'auto', // Change default to auto
            bounce: true,
            springOptions: {},
            speed: 1,
            acceleration: 1,
            velocity: { x: 0, y: 0 },
            useRAF: true,
            smoothingFactor: 0.15,
            precision: 0.1,
            maskFeatherSize: '2rem',
            maskOpacity: 0.3,
            onScroll: () => {
            },
            onScrollStart: () => {
            },
            onScrollEnd: () => {
            },
            ...options,
        };

        this.onDragStartBound = this.onDragStart.bind(this);
        this.onDragMoveBound = this.onDragMove.bind(this);
        this.onDragEndBound = this.onDragEnd.bind(this);
        this.onWheelBound = this.onWheel.bind(this);

        this.observer = new ResizeObserver(this.computeBounds.bind(this));
        if (this.options.direction === 'auto') {
            this.detectScrollDirection();
        } else {
            this.detectedDirection = this.options.direction;
        }

        this.init();
    }

    private get canScrollVertically(): boolean {
        return this.detectedDirection === 'vertical' || this.detectedDirection === 'both';
    }

    private get canScrollHorizontally(): boolean {
        return this.detectedDirection === 'horizontal' || this.detectedDirection === 'both';
    }

    /**
     * Update the scroll direction
     * @param direction
     */
    public updateScrollDirection(direction: Direction): void {
        this.options.direction = direction;
        if (direction === 'auto') {
            this.detectScrollDirection();
        } else {
            this.detectedDirection = direction;
        }
        this.computeBounds();
    }

    /**
     * Programmatically scroll to a specific position with animation
     */
    public scrollTo(x: number, y: number, animate: boolean = true): void {
        this.stopAnimations();
        this.options.onScrollStart();

        const targetX = this.clamp(x, this.bounds.minX, this.bounds.maxX);
        const targetY = this.clamp(y, this.bounds.minY, this.bounds.maxY);

        if (!animate) {
            this.setScrollPosition(targetX, targetY);
            this.options.onScrollEnd();
            return;
        }

        this.targetPos = { x: targetX, y: targetY };
        this.updateTransform();
    }

    /**
     * Programmatically scroll by a specific amount with animation
     */
    public scrollBy(deltaX: number, deltaY: number, animate: boolean = true): void {
        this.scrollTo(this.currentPos.x + deltaX, this.currentPos.y + deltaY, animate);
    }

    /**
     * Get the current scroll position
     */
    public getScrollPosition(): Position {
        return { ...this.currentPos };
    }

    /**
     * Get the current scroll bounds
     */
    public getBounds(): Bounds {
        return { ...this.bounds };
    }

    /**
     * Check if the content is currently scrolling
     */
    public isScrolling(): boolean {
        return this.isDragging || this.isScrollingWithWheel || this.rafId !== null;
    }

    /**
     * Force a recalculation of the scroll bounds
     */
    public recalculateBounds(): void {
        this.computeBounds();
    }

    /**
     * Destroy the Scrollable instance and clean up all resources
     */
    public destroy(): void {
        // Remove event listeners
        this.container.removeEventListener('mousedown', this.onDragStartBound);
        this.container.removeEventListener('touchstart', this.onDragStartBound);
        this.container.removeEventListener('wheel', this.onWheelBound);

        window.removeEventListener('mousemove', this.onDragMoveBound);
        window.removeEventListener('touchmove', this.onDragMoveBound);
        window.removeEventListener('mouseup', this.onDragEndBound);
        window.removeEventListener('touchend', this.onDragEndBound);

        // Stop animations and timers
        this.stopAnimations();
        if (this.scrollEndTimeoutId !== null) {
            clearTimeout(this.scrollEndTimeoutId);
        }

        // Disconnect observer
        this.observer.disconnect();

        // Remove styles
        this.container.style.touchAction = '';
        this.container.style.overflow = '';
        this.container.style.webkitMask = '';
        this.container.style.mask = '';
        this.container.style.contain = '';
        this.content.style.transform = '';
        this.content.style.willChange = '';

        // Remove CSS variables
        const cssVars = [
            '--mask-angle',
            '--scrollable-feather-start-opacity',
            '--scrollable-feather-end-opacity',
            '--scrollable-feather-size',
        ];
        cssVars.forEach((variable) => {
            this.container.style.removeProperty(variable);
        });
    }

    private init(): void {
        this.initializeSprings();
        this.attachEventListeners();
        this.setupContainer();
        this.computeBounds();
    }

    private detectScrollDirection(): void {
        const hasHorizontalScroll = this.bounds.contentWidth > this.bounds.containerWidth;
        const hasVerticalScroll = this.bounds.contentHeight > this.bounds.containerHeight;

        if (hasHorizontalScroll && hasVerticalScroll) {
            this.detectedDirection = 'both';
        } else if (hasHorizontalScroll) {
            this.detectedDirection = 'horizontal';
        } else if (hasVerticalScroll) {
            this.detectedDirection = 'vertical';
        } else {
            this.detectedDirection = 'both'; // Default when no scroll needed
        }
    }

    private initializeSprings(): void {
        const springConfig = {
            stiffness: 170,
            damping: 26,
            precision: this.options.precision,
            ...this.options.springOptions,
        };

        if (this.canScrollVertically) {
            this.verticalSpring = new Rk4thSpring(springConfig);
            this.verticalSpring.onUpdate = this.handleVerticalSpringUpdate.bind(this);
            this.verticalSpring.onEnd = this.handleSpringEnd.bind(this);
        }

        if (this.canScrollHorizontally) {
            this.horizontalSpring = new Rk4thSpring(springConfig);
            this.horizontalSpring.onUpdate = this.handleHorizontalSpringUpdate.bind(this);
            this.horizontalSpring.onEnd = this.handleSpringEnd.bind(this);
        }
    }

    private attachEventListeners(): void {
        // Touch and mouse events
        this.container.addEventListener('mousedown', this.onDragStartBound, { passive: false });
        this.container.addEventListener('touchstart', this.onDragStartBound, { passive: false });
        this.container.addEventListener('wheel', this.onWheelBound, { passive: false });

        window.addEventListener('mousemove', this.onDragMoveBound, { capture: true });
        window.addEventListener('touchmove', this.onDragMoveBound, { capture: true });
        window.addEventListener('mouseup', this.onDragEndBound, { capture: true });
        window.addEventListener('touchend', this.onDragEndBound, { capture: true });

        // Resize observation
        this.observer.observe(this.container);
        this.observer.observe(this.content);
    }

    private setupContainer(): void {
        this.container.style.touchAction = 'none';
        this.container.style.overflow = 'hidden';
        this.content.style.willChange = 'transform';
    }

    private handleVerticalSpringUpdate(value: number): void {
        this.setScrollPosition(this.currentPos.x, value);
    }

    private handleHorizontalSpringUpdate(value: number): void {
        this.setScrollPosition(value, this.currentPos.y);
    }

    private handleSpringEnd(): void {
        this.options.onScrollEnd();
        this.updateMask();
    }

    // @ts-ignore
    private applyMask(): void {
        const maskProperties = {
            '--mask-angle':
                this.detectedDirection === 'both'
                    ? '0deg'
                    : this.detectedDirection === 'horizontal'
                        ? '90deg'
                        : '0deg',
            '--scrollable-feather-start-opacity': '1',
            '--scrollable-feather-end-opacity': '0',
            '--scrollable-feather-size': this.options.maskFeatherSize,
        };

        Object.entries(maskProperties).forEach(([key, value]) => {
            this.container.style.setProperty(key, value);
        });

        const maskValue = `linear-gradient(
            var(--mask-angle),
            rgba(0, 0, 0, var(--scrollable-feather-start-opacity)),
            #000 var(--scrollable-feather-size),
            #000 calc(100% - var(--scrollable-feather-size)),
            rgba(0, 0, 0, var(--scrollable-feather-end-opacity))
        )`;

        this.container.style.webkitMask = maskValue;
        this.container.style.mask = maskValue;
        this.container.style.contain = 'paint';
    }

    private updateMask(): void {
        if (this.canScrollVertically) {
            this.updateVerticalMask();
        }
        if (this.canScrollHorizontally) {
            this.updateHorizontalMask();
        }
    }

    private updateVerticalMask(): void {
        const startOpacity = this.currentPos.y < this.bounds.maxY ? '0' : '1';
        const endOpacity =
            this.currentPos.y > this.bounds.minY ? '0' : String(this.options.maskOpacity);

        this.container.style.setProperty('--scrollable-feather-start-opacity', startOpacity);
        this.container.style.setProperty('--scrollable-feather-end-opacity', endOpacity);
    }

    private updateHorizontalMask(): void {
        const startOpacity = this.currentPos.x <= this.bounds.maxX ? '0' : '1';
        const endOpacity =
            this.currentPos.x >= this.bounds.minX ? '0' : String(this.options.maskOpacity);

        this.container.style.setProperty('--scrollable-feather-start-opacity', startOpacity);
        this.container.style.setProperty('--scrollable-feather-end-opacity', endOpacity);
    }

    private computeBounds(): void {
        const contentStyle = window.getComputedStyle(this.content);
        const containerStyle = window.getComputedStyle(this.container);

        // Calculate content margins and padding
        const contentMargins = {
            left: parseFloat(contentStyle.marginLeft) || 0,
            right: parseFloat(contentStyle.marginRight) || 0,
            top: parseFloat(contentStyle.marginTop) || 0,
            bottom: parseFloat(contentStyle.marginBottom) || 0,
        };

        const contentPadding = {
            left: parseFloat(contentStyle.paddingLeft) || 0,
            right: parseFloat(contentStyle.paddingRight) || 0,
            top: parseFloat(contentStyle.paddingTop) || 0,
            bottom: parseFloat(contentStyle.paddingBottom) || 0,
        };

        // Calculate container padding
        const containerPadding = {
            left: parseFloat(containerStyle.paddingLeft) || 0,
            right: parseFloat(containerStyle.paddingRight) || 0,
            top: parseFloat(containerStyle.paddingTop) || 0,
            bottom: parseFloat(containerStyle.paddingBottom) || 0,
        };

        // Get dimensions including padding and margins
        this.bounds = {
            containerWidth:
                this.container.clientWidth -
                contentPadding.left -
                contentPadding.right -
                containerPadding.left -
                containerPadding.right,
            containerHeight:
                this.container.clientHeight -
                contentPadding.top -
                contentPadding.bottom -
                containerPadding.top -
                containerPadding.bottom,
            contentWidth:
                this.content.scrollWidth +
                contentMargins.left +
                contentMargins.right +
                contentPadding.left +
                contentPadding.right,
            contentHeight:
                this.content.scrollHeight +
                contentMargins.top +
                contentMargins.bottom +
                contentPadding.top +
                contentPadding.bottom,
            maxX: 0,
            minX: 0,
            maxY: 0,
            minY: 0,
        };

        // Calculate scroll limits including padding and margins
        this.bounds.minX = this.bounds.containerWidth - this.bounds.contentWidth;
        this.bounds.minY = this.bounds.containerHeight - this.bounds.contentHeight;

        // Ensure we only have negative or zero bounds
        this.bounds.minX = Math.min(0, this.bounds.minX);
        this.bounds.minY = Math.min(0, this.bounds.minY);

        // Re-detect direction if auto
        if (this.options.direction === 'auto') {
            this.detectScrollDirection();
        }

        // Clamp current position within bounds
        this.currentPos = {
            x: this.clamp(this.currentPos.x, this.bounds.minX, this.bounds.maxX),
            y: this.clamp(this.currentPos.y, this.bounds.minY, this.bounds.maxY),
        };

        this.targetPos = {
            x: this.clamp(this.targetPos.x, this.bounds.minX, this.bounds.maxX),
            y: this.clamp(this.targetPos.y, this.bounds.minY, this.bounds.maxY),
        };

        this.bounceBack();
        this.updateMask();
    }

    private onDragStart(event: MouseEvent | TouchEvent): void {
        event.preventDefault();
        this.isDragging = true;
        this.isScrollingWithWheel = false;

        const pos = this.getEventPosition(event);
        this.startPos = { ...pos };
        this.lastPos = { ...pos };

        this.stopAnimations();
        this.options.onScrollStart();
    }

    private onDragMove(event: MouseEvent | TouchEvent): void {
        if (!this.isDragging) return;
        event.preventDefault();

        const pos = this.getEventPosition(event);
        const deltaX = (pos.x - this.lastPos.x) * this.options.speed;
        const deltaY = (pos.y - this.lastPos.y) * this.options.speed;
        this.lastPos = { ...pos };

        // Apply direction constraints
        const adjustedDeltaX = this.canScrollHorizontally ? deltaX : 0;
        const adjustedDeltaY = this.canScrollVertically ? deltaY : 0;

        this.scroll(adjustedDeltaX, adjustedDeltaY);
    }

    private onDragEnd(event: MouseEvent | TouchEvent): void {
        if (!this.isDragging) return;
        this.isDragging = false;

        const pos = this.getEventPosition(event);
        const deltaX = (pos.x - this.lastPos.x) * this.options.speed;
        const deltaY = (pos.y - this.lastPos.y) * this.options.speed;

        this.velocity = {
            x: deltaX * this.options.acceleration,
            y: deltaY * this.options.acceleration,
        };

        if (this.options.bounce) {
            this.bounceBack();
        }

        this.options.onScrollEnd();
    }

    private onWheel(event: WheelEvent): void {
        event.preventDefault();

        if (!this.isScrollingWithWheel) {
            this.isScrollingWithWheel = true;
            this.options.onScrollStart();
        }

        // Handle both vertical and horizontal scrolling
        let deltaX = 0;
        let deltaY = 0;

        // If shift is pressed, convert vertical scroll to horizontal
        if (event.shiftKey && this.canScrollHorizontally) {
            deltaX = event.deltaY;
        } else {
            // Normal scroll behavior
            deltaX = event.deltaX;
            deltaY = event.deltaY;
        }

        // Apply scroll direction constraints
        if (!this.canScrollHorizontally) deltaX = 0;
        if (!this.canScrollVertically) deltaY = 0;

        // Apply speed
        deltaX *= this.options.speed;
        deltaY *= this.options.speed;

        this.targetPos = {
            x: this.clamp(this.currentPos.x - deltaX, this.bounds.minX, this.bounds.maxX),
            y: this.clamp(this.currentPos.y - deltaY, this.bounds.minY, this.bounds.maxY),
        };

        this.velocity = {
            x: deltaX * this.options.acceleration,
            y: deltaY * this.options.acceleration,
        };

        this.updateTransform();
        this.debounceScrollEnd();
    }

    private scroll(deltaX: number, deltaY: number): void {
        let newX = this.currentPos.x;
        let newY = this.currentPos.y;

        // Apply deltas based on scroll direction
        if (this.canScrollHorizontally) {
            newX += deltaX;
        }
        if (this.canScrollVertically) {
            newY += deltaY;
        }

        // Apply overscroll resistance
        const resistance = 0.5; // Adjust this value to change resistance strength
        // console.log(this.bounds);
        if (newX > this.bounds.maxX) {
            // Overscroll to the left
            const overscroll = newX - this.bounds.maxX;
            newX = this.bounds.maxX + overscroll * resistance;
        } else if (newX < this.bounds.minX) {
            // Overscroll to the right
            const overscroll = this.bounds.minX - newX;
            newX = this.bounds.minX - overscroll * resistance;
        }

        if (newY > this.bounds.maxY) {
            // Overscroll to the top
            const overscroll = newY - this.bounds.maxY;
            newY = this.bounds.maxY + overscroll * resistance;
        } else if (newY < this.bounds.minY) {
            // Overscroll to the bottom
            const overscroll = this.bounds.minY - newY;
            newY = this.bounds.minY - overscroll * resistance;
        }

        this.setScrollPosition(newX, newY);
    }

    private updateTransform(): void {
        if (!this.options.useRAF) {
            this.applyTransform();
            return;
        }

        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
        }

        this.rafId = requestAnimationFrame((timestamp) => {
            if (!this.lastTimestamp) {
                this.lastTimestamp = timestamp;
            }

            const deltaTime = timestamp - this.lastTimestamp;
            this.lastTimestamp = timestamp;

            if (!this.isDragging) {
                this.currentPos.x +=
                    (this.targetPos.x - this.currentPos.x) *
                    Math.min(1, this.options.smoothingFactor * deltaTime);
                this.currentPos.y +=
                    (this.targetPos.y - this.currentPos.y) *
                    Math.min(1, this.options.smoothingFactor * deltaTime);
            }

            this.applyTransform();

            if (
                !this.isDragging &&
                (Math.abs(this.targetPos.x - this.currentPos.x) > this.options.precision ||
                    Math.abs(this.targetPos.y - this.currentPos.y) > this.options.precision)
            ) {
                this.rafId = requestAnimationFrame(this.updateTransform.bind(this));
            } else {
                this.rafId = null;
            }
        });
    }

    private applyTransform(): void {
        this.content.style.transform = `translate3d(${this.currentPos.x}px, ${this.currentPos.y}px, 0)`;
        this.updateMask();
        this.options.onScroll(this.currentPos);
    }

    private bounceBack(): void {
        const needsBounce = this.checkBounceNeeded();
        if (!needsBounce) return;

        if (this.canScrollHorizontally) {
            this.applyHorizontalBounce();
        }

        if (this.canScrollVertically) {
            this.applyVerticalBounce();
        }
    }

    // Public Methods

    private checkBounceNeeded(): boolean {
        const horizontalOverscroll =
            this.currentPos.x > this.bounds.maxX || this.currentPos.x < this.bounds.minX;

        const verticalOverscroll =
            this.currentPos.y > this.bounds.maxY || this.currentPos.y < this.bounds.minY;

        return horizontalOverscroll || verticalOverscroll;
    }

    private applyHorizontalBounce(): void {
        if (!this.horizontalSpring) return;

        const targetX = this.clamp(this.currentPos.x, this.bounds.minX, this.bounds.maxX);
        if (Math.abs(targetX - this.currentPos.x) > this.options.precision) {
            this.horizontalSpring.stop();
            this.horizontalSpring.setValue(this.currentPos.x);
            this.horizontalSpring.start(targetX);
        }
    }

    private applyVerticalBounce(): void {
        if (!this.verticalSpring) return;

        const targetY = this.clamp(this.currentPos.y, this.bounds.minY, this.bounds.maxY);
        if (Math.abs(targetY - this.currentPos.y) > this.options.precision) {
            this.verticalSpring.stop();
            this.horizontalSpring?.setValue(this.currentPos.y);
            this.verticalSpring.start(targetY);
        }
    }

    private getEventPosition(event: MouseEvent | TouchEvent): Position {
        if (event instanceof MouseEvent) {
            return { x: event.clientX, y: event.clientY };
        }

        if (event.touches.length > 0) {
            return {
                x: event.touches[0]?.clientX ?? 0,
                y: event.touches[0]?.clientY ?? 0,
            };
        }

        return { x: 0, y: 0 };
    }

    private setScrollPosition(x: number, y: number): void {
        // Ensure we respect scroll constraints
        const constrainedX = this.canScrollHorizontally ? x : this.currentPos.x;
        const constrainedY = this.canScrollVertically ? y : this.currentPos.y;

        this.currentPos = { x: constrainedX, y: constrainedY };
        this.targetPos = { x: constrainedX, y: constrainedY };
        this.updateTransform();
    }

    private stopAnimations(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        this.verticalSpring?.stop();
        this.horizontalSpring?.stop();
    }

    private debounceScrollEnd(): void {
        if (this.scrollEndTimeoutId !== null) {
            clearTimeout(this.scrollEndTimeoutId);
        }

        this.scrollEndTimeoutId = window.setTimeout(() => {
            this.isScrollingWithWheel = false;
            if (this.options.bounce) {
                this.bounceBack();
            }
            this.options.onScrollEnd();
            this.scrollEndTimeoutId = null;
        }, 100);
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
}
