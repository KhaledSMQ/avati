import { RefObject } from '../core_types';
export declare function useCallbackRef<T>(callback: (instance: T | null) => void): RefObject<T>;
