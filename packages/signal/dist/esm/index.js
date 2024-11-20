/*!
 * @avatijs/signal 0.2.1
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 * Please visit https://avati.io/ for details.
 */var t={d:(s,e)=>{for(var i in e)t.o(e,i)&&!t.o(s,i)&&Object.defineProperty(s,i,{enumerable:!0,get:e[i]})},o:(t,s)=>Object.prototype.hasOwnProperty.call(t,s)},s={};t.d(s,{z6:()=>c,j5:()=>i,Cw:()=>h,OH:()=>d,ob:()=>n,gq:()=>w,Ou:()=>Q,Mm:()=>A,BO:()=>P,HN:()=>u,AF:()=>e,fB:()=>C,t9:()=>o,vq:()=>l,vA:()=>v,kg:()=>p,EW:()=>f,uu:()=>q,n5:()=>g,qr:()=>I,Yz:()=>S,H8:()=>y,QZ:()=>m,mj:()=>M,IH:()=>x,Vp:()=>O,Hp:()=>E,Tj:()=>j,se:()=>T,aH:()=>$,Bs:()=>D,bb:()=>b,EN:()=>H,v6:()=>B,Pf:()=>N,$k:()=>z});class e extends Error{constructor(t){super(`Cannot ${t} a disposed signal`),this.name="SignalDisposedError"}}class i extends Error{constructor(t){super("Circular dependency detected"+(t?` in signal "${t}"`:"")),this.name="CircularDependencyError"}}class n{constructor(){this.computationStack=[],this.batchDepth=0,this.batchQueue=new Set,this.activeEffects=new Set}static getInstance(){return this.instance||(this.instance=new n),this.instance}getCurrentComputation(){return this.computationStack[this.computationStack.length-1]}pushComputation(t){t&&this.computationStack.includes(t)||this.computationStack.push(t)}popComputation(){this.computationStack.pop()}isBatching(){return this.batchDepth>0}beginBatch(){this.batchDepth++}endBatch(){this.batchDepth--,0===this.batchDepth&&this.flushBatchQueue()}addToBatchQueue(t){this.batchQueue.add(t)}flushBatchQueue(){const t=new Set(this.batchQueue);this.batchQueue.clear();const s=new Set;for(const e of t)for(const t of e.getDependents())s.add(t);for(const t of s)t.markDirty()}setCurrentComputation(t){this.computationStack[this.computationStack.length-1]=t}registerEffect(t){this.activeEffects.add(t)}unregisterEffect(t){this.activeEffects.delete(t)}isInEffect(){return this.activeEffects.size>0}}class r{constructor(t,s={}){var e;this.dependents=new Set,this.disposed=!1,this.t=t,this.equals=null!==(e=s.equals)&&void 0!==e?e:Object.is,this.name=s.name||"anonymous"}isCommutable(){throw Error("Method not implemented.")}get value(){if(this.disposed)throw new e("read from");return this.trackDependency(),this.t}set value(t){if(this.disposed)throw new e("write to");this.equals(this.t,t)||(this.t=t,this.notifyDependents())}get_value_bypass_tracking(){if(this.disposed)throw new e("read from");return this.t}update(t){this.value=t(this.t)}addDependent(t){this.dependents.add(t)}removeDependent(t){this.dependents.delete(t)}notifyDependents(){const t=n.getInstance();if(t.isBatching())t.addToBatchQueue(this);else for(const t of this.dependents)t.markDirty()}dispose(){var t;if(this.disposed)return;this.disposed=!0;const s=new Set(this.dependents);this.dependents.clear();for(const e of s)"ComputedSignal"==e.constructor.name||"ComputedSignal"==(null===(t=e.signal)||void 0===t?void 0:t.constructor.name)?("ComputedSignal"==e.constructor.name?e:e.signal).dispose():e.dispose()}isDisposed(){return this.disposed}getDependents(){return this.dependents||new Set}hasDependents(){return this.dependents.size>0}toString(){return`Signal(${this.name})`}trackDependency(){const t=n.getInstance().getCurrentComputation();t&&(t.addDependency(this),this.addDependent(t))}}class o{constructor(){this.queue=new Set,this.processing=!1,this.updateDepth=0,this.maxUpdateDepth=1e3}static getInstance(){return this.instance||(this.instance=new o),this.instance}schedule(t){if(this.updateDepth>=this.maxUpdateDepth)throw Error("Maximum update depth exceeded - possible circular dependency");this.queue.add(t),this.processing||this.processQueue()}processQueue(){this.processing=!0,this.updateDepth++;try{for(;this.queue.size>0;){const t=Array.from(this.queue);this.queue.clear(),t.sort(((t,s)=>t.getDepth()-s.getDepth()));for(const s of t)s.isDirty()&&!s.isDisposed()&&s.recompute()}}finally{this.processing=!1,this.updateDepth--}}}class h{constructor(t){this.dirty=!0,this.disposed=!1,this.dependencies=new Set,this.dependents=new Set,this.depth=0,this.name=t}addDependency(t){this.dependencies.has(t)||(this.dependencies.add(t),"ComputedSignal"==t.constructor.name&&this.updateDepth())}removeDependency(t){this.dependencies.delete(t)&&this.updateDepth()}dispose(){this.disposed||(this.disposed=!0,this.clearDependencies(),this.dependents.clear())}isDirty(){return this.dirty}isDisposed(){return this.disposed}getDepth(){return this.depth}markDirty(){this.disposed||(this.dirty=!0,o.getInstance().schedule(this))}hasSignal(t){return this.dependencies.has(t)}clearDependencies(){for(const t of this.dependencies)t.removeDependent(this);this.dependencies.clear(),this.updateDepth()}updateDepth(){const t=this.depth;let s=0;for(const t of this.dependencies)"ComputedSignal"==t.constructor.name&&(s=Math.max(s,t.getDepth()+1));if(t!==s){this.depth=s;for(const t of this.dependents)t.updateDepth()}}}class a extends h{constructor(t){super("subscription"),this.callback=t}recompute(){if(this.disposed)return;const t=n.getInstance(),s=t.getCurrentComputation();t.setCurrentComputation(this);try{this.callback()}finally{s&&t.setCurrentComputation(s),this.dirty=!1}}}class u extends r{constructor(t,s={}){super(t,s)}subscribe(t){if(this.disposed)throw new e("subscribe to");const s=new a((()=>t(this.value)));return s.recompute(),()=>s.dispose()}}class c extends u{constructor(t,s={}){super({data:null,loading:!1,error:null,timestamp:0},s),this.abortController=null,this.fetchFn=t,this.options=s}async fetch(t=!1){var s,e,i,n,r,o,h;if(this.isCacheValid()&&!t)return this.value.data;this.abortController&&this.abortController.abort(),this.abortController=new AbortController,this.value={...this.value,loading:!0,error:null};let a=0;const u=(null===(s=this.options.retryConfig)||void 0===s?void 0:s.attempts)||1,c=(null===(e=this.options.retryConfig)||void 0===e?void 0:e.delay)||1e3,l=(null===(i=this.options.retryConfig)||void 0===i?void 0:i.backoffFactor)||2;for(;u>a;)try{const t=await this.fetchFn();return this.value={data:t,loading:!1,error:null,timestamp:Date.now()},null===(r=(n=this.options).onSuccess)||void 0===r||r.call(n,t),t}catch(t){if(a++,a===u)return this.value={...this.value,loading:!1,error:t},null===(h=(o=this.options).onError)||void 0===h||h.call(o,t),null;await new Promise((t=>setTimeout(t,c*Math.pow(l,a-1))))}return null}refresh(){return this.fetch(!0)}dispose(){this.abortController&&this.abortController.abort(),super.dispose()}isCacheValid(){var t;if(!(null===(t=this.options.cache)||void 0===t?void 0:t.enabled))return!1;if(!this.value.data)return!1;const s=this.options.cache.ttl||3e5;return Date.now()-this.value.timestamp<s}}function l(t,s){return new c(t,s)}class d extends u{constructor(t,s={}){super({},s),this.computeFn=t,this.computation=new class extends h{constructor(t){super(),this.signal=t}recompute(){if(this.disposed)return;const t=n.getInstance(),s=t.getCurrentComputation();if(t.setCurrentComputation(this),t.isInEffect())throw new i("Cannot create computed signal that depends on effects");try{for(const t of this.dependencies)if(t.isDisposed())throw this.signal.dispose(),new e("read from disposed dependency");const t=this.signal.computeFn();this.signal.equals(this.signal.t,t)||(this.signal.t=t,this.signal.notifyDependents())}catch(t){throw t instanceof e&&this.signal.dispose(),t}finally{s&&t.setCurrentComputation(s),this.dirty=!1}}}(this),this.computation.recompute()}get value(){if(this.disposed)throw new e("read from");const t=this.computation.dependencies;for(const s of t)if(s.isDisposed())throw this.dispose(),new e("read from disposed dependency");return this.computation.isDirty()&&this.computation.recompute(),this.trackDependency(),this.t}set value(t){throw Error("Cannot set the value of a computed signal")}getDepth(){return this.computation.getDepth()}dispose(){if(!this.disposed){super.dispose(),this.computation.dispose();for(const t of this.dependents)(t instanceof d||t.signal instanceof d)&&(t instanceof d?t:t.signal).dispose()}}}function f(t,s){return new d(t,s)}function p(t,s){var e;return f((()=>t.map((t=>t.value))),{equals:null!==(e=null==s?void 0:s.equals)&&void 0!==e?e:(t,s)=>!(!t||!s||t.length!==s.length)&&t.every(((t,e)=>Object.is(t,s[e]))),name:(null==s?void 0:s.name)||`Signal(combine)[${t.map((t=>""+t)).join(", ")}]`})}class w{constructor(t,s){this.disposed=!1,this.computation=new class extends h{constructor(t,e){super(s),this.effect=t,this.fn=e}recompute(){if(this.disposed)return;const t=n.getInstance();t.pushComputation(this);try{t.pushComputation(this),t.registerEffect(this.effect),this.effect.runEffect()}finally{t.unregisterEffect(this.effect),t.popComputation(),this.dirty=!1}}}(this,t),this.computation.recompute()}dispose(){if(!this.disposed){if(this.disposed=!0,this.cleanup)try{this.cleanup()}catch(t){}this.computation.dispose()}}runEffect(){if(!this.disposed){if(this.cleanup)try{this.cleanup()}catch(t){}try{this.cleanup=this.computation.fn()}catch(t){throw t}}}}function m(t,s){return new w(t,s)}function g(t,s){return new u(t,s)}function v(t){const s=n.getInstance();s.beginBatch();try{return t()}finally{s.endBatch()}}const y=(t,s)=>Object.is(t,s);function S(t,s){return m((()=>{}),"debug-"+s),t}class C{static trackUpdate(t){this.metrics.updates++,this.updateTimes.push(t),this.updateTimes.length>100&&this.updateTimes.shift(),this.metrics.averageUpdateTime=this.updateTimes.reduce(((t,s)=>t+s),0)/this.updateTimes.length}static trackComputation(t){this.metrics.computations++,this.metrics.maxChainDepth=Math.max(this.metrics.maxChainDepth,t)}static getMetrics(){return{...this.metrics}}static reset(){this.metrics={updates:0,computations:0,maxChainDepth:0,averageUpdateTime:0},this.updateTimes=[]}}function D(){n.instance=void 0,o.instance=void 0,C.reset()}C.metrics={updates:0,computations:0,maxChainDepth:0,averageUpdateTime:0},C.updateTimes=[];const b=t=>JSON.stringify({value:t.value,name:t.name,disposed:t.disposed});function E(t){return t instanceof u}function x(t){return t instanceof d?t.getDepth():0}function O(t){const s=new Set,e=new Set;return function t(i){var n;if(e.has(i))return!0;if(s.has(i))return!1;s.add(i),e.add(i);const r=i.dependents||new Set;for(const s of r)if((null===(n=s.computation)||void 0===n?void 0:n.signal)&&t(s.computation.signal))return!0;return e.delete(i),!1}(t)}function I(t,s,e){const i=g(t.value,e);let n;return m((()=>{const e=t.value;return n&&clearTimeout(n),n=setTimeout((()=>{i.value=e}),s),()=>{n&&clearTimeout(n)}})),i}function M(t,s,e){const i=g(t.value,e);return m((()=>{const e=t.value;s(e)&&(i.value=e)})),i}function j(t,s,e){return f((()=>s(t.value)),e)}function T(t){const s=n.getInstance(),e=s.getCurrentComputation();s.setCurrentComputation(void 0);try{return t.get_value_bypass_tracking()}finally{e&&s.setCurrentComputation(e)}}class k{constructor(){this.queue=g([])}enqueue(t,s=0){const e=Math.random().toString(36).substring(2),i={id:e,data:t,priority:s,timestamp:Date.now()};return this.queue.value=[...this.queue.value,i].sort(((t,s)=>s.priority-t.priority||t.timestamp-s.timestamp)),e}dequeue(){if(this.isEmpty())return;const[t,...s]=this.queue.value;return this.queue.value=s,null==t?void 0:t.data}peek(){var t;return null===(t=this.queue.value[0])||void 0===t?void 0:t.data}remove(t){const s=this.queue.value.length;return this.queue.value=this.queue.value.filter((s=>s.id!==t)),s!==this.queue.value.length}clear(){this.queue.value=[]}isEmpty(){return 0===this.queue.value.length}size(){return this.queue.value.length}getQueue(){return this.queue}}function q(){return new k}function B(t,s,e){const i=g(t.value,e);let n,r=0;return m((()=>{const e=t.value,o=Date.now();return s>o-r?n||(n=setTimeout((()=>{i.value=e,r=Date.now(),n=void 0}),s-(o-r))):(i.value=e,r=o),()=>{n&&clearTimeout(n)}})),i}function H(t,s,e){return f((()=>{const e=t.value,i=T(t);return s>Math.abs(e-i)?i:e}),{...e,equals:(t,e)=>s>Math.abs(t-e)})}function N(t,s,e){const i=g(t,e),n=f((()=>{const t=s(i.value);return"string"==typeof t?t:t?null:"Validation failed"}));return new Proxy(i,{get(t,s){if("value"===s){const s=n.value;if(s)throw Error(s);return t.value}return t[s]},set(t,e,i){if("value"===e){const e=s(i);if("string"==typeof e)throw Error(e);if(!e)throw Error("Validation failed");t.value=i}return!0}})}class Q{getItem(t){if("undefined"==typeof window)return null;const s=window.localStorage.getItem(t);return s?JSON.parse(s):null}setItem(t,s){"undefined"!=typeof window&&window.localStorage.setItem(t,JSON.stringify(s))}removeItem(t){"undefined"!=typeof window&&window.localStorage.removeItem(t)}}class P{getItem(t){if("undefined"==typeof window)return null;const s=window.sessionStorage.getItem(t);return s?JSON.parse(s):null}setItem(t,s){"undefined"!=typeof window&&window.sessionStorage.setItem(t,JSON.stringify(s))}removeItem(t){"undefined"!=typeof window&&window.sessionStorage.removeItem(t)}}class A{constructor(){this.store=new Map}getItem(t){var s;return null!==(s=this.store.get(t))&&void 0!==s?s:null}setItem(t,s){this.store.set(t,s)}removeItem(t){this.store.delete(t)}}class J extends u{constructor(t,s,e,i){const n=e.getItem(t);super(null!=n?n:s,i),this.disposed=!1,this.key=t,this.storage=e,m((()=>{this.disposed||this.storage.setItem(this.key,this.value)}),"persist-"+t)}get value(){if(this.disposed)throw new e("Cannot read from disposed signal");return super.value}set value(t){if(this.disposed)throw new e("Cannot write to disposed signal");super.value=t}update(t){if(this.disposed)throw new e("Cannot update disposed signal");this.value=t(this.value)}dispose(){this.disposed||(this.disposed=!0,this.storage.removeItem(this.key),super.dispose())}reload(){if(this.disposed)throw new e("Cannot reload disposed signal");const t=this.storage.getItem(this.key);null!==t&&(this.value=t)}clear(){if(this.disposed)throw new e("Cannot clear disposed signal");this.storage.removeItem(this.key)}isDisposed(){return this.disposed}}function $(t,s,e,i){return new J(t,s,e,i)}function z(t,s=10,e){var i;const n=null!==(i=null==e?void 0:e.equals)&&void 0!==i?i:y,r=g(t,{...e,equals:n}),o=g([t]),h=g(0),a=f((()=>h.value>0)),u=f((()=>o.value.length-1>h.value)),c=Object.create(r);return c.history=o,c.canUndo=a,c.canRedo=u,Object.defineProperty(c,"value",{get:()=>r.value,set:t=>{n(r.value,t)||v((()=>{const e=h.value+1,i=o.value.slice(0,e).concat([t]);i.length>s?(i.shift(),h.value=e-1):h.value=e,o.value=i,r.value=t}))}}),c.undo=()=>{a.value&&v((()=>{h.value--,r.value=o.value[h.value]}))},c.redo=()=>{u.value&&v((()=>{h.value++,r.value=o.value[h.value]}))},c}var U=s.z6,V=s.j5,_=s.Cw,F=s.OH,L=s.ob,W=s.gq,Y=s.Ou,Z=s.Mm,G=s.BO,K=s.HN,R=s.AF,X=s.fB,tt=s.t9,st=s.vq,et=s.vA,it=s.kg,nt=s.EW,rt=s.uu,ot=s.n5,ht=s.qr,at=s.Yz,ut=s.H8,ct=s.QZ,lt=s.mj,dt=s.IH,ft=s.Vp,pt=s.Hp,wt=s.Tj,mt=s.se,gt=s.aH,vt=s.Bs,yt=s.bb,St=s.EN,Ct=s.v6,Dt=s.Pf,bt=s.$k;export{U as AsyncSignal,V as CircularDependencyError,_ as Computation,F as ComputedSignal,L as Context,W as EffectImpl,Y as LocalStorageProvider,Z as MemoryStorageProvider,G as SessionStorageProvider,K as Signal,R as SignalDisposedError,X as SignalMonitor,tt as UpdateQueue,st as asyncSignal,et as batch,it as combine,nt as computed,rt as createQueueSignal,ot as createSignal,ht as debounced,at as debug,ut as defaultEquals,ct as effect,lt as filtered,dt as getSignalDepth,ft as hasCircularDependency,pt as isSignal,wt as map,mt as peek,gt as persisted,vt as resetSignalSystem,yt as serializeSignal,St as threshold,Ct as throttled,Dt as validated,bt as withHistory};
//# sourceMappingURL=index.js.map