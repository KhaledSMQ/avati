# Throttled Signal

A signal that limits the rate of updates by ensuring a minimum time interval between value changes.

## Introduction
Throttled Signal provides rate limiting for signal updates, ensuring that rapid changes are spaced out over time. This is particularly useful for handling frequent events like scroll updates, window resizing, or any high-frequency state changes that need to be rate-limited.

## Features
- Time-based update throttling
- Automatic cleanup
- Custom update intervals
- Memory efficient
- Configurable options

## Basic Usage

```typescript
import { Signal, throttled } from '@avatijs/signal';

// Create source signal
const source = new Signal(0);

// Create throttled signal with 1000ms (1 second) interval
const throttledSignal = throttled(source, 1000);

// Rapid updates
source.value = 1;  // t=0ms:    throttledSignal updates to 1
source.value = 2;  // t=100ms:  update queued
source.value = 3;  // t=200ms:  previous queue replaced
// At t=1000ms: throttledSignal updates to 3
```

## Common Use Cases

### Scroll Handler
```typescript
const scrollPosition = new Signal(0);
const throttledScroll = throttled(scrollPosition, 100);

effect(() => {
    // UI updates at most every 100ms
    updateUI(throttledScroll.value);
});

// Update scroll position frequently
window.addEventListener('scroll', () => {
    scrollPosition.value = window.scrollY;
});
```

### Window Resize
```typescript
const windowSize = new Signal({ width: 0, height: 0 });
const throttledSize = throttled(windowSize, 250);

effect(() => {
    // Layout updates throttled to 250ms
    updateLayout(throttledSize.value);
});
```

## Best Practices

### Do's ✅

#### 1. Choose Appropriate Intervals
```typescript
// Good - Human perception threshold
const mousePosition = throttled(position, 16); // ~60fps

// Good - Network consideration
const searchQuery = throttled(query, 500); // API call throttling
```

#### 2. Cleanup Resources
```typescript
// Good - Proper cleanup
const throttled = throttled(source, 1000);
// Later...
throttled.dispose();
```

#### 3. Use Type Safety
```typescript
// Good
interface Point {
    x: number;
    y: number;
}

const position = new Signal<Point>({ x: 0, y: 0 });
const throttledPosition = throttled(position, 100);
```

### Don'ts ❌

#### 1. Throttle Critical Updates
```typescript
// Bad - Critical state changes shouldn't be throttled
const userAuthenticated = throttled(authState, 1000);

// Good - Immediate updates for critical state
const userAuthenticated = authState;
```

#### 2. Use Too Small Intervals
```typescript
// Bad - Interval too small
const overThrottled = throttled(signal, 1);

// Good - Meaningful interval
const properlyThrottled = throttled(signal, 100);
```

#### 3. Chain Multiple Throttles
```typescript
// Bad - Chained throttling
const doubleThrottled = throttled(
    throttled(source, 100),
    100
);

// Good - Single throttle
const properlyThrottled = throttled(source, 100);
```

## Advanced Examples

### Debounce vs Throttle
```typescript
// Throttle - Regular updates at interval
const throttledSearch = throttled(searchQuery, 300);

// vs Debounce - Waits for pause in updates
const debouncedSearch = debounced(searchQuery, 300);
```

### With Custom Equality
```typescript
const source = new Signal({ x: 0, y: 0 });
const throttledPosition = throttled(
    source,
    100,
    {
        equals: (prev, next) => 
            prev.x === next.x && prev.y === next.y
    }
);
```

### Dynamic Rate Limiting
```typescript
const eventSignal = new Signal(null);
const lowLoad = throttled(eventSignal, 100);
const highLoad = throttled(eventSignal, 1000);

effect(() => {
    const signal = isHighLoad.value ? 
        highLoad.value : 
        lowLoad.value;
    processEvent(signal);
});
```

## Testing
```typescript
describe('Throttled Signal', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    it('should throttle updates', () => {
        const source = new Signal(0);
        const throttled = throttled(source, 1000);
        
        source.value = 1;
        expect(throttled.value).toBe(1);
        
        source.value = 2;
        expect(throttled.value).toBe(1);
        
        jest.advanceTimersByTime(1000);
        expect(throttled.value).toBe(2);
    });

    it('should cleanup timeouts', () => {
        const source = new Signal(0);
        const throttled = throttled(source, 1000);
        
        source.value = 1;
        throttled.dispose();
        
        jest.advanceTimersByTime(1000);
        expect(throttled.value).toBe(1);
    });
});
```

## Performance Considerations
- Choose intervals based on use case requirements
- Consider browser performance implications
- Monitor memory usage with high-frequency events
- Clean up throttled signals when no longer needed
- Use appropriate intervals for different devices/contexts

Remember: Throttled signals are perfect for rate-limiting frequent updates while ensuring regular state changes. Choose appropriate intervals based on your specific use case and always consider cleanup to prevent memory leaks.
