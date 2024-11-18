/**
 * Basic primitive types
 */
export type Key = string | number | null;
export type VNode = VElement | string | number | boolean | null | undefined;
export type Ref<T> = RefObject<T> | ((instance: T | null) => void);
export declare abstract class Component<P = {}, S = {}> {
    props: Readonly<P>;
    state: Readonly<S>;
    constructor(props: P);
    abstract render(): JSX.Element;
    abstract componentDidMount?(): void;
    abstract componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): void;
    abstract componentWillUnmount?(): void;
    abstract shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>): boolean;
    abstract setState(updater: Partial<S> | ((prevState: Readonly<S>, props: Readonly<P>) => Partial<S>), callback?: () => void): void;
    static readonly isReactComponent = true;
}
export type VNodeType = string | FunctionComponent | typeof Component;
/**
 * Props and elements
 */
export interface Props {
    children?: VNode | VNode[];
    key?: Key;
    ref?: RefObject<any>;
    className?: string;
    style?: Partial<CSSStyleDeclaration>;
    [key: string]: any;
}
export interface VElement {
    type: VNodeType;
    props: Props;
    key?: Key;
    ref?: RefObject<any> | null;
    __owner?: Component | null;
    __context?: Context<any>;
}
/**
 * Function component definition
 */
export interface FunctionComponent<P = {}> {
    (props: P): JSX.Element;
    defaultProps?: Partial<P>;
    displayName?: string;
    _owner?: Component | null;
    _hooks?: any[];
    _hookIndex?: number;
    _signals?: Set<ISignal<any>> | null;
    setState?: (state: any) => void;
}
export type FC<P = {}> = FunctionComponent<P>;
/**
 * Ref types
 */
export interface RefObject<T = any> {
    current: T | null;
}
export interface ForwardRefRenderFunction<T, P = {}> {
    (props: P, ref: RefObject<T>): JSX.Element;
    displayName?: string;
}
export interface ForwardRefExoticComponent<P> extends FunctionComponent<P> {
    defaultProps?: Partial<P>;
    displayName?: string;
}
/**
 * Context types
 */
export interface Context<T> {
    Provider: ProviderComponent<T>;
    Consumer: ConsumerComponent<T>;
    displayName?: string;
    _currentValue: T;
    _defaultValue: T;
    _currentProvider: Component | null;
}
export interface ProviderProps<T> extends Props {
    value: T;
    children: VNode[];
}
export interface ConsumerProps<T> {
    children: (value: T) => JSX.Element;
}
export interface ProviderComponent<T> extends FunctionComponent<ProviderProps<T>> {
    _context: Context<T>;
}
export interface ConsumerComponent<T> extends FunctionComponent<ConsumerProps<T>> {
    _context: Context<T>;
}
/**
 * Hook types
 */
export type Dispatch<A> = (action: A) => void;
export type SetStateAction<S> = S | ((prevState: S) => S);
export type DependencyList = ReadonlyArray<any>;
export interface EffectCallback {
    (): void | (() => void);
}
/**
 * Component types
 */
export declare enum ComponentLifecycleState {
    UNMOUNTED = "UNMOUNTED",
    MOUNTING = "MOUNTING",
    MOUNTED = "MOUNTED",
    UPDATING = "UPDATING",
    UNMOUNTING = "UNMOUNTING"
}
export interface ComponentClass<P = {}> {
    new (props: P): Component<P>;
    contextType?: Context<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
}
export interface ErrorInfo {
    componentStack: string;
}
export interface ISignal<T> {
    value: T;
    subscribers: Set<() => void>;
    subscribe(callback: () => void): () => void;
    unsubscribe(callback: () => void): void;
    emit(value: T): void;
}
/**
 * Hook related types
 */
export interface Hook {
    state: any;
    queue: any[];
}
export interface EffectHook extends Hook {
    cleanup?: () => void;
    deps?: DependencyList;
}
export interface HookComponent extends FunctionComponent {
    _hooks: Hook[];
    _hookIndex: number;
}
/**
 * Error Boundary types
 */
export interface ErrorBoundaryProps {
    fallback: JSX.Element | ((error: Error, errorInfo: ErrorInfo) => JSX.Element);
    children?: VNode[];
}
export interface ErrorBoundaryState {
    error: Error | null;
    errorInfo: ErrorInfo | null;
}
/**
 * Utility types
 */
export type ComponentType<P = any> = ComponentClass<P> | FunctionComponent<P>;
export type PropsWithChildren<P = unknown> = P & {
    children?: VNode[];
};
export type ComponentProps<T extends ComponentType<any>> = T extends ComponentType<infer P> ? P : never;
export type ContextType<T extends Context<any>> = T extends Context<infer U> ? U : never;
