# Signal Library Documentation

## Overview

The Signal library provides a reactive state management solution for TypeScript/JavaScript applications. It implements the Observer pattern with automatic dependency tracking and computed values.

## Core Concepts

- **Signal**: A wrapper around a value that notifies subscribers when the value changes
- **Computed Signal**: A signal that derives its value from other signals
- **Effect**: A side effect that runs when its dependencies change
- **Batch**: A way to group multiple signal updates together

## Installation

```typescript
import { createSignal, computed, effect, batch } from '@avatijs/signal';
```

## Basic Usage

### Creating and Using Signals

```typescript
// Create a basic signal
const count = createSignal(0);

// Subscribe to changes
const unsubscribe = count.subscribe(() => {
    console.log('Count changed to:', count.value);
});

// Update the value
count.value = 1; // Logs: "Count changed to: 1"

// Update using a function
count.update(current => current + 1); // Logs: "Count changed to: 2"

// Cleanup
unsubscribe();
```

### Custom Equality Checking

```typescript
// Create a signal with custom equality checking
const user = createSignal(
    { name: 'John', age: 30 },
    {
        equals: (prev, next) => 
            prev.name === next.name && prev.age === next.age
    }
);

user.subscribe(() => console.log('User changed:', user.value));

// This won't trigger an update because the values are equal
user.value = { name: 'John', age: 30 };

// This will trigger an update
user.value = { name: 'John', age: 31 };
```

### Computed Signals

```typescript
// Basic computed value
const count = createSignal(0);
const doubleCount = computed(() => count.value * 2);

console.log(doubleCount.value); // 0
count.value = 5;
console.log(doubleCount.value); // 10

// Computed with multiple dependencies
const firstName = createSignal('John');
const lastName = createSignal('Doe');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

console.log(fullName.value); // "John Doe"
firstName.value = 'Jane';
console.log(fullName.value); // "Jane Doe"

// Computed with error handling
const safeDivision = computed(() => {
    if (count.value === 0) {
        throw new Error('Cannot divide by zero');
    }
    return 100 / count.value;
});

try {
    console.log(safeDivision.value);
} catch (error) {
    console.error('Division error:', error.message);
}
```

### Effects

```typescript
// Basic effect
const name = createSignal('John');
const cleanupEffect = effect(() => {
    console.log('Name changed to:', name.value);
    // Return cleanup function (optional)
    return () => console.log('Cleaning up previous effect');
});

name.value = 'Jane';
// Logs:
// "Cleaning up previous effect"
// "Name changed to: Jane"

// Cleanup when done
cleanupEffect();

// Effect with multiple dependencies
const user = createSignal({ name: 'John', age: 30 });
const settings = createSignal({ theme: 'dark' });

effect(() => {
    console.log(
        `User ${user.value.name} (${user.value.age}) ` +
        `prefers ${settings.value.theme} theme`
    );
});
```

### Batching Updates

```typescript
// Without batching - triggers three updates
const counter = createSignal(0);
counter.subscribe(() => console.log('Counter:', counter.value));

counter.value = 1; // Logs immediately
counter.value = 2; // Logs immediately
counter.value = 3; // Logs immediately

// With batching - triggers only one update
batch(() => {
    counter.value = 1;
    counter.value = 2;
    counter.value = 3;
}); // Logs only once with final value
```

## Advanced Examples

### Form Handling

```typescript
const formData = createSignal({ username: '', password: '' });
const isValid = computed(() => {
    const { username, password } = formData.value;
    return username.length >= 3 && password.length >= 8;
});

const errors = computed(() => {
    const { username, password } = formData.value;
    const errors: string[] = [];
    
    if (username.length < 3) {
        errors.push('Username must be at least 3 characters');
    }
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    
    return errors;
});

// Form submission effect
effect(() => {
    if (isValid.value) {
        console.log('Form is valid, ready to submit!');
    } else {
        console.log('Form errors:', errors.value);
    }
});
```

### Shopping Cart Example

```typescript
interface Product {
    id: number;
    name: string;
    price: number;
}

interface CartItem extends Product {
    quantity: number;
}

// Create signals
const products = createSignal<Product[]>([
    { id: 1, name: 'Book', price: 10 },
    { id: 2, name: 'Pen', price: 2 },
]);

const cart = createSignal<CartItem[]>([]);

// Computed values
const totalItems = computed(() => 
    cart.value.reduce((sum, item) => sum + item.quantity, 0)
);

const totalPrice = computed(() => 
    cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
);

// Add to cart function
function addToCart(productId: number) {
    const product = products.value.find(p => p.id === productId);
    if (!product) return;

    cart.update(items => {
        const existingItem = items.find(item => item.id === productId);
        if (existingItem) {
            return items.map(item =>
                item.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        }
        return [...items, { ...product, quantity: 1 }];
    });
}

// Usage example
effect(() => {
    console.log(`Cart has ${totalItems.value} items`);
    console.log(`Total price: $${totalPrice.value}`);
});

addToCart(1); // Adds a book
addToCart(1); // Adds another book
addToCart(2); // Adds a pen
```

### Async Data Fetching

```typescript
interface User {
    id: number;
    name: string;
}

const userId = createSignal<number | null>(null);
const userIsLoading = createSignal(false);
const userData = createSignal<User | null>(null);
const userError = createSignal<string | null>(null);

// Effect to fetch user data
effect(() => {
    const currentUserId = userId.value;
    if (!currentUserId) {
        userData.value = null;
        return;
    }

    async function fetchUser() {
        userIsLoading.value = true;
        userError.value = null;
        
        try {
            const response = await fetch(
                `https://api.example.com/users/${currentUserId}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            const data = await response.json();
            userData.value = data;
        } catch (error) {
            userError.value = error instanceof Error 
                ? error.message 
                : 'Unknown error';
        } finally {
            userIsLoading.value = false;
        }
    }

    fetchUser();
});

// Computed state for UI
const userState = computed(() => {
    if (userIsLoading.value) return 'loading';
    if (userError.value) return 'error';
    if (userData.value) return 'success';
    return 'idle';
});

// Usage
effect(() => {
    switch (userState.value) {
        case 'loading':
            console.log('Loading user data...');
            break;
        case 'error':
            console.log('Error:', userError.value);
            break;
        case 'success':
            console.log('User:', userData.value);
            break;
        case 'idle':
            console.log('No user selected');
            break;
    }
});

// Trigger a fetch
userId.value = 1;
```

## Best Practices

1. **Resource Management**
  - Always dispose of signals when they're no longer needed
  - Clean up effects when component unmounts
  - Use batch for multiple related updates

```typescript
const cleanup = effect(() => {
    // Effect logic
});

// Later, when cleaning up:
cleanup();
signal.dispose();
```

2. **Error Handling**
  - Always handle potential errors in computed signals
  - Provide fallback values for error cases
  - Use try-catch blocks when accessing computed values that might throw

3. **Performance**
  - Use batch for multiple updates
  - Implement custom equality checking for complex objects
  - Dispose of unused signals and effects

4. **Type Safety**
  - Always provide proper types for signals
  - Use interface definitions for complex data structures
  - Leverage TypeScript's type system for better error catching

## Common Pitfalls

1. **Circular Dependencies**
   ```typescript
   // DON'T: This will cause an infinite loop
   const a = createSignal(0);
   const b = computed(() => a.value + 1);
   const c = computed(() => b.value + 1);
   a.value = c.value; // Circular dependency!
   ```

2. **Memory Leaks**
   ```typescript
   // DON'T: Forgetting to clean up
   effect(() => {
       // Effect logic
   });

   // DO: Store and call cleanup
   const cleanup = effect(() => {
       // Effect logic
   });
   // Later:
   cleanup();
   ```

3. **Unnecessary Computations**
   ```typescript
   // DON'T: Computing values that could be static
   const static = computed(() => {
       return heavyCalculation(42); // This value never changes!
   });

   // DO: Use regular variables for static values
   const static = heavyCalculation(42);
   ```

## Advanced Topics

### Custom Signal Types

```typescript
class DebugSignal<T> extends Signal<T> {
    constructor(initialValue: T) {
        super(initialValue);
        this.subscribe(() => {
            console.log(`Signal updated to:`, this.value);
        });
    }
}

const debugCount = new DebugSignal(0);
debugCount.value = 1; // Logs automatically
```

### Integration with React

```typescript
function useSignal<T>(signal: Signal<T>): T {
    const [, forceUpdate] = useState({});
    
    useEffect(() => {
        return signal.subscribe(() => forceUpdate({}));
    }, [signal]);
    
    return signal.value;
}

// Usage in component
function Counter() {
    const count = useSignal(counterSignal);
    return <div>Count: {count}</div>;
}
```
