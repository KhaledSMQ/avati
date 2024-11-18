import { VNode } from './core_types';
import { BatchScheduler } from './batchScheduler';
import { Reconciler } from './reconciler';

interface Root {
    render: (vnode: VNode) => void;
    unmount: () => void;
}

export function createRoot(container: HTMLElement): Root {
    let rootVNode: VNode | null = null;

    return {
        render(vnode: VNode) {
            rootVNode = vnode;
            BatchScheduler.getInstance().schedule(() => {
                Reconciler.getInstance().mount(rootVNode, container);
            });
        },
        unmount() {
            if (rootVNode) {
                BatchScheduler.getInstance().schedule(() => {
                    Reconciler.getInstance().unmount();
                });
                rootVNode = null;
            }
        },
    };
}
