# ViewBoundaryCalculator

ViewBoundaryCalculator is a TypeScript utility for calculating view boundaries in a layout system. It handles coordinate calculations, margin applications, and nested view relationships while ensuring numerical accuracy and proper error handling.

## Features

- Calculates combined boundaries for nested views
- Handles margins and offset positions
- Supports view scaling
- Validates input parameters
- Provides robust error handling
- Maintains coordinate system consistency
- Handles invalid child views gracefully

## Installation

```bash
npm install @avatijs/element
```

## Usage

### Basic Usage

```typescript
import { ViewBoundaryCalculator } from '@avatijs/element';

// Create element bounds with margins
const elementBounds = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    margins: { top: 10, right: 10, bottom: 10, left: 10 }
};

// Calculate boundaries
const bounds = ViewBoundaryCalculator.calculateBounds(elementBounds, []);
```

### With Child Views

```typescript
// Define a child view
class MyChildView implements ChildView {
    getBounds(): ViewBounds {
        return {
            element: {
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                right: 50,
                bottom: 50,
                margins: { top: 0, right: 0, bottom: 0, left: 0 }
            },
            inner: {
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                right: 50,
                bottom: 50
            },
            outer: {
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                right: 50,
                bottom: 50
            }
        };
    }

    shouldIncludeInLayout(): boolean {
        return true;
    }
}

// Calculate boundaries with child views
const bounds = ViewBoundaryCalculator.calculateBounds(
    elementBounds,
    [new MyChildView()],
    { scale: { x: 1, y: 1 }, offset: { x: 0, y: 0 } }
);
```

## API

### Types

```typescript
interface Point2D {
    x: number;
    y: number;
}

interface Dimensions {
    width: number;
    height: number;
}

interface Margins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface Rectangle extends Point2D, Dimensions {
    right: number;
    bottom: number;
}

interface ViewBounds {
    element: Rectangle & { margins: Margins };
    inner: Rectangle;
    outer: Rectangle;
}

interface ChildView {
    getBounds(): ViewBounds;
    shouldIncludeInLayout(): boolean;
}

interface ViewConfig {
    offset?: Point2D;
    scale?: Point2D;
}
```

### Methods

#### calculateBounds

```typescript
static calculateBounds(
    elementBounds: Rectangle & { margins: Margins },
    childViews: ChildView[],
    config: ViewConfig = {}
): ViewBounds
```

Calculates view boundaries based on element bounds and child views.

- `elementBounds`: The bounds of the main element, including margins
- `childViews`: Array of child views to include in boundary calculations
- `config`: Optional configuration for offset and scale
- Returns: The calculated ViewBounds combining element and child boundaries

## Boundary Structure

```
    Outer Bounds (includes margins)
    +------------------------------------------+
    |· · · · · · top margin · · · · · · · · · ·|
    |· +----------------------------------+ · ·|
    |· |             Inner Bounds         | · ·|
    |· |  +----------------------------+  | · ·|
    |· |  |      Element Bounds        |  | · ·|
    |· |  |                            |  | · ·|
    |· |  |     ##################     |  | · ·|
    |· |  |     ##################     |  | · ·|
    |· |  |     #####Content######     |  | · ·|
    |· |  |     ##################     |  | · ·|
    |· |  |     ##################     |  | · ·|
    |· |  |          ~~~~~             |  | · ·|
    |· |  |      Child Views (~)       |  | · ·|
    |· |  |          ~~~~~             |  | · ·|
    |· |  |                            |  | · ·|
    |· |  +----------------------------+  | · ·|
    |· |                                  | · ·|
    |· +----------------------------------+ · ·|
    |· · · · · bottom margin · · · · · · · · · |
    +------------------------------------------+
```

## Coordinate System

- Origin (0,0) is at top-left
- X increases to the right
- Y increases downward

## Error Handling

The calculator includes robust error handling for:
- Invalid coordinates
- Negative dimensions
- Negative margins
- Invalid scale factors
- Child view errors

## Example Calculations

```typescript
// Input
const element = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    right: 100,
    bottom: 100,
    margins: { top: 10, right: 10, bottom: 10, left: 10 }
};

// Output
{
    element: { /* original element */ },
    inner: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        right: 100,
        bottom: 100
    },
    outer: {
        x: -10,
        y: -10,
        width: 120,
        height: 120,
        right: 110,
        bottom: 110
    }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Testing

```bash
npm test
```

## License

MIT
