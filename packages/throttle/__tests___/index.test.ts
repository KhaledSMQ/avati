import { throttle } from '../src';

jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setInterval'] });

describe('throttle', () => {
    let mockCallback: jest.Mock;

    beforeEach(() => {
        // Create a fresh mock for each test
        mockCallback = jest.fn();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    describe('basic throttling', () => {
        it('should execute callback immediately on first call', () => {
            const throttled = throttle(mockCallback, 100);
            const event = new Event('test');

            throttled(event);

            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith(event);
        });

        it('should not execute callback more than once within the limit', () => {
            jest.useFakeTimers();
            const throttled = throttle(mockCallback, 100, { trailing: false, leading: true });
            const event1 = new Event('test1');
            const event2 = new Event('test2');

            throttled(event1);
            jest.advanceTimersByTime(50);
            throttled(event2);
            jest.advanceTimersByTime(20);

            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith(event1);
        });

        it('should execute callback after limit has passed', () => {
            const throttled = throttle(mockCallback, 100);
            const event1 = new Event('test1');
            const event2 = new Event('test2');

            throttled(event1);
            jest.advanceTimersByTime(101); // 101ms later
            throttled(event2);
            jest.advanceTimersByTime(100);

            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenNthCalledWith(1, event1);
            expect(mockCallback).toHaveBeenNthCalledWith(2, event2);
        });

        it('should properly track execution time between calls', () => {
            const throttled = throttle(mockCallback, 100);
            const event1 = new Event('test1');
            const event2 = new Event('test2');
            const event3 = new Event('test3');

            // First call at time 0
            throttled(event1);

            // Second call at 50ms (should not execute)
            jest.advanceTimersByTime(50);
            throttled(event2);

            // Third call at 101ms (should execute)
            jest.advanceTimersByTime(51);
            throttled(event3);

            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenNthCalledWith(1, event1);
            expect(mockCallback).toHaveBeenNthCalledWith(2, event3);
        });
    });

    describe('trailing edge', () => {
        it('should execute trailing call after limit', () => {
            const throttled = throttle(mockCallback, 100);
            const event1 = new Event('test1');
            const event2 = new Event('test2');

            throttled(event1);
            jest.advanceTimersByTime(50);
            throttled(event2);

            jest.advanceTimersByTime(100);

            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenNthCalledWith(1, event1);
            expect(mockCallback).toHaveBeenNthCalledWith(2, event2);
        });

        it('should not execute trailing call when trailing is true', () => {
            const throttled = throttle(mockCallback, 100, { trailing: false });
            const event1 = new Event('test1');
            const event2 = new Event('test2');

            jest.advanceTimersByTime(1);
            throttled(event1);
            jest.advanceTimersByTime(50);
            throttled(event2);

            jest.advanceTimersByTime(100);

            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith(event1);
        });
    });

    describe('leading edge', () => {
        it('should not execute leading call when leading is false', () => {
            const throttled = throttle(mockCallback, 100, { leading: false });
            const event = new Event('test');

            expect(mockCallback).not.toHaveBeenCalled();

            throttled(event);

            jest.advanceTimersByTime(100);

            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith(event);
        });
    });

    describe('error handling', () => {
        it('should call onError when callback throws', () => {
            const error = new Error('Test error');
            const errorCallback = jest.fn((_event) => {
                throw error;
            });
            const onError = jest.fn();
            const throttled = throttle(errorCallback, 100, { onError });

            throttled(new Event('test'));

            expect(onError).toHaveBeenCalledWith(error);
        });

        it('should throw error when no onError handler provided', () => {
            const error = new Error('Test error');
            const errorCallback = jest.fn((_arg) => {
                throw error;
            });
            const throttled = throttle(errorCallback, 100);

            expect(() => throttled(new Event('test'))).toThrow(error);
        });
    });

    describe('context binding', () => {
        it('should maintain the correct this context', () => {
            const context = {
                value: 'test',
                handler: throttle(function (this: any, _event: Event) {
                    expect(this.value).toBe('test');
                }, 100),
            };

            context.handler(new Event('test'));
        });
    });

    describe('event types', () => {
        it('should handle different event types', () => {
            const mouseCallback = jest.fn((_e: MouseEvent) => {});
            const throttledMouse = throttle(mouseCallback, 100);
            const mouseEvent = new MouseEvent('click');

            throttledMouse(mouseEvent);

            expect(mouseCallback).toHaveBeenCalledWith(mouseEvent);
        });
    });

    describe('multiple rapid calls', () => {
        it('should properly throttle multiple rapid calls', () => {
            const throttled = throttle(mockCallback, 100, { trailing: true, leading: true });
            const events = Array.from({ length: 5 }, (_, i) => new Event(`test${i}`));

            // Simulate rapid calls every 20ms
            events.forEach((event, index) => {
                jest.advanceTimersByTime(index + 20);
                throttled(event);
            });

            // Fast-forward past all timeouts
            jest.advanceTimersByTime(100);

            // Should have called twice - once immediately and once after throttle period
            expect(mockCallback).toHaveBeenCalledTimes(2);
            expect(mockCallback).toHaveBeenNthCalledWith(1, events[0]); // First call
            expect(mockCallback).toHaveBeenNthCalledWith(2, events[4]); // Last event in queue
        });
    });
});
