# Framework Integration Guide

## Table of Contents
- [Next.js Integration](#nextjs-integration)
- [React Integration](#react-integration)
- [Vue Integration](#vue-integration)
- [Angular Integration](#angular-integration)
- [Common Pitfalls](#common-pitfalls)

## Next.js Integration

### Installation
```bash
npm install @avatijs/signal
# or
yarn add @avatijs/signal
# or
pnpm add @avatijs/signal
```

### Configuration
Add the following to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required when using npm link or local packages
  transpilePackages: ['@avatijs/signal'],
}

module.exports = nextConfig
```

### Usage with App Router
```typescript
// app/components/counter.tsx
'use client';

import { Signal } from "@avatijs/signal/core";
import { computed } from "@avatijs/signal/computed";

const count = new Signal(0);
const doubled = computed(() => count.value * 2);

export default function Counter() {
  return (
    <div>
      <p>Count: {count.value}</p>
      <p>Doubled: {doubled.value}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  );
}
```

### Usage with Pages Router
```typescript
// pages/counter.tsx
import { useEffect } from 'react';
import { Signal } from "@avatijs/signal/core";
import { effect } from "@avatijs/signal/core";

export default function CounterPage() {
  useEffect(() => {
    const count = new Signal(0);
    const cleanup = effect(() => {
      console.log(`Count changed: ${count.value}`);
    });

    return () => cleanup();
  }, []);

  // ...
}
```

## React Integration

### Basic Usage
```typescript
import { Signal } from "@avatijs/signal/core";
import { effect } from "@avatijs/signal/core";
import { useEffect, useState } from "react";

function useSignal<T>(signal: Signal<T>): [T, (value: T) => void] {
  const [value, setValue] = useState(signal.value);

  useEffect(() => {
    const cleanup = effect(() => {
      setValue(signal.value);
    });

    return () => cleanup();
  }, [signal]);

  return [value, (newValue: T) => { signal.value = newValue }];
}

// Usage in component
function Counter() {
  const countSignal = new Signal(0);
  const [count, setCount] = useSignal(countSignal);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### With Context
```typescript
// contexts/SignalContext.tsx
import { createContext, useContext } from 'react';
import { Signal } from "@avatijs/signal/core";

const SignalContext = createContext<Signal<number>>(new Signal(0));

export function SignalProvider({ children }) {
  const countSignal = new Signal(0);
  return (
    <SignalContext.Provider value={countSignal}>
      {children}
    </SignalContext.Provider>
  );
}

export function useCountSignal() {
  return useContext(SignalContext);
}
```

## Vue Integration

### Vue 3 Setup
```typescript
// composables/useSignal.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { Signal } from "@avatijs/signal/core";
import { effect } from "@avatijs/signal/core";

export function useSignal<T>(signal: Signal<T>) {
  const value = ref(signal.value);

  let cleanup: (() => void) | undefined;

  onMounted(() => {
    cleanup = effect(() => {
      value.value = signal.value;
    });
  });

  onUnmounted(() => {
    cleanup?.();
  });

  return {
    value,
    setValue: (newValue: T) => { signal.value = newValue }
  };
}

// Component usage
<script setup lang="ts">
import { useSignal } from '../composables/useSignal';
import { Signal } from "@avatijs/signal/core";

const countSignal = new Signal(0);
const { value: count, setValue: setCount } = useSignal(countSignal);
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="setCount(count + 1)">Increment</button>
  </div>
</template>
```

### Vue 2 Integration
```typescript
import { Signal } from "@avatijs/signal/core";
import { effect } from "@avatijs/signal/core";

export default {
  data() {
    return {
      count: 0
    };
  },
  created() {
    this.countSignal = new Signal(0);
    this.cleanup = effect(() => {
      this.count = this.countSignal.value;
    });
  },
  beforeDestroy() {
    this.cleanup?.();
  }
};
```

## Angular Integration

### Setting up the Service
```typescript
// services/signal.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { Signal } from "@avatijs/signal/core";
import { effect } from "@avatijs/signal/core";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalService implements OnDestroy {
  private countSignal = new Signal(0);
  private cleanup: (() => void) | undefined;
  
  // Expose as Observable for Angular integration
  private countSubject = new BehaviorSubject<number>(0);
  public count$ = this.countSubject.asObservable();

  constructor() {
    this.cleanup = effect(() => {
      this.countSubject.next(this.countSignal.value);
    });
  }

  increment() {
    this.countSignal.value++;
  }

  ngOnDestroy() {
    this.cleanup?.();
  }
}
```

### Component Usage
```typescript
// components/counter.component.ts
import { Component } from '@angular/core';
import { SignalService } from '../services/signal.service';

@Component({
  selector: 'app-counter',
  template: `
    <div>
      <p>Count: {{ count$ | async }}</p>
      <button (click)="increment()">Increment</button>
    </div>
  `
})
export class CounterComponent {
  count$ = this.signalService.count$;

  constructor(private signalService: SignalService) {}

  increment() {
    this.signalService.increment();
  }
}
```

## Common Pitfalls

### 1. Memory Leaks
Always clean up effects when components unmount:
```typescript
useEffect(() => {
  const cleanup = effect(() => {
    // your effect code
  });
  return () => cleanup();
}, []);
```

### 2. Signal Creation
Create signals outside render/effect functions:
```typescript
// ❌ Bad: Creating signal in render
function Component() {
  const signal = new Signal(0); // Creates new signal on every render
}

// ✅ Good: Create signal outside render
const signal = new Signal(0);
function Component() {
  // Use signal here
}
```

### 3. Performance
Use computed signals for derived values:
```typescript
// ❌ Bad: Calculating in render
function Component() {
  const doubled = count.value * 2;
}

// ✅ Good: Using computed
const doubled = computed(() => count.value * 2);
function Component() {
  return doubled.value;
}
```

### 4. SSR Considerations
When using Next.js or other SSR frameworks, ensure signal operations are client-side only:
```typescript
// pages/counter.tsx
'use client'; // For Next.js app router
// or
const IS_CLIENT = typeof window !== 'undefined';

// Initialize signals conditionally
const countSignal = IS_CLIENT ? new Signal(0) : null;
```

### 5. Development Tools
Enable debug mode in development:
```typescript
import { debug } from "@avatijs/signal/debug";

if (process.env.NODE_ENV === 'development') {
  debug(mySignal, 'countSignal');
}
```

Need help with a specific framework or have questions about integration patterns? Feel free to [open an issue](https://github.com/KhaledSMQ/avati/issues)!
