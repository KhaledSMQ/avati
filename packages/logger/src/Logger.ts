/**
 * @packageDocumentation
 * A lightweight console logging library with debugging support for browser environments.
 * Provides different log levels, debugging groups, and performance tracking.
 */

import { ILogger, LoggerConfig, LogLevel, LogLevelString } from './types';

/**
 * Default configuration
 * @internal
 */
const DEFAULT_CONFIG: LoggerConfig = {
    level: 'INFO',
    enableTimestamp: true,
    debugMode: false,
    enablePerformance: false,
};

/**
 * Main logger class for browser console output
 */
export class ConsoleLogger implements ILogger {
    private static instance: ConsoleLogger;
    private readonly config: LoggerConfig;
    private readonly debugTimers: Map<string, number>;
    private readonly debugGroups: Set<string>;

    /**
     * Creates a new ConsoleLogger instance
     * @param config - Logger configuration
     */
    private constructor(config: Partial<LoggerConfig> = {}) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
        };
        this.debugTimers = new Map();
        this.debugGroups = new Set();
    }

    /**
     * Gets the singleton instance of the logger
     * @param config - Optional configuration to update
     */
    public static getInstance(config?: Partial<LoggerConfig>): ConsoleLogger {
        if (!ConsoleLogger.instance) {
            ConsoleLogger.instance = new ConsoleLogger(config);
        } else if (config) {
            ConsoleLogger.instance.updateConfig(config);
        }
        return ConsoleLogger.instance;
    }

    /**
     * Updates logger configuration
     * @param config - New configuration options
     */
    public updateConfig(config: Partial<LoggerConfig>): void {
        Object.assign(this.config, config);
    }

    /**
     * Logs an error message
     * @param message - Error message
     * @param args - Additional arguments
     */
    public error(message: string, ...args: unknown[]): void {
        this.log('ERROR', message, ...args);
    }

    /**
     * Logs a warning message
     * @param message - Warning message
     * @param args - Additional arguments
     */
    public warn(message: string, ...args: unknown[]): void {
        this.log('WARN', message, ...args);
    }

    /**
     * Logs an info message
     * @param message - Info message
     * @param args - Additional arguments
     */
    public info(message: string, ...args: unknown[]): void {
        this.log('INFO', message, ...args);
    }

    /**
     * Logs a debug message
     * @param message - Debug message
     * @param args - Additional arguments
     */
    public debug(message: string, ...args: unknown[]): void {
        if (this.config.debugMode) {
            this.log('DEBUG', message, ...args);
        }
    }

    /**
     * Starts a debug group
     * @param label - Group label
     */
    public group(label: string): void {
        if (this.config.debugMode) {
            this.debugGroups.add(label);
            console.group(this.getPrefix() + label);
        }
    }

    /**
     * Ends the current debug group
     * @param label - Group label
     */
    public groupEnd(label: string): void {
        if (this.config.debugMode && this.debugGroups.has(label)) {
            this.debugGroups.delete(label);
            console.groupEnd();
        }
    }

    /**
     * Starts a performance timer
     * @param label - Timer label
     */
    public time(label: string): void {
        if (this.config.debugMode && this.config.enablePerformance) {
            this.debugTimers.set(label, performance.now());
        }
    }

    /**
     * Ends a performance timer and logs the duration
     * @param label - Timer label
     */
    public timeEnd(label: string): void {
        if (this.config.debugMode && this.config.enablePerformance) {
            const startTime = this.debugTimers.get(label);
            if (startTime) {
                const duration = performance.now() - startTime;
                this.debug(`${label}: ${duration.toFixed(2)}ms`);
                this.debugTimers.delete(label);
            }
        }
    }

    /**
     * Creates a child logger with a specific prefix
     * @param prefix - Prefix for the child logger
     */
    public createChildLogger(prefix: string): ConsoleLogger {
        return ConsoleLogger.getInstance({
            ...this.config,
            prefix: this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix,
        });
    }

    /**
     * Clears the console
     */
    public clear(): void {
        console.clear();
    }

    /**
     * Checks if a log level should be processed
     * @param level - Level to check
     */
    private shouldLog(level: LogLevelString): boolean {
        return LogLevel[level] <= LogLevel[this.config.level];
    }

    /**
     * Formats the prefix for log messages
     */
    private getPrefix(): string {
        const parts: string[] = [];

        if (this.config.enableTimestamp) {
            parts.push(`[${new Date().toISOString()}]`);
        }

        if (this.config.prefix) {
            parts.push(`[${this.config.prefix}]`);
        }

        return parts.length ? parts.join(' ') + ' ' : '';
    }

    /**
     * Core logging method
     * @param level - Log level
     * @param message - Main message
     * @param args - Additional arguments to log
     */
    private log(level: LogLevelString, message: string, ...args: unknown[]): void {
        if (!this.shouldLog(level)) return;

        const prefix = this.getPrefix();
        const logMessage = `${prefix}${message}`;

        switch (level) {
            case 'ERROR':
                console.error(logMessage, ...args);
                break;
            case 'WARN':
                console.warn(logMessage, ...args);
                break;
            case 'INFO':
                console.info(logMessage, ...args);
                break;
            case 'DEBUG':
                console.debug(logMessage, ...args);
                break;
        }
    }
}
