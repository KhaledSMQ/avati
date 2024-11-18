/**
 * @packageDocumentation
 * A lightweight console logging library with debugging support for browser environments.
 * Provides different log levels, debugging groups, and performance tracking.
 */
import { ILogger, LoggerConfig } from './types';
/**
 * Main logger class for browser console output
 */
export declare class ConsoleLogger implements ILogger {
    private static instance;
    private readonly config;
    private readonly debugTimers;
    private readonly debugGroups;
    /**
     * Creates a new ConsoleLogger instance
     * @param config - Logger configuration
     */
    private constructor();
    /**
     * Gets the singleton instance of the logger
     * @param config - Optional configuration to update
     */
    static getInstance(config?: Partial<LoggerConfig>): ConsoleLogger;
    /**
     * Updates logger configuration
     * @param config - New configuration options
     */
    updateConfig(config: Partial<LoggerConfig>): void;
    /**
     * Checks if a log level should be processed
     * @param level - Level to check
     */
    private shouldLog;
    /**
     * Formats the prefix for log messages
     */
    private getPrefix;
    /**
     * Core logging method
     * @param level - Log level
     * @param message - Main message
     * @param args - Additional arguments to log
     */
    private log;
    /**
     * Logs an error message
     * @param message - Error message
     * @param args - Additional arguments
     */
    error(message: string, ...args: unknown[]): void;
    /**
     * Logs a warning message
     * @param message - Warning message
     * @param args - Additional arguments
     */
    warn(message: string, ...args: unknown[]): void;
    /**
     * Logs an info message
     * @param message - Info message
     * @param args - Additional arguments
     */
    info(message: string, ...args: unknown[]): void;
    /**
     * Logs a debug message
     * @param message - Debug message
     * @param args - Additional arguments
     */
    debug(message: string, ...args: unknown[]): void;
    /**
     * Starts a debug group
     * @param label - Group label
     */
    group(label: string): void;
    /**
     * Ends the current debug group
     * @param label - Group label
     */
    groupEnd(label: string): void;
    /**
     * Starts a performance timer
     * @param label - Timer label
     */
    time(label: string): void;
    /**
     * Ends a performance timer and logs the duration
     * @param label - Timer label
     */
    timeEnd(label: string): void;
    /**
     * Creates a child logger with a specific prefix
     * @param prefix - Prefix for the child logger
     */
    createChildLogger(prefix: string): ConsoleLogger;
    /**
     * Clears the console
     */
    clear(): void;
}
//# sourceMappingURL=Logger.d.ts.map