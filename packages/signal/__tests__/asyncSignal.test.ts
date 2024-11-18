import { asyncSignal } from '../src';

describe('asyncSignal', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('handles successful fetch', async () => {
        const mockFetch = jest.fn().mockResolvedValue({ id: 1 });
        const signal = asyncSignal(mockFetch);

        const fetchPromise = signal.fetch();
        expect(signal.value.loading).toBe(true);

        await fetchPromise;
        expect(signal.value).toEqual({
            data: { id: 1 },
            loading: false,
            error: null,
            timestamp: expect.any(Number)
        });
    });


    it('handles fetch error with retry', async () => {
        const mockFetch = jest.fn()
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce({ id: 1 });

        const signal = asyncSignal(mockFetch, {
            retryConfig: {
                attempts: 2,
                delay: 1000,
                backoffFactor: 2
            }
        });

        const fetchPromise = signal.fetch();
        expect(signal.value.loading).toBe(true);

        // Wait for the first attempt to fail
        await Promise.resolve();
        jest.advanceTimersByTime(1000);

        // Wait for retry delay and second attempt
        await Promise.resolve();
        jest.advanceTimersByTime(1000);

        // Resolve all remaining promises
        await Promise.resolve();

        // Complete the test
        await fetchPromise;

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(signal.value.data).toEqual({ id: 1 });
    }, 10000); // Increased timeout

    it('uses cache when valid', async () => {
        const mockFetch = jest.fn().mockResolvedValue({ id: 1 });
        const signal = asyncSignal(mockFetch, {
            cache: {
                enabled: true,
                ttl: 5000
            }
        });

        await signal.fetch();
        expect(mockFetch).toHaveBeenCalledTimes(1);

        await signal.fetch();
        expect(mockFetch).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(6000);
        await signal.fetch();
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('calls lifecycle hooks', async () => {
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const error = new Error('Failed');

        const mockFetch = jest.fn().mockRejectedValue(error);
        const signal = asyncSignal(mockFetch, {
            onSuccess,
            onError,
            retryConfig: {
                attempts: 1,
                delay: 0,
                backoffFactor: 0,
            }
        });

        await signal.fetch();
        expect(onError).toHaveBeenCalledWith(error);
        expect(onSuccess).not.toHaveBeenCalled();
    });

    it('aborts previous fetch on new request', async () => {
        const abortError = new DOMException('Aborted', 'AbortError');
        const mockFetch = jest.fn()
            .mockImplementationOnce(() => new Promise(() => {}))
            .mockRejectedValueOnce(abortError)
            .mockResolvedValueOnce({ id: 2 });

        const signal = asyncSignal(mockFetch);

        signal.fetch();
        signal.fetch();

        expect(signal.value.loading).toBe(true);
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });
});
