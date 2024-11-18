import { Computation as ComputationAbstract, EffectImpl, resetSignalSystem, Signal, SignalContext } from '../src';


class Computation extends ComputationAbstract {
    recompute(): void {
        if (this.disposed) return;
    }
}

describe('SignalContext', () => {
    let context: SignalContext;

    beforeEach(() => {
        // Reset the singleton instance before each test
        resetSignalSystem();
        context = SignalContext.getInstance();
    });

    describe('Singleton Pattern', () => {
        test('should create only one instance', () => {
            const instance1 = SignalContext.getInstance();
            const instance2 = SignalContext.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('Computation Stack Management', () => {
        test('should manage computation stack correctly', () => {
            const computation1 = new Computation();
            const computation2 = new Computation();

            expect(context.getCurrentComputation()).toBeUndefined();

            context.pushComputation(computation1);
            expect(context.getCurrentComputation()).toBe(computation1);

            context.pushComputation(computation2);
            expect(context.getCurrentComputation()).toBe(computation2);

            context.popComputation();
            expect(context.getCurrentComputation()).toBe(computation1);

            context.popComputation();
            expect(context.getCurrentComputation()).toBeUndefined();
        });

        test('should set current computation', () => {
            const computation1 = new Computation();
            const computation2 = new Computation();

            context.pushComputation(computation1);
            context.setCurrentComputation(computation2);

            expect(context.getCurrentComputation()).toBe(computation2);
        });
    });

    describe('Batch Processing', () => {
        test('should handle batch operations', () => {
            expect(context.isBatching()).toBeFalsy();

            context.beginBatch();
            expect(context.isBatching()).toBeTruthy();

            context.endBatch();
            expect(context.isBatching()).toBeFalsy();
        });

        test('should handle nested batch operations', () => {
            context.beginBatch();
            context.beginBatch();
            expect(context.isBatching()).toBeTruthy();

            context.endBatch();
            expect(context.isBatching()).toBeTruthy();

            context.endBatch();
            expect(context.isBatching()).toBeFalsy();
        });

        test('should queue and flush batch updates', () => {
            const signal = new Signal(0);
            const flushDependentsSpy = jest.spyOn(context, 'flushBatchQueue');

            context.beginBatch();
            context.addToBatchQueue(signal);
            expect(flushDependentsSpy).not.toHaveBeenCalled();
            context.endBatch();
            expect(flushDependentsSpy).toHaveBeenCalledTimes(1);
        });

        test('should handle multiple signals in batch', () => {
            const signal1 = new Signal(0);
            const signal2 = new Signal(0);
            const flushDependentsSpy = jest.spyOn(context, 'flushBatchQueue');


            context.beginBatch();
            context.addToBatchQueue(signal1);
            context.addToBatchQueue(signal2);
            context.endBatch();

            expect(flushDependentsSpy).toHaveBeenCalledTimes(1);
        });

        test('should not notify twice for same signal in batch', () => {
            const signal = new Signal(0);
            const flushDependentsSpy = jest.spyOn(context, 'flushBatchQueue');

            context.beginBatch();
            context.addToBatchQueue(signal);
            context.addToBatchQueue(signal); // Add same signal twice
            context.endBatch();

            expect(flushDependentsSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Effect Management', () => {
        test('should track active effects', () => {
            const mockEffect = {} as EffectImpl;

            expect(context.isInEffect()).toBeFalsy();

            context.registerEffect(mockEffect);
            expect(context.isInEffect()).toBeTruthy();

            context.unregisterEffect(mockEffect);
            expect(context.isInEffect()).toBeFalsy();
        });

        test('should handle multiple active effects', () => {
            const effect1 = {} as EffectImpl;
            const effect2 = {} as EffectImpl;

            context.registerEffect(effect1);
            context.registerEffect(effect2);
            expect(context.isInEffect()).toBeTruthy();

            context.unregisterEffect(effect1);
            expect(context.isInEffect()).toBeTruthy();

            context.unregisterEffect(effect2);
            expect(context.isInEffect()).toBeFalsy();
        });
    });

    describe('Integration Tests', () => {
        test('should handle complex batch and computation scenarios', () => {
            const computation = new Computation();
            const signal = new Signal(0);
            const notifyDependentsSpy = jest.spyOn(signal, 'notifyDependents');
            const flushDependentsSpy = jest.spyOn(context, 'flushBatchQueue');

            context.pushComputation(computation);
            context.beginBatch();

            context.addToBatchQueue(signal);
            expect(notifyDependentsSpy).not.toHaveBeenCalled();

            context.endBatch();
            expect(flushDependentsSpy).toHaveBeenCalledTimes(1);

            context.popComputation();
            expect(context.getCurrentComputation()).toBeUndefined();
        });

        test('should handle effects within batched updates', () => {
            const effect = {} as EffectImpl;
            const signal = new Signal(0);
            const notifyDependentsSpy = jest.spyOn(signal, 'notifyDependents');
            const flushDependentsSpy = jest.spyOn(context, 'flushBatchQueue');

            context.beginBatch();
            context.registerEffect(effect);
            context.addToBatchQueue(signal);

            expect(context.isInEffect()).toBeTruthy();
            expect(notifyDependentsSpy).not.toHaveBeenCalled();
            expect(flushDependentsSpy).not.toHaveBeenCalled();

            context.unregisterEffect(effect);
            context.endBatch();

            expect(context.isInEffect()).toBeFalsy();
            expect(flushDependentsSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        test('should handle errors during batch processing', () => {
            const signal = new Signal(0);
            jest.spyOn(context, 'flushBatchQueue').mockImplementation(() => {
                throw new Error('Notification error');
            });

            context.beginBatch();
            context.addToBatchQueue(signal);

            expect(() => {
                context.endBatch();
            }).toThrow('Notification error');

            // Verify batch state is reset
            expect(context.isBatching()).toBeFalsy();
        });

        test('should maintain stack consistency on errors', () => {
            const computation = new Computation();

            context.pushComputation(computation);
            // Stack should still have the original computation
            expect(context.getCurrentComputation()).toBe(computation);
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty batch operations', () => {
            context.beginBatch();
            context.endBatch();
            expect(context.isBatching()).toBeFalsy();
        });

        test('should handle computation stack underflow', () => {
            expect(() => {
                context.popComputation();
            }).not.toThrow();

            expect(context.getCurrentComputation()).toBeUndefined();
        });

        test('should handle multiple effect registrations', () => {
            const effect = {} as EffectImpl;

            context.registerEffect(effect);
            context.registerEffect(effect); // Register same effect twice
            expect(context.isInEffect()).toBeTruthy();

            context.unregisterEffect(effect);
            expect(context.isInEffect()).toBeFalsy();
        });
    });
});
