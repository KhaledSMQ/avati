# Debounce Utility Best Practices Guide

## Introduction

The debounce utility helps control the rate at which a function executes by delaying its execution until after a specified period of inactivity. This guide covers best practices for using the debounce utility effectively and safely in your applications.

## Basic Usage

### Simple Debouncing

```typescript
const debouncedFn = debounce(async (value: string) => {
    await searchAPI(value);
}, { wait: 300 });

// Use in event handlers
searchInput.addEventListener('input', (e) => {
    debouncedFn(e.target.value);
});
```

### Configuration Best Practices

```typescript
const debouncedFn = debounce(myFunction, {
    wait: 300,                    // Reasonable default for UI interactions
    leading: false,               // Default - prevents initial trigger
    trailing: true,               // Default - ensures final call executes
    debug: process.env.NODE_ENV !== 'production',  // Enable logging in development
    onError: (error) => {
        console.error('Debounced function error:', error);
        // Add error reporting
    }
});
```

## Advanced Usage Patterns

### 1. Cleanup Resources

Always clean up debounced functions when they're no longer needed:

```typescript
useEffect(() => {
    const debouncedFn = debounce(handleSearch, { wait: 300 });
    
    return () => {
        debouncedFn.cleanup(); // Cleanup on component unmount
    };
}, []);
```

### 2. Handling Promises

Wait for results properly:

```typescript
try {
    const result = await debouncedFn(value);
    // Handle success
} catch (error) {
    // Handle error
}
```

### 3. Using AbortController

Implement cancellation support:

```typescript
const abortController = new AbortController();

const debouncedFn = debounce(fetchData, {
    wait: 500,
    signal: abortController.signal
});

// Cancel when needed
abortController.abort();
```

## Common Patterns and Use Cases

### 1. Search Input Handling

```typescript
const debouncedSearch = debounce(async (query: string) => {
    const results = await searchAPI(query);
    updateResults(results);
}, {
    wait: 300,
    leading: false,
    trailing: true
});
```

### 2. Window Resize Handling

```typescript
const debouncedResize = debounce(() => {
    recalculateLayout();
}, {
    wait: 150,
    leading: true,  // Initial response for better UX
    maxWait: 500    // Ensure updates during continuous resize
});
```

### 3. Form Validation

```typescript
const debouncedValidate = debounce(async (value: string) => {
    const isValid = await validateField(value);
    updateValidationState(isValid);
}, {
    wait: 400,
    trailing: true
});
```

## Performance Considerations

1. **Choose Appropriate Wait Times**
    - UI feedback: 150-300ms
    - API calls: 300-500ms
    - Heavy computations: 500-1000ms

2. **Use MaxWait for Time-Sensitive Operations**
   ```typescript
   const debouncedFn = debounce(heavyOperation, {
       wait: 300,
       maxWait: 1000  // Ensure execution at least every second
   });
   ```

3. **Memory Management**
    - Always call `cleanup()` when the debounced function is no longer needed
    - Use AbortController for cancellable operations
    - Clear references in cleanup functions

## Error Handling Best Practices

1. **Implement Error Handlers**
   ```typescript
   const debouncedFn = debounce(riskyOperation, {
       wait: 300,
       onError: (error) => {
           logError(error);
           showUserFeedback(error.message);
           // Optionally retry or recover
       }
   });
   ```

2. **Promise Chain Handling**
   ```typescript
   try {
       await debouncedFn(data);
   } catch (error) {
       // Handle both debounce cancellation and function errors
       if (error.message === 'Debounced function cancelled') {
           // Handle cancellation
       } else {
           // Handle other errors
       }
   }
   ```

## Testing Considerations

1. **Mock Timers**
   ```typescript
   jest.useFakeTimers();
   
   test('debounced function', async () => {
       const fn = jest.fn();
       const debouncedFn = debounce(fn, { wait: 100 });
       
       debouncedFn();
       jest.advanceTimersByTime(100);
       
       expect(fn).toHaveBeenCalledTimes(1);
   });
   ```

2. **Test Cancellation**
   ```typescript
   test('cancellation', async () => {
       const debouncedFn = debounce(myFunction, { wait: 100 });
       
       const promise = debouncedFn();
       debouncedFn.cancel();
       
       await expect(promise).rejects.toThrow('Debounced function cancelled');
   });
   ```

## Common Pitfalls to Avoid

1. **Don't Recreate Debounced Functions Unnecessarily**
   ```typescript
   // ❌ Bad - creates new debounced function on every render
   render(){
       const debouncedFn = debounce(handleChange, { wait: 300 });
   }
   
   // ✅ Good - create once and reuse
   const debouncedFn = useMemo(() => 
       debounce(handleChange, { wait: 300 }),
       [handleChange]
   );
   ```

2. **Don't Ignore Cleanup**
   ```typescript
   // ❌ Bad - memory leak
   useEffect(() => {
       const debouncedFn = debounce(handleChange, { wait: 300 });
   }, []);
   
   // ✅ Good - proper cleanup
   useEffect(() => {
       const debouncedFn = debounce(handleChange, { wait: 300 });
       return () => debouncedFn.cleanup();
   }, []);
   ```

3. **Don't Ignore Promise Handling**
   ```typescript
   // ❌ Bad - unhandled promises
   debouncedFn(value);
   
   // ✅ Good - proper promise handling
   try {
       await debouncedFn(value);
   } catch (error) {
       handleError(error);
   }
   ```

## Debugging Tips

1. Enable debug logging in development:
   ```typescript
   const debouncedFn = debounce(myFunction, {
       wait: 300,
       debug: true  // Enables detailed logging
   });
   ```

2. Use `pending()` to check status:
   ```typescript
   if (debouncedFn.pending()) {
       console.log('Function execution pending');
   }
   ```

3. Monitor execution with `flush()`:
   ```typescript
   // Force immediate execution
   await debouncedFn.flush();
   ```
