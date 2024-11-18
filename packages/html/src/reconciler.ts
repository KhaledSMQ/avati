import { Component, FunctionComponent, Key, Props, VElement, VNode } from './core_types';
import { HooksContext, HookState } from './hooksContext';
import { withHooks } from './hooks/withHooks';

interface Instance {
    type: string | Function;
    dom: HTMLElement | Text | null;
    vnode: VElement;
    parent: Instance | null;
    key?: Key;
    component?: any;
    childInstances: InstanceMap;
    unsubscribe?: () => void | null;
}

interface FunctionInstance extends Instance {
    type: FunctionComponent;
    component: {
        _instanceId: symbol;
        props: Props;
        setState: (state: any) => void;
        render: (props: Props) => VNode;
        _hooks?: any[];
        _mounted?: boolean | null;
    };
}

interface ComponentInstance {
    _instanceId: symbol;
    props: any;
    setState: (state: any) => void;
    render: (props: any) => VNode;
    _hooks: HookState[];
    _currentHookIndex: number;
    _mounted: boolean;
}

type InstanceMap = Map<Key, Instance>;

export class Reconciler {
    private static instance: Reconciler;
    private rootInstance: Instance | null = null;
    private pendingUpdates = new Set<Instance>();
    private isProcessingUpdates = false;

    private constructor() {
    }

    static getInstance(): Reconciler {
        if (!Reconciler.instance) {
            Reconciler.instance = new Reconciler();
        }
        return Reconciler.instance;
    }

    mount(vnode: VNode, container: HTMLElement): void {
        try {
            const oldInstance = this.rootInstance;
            const newInstance = this.reconcile(container, oldInstance, vnode);
            this.rootInstance = newInstance;
            this.processPendingUpdates();
        } catch (error) {
            console.error('Error during mount:', error);
            throw error;
        }
    }

    unmount(): void {
        if (this.rootInstance) {
            this.unmountInstance(this.rootInstance);
            this.rootInstance = null;
        }
    }

    private reconcile(
        parentDom: HTMLElement,
        instance?: Instance | null,
        vnode?: VNode | null,
    ): Instance | null {
        try {
            if (!vnode) {
                if (instance) {
                    this.unmountInstance(instance);
                }
                return null;
            }

            // Handle text nodes
            if (typeof vnode === 'string' || typeof vnode === 'number') {
                // @ts-ignore
                return this.reconcileText(parentDom, instance, String(vnode));
            }

            // Skip boolean and null values
            if (typeof vnode === 'boolean' || vnode === null) {
                return null;
            }

            // Normalize vnode
            if (Array.isArray(vnode)) {
                vnode = {
                    type: 'fragment',
                    props: { children: vnode },
                    key: null,
                    ref: null,
                };
            }

            const { type } = vnode;

            // Handle different component types
            if (typeof type === 'string') {
                // @ts-ignore
                return this.reconcileDOMComponent(parentDom, instance, vnode);
            } else if (typeof type === 'function') {
                if (this.isClassComponent(type)) {
                    // @ts-ignore
                    return this.reconcileClassComponent(parentDom, instance, vnode);
                } else {
                    // @ts-ignore
                    return this.reconcileFunctionComponent(parentDom, instance, vnode);
                }
            }

            console.error('Unknown element type:', type);
            return null;
        } catch (error) {
            console.error('Error during reconciliation:', error);
            throw error;
        }
    }

    private reconcileText(
        parentDom: HTMLElement,
        instance: Instance | null,
        text: string,
    ): Instance {
        if (instance && instance.type === 'TEXT_ELEMENT') {
            // Update existing text node
            (instance.dom as Text).nodeValue = text;
            return instance;
        }

        // Create new text node
        const dom = document.createTextNode(text);
        const newInstance: Instance = {
            type: 'TEXT_ELEMENT',
            dom,
            vnode: text as any,
            parent: null,
            key: null,
            childInstances: new Map(),
        };

        this.replaceNode(parentDom, dom, instance?.dom);
        return newInstance;
    }

    private reconcileDOMComponent(
        parentDom: HTMLElement,
        instance: Instance | null,
        vnode: VElement,
    ): Instance {
        if (instance && instance.type === vnode.type) {
            // Update existing DOM element
            this.updateDOMProperties(
                instance.dom as HTMLElement,
                instance.vnode.props,
                vnode.props,
            );
            instance.vnode = vnode;
            instance.childInstances = this.reconcileChildren(instance, vnode);
            return instance;
        }

        // Create new DOM element
        const dom = document.createElement(vnode.type as string);
        const newInstance: Instance = {
            type: vnode.type as string,
            dom,
            vnode,
            parent: null,
            key: vnode.key,
            childInstances: new Map(),
        };

        this.updateDOMProperties(dom, {}, vnode.props);
        newInstance.childInstances = this.reconcileChildren(newInstance, vnode);
        this.replaceNode(parentDom, dom, instance?.dom);
        return newInstance;
    }

    private reconcileClassComponent(
        parentDom: HTMLElement,
        instance: Instance | null,
        vnode: VElement,
    ): Instance {
        let componentInstance: Component;
        let dom: HTMLElement | Text | null = null;

        if (instance && instance.type === vnode.type) {
            // Update existing component
            componentInstance = instance.component;
            const oldProps = componentInstance.props;
            componentInstance.props = vnode.props;

            if (
                componentInstance.shouldComponentUpdate?.(vnode.props, componentInstance.state) ??
                true
            ) {
                const rendered = componentInstance.render();
                const childInstance = this.reconcile(
                    parentDom,
                    instance.childInstances.get('0'),
                    rendered as VElement,
                );

                if (childInstance) {
                    instance.childInstances.set('0', childInstance);
                    dom = childInstance.dom;
                }

                componentInstance.componentDidUpdate?.(oldProps, componentInstance.state);
            } else {
                dom = instance.dom;
            }

            instance.dom = dom;
            instance.vnode = vnode;
            return instance;
        }

        // Create new component
        if (instance) {
            this.unmountInstance(instance);
        }

        componentInstance = new (vnode.type as any)(vnode.props);
        const rendered = componentInstance.render();
        // @ts-ignore
        const childInstance = this.reconcile(parentDom, null, rendered);

        const newInstance: Instance = {
            type: vnode.type,
            dom: childInstance?.dom ?? null,
            vnode,
            component: componentInstance,
            parent: null,
            key: vnode.key,
            childInstances: new Map(),
        };

        if (childInstance) {
            newInstance.childInstances.set('0', childInstance);
            childInstance.parent = newInstance;
        }

        // Mount lifecycle
        componentInstance.componentDidMount?.();

        return newInstance;
    }

    private reconcileFunctionComponent(
        parentDom: HTMLElement,
        instance: Instance | null,
        vnode: VElement,
    ): Instance {
        const type = vnode.type as FunctionComponent;
        let componentInstance: ComponentInstance;

        if (instance && instance.type === type) {
            // Update existing component
            componentInstance = instance.component;
            componentInstance.props = vnode.props;
        } else {
            // Create new function component instance
            const functionComponent = withHooks(type as (props: Props) => VNode);
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const _this = this;
            componentInstance = new (class FunctionComponent {
                _instanceId = Symbol('function-component');
                props = vnode.props;
                _hooks: HookState[] = [];
                _currentHookIndex = 0;
                _mounted = false;
                render = functionComponent;

                setState = (state: any) => {
                    _this.scheduleUpdate(componentInstance);
                };
            })();
        }

        // Set up hooks context
        const context = HooksContext.getInstance();
        // @ts-ignore
        context.beginRender(componentInstance);

        try {
            const rendered = componentInstance.render(vnode.props);
            const childInstance = this.reconcile(
                parentDom,
                instance?.childInstances.get('0') ?? null,
                rendered,
            );

            const newInstance: Instance = {
                type,
                dom: childInstance?.dom ?? null,
                vnode,
                component: componentInstance,
                parent: null,
                key: vnode.key,
                childInstances: new Map(),
            };

            if (childInstance) {
                newInstance.childInstances.set('0', childInstance);
                childInstance.parent = newInstance;
            }

            // Mark component as mounted after successful render
            // componentInstance._mounted = true;

            if (!componentInstance._mounted) {
                componentInstance._mounted = true;
                // Schedule effects to run after the DOM is updated
                queueMicrotask(() => {
                    if (componentInstance._mounted) {
                        // @ts-ignore
                        HooksContext.getInstance().runEffects(componentInstance);
                    }
                });
            } else {
                // Schedule update effects
                queueMicrotask(() => {
                    if (componentInstance._mounted) {
                        // @ts-ignore
                        HooksContext.getInstance().updateEffects(componentInstance);
                    }
                });
            }

            return newInstance;
        } finally {
            context.endRender();
        }
    }

    private reconcileChildren(instance: Instance, vnode: VElement): InstanceMap {
        const dom = instance.dom as HTMLElement;
        const oldChildInstances = instance.childInstances;
        const nextChildElements = this.normalizeChildren(vnode.props.children);
        const newChildInstances = new Map<Key, Instance>();

        // Create a map of key to old instances
        const oldInstanceMap = new Map<Key, Instance>();
        oldChildInstances.forEach((child, key) => {
            const childKey = child.key ?? key;
            oldInstanceMap.set(childKey, child);
        });

        // Reconcile children
        let lastDom: Node | null = null;

        nextChildElements.forEach((childElement, index) => {
            const key = this.getKey(childElement, index);
            const oldChild = oldInstanceMap.get(key);
            const newChild = this.reconcile(dom, oldChild, childElement);

            if (newChild) {
                newChildInstances.set(key, newChild);
                newChild.parent = instance;

                // Handle DOM positioning
                if (newChild.dom) {
                    if (lastDom && newChild.dom !== lastDom.nextSibling) {
                        dom.insertBefore(newChild.dom, lastDom.nextSibling);
                    }
                    lastDom = newChild.dom;
                }
            }
        });

        // Remove old instances that weren't reused
        oldChildInstances.forEach((oldChild, key) => {
            if (!newChildInstances.has(key)) {
                this.unmountInstance(oldChild);
            }
        });

        return newChildInstances;
    }

    private updateDOMProperties(dom: HTMLElement, prevProps: Props, nextProps: Props): void {
        const isEvent = (name: string) => name.startsWith('on');
        const isAttribute = (name: string) =>
            !isEvent(name) && name !== 'children' && name !== 'ref';

        // Remove old event listeners
        Object.keys(prevProps)
            .filter(isEvent)
            .forEach((name) => {
                const eventType = name.toLowerCase().substring(2);
                dom.removeEventListener(eventType, prevProps[name]);
            });

        // Remove old attributes
        Object.keys(prevProps)
            .filter(isAttribute)
            .forEach((name) => {
                dom.removeAttribute(name);
            });

        // Handle old ref
        if (prevProps.ref) {
            this.handleRef(prevProps.ref, null);
        }

        // Add new event listeners
        Object.keys(nextProps)
            .filter(isEvent)
            .forEach((name) => {
                const eventType = name.toLowerCase().substring(2);
                dom.addEventListener(eventType, nextProps[name]);
            });

        // Set new attributes
        Object.keys(nextProps)
            .filter(isAttribute)
            .forEach((name) => {
                const value = nextProps[name];
                if (value != null) {
                    if (name === 'className') {
                        dom.setAttribute('class', value);
                    } else if (name === 'style' && typeof value === 'object') {
                        Object.assign(dom.style, value);
                    } else {
                        dom.setAttribute(name, value.toString());
                    }
                }
            });

        // Handle new ref
        if (nextProps.ref) {
            this.handleRef(nextProps.ref, dom);
        }
    }

    private unmountInstance(instance: Instance): void {
        // Handle function component cleanup
        if (this.isFunctionComponent(instance)) {
            const componentInstance = instance.component;
            componentInstance._mounted = false;
            // @ts-ignore
            HooksContext.getInstance().cleanup(componentInstance);
        }

        // Rest of unmount logic...
        instance.childInstances.forEach((child) => {
            this.unmountInstance(child);
        });

        if (instance.dom?.parentNode) {
            instance.dom.parentNode.removeChild(instance.dom);
        }

        if (instance.unsubscribe) {
            instance.unsubscribe();
        }
    }

    private scheduleUpdate(component: FunctionInstance['component']) {
        if (this.isProcessingUpdates) {
            this.pendingUpdates.add(component as any);
            return;
        }

        this.isProcessingUpdates = true;
        queueMicrotask(() => {
            try {
                this.processUpdate(component);
            } finally {
                this.isProcessingUpdates = false;
                if (this.pendingUpdates.size > 0) {
                    const updates = Array.from(this.pendingUpdates);
                    this.pendingUpdates.clear();
                    updates.forEach((comp) => this.scheduleUpdate(comp as any));
                }
            }
        });
    }

    private processUpdate(component: FunctionInstance['component']) {
        const instance = this.findInstanceByComponent(component);
        if (!instance || !instance.dom?.parentElement) return;

        const parentDom = instance.dom.parentElement;
        const prevVNode = instance.vnode;
        const nextVNode = {
            ...prevVNode,
            props: component.props,
        };

        const newInstance = this.reconcile(parentDom, instance, nextVNode);

        // Update root instance if necessary
        if (instance === this.rootInstance) {
            this.rootInstance = newInstance;
        }
    }

    private processPendingUpdates() {
        console.log('process update');
        if (this.isProcessingUpdates) return;

        this.isProcessingUpdates = true;
        try {
            while (this.pendingUpdates.size > 0) {
                const updates = Array.from(this.pendingUpdates);
                this.pendingUpdates.clear();

                for (const instance of updates) {
                    this.updateInstance(instance);
                }
            }
        } finally {
            this.isProcessingUpdates = false;
        }
    }

    private updateInstance(instance: Instance) {
        const parentDom = instance.dom?.parentElement;
        if (!parentDom) return;

        const prevVNode = instance.vnode;
        const nextVNode = {
            ...prevVNode,
            props: {
                ...prevVNode.props,
                children: prevVNode.props.children,
            },
        };

        this.reconcile(parentDom, instance, nextVNode);
    }

    private findInstanceByComponent(component: FunctionInstance['component']): Instance | null {
        const search = (instance: Instance | null): Instance | null => {
            if (!instance) return null;

            if ('component' in instance && instance.component === component) {
                return instance;
            }

            for (const childInstance of instance.childInstances.values()) {
                const found = search(childInstance);
                if (found) return found;
            }

            return null;
        };

        return search(this.rootInstance);
    }

    // Utility methods
    private isClassComponent(type: any): type is typeof Component {
        return type.prototype instanceof Component;
    }

    private getKey(vnode: VNode, index: number): Key {
        if (!vnode || typeof vnode === 'string' || typeof vnode === 'number') {
            return index.toString();
        }
        return (vnode as VElement).key ?? index.toString();
    }

    private normalizeChildren(children: any): VNode[] {
        if (!children) return [];
        return Array.isArray(children) ? children.flat() : [children];
    }

    private replaceNode(
        parentDom: HTMLElement,
        newDom: HTMLElement | Text,
        oldDom?: HTMLElement | Text | null,
    ): void {
        if (oldDom && oldDom.parentNode === parentDom) {
            parentDom.replaceChild(newDom, oldDom);
        } else {
            parentDom.appendChild(newDom);
        }
    }

    private handleRef(ref: any, value: any): void {
        if (typeof ref === 'function') {
            ref(value);
        } else if (ref && typeof ref === 'object' && 'current' in ref) {
            ref.current = value;
        }
    }

    private isFunctionComponent(instance: Instance): instance is FunctionInstance {
        return (
            typeof instance.type === 'function' && !(instance.type.prototype instanceof Component)
        );
    }
}
