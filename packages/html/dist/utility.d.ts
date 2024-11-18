import { ComponentClass, ForwardRefExoticComponent, FunctionComponent, VElement } from './core_types';
/**
 * Type guards
 */
export declare function isClassComponent(component: any): component is ComponentClass;
export declare function isFunctionComponent(component: any): component is FunctionComponent;
export declare function isForwardRef<T = any, P = any>(component: any): component is ForwardRefExoticComponent<P>;
export declare function isVElement(value: any): value is VElement;
