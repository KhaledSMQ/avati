import { HooksContext, HookState } from '../HooksContext';

export function useState<T>(
    initialState: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
    const context = HooksContext.getInstance();
    const hookState = context.getHookState<HookState>({
        value: typeof initialState === 'function' ? (initialState as () => T)() : initialState,
        type: 'state',
    });

    // @ts-ignore
    const component = context.currentComponent!;

    const setState = (newValue: T | ((prev: T) => T)) => {
        const value =
            typeof newValue === 'function'
                ? (newValue as (prev: T) => T)(hookState.value)
                : newValue;

        if (!Object.is(value, hookState.value)) {
            hookState.value = value;
            if (component._mounted) {
                context.scheduleUpdate(component);
            }
        }
    };

    return [hookState.value, setState];
}
