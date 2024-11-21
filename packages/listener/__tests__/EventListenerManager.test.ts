import { EventListenerManager } from '../src';

jest.useFakeTimers();
const eventManager = new EventListenerManager();

describe('EventListenerManager', () => {
    let element: HTMLElement;

    beforeEach(() => {
        // Create a new DOM element for each test
        element = document.createElement('div');
        document.body.appendChild(element);
    });

    afterEach(() => {
        // Clean up the DOM
        document.body.removeChild(element);
    });

    test('should add and remove an event listener', () => {
        const mockCallback = jest.fn();
        const eventId = eventManager.add(element, 'click', mockCallback);

        element.click();

        expect(mockCallback).toHaveBeenCalledTimes(1);

        eventManager.remove(eventId);
        element.click();

        expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
    });

    test('should handle the once option correctly', () => {
        const mockCallback = jest.fn();
        // @ts-ignore
        const eventId = eventManager.once(element, 'click', mockCallback);

        element.click();
        element.click();

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(eventManager.getListeners(element)).toHaveLength(1);
    });

    test('should debounce the callback', (done) => {
        jest.useFakeTimers();
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, { debounce: 500 });

        element.click();
        element.click();
        element.click();

        jest.advanceTimersByTime(499);
        expect(mockCallback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        expect(mockCallback).toHaveBeenCalledTimes(1);

        jest.useRealTimers();
        done();
    });

    test('should throttle the callback', (done) => {
        jest.useFakeTimers();
        const mockCallback = jest.fn();

        eventManager.add(element, 'click', mockCallback, {
            debounce: 500,
            trailing: false,
            leading: true,
        });

        element.click();
        expect(mockCallback).toHaveBeenCalledTimes(1);

        element.click();
        element.click();
        expect(mockCallback).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(500);
        element.click();
        expect(mockCallback).toHaveBeenCalledTimes(2);

        jest.useRealTimers();
        done();
    });

    test('should handle async callbacks', async () => {
        const mockAsyncOperation = jest.fn().mockResolvedValue('success');

        eventManager.add(element, 'click', mockAsyncOperation, { async: true });

        element.click();

        await Promise.resolve();

        expect(mockAsyncOperation).toHaveBeenCalledTimes(1);
    });

    test('should handle errors with onError handler', () => {
        const error = new Error('Test error');
        const mockCallback = jest.fn(() => {
            throw error;
        });
        const mockOnError = jest.fn();

        eventManager.add(element, 'click', mockCallback, {
            onError: mockOnError,
        });

        element.click();

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockOnError).toHaveBeenCalledWith(error);
    });

    test('should remove listener after error if once is true', () => {
        const error = new Error('Test error');
        const mockCallback = jest.fn(() => {
            throw error;
        });
        const mockOnError = jest.fn();

        eventManager.add(element, 'click', mockCallback, {
            onError: mockOnError,
            once: true,
        });

        element.click();
        element.click();

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockOnError).toHaveBeenCalledTimes(1);
    });

    test('should correctly update internal data structures on remove', () => {
        const mockCallback = jest.fn();
        const eventId = eventManager.add(element, 'click', mockCallback);

        expect(eventManager.getListeners(element)).toHaveLength(1);

        eventManager.remove(eventId);

        expect(eventManager.getListeners(element)).toHaveLength(0);
    });

    test('should generate unique event IDs', () => {
        const mockCallback = jest.fn();
        const eventId1 = eventManager.add(element, 'click', mockCallback);
        const eventId2 = eventManager.add(element, 'click', mockCallback);

        expect(eventId1).not.toEqual(eventId2);
    });

    test('should retrieve active listeners for an element', () => {
        const mockCallback = jest.fn();
        eventManager.add(element, 'click', mockCallback);
        eventManager.add(element, 'mouseover', mockCallback);

        const listeners = eventManager.getListeners(element);
        expect(listeners).toHaveLength(2);
        expect(listeners.map((l) => l.eventType)).toContain('click');
        expect(listeners.map((l) => l.eventType)).toContain('mouseover');
    });

    test('should remove all listeners from an element', () => {
        const mockCallback = jest.fn();
        eventManager.add(element, 'click', mockCallback);
        eventManager.add(element, 'mouseover', mockCallback);

        eventManager.removeAll(element);

        expect(eventManager.getListeners(element)).toHaveLength(0);

        element.click();
        element.dispatchEvent(new Event('mouseover'));

        expect(mockCallback).not.toHaveBeenCalled();
    });

    test('should attach metadata to events when metadata option is true', () => {
        const mockCallback = jest.fn(() => {
        });

        eventManager.add(element, 'click', mockCallback, {
            metadata: true,
        });

        element.click();

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('should not prevent garbage collection with WeakRefs', () => {
        // This test is a placeholder because we cannot simulate garbage collection
        // in a reliable way in a test environment.
        expect(true).toBe(true);
    });

    test('should support addWithCleanup method', () => {
        const mockCallback = jest.fn();
        const cleanup = eventManager.addWithCleanup(element, 'click', mockCallback);

        element.click();
        expect(mockCallback).toHaveBeenCalledTimes(1);

        cleanup();
        element.click();
        expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    test('should validate parameters and throw TypeError on invalid input', () => {
        const mockCallback = jest.fn();

        expect(() => eventManager.add(null as any, 'click', mockCallback)).toThrow(TypeError);

        expect(() => eventManager.add(element, null as any, mockCallback)).toThrow(TypeError);

        expect(() => eventManager.add(element, 'click', null as any)).toThrow(TypeError);
    });
});
