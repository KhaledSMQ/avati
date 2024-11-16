import { ISignal } from './core_types';

/**
 * Signal value wrapper for reactive state management
 */
export class Signal<T> implements ISignal<T> {
    protected _value: T;
    protected _version: number = 0;
    protected _subscribers = new Set<() => void>();
    protected _computedSubscribers = new Set<ComputedSignal<any>>();
    protected _equals: (prev: T, next: T) => boolean;

    constructor(
        initialValue: T,
        options: {
            equals?: (prev: T, next: T) => boolean;
        } = {}
    ) {
        this._value = initialValue;
        this._equals = options.equals || ((prev, next) => Object.is(prev, next));
    }

    get subscribers(): Set<() => void> {
        return this._subscribers;
    }

    unsubscribe(callback: () => void): void {
        throw new Error('Method not implemented.');
    }

    emit(value: T): void {
        throw new Error('Method not implemented.');
    }

    /**
     * Get the current value
     */
    get value(): T {
        // Track this signal in the current computation if one exists
        Signal._trackSignal(this);
        return this._value;
    }

    /**
     * Set a new value and notify subscribers if changed
     */
    set value(newValue: T) {
        if (!this._equals(this._value, newValue)) {
            this._value = newValue;
            this._version++;
            this._notify();
        }
    }

    /**
     * Update value using a function
     */
    update(fn: (current: T) => T): void {
        const newValue = fn(this._value);
        if (!this._equals(this._value, newValue)) {
            this._value = newValue;
            this._version++;
            this._notify();
        }
    }

    /**
     * Subscribe to value changes
     */
    subscribe(callback: () => void): () => void {
        this._subscribers.add(callback);
        return () => {
            this._subscribers.delete(callback);
        };
    }

    /**
     * Subscribe a computed signal
     */
    _subscribeComputed(computed: ComputedSignal<any>): void {
        this._computedSubscribers.add(computed);
    }

    /**
     * Unsubscribe a computed signal
     */
    _unsubscribeComputed(computed: ComputedSignal<any>): void {
        this._computedSubscribers.delete(computed);
    }

    /**
     * Notify all subscribers of changes
     */
    protected _notify(): void {
        // First notify computed signals
        for (const computed of this._computedSubscribers) {
            computed._recompute();
        }
        // Then notify regular subscribers
        for (const callback of this._subscribers) {
            callback();
        }
    }

    // Static tracking for automatic dependency collection
    static _currentComputation: ComputedSignal<any> | null = null;

    static _trackSignal(signal: Signal<any>): void {
        if (this._currentComputation) {
            signal._subscribeComputed(this._currentComputation);
        }
    }

    static _setCurrentComputation(computation: ComputedSignal<any> | null): void {
        this._currentComputation = computation;
    }
}

/**
 * Computed signal that derives its value from other signals
 */
export class ComputedSignal<T> extends Signal<T> {
    private _compute: () => T;
    private _dependencies = new Set<Signal<any>>();
    private _dirty = true;

    constructor(compute: () => T) {
        super(undefined as T);
        this._compute = compute;
    }

    get value(): T {
        if (this._dirty) {
            this._recompute();
        }
        return super.value;
    }

    set value(_: T) {
        throw new Error('Cannot set the value of a computed signal directly');
    }

    /**
     * Recompute the value if dependencies have changed
     */
    _recompute(): void {
        // Clean up old dependencies
        for (const dep of this._dependencies) {
            dep._unsubscribeComputed(this);
        }
        this._dependencies.clear();

        // Track new dependencies during computation
        Signal._setCurrentComputation(this);
        try {
            const newValue = this._compute();
            if (!this._equals(this._value, newValue)) {
                this._value = newValue;
                this._notify();
            }
        } finally {
            Signal._setCurrentComputation(null);
        }

        this._dirty = false;
    }

    /**
     * Mark the computed value as dirty when dependencies change
     */
    _markDirty(): void {
        this._dirty = true;
        // Notify computed signals that depend on this one
        for (const computed of this._computedSubscribers) {
            computed._markDirty();
        }
        // Notify regular subscribers
        for (const callback of this._subscribers) {
            callback();
        }
    }
}

/**
 * Create a simple signal
 */
export function createSignal<T>(
    initialValue: T,
    options?: { equals?: (prev: T, next: T) => boolean }
): Signal<T> {
    return new Signal(initialValue, options);
}

/**
 * Create a computed signal
 */
export function computed<T>(compute: () => T): Signal<T> {
    return new ComputedSignal(compute);
}

/**
 * Create an effect that runs when dependencies change
 */
export function effect(fn: () => void): () => void {
    let cleanup: (() => void) | void;
    const signal = computed(() => {
        if (cleanup) cleanup();
        cleanup = fn();
        return undefined;
    });

    // Initial run
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    signal.value;

    // Return cleanup function
    return () => {
        if (cleanup) cleanup();
    };
}

/**
 * Batch multiple signal updates
 */
export function batch(fn: () => void): void {
    const prevBatch = Signal._currentComputation;
    Signal._setCurrentComputation(null);
    try {
        fn();
    } finally {
        Signal._setCurrentComputation(prevBatch);
    }
}

// Example usage:
/*
// Create a simple signal
const count = createSignal(0);
const doubled = computed(() => count.value * 2);

// Subscribe to changes
const unsubscribe = count.subscribe(() => {
  console.log('Count changed:', count.value);
});

// Create an effect
const cleanup = effect(() => {
  console.log('Doubled value:', doubled.value);
});

// Update value
count.value = 5;

// Batch updates
batch(() => {
  count.value = 10;
  count.value = 20;
}); // Only triggers one update

// Cleanup
unsubscribe();
cleanup();

// Custom equality function
const obj = createSignal({ x: 0 }, {
  equals: (prev, next) => prev.x === next.x
});

// Class component integration
class Counter extends Component {
  private count = createSignal(0);
  private doubled = computed(() => this.count.value * 2);

  componentDidMount() {
    // Add signal to component for cleanup
    this._signals = new Set([this.count, this.doubled]);
  }

  render() {
    return {
      type: 'div',
      props: {
        children: [
          {
            type: 'button',
            props: {
              onClick: () => this.count.value++,
              children: `Count: ${this.count.value}`
            }
          },
          {
            type: 'div',
            props: {
              children: `Doubled: ${this.doubled.value}`
            }
          }
        ]
      }
    };
  }
}
*/
