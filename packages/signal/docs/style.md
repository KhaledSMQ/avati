# Style Signal

A reactive signal for handling DOM style manipulations with type safety, animations, and transitions.

## Introduction
StyleSignal provides a declarative way to handle DOM styling through signals, offering smooth transitions, animations, and class management. It's designed for efficient style updates while maintaining type safety and providing a clean API for common styling operations.

## Features
- Type-safe style manipulations
- Smooth transitions and animations
- CSS class management
- Batch updates
- Automatic cleanup
- Framework agnostic
- High performance

## Basic Usage

```typescript
import { StyleSignal } from '@signal/style';

// Create style signal
const boxStyle = new StyleSignal({
  width: '100px',
  height: '100px',
  backgroundColor: 'blue'
});

// Apply styles to element
boxStyle.subscribe(styles => {
  Object.assign(element.style, styles);
});
```

## Common Use Cases

### Interactive Element
```typescript
const buttonStyle = new StyleSignal({
  padding: '10px 20px',
  backgroundColor: '#3b82f6',
  color: 'white',
  transition: 'all 0.3s ease'
});

// Hover effect
element.addEventListener('mouseenter', () => {
  buttonStyle.setMultiple({
    backgroundColor: '#2563eb',
    transform: 'scale(1.05)'
  });
});

element.addEventListener('mouseleave', () => {
  buttonStyle.setMultiple({
    backgroundColor: '#3b82f6',
    transform: 'scale(1)'
  });
});
```

### Animated Modal
```typescript
const modalStyle = new StyleSignal({
  opacity: '0',
  transform: 'translateY(-20px)',
}, {
  transition: {
    duration: '0.3s',
    timing: 'ease-in-out',
    properties: ['opacity', 'transform']
  }
});

const showModal = () => {
  modalStyle.setMultiple({
    opacity: '1',
    transform: 'translateY(0)'
  });
};

const hideModal = () => {
  modalStyle.setMultiple({
    opacity: '0',
    transform: 'translateY(-20px)'
  });
};
```

## Best Practices

### Do's ✅

#### 1. Use Transitions for Smooth Updates
```typescript
// Good - Smooth transitions
const element = new StyleSignal(
  { opacity: '0' },
  {
    transition: {
      duration: '0.3s',
      timing: 'ease-in-out'
    }
  }
);
```

#### 2. Batch Related Updates
```typescript
// Good - Single update for related changes
styles.setMultiple({
  width: '200px',
  height: '200px',
  padding: '20px'
});
```

#### 3. Use Type Safety
```typescript
// Good - Type-safe property names
interface Theme {
  primary: string;
  secondary: string;
}

const theme: Theme = {
  primary: '#3b82f6',
  secondary: '#ef4444'
};

styles.set('backgroundColor', theme.primary);
```

### Don'ts ❌

#### 1. Avoid Individual Updates for Related Properties
```typescript
// Bad - Multiple individual updates
styles.set('width', '200px');
styles.set('height', '200px');
styles.set('padding', '20px');

// Good - Batch update
styles.setMultiple({
  width: '200px',
  height: '200px',
  padding: '20px'
});
```

#### 2. Skip Cleanup
```typescript
// Bad - Memory leak
const styles = new StyleSignal({});
// ... use styles
// No cleanup

// Good - Proper cleanup
const styles = new StyleSignal({});
// ... use styles
styles.dispose();
```

#### 3. Mix Units Inconsistently
```typescript
// Bad - Inconsistent units
styles.setMultiple({
  width: '100px',
  height: '10rem',
  padding: '20pt'
});

// Good - Consistent units
styles.setMultiple({
  width: '100px',
  height: '100px',
  padding: '20px'
});
```

## Advanced Examples

### Animation Sequences
```typescript
const boxStyle = new StyleSignal({
  width: '100px',
  height: '100px',
  backgroundColor: '#3b82f6'
});

const animate = async () => {
  await boxStyle.animate([
    { transform: 'scale(1) rotate(0deg)' },
    { transform: 'scale(1.2) rotate(180deg)' },
    { transform: 'scale(1) rotate(360deg)' }
  ], {
    duration: 2000,
    easing: 'ease-in-out'
  });
};
```

### Class Management
```typescript
const cardStyle = new StyleSignal({
  padding: '20px',
  className: 'card'
});

// Add classes conditionally
if (isActive) {
  cardStyle.addClass('active');
}

// Toggle classes
cardStyle.toggleClass('highlight');

// Remove classes
cardStyle.removeClass('disabled');
```

### With React
```typescript
function Card({ isActive }) {
  const [styles, computedStyle] = useStyleSignal({
    padding: '20px',
    backgroundColor: '#fff'
  });

  useEffect(() => {
    if (isActive) {
      styles.addClass('active');
      styles.set('backgroundColor', '#f3f4f6');
    } else {
      styles.removeClass('active');
      styles.set('backgroundColor', '#fff');
    }
  }, [isActive]);

  return <div style={computedStyle.value}>Content</div>;
}
```

## Testing
```typescript
describe('StyleSignal', () => {
  let styleSignal: StyleSignal;

  beforeEach(() => {
    styleSignal = new StyleSignal({
      width: '100px',
      height: '100px'
    });
  });

  afterEach(() => {
    styleSignal.dispose();
  });

  it('should update single property', () => {
    styleSignal.set('width', '200px');
    expect(styleSignal.value.width).toBe('200px');
  });

  it('should handle class operations', () => {
    styleSignal.addClass('test');
    expect(styleSignal.value.className).toBe('test');

    styleSignal.toggleClass('test');
    expect(styleSignal.value.className).toBe('');
  });

  it('should animate properties', async () => {
    const animation = styleSignal.animate([
      { opacity: '0' },
      { opacity: '1' }
    ], { duration: 100 });

    await animation;
    expect(styleSignal.value.opacity).toBe('1');
  });
});
```

## Performance Considerations
- Use batch updates with `setMultiple` for related changes
- Configure appropriate transition durations
- Clean up style signals when no longer needed
- Use class toggling for complex state combinations
- Consider using `React.memo` or similar optimizations with framework integration

Remember: StyleSignal provides a powerful way to handle DOM styling reactively. Use batch updates when possible, maintain consistent units, and always clean up to prevent memory leaks.
