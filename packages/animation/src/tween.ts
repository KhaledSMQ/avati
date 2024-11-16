import { EasingFunction, TweenOptions, Vector2D } from './types';
import { TweenManager } from './tweenManager';

export class Tween<T> {
    private from: T;
    private to: T;
    private duration: number;
    private easingFn: EasingFunction;
    private onUpdate: (value: T) => void;
    private onComplete?: () => void;
    private startTime: number = 0;
    private isActive: boolean = false;

    constructor(options: TweenOptions<T>) {
        this.from = options.from;
        this.to = options.to;
        this.duration = options.duration;
        this.easingFn = options.easing || Tween.EasingFunctions.easeInOutCubic;
        this.onUpdate = options.onUpdate;
        this.onComplete = options.onComplete;
    }

    // Static collection of easing functions
    static EasingFunctions = {
        linear: (t: number): number => t,
        easeInCubic: (t: number): number => t * t * t,
        easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
        easeInOutCubic: (t: number): number =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        easeInQuad: (t: number): number => t * t,
        easeOutQuad: (t: number): number => t * (2 - t),
        easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        easeInElastic: (t: number): number => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0
                ? 0
                : t === 1
                  ? 1
                  : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },
        bounce: (t: number): number => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) return n1 * t * t;
            if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
            if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        },
    };

    start(): void {
        if (this.isActive) return;
        this.isActive = true;
        this.startTime = Date.now();
        TweenManager.add(this);
    }

    stop(): void {
        if (!this.isActive) return;
        this.isActive = false;
        TweenManager.remove(this);
    }

    update(_deltaTime: number): void {
        if (!this.isActive) return;

        const elapsed = Date.now() - this.startTime;
        let progress = Math.min(elapsed / this.duration, 1);
        progress = this.easingFn(progress);

        // Calculate interpolated value
        const currentValue = this.interpolate(this.from, this.to, progress);

        // Update callback
        this.onUpdate(currentValue);

        // Check for completion
        if (elapsed >= this.duration) {
            this.isActive = false;
            TweenManager.remove(this);
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }

    // Extend the interpolate method to handle more types
    private interpolate(from: T, to: T, t: number): T {
        if (typeof from === 'number' && typeof to === 'number') {
            return (from + (to - from) * t) as any;
        }

        // Handle Vector2D
        if (this.isVector2D(from) && this.isVector2D(to)) {
            return {
                x: from.x + (to.x - from.x) * t,
                y: from.y + (to.y - from.y) * t,
            } as any;
        }

        // Handle colors in hex format
        if (
            typeof from === 'string' &&
            typeof to === 'string' &&
            this.isHexColor(from) &&
            this.isHexColor(to)
        ) {
            return this.interpolateColor(from, to, t) as any;
        }

        // Handle arrays of numbers
        if (
            Array.isArray(from) &&
            Array.isArray(to) &&
            from.length === to.length &&
            from.every((v) => typeof v === 'number') &&
            to.every((v) => typeof v === 'number')
        ) {
            return from.map((v, i) => v + (to[i] - v) * t) as any;
        }

        throw new Error('Interpolation for the given type is not implemented.');
    }

    private isVector2D(value: any): value is Vector2D {
        return (
            typeof value === 'object' &&
            'x' in value &&
            'y' in value &&
            typeof value.x === 'number' &&
            typeof value.y === 'number'
        );
    }

    private isHexColor(value: string): boolean {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
    }

    private interpolateColor(from: string, to: string, t: number): string {
        // Convert hex to RGB
        const fromRGB = this.hexToRGB(from);
        const toRGB = this.hexToRGB(to);

        // Interpolate each channel
        const r = Math.round(fromRGB.r + (toRGB.r - fromRGB.r) * t);
        const g = Math.round(fromRGB.g + (toRGB.g - fromRGB.g) * t);
        const b = Math.round(fromRGB.b + (toRGB.b - fromRGB.b) * t);

        // Convert back to hex
        return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
    }

    private hexToRGB(hex: string): { r: number; g: number; b: number } {
        let r, g, b;
        if (hex.length === 4) {
            // @ts-ignore
            r = parseInt(hex[1] + hex[1], 16);
            // @ts-ignore
            g = parseInt(hex[2] + hex[2], 16);
            // @ts-ignore
            b = parseInt(hex[3] + hex[3], 16);
        } else {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        return { r, g, b };
    }
}
