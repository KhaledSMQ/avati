# BatchScheduler

## About BatchScheduler

BatchScheduler is an elegant and powerful task scheduling library for JavaScript/TypeScript applications. It provides a simple yet flexible API for managing and executing tasks in batches with support for:

- Task prioritization
- Batching contexts
- Task cancellation
- Error handling
- Async/await support
- Zero dependencies

## Installation

You can install the package via npm:

```bash
npm install @avatijs/batch-scheduler
```

Or using yarn:

```bash
yarn add @avatijs/batch-scheduler
```

Or

```
<script src="https://cdn.jsdelivr.net/npm/@avatijs/batch-scheduler@0.1.2/dist/index.umd.min.js"></script>
```

## Basic Usage

```typescript
import { BatchScheduler } from '@avatijs/batch-scheduler';

// Get the scheduler instance
const scheduler = BatchScheduler.getInstance();

// Schedule a simple task
scheduler.schedule(() => {
    console.log('Task executed');
});

// Schedule a high-priority task
scheduler.schedule(() => {
    console.log('High-priority task');
}, { priority: 10 });

// Schedule an async task
scheduler.schedule(async () => {
    await someAsyncOperation();
    console.log('Async task completed');
});
```

## Batching Operations

Use batching to group multiple tasks together:

```typescript
import { batchUpdates } from '@avatijs/batch-scheduler';

batchUpdates(() => {
    // All tasks scheduled here will be executed together
    scheduler.schedule(() => console.log('Task 1'));
    scheduler.schedule(() => console.log('Task 2'));
    scheduler.schedule(() => console.log('Task 3'));
});
```

## Task Cancellation

Tasks can be cancelled before execution using cancellation tokens:

```typescript
const token = scheduler.createCancellationToken();

scheduler.schedule(() => {
    console.log('This task may be cancelled');
}, { cancellationToken: token });

// Cancel the task before it executes
token.cancel();
```

## Error Handling

Handle task errors gracefully:

```typescript
scheduler.schedule(() => {
    throw new Error('Task failed');
}, {
    onError: (error) => {
        console.error('Handled task error:', error);
    },
});
```

## Advanced Features

### Priority System

Tasks with higher priority values are executed first:

```typescript
scheduler.schedule(task1, { priority: 1 });  // Executed third
scheduler.schedule(task2, { priority: 5 });  // Executed second
scheduler.schedule(task3, { priority: 10 }); // Executed first
```

### Manual Batch Control

For fine-grained control over batching:

```typescript
scheduler.startBatch();

// Schedule multiple tasks
scheduler.schedule(task1);
scheduler.schedule(task2);

// Other operations...

scheduler.endBatch(); // Tasks are executed
```

### Immediate Processing

Force immediate processing of all pending tasks:

```typescript
scheduler.flush();
```

### Cleanup

Properly shutdown the scheduler when needed:

```typescript
scheduler.shutdown();
```
 

## Do's and Don'ts

### Do's ✅

#### Do: Use Batching for Related Operations

```typescript
// Good: Group related UI updates
batchUpdates(() => {
    scheduler.schedule(() => updateHeader());
    scheduler.schedule(() => updateSidebar());
    scheduler.schedule(() => updateFooter());
});
```

#### Do: Handle Errors Appropriately

```typescript
// Good: Proper error handling
scheduler.schedule(
    async () => {
        await fetchUserData();
    },
    {
        onError: (error) => {
            logger.error('Failed to fetch user data:', error);
            showErrorNotification();
        }
    }
);
```

#### Do: Use Priorities for Important Tasks

```typescript
// Good: Critical updates get higher priority
scheduler.schedule(
    () => updateCriticalMetrics(),
    { priority: 10 }
);

scheduler.schedule(
    () => updateNonCriticalUI(),
    { priority: 1 }
);
```

#### Do: Clean Up Resources

```typescript
// Good: Proper cleanup on component unmount
class Component {
    private token = scheduler.createCancellationToken();

    scheduleTask() {
        scheduler.schedule(
            () => this.updateData(),
            { cancellationToken: this.token }
        );
    }

    cleanup() {
        this.token.cancel();
    }
}
```

### Don'ts ❌

#### Don't: Create Multiple Scheduler Instances

```typescript
// Bad: Creating multiple instances
const scheduler1 = new BatchScheduler(); // ❌
const scheduler2 = new BatchScheduler(); // ❌

// Good: Use singleton instance
const scheduler = BatchScheduler.getInstance(); // ✅
```

#### Don't: Nest Batch Operations

```typescript
// Bad: Nesting batch operations
batchUpdates(() => {
    scheduler.schedule(() => task1());
    
    batchUpdates(() => {  // ❌ Nested batch
        scheduler.schedule(() => task2());
    });
});

// Good: Flatten batch operations
batchUpdates(() => {
    scheduler.schedule(() => task1());
    scheduler.schedule(() => task2());
});
```

#### Don't: Use Long-Running Tasks Without Consideration

```typescript
// Bad: Long-running synchronous task
scheduler.schedule(() => {
    while(heavyComputation()) { } // ❌ Blocks the thread
});

// Good: Break up or make async
scheduler.schedule(async () => {
    const chunks = splitIntoChunks(data);
    for (const chunk of chunks) {
        await processChunk(chunk);
    }
});
```

#### Don't: Ignore Task Cancellation

```typescript
// Bad: Not handling cancellation
scheduler.schedule(async () => {
    const data = await fetchData();  // ❌ Continues even if cancelled
    processData(data);
});

// Good: Check cancellation status
const token = scheduler.createCancellationToken();
scheduler.schedule(async () => {
    if (token.isCancelled) return;
    const data = await fetchData();
    if (token.isCancelled) return;
    processData(data);
}, { cancellationToken: token });
```

#### Don't: Use Flush in Batch Context

```typescript
// Bad: Flushing within batch
batchUpdates(() => {
    scheduler.schedule(() => task1());
    scheduler.flush();  // ❌ Throws error
});

// Good: Flush outside batch
batchUpdates(() => {
    scheduler.schedule(() => task1());
});
scheduler.flush();  // ✅
```

### Best Practices 🎯

1. **Task Size**: Keep tasks small and focused
2. **Error Handling**: Always provide error handlers for critical tasks
3. **Priorities**: Use priorities sparingly and meaningfully
4. **Cancellation**: Implement cancellation for long-running or resource-intensive tasks
5. **Batching**: Group related tasks that should be executed together
6. **Async Operations**: Prefer async operations for I/O or long-running tasks
7. **Cleanup**: Always clean up by cancelling pending tasks when appropriate
---
## API Reference

### BatchScheduler Class

#### Static Methods

- `getInstance(): BatchScheduler`
    - Returns the singleton instance of BatchScheduler

#### Instance Methods

- `schedule(task: TaskFunction, options?: TaskOptions): void`
    - Schedules a task for execution
    - Options include `priority`, `onError`, and `cancellationToken`

- `startBatch(): void`
    - Begins a new batching context

- `endBatch(): void`
    - Ends the current batching context

- `flush(): void`
    - Immediately processes all pending tasks

- `shutdown(): void`
    - Cancels all pending tasks and prevents new scheduling

- `createCancellationToken(): CancellationToken`
    - Creates a new cancellation token

### Helper Functions

- `batchUpdates<T>(fn: () => T): T`
    - Executes a function within a batching context
---


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
