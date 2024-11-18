!function(){"use strict";var e={d:function(n,r){for(var o in r)e.o(r,o)&&!e.o(n,o)&&Object.defineProperty(n,o,{enumerable:!0,get:r[o]})},o:function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},r:function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},n={};e.r(n),e.d(n,{debounce:function(){return t}});const r=new WeakMap,o=e=>({log:(...n)=>e&&console.log("[Debounce]",...n),warn:(...n)=>e&&console.warn("[Debounce]",...n),error:(...n)=>e&&console.error("[Debounce]",...n)});function t(e,n={}){if("function"!=typeof e)throw new TypeError("Expected a function");const{wait:t=0,leading:i=!1,trailing:a=!0,maxWait:l,debug:s=!1,signal:c,onError:d}=n;if(t<0||void 0!==l&&l<t)throw new RangeError("Invalid wait/maxWait values");if(!i&&!a)throw new Error("At least one of leading or trailing must be true");const u=o(s),m={lastInvokeTime:0,pendingPromises:[],aborted:!1};function g(){void 0!==m.timerId&&(clearTimeout(m.timerId),m.timerId=void 0,u.log("Cleared debounce timer")),void 0!==m.maxTimerId&&(clearTimeout(m.maxTimerId),m.maxTimerId=void 0,u.log("Cleared max wait timer"))}function f(){u.log("Cancelling pending invocations"),g(),m.lastInvokeTime=0,m.lastArgs=void 0,m.lastThis=void 0,m.lastCallTime=void 0;v(new Error("Debounced function cancelled")),m.pendingPromises.forEach((({reject:e})=>e(new Error("Debounced function cancelled")))),m.pendingPromises=[]}function v(e){if(u.error("Error occurred:",e),d)try{d(e)}catch(e){u.error("Error in onError callback:",e)}}function b(){return void 0!==m.timerId}function p(e){if(m.aborted)return!1;const n=void 0===m.lastCallTime?0:e-m.lastCallTime,r=e-m.lastInvokeTime;return void 0===m.lastCallTime||n>=t||n<0||void 0!==l&&r>=l}async function T(n){u.log(`Invoking function at ${n}`),m.lastInvokeTime=n;const r=m.lastArgs,o=m.lastThis;m.lastArgs=void 0,m.lastThis=void 0;try{const n=await e.apply(o,r);return m.result=n,m.pendingPromises.forEach((({resolve:e})=>e(n))),m.pendingPromises=[],u.log("Function invoked successfully",n),n}catch(e){const n=e instanceof Error?e:new Error(String(e));u.error("Error in function invocation:",n),v(n);const r=[...m.pendingPromises];m.pendingPromises=[],r.forEach((({reject:e})=>e(n)))}}function w(e){const n=function(e){const n=m.lastCallTime?e-m.lastCallTime:0;return Math.max(0,t-n)}(e);if(m.timerId=setTimeout(h,n),u.log(`Started debounce timer for ${n}ms`),void 0!==l&&!m.maxTimerId){const n=l-(e-m.lastCallTime);m.maxTimerId=setTimeout((()=>{u.log("Max wait timer expired"),g(),T(Date.now())}),Math.max(0,n)),u.log(`Started max wait timer for ${n}ms`)}}function h(){const e=Date.now();if(u.log("Debounce timer expired"),p(e))return function(e){u.log("Trailing edge triggered"),g(),a&&m.lastArgs?T(e):(m.pendingPromises.forEach((({resolve:e})=>{e(m.result)})),m.pendingPromises=[])}(e);w(e)}c&&c.addEventListener("abort",(()=>{m.aborted=!0,f()}));const E=function(...e){if(m.aborted)return Promise.reject(new Error("Debounced function aborted"));const n=Date.now(),r=p(n);return m.lastArgs=e,m.lastThis=this,m.lastCallTime=n,u.log("Function called",{time:n,isInvoking:r,args:e,pending:b()}),new Promise(((e,r)=>{m.pendingPromises.push({resolve:e,reject:r}),void 0===m.timerId?function(e){u.log("Leading edge triggered"),m.lastInvokeTime=e,w(e),i&&T(e)}(n):(g(),w(n))}))};return r.set(E,m),Object.defineProperties(E,{cancel:{value:f,writable:!1,configurable:!1},flush:{value:async function(...e){u.log("Flush requested");const n=e.length>0?e:m.lastArgs,r=m.lastThis;return g(),n?(m.lastArgs=n,m.lastThis=r,T(Date.now())):Promise.resolve(m.result)},writable:!1,configurable:!1},pending:{value:b,writable:!1,configurable:!1},cleanup:{value:function(){u.log("Cleanup initiated"),f(),r.delete(E)},writable:!1,configurable:!1}}),E}module.exports=n}();