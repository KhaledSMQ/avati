/**
 * Core logger interface
 */
export interface ILogger {
    error(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
}

/**
 * Available logging levels in order of severity
 */
export enum LogLevel {
    /** Critical errors that need immediate attention */
    ERROR = 0,
    /** Warning messages for potentially harmful situations */
    WARN = 1,
    /** General informational messages */
    INFO = 2,
    /** Detailed debugging information */
    DEBUG = 3,
}

/** String literal type for log levels. */
export type LogLevelString = keyof typeof LogLevel;

/**
 * Configuration options for the logger
 */
export interface LoggerConfig {
    /** Minimum level of logs to output */
    level: LogLevelString;
    /** Include timestamps in logs */
    enableTimestamp: boolean;
    /** Enable debug mode with additional information */
    debugMode: boolean;
    /** Enable performance tracking in debug mode */
    enablePerformance: boolean;
    /** Optional prefix for all log messages */
    prefix?: string;
}
