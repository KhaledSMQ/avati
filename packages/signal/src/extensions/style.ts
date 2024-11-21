/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { computed, Signal, SignalOptions } from '../core';


// Type definitions for style properties
type StyleProperties = Partial<CSSStyleDeclaration>;

interface ExtendedStyleProperties extends Partial<CSSStyleDeclaration> {
    className?: string;
}
interface StyleSignalOptions extends SignalOptions<StyleProperties> {
    // Optional: Add transition settings
    transition?: {
        duration?: string;
        timing?: string;
        properties?: string[];
    };
}

/**
 * StyleSignal class for reactive style manipulation
 *
 * @example
 * const elementStyle = new StyleSignal({
 *   backgroundColor: 'blue',
 *   width: '100px'
 * });
 *
 * // Update single property
 * elementStyle.set('backgroundColor', 'red');
 *
 * // Update multiple properties
 * elementStyle.setMultiple({
 *   width: '200px',
 *   opacity: 0.5
 * });
 *
 * // Example usage with React:
 * export function useStyleSignal(initialStyles: StyleProperties = {}, options: StyleSignalOptions = {}) {
 *     const styleSignal = React.useMemo(() => new StyleSignal(initialStyles, options), []);
 *     const computedStyle = styleSignal.getComputedStyle();
 *
 *     React.useEffect(() => {
 *         return () => styleSignal.dispose();
 *     }, [styleSignal]);
 *
 *     return [styleSignal, computedStyle] as const;
 * }
 *
 */
export class StyleSignal extends Signal<ExtendedStyleProperties> {

    private transitions: StyleSignalOptions['transition'];

    constructor(initialStyles: StyleProperties = {}, options: StyleSignalOptions = {}) {
        // Initialize with default transition if not provided
        const defaultTransitions = {
            duration: '0.3s',
            timing: 'ease',
            properties: ['all'],
            ...options.transition
        };

        super(initialStyles, {
            ...options,
            equals: options.equals || ((prev, next) => {
                const prevKeys = Object.keys(prev);
                const nextKeys = Object.keys(next);

                if (prevKeys.length !== nextKeys.length) return false;

                return prevKeys.every(key =>
                    prev[key as keyof StyleProperties] === next[key as keyof StyleProperties]
                );
            })
        });

        this.transitions = defaultTransitions;
    }

    /**
     * Set a single style property
     */
    set<K extends keyof StyleProperties>(property: K, value: StyleProperties[K]): void {
        this.update(current => ({
            ...current,
            [property]: value
        }));
    }

    /**
     * Set multiple style properties at once
     */
    setMultiple(styles: Partial<StyleProperties>): void {
        this.update(current => ({
            ...current,
            ...styles
        }));
    }

    /**
     * Toggle a boolean-like style property (e.g., visibility)
     */
    toggle(property: keyof StyleProperties): void {
        this.update(current => {
            const currentValue = current[property];
            let newValue: string | undefined;

            switch (currentValue) {
                case 'visible':
                    newValue = 'hidden';
                    break;
                case 'hidden':
                    newValue = 'visible';
                    break;
                case 'none':
                    newValue = 'block';
                    break;
                case 'block':
                    newValue = 'none';
                    break;
                default:
                    newValue = currentValue ? undefined : 'block';
            }

            return {
                ...current,
                [property]: newValue
            };
        });
    }

    /**
     * Increment a numeric style property
     */
    increment(property: keyof StyleProperties, amount: number = 1, unit: string = 'px'): void {
        this.update(current => {
            const currentValue = current[property];
            if (typeof currentValue === 'string') {
                const numericValue = parseFloat(currentValue) || 0;
                return {
                    ...current,
                    [property]: `${numericValue + amount}${unit}`
                };
            }
            return current;
        });
    }

    /**
     * Decrement a numeric style property
     */
    decrement(property: keyof StyleProperties, amount: number = 1, unit: string = 'px'): void {
        this.increment(property, -amount, unit);
    }

    /**
     * Add a CSS class
     */
    addClass(className: string): void {
        this.update(current => {
            const classes = (current.className as string || '').split(' ').filter(Boolean);
            if (!classes.includes(className)) {
                classes.push(className);
            }
            return {
                ...current,
                className: classes.join(' ')
            };
        });
    }

    /**
     * Remove a CSS class
     */
    removeClass(className: string): void {
        this.update(current => {
            const classes = (current.className as string || '').split(' ').filter(c => c !== className);
            return {
                ...current,
                className: classes.join(' ')
            };
        });
    }

    /**
     * Toggle a CSS class
     */
    toggleClass(className: string): void {
        this.update(current => {
            const classes = (current.className as string || '').split(' ').filter(Boolean);
            const index = classes.indexOf(className);

            if (index === -1) {
                classes.push(className);
            } else {
                classes.splice(index, 1);
            }

            return {
                ...current,
                className: classes.join(' ')
            };
        });
    }

    /**
     * Get computed style object with transitions
     */
    getComputedStyle() {
        return computed(() => {
            const currentStyles = this.value;
            const { duration, timing, properties } = this.transitions || {
                duration: 0,
                timing: undefined,
                properties: []
            };

            return {
                ...currentStyles,
                transition: properties!.map(prop =>
                    `${prop} ${duration} ${timing}`
                ).join(', ')
            };
        });
    }

    /**
     * Create an animation sequence
     */
    animate(keyframes: StyleProperties[], options: KeyframeAnimationOptions = {}): Promise<void> {
        const defaults = {
            duration: 1000,
            easing: 'ease',
            fill: 'forwards' as const
        };

        const settings = { ...defaults, ...options };
        const timePerFrame = Number(settings.duration) / keyframes.length;

        return new Promise((resolve) => {
            let currentFrame = 0;

            const animateFrame = () => {
                if (currentFrame >= keyframes.length) {
                    resolve();
                    return;
                }

                this.setMultiple(keyframes[currentFrame] as StyleProperties);
                currentFrame++;

                setTimeout(animateFrame, timePerFrame);
            };

            animateFrame();
        });
    }
}
