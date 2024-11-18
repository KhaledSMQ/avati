# Persisted Signal

A signal implementation that persists its value using various storage providers (localStorage, sessionStorage, or in-memory storage) with automatic synchronization.

## Introduction
Persisted Signal extends the base Signal functionality by adding persistence capabilities through storage providers. Perfect for maintaining state across page refreshes, user preferences, and application data that needs to survive browser sessions.

## Features
- Multiple storage providers (Local, Session, Memory)
- Automatic persistence
- Reload and clear functionality
- Type safety
- Error handling
- Memory efficiency

## Core Storage Providers

```typescript
// LocalStorage - persists across browser sessions
const localData = persisted('key', initialValue, new LocalStorageProvider());

// SessionStorage - persists during browser session
const sessionData = persisted('key', initialValue, new SessionStorageProvider());

// Memory Storage - persists only during runtime
const memoryData = persisted('key', initialValue, new MemoryStorageProvider());
```

## Basic Usage

```typescript
import { persisted, LocalStorageProvider } from '@avati/signal';

// Create a persisted signal
const theme = persisted(
    'app:theme', 
    'light',
    new LocalStorageProvider()
);

// Update value (automatically persists)
theme.value = 'dark';

// Reload from storage
theme.reload();

// Clear storage
theme.clear();

// Cleanup
theme.dispose();
```

## Advanced Usage

### With Complex Objects
```typescript
interface UserPreferences {
    theme: 'light' | 'dark';
    fontSize: number;
}

const preferences = persisted<UserPreferences>(
    'app:preferences',
    {
        theme: 'light',
        fontSize: 16
    },
    new LocalStorageProvider<UserPreferences>()
);
```

### With Custom Options
```typescript
const settings = persisted(
    'app:settings',
    defaultSettings,
    new LocalStorageProvider(),
    {
        equals: (prev, next) => prev.version === next.version,
        name: 'SettingsSignal'
    }
);
```

## Best Practices

### Do's ✅

#### 1. Use Proper Key Namespacing
```typescript
// Good
const userPrefs = persisted('app:user:prefs', defaultPrefs, storage);
const appState = persisted('app:state:v1', initialState, storage);

// Bad
const prefs = persisted('prefs', defaultPrefs, storage);
```

#### 2. Handle Storage State
```typescript
// Good
try {
    preferences.reload();
} catch (error) {
    if (error instanceof SignalDisposedError) {
        // Handle disposed signal
    }
    // Fallback to defaults
    preferences.value = defaultPreferences;
}
```

#### 3. Cleanup Resources
```typescript
// Good
const settings = persisted('settings', defaults, storage);
// When done
settings.clear();
settings.dispose();
```

### Don'ts ❌

#### 1. Store Sensitive Data
```typescript
// Bad
const userData = persisted('user', {
    password: 'secret', // Never store sensitive data
}, storage);

// Good
const userPrefs = persisted('user', {
    theme: 'dark',
    language: 'en'
}, storage);
```

#### 2. Ignore Disposal State
```typescript
// Bad
settings.value = newValue; // Might throw if disposed

// Good
if (!settings.isDisposed()) {
    settings.value = newValue;
}
```

#### 3. Mix Storage Types
```typescript
// Bad - inconsistent storage usage
const temp1 = persisted('data', value, new LocalStorageProvider());
const temp2 = persisted('data', value, new SessionStorageProvider());

// Good - consistent storage strategy
const persistent = persisted('data', value, new LocalStorageProvider());
const session = persisted('temp:data', value, new SessionStorageProvider());
```

## API Reference

### Class: Persisted<T>
Extends `Signal<T>` with persistence capabilities.

#### Methods
- `value: T` - Get or set the current value
- `reload(): void` - Reload value from storage
- `clear(): void` - Remove value from storage
- `dispose(): void` - Cleanup resources
- `isDisposed(): boolean` - Check disposal state
- `update(fn: (current: T) => T): void` - Update value using function

### Interface: StorageProvider<T>
```typescript
interface StorageProvider<T> {
    getItem(key: string): T | null;
    setItem(key: string, value: T): void;
    removeItem(key: string): void;
}
```

## Testing

```typescript
describe('Persisted Signal', () => {
    const storage = new MemoryStorageProvider<string>();
    
    it('should persist values', () => {
        const signal = persisted('test', 'initial', storage);
        signal.value = 'updated';
        
        const newSignal = persisted('test', 'initial', storage);
        expect(newSignal.value).toBe('updated');
    });
    
    it('should handle disposal', () => {
        const signal = persisted('test', 'value', storage);
        signal.dispose();
        
        expect(() => signal.value).toThrow(SignalDisposedError);
        expect(storage.getItem('test')).toBeNull();
    });
});
```

Remember: Persisted signals provide robust storage management but require careful consideration of storage keys, cleanup, and error handling. Always use appropriate storage providers based on your persistence needs and handle disposal states properly.
