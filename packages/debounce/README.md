# TypeScript Debounce

[![npm version](https://badge.fury.io/js/@avatijs%2Fdebounce.svg)](https://badge.fury.io/js/@avatijs%2Fdebounce)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/npm/l/@avatijs%2Fdebounce.svg)](https://github.com/KhaledSMQ/avati/blob/master/LICENSE)

## Introduction

TypeScript Debounce is an elegant, robust debounce utility that brings the power of controlled function execution to your TypeScript applications. It provides a clean, type-safe API for managing function call rates, preventing resource overuse, and improving application performance.

### 🌟 Why Another Debounce Library?

While there are many debounce implementations available, this library stands out by offering:

- **Full TypeScript Support**: Built from the ground up with TypeScript, providing complete type safety and excellent IDE integration
- **Promise-Based API**: Modern async/await support with proper error handling
- **Configurable Execution**: Control both leading and trailing edge execution
- **Resource Management**: Built-in cleanup and cancellation support
- **Debug Support**: Comprehensive logging for development troubleshooting
- **Maximum Wait Time**: Guarantee execution for long-running debounce periods
- **Zero Dependencies**: Lightweight and self-contained

## 🎯 When You Need This

Debouncing is crucial in many common development scenarios:

1. **Search Input Handling**
   ```typescript
   // Without debounce - Makes API call on every keystroke
   searchInput.addEventListener('input', async (e) => {
       const results = await searchAPI(e.target.value); // 🔴 Excessive API calls
   });

   // With debounce - Waits for user to stop typing
   const debouncedSearch = debounce(async (value: string) => {
       const results = await searchAPI(value);
   }, { wait: 300 }); // ✅ Single API call after typing stops
   ```

2. **Window Resize Handling**
   ```typescript
   // Without debounce - Recalculates layout on every resize event
   window.addEventListener('resize', () => {
       recalculateLayout(); // 🔴 Performance bottleneck
   });

   // With debounce - Controlled recalculation
   const debouncedResize = debounce(() => {
       recalculateLayout();
   }, { wait: 150 }); // ✅ Smooth performance
   ```

3. **Form Validation**
   ```typescript
   // Without debounce - Validates on every change
   input.addEventListener('input', async (e) => {
       await validateField(e.target.value); // 🔴 Excessive validation
   });

   // With debounce - Validates after user stops typing
   const debouncedValidate = debounce(async (value: string) => {
       await validateField(value);
   }, { wait: 400 }); // ✅ Efficient validation
   ```

4. **Real-time Saving**
   ```typescript
   // Without debounce - Saves on every change
   editor.on('change', async (content) => {
       await saveContent(content); // 🔴 Too many save operations
   });

   // With debounce - Intelligently batches saves
   const debouncedSave = debounce(async (content: string) => {
       await saveContent(content);
   }, { wait: 1000 }); // ✅ Optimized saving
   ```

## 🚀 Installation

```bash
npm install typescript-debounce
# or
yarn add typescript-debounce
# or
pnpm add typescript-debounce
```

## 📘 Quick Start

```typescript
import { debounce } from '@avatijs/debounce';

// Create a debounced function
const debouncedFn = debounce(async (value: string) => {
    const result = await api.search(value);
    updateUI(result);
}, {
    wait: 300,                // Wait 300ms after last call
    leading: false,           // Don't execute on leading edge
    trailing: true,           // Execute on trailing edge
    maxWait: 1000,           // Maximum time to wait
    debug: true,             // Enable debug logging
    onError: console.error    // Error handling
});

// Use the debounced function
try {
    await debouncedFn('search term');
} catch (error) {
    handleError(error);
}
```

## Features

- **Type Safety**: Full TypeScript support with intelligent type inference
- **Promise Support**: Built-in handling of async functions
- **Cancellation**: Support for AbortController and manual cancellation
- **Maximum Wait**: Configure maximum delay before forced execution
- **Edge Control**: Configure execution on leading and/or trailing edge
- **Debug Mode**: Comprehensive logging for development
- **Error Handling**: Robust error handling with custom callbacks
- **Resource Management**: Automatic cleanup of resources
- **Memory Efficient**: Proper cleanup and memory management

## Documentation

For detailed usage instructions and best practices, see our comprehensive guides:

- [Debounce Utility Best Practices Guide](./docs/best-practices.md)
- [API Documentation](./docs/api.md)
- [Examples](./docs/examples.md)
- [Migration Guide](./docs/migration.md)

## Contributing

We appreciate all contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.
 
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
