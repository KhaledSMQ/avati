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



## Changelog

Please see [CHANGELOG](./CHANGELOG.md) for more information what has changed recently.

## Contributing

I welcome contributions from developers of all experience levels. If you have an idea, found a bug, or want to improve something, I encourage you to get involved!

### How to Contribute
1. Read [Contributing Guide](https://github.com/KhaledSMQ/avati/blob/master/Contributing.md) for details on how to get started.
2. Fork the repository and make your changes.
3. Submit a pull request, and we’ll review it as soon as possible.

## License

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/KhaledSMQ/avati/blob/master/LICENSE)

Avati is open-source and distributed under the [MIT License](https://github.com/KhaledSMQ/avati/blob/master/LICENSE).

---
<div align="center">

[![Follow on Twitter](https://img.shields.io/twitter/follow/KhaledSMQ.svg?style=social)](https://x.com/khaledsmq_)
[![Follow on LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue.svg)](https://www.linkedin.com/in/khaledsmq/)
[![Follow on Medium](https://img.shields.io/badge/Medium-Follow-black.svg)](https://medium.com/@khaled.smq)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/KhaledSMQ)
[![Star on GitHub](https://img.shields.io/github/stars/KhaledSMQ/avati.svg?style=social)](https://github.com/KhaledSMQ/avati/stargazers)
[![Follow on GitHub](https://img.shields.io/github/followers/KhaledSMQ.svg?style=social&label=Follow)](https://github.com/KhaledSMQ)

</div>
