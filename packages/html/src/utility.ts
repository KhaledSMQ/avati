import {
    ComponentClass,
    ForwardRefExoticComponent,
    FunctionComponent,
    VElement,
} from './core_types';

/**
 * Type guards
 */
export function isClassComponent(component: any): component is ComponentClass {
    return Boolean(component?.prototype?.isReactComponent);
}

export function isFunctionComponent(component: any): component is FunctionComponent {
    return typeof component === 'function' && !component.prototype?.isReactComponent;
}

export function isForwardRef<T = any, P = any>(
    component: any
): component is ForwardRefExoticComponent<P> {
    return Boolean(component?.__forwarded);
}

export function isVElement(value: any): value is VElement {
    return value && typeof value === 'object' && 'type' in value && 'props' in value;
}
