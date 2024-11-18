import { VNode } from './core_types';
interface Root {
    render: (vnode: VNode) => void;
    unmount: () => void;
}
export declare function createRoot(container: HTMLElement): Root;
export {};
