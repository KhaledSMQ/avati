import { createQueueSignal } from '../src';

describe('QueueSignal', () => {
    it('handles basic queue operations', () => {
        const queue = createQueueSignal<string>();

        expect(queue.isEmpty()).toBe(true);

        queue.enqueue('first');
        queue.enqueue('second');

        expect(queue.size()).toBe(2);
        expect(queue.peek()).toBe('first');

        const item = queue.dequeue();
        expect(item).toBe('first');
        expect(queue.size()).toBe(1);
    });

    it('handles priority queue operations', () => {
        const queue = createQueueSignal<string>();

        queue.enqueue('low', 1);
        queue.enqueue('high', 2);
        queue.enqueue('medium', 1);

        expect(queue.dequeue()).toBe('high');
        expect(queue.dequeue()).toBe('low');
        expect(queue.dequeue()).toBe('medium');
    });

    it('maintains FIFO order for same priority', () => {
        const queue = createQueueSignal<number>();

        queue.enqueue(1, 1);
        queue.enqueue(2, 1);
        queue.enqueue(3, 1);

        expect(queue.dequeue()).toBe(1);
        expect(queue.dequeue()).toBe(2);
        expect(queue.dequeue()).toBe(3);
    });

    it('removes items by id', () => {
        const queue = createQueueSignal<string>();

        const id = queue.enqueue('test');
        expect(queue.size()).toBe(1);

        const removed = queue.remove(id);
        expect(removed).toBe(true);
        expect(queue.isEmpty()).toBe(true);
    });

    it('clears queue', () => {
        const queue = createQueueSignal<string>();

        queue.enqueue('a');
        queue.enqueue('b');
        queue.clear();

        expect(queue.isEmpty()).toBe(true);
        expect(queue.size()).toBe(0);
    });

    it('returns undefined for empty queue operations', () => {
        const queue = createQueueSignal<string>();

        expect(queue.dequeue()).toBeUndefined();
        expect(queue.peek()).toBeUndefined();
    });
});
