import { Signal } from './Signal';
/**
 * Abstract base Component class.
 */
export declare abstract class Component<P = {}, S = {}> {
    props: P;
    state: S;
    private _lifecycleState;
    private _pendingState;
    private _isBatchingUpdates;
    private _contextUnsubscribe;
    _signals: Set<Signal<any>> | null;
    _owner: Component | null;
    _internalInstance: any;
    constructor(props: P);
    /**
     * Updates component state
     */
    setState(updater: Partial<S> | ((prevState: Readonly<S>, props: Readonly<P>) => Partial<S>), callback?: () => void): void;
    /**
     * Force updates the component
     */
    protected forceUpdate(): void;
    /**
     * Internal method to handle mounting
     */
    _handleMount(): void;
    /**
     * Internal method to handle unmounting
     */
    _handleUnmount(): void;
    /**
     * Flushes pending state updates
     */
    private _flushPendingState;
    /**
     * Performs component update
     */
    private _performUpdate;
    /**
     * Lifecycle methods
     */
    abstract render(): JSX.Element;
    shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>): boolean;
    componentDidMount?(): void;
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): void;
    componentWillUnmount?(): void;
    /**
     * Internal methods for batching
     */
    _startBatch(): void;
    _endBatch(): void;
    /**
     * Static methods for component instance tracking
     */
    private static _currentInstance;
    static get current(): Component | null;
    static set current(instance: Component | null);
}
/**
 * Enhanced base component with ref support
 */
export declare abstract class ComponentWithRefs extends Component {
    private _refCallbacks;
    /**
     * Register a ref callback for cleanup
     */
    protected registerRefCallback(callback: () => void): void;
    /**
     * Cleanup all refs when component unmounts
     */
    componentWillUnmount(): void;
}
