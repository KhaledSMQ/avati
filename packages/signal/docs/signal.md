# Signal

A reactive primitive for managing state changes with automatic dependency tracking and efficient updates.

## Introduction
Signal is the core building block for reactive state management. It provides a powerful way to handle value changes while automatically managing dependencies and updates. When a signal's value changes, all computations and effects that depend on it are automatically updated.

## Core Features
- Automatic dependency tracking
- Efficient update batching
- Memory leak prevention
- Type safety
- Custom equality comparison
- Subscription management
- Automatic cleanup
- Debug support

## Basic Usage

```typescript
import { Signal } from '@avatijs/signal';

// Create a signal
const count = new Signal(0);

// Read value
console.log(count.value); // 0

// Update value
count.value = 1;

// Update using transform
count.update(current => current + 1);
```

## Advanced Usage

### With Custom Equality
```typescript
const user = new Signal(
    { id: 1, name: 'John' },
    {
        equals: (prev, next) => prev.id === next.id && prev.name === next.name,
        name: 'userSignal'
    }
);
```

### Subscriptions
```typescript
const name = new Signal('John');
const unsubscribe = name.subscribe(newValue => {
    console.log(`Name changed to: ${newValue}`);
});

name.value = 'Jane'; // Logs: "Name changed to: Jane"
unsubscribe(); // Remove subscription
```

### Batching Updates
```typescript
import { batch } from './signals';

batch(() => {
    user.value = { ...user.value, name: 'Jane' };
    count.value = count.value + 1;
    // Only one update cycle triggered
});
```
## Best Practices

### Do's ✅

#### 1. Use Clear Initialization
```typescript
// Good
const userSignal = new Signal<User>({
    id: 1,
    name: 'John',
    role: 'user'
});

// Bad
const user = new Signal({} as User);
```

#### 2. Implement Custom Equality for Complex Objects
```typescript
// Recommanded
const userSignal = new Signal(user, {
    equals: (prev, next) => 
        prev.id === next.id && 
        prev.lastModified === next.lastModified
});

// Default behavior
const userSignal = new Signal(user); // Uses default Object.is
```

#### 3. Batch Related Updates
```typescript
// Good
batch(() => {
    userSignal.value = { ...userSignal.value, name: 'Jane' };
    permissionsSignal.value = ['read', 'write'];
});

// Bad
userSignal.value = { ...userSignal.value, name: 'Jane' };
permissionsSignal.value = ['read', 'write'];
```

#### 4. Clean Up Resources
```typescript
// Good
const unsubscribe = signal.subscribe(handleChange);
// Later...
unsubscribe();
signal.dispose();

// Bad
signal.subscribe(handleChange);
// Never cleaned up
```

#### 5. Use Type Parameters
```typescript
// Good
const countSignal = new Signal<number>(0);
const nameSignal = new Signal<string>('');

// Bad
const signal = new Signal(0); // Inferred type
```

### Don'ts ❌

#### 1. Modify Signals Inside Computed
```typescript
// Bad
const computed = computed(() => {
    otherSignal.value++; // Direct modification
    return signal.value * 2;
});

// Good
effect(() => {
    otherSignal.value = signal.value * 2;
});
```

#### 2. Create Circular Dependencies
```typescript
// Bad
const a = new Signal(0);
const b = computed(() => a.value + 1);
effect(() => {
    a.value = b.value; // Creates circular dependency
});

// Good
const a = new Signal(0);
const b = computed(() => a.value + 1);
```

#### 3. Store Functions in Signals
```typescript
// Bad
const handlerSignal = new Signal(() => {});

// Good
const handler = () => {};
const configSignal = new Signal({ callback: handler });
```

#### 4. Deep Signal Nesting
```typescript
// Bad
const deepSignal = new Signal({
    user: new Signal({
        settings: new Signal({
            theme: new Signal('dark')
        })
    })
});

// Good
const userSignal = new Signal({ id: 1, name: 'John' });
const settingsSignal = new Signal({ theme: 'dark' });
```

#### 5. Access Disposed Signals
```typescript
// Bad
signal.dispose();
console.log(signal.value); // Throws error

// Good
if (!signal.isDisposed()) {
    console.log(signal.value);
}
```

#### 6. Unchecked Signal Updates
```typescript
// Bad
setInterval(() => {
    signal.value++; // Uncontrolled updates
}, 100);

// Good
effect(() => {
    const interval = setInterval(() => {
        signal.value++;
    }, 100);
    return () => clearInterval(interval);
});
```

#### 7. Ignore Type Safety
```typescript
// Bad
const signal = new Signal<string>('hello');
(signal as any).value = 42; // Type casting

// Good
const signal = new Signal<string | number>('hello');
signal.value = 42; // Type safe
```

## Error Handling

```typescript
try {
    const value = signal.value;
} catch (error) {
    if (error instanceof SignalDisposedError) {
        // Handle disposed signal access
    }
}
```

## API Reference

```typescript
class Signal<T> {
    constructor(initialValue: T, options?: SignalOptions<T>);
    
    get value(): T;
    set value(newValue: T);
    
    update(fn: (current: T) => T): void;
    subscribe(callback: (value: T) => void): () => void;
    dispose(): void;
    
    isDisposed(): boolean;
    getDependents(): Set<Computation>;
    hasDependents(): boolean;
}

interface SignalOptions<T> {
    equals?: (prev: T, next: T) => boolean;
    name?: string;
}
```

## Advanced Patterns

### Derived State
```typescript
const firstName = new Signal('John');
const lastName = new Signal('Doe');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);
```

### State Objects
```typescript
interface UserState {
    name: string;
    age: number;
    preferences: Record<string, boolean>;
}

const userState = new Signal<UserState>({
    name: 'John',
    age: 25,
    preferences: {}
}, {
    equals: (prev, next) => {
        return prev.name === next.name &&
               prev.age === next.age &&
               Object.keys(prev.preferences).length === Object.keys(next.preferences).length &&
               Object.entries(prev.preferences).every(([key, value]) => next.preferences[key] === value);
    }
});
```

### Lifecycle Management
```typescript
class Component {
    private signals: Signal<any>[] = [];
    
    createSignal<T>(initial: T, options?: SignalOptions<T>) {
        const signal = new Signal(initial, options);
        this.signals.push(signal);
        return signal;
    }
    
    dispose() {
        this.signals.forEach(signal => signal.dispose());
        this.signals = [];
    }
}
```

## Common Use Cases

### Form State
```typescript
const formState = new Signal({
    username: '',
    email: '',
    isValid: false
});

effect(() => {
    const { username, email } = formState.value;
    formState.update(state => ({
        ...state,
        isValid: username.length >= 3 && email.includes('@')
    }));
});
```

### Async State
```typescript
const dataState = new Signal({
    loading: false,
    data: null,
    error: null
});

async function fetchData() {
    dataState.update(s => ({ ...s, loading: true }));
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        dataState.update(s => ({ ...s, data, loading: false }));
    } catch (error) {
        dataState.update(s => ({ ...s, error, loading: false }));
    }
}
```

### UI State
```typescript
const uiState = new Signal({
    theme: 'light',
    sidebar: 'expanded',
    notifications: []
});

effect(() => {
    document.body.className = `theme-${uiState.value.theme}`;
});
```

## Performance Optimization

### Custom Equality
```typescript
const list = new Signal<number[]>([], {
    equals: (prev, next) => 
        prev.length === next.length && 
        prev.every((val, idx) => val === next[idx])
});
```

### Batching Updates
```typescript
batch(() => {
    for (let i = 0; i < 1000; i++) {
        signal.value = i;
    }
    // Only one update cycle
});
```

### Memory Management
```typescript
// Proper cleanup
const signal = new Signal(0);
const unsubscribe = signal.subscribe(() => {});
// Later...
unsubscribe();
signal.dispose();
```

## Integration Examples

### React Component
```typescript
function Counter() {
    const count = useMemo(() => new Signal(0), []);
    const [, forceUpdate] = useState({});
    
    useEffect(() => {
        const unsubscribe = count.subscribe(() => forceUpdate({}));
        return () => {
            unsubscribe();
            count.dispose();
        };
    }, []);
    
    return (
        <button onClick={() => count.value++}>
            Count: {count.value}
        </button>
    );
}
```

### Vue Component
```typescript
const count = new Signal(0);

export default {
    setup() {
        onUnmounted(() => {
            count.dispose();
        });
        
        return {
            count
        };
    }
};
```

## Testing

```typescript
describe('Signal', () => {
    it('should handle basic operations', () => {
        const signal = new Signal(0);
        expect(signal.value).toBe(0);
        
        signal.value = 1;
        expect(signal.value).toBe(1);
        
        signal.update(n => n + 1);
        expect(signal.value).toBe(2);
    });
    
    it('should handle subscriptions', () => {
        const signal = new Signal(0);
        const mock = jest.fn();
        
        const unsubscribe = signal.subscribe(mock);
        signal.value = 1;
        
        expect(mock).toHaveBeenCalledWith(1);
        unsubscribe();
    });
});
```

Remember: Signals are the foundation of reactive state management. Their proper use ensures efficient updates, clean architecture, and maintainable code. Always handle cleanup appropriately and structure your signals to match your application's needs.
