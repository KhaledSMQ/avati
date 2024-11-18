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
export declare class HooksContext {
    private static instance;
    private currentComponent;
    private hookStates;
    private updateScheduled;
    private constructor();
    static getInstance(): HooksContext;
    beginRender(component: ComponentInstance): void;
    endRender(): void;
    getHookState<T extends HookState>(initialState?: Partial<T>): T;
    scheduleUpdate(component: ComponentInstance): void;
    registerRef<T>(ref: RefObject<T>): void;
    runEffects(component: ComponentInstance): void;
    updateEffects(component: ComponentInstance): void;
    cleanup(component: ComponentInstance): void;
}
