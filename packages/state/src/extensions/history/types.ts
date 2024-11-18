/**
 * Represents the structure of history state
 */
export interface HistoryState<T> {
    readonly past: ReadonlyArray<T>;
    readonly present: Readonly<T>;
    readonly future: ReadonlyArray<T>;
}

/**
 * Configuration options for history management
 */
export interface HistoryOptions {
    readonly maxHistoryLength?: number;
    readonly trackAll?: boolean;
    readonly ignoreActions?: ReadonlyArray<string>;
}

/**
 * Available history actions
 */
export enum HistoryActionType {
    UNDO = '@history/UNDO',
    REDO = '@history/REDO',
    CLEAR = '@history/CLEAR',
    REVERT = '@history/REVERT',
}

/**
 * History action interfaces
 */
export interface UndoAction {
    readonly type: HistoryActionType.UNDO;
}

export interface RedoAction {
    readonly type: HistoryActionType.REDO;
}

export interface ClearHistoryAction {
    readonly type: HistoryActionType.CLEAR;
}

export interface RevertAction {
    readonly type: HistoryActionType.REVERT;
    readonly payload: number;
}

export type HistoryAction = UndoAction | RedoAction | ClearHistoryAction | RevertAction;

/**
 * Interface for history manager
 */
export interface IHistoryManager<T> {
    undo(): boolean;

    redo(): boolean;

    revertTo(index: number): boolean;

    clearHistory(): void;

    canUndo(): boolean;

    canRedo(): boolean;

    getHistory(): HistoryState<T>;

    getHistoryLength(): { past: number; future: number };
}
