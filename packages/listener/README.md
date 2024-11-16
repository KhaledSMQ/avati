# EventListenerManager HTML Showcases

Below are practical HTML examples demonstrating how to use the `EventListenerManager` in a web page. Each example illustrates different features and use cases, such as debouncing, throttling, asynchronous callbacks, error handling, and metadata attachment.

---

## **Prerequisites**

To use the `EventListenerManager` in your HTML files, you need to include it in your project. Assuming you have the compiled JavaScript version of the `EventListenerManager`, you can include it using a `<script>` tag.

For demonstration purposes, we'll assume the `EventListenerManager` is available in a file named `EventListenerManager.js`.

---

## **1. Basic Usage**

### **HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EventListenerManager - Basic Usage</title>
</head>
<body>
  <button id="myButton">Click Me</button>

  <!-- Include the EventListenerManager script -->
  <script src="EventListenerManager.js"></script>
  <script>
    // Wait for the DOM to load
    document.addEventListener('DOMContentLoaded', () => {
      const button = document.getElementById('myButton');

      function handleClick(event) {
        alert('Button clicked!');
      }

      // Add an event listener using EventListenerManager
      const eventId = eventManager.add(button, 'click', handleClick);

      // Optionally, remove the event listener after some time
      setTimeout(() => {
        eventManager.remove(eventId);
        console.log('Event listener removed');
      }, 10000); // Removes the listener after 10 seconds
    });
  </script>
</body>
</html>
```

### **Explanation**

- We include the `EventListenerManager.js` script in the HTML file.
- We use `eventManager.add()` to attach a click event listener to the button.
- After 10 seconds, we remove the event listener using `eventManager.remove()`.

---

## **2. Debouncing Input Events**

### **HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EventListenerManager - Debounce Example</title>
  <style>
    #output {
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <input type="text" id="searchInput" placeholder="Type to search..." />
  <div id="output"></div>

  <!-- Include the EventListenerManager script -->
  <script src="EventListenerManager.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const input = document.getElementById('searchInput');
      const output = document.getElementById('output');

      function handleInput(event) {
        const query = event.target.value;
        output.textContent = `Searching for: ${query}`;
      }

      // Debounce the input event handler
      eventManager.add(input, 'input', handleInput, { debounce: 500 });
    });
  </script>
</body>
</html>
```

### **Explanation**

- As the user types in the input field, the `handleInput` function is called after the user stops typing for 500 milliseconds.
- This reduces the number of times the search function is called, which is especially useful when making API requests.

---

## **3. Throttling Scroll Events**

### **HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EventListenerManager - Throttle Example</title>
  <style>
    body {
      height: 2000px;
    }
    #scrollPosition {
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.8);
      padding: 5px;
    }
  </style>
</head>
<body>
  <div id="scrollPosition">Scroll Y: 0</div>

  <!-- Include the EventListenerManager script -->
  <script src="EventListenerManager.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const scrollDisplay = document.getElementById('scrollPosition');

      function handleScroll() {
        scrollDisplay.textContent = `Scroll Y: ${window.scrollY}`;
      }

      // Throttle the scroll event handler
      eventManager.add(window, 'scroll', handleScroll, { throttle: 100 });
    });
  </script>
</body>
</html>
```

### **Explanation**

- The `handleScroll` function updates the displayed scroll position.
- By throttling the scroll event handler to 100 milliseconds, we limit the number of times the function is called during scrolling, improving performance.

---

## **4. Using Async Callbacks**

### **HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EventListenerManager - Async Callback Example</title>
</head>
<body>
  <form id="myForm">
    <input type="text" name="data" placeholder="Enter some data" required />
    <button type="submit">Submit</button>
  </form>
  <div id="status"></div>

  <!-- Include the EventListenerManager script -->
  <script src="EventListenerManager.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('myForm');
      const status = document.getElementById('status');

      async function handleSubmit(event) {
        event.preventDefault();
        status.textContent = 'Submitting...';

        // Simulate an asynchronous operation (e.g., network request)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        status.textContent = 'Form submitted successfully!';
      }

      // Add an async event listener
      eventManager.add(form, 'submit', handleSubmit, { async: true });
    });
  </script>
</body>
</html>
```

### **Explanation**

- The `handleSubmit` function is asynchronous and simulates a network request.
- The `async` option ensures that any errors in the async function are caught and can be handled appropriately.

---

## **5. Error Handling with onError**

### **HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EventListenerManager - Error Handling Example</title>
</head>
<body>
  <button id="errorButton">Click Me</button>
  <div id="errorMessage" style="color: red;"></div>

  <!-- Include the EventListenerManager script -->
  <script src="EventListenerManager.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const button = document.getElementById('errorButton');
      const errorMessage = document.getElementById('errorMessage');

      function handleClick() {
        // Simulate an error
        throw new Error('Something went wrong!');
      }

      function handleError(error) {
        errorMessage.textContent = `Error: ${error.message}`;
      }

      // Add event listener with error handling
      eventManager.add(button, 'click', handleClick, { onError: handleError });
    });
  </script>
</body>
</html>
```

### **Explanation**

- When the button is clicked, the `handleClick` function throws an error.
- The `onError` handler catches the error and displays an error message to the user.

---

## **6. Attaching Metadata to Events**

### **HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EventListenerManager - Metadata Example</title>
</head>
<body>
  <button id="metaButton">Click Me</button>

  <!-- Include the EventListenerManager script -->
  <script src="EventListenerManager.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const button = document.getElementById('metaButton');

      function handleClick(event) {
        if (event.metadata) {
          console.log('Event ID:', event.metadata.eventId);
          console.log('Timestamp:', new Date(event.metadata.timestamp));
          console.log('Original Callback:', event.metadata.originalCallback);
        }
        alert('Button clicked!');
      }

      // Add event listener with metadata
      eventManager.add(button, 'click', handleClick, { metadata: true });
    });
  </script>
</body>
</html>
```

### **Explanation**

- The `handleClick` function accesses metadata attached to the event object.
- This can be useful for logging or debugging purposes.

---

## **7. Using once() for One-Time Event Listeners**

### **HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EventListenerManager - Once Example</title>
</head>
<body>
  <button id="onceButton">Click Me Once</button>

  <!-- Include the EventListenerManager script -->
  <script src="EventListenerManager.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const button = document.getElementById('onceButton');

      function handleClick() {
        alert('This will only appear once!');
      }

      // Add a one-time event listener
      eventManager.once(button, 'click', handleClick);
    });
  </script>
</body>
</html>
```

### **Explanation**

- The `handleClick` function will only be called once, after which the event listener is automatically removed.

---

## **8. Automatic Cleanup with addWithCleanup**

### **HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EventListenerManager - Cleanup Example</title>
</head>
<body>
  <button id="cleanupButton">Click Me</button>
  <button id="removeListenerButton">Remove Listener</button>

  <!-- Include the EventListenerManager script -->
  <script src="EventListenerManager.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const clickButton = document.getElementById('cleanupButton');
      const removeButton = document.getElementById('removeListenerButton');

      function handleClick() {
        alert('Button clicked!');
      }

      // Add event listener with cleanup
      const cleanup = eventManager.addWithCleanup(clickButton, 'click', handleClick);

      // Remove the event listener when the remove button is clicked
      removeButton.addEventListener('click', () => {
        cleanup();
        alert('Event listener removed');
      });
    });
  </script>
</body>
</html>
```

### **Explanation**

- The `addWithCleanup` method provides a convenient way to remove event listeners without tracking the `eventId`.
- Clicking the "Remove Listener" button calls the cleanup function, removing the event listener from the "Click Me" button.

---

## **9. Combining Debounce and Async Callbacks**

### **HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EventListenerManager - Debounce and Async Example</title>
</head>
<body>
  <input type="text" id="searchInput" placeholder="Type to search..." />
  <div id="results"></div>

  <!-- Include the EventListenerManager script -->
  <script src="EventListenerManager.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const input = document.getElementById('searchInput');
      const results = document.getElementById('results');

      async function handleInput(event) {
        const query = event.target.value;
        if (!query) {
          results.textContent = '';
          return;
        }
        results.textContent = 'Searching...';

        // Simulate an asynchronous search operation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        results.textContent = `Results for "${query}"`;
      }

      // Debounce the async input handler
      eventManager.add(input, 'input', handleInput, { debounce: 500, async: true });
    });
  </script>
</body>
</html>
```

### **Explanation**

- This example demonstrates combining debouncing with an asynchronous callback.
- The search operation is debounced to reduce unnecessary function calls and handle asynchronous operations smoothly.

---

## **10. Throttling with noLeading and noTrailing Options**

### **HTML**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EventListenerManager - Throttle Options Example</title>
  <style>
    body {
      height: 2000px;
    }
    #scrollInfo {
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.8);
      padding: 5px;
    }
  </style>
</head>
<body>
  <div id="scrollInfo">Scroll Y: 0</div>

  <!-- Include the EventListenerManager script -->
  <script src="EventListenerManager.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const scrollInfo = document.getElementById('scrollInfo');

      function handleScroll() {
        scrollInfo.textContent = `Scroll Y: ${window.scrollY}`;
      }

      // Throttle with no leading call
      eventManager.add(window, 'scroll', handleScroll, {
        throttle: 200,
        noLeading: true,
      });

      // Uncomment the following code to throttle with no trailing call
      /*
      eventManager.add(window, 'scroll', handleScroll, {
        throttle: 200,
        noTrailing: true,
      });
      */
    });
  </script>
</body>
</html>
```

### **Explanation**

- The `noLeading` option prevents the callback from being called immediately when the event first fires.
- The `noTrailing` option (when enabled) prevents the callback from being called after the throttle period ends if additional events occurred.

---

## **Notes on Usage**

- Ensure that the `EventListenerManager.js` script is correctly included and accessible in your HTML files.
- For modules or bundlers (like Webpack), you may need to adjust the import statements accordingly.
- Always test the event listeners in different browsers to ensure compatibility.

---

## **Conclusion**

These HTML examples showcase how to use the `EventListenerManager` in various scenarios. By leveraging its advanced features, you can write cleaner, more efficient event handling code in your web applications.

Feel free to modify and adapt these examples to suit your specific needs. Happy coding!
