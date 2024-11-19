/**
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { EffectState, HooksContext, HookState } from '../hooksContext';
import { DependencyList, EffectCallback } from './types';
import { Environment } from '../environment';

import { HooksContext, HookState } from '../hooksContext';

export function useState<T>(
    initialState: T | (() => T),
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
