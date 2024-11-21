
Signals support subscriptions to track value changes. The subscription API now provides more control over when callbacks are triggered.

### Basic Usage

```typescript
const signal = new Signal(0);

// Basic subscription - receives initial and all subsequent values
signal.subscribe(value => {
  console.log('Value changed:', value);
});

// Skip initial value
signal.subscribe(value => {
  console.log('Only subsequent changes:', value);
}, { skipInitial: true });
```

### Subscription Options

The `subscribe` method accepts an options object to customize subscription behavior:

```typescript
interface SubscriptionOption {
  /**
   * If true, the subscription callback won't be called with the initial value
   * Default: false
   */
  skipInitial?: boolean;
}
```

### Examples

```typescript
// Track all changes including initial value
const signal = new Signal('initial');
signal.subscribe(value => {
  console.log(value); // Logs: "initial"
});

// Skip initial value
signal.subscribe(value => {
  console.log(value); // Only logs subsequent changes
}, { skipInitial: true });

// Using with async operations
const asyncSignal = new Signal(null);
asyncSignal.subscribe(value => {
  if (value !== null) {
    // Process only when data is available
  }
}, { skipInitial: true });

// Cleanup
const unsubscribe = signal.subscribe(value => {
  // Handle updates
});
unsubscribe(); // Remove subscription
```

### Important Notes

- Subscriptions are automatically cleaned up when the signal is disposed
- The `skipInitial` option helps prevent unnecessary initial callbacks
- Unsubscribe when the subscription is no longer needed to prevent memory leaks
- Subscriptions track the actual signal value, ensuring no updates are missed

### TypeScript Support

The subscription API is fully typed, providing excellent IDE support and type safety:

```typescript
interface Signal {
  subscribe(
    callback: (value: T) => void,
    options?: SubscriptionOption
  ): UnsubscribeFunction;
}
```
