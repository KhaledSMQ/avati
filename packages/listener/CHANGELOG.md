# EventListenerManager

`EventListenerManager` is a comprehensive utility for managing DOM event listeners with advanced options such as debouncing, throttling, asynchronous handling, metadata attachment, and error handling. It simplifies event listener management in complex web applications, ensuring efficient and clean code.

## Table of Contents

-   [Installation](#installation)
-   [Importing](#importing)
-   [Usage](#usage)
    -   [Adding Event Listeners](#adding-event-listeners)
    -   [Removing Event Listeners](#removing-event-listeners)
    -   [Options](#options)
        -   [Debounce](#debounce)
        -   [Throttle](#throttle)
        -   [Async Callbacks](#async-callbacks)
        -   [Metadata Attachment](#metadata-attachment)
        -   [Error Handling](#error-handling)
    -   [One-Time Event Listeners](#one-time-event-listeners)
    -   [Automatic Cleanup](#automatic-cleanup)
    -   [Retrieving Active Listeners](#retrieving-active-listeners)
    -   [Removing All Listeners from an Element](#removing-all-listeners-from-an-element)
-   [Examples](#examples)
    -   [Basic Usage](#basic-usage)
    -   [Debouncing Events](#debouncing-events)
    -   [Throttling Events](#throttling-events)
    -   [Using Async Callbacks](#using-async-callbacks)
    -   [Error Handling](#error-handling)
-   [API Reference](#api-reference)
    -   [EventListenerManager Class](#eventlistenermanager-class)
        -   [add](#add)
        -   [remove](#remove)
        -   [once](#once)
        -   [addWithCleanup](#addwithcleanup)
        -   [getListeners](#getlisteners)
        -   [removeAll](#removeall)
-   [License](#license)

---

## Installation

Since `EventListenerManager` is a utility class, you can include it directly in your project. If it's part of a package, you can install it via npm:

```bash
npm install @avatijs/listener
```

## Importing

Import the `EventListenerManager` instance and types into your project:

```typescript
import eventManager from '@avatijs/listener';
// If you need types
import {
    EventOptions,
    EventId,
    ListenerMetadata,
    ListenerDetails,
    EventMetadata,
} from '@avatijs/listener';
```

---

## Usage

### Adding Event Listeners

Use the `add` method to attach an event listener to a DOM element with optional advanced configurations.

```typescript
const eventId = eventManager.add(
  element,
  eventType,
  callback,
  options?
);
```

-   `element`: The DOM element to attach the listener to.
-   `eventType`: A string representing the event type (e.g., `'click'`, `'mouseover'`).
-   `callback`: The function to be called when the event is triggered.
-   `options`: An optional object of type `EventOptions` for advanced configurations.

### Removing Event Listeners

Use the `remove` method with the `eventId` returned by `add` to remove the event listener.

```typescript
eventManager.remove(eventId);
```

---

### Options

The `EventOptions` interface extends the standard `AddEventListenerOptions` and provides additional properties:

```typescript
interface EventOptions extends AddEventListenerOptions {
    debounce?: number;
    throttle?: number;
    async?: boolean;
    metadata?: boolean;
    onError?: (error: Error) => void;
    noLeading?: boolean;
    noTrailing?: boolean;
}
```

#### Debounce

Delays the execution of the callback until after a specified wait time has elapsed since the last event.

-   **Usage:** Set the `debounce` option to the desired wait time in milliseconds.

```typescript
eventManager.add(element, 'input', callback, { debounce: 300 });
```

#### Throttle

Limits the execution of the callback to once every specified interval.

-   **Usage:** Set the `throttle` option to the desired interval in milliseconds.
-   **Additional Options:**
    -   `noLeading`: If `true`, the callback is not executed on the leading edge.
    -   `noTrailing`: If `true`, the callback is not executed on the trailing edge.

```typescript
eventManager.add(element, 'scroll', callback, {
    throttle: 200,
    noLeading: false,
    noTrailing: false,
});
```

#### Async Callbacks

Handles asynchronous callbacks that return a Promise.

-   **Usage:** Set the `async` option to `true`.

```typescript
eventManager.add(element, 'submit', asyncCallback, { async: true });
```

#### Metadata Attachment

Attaches metadata to the event object, providing additional context.

-   **Usage:** Set the `metadata` option to `true`.

```typescript
eventManager.add(element, 'click', callback, { metadata: true });
```

-   **Accessing Metadata:**

```typescript
function callback(event: EventMetadata) {
    if (event.metadata) {
        console.log(event.metadata.eventId);
    }
}
```

#### Error Handling

Handles errors that occur within the callback by providing an `onError` handler.

-   **Usage:** Provide an `onError` function in the options.

```typescript
eventManager.add(element, 'click', callback, {
    onError: (error) => console.error('Error:', error),
});
```

---

### One-Time Event Listeners

Use the `once` method to add an event listener that automatically removes itself after being called once.

```typescript
const eventId = eventManager.once(element, 'click', callback, options?);
```

---

### Automatic Cleanup

Use the `addWithCleanup` method to receive a cleanup function that removes the event listener when called.

```typescript
const cleanup = eventManager.addWithCleanup(element, 'click', callback, options?);

// Later, when you want to remove the listener
cleanup();
```

---

### Retrieving Active Listeners

Get a list of all active listeners attached to an element.

```typescript
const listeners = eventManager.getListeners(element);
```

Each listener object contains:

-   `eventId`
-   `eventType`
-   `options`
-   `timestamp`

---

### Removing All Listeners from an Element

Remove all event listeners attached to an element.

```typescript
eventManager.removeAll(element);
```

---

## Examples

### Basic Usage

```typescript
import eventManager from '@avatijs/listener';

const button = document.querySelector('button');

function handleClick(event: Event) {
    console.log('Button clicked!', event);
}

// Add an event listener
const eventId = eventManager.add(button, 'click', handleClick);

// Remove the event listener when needed
eventManager.remove(eventId);
```

### Debouncing Events

```typescript
function handleInput(event: Event) {
    console.log('Input value:', (event.target as HTMLInputElement).value);
}

// Debounce the input event handler
eventManager.add(inputElement, 'input', handleInput, { debounce: 500 });
```

### Throttling Events

```typescript
function handleScroll(event: Event) {
    console.log('Scroll position:', window.scrollY);
}

// Throttle the scroll event handler
eventManager.add(window, 'scroll', handleScroll, { throttle: 200 });
```

#### Using `noLeading` and `noTrailing`

```typescript
// Throttle with no leading call
eventManager.add(window, 'scroll', handleScroll, {
    throttle: 200,
    noLeading: true,
});

// Throttle with no trailing call
eventManager.add(window, 'scroll', handleScroll, {
    throttle: 200,
    noTrailing: true,
});
```

### Using Async Callbacks

```typescript
async function handleSubmit(event: Event) {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    await sendDataToServer(data);
}

// Add an async event listener
eventManager.add(formElement, 'submit', handleSubmit, { async: true });
```

### Error Handling

```typescript
function handleClick(event: Event) {
    throw new Error('An unexpected error occurred');
}

function handleError(error: Error) {
    console.error('Error in event listener:', error);
}

// Add event listener with error handling
eventManager.add(button, 'click', handleClick, { onError: handleError });
```

---

## API Reference

### EventListenerManager Class

#### add

Adds an event listener with advanced options.

```typescript
add(
  element: Element,
  eventType: string,
  callback: EventListener,
  options?: EventOptions
): EventId;
```

-   **Parameters:**
    -   `element`: The DOM element to attach the listener to.
    -   `eventType`: The event type as a string.
    -   `callback`: The event handler function.
    -   `options`: Optional `EventOptions` object.
-   **Returns:** A unique `EventId` for the added listener.

#### remove

Removes an event listener by its `EventId`.

```typescript
remove(eventId: EventId): boolean;
```

-   **Parameters:**
    -   `eventId`: The ID of the event listener to remove.
-   **Returns:** `true` if the listener was removed, `false` otherwise.

#### once

Adds an event listener that removes itself after being called once.

```typescript
once(
  element: Element,
  eventType: string,
  callback: EventListener,
  options?: EventOptions
): EventId;
```

-   **Parameters:** Same as `add`.
-   **Returns:** A unique `EventId`.

#### addWithCleanup

Adds an event listener and returns a cleanup function to remove it.

```typescript
addWithCleanup(
  element: Element,
  eventType: string,
  callback: EventListener,
  options?: EventOptions
): () => void;
```

-   **Parameters:** Same as `add`.
-   **Returns:** A function that, when called, removes the event listener.

#### getListeners

Retrieves all active listeners attached to an element.

```typescript
getListeners(element: Element): Array<{
  eventId: EventId;
  eventType: string;
  options: EventOptions;
  timestamp: number;
}>;
```

-   **Parameters:**
    -   `element`: The DOM element to query.
-   **Returns:** An array of listener details.

#### removeAll

Removes all event listeners from an element.

```typescript
removeAll(element: Element): void;
```

-   **Parameters:**
    -   `element`: The DOM element from which to remove all listeners.

---

## License

This project is licensed under the MIT License.

---

### Contact and Support

If you have any questions or need further assistance, please feel free to reach out or open an issue in the project's repository.

---

**Happy coding!**
