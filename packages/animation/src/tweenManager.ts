// TweenManager to handle multiple tweens efficiently

import { Tween } from './tween';

export class TweenManager {
    private static tweens: Set<Tween<any>> = new Set();
    private static animationFrame: number | null = null;

    static add(tween: Tween<any>): void {
        this.tweens.add(tween);
        if (!this.animationFrame) {
            this.startLoop();
        }
    }

    static remove(tween: Tween<any>): void {
        this.tweens.delete(tween);
        if (this.tweens.size === 0 && this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    private static startLoop(): void {
        let lastTime = Date.now();
        const loop = () => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            this.tweens.forEach((tween) => tween.update(deltaTime));

            if (this.tweens.size > 0) {
                this.animationFrame = requestAnimationFrame(loop);
            } else {
                this.animationFrame = null;
            }
        };
        this.animationFrame = requestAnimationFrame(loop);
    }
}
