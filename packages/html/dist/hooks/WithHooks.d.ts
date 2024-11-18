import { VNode } from '../core_types';
import { ComponentInstance } from '../HooksContext';
export declare function withHooks<P extends object = {}>(Component: (props: P) => VNode): (this: ComponentInstance, props: P) => JSX.Element;
