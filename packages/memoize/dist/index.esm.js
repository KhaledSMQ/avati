var e={d:function(t,c){for(var i in c)e.o(c,i)&&!e.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:c[i]})},o:function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}},t={};e.d(t,{B:function(){return i}});class c{constructor(e){this.maxSize=e,this.cache=new Map}get(e){if(!this.cache.has(e))return;const t=this.cache.get(e);return this.cache.delete(e),this.cache.set(e,t),t}set(e,t){if(this.cache.has(e))this.cache.delete(e);else if(this.cache.size>=this.maxSize){const e=this.cache.keys().next().value;e&&this.cache.delete(e)}this.cache.set(e,t)}delete(e){this.cache.delete(e)}has(e){return this.cache.has(e)}}function i(e,t={}){const{maxCacheSize:i=1/0,ttl:n}=t,a=new c(i),s=new WeakMap;let r=0;function h(e){return e.map((e=>{return"object"==typeof e&&null!==e?`object:${t=e,s.has(t)||s.set(t,++r),s.get(t)}`:"function"==typeof e?`function:${e.toString()}`:`primitive:${String(e)}`;var t})).join("|")}return function(...t){const c=h(t),i=Date.now(),s=a.get(c);if(s){if(!(void 0!==n&&i-s.timestamp>=n))return s.value;a.delete(c)}const r=e.apply(this,t);return a.set(c,{value:r,timestamp:i}),r}}var n=t.B;export{n as memoize};