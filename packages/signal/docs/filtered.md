# Filtered Signal

A specialized signal that only updates when a predicate condition is met, perfect for conditional state updates and data filtering.

## Introduction
Filtered Signal provides a way to create derived signals that only update when specific conditions are met. This is particularly useful for filtering out unwanted updates, implementing conditional state changes, and managing data transformations based on predicates.

## Features
- Conditional value updates
- Predicate-based filtering
- Type safety
- Custom equality comparison
- Memory efficient
- Automatic cleanup

## Basic Usage

```typescript
import { Signal, filtered } from '@avatijs/signal';

// Create a source signal
const numbers = new Signal(0);

// Create a filtered signal that only accepts even numbers
const evenNumbers = filtered(numbers, n => n % 2 === 0);

numbers.value = 1; // evenNumbers remains 0
numbers.value = 2; // evenNumbers updates to 2
```

## Common Use Cases

### Form Validation
```typescript
interface FormData {
    email: string;
    password: string;
}

const formSignal = new Signal<FormData>({
    email: '',
    password: ''
});

const validForm = filtered(formSignal, form => {
    return form.email.includes('@') && form.password.length >= 8;
});

effect(() => {
    if (validForm.value) {
        console.log('Form is valid:', validForm.value);
    }
});
```

### Numeric Thresholds
```typescript
const temperature = new Signal(20);

const highTemp = filtered(temperature, temp => temp > 25);

effect(() => {
    if (highTemp.value) {
        console.log('High temperature alert:', highTemp.value);
    }
});
```

### Object Filtering
```typescript
interface User {
    id: number;
    status: 'active' | 'inactive';
    lastActive: Date;
}

const userSignal = new Signal<User>({
    id: 1,
    status: 'active',
    lastActive: new Date()
});

const activeUser = filtered(
    userSignal,
    user => user.status === 'active' && 
    user.lastActive > new Date(Date.now() - 24 * 60 * 60 * 1000)
);
```

## Best Practices

### Do's ✅

#### 1. Use Type-Safe Predicates
```typescript
// Good
const positiveNumbers = filtered(numSignal, (n: number): n is number => {
    return n > 0;
});

// Bad
const positiveNumbers = filtered(numSignal, n => n > 0 as any);
```

#### 2. Keep Predicates Pure
```typescript
// Good
const validItems = filtered(items, item => 
    item.value > 0 && item.isEnabled
);

// Bad
const validItems = filtered(items, item => {
    globalState.lastChecked = Date.now(); // Side effect!
    return item.value > 0;
});
```

#### 3. Use with Custom Equality
```typescript
// Good
const filteredUsers = filtered(
    users,
    user => user.age >= 18,
    {
        equals: (prev, next) => 
            prev.id === next.id && 
            prev.lastModified === next.lastModified
    }
);

// Bad
const filteredUsers = filtered(users, user => user.age >= 18);
```

#### 4. Clear and Focused Conditions
```typescript
// Good
const isAdult = (user: User) => user.age >= 18;
const isVerified = (user: User) => user.verified;
const eligibleUsers = filtered(users, user => 
    isAdult(user) && isVerified(user)
);

// Bad
const eligibleUsers = filtered(users, user => {
    // Complex, hard to read condition
    return user.age >= 18 && user.verified && 
           user.lastLogin > Date.now() - 7*24*60*60*1000;
});
```

### Don'ts ❌

#### 1. Async Predicates
```typescript
// Bad
const validUsers = filtered(users, async user => {
    const response = await checkUserStatus(user);
    return response.isValid;
});

// Good
effect(() => {
    const user = users.value;
    checkUserStatus(user).then(response => {
        validationResult.value = response.isValid;
    });
});
```

#### 2. Heavy Computations in Predicates
```typescript
// Bad
const filteredData = filtered(dataSignal, item => {
    return expensiveComputation(item); // Heavy computation
});

// Good
const processedData = computed(() => expensiveComputation(dataSignal.value));
const filteredData = filtered(processedData, item => item.isValid);
```

#### 3. Mutable State in Predicates
```typescript
// Bad
let threshold = 10;
const validValues = filtered(values, v => v > threshold);

// Good
const thresholdSignal = new Signal(10);
const validValues = computed(() => {
    const threshold = thresholdSignal.value;
    return filtered(values, v => v > threshold);
});
```

## Advanced Examples

### Chaining Filters
```typescript
const numbers = new Signal<number[]>([1, 2, 3, 4, 5]);

const evenNumbers = filtered(numbers, n => n % 2 === 0);
const evenGreaterThanTwo = filtered(evenNumbers, n => n > 2);
```

### Complex Object Filtering
```typescript
interface Transaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    timestamp: Date;
}

const transactions = new Signal<Transaction[]>([]);

const recentCredits = filtered(
    transactions,
    (tx) => 
        tx.type === 'credit' && 
        tx.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    {
        equals: (prev, next) => 
            prev.length === next.length &&
            prev.every((tx, i) => tx.id === next[i].id)
    }
);
```

### UI State Filtering
```typescript
interface UIState {
    isLoading: boolean;
    error: Error | null;
    data: any;
}

const uiState = new Signal<UIState>({
    isLoading: false,
    error: null,
    data: null
});

const errorState = filtered(
    uiState,
    state => state.error !== null
);

const loadingState = filtered(
    uiState,
    state => state.isLoading
);

effect(() => {
    if (errorState.value) {
        showErrorNotification(errorState.value.error);
    }
});
```

## Performance Considerations
- Keep predicates simple and efficient
- Avoid expensive computations in predicates
- Use appropriate equality comparisons
- Consider batching updates when filtering multiple values
- Clean up filtered signals when no longer needed

## Testing
```typescript
describe('Filtered Signal', () => {
    it('should only update when predicate is true', () => {
        const source = new Signal(0);
        const filtered = filtered(source, n => n > 0);
        
        source.value = -1;
        expect(filtered.value).toBe(0);
        
        source.value = 2;
        expect(filtered.value).toBe(2);
    });
});
```

Remember: Filtered signals are powerful tools for managing conditional state updates. Use them to create clean, maintainable code by clearly expressing your update conditions and keeping your predicates simple and focused.
