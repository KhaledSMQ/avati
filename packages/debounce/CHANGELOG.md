# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

##

## [0.2.0] - 2024-11-23

### Other Changes

-   add demo ([e5f126b](https://github.com/KhaledSMQ/avati/commits/e5f126b))
    Signed-off-by: Khaled Sameer <khaled.smq@hotmail.com>

## 0.2.0 (2024-11-23)

### ⚠ BREAKING CHANGES

-   **core:** add project to npm organization @avatijs and publish batch scheduler

### Features

-   **core:** add dist's ([99ce9b6](https://github.com/KhaledSMQ/avati/commit/99ce9b63cf49707e9498e49c1c49ecbce7592a29))
-   **core:** shipping packages without dist
    folders ([74ea760](https://github.com/KhaledSMQ/avati/commit/74ea760a2e81bf729810a38fcbd194c02cc232fa))
-   **core:** Use shared config for
    webpack ([c99ae12](https://github.com/KhaledSMQ/avati/commit/c99ae1259c6d781e3793aa867d4de1fde38d1e84))
-   **core:** Welcome with ❤️ initial
    commit ([357ab53](https://github.com/KhaledSMQ/avati/commit/357ab53fad46a3b0d4189ea3a5f11e07296eae3c))

### Build System

-   **core:** add project to npm organization [@avatijs](https://github.com/avatijs) and publish batch
    scheduler ([90d5666](https://github.com/KhaledSMQ/avati/commit/90d56667ed3d02548b764cb1d48b42a20214af75))

# Advanced TypeScript Debounce Utility

A highly configurable debounce utility with TypeScript support, providing features like leading/trailing edge execution, cancellation, immediate flush, maximum wait time, and proper Promise handling.

## Features

-   🎯 Configurable leading/trailing edge execution
-   🚫 Cancelable debounced functions
-   ⚡ Immediate flush capability
-   ⏱️ Maximum wait time option
-   🔄 Promise-based return values
-   🎭 AbortController support
-   🐞 Debug mode
-   📝 Comprehensive TypeScript types
-   🧹 Proper cleanup utilities

## Installation

```bash
npm install @your-org/debounce-utility
```

## Basic Usage

```typescript
import { debounce } from '@your-org/debounce-utility';

// Simple debounce
const debouncedFn = debounce(async (x: number) => x * 2, {
    wait: 1000,
});

// Call the debounced function
await debouncedFn(5); // Will execute after 1000ms

// With debug logging
const debuggedFn = debounce(async (x: number) => x * 2, {
    wait: 1000,
    debug: true,
});

// With abort controller
const controller = new AbortController();
const abortableFn = debounce(async (x: number) => x * 2, {
    wait: 1000,
    signal: controller.signal,
});

// Cleanup when done
debouncedFn.cleanup();
```

## API Reference

### `debounce<T>(func: T, options?: DebounceOptions): DebouncedFunction<T>`

Creates a debounced version of the provided function.

#### Parameters

##### `func: T`

The function to debounce. Can be synchronous or asynchronous.

##### `options: DebounceOptions`

Configuration options for the debounced function.

```typescript
interface DebounceOptions {
    readonly wait?: number; // Delay in milliseconds (default: 0)
    readonly leading?: boolean; // Execute on leading edge (default: false)
    readonly trailing?: boolean; // Execute on trailing edge (default: true)
    readonly maxWait?: number; // Maximum time to wait
    readonly debug?: boolean; // Enable debug logging (default: false)
    readonly signal?: AbortSignal; // AbortController signal
}
```

#### Returns

Returns a debounced function with the following interface:

```typescript
interface DebouncedFunction<T> {
    (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>>;
    readonly cancel: () => void;
    readonly flush: (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
    readonly pending: () => boolean;
    readonly cleanup: () => void;
}
```

## Advanced Usage Examples

### Leading Edge Execution

```typescript
const leadingDebounce = debounce((value: string) => console.log(value), {
    wait: 1000,
    leading: true,
    trailing: false,
});

// Executes immediately, then ignores calls for 1000ms
leadingDebounce('First');
leadingDebounce('Second'); // Ignored
leadingDebounce('Third'); // Ignored
```

### Maximum Wait Time

```typescript
const maxWaitDebounce = debounce((value: string) => console.log(value), {
    wait: 1000,
    maxWait: 5000,
});

// Will execute after 5000ms maximum, even if called continuously
const interval = setInterval(() => maxWaitDebounce('test'), 100);
```

### With AbortController

```typescript
const controller = new AbortController();

const abortableDebounce = debounce(
    async (value: string) => {
        await someAsyncOperation(value);
    },
    {
        wait: 1000,
        signal: controller.signal,
    }
);

// Later, abort all pending operations
controller.abort();
```

### Debug Mode

```typescript
const debugDebounce = debounce((value: string) => console.log(value), {
    wait: 1000,
    debug: true,
});

// Will log detailed information about internal state
debugDebounce('test');
```

### Handling Return Values

```typescript
const asyncDebounce = debounce(
    async (x: number): Promise<number> => {
        await delay(100);
        return x * 2;
    },
    { wait: 1000 }
);

// Get the result
const result = await asyncDebounce(5);
console.log(result); // 10
```

### Cleanup

```typescript
const debouncedFn = debounce((x: number) => x * 2, { wait: 1000 });

// Use the function
debouncedFn(5);

// Clean up when done
debouncedFn.cleanup();
```

## Best Practices

1. **Always Clean Up**: Call `cleanup()` when you're done with the debounced function to prevent memory leaks:

```typescript
const debouncedFn = debounce(myFunc, { wait: 1000 });

// When done:
debouncedFn.cleanup();
```

2. **Error Handling**: Always handle potential errors in async operations:

```typescript
const debouncedFn = debounce(async () => {
    try {
        await debouncedOperation();
    } catch (error) {
        // Handle error
    }
});
```

3. **TypeScript Usage**: Leverage TypeScript's type system:

```typescript
interface MyFuncParams {
    id: number;
    name: string;
}

const typedDebounce = debounce((params: MyFuncParams) => console.log(params), { wait: 1000 });

// TypeScript will enforce correct parameter types
typedDebounce({ id: 1, name: 'test' });
```

## Common Gotchas

1. **Memory Leaks**: Not calling `cleanup()` when done can lead to memory leaks.
2. **Shared State**: Be careful with shared state in debounced functions.
3. **Error Handling**: Always handle potential errors in async operations.
4. **Maximum Wait Time**: Setting `maxWait` less than `wait` will throw an error.

## Contributing

Contributions are welcome! Please read our [contributing guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
