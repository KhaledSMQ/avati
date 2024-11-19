# Combine Signal

A utility for combining multiple signals into a single reactive signal containing an array of their values.

## Introduction
Combine Signal merges multiple signals, creating a single signal that updates whenever any source signal changes.

## Usage

```typescript
import { Signal, combine } from '@avatijs/signal';

// Create source signals
const nameSignal = new Signal<string>('John');
const ageSignal = new Signal<number>(25);
const activeSignal = new Signal<boolean>(true);

// Combine signals
const combined = combine([nameSignal, ageSignal, activeSignal]);
console.log(combined.value); // ['John', 25, true]

// When source signals update, combined signal updates
nameSignal.value = 'Jane';
console.log(combined.value); // ['Jane', 25, true]
```

## Features
- Combines multiple signals of different types
- Updates automatically when source signals change
- Type-safe tuple output
- Custom equality comparison support
- Memory efficient

## Best Practices
- Combine related signals that change together
- Use with computed signals for derived state
- Implement custom equality for complex objects
- Clear signal subscriptions when no longer needed

## What to Avoid
- Combining unrelated signals
- Overusing with many source signals
- Modifying the combined array directly
- Creating circular dependencies
- Combining signals with very frequent updates

## API

### combine<T>
```typescript
function combine<T extends any[]>(
    signals: { [K in keyof T]: Signal<T[K]> },
    options?: SignalOptions<T>
): Signal<T>
```

### Options
```typescript
interface SignalOptions<T> {
    equals?: (prev: T, next: T) => boolean;
    name?: string;
}
```

## Example with Custom Equality

```typescript
const combined = combine([sig1, sig2], {
    equals: (prev, next) =>
        prev.length === next.length &&
        prev.every((val, idx) => Object.is(val, next[idx])),
    name: 'CustomCombinedSignal'
});
```
