import { RefObject, VNode } from './core_types';

export interface HookState {
    value: any;
    deps?: any[];
    cleanup?: () => void;
    type?: string | null;
}

export interface ComponentInstance {
    _instanceId: symbol;
    props: any;
    setState: (state: any) => void;
    render: (props: any) => VNode;
    _hooks: HookState[];
    _currentHookIndex: number;
    _mounted: boolean;
    _refs: Set<RefObject<any>>;

    [key: string]: any;
}

export interface EffectState extends HookState {
    type: 'effect';
    effect: () => void | (() => void);
    deps?: any[];
    cleanup?: () => void;
    depsChanged?: boolean;
}

export class HooksContext {
    private static instance: HooksContext;
    private currentComponent: ComponentInstance | null = null;
    private hookStates = new WeakMap<ComponentInstance, HookState[]>();
    private updateScheduled = new WeakSet<ComponentInstance>();

    private constructor() {}

    static getInstance(): HooksContext {
        if (!HooksContext.instance) {
            HooksContext.instance = new HooksContext();
        }
        return HooksContext.instance;
    }

    beginRender(component: ComponentInstance): void {
        if (this.currentComponent) {
            return;
            throw new Error('Hooks context already has an active component');
        }
        this.currentComponent = component;
        component._currentHookIndex = 0;

        if (!this.hookStates.has(component)) {
            this.hookStates.set(component, []);
        }

        // Initialize refs set if not exists
        if (!component._refs) {
            component._refs = new Set();
        }
    }

    endRender(): void {
        if (this.currentComponent) {
            // Verify all hooks were called in the same order
            const hooks = this.hookStates.get(this.currentComponent);
            if (hooks && hooks.length !== this.currentComponent._currentHookIndex) {
                console.warn('Hook count mismatch: possible conditional hook usage', {
                    expected: hooks.length,
                    actual: this.currentComponent._currentHookIndex,
                });
            }

            // this.currentComponent._mounted = true;
        }
        this.currentComponent = null;
    }

    getHookState<T extends HookState>(initialState?: Partial<T>): T {
        if (!this.currentComponent) {
            throw new Error('Hook called outside of component render');
        }

        const componentHooks = this.hookStates.get(this.currentComponent)!;
        const hookIndex = this.currentComponent._currentHookIndex++;

        if (hookIndex >= componentHooks.length) {
            const newState = { ...initialState } as T;
            componentHooks.push(newState);
            return newState;
        }

        return componentHooks[hookIndex] as T;
    }

    scheduleUpdate(component: ComponentInstance): void {
        if (!this.updateScheduled.has(component)) {
            this.updateScheduled.add(component);
            queueMicrotask(() => {
                if (this.updateScheduled.has(component) && component._mounted) {
                    this.updateScheduled.delete(component);
                    component.setState({});
                }
            });
        }
    }

    registerRef<T>(ref: RefObject<T>): void {
        if (this.currentComponent) {
            this.currentComponent._refs.add(ref);
        }
    }

    runEffects(component: ComponentInstance): void {
        const states = this.hookStates.get(component);
        if (!states) return;

        states.forEach((state, index) => {
            if (state.type === 'effect') {
                const effect = state as EffectState;
                // Run effect and store cleanup
                if (effect.effect) {
                    if (effect.cleanup) {
                        effect.cleanup();
                    }
                    effect.cleanup = effect.effect() || undefined;
                }
            }
        });
    }

    updateEffects(component: ComponentInstance): void {
        const states = this.hookStates.get(component);
        if (!states) return;

        states.forEach((state, index) => {
            if (state.type === 'effect') {
                const effect = state as EffectState;
                if (!effect.deps || effect.depsChanged) {
                    // Run effect if deps changed or no deps
                    if (effect.cleanup) {
                        effect.cleanup();
                    }
                    effect.cleanup = effect.effect() || undefined;
                    effect.depsChanged = false;
                }
            }
        });
    }

    cleanup(component: ComponentInstance): void {
        const states = this.hookStates.get(component);
        if (states) {
            states.forEach((state) => {
                if (state.type === 'effect' && state.cleanup) {
                    state.cleanup();
                }
            });
            this.hookStates.delete(component);
        }

        this.updateScheduled.delete(component);
    }
}
