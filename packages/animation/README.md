# TypeScript Tweening Library

A lightweight and flexible tweening library for TypeScript that supports various data types and easing functions. This library provides smooth animations between values with customizable easing functions and supports numbers, colors, 2D vectors, and arrays.

## Features

- 🎯 Strong TypeScript support with type safety
- 🎨 Multiple data type support:
    - Numbers
    - Colors (hex format)
    - 2D Vectors
    - Arrays of numbers
- 🌊 Built-in easing functions:
    - Linear
    - Cubic (In/Out/InOut)
    - Quadratic (In/Out/InOut)
    - Elastic
    - Bounce
- ⚡ Efficient animation management with RequestAnimationFrame
- 🎮 Simple and intuitive API

## Installation

```bash
npm install @avatijs/animation
# or
yarn add @avatijs/animation
```

## Usage

### Basic Example

```typescript
import { Tween } from '@avatijs/animation';

// Animate a number from 0 to 100
const numberTween = new Tween({
    from: 0,
    to: 100,
    duration: 1000, // milliseconds
    onUpdate: (value) => {
        console.log('Current value:', value);
    },
    onComplete: () => {
        console.log('Animation completed!');
    }
});

numberTween.start();
```

### Animating Different Types

#### Color Animation

```typescript
const colorTween = new Tween({
    from: '#ff0000',
    to: '#0000ff',
    duration: 2000,
    easing: Tween.EasingFunctions.easeInOutCubic,
    onUpdate: (color) => {
        element.style.backgroundColor = color;
    }
});
```

#### 2D Vector Animation

```typescript
const vectorTween = new Tween({
    from: { x: 0, y: 0 },
    to: { x: 100, y: 200 },
    duration: 1500,
    onUpdate: (position) => {
        element.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
});
```

#### Array Animation

```typescript
const arrayTween = new Tween({
    from: [0, 0, 0],
    to: [100, 200, 300],
    duration: 1000,
    onUpdate: ([x, y, z]) => {
        element.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    }
});
```

### Using Different Easing Functions

```typescript
// Available easing functions
const easings = Tween.EasingFunctions;
// - linear
// - easeInCubic
// - easeOutCubic
// - easeInOutCubic
// - easeInQuad
// - easeOutQuad
// - easeInOutQuad
// - easeInElastic
// - bounce

const tween = new Tween({
    from: 0,
    to: 100,
    duration: 1000,
    easing: Tween.EasingFunctions.bounce,
    onUpdate: (value) => {
        // Update logic
    }
});
```

## Best Practices

1. **Cleanup**: Always stop tweens when they're no longer needed, especially when removing elements:
```typescript
// Stop the tween
tween.stop();
```

2. **Error Handling**: Wrap tween creation in try-catch blocks when dealing with user input:
```typescript
try {
    const tween = new Tween({...});
    tween.start();
} catch (error) {
    console.error('Invalid tween configuration:', error);
}
```

3. **Performance**:
    - Avoid creating many simultaneous tweens
    - Use appropriate duration values (typically 200-2000ms)
    - Consider using requestAnimationFrame for smooth animations (built-in)

## Common Pitfalls to Avoid

- ❌ Don't create tweens in rapid succession without cleaning up old ones
- ❌ Don't use extremely short durations (<100ms) as they may appear jerky
- ❌ Don't forget to handle the cleanup when the component/element is destroyed
- ❌ Don't use heavy computations in onUpdate callbacks
- ❌ Don't create infinitely running tweens without a way to stop them

## Advanced Usage

### Chaining Tweens

```typescript
const tween1 = new Tween({
    from: 0,
    to: 100,
    duration: 1000,
    onUpdate: (value) => {
        // First animation
    },
    onComplete: () => {
        // Start the next tween when this one completes
        tween2.start();
    }
});

const tween2 = new Tween({
    from: 100,
    to: 0,
    duration: 1000,
    onUpdate: (value) => {
        // Second animation
    }
});

// Start the chain
tween1.start();
```


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
