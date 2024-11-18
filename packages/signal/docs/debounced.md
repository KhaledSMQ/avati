# Debounced Signal

A signal that delays updating its value until the source signal has stopped changing for a specified period.

## Usage

```typescript
import { Signal, debounced } from './signals';

// Create source signal
const input = new Signal("");
const debouncedInput = debounced(input, 300);

// Rapid updates
input.value = "h";    // t=0ms
input.value = "he";   // t=100ms
input.value = "hel";  // t=200ms
input.value = "hell"; // t=250ms

// debouncedInput.value will be "hell" at t=550ms
```

## Common Use Cases

### Search Input
```typescript
const searchQuery = new Signal("");
const debouncedSearch = debounced(searchQuery, 500);

effect(() => {
    // API call only happens 500ms after last keystroke
    fetchSearchResults(debouncedSearch.value);
});
```

### Form Validation
```typescript
const formData = new Signal({ username: "", email: "" });
const debouncedForm = debounced(formData, 400, {
    equals: (a, b) => a.username === b.username && a.email === b.email
});

effect(() => {
    // Validation runs 400ms after user stops typing
    validateForm(debouncedForm.value);
});
```

## Best Practices
- Choose appropriate delay times (300-500ms for typing)
- Use with high-frequency updates
- Clear timeouts on cleanup
- Implement custom equality for objects

## What to Avoid
- Too short delays (<100ms)
- Using with infrequent updates
- Chaining multiple debounced signals
- Debouncing time-critical operations

## API

```typescript
function debounced<T>(
    source: Signal<T>,
    delay: number,
    options?: SignalOptions<T>
): Signal<T>
```
