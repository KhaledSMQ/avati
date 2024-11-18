import { Component } from './component';

export class Renderer {
    private static currentComponent: Component<any, any> | null = null;

    static withComponent<T>(component: Component<any, any>, fn: () => T): T {
        const previousComponent = Renderer.currentComponent;
        Renderer.currentComponent = component;
        try {
            return fn();
        } finally {
            Renderer.currentComponent = previousComponent;
        }
    }

    static getCurrentComponent(): Component<any, any> | null {
        return Renderer.currentComponent;
    }
}
