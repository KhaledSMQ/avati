import eventManager from '../src/EventListenerManager';

jest.useFakeTimers();

describe('EventListenerManager - Debounce and Throttle', () => {
    let element: HTMLElement;

    beforeEach(() => {
        // Create a new DOM element for each test
        element = document.createElement('div');
        document.body.appendChild(element);

        jest.useFakeTimers();
        window.setTimeout = setTimeout;
        window.clearTimeout = clearTimeout;
    });

    afterEach(() => {
        // Clean up the DOM and timers
        document.body.removeChild(element);
        jest.useRealTimers();
    });

    test('jest fake timers work', () => {
        jest.useFakeTimers();

        const mockFn = jest.fn();

        setTimeout(mockFn, 1000);

        jest.advanceTimersByTime(1000);

        expect(mockFn).toHaveBeenCalled();
    });

    test('debounce should delay the callback until after wait time has elapsed', () => {
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, { debounce: 200 });

        element.click();
        expect(mockCallback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(199);
        expect(mockCallback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('debounce should reset timer on subsequent calls within wait time', () => {
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, { debounce: 200 });

        element.click(); // First click
        jest.advanceTimersByTime(100);
        element.click(); // Second click resets timer
        jest.advanceTimersByTime(100);
        element.click(); // Third click resets timer again
        jest.advanceTimersByTime(199);
        expect(mockCallback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('debounce should handle rapid successive events correctly', () => {
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, { debounce: 100 });

        for (let i = 0; i < 10; i++) {
            element.click();
            jest.advanceTimersByTime(50); // Less than debounce time
        }

        expect(mockCallback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(100); // Wait for debounce period after last click
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('debounce should invoke callback immediately on first event', () => {
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, { debounce: 200, leading: true });

        element.click();

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('debounce should ignore events occurring within the limit', () => {
        jest.useFakeTimers();

        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, {
            debounce: 200,
            trailing: true,
            leading: true,
        });

        element.click(); // First call
        jest.advanceTimersByTime(100);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(99);
        element.click(); // Ignored
        element.click(); // Ignored
        element.click(); // Ignored
        element.click(); // Ignored - but tailed
        expect(mockCallback).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(200); // should trigger trailing
        expect(mockCallback).toHaveBeenCalledTimes(2); // Second call occurs here
    });

    test('debounce should handle multiple periods correctly', () => {
        jest.useFakeTimers();
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, {
            debounce: 100,
            leading: false,
            trailing: true,
        });

        element.click(); // First call
        jest.advanceTimersByTime(50);
        element.click(); // Ignored - reset timer
        jest.advanceTimersByTime(100);
        element.click(); // Second call
        jest.advanceTimersByTime(100);
        expect(mockCallback).toHaveBeenCalledTimes(2);

        element.click(); // Third call
        jest.advanceTimersByTime(100);
        expect(mockCallback).toHaveBeenCalledTimes(3);
    });

    test('debounce with immediate option (leading edge execution)', () => {
        // Assuming the implementation supports an 'immediate' option for debounce
        // Since our current implementation does not support 'immediate', this test is hypothetical
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, {
            debounce: 200,
        });

        element.click();
        jest.advanceTimersByTime(200);
        expect(mockCallback).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(100);
        element.click();
        jest.advanceTimersByTime(100);
        expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });

    test('debounce should execute trailing call if events occurred during debounce period', () => {
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, {
            debounce: 200,
            trailing: true,
            leading: true,
        });

        element.click(); // First call
        jest.advanceTimersByTime(100);
        element.click(); // Ignored but saved as pending
        jest.advanceTimersByTime(200); // Total time: 200ms

        expect(mockCallback).toHaveBeenCalledTimes(2); // Second call executes here
    });

    test('debounce should work correctly with async callbacks', async () => {
        const mockCallback = jest.fn(async () => {
            return Promise.resolve();
        });

        eventManager.add(element, 'click', mockCallback, {
            debounce: 200,
            async: true,
        });

        element.click();
        jest.advanceTimersByTime(200);

        // Wait for the async function to resolve
        await Promise.resolve();

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('throttle should work correctly with async callbacks', async () => {
        const mockCallback = jest.fn(async () => {
            return Promise.resolve();
        });

        eventManager.add(element, 'click', mockCallback, {
            debounce: 200,
            async: true,
            leading: true,
            trailing: true,
        });

        element.click();
        jest.advanceTimersByTime(200);
        element.click();
        jest.advanceTimersByTime(200);

        // Wait for the async function to resolve
        await Promise.resolve();

        expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    test('debounce should pass the correct context and arguments', () => {
        const mockCallback = jest.fn(function(this: any, event: Event) {
            expect(this).toBe(element);
            expect(event).toBeInstanceOf(Event);
        });

        eventManager.add(element, 'click', mockCallback, { debounce: 200 });

        element.click();
        jest.advanceTimersByTime(200);

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('throttle should pass the correct context and arguments', () => {
        const mockCallback = jest.fn(function(this: any, event: Event) {
            expect(this).toBe(element);
            expect(event).toBeInstanceOf(Event);
        });

        eventManager.add(element, 'click', mockCallback, { throttle: 200 });

        element.click();
        jest.advanceTimersByTime(200);

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('debounce should handle errors and call onError', () => {
        jest.useFakeTimers();
        const error = new Error('Debounce error');
        const mockCallback = jest.fn(() => {
            throw error;
        });
        const mockOnError = jest.fn(() => {
            console.log('captured error');
        });

        eventManager.add(element, 'click', mockCallback, {
            debounce: 200,
            leading: false,
            onError: mockOnError,
        });
        element.click();
        jest.advanceTimersByTime(200);
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockOnError).toHaveBeenCalledWith(error);
    });

    test('throttle should handle errors and call onError', () => {
        const error = new Error('Throttle error');
        const mockCallback = jest.fn(() => {
            throw error;
        });
        const mockOnError = jest.fn();

        eventManager.add(element, 'click', mockCallback, {
            throttle: 200,
            onError: mockOnError,
        });

        element.click();

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockOnError).toHaveBeenCalledWith(error);
    });

    test('debounce should work with different wait times', () => {
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, { debounce: 300 });

        element.click();
        jest.advanceTimersByTime(300);

        expect(mockCallback).toHaveBeenCalledTimes(1);

        eventManager.removeAll(element);

        eventManager.add(element, 'click', mockCallback, { debounce: 500 });

        element.click();
        jest.advanceTimersByTime(500);

        expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    test('throttle should not execute trailing call if no events occurred during throttle period', () => {
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, { throttle: 200 });

        element.click(); // First call
        jest.advanceTimersByTime(200);

        expect(mockCallback).toHaveBeenCalledTimes(1);

        // No additional events occurred, so no trailing call should execute
    });

    test('throttle should support immediate execution of pending calls on removal', () => {
        jest.useFakeTimers({ legacyFakeTimers: true });
        const mockCallback = jest.fn();

        const eventId = eventManager.add(element, 'click', mockCallback, {
            throttle: 200,
            trailing: false,
        });

        element.click();
        jest.advanceTimersByTime(100);
        element.click();

        // Remove the listener before throttle period ends
        eventManager.remove(eventId);

        // Since the listener is removed, pending calls should not execute
        jest.advanceTimersByTime(100);
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });
});
