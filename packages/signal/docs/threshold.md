# Threshold Signal

A signal that only updates when the source value changes by a specified minimum delta. Perfect for handling numeric values where small fluctuations should be ignored.

## Introduction
Threshold Signal provides a way to filter out minor changes in numeric values, only triggering updates when changes exceed a specified threshold. This is particularly useful for sensor data, measurements, or any numeric values where small variations should be smoothed out.

## Features
- Delta-based update filtering
- Numeric value smoothing
- Custom equality comparison
- Memory efficient
- Automatic threshold checking

## Basic Usage

```typescript
import { Signal, threshold } from '@avatijs/signal';

// Create a source signal
const temperature = new Signal(20.0);

// Create a threshold signal that only updates on 0.5+ degree changes
const filteredTemp = threshold(temperature, 0.5);

temperature.value = 20.2; // filteredTemp stays at 20.0
temperature.value = 20.6; // filteredTemp updates to 20.6
```

## Common Use Cases

### Sensor Data Filtering
```typescript
const rawSensor = new Signal(0);
const smoothedSensor = threshold(rawSensor, 1.0);

// Small noise is filtered out
rawSensor.value = 0.3;  // smoothedSensor stays at 0
rawSensor.value = 0.7;  // smoothedSensor stays at 0
rawSensor.value = 1.2;  // smoothedSensor updates to 1.2
```

### UI Value Updates
```typescript
const scrollPosition = new Signal(0);
const significantScroll = threshold(scrollPosition, 50);

effect(() => {
    // Only update UI on significant scroll changes
    updateUI(significantScroll.value);
});
```

## Best Practices

### Do's ✅

#### 1. Choose Appropriate Thresholds
```typescript
// Good - Meaningful threshold for the data type
const price = new Signal(100.00);
const significantChange = threshold(price, 0.01); // 1 cent

// Bad - Threshold too small
const badThreshold = threshold(price, 0.0001); // Meaningless precision
```

#### 2. Consider Scale
```typescript
// Good - Scale-appropriate thresholds
const percentage = new Signal(0);
const significantPercent = threshold(percentage, 1.0); // 1%

const temperature = new Signal(0);
const significantTemp = threshold(temperature, 0.5); // 0.5 degrees
```

#### 3. Use Type Safety
```typescript
// Good
const numericSignal = new Signal<number>(0);
const filtered = threshold(numericSignal, 1.0);

// Bad
const anySignal = new Signal<any>(0);
const unsafe = threshold(anySignal, 1.0); // Avoid any
```

### Don'ts ❌

#### 1. Use with Non-Numeric Values
```typescript
// Bad - Threshold only works with numbers
const stringSignal = new Signal<string>('test');
// This won't work
// const filtered = threshold(stringSignal, 1);

// Good
const numSignal = new Signal<number>(0);
const filtered = threshold(numSignal, 1);
```

#### 2. Use Negative Thresholds
```typescript
// Bad
const badThreshold = threshold(signal, -1.0);

// Good
const goodThreshold = threshold(signal, Math.abs(1.0));
```

#### 3. Ignore Units
```typescript
// Bad - Mixing units
const meters = new Signal(1000);
const filtered = threshold(meters, 1); // Is this meters or millimeters?

// Good - Clear units
const metersThreshold = 0.1; // 10cm in meters
const filteredMeters = threshold(meters, metersThreshold);
```

## Advanced Examples

### Dynamic Thresholds
```typescript
const value = new Signal(0);
const thresholdValue = new Signal(1.0);

const dynamicThreshold = computed(() => {
    const currentValue = value.value;
    const currentThreshold = peek(thresholdValue);
    
    return threshold(value, currentThreshold).value;
});
```

### Percentage-Based Threshold
```typescript
const baseValue = new Signal(100);
const percentThreshold = 0.05; // 5%

const significantChange = computed(() => {
    const current = baseValue.value;
    const prevValue = peek(baseValue);
    const change = Math.abs((current - prevValue) / prevValue);
    
    return change >= percentThreshold ? current : prevValue;
});
```

### Multi-Value Threshold
```typescript
interface Vector2D {
    x: number;
    y: number;
}

const position = new Signal<Vector2D>({ x: 0, y: 0 });
const minDistance = 5; // Minimum change in either direction

const significantMove = computed(() => {
    const current = position.value;
    const prev = peek(position);
    
    const distance = Math.sqrt(
        Math.pow(current.x - prev.x, 2) + 
        Math.pow(current.y - prev.y, 2)
    );
    
    return distance >= minDistance ? current : prev;
});
```

## Testing
```typescript
describe('Threshold Signal', () => {
    it('should only update on significant changes', () => {
        const source = new Signal(10.0);
        const filtered = threshold(source, 1.0);
        
        source.value = 10.5;
        expect(filtered.value).toBe(10.0);
        
        source.value = 11.1;
        expect(filtered.value).toBe(11.1);
    });
    
    it('should handle bidirectional changes', () => {
        const source = new Signal(0);
        const filtered = threshold(source, 1.0);
        
        source.value = 0.5;
        expect(filtered.value).toBe(0);
        
        source.value = -1.1;
        expect(filtered.value).toBe(-1.1);
    });
});
```

Remember: Threshold signals are perfect for smoothing out noisy numeric data or preventing unnecessary updates on small changes. Choose thresholds that make sense for your data's scale and units, and always consider the real-world meaning of the threshold value.
