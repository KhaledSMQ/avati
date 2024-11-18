# Effect Signal

## Introduction
Effect Signal is a powerful abstraction for managing side effects in reactive applications. It provides an elegant way to handle operations like DOM manipulations, data fetching, subscriptions, and any other side effects that need to respond to state changes. With automatic dependency tracking and robust cleanup handling, Effect Signal ensures your application remains memory-efficient and leak-free.

Think of effects as observers that automatically react to signal changes, performing necessary side operations while maintaining a clean and predictable lifecycle. Whether you're updating the UI, managing WebSocket connections, or syncing with external systems, Effect Signal provides the tools to handle these operations elegantly.

## Core Features

### Automatic Dependency Tracking
- Zero configuration dependency detection
- Smart re-execution on relevant changes
- Optimization of update cycles
- Prevents unnecessary re-computations

### Robust Cleanup Management
- Automatic resource disposal
- Memory leak prevention
- Cancellation of async operations
- Cleanup of previous effects before re-execution

### Error Handling
- Built-in error boundaries
- Graceful failure handling
- Debug-friendly error messages
- Stack trace preservation

### Lifecycle Management
- Proper initialization
- Controlled execution timing
- Automatic disposal
- Priority-based execution

## Comprehensive Usage Guide

### Basic Effects
```typescript
import { Signal, effect } from '@avati/signal';

// Simple logging effect
const counter = new Signal(0);
const dispose = effect(() => {
    console.log(`Counter value: ${counter.value}`);
});

// Multiple dependencies
const firstName = new Signal('John');
const lastName = new Signal('Doe');
effect(() => {
    console.log(`Name changed to: ${firstName.value} ${lastName.value}`);
});
```

### DOM Manipulation
```typescript
// Reactive UI updates
const isVisible = new Signal(true);
const theme = new Signal('light');

effect(() => {
    const element = document.querySelector('.dynamic-element');
    if (element) {
        element.style.display = isVisible.value ? 'block' : 'none';
        element.className = `dynamic-element theme-${theme.value}`;
        
        // Cleanup when effect re-runs or disposes
        return () => {
            element.className = 'dynamic-element';
        };
    }
});
```

### Async Operations
```typescript
// Data fetching with cleanup
const userId = new Signal<string | null>(null);

effect(() => {
    const id = userId.value;
    if (!id) return;
    
    let cancelled = false;
    
    async function fetchData() {
        try {
            const response = await fetch(`/api/users/${id}`);
            const data = await response.json();
            
            if (!cancelled) {
                // Handle successful data fetch
                console.log('User data:', data);
            }
        } catch (error) {
            if (!cancelled) {
                // Handle error
                console.error('Fetch error:', error);
            }
        }
    }
    
    fetchData();
    
    // Cleanup function
    return () => {
        cancelled = true;
    };
});
```

### Subscription Management
```typescript
// WebSocket connection handling
const wsEnabled = new Signal(true);

effect(() => {
    if (!wsEnabled.value) return;
    
    const ws = new WebSocket('wss://api.example.com');
    
    ws.addEventListener('message', (event) => {
        // Handle message
    });
    
    ws.addEventListener('error', (error) => {
        // Handle error
    });
    
    // Cleanup: close WebSocket when effect re-runs or disposes
    return () => {
        ws.close();
    };
});
```

## Best Practices

### Effect Organization
- Group related effects together
- Use meaningful names for debugging
- Keep effects focused and single-purpose
- Structure cleanup logic carefully

```typescript
// Good: Focused effect with clear purpose
effect(() => {
    const title = document.title;
    document.title = `${baseTitle.value} | ${pageTitle.value}`;
    return () => {
        document.title = title;
    };
}, 'documentTitleEffect');

// Bad: Mixed concerns
effect(() => {
    document.title = pageTitle.value;
    localStorage.setItem('lastVisit', Date.now().toString());
    fetchUserData();
});
```

### Resource Management
- Always return cleanup functions for subscriptions
- Cancel async operations properly
- Remove event listeners
- Clear intervals and timeouts

```typescript
// Good: Proper resource cleanup
effect(() => {
    const interval = setInterval(() => {
        counter.value++;
    }, 1000);
    
    return () => {
        clearInterval(interval);
    };
});
```

### Error Handling
- Implement try-catch blocks for async operations
- Provide fallback UI states
- Log errors appropriately
- Handle edge cases

```typescript
effect(() => {
    try {
        const data = processData(sourceSignal.value);
        resultSignal.value = data;
    } catch (error) {
        errorSignal.value = error;
        console.error('Processing error:', error);
    }
});
```

## What to Avoid

### Anti-patterns
```typescript
// ❌ Avoid: Mutating signals in effects without cleanup
effect(() => {
    otherSignal.value = someSignal.value * 2;
});

// ❌ Avoid: Infinite loops
effect(() => {
    counter.value++; // This creates an infinite loop!
});

// ❌ Avoid: Missing cleanup
effect(() => {
    const subscription = observable.subscribe();
    // Missing cleanup!
});
```

### Common Pitfalls
- Circular dependencies between effects
- Unnecessary effect nesting
- Heavy computations without memoization
- Missing error boundaries
- Improper cleanup timing
- Unhandled race conditions

## Advanced Features

### Effect Batching
```typescript
import { batch } from './signals';

effect(() => {
    batch(() => {
        signal1.value = 'new value 1';
        signal2.value = 'new value 2';
        // Both updates handled in single effect cycle
    });
});
```

### Conditional Effects
```typescript
effect(() => {
    if (!isEnabled.value) return;
    
    const cleanup1 = setupFeature1();
    const cleanup2 = setupFeature2();
    
    return () => {
        cleanup1();
        cleanup2();
    };
});
```

### Debug Mode
```typescript
effect(() => {
    console.time('effectTiming');
    // Effect logic
    console.timeEnd('effectTiming');
}, 'debugEffect');
```

## API Reference

```typescript
interface EffectFunction<T = void> {
    (): T | (() => void);
}

interface EffectOptions {
    name?: string;
}

function effect(
    fn: EffectFunction,
    name?: string
): () => void;
```

## Performance Tips
- Use appropriate granularity for effects
- Implement memoization for expensive computations
- Batch related signal updates
- Dispose effects when no longer needed
- Profile effect execution time in development

## Debugging

### Using Names
```typescript
effect(() => {
    // Effect logic
}, 'AuthenticationEffect');
```

### Timing Analysis
```typescript
effect(() => {
    const start = performance.now();
    // Effect logic
    console.log(`Effect took ${performance.now() - start}ms`);
});
```

### Error Tracking
```typescript
effect(() => {
    try {
        // Effect logic
    } catch (error) {
        console.error(`[${name}] Effect error:`, error);
        errorTracking.capture(error);
    }
});
```

## Migration Guide
If you're coming from other reactive systems:

### From React useEffect
```typescript
// React
useEffect(() => {
    const handler = () => {};
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
}, [dependency]);

// Effect Signal
effect(() => {
    const handler = () => {};
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
});
```

### From RxJS Subscriptions
```typescript
// RxJS
const subscription = observable$.subscribe(value => {});
subscription.unsubscribe();

// Effect Signal
const dispose = effect(() => {
    const subscription = observable$.subscribe(value => {});
    return () => subscription.unsubscribe();
});
```

## Testing
```typescript
describe('Effect', () => {
    it('should cleanup on disposal', () => {
        const cleanup = jest.fn();
        const signal = new Signal(0);
        
        const dispose = effect(() => {
            return cleanup;
        });
        
        dispose();
        expect(cleanup).toHaveBeenCalled();
    });
});
```

Remember: Effects are the backbone of side-effect management in reactive applications. When used correctly, they provide a powerful and maintainable way to handle complex interactions and state changes. Keep effects focused, implement proper cleanup, and always consider the lifecycle of your application when working with effects.
