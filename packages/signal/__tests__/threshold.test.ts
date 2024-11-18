import { Signal, threshold } from '../src';

describe('threshold', () => {
    let source: Signal<number>;

    beforeEach(() => {
        source = new Signal(0);
    });

    it('should not update when change is below threshold', () => {
        const thresholded = threshold(source, 1.0);

        source.value = 0.5;
        expect(thresholded.value).toBe(0);

        source.value = 0.9;
        expect(thresholded.value).toBe(0);
    });

    it('should update when change equals threshold', () => {
        const thresholded = threshold(source, 1.0);
        source.value = 1.0;
        expect(thresholded.value).toBe(1.0);
    });

    it('should update when change exceeds threshold', () => {
        const thresholded = threshold(source, 1.0);
        source.value = 1.5;
        expect(thresholded.value).toBe(1.5);
    });

    it('should handle negative changes', () => {
        const thresholded = threshold(source, 1.0);
        source.value = -1.5;
        expect(thresholded.value).toBe(-1.5);
    });

    it('should maintain custom equality function', () => {
        const thresholded = threshold(source, 0.5, {
            equals: (a, b) => Math.floor(a) === Math.floor(b),
        });

        source.value = 0.7;
        expect(thresholded.value).toBe(0.7);
    });

    it('should handle floating point precision', () => {
        const thresholded = threshold(source, 0.1);
        source.value = 0.1 + 0.2;  // 0.30000000000000004
        expect(thresholded.value).toBe(0.30000000000000004);
    });

    it('should properly track subsequent changes', () => {
        const thresholded = threshold(source, 1.0);

        source.value = 1.5;
        expect(thresholded.value).toBe(1.5);

        source.value = 1.7;  // Small change from 1.5
        expect(thresholded.value).toBe(1.5);

        source.value = 2.6;  // Large change from 1.5
        expect(thresholded.value).toBe(2.6);
    });
});
