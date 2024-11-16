import { throttle } from '../src';

jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setInterval'] });

describe('throttle', () => {
    let callback: jest.Mock;
    let throttled: any;

    beforeEach(() => {
        callback = jest.fn();
    });
    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        if (throttled && throttled.cancel) {
            throttled.cancel();
        }
        jest.clearAllTimers();
    });

    test('should invoke callback immediately on first call when leading is true', () => {
        throttled = throttle(callback, 1000, { leading: true, trailing: false });
        throttled();
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should not invoke callback immediately when leading is false', () => {
        throttled = throttle(callback, 1000, { leading: false, trailing: true });
        throttled();
        expect(callback).not.toHaveBeenCalled();
    });

    test('should invoke callback on trailing edge when trailing is true', () => {
        jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setInterval'] });
        throttled = throttle(callback, 1000, { leading: false, trailing: true });
        throttled();
        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1001);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should not invoke callback on trailing edge when trailing is false', () => {
        jest.useFakeTimers();
        throttled = throttle(callback, 1000, { leading: true, trailing: false });
        throttled();
        throttled();
        jest.advanceTimersByTime(1000);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should throttle multiple calls within the limit', () => {
        jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setInterval'] });
        throttled = throttle(callback, 1000, { leading: true, trailing: true });
        throttled();
        throttled();
        throttled();
        expect(callback).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1001);
        expect(callback).toHaveBeenCalledTimes(2);
    });

    test('should handle cancel correctly', () => {
        throttled = throttle(callback, 1000, { leading: false, trailing: true });
        throttled();
        throttled.cancel();
        jest.advanceTimersByTime(1000);
        expect(callback).not.toHaveBeenCalled();
    });

    test('should handle flush correctly', () => {
        jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setInterval'] });
        throttled = throttle(callback, 1000, { leading: false, trailing: true });
        throttled();
        throttled.flush();
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should handle errors and call onError', () => {
        const error = new Error('Test error');
        callback.mockImplementation(() => {
            throw error;
        });
        const onError = jest.fn();

        throttled = throttle(callback, 1000, { leading: true, trailing: false, onError });
        throttled();

        expect(callback).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(error);
    });

    test('should rethrow error if onError is not provided', () => {
        callback.mockImplementation(() => {
            throw new Error('Test error');
        });

        throttled = throttle(callback, 1000, { leading: true, trailing: false });

        expect(() => throttled()).toThrow('Test error');
    });

    test('should preserve the correct `this` context', () => {
        const context = { value: 42 };
        const method = jest.fn(function (this: any) {
            return this.value;
        });

        throttled = throttle(method, 1000, { leading: true, trailing: false });
        throttled.call(context);

        expect(method).toHaveBeenCalledWith();
        expect(method.mock.instances[0]).toBe(context);
    });
});
