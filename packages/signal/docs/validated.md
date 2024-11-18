# Validated Signal

A specialized signal that enforces validation rules on value updates, ensuring data integrity and type safety.

## Introduction
Validated Signal extends the base Signal functionality by adding validation capabilities. It prevents invalid state updates by running validation checks before any value changes, making it perfect for form handling, data validation, and maintaining data integrity.

## Features
- Custom validation rules
- Error messages
- Type safety
- Proxy-based validation
- Sync validation
- Custom equality comparison

## Basic Usage

```typescript
import { validated } from '@avati/signal';

// Simple number validation
const positiveNumber = validated(1, 
    value => value > 0 || "Value must be positive"
);

// Update value - valid
positiveNumber.value = 5; // Works

// Update value - invalid
try {
    positiveNumber.value = -1;
} catch (error) {
    console.error(error.message); // "Value must be positive"
}
```

## Common Use Cases

### Form Validation
```typescript
interface UserForm {
    username: string;
    email: string;
    age: number;
}

const userForm = validated<UserForm>(
    {
        username: '',
        email: '',
        age: 0
    },
    value => {
        if (value.username.length < 3) 
            return "Username must be at least 3 characters";
        if (!value.email.includes('@')) 
            return "Invalid email format";
        if (value.age < 18) 
            return "Must be 18 or older";
        return true;
    }
);
```

### Complex Object Validation
```typescript
interface Config {
    apiKey: string;
    maxRetries: number;
    timeout: number;
}

const configSignal = validated<Config>(
    {
        apiKey: '',
        maxRetries: 3,
        timeout: 5000
    },
    value => {
        if (!value.apiKey) return "API key is required";
        if (value.maxRetries < 1) return "At least one retry required";
        if (value.timeout < 1000) return "Timeout must be at least 1000ms";
        return true;
    },
    {
        equals: (prev, next) => 
            prev.apiKey === next.apiKey &&
            prev.maxRetries === next.maxRetries &&
            prev.timeout === next.timeout
    }
);
```

## Best Practices

### Do's ✅

#### 1. Clear Validation Messages
```typescript
// Good
const age = validated(
    0,
    value => value >= 0 || "Age cannot be negative"
);

// Bad
const age = validated(
    0,
    value => value >= 0 || "Invalid"
);
```

#### 2. Separate Complex Validation Logic
```typescript
// Good
function validateUser(user: User) {
    if (!user.name) return "Name is required";
    if (user.age < 18) return "Must be 18+";
    if (!isValidEmail(user.email)) return "Invalid email";
    return true;
}

const userSignal = validated(initialUser, validateUser);

// Bad
const userSignal = validated(initialUser, user => {
    // Complex inline validation
    return user.name && user.age >= 18 && user.email.includes('@');
});
```

#### 3. Type-Safe Validation
```typescript
// Good
interface User {
    name: string;
    age: number;
}

const userSignal = validated<User>(
    { name: '', age: 0 },
    (user): user is User => {
        return typeof user.name === 'string' && 
               typeof user.age === 'number';
    }
);
```

### Don'ts ❌

#### 1. Async Validation
```typescript
// Bad - Validators must be synchronous
const userSignal = validated(user, async value => {
    const isValid = await validateUser(value);
    return isValid;
});

// Good - Handle async validation separately
const userSignal = validated(user, value => {
    return validateUserSync(value);
});
```

#### 2. Side Effects in Validators
```typescript
// Bad
const signal = validated(value, value => {
    saveToDatabase(value); // Side effect!
    return true;
});

// Good
const signal = validated(value, value => {
    return validateValue(value);
});
```

#### 3. Nested Validated Signals
```typescript
// Bad
const nestedSignal = validated({
    inner: validated(0, v => v > 0)
}, value => true);

// Good
const innerValidation = (v: number) => v > 0;
const outerValidation = (obj: { value: number }) => {
    return innerValidation(obj.value);
};
```

## Advanced Examples

### Composite Validation
```typescript
type ValidationRule<T> = (value: T) => boolean | string;

function composeValidators<T>(...validators: ValidationRule<T>[]): ValidationRule<T> {
    return (value: T) => {
        for (const validator of validators) {
            const result = validator(value);
            if (result !== true) return result;
        }
        return true;
    }
}

const numberSignal = validated(
    0,
    composeValidators(
        v => v >= 0 || "Must be positive",
        v => v <= 100 || "Must be <= 100",
        v => Number.isInteger(v) || "Must be integer"
    )
);
```

### Form Field Validation
```typescript
interface FieldState<T> {
    value: T;
    touched: boolean;
}

function createField<T>(
    initial: T,
    validator: (value: T) => boolean | string
) {
    return validated<FieldState<T>>(
        { value: initial, touched: false },
        state => {
            if (!state.touched) return true;
            return validator(state.value);
        }
    );
}

const emailField = createField('', email => 
    email.includes('@') || "Invalid email");
```

## Testing
```typescript
describe('Validated Signal', () => {
    it('should validate initial value', () => {
        expect(() => {
            validated(-1, v => v >= 0 || "Must be positive");
        }).toThrow("Must be positive");
    });

    it('should validate updates', () => {
        const signal = validated(1, v => v > 0 || "Must be positive");
        
        expect(() => {
            signal.value = -1;
        }).toThrow("Must be positive");
        
        expect(() => {
            signal.value = 5;
        }).not.toThrow();
    });
});
```

Remember: Validated signals provide robust data validation but should be used judiciously. Keep validation logic simple, pure, and synchronous. Use clear error messages and handle validation errors appropriately in your application.
