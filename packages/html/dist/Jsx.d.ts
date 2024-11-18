import { Key, Props, VNode, VNodeType } from './core_types';
/**
 * JSX Factory function
 */
export declare function jsx(type: VNodeType, props: Props | null, key?: Key): JSX.Element;
/**
 * JSX Factory function for elements with static children
 */
export declare function jsxs(type: VNodeType, props: Props | null, key?: Key): JSX.Element;
/**
 * JSX Factory function for fragments
 */
export declare function Fragment(props: {
    children?: VNode[];
}): JSX.Element;
/**
 * Creates JSX elements
 */
export declare function createElement(type: VNodeType, props: Props | null, ...children: VNode[]): JSX.Element;
/**
 * Utility function to create text VNodes
 */
export declare function createTextNode(text: string | number): VNode;
/**
 * Clones a JSX element
 */
export declare function cloneElement(element: JSX.Element, props?: Partial<Props>, ...children: VNode[]): JSX.Element;
declare global {
    namespace JSX {
        interface IntrinsicElements extends JSX.IntrinsicElements {
        }
    }
}
declare const _default: {
    jsx: typeof jsx;
    jsxs: typeof jsxs;
    Fragment: typeof Fragment;
    createElement: typeof createElement;
    createTextNode: typeof createTextNode;
    cloneElement: typeof cloneElement;
};
export default _default;
