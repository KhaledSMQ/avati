import { TweenOptions } from './types';
export declare class Tween<T> {
    private from;
    private to;
    private duration;
    private easingFn;
    private onUpdate;
    private onComplete?;
    private startTime;
    private isActive;
    constructor(options: TweenOptions<T>);
    static EasingFunctions: {
        linear: (t: number) => number;
        easeInCubic: (t: number) => number;
        easeOutCubic: (t: number) => number;
        easeInOutCubic: (t: number) => number;
        easeInQuad: (t: number) => number;
        easeOutQuad: (t: number) => number;
        easeInOutQuad: (t: number) => number;
        easeInElastic: (t: number) => number;
        bounce: (t: number) => number;
    };
    start(): void;
    stop(): void;
    update(_deltaTime: number): void;
    private interpolate;
    private isVector2D;
    private isHexColor;
    private interpolateColor;
    private hexToRGB;
}
//# sourceMappingURL=tween.d.ts.map