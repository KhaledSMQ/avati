/*!
 * @avatijs/signal 0.2.1
 * Copyright (c) 2024 Khaled Sameer <khaled.smq@hotmail.com>
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 * Please visit https://avati.io/ for details.
 */(()=>{"use strict";var t={d:(s,e)=>{for(var i in e)t.o(e,i)&&!t.o(s,i)&&Object.defineProperty(s,i,{enumerable:!0,get:e[i]})},o:(t,s)=>Object.prototype.hasOwnProperty.call(t,s),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"t",{value:!0})}},s={};t.r(s),t.d(s,{combine:()=>f,computed:()=>d});class e{constructor(){this.queue=new Set,this.processing=!1,this.updateDepth=0,this.maxUpdateDepth=1e3}static getInstance(){return this.instance||(this.instance=new e),this.instance}schedule(t){if(this.updateDepth>=this.maxUpdateDepth)throw Error("Maximum update depth exceeded - possible circular dependency");this.queue.add(t),this.processing||this.processQueue()}processQueue(){this.processing=!0,this.updateDepth++;try{for(;this.queue.size>0;){const t=Array.from(this.queue);this.queue.clear(),t.sort(((t,s)=>t.getDepth()-s.getDepth()));for(const s of t)s.isDirty()&&!s.isDisposed()&&s.recompute()}}finally{this.processing=!1,this.updateDepth--}}}class i{constructor(t){this.dirty=!0,this.disposed=!1,this.dependencies=new Set,this.dependents=new Set,this.depth=0,this.name=t}addDependency(t){this.dependencies.has(t)||(this.dependencies.add(t),"ComputedSignal"==t.constructor.name&&this.updateDepth())}removeDependency(t){this.dependencies.delete(t)&&this.updateDepth()}dispose(){this.disposed||(this.disposed=!0,this.clearDependencies(),this.dependents.clear())}isDirty(){return this.dirty}isDisposed(){return this.disposed}getDepth(){return this.depth}markDirty(){this.disposed||(this.dirty=!0,e.getInstance().schedule(this))}hasSignal(t){return this.dependencies.has(t)}clearDependencies(){for(const t of this.dependencies)t.removeDependent(this);this.dependencies.clear(),this.updateDepth()}updateDepth(){const t=this.depth;let s=0;for(const t of this.dependencies)"ComputedSignal"==t.constructor.name&&(s=Math.max(s,t.getDepth()+1));if(t!==s){this.depth=s;for(const t of this.dependents)t.updateDepth()}}}class n{constructor(){this.computationStack=[],this.batchDepth=0,this.batchQueue=new Set,this.activeEffects=new Set}static getInstance(){return this.instance||(this.instance=new n),this.instance}getCurrentComputation(){return this.computationStack[this.computationStack.length-1]}pushComputation(t){t&&this.computationStack.includes(t)||this.computationStack.push(t)}popComputation(){this.computationStack.pop()}isBatching(){return this.batchDepth>0}beginBatch(){this.batchDepth++}endBatch(){this.batchDepth--,0===this.batchDepth&&this.flushBatchQueue()}addToBatchQueue(t){this.batchQueue.add(t)}flushBatchQueue(){const t=new Set(this.batchQueue);this.batchQueue.clear();const s=new Set;for(const e of t)for(const t of e.getDependents())s.add(t);for(const t of s)t.markDirty()}setCurrentComputation(t){this.computationStack[this.computationStack.length-1]=t}registerEffect(t){this.activeEffects.add(t)}unregisterEffect(t){this.activeEffects.delete(t)}isInEffect(){return this.activeEffects.size>0}}class r extends Error{constructor(t){super(`Cannot ${t} a disposed signal`),this.name="SignalDisposedError"}}class h extends Error{constructor(t){super("Circular dependency detected"+(t?` in signal "${t}"`:"")),this.name="CircularDependencyError"}}class o{constructor(t,s={}){var e;this.dependents=new Set,this.disposed=!1,this.i=t,this.equals=null!==(e=s.equals)&&void 0!==e?e:Object.is,this.name=s.name||"anonymous"}isCommutable(){throw Error("Method not implemented.")}get value(){if(this.disposed)throw new r("read from");return this.trackDependency(),this.i}set value(t){if(this.disposed)throw new r("write to");this.equals(this.i,t)||(this.i=t,this.notifyDependents())}get_value_bypass_tracking(){if(this.disposed)throw new r("read from");return this.i}update(t){this.value=t(this.i)}addDependent(t){this.dependents.add(t)}removeDependent(t){this.dependents.delete(t)}notifyDependents(){const t=n.getInstance();if(t.isBatching())t.addToBatchQueue(this);else for(const t of this.dependents)t.markDirty()}dispose(){var t;if(this.disposed)return;this.disposed=!0;const s=new Set(this.dependents);this.dependents.clear();for(const e of s)"ComputedSignal"==e.constructor.name||"ComputedSignal"==(null===(t=e.signal)||void 0===t?void 0:t.constructor.name)?("ComputedSignal"==e.constructor.name?e:e.signal).dispose():e.dispose()}isDisposed(){return this.disposed}getDependents(){return this.dependents||new Set}hasDependents(){return this.dependents.size>0}toString(){return`Signal(${this.name})`}trackDependency(){const t=n.getInstance().getCurrentComputation();t&&(t.addDependency(this),this.addDependent(t))}}class c extends i{constructor(t){super("subscription"),this.callback=t}recompute(){if(this.disposed)return;const t=n.getInstance(),s=t.getCurrentComputation();t.setCurrentComputation(this);try{this.callback()}finally{s&&t.setCurrentComputation(s),this.dirty=!1}}}class u extends o{constructor(t,s={}){super(t,s)}subscribe(t){if(this.disposed)throw new r("subscribe to");const s=new c((()=>t(this.value)));return s.recompute(),()=>s.dispose()}}class a extends u{constructor(t,s={}){super({},s),this.computeFn=t,this.computation=new class extends i{constructor(t){super(),this.signal=t}recompute(){if(this.disposed)return;const t=n.getInstance(),s=t.getCurrentComputation();if(t.setCurrentComputation(this),t.isInEffect())throw new h("Cannot create computed signal that depends on effects");try{for(const t of this.dependencies)if(t.isDisposed())throw this.signal.dispose(),new r("read from disposed dependency");const t=this.signal.computeFn();this.signal.equals(this.signal.i,t)||(this.signal.i=t,this.signal.notifyDependents())}catch(t){throw t instanceof r&&this.signal.dispose(),t}finally{s&&t.setCurrentComputation(s),this.dirty=!1}}}(this),this.computation.recompute()}get value(){if(this.disposed)throw new r("read from");const t=this.computation.dependencies;for(const s of t)if(s.isDisposed())throw this.dispose(),new r("read from disposed dependency");return this.computation.isDirty()&&this.computation.recompute(),this.trackDependency(),this.i}set value(t){throw Error("Cannot set the value of a computed signal")}getDepth(){return this.computation.getDepth()}dispose(){if(!this.disposed){super.dispose(),this.computation.dispose();for(const t of this.dependents)(t instanceof a||t.signal instanceof a)&&(t instanceof a?t:t.signal).dispose()}}}function d(t,s){return new a(t,s)}function f(t,s){var e;return d((()=>t.map((t=>t.value))),{equals:null!==(e=null==s?void 0:s.equals)&&void 0!==e?e:(t,s)=>!(!t||!s||t.length!==s.length)&&t.every(((t,e)=>Object.is(t,s[e]))),name:(null==s?void 0:s.name)||`Signal(combine)[${t.map((t=>""+t)).join(", ")}]`})}module.exports=s})();
//# sourceMappingURL=index.js.map