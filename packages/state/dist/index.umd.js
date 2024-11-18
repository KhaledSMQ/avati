!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["@avati/state"]=e():t["@avati/state"]=e()}(self,(function(){return function(){"use strict";var t,e,s,i={d:function(t,e){for(var s in e)i.o(e,s)&&!i.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:e[s]})},o:function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r:function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},r={};i.r(r),i.d(r,{HistoryActionType:function(){return t},HistoryError:function(){return a},HistoryManager:function(){return h},HistoryManagerFactory:function(){return p},HistoryStateError:function(){return o},InvalidHistoryOperationError:function(){return n},StateManager:function(){return f},StateManagerFactory:function(){return y},StateOperations:function(){return c},StateUtils:function(){return u},StateValidator:function(){return l}});class a extends Error{constructor(t){super(`[History Manager] ${t}`),this.name="HistoryError"}}class n extends a{constructor(t){super(`Invalid operation: ${t}`),this.name="InvalidHistoryOperationError"}}class o extends a{constructor(t){super(`State error: ${t}`),this.name="HistoryStateError"}}class h{constructor(t,e,s={}){this.isHistoryAction=!1,this.validateDependencies(t,e),this.stateManager=t,this.stateOps=e,this.options={...h.DEFAULT_OPTIONS,...s,ignoreActions:[...s.ignoreActions||[]]},this.historyState={past:[],present:this.stateOps.deepCopy(this.stateManager.getState()),future:[]},this.initialize()}validateDependencies(t,e){if(!t)throw new o("StateManager is required");if(!e)throw new o("StateOperations is required")}createInitialHistoryState(){return{past:[],present:this.stateOps.deepCopy(this.stateManager.getState()),future:[]}}initialize(){this.setupStateSubscription(),this.wrapDispatch()}setupStateSubscription(){this.stateManager.subscribe((t=>{!this.isHistoryAction&&this.options.trackAll&&this.pushState(t)}))}wrapDispatch(){const t=this.stateManager.dispatch.bind(this.stateManager);this.stateManager.dispatch=e=>{if(this.isHistoryAction)return t(e);const s=t(e);return this.options.trackAll||this.options.ignoreActions.includes(e.type)||this.pushState(this.stateManager.getState()),s}}pushState(t){this.historyState={past:[...this.historyState.past,this.stateOps.deepCopy(this.historyState.present)].slice(-this.options.maxHistoryLength),present:this.stateOps.deepCopy(t),future:[]}}getHistory(){return{past:this.historyState.past.map((t=>this.stateOps.deepCopy(t))),present:this.stateOps.deepCopy(this.historyState.present),future:this.historyState.future.map((t=>this.stateOps.deepCopy(t)))}}updateState(t){this.historyState={past:t.past.map((t=>this.stateOps.deepCopy(t))),present:this.stateOps.deepCopy(t.present),future:t.future.map((t=>this.stateOps.deepCopy(t)))},this.stateManager.setState(this.stateOps.deepCopy(t.present))}undo(){if(!this.canUndo())return!1;this.isHistoryAction=!0;try{const t=[...this.historyState.past],e=t.pop(),s={past:t,present:this.stateOps.deepCopy(e),future:[this.historyState.present,...this.historyState.future].slice(0,this.options.maxHistoryLength)};return this.updateState(s),!0}finally{this.isHistoryAction=!1}}redo(){if(!this.canRedo())return!1;this.isHistoryAction=!0;try{const t=[...this.historyState.future],e=t.shift(),s={past:[...this.historyState.past,this.historyState.present].slice(-this.options.maxHistoryLength),present:this.stateOps.deepCopy(e),future:t};return this.updateState(s),!0}finally{this.isHistoryAction=!1}}revertTo(t){if(t<0||t>=this.historyState.past.length)throw new n(`Invalid index: ${t}. Valid range: 0 to ${this.historyState.past.length-1}`);this.isHistoryAction=!0;try{const e=[...this.historyState.past],s=e[t],i=e.slice(0,t),r=[...e.slice(t+1),this.historyState.present,...this.historyState.future].slice(0,this.options.maxHistoryLength),a={past:i,present:this.stateOps.deepCopy(s),future:r};return this.updateState(a),!0}finally{this.isHistoryAction=!1}}clearHistory(){this.historyState=this.createInitialHistoryState()}canUndo(){return this.historyState.past.length>0}canRedo(){return this.historyState.future.length>0}getHistoryLength(){return{past:this.historyState.past.length,future:this.historyState.future.length}}}h.DEFAULT_OPTIONS={maxHistoryLength:50,trackAll:!1,ignoreActions:[]};class c{deepCopy(t){if(null==t)return t;if("object"!=typeof t)return t;if(Array.isArray(t))return t.map((t=>this.deepCopy(t)));if(t instanceof Date)return new Date(t.getTime());const e={};return Object.entries(t).forEach((([t,s])=>{e[t]=this.deepCopy(s)})),e}freezeState(t){if(null===t||"object"!=typeof t)return t;return Object.getOwnPropertyNames(t).forEach((e=>{const s=t[e];s&&"object"==typeof s&&this.freezeState(s)})),Object.freeze(t)}}class p{static create(t,e,s){const i=s||new c;return new h(t,i,e)}static createWithDebug(t,e){return this.create(t,{...e,trackAll:!0,maxHistoryLength:e?.maxHistoryLength||100})}}!function(t){t.UNDO="@history/UNDO",t.REDO="@history/REDO",t.CLEAR="@history/CLEAR",t.REVERT="@history/REVERT"}(t||(t={}));class u{static deepMerge(t,e){const s={...t};for(const i in e)if(e.hasOwnProperty(i)){const r=e[i],a=t[i];this.isObject(r)&&this.isObject(a)?s[i]=this.deepMerge(a,r):void 0!==r&&(s[i]=this.cloneValue(r))}return s}static isObject(t){return!(null===t||"object"!=typeof t||Array.isArray(t)||t instanceof Date||t instanceof RegExp)}static cloneValue(t){return t instanceof Date?new Date(t.getTime()):t instanceof RegExp?new RegExp(t.source,t.flags):Array.isArray(t)?t.map((t=>this.cloneValue(t))):this.isObject(t)?this.deepMerge({},t):t}}(s=e||(e={}))[s.ERROR=0]="ERROR",s[s.WARN=1]="WARN",s[s.INFO=2]="INFO",s[s.DEBUG=3]="DEBUG";const d={level:"INFO",enableTimestamp:!0,debugMode:!1,enablePerformance:!1};class g{constructor(t={}){this.config={...d,...t},this.debugTimers=new Map,this.debugGroups=new Set}static getInstance(t){return g.instance?t&&g.instance.updateConfig(t):g.instance=new g(t),g.instance}updateConfig(t){Object.assign(this.config,t)}shouldLog(t){return e[t]<=e[this.config.level]}getPrefix(){const t=[];return this.config.enableTimestamp&&t.push(`[${(new Date).toISOString()}]`),this.config.prefix&&t.push(`[${this.config.prefix}]`),t.length?t.join(" ")+" ":""}log(t,e,...s){if(!this.shouldLog(t))return;const i=`${this.getPrefix()}${e}`;switch(t){case"ERROR":console.error(i,...s);break;case"WARN":console.warn(i,...s);break;case"INFO":console.info(i,...s);break;case"DEBUG":console.debug(i,...s)}}error(t,...e){this.log("ERROR",t,...e)}warn(t,...e){this.log("WARN",t,...e)}info(t,...e){this.log("INFO",t,...e)}debug(t,...e){this.config.debugMode&&this.log("DEBUG",t,...e)}group(t){this.config.debugMode&&(this.debugGroups.add(t),console.group(this.getPrefix()+t))}groupEnd(t){this.config.debugMode&&this.debugGroups.has(t)&&(this.debugGroups.delete(t),console.groupEnd())}time(t){this.config.debugMode&&this.config.enablePerformance&&this.debugTimers.set(t,performance.now())}timeEnd(t){if(this.config.debugMode&&this.config.enablePerformance){const e=this.debugTimers.get(t);if(e){const s=performance.now()-e;this.debug(`${t}: ${s.toFixed(2)}ms`),this.debugTimers.delete(t)}}}createChildLogger(t){return g.getInstance({...this.config,prefix:this.config.prefix?`${this.config.prefix}:${t}`:t})}clear(){console.clear()}}class l{validateState(t){if(!t||"object"!=typeof t||Array.isArray(t))throw new Error("State must be a non-null object");return!0}validateStateKey(t,e){if(!t.hasOwnProperty(e))throw new Error(`Invalid state key: ${String(e)}`);return!0}}class f{constructor(t,e={},s=new c,i=new l){this.stateOps=s,this.validator=i,this.validator.validateState(t),this.logger=g.getInstance({debugMode:e.debug||!1,prefix:"StateManager"}),this.state=this.stateOps.freezeState(this.stateOps.deepCopy(t)),this.previous_state=null,this.initialState=this.stateOps.freezeState(this.stateOps.deepCopy(t)),this.listeners=new Set,this.reducers=new Map,this.isDispatching=!1}getState(t){this.logger.debug("Getting state",t||"full state");const e=t?this.state[t]:this.state;return this.stateOps.deepCopy(e)}setState(t){Object.keys(t).forEach((t=>{this.validator.validateStateKey(this.state,t)&&this.logger.debug(`Validating state key: ${t}`)}));const e=u.deepMerge(this.state,t),s=this.stateOps.deepCopy(e);this.previous_state=this.state,this.state=this.stateOps.freezeState(s),this.notifyListeners()}subscribe(t){if("function"!=typeof t)throw new Error("Listener must be a function");return this.logger.debug("New subscriber added"),this.listeners.add(t),()=>{this.logger.debug("Subscriber removed"),this.listeners.delete(t)}}addReducer(t,e){if("function"!=typeof e)throw new Error("Reducer must be a function");if(this.reducers.has(t))throw new Error(`Reducer already exists for slice: ${String(t)}`);this.logger.debug("Adding reducer for slice",t),this.reducers.set(t,e)}dispatch(t){if(this.isDispatching)throw new Error("Reducers may not dispatch actions");if(!t||"object"!=typeof t||!t.type)throw new Error("Action must be an object with a type property");try{this.isDispatching=!0;const e=this.stateOps.deepCopy(this.state);let s=!1;return this.reducers.forEach(((i,r)=>{const a=this.stateOps.deepCopy(this.state[r]),n=i(a,t);n!==a&&(e[r]=n,s=!0)})),s&&(this.logger.debug("State updated via dispatch",{action:t,nextState:e}),this.state=this.stateOps.freezeState(e),this.notifyListeners()),t}finally{this.isDispatching=!1}}reset(t){t?(this.validator.validateState(t),this.state=this.stateOps.freezeState(this.stateOps.deepCopy(t))):this.state=this.stateOps.freezeState(this.stateOps.deepCopy(this.initialState)),this.logger.debug("State reset",this.state),this.notifyListeners()}destroy(){this.listeners.clear(),this.reducers.clear(),this.reset(),this.logger.debug("StateManager destroyed")}notifyListeners(){this.listeners.forEach((t=>{try{t(this.state,this.previous_state)}catch(t){this.logger.error("Error in state change listener",t)}}))}}class y{static create(t,e={}){const s=new c,i=new l;return new f(t,e,s,i)}}return r}()}));