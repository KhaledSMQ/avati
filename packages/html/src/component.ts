import { ComponentLifecycleState } from './core_types';
import { RefManager } from './ref';

/**
 * Abstract base Component class.
 */
export abstract class Component<P = {}, S = {}> {
    /**
     * Static methods for component instance tracking
     */
    private static _currentInstance: Component | null = null;
    props: P;
    state: S;
    _owner: Component | null = null;
    _internalInstance: any = null;
    private _lifecycleState: ComponentLifecycleState = ComponentLifecycleState.UNMOUNTED;
    private _pendingState: Partial<S>[] = [];
    private _isBatchingUpdates: boolean = false;
    private _contextUnsubscribe: (() => void) | null = null;

    constructor(props: P) {
        this.props = Object.freeze({ ...props });
        this.state = Object.freeze({} as S);
    }

    static get current(): Component | null {
        return Component._currentInstance;
    }

    static set current(instance: Component | null) {
        Component._currentInstance = instance;
    }

    /**
     * Updates component state
     */
    setState(
        updater: Partial<S> | ((prevState: Readonly<S>, props: Readonly<P>) => Partial<S>),
        callback?: () => void,
    ): void {
        const nextState = typeof updater === 'function' ? updater(this.state, this.props) : updater;

        this._pendingState.push(nextState);

        if (!this._isBatchingUpdates) {
            this._flushPendingState();
            callback?.();
        }
    }

    /**
     * Internal method to handle mounting
     */
    _handleMount(): void {
        if (this._lifecycleState !== ComponentLifecycleState.UNMOUNTED) {
            return;
        }

        this._lifecycleState = ComponentLifecycleState.MOUNTING;
        this.componentDidMount?.();
        this._lifecycleState = ComponentLifecycleState.MOUNTED;
    }

    /**
     * Internal method to handle unmounting
     */
    _handleUnmount(): void {
        if (this._lifecycleState !== ComponentLifecycleState.MOUNTED) {
            return;
        }

        this._lifecycleState = ComponentLifecycleState.UNMOUNTING;

        // Cleanup context subscription
        if (this._contextUnsubscribe) {
            this._contextUnsubscribe();
            this._contextUnsubscribe = null;
        }

        this.componentWillUnmount?.();
        this._lifecycleState = ComponentLifecycleState.UNMOUNTED;
    }

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
    _startBatch(): void {
        this._isBatchingUpdates = true;
    }

    _endBatch(): void {
        this._isBatchingUpdates = false;
        this._flushPendingState();
    }

    /**
     * Force updates the component
     */
    protected forceUpdate(): void {
        if (this._lifecycleState === ComponentLifecycleState.MOUNTED) {
            this._performUpdate();
        }
    }

    /**
     * Flushes pending state updates
     */
    private _flushPendingState(): void {
        if (this._pendingState.length === 0) {
            return;
        }

        const prevState = this.state;
        const nextState = this._pendingState.reduce(
            (acc, update) => ({ ...acc, ...update }),
            this.state,
        );

        this._pendingState = [];
        this.state = Object.freeze(nextState) as S;

        if (this._lifecycleState === ComponentLifecycleState.MOUNTED) {
            this._performUpdate(prevState);
        }
    }

    /**
     * Performs component update
     */
    private _performUpdate(prevState?: Readonly<S>): void {
        this._lifecycleState = ComponentLifecycleState.UPDATING;
        const prevProps = this.props;

        if (this.shouldComponentUpdate?.(this.props, this.state) ?? true) {
            const rendered = this.render();
            // Reconciler will handle the actual update
            this.componentDidUpdate?.(prevProps, prevState || this.state);
        }

        this._lifecycleState = ComponentLifecycleState.MOUNTED;
    }
}

/**
 * Enhanced base component with ref support
 */
export abstract class ComponentWithRefs extends Component {
    private _refCallbacks: Set<() => void> = new Set();

    /**
     * Cleanup all refs when component unmounts
     */
    componentWillUnmount(): void {
        this._refCallbacks.forEach((callback) => callback());
        this._refCallbacks.clear();
        // @ts-ignore
        RefManager.clearRefs(this);
    }

    /**
     * Register a ref callback for cleanup
     */
    protected registerRefCallback(callback: () => void): void {
        this._refCallbacks.add(callback);
    }
}
