# Computed Signal

Reactive computed values that automatically update when their dependencies change.

## Core Features
- Automatic dependency tracking
- Lazy evaluation
- Circular dependency detection
- Memory leak prevention
- Disposal management

## Usage

```typescript
import { Signal, computed } from '@avati/signal';

// Create base signals
const firstName = new Signal('John');
const lastName = new Signal('Doe');

// Create computed signal
const fullName = computed(() => {
    return `${firstName.value} ${lastName.value}`;
});

console.log(fullName.value); // "John Doe"
firstName.value = 'Jane';
console.log(fullName.value); // "Jane Doe"
```

## Advanced Usage

### With Custom Equality
```typescript
const userComputed = computed(() => ({
    name: firstName.value,
    age: age.value
}), {
    equals: (prev, next) => 
        prev.name === next.name && prev.age === next.age,
    name: 'userInfo'
});
```

### Complex Computations
```typescript
const filteredList = computed(() => {
    const items = list.value;
    const searchTerm = search.value.toLowerCase();
    const filterType = filter.value;
    
    return items
        .filter(item => item.name.toLowerCase().includes(searchTerm))
        .filter(item => filterType === 'all' || item.type === filterType);
});
```

## Best Practices
- Keep computations pure
- Avoid side effects
- Implement custom equality for complex objects
- Dispose computations when no longer needed
- Use meaningful names for debugging

## What to Avoid
- Circular dependencies
- Side effects in computed functions
- Heavy computations without memoization
- Direct value modification
- Infinite loops
- Reading disposed signals

## Error Handling

```typescript
try {
    const value = computedSignal.value;
} catch (error) {
    if (error instanceof SignalDisposedError) {
        // Handle disposed signal
    } else if (error instanceof CircularDependencyError) {
        // Handle circular dependency
    }
}
```
