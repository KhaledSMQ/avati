import { Component } from './Component';
export declare class Renderer {
    private static currentComponent;
    static withComponent<T>(component: Component<any, any>, fn: () => T): T;
    static getCurrentComponent(): Component<any, any> | null;
}
