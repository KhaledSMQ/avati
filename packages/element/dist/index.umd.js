!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["@avati/element"]=e():t["@avati/element"]=e()}(self,(function(){return function(){"use strict";var t={d:function(e,n){for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r:function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};function n(t){const e="string"==typeof t?document.querySelector(t):t;if(!e)throw new Error("Element not found");const n=window.getComputedStyle(e);return{top:i(n.marginTop),right:i(n.marginRight),bottom:i(n.marginBottom),left:i(n.marginLeft),all:n.margin}}function o(t,e){return n(t)[e]}function i(t){return parseInt(t,10)||0}function r(t){const e=n(t);return Object.values(e).some((t=>"number"==typeof t&&t>0))}function u(t){const e=n(t);return e.left+e.right}function a(t){const e=n(t);return e.top+e.bottom}t.r(e),t.d(e,{BoundaryCalculationError:function(){return d},ChildViewElement:function(){return s},GetElementBounds:function(){return c},ViewBoundaryCalculator:function(){return h},addEventListenerToElement:function(){return v},appendChildToElement:function(){return E},clearElementChildren:function(){return N},createElement:function(){return p},createSvgElement:function(){return w},getHorizontalMargin:function(){return u},getMargin:function(){return o},getMargins:function(){return n},getVerticalMargin:function(){return a},hasMargin:function(){return r},insertElementBefore:function(){return B},parsePixelValue:function(){return i},removeAttribute:function(){return g},removeElement:function(){return C},removeEventListenerFromElement:function(){return x},selectAllElements:function(){return b},selectElement:function(){return y},setAttribute:function(){return f},setAttributes:function(){return m}});const c=t=>{const e=t.getBoundingClientRect(),n=getComputedStyle(t),o={top:parseFloat(n.marginTop),right:parseFloat(n.marginRight),bottom:parseFloat(n.marginBottom),left:parseFloat(n.marginLeft)};return{x:e.left,y:e.top,width:e.width,height:e.height,right:e.right,bottom:e.bottom,margins:o}},s=(t,e=!1)=>({shouldIncludeInLayout(){return e},getBounds(){const e=t.getBoundingClientRect(),n=window.getComputedStyle(t),o={top:i(n.marginTop),right:i(n.marginRight),bottom:i(n.marginBottom),left:i(n.marginLeft)},r={x:e.left,y:e.top,width:e.width,height:e.height,right:e.right,bottom:e.bottom,margins:o};return{element:r,inner:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},outer:{x:r.x-o.left,y:r.y-o.top,width:r.width+o.left+o.right,height:r.height+o.top+o.bottom,right:r.right+o.right,bottom:r.bottom+o.bottom}}}}),l=1e-6;class d extends Error{constructor(t){super(t),this.name="BoundaryCalculationError"}}class h{static validateNumber(t,e){if(!Number.isFinite(t))throw new d(`${e} must be a finite number`);if(Math.abs(t)>1e7)throw new d(`${e} exceeds maximum safe coordinate value`)}static validateRectangle(t,e="Rectangle"){if(this.validateNumber(t.x,`${e}.x`),this.validateNumber(t.y,`${e}.y`),this.validateNumber(t.width,`${e}.width`),this.validateNumber(t.height,`${e}.height`),this.validateNumber(t.right,`${e}.right`),this.validateNumber(t.bottom,`${e}.bottom`),t.width<0||t.height<0)throw new d(`${e} cannot have negative dimensions`);const n=t.x+t.width,o=t.y+t.height;if(Math.abs(n-t.right)>l||Math.abs(o-t.bottom)>l)throw new d(`${e} coordinates are inconsistent with dimensions`)}static validateMargins(t){if(t.top<0||t.right<0||t.bottom<0||t.left<0)throw new d("Margins cannot be negative")}static validateScale(t){if(t.x<=0||t.y<=0)throw new d("Scale factors must be positive")}static calculateBounds(t,e,n={}){this.validateRectangle(t,"elementBounds"),this.validateMargins(t.margins);const{offset:o={x:0,y:0},scale:i={x:1,y:1}}=n;this.validateNumber(o.x,"offset.x"),this.validateNumber(o.y,"offset.y"),this.validateScale(i);const r=this.createBaseBounds(t,o,i),u=this.calculateCombinedChildBounds(e),a=this.combineBounds(r,u,t.margins);return this.validateRectangle(a.inner,"combinedBounds.inner"),this.validateRectangle(a.outer,"combinedBounds.outer"),a}static createBaseBounds(t,e,n){const o=t.width*n.x,i=t.height*n.y,r={x:e.x,y:e.y,width:o,height:i,right:e.x+o,bottom:e.y+i},u={x:t.x,y:t.y,width:t.width,height:t.height,right:t.x+t.width,bottom:t.y+t.height};return{element:{...t},inner:u,outer:r}}static calculateCombinedChildBounds(t){const e=t.filter((t=>{try{return t.shouldIncludeInLayout()}catch(t){return console.warn("Error checking child view layout inclusion:",t),!1}}));if(0===e.length)return null;let n=!1,o=this.createEmptyBounds();for(const t of e)try{const e=t.getBounds();try{this.validateRectangle(e.inner,"childBounds.inner"),this.validateRectangle(e.outer,"childBounds.outer"),o=this.expandBoundary(o,e.inner),o=this.expandBoundary(o,e.outer),n=!0}catch(t){console.warn("Invalid child view bounds:",t)}}catch(t){console.warn("Error getting child view bounds:",t)}return n?this.calculateDimensions(o):null}static createEmptyBounds(){return{x:Number.POSITIVE_INFINITY,y:Number.POSITIVE_INFINITY,width:0,height:0,right:Number.NEGATIVE_INFINITY,bottom:Number.NEGATIVE_INFINITY}}static expandBoundary(t,e){return{x:Math.min(t.x,e.x),y:Math.min(t.y,e.y),right:Math.max(t.right,e.right),bottom:Math.max(t.bottom,e.bottom),width:0,height:0}}static combineBounds(t,e,n){const o={element:{...t.element},inner:{...t.inner},outer:{...t.outer}};return e&&(o.inner=h.expandBoundary(o.inner,e),o.inner=h.calculateDimensions(o.inner),o.outer=h.expandBoundary(o.outer,e),o.outer=h.calculateDimensions(o.outer)),o.outer=h.applyMargins(o.outer,n),o}static applyMargins(t,e){const n=t.x-e.left,o=t.y-e.top,i=t.right+e.right,r=t.bottom+e.bottom;return{x:n,y:o,width:i-n,height:r-o,right:i,bottom:r}}static calculateDimensions(t){const e=Math.max(0,t.right-t.x),n=Math.max(0,t.bottom-t.y);return{x:t.x,y:t.y,width:e,height:n,right:t.x+e,bottom:t.y+n}}}function m(t,e,n=!1){Object.entries(e).forEach((([e,o])=>{f(t,e,o,n)}))}function f(t,e,n,o=!1){if("className"===e)t.className.baseVal=n;else if("style"===e&&"object"==typeof n)Object.assign(t.style,n);else if(e.startsWith("on")&&"function"==typeof n){const o=e.substring(2).toLowerCase();t.addEventListener(o,n)}else e in t?t[e]=n:o?t.setAttributeNS(null,e,n):t.setAttribute(e,n)}function g(t,e){if("className"===e)t.className="";else if("style"===e)t.removeAttribute("style");else if(e.startsWith("on")){const t=e.substring(2).toLowerCase();console.warn(`Cannot remove event listener for ${t}. You need to keep a reference to the handler.`)}else t.removeAttribute(e)}function y(t,e=document){return"undefined"==typeof document?null:e.querySelector(t)}function b(t,e=document){return e.querySelectorAll(t)}function p(t,e,n){if("undefined"==typeof document)return null;const o=document.createElement(t);return e&&m(o,e),n&&n.length>0&&n.forEach((t=>{"string"==typeof t?o.appendChild(document.createTextNode(t)):o.appendChild(t)})),o}function w(t,e,n){if("undefined"==typeof document)return null;const o=document.createElementNS("http://www.w3.org/2000/svg",t);return e&&m(o,e,!0),n&&n.length>0&&n.forEach((t=>{"string"==typeof t?o.appendChild(document.createTextNode(t)):o.appendChild(t)})),o}function v(t,e,n){"undefined"!=typeof document&&t.addEventListener(e,n)}function x(t,e,n){"undefined"!=typeof document&&t.removeEventListener(e,n)}function E(t,e){return"undefined"==typeof document||("string"==typeof e?t.appendChild(document.createTextNode(e)):t.appendChild(e)),t}function B(t,e,n){"undefined"!=typeof document&&t.insertBefore(e,n)}function N(t){if("undefined"!=typeof document)for(;t.firstChild;)t.removeChild(t.firstChild)}function C(t){"undefined"!=typeof document&&t.parentElement&&t.parentElement.removeChild(t)}return e}()}));