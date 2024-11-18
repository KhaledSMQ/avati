export declare function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
