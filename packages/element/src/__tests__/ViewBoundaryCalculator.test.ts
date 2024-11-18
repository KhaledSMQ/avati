import {
    BoundaryCalculationError,
    ChildView,
    Margins,
    Rectangle,
    ViewBoundaryCalculator,
    ViewBounds,
    ViewConfig,
} from '../ViewBoundaryCalculator';

describe('ViewBoundaryCalculator', () => {
    // Helper function to create a basic element with consistent dimensions
    const createBasicElement = (): Rectangle & { margins: Margins } => {
        const x = 0;
        const y = 0;
        const width = 100;
        const height = 100;
        return {
            x,
            y,
            width,
            height,
            right: x + width,
            bottom: y + height,
            margins: { top: 10, right: 10, bottom: 10, left: 10 },
        };
    };

    // Helper function to create a child view with consistent dimensions
    const createMockChildView = (
        bounds: Partial<ViewBounds> = {},
        includeInLayout: boolean = true,
    ): ChildView => {
        const defaultBounds: ViewBounds = {
            element: {
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                right: 50,
                bottom: 50,
                margins: { top: 0, right: 0, bottom: 0, left: 0 },
            },
            inner: {
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                right: 50,
                bottom: 50,
            },
            outer: {
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                right: 50,
                bottom: 50,
            },
        };

        const mergedBounds = {
            ...defaultBounds,
            ...bounds,
        };

        return {
            getBounds: () => mergedBounds,
            shouldIncludeInLayout: () => includeInLayout,
        };
    };

    describe('Basic Boundary Calculations', () => {
        test('should calculate correct bounds for basic element without children', () => {
            const element = createBasicElement();
            const result = ViewBoundaryCalculator.calculateBounds(element, []);

            // Check inner bounds
            expect(result.inner).toEqual({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                right: 100,
                bottom: 100,
            });

            // Check outer bounds with margins
            expect(result.outer).toEqual({
                x: -10,
                y: -10,
                width: 120,
                height: 120,
                right: 110,
                bottom: 110,
            });
        });

        test('should apply scale correctly', () => {
            const element = createBasicElement();
            const result = ViewBoundaryCalculator.calculateBounds(element, [], {
                scale: { x: 2, y: 1.5 },
            });

            const expectedOuterBounds = {
                x: -10,
                y: -10,
                width: 220, // (100 * 2) + 20 (margins)
                height: 170, // (100 * 1.5) + 20 (margins)
                right: 210, // (100 * 2) + 10 (right margin)
                bottom: 160, // (100 * 1.5) + 10 (bottom margin)
            };

            expect(result.outer).toEqual(expectedOuterBounds);
        });

        test('should apply offset correctly', () => {
            const element = createBasicElement();
            const result = ViewBoundaryCalculator.calculateBounds(element, [], {
                offset: { x: 50, y: 25 },
            });

            expect(result.outer).toEqual({
                x: 40, // 50 - 10 (left margin)
                y: 15, // 25 - 10 (top margin)
                width: 120,
                height: 120,
                right: 160, // 40 + 120
                bottom: 135, // 15 + 120
            });
        });
    });

    describe('Input Validation', () => {
        test('should throw error for non-finite coordinates', () => {
            const element = createBasicElement();
            element.x = Infinity;

            expect(() => {
                ViewBoundaryCalculator.calculateBounds(element, []);
            }).toThrow(BoundaryCalculationError);
        });

        test('should throw error for coordinates exceeding safe bounds', () => {
            const element = createBasicElement();
            element.x = 1e8; // Exceeds MAX_SAFE_COORDINATE

            expect(() => {
                ViewBoundaryCalculator.calculateBounds(element, []);
            }).toThrow(BoundaryCalculationError);
        });

        test('should throw error for negative dimensions', () => {
            const element = createBasicElement();
            element.width = -10;

            expect(() => {
                ViewBoundaryCalculator.calculateBounds(element, []);
            }).toThrow(BoundaryCalculationError);
        });

        test('should throw error for negative margins', () => {
            const element = createBasicElement();
            element.margins.top = -5;

            expect(() => {
                ViewBoundaryCalculator.calculateBounds(element, []);
            }).toThrow(BoundaryCalculationError);
        });

        test('should throw error for invalid scale factors', () => {
            const element = createBasicElement();

            expect(() => {
                ViewBoundaryCalculator.calculateBounds(element, [], { scale: { x: 0, y: 1 } });
            }).toThrow(BoundaryCalculationError);
        });
    });

    describe('Child View Handling', () => {
        describe('Child View Handling', () => {
            test('should include child view bounds in calculations', () => {
                const element = createBasicElement();
                const childBounds: ViewBounds = {
                    element: {
                        x: 50,
                        y: 50,
                        width: 100,
                        height: 100,
                        right: 150,
                        bottom: 150,
                        margins: { top: 0, right: 0, bottom: 0, left: 0 },
                    },
                    inner: {
                        x: 50,
                        y: 50,
                        width: 100,
                        height: 100,
                        right: 150,
                        bottom: 150,
                    },
                    outer: {
                        x: 50,
                        y: 50,
                        width: 100,
                        height: 100,
                        right: 150,
                        bottom: 150,
                    },
                };

                const result = ViewBoundaryCalculator.calculateBounds(element, [
                    createMockChildView(childBounds),
                ]);

                expect(result.outer).toEqual({
                    x: -10,
                    y: -10,
                    width: 170, // Spans from -10 to 160
                    height: 170, // Spans from -10 to 160
                    right: 160, // 150 + 10 (right margin)
                    bottom: 160, // 150 + 10 (bottom margin)
                });
            });
        });

        test('should ignore child views that are not included in layout', () => {
            const element = createBasicElement();
            const childBounds: ViewBounds = {
                element: {
                    x: 200,
                    y: 200,
                    width: 100,
                    height: 100,
                    right: 300,
                    bottom: 300,
                    margins: { top: 0, right: 0, bottom: 0, left: 0 },
                },
                inner: {
                    x: 200,
                    y: 200,
                    width: 100,
                    height: 100,
                    right: 300,
                    bottom: 300,
                },
                outer: {
                    x: 200,
                    y: 200,
                    width: 100,
                    height: 100,
                    right: 300,
                    bottom: 300,
                },
            };

            const childView = createMockChildView(childBounds, false);
            const result = ViewBoundaryCalculator.calculateBounds(element, [childView]);

            // Bounds should only reflect the element, not the child
            expect(result.outer).toEqual({
                x: -10,
                y: -10,
                width: 120,
                height: 120,
                right: 110,
                bottom: 110,
            });
        });

        test('should handle multiple overlapping children', () => {
            const element = createBasicElement();
            const child1Bounds: ViewBounds = {
                element: {
                    x: 0,
                    y: 0,
                    width: 150,
                    height: 50,
                    right: 150,
                    bottom: 50,
                    margins: { top: 0, right: 0, bottom: 0, left: 0 },
                },
                inner: {
                    x: 0,
                    y: 0,
                    width: 150,
                    height: 50,
                    right: 150,
                    bottom: 50,
                },
                outer: {
                    x: 0,
                    y: 0,
                    width: 150,
                    height: 50,
                    right: 150,
                    bottom: 50,
                },
            };

            const child2Bounds: ViewBounds = {
                element: {
                    x: 50,
                    y: 25,
                    width: 150,
                    height: 75,
                    right: 200,
                    bottom: 100,
                    margins: { top: 0, right: 0, bottom: 0, left: 0 },
                },
                inner: {
                    x: 50,
                    y: 25,
                    width: 150,
                    height: 75,
                    right: 200,
                    bottom: 100,
                },
                outer: {
                    x: 50,
                    y: 25,
                    width: 150,
                    height: 75,
                    right: 200,
                    bottom: 100,
                },
            };

            const children = [createMockChildView(child1Bounds), createMockChildView(child2Bounds)];

            const result = ViewBoundaryCalculator.calculateBounds(element, children);

            // Bounds should encompass both children
            expect(result.outer).toEqual({
                x: -10,
                y: -10,
                width: 220, // Spans from -10 to 210
                height: 120, // Spans from -10 to 110
                right: 210, // 200 + 10 (right margin)
                bottom: 110, // 100 + 10 (bottom margin)
            });
        });
    });

    describe('Edge Cases 1', () => {
        test('should handle empty element with zero dimensions', () => {
            const element: Rectangle & { margins: Margins } = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                right: 0,
                bottom: 0,
                margins: { top: 0, right: 0, bottom: 0, left: 0 },
            };

            const result = ViewBoundaryCalculator.calculateBounds(element, []);

            expect(result.inner.width).toBe(0);
            expect(result.inner.height).toBe(0);
            expect(result.outer.width).toBe(0);
            expect(result.outer.height).toBe(0);
        });

        test('should handle floating point precision', () => {
            const element = createBasicElement();
            element.width = 100.1;
            element.height = 100.1;
            element.right = 100.1;
            element.bottom = 100.1;

            const result = ViewBoundaryCalculator.calculateBounds(element, []);

            expect(result.inner.width).toBeCloseTo(100.1, 5);
            expect(result.inner.height).toBeCloseTo(100.1, 5);
        });

        test('should handle child view that throws error', () => {
            const element = createBasicElement();
            const errorChildView: ChildView = {
                getBounds: () => {
                    throw new Error('Child view error');
                },
                shouldIncludeInLayout: () => true,
            };

            // Should not throw error and should still calculate bounds for main element
            const result = ViewBoundaryCalculator.calculateBounds(element, [errorChildView]);
            expect(result.outer).toBeDefined();
        });

        test('should handle all invalid child views', () => {
            const element = createBasicElement();
            const errorChildView1: ChildView = {
                getBounds: () => {
                    throw new Error('Child view error 1');
                },
                shouldIncludeInLayout: () => true,
            };
            const errorChildView2: ChildView = {
                getBounds: () => {
                    throw new Error('Child view error 2');
                },
                shouldIncludeInLayout: () => true,
            };

            // Should not throw error and should return element bounds when all children are invalid
            const result = ViewBoundaryCalculator.calculateBounds(element, [
                errorChildView1,
                errorChildView2,
            ]);

            // When all child views are invalid, should use only element bounds
            expect(result).toBeDefined();
            expect(result.outer).toEqual({
                x: -10,
                y: -10,
                width: 120, // Element width + margins
                height: 120, // Element height + margins
                right: 110, // Element right + right margin
                bottom: 110, // Element bottom + bottom margin
            });
        });
    });
});

describe('ViewBoundaryCalculator 2', () => {
    describe('validateNumber', () => {
        it('should throw an error if the number is not finite', () => {
            expect(() => ViewBoundaryCalculator['validateNumber'](Infinity, 'test')).toThrow(
                BoundaryCalculationError,
            );
            expect(() => ViewBoundaryCalculator['validateNumber'](NaN, 'test')).toThrow(
                BoundaryCalculationError,
            );
        });

        it('should throw an error if the number exceeds MAX_SAFE_COORDINATE', () => {
            expect(() => ViewBoundaryCalculator['validateNumber'](1e8, 'test')).toThrow(
                BoundaryCalculationError,
            );
        });

        it('should not throw an error for valid numbers', () => {
            expect(() => ViewBoundaryCalculator['validateNumber'](100, 'test')).not.toThrow();
        });
    });

    describe('validateRectangle', () => {
        it('should throw an error if the rectangle has negative dimensions', () => {
            const rect: Rectangle = { x: 0, y: 0, width: -10, height: 10, right: -10, bottom: 10 };
            expect(() => ViewBoundaryCalculator['validateRectangle'](rect)).toThrow(
                BoundaryCalculationError,
            );
        });

        it('should throw an error if the rectangle coordinates are inconsistent with dimensions', () => {
            const rect: Rectangle = { x: 0, y: 0, width: 10, height: 10, right: 15, bottom: 10 };
            expect(() => ViewBoundaryCalculator['validateRectangle'](rect)).toThrow(
                BoundaryCalculationError,
            );
        });

        it('should not throw an error for valid rectangles', () => {
            const rect: Rectangle = { x: 0, y: 0, width: 10, height: 10, right: 10, bottom: 10 };
            expect(() => ViewBoundaryCalculator['validateRectangle'](rect)).not.toThrow();
        });
    });

    describe('validateMargins', () => {
        it('should throw an error if any margin is negative', () => {
            const margins: Margins = { top: -1, right: 0, bottom: 0, left: 0 };
            expect(() => ViewBoundaryCalculator['validateMargins'](margins)).toThrow(
                BoundaryCalculationError,
            );
        });

        it('should not throw an error for valid margins', () => {
            const margins: Margins = { top: 0, right: 0, bottom: 0, left: 0 };
            expect(() => ViewBoundaryCalculator['validateMargins'](margins)).not.toThrow();
        });
    });

    describe('validateScale', () => {
        it('should throw an error if scale factors are not positive', () => {
            const scale = { x: 0, y: 1 };
            expect(() => ViewBoundaryCalculator['validateScale'](scale)).toThrow(
                BoundaryCalculationError,
            );
        });

        it('should not throw an error for valid scale factors', () => {
            const scale = { x: 1, y: 1 };
            expect(() => ViewBoundaryCalculator['validateScale'](scale)).not.toThrow();
        });
    });

    describe('calculateBounds', () => {
        it('should calculate bounds correctly for given element bounds and no child views', () => {
            const elementBounds: Rectangle & { margins: Margins } = {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                right: 100,
                bottom: 100,
                margins: { top: 10, right: 10, bottom: 10, left: 10 },
            };
            const childViews: ChildView[] = [];
            const config: ViewConfig = { scale: { x: 1, y: 1 } };

            const bounds = ViewBoundaryCalculator.calculateBounds(
                elementBounds,
                childViews,
                config,
            );

            expect(bounds.inner).toEqual({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                right: 100,
                bottom: 100,
            });
            expect(bounds.outer).toEqual({
                x: -10,
                y: -10,
                width: 120,
                height: 120,
                right: 110,
                bottom: 110,
            });
        });

        it('should calculate bounds correctly for given element bounds and child views', () => {
            const elementBounds: Rectangle & { margins: Margins } = {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                right: 100,
                bottom: 100,
                margins: { top: 10, right: 10, bottom: 10, left: 10 },
            };
            const childViews: ChildView[] = [
                {
                    getBounds: () => ({
                        element: {
                            x: 0,
                            y: 0,
                            width: 50,
                            height: 50,
                            right: 50,
                            bottom: 50,
                            margins: { top: 0, right: 0, bottom: 0, left: 0 },
                        },
                        inner: { x: 0, y: 0, width: 50, height: 50, right: 50, bottom: 50 },
                        outer: { x: 0, y: 0, width: 50, height: 50, right: 50, bottom: 50 },
                    }),
                    shouldIncludeInLayout: () => true,
                },
            ];
            const config: ViewConfig = { scale: { x: 1, y: 1 } };

            const bounds = ViewBoundaryCalculator.calculateBounds(
                elementBounds,
                childViews,
                config,
            );

            expect(bounds.inner).toEqual({
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                right: 100,
                bottom: 100,
            });
            expect(bounds.outer).toEqual({
                x: -10,
                y: -10,
                width: 120,
                height: 120,
                right: 110,
                bottom: 110,
            });
        });
    });
});
