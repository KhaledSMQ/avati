var n={d:function(e,t){for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o:function(n,e){return Object.prototype.hasOwnProperty.call(n,e)}},e={};function t(n,e=1e3/120,t={}){let r,o=null,l=null,i=null,u=!1;const{leading:c=!0,trailing:a=!0,onError:f}=t,s=()=>{if(null===l)return;u=!0;const t=d();try{n.apply(i,l)}catch(n){if(!f)throw n;f(n instanceof Error?n:new Error(String(n)))}finally{u=!1}o=d(),l=null,i=null;const r=d()-t;r>e&&console.warn(`Execution time (${r}ms) exceeded throttle limit (${e}ms)`)},d="undefined"!=typeof performance?()=>performance.now():()=>Date.now(),m=function(...n){const t=d();if(null===o){if(c)return l=n,i=this,void s();o=t}const u=o?e-(t-o):0;l=n,i=this,u<0||u>e?(r&&(clearTimeout(r),r=void 0),o=t,s()):!r&&a&&(n=>{r=setTimeout((()=>{r=void 0,a&&s()}),n)})(u)};return m.cancel=()=>{r&&clearTimeout(r),o=null,l=null,i=null,r=void 0,u=!1},m.flush=()=>{(()=>{if(r&&(clearTimeout(r),r=void 0,!u&&a&&l)&&(o?d()-o:1/0)>=e)return s(),!0})()},m}n.d(e,{n:function(){return t}});var r=e.n;export{r as throttle};