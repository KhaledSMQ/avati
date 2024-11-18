import{LogLevel}from"./types";const DEFAULT_CONFIG={level:"INFO",enableTimestamp:!0,debugMode:!1,enablePerformance:!1};export class ConsoleLogger{constructor(e={}){this.config={...DEFAULT_CONFIG,...e},this.debugTimers=new Map,this.debugGroups=new Set}static getInstance(e){return ConsoleLogger.instance?e&&ConsoleLogger.instance.updateConfig(e):ConsoleLogger.instance=new ConsoleLogger(e),ConsoleLogger.instance}updateConfig(e){Object.assign(this.config,e)}shouldLog(e){return LogLevel[e]<=LogLevel[this.config.level]}getPrefix(){const e=[];return this.config.enableTimestamp&&e.push(`[${(new Date).toISOString()}]`),this.config.prefix&&e.push(`[${this.config.prefix}]`),e.length?e.join(" ")+" ":""}log(e,o,...s){if(!this.shouldLog(e))return;const i=`${this.getPrefix()}${o}`;switch(e){case"ERROR":console.error(i,...s);break;case"WARN":console.warn(i,...s);break;case"INFO":console.info(i,...s);break;case"DEBUG":console.debug(i,...s)}}error(e,...o){this.log("ERROR",e,...o)}warn(e,...o){this.log("WARN",e,...o)}info(e,...o){this.log("INFO",e,...o)}debug(e,...o){this.config.debugMode&&this.log("DEBUG",e,...o)}group(e){this.config.debugMode&&(this.debugGroups.add(e),console.group(this.getPrefix()+e))}groupEnd(e){this.config.debugMode&&this.debugGroups.has(e)&&(this.debugGroups.delete(e),console.groupEnd())}time(e){this.config.debugMode&&this.config.enablePerformance&&this.debugTimers.set(e,performance.now())}timeEnd(e){if(this.config.debugMode&&this.config.enablePerformance){const o=this.debugTimers.get(e);if(o){const s=performance.now()-o;this.debug(`${e}: ${s.toFixed(2)}ms`),this.debugTimers.delete(e)}}}createChildLogger(e){return ConsoleLogger.getInstance({...this.config,prefix:this.config.prefix?`${this.config.prefix}:${e}`:e})}clear(){console.clear()}}