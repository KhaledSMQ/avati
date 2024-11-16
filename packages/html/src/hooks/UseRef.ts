import { MutableRefObject } from '../ref';
import { HooksContext, HookState } from '../HooksContext';

export function useRef<T>(initialValue: T | null = null): MutableRefObject<T | null> {
    const context = HooksContext.getInstance();
    const hookState = context.getHookState<HookState>({
        value: { current: initialValue },
        type: 'ref',
    });

    // Register ref for cleanup
    context.registerRef(hookState.value);

    return hookState.value;
}
