export type EasingFunction = (t: number) => number;
export type VoidCallbackFunction = (t: any) => void;

export interface Vector2D {
    x: number;
    y: number;
}

export interface TweenOptions<T> {
    from: T;
    to: T;
    duration: number;
    easing?: EasingFunction;
    onUpdate: VoidCallbackFunction;
    onComplete?: () => void;
}
