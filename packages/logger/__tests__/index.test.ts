/**
 * @jest-environment jsdom
 */
import { ConsoleLogger, LoggerConfig } from '../src';

describe('ConsoleLogger', () => {
    let logger: ConsoleLogger;
    let consoleSpy: any;
    let performanceSpy: any;
    let fakeTime = 0;

    afterAll(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        performanceSpy = jest.spyOn(global.performance, 'now').mockImplementation(() => fakeTime);

        // Clear singleton instance between tests
        (ConsoleLogger as any).instance = null;

        // Reset console spies
        consoleSpy = {
            log: jest.spyOn(console, 'log'),
            error: jest.spyOn(console, 'error'),
            warn: jest.spyOn(console, 'warn'),
            info: jest.spyOn(console, 'info'),
            debug: jest.spyOn(console, 'debug'),
            group: jest.spyOn(console, 'group'),
            groupEnd: jest.spyOn(console, 'groupEnd'),
        };

        // Prevent actual console output during tests
        Object.keys(consoleSpy).forEach((key) => {
            consoleSpy[key].mockImplementation(() => {});
        });

        fakeTime = 0;
    });

    afterEach(() => {
        performanceSpy.mockRestore();

        // Restore console spies
        Object.values(consoleSpy).forEach((spy) => {
            // @ts-ignore
            spy.mockRestore();
        });
    });

    describe('Initialization', () => {
        test('should create singleton instance', () => {
            const logger1 = ConsoleLogger.getInstance();
            const logger2 = ConsoleLogger.getInstance();
            expect(logger1).toBe(logger2);
        });

        test('should initialize with default config', () => {
            const logger = ConsoleLogger.getInstance();
            expect(logger).toBeInstanceOf(ConsoleLogger);
        });

        test('should initialize with custom config', () => {
            const config: Partial<LoggerConfig> = {
                level: 'DEBUG',
                debugMode: true,
                prefix: 'TEST',
            };
            const logger = ConsoleLogger.getInstance(config);
            expect(logger).toBeInstanceOf(ConsoleLogger);
        });
    });

    describe('Log Levels', () => {
        beforeEach(() => {
            logger = ConsoleLogger.getInstance({
                level: 'DEBUG',
                enableTimestamp: false,
                debugMode: true,
            });
        });

        test('should log error messages', () => {
            const message = 'Test error';
            logger.error(message);
            expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining(message));
        });

        test('should log warning messages', () => {
            const message = 'Test warning';
            logger.warn(message);
            expect(consoleSpy.warn).toHaveBeenCalledWith(expect.stringContaining(message));
        });

        test('should log info messages', () => {
            const message = 'Test info';
            logger.info(message);
            expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining(message));
        });

        test('should log debug messages when debug mode is enabled', () => {
            const message = 'Test debug';
            logger.debug(message);
            expect(consoleSpy.debug).toHaveBeenCalledWith(expect.stringContaining(message));
        });

        test('should not log debug messages when debug mode is disabled', () => {
            logger = ConsoleLogger.getInstance({
                level: 'INFO',
                debugMode: false,
            });
            logger.debug('Test debug');
            expect(consoleSpy.debug).not.toHaveBeenCalled();
        });

        test('should respect log level hierarchy', () => {
            logger = ConsoleLogger.getInstance({ level: 'WARN' });

            logger.error('Error message');
            logger.warn('Warning message');
            logger.info('Info message');
            logger.debug('Debug message');

            expect(consoleSpy.error).toHaveBeenCalled();
            expect(consoleSpy.warn).toHaveBeenCalled();
            expect(consoleSpy.info).not.toHaveBeenCalled();
            expect(consoleSpy.debug).not.toHaveBeenCalled();
        });
    });

    describe('Formatting', () => {
        test('should include timestamp when enabled', () => {
            logger = ConsoleLogger.getInstance({
                enableTimestamp: true,
                level: 'INFO',
            });

            logger.info('Test message');
            expect(consoleSpy.info).toHaveBeenCalledWith(
                expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            );
        });

        test('should include prefix when specified', () => {
            const prefix = 'TEST';
            logger = ConsoleLogger.getInstance({
                prefix,
                level: 'INFO',
                enableTimestamp: false,
            });

            logger.info('Test message');
            expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining(`[${prefix}]`));
        });

        test('should format additional arguments correctly', () => {
            const message = 'Test message';
            const metadata = { key: 'value' };

            logger = ConsoleLogger.getInstance({
                enableTimestamp: false,
                level: 'INFO',
            });

            logger.info(message, metadata);
            expect(consoleSpy.info).toHaveBeenCalledWith(message, metadata);
        });
    });

    describe('Debug Features', () => {
        beforeEach(() => {
            logger = ConsoleLogger.getInstance({
                level: 'DEBUG',
                debugMode: true,
                enablePerformance: true,
            });
        });

        test('should create console groups', () => {
            const groupName = 'Test Group';
            logger.group(groupName);
            expect(consoleSpy.group).toHaveBeenCalledWith(expect.stringContaining(groupName));
        });

        test('should end console groups', () => {
            const groupName = 'Test Group';
            logger.group(groupName);
            logger.groupEnd(groupName);
            expect(consoleSpy.groupEnd).toHaveBeenCalled();
        });

        test('should track performance timing', () => {
            fakeTime += 100;
            const timerLabel = 'test-timer';
            logger.time(timerLabel);

            fakeTime += 1000;
            jest.advanceTimersByTime(1000);

            logger.timeEnd(timerLabel);
            expect(consoleSpy.debug).toHaveBeenCalledWith(expect.stringContaining(timerLabel));
            expect(performanceSpy).toHaveBeenCalledTimes(2); // time + timeEnd

            performanceSpy.mockRestore();
        });
    });

    describe('Child Loggers', () => {
        test('should create child logger with prefix', () => {
            const parentLogger = ConsoleLogger.getInstance({
                prefix: 'PARENT',
                enableTimestamp: false,
            });

            const childLogger = parentLogger.createChildLogger('CHILD');
            childLogger.info('Test message');

            expect(consoleSpy.info).toHaveBeenCalledWith(expect.stringContaining('[PARENT:CHILD]'));
        });

        test('should inherit parent config', () => {
            const parentLogger = ConsoleLogger.getInstance({
                level: 'ERROR',
                debugMode: false,
            });

            const childLogger = parentLogger.createChildLogger('CHILD');
            childLogger.info('Test message');
            childLogger.debug('Test debug');

            expect(consoleSpy.info).not.toHaveBeenCalled();
            expect(consoleSpy.debug).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        test('should handle undefined messages', () => {
            logger = ConsoleLogger.getInstance();
            logger.info(undefined as any);
            expect(consoleSpy.info).toHaveBeenCalled();
        });

        test('should handle circular references', () => {
            const circular: any = {};
            circular.self = circular;

            logger = ConsoleLogger.getInstance();
            logger.info('Test', circular);
            expect(consoleSpy.info).toHaveBeenCalled();
        });

        test('should handle errors as metadata', () => {
            const error = new Error('Test error');
            logger = ConsoleLogger.getInstance();
            logger.updateConfig({
                enableTimestamp: false,
            });
            logger.error('Error occurred', error);
            expect(consoleSpy.error).toHaveBeenCalledWith('Error occurred', error);
        });
    });

    describe('Performance', () => {
        test('should not create unnecessary objects', () => {
            const createObjectSpy = jest.spyOn(Object, 'create');

            logger = ConsoleLogger.getInstance();
            logger.info('Test message');

            expect(createObjectSpy).not.toHaveBeenCalled();
            createObjectSpy.mockRestore();
        });

        test('should early return when log level is filtered', () => {
            logger = ConsoleLogger.getInstance({ level: 'ERROR' });
            logger.info('Test message');

            expect(consoleSpy.info).not.toHaveBeenCalled();
        });
    });
});

describe('Integration Tests', () => {
    let logger: ConsoleLogger;
    let fakeTime = 0;

    beforeAll(() => {
        jest.spyOn(global.performance, 'now').mockImplementation(() => fakeTime);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        (ConsoleLogger as any).instance = null;
        jest.useFakeTimers();
        fakeTime = 0;
    });

    test('should handle complex logging scenario', () => {
        fakeTime += 1000;
        const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
        const performanceSpy = jest
            .spyOn(global.performance, 'now')
            .mockImplementation(() => fakeTime);

        logger = ConsoleLogger.getInstance({
            level: 'DEBUG',
            debugMode: true,
            enablePerformance: true,
            prefix: 'TEST',
        });

        // Simulate API call logging
        logger.group('API Call');
        logger.time('api-call');

        logger.debug('Preparing request');
        fakeTime += 100;
        jest.advanceTimersByTime(100);

        logger.debug('Sending request');
        fakeTime += 500;
        jest.advanceTimersByTime(500);

        logger.debug('Processing response');
        fakeTime += 200;
        jest.advanceTimersByTime(200);

        logger.timeEnd('api-call');
        logger.groupEnd('API Call');

        expect(consoleSpy).toHaveBeenCalledTimes(4); // 3 debug logs + 1 timer
        expect(performanceSpy).toHaveBeenCalledTimes(2); // 1 timer + 1 timerEnd
        consoleSpy.mockRestore();
        performanceSpy.mockRestore();
    });
});
