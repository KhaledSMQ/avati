import { VNode } from '../core_types';
import { ComponentInstance, HooksContext } from '../hooksContext';

export function withHooks<P extends object = {}>(Component: (props: P) => VNode) {
    return function render(this: ComponentInstance, props: P): JSX.Element {
        if (!this) {
            return Component.call(undefined, props) as JSX.Element;
        }
        const context = HooksContext.getInstance();

        if (!this._hooks) {
            this._hooks = [];
            this._currentHookIndex = 0;
            this._mounted = false;
            this._refs = new Set();
            this.componentWillUnmount = () => {
                HooksContext.getInstance().cleanup(this);
                this._mounted = false;
            };
        }

        context.beginRender(this);
        try {
            return Component.call(undefined, props) as JSX.Element;
        } finally {
            context.endRender();
        }
    };
}
