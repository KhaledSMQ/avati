# Map Signal

A utility for transforming signal values through a mapping function, creating a new derived signal that automatically updates when the source changes.

## Introduction
Map Signal provides a declarative way to transform signal values. It's perfect for data transformations, formatting, type conversions, and creating derived state that updates automatically with the source signal.

## Features
- Automatic value transformation
- Type-safe mappings
- Custom equality comparison
- Memory efficient
- Automatic dependency tracking
- Lazy evaluation

## Basic Usage

```typescript
import { Signal, map } from '@avatijs/signal';

// Basic transformation
const count = new Signal(5);
const doubled = map(count, n => n * 2);
console.log(doubled.value); // 10

// String formatting
const user = new Signal({ name: 'John', age: 30 });
const userSummary = map(
    user,
    u => `${u.name} is ${u.age} years old`
);
```

## Common Use Cases

### Data Transformation
```typescript
interface ApiUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface UserViewModel {
    id: number;
    fullName: string;
    email: string;
}

const apiUser = new Signal<ApiUser>({
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com'
});

const userViewModel = map(apiUser, user => ({
    id: user.id,
    fullName: `${user.first_name} ${user.last_name}`,
    email: user.email
}));
```

### Number Formatting
```typescript
const price = new Signal(1234.5678);
const formattedPrice = map(price, p => 
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(p)
);
// formattedPrice.value = "$1,234.57"
```

### Array Transformations
```typescript
const numbers = new Signal([1, 2, 3, 4, 5]);
const multipliedByTwo = map(numbers, nums => 
    nums.map(n => n * 2)
);
```

## Best Practices

### Do's ✅

#### 1. Keep Transformations Pure
```typescript
// Good
const transformed = map(signal, value => ({
    ...value,
    computed: value.x + value.y
}));

// Bad
const transformed = map(signal, value => {
    globalState.lastUpdate = Date.now(); // Side effect!
    return value * 2;
});
```

#### 2. Use Type Parameters
```typescript
// Good
const numberToString = map<number, string>(
    numberSignal,
    num => num.toString()
);

// Bad
const converted = map(signal, val => val.toString());
```

#### 3. Implement Custom Equality
```typescript
// Good
const userDisplay = map(
    userSignal,
    user => ({
        id: user.id,
        display: `${user.firstName} ${user.lastName}`
    }),
    {
        equals: (prev, next) => prev.id === next.id
    }
);

// Bad
const userDisplay = map(userSignal, user => ({
    id: user.id,
    display: `${user.firstName} ${user.lastName}`
}));
```

#### 4. Chain Maps Clearly
```typescript
// Good
const step1 = map(source, v => v.toLowerCase());
const step2 = map(step1, v => v.trim());
const final = map(step2, v => v.split(','));

// Bad
const messy = map(map(map(source, 
    v => v.toLowerCase()), 
    v => v.trim()), 
    v => v.split(',')
);
```

### Don'ts ❌

#### 1. Complex Logic in Maps
```typescript
// Bad
const complex = map(signal, value => {
    if (value.type === 'A') {
        return complexCalculationA(value);
    } else if (value.type === 'B') {
        return complexCalculationB(value);
    }
    return defaultCalculation(value);
});

// Good
const processValue = (value: InputType): OutputType => {
    // Complex logic separated into a pure function
    if (value.type === 'A') return complexCalculationA(value);
    if (value.type === 'B') return complexCalculationB(value);
    return defaultCalculation(value);
};

const transformed = map(signal, processValue);
```

#### 2. Side Effects in Maps
```typescript
// Bad
const mapped = map(signal, value => {
    localStorage.setItem('lastValue', value); // Side effect!
    return value * 2;
});

// Good
effect(() => {
    localStorage.setItem('lastValue', signal.value);
});
const mapped = map(signal, value => value * 2);
```

#### 3. Async Transformations
```typescript
// Bad
const asyncMapped = map(signal, async value => {
    const result = await fetchData(value);
    return result;
});

// Good
const mapped = map(signal, value => value);
effect(() => {
    fetchData(mapped.value).then(result => {
        resultSignal.value = result;
    });
});
```

## Advanced Examples

### Complex Object Transformation
```typescript
interface ApiResponse {
    items: Array<{
        id: number;
        attributes: {
            name: string;
            value: number;
        }[];
    }>;
    meta: {
        total: number;
    };
}

interface ViewModel {
    items: Array<{
        id: number;
        name: string;
        value: number;
    }>;
    totalCount: number;
}

const apiData = new Signal<ApiResponse>({
    items: [],
    meta: { total: 0 }
});

const viewModel = map<ApiResponse, ViewModel>(
    apiData,
    data => ({
        items: data.items.map(item => ({
            id: item.id,
            name: item.attributes.find(a => a.name === 'name')?.value || '',
            value: item.attributes.find(a => a.name === 'value')?.value || 0
        })),
        totalCount: data.meta.total
    }),
    {
        equals: (prev, next) => 
            prev.totalCount === next.totalCount &&
            prev.items.length === next.items.length &&
            prev.items.every((item, i) => item.id === next.items[i].id)
    }
);
```

### Formatting Pipeline
```typescript
type DateStyle = 'full' | 'long' | 'medium' | 'short';

const createDateFormatter = (style: DateStyle) => {
    const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: style });
    return (date: Date) => formatter.format(date);
};

const timestamp = new Signal(new Date());

const fullDate = map(timestamp, createDateFormatter('full'));
const shortDate = map(timestamp, createDateFormatter('short'));
const mediumDate = map(timestamp, createDateFormatter('medium'));
```

### Collection Processing
```typescript
interface Item {
    id: number;
    name: string;
    price: number;
}

const items = new Signal<Item[]>([]);

const processedItems = map(
    items,
    items => items
        .filter(item => item.price > 0)
        .sort((a, b) => b.price - a.price)
        .map(item => ({
            ...item,
            formattedPrice: `$${item.price.toFixed(2)}`
        }))
);
```

## Performance Tips
- Keep transformations simple and focused
- Use memoization for expensive calculations
- Implement custom equality for complex objects
- Avoid unnecessary object creation
- Clean up mapped signals when no longer needed

## Testing
```typescript
describe('Map Signal', () => {
    it('should transform values correctly', () => {
        const source = new Signal(5);
        const doubled = map(source, n => n * 2);
        
        expect(doubled.value).toBe(10);
        source.value = 10;
        expect(doubled.value).toBe(20);
    });
    
    it('should handle custom equality', () => {
        const source = new Signal({ id: 1, value: 'test' });
        const mapped = map(
            source,
            data => ({ ...data, processed: true }),
            { equals: (a, b) => a.id === b.id }
        );
        
        expect(mapped.value.processed).toBe(true);
    });
});
```

Remember: Map signals are powerful tools for data transformation and derivation. Keep transformations pure, simple, and focused for maintainable and efficient code.
