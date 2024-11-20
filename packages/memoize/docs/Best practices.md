# Best Practices for @avatijs/memoize

## ✅ Do

```typescript
// Memoize pure functions
const calculateTotal = memoize(
  (items) => items.reduce((sum, item) => sum + item.price, 0)
);

// Use with expensive computations
const processLargeData = memoize(
  (data) => data.map(complexTransformation),
  { maxCacheSize: 100 }
);

// Set appropriate cache sizes
const userProfile = memoize(
  (id) => fetchUserData(id),
  { maxCacheSize: 1000 }
);

// Use TTL for time-sensitive data
const fetchPrices = memoize(
  (symbol) => api.getPrices(symbol),
  { ttl: 60000 } // 1 minute
);

// Memoize component props processing
const processProps = memoize(
  (props) => transformProps(props),
  { maxCacheSize: 50 }
);
```

## ❌ Don't

```typescript
// Don't memoize functions with side effects
const badExample = memoize(
  (user) => {
    database.save(user);  // Side effect!
    return user;
  }
);

// Don't memoize date-dependent functions without TTL
const wrongDateUsage = memoize(
  () => new Date()  // Will always return first cached date
);

// Don't use with rapidly changing data without maxCacheSize
const memoryLeak = memoize(
  (data) => process(data)
  // Missing maxCacheSize with frequently changing data
);

// Don't memoize simple operations
const unnecessary = memoize(
  (a, b) => a + b  // Too simple to benefit from memoization
);

// Don't use with unpredictable arguments
const unpredictable = memoize(
  (obj) => obj.value,
  // Object references change on each render
);
```

## Common Pitfalls

1. Memoizing functions that use external state
2. Not setting TTL for time-sensitive data
3. Using without maxCacheSize in memory-constrained environments
4. Memoizing functions with random or unique outputs
5. Using with mutable arguments without proper key generation

## Performance Considerations

- Set appropriate maxCacheSize based on memory constraints
- Use TTL for data that becomes stale
- Consider argument serialization cost
- Monitor cache hit rates
- Clear cache when memory pressure is high
