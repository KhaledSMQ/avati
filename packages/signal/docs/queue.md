# Queue Signal

A reactive priority queue implementation for handling prioritized tasks and events.

## Introduction

Queue Signal provides a powerful and flexible way to manage prioritized queues with reactive state management. It's perfect for task scheduling, event management, and any scenario requiring ordered processing with priority support.

## Features

- Thread-safe FIFO operations
- Priority queue functionality
- Real-time reactive updates
- Unique item tracking
- Memory-efficient design
- Simple and intuitive API

## Recommendations

### When to Use
- Task scheduling and job queues
- Event processing systems
- Message brokers
- Priority-based notifications
- Background job management
- Rate limiting implementations
- Request buffering
- State management with ordered updates

### Best Practices
- Set appropriate priorities (1-10 range recommended)
- Implement error handling for dequeue operations
- Clear queue when no longer needed
- Use typed generics for type safety
- Monitor queue size to prevent memory issues
- Implement backpressure mechanisms for high-load scenarios

### What to Avoid
- Don't use for persistent storage
- Avoid complex objects as queue items
- Don't rely on item order within same priority level
- Don't modify queue items after enqueueing
- Avoid polling the queue continuously
- Don't use for time-critical operations
- Avoid circular dependencies in queue items
- Don't share queue instances across different contexts

## Documentation

### Creating a Queue

```typescript
import { createQueueSignal } from '@avati/signal';

const queue = createQueueSignal<string>();
```

### Basic Usage

```typescript
// Add items
queue.enqueue('first-task');
queue.enqueue('urgent-task', 2);  // With priority

// Process items 
const nextTask = queue.dequeue();
const upcomingTask = queue.peek();
```

### Available Methods

#### enqueue()
Add an item to the queue.
```typescript
const id = queue.enqueue(item, priority?);
```

#### dequeue()
Remove and return the first item.
```typescript
const item = queue.dequeue();
```

#### peek()
View the next item without removing it.
```typescript
const nextItem = queue.peek();
```

#### remove()
Remove a specific item by ID.
```typescript
const removed = queue.remove(itemId);
```

#### clear()
Remove all items from the queue.
```typescript
queue.clear();
```

#### size()
Get the number of items in queue.
```typescript
const count = queue.size();
```

#### isEmpty()
Check if queue has no items.
```typescript
const empty = queue.isEmpty();
```

## Examples

### Priority Queue
```typescript
const taskQueue = createQueueSignal<Task>();

// Add tasks with priorities
taskQueue.enqueue({ id: 1, name: 'Regular task' }, 1);
taskQueue.enqueue({ id: 2, name: 'Urgent task' }, 3);
taskQueue.enqueue({ id: 3, name: 'Normal task' }, 2);

// Tasks will be processed in priority order
console.log(taskQueue.dequeue()); // Urgent task
console.log(taskQueue.dequeue()); // Normal task
console.log(taskQueue.dequeue()); // Regular task
```

### Task Management
```typescript
const taskQueue = createQueueSignal<string>();

// Add tasks and store IDs
const taskIds = [];
taskIds.push(taskQueue.enqueue('Task 1'));
taskIds.push(taskQueue.enqueue('Task 2'));

// Remove specific task
taskQueue.remove(taskIds[0]);

// Clear all tasks
taskQueue.clear();
```

## Testing

To ensure queue functionality, run the included test suite:

```typescript
describe('QueueSignal', () => {
    it('handles basic operations', () => {
        const queue = createQueueSignal<string>();
        queue.enqueue('test');
        expect(queue.size()).toBe(1);
        expect(queue.dequeue()).toBe('test');
        expect(queue.isEmpty()).toBe(true);
    });
});
```
