# Throttle Function

A versatile and robust throttle function implemented in TypeScript, designed to limit the rate at which a function can be invoked. Ideal for optimizing performance-critical tasks like event handling, API calls, and more.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Importing the Function](#importing-the-function)
  - [Basic Example](#basic-example)
  - [Throttling a Custom Function](#throttling-a-custom-function)
- [API](#api)
  - [`throttle`](#throttle)
- [Methods](#methods)
  - [`cancel`](#cancel)
  - [`flush`](#flush)
- [Best Use Cases](#best-use-cases)
- [When to Avoid](#when-to-avoid)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

- **Generic Function Support**: Can throttle any function, not limited to event handlers.
- **Configurable Leading and Trailing Invocations**: Control whether the function is invoked at the start and/or end of the throttle period.
- **Error Handling**: Customizable error handling with an `onError` callback.
- **Additional Control Methods**: `cancel` and `flush` methods to manage pending invocations.
- **Environment-Agnostic**: Compatible with both browser and Node.js environments.
- **TypeScript Support**: Strong typing ensures type safety and better developer experience.
- **Comprehensive Testing**: Ensures reliability and correctness across various scenarios.

## Installation

You can install the throttle function via npm or yarn:

```bash
npm install @avatijs/throttle
# or
yarn add @avati/throttle
```

Alternatively, you can directly include the `throttle.ts` file in your project.

## Usage

### Importing the Function

```typescript
import { throttle } from '@avatijs/throttle';  // ES6 import
// or
<script src="path/to/throttle.js"></script>  // Browser usage
```

### Basic Example

Throttling a window resize event:

```typescript
const handleResize = (event: Event) => {
    console.log('Window resized:', event);
};

const throttledResize = throttle(handleResize, 300, {
    leading: true,
    trailing: true,
    onError: (error) => console.error('Throttle error:', error),
});

// Add the throttled event listener
window.addEventListener('resize', throttledResize);

// To remove and cancel:
window.removeEventListener('resize', throttledResize);
throttledResize.cancel();

// To immediately invoke pending execution:
throttledResize.flush();
```

### Throttling a Custom Function

```typescript
const fetchData = async (query: string) => {
    const response = await fetch(`https://api.example.com/data?q=${query}`);
    const data = await response.json();
    console.log('Fetched data:', data);
};

const throttledFetchData = throttle(fetchData, 500, {
    leading: true,
    trailing: false,
    onError: (error) => console.error('Fetch error:', error),
});

throttledFetchData('react');
throttledFetchData('redux');
// Only the first call within 500ms will be executed
```

## API

### `throttle`

Creates a throttled version of the provided function that only invokes the function at most once every `limit` milliseconds.

#### Type Definition

```typescript
type ThrottleOptions = {
    leading?: boolean;
    trailing?: boolean;
    onError?: (error: any) => void;
};

type ThrottledFunction<T extends (...args: any[]) => any> = ((...args: Parameters<T>) => void) & {
    cancel: () => void;
    flush: () => void;
};

function throttle<T extends (...args: any[]) => any>(
    callback: T,
    limit?: number,
    options?: ThrottleOptions
): ThrottledFunction<T>;
```

#### Parameters

- `callback` (`T`): The function to throttle.
- `limit` (`number`, optional): The time interval in milliseconds to throttle executions to. Defaults to `250` ms.
- `options` (`ThrottleOptions`, optional):
    - `leading` (`boolean`, default `true`): Specify if the function should be invoked on the leading edge of the timeout.
    - `trailing` (`boolean`, default `true`): Specify if the function should be invoked on the trailing edge of the timeout.
    - `onError` (`(error: any) => void`, optional): Callback to handle errors thrown by the throttled function.

#### Returns

A throttled version of the input function with additional methods:

- `cancel()`: Cancels any pending executions and resets the throttle state.
- `flush()`: Immediately invokes the pending execution of the throttled function.

## Methods

### `cancel`

Cancels any pending executions and resets the throttle state.

#### Usage

```typescript
throttledFunction.cancel();
```

### `flush`

Immediately invokes the pending execution of the throttled function.

#### Usage

```typescript
throttledFunction.flush();
```

## Best Use Cases

Throttling is an excellent technique to optimize performance by limiting the frequency of function executions. Here are some ideal scenarios where using the throttle function can be highly beneficial:

### 1. **Event Handling**

- **Scroll Events**: Handling scroll events can be performance-intensive, especially when updating UI elements based on scroll position. Throttling ensures the handler executes at manageable intervals.

  ```typescript
  const handleScroll = () => {
      console.log('Scrolling...');
  };
  
  const throttledScroll = throttle(handleScroll, 200);
  window.addEventListener('scroll', throttledScroll);
  ```

- **Resize Events**: Similar to scroll events, window resize events can trigger numerous rapid executions. Throttling helps in updating layout or performing calculations efficiently.

  ```typescript
  const handleResize = () => {
      console.log('Window resized');
  };
  
  const throttledResize = throttle(handleResize, 300);
  window.addEventListener('resize', throttledResize);
  ```

### 2. **API Calls**

- **Search Input**: When implementing a search-as-you-type feature, throttling API calls prevents overwhelming the server with requests for every keystroke.

  ```typescript
  const search = (query: string) => {
      fetch(`/api/search?q=${query}`)
          .then(response => response.json())
          .then(data => console.log(data));
  };
  
  const throttledSearch = throttle(search, 500);
  
  const handleInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      throttledSearch(input.value);
  };
  
  const searchInput = document.getElementById('search') as HTMLInputElement;
  searchInput.addEventListener('input', handleInput);
  ```

### 3. **Animations and Transitions**

- **Scroll-Based Animations**: Throttling can be used to control the frequency of animation updates based on scroll position, ensuring smooth performance without unnecessary computations.

  ```typescript
  const animateOnScroll = () => {
      // Animation logic
  };
  
  const throttledAnimate = throttle(animateOnScroll, 100);
  window.addEventListener('scroll', throttledAnimate);
  ```

### 4. **Button Clicks**

- **Preventing Rapid Clicks**: Throttling button click handlers can prevent multiple rapid submissions or unintended repeated actions.

  ```typescript
  const handleClick = () => {
      console.log('Button clicked');
  };
  
  const throttledClick = throttle(handleClick, 1000, { leading: true, trailing: false });
  const button = document.getElementById('submit-btn') as HTMLButtonElement;
  button.addEventListener('click', throttledClick);
  ```

### 5. **Logging and Analytics**

- **Performance Monitoring**: Throttling logging functions ensures that performance metrics or user interactions are recorded without affecting application performance.

  ```typescript
  const logEvent = (event: string) => {
      console.log(`Event: ${event}`);
  };
  
  const throttledLog = throttle(logEvent, 1000);
  
  const trackUserAction = (action: string) => {
      throttledLog(action);
  };
  
  // Example usage
  trackUserAction('click');
  trackUserAction('scroll');
  ```

## When to Avoid

While throttling is a powerful tool for optimizing performance, it's not always the appropriate choice. Here are some scenarios where using throttling might be counterproductive or unnecessary:

### 1. **Immediate Execution Required**

- **Critical Actions**: If a function needs to execute immediately and reliably every time an event occurs, throttling can introduce unwanted delays or missed executions.

  **Example**: Real-time form validation where each input needs to be validated instantly.

  ```typescript
  const validateInput = (input: string) => {
      // Validation logic
  };
  
  // Avoid throttling
  const handleInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      validateInput(input.value);
  };
  
  inputElement.addEventListener('input', handleInput);
  ```

### 2. **Non-Performance-Critical Functions**

- **Simple Logic**: For functions that are lightweight and don't impact performance, throttling adds unnecessary complexity without significant benefits.

  **Example**: Updating a non-visual counter or simple state updates.

  ```typescript
  let counter = 0;
  
  const incrementCounter = () => {
      counter += 1;
      console.log(counter);
  };
  
  // No need to throttle
  button.addEventListener('click', incrementCounter);
  ```

### 3. **Debounce Requirements**

- **Waiting for Inactivity**: If the desired behavior is to execute a function only after a period of inactivity (e.g., waiting for the user to stop typing), debouncing is more appropriate than throttling.

  **Example**: Autocomplete search where the search is triggered only after the user stops typing.

  ```typescript
  const debounce = (func: Function, wait: number) => { /* debounce implementation */ };
  
  const search = (query: string) => {
      // Search logic
  };
  
  const debouncedSearch = debounce(search, 300);
  
  const handleInput = (event: Event) => {
      const input = event.target as HTMLInputElement;
      debouncedSearch(input.value);
  };
  
  inputElement.addEventListener('input', handleInput);
  ```

### 4. **Sequential Dependencies**

- **Dependent Operations**: When function executions depend on the completion of previous calls, throttling can disrupt the sequence and lead to inconsistent states.

  **Example**: Sequential data processing where each step relies on the previous one.

  ```typescript
  const processData = async (data: any) => {
      // Processing logic
  };
  
  // Avoid throttling
  const handleData = (data: any) => {
      processData(data);
  };
  
  dataEmitter.on('data', handleData);
  ```

### 5. **Single-Execution Functions**

- **One-Time Actions**: For functions that are intended to execute only once (e.g., initialization tasks), throttling is unnecessary.

  **Example**: Initializing a third-party library on page load.

  ```typescript
  const initializeLibrary = () => {
      // Initialization logic
  };
  
  // No need to throttle
  window.addEventListener('load', initializeLibrary);
  ```

### 6. **High-Frequency Data Streams**

- **Data Integrity**: In scenarios where every piece of data is crucial (e.g., financial transactions, real-time data feeds), throttling can result in loss of important information.

  **Example**: Processing real-time stock price updates where each update is significant.

  ```typescript
  const handleStockUpdate = (price: number) => {
      console.log(`New price: ${price}`);
  };
  
  // Avoid throttling
  stockPriceEmitter.on('update', handleStockUpdate);
  ```

## Error Handling

Errors thrown by the throttled function are caught and can be handled using the `onError` option. If `onError` is not provided, errors will be rethrown.

### Example

```typescript
const handleClick = () => {
    throw new Error('Test error');
};

const throttledClick = throttle(handleClick, 1000, {
    onError: (error) => console.error('Throttle error:', error),
});

throttledClick(); // Logs: Throttle error: Error: Test error
```
## Recommended Limits

The best limit for a throttle function depends on the specific use case and the desired balance between responsiveness and performance.

### 1. **Frequent UI Events (e.g., `scroll`, `mousemove`, `resize`)**
- **Recommended Limit:** `36ms - 100ms`
- **Why:** These events can fire dozens of times per second. Throttling to 50-100ms reduces the number of function calls while maintaining smooth user experience.

### 2. **Input Fields (e.g., `keyup`, `input`)**
- **Recommended Limit:** `300ms - 500ms`
- **Why:** When users type, you typically want to update suggestions, validate input, or perform searches without lag. A slightly higher limit allows you to reduce the load on your system while still responding in near real-time.

### 3. **API Calls (e.g., Search Suggestions, Autosave)**
- **Recommended Limit:** `500ms - 1000ms`
- **Why:** These operations are often more resource-intensive, and limiting them reduces the load on your backend while providing timely feedback.

### 4. **Animation/Rendering (e.g., game loops or dynamic canvas updates)**
- **Recommended Limit:** `16ms`
- **Why:** This is equivalent to ~60fps, the standard for smooth animations. If performance is a concern, consider using `requestAnimationFrame` instead.

### 5. **Debounced-like Scenarios (where minimal calls are preferred)**
- **Recommended Limit:** `1000ms` or more
- **Why:** In situations like window resize or orientation change, you may only need updates occasionally to prevent excessive calculations.

### Choosing the Right Limit:
- **Test and Adjust:** Start with a conservative value and adjust based on user feedback and performance metrics.
- **Device Capabilities:** On slower devices, increase the limit to prevent performance issues.
- **Event Type:** Match the limit to the event’s natural frequency.

Would you like help implementing a throttle function with a specific limit?

---
## Contributing

Contributions are welcome! Please read our [contributing guide](../CONTRIBUTING.md) to learn about our development process, the project structure, and how to propose bug fixes and improvements. 

---
 
## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- Inspired by similar throttle implementations in popular utility libraries like [Lodash](https://lodash.com/).

---
