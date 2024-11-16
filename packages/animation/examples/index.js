!(function (t, e) {
    'object' == typeof exports && 'object' == typeof module
        ? (module.exports = e())
        : 'function' == typeof define && define.amd
          ? define('Avati', [], e)
          : 'object' == typeof exports
            ? (exports.Avati = e())
            : (t.Avati = e());
})(this, function () {
    return (function () {
        'use strict';
        var t = {
                d: function (e, i) {
                    for (var n in i)
                        t.o(i, n) &&
                            !t.o(e, n) &&
                            Object.defineProperty(e, n, { enumerable: !0, get: i[n] });
                },
                o: function (t, e) {
                    return Object.prototype.hasOwnProperty.call(t, e);
                },
                r: function (t) {
                    'undefined' != typeof Symbol &&
                        Symbol.toStringTag &&
                        Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
                        Object.defineProperty(t, '__esModule', { value: !0 });
                },
            },
            e = {};
        t.r(e),
            t.d(e, {
                Tween: function () {
                    return n;
                },
            });

        class i {
            static add(t) {
                this.tweens.add(t), this.animationFrame || this.startLoop();
            }

            static remove(t) {
                this.tweens.delete(t),
                    0 === this.tweens.size &&
                        this.animationFrame &&
                        (cancelAnimationFrame(this.animationFrame), (this.animationFrame = null));
            }

            static startLoop() {
                let t = Date.now();
                const e = () => {
                    const i = Date.now(),
                        n = i - t;
                    (t = i),
                        this.tweens.forEach((t) => t.update(n)),
                        this.tweens.size > 0
                            ? (this.animationFrame = requestAnimationFrame(e))
                            : (this.animationFrame = null);
                };
                this.animationFrame = requestAnimationFrame(e);
            }
        }

        (i.tweens = new Set()), (i.animationFrame = null);

        class n {
            constructor(t) {
                (this.startTime = 0),
                    (this.isActive = !1),
                    (this.from = t.from),
                    (this.to = t.to),
                    (this.duration = t.duration),
                    (this.easingFn = t.easing || n.EasingFunctions.easeInOutCubic),
                    (this.onUpdate = t.onUpdate),
                    (this.onComplete = t.onComplete);
            }

            start() {
                this.isActive || ((this.isActive = !0), (this.startTime = Date.now()), i.add(this));
            }

            stop() {
                this.isActive && ((this.isActive = !1), i.remove(this));
            }

            update(t) {
                if (!this.isActive) return;
                const e = Date.now() - this.startTime;
                let n = Math.min(e / this.duration, 1);
                n = this.easingFn(n);
                const o = this.interpolate(this.from, this.to, n);
                this.onUpdate(o),
                    e >= this.duration &&
                        ((this.isActive = !1),
                        i.remove(this),
                        this.onComplete && this.onComplete());
            }

            interpolate(t, e, i) {
                if ('number' == typeof t && 'number' == typeof e) return t + (e - t) * i;
                if (this.isVector2D(t) && this.isVector2D(e))
                    return {
                        x: t.x + (e.x - t.x) * i,
                        y: t.y + (e.y - t.y) * i,
                    };
                if (
                    'string' == typeof t &&
                    'string' == typeof e &&
                    this.isHexColor(t) &&
                    this.isHexColor(e)
                )
                    return this.interpolateColor(t, e, i);
                if (
                    Array.isArray(t) &&
                    Array.isArray(e) &&
                    t.length === e.length &&
                    t.every((t) => 'number' == typeof t) &&
                    e.every((t) => 'number' == typeof t)
                )
                    return t.map((t, n) => t + (e[n] - t) * i);
                throw new Error('Interpolation for the given type is not implemented.');
            }

            isVector2D(t) {
                return (
                    'object' == typeof t &&
                    'x' in t &&
                    'y' in t &&
                    'number' == typeof t.x &&
                    'number' == typeof t.y
                );
            }

            isHexColor(t) {
                return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(t);
            }

            interpolateColor(t, e, i) {
                const n = this.hexToRGB(t),
                    o = this.hexToRGB(e);
                return `#${((1 << 24) | (Math.round(n.r + (o.r - n.r) * i) << 16) | (Math.round(n.g + (o.g - n.g) * i) << 8) | Math.round(n.b + (o.b - n.b) * i)).toString(16).slice(1)}`;
            }

            hexToRGB(t) {
                let e, i, n;
                return (
                    4 === t.length
                        ? ((e = parseInt(t[1] + t[1], 16)),
                          (i = parseInt(t[2] + t[2], 16)),
                          (n = parseInt(t[3] + t[3], 16)))
                        : ((e = parseInt(t.slice(1, 3), 16)),
                          (i = parseInt(t.slice(3, 5), 16)),
                          (n = parseInt(t.slice(5, 7), 16))),
                    {
                        r: e,
                        g: i,
                        b: n,
                    }
                );
            }
        }

        return (
            (n.EasingFunctions = {
                linear: (t) => t,
                easeInCubic: (t) => t * t * t,
                easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
                easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
                easeInQuad: (t) => t * t,
                easeOutQuad: (t) => t * (2 - t),
                easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1),
                easeInElastic: (t) => {
                    const e = (2 * Math.PI) / 3;
                    return 0 === t
                        ? 0
                        : 1 === t
                          ? 1
                          : -Math.pow(2, 10 * t - 10) * Math.sin((10 * t - 10.75) * e);
                },
                bounce: (t) => {
                    const e = 7.5625,
                        i = 2.75;
                    return t < 1 / i
                        ? e * t * t
                        : t < 2 / i
                          ? e * (t -= 1.5 / i) * t + 0.75
                          : t < 2.5 / i
                            ? e * (t -= 2.25 / i) * t + 0.9375
                            : e * (t -= 2.625 / i) * t + 0.984375;
                },
            }),
            e
        );
    })();
});
