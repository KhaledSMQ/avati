export class HistoryError extends Error {
    constructor(message: string) {
        super(`[History Manager] ${message}`);
        this.name = 'HistoryError';
    }
}

export class InvalidHistoryOperationError extends HistoryError {
    constructor(message: string) {
        super(`Invalid operation: ${message}`);
        this.name = 'InvalidHistoryOperationError';
    }
}

export class HistoryStateError extends HistoryError {
    constructor(message: string) {
        super(`State error: ${message}`);
        this.name = 'HistoryStateError';
    }
}
