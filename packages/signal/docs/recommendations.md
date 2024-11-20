# Import Recommendations

## ✅ Recommended: Individual Imports

Import only what you need from specific modules:

```typescript
// ✅ Good: Import specific features from individual modules
import { Signal, createSignal } from "@avatijs/signal/core";
import { computed } from "@avatijs/signal/computed";
import { AsyncSignal } from "@avatijs/signal/async";
import { persisted } from "@avatijs/signal/persistence";
```

Benefits:
- Smaller bundle size through better tree-shaking
- Better code splitting
- Faster application startup
- Better development experience with explicit dependencies

## 🚫 Not Recommended: Full Package Import

Avoid importing everything from the main entry point:

```typescript
// 🚫 Bad: Imports entire package
import { Signal, computed, AsyncSignal, persisted } from "@avatijs/signal";
```

Issues:
- Larger bundle size
- Includes unused code
- Reduces tree-shaking effectiveness
- Slower application startup

## 📦 Available Import Paths

| Import Path | Features | Bundle Size |
|------------|----------|-------------|
| `@avatijs/signal/core` | `Signal`, `createSignal`, `batch`, `effect` | ~20KB |
| `@avatijs/signal/computed` | `computed`, `combine` | ~15KB |
| `@avatijs/signal/async` | `AsyncSignal`, `QueueSignal` | ~15KB |
| `@avatijs/signal/persistence` | `persisted`, `withHistory` | ~12KB |
| `@avatijs/signal/extensions` | `debounced`, `throttled`, `filtered`, etc. | ~15KB |
| `@avatijs/signal/debug` | Development utilities | ~8KB |

## 🔍 Framework-Specific Recommendations

### Next.js
```typescript
// pages/your-page.tsx
import { Signal } from "@avatijs/signal/core";
import { computed } from "@avatijs/signal/computed";

// Add to next.config.js for local development
const nextConfig = {
  transpilePackages: ['@avatijs/signal']
};
```

### React
```typescript
// Your component
import { Signal } from "@avatijs/signal/core";
import { effect } from "@avatijs/signal/core";
```

### Vite
```typescript
// Your component
import { Signal } from "@avatijs/signal/core";
import { computed } from "@avatijs/signal/computed";
```

## 🚀 Performance Tips

1. **Import Granularity**
   ```typescript
   // ✅ Good: Granular imports for better tree-shaking
   import { Signal } from "@avatijs/signal/core";
   import { computed } from "@avatijs/signal/computed";

   // 🚫 Bad: Importing multiple features from main entry
   import { Signal, computed } from "@avatijs/signal";
   ```

2. **Development Tools**
   ```typescript
   // ✅ Good: Import debug tools only in development
   if (process.env.NODE_ENV === 'development') {
     const { debug } = await import('@avatijs/signal/debug');
   }
   ```

3. **Dynamic Imports**
   ```typescript
   // ✅ Good: Dynamically import features when needed
   const { withHistory } = await import('@avatijs/signal/persistence');
   ```

4. **Optimizing for Production**
   ```typescript
   // ✅ Good: Import only what you use
   import { Signal } from "@avatijs/signal/core";
   
   // ✅ Good: Code-split heavy features
   const loadAsyncFeatures = async () => {
     const { AsyncSignal } = await import('@avatijs/signal/async');
   };
   ```

## 📊 Bundle Size Comparison

```typescript
// Full import: ~80KB
import { Signal, computed, AsyncSignal } from "@avatijs/signal";

// Individual imports: ~35KB combined
import { Signal } from "@avatijs/signal/core"; // 20KB
import { computed } from "@avatijs/signal/computed"; // 15KB
```

By following these import recommendations, you can significantly reduce your application's bundle size and improve performance. Use the appropriate import strategy based on your application's needs and performance requirements.
