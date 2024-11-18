import { Component, FunctionComponent } from './core_types';

/**
 * Base ref types
 */
export interface RefObject<T> {
    current: T | null;
}

export interface MutableRefObject<T> {
    current: T;
}

export type RefCallback<T> = (instance: T | null) => void;
export type Ref<T> = RefObject<T> | MutableRefObject<T> | RefCallback<T> | null;

interface RefHookState {
    current: any;
}

/**
 * Create mutable ref object
 */
export function createRef<T>(initialValue: T | null = null): MutableRefObject<T | null> {
    return { current: initialValue };
}

/**
 * Create callback ref
 */
export function createCallbackRef<T>(callback: RefCallback<T>): RefCallback<T> {
    let current: T | null = null;
    return (instance: T | null) => {
        if (current === instance) return;
        current = instance;
        callback(instance);
    };
}

/**
 * Merge multiple refs into one
 */
export function mergeRefs<T>(...refs: Array<Ref<T>>): RefCallback<T> {
    return (instance: T | null) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(instance);
            } else if (ref) {
                (ref as MutableRefObject<T | null>).current = instance;
            }
        });
    };
}

/**
 * Forward ref HOC
 */
export function forwardRef<T, P = {}>(
    render: (props: P, ref: Ref<T>) => JSX.Element,
): FunctionComponent<P & { ref?: Ref<T> }> {
    function ForwardRefComponent(props: P & { ref?: Ref<T> }) {
        const { ref, ...rest } = props as any;
        return render(rest, ref);
    }

    ForwardRefComponent.displayName = `ForwardRef(${render.name || 'Component'})`;
    return ForwardRefComponent;
}

/**
 * Ref handling utilities
 */
export class RefManager {
    private static refs = new WeakMap<Component, Set<Ref<any>>>();

    static registerRef(component: Component, ref: Ref<any>): void {
        if (!this.refs.has(component)) {
            this.refs.set(component, new Set());
        }
        this.refs.get(component)!.add(ref);
    }

    static unregisterRef(component: Component, ref: Ref<any>): void {
        const componentRefs = this.refs.get(component);
        if (componentRefs) {
            componentRefs.delete(ref);
        }
    }

    static clearRefs(component: Component): void {
        const componentRefs = this.refs.get(component);
        if (componentRefs) {
            componentRefs.forEach((ref) => {
                if (typeof ref === 'function') {
                    ref(null);
                } else if (ref) {
                    ref.current = null;
                }
            });
            this.refs.delete(component);
        }
    }

    static attachRef<T>(ref: Ref<T> | undefined, instance: T | null): void {
        if (!ref) return;

        if (typeof ref === 'function') {
            ref(instance);
        } else {
            (ref as MutableRefObject<T | null>).current = instance;
        }
    }
}
