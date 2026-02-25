/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 2551:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
/*
 Modernizr 3.0.0pre (Custom Build) | MIT
*/
var aa=__webpack_require__(6540),ca=__webpack_require__(9982);function p(a){for(var b="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=1;c<arguments.length;c++)b+="&args[]="+encodeURIComponent(arguments[c]);return"Minified React error #"+a+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var da=new Set,ea={};function fa(a,b){ha(a,b);ha(a+"Capture",b)}
function ha(a,b){ea[a]=b;for(a=0;a<b.length;a++)da.add(b[a])}
var ia=!("undefined"===typeof window||"undefined"===typeof window.document||"undefined"===typeof window.document.createElement),ja=Object.prototype.hasOwnProperty,ka=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,la=
{},ma={};function oa(a){if(ja.call(ma,a))return!0;if(ja.call(la,a))return!1;if(ka.test(a))return ma[a]=!0;la[a]=!0;return!1}function pa(a,b,c,d){if(null!==c&&0===c.type)return!1;switch(typeof b){case "function":case "symbol":return!0;case "boolean":if(d)return!1;if(null!==c)return!c.acceptsBooleans;a=a.toLowerCase().slice(0,5);return"data-"!==a&&"aria-"!==a;default:return!1}}
function qa(a,b,c,d){if(null===b||"undefined"===typeof b||pa(a,b,c,d))return!0;if(d)return!1;if(null!==c)switch(c.type){case 3:return!b;case 4:return!1===b;case 5:return isNaN(b);case 6:return isNaN(b)||1>b}return!1}function v(a,b,c,d,e,f,g){this.acceptsBooleans=2===b||3===b||4===b;this.attributeName=d;this.attributeNamespace=e;this.mustUseProperty=c;this.propertyName=a;this.type=b;this.sanitizeURL=f;this.removeEmptyString=g}var z={};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a){z[a]=new v(a,0,!1,a,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(a){var b=a[0];z[b]=new v(b,1,!1,a[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(a){z[a]=new v(a,2,!1,a.toLowerCase(),null,!1,!1)});
["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(a){z[a]=new v(a,2,!1,a,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a){z[a]=new v(a,3,!1,a.toLowerCase(),null,!1,!1)});
["checked","multiple","muted","selected"].forEach(function(a){z[a]=new v(a,3,!0,a,null,!1,!1)});["capture","download"].forEach(function(a){z[a]=new v(a,4,!1,a,null,!1,!1)});["cols","rows","size","span"].forEach(function(a){z[a]=new v(a,6,!1,a,null,!1,!1)});["rowSpan","start"].forEach(function(a){z[a]=new v(a,5,!1,a.toLowerCase(),null,!1,!1)});var ra=/[\-:]([a-z])/g;function sa(a){return a[1].toUpperCase()}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a){var b=a.replace(ra,
sa);z[b]=new v(b,1,!1,a,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a){var b=a.replace(ra,sa);z[b]=new v(b,1,!1,a,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(a){var b=a.replace(ra,sa);z[b]=new v(b,1,!1,a,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(a){z[a]=new v(a,1,!1,a.toLowerCase(),null,!1,!1)});
z.xlinkHref=new v("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(a){z[a]=new v(a,1,!1,a.toLowerCase(),null,!0,!0)});
function ta(a,b,c,d){var e=z.hasOwnProperty(b)?z[b]:null;if(null!==e?0!==e.type:d||!(2<b.length)||"o"!==b[0]&&"O"!==b[0]||"n"!==b[1]&&"N"!==b[1])qa(b,c,e,d)&&(c=null),d||null===e?oa(b)&&(null===c?a.removeAttribute(b):a.setAttribute(b,""+c)):e.mustUseProperty?a[e.propertyName]=null===c?3===e.type?!1:"":c:(b=e.attributeName,d=e.attributeNamespace,null===c?a.removeAttribute(b):(e=e.type,c=3===e||4===e&&!0===c?"":""+c,d?a.setAttributeNS(d,b,c):a.setAttribute(b,c)))}
var ua=aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,va=Symbol.for("react.element"),wa=Symbol.for("react.portal"),ya=Symbol.for("react.fragment"),za=Symbol.for("react.strict_mode"),Aa=Symbol.for("react.profiler"),Ba=Symbol.for("react.provider"),Ca=Symbol.for("react.context"),Da=Symbol.for("react.forward_ref"),Ea=Symbol.for("react.suspense"),Fa=Symbol.for("react.suspense_list"),Ga=Symbol.for("react.memo"),Ha=Symbol.for("react.lazy");Symbol.for("react.scope");Symbol.for("react.debug_trace_mode");
var Ia=Symbol.for("react.offscreen");Symbol.for("react.legacy_hidden");Symbol.for("react.cache");Symbol.for("react.tracing_marker");var Ja=Symbol.iterator;function Ka(a){if(null===a||"object"!==typeof a)return null;a=Ja&&a[Ja]||a["@@iterator"];return"function"===typeof a?a:null}var A=Object.assign,La;function Ma(a){if(void 0===La)try{throw Error();}catch(c){var b=c.stack.trim().match(/\n( *(at )?)/);La=b&&b[1]||""}return"\n"+La+a}var Na=!1;
function Oa(a,b){if(!a||Na)return"";Na=!0;var c=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(b)if(b=function(){throw Error();},Object.defineProperty(b.prototype,"props",{set:function(){throw Error();}}),"object"===typeof Reflect&&Reflect.construct){try{Reflect.construct(b,[])}catch(l){var d=l}Reflect.construct(a,[],b)}else{try{b.call()}catch(l){d=l}a.call(b.prototype)}else{try{throw Error();}catch(l){d=l}a()}}catch(l){if(l&&d&&"string"===typeof l.stack){for(var e=l.stack.split("\n"),
f=d.stack.split("\n"),g=e.length-1,h=f.length-1;1<=g&&0<=h&&e[g]!==f[h];)h--;for(;1<=g&&0<=h;g--,h--)if(e[g]!==f[h]){if(1!==g||1!==h){do if(g--,h--,0>h||e[g]!==f[h]){var k="\n"+e[g].replace(" at new "," at ");a.displayName&&k.includes("<anonymous>")&&(k=k.replace("<anonymous>",a.displayName));return k}while(1<=g&&0<=h)}break}}}finally{Na=!1,Error.prepareStackTrace=c}return(a=a?a.displayName||a.name:"")?Ma(a):""}
function Pa(a){switch(a.tag){case 5:return Ma(a.type);case 16:return Ma("Lazy");case 13:return Ma("Suspense");case 19:return Ma("SuspenseList");case 0:case 2:case 15:return a=Oa(a.type,!1),a;case 11:return a=Oa(a.type.render,!1),a;case 1:return a=Oa(a.type,!0),a;default:return""}}
function Qa(a){if(null==a)return null;if("function"===typeof a)return a.displayName||a.name||null;if("string"===typeof a)return a;switch(a){case ya:return"Fragment";case wa:return"Portal";case Aa:return"Profiler";case za:return"StrictMode";case Ea:return"Suspense";case Fa:return"SuspenseList"}if("object"===typeof a)switch(a.$$typeof){case Ca:return(a.displayName||"Context")+".Consumer";case Ba:return(a._context.displayName||"Context")+".Provider";case Da:var b=a.render;a=a.displayName;a||(a=b.displayName||
b.name||"",a=""!==a?"ForwardRef("+a+")":"ForwardRef");return a;case Ga:return b=a.displayName||null,null!==b?b:Qa(a.type)||"Memo";case Ha:b=a._payload;a=a._init;try{return Qa(a(b))}catch(c){}}return null}
function Ra(a){var b=a.type;switch(a.tag){case 24:return"Cache";case 9:return(b.displayName||"Context")+".Consumer";case 10:return(b._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return a=b.render,a=a.displayName||a.name||"",b.displayName||(""!==a?"ForwardRef("+a+")":"ForwardRef");case 7:return"Fragment";case 5:return b;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Qa(b);case 8:return b===za?"StrictMode":"Mode";case 22:return"Offscreen";
case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if("function"===typeof b)return b.displayName||b.name||null;if("string"===typeof b)return b}return null}function Sa(a){switch(typeof a){case "boolean":case "number":case "string":case "undefined":return a;case "object":return a;default:return""}}
function Ta(a){var b=a.type;return(a=a.nodeName)&&"input"===a.toLowerCase()&&("checkbox"===b||"radio"===b)}
function Ua(a){var b=Ta(a)?"checked":"value",c=Object.getOwnPropertyDescriptor(a.constructor.prototype,b),d=""+a[b];if(!a.hasOwnProperty(b)&&"undefined"!==typeof c&&"function"===typeof c.get&&"function"===typeof c.set){var e=c.get,f=c.set;Object.defineProperty(a,b,{configurable:!0,get:function(){return e.call(this)},set:function(a){d=""+a;f.call(this,a)}});Object.defineProperty(a,b,{enumerable:c.enumerable});return{getValue:function(){return d},setValue:function(a){d=""+a},stopTracking:function(){a._valueTracker=
null;delete a[b]}}}}function Va(a){a._valueTracker||(a._valueTracker=Ua(a))}function Wa(a){if(!a)return!1;var b=a._valueTracker;if(!b)return!0;var c=b.getValue();var d="";a&&(d=Ta(a)?a.checked?"true":"false":a.value);a=d;return a!==c?(b.setValue(a),!0):!1}function Xa(a){a=a||("undefined"!==typeof document?document:void 0);if("undefined"===typeof a)return null;try{return a.activeElement||a.body}catch(b){return a.body}}
function Ya(a,b){var c=b.checked;return A({},b,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:null!=c?c:a._wrapperState.initialChecked})}function Za(a,b){var c=null==b.defaultValue?"":b.defaultValue,d=null!=b.checked?b.checked:b.defaultChecked;c=Sa(null!=b.value?b.value:c);a._wrapperState={initialChecked:d,initialValue:c,controlled:"checkbox"===b.type||"radio"===b.type?null!=b.checked:null!=b.value}}function ab(a,b){b=b.checked;null!=b&&ta(a,"checked",b,!1)}
function bb(a,b){ab(a,b);var c=Sa(b.value),d=b.type;if(null!=c)if("number"===d){if(0===c&&""===a.value||a.value!=c)a.value=""+c}else a.value!==""+c&&(a.value=""+c);else if("submit"===d||"reset"===d){a.removeAttribute("value");return}b.hasOwnProperty("value")?cb(a,b.type,c):b.hasOwnProperty("defaultValue")&&cb(a,b.type,Sa(b.defaultValue));null==b.checked&&null!=b.defaultChecked&&(a.defaultChecked=!!b.defaultChecked)}
function db(a,b,c){if(b.hasOwnProperty("value")||b.hasOwnProperty("defaultValue")){var d=b.type;if(!("submit"!==d&&"reset"!==d||void 0!==b.value&&null!==b.value))return;b=""+a._wrapperState.initialValue;c||b===a.value||(a.value=b);a.defaultValue=b}c=a.name;""!==c&&(a.name="");a.defaultChecked=!!a._wrapperState.initialChecked;""!==c&&(a.name=c)}
function cb(a,b,c){if("number"!==b||Xa(a.ownerDocument)!==a)null==c?a.defaultValue=""+a._wrapperState.initialValue:a.defaultValue!==""+c&&(a.defaultValue=""+c)}var eb=Array.isArray;
function fb(a,b,c,d){a=a.options;if(b){b={};for(var e=0;e<c.length;e++)b["$"+c[e]]=!0;for(c=0;c<a.length;c++)e=b.hasOwnProperty("$"+a[c].value),a[c].selected!==e&&(a[c].selected=e),e&&d&&(a[c].defaultSelected=!0)}else{c=""+Sa(c);b=null;for(e=0;e<a.length;e++){if(a[e].value===c){a[e].selected=!0;d&&(a[e].defaultSelected=!0);return}null!==b||a[e].disabled||(b=a[e])}null!==b&&(b.selected=!0)}}
function gb(a,b){if(null!=b.dangerouslySetInnerHTML)throw Error(p(91));return A({},b,{value:void 0,defaultValue:void 0,children:""+a._wrapperState.initialValue})}function hb(a,b){var c=b.value;if(null==c){c=b.children;b=b.defaultValue;if(null!=c){if(null!=b)throw Error(p(92));if(eb(c)){if(1<c.length)throw Error(p(93));c=c[0]}b=c}null==b&&(b="");c=b}a._wrapperState={initialValue:Sa(c)}}
function ib(a,b){var c=Sa(b.value),d=Sa(b.defaultValue);null!=c&&(c=""+c,c!==a.value&&(a.value=c),null==b.defaultValue&&a.defaultValue!==c&&(a.defaultValue=c));null!=d&&(a.defaultValue=""+d)}function jb(a){var b=a.textContent;b===a._wrapperState.initialValue&&""!==b&&null!==b&&(a.value=b)}function kb(a){switch(a){case "svg":return"http://www.w3.org/2000/svg";case "math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}
function lb(a,b){return null==a||"http://www.w3.org/1999/xhtml"===a?kb(b):"http://www.w3.org/2000/svg"===a&&"foreignObject"===b?"http://www.w3.org/1999/xhtml":a}
var mb,nb=function(a){return"undefined"!==typeof MSApp&&MSApp.execUnsafeLocalFunction?function(b,c,d,e){MSApp.execUnsafeLocalFunction(function(){return a(b,c,d,e)})}:a}(function(a,b){if("http://www.w3.org/2000/svg"!==a.namespaceURI||"innerHTML"in a)a.innerHTML=b;else{mb=mb||document.createElement("div");mb.innerHTML="<svg>"+b.valueOf().toString()+"</svg>";for(b=mb.firstChild;a.firstChild;)a.removeChild(a.firstChild);for(;b.firstChild;)a.appendChild(b.firstChild)}});
function ob(a,b){if(b){var c=a.firstChild;if(c&&c===a.lastChild&&3===c.nodeType){c.nodeValue=b;return}}a.textContent=b}
var pb={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,
zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},qb=["Webkit","ms","Moz","O"];Object.keys(pb).forEach(function(a){qb.forEach(function(b){b=b+a.charAt(0).toUpperCase()+a.substring(1);pb[b]=pb[a]})});function rb(a,b,c){return null==b||"boolean"===typeof b||""===b?"":c||"number"!==typeof b||0===b||pb.hasOwnProperty(a)&&pb[a]?(""+b).trim():b+"px"}
function sb(a,b){a=a.style;for(var c in b)if(b.hasOwnProperty(c)){var d=0===c.indexOf("--"),e=rb(c,b[c],d);"float"===c&&(c="cssFloat");d?a.setProperty(c,e):a[c]=e}}var tb=A({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});
function ub(a,b){if(b){if(tb[a]&&(null!=b.children||null!=b.dangerouslySetInnerHTML))throw Error(p(137,a));if(null!=b.dangerouslySetInnerHTML){if(null!=b.children)throw Error(p(60));if("object"!==typeof b.dangerouslySetInnerHTML||!("__html"in b.dangerouslySetInnerHTML))throw Error(p(61));}if(null!=b.style&&"object"!==typeof b.style)throw Error(p(62));}}
function vb(a,b){if(-1===a.indexOf("-"))return"string"===typeof b.is;switch(a){case "annotation-xml":case "color-profile":case "font-face":case "font-face-src":case "font-face-uri":case "font-face-format":case "font-face-name":case "missing-glyph":return!1;default:return!0}}var wb=null;function xb(a){a=a.target||a.srcElement||window;a.correspondingUseElement&&(a=a.correspondingUseElement);return 3===a.nodeType?a.parentNode:a}var yb=null,zb=null,Ab=null;
function Bb(a){if(a=Cb(a)){if("function"!==typeof yb)throw Error(p(280));var b=a.stateNode;b&&(b=Db(b),yb(a.stateNode,a.type,b))}}function Eb(a){zb?Ab?Ab.push(a):Ab=[a]:zb=a}function Fb(){if(zb){var a=zb,b=Ab;Ab=zb=null;Bb(a);if(b)for(a=0;a<b.length;a++)Bb(b[a])}}function Gb(a,b){return a(b)}function Hb(){}var Ib=!1;function Jb(a,b,c){if(Ib)return a(b,c);Ib=!0;try{return Gb(a,b,c)}finally{if(Ib=!1,null!==zb||null!==Ab)Hb(),Fb()}}
function Kb(a,b){var c=a.stateNode;if(null===c)return null;var d=Db(c);if(null===d)return null;c=d[b];a:switch(b){case "onClick":case "onClickCapture":case "onDoubleClick":case "onDoubleClickCapture":case "onMouseDown":case "onMouseDownCapture":case "onMouseMove":case "onMouseMoveCapture":case "onMouseUp":case "onMouseUpCapture":case "onMouseEnter":(d=!d.disabled)||(a=a.type,d=!("button"===a||"input"===a||"select"===a||"textarea"===a));a=!d;break a;default:a=!1}if(a)return null;if(c&&"function"!==
typeof c)throw Error(p(231,b,typeof c));return c}var Lb=!1;if(ia)try{var Mb={};Object.defineProperty(Mb,"passive",{get:function(){Lb=!0}});window.addEventListener("test",Mb,Mb);window.removeEventListener("test",Mb,Mb)}catch(a){Lb=!1}function Nb(a,b,c,d,e,f,g,h,k){var l=Array.prototype.slice.call(arguments,3);try{b.apply(c,l)}catch(m){this.onError(m)}}var Ob=!1,Pb=null,Qb=!1,Rb=null,Sb={onError:function(a){Ob=!0;Pb=a}};function Tb(a,b,c,d,e,f,g,h,k){Ob=!1;Pb=null;Nb.apply(Sb,arguments)}
function Ub(a,b,c,d,e,f,g,h,k){Tb.apply(this,arguments);if(Ob){if(Ob){var l=Pb;Ob=!1;Pb=null}else throw Error(p(198));Qb||(Qb=!0,Rb=l)}}function Vb(a){var b=a,c=a;if(a.alternate)for(;b.return;)b=b.return;else{a=b;do b=a,0!==(b.flags&4098)&&(c=b.return),a=b.return;while(a)}return 3===b.tag?c:null}function Wb(a){if(13===a.tag){var b=a.memoizedState;null===b&&(a=a.alternate,null!==a&&(b=a.memoizedState));if(null!==b)return b.dehydrated}return null}function Xb(a){if(Vb(a)!==a)throw Error(p(188));}
function Yb(a){var b=a.alternate;if(!b){b=Vb(a);if(null===b)throw Error(p(188));return b!==a?null:a}for(var c=a,d=b;;){var e=c.return;if(null===e)break;var f=e.alternate;if(null===f){d=e.return;if(null!==d){c=d;continue}break}if(e.child===f.child){for(f=e.child;f;){if(f===c)return Xb(e),a;if(f===d)return Xb(e),b;f=f.sibling}throw Error(p(188));}if(c.return!==d.return)c=e,d=f;else{for(var g=!1,h=e.child;h;){if(h===c){g=!0;c=e;d=f;break}if(h===d){g=!0;d=e;c=f;break}h=h.sibling}if(!g){for(h=f.child;h;){if(h===
c){g=!0;c=f;d=e;break}if(h===d){g=!0;d=f;c=e;break}h=h.sibling}if(!g)throw Error(p(189));}}if(c.alternate!==d)throw Error(p(190));}if(3!==c.tag)throw Error(p(188));return c.stateNode.current===c?a:b}function Zb(a){a=Yb(a);return null!==a?$b(a):null}function $b(a){if(5===a.tag||6===a.tag)return a;for(a=a.child;null!==a;){var b=$b(a);if(null!==b)return b;a=a.sibling}return null}
var ac=ca.unstable_scheduleCallback,bc=ca.unstable_cancelCallback,cc=ca.unstable_shouldYield,dc=ca.unstable_requestPaint,B=ca.unstable_now,ec=ca.unstable_getCurrentPriorityLevel,fc=ca.unstable_ImmediatePriority,gc=ca.unstable_UserBlockingPriority,hc=ca.unstable_NormalPriority,ic=ca.unstable_LowPriority,jc=ca.unstable_IdlePriority,kc=null,lc=null;function mc(a){if(lc&&"function"===typeof lc.onCommitFiberRoot)try{lc.onCommitFiberRoot(kc,a,void 0,128===(a.current.flags&128))}catch(b){}}
var oc=Math.clz32?Math.clz32:nc,pc=Math.log,qc=Math.LN2;function nc(a){a>>>=0;return 0===a?32:31-(pc(a)/qc|0)|0}var rc=64,sc=4194304;
function tc(a){switch(a&-a){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return a&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return a&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;
default:return a}}function uc(a,b){var c=a.pendingLanes;if(0===c)return 0;var d=0,e=a.suspendedLanes,f=a.pingedLanes,g=c&268435455;if(0!==g){var h=g&~e;0!==h?d=tc(h):(f&=g,0!==f&&(d=tc(f)))}else g=c&~e,0!==g?d=tc(g):0!==f&&(d=tc(f));if(0===d)return 0;if(0!==b&&b!==d&&0===(b&e)&&(e=d&-d,f=b&-b,e>=f||16===e&&0!==(f&4194240)))return b;0!==(d&4)&&(d|=c&16);b=a.entangledLanes;if(0!==b)for(a=a.entanglements,b&=d;0<b;)c=31-oc(b),e=1<<c,d|=a[c],b&=~e;return d}
function vc(a,b){switch(a){case 1:case 2:case 4:return b+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return b+5E3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}
function wc(a,b){for(var c=a.suspendedLanes,d=a.pingedLanes,e=a.expirationTimes,f=a.pendingLanes;0<f;){var g=31-oc(f),h=1<<g,k=e[g];if(-1===k){if(0===(h&c)||0!==(h&d))e[g]=vc(h,b)}else k<=b&&(a.expiredLanes|=h);f&=~h}}function xc(a){a=a.pendingLanes&-1073741825;return 0!==a?a:a&1073741824?1073741824:0}function yc(){var a=rc;rc<<=1;0===(rc&4194240)&&(rc=64);return a}function zc(a){for(var b=[],c=0;31>c;c++)b.push(a);return b}
function Ac(a,b,c){a.pendingLanes|=b;536870912!==b&&(a.suspendedLanes=0,a.pingedLanes=0);a=a.eventTimes;b=31-oc(b);a[b]=c}function Bc(a,b){var c=a.pendingLanes&~b;a.pendingLanes=b;a.suspendedLanes=0;a.pingedLanes=0;a.expiredLanes&=b;a.mutableReadLanes&=b;a.entangledLanes&=b;b=a.entanglements;var d=a.eventTimes;for(a=a.expirationTimes;0<c;){var e=31-oc(c),f=1<<e;b[e]=0;d[e]=-1;a[e]=-1;c&=~f}}
function Cc(a,b){var c=a.entangledLanes|=b;for(a=a.entanglements;c;){var d=31-oc(c),e=1<<d;e&b|a[d]&b&&(a[d]|=b);c&=~e}}var C=0;function Dc(a){a&=-a;return 1<a?4<a?0!==(a&268435455)?16:536870912:4:1}var Ec,Fc,Gc,Hc,Ic,Jc=!1,Kc=[],Lc=null,Mc=null,Nc=null,Oc=new Map,Pc=new Map,Qc=[],Rc="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function Sc(a,b){switch(a){case "focusin":case "focusout":Lc=null;break;case "dragenter":case "dragleave":Mc=null;break;case "mouseover":case "mouseout":Nc=null;break;case "pointerover":case "pointerout":Oc.delete(b.pointerId);break;case "gotpointercapture":case "lostpointercapture":Pc.delete(b.pointerId)}}
function Tc(a,b,c,d,e,f){if(null===a||a.nativeEvent!==f)return a={blockedOn:b,domEventName:c,eventSystemFlags:d,nativeEvent:f,targetContainers:[e]},null!==b&&(b=Cb(b),null!==b&&Fc(b)),a;a.eventSystemFlags|=d;b=a.targetContainers;null!==e&&-1===b.indexOf(e)&&b.push(e);return a}
function Uc(a,b,c,d,e){switch(b){case "focusin":return Lc=Tc(Lc,a,b,c,d,e),!0;case "dragenter":return Mc=Tc(Mc,a,b,c,d,e),!0;case "mouseover":return Nc=Tc(Nc,a,b,c,d,e),!0;case "pointerover":var f=e.pointerId;Oc.set(f,Tc(Oc.get(f)||null,a,b,c,d,e));return!0;case "gotpointercapture":return f=e.pointerId,Pc.set(f,Tc(Pc.get(f)||null,a,b,c,d,e)),!0}return!1}
function Vc(a){var b=Wc(a.target);if(null!==b){var c=Vb(b);if(null!==c)if(b=c.tag,13===b){if(b=Wb(c),null!==b){a.blockedOn=b;Ic(a.priority,function(){Gc(c)});return}}else if(3===b&&c.stateNode.current.memoizedState.isDehydrated){a.blockedOn=3===c.tag?c.stateNode.containerInfo:null;return}}a.blockedOn=null}
function Xc(a){if(null!==a.blockedOn)return!1;for(var b=a.targetContainers;0<b.length;){var c=Yc(a.domEventName,a.eventSystemFlags,b[0],a.nativeEvent);if(null===c){c=a.nativeEvent;var d=new c.constructor(c.type,c);wb=d;c.target.dispatchEvent(d);wb=null}else return b=Cb(c),null!==b&&Fc(b),a.blockedOn=c,!1;b.shift()}return!0}function Zc(a,b,c){Xc(a)&&c.delete(b)}function $c(){Jc=!1;null!==Lc&&Xc(Lc)&&(Lc=null);null!==Mc&&Xc(Mc)&&(Mc=null);null!==Nc&&Xc(Nc)&&(Nc=null);Oc.forEach(Zc);Pc.forEach(Zc)}
function ad(a,b){a.blockedOn===b&&(a.blockedOn=null,Jc||(Jc=!0,ca.unstable_scheduleCallback(ca.unstable_NormalPriority,$c)))}
function bd(a){function b(b){return ad(b,a)}if(0<Kc.length){ad(Kc[0],a);for(var c=1;c<Kc.length;c++){var d=Kc[c];d.blockedOn===a&&(d.blockedOn=null)}}null!==Lc&&ad(Lc,a);null!==Mc&&ad(Mc,a);null!==Nc&&ad(Nc,a);Oc.forEach(b);Pc.forEach(b);for(c=0;c<Qc.length;c++)d=Qc[c],d.blockedOn===a&&(d.blockedOn=null);for(;0<Qc.length&&(c=Qc[0],null===c.blockedOn);)Vc(c),null===c.blockedOn&&Qc.shift()}var cd=ua.ReactCurrentBatchConfig,dd=!0;
function ed(a,b,c,d){var e=C,f=cd.transition;cd.transition=null;try{C=1,fd(a,b,c,d)}finally{C=e,cd.transition=f}}function gd(a,b,c,d){var e=C,f=cd.transition;cd.transition=null;try{C=4,fd(a,b,c,d)}finally{C=e,cd.transition=f}}
function fd(a,b,c,d){if(dd){var e=Yc(a,b,c,d);if(null===e)hd(a,b,d,id,c),Sc(a,d);else if(Uc(e,a,b,c,d))d.stopPropagation();else if(Sc(a,d),b&4&&-1<Rc.indexOf(a)){for(;null!==e;){var f=Cb(e);null!==f&&Ec(f);f=Yc(a,b,c,d);null===f&&hd(a,b,d,id,c);if(f===e)break;e=f}null!==e&&d.stopPropagation()}else hd(a,b,d,null,c)}}var id=null;
function Yc(a,b,c,d){id=null;a=xb(d);a=Wc(a);if(null!==a)if(b=Vb(a),null===b)a=null;else if(c=b.tag,13===c){a=Wb(b);if(null!==a)return a;a=null}else if(3===c){if(b.stateNode.current.memoizedState.isDehydrated)return 3===b.tag?b.stateNode.containerInfo:null;a=null}else b!==a&&(a=null);id=a;return null}
function jd(a){switch(a){case "cancel":case "click":case "close":case "contextmenu":case "copy":case "cut":case "auxclick":case "dblclick":case "dragend":case "dragstart":case "drop":case "focusin":case "focusout":case "input":case "invalid":case "keydown":case "keypress":case "keyup":case "mousedown":case "mouseup":case "paste":case "pause":case "play":case "pointercancel":case "pointerdown":case "pointerup":case "ratechange":case "reset":case "resize":case "seeked":case "submit":case "touchcancel":case "touchend":case "touchstart":case "volumechange":case "change":case "selectionchange":case "textInput":case "compositionstart":case "compositionend":case "compositionupdate":case "beforeblur":case "afterblur":case "beforeinput":case "blur":case "fullscreenchange":case "focus":case "hashchange":case "popstate":case "select":case "selectstart":return 1;case "drag":case "dragenter":case "dragexit":case "dragleave":case "dragover":case "mousemove":case "mouseout":case "mouseover":case "pointermove":case "pointerout":case "pointerover":case "scroll":case "toggle":case "touchmove":case "wheel":case "mouseenter":case "mouseleave":case "pointerenter":case "pointerleave":return 4;
case "message":switch(ec()){case fc:return 1;case gc:return 4;case hc:case ic:return 16;case jc:return 536870912;default:return 16}default:return 16}}var kd=null,ld=null,md=null;function nd(){if(md)return md;var a,b=ld,c=b.length,d,e="value"in kd?kd.value:kd.textContent,f=e.length;for(a=0;a<c&&b[a]===e[a];a++);var g=c-a;for(d=1;d<=g&&b[c-d]===e[f-d];d++);return md=e.slice(a,1<d?1-d:void 0)}
function od(a){var b=a.keyCode;"charCode"in a?(a=a.charCode,0===a&&13===b&&(a=13)):a=b;10===a&&(a=13);return 32<=a||13===a?a:0}function pd(){return!0}function qd(){return!1}
function rd(a){function b(b,d,e,f,g){this._reactName=b;this._targetInst=e;this.type=d;this.nativeEvent=f;this.target=g;this.currentTarget=null;for(var c in a)a.hasOwnProperty(c)&&(b=a[c],this[c]=b?b(f):f[c]);this.isDefaultPrevented=(null!=f.defaultPrevented?f.defaultPrevented:!1===f.returnValue)?pd:qd;this.isPropagationStopped=qd;return this}A(b.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():"unknown"!==typeof a.returnValue&&
(a.returnValue=!1),this.isDefaultPrevented=pd)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():"unknown"!==typeof a.cancelBubble&&(a.cancelBubble=!0),this.isPropagationStopped=pd)},persist:function(){},isPersistent:pd});return b}
var sd={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(a){return a.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},td=rd(sd),ud=A({},sd,{view:0,detail:0}),vd=rd(ud),wd,xd,yd,Ad=A({},ud,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:zd,button:0,buttons:0,relatedTarget:function(a){return void 0===a.relatedTarget?a.fromElement===a.srcElement?a.toElement:a.fromElement:a.relatedTarget},movementX:function(a){if("movementX"in
a)return a.movementX;a!==yd&&(yd&&"mousemove"===a.type?(wd=a.screenX-yd.screenX,xd=a.screenY-yd.screenY):xd=wd=0,yd=a);return wd},movementY:function(a){return"movementY"in a?a.movementY:xd}}),Bd=rd(Ad),Cd=A({},Ad,{dataTransfer:0}),Dd=rd(Cd),Ed=A({},ud,{relatedTarget:0}),Fd=rd(Ed),Gd=A({},sd,{animationName:0,elapsedTime:0,pseudoElement:0}),Hd=rd(Gd),Id=A({},sd,{clipboardData:function(a){return"clipboardData"in a?a.clipboardData:window.clipboardData}}),Jd=rd(Id),Kd=A({},sd,{data:0}),Ld=rd(Kd),Md={Esc:"Escape",
Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Nd={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",
119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Od={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Pd(a){var b=this.nativeEvent;return b.getModifierState?b.getModifierState(a):(a=Od[a])?!!b[a]:!1}function zd(){return Pd}
var Qd=A({},ud,{key:function(a){if(a.key){var b=Md[a.key]||a.key;if("Unidentified"!==b)return b}return"keypress"===a.type?(a=od(a),13===a?"Enter":String.fromCharCode(a)):"keydown"===a.type||"keyup"===a.type?Nd[a.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:zd,charCode:function(a){return"keypress"===a.type?od(a):0},keyCode:function(a){return"keydown"===a.type||"keyup"===a.type?a.keyCode:0},which:function(a){return"keypress"===
a.type?od(a):"keydown"===a.type||"keyup"===a.type?a.keyCode:0}}),Rd=rd(Qd),Sd=A({},Ad,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Td=rd(Sd),Ud=A({},ud,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:zd}),Vd=rd(Ud),Wd=A({},sd,{propertyName:0,elapsedTime:0,pseudoElement:0}),Xd=rd(Wd),Yd=A({},Ad,{deltaX:function(a){return"deltaX"in a?a.deltaX:"wheelDeltaX"in a?-a.wheelDeltaX:0},
deltaY:function(a){return"deltaY"in a?a.deltaY:"wheelDeltaY"in a?-a.wheelDeltaY:"wheelDelta"in a?-a.wheelDelta:0},deltaZ:0,deltaMode:0}),Zd=rd(Yd),$d=[9,13,27,32],ae=ia&&"CompositionEvent"in window,be=null;ia&&"documentMode"in document&&(be=document.documentMode);var ce=ia&&"TextEvent"in window&&!be,de=ia&&(!ae||be&&8<be&&11>=be),ee=String.fromCharCode(32),fe=!1;
function ge(a,b){switch(a){case "keyup":return-1!==$d.indexOf(b.keyCode);case "keydown":return 229!==b.keyCode;case "keypress":case "mousedown":case "focusout":return!0;default:return!1}}function he(a){a=a.detail;return"object"===typeof a&&"data"in a?a.data:null}var ie=!1;function je(a,b){switch(a){case "compositionend":return he(b);case "keypress":if(32!==b.which)return null;fe=!0;return ee;case "textInput":return a=b.data,a===ee&&fe?null:a;default:return null}}
function ke(a,b){if(ie)return"compositionend"===a||!ae&&ge(a,b)?(a=nd(),md=ld=kd=null,ie=!1,a):null;switch(a){case "paste":return null;case "keypress":if(!(b.ctrlKey||b.altKey||b.metaKey)||b.ctrlKey&&b.altKey){if(b.char&&1<b.char.length)return b.char;if(b.which)return String.fromCharCode(b.which)}return null;case "compositionend":return de&&"ko"!==b.locale?null:b.data;default:return null}}
var le={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function me(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return"input"===b?!!le[a.type]:"textarea"===b?!0:!1}function ne(a,b,c,d){Eb(d);b=oe(b,"onChange");0<b.length&&(c=new td("onChange","change",null,c,d),a.push({event:c,listeners:b}))}var pe=null,qe=null;function re(a){se(a,0)}function te(a){var b=ue(a);if(Wa(b))return a}
function ve(a,b){if("change"===a)return b}var we=!1;if(ia){var xe;if(ia){var ye="oninput"in document;if(!ye){var ze=document.createElement("div");ze.setAttribute("oninput","return;");ye="function"===typeof ze.oninput}xe=ye}else xe=!1;we=xe&&(!document.documentMode||9<document.documentMode)}function Ae(){pe&&(pe.detachEvent("onpropertychange",Be),qe=pe=null)}function Be(a){if("value"===a.propertyName&&te(qe)){var b=[];ne(b,qe,a,xb(a));Jb(re,b)}}
function Ce(a,b,c){"focusin"===a?(Ae(),pe=b,qe=c,pe.attachEvent("onpropertychange",Be)):"focusout"===a&&Ae()}function De(a){if("selectionchange"===a||"keyup"===a||"keydown"===a)return te(qe)}function Ee(a,b){if("click"===a)return te(b)}function Fe(a,b){if("input"===a||"change"===a)return te(b)}function Ge(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}var He="function"===typeof Object.is?Object.is:Ge;
function Ie(a,b){if(He(a,b))return!0;if("object"!==typeof a||null===a||"object"!==typeof b||null===b)return!1;var c=Object.keys(a),d=Object.keys(b);if(c.length!==d.length)return!1;for(d=0;d<c.length;d++){var e=c[d];if(!ja.call(b,e)||!He(a[e],b[e]))return!1}return!0}function Je(a){for(;a&&a.firstChild;)a=a.firstChild;return a}
function Ke(a,b){var c=Je(a);a=0;for(var d;c;){if(3===c.nodeType){d=a+c.textContent.length;if(a<=b&&d>=b)return{node:c,offset:b-a};a=d}a:{for(;c;){if(c.nextSibling){c=c.nextSibling;break a}c=c.parentNode}c=void 0}c=Je(c)}}function Le(a,b){return a&&b?a===b?!0:a&&3===a.nodeType?!1:b&&3===b.nodeType?Le(a,b.parentNode):"contains"in a?a.contains(b):a.compareDocumentPosition?!!(a.compareDocumentPosition(b)&16):!1:!1}
function Me(){for(var a=window,b=Xa();b instanceof a.HTMLIFrameElement;){try{var c="string"===typeof b.contentWindow.location.href}catch(d){c=!1}if(c)a=b.contentWindow;else break;b=Xa(a.document)}return b}function Ne(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return b&&("input"===b&&("text"===a.type||"search"===a.type||"tel"===a.type||"url"===a.type||"password"===a.type)||"textarea"===b||"true"===a.contentEditable)}
function Oe(a){var b=Me(),c=a.focusedElem,d=a.selectionRange;if(b!==c&&c&&c.ownerDocument&&Le(c.ownerDocument.documentElement,c)){if(null!==d&&Ne(c))if(b=d.start,a=d.end,void 0===a&&(a=b),"selectionStart"in c)c.selectionStart=b,c.selectionEnd=Math.min(a,c.value.length);else if(a=(b=c.ownerDocument||document)&&b.defaultView||window,a.getSelection){a=a.getSelection();var e=c.textContent.length,f=Math.min(d.start,e);d=void 0===d.end?f:Math.min(d.end,e);!a.extend&&f>d&&(e=d,d=f,f=e);e=Ke(c,f);var g=Ke(c,
d);e&&g&&(1!==a.rangeCount||a.anchorNode!==e.node||a.anchorOffset!==e.offset||a.focusNode!==g.node||a.focusOffset!==g.offset)&&(b=b.createRange(),b.setStart(e.node,e.offset),a.removeAllRanges(),f>d?(a.addRange(b),a.extend(g.node,g.offset)):(b.setEnd(g.node,g.offset),a.addRange(b)))}b=[];for(a=c;a=a.parentNode;)1===a.nodeType&&b.push({element:a,left:a.scrollLeft,top:a.scrollTop});"function"===typeof c.focus&&c.focus();for(c=0;c<b.length;c++)a=b[c],a.element.scrollLeft=a.left,a.element.scrollTop=a.top}}
var Pe=ia&&"documentMode"in document&&11>=document.documentMode,Qe=null,Re=null,Se=null,Te=!1;
function Ue(a,b,c){var d=c.window===c?c.document:9===c.nodeType?c:c.ownerDocument;Te||null==Qe||Qe!==Xa(d)||(d=Qe,"selectionStart"in d&&Ne(d)?d={start:d.selectionStart,end:d.selectionEnd}:(d=(d.ownerDocument&&d.ownerDocument.defaultView||window).getSelection(),d={anchorNode:d.anchorNode,anchorOffset:d.anchorOffset,focusNode:d.focusNode,focusOffset:d.focusOffset}),Se&&Ie(Se,d)||(Se=d,d=oe(Re,"onSelect"),0<d.length&&(b=new td("onSelect","select",null,b,c),a.push({event:b,listeners:d}),b.target=Qe)))}
function Ve(a,b){var c={};c[a.toLowerCase()]=b.toLowerCase();c["Webkit"+a]="webkit"+b;c["Moz"+a]="moz"+b;return c}var We={animationend:Ve("Animation","AnimationEnd"),animationiteration:Ve("Animation","AnimationIteration"),animationstart:Ve("Animation","AnimationStart"),transitionend:Ve("Transition","TransitionEnd")},Xe={},Ye={};
ia&&(Ye=document.createElement("div").style,"AnimationEvent"in window||(delete We.animationend.animation,delete We.animationiteration.animation,delete We.animationstart.animation),"TransitionEvent"in window||delete We.transitionend.transition);function Ze(a){if(Xe[a])return Xe[a];if(!We[a])return a;var b=We[a],c;for(c in b)if(b.hasOwnProperty(c)&&c in Ye)return Xe[a]=b[c];return a}var $e=Ze("animationend"),af=Ze("animationiteration"),bf=Ze("animationstart"),cf=Ze("transitionend"),df=new Map,ef="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function ff(a,b){df.set(a,b);fa(b,[a])}for(var gf=0;gf<ef.length;gf++){var hf=ef[gf],jf=hf.toLowerCase(),kf=hf[0].toUpperCase()+hf.slice(1);ff(jf,"on"+kf)}ff($e,"onAnimationEnd");ff(af,"onAnimationIteration");ff(bf,"onAnimationStart");ff("dblclick","onDoubleClick");ff("focusin","onFocus");ff("focusout","onBlur");ff(cf,"onTransitionEnd");ha("onMouseEnter",["mouseout","mouseover"]);ha("onMouseLeave",["mouseout","mouseover"]);ha("onPointerEnter",["pointerout","pointerover"]);
ha("onPointerLeave",["pointerout","pointerover"]);fa("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));fa("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));fa("onBeforeInput",["compositionend","keypress","textInput","paste"]);fa("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));fa("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));
fa("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var lf="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),mf=new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
function nf(a,b,c){var d=a.type||"unknown-event";a.currentTarget=c;Ub(d,b,void 0,a);a.currentTarget=null}
function se(a,b){b=0!==(b&4);for(var c=0;c<a.length;c++){var d=a[c],e=d.event;d=d.listeners;a:{var f=void 0;if(b)for(var g=d.length-1;0<=g;g--){var h=d[g],k=h.instance,l=h.currentTarget;h=h.listener;if(k!==f&&e.isPropagationStopped())break a;nf(e,h,l);f=k}else for(g=0;g<d.length;g++){h=d[g];k=h.instance;l=h.currentTarget;h=h.listener;if(k!==f&&e.isPropagationStopped())break a;nf(e,h,l);f=k}}}if(Qb)throw a=Rb,Qb=!1,Rb=null,a;}
function D(a,b){var c=b[of];void 0===c&&(c=b[of]=new Set);var d=a+"__bubble";c.has(d)||(pf(b,a,2,!1),c.add(d))}function qf(a,b,c){var d=0;b&&(d|=4);pf(c,a,d,b)}var rf="_reactListening"+Math.random().toString(36).slice(2);function sf(a){if(!a[rf]){a[rf]=!0;da.forEach(function(b){"selectionchange"!==b&&(mf.has(b)||qf(b,!1,a),qf(b,!0,a))});var b=9===a.nodeType?a:a.ownerDocument;null===b||b[rf]||(b[rf]=!0,qf("selectionchange",!1,b))}}
function pf(a,b,c,d){switch(jd(b)){case 1:var e=ed;break;case 4:e=gd;break;default:e=fd}c=e.bind(null,b,c,a);e=void 0;!Lb||"touchstart"!==b&&"touchmove"!==b&&"wheel"!==b||(e=!0);d?void 0!==e?a.addEventListener(b,c,{capture:!0,passive:e}):a.addEventListener(b,c,!0):void 0!==e?a.addEventListener(b,c,{passive:e}):a.addEventListener(b,c,!1)}
function hd(a,b,c,d,e){var f=d;if(0===(b&1)&&0===(b&2)&&null!==d)a:for(;;){if(null===d)return;var g=d.tag;if(3===g||4===g){var h=d.stateNode.containerInfo;if(h===e||8===h.nodeType&&h.parentNode===e)break;if(4===g)for(g=d.return;null!==g;){var k=g.tag;if(3===k||4===k)if(k=g.stateNode.containerInfo,k===e||8===k.nodeType&&k.parentNode===e)return;g=g.return}for(;null!==h;){g=Wc(h);if(null===g)return;k=g.tag;if(5===k||6===k){d=f=g;continue a}h=h.parentNode}}d=d.return}Jb(function(){var d=f,e=xb(c),g=[];
a:{var h=df.get(a);if(void 0!==h){var k=td,n=a;switch(a){case "keypress":if(0===od(c))break a;case "keydown":case "keyup":k=Rd;break;case "focusin":n="focus";k=Fd;break;case "focusout":n="blur";k=Fd;break;case "beforeblur":case "afterblur":k=Fd;break;case "click":if(2===c.button)break a;case "auxclick":case "dblclick":case "mousedown":case "mousemove":case "mouseup":case "mouseout":case "mouseover":case "contextmenu":k=Bd;break;case "drag":case "dragend":case "dragenter":case "dragexit":case "dragleave":case "dragover":case "dragstart":case "drop":k=
Dd;break;case "touchcancel":case "touchend":case "touchmove":case "touchstart":k=Vd;break;case $e:case af:case bf:k=Hd;break;case cf:k=Xd;break;case "scroll":k=vd;break;case "wheel":k=Zd;break;case "copy":case "cut":case "paste":k=Jd;break;case "gotpointercapture":case "lostpointercapture":case "pointercancel":case "pointerdown":case "pointermove":case "pointerout":case "pointerover":case "pointerup":k=Td}var t=0!==(b&4),J=!t&&"scroll"===a,x=t?null!==h?h+"Capture":null:h;t=[];for(var w=d,u;null!==
w;){u=w;var F=u.stateNode;5===u.tag&&null!==F&&(u=F,null!==x&&(F=Kb(w,x),null!=F&&t.push(tf(w,F,u))));if(J)break;w=w.return}0<t.length&&(h=new k(h,n,null,c,e),g.push({event:h,listeners:t}))}}if(0===(b&7)){a:{h="mouseover"===a||"pointerover"===a;k="mouseout"===a||"pointerout"===a;if(h&&c!==wb&&(n=c.relatedTarget||c.fromElement)&&(Wc(n)||n[uf]))break a;if(k||h){h=e.window===e?e:(h=e.ownerDocument)?h.defaultView||h.parentWindow:window;if(k){if(n=c.relatedTarget||c.toElement,k=d,n=n?Wc(n):null,null!==
n&&(J=Vb(n),n!==J||5!==n.tag&&6!==n.tag))n=null}else k=null,n=d;if(k!==n){t=Bd;F="onMouseLeave";x="onMouseEnter";w="mouse";if("pointerout"===a||"pointerover"===a)t=Td,F="onPointerLeave",x="onPointerEnter",w="pointer";J=null==k?h:ue(k);u=null==n?h:ue(n);h=new t(F,w+"leave",k,c,e);h.target=J;h.relatedTarget=u;F=null;Wc(e)===d&&(t=new t(x,w+"enter",n,c,e),t.target=u,t.relatedTarget=J,F=t);J=F;if(k&&n)b:{t=k;x=n;w=0;for(u=t;u;u=vf(u))w++;u=0;for(F=x;F;F=vf(F))u++;for(;0<w-u;)t=vf(t),w--;for(;0<u-w;)x=
vf(x),u--;for(;w--;){if(t===x||null!==x&&t===x.alternate)break b;t=vf(t);x=vf(x)}t=null}else t=null;null!==k&&wf(g,h,k,t,!1);null!==n&&null!==J&&wf(g,J,n,t,!0)}}}a:{h=d?ue(d):window;k=h.nodeName&&h.nodeName.toLowerCase();if("select"===k||"input"===k&&"file"===h.type)var na=ve;else if(me(h))if(we)na=Fe;else{na=De;var xa=Ce}else(k=h.nodeName)&&"input"===k.toLowerCase()&&("checkbox"===h.type||"radio"===h.type)&&(na=Ee);if(na&&(na=na(a,d))){ne(g,na,c,e);break a}xa&&xa(a,h,d);"focusout"===a&&(xa=h._wrapperState)&&
xa.controlled&&"number"===h.type&&cb(h,"number",h.value)}xa=d?ue(d):window;switch(a){case "focusin":if(me(xa)||"true"===xa.contentEditable)Qe=xa,Re=d,Se=null;break;case "focusout":Se=Re=Qe=null;break;case "mousedown":Te=!0;break;case "contextmenu":case "mouseup":case "dragend":Te=!1;Ue(g,c,e);break;case "selectionchange":if(Pe)break;case "keydown":case "keyup":Ue(g,c,e)}var $a;if(ae)b:{switch(a){case "compositionstart":var ba="onCompositionStart";break b;case "compositionend":ba="onCompositionEnd";
break b;case "compositionupdate":ba="onCompositionUpdate";break b}ba=void 0}else ie?ge(a,c)&&(ba="onCompositionEnd"):"keydown"===a&&229===c.keyCode&&(ba="onCompositionStart");ba&&(de&&"ko"!==c.locale&&(ie||"onCompositionStart"!==ba?"onCompositionEnd"===ba&&ie&&($a=nd()):(kd=e,ld="value"in kd?kd.value:kd.textContent,ie=!0)),xa=oe(d,ba),0<xa.length&&(ba=new Ld(ba,a,null,c,e),g.push({event:ba,listeners:xa}),$a?ba.data=$a:($a=he(c),null!==$a&&(ba.data=$a))));if($a=ce?je(a,c):ke(a,c))d=oe(d,"onBeforeInput"),
0<d.length&&(e=new Ld("onBeforeInput","beforeinput",null,c,e),g.push({event:e,listeners:d}),e.data=$a)}se(g,b)})}function tf(a,b,c){return{instance:a,listener:b,currentTarget:c}}function oe(a,b){for(var c=b+"Capture",d=[];null!==a;){var e=a,f=e.stateNode;5===e.tag&&null!==f&&(e=f,f=Kb(a,c),null!=f&&d.unshift(tf(a,f,e)),f=Kb(a,b),null!=f&&d.push(tf(a,f,e)));a=a.return}return d}function vf(a){if(null===a)return null;do a=a.return;while(a&&5!==a.tag);return a?a:null}
function wf(a,b,c,d,e){for(var f=b._reactName,g=[];null!==c&&c!==d;){var h=c,k=h.alternate,l=h.stateNode;if(null!==k&&k===d)break;5===h.tag&&null!==l&&(h=l,e?(k=Kb(c,f),null!=k&&g.unshift(tf(c,k,h))):e||(k=Kb(c,f),null!=k&&g.push(tf(c,k,h))));c=c.return}0!==g.length&&a.push({event:b,listeners:g})}var xf=/\r\n?/g,yf=/\u0000|\uFFFD/g;function zf(a){return("string"===typeof a?a:""+a).replace(xf,"\n").replace(yf,"")}function Af(a,b,c){b=zf(b);if(zf(a)!==b&&c)throw Error(p(425));}function Bf(){}
var Cf=null,Df=null;function Ef(a,b){return"textarea"===a||"noscript"===a||"string"===typeof b.children||"number"===typeof b.children||"object"===typeof b.dangerouslySetInnerHTML&&null!==b.dangerouslySetInnerHTML&&null!=b.dangerouslySetInnerHTML.__html}
var Ff="function"===typeof setTimeout?setTimeout:void 0,Gf="function"===typeof clearTimeout?clearTimeout:void 0,Hf="function"===typeof Promise?Promise:void 0,Jf="function"===typeof queueMicrotask?queueMicrotask:"undefined"!==typeof Hf?function(a){return Hf.resolve(null).then(a).catch(If)}:Ff;function If(a){setTimeout(function(){throw a;})}
function Kf(a,b){var c=b,d=0;do{var e=c.nextSibling;a.removeChild(c);if(e&&8===e.nodeType)if(c=e.data,"/$"===c){if(0===d){a.removeChild(e);bd(b);return}d--}else"$"!==c&&"$?"!==c&&"$!"!==c||d++;c=e}while(c);bd(b)}function Lf(a){for(;null!=a;a=a.nextSibling){var b=a.nodeType;if(1===b||3===b)break;if(8===b){b=a.data;if("$"===b||"$!"===b||"$?"===b)break;if("/$"===b)return null}}return a}
function Mf(a){a=a.previousSibling;for(var b=0;a;){if(8===a.nodeType){var c=a.data;if("$"===c||"$!"===c||"$?"===c){if(0===b)return a;b--}else"/$"===c&&b++}a=a.previousSibling}return null}var Nf=Math.random().toString(36).slice(2),Of="__reactFiber$"+Nf,Pf="__reactProps$"+Nf,uf="__reactContainer$"+Nf,of="__reactEvents$"+Nf,Qf="__reactListeners$"+Nf,Rf="__reactHandles$"+Nf;
function Wc(a){var b=a[Of];if(b)return b;for(var c=a.parentNode;c;){if(b=c[uf]||c[Of]){c=b.alternate;if(null!==b.child||null!==c&&null!==c.child)for(a=Mf(a);null!==a;){if(c=a[Of])return c;a=Mf(a)}return b}a=c;c=a.parentNode}return null}function Cb(a){a=a[Of]||a[uf];return!a||5!==a.tag&&6!==a.tag&&13!==a.tag&&3!==a.tag?null:a}function ue(a){if(5===a.tag||6===a.tag)return a.stateNode;throw Error(p(33));}function Db(a){return a[Pf]||null}var Sf=[],Tf=-1;function Uf(a){return{current:a}}
function E(a){0>Tf||(a.current=Sf[Tf],Sf[Tf]=null,Tf--)}function G(a,b){Tf++;Sf[Tf]=a.current;a.current=b}var Vf={},H=Uf(Vf),Wf=Uf(!1),Xf=Vf;function Yf(a,b){var c=a.type.contextTypes;if(!c)return Vf;var d=a.stateNode;if(d&&d.__reactInternalMemoizedUnmaskedChildContext===b)return d.__reactInternalMemoizedMaskedChildContext;var e={},f;for(f in c)e[f]=b[f];d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=b,a.__reactInternalMemoizedMaskedChildContext=e);return e}
function Zf(a){a=a.childContextTypes;return null!==a&&void 0!==a}function $f(){E(Wf);E(H)}function ag(a,b,c){if(H.current!==Vf)throw Error(p(168));G(H,b);G(Wf,c)}function bg(a,b,c){var d=a.stateNode;b=b.childContextTypes;if("function"!==typeof d.getChildContext)return c;d=d.getChildContext();for(var e in d)if(!(e in b))throw Error(p(108,Ra(a)||"Unknown",e));return A({},c,d)}
function cg(a){a=(a=a.stateNode)&&a.__reactInternalMemoizedMergedChildContext||Vf;Xf=H.current;G(H,a);G(Wf,Wf.current);return!0}function dg(a,b,c){var d=a.stateNode;if(!d)throw Error(p(169));c?(a=bg(a,b,Xf),d.__reactInternalMemoizedMergedChildContext=a,E(Wf),E(H),G(H,a)):E(Wf);G(Wf,c)}var eg=null,fg=!1,gg=!1;function hg(a){null===eg?eg=[a]:eg.push(a)}function ig(a){fg=!0;hg(a)}
function jg(){if(!gg&&null!==eg){gg=!0;var a=0,b=C;try{var c=eg;for(C=1;a<c.length;a++){var d=c[a];do d=d(!0);while(null!==d)}eg=null;fg=!1}catch(e){throw null!==eg&&(eg=eg.slice(a+1)),ac(fc,jg),e;}finally{C=b,gg=!1}}return null}var kg=[],lg=0,mg=null,ng=0,og=[],pg=0,qg=null,rg=1,sg="";function tg(a,b){kg[lg++]=ng;kg[lg++]=mg;mg=a;ng=b}
function ug(a,b,c){og[pg++]=rg;og[pg++]=sg;og[pg++]=qg;qg=a;var d=rg;a=sg;var e=32-oc(d)-1;d&=~(1<<e);c+=1;var f=32-oc(b)+e;if(30<f){var g=e-e%5;f=(d&(1<<g)-1).toString(32);d>>=g;e-=g;rg=1<<32-oc(b)+e|c<<e|d;sg=f+a}else rg=1<<f|c<<e|d,sg=a}function vg(a){null!==a.return&&(tg(a,1),ug(a,1,0))}function wg(a){for(;a===mg;)mg=kg[--lg],kg[lg]=null,ng=kg[--lg],kg[lg]=null;for(;a===qg;)qg=og[--pg],og[pg]=null,sg=og[--pg],og[pg]=null,rg=og[--pg],og[pg]=null}var xg=null,yg=null,I=!1,zg=null;
function Ag(a,b){var c=Bg(5,null,null,0);c.elementType="DELETED";c.stateNode=b;c.return=a;b=a.deletions;null===b?(a.deletions=[c],a.flags|=16):b.push(c)}
function Cg(a,b){switch(a.tag){case 5:var c=a.type;b=1!==b.nodeType||c.toLowerCase()!==b.nodeName.toLowerCase()?null:b;return null!==b?(a.stateNode=b,xg=a,yg=Lf(b.firstChild),!0):!1;case 6:return b=""===a.pendingProps||3!==b.nodeType?null:b,null!==b?(a.stateNode=b,xg=a,yg=null,!0):!1;case 13:return b=8!==b.nodeType?null:b,null!==b?(c=null!==qg?{id:rg,overflow:sg}:null,a.memoizedState={dehydrated:b,treeContext:c,retryLane:1073741824},c=Bg(18,null,null,0),c.stateNode=b,c.return=a,a.child=c,xg=a,yg=
null,!0):!1;default:return!1}}function Dg(a){return 0!==(a.mode&1)&&0===(a.flags&128)}function Eg(a){if(I){var b=yg;if(b){var c=b;if(!Cg(a,b)){if(Dg(a))throw Error(p(418));b=Lf(c.nextSibling);var d=xg;b&&Cg(a,b)?Ag(d,c):(a.flags=a.flags&-4097|2,I=!1,xg=a)}}else{if(Dg(a))throw Error(p(418));a.flags=a.flags&-4097|2;I=!1;xg=a}}}function Fg(a){for(a=a.return;null!==a&&5!==a.tag&&3!==a.tag&&13!==a.tag;)a=a.return;xg=a}
function Gg(a){if(a!==xg)return!1;if(!I)return Fg(a),I=!0,!1;var b;(b=3!==a.tag)&&!(b=5!==a.tag)&&(b=a.type,b="head"!==b&&"body"!==b&&!Ef(a.type,a.memoizedProps));if(b&&(b=yg)){if(Dg(a))throw Hg(),Error(p(418));for(;b;)Ag(a,b),b=Lf(b.nextSibling)}Fg(a);if(13===a.tag){a=a.memoizedState;a=null!==a?a.dehydrated:null;if(!a)throw Error(p(317));a:{a=a.nextSibling;for(b=0;a;){if(8===a.nodeType){var c=a.data;if("/$"===c){if(0===b){yg=Lf(a.nextSibling);break a}b--}else"$"!==c&&"$!"!==c&&"$?"!==c||b++}a=a.nextSibling}yg=
null}}else yg=xg?Lf(a.stateNode.nextSibling):null;return!0}function Hg(){for(var a=yg;a;)a=Lf(a.nextSibling)}function Ig(){yg=xg=null;I=!1}function Jg(a){null===zg?zg=[a]:zg.push(a)}var Kg=ua.ReactCurrentBatchConfig;
function Lg(a,b,c){a=c.ref;if(null!==a&&"function"!==typeof a&&"object"!==typeof a){if(c._owner){c=c._owner;if(c){if(1!==c.tag)throw Error(p(309));var d=c.stateNode}if(!d)throw Error(p(147,a));var e=d,f=""+a;if(null!==b&&null!==b.ref&&"function"===typeof b.ref&&b.ref._stringRef===f)return b.ref;b=function(a){var b=e.refs;null===a?delete b[f]:b[f]=a};b._stringRef=f;return b}if("string"!==typeof a)throw Error(p(284));if(!c._owner)throw Error(p(290,a));}return a}
function Mg(a,b){a=Object.prototype.toString.call(b);throw Error(p(31,"[object Object]"===a?"object with keys {"+Object.keys(b).join(", ")+"}":a));}function Ng(a){var b=a._init;return b(a._payload)}
function Og(a){function b(b,c){if(a){var d=b.deletions;null===d?(b.deletions=[c],b.flags|=16):d.push(c)}}function c(c,d){if(!a)return null;for(;null!==d;)b(c,d),d=d.sibling;return null}function d(a,b){for(a=new Map;null!==b;)null!==b.key?a.set(b.key,b):a.set(b.index,b),b=b.sibling;return a}function e(a,b){a=Pg(a,b);a.index=0;a.sibling=null;return a}function f(b,c,d){b.index=d;if(!a)return b.flags|=1048576,c;d=b.alternate;if(null!==d)return d=d.index,d<c?(b.flags|=2,c):d;b.flags|=2;return c}function g(b){a&&
null===b.alternate&&(b.flags|=2);return b}function h(a,b,c,d){if(null===b||6!==b.tag)return b=Qg(c,a.mode,d),b.return=a,b;b=e(b,c);b.return=a;return b}function k(a,b,c,d){var f=c.type;if(f===ya)return m(a,b,c.props.children,d,c.key);if(null!==b&&(b.elementType===f||"object"===typeof f&&null!==f&&f.$$typeof===Ha&&Ng(f)===b.type))return d=e(b,c.props),d.ref=Lg(a,b,c),d.return=a,d;d=Rg(c.type,c.key,c.props,null,a.mode,d);d.ref=Lg(a,b,c);d.return=a;return d}function l(a,b,c,d){if(null===b||4!==b.tag||
b.stateNode.containerInfo!==c.containerInfo||b.stateNode.implementation!==c.implementation)return b=Sg(c,a.mode,d),b.return=a,b;b=e(b,c.children||[]);b.return=a;return b}function m(a,b,c,d,f){if(null===b||7!==b.tag)return b=Tg(c,a.mode,d,f),b.return=a,b;b=e(b,c);b.return=a;return b}function q(a,b,c){if("string"===typeof b&&""!==b||"number"===typeof b)return b=Qg(""+b,a.mode,c),b.return=a,b;if("object"===typeof b&&null!==b){switch(b.$$typeof){case va:return c=Rg(b.type,b.key,b.props,null,a.mode,c),
c.ref=Lg(a,null,b),c.return=a,c;case wa:return b=Sg(b,a.mode,c),b.return=a,b;case Ha:var d=b._init;return q(a,d(b._payload),c)}if(eb(b)||Ka(b))return b=Tg(b,a.mode,c,null),b.return=a,b;Mg(a,b)}return null}function r(a,b,c,d){var e=null!==b?b.key:null;if("string"===typeof c&&""!==c||"number"===typeof c)return null!==e?null:h(a,b,""+c,d);if("object"===typeof c&&null!==c){switch(c.$$typeof){case va:return c.key===e?k(a,b,c,d):null;case wa:return c.key===e?l(a,b,c,d):null;case Ha:return e=c._init,r(a,
b,e(c._payload),d)}if(eb(c)||Ka(c))return null!==e?null:m(a,b,c,d,null);Mg(a,c)}return null}function y(a,b,c,d,e){if("string"===typeof d&&""!==d||"number"===typeof d)return a=a.get(c)||null,h(b,a,""+d,e);if("object"===typeof d&&null!==d){switch(d.$$typeof){case va:return a=a.get(null===d.key?c:d.key)||null,k(b,a,d,e);case wa:return a=a.get(null===d.key?c:d.key)||null,l(b,a,d,e);case Ha:var f=d._init;return y(a,b,c,f(d._payload),e)}if(eb(d)||Ka(d))return a=a.get(c)||null,m(b,a,d,e,null);Mg(b,d)}return null}
function n(e,g,h,k){for(var l=null,m=null,u=g,w=g=0,x=null;null!==u&&w<h.length;w++){u.index>w?(x=u,u=null):x=u.sibling;var n=r(e,u,h[w],k);if(null===n){null===u&&(u=x);break}a&&u&&null===n.alternate&&b(e,u);g=f(n,g,w);null===m?l=n:m.sibling=n;m=n;u=x}if(w===h.length)return c(e,u),I&&tg(e,w),l;if(null===u){for(;w<h.length;w++)u=q(e,h[w],k),null!==u&&(g=f(u,g,w),null===m?l=u:m.sibling=u,m=u);I&&tg(e,w);return l}for(u=d(e,u);w<h.length;w++)x=y(u,e,w,h[w],k),null!==x&&(a&&null!==x.alternate&&u.delete(null===
x.key?w:x.key),g=f(x,g,w),null===m?l=x:m.sibling=x,m=x);a&&u.forEach(function(a){return b(e,a)});I&&tg(e,w);return l}function t(e,g,h,k){var l=Ka(h);if("function"!==typeof l)throw Error(p(150));h=l.call(h);if(null==h)throw Error(p(151));for(var u=l=null,m=g,w=g=0,x=null,n=h.next();null!==m&&!n.done;w++,n=h.next()){m.index>w?(x=m,m=null):x=m.sibling;var t=r(e,m,n.value,k);if(null===t){null===m&&(m=x);break}a&&m&&null===t.alternate&&b(e,m);g=f(t,g,w);null===u?l=t:u.sibling=t;u=t;m=x}if(n.done)return c(e,
m),I&&tg(e,w),l;if(null===m){for(;!n.done;w++,n=h.next())n=q(e,n.value,k),null!==n&&(g=f(n,g,w),null===u?l=n:u.sibling=n,u=n);I&&tg(e,w);return l}for(m=d(e,m);!n.done;w++,n=h.next())n=y(m,e,w,n.value,k),null!==n&&(a&&null!==n.alternate&&m.delete(null===n.key?w:n.key),g=f(n,g,w),null===u?l=n:u.sibling=n,u=n);a&&m.forEach(function(a){return b(e,a)});I&&tg(e,w);return l}function J(a,d,f,h){"object"===typeof f&&null!==f&&f.type===ya&&null===f.key&&(f=f.props.children);if("object"===typeof f&&null!==f){switch(f.$$typeof){case va:a:{for(var k=
f.key,l=d;null!==l;){if(l.key===k){k=f.type;if(k===ya){if(7===l.tag){c(a,l.sibling);d=e(l,f.props.children);d.return=a;a=d;break a}}else if(l.elementType===k||"object"===typeof k&&null!==k&&k.$$typeof===Ha&&Ng(k)===l.type){c(a,l.sibling);d=e(l,f.props);d.ref=Lg(a,l,f);d.return=a;a=d;break a}c(a,l);break}else b(a,l);l=l.sibling}f.type===ya?(d=Tg(f.props.children,a.mode,h,f.key),d.return=a,a=d):(h=Rg(f.type,f.key,f.props,null,a.mode,h),h.ref=Lg(a,d,f),h.return=a,a=h)}return g(a);case wa:a:{for(l=f.key;null!==
d;){if(d.key===l)if(4===d.tag&&d.stateNode.containerInfo===f.containerInfo&&d.stateNode.implementation===f.implementation){c(a,d.sibling);d=e(d,f.children||[]);d.return=a;a=d;break a}else{c(a,d);break}else b(a,d);d=d.sibling}d=Sg(f,a.mode,h);d.return=a;a=d}return g(a);case Ha:return l=f._init,J(a,d,l(f._payload),h)}if(eb(f))return n(a,d,f,h);if(Ka(f))return t(a,d,f,h);Mg(a,f)}return"string"===typeof f&&""!==f||"number"===typeof f?(f=""+f,null!==d&&6===d.tag?(c(a,d.sibling),d=e(d,f),d.return=a,a=d):
(c(a,d),d=Qg(f,a.mode,h),d.return=a,a=d),g(a)):c(a,d)}return J}var Ug=Og(!0),Vg=Og(!1),Wg=Uf(null),Xg=null,Yg=null,Zg=null;function $g(){Zg=Yg=Xg=null}function ah(a){var b=Wg.current;E(Wg);a._currentValue=b}function bh(a,b,c){for(;null!==a;){var d=a.alternate;(a.childLanes&b)!==b?(a.childLanes|=b,null!==d&&(d.childLanes|=b)):null!==d&&(d.childLanes&b)!==b&&(d.childLanes|=b);if(a===c)break;a=a.return}}
function ch(a,b){Xg=a;Zg=Yg=null;a=a.dependencies;null!==a&&null!==a.firstContext&&(0!==(a.lanes&b)&&(dh=!0),a.firstContext=null)}function eh(a){var b=a._currentValue;if(Zg!==a)if(a={context:a,memoizedValue:b,next:null},null===Yg){if(null===Xg)throw Error(p(308));Yg=a;Xg.dependencies={lanes:0,firstContext:a}}else Yg=Yg.next=a;return b}var fh=null;function gh(a){null===fh?fh=[a]:fh.push(a)}
function hh(a,b,c,d){var e=b.interleaved;null===e?(c.next=c,gh(b)):(c.next=e.next,e.next=c);b.interleaved=c;return ih(a,d)}function ih(a,b){a.lanes|=b;var c=a.alternate;null!==c&&(c.lanes|=b);c=a;for(a=a.return;null!==a;)a.childLanes|=b,c=a.alternate,null!==c&&(c.childLanes|=b),c=a,a=a.return;return 3===c.tag?c.stateNode:null}var jh=!1;function kh(a){a.updateQueue={baseState:a.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}
function lh(a,b){a=a.updateQueue;b.updateQueue===a&&(b.updateQueue={baseState:a.baseState,firstBaseUpdate:a.firstBaseUpdate,lastBaseUpdate:a.lastBaseUpdate,shared:a.shared,effects:a.effects})}function mh(a,b){return{eventTime:a,lane:b,tag:0,payload:null,callback:null,next:null}}
function nh(a,b,c){var d=a.updateQueue;if(null===d)return null;d=d.shared;if(0!==(K&2)){var e=d.pending;null===e?b.next=b:(b.next=e.next,e.next=b);d.pending=b;return ih(a,c)}e=d.interleaved;null===e?(b.next=b,gh(d)):(b.next=e.next,e.next=b);d.interleaved=b;return ih(a,c)}function oh(a,b,c){b=b.updateQueue;if(null!==b&&(b=b.shared,0!==(c&4194240))){var d=b.lanes;d&=a.pendingLanes;c|=d;b.lanes=c;Cc(a,c)}}
function ph(a,b){var c=a.updateQueue,d=a.alternate;if(null!==d&&(d=d.updateQueue,c===d)){var e=null,f=null;c=c.firstBaseUpdate;if(null!==c){do{var g={eventTime:c.eventTime,lane:c.lane,tag:c.tag,payload:c.payload,callback:c.callback,next:null};null===f?e=f=g:f=f.next=g;c=c.next}while(null!==c);null===f?e=f=b:f=f.next=b}else e=f=b;c={baseState:d.baseState,firstBaseUpdate:e,lastBaseUpdate:f,shared:d.shared,effects:d.effects};a.updateQueue=c;return}a=c.lastBaseUpdate;null===a?c.firstBaseUpdate=b:a.next=
b;c.lastBaseUpdate=b}
function qh(a,b,c,d){var e=a.updateQueue;jh=!1;var f=e.firstBaseUpdate,g=e.lastBaseUpdate,h=e.shared.pending;if(null!==h){e.shared.pending=null;var k=h,l=k.next;k.next=null;null===g?f=l:g.next=l;g=k;var m=a.alternate;null!==m&&(m=m.updateQueue,h=m.lastBaseUpdate,h!==g&&(null===h?m.firstBaseUpdate=l:h.next=l,m.lastBaseUpdate=k))}if(null!==f){var q=e.baseState;g=0;m=l=k=null;h=f;do{var r=h.lane,y=h.eventTime;if((d&r)===r){null!==m&&(m=m.next={eventTime:y,lane:0,tag:h.tag,payload:h.payload,callback:h.callback,
next:null});a:{var n=a,t=h;r=b;y=c;switch(t.tag){case 1:n=t.payload;if("function"===typeof n){q=n.call(y,q,r);break a}q=n;break a;case 3:n.flags=n.flags&-65537|128;case 0:n=t.payload;r="function"===typeof n?n.call(y,q,r):n;if(null===r||void 0===r)break a;q=A({},q,r);break a;case 2:jh=!0}}null!==h.callback&&0!==h.lane&&(a.flags|=64,r=e.effects,null===r?e.effects=[h]:r.push(h))}else y={eventTime:y,lane:r,tag:h.tag,payload:h.payload,callback:h.callback,next:null},null===m?(l=m=y,k=q):m=m.next=y,g|=r;
h=h.next;if(null===h)if(h=e.shared.pending,null===h)break;else r=h,h=r.next,r.next=null,e.lastBaseUpdate=r,e.shared.pending=null}while(1);null===m&&(k=q);e.baseState=k;e.firstBaseUpdate=l;e.lastBaseUpdate=m;b=e.shared.interleaved;if(null!==b){e=b;do g|=e.lane,e=e.next;while(e!==b)}else null===f&&(e.shared.lanes=0);rh|=g;a.lanes=g;a.memoizedState=q}}
function sh(a,b,c){a=b.effects;b.effects=null;if(null!==a)for(b=0;b<a.length;b++){var d=a[b],e=d.callback;if(null!==e){d.callback=null;d=c;if("function"!==typeof e)throw Error(p(191,e));e.call(d)}}}var th={},uh=Uf(th),vh=Uf(th),wh=Uf(th);function xh(a){if(a===th)throw Error(p(174));return a}
function yh(a,b){G(wh,b);G(vh,a);G(uh,th);a=b.nodeType;switch(a){case 9:case 11:b=(b=b.documentElement)?b.namespaceURI:lb(null,"");break;default:a=8===a?b.parentNode:b,b=a.namespaceURI||null,a=a.tagName,b=lb(b,a)}E(uh);G(uh,b)}function zh(){E(uh);E(vh);E(wh)}function Ah(a){xh(wh.current);var b=xh(uh.current);var c=lb(b,a.type);b!==c&&(G(vh,a),G(uh,c))}function Bh(a){vh.current===a&&(E(uh),E(vh))}var L=Uf(0);
function Ch(a){for(var b=a;null!==b;){if(13===b.tag){var c=b.memoizedState;if(null!==c&&(c=c.dehydrated,null===c||"$?"===c.data||"$!"===c.data))return b}else if(19===b.tag&&void 0!==b.memoizedProps.revealOrder){if(0!==(b.flags&128))return b}else if(null!==b.child){b.child.return=b;b=b.child;continue}if(b===a)break;for(;null===b.sibling;){if(null===b.return||b.return===a)return null;b=b.return}b.sibling.return=b.return;b=b.sibling}return null}var Dh=[];
function Eh(){for(var a=0;a<Dh.length;a++)Dh[a]._workInProgressVersionPrimary=null;Dh.length=0}var Fh=ua.ReactCurrentDispatcher,Gh=ua.ReactCurrentBatchConfig,Hh=0,M=null,N=null,O=null,Ih=!1,Jh=!1,Kh=0,Lh=0;function P(){throw Error(p(321));}function Mh(a,b){if(null===b)return!1;for(var c=0;c<b.length&&c<a.length;c++)if(!He(a[c],b[c]))return!1;return!0}
function Nh(a,b,c,d,e,f){Hh=f;M=b;b.memoizedState=null;b.updateQueue=null;b.lanes=0;Fh.current=null===a||null===a.memoizedState?Oh:Ph;a=c(d,e);if(Jh){f=0;do{Jh=!1;Kh=0;if(25<=f)throw Error(p(301));f+=1;O=N=null;b.updateQueue=null;Fh.current=Qh;a=c(d,e)}while(Jh)}Fh.current=Rh;b=null!==N&&null!==N.next;Hh=0;O=N=M=null;Ih=!1;if(b)throw Error(p(300));return a}function Sh(){var a=0!==Kh;Kh=0;return a}
function Th(){var a={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};null===O?M.memoizedState=O=a:O=O.next=a;return O}function Uh(){if(null===N){var a=M.alternate;a=null!==a?a.memoizedState:null}else a=N.next;var b=null===O?M.memoizedState:O.next;if(null!==b)O=b,N=a;else{if(null===a)throw Error(p(310));N=a;a={memoizedState:N.memoizedState,baseState:N.baseState,baseQueue:N.baseQueue,queue:N.queue,next:null};null===O?M.memoizedState=O=a:O=O.next=a}return O}
function Vh(a,b){return"function"===typeof b?b(a):b}
function Wh(a){var b=Uh(),c=b.queue;if(null===c)throw Error(p(311));c.lastRenderedReducer=a;var d=N,e=d.baseQueue,f=c.pending;if(null!==f){if(null!==e){var g=e.next;e.next=f.next;f.next=g}d.baseQueue=e=f;c.pending=null}if(null!==e){f=e.next;d=d.baseState;var h=g=null,k=null,l=f;do{var m=l.lane;if((Hh&m)===m)null!==k&&(k=k.next={lane:0,action:l.action,hasEagerState:l.hasEagerState,eagerState:l.eagerState,next:null}),d=l.hasEagerState?l.eagerState:a(d,l.action);else{var q={lane:m,action:l.action,hasEagerState:l.hasEagerState,
eagerState:l.eagerState,next:null};null===k?(h=k=q,g=d):k=k.next=q;M.lanes|=m;rh|=m}l=l.next}while(null!==l&&l!==f);null===k?g=d:k.next=h;He(d,b.memoizedState)||(dh=!0);b.memoizedState=d;b.baseState=g;b.baseQueue=k;c.lastRenderedState=d}a=c.interleaved;if(null!==a){e=a;do f=e.lane,M.lanes|=f,rh|=f,e=e.next;while(e!==a)}else null===e&&(c.lanes=0);return[b.memoizedState,c.dispatch]}
function Xh(a){var b=Uh(),c=b.queue;if(null===c)throw Error(p(311));c.lastRenderedReducer=a;var d=c.dispatch,e=c.pending,f=b.memoizedState;if(null!==e){c.pending=null;var g=e=e.next;do f=a(f,g.action),g=g.next;while(g!==e);He(f,b.memoizedState)||(dh=!0);b.memoizedState=f;null===b.baseQueue&&(b.baseState=f);c.lastRenderedState=f}return[f,d]}function Yh(){}
function Zh(a,b){var c=M,d=Uh(),e=b(),f=!He(d.memoizedState,e);f&&(d.memoizedState=e,dh=!0);d=d.queue;$h(ai.bind(null,c,d,a),[a]);if(d.getSnapshot!==b||f||null!==O&&O.memoizedState.tag&1){c.flags|=2048;bi(9,ci.bind(null,c,d,e,b),void 0,null);if(null===Q)throw Error(p(349));0!==(Hh&30)||di(c,b,e)}return e}function di(a,b,c){a.flags|=16384;a={getSnapshot:b,value:c};b=M.updateQueue;null===b?(b={lastEffect:null,stores:null},M.updateQueue=b,b.stores=[a]):(c=b.stores,null===c?b.stores=[a]:c.push(a))}
function ci(a,b,c,d){b.value=c;b.getSnapshot=d;ei(b)&&fi(a)}function ai(a,b,c){return c(function(){ei(b)&&fi(a)})}function ei(a){var b=a.getSnapshot;a=a.value;try{var c=b();return!He(a,c)}catch(d){return!0}}function fi(a){var b=ih(a,1);null!==b&&gi(b,a,1,-1)}
function hi(a){var b=Th();"function"===typeof a&&(a=a());b.memoizedState=b.baseState=a;a={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Vh,lastRenderedState:a};b.queue=a;a=a.dispatch=ii.bind(null,M,a);return[b.memoizedState,a]}
function bi(a,b,c,d){a={tag:a,create:b,destroy:c,deps:d,next:null};b=M.updateQueue;null===b?(b={lastEffect:null,stores:null},M.updateQueue=b,b.lastEffect=a.next=a):(c=b.lastEffect,null===c?b.lastEffect=a.next=a:(d=c.next,c.next=a,a.next=d,b.lastEffect=a));return a}function ji(){return Uh().memoizedState}function ki(a,b,c,d){var e=Th();M.flags|=a;e.memoizedState=bi(1|b,c,void 0,void 0===d?null:d)}
function li(a,b,c,d){var e=Uh();d=void 0===d?null:d;var f=void 0;if(null!==N){var g=N.memoizedState;f=g.destroy;if(null!==d&&Mh(d,g.deps)){e.memoizedState=bi(b,c,f,d);return}}M.flags|=a;e.memoizedState=bi(1|b,c,f,d)}function mi(a,b){return ki(8390656,8,a,b)}function $h(a,b){return li(2048,8,a,b)}function ni(a,b){return li(4,2,a,b)}function oi(a,b){return li(4,4,a,b)}
function pi(a,b){if("function"===typeof b)return a=a(),b(a),function(){b(null)};if(null!==b&&void 0!==b)return a=a(),b.current=a,function(){b.current=null}}function qi(a,b,c){c=null!==c&&void 0!==c?c.concat([a]):null;return li(4,4,pi.bind(null,b,a),c)}function ri(){}function si(a,b){var c=Uh();b=void 0===b?null:b;var d=c.memoizedState;if(null!==d&&null!==b&&Mh(b,d[1]))return d[0];c.memoizedState=[a,b];return a}
function ti(a,b){var c=Uh();b=void 0===b?null:b;var d=c.memoizedState;if(null!==d&&null!==b&&Mh(b,d[1]))return d[0];a=a();c.memoizedState=[a,b];return a}function ui(a,b,c){if(0===(Hh&21))return a.baseState&&(a.baseState=!1,dh=!0),a.memoizedState=c;He(c,b)||(c=yc(),M.lanes|=c,rh|=c,a.baseState=!0);return b}function vi(a,b){var c=C;C=0!==c&&4>c?c:4;a(!0);var d=Gh.transition;Gh.transition={};try{a(!1),b()}finally{C=c,Gh.transition=d}}function wi(){return Uh().memoizedState}
function xi(a,b,c){var d=yi(a);c={lane:d,action:c,hasEagerState:!1,eagerState:null,next:null};if(zi(a))Ai(b,c);else if(c=hh(a,b,c,d),null!==c){var e=R();gi(c,a,d,e);Bi(c,b,d)}}
function ii(a,b,c){var d=yi(a),e={lane:d,action:c,hasEagerState:!1,eagerState:null,next:null};if(zi(a))Ai(b,e);else{var f=a.alternate;if(0===a.lanes&&(null===f||0===f.lanes)&&(f=b.lastRenderedReducer,null!==f))try{var g=b.lastRenderedState,h=f(g,c);e.hasEagerState=!0;e.eagerState=h;if(He(h,g)){var k=b.interleaved;null===k?(e.next=e,gh(b)):(e.next=k.next,k.next=e);b.interleaved=e;return}}catch(l){}finally{}c=hh(a,b,e,d);null!==c&&(e=R(),gi(c,a,d,e),Bi(c,b,d))}}
function zi(a){var b=a.alternate;return a===M||null!==b&&b===M}function Ai(a,b){Jh=Ih=!0;var c=a.pending;null===c?b.next=b:(b.next=c.next,c.next=b);a.pending=b}function Bi(a,b,c){if(0!==(c&4194240)){var d=b.lanes;d&=a.pendingLanes;c|=d;b.lanes=c;Cc(a,c)}}
var Rh={readContext:eh,useCallback:P,useContext:P,useEffect:P,useImperativeHandle:P,useInsertionEffect:P,useLayoutEffect:P,useMemo:P,useReducer:P,useRef:P,useState:P,useDebugValue:P,useDeferredValue:P,useTransition:P,useMutableSource:P,useSyncExternalStore:P,useId:P,unstable_isNewReconciler:!1},Oh={readContext:eh,useCallback:function(a,b){Th().memoizedState=[a,void 0===b?null:b];return a},useContext:eh,useEffect:mi,useImperativeHandle:function(a,b,c){c=null!==c&&void 0!==c?c.concat([a]):null;return ki(4194308,
4,pi.bind(null,b,a),c)},useLayoutEffect:function(a,b){return ki(4194308,4,a,b)},useInsertionEffect:function(a,b){return ki(4,2,a,b)},useMemo:function(a,b){var c=Th();b=void 0===b?null:b;a=a();c.memoizedState=[a,b];return a},useReducer:function(a,b,c){var d=Th();b=void 0!==c?c(b):b;d.memoizedState=d.baseState=b;a={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:a,lastRenderedState:b};d.queue=a;a=a.dispatch=xi.bind(null,M,a);return[d.memoizedState,a]},useRef:function(a){var b=
Th();a={current:a};return b.memoizedState=a},useState:hi,useDebugValue:ri,useDeferredValue:function(a){return Th().memoizedState=a},useTransition:function(){var a=hi(!1),b=a[0];a=vi.bind(null,a[1]);Th().memoizedState=a;return[b,a]},useMutableSource:function(){},useSyncExternalStore:function(a,b,c){var d=M,e=Th();if(I){if(void 0===c)throw Error(p(407));c=c()}else{c=b();if(null===Q)throw Error(p(349));0!==(Hh&30)||di(d,b,c)}e.memoizedState=c;var f={value:c,getSnapshot:b};e.queue=f;mi(ai.bind(null,d,
f,a),[a]);d.flags|=2048;bi(9,ci.bind(null,d,f,c,b),void 0,null);return c},useId:function(){var a=Th(),b=Q.identifierPrefix;if(I){var c=sg;var d=rg;c=(d&~(1<<32-oc(d)-1)).toString(32)+c;b=":"+b+"R"+c;c=Kh++;0<c&&(b+="H"+c.toString(32));b+=":"}else c=Lh++,b=":"+b+"r"+c.toString(32)+":";return a.memoizedState=b},unstable_isNewReconciler:!1},Ph={readContext:eh,useCallback:si,useContext:eh,useEffect:$h,useImperativeHandle:qi,useInsertionEffect:ni,useLayoutEffect:oi,useMemo:ti,useReducer:Wh,useRef:ji,useState:function(){return Wh(Vh)},
useDebugValue:ri,useDeferredValue:function(a){var b=Uh();return ui(b,N.memoizedState,a)},useTransition:function(){var a=Wh(Vh)[0],b=Uh().memoizedState;return[a,b]},useMutableSource:Yh,useSyncExternalStore:Zh,useId:wi,unstable_isNewReconciler:!1},Qh={readContext:eh,useCallback:si,useContext:eh,useEffect:$h,useImperativeHandle:qi,useInsertionEffect:ni,useLayoutEffect:oi,useMemo:ti,useReducer:Xh,useRef:ji,useState:function(){return Xh(Vh)},useDebugValue:ri,useDeferredValue:function(a){var b=Uh();return null===
N?b.memoizedState=a:ui(b,N.memoizedState,a)},useTransition:function(){var a=Xh(Vh)[0],b=Uh().memoizedState;return[a,b]},useMutableSource:Yh,useSyncExternalStore:Zh,useId:wi,unstable_isNewReconciler:!1};function Ci(a,b){if(a&&a.defaultProps){b=A({},b);a=a.defaultProps;for(var c in a)void 0===b[c]&&(b[c]=a[c]);return b}return b}function Di(a,b,c,d){b=a.memoizedState;c=c(d,b);c=null===c||void 0===c?b:A({},b,c);a.memoizedState=c;0===a.lanes&&(a.updateQueue.baseState=c)}
var Ei={isMounted:function(a){return(a=a._reactInternals)?Vb(a)===a:!1},enqueueSetState:function(a,b,c){a=a._reactInternals;var d=R(),e=yi(a),f=mh(d,e);f.payload=b;void 0!==c&&null!==c&&(f.callback=c);b=nh(a,f,e);null!==b&&(gi(b,a,e,d),oh(b,a,e))},enqueueReplaceState:function(a,b,c){a=a._reactInternals;var d=R(),e=yi(a),f=mh(d,e);f.tag=1;f.payload=b;void 0!==c&&null!==c&&(f.callback=c);b=nh(a,f,e);null!==b&&(gi(b,a,e,d),oh(b,a,e))},enqueueForceUpdate:function(a,b){a=a._reactInternals;var c=R(),d=
yi(a),e=mh(c,d);e.tag=2;void 0!==b&&null!==b&&(e.callback=b);b=nh(a,e,d);null!==b&&(gi(b,a,d,c),oh(b,a,d))}};function Fi(a,b,c,d,e,f,g){a=a.stateNode;return"function"===typeof a.shouldComponentUpdate?a.shouldComponentUpdate(d,f,g):b.prototype&&b.prototype.isPureReactComponent?!Ie(c,d)||!Ie(e,f):!0}
function Gi(a,b,c){var d=!1,e=Vf;var f=b.contextType;"object"===typeof f&&null!==f?f=eh(f):(e=Zf(b)?Xf:H.current,d=b.contextTypes,f=(d=null!==d&&void 0!==d)?Yf(a,e):Vf);b=new b(c,f);a.memoizedState=null!==b.state&&void 0!==b.state?b.state:null;b.updater=Ei;a.stateNode=b;b._reactInternals=a;d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=e,a.__reactInternalMemoizedMaskedChildContext=f);return b}
function Hi(a,b,c,d){a=b.state;"function"===typeof b.componentWillReceiveProps&&b.componentWillReceiveProps(c,d);"function"===typeof b.UNSAFE_componentWillReceiveProps&&b.UNSAFE_componentWillReceiveProps(c,d);b.state!==a&&Ei.enqueueReplaceState(b,b.state,null)}
function Ii(a,b,c,d){var e=a.stateNode;e.props=c;e.state=a.memoizedState;e.refs={};kh(a);var f=b.contextType;"object"===typeof f&&null!==f?e.context=eh(f):(f=Zf(b)?Xf:H.current,e.context=Yf(a,f));e.state=a.memoizedState;f=b.getDerivedStateFromProps;"function"===typeof f&&(Di(a,b,f,c),e.state=a.memoizedState);"function"===typeof b.getDerivedStateFromProps||"function"===typeof e.getSnapshotBeforeUpdate||"function"!==typeof e.UNSAFE_componentWillMount&&"function"!==typeof e.componentWillMount||(b=e.state,
"function"===typeof e.componentWillMount&&e.componentWillMount(),"function"===typeof e.UNSAFE_componentWillMount&&e.UNSAFE_componentWillMount(),b!==e.state&&Ei.enqueueReplaceState(e,e.state,null),qh(a,c,e,d),e.state=a.memoizedState);"function"===typeof e.componentDidMount&&(a.flags|=4194308)}function Ji(a,b){try{var c="",d=b;do c+=Pa(d),d=d.return;while(d);var e=c}catch(f){e="\nError generating stack: "+f.message+"\n"+f.stack}return{value:a,source:b,stack:e,digest:null}}
function Ki(a,b,c){return{value:a,source:null,stack:null!=c?c:null,digest:null!=b?b:null}}function Li(a,b){try{console.error(b.value)}catch(c){setTimeout(function(){throw c;})}}var Mi="function"===typeof WeakMap?WeakMap:Map;function Ni(a,b,c){c=mh(-1,c);c.tag=3;c.payload={element:null};var d=b.value;c.callback=function(){Oi||(Oi=!0,Pi=d);Li(a,b)};return c}
function Qi(a,b,c){c=mh(-1,c);c.tag=3;var d=a.type.getDerivedStateFromError;if("function"===typeof d){var e=b.value;c.payload=function(){return d(e)};c.callback=function(){Li(a,b)}}var f=a.stateNode;null!==f&&"function"===typeof f.componentDidCatch&&(c.callback=function(){Li(a,b);"function"!==typeof d&&(null===Ri?Ri=new Set([this]):Ri.add(this));var c=b.stack;this.componentDidCatch(b.value,{componentStack:null!==c?c:""})});return c}
function Si(a,b,c){var d=a.pingCache;if(null===d){d=a.pingCache=new Mi;var e=new Set;d.set(b,e)}else e=d.get(b),void 0===e&&(e=new Set,d.set(b,e));e.has(c)||(e.add(c),a=Ti.bind(null,a,b,c),b.then(a,a))}function Ui(a){do{var b;if(b=13===a.tag)b=a.memoizedState,b=null!==b?null!==b.dehydrated?!0:!1:!0;if(b)return a;a=a.return}while(null!==a);return null}
function Vi(a,b,c,d,e){if(0===(a.mode&1))return a===b?a.flags|=65536:(a.flags|=128,c.flags|=131072,c.flags&=-52805,1===c.tag&&(null===c.alternate?c.tag=17:(b=mh(-1,1),b.tag=2,nh(c,b,1))),c.lanes|=1),a;a.flags|=65536;a.lanes=e;return a}var Wi=ua.ReactCurrentOwner,dh=!1;function Xi(a,b,c,d){b.child=null===a?Vg(b,null,c,d):Ug(b,a.child,c,d)}
function Yi(a,b,c,d,e){c=c.render;var f=b.ref;ch(b,e);d=Nh(a,b,c,d,f,e);c=Sh();if(null!==a&&!dh)return b.updateQueue=a.updateQueue,b.flags&=-2053,a.lanes&=~e,Zi(a,b,e);I&&c&&vg(b);b.flags|=1;Xi(a,b,d,e);return b.child}
function $i(a,b,c,d,e){if(null===a){var f=c.type;if("function"===typeof f&&!aj(f)&&void 0===f.defaultProps&&null===c.compare&&void 0===c.defaultProps)return b.tag=15,b.type=f,bj(a,b,f,d,e);a=Rg(c.type,null,d,b,b.mode,e);a.ref=b.ref;a.return=b;return b.child=a}f=a.child;if(0===(a.lanes&e)){var g=f.memoizedProps;c=c.compare;c=null!==c?c:Ie;if(c(g,d)&&a.ref===b.ref)return Zi(a,b,e)}b.flags|=1;a=Pg(f,d);a.ref=b.ref;a.return=b;return b.child=a}
function bj(a,b,c,d,e){if(null!==a){var f=a.memoizedProps;if(Ie(f,d)&&a.ref===b.ref)if(dh=!1,b.pendingProps=d=f,0!==(a.lanes&e))0!==(a.flags&131072)&&(dh=!0);else return b.lanes=a.lanes,Zi(a,b,e)}return cj(a,b,c,d,e)}
function dj(a,b,c){var d=b.pendingProps,e=d.children,f=null!==a?a.memoizedState:null;if("hidden"===d.mode)if(0===(b.mode&1))b.memoizedState={baseLanes:0,cachePool:null,transitions:null},G(ej,fj),fj|=c;else{if(0===(c&1073741824))return a=null!==f?f.baseLanes|c:c,b.lanes=b.childLanes=1073741824,b.memoizedState={baseLanes:a,cachePool:null,transitions:null},b.updateQueue=null,G(ej,fj),fj|=a,null;b.memoizedState={baseLanes:0,cachePool:null,transitions:null};d=null!==f?f.baseLanes:c;G(ej,fj);fj|=d}else null!==
f?(d=f.baseLanes|c,b.memoizedState=null):d=c,G(ej,fj),fj|=d;Xi(a,b,e,c);return b.child}function gj(a,b){var c=b.ref;if(null===a&&null!==c||null!==a&&a.ref!==c)b.flags|=512,b.flags|=2097152}function cj(a,b,c,d,e){var f=Zf(c)?Xf:H.current;f=Yf(b,f);ch(b,e);c=Nh(a,b,c,d,f,e);d=Sh();if(null!==a&&!dh)return b.updateQueue=a.updateQueue,b.flags&=-2053,a.lanes&=~e,Zi(a,b,e);I&&d&&vg(b);b.flags|=1;Xi(a,b,c,e);return b.child}
function hj(a,b,c,d,e){if(Zf(c)){var f=!0;cg(b)}else f=!1;ch(b,e);if(null===b.stateNode)ij(a,b),Gi(b,c,d),Ii(b,c,d,e),d=!0;else if(null===a){var g=b.stateNode,h=b.memoizedProps;g.props=h;var k=g.context,l=c.contextType;"object"===typeof l&&null!==l?l=eh(l):(l=Zf(c)?Xf:H.current,l=Yf(b,l));var m=c.getDerivedStateFromProps,q="function"===typeof m||"function"===typeof g.getSnapshotBeforeUpdate;q||"function"!==typeof g.UNSAFE_componentWillReceiveProps&&"function"!==typeof g.componentWillReceiveProps||
(h!==d||k!==l)&&Hi(b,g,d,l);jh=!1;var r=b.memoizedState;g.state=r;qh(b,d,g,e);k=b.memoizedState;h!==d||r!==k||Wf.current||jh?("function"===typeof m&&(Di(b,c,m,d),k=b.memoizedState),(h=jh||Fi(b,c,h,d,r,k,l))?(q||"function"!==typeof g.UNSAFE_componentWillMount&&"function"!==typeof g.componentWillMount||("function"===typeof g.componentWillMount&&g.componentWillMount(),"function"===typeof g.UNSAFE_componentWillMount&&g.UNSAFE_componentWillMount()),"function"===typeof g.componentDidMount&&(b.flags|=4194308)):
("function"===typeof g.componentDidMount&&(b.flags|=4194308),b.memoizedProps=d,b.memoizedState=k),g.props=d,g.state=k,g.context=l,d=h):("function"===typeof g.componentDidMount&&(b.flags|=4194308),d=!1)}else{g=b.stateNode;lh(a,b);h=b.memoizedProps;l=b.type===b.elementType?h:Ci(b.type,h);g.props=l;q=b.pendingProps;r=g.context;k=c.contextType;"object"===typeof k&&null!==k?k=eh(k):(k=Zf(c)?Xf:H.current,k=Yf(b,k));var y=c.getDerivedStateFromProps;(m="function"===typeof y||"function"===typeof g.getSnapshotBeforeUpdate)||
"function"!==typeof g.UNSAFE_componentWillReceiveProps&&"function"!==typeof g.componentWillReceiveProps||(h!==q||r!==k)&&Hi(b,g,d,k);jh=!1;r=b.memoizedState;g.state=r;qh(b,d,g,e);var n=b.memoizedState;h!==q||r!==n||Wf.current||jh?("function"===typeof y&&(Di(b,c,y,d),n=b.memoizedState),(l=jh||Fi(b,c,l,d,r,n,k)||!1)?(m||"function"!==typeof g.UNSAFE_componentWillUpdate&&"function"!==typeof g.componentWillUpdate||("function"===typeof g.componentWillUpdate&&g.componentWillUpdate(d,n,k),"function"===typeof g.UNSAFE_componentWillUpdate&&
g.UNSAFE_componentWillUpdate(d,n,k)),"function"===typeof g.componentDidUpdate&&(b.flags|=4),"function"===typeof g.getSnapshotBeforeUpdate&&(b.flags|=1024)):("function"!==typeof g.componentDidUpdate||h===a.memoizedProps&&r===a.memoizedState||(b.flags|=4),"function"!==typeof g.getSnapshotBeforeUpdate||h===a.memoizedProps&&r===a.memoizedState||(b.flags|=1024),b.memoizedProps=d,b.memoizedState=n),g.props=d,g.state=n,g.context=k,d=l):("function"!==typeof g.componentDidUpdate||h===a.memoizedProps&&r===
a.memoizedState||(b.flags|=4),"function"!==typeof g.getSnapshotBeforeUpdate||h===a.memoizedProps&&r===a.memoizedState||(b.flags|=1024),d=!1)}return jj(a,b,c,d,f,e)}
function jj(a,b,c,d,e,f){gj(a,b);var g=0!==(b.flags&128);if(!d&&!g)return e&&dg(b,c,!1),Zi(a,b,f);d=b.stateNode;Wi.current=b;var h=g&&"function"!==typeof c.getDerivedStateFromError?null:d.render();b.flags|=1;null!==a&&g?(b.child=Ug(b,a.child,null,f),b.child=Ug(b,null,h,f)):Xi(a,b,h,f);b.memoizedState=d.state;e&&dg(b,c,!0);return b.child}function kj(a){var b=a.stateNode;b.pendingContext?ag(a,b.pendingContext,b.pendingContext!==b.context):b.context&&ag(a,b.context,!1);yh(a,b.containerInfo)}
function lj(a,b,c,d,e){Ig();Jg(e);b.flags|=256;Xi(a,b,c,d);return b.child}var mj={dehydrated:null,treeContext:null,retryLane:0};function nj(a){return{baseLanes:a,cachePool:null,transitions:null}}
function oj(a,b,c){var d=b.pendingProps,e=L.current,f=!1,g=0!==(b.flags&128),h;(h=g)||(h=null!==a&&null===a.memoizedState?!1:0!==(e&2));if(h)f=!0,b.flags&=-129;else if(null===a||null!==a.memoizedState)e|=1;G(L,e&1);if(null===a){Eg(b);a=b.memoizedState;if(null!==a&&(a=a.dehydrated,null!==a))return 0===(b.mode&1)?b.lanes=1:"$!"===a.data?b.lanes=8:b.lanes=1073741824,null;g=d.children;a=d.fallback;return f?(d=b.mode,f=b.child,g={mode:"hidden",children:g},0===(d&1)&&null!==f?(f.childLanes=0,f.pendingProps=
g):f=pj(g,d,0,null),a=Tg(a,d,c,null),f.return=b,a.return=b,f.sibling=a,b.child=f,b.child.memoizedState=nj(c),b.memoizedState=mj,a):qj(b,g)}e=a.memoizedState;if(null!==e&&(h=e.dehydrated,null!==h))return rj(a,b,g,d,h,e,c);if(f){f=d.fallback;g=b.mode;e=a.child;h=e.sibling;var k={mode:"hidden",children:d.children};0===(g&1)&&b.child!==e?(d=b.child,d.childLanes=0,d.pendingProps=k,b.deletions=null):(d=Pg(e,k),d.subtreeFlags=e.subtreeFlags&14680064);null!==h?f=Pg(h,f):(f=Tg(f,g,c,null),f.flags|=2);f.return=
b;d.return=b;d.sibling=f;b.child=d;d=f;f=b.child;g=a.child.memoizedState;g=null===g?nj(c):{baseLanes:g.baseLanes|c,cachePool:null,transitions:g.transitions};f.memoizedState=g;f.childLanes=a.childLanes&~c;b.memoizedState=mj;return d}f=a.child;a=f.sibling;d=Pg(f,{mode:"visible",children:d.children});0===(b.mode&1)&&(d.lanes=c);d.return=b;d.sibling=null;null!==a&&(c=b.deletions,null===c?(b.deletions=[a],b.flags|=16):c.push(a));b.child=d;b.memoizedState=null;return d}
function qj(a,b){b=pj({mode:"visible",children:b},a.mode,0,null);b.return=a;return a.child=b}function sj(a,b,c,d){null!==d&&Jg(d);Ug(b,a.child,null,c);a=qj(b,b.pendingProps.children);a.flags|=2;b.memoizedState=null;return a}
function rj(a,b,c,d,e,f,g){if(c){if(b.flags&256)return b.flags&=-257,d=Ki(Error(p(422))),sj(a,b,g,d);if(null!==b.memoizedState)return b.child=a.child,b.flags|=128,null;f=d.fallback;e=b.mode;d=pj({mode:"visible",children:d.children},e,0,null);f=Tg(f,e,g,null);f.flags|=2;d.return=b;f.return=b;d.sibling=f;b.child=d;0!==(b.mode&1)&&Ug(b,a.child,null,g);b.child.memoizedState=nj(g);b.memoizedState=mj;return f}if(0===(b.mode&1))return sj(a,b,g,null);if("$!"===e.data){d=e.nextSibling&&e.nextSibling.dataset;
if(d)var h=d.dgst;d=h;f=Error(p(419));d=Ki(f,d,void 0);return sj(a,b,g,d)}h=0!==(g&a.childLanes);if(dh||h){d=Q;if(null!==d){switch(g&-g){case 4:e=2;break;case 16:e=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:e=32;break;case 536870912:e=268435456;break;default:e=0}e=0!==(e&(d.suspendedLanes|g))?0:e;
0!==e&&e!==f.retryLane&&(f.retryLane=e,ih(a,e),gi(d,a,e,-1))}tj();d=Ki(Error(p(421)));return sj(a,b,g,d)}if("$?"===e.data)return b.flags|=128,b.child=a.child,b=uj.bind(null,a),e._reactRetry=b,null;a=f.treeContext;yg=Lf(e.nextSibling);xg=b;I=!0;zg=null;null!==a&&(og[pg++]=rg,og[pg++]=sg,og[pg++]=qg,rg=a.id,sg=a.overflow,qg=b);b=qj(b,d.children);b.flags|=4096;return b}function vj(a,b,c){a.lanes|=b;var d=a.alternate;null!==d&&(d.lanes|=b);bh(a.return,b,c)}
function wj(a,b,c,d,e){var f=a.memoizedState;null===f?a.memoizedState={isBackwards:b,rendering:null,renderingStartTime:0,last:d,tail:c,tailMode:e}:(f.isBackwards=b,f.rendering=null,f.renderingStartTime=0,f.last=d,f.tail=c,f.tailMode=e)}
function xj(a,b,c){var d=b.pendingProps,e=d.revealOrder,f=d.tail;Xi(a,b,d.children,c);d=L.current;if(0!==(d&2))d=d&1|2,b.flags|=128;else{if(null!==a&&0!==(a.flags&128))a:for(a=b.child;null!==a;){if(13===a.tag)null!==a.memoizedState&&vj(a,c,b);else if(19===a.tag)vj(a,c,b);else if(null!==a.child){a.child.return=a;a=a.child;continue}if(a===b)break a;for(;null===a.sibling;){if(null===a.return||a.return===b)break a;a=a.return}a.sibling.return=a.return;a=a.sibling}d&=1}G(L,d);if(0===(b.mode&1))b.memoizedState=
null;else switch(e){case "forwards":c=b.child;for(e=null;null!==c;)a=c.alternate,null!==a&&null===Ch(a)&&(e=c),c=c.sibling;c=e;null===c?(e=b.child,b.child=null):(e=c.sibling,c.sibling=null);wj(b,!1,e,c,f);break;case "backwards":c=null;e=b.child;for(b.child=null;null!==e;){a=e.alternate;if(null!==a&&null===Ch(a)){b.child=e;break}a=e.sibling;e.sibling=c;c=e;e=a}wj(b,!0,c,null,f);break;case "together":wj(b,!1,null,null,void 0);break;default:b.memoizedState=null}return b.child}
function ij(a,b){0===(b.mode&1)&&null!==a&&(a.alternate=null,b.alternate=null,b.flags|=2)}function Zi(a,b,c){null!==a&&(b.dependencies=a.dependencies);rh|=b.lanes;if(0===(c&b.childLanes))return null;if(null!==a&&b.child!==a.child)throw Error(p(153));if(null!==b.child){a=b.child;c=Pg(a,a.pendingProps);b.child=c;for(c.return=b;null!==a.sibling;)a=a.sibling,c=c.sibling=Pg(a,a.pendingProps),c.return=b;c.sibling=null}return b.child}
function yj(a,b,c){switch(b.tag){case 3:kj(b);Ig();break;case 5:Ah(b);break;case 1:Zf(b.type)&&cg(b);break;case 4:yh(b,b.stateNode.containerInfo);break;case 10:var d=b.type._context,e=b.memoizedProps.value;G(Wg,d._currentValue);d._currentValue=e;break;case 13:d=b.memoizedState;if(null!==d){if(null!==d.dehydrated)return G(L,L.current&1),b.flags|=128,null;if(0!==(c&b.child.childLanes))return oj(a,b,c);G(L,L.current&1);a=Zi(a,b,c);return null!==a?a.sibling:null}G(L,L.current&1);break;case 19:d=0!==(c&
b.childLanes);if(0!==(a.flags&128)){if(d)return xj(a,b,c);b.flags|=128}e=b.memoizedState;null!==e&&(e.rendering=null,e.tail=null,e.lastEffect=null);G(L,L.current);if(d)break;else return null;case 22:case 23:return b.lanes=0,dj(a,b,c)}return Zi(a,b,c)}var zj,Aj,Bj,Cj;
zj=function(a,b){for(var c=b.child;null!==c;){if(5===c.tag||6===c.tag)a.appendChild(c.stateNode);else if(4!==c.tag&&null!==c.child){c.child.return=c;c=c.child;continue}if(c===b)break;for(;null===c.sibling;){if(null===c.return||c.return===b)return;c=c.return}c.sibling.return=c.return;c=c.sibling}};Aj=function(){};
Bj=function(a,b,c,d){var e=a.memoizedProps;if(e!==d){a=b.stateNode;xh(uh.current);var f=null;switch(c){case "input":e=Ya(a,e);d=Ya(a,d);f=[];break;case "select":e=A({},e,{value:void 0});d=A({},d,{value:void 0});f=[];break;case "textarea":e=gb(a,e);d=gb(a,d);f=[];break;default:"function"!==typeof e.onClick&&"function"===typeof d.onClick&&(a.onclick=Bf)}ub(c,d);var g;c=null;for(l in e)if(!d.hasOwnProperty(l)&&e.hasOwnProperty(l)&&null!=e[l])if("style"===l){var h=e[l];for(g in h)h.hasOwnProperty(g)&&
(c||(c={}),c[g]="")}else"dangerouslySetInnerHTML"!==l&&"children"!==l&&"suppressContentEditableWarning"!==l&&"suppressHydrationWarning"!==l&&"autoFocus"!==l&&(ea.hasOwnProperty(l)?f||(f=[]):(f=f||[]).push(l,null));for(l in d){var k=d[l];h=null!=e?e[l]:void 0;if(d.hasOwnProperty(l)&&k!==h&&(null!=k||null!=h))if("style"===l)if(h){for(g in h)!h.hasOwnProperty(g)||k&&k.hasOwnProperty(g)||(c||(c={}),c[g]="");for(g in k)k.hasOwnProperty(g)&&h[g]!==k[g]&&(c||(c={}),c[g]=k[g])}else c||(f||(f=[]),f.push(l,
c)),c=k;else"dangerouslySetInnerHTML"===l?(k=k?k.__html:void 0,h=h?h.__html:void 0,null!=k&&h!==k&&(f=f||[]).push(l,k)):"children"===l?"string"!==typeof k&&"number"!==typeof k||(f=f||[]).push(l,""+k):"suppressContentEditableWarning"!==l&&"suppressHydrationWarning"!==l&&(ea.hasOwnProperty(l)?(null!=k&&"onScroll"===l&&D("scroll",a),f||h===k||(f=[])):(f=f||[]).push(l,k))}c&&(f=f||[]).push("style",c);var l=f;if(b.updateQueue=l)b.flags|=4}};Cj=function(a,b,c,d){c!==d&&(b.flags|=4)};
function Dj(a,b){if(!I)switch(a.tailMode){case "hidden":b=a.tail;for(var c=null;null!==b;)null!==b.alternate&&(c=b),b=b.sibling;null===c?a.tail=null:c.sibling=null;break;case "collapsed":c=a.tail;for(var d=null;null!==c;)null!==c.alternate&&(d=c),c=c.sibling;null===d?b||null===a.tail?a.tail=null:a.tail.sibling=null:d.sibling=null}}
function S(a){var b=null!==a.alternate&&a.alternate.child===a.child,c=0,d=0;if(b)for(var e=a.child;null!==e;)c|=e.lanes|e.childLanes,d|=e.subtreeFlags&14680064,d|=e.flags&14680064,e.return=a,e=e.sibling;else for(e=a.child;null!==e;)c|=e.lanes|e.childLanes,d|=e.subtreeFlags,d|=e.flags,e.return=a,e=e.sibling;a.subtreeFlags|=d;a.childLanes=c;return b}
function Ej(a,b,c){var d=b.pendingProps;wg(b);switch(b.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return S(b),null;case 1:return Zf(b.type)&&$f(),S(b),null;case 3:d=b.stateNode;zh();E(Wf);E(H);Eh();d.pendingContext&&(d.context=d.pendingContext,d.pendingContext=null);if(null===a||null===a.child)Gg(b)?b.flags|=4:null===a||a.memoizedState.isDehydrated&&0===(b.flags&256)||(b.flags|=1024,null!==zg&&(Fj(zg),zg=null));Aj(a,b);S(b);return null;case 5:Bh(b);var e=xh(wh.current);
c=b.type;if(null!==a&&null!=b.stateNode)Bj(a,b,c,d,e),a.ref!==b.ref&&(b.flags|=512,b.flags|=2097152);else{if(!d){if(null===b.stateNode)throw Error(p(166));S(b);return null}a=xh(uh.current);if(Gg(b)){d=b.stateNode;c=b.type;var f=b.memoizedProps;d[Of]=b;d[Pf]=f;a=0!==(b.mode&1);switch(c){case "dialog":D("cancel",d);D("close",d);break;case "iframe":case "object":case "embed":D("load",d);break;case "video":case "audio":for(e=0;e<lf.length;e++)D(lf[e],d);break;case "source":D("error",d);break;case "img":case "image":case "link":D("error",
d);D("load",d);break;case "details":D("toggle",d);break;case "input":Za(d,f);D("invalid",d);break;case "select":d._wrapperState={wasMultiple:!!f.multiple};D("invalid",d);break;case "textarea":hb(d,f),D("invalid",d)}ub(c,f);e=null;for(var g in f)if(f.hasOwnProperty(g)){var h=f[g];"children"===g?"string"===typeof h?d.textContent!==h&&(!0!==f.suppressHydrationWarning&&Af(d.textContent,h,a),e=["children",h]):"number"===typeof h&&d.textContent!==""+h&&(!0!==f.suppressHydrationWarning&&Af(d.textContent,
h,a),e=["children",""+h]):ea.hasOwnProperty(g)&&null!=h&&"onScroll"===g&&D("scroll",d)}switch(c){case "input":Va(d);db(d,f,!0);break;case "textarea":Va(d);jb(d);break;case "select":case "option":break;default:"function"===typeof f.onClick&&(d.onclick=Bf)}d=e;b.updateQueue=d;null!==d&&(b.flags|=4)}else{g=9===e.nodeType?e:e.ownerDocument;"http://www.w3.org/1999/xhtml"===a&&(a=kb(c));"http://www.w3.org/1999/xhtml"===a?"script"===c?(a=g.createElement("div"),a.innerHTML="<script>\x3c/script>",a=a.removeChild(a.firstChild)):
"string"===typeof d.is?a=g.createElement(c,{is:d.is}):(a=g.createElement(c),"select"===c&&(g=a,d.multiple?g.multiple=!0:d.size&&(g.size=d.size))):a=g.createElementNS(a,c);a[Of]=b;a[Pf]=d;zj(a,b,!1,!1);b.stateNode=a;a:{g=vb(c,d);switch(c){case "dialog":D("cancel",a);D("close",a);e=d;break;case "iframe":case "object":case "embed":D("load",a);e=d;break;case "video":case "audio":for(e=0;e<lf.length;e++)D(lf[e],a);e=d;break;case "source":D("error",a);e=d;break;case "img":case "image":case "link":D("error",
a);D("load",a);e=d;break;case "details":D("toggle",a);e=d;break;case "input":Za(a,d);e=Ya(a,d);D("invalid",a);break;case "option":e=d;break;case "select":a._wrapperState={wasMultiple:!!d.multiple};e=A({},d,{value:void 0});D("invalid",a);break;case "textarea":hb(a,d);e=gb(a,d);D("invalid",a);break;default:e=d}ub(c,e);h=e;for(f in h)if(h.hasOwnProperty(f)){var k=h[f];"style"===f?sb(a,k):"dangerouslySetInnerHTML"===f?(k=k?k.__html:void 0,null!=k&&nb(a,k)):"children"===f?"string"===typeof k?("textarea"!==
c||""!==k)&&ob(a,k):"number"===typeof k&&ob(a,""+k):"suppressContentEditableWarning"!==f&&"suppressHydrationWarning"!==f&&"autoFocus"!==f&&(ea.hasOwnProperty(f)?null!=k&&"onScroll"===f&&D("scroll",a):null!=k&&ta(a,f,k,g))}switch(c){case "input":Va(a);db(a,d,!1);break;case "textarea":Va(a);jb(a);break;case "option":null!=d.value&&a.setAttribute("value",""+Sa(d.value));break;case "select":a.multiple=!!d.multiple;f=d.value;null!=f?fb(a,!!d.multiple,f,!1):null!=d.defaultValue&&fb(a,!!d.multiple,d.defaultValue,
!0);break;default:"function"===typeof e.onClick&&(a.onclick=Bf)}switch(c){case "button":case "input":case "select":case "textarea":d=!!d.autoFocus;break a;case "img":d=!0;break a;default:d=!1}}d&&(b.flags|=4)}null!==b.ref&&(b.flags|=512,b.flags|=2097152)}S(b);return null;case 6:if(a&&null!=b.stateNode)Cj(a,b,a.memoizedProps,d);else{if("string"!==typeof d&&null===b.stateNode)throw Error(p(166));c=xh(wh.current);xh(uh.current);if(Gg(b)){d=b.stateNode;c=b.memoizedProps;d[Of]=b;if(f=d.nodeValue!==c)if(a=
xg,null!==a)switch(a.tag){case 3:Af(d.nodeValue,c,0!==(a.mode&1));break;case 5:!0!==a.memoizedProps.suppressHydrationWarning&&Af(d.nodeValue,c,0!==(a.mode&1))}f&&(b.flags|=4)}else d=(9===c.nodeType?c:c.ownerDocument).createTextNode(d),d[Of]=b,b.stateNode=d}S(b);return null;case 13:E(L);d=b.memoizedState;if(null===a||null!==a.memoizedState&&null!==a.memoizedState.dehydrated){if(I&&null!==yg&&0!==(b.mode&1)&&0===(b.flags&128))Hg(),Ig(),b.flags|=98560,f=!1;else if(f=Gg(b),null!==d&&null!==d.dehydrated){if(null===
a){if(!f)throw Error(p(318));f=b.memoizedState;f=null!==f?f.dehydrated:null;if(!f)throw Error(p(317));f[Of]=b}else Ig(),0===(b.flags&128)&&(b.memoizedState=null),b.flags|=4;S(b);f=!1}else null!==zg&&(Fj(zg),zg=null),f=!0;if(!f)return b.flags&65536?b:null}if(0!==(b.flags&128))return b.lanes=c,b;d=null!==d;d!==(null!==a&&null!==a.memoizedState)&&d&&(b.child.flags|=8192,0!==(b.mode&1)&&(null===a||0!==(L.current&1)?0===T&&(T=3):tj()));null!==b.updateQueue&&(b.flags|=4);S(b);return null;case 4:return zh(),
Aj(a,b),null===a&&sf(b.stateNode.containerInfo),S(b),null;case 10:return ah(b.type._context),S(b),null;case 17:return Zf(b.type)&&$f(),S(b),null;case 19:E(L);f=b.memoizedState;if(null===f)return S(b),null;d=0!==(b.flags&128);g=f.rendering;if(null===g)if(d)Dj(f,!1);else{if(0!==T||null!==a&&0!==(a.flags&128))for(a=b.child;null!==a;){g=Ch(a);if(null!==g){b.flags|=128;Dj(f,!1);d=g.updateQueue;null!==d&&(b.updateQueue=d,b.flags|=4);b.subtreeFlags=0;d=c;for(c=b.child;null!==c;)f=c,a=d,f.flags&=14680066,
g=f.alternate,null===g?(f.childLanes=0,f.lanes=a,f.child=null,f.subtreeFlags=0,f.memoizedProps=null,f.memoizedState=null,f.updateQueue=null,f.dependencies=null,f.stateNode=null):(f.childLanes=g.childLanes,f.lanes=g.lanes,f.child=g.child,f.subtreeFlags=0,f.deletions=null,f.memoizedProps=g.memoizedProps,f.memoizedState=g.memoizedState,f.updateQueue=g.updateQueue,f.type=g.type,a=g.dependencies,f.dependencies=null===a?null:{lanes:a.lanes,firstContext:a.firstContext}),c=c.sibling;G(L,L.current&1|2);return b.child}a=
a.sibling}null!==f.tail&&B()>Gj&&(b.flags|=128,d=!0,Dj(f,!1),b.lanes=4194304)}else{if(!d)if(a=Ch(g),null!==a){if(b.flags|=128,d=!0,c=a.updateQueue,null!==c&&(b.updateQueue=c,b.flags|=4),Dj(f,!0),null===f.tail&&"hidden"===f.tailMode&&!g.alternate&&!I)return S(b),null}else 2*B()-f.renderingStartTime>Gj&&1073741824!==c&&(b.flags|=128,d=!0,Dj(f,!1),b.lanes=4194304);f.isBackwards?(g.sibling=b.child,b.child=g):(c=f.last,null!==c?c.sibling=g:b.child=g,f.last=g)}if(null!==f.tail)return b=f.tail,f.rendering=
b,f.tail=b.sibling,f.renderingStartTime=B(),b.sibling=null,c=L.current,G(L,d?c&1|2:c&1),b;S(b);return null;case 22:case 23:return Hj(),d=null!==b.memoizedState,null!==a&&null!==a.memoizedState!==d&&(b.flags|=8192),d&&0!==(b.mode&1)?0!==(fj&1073741824)&&(S(b),b.subtreeFlags&6&&(b.flags|=8192)):S(b),null;case 24:return null;case 25:return null}throw Error(p(156,b.tag));}
function Ij(a,b){wg(b);switch(b.tag){case 1:return Zf(b.type)&&$f(),a=b.flags,a&65536?(b.flags=a&-65537|128,b):null;case 3:return zh(),E(Wf),E(H),Eh(),a=b.flags,0!==(a&65536)&&0===(a&128)?(b.flags=a&-65537|128,b):null;case 5:return Bh(b),null;case 13:E(L);a=b.memoizedState;if(null!==a&&null!==a.dehydrated){if(null===b.alternate)throw Error(p(340));Ig()}a=b.flags;return a&65536?(b.flags=a&-65537|128,b):null;case 19:return E(L),null;case 4:return zh(),null;case 10:return ah(b.type._context),null;case 22:case 23:return Hj(),
null;case 24:return null;default:return null}}var Jj=!1,U=!1,Kj="function"===typeof WeakSet?WeakSet:Set,V=null;function Lj(a,b){var c=a.ref;if(null!==c)if("function"===typeof c)try{c(null)}catch(d){W(a,b,d)}else c.current=null}function Mj(a,b,c){try{c()}catch(d){W(a,b,d)}}var Nj=!1;
function Oj(a,b){Cf=dd;a=Me();if(Ne(a)){if("selectionStart"in a)var c={start:a.selectionStart,end:a.selectionEnd};else a:{c=(c=a.ownerDocument)&&c.defaultView||window;var d=c.getSelection&&c.getSelection();if(d&&0!==d.rangeCount){c=d.anchorNode;var e=d.anchorOffset,f=d.focusNode;d=d.focusOffset;try{c.nodeType,f.nodeType}catch(F){c=null;break a}var g=0,h=-1,k=-1,l=0,m=0,q=a,r=null;b:for(;;){for(var y;;){q!==c||0!==e&&3!==q.nodeType||(h=g+e);q!==f||0!==d&&3!==q.nodeType||(k=g+d);3===q.nodeType&&(g+=
q.nodeValue.length);if(null===(y=q.firstChild))break;r=q;q=y}for(;;){if(q===a)break b;r===c&&++l===e&&(h=g);r===f&&++m===d&&(k=g);if(null!==(y=q.nextSibling))break;q=r;r=q.parentNode}q=y}c=-1===h||-1===k?null:{start:h,end:k}}else c=null}c=c||{start:0,end:0}}else c=null;Df={focusedElem:a,selectionRange:c};dd=!1;for(V=b;null!==V;)if(b=V,a=b.child,0!==(b.subtreeFlags&1028)&&null!==a)a.return=b,V=a;else for(;null!==V;){b=V;try{var n=b.alternate;if(0!==(b.flags&1024))switch(b.tag){case 0:case 11:case 15:break;
case 1:if(null!==n){var t=n.memoizedProps,J=n.memoizedState,x=b.stateNode,w=x.getSnapshotBeforeUpdate(b.elementType===b.type?t:Ci(b.type,t),J);x.__reactInternalSnapshotBeforeUpdate=w}break;case 3:var u=b.stateNode.containerInfo;1===u.nodeType?u.textContent="":9===u.nodeType&&u.documentElement&&u.removeChild(u.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(p(163));}}catch(F){W(b,b.return,F)}a=b.sibling;if(null!==a){a.return=b.return;V=a;break}V=b.return}n=Nj;Nj=!1;return n}
function Pj(a,b,c){var d=b.updateQueue;d=null!==d?d.lastEffect:null;if(null!==d){var e=d=d.next;do{if((e.tag&a)===a){var f=e.destroy;e.destroy=void 0;void 0!==f&&Mj(b,c,f)}e=e.next}while(e!==d)}}function Qj(a,b){b=b.updateQueue;b=null!==b?b.lastEffect:null;if(null!==b){var c=b=b.next;do{if((c.tag&a)===a){var d=c.create;c.destroy=d()}c=c.next}while(c!==b)}}function Rj(a){var b=a.ref;if(null!==b){var c=a.stateNode;switch(a.tag){case 5:a=c;break;default:a=c}"function"===typeof b?b(a):b.current=a}}
function Sj(a){var b=a.alternate;null!==b&&(a.alternate=null,Sj(b));a.child=null;a.deletions=null;a.sibling=null;5===a.tag&&(b=a.stateNode,null!==b&&(delete b[Of],delete b[Pf],delete b[of],delete b[Qf],delete b[Rf]));a.stateNode=null;a.return=null;a.dependencies=null;a.memoizedProps=null;a.memoizedState=null;a.pendingProps=null;a.stateNode=null;a.updateQueue=null}function Tj(a){return 5===a.tag||3===a.tag||4===a.tag}
function Uj(a){a:for(;;){for(;null===a.sibling;){if(null===a.return||Tj(a.return))return null;a=a.return}a.sibling.return=a.return;for(a=a.sibling;5!==a.tag&&6!==a.tag&&18!==a.tag;){if(a.flags&2)continue a;if(null===a.child||4===a.tag)continue a;else a.child.return=a,a=a.child}if(!(a.flags&2))return a.stateNode}}
function Vj(a,b,c){var d=a.tag;if(5===d||6===d)a=a.stateNode,b?8===c.nodeType?c.parentNode.insertBefore(a,b):c.insertBefore(a,b):(8===c.nodeType?(b=c.parentNode,b.insertBefore(a,c)):(b=c,b.appendChild(a)),c=c._reactRootContainer,null!==c&&void 0!==c||null!==b.onclick||(b.onclick=Bf));else if(4!==d&&(a=a.child,null!==a))for(Vj(a,b,c),a=a.sibling;null!==a;)Vj(a,b,c),a=a.sibling}
function Wj(a,b,c){var d=a.tag;if(5===d||6===d)a=a.stateNode,b?c.insertBefore(a,b):c.appendChild(a);else if(4!==d&&(a=a.child,null!==a))for(Wj(a,b,c),a=a.sibling;null!==a;)Wj(a,b,c),a=a.sibling}var X=null,Xj=!1;function Yj(a,b,c){for(c=c.child;null!==c;)Zj(a,b,c),c=c.sibling}
function Zj(a,b,c){if(lc&&"function"===typeof lc.onCommitFiberUnmount)try{lc.onCommitFiberUnmount(kc,c)}catch(h){}switch(c.tag){case 5:U||Lj(c,b);case 6:var d=X,e=Xj;X=null;Yj(a,b,c);X=d;Xj=e;null!==X&&(Xj?(a=X,c=c.stateNode,8===a.nodeType?a.parentNode.removeChild(c):a.removeChild(c)):X.removeChild(c.stateNode));break;case 18:null!==X&&(Xj?(a=X,c=c.stateNode,8===a.nodeType?Kf(a.parentNode,c):1===a.nodeType&&Kf(a,c),bd(a)):Kf(X,c.stateNode));break;case 4:d=X;e=Xj;X=c.stateNode.containerInfo;Xj=!0;
Yj(a,b,c);X=d;Xj=e;break;case 0:case 11:case 14:case 15:if(!U&&(d=c.updateQueue,null!==d&&(d=d.lastEffect,null!==d))){e=d=d.next;do{var f=e,g=f.destroy;f=f.tag;void 0!==g&&(0!==(f&2)?Mj(c,b,g):0!==(f&4)&&Mj(c,b,g));e=e.next}while(e!==d)}Yj(a,b,c);break;case 1:if(!U&&(Lj(c,b),d=c.stateNode,"function"===typeof d.componentWillUnmount))try{d.props=c.memoizedProps,d.state=c.memoizedState,d.componentWillUnmount()}catch(h){W(c,b,h)}Yj(a,b,c);break;case 21:Yj(a,b,c);break;case 22:c.mode&1?(U=(d=U)||null!==
c.memoizedState,Yj(a,b,c),U=d):Yj(a,b,c);break;default:Yj(a,b,c)}}function ak(a){var b=a.updateQueue;if(null!==b){a.updateQueue=null;var c=a.stateNode;null===c&&(c=a.stateNode=new Kj);b.forEach(function(b){var d=bk.bind(null,a,b);c.has(b)||(c.add(b),b.then(d,d))})}}
function ck(a,b){var c=b.deletions;if(null!==c)for(var d=0;d<c.length;d++){var e=c[d];try{var f=a,g=b,h=g;a:for(;null!==h;){switch(h.tag){case 5:X=h.stateNode;Xj=!1;break a;case 3:X=h.stateNode.containerInfo;Xj=!0;break a;case 4:X=h.stateNode.containerInfo;Xj=!0;break a}h=h.return}if(null===X)throw Error(p(160));Zj(f,g,e);X=null;Xj=!1;var k=e.alternate;null!==k&&(k.return=null);e.return=null}catch(l){W(e,b,l)}}if(b.subtreeFlags&12854)for(b=b.child;null!==b;)dk(b,a),b=b.sibling}
function dk(a,b){var c=a.alternate,d=a.flags;switch(a.tag){case 0:case 11:case 14:case 15:ck(b,a);ek(a);if(d&4){try{Pj(3,a,a.return),Qj(3,a)}catch(t){W(a,a.return,t)}try{Pj(5,a,a.return)}catch(t){W(a,a.return,t)}}break;case 1:ck(b,a);ek(a);d&512&&null!==c&&Lj(c,c.return);break;case 5:ck(b,a);ek(a);d&512&&null!==c&&Lj(c,c.return);if(a.flags&32){var e=a.stateNode;try{ob(e,"")}catch(t){W(a,a.return,t)}}if(d&4&&(e=a.stateNode,null!=e)){var f=a.memoizedProps,g=null!==c?c.memoizedProps:f,h=a.type,k=a.updateQueue;
a.updateQueue=null;if(null!==k)try{"input"===h&&"radio"===f.type&&null!=f.name&&ab(e,f);vb(h,g);var l=vb(h,f);for(g=0;g<k.length;g+=2){var m=k[g],q=k[g+1];"style"===m?sb(e,q):"dangerouslySetInnerHTML"===m?nb(e,q):"children"===m?ob(e,q):ta(e,m,q,l)}switch(h){case "input":bb(e,f);break;case "textarea":ib(e,f);break;case "select":var r=e._wrapperState.wasMultiple;e._wrapperState.wasMultiple=!!f.multiple;var y=f.value;null!=y?fb(e,!!f.multiple,y,!1):r!==!!f.multiple&&(null!=f.defaultValue?fb(e,!!f.multiple,
f.defaultValue,!0):fb(e,!!f.multiple,f.multiple?[]:"",!1))}e[Pf]=f}catch(t){W(a,a.return,t)}}break;case 6:ck(b,a);ek(a);if(d&4){if(null===a.stateNode)throw Error(p(162));e=a.stateNode;f=a.memoizedProps;try{e.nodeValue=f}catch(t){W(a,a.return,t)}}break;case 3:ck(b,a);ek(a);if(d&4&&null!==c&&c.memoizedState.isDehydrated)try{bd(b.containerInfo)}catch(t){W(a,a.return,t)}break;case 4:ck(b,a);ek(a);break;case 13:ck(b,a);ek(a);e=a.child;e.flags&8192&&(f=null!==e.memoizedState,e.stateNode.isHidden=f,!f||
null!==e.alternate&&null!==e.alternate.memoizedState||(fk=B()));d&4&&ak(a);break;case 22:m=null!==c&&null!==c.memoizedState;a.mode&1?(U=(l=U)||m,ck(b,a),U=l):ck(b,a);ek(a);if(d&8192){l=null!==a.memoizedState;if((a.stateNode.isHidden=l)&&!m&&0!==(a.mode&1))for(V=a,m=a.child;null!==m;){for(q=V=m;null!==V;){r=V;y=r.child;switch(r.tag){case 0:case 11:case 14:case 15:Pj(4,r,r.return);break;case 1:Lj(r,r.return);var n=r.stateNode;if("function"===typeof n.componentWillUnmount){d=r;c=r.return;try{b=d,n.props=
b.memoizedProps,n.state=b.memoizedState,n.componentWillUnmount()}catch(t){W(d,c,t)}}break;case 5:Lj(r,r.return);break;case 22:if(null!==r.memoizedState){gk(q);continue}}null!==y?(y.return=r,V=y):gk(q)}m=m.sibling}a:for(m=null,q=a;;){if(5===q.tag){if(null===m){m=q;try{e=q.stateNode,l?(f=e.style,"function"===typeof f.setProperty?f.setProperty("display","none","important"):f.display="none"):(h=q.stateNode,k=q.memoizedProps.style,g=void 0!==k&&null!==k&&k.hasOwnProperty("display")?k.display:null,h.style.display=
rb("display",g))}catch(t){W(a,a.return,t)}}}else if(6===q.tag){if(null===m)try{q.stateNode.nodeValue=l?"":q.memoizedProps}catch(t){W(a,a.return,t)}}else if((22!==q.tag&&23!==q.tag||null===q.memoizedState||q===a)&&null!==q.child){q.child.return=q;q=q.child;continue}if(q===a)break a;for(;null===q.sibling;){if(null===q.return||q.return===a)break a;m===q&&(m=null);q=q.return}m===q&&(m=null);q.sibling.return=q.return;q=q.sibling}}break;case 19:ck(b,a);ek(a);d&4&&ak(a);break;case 21:break;default:ck(b,
a),ek(a)}}function ek(a){var b=a.flags;if(b&2){try{a:{for(var c=a.return;null!==c;){if(Tj(c)){var d=c;break a}c=c.return}throw Error(p(160));}switch(d.tag){case 5:var e=d.stateNode;d.flags&32&&(ob(e,""),d.flags&=-33);var f=Uj(a);Wj(a,f,e);break;case 3:case 4:var g=d.stateNode.containerInfo,h=Uj(a);Vj(a,h,g);break;default:throw Error(p(161));}}catch(k){W(a,a.return,k)}a.flags&=-3}b&4096&&(a.flags&=-4097)}function hk(a,b,c){V=a;ik(a,b,c)}
function ik(a,b,c){for(var d=0!==(a.mode&1);null!==V;){var e=V,f=e.child;if(22===e.tag&&d){var g=null!==e.memoizedState||Jj;if(!g){var h=e.alternate,k=null!==h&&null!==h.memoizedState||U;h=Jj;var l=U;Jj=g;if((U=k)&&!l)for(V=e;null!==V;)g=V,k=g.child,22===g.tag&&null!==g.memoizedState?jk(e):null!==k?(k.return=g,V=k):jk(e);for(;null!==f;)V=f,ik(f,b,c),f=f.sibling;V=e;Jj=h;U=l}kk(a,b,c)}else 0!==(e.subtreeFlags&8772)&&null!==f?(f.return=e,V=f):kk(a,b,c)}}
function kk(a){for(;null!==V;){var b=V;if(0!==(b.flags&8772)){var c=b.alternate;try{if(0!==(b.flags&8772))switch(b.tag){case 0:case 11:case 15:U||Qj(5,b);break;case 1:var d=b.stateNode;if(b.flags&4&&!U)if(null===c)d.componentDidMount();else{var e=b.elementType===b.type?c.memoizedProps:Ci(b.type,c.memoizedProps);d.componentDidUpdate(e,c.memoizedState,d.__reactInternalSnapshotBeforeUpdate)}var f=b.updateQueue;null!==f&&sh(b,f,d);break;case 3:var g=b.updateQueue;if(null!==g){c=null;if(null!==b.child)switch(b.child.tag){case 5:c=
b.child.stateNode;break;case 1:c=b.child.stateNode}sh(b,g,c)}break;case 5:var h=b.stateNode;if(null===c&&b.flags&4){c=h;var k=b.memoizedProps;switch(b.type){case "button":case "input":case "select":case "textarea":k.autoFocus&&c.focus();break;case "img":k.src&&(c.src=k.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(null===b.memoizedState){var l=b.alternate;if(null!==l){var m=l.memoizedState;if(null!==m){var q=m.dehydrated;null!==q&&bd(q)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;
default:throw Error(p(163));}U||b.flags&512&&Rj(b)}catch(r){W(b,b.return,r)}}if(b===a){V=null;break}c=b.sibling;if(null!==c){c.return=b.return;V=c;break}V=b.return}}function gk(a){for(;null!==V;){var b=V;if(b===a){V=null;break}var c=b.sibling;if(null!==c){c.return=b.return;V=c;break}V=b.return}}
function jk(a){for(;null!==V;){var b=V;try{switch(b.tag){case 0:case 11:case 15:var c=b.return;try{Qj(4,b)}catch(k){W(b,c,k)}break;case 1:var d=b.stateNode;if("function"===typeof d.componentDidMount){var e=b.return;try{d.componentDidMount()}catch(k){W(b,e,k)}}var f=b.return;try{Rj(b)}catch(k){W(b,f,k)}break;case 5:var g=b.return;try{Rj(b)}catch(k){W(b,g,k)}}}catch(k){W(b,b.return,k)}if(b===a){V=null;break}var h=b.sibling;if(null!==h){h.return=b.return;V=h;break}V=b.return}}
var lk=Math.ceil,mk=ua.ReactCurrentDispatcher,nk=ua.ReactCurrentOwner,ok=ua.ReactCurrentBatchConfig,K=0,Q=null,Y=null,Z=0,fj=0,ej=Uf(0),T=0,pk=null,rh=0,qk=0,rk=0,sk=null,tk=null,fk=0,Gj=Infinity,uk=null,Oi=!1,Pi=null,Ri=null,vk=!1,wk=null,xk=0,yk=0,zk=null,Ak=-1,Bk=0;function R(){return 0!==(K&6)?B():-1!==Ak?Ak:Ak=B()}
function yi(a){if(0===(a.mode&1))return 1;if(0!==(K&2)&&0!==Z)return Z&-Z;if(null!==Kg.transition)return 0===Bk&&(Bk=yc()),Bk;a=C;if(0!==a)return a;a=window.event;a=void 0===a?16:jd(a.type);return a}function gi(a,b,c,d){if(50<yk)throw yk=0,zk=null,Error(p(185));Ac(a,c,d);if(0===(K&2)||a!==Q)a===Q&&(0===(K&2)&&(qk|=c),4===T&&Ck(a,Z)),Dk(a,d),1===c&&0===K&&0===(b.mode&1)&&(Gj=B()+500,fg&&jg())}
function Dk(a,b){var c=a.callbackNode;wc(a,b);var d=uc(a,a===Q?Z:0);if(0===d)null!==c&&bc(c),a.callbackNode=null,a.callbackPriority=0;else if(b=d&-d,a.callbackPriority!==b){null!=c&&bc(c);if(1===b)0===a.tag?ig(Ek.bind(null,a)):hg(Ek.bind(null,a)),Jf(function(){0===(K&6)&&jg()}),c=null;else{switch(Dc(d)){case 1:c=fc;break;case 4:c=gc;break;case 16:c=hc;break;case 536870912:c=jc;break;default:c=hc}c=Fk(c,Gk.bind(null,a))}a.callbackPriority=b;a.callbackNode=c}}
function Gk(a,b){Ak=-1;Bk=0;if(0!==(K&6))throw Error(p(327));var c=a.callbackNode;if(Hk()&&a.callbackNode!==c)return null;var d=uc(a,a===Q?Z:0);if(0===d)return null;if(0!==(d&30)||0!==(d&a.expiredLanes)||b)b=Ik(a,d);else{b=d;var e=K;K|=2;var f=Jk();if(Q!==a||Z!==b)uk=null,Gj=B()+500,Kk(a,b);do try{Lk();break}catch(h){Mk(a,h)}while(1);$g();mk.current=f;K=e;null!==Y?b=0:(Q=null,Z=0,b=T)}if(0!==b){2===b&&(e=xc(a),0!==e&&(d=e,b=Nk(a,e)));if(1===b)throw c=pk,Kk(a,0),Ck(a,d),Dk(a,B()),c;if(6===b)Ck(a,d);
else{e=a.current.alternate;if(0===(d&30)&&!Ok(e)&&(b=Ik(a,d),2===b&&(f=xc(a),0!==f&&(d=f,b=Nk(a,f))),1===b))throw c=pk,Kk(a,0),Ck(a,d),Dk(a,B()),c;a.finishedWork=e;a.finishedLanes=d;switch(b){case 0:case 1:throw Error(p(345));case 2:Pk(a,tk,uk);break;case 3:Ck(a,d);if((d&130023424)===d&&(b=fk+500-B(),10<b)){if(0!==uc(a,0))break;e=a.suspendedLanes;if((e&d)!==d){R();a.pingedLanes|=a.suspendedLanes&e;break}a.timeoutHandle=Ff(Pk.bind(null,a,tk,uk),b);break}Pk(a,tk,uk);break;case 4:Ck(a,d);if((d&4194240)===
d)break;b=a.eventTimes;for(e=-1;0<d;){var g=31-oc(d);f=1<<g;g=b[g];g>e&&(e=g);d&=~f}d=e;d=B()-d;d=(120>d?120:480>d?480:1080>d?1080:1920>d?1920:3E3>d?3E3:4320>d?4320:1960*lk(d/1960))-d;if(10<d){a.timeoutHandle=Ff(Pk.bind(null,a,tk,uk),d);break}Pk(a,tk,uk);break;case 5:Pk(a,tk,uk);break;default:throw Error(p(329));}}}Dk(a,B());return a.callbackNode===c?Gk.bind(null,a):null}
function Nk(a,b){var c=sk;a.current.memoizedState.isDehydrated&&(Kk(a,b).flags|=256);a=Ik(a,b);2!==a&&(b=tk,tk=c,null!==b&&Fj(b));return a}function Fj(a){null===tk?tk=a:tk.push.apply(tk,a)}
function Ok(a){for(var b=a;;){if(b.flags&16384){var c=b.updateQueue;if(null!==c&&(c=c.stores,null!==c))for(var d=0;d<c.length;d++){var e=c[d],f=e.getSnapshot;e=e.value;try{if(!He(f(),e))return!1}catch(g){return!1}}}c=b.child;if(b.subtreeFlags&16384&&null!==c)c.return=b,b=c;else{if(b===a)break;for(;null===b.sibling;){if(null===b.return||b.return===a)return!0;b=b.return}b.sibling.return=b.return;b=b.sibling}}return!0}
function Ck(a,b){b&=~rk;b&=~qk;a.suspendedLanes|=b;a.pingedLanes&=~b;for(a=a.expirationTimes;0<b;){var c=31-oc(b),d=1<<c;a[c]=-1;b&=~d}}function Ek(a){if(0!==(K&6))throw Error(p(327));Hk();var b=uc(a,0);if(0===(b&1))return Dk(a,B()),null;var c=Ik(a,b);if(0!==a.tag&&2===c){var d=xc(a);0!==d&&(b=d,c=Nk(a,d))}if(1===c)throw c=pk,Kk(a,0),Ck(a,b),Dk(a,B()),c;if(6===c)throw Error(p(345));a.finishedWork=a.current.alternate;a.finishedLanes=b;Pk(a,tk,uk);Dk(a,B());return null}
function Qk(a,b){var c=K;K|=1;try{return a(b)}finally{K=c,0===K&&(Gj=B()+500,fg&&jg())}}function Rk(a){null!==wk&&0===wk.tag&&0===(K&6)&&Hk();var b=K;K|=1;var c=ok.transition,d=C;try{if(ok.transition=null,C=1,a)return a()}finally{C=d,ok.transition=c,K=b,0===(K&6)&&jg()}}function Hj(){fj=ej.current;E(ej)}
function Kk(a,b){a.finishedWork=null;a.finishedLanes=0;var c=a.timeoutHandle;-1!==c&&(a.timeoutHandle=-1,Gf(c));if(null!==Y)for(c=Y.return;null!==c;){var d=c;wg(d);switch(d.tag){case 1:d=d.type.childContextTypes;null!==d&&void 0!==d&&$f();break;case 3:zh();E(Wf);E(H);Eh();break;case 5:Bh(d);break;case 4:zh();break;case 13:E(L);break;case 19:E(L);break;case 10:ah(d.type._context);break;case 22:case 23:Hj()}c=c.return}Q=a;Y=a=Pg(a.current,null);Z=fj=b;T=0;pk=null;rk=qk=rh=0;tk=sk=null;if(null!==fh){for(b=
0;b<fh.length;b++)if(c=fh[b],d=c.interleaved,null!==d){c.interleaved=null;var e=d.next,f=c.pending;if(null!==f){var g=f.next;f.next=e;d.next=g}c.pending=d}fh=null}return a}
function Mk(a,b){do{var c=Y;try{$g();Fh.current=Rh;if(Ih){for(var d=M.memoizedState;null!==d;){var e=d.queue;null!==e&&(e.pending=null);d=d.next}Ih=!1}Hh=0;O=N=M=null;Jh=!1;Kh=0;nk.current=null;if(null===c||null===c.return){T=1;pk=b;Y=null;break}a:{var f=a,g=c.return,h=c,k=b;b=Z;h.flags|=32768;if(null!==k&&"object"===typeof k&&"function"===typeof k.then){var l=k,m=h,q=m.tag;if(0===(m.mode&1)&&(0===q||11===q||15===q)){var r=m.alternate;r?(m.updateQueue=r.updateQueue,m.memoizedState=r.memoizedState,
m.lanes=r.lanes):(m.updateQueue=null,m.memoizedState=null)}var y=Ui(g);if(null!==y){y.flags&=-257;Vi(y,g,h,f,b);y.mode&1&&Si(f,l,b);b=y;k=l;var n=b.updateQueue;if(null===n){var t=new Set;t.add(k);b.updateQueue=t}else n.add(k);break a}else{if(0===(b&1)){Si(f,l,b);tj();break a}k=Error(p(426))}}else if(I&&h.mode&1){var J=Ui(g);if(null!==J){0===(J.flags&65536)&&(J.flags|=256);Vi(J,g,h,f,b);Jg(Ji(k,h));break a}}f=k=Ji(k,h);4!==T&&(T=2);null===sk?sk=[f]:sk.push(f);f=g;do{switch(f.tag){case 3:f.flags|=65536;
b&=-b;f.lanes|=b;var x=Ni(f,k,b);ph(f,x);break a;case 1:h=k;var w=f.type,u=f.stateNode;if(0===(f.flags&128)&&("function"===typeof w.getDerivedStateFromError||null!==u&&"function"===typeof u.componentDidCatch&&(null===Ri||!Ri.has(u)))){f.flags|=65536;b&=-b;f.lanes|=b;var F=Qi(f,h,b);ph(f,F);break a}}f=f.return}while(null!==f)}Sk(c)}catch(na){b=na;Y===c&&null!==c&&(Y=c=c.return);continue}break}while(1)}function Jk(){var a=mk.current;mk.current=Rh;return null===a?Rh:a}
function tj(){if(0===T||3===T||2===T)T=4;null===Q||0===(rh&268435455)&&0===(qk&268435455)||Ck(Q,Z)}function Ik(a,b){var c=K;K|=2;var d=Jk();if(Q!==a||Z!==b)uk=null,Kk(a,b);do try{Tk();break}catch(e){Mk(a,e)}while(1);$g();K=c;mk.current=d;if(null!==Y)throw Error(p(261));Q=null;Z=0;return T}function Tk(){for(;null!==Y;)Uk(Y)}function Lk(){for(;null!==Y&&!cc();)Uk(Y)}function Uk(a){var b=Vk(a.alternate,a,fj);a.memoizedProps=a.pendingProps;null===b?Sk(a):Y=b;nk.current=null}
function Sk(a){var b=a;do{var c=b.alternate;a=b.return;if(0===(b.flags&32768)){if(c=Ej(c,b,fj),null!==c){Y=c;return}}else{c=Ij(c,b);if(null!==c){c.flags&=32767;Y=c;return}if(null!==a)a.flags|=32768,a.subtreeFlags=0,a.deletions=null;else{T=6;Y=null;return}}b=b.sibling;if(null!==b){Y=b;return}Y=b=a}while(null!==b);0===T&&(T=5)}function Pk(a,b,c){var d=C,e=ok.transition;try{ok.transition=null,C=1,Wk(a,b,c,d)}finally{ok.transition=e,C=d}return null}
function Wk(a,b,c,d){do Hk();while(null!==wk);if(0!==(K&6))throw Error(p(327));c=a.finishedWork;var e=a.finishedLanes;if(null===c)return null;a.finishedWork=null;a.finishedLanes=0;if(c===a.current)throw Error(p(177));a.callbackNode=null;a.callbackPriority=0;var f=c.lanes|c.childLanes;Bc(a,f);a===Q&&(Y=Q=null,Z=0);0===(c.subtreeFlags&2064)&&0===(c.flags&2064)||vk||(vk=!0,Fk(hc,function(){Hk();return null}));f=0!==(c.flags&15990);if(0!==(c.subtreeFlags&15990)||f){f=ok.transition;ok.transition=null;
var g=C;C=1;var h=K;K|=4;nk.current=null;Oj(a,c);dk(c,a);Oe(Df);dd=!!Cf;Df=Cf=null;a.current=c;hk(c,a,e);dc();K=h;C=g;ok.transition=f}else a.current=c;vk&&(vk=!1,wk=a,xk=e);f=a.pendingLanes;0===f&&(Ri=null);mc(c.stateNode,d);Dk(a,B());if(null!==b)for(d=a.onRecoverableError,c=0;c<b.length;c++)e=b[c],d(e.value,{componentStack:e.stack,digest:e.digest});if(Oi)throw Oi=!1,a=Pi,Pi=null,a;0!==(xk&1)&&0!==a.tag&&Hk();f=a.pendingLanes;0!==(f&1)?a===zk?yk++:(yk=0,zk=a):yk=0;jg();return null}
function Hk(){if(null!==wk){var a=Dc(xk),b=ok.transition,c=C;try{ok.transition=null;C=16>a?16:a;if(null===wk)var d=!1;else{a=wk;wk=null;xk=0;if(0!==(K&6))throw Error(p(331));var e=K;K|=4;for(V=a.current;null!==V;){var f=V,g=f.child;if(0!==(V.flags&16)){var h=f.deletions;if(null!==h){for(var k=0;k<h.length;k++){var l=h[k];for(V=l;null!==V;){var m=V;switch(m.tag){case 0:case 11:case 15:Pj(8,m,f)}var q=m.child;if(null!==q)q.return=m,V=q;else for(;null!==V;){m=V;var r=m.sibling,y=m.return;Sj(m);if(m===
l){V=null;break}if(null!==r){r.return=y;V=r;break}V=y}}}var n=f.alternate;if(null!==n){var t=n.child;if(null!==t){n.child=null;do{var J=t.sibling;t.sibling=null;t=J}while(null!==t)}}V=f}}if(0!==(f.subtreeFlags&2064)&&null!==g)g.return=f,V=g;else b:for(;null!==V;){f=V;if(0!==(f.flags&2048))switch(f.tag){case 0:case 11:case 15:Pj(9,f,f.return)}var x=f.sibling;if(null!==x){x.return=f.return;V=x;break b}V=f.return}}var w=a.current;for(V=w;null!==V;){g=V;var u=g.child;if(0!==(g.subtreeFlags&2064)&&null!==
u)u.return=g,V=u;else b:for(g=w;null!==V;){h=V;if(0!==(h.flags&2048))try{switch(h.tag){case 0:case 11:case 15:Qj(9,h)}}catch(na){W(h,h.return,na)}if(h===g){V=null;break b}var F=h.sibling;if(null!==F){F.return=h.return;V=F;break b}V=h.return}}K=e;jg();if(lc&&"function"===typeof lc.onPostCommitFiberRoot)try{lc.onPostCommitFiberRoot(kc,a)}catch(na){}d=!0}return d}finally{C=c,ok.transition=b}}return!1}function Xk(a,b,c){b=Ji(c,b);b=Ni(a,b,1);a=nh(a,b,1);b=R();null!==a&&(Ac(a,1,b),Dk(a,b))}
function W(a,b,c){if(3===a.tag)Xk(a,a,c);else for(;null!==b;){if(3===b.tag){Xk(b,a,c);break}else if(1===b.tag){var d=b.stateNode;if("function"===typeof b.type.getDerivedStateFromError||"function"===typeof d.componentDidCatch&&(null===Ri||!Ri.has(d))){a=Ji(c,a);a=Qi(b,a,1);b=nh(b,a,1);a=R();null!==b&&(Ac(b,1,a),Dk(b,a));break}}b=b.return}}
function Ti(a,b,c){var d=a.pingCache;null!==d&&d.delete(b);b=R();a.pingedLanes|=a.suspendedLanes&c;Q===a&&(Z&c)===c&&(4===T||3===T&&(Z&130023424)===Z&&500>B()-fk?Kk(a,0):rk|=c);Dk(a,b)}function Yk(a,b){0===b&&(0===(a.mode&1)?b=1:(b=sc,sc<<=1,0===(sc&130023424)&&(sc=4194304)));var c=R();a=ih(a,b);null!==a&&(Ac(a,b,c),Dk(a,c))}function uj(a){var b=a.memoizedState,c=0;null!==b&&(c=b.retryLane);Yk(a,c)}
function bk(a,b){var c=0;switch(a.tag){case 13:var d=a.stateNode;var e=a.memoizedState;null!==e&&(c=e.retryLane);break;case 19:d=a.stateNode;break;default:throw Error(p(314));}null!==d&&d.delete(b);Yk(a,c)}var Vk;
Vk=function(a,b,c){if(null!==a)if(a.memoizedProps!==b.pendingProps||Wf.current)dh=!0;else{if(0===(a.lanes&c)&&0===(b.flags&128))return dh=!1,yj(a,b,c);dh=0!==(a.flags&131072)?!0:!1}else dh=!1,I&&0!==(b.flags&1048576)&&ug(b,ng,b.index);b.lanes=0;switch(b.tag){case 2:var d=b.type;ij(a,b);a=b.pendingProps;var e=Yf(b,H.current);ch(b,c);e=Nh(null,b,d,a,e,c);var f=Sh();b.flags|=1;"object"===typeof e&&null!==e&&"function"===typeof e.render&&void 0===e.$$typeof?(b.tag=1,b.memoizedState=null,b.updateQueue=
null,Zf(d)?(f=!0,cg(b)):f=!1,b.memoizedState=null!==e.state&&void 0!==e.state?e.state:null,kh(b),e.updater=Ei,b.stateNode=e,e._reactInternals=b,Ii(b,d,a,c),b=jj(null,b,d,!0,f,c)):(b.tag=0,I&&f&&vg(b),Xi(null,b,e,c),b=b.child);return b;case 16:d=b.elementType;a:{ij(a,b);a=b.pendingProps;e=d._init;d=e(d._payload);b.type=d;e=b.tag=Zk(d);a=Ci(d,a);switch(e){case 0:b=cj(null,b,d,a,c);break a;case 1:b=hj(null,b,d,a,c);break a;case 11:b=Yi(null,b,d,a,c);break a;case 14:b=$i(null,b,d,Ci(d.type,a),c);break a}throw Error(p(306,
d,""));}return b;case 0:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Ci(d,e),cj(a,b,d,e,c);case 1:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Ci(d,e),hj(a,b,d,e,c);case 3:a:{kj(b);if(null===a)throw Error(p(387));d=b.pendingProps;f=b.memoizedState;e=f.element;lh(a,b);qh(b,d,null,c);var g=b.memoizedState;d=g.element;if(f.isDehydrated)if(f={element:d,isDehydrated:!1,cache:g.cache,pendingSuspenseBoundaries:g.pendingSuspenseBoundaries,transitions:g.transitions},b.updateQueue.baseState=
f,b.memoizedState=f,b.flags&256){e=Ji(Error(p(423)),b);b=lj(a,b,d,c,e);break a}else if(d!==e){e=Ji(Error(p(424)),b);b=lj(a,b,d,c,e);break a}else for(yg=Lf(b.stateNode.containerInfo.firstChild),xg=b,I=!0,zg=null,c=Vg(b,null,d,c),b.child=c;c;)c.flags=c.flags&-3|4096,c=c.sibling;else{Ig();if(d===e){b=Zi(a,b,c);break a}Xi(a,b,d,c)}b=b.child}return b;case 5:return Ah(b),null===a&&Eg(b),d=b.type,e=b.pendingProps,f=null!==a?a.memoizedProps:null,g=e.children,Ef(d,e)?g=null:null!==f&&Ef(d,f)&&(b.flags|=32),
gj(a,b),Xi(a,b,g,c),b.child;case 6:return null===a&&Eg(b),null;case 13:return oj(a,b,c);case 4:return yh(b,b.stateNode.containerInfo),d=b.pendingProps,null===a?b.child=Ug(b,null,d,c):Xi(a,b,d,c),b.child;case 11:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Ci(d,e),Yi(a,b,d,e,c);case 7:return Xi(a,b,b.pendingProps,c),b.child;case 8:return Xi(a,b,b.pendingProps.children,c),b.child;case 12:return Xi(a,b,b.pendingProps.children,c),b.child;case 10:a:{d=b.type._context;e=b.pendingProps;f=b.memoizedProps;
g=e.value;G(Wg,d._currentValue);d._currentValue=g;if(null!==f)if(He(f.value,g)){if(f.children===e.children&&!Wf.current){b=Zi(a,b,c);break a}}else for(f=b.child,null!==f&&(f.return=b);null!==f;){var h=f.dependencies;if(null!==h){g=f.child;for(var k=h.firstContext;null!==k;){if(k.context===d){if(1===f.tag){k=mh(-1,c&-c);k.tag=2;var l=f.updateQueue;if(null!==l){l=l.shared;var m=l.pending;null===m?k.next=k:(k.next=m.next,m.next=k);l.pending=k}}f.lanes|=c;k=f.alternate;null!==k&&(k.lanes|=c);bh(f.return,
c,b);h.lanes|=c;break}k=k.next}}else if(10===f.tag)g=f.type===b.type?null:f.child;else if(18===f.tag){g=f.return;if(null===g)throw Error(p(341));g.lanes|=c;h=g.alternate;null!==h&&(h.lanes|=c);bh(g,c,b);g=f.sibling}else g=f.child;if(null!==g)g.return=f;else for(g=f;null!==g;){if(g===b){g=null;break}f=g.sibling;if(null!==f){f.return=g.return;g=f;break}g=g.return}f=g}Xi(a,b,e.children,c);b=b.child}return b;case 9:return e=b.type,d=b.pendingProps.children,ch(b,c),e=eh(e),d=d(e),b.flags|=1,Xi(a,b,d,c),
b.child;case 14:return d=b.type,e=Ci(d,b.pendingProps),e=Ci(d.type,e),$i(a,b,d,e,c);case 15:return bj(a,b,b.type,b.pendingProps,c);case 17:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Ci(d,e),ij(a,b),b.tag=1,Zf(d)?(a=!0,cg(b)):a=!1,ch(b,c),Gi(b,d,e),Ii(b,d,e,c),jj(null,b,d,!0,a,c);case 19:return xj(a,b,c);case 22:return dj(a,b,c)}throw Error(p(156,b.tag));};function Fk(a,b){return ac(a,b)}
function $k(a,b,c,d){this.tag=a;this.key=c;this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null;this.index=0;this.ref=null;this.pendingProps=b;this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null;this.mode=d;this.subtreeFlags=this.flags=0;this.deletions=null;this.childLanes=this.lanes=0;this.alternate=null}function Bg(a,b,c,d){return new $k(a,b,c,d)}function aj(a){a=a.prototype;return!(!a||!a.isReactComponent)}
function Zk(a){if("function"===typeof a)return aj(a)?1:0;if(void 0!==a&&null!==a){a=a.$$typeof;if(a===Da)return 11;if(a===Ga)return 14}return 2}
function Pg(a,b){var c=a.alternate;null===c?(c=Bg(a.tag,b,a.key,a.mode),c.elementType=a.elementType,c.type=a.type,c.stateNode=a.stateNode,c.alternate=a,a.alternate=c):(c.pendingProps=b,c.type=a.type,c.flags=0,c.subtreeFlags=0,c.deletions=null);c.flags=a.flags&14680064;c.childLanes=a.childLanes;c.lanes=a.lanes;c.child=a.child;c.memoizedProps=a.memoizedProps;c.memoizedState=a.memoizedState;c.updateQueue=a.updateQueue;b=a.dependencies;c.dependencies=null===b?null:{lanes:b.lanes,firstContext:b.firstContext};
c.sibling=a.sibling;c.index=a.index;c.ref=a.ref;return c}
function Rg(a,b,c,d,e,f){var g=2;d=a;if("function"===typeof a)aj(a)&&(g=1);else if("string"===typeof a)g=5;else a:switch(a){case ya:return Tg(c.children,e,f,b);case za:g=8;e|=8;break;case Aa:return a=Bg(12,c,b,e|2),a.elementType=Aa,a.lanes=f,a;case Ea:return a=Bg(13,c,b,e),a.elementType=Ea,a.lanes=f,a;case Fa:return a=Bg(19,c,b,e),a.elementType=Fa,a.lanes=f,a;case Ia:return pj(c,e,f,b);default:if("object"===typeof a&&null!==a)switch(a.$$typeof){case Ba:g=10;break a;case Ca:g=9;break a;case Da:g=11;
break a;case Ga:g=14;break a;case Ha:g=16;d=null;break a}throw Error(p(130,null==a?a:typeof a,""));}b=Bg(g,c,b,e);b.elementType=a;b.type=d;b.lanes=f;return b}function Tg(a,b,c,d){a=Bg(7,a,d,b);a.lanes=c;return a}function pj(a,b,c,d){a=Bg(22,a,d,b);a.elementType=Ia;a.lanes=c;a.stateNode={isHidden:!1};return a}function Qg(a,b,c){a=Bg(6,a,null,b);a.lanes=c;return a}
function Sg(a,b,c){b=Bg(4,null!==a.children?a.children:[],a.key,b);b.lanes=c;b.stateNode={containerInfo:a.containerInfo,pendingChildren:null,implementation:a.implementation};return b}
function al(a,b,c,d,e){this.tag=b;this.containerInfo=a;this.finishedWork=this.pingCache=this.current=this.pendingChildren=null;this.timeoutHandle=-1;this.callbackNode=this.pendingContext=this.context=null;this.callbackPriority=0;this.eventTimes=zc(0);this.expirationTimes=zc(-1);this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0;this.entanglements=zc(0);this.identifierPrefix=d;this.onRecoverableError=e;this.mutableSourceEagerHydrationData=
null}function bl(a,b,c,d,e,f,g,h,k){a=new al(a,b,c,h,k);1===b?(b=1,!0===f&&(b|=8)):b=0;f=Bg(3,null,null,b);a.current=f;f.stateNode=a;f.memoizedState={element:d,isDehydrated:c,cache:null,transitions:null,pendingSuspenseBoundaries:null};kh(f);return a}function cl(a,b,c){var d=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null;return{$$typeof:wa,key:null==d?null:""+d,children:a,containerInfo:b,implementation:c}}
function dl(a){if(!a)return Vf;a=a._reactInternals;a:{if(Vb(a)!==a||1!==a.tag)throw Error(p(170));var b=a;do{switch(b.tag){case 3:b=b.stateNode.context;break a;case 1:if(Zf(b.type)){b=b.stateNode.__reactInternalMemoizedMergedChildContext;break a}}b=b.return}while(null!==b);throw Error(p(171));}if(1===a.tag){var c=a.type;if(Zf(c))return bg(a,c,b)}return b}
function el(a,b,c,d,e,f,g,h,k){a=bl(c,d,!0,a,e,f,g,h,k);a.context=dl(null);c=a.current;d=R();e=yi(c);f=mh(d,e);f.callback=void 0!==b&&null!==b?b:null;nh(c,f,e);a.current.lanes=e;Ac(a,e,d);Dk(a,d);return a}function fl(a,b,c,d){var e=b.current,f=R(),g=yi(e);c=dl(c);null===b.context?b.context=c:b.pendingContext=c;b=mh(f,g);b.payload={element:a};d=void 0===d?null:d;null!==d&&(b.callback=d);a=nh(e,b,g);null!==a&&(gi(a,e,g,f),oh(a,e,g));return g}
function gl(a){a=a.current;if(!a.child)return null;switch(a.child.tag){case 5:return a.child.stateNode;default:return a.child.stateNode}}function hl(a,b){a=a.memoizedState;if(null!==a&&null!==a.dehydrated){var c=a.retryLane;a.retryLane=0!==c&&c<b?c:b}}function il(a,b){hl(a,b);(a=a.alternate)&&hl(a,b)}function jl(){return null}var kl="function"===typeof reportError?reportError:function(a){console.error(a)};function ll(a){this._internalRoot=a}
ml.prototype.render=ll.prototype.render=function(a){var b=this._internalRoot;if(null===b)throw Error(p(409));fl(a,b,null,null)};ml.prototype.unmount=ll.prototype.unmount=function(){var a=this._internalRoot;if(null!==a){this._internalRoot=null;var b=a.containerInfo;Rk(function(){fl(null,a,null,null)});b[uf]=null}};function ml(a){this._internalRoot=a}
ml.prototype.unstable_scheduleHydration=function(a){if(a){var b=Hc();a={blockedOn:null,target:a,priority:b};for(var c=0;c<Qc.length&&0!==b&&b<Qc[c].priority;c++);Qc.splice(c,0,a);0===c&&Vc(a)}};function nl(a){return!(!a||1!==a.nodeType&&9!==a.nodeType&&11!==a.nodeType)}function ol(a){return!(!a||1!==a.nodeType&&9!==a.nodeType&&11!==a.nodeType&&(8!==a.nodeType||" react-mount-point-unstable "!==a.nodeValue))}function pl(){}
function ql(a,b,c,d,e){if(e){if("function"===typeof d){var f=d;d=function(){var a=gl(g);f.call(a)}}var g=el(b,d,a,0,null,!1,!1,"",pl);a._reactRootContainer=g;a[uf]=g.current;sf(8===a.nodeType?a.parentNode:a);Rk();return g}for(;e=a.lastChild;)a.removeChild(e);if("function"===typeof d){var h=d;d=function(){var a=gl(k);h.call(a)}}var k=bl(a,0,!1,null,null,!1,!1,"",pl);a._reactRootContainer=k;a[uf]=k.current;sf(8===a.nodeType?a.parentNode:a);Rk(function(){fl(b,k,c,d)});return k}
function rl(a,b,c,d,e){var f=c._reactRootContainer;if(f){var g=f;if("function"===typeof e){var h=e;e=function(){var a=gl(g);h.call(a)}}fl(b,g,a,e)}else g=ql(c,b,a,e,d);return gl(g)}Ec=function(a){switch(a.tag){case 3:var b=a.stateNode;if(b.current.memoizedState.isDehydrated){var c=tc(b.pendingLanes);0!==c&&(Cc(b,c|1),Dk(b,B()),0===(K&6)&&(Gj=B()+500,jg()))}break;case 13:Rk(function(){var b=ih(a,1);if(null!==b){var c=R();gi(b,a,1,c)}}),il(a,1)}};
Fc=function(a){if(13===a.tag){var b=ih(a,134217728);if(null!==b){var c=R();gi(b,a,134217728,c)}il(a,134217728)}};Gc=function(a){if(13===a.tag){var b=yi(a),c=ih(a,b);if(null!==c){var d=R();gi(c,a,b,d)}il(a,b)}};Hc=function(){return C};Ic=function(a,b){var c=C;try{return C=a,b()}finally{C=c}};
yb=function(a,b,c){switch(b){case "input":bb(a,c);b=c.name;if("radio"===c.type&&null!=b){for(c=a;c.parentNode;)c=c.parentNode;c=c.querySelectorAll("input[name="+JSON.stringify(""+b)+'][type="radio"]');for(b=0;b<c.length;b++){var d=c[b];if(d!==a&&d.form===a.form){var e=Db(d);if(!e)throw Error(p(90));Wa(d);bb(d,e)}}}break;case "textarea":ib(a,c);break;case "select":b=c.value,null!=b&&fb(a,!!c.multiple,b,!1)}};Gb=Qk;Hb=Rk;
var sl={usingClientEntryPoint:!1,Events:[Cb,ue,Db,Eb,Fb,Qk]},tl={findFiberByHostInstance:Wc,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"};
var ul={bundleType:tl.bundleType,version:tl.version,rendererPackageName:tl.rendererPackageName,rendererConfig:tl.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:ua.ReactCurrentDispatcher,findHostInstanceByFiber:function(a){a=Zb(a);return null===a?null:a.stateNode},findFiberByHostInstance:tl.findFiberByHostInstance||
jl,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if("undefined"!==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__){var vl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!vl.isDisabled&&vl.supportsFiber)try{kc=vl.inject(ul),lc=vl}catch(a){}}exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=sl;
exports.createPortal=function(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;if(!nl(b))throw Error(p(200));return cl(a,b,null,c)};exports.createRoot=function(a,b){if(!nl(a))throw Error(p(299));var c=!1,d="",e=kl;null!==b&&void 0!==b&&(!0===b.unstable_strictMode&&(c=!0),void 0!==b.identifierPrefix&&(d=b.identifierPrefix),void 0!==b.onRecoverableError&&(e=b.onRecoverableError));b=bl(a,1,!1,null,null,c,!1,d,e);a[uf]=b.current;sf(8===a.nodeType?a.parentNode:a);return new ll(b)};
exports.findDOMNode=function(a){if(null==a)return null;if(1===a.nodeType)return a;var b=a._reactInternals;if(void 0===b){if("function"===typeof a.render)throw Error(p(188));a=Object.keys(a).join(",");throw Error(p(268,a));}a=Zb(b);a=null===a?null:a.stateNode;return a};exports.flushSync=function(a){return Rk(a)};exports.hydrate=function(a,b,c){if(!ol(b))throw Error(p(200));return rl(null,a,b,!0,c)};
exports.hydrateRoot=function(a,b,c){if(!nl(a))throw Error(p(405));var d=null!=c&&c.hydratedSources||null,e=!1,f="",g=kl;null!==c&&void 0!==c&&(!0===c.unstable_strictMode&&(e=!0),void 0!==c.identifierPrefix&&(f=c.identifierPrefix),void 0!==c.onRecoverableError&&(g=c.onRecoverableError));b=el(b,null,a,1,null!=c?c:null,e,!1,f,g);a[uf]=b.current;sf(a);if(d)for(a=0;a<d.length;a++)c=d[a],e=c._getVersion,e=e(c._source),null==b.mutableSourceEagerHydrationData?b.mutableSourceEagerHydrationData=[c,e]:b.mutableSourceEagerHydrationData.push(c,
e);return new ml(b)};exports.render=function(a,b,c){if(!ol(b))throw Error(p(200));return rl(null,a,b,!1,c)};exports.unmountComponentAtNode=function(a){if(!ol(a))throw Error(p(40));return a._reactRootContainer?(Rk(function(){rl(null,null,a,!1,function(){a._reactRootContainer=null;a[uf]=null})}),!0):!1};exports.unstable_batchedUpdates=Qk;
exports.unstable_renderSubtreeIntoContainer=function(a,b,c,d){if(!ol(c))throw Error(p(200));if(null==a||void 0===a._reactInternals)throw Error(p(38));return rl(a,b,c,!1,d)};exports.version="18.3.1-next-f1338f8080-20240426";


/***/ }),

/***/ 5338:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {



var m = __webpack_require__(961);
if (true) {
  exports.createRoot = m.createRoot;
  exports.hydrateRoot = m.hydrateRoot;
} else { var i; }


/***/ }),

/***/ 961:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



function checkDCE() {
  /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
  if (
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function'
  ) {
    return;
  }
  if (false) {}
  try {
    // Verify that the code above has been dead code eliminated (DCE'd).
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
  } catch (err) {
    // DevTools shouldn't crash React, no matter what.
    // We should still report in case we break this code.
    console.error(err);
  }
}

if (true) {
  // DCE check should happen before ReactDOM bundle executes so that
  // DevTools can report bad minification during injection.
  checkDCE();
  module.exports = __webpack_require__(2551);
} else {}


/***/ }),

/***/ 1020:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f=__webpack_require__(6540),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};
function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return{$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}exports.Fragment=l;exports.jsx=q;exports.jsxs=q;


/***/ }),

/***/ 5287:
/***/ ((__unused_webpack_module, exports) => {

/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var l=Symbol.for("react.element"),n=Symbol.for("react.portal"),p=Symbol.for("react.fragment"),q=Symbol.for("react.strict_mode"),r=Symbol.for("react.profiler"),t=Symbol.for("react.provider"),u=Symbol.for("react.context"),v=Symbol.for("react.forward_ref"),w=Symbol.for("react.suspense"),x=Symbol.for("react.memo"),y=Symbol.for("react.lazy"),z=Symbol.iterator;function A(a){if(null===a||"object"!==typeof a)return null;a=z&&a[z]||a["@@iterator"];return"function"===typeof a?a:null}
var B={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},C=Object.assign,D={};function E(a,b,e){this.props=a;this.context=b;this.refs=D;this.updater=e||B}E.prototype.isReactComponent={};
E.prototype.setState=function(a,b){if("object"!==typeof a&&"function"!==typeof a&&null!=a)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,a,b,"setState")};E.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate")};function F(){}F.prototype=E.prototype;function G(a,b,e){this.props=a;this.context=b;this.refs=D;this.updater=e||B}var H=G.prototype=new F;
H.constructor=G;C(H,E.prototype);H.isPureReactComponent=!0;var I=Array.isArray,J=Object.prototype.hasOwnProperty,K={current:null},L={key:!0,ref:!0,__self:!0,__source:!0};
function M(a,b,e){var d,c={},k=null,h=null;if(null!=b)for(d in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(k=""+b.key),b)J.call(b,d)&&!L.hasOwnProperty(d)&&(c[d]=b[d]);var g=arguments.length-2;if(1===g)c.children=e;else if(1<g){for(var f=Array(g),m=0;m<g;m++)f[m]=arguments[m+2];c.children=f}if(a&&a.defaultProps)for(d in g=a.defaultProps,g)void 0===c[d]&&(c[d]=g[d]);return{$$typeof:l,type:a,key:k,ref:h,props:c,_owner:K.current}}
function N(a,b){return{$$typeof:l,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}}function O(a){return"object"===typeof a&&null!==a&&a.$$typeof===l}function escape(a){var b={"=":"=0",":":"=2"};return"$"+a.replace(/[=:]/g,function(a){return b[a]})}var P=/\/+/g;function Q(a,b){return"object"===typeof a&&null!==a&&null!=a.key?escape(""+a.key):b.toString(36)}
function R(a,b,e,d,c){var k=typeof a;if("undefined"===k||"boolean"===k)a=null;var h=!1;if(null===a)h=!0;else switch(k){case "string":case "number":h=!0;break;case "object":switch(a.$$typeof){case l:case n:h=!0}}if(h)return h=a,c=c(h),a=""===d?"."+Q(h,0):d,I(c)?(e="",null!=a&&(e=a.replace(P,"$&/")+"/"),R(c,b,e,"",function(a){return a})):null!=c&&(O(c)&&(c=N(c,e+(!c.key||h&&h.key===c.key?"":(""+c.key).replace(P,"$&/")+"/")+a)),b.push(c)),1;h=0;d=""===d?".":d+":";if(I(a))for(var g=0;g<a.length;g++){k=
a[g];var f=d+Q(k,g);h+=R(k,b,e,f,c)}else if(f=A(a),"function"===typeof f)for(a=f.call(a),g=0;!(k=a.next()).done;)k=k.value,f=d+Q(k,g++),h+=R(k,b,e,f,c);else if("object"===k)throw b=String(a),Error("Objects are not valid as a React child (found: "+("[object Object]"===b?"object with keys {"+Object.keys(a).join(", ")+"}":b)+"). If you meant to render a collection of children, use an array instead.");return h}
function S(a,b,e){if(null==a)return a;var d=[],c=0;R(a,d,"","",function(a){return b.call(e,a,c++)});return d}function T(a){if(-1===a._status){var b=a._result;b=b();b.then(function(b){if(0===a._status||-1===a._status)a._status=1,a._result=b},function(b){if(0===a._status||-1===a._status)a._status=2,a._result=b});-1===a._status&&(a._status=0,a._result=b)}if(1===a._status)return a._result.default;throw a._result;}
var U={current:null},V={transition:null},W={ReactCurrentDispatcher:U,ReactCurrentBatchConfig:V,ReactCurrentOwner:K};function X(){throw Error("act(...) is not supported in production builds of React.");}
exports.Children={map:S,forEach:function(a,b,e){S(a,function(){b.apply(this,arguments)},e)},count:function(a){var b=0;S(a,function(){b++});return b},toArray:function(a){return S(a,function(a){return a})||[]},only:function(a){if(!O(a))throw Error("React.Children.only expected to receive a single React element child.");return a}};exports.Component=E;exports.Fragment=p;exports.Profiler=r;exports.PureComponent=G;exports.StrictMode=q;exports.Suspense=w;
exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=W;exports.act=X;
exports.cloneElement=function(a,b,e){if(null===a||void 0===a)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+a+".");var d=C({},a.props),c=a.key,k=a.ref,h=a._owner;if(null!=b){void 0!==b.ref&&(k=b.ref,h=K.current);void 0!==b.key&&(c=""+b.key);if(a.type&&a.type.defaultProps)var g=a.type.defaultProps;for(f in b)J.call(b,f)&&!L.hasOwnProperty(f)&&(d[f]=void 0===b[f]&&void 0!==g?g[f]:b[f])}var f=arguments.length-2;if(1===f)d.children=e;else if(1<f){g=Array(f);
for(var m=0;m<f;m++)g[m]=arguments[m+2];d.children=g}return{$$typeof:l,type:a.type,key:c,ref:k,props:d,_owner:h}};exports.createContext=function(a){a={$$typeof:u,_currentValue:a,_currentValue2:a,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null};a.Provider={$$typeof:t,_context:a};return a.Consumer=a};exports.createElement=M;exports.createFactory=function(a){var b=M.bind(null,a);b.type=a;return b};exports.createRef=function(){return{current:null}};
exports.forwardRef=function(a){return{$$typeof:v,render:a}};exports.isValidElement=O;exports.lazy=function(a){return{$$typeof:y,_payload:{_status:-1,_result:a},_init:T}};exports.memo=function(a,b){return{$$typeof:x,type:a,compare:void 0===b?null:b}};exports.startTransition=function(a){var b=V.transition;V.transition={};try{a()}finally{V.transition=b}};exports.unstable_act=X;exports.useCallback=function(a,b){return U.current.useCallback(a,b)};exports.useContext=function(a){return U.current.useContext(a)};
exports.useDebugValue=function(){};exports.useDeferredValue=function(a){return U.current.useDeferredValue(a)};exports.useEffect=function(a,b){return U.current.useEffect(a,b)};exports.useId=function(){return U.current.useId()};exports.useImperativeHandle=function(a,b,e){return U.current.useImperativeHandle(a,b,e)};exports.useInsertionEffect=function(a,b){return U.current.useInsertionEffect(a,b)};exports.useLayoutEffect=function(a,b){return U.current.useLayoutEffect(a,b)};
exports.useMemo=function(a,b){return U.current.useMemo(a,b)};exports.useReducer=function(a,b,e){return U.current.useReducer(a,b,e)};exports.useRef=function(a){return U.current.useRef(a)};exports.useState=function(a){return U.current.useState(a)};exports.useSyncExternalStore=function(a,b,e){return U.current.useSyncExternalStore(a,b,e)};exports.useTransition=function(){return U.current.useTransition()};exports.version="18.3.1";


/***/ }),

/***/ 6540:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (true) {
  module.exports = __webpack_require__(5287);
} else {}


/***/ }),

/***/ 4848:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (true) {
  module.exports = __webpack_require__(1020);
} else {}


/***/ }),

/***/ 1488:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AbsoluteFill = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const AbsoluteFillRefForwarding = (props, ref) => {
    const { style, ...other } = props;
    const actualStyle = (0, react_1.useMemo)(() => {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            ...style,
        };
    }, [style]);
    return (0, jsx_runtime_1.jsx)("div", { ref: ref, style: actualStyle, ...other });
};
/**
 * @description An absolutely positioned <div> element with 100% width, height, and a column flex style
 * @see [Documentation](https://www.remotion.dev/docs/absolute-fill)
 */
exports.AbsoluteFill = (0, react_1.forwardRef)(AbsoluteFillRefForwarding);


/***/ }),

/***/ 5998:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Artifact = void 0;
const react_1 = __webpack_require__(6540);
const RenderAssetManager_1 = __webpack_require__(599);
const get_remotion_environment_1 = __webpack_require__(7356);
const use_current_frame_1 = __webpack_require__(1041);
const Artifact = ({ filename, content }) => {
    const { registerRenderAsset, unregisterRenderAsset } = (0, react_1.useContext)(RenderAssetManager_1.RenderAssetManager);
    const [env] = (0, react_1.useState)(() => (0, get_remotion_environment_1.getRemotionEnvironment)());
    const frame = (0, use_current_frame_1.useCurrentFrame)();
    const [id] = (0, react_1.useState)(() => {
        return String(Math.random());
    });
    (0, react_1.useEffect)(() => {
        if (!env.isRendering) {
            return;
        }
        if (content instanceof Uint8Array) {
            registerRenderAsset({
                type: 'artifact',
                id,
                content: btoa(new TextDecoder('utf8').decode(content)),
                filename,
                frame,
                binary: true,
            });
        }
        else {
            registerRenderAsset({
                type: 'artifact',
                id,
                content,
                filename,
                frame,
                binary: false,
            });
        }
        return () => {
            return unregisterRenderAsset(id);
        };
    }, [
        content,
        env.isRendering,
        filename,
        frame,
        id,
        registerRenderAsset,
        unregisterRenderAsset,
    ]);
    return null;
};
exports.Artifact = Artifact;


/***/ }),

/***/ 5108:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CanUseRemotionHooksProvider = exports.CanUseRemotionHooks = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
exports.CanUseRemotionHooks = (0, react_1.createContext)(false);
const CanUseRemotionHooksProvider = ({ children }) => {
    return ((0, jsx_runtime_1.jsx)(exports.CanUseRemotionHooks.Provider, { value: true, children: children }));
};
exports.CanUseRemotionHooksProvider = CanUseRemotionHooksProvider;


/***/ }),

/***/ 4411:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Clipper = void 0;
/**
 * @deprecated <Clipper> has been removed as of Remotion v4.0.228. The native clipping APIs were experimental and subject to removal at any time. We removed them because they were sparingly used and made rendering often slower rather than faster.
 */
const Clipper = () => {
    throw new Error('<Clipper> has been removed as of Remotion v4.0.228. The native clipping APIs were experimental and subject to removal at any time. We removed them because they were sparingly used and made rendering often slower rather than faster.');
};
exports.Clipper = Clipper;


/***/ }),

/***/ 2040:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Composition = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const react_dom_1 = __webpack_require__(961);
const CanUseRemotionHooks_js_1 = __webpack_require__(5108);
const CompositionManagerContext_js_1 = __webpack_require__(9126);
const Folder_js_1 = __webpack_require__(5236);
const ResolveCompositionConfig_js_1 = __webpack_require__(7240);
const delay_render_js_1 = __webpack_require__(1006);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const input_props_serialization_js_1 = __webpack_require__(4532);
const is_player_js_1 = __webpack_require__(5516);
const loading_indicator_js_1 = __webpack_require__(7346);
const nonce_js_1 = __webpack_require__(2501);
const portal_node_js_1 = __webpack_require__(2159);
const use_lazy_component_js_1 = __webpack_require__(4534);
const use_video_js_1 = __webpack_require__(3523);
const validate_composition_id_js_1 = __webpack_require__(1969);
const validate_default_props_js_1 = __webpack_require__(4127);
const Fallback = () => {
    (0, react_1.useEffect)(() => {
        const fallback = (0, delay_render_js_1.delayRender)('Waiting for Root component to unsuspend');
        return () => (0, delay_render_js_1.continueRender)(fallback);
    }, []);
    return null;
};
/**
 * @description This component is used to register a video to make it renderable and make it show in the sidebar, in dev mode.
 * @see [Documentation](https://www.remotion.dev/docs/composition)
 */
const Composition = ({ width, height, fps, durationInFrames, id, defaultProps, schema, ...compProps }) => {
    var _a, _b;
    const { registerComposition, unregisterComposition } = (0, react_1.useContext)(CompositionManagerContext_js_1.CompositionManager);
    const video = (0, use_video_js_1.useVideo)();
    const lazy = (0, use_lazy_component_js_1.useLazyComponent)(compProps);
    const nonce = (0, nonce_js_1.useNonce)();
    const isPlayer = (0, is_player_js_1.useIsPlayer)();
    const environment = (0, get_remotion_environment_js_1.getRemotionEnvironment)();
    const canUseComposition = (0, react_1.useContext)(CanUseRemotionHooks_js_1.CanUseRemotionHooks);
    if (canUseComposition) {
        if (isPlayer) {
            throw new Error('<Composition> was mounted inside the `component` that was passed to the <Player>. See https://remotion.dev/docs/wrong-composition-mount for help.');
        }
        throw new Error('<Composition> mounted inside another composition. See https://remotion.dev/docs/wrong-composition-mount for help.');
    }
    const { folderName, parentName } = (0, react_1.useContext)(Folder_js_1.FolderContext);
    (0, react_1.useEffect)(() => {
        var _a;
        // Ensure it's a URL safe id
        if (!id) {
            throw new Error('No id for composition passed.');
        }
        (0, validate_composition_id_js_1.validateCompositionId)(id);
        (0, validate_default_props_js_1.validateDefaultAndInputProps)(defaultProps, 'defaultProps', id);
        registerComposition({
            durationInFrames: durationInFrames !== null && durationInFrames !== void 0 ? durationInFrames : undefined,
            fps: fps !== null && fps !== void 0 ? fps : undefined,
            height: height !== null && height !== void 0 ? height : undefined,
            width: width !== null && width !== void 0 ? width : undefined,
            id,
            folderName,
            component: lazy,
            defaultProps: (0, input_props_serialization_js_1.serializeThenDeserializeInStudio)((defaultProps !== null && defaultProps !== void 0 ? defaultProps : {})),
            nonce,
            parentFolderName: parentName,
            schema: schema !== null && schema !== void 0 ? schema : null,
            calculateMetadata: (_a = compProps.calculateMetadata) !== null && _a !== void 0 ? _a : null,
        });
        return () => {
            unregisterComposition(id);
        };
    }, [
        durationInFrames,
        fps,
        height,
        lazy,
        id,
        folderName,
        defaultProps,
        registerComposition,
        unregisterComposition,
        width,
        nonce,
        parentName,
        schema,
        compProps.calculateMetadata,
    ]);
    const resolved = (0, ResolveCompositionConfig_js_1.useResolvedVideoConfig)(id);
    if (environment.isStudio && video && video.component === lazy) {
        const Comp = lazy;
        if (resolved === null || resolved.type !== 'success') {
            return null;
        }
        return (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsx)(CanUseRemotionHooks_js_1.CanUseRemotionHooksProvider, { children: (0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)(loading_indicator_js_1.Loading, {}), children: (0, jsx_runtime_1.jsx)(Comp, { ...((_a = resolved.result.props) !== null && _a !== void 0 ? _a : {}) }) }) }), (0, portal_node_js_1.portalNode)());
    }
    if (environment.isRendering && video && video.component === lazy) {
        const Comp = lazy;
        if (resolved === null || resolved.type !== 'success') {
            return null;
        }
        return (0, react_dom_1.createPortal)((0, jsx_runtime_1.jsx)(CanUseRemotionHooks_js_1.CanUseRemotionHooksProvider, { children: (0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)(Fallback, {}), children: (0, jsx_runtime_1.jsx)(Comp, { ...((_b = resolved.result.props) !== null && _b !== void 0 ? _b : {}) }) }) }), (0, portal_node_js_1.portalNode)());
    }
    return null;
};
exports.Composition = Composition;


/***/ }),

/***/ 477:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompositionManagerProvider = exports.compositionsRef = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __importStar(__webpack_require__(6540));
const CompositionManagerContext_js_1 = __webpack_require__(9126);
const RenderAssetManager_js_1 = __webpack_require__(599);
const ResolveCompositionConfig_js_1 = __webpack_require__(7240);
const SequenceManager_js_1 = __webpack_require__(9962);
const shared_audio_tags_js_1 = __webpack_require__(4103);
exports.compositionsRef = react_1.default.createRef();
const CompositionManagerProvider = ({ children, numberOfAudioTags }) => {
    var _a;
    // Wontfix, expected to have
    const [compositions, setCompositions] = (0, react_1.useState)([]);
    const currentcompositionsRef = (0, react_1.useRef)(compositions);
    const [folders, setFolders] = (0, react_1.useState)([]);
    const [canvasContent, setCanvasContent] = (0, react_1.useState)(null);
    const [currentCompositionMetadata, setCurrentCompositionMetadata] = (0, react_1.useState)(null);
    const updateCompositions = (0, react_1.useCallback)((updateComps) => {
        setCompositions((comps) => {
            const updated = updateComps(comps);
            currentcompositionsRef.current = updated;
            return updated;
        });
    }, []);
    const registerComposition = (0, react_1.useCallback)((comp) => {
        updateCompositions((comps) => {
            if (comps.find((c) => c.id === comp.id)) {
                throw new Error(`Multiple composition with id ${comp.id} are registered.`);
            }
            const value = [...comps, comp]
                .slice()
                .sort((a, b) => a.nonce - b.nonce);
            return value;
        });
    }, [updateCompositions]);
    const unregisterComposition = (0, react_1.useCallback)((id) => {
        setCompositions((comps) => {
            return comps.filter((c) => c.id !== id);
        });
    }, []);
    const registerFolder = (0, react_1.useCallback)((name, parent) => {
        setFolders((prevFolders) => {
            return [
                ...prevFolders,
                {
                    name,
                    parent,
                },
            ];
        });
    }, []);
    const unregisterFolder = (0, react_1.useCallback)((name, parent) => {
        setFolders((prevFolders) => {
            return prevFolders.filter((p) => !(p.name === name && p.parent === parent));
        });
    }, []);
    (0, react_1.useImperativeHandle)(exports.compositionsRef, () => {
        return {
            getCompositions: () => currentcompositionsRef.current,
        };
    }, []);
    const composition = compositions.find((c) => (canvasContent === null || canvasContent === void 0 ? void 0 : canvasContent.type) === 'composition'
        ? c.id === canvasContent.compositionId
        : null);
    const updateCompositionDefaultProps = (0, react_1.useCallback)((id, newDefaultProps) => {
        setCompositions((comps) => {
            const updated = comps.map((c) => {
                if (c.id === id) {
                    return {
                        ...c,
                        defaultProps: newDefaultProps,
                    };
                }
                return c;
            });
            return updated;
        });
    }, []);
    const contextValue = (0, react_1.useMemo)(() => {
        return {
            compositions,
            registerComposition,
            unregisterComposition,
            folders,
            registerFolder,
            unregisterFolder,
            currentCompositionMetadata,
            setCurrentCompositionMetadata,
            canvasContent,
            setCanvasContent,
            updateCompositionDefaultProps,
        };
    }, [
        compositions,
        registerComposition,
        unregisterComposition,
        folders,
        registerFolder,
        unregisterFolder,
        currentCompositionMetadata,
        canvasContent,
        updateCompositionDefaultProps,
    ]);
    return ((0, jsx_runtime_1.jsx)(CompositionManagerContext_js_1.CompositionManager.Provider, { value: contextValue, children: (0, jsx_runtime_1.jsx)(SequenceManager_js_1.SequenceManagerProvider, { children: (0, jsx_runtime_1.jsx)(RenderAssetManager_js_1.RenderAssetManagerProvider, { children: (0, jsx_runtime_1.jsx)(ResolveCompositionConfig_js_1.ResolveCompositionConfig, { children: (0, jsx_runtime_1.jsx)(shared_audio_tags_js_1.SharedAudioContextProvider, { numberOfAudioTags: numberOfAudioTags, component: (_a = composition === null || composition === void 0 ? void 0 : composition.component) !== null && _a !== void 0 ? _a : null, children: children }) }) }) }) }));
};
exports.CompositionManagerProvider = CompositionManagerProvider;


/***/ }),

/***/ 9126:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompositionManager = void 0;
const react_1 = __webpack_require__(6540);
exports.CompositionManager = (0, react_1.createContext)({
    compositions: [],
    registerComposition: () => undefined,
    unregisterComposition: () => undefined,
    registerFolder: () => undefined,
    unregisterFolder: () => undefined,
    setCurrentCompositionMetadata: () => undefined,
    updateCompositionDefaultProps: () => undefined,
    folders: [],
    currentCompositionMetadata: null,
    canvasContent: null,
    setCanvasContent: () => undefined,
});


/***/ }),

/***/ 5963:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EditorPropsProvider = exports.editorPropsProviderRef = exports.EditorPropsContext = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __importStar(__webpack_require__(6540));
exports.EditorPropsContext = (0, react_1.createContext)({
    props: {},
    updateProps: () => {
        throw new Error('Not implemented');
    },
    resetUnsaved: () => {
        throw new Error('Not implemented');
    },
});
exports.editorPropsProviderRef = react_1.default.createRef();
const EditorPropsProvider = ({ children }) => {
    const [props, setProps] = react_1.default.useState({});
    const updateProps = (0, react_1.useCallback)(({ defaultProps, id, newProps, }) => {
        setProps((prev) => {
            var _a;
            return {
                ...prev,
                [id]: typeof newProps === 'function'
                    ? newProps((_a = prev[id]) !== null && _a !== void 0 ? _a : defaultProps)
                    : newProps,
            };
        });
    }, []);
    const resetUnsaved = (0, react_1.useCallback)(() => {
        setProps({});
    }, []);
    (0, react_1.useImperativeHandle)(exports.editorPropsProviderRef, () => {
        return {
            getProps: () => props,
            setProps,
        };
    }, [props]);
    const ctx = (0, react_1.useMemo)(() => {
        return { props, updateProps, resetUnsaved };
    }, [props, resetUnsaved, updateProps]);
    return ((0, jsx_runtime_1.jsx)(exports.EditorPropsContext.Provider, { value: ctx, children: children }));
};
exports.EditorPropsProvider = EditorPropsProvider;


/***/ }),

/***/ 5236:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Folder = exports.FolderContext = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const CompositionManagerContext_js_1 = __webpack_require__(9126);
const truthy_js_1 = __webpack_require__(108);
const validate_folder_name_js_1 = __webpack_require__(3613);
exports.FolderContext = (0, react_1.createContext)({
    folderName: null,
    parentName: null,
});
/**
 * @description By wrapping a <Composition /> inside a <Folder />, you can visually categorize it in your sidebar, should you have many compositions.
 * @see [Documentation](https://www.remotion.dev/docs/folder)
 */
const Folder = ({ name, children }) => {
    const parent = (0, react_1.useContext)(exports.FolderContext);
    const { registerFolder, unregisterFolder } = (0, react_1.useContext)(CompositionManagerContext_js_1.CompositionManager);
    (0, validate_folder_name_js_1.validateFolderName)(name);
    const parentNameArr = [parent.parentName, parent.folderName].filter(truthy_js_1.truthy);
    const parentName = parentNameArr.length === 0 ? null : parentNameArr.join('/');
    const value = (0, react_1.useMemo)(() => {
        return {
            folderName: name,
            parentName,
        };
    }, [name, parentName]);
    (0, react_1.useEffect)(() => {
        registerFolder(name, parentName);
        return () => {
            unregisterFolder(name, parentName);
        };
    }, [name, parent.folderName, parentName, registerFolder, unregisterFolder]);
    return ((0, jsx_runtime_1.jsx)(exports.FolderContext.Provider, { value: value, children: children }));
};
exports.Folder = Folder;


/***/ }),

/***/ 7388:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IFrame = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const delay_render_js_1 = __webpack_require__(1006);
const IFrameRefForwarding = ({ onLoad, onError, delayRenderRetries, delayRenderTimeoutInMilliseconds, ...props }, ref) => {
    const [handle] = (0, react_1.useState)(() => (0, delay_render_js_1.delayRender)(`Loading <IFrame> with source ${props.src}`, {
        retries: delayRenderRetries !== null && delayRenderRetries !== void 0 ? delayRenderRetries : undefined,
        timeoutInMilliseconds: delayRenderTimeoutInMilliseconds !== null && delayRenderTimeoutInMilliseconds !== void 0 ? delayRenderTimeoutInMilliseconds : undefined,
    }));
    const didLoad = (0, react_1.useCallback)((e) => {
        (0, delay_render_js_1.continueRender)(handle);
        onLoad === null || onLoad === void 0 ? void 0 : onLoad(e);
    }, [handle, onLoad]);
    const didGetError = (0, react_1.useCallback)((e) => {
        (0, delay_render_js_1.continueRender)(handle);
        if (onError) {
            onError(e);
        }
        else {
            // eslint-disable-next-line no-console
            console.error('Error loading iframe:', e, 'Handle the event using the onError() prop to make this message disappear.');
        }
    }, [handle, onError]);
    return (0, jsx_runtime_1.jsx)("iframe", { ...props, ref: ref, onError: didGetError, onLoad: didLoad });
};
/**
 * @description The <IFrame /> can be used like a regular <iframe> HTML tag.
 * @see [Documentation](https://www.remotion.dev/docs/iframe)
 */
exports.IFrame = (0, react_1.forwardRef)(IFrameRefForwarding);


/***/ }),

/***/ 6669:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Img = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const SequenceContext_js_1 = __webpack_require__(3822);
const cancel_render_js_1 = __webpack_require__(8439);
const delay_render_js_1 = __webpack_require__(1006);
const prefetch_js_1 = __webpack_require__(1011);
const use_buffer_state_js_1 = __webpack_require__(204);
function exponentialBackoff(errorCount) {
    return 1000 * 2 ** (errorCount - 1);
}
const ImgRefForwarding = ({ onError, maxRetries = 2, src, pauseWhenLoading, delayRenderRetries, delayRenderTimeoutInMilliseconds, onImageFrame, ...props }, ref) => {
    const imageRef = (0, react_1.useRef)(null);
    const errors = (0, react_1.useRef)({});
    const { delayPlayback } = (0, use_buffer_state_js_1.useBufferState)();
    const sequenceContext = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    if (!src) {
        throw new Error('No "src" prop was passed to <Img>.');
    }
    (0, react_1.useImperativeHandle)(ref, () => {
        return imageRef.current;
    }, []);
    const actualSrc = (0, prefetch_js_1.usePreload)(src);
    const retryIn = (0, react_1.useCallback)((timeout) => {
        if (!imageRef.current) {
            return;
        }
        const currentSrc = imageRef.current.src;
        setTimeout(() => {
            var _a;
            if (!imageRef.current) {
                // Component has been unmounted, do not retry
                return;
            }
            const newSrc = (_a = imageRef.current) === null || _a === void 0 ? void 0 : _a.src;
            if (newSrc !== currentSrc) {
                // src has changed, do not retry
                return;
            }
            imageRef.current.removeAttribute('src');
            imageRef.current.setAttribute('src', newSrc);
        }, timeout);
    }, []);
    const didGetError = (0, react_1.useCallback)((e) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        if (!errors.current) {
            return;
        }
        errors.current[(_a = imageRef.current) === null || _a === void 0 ? void 0 : _a.src] =
            ((_c = errors.current[(_b = imageRef.current) === null || _b === void 0 ? void 0 : _b.src]) !== null && _c !== void 0 ? _c : 0) + 1;
        if (onError &&
            ((_e = errors.current[(_d = imageRef.current) === null || _d === void 0 ? void 0 : _d.src]) !== null && _e !== void 0 ? _e : 0) > maxRetries) {
            onError(e);
            return;
        }
        if (((_g = errors.current[(_f = imageRef.current) === null || _f === void 0 ? void 0 : _f.src]) !== null && _g !== void 0 ? _g : 0) <= maxRetries) {
            const backoff = exponentialBackoff((_j = errors.current[(_h = imageRef.current) === null || _h === void 0 ? void 0 : _h.src]) !== null && _j !== void 0 ? _j : 0);
            // eslint-disable-next-line no-console
            console.warn(`Could not load image with source ${(_k = imageRef.current) === null || _k === void 0 ? void 0 : _k.src}, retrying again in ${backoff}ms`);
            retryIn(backoff);
            return;
        }
        (0, cancel_render_js_1.cancelRender)('Error loading image with src: ' + ((_l = imageRef.current) === null || _l === void 0 ? void 0 : _l.src));
    }, [maxRetries, onError, retryIn]);
    if (typeof window !== 'undefined') {
        const isPremounting = Boolean(sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.premounting);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        (0, react_1.useLayoutEffect)(() => {
            var _a, _b;
            if (((_b = (_a = window.process) === null || _a === void 0 ? void 0 : _a.env) === null || _b === void 0 ? void 0 : _b.NODE_ENV) === 'test') {
                if (imageRef.current) {
                    imageRef.current.src = actualSrc;
                }
                return;
            }
            const { current } = imageRef;
            if (!current) {
                return;
            }
            const newHandle = (0, delay_render_js_1.delayRender)('Loading <Img> with src=' + actualSrc, {
                retries: delayRenderRetries !== null && delayRenderRetries !== void 0 ? delayRenderRetries : undefined,
                timeoutInMilliseconds: delayRenderTimeoutInMilliseconds !== null && delayRenderTimeoutInMilliseconds !== void 0 ? delayRenderTimeoutInMilliseconds : undefined,
            });
            const unblock = pauseWhenLoading && !isPremounting
                ? delayPlayback().unblock
                : () => undefined;
            let unmounted = false;
            const onComplete = () => {
                var _a, _b, _c, _d;
                // the decode() promise isn't cancelable -- it may still resolve after unmounting
                if (unmounted) {
                    (0, delay_render_js_1.continueRender)(newHandle);
                    return;
                }
                if (((_b = errors.current[(_a = imageRef.current) === null || _a === void 0 ? void 0 : _a.src]) !== null && _b !== void 0 ? _b : 0) > 0) {
                    delete errors.current[(_c = imageRef.current) === null || _c === void 0 ? void 0 : _c.src];
                    // eslint-disable-next-line no-console
                    console.info(`Retry successful - ${(_d = imageRef.current) === null || _d === void 0 ? void 0 : _d.src} is now loaded`);
                }
                if (current) {
                    onImageFrame === null || onImageFrame === void 0 ? void 0 : onImageFrame(current);
                }
                unblock();
                (0, delay_render_js_1.continueRender)(newHandle);
            };
            if (!imageRef.current) {
                onComplete();
                return;
            }
            current.src = actualSrc;
            if (current.complete) {
                onComplete();
            }
            else {
                current
                    .decode()
                    .then(onComplete)
                    .catch((err) => {
                    // fall back to onload event if decode() fails
                    // eslint-disable-next-line no-console
                    console.warn(err);
                    if (current.complete) {
                        onComplete();
                    }
                    else {
                        current.addEventListener('load', onComplete);
                    }
                });
            }
            // If tag gets unmounted, clear pending handles because image is not going to load
            return () => {
                unmounted = true;
                current.removeEventListener('load', onComplete);
                unblock();
                (0, delay_render_js_1.continueRender)(newHandle);
            };
        }, [
            actualSrc,
            delayPlayback,
            delayRenderRetries,
            delayRenderTimeoutInMilliseconds,
            pauseWhenLoading,
            isPremounting,
            onImageFrame,
        ]);
    }
    // src gets set once we've loaded and decoded the image.
    return (0, jsx_runtime_1.jsx)("img", { ...props, ref: imageRef, onError: didGetError });
};
/**
 * @description Works just like a regular HTML img tag. When you use the <Img> tag, Remotion will ensure that the image is loaded before rendering the frame.
 * @see [Documentation](https://www.remotion.dev/docs/img)
 */
exports.Img = (0, react_1.forwardRef)(ImgRefForwarding);


/***/ }),

/***/ 3017:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Null = void 0;
/**
 * @deprecated <Null /> has been removed as of Remotion v4.0.228. The native clipping APIs were experimental and subject to removal at any time. We removed them because they were sparingly used and made rendering often slower rather than faster.
 */
const Null = () => {
    throw new Error('<Null> has been removed as of Remotion v4.0.228. The native clipping APIs were experimental and subject to removal at any time. We removed them because they were sparingly used and made rendering often slower rather than faster.');
};
exports.Null = Null;


/***/ }),

/***/ 7407:
/***/ ((module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RemotionRoot = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const CompositionManager_js_1 = __webpack_require__(477);
const EditorProps_js_1 = __webpack_require__(5963);
const buffering_js_1 = __webpack_require__(9076);
const delay_render_js_1 = __webpack_require__(1006);
const nonce_js_1 = __webpack_require__(2501);
const prefetch_state_js_1 = __webpack_require__(2171);
const random_js_1 = __webpack_require__(5923);
const timeline_position_state_js_1 = __webpack_require__(8019);
const duration_state_js_1 = __webpack_require__(1152);
const RemotionRoot = ({ children, numberOfAudioTags }) => {
    const [remotionRootId] = (0, react_1.useState)(() => String((0, random_js_1.random)(null)));
    const [frame, setFrame] = (0, react_1.useState)(() => (0, timeline_position_state_js_1.getInitialFrameState)());
    const [playing, setPlaying] = (0, react_1.useState)(false);
    const imperativePlaying = (0, react_1.useRef)(false);
    const [fastRefreshes, setFastRefreshes] = (0, react_1.useState)(0);
    const [playbackRate, setPlaybackRate] = (0, react_1.useState)(1);
    const audioAndVideoTags = (0, react_1.useRef)([]);
    if (typeof window !== 'undefined') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        (0, react_1.useLayoutEffect)(() => {
            window.remotion_setFrame = (f, composition, attempt) => {
                window.remotion_attempt = attempt;
                const id = (0, delay_render_js_1.delayRender)(`Setting the current frame to ${f}`);
                let asyncUpdate = true;
                setFrame((s) => {
                    var _a;
                    const currentFrame = (_a = s[composition]) !== null && _a !== void 0 ? _a : window.remotion_initialFrame;
                    // Avoid cloning the object
                    if (currentFrame === f) {
                        asyncUpdate = false;
                        return s;
                    }
                    return {
                        ...s,
                        [composition]: f,
                    };
                });
                // After setting the state, need to wait until it is applied in the next cycle
                if (asyncUpdate) {
                    requestAnimationFrame(() => (0, delay_render_js_1.continueRender)(id));
                }
                else {
                    (0, delay_render_js_1.continueRender)(id);
                }
            };
            window.remotion_isPlayer = false;
        }, []);
    }
    const timelineContextValue = (0, react_1.useMemo)(() => {
        return {
            frame,
            playing,
            imperativePlaying,
            rootId: remotionRootId,
            playbackRate,
            setPlaybackRate,
            audioAndVideoTags,
        };
    }, [frame, playbackRate, playing, remotionRootId]);
    const setTimelineContextValue = (0, react_1.useMemo)(() => {
        return {
            setFrame,
            setPlaying,
        };
    }, []);
    const nonceContext = (0, react_1.useMemo)(() => {
        let counter = 0;
        return {
            getNonce: () => counter++,
            fastRefreshes,
        };
    }, [fastRefreshes]);
    (0, react_1.useEffect)(() => {
        if (true) {
            if (module.hot) {
                module.hot.addStatusHandler((status) => {
                    if (status === 'idle') {
                        setFastRefreshes((i) => i + 1);
                    }
                });
            }
        }
    }, []);
    return ((0, jsx_runtime_1.jsx)(nonce_js_1.NonceContext.Provider, { value: nonceContext, children: (0, jsx_runtime_1.jsx)(timeline_position_state_js_1.TimelineContext.Provider, { value: timelineContextValue, children: (0, jsx_runtime_1.jsx)(timeline_position_state_js_1.SetTimelineContext.Provider, { value: setTimelineContextValue, children: (0, jsx_runtime_1.jsx)(EditorProps_js_1.EditorPropsProvider, { children: (0, jsx_runtime_1.jsx)(prefetch_state_js_1.PrefetchProvider, { children: (0, jsx_runtime_1.jsx)(CompositionManager_js_1.CompositionManagerProvider, { numberOfAudioTags: numberOfAudioTags, children: (0, jsx_runtime_1.jsx)(duration_state_js_1.DurationsContextProvider, { children: (0, jsx_runtime_1.jsx)(buffering_js_1.BufferingProvider, { children: children }) }) }) }) }) }) }) }));
};
exports.RemotionRoot = RemotionRoot;


/***/ }),

/***/ 599:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RenderAssetManagerProvider = exports.RenderAssetManager = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const validate_artifact_js_1 = __webpack_require__(803);
exports.RenderAssetManager = (0, react_1.createContext)({
    // Must be undefined, otherwise error in Player
    registerRenderAsset: () => undefined,
    unregisterRenderAsset: () => undefined,
    renderAssets: [],
});
const RenderAssetManagerProvider = ({ children }) => {
    const [renderAssets, setRenderAssets] = (0, react_1.useState)([]);
    const registerRenderAsset = (0, react_1.useCallback)((renderAsset) => {
        (0, validate_artifact_js_1.validateRenderAsset)(renderAsset);
        setRenderAssets((assets) => {
            return [...assets, renderAsset];
        });
    }, []);
    const unregisterRenderAsset = (0, react_1.useCallback)((id) => {
        setRenderAssets((assts) => {
            return assts.filter((a) => a.id !== id);
        });
    }, []);
    (0, react_1.useLayoutEffect)(() => {
        if (typeof window !== 'undefined') {
            window.remotion_collectAssets = () => {
                setRenderAssets([]); // clear assets at next render
                return renderAssets;
            };
        }
    }, [renderAssets]);
    const contextValue = (0, react_1.useMemo)(() => {
        return {
            registerRenderAsset,
            unregisterRenderAsset,
            renderAssets,
        };
    }, [renderAssets, registerRenderAsset, unregisterRenderAsset]);
    return ((0, jsx_runtime_1.jsx)(exports.RenderAssetManager.Provider, { value: contextValue, children: children }));
};
exports.RenderAssetManagerProvider = RenderAssetManagerProvider;


/***/ }),

/***/ 7240:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useResolvedVideoConfig = exports.ResolveCompositionConfig = exports.PROPS_UPDATED_EXTERNALLY = exports.needsResolution = exports.resolveCompositionsRef = exports.ResolveCompositionContext = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const CompositionManagerContext_js_1 = __webpack_require__(9126);
const EditorProps_js_1 = __webpack_require__(5963);
const input_props_js_1 = __webpack_require__(3678);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const nonce_js_1 = __webpack_require__(2501);
const resolve_video_config_js_1 = __webpack_require__(7611);
const validate_dimensions_js_1 = __webpack_require__(8140);
const validate_duration_in_frames_js_1 = __webpack_require__(2488);
const validate_fps_js_1 = __webpack_require__(706);
exports.ResolveCompositionContext = (0, react_1.createContext)(null);
exports.resolveCompositionsRef = (0, react_1.createRef)();
const needsResolution = (composition) => {
    return Boolean(composition.calculateMetadata);
};
exports.needsResolution = needsResolution;
exports.PROPS_UPDATED_EXTERNALLY = 'remotion.propsUpdatedExternally';
const ResolveCompositionConfig = ({ children }) => {
    const [currentRenderModalComposition, setCurrentRenderModalComposition] = (0, react_1.useState)(null);
    const { compositions, canvasContent, currentCompositionMetadata } = (0, react_1.useContext)(CompositionManagerContext_js_1.CompositionManager);
    const { fastRefreshes } = (0, react_1.useContext)(nonce_js_1.NonceContext);
    const selectedComposition = (0, react_1.useMemo)(() => {
        return compositions.find((c) => canvasContent &&
            canvasContent.type === 'composition' &&
            canvasContent.compositionId === c.id);
    }, [canvasContent, compositions]);
    const renderModalComposition = compositions.find((c) => c.id === currentRenderModalComposition);
    const { props: allEditorProps } = (0, react_1.useContext)(EditorProps_js_1.EditorPropsContext);
    const inputProps = (0, react_1.useMemo)(() => {
        var _a;
        return typeof window === 'undefined' || (0, get_remotion_environment_js_1.getRemotionEnvironment)().isPlayer
            ? {}
            : ((_a = (0, input_props_js_1.getInputProps)()) !== null && _a !== void 0 ? _a : {});
    }, []);
    const [resolvedConfigs, setResolvedConfigs] = (0, react_1.useState)({});
    const selectedEditorProps = (0, react_1.useMemo)(() => {
        var _a;
        return selectedComposition
            ? ((_a = allEditorProps[selectedComposition.id]) !== null && _a !== void 0 ? _a : {})
            : {};
    }, [allEditorProps, selectedComposition]);
    const renderModalProps = (0, react_1.useMemo)(() => {
        var _a;
        return renderModalComposition
            ? ((_a = allEditorProps[renderModalComposition.id]) !== null && _a !== void 0 ? _a : {})
            : {};
    }, [allEditorProps, renderModalComposition]);
    const hasResolution = Boolean(currentCompositionMetadata);
    const doResolution = (0, react_1.useCallback)(({ calculateMetadata, combinedProps, compositionDurationInFrames, compositionFps, compositionHeight, compositionId, compositionWidth, defaultProps, }) => {
        const controller = new AbortController();
        if (hasResolution) {
            return controller;
        }
        const { signal } = controller;
        const result = (0, resolve_video_config_js_1.resolveVideoConfigOrCatch)({
            compositionId,
            calculateMetadata,
            originalProps: combinedProps,
            signal,
            defaultProps,
            compositionDurationInFrames,
            compositionFps,
            compositionHeight,
            compositionWidth,
        });
        if (result.type === 'error') {
            setResolvedConfigs((r) => ({
                ...r,
                [compositionId]: {
                    type: 'error',
                    error: result.error,
                },
            }));
            return controller;
        }
        const promOrNot = result.result;
        if (typeof promOrNot === 'object' && 'then' in promOrNot) {
            setResolvedConfigs((r) => {
                const prev = r[compositionId];
                if ((prev === null || prev === void 0 ? void 0 : prev.type) === 'success' ||
                    (prev === null || prev === void 0 ? void 0 : prev.type) === 'success-and-refreshing') {
                    return {
                        ...r,
                        [compositionId]: {
                            type: 'success-and-refreshing',
                            result: prev.result,
                        },
                    };
                }
                return {
                    ...r,
                    [compositionId]: {
                        type: 'loading',
                    },
                };
            });
            promOrNot
                .then((c) => {
                if (controller.signal.aborted) {
                    return;
                }
                setResolvedConfigs((r) => ({
                    ...r,
                    [compositionId]: {
                        type: 'success',
                        result: c,
                    },
                }));
            })
                .catch((err) => {
                if (controller.signal.aborted) {
                    return;
                }
                setResolvedConfigs((r) => ({
                    ...r,
                    [compositionId]: {
                        type: 'error',
                        error: err,
                    },
                }));
            });
        }
        else {
            setResolvedConfigs((r) => ({
                ...r,
                [compositionId]: {
                    type: 'success',
                    result: promOrNot,
                },
            }));
        }
        return controller;
    }, [hasResolution]);
    const currentComposition = (canvasContent === null || canvasContent === void 0 ? void 0 : canvasContent.type) === 'composition' ? canvasContent.compositionId : null;
    (0, react_1.useImperativeHandle)(exports.resolveCompositionsRef, () => {
        return {
            setCurrentRenderModalComposition: (id) => {
                setCurrentRenderModalComposition(id);
            },
            reloadCurrentlySelectedComposition: () => {
                var _a, _b, _c, _d, _e, _f;
                if (!currentComposition) {
                    return;
                }
                const composition = compositions.find((c) => c.id === currentComposition);
                if (!composition) {
                    throw new Error(`Could not find composition with id ${currentComposition}`);
                }
                const editorProps = (_a = allEditorProps[currentComposition]) !== null && _a !== void 0 ? _a : {};
                const defaultProps = {
                    ...((_b = composition.defaultProps) !== null && _b !== void 0 ? _b : {}),
                    ...(editorProps !== null && editorProps !== void 0 ? editorProps : {}),
                };
                const props = {
                    ...defaultProps,
                    ...(inputProps !== null && inputProps !== void 0 ? inputProps : {}),
                };
                doResolution({
                    defaultProps,
                    calculateMetadata: composition.calculateMetadata,
                    combinedProps: props,
                    compositionDurationInFrames: (_c = composition.durationInFrames) !== null && _c !== void 0 ? _c : null,
                    compositionFps: (_d = composition.fps) !== null && _d !== void 0 ? _d : null,
                    compositionHeight: (_e = composition.height) !== null && _e !== void 0 ? _e : null,
                    compositionWidth: (_f = composition.width) !== null && _f !== void 0 ? _f : null,
                    compositionId: composition.id,
                });
            },
        };
    }, [
        allEditorProps,
        compositions,
        currentComposition,
        doResolution,
        inputProps,
    ]);
    const isTheSame = (selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.id) === (renderModalComposition === null || renderModalComposition === void 0 ? void 0 : renderModalComposition.id);
    const currentDefaultProps = (0, react_1.useMemo)(() => {
        var _a;
        return {
            ...((_a = selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.defaultProps) !== null && _a !== void 0 ? _a : {}),
            ...(selectedEditorProps !== null && selectedEditorProps !== void 0 ? selectedEditorProps : {}),
        };
    }, [selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.defaultProps, selectedEditorProps]);
    const originalProps = (0, react_1.useMemo)(() => {
        return {
            ...currentDefaultProps,
            ...(inputProps !== null && inputProps !== void 0 ? inputProps : {}),
        };
    }, [currentDefaultProps, inputProps]);
    const canResolve = selectedComposition && (0, exports.needsResolution)(selectedComposition);
    const shouldIgnoreUpdate = typeof window !== 'undefined' &&
        window.remotion_ignoreFastRefreshUpdate &&
        fastRefreshes <= window.remotion_ignoreFastRefreshUpdate;
    (0, react_1.useEffect)(() => {
        var _a, _b, _c, _d;
        if (shouldIgnoreUpdate) {
            // We already have the current state, we just saved it back
            // to the file
            return;
        }
        if (canResolve) {
            const controller = doResolution({
                calculateMetadata: selectedComposition.calculateMetadata,
                combinedProps: originalProps,
                compositionDurationInFrames: (_a = selectedComposition.durationInFrames) !== null && _a !== void 0 ? _a : null,
                compositionFps: (_b = selectedComposition.fps) !== null && _b !== void 0 ? _b : null,
                compositionHeight: (_c = selectedComposition.height) !== null && _c !== void 0 ? _c : null,
                compositionWidth: (_d = selectedComposition.width) !== null && _d !== void 0 ? _d : null,
                defaultProps: currentDefaultProps,
                compositionId: selectedComposition.id,
            });
            return () => {
                controller.abort();
            };
        }
    }, [
        canResolve,
        currentDefaultProps,
        doResolution,
        originalProps,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.calculateMetadata,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.durationInFrames,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.fps,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.height,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.id,
        selectedComposition === null || selectedComposition === void 0 ? void 0 : selectedComposition.width,
        shouldIgnoreUpdate,
    ]);
    (0, react_1.useEffect)(() => {
        if (shouldIgnoreUpdate) {
            // We already have the current state, we just saved it back
            // to the file
            return;
        }
        window.dispatchEvent(new CustomEvent(exports.PROPS_UPDATED_EXTERNALLY, {
            detail: {
                resetUnsaved: true,
            },
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fastRefreshes]);
    (0, react_1.useEffect)(() => {
        var _a, _b, _c, _d, _e;
        if (renderModalComposition && !isTheSame) {
            const combinedProps = {
                ...((_a = renderModalComposition.defaultProps) !== null && _a !== void 0 ? _a : {}),
                ...(renderModalProps !== null && renderModalProps !== void 0 ? renderModalProps : {}),
                ...(inputProps !== null && inputProps !== void 0 ? inputProps : {}),
            };
            const controller = doResolution({
                calculateMetadata: renderModalComposition.calculateMetadata,
                compositionDurationInFrames: (_b = renderModalComposition.durationInFrames) !== null && _b !== void 0 ? _b : null,
                compositionFps: (_c = renderModalComposition.fps) !== null && _c !== void 0 ? _c : null,
                compositionHeight: (_d = renderModalComposition.height) !== null && _d !== void 0 ? _d : null,
                compositionId: renderModalComposition.id,
                compositionWidth: (_e = renderModalComposition.width) !== null && _e !== void 0 ? _e : null,
                defaultProps: currentDefaultProps,
                combinedProps,
            });
            return () => {
                controller.abort();
            };
        }
    }, [
        currentDefaultProps,
        doResolution,
        inputProps,
        isTheSame,
        renderModalComposition,
        renderModalProps,
    ]);
    const resolvedConfigsIncludingStaticOnes = (0, react_1.useMemo)(() => {
        const staticComps = compositions.filter((c) => {
            return c.calculateMetadata === null;
        });
        return {
            ...resolvedConfigs,
            ...staticComps.reduce((acc, curr) => {
                var _a;
                return {
                    ...acc,
                    [curr.id]: {
                        type: 'success',
                        result: { ...curr, defaultProps: (_a = curr.defaultProps) !== null && _a !== void 0 ? _a : {} },
                    },
                };
            }, {}),
        };
    }, [compositions, resolvedConfigs]);
    return ((0, jsx_runtime_1.jsx)(exports.ResolveCompositionContext.Provider, { value: resolvedConfigsIncludingStaticOnes, children: children }));
};
exports.ResolveCompositionConfig = ResolveCompositionConfig;
const useResolvedVideoConfig = (preferredCompositionId) => {
    const context = (0, react_1.useContext)(exports.ResolveCompositionContext);
    const { props: allEditorProps } = (0, react_1.useContext)(EditorProps_js_1.EditorPropsContext);
    const { compositions, canvasContent, currentCompositionMetadata } = (0, react_1.useContext)(CompositionManagerContext_js_1.CompositionManager);
    const currentComposition = (canvasContent === null || canvasContent === void 0 ? void 0 : canvasContent.type) === 'composition' ? canvasContent.compositionId : null;
    const compositionId = preferredCompositionId !== null && preferredCompositionId !== void 0 ? preferredCompositionId : currentComposition;
    const composition = compositions.find((c) => c.id === compositionId);
    const selectedEditorProps = (0, react_1.useMemo)(() => {
        var _a;
        return composition ? ((_a = allEditorProps[composition.id]) !== null && _a !== void 0 ? _a : {}) : {};
    }, [allEditorProps, composition]);
    return (0, react_1.useMemo)(() => {
        var _a, _b, _c, _d;
        if (!composition) {
            return null;
        }
        if (currentCompositionMetadata) {
            return {
                type: 'success',
                result: {
                    ...currentCompositionMetadata,
                    id: composition.id,
                    props: currentCompositionMetadata.props,
                    defaultProps: (_a = composition.defaultProps) !== null && _a !== void 0 ? _a : {},
                    defaultCodec: currentCompositionMetadata.defaultCodec,
                },
            };
        }
        if (!(0, exports.needsResolution)(composition)) {
            (0, validate_duration_in_frames_js_1.validateDurationInFrames)(composition.durationInFrames, {
                allowFloats: false,
                component: `in <Composition id="${composition.id}">`,
            });
            (0, validate_fps_js_1.validateFps)(composition.fps, `in <Composition id="${composition.id}">`, false);
            (0, validate_dimensions_js_1.validateDimension)(composition.width, 'width', `in <Composition id="${composition.id}">`);
            (0, validate_dimensions_js_1.validateDimension)(composition.height, 'height', `in <Composition id="${composition.id}">`);
            return {
                type: 'success',
                result: {
                    width: composition.width,
                    height: composition.height,
                    fps: composition.fps,
                    id: composition.id,
                    durationInFrames: composition.durationInFrames,
                    defaultProps: (_b = composition.defaultProps) !== null && _b !== void 0 ? _b : {},
                    props: {
                        ...((_c = composition.defaultProps) !== null && _c !== void 0 ? _c : {}),
                        ...(selectedEditorProps !== null && selectedEditorProps !== void 0 ? selectedEditorProps : {}),
                        ...(typeof window === 'undefined' ||
                            (0, get_remotion_environment_js_1.getRemotionEnvironment)().isPlayer
                            ? {}
                            : ((_d = (0, input_props_js_1.getInputProps)()) !== null && _d !== void 0 ? _d : {})),
                    },
                    defaultCodec: null,
                },
            };
        }
        if (!context[composition.id]) {
            return null;
        }
        return context[composition.id];
    }, [composition, context, currentCompositionMetadata, selectedEditorProps]);
};
exports.useResolvedVideoConfig = useResolvedVideoConfig;


/***/ }),

/***/ 7973:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Sequence = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
/* eslint-disable @typescript-eslint/no-use-before-define */
const react_1 = __webpack_require__(6540);
const AbsoluteFill_js_1 = __webpack_require__(1488);
const SequenceContext_js_1 = __webpack_require__(3822);
const SequenceManager_js_1 = __webpack_require__(9962);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const nonce_js_1 = __webpack_require__(2501);
const timeline_position_state_js_1 = __webpack_require__(8019);
const use_video_config_js_1 = __webpack_require__(7770);
const freeze_js_1 = __webpack_require__(931);
const use_current_frame_1 = __webpack_require__(1041);
const RegularSequenceRefForwardingFunction = ({ from = 0, durationInFrames = Infinity, children, name, height, width, showInTimeline = true, _remotionInternalLoopDisplay: loopDisplay, _remotionInternalStack: stack, _remotionInternalPremountDisplay: premountDisplay, ...other }, ref) => {
    var _a;
    const { layout = 'absolute-fill' } = other;
    const [id] = (0, react_1.useState)(() => String(Math.random()));
    const parentSequence = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const { rootId } = (0, react_1.useContext)(timeline_position_state_js_1.TimelineContext);
    const cumulatedFrom = parentSequence
        ? parentSequence.cumulatedFrom + parentSequence.relativeFrom
        : 0;
    const nonce = (0, nonce_js_1.useNonce)();
    if (layout !== 'absolute-fill' && layout !== 'none') {
        throw new TypeError(`The layout prop of <Sequence /> expects either "absolute-fill" or "none", but you passed: ${layout}`);
    }
    // @ts-expect-error
    if (layout === 'none' && typeof other.style !== 'undefined') {
        throw new TypeError('If layout="none", you may not pass a style.');
    }
    if (typeof durationInFrames !== 'number') {
        throw new TypeError(`You passed to durationInFrames an argument of type ${typeof durationInFrames}, but it must be a number.`);
    }
    if (durationInFrames <= 0) {
        throw new TypeError(`durationInFrames must be positive, but got ${durationInFrames}`);
    }
    if (typeof from !== 'number') {
        throw new TypeError(`You passed to the "from" props of your <Sequence> an argument of type ${typeof from}, but it must be a number.`);
    }
    if (!Number.isFinite(from)) {
        throw new TypeError(`The "from" prop of a sequence must be finite, but got ${from}.`);
    }
    const absoluteFrame = (0, timeline_position_state_js_1.useTimelinePosition)();
    const videoConfig = (0, use_video_config_js_1.useVideoConfig)();
    const parentSequenceDuration = parentSequence
        ? Math.min(parentSequence.durationInFrames - from, durationInFrames)
        : durationInFrames;
    const actualDurationInFrames = Math.max(0, Math.min(videoConfig.durationInFrames - from, parentSequenceDuration));
    const { registerSequence, unregisterSequence } = (0, react_1.useContext)(SequenceManager_js_1.SequenceManager);
    const { hidden } = (0, react_1.useContext)(SequenceManager_js_1.SequenceVisibilityToggleContext);
    const premounting = (0, react_1.useMemo)(() => {
        var _a;
        return ((_a = parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.premounting) !== null && _a !== void 0 ? _a : Boolean(other._remotionInternalIsPremounting));
    }, [other._remotionInternalIsPremounting, parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.premounting]);
    const contextValue = (0, react_1.useMemo)(() => {
        var _a, _b, _c;
        return {
            cumulatedFrom,
            relativeFrom: from,
            durationInFrames: actualDurationInFrames,
            parentFrom: (_a = parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.relativeFrom) !== null && _a !== void 0 ? _a : 0,
            id,
            height: (_b = height !== null && height !== void 0 ? height : parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.height) !== null && _b !== void 0 ? _b : null,
            width: (_c = width !== null && width !== void 0 ? width : parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.width) !== null && _c !== void 0 ? _c : null,
            premounting,
        };
    }, [
        cumulatedFrom,
        from,
        actualDurationInFrames,
        parentSequence,
        id,
        height,
        width,
        premounting,
    ]);
    const timelineClipName = (0, react_1.useMemo)(() => {
        return name !== null && name !== void 0 ? name : '';
    }, [name]);
    (0, react_1.useEffect)(() => {
        var _a;
        if (!(0, get_remotion_environment_js_1.getRemotionEnvironment)().isStudio) {
            return;
        }
        registerSequence({
            from,
            duration: actualDurationInFrames,
            id,
            displayName: timelineClipName,
            parent: (_a = parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.id) !== null && _a !== void 0 ? _a : null,
            type: 'sequence',
            rootId,
            showInTimeline,
            nonce,
            loopDisplay,
            stack: stack !== null && stack !== void 0 ? stack : null,
            premountDisplay: premountDisplay !== null && premountDisplay !== void 0 ? premountDisplay : null,
        });
        return () => {
            unregisterSequence(id);
        };
    }, [
        durationInFrames,
        id,
        name,
        registerSequence,
        timelineClipName,
        unregisterSequence,
        parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.id,
        actualDurationInFrames,
        rootId,
        from,
        showInTimeline,
        nonce,
        loopDisplay,
        stack,
        premountDisplay,
    ]);
    // Ceil to support floats
    // https://github.com/remotion-dev/remotion/issues/2958
    const endThreshold = Math.ceil(cumulatedFrom + from + durationInFrames - 1);
    const content = absoluteFrame < cumulatedFrom + from
        ? null
        : absoluteFrame > endThreshold
            ? null
            : children;
    const styleIfThere = other.layout === 'none' ? undefined : other.style;
    const defaultStyle = (0, react_1.useMemo)(() => {
        return {
            flexDirection: undefined,
            ...(width ? { width } : {}),
            ...(height ? { height } : {}),
            ...(styleIfThere !== null && styleIfThere !== void 0 ? styleIfThere : {}),
        };
    }, [height, styleIfThere, width]);
    if (ref !== null && layout === 'none') {
        throw new TypeError('It is not supported to pass both a `ref` and `layout="none"` to <Sequence />.');
    }
    const isSequenceHidden = (_a = hidden[id]) !== null && _a !== void 0 ? _a : false;
    if (isSequenceHidden) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(SequenceContext_js_1.SequenceContext.Provider, { value: contextValue, children: content === null ? null : other.layout === 'none' ? (content) : ((0, jsx_runtime_1.jsx)(AbsoluteFill_js_1.AbsoluteFill, { ref: ref, style: defaultStyle, className: other.className, children: content })) }));
};
const RegularSequence = (0, react_1.forwardRef)(RegularSequenceRefForwardingFunction);
const PremountedSequenceRefForwardingFunction = (props, ref) => {
    const frame = (0, use_current_frame_1.useCurrentFrame)();
    if (props.layout === 'none') {
        throw new Error('`<Sequence>` with `premountFor` prop does not support layout="none"');
    }
    const { style: passedStyle, from = 0, premountFor = 0, ...otherProps } = props;
    const premountingActive = frame < from && frame >= from - premountFor;
    const style = (0, react_1.useMemo)(() => {
        var _a;
        return {
            ...passedStyle,
            opacity: premountingActive ? 0 : 1,
            pointerEvents: premountingActive
                ? 'none'
                : ((_a = passedStyle === null || passedStyle === void 0 ? void 0 : passedStyle.pointerEvents) !== null && _a !== void 0 ? _a : undefined),
        };
    }, [premountingActive, passedStyle]);
    return ((0, jsx_runtime_1.jsx)(freeze_js_1.Freeze, { frame: from, active: premountingActive, children: (0, jsx_runtime_1.jsx)(exports.Sequence, { ref: ref, from: from, style: style, _remotionInternalPremountDisplay: premountFor, _remotionInternalIsPremounting: premountingActive, ...otherProps }) }));
};
const PremountedSequence = (0, react_1.forwardRef)(PremountedSequenceRefForwardingFunction);
const SequenceRefForwardingFunction = (props, ref) => {
    if (props.layout !== 'none' &&
        props.premountFor &&
        !(0, get_remotion_environment_js_1.getRemotionEnvironment)().isRendering) {
        return (0, jsx_runtime_1.jsx)(PremountedSequence, { ...props, ref: ref });
    }
    return (0, jsx_runtime_1.jsx)(RegularSequence, { ...props, ref: ref });
};
/**
 * @description A component that time-shifts its children and wraps them in an absolutely positioned <div>.
 * @see [Documentation](https://www.remotion.dev/docs/sequence)
 */
exports.Sequence = (0, react_1.forwardRef)(SequenceRefForwardingFunction);


/***/ }),

/***/ 3822:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SequenceContext = void 0;
const react_1 = __webpack_require__(6540);
exports.SequenceContext = (0, react_1.createContext)(null);


/***/ }),

/***/ 9962:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SequenceManagerProvider = exports.SequenceVisibilityToggleContext = exports.SequenceManager = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __importStar(__webpack_require__(6540));
exports.SequenceManager = react_1.default.createContext({
    registerSequence: () => {
        throw new Error('SequenceManagerContext not initialized');
    },
    unregisterSequence: () => {
        throw new Error('SequenceManagerContext not initialized');
    },
    sequences: [],
});
exports.SequenceVisibilityToggleContext = react_1.default.createContext({
    hidden: {},
    setHidden: () => {
        throw new Error('SequenceVisibilityToggle not initialized');
    },
});
const SequenceManagerProvider = ({ children }) => {
    const [sequences, setSequences] = (0, react_1.useState)([]);
    const [hidden, setHidden] = (0, react_1.useState)({});
    const registerSequence = (0, react_1.useCallback)((seq) => {
        setSequences((seqs) => {
            return [...seqs, seq];
        });
    }, []);
    const unregisterSequence = (0, react_1.useCallback)((seq) => {
        setSequences((seqs) => seqs.filter((s) => s.id !== seq));
    }, []);
    const sequenceContext = (0, react_1.useMemo)(() => {
        return {
            registerSequence,
            sequences,
            unregisterSequence,
        };
    }, [registerSequence, sequences, unregisterSequence]);
    const hiddenContext = (0, react_1.useMemo)(() => {
        return {
            hidden,
            setHidden,
        };
    }, [hidden]);
    return ((0, jsx_runtime_1.jsx)(exports.SequenceManager.Provider, { value: sequenceContext, children: (0, jsx_runtime_1.jsx)(exports.SequenceVisibilityToggleContext.Provider, { value: hiddenContext, children: children }) }));
};
exports.SequenceManagerProvider = SequenceManagerProvider;


/***/ }),

/***/ 5076:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Still = void 0;
const react_1 = __importDefault(__webpack_require__(6540));
const Composition_js_1 = __webpack_require__(2040);
/**
 * @description A `<Still />` is a `<Composition />` that is only 1 frame long.
 * @see [Documentation](https://www.remotion.dev/docs/still)
 */
const Still = (props) => {
    const newProps = {
        ...props,
        durationInFrames: 1,
        fps: 1,
    };
    // @ts-expect-error TypeScript does not understand it, but should still fail on type mismatch
    return react_1.default.createElement((Composition_js_1.Composition), newProps);
};
exports.Still = Still;


/***/ }),

/***/ 2466:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const react_1 = __webpack_require__(6540);
if (typeof react_1.createContext !== 'function') {
    const err = [
        'Remotion requires React.createContext, but it is "undefined".',
        'If you are in a React Server Component, turn it into a client component by adding "use client" at the top of the file.',
        '',
        'Before:',
        '  import {useCurrentFrame} from "remotion";',
        '',
        'After:',
        '  "use client";',
        '  import {useCurrentFrame} from "remotion";',
    ];
    throw new Error(err.join('\n'));
}


/***/ }),

/***/ 9710:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getAbsoluteSrc = void 0;
const getAbsoluteSrc = (relativeSrc) => {
    if (typeof window === 'undefined') {
        return relativeSrc;
    }
    return new URL(relativeSrc, window.origin).href;
};
exports.getAbsoluteSrc = getAbsoluteSrc;


/***/ }),

/***/ 8330:
/***/ (() => {




/***/ }),

/***/ 7349:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Audio = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
/* eslint-disable @typescript-eslint/no-use-before-define */
const react_1 = __webpack_require__(6540);
const Sequence_js_1 = __webpack_require__(7973);
const absolute_src_js_1 = __webpack_require__(9710);
const calculate_loop_js_1 = __webpack_require__(773);
const cancel_render_js_1 = __webpack_require__(8439);
const enable_sequence_stack_traces_js_1 = __webpack_require__(9599);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const index_js_1 = __webpack_require__(2377);
const prefetch_js_1 = __webpack_require__(1011);
const use_video_config_js_1 = __webpack_require__(7770);
const validate_media_props_js_1 = __webpack_require__(4972);
const validate_start_from_props_js_1 = __webpack_require__(771);
const duration_state_js_1 = __webpack_require__(1152);
const AudioForPreview_js_1 = __webpack_require__(8048);
const AudioForRendering_js_1 = __webpack_require__(6324);
const shared_audio_tags_js_1 = __webpack_require__(4103);
const AudioRefForwardingFunction = (props, ref) => {
    var _a, _b, _c;
    const audioContext = (0, react_1.useContext)(shared_audio_tags_js_1.SharedAudioContext);
    const { startFrom, endAt, name, stack, pauseWhenBuffering, showInTimeline, _remotionDebugSeeking, ...otherProps } = props;
    const { loop, ...propsOtherThanLoop } = props;
    const { fps } = (0, use_video_config_js_1.useVideoConfig)();
    const environment = (0, get_remotion_environment_js_1.getRemotionEnvironment)();
    const { durations, setDurations } = (0, react_1.useContext)(duration_state_js_1.DurationsContext);
    if (typeof props.src !== 'string') {
        throw new TypeError(`The \`<Audio>\` tag requires a string for \`src\`, but got ${JSON.stringify(props.src)} instead.`);
    }
    const preloadedSrc = (0, prefetch_js_1.usePreload)(props.src);
    const onError = (0, react_1.useCallback)((e) => {
        // eslint-disable-next-line no-console
        console.log(e.currentTarget.error);
        // If there is no `loop` property, we don't need to get the duration
        // and this does not need to be a fatal error
        const errMessage = `Could not play audio with src ${preloadedSrc}: ${e.currentTarget.error}. See https://remotion.dev/docs/media-playback-error for help.`;
        if (loop) {
            (0, cancel_render_js_1.cancelRender)(new Error(errMessage));
        }
        else {
            // eslint-disable-next-line no-console
            console.warn(errMessage);
        }
    }, [loop, preloadedSrc]);
    const onDuration = (0, react_1.useCallback)((src, durationInSeconds) => {
        setDurations({ type: 'got-duration', durationInSeconds, src });
    }, [setDurations]);
    const durationFetched = (_a = durations[(0, absolute_src_js_1.getAbsoluteSrc)(preloadedSrc)]) !== null && _a !== void 0 ? _a : durations[(0, absolute_src_js_1.getAbsoluteSrc)(props.src)];
    if (loop && durationFetched !== undefined) {
        if (!Number.isFinite(durationFetched)) {
            return ((0, jsx_runtime_1.jsx)(exports.Audio, { ...propsOtherThanLoop, ref: ref, _remotionInternalNativeLoopPassed: true }));
        }
        const duration = durationFetched * fps;
        return ((0, jsx_runtime_1.jsx)(index_js_1.Loop, { layout: "none", durationInFrames: (0, calculate_loop_js_1.calculateLoopDuration)({
                endAt,
                mediaDuration: duration,
                playbackRate: (_b = props.playbackRate) !== null && _b !== void 0 ? _b : 1,
                startFrom,
            }), children: (0, jsx_runtime_1.jsx)(exports.Audio, { ...propsOtherThanLoop, ref: ref, _remotionInternalNativeLoopPassed: true }) }));
    }
    if (typeof startFrom !== 'undefined' || typeof endAt !== 'undefined') {
        (0, validate_start_from_props_js_1.validateStartFromProps)(startFrom, endAt);
        const startFromFrameNo = startFrom !== null && startFrom !== void 0 ? startFrom : 0;
        const endAtFrameNo = endAt !== null && endAt !== void 0 ? endAt : Infinity;
        return ((0, jsx_runtime_1.jsx)(Sequence_js_1.Sequence, { layout: "none", from: 0 - startFromFrameNo, showInTimeline: false, durationInFrames: endAtFrameNo, name: name, children: (0, jsx_runtime_1.jsx)(exports.Audio, { _remotionInternalNeedsDurationCalculation: Boolean(loop), pauseWhenBuffering: pauseWhenBuffering !== null && pauseWhenBuffering !== void 0 ? pauseWhenBuffering : false, ...otherProps, ref: ref }) }));
    }
    (0, validate_media_props_js_1.validateMediaProps)(props, 'Audio');
    if (environment.isRendering) {
        return ((0, jsx_runtime_1.jsx)(AudioForRendering_js_1.AudioForRendering, { onDuration: onDuration, ...props, ref: ref, onError: onError, _remotionInternalNeedsDurationCalculation: Boolean(loop) }));
    }
    return ((0, jsx_runtime_1.jsx)(AudioForPreview_js_1.AudioForPreview, { _remotionInternalNativeLoopPassed: (_c = props._remotionInternalNativeLoopPassed) !== null && _c !== void 0 ? _c : false, _remotionDebugSeeking: _remotionDebugSeeking !== null && _remotionDebugSeeking !== void 0 ? _remotionDebugSeeking : false, _remotionInternalStack: stack !== null && stack !== void 0 ? stack : null, shouldPreMountAudioTags: audioContext !== null && audioContext.numberOfAudioTags > 0, ...props, ref: ref, onError: onError, onDuration: onDuration, 
        // Proposal: Make this default to true in v5
        pauseWhenBuffering: pauseWhenBuffering !== null && pauseWhenBuffering !== void 0 ? pauseWhenBuffering : false, _remotionInternalNeedsDurationCalculation: Boolean(loop), showInTimeline: showInTimeline !== null && showInTimeline !== void 0 ? showInTimeline : true }));
};
/**
 * @description With this component, you can add audio to your video. All audio formats which are supported by Chromium are supported by the component.
 * @see [Documentation](https://www.remotion.dev/docs/audio)
 */
exports.Audio = (0, react_1.forwardRef)(AudioRefForwardingFunction);
(0, enable_sequence_stack_traces_js_1.addSequenceStackTraces)(exports.Audio);


/***/ }),

/***/ 8048:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AudioForPreview = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const SequenceContext_js_1 = __webpack_require__(3822);
const SequenceManager_js_1 = __webpack_require__(9962);
const prefetch_js_1 = __webpack_require__(1011);
const random_js_1 = __webpack_require__(5923);
const use_media_in_timeline_js_1 = __webpack_require__(3600);
const use_media_playback_js_1 = __webpack_require__(1228);
const use_media_tag_volume_js_1 = __webpack_require__(2340);
const use_sync_volume_with_media_tag_js_1 = __webpack_require__(5413);
const volume_position_state_js_1 = __webpack_require__(8068);
const volume_prop_js_1 = __webpack_require__(4490);
const shared_audio_tags_js_1 = __webpack_require__(4103);
const use_audio_frame_js_1 = __webpack_require__(8783);
const AudioForDevelopmentForwardRefFunction = (props, ref) => {
    var _a;
    const [initialShouldPreMountAudioElements] = (0, react_1.useState)(props.shouldPreMountAudioTags);
    if (props.shouldPreMountAudioTags !== initialShouldPreMountAudioElements) {
        throw new Error('Cannot change the behavior for pre-mounting audio tags dynamically.');
    }
    const { volume, muted, playbackRate, shouldPreMountAudioTags, src, onDuration, acceptableTimeShiftInSeconds, _remotionInternalNeedsDurationCalculation, _remotionInternalNativeLoopPassed, _remotionInternalStack, _remotionDebugSeeking, allowAmplificationDuringRender, name, pauseWhenBuffering, showInTimeline, loopVolumeCurveBehavior, stack, ...nativeProps } = props;
    const [mediaVolume] = (0, volume_position_state_js_1.useMediaVolumeState)();
    const [mediaMuted] = (0, volume_position_state_js_1.useMediaMutedState)();
    const volumePropFrame = (0, use_audio_frame_js_1.useFrameForVolumeProp)(loopVolumeCurveBehavior !== null && loopVolumeCurveBehavior !== void 0 ? loopVolumeCurveBehavior : 'repeat');
    const { hidden } = (0, react_1.useContext)(SequenceManager_js_1.SequenceVisibilityToggleContext);
    if (!src) {
        throw new TypeError("No 'src' was passed to <Audio>.");
    }
    const preloadedSrc = (0, prefetch_js_1.usePreload)(src);
    const sequenceContext = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const [timelineId] = (0, react_1.useState)(() => String(Math.random()));
    const isSequenceHidden = (_a = hidden[timelineId]) !== null && _a !== void 0 ? _a : false;
    const userPreferredVolume = (0, volume_prop_js_1.evaluateVolume)({
        frame: volumePropFrame,
        volume,
        mediaVolume,
        allowAmplificationDuringRender: false,
    });
    const propsToPass = (0, react_1.useMemo)(() => {
        return {
            muted: muted || mediaMuted || isSequenceHidden || userPreferredVolume <= 0,
            src: preloadedSrc,
            loop: _remotionInternalNativeLoopPassed,
            ...nativeProps,
        };
    }, [
        _remotionInternalNativeLoopPassed,
        isSequenceHidden,
        mediaMuted,
        muted,
        nativeProps,
        preloadedSrc,
        userPreferredVolume,
    ]);
    // Generate a string that's as unique as possible for this asset
    // but at the same time deterministic. We use it to combat strict mode issues.
    const id = (0, react_1.useMemo)(() => `audio-${(0, random_js_1.random)(src !== null && src !== void 0 ? src : '')}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.cumulatedFrom}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.durationInFrames}-muted:${props.muted}-loop:${props.loop}`, [
        src,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.cumulatedFrom,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.durationInFrames,
        props.muted,
        props.loop,
    ]);
    const audioRef = (0, shared_audio_tags_js_1.useSharedAudio)(propsToPass, id).el;
    const actualVolume = (0, use_media_tag_volume_js_1.useMediaTagVolume)(audioRef);
    (0, use_sync_volume_with_media_tag_js_1.useSyncVolumeWithMediaTag)({
        volumePropFrame,
        actualVolume,
        volume,
        mediaVolume,
        mediaRef: audioRef,
    });
    (0, use_media_in_timeline_js_1.useMediaInTimeline)({
        volume,
        mediaVolume,
        mediaRef: audioRef,
        src,
        mediaType: 'audio',
        playbackRate: playbackRate !== null && playbackRate !== void 0 ? playbackRate : 1,
        displayName: name !== null && name !== void 0 ? name : null,
        id: timelineId,
        stack: _remotionInternalStack,
        showInTimeline,
        premountDisplay: null,
        onAutoPlayError: null,
        isPremounting: Boolean(sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.premounting),
    });
    (0, use_media_playback_js_1.useMediaPlayback)({
        mediaRef: audioRef,
        src,
        mediaType: 'audio',
        playbackRate: playbackRate !== null && playbackRate !== void 0 ? playbackRate : 1,
        onlyWarnForMediaSeekingError: false,
        acceptableTimeshift: acceptableTimeShiftInSeconds !== null && acceptableTimeShiftInSeconds !== void 0 ? acceptableTimeShiftInSeconds : use_media_playback_js_1.DEFAULT_ACCEPTABLE_TIMESHIFT,
        isPremounting: Boolean(sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.premounting),
        pauseWhenBuffering,
        debugSeeking: _remotionDebugSeeking,
        onAutoPlayError: null,
    });
    (0, react_1.useImperativeHandle)(ref, () => {
        return audioRef.current;
    }, [audioRef]);
    const currentOnDurationCallback = (0, react_1.useRef)(onDuration);
    currentOnDurationCallback.current = onDuration;
    (0, react_1.useEffect)(() => {
        var _a;
        const { current } = audioRef;
        if (!current) {
            return;
        }
        if (current.duration) {
            (_a = currentOnDurationCallback.current) === null || _a === void 0 ? void 0 : _a.call(currentOnDurationCallback, current.src, current.duration);
            return;
        }
        const onLoadedMetadata = () => {
            var _a;
            (_a = currentOnDurationCallback.current) === null || _a === void 0 ? void 0 : _a.call(currentOnDurationCallback, current.src, current.duration);
        };
        current.addEventListener('loadedmetadata', onLoadedMetadata);
        return () => {
            current.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, [audioRef, src]);
    if (initialShouldPreMountAudioElements) {
        return null;
    }
    return (0, jsx_runtime_1.jsx)("audio", { ref: audioRef, preload: "metadata", ...propsToPass });
};
exports.AudioForPreview = (0, react_1.forwardRef)(AudioForDevelopmentForwardRefFunction);


/***/ }),

/***/ 6324:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AudioForRendering = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const RenderAssetManager_js_1 = __webpack_require__(599);
const SequenceContext_js_1 = __webpack_require__(3822);
const absolute_src_js_1 = __webpack_require__(9710);
const delay_render_js_1 = __webpack_require__(1006);
const random_js_1 = __webpack_require__(5923);
const timeline_position_state_js_1 = __webpack_require__(8019);
const use_current_frame_js_1 = __webpack_require__(1041);
const volume_prop_js_1 = __webpack_require__(4490);
const use_audio_frame_js_1 = __webpack_require__(8783);
const AudioForRenderingRefForwardingFunction = (props, ref) => {
    const audioRef = (0, react_1.useRef)(null);
    const { volume: volumeProp, playbackRate, allowAmplificationDuringRender, onDuration, toneFrequency, _remotionInternalNeedsDurationCalculation, _remotionInternalNativeLoopPassed, acceptableTimeShiftInSeconds, name, onError, delayRenderRetries, delayRenderTimeoutInMilliseconds, loopVolumeCurveBehavior, pauseWhenBuffering, ...nativeProps } = props;
    const absoluteFrame = (0, timeline_position_state_js_1.useTimelinePosition)();
    const volumePropFrame = (0, use_audio_frame_js_1.useFrameForVolumeProp)(loopVolumeCurveBehavior !== null && loopVolumeCurveBehavior !== void 0 ? loopVolumeCurveBehavior : 'repeat');
    const frame = (0, use_current_frame_js_1.useCurrentFrame)();
    const sequenceContext = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const { registerRenderAsset, unregisterRenderAsset } = (0, react_1.useContext)(RenderAssetManager_js_1.RenderAssetManager);
    // Generate a string that's as unique as possible for this asset
    // but at the same time the same on all threads
    const id = (0, react_1.useMemo)(() => {
        var _a;
        return `audio-${(0, random_js_1.random)((_a = props.src) !== null && _a !== void 0 ? _a : '')}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.cumulatedFrom}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.durationInFrames}`;
    }, [
        props.src,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.cumulatedFrom,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.durationInFrames,
    ]);
    const volume = (0, volume_prop_js_1.evaluateVolume)({
        volume: volumeProp,
        frame: volumePropFrame,
        mediaVolume: 1,
        allowAmplificationDuringRender: allowAmplificationDuringRender !== null && allowAmplificationDuringRender !== void 0 ? allowAmplificationDuringRender : false,
    });
    (0, react_1.useImperativeHandle)(ref, () => {
        return audioRef.current;
    }, []);
    (0, react_1.useEffect)(() => {
        var _a, _b;
        if (!props.src) {
            throw new Error('No src passed');
        }
        if (!window.remotion_audioEnabled) {
            return;
        }
        if (props.muted) {
            return;
        }
        if (volume <= 0) {
            return;
        }
        registerRenderAsset({
            type: 'audio',
            src: (0, absolute_src_js_1.getAbsoluteSrc)(props.src),
            id,
            frame: absoluteFrame,
            volume,
            mediaFrame: frame,
            playbackRate: (_a = props.playbackRate) !== null && _a !== void 0 ? _a : 1,
            allowAmplificationDuringRender: allowAmplificationDuringRender !== null && allowAmplificationDuringRender !== void 0 ? allowAmplificationDuringRender : false,
            toneFrequency: toneFrequency !== null && toneFrequency !== void 0 ? toneFrequency : null,
            audioStartFrame: Math.max(0, -((_b = sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom) !== null && _b !== void 0 ? _b : 0)),
        });
        return () => unregisterRenderAsset(id);
    }, [
        props.muted,
        props.src,
        registerRenderAsset,
        absoluteFrame,
        id,
        unregisterRenderAsset,
        volume,
        volumePropFrame,
        frame,
        playbackRate,
        props.playbackRate,
        allowAmplificationDuringRender,
        toneFrequency,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom,
    ]);
    const { src } = props;
    // The <audio> tag is only rendered if the duration needs to be calculated for the `loop`
    // attribute to work, or if the user assigns a ref to it.
    const needsToRenderAudioTag = ref || _remotionInternalNeedsDurationCalculation;
    // If audio source switches, make new handle
    (0, react_1.useLayoutEffect)(() => {
        var _a, _b;
        if (((_b = (_a = window.process) === null || _a === void 0 ? void 0 : _a.env) === null || _b === void 0 ? void 0 : _b.NODE_ENV) === 'test') {
            return;
        }
        if (!needsToRenderAudioTag) {
            return;
        }
        const newHandle = (0, delay_render_js_1.delayRender)('Loading <Audio> duration with src=' + src, {
            retries: delayRenderRetries !== null && delayRenderRetries !== void 0 ? delayRenderRetries : undefined,
            timeoutInMilliseconds: delayRenderTimeoutInMilliseconds !== null && delayRenderTimeoutInMilliseconds !== void 0 ? delayRenderTimeoutInMilliseconds : undefined,
        });
        const { current } = audioRef;
        const didLoad = () => {
            if (current === null || current === void 0 ? void 0 : current.duration) {
                onDuration(current.src, current.duration);
            }
            (0, delay_render_js_1.continueRender)(newHandle);
        };
        if (current === null || current === void 0 ? void 0 : current.duration) {
            onDuration(current.src, current.duration);
            (0, delay_render_js_1.continueRender)(newHandle);
        }
        else {
            current === null || current === void 0 ? void 0 : current.addEventListener('loadedmetadata', didLoad, { once: true });
        }
        // If tag gets unmounted, clear pending handles because video metadata is not going to load
        return () => {
            current === null || current === void 0 ? void 0 : current.removeEventListener('loadedmetadata', didLoad);
            (0, delay_render_js_1.continueRender)(newHandle);
        };
    }, [
        src,
        onDuration,
        needsToRenderAudioTag,
        delayRenderRetries,
        delayRenderTimeoutInMilliseconds,
    ]);
    if (!needsToRenderAudioTag) {
        return null;
    }
    return (0, jsx_runtime_1.jsx)("audio", { ref: audioRef, ...nativeProps });
};
exports.AudioForRendering = (0, react_1.forwardRef)(AudioForRenderingRefForwardingFunction);


/***/ }),

/***/ 8888:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(7349), exports);
__exportStar(__webpack_require__(8217), exports);


/***/ }),

/***/ 8217:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 4103:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useSharedAudio = exports.SharedAudioContextProvider = exports.SharedAudioContext = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __importStar(__webpack_require__(6540));
const play_and_handle_not_allowed_error_js_1 = __webpack_require__(7119);
const EMPTY_AUDIO = 'data:audio/mp3;base64,/+MYxAAJcAV8AAgAABn//////+/gQ5BAMA+D4Pg+BAQBAEAwD4Pg+D4EBAEAQDAPg++hYBH///hUFQVBUFREDQNHmf///////+MYxBUGkAGIMAAAAP/29Xt6lUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDUAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
const compareProps = (obj1, obj2) => {
    const keysA = Object.keys(obj1).sort();
    const keysB = Object.keys(obj2).sort();
    if (keysA.length !== keysB.length) {
        return false;
    }
    for (let i = 0; i < keysA.length; i++) {
        // Not the same keys
        if (keysA[i] !== keysB[i]) {
            return false;
        }
        // Not the same values
        if (obj1[keysA[i]] !== obj2[keysB[i]]) {
            return false;
        }
    }
    return true;
};
const didPropChange = (key, newProp, prevProp) => {
    // /music.mp3 and http://localhost:3000/music.mp3 are the same
    if (key === 'src' &&
        !prevProp.startsWith('data:') &&
        !newProp.startsWith('data:')) {
        return (new URL(prevProp, window.origin).toString() !==
            new URL(newProp, window.origin).toString());
    }
    if (prevProp === newProp) {
        return false;
    }
    return true;
};
exports.SharedAudioContext = (0, react_1.createContext)(null);
const SharedAudioContextProvider = ({ children, numberOfAudioTags, component }) => {
    const audios = (0, react_1.useRef)([]);
    const [initialNumberOfAudioTags] = (0, react_1.useState)(numberOfAudioTags);
    if (numberOfAudioTags !== initialNumberOfAudioTags) {
        throw new Error('The number of shared audio tags has changed dynamically. Once you have set this property, you cannot change it afterwards.');
    }
    const refs = (0, react_1.useMemo)(() => {
        return new Array(numberOfAudioTags).fill(true).map(() => {
            return { id: Math.random(), ref: (0, react_1.createRef)() };
        });
    }, [numberOfAudioTags]);
    const takenAudios = (0, react_1.useRef)(new Array(numberOfAudioTags).fill(false));
    const rerenderAudios = (0, react_1.useCallback)(() => {
        refs.forEach(({ ref, id }) => {
            var _a;
            const data = (_a = audios.current) === null || _a === void 0 ? void 0 : _a.find((a) => a.id === id);
            const { current } = ref;
            if (!current) {
                // Whole player has been unmounted, the refs don't exist anymore.
                // It is not an error anymore though
                return;
            }
            if (data === undefined) {
                current.src = EMPTY_AUDIO;
                return;
            }
            if (!data) {
                throw new TypeError('Expected audio data to be there');
            }
            Object.keys(data.props).forEach((key) => {
                // @ts-expect-error
                if (didPropChange(key, data.props[key], current[key])) {
                    // @ts-expect-error
                    current[key] = data.props[key];
                }
            });
        });
    }, [refs]);
    const registerAudio = (0, react_1.useCallback)((aud, audioId) => {
        var _a, _b;
        const found = (_a = audios.current) === null || _a === void 0 ? void 0 : _a.find((a) => a.audioId === audioId);
        if (found) {
            return found;
        }
        const firstFreeAudio = takenAudios.current.findIndex((a) => a === false);
        if (firstFreeAudio === -1) {
            throw new Error(`Tried to simultaneously mount ${numberOfAudioTags + 1} <Audio /> tags at the same time. With the current settings, the maximum amount of <Audio /> tags is limited to ${numberOfAudioTags} at the same time. Remotion pre-mounts silent audio tags to help avoid browser autoplay restrictions. See https://remotion.dev/docs/player/autoplay#use-the-numberofsharedaudiotags-property for more information on how to increase this limit.`);
        }
        const { id, ref } = refs[firstFreeAudio];
        const cloned = [...takenAudios.current];
        cloned[firstFreeAudio] = id;
        takenAudios.current = cloned;
        const newElem = {
            props: aud,
            id,
            el: ref,
            audioId,
        };
        (_b = audios.current) === null || _b === void 0 ? void 0 : _b.push(newElem);
        rerenderAudios();
        return newElem;
    }, [numberOfAudioTags, refs, rerenderAudios]);
    const unregisterAudio = (0, react_1.useCallback)((id) => {
        var _a;
        const cloned = [...takenAudios.current];
        const index = refs.findIndex((r) => r.id === id);
        if (index === -1) {
            throw new TypeError('Error occured in ');
        }
        cloned[index] = false;
        takenAudios.current = cloned;
        audios.current = (_a = audios.current) === null || _a === void 0 ? void 0 : _a.filter((a) => a.id !== id);
        rerenderAudios();
    }, [refs, rerenderAudios]);
    const updateAudio = (0, react_1.useCallback)(({ aud, audioId, id, }) => {
        var _a;
        let changed = false;
        audios.current = (_a = audios.current) === null || _a === void 0 ? void 0 : _a.map((prevA) => {
            if (prevA.id === id) {
                const isTheSame = compareProps(aud, prevA.props);
                if (isTheSame) {
                    return prevA;
                }
                changed = true;
                return {
                    ...prevA,
                    props: aud,
                    audioId,
                };
            }
            return prevA;
        });
        if (changed) {
            rerenderAudios();
        }
    }, [rerenderAudios]);
    const playAllAudios = (0, react_1.useCallback)(() => {
        refs.forEach((ref) => {
            (0, play_and_handle_not_allowed_error_js_1.playAndHandleNotAllowedError)(ref.ref, 'audio', null);
        });
    }, [refs]);
    const value = (0, react_1.useMemo)(() => {
        return {
            registerAudio,
            unregisterAudio,
            updateAudio,
            playAllAudios,
            numberOfAudioTags,
        };
    }, [
        numberOfAudioTags,
        playAllAudios,
        registerAudio,
        unregisterAudio,
        updateAudio,
    ]);
    // Fixing a bug: In React, if a component is unmounted using useInsertionEffect, then
    // the cleanup function does sometimes not work properly. That is why when we
    // are changing the composition, we reset the audio state.
    // TODO: Possibly this does not save the problem completely, since the
    // if an audio tag that is inside a sequence will also not be removed
    // from the shared audios.
    const resetAudio = (0, react_1.useCallback)(() => {
        takenAudios.current = new Array(numberOfAudioTags).fill(false);
        audios.current = [];
        rerenderAudios();
    }, [numberOfAudioTags, rerenderAudios]);
    (0, react_1.useEffect)(() => {
        return () => {
            resetAudio();
        };
    }, [component, resetAudio]);
    return ((0, jsx_runtime_1.jsxs)(exports.SharedAudioContext.Provider, { value: value, children: [refs.map(({ id, ref }) => {
                return (
                // Without preload="metadata", iOS will seek the time internally
                // but not actually with sound. Adding `preload="metadata"` helps here.
                // https://discord.com/channels/809501355504959528/817306414069710848/1130519583367888906
                (0, jsx_runtime_1.jsx)("audio", { ref: ref, preload: "metadata", src: EMPTY_AUDIO }, id));
            }), children] }));
};
exports.SharedAudioContextProvider = SharedAudioContextProvider;
const useSharedAudio = (aud, audioId) => {
    var _a;
    const ctx = (0, react_1.useContext)(exports.SharedAudioContext);
    /**
     * We work around this in React 18 so an audio tag will only register itself once
     */
    const [elem] = (0, react_1.useState)(() => {
        if (ctx && ctx.numberOfAudioTags > 0) {
            return ctx.registerAudio(aud, audioId);
        }
        return {
            el: react_1.default.createRef(),
            id: Math.random(),
            props: aud,
            audioId,
        };
    });
    /**
     * Effects in React 18 fire twice, and we are looking for a way to only fire it once.
     * - useInsertionEffect only fires once. If it's available we are in React 18.
     * - useLayoutEffect only fires once in React 17.
     *
     * Need to import it from React to fix React 17 ESM support.
     */
    const effectToUse = (_a = react_1.default.useInsertionEffect) !== null && _a !== void 0 ? _a : react_1.default.useLayoutEffect;
    if (typeof document !== 'undefined') {
        effectToUse(() => {
            if (ctx && ctx.numberOfAudioTags > 0) {
                ctx.updateAudio({ id: elem.id, aud, audioId });
            }
        }, [aud, ctx, elem.id, audioId]);
        effectToUse(() => {
            return () => {
                if (ctx && ctx.numberOfAudioTags > 0) {
                    ctx.unregisterAudio(elem.id);
                }
            };
        }, [ctx, elem.id]);
    }
    return elem;
};
exports.useSharedAudio = useSharedAudio;


/***/ }),

/***/ 8783:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useFrameForVolumeProp = exports.useMediaStartsAt = void 0;
const react_1 = __webpack_require__(6540);
const SequenceContext_js_1 = __webpack_require__(3822);
const index_js_1 = __webpack_require__(2377);
const use_current_frame_js_1 = __webpack_require__(1041);
const useMediaStartsAt = () => {
    var _a;
    const parentSequence = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const startsAt = Math.min(0, (_a = parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.relativeFrom) !== null && _a !== void 0 ? _a : 0);
    return startsAt;
};
exports.useMediaStartsAt = useMediaStartsAt;
/**
 * When passing a function as the prop for `volume`,
 * we calculate the way more intuitive value for currentFrame
 */
const useFrameForVolumeProp = (behavior) => {
    const loop = index_js_1.Loop.useLoop();
    const frame = (0, use_current_frame_js_1.useCurrentFrame)();
    const startsAt = (0, exports.useMediaStartsAt)();
    if (behavior === 'repeat' || loop === null) {
        return frame + startsAt;
    }
    return frame + startsAt + loop.durationInFrames * loop.iteration;
};
exports.useFrameForVolumeProp = useFrameForVolumeProp;


/***/ }),

/***/ 9623:
/***/ ((__unused_webpack_module, exports) => {


// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/bezier.js
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bezier = bezier;
const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;
const kSplineTableSize = 11;
const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
const float32ArraySupported = typeof Float32Array === 'function';
function a(aA1, aA2) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
function b(aA1, aA2) {
    return 3.0 * aA2 - 6.0 * aA1;
}
function c(aA1) {
    return 3.0 * aA1;
}
// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier(aT, aA1, aA2) {
    return ((a(aA1, aA2) * aT + b(aA1, aA2)) * aT + c(aA1)) * aT;
}
// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope(aT, aA1, aA2) {
    return 3.0 * a(aA1, aA2) * aT * aT + 2.0 * b(aA1, aA2) * aT + c(aA1);
}
function binarySubdivide({ aX, _aA, _aB, mX1, mX2, }) {
    let currentX;
    let currentT;
    let i = 0;
    let aA = _aA;
    let aB = _aB;
    do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) {
            aB = currentT;
        }
        else {
            aA = currentT;
        }
    } while (Math.abs(currentX) > SUBDIVISION_PRECISION &&
        ++i < SUBDIVISION_MAX_ITERATIONS);
    return currentT;
}
function newtonRaphsonIterate(aX, _aGuessT, mX1, mX2) {
    let aGuessT = _aGuessT;
    for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
        const currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) {
            return aGuessT;
        }
        const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
}
function bezier(mX1, mY1, mX2, mY2) {
    if (!(mX1 >= 0 && mX1 <= 1 && mX2 >= 0 && mX2 <= 1)) {
        throw new Error('bezier x values must be in [0, 1] range');
    }
    // Precompute samples table
    const sampleValues = float32ArraySupported
        ? new Float32Array(kSplineTableSize)
        : new Array(kSplineTableSize);
    if (mX1 !== mY1 || mX2 !== mY2) {
        for (let i = 0; i < kSplineTableSize; ++i) {
            sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
    }
    function getTForX(aX) {
        let intervalStart = 0.0;
        let currentSample = 1;
        const lastSample = kSplineTableSize - 1;
        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
            intervalStart += kSampleStepSize;
        }
        --currentSample;
        // Interpolate to provide an initial guess for t
        const dist = (aX - sampleValues[currentSample]) /
            (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        const guessForT = intervalStart + dist * kSampleStepSize;
        const initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
            return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        }
        if (initialSlope === 0.0) {
            return guessForT;
        }
        return binarySubdivide({
            aX,
            _aA: intervalStart,
            _aB: intervalStart + kSampleStepSize,
            mX1,
            mX2,
        });
    }
    return function (x) {
        if (mX1 === mY1 && mX2 === mY2) {
            return x; // linear
        }
        // Because JavaScript number are imprecise, we should guarantee the extremes are right.
        if (x === 0) {
            return 0;
        }
        if (x === 1) {
            return 1;
        }
        return calcBezier(getTForX(x), mY1, mY2);
    };
}


/***/ }),

/***/ 7492:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useBufferUntilFirstFrame = void 0;
const react_1 = __webpack_require__(6540);
const use_buffer_state_1 = __webpack_require__(204);
const useBufferUntilFirstFrame = ({ mediaRef, mediaType, onVariableFpsVideoDetected, pauseWhenBuffering, }) => {
    const bufferingRef = (0, react_1.useRef)(false);
    const { delayPlayback } = (0, use_buffer_state_1.useBufferState)();
    const bufferUntilFirstFrame = (0, react_1.useCallback)((requestedTime) => {
        if (mediaType !== 'video') {
            return;
        }
        if (!pauseWhenBuffering) {
            return;
        }
        const current = mediaRef.current;
        if (!current) {
            return;
        }
        if (!current.requestVideoFrameCallback) {
            return;
        }
        bufferingRef.current = true;
        const playback = delayPlayback();
        const unblock = () => {
            playback.unblock();
            current.removeEventListener('ended', unblock, {
                // @ts-expect-error
                once: true,
            });
            current.removeEventListener('pause', unblock, {
                // @ts-expect-error
                once: true,
            });
            bufferingRef.current = false;
        };
        const onEndedOrPauseOrCanPlay = () => {
            unblock();
        };
        current.requestVideoFrameCallback((_, info) => {
            const differenceFromRequested = Math.abs(info.mediaTime - requestedTime);
            if (differenceFromRequested > 0.5) {
                onVariableFpsVideoDetected();
            }
            unblock();
        });
        current.addEventListener('ended', onEndedOrPauseOrCanPlay, { once: true });
        current.addEventListener('pause', onEndedOrPauseOrCanPlay, { once: true });
        current.addEventListener('canplay', onEndedOrPauseOrCanPlay, {
            once: true,
        });
    }, [
        delayPlayback,
        mediaRef,
        mediaType,
        onVariableFpsVideoDetected,
        pauseWhenBuffering,
    ]);
    return (0, react_1.useMemo)(() => {
        return {
            isBuffering: () => bufferingRef.current,
            bufferUntilFirstFrame,
        };
    }, [bufferUntilFirstFrame]);
};
exports.useBufferUntilFirstFrame = useBufferUntilFirstFrame;


/***/ }),

/***/ 9076:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useIsPlayerBuffering = exports.BufferingProvider = exports.BufferingContextReact = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __importStar(__webpack_require__(6540));
const useBufferManager = () => {
    const [blocks, setBlocks] = (0, react_1.useState)([]);
    const [onBufferingCallbacks, setOnBufferingCallbacks] = (0, react_1.useState)([]);
    const [onResumeCallbacks, setOnResumeCallbacks] = (0, react_1.useState)([]);
    const buffering = (0, react_1.useRef)(false);
    const addBlock = (0, react_1.useCallback)((block) => {
        setBlocks((b) => [...b, block]);
        return {
            unblock: () => {
                setBlocks((b) => {
                    const newArr = b.filter((bx) => bx !== block);
                    if (newArr.length === b.length) {
                        return b;
                    }
                    return newArr;
                });
            },
        };
    }, []);
    const listenForBuffering = (0, react_1.useCallback)((callback) => {
        setOnBufferingCallbacks((c) => [...c, callback]);
        return {
            remove: () => {
                setOnBufferingCallbacks((c) => c.filter((cb) => cb !== callback));
            },
        };
    }, []);
    const listenForResume = (0, react_1.useCallback)((callback) => {
        setOnResumeCallbacks((c) => [...c, callback]);
        return {
            remove: () => {
                setOnResumeCallbacks((c) => c.filter((cb) => cb !== callback));
            },
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (blocks.length > 0) {
            onBufferingCallbacks.forEach((c) => c());
        }
        // Intentionally only firing when blocks change, not the callbacks
        // otherwise a buffering callback might remove itself after being called
        // and trigger again
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocks]);
    (0, react_1.useEffect)(() => {
        if (blocks.length === 0) {
            onResumeCallbacks.forEach((c) => c());
        }
        // Intentionally only firing when blocks change, not the callbacks
        // otherwise a resume callback might remove itself after being called
        // and trigger again
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocks]);
    return (0, react_1.useMemo)(() => {
        return { addBlock, listenForBuffering, listenForResume, buffering };
    }, [addBlock, buffering, listenForBuffering, listenForResume]);
};
exports.BufferingContextReact = react_1.default.createContext(null);
const BufferingProvider = ({ children }) => {
    const bufferManager = useBufferManager();
    return ((0, jsx_runtime_1.jsx)(exports.BufferingContextReact.Provider, { value: bufferManager, children: children }));
};
exports.BufferingProvider = BufferingProvider;
const useIsPlayerBuffering = (bufferManager) => {
    const [isBuffering, setIsBuffering] = (0, react_1.useState)(bufferManager.buffering.current);
    (0, react_1.useEffect)(() => {
        const onBuffer = () => {
            setIsBuffering(true);
        };
        const onResume = () => {
            setIsBuffering(false);
        };
        bufferManager.listenForBuffering(onBuffer);
        bufferManager.listenForResume(onResume);
        return () => {
            bufferManager.listenForBuffering(() => undefined);
            bufferManager.listenForResume(() => undefined);
        };
    }, [bufferManager]);
    return isBuffering;
};
exports.useIsPlayerBuffering = useIsPlayerBuffering;


/***/ }),

/***/ 773:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calculateLoopDuration = void 0;
const calculateLoopDuration = ({ endAt, mediaDuration, playbackRate, startFrom, }) => {
    let duration = mediaDuration;
    // Account for endAt
    if (typeof endAt !== 'undefined') {
        duration = endAt;
    }
    // Account for startFrom
    if (typeof startFrom !== 'undefined') {
        duration -= startFrom;
    }
    const actualDuration = duration / playbackRate;
    return Math.floor(actualDuration);
};
exports.calculateLoopDuration = calculateLoopDuration;


/***/ }),

/***/ 8439:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cancelRender = cancelRender;
const isErrorLike = (err) => {
    if (err instanceof Error) {
        return true;
    }
    if (err === null) {
        return false;
    }
    if (typeof err !== 'object') {
        return false;
    }
    if (!('stack' in err)) {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore we just asserted
    if (typeof err.stack !== 'string') {
        return false;
    }
    if (!('message' in err)) {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore we just asserted
    if (typeof err.message !== 'string') {
        return false;
    }
    return true;
};
/**
 * @description When you invoke this function, Remotion will stop rendering all the frames without any retries
 * @see [Documentation](https://www.remotion.dev/docs/cancel-render)
 */
function cancelRender(err) {
    let error;
    if (isErrorLike(err)) {
        error = err;
        if (!error.stack) {
            error.stack = new Error(error.message).stack;
        }
    }
    else if (typeof err === 'string') {
        error = Error(err);
    }
    else {
        error = Error('Rendering was cancelled');
    }
    window.remotion_cancelledError = error.stack;
    throw error;
}


/***/ }),

/***/ 5528:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_CODEC = exports.validCodecs = void 0;
exports.validCodecs = [
    'h264',
    'h265',
    'vp8',
    'vp9',
    'mp3',
    'aac',
    'wav',
    'prores',
    'h264-mkv',
    'h264-ts',
    'gif',
];
exports.DEFAULT_CODEC = 'h264';


/***/ }),

/***/ 3678:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getInputProps = void 0;
const get_remotion_environment_js_1 = __webpack_require__(7356);
const input_props_serialization_js_1 = __webpack_require__(4532);
let didWarnSSRImport = false;
const warnOnceSSRImport = () => {
    if (didWarnSSRImport) {
        return;
    }
    didWarnSSRImport = true;
    // eslint-disable-next-line no-console
    console.warn('Called `getInputProps()` on the server. This function is not available server-side and has returned an empty object.');
    // eslint-disable-next-line no-console
    console.warn("To hide this warning, don't call this function on the server:");
    // eslint-disable-next-line no-console
    console.warn("  typeof window === 'undefined' ? {} : getInputProps()");
};
const getInputProps = () => {
    if (typeof window === 'undefined') {
        warnOnceSSRImport();
        return {};
    }
    if ((0, get_remotion_environment_js_1.getRemotionEnvironment)().isPlayer) {
        throw new Error('You cannot call `getInputProps()` from a <Player>. Instead, the props are available as React props from component that you passed as `component` prop.');
    }
    const param = window.remotion_inputProps;
    if (!param) {
        return {};
    }
    const parsed = (0, input_props_serialization_js_1.deserializeJSONWithCustomFields)(param);
    return parsed;
};
exports.getInputProps = getInputProps;


/***/ }),

/***/ 6345:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.makeDefaultPreviewCSS = exports.OFFTHREAD_VIDEO_CLASS_NAME = exports.injectCSS = void 0;
const injected = {};
const injectCSS = (css) => {
    // Skip in node
    if (typeof document === 'undefined') {
        return;
    }
    if (injected[css]) {
        return;
    }
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(css));
    head.prepend(style);
    injected[css] = true;
};
exports.injectCSS = injectCSS;
exports.OFFTHREAD_VIDEO_CLASS_NAME = '__remotion_offthreadvideo';
const makeDefaultPreviewCSS = (scope, backgroundColor) => {
    if (!scope) {
        return `
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
	    background-color: ${backgroundColor};
    }
    .${exports.OFFTHREAD_VIDEO_CLASS_NAME} {
      object-fit: contain;
    }
    `;
    }
    return `
    ${scope} * {
      box-sizing: border-box;
    }
    ${scope} *:-webkit-full-screen {
      width: 100%;
      height: 100%;
    }
    ${scope} .${exports.OFFTHREAD_VIDEO_CLASS_NAME} {
      object-fit: contain;
    }
  `;
};
exports.makeDefaultPreviewCSS = makeDefaultPreviewCSS;


/***/ }),

/***/ 1006:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.continueRender = exports.delayRender = exports.DELAY_RENDER_RETRY_TOKEN = exports.DELAY_RENDER_RETRIES_LEFT = exports.DELAY_RENDER_CALLSTACK_TOKEN = void 0;
const cancel_render_js_1 = __webpack_require__(8439);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const truthy_js_1 = __webpack_require__(108);
if (typeof window !== 'undefined') {
    window.remotion_renderReady = false;
}
let handles = [];
if (typeof window !== 'undefined') {
    window.remotion_delayRenderTimeouts = {};
}
exports.DELAY_RENDER_CALLSTACK_TOKEN = 'The delayRender was called:';
exports.DELAY_RENDER_RETRIES_LEFT = 'Retries left: ';
exports.DELAY_RENDER_RETRY_TOKEN = '- Rendering the frame will be retried.';
const defaultTimeout = 30000;
/**
 * @description Call this function to tell Remotion to wait before capturing this frame until data has loaded. Use continueRender() to unblock the render.
 * @param label _optional_ A label to identify the call in case it does time out.
 * @returns {number} An identifier to be passed to continueRender().
 * @see [Documentation](https://www.remotion.dev/docs/delay-render)
 */
const delayRender = (label, options) => {
    var _a, _b, _c, _d, _e;
    if (typeof label !== 'string' && typeof label !== 'undefined') {
        throw new Error('The label parameter of delayRender() must be a string or undefined, got: ' +
            JSON.stringify(label));
    }
    const handle = Math.random();
    handles.push(handle);
    const called = (_b = (_a = Error().stack) === null || _a === void 0 ? void 0 : _a.replace(/^Error/g, '')) !== null && _b !== void 0 ? _b : '';
    if ((0, get_remotion_environment_js_1.getRemotionEnvironment)().isRendering) {
        const timeoutToUse = ((_c = options === null || options === void 0 ? void 0 : options.timeoutInMilliseconds) !== null && _c !== void 0 ? _c : (typeof window === 'undefined'
            ? defaultTimeout
            : ((_d = window.remotion_puppeteerTimeout) !== null && _d !== void 0 ? _d : defaultTimeout))) - 2000;
        if (typeof window !== 'undefined') {
            const retriesLeft = ((_e = options === null || options === void 0 ? void 0 : options.retries) !== null && _e !== void 0 ? _e : 0) - (window.remotion_attempt - 1);
            window.remotion_delayRenderTimeouts[handle] = {
                label: label !== null && label !== void 0 ? label : null,
                timeout: setTimeout(() => {
                    const message = [
                        `A delayRender()`,
                        label ? `"${label}"` : null,
                        `was called but not cleared after ${timeoutToUse}ms. See https://remotion.dev/docs/timeout for help.`,
                        retriesLeft > 0 ? exports.DELAY_RENDER_RETRIES_LEFT + retriesLeft : null,
                        retriesLeft > 0 ? exports.DELAY_RENDER_RETRY_TOKEN : null,
                        exports.DELAY_RENDER_CALLSTACK_TOKEN,
                        called,
                    ]
                        .filter(truthy_js_1.truthy)
                        .join(' ');
                    (0, cancel_render_js_1.cancelRender)(Error(message));
                }, timeoutToUse),
            };
        }
    }
    if (typeof window !== 'undefined') {
        window.remotion_renderReady = false;
    }
    return handle;
};
exports.delayRender = delayRender;
/**
 * @description Unblock a render that has been blocked by delayRender()
 * @param handle The return value of delayRender().
 * @see [Documentation](https://www.remotion.dev/docs/continue-render)
 */
const continueRender = (handle) => {
    if (typeof handle === 'undefined') {
        throw new TypeError('The continueRender() method must be called with a parameter that is the return value of delayRender(). No value was passed.');
    }
    if (typeof handle !== 'number') {
        throw new TypeError('The parameter passed into continueRender() must be the return value of delayRender() which is a number. Got: ' +
            JSON.stringify(handle));
    }
    handles = handles.filter((h) => {
        if (h === handle) {
            if ((0, get_remotion_environment_js_1.getRemotionEnvironment)().isRendering) {
                clearTimeout(window.remotion_delayRenderTimeouts[handle].timeout);
                delete window.remotion_delayRenderTimeouts[handle];
            }
            return false;
        }
        return true;
    });
    if (handles.length === 0 && typeof window !== 'undefined') {
        window.remotion_renderReady = true;
    }
};
exports.continueRender = continueRender;


/***/ }),

/***/ 2021:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/Easing.js
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Easing = void 0;
const bezier_js_1 = __webpack_require__(9623);
/**
 * @description The Easing module implements common easing functions. You can use it with the interpolate() API.
 * @see [Documentation](https://www.remotion.dev/docs/easing)
 */
class Easing {
    static step0(n) {
        return n > 0 ? 1 : 0;
    }
    static step1(n) {
        return n >= 1 ? 1 : 0;
    }
    static linear(t) {
        return t;
    }
    static ease(t) {
        return Easing.bezier(0.42, 0, 1, 1)(t);
    }
    static quad(t) {
        return t * t;
    }
    static cubic(t) {
        return t * t * t;
    }
    static poly(n) {
        return (t) => t ** n;
    }
    static sin(t) {
        return 1 - Math.cos((t * Math.PI) / 2);
    }
    static circle(t) {
        return 1 - Math.sqrt(1 - t * t);
    }
    static exp(t) {
        return 2 ** (10 * (t - 1));
    }
    static elastic(bounciness = 1) {
        const p = bounciness * Math.PI;
        return (t) => 1 - Math.cos((t * Math.PI) / 2) ** 3 * Math.cos(t * p);
    }
    static back(s = 1.70158) {
        return (t) => t * t * ((s + 1) * t - s);
    }
    static bounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        }
        if (t < 2 / 2.75) {
            const t2_ = t - 1.5 / 2.75;
            return 7.5625 * t2_ * t2_ + 0.75;
        }
        if (t < 2.5 / 2.75) {
            const t2_ = t - 2.25 / 2.75;
            return 7.5625 * t2_ * t2_ + 0.9375;
        }
        const t2 = t - 2.625 / 2.75;
        return 7.5625 * t2 * t2 + 0.984375;
    }
    static bezier(x1, y1, x2, y2) {
        return (0, bezier_js_1.bezier)(x1, y1, x2, y2);
    }
    static in(easing) {
        return easing;
    }
    static out(easing) {
        return (t) => 1 - easing(1 - t);
    }
    static inOut(easing) {
        return (t) => {
            if (t < 0.5) {
                return easing(t * 2) / 2;
            }
            return 1 - easing((1 - t) * 2) / 2;
        };
    }
}
exports.Easing = Easing;


/***/ }),

/***/ 9599:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addSequenceStackTraces = exports.enableSequenceStackTraces = void 0;
const react_1 = __importDefault(__webpack_require__(6540));
const get_remotion_environment_1 = __webpack_require__(7356);
const originalCreateElement = react_1.default.createElement;
const componentsToAddStacksTo = [];
// Gets called when a new component is added,
// also when the Studio is mounted
const enableSequenceStackTraces = () => {
    if (!(0, get_remotion_environment_1.getRemotionEnvironment)().isStudio) {
        return;
    }
    const proxy = new Proxy(originalCreateElement, {
        apply(target, thisArg, argArray) {
            if (componentsToAddStacksTo.includes(argArray[0])) {
                const [first, props, ...rest] = argArray;
                const newProps = {
                    ...(props !== null && props !== void 0 ? props : {}),
                    stack: new Error().stack,
                };
                return Reflect.apply(target, thisArg, [first, newProps, ...rest]);
            }
            return Reflect.apply(target, thisArg, argArray);
        },
    });
    react_1.default.createElement = proxy;
};
exports.enableSequenceStackTraces = enableSequenceStackTraces;
const addSequenceStackTraces = (component) => {
    componentsToAddStacksTo.push(component);
    (0, exports.enableSequenceStackTraces)();
};
exports.addSequenceStackTraces = addSequenceStackTraces;


/***/ }),

/***/ 931:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Freeze = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const SequenceContext_js_1 = __webpack_require__(3822);
const timeline_position_state_js_1 = __webpack_require__(8019);
const use_current_frame_js_1 = __webpack_require__(1041);
const use_video_config_js_1 = __webpack_require__(7770);
/**
 * @description This method freezes all of its children to the frame that you specify as a prop
 * @see [Documentation](https://www.remotion.dev/docs/freeze)
 */
const Freeze = ({ frame: frameToFreeze, children, active = true, }) => {
    var _a;
    const frame = (0, use_current_frame_js_1.useCurrentFrame)();
    const videoConfig = (0, use_video_config_js_1.useVideoConfig)();
    if (typeof frameToFreeze === 'undefined') {
        throw new Error(`The <Freeze /> component requires a 'frame' prop, but none was passed.`);
    }
    if (typeof frameToFreeze !== 'number') {
        throw new Error(`The 'frame' prop of <Freeze /> must be a number, but is of type ${typeof frameToFreeze}`);
    }
    if (Number.isNaN(frameToFreeze)) {
        throw new Error(`The 'frame' prop of <Freeze /> must be a real number, but it is NaN.`);
    }
    if (!Number.isFinite(frameToFreeze)) {
        throw new Error(`The 'frame' prop of <Freeze /> must be a finite number, but it is ${frameToFreeze}.`);
    }
    const isActive = (0, react_1.useMemo)(() => {
        if (typeof active === 'boolean') {
            return active;
        }
        if (typeof active === 'function') {
            return active(frame);
        }
    }, [active, frame]);
    const timelineContext = (0, react_1.useContext)(timeline_position_state_js_1.TimelineContext);
    const sequenceContext = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const relativeFrom = (_a = sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom) !== null && _a !== void 0 ? _a : 0;
    const timelineValue = (0, react_1.useMemo)(() => {
        if (!isActive) {
            return timelineContext;
        }
        return {
            ...timelineContext,
            playing: false,
            imperativePlaying: {
                current: false,
            },
            frame: {
                [videoConfig.id]: frameToFreeze + relativeFrom,
            },
        };
    }, [isActive, timelineContext, videoConfig.id, frameToFreeze, relativeFrom]);
    return ((0, jsx_runtime_1.jsx)(timeline_position_state_js_1.TimelineContext.Provider, { value: timelineValue, children: children }));
};
exports.Freeze = Freeze;


/***/ }),

/***/ 468:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getAssetDisplayName = void 0;
const getAssetDisplayName = (filename) => {
    if (/data:|blob:/.test(filename.substring(0, 5))) {
        return 'Data URL';
    }
    const splitted = filename
        .split('/')
        .map((s) => s.split('\\'))
        .flat(1);
    return splitted[splitted.length - 1];
};
exports.getAssetDisplayName = getAssetDisplayName;


/***/ }),

/***/ 8483:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getPreviewDomElement = exports.REMOTION_STUDIO_CONTAINER_ELEMENT = void 0;
exports.REMOTION_STUDIO_CONTAINER_ELEMENT = '__remotion-studio-container';
const getPreviewDomElement = () => {
    return document.getElementById(exports.REMOTION_STUDIO_CONTAINER_ELEMENT);
};
exports.getPreviewDomElement = getPreviewDomElement;


/***/ }),

/***/ 7356:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getRemotionEnvironment = void 0;
// Avoid VITE obfuscation
function getNodeEnvString() {
    return ['NOD', 'E_EN', 'V'].join('');
}
const getEnvString = () => {
    return ['e', 'nv'].join('');
};
/**
 * @description Provides information about the Remotion Environment
 * @see [Documentation](https://www.remotion.dev/docs/get-remotion-environment)
 */
const getRemotionEnvironment = () => {
    const isPlayer = typeof window !== 'undefined' && window.remotion_isPlayer;
    const isRendering = typeof window !== 'undefined' &&
        typeof window.process !== 'undefined' &&
        typeof window.process.env !== 'undefined' &&
        (window.process[getEnvString()][getNodeEnvString()] === 'test' ||
            (window.process[getEnvString()][getNodeEnvString()] === 'production' &&
                typeof window !== 'undefined' &&
                typeof window.remotion_puppeteerTimeout !== 'undefined'));
    const isStudio = typeof window !== 'undefined' && window.remotion_isStudio;
    const isReadOnlyStudio = typeof window !== 'undefined' && window.remotion_isReadOnlyStudio;
    return {
        isStudio,
        isRendering,
        isPlayer,
        isReadOnlyStudio,
    };
};
exports.getRemotionEnvironment = getRemotionEnvironment;


/***/ }),

/***/ 7835:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getStaticFiles = void 0;
const v5_flag_1 = __webpack_require__(8232);
let warnedServer = false;
let warnedPlayer = false;
const warnServerOnce = () => {
    if (warnedServer) {
        return;
    }
    warnedServer = true;
    // eslint-disable-next-line no-console
    console.warn('Called getStaticFiles() on the server. The API is only available in the browser. An empty array was returned.');
};
const warnPlayerOnce = () => {
    if (warnedPlayer) {
        return;
    }
    warnedPlayer = true;
    // eslint-disable-next-line no-console
    console.warn('Called getStaticFiles() while using the Remotion Player. The API is only available while using the Remotion Studio. An empty array was returned.');
};
/**
 * @description The function array containing all files in the public/ folder. You can reference them by using staticFile().
 * @see [Documentation](https://www.remotion.dev/docs/getstaticfiles)
 */
const getStaticFiles = () => {
    if (v5_flag_1.ENABLE_V5_BREAKING_CHANGES) {
        throw new Error('getStaticFiles() has moved into the `@remotion/studio` package. Update your imports.');
    }
    if (typeof document === 'undefined') {
        warnServerOnce();
        return [];
    }
    if (window.remotion_isPlayer) {
        warnPlayerOnce();
        return [];
    }
    return window.remotion_staticFiles;
};
exports.getStaticFiles = getStaticFiles;


/***/ }),

/***/ 3626:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Config = exports.Experimental = exports.watchStaticFile = exports.useCurrentScale = exports.useCurrentFrame = exports.useBufferState = exports.staticFile = exports.Series = exports.Sequence = exports.registerRoot = exports.prefetch = exports.random = exports.interpolate = exports.Loop = exports.interpolateColors = exports.Img = exports.getStaticFiles = exports.getRemotionEnvironment = exports.delayRender = exports.continueRender = exports.getInputProps = exports.Composition = exports.cancelRender = exports.Artifact = void 0;
__webpack_require__(2466);
__webpack_require__(8330);
const Clipper_js_1 = __webpack_require__(4411);
const enable_sequence_stack_traces_js_1 = __webpack_require__(9599);
const is_player_js_1 = __webpack_require__(5516);
const multiple_versions_warning_js_1 = __webpack_require__(5241);
const Null_js_1 = __webpack_require__(3017);
const Sequence_js_1 = __webpack_require__(7973);
(0, multiple_versions_warning_js_1.checkMultipleRemotionVersions)();
__exportStar(__webpack_require__(1488), exports);
var Artifact_js_1 = __webpack_require__(5998);
Object.defineProperty(exports, "Artifact", ({ enumerable: true, get: function () { return Artifact_js_1.Artifact; } }));
__exportStar(__webpack_require__(8888), exports);
var cancel_render_js_1 = __webpack_require__(8439);
Object.defineProperty(exports, "cancelRender", ({ enumerable: true, get: function () { return cancel_render_js_1.cancelRender; } }));
var Composition_js_1 = __webpack_require__(2040);
Object.defineProperty(exports, "Composition", ({ enumerable: true, get: function () { return Composition_js_1.Composition; } }));
var input_props_js_1 = __webpack_require__(3678);
Object.defineProperty(exports, "getInputProps", ({ enumerable: true, get: function () { return input_props_js_1.getInputProps; } }));
var delay_render_js_1 = __webpack_require__(1006);
Object.defineProperty(exports, "continueRender", ({ enumerable: true, get: function () { return delay_render_js_1.continueRender; } }));
Object.defineProperty(exports, "delayRender", ({ enumerable: true, get: function () { return delay_render_js_1.delayRender; } }));
__exportStar(__webpack_require__(2021), exports);
__exportStar(__webpack_require__(5236), exports);
__exportStar(__webpack_require__(931), exports);
var get_remotion_environment_js_1 = __webpack_require__(7356);
Object.defineProperty(exports, "getRemotionEnvironment", ({ enumerable: true, get: function () { return get_remotion_environment_js_1.getRemotionEnvironment; } }));
var get_static_files_js_1 = __webpack_require__(7835);
Object.defineProperty(exports, "getStaticFiles", ({ enumerable: true, get: function () { return get_static_files_js_1.getStaticFiles; } }));
__exportStar(__webpack_require__(7388), exports);
var Img_js_1 = __webpack_require__(6669);
Object.defineProperty(exports, "Img", ({ enumerable: true, get: function () { return Img_js_1.Img; } }));
__exportStar(__webpack_require__(240), exports);
var interpolate_colors_js_1 = __webpack_require__(2358);
Object.defineProperty(exports, "interpolateColors", ({ enumerable: true, get: function () { return interpolate_colors_js_1.interpolateColors; } }));
var index_js_1 = __webpack_require__(2377);
Object.defineProperty(exports, "Loop", ({ enumerable: true, get: function () { return index_js_1.Loop; } }));
var no_react_1 = __webpack_require__(2453);
Object.defineProperty(exports, "interpolate", ({ enumerable: true, get: function () { return no_react_1.interpolate; } }));
Object.defineProperty(exports, "random", ({ enumerable: true, get: function () { return no_react_1.random; } }));
var prefetch_js_1 = __webpack_require__(1011);
Object.defineProperty(exports, "prefetch", ({ enumerable: true, get: function () { return prefetch_js_1.prefetch; } }));
var register_root_js_1 = __webpack_require__(8562);
Object.defineProperty(exports, "registerRoot", ({ enumerable: true, get: function () { return register_root_js_1.registerRoot; } }));
var Sequence_js_2 = __webpack_require__(7973);
Object.defineProperty(exports, "Sequence", ({ enumerable: true, get: function () { return Sequence_js_2.Sequence; } }));
var index_js_2 = __webpack_require__(1886);
Object.defineProperty(exports, "Series", ({ enumerable: true, get: function () { return index_js_2.Series; } }));
__exportStar(__webpack_require__(2398), exports);
var static_file_js_1 = __webpack_require__(2397);
Object.defineProperty(exports, "staticFile", ({ enumerable: true, get: function () { return static_file_js_1.staticFile; } }));
__exportStar(__webpack_require__(5076), exports);
var use_buffer_state_1 = __webpack_require__(204);
Object.defineProperty(exports, "useBufferState", ({ enumerable: true, get: function () { return use_buffer_state_1.useBufferState; } }));
var use_current_frame_js_1 = __webpack_require__(1041);
Object.defineProperty(exports, "useCurrentFrame", ({ enumerable: true, get: function () { return use_current_frame_js_1.useCurrentFrame; } }));
var use_current_scale_1 = __webpack_require__(7218);
Object.defineProperty(exports, "useCurrentScale", ({ enumerable: true, get: function () { return use_current_scale_1.useCurrentScale; } }));
__exportStar(__webpack_require__(7770), exports);
__exportStar(__webpack_require__(6558), exports);
__exportStar(__webpack_require__(2400), exports);
__exportStar(__webpack_require__(1506), exports);
var watch_static_file_js_1 = __webpack_require__(3563);
Object.defineProperty(exports, "watchStaticFile", ({ enumerable: true, get: function () { return watch_static_file_js_1.watchStaticFile; } }));
exports.Experimental = {
    /**
     * @description This is a special component that will cause Remotion to only partially capture the frame of the video.
     * @see [Documentation](https://www.remotion.dev/docs/clipper)
     */
    Clipper: Clipper_js_1.Clipper,
    /**
     * @description This is a special component, that, when rendered, will skip rendering the frame altogether.
     * @see [Documentation](https://www.remotion.dev/docs/null)
     */
    Null: Null_js_1.Null,
    useIsPlayer: is_player_js_1.useIsPlayer,
};
const proxyObj = {};
exports.Config = new Proxy(proxyObj, {
    get(_, prop) {
        if (prop === 'Bundling' ||
            prop === 'Rendering' ||
            prop === 'Log' ||
            prop === 'Puppeteer' ||
            prop === 'Output') {
            return exports.Config;
        }
        return () => {
            /* eslint-disable no-console */
            console.warn('⚠️  The CLI configuration has been extracted from Remotion Core.');
            console.warn('Update the import from the config file:');
            console.warn();
            console.warn('- Delete:');
            console.warn('import {Config} from "remotion";');
            console.warn('+ Replace:');
            console.warn('import {Config} from "@remotion/cli/config";');
            console.warn();
            console.warn('For more information, see https://www.remotion.dev/docs/4-0-migration.');
            /* eslint-enable no-console */
            process.exit(1);
        };
    },
});
(0, enable_sequence_stack_traces_js_1.addSequenceStackTraces)(Sequence_js_1.Sequence);


/***/ }),

/***/ 4532:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// Must keep this file in sync with the one in packages/lambda/src/shared/serialize-props.ts!
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.serializeThenDeserializeInStudio = exports.deserializeJSONWithCustomFields = exports.serializeJSONWithDate = exports.FILE_TOKEN = exports.DATE_TOKEN = void 0;
const get_remotion_environment_js_1 = __webpack_require__(7356);
const static_file_js_1 = __webpack_require__(2397);
exports.DATE_TOKEN = 'remotion-date:';
exports.FILE_TOKEN = 'remotion-file:';
const serializeJSONWithDate = ({ data, indent, staticBase, }) => {
    let customDateUsed = false;
    let customFileUsed = false;
    let mapUsed = false;
    let setUsed = false;
    try {
        const serializedString = JSON.stringify(data, function (key, value) {
            const item = this[key];
            if (item instanceof Date) {
                customDateUsed = true;
                return `${exports.DATE_TOKEN}${item.toISOString()}`;
            }
            if (item instanceof Map) {
                mapUsed = true;
                return value;
            }
            if (item instanceof Set) {
                setUsed = true;
                return value;
            }
            if (typeof item === 'string' &&
                staticBase !== null &&
                item.startsWith(staticBase)) {
                customFileUsed = true;
                return `${exports.FILE_TOKEN}${item.replace(staticBase + '/', '')}`;
            }
            return value;
        }, indent);
        return { serializedString, customDateUsed, customFileUsed, mapUsed, setUsed };
    }
    catch (err) {
        throw new Error('Could not serialize the passed input props to JSON: ' +
            err.message);
    }
};
exports.serializeJSONWithDate = serializeJSONWithDate;
const deserializeJSONWithCustomFields = (data) => {
    return JSON.parse(data, (_, value) => {
        if (typeof value === 'string' && value.startsWith(exports.DATE_TOKEN)) {
            return new Date(value.replace(exports.DATE_TOKEN, ''));
        }
        if (typeof value === 'string' && value.startsWith(exports.FILE_TOKEN)) {
            return (0, static_file_js_1.staticFile)(value.replace(exports.FILE_TOKEN, ''));
        }
        return value;
    });
};
exports.deserializeJSONWithCustomFields = deserializeJSONWithCustomFields;
const serializeThenDeserializeInStudio = (props) => {
    // Serializing once in the Studio, to catch potential serialization errors before
    // you only get them during rendering
    if ((0, get_remotion_environment_js_1.getRemotionEnvironment)().isStudio) {
        return (0, exports.deserializeJSONWithCustomFields)((0, exports.serializeJSONWithDate)({
            data: props,
            indent: 2,
            staticBase: window.remotion_staticBase,
        }).serializedString);
    }
    return props;
};
exports.serializeThenDeserializeInStudio = serializeThenDeserializeInStudio;


/***/ }),

/***/ 240:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Internals = void 0;
const shared_audio_tags_js_1 = __webpack_require__(4103);
const use_audio_frame_js_1 = __webpack_require__(8783);
const buffering_js_1 = __webpack_require__(9076);
const CanUseRemotionHooks_js_1 = __webpack_require__(5108);
const CompositionManager_js_1 = __webpack_require__(477);
const CompositionManagerContext_js_1 = __webpack_require__(9126);
const CSSUtils = __importStar(__webpack_require__(6345));
const EditorProps_js_1 = __webpack_require__(5963);
const enable_sequence_stack_traces_js_1 = __webpack_require__(9599);
const get_preview_dom_element_js_1 = __webpack_require__(8483);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const is_player_js_1 = __webpack_require__(5516);
const nonce_js_1 = __webpack_require__(2501);
const portal_node_js_1 = __webpack_require__(2159);
const prefetch_state_js_1 = __webpack_require__(2171);
const prefetch_js_1 = __webpack_require__(1011);
const register_root_js_1 = __webpack_require__(8562);
const RemotionRoot_js_1 = __webpack_require__(7407);
const RenderAssetManager_js_1 = __webpack_require__(599);
const resolve_video_config_js_1 = __webpack_require__(7611);
const ResolveCompositionConfig_js_1 = __webpack_require__(7240);
const SequenceContext_js_1 = __webpack_require__(3822);
const SequenceManager_js_1 = __webpack_require__(9962);
const setup_env_variables_js_1 = __webpack_require__(4073);
const TimelinePosition = __importStar(__webpack_require__(8019));
const timeline_position_state_js_1 = __webpack_require__(8019);
const truthy_js_1 = __webpack_require__(108);
const use_current_scale_js_1 = __webpack_require__(7218);
const use_lazy_component_js_1 = __webpack_require__(4534);
const use_unsafe_video_config_js_1 = __webpack_require__(3881);
const use_video_js_1 = __webpack_require__(3523);
const validate_artifact_js_1 = __webpack_require__(803);
const validate_composition_id_js_1 = __webpack_require__(1969);
const duration_state_js_1 = __webpack_require__(1152);
const video_fragment_js_1 = __webpack_require__(6658);
const volume_position_state_js_1 = __webpack_require__(8068);
const watch_static_file_js_1 = __webpack_require__(3563);
const wrap_remotion_context_js_1 = __webpack_require__(8024);
// Mark them as Internals so use don't assume this is public
// API and are less likely to use it
exports.Internals = {
    useUnsafeVideoConfig: use_unsafe_video_config_js_1.useUnsafeVideoConfig,
    Timeline: TimelinePosition,
    CompositionManager: CompositionManagerContext_js_1.CompositionManager,
    SequenceManager: SequenceManager_js_1.SequenceManager,
    SequenceVisibilityToggleContext: SequenceManager_js_1.SequenceVisibilityToggleContext,
    RemotionRoot: RemotionRoot_js_1.RemotionRoot,
    useVideo: use_video_js_1.useVideo,
    getRoot: register_root_js_1.getRoot,
    useMediaVolumeState: volume_position_state_js_1.useMediaVolumeState,
    useMediaMutedState: volume_position_state_js_1.useMediaMutedState,
    useLazyComponent: use_lazy_component_js_1.useLazyComponent,
    truthy: truthy_js_1.truthy,
    SequenceContext: SequenceContext_js_1.SequenceContext,
    useRemotionContexts: wrap_remotion_context_js_1.useRemotionContexts,
    RemotionContextProvider: wrap_remotion_context_js_1.RemotionContextProvider,
    CSSUtils,
    setupEnvVariables: setup_env_variables_js_1.setupEnvVariables,
    MediaVolumeContext: volume_position_state_js_1.MediaVolumeContext,
    SetMediaVolumeContext: volume_position_state_js_1.SetMediaVolumeContext,
    getRemotionEnvironment: get_remotion_environment_js_1.getRemotionEnvironment,
    SharedAudioContext: shared_audio_tags_js_1.SharedAudioContext,
    SharedAudioContextProvider: shared_audio_tags_js_1.SharedAudioContextProvider,
    invalidCompositionErrorMessage: validate_composition_id_js_1.invalidCompositionErrorMessage,
    isCompositionIdValid: validate_composition_id_js_1.isCompositionIdValid,
    getPreviewDomElement: get_preview_dom_element_js_1.getPreviewDomElement,
    compositionsRef: CompositionManager_js_1.compositionsRef,
    portalNode: portal_node_js_1.portalNode,
    waitForRoot: register_root_js_1.waitForRoot,
    CanUseRemotionHooksProvider: CanUseRemotionHooks_js_1.CanUseRemotionHooksProvider,
    CanUseRemotionHooks: CanUseRemotionHooks_js_1.CanUseRemotionHooks,
    PrefetchProvider: prefetch_state_js_1.PrefetchProvider,
    DurationsContextProvider: duration_state_js_1.DurationsContextProvider,
    IsPlayerContextProvider: is_player_js_1.IsPlayerContextProvider,
    useIsPlayer: is_player_js_1.useIsPlayer,
    EditorPropsProvider: EditorProps_js_1.EditorPropsProvider,
    EditorPropsContext: EditorProps_js_1.EditorPropsContext,
    usePreload: prefetch_js_1.usePreload,
    NonceContext: nonce_js_1.NonceContext,
    resolveVideoConfig: resolve_video_config_js_1.resolveVideoConfig,
    useResolvedVideoConfig: ResolveCompositionConfig_js_1.useResolvedVideoConfig,
    resolveCompositionsRef: ResolveCompositionConfig_js_1.resolveCompositionsRef,
    ResolveCompositionConfig: ResolveCompositionConfig_js_1.ResolveCompositionConfig,
    REMOTION_STUDIO_CONTAINER_ELEMENT: get_preview_dom_element_js_1.REMOTION_STUDIO_CONTAINER_ELEMENT,
    RenderAssetManager: RenderAssetManager_js_1.RenderAssetManager,
    persistCurrentFrame: timeline_position_state_js_1.persistCurrentFrame,
    useTimelineSetFrame: timeline_position_state_js_1.useTimelineSetFrame,
    isIosSafari: video_fragment_js_1.isIosSafari,
    WATCH_REMOTION_STATIC_FILES: watch_static_file_js_1.WATCH_REMOTION_STATIC_FILES,
    addSequenceStackTraces: enable_sequence_stack_traces_js_1.addSequenceStackTraces,
    useMediaStartsAt: use_audio_frame_js_1.useMediaStartsAt,
    BufferingProvider: buffering_js_1.BufferingProvider,
    BufferingContextReact: buffering_js_1.BufferingContextReact,
    enableSequenceStackTraces: enable_sequence_stack_traces_js_1.enableSequenceStackTraces,
    CurrentScaleContext: use_current_scale_js_1.CurrentScaleContext,
    PreviewSizeContext: use_current_scale_js_1.PreviewSizeContext,
    calculateScale: use_current_scale_js_1.calculateScale,
    editorPropsProviderRef: EditorProps_js_1.editorPropsProviderRef,
    PROPS_UPDATED_EXTERNALLY: ResolveCompositionConfig_js_1.PROPS_UPDATED_EXTERNALLY,
    validateRenderAsset: validate_artifact_js_1.validateRenderAsset,
};


/***/ }),

/***/ 2358:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Copied from:
 * https://github.com/software-mansion/react-native-reanimated/blob/master/src/reanimated2/Colors.ts
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.interpolateColors = exports.colorNames = void 0;
exports.processColor = processColor;
const interpolate_js_1 = __webpack_require__(1993);
// var INTEGER = '[-+]?\\d+';
const NUMBER = '[-+]?\\d*\\.?\\d+';
const PERCENTAGE = NUMBER + '%';
function call(...args) {
    return '\\(\\s*(' + args.join(')\\s*,\\s*(') + ')\\s*\\)';
}
function getMatchers() {
    const cachedMatchers = {
        rgb: undefined,
        rgba: undefined,
        hsl: undefined,
        hsla: undefined,
        hex3: undefined,
        hex4: undefined,
        hex5: undefined,
        hex6: undefined,
        hex8: undefined,
    };
    if (cachedMatchers.rgb === undefined) {
        cachedMatchers.rgb = new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER));
        cachedMatchers.rgba = new RegExp('rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER));
        cachedMatchers.hsl = new RegExp('hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE));
        cachedMatchers.hsla = new RegExp('hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER));
        cachedMatchers.hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
        cachedMatchers.hex4 =
            /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
        cachedMatchers.hex6 = /^#([0-9a-fA-F]{6})$/;
        cachedMatchers.hex8 = /^#([0-9a-fA-F]{8})$/;
    }
    return cachedMatchers;
}
function hue2rgb(p, q, t) {
    if (t < 0) {
        t += 1;
    }
    if (t > 1) {
        t -= 1;
    }
    if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
        return q;
    }
    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
}
function hslToRgb(h, s, l) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1 / 3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1 / 3);
    return ((Math.round(r * 255) << 24) |
        (Math.round(g * 255) << 16) |
        (Math.round(b * 255) << 8));
}
function parse255(str) {
    const int = Number.parseInt(str, 10);
    if (int < 0) {
        return 0;
    }
    if (int > 255) {
        return 255;
    }
    return int;
}
function parse360(str) {
    const int = Number.parseFloat(str);
    return (((int % 360) + 360) % 360) / 360;
}
function parse1(str) {
    const num = Number.parseFloat(str);
    if (num < 0) {
        return 0;
    }
    if (num > 1) {
        return 255;
    }
    return Math.round(num * 255);
}
function parsePercentage(str) {
    // parseFloat conveniently ignores the final %
    const int = Number.parseFloat(str);
    if (int < 0) {
        return 0;
    }
    if (int > 100) {
        return 1;
    }
    return int / 100;
}
exports.colorNames = {
    transparent: 0x00000000,
    // http://www.w3.org/TR/css3-color/#svg-color
    aliceblue: 0xf0f8ffff,
    antiquewhite: 0xfaebd7ff,
    aqua: 0x00ffffff,
    aquamarine: 0x7fffd4ff,
    azure: 0xf0ffffff,
    beige: 0xf5f5dcff,
    bisque: 0xffe4c4ff,
    black: 0x000000ff,
    blanchedalmond: 0xffebcdff,
    blue: 0x0000ffff,
    blueviolet: 0x8a2be2ff,
    brown: 0xa52a2aff,
    burlywood: 0xdeb887ff,
    burntsienna: 0xea7e5dff,
    cadetblue: 0x5f9ea0ff,
    chartreuse: 0x7fff00ff,
    chocolate: 0xd2691eff,
    coral: 0xff7f50ff,
    cornflowerblue: 0x6495edff,
    cornsilk: 0xfff8dcff,
    crimson: 0xdc143cff,
    cyan: 0x00ffffff,
    darkblue: 0x00008bff,
    darkcyan: 0x008b8bff,
    darkgoldenrod: 0xb8860bff,
    darkgray: 0xa9a9a9ff,
    darkgreen: 0x006400ff,
    darkgrey: 0xa9a9a9ff,
    darkkhaki: 0xbdb76bff,
    darkmagenta: 0x8b008bff,
    darkolivegreen: 0x556b2fff,
    darkorange: 0xff8c00ff,
    darkorchid: 0x9932ccff,
    darkred: 0x8b0000ff,
    darksalmon: 0xe9967aff,
    darkseagreen: 0x8fbc8fff,
    darkslateblue: 0x483d8bff,
    darkslategray: 0x2f4f4fff,
    darkslategrey: 0x2f4f4fff,
    darkturquoise: 0x00ced1ff,
    darkviolet: 0x9400d3ff,
    deeppink: 0xff1493ff,
    deepskyblue: 0x00bfffff,
    dimgray: 0x696969ff,
    dimgrey: 0x696969ff,
    dodgerblue: 0x1e90ffff,
    firebrick: 0xb22222ff,
    floralwhite: 0xfffaf0ff,
    forestgreen: 0x228b22ff,
    fuchsia: 0xff00ffff,
    gainsboro: 0xdcdcdcff,
    ghostwhite: 0xf8f8ffff,
    gold: 0xffd700ff,
    goldenrod: 0xdaa520ff,
    gray: 0x808080ff,
    green: 0x008000ff,
    greenyellow: 0xadff2fff,
    grey: 0x808080ff,
    honeydew: 0xf0fff0ff,
    hotpink: 0xff69b4ff,
    indianred: 0xcd5c5cff,
    indigo: 0x4b0082ff,
    ivory: 0xfffff0ff,
    khaki: 0xf0e68cff,
    lavender: 0xe6e6faff,
    lavenderblush: 0xfff0f5ff,
    lawngreen: 0x7cfc00ff,
    lemonchiffon: 0xfffacdff,
    lightblue: 0xadd8e6ff,
    lightcoral: 0xf08080ff,
    lightcyan: 0xe0ffffff,
    lightgoldenrodyellow: 0xfafad2ff,
    lightgray: 0xd3d3d3ff,
    lightgreen: 0x90ee90ff,
    lightgrey: 0xd3d3d3ff,
    lightpink: 0xffb6c1ff,
    lightsalmon: 0xffa07aff,
    lightseagreen: 0x20b2aaff,
    lightskyblue: 0x87cefaff,
    lightslategray: 0x778899ff,
    lightslategrey: 0x778899ff,
    lightsteelblue: 0xb0c4deff,
    lightyellow: 0xffffe0ff,
    lime: 0x00ff00ff,
    limegreen: 0x32cd32ff,
    linen: 0xfaf0e6ff,
    magenta: 0xff00ffff,
    maroon: 0x800000ff,
    mediumaquamarine: 0x66cdaaff,
    mediumblue: 0x0000cdff,
    mediumorchid: 0xba55d3ff,
    mediumpurple: 0x9370dbff,
    mediumseagreen: 0x3cb371ff,
    mediumslateblue: 0x7b68eeff,
    mediumspringgreen: 0x00fa9aff,
    mediumturquoise: 0x48d1ccff,
    mediumvioletred: 0xc71585ff,
    midnightblue: 0x191970ff,
    mintcream: 0xf5fffaff,
    mistyrose: 0xffe4e1ff,
    moccasin: 0xffe4b5ff,
    navajowhite: 0xffdeadff,
    navy: 0x000080ff,
    oldlace: 0xfdf5e6ff,
    olive: 0x808000ff,
    olivedrab: 0x6b8e23ff,
    orange: 0xffa500ff,
    orangered: 0xff4500ff,
    orchid: 0xda70d6ff,
    palegoldenrod: 0xeee8aaff,
    palegreen: 0x98fb98ff,
    paleturquoise: 0xafeeeeff,
    palevioletred: 0xdb7093ff,
    papayawhip: 0xffefd5ff,
    peachpuff: 0xffdab9ff,
    peru: 0xcd853fff,
    pink: 0xffc0cbff,
    plum: 0xdda0ddff,
    powderblue: 0xb0e0e6ff,
    purple: 0x800080ff,
    rebeccapurple: 0x663399ff,
    red: 0xff0000ff,
    rosybrown: 0xbc8f8fff,
    royalblue: 0x4169e1ff,
    saddlebrown: 0x8b4513ff,
    salmon: 0xfa8072ff,
    sandybrown: 0xf4a460ff,
    seagreen: 0x2e8b57ff,
    seashell: 0xfff5eeff,
    sienna: 0xa0522dff,
    silver: 0xc0c0c0ff,
    skyblue: 0x87ceebff,
    slateblue: 0x6a5acdff,
    slategray: 0x708090ff,
    slategrey: 0x708090ff,
    snow: 0xfffafaff,
    springgreen: 0x00ff7fff,
    steelblue: 0x4682b4ff,
    tan: 0xd2b48cff,
    teal: 0x008080ff,
    thistle: 0xd8bfd8ff,
    tomato: 0xff6347ff,
    turquoise: 0x40e0d0ff,
    violet: 0xee82eeff,
    wheat: 0xf5deb3ff,
    white: 0xffffffff,
    whitesmoke: 0xf5f5f5ff,
    yellow: 0xffff00ff,
    yellowgreen: 0x9acd32ff,
};
function normalizeColor(color) {
    const matchers = getMatchers();
    let match;
    // Ordered based on occurrences on Facebook codebase
    if (matchers.hex6) {
        if ((match = matchers.hex6.exec(color))) {
            return Number.parseInt(match[1] + 'ff', 16) >>> 0;
        }
    }
    if (exports.colorNames[color] !== undefined) {
        return exports.colorNames[color];
    }
    if (matchers.rgb) {
        if ((match = matchers.rgb.exec(color))) {
            return (
            // b
            ((parse255(match[1]) << 24) | // r
                (parse255(match[2]) << 16) | // g
                (parse255(match[3]) << 8) |
                0x000000ff) >>> // a
                0);
        }
    }
    if (matchers.rgba) {
        if ((match = matchers.rgba.exec(color))) {
            return (
            // b
            ((parse255(match[1]) << 24) | // r
                (parse255(match[2]) << 16) | // g
                (parse255(match[3]) << 8) |
                parse1(match[4])) >>> // a
                0);
        }
    }
    if (matchers.hex3) {
        if ((match = matchers.hex3.exec(color))) {
            return (Number.parseInt(match[1] +
                match[1] + // r
                match[2] +
                match[2] + // g
                match[3] +
                match[3] + // b
                'ff', // a
            16) >>> 0);
        }
    }
    // https://drafts.csswg.org/css-color-4/#hex-notation
    if (matchers.hex8) {
        if ((match = matchers.hex8.exec(color))) {
            return Number.parseInt(match[1], 16) >>> 0;
        }
    }
    if (matchers.hex4) {
        if ((match = matchers.hex4.exec(color))) {
            return (Number.parseInt(match[1] +
                match[1] + // r
                match[2] +
                match[2] + // g
                match[3] +
                match[3] + // b
                match[4] +
                match[4], // a
            16) >>> 0);
        }
    }
    if (matchers.hsl) {
        if ((match = matchers.hsl.exec(color))) {
            return ((hslToRgb(parse360(match[1]), // h
            parsePercentage(match[2]), // s
            parsePercentage(match[3])) |
                0x000000ff) >>> // a
                0);
        }
    }
    if (matchers.hsla) {
        if ((match = matchers.hsla.exec(color))) {
            return ((hslToRgb(parse360(match[1]), // h
            parsePercentage(match[2]), // s
            parsePercentage(match[3])) |
                parse1(match[4])) >>> // a
                0);
        }
    }
    throw new Error(`invalid color string ${color} provided`);
}
const opacity = (c) => {
    return ((c >> 24) & 255) / 255;
};
const red = (c) => {
    return (c >> 16) & 255;
};
const green = (c) => {
    return (c >> 8) & 255;
};
const blue = (c) => {
    return c & 255;
};
const rgbaColor = (r, g, b, alpha) => {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
function processColor(color) {
    const normalizedColor = normalizeColor(color);
    return ((normalizedColor << 24) | (normalizedColor >>> 8)) >>> 0; // argb
}
const interpolateColorsRGB = (value, inputRange, colors) => {
    const [r, g, b, a] = [red, green, blue, opacity].map((f) => {
        const unrounded = (0, interpolate_js_1.interpolate)(value, inputRange, colors.map((c) => f(c)), {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });
        if (f === opacity) {
            return Number(unrounded.toFixed(3));
        }
        return Math.round(unrounded);
    });
    return rgbaColor(r, g, b, a);
};
/**
 * @description This function allows you to map a range of values to colors using a concise syntax.
 * @see [Documentation](https://www.remotion.dev/docs/interpolate-colors)
 */
const interpolateColors = (input, inputRange, outputRange) => {
    if (typeof input === 'undefined') {
        throw new TypeError('input can not be undefined');
    }
    if (typeof inputRange === 'undefined') {
        throw new TypeError('inputRange can not be undefined');
    }
    if (typeof outputRange === 'undefined') {
        throw new TypeError('outputRange can not be undefined');
    }
    if (inputRange.length !== outputRange.length) {
        throw new TypeError('inputRange (' +
            inputRange.length +
            ' values provided) and outputRange (' +
            outputRange.length +
            ' values provided) must have the same length');
    }
    const processedOutputRange = outputRange.map((c) => processColor(c));
    return interpolateColorsRGB(input, inputRange, processedOutputRange);
};
exports.interpolateColors = interpolateColors;


/***/ }),

/***/ 1993:
/***/ ((__unused_webpack_module, exports) => {


// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/nodes/AnimatedInterpolation.js
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.interpolate = interpolate;
function interpolateFunction(input, inputRange, outputRange, options) {
    const { extrapolateLeft, extrapolateRight, easing } = options;
    let result = input;
    const [inputMin, inputMax] = inputRange;
    const [outputMin, outputMax] = outputRange;
    if (result < inputMin) {
        if (extrapolateLeft === 'identity') {
            return result;
        }
        if (extrapolateLeft === 'clamp') {
            result = inputMin;
        }
        else if (extrapolateLeft === 'wrap') {
            const range = inputMax - inputMin;
            result = ((((result - inputMin) % range) + range) % range) + inputMin;
        }
        else if (extrapolateLeft === 'extend') {
            // Noop
        }
    }
    if (result > inputMax) {
        if (extrapolateRight === 'identity') {
            return result;
        }
        if (extrapolateRight === 'clamp') {
            result = inputMax;
        }
        else if (extrapolateRight === 'wrap') {
            const range = inputMax - inputMin;
            result = ((((result - inputMin) % range) + range) % range) + inputMin;
        }
        else if (extrapolateRight === 'extend') {
            // Noop
        }
    }
    if (outputMin === outputMax) {
        return outputMin;
    }
    // Input Range
    result = (result - inputMin) / (inputMax - inputMin);
    // Easing
    result = easing(result);
    // Output Range
    result = result * (outputMax - outputMin) + outputMin;
    return result;
}
function findRange(input, inputRange) {
    let i;
    for (i = 1; i < inputRange.length - 1; ++i) {
        if (inputRange[i] >= input) {
            break;
        }
    }
    return i - 1;
}
function checkValidInputRange(arr) {
    for (let i = 1; i < arr.length; ++i) {
        if (!(arr[i] > arr[i - 1])) {
            throw new Error(`inputRange must be strictly monotonically increasing but got [${arr.join(',')}]`);
        }
    }
}
function checkInfiniteRange(name, arr) {
    if (arr.length < 2) {
        throw new Error(name + ' must have at least 2 elements');
    }
    for (const element of arr) {
        if (typeof element !== 'number') {
            throw new Error(`${name} must contain only numbers`);
        }
        if (!Number.isFinite(element)) {
            throw new Error(`${name} must contain only finite numbers, but got [${arr.join(',')}]`);
        }
    }
}
/**
 * Map a value from an input range to an output range.
 * @link https://www.remotion.dev/docs/interpolate
 * @param {!number} input value to interpolate
 * @param {!number[]} inputRange range of values that you expect the input to assume.
 * @param {!number[]} outputRange range of output values that you want the input to map to.
 * @param {?object} options
 * @param {?Function} options.easing easing function which allows you to customize the input, for example to apply a certain easing function. By default, the input is left unmodified, resulting in a pure linear interpolation {@link https://www.remotion.dev/docs/easing}
 * @param {string=} [options.extrapolateLeft="extend"] What should happen if the input value is outside left the input range, default: "extend" {@link https://www.remotion.dev/docs/interpolate#extrapolateleft}
 * @param {string=} [options.extrapolateRight="extend"] Same as extrapolateLeft, except for values outside right the input range {@link https://www.remotion.dev/docs/interpolate#extrapolateright}
 */
function interpolate(input, inputRange, outputRange, options) {
    var _a;
    if (typeof input === 'undefined') {
        throw new Error('input can not be undefined');
    }
    if (typeof inputRange === 'undefined') {
        throw new Error('inputRange can not be undefined');
    }
    if (typeof outputRange === 'undefined') {
        throw new Error('outputRange can not be undefined');
    }
    if (inputRange.length !== outputRange.length) {
        throw new Error('inputRange (' +
            inputRange.length +
            ') and outputRange (' +
            outputRange.length +
            ') must have the same length');
    }
    checkInfiniteRange('inputRange', inputRange);
    checkInfiniteRange('outputRange', outputRange);
    checkValidInputRange(inputRange);
    const easing = (_a = options === null || options === void 0 ? void 0 : options.easing) !== null && _a !== void 0 ? _a : ((num) => num);
    let extrapolateLeft = 'extend';
    if ((options === null || options === void 0 ? void 0 : options.extrapolateLeft) !== undefined) {
        extrapolateLeft = options.extrapolateLeft;
    }
    let extrapolateRight = 'extend';
    if ((options === null || options === void 0 ? void 0 : options.extrapolateRight) !== undefined) {
        extrapolateRight = options.extrapolateRight;
    }
    if (typeof input !== 'number') {
        throw new TypeError('Cannot interpolate an input which is not a number');
    }
    const range = findRange(input, inputRange);
    return interpolateFunction(input, [inputRange[range], inputRange[range + 1]], [outputRange[range], outputRange[range + 1]], {
        easing,
        extrapolateLeft,
        extrapolateRight,
    });
}


/***/ }),

/***/ 4773:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isApproximatelyTheSame = void 0;
const FLOATING_POINT_ERROR_THRESHOLD = 0.00001;
const isApproximatelyTheSame = (num1, num2) => {
    return Math.abs(num1 - num2) < FLOATING_POINT_ERROR_THRESHOLD;
};
exports.isApproximatelyTheSame = isApproximatelyTheSame;


/***/ }),

/***/ 5516:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useIsPlayer = exports.IsPlayerContextProvider = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const IsPlayerContext = (0, react_1.createContext)(false);
const IsPlayerContextProvider = ({ children, }) => {
    return (0, jsx_runtime_1.jsx)(IsPlayerContext.Provider, { value: true, children: children });
};
exports.IsPlayerContextProvider = IsPlayerContextProvider;
const useIsPlayer = () => {
    return (0, react_1.useContext)(IsPlayerContext);
};
exports.useIsPlayer = useIsPlayer;


/***/ }),

/***/ 7346:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Loading = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const AbsoluteFill_js_1 = __webpack_require__(1488);
const rotate = {
    transform: `rotate(90deg)`,
};
const ICON_SIZE = 40;
const label = {
    color: 'white',
    fontSize: 14,
    fontFamily: 'sans-serif',
};
const container = {
    justifyContent: 'center',
    alignItems: 'center',
};
const Loading = () => {
    return ((0, jsx_runtime_1.jsxs)(AbsoluteFill_js_1.AbsoluteFill, { style: container, id: "remotion-comp-loading", children: [(0, jsx_runtime_1.jsx)("style", { type: "text/css", children: `
				@keyframes anim {
					from {
						opacity: 0
					}
					to {
						opacity: 1
					}
				}
				#remotion-comp-loading {
					animation: anim 2s;
					animation-fill-mode: forwards;
				}
			` }), (0, jsx_runtime_1.jsx)("svg", { width: ICON_SIZE, height: ICON_SIZE, viewBox: "-100 -100 400 400", style: rotate, children: (0, jsx_runtime_1.jsx)("path", { fill: "#555", stroke: "#555", strokeWidth: "100", strokeLinejoin: "round", d: "M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z" }) }), (0, jsx_runtime_1.jsxs)("p", { style: label, children: ["Resolving ", '<Suspense>', "..."] })] }));
};
exports.Loading = Loading;


/***/ }),

/***/ 2377:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Loop = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __importStar(__webpack_require__(6540));
const Sequence_js_1 = __webpack_require__(7973);
const use_current_frame_js_1 = __webpack_require__(1041);
const use_video_config_js_1 = __webpack_require__(7770);
const validate_duration_in_frames_js_1 = __webpack_require__(2488);
const LoopContext = (0, react_1.createContext)(null);
const useLoop = () => {
    return react_1.default.useContext(LoopContext);
};
/**
 * @description This component allows you to quickly lay out an animation so it repeats itself.
 * @see [Documentation](https://www.remotion.dev/docs/loop)
 */
const Loop = ({ durationInFrames, times = Infinity, children, name, ...props }) => {
    const currentFrame = (0, use_current_frame_js_1.useCurrentFrame)();
    const { durationInFrames: compDuration } = (0, use_video_config_js_1.useVideoConfig)();
    (0, validate_duration_in_frames_js_1.validateDurationInFrames)(durationInFrames, {
        component: 'of the <Loop /> component',
        allowFloats: true,
    });
    if (typeof times !== 'number') {
        throw new TypeError(`You passed to "times" an argument of type ${typeof times}, but it must be a number.`);
    }
    if (times !== Infinity && times % 1 !== 0) {
        throw new TypeError(`The "times" prop of a loop must be an integer, but got ${times}.`);
    }
    if (times < 0) {
        throw new TypeError(`The "times" prop of a loop must be at least 0, but got ${times}`);
    }
    const maxTimes = Math.ceil(compDuration / durationInFrames);
    const actualTimes = Math.min(maxTimes, times);
    const style = props.layout === 'none' ? undefined : props.style;
    const maxFrame = durationInFrames * (actualTimes - 1);
    const iteration = Math.floor(currentFrame / durationInFrames);
    const start = iteration * durationInFrames;
    const from = Math.min(start, maxFrame);
    const loopDisplay = (0, react_1.useMemo)(() => {
        return {
            numberOfTimes: actualTimes,
            startOffset: -from,
            durationInFrames,
        };
    }, [actualTimes, durationInFrames, from]);
    const loopContext = (0, react_1.useMemo)(() => {
        return {
            iteration: Math.floor(currentFrame / durationInFrames),
            durationInFrames,
        };
    }, [currentFrame, durationInFrames]);
    return ((0, jsx_runtime_1.jsx)(LoopContext.Provider, { value: loopContext, children: (0, jsx_runtime_1.jsx)(Sequence_js_1.Sequence, { durationInFrames: durationInFrames, from: from, name: name !== null && name !== void 0 ? name : '<Loop>', _remotionInternalLoopDisplay: loopDisplay, layout: props.layout, style: style, children: children }) }));
};
exports.Loop = Loop;
exports.Loop.useLoop = useLoop;


/***/ }),

/***/ 5241:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkMultipleRemotionVersions = void 0;
const truthy_js_1 = __webpack_require__(108);
const version_js_1 = __webpack_require__(6558);
const checkMultipleRemotionVersions = () => {
    if (typeof globalThis === 'undefined') {
        return;
    }
    const set = () => {
        globalThis.remotion_imported = version_js_1.VERSION;
        if (typeof window !== 'undefined') {
            window.remotion_imported = version_js_1.VERSION;
        }
    };
    const alreadyImported = globalThis.remotion_imported ||
        (typeof window !== 'undefined' && window.remotion_imported);
    if (alreadyImported) {
        if (alreadyImported === version_js_1.VERSION) {
            // Next.JS will reload the package and cause a server-side warning.
            // It's okay if this happens during SSR in developement
            return;
        }
        // @remotion/webcodecs will also set this variable for the purpose of
        // being picked up by Wappalyzer.
        // If so, we can just override it because it is not the same as Remotion
        if (typeof alreadyImported === 'string' &&
            alreadyImported.includes('webcodecs')) {
            set();
            return;
        }
        throw new TypeError(`🚨 Multiple versions of Remotion detected: ${[
            version_js_1.VERSION,
            typeof alreadyImported === 'string'
                ? alreadyImported
                : 'an older version',
        ]
            .filter(truthy_js_1.truthy)
            .join(' and ')}. This will cause things to break in an unexpected way.\nCheck that all your Remotion packages are on the same version. If your dependencies depend on Remotion, make them peer dependencies. You can also run \`npx remotion versions\` from your terminal to see which versions are mismatching.`);
    }
    set();
};
exports.checkMultipleRemotionVersions = checkMultipleRemotionVersions;


/***/ }),

/***/ 2453:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoReactInternals = exports.random = exports.interpolate = void 0;
var interpolate_1 = __webpack_require__(1993);
Object.defineProperty(exports, "interpolate", ({ enumerable: true, get: function () { return interpolate_1.interpolate; } }));
var random_js_1 = __webpack_require__(5923);
Object.defineProperty(exports, "random", ({ enumerable: true, get: function () { return random_js_1.random; } }));
const delay_render_1 = __webpack_require__(1006);
const input_props_serialization_1 = __webpack_require__(4532);
const input_props_serialization_js_1 = __webpack_require__(4532);
const interpolate_colors_1 = __webpack_require__(2358);
const truthy_1 = __webpack_require__(108);
const v5_flag_1 = __webpack_require__(8232);
const validate_frame_1 = __webpack_require__(1326);
const validate_default_props_1 = __webpack_require__(4127);
const validate_dimensions_1 = __webpack_require__(8140);
const validate_duration_in_frames_1 = __webpack_require__(2488);
const validate_fps_1 = __webpack_require__(706);
const get_current_time_1 = __webpack_require__(8538);
const offthread_video_source_1 = __webpack_require__(3935);
exports.NoReactInternals = {
    processColor: interpolate_colors_1.processColor,
    truthy: truthy_1.truthy,
    validateFps: validate_fps_1.validateFps,
    validateDimension: validate_dimensions_1.validateDimension,
    validateDurationInFrames: validate_duration_in_frames_1.validateDurationInFrames,
    validateDefaultAndInputProps: validate_default_props_1.validateDefaultAndInputProps,
    validateFrame: validate_frame_1.validateFrame,
    serializeJSONWithDate: input_props_serialization_1.serializeJSONWithDate,
    bundleName: 'bundle.js',
    bundleMapName: 'bundle.js.map',
    deserializeJSONWithCustomFields: input_props_serialization_1.deserializeJSONWithCustomFields,
    DELAY_RENDER_CALLSTACK_TOKEN: delay_render_1.DELAY_RENDER_CALLSTACK_TOKEN,
    DELAY_RENDER_RETRY_TOKEN: delay_render_1.DELAY_RENDER_RETRY_TOKEN,
    DELAY_RENDER_ATTEMPT_TOKEN: delay_render_1.DELAY_RENDER_RETRIES_LEFT,
    getOffthreadVideoSource: offthread_video_source_1.getOffthreadVideoSource,
    getExpectedMediaFrameUncorrected: get_current_time_1.getExpectedMediaFrameUncorrected,
    ENABLE_V5_BREAKING_CHANGES: v5_flag_1.ENABLE_V5_BREAKING_CHANGES,
    MIN_NODE_VERSION: v5_flag_1.ENABLE_V5_BREAKING_CHANGES ? 18 : 16,
    MIN_BUN_VERSION: v5_flag_1.ENABLE_V5_BREAKING_CHANGES ? '1.1.3' : '1.0.3',
    colorNames: interpolate_colors_1.colorNames,
    DATE_TOKEN: input_props_serialization_js_1.DATE_TOKEN,
    FILE_TOKEN: input_props_serialization_js_1.FILE_TOKEN,
};


/***/ }),

/***/ 2501:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useNonce = exports.NonceContext = void 0;
const react_1 = __webpack_require__(6540);
exports.NonceContext = (0, react_1.createContext)({
    getNonce: () => 0,
    fastRefreshes: 0,
});
const useNonce = () => {
    const context = (0, react_1.useContext)(exports.NonceContext);
    const [nonce, setNonce] = (0, react_1.useState)(() => context.getNonce());
    const lastContext = (0, react_1.useRef)(context);
    // Only if context changes, but not initially
    (0, react_1.useEffect)(() => {
        if (lastContext.current === context) {
            return;
        }
        lastContext.current = context;
        setNonce(context.getNonce);
    }, [context]);
    return nonce;
};
exports.useNonce = useNonce;


/***/ }),

/***/ 7119:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.playAndHandleNotAllowedError = void 0;
const get_remotion_environment_1 = __webpack_require__(7356);
const playAndHandleNotAllowedError = (mediaRef, mediaType, onAutoPlayError) => {
    const { current } = mediaRef;
    if (!current) {
        return;
    }
    const prom = current.play();
    if (prom.catch) {
        prom.catch((err) => {
            if (!current) {
                return;
            }
            // Pause was called after play in Chrome
            if (err.message.includes('request was interrupted by a call to pause')) {
                return;
            }
            // Pause was called after play in Safari
            if (err.message.includes('The operation was aborted.')) {
                return;
            }
            // Pause was called after play in Firefox
            if (err.message.includes('The fetching process for the media resource was aborted by the user agent')) {
                return;
            }
            // Got replaced by a different audio source in Chromium
            if (err.message.includes('request was interrupted by a new load request')) {
                return;
            }
            // Audio tag got unmounted
            if (err.message.includes('because the media was removed from the document')) {
                return;
            }
            // Audio tag got unmounted
            if (err.message.includes("user didn't interact with the document") &&
                current.muted) {
                return;
            }
            // eslint-disable-next-line no-console
            console.log(`Could not play ${mediaType} due to following error: `, err);
            if (!current.muted) {
                if (onAutoPlayError) {
                    onAutoPlayError();
                    return;
                }
                // eslint-disable-next-line no-console
                console.log(`The video will be muted and we'll retry playing it.`);
                if (mediaType === 'video' && (0, get_remotion_environment_1.getRemotionEnvironment)().isPlayer) {
                    // eslint-disable-next-line no-console
                    console.log('Use onAutoPlayError() to handle this error yourself.');
                }
                current.muted = true;
                current.play();
            }
        });
    }
};
exports.playAndHandleNotAllowedError = playAndHandleNotAllowedError;


/***/ }),

/***/ 2159:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.portalNode = void 0;
let _portalNode = null;
const portalNode = () => {
    if (!_portalNode) {
        if (typeof document === 'undefined') {
            throw new Error('Tried to call an API that only works in the browser from outside the browser');
        }
        _portalNode = document.createElement('div');
        _portalNode.style.position = 'absolute';
        _portalNode.style.top = '0px';
        _portalNode.style.left = '0px';
        _portalNode.style.right = '0px';
        _portalNode.style.bottom = '0px';
        _portalNode.style.width = '100%';
        _portalNode.style.height = '100%';
        _portalNode.style.display = 'flex';
        _portalNode.style.flexDirection = 'column';
        const containerNode = document.createElement('div');
        containerNode.style.position = 'fixed';
        containerNode.style.top = -999999 + 'px';
        containerNode.appendChild(_portalNode);
        document.body.appendChild(containerNode);
    }
    return _portalNode;
};
exports.portalNode = portalNode;


/***/ }),

/***/ 2171:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrefetchProvider = exports.setPreloads = exports.PreloadContext = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
exports.PreloadContext = (0, react_1.createContext)({});
let preloads = {};
let updaters = [];
const setPreloads = (updater) => {
    preloads = updater(preloads);
    updaters.forEach((u) => u());
};
exports.setPreloads = setPreloads;
const PrefetchProvider = ({ children }) => {
    const [_preloads, _setPreloads] = (0, react_1.useState)(() => preloads);
    (0, react_1.useEffect)(() => {
        const updaterFunction = () => {
            _setPreloads(preloads);
        };
        updaters.push(updaterFunction);
        return () => {
            updaters = updaters.filter((u) => u !== updaterFunction);
        };
    }, []);
    return ((0, jsx_runtime_1.jsx)(exports.PreloadContext.Provider, { value: _preloads, children: children }));
};
exports.PrefetchProvider = PrefetchProvider;


/***/ }),

/***/ 1011:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.prefetch = exports.usePreload = void 0;
const react_1 = __webpack_require__(6540);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const prefetch_state_js_1 = __webpack_require__(2171);
const usePreload = (src) => {
    var _a;
    const preloads = (0, react_1.useContext)(prefetch_state_js_1.PreloadContext);
    return (_a = preloads[src]) !== null && _a !== void 0 ? _a : src;
};
exports.usePreload = usePreload;
const blobToBase64 = function (blob) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = function () {
            const dataUrl = reader.result;
            resolve(dataUrl);
        };
        reader.onerror = (err) => {
            return reject(err);
        };
        reader.readAsDataURL(blob);
    });
};
const getBlobFromReader = async ({ reader, contentType, contentLength, onProgress, }) => {
    let receivedLength = 0;
    const chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        chunks.push(value);
        receivedLength += value.length;
        if (onProgress) {
            onProgress({ loadedBytes: receivedLength, totalBytes: contentLength });
        }
    }
    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
    }
    return new Blob([chunksAll], {
        type: contentType !== null && contentType !== void 0 ? contentType : undefined,
    });
};
/**
 * @description When you call the preFetch() function, an asset will be fetched and kept in memory so it is ready when you want to play it in a <Player>.
 * @see [Documentation](https://www.remotion.dev/docs/prefetch)
 */
const prefetch = (src, options) => {
    var _a, _b;
    const method = (_a = options === null || options === void 0 ? void 0 : options.method) !== null && _a !== void 0 ? _a : 'blob-url';
    if ((0, get_remotion_environment_js_1.getRemotionEnvironment)().isRendering) {
        return {
            free: () => undefined,
            waitUntilDone: () => Promise.resolve(src),
        };
    }
    let canceled = false;
    let objectUrl = null;
    let resolve = () => undefined;
    let reject = () => undefined;
    const waitUntilDone = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    const controller = new AbortController();
    let canBeAborted = true;
    fetch(src, {
        signal: controller.signal,
        credentials: (_b = options === null || options === void 0 ? void 0 : options.credentials) !== null && _b !== void 0 ? _b : undefined,
    })
        .then((res) => {
        var _a, _b, _c;
        canBeAborted = false;
        if (canceled) {
            return null;
        }
        if (!res.ok) {
            throw new Error(`HTTP error, status = ${res.status}`);
        }
        const headerContentType = res.headers.get('Content-Type');
        const contentType = (_a = options === null || options === void 0 ? void 0 : options.contentType) !== null && _a !== void 0 ? _a : headerContentType;
        const hasProperContentType = contentType &&
            (contentType.startsWith('video/') ||
                contentType.startsWith('audio/') ||
                contentType.startsWith('image/'));
        if (!hasProperContentType) {
            // eslint-disable-next-line no-console
            console.warn(`Called prefetch() on ${src} which returned a "Content-Type" of ${headerContentType}. Prefetched content should have a proper content type (video/... or audio/...) or a contentType passed the options of prefetch(). Otherwise, prefetching will not work properly in all browsers.`);
        }
        if (!res.body) {
            throw new Error(`HTTP response of ${src} has no body`);
        }
        const reader = res.body.getReader();
        return getBlobFromReader({
            reader,
            contentType: (_c = (_b = options === null || options === void 0 ? void 0 : options.contentType) !== null && _b !== void 0 ? _b : headerContentType) !== null && _c !== void 0 ? _c : null,
            contentLength: res.headers.get('Content-Length')
                ? parseInt(res.headers.get('Content-Length'), 10)
                : null,
            onProgress: options === null || options === void 0 ? void 0 : options.onProgress,
        });
    })
        .then((buf) => {
        if (!buf) {
            return;
        }
        const actualBlob = (options === null || options === void 0 ? void 0 : options.contentType)
            ? new Blob([buf], { type: options.contentType })
            : buf;
        if (method === 'base64') {
            return blobToBase64(actualBlob);
        }
        return URL.createObjectURL(actualBlob);
    })
        .then((url) => {
        if (canceled) {
            return;
        }
        objectUrl = url;
        (0, prefetch_state_js_1.setPreloads)((p) => ({
            ...p,
            [src]: objectUrl,
        }));
        resolve(objectUrl);
    })
        .catch((err) => {
        reject(err);
    });
    return {
        free: () => {
            if (objectUrl) {
                if (method === 'blob-url') {
                    URL.revokeObjectURL(objectUrl);
                }
                (0, prefetch_state_js_1.setPreloads)((p) => {
                    const copy = { ...p };
                    delete copy[src];
                    return copy;
                });
            }
            else {
                canceled = true;
                if (canBeAborted) {
                    try {
                        controller.abort(new Error('free() called'));
                    }
                    catch (_a) { }
                }
            }
        },
        waitUntilDone: () => {
            return waitUntilDone;
        },
    };
};
exports.prefetch = prefetch;


/***/ }),

/***/ 5923:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.random = void 0;
function mulberry32(a) {
    let t = a + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function hashCode(str) {
    let i = 0;
    let chr = 0;
    let hash = 0;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
/**
 * @description A deterministic pseudo-random number generator. Pass in the same seed and get the same pseudorandom number.
 * @see [Documentation](https://remotion.dev/docs/random)
 */
const random = (seed, dummy) => {
    if (dummy !== undefined) {
        throw new TypeError('random() takes only one argument');
    }
    if (seed === null) {
        return Math.random();
    }
    if (typeof seed === 'string') {
        return mulberry32(hashCode(seed));
    }
    if (typeof seed === 'number') {
        return mulberry32(seed * 10000000000);
    }
    throw new Error('random() argument must be a number or a string');
};
exports.random = random;


/***/ }),

/***/ 8562:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.waitForRoot = exports.getRoot = exports.registerRoot = void 0;
let Root = null;
let listeners = [];
/**
 * @description This function registers the root component of the Remotion project
 * @see [Documentation](https://www.remotion.dev/docs/register-root)
 */
const registerRoot = (comp) => {
    if (!comp) {
        throw new Error(`You must pass a React component to registerRoot(), but ${JSON.stringify(comp)} was passed.`);
    }
    if (Root) {
        throw new Error('registerRoot() was called more than once.');
    }
    Root = comp;
    listeners.forEach((l) => {
        l(comp);
    });
};
exports.registerRoot = registerRoot;
const getRoot = () => {
    return Root;
};
exports.getRoot = getRoot;
const waitForRoot = (fn) => {
    if (Root) {
        fn(Root);
        return () => undefined;
    }
    listeners.push(fn);
    return () => {
        listeners = listeners.filter((l) => l !== fn);
    };
};
exports.waitForRoot = waitForRoot;


/***/ }),

/***/ 7611:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.resolveVideoConfigOrCatch = exports.resolveVideoConfig = void 0;
const input_props_serialization_js_1 = __webpack_require__(4532);
const validate_default_codec_js_1 = __webpack_require__(19);
const validate_dimensions_js_1 = __webpack_require__(8140);
const validate_duration_in_frames_js_1 = __webpack_require__(2488);
const validate_fps_js_1 = __webpack_require__(706);
const validateCalculated = ({ calculated, compositionId, compositionFps, compositionHeight, compositionWidth, compositionDurationInFrames, }) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const calculateMetadataErrorLocation = `calculated by calculateMetadata() for the composition "${compositionId}"`;
    const defaultErrorLocation = `of the "<Composition />" component with the id "${compositionId}"`;
    const width = (_b = (_a = calculated === null || calculated === void 0 ? void 0 : calculated.width) !== null && _a !== void 0 ? _a : compositionWidth) !== null && _b !== void 0 ? _b : undefined;
    (0, validate_dimensions_js_1.validateDimension)(width, 'width', (calculated === null || calculated === void 0 ? void 0 : calculated.width) ? calculateMetadataErrorLocation : defaultErrorLocation);
    const height = (_d = (_c = calculated === null || calculated === void 0 ? void 0 : calculated.height) !== null && _c !== void 0 ? _c : compositionHeight) !== null && _d !== void 0 ? _d : undefined;
    (0, validate_dimensions_js_1.validateDimension)(height, 'height', (calculated === null || calculated === void 0 ? void 0 : calculated.height) ? calculateMetadataErrorLocation : defaultErrorLocation);
    const fps = (_f = (_e = calculated === null || calculated === void 0 ? void 0 : calculated.fps) !== null && _e !== void 0 ? _e : compositionFps) !== null && _f !== void 0 ? _f : null;
    (0, validate_fps_js_1.validateFps)(fps, (calculated === null || calculated === void 0 ? void 0 : calculated.fps) ? calculateMetadataErrorLocation : defaultErrorLocation, false);
    const durationInFrames = (_h = (_g = calculated === null || calculated === void 0 ? void 0 : calculated.durationInFrames) !== null && _g !== void 0 ? _g : compositionDurationInFrames) !== null && _h !== void 0 ? _h : null;
    (0, validate_duration_in_frames_js_1.validateDurationInFrames)(durationInFrames, {
        allowFloats: false,
        component: `of the "<Composition />" component with the id "${compositionId}"`,
    });
    const defaultCodec = calculated === null || calculated === void 0 ? void 0 : calculated.defaultCodec;
    (0, validate_default_codec_js_1.validateDefaultCodec)(defaultCodec, calculateMetadataErrorLocation);
    return { width, height, fps, durationInFrames, defaultCodec };
};
const resolveVideoConfig = ({ calculateMetadata, signal, defaultProps, originalProps, compositionId, compositionDurationInFrames, compositionFps, compositionHeight, compositionWidth, }) => {
    var _a, _b;
    const calculatedProm = calculateMetadata
        ? calculateMetadata({
            defaultProps,
            props: originalProps,
            abortSignal: signal,
            compositionId,
        })
        : null;
    if (calculatedProm !== null &&
        typeof calculatedProm === 'object' &&
        'then' in calculatedProm) {
        return calculatedProm.then((c) => {
            var _a;
            const { height, width, durationInFrames, fps, defaultCodec } = validateCalculated({
                calculated: c,
                compositionDurationInFrames,
                compositionFps,
                compositionHeight,
                compositionWidth,
                compositionId,
            });
            return {
                width,
                height,
                fps,
                durationInFrames,
                id: compositionId,
                defaultProps: (0, input_props_serialization_js_1.serializeThenDeserializeInStudio)(defaultProps),
                props: (0, input_props_serialization_js_1.serializeThenDeserializeInStudio)((_a = c.props) !== null && _a !== void 0 ? _a : originalProps),
                defaultCodec: defaultCodec !== null && defaultCodec !== void 0 ? defaultCodec : null,
            };
        });
    }
    const data = validateCalculated({
        calculated: calculatedProm,
        compositionDurationInFrames,
        compositionFps,
        compositionHeight,
        compositionWidth,
        compositionId,
    });
    if (calculatedProm === null) {
        return {
            ...data,
            id: compositionId,
            defaultProps: (0, input_props_serialization_js_1.serializeThenDeserializeInStudio)(defaultProps !== null && defaultProps !== void 0 ? defaultProps : {}),
            props: (0, input_props_serialization_js_1.serializeThenDeserializeInStudio)(originalProps),
            defaultCodec: null,
        };
    }
    return {
        ...data,
        id: compositionId,
        defaultProps: (0, input_props_serialization_js_1.serializeThenDeserializeInStudio)(defaultProps !== null && defaultProps !== void 0 ? defaultProps : {}),
        props: (0, input_props_serialization_js_1.serializeThenDeserializeInStudio)((_a = calculatedProm.props) !== null && _a !== void 0 ? _a : originalProps),
        defaultCodec: (_b = calculatedProm.defaultCodec) !== null && _b !== void 0 ? _b : null,
    };
};
exports.resolveVideoConfig = resolveVideoConfig;
const resolveVideoConfigOrCatch = (params) => {
    try {
        const promiseOrReturnValue = (0, exports.resolveVideoConfig)(params);
        return {
            type: 'success',
            result: promiseOrReturnValue,
        };
    }
    catch (err) {
        return {
            type: 'error',
            error: err,
        };
    }
};
exports.resolveVideoConfigOrCatch = resolveVideoConfigOrCatch;


/***/ }),

/***/ 7026:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.flattenChildren = void 0;
const react_1 = __importDefault(__webpack_require__(6540));
const flattenChildren = (children) => {
    const childrenArray = react_1.default.Children.toArray(children);
    return childrenArray.reduce((flatChildren, child) => {
        if (child.type === react_1.default.Fragment) {
            return flatChildren.concat((0, exports.flattenChildren)(child.props
                .children));
        }
        flatChildren.push(child);
        return flatChildren;
    }, []);
};
exports.flattenChildren = flattenChildren;


/***/ }),

/***/ 1886:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Series = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const Sequence_js_1 = __webpack_require__(7973);
const enable_sequence_stack_traces_js_1 = __webpack_require__(9599);
const v5_flag_js_1 = __webpack_require__(8232);
const validate_duration_in_frames_js_1 = __webpack_require__(2488);
const flatten_children_js_1 = __webpack_require__(7026);
const is_inside_series_js_1 = __webpack_require__(3355);
const SeriesSequenceRefForwardingFunction = ({ children }, _ref) => {
    (0, is_inside_series_js_1.useRequireToBeInsideSeries)();
    // Discard ref
    return (0, jsx_runtime_1.jsx)(is_inside_series_js_1.IsNotInsideSeriesProvider, { children: children });
};
const SeriesSequence = (0, react_1.forwardRef)(SeriesSequenceRefForwardingFunction);
/**
 * @description with this component, you can easily stitch together scenes that should play sequentially after another.
 * @see [Documentation](https://www.remotion.dev/docs/series)
 */
const Series = (props) => {
    const childrenValue = (0, react_1.useMemo)(() => {
        let startFrame = 0;
        const flattenedChildren = (0, flatten_children_js_1.flattenChildren)(props.children);
        return react_1.Children.map(flattenedChildren, (child, i) => {
            var _a;
            const castedChild = child;
            if (typeof castedChild === 'string') {
                // Don't throw if it's just some accidential whitespace
                if (castedChild.trim() === '') {
                    return null;
                }
                throw new TypeError(`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but you passed a string "${castedChild}"`);
            }
            if (castedChild.type !== SeriesSequence) {
                throw new TypeError(`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but got ${castedChild} instead`);
            }
            const debugInfo = `index = ${i}, duration = ${castedChild.props.durationInFrames}`;
            if (!(castedChild === null || castedChild === void 0 ? void 0 : castedChild.props.children)) {
                throw new TypeError(`A <Series.Sequence /> component (${debugInfo}) was detected to not have any children. Delete it to fix this error.`);
            }
            const durationInFramesProp = castedChild.props.durationInFrames;
            const { durationInFrames, children: _children, from, name, ...passedProps } = castedChild.props; // `from` is not accepted and must be filtered out if used in JS
            if (i !== flattenedChildren.length - 1 ||
                durationInFramesProp !== Infinity) {
                (0, validate_duration_in_frames_js_1.validateDurationInFrames)(durationInFramesProp, {
                    component: `of a <Series.Sequence /> component`,
                    allowFloats: true,
                });
            }
            const offset = (_a = castedChild.props.offset) !== null && _a !== void 0 ? _a : 0;
            if (Number.isNaN(offset)) {
                throw new TypeError(`The "offset" property of a <Series.Sequence /> must not be NaN, but got NaN (${debugInfo}).`);
            }
            if (!Number.isFinite(offset)) {
                throw new TypeError(`The "offset" property of a <Series.Sequence /> must be finite, but got ${offset} (${debugInfo}).`);
            }
            if (offset % 1 !== 0) {
                throw new TypeError(`The "offset" property of a <Series.Sequence /> must be finite, but got ${offset} (${debugInfo}).`);
            }
            const currentStartFrame = startFrame + offset;
            startFrame += durationInFramesProp + offset;
            return ((0, jsx_runtime_1.jsx)(Sequence_js_1.Sequence, { name: name || '<Series.Sequence>', from: currentStartFrame, durationInFrames: durationInFramesProp, ...passedProps, ref: castedChild.ref, children: child }));
        });
    }, [props.children]);
    if (v5_flag_js_1.ENABLE_V5_BREAKING_CHANGES) {
        return ((0, jsx_runtime_1.jsx)(is_inside_series_js_1.IsInsideSeriesContainer, { children: (0, jsx_runtime_1.jsx)(Sequence_js_1.Sequence, { ...props, children: childrenValue }) }));
    }
    return (0, jsx_runtime_1.jsx)(is_inside_series_js_1.IsInsideSeriesContainer, { children: childrenValue });
};
exports.Series = Series;
Series.Sequence = SeriesSequence;
(0, enable_sequence_stack_traces_js_1.addSequenceStackTraces)(SeriesSequence);


/***/ }),

/***/ 3355:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useRequireToBeInsideSeries = exports.IsNotInsideSeriesProvider = exports.IsInsideSeriesContainer = exports.IsInsideSeriesContext = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __importStar(__webpack_require__(6540));
exports.IsInsideSeriesContext = (0, react_1.createContext)(false);
const IsInsideSeriesContainer = ({ children }) => {
    return ((0, jsx_runtime_1.jsx)(exports.IsInsideSeriesContext.Provider, { value: true, children: children }));
};
exports.IsInsideSeriesContainer = IsInsideSeriesContainer;
const IsNotInsideSeriesProvider = ({ children }) => {
    return ((0, jsx_runtime_1.jsx)(exports.IsInsideSeriesContext.Provider, { value: false, children: children }));
};
exports.IsNotInsideSeriesProvider = IsNotInsideSeriesProvider;
const useRequireToBeInsideSeries = () => {
    const isInsideSeries = react_1.default.useContext(exports.IsInsideSeriesContext);
    if (!isInsideSeries) {
        throw new Error('This component must be inside a <Series /> component.');
    }
};
exports.useRequireToBeInsideSeries = useRequireToBeInsideSeries;


/***/ }),

/***/ 4073:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupEnvVariables = void 0;
const get_remotion_environment_js_1 = __webpack_require__(7356);
// https://github.com/remotion-dev/remotion/issues/3412#issuecomment-1910120552
function getEnvVar() {
    const parts = ['proc', 'ess', '.', 'en', 'v', '.', 'NOD', 'E_EN', 'V'];
    return parts.join('');
}
const getEnvVariables = () => {
    if ((0, get_remotion_environment_js_1.getRemotionEnvironment)().isRendering) {
        const param = window.remotion_envVariables;
        if (!param) {
            return {};
        }
        return { ...JSON.parse(param), NODE_ENV: "production" };
    }
    // For the Studio, we already set the environment variables in index-html.ts.
    // We just add NODE_ENV here.
    if (false) {}
    return {
        NODE_ENV: "production",
    };
};
const setupEnvVariables = () => {
    const env = getEnvVariables();
    if (!window.process) {
        window.process = {};
    }
    if (!window.process.env) {
        window.process.env = {};
    }
    Object.keys(env).forEach((key) => {
        window.process.env[key] = env[key];
    });
};
exports.setupEnvVariables = setupEnvVariables;


/***/ }),

/***/ 2398:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.measureSpring = void 0;
exports.spring = spring;
const interpolate_js_1 = __webpack_require__(1993);
const validate_frame_js_1 = __webpack_require__(1326);
const validate_fps_js_1 = __webpack_require__(706);
const validation_spring_duration_js_1 = __webpack_require__(9344);
const measure_spring_js_1 = __webpack_require__(2110);
const spring_utils_js_1 = __webpack_require__(3957);
/**
 * @description Calculates a position based on physical parameters, start and end value, and time.
 * @see [Documentation](https://www.remotion.dev/docs/spring)
 * @param {number} frame The current time value. Most of the time you want to pass in the return value of useCurrentFrame.
 * @param {number} fps The framerate at which the animation runs. Pass in the value obtained by `useVideoConfig()`.
 * @param {?boolean} reverse Whether the animation plays in reverse or not. Default `false`.
 * @param {?Object} config optional object that allows you to customize the physical properties of the animation.
 * @param {number} [config.mass=1] The weight of the spring. If you reduce the mass, the animation becomes faster!
 * @param {number} [config.damping=10] How hard the animation decelerates.
 * @param {number} [config.stiffness=100] Affects bounciness of the animation.
 * @param {boolean} [config.overshootClamping=false] Whether to prevent the animation going beyond the target value.
 * @param {?number} [config.from] The initial value of the animation. Default `0`
 * @param {?number} [config.to] The end value of the animation. Default `1`
 * @param {?number} [config.durationInFrames] Stretch the duration of an animation to  a set value.. Default `undefined`
 * @param {?number} [config.durationThreshold] How close to the end the animation is considered to be done. Default `0.005`
 * @param {?number} [config.delay] Delay the animation for this amount of frames. Default `0`
 */
function spring({ frame: passedFrame, fps, config = {}, from = 0, to = 1, durationInFrames: passedDurationInFrames, durationRestThreshold, delay = 0, reverse = false, }) {
    (0, validation_spring_duration_js_1.validateSpringDuration)(passedDurationInFrames);
    (0, validate_frame_js_1.validateFrame)({
        frame: passedFrame,
        durationInFrames: Infinity,
        allowFloats: true,
    });
    (0, validate_fps_js_1.validateFps)(fps, 'to spring()', false);
    const needsToCalculateNaturalDuration = reverse || typeof passedDurationInFrames !== 'undefined';
    const naturalDuration = needsToCalculateNaturalDuration
        ? (0, measure_spring_js_1.measureSpring)({
            fps,
            config,
            threshold: durationRestThreshold,
        })
        : undefined;
    const naturalDurationGetter = needsToCalculateNaturalDuration
        ? {
            get: () => naturalDuration,
        }
        : {
            get: () => {
                throw new Error('did not calculate natural duration, this is an error with Remotion. Please report');
            },
        };
    const reverseProcessed = reverse
        ? (passedDurationInFrames !== null && passedDurationInFrames !== void 0 ? passedDurationInFrames : naturalDurationGetter.get()) - passedFrame
        : passedFrame;
    const delayProcessed = reverseProcessed + (reverse ? delay : -delay);
    const durationProcessed = passedDurationInFrames === undefined
        ? delayProcessed
        : delayProcessed / (passedDurationInFrames / naturalDurationGetter.get());
    if (passedDurationInFrames && delayProcessed > passedDurationInFrames) {
        return to;
    }
    const spr = (0, spring_utils_js_1.springCalculation)({
        fps,
        frame: durationProcessed,
        config,
    });
    const inner = config.overshootClamping
        ? to >= from
            ? Math.min(spr.current, to)
            : Math.max(spr.current, to)
        : spr.current;
    const interpolated = from === 0 && to === 1 ? inner : (0, interpolate_js_1.interpolate)(inner, [0, 1], [from, to]);
    return interpolated;
}
var measure_spring_js_2 = __webpack_require__(2110);
Object.defineProperty(exports, "measureSpring", ({ enumerable: true, get: function () { return measure_spring_js_2.measureSpring; } }));


/***/ }),

/***/ 2110:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.measureSpring = measureSpring;
const validate_fps_js_1 = __webpack_require__(706);
const spring_utils_js_1 = __webpack_require__(3957);
const cache = new Map();
/**
 * @description The function returns how long it takes for a spring animation to settle
 * @see [Documentation](https://www.remotion.dev/docs/measure-spring)
 */
function measureSpring({ fps, config = {}, threshold = 0.005, }) {
    if (typeof threshold !== 'number') {
        throw new TypeError(`threshold must be a number, got ${threshold} of type ${typeof threshold}`);
    }
    if (threshold === 0) {
        return Infinity;
    }
    if (threshold === 1) {
        return 0;
    }
    if (isNaN(threshold)) {
        throw new TypeError('Threshold is NaN');
    }
    if (!Number.isFinite(threshold)) {
        throw new TypeError('Threshold is not finite');
    }
    if (threshold < 0) {
        throw new TypeError('Threshold is below 0');
    }
    const cacheKey = [
        fps,
        config.damping,
        config.mass,
        config.overshootClamping,
        config.stiffness,
        threshold,
    ].join('-');
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }
    (0, validate_fps_js_1.validateFps)(fps, 'to the measureSpring() function', false);
    let frame = 0;
    let finishedFrame = 0;
    const calc = () => {
        return (0, spring_utils_js_1.springCalculation)({
            fps,
            frame,
            config,
        });
    };
    let animation = calc();
    const calcDifference = () => {
        return Math.abs(animation.current - animation.toValue);
    };
    let difference = calcDifference();
    while (difference >= threshold) {
        frame++;
        animation = calc();
        difference = calcDifference();
    }
    // Since spring is bouncy, just because it's under the threshold we
    // cannot be sure it's done. We need to animate further until it stays in the
    // threshold for, say, 20 frames.
    finishedFrame = frame;
    for (let i = 0; i < 20; i++) {
        frame++;
        animation = calc();
        difference = calcDifference();
        if (difference >= threshold) {
            i = 0;
            finishedFrame = frame + 1;
        }
    }
    cache.set(cacheKey, finishedFrame);
    return finishedFrame;
}


/***/ }),

/***/ 3957:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.springCalculation = springCalculation;
const defaultSpringConfig = {
    damping: 10,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
};
const advanceCache = {};
function advance({ animation, now, config, }) {
    const { toValue, lastTimestamp, current, velocity } = animation;
    const deltaTime = Math.min(now - lastTimestamp, 64);
    if (config.damping <= 0) {
        throw new Error('Spring damping must be greater than 0, otherwise the spring() animation will never end, causing an infinite loop.');
    }
    const c = config.damping;
    const m = config.mass;
    const k = config.stiffness;
    const cacheKey = [
        toValue,
        lastTimestamp,
        current,
        velocity,
        c,
        m,
        k,
        now,
    ].join('-');
    if (advanceCache[cacheKey]) {
        return advanceCache[cacheKey];
    }
    const v0 = -velocity;
    const x0 = toValue - current;
    const zeta = c / (2 * Math.sqrt(k * m)); // damping ratio
    const omega0 = Math.sqrt(k / m); // undamped angular frequency of the oscillator (rad/ms)
    const omega1 = omega0 * Math.sqrt(1 - zeta ** 2); // exponential decay
    const t = deltaTime / 1000;
    const sin1 = Math.sin(omega1 * t);
    const cos1 = Math.cos(omega1 * t);
    // under damped
    const underDampedEnvelope = Math.exp(-zeta * omega0 * t);
    const underDampedFrag1 = underDampedEnvelope *
        (sin1 * ((v0 + zeta * omega0 * x0) / omega1) + x0 * cos1);
    const underDampedPosition = toValue - underDampedFrag1;
    // This looks crazy -- it's actually just the derivative of the oscillation function
    const underDampedVelocity = zeta * omega0 * underDampedFrag1 -
        underDampedEnvelope *
            (cos1 * (v0 + zeta * omega0 * x0) - omega1 * x0 * sin1);
    // critically damped
    const criticallyDampedEnvelope = Math.exp(-omega0 * t);
    const criticallyDampedPosition = toValue - criticallyDampedEnvelope * (x0 + (v0 + omega0 * x0) * t);
    const criticallyDampedVelocity = criticallyDampedEnvelope *
        (v0 * (t * omega0 - 1) + t * x0 * omega0 * omega0);
    const animationNode = {
        toValue,
        prevPosition: current,
        lastTimestamp: now,
        current: zeta < 1 ? underDampedPosition : criticallyDampedPosition,
        velocity: zeta < 1 ? underDampedVelocity : criticallyDampedVelocity,
    };
    advanceCache[cacheKey] = animationNode;
    return animationNode;
}
const calculationCache = {};
function springCalculation({ frame, fps, config = {}, }) {
    const from = 0;
    const to = 1;
    const cacheKey = [
        frame,
        fps,
        config.damping,
        config.mass,
        config.overshootClamping,
        config.stiffness,
    ].join('-');
    if (calculationCache[cacheKey]) {
        return calculationCache[cacheKey];
    }
    let animation = {
        lastTimestamp: 0,
        current: from,
        toValue: to,
        velocity: 0,
        prevPosition: 0,
    };
    const frameClamped = Math.max(0, frame);
    const unevenRest = frameClamped % 1;
    for (let f = 0; f <= Math.floor(frameClamped); f++) {
        if (f === Math.floor(frameClamped)) {
            f += unevenRest;
        }
        const time = (f / fps) * 1000;
        animation = advance({
            animation,
            now: time,
            config: {
                ...defaultSpringConfig,
                ...config,
            },
        });
    }
    calculationCache[cacheKey] = animation;
    return animation;
}


/***/ }),

/***/ 2397:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.staticFile = exports.includesHexOfUnsafeChar = void 0;
const problematicCharacters = {
    '%3A': ':',
    '%2F': '/',
    '%3F': '?',
    '%23': '#',
    '%5B': '[',
    '%5D': ']',
    '%40': '@',
    '%21': '!',
    '%24': '$',
    '%26': '&',
    '%27': "'",
    '%28': '(',
    '%29': ')',
    '%2A': '*',
    '%2B': '+',
    '%2C': ',',
    '%3B': ';',
};
const didWarn = {};
const warnOnce = (message) => {
    if (didWarn[message]) {
        return;
    }
    // eslint-disable-next-line no-console
    console.warn(message);
    didWarn[message] = true;
};
const includesHexOfUnsafeChar = (path) => {
    for (const key of Object.keys(problematicCharacters)) {
        if (path.includes(key)) {
            return { containsHex: true, hexCode: key };
        }
    }
    return { containsHex: false };
};
exports.includesHexOfUnsafeChar = includesHexOfUnsafeChar;
const trimLeadingSlash = (path) => {
    if (path.startsWith('/')) {
        return trimLeadingSlash(path.substring(1));
    }
    return path;
};
const inner = (path) => {
    if (typeof window !== 'undefined' && window.remotion_staticBase) {
        if (path.startsWith(window.remotion_staticBase)) {
            throw new Error(`The value "${path}" is already prefixed with the static base ${window.remotion_staticBase}. You don't need to call staticFile() on it.`);
        }
        return `${window.remotion_staticBase}/${trimLeadingSlash(path)}`;
    }
    return `/${trimLeadingSlash(path)}`;
};
const encodeBySplitting = (path) => {
    const splitBySlash = path.split('/');
    const encodedArray = splitBySlash.map((element) => {
        return encodeURIComponent(element);
    });
    const merged = encodedArray.join('/');
    return merged;
};
/**
 * @description Reference a file from the public/ folder. If the file does not appear in the autocomplete, type the path manually.
 * @see [Documentation](https://www.remotion.dev/docs/staticfile)
 */
const staticFile = (path) => {
    if (path === null) {
        throw new TypeError('null was passed to staticFile()');
    }
    if (typeof path === 'undefined') {
        throw new TypeError('undefined was passed to staticFile()');
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
        throw new TypeError(`staticFile() does not support remote URLs - got "${path}". Instead, pass the URL without wrapping it in staticFile(). See: https://remotion.dev/docs/staticfile-remote-urls`);
    }
    if (path.startsWith('..') || path.startsWith('./')) {
        throw new TypeError(`staticFile() does not support relative paths - got "${path}". Instead, pass the name of a file that is inside the public/ folder. See: https://remotion.dev/docs/staticfile-relative-paths`);
    }
    if (path.startsWith('/Users') ||
        path.startsWith('/home') ||
        path.startsWith('/tmp') ||
        path.startsWith('/etc') ||
        path.startsWith('/opt') ||
        path.startsWith('/var') ||
        path.startsWith('C:') ||
        path.startsWith('D:') ||
        path.startsWith('E:')) {
        throw new TypeError(`staticFile() does not support absolute paths - got "${path}". Instead, pass the name of a file that is inside the public/ folder. See: https://remotion.dev/docs/staticfile-relative-paths`);
    }
    if (path.startsWith('public/')) {
        throw new TypeError(`Do not include the public/ prefix when using staticFile() - got "${path}". See: https://remotion.dev/docs/staticfile-relative-paths`);
    }
    const includesHex = (0, exports.includesHexOfUnsafeChar)(path);
    if (includesHex.containsHex) {
        warnOnce(`WARNING: You seem to pass an already encoded path (path contains ${includesHex.hexCode}). Since Remotion 4.0, the encoding is done by staticFile() itself. You may want to remove a encodeURIComponent() wrapping.`);
    }
    const preprocessed = encodeBySplitting(path);
    const preparsed = inner(preprocessed);
    if (!preparsed.startsWith('/')) {
        return `/${preparsed}`;
    }
    return preparsed;
};
exports.staticFile = staticFile;


/***/ }),

/***/ 8019:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.usePlayingState = exports.useTimelineSetFrame = exports.useTimelinePosition = exports.getFrameForComposition = exports.getInitialFrameState = exports.persistCurrentFrame = exports.SetTimelineContext = exports.TimelineContext = void 0;
const react_1 = __webpack_require__(6540);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const use_video_js_1 = __webpack_require__(3523);
exports.TimelineContext = (0, react_1.createContext)({
    frame: {},
    playing: false,
    playbackRate: 1,
    rootId: '',
    imperativePlaying: {
        current: false,
    },
    setPlaybackRate: () => {
        throw new Error('default');
    },
    audioAndVideoTags: { current: [] },
});
exports.SetTimelineContext = (0, react_1.createContext)({
    setFrame: () => {
        throw new Error('default');
    },
    setPlaying: () => {
        throw new Error('default');
    },
});
const makeKey = () => {
    return `remotion.time-all`;
};
const persistCurrentFrame = (time) => {
    localStorage.setItem(makeKey(), JSON.stringify(time));
};
exports.persistCurrentFrame = persistCurrentFrame;
const getInitialFrameState = () => {
    var _a;
    const item = (_a = localStorage.getItem(makeKey())) !== null && _a !== void 0 ? _a : '{}';
    const obj = JSON.parse(item);
    return obj;
};
exports.getInitialFrameState = getInitialFrameState;
const getFrameForComposition = (composition) => {
    var _a, _b;
    const item = (_a = localStorage.getItem(makeKey())) !== null && _a !== void 0 ? _a : '{}';
    const obj = JSON.parse(item);
    if (obj[composition] !== undefined) {
        return Number(obj[composition]);
    }
    if (typeof window === 'undefined') {
        return 0;
    }
    return (_b = window.remotion_initialFrame) !== null && _b !== void 0 ? _b : 0;
};
exports.getFrameForComposition = getFrameForComposition;
const useTimelinePosition = () => {
    var _a, _b;
    const videoConfig = (0, use_video_js_1.useVideo)();
    const state = (0, react_1.useContext)(exports.TimelineContext);
    if (!videoConfig) {
        return typeof window === 'undefined'
            ? 0
            : ((_a = window.remotion_initialFrame) !== null && _a !== void 0 ? _a : 0);
    }
    const unclamped = (_b = state.frame[videoConfig.id]) !== null && _b !== void 0 ? _b : ((0, get_remotion_environment_js_1.getRemotionEnvironment)().isPlayer
        ? 0
        : (0, exports.getFrameForComposition)(videoConfig.id));
    return Math.min(videoConfig.durationInFrames - 1, unclamped);
};
exports.useTimelinePosition = useTimelinePosition;
const useTimelineSetFrame = () => {
    const { setFrame } = (0, react_1.useContext)(exports.SetTimelineContext);
    return setFrame;
};
exports.useTimelineSetFrame = useTimelineSetFrame;
const usePlayingState = () => {
    const { playing, imperativePlaying } = (0, react_1.useContext)(exports.TimelineContext);
    const { setPlaying } = (0, react_1.useContext)(exports.SetTimelineContext);
    return (0, react_1.useMemo)(() => [playing, setPlaying, imperativePlaying], [imperativePlaying, playing, setPlaying]);
};
exports.usePlayingState = usePlayingState;


/***/ }),

/***/ 108:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.truthy = truthy;
function truthy(value) {
    return Boolean(value);
}


/***/ }),

/***/ 204:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useBufferState = void 0;
const react_1 = __webpack_require__(6540);
const buffering_1 = __webpack_require__(9076);
const useBufferState = () => {
    const buffer = (0, react_1.useContext)(buffering_1.BufferingContextReact);
    // Allows <Img> tag to be rendered without a context
    // https://github.com/remotion-dev/remotion/issues/4007
    const addBlock = buffer ? buffer.addBlock : null;
    return (0, react_1.useMemo)(() => ({
        delayPlayback: () => {
            if (!addBlock) {
                throw new Error('Tried to enable the buffering state, but a Remotion context was not found. This API can only be called in a component that was passed to the Remotion Player or a <Composition>. Or you might have experienced a version mismatch - run `npx remotion versions` and ensure all packages have the same version. This error is thrown by the buffer state https://remotion.dev/docs/player/buffer-state');
            }
            const { unblock } = addBlock({
                id: String(Math.random()),
            });
            return { unblock };
        },
    }), [addBlock]);
};
exports.useBufferState = useBufferState;


/***/ }),

/***/ 1041:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useCurrentFrame = void 0;
const react_1 = __webpack_require__(6540);
const CanUseRemotionHooks_js_1 = __webpack_require__(5108);
const SequenceContext_js_1 = __webpack_require__(3822);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const timeline_position_state_js_1 = __webpack_require__(8019);
/**
 * @description Get the current frame of the video. Frames are 0-indexed, meaning the first frame is 0, the last frame is the duration of the composition in frames minus one.
 * @see [Documentation](https://remotion.dev/docs/use-current-frame)
 */
const useCurrentFrame = () => {
    const canUseRemotionHooks = (0, react_1.useContext)(CanUseRemotionHooks_js_1.CanUseRemotionHooks);
    if (!canUseRemotionHooks) {
        if ((0, get_remotion_environment_js_1.getRemotionEnvironment)().isPlayer) {
            throw new Error(`useCurrentFrame can only be called inside a component that was passed to <Player>. See: https://www.remotion.dev/docs/player/examples`);
        }
        throw new Error(`useCurrentFrame() can only be called inside a component that was registered as a composition. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions`);
    }
    const frame = (0, timeline_position_state_js_1.useTimelinePosition)();
    const context = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const contextOffset = context
        ? context.cumulatedFrom + context.relativeFrom
        : 0;
    return frame - contextOffset;
};
exports.useCurrentFrame = useCurrentFrame;


/***/ }),

/***/ 7218:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useCurrentScale = exports.calculateScale = exports.PreviewSizeContext = exports.CurrentScaleContext = void 0;
const react_1 = __importStar(__webpack_require__(6540));
const get_remotion_environment_1 = __webpack_require__(7356);
const use_unsafe_video_config_1 = __webpack_require__(3881);
exports.CurrentScaleContext = react_1.default.createContext(null);
exports.PreviewSizeContext = (0, react_1.createContext)({
    setSize: () => undefined,
    size: { size: 'auto', translation: { x: 0, y: 0 } },
});
const calculateScale = ({ canvasSize, compositionHeight, compositionWidth, previewSize, }) => {
    const heightRatio = canvasSize.height / compositionHeight;
    const widthRatio = canvasSize.width / compositionWidth;
    const ratio = Math.min(heightRatio, widthRatio);
    return previewSize === 'auto' ? ratio : Number(previewSize);
};
exports.calculateScale = calculateScale;
/**
 * Gets the current scale of the container in which the component is being rendered.
 * Only works in the Remotion Studio and in the Remotion Player.
 */
const useCurrentScale = (options) => {
    const hasContext = react_1.default.useContext(exports.CurrentScaleContext);
    const zoomContext = react_1.default.useContext(exports.PreviewSizeContext);
    const config = (0, use_unsafe_video_config_1.useUnsafeVideoConfig)();
    if (hasContext === null || config === null || zoomContext === null) {
        if (options === null || options === void 0 ? void 0 : options.dontThrowIfOutsideOfRemotion) {
            return 1;
        }
        if ((0, get_remotion_environment_1.getRemotionEnvironment)().isRendering) {
            return 1;
        }
        throw new Error([
            'useCurrentScale() was called outside of a Remotion context.',
            'This hook can only be called in a component that is being rendered by Remotion.',
            'If you want to this hook to return 1 outside of Remotion, pass {dontThrowIfOutsideOfRemotion: true} as an option.',
            'If you think you called this hook in a Remotion component, make sure all versions of Remotion are aligned.',
        ].join('\n'));
    }
    if (hasContext.type === 'scale') {
        return hasContext.scale;
    }
    return (0, exports.calculateScale)({
        canvasSize: hasContext.canvasSize,
        compositionHeight: config.height,
        compositionWidth: config.width,
        previewSize: zoomContext.size.size,
    });
};
exports.useCurrentScale = useCurrentScale;


/***/ }),

/***/ 4534:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useLazyComponent = void 0;
const react_1 = __importStar(__webpack_require__(6540));
// Expected, it can be any component props
const useLazyComponent = (compProps) => {
    const lazy = (0, react_1.useMemo)(() => {
        if ('lazyComponent' in compProps &&
            typeof compProps.lazyComponent !== 'undefined') {
            return react_1.default.lazy(compProps.lazyComponent);
        }
        if ('component' in compProps) {
            // In SSR, suspense is not yet supported, we cannot use React.lazy
            if (typeof document === 'undefined') {
                return compProps.component;
            }
            return react_1.default.lazy(() => Promise.resolve({ default: compProps.component }));
        }
        throw new Error("You must pass either 'component' or 'lazyComponent'");
        // Very important to leave the dependencies as they are, or instead
        // the player will remount on every frame.
        // @ts-expect-error
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [compProps.component, compProps.lazyComponent]);
    return lazy;
};
exports.useLazyComponent = useLazyComponent;


/***/ }),

/***/ 6971:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useMediaBuffering = void 0;
const react_1 = __webpack_require__(6540);
const use_buffer_state_1 = __webpack_require__(204);
const useMediaBuffering = ({ element, shouldBuffer, isPremounting, }) => {
    const buffer = (0, use_buffer_state_1.useBufferState)();
    const [isBuffering, setIsBuffering] = (0, react_1.useState)(false);
    // Buffer state based on `waiting` and `canplay`
    (0, react_1.useEffect)(() => {
        let cleanupFns = [];
        const { current } = element;
        if (!current) {
            return;
        }
        if (!shouldBuffer) {
            return;
        }
        if (isPremounting) {
            // Needed by iOS Safari which will not load by default
            // and therefore not fire the canplay event.
            // Be cautious about using `current.load()` as it will
            // reset if a video is already playing.
            // Therefore only calling it after checking if the video
            // has no future data.
            // Breaks on Firefox though: https://github.com/remotion-dev/remotion/issues/3915
            if (current.readyState < current.HAVE_FUTURE_DATA) {
                if (!navigator.userAgent.includes('Firefox/')) {
                    current.load();
                }
            }
            return;
        }
        const cleanup = () => {
            cleanupFns.forEach((fn) => fn());
            cleanupFns = [];
            setIsBuffering(false);
        };
        const onWaiting = () => {
            setIsBuffering(true);
            const { unblock } = buffer.delayPlayback();
            const onCanPlay = () => {
                cleanup();
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                init();
            };
            const onError = () => {
                cleanup();
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                init();
            };
            current.addEventListener('canplay', onCanPlay, {
                once: true,
            });
            cleanupFns.push(() => {
                current.removeEventListener('canplay', onCanPlay);
            });
            current.addEventListener('error', onError, {
                once: true,
            });
            cleanupFns.push(() => {
                current.removeEventListener('error', onError);
            });
            cleanupFns.push(() => {
                unblock();
            });
        };
        const init = () => {
            if (current.readyState < current.HAVE_FUTURE_DATA) {
                onWaiting();
                // Needed by iOS Safari which will not load by default
                // and therefore not fire the canplay event.
                // Be cautious about using `current.load()` as it will
                // reset if a video is already playing.
                // Therefore only calling it after checking if the video
                // has no future data.
                // Breaks on Firefox though: https://github.com/remotion-dev/remotion/issues/3915
                if (!navigator.userAgent.includes('Firefox/')) {
                    current.load();
                }
            }
            else {
                current.addEventListener('waiting', onWaiting);
                cleanupFns.push(() => {
                    current.removeEventListener('waiting', onWaiting);
                });
            }
        };
        init();
        return () => {
            cleanup();
        };
    }, [buffer, element, isPremounting, shouldBuffer]);
    return isBuffering;
};
exports.useMediaBuffering = useMediaBuffering;


/***/ }),

/***/ 3600:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useMediaInTimeline = void 0;
const react_1 = __webpack_require__(6540);
const SequenceContext_js_1 = __webpack_require__(3822);
const SequenceManager_js_1 = __webpack_require__(9962);
const use_audio_frame_js_1 = __webpack_require__(8783);
const get_asset_file_name_js_1 = __webpack_require__(468);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const nonce_js_1 = __webpack_require__(2501);
const play_and_handle_not_allowed_error_js_1 = __webpack_require__(7119);
const timeline_position_state_js_1 = __webpack_require__(8019);
const use_video_config_js_1 = __webpack_require__(7770);
const volume_prop_js_1 = __webpack_require__(4490);
const didWarn = {};
const warnOnce = (message) => {
    if (didWarn[message]) {
        return;
    }
    // eslint-disable-next-line no-console
    console.warn(message);
    didWarn[message] = true;
};
const useMediaInTimeline = ({ volume, mediaVolume, mediaRef, src, mediaType, playbackRate, displayName, id, stack, showInTimeline, premountDisplay, onAutoPlayError, isPremounting, }) => {
    const videoConfig = (0, use_video_config_js_1.useVideoConfig)();
    const { rootId, audioAndVideoTags } = (0, react_1.useContext)(timeline_position_state_js_1.TimelineContext);
    const parentSequence = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const actualFrom = parentSequence
        ? parentSequence.relativeFrom + parentSequence.cumulatedFrom
        : 0;
    const { imperativePlaying } = (0, react_1.useContext)(timeline_position_state_js_1.TimelineContext);
    const startsAt = (0, use_audio_frame_js_1.useMediaStartsAt)();
    const { registerSequence, unregisterSequence } = (0, react_1.useContext)(SequenceManager_js_1.SequenceManager);
    const [initialVolume] = (0, react_1.useState)(() => volume);
    const nonce = (0, nonce_js_1.useNonce)();
    const duration = parentSequence
        ? Math.min(parentSequence.durationInFrames, videoConfig.durationInFrames)
        : videoConfig.durationInFrames;
    const doesVolumeChange = typeof volume === 'function';
    const volumes = (0, react_1.useMemo)(() => {
        if (typeof volume === 'number') {
            return volume;
        }
        return new Array(Math.floor(Math.max(0, duration + startsAt)))
            .fill(true)
            .map((_, i) => {
            return (0, volume_prop_js_1.evaluateVolume)({
                frame: i + startsAt,
                volume,
                mediaVolume,
                allowAmplificationDuringRender: false,
            });
        })
            .join(',');
    }, [duration, startsAt, volume, mediaVolume]);
    (0, react_1.useEffect)(() => {
        if (typeof volume === 'number' && volume !== initialVolume) {
            warnOnce(`Remotion: The ${mediaType} with src ${src} has changed it's volume. Prefer the callback syntax for setting volume to get better timeline display: https://www.remotion.dev/docs/using-audio/#controlling-volume`);
        }
    }, [initialVolume, mediaType, src, volume]);
    (0, react_1.useEffect)(() => {
        var _a, _b, _c;
        if (!mediaRef.current) {
            return;
        }
        if (!src) {
            throw new Error('No src passed');
        }
        if (!(0, get_remotion_environment_js_1.getRemotionEnvironment)().isStudio &&
            ((_b = (_a = window.process) === null || _a === void 0 ? void 0 : _a.env) === null || _b === void 0 ? void 0 : _b.NODE_ENV) !== 'test') {
            return;
        }
        if (!showInTimeline) {
            return;
        }
        registerSequence({
            type: mediaType,
            src,
            id,
            duration,
            from: 0,
            parent: (_c = parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.id) !== null && _c !== void 0 ? _c : null,
            displayName: displayName !== null && displayName !== void 0 ? displayName : (0, get_asset_file_name_js_1.getAssetDisplayName)(src),
            rootId,
            volume: volumes,
            showInTimeline: true,
            nonce,
            startMediaFrom: 0 - startsAt,
            doesVolumeChange,
            loopDisplay: undefined,
            playbackRate,
            stack,
            premountDisplay,
        });
        return () => {
            unregisterSequence(id);
        };
    }, [
        actualFrom,
        duration,
        id,
        parentSequence,
        src,
        registerSequence,
        rootId,
        unregisterSequence,
        videoConfig,
        volumes,
        doesVolumeChange,
        nonce,
        mediaRef,
        mediaType,
        startsAt,
        playbackRate,
        displayName,
        stack,
        showInTimeline,
        premountDisplay,
    ]);
    (0, react_1.useEffect)(() => {
        const tag = {
            id,
            play: () => {
                if (!imperativePlaying.current) {
                    // Don't play if for example in a <Freeze> state.
                    return;
                }
                if (isPremounting) {
                    return;
                }
                return (0, play_and_handle_not_allowed_error_js_1.playAndHandleNotAllowedError)(mediaRef, mediaType, onAutoPlayError);
            },
        };
        audioAndVideoTags.current.push(tag);
        return () => {
            audioAndVideoTags.current = audioAndVideoTags.current.filter((a) => a.id !== id);
        };
    }, [
        audioAndVideoTags,
        id,
        mediaRef,
        mediaType,
        onAutoPlayError,
        imperativePlaying,
        isPremounting,
    ]);
};
exports.useMediaInTimeline = useMediaInTimeline;


/***/ }),

/***/ 1228:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useMediaPlayback = exports.DEFAULT_ACCEPTABLE_TIMESHIFT = void 0;
const react_1 = __webpack_require__(6540);
const use_audio_frame_js_1 = __webpack_require__(8783);
const buffer_until_first_frame_js_1 = __webpack_require__(7492);
const buffering_js_1 = __webpack_require__(9076);
const play_and_handle_not_allowed_error_js_1 = __webpack_require__(7119);
const timeline_position_state_js_1 = __webpack_require__(8019);
const use_current_frame_js_1 = __webpack_require__(1041);
const use_media_buffering_js_1 = __webpack_require__(6971);
const use_request_video_callback_time_js_1 = __webpack_require__(3061);
const use_video_config_js_1 = __webpack_require__(7770);
const get_current_time_js_1 = __webpack_require__(8538);
const video_fragment_js_1 = __webpack_require__(6658);
const warn_about_non_seekable_media_js_1 = __webpack_require__(1650);
exports.DEFAULT_ACCEPTABLE_TIMESHIFT = 0.45;
const seek = (mediaRef, time) => {
    if (!mediaRef.current) {
        return;
    }
    // iOS seeking does not support multiple decimals
    const timeToSet = (0, video_fragment_js_1.isIosSafari)() ? Number(time.toFixed(1)) : time;
    mediaRef.current.currentTime = timeToSet;
};
const useMediaPlayback = ({ mediaRef, src, mediaType, playbackRate: localPlaybackRate, onlyWarnForMediaSeekingError, acceptableTimeshift, pauseWhenBuffering, isPremounting, debugSeeking, onAutoPlayError, }) => {
    const { playbackRate: globalPlaybackRate } = (0, react_1.useContext)(timeline_position_state_js_1.TimelineContext);
    const frame = (0, use_current_frame_js_1.useCurrentFrame)();
    const absoluteFrame = (0, timeline_position_state_js_1.useTimelinePosition)();
    const [playing] = (0, timeline_position_state_js_1.usePlayingState)();
    const buffering = (0, react_1.useContext)(buffering_js_1.BufferingContextReact);
    const { fps } = (0, use_video_config_js_1.useVideoConfig)();
    const mediaStartsAt = (0, use_audio_frame_js_1.useMediaStartsAt)();
    const lastSeekDueToShift = (0, react_1.useRef)(null);
    const lastSeek = (0, react_1.useRef)(null);
    if (!buffering) {
        throw new Error('useMediaPlayback must be used inside a <BufferingContext>');
    }
    const isVariableFpsVideoMap = (0, react_1.useRef)({});
    const onVariableFpsVideoDetected = (0, react_1.useCallback)(() => {
        if (!src) {
            return;
        }
        if (debugSeeking) {
            // eslint-disable-next-line no-console
            console.log(`Detected ${src} as a variable FPS video. Disabling buffering while seeking.`);
        }
        isVariableFpsVideoMap.current[src] = true;
    }, [debugSeeking, src]);
    const currentTime = (0, use_request_video_callback_time_js_1.useRequestVideoCallbackTime)({
        mediaRef,
        mediaType,
        lastSeek,
        onVariableFpsVideoDetected,
    });
    const desiredUnclampedTime = (0, get_current_time_js_1.getMediaTime)({
        frame,
        playbackRate: localPlaybackRate,
        startFrom: -mediaStartsAt,
        fps,
    });
    const isMediaTagBuffering = (0, use_media_buffering_js_1.useMediaBuffering)({
        element: mediaRef,
        shouldBuffer: pauseWhenBuffering,
        isPremounting,
    });
    const { bufferUntilFirstFrame, isBuffering } = (0, buffer_until_first_frame_js_1.useBufferUntilFirstFrame)({
        mediaRef,
        mediaType,
        onVariableFpsVideoDetected,
        pauseWhenBuffering,
    });
    const playbackRate = localPlaybackRate * globalPlaybackRate;
    // For short audio, a lower acceptable time shift is used
    const acceptableTimeShiftButLessThanDuration = (() => {
        var _a;
        if ((_a = mediaRef.current) === null || _a === void 0 ? void 0 : _a.duration) {
            return Math.min(mediaRef.current.duration, acceptableTimeshift !== null && acceptableTimeshift !== void 0 ? acceptableTimeshift : exports.DEFAULT_ACCEPTABLE_TIMESHIFT);
        }
        return acceptableTimeshift;
    })();
    const isPlayerBuffering = (0, buffering_js_1.useIsPlayerBuffering)(buffering);
    (0, react_1.useEffect)(() => {
        var _a, _b;
        if (!playing) {
            (_a = mediaRef.current) === null || _a === void 0 ? void 0 : _a.pause();
            return;
        }
        const isMediaTagBufferingOrStalled = isMediaTagBuffering || isBuffering();
        if (isPlayerBuffering && !isMediaTagBufferingOrStalled) {
            (_b = mediaRef.current) === null || _b === void 0 ? void 0 : _b.pause();
        }
    }, [isBuffering, isMediaTagBuffering, isPlayerBuffering, mediaRef, playing]);
    (0, react_1.useEffect)(() => {
        var _a;
        const tagName = mediaType === 'audio' ? '<Audio>' : '<Video>';
        if (!mediaRef.current) {
            throw new Error(`No ${mediaType} ref found`);
        }
        if (!src) {
            throw new Error(`No 'src' attribute was passed to the ${tagName} element.`);
        }
        const playbackRateToSet = Math.max(0, playbackRate);
        if (mediaRef.current.playbackRate !== playbackRateToSet) {
            mediaRef.current.playbackRate = playbackRateToSet;
        }
        const { duration } = mediaRef.current;
        const shouldBeTime = !Number.isNaN(duration) && Number.isFinite(duration)
            ? Math.min(duration, desiredUnclampedTime)
            : desiredUnclampedTime;
        const mediaTagTime = mediaRef.current.currentTime;
        const rvcTime = (_a = currentTime.current) !== null && _a !== void 0 ? _a : null;
        const isVariableFpsVideo = isVariableFpsVideoMap.current[src];
        const timeShiftMediaTag = Math.abs(shouldBeTime - mediaTagTime);
        const timeShiftRvcTag = rvcTime ? Math.abs(shouldBeTime - rvcTime) : null;
        const timeShift = timeShiftRvcTag && !isVariableFpsVideo
            ? timeShiftRvcTag
            : timeShiftMediaTag;
        if (debugSeeking) {
            // eslint-disable-next-line no-console
            console.log({
                mediaTagTime,
                rvcTime,
                shouldBeTime,
                state: mediaRef.current.readyState,
                playing: !mediaRef.current.paused,
                isVariableFpsVideo,
            });
        }
        if (timeShift > acceptableTimeShiftButLessThanDuration &&
            lastSeekDueToShift.current !== shouldBeTime) {
            // If scrubbing around, adjust timing
            // or if time shift is bigger than 0.45sec
            if (debugSeeking) {
                // eslint-disable-next-line no-console
                console.log('Seeking', {
                    shouldBeTime,
                    isTime: mediaTagTime,
                    rvcTime,
                    timeShift,
                    isVariableFpsVideo,
                });
            }
            seek(mediaRef, shouldBeTime);
            lastSeek.current = shouldBeTime;
            lastSeekDueToShift.current = shouldBeTime;
            if (playing && !isVariableFpsVideo) {
                if (playbackRate > 0) {
                    bufferUntilFirstFrame(shouldBeTime);
                }
                if (mediaRef.current.paused) {
                    (0, play_and_handle_not_allowed_error_js_1.playAndHandleNotAllowedError)(mediaRef, mediaType, onAutoPlayError);
                }
            }
            if (!onlyWarnForMediaSeekingError) {
                (0, warn_about_non_seekable_media_js_1.warnAboutNonSeekableMedia)(mediaRef.current, onlyWarnForMediaSeekingError ? 'console-warning' : 'console-error');
            }
            return;
        }
        const seekThreshold = playing ? 0.15 : 0.00001;
        // Only perform a seek if the time is not already the same.
        // Chrome rounds to 6 digits, so 0.033333333 -> 0.033333,
        // therefore a threshold is allowed.
        // Refer to the https://github.com/remotion-dev/video-buffering-example
        // which is fixed by only seeking conditionally.
        const makesSenseToSeek = Math.abs(mediaRef.current.currentTime - shouldBeTime) > seekThreshold;
        const isMediaTagBufferingOrStalled = isMediaTagBuffering || isBuffering();
        const isSomethingElseBuffering = buffering.buffering.current && !isMediaTagBufferingOrStalled;
        if (!playing || isSomethingElseBuffering) {
            if (makesSenseToSeek) {
                seek(mediaRef, shouldBeTime);
                lastSeek.current = shouldBeTime;
            }
            return;
        }
        // We assured we are in playing state
        if ((mediaRef.current.paused && !mediaRef.current.ended) ||
            absoluteFrame === 0) {
            if (makesSenseToSeek) {
                seek(mediaRef, shouldBeTime);
                lastSeek.current = shouldBeTime;
            }
            (0, play_and_handle_not_allowed_error_js_1.playAndHandleNotAllowedError)(mediaRef, mediaType, onAutoPlayError);
            if (!isVariableFpsVideo) {
                if (playbackRate > 0) {
                    bufferUntilFirstFrame(shouldBeTime);
                }
            }
        }
    }, [
        absoluteFrame,
        acceptableTimeShiftButLessThanDuration,
        bufferUntilFirstFrame,
        buffering.buffering,
        currentTime,
        debugSeeking,
        desiredUnclampedTime,
        isBuffering,
        isMediaTagBuffering,
        mediaRef,
        mediaType,
        onlyWarnForMediaSeekingError,
        playbackRate,
        playing,
        src,
        onAutoPlayError,
    ]);
};
exports.useMediaPlayback = useMediaPlayback;


/***/ }),

/***/ 2340:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useMediaTagVolume = void 0;
const react_1 = __webpack_require__(6540);
// Returns the real volume of the audio or video while playing,
// no matter what the supposed volume should be
const useMediaTagVolume = (mediaRef) => {
    const [actualVolume, setActualVolume] = (0, react_1.useState)(1);
    (0, react_1.useEffect)(() => {
        const ref = mediaRef.current;
        if (!ref) {
            return;
        }
        const onChange = () => {
            setActualVolume(ref.volume);
        };
        ref.addEventListener('volumechange', onChange);
        return () => ref.removeEventListener('volumechange', onChange);
    }, [mediaRef]);
    (0, react_1.useEffect)(() => {
        const ref = mediaRef.current;
        if (!ref) {
            return;
        }
        if (ref.volume !== actualVolume) {
            setActualVolume(ref.volume);
        }
    }, [actualVolume, mediaRef]);
    return actualVolume;
};
exports.useMediaTagVolume = useMediaTagVolume;


/***/ }),

/***/ 3061:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useRequestVideoCallbackTime = void 0;
const react_1 = __webpack_require__(6540);
const useRequestVideoCallbackTime = ({ mediaRef, mediaType, lastSeek, onVariableFpsVideoDetected, }) => {
    const currentTime = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const { current } = mediaRef;
        if (current) {
            currentTime.current = current.currentTime;
        }
        else {
            currentTime.current = null;
            return;
        }
        if (mediaType !== 'video') {
            currentTime.current = null;
            return;
        }
        const videoTag = current;
        if (!videoTag.requestVideoFrameCallback) {
            return;
        }
        let cancel = () => undefined;
        const request = () => {
            if (!videoTag) {
                return;
            }
            const cb = videoTag.requestVideoFrameCallback((_, info) => {
                if (currentTime.current !== null) {
                    const difference = Math.abs(currentTime.current - info.mediaTime);
                    const differenceToLastSeek = Math.abs(lastSeek.current === null
                        ? Infinity
                        : info.mediaTime - lastSeek.current);
                    // If a video suddenly jumps to a position much further than previously
                    // and there was no relevant seek
                    // Case to be seen with 66a4a49b0862333a56c7d03c.mp4 and autoPlay and pauseWhenBuffering
                    if (difference > 0.5 &&
                        differenceToLastSeek > 0.5 &&
                        info.mediaTime > currentTime.current) {
                        onVariableFpsVideoDetected();
                    }
                }
                currentTime.current = info.mediaTime;
                request();
            });
            cancel = () => {
                videoTag.cancelVideoFrameCallback(cb);
                cancel = () => undefined;
            };
        };
        request();
        return () => {
            cancel();
        };
    }, [lastSeek, mediaRef, mediaType, onVariableFpsVideoDetected]);
    return currentTime;
};
exports.useRequestVideoCallbackTime = useRequestVideoCallbackTime;


/***/ }),

/***/ 5413:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useSyncVolumeWithMediaTag = void 0;
const react_1 = __webpack_require__(6540);
const is_approximately_the_same_js_1 = __webpack_require__(4773);
const volume_prop_js_1 = __webpack_require__(4490);
const useSyncVolumeWithMediaTag = ({ volumePropFrame, actualVolume, volume, mediaVolume, mediaRef, }) => {
    (0, react_1.useEffect)(() => {
        const userPreferredVolume = (0, volume_prop_js_1.evaluateVolume)({
            frame: volumePropFrame,
            volume,
            mediaVolume,
            allowAmplificationDuringRender: false,
        });
        if (!(0, is_approximately_the_same_js_1.isApproximatelyTheSame)(userPreferredVolume, actualVolume) &&
            mediaRef.current) {
            mediaRef.current.volume = userPreferredVolume;
        }
    }, [actualVolume, volumePropFrame, mediaRef, volume, mediaVolume]);
};
exports.useSyncVolumeWithMediaTag = useSyncVolumeWithMediaTag;


/***/ }),

/***/ 3881:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useUnsafeVideoConfig = void 0;
const react_1 = __webpack_require__(6540);
const SequenceContext_js_1 = __webpack_require__(3822);
const use_video_js_1 = __webpack_require__(3523);
const useUnsafeVideoConfig = () => {
    var _a, _b, _c;
    const context = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const ctxWidth = (_a = context === null || context === void 0 ? void 0 : context.width) !== null && _a !== void 0 ? _a : null;
    const ctxHeight = (_b = context === null || context === void 0 ? void 0 : context.height) !== null && _b !== void 0 ? _b : null;
    const ctxDuration = (_c = context === null || context === void 0 ? void 0 : context.durationInFrames) !== null && _c !== void 0 ? _c : null;
    const video = (0, use_video_js_1.useVideo)();
    return (0, react_1.useMemo)(() => {
        if (!video) {
            return null;
        }
        const { id, durationInFrames, fps, height, width, defaultProps, props, defaultCodec, } = video;
        return {
            id,
            width: ctxWidth !== null && ctxWidth !== void 0 ? ctxWidth : width,
            height: ctxHeight !== null && ctxHeight !== void 0 ? ctxHeight : height,
            fps,
            durationInFrames: ctxDuration !== null && ctxDuration !== void 0 ? ctxDuration : durationInFrames,
            defaultProps,
            props,
            defaultCodec,
        };
    }, [ctxDuration, ctxHeight, ctxWidth, video]);
};
exports.useUnsafeVideoConfig = useUnsafeVideoConfig;


/***/ }),

/***/ 7770:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useVideoConfig = void 0;
const react_1 = __webpack_require__(6540);
const CanUseRemotionHooks_js_1 = __webpack_require__(5108);
const is_player_js_1 = __webpack_require__(5516);
const use_unsafe_video_config_js_1 = __webpack_require__(3881);
/**
 * @description Get some info about the context of the video that you are making.
 * @see [Documentation](https://www.remotion.dev/docs/use-video-config)
 * @returns Returns an object containing `fps`, `width`, `height`, `durationInFrames`, `id` and `defaultProps`.
 */
const useVideoConfig = () => {
    const videoConfig = (0, use_unsafe_video_config_js_1.useUnsafeVideoConfig)();
    const context = (0, react_1.useContext)(CanUseRemotionHooks_js_1.CanUseRemotionHooks);
    const isPlayer = (0, is_player_js_1.useIsPlayer)();
    if (!videoConfig) {
        if ((typeof window !== 'undefined' && window.remotion_isPlayer) ||
            isPlayer) {
            throw new Error([
                'No video config found. Likely reasons:',
                '- You are probably calling useVideoConfig() from outside the component passed to <Player />. See https://www.remotion.dev/docs/player/examples for how to set up the Player correctly.',
                '- You have multiple versions of Remotion installed which causes the React context to get lost.',
            ].join('-'));
        }
        throw new Error('No video config found. You are probably calling useVideoConfig() from a component which has not been registered as a <Composition />. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions for more information.');
    }
    if (!context) {
        throw new Error('Called useVideoConfig() outside a Remotion composition.');
    }
    return videoConfig;
};
exports.useVideoConfig = useVideoConfig;


/***/ }),

/***/ 3523:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useVideo = void 0;
const react_1 = __webpack_require__(6540);
const CompositionManagerContext_js_1 = __webpack_require__(9126);
const ResolveCompositionConfig_js_1 = __webpack_require__(7240);
const useVideo = () => {
    var _a;
    const { canvasContent, compositions, currentCompositionMetadata } = (0, react_1.useContext)(CompositionManagerContext_js_1.CompositionManager);
    const selected = compositions.find((c) => {
        return ((canvasContent === null || canvasContent === void 0 ? void 0 : canvasContent.type) === 'composition' &&
            c.id === canvasContent.compositionId);
    });
    const resolved = (0, ResolveCompositionConfig_js_1.useResolvedVideoConfig)((_a = selected === null || selected === void 0 ? void 0 : selected.id) !== null && _a !== void 0 ? _a : null);
    return (0, react_1.useMemo)(() => {
        var _a;
        if (!resolved) {
            return null;
        }
        if (resolved.type === 'error') {
            return null;
        }
        if (resolved.type === 'loading') {
            return null;
        }
        if (!selected) {
            return null;
        }
        return {
            ...resolved.result,
            defaultProps: (_a = selected.defaultProps) !== null && _a !== void 0 ? _a : {},
            id: selected.id,
            // We override the selected metadata with the metadata that was passed to renderMedia(),
            // and don't allow it to be changed during render anymore
            ...(currentCompositionMetadata !== null && currentCompositionMetadata !== void 0 ? currentCompositionMetadata : {}),
            component: selected.component,
        };
    }, [currentCompositionMetadata, resolved, selected]);
};
exports.useVideo = useVideo;


/***/ }),

/***/ 8232:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ENABLE_V5_BREAKING_CHANGES = void 0;
exports.ENABLE_V5_BREAKING_CHANGES = false;


/***/ }),

/***/ 1326:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateFrame = void 0;
const validateFrame = ({ allowFloats, durationInFrames, frame, }) => {
    if (typeof frame === 'undefined') {
        throw new TypeError(`Argument missing for parameter "frame"`);
    }
    if (typeof frame !== 'number') {
        throw new TypeError(`Argument passed for "frame" is not a number: ${frame}`);
    }
    if (!Number.isFinite(frame)) {
        throw new RangeError(`Frame ${frame} is not finite`);
    }
    if (frame % 1 !== 0 && !allowFloats) {
        throw new RangeError(`Argument for frame must be an integer, but got ${frame}`);
    }
    if (frame < 0 && frame < -durationInFrames) {
        throw new RangeError(`Cannot use frame ${frame}: Duration of composition is ${durationInFrames}, therefore the lowest frame that can be rendered is ${-durationInFrames}`);
    }
    if (frame > durationInFrames - 1) {
        throw new RangeError(`Cannot use frame ${frame}: Duration of composition is ${durationInFrames}, therefore the highest frame that can be rendered is ${durationInFrames - 1}`);
    }
};
exports.validateFrame = validateFrame;


/***/ }),

/***/ 4972:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateMediaProps = void 0;
const validateMediaProps = (props, component) => {
    if (typeof props.volume !== 'number' &&
        typeof props.volume !== 'function' &&
        typeof props.volume !== 'undefined') {
        throw new TypeError(`You have passed a volume of type ${typeof props.volume} to your <${component} /> component. Volume must be a number or a function with the signature '(frame: number) => number' undefined.`);
    }
    if (typeof props.volume === 'number' && props.volume < 0) {
        throw new TypeError(`You have passed a volume below 0 to your <${component} /> component. Volume must be between 0 and 1`);
    }
    if (typeof props.playbackRate !== 'number' &&
        typeof props.playbackRate !== 'undefined') {
        throw new TypeError(`You have passed a playbackRate of type ${typeof props.playbackRate} to your <${component} /> component. Playback rate must a real number or undefined.`);
    }
    if (typeof props.playbackRate === 'number' &&
        (isNaN(props.playbackRate) ||
            !Number.isFinite(props.playbackRate) ||
            props.playbackRate <= 0)) {
        throw new TypeError(`You have passed a playbackRate of ${props.playbackRate} to your <${component} /> component. Playback rate must be a real number above 0.`);
    }
};
exports.validateMediaProps = validateMediaProps;


/***/ }),

/***/ 771:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateStartFromProps = void 0;
const validateStartFromProps = (startFrom, endAt) => {
    if (typeof startFrom !== 'undefined') {
        if (typeof startFrom !== 'number') {
            throw new TypeError(`type of startFrom prop must be a number, instead got type ${typeof startFrom}.`);
        }
        if (isNaN(startFrom) || startFrom === Infinity) {
            throw new TypeError('startFrom prop can not be NaN or Infinity.');
        }
        if (startFrom < 0) {
            throw new TypeError(`startFrom must be greater than equal to 0 instead got ${startFrom}.`);
        }
    }
    if (typeof endAt !== 'undefined') {
        if (typeof endAt !== 'number') {
            throw new TypeError(`type of endAt prop must be a number, instead got type ${typeof endAt}.`);
        }
        if (isNaN(endAt)) {
            throw new TypeError('endAt prop can not be NaN.');
        }
        if (endAt <= 0) {
            throw new TypeError(`endAt must be a positive number, instead got ${endAt}.`);
        }
    }
    if (endAt < startFrom) {
        throw new TypeError('endAt prop must be greater than startFrom prop.');
    }
};
exports.validateStartFromProps = validateStartFromProps;


/***/ }),

/***/ 803:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateRenderAsset = exports.validateArtifactFilename = void 0;
const validateArtifactFilename = (filename) => {
    if (typeof filename !== 'string') {
        throw new TypeError(`The "filename" must be a string, but you passed a value of type ${typeof filename}`);
    }
    if (filename.trim() === '') {
        throw new Error('The `filename` must not be empty');
    }
    if (!filename.match(/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g)) {
        throw new Error('The `filename` must match "/^([0-9a-zA-Z-!_.*\'()/:&$@=;+,?]+)/g". Use forward slashes only, even on Windows.');
    }
};
exports.validateArtifactFilename = validateArtifactFilename;
const validateContent = (content) => {
    if (typeof content !== 'string' && !(content instanceof Uint8Array)) {
        throw new TypeError(`The "content" must be a string or Uint8Array, but you passed a value of type ${typeof content}`);
    }
    if (typeof content === 'string' && content.trim() === '') {
        throw new Error('The `content` must not be empty');
    }
};
const validateRenderAsset = (artifact) => {
    // We don't have validation for it yet
    if (artifact.type !== 'artifact') {
        return;
    }
    (0, exports.validateArtifactFilename)(artifact.filename);
    validateContent(artifact.content);
};
exports.validateRenderAsset = validateRenderAsset;


/***/ }),

/***/ 1969:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.invalidCompositionErrorMessage = exports.validateCompositionId = exports.isCompositionIdValid = void 0;
const getRegex = () => /^([a-zA-Z0-9-\u4E00-\u9FFF])+$/g;
const isCompositionIdValid = (id) => id.match(getRegex());
exports.isCompositionIdValid = isCompositionIdValid;
const validateCompositionId = (id) => {
    if (!(0, exports.isCompositionIdValid)(id)) {
        throw new Error(`Composition id can only contain a-z, A-Z, 0-9, CJK characters and -. You passed ${id}`);
    }
};
exports.validateCompositionId = validateCompositionId;
exports.invalidCompositionErrorMessage = `Composition ID must match ${String(getRegex())}`;


/***/ }),

/***/ 19:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateDefaultCodec = validateDefaultCodec;
const codec_1 = __webpack_require__(5528);
function validateDefaultCodec(defaultCodec, location) {
    if (typeof defaultCodec === 'undefined') {
        return;
    }
    if (typeof defaultCodec !== 'string') {
        throw new TypeError(`The "defaultCodec" prop ${location} must be a string, but you passed a value of type ${typeof defaultCodec}.`);
    }
    if (!codec_1.validCodecs.includes(defaultCodec)) {
        throw new Error(`The "defaultCodec" prop ${location} must be one of ${codec_1.validCodecs.join(', ')}, but you passed ${defaultCodec}.`);
    }
}


/***/ }),

/***/ 4127:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateDefaultAndInputProps = void 0;
const validateDefaultAndInputProps = (defaultProps, name, compositionId) => {
    if (!defaultProps) {
        return;
    }
    if (typeof defaultProps !== 'object') {
        throw new Error(`"${name}" must be an object, but you passed a value of type ${typeof defaultProps}`);
    }
    if (Array.isArray(defaultProps)) {
        throw new Error(`"${name}" must be an object, an array was passed ${compositionId ? `for composition "${compositionId}"` : ''}`);
    }
};
exports.validateDefaultAndInputProps = validateDefaultAndInputProps;


/***/ }),

/***/ 8140:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateDimension = validateDimension;
function validateDimension(amount, nameOfProp, location) {
    if (typeof amount !== 'number') {
        throw new Error(`The "${nameOfProp}" prop ${location} must be a number, but you passed a value of type ${typeof amount}`);
    }
    if (isNaN(amount)) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must not be NaN, but is NaN.`);
    }
    if (!Number.isFinite(amount)) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must be finite, but is ${amount}.`);
    }
    if (amount % 1 !== 0) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must be an integer, but is ${amount}.`);
    }
    if (amount <= 0) {
        throw new TypeError(`The "${nameOfProp}" prop ${location} must be positive, but got ${amount}.`);
    }
}


/***/ }),

/***/ 2488:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateDurationInFrames = validateDurationInFrames;
function validateDurationInFrames(durationInFrames, options) {
    const { allowFloats, component } = options;
    if (typeof durationInFrames === 'undefined') {
        throw new Error(`The "durationInFrames" prop ${component} is missing.`);
    }
    if (typeof durationInFrames !== 'number') {
        throw new Error(`The "durationInFrames" prop ${component} must be a number, but you passed a value of type ${typeof durationInFrames}`);
    }
    if (durationInFrames <= 0) {
        throw new TypeError(`The "durationInFrames" prop ${component} must be positive, but got ${durationInFrames}.`);
    }
    if (!allowFloats && durationInFrames % 1 !== 0) {
        throw new TypeError(`The "durationInFrames" prop ${component} must be an integer, but got ${durationInFrames}.`);
    }
    if (!Number.isFinite(durationInFrames)) {
        throw new TypeError(`The "durationInFrames" prop ${component} must be finite, but got ${durationInFrames}.`);
    }
}


/***/ }),

/***/ 3613:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.invalidFolderNameErrorMessage = exports.validateFolderName = exports.isFolderNameValid = void 0;
const getRegex = () => /^([a-zA-Z0-9-\u4E00-\u9FFF])+$/g;
const isFolderNameValid = (name) => name.match(getRegex());
exports.isFolderNameValid = isFolderNameValid;
const validateFolderName = (name) => {
    if (name === undefined || name === null) {
        throw new TypeError('You must pass a name to a <Folder />.');
    }
    if (typeof name !== 'string') {
        throw new TypeError(`The "name" you pass into <Folder /> must be a string. Got: ${typeof name}`);
    }
    if (!(0, exports.isFolderNameValid)(name)) {
        throw new Error(`Folder name can only contain a-z, A-Z, 0-9 and -. You passed ${name}`);
    }
};
exports.validateFolderName = validateFolderName;
exports.invalidFolderNameErrorMessage = `Folder name must match ${String(getRegex())}`;


/***/ }),

/***/ 706:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateFps = validateFps;
function validateFps(fps, location, isGif) {
    if (typeof fps !== 'number') {
        throw new Error(`"fps" must be a number, but you passed a value of type ${typeof fps} ${location}`);
    }
    if (!Number.isFinite(fps)) {
        throw new Error(`"fps" must be a finite, but you passed ${fps} ${location}`);
    }
    if (isNaN(fps)) {
        throw new Error(`"fps" must not be NaN, but got ${fps} ${location}`);
    }
    if (fps <= 0) {
        throw new TypeError(`"fps" must be positive, but got ${fps} ${location}`);
    }
    if (isGif && fps > 50) {
        throw new TypeError(`The FPS for a GIF cannot be higher than 50. Use the --every-nth-frame option to lower the FPS: https://remotion.dev/docs/render-as-gif`);
    }
}


/***/ }),

/***/ 9344:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateSpringDuration = void 0;
const validateSpringDuration = (dur) => {
    if (typeof dur === 'undefined') {
        return;
    }
    if (typeof dur !== 'number') {
        throw new TypeError(`A "duration" of a spring must be a "number" but is "${typeof dur}"`);
    }
    if (Number.isNaN(dur)) {
        throw new TypeError('A "duration" of a spring is NaN, which it must not be');
    }
    if (!Number.isFinite(dur)) {
        throw new TypeError('A "duration" of a spring must be finite, but is ' + dur);
    }
    if (dur <= 0) {
        throw new TypeError('A "duration" of a spring must be positive, but is ' + dur);
    }
};
exports.validateSpringDuration = validateSpringDuration;


/***/ }),

/***/ 6558:
/***/ ((__unused_webpack_module, exports) => {


// Automatically generated on publish
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VERSION = void 0;
/**
 * @description Provides the current version number of the Remotion library.
 * @see [Documentation](https://remotion.dev/docs/version)
 * @returns {string} The current version of the remotion package
 */
exports.VERSION = '4.0.242';


/***/ }),

/***/ 2400:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 4472:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OffthreadVideo = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const Sequence_js_1 = __webpack_require__(7973);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const validate_media_props_js_1 = __webpack_require__(4972);
const validate_start_from_props_js_1 = __webpack_require__(771);
const OffthreadVideoForRendering_js_1 = __webpack_require__(6113);
const VideoForPreview_js_1 = __webpack_require__(3260);
/**
 * @description This method imports and displays a video, similar to <Video />. During rendering, it extracts the exact frame from the video and displays it in an <img> tag
 * @see [Documentation](https://www.remotion.dev/docs/offthreadvideo)
 */
const OffthreadVideo = (props) => {
    // Should only destruct `startFrom` and `endAt` from props,
    // rest gets drilled down
    const { startFrom, endAt, name, pauseWhenBuffering, stack, showInTimeline, ...otherProps } = props;
    const environment = (0, get_remotion_environment_js_1.getRemotionEnvironment)();
    const onDuration = (0, react_1.useCallback)(() => undefined, []);
    if (typeof props.src !== 'string') {
        throw new TypeError(`The \`<OffthreadVideo>\` tag requires a string for \`src\`, but got ${JSON.stringify(props.src)} instead.`);
    }
    if (props.imageFormat) {
        throw new TypeError(`The \`<OffthreadVideo>\` tag does no longer accept \`imageFormat\`. Use the \`transparent\` prop if you want to render a transparent video.`);
    }
    if (typeof startFrom !== 'undefined' || typeof endAt !== 'undefined') {
        (0, validate_start_from_props_js_1.validateStartFromProps)(startFrom, endAt);
        const startFromFrameNo = startFrom !== null && startFrom !== void 0 ? startFrom : 0;
        const endAtFrameNo = endAt !== null && endAt !== void 0 ? endAt : Infinity;
        return ((0, jsx_runtime_1.jsx)(Sequence_js_1.Sequence, { layout: "none", from: 0 - startFromFrameNo, showInTimeline: false, durationInFrames: endAtFrameNo, name: name, children: (0, jsx_runtime_1.jsx)(exports.OffthreadVideo, { pauseWhenBuffering: pauseWhenBuffering !== null && pauseWhenBuffering !== void 0 ? pauseWhenBuffering : false, ...otherProps }) }));
    }
    (0, validate_media_props_js_1.validateMediaProps)(props, 'Video');
    if (environment.isRendering) {
        return (0, jsx_runtime_1.jsx)(OffthreadVideoForRendering_js_1.OffthreadVideoForRendering, { ...otherProps });
    }
    const { transparent, toneMapped, _remotionDebugSeeking, onAutoPlayError, onVideoFrame, crossOrigin, delayRenderRetries, delayRenderTimeoutInMilliseconds, ...propsForPreview } = otherProps;
    return ((0, jsx_runtime_1.jsx)(VideoForPreview_js_1.VideoForPreview, { _remotionInternalStack: stack !== null && stack !== void 0 ? stack : null, _remotionInternalNativeLoopPassed: false, _remotionDebugSeeking: _remotionDebugSeeking !== null && _remotionDebugSeeking !== void 0 ? _remotionDebugSeeking : false, onDuration: onDuration, onlyWarnForMediaSeekingError: true, pauseWhenBuffering: pauseWhenBuffering !== null && pauseWhenBuffering !== void 0 ? pauseWhenBuffering : false, showInTimeline: showInTimeline !== null && showInTimeline !== void 0 ? showInTimeline : true, onAutoPlayError: onAutoPlayError !== null && onAutoPlayError !== void 0 ? onAutoPlayError : undefined, onVideoFrame: onVideoFrame !== null && onVideoFrame !== void 0 ? onVideoFrame : null, crossOrigin: crossOrigin, ...propsForPreview }));
};
exports.OffthreadVideo = OffthreadVideo;


/***/ }),

/***/ 6113:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OffthreadVideoForRendering = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const Img_js_1 = __webpack_require__(6669);
const RenderAssetManager_js_1 = __webpack_require__(599);
const SequenceContext_js_1 = __webpack_require__(3822);
const absolute_src_js_1 = __webpack_require__(9710);
const use_audio_frame_js_1 = __webpack_require__(8783);
const cancel_render_js_1 = __webpack_require__(8439);
const default_css_js_1 = __webpack_require__(6345);
const delay_render_js_1 = __webpack_require__(1006);
const random_js_1 = __webpack_require__(5923);
const timeline_position_state_js_1 = __webpack_require__(8019);
const truthy_js_1 = __webpack_require__(108);
const use_current_frame_js_1 = __webpack_require__(1041);
const use_unsafe_video_config_js_1 = __webpack_require__(3881);
const volume_prop_js_1 = __webpack_require__(4490);
const get_current_time_js_1 = __webpack_require__(8538);
const offthread_video_source_js_1 = __webpack_require__(3935);
const OffthreadVideoForRendering = ({ onError, volume: volumeProp, playbackRate, src, muted, allowAmplificationDuringRender, transparent = false, toneMapped = true, toneFrequency, name, loopVolumeCurveBehavior, delayRenderRetries, delayRenderTimeoutInMilliseconds, onVideoFrame, 
// Remove crossOrigin prop during rendering
// https://discord.com/channels/809501355504959528/844143007183667220/1311639632496033813
crossOrigin, ...props }) => {
    const absoluteFrame = (0, timeline_position_state_js_1.useTimelinePosition)();
    const frame = (0, use_current_frame_js_1.useCurrentFrame)();
    const volumePropsFrame = (0, use_audio_frame_js_1.useFrameForVolumeProp)(loopVolumeCurveBehavior !== null && loopVolumeCurveBehavior !== void 0 ? loopVolumeCurveBehavior : 'repeat');
    const videoConfig = (0, use_unsafe_video_config_js_1.useUnsafeVideoConfig)();
    const sequenceContext = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const mediaStartsAt = (0, use_audio_frame_js_1.useMediaStartsAt)();
    const { registerRenderAsset, unregisterRenderAsset } = (0, react_1.useContext)(RenderAssetManager_js_1.RenderAssetManager);
    if (!src) {
        throw new TypeError('No `src` was passed to <OffthreadVideo>.');
    }
    // Generate a string that's as unique as possible for this asset
    // but at the same time the same on all threads
    const id = (0, react_1.useMemo)(() => `offthreadvideo-${(0, random_js_1.random)(src !== null && src !== void 0 ? src : '')}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.cumulatedFrom}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.durationInFrames}`, [
        src,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.cumulatedFrom,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.durationInFrames,
    ]);
    if (!videoConfig) {
        throw new Error('No video config found');
    }
    const volume = (0, volume_prop_js_1.evaluateVolume)({
        volume: volumeProp,
        frame: volumePropsFrame,
        mediaVolume: 1,
        allowAmplificationDuringRender: allowAmplificationDuringRender !== null && allowAmplificationDuringRender !== void 0 ? allowAmplificationDuringRender : false,
    });
    (0, react_1.useEffect)(() => {
        var _a;
        if (!src) {
            throw new Error('No src passed');
        }
        if (!window.remotion_audioEnabled) {
            return;
        }
        if (muted) {
            return;
        }
        if (volume <= 0) {
            return;
        }
        registerRenderAsset({
            type: 'video',
            src: (0, absolute_src_js_1.getAbsoluteSrc)(src),
            id,
            frame: absoluteFrame,
            volume,
            mediaFrame: frame,
            playbackRate: playbackRate !== null && playbackRate !== void 0 ? playbackRate : 1,
            allowAmplificationDuringRender: allowAmplificationDuringRender !== null && allowAmplificationDuringRender !== void 0 ? allowAmplificationDuringRender : false,
            toneFrequency: toneFrequency !== null && toneFrequency !== void 0 ? toneFrequency : null,
            audioStartFrame: Math.max(0, -((_a = sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom) !== null && _a !== void 0 ? _a : 0)),
        });
        return () => unregisterRenderAsset(id);
    }, [
        muted,
        src,
        registerRenderAsset,
        id,
        unregisterRenderAsset,
        volume,
        frame,
        absoluteFrame,
        playbackRate,
        allowAmplificationDuringRender,
        toneFrequency,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom,
    ]);
    const currentTime = (0, react_1.useMemo)(() => {
        return ((0, get_current_time_js_1.getExpectedMediaFrameUncorrected)({
            frame,
            playbackRate: playbackRate || 1,
            startFrom: -mediaStartsAt,
        }) / videoConfig.fps);
    }, [frame, mediaStartsAt, playbackRate, videoConfig.fps]);
    const actualSrc = (0, react_1.useMemo)(() => {
        return (0, offthread_video_source_js_1.getOffthreadVideoSource)({
            src,
            currentTime,
            transparent,
            toneMapped,
        });
    }, [toneMapped, currentTime, src, transparent]);
    const [imageSrc, setImageSrc] = (0, react_1.useState)(null);
    (0, react_1.useLayoutEffect)(() => {
        if (!window.remotion_videoEnabled) {
            return;
        }
        const cleanup = [];
        setImageSrc(null);
        const controller = new AbortController();
        const newHandle = (0, delay_render_js_1.delayRender)(`Fetching ${actualSrc} from server`, {
            retries: delayRenderRetries !== null && delayRenderRetries !== void 0 ? delayRenderRetries : undefined,
            timeoutInMilliseconds: delayRenderTimeoutInMilliseconds !== null && delayRenderTimeoutInMilliseconds !== void 0 ? delayRenderTimeoutInMilliseconds : undefined,
        });
        const execute = async () => {
            try {
                const res = await fetch(actualSrc, {
                    signal: controller.signal,
                    cache: 'no-store',
                });
                if (res.status !== 200) {
                    if (res.status === 500) {
                        const json = await res.json();
                        if (json.error) {
                            const cleanedUpErrorMessage = json.error.replace(/^Error: /, '');
                            throw new Error(cleanedUpErrorMessage);
                        }
                    }
                    throw new Error(`Server returned status ${res.status} while fetching ${actualSrc}`);
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                cleanup.push(() => URL.revokeObjectURL(url));
                setImageSrc({
                    src: url,
                    handle: newHandle,
                });
            }
            catch (err) {
                // If component is unmounted, we should not throw
                if (err.message.includes('aborted')) {
                    (0, delay_render_js_1.continueRender)(newHandle);
                    return;
                }
                if (controller.signal.aborted) {
                    (0, delay_render_js_1.continueRender)(newHandle);
                    return;
                }
                if (err.message.includes('Failed to fetch')) {
                    // eslint-disable-next-line no-ex-assign
                    err = new Error(`Failed to fetch ${actualSrc}. This could be caused by Chrome rejecting the request because the disk space is low. Consider increasing the disk size of your environment.`, { cause: err });
                }
                if (onError) {
                    onError(err);
                }
                else {
                    (0, cancel_render_js_1.cancelRender)(err);
                }
            }
        };
        execute();
        cleanup.push(() => {
            if (controller.signal.aborted) {
                return;
            }
            controller.abort();
        });
        return () => {
            cleanup.forEach((c) => c());
        };
    }, [
        actualSrc,
        delayRenderRetries,
        delayRenderTimeoutInMilliseconds,
        onError,
    ]);
    const onErr = (0, react_1.useCallback)(() => {
        if (onError) {
            onError === null || onError === void 0 ? void 0 : onError(new Error('Failed to load image with src ' + imageSrc));
        }
        else {
            (0, cancel_render_js_1.cancelRender)('Failed to load image with src ' + imageSrc);
        }
    }, [imageSrc, onError]);
    const className = (0, react_1.useMemo)(() => {
        return [default_css_js_1.OFFTHREAD_VIDEO_CLASS_NAME, props.className]
            .filter(truthy_js_1.truthy)
            .join(' ');
    }, [props.className]);
    const onImageFrame = (0, react_1.useCallback)((img) => {
        if (onVideoFrame) {
            onVideoFrame(img);
        }
    }, [onVideoFrame]);
    if (!imageSrc || !window.remotion_videoEnabled) {
        return null;
    }
    (0, delay_render_js_1.continueRender)(imageSrc.handle);
    return ((0, jsx_runtime_1.jsx)(Img_js_1.Img, { src: imageSrc.src, className: className, delayRenderRetries: delayRenderRetries, delayRenderTimeoutInMilliseconds: delayRenderTimeoutInMilliseconds, onImageFrame: onImageFrame, ...props, onError: onErr }));
};
exports.OffthreadVideoForRendering = OffthreadVideoForRendering;


/***/ }),

/***/ 4657:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Video = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
/* eslint-disable @typescript-eslint/no-use-before-define */
const react_1 = __webpack_require__(6540);
const Sequence_js_1 = __webpack_require__(7973);
const absolute_src_js_1 = __webpack_require__(9710);
const calculate_loop_js_1 = __webpack_require__(773);
const enable_sequence_stack_traces_js_1 = __webpack_require__(9599);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const index_js_1 = __webpack_require__(2377);
const prefetch_js_1 = __webpack_require__(1011);
const use_video_config_js_1 = __webpack_require__(7770);
const validate_media_props_js_1 = __webpack_require__(4972);
const validate_start_from_props_js_1 = __webpack_require__(771);
const VideoForPreview_js_1 = __webpack_require__(3260);
const VideoForRendering_js_1 = __webpack_require__(8736);
const duration_state_js_1 = __webpack_require__(1152);
const VideoForwardingFunction = (props, ref) => {
    var _a, _b;
    const { startFrom, endAt, name, pauseWhenBuffering, stack, _remotionInternalNativeLoopPassed, showInTimeline, onAutoPlayError, ...otherProps } = props;
    const { loop, _remotionDebugSeeking, ...propsOtherThanLoop } = props;
    const { fps } = (0, use_video_config_js_1.useVideoConfig)();
    const environment = (0, get_remotion_environment_js_1.getRemotionEnvironment)();
    const { durations, setDurations } = (0, react_1.useContext)(duration_state_js_1.DurationsContext);
    if (typeof ref === 'string') {
        throw new Error('string refs are not supported');
    }
    if (typeof props.src !== 'string') {
        throw new TypeError(`The \`<Video>\` tag requires a string for \`src\`, but got ${JSON.stringify(props.src)} instead.`);
    }
    const preloadedSrc = (0, prefetch_js_1.usePreload)(props.src);
    const onDuration = (0, react_1.useCallback)((src, durationInSeconds) => {
        setDurations({ type: 'got-duration', durationInSeconds, src });
    }, [setDurations]);
    const onVideoFrame = (0, react_1.useCallback)(() => { }, []);
    const durationFetched = (_a = durations[(0, absolute_src_js_1.getAbsoluteSrc)(preloadedSrc)]) !== null && _a !== void 0 ? _a : durations[(0, absolute_src_js_1.getAbsoluteSrc)(props.src)];
    if (loop && durationFetched !== undefined) {
        if (!Number.isFinite(durationFetched)) {
            return ((0, jsx_runtime_1.jsx)(exports.Video, { ...propsOtherThanLoop, ref: ref, _remotionInternalNativeLoopPassed: true }));
        }
        const mediaDuration = durationFetched * fps;
        return ((0, jsx_runtime_1.jsx)(index_js_1.Loop, { durationInFrames: (0, calculate_loop_js_1.calculateLoopDuration)({
                endAt,
                mediaDuration,
                playbackRate: (_b = props.playbackRate) !== null && _b !== void 0 ? _b : 1,
                startFrom,
            }), layout: "none", name: name, children: (0, jsx_runtime_1.jsx)(exports.Video, { ...propsOtherThanLoop, ref: ref, _remotionInternalNativeLoopPassed: true }) }));
    }
    if (typeof startFrom !== 'undefined' || typeof endAt !== 'undefined') {
        (0, validate_start_from_props_js_1.validateStartFromProps)(startFrom, endAt);
        const startFromFrameNo = startFrom !== null && startFrom !== void 0 ? startFrom : 0;
        const endAtFrameNo = endAt !== null && endAt !== void 0 ? endAt : Infinity;
        return ((0, jsx_runtime_1.jsx)(Sequence_js_1.Sequence, { layout: "none", from: 0 - startFromFrameNo, showInTimeline: false, durationInFrames: endAtFrameNo, name: name, children: (0, jsx_runtime_1.jsx)(exports.Video, { pauseWhenBuffering: pauseWhenBuffering !== null && pauseWhenBuffering !== void 0 ? pauseWhenBuffering : false, ...otherProps, ref: ref }) }));
    }
    (0, validate_media_props_js_1.validateMediaProps)(props, 'Video');
    if (environment.isRendering) {
        return ((0, jsx_runtime_1.jsx)(VideoForRendering_js_1.VideoForRendering, { onDuration: onDuration, onVideoFrame: onVideoFrame !== null && onVideoFrame !== void 0 ? onVideoFrame : null, ...otherProps, ref: ref }));
    }
    return ((0, jsx_runtime_1.jsx)(VideoForPreview_js_1.VideoForPreview, { onlyWarnForMediaSeekingError: false, ...otherProps, ref: ref, onVideoFrame: null, 
        // Proposal: Make this default to true in v5
        pauseWhenBuffering: pauseWhenBuffering !== null && pauseWhenBuffering !== void 0 ? pauseWhenBuffering : false, onDuration: onDuration, _remotionInternalStack: stack !== null && stack !== void 0 ? stack : null, _remotionInternalNativeLoopPassed: _remotionInternalNativeLoopPassed !== null && _remotionInternalNativeLoopPassed !== void 0 ? _remotionInternalNativeLoopPassed : false, _remotionDebugSeeking: _remotionDebugSeeking !== null && _remotionDebugSeeking !== void 0 ? _remotionDebugSeeking : false, showInTimeline: showInTimeline !== null && showInTimeline !== void 0 ? showInTimeline : true, onAutoPlayError: onAutoPlayError !== null && onAutoPlayError !== void 0 ? onAutoPlayError : undefined }));
};
/**
 * @description allows you to include a video file in your Remotion project. It wraps the native HTMLVideoElement.
 * @see [Documentation](https://www.remotion.dev/docs/video)
 */
exports.Video = (0, react_1.forwardRef)(VideoForwardingFunction);
(0, enable_sequence_stack_traces_js_1.addSequenceStackTraces)(exports.Video);


/***/ }),

/***/ 3260:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoForPreview = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const SequenceContext_js_1 = __webpack_require__(3822);
const SequenceManager_js_1 = __webpack_require__(9962);
const use_audio_frame_js_1 = __webpack_require__(8783);
const prefetch_js_1 = __webpack_require__(1011);
const use_media_in_timeline_js_1 = __webpack_require__(3600);
const use_media_playback_js_1 = __webpack_require__(1228);
const use_media_tag_volume_js_1 = __webpack_require__(2340);
const use_sync_volume_with_media_tag_js_1 = __webpack_require__(5413);
const use_video_config_js_1 = __webpack_require__(7770);
const volume_position_state_js_1 = __webpack_require__(8068);
const emit_video_frame_js_1 = __webpack_require__(873);
const video_fragment_js_1 = __webpack_require__(6658);
const VideoForDevelopmentRefForwardingFunction = (props, ref) => {
    var _a, _b, _c;
    const videoRef = (0, react_1.useRef)(null);
    const { volume, muted, playbackRate, onlyWarnForMediaSeekingError, src, onDuration, 
    // @ts-expect-error
    acceptableTimeShift, acceptableTimeShiftInSeconds, toneFrequency, name, _remotionInternalNativeLoopPassed, _remotionInternalStack, _remotionDebugSeeking, style, pauseWhenBuffering, showInTimeline, loopVolumeCurveBehavior, onError, onAutoPlayError, onVideoFrame, crossOrigin, ...nativeProps } = props;
    const volumePropFrame = (0, use_audio_frame_js_1.useFrameForVolumeProp)(loopVolumeCurveBehavior !== null && loopVolumeCurveBehavior !== void 0 ? loopVolumeCurveBehavior : 'repeat');
    const { fps, durationInFrames } = (0, use_video_config_js_1.useVideoConfig)();
    const parentSequence = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const { hidden } = (0, react_1.useContext)(SequenceManager_js_1.SequenceVisibilityToggleContext);
    const [timelineId] = (0, react_1.useState)(() => String(Math.random()));
    const isSequenceHidden = (_a = hidden[timelineId]) !== null && _a !== void 0 ? _a : false;
    if (typeof acceptableTimeShift !== 'undefined') {
        throw new Error('acceptableTimeShift has been removed. Use acceptableTimeShiftInSeconds instead.');
    }
    const actualVolume = (0, use_media_tag_volume_js_1.useMediaTagVolume)(videoRef);
    const [mediaVolume] = (0, volume_position_state_js_1.useMediaVolumeState)();
    const [mediaMuted] = (0, volume_position_state_js_1.useMediaMutedState)();
    (0, use_media_in_timeline_js_1.useMediaInTimeline)({
        mediaRef: videoRef,
        volume,
        mediaVolume,
        mediaType: 'video',
        src,
        playbackRate: (_b = props.playbackRate) !== null && _b !== void 0 ? _b : 1,
        displayName: name !== null && name !== void 0 ? name : null,
        id: timelineId,
        stack: _remotionInternalStack,
        showInTimeline,
        premountDisplay: null,
        onAutoPlayError: onAutoPlayError !== null && onAutoPlayError !== void 0 ? onAutoPlayError : null,
        isPremounting: Boolean(parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.premounting),
    });
    (0, use_sync_volume_with_media_tag_js_1.useSyncVolumeWithMediaTag)({
        volumePropFrame,
        actualVolume,
        volume,
        mediaVolume,
        mediaRef: videoRef,
    });
    (0, use_media_playback_js_1.useMediaPlayback)({
        mediaRef: videoRef,
        src,
        mediaType: 'video',
        playbackRate: (_c = props.playbackRate) !== null && _c !== void 0 ? _c : 1,
        onlyWarnForMediaSeekingError,
        acceptableTimeshift: acceptableTimeShiftInSeconds !== null && acceptableTimeShiftInSeconds !== void 0 ? acceptableTimeShiftInSeconds : use_media_playback_js_1.DEFAULT_ACCEPTABLE_TIMESHIFT,
        isPremounting: Boolean(parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.premounting),
        pauseWhenBuffering,
        debugSeeking: _remotionDebugSeeking,
        onAutoPlayError: onAutoPlayError !== null && onAutoPlayError !== void 0 ? onAutoPlayError : null,
    });
    const actualFrom = parentSequence ? parentSequence.relativeFrom : 0;
    const duration = parentSequence
        ? Math.min(parentSequence.durationInFrames, durationInFrames)
        : durationInFrames;
    const actualSrc = (0, video_fragment_js_1.useAppendVideoFragment)({
        actualSrc: (0, prefetch_js_1.usePreload)(src),
        actualFrom,
        duration,
        fps,
    });
    (0, react_1.useImperativeHandle)(ref, () => {
        return videoRef.current;
    }, []);
    (0, react_1.useEffect)(() => {
        const { current } = videoRef;
        if (!current) {
            return;
        }
        const errorHandler = () => {
            var _a;
            if (current.error) {
                // eslint-disable-next-line no-console
                console.error('Error occurred in video', current === null || current === void 0 ? void 0 : current.error);
                // If user is handling the error, we don't cause an unhandled exception
                if (onError) {
                    const err = new Error(`Code ${current.error.code}: ${current.error.message}`);
                    onError(err);
                    return;
                }
                throw new Error(`The browser threw an error while playing the video ${src}: Code ${current.error.code} - ${(_a = current === null || current === void 0 ? void 0 : current.error) === null || _a === void 0 ? void 0 : _a.message}. See https://remotion.dev/docs/media-playback-error for help. Pass an onError() prop to handle the error.`);
            }
            else {
                // If user is handling the error, we don't cause an unhandled exception
                if (onError) {
                    const err = new Error(`The browser threw an error while playing the video ${src}`);
                    onError(err);
                    return;
                }
                throw new Error('The browser threw an error while playing the video');
            }
        };
        current.addEventListener('error', errorHandler, { once: true });
        return () => {
            current.removeEventListener('error', errorHandler);
        };
    }, [onError, src]);
    const currentOnDurationCallback = (0, react_1.useRef)(onDuration);
    currentOnDurationCallback.current = onDuration;
    (0, emit_video_frame_js_1.useEmitVideoFrame)({ ref: videoRef, onVideoFrame });
    (0, react_1.useEffect)(() => {
        var _a;
        const { current } = videoRef;
        if (!current) {
            return;
        }
        if (current.duration) {
            (_a = currentOnDurationCallback.current) === null || _a === void 0 ? void 0 : _a.call(currentOnDurationCallback, src, current.duration);
            return;
        }
        const onLoadedMetadata = () => {
            var _a;
            (_a = currentOnDurationCallback.current) === null || _a === void 0 ? void 0 : _a.call(currentOnDurationCallback, src, current.duration);
        };
        current.addEventListener('loadedmetadata', onLoadedMetadata);
        return () => {
            current.removeEventListener('loadedmetadata', onLoadedMetadata);
        };
    }, [src]);
    (0, react_1.useEffect)(() => {
        const { current } = videoRef;
        if (!current) {
            return;
        }
        // Without this, on iOS Safari, the video cannot be seeked.
        // if a seek is triggered before `loadedmetadata` is fired,
        // the video will not seek, even if `loadedmetadata` is fired afterwards.
        // Also, this needs to happen in a useEffect, because otherwise
        // the SSR props will be applied.
        if ((0, video_fragment_js_1.isIosSafari)()) {
            current.preload = 'metadata';
        }
        else {
            current.preload = 'auto';
        }
    }, []);
    const actualStyle = (0, react_1.useMemo)(() => {
        var _a;
        return {
            ...style,
            opacity: isSequenceHidden ? 0 : ((_a = style === null || style === void 0 ? void 0 : style.opacity) !== null && _a !== void 0 ? _a : 1),
        };
    }, [isSequenceHidden, style]);
    const crossOriginValue = crossOrigin !== null && crossOrigin !== void 0 ? crossOrigin : (onVideoFrame ? 'anonymous' : undefined);
    return ((0, jsx_runtime_1.jsx)("video", { ref: videoRef, muted: muted || mediaMuted, playsInline: true, src: actualSrc, loop: _remotionInternalNativeLoopPassed, style: actualStyle, disableRemotePlayback: true, crossOrigin: crossOriginValue, ...nativeProps }));
};
exports.VideoForPreview = (0, react_1.forwardRef)(VideoForDevelopmentRefForwardingFunction);


/***/ }),

/***/ 8736:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VideoForRendering = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const RenderAssetManager_js_1 = __webpack_require__(599);
const SequenceContext_js_1 = __webpack_require__(3822);
const absolute_src_js_1 = __webpack_require__(9710);
const use_audio_frame_js_1 = __webpack_require__(8783);
const delay_render_js_1 = __webpack_require__(1006);
const get_remotion_environment_js_1 = __webpack_require__(7356);
const is_approximately_the_same_js_1 = __webpack_require__(4773);
const random_js_1 = __webpack_require__(5923);
const timeline_position_state_js_1 = __webpack_require__(8019);
const use_current_frame_js_1 = __webpack_require__(1041);
const use_unsafe_video_config_js_1 = __webpack_require__(3881);
const volume_prop_js_1 = __webpack_require__(4490);
const get_current_time_js_1 = __webpack_require__(8538);
const seek_until_right_js_1 = __webpack_require__(6210);
const VideoForRenderingForwardFunction = ({ onError, volume: volumeProp, allowAmplificationDuringRender, playbackRate, onDuration, toneFrequency, name, acceptableTimeShiftInSeconds, delayRenderRetries, delayRenderTimeoutInMilliseconds, loopVolumeCurveBehavior, ...props }, ref) => {
    const absoluteFrame = (0, timeline_position_state_js_1.useTimelinePosition)();
    const frame = (0, use_current_frame_js_1.useCurrentFrame)();
    const volumePropsFrame = (0, use_audio_frame_js_1.useFrameForVolumeProp)(loopVolumeCurveBehavior !== null && loopVolumeCurveBehavior !== void 0 ? loopVolumeCurveBehavior : 'repeat');
    const videoConfig = (0, use_unsafe_video_config_js_1.useUnsafeVideoConfig)();
    const videoRef = (0, react_1.useRef)(null);
    const sequenceContext = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const mediaStartsAt = (0, use_audio_frame_js_1.useMediaStartsAt)();
    const environment = (0, get_remotion_environment_js_1.getRemotionEnvironment)();
    const { registerRenderAsset, unregisterRenderAsset } = (0, react_1.useContext)(RenderAssetManager_js_1.RenderAssetManager);
    // Generate a string that's as unique as possible for this asset
    // but at the same time the same on all threads
    const id = (0, react_1.useMemo)(() => {
        var _a;
        return `video-${(0, random_js_1.random)((_a = props.src) !== null && _a !== void 0 ? _a : '')}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.cumulatedFrom}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom}-${sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.durationInFrames}`;
    }, [
        props.src,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.cumulatedFrom,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.durationInFrames,
    ]);
    if (!videoConfig) {
        throw new Error('No video config found');
    }
    const volume = (0, volume_prop_js_1.evaluateVolume)({
        volume: volumeProp,
        frame: volumePropsFrame,
        mediaVolume: 1,
        allowAmplificationDuringRender: allowAmplificationDuringRender !== null && allowAmplificationDuringRender !== void 0 ? allowAmplificationDuringRender : false,
    });
    (0, react_1.useEffect)(() => {
        var _a;
        if (!props.src) {
            throw new Error('No src passed');
        }
        if (props.muted) {
            return;
        }
        if (volume <= 0) {
            return;
        }
        if (!window.remotion_audioEnabled) {
            return;
        }
        registerRenderAsset({
            type: 'video',
            src: (0, absolute_src_js_1.getAbsoluteSrc)(props.src),
            id,
            frame: absoluteFrame,
            volume,
            mediaFrame: frame,
            playbackRate: playbackRate !== null && playbackRate !== void 0 ? playbackRate : 1,
            allowAmplificationDuringRender: allowAmplificationDuringRender !== null && allowAmplificationDuringRender !== void 0 ? allowAmplificationDuringRender : false,
            toneFrequency: toneFrequency !== null && toneFrequency !== void 0 ? toneFrequency : null,
            audioStartFrame: Math.max(0, -((_a = sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom) !== null && _a !== void 0 ? _a : 0)),
        });
        return () => unregisterRenderAsset(id);
    }, [
        props.muted,
        props.src,
        registerRenderAsset,
        id,
        unregisterRenderAsset,
        volume,
        frame,
        absoluteFrame,
        playbackRate,
        allowAmplificationDuringRender,
        toneFrequency,
        sequenceContext === null || sequenceContext === void 0 ? void 0 : sequenceContext.relativeFrom,
    ]);
    (0, react_1.useImperativeHandle)(ref, () => {
        return videoRef.current;
    }, []);
    (0, react_1.useEffect)(() => {
        var _a, _b;
        if (!window.remotion_videoEnabled) {
            return;
        }
        const { current } = videoRef;
        if (!current) {
            return;
        }
        const currentTime = (0, get_current_time_js_1.getMediaTime)({
            frame,
            playbackRate: playbackRate || 1,
            startFrom: -mediaStartsAt,
            fps: videoConfig.fps,
        });
        const handle = (0, delay_render_js_1.delayRender)(`Rendering <Video /> with src="${props.src}" at time ${currentTime}`, {
            retries: delayRenderRetries !== null && delayRenderRetries !== void 0 ? delayRenderRetries : undefined,
            timeoutInMilliseconds: delayRenderTimeoutInMilliseconds !== null && delayRenderTimeoutInMilliseconds !== void 0 ? delayRenderTimeoutInMilliseconds : undefined,
        });
        if (((_b = (_a = window.process) === null || _a === void 0 ? void 0 : _a.env) === null || _b === void 0 ? void 0 : _b.NODE_ENV) === 'test') {
            (0, delay_render_js_1.continueRender)(handle);
            return;
        }
        if ((0, is_approximately_the_same_js_1.isApproximatelyTheSame)(current.currentTime, currentTime)) {
            if (current.readyState >= 2) {
                (0, delay_render_js_1.continueRender)(handle);
                return;
            }
            const loadedDataHandler = () => {
                (0, delay_render_js_1.continueRender)(handle);
            };
            current.addEventListener('loadeddata', loadedDataHandler, { once: true });
            return () => {
                current.removeEventListener('loadeddata', loadedDataHandler);
            };
        }
        const endedHandler = () => {
            (0, delay_render_js_1.continueRender)(handle);
        };
        const seek = (0, seek_until_right_js_1.seekToTimeMultipleUntilRight)(current, currentTime, videoConfig.fps);
        seek.prom.then(() => {
            (0, delay_render_js_1.continueRender)(handle);
        });
        current.addEventListener('ended', endedHandler, { once: true });
        const errorHandler = () => {
            var _a;
            if (current === null || current === void 0 ? void 0 : current.error) {
                // eslint-disable-next-line no-console
                console.error('Error occurred in video', current === null || current === void 0 ? void 0 : current.error);
                // If user is handling the error, we don't cause an unhandled exception
                if (onError) {
                    return;
                }
                throw new Error(`The browser threw an error while playing the video ${props.src}: Code ${current.error.code} - ${(_a = current === null || current === void 0 ? void 0 : current.error) === null || _a === void 0 ? void 0 : _a.message}. See https://remotion.dev/docs/media-playback-error for help. Pass an onError() prop to handle the error.`);
            }
            else {
                throw new Error('The browser threw an error');
            }
        };
        current.addEventListener('error', errorHandler, { once: true });
        // If video skips to another frame or unmounts, we clear the created handle
        return () => {
            seek.cancel();
            current.removeEventListener('ended', endedHandler);
            current.removeEventListener('error', errorHandler);
            (0, delay_render_js_1.continueRender)(handle);
        };
    }, [
        volumePropsFrame,
        props.src,
        playbackRate,
        videoConfig.fps,
        frame,
        mediaStartsAt,
        onError,
        delayRenderRetries,
        delayRenderTimeoutInMilliseconds,
    ]);
    const { src } = props;
    // If video source switches, make new handle
    if (environment.isRendering) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        (0, react_1.useLayoutEffect)(() => {
            var _a, _b;
            if (((_b = (_a = window.process) === null || _a === void 0 ? void 0 : _a.env) === null || _b === void 0 ? void 0 : _b.NODE_ENV) === 'test') {
                return;
            }
            const newHandle = (0, delay_render_js_1.delayRender)('Loading <Video> duration with src=' + src, {
                retries: delayRenderRetries !== null && delayRenderRetries !== void 0 ? delayRenderRetries : undefined,
                timeoutInMilliseconds: delayRenderTimeoutInMilliseconds !== null && delayRenderTimeoutInMilliseconds !== void 0 ? delayRenderTimeoutInMilliseconds : undefined,
            });
            const { current } = videoRef;
            const didLoad = () => {
                if (current === null || current === void 0 ? void 0 : current.duration) {
                    onDuration(src, current.duration);
                }
                (0, delay_render_js_1.continueRender)(newHandle);
            };
            if (current === null || current === void 0 ? void 0 : current.duration) {
                onDuration(src, current.duration);
                (0, delay_render_js_1.continueRender)(newHandle);
            }
            else {
                current === null || current === void 0 ? void 0 : current.addEventListener('loadedmetadata', didLoad, { once: true });
            }
            // If tag gets unmounted, clear pending handles because video metadata is not going to load
            return () => {
                current === null || current === void 0 ? void 0 : current.removeEventListener('loadedmetadata', didLoad);
                (0, delay_render_js_1.continueRender)(newHandle);
            };
        }, [src, onDuration, delayRenderRetries, delayRenderTimeoutInMilliseconds]);
    }
    return (0, jsx_runtime_1.jsx)("video", { ref: videoRef, disableRemotePlayback: true, ...props });
};
exports.VideoForRendering = (0, react_1.forwardRef)(VideoForRenderingForwardFunction);


/***/ }),

/***/ 1152:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DurationsContextProvider = exports.DurationsContext = exports.durationReducer = void 0;
const jsx_runtime_1 = __webpack_require__(4848);
const react_1 = __webpack_require__(6540);
const absolute_src_js_1 = __webpack_require__(9710);
const durationReducer = (state, action) => {
    switch (action.type) {
        case 'got-duration': {
            const absoluteSrc = (0, absolute_src_js_1.getAbsoluteSrc)(action.src);
            if (state[absoluteSrc] === action.durationInSeconds) {
                return state;
            }
            return {
                ...state,
                [absoluteSrc]: action.durationInSeconds,
            };
        }
        default:
            return state;
    }
};
exports.durationReducer = durationReducer;
exports.DurationsContext = (0, react_1.createContext)({
    durations: {},
    setDurations: () => {
        throw new Error('context missing');
    },
});
const DurationsContextProvider = ({ children }) => {
    const [durations, setDurations] = (0, react_1.useReducer)(exports.durationReducer, {});
    const value = (0, react_1.useMemo)(() => {
        return {
            durations,
            setDurations,
        };
    }, [durations]);
    return ((0, jsx_runtime_1.jsx)(exports.DurationsContext.Provider, { value: value, children: children }));
};
exports.DurationsContextProvider = DurationsContextProvider;


/***/ }),

/***/ 873:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useEmitVideoFrame = void 0;
const react_1 = __webpack_require__(6540);
const useEmitVideoFrame = ({ ref, onVideoFrame, }) => {
    (0, react_1.useEffect)(() => {
        const { current } = ref;
        if (!current) {
            return;
        }
        if (!onVideoFrame) {
            return;
        }
        let handle = 0;
        const callback = () => {
            if (!ref.current) {
                return;
            }
            onVideoFrame(ref.current);
            handle = ref.current.requestVideoFrameCallback(callback);
        };
        callback();
        return () => {
            current.cancelVideoFrameCallback(handle);
        };
    }, [onVideoFrame, ref]);
};
exports.useEmitVideoFrame = useEmitVideoFrame;


/***/ }),

/***/ 8538:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// Calculate the `.currentTime` of a video or audio element
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMediaTime = exports.getExpectedMediaFrameUncorrected = void 0;
const interpolate_js_1 = __webpack_require__(1993);
const getExpectedMediaFrameUncorrected = ({ frame, playbackRate, startFrom, }) => {
    return (0, interpolate_js_1.interpolate)(frame, [-1, startFrom, startFrom + 1], [-1, startFrom, startFrom + playbackRate]);
};
exports.getExpectedMediaFrameUncorrected = getExpectedMediaFrameUncorrected;
const getMediaTime = ({ fps, frame, playbackRate, startFrom, }) => {
    const expectedFrame = (0, exports.getExpectedMediaFrameUncorrected)({
        frame,
        playbackRate,
        startFrom,
    });
    const msPerFrame = 1000 / fps;
    return (expectedFrame * msPerFrame) / 1000;
};
exports.getMediaTime = getMediaTime;


/***/ }),

/***/ 1506:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Video = exports.OffthreadVideo = void 0;
var OffthreadVideo_js_1 = __webpack_require__(4472);
Object.defineProperty(exports, "OffthreadVideo", ({ enumerable: true, get: function () { return OffthreadVideo_js_1.OffthreadVideo; } }));
var Video_js_1 = __webpack_require__(4657);
Object.defineProperty(exports, "Video", ({ enumerable: true, get: function () { return Video_js_1.Video; } }));


/***/ }),

/***/ 3935:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOffthreadVideoSource = void 0;
const absolute_src_1 = __webpack_require__(9710);
const getOffthreadVideoSource = ({ src, transparent, currentTime, toneMapped, }) => {
    return `http://localhost:${window.remotion_proxyPort}/proxy?src=${encodeURIComponent((0, absolute_src_1.getAbsoluteSrc)(src))}&time=${encodeURIComponent(currentTime)}&transparent=${String(transparent)}&toneMapped=${String(toneMapped)}`;
};
exports.getOffthreadVideoSource = getOffthreadVideoSource;


/***/ }),

/***/ 6210:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.seekToTimeMultipleUntilRight = exports.seekToTime = void 0;
const is_approximately_the_same_1 = __webpack_require__(4773);
const roundTo6Commas = (num) => {
    return Math.round(num * 100000) / 100000;
};
const seekToTime = (element, desiredTime) => {
    if ((0, is_approximately_the_same_1.isApproximatelyTheSame)(element.currentTime, desiredTime)) {
        return {
            wait: Promise.resolve(desiredTime),
            cancel: () => { },
        };
    }
    element.currentTime = desiredTime;
    let cancel;
    let cancelSeeked = null;
    const prom = new Promise((resolve) => {
        cancel = element.requestVideoFrameCallback((now, metadata) => {
            const displayIn = metadata.expectedDisplayTime - now;
            if (displayIn <= 0) {
                resolve(metadata.mediaTime);
                return;
            }
            setTimeout(() => {
                resolve(metadata.mediaTime);
            }, displayIn + 150);
        });
    });
    const waitForSeekedEvent = new Promise((resolve) => {
        const onDone = () => {
            resolve();
        };
        element.addEventListener('seeked', onDone, {
            once: true,
        });
        cancelSeeked = () => {
            element.removeEventListener('seeked', onDone);
        };
    });
    return {
        wait: Promise.all([prom, waitForSeekedEvent]).then(([time]) => time),
        cancel: () => {
            cancelSeeked === null || cancelSeeked === void 0 ? void 0 : cancelSeeked();
            element.cancelVideoFrameCallback(cancel);
        },
    };
};
exports.seekToTime = seekToTime;
const seekToTimeMultipleUntilRight = (element, desiredTime, fps) => {
    const threshold = 1 / fps / 2;
    let currentCancel = () => undefined;
    if (Number.isFinite(element.duration) &&
        element.currentTime >= element.duration &&
        desiredTime >= element.duration) {
        return {
            prom: Promise.resolve(),
            cancel: () => { },
        };
    }
    const prom = new Promise((resolve, reject) => {
        const firstSeek = (0, exports.seekToTime)(element, desiredTime + threshold);
        firstSeek.wait.then((seekedTo) => {
            const difference = Math.abs(desiredTime - seekedTo);
            if (difference <= threshold) {
                return resolve();
            }
            const sign = desiredTime > seekedTo ? 1 : -1;
            const newSeek = (0, exports.seekToTime)(element, seekedTo + threshold * sign);
            currentCancel = newSeek.cancel;
            newSeek.wait
                .then((newTime) => {
                const newDifference = Math.abs(desiredTime - newTime);
                if (roundTo6Commas(newDifference) <= roundTo6Commas(threshold)) {
                    return resolve();
                }
                const thirdSeek = (0, exports.seekToTime)(element, desiredTime + threshold);
                currentCancel = thirdSeek.cancel;
                return thirdSeek.wait
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    reject(err);
                });
            })
                .catch((err) => {
                reject(err);
            });
        });
        currentCancel = firstSeek.cancel;
    });
    return {
        prom,
        cancel: () => {
            currentCancel();
        },
    };
};
exports.seekToTimeMultipleUntilRight = seekToTimeMultipleUntilRight;


/***/ }),

/***/ 6658:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useAppendVideoFragment = exports.appendVideoFragment = exports.isIosSafari = void 0;
const react_1 = __webpack_require__(6540);
const toSeconds = (time, fps) => {
    return Math.round((time / fps) * 100) / 100;
};
const isIosSafari = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    const isIpadIPodIPhone = /iP(ad|od|hone)/i.test(window.navigator.userAgent);
    const isAppleWebKit = /AppleWebKit/.test(window.navigator.userAgent);
    return isIpadIPodIPhone && isAppleWebKit;
};
exports.isIosSafari = isIosSafari;
// https://github.com/remotion-dev/remotion/issues/1655
const isIOSSafariAndBlob = (actualSrc) => {
    return (0, exports.isIosSafari)() && actualSrc.startsWith('blob:');
};
const getVideoFragmentStart = ({ actualFrom, fps, }) => {
    return toSeconds(Math.max(0, -actualFrom), fps);
};
const getVideoFragmentEnd = ({ duration, fps, }) => {
    return toSeconds(duration, fps);
};
const appendVideoFragment = ({ actualSrc, actualFrom, duration, fps, }) => {
    var _a;
    if (isIOSSafariAndBlob(actualSrc)) {
        return actualSrc;
    }
    if (actualSrc.startsWith('data:')) {
        return actualSrc;
    }
    const existingHash = Boolean(new URL(actualSrc, (_a = (typeof window === 'undefined' ? null : window.location.href)) !== null && _a !== void 0 ? _a : 'http://localhost:3000').hash);
    if (existingHash) {
        return actualSrc;
    }
    if (!Number.isFinite(actualFrom)) {
        return actualSrc;
    }
    const withStartHash = `${actualSrc}#t=${getVideoFragmentStart({ actualFrom, fps })}`;
    if (!Number.isFinite(duration)) {
        return withStartHash;
    }
    return `${withStartHash},${getVideoFragmentEnd({ duration, fps })}`;
};
exports.appendVideoFragment = appendVideoFragment;
const isSubsetOfDuration = ({ prevStartFrom, newStartFrom, prevDuration, newDuration, fps, }) => {
    const previousFrom = getVideoFragmentStart({ actualFrom: prevStartFrom, fps });
    const newFrom = getVideoFragmentStart({ actualFrom: newStartFrom, fps });
    const previousEnd = getVideoFragmentEnd({ duration: prevDuration, fps });
    const newEnd = getVideoFragmentEnd({ duration: newDuration, fps });
    if (newFrom < previousFrom) {
        return false;
    }
    if (newEnd > previousEnd) {
        return false;
    }
    return true;
};
const useAppendVideoFragment = ({ actualSrc: initialActualSrc, actualFrom: initialActualFrom, duration: initialDuration, fps, }) => {
    const actualFromRef = (0, react_1.useRef)(initialActualFrom);
    const actualDuration = (0, react_1.useRef)(initialDuration);
    const actualSrc = (0, react_1.useRef)(initialActualSrc);
    if (!isSubsetOfDuration({
        prevStartFrom: actualFromRef.current,
        newStartFrom: initialActualFrom,
        prevDuration: actualDuration.current,
        newDuration: initialDuration,
        fps,
    }) ||
        initialActualSrc !== actualSrc.current) {
        actualFromRef.current = initialActualFrom;
        actualDuration.current = initialDuration;
        actualSrc.current = initialActualSrc;
    }
    const appended = (0, exports.appendVideoFragment)({
        actualSrc: actualSrc.current,
        actualFrom: actualFromRef.current,
        duration: actualDuration.current,
        fps,
    });
    return appended;
};
exports.useAppendVideoFragment = useAppendVideoFragment;


/***/ }),

/***/ 8068:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.useMediaMutedState = exports.useMediaVolumeState = exports.SetMediaVolumeContext = exports.MediaVolumeContext = void 0;
const react_1 = __webpack_require__(6540);
exports.MediaVolumeContext = (0, react_1.createContext)({
    mediaMuted: false,
    mediaVolume: 1,
});
exports.SetMediaVolumeContext = (0, react_1.createContext)({
    setMediaMuted: () => {
        throw new Error('default');
    },
    setMediaVolume: () => {
        throw new Error('default');
    },
});
const useMediaVolumeState = () => {
    const { mediaVolume } = (0, react_1.useContext)(exports.MediaVolumeContext);
    const { setMediaVolume } = (0, react_1.useContext)(exports.SetMediaVolumeContext);
    return (0, react_1.useMemo)(() => {
        return [mediaVolume, setMediaVolume];
    }, [mediaVolume, setMediaVolume]);
};
exports.useMediaVolumeState = useMediaVolumeState;
const useMediaMutedState = () => {
    const { mediaMuted } = (0, react_1.useContext)(exports.MediaVolumeContext);
    const { setMediaMuted } = (0, react_1.useContext)(exports.SetMediaVolumeContext);
    return (0, react_1.useMemo)(() => {
        return [mediaMuted, setMediaMuted];
    }, [mediaMuted, setMediaMuted]);
};
exports.useMediaMutedState = useMediaMutedState;


/***/ }),

/***/ 4490:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.evaluateVolume = void 0;
const evaluateVolume = ({ frame, volume, mediaVolume = 1, allowAmplificationDuringRender, }) => {
    const maxVolume = allowAmplificationDuringRender ? Infinity : 1;
    if (typeof volume === 'number') {
        return Math.min(maxVolume, volume * mediaVolume);
    }
    if (typeof volume === 'undefined') {
        return Number(mediaVolume);
    }
    const evaluated = volume(frame) * mediaVolume;
    if (typeof evaluated !== 'number') {
        throw new TypeError(`You passed in a a function to the volume prop but it did not return a number but a value of type ${typeof evaluated} for frame ${frame}`);
    }
    if (Number.isNaN(evaluated)) {
        throw new TypeError(`You passed in a function to the volume prop but it returned NaN for frame ${frame}.`);
    }
    if (!Number.isFinite(evaluated)) {
        throw new TypeError(`You passed in a function to the volume prop but it returned a non-finite number for frame ${frame}.`);
    }
    return Math.max(0, Math.min(maxVolume, evaluated));
};
exports.evaluateVolume = evaluateVolume;


/***/ }),

/***/ 1650:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.warnAboutNonSeekableMedia = void 0;
const alreadyWarned = {};
const warnAboutNonSeekableMedia = (ref, type) => {
    // Media is not loaded yet, but this does not yet mean something is wrong with the media
    if (ref === null) {
        return;
    }
    if (ref.seekable.length === 0) {
        return;
    }
    if (ref.seekable.length > 1) {
        return;
    }
    if (alreadyWarned[ref.src]) {
        return;
    }
    const range = { start: ref.seekable.start(0), end: ref.seekable.end(0) };
    if (range.start === 0 && range.end === 0) {
        const msg = [
            `The media ${ref.src} cannot be seeked. This could be one of few reasons:`,
            '1) The media resource was replaced while the video is playing but it was not loaded yet.',
            '2) The media does not support seeking.',
            '3) The media was loaded with security headers prventing it from being included.',
            'Please see https://remotion.dev/docs/non-seekable-media for assistance.',
        ].join('\n');
        if (type === 'console-error') {
            // eslint-disable-next-line no-console
            console.error(msg);
        }
        else if (type === 'console-warning') {
            // eslint-disable-next-line no-console
            console.warn(`The media ${ref.src} does not support seeking. The video will render fine, but may not play correctly in the Remotion Studio and in the <Player>. See https://remotion.dev/docs/non-seekable-media for an explanation.`);
        }
        else {
            throw new Error(msg);
        }
        alreadyWarned[ref.src] = true;
    }
};
exports.warnAboutNonSeekableMedia = warnAboutNonSeekableMedia;


/***/ }),

/***/ 3563:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.watchStaticFile = exports.WATCH_REMOTION_STATIC_FILES = void 0;
const get_remotion_environment_1 = __webpack_require__(7356);
const v5_flag_1 = __webpack_require__(8232);
exports.WATCH_REMOTION_STATIC_FILES = 'remotion_staticFilesChanged';
/**
 * @description Watch for changes in a specific static file.
 * @param {string} fileName - The name of the static file to watch for changes.
 * @param {WatcherCallback} callback - A callback function to be called when the file changes.
 * @returns {{cancel: () => void}} A function that can be used to cancel the event listener.
 * @see [Documentation](https://www.remotion.dev/docs/watchstaticfile)
 */
const watchStaticFile = (fileName, callback) => {
    if (v5_flag_1.ENABLE_V5_BREAKING_CHANGES) {
        throw new Error('watchStaticFile() has moved into the `@remotion/studio` package. Update your imports.');
    }
    // Check if function is called in Remotion Studio
    if (!(0, get_remotion_environment_1.getRemotionEnvironment)().isStudio) {
        // eslint-disable-next-line no-console
        console.warn('The API is only available while using the Remotion Studio.');
        return { cancel: () => undefined };
    }
    const withoutStaticBase = fileName.startsWith(window.remotion_staticBase)
        ? fileName.replace(window.remotion_staticBase, '')
        : fileName;
    const withoutLeadingSlash = withoutStaticBase.startsWith('/')
        ? withoutStaticBase.slice(1)
        : withoutStaticBase;
    let prevFileData = window.remotion_staticFiles.find((file) => file.name === withoutLeadingSlash);
    // Check if the specified static file has updated or deleted
    const checkFile = (event) => {
        const staticFiles = event.detail.files;
        // Check for user specified file
        const newFileData = staticFiles.find((file) => file.name === withoutLeadingSlash);
        if (!newFileData) {
            // File is deleted
            if (prevFileData !== undefined) {
                callback(null);
            }
            prevFileData = undefined;
            return;
        }
        if (prevFileData === undefined ||
            prevFileData.lastModified !== newFileData.lastModified) {
            callback(newFileData); // File is added or modified
            prevFileData = newFileData;
        }
    };
    window.addEventListener(exports.WATCH_REMOTION_STATIC_FILES, checkFile);
    const cancel = () => {
        return window.removeEventListener(exports.WATCH_REMOTION_STATIC_FILES, checkFile);
    };
    return { cancel };
};
exports.watchStaticFile = watchStaticFile;


/***/ }),

/***/ 8024:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RemotionContextProvider = void 0;
exports.useRemotionContexts = useRemotionContexts;
const jsx_runtime_1 = __webpack_require__(4848);
// This is used for when other reconcilers are being used
// such as in React Three Fiber. All the contexts need to be passed again
// for them to be useable
const react_1 = __importStar(__webpack_require__(6540));
const CanUseRemotionHooks_js_1 = __webpack_require__(5108);
const CompositionManagerContext_js_1 = __webpack_require__(9126);
const RenderAssetManager_js_1 = __webpack_require__(599);
const ResolveCompositionConfig_js_1 = __webpack_require__(7240);
const SequenceContext_js_1 = __webpack_require__(3822);
const SequenceManager_js_1 = __webpack_require__(9962);
const buffering_js_1 = __webpack_require__(9076);
const nonce_js_1 = __webpack_require__(2501);
const prefetch_state_js_1 = __webpack_require__(2171);
const timeline_position_state_js_1 = __webpack_require__(8019);
function useRemotionContexts() {
    const compositionManagerCtx = react_1.default.useContext(CompositionManagerContext_js_1.CompositionManager);
    const timelineContext = react_1.default.useContext(timeline_position_state_js_1.TimelineContext);
    const setTimelineContext = react_1.default.useContext(timeline_position_state_js_1.SetTimelineContext);
    const sequenceContext = react_1.default.useContext(SequenceContext_js_1.SequenceContext);
    const nonceContext = react_1.default.useContext(nonce_js_1.NonceContext);
    const canUseRemotionHooksContext = react_1.default.useContext(CanUseRemotionHooks_js_1.CanUseRemotionHooks);
    const preloadContext = react_1.default.useContext(prefetch_state_js_1.PreloadContext);
    const resolveCompositionContext = react_1.default.useContext(ResolveCompositionConfig_js_1.ResolveCompositionContext);
    const renderAssetManagerContext = react_1.default.useContext(RenderAssetManager_js_1.RenderAssetManager);
    const sequenceManagerContext = react_1.default.useContext(SequenceManager_js_1.SequenceManager);
    const bufferManagerContext = react_1.default.useContext(buffering_js_1.BufferingContextReact);
    return (0, react_1.useMemo)(() => ({
        compositionManagerCtx,
        timelineContext,
        setTimelineContext,
        sequenceContext,
        nonceContext,
        canUseRemotionHooksContext,
        preloadContext,
        resolveCompositionContext,
        renderAssetManagerContext,
        sequenceManagerContext,
        bufferManagerContext,
    }), [
        compositionManagerCtx,
        nonceContext,
        sequenceContext,
        setTimelineContext,
        timelineContext,
        canUseRemotionHooksContext,
        preloadContext,
        resolveCompositionContext,
        renderAssetManagerContext,
        sequenceManagerContext,
        bufferManagerContext,
    ]);
}
const RemotionContextProvider = (props) => {
    const { children, contexts } = props;
    return ((0, jsx_runtime_1.jsx)(CanUseRemotionHooks_js_1.CanUseRemotionHooks.Provider, { value: contexts.canUseRemotionHooksContext, children: (0, jsx_runtime_1.jsx)(nonce_js_1.NonceContext.Provider, { value: contexts.nonceContext, children: (0, jsx_runtime_1.jsx)(prefetch_state_js_1.PreloadContext.Provider, { value: contexts.preloadContext, children: (0, jsx_runtime_1.jsx)(CompositionManagerContext_js_1.CompositionManager.Provider, { value: contexts.compositionManagerCtx, children: (0, jsx_runtime_1.jsx)(SequenceManager_js_1.SequenceManager.Provider, { value: contexts.sequenceManagerContext, children: (0, jsx_runtime_1.jsx)(RenderAssetManager_js_1.RenderAssetManager.Provider, { value: contexts.renderAssetManagerContext, children: (0, jsx_runtime_1.jsx)(ResolveCompositionConfig_js_1.ResolveCompositionContext.Provider, { value: contexts.resolveCompositionContext, children: (0, jsx_runtime_1.jsx)(timeline_position_state_js_1.TimelineContext.Provider, { value: contexts.timelineContext, children: (0, jsx_runtime_1.jsx)(timeline_position_state_js_1.SetTimelineContext.Provider, { value: contexts.setTimelineContext, children: (0, jsx_runtime_1.jsx)(SequenceContext_js_1.SequenceContext.Provider, { value: contexts.sequenceContext, children: (0, jsx_runtime_1.jsx)(buffering_js_1.BufferingContextReact.Provider, { value: contexts.bufferManagerContext, children: children }) }) }) }) }) }) }) }) }) }) }));
};
exports.RemotionContextProvider = RemotionContextProvider;


/***/ }),

/***/ 7463:
/***/ ((__unused_webpack_module, exports) => {

/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function f(a,b){var c=a.length;a.push(b);a:for(;0<c;){var d=c-1>>>1,e=a[d];if(0<g(e,b))a[d]=b,a[c]=e,c=d;else break a}}function h(a){return 0===a.length?null:a[0]}function k(a){if(0===a.length)return null;var b=a[0],c=a.pop();if(c!==b){a[0]=c;a:for(var d=0,e=a.length,w=e>>>1;d<w;){var m=2*(d+1)-1,C=a[m],n=m+1,x=a[n];if(0>g(C,c))n<e&&0>g(x,C)?(a[d]=x,a[n]=c,d=n):(a[d]=C,a[m]=c,d=m);else if(n<e&&0>g(x,c))a[d]=x,a[n]=c,d=n;else break a}}return b}
function g(a,b){var c=a.sortIndex-b.sortIndex;return 0!==c?c:a.id-b.id}if("object"===typeof performance&&"function"===typeof performance.now){var l=performance;exports.unstable_now=function(){return l.now()}}else{var p=Date,q=p.now();exports.unstable_now=function(){return p.now()-q}}var r=[],t=[],u=1,v=null,y=3,z=!1,A=!1,B=!1,D="function"===typeof setTimeout?setTimeout:null,E="function"===typeof clearTimeout?clearTimeout:null,F="undefined"!==typeof setImmediate?setImmediate:null;
"undefined"!==typeof navigator&&void 0!==navigator.scheduling&&void 0!==navigator.scheduling.isInputPending&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function G(a){for(var b=h(t);null!==b;){if(null===b.callback)k(t);else if(b.startTime<=a)k(t),b.sortIndex=b.expirationTime,f(r,b);else break;b=h(t)}}function H(a){B=!1;G(a);if(!A)if(null!==h(r))A=!0,I(J);else{var b=h(t);null!==b&&K(H,b.startTime-a)}}
function J(a,b){A=!1;B&&(B=!1,E(L),L=-1);z=!0;var c=y;try{G(b);for(v=h(r);null!==v&&(!(v.expirationTime>b)||a&&!M());){var d=v.callback;if("function"===typeof d){v.callback=null;y=v.priorityLevel;var e=d(v.expirationTime<=b);b=exports.unstable_now();"function"===typeof e?v.callback=e:v===h(r)&&k(r);G(b)}else k(r);v=h(r)}if(null!==v)var w=!0;else{var m=h(t);null!==m&&K(H,m.startTime-b);w=!1}return w}finally{v=null,y=c,z=!1}}var N=!1,O=null,L=-1,P=5,Q=-1;
function M(){return exports.unstable_now()-Q<P?!1:!0}function R(){if(null!==O){var a=exports.unstable_now();Q=a;var b=!0;try{b=O(!0,a)}finally{b?S():(N=!1,O=null)}}else N=!1}var S;if("function"===typeof F)S=function(){F(R)};else if("undefined"!==typeof MessageChannel){var T=new MessageChannel,U=T.port2;T.port1.onmessage=R;S=function(){U.postMessage(null)}}else S=function(){D(R,0)};function I(a){O=a;N||(N=!0,S())}function K(a,b){L=D(function(){a(exports.unstable_now())},b)}
exports.unstable_IdlePriority=5;exports.unstable_ImmediatePriority=1;exports.unstable_LowPriority=4;exports.unstable_NormalPriority=3;exports.unstable_Profiling=null;exports.unstable_UserBlockingPriority=2;exports.unstable_cancelCallback=function(a){a.callback=null};exports.unstable_continueExecution=function(){A||z||(A=!0,I(J))};
exports.unstable_forceFrameRate=function(a){0>a||125<a?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):P=0<a?Math.floor(1E3/a):5};exports.unstable_getCurrentPriorityLevel=function(){return y};exports.unstable_getFirstCallbackNode=function(){return h(r)};exports.unstable_next=function(a){switch(y){case 1:case 2:case 3:var b=3;break;default:b=y}var c=y;y=b;try{return a()}finally{y=c}};exports.unstable_pauseExecution=function(){};
exports.unstable_requestPaint=function(){};exports.unstable_runWithPriority=function(a,b){switch(a){case 1:case 2:case 3:case 4:case 5:break;default:a=3}var c=y;y=a;try{return b()}finally{y=c}};
exports.unstable_scheduleCallback=function(a,b,c){var d=exports.unstable_now();"object"===typeof c&&null!==c?(c=c.delay,c="number"===typeof c&&0<c?d+c:d):c=d;switch(a){case 1:var e=-1;break;case 2:e=250;break;case 5:e=1073741823;break;case 4:e=1E4;break;default:e=5E3}e=c+e;a={id:u++,callback:b,priorityLevel:a,startTime:c,expirationTime:e,sortIndex:-1};c>d?(a.sortIndex=c,f(t,a),null===h(r)&&a===h(t)&&(B?(E(L),L=-1):B=!0,K(H,c-d))):(a.sortIndex=e,f(r,a),A||z||(A=!0,I(J)));return a};
exports.unstable_shouldYield=M;exports.unstable_wrapCallback=function(a){var b=y;return function(){var c=y;y=b;try{return a.apply(this,arguments)}finally{y=c}}};


/***/ }),

/***/ 9982:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (true) {
  module.exports = __webpack_require__(7463);
} else {}


/***/ }),

/***/ 5616:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   G: () => (/* binding */ ZodError),
/* harmony export */   WI: () => (/* binding */ quotelessJson),
/* harmony export */   eq: () => (/* binding */ ZodIssueCode)
/* harmony export */ });
/* harmony import */ var _helpers_util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9115);

const ZodIssueCode = _helpers_util_js__WEBPACK_IMPORTED_MODULE_0__/* .util */ .ZS.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite",
]);
const quotelessJson = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
};
class ZodError extends Error {
    get errors() {
        return this.issues;
    }
    constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
            this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
            this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            // eslint-disable-next-line ban/ban
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
    }
    format(_mapper) {
        const mapper = _mapper ||
            function (issue) {
                return issue.message;
            };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
            for (const issue of error.issues) {
                if (issue.code === "invalid_union") {
                    issue.unionErrors.map(processError);
                }
                else if (issue.code === "invalid_return_type") {
                    processError(issue.returnTypeError);
                }
                else if (issue.code === "invalid_arguments") {
                    processError(issue.argumentsError);
                }
                else if (issue.path.length === 0) {
                    fieldErrors._errors.push(mapper(issue));
                }
                else {
                    let curr = fieldErrors;
                    let i = 0;
                    while (i < issue.path.length) {
                        const el = issue.path[i];
                        const terminal = i === issue.path.length - 1;
                        if (!terminal) {
                            curr[el] = curr[el] || { _errors: [] };
                            // if (typeof el === "string") {
                            //   curr[el] = curr[el] || { _errors: [] };
                            // } else if (typeof el === "number") {
                            //   const errorArray: any = [];
                            //   errorArray._errors = [];
                            //   curr[el] = curr[el] || errorArray;
                            // }
                        }
                        else {
                            curr[el] = curr[el] || { _errors: [] };
                            curr[el]._errors.push(mapper(issue));
                        }
                        curr = curr[el];
                        i++;
                    }
                }
            }
        };
        processError(this);
        return fieldErrors;
    }
    static assert(value) {
        if (!(value instanceof ZodError)) {
            throw new Error(`Not a ZodError: ${value}`);
        }
    }
    toString() {
        return this.message;
    }
    get message() {
        return JSON.stringify(this.issues, _helpers_util_js__WEBPACK_IMPORTED_MODULE_0__/* .util */ .ZS.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
        return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
            if (sub.path.length > 0) {
                const firstEl = sub.path[0];
                fieldErrors[firstEl] = fieldErrors[firstEl] || [];
                fieldErrors[firstEl].push(mapper(sub));
            }
            else {
                formErrors.push(mapper(sub));
            }
        }
        return { formErrors, fieldErrors };
    }
    get formErrors() {
        return this.flatten();
    }
}
ZodError.create = (issues) => {
    const error = new ZodError(issues);
    return error;
};


/***/ }),

/***/ 7958:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $W: () => (/* binding */ getErrorMap),
/* harmony export */   pJ: () => (/* binding */ setErrorMap),
/* harmony export */   su: () => (/* reexport safe */ _locales_en_js__WEBPACK_IMPORTED_MODULE_0__.A)
/* harmony export */ });
/* harmony import */ var _locales_en_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(342);

let overrideErrorMap = _locales_en_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .A;

function setErrorMap(map) {
    overrideErrorMap = map;
}
function getErrorMap() {
    return overrideErrorMap;
}


/***/ }),

/***/ 4104:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DM: () => (/* binding */ isDirty),
/* harmony export */   G4: () => (/* binding */ isAborted),
/* harmony export */   I3: () => (/* binding */ EMPTY_PATH),
/* harmony export */   MY: () => (/* binding */ ParseStatus),
/* harmony export */   OK: () => (/* binding */ OK),
/* harmony export */   fn: () => (/* binding */ isValid),
/* harmony export */   jm: () => (/* binding */ DIRTY),
/* harmony export */   uY: () => (/* binding */ INVALID),
/* harmony export */   xP: () => (/* binding */ isAsync),
/* harmony export */   y7: () => (/* binding */ makeIssue),
/* harmony export */   zn: () => (/* binding */ addIssueToContext)
/* harmony export */ });
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7958);
/* harmony import */ var _locales_en_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(342);


const makeIssue = (params) => {
    const { data, path, errorMaps, issueData } = params;
    const fullPath = [...path, ...(issueData.path || [])];
    const fullIssue = {
        ...issueData,
        path: fullPath,
    };
    if (issueData.message !== undefined) {
        return {
            ...issueData,
            path: fullPath,
            message: issueData.message,
        };
    }
    let errorMessage = "";
    const maps = errorMaps
        .filter((m) => !!m)
        .slice()
        .reverse();
    for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
    }
    return {
        ...issueData,
        path: fullPath,
        message: errorMessage,
    };
};
const EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
    const overrideMap = (0,_errors_js__WEBPACK_IMPORTED_MODULE_0__/* .getErrorMap */ .$W)();
    const issue = makeIssue({
        issueData: issueData,
        data: ctx.data,
        path: ctx.path,
        errorMaps: [
            ctx.common.contextualErrorMap, // contextual error map is first priority
            ctx.schemaErrorMap, // then schema-bound map if available
            overrideMap, // then global override map
            overrideMap === _locales_en_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .A ? undefined : _locales_en_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .A, // then global default map
        ].filter((x) => !!x),
    });
    ctx.common.issues.push(issue);
}
class ParseStatus {
    constructor() {
        this.value = "valid";
    }
    dirty() {
        if (this.value === "valid")
            this.value = "dirty";
    }
    abort() {
        if (this.value !== "aborted")
            this.value = "aborted";
    }
    static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
            if (s.status === "aborted")
                return INVALID;
            if (s.status === "dirty")
                status.dirty();
            arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
    }
    static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            syncPairs.push({
                key,
                value,
            });
        }
        return ParseStatus.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
            const { key, value } = pair;
            if (key.status === "aborted")
                return INVALID;
            if (value.status === "aborted")
                return INVALID;
            if (key.status === "dirty")
                status.dirty();
            if (value.status === "dirty")
                status.dirty();
            if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
                finalObject[key.value] = value.value;
            }
        }
        return { status: status.value, value: finalObject };
    }
}
const INVALID = Object.freeze({
    status: "aborted",
});
const DIRTY = (value) => ({ status: "dirty", value });
const OK = (value) => ({ status: "valid", value });
const isAborted = (x) => x.status === "aborted";
const isDirty = (x) => x.status === "dirty";
const isValid = (x) => x.status === "valid";
const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;


/***/ }),

/***/ 9115:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CR: () => (/* binding */ getParsedType),
/* harmony export */   ZS: () => (/* binding */ util),
/* harmony export */   Zp: () => (/* binding */ ZodParsedType),
/* harmony export */   o6: () => (/* binding */ objectUtil)
/* harmony export */ });
var util;
(function (util) {
    util.assertEqual = (_) => { };
    function assertIs(_arg) { }
    util.assertIs = assertIs;
    function assertNever(_x) {
        throw new Error();
    }
    util.assertNever = assertNever;
    util.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
            obj[item] = item;
        }
        return obj;
    };
    util.getValidEnumValues = (obj) => {
        const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
            filtered[k] = obj[k];
        }
        return util.objectValues(filtered);
    };
    util.objectValues = (obj) => {
        return util.objectKeys(obj).map(function (e) {
            return obj[e];
        });
    };
    util.objectKeys = typeof Object.keys === "function" // eslint-disable-line ban/ban
        ? (obj) => Object.keys(obj) // eslint-disable-line ban/ban
        : (object) => {
            const keys = [];
            for (const key in object) {
                if (Object.prototype.hasOwnProperty.call(object, key)) {
                    keys.push(key);
                }
            }
            return keys;
        };
    util.find = (arr, checker) => {
        for (const item of arr) {
            if (checker(item))
                return item;
        }
        return undefined;
    };
    util.isInteger = typeof Number.isInteger === "function"
        ? (val) => Number.isInteger(val) // eslint-disable-line ban/ban
        : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
        return array.map((val) => (typeof val === "string" ? `'${val}'` : val)).join(separator);
    }
    util.joinValues = joinValues;
    util.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
            return value.toString();
        }
        return value;
    };
})(util || (util = {}));
var objectUtil;
(function (objectUtil) {
    objectUtil.mergeShapes = (first, second) => {
        return {
            ...first,
            ...second, // second overwrites first
        };
    };
})(objectUtil || (objectUtil = {}));
const ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set",
]);
const getParsedType = (data) => {
    const t = typeof data;
    switch (t) {
        case "undefined":
            return ZodParsedType.undefined;
        case "string":
            return ZodParsedType.string;
        case "number":
            return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
            return ZodParsedType.boolean;
        case "function":
            return ZodParsedType.function;
        case "bigint":
            return ZodParsedType.bigint;
        case "symbol":
            return ZodParsedType.symbol;
        case "object":
            if (Array.isArray(data)) {
                return ZodParsedType.array;
            }
            if (data === null) {
                return ZodParsedType.null;
            }
            if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
                return ZodParsedType.promise;
            }
            if (typeof Map !== "undefined" && data instanceof Map) {
                return ZodParsedType.map;
            }
            if (typeof Set !== "undefined" && data instanceof Set) {
                return ZodParsedType.set;
            }
            if (typeof Date !== "undefined" && data instanceof Date) {
                return ZodParsedType.date;
            }
            return ZodParsedType.object;
        default:
            return ZodParsedType.unknown;
    }
};


/***/ }),

/***/ 342:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _ZodError_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5616);
/* harmony import */ var _helpers_util_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9115);


const errorMap = (issue, _ctx) => {
    let message;
    switch (issue.code) {
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.invalid_type:
            if (issue.received === _helpers_util_js__WEBPACK_IMPORTED_MODULE_1__/* .ZodParsedType */ .Zp.undefined) {
                message = "Required";
            }
            else {
                message = `Expected ${issue.expected}, received ${issue.received}`;
            }
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.invalid_literal:
            message = `Invalid literal value, expected ${JSON.stringify(issue.expected, _helpers_util_js__WEBPACK_IMPORTED_MODULE_1__/* .util */ .ZS.jsonStringifyReplacer)}`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.unrecognized_keys:
            message = `Unrecognized key(s) in object: ${_helpers_util_js__WEBPACK_IMPORTED_MODULE_1__/* .util */ .ZS.joinValues(issue.keys, ", ")}`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.invalid_union:
            message = `Invalid input`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.invalid_union_discriminator:
            message = `Invalid discriminator value. Expected ${_helpers_util_js__WEBPACK_IMPORTED_MODULE_1__/* .util */ .ZS.joinValues(issue.options)}`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.invalid_enum_value:
            message = `Invalid enum value. Expected ${_helpers_util_js__WEBPACK_IMPORTED_MODULE_1__/* .util */ .ZS.joinValues(issue.options)}, received '${issue.received}'`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.invalid_arguments:
            message = `Invalid function arguments`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.invalid_return_type:
            message = `Invalid function return type`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.invalid_date:
            message = `Invalid date`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.invalid_string:
            if (typeof issue.validation === "object") {
                if ("includes" in issue.validation) {
                    message = `Invalid input: must include "${issue.validation.includes}"`;
                    if (typeof issue.validation.position === "number") {
                        message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
                    }
                }
                else if ("startsWith" in issue.validation) {
                    message = `Invalid input: must start with "${issue.validation.startsWith}"`;
                }
                else if ("endsWith" in issue.validation) {
                    message = `Invalid input: must end with "${issue.validation.endsWith}"`;
                }
                else {
                    _helpers_util_js__WEBPACK_IMPORTED_MODULE_1__/* .util */ .ZS.assertNever(issue.validation);
                }
            }
            else if (issue.validation !== "regex") {
                message = `Invalid ${issue.validation}`;
            }
            else {
                message = "Invalid";
            }
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.too_small:
            if (issue.type === "array")
                message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
            else if (issue.type === "string")
                message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
            else if (issue.type === "number")
                message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
            else if (issue.type === "bigint")
                message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
            else if (issue.type === "date")
                message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
            else
                message = "Invalid input";
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.too_big:
            if (issue.type === "array")
                message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
            else if (issue.type === "string")
                message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
            else if (issue.type === "number")
                message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
            else if (issue.type === "bigint")
                message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
            else if (issue.type === "date")
                message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
            else
                message = "Invalid input";
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.custom:
            message = `Invalid input`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.invalid_intersection_types:
            message = `Intersection results could not be merged`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.not_multiple_of:
            message = `Number must be a multiple of ${issue.multipleOf}`;
            break;
        case _ZodError_js__WEBPACK_IMPORTED_MODULE_0__/* .ZodIssueCode */ .eq.not_finite:
            message = "Number must be finite";
            break;
        default:
            message = _ctx.defaultError;
            _helpers_util_js__WEBPACK_IMPORTED_MODULE_1__/* .util */ .ZS.assertNever(issue);
    }
    return { message };
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (errorMap);


/***/ }),

/***/ 2241:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  qt: () => (/* binding */ BRAND),
  tm: () => (/* binding */ NEVER),
  Sj: () => (/* binding */ ZodType),
  Ml: () => (/* binding */ ZodAny),
  n: () => (/* binding */ ZodArray),
  Lr: () => (/* binding */ ZodBigInt),
  WF: () => (/* binding */ ZodBoolean),
  eN: () => (/* binding */ ZodBranded),
  hw: () => (/* binding */ ZodCatch),
  aP: () => (/* binding */ ZodDate),
  Xi: () => (/* binding */ ZodDefault),
  jv: () => (/* binding */ ZodDiscriminatedUnion),
  k1: () => (/* binding */ ZodEffects),
  Vb: () => (/* binding */ ZodEnum),
  kY: () => (/* binding */ ZodFirstPartyTypeKind),
  CZ: () => (/* binding */ ZodFunction),
  Jv: () => (/* binding */ ZodIntersection),
  Ih: () => (/* binding */ ZodLazy),
  DN: () => (/* binding */ ZodLiteral),
  Ut: () => (/* binding */ ZodMap),
  Tq: () => (/* binding */ ZodNaN),
  WM: () => (/* binding */ ZodNativeEnum),
  iS: () => (/* binding */ ZodNever),
  PQ: () => (/* binding */ ZodNull),
  l1: () => (/* binding */ ZodNullable),
  rS: () => (/* binding */ ZodNumber),
  bv: () => (/* binding */ ZodObject),
  Ii: () => (/* binding */ ZodOptional),
  _c: () => (/* binding */ ZodPipeline),
  $i: () => (/* binding */ ZodPromise),
  EV: () => (/* binding */ ZodReadonly),
  b8: () => (/* binding */ ZodRecord),
  lK: () => (/* binding */ ZodType),
  Kz: () => (/* binding */ ZodSet),
  ND: () => (/* binding */ ZodString),
  K5: () => (/* binding */ ZodSymbol),
  BG: () => (/* binding */ ZodEffects),
  y0: () => (/* binding */ ZodTuple),
  aR: () => (/* binding */ ZodType),
  _Z: () => (/* binding */ ZodUndefined),
  fZ: () => (/* binding */ ZodUnion),
  _: () => (/* binding */ ZodUnknown),
  a0: () => (/* binding */ ZodVoid),
  bz: () => (/* binding */ anyType),
  YO: () => (/* binding */ arrayType),
  o: () => (/* binding */ bigIntType),
  zM: () => (/* binding */ booleanType),
  au: () => (/* binding */ coerce),
  Ie: () => (/* binding */ custom),
  p6: () => (/* binding */ dateType),
  fm: () => (/* binding */ datetimeRegex),
  gM: () => (/* binding */ discriminatedUnionType),
  QZ: () => (/* binding */ effectsType),
  k5: () => (/* binding */ enumType),
  fH: () => (/* binding */ functionType),
  Nl: () => (/* binding */ instanceOfType),
  E$: () => (/* binding */ intersectionType),
  fn: () => (/* binding */ late),
  RZ: () => (/* binding */ lazyType),
  eu: () => (/* binding */ literalType),
  Tj: () => (/* binding */ mapType),
  oi: () => (/* binding */ nanType),
  fc: () => (/* binding */ nativeEnumType),
  Zm: () => (/* binding */ neverType),
  ch: () => (/* binding */ nullType),
  me: () => (/* binding */ nullableType),
  ai: () => (/* binding */ numberType),
  Ik: () => (/* binding */ objectType),
  yN: () => (/* binding */ oboolean),
  p7: () => (/* binding */ onumber),
  lq: () => (/* binding */ optionalType),
  Di: () => (/* binding */ ostring),
  Tk: () => (/* binding */ pipelineType),
  vk: () => (/* binding */ preprocessType),
  iv: () => (/* binding */ promiseType),
  g1: () => (/* binding */ recordType),
  hZ: () => (/* binding */ setType),
  re: () => (/* binding */ strictObjectType),
  Yj: () => (/* binding */ stringType),
  HR: () => (/* binding */ symbolType),
  Gu: () => (/* binding */ effectsType),
  PV: () => (/* binding */ tupleType),
  Vx: () => (/* binding */ undefinedType),
  KC: () => (/* binding */ unionType),
  L5: () => (/* binding */ unknownType),
  rI: () => (/* binding */ voidType)
});

// EXTERNAL MODULE: ./node_modules/zod/v3/ZodError.js
var ZodError = __webpack_require__(5616);
// EXTERNAL MODULE: ./node_modules/zod/v3/errors.js
var errors = __webpack_require__(7958);
// EXTERNAL MODULE: ./node_modules/zod/v3/locales/en.js
var en = __webpack_require__(342);
;// ./node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function (errorUtil) {
    errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
    // biome-ignore lint:
    errorUtil.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// EXTERNAL MODULE: ./node_modules/zod/v3/helpers/parseUtil.js
var parseUtil = __webpack_require__(4104);
// EXTERNAL MODULE: ./node_modules/zod/v3/helpers/util.js
var util = __webpack_require__(9115);
;// ./node_modules/zod/v3/types.js





class ParseInputLazyPath {
    constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
    }
    get path() {
        if (!this._cachedPath.length) {
            if (Array.isArray(this._key)) {
                this._cachedPath.push(...this._path, ...this._key);
            }
            else {
                this._cachedPath.push(...this._path, this._key);
            }
        }
        return this._cachedPath;
    }
}
const handleResult = (ctx, result) => {
    if ((0,parseUtil/* isValid */.fn)(result)) {
        return { success: true, data: result.value };
    }
    else {
        if (!ctx.common.issues.length) {
            throw new Error("Validation failed but no issues detected.");
        }
        return {
            success: false,
            get error() {
                if (this._error)
                    return this._error;
                const error = new ZodError/* ZodError */.G(ctx.common.issues);
                this._error = error;
                return this._error;
            },
        };
    }
};
function processCreateParams(params) {
    if (!params)
        return {};
    const { errorMap, invalid_type_error, required_error, description } = params;
    if (errorMap && (invalid_type_error || required_error)) {
        throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap)
        return { errorMap: errorMap, description };
    const customMap = (iss, ctx) => {
        const { message } = params;
        if (iss.code === "invalid_enum_value") {
            return { message: message ?? ctx.defaultError };
        }
        if (typeof ctx.data === "undefined") {
            return { message: message ?? required_error ?? ctx.defaultError };
        }
        if (iss.code !== "invalid_type")
            return { message: ctx.defaultError };
        return { message: message ?? invalid_type_error ?? ctx.defaultError };
    };
    return { errorMap: customMap, description };
}
class ZodType {
    get description() {
        return this._def.description;
    }
    _getType(input) {
        return (0,util/* getParsedType */.CR)(input.data);
    }
    _getOrReturnCtx(input, ctx) {
        return (ctx || {
            common: input.parent.common,
            data: input.data,
            parsedType: (0,util/* getParsedType */.CR)(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent,
        });
    }
    _processInputParams(input) {
        return {
            status: new parseUtil/* ParseStatus */.MY(),
            ctx: {
                common: input.parent.common,
                data: input.data,
                parsedType: (0,util/* getParsedType */.CR)(input.data),
                schemaErrorMap: this._def.errorMap,
                path: input.path,
                parent: input.parent,
            },
        };
    }
    _parseSync(input) {
        const result = this._parse(input);
        if ((0,parseUtil/* isAsync */.xP)(result)) {
            throw new Error("Synchronous parse encountered promise.");
        }
        return result;
    }
    _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
    }
    parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    }
    safeParse(data, params) {
        const ctx = {
            common: {
                issues: [],
                async: params?.async ?? false,
                contextualErrorMap: params?.errorMap,
            },
            path: params?.path || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: (0,util/* getParsedType */.CR)(data),
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
    }
    "~validate"(data) {
        const ctx = {
            common: {
                issues: [],
                async: !!this["~standard"].async,
            },
            path: [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: (0,util/* getParsedType */.CR)(data),
        };
        if (!this["~standard"].async) {
            try {
                const result = this._parseSync({ data, path: [], parent: ctx });
                return (0,parseUtil/* isValid */.fn)(result)
                    ? {
                        value: result.value,
                    }
                    : {
                        issues: ctx.common.issues,
                    };
            }
            catch (err) {
                if (err?.message?.toLowerCase()?.includes("encountered")) {
                    this["~standard"].async = true;
                }
                ctx.common = {
                    issues: [],
                    async: true,
                };
            }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => (0,parseUtil/* isValid */.fn)(result)
            ? {
                value: result.value,
            }
            : {
                issues: ctx.common.issues,
            });
    }
    async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
            return result.data;
        throw result.error;
    }
    async safeParseAsync(data, params) {
        const ctx = {
            common: {
                issues: [],
                contextualErrorMap: params?.errorMap,
                async: true,
            },
            path: params?.path || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data,
            parsedType: (0,util/* getParsedType */.CR)(data),
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await ((0,parseUtil/* isAsync */.xP)(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
    }
    refine(check, message) {
        const getIssueProperties = (val) => {
            if (typeof message === "string" || typeof message === "undefined") {
                return { message };
            }
            else if (typeof message === "function") {
                return message(val);
            }
            else {
                return message;
            }
        };
        return this._refinement((val, ctx) => {
            const result = check(val);
            const setError = () => ctx.addIssue({
                code: ZodError/* ZodIssueCode */.eq.custom,
                ...getIssueProperties(val),
            });
            if (typeof Promise !== "undefined" && result instanceof Promise) {
                return result.then((data) => {
                    if (!data) {
                        setError();
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            }
            if (!result) {
                setError();
                return false;
            }
            else {
                return true;
            }
        });
    }
    refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
            if (!check(val)) {
                ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
                return false;
            }
            else {
                return true;
            }
        });
    }
    _refinement(refinement) {
        return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "refinement", refinement },
        });
    }
    superRefine(refinement) {
        return this._refinement(refinement);
    }
    constructor(def) {
        /** Alias of safeParseAsync */
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
            version: 1,
            vendor: "zod",
            validate: (data) => this["~validate"](data),
        };
    }
    optional() {
        return ZodOptional.create(this, this._def);
    }
    nullable() {
        return ZodNullable.create(this, this._def);
    }
    nullish() {
        return this.nullable().optional();
    }
    array() {
        return ZodArray.create(this);
    }
    promise() {
        return ZodPromise.create(this, this._def);
    }
    or(option) {
        return ZodUnion.create([this, option], this._def);
    }
    and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
    }
    transform(transform) {
        return new ZodEffects({
            ...processCreateParams(this._def),
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: { type: "transform", transform },
        });
    }
    default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
            ...processCreateParams(this._def),
            innerType: this,
            defaultValue: defaultValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodDefault,
        });
    }
    brand() {
        return new ZodBranded({
            typeName: ZodFirstPartyTypeKind.ZodBranded,
            type: this,
            ...processCreateParams(this._def),
        });
    }
    catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
            ...processCreateParams(this._def),
            innerType: this,
            catchValue: catchValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodCatch,
        });
    }
    describe(description) {
        const This = this.constructor;
        return new This({
            ...this._def,
            description,
        });
    }
    pipe(target) {
        return ZodPipeline.create(this, target);
    }
    readonly() {
        return ZodReadonly.create(this);
    }
    isOptional() {
        return this.safeParse(undefined).success;
    }
    isNullable() {
        return this.safeParse(null).success;
    }
}
const cuidRegex = /^c[^\s-]{8,}$/i;
const cuid2Regex = /^[0-9a-z]+$/;
const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
// const uuidRegex =
//   /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
const nanoidRegex = /^[a-z0-9_-]{21}$/i;
const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
const durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
// from https://stackoverflow.com/a/46181/1550155
// old version: too slow, didn't support unicode
// const emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
//old email regex
// const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((?!-)([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{1,})[^-<>()[\].,;:\s@"]$/i;
// eslint-disable-next-line
// const emailRegex =
//   /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\])|(\[IPv6:(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))\])|([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])*(\.[A-Za-z]{2,})+))$/;
// const emailRegex =
//   /^[a-zA-Z0-9\.\!\#\$\%\&\'\*\+\/\=\?\^\_\`\{\|\}\~\-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// const emailRegex =
//   /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
// const emailRegex =
//   /^[a-z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9\-]+)*$/i;
// from https://thekevinscott.com/emojis-in-javascript/#writing-a-regular-expression
const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
let emojiRegex;
// faster, simpler, safer
const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
// const ipv6Regex =
// /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
// https://stackoverflow.com/questions/7860392/determine-if-string-is-in-base64-using-javascript
const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
// https://base64.guru/standards/base64url
const base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
// simple
// const dateRegexSource = `\\d{4}-\\d{2}-\\d{2}`;
// no leap year validation
// const dateRegexSource = `\\d{4}-((0[13578]|10|12)-31|(0[13-9]|1[0-2])-30|(0[1-9]|1[0-2])-(0[1-9]|1\\d|2\\d))`;
// with leap year validation
const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
const dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
    let secondsRegexSource = `[0-5]\\d`;
    if (args.precision) {
        secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
    }
    else if (args.precision == null) {
        secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
    }
    const secondsQuantifier = args.precision ? "+" : "?"; // require seconds if precision is nonzero
    return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
    return new RegExp(`^${timeRegexSource(args)}$`);
}
// Adapted from https://stackoverflow.com/a/3143231
function datetimeRegex(args) {
    let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
    const opts = [];
    opts.push(args.local ? `Z?` : `Z`);
    if (args.offset)
        opts.push(`([+-]\\d{2}:?\\d{2})`);
    regex = `${regex}(${opts.join("|")})`;
    return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
    if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
        return true;
    }
    if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
        return true;
    }
    return false;
}
function isValidJWT(jwt, alg) {
    if (!jwtRegex.test(jwt))
        return false;
    try {
        const [header] = jwt.split(".");
        if (!header)
            return false;
        // Convert base64url to base64
        const base64 = header
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(header.length + ((4 - (header.length % 4)) % 4), "=");
        const decoded = JSON.parse(atob(base64));
        if (typeof decoded !== "object" || decoded === null)
            return false;
        if ("typ" in decoded && decoded?.typ !== "JWT")
            return false;
        if (!decoded.alg)
            return false;
        if (alg && decoded.alg !== alg)
            return false;
        return true;
    }
    catch {
        return false;
    }
}
function isValidCidr(ip, version) {
    if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
        return true;
    }
    if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
        return true;
    }
    return false;
}
class ZodString extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.string) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.string,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        const status = new parseUtil/* ParseStatus */.MY();
        let ctx = undefined;
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                if (input.data.length < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.too_small,
                        minimum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                if (input.data.length > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.too_big,
                        maximum: check.value,
                        type: "string",
                        inclusive: true,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "length") {
                const tooBig = input.data.length > check.value;
                const tooSmall = input.data.length < check.value;
                if (tooBig || tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    if (tooBig) {
                        (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                            code: ZodError/* ZodIssueCode */.eq.too_big,
                            maximum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message,
                        });
                    }
                    else if (tooSmall) {
                        (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                            code: ZodError/* ZodIssueCode */.eq.too_small,
                            minimum: check.value,
                            type: "string",
                            inclusive: true,
                            exact: true,
                            message: check.message,
                        });
                    }
                    status.dirty();
                }
            }
            else if (check.kind === "email") {
                if (!emailRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "email",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "emoji") {
                if (!emojiRegex) {
                    emojiRegex = new RegExp(_emojiRegex, "u");
                }
                if (!emojiRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "emoji",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "uuid") {
                if (!uuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "uuid",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "nanoid") {
                if (!nanoidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "nanoid",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cuid") {
                if (!cuidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "cuid",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cuid2") {
                if (!cuid2Regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "cuid2",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "ulid") {
                if (!ulidRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "ulid",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "url") {
                try {
                    new URL(input.data);
                }
                catch {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "url",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "regex") {
                check.regex.lastIndex = 0;
                const testResult = check.regex.test(input.data);
                if (!testResult) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "regex",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "trim") {
                input.data = input.data.trim();
            }
            else if (check.kind === "includes") {
                if (!input.data.includes(check.value, check.position)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        validation: { includes: check.value, position: check.position },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "toLowerCase") {
                input.data = input.data.toLowerCase();
            }
            else if (check.kind === "toUpperCase") {
                input.data = input.data.toUpperCase();
            }
            else if (check.kind === "startsWith") {
                if (!input.data.startsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        validation: { startsWith: check.value },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "endsWith") {
                if (!input.data.endsWith(check.value)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        validation: { endsWith: check.value },
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "datetime") {
                const regex = datetimeRegex(check);
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        validation: "datetime",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "date") {
                const regex = dateRegex;
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        validation: "date",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "time") {
                const regex = timeRegex(check);
                if (!regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        validation: "time",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "duration") {
                if (!durationRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "duration",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "ip") {
                if (!isValidIP(input.data, check.version)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "ip",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "jwt") {
                if (!isValidJWT(input.data, check.alg)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "jwt",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "cidr") {
                if (!isValidCidr(input.data, check.version)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "cidr",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "base64") {
                if (!base64Regex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "base64",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "base64url") {
                if (!base64urlRegex.test(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        validation: "base64url",
                        code: ZodError/* ZodIssueCode */.eq.invalid_string,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util/* util */.ZS.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
            validation,
            code: ZodError/* ZodIssueCode */.eq.invalid_string,
            ...errorUtil.errToObj(message),
        });
    }
    _addCheck(check) {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
    }
    url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
    }
    emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
    }
    uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
    }
    nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
    }
    cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
    }
    cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
    }
    ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
    }
    base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
    }
    base64url(message) {
        // base64url encoding is a modification of base64 that can safely be used in URLs and filenames
        return this._addCheck({
            kind: "base64url",
            ...errorUtil.errToObj(message),
        });
    }
    jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
    }
    ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
    }
    cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
    }
    datetime(options) {
        if (typeof options === "string") {
            return this._addCheck({
                kind: "datetime",
                precision: null,
                offset: false,
                local: false,
                message: options,
            });
        }
        return this._addCheck({
            kind: "datetime",
            precision: typeof options?.precision === "undefined" ? null : options?.precision,
            offset: options?.offset ?? false,
            local: options?.local ?? false,
            ...errorUtil.errToObj(options?.message),
        });
    }
    date(message) {
        return this._addCheck({ kind: "date", message });
    }
    time(options) {
        if (typeof options === "string") {
            return this._addCheck({
                kind: "time",
                precision: null,
                message: options,
            });
        }
        return this._addCheck({
            kind: "time",
            precision: typeof options?.precision === "undefined" ? null : options?.precision,
            ...errorUtil.errToObj(options?.message),
        });
    }
    duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
    }
    regex(regex, message) {
        return this._addCheck({
            kind: "regex",
            regex: regex,
            ...errorUtil.errToObj(message),
        });
    }
    includes(value, options) {
        return this._addCheck({
            kind: "includes",
            value: value,
            position: options?.position,
            ...errorUtil.errToObj(options?.message),
        });
    }
    startsWith(value, message) {
        return this._addCheck({
            kind: "startsWith",
            value: value,
            ...errorUtil.errToObj(message),
        });
    }
    endsWith(value, message) {
        return this._addCheck({
            kind: "endsWith",
            value: value,
            ...errorUtil.errToObj(message),
        });
    }
    min(minLength, message) {
        return this._addCheck({
            kind: "min",
            value: minLength,
            ...errorUtil.errToObj(message),
        });
    }
    max(maxLength, message) {
        return this._addCheck({
            kind: "max",
            value: maxLength,
            ...errorUtil.errToObj(message),
        });
    }
    length(len, message) {
        return this._addCheck({
            kind: "length",
            value: len,
            ...errorUtil.errToObj(message),
        });
    }
    /**
     * Equivalent to `.min(1)`
     */
    nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
    }
    trim() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "trim" }],
        });
    }
    toLowerCase() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toLowerCase" }],
        });
    }
    toUpperCase() {
        return new ZodString({
            ...this._def,
            checks: [...this._def.checks, { kind: "toUpperCase" }],
        });
    }
    get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
    }
    get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
    }
    get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
    }
    get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
    }
    get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
    }
    get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
    }
    get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
    }
    get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
    }
    get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
    }
    get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
    }
    get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
    }
    get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
    }
    get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
    }
    get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
    }
    get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
    }
    get isBase64url() {
        // base64url encoding is a modification of base64 that can safely be used in URLs and filenames
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
    }
    get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
}
ZodString.create = (params) => {
    return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params),
    });
};
// https://stackoverflow.com/questions/3966484/why-does-modulus-operator-return-fractional-number-in-javascript/31711034#31711034
function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
    return (valInt % stepInt) / 10 ** decCount;
}
class ZodNumber extends ZodType {
    constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
    }
    _parse(input) {
        if (this._def.coerce) {
            input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.number) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.number,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        let ctx = undefined;
        const status = new parseUtil/* ParseStatus */.MY();
        for (const check of this._def.checks) {
            if (check.kind === "int") {
                if (!util/* util */.ZS.isInteger(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.invalid_type,
                        expected: "integer",
                        received: "float",
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "min") {
                const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.too_small,
                        minimum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.too_big,
                        maximum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        exact: false,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "multipleOf") {
                if (floatSafeRemainder(input.data, check.value) !== 0) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "finite") {
                if (!Number.isFinite(input.data)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.not_finite,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util/* util */.ZS.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodNumber({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil.toString(message),
                },
            ],
        });
    }
    _addCheck(check) {
        return new ZodNumber({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    int(message) {
        return this._addCheck({
            kind: "int",
            message: errorUtil.toString(message),
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value: value,
            message: errorUtil.toString(message),
        });
    }
    finite(message) {
        return this._addCheck({
            kind: "finite",
            message: errorUtil.toString(message),
        });
    }
    safe(message) {
        return this._addCheck({
            kind: "min",
            inclusive: true,
            value: Number.MIN_SAFE_INTEGER,
            message: errorUtil.toString(message),
        })._addCheck({
            kind: "max",
            inclusive: true,
            value: Number.MAX_SAFE_INTEGER,
            message: errorUtil.toString(message),
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
    get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || (ch.kind === "multipleOf" && util/* util */.ZS.isInteger(ch.value)));
    }
    get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
                return true;
            }
            else if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
            else if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return Number.isFinite(min) && Number.isFinite(max);
    }
}
ZodNumber.create = (params) => {
    return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params),
    });
};
class ZodBigInt extends ZodType {
    constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
    }
    _parse(input) {
        if (this._def.coerce) {
            try {
                input.data = BigInt(input.data);
            }
            catch {
                return this._getInvalidInput(input);
            }
        }
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.bigint) {
            return this._getInvalidInput(input);
        }
        let ctx = undefined;
        const status = new parseUtil/* ParseStatus */.MY();
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
                if (tooSmall) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.too_small,
                        type: "bigint",
                        minimum: check.value,
                        inclusive: check.inclusive,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
                if (tooBig) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.too_big,
                        type: "bigint",
                        maximum: check.value,
                        inclusive: check.inclusive,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "multipleOf") {
                if (input.data % check.value !== BigInt(0)) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message,
                    });
                    status.dirty();
                }
            }
            else {
                util/* util */.ZS.assertNever(check);
            }
        }
        return { status: status.value, value: input.data };
    }
    _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        (0,parseUtil/* addIssueToContext */.zn)(ctx, {
            code: ZodError/* ZodIssueCode */.eq.invalid_type,
            expected: util/* ZodParsedType */.Zp.bigint,
            received: ctx.parsedType,
        });
        return parseUtil/* INVALID */.uY;
    }
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodBigInt({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil.toString(message),
                },
            ],
        });
    }
    _addCheck(check) {
        return new ZodBigInt({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: false,
            message: errorUtil.toString(message),
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: BigInt(0),
            inclusive: true,
            message: errorUtil.toString(message),
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value,
            message: errorUtil.toString(message),
        });
    }
    get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max;
    }
}
ZodBigInt.create = (params) => {
    return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params),
    });
};
class ZodBoolean extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.boolean) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.boolean,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        return (0,parseUtil.OK)(input.data);
    }
}
ZodBoolean.create = (params) => {
    return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params),
    });
};
class ZodDate extends ZodType {
    _parse(input) {
        if (this._def.coerce) {
            input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.date) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.date,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        if (Number.isNaN(input.data.getTime())) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_date,
            });
            return parseUtil/* INVALID */.uY;
        }
        const status = new parseUtil/* ParseStatus */.MY();
        let ctx = undefined;
        for (const check of this._def.checks) {
            if (check.kind === "min") {
                if (input.data.getTime() < check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.too_small,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        minimum: check.value,
                        type: "date",
                    });
                    status.dirty();
                }
            }
            else if (check.kind === "max") {
                if (input.data.getTime() > check.value) {
                    ctx = this._getOrReturnCtx(input, ctx);
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.too_big,
                        message: check.message,
                        inclusive: true,
                        exact: false,
                        maximum: check.value,
                        type: "date",
                    });
                    status.dirty();
                }
            }
            else {
                util/* util */.ZS.assertNever(check);
            }
        }
        return {
            status: status.value,
            value: new Date(input.data.getTime()),
        };
    }
    _addCheck(check) {
        return new ZodDate({
            ...this._def,
            checks: [...this._def.checks, check],
        });
    }
    min(minDate, message) {
        return this._addCheck({
            kind: "min",
            value: minDate.getTime(),
            message: errorUtil.toString(message),
        });
    }
    max(maxDate, message) {
        return this._addCheck({
            kind: "max",
            value: maxDate.getTime(),
            message: errorUtil.toString(message),
        });
    }
    get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "min") {
                if (min === null || ch.value > min)
                    min = ch.value;
            }
        }
        return min != null ? new Date(min) : null;
    }
    get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
            if (ch.kind === "max") {
                if (max === null || ch.value < max)
                    max = ch.value;
            }
        }
        return max != null ? new Date(max) : null;
    }
}
ZodDate.create = (params) => {
    return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params),
    });
};
class ZodSymbol extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.symbol) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.symbol,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        return (0,parseUtil.OK)(input.data);
    }
}
ZodSymbol.create = (params) => {
    return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params),
    });
};
class ZodUndefined extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.undefined) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.undefined,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        return (0,parseUtil.OK)(input.data);
    }
}
ZodUndefined.create = (params) => {
    return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params),
    });
};
class ZodNull extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.null) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.null,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        return (0,parseUtil.OK)(input.data);
    }
}
ZodNull.create = (params) => {
    return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params),
    });
};
class ZodAny extends ZodType {
    constructor() {
        super(...arguments);
        // to prevent instances of other classes from extending ZodAny. this causes issues with catchall in ZodObject.
        this._any = true;
    }
    _parse(input) {
        return (0,parseUtil.OK)(input.data);
    }
}
ZodAny.create = (params) => {
    return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params),
    });
};
class ZodUnknown extends ZodType {
    constructor() {
        super(...arguments);
        // required
        this._unknown = true;
    }
    _parse(input) {
        return (0,parseUtil.OK)(input.data);
    }
}
ZodUnknown.create = (params) => {
    return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params),
    });
};
class ZodNever extends ZodType {
    _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        (0,parseUtil/* addIssueToContext */.zn)(ctx, {
            code: ZodError/* ZodIssueCode */.eq.invalid_type,
            expected: util/* ZodParsedType */.Zp.never,
            received: ctx.parsedType,
        });
        return parseUtil/* INVALID */.uY;
    }
}
ZodNever.create = (params) => {
    return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params),
    });
};
class ZodVoid extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.undefined) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.void,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        return (0,parseUtil.OK)(input.data);
    }
}
ZodVoid.create = (params) => {
    return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params),
    });
};
class ZodArray extends ZodType {
    _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== util/* ZodParsedType */.Zp.array) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.array,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        if (def.exactLength !== null) {
            const tooBig = ctx.data.length > def.exactLength.value;
            const tooSmall = ctx.data.length < def.exactLength.value;
            if (tooBig || tooSmall) {
                (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                    code: tooBig ? ZodError/* ZodIssueCode */.eq.too_big : ZodError/* ZodIssueCode */.eq.too_small,
                    minimum: (tooSmall ? def.exactLength.value : undefined),
                    maximum: (tooBig ? def.exactLength.value : undefined),
                    type: "array",
                    inclusive: true,
                    exact: true,
                    message: def.exactLength.message,
                });
                status.dirty();
            }
        }
        if (def.minLength !== null) {
            if (ctx.data.length < def.minLength.value) {
                (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                    code: ZodError/* ZodIssueCode */.eq.too_small,
                    minimum: def.minLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.minLength.message,
                });
                status.dirty();
            }
        }
        if (def.maxLength !== null) {
            if (ctx.data.length > def.maxLength.value) {
                (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                    code: ZodError/* ZodIssueCode */.eq.too_big,
                    maximum: def.maxLength.value,
                    type: "array",
                    inclusive: true,
                    exact: false,
                    message: def.maxLength.message,
                });
                status.dirty();
            }
        }
        if (ctx.common.async) {
            return Promise.all([...ctx.data].map((item, i) => {
                return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
            })).then((result) => {
                return parseUtil/* ParseStatus */.MY.mergeArray(status, result);
            });
        }
        const result = [...ctx.data].map((item, i) => {
            return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return parseUtil/* ParseStatus */.MY.mergeArray(status, result);
    }
    get element() {
        return this._def.type;
    }
    min(minLength, message) {
        return new ZodArray({
            ...this._def,
            minLength: { value: minLength, message: errorUtil.toString(message) },
        });
    }
    max(maxLength, message) {
        return new ZodArray({
            ...this._def,
            maxLength: { value: maxLength, message: errorUtil.toString(message) },
        });
    }
    length(len, message) {
        return new ZodArray({
            ...this._def,
            exactLength: { value: len, message: errorUtil.toString(message) },
        });
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
ZodArray.create = (schema, params) => {
    return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params),
    });
};
function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
        const newShape = {};
        for (const key in schema.shape) {
            const fieldSchema = schema.shape[key];
            newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject({
            ...schema._def,
            shape: () => newShape,
        });
    }
    else if (schema instanceof ZodArray) {
        return new ZodArray({
            ...schema._def,
            type: deepPartialify(schema.element),
        });
    }
    else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
    }
    else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    }
    else {
        return schema;
    }
}
class ZodObject extends ZodType {
    constructor() {
        super(...arguments);
        this._cached = null;
        /**
         * @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
         * If you want to pass through unknown properties, use `.passthrough()` instead.
         */
        this.nonstrict = this.passthrough;
        // extend<
        //   Augmentation extends ZodRawShape,
        //   NewOutput extends util.flatten<{
        //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
        //       ? Augmentation[k]["_output"]
        //       : k extends keyof Output
        //       ? Output[k]
        //       : never;
        //   }>,
        //   NewInput extends util.flatten<{
        //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
        //       ? Augmentation[k]["_input"]
        //       : k extends keyof Input
        //       ? Input[k]
        //       : never;
        //   }>
        // >(
        //   augmentation: Augmentation
        // ): ZodObject<
        //   extendShape<T, Augmentation>,
        //   UnknownKeys,
        //   Catchall,
        //   NewOutput,
        //   NewInput
        // > {
        //   return new ZodObject({
        //     ...this._def,
        //     shape: () => ({
        //       ...this._def.shape(),
        //       ...augmentation,
        //     }),
        //   }) as any;
        // }
        /**
         * @deprecated Use `.extend` instead
         *  */
        this.augment = this.extend;
    }
    _getCached() {
        if (this._cached !== null)
            return this._cached;
        const shape = this._def.shape();
        const keys = util/* util */.ZS.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
    }
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.object) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.object,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
            for (const key in ctx.data) {
                if (!shapeKeys.includes(key)) {
                    extraKeys.push(key);
                }
            }
        }
        const pairs = [];
        for (const key of shapeKeys) {
            const keyValidator = shape[key];
            const value = ctx.data[key];
            pairs.push({
                key: { status: "valid", value: key },
                value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
                alwaysSet: key in ctx.data,
            });
        }
        if (this._def.catchall instanceof ZodNever) {
            const unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
                for (const key of extraKeys) {
                    pairs.push({
                        key: { status: "valid", value: key },
                        value: { status: "valid", value: ctx.data[key] },
                    });
                }
            }
            else if (unknownKeys === "strict") {
                if (extraKeys.length > 0) {
                    (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                        code: ZodError/* ZodIssueCode */.eq.unrecognized_keys,
                        keys: extraKeys,
                    });
                    status.dirty();
                }
            }
            else if (unknownKeys === "strip") {
            }
            else {
                throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
            }
        }
        else {
            // run catchall validation
            const catchall = this._def.catchall;
            for (const key of extraKeys) {
                const value = ctx.data[key];
                pairs.push({
                    key: { status: "valid", value: key },
                    value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key) //, ctx.child(key), value, getParsedType(value)
                    ),
                    alwaysSet: key in ctx.data,
                });
            }
        }
        if (ctx.common.async) {
            return Promise.resolve()
                .then(async () => {
                const syncPairs = [];
                for (const pair of pairs) {
                    const key = await pair.key;
                    const value = await pair.value;
                    syncPairs.push({
                        key,
                        value,
                        alwaysSet: pair.alwaysSet,
                    });
                }
                return syncPairs;
            })
                .then((syncPairs) => {
                return parseUtil/* ParseStatus */.MY.mergeObjectSync(status, syncPairs);
            });
        }
        else {
            return parseUtil/* ParseStatus */.MY.mergeObjectSync(status, pairs);
        }
    }
    get shape() {
        return this._def.shape();
    }
    strict(message) {
        errorUtil.errToObj;
        return new ZodObject({
            ...this._def,
            unknownKeys: "strict",
            ...(message !== undefined
                ? {
                    errorMap: (issue, ctx) => {
                        const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
                        if (issue.code === "unrecognized_keys")
                            return {
                                message: errorUtil.errToObj(message).message ?? defaultError,
                            };
                        return {
                            message: defaultError,
                        };
                    },
                }
                : {}),
        });
    }
    strip() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "strip",
        });
    }
    passthrough() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "passthrough",
        });
    }
    // const AugmentFactory =
    //   <Def extends ZodObjectDef>(def: Def) =>
    //   <Augmentation extends ZodRawShape>(
    //     augmentation: Augmentation
    //   ): ZodObject<
    //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
    //     Def["unknownKeys"],
    //     Def["catchall"]
    //   > => {
    //     return new ZodObject({
    //       ...def,
    //       shape: () => ({
    //         ...def.shape(),
    //         ...augmentation,
    //       }),
    //     }) as any;
    //   };
    extend(augmentation) {
        return new ZodObject({
            ...this._def,
            shape: () => ({
                ...this._def.shape(),
                ...augmentation,
            }),
        });
    }
    /**
     * Prior to zod@1.0.12 there was a bug in the
     * inferred type of merged objects. Please
     * upgrade if you are experiencing issues.
     */
    merge(merging) {
        const merged = new ZodObject({
            unknownKeys: merging._def.unknownKeys,
            catchall: merging._def.catchall,
            shape: () => ({
                ...this._def.shape(),
                ...merging._def.shape(),
            }),
            typeName: ZodFirstPartyTypeKind.ZodObject,
        });
        return merged;
    }
    // merge<
    //   Incoming extends AnyZodObject,
    //   Augmentation extends Incoming["shape"],
    //   NewOutput extends {
    //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
    //       ? Augmentation[k]["_output"]
    //       : k extends keyof Output
    //       ? Output[k]
    //       : never;
    //   },
    //   NewInput extends {
    //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
    //       ? Augmentation[k]["_input"]
    //       : k extends keyof Input
    //       ? Input[k]
    //       : never;
    //   }
    // >(
    //   merging: Incoming
    // ): ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"],
    //   NewOutput,
    //   NewInput
    // > {
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    setKey(key, schema) {
        return this.augment({ [key]: schema });
    }
    // merge<Incoming extends AnyZodObject>(
    //   merging: Incoming
    // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
    // ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"]
    // > {
    //   // const mergedShape = objectUtil.mergeShapes(
    //   //   this._def.shape(),
    //   //   merging._def.shape()
    //   // );
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    catchall(index) {
        return new ZodObject({
            ...this._def,
            catchall: index,
        });
    }
    pick(mask) {
        const shape = {};
        for (const key of util/* util */.ZS.objectKeys(mask)) {
            if (mask[key] && this.shape[key]) {
                shape[key] = this.shape[key];
            }
        }
        return new ZodObject({
            ...this._def,
            shape: () => shape,
        });
    }
    omit(mask) {
        const shape = {};
        for (const key of util/* util */.ZS.objectKeys(this.shape)) {
            if (!mask[key]) {
                shape[key] = this.shape[key];
            }
        }
        return new ZodObject({
            ...this._def,
            shape: () => shape,
        });
    }
    /**
     * @deprecated
     */
    deepPartial() {
        return deepPartialify(this);
    }
    partial(mask) {
        const newShape = {};
        for (const key of util/* util */.ZS.objectKeys(this.shape)) {
            const fieldSchema = this.shape[key];
            if (mask && !mask[key]) {
                newShape[key] = fieldSchema;
            }
            else {
                newShape[key] = fieldSchema.optional();
            }
        }
        return new ZodObject({
            ...this._def,
            shape: () => newShape,
        });
    }
    required(mask) {
        const newShape = {};
        for (const key of util/* util */.ZS.objectKeys(this.shape)) {
            if (mask && !mask[key]) {
                newShape[key] = this.shape[key];
            }
            else {
                const fieldSchema = this.shape[key];
                let newField = fieldSchema;
                while (newField instanceof ZodOptional) {
                    newField = newField._def.innerType;
                }
                newShape[key] = newField;
            }
        }
        return new ZodObject({
            ...this._def,
            shape: () => newShape,
        });
    }
    keyof() {
        return createZodEnum(util/* util */.ZS.objectKeys(this.shape));
    }
}
ZodObject.create = (shape, params) => {
    return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
ZodObject.strictCreate = (shape, params) => {
    return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
ZodObject.lazycreate = (shape, params) => {
    return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params),
    });
};
class ZodUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
            // return first issue-free validation if it exists
            for (const result of results) {
                if (result.result.status === "valid") {
                    return result.result;
                }
            }
            for (const result of results) {
                if (result.result.status === "dirty") {
                    // add issues from dirty option
                    ctx.common.issues.push(...result.ctx.common.issues);
                    return result.result;
                }
            }
            // return invalid
            const unionErrors = results.map((result) => new ZodError/* ZodError */.G(result.ctx.common.issues));
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_union,
                unionErrors,
            });
            return parseUtil/* INVALID */.uY;
        }
        if (ctx.common.async) {
            return Promise.all(options.map(async (option) => {
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: [],
                    },
                    parent: null,
                };
                return {
                    result: await option._parseAsync({
                        data: ctx.data,
                        path: ctx.path,
                        parent: childCtx,
                    }),
                    ctx: childCtx,
                };
            })).then(handleResults);
        }
        else {
            let dirty = undefined;
            const issues = [];
            for (const option of options) {
                const childCtx = {
                    ...ctx,
                    common: {
                        ...ctx.common,
                        issues: [],
                    },
                    parent: null,
                };
                const result = option._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: childCtx,
                });
                if (result.status === "valid") {
                    return result;
                }
                else if (result.status === "dirty" && !dirty) {
                    dirty = { result, ctx: childCtx };
                }
                if (childCtx.common.issues.length) {
                    issues.push(childCtx.common.issues);
                }
            }
            if (dirty) {
                ctx.common.issues.push(...dirty.ctx.common.issues);
                return dirty.result;
            }
            const unionErrors = issues.map((issues) => new ZodError/* ZodError */.G(issues));
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_union,
                unionErrors,
            });
            return parseUtil/* INVALID */.uY;
        }
    }
    get options() {
        return this._def.options;
    }
}
ZodUnion.create = (types, params) => {
    return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params),
    });
};
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////                                 //////////
//////////      ZodDiscriminatedUnion      //////////
//////////                                 //////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
const getDiscriminator = (type) => {
    if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
    }
    else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
    }
    else if (type instanceof ZodLiteral) {
        return [type.value];
    }
    else if (type instanceof ZodEnum) {
        return type.options;
    }
    else if (type instanceof ZodNativeEnum) {
        // eslint-disable-next-line ban/ban
        return util/* util */.ZS.objectValues(type.enum);
    }
    else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
    }
    else if (type instanceof ZodUndefined) {
        return [undefined];
    }
    else if (type instanceof ZodNull) {
        return [null];
    }
    else if (type instanceof ZodOptional) {
        return [undefined, ...getDiscriminator(type.unwrap())];
    }
    else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
    }
    else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
    }
    else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
    }
    else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
    }
    else {
        return [];
    }
};
class ZodDiscriminatedUnion extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util/* ZodParsedType */.Zp.object) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.object,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_union_discriminator,
                options: Array.from(this.optionsMap.keys()),
                path: [discriminator],
            });
            return parseUtil/* INVALID */.uY;
        }
        if (ctx.common.async) {
            return option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
        else {
            return option._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
        }
    }
    get discriminator() {
        return this._def.discriminator;
    }
    get options() {
        return this._def.options;
    }
    get optionsMap() {
        return this._def.optionsMap;
    }
    /**
     * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
     * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
     * have a different value for each object in the union.
     * @param discriminator the name of the discriminator property
     * @param types an array of object schemas
     * @param params
     */
    static create(discriminator, options, params) {
        // Get all the valid discriminator values
        const optionsMap = new Map();
        // try {
        for (const type of options) {
            const discriminatorValues = getDiscriminator(type.shape[discriminator]);
            if (!discriminatorValues.length) {
                throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
            }
            for (const value of discriminatorValues) {
                if (optionsMap.has(value)) {
                    throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
                }
                optionsMap.set(value, type);
            }
        }
        return new ZodDiscriminatedUnion({
            typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
            discriminator,
            options,
            optionsMap,
            ...processCreateParams(params),
        });
    }
}
function mergeValues(a, b) {
    const aType = (0,util/* getParsedType */.CR)(a);
    const bType = (0,util/* getParsedType */.CR)(b);
    if (a === b) {
        return { valid: true, data: a };
    }
    else if (aType === util/* ZodParsedType */.Zp.object && bType === util/* ZodParsedType */.Zp.object) {
        const bKeys = util/* util */.ZS.objectKeys(b);
        const sharedKeys = util/* util */.ZS.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
        const newObj = { ...a, ...b };
        for (const key of sharedKeys) {
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newObj[key] = sharedValue.data;
        }
        return { valid: true, data: newObj };
    }
    else if (aType === util/* ZodParsedType */.Zp.array && bType === util/* ZodParsedType */.Zp.array) {
        if (a.length !== b.length) {
            return { valid: false };
        }
        const newArray = [];
        for (let index = 0; index < a.length; index++) {
            const itemA = a[index];
            const itemB = b[index];
            const sharedValue = mergeValues(itemA, itemB);
            if (!sharedValue.valid) {
                return { valid: false };
            }
            newArray.push(sharedValue.data);
        }
        return { valid: true, data: newArray };
    }
    else if (aType === util/* ZodParsedType */.Zp.date && bType === util/* ZodParsedType */.Zp.date && +a === +b) {
        return { valid: true, data: a };
    }
    else {
        return { valid: false };
    }
}
class ZodIntersection extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
            if ((0,parseUtil/* isAborted */.G4)(parsedLeft) || (0,parseUtil/* isAborted */.G4)(parsedRight)) {
                return parseUtil/* INVALID */.uY;
            }
            const merged = mergeValues(parsedLeft.value, parsedRight.value);
            if (!merged.valid) {
                (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                    code: ZodError/* ZodIssueCode */.eq.invalid_intersection_types,
                });
                return parseUtil/* INVALID */.uY;
            }
            if ((0,parseUtil/* isDirty */.DM)(parsedLeft) || (0,parseUtil/* isDirty */.DM)(parsedRight)) {
                status.dirty();
            }
            return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
            return Promise.all([
                this._def.left._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
                this._def.right._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                }),
            ]).then(([left, right]) => handleParsed(left, right));
        }
        else {
            return handleParsed(this._def.left._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }), this._def.right._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            }));
        }
    }
}
ZodIntersection.create = (left, right, params) => {
    return new ZodIntersection({
        left: left,
        right: right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params),
    });
};
// type ZodTupleItems = [ZodTypeAny, ...ZodTypeAny[]];
class ZodTuple extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util/* ZodParsedType */.Zp.array) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.array,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        if (ctx.data.length < this._def.items.length) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.too_small,
                minimum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array",
            });
            return parseUtil/* INVALID */.uY;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.too_big,
                maximum: this._def.items.length,
                inclusive: true,
                exact: false,
                type: "array",
            });
            status.dirty();
        }
        const items = [...ctx.data]
            .map((item, itemIndex) => {
            const schema = this._def.items[itemIndex] || this._def.rest;
            if (!schema)
                return null;
            return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        })
            .filter((x) => !!x); // filter nulls
        if (ctx.common.async) {
            return Promise.all(items).then((results) => {
                return parseUtil/* ParseStatus */.MY.mergeArray(status, results);
            });
        }
        else {
            return parseUtil/* ParseStatus */.MY.mergeArray(status, items);
        }
    }
    get items() {
        return this._def.items;
    }
    rest(rest) {
        return new ZodTuple({
            ...this._def,
            rest,
        });
    }
}
ZodTuple.create = (schemas, params) => {
    if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params),
    });
};
class ZodRecord extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util/* ZodParsedType */.Zp.object) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.object,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
            pairs.push({
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
                value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
                alwaysSet: key in ctx.data,
            });
        }
        if (ctx.common.async) {
            return parseUtil/* ParseStatus */.MY.mergeObjectAsync(status, pairs);
        }
        else {
            return parseUtil/* ParseStatus */.MY.mergeObjectSync(status, pairs);
        }
    }
    get element() {
        return this._def.valueType;
    }
    static create(first, second, third) {
        if (second instanceof ZodType) {
            return new ZodRecord({
                keyType: first,
                valueType: second,
                typeName: ZodFirstPartyTypeKind.ZodRecord,
                ...processCreateParams(third),
            });
        }
        return new ZodRecord({
            keyType: ZodString.create(),
            valueType: first,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(second),
        });
    }
}
class ZodMap extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util/* ZodParsedType */.Zp.map) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.map,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
            return {
                key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
                value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"])),
            };
        });
        if (ctx.common.async) {
            const finalMap = new Map();
            return Promise.resolve().then(async () => {
                for (const pair of pairs) {
                    const key = await pair.key;
                    const value = await pair.value;
                    if (key.status === "aborted" || value.status === "aborted") {
                        return parseUtil/* INVALID */.uY;
                    }
                    if (key.status === "dirty" || value.status === "dirty") {
                        status.dirty();
                    }
                    finalMap.set(key.value, value.value);
                }
                return { status: status.value, value: finalMap };
            });
        }
        else {
            const finalMap = new Map();
            for (const pair of pairs) {
                const key = pair.key;
                const value = pair.value;
                if (key.status === "aborted" || value.status === "aborted") {
                    return parseUtil/* INVALID */.uY;
                }
                if (key.status === "dirty" || value.status === "dirty") {
                    status.dirty();
                }
                finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
        }
    }
}
ZodMap.create = (keyType, valueType, params) => {
    return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params),
    });
};
class ZodSet extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util/* ZodParsedType */.Zp.set) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.set,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        const def = this._def;
        if (def.minSize !== null) {
            if (ctx.data.size < def.minSize.value) {
                (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                    code: ZodError/* ZodIssueCode */.eq.too_small,
                    minimum: def.minSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.minSize.message,
                });
                status.dirty();
            }
        }
        if (def.maxSize !== null) {
            if (ctx.data.size > def.maxSize.value) {
                (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                    code: ZodError/* ZodIssueCode */.eq.too_big,
                    maximum: def.maxSize.value,
                    type: "set",
                    inclusive: true,
                    exact: false,
                    message: def.maxSize.message,
                });
                status.dirty();
            }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements) {
            const parsedSet = new Set();
            for (const element of elements) {
                if (element.status === "aborted")
                    return parseUtil/* INVALID */.uY;
                if (element.status === "dirty")
                    status.dirty();
                parsedSet.add(element.value);
            }
            return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
            return Promise.all(elements).then((elements) => finalizeSet(elements));
        }
        else {
            return finalizeSet(elements);
        }
    }
    min(minSize, message) {
        return new ZodSet({
            ...this._def,
            minSize: { value: minSize, message: errorUtil.toString(message) },
        });
    }
    max(maxSize, message) {
        return new ZodSet({
            ...this._def,
            maxSize: { value: maxSize, message: errorUtil.toString(message) },
        });
    }
    size(size, message) {
        return this.min(size, message).max(size, message);
    }
    nonempty(message) {
        return this.min(1, message);
    }
}
ZodSet.create = (valueType, params) => {
    return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params),
    });
};
class ZodFunction extends ZodType {
    constructor() {
        super(...arguments);
        this.validate = this.implement;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util/* ZodParsedType */.Zp.function) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.function,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        function makeArgsIssue(args, error) {
            return (0,parseUtil/* makeIssue */.y7)({
                data: args,
                path: ctx.path,
                errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0,errors/* getErrorMap */.$W)(), en/* default */.A].filter((x) => !!x),
                issueData: {
                    code: ZodError/* ZodIssueCode */.eq.invalid_arguments,
                    argumentsError: error,
                },
            });
        }
        function makeReturnsIssue(returns, error) {
            return (0,parseUtil/* makeIssue */.y7)({
                data: returns,
                path: ctx.path,
                errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, (0,errors/* getErrorMap */.$W)(), en/* default */.A].filter((x) => !!x),
                issueData: {
                    code: ZodError/* ZodIssueCode */.eq.invalid_return_type,
                    returnTypeError: error,
                },
            });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
            // Would love a way to avoid disabling this rule, but we need
            // an alias (using an arrow function was what caused 2651).
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const me = this;
            return (0,parseUtil.OK)(async function (...args) {
                const error = new ZodError/* ZodError */.G([]);
                const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
                    error.addIssue(makeArgsIssue(args, e));
                    throw error;
                });
                const result = await Reflect.apply(fn, this, parsedArgs);
                const parsedReturns = await me._def.returns._def.type
                    .parseAsync(result, params)
                    .catch((e) => {
                    error.addIssue(makeReturnsIssue(result, e));
                    throw error;
                });
                return parsedReturns;
            });
        }
        else {
            // Would love a way to avoid disabling this rule, but we need
            // an alias (using an arrow function was what caused 2651).
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const me = this;
            return (0,parseUtil.OK)(function (...args) {
                const parsedArgs = me._def.args.safeParse(args, params);
                if (!parsedArgs.success) {
                    throw new ZodError/* ZodError */.G([makeArgsIssue(args, parsedArgs.error)]);
                }
                const result = Reflect.apply(fn, this, parsedArgs.data);
                const parsedReturns = me._def.returns.safeParse(result, params);
                if (!parsedReturns.success) {
                    throw new ZodError/* ZodError */.G([makeReturnsIssue(result, parsedReturns.error)]);
                }
                return parsedReturns.data;
            });
        }
    }
    parameters() {
        return this._def.args;
    }
    returnType() {
        return this._def.returns;
    }
    args(...items) {
        return new ZodFunction({
            ...this._def,
            args: ZodTuple.create(items).rest(ZodUnknown.create()),
        });
    }
    returns(returnType) {
        return new ZodFunction({
            ...this._def,
            returns: returnType,
        });
    }
    implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    static create(args, returns, params) {
        return new ZodFunction({
            args: (args ? args : ZodTuple.create([]).rest(ZodUnknown.create())),
            returns: returns || ZodUnknown.create(),
            typeName: ZodFirstPartyTypeKind.ZodFunction,
            ...processCreateParams(params),
        });
    }
}
class ZodLazy extends ZodType {
    get schema() {
        return this._def.getter();
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    }
}
ZodLazy.create = (getter, params) => {
    return new ZodLazy({
        getter: getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params),
    });
};
class ZodLiteral extends ZodType {
    _parse(input) {
        if (input.data !== this._def.value) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                received: ctx.data,
                code: ZodError/* ZodIssueCode */.eq.invalid_literal,
                expected: this._def.value,
            });
            return parseUtil/* INVALID */.uY;
        }
        return { status: "valid", value: input.data };
    }
    get value() {
        return this._def.value;
    }
}
ZodLiteral.create = (value, params) => {
    return new ZodLiteral({
        value: value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params),
    });
};
function createZodEnum(values, params) {
    return new ZodEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodEnum,
        ...processCreateParams(params),
    });
}
class ZodEnum extends ZodType {
    _parse(input) {
        if (typeof input.data !== "string") {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                expected: util/* util */.ZS.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
            });
            return parseUtil/* INVALID */.uY;
        }
        if (!this._cache) {
            this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
            const ctx = this._getOrReturnCtx(input);
            const expectedValues = this._def.values;
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                received: ctx.data,
                code: ZodError/* ZodIssueCode */.eq.invalid_enum_value,
                options: expectedValues,
            });
            return parseUtil/* INVALID */.uY;
        }
        return (0,parseUtil.OK)(input.data);
    }
    get options() {
        return this._def.values;
    }
    get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
            enumValues[val] = val;
        }
        return enumValues;
    }
    extract(values, newDef = this._def) {
        return ZodEnum.create(values, {
            ...this._def,
            ...newDef,
        });
    }
    exclude(values, newDef = this._def) {
        return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
            ...this._def,
            ...newDef,
        });
    }
}
ZodEnum.create = createZodEnum;
class ZodNativeEnum extends ZodType {
    _parse(input) {
        const nativeEnumValues = util/* util */.ZS.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== util/* ZodParsedType */.Zp.string && ctx.parsedType !== util/* ZodParsedType */.Zp.number) {
            const expectedValues = util/* util */.ZS.objectValues(nativeEnumValues);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                expected: util/* util */.ZS.joinValues(expectedValues),
                received: ctx.parsedType,
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
            });
            return parseUtil/* INVALID */.uY;
        }
        if (!this._cache) {
            this._cache = new Set(util/* util */.ZS.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
            const expectedValues = util/* util */.ZS.objectValues(nativeEnumValues);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                received: ctx.data,
                code: ZodError/* ZodIssueCode */.eq.invalid_enum_value,
                options: expectedValues,
            });
            return parseUtil/* INVALID */.uY;
        }
        return (0,parseUtil.OK)(input.data);
    }
    get enum() {
        return this._def.values;
    }
}
ZodNativeEnum.create = (values, params) => {
    return new ZodNativeEnum({
        values: values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params),
    });
};
class ZodPromise extends ZodType {
    unwrap() {
        return this._def.type;
    }
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== util/* ZodParsedType */.Zp.promise && ctx.common.async === false) {
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.promise,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        const promisified = ctx.parsedType === util/* ZodParsedType */.Zp.promise ? ctx.data : Promise.resolve(ctx.data);
        return (0,parseUtil.OK)(promisified.then((data) => {
            return this._def.type.parseAsync(data, {
                path: ctx.path,
                errorMap: ctx.common.contextualErrorMap,
            });
        }));
    }
}
ZodPromise.create = (schema, params) => {
    return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params),
    });
};
class ZodEffects extends ZodType {
    innerType() {
        return this._def.schema;
    }
    sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects
            ? this._def.schema.sourceType()
            : this._def.schema;
    }
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
            addIssue: (arg) => {
                (0,parseUtil/* addIssueToContext */.zn)(ctx, arg);
                if (arg.fatal) {
                    status.abort();
                }
                else {
                    status.dirty();
                }
            },
            get path() {
                return ctx.path;
            },
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
            const processed = effect.transform(ctx.data, checkCtx);
            if (ctx.common.async) {
                return Promise.resolve(processed).then(async (processed) => {
                    if (status.value === "aborted")
                        return parseUtil/* INVALID */.uY;
                    const result = await this._def.schema._parseAsync({
                        data: processed,
                        path: ctx.path,
                        parent: ctx,
                    });
                    if (result.status === "aborted")
                        return parseUtil/* INVALID */.uY;
                    if (result.status === "dirty")
                        return (0,parseUtil/* DIRTY */.jm)(result.value);
                    if (status.value === "dirty")
                        return (0,parseUtil/* DIRTY */.jm)(result.value);
                    return result;
                });
            }
            else {
                if (status.value === "aborted")
                    return parseUtil/* INVALID */.uY;
                const result = this._def.schema._parseSync({
                    data: processed,
                    path: ctx.path,
                    parent: ctx,
                });
                if (result.status === "aborted")
                    return parseUtil/* INVALID */.uY;
                if (result.status === "dirty")
                    return (0,parseUtil/* DIRTY */.jm)(result.value);
                if (status.value === "dirty")
                    return (0,parseUtil/* DIRTY */.jm)(result.value);
                return result;
            }
        }
        if (effect.type === "refinement") {
            const executeRefinement = (acc) => {
                const result = effect.refinement(acc, checkCtx);
                if (ctx.common.async) {
                    return Promise.resolve(result);
                }
                if (result instanceof Promise) {
                    throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
                }
                return acc;
            };
            if (ctx.common.async === false) {
                const inner = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inner.status === "aborted")
                    return parseUtil/* INVALID */.uY;
                if (inner.status === "dirty")
                    status.dirty();
                // return value is ignored
                executeRefinement(inner.value);
                return { status: status.value, value: inner.value };
            }
            else {
                return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
                    if (inner.status === "aborted")
                        return parseUtil/* INVALID */.uY;
                    if (inner.status === "dirty")
                        status.dirty();
                    return executeRefinement(inner.value).then(() => {
                        return { status: status.value, value: inner.value };
                    });
                });
            }
        }
        if (effect.type === "transform") {
            if (ctx.common.async === false) {
                const base = this._def.schema._parseSync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (!(0,parseUtil/* isValid */.fn)(base))
                    return parseUtil/* INVALID */.uY;
                const result = effect.transform(base.value, checkCtx);
                if (result instanceof Promise) {
                    throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
                }
                return { status: status.value, value: result };
            }
            else {
                return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
                    if (!(0,parseUtil/* isValid */.fn)(base))
                        return parseUtil/* INVALID */.uY;
                    return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                        status: status.value,
                        value: result,
                    }));
                });
            }
        }
        util/* util */.ZS.assertNever(effect);
    }
}
ZodEffects.create = (schema, effect, params) => {
    return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params),
    });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
    return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params),
    });
};

class ZodOptional extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util/* ZodParsedType */.Zp.undefined) {
            return (0,parseUtil.OK)(undefined);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
}
ZodOptional.create = (type, params) => {
    return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params),
    });
};
class ZodNullable extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === util/* ZodParsedType */.Zp.null) {
            return (0,parseUtil.OK)(null);
        }
        return this._def.innerType._parse(input);
    }
    unwrap() {
        return this._def.innerType;
    }
}
ZodNullable.create = (type, params) => {
    return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params),
    });
};
class ZodDefault extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === util/* ZodParsedType */.Zp.undefined) {
            data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
            data,
            path: ctx.path,
            parent: ctx,
        });
    }
    removeDefault() {
        return this._def.innerType;
    }
}
ZodDefault.create = (type, params) => {
    return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params),
    });
};
class ZodCatch extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        // newCtx is used to not collect issues from inner types in ctx
        const newCtx = {
            ...ctx,
            common: {
                ...ctx.common,
                issues: [],
            },
        };
        const result = this._def.innerType._parse({
            data: newCtx.data,
            path: newCtx.path,
            parent: {
                ...newCtx,
            },
        });
        if ((0,parseUtil/* isAsync */.xP)(result)) {
            return result.then((result) => {
                return {
                    status: "valid",
                    value: result.status === "valid"
                        ? result.value
                        : this._def.catchValue({
                            get error() {
                                return new ZodError/* ZodError */.G(newCtx.common.issues);
                            },
                            input: newCtx.data,
                        }),
                };
            });
        }
        else {
            return {
                status: "valid",
                value: result.status === "valid"
                    ? result.value
                    : this._def.catchValue({
                        get error() {
                            return new ZodError/* ZodError */.G(newCtx.common.issues);
                        },
                        input: newCtx.data,
                    }),
            };
        }
    }
    removeCatch() {
        return this._def.innerType;
    }
}
ZodCatch.create = (type, params) => {
    return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params),
    });
};
class ZodNaN extends ZodType {
    _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== util/* ZodParsedType */.Zp.nan) {
            const ctx = this._getOrReturnCtx(input);
            (0,parseUtil/* addIssueToContext */.zn)(ctx, {
                code: ZodError/* ZodIssueCode */.eq.invalid_type,
                expected: util/* ZodParsedType */.Zp.nan,
                received: ctx.parsedType,
            });
            return parseUtil/* INVALID */.uY;
        }
        return { status: "valid", value: input.data };
    }
}
ZodNaN.create = (params) => {
    return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params),
    });
};
const BRAND = Symbol("zod_brand");
class ZodBranded extends ZodType {
    _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
            data,
            path: ctx.path,
            parent: ctx,
        });
    }
    unwrap() {
        return this._def.type;
    }
}
class ZodPipeline extends ZodType {
    _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
            const handleAsync = async () => {
                const inResult = await this._def.in._parseAsync({
                    data: ctx.data,
                    path: ctx.path,
                    parent: ctx,
                });
                if (inResult.status === "aborted")
                    return parseUtil/* INVALID */.uY;
                if (inResult.status === "dirty") {
                    status.dirty();
                    return (0,parseUtil/* DIRTY */.jm)(inResult.value);
                }
                else {
                    return this._def.out._parseAsync({
                        data: inResult.value,
                        path: ctx.path,
                        parent: ctx,
                    });
                }
            };
            return handleAsync();
        }
        else {
            const inResult = this._def.in._parseSync({
                data: ctx.data,
                path: ctx.path,
                parent: ctx,
            });
            if (inResult.status === "aborted")
                return parseUtil/* INVALID */.uY;
            if (inResult.status === "dirty") {
                status.dirty();
                return {
                    status: "dirty",
                    value: inResult.value,
                };
            }
            else {
                return this._def.out._parseSync({
                    data: inResult.value,
                    path: ctx.path,
                    parent: ctx,
                });
            }
        }
    }
    static create(a, b) {
        return new ZodPipeline({
            in: a,
            out: b,
            typeName: ZodFirstPartyTypeKind.ZodPipeline,
        });
    }
}
class ZodReadonly extends ZodType {
    _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
            if ((0,parseUtil/* isValid */.fn)(data)) {
                data.value = Object.freeze(data.value);
            }
            return data;
        };
        return (0,parseUtil/* isAsync */.xP)(result) ? result.then((data) => freeze(data)) : freeze(result);
    }
    unwrap() {
        return this._def.innerType;
    }
}
ZodReadonly.create = (type, params) => {
    return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params),
    });
};
////////////////////////////////////////
////////////////////////////////////////
//////////                    //////////
//////////      z.custom      //////////
//////////                    //////////
////////////////////////////////////////
////////////////////////////////////////
function cleanParams(params, data) {
    const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
    const p2 = typeof p === "string" ? { message: p } : p;
    return p2;
}
function custom(check, _params = {}, 
/**
 * @deprecated
 *
 * Pass `fatal` into the params object instead:
 *
 * ```ts
 * z.string().custom((val) => val.length > 5, { fatal: false })
 * ```
 *
 */
fatal) {
    if (check)
        return ZodAny.create().superRefine((data, ctx) => {
            const r = check(data);
            if (r instanceof Promise) {
                return r.then((r) => {
                    if (!r) {
                        const params = cleanParams(_params, data);
                        const _fatal = params.fatal ?? fatal ?? true;
                        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
                    }
                });
            }
            if (!r) {
                const params = cleanParams(_params, data);
                const _fatal = params.fatal ?? fatal ?? true;
                ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
            }
            return;
        });
    return ZodAny.create();
}

const late = {
    object: ZodObject.lazycreate,
};
var ZodFirstPartyTypeKind;
(function (ZodFirstPartyTypeKind) {
    ZodFirstPartyTypeKind["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
    ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
    ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
    ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
    ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
    ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
// requires TS 4.4+
class Class {
    constructor(..._) { }
}
const instanceOfType = (
// const instanceOfType = <T extends new (...args: any[]) => any>(
cls, params = {
    message: `Input not instance of ${cls.name}`,
}) => custom((data) => data instanceof cls, params);
const stringType = ZodString.create;
const numberType = ZodNumber.create;
const nanType = ZodNaN.create;
const bigIntType = ZodBigInt.create;
const booleanType = ZodBoolean.create;
const dateType = ZodDate.create;
const symbolType = ZodSymbol.create;
const undefinedType = ZodUndefined.create;
const nullType = ZodNull.create;
const anyType = ZodAny.create;
const unknownType = ZodUnknown.create;
const neverType = ZodNever.create;
const voidType = ZodVoid.create;
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const strictObjectType = ZodObject.strictCreate;
const unionType = ZodUnion.create;
const discriminatedUnionType = ZodDiscriminatedUnion.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const recordType = ZodRecord.create;
const mapType = ZodMap.create;
const setType = ZodSet.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const nativeEnumType = ZodNativeEnum.create;
const promiseType = ZodPromise.create;
const effectsType = ZodEffects.create;
const optionalType = ZodOptional.create;
const nullableType = ZodNullable.create;
const preprocessType = ZodEffects.createWithPreprocess;
const pipelineType = ZodPipeline.create;
const ostring = () => stringType().optional();
const onumber = () => numberType().optional();
const oboolean = () => booleanType().optional();
const coerce = {
    string: ((arg) => ZodString.create({ ...arg, coerce: true })),
    number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
    boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true,
    })),
    bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
    date: ((arg) => ZodDate.create({ ...arg, coerce: true })),
};

const NEVER = parseUtil/* INVALID */.uY;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "humanads-video-templates:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			792: 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkhumanads_video_templates"] = self["webpackChunkhumanads_video_templates"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
var exports = {};
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const remotion_1 = __webpack_require__(3626);
remotion_1.Internals.setupEnvVariables();
remotion_1.Internals.CSSUtils.injectCSS(`
  .css-reset, .css-reset * {
    font-size: 16px;
    line-height: 1.5;
    color: white;
    font-family: Arial, Helvetica, sans-serif;
    background: transparent;
    box-sizing: border-box;
  }

  .algolia-docsearch-suggestion--highlight {
    font-size: 15px;
    line-height: 1.25;
  }

  .__remotion-info-button-container code {
    font-family: monospace;
    font-size: 14px;
    color: #0584f2
  }

  .__remotion-vertical-scrollbar::-webkit-scrollbar {
      width: 6px;
  }
  .__remotion-vertical-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.0);
  }
  .__remotion-vertical-scrollbar:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.6);
  }
  .__remotion-vertical-scrollbar:hover::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 1);
  }


  .__remotion-horizontal-scrollbar::-webkit-scrollbar {
    height: 6px;
  }
  .__remotion-horizontal-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.0);
  }
  .__remotion-horizontal-scrollbar:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.6);
  }
  .__remotion-horizontal-scrollbar:hover::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 1);
  }


  @-moz-document url-prefix() {
    .__remotion-vertical-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0);
    }

    .__remotion-vertical-scrollbar:hover {
      scrollbar-color: rgba(0, 0, 0, 1) rgba(0, 0, 0, 0);
    }

    .__remotion-horizontal-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0);
    }

    .__remotion-horizontal-scrollbar:hover {
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 1) rgba(0, 0, 0, 0);
    }
  }


  .__remotion-timeline-slider {
    appearance: none;
    width: 100px;
    border-radius: 3px;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.1);
    accent-color: #ffffff;
  }
  
  .__remotion-timeline-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #ffffff;
    appearance: none;
  }



`);

})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {

// UNUSED EXPORTS: RemotionRoot

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(4848);
// EXTERNAL MODULE: ./node_modules/remotion/dist/cjs/index.js
var cjs = __webpack_require__(3626);
;// ./node_modules/@remotion/google-fonts/dist/esm/NotoSansJP.mjs
// src/base.ts

var loadedFonts = {};
var loadFonts = (meta, style, options) => {
  const promises = [];
  const styles = style ? [style] : Object.keys(meta.fonts);
  for (const style2 of styles) {
    if (typeof FontFace === "undefined") {
      continue;
    }
    if (!meta.fonts[style2]) {
      throw new Error(`The font ${meta.fontFamily} does not have a style ${style2}`);
    }
    const weights = options?.weights ?? Object.keys(meta.fonts[style2]);
    for (const weight of weights) {
      if (!meta.fonts[style2][weight]) {
        throw new Error(`The font ${meta.fontFamily} does not  have a weight ${weight} in style ${style2}`);
      }
      const subsets = options?.subsets ?? Object.keys(meta.fonts[style2][weight]);
      for (const subset of subsets) {
        let font = meta.fonts[style2]?.[weight]?.[subset];
        if (!font) {
          throw new Error(`weight: ${weight} subset: ${subset} is not available for '${meta.fontFamily}'`);
        }
        let fontKey = `${meta.fontFamily}-${style2}-${weight}-${subset}`;
        const previousPromise = loadedFonts[fontKey];
        if (previousPromise) {
          promises.push(previousPromise);
          continue;
        }
        const handle = (0,cjs.delayRender)(`Fetching ${meta.fontFamily} font ${JSON.stringify({
          style: style2,
          weight,
          subset
        })}`, { timeoutInMilliseconds: 60000 });
        const fontFace = new FontFace(meta.fontFamily, `url(${font}) format('woff2')`, {
          weight,
          style: style2,
          unicodeRange: meta.unicodeRanges[subset]
        });
        let attempts = 2;
        const tryToLoad = () => {
          const promise = fontFace.load().then(() => {
            (options?.document ?? document).fonts.add(fontFace);
            (0,cjs.continueRender)(handle);
          }).catch((err) => {
            loadedFonts[fontKey] = undefined;
            if (attempts === 0) {
              throw err;
            } else {
              attempts--;
              tryToLoad();
            }
          });
          loadedFonts[fontKey] = promise;
          promises.push(promise);
        };
        tryToLoad();
      }
    }
  }
  return {
    fontFamily: meta.fontFamily,
    fonts: meta.fonts,
    unicodeRanges: meta.unicodeRanges,
    waitUntilDone: () => Promise.all(promises).then(() => {
      return;
    })
  };
};

// src/NotoSansJP.ts
var getInfo = () => ({
  fontFamily: "Noto Sans JP",
  importName: "NotoSansJP",
  version: "v52",
  url: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900",
  unicodeRanges: {
    "[0]": "U+25ee8, U+25f23, U+25f5c, U+25fd4, U+25fe0, U+25ffb, U+2600c, U+26017, U+26060, U+260ed, U+26222, U+2626a, U+26270, U+26286, U+2634c, U+26402, U+2667e, U+266b0, U+2671d, U+268dd, U+268ea, U+26951, U+2696f, U+26999, U+269dd, U+26a1e, U+26a58, U+26a8c, U+26ab7, U+26aff, U+26c29, U+26c73, U+26c9e, U+26cdd, U+26e40, U+26e65, U+26f94, U+26ff6-26ff8, U+270f4, U+2710d, U+27139, U+273da-273db, U+273fe, U+27410, U+27449, U+27614-27615, U+27631, U+27684, U+27693, U+2770e, U+27723, U+27752, U+278b2, U+27985, U+279b4, U+27a84, U+27bb3, U+27bbe, U+27bc7, U+27c3c, U+27cb8, U+27d73, U+27da0, U+27e10, U+27eaf, U+27fb7, U+2808a, U+280bb, U+28277, U+28282, U+282f3, U+283cd, U+2840c, U+28455, U+284dc, U+2856b, U+285c8-285c9, U+286d7, U+286fa, U+28946, U+28949, U+2896b, U+28987-28988, U+289ba-289bb, U+28a1e, U+28a29, U+28a43, U+28a71, U+28a99, U+28acd, U+28add, U+28ae4, U+28bc1, U+28bef, U+28cdd, U+28d10, U+28d71, U+28dfb, U+28e0f, U+28e17, U+28e1f, U+28e36, U+28e89, U+28eeb, U+28ef6, U+28f32, U+28ff8, U+292a0, U+292b1, U+29490, U+295cf, U+2967f, U+296f0, U+29719, U+29750, U+29810, U+298c6, U+29a72, U+29d4b, U+29ddb, U+29e15, U+29e3d, U+29e49, U+29e8a, U+29ec4, U+29edb, U+29ee9, U+29fce, U+29fd7, U+2a01a, U+2a02f, U+2a082, U+2a0f9, U+2a190, U+2a2b2, U+2a38c, U+2a437, U+2a5f1, U+2a602, U+2a61a, U+2a6b2, U+2a9e6, U+2b746, U+2b751, U+2b753, U+2b75a, U+2b75c, U+2b765, U+2b776-2b777, U+2b77c, U+2b782, U+2b789, U+2b78b, U+2b78e, U+2b794, U+2b7ac, U+2b7af, U+2b7bd, U+2b7c9, U+2b7cf, U+2b7d2, U+2b7d8, U+2b7f0, U+2b80d, U+2b817, U+2b81a, U+2d544, U+2e278, U+2e569, U+2e6ea, U+2f804, U+2f80f, U+2f815, U+2f818, U+2f81a, U+2f822, U+2f828, U+2f82c, U+2f833, U+2f83f, U+2f846, U+2f852, U+2f862, U+2f86d, U+2f873, U+2f877, U+2f884, U+2f899-2f89a, U+2f8a6, U+2f8ac, U+2f8b2, U+2f8b6, U+2f8d3, U+2f8db-2f8dc, U+2f8e1, U+2f8e5, U+2f8ea, U+2f8ed, U+2f8fc, U+2f903, U+2f90b, U+2f90f, U+2f91a, U+2f920-2f921, U+2f945, U+2f947, U+2f96c, U+2f995, U+2f9d0, U+2f9de-2f9df, U+2f9f4",
    "[1]": "U+1f235-1f23b, U+1f240-1f248, U+1f250-1f251, U+2000b, U+20089-2008a, U+200a2, U+200a4, U+200b0, U+200f5, U+20158, U+201a2, U+20213, U+2032b, U+20371, U+20381, U+203f9, U+2044a, U+20509, U+2053f, U+205b1, U+205d6, U+20611, U+20628, U+206ec, U+2074f, U+207c8, U+20807, U+2083a, U+208b9, U+2090e, U+2097c, U+20984, U+2099d, U+20a64, U+20ad3, U+20b1d, U+20b9f, U+20bb7, U+20d45, U+20d58, U+20de1, U+20e64, U+20e6d, U+20e95, U+20f5f, U+21201, U+2123d, U+21255, U+21274, U+2127b, U+212d7, U+212e4, U+212fd, U+2131b, U+21336, U+21344, U+213c4, U+2146d-2146e, U+215d7, U+21647, U+216b4, U+21706, U+21742, U+218bd, U+219c3, U+21a1a, U+21c56, U+21d2d, U+21d45, U+21d62, U+21d78, U+21d92, U+21d9c, U+21da1, U+21db7, U+21de0, U+21e33-21e34, U+21f1e, U+21f76, U+21ffa, U+2217b, U+22218, U+2231e, U+223ad, U+22609, U+226f3, U+2285b, U+228ab, U+2298f, U+22ab8, U+22b46, U+22b4f-22b50, U+22ba6, U+22c1d, U+22c24, U+22de1, U+22e42, U+22feb, U+231b6, U+231c3-231c4, U+231f5, U+23372, U+233cc, U+233d0, U+233d2-233d3, U+233d5, U+233da, U+233df, U+233e4, U+233fe, U+2344a-2344b, U+23451, U+23465, U+234e4, U+2355a, U+23594, U+235c4, U+23638-2363a, U+23647, U+2370c, U+2371c, U+2373f, U+23763-23764, U+237e7, U+237f1, U+237ff, U+23824, U+2383d, U+23a98, U+23c7f, U+23cbe, U+23cfe, U+23d00, U+23d0e, U+23d40, U+23dd3, U+23df9-23dfa, U+23f7e, U+2404b, U+24096, U+24103, U+241c6, U+241fe, U+242ee, U+243bc, U+243d0, U+24629, U+246a5, U+247f1, U+24896, U+248e9, U+24a4d, U+24b56, U+24b6f, U+24c16, U+24d14, U+24e04, U+24e0e, U+24e37, U+24e6a, U+24e8b, U+24ff2, U+2504a, U+25055, U+25122, U+251a9, U+251cd, U+251e5, U+2521e, U+2524c, U+2542e, U+2548e, U+254d9, U+2550e, U+255a7, U+2567f, U+25771, U+257a9, U+257b4, U+25874, U+259c4, U+259cc, U+259d4, U+25ad7, U+25ae3-25ae4, U+25af1, U+25bb2, U+25c4b, U+25c64, U+25da1, U+25e2e, U+25e56, U+25e62, U+25e65, U+25ec2, U+25ed8",
    "[2]": "U+ffd7, U+ffda-ffdc, U+ffe0-ffe2, U+ffe4, U+ffe6, U+ffe8-ffee, U+1f100-1f10c, U+1f110-1f16c, U+1f170-1f1ac, U+1f200-1f202, U+1f210-1f234",
    "[3]": "U+fa10, U+fa12-fa6d, U+fb00-fb04, U+fe10-fe19, U+fe30-fe42, U+fe44-fe52, U+fe54-fe66, U+fe68-fe6b, U+ff02, U+ff04, U+ff07, U+ff51, U+ff5b, U+ff5d, U+ff5f-ff60, U+ff66, U+ff69, U+ff87, U+ffa1-ffbe, U+ffc2-ffc7, U+ffca-ffcf, U+ffd2-ffd6",
    "[4]": "U+f92d-f959, U+f95b-f9f2, U+f9f4-fa0b, U+fa0e-fa0f",
    "[5]": "U+9e8b-9e8c, U+9e8e-9e8f, U+9e91-9e92, U+9e95-9e96, U+9e98, U+9e9b, U+9e9d-9e9e, U+9ea4-9ea5, U+9ea8-9eaa, U+9eac-9eb0, U+9eb3-9eb5, U+9eb8, U+9ebc-9ebf, U+9ec3, U+9ec6, U+9ec8, U+9ecb-9ecd, U+9ecf-9ed1, U+9ed4-9ed5, U+9ed8, U+9edb-9ee0, U+9ee4-9ee5, U+9ee7-9ee8, U+9eec-9ef2, U+9ef4-9ef9, U+9efb-9eff, U+9f02-9f03, U+9f07-9f09, U+9f0e-9f12, U+9f14-9f17, U+9f19-9f1b, U+9f1f-9f22, U+9f26, U+9f2a-9f2c, U+9f2f, U+9f31-9f32, U+9f34, U+9f37, U+9f39-9f3a, U+9f3c-9f3f, U+9f41, U+9f43-9f47, U+9f4a, U+9f4e-9f50, U+9f52-9f58, U+9f5a, U+9f5d-9f61, U+9f63, U+9f66-9f6a, U+9f6c-9f73, U+9f75-9f77, U+9f7a, U+9f7d, U+9f7f, U+9f8f-9f92, U+9f94-9f97, U+9f99, U+9f9c-9fa3, U+9fa5, U+9fb4, U+9fbc-9fc2, U+9fc4, U+9fc6, U+9fcc, U+f900-f92c",
    "[6]": "U+9c3e, U+9c41, U+9c43-9c4a, U+9c4e-9c50, U+9c52-9c54, U+9c56, U+9c58, U+9c5a-9c61, U+9c63, U+9c65, U+9c67-9c6b, U+9c6d-9c6e, U+9c70, U+9c72, U+9c75-9c78, U+9c7a-9c7c, U+9ce6-9ce7, U+9ceb-9cec, U+9cf0, U+9cf2, U+9cf6-9cf7, U+9cf9, U+9d02-9d03, U+9d06-9d09, U+9d0b, U+9d0e, U+9d11-9d12, U+9d15, U+9d17-9d18, U+9d1b-9d1f, U+9d23, U+9d26, U+9d2a-9d2c, U+9d2f-9d30, U+9d32-9d34, U+9d3a, U+9d3c-9d3f, U+9d41-9d48, U+9d4a, U+9d50-9d54, U+9d59, U+9d5d-9d65, U+9d69-9d6c, U+9d6f-9d70, U+9d72-9d73, U+9d76-9d77, U+9d7a-9d7c, U+9d7e, U+9d83-9d84, U+9d86-9d87, U+9d89-9d8a, U+9d8d-9d8e, U+9d92-9d93, U+9d95-9d9a, U+9da1, U+9da4, U+9da9-9dac, U+9dae, U+9db1-9db2, U+9db5, U+9db8-9dbd, U+9dbf-9dc4, U+9dc6-9dc7, U+9dc9-9dca, U+9dcf, U+9dd3-9dd7, U+9dd9-9dda, U+9dde-9de0, U+9de3, U+9de5-9de7, U+9de9, U+9deb, U+9ded-9df0, U+9df3-9df4, U+9df8, U+9dfd-9dfe, U+9e02, U+9e07, U+9e0a, U+9e0d-9e0e, U+9e10-9e12, U+9e15-9e16, U+9e19-9e1f, U+9e75, U+9e79-9e7d, U+9e80-9e85, U+9e87-9e88",
    "[7]": "U+9ae5-9ae7, U+9ae9, U+9aeb-9aec, U+9aee-9aef, U+9af1-9af5, U+9af7, U+9af9-9afb, U+9afd, U+9aff-9b06, U+9b08-9b09, U+9b0b-9b0e, U+9b10, U+9b12, U+9b16, U+9b18-9b1d, U+9b1f-9b20, U+9b22-9b23, U+9b25-9b2f, U+9b32-9b35, U+9b37, U+9b39-9b3b, U+9b3d, U+9b43-9b44, U+9b48, U+9b4b-9b4f, U+9b51, U+9b55-9b58, U+9b5b, U+9b5e, U+9b61, U+9b63, U+9b65-9b66, U+9b68, U+9b6a-9b6f, U+9b72-9b79, U+9b7f-9b80, U+9b83-9b87, U+9b89-9b8b, U+9b8d, U+9b8f-9b94, U+9b96-9b97, U+9b9a, U+9b9d-9ba0, U+9ba6-9ba7, U+9ba9-9baa, U+9bac, U+9bb0-9bb2, U+9bb4, U+9bb7-9bb9, U+9bbb-9bbc, U+9bbe-9bc1, U+9bc6-9bc8, U+9bca, U+9bce-9bd2, U+9bd4, U+9bd7-9bd8, U+9bdd, U+9bdf, U+9be1-9be5, U+9be7, U+9bea-9beb, U+9bee-9bf3, U+9bf5, U+9bf7-9bfa, U+9bfd, U+9bff-9c00, U+9c02, U+9c04, U+9c06, U+9c08-9c0d, U+9c0f-9c16, U+9c18-9c1e, U+9c21-9c2a, U+9c2d-9c32, U+9c35-9c37, U+9c39-9c3a, U+9c3d",
    "[8]": "U+98eb, U+98ed-98ee, U+98f0-98f1, U+98f3, U+98f6, U+9902, U+9907-9909, U+9911-9912, U+9914-9918, U+991a-9922, U+9924, U+9926-9927, U+992b-992c, U+992e, U+9931-9935, U+9939-993e, U+9940-9942, U+9945-9949, U+994b-994e, U+9950-9952, U+9954-9955, U+9958-9959, U+995b-995c, U+995e-9960, U+9963, U+9997-9998, U+999b, U+999d-999f, U+99a3, U+99a5-99a6, U+99a8, U+99ad-99ae, U+99b0-99b2, U+99b5, U+99b9-99ba, U+99bc-99bd, U+99bf, U+99c1, U+99c3, U+99c8-99c9, U+99d1, U+99d3-99d5, U+99d8-99df, U+99e1-99e2, U+99e7, U+99ea-99ee, U+99f0-99f2, U+99f4-99f5, U+99f8-99f9, U+99fb-99fe, U+9a01-9a05, U+9a08, U+9a0a-9a0c, U+9a0f-9a11, U+9a16, U+9a1a, U+9a1e, U+9a20, U+9a22-9a24, U+9a27, U+9a2b, U+9a2d-9a2e, U+9a31, U+9a33, U+9a35-9a38, U+9a3e, U+9a40-9a45, U+9a47, U+9a4a-9a4e, U+9a51-9a52, U+9a54-9a58, U+9a5b, U+9a5d, U+9a5f, U+9a62, U+9a64-9a65, U+9a69-9a6c, U+9aaa, U+9aac-9ab0, U+9ab2, U+9ab4-9ab7, U+9ab9, U+9abb-9ac1, U+9ac3, U+9ac6, U+9ac8, U+9ace-9ad3, U+9ad5-9ad7, U+9adb-9adc, U+9ade-9ae0, U+9ae2-9ae4",
    "[9]": "U+971d, U+9721-9724, U+9728, U+972a, U+9730-9731, U+9733, U+9736, U+9738-9739, U+973b, U+973d-973e, U+9741-9744, U+9746-974a, U+974d-974f, U+9751, U+9755, U+9757-9758, U+975a-975c, U+9760-9761, U+9763-9764, U+9766-9768, U+976a-976b, U+976e, U+9771, U+9773, U+9776-977d, U+977f-9781, U+9785-9786, U+9789, U+978b, U+978f-9790, U+9795-9797, U+9799-979a, U+979c, U+979e-97a0, U+97a2-97a3, U+97a6, U+97a8, U+97ab-97ac, U+97ae, U+97b1-97b6, U+97b8-97ba, U+97bc, U+97be-97bf, U+97c1, U+97c3-97ce, U+97d0-97d1, U+97d4, U+97d7-97d9, U+97db-97de, U+97e0-97e1, U+97e4, U+97e6, U+97ed-97ef, U+97f1-97f2, U+97f4-97f8, U+97fa, U+9804, U+9807, U+980a, U+980c-980f, U+9814, U+9816-9817, U+9819-981a, U+981c, U+981e, U+9820-9821, U+9823-9826, U+982b, U+982e-9830, U+9832-9835, U+9837, U+9839, U+983d-983e, U+9844, U+9846-9847, U+984a-984b, U+984f, U+9851-9853, U+9856-9857, U+9859-985b, U+9862-9863, U+9865-9866, U+986a-986c, U+986f-9871, U+9873-9875, U+98aa-98ab, U+98ad-98ae, U+98b0-98b1, U+98b4, U+98b6-98b8, U+98ba-98bc, U+98bf, U+98c2-98c8, U+98cb-98cc, U+98ce, U+98dc, U+98de, U+98e0-98e1, U+98e3, U+98e5-98e7, U+98e9-98ea",
    "[10]": "U+944a, U+944c, U+9452-9453, U+9455, U+9459-945c, U+945e-9463, U+9468, U+946a-946b, U+946d-9472, U+9475, U+9477, U+947c-947f, U+9481, U+9483-9485, U+9578-9579, U+957e-957f, U+9582, U+9584, U+9586-9588, U+958a, U+958c-958f, U+9592, U+9594, U+9596, U+9598-9599, U+959d-95a1, U+95a4, U+95a6-95a9, U+95ab-95ad, U+95b1, U+95b4, U+95b6, U+95b9-95bf, U+95c3, U+95c6, U+95c8-95cd, U+95d0-95d6, U+95d9-95da, U+95dc-95e2, U+95e4-95e6, U+95e8, U+961d-961e, U+9621-9622, U+9624-9626, U+9628, U+962c, U+962e-962f, U+9631, U+9633-9634, U+9637-963a, U+963c-963d, U+9641-9642, U+964b-964c, U+964f, U+9652, U+9654, U+9656-9658, U+965c-965f, U+9661, U+9666, U+966a, U+966c, U+966e, U+9672, U+9674, U+9677, U+967b-967c, U+967e-967f, U+9681-9684, U+9689, U+968b, U+968d, U+9691, U+9695-9698, U+969a, U+969d, U+969f, U+96a4-96aa, U+96ae-96b4, U+96b6, U+96b8-96bb, U+96bd, U+96c1, U+96c9-96cb, U+96cd-96ce, U+96d2, U+96d5-96d6, U+96d8-96da, U+96dc-96df, U+96e9, U+96ef, U+96f1, U+96f9-96fa, U+9702-9706, U+9708-9709, U+970d-970f, U+9711, U+9713-9714, U+9716, U+9719-971b",
    "[11]": "U+92bc-92bd, U+92bf-92c3, U+92c5-92c8, U+92cb-92d0, U+92d2-92d3, U+92d5, U+92d7-92d9, U+92dc-92dd, U+92df-92e1, U+92e3-92e5, U+92e7-92ea, U+92ec, U+92ee, U+92f0, U+92f2, U+92f7-92fb, U+92ff-9300, U+9302, U+9304, U+9308, U+930d, U+930f-9311, U+9314-9315, U+9318-931a, U+931c-931f, U+9321-9325, U+9327-932b, U+932e, U+9333-9337, U+933a-933b, U+9344, U+9347-934a, U+934d, U+9350-9352, U+9354-9358, U+935a, U+935c, U+935e, U+9360, U+9364-9365, U+9367, U+9369-936d, U+936f-9371, U+9373-9374, U+9376, U+937a, U+937d-9382, U+9388, U+938a-938b, U+938d, U+938f, U+9392, U+9394-9395, U+9397-9398, U+939a-939b, U+939e, U+93a1, U+93a3-93a4, U+93a6, U+93a8-93a9, U+93ab-93ad, U+93b0, U+93b4-93b6, U+93b9-93bb, U+93c1, U+93c3-93cd, U+93d0-93d1, U+93d3, U+93d6-93d9, U+93dc-93df, U+93e2, U+93e4-93e8, U+93f1, U+93f5, U+93f7-93fb, U+93fd, U+9401-9404, U+9407-9409, U+940d-9410, U+9413-9417, U+9419-941a, U+941f, U+9421, U+942b, U+942e-942f, U+9431-9434, U+9436, U+9438, U+943a-943b, U+943d, U+943f, U+9441, U+9443-9445, U+9448",
    "[12]": "U+9143, U+9146-914c, U+914f, U+9153, U+9156-915b, U+9161, U+9163-9165, U+9167, U+9169, U+916d, U+9172-9174, U+9179-917b, U+9181-9183, U+9185-9187, U+9189-918b, U+918e, U+9191, U+9193-9195, U+9197-9198, U+919e, U+91a1-91a2, U+91a6, U+91a8, U+91aa-91b6, U+91ba-91bd, U+91bf-91c6, U+91c9, U+91cb, U+91d0, U+91d3-91d4, U+91d6-91d7, U+91d9-91db, U+91de-91df, U+91e1, U+91e4-91e6, U+91e9-91ea, U+91ec-91f1, U+91f5-91f7, U+91f9, U+91fb-91fd, U+91ff-9201, U+9204-9207, U+9209-920a, U+920c, U+920e, U+9210-9218, U+921c-921e, U+9223-9226, U+9228-9229, U+922c, U+922e-9230, U+9233, U+9235-923a, U+923c, U+923e-9240, U+9242-9243, U+9245-924b, U+924d-9251, U+9256-925a, U+925c-925e, U+9260-9261, U+9264-9269, U+926e-9270, U+9275-9279, U+927b-927f, U+9288-928a, U+928d-928e, U+9291-9293, U+9295-9297, U+9299, U+929b-929c, U+929f-92a0, U+92a4-92a5, U+92a7-92a8, U+92ab, U+92af, U+92b2-92b3, U+92b6-92bb",
    "[13]": "U+8f52-8f55, U+8f57-8f58, U+8f5c-8f5e, U+8f61-8f66, U+8f9c-8f9d, U+8f9f-8fa2, U+8fa4-8fa8, U+8fad-8faf, U+8fb4-8fb8, U+8fbe, U+8fc0-8fc2, U+8fc6, U+8fc8, U+8fca-8fcb, U+8fcd, U+8fd0, U+8fd2-8fd3, U+8fd5, U+8fda, U+8fe0, U+8fe2-8fe5, U+8fe8-8fea, U+8fed-8fef, U+8ff1, U+8ff4-8ff6, U+8ff8-8ffb, U+8ffe, U+9002, U+9004-9005, U+9008, U+900b-900e, U+9011, U+9013, U+9015-9016, U+9018, U+901b, U+901e, U+9021, U+9027-902a, U+902c-902d, U+902f, U+9033-9037, U+9039, U+903c, U+903e-903f, U+9041, U+9043-9044, U+9049, U+904c, U+904f-9052, U+9056, U+9058, U+905b-905e, U+9062, U+9066-9068, U+906c, U+906f-9070, U+9072, U+9074, U+9076, U+9079, U+9080-9083, U+9085, U+9087-9088, U+908b-908c, U+908e-9090, U+9095, U+9097-9099, U+909b, U+90a0-90a2, U+90a5, U+90a8, U+90af-90b6, U+90bd-90be, U+90c3-90c5, U+90c7-90c9, U+90cc, U+90d2, U+90d5, U+90d7-90d9, U+90db-90df, U+90e2, U+90e4-90e5, U+90eb, U+90ef-90f0, U+90f2, U+90f4, U+90f6, U+90fe-9100, U+9102, U+9104-9106, U+9108, U+910d, U+9110, U+9112, U+9114-911a, U+911c, U+911e, U+9120, U+9122-9123, U+9125, U+9127, U+9129, U+912d-9132, U+9134, U+9136-9137, U+9139-913a, U+913c-913d",
    "[14]": "U+8dc0, U+8dc2, U+8dc5-8dc8, U+8dca-8dcc, U+8dce-8dcf, U+8dd1, U+8dd4-8dd7, U+8dd9-8ddb, U+8ddf, U+8de3-8de5, U+8de7, U+8dea-8dec, U+8df0-8df2, U+8df4, U+8dfc-8dfd, U+8dff, U+8e01, U+8e04-8e06, U+8e08-8e09, U+8e0b-8e0c, U+8e10-8e11, U+8e14, U+8e16, U+8e1d-8e23, U+8e26-8e27, U+8e30-8e31, U+8e33-8e39, U+8e3d, U+8e40-8e42, U+8e44, U+8e47-8e50, U+8e54-8e55, U+8e59, U+8e5b-8e64, U+8e69, U+8e6c-8e6d, U+8e6f-8e72, U+8e75-8e77, U+8e79-8e7c, U+8e81-8e85, U+8e89, U+8e8b, U+8e90-8e95, U+8e98-8e9b, U+8e9d-8e9e, U+8ea1-8ea2, U+8ea7, U+8ea9-8eaa, U+8eac-8eb1, U+8eb3, U+8eb5-8eb6, U+8eba-8ebb, U+8ebe, U+8ec0-8ec1, U+8ec3-8ec8, U+8ecb, U+8ecf, U+8ed1, U+8ed4, U+8edb-8edc, U+8ee3, U+8ee8, U+8eeb, U+8eed-8eee, U+8ef0-8ef1, U+8ef7, U+8ef9-8efc, U+8efe, U+8f00, U+8f02, U+8f05, U+8f07-8f08, U+8f0a, U+8f0f-8f10, U+8f12-8f13, U+8f15-8f19, U+8f1b-8f1c, U+8f1e-8f21, U+8f23, U+8f25-8f28, U+8f2b-8f2f, U+8f33-8f37, U+8f39-8f3b, U+8f3e, U+8f40-8f43, U+8f45-8f47, U+8f49-8f4a, U+8f4c-8f4f, U+8f51",
    "[15]": "U+8b2d, U+8b30, U+8b37, U+8b3c, U+8b3e, U+8b41-8b46, U+8b48-8b49, U+8b4c-8b4f, U+8b51-8b54, U+8b56, U+8b59, U+8b5b, U+8b5e-8b5f, U+8b63, U+8b69, U+8b6b-8b6d, U+8b6f, U+8b71, U+8b74, U+8b76, U+8b78-8b79, U+8b7c-8b81, U+8b84-8b85, U+8b8a-8b8f, U+8b92-8b96, U+8b99-8b9a, U+8b9c-8ba0, U+8c38-8c3a, U+8c3d-8c3f, U+8c41, U+8c45, U+8c47-8c49, U+8c4b-8c4c, U+8c4e-8c51, U+8c53-8c55, U+8c57-8c59, U+8c5b, U+8c5d, U+8c62-8c64, U+8c66, U+8c68-8c69, U+8c6b-8c6d, U+8c73, U+8c75-8c76, U+8c78, U+8c7a-8c7c, U+8c7e, U+8c82, U+8c85-8c87, U+8c89-8c8b, U+8c8d-8c8e, U+8c90, U+8c92-8c94, U+8c98-8c99, U+8c9b-8c9c, U+8c9f, U+8ca4, U+8cad-8cae, U+8cb2-8cb3, U+8cb6, U+8cb9-8cba, U+8cbd, U+8cc1-8cc2, U+8cc4-8cc6, U+8cc8-8cc9, U+8ccb, U+8ccd-8ccf, U+8cd2, U+8cd5-8cd6, U+8cd9-8cda, U+8cdd, U+8ce1, U+8ce3-8ce4, U+8ce6, U+8ce8, U+8cec, U+8cef-8cf2, U+8cf4-8cf5, U+8cf7-8cf8, U+8cfa-8cfb, U+8cfd-8cff, U+8d01, U+8d03-8d04, U+8d07, U+8d09-8d0b, U+8d0d-8d10, U+8d12-8d14, U+8d16-8d17, U+8d1b-8d1d, U+8d65, U+8d67, U+8d69, U+8d6b-8d6e, U+8d71, U+8d73, U+8d76, U+8d7f, U+8d81-8d82, U+8d84, U+8d88, U+8d8d, U+8d90-8d91, U+8d95, U+8d99, U+8d9e-8da0, U+8da6, U+8da8, U+8dab-8dac, U+8daf, U+8db2, U+8db5, U+8db7, U+8db9-8dbc, U+8dbe",
    "[16]": "U+8973-8975, U+8977, U+897a-897e, U+8980, U+8983, U+8988-898a, U+898d, U+8990, U+8993-8995, U+8998, U+899b-899c, U+899f-89a1, U+89a5-89a6, U+89a9, U+89ac, U+89af-89b0, U+89b2, U+89b4-89b7, U+89ba, U+89bc-89bd, U+89bf-89c1, U+89d4-89d8, U+89da, U+89dc-89dd, U+89e5, U+89e7, U+89e9, U+89eb, U+89ed, U+89f1, U+89f3-89f4, U+89f6, U+89f8-89f9, U+89fd, U+89ff, U+8a01, U+8a04-8a05, U+8a07, U+8a0c, U+8a0f-8a12, U+8a14-8a16, U+8a1b, U+8a1d-8a1e, U+8a20-8a22, U+8a24-8a26, U+8a2b-8a2c, U+8a2f, U+8a35-8a37, U+8a3b, U+8a3d-8a3e, U+8a40-8a41, U+8a43, U+8a45-8a49, U+8a4d-8a4e, U+8a51-8a54, U+8a56-8a58, U+8a5b-8a5d, U+8a61-8a62, U+8a65, U+8a67, U+8a6c-8a6d, U+8a75-8a77, U+8a79-8a7c, U+8a7e-8a80, U+8a82-8a86, U+8a8b, U+8a8f-8a92, U+8a96-8a97, U+8a99-8a9a, U+8a9f, U+8aa1, U+8aa3, U+8aa5-8aaa, U+8aae-8aaf, U+8ab3, U+8ab6-8ab7, U+8abb-8abc, U+8abe, U+8ac2-8ac4, U+8ac6, U+8ac8-8aca, U+8acc-8acd, U+8ad0-8ad1, U+8ad3-8ad5, U+8ad7, U+8ada-8ae2, U+8ae4, U+8ae7, U+8aeb-8aec, U+8aee, U+8af0-8af1, U+8af3-8af7, U+8afa, U+8afc, U+8aff, U+8b01-8b02, U+8b04-8b07, U+8b0a-8b0d, U+8b0f-8b11, U+8b14, U+8b16, U+8b1a, U+8b1c, U+8b1e-8b20, U+8b26, U+8b28, U+8b2b-8b2c",
    "[17]": "U+87e2-87e6, U+87ea-87ed, U+87ef, U+87f1, U+87f3, U+87f5-87f8, U+87fa-87fb, U+87fe-87ff, U+8801, U+8803, U+8805-8807, U+8809-880b, U+880d-8816, U+8818-881c, U+881e-881f, U+8821-8822, U+8827-8828, U+882d-882e, U+8830-8832, U+8835-8836, U+8839-883c, U+8841-8845, U+8848-884b, U+884d-884e, U+8851-8852, U+8855-8856, U+8858-885a, U+885c, U+885e-8860, U+8862, U+8864, U+8869, U+886b, U+886e-886f, U+8871-8872, U+8875, U+8877, U+8879, U+887b, U+887d-887e, U+8880-8882, U+8888, U+888d, U+8892, U+8897-889c, U+889e-88a0, U+88a2, U+88a4, U+88a8, U+88aa, U+88ae, U+88b0-88b1, U+88b5, U+88b7, U+88ba, U+88bc-88c0, U+88c3-88c4, U+88c6, U+88ca-88ce, U+88d1-88d4, U+88d8-88d9, U+88db, U+88dd-88e1, U+88e7-88e8, U+88ef-88f2, U+88f4-88f5, U+88f7, U+88f9, U+88fc, U+8901-8902, U+8904, U+8906, U+890a, U+890c-890f, U+8913, U+8915-8916, U+8918-891a, U+891c-891e, U+8920, U+8925-8928, U+892a-892b, U+8930-8932, U+8935-893b, U+893e, U+8940-8946, U+8949, U+894c-894d, U+894f, U+8952, U+8956-8957, U+895a-895c, U+895e, U+8960-8964, U+8966, U+896a-896b, U+896d-8970",
    "[18]": "U+8655-8659, U+865b, U+865d-8664, U+8667, U+8669, U+866c, U+866f, U+8671, U+8675-8677, U+867a-867b, U+867d, U+8687-8689, U+868b-868d, U+8691, U+8693, U+8695-8696, U+8698, U+869a, U+869c-869d, U+86a1, U+86a3-86a4, U+86a6-86ab, U+86ad, U+86af-86b1, U+86b3-86b9, U+86bf-86c1, U+86c3-86c6, U+86c9, U+86cb, U+86ce, U+86d1-86d2, U+86d4-86d5, U+86d7, U+86da, U+86dc, U+86de-86e0, U+86e3-86e7, U+86e9, U+86ec-86ed, U+86ef, U+86f8-86fe, U+8700, U+8703-870b, U+870d-8714, U+8719-871a, U+871e-871f, U+8721-8723, U+8725, U+8728-8729, U+872e-872f, U+8731-8732, U+8734, U+8737, U+8739-8740, U+8743, U+8745, U+8749, U+874b-874e, U+8751, U+8753, U+8755, U+8757-8759, U+875d, U+875f-8761, U+8763-8766, U+8768, U+876a, U+876e-876f, U+8771-8772, U+8774, U+8778, U+877b-877c, U+877f, U+8782-8789, U+878b-878c, U+878e, U+8790, U+8793, U+8795, U+8797-8799, U+879e-87a0, U+87a2-87a3, U+87a7, U+87ab-87af, U+87b1, U+87b3, U+87b5, U+87bb, U+87bd-87c1, U+87c4, U+87c6-87cb, U+87ce, U+87d0, U+87d2, U+87d5-87d6, U+87d9-87da, U+87dc, U+87df-87e0",
    "[19]": "U+84b4, U+84b9-84bb, U+84bd-84c2, U+84c6-84ca, U+84cc-84d1, U+84d3, U+84d6, U+84d9-84da, U+84dc, U+84e7, U+84ea, U+84ec, U+84ef-84f2, U+84f4, U+84f7, U+84fa-84fd, U+84ff-8500, U+8502-8503, U+8506-8507, U+850c, U+850e, U+8510, U+8514-8515, U+8517-8518, U+851a-851c, U+851e-851f, U+8521-8525, U+8527, U+852a-852c, U+852f, U+8532-8534, U+8536, U+853e-8541, U+8543, U+8546, U+8548, U+854a-854b, U+854f-8553, U+8555-855a, U+855c-8564, U+8569-856b, U+856d, U+856f, U+8577, U+8579-857b, U+857d-8581, U+8585-8586, U+8588-858c, U+858f-8591, U+8593, U+8597-8598, U+859b-859d, U+859f-85a0, U+85a2, U+85a4-85a5, U+85a7-85a8, U+85ad-85b0, U+85b4, U+85b6-85ba, U+85bc-85bf, U+85c1-85c2, U+85c7, U+85c9-85cb, U+85ce-85d0, U+85d5, U+85d8-85da, U+85dc, U+85df-85e1, U+85e5-85e6, U+85e8, U+85ed, U+85f3-85f4, U+85f6-85f7, U+85f9-85fa, U+85fc, U+85fe-8600, U+8602, U+8604-8606, U+860a-860b, U+860d-860e, U+8610-8613, U+8616-861b, U+861e, U+8621-8622, U+8624, U+8627, U+8629, U+862f-8630, U+8636, U+8638-863a, U+863c-863d, U+863f-8642, U+8646, U+864d, U+8652-8654",
    "[20]": "U+82e8, U+82ea, U+82ed, U+82ef, U+82f3-82f4, U+82f6-82f7, U+82f9, U+82fb, U+82fd-82fe, U+8300-8301, U+8303, U+8306-8308, U+830a-830c, U+8316-8318, U+831b, U+831d-831f, U+8321-8323, U+832b-8335, U+8337, U+833a, U+833c-833d, U+8340, U+8342-8347, U+834a, U+834d-8351, U+8353-8357, U+835a, U+8362-8363, U+8370, U+8373, U+8375, U+8378, U+837c-837d, U+837f-8380, U+8382, U+8384-8387, U+838a, U+838d-838e, U+8392-8396, U+8398-83a0, U+83a2, U+83a6-83ad, U+83b1, U+83b5, U+83bd-83c1, U+83c7, U+83c9, U+83ce-83d1, U+83d4, U+83d6, U+83d8, U+83dd, U+83df-83e1, U+83e5, U+83e8, U+83ea-83eb, U+83f0, U+83f2, U+83f4, U+83f6-83f9, U+83fb-83fd, U+8401, U+8403-8404, U+8406-8407, U+840a-840b, U+840d, U+840f, U+8411, U+8413, U+8415, U+8417, U+8419, U+8420, U+8422, U+842a, U+842f, U+8431, U+8435, U+8438-8439, U+843c, U+8445-8448, U+844a, U+844d-844f, U+8451-8452, U+8456, U+8458-845a, U+845c, U+845f-8462, U+8464-8467, U+8469-846b, U+846d-8470, U+8473-8474, U+8476-847a, U+847c-847d, U+8481-8482, U+8484-8485, U+848b, U+8490, U+8492-8493, U+8495, U+8497, U+849c, U+849e-849f, U+84a1, U+84a6, U+84a8-84aa, U+84ad, U+84af, U+84b1",
    "[21]": "U+814a, U+814c, U+8151-8153, U+8157, U+815f-8161, U+8165-8169, U+816d-816f, U+8171, U+8173-8174, U+8177, U+8180-8186, U+8188, U+818a-818b, U+818e, U+8190, U+8193, U+8195-8196, U+8198, U+819b, U+819e, U+81a0, U+81a2, U+81a4, U+81a9, U+81ae, U+81b0, U+81b2, U+81b4-81b5, U+81b8, U+81ba-81bb, U+81bd-81be, U+81c0-81c3, U+81c5-81c6, U+81c8-81cb, U+81cd-81cf, U+81d1, U+81d5-81db, U+81dd-81e1, U+81e4-81e5, U+81e7, U+81eb-81ec, U+81ef-81f2, U+81f5-81f6, U+81f8-81fb, U+81fd-8205, U+8209-820b, U+820d, U+820f, U+8212-8214, U+8216, U+8219-821d, U+8221-8222, U+8228-8229, U+822b, U+822e, U+8232-8235, U+8237-8238, U+823a, U+823c, U+8240, U+8243-8246, U+8249, U+824b, U+824e-824f, U+8251, U+8256-825a, U+825c-825d, U+825f-8260, U+8262-8264, U+8267-8268, U+826a-826b, U+826d-826e, U+8271, U+8274, U+8277, U+8279, U+827b, U+827d-8281, U+8283-8284, U+8287, U+8289-828a, U+828d-828e, U+8291-8294, U+8296, U+8298-829b, U+829f-82a1, U+82a3-82a4, U+82a7-82ac, U+82ae, U+82b0, U+82b2, U+82b4, U+82b7, U+82ba-82bc, U+82be-82bf, U+82c5-82c6, U+82d0, U+82d2-82d3, U+82d5, U+82d9-82da, U+82dc, U+82de-82e4, U+82e7",
    "[22]": "U+7f77-7f79, U+7f7d-7f80, U+7f82-7f83, U+7f86-7f88, U+7f8b-7f8d, U+7f8f-7f91, U+7f94, U+7f96-7f97, U+7f9a, U+7f9c-7f9d, U+7fa1-7fa3, U+7fa6, U+7faa, U+7fad-7faf, U+7fb2, U+7fb4, U+7fb6, U+7fb8-7fb9, U+7fbc, U+7fbf-7fc0, U+7fc3, U+7fc5-7fc6, U+7fc8, U+7fca, U+7fce-7fcf, U+7fd5, U+7fdb, U+7fdf, U+7fe1, U+7fe3, U+7fe5-7fe6, U+7fe8-7fe9, U+7feb-7fec, U+7fee-7ff0, U+7ff2-7ff3, U+7ff9-7ffa, U+7ffd-7fff, U+8002, U+8004, U+8006-8008, U+800a-800f, U+8011-8014, U+8016, U+8018-8019, U+801c-8021, U+8024, U+8026, U+8028, U+802c, U+802e, U+8030, U+8034-8035, U+8037, U+8039-8040, U+8043-8044, U+8046, U+804a, U+8052, U+8058, U+805a, U+805f-8060, U+8062, U+8064, U+8066, U+8068, U+806d, U+806f-8073, U+8075-8076, U+8079, U+807b, U+807d-8081, U+8084-8088, U+808b, U+808e, U+8093, U+8099-809a, U+809c, U+809e, U+80a4, U+80a6-80a7, U+80ab-80ad, U+80b1, U+80b8-80b9, U+80c4-80c5, U+80c8, U+80ca, U+80cd, U+80cf, U+80d2, U+80d4-80db, U+80dd, U+80e0, U+80e4-80e6, U+80ed-80f3, U+80f5-80f7, U+80f9-80fc, U+80fe, U+8101, U+8103, U+8109, U+810b, U+810d, U+8116-8118, U+811b-811c, U+811e, U+8120, U+8123-8124, U+8127, U+8129, U+812b-812c, U+812f-8130, U+8135, U+8139-813a, U+813c-813e, U+8141, U+8145-8147",
    "[23]": "U+7d57, U+7d59-7d5d, U+7d63, U+7d65, U+7d67, U+7d6a, U+7d6e, U+7d70, U+7d72-7d73, U+7d78, U+7d7a-7d7b, U+7d7d, U+7d7f, U+7d81-7d83, U+7d85-7d86, U+7d88-7d89, U+7d8b-7d8d, U+7d8f, U+7d91, U+7d93, U+7d96-7d97, U+7d9b-7da0, U+7da2-7da3, U+7da6-7da7, U+7daa-7dac, U+7dae-7db0, U+7db3, U+7db5-7db9, U+7dbd, U+7dc0, U+7dc2-7dc7, U+7dcc-7dce, U+7dd0, U+7dd5-7dd9, U+7ddc-7dde, U+7de1-7de6, U+7dea-7ded, U+7df1-7df2, U+7df5-7df6, U+7df9-7dfa, U+7e00, U+7e05, U+7e08-7e0b, U+7e10-7e12, U+7e15, U+7e17, U+7e1c-7e1d, U+7e1f-7e23, U+7e27-7e28, U+7e2c-7e2d, U+7e2f, U+7e31-7e33, U+7e35-7e37, U+7e39-7e3b, U+7e3d, U+7e3f, U+7e43-7e48, U+7e4e, U+7e50, U+7e52, U+7e56, U+7e58-7e5a, U+7e5d-7e5f, U+7e61-7e62, U+7e65-7e67, U+7e69-7e6b, U+7e6d-7e6f, U+7e73, U+7e75, U+7e78-7e79, U+7e7b-7e7f, U+7e81-7e83, U+7e86-7e8a, U+7e8c-7e8e, U+7e90-7e96, U+7e98, U+7e9a-7e9f, U+7f38, U+7f3a-7f3f, U+7f43-7f45, U+7f47, U+7f4c-7f50, U+7f52-7f55, U+7f58, U+7f5b-7f5d, U+7f5f, U+7f61, U+7f63-7f69, U+7f6b, U+7f6d, U+7f71",
    "[24]": "U+7bc8, U+7bca-7bcc, U+7bcf, U+7bd4, U+7bd6-7bd7, U+7bd9-7bdb, U+7bdd, U+7be5-7be6, U+7be8-7bea, U+7bf0, U+7bf2-7bfa, U+7bfc, U+7bfe, U+7c00-7c04, U+7c06-7c07, U+7c09, U+7c0b-7c0f, U+7c11-7c14, U+7c17, U+7c19, U+7c1b, U+7c1e-7c20, U+7c23, U+7c25-7c28, U+7c2a-7c2c, U+7c2f, U+7c31, U+7c33-7c34, U+7c36-7c3a, U+7c3d-7c3e, U+7c40, U+7c42-7c43, U+7c45-7c46, U+7c4a, U+7c4c, U+7c4f-7c5f, U+7c61, U+7c63-7c65, U+7c67, U+7c69, U+7c6c-7c70, U+7c72, U+7c75, U+7c79, U+7c7b-7c7e, U+7c81-7c83, U+7c86-7c87, U+7c8d, U+7c8f-7c90, U+7c94, U+7c9e, U+7ca0-7ca2, U+7ca4-7ca6, U+7ca8, U+7cab, U+7cad-7cae, U+7cb0-7cb3, U+7cb6-7cb7, U+7cb9-7cbd, U+7cbf-7cc0, U+7cc2, U+7cc4-7cc5, U+7cc7-7cca, U+7ccd-7ccf, U+7cd2-7cd5, U+7cd7-7cda, U+7cdc-7cdd, U+7cdf-7ce0, U+7ce2, U+7ce6, U+7ce9, U+7ceb, U+7cef, U+7cf2, U+7cf4-7cf6, U+7cf9-7cfa, U+7cfe, U+7d02-7d03, U+7d06-7d0a, U+7d0f, U+7d11-7d13, U+7d15-7d16, U+7d1c-7d1e, U+7d23, U+7d26, U+7d2a, U+7d2c-7d2e, U+7d31-7d32, U+7d35, U+7d3c-7d41, U+7d43, U+7d45, U+7d47-7d48, U+7d4b, U+7d4d-7d4f, U+7d51, U+7d53, U+7d55-7d56",
    "[25]": "U+7a17-7a19, U+7a1b, U+7a1e-7a21, U+7a27, U+7a2b, U+7a2d, U+7a2f-7a31, U+7a34-7a35, U+7a37-7a3b, U+7a3e, U+7a43-7a49, U+7a4c, U+7a4e, U+7a50, U+7a55-7a57, U+7a59, U+7a5c-7a5d, U+7a5f-7a63, U+7a65, U+7a67, U+7a69-7a6a, U+7a6d, U+7a70, U+7a75, U+7a78-7a79, U+7a7d-7a7e, U+7a80, U+7a82, U+7a84-7a86, U+7a88, U+7a8a-7a8b, U+7a90-7a91, U+7a94-7a98, U+7a9e, U+7aa0, U+7aa3, U+7aa9, U+7aac, U+7ab0, U+7ab3, U+7ab5-7ab6, U+7ab9-7abf, U+7ac3, U+7ac5-7aca, U+7acc-7acf, U+7ad1-7ad3, U+7ad5, U+7ada-7adb, U+7add, U+7adf, U+7ae1-7ae2, U+7ae6-7aed, U+7af0-7af1, U+7af4, U+7af8, U+7afa-7afb, U+7afd-7afe, U+7b02, U+7b04, U+7b06-7b08, U+7b0a-7b0b, U+7b0f, U+7b12, U+7b14, U+7b18-7b19, U+7b1e-7b1f, U+7b23, U+7b25, U+7b27-7b2b, U+7b2d-7b31, U+7b33-7b36, U+7b3b, U+7b3d, U+7b3f-7b41, U+7b45, U+7b47, U+7b4c-7b50, U+7b53, U+7b55, U+7b5d, U+7b60, U+7b64-7b66, U+7b69-7b6a, U+7b6c-7b75, U+7b77, U+7b79-7b7a, U+7b7f, U+7b84, U+7b86, U+7b89, U+7b8d-7b92, U+7b96, U+7b98-7ba0, U+7ba5, U+7bac-7bad, U+7baf-7bb0, U+7bb2, U+7bb4-7bb6, U+7bba-7bbd, U+7bc1-7bc2, U+7bc5-7bc6",
    "[26]": "U+7851-7852, U+785c, U+785e, U+7860-7861, U+7863-7864, U+7868, U+786a, U+786e-786f, U+7872, U+7874, U+787a, U+787c, U+787e, U+7886-7887, U+788a, U+788c-788f, U+7893-7895, U+7898, U+789a, U+789d-789f, U+78a1, U+78a3-78a4, U+78a8-78aa, U+78ac-78ad, U+78af-78b3, U+78b5, U+78bb-78bf, U+78c5-78cc, U+78ce, U+78d1-78d6, U+78da-78db, U+78df-78e1, U+78e4, U+78e6-78e7, U+78ea, U+78ec, U+78f2-78f4, U+78f6-78f7, U+78f9-78fb, U+78fd-7901, U+7906-7907, U+790c, U+7910-7912, U+7919-791c, U+791e-7920, U+7925-792e, U+7930-7931, U+7934-7935, U+793b, U+793d, U+793f, U+7941-7942, U+7944-7946, U+794a-794b, U+794f, U+7951, U+7954-7955, U+7957-7958, U+795a-795c, U+795f-7960, U+7962, U+7967, U+7969, U+796b, U+7972, U+7977, U+7979-797c, U+797e-7980, U+798a-798e, U+7991, U+7993-7996, U+7998, U+799b-799d, U+79a1, U+79a6-79ab, U+79ae-79b1, U+79b3-79b4, U+79b8-79bb, U+79bd-79be, U+79c2, U+79c4, U+79c7-79ca, U+79cc-79cd, U+79cf, U+79d4-79d6, U+79da, U+79dd-79e3, U+79e5, U+79e7, U+79ea-79ed, U+79f1, U+79f8, U+79fc, U+7a02-7a03, U+7a05, U+7a07-7a0a, U+7a0c-7a0d, U+7a11, U+7a15",
    "[27]": "U+768c-768e, U+7690, U+7693, U+7695-7696, U+7699-76a8, U+76aa, U+76ad, U+76af-76b0, U+76b4, U+76b6-76ba, U+76bd, U+76c1-76c3, U+76c5, U+76c8-76c9, U+76cb-76ce, U+76d2, U+76d4, U+76d6, U+76d9, U+76dc, U+76de, U+76e0-76e1, U+76e5-76e8, U+76ea-76ec, U+76f0-76f1, U+76f6, U+76f9, U+76fb-76fc, U+7700, U+7704, U+7706-7708, U+770a, U+770e, U+7712, U+7714-7715, U+7717, U+7719-771c, U+7722, U+7724-7726, U+7728, U+772d-772f, U+7734-7739, U+773d-773e, U+7742, U+7745-7747, U+774a, U+774d-774f, U+7752, U+7756-7758, U+775a-775c, U+775e-7760, U+7762, U+7764-7765, U+7767, U+776a-776c, U+7770, U+7772-7774, U+7779-777a, U+777c-7780, U+7784, U+778b-778e, U+7794-7796, U+779a, U+779e-77a0, U+77a2, U+77a4-77a5, U+77a7, U+77a9-77aa, U+77ae-77b1, U+77b5-77b7, U+77b9, U+77bb-77bf, U+77c3, U+77c7, U+77c9, U+77cd, U+77d1-77d2, U+77d5, U+77d7, U+77d9-77da, U+77dc, U+77de-77e0, U+77e3-77e4, U+77e6-77e7, U+77e9-77ea, U+77ec, U+77ee, U+77f0-77f1, U+77f4, U+77f8, U+77fb-77fc, U+7805-7806, U+7809, U+780c-780e, U+7811-7812, U+7819, U+781d, U+7820-7823, U+7826-7827, U+782c-782e, U+7830, U+7835, U+7837, U+783a, U+783f, U+7843-7845, U+7847-7848, U+784c, U+784e-784f",
    "[28]": "U+7511-7513, U+7515-7517, U+751c, U+751e, U+7520-7522, U+7524, U+7526-7527, U+7529-752c, U+752f, U+7536, U+7538-7539, U+753c-7540, U+7543-7544, U+7546-754b, U+754d-7550, U+7552, U+7557, U+755a-755b, U+755d-755f, U+7561-7562, U+7564, U+7566-7567, U+7569, U+756b-756d, U+756f, U+7571-7572, U+7574-757e, U+7581-7582, U+7585-7587, U+7589-758c, U+758f-7590, U+7592-7595, U+7599-759a, U+759c-759d, U+75a2-75a5, U+75b0-75b1, U+75b3-75b5, U+75b7-75b8, U+75ba, U+75bd, U+75bf-75c4, U+75c6, U+75ca, U+75cc-75cf, U+75d3-75d4, U+75d7-75d8, U+75dc-75e1, U+75e3-75e4, U+75e7, U+75ec, U+75ee-75f3, U+75f9, U+75fc, U+75fe-7604, U+7607-760c, U+760f, U+7612-7613, U+7615-7616, U+7618-7619, U+761b-7629, U+762d, U+7630, U+7632-7635, U+7638-763c, U+7640-7641, U+7643-764b, U+764e, U+7655, U+7658-7659, U+765c, U+765f, U+7661-7662, U+7664-7665, U+7667-766a, U+766c-7672, U+7674, U+7676, U+7678, U+7680-7683, U+7685, U+7688, U+768b",
    "[29]": "U+736c, U+736e-7371, U+7375, U+7377-737c, U+7380-7381, U+7383, U+7385-7386, U+738a, U+738e, U+7390, U+7393-7398, U+739c, U+739e-73a0, U+73a2, U+73a5-73a6, U+73a8, U+73aa-73ab, U+73ad, U+73b3, U+73b5, U+73b7, U+73b9-73bd, U+73bf, U+73c5-73c6, U+73c9-73cc, U+73ce-73cf, U+73d2-73d3, U+73d6, U+73d9, U+73dd-73de, U+73e1, U+73e3-73e7, U+73e9-73ea, U+73ee, U+73f1, U+73f4-73f5, U+73f7-73fb, U+73fd, U+73ff-7401, U+7404-7405, U+7407, U+740a, U+7411, U+7413, U+741a-741b, U+7421, U+7424, U+7426, U+7428-7431, U+7433, U+7439-743a, U+743f-7441, U+7443-7444, U+7446-7447, U+744b, U+744d, U+7451-7453, U+7455, U+7457, U+7459-745a, U+745c-745d, U+745f, U+7462-7464, U+7466-746b, U+746d-7473, U+7476, U+747e, U+7480-7481, U+7485-7489, U+748b, U+748f-7492, U+7497-749a, U+749c, U+749e-74a3, U+74a5-74a6, U+74a8-74ab, U+74ae-74af, U+74b1-74b2, U+74b5, U+74b9-74bb, U+74bd, U+74bf, U+74c8-74ca, U+74cc, U+74cf-74d0, U+74d3-74d4, U+74d6, U+74d8, U+74da-74db, U+74de-74e0, U+74e3-74e4, U+74e7-74eb, U+74ee-74f2, U+74f4, U+74f7-74f8, U+74fa-74fc, U+74ff, U+7501, U+7503-7506, U+750c-750e",
    "[30]": "U+7166, U+7168, U+716c, U+7179, U+7180, U+7184-7185, U+7187-7188, U+718c, U+718f, U+7192, U+7194-7196, U+7199-719b, U+71a0, U+71a2, U+71a8, U+71ac, U+71ae-71b0, U+71b2-71b3, U+71b9-71ba, U+71be-71c1, U+71c4, U+71c9, U+71cb-71cc, U+71ce, U+71d0, U+71d2-71d4, U+71d6-71d7, U+71d9-71da, U+71dc, U+71df-71e0, U+71e6-71e7, U+71ec-71ee, U+71f4-71f5, U+71f8-71f9, U+71fc, U+71fe-7200, U+7207-7209, U+720d, U+7210, U+7213, U+7215, U+7217, U+721a, U+721d, U+721f, U+7224, U+7228, U+722b, U+722d, U+722f-7230, U+7232, U+7234, U+7238-7239, U+723b-723c, U+723e-7243, U+7245-7246, U+724b, U+724e-7250, U+7252-7253, U+7255-7258, U+725a, U+725c, U+725e, U+7260, U+7263, U+7268, U+726b, U+726e-726f, U+7271, U+7274, U+7277-7278, U+727b-727c, U+727e-7282, U+7284, U+7287, U+7289, U+728d-728e, U+7292-7293, U+7296, U+729b, U+72a2, U+72a7-72a8, U+72ad-72ae, U+72b0-72b2, U+72b4, U+72b9, U+72be, U+72c0-72c1, U+72c3-72c4, U+72c6-72c7, U+72c9, U+72cc, U+72ce, U+72d2, U+72d5-72d6, U+72d8, U+72df-72e2, U+72e5, U+72f3-72f4, U+72f7, U+72f9-72fb, U+72fd-72fe, U+7302, U+7304-7305, U+7307, U+730a-730b, U+730d, U+7312-7313, U+7316-7319, U+731c-731e, U+7322, U+7324, U+7327-7329, U+732c, U+732f, U+7331-7337, U+7339-733b, U+733d-733e, U+7343, U+734d-7350, U+7352, U+7356-7358, U+735d-7360, U+7366-736b",
    "[31]": "U+6f58-6f5b, U+6f5d-6f5e, U+6f60-6f62, U+6f66, U+6f68, U+6f6c-6f6d, U+6f6f, U+6f74, U+6f78, U+6f7a, U+6f7c-6f7e, U+6f80, U+6f82-6f83, U+6f86-6f88, U+6f8b-6f8e, U+6f90-6f94, U+6f96-6f98, U+6f9a, U+6f9d, U+6f9f-6fa1, U+6fa3, U+6fa5-6fa8, U+6fae-6fb1, U+6fb3, U+6fb5-6fb7, U+6fb9, U+6fbc, U+6fbe, U+6fc2, U+6fc5-6fca, U+6fd4-6fd5, U+6fd8, U+6fda-6fdb, U+6fde-6fe0, U+6fe4, U+6fe8-6fe9, U+6feb-6fec, U+6fee, U+6ff0, U+6ff3, U+6ff5-6ff6, U+6ff9-6ffa, U+6ffc-6ffe, U+7000-7001, U+7005-7007, U+7009-700b, U+700d, U+700f, U+7011, U+7015, U+7017-7018, U+701a-701b, U+701d-7020, U+7023, U+7026, U+7028, U+702f-7030, U+7032, U+7034, U+7037, U+7039-703a, U+703c, U+703e, U+7043-7044, U+7047-704c, U+704e, U+7051, U+7054-7055, U+705d-705e, U+7064-7065, U+7069, U+706c, U+706e, U+7075-7076, U+707e, U+7081, U+7085-7086, U+7094-7098, U+709b, U+709f, U+70a4, U+70ab-70ac, U+70ae-70b1, U+70b3-70b4, U+70b7, U+70bb, U+70ca-70cb, U+70d1, U+70d3-70d6, U+70d8-70d9, U+70dc-70dd, U+70df, U+70e4, U+70ec, U+70f1, U+70fa, U+70fd, U+7103-7108, U+710b-710c, U+710f, U+7114, U+7119, U+711c, U+711e, U+7120, U+712b, U+712d-7131, U+7138, U+7141, U+7145-7147, U+7149-714b, U+7150-7153, U+7155-7157, U+715a, U+715c, U+715e, U+7160, U+7162, U+7164-7165",
    "[32]": "U+6d7c, U+6d80-6d82, U+6d85, U+6d87, U+6d89-6d8a, U+6d8c-6d8e, U+6d91-6d98, U+6d9c, U+6daa-6dac, U+6dae, U+6db4-6db5, U+6db7-6db9, U+6dbd, U+6dbf, U+6dc2, U+6dc4-6dc8, U+6dca, U+6dcc, U+6dce-6dd0, U+6dd2, U+6dd5-6dd6, U+6dd8-6ddb, U+6ddd-6de0, U+6de2, U+6de4-6de6, U+6de8-6dea, U+6dec, U+6dee-6df0, U+6df2, U+6df4, U+6df6, U+6df8-6dfa, U+6dfc, U+6e00, U+6e04, U+6e0a, U+6e17, U+6e19, U+6e1d-6e20, U+6e22-6e25, U+6e27, U+6e2b, U+6e2d-6e2e, U+6e32, U+6e34, U+6e36, U+6e38-6e3c, U+6e42-6e45, U+6e48-6e49, U+6e4b-6e4f, U+6e51-6e54, U+6e57, U+6e5b-6e5f, U+6e62-6e63, U+6e68, U+6e6b, U+6e6e, U+6e72-6e73, U+6e76, U+6e7b, U+6e7d, U+6e82, U+6e89, U+6e8c-6e8d, U+6e8f, U+6e93, U+6e98-6e99, U+6e9f-6ea0, U+6ea5, U+6ea7, U+6eaa-6eab, U+6ead-6eaf, U+6eb1-6eb4, U+6eb7, U+6ebb-6ebd, U+6ebf-6ec4, U+6ec7-6eca, U+6ecc-6ecf, U+6ed3-6ed5, U+6ed9-6edb, U+6ee6, U+6eeb-6eef, U+6ef7-6ef9, U+6efb, U+6efd-6eff, U+6f04, U+6f08-6f0a, U+6f0c-6f0d, U+6f10-6f11, U+6f13, U+6f15-6f16, U+6f18, U+6f1a-6f1b, U+6f25-6f26, U+6f29-6f2a, U+6f2d, U+6f2f-6f33, U+6f35-6f36, U+6f38, U+6f3b-6f3c, U+6f3e-6f3f, U+6f41, U+6f45, U+6f4f, U+6f51-6f53, U+6f57",
    "[33]": "U+6b85, U+6b89, U+6b8d, U+6b95, U+6b97-6b98, U+6b9b, U+6b9e-6ba0, U+6ba2-6ba4, U+6ba8-6bb3, U+6bb7-6bb9, U+6bbc-6bbe, U+6bc0, U+6bc3-6bc4, U+6bc6-6bc9, U+6bcb-6bcc, U+6bcf, U+6bd3, U+6bd6-6bd8, U+6bda, U+6bdf, U+6be1, U+6be3, U+6be6-6be7, U+6beb-6bec, U+6bee, U+6bf1, U+6bf3, U+6bf7, U+6bf9, U+6bff, U+6c02, U+6c04-6c05, U+6c08-6c0a, U+6c0d-6c0e, U+6c10, U+6c12-6c14, U+6c19, U+6c1b, U+6c1f, U+6c24, U+6c26-6c28, U+6c2c, U+6c2e, U+6c33, U+6c35-6c36, U+6c3a-6c3b, U+6c3e-6c40, U+6c4a-6c4b, U+6c4d, U+6c4f, U+6c52, U+6c54-6c55, U+6c59, U+6c5b-6c5e, U+6c62, U+6c67-6c68, U+6c6a-6c6b, U+6c6d, U+6c6f, U+6c73-6c74, U+6c76, U+6c78-6c79, U+6c7b, U+6c7e, U+6c81-6c87, U+6c89, U+6c8c-6c8d, U+6c90, U+6c92-6c95, U+6c97-6c98, U+6c9a-6c9c, U+6c9f, U+6caa-6cae, U+6cb0-6cb2, U+6cb4, U+6cba, U+6cbd-6cbe, U+6cc2, U+6cc5-6cc6, U+6ccd, U+6ccf-6cd4, U+6cd6-6cd7, U+6cd9-6cdd, U+6ce0, U+6ce7, U+6ce9-6cef, U+6cf1-6cf2, U+6cf4, U+6cfb, U+6d00-6d01, U+6d04, U+6d07, U+6d0a, U+6d0c, U+6d0e-6d0f, U+6d11, U+6d13, U+6d19-6d1a, U+6d1f, U+6d24, U+6d26-6d28, U+6d2b, U+6d2e-6d2f, U+6d31, U+6d33-6d36, U+6d38-6d39, U+6d3c-6d3d, U+6d3f, U+6d57-6d5b, U+6d5e-6d61, U+6d64-6d65, U+6d67, U+6d6c, U+6d6f-6d70, U+6d79",
    "[34]": "U+69dd-69de, U+69e2-69e3, U+69e5, U+69e7-69eb, U+69ed-69ef, U+69f1-69f6, U+69f9, U+69fe-6a01, U+6a03, U+6a05, U+6a0a, U+6a0c, U+6a0f, U+6a11-6a15, U+6a17, U+6a1a-6a1b, U+6a1d-6a20, U+6a22-6a24, U+6a28, U+6a2e, U+6a30, U+6a32-6a38, U+6a3b, U+6a3e-6a3f, U+6a44-6a4a, U+6a4e, U+6a50-6a52, U+6a54-6a56, U+6a5b, U+6a61-6a62, U+6a64, U+6a66-6a67, U+6a6a-6a6b, U+6a71-6a73, U+6a78, U+6a7a, U+6a7e-6a7f, U+6a81, U+6a83-6a84, U+6a86-6a87, U+6a89, U+6a8b, U+6a8d, U+6a90-6a91, U+6a94, U+6a97, U+6a9b, U+6a9d-6aa3, U+6aa5, U+6aaa-6aac, U+6aae-6ab1, U+6ab3-6ab4, U+6ab8, U+6abb, U+6abd-6abf, U+6ac1-6ac3, U+6ac6, U+6ac8-6ac9, U+6acc, U+6ad0-6ad1, U+6ad3-6ad6, U+6ada-6adf, U+6ae2, U+6ae4, U+6ae7-6ae8, U+6aea, U+6aec, U+6af0-6af3, U+6af8, U+6afa, U+6afc-6afd, U+6b02-6b03, U+6b06-6b07, U+6b09-6b0b, U+6b0f-6b12, U+6b16-6b17, U+6b1b, U+6b1d-6b1f, U+6b23-6b24, U+6b28, U+6b2b-6b2c, U+6b2f, U+6b35-6b39, U+6b3b, U+6b3d, U+6b3f, U+6b43, U+6b46-6b47, U+6b49-6b4a, U+6b4d-6b4e, U+6b50, U+6b52, U+6b54, U+6b56, U+6b58-6b59, U+6b5b, U+6b5d, U+6b5f-6b61, U+6b65, U+6b67, U+6b6b-6b6c, U+6b6e, U+6b70, U+6b72, U+6b75, U+6b77-6b7a, U+6b7d-6b84",
    "[35]": "U+6855, U+6857-6859, U+685b, U+685d, U+685f, U+6863, U+6867, U+686b, U+686e-6872, U+6874-6875, U+6877, U+6879-687c, U+687e-687f, U+6882-6884, U+6886, U+6888, U+688d-6890, U+6894, U+6896, U+6898-689c, U+689f-68a3, U+68a5-68a7, U+68a9-68ab, U+68ad-68af, U+68b2-68b5, U+68b9-68bc, U+68c3, U+68c5-68c6, U+68c8-68ca, U+68cc-68cd, U+68cf-68d1, U+68d3-68d9, U+68dc-68dd, U+68e0-68e1, U+68e3-68e5, U+68e7-68e8, U+68ea-68ed, U+68ef-68f1, U+68f5-68f7, U+68f9, U+68fb-68fd, U+6900-6901, U+6903-6904, U+6906-690c, U+690f-6911, U+6913, U+6916-6917, U+6919-691b, U+6921-6923, U+6925-6926, U+6928, U+692a, U+6930-6931, U+6933-6936, U+6938-6939, U+693b, U+693d, U+6942, U+6945-6946, U+6949, U+694e, U+6954, U+6957, U+6959, U+695b-695e, U+6961-6966, U+6968-696c, U+696e-6974, U+6977-697b, U+697e-6981, U+6986, U+698d, U+6991-6992, U+6994-6996, U+6998, U+699c, U+69a0-69a1, U+69a5-69a8, U+69ab, U+69ad, U+69af-69b2, U+69b4, U+69b7-69b8, U+69ba-69bc, U+69be-69c1, U+69c3, U+69c5, U+69c7-69c8, U+69ca, U+69ce-69d1, U+69d3, U+69d6-69d7, U+69d9",
    "[36]": "U+667e-6680, U+6683-6684, U+6688, U+668b-668e, U+6690, U+6692, U+6698-669d, U+669f-66a0, U+66a2, U+66a4, U+66ad, U+66b1-66b3, U+66b5, U+66b8-66b9, U+66bb-66bc, U+66be-66c4, U+66c6, U+66c8-66c9, U+66cc, U+66ce-66cf, U+66d4, U+66da-66db, U+66dd, U+66df-66e0, U+66e6, U+66e8-66e9, U+66eb-66ec, U+66ee, U+66f5, U+66f7, U+66fa-66fc, U+6701, U+6705, U+6707, U+670c, U+670e-6710, U+6712-6716, U+6719, U+671c, U+671e, U+6720, U+6722, U+6725-6726, U+672e, U+6733, U+6735-6738, U+673e-673f, U+6741, U+6743, U+6745-6748, U+674c-674d, U+6753-6755, U+6759, U+675d-675e, U+6760, U+6762-6764, U+6766, U+676a, U+676c, U+676e, U+6770, U+6772-6774, U+6776-6777, U+677b-677c, U+6780-6781, U+6784-6785, U+6787, U+6789, U+678b-678c, U+678e-678f, U+6791-6793, U+6796, U+6798-6799, U+679b, U+67a1, U+67a4, U+67a6, U+67a9, U+67b0-67b5, U+67b7-67b9, U+67bb-67be, U+67c0-67c3, U+67c5-67c6, U+67c8-67c9, U+67ce, U+67d2, U+67d7-67d9, U+67db-67de, U+67e1-67e2, U+67e4, U+67e6-67e7, U+67e9, U+67ec, U+67ee-67f0, U+67f2, U+67f6-67f7, U+67f9-67fa, U+67fc, U+67fe, U+6801-6802, U+6805, U+6810, U+6814, U+6818-6819, U+681d, U+681f, U+6822, U+6827-6829, U+682b-682d, U+682f-6834, U+683b, U+683e-6840, U+6844-6846, U+6849-684a, U+684c-684e, U+6852-6854",
    "[37]": "U+64d2, U+64d4-64d5, U+64d7-64d8, U+64da, U+64e0-64e1, U+64e3-64e5, U+64e7, U+64e9-64ea, U+64ed, U+64ef-64f2, U+64f4-64f7, U+64fa-64fb, U+64fd-6501, U+6504-6505, U+6508-650a, U+650f, U+6513-6514, U+6516, U+6518-6519, U+651b-651f, U+6522, U+6524, U+6526, U+6529-652c, U+652e, U+6531-6532, U+6534-6538, U+653a, U+653c-653d, U+6543-6544, U+6547-6549, U+654d-654e, U+6550, U+6552, U+6554-6556, U+6558, U+655d-6560, U+6567, U+656b, U+6572, U+6578, U+657a, U+657d, U+6581-6585, U+6588, U+658a, U+658c, U+6592, U+6595, U+6598, U+659b, U+659d, U+659f-65a1, U+65a3-65a6, U+65ab, U+65ae, U+65b2-65b5, U+65b7-65b8, U+65be-65bf, U+65c1-65c4, U+65c6, U+65c8-65c9, U+65cc, U+65ce, U+65d0, U+65d2, U+65d4, U+65d6, U+65d8-65d9, U+65db, U+65df-65e1, U+65e3, U+65f0-65f2, U+65f4-65f5, U+65f9, U+65fb-65fc, U+65fe-6600, U+6603-6604, U+6608-660a, U+660d, U+6611-6612, U+6615-6616, U+661c-661e, U+6621-6624, U+6626, U+6629-662c, U+662e, U+6630-6631, U+6633-6637, U+6639-663b, U+663f-6641, U+6644-6646, U+6648-664a, U+664c, U+664e-664f, U+6651, U+6657-6665, U+6667-6668, U+666a-666d, U+6670, U+6673, U+6675, U+6677-6679, U+667b-667c",
    "[38]": "U+62cf, U+62d1, U+62d4-62d6, U+62da, U+62dc, U+62ea, U+62ee-62ef, U+62f1-62f2, U+62f4-62f5, U+62fc-62fd, U+62ff, U+6302-6304, U+6308-630d, U+6310, U+6313, U+6316, U+6318, U+631b, U+6327, U+6329-632a, U+632d, U+6332, U+6335-6336, U+6339-633c, U+633e, U+6341-6344, U+6346, U+634a-634e, U+6350, U+6352-6354, U+6358-6359, U+635b, U+6365-6366, U+6369, U+636b-636d, U+6371-6372, U+6374-6378, U+637a, U+637c-637d, U+637f-6380, U+6382, U+6384, U+6387, U+6389-638a, U+638e-6390, U+6394-6396, U+6399-639a, U+639e, U+63a0, U+63a3-63a4, U+63a6, U+63a9, U+63ab-63af, U+63b5, U+63bd-63be, U+63c0-63c1, U+63c4-63c6, U+63c8, U+63ce, U+63d1-63d6, U+63dc, U+63e0, U+63e3, U+63e5, U+63e9-63ed, U+63f2-63f3, U+63f5-63f9, U+6406, U+6409-640a, U+640f-6410, U+6412-6414, U+6416-6418, U+641e, U+6420, U+6422, U+6424-6426, U+6428-642a, U+642f-6430, U+6434-6436, U+643d, U+643f, U+644b, U+644e-644f, U+6451-6454, U+645a-645d, U+645f-6461, U+6463, U+6467, U+646d, U+6473-6474, U+6476, U+6478-6479, U+647b, U+647d, U+6485, U+6487-6488, U+648f-6491, U+6493, U+6495, U+6498-649b, U+649d-649f, U+64a1, U+64a3, U+64a6, U+64a8-64a9, U+64ac, U+64b3, U+64bb-64bf, U+64c2, U+64c4-64c5, U+64c7, U+64c9-64cc, U+64ce, U+64d0-64d1",
    "[39]": "U+6117, U+6119, U+611c, U+611e, U+6120-6122, U+6127-6128, U+612a-612c, U+6130-6131, U+6134-6137, U+6139-613a, U+613c-613f, U+6141-6142, U+6144-6147, U+6149-614a, U+614d, U+6153, U+6158-615a, U+615d-6160, U+6164-6165, U+616b-616c, U+616f, U+6171-6175, U+6177-6178, U+617b-6181, U+6183-6184, U+6187, U+618a-618b, U+618d, U+6192-6194, U+6196-619a, U+619c-619d, U+619f-61a0, U+61a5, U+61a8, U+61aa-61ae, U+61b8-61ba, U+61bc, U+61be, U+61c0-61c3, U+61c6, U+61c8, U+61ca-61cf, U+61d5, U+61dc-61df, U+61e1-61e3, U+61e5-61e9, U+61ec-61ed, U+61ef, U+61f4-61f7, U+61fa, U+61fc-6201, U+6203-6204, U+6207-620a, U+620d-620e, U+6213-6215, U+621b-621e, U+6220-6223, U+6227, U+6229-622b, U+622e, U+6230-6233, U+6236, U+6239, U+623d-623e, U+6241-6244, U+6246, U+6248, U+624c, U+624e, U+6250-6252, U+6254, U+6256, U+6258, U+625a-625c, U+625e, U+6260-6261, U+6263-6264, U+6268, U+626d, U+626f, U+6273, U+627a-627e, U+6282-6283, U+6285, U+6289, U+628d-6290, U+6292-6294, U+6296, U+6299, U+629b, U+62a6, U+62a8, U+62ac, U+62b3, U+62b6-62b7, U+62ba-62bb, U+62be-62bf, U+62c2, U+62c4, U+62c6-62c8, U+62ca, U+62ce",
    "[40]": "U+5f6c-5f6d, U+5f6f, U+5f72-5f75, U+5f78, U+5f7a, U+5f7d-5f7f, U+5f82-5f83, U+5f87-5f89, U+5f8d, U+5f8f, U+5f91, U+5f96, U+5f99, U+5f9c-5f9d, U+5fa0, U+5fa2, U+5fa4, U+5fa7-5fa8, U+5fab-5fad, U+5faf-5fb1, U+5fb5, U+5fb7-5fb8, U+5fbc-5fbd, U+5fc4, U+5fc7-5fc9, U+5fcb, U+5fd0-5fd4, U+5fdd-5fde, U+5fe1-5fe2, U+5fe4, U+5fe8-5fea, U+5fec-5ff3, U+5ff6, U+5ff8, U+5ffa-5ffd, U+5fff, U+6007, U+600a, U+600d-6010, U+6013-6015, U+6017-601b, U+601f, U+6021-6022, U+6024, U+6026, U+6029, U+602b, U+602d, U+6031, U+6033, U+6035, U+603a, U+6040-6043, U+6046-604a, U+604c-604d, U+6051, U+6054-6057, U+6059-605a, U+605d, U+605f-6064, U+6067, U+606a-606c, U+6070-6071, U+6077, U+607e-607f, U+6081-6086, U+6088-608e, U+6091-6093, U+6095-6098, U+609a-609b, U+609d-609e, U+60a2, U+60a4-60a5, U+60a7-60a8, U+60b0-60b1, U+60b3-60b5, U+60b7-60b8, U+60bb, U+60bd-60be, U+60c2, U+60c4, U+60c6-60cb, U+60ce-60cf, U+60d3-60d5, U+60d8-60d9, U+60db, U+60dd-60df, U+60e1-60e2, U+60e5, U+60ee, U+60f0-60f2, U+60f4-60f8, U+60fa-60fd, U+6100, U+6102-6103, U+6106-6108, U+610a, U+610c-610e, U+6110-6114, U+6116",
    "[41]": "U+5d9b, U+5d9d, U+5d9f-5da0, U+5da2, U+5da4, U+5da7, U+5dab-5dac, U+5dae, U+5db0, U+5db2, U+5db4, U+5db7-5db9, U+5dbc-5dbd, U+5dc3, U+5dc7, U+5dc9, U+5dcb-5dce, U+5dd0-5dd3, U+5dd6-5dd9, U+5ddb, U+5de0, U+5de2, U+5de4, U+5de9, U+5df2, U+5df5, U+5df8-5df9, U+5dfd, U+5dff-5e00, U+5e07, U+5e0b, U+5e0d, U+5e11-5e12, U+5e14-5e15, U+5e18-5e1b, U+5e1f-5e20, U+5e25, U+5e28, U+5e2e, U+5e32, U+5e35-5e37, U+5e3e, U+5e40, U+5e43-5e44, U+5e47, U+5e49, U+5e4b, U+5e4e, U+5e50-5e51, U+5e54, U+5e56-5e58, U+5e5b-5e5c, U+5e5e-5e5f, U+5e62, U+5e64, U+5e68, U+5e6a-5e6e, U+5e70, U+5e75-5e77, U+5e7a, U+5e7f-5e80, U+5e87, U+5e8b, U+5e8e, U+5e96, U+5e99-5e9a, U+5ea0, U+5ea2, U+5ea4-5ea5, U+5ea8, U+5eaa, U+5eac, U+5eb1, U+5eb3, U+5eb8-5eb9, U+5ebd-5ebf, U+5ec1-5ec2, U+5ec6, U+5ec8, U+5ecb-5ecc, U+5ece-5ed6, U+5ed9-5ee2, U+5ee5, U+5ee8-5ee9, U+5eeb-5eec, U+5ef0-5ef1, U+5ef3-5ef4, U+5ef8-5ef9, U+5efc-5f00, U+5f02-5f03, U+5f06-5f09, U+5f0b-5f0e, U+5f11, U+5f16-5f17, U+5f19, U+5f1b-5f1e, U+5f21-5f24, U+5f27-5f29, U+5f2b-5f30, U+5f34, U+5f36, U+5f38, U+5f3a-5f3d, U+5f3f-5f41, U+5f44-5f45, U+5f47-5f48, U+5f4a, U+5f4c-5f4e, U+5f50-5f51, U+5f54, U+5f56-5f58, U+5f5b-5f5d, U+5f60, U+5f63-5f65, U+5f67, U+5f6a",
    "[42]": "U+5bbc, U+5bc0-5bc1, U+5bc3, U+5bc7, U+5bc9, U+5bcd-5bd0, U+5bd3-5bd4, U+5bd6-5bda, U+5bde, U+5be0-5be2, U+5be4-5be6, U+5be8, U+5beb-5bec, U+5bef-5bf1, U+5bf3-5bf6, U+5bfd, U+5c03, U+5c05, U+5c07-5c09, U+5c0c-5c0d, U+5c12-5c14, U+5c17, U+5c19, U+5c1e-5c20, U+5c22-5c24, U+5c26, U+5c28-5c2e, U+5c30, U+5c32, U+5c35-5c36, U+5c38-5c39, U+5c46, U+5c4d-5c50, U+5c53, U+5c59-5c5c, U+5c5f-5c63, U+5c67-5c69, U+5c6c-5c70, U+5c74-5c76, U+5c79-5c7d, U+5c87-5c88, U+5c8a, U+5c8c, U+5c8f, U+5c91-5c92, U+5c94, U+5c9d, U+5c9f-5ca0, U+5ca2-5ca3, U+5ca6-5ca8, U+5caa-5cab, U+5cad, U+5cb1-5cb2, U+5cb4-5cb7, U+5cba-5cbc, U+5cbe, U+5cc5, U+5cc7, U+5cc9, U+5ccb, U+5cd0, U+5cd2, U+5cd7, U+5cd9, U+5cdd, U+5ce6, U+5ce8-5cea, U+5ced-5cee, U+5cf1-5cf2, U+5cf4-5cf5, U+5cfa-5cfb, U+5cfd, U+5d01, U+5d06, U+5d0b, U+5d0d, U+5d10-5d12, U+5d14-5d15, U+5d17-5d1b, U+5d1d, U+5d1f-5d20, U+5d22-5d24, U+5d26-5d27, U+5d2b, U+5d31, U+5d34, U+5d39, U+5d3d, U+5d3f, U+5d42-5d43, U+5d46-5d48, U+5d4a-5d4b, U+5d4e, U+5d51-5d53, U+5d55, U+5d59, U+5d5c, U+5d5f-5d62, U+5d64, U+5d69-5d6a, U+5d6c-5d6d, U+5d6f-5d70, U+5d73, U+5d76, U+5d79-5d7a, U+5d7e-5d7f, U+5d81-5d84, U+5d87-5d88, U+5d8a, U+5d8c, U+5d90, U+5d92-5d95, U+5d97, U+5d99",
    "[43]": "U+598b-598e, U+5992, U+5995, U+5997, U+599b, U+599d, U+599f, U+59a3-59a4, U+59a7, U+59ad-59b0, U+59b2-59b3, U+59b7, U+59ba, U+59bc, U+59be, U+59c1, U+59c3-59c4, U+59c6, U+59c8, U+59ca, U+59cd, U+59d2, U+59d9-59da, U+59dd-59df, U+59e3-59e5, U+59e7-59e8, U+59ec, U+59ee-59ef, U+59f1-59f2, U+59f4, U+59f6-59f8, U+5a00, U+5a03-5a04, U+5a09, U+5a0c-5a0e, U+5a11-5a13, U+5a17, U+5a1a-5a1c, U+5a1e-5a1f, U+5a23-5a25, U+5a27-5a28, U+5a2a, U+5a2d, U+5a30, U+5a35-5a36, U+5a40-5a41, U+5a44-5a45, U+5a47-5a49, U+5a4c, U+5a50, U+5a55, U+5a5e, U+5a62-5a63, U+5a65, U+5a67, U+5a6a, U+5a6c-5a6d, U+5a77, U+5a7a-5a7b, U+5a7e, U+5a84, U+5a8b, U+5a90, U+5a93, U+5a96, U+5a99, U+5a9c, U+5a9e-5aa0, U+5aa2, U+5aa7, U+5aac, U+5ab1-5ab3, U+5ab5, U+5ab8, U+5aba-5abf, U+5ac2, U+5ac4, U+5ac6, U+5ac8, U+5acb, U+5acf-5ad0, U+5ad6-5ad7, U+5ada, U+5adc, U+5ae0-5ae1, U+5ae3, U+5ae5-5ae6, U+5ae9-5aea, U+5aee, U+5af0, U+5af5-5af6, U+5afa-5afb, U+5afd, U+5b00-5b01, U+5b08, U+5b0b, U+5b16-5b17, U+5b19, U+5b1b, U+5b1d, U+5b21, U+5b25, U+5b2a, U+5b2c-5b2d, U+5b30, U+5b32, U+5b34, U+5b36, U+5b38, U+5b3e, U+5b40-5b41, U+5b43, U+5b45, U+5b4b-5b4c, U+5b51-5b52, U+5b56, U+5b5a-5b5c, U+5b5e-5b5f, U+5b65, U+5b68-5b69, U+5b6e-5b71, U+5b73, U+5b75-5b76, U+5b7a, U+5b7c-5b84, U+5b86, U+5b8a-5b8b, U+5b8d-5b8e, U+5b90-5b91, U+5b93-5b94, U+5b96, U+5ba5-5ba6, U+5ba8-5ba9, U+5bac-5bad, U+5baf, U+5bb1-5bb2, U+5bb7-5bb8, U+5bba",
    "[44]": "U+57b3, U+57b8, U+57bd, U+57c0, U+57c3, U+57c6-57c8, U+57cc, U+57cf, U+57d2-57d7, U+57dc-57de, U+57e0-57e1, U+57e3-57e4, U+57e6-57e7, U+57e9, U+57ed, U+57f0, U+57f4-57f6, U+57f8, U+57fb, U+57fd-57ff, U+5803-5804, U+5808-580d, U+5819, U+581b, U+581d-5821, U+5826-5827, U+582d, U+582f-5830, U+5832, U+5835, U+5839, U+583d, U+583f-5840, U+5849, U+584b-584d, U+584f-5852, U+5855, U+5858-5859, U+585f, U+5861-5862, U+5864, U+5867-5868, U+586d, U+5870, U+5872, U+5878-5879, U+587c, U+587f-5881, U+5885, U+5887-588d, U+588f-5890, U+5894, U+5896, U+5898, U+589d-589e, U+58a0-58a2, U+58a6, U+58a9-58ab, U+58ae, U+58b1-58b3, U+58b8-58bc, U+58be, U+58c2-58c5, U+58c8, U+58cd-58ce, U+58d0-58da, U+58dc-58e2, U+58e4-58e5, U+58e9, U+58ec, U+58ef, U+58f3-58f4, U+58f7, U+58f9, U+58fb-58fd, U+5902, U+5905-5906, U+590a-590d, U+5910, U+5912-5914, U+5918-5919, U+591b, U+591d, U+591f, U+5921, U+5923-5925, U+5928, U+592c-592d, U+592f-5930, U+5932-5933, U+5935-5936, U+5938-5939, U+593d-593f, U+5943, U+5946, U+594e, U+5950, U+5952-5953, U+5955, U+5957-595b, U+595d-5961, U+5963, U+5967, U+5969, U+596b-596d, U+596f, U+5972, U+5975-5976, U+5978-5979, U+597b-597c, U+5981",
    "[45]": "U+5616-5617, U+5619, U+561b, U+5620, U+5628, U+562c, U+562f-5639, U+563b-563d, U+563f-5641, U+5643-5644, U+5646-5647, U+5649, U+564b, U+564d-5650, U+5653-5654, U+565e, U+5660-5664, U+5666, U+5669-566d, U+566f, U+5671-5672, U+5675-5676, U+5678, U+567a, U+5680, U+5684-5688, U+568a-568c, U+568f, U+5694-5695, U+5699-569a, U+569d-56a0, U+56a5-56a9, U+56ab-56ae, U+56b1-56b4, U+56b6-56b7, U+56bc, U+56be, U+56c0, U+56c2-56c3, U+56c5, U+56c8-56d1, U+56d3, U+56d7-56d9, U+56dc-56dd, U+56df, U+56e1, U+56e4-56e8, U+56eb, U+56ed-56ee, U+56f1, U+56f6-56f7, U+56f9, U+56ff-5704, U+5707-570a, U+570c-570d, U+5711, U+5713, U+5715-5716, U+5718, U+571a-571d, U+5720-5726, U+5729-572a, U+572c, U+572e-572f, U+5733-5734, U+5737-5738, U+573b, U+573d-573f, U+5745-5746, U+574c-574f, U+5751-5752, U+5759, U+575f, U+5761-5762, U+5764-5765, U+5767-5769, U+576b, U+576d-5771, U+5773-5775, U+5777, U+5779-577c, U+577e-577f, U+5781, U+5783, U+5788-5789, U+578c, U+5793-5795, U+5797, U+5799-579a, U+579c-57a1, U+57a4, U+57a7-57aa, U+57ac, U+57ae, U+57b0",
    "[46]": "U+543f-5440, U+5443-5444, U+5447, U+544c-544f, U+5455, U+545e, U+5462, U+5464, U+5466-5467, U+5469, U+546b-546e, U+5470-5471, U+5474-5477, U+547b, U+547f-5481, U+5483-5486, U+5488-548b, U+548d-5492, U+5495-5496, U+549c, U+549f-54a2, U+54a4, U+54a6-54af, U+54b1, U+54b7-54bc, U+54be-54bf, U+54c2-54c4, U+54c6-54c8, U+54ca, U+54cd-54ce, U+54d8, U+54e0, U+54e2, U+54e5-54e6, U+54e8-54ea, U+54ec-54ef, U+54f1, U+54f3, U+54f6, U+54fc-5501, U+5505, U+5508-5509, U+550c-550f, U+5514-5516, U+5527, U+552a-552b, U+552e, U+5532-5533, U+5535-5536, U+5538-5539, U+553b-553d, U+5540-5541, U+5544-5545, U+5547, U+5549-554a, U+554c-554d, U+5550-5551, U+5556-5558, U+555a-555e, U+5560-5561, U+5563-5564, U+5566, U+557b-5583, U+5586-5588, U+558a, U+558e-558f, U+5591-5594, U+5597, U+5599, U+559e-559f, U+55a3-55a4, U+55a8-55a9, U+55ac-55ae, U+55b2, U+55bf, U+55c1, U+55c3-55c4, U+55c6-55c7, U+55c9, U+55cb-55cc, U+55ce, U+55d1-55d4, U+55d7-55d8, U+55da-55db, U+55dd-55df, U+55e2, U+55e4, U+55e9, U+55ec, U+55ee, U+55f1, U+55f6-55f9, U+55fd-55ff, U+5605, U+5607-5608, U+560a, U+560d-5612",
    "[47]": "U+528d, U+5291-5298, U+529a, U+529c, U+52a4-52a7, U+52ab-52ad, U+52af-52b0, U+52b5-52b8, U+52ba-52be, U+52c0-52c1, U+52c4-52c6, U+52c8, U+52ca, U+52cc-52cd, U+52cf-52d2, U+52d4, U+52d6-52d7, U+52db-52dc, U+52de, U+52e0-52e1, U+52e3, U+52e5-52e6, U+52e8-52ea, U+52ec, U+52f0-52f1, U+52f3-52fb, U+5300-5301, U+5303, U+5306-5308, U+530a-530d, U+530f-5311, U+5313, U+5315, U+5318-531f, U+5321, U+5323-5325, U+5327-532d, U+532f-5333, U+5335, U+5338, U+533c-533e, U+5340, U+5342, U+5345-5346, U+5349, U+534b-534c, U+5359, U+535b, U+535e, U+5361, U+5363-5367, U+5369, U+536c-536e, U+5372, U+5377, U+5379-537b, U+537d-537f, U+5382-5383, U+5387-5389, U+538e, U+5393-5394, U+5396, U+5398-5399, U+539d, U+53a0-53a1, U+53a4-53a6, U+53a9-53ab, U+53ad-53b0, U+53b2, U+53b4-53b8, U+53ba, U+53bd, U+53c0-53c1, U+53c3-53c5, U+53cf, U+53d2-53d3, U+53d5, U+53da-53db, U+53dd-53e0, U+53e2, U+53e6-53e8, U+53ed-53ee, U+53f4-53f5, U+53fa, U+5401-5403, U+540b, U+540f, U+5412-5413, U+541a, U+541d-541e, U+5421, U+5424, U+5427-542a, U+542c-542f, U+5431, U+5433-5436, U+543c-543d",
    "[48]": "U+50dd-50df, U+50e1-50e6, U+50e8-50e9, U+50ed-50f6, U+50f9-50fb, U+50fe, U+5101-5103, U+5106-5109, U+510b-510e, U+5110, U+5112, U+5114-511e, U+5121, U+5123, U+5127-5128, U+512c-512d, U+512f, U+5131, U+5133-5135, U+5137-513c, U+513f-5142, U+5147, U+514a, U+514c, U+514f, U+5152-5155, U+5157-5158, U+515f-5160, U+5162, U+5164, U+5166-5167, U+5169-516a, U+516e, U+5173-5174, U+5179, U+517b, U+517e, U+5180, U+5182-5184, U+5189, U+518b-518c, U+518e-5191, U+5193, U+5195-5196, U+5198, U+519d, U+51a1-51a4, U+51a6, U+51a9-51ab, U+51ad, U+51b0-51b3, U+51b5, U+51b8, U+51ba, U+51bc-51bf, U+51c2-51c3, U+51c5, U+51c8-51cb, U+51cf, U+51d1-51d6, U+51d8, U+51de-51e0, U+51e2, U+51e5, U+51e7, U+51e9, U+51ec-51ee, U+51f2-51f5, U+51f7, U+51fe, U+5201-5202, U+5204-5205, U+520b, U+520e, U+5212-5216, U+5218, U+5222, U+5226-5228, U+522a-522b, U+522e, U+5231-5233, U+5235, U+523c, U+5244-5245, U+5249, U+524b-524c, U+524f, U+5254-5255, U+5257-5258, U+525a, U+525c-5261, U+5266, U+5269, U+526c, U+526e, U+5271, U+5273-5274, U+5277-5279, U+527d, U+527f-5280, U+5282-5285, U+5288-528a, U+528c",
    "[49]": "U+4f57-4f58, U+4f5a-4f5b, U+4f5d-4f5f, U+4f63-4f64, U+4f69-4f6a, U+4f6c, U+4f6e-4f71, U+4f76-4f7e, U+4f81-4f85, U+4f88-4f8a, U+4f8c, U+4f8e-4f90, U+4f92-4f94, U+4f96-4f9a, U+4f9e-4fa0, U+4fab, U+4fad, U+4faf, U+4fb2, U+4fb7, U+4fb9, U+4fbb-4fbe, U+4fc0-4fc1, U+4fc4-4fc6, U+4fc8-4fc9, U+4fcb-4fd4, U+4fd8, U+4fda-4fdc, U+4fdf-4fe0, U+4fe2, U+4fe4-4fe6, U+4fef-4ff2, U+4ff6, U+4ffc-5002, U+5004-5007, U+500a, U+500c, U+500e-5011, U+5013-5014, U+5016-5018, U+501a-501e, U+5021-5023, U+5025-502a, U+502c-502e, U+5030, U+5032-5033, U+5035, U+5039, U+503b, U+5040-5043, U+5045-5048, U+504a, U+504c, U+504e, U+5050-5053, U+5055-5057, U+5059-505a, U+505f-5060, U+5062-5063, U+5066-5067, U+506a, U+506c-506d, U+5070-5072, U+5077-5078, U+5080-5081, U+5083-5086, U+5088, U+508a, U+508e-5090, U+5092-5096, U+509a-509c, U+509e-50a3, U+50aa, U+50ad, U+50af-50b4, U+50b9-50bb, U+50bd, U+50c0, U+50c2-50c4, U+50c7, U+50c9-50ca, U+50cc, U+50ce, U+50d0-50d1, U+50d3-50d4, U+50d6, U+50d8-50d9, U+50dc",
    "[50]": "U+4093, U+4103, U+4105, U+4148, U+414f, U+4163, U+41b4, U+41bf, U+41e6, U+41ee, U+41f3, U+4207, U+420e, U+4264, U+4293, U+42c6, U+42d6, U+42dd, U+4302, U+432b, U+4343, U+43ee, U+43f0, U+4408, U+440c, U+4417, U+441c, U+4422, U+4453, U+445b, U+4476, U+447a, U+4491, U+44b3, U+44be, U+44d4, U+4508, U+450d, U+4525, U+4543, U+457a, U+459d, U+45b8, U+45be, U+45e5, U+45ea, U+460f-4610, U+4641, U+4665, U+46a1, U+46ae-46af, U+470c, U+471f, U+4764, U+47e6, U+47fd, U+4816, U+481e, U+4844, U+484e, U+48b5, U+49b0, U+49e7, U+49fa, U+4a04, U+4a29, U+4abc, U+4b38, U+4b3b, U+4b7e, U+4bc2, U+4bca, U+4bd2, U+4be8, U+4c17, U+4c20, U+4c38, U+4cc4, U+4cd1, U+4ce1, U+4d07, U+4d77, U+4e02, U+4e04-4e05, U+4e0c, U+4e0f-4e12, U+4e15, U+4e17, U+4e19, U+4e1e-4e1f, U+4e23-4e24, U+4e28-4e2c, U+4e2e-4e31, U+4e35-4e37, U+4e3f-4e42, U+4e44, U+4e47-4e48, U+4e4d-4e4e, U+4e51, U+4e55-4e56, U+4e58, U+4e5a-4e5c, U+4e62-4e63, U+4e68-4e69, U+4e74-4e75, U+4e79, U+4e7f, U+4e82, U+4e85, U+4e8a, U+4e8d-4e8e, U+4e96-4e99, U+4e9d-4ea0, U+4ea2, U+4ea5-4ea6, U+4ea8, U+4eaf-4eb0, U+4eb3, U+4eb6, U+4eb9, U+4ebb-4ebc, U+4ec2-4ec4, U+4ec6-4ec8, U+4ecd, U+4ed0, U+4ed7, U+4eda-4edb, U+4edd-4ee2, U+4ee8, U+4eeb, U+4eed, U+4eef, U+4ef1, U+4ef3, U+4ef5, U+4ef7, U+4efc-4f00, U+4f02-4f03, U+4f08-4f09, U+4f0b-4f0d, U+4f12, U+4f15-4f17, U+4f19, U+4f1c, U+4f2b, U+4f2e, U+4f30-4f31, U+4f33, U+4f35-4f37, U+4f39, U+4f3b, U+4f3e, U+4f40, U+4f42-4f43, U+4f48-4f49, U+4f4b-4f4c, U+4f52, U+4f54, U+4f56",
    "[51]": "U+3395-339b, U+339e-33a0, U+33a2-33ff, U+3402, U+3405-3406, U+3427, U+342c, U+342e, U+3468, U+346a, U+3488, U+3492, U+34b5, U+34bc, U+34c1, U+34c7, U+34db, U+351f, U+353e, U+355d-355e, U+3563, U+356e, U+35a6, U+35a8, U+35c5, U+35da, U+35de, U+35f4, U+3605, U+3614, U+364a, U+3691, U+3696, U+3699, U+36cf, U+3761-3762, U+376b-376c, U+3775, U+378d, U+37c1, U+37e2, U+37e8, U+37f4, U+37fd, U+3800, U+382f, U+3836, U+3840, U+385c, U+3861, U+38a1, U+38ad, U+38fa, U+3917, U+391a, U+396f, U+39a4, U+39b8, U+3a5c, U+3a6e, U+3a73, U+3a85, U+3ac4, U+3acb, U+3ad6-3ad7, U+3aea, U+3af3, U+3b0e, U+3b1a, U+3b1c, U+3b22, U+3b35, U+3b6d, U+3b77, U+3b87-3b88, U+3b8d, U+3ba4, U+3bb6, U+3bc3, U+3bcd, U+3bf0, U+3bf3, U+3c0f, U+3c26, U+3cc3, U+3cd2, U+3d11, U+3d1e, U+3d31, U+3d4e, U+3d64, U+3d9a, U+3dc0, U+3dcc, U+3dd4, U+3e05, U+3e3f-3e40, U+3e60, U+3e66, U+3e68, U+3e83, U+3e8a, U+3e94, U+3eda, U+3f57, U+3f72, U+3f75, U+3f77, U+3fae, U+3fb1, U+3fc9, U+3fd7, U+3fdc, U+4039, U+4058",
    "[52]": "U+32b5-332b, U+332d-3394",
    "[53]": "U+31c8-31e3, U+31f0-321e, U+3220-3230, U+3232-32b4",
    "[54]": "U+3028-303f, U+3094-3096, U+309f-30a0, U+30ee, U+30f7-30fa, U+30ff, U+3105-312f, U+3131-3163, U+3165-318e, U+3190-31bb, U+31c0-31c7",
    "[55]": "U+2f14-2fd5, U+2ff0-2ffb, U+3004, U+3013, U+3016-301b, U+301e, U+3020-3027",
    "[56]": "U+25e4-25e6, U+2601-2603, U+2609, U+260e-260f, U+2616-2617, U+261c-261f, U+262f, U+2641, U+2660, U+2662-2664, U+2666-2668, U+266d-266e, U+2672-267d, U+26bd-26be, U+2702, U+271a, U+273d, U+2740, U+2756, U+2776-2793, U+27a1, U+2934-2935, U+29bf, U+29fa-29fb, U+2b05-2b07, U+2b1a, U+2b95, U+2e3a-2e3b, U+2e80-2e99, U+2e9b-2ef3, U+2f00-2f13",
    "[57]": "U+24d1-24ff, U+2503-2513, U+2515-2516, U+2518-251b, U+251d-2522, U+2524-259f, U+25a2-25ab, U+25b1, U+25b7, U+25c0-25c1, U+25c9-25ca, U+25cc, U+25d0-25d3, U+25e2-25e3",
    "[58]": "U+2105, U+2109-210a, U+210f, U+2116, U+2121, U+2126-2127, U+212b, U+212e, U+2135, U+213b, U+2194-2199, U+21b8-21b9, U+21c4-21c6, U+21cb-21cc, U+21d0, U+21e6-21e9, U+21f5, U+2202-2203, U+2205-2206, U+2208-220b, U+220f, U+2211, U+2213, U+2215, U+221a, U+221d, U+2220, U+2223, U+2225-2226, U+2228, U+222a-222e, U+2234-2237, U+223d, U+2243, U+2245, U+2248, U+224c, U+2260, U+2262, U+2264-2265, U+226e-226f, U+2272-2273, U+2276-2277, U+2283-2287, U+228a-228b, U+2295-2299, U+22a0, U+22a5, U+22bf, U+22da-22db, U+22ef, U+2305-2307, U+2318, U+2329-232a, U+23b0-23b1, U+23be-23cc, U+23ce, U+23da-23db, U+2423, U+2469-24d0",
    "[59]": "U+a1-a4, U+a6-a7, U+aa, U+ac-ad, U+b5-b6, U+b8-ba, U+bc-c8, U+ca-cc, U+ce-d5, U+d9-db, U+dd-df, U+e6, U+ee, U+f0, U+f5, U+f7, U+f9, U+fb, U+fe-102, U+110-113, U+11a-11b, U+128-12b, U+143-144, U+147-148, U+14c, U+14e-14f, U+152-153, U+168-16d, U+192, U+1a0-1a1, U+1af, U+1cd-1dc, U+1f8-1f9, U+251, U+261, U+2bb, U+2c7, U+2c9, U+2ea-2eb, U+304, U+307, U+30c, U+1e3e-1e3f, U+1ea0-1ebe, U+1ec0-1ec6, U+1ec8-1ef9, U+2011-2012, U+2016, U+2018-201a, U+201e, U+2021, U+2030, U+2033, U+2035, U+2042, U+2047, U+2051, U+2074, U+20a9, U+20ab-20ac, U+20dd-20de, U+2100",
    "[60]": "U+2227, U+26a0, U+2713, U+301f, U+4ff8, U+5239, U+526a, U+54fa, U+5740, U+5937, U+5993, U+59fb, U+5a3c, U+5c41, U+6028, U+626e, U+646f, U+647a, U+64b0, U+64e2, U+65a7, U+66fe, U+6727, U+6955, U+6bef, U+6f23, U+724c, U+767c, U+7a83, U+7ac4, U+7b67, U+8000, U+8471, U+8513, U+8599, U+86db, U+8718, U+87f2, U+88f3, U+8ad2, U+8e2a, U+8fa3, U+95a5, U+9798, U+9910, U+9957, U+9bab, U+9c3b, U+9daf, U+ff95",
    "[61]": "U+a8, U+2032, U+2261, U+2282, U+3090, U+30f1, U+339c, U+535c, U+53d9, U+56a2, U+56c1, U+5806, U+589f, U+59d0, U+5a7f, U+60e0, U+639f, U+65af, U+68fa, U+69ae, U+6d1b, U+6ef2, U+71fb, U+725d, U+7262, U+75bc, U+7768, U+7940, U+79bf, U+7bed, U+7d68, U+7dfb, U+814b, U+8207, U+83e9, U+8494, U+8526, U+8568, U+85ea, U+86d9, U+87ba, U+8861, U+887f, U+8fe6, U+9059, U+9061, U+916a, U+976d, U+97ad, U+9ece",
    "[62]": "U+2d9, U+21d4, U+301d, U+515c, U+52fe, U+5420, U+5750, U+5766, U+5954, U+5b95, U+5f8a, U+5f98, U+620c, U+621f, U+641c, U+66d9, U+676d, U+6775, U+67f5, U+694a, U+6a02, U+6a3a, U+6a80, U+6c23, U+6c72, U+6dcb, U+6faa, U+707c, U+71c8, U+7422, U+74e2, U+7791, U+7825, U+7a14, U+7a1c, U+7c95, U+7fc1, U+82a5, U+82db, U+8304, U+853d, U+8cd3, U+8de8, U+8f0c, U+8f3f, U+9091, U+91c7, U+929a, U+98af, U+9913",
    "[63]": "U+2ca-2cb, U+2229, U+2468, U+2669, U+266f, U+273f, U+4ec0, U+4f60, U+4fb6, U+5347, U+540e, U+543b, U+5b0c, U+5d4c, U+5f14, U+5f9e, U+6155, U+62d0, U+6602, U+6666, U+66f3, U+67a2, U+67ca, U+69cc, U+6d29, U+6d9b, U+6e3e, U+6f81, U+7109, U+73c0, U+73c2, U+7425, U+7435-7436, U+7525, U+7554, U+785d, U+786b, U+7ae3, U+7b94, U+7d18, U+81bf, U+8511, U+8549, U+9075, U+9640, U+98e2, U+9e9f, U+ff96",
    "[64]": "U+2467, U+4ece, U+4ed4, U+4f91, U+4fae, U+534d, U+53c9, U+54b3, U+586b, U+5944, U+5b78, U+5df7, U+5f77, U+6101, U+6167-6168, U+61a4, U+62d9, U+698a, U+699b, U+6a59, U+6cc4, U+6e07, U+7099, U+75d2, U+77ad, U+7953, U+7984, U+7a92, U+7baa, U+7dbb, U+817f, U+82ad, U+85e9, U+868a, U+8caa, U+8f44, U+9017, U+907c, U+908a, U+92f3, U+936e, U+9435, U+978d, U+9838, U+9a28, U+9b41, U+9ba8, U+9c57, U+9eb9",
    "[65]": "U+b1, U+309b, U+4e5e, U+51f1, U+5506, U+55c5, U+58cc, U+59d1, U+5c51, U+5ef7, U+6284, U+62d7, U+6689, U+673d, U+6a2b, U+6a8e, U+6a9c, U+6d63, U+6dd1, U+70b8, U+7235, U+72db, U+72f8, U+7560, U+7c9b, U+7ce7, U+7e1e, U+80af, U+82eb, U+8463, U+8499, U+85dd, U+86ee, U+8a60, U+8a6e, U+8c79, U+8e87, U+8e8a, U+8f5f, U+9010, U+918d, U+9190, U+965b, U+97fb, U+9ab8, U+9bad, U+9d3b, U+9d5c, U+9dfa, U+9e93",
    "[66]": "U+2020, U+3003, U+3231, U+4e9b, U+4f3d, U+4f47, U+51b6, U+51dc, U+53e1, U+5bc5, U+602f, U+60bc, U+61c9, U+633d, U+637b, U+6492, U+65fa, U+660f, U+66f0, U+6703, U+681e, U+6876, U+6893, U+6912, U+698e, U+6c7d, U+714c, U+7169, U+71d5, U+725f, U+72d7, U+745b, U+74dc, U+75e2, U+7891, U+7897, U+7dcb, U+810a, U+8218, U+8339, U+840e, U+852d, U+8823, U+8a0a, U+9089, U+919c, U+971c, U+9ad9, U+ff4a, U+ff5a",
    "[67]": "U+2466, U+2600, U+4eab, U+4fe3, U+4ff5, U+51a5, U+51f0, U+536f, U+53d4, U+53f1, U+54a5, U+559d, U+55e3, U+58fa, U+5962, U+59ea, U+5c16, U+5cef, U+5d16, U+5f10, U+5fd6, U+6190, U+6216, U+634f, U+63bb, U+66d6, U+6756, U+6bc5, U+6e26, U+727d, U+731f, U+76f2, U+7729, U+7a7f, U+7aff, U+7c9f, U+818f, U+8236, U+82b9, U+8338, U+85aa, U+88b4, U+8b33, U+904d, U+93a7, U+96cc, U+96eb, U+9aed, U+9b8e, U+fa11",
    "[68]": "U+251c, U+2523, U+4e14, U+545f, U+54bd, U+553e, U+55dc, U+56da, U+589c, U+5b55, U+5bb5, U+5ce1, U+5df4, U+5eb6, U+5ec9, U+6191, U+62f7, U+6357, U+64a5, U+6591, U+65bc, U+6897, U+6e1a, U+7063, U+711a, U+721b, U+722c, U+75b9, U+75d5, U+75fa, U+7766, U+7aae, U+7b48, U+7b8b, U+7d21, U+7e55, U+7f75, U+842c, U+8910, U+8a63, U+8b39, U+8b5a, U+8cdc, U+8d74, U+907d, U+91e7, U+9306, U+96bc, U+98f4, U+9ac4",
    "[69]": "U+2003, U+2312, U+266c, U+4f86, U+51ea, U+5243, U+5256, U+541f, U+5841, U+59dc, U+5df3, U+601c, U+60e7, U+632b, U+638c, U+64ad, U+6881, U+697c, U+69cd, U+6c50, U+6d2a, U+6fc1, U+7027, U+7058, U+70f9, U+714e, U+7345, U+751a, U+760d, U+764c, U+77db, U+7d79, U+7e8f, U+80ce, U+814e, U+81fc, U+8247, U+8278, U+85a9, U+8a03, U+90ed, U+9784, U+9801, U+984e, U+99b3, U+9bc9, U+9bdb, U+9be8, U+9e78, U+ff6b",
    "[70]": "U+266b, U+3006, U+5176, U+5197, U+51a8, U+51c6, U+52f2, U+5614, U+5875, U+5a2f, U+5b54, U+5ce0, U+5dba, U+5deb, U+5e63, U+5f59, U+5fcc, U+6068, U+6367, U+68b6, U+6a0b, U+6b64, U+6e15, U+6eba, U+7272, U+72a0, U+7947, U+7985, U+79e6, U+79e9, U+7a3d, U+7a9f, U+7aaf, U+7b95, U+7f60, U+7f9e, U+7fe0, U+8098, U+80ba, U+8106, U+82d4, U+831c, U+87f9, U+8a1f, U+8acf, U+90c1, U+920d, U+9756, U+fe43, U+ff94",
    "[71]": "U+af, U+2465, U+2517, U+33a1, U+4f10, U+50c5, U+51b4, U+5384, U+5606, U+5bb0, U+5cac, U+5ee3, U+618e, U+61f2, U+62c9, U+66ab, U+66f9, U+6816, U+6960, U+6b3e, U+6f20, U+7078, U+72d0, U+73ed, U+7ad9, U+7b1b, U+7be4, U+7d62, U+7f51, U+80b4, U+80f4, U+8154, U+85fb, U+865c, U+8702, U+895f, U+8aed, U+8b90, U+8ced, U+8fbf, U+91d8, U+9418, U+9583, U+9591, U+9813, U+982c, U+9bd6, U+ff46, U+ff7f, U+ff88",
    "[72]": "U+4e91, U+508d, U+50e7, U+514e, U+51f6, U+5446, U+5504, U+584a, U+59a8, U+59d3, U+5a46, U+5ac9, U+6020, U+60a6, U+6148, U+621a, U+6234, U+64c1, U+6523, U+675c, U+67d1, U+6953, U+6ccc, U+6df5, U+6e13, U+6f06, U+723a, U+7325, U+74e6, U+758e, U+75ab, U+75d9, U+7a40, U+8096, U+82fa, U+8587, U+8594, U+8a6b, U+8ab9, U+8b17, U+8b83, U+937c, U+963b, U+9673, U+96db, U+9ce9, U+9f4b, U+ff67, U+ff82, U+ff93",
    "[73]": "U+221e, U+2514, U+51f9, U+5270, U+5449, U+5824, U+59a5, U+5a29, U+5d07, U+5e16, U+60e3, U+614c, U+6276, U+643e, U+64ab, U+6562, U+6681, U+670b, U+6734, U+67af, U+6a3d, U+6b05, U+6dc0, U+6e4a, U+7259, U+732a, U+7409, U+78a7, U+7a6b, U+8015, U+809b, U+817a, U+830e, U+837b, U+85ab, U+8a23, U+8a93, U+8b00, U+8b19, U+8b21, U+8cbf, U+8fb0, U+901d, U+91b8, U+9320, U+932c, U+9688, U+96f6, U+9df2, U+ff6a",
    "[74]": "U+2002, U+2025, U+4f8d, U+51e1, U+51f8, U+5507, U+5598, U+58f1, U+5983, U+59ac, U+5c3c, U+5de7, U+5e7d, U+5eca, U+5f61, U+606d, U+60f9, U+636e, U+64ec, U+67da, U+67ff, U+6813, U+68f2, U+693f, U+6b6a, U+6bbb, U+6ef4, U+7092, U+717d, U+7261, U+73c8, U+7432, U+7483, U+76fe, U+7709, U+78d0, U+81a3, U+81b3, U+82af, U+8305, U+8309, U+8870, U+88fe, U+8cd1, U+8d66, U+906e, U+971e, U+9812, U+ff79, U+ff90",
    "[75]": "U+2464, U+2501, U+2640, U+2642, U+339d, U+4f0e, U+5091, U+50b5, U+5132, U+51cc, U+558b, U+55aa, U+585e, U+5bee, U+5dfe, U+60b6, U+62b9, U+6349, U+6566, U+6590, U+6842, U+689d, U+6a58, U+6c70, U+6ff1, U+7815, U+7881, U+7aaa, U+7bc7, U+7def, U+7fa8, U+8017, U+8036, U+8061, U+821f, U+8429, U+8ce0, U+8e74, U+9019, U+90ca, U+9162, U+932f, U+93ae, U+9644, U+990c, U+9cf3, U+ff56, U+ff6e, U+ff7e, U+ff85",
    "[76]": "U+2266-2267, U+4f2f, U+5208, U+5451, U+546a, U+5589, U+576a, U+5815, U+5a9a, U+5b9b, U+5c3a, U+5efb, U+5faa, U+6109, U+6643, U+6652, U+695a, U+69fd, U+6b86, U+6bb4, U+6daf, U+7089, U+70cf, U+7a00, U+7a4f, U+7b39, U+7d33, U+80e1, U+828b, U+82a6, U+86cd, U+8c8c, U+8cca, U+8df3, U+9077, U+9175, U+91dc, U+925b, U+9262, U+9271, U+92ed, U+9855, U+9905, U+9d28, U+ff3f, U+ff58, U+ff68, U+ff6d, U+ff9c",
    "[77]": "U+2207, U+25ef, U+309c, U+4e4f, U+5146, U+51dd, U+5351, U+540a, U+5629, U+5eb5, U+5f04, U+5f13, U+60dc, U+6212, U+63b4, U+642c, U+6627, U+66a6, U+66c7, U+66fd, U+674e, U+6b96, U+6c4e, U+6df3, U+6e67, U+6f84, U+72fc, U+733f, U+7c97, U+7db1, U+7e4d, U+816b, U+82d1, U+84cb, U+854e, U+8607, U+86c7, U+871c, U+8776, U+8a89, U+8fc4, U+91a4, U+9285, U+9685, U+9903, U+9b31, U+9f13, U+ff42, U+ff74, U+ff91",
    "[78]": "U+4e32, U+51db, U+53a8, U+53ea, U+5609, U+5674, U+5a92, U+5e7e, U+6115, U+611a, U+62cc, U+62ed, U+63c9, U+64b9, U+64e6, U+65cb, U+6606, U+6731, U+683d, U+6afb, U+7460, U+771e, U+78ef, U+7b26, U+7b51, U+7cde, U+7d10, U+7d2f, U+7d46, U+80de, U+819c, U+84b2, U+85cd, U+865a, U+8ecc, U+9022, U+90b8, U+9192, U+9675, U+96b7, U+99ff, U+ff44, U+ff55, U+ff6c, U+ff73, U+ff75, U+ff86, U+ff8d, U+ff92, U+ffe3",
    "[79]": "U+25b3, U+30f5, U+4eae, U+4f46, U+4f51, U+5203, U+52ff, U+55a7, U+564c, U+565b, U+57f9, U+5805, U+5b64, U+5e06, U+5f70, U+5f90, U+60e8, U+6182, U+62f3, U+62fe, U+63aa, U+64a4, U+65d7, U+673a, U+6851, U+68cb, U+68df, U+6d1e, U+6e58, U+6e9d, U+77b3, U+7832, U+7c3f, U+7db4, U+7f70, U+80aa, U+80c6, U+8105, U+819d, U+8276, U+8679, U+8986, U+8c9d, U+8fc5, U+916c, U+9665, U+9699, U+96c0, U+9a19, U+ff8b",
    "[80]": "U+2463, U+25a1, U+4ef0, U+5076, U+5098, U+51fd, U+5302, U+5448, U+54c9, U+570b, U+583a, U+5893, U+58a8, U+58ee, U+5949, U+5bdb, U+5f26, U+5f81, U+6052, U+6170, U+61c7, U+631f, U+635c, U+664b, U+69fb, U+6f01, U+7070, U+722a, U+745e, U+755c, U+76c6, U+78c1, U+79e4, U+7bb8, U+7d0b, U+81a8, U+82d7, U+8b5c, U+8f14, U+8fb1, U+8fbb, U+9283, U+9298, U+9a30, U+ff03, U+ff50, U+ff59, U+ff7b, U+ff8e-ff8f",
    "[81]": "U+2010, U+2502, U+25b6, U+4f3a, U+514b, U+5265, U+52c3, U+5339, U+53ec, U+54c0, U+55b0, U+5854, U+5b8f, U+5cb3, U+5e84, U+60da, U+6247, U+6249, U+628a, U+62cd, U+65ac, U+6838, U+690e, U+6cf0, U+6f02, U+6f2c, U+6f70, U+708a, U+7434, U+75be, U+77ef, U+7c60, U+7c98, U+7d1b, U+7e2b, U+80a5, U+81e3, U+820c, U+8210, U+8475, U+862d, U+8650, U+8997, U+906d, U+91c8, U+9700, U+9727, U+9df9, U+ff3a, U+ff9a",
    "[82]": "U+2103, U+5049, U+52b1, U+5320, U+5553, U+572d, U+58c7, U+5b5d, U+5bc2, U+5de3, U+5e61, U+5f80, U+61a9, U+67d0, U+67f4, U+6c88, U+6ca1, U+6ce5, U+6d78, U+6e9c, U+6f54, U+731b, U+73b2, U+74a7, U+74f6, U+75e9, U+7b20, U+7c8b, U+7f72, U+809d, U+8108, U+82b3, U+82bd, U+84b8, U+84c4, U+88c2, U+8ae6, U+8ef8, U+902e, U+9065, U+9326, U+935b, U+938c, U+9676, U+9694, U+96f7, U+9ed9, U+ff48, U+ff4c, U+ff81",
    "[83]": "U+2500, U+3008-3009, U+4ead, U+4f0f, U+4fca, U+53eb, U+543e, U+57a2, U+5cf0, U+5e8f, U+5fe0, U+61b2, U+62d8, U+6442, U+64b2, U+6589, U+659c, U+67f1, U+68c4, U+6cb8, U+6d12, U+6de1, U+6fe1, U+70c8, U+723d, U+73e0, U+7656, U+773a, U+7948, U+7b87, U+7c92, U+7d3a, U+7e1b, U+7e4a, U+819a, U+8358, U+83c5, U+84bc, U+864e, U+8912, U+8c9e, U+8d05, U+92fc, U+9396, U+98fd, U+99d2, U+ff64, U+ff7a, U+ff83",
    "[84]": "U+3014-3015, U+4e3c, U+5036, U+5075, U+533f, U+53e9, U+5531, U+5642, U+5984, U+59e6, U+5a01, U+5b6b, U+5c0b, U+5f25, U+6069, U+60a0, U+614e, U+62b5, U+62d2-62d3, U+6597, U+660c, U+674f, U+67cf, U+6841, U+6905, U+6cf3, U+6d32, U+6d69, U+6f64, U+716e, U+7761, U+7b52, U+7be0, U+7dbf, U+7de9, U+7f36, U+81d3, U+8302, U+8389, U+846c, U+84ee, U+8a69, U+9038, U+9d8f, U+ff47, U+ff4b, U+ff76, U+ff9b",
    "[85]": "U+25c7, U+3007, U+504f, U+507d, U+51a0, U+52a3, U+5410, U+5510, U+559a, U+5782, U+582a, U+5c0a, U+5c3f, U+5c48, U+5f6b, U+6176, U+622f, U+6279, U+62bd, U+62dd, U+65ed, U+67b6, U+6817, U+6850, U+6d6a, U+6deb, U+6ea2, U+6edd, U+6f5c, U+72e9, U+73a9, U+7573, U+76bf, U+7950, U+7956, U+7f8a, U+7ffc, U+80a2, U+80c3, U+83ca, U+8a02, U+8a13, U+8df5, U+9375, U+983b, U+99b4, U+ff4e, U+ff71, U+ff89, U+ff97",
    "[86]": "U+24, U+2022, U+2212, U+221f, U+2665, U+4ecf, U+5100, U+51cd, U+52d8, U+5378, U+53f6, U+574a, U+5982, U+5996, U+5c1a, U+5e1d, U+5f84, U+609f, U+61a7, U+61f8, U+6398, U+63ee, U+6676, U+6691, U+6eb6, U+7126, U+71e5, U+7687, U+7965, U+7d17, U+80a1, U+8107, U+8266, U+85a6, U+8987, U+8ca2, U+8cab, U+8e0a, U+9042, U+95c7, U+9810, U+9867, U+98fc, U+ff52-ff54, U+ff61, U+ff77, U+ff98-ff99",
    "[87]": "U+b0, U+226a, U+2462, U+4e39, U+4fc3, U+4fd7, U+50be, U+50da, U+5200, U+5211, U+54f2, U+5618, U+596a, U+5b22, U+5bb4, U+5d50, U+60a3, U+63fa, U+658e, U+65e8, U+6669, U+6795, U+679d, U+67a0, U+6b3a, U+6e09, U+757f, U+7cd6, U+7dbe, U+7ffb, U+83cc, U+83f1, U+840c, U+845b, U+8846, U+8972, U+8a34, U+8a50, U+8a87, U+8edf, U+8ff0, U+90a6, U+9154, U+95a3, U+9663, U+9686, U+96c7, U+ff3c, U+ff7c, U+ff8a",
    "[88]": "U+25bd, U+4e59, U+4ec1, U+4ff3, U+515a, U+518a, U+525b, U+5375, U+552f, U+57a3, U+5b9c, U+5c3d, U+5e3d, U+5e7b, U+5f0a, U+6094, U+6458, U+654f, U+67f3, U+6b8a, U+6bd2, U+6c37, U+6ce1, U+6e56, U+6e7f, U+6ed1, U+6ede, U+6f0f, U+70ad, U+7267, U+7363, U+786c, U+7a42, U+7db2, U+7f85, U+8178, U+829d, U+8896, U+8c5a, U+8cb0, U+8ce2, U+8ed2, U+9047, U+9177, U+970a, U+9ea6, U+ff1b, U+ff31, U+ff39, U+ff80",
    "[89]": "U+a5, U+4e80, U+4f34, U+4f73, U+4f75, U+511f, U+5192, U+52aa, U+53c8, U+570f, U+57cb, U+596e, U+5d8b, U+5f66, U+5fd9, U+62db, U+62f6, U+6328, U+633f, U+63a7, U+6469, U+6bbf, U+6c41, U+6c57, U+6d44, U+6dbc, U+706f, U+72c2, U+72ed, U+7551, U+75f4, U+7949, U+7e26, U+7fd4, U+8150, U+8af8, U+8b0e, U+8b72, U+8ca7, U+934b, U+9a0e, U+9a12, U+9b42, U+ff41, U+ff43, U+ff45, U+ff49, U+ff4f, U+ff62-ff63",
    "[90]": "U+4e18, U+4fb5, U+5104, U+52c7, U+5353, U+5374, U+53e5, U+587e, U+594f, U+5a20, U+5de1, U+5f18, U+5fcd, U+6291, U+62ab, U+6355, U+6392, U+63da, U+63e1, U+656c, U+6687, U+68b0-68b1, U+68d2, U+68da, U+6b27, U+6cbc, U+7159, U+7344, U+73cd, U+76df, U+790e, U+7cf8, U+8102, U+88c1, U+8aa0, U+8e0f, U+9178, U+92ad, U+9670, U+96c5, U+9cf4, U+9db4, U+ff3e, U+ff6f, U+ff72, U+ff78, U+ff7d, U+ff84, U+ff8c",
    "[91]": "U+60, U+2200, U+226b, U+2461, U+517c, U+526f, U+5800, U+5b97, U+5bf8, U+5c01, U+5d29, U+5e4c, U+5e81, U+6065, U+61d0, U+667a, U+6696, U+6843, U+6c99, U+6d99, U+6ec5, U+6f22, U+6f6e, U+6fa4, U+6fef, U+71c3, U+72d9, U+7384, U+78e8, U+7a1a, U+7a32, U+7a3c, U+7adc, U+7ca7, U+7d2b, U+7dad, U+7e4b, U+80a9, U+8170, U+81ed, U+820e, U+8a17, U+8afe, U+90aa, U+914e, U+963f, U+99c4, U+9eba, U+9f3b, U+ff38",
    "[92]": "U+2460, U+4e5f, U+4e7e, U+4ed9, U+501f, U+502b, U+5968, U+5974, U+5ac1, U+5b99, U+5ba3, U+5be7, U+5be9, U+5c64, U+5cb8, U+5ec3, U+5f1f, U+616e, U+6297, U+62e0, U+62ec, U+6368, U+642d, U+65e6, U+6717, U+676f, U+6b04, U+732e, U+7652, U+76ca, U+76d7, U+7802, U+7e70, U+7f6a, U+8133, U+81e8, U+866b, U+878d, U+88f8, U+8a5e, U+8cdb, U+8d08, U+907a, U+90e1, U+96f2, U+9f8d, U+ff35, U+ff37, U+ff40, U+ff9d",
    "[93]": "U+21d2, U+25ce, U+300a-300b, U+4e89, U+4e9c, U+4ea1, U+5263, U+53cc, U+5426, U+5869, U+5947, U+598a, U+5999, U+5e55, U+5e72, U+5e79, U+5fae, U+5fb9, U+602a, U+6163, U+624d, U+6749, U+6c5a, U+6cbf, U+6d45, U+6dfb, U+6e7e, U+708e, U+725b, U+7763, U+79c0, U+7bc4, U+7c89, U+7e01, U+7e2e, U+8010, U+8033, U+8c6a, U+8cc3, U+8f1d, U+8f9b, U+8fb2, U+907f, U+90f7, U+9707, U+9818, U+9b3c, U+ff0a, U+ff4d",
    "[94]": "U+2015, U+2190, U+4e43, U+5019, U+5247, U+52e7, U+5438, U+54b2, U+55ab, U+57f7, U+5bd2, U+5e8a, U+5ef6, U+6016, U+60b2, U+6162, U+6319, U+6551, U+6607, U+66b4, U+675f, U+67d4, U+6b20, U+6b53, U+6ce3, U+719f, U+75b2, U+770b, U+7720, U+77ac, U+79d2, U+7af9, U+7d05, U+7dca, U+8056, U+80f8, U+81f3, U+8352, U+885d, U+8a70, U+8aa4, U+8cbc, U+900f, U+9084, U+91e3, U+9451, U+96c4, U+99c6, U+9ad4, U+ff70",
    "[95]": "U+2193, U+25b2, U+4e4b, U+516d, U+51c4, U+529f, U+52c9, U+5360, U+5442, U+5857, U+5915, U+59eb, U+5a9b, U+5c3b, U+6012, U+61b6, U+62b1, U+6311, U+6577, U+65e2, U+65ec, U+6613, U+6790, U+6cb9, U+7372, U+76ae, U+7d5e, U+7fcc, U+88ab, U+88d5, U+8caf, U+8ddd, U+8ecd, U+8f38, U+8f9e, U+8feb, U+9063, U+90f5, U+93e1, U+968a, U+968f, U+98fe, U+9ec4, U+ff1d, U+ff27, U+ff2a, U+ff36, U+ff3b, U+ff3d, U+ffe5",
    "[96]": "U+4e03, U+4f38, U+50b7, U+5264, U+5348, U+5371, U+585a, U+58ca, U+5951, U+59b9, U+59d4, U+5b98, U+5f8b, U+6388, U+64cd, U+65e7, U+6803, U+6b6f, U+6d66, U+6e0b, U+6ecb, U+6fc3, U+72ac, U+773c, U+77e2, U+7968, U+7a74, U+7dba, U+7dd1, U+7e3e, U+808c, U+811a, U+8179, U+8239, U+8584, U+8a0e, U+8a72, U+8b66, U+8c46, U+8f29, U+90a3, U+9234, U+96f0, U+9769, U+9774, U+9aa8, U+ff26, U+ff28, U+ff9e-ff9f",
    "[97]": "U+7e, U+b4, U+25c6, U+2661, U+4e92, U+4eee, U+4ffa, U+5144, U+5237, U+5287, U+52b4, U+58c1, U+5bff, U+5c04, U+5c06, U+5e95, U+5f31, U+5f93, U+63c3, U+640d, U+6557, U+6614, U+662f, U+67d3, U+690d, U+6bba, U+6e6f, U+72af, U+732b, U+7518, U+7ae0, U+7ae5, U+7af6, U+822a, U+89e6, U+8a3a, U+8a98, U+8cb8, U+8de1, U+8e8d, U+95d8, U+961c, U+96a3, U+96ea, U+9bae, U+ff20, U+ff22, U+ff29, U+ff2b-ff2c",
    "[98]": "U+25cb, U+4e71, U+4f59, U+50d5, U+520a, U+5217, U+5230, U+523a-523b, U+541b, U+5439, U+5747, U+59c9, U+5bdf, U+5c31, U+5de8, U+5e7c, U+5f69, U+6050, U+60d1, U+63cf, U+663c, U+67c4, U+6885, U+6c38, U+6d6e, U+6db2, U+6df7, U+6e2c, U+6f5f, U+7532, U+76e3-76e4, U+7701, U+793c, U+79f0, U+7a93, U+7d00, U+7de0, U+7e54, U+8328, U+8840, U+969c, U+96e8, U+9811, U+9aea, U+9b5a, U+ff24, U+ff2e, U+ff57",
    "[99]": "U+2191, U+505c, U+52e4, U+5305, U+535a, U+56e0, U+59bb, U+5acc, U+5b09, U+5b87, U+5c90, U+5df1, U+5e2d, U+5e33, U+5f3e, U+6298, U+6383, U+653b, U+6697, U+6804, U+6a39, U+6cca, U+6e90, U+6f2b, U+702c, U+7206, U+7236, U+7559, U+7565, U+7591, U+75c7, U+75db, U+7b4b, U+7bb1, U+7d99, U+7fbd, U+8131, U+885b, U+8b1d, U+8ff7, U+9003, U+9045, U+96a0, U+9732, U+990a, U+99d0, U+9e97, U+9f62, U+ff25, U+ff2d",
    "[100]": "U+4e08, U+4f9d, U+5012, U+514d, U+51b7, U+5275, U+53ca, U+53f8, U+5584, U+57fc, U+5b9d, U+5bfa, U+5c3e, U+5f01, U+5fb4, U+5fd7, U+606f, U+62e1, U+6563, U+6674, U+6cb3, U+6d3e, U+6d74, U+6e1b, U+6e2f, U+718a, U+7247, U+79d8, U+7d14, U+7d66, U+7d71, U+7df4, U+7e41, U+80cc, U+8155, U+83d3, U+8a95, U+8ab2, U+8ad6, U+8ca1, U+9000, U+9006, U+9678, U+97d3, U+9808, U+98ef, U+9a5a, U+9b45, U+ff23, U+ff30",
    "[101]": "U+25bc, U+3012, U+4ef2, U+4f0a, U+516b, U+5373, U+539a, U+53b3, U+559c, U+56f0, U+5727, U+5742, U+5965, U+59ff, U+5bc6, U+5dfb, U+5e45, U+5ead, U+5fb3, U+6211, U+6253, U+639b, U+63a8, U+6545, U+6575, U+6628, U+672d, U+68a8, U+6bdb, U+6d25, U+707d, U+767e, U+7834, U+7b46, U+7bc9, U+8074, U+82e6, U+8349, U+8a2a, U+8d70, U+8da3, U+8fce, U+91cc, U+967d, U+97ff, U+9996, U+ff1c, U+ff2f, U+ff32, U+ff34",
    "[102]": "U+3d, U+5e, U+25cf, U+4e0e, U+4e5d, U+4e73, U+4e94, U+4f3c, U+5009, U+5145, U+51ac, U+5238, U+524a, U+53f3, U+547c, U+5802, U+5922, U+5a66, U+5c0e, U+5de6, U+5fd8, U+5feb, U+6797, U+685c, U+6b7b, U+6c5f-6c60, U+6cc9, U+6ce2, U+6d17, U+6e21, U+7167, U+7642, U+76db, U+8001, U+821e, U+8857, U+89d2, U+8b1b, U+8b70, U+8cb4, U+8cde, U+8f03, U+8f2a, U+968e, U+9b54, U+9e7f, U+9ebb, U+ff05, U+ff33",
    "[103]": "U+500d, U+5074, U+50cd, U+5175, U+52e2, U+5352, U+5354, U+53f2, U+5409, U+56fa, U+5a18, U+5b88, U+5bdd, U+5ca9, U+5f92, U+5fa9, U+60a9, U+623f, U+6483, U+653f, U+666f, U+66ae, U+66f2, U+6a21, U+6b66, U+6bcd, U+6d5c, U+796d, U+7a4d, U+7aef, U+7b56, U+7b97, U+7c4d, U+7e04, U+7fa9, U+8377, U+83dc, U+83ef, U+8535, U+8863, U+88cf, U+88dc, U+8907, U+8acb, U+90ce, U+91dd, U+ff0b, U+ff0d, U+ff19, U+ff65",
    "[104]": "U+4e01, U+4e21, U+4e38, U+52a9, U+547d, U+592e, U+5931, U+5b63, U+5c40, U+5dde, U+5e78, U+5efa, U+5fa1, U+604b, U+6075, U+62c5, U+632f, U+6a19, U+6c0f, U+6c11, U+6c96, U+6e05, U+70ba, U+71b1, U+7387, U+7403, U+75c5, U+77ed, U+795d, U+7b54, U+7cbe, U+7d19, U+7fa4, U+8089, U+81f4, U+8208, U+8336, U+8457, U+8a33, U+8c4a, U+8ca0, U+8ca8, U+8cc0, U+9014, U+964d, U+9803, U+983c, U+98db, U+ff17, U+ff21",
    "[105]": "U+25, U+25a0, U+4e26, U+4f4e, U+5341, U+56f2, U+5bbf, U+5c45, U+5c55, U+5c5e, U+5dee, U+5e9c, U+5f7c, U+6255, U+627f, U+62bc, U+65cf, U+661f, U+666e, U+66dc, U+67fb, U+6975, U+6a4b, U+6b32, U+6df1, U+6e29, U+6fc0, U+738b, U+7686, U+7a76, U+7a81, U+7c73, U+7d75, U+7dd2, U+82e5, U+82f1, U+85ac, U+888b, U+899a, U+8a31, U+8a8c, U+8ab0, U+8b58, U+904a, U+9060, U+9280, U+95b2, U+984d, U+9ce5, U+ff18",
    "[106]": "U+30f6, U+50ac, U+5178, U+51e6, U+5224, U+52dd, U+5883, U+5897, U+590f, U+5a5a, U+5bb3, U+5c65, U+5e03, U+5e2b, U+5e30, U+5eb7, U+6271, U+63f4, U+64ae, U+6574, U+672b, U+679a, U+6a29-6a2a, U+6ca2, U+6cc1, U+6d0b, U+713c, U+74b0, U+7981, U+7a0b, U+7bc0, U+7d1a, U+7d61, U+7fd2, U+822c, U+8996, U+89aa, U+8cac, U+8cbb, U+8d77, U+8def, U+9020, U+9152, U+9244, U+9662, U+967a, U+96e3, U+9759, U+ff16",
    "[107]": "U+23, U+3c, U+2192, U+4e45, U+4efb, U+4f50, U+4f8b, U+4fc2, U+5024, U+5150, U+5272, U+5370, U+53bb, U+542b, U+56db, U+56e3, U+57ce, U+5bc4, U+5bcc, U+5f71, U+60aa, U+6238, U+6280, U+629c, U+6539, U+66ff, U+670d, U+677e-677f, U+6839, U+69cb, U+6b4c, U+6bb5, U+6e96, U+6f14, U+72ec, U+7389, U+7814, U+79cb, U+79d1, U+79fb, U+7a0e, U+7d0d, U+85e4, U+8d64, U+9632, U+96e2, U+9805, U+99ac, U+ff1e",
    "[108]": "U+2605-2606, U+301c, U+4e57, U+4fee, U+5065, U+52df, U+533b, U+5357, U+57df, U+58eb, U+58f0, U+591c, U+592a-592b, U+5948, U+5b85, U+5d0e, U+5ea7, U+5ff5, U+6025, U+63a1, U+63a5, U+63db, U+643a, U+65bd, U+671d, U+68ee, U+6982, U+6b73, U+6bd4, U+6d88, U+7570, U+7b11, U+7d76, U+8077, U+8217, U+8c37, U+8c61, U+8cc7, U+8d85, U+901f, U+962a, U+9802, U+9806, U+9854, U+98f2, U+9928, U+99c5, U+9ed2",
    "[109]": "U+266a, U+4f11, U+533a, U+5343, U+534a, U+53cd, U+5404, U+56f3, U+5b57-5b58, U+5bae, U+5c4a, U+5e0c, U+5e2f, U+5eab, U+5f35, U+5f79, U+614b, U+6226, U+629e, U+65c5, U+6625, U+6751, U+6821, U+6b69, U+6b8b, U+6bce, U+6c42, U+706b, U+7c21, U+7cfb, U+805e, U+80b2, U+82b8, U+843d, U+8853, U+88c5, U+8a3c, U+8a66, U+8d8a, U+8fba, U+9069, U+91cf, U+9752, U+975e, U+9999, U+ff0f-ff10, U+ff14-ff15",
    "[110]": "U+40, U+4e86, U+4e95, U+4f01, U+4f1d, U+4fbf, U+5099, U+5171, U+5177, U+53cb, U+53ce, U+53f0, U+5668, U+5712, U+5ba4, U+5ca1, U+5f85, U+60f3, U+653e, U+65ad, U+65e9, U+6620, U+6750, U+6761, U+6b62, U+6b74, U+6e08, U+6e80, U+7248, U+7531, U+7533, U+753a, U+77f3, U+798f, U+7f6e, U+8449, U+88fd, U+89b3, U+8a55, U+8ac7, U+8b77, U+8db3, U+8efd, U+8fd4, U+9031-9032, U+9580, U+9589, U+96d1, U+985e",
    "[111]": "U+2b, U+d7, U+300e-300f, U+4e07, U+4e8c, U+512a, U+5149, U+518d, U+5236, U+52b9, U+52d9, U+5468, U+578b, U+57fa, U+5b8c, U+5ba2, U+5c02, U+5de5, U+5f37, U+5f62, U+623b, U+63d0, U+652f, U+672a, U+6848, U+6d41, U+7136, U+7537, U+754c, U+76f4, U+79c1, U+7ba1, U+7d44, U+7d4c, U+7dcf, U+7dda, U+7de8, U+82b1, U+897f, U+8ca9, U+8cfc, U+904e, U+9664, U+982d, U+9858, U+98a8, U+9a13, U+ff13, U+ff5c",
    "[112]": "U+4e16, U+4e3b, U+4ea4, U+4ee4, U+4f4d, U+4f4f, U+4f55, U+4f9b, U+5317, U+5358, U+53c2, U+53e4, U+548c, U+571f, U+59cb, U+5cf6, U+5e38, U+63a2, U+63b2, U+6559, U+662d, U+679c, U+6c7a, U+72b6, U+7523, U+767d, U+770c, U+7a2e, U+7a3f, U+7a7a, U+7b2c, U+7b49, U+7d20, U+7d42, U+8003, U+8272, U+8a08, U+8aac, U+8cb7, U+8eab, U+8ee2, U+9054-9055, U+90fd, U+914d, U+91cd, U+969b, U+97f3, U+984c, U+ff06",
    "[113]": "U+26, U+5f, U+2026, U+203b, U+4e09, U+4eac, U+4ed5, U+4fa1, U+5143, U+5199, U+5207, U+539f, U+53e3, U+53f7, U+5411, U+5473, U+5546, U+55b6, U+5929, U+597d, U+5bb9, U+5c11, U+5c4b, U+5ddd, U+5f97, U+5fc5, U+6295, U+6301, U+6307, U+671b, U+76f8, U+78ba, U+795e, U+7d30, U+7d39, U+7d9a, U+89e3, U+8a00, U+8a73, U+8a8d, U+8a9e, U+8aad, U+8abf, U+8cea, U+8eca, U+8ffd, U+904b, U+9650, U+ff11-ff12",
    "[114]": "U+3e, U+3005, U+4e0d, U+4e88, U+4ecb, U+4ee3, U+4ef6, U+4fdd, U+4fe1, U+500b, U+50cf, U+5186, U+5316, U+53d7, U+540c, U+544a, U+54e1, U+5728, U+58f2, U+5973, U+5b89, U+5c71, U+5e02, U+5e97, U+5f15, U+5fc3, U+5fdc, U+601d, U+611b, U+611f, U+671f, U+6728, U+6765, U+683c, U+6b21, U+6ce8, U+6d3b, U+6d77, U+7530, U+7740, U+7acb, U+7d50, U+826f, U+8f09, U+8fbc, U+9001, U+9053, U+91ce, U+9762, U+98df",
    "[115]": "U+7c, U+3080, U+4ee5, U+5148, U+516c, U+521d, U+5225, U+529b, U+52a0, U+53ef, U+56de, U+56fd, U+5909, U+591a, U+5b66, U+5b9f, U+5bb6, U+5bfe, U+5e73, U+5e83, U+5ea6, U+5f53, U+6027, U+610f, U+6210, U+6240, U+660e, U+66f4, U+66f8, U+6709, U+6771, U+697d, U+69d8, U+6a5f, U+6c34, U+6cbb, U+73fe, U+756a, U+7684, U+771f, U+793a, U+7f8e, U+898f, U+8a2d, U+8a71, U+8fd1, U+9078, U+9577, U+96fb, U+ff5e",
    "[116]": "U+a9, U+3010-3011, U+30e2, U+4e0b, U+4eca, U+4ed6, U+4ed8, U+4f53, U+4f5c, U+4f7f, U+53d6, U+540d, U+54c1, U+5730, U+5916, U+5b50, U+5c0f, U+5f8c, U+624b, U+6570, U+6587, U+6599, U+691c, U+696d, U+6cd5, U+7269, U+7279, U+7406, U+767a-767b, U+77e5, U+7d04, U+7d22, U+8005, U+80fd, U+81ea, U+8868, U+8981, U+89a7, U+901a, U+9023, U+90e8, U+91d1, U+9332, U+958b, U+96c6, U+9ad8, U+ff1a, U+ff1f",
    "[117]": "U+4e, U+a0, U+3000, U+300c-300d, U+4e00, U+4e0a, U+4e2d, U+4e8b, U+4eba, U+4f1a, U+5165, U+5168, U+5185, U+51fa, U+5206, U+5229, U+524d, U+52d5, U+5408, U+554f, U+5831, U+5834, U+5927, U+5b9a, U+5e74, U+5f0f, U+60c5, U+65b0, U+65b9, U+6642, U+6700, U+672c, U+682a, U+6b63, U+6c17, U+7121, U+751f, U+7528, U+753b, U+76ee, U+793e, U+884c, U+898b, U+8a18, U+9593, U+95a2, U+ff01, U+ff08-ff09",
    "[118]": "U+21-22, U+27-2a, U+2c-3b, U+3f, U+41-4d, U+4f-5d, U+61-7b, U+7d, U+ab, U+ae, U+b2-b3, U+b7, U+bb, U+c9, U+cd, U+d6, U+d8, U+dc, U+e0-e5, U+e7-ed, U+ef, U+f1-f4, U+f6, U+f8, U+fa, U+fc-fd, U+103, U+14d, U+1b0, U+300-301, U+1ebf, U+1ec7, U+2013-2014, U+201c-201d, U+2039-203a, U+203c, U+2048-2049, U+2113, U+2122, U+65e5, U+6708, U+70b9",
    "[119]": "U+20, U+2027, U+3001-3002, U+3041-307f, U+3081-308f, U+3091-3093, U+3099-309a, U+309d-309e, U+30a1-30e1, U+30e3-30ed, U+30ef-30f0, U+30f2-30f4, U+30fb-30fe, U+ff0c, U+ff0e",
    cyrillic: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
    vietnamese: "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB",
    "latin-ext": "U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    latin: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
  },
  fonts: {
    normal: {
      "100": {
        "[0]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2",
        "[1]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.1.woff2",
        "[2]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.2.woff2",
        "[3]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.3.woff2",
        "[4]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.4.woff2",
        "[5]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.5.woff2",
        "[6]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.6.woff2",
        "[7]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.7.woff2",
        "[8]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.8.woff2",
        "[9]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.9.woff2",
        "[10]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.10.woff2",
        "[11]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.11.woff2",
        "[12]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.12.woff2",
        "[13]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.13.woff2",
        "[14]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.14.woff2",
        "[15]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.15.woff2",
        "[16]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.16.woff2",
        "[17]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.17.woff2",
        "[18]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.18.woff2",
        "[19]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.19.woff2",
        "[20]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.20.woff2",
        "[21]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.21.woff2",
        "[22]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.22.woff2",
        "[23]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.23.woff2",
        "[24]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.24.woff2",
        "[25]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.25.woff2",
        "[26]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.26.woff2",
        "[27]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.27.woff2",
        "[28]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.28.woff2",
        "[29]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.29.woff2",
        "[30]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.30.woff2",
        "[31]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.31.woff2",
        "[32]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.32.woff2",
        "[33]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.33.woff2",
        "[34]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.34.woff2",
        "[35]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.35.woff2",
        "[36]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.36.woff2",
        "[37]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.37.woff2",
        "[38]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.38.woff2",
        "[39]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.39.woff2",
        "[40]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.40.woff2",
        "[41]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.41.woff2",
        "[42]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.42.woff2",
        "[43]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.43.woff2",
        "[44]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.44.woff2",
        "[45]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.45.woff2",
        "[46]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.46.woff2",
        "[47]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.47.woff2",
        "[48]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.48.woff2",
        "[49]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.49.woff2",
        "[50]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.50.woff2",
        "[51]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.51.woff2",
        "[52]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.52.woff2",
        "[53]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.53.woff2",
        "[54]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.54.woff2",
        "[55]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.55.woff2",
        "[56]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.56.woff2",
        "[57]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.57.woff2",
        "[58]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.58.woff2",
        "[59]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.59.woff2",
        "[60]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.60.woff2",
        "[61]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.61.woff2",
        "[62]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.62.woff2",
        "[63]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.63.woff2",
        "[64]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.64.woff2",
        "[65]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.65.woff2",
        "[66]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.66.woff2",
        "[67]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.67.woff2",
        "[68]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.68.woff2",
        "[69]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.69.woff2",
        "[70]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.70.woff2",
        "[71]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.71.woff2",
        "[72]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.72.woff2",
        "[73]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.73.woff2",
        "[74]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.74.woff2",
        "[75]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.75.woff2",
        "[76]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.76.woff2",
        "[77]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.77.woff2",
        "[78]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.78.woff2",
        "[79]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.79.woff2",
        "[80]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.80.woff2",
        "[81]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.81.woff2",
        "[82]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.82.woff2",
        "[83]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.83.woff2",
        "[84]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.84.woff2",
        "[85]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.85.woff2",
        "[86]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.86.woff2",
        "[87]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.87.woff2",
        "[88]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.88.woff2",
        "[89]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.89.woff2",
        "[90]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.90.woff2",
        "[91]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.91.woff2",
        "[92]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.92.woff2",
        "[93]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.93.woff2",
        "[94]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.94.woff2",
        "[95]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.95.woff2",
        "[96]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.96.woff2",
        "[97]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.97.woff2",
        "[98]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.98.woff2",
        "[99]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.99.woff2",
        "[100]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.100.woff2",
        "[101]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.101.woff2",
        "[102]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.102.woff2",
        "[103]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.103.woff2",
        "[104]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.104.woff2",
        "[105]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.105.woff2",
        "[106]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.106.woff2",
        "[107]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.107.woff2",
        "[108]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.108.woff2",
        "[109]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.109.woff2",
        "[110]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.110.woff2",
        "[111]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.111.woff2",
        "[112]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.112.woff2",
        "[113]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.113.woff2",
        "[114]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.114.woff2",
        "[115]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.115.woff2",
        "[116]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.116.woff2",
        "[117]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.117.woff2",
        "[118]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.118.woff2",
        "[119]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.119.woff2",
        cyrillic: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYxQgP6lY.woff2",
        vietnamese: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzggP6lY.woff2",
        "latin-ext": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzwgP6lY.woff2",
        latin: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYwQgP.woff2"
      },
      "200": {
        "[0]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2",
        "[1]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.1.woff2",
        "[2]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.2.woff2",
        "[3]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.3.woff2",
        "[4]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.4.woff2",
        "[5]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.5.woff2",
        "[6]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.6.woff2",
        "[7]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.7.woff2",
        "[8]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.8.woff2",
        "[9]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.9.woff2",
        "[10]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.10.woff2",
        "[11]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.11.woff2",
        "[12]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.12.woff2",
        "[13]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.13.woff2",
        "[14]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.14.woff2",
        "[15]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.15.woff2",
        "[16]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.16.woff2",
        "[17]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.17.woff2",
        "[18]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.18.woff2",
        "[19]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.19.woff2",
        "[20]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.20.woff2",
        "[21]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.21.woff2",
        "[22]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.22.woff2",
        "[23]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.23.woff2",
        "[24]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.24.woff2",
        "[25]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.25.woff2",
        "[26]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.26.woff2",
        "[27]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.27.woff2",
        "[28]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.28.woff2",
        "[29]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.29.woff2",
        "[30]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.30.woff2",
        "[31]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.31.woff2",
        "[32]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.32.woff2",
        "[33]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.33.woff2",
        "[34]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.34.woff2",
        "[35]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.35.woff2",
        "[36]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.36.woff2",
        "[37]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.37.woff2",
        "[38]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.38.woff2",
        "[39]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.39.woff2",
        "[40]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.40.woff2",
        "[41]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.41.woff2",
        "[42]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.42.woff2",
        "[43]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.43.woff2",
        "[44]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.44.woff2",
        "[45]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.45.woff2",
        "[46]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.46.woff2",
        "[47]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.47.woff2",
        "[48]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.48.woff2",
        "[49]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.49.woff2",
        "[50]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.50.woff2",
        "[51]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.51.woff2",
        "[52]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.52.woff2",
        "[53]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.53.woff2",
        "[54]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.54.woff2",
        "[55]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.55.woff2",
        "[56]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.56.woff2",
        "[57]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.57.woff2",
        "[58]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.58.woff2",
        "[59]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.59.woff2",
        "[60]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.60.woff2",
        "[61]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.61.woff2",
        "[62]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.62.woff2",
        "[63]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.63.woff2",
        "[64]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.64.woff2",
        "[65]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.65.woff2",
        "[66]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.66.woff2",
        "[67]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.67.woff2",
        "[68]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.68.woff2",
        "[69]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.69.woff2",
        "[70]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.70.woff2",
        "[71]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.71.woff2",
        "[72]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.72.woff2",
        "[73]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.73.woff2",
        "[74]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.74.woff2",
        "[75]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.75.woff2",
        "[76]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.76.woff2",
        "[77]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.77.woff2",
        "[78]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.78.woff2",
        "[79]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.79.woff2",
        "[80]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.80.woff2",
        "[81]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.81.woff2",
        "[82]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.82.woff2",
        "[83]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.83.woff2",
        "[84]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.84.woff2",
        "[85]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.85.woff2",
        "[86]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.86.woff2",
        "[87]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.87.woff2",
        "[88]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.88.woff2",
        "[89]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.89.woff2",
        "[90]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.90.woff2",
        "[91]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.91.woff2",
        "[92]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.92.woff2",
        "[93]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.93.woff2",
        "[94]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.94.woff2",
        "[95]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.95.woff2",
        "[96]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.96.woff2",
        "[97]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.97.woff2",
        "[98]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.98.woff2",
        "[99]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.99.woff2",
        "[100]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.100.woff2",
        "[101]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.101.woff2",
        "[102]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.102.woff2",
        "[103]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.103.woff2",
        "[104]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.104.woff2",
        "[105]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.105.woff2",
        "[106]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.106.woff2",
        "[107]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.107.woff2",
        "[108]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.108.woff2",
        "[109]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.109.woff2",
        "[110]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.110.woff2",
        "[111]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.111.woff2",
        "[112]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.112.woff2",
        "[113]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.113.woff2",
        "[114]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.114.woff2",
        "[115]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.115.woff2",
        "[116]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.116.woff2",
        "[117]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.117.woff2",
        "[118]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.118.woff2",
        "[119]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.119.woff2",
        cyrillic: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYxQgP6lY.woff2",
        vietnamese: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzggP6lY.woff2",
        "latin-ext": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzwgP6lY.woff2",
        latin: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYwQgP.woff2"
      },
      "300": {
        "[0]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2",
        "[1]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.1.woff2",
        "[2]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.2.woff2",
        "[3]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.3.woff2",
        "[4]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.4.woff2",
        "[5]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.5.woff2",
        "[6]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.6.woff2",
        "[7]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.7.woff2",
        "[8]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.8.woff2",
        "[9]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.9.woff2",
        "[10]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.10.woff2",
        "[11]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.11.woff2",
        "[12]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.12.woff2",
        "[13]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.13.woff2",
        "[14]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.14.woff2",
        "[15]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.15.woff2",
        "[16]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.16.woff2",
        "[17]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.17.woff2",
        "[18]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.18.woff2",
        "[19]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.19.woff2",
        "[20]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.20.woff2",
        "[21]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.21.woff2",
        "[22]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.22.woff2",
        "[23]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.23.woff2",
        "[24]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.24.woff2",
        "[25]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.25.woff2",
        "[26]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.26.woff2",
        "[27]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.27.woff2",
        "[28]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.28.woff2",
        "[29]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.29.woff2",
        "[30]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.30.woff2",
        "[31]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.31.woff2",
        "[32]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.32.woff2",
        "[33]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.33.woff2",
        "[34]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.34.woff2",
        "[35]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.35.woff2",
        "[36]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.36.woff2",
        "[37]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.37.woff2",
        "[38]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.38.woff2",
        "[39]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.39.woff2",
        "[40]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.40.woff2",
        "[41]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.41.woff2",
        "[42]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.42.woff2",
        "[43]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.43.woff2",
        "[44]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.44.woff2",
        "[45]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.45.woff2",
        "[46]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.46.woff2",
        "[47]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.47.woff2",
        "[48]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.48.woff2",
        "[49]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.49.woff2",
        "[50]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.50.woff2",
        "[51]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.51.woff2",
        "[52]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.52.woff2",
        "[53]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.53.woff2",
        "[54]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.54.woff2",
        "[55]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.55.woff2",
        "[56]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.56.woff2",
        "[57]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.57.woff2",
        "[58]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.58.woff2",
        "[59]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.59.woff2",
        "[60]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.60.woff2",
        "[61]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.61.woff2",
        "[62]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.62.woff2",
        "[63]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.63.woff2",
        "[64]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.64.woff2",
        "[65]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.65.woff2",
        "[66]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.66.woff2",
        "[67]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.67.woff2",
        "[68]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.68.woff2",
        "[69]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.69.woff2",
        "[70]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.70.woff2",
        "[71]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.71.woff2",
        "[72]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.72.woff2",
        "[73]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.73.woff2",
        "[74]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.74.woff2",
        "[75]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.75.woff2",
        "[76]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.76.woff2",
        "[77]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.77.woff2",
        "[78]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.78.woff2",
        "[79]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.79.woff2",
        "[80]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.80.woff2",
        "[81]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.81.woff2",
        "[82]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.82.woff2",
        "[83]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.83.woff2",
        "[84]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.84.woff2",
        "[85]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.85.woff2",
        "[86]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.86.woff2",
        "[87]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.87.woff2",
        "[88]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.88.woff2",
        "[89]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.89.woff2",
        "[90]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.90.woff2",
        "[91]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.91.woff2",
        "[92]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.92.woff2",
        "[93]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.93.woff2",
        "[94]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.94.woff2",
        "[95]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.95.woff2",
        "[96]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.96.woff2",
        "[97]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.97.woff2",
        "[98]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.98.woff2",
        "[99]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.99.woff2",
        "[100]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.100.woff2",
        "[101]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.101.woff2",
        "[102]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.102.woff2",
        "[103]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.103.woff2",
        "[104]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.104.woff2",
        "[105]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.105.woff2",
        "[106]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.106.woff2",
        "[107]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.107.woff2",
        "[108]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.108.woff2",
        "[109]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.109.woff2",
        "[110]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.110.woff2",
        "[111]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.111.woff2",
        "[112]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.112.woff2",
        "[113]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.113.woff2",
        "[114]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.114.woff2",
        "[115]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.115.woff2",
        "[116]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.116.woff2",
        "[117]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.117.woff2",
        "[118]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.118.woff2",
        "[119]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.119.woff2",
        cyrillic: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYxQgP6lY.woff2",
        vietnamese: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzggP6lY.woff2",
        "latin-ext": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzwgP6lY.woff2",
        latin: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYwQgP.woff2"
      },
      "400": {
        "[0]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2",
        "[1]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.1.woff2",
        "[2]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.2.woff2",
        "[3]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.3.woff2",
        "[4]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.4.woff2",
        "[5]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.5.woff2",
        "[6]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.6.woff2",
        "[7]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.7.woff2",
        "[8]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.8.woff2",
        "[9]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.9.woff2",
        "[10]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.10.woff2",
        "[11]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.11.woff2",
        "[12]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.12.woff2",
        "[13]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.13.woff2",
        "[14]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.14.woff2",
        "[15]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.15.woff2",
        "[16]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.16.woff2",
        "[17]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.17.woff2",
        "[18]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.18.woff2",
        "[19]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.19.woff2",
        "[20]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.20.woff2",
        "[21]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.21.woff2",
        "[22]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.22.woff2",
        "[23]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.23.woff2",
        "[24]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.24.woff2",
        "[25]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.25.woff2",
        "[26]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.26.woff2",
        "[27]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.27.woff2",
        "[28]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.28.woff2",
        "[29]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.29.woff2",
        "[30]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.30.woff2",
        "[31]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.31.woff2",
        "[32]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.32.woff2",
        "[33]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.33.woff2",
        "[34]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.34.woff2",
        "[35]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.35.woff2",
        "[36]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.36.woff2",
        "[37]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.37.woff2",
        "[38]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.38.woff2",
        "[39]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.39.woff2",
        "[40]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.40.woff2",
        "[41]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.41.woff2",
        "[42]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.42.woff2",
        "[43]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.43.woff2",
        "[44]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.44.woff2",
        "[45]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.45.woff2",
        "[46]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.46.woff2",
        "[47]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.47.woff2",
        "[48]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.48.woff2",
        "[49]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.49.woff2",
        "[50]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.50.woff2",
        "[51]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.51.woff2",
        "[52]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.52.woff2",
        "[53]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.53.woff2",
        "[54]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.54.woff2",
        "[55]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.55.woff2",
        "[56]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.56.woff2",
        "[57]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.57.woff2",
        "[58]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.58.woff2",
        "[59]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.59.woff2",
        "[60]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.60.woff2",
        "[61]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.61.woff2",
        "[62]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.62.woff2",
        "[63]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.63.woff2",
        "[64]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.64.woff2",
        "[65]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.65.woff2",
        "[66]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.66.woff2",
        "[67]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.67.woff2",
        "[68]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.68.woff2",
        "[69]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.69.woff2",
        "[70]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.70.woff2",
        "[71]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.71.woff2",
        "[72]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.72.woff2",
        "[73]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.73.woff2",
        "[74]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.74.woff2",
        "[75]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.75.woff2",
        "[76]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.76.woff2",
        "[77]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.77.woff2",
        "[78]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.78.woff2",
        "[79]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.79.woff2",
        "[80]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.80.woff2",
        "[81]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.81.woff2",
        "[82]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.82.woff2",
        "[83]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.83.woff2",
        "[84]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.84.woff2",
        "[85]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.85.woff2",
        "[86]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.86.woff2",
        "[87]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.87.woff2",
        "[88]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.88.woff2",
        "[89]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.89.woff2",
        "[90]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.90.woff2",
        "[91]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.91.woff2",
        "[92]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.92.woff2",
        "[93]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.93.woff2",
        "[94]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.94.woff2",
        "[95]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.95.woff2",
        "[96]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.96.woff2",
        "[97]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.97.woff2",
        "[98]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.98.woff2",
        "[99]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.99.woff2",
        "[100]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.100.woff2",
        "[101]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.101.woff2",
        "[102]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.102.woff2",
        "[103]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.103.woff2",
        "[104]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.104.woff2",
        "[105]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.105.woff2",
        "[106]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.106.woff2",
        "[107]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.107.woff2",
        "[108]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.108.woff2",
        "[109]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.109.woff2",
        "[110]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.110.woff2",
        "[111]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.111.woff2",
        "[112]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.112.woff2",
        "[113]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.113.woff2",
        "[114]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.114.woff2",
        "[115]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.115.woff2",
        "[116]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.116.woff2",
        "[117]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.117.woff2",
        "[118]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.118.woff2",
        "[119]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.119.woff2",
        cyrillic: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYxQgP6lY.woff2",
        vietnamese: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzggP6lY.woff2",
        "latin-ext": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzwgP6lY.woff2",
        latin: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYwQgP.woff2"
      },
      "500": {
        "[0]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2",
        "[1]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.1.woff2",
        "[2]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.2.woff2",
        "[3]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.3.woff2",
        "[4]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.4.woff2",
        "[5]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.5.woff2",
        "[6]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.6.woff2",
        "[7]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.7.woff2",
        "[8]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.8.woff2",
        "[9]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.9.woff2",
        "[10]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.10.woff2",
        "[11]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.11.woff2",
        "[12]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.12.woff2",
        "[13]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.13.woff2",
        "[14]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.14.woff2",
        "[15]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.15.woff2",
        "[16]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.16.woff2",
        "[17]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.17.woff2",
        "[18]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.18.woff2",
        "[19]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.19.woff2",
        "[20]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.20.woff2",
        "[21]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.21.woff2",
        "[22]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.22.woff2",
        "[23]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.23.woff2",
        "[24]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.24.woff2",
        "[25]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.25.woff2",
        "[26]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.26.woff2",
        "[27]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.27.woff2",
        "[28]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.28.woff2",
        "[29]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.29.woff2",
        "[30]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.30.woff2",
        "[31]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.31.woff2",
        "[32]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.32.woff2",
        "[33]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.33.woff2",
        "[34]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.34.woff2",
        "[35]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.35.woff2",
        "[36]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.36.woff2",
        "[37]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.37.woff2",
        "[38]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.38.woff2",
        "[39]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.39.woff2",
        "[40]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.40.woff2",
        "[41]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.41.woff2",
        "[42]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.42.woff2",
        "[43]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.43.woff2",
        "[44]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.44.woff2",
        "[45]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.45.woff2",
        "[46]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.46.woff2",
        "[47]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.47.woff2",
        "[48]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.48.woff2",
        "[49]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.49.woff2",
        "[50]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.50.woff2",
        "[51]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.51.woff2",
        "[52]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.52.woff2",
        "[53]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.53.woff2",
        "[54]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.54.woff2",
        "[55]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.55.woff2",
        "[56]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.56.woff2",
        "[57]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.57.woff2",
        "[58]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.58.woff2",
        "[59]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.59.woff2",
        "[60]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.60.woff2",
        "[61]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.61.woff2",
        "[62]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.62.woff2",
        "[63]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.63.woff2",
        "[64]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.64.woff2",
        "[65]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.65.woff2",
        "[66]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.66.woff2",
        "[67]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.67.woff2",
        "[68]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.68.woff2",
        "[69]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.69.woff2",
        "[70]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.70.woff2",
        "[71]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.71.woff2",
        "[72]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.72.woff2",
        "[73]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.73.woff2",
        "[74]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.74.woff2",
        "[75]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.75.woff2",
        "[76]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.76.woff2",
        "[77]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.77.woff2",
        "[78]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.78.woff2",
        "[79]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.79.woff2",
        "[80]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.80.woff2",
        "[81]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.81.woff2",
        "[82]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.82.woff2",
        "[83]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.83.woff2",
        "[84]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.84.woff2",
        "[85]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.85.woff2",
        "[86]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.86.woff2",
        "[87]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.87.woff2",
        "[88]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.88.woff2",
        "[89]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.89.woff2",
        "[90]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.90.woff2",
        "[91]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.91.woff2",
        "[92]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.92.woff2",
        "[93]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.93.woff2",
        "[94]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.94.woff2",
        "[95]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.95.woff2",
        "[96]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.96.woff2",
        "[97]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.97.woff2",
        "[98]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.98.woff2",
        "[99]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.99.woff2",
        "[100]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.100.woff2",
        "[101]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.101.woff2",
        "[102]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.102.woff2",
        "[103]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.103.woff2",
        "[104]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.104.woff2",
        "[105]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.105.woff2",
        "[106]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.106.woff2",
        "[107]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.107.woff2",
        "[108]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.108.woff2",
        "[109]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.109.woff2",
        "[110]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.110.woff2",
        "[111]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.111.woff2",
        "[112]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.112.woff2",
        "[113]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.113.woff2",
        "[114]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.114.woff2",
        "[115]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.115.woff2",
        "[116]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.116.woff2",
        "[117]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.117.woff2",
        "[118]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.118.woff2",
        "[119]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.119.woff2",
        cyrillic: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYxQgP6lY.woff2",
        vietnamese: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzggP6lY.woff2",
        "latin-ext": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzwgP6lY.woff2",
        latin: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYwQgP.woff2"
      },
      "600": {
        "[0]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2",
        "[1]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.1.woff2",
        "[2]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.2.woff2",
        "[3]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.3.woff2",
        "[4]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.4.woff2",
        "[5]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.5.woff2",
        "[6]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.6.woff2",
        "[7]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.7.woff2",
        "[8]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.8.woff2",
        "[9]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.9.woff2",
        "[10]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.10.woff2",
        "[11]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.11.woff2",
        "[12]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.12.woff2",
        "[13]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.13.woff2",
        "[14]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.14.woff2",
        "[15]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.15.woff2",
        "[16]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.16.woff2",
        "[17]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.17.woff2",
        "[18]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.18.woff2",
        "[19]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.19.woff2",
        "[20]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.20.woff2",
        "[21]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.21.woff2",
        "[22]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.22.woff2",
        "[23]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.23.woff2",
        "[24]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.24.woff2",
        "[25]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.25.woff2",
        "[26]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.26.woff2",
        "[27]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.27.woff2",
        "[28]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.28.woff2",
        "[29]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.29.woff2",
        "[30]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.30.woff2",
        "[31]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.31.woff2",
        "[32]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.32.woff2",
        "[33]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.33.woff2",
        "[34]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.34.woff2",
        "[35]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.35.woff2",
        "[36]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.36.woff2",
        "[37]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.37.woff2",
        "[38]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.38.woff2",
        "[39]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.39.woff2",
        "[40]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.40.woff2",
        "[41]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.41.woff2",
        "[42]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.42.woff2",
        "[43]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.43.woff2",
        "[44]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.44.woff2",
        "[45]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.45.woff2",
        "[46]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.46.woff2",
        "[47]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.47.woff2",
        "[48]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.48.woff2",
        "[49]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.49.woff2",
        "[50]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.50.woff2",
        "[51]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.51.woff2",
        "[52]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.52.woff2",
        "[53]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.53.woff2",
        "[54]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.54.woff2",
        "[55]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.55.woff2",
        "[56]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.56.woff2",
        "[57]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.57.woff2",
        "[58]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.58.woff2",
        "[59]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.59.woff2",
        "[60]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.60.woff2",
        "[61]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.61.woff2",
        "[62]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.62.woff2",
        "[63]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.63.woff2",
        "[64]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.64.woff2",
        "[65]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.65.woff2",
        "[66]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.66.woff2",
        "[67]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.67.woff2",
        "[68]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.68.woff2",
        "[69]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.69.woff2",
        "[70]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.70.woff2",
        "[71]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.71.woff2",
        "[72]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.72.woff2",
        "[73]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.73.woff2",
        "[74]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.74.woff2",
        "[75]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.75.woff2",
        "[76]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.76.woff2",
        "[77]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.77.woff2",
        "[78]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.78.woff2",
        "[79]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.79.woff2",
        "[80]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.80.woff2",
        "[81]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.81.woff2",
        "[82]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.82.woff2",
        "[83]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.83.woff2",
        "[84]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.84.woff2",
        "[85]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.85.woff2",
        "[86]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.86.woff2",
        "[87]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.87.woff2",
        "[88]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.88.woff2",
        "[89]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.89.woff2",
        "[90]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.90.woff2",
        "[91]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.91.woff2",
        "[92]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.92.woff2",
        "[93]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.93.woff2",
        "[94]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.94.woff2",
        "[95]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.95.woff2",
        "[96]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.96.woff2",
        "[97]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.97.woff2",
        "[98]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.98.woff2",
        "[99]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.99.woff2",
        "[100]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.100.woff2",
        "[101]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.101.woff2",
        "[102]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.102.woff2",
        "[103]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.103.woff2",
        "[104]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.104.woff2",
        "[105]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.105.woff2",
        "[106]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.106.woff2",
        "[107]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.107.woff2",
        "[108]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.108.woff2",
        "[109]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.109.woff2",
        "[110]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.110.woff2",
        "[111]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.111.woff2",
        "[112]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.112.woff2",
        "[113]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.113.woff2",
        "[114]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.114.woff2",
        "[115]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.115.woff2",
        "[116]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.116.woff2",
        "[117]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.117.woff2",
        "[118]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.118.woff2",
        "[119]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.119.woff2",
        cyrillic: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYxQgP6lY.woff2",
        vietnamese: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzggP6lY.woff2",
        "latin-ext": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzwgP6lY.woff2",
        latin: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYwQgP.woff2"
      },
      "700": {
        "[0]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2",
        "[1]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.1.woff2",
        "[2]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.2.woff2",
        "[3]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.3.woff2",
        "[4]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.4.woff2",
        "[5]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.5.woff2",
        "[6]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.6.woff2",
        "[7]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.7.woff2",
        "[8]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.8.woff2",
        "[9]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.9.woff2",
        "[10]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.10.woff2",
        "[11]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.11.woff2",
        "[12]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.12.woff2",
        "[13]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.13.woff2",
        "[14]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.14.woff2",
        "[15]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.15.woff2",
        "[16]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.16.woff2",
        "[17]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.17.woff2",
        "[18]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.18.woff2",
        "[19]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.19.woff2",
        "[20]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.20.woff2",
        "[21]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.21.woff2",
        "[22]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.22.woff2",
        "[23]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.23.woff2",
        "[24]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.24.woff2",
        "[25]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.25.woff2",
        "[26]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.26.woff2",
        "[27]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.27.woff2",
        "[28]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.28.woff2",
        "[29]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.29.woff2",
        "[30]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.30.woff2",
        "[31]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.31.woff2",
        "[32]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.32.woff2",
        "[33]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.33.woff2",
        "[34]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.34.woff2",
        "[35]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.35.woff2",
        "[36]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.36.woff2",
        "[37]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.37.woff2",
        "[38]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.38.woff2",
        "[39]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.39.woff2",
        "[40]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.40.woff2",
        "[41]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.41.woff2",
        "[42]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.42.woff2",
        "[43]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.43.woff2",
        "[44]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.44.woff2",
        "[45]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.45.woff2",
        "[46]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.46.woff2",
        "[47]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.47.woff2",
        "[48]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.48.woff2",
        "[49]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.49.woff2",
        "[50]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.50.woff2",
        "[51]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.51.woff2",
        "[52]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.52.woff2",
        "[53]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.53.woff2",
        "[54]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.54.woff2",
        "[55]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.55.woff2",
        "[56]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.56.woff2",
        "[57]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.57.woff2",
        "[58]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.58.woff2",
        "[59]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.59.woff2",
        "[60]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.60.woff2",
        "[61]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.61.woff2",
        "[62]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.62.woff2",
        "[63]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.63.woff2",
        "[64]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.64.woff2",
        "[65]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.65.woff2",
        "[66]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.66.woff2",
        "[67]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.67.woff2",
        "[68]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.68.woff2",
        "[69]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.69.woff2",
        "[70]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.70.woff2",
        "[71]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.71.woff2",
        "[72]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.72.woff2",
        "[73]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.73.woff2",
        "[74]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.74.woff2",
        "[75]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.75.woff2",
        "[76]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.76.woff2",
        "[77]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.77.woff2",
        "[78]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.78.woff2",
        "[79]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.79.woff2",
        "[80]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.80.woff2",
        "[81]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.81.woff2",
        "[82]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.82.woff2",
        "[83]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.83.woff2",
        "[84]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.84.woff2",
        "[85]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.85.woff2",
        "[86]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.86.woff2",
        "[87]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.87.woff2",
        "[88]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.88.woff2",
        "[89]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.89.woff2",
        "[90]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.90.woff2",
        "[91]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.91.woff2",
        "[92]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.92.woff2",
        "[93]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.93.woff2",
        "[94]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.94.woff2",
        "[95]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.95.woff2",
        "[96]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.96.woff2",
        "[97]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.97.woff2",
        "[98]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.98.woff2",
        "[99]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.99.woff2",
        "[100]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.100.woff2",
        "[101]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.101.woff2",
        "[102]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.102.woff2",
        "[103]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.103.woff2",
        "[104]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.104.woff2",
        "[105]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.105.woff2",
        "[106]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.106.woff2",
        "[107]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.107.woff2",
        "[108]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.108.woff2",
        "[109]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.109.woff2",
        "[110]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.110.woff2",
        "[111]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.111.woff2",
        "[112]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.112.woff2",
        "[113]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.113.woff2",
        "[114]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.114.woff2",
        "[115]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.115.woff2",
        "[116]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.116.woff2",
        "[117]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.117.woff2",
        "[118]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.118.woff2",
        "[119]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.119.woff2",
        cyrillic: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYxQgP6lY.woff2",
        vietnamese: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzggP6lY.woff2",
        "latin-ext": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzwgP6lY.woff2",
        latin: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYwQgP.woff2"
      },
      "800": {
        "[0]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2",
        "[1]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.1.woff2",
        "[2]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.2.woff2",
        "[3]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.3.woff2",
        "[4]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.4.woff2",
        "[5]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.5.woff2",
        "[6]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.6.woff2",
        "[7]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.7.woff2",
        "[8]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.8.woff2",
        "[9]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.9.woff2",
        "[10]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.10.woff2",
        "[11]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.11.woff2",
        "[12]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.12.woff2",
        "[13]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.13.woff2",
        "[14]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.14.woff2",
        "[15]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.15.woff2",
        "[16]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.16.woff2",
        "[17]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.17.woff2",
        "[18]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.18.woff2",
        "[19]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.19.woff2",
        "[20]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.20.woff2",
        "[21]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.21.woff2",
        "[22]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.22.woff2",
        "[23]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.23.woff2",
        "[24]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.24.woff2",
        "[25]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.25.woff2",
        "[26]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.26.woff2",
        "[27]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.27.woff2",
        "[28]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.28.woff2",
        "[29]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.29.woff2",
        "[30]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.30.woff2",
        "[31]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.31.woff2",
        "[32]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.32.woff2",
        "[33]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.33.woff2",
        "[34]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.34.woff2",
        "[35]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.35.woff2",
        "[36]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.36.woff2",
        "[37]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.37.woff2",
        "[38]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.38.woff2",
        "[39]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.39.woff2",
        "[40]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.40.woff2",
        "[41]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.41.woff2",
        "[42]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.42.woff2",
        "[43]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.43.woff2",
        "[44]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.44.woff2",
        "[45]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.45.woff2",
        "[46]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.46.woff2",
        "[47]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.47.woff2",
        "[48]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.48.woff2",
        "[49]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.49.woff2",
        "[50]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.50.woff2",
        "[51]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.51.woff2",
        "[52]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.52.woff2",
        "[53]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.53.woff2",
        "[54]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.54.woff2",
        "[55]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.55.woff2",
        "[56]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.56.woff2",
        "[57]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.57.woff2",
        "[58]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.58.woff2",
        "[59]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.59.woff2",
        "[60]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.60.woff2",
        "[61]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.61.woff2",
        "[62]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.62.woff2",
        "[63]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.63.woff2",
        "[64]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.64.woff2",
        "[65]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.65.woff2",
        "[66]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.66.woff2",
        "[67]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.67.woff2",
        "[68]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.68.woff2",
        "[69]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.69.woff2",
        "[70]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.70.woff2",
        "[71]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.71.woff2",
        "[72]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.72.woff2",
        "[73]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.73.woff2",
        "[74]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.74.woff2",
        "[75]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.75.woff2",
        "[76]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.76.woff2",
        "[77]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.77.woff2",
        "[78]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.78.woff2",
        "[79]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.79.woff2",
        "[80]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.80.woff2",
        "[81]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.81.woff2",
        "[82]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.82.woff2",
        "[83]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.83.woff2",
        "[84]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.84.woff2",
        "[85]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.85.woff2",
        "[86]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.86.woff2",
        "[87]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.87.woff2",
        "[88]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.88.woff2",
        "[89]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.89.woff2",
        "[90]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.90.woff2",
        "[91]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.91.woff2",
        "[92]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.92.woff2",
        "[93]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.93.woff2",
        "[94]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.94.woff2",
        "[95]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.95.woff2",
        "[96]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.96.woff2",
        "[97]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.97.woff2",
        "[98]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.98.woff2",
        "[99]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.99.woff2",
        "[100]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.100.woff2",
        "[101]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.101.woff2",
        "[102]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.102.woff2",
        "[103]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.103.woff2",
        "[104]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.104.woff2",
        "[105]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.105.woff2",
        "[106]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.106.woff2",
        "[107]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.107.woff2",
        "[108]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.108.woff2",
        "[109]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.109.woff2",
        "[110]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.110.woff2",
        "[111]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.111.woff2",
        "[112]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.112.woff2",
        "[113]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.113.woff2",
        "[114]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.114.woff2",
        "[115]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.115.woff2",
        "[116]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.116.woff2",
        "[117]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.117.woff2",
        "[118]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.118.woff2",
        "[119]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.119.woff2",
        cyrillic: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYxQgP6lY.woff2",
        vietnamese: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzggP6lY.woff2",
        "latin-ext": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzwgP6lY.woff2",
        latin: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYwQgP.woff2"
      },
      "900": {
        "[0]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.0.woff2",
        "[1]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.1.woff2",
        "[2]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.2.woff2",
        "[3]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.3.woff2",
        "[4]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.4.woff2",
        "[5]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.5.woff2",
        "[6]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.6.woff2",
        "[7]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.7.woff2",
        "[8]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.8.woff2",
        "[9]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.9.woff2",
        "[10]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.10.woff2",
        "[11]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.11.woff2",
        "[12]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.12.woff2",
        "[13]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.13.woff2",
        "[14]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.14.woff2",
        "[15]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.15.woff2",
        "[16]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.16.woff2",
        "[17]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.17.woff2",
        "[18]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.18.woff2",
        "[19]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.19.woff2",
        "[20]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.20.woff2",
        "[21]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.21.woff2",
        "[22]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.22.woff2",
        "[23]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.23.woff2",
        "[24]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.24.woff2",
        "[25]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.25.woff2",
        "[26]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.26.woff2",
        "[27]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.27.woff2",
        "[28]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.28.woff2",
        "[29]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.29.woff2",
        "[30]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.30.woff2",
        "[31]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.31.woff2",
        "[32]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.32.woff2",
        "[33]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.33.woff2",
        "[34]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.34.woff2",
        "[35]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.35.woff2",
        "[36]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.36.woff2",
        "[37]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.37.woff2",
        "[38]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.38.woff2",
        "[39]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.39.woff2",
        "[40]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.40.woff2",
        "[41]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.41.woff2",
        "[42]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.42.woff2",
        "[43]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.43.woff2",
        "[44]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.44.woff2",
        "[45]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.45.woff2",
        "[46]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.46.woff2",
        "[47]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.47.woff2",
        "[48]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.48.woff2",
        "[49]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.49.woff2",
        "[50]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.50.woff2",
        "[51]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.51.woff2",
        "[52]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.52.woff2",
        "[53]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.53.woff2",
        "[54]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.54.woff2",
        "[55]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.55.woff2",
        "[56]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.56.woff2",
        "[57]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.57.woff2",
        "[58]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.58.woff2",
        "[59]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.59.woff2",
        "[60]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.60.woff2",
        "[61]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.61.woff2",
        "[62]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.62.woff2",
        "[63]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.63.woff2",
        "[64]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.64.woff2",
        "[65]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.65.woff2",
        "[66]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.66.woff2",
        "[67]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.67.woff2",
        "[68]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.68.woff2",
        "[69]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.69.woff2",
        "[70]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.70.woff2",
        "[71]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.71.woff2",
        "[72]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.72.woff2",
        "[73]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.73.woff2",
        "[74]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.74.woff2",
        "[75]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.75.woff2",
        "[76]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.76.woff2",
        "[77]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.77.woff2",
        "[78]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.78.woff2",
        "[79]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.79.woff2",
        "[80]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.80.woff2",
        "[81]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.81.woff2",
        "[82]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.82.woff2",
        "[83]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.83.woff2",
        "[84]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.84.woff2",
        "[85]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.85.woff2",
        "[86]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.86.woff2",
        "[87]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.87.woff2",
        "[88]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.88.woff2",
        "[89]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.89.woff2",
        "[90]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.90.woff2",
        "[91]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.91.woff2",
        "[92]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.92.woff2",
        "[93]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.93.woff2",
        "[94]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.94.woff2",
        "[95]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.95.woff2",
        "[96]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.96.woff2",
        "[97]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.97.woff2",
        "[98]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.98.woff2",
        "[99]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.99.woff2",
        "[100]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.100.woff2",
        "[101]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.101.woff2",
        "[102]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.102.woff2",
        "[103]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.103.woff2",
        "[104]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.104.woff2",
        "[105]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.105.woff2",
        "[106]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.106.woff2",
        "[107]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.107.woff2",
        "[108]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.108.woff2",
        "[109]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.109.woff2",
        "[110]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.110.woff2",
        "[111]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.111.woff2",
        "[112]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.112.woff2",
        "[113]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.113.woff2",
        "[114]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.114.woff2",
        "[115]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.115.woff2",
        "[116]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.116.woff2",
        "[117]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.117.woff2",
        "[118]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.118.woff2",
        "[119]": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFow2oe2EcP5pp0erwTqsSWs9Jezazjcb4.119.woff2",
        cyrillic: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYxQgP6lY.woff2",
        vietnamese: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzggP6lY.woff2",
        "latin-ext": "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYzwgP6lY.woff2",
        latin: "https://fonts.gstatic.com/s/notosansjp/v52/-F62fjtqLzI2JPCgQBnw7HFYwQgP.woff2"
      }
    }
  }
});
var fontFamily = "Noto Sans JP";
var loadFont = (style, options) => {
  return loadFonts(getInfo(), style, options);
};


;// ./src/styles/presets.ts

const bgPresets = {
  gradient_blue: {
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    textColor: "#ffffff"
  },
  gradient_purple: {
    background: "linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)",
    textColor: "#ffffff"
  },
  solid_dark: {
    background: "#0a0a0a",
    textColor: "#ffffff"
  },
  solid_white: {
    background: "#fafafa",
    textColor: "#1a1a1a"
  },
  brand: {
    background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
    textColor: "#ffffff"
  },
  danger_red: {
    background: "linear-gradient(135deg, #1a0000, #4a0000, #2a0000)",
    textColor: "#ff4444"
  },
  warm_amber: {
    background: "linear-gradient(135deg, #1a1000, #3a2800, #2a1a00)",
    textColor: "#ffb347"
  },
  clean_minimal: {
    background: "#ffffff",
    textColor: "#1a1a1a"
  }
};
function getPreset(name) {
  return bgPresets[name || "solid_dark"] || bgPresets.solid_dark;
}

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(6540);
;// ./src/templates/components/EmphasisText.tsx



const EmphasisText = ({
  text,
  emphasisWords,
  accentColor = "#FF6B35"
}) => {
  if (!emphasisWords || emphasisWords.length === 0) {
    return /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: text });
  }
  const escaped = emphasisWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = text.split(regex);
  const emphasisSet = new Set(emphasisWords);
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: parts.map(
    (part, i) => emphasisSet.has(part) ? /* @__PURE__ */ (0,jsx_runtime.jsx)(
      "span",
      {
        style: {
          color: accentColor,
          fontSize: "1.2em",
          fontWeight: 900
        },
        children: part
      },
      i
    ) : /* @__PURE__ */ (0,jsx_runtime.jsx)(react.Fragment, { children: part }, i)
  ) });
};

;// ./src/templates/components/SlideBackground.tsx



const SlideBackground = ({
  imageUrl,
  backgroundCss,
  startFrame,
  durationFrames
}) => {
  const frame = (0,cjs.useCurrentFrame)();
  const localFrame = frame - startFrame;
  if (!imageUrl) {
    return null;
  }
  const scale = (0,cjs.interpolate)(
    localFrame,
    [0, durationFrames],
    [1, 1.08],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0,jsx_runtime.jsx)(
      cjs.Img,
      {
        src: imageUrl,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`
        }
      }
    ),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(
      "div",
      {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.5) 100%)"
        }
      }
    )
  ] });
};

;// ./src/templates/scenes/HookPunchScene.tsx






const HookPunchScene = ({
  slide,
  startFrame,
  durationFrames
}) => {
  const frame = (0,cjs.useCurrentFrame)();
  const localFrame = frame - startFrame;
  const preset = getPreset(slide.bgPreset);
  const fadeInFrames = 10;
  const fadeOutFrames = 10;
  const opacity = (0,cjs.interpolate)(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scale = (0,cjs.interpolate)(
    localFrame,
    [0, durationFrames],
    [1, 1.05],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(
    cjs.AbsoluteFill,
    {
      style: {
        background: slide.imageUrl ? "#0a0a0a" : preset.background,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        padding: "60px 48px",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)(SlideBackground, { imageUrl: slide.imageUrl, backgroundCss: preset.background, startFrame, durationFrames }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)(
          "div",
          {
            style: {
              transform: `scale(${scale})`,
              textAlign: "center",
              maxWidth: "90%",
              position: "relative",
              zIndex: 1
            },
            children: [
              /* @__PURE__ */ (0,jsx_runtime.jsx)(
                "div",
                {
                  style: {
                    color: preset.textColor,
                    fontSize: 64,
                    fontWeight: 900,
                    lineHeight: 1.3,
                    letterSpacing: "-0.03em",
                    textShadow: "0 4px 20px rgba(0,0,0,0.5)"
                  },
                  children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
                    EmphasisText,
                    {
                      text: slide.text,
                      emphasisWords: slide.captionEmphasisWords,
                      accentColor: "#FF6B35"
                    }
                  )
                }
              ),
              slide.subtext && /* @__PURE__ */ (0,jsx_runtime.jsx)(
                "div",
                {
                  style: {
                    color: preset.textColor,
                    fontSize: 28,
                    fontWeight: 400,
                    marginTop: 24,
                    opacity: 0.8,
                    lineHeight: 1.6,
                    whiteSpace: "pre-line"
                  },
                  children: slide.subtext
                }
              )
            ]
          }
        )
      ]
    }
  );
};

;// ./src/templates/scenes/RevealListScene.tsx





const RevealListScene = ({
  slide,
  startFrame,
  durationFrames
}) => {
  const frame = (0,cjs.useCurrentFrame)();
  const localFrame = frame - startFrame;
  const preset = getPreset(slide.bgPreset);
  const fadeInFrames = 10;
  const fadeOutFrames = 10;
  const opacity = (0,cjs.interpolate)(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const items = slide.listItems && slide.listItems.length > 0 ? slide.listItems : slide.text.split("\n").filter(Boolean);
  const staggerDelay = 15;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(
    cjs.AbsoluteFill,
    {
      style: {
        background: slide.imageUrl ? "#0a0a0a" : preset.background,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        padding: "80px 48px",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)(SlideBackground, { imageUrl: slide.imageUrl, backgroundCss: preset.background, startFrame, durationFrames }),
        slide.subtext && /* @__PURE__ */ (0,jsx_runtime.jsx)(
          "div",
          {
            style: {
              color: preset.textColor,
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 40,
              textAlign: "center",
              textShadow: "0 2px 12px rgba(0,0,0,0.3)",
              position: "relative",
              zIndex: 1
            },
            children: slide.subtext
          }
        ),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { style: { width: "85%", position: "relative", zIndex: 1 }, children: items.map((item, i) => {
          const itemStart = fadeInFrames + i * staggerDelay;
          const itemOpacity = (0,cjs.interpolate)(
            localFrame,
            [itemStart, itemStart + 10],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const itemTranslateX = (0,cjs.interpolate)(
            localFrame,
            [itemStart, itemStart + 10],
            [60, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return /* @__PURE__ */ (0,jsx_runtime.jsxs)(
            "div",
            {
              style: {
                opacity: itemOpacity,
                transform: `translateX(${itemTranslateX}px)`,
                display: "flex",
                alignItems: "center",
                marginBottom: 28
              },
              children: [
                /* @__PURE__ */ (0,jsx_runtime.jsx)(
                  "div",
                  {
                    style: {
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "#FF6B35",
                      marginRight: 20,
                      flexShrink: 0
                    }
                  }
                ),
                /* @__PURE__ */ (0,jsx_runtime.jsx)(
                  "div",
                  {
                    style: {
                      color: preset.textColor,
                      fontSize: 36,
                      fontWeight: 600,
                      lineHeight: 1.5,
                      textShadow: "0 2px 12px rgba(0,0,0,0.3)"
                    },
                    children: item
                  }
                )
              ]
            },
            i
          );
        }) })
      ]
    }
  );
};

;// ./src/templates/scenes/ConceptExplainScene.tsx






const ConceptExplainScene = ({
  slide,
  startFrame,
  durationFrames
}) => {
  const frame = (0,cjs.useCurrentFrame)();
  const localFrame = frame - startFrame;
  const preset = getPreset(slide.bgPreset);
  const fadeInFrames = 15;
  const fadeOutFrames = 10;
  const opacity = (0,cjs.interpolate)(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const translateY = (0,cjs.interpolate)(
    localFrame,
    [0, fadeInFrames],
    [20, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const subtextOpacity = (0,cjs.interpolate)(
    localFrame,
    [fadeInFrames + 5, fadeInFrames + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(
    cjs.AbsoluteFill,
    {
      style: {
        background: slide.imageUrl ? "#0a0a0a" : preset.background,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        padding: "60px 48px",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)(SlideBackground, { imageUrl: slide.imageUrl, backgroundCss: preset.background, startFrame, durationFrames }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)(
          "div",
          {
            style: {
              transform: `translateY(${translateY}px)`,
              textAlign: "center",
              maxWidth: "90%",
              position: "relative",
              zIndex: 1
            },
            children: [
              /* @__PURE__ */ (0,jsx_runtime.jsx)(
                "div",
                {
                  style: {
                    color: preset.textColor,
                    fontSize: 48,
                    fontWeight: 700,
                    lineHeight: 1.4,
                    letterSpacing: "-0.02em",
                    textShadow: "0 2px 12px rgba(0,0,0,0.3)"
                  },
                  children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
                    EmphasisText,
                    {
                      text: slide.text,
                      emphasisWords: slide.captionEmphasisWords,
                      accentColor: "#FF6B35"
                    }
                  )
                }
              ),
              slide.subtext && /* @__PURE__ */ (0,jsx_runtime.jsx)(
                "div",
                {
                  style: {
                    color: preset.textColor,
                    fontSize: 28,
                    fontWeight: 400,
                    marginTop: 32,
                    opacity: subtextOpacity * 0.75,
                    lineHeight: 1.7,
                    whiteSpace: "pre-line"
                  },
                  children: slide.subtext
                }
              )
            ]
          }
        )
      ]
    }
  );
};

;// ./src/templates/scenes/DangerShiftScene.tsx






const DangerShiftScene = ({
  slide,
  startFrame,
  durationFrames
}) => {
  const frame = (0,cjs.useCurrentFrame)();
  const localFrame = frame - startFrame;
  const dangerPreset = getPreset("danger_red");
  const normalPreset = getPreset(slide.bgPreset);
  const fadeInFrames = 12;
  const fadeOutFrames = 10;
  const opacity = (0,cjs.interpolate)(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const dangerProgress = (0,cjs.interpolate)(
    localFrame,
    [fadeInFrames, fadeInFrames + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const shakeX = localFrame > fadeInFrames && localFrame < fadeInFrames + 20 ? Math.sin(localFrame * 2.5) * (0,cjs.interpolate)(
    localFrame,
    [fadeInFrames, fadeInFrames + 10, fadeInFrames + 20],
    [0, 4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  ) : 0;
  const textColor = dangerProgress > 0.5 ? dangerPreset.textColor : normalPreset.textColor;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(
    cjs.AbsoluteFill,
    {
      style: {
        background: slide.imageUrl ? "#0a0a0a" : dangerProgress > 0.5 ? dangerPreset.background : normalPreset.background,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        padding: "60px 48px",
        transition: "background 0.3s ease",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)(SlideBackground, { imageUrl: slide.imageUrl, backgroundCss: normalPreset.background, startFrame, durationFrames }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)(
          "div",
          {
            style: {
              transform: `translateX(${shakeX}px)`,
              textAlign: "center",
              maxWidth: "90%",
              position: "relative",
              zIndex: 1
            },
            children: [
              /* @__PURE__ */ (0,jsx_runtime.jsx)(
                "div",
                {
                  style: {
                    color: textColor,
                    fontSize: 52,
                    fontWeight: 800,
                    lineHeight: 1.3,
                    letterSpacing: "-0.02em",
                    textShadow: dangerProgress > 0.5 ? "0 0 20px rgba(255,68,68,0.4)" : "0 2px 12px rgba(0,0,0,0.3)"
                  },
                  children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
                    EmphasisText,
                    {
                      text: slide.text,
                      emphasisWords: slide.captionEmphasisWords,
                      accentColor: "#ff4444"
                    }
                  )
                }
              ),
              slide.subtext && /* @__PURE__ */ (0,jsx_runtime.jsx)(
                "div",
                {
                  style: {
                    color: textColor,
                    fontSize: 26,
                    fontWeight: 400,
                    marginTop: 24,
                    opacity: 0.8,
                    lineHeight: 1.6,
                    whiteSpace: "pre-line"
                  },
                  children: slide.subtext
                }
              )
            ]
          }
        )
      ]
    }
  );
};

;// ./src/templates/scenes/CtaTeaseScene.tsx





const CtaTeaseScene = ({
  slide,
  startFrame,
  durationFrames
}) => {
  const frame = (0,cjs.useCurrentFrame)();
  const localFrame = frame - startFrame;
  const preset = getPreset("brand");
  const fadeInFrames = 12;
  const fadeOutFrames = 10;
  const opacity = (0,cjs.interpolate)(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const pulseScale = (0,cjs.interpolate)(
    localFrame % 30,
    [0, 15, 30],
    [1, 1.04, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const labelOpacity = (0,cjs.interpolate)(
    localFrame,
    [fadeInFrames, fadeInFrames + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const mainTextOpacity = (0,cjs.interpolate)(
    localFrame,
    [fadeInFrames + 8, fadeInFrames + 18],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(
    cjs.AbsoluteFill,
    {
      style: {
        background: slide.imageUrl ? "#0a0a0a" : preset.background,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        padding: "60px 48px",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)(SlideBackground, { imageUrl: slide.imageUrl, backgroundCss: preset.background, startFrame, durationFrames }),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { style: { textAlign: "center", maxWidth: "90%", position: "relative", zIndex: 1 }, children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)(
            "div",
            {
              style: {
                color: "#FF6B35",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 20,
                opacity: labelOpacity
              },
              children: "\u6B21\u56DE"
            }
          ),
          /* @__PURE__ */ (0,jsx_runtime.jsx)(
            "div",
            {
              style: {
                color: preset.textColor,
                fontSize: 48,
                fontWeight: 800,
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
                textShadow: "0 2px 12px rgba(0,0,0,0.3)",
                transform: `scale(${pulseScale})`,
                opacity: mainTextOpacity
              },
              children: slide.text
            }
          ),
          slide.subtext && /* @__PURE__ */ (0,jsx_runtime.jsx)(
            "div",
            {
              style: {
                color: preset.textColor,
                fontSize: 28,
                fontWeight: 400,
                marginTop: 28,
                opacity: mainTextOpacity * 0.8,
                lineHeight: 1.6,
                whiteSpace: "pre-line"
              },
              children: slide.subtext
            }
          )
        ] })
      ]
    }
  );
};

;// ./src/templates/components/SlideView.tsx











const SlideView = ({
  slide,
  startFrame,
  durationFrames
}) => {
  const sceneType = slide.sceneType || "standard";
  switch (sceneType) {
    case "hook_punch":
      return /* @__PURE__ */ (0,jsx_runtime.jsx)(HookPunchScene, { slide, startFrame, durationFrames });
    case "reveal_list":
      return /* @__PURE__ */ (0,jsx_runtime.jsx)(RevealListScene, { slide, startFrame, durationFrames });
    case "concept_explain":
      return /* @__PURE__ */ (0,jsx_runtime.jsx)(ConceptExplainScene, { slide, startFrame, durationFrames });
    case "danger_shift":
      return /* @__PURE__ */ (0,jsx_runtime.jsx)(DangerShiftScene, { slide, startFrame, durationFrames });
    case "cta_tease":
      return /* @__PURE__ */ (0,jsx_runtime.jsx)(CtaTeaseScene, { slide, startFrame, durationFrames });
    default:
      return /* @__PURE__ */ (0,jsx_runtime.jsx)(StandardSlide, { slide, startFrame, durationFrames });
  }
};
const StandardSlide = ({
  slide,
  startFrame,
  durationFrames
}) => {
  const frame = (0,cjs.useCurrentFrame)();
  const localFrame = frame - startFrame;
  const preset = getPreset(slide.bgPreset);
  const fadeInFrames = 15;
  const fadeOutFrames = 10;
  const opacity = (0,cjs.interpolate)(
    localFrame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const motionPreset = slide.motionPreset || "none";
  let transform = "";
  if (motionPreset === "zoom_in") {
    const scale = (0,cjs.interpolate)(
      localFrame,
      [0, durationFrames],
      [1, 1.05],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    transform = `scale(${scale})`;
  } else if (motionPreset === "pulse") {
    const pulseScale = (0,cjs.interpolate)(
      localFrame % 30,
      [0, 15, 30],
      [1, 1.03, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    transform = `scale(${pulseScale})`;
  } else if (motionPreset === "slide_left") {
    const translateX = (0,cjs.interpolate)(
      localFrame,
      [0, fadeInFrames],
      [30, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    transform = `translateX(${translateX}px)`;
  } else {
    const translateY = (0,cjs.interpolate)(
      localFrame,
      [0, fadeInFrames],
      [30, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    transform = `translateY(${translateY}px)`;
  }
  const isHook = slide.type === "hook";
  const isCta = slide.type === "cta";
  const isChapterTitle = slide.type === "chapter_title";
  const isEmphasis = slide.type === "emphasis";
  const fontSize = isHook || isEmphasis ? 56 : isChapterTitle ? 48 : 40;
  const fontWeight = isHook || isEmphasis || isChapterTitle ? 800 : 600;
  const hasEmphasis = slide.captionEmphasisWords && slide.captionEmphasisWords.length > 0;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(
    cjs.AbsoluteFill,
    {
      style: {
        background: slide.imageUrl ? "#0a0a0a" : preset.background,
        justifyContent: "center",
        alignItems: "center",
        opacity,
        padding: "60px 48px",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)(
          SlideBackground,
          {
            imageUrl: slide.imageUrl,
            backgroundCss: preset.background,
            startFrame,
            durationFrames
          }
        ),
        /* @__PURE__ */ (0,jsx_runtime.jsxs)(
          "div",
          {
            style: {
              transform,
              textAlign: "center",
              maxWidth: "90%",
              position: "relative",
              zIndex: 1
            },
            children: [
              /* @__PURE__ */ (0,jsx_runtime.jsx)(
                "div",
                {
                  style: {
                    color: preset.textColor,
                    fontSize,
                    fontWeight,
                    lineHeight: 1.4,
                    letterSpacing: "-0.02em",
                    textShadow: "0 2px 12px rgba(0,0,0,0.3)"
                  },
                  children: hasEmphasis ? /* @__PURE__ */ (0,jsx_runtime.jsx)(
                    EmphasisText,
                    {
                      text: slide.text,
                      emphasisWords: slide.captionEmphasisWords,
                      accentColor: "#FF6B35"
                    }
                  ) : slide.text
                }
              ),
              slide.subtext && /* @__PURE__ */ (0,jsx_runtime.jsx)(
                "div",
                {
                  style: {
                    color: preset.textColor,
                    fontSize: isCta ? 28 : 24,
                    fontWeight: 400,
                    marginTop: 24,
                    opacity: 0.8,
                    lineHeight: 1.6,
                    whiteSpace: "pre-line"
                  },
                  children: slide.subtext
                }
              )
            ]
          }
        )
      ]
    }
  );
};

;// ./src/templates/components/ProgressBar.tsx



const ProgressBar = () => {
  const frame = (0,cjs.useCurrentFrame)();
  const { durationInFrames } = (0,cjs.useVideoConfig)();
  const progress = frame / durationInFrames;
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(cjs.AbsoluteFill, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
    "div",
    {
      style: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        background: "rgba(255,255,255,0.1)"
      },
      children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
        "div",
        {
          style: {
            height: "100%",
            width: `${progress * 100}%`,
            background: "rgba(255,255,255,0.5)",
            transition: "none"
          }
        }
      )
    }
  ) });
};

;// ./src/templates/Slideshow.tsx






const { fontFamily: Slideshow_fontFamily } = loadFont();
const Slideshow = ({ slides }) => {
  let currentFrame = 0;
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)(cjs.AbsoluteFill, { style: { fontFamily: Slideshow_fontFamily, backgroundColor: "#0a0a0a" }, children: [
    slides.map((slide, i) => {
      const durationFrames = slide.durationSec * 30;
      const startFrame = currentFrame;
      currentFrame += durationFrames;
      return /* @__PURE__ */ (0,jsx_runtime.jsx)(cjs.Sequence, { from: startFrame, durationInFrames: durationFrames, children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
        SlideView,
        {
          slide,
          startFrame: 0,
          durationFrames
        }
      ) }, i);
    }),
    /* @__PURE__ */ (0,jsx_runtime.jsx)(ProgressBar, {})
  ] });
};

// EXTERNAL MODULE: ./node_modules/zod/v3/types.js + 1 modules
var types = __webpack_require__(2241);
;// ./src/schemas.ts


const sceneTypeEnum = types/* enum */.k5([
  "standard",
  "hook_punch",
  "reveal_list",
  "concept_explain",
  "danger_shift",
  "cta_tease"
]);
const motionPresetEnum = types/* enum */.k5([
  "none",
  "zoom_in",
  "pulse",
  "slide_left"
]);
const slideSchema = types/* object */.Ik({
  type: types/* enum */.k5(["hook", "body", "chapter_title", "emphasis", "cta", "summary"]),
  text: types/* string */.Yj(),
  subtext: types/* string */.Yj().optional(),
  durationSec: types/* number */.ai().default(3),
  bgPreset: types/* string */.Yj().optional(),
  // AI-generated background image URL
  imageUrl: types/* string */.Yj().optional(),
  // Enhanced fields for variant system
  sceneType: sceneTypeEnum.default("standard"),
  listItems: types/* array */.YO(types/* string */.Yj()).optional(),
  captionEmphasisWords: types/* array */.YO(types/* string */.Yj()).optional(),
  motionPreset: motionPresetEnum.default("none"),
  visualNotes: types/* string */.Yj().optional()
});
const slideshowSchema = types/* object */.Ik({
  templateType: types/* string */.Yj(),
  title: types/* string */.Yj(),
  slides: types/* array */.YO(slideSchema).min(1),
  caption: types/* string */.Yj().optional(),
  hashtags: types/* array */.YO(types/* string */.Yj()).optional(),
  bgmPreset: types/* string */.Yj().default("none"),
  stylePreset: types/* string */.Yj().default("dark"),
  outroCta: types/* object */.Ik({
    text: types/* string */.Yj(),
    url: types/* string */.Yj()
  }).optional(),
  metadata: types/* object */.Ik({
    totalDurationSec: types/* number */.ai(),
    totalSlides: types/* number */.ai(),
    fps: types/* number */.ai().default(30),
    width: types/* number */.ai().default(1080),
    height: types/* number */.ai().default(1920),
    codec: types/* string */.Yj().default("h264")
  })
});

;// ./src/index.tsx





const defaultSlides = {
  templateType: "slideshow",
  title: "HumanAds Demo",
  slides: [
    { type: "hook", text: "AI\u304C\u5E83\u544A\u3092\u51FA\u3059\u6642\u4EE3\u3002", durationSec: 3, bgPreset: "gradient_blue" },
    { type: "body", text: "HumanAds\u306F\u3001AI\u3068\u4EBA\u9593\u3092\u3064\u306A\u3050\u5E83\u544A\u30DE\u30FC\u30B1\u30C3\u30C8\u30D7\u30EC\u30A4\u30B9\u3067\u3059\u3002", durationSec: 4, bgPreset: "solid_dark" },
    { type: "emphasis", text: "1000+ hUSD \u304C\u52D5\u3044\u3066\u3044\u307E\u3059\u3002", durationSec: 3, bgPreset: "gradient_purple" },
    { type: "cta", text: "Follow us", subtext: "humanadsai.com\n@HumanAdsAI", durationSec: 4, bgPreset: "brand" }
  ],
  caption: "HumanAds - AI meets human promotion",
  hashtags: ["#HumanAds", "#AI"],
  bgmPreset: "none",
  stylePreset: "dark",
  outroCta: { text: "Follow @HumanAdsAI", url: "https://humanadsai.com" },
  metadata: { totalDurationSec: 14, totalSlides: 4, fps: 30, width: 1080, height: 1920, codec: "h264" }
};
const RemotionRoot = () => {
  return /* @__PURE__ */ (0,jsx_runtime.jsx)(jsx_runtime.Fragment, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(
    cjs.Composition,
    {
      id: "Slideshow",
      component: Slideshow,
      width: 1080,
      height: 1920,
      fps: 30,
      durationInFrames: 14 * 30,
      schema: slideshowSchema,
      defaultProps: defaultSlides,
      calculateMetadata: ({ props }) => {
        const totalFrames = props.slides.reduce(
          (sum, slide) => sum + slide.durationSec * 30,
          0
        );
        return { durationInFrames: totalFrames, props };
      }
    }
  ) });
};
(0,cjs.registerRoot)(RemotionRoot);

})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
var react__WEBPACK_IMPORTED_MODULE_0___namespace_cache;
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6540);


if (typeof globalThis === 'undefined') {
	window.React = /*#__PURE__*/ (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache || (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache = __webpack_require__.t(react__WEBPACK_IMPORTED_MODULE_0__, 2)));
} else {
	globalThis.React = /*#__PURE__*/ (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache || (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache = __webpack_require__.t(react__WEBPACK_IMPORTED_MODULE_0__, 2)));
}

})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/* unused harmony export setBundleModeAndUpdate */
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6540);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5338);
/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3626);
/* harmony import */ var remotion__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(remotion__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var remotion_no_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(2453);






let currentBundleMode = {
  type: "index"
};
const setBundleMode = (state) => {
  currentBundleMode = state;
};
const getBundleMode = () => {
  return currentBundleMode;
};
remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.CSSUtils.injectCSS(
  remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.CSSUtils.makeDefaultPreviewCSS(null, "#1f2428")
);
const getCanSerializeDefaultProps = (object) => {
  try {
    const str = JSON.stringify(object);
    return str.length < 256 * 1024 * 1024 * 0.9;
  } catch (err) {
    if (err.message.includes("Invalid string length")) {
      return false;
    }
    throw err;
  }
};
const isInHeadlessBrowser = () => {
  return typeof window.remotion_puppeteerTimeout !== "undefined";
};
const DelayedSpinner = () => {
  const [show, setShow] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const timeout = setTimeout(() => {
      setShow(true);
    }, 2e3);
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  if (!show) {
    return null;
  }
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(
    remotion__WEBPACK_IMPORTED_MODULE_3__.AbsoluteFill,
    {
      style: {
        justifyContent: "center",
        alignItems: "center",
        fontSize: 13,
        opacity: 0.6,
        color: "white",
        fontFamily: "Helvetica, Arial, sans-serif"
      },
      children: "Loading Studio"
    }
  );
};
const GetVideo = ({ state }) => {
  const video = remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.useVideo();
  const compositions = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.CompositionManager);
  const portalContainer = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const [handle] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(
    () => (0,remotion__WEBPACK_IMPORTED_MODULE_3__.delayRender)("Wait for Composition" + JSON.stringify(state))
  );
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    return () => (0,remotion__WEBPACK_IMPORTED_MODULE_3__.continueRender)(handle);
  }, [handle]);
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (state.type !== "composition") {
      return;
    }
    if (!video && compositions.compositions.length > 0) {
      const foundComposition = compositions.compositions.find(
        (c) => c.id === state.compositionName
      );
      if (!foundComposition) {
        throw new Error(
          `Found no composition with the name ${state.compositionName}. The following compositions were found instead: ${compositions.compositions.map((c) => c.id).join(
            ", "
          )}. All compositions must have their ID calculated deterministically and must be mounted at the same time.`
        );
      }
      if (foundComposition) {
        compositions.setCanvasContent({
          type: "composition",
          compositionId: foundComposition.id
        });
      } else {
        compositions.setCanvasContent(null);
      }
      compositions.setCurrentCompositionMetadata({
        props: remotion_no_react__WEBPACK_IMPORTED_MODULE_4__.NoReactInternals.deserializeJSONWithCustomFields(
          state.serializedResolvedPropsWithSchema
        ),
        durationInFrames: state.compositionDurationInFrames,
        fps: state.compositionFps,
        height: state.compositionHeight,
        width: state.compositionWidth,
        defaultCodec: state.compositionDefaultCodec
      });
    }
  }, [compositions, compositions.compositions, state, video]);
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (state.type === "evaluation") {
      (0,remotion__WEBPACK_IMPORTED_MODULE_3__.continueRender)(handle);
    } else if (video) {
      (0,remotion__WEBPACK_IMPORTED_MODULE_3__.continueRender)(handle);
    }
  }, [handle, state.type, video]);
  (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!video) {
      return;
    }
    const { current } = portalContainer;
    if (!current) {
      throw new Error("portal did not render");
    }
    current.appendChild(remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.portalNode());
    return () => {
      current.removeChild(remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.portalNode());
    };
  }, [video]);
  if (!video) {
    return null;
  }
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(
    "div",
    {
      ref: portalContainer,
      id: "remotion-canvas",
      style: {
        width: video.width,
        height: video.height,
        display: "flex",
        backgroundColor: "transparent"
      }
    }
  );
};
const DEFAULT_ROOT_COMPONENT_TIMEOUT = 1e4;
const waitForRootHandle = (0,remotion__WEBPACK_IMPORTED_MODULE_3__.delayRender)(
  "Loading root component - See https://remotion.dev/docs/troubleshooting/loading-root-component if you experience a timeout",
  {
    timeoutInMilliseconds: typeof window === "undefined" ? DEFAULT_ROOT_COMPONENT_TIMEOUT : window.remotion_puppeteerTimeout ?? DEFAULT_ROOT_COMPONENT_TIMEOUT
  }
);
const videoContainer = document.getElementById(
  "video-container"
);
let root = null;
const getRootForElement = () => {
  if (root) {
    return root;
  }
  root = react_dom_client__WEBPACK_IMPORTED_MODULE_2__.createRoot(videoContainer);
  return root;
};
const renderToDOM = (content) => {
  if (!react_dom_client__WEBPACK_IMPORTED_MODULE_2__.createRoot) {
    if (remotion_no_react__WEBPACK_IMPORTED_MODULE_4__.NoReactInternals.ENABLE_V5_BREAKING_CHANGES) {
      throw new Error(
        "Remotion 5.0 does only support React 18+. However, ReactDOM.createRoot() is undefined."
      );
    }
    react_dom_client__WEBPACK_IMPORTED_MODULE_2__.render(
      content,
      videoContainer
    );
    return;
  }
  getRootForElement().render(content);
};
const renderContent = (Root) => {
  const bundleMode = getBundleMode();
  if (bundleMode.type === "composition") {
    const markup = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.RemotionRoot, { numberOfAudioTags: 0, children: [
      /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Root, {}),
      /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(GetVideo, { state: bundleMode })
    ] });
    renderToDOM(markup);
  }
  if (bundleMode.type === "evaluation") {
    const markup = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.RemotionRoot, { numberOfAudioTags: 0, children: [
      /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Root, {}),
      /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(GetVideo, { state: bundleMode })
    ] });
    renderToDOM(markup);
  }
  if (bundleMode.type === "index") {
    if (isInHeadlessBrowser()) {
      return;
    }
    renderToDOM(
      /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(DelayedSpinner, {}) })
    );
    __webpack_require__.e(/* import() */ 533).then(__webpack_require__.bind(__webpack_require__, 2533)).then(({ StudioInternals }) => {
      renderToDOM(/* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(StudioInternals.Studio, { readOnly: true, rootComponent: Root }));
    }).catch((err) => {
      renderToDOM(/* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [
        "Failed to load Remotion Studio: ",
        err.message
      ] }));
    });
  }
};
remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.waitForRoot((Root) => {
  renderContent(Root);
  (0,remotion__WEBPACK_IMPORTED_MODULE_3__.continueRender)(waitForRootHandle);
});
const setBundleModeAndUpdate = (state) => {
  setBundleMode(state);
  const delay = (0,remotion__WEBPACK_IMPORTED_MODULE_3__.delayRender)(
    "Waiting for root component to load - See https://remotion.dev/docs/troubleshooting/loading-root-component if you experience a timeout"
  );
  remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.waitForRoot((Root) => {
    renderContent(Root);
    requestAnimationFrame(() => {
      (0,remotion__WEBPACK_IMPORTED_MODULE_3__.continueRender)(delay);
    });
  });
};
if (typeof window !== "undefined") {
  const getUnevaluatedComps = () => {
    if (!remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.getRoot()) {
      throw new Error(
        "registerRoot() was never called. 1. Make sure you specified the correct entrypoint for your bundle. 2. If your registerRoot() call is deferred, use the delayRender/continueRender pattern to tell Remotion to wait."
      );
    }
    if (!remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.compositionsRef.current) {
      throw new Error("Unexpectedly did not have a CompositionManager");
    }
    const compositions = remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.compositionsRef.current.getCompositions();
    const canSerializeDefaultProps = getCanSerializeDefaultProps(compositions);
    if (!canSerializeDefaultProps) {
      console.warn(
        "defaultProps are too big to serialize - trying to find the problematic composition..."
      );
      for (const comp of compositions) {
        if (!getCanSerializeDefaultProps(comp)) {
          throw new Error(
            `defaultProps too big - could not serialize - the defaultProps of composition with ID ${comp.id} - the object that was passed to defaultProps was too big. Learn how to mitigate this error by visiting https://remotion.dev/docs/troubleshooting/serialize-defaultprops`
          );
        }
      }
      console.warn(
        "Could not single out a problematic composition -  The composition list as a whole is too big to serialize."
      );
      throw new Error(
        "defaultProps too big - Could not serialize - an object that was passed to defaultProps was too big. Learn how to mitigate this error by visiting https://remotion.dev/docs/troubleshooting/serialize-defaultprops"
      );
    }
    return compositions;
  };
  window.getStaticCompositions = () => {
    const compositions = getUnevaluatedComps();
    const inputProps = typeof window === "undefined" || (0,remotion__WEBPACK_IMPORTED_MODULE_3__.getRemotionEnvironment)().isPlayer ? {} : (0,remotion__WEBPACK_IMPORTED_MODULE_3__.getInputProps)() ?? {};
    return Promise.all(
      compositions.map(async (c) => {
        const handle = (0,remotion__WEBPACK_IMPORTED_MODULE_3__.delayRender)(
          `Running calculateMetadata() for composition ${c.id}. If you didn't want to evaluate this composition, use "selectComposition()" instead of "getCompositions()"`
        );
        const originalProps = {
          ...c.defaultProps ?? {},
          ...inputProps ?? {}
        };
        const comp = remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.resolveVideoConfig({
          calculateMetadata: c.calculateMetadata,
          compositionDurationInFrames: c.durationInFrames ?? null,
          compositionFps: c.fps ?? null,
          compositionHeight: c.height ?? null,
          compositionWidth: c.width ?? null,
          signal: new AbortController().signal,
          originalProps,
          defaultProps: c.defaultProps ?? {},
          compositionId: c.id
        });
        const resolved = await Promise.resolve(comp);
        (0,remotion__WEBPACK_IMPORTED_MODULE_3__.continueRender)(handle);
        const { props, defaultProps, ...data } = resolved;
        return {
          ...data,
          serializedResolvedPropsWithCustomSchema: remotion_no_react__WEBPACK_IMPORTED_MODULE_4__.NoReactInternals.serializeJSONWithDate({
            data: props,
            indent: void 0,
            staticBase: null
          }).serializedString,
          serializedDefaultPropsWithCustomSchema: remotion_no_react__WEBPACK_IMPORTED_MODULE_4__.NoReactInternals.serializeJSONWithDate({
            data: defaultProps,
            indent: void 0,
            staticBase: null
          }).serializedString
        };
      })
    );
  };
  window.remotion_getCompositionNames = () => {
    return getUnevaluatedComps().map((c) => c.id);
  };
  window.remotion_calculateComposition = async (compId) => {
    const compositions = getUnevaluatedComps();
    const selectedComp = compositions.find((c) => c.id === compId);
    if (!selectedComp) {
      throw new Error(
        `Could not find composition with ID ${compId}. Available compositions: ${compositions.map((c) => c.id).join(", ")}`
      );
    }
    const abortController = new AbortController();
    const handle = (0,remotion__WEBPACK_IMPORTED_MODULE_3__.delayRender)(
      `Running the calculateMetadata() function for composition ${compId}`
    );
    const inputProps = typeof window === "undefined" || (0,remotion__WEBPACK_IMPORTED_MODULE_3__.getRemotionEnvironment)().isPlayer ? {} : (0,remotion__WEBPACK_IMPORTED_MODULE_3__.getInputProps)() ?? {};
    const originalProps = {
      ...selectedComp.defaultProps ?? {},
      ...inputProps ?? {}
    };
    const prom = await Promise.resolve(
      remotion__WEBPACK_IMPORTED_MODULE_3__.Internals.resolveVideoConfig({
        calculateMetadata: selectedComp.calculateMetadata,
        compositionDurationInFrames: selectedComp.durationInFrames ?? null,
        compositionFps: selectedComp.fps ?? null,
        compositionHeight: selectedComp.height ?? null,
        compositionWidth: selectedComp.width ?? null,
        originalProps,
        signal: abortController.signal,
        defaultProps: selectedComp.defaultProps ?? {},
        compositionId: selectedComp.id
      })
    );
    (0,remotion__WEBPACK_IMPORTED_MODULE_3__.continueRender)(handle);
    const { props, defaultProps, ...data } = prom;
    return {
      ...data,
      serializedResolvedPropsWithCustomSchema: remotion_no_react__WEBPACK_IMPORTED_MODULE_4__.NoReactInternals.serializeJSONWithDate({
        data: props,
        indent: void 0,
        staticBase: null
      }).serializedString,
      serializedDefaultPropsWithCustomSchema: remotion_no_react__WEBPACK_IMPORTED_MODULE_4__.NoReactInternals.serializeJSONWithDate({
        data: defaultProps,
        indent: void 0,
        staticBase: null
      }).serializedString
    };
  };
  window.remotion_setBundleMode = setBundleModeAndUpdate;
}

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map