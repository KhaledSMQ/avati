!function(){"use strict";var e={d:function(n,t){for(var o in t)e.o(t,o)&&!e.o(n,o)&&Object.defineProperty(n,o,{enumerable:!0,get:t[o]})},o:function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},r:function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},n={};function t(e,n=1e3/120,t={}){let o,r=null,l=null,i=null,u=!1;const{leading:c=!0,trailing:f=!0,onError:a}=t,d=()=>{if(null===l)return;u=!0;const t=s();try{e.apply(i,l)}catch(e){if(!a)throw e;a(e instanceof Error?e:new Error(String(e)))}finally{u=!1}r=s(),l=null,i=null;const o=s()-t;o>n&&console.warn(`Execution time (${o}ms) exceeded throttle limit (${n}ms)`)},s="undefined"!=typeof performance?()=>performance.now():()=>Date.now(),m=function(...e){const t=s();if(null===r){if(c)return l=e,i=this,void d();r=t}const u=r?n-(t-r):0;l=e,i=this,u<0||u>n?(o&&(clearTimeout(o),o=void 0),r=t,d()):!o&&f&&(e=>{o=setTimeout((()=>{o=void 0,f&&d()}),e)})(u)};return m.cancel=()=>{o&&clearTimeout(o),r=null,l=null,i=null,o=void 0,u=!1},m.flush=()=>{(()=>{if(o&&(clearTimeout(o),o=void 0,!u&&f&&l)&&(r?s()-r:1/0)>=n)return d(),!0})()},m}e.r(n),e.d(n,{throttle:function(){return t}}),module.exports=n}();