# Memoize Function Utility

A robust and efficient TypeScript utility for memoizing functions with support for:

- **Cache Size Limits**: Control the maximum number of cached entries.
- **Time-to-Live (TTL)**: Set expiration time for cached entries.
- **LRU Cache Eviction**: Automatically evict least recently used items when the cache limit is reached.
- **Complex Argument Handling**: Safely memoize functions with complex arguments, including objects with circular references.

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
    - [Basic Memoization](#basic-memoization)
    - [Cache Size Limit](#cache-size-limit)
    - [Time-to-Live (TTL)](#time-to-live-ttl)
    - [Handling Complex Arguments](#handling-complex-arguments)
    - [Preserving `this` Context](#preserving-this-context)
    - [Memoizing Asynchronous Functions](#memoizing-asynchronous-functions)
- [API](#api)
    - [`memoize`](#memoize)
    - [`MemoizeOptions`](#memoizeoptions)
- [Implementation Details](#implementation-details)
    - [LRU Cache](#lru-cache)
    - [Key Generation](#key-generation)
- [Testing](#testing)
- [License](#license)

---

## Installation

You can install this utility via npm:

```bash
npm install @avatijs/memoize
```

---

## Usage

Import the `memoize` function into your project:

```typescript
import { memoize } from '@avatijs/memoize';
```

### Basic Memoization

Memoize a simple function to cache its results:

```typescript
function add(a: number, b: number): number {
  console.log('Computing...');
  return a + b;
}

const memoizedAdd = memoize(add);

console.log(memoizedAdd(1, 2)); // Outputs: Computing... 3
console.log(memoizedAdd(1, 2)); // Outputs: 3 (cached result)
```

### Cache Size Limit

Limit the cache size using the `maxCacheSize` option:

```typescript
const memoizedAddLimited = memoize(add, { maxCacheSize: 2 });

memoizedAddLimited(1, 2); // Cached
memoizedAddLimited(2, 3); // Cached
memoizedAddLimited(3, 4); // Cached, cache size exceeds limit, least recently used item is evicted
```

### Time-to-Live (TTL)

Set a TTL (in milliseconds) after which cached entries expire:

```typescript
const memoizedAddWithTTL = memoize(add, { ttl: 5000 }); // Entries expire after 5 seconds

memoizedAddWithTTL(1, 2); // Cached
setTimeout(() => {
  memoizedAddWithTTL(1, 2); // Recomputed after TTL expires
}, 6000);
```

### Handling Complex Arguments

Memoize functions that accept complex arguments, including objects and arrays:

```typescript
function processData(data: { id: number; value: string }): string {
  console.log('Processing data...');
  return `ID: ${data.id}, Value: ${data.value}`;
}

const memoizedProcessData = memoize(processData);

const data = { id: 1, value: 'Test' };
memoizedProcessData(data); // Outputs: Processing data... 'ID: 1, Value: Test'
memoizedProcessData(data); // Cached result
```

### Preserving `this` Context

Memoize methods that rely on the `this` context:

```typescript
class Multiplier {
  factor = 2;

  multiply = memoize(function (this: Multiplier, x: number) {
    return x * this.factor;
  });
}

const multiplier = new Multiplier();
console.log(multiplier.multiply(5)); // Outputs: 10
```

### Memoizing Asynchronous Functions

Memoize functions that return promises:

```typescript
async function fetchData(url: string): Promise<string> {
  const response = await fetch(url);
  return response.text();
}

const memoizedFetchData = memoize(fetchData);

memoizedFetchData('https://api.example.com/data').then(console.log);
```

---

## API

### `memoize`

Creates a memoized version of a function with optional cache size limit and TTL.

#### Signature

```typescript
function memoize<Args extends any[], Return>(
  fn: (...args: Args) => Return,
  options?: MemoizeOptions
): (...args: Args) => Return;
```

#### Parameters

- `fn`: The function to memoize.
- `options` (optional): An object specifying memoization options.

### `MemoizeOptions`

An interface defining the memoization options.

#### Properties

- `maxCacheSize` (optional): `number`
    - Maximum number of entries to store in the cache.
    - Default: `Infinity`
- `ttl` (optional): `number`
    - Time-to-live in milliseconds for cached entries.
    - Entries expire after `ttl` milliseconds.
    - Default: `undefined` (no expiration)

---

## Implementation Details

### LRU Cache

An internal Least Recently Used (LRU) cache is used to manage cached entries efficiently. When the cache size exceeds `maxCacheSize`, the least recently used item is evicted.

### Key Generation

A robust key generation function handles complex arguments, including:

- **Primitives**: Compared by value.
- **Objects**: Compared by identity using a unique ID assigned via a `WeakMap`.
- **Functions**: Stringified to include their code in the key.
- **Circular References**: Safely handled without causing errors.

---

## Testing

Extensive test cases have been written using Jest to ensure reliability.

### Running Tests
 
Run the tests:

```bash
npx jest
```

### Test Cases Covered

- **Caching Basic Function Calls**
- **Handling Different Arguments**
- **Max Cache Size Limit**
- **Time-to-Live (TTL) Expiration**
- **Complex Arguments and Circular References**
- **Functions with Side Effects**
- **Preservation of `this` Context**
- **Asynchronous Functions**
- **Exception Handling**
- **Non-Serializable Arguments**
- **Zero TTL (No Caching)**
- **Multiple Memoized Functions**

---

## License

This utility is open-source and available under the [MIT License](LICENSE).

---
