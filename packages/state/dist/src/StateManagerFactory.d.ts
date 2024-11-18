import { StateManagerOptions } from './types';
import { StateManager } from './StateManager';
export declare class StateManagerFactory {
    static create<T extends Record<string, any>>(initialState: T, options?: StateManagerOptions): StateManager<T>;
}
//# sourceMappingURL=StateManagerFactory.d.ts.map