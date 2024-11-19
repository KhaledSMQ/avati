import { Key, Props, VNode, VNodeType } from './core.types';

/**
 * JSX Factory function
 */
export function jsx(type: VNodeType, props: Props | null, key?: Key): JSX.Element {
    props = props || {};
    const { children, ...restProps } = props;

    return {
        type,
        props: {
            ...restProps,
            children: children ?? [],
        },
        key: key ?? props.key ?? null,
        ref: props.ref ?? null,
    };
}

/**
 * JSX Factory function for elements with static children
 */
export function jsxs(type: VNodeType, props: Props | null, key?: Key): JSX.Element {
    return jsx(type, props, key);
}

/**
 * JSX Factory function for fragments
 */
export function Fragment(props: { children?: VNode[] }): JSX.Element {
    return {
        type: Symbol.for('react.fragment'),
        props: { children: props.children || [] },
        key: null,
        ref: null,
    };
}

/**
 * Creates JSX elements
 */
export function createElement(
    type: VNodeType,
    props: Props | null,
    ...children: VNode[]
): JSX.Element {
    props = props || {};

    // Normalize children
    const normalizedChildren = children
        .flat()
        .filter((child) => child !== null && child !== undefined && child !== false);

    return {
        type,
        props: {
            ...props,
            children: normalizedChildren.length === 0 ? props.children || [] : normalizedChildren,
        },
        key: props.key ?? null,
        ref: props.ref ?? null,
    };
}

/**
 * Utility function to create text VNodes
 */
export function createTextNode(text: string | number): VNode {
    return String(text);
}

/**
 * Clones a JSX element
 */
export function cloneElement(
    element: JSX.Element,
    props?: Partial<Props>,
    ...children: VNode[]
): JSX.Element {
    return {
        type: element.type,
        props: {
            ...element.props,
            ...props,
            children: children.length > 0 ? children : element.props.children,
        },
        key: (props && props.key) ?? element.key,
        ref: (props && props.ref) ?? element.ref,
    };
}


