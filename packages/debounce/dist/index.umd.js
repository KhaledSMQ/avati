!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports["@avati/debounce"]=n():e["@avati/debounce"]=n()}(self,(function(){return function(){"use strict";var e={d:function(n,o){for(var t in o)e.o(o,t)&&!e.o(n,t)&&Object.defineProperty(n,t,{enumerable:!0,get:o[t]})},o:function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},r:function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},n={};e.r(n),e.d(n,{debounce:function(){return r}});const o=new WeakMap,t=e=>({log:(...n)=>e&&console.log("[Debounce]",...n),warn:(...n)=>e&&console.warn("[Debounce]",...n),error:(...n)=>e&&console.error("[Debounce]",...n)});function r(e,n={}){if("function"!=typeof e)throw new TypeError("Expected a function");const{wait:r=0,leading:i=!1,trailing:a=!0,maxWait:l,debug:s=!1,signal:c,onError:d}=n;if(r<0||void 0!==l&&l<r)throw new RangeError("Invalid wait/maxWait values");if(!i&&!a)throw new Error("At least one of leading or trailing must be true");const u=t(s),m={lastInvokeTime:0,pendingPromises:[],aborted:!1};function f(){void 0!==m.timerId&&(clearTimeout(m.timerId),m.timerId=void 0,u.log("Cleared debounce timer")),void 0!==m.maxTimerId&&(clearTimeout(m.maxTimerId),m.maxTimerId=void 0,u.log("Cleared max wait timer"))}function g(){u.log("Cancelling pending invocations"),f(),m.lastInvokeTime=0,m.lastArgs=void 0,m.lastThis=void 0,m.lastCallTime=void 0;v(new Error("Debounced function cancelled")),m.pendingPromises.forEach((({reject:e})=>e(new Error("Debounced function cancelled")))),m.pendingPromises=[]}function v(e){if(u.error("Error occurred:",e),d)try{d(e)}catch(e){u.error("Error in onError callback:",e)}}function b(){return void 0!==m.timerId}function p(e){if(m.aborted)return!1;const n=void 0===m.lastCallTime?0:e-m.lastCallTime,o=e-m.lastInvokeTime;return void 0===m.lastCallTime||n>=r||n<0||void 0!==l&&o>=l}async function T(n){u.log(`Invoking function at ${n}`),m.lastInvokeTime=n;const o=m.lastArgs,t=m.lastThis;m.lastArgs=void 0,m.lastThis=void 0;try{const n=await e.apply(t,o);return m.result=n,m.pendingPromises.forEach((({resolve:e})=>e(n))),m.pendingPromises=[],u.log("Function invoked successfully",n),n}catch(e){const n=e instanceof Error?e:new Error(String(e));u.error("Error in function invocation:",n),v(n);const o=[...m.pendingPromises];m.pendingPromises=[],o.forEach((({reject:e})=>e(n)))}}function w(e){const n=function(e){const n=m.lastCallTime?e-m.lastCallTime:0;return Math.max(0,r-n)}(e);if(m.timerId=setTimeout(h,n),u.log(`Started debounce timer for ${n}ms`),void 0!==l&&!m.maxTimerId){const n=l-(e-m.lastCallTime);m.maxTimerId=setTimeout((()=>{u.log("Max wait timer expired"),f(),T(Date.now())}),Math.max(0,n)),u.log(`Started max wait timer for ${n}ms`)}}function h(){const e=Date.now();if(u.log("Debounce timer expired"),p(e))return function(e){u.log("Trailing edge triggered"),f(),a&&m.lastArgs?T(e):(m.pendingPromises.forEach((({resolve:e})=>{e(m.result)})),m.pendingPromises=[])}(e);w(e)}c&&c.addEventListener("abort",(()=>{m.aborted=!0,g()}));const y=function(...e){if(m.aborted)return Promise.reject(new Error("Debounced function aborted"));const n=Date.now(),o=p(n);return m.lastArgs=e,m.lastThis=this,m.lastCallTime=n,u.log("Function called",{time:n,isInvoking:o,args:e,pending:b()}),new Promise(((e,o)=>{m.pendingPromises.push({resolve:e,reject:o}),void 0===m.timerId?function(e){u.log("Leading edge triggered"),m.lastInvokeTime=e,w(e),i&&T(e)}(n):(f(),w(n))}))};return o.set(y,m),Object.defineProperties(y,{cancel:{value:g,writable:!1,configurable:!1},flush:{value:async function(...e){u.log("Flush requested");const n=e.length>0?e:m.lastArgs,o=m.lastThis;return f(),n?(m.lastArgs=n,m.lastThis=o,T(Date.now())):Promise.resolve(m.result)},writable:!1,configurable:!1},pending:{value:b,writable:!1,configurable:!1},cleanup:{value:function(){u.log("Cleanup initiated"),g(),o.delete(y)},writable:!1,configurable:!1}}),y}return n}()}));