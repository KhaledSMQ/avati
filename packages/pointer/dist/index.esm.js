var t={d:function(e,n){for(var i in n)t.o(n,i)&&!t.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:n[i]})}};t.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),t.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)};var e={};function n(t){const e=window.getComputedStyle(t);return("auto"===e.overflowX||"scroll"===e.overflowX||"auto"===e.overflowY||"scroll"===e.overflowY)&&(t.scrollWidth>t.clientWidth||t.scrollHeight>t.clientHeight)}function i(t,e){const i=e.getBoundingClientRect();let o=t.clientX-i.left,s=t.clientY-i.top;const r=function(t){const e=window.getComputedStyle(t).transform||"none";return new DOMMatrix(e)}(e);let a=new DOMMatrix;if(function(t){return"none"!==window.getComputedStyle(t).transform}(e))try{a=r.inverse();const t=function(t,e,n){const i=new DOMPoint(t,e).matrixTransform(n);return{adjustedX:i.x,adjustedY:i.y}}(o,s,a);o=t.adjustedX,s=t.adjustedY}catch(t){console.warn("Failed to invert transformation matrix:",t)}const l=i.width?o/i.width:0,c=i.height?s/i.height:0,{totalScrollLeft:h,totalScrollTop:d}=function(t){let e=0,i=0,o=t.parentElement;for(;o;)n(o)&&(e+=o.scrollLeft,i+=o.scrollTop),o=o.parentElement;return{totalScrollLeft:e,totalScrollTop:i}}(e),u=n(e),p=u?e.scrollLeft:0,m=u?e.scrollTop:0,f=t.pageX,v=t.pageY,g=t.screenX,b=t.screenY,w=o+p,y=s+m,P=function(t){const{top:e,bottom:n,left:i,right:o,height:s,width:r}=t.getBoundingClientRect(),a=window.scrollX||document.documentElement.scrollLeft,l=window.scrollY||document.documentElement.scrollTop;return{top:e+l,bottom:n+l,left:i+a,right:o+a,height:s,width:r}}(e);return{clientX:t.clientX,clientY:t.clientY,pageX:t.pageX,pageY:t.pageY,screenX:t.screenX,screenY:t.screenY,offsetX:t.offsetX,offsetY:t.offsetY,relativeX:w,relativeY:y,normalizedX:Math.min(Math.max(l,0),1),normalizedY:Math.min(Math.max(c,0),1),totalScrollLeft:h,totalScrollTop:d,elementScrollLeft:p,elementScrollTop:m,absoluteX:f,absoluteY:v,screenAbsoluteX:g,screenAbsoluteY:b,transformationMatrix:r,inverseTransformationMatrix:a,transformedRelativeX:w,transformedRelativeY:y,elementAbsoluteTop:P.top,elementAbsoluteBottom:P.bottom,elementAbsoluteLeft:P.left,elementAbsoluteRight:P.right,elementHeight:P.height,elementWidth:P.width}}function o(t,e,n){return{vx:(e.x-t.x)/n,vy:(e.y-t.y)/n}}function s(t,e){return Math.sqrt(t*t+e*e)}function r(t,e,n){return{ax:(e.vx-t.vx)/n,ay:(e.vy-t.vy)/n}}function a(t,e=1e3/120,n={}){let i,o=null,s=null,r=null,a=!1;const{leading:l=!0,trailing:c=!0,onError:h}=n,d=()=>{if(null===s)return;a=!0;const n=u();try{t.apply(r,s)}catch(t){if(!h)throw t;h(t instanceof Error?t:new Error(String(t)))}finally{a=!1}o=u(),s=null,r=null;const i=u()-n;i>e&&console.warn(`Execution time (${i}ms) exceeded throttle limit (${e}ms)`)},u="undefined"!=typeof performance?()=>performance.now():()=>Date.now(),p=function(...t){const n=u();if(null===o){if(l)return s=t,r=this,void d();o=n}const a=o?e-(n-o):0;s=t,r=this,a<0||a>e?(i&&(clearTimeout(i),i=void 0),o=n,d()):!i&&c&&(t=>{i=setTimeout((()=>{i=void 0,c&&d()}),t)})(a)};return p.cancel=()=>{i&&clearTimeout(i),o=null,s=null,r=null,i=void 0,a=!1},p.flush=()=>{(()=>{if(i&&(clearTimeout(i),i=void 0,!a&&c&&s)&&(o?u()-o:1/0)>=e)d()})()},p}t.d(e,{Pk:function(){return E},Jm:function(){return d},Gd:function(){return u},P8:function(){return r},iz:function(){return s},gd:function(){return o},Ek:function(){return i}});class l{constructor(t){this.maxSize=t,this.cache=new Map}get(t){if(!this.cache.has(t))return;const e=this.cache.get(t);return this.cache.delete(t),this.cache.set(t,e),e}set(t,e){if(this.cache.has(t))this.cache.delete(t);else if(this.cache.size>=this.maxSize){const t=this.cache.keys().next().value;t&&this.cache.delete(t)}this.cache.set(t,e)}delete(t){this.cache.delete(t)}has(t){return this.cache.has(t)}}function c(t,e={}){const{maxCacheSize:n=1/0,ttl:i}=e,o=new l(n),s=new WeakMap;let r=0;function a(t){return t.map((t=>{return"object"==typeof t&&null!==t?`object:${e=t,s.has(e)||s.set(e,++r),s.get(e)}`:"function"==typeof t?`function:${t.toString()}`:`primitive:${String(t)}`;var e})).join("|")}return function(...e){const n=a(e),s=Date.now(),r=o.get(n);if(r){if(!(void 0!==i&&s-r.timestamp>=i))return r.value;o.delete(n)}const l=t.apply(this,e);return o.set(n,{value:l,timestamp:s}),l}}const h={updateThreshold:16.67,movementThreshold:1,memoizationLimit:1e3};class d{constructor(t,e={}){this.handlePointerDown=t=>{try{this.validateEvent(t);const{pointerId:e,clientX:n,clientY:i}=t;this.state.pointers.set(e,{isDown:!0,isInside:!0,position:{x:n,y:i},allPositions:this.getPointerPosition(t),velocity:{vx:0,vy:0},acceleration:{ax:0,ay:0},speed:0}),this.lastMoveTime.set(e,performance.now()),this.lastPosition.set(e,{x:n,y:i}),this.lastVelocity.set(e,{vx:0,vy:0})}catch(t){this.handleError("handlePointerDown",t)}},this.handlePointerMove=t=>{try{this.validateEvent(t);const{pointerId:e,clientX:n,clientY:i}=t,o=this.getPointerPosition(t);if(!this.state.pointers.has(e))return this.state.pointers.set(e,{isDown:!1,isInside:!0,position:{x:n,y:i},allPositions:this.getPointerPosition(t),velocity:{vx:0,vy:0},acceleration:{ax:0,ay:0},speed:0}),this.lastMoveTime.set(e,performance.now()),this.lastPosition.set(e,{x:n,y:i}),void this.lastVelocity.set(e,{vx:0,vy:0});const s=performance.now(),r=(s-(this.lastMoveTime.get(e)||s))/1e3;if(r>this.config.updateThreshold/1e3){const t=this.lastPosition.get(e)||{x:n,y:i},a={x:n,y:i};this.hasSignificantMovement(t,a)&&this.processPointerMovement(e,o,t,a,r,s)}}catch(t){this.handleError("handlePointerMove",t)}},this.handlePointerUp=t=>{try{this.validateEvent(t);const{pointerId:e,clientX:n,clientY:i}=t;if(this.state.pointers.has(e)){const t=this.state.pointers.get(e);this.state.pointers.set(e,{...t,isDown:!1,position:{x:n,y:i}}),this.cleanupPointerData(e)}}catch(t){this.handleError("handlePointerUp",t)}},this.handlePointerEnter=t=>{try{this.validateEvent(t);const{pointerId:e,clientX:n,clientY:i}=t,o=this.getPointerPosition(t);if(this.state.pointers.has(e)){const t=this.state.pointers.get(e);this.state.pointers.set(e,{...t,isInside:!0})}else this.initializeNewPointer(e,n,i,o)}catch(t){this.handleError("handlePointerEnter",t)}},this.handlePointerLeave=t=>{try{this.validateEvent(t);const{pointerId:e}=t;if(this.state.pointers.has(e)){const t=this.state.pointers.get(e);this.state.pointers.set(e,{...t,isInside:!1,velocity:{vx:0,vy:0},acceleration:{ax:0,ay:0},speed:0})}}catch(t){this.handleError("handlePointerLeave",t)}},this.handlePointerCancel=t=>{try{this.validateEvent(t);const{pointerId:e}=t;if(this.state.pointers.has(e)){const t=this.state.pointers.get(e);this.state.pointers.set(e,{...t,isDown:!1}),this.cleanupPointerData(e)}}catch(t){this.handleError("handlePointerCancel",t)}},this.state=t,this.config={...h,...e},this.lastMoveTime=new Map,this.lastPosition=new Map,this.lastVelocity=new Map,this.memoizedCalculateSpeed=c(s,{maxCacheSize:this.config.memoizationLimit,ttl:10*this.config.updateThreshold}),this.memoizedCalculateAcceleration=c(r,{maxCacheSize:this.config.memoizationLimit,ttl:10*this.config.updateThreshold}),this.throttledUpdateState=a(this.updatePointerState.bind(this),this.config.updateThreshold,{trailing:!0,leading:!0})}getState(){const t={pointers:new Map};return this.state.pointers.forEach(((e,n)=>{t.pointers.set(n,{...e})})),t}resetState(){this.state.pointers.clear(),this.cleanup()}validateEvent(t){if(!t||!("pointerId"in t))throw new Error("Invalid pointer event")}hasSignificantMovement(t,e){const n=Math.abs(e.x-t.x),i=Math.abs(e.y-t.y);return n>this.config.movementThreshold||i>this.config.movementThreshold}processPointerMovement(t,e,n,i,s,r){const a=o(n,i,s),l=this.memoizedCalculateSpeed(a.vx,a.vy),c=this.lastVelocity.get(t)||{vx:0,vy:0},h=this.memoizedCalculateAcceleration(c,a,s);this.throttledUpdateState(t,i,e,a,h,l),this.updateTemporaryData(t,r,i,a)}updatePointerState(t,e,n,i,o,s){const r=this.state.pointers.get(t);r&&Object.assign(r,{position:{...e},velocity:{...i},acceleration:{...o},allPositions:{...n},speed:s})}updateTemporaryData(t,e,n,i){this.lastMoveTime.set(t,e),this.lastPosition.set(t,{...n}),this.lastVelocity.set(t,{...i})}initializePointerData(t,e,n){this.lastMoveTime.set(t,performance.now()),this.lastPosition.set(t,{x:e,y:n}),this.lastVelocity.set(t,{vx:0,vy:0})}initializeNewPointer(t,e,n,i){const o={isDown:!1,isInside:!0,position:{x:e,y:n},allPositions:i,velocity:{vx:0,vy:0},acceleration:{ax:0,ay:0},speed:0};this.state.pointers.set(t,o),this.initializePointerData(t,e,n)}cleanupPointerData(t){this.lastMoveTime.delete(t),this.lastPosition.delete(t),this.lastVelocity.delete(t)}cleanup(){}handleError(t,e){console.error(`Error in EventHandler.${t}:`,e)}getPointerPosition(t){return{page:{x:t.pageX,y:t.pageY},client:{x:t.clientX,y:t.clientY},screen:{x:t.screenX,y:t.screenY},offset:{x:t.offsetX,y:t.offsetY}}}}class u{constructor(){this.subscribers=new Map}subscribe(t,e){this.subscribers.has(t)||this.subscribers.set(t,new Set),this.subscribers.get(t).add(e)}unsubscribe(t,e){this.subscribers.has(t)&&this.subscribers.get(t).delete(e)}async publish(t,...e){if(this.subscribers.has(t)){const n=Array.from(this.subscribers.get(t)).map((t=>t(...e)));await Promise.all(n)}}clear(){this.subscribers.clear()}}const p=new WeakMap;function m(t,e={}){if("function"!=typeof t)throw new TypeError("Expected a function");const{wait:n=0,leading:i=!1,trailing:o=!0,maxWait:s,debug:r=!1,signal:a,onError:l}=e;if(n<0||void 0!==s&&s<n)throw new RangeError("Invalid wait/maxWait values");if(!i&&!o)throw new Error("At least one of leading or trailing must be true");const c=(t=>({log:(...e)=>t&&console.log("[Debounce]",...e),warn:(...e)=>t&&console.warn("[Debounce]",...e),error:(...e)=>t&&console.error("[Debounce]",...e)}))(r),h={lastInvokeTime:0,pendingPromises:[],aborted:!1};function d(){void 0!==h.timerId&&(clearTimeout(h.timerId),h.timerId=void 0,c.log("Cleared debounce timer")),void 0!==h.maxTimerId&&(clearTimeout(h.maxTimerId),h.maxTimerId=void 0,c.log("Cleared max wait timer"))}function u(){c.log("Cancelling pending invocations"),d(),h.lastInvokeTime=0,h.lastArgs=void 0,h.lastThis=void 0,h.lastCallTime=void 0,m(new Error("Debounced function cancelled")),h.pendingPromises.forEach((({reject:t})=>t(new Error("Debounced function cancelled")))),h.pendingPromises=[]}function m(t){if(c.error("Error occurred:",t),l)try{l(t)}catch(t){c.error("Error in onError callback:",t)}}function f(){return void 0!==h.timerId}function v(t){if(h.aborted)return!1;const e=void 0===h.lastCallTime?0:t-h.lastCallTime,i=t-h.lastInvokeTime;return void 0===h.lastCallTime||e>=n||e<0||void 0!==s&&i>=s}async function g(e){c.log(`Invoking function at ${e}`),h.lastInvokeTime=e;const n=h.lastArgs,i=h.lastThis;h.lastArgs=void 0,h.lastThis=void 0;try{const e=await t.apply(i,n);return h.result=e,h.pendingPromises.forEach((({resolve:t})=>t(e))),h.pendingPromises=[],c.log("Function invoked successfully",e),e}catch(t){const e=t instanceof Error?t:new Error(String(t));c.error("Error in function invocation:",e),m(e);const n=[...h.pendingPromises];h.pendingPromises=[],n.forEach((({reject:t})=>t(e)))}}function b(t){const e=function(t){const e=h.lastCallTime?t-h.lastCallTime:0;return Math.max(0,n-e)}(t);if(h.timerId=setTimeout(w,e),c.log(`Started debounce timer for ${e}ms`),void 0!==s&&!h.maxTimerId){const e=s-(t-h.lastCallTime);h.maxTimerId=setTimeout((()=>{c.log("Max wait timer expired"),d(),g(Date.now())}),Math.max(0,e)),c.log(`Started max wait timer for ${e}ms`)}}function w(){const t=Date.now();if(c.log("Debounce timer expired"),v(t))return function(t){c.log("Trailing edge triggered"),d(),o&&h.lastArgs?g(t):(h.pendingPromises.forEach((({resolve:t})=>{t(h.result)})),h.pendingPromises=[])}(t);b(t)}a&&a.addEventListener("abort",(()=>{h.aborted=!0,u()}));const y=function(...t){if(h.aborted)return Promise.reject(new Error("Debounced function aborted"));const e=Date.now(),n=v(e);return h.lastArgs=t,h.lastThis=this,h.lastCallTime=e,c.log("Function called",{time:e,isInvoking:n,args:t,pending:f()}),new Promise(((t,n)=>{h.pendingPromises.push({resolve:t,reject:n}),void 0===h.timerId?function(t){c.log("Leading edge triggered"),h.lastInvokeTime=t,b(t),i&&g(t)}(e):(d(),b(e))}))};return p.set(y,h),Object.defineProperties(y,{cancel:{value:u,writable:!1,configurable:!1},flush:{value:async function(...t){c.log("Flush requested");const e=t.length>0?t:h.lastArgs,n=h.lastThis;return d(),e?(h.lastArgs=e,h.lastThis=n,g(Date.now())):Promise.resolve(h.result)},writable:!1,configurable:!1},pending:{value:f,writable:!1,configurable:!1},cleanup:{value:function(){c.log("Cleanup initiated"),u(),p.delete(y)},writable:!1,configurable:!1}}),y}const f=Symbol("listeners"),v=Symbol("weakRefMap"),g=Symbol("handleWeakRef"),b=Symbol("validateParams"),w=Symbol("generateEventId"),y=Symbol("eventIdCounter");var P=new class{constructor(){this.EVENT_MAPPINGS={debounce:new Set(["input","change","keyup","keydown","focus","blur","click"]),throttle:new Set(["mousemove","scroll","resize","wheel"])},this[f]=new Map,this[v]=new WeakMap,this[y]=0,this.add=this.add.bind(this),this.remove=this.remove.bind(this),this.defaultOptions=Object.freeze({capture:!1,passive:!0,once:!1,async:!1})}[b](e,n,i){if(!(e instanceof Element||e instanceof Window||e instanceof t.g.Document))throw new TypeError("Element must be an instance of Element, Window, or Document");if("string"!=typeof n)throw new TypeError("Event type must be a string");if("function"!=typeof i)throw new TypeError("Callback must be a function")}[w](){return"event_"+ ++this[y]}[g](t,e){let n=this[v].get(t);n||(n=new Set,this[v].set(t,n)),n.add(e)}recommendation(t,e){const n="throttle"===e?"debounce":"throttle";this.EVENT_MAPPINGS[n].has(t)&&console.warn(`Event type '${t}' is recommended to be ${n}d instead of ${e}d.`)}add(t,e,n,i={}){this[b](t,e,n);const o=this[w](),s={...this.defaultOptions,...i};let r=n;if(s.debounce&&s.throttle)throw new Error("Cannot specify both debounce and throttle options");s.async&&(r=async t=>{try{await n(t)}catch(t){if(!(s.onError&&t instanceof Error))throw t;s.onError(t)}}),s.debounce?(this.recommendation(e,"debounce"),r=m(r,{wait:s.debounce,leading:s.leading,trailing:s.trailing,debug:s.debug,onError:s.onError})):s.throttle&&(this.recommendation(e,"throttle"),r=a(r,s.throttle,{leading:s.leading,trailing:s.trailing,onError:s.onError}));const l=async e=>{s.metadata&&(e.metadata={timestamp:Date.now(),eventId:o,originalCallback:n.name||"anonymous"});try{await r.call(t,e)}catch(t){if(!(s.onError&&t instanceof Error))throw t;s.onError(t)}s.once&&this.remove(o)},c={element:new WeakRef(t),eventType:e,callback:l,originalCallback:n,options:s,timestamp:Date.now()};return this[f].set(o,c),this[g](t,o),t.addEventListener(e,l,s),o}remove(t){const e=this[f].get(t);if(!e)return!1;const n=e.element.deref();if(n){n.removeEventListener(e.eventType,e.callback,e.options);const i=this[v].get(n);i&&(i.delete(t),0===i.size&&this[v].delete(n))}return this[f].delete(t),!0}addWithCleanup(t,e,n,i={}){const o=this.add(t,e,n,i);return()=>this.remove(o)}getListeners(t){const e=this[v].get(t);return e?Array.from(e).map((e=>{const n=this[f].get(e);if(!n)return null;const i=n.element.deref();return i&&i===t?{eventId:e,eventType:n.eventType,options:n.options,timestamp:n.timestamp}:null})).filter((t=>null!==t)):[]}removeAll(t){const e=this[v].get(t);if(e){for(const t of e)this.remove(t);this[v].delete(t)}}once(t,e,n,i={}){return this.add(t,e,n,{...i,once:!0})}};class E{constructor(t,e){this.listenerOptions={passive:!0,capture:!1},this.events=[],this.handlePointerDown=async t=>{this.eventHandler.handlePointerDown(t),await this.pubSub.publish("pointerdown",t,this.convertStateToMap()),this.startUpdating()},this.handlePointerUp=async t=>{this.eventHandler.handlePointerUp(t),await this.pubSub.publish("pointerup",t,this.convertStateToMap()),this.stopUpdatingIfNecessary()},this.handlePointerMove=t=>{this.eventHandler.handlePointerMove(t),this.pubSub.publish("pointermove",t,this.convertStateToMap()).catch(console.error)},this.handlePointerEnter=async t=>{this.eventHandler.handlePointerEnter(t),await this.pubSub.publish("pointerenter",t,this.convertStateToMap())},this.handlePointerLeave=async t=>{this.eventHandler.handlePointerLeave(t),await this.pubSub.publish("pointerleave",t,this.convertStateToMap())},this.handlePointerCancel=async t=>{this.eventHandler.handlePointerCancel(t),await this.pubSub.publish("pointercancel",t,this.convertStateToMap()),this.stopUpdatingIfNecessary()},this.handleClick=async t=>{await this.pubSub.publish("click",t)},this.handleDblClick=async t=>{await this.pubSub.publish("dblclick",t)},this.handleContextMenu=async t=>{await this.pubSub.publish("contextmenu",t)},this.updateLoop=()=>{this.isUpdating&&(this.rafId=requestAnimationFrame(this.updateLoop))},this.element=t,this.config=e||{moveEventTarget:"element"},this.eventHandler=new d({pointers:new Map}),this.pubSub=new u,this.rafId=null,this.isUpdating=!1,this.activeListeners=new Set,this.init()}getMoveEventTarget(t){switch(t){case"window":return window;case"document":return document;default:return this.element}}init(){this.events=[P.addWithCleanup(this.element,"pointerdown",this.handlePointerDown,this.listenerOptions),P.addWithCleanup(window,"pointerup",this.handlePointerUp,this.listenerOptions),P.addWithCleanup(window,"pointermove",this.handlePointerMove,{throttle:1e3/120,debug:!0}),P.addWithCleanup(this.element,"pointerenter",this.handlePointerEnter),P.addWithCleanup(this.element,"pointerleave",this.handlePointerLeave),P.addWithCleanup(this.element,"pointercancel",this.handlePointerCancel),P.addWithCleanup(this.element,"click",this.handleClick),P.addWithCleanup(this.element,"dblclick",this.handleDblClick),P.addWithCleanup(this.element,"contextmenu",this.handleContextMenu)]}on(t,e){e&&(this.activeListeners.add(t),this.pubSub.subscribe(t,e))}off(t,e){e&&this.pubSub.unsubscribe(t,e)}destroy(){this.events.forEach((t=>t())),this.pubSub.clear(),this.eventHandler.resetState(),null!==this.rafId&&cancelAnimationFrame(this.rafId)}getState(){return this.eventHandler.getState()}startUpdating(){this.isUpdating||(this.isUpdating=!0,this.rafId=requestAnimationFrame(this.updateLoop))}stopUpdatingIfNecessary(){0===this.getState().pointers.size&&this.isUpdating&&(this.isUpdating=!1,null!==this.rafId&&(cancelAnimationFrame(this.rafId),this.rafId=null))}convertStateToMap(){const t=this.getState(),e=new Map;return t.pointers.forEach(((t,n)=>{e.set(n,{...t})})),e}}var T=e.Pk,S=e.Jm,x=e.Gd,M=e.P8,C=e.iz,I=e.gd,D=e.Ek;export{T as AdvancedPointerEventManager,S as EventHandler,x as PubSub,M as calculateAcceleration,C as calculateSpeed,I as calculateVelocity,D as getElementPositionInfo};