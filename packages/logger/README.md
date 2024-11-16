# Browser Console Logger

A lightweight, TypeScript-based logging utility designed for browser environments with advanced debugging capabilities. This logger provides structured console output, debug grouping, performance tracking, and hierarchical logging support.

## Features

- 🎯 **Focused on Browser Console**: Optimized for browser development and debugging
- 📊 **Multiple Log Levels**: ERROR, WARN, INFO, and DEBUG
- 🔍 **Debug Mode**: Enhanced debugging features with grouping and performance tracking
- ⚡ **Performance Optimized**: Minimal overhead and conditional logging
- 📱 **Module Support**: ESM and TypeScript support
- 👥 **Hierarchical Logging**: Support for child loggers with prefixes
- ⏱️ **Performance Tracking**: Built-in timing functionality for debugging
- 🎨 **Customizable**: Configurable timestamps, prefixes, and debug modes

## Installation

```bash
npm install @avati/logger
# or
yarn add @avati/logger
```

## Quick Start

```typescript
import { ConsoleLogger } from '@avati/logger';

// Create logger instance
const logger = ConsoleLogger.getInstance({
    level: 'DEBUG',
    debugMode: true,
    enableTimestamp: true,
    prefix: 'APP'
});

// Basic logging
logger.info('Application started');
logger.warn('High memory usage', { usage: '85%' });
logger.error('Failed to fetch data', new Error('Network error'));
logger.debug('Request details', { url: '/api/data' });
```

## Usage Examples

### Basic Configuration

```typescript
const logger = ConsoleLogger.getInstance({
    level: 'INFO',        // Minimum log level to output
    debugMode: true,      // Enable debug features
    enableTimestamp: true, // Include timestamps in logs
    enablePerformance: true, // Enable performance tracking
    prefix: 'MyApp'       // Global prefix for all logs
});
```

### Debug Groups

```typescript
logger.group('API Request');
logger.debug('Preparing request');
logger.debug('Sending data', { payload: data });
logger.debug('Processing response');
logger.groupEnd('API Request');
```

### Performance Tracking

```typescript
logger.time('dataProcessing');
// ... some operations
logger.timeEnd('dataProcessing'); // Outputs: "dataProcessing: 123.45ms"
```

### Child Loggers

```typescript
// Create module-specific loggers
const authLogger = logger.createChildLogger('AUTH');
const apiLogger = logger.createChildLogger('API');

authLogger.info('User logged in'); // Output: "[AUTH] User logged in"
apiLogger.debug('Request sent');   // Output: "[API] Request sent"
```

### Advanced Debugging

```typescript
// Enable debug mode with performance tracking
const logger = ConsoleLogger.getInstance({
    level: 'DEBUG',
    debugMode: true,
    enablePerformance: true
});

logger.group('Data Processing');
logger.time('process');

logger.debug('Starting processing');
// ... processing logic
logger.debug('Processing complete');

logger.timeEnd('process');
logger.groupEnd('Data Processing');
```

## API Reference

### Configuration Options

```typescript
interface LoggerConfig {
    level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
    enableTimestamp: boolean;
    debugMode: boolean;
    enablePerformance: boolean;
    prefix?: string;
}
```

### Methods

#### Core Logging Methods

- `error(message: string, ...args: unknown[]): void`
- `warn(message: string, ...args: unknown[]): void`
- `info(message: string, ...args: unknown[]): void`
- `debug(message: string, ...args: unknown[]): void`

#### Debug Tools

- `group(label: string): void` - Starts a collapsible debug group
- `groupEnd(label: string): void` - Ends a debug group
- `time(label: string): void` - Starts a performance timer
- `timeEnd(label: string): void` - Ends and logs a performance timer
- `clear(): void` - Clears the console

#### Utility Methods

- `createChildLogger(prefix: string): ConsoleLogger` - Creates a new logger instance with a prefix
- `updateConfig(config: Partial<LoggerConfig>): void` - Updates logger configuration

### Log Levels

```typescript
enum LogLevel {
    ERROR = 0,  // Critical errors
    WARN = 1,   // Warning messages
    INFO = 2,   // General information
    DEBUG = 3   // Debug information
}
```

## Best Practices

1. **Log Level Selection**
    - Use ERROR for unrecoverable errors
    - Use WARN for recoverable issues
    - Use INFO for significant events
    - Use DEBUG for development details

2. **Debug Groups**
    - Group related debug messages
    - Use meaningful group labels
    - Don't forget to close groups

3. **Performance Tracking**
    - Use time/timeEnd for critical operations
    - Keep labels consistent
    - Clean up timers when done

4. **Child Loggers**
    - Create separate loggers for different modules
    - Use descriptive prefixes
    - Maintain consistent naming

## Framework Integration

### React Example

```typescript
// logger.ts
export const logger = ConsoleLogger.getInstance({
    level: process.env.NODE_ENV === 'production' ? 'ERROR' : 'DEBUG',
    debugMode: process.env.NODE_ENV !== 'production',
    prefix: 'React'
});

// component.tsx
import { logger } from './logger';

const MyComponent: React.FC = () => {
    const componentLogger = logger.createChildLogger('MyComponent');
    
    useEffect(() => {
        componentLogger.debug('Component mounted');
        return () => componentLogger.debug('Component unmounted');
    }, []);

    return <div>My Component</div>;
};
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.


## Contributing

Contributions and feedback are very welcome. New features should include a test.

To get it running:

1. Clone the project.
2. `npm install`


## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
