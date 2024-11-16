import { EffectState, HooksContext } from '../HooksContext';

export function useEffect(effect: () => void | (() => void), deps?: any[]): void {
    const context = HooksContext.getInstance();
    const hookState = context.getHookState<EffectState>({
        type: 'effect',
        effect,
        deps,
        depsChanged: true,
    });

    // Check if deps changed
    if (deps) {
        const oldDeps = hookState.deps;
        hookState.deps = deps;
        hookState.depsChanged =
            !oldDeps || oldDeps.length !== deps.length || deps.some((dep, i) => dep !== oldDeps[i]);
    } else {
        // No deps means run every time
        hookState.depsChanged = true;
    }

    hookState.effect = effect;
}
