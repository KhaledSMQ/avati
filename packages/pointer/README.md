
# Advanced Pointer Event Manager

**Pointer** is a robust and flexible TypeScript library designed to manage mouse and pointer events on HTML elements. It offers advanced features such as multiple pointer tracking, velocity and acceleration calculations, debouncing, initial position setting, asynchronous event handlers, and a publish-subscribe (pub-sub) system for efficient event management. This library is ideal for building interactive and responsive user interfaces, supporting complex interactions with ease.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Usage Examples](#usage-examples)
    - [Basic Usage](#basic-usage)
    - [Advanced Usage with Async Handlers](#advanced-usage-with-async-handlers)
    - [Setting Initial Positions](#setting-initial-positions)
5. [API Reference](#api-reference)
    - [Classes](#classes)
        - [AdvancedPointerEventManager](#advancedpointereventmanager)
    - [Interfaces](#interfaces)
        - [PointerEventManagerConfig](#pointereventmanagerconfig)
        - [PointerState](#pointerstate)
        - [PubSubHandlers](#pubsubhandlers)
    - [Types](#types)
        - [PointerEventType](#pointereventtype)
        - [PubSubEventType](#pubsubeventtype)
6. [Development](#development)
7. [Contributing](#contributing)
8. [License](#license)

---

## Features

- **Unified Pointer Handling:** Supports both pointer and mouse events seamlessly.
- **Multiple Pointer Support:** Tracks multiple pointers (e.g., multi-touch) with individual states.
- **State Tracking:** Monitors pointer positions, velocities, accelerations, and speeds.
- **Debounce Support:** Prevents excessive event handler invocations with customizable debounce times.
- **Publish-Subscribe Pattern:** Decouples event management, allowing multiple subscribers to handle events independently.
- **Flexible Event Targets:** Listens to `"pointermove"` events on `window`, `document`, or the specific `element`.
- **Initial Position Setting:** Programmatically set initial positions of pointers for simulations and testing.
- **Asynchronous Event Handlers:** Supports asynchronous functions as event handlers for advanced operations.
- **Performance Optimizations:** Utilizes `requestAnimationFrame` for efficient updates.
- **TypeScript Support:** Strongly typed interfaces enhance developer experience and reduce runtime errors.
- **Separation of Concerns:** Modular architecture ensures maintainability and ease of extension.
 

## Installation

You can install **Pointer** via npm:

```bash
npm install @avatijs/pointer
```

Alternatively, you can include it directly in your project by downloading the compiled JavaScript files.

---

## Getting Started

### Importing the Library

If you're using ES modules, you can import the library as follows:

```typescript
import { AdvancedPointerEventManager } from '@avati/pointer';
```

If you prefer using script tags, ensure that your project is set up to handle ES modules:

```html
<script type="module">
  import { AdvancedPointerEventManager } from './dist/AdvancedPointerEventManager.js';
</script>
```

---

## Usage Examples

### Basic Usage

Below is a basic example demonstrating how to initialize the `AdvancedPointerEventManager`, subscribe to pointer events, and handle them.

#### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AdvancedPointerEventManager Demo</title>
  <style>
    #interactive-area {
      width: 600px;
      height: 400px;
      background-color: #e0e0e0;
      border: 2px solid #333;
      position: relative;
      margin: 50px auto;
      user-select: none;
    }
    #pointer-info {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.9);
      padding: 10px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
      white-space: pre-line; /* Preserve line breaks */
    }
  </style>
</head>
<body>
  <div id="interactive-area">
    <div id="pointer-info">Pointer Info</div>
  </div>

  <!-- Include the compiled library as an ES module -->
  <script type="module">
    import { AdvancedPointerEventManager } from './dist/AdvancedPointerEventManager.js';

    const interactiveArea = document.getElementById('interactive-area');
    const pointerInfo = document.getElementById('pointer-info');

    // Initialize the manager with default configurations
    const manager = new AdvancedPointerEventManager(interactiveArea, { debounceTime: 100, moveEventTarget: 'window' });

    // Handler for pointer down
    const handlePointerDown = (event, state) => {
      pointerInfo.textContent = `Pointer Down at (${event.clientX}, ${event.clientY})\nActive Pointers: ${state.size}`;
      interactiveArea.style.backgroundColor = '#c0ffc0';
    };
    manager.on('pointerdown', handlePointerDown);

    // Handler for pointer up
    const handlePointerUp = (event, state) => {
      pointerInfo.textContent = `Pointer Up at (${event.clientX}, ${event.clientY})\nActive Pointers: ${state.size}`;
      interactiveArea.style.backgroundColor = '#e0e0e0';
    };
    manager.on('pointerup', handlePointerUp);

    // Handler for pointer move
    const handlePointerMove = (event, state) => {
      let info = `<strong>Pointer Move</strong>\n`;
      state.forEach((pointer, id) => {
        info += `Pointer ${id}: (${pointer.position.x.toFixed(2)}, ${pointer.position.y.toFixed(2)}) | Speed: ${pointer.speed.toFixed(2)} px/s\n`;
      });
      pointerInfo.innerHTML = info;
    };
    manager.on('pointermove', handlePointerMove, 50); // Debounced by 50ms

    // Handler for click events
    const handleClick = (event) => {
      console.log('Element clicked at:', event.clientX, event.clientY);
    };
    manager.on('click', handleClick);

    // Handler for double-click events
    const handleDblClick = (event) => {
      console.log('Element double-clicked at:', event.clientX, event.clientY);
    };
    manager.on('dblclick', handleDblClick);

    // Handler for context menu events with custom behavior
    const handleContextMenu = (event) => {
      event.preventDefault(); // Prevent the default context menu
      alert(`Custom context menu at (${event.clientX}, ${event.clientY})`);
    };
    manager.on('contextmenu', handleContextMenu);

    // Periodically log the pointer state
    setInterval(() => {
      const state = manager.getState();
      console.log('Current Pointer State:', state);
    }, 5000);
  </script>
</body>
</html>
```

### Advanced Usage with Async Handlers

This example demonstrates how to use asynchronous event handlers, allowing for operations like fetching data or awaiting user inputs within handlers.

#### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AdvancedPointerEventManager Async Demo</title>
  <style>
    #interactive-area {
      width: 600px;
      height: 400px;
      background-color: #e0e0e0;
      border: 2px solid #333;
      position: relative;
      margin: 50px auto;
      user-select: none;
    }
    #pointer-info {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.9);
      padding: 10px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
      white-space: pre-line; /* Preserve line breaks */
    }
  </style>
</head>
<body>
  <div id="interactive-area">
    <div id="pointer-info">Pointer Info</div>
  </div>

  <!-- Include the compiled library as an ES module -->
  <script type="module">
    import { AdvancedPointerEventManager } from './dist/AdvancedPointerEventManager.js';

    const interactiveArea = document.getElementById('interactive-area');
    const pointerInfo = document.getElementById('pointer-info');

    // Initialize the manager with default configurations
    const manager = new AdvancedPointerEventManager(interactiveArea, { debounceTime: 100, moveEventTarget: 'window' });

    // Asynchronous handler for pointer down
    const handlePointerDownAsync = async (event, state) => {
      // Simulate an asynchronous operation (e.g., fetching data)
      await new Promise(resolve => setTimeout(resolve, 100));
      pointerInfo.textContent = `Async Pointer Down at (${event.clientX}, ${event.clientY})\nActive Pointers: ${state.size}`;
      interactiveArea.style.backgroundColor = '#c0ffc0';
    };
    manager.on('pointerdown', handlePointerDownAsync);

    // Asynchronous handler for pointer move
    const handlePointerMoveAsync = async (event, state) => {
      // Simulate an asynchronous operation (e.g., sending data to a server)
      await fetch('https://api.example.com/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointerId: event.pointerId,
          position: { x: event.clientX, y: event.clientY },
          speed: state.get(event.pointerId)?.speed || 0,
        }),
      }).catch(err => console.error('Failed to log pointer move:', err));

      let info = `<strong>Async Pointer Move</strong>\n`;
      state.forEach((pointer, id) => {
        info += `Pointer ${id}: (${pointer.position.x.toFixed(2)}, ${pointer.position.y.toFixed(2)}) | Speed: ${pointer.speed.toFixed(2)} px/s\n`;
      });
      pointerInfo.innerHTML = info;
    };
    manager.on('pointermove', handlePointerMoveAsync, 50); // Debounced by 50ms

    // Asynchronous handler for click events
    const handleClickAsync = async (event) => {
      // Simulate an asynchronous operation
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log('Async Element clicked at:', event.clientX, event.clientY);
    };
    manager.on('click', handleClickAsync);

    // Periodically log the pointer state
    setInterval(async () => {
      const state = manager.getState();
      console.log('Current Pointer State:', state);
    }, 5000);
  </script>
</body>
</html>
```

### Setting Initial Positions

This example shows how to programmatically set initial positions for pointers, which is useful for simulations or testing scenarios.

#### HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AdvancedPointerEventManager Initial Position Demo</title>
  <style>
    #interactive-area {
      width: 600px;
      height: 400px;
      background-color: #e0e0e0;
      border: 2px solid #333;
      position: relative;
      margin: 50px auto;
      user-select: none;
    }
    #pointer-info {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.9);
      padding: 10px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
      white-space: pre-line; /* Preserve line breaks */
    }
  </style>
</head>
<body>
  <div id="interactive-area">
    <div id="pointer-info">Pointer Info</div>
  </div>

  <!-- Include the compiled library as an ES module -->
  <script type="module">
    import { AdvancedPointerEventManager } from './dist/AdvancedPointerEventManager.js';

    const interactiveArea = document.getElementById('interactive-area');
    const pointerInfo = document.getElementById('pointer-info');

    // Initialize the manager with default configurations
    const manager = new AdvancedPointerEventManager(interactiveArea, { debounceTime: 100, moveEventTarget: 'window' });

    // Set initial positions for two pointers
    manager.setInitialPointerPosition(1, { x: 150, y: 150 });
    manager.setInitialPointerPosition(2, { x: 300, y: 200 });

    // Handler for pointer down
    const handlePointerDown = (event, state) => {
      pointerInfo.textContent = `Pointer Down at (${event.clientX}, ${event.clientY})\nActive Pointers: ${state.size}`;
      interactiveArea.style.backgroundColor = '#c0ffc0';
    };
    manager.on('pointerdown', handlePointerDown);

    // Handler for pointer move
    const handlePointerMove = (event, state) => {
      let info = `<strong>Pointer Move</strong>\n`;
      state.forEach((pointer, id) => {
        info += `Pointer ${id}: (${pointer.position.x.toFixed(2)}, ${pointer.position.y.toFixed(2)}) | Speed: ${pointer.speed.toFixed(2)} px/s\n`;
      });
      pointerInfo.innerHTML = info;
    };
    manager.on('pointermove', handlePointerMove, 50); // Debounced by 50ms

    // Periodically log the pointer state
    setInterval(() => {
      const state = manager.getState();
      console.log('Current Pointer State:', state);
    }, 5000);
  </script>
</body>
</html>
```

---

## API Reference

### Classes

#### `AdvancedPointerEventManager`

Manages pointer and mouse events with advanced features such as multiple pointer tracking, velocity and acceleration calculations, debouncing, initial position setting, asynchronous event handlers, and a publish-subscribe system.

##### Constructor

```typescript
constructor(element: HTMLElement, config?: PointerEventManagerConfig)
```

- **Parameters:**
    - `element`: The HTML element to attach event listeners to.
    - `config` (optional): Configuration object.
        - `debounceTime`: Default debounce time in milliseconds for event handlers.
        - `moveEventTarget`: Target for `"pointermove"` events. Can be `'element'`, `'window'`, or `'document'`. Defaults to `'element'`.

##### Methods

- `on(eventType: PubSubEventType, handler: PubSubHandlers[K], debounceTime?: number): void`

  Subscribes a handler to a specific event type. Handlers can be asynchronous functions.

    - **Parameters:**
        - `eventType`: Type of the event (e.g., `'pointermove'`).
        - `handler`: Callback function to execute when the event occurs. Can be synchronous or asynchronous.
        - `debounceTime` (optional): Debounce time in milliseconds. Overrides the default `debounceTime` set in the configuration for this handler.

- `off(eventType: PubSubEventType, handler: PubSubHandlers[K]): void`

  Unsubscribes a handler from a specific event type.

    - **Parameters:**
        - `eventType`: Type of the event.
        - `handler`: The handler function to remove.

- `destroy(): void`

  Removes all event listeners and cleans up resources.

- `getState(): PointerState`

  Retrieves the current state of all active pointers, including their positions, velocities, accelerations, and speeds.

    - **Returns:**  
      `PointerState` object containing a `Map` of active pointers keyed by `pointerId`.

- `setInitialPointerPosition(pointerId: number, position: { x: number; y: number }): void`

  Programmatically sets the initial position of a pointer.

    - **Parameters:**
        - `pointerId`: The identifier of the pointer.
        - `position`: An object containing `x` and `y` coordinates.

### Interfaces

#### `PointerEventManagerConfig`

Configuration options for the `AdvancedPointerEventManager`.

```typescript
interface PointerEventManagerConfig {
  debounceTime?: number; // Default debounce time in milliseconds
  moveEventTarget?: 'element' | 'window' | 'document'; // Target for pointermove events
}
```

- **Properties:**
    - `debounceTime` (optional): Sets the default debounce time in milliseconds for event handlers.
    - `moveEventTarget` (optional): Specifies the target for `"pointermove"` events. Can be `'element'`, `'window'`, or `'document'`. Defaults to `'element'`.

#### `PointerState`

Represents the current state of all active pointers.

```typescript
interface PointerState {
  pointers: Map<number, SinglePointerState>;
}
```

- **Properties:**
    - `pointers`: A `Map` where each key is a `pointerId` and the value is a `SinglePointerState`.

#### `SinglePointerState`

Represents the state of a single pointer.

```typescript
interface SinglePointerState {
  isDown: boolean;
  position: { x: number; y: number };
  velocity: { vx: number; vy: number };
  acceleration: { ax: number; ay: number };
  speed: number;
}
```

- **Properties:**
    - `isDown`: Indicates if the pointer is currently pressed.
    - `position`: Current `x` and `y` coordinates of the pointer.
    - `velocity`: Current velocity components (`vx`, `vy`) in pixels per second.
    - `acceleration`: Current acceleration components (`ax`, `ay`) in pixels per second squared.
    - `speed`: Current speed of the pointer in pixels per second.

#### `PubSubHandlers`

Defines the handler functions for each event type in the pub-sub system.

```typescript
interface PubSubHandlers {
  pointerdown?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
  pointerup?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
  pointermove?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
  pointerenter?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
  pointerleave?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
  pointercancel?: (event: PointerEvent, state: Map<number, any>) => void | Promise<void>;
  click?: (event: MouseEvent) => void | Promise<void>;
  dblclick?: (event: MouseEvent) => void | Promise<void>;
  contextmenu?: (event: MouseEvent) => void | Promise<void>;
}
```

- **Handlers:**
    - Each event type has an optional handler that can be synchronous or asynchronous (`Promise<void>`).

### Types

#### `PointerEventType`

Enumerates the supported pointer and mouse event types.

```typescript
type PointerEventType =
  | 'pointerdown'
  | 'pointerup'
  | 'pointermove'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointercancel'
  | 'click'
  | 'dblclick'
  | 'contextmenu';
```

#### `PubSubEventType`

Enumerates the event types supported by the pub-sub system.

```typescript
type PubSubEventType =
  | 'pointerdown'
  | 'pointerup'
  | 'pointermove'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointercancel'
  | 'click'
  | 'dblclick'
  | 'contextmenu';
```
 
## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

### Steps to Contribute

1. **Fork the Repository**

2. **Create a New Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Make Your Changes**

4. **Commit Your Changes**

   ```bash
   git commit -m "Add Your Feature"
   ```

5. **Push to the Branch**

   ```bash
   git push origin feature/YourFeatureName
   ```

6. **Open a Pull Request**

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- Inspired by the need for efficient and flexible pointer event management in modern web applications.
- Built with TypeScript to ensure type safety and enhance developer experience.

```
