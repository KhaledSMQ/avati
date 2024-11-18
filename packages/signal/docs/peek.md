# Peek Signal

A utility function that allows reading a signal's value without establishing a dependency relationship. Perfect for accessing signal values without triggering reactive updates.

## Introduction
Peek provides a way to "look at" a signal's current value without having the current computation track it as a dependency. This is particularly useful when you need to access a signal's value for calculation or comparison but don't want to subscribe to its changes.

## Features
- Read signal values without creating dependencies
- Temporary computation stack manipulation
- Type-safe value access
- Memory efficient
- No subscription overhead

## Basic Usage

```typescript
import { Signal, peek } from '@avati/signal';

const counter = new Signal(0);

// Normal read - creates dependency
const normalValue = counter.value;

// Peek read - no dependency created
const peekedValue = peek(counter);
```

## Common Use Cases

### Computed Signal Optimization
```typescript
const count = new Signal(0);
const threshold = new Signal(10);

// Using peek to avoid unnecessary dependencies
const isOverThreshold = computed(() => {
    const currentCount = count.value;  // Want to track this
    const limit = peek(threshold);     // Don't need to track this
    return currentCount > limit;
});
```

### Conditional Updates
```typescript
const current = new Signal(0);
const previous = new Signal(0);

effect(() => {
    const currentValue = current.value;
    // Peek at previous without creating dependency
    if (currentValue !== peek(previous)) {
        // Handle change
    }
});
```

## Best Practices

### Do's ✅

#### 1. Use for Reference Values
```typescript
// Good
function checkThreshold(value: number) {
    const threshold = peek(maxThreshold); // Reference value
    return value > threshold;
}
```

#### 2. Use in Computations When Dependencies Aren't Needed
```typescript
// Good
const total = computed(() => {
    const items = cartItems.value;     // Track changes
    const taxRate = peek(taxSignal);   // Don't track changes
    return items.reduce((sum, item) => sum + item.price, 0) * (1 + taxRate);
});
```

#### 3. Use for One-time Reads
```typescript
// Good
const initialValue = peek(configSignal);
setupComponent(initialValue);
```

### Don'ts ❌

#### 1. Don't Use for Frequently Changing Values
```typescript
// Bad - Should track this dependency
effect(() => {
    const value = peek(frequentlyChangingSignal);
    updateUI(value); // Will miss updates
});

// Good
effect(() => {
    const value = frequentlyChangingSignal.value;
    updateUI(value);
});
```

#### 2. Don't Use in Render Cycles
```typescript
// Bad
function render() {
    return <div>{peek(displayValue)}</div>; // Will miss updates
}

// Good
function render() {
    return <div>{displayValue.value}</div>;
}
```

#### 3. Don't Create Circular Dependencies
```typescript
// Bad
effect(() => {
    const a = signalA.value;
    const b = peek(signalB);
    signalB.value = a; // Circular dependency
});
```

## Advanced Examples

### Conditional Computation
```typescript
const value = new Signal(0);
const config = new Signal({ threshold: 10, enabled: true });

const result = computed(() => {
    const currentValue = value.value;
    
    // Only peek at config when needed
    if (currentValue > peek(config).threshold) {
        return 'Over threshold';
    }
    
    return 'Normal';
});
```

### Performance Optimization
```typescript
const items = new Signal<string[]>([]);
const filters = new Signal<Record<string, boolean>>({});

const filteredItems = computed(() => {
    const currentItems = items.value;
    // Peek at filters to avoid recomputation when only items change
    const activeFilters = peek(filters);
    
    return currentItems.filter(item => 
        Object.entries(activeFilters)
            .every(([key, value]) => 
                value ? item.includes(key) : true
            )
    );
});
```
 

## Testing
```typescript
describe('Peek Signal', () => {
    it('should read value without creating dependency', () => {
        const signal = new Signal(0);
        const computationRuns = jest.fn();
        
        effect(() => {
            const value = peek(signal);
            computationRuns();
        });
        
        signal.value = 1;
        expect(computationRuns).toHaveBeenCalledTimes(1);
    });
});
```

Remember: Peek is a powerful tool for performance optimization and avoiding unnecessary dependencies, but should be used judiciously. Use it when you need to read a value without tracking changes, but be careful not to create patterns that miss important updates.
