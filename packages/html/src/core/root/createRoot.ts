/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import { VNode } from '../../types/core.types';
import { BatchScheduler } from '../batch';
import { Reconciler } from '../reconciler';


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
