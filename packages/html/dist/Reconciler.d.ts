import { VNode } from './core_types';
export declare class Reconciler {
    private static instance;
    private rootInstance;
    private pendingUpdates;
    private isProcessingUpdates;
    private constructor();
    static getInstance(): Reconciler;
    mount(vnode: VNode, container: HTMLElement): void;
    unmount(): void;
    private reconcile;
    private reconcileText;
    private reconcileDOMComponent;
    private reconcileClassComponent;
    private reconcileFunctionComponent;
    private reconcileChildren;
    private updateDOMProperties;
    private unmountInstance;
    private scheduleUpdate;
    private processUpdate;
    private processPendingUpdates;
    private updateInstance;
    private findInstanceByComponent;
    private isClassComponent;
    private getKey;
    private normalizeChildren;
    private replaceNode;
    private handleRef;
    private isFunctionComponent;
}
