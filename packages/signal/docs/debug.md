# Debug Signal

A utility for tracking and debugging signal updates.

## Usage

```typescript
import { Signal, debug } from '@avati/signal';

const counter = new Signal(0);
const debuggedCounter = debug(counter, 'Counter');

// Logs: [Signal Debug] Counter: 0
counter.value = 1; 
// Logs: [Signal Debug] Counter: 1
```

## Key Features
- Console logging of signal value changes
- Named debugging for multiple signals
- Non-intrusive signal wrapping
- Preserves original signal functionality

## Best Practices
- Use meaningful debug names
- Remove debug wrappers in production
- Debug specific signals rather than all
- Group related signals with naming conventions

## What to Avoid
- Debugging high-frequency updating signals
- Leaving debug signals in production code
- Debugging complex objects without custom formatting
- Excessive debugging of multiple signals

## Tips
- Use hierarchical names for nested signals (e.g., 'form.username')
- Add timestamps for timing analysis
- Group related debug signals
- Consider custom logging for complex data structures
