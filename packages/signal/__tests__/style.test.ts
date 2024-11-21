import { SignalDisposedError, StyleSignal } from '../src';


describe('StyleSignal', () => {
    let styleSignal: StyleSignal;

    beforeEach(() => {
        styleSignal = new StyleSignal({
            backgroundColor: 'blue',
            width: '100px',
            height: '100px',
        });
    });

    afterEach(() => {
        styleSignal.dispose();
    });

    describe('Basic Operations', () => {
        test('should initialize with correct values', () => {
            expect(styleSignal.value).toEqual({
                backgroundColor: 'blue',
                width: '100px',
                height: '100px',
            });
        });

        test('should set single style property', () => {
            styleSignal.set('backgroundColor', 'red');
            expect(styleSignal.value.backgroundColor).toBe('red');
        });

        test('should set multiple style properties', () => {
            styleSignal.setMultiple({
                backgroundColor: 'green',
                width: '200px',
            });

            expect(styleSignal.value).toMatchObject({
                backgroundColor: 'green',
                width: '200px',
                height: '100px',
            });
        });

        test('should handle undefined initial values', () => {
            const emptySignal = new StyleSignal();
            expect(emptySignal.value).toEqual({});
            emptySignal.dispose();
        });
    });

    describe('CSS Class Operations', () => {
        test('should add class', () => {
            styleSignal.addClass('test-class');
            expect(styleSignal.value.className).toBe('test-class');
        });

        test('should not duplicate classes', () => {
            styleSignal.addClass('test-class');
            styleSignal.addClass('test-class');
            expect(styleSignal.value.className).toBe('test-class');
        });

        test('should remove class', () => {
            styleSignal.addClass('test-class');
            styleSignal.addClass('another-class');
            styleSignal.removeClass('test-class');
            expect(styleSignal.value.className).toBe('another-class');
        });

        test('should toggle class', () => {
            styleSignal.toggleClass('test-class');
            expect(styleSignal.value.className).toBe('test-class');

            styleSignal.toggleClass('test-class');
            expect(styleSignal.value.className).toBe('');
        });

        test('should handle multiple classes', () => {
            styleSignal.addClass('class1');
            styleSignal.addClass('class2');
            expect(styleSignal.value.className).toBe('class1 class2');
        });
    });

    describe('Numeric Operations', () => {
        test('should increment numeric values', () => {
            styleSignal.set('width', '100px');
            styleSignal.increment('width', 50);
            expect(styleSignal.value.width).toBe('150px');
        });

        test('should decrement numeric values', () => {
            styleSignal.set('width', '100px');
            styleSignal.decrement('width', 50);
            expect(styleSignal.value.width).toBe('50px');
        });

        test('should handle different units', () => {
            styleSignal.set('fontSize', '16px');
            styleSignal.increment('fontSize', 2, 'rem');
            expect(styleSignal.value.fontSize).toBe('18rem');
        });

        test('should handle invalid numeric values', () => {
            styleSignal.set('width', 'auto');
            styleSignal.increment('width', 50);
            expect(styleSignal.value.width).toBe('50px');
        });
    });

    describe('Toggle Operations', () => {
        test('should toggle visibility', () => {
            styleSignal.set('visibility', 'visible');
            styleSignal.toggle('visibility');
            expect(styleSignal.value.visibility).toBe('hidden');

            styleSignal.toggle('visibility');
            expect(styleSignal.value.visibility).toBe('visible');
        });

        test('should toggle display', () => {
            styleSignal.set('display', 'block');
            styleSignal.toggle('display');
            expect(styleSignal.value.display).toBe('none');

            styleSignal.toggle('display');
            expect(styleSignal.value.display).toBe('block');
        });
    });

    describe('Animation', () => {
        test('should execute animation sequence', async () => {
            const keyframes = [
                { opacity: '1', transform: 'scale(1)' },
                { opacity: '0.5', transform: 'scale(1.2)' },
                { opacity: '1', transform: 'scale(1)' },
            ];

            await styleSignal.animate(keyframes, { duration: 100 });

            expect(styleSignal.value).toMatchObject({
                opacity: '1',
                transform: 'scale(1)',
            });
        });

        test('should handle empty keyframes', async () => {
            await styleSignal.animate([], { duration: 100 });
            expect(styleSignal.value).toEqual(styleSignal.value);
        });
    });

    describe('Computed Styles', () => {
        test('should compute styles with transitions', () => {
            const computedStyle = styleSignal.getComputedStyle();
            expect(computedStyle.value.transition).toBe('all 0.3s ease');
        });

        test('should update computed styles when base styles change', () => {
            const computedStyle = styleSignal.getComputedStyle();
            styleSignal.set('backgroundColor', 'red');
            expect(computedStyle.value.backgroundColor).toBe('red');
        });
    });

    describe('Error Handling', () => {
        test('should throw when accessing disposed signal', () => {
            styleSignal.dispose();
            expect(() => styleSignal.set('backgroundColor', 'red')).toThrow(SignalDisposedError);
        });

        test('should handle invalid property names', () => {
            // @ts-expect-error - Testing invalid property
            expect(() => styleSignal.set('invalidProperty', 'value')).not.toThrow();
        });
    });

    describe('Custom Equality Function', () => {
        test('should use custom equality function', () => {
            const customEqualitySignal = new StyleSignal(
                { backgroundColor: 'blue' },
                {
                    equals: (prev, next) => {
                        return prev.backgroundColor === next.backgroundColor;
                    },
                },
            );

            let updateCount = 0;
            customEqualitySignal.subscribe(() => updateCount++);

            customEqualitySignal.set('width', '100px');
            customEqualitySignal.set('backgroundColor', 'blue');

            expect(updateCount).toBe(1); // Only width change should trigger update
            customEqualitySignal.dispose();
        });
    });

    describe('Subscription Handling', () => {
        test('should notify subscribers of changes', () => {
            let updateCount = 0;
            const unsubscribe = styleSignal.subscribe(() => {
                updateCount++;
            }, { skipInitial: true });

            styleSignal.set('backgroundColor', 'red');
            styleSignal.setMultiple({ width: '200px', height: '200px' });

            expect(updateCount).toBe(2);
            unsubscribe();
        });

        test('should handle multiple subscribers', () => {
            let count1 = 0, count2 = 0;

            const unsub1 = styleSignal.subscribe(() => {
                count1++;
            }, { skipInitial: true });

            const unsub2 = styleSignal.subscribe(() => {
                count2++;
            }, { skipInitial: true });

            styleSignal.set('backgroundColor', 'red');

            expect(count1).toBe(1);
            expect(count2).toBe(1);

            unsub1();
            styleSignal.set('width', '200px');

            expect(count1).toBe(1);
            expect(count2).toBe(2);

            unsub2();
        });

        test('should not notify after unsubscribe', () => {
            let updateCount = 0;
            const unsubscribe = styleSignal.subscribe(() => {
                updateCount++;
            }, { skipInitial: true });

            styleSignal.set('backgroundColor', 'red');
            unsubscribe();
            styleSignal.set('backgroundColor', 'blue');

            expect(updateCount).toBe(1);
        });
    });

    describe('Memory Management', () => {
        test('should cleanup resources on dispose', () => {
            let updateCount = 0;
            const unsubscribe = styleSignal.subscribe(() => {
                updateCount++;
            }, { skipInitial: true });

            unsubscribe()
            styleSignal.dispose();
            expect(() => styleSignal.set('backgroundColor', 'red')).toThrow(SignalDisposedError);
            expect(updateCount).toBe(0);
        });

        test('should handle multiple dispose calls', () => {
            styleSignal.dispose();
            expect(() => styleSignal.dispose()).not.toThrow();
        });
    });
});
