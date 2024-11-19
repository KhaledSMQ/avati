var e={558:function(e){self,e.exports=function(){var e={d:function(t,n){for(var o in n)e.o(n,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:n[o]})},o:function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r:function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{debounce:function(){return r}});const n=new WeakMap,o=e=>({log:(...t)=>e&&console.log("[Debounce]",...t),warn:(...t)=>e&&console.warn("[Debounce]",...t),error:(...t)=>e&&console.error("[Debounce]",...t)});function r(e,t={}){if("function"!=typeof e)throw new TypeError("Expected a function");const{wait:r=0,leading:i=!1,trailing:a=!0,maxWait:l,debug:s=!1,signal:c,onError:u}=t;if(r<0||void 0!==l&&l<r)throw new RangeError("Invalid wait/maxWait values");if(!i&&!a)throw new Error("At least one of leading or trailing must be true");const d=o(s),f={lastInvokeTime:0,pendingPromises:[],aborted:!1};function m(){void 0!==f.timerId&&(clearTimeout(f.timerId),f.timerId=void 0,d.log("Cleared debounce timer")),void 0!==f.maxTimerId&&(clearTimeout(f.maxTimerId),f.maxTimerId=void 0,d.log("Cleared max wait timer"))}function g(){d.log("Cancelling pending invocations"),m(),f.lastInvokeTime=0,f.lastArgs=void 0,f.lastThis=void 0,f.lastCallTime=void 0,h(new Error("Debounced function cancelled")),f.pendingPromises.forEach((({reject:e})=>e(new Error("Debounced function cancelled")))),f.pendingPromises=[]}function h(e){if(d.error("Error occurred:",e),u)try{u(e)}catch(e){d.error("Error in onError callback:",e)}}function p(){return void 0!==f.timerId}function v(e){if(f.aborted)return!1;const t=void 0===f.lastCallTime?0:e-f.lastCallTime,n=e-f.lastInvokeTime;return void 0===f.lastCallTime||t>=r||t<0||void 0!==l&&n>=l}async function b(t){d.log(`Invoking function at ${t}`),f.lastInvokeTime=t;const n=f.lastArgs,o=f.lastThis;f.lastArgs=void 0,f.lastThis=void 0;try{const t=await e.apply(o,n);return f.result=t,f.pendingPromises.forEach((({resolve:e})=>e(t))),f.pendingPromises=[],d.log("Function invoked successfully",t),t}catch(e){const t=e instanceof Error?e:new Error(String(e));d.error("Error in function invocation:",t),h(t);const n=[...f.pendingPromises];f.pendingPromises=[],n.forEach((({reject:e})=>e(t)))}}function w(e){const t=function(e){const t=f.lastCallTime?e-f.lastCallTime:0;return Math.max(0,r-t)}(e);if(f.timerId=setTimeout(y,t),d.log(`Started debounce timer for ${t}ms`),void 0!==l&&!f.maxTimerId){const t=l-(e-f.lastCallTime);f.maxTimerId=setTimeout((()=>{d.log("Max wait timer expired"),m(),b(Date.now())}),Math.max(0,t)),d.log(`Started max wait timer for ${t}ms`)}}function y(){const e=Date.now();if(d.log("Debounce timer expired"),v(e))return function(e){d.log("Trailing edge triggered"),m(),a&&f.lastArgs?b(e):(f.pendingPromises.forEach((({resolve:e})=>{e(f.result)})),f.pendingPromises=[])}(e);w(e)}c&&c.addEventListener("abort",(()=>{f.aborted=!0,g()}));const E=function(...e){if(f.aborted)return Promise.reject(new Error("Debounced function aborted"));const t=Date.now(),n=v(t);return f.lastArgs=e,f.lastThis=this,f.lastCallTime=t,d.log("Function called",{time:t,isInvoking:n,args:e,pending:p()}),new Promise(((e,n)=>{f.pendingPromises.push({resolve:e,reject:n}),void 0===f.timerId?function(e){d.log("Leading edge triggered"),f.lastInvokeTime=e,w(e),i&&b(e)}(t):(m(),w(t))}))};return n.set(E,f),Object.defineProperties(E,{cancel:{value:g,writable:!1,configurable:!1},flush:{value:async function(...e){d.log("Flush requested");const t=e.length>0?e:f.lastArgs,n=f.lastThis;return m(),t?(f.lastArgs=t,f.lastThis=n,b(Date.now())):Promise.resolve(f.result)},writable:!1,configurable:!1},pending:{value:p,writable:!1,configurable:!1},cleanup:{value:function(){d.log("Cleanup initiated"),g(),n.delete(E)},writable:!1,configurable:!1}}),E}return t}()},683:function(e){self,e.exports=function(){var e={d:function(t,n){for(var o in n)e.o(n,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:n[o]})},o:function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r:function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};function n(e,t=1e3/120,n={}){let o,r=null,i=null,a=null,l=!1;const{leading:s=!0,trailing:c=!0,onError:u}=n,d=()=>{if(null===i)return;l=!0;const n=f();try{e.apply(a,i)}catch(e){if(!u)throw e;u(e instanceof Error?e:new Error(String(e)))}finally{l=!1}r=f(),i=null,a=null;const o=f()-n;o>t&&console.warn(`Execution time (${o}ms) exceeded throttle limit (${t}ms)`)},f="undefined"!=typeof performance?()=>performance.now():()=>Date.now(),m=function(...e){const n=f();if(null===r){if(s)return i=e,a=this,void d();r=n}const l=r?t-(n-r):0;i=e,a=this,l<0||l>t?(o&&(clearTimeout(o),o=void 0),r=n,d()):!o&&c&&(e=>{o=setTimeout((()=>{o=void 0,c&&d()}),e)})(l)};return m.cancel=()=>{o&&clearTimeout(o),r=null,i=null,a=null,o=void 0,l=!1},m.flush=()=>{o&&(clearTimeout(o),o=void 0,!l&&c&&i)&&(r?f()-r:1/0)>=t&&d()},m}return e.r(t),e.d(t,{throttle:function(){return n}}),t}()}},t={};function n(o){var r=t[o];if(void 0!==r)return r.exports;var i=t[o]={exports:{}};return e[o](i,i.exports,n),i.exports}n.d=function(e,t){for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)};var o={};n.d(o,{K:function(){return f}});var r=n(558),i=n(683);const a=Symbol("listeners"),l=Symbol("weakRefMap"),s=Symbol("handleWeakRef"),c=Symbol("validateParams"),u=Symbol("generateEventId"),d=Symbol("eventIdCounter");var f=new class{constructor(){this.EVENT_MAPPINGS={debounce:new Set(["input","change","keyup","keydown","focus","blur","click"]),throttle:new Set(["mousemove","scroll","resize","wheel"])},this[a]=new Map,this[l]=new WeakMap,this[d]=0,this.add=this.add.bind(this),this.remove=this.remove.bind(this),this.defaultOptions=Object.freeze({capture:!1,passive:!0,once:!1,async:!1})}[c](e,t,o){if(!(e instanceof Element||e instanceof Window||e instanceof n.g.Document))throw new TypeError("Element must be an instance of Element, Window, or Document");if("string"!=typeof t)throw new TypeError("Event type must be a string");if("function"!=typeof o)throw new TypeError("Callback must be a function")}[u](){return"event_"+ ++this[d]}[s](e,t){let n=this[l].get(e);n||(n=new Set,this[l].set(e,n)),n.add(t)}recommendation(e,t){const n="throttle"===t?"debounce":"throttle";this.EVENT_MAPPINGS[n].has(e)&&console.warn(`Event type '${e}' is recommended to be ${n}d instead of ${t}d.`)}add(e,t,n,o={}){this[c](e,t,n);const l=this[u](),d={...this.defaultOptions,...o};let f=n;if(d.debounce&&d.throttle)throw new Error("Cannot specify both debounce and throttle options");if(d.async){f=async e=>{try{await n(e)}catch(e){if(!(d.onError&&e instanceof Error))throw e;d.onError(e)}}}d.debounce?(this.recommendation(t,"debounce"),f=(0,r.debounce)(f,{wait:d.debounce,leading:d.leading,trailing:d.trailing,debug:d.debug,onError:d.onError})):d.throttle&&(this.recommendation(t,"throttle"),f=(0,i.throttle)(f,d.throttle,{leading:d.leading,trailing:d.trailing,onError:d.onError}));const m=async t=>{d.metadata&&(t.metadata={timestamp:Date.now(),eventId:l,originalCallback:n.name||"anonymous"});try{await f.call(e,t)}catch(e){if(!(d.onError&&e instanceof Error))throw e;d.onError(e)}d.once&&this.remove(l)},g={element:new WeakRef(e),eventType:t,callback:m,originalCallback:n,options:d,timestamp:Date.now()};return this[a].set(l,g),this[s](e,l),e.addEventListener(t,m,d),l}remove(e){const t=this[a].get(e);if(!t)return!1;const n=t.element.deref();if(n){n.removeEventListener(t.eventType,t.callback,t.options);const o=this[l].get(n);o&&(o.delete(e),0===o.size&&this[l].delete(n))}return this[a].delete(e),!0}addWithCleanup(e,t,n,o={}){const r=this.add(e,t,n,o);return()=>this.remove(r)}getListeners(e){const t=this[l].get(e);return t?Array.from(t).map((t=>{const n=this[a].get(t);if(!n)return null;const o=n.element.deref();return o&&o===e?{eventId:t,eventType:n.eventType,options:n.options,timestamp:n.timestamp}:null})).filter((e=>null!==e)):[]}removeAll(e){const t=this[l].get(e);if(t){for(const e of t)this.remove(e);this[l].delete(e)}}once(e,t,n,o={}){return this.add(e,t,n,{...o,once:!0})}},m=o.K;export{m as eventManager};