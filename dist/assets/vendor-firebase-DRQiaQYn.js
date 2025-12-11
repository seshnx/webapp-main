import{ao as Tu,ap as HI}from"./vendor-CTVafslE.js";var Df={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gm=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},zI=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],a=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},ym={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,a=o?n[s+1]:0,l=s+2<n.length,u=l?n[s+2]:0,d=i>>2,f=(i&3)<<4|a>>4;let _=(a&15)<<2|u>>6,g=u&63;l||(g=64,o||(_=64)),r.push(t[d],t[f],t[_],t[g])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(gm(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):zI(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],a=s<n.length?t[n.charAt(s)]:0;++s;const u=s<n.length?t[n.charAt(s)]:64;++s;const f=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||a==null||u==null||f==null)throw new KI;const _=i<<2|a>>4;if(r.push(_),u!==64){const g=a<<4&240|u>>2;if(r.push(g),f!==64){const w=u<<6&192|f;r.push(w)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let KI=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const QI=function(n){const e=gm(n);return ym.encodeByteArray(e,!0)},sa=function(n){return QI(n).replace(/\./g,"")},Em=function(n){try{return ym.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function YI(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const JI=()=>YI().__FIREBASE_DEFAULTS__,XI=()=>{if(typeof process>"u"||typeof Df>"u")return;const n=Df.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},ZI=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Em(n[1]);return e&&JSON.parse(e)},ja=()=>{try{return JI()||XI()||ZI()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},vm=n=>{var e,t;return(t=(e=ja())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},eT=n=>{const e=vm(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Im=()=>{var n;return(n=ja())===null||n===void 0?void 0:n.config},Tm=n=>{var e;return(e=ja())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let tT=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nT(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},n);return[sa(JSON.stringify(t)),sa(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ne(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function rT(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ne())}function sT(){var n;const e=(n=ja())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function iT(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function oT(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function aT(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function cT(){const n=Ne();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function wm(){return!sT()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Am(){try{return typeof indexedDB=="object"}catch{return!1}}function lT(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uT="FirebaseError";let mr=class bm extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=uT,Object.setPrototypeOf(this,bm.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,qi.prototype.create)}},qi=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?hT(i,r):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new mr(s,a,r)}};function hT(n,e){return n.replace(dT,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const dT=/\{\$([^}]+)}/g;function fT(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Jn(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(kf(i)&&kf(o)){if(!Jn(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function kf(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ji(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function ti(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function ni(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function pT(n,e){const t=new _T(n,e);return t.subscribe.bind(t)}class _T{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");mT(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=Zc),s.error===void 0&&(s.error=Zc),s.complete===void 0&&(s.complete=Zc);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function mT(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Zc(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _e(n){return n&&n._delegate?n._delegate:n}let Xn=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fn="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gT{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new tT;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(ET(e))try{this.getOrInitializeService({instanceIdentifier:Fn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Fn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Fn){return this.instances.has(e)}getOptions(e=Fn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);r===a&&o.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const o=this.instances.get(s);return o&&e(o,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:yT(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Fn){return this.component?this.component.multipleInstances?e:Fn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function yT(n){return n===Fn?void 0:n}function ET(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vT{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new gT(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ee;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(ee||(ee={}));const IT={debug:ee.DEBUG,verbose:ee.VERBOSE,info:ee.INFO,warn:ee.WARN,error:ee.ERROR,silent:ee.SILENT},TT=ee.INFO,wT={[ee.DEBUG]:"log",[ee.VERBOSE]:"log",[ee.INFO]:"info",[ee.WARN]:"warn",[ee.ERROR]:"error"},AT=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=wT[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let wu=class{constructor(e){this.name=e,this._logLevel=TT,this._logHandler=AT,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ee))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?IT[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ee.DEBUG,...e),this._logHandler(this,ee.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ee.VERBOSE,...e),this._logHandler(this,ee.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ee.INFO,...e),this._logHandler(this,ee.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ee.WARN,...e),this._logHandler(this,ee.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ee.ERROR,...e),this._logHandler(this,ee.ERROR,...e)}};const bT=(n,e)=>e.some(t=>n instanceof t);let xf,Of;function ST(){return xf||(xf=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function RT(){return Of||(Of=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Sm=new WeakMap,Al=new WeakMap,Rm=new WeakMap,el=new WeakMap,Au=new WeakMap;function CT(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",o)},i=()=>{t(_n(n.result)),s()},o=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&Sm.set(t,n)}).catch(()=>{}),Au.set(e,n),e}function PT(n){if(Al.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",o),n.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",o),n.addEventListener("abort",o)});Al.set(n,e)}let bl={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Al.get(n);if(e==="objectStoreNames")return n.objectStoreNames||Rm.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return _n(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function NT(n){bl=n(bl)}function DT(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(tl(this),e,...t);return Rm.set(r,e.sort?e.sort():[e]),_n(r)}:RT().includes(n)?function(...e){return n.apply(tl(this),e),_n(Sm.get(this))}:function(...e){return _n(n.apply(tl(this),e))}}function kT(n){return typeof n=="function"?DT(n):(n instanceof IDBTransaction&&PT(n),bT(n,ST())?new Proxy(n,bl):n)}function _n(n){if(n instanceof IDBRequest)return CT(n);if(el.has(n))return el.get(n);const e=kT(n);return e!==n&&(el.set(n,e),Au.set(e,n)),e}const tl=n=>Au.get(n);function xT(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(n,e),a=_n(o);return r&&o.addEventListener("upgradeneeded",l=>{r(_n(o.result),l.oldVersion,l.newVersion,_n(o.transaction),l)}),t&&o.addEventListener("blocked",l=>t(l.oldVersion,l.newVersion,l)),a.then(l=>{i&&l.addEventListener("close",()=>i()),s&&l.addEventListener("versionchange",u=>s(u.oldVersion,u.newVersion,u))}).catch(()=>{}),a}const OT=["get","getKey","getAll","getAllKeys","count"],VT=["put","add","delete","clear"],nl=new Map;function Vf(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(nl.get(e))return nl.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=VT.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||OT.includes(t)))return;const i=async function(o,...a){const l=this.transaction(o,s?"readwrite":"readonly");let u=l.store;return r&&(u=u.index(a.shift())),(await Promise.all([u[t](...a),s&&l.done]))[0]};return nl.set(e,i),i}NT(n=>({...n,get:(e,t,r)=>Vf(e,t)||n.get(e,t,r),has:(e,t)=>!!Vf(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let MT=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(LT(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}};function LT(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Sl="@firebase/app",Mf="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gt=new wu("@firebase/app"),FT="@firebase/app-compat",UT="@firebase/analytics-compat",BT="@firebase/analytics",$T="@firebase/app-check-compat",qT="@firebase/app-check",jT="@firebase/auth",WT="@firebase/auth-compat",GT="@firebase/database",HT="@firebase/data-connect",zT="@firebase/database-compat",KT="@firebase/functions",QT="@firebase/functions-compat",YT="@firebase/installations",JT="@firebase/installations-compat",XT="@firebase/messaging",ZT="@firebase/messaging-compat",ew="@firebase/performance",tw="@firebase/performance-compat",nw="@firebase/remote-config",rw="@firebase/remote-config-compat",sw="@firebase/storage",iw="@firebase/storage-compat",ow="@firebase/firestore",aw="@firebase/vertexai-preview",cw="@firebase/firestore-compat",lw="firebase",uw="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rl="[DEFAULT]",hw={[Sl]:"fire-core",[FT]:"fire-core-compat",[BT]:"fire-analytics",[UT]:"fire-analytics-compat",[qT]:"fire-app-check",[$T]:"fire-app-check-compat",[jT]:"fire-auth",[WT]:"fire-auth-compat",[GT]:"fire-rtdb",[HT]:"fire-data-connect",[zT]:"fire-rtdb-compat",[KT]:"fire-fn",[QT]:"fire-fn-compat",[YT]:"fire-iid",[JT]:"fire-iid-compat",[XT]:"fire-fcm",[ZT]:"fire-fcm-compat",[ew]:"fire-perf",[tw]:"fire-perf-compat",[nw]:"fire-rc",[rw]:"fire-rc-compat",[sw]:"fire-gcs",[iw]:"fire-gcs-compat",[ow]:"fire-fst",[cw]:"fire-fst-compat",[aw]:"fire-vertex","fire-js":"fire-js",[lw]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ia=new Map,dw=new Map,Cl=new Map;function Lf(n,e){try{n.container.addComponent(e)}catch(t){Gt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Kr(n){const e=n.name;if(Cl.has(e))return Gt.debug(`There were multiple attempts to register component ${e}.`),!1;Cl.set(e,n);for(const t of ia.values())Lf(t,n);for(const t of dw.values())Lf(t,n);return!0}function Wa(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function dt(n){return n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fw={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},mn=new qi("app","Firebase",fw);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pw{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Xn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw mn.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _s=uw;function _w(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Rl,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw mn.create("bad-app-name",{appName:String(s)});if(t||(t=Im()),!t)throw mn.create("no-options");const i=ia.get(s);if(i){if(Jn(t,i.options)&&Jn(r,i.config))return i;throw mn.create("duplicate-app",{appName:s})}const o=new vT(s);for(const l of Cl.values())o.addComponent(l);const a=new pw(t,r,o);return ia.set(s,a),a}function Cm(n=Rl){const e=ia.get(n);if(!e&&n===Rl&&Im())return _w();if(!e)throw mn.create("no-app",{appName:n});return e}function gn(n,e,t){var r;let s=(r=hw[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const i=s.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const a=[`Unable to register library "${s}" with version "${e}":`];i&&a.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&a.push("and"),o&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Gt.warn(a.join(" "));return}Kr(new Xn(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mw="firebase-heartbeat-database",gw=1,Ii="firebase-heartbeat-store";let rl=null;function Pm(){return rl||(rl=xT(mw,gw,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Ii)}catch(t){console.warn(t)}}}}).catch(n=>{throw mn.create("idb-open",{originalErrorMessage:n.message})})),rl}async function yw(n){try{const t=(await Pm()).transaction(Ii),r=await t.objectStore(Ii).get(Nm(n));return await t.done,r}catch(e){if(e instanceof mr)Gt.warn(e.message);else{const t=mn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Gt.warn(t.message)}}}async function Ff(n,e){try{const r=(await Pm()).transaction(Ii,"readwrite");await r.objectStore(Ii).put(e,Nm(n)),await r.done}catch(t){if(t instanceof mr)Gt.warn(t.message);else{const r=mn.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Gt.warn(r.message)}}}function Nm(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ew=1024,vw=30*24*60*60*1e3;let Iw=class{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new ww(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Uf();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(o=>{const a=new Date(o.date).valueOf();return Date.now()-a<=vw}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Gt.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Uf(),{heartbeatsToSend:r,unsentEntries:s}=Tw(this._heartbeatsCache.heartbeats),i=sa(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return Gt.warn(t),""}}};function Uf(){return new Date().toISOString().substring(0,10)}function Tw(n,e=Ew){const t=[];let r=n.slice();for(const s of n){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),Bf(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Bf(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}let ww=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Am()?lT().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await yw(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return Ff(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return Ff(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}};function Bf(n){return sa(JSON.stringify({version:2,heartbeats:n})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Aw(n){Kr(new Xn("platform-logger",e=>new MT(e),"PRIVATE")),Kr(new Xn("heartbeat",e=>new Iw(e),"PRIVATE")),gn(Sl,Mf,n),gn(Sl,Mf,"esm2017"),gn("fire-js","")}Aw("");function Dm(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const bw=Dm,km=new qi("auth","Firebase",Dm());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const oa=new wu("@firebase/auth");function Sw(n,...e){oa.logLevel<=ee.WARN&&oa.warn(`Auth (${_s}): ${n}`,...e)}function Wo(n,...e){oa.logLevel<=ee.ERROR&&oa.error(`Auth (${_s}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pt(n,...e){throw Su(n,...e)}function yt(n,...e){return Su(n,...e)}function bu(n,e,t){const r=Object.assign(Object.assign({},bw()),{[e]:t});return new qi("auth","Firebase",r).create(e,{appName:n.name})}function St(n){return bu(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Rw(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&pt(n,"argument-error"),bu(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Su(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return km.create(n,...e)}function G(n,e,...t){if(!n)throw Su(e,...t)}function Lt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Wo(e),new Error(e)}function Ht(n,e){n||Lt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pl(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function Cw(){return $f()==="http:"||$f()==="https:"}function $f(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pw(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Cw()||oT()||"connection"in navigator)?navigator.onLine:!0}function Nw(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi{constructor(e,t){this.shortDelay=e,this.longDelay=t,Ht(t>e,"Short delay should be less than long delay!"),this.isMobile=rT()||aT()}get(){return Pw()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ru(n,e){Ht(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xm{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Lt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Lt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Lt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dw={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kw=new Wi(3e4,6e4);function Qt(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function Pt(n,e,t,r,s={}){return Om(n,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const a=ji(Object.assign({key:n.config.apiKey},o)).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const u=Object.assign({method:e,headers:l},i);return iT()||(u.referrerPolicy="no-referrer"),xm.fetch()(Vm(n,n.config.apiHost,t,a),u)})}async function Om(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},Dw),e);try{const s=new Ow(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw xo(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const a=i.ok?o.errorMessage:o.error.message,[l,u]=a.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw xo(n,"credential-already-in-use",o);if(l==="EMAIL_EXISTS")throw xo(n,"email-already-in-use",o);if(l==="USER_DISABLED")throw xo(n,"user-disabled",o);const d=r[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw bu(n,d,u);pt(n,d)}}catch(s){if(s instanceof mr)throw s;pt(n,"network-request-failed",{message:String(s)})}}async function Gi(n,e,t,r,s={}){const i=await Pt(n,e,t,r,s);return"mfaPendingCredential"in i&&pt(n,"multi-factor-auth-required",{_serverResponse:i}),i}function Vm(n,e,t,r){const s=`${e}${t}?${r}`;return n.config.emulator?Ru(n.config,s):`${n.config.apiScheme}://${s}`}function xw(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Ow{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(yt(this.auth,"network-request-failed")),kw.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function xo(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=yt(n,e,r);return s.customData._tokenResponse=t,s}function qf(n){return n!==void 0&&n.enterprise!==void 0}class Vw{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return xw(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}}async function Mw(n,e){return Pt(n,"GET","/v2/recaptchaConfig",Qt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Lw(n,e){return Pt(n,"POST","/v1/accounts:delete",e)}async function Mm(n,e){return Pt(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ci(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Fw(n,e=!1){const t=_e(n),r=await t.getIdToken(e),s=Cu(r);G(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:ci(sl(s.auth_time)),issuedAtTime:ci(sl(s.iat)),expirationTime:ci(sl(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function sl(n){return Number(n)*1e3}function Cu(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Wo("JWT malformed, contained fewer than 3 sections"),null;try{const s=Em(t);return s?JSON.parse(s):(Wo("Failed to decode base64 JWT payload"),null)}catch(s){return Wo("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function jf(n){const e=Cu(n);return G(e,"internal-error"),G(typeof e.exp<"u","internal-error"),G(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof mr&&Uw(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function Uw({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bw{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nl{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=ci(this.lastLoginAt),this.creationTime=ci(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function aa(n){var e;const t=n.auth,r=await n.getIdToken(),s=await Qr(n,Mm(t,{idToken:r}));G(s==null?void 0:s.users.length,t,"internal-error");const i=s.users[0];n._notifyReloadListener(i);const o=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?Lm(i.providerUserInfo):[],a=qw(n.providerData,o),l=n.isAnonymous,u=!(n.email&&i.passwordHash)&&!(a!=null&&a.length),d=l?u:!1,f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:a,metadata:new Nl(i.createdAt,i.lastLoginAt),isAnonymous:d};Object.assign(n,f)}async function $w(n){const e=_e(n);await aa(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function qw(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Lm(n){return n.map(e=>{var{providerId:t}=e,r=Tu(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jw(n,e){const t=await Om(n,{},async()=>{const r=ji({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,o=Vm(n,s,"/v1/token",`key=${i}`),a=await n._getAdditionalHeaders();return a["Content-Type"]="application/x-www-form-urlencoded",xm.fetch()(o,{method:"POST",headers:a,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Ww(n,e){return Pt(n,"POST","/v2/accounts:revokeToken",Qt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $r{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){G(e.idToken,"internal-error"),G(typeof e.idToken<"u","internal-error"),G(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):jf(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){G(e.length!==0,"internal-error");const t=jf(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(G(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await jw(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,o=new $r;return r&&(G(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(G(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(G(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new $r,this.toJSON())}_performRefresh(){return Lt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nn(n,e){G(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Ft{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,i=Tu(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new Bw(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Nl(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await Qr(this,this.stsTokenManager.getToken(this.auth,e));return G(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Fw(this,e)}reload(){return $w(this)}_assign(e){this!==e&&(G(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Ft(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){G(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await aa(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(dt(this.auth.app))return Promise.reject(St(this.auth));const e=await this.getIdToken();return await Qr(this,Lw(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,i,o,a,l,u,d;const f=(r=t.displayName)!==null&&r!==void 0?r:void 0,_=(s=t.email)!==null&&s!==void 0?s:void 0,g=(i=t.phoneNumber)!==null&&i!==void 0?i:void 0,w=(o=t.photoURL)!==null&&o!==void 0?o:void 0,D=(a=t.tenantId)!==null&&a!==void 0?a:void 0,P=(l=t._redirectEventId)!==null&&l!==void 0?l:void 0,B=(u=t.createdAt)!==null&&u!==void 0?u:void 0,$=(d=t.lastLoginAt)!==null&&d!==void 0?d:void 0,{uid:L,emailVerified:j,isAnonymous:Z,providerData:z,stsTokenManager:I}=t;G(L&&I,e,"internal-error");const y=$r.fromJSON(this.name,I);G(typeof L=="string",e,"internal-error"),nn(f,e.name),nn(_,e.name),G(typeof j=="boolean",e,"internal-error"),G(typeof Z=="boolean",e,"internal-error"),nn(g,e.name),nn(w,e.name),nn(D,e.name),nn(P,e.name),nn(B,e.name),nn($,e.name);const E=new Ft({uid:L,auth:e,email:_,emailVerified:j,displayName:f,isAnonymous:Z,photoURL:w,phoneNumber:g,tenantId:D,stsTokenManager:y,createdAt:B,lastLoginAt:$});return z&&Array.isArray(z)&&(E.providerData=z.map(T=>Object.assign({},T))),P&&(E._redirectEventId=P),E}static async _fromIdTokenResponse(e,t,r=!1){const s=new $r;s.updateFromServerResponse(t);const i=new Ft({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await aa(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];G(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Lm(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),a=new $r;a.updateFromIdToken(r);const l=new Ft({uid:s.localId,auth:e,stsTokenManager:a,isAnonymous:o}),u={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Nl(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,u),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Wf=new Map;function Ut(n){Ht(n instanceof Function,"Expected a class definition");let e=Wf.get(n);return e?(Ht(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Wf.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fm{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Fm.type="NONE";const Gf=Fm;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Go(n,e,t){return`firebase:${n}:${e}:${t}`}class qr{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Go(this.userKey,s.apiKey,i),this.fullPersistenceKey=Go("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?Ft._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new qr(Ut(Gf),e,r);const s=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let i=s[0]||Ut(Gf);const o=Go(r,e.config.apiKey,e.name);let a=null;for(const u of t)try{const d=await u._get(o);if(d){const f=Ft._fromJSON(e,d);u!==i&&(a=f),i=u;break}}catch{}const l=s.filter(u=>u._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new qr(i,e,r):(i=l[0],a&&await i._set(o,a.toJSON()),await Promise.all(t.map(async u=>{if(u!==i)try{await u._remove(o)}catch{}})),new qr(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hf(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(qm(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Um(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Wm(e))return"Blackberry";if(Gm(e))return"Webos";if(Bm(e))return"Safari";if((e.includes("chrome/")||$m(e))&&!e.includes("edge/"))return"Chrome";if(jm(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Um(n=Ne()){return/firefox\//i.test(n)}function Bm(n=Ne()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function $m(n=Ne()){return/crios\//i.test(n)}function qm(n=Ne()){return/iemobile/i.test(n)}function jm(n=Ne()){return/android/i.test(n)}function Wm(n=Ne()){return/blackberry/i.test(n)}function Gm(n=Ne()){return/webos/i.test(n)}function Pu(n=Ne()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Gw(n=Ne()){var e;return Pu(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function Hw(){return cT()&&document.documentMode===10}function Hm(n=Ne()){return Pu(n)||jm(n)||Gm(n)||Wm(n)||/windows phone/i.test(n)||qm(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zm(n,e=[]){let t;switch(n){case"Browser":t=Hf(Ne());break;case"Worker":t=`${Hf(Ne())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${_s}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zw{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((o,a)=>{try{const l=e(i);o(l)}catch(l){a(l)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kw(n,e={}){return Pt(n,"GET","/v2/passwordPolicy",Qt(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qw=6;class Yw{constructor(e){var t,r,s,i;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=o.minPasswordLength)!==null&&t!==void 0?t:Qw,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,s,i,o,a;const l={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,l),this.validatePasswordCharacterOptions(e,l),l.isValid&&(l.isValid=(t=l.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),l.isValid&&(l.isValid=(r=l.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),l.isValid&&(l.isValid=(s=l.containsLowercaseLetter)!==null&&s!==void 0?s:!0),l.isValid&&(l.isValid=(i=l.containsUppercaseLetter)!==null&&i!==void 0?i:!0),l.isValid&&(l.isValid=(o=l.containsNumericCharacter)!==null&&o!==void 0?o:!0),l.isValid&&(l.isValid=(a=l.containsNonAlphanumericCharacter)!==null&&a!==void 0?a:!0),l}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jw{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new zf(this),this.idTokenSubscription=new zf(this),this.beforeStateQueue=new zw(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=km,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Ut(t)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await qr.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Mm(this,{idToken:e}),r=await Ft._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(dt(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,a=s==null?void 0:s._redirectEventId,l=await this.tryRedirectSignIn(e);(!o||o===a)&&(l!=null&&l.user)&&(s=l.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return G(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await aa(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Nw()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(dt(this.app))return Promise.reject(St(this));const t=e?_e(e):null;return t&&G(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&G(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return dt(this.app)?Promise.reject(St(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return dt(this.app)?Promise.reject(St(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ut(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Kw(this),t=new Yw(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new qi("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await Ww(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Ut(e)||this._popupRedirectResolver;G(t,this,"argument-error"),this.redirectPersistenceManager=await qr.create(this,[Ut(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(G(a,this,"internal-error"),a.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const l=e.addObserver(t,r,s);return()=>{o=!0,l()}}else{const l=e.addObserver(t);return()=>{o=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return G(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=zm(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&Sw(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Yt(n){return _e(n)}class zf{constructor(e){this.auth=e,this.observer=null,this.addObserver=pT(t=>this.observer=t)}get next(){return G(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ga={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Xw(n){Ga=n}function Km(n){return Ga.loadJS(n)}function Zw(){return Ga.recaptchaEnterpriseScript}function eA(){return Ga.gapiScript}function tA(n){return`__${n}${Math.floor(Math.random()*1e6)}`}const nA="recaptcha-enterprise",rA="NO_RECAPTCHA";class sA{constructor(e){this.type=nA,this.auth=Yt(e)}async verify(e="verify",t=!1){async function r(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,a)=>{Mw(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const u=new Vw(l);return i.tenantId==null?i._agentRecaptchaConfig=u:i._tenantRecaptchaConfigs[i.tenantId]=u,o(u.siteKey)}}).catch(l=>{a(l)})})}function s(i,o,a){const l=window.grecaptcha;qf(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(u=>{o(u)}).catch(()=>{o(rA)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((i,o)=>{r(this.auth).then(a=>{if(!t&&qf(window.grecaptcha))s(a,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let l=Zw();l.length!==0&&(l+=a),Km(l).then(()=>{s(a,i,o)}).catch(u=>{o(u)})}}).catch(a=>{o(a)})})}}async function Kf(n,e,t,r=!1){const s=new sA(n);let i;try{i=await s.verify(t)}catch{i=await s.verify(t,!0)}const o=Object.assign({},e);return r?Object.assign(o,{captchaResp:i}):Object.assign(o,{captchaResponse:i}),Object.assign(o,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(o,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),o}async function ca(n,e,t,r){var s;if(!((s=n._getRecaptchaConfig())===null||s===void 0)&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const i=await Kf(n,e,t,t==="getOobCode");return r(n,i)}else return r(n,e).catch(async i=>{if(i.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const o=await Kf(n,e,t,t==="getOobCode");return r(n,o)}else return Promise.reject(i)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iA(n,e){const t=Wa(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(Jn(i,e??{}))return s;pt(s,"already-initialized")}return t.initialize({options:e})}function oA(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Ut);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function aA(n,e,t){const r=Yt(n);G(r._canInitEmulator,r,"emulator-config-failed"),G(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=Qm(e),{host:o,port:a}=cA(e),l=a===null?"":`:${a}`;r.config.emulator={url:`${i}//${o}${l}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:o,port:a,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),lA()}function Qm(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function cA(n){const e=Qm(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:Qf(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:Qf(o)}}}function Qf(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function lA(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nu{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Lt("not implemented")}_getIdTokenResponse(e){return Lt("not implemented")}_linkToIdToken(e,t){return Lt("not implemented")}_getReauthenticationResolver(e){return Lt("not implemented")}}async function uA(n,e){return Pt(n,"POST","/v1/accounts:update",e)}async function hA(n,e){return Pt(n,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dA(n,e){return Gi(n,"POST","/v1/accounts:signInWithPassword",Qt(n,e))}async function fA(n,e){return Pt(n,"POST","/v1/accounts:sendOobCode",Qt(n,e))}async function pA(n,e){return fA(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _A(n,e){return Gi(n,"POST","/v1/accounts:signInWithEmailLink",Qt(n,e))}async function mA(n,e){return Gi(n,"POST","/v1/accounts:signInWithEmailLink",Qt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ti extends Nu{constructor(e,t,r,s=null){super("password",r),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new Ti(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new Ti(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ca(e,t,"signInWithPassword",dA);case"emailLink":return _A(e,{email:this._email,oobCode:this._password});default:pt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ca(e,r,"signUpPassword",hA);case"emailLink":return mA(e,{idToken:t,email:this._email,oobCode:this._password});default:pt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jr(n,e){return Gi(n,"POST","/v1/accounts:signInWithIdp",Qt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gA="http://localhost";class Zn extends Nu{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Zn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):pt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,i=Tu(t,["providerId","signInMethod"]);if(!r||!s)return null;const o=new Zn(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return jr(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,jr(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,jr(e,t)}buildRequest(){const e={requestUri:gA,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=ji(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yA(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function EA(n){const e=ti(ni(n)).link,t=e?ti(ni(e)).deep_link_id:null,r=ti(ni(n)).deep_link_id;return(r?ti(ni(r)).link:null)||r||t||e||n}class Du{constructor(e){var t,r,s,i,o,a;const l=ti(ni(e)),u=(t=l.apiKey)!==null&&t!==void 0?t:null,d=(r=l.oobCode)!==null&&r!==void 0?r:null,f=yA((s=l.mode)!==null&&s!==void 0?s:null);G(u&&d&&f,"argument-error"),this.apiKey=u,this.operation=f,this.code=d,this.continueUrl=(i=l.continueUrl)!==null&&i!==void 0?i:null,this.languageCode=(o=l.languageCode)!==null&&o!==void 0?o:null,this.tenantId=(a=l.tenantId)!==null&&a!==void 0?a:null}static parseLink(e){const t=EA(e);try{return new Du(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ms{constructor(){this.providerId=ms.PROVIDER_ID}static credential(e,t){return Ti._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=Du.parseLink(t);return G(r,"argument-error"),Ti._fromEmailAndCode(e,r.code,r.tenantId)}}ms.PROVIDER_ID="password";ms.EMAIL_PASSWORD_SIGN_IN_METHOD="password";ms.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ku{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hi extends ku{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class on extends Hi{constructor(){super("facebook.com")}static credential(e){return Zn._fromParams({providerId:on.PROVIDER_ID,signInMethod:on.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return on.credentialFromTaggedObject(e)}static credentialFromError(e){return on.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return on.credential(e.oauthAccessToken)}catch{return null}}}on.FACEBOOK_SIGN_IN_METHOD="facebook.com";on.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an extends Hi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Zn._fromParams({providerId:an.PROVIDER_ID,signInMethod:an.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return an.credentialFromTaggedObject(e)}static credentialFromError(e){return an.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return an.credential(t,r)}catch{return null}}}an.GOOGLE_SIGN_IN_METHOD="google.com";an.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cn extends Hi{constructor(){super("github.com")}static credential(e){return Zn._fromParams({providerId:cn.PROVIDER_ID,signInMethod:cn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return cn.credentialFromTaggedObject(e)}static credentialFromError(e){return cn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return cn.credential(e.oauthAccessToken)}catch{return null}}}cn.GITHUB_SIGN_IN_METHOD="github.com";cn.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln extends Hi{constructor(){super("twitter.com")}static credential(e,t){return Zn._fromParams({providerId:ln.PROVIDER_ID,signInMethod:ln.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return ln.credentialFromTaggedObject(e)}static credentialFromError(e){return ln.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return ln.credential(t,r)}catch{return null}}}ln.TWITTER_SIGN_IN_METHOD="twitter.com";ln.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vA(n,e){return Gi(n,"POST","/v1/accounts:signUp",Qt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class er{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await Ft._fromIdTokenResponse(e,r,s),o=Yf(r);return new er({user:i,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=Yf(r);return new er({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function Yf(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class la extends mr{constructor(e,t,r,s){var i;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,la.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new la(e,t,r,s)}}function Ym(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?la._fromErrorAndOperation(n,i,e,r):i})}async function IA(n,e,t=!1){const r=await Qr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return er._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Jm(n,e,t=!1){const{auth:r}=n;if(dt(r.app))return Promise.reject(St(r));const s="reauthenticate";try{const i=await Qr(n,Ym(r,s,e,n),t);G(i.idToken,r,"internal-error");const o=Cu(i.idToken);G(o,r,"internal-error");const{sub:a}=o;return G(n.uid===a,r,"user-mismatch"),er._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&pt(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Xm(n,e,t=!1){if(dt(n.app))return Promise.reject(St(n));const r="signIn",s=await Ym(n,r,e),i=await er._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}async function TA(n,e){return Xm(Yt(n),e)}async function pV(n,e){return Jm(_e(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Zm(n){const e=Yt(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function _V(n,e,t){const r=Yt(n);await ca(r,{requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"},"getOobCode",pA)}async function mV(n,e,t){if(dt(n.app))return Promise.reject(St(n));const r=Yt(n),o=await ca(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",vA).catch(l=>{throw l.code==="auth/password-does-not-meet-requirements"&&Zm(n),l}),a=await er._fromIdTokenResponse(r,"signIn",o);return await r._updateCurrentUser(a.user),a}function gV(n,e,t){return dt(n.app)?Promise.reject(St(n)):TA(_e(n),ms.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Zm(n),r})}function yV(n,e){const t=_e(n);return dt(t.auth.app)?Promise.reject(St(t.auth)):eg(t,e,null)}function EV(n,e){return eg(_e(n),null,e)}async function eg(n,e,t){const{auth:r}=n,i={idToken:await n.getIdToken(),returnSecureToken:!0};e&&(i.email=e),t&&(i.password=t);const o=await Qr(n,uA(r,i));await n._updateTokensIfNecessary(o,!0)}function wA(n,e,t,r){return _e(n).onIdTokenChanged(e,t,r)}function AA(n,e,t){return _e(n).beforeAuthStateChanged(e,t)}function vV(n,e,t,r){return _e(n).onAuthStateChanged(e,t,r)}function IV(n){return _e(n).signOut()}async function TV(n){return _e(n).delete()}const ua="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tg{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(ua,"1"),this.storage.removeItem(ua),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bA=1e3,SA=10;class ng extends tg{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Hm(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,a,l)=>{this.notifyListeners(o,l)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);Hw()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,SA):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},bA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}ng.type="LOCAL";const RA=ng;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rg extends tg{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}rg.type="SESSION";const sg=rg;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CA(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ha{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Ha(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const a=Array.from(o).map(async u=>u(t.origin,i)),l=await CA(a);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Ha.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xu(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PA{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((a,l)=>{const u=xu("",20);s.port1.start();const d=setTimeout(()=>{l(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(f){const _=f;if(_.data.eventId===u)switch(_.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),a(_.data.response);break;default:clearTimeout(d),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rt(){return window}function NA(n){Rt().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ig(){return typeof Rt().WorkerGlobalScope<"u"&&typeof Rt().importScripts=="function"}async function DA(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function kA(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function xA(){return ig()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const og="firebaseLocalStorageDb",OA=1,ha="firebaseLocalStorage",ag="fbase_key";class zi{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function za(n,e){return n.transaction([ha],e?"readwrite":"readonly").objectStore(ha)}function VA(){const n=indexedDB.deleteDatabase(og);return new zi(n).toPromise()}function Dl(){const n=indexedDB.open(og,OA);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(ha,{keyPath:ag})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(ha)?e(r):(r.close(),await VA(),e(await Dl()))})})}async function Jf(n,e,t){const r=za(n,!0).put({[ag]:e,value:t});return new zi(r).toPromise()}async function MA(n,e){const t=za(n,!1).get(e),r=await new zi(t).toPromise();return r===void 0?null:r.value}function Xf(n,e){const t=za(n,!0).delete(e);return new zi(t).toPromise()}const LA=800,FA=3;class cg{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Dl(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>FA)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return ig()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ha._getInstance(xA()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await DA(),!this.activeServiceWorker)return;this.sender=new PA(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||kA()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Dl();return await Jf(e,ua,"1"),await Xf(e,ua),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Jf(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>MA(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Xf(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=za(s,!1).getAll();return new zi(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),LA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}cg.type="LOCAL";const UA=cg;new Wi(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lg(n,e){return e?Ut(e):(G(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ou extends Nu{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return jr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return jr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return jr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function BA(n){return Xm(n.auth,new Ou(n),n.bypassAuthState)}function $A(n){const{auth:e,user:t}=n;return G(t,e,"internal-error"),Jm(t,new Ou(n),n.bypassAuthState)}async function qA(n){const{auth:e,user:t}=n;return G(t,e,"internal-error"),IA(t,new Ou(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ug{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:o,type:a}=e;if(o){this.reject(o);return}const l={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(l))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return BA;case"linkViaPopup":case"linkViaRedirect":return qA;case"reauthViaPopup":case"reauthViaRedirect":return $A;default:pt(this.auth,"internal-error")}}resolve(e){Ht(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ht(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jA=new Wi(2e3,1e4);async function wV(n,e,t){if(dt(n.app))return Promise.reject(yt(n,"operation-not-supported-in-this-environment"));const r=Yt(n);Rw(n,e,ku);const s=lg(r,t);return new Gn(r,"signInViaPopup",e,s).executeNotNull()}class Gn extends ug{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Gn.currentPopupAction&&Gn.currentPopupAction.cancel(),Gn.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return G(e,this.auth,"internal-error"),e}async onExecution(){Ht(this.filter.length===1,"Popup operations only handle one event");const e=xu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(yt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(yt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Gn.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(yt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,jA.get())};e()}}Gn.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WA="pendingRedirect",Ho=new Map;class GA extends ug{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Ho.get(this.auth._key());if(!e){try{const r=await HA(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Ho.set(this.auth._key(),e)}return this.bypassAuthState||Ho.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function HA(n,e){const t=QA(e),r=KA(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function zA(n,e){Ho.set(n._key(),e)}function KA(n){return Ut(n._redirectPersistence)}function QA(n){return Go(WA,n.config.apiKey,n.name)}async function YA(n,e,t=!1){if(dt(n.app))return Promise.reject(St(n));const r=Yt(n),s=lg(r,e),o=await new GA(r,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const JA=10*60*1e3;class XA{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!ZA(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!hg(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(yt(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=JA&&this.cachedEventUids.clear(),this.cachedEventUids.has(Zf(e))}saveEventToCache(e){this.cachedEventUids.add(Zf(e)),this.lastProcessedEventTime=Date.now()}}function Zf(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function hg({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function ZA(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return hg(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eb(n,e={}){return Pt(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tb=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,nb=/^https?/;async function rb(n){if(n.config.emulator)return;const{authorizedDomains:e}=await eb(n);for(const t of e)try{if(sb(t))return}catch{}pt(n,"unauthorized-domain")}function sb(n){const e=Pl(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!nb.test(t))return!1;if(tb.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ib=new Wi(3e4,6e4);function ep(){const n=Rt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function ob(n){return new Promise((e,t)=>{var r,s,i;function o(){ep(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{ep(),t(yt(n,"network-request-failed"))},timeout:ib.get()})}if(!((s=(r=Rt().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=Rt().gapi)===null||i===void 0)&&i.load)o();else{const a=tA("iframefcb");return Rt()[a]=()=>{gapi.load?o():t(yt(n,"network-request-failed"))},Km(`${eA()}?onload=${a}`).catch(l=>t(l))}}).catch(e=>{throw zo=null,e})}let zo=null;function ab(n){return zo=zo||ob(n),zo}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cb=new Wi(5e3,15e3),lb="__/auth/iframe",ub="emulator/auth/iframe",hb={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},db=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function fb(n){const e=n.config;G(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Ru(e,ub):`https://${n.config.authDomain}/${lb}`,r={apiKey:e.apiKey,appName:n.name,v:_s},s=db.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${ji(r).slice(1)}`}async function pb(n){const e=await ab(n),t=Rt().gapi;return G(t,n,"internal-error"),e.open({where:document.body,url:fb(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:hb,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=yt(n,"network-request-failed"),a=Rt().setTimeout(()=>{i(o)},cb.get());function l(){Rt().clearTimeout(a),s(r)}r.ping(l).then(l,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _b={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},mb=500,gb=600,yb="_blank",Eb="http://localhost";class tp{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function vb(n,e,t,r=mb,s=gb){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let a="";const l=Object.assign(Object.assign({},_b),{width:r.toString(),height:s.toString(),top:i,left:o}),u=Ne().toLowerCase();t&&(a=$m(u)?yb:t),Um(u)&&(e=e||Eb,l.scrollbars="yes");const d=Object.entries(l).reduce((_,[g,w])=>`${_}${g}=${w},`,"");if(Gw(u)&&a!=="_self")return Ib(e||"",a),new tp(null);const f=window.open(e||"",a,d);G(f,n,"popup-blocked");try{f.focus()}catch{}return new tp(f)}function Ib(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tb="__/auth/handler",wb="emulator/auth/handler",Ab=encodeURIComponent("fac");async function np(n,e,t,r,s,i){G(n.config.authDomain,n,"auth-domain-config-required"),G(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:_s,eventId:s};if(e instanceof ku){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",fT(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,f]of Object.entries({}))o[d]=f}if(e instanceof Hi){const d=e.getScopes().filter(f=>f!=="");d.length>0&&(o.scopes=d.join(","))}n.tenantId&&(o.tid=n.tenantId);const a=o;for(const d of Object.keys(a))a[d]===void 0&&delete a[d];const l=await n._getAppCheckToken(),u=l?`#${Ab}=${encodeURIComponent(l)}`:"";return`${bb(n)}?${ji(a).slice(1)}${u}`}function bb({config:n}){return n.emulator?Ru(n,wb):`https://${n.authDomain}/${Tb}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const il="webStorageSupport";class Sb{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=sg,this._completeRedirectFn=YA,this._overrideRedirectResult=zA}async _openPopup(e,t,r,s){var i;Ht((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const o=await np(e,t,r,Pl(),s);return vb(e,o,xu())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await np(e,t,r,Pl(),s);return NA(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Ht(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await pb(e),r=new XA(e);return t.register("authEvent",s=>(G(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(il,{type:il},s=>{var i;const o=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[il];o!==void 0&&t(!!o),pt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=rb(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Hm()||Bm()||Pu()}}const Rb=Sb;var rp="@firebase/auth",sp="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cb{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){G(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Pb(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Nb(n){Kr(new Xn("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=r.options;G(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const l={apiKey:o,authDomain:a,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:zm(n)},u=new Jw(r,s,i,l);return oA(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Kr(new Xn("auth-internal",e=>{const t=Yt(e.getProvider("auth").getImmediate());return(r=>new Cb(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),gn(rp,sp,Pb(n)),gn(rp,sp,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Db=5*60,kb=Tm("authIdTokenMaxAge")||Db;let ip=null;const xb=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>kb)return;const s=t==null?void 0:t.token;ip!==s&&(ip=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function AV(n=Cm()){const e=Wa(n,"auth");if(e.isInitialized())return e.getImmediate();const t=iA(n,{popupRedirectResolver:Rb,persistence:[UA,RA,sg]}),r=Tm("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=xb(i.toString());AA(t,o,()=>o(t.currentUser)),wA(t,a=>o(a))}}const s=vm("auth");return s&&aA(t,`http://${s}`),t}function Ob(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}Xw({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=yt("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",Ob().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Nb("Browser");var op=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var zn,dg;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(I,y){function E(){}E.prototype=y.prototype,I.D=y.prototype,I.prototype=new E,I.prototype.constructor=I,I.C=function(T,A,R){for(var v=Array(arguments.length-2),kt=2;kt<arguments.length;kt++)v[kt-2]=arguments[kt];return y.prototype[A].apply(T,v)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(I,y,E){E||(E=0);var T=Array(16);if(typeof y=="string")for(var A=0;16>A;++A)T[A]=y.charCodeAt(E++)|y.charCodeAt(E++)<<8|y.charCodeAt(E++)<<16|y.charCodeAt(E++)<<24;else for(A=0;16>A;++A)T[A]=y[E++]|y[E++]<<8|y[E++]<<16|y[E++]<<24;y=I.g[0],E=I.g[1],A=I.g[2];var R=I.g[3],v=y+(R^E&(A^R))+T[0]+3614090360&4294967295;y=E+(v<<7&4294967295|v>>>25),v=R+(A^y&(E^A))+T[1]+3905402710&4294967295,R=y+(v<<12&4294967295|v>>>20),v=A+(E^R&(y^E))+T[2]+606105819&4294967295,A=R+(v<<17&4294967295|v>>>15),v=E+(y^A&(R^y))+T[3]+3250441966&4294967295,E=A+(v<<22&4294967295|v>>>10),v=y+(R^E&(A^R))+T[4]+4118548399&4294967295,y=E+(v<<7&4294967295|v>>>25),v=R+(A^y&(E^A))+T[5]+1200080426&4294967295,R=y+(v<<12&4294967295|v>>>20),v=A+(E^R&(y^E))+T[6]+2821735955&4294967295,A=R+(v<<17&4294967295|v>>>15),v=E+(y^A&(R^y))+T[7]+4249261313&4294967295,E=A+(v<<22&4294967295|v>>>10),v=y+(R^E&(A^R))+T[8]+1770035416&4294967295,y=E+(v<<7&4294967295|v>>>25),v=R+(A^y&(E^A))+T[9]+2336552879&4294967295,R=y+(v<<12&4294967295|v>>>20),v=A+(E^R&(y^E))+T[10]+4294925233&4294967295,A=R+(v<<17&4294967295|v>>>15),v=E+(y^A&(R^y))+T[11]+2304563134&4294967295,E=A+(v<<22&4294967295|v>>>10),v=y+(R^E&(A^R))+T[12]+1804603682&4294967295,y=E+(v<<7&4294967295|v>>>25),v=R+(A^y&(E^A))+T[13]+4254626195&4294967295,R=y+(v<<12&4294967295|v>>>20),v=A+(E^R&(y^E))+T[14]+2792965006&4294967295,A=R+(v<<17&4294967295|v>>>15),v=E+(y^A&(R^y))+T[15]+1236535329&4294967295,E=A+(v<<22&4294967295|v>>>10),v=y+(A^R&(E^A))+T[1]+4129170786&4294967295,y=E+(v<<5&4294967295|v>>>27),v=R+(E^A&(y^E))+T[6]+3225465664&4294967295,R=y+(v<<9&4294967295|v>>>23),v=A+(y^E&(R^y))+T[11]+643717713&4294967295,A=R+(v<<14&4294967295|v>>>18),v=E+(R^y&(A^R))+T[0]+3921069994&4294967295,E=A+(v<<20&4294967295|v>>>12),v=y+(A^R&(E^A))+T[5]+3593408605&4294967295,y=E+(v<<5&4294967295|v>>>27),v=R+(E^A&(y^E))+T[10]+38016083&4294967295,R=y+(v<<9&4294967295|v>>>23),v=A+(y^E&(R^y))+T[15]+3634488961&4294967295,A=R+(v<<14&4294967295|v>>>18),v=E+(R^y&(A^R))+T[4]+3889429448&4294967295,E=A+(v<<20&4294967295|v>>>12),v=y+(A^R&(E^A))+T[9]+568446438&4294967295,y=E+(v<<5&4294967295|v>>>27),v=R+(E^A&(y^E))+T[14]+3275163606&4294967295,R=y+(v<<9&4294967295|v>>>23),v=A+(y^E&(R^y))+T[3]+4107603335&4294967295,A=R+(v<<14&4294967295|v>>>18),v=E+(R^y&(A^R))+T[8]+1163531501&4294967295,E=A+(v<<20&4294967295|v>>>12),v=y+(A^R&(E^A))+T[13]+2850285829&4294967295,y=E+(v<<5&4294967295|v>>>27),v=R+(E^A&(y^E))+T[2]+4243563512&4294967295,R=y+(v<<9&4294967295|v>>>23),v=A+(y^E&(R^y))+T[7]+1735328473&4294967295,A=R+(v<<14&4294967295|v>>>18),v=E+(R^y&(A^R))+T[12]+2368359562&4294967295,E=A+(v<<20&4294967295|v>>>12),v=y+(E^A^R)+T[5]+4294588738&4294967295,y=E+(v<<4&4294967295|v>>>28),v=R+(y^E^A)+T[8]+2272392833&4294967295,R=y+(v<<11&4294967295|v>>>21),v=A+(R^y^E)+T[11]+1839030562&4294967295,A=R+(v<<16&4294967295|v>>>16),v=E+(A^R^y)+T[14]+4259657740&4294967295,E=A+(v<<23&4294967295|v>>>9),v=y+(E^A^R)+T[1]+2763975236&4294967295,y=E+(v<<4&4294967295|v>>>28),v=R+(y^E^A)+T[4]+1272893353&4294967295,R=y+(v<<11&4294967295|v>>>21),v=A+(R^y^E)+T[7]+4139469664&4294967295,A=R+(v<<16&4294967295|v>>>16),v=E+(A^R^y)+T[10]+3200236656&4294967295,E=A+(v<<23&4294967295|v>>>9),v=y+(E^A^R)+T[13]+681279174&4294967295,y=E+(v<<4&4294967295|v>>>28),v=R+(y^E^A)+T[0]+3936430074&4294967295,R=y+(v<<11&4294967295|v>>>21),v=A+(R^y^E)+T[3]+3572445317&4294967295,A=R+(v<<16&4294967295|v>>>16),v=E+(A^R^y)+T[6]+76029189&4294967295,E=A+(v<<23&4294967295|v>>>9),v=y+(E^A^R)+T[9]+3654602809&4294967295,y=E+(v<<4&4294967295|v>>>28),v=R+(y^E^A)+T[12]+3873151461&4294967295,R=y+(v<<11&4294967295|v>>>21),v=A+(R^y^E)+T[15]+530742520&4294967295,A=R+(v<<16&4294967295|v>>>16),v=E+(A^R^y)+T[2]+3299628645&4294967295,E=A+(v<<23&4294967295|v>>>9),v=y+(A^(E|~R))+T[0]+4096336452&4294967295,y=E+(v<<6&4294967295|v>>>26),v=R+(E^(y|~A))+T[7]+1126891415&4294967295,R=y+(v<<10&4294967295|v>>>22),v=A+(y^(R|~E))+T[14]+2878612391&4294967295,A=R+(v<<15&4294967295|v>>>17),v=E+(R^(A|~y))+T[5]+4237533241&4294967295,E=A+(v<<21&4294967295|v>>>11),v=y+(A^(E|~R))+T[12]+1700485571&4294967295,y=E+(v<<6&4294967295|v>>>26),v=R+(E^(y|~A))+T[3]+2399980690&4294967295,R=y+(v<<10&4294967295|v>>>22),v=A+(y^(R|~E))+T[10]+4293915773&4294967295,A=R+(v<<15&4294967295|v>>>17),v=E+(R^(A|~y))+T[1]+2240044497&4294967295,E=A+(v<<21&4294967295|v>>>11),v=y+(A^(E|~R))+T[8]+1873313359&4294967295,y=E+(v<<6&4294967295|v>>>26),v=R+(E^(y|~A))+T[15]+4264355552&4294967295,R=y+(v<<10&4294967295|v>>>22),v=A+(y^(R|~E))+T[6]+2734768916&4294967295,A=R+(v<<15&4294967295|v>>>17),v=E+(R^(A|~y))+T[13]+1309151649&4294967295,E=A+(v<<21&4294967295|v>>>11),v=y+(A^(E|~R))+T[4]+4149444226&4294967295,y=E+(v<<6&4294967295|v>>>26),v=R+(E^(y|~A))+T[11]+3174756917&4294967295,R=y+(v<<10&4294967295|v>>>22),v=A+(y^(R|~E))+T[2]+718787259&4294967295,A=R+(v<<15&4294967295|v>>>17),v=E+(R^(A|~y))+T[9]+3951481745&4294967295,I.g[0]=I.g[0]+y&4294967295,I.g[1]=I.g[1]+(A+(v<<21&4294967295|v>>>11))&4294967295,I.g[2]=I.g[2]+A&4294967295,I.g[3]=I.g[3]+R&4294967295}r.prototype.u=function(I,y){y===void 0&&(y=I.length);for(var E=y-this.blockSize,T=this.B,A=this.h,R=0;R<y;){if(A==0)for(;R<=E;)s(this,I,R),R+=this.blockSize;if(typeof I=="string"){for(;R<y;)if(T[A++]=I.charCodeAt(R++),A==this.blockSize){s(this,T),A=0;break}}else for(;R<y;)if(T[A++]=I[R++],A==this.blockSize){s(this,T),A=0;break}}this.h=A,this.o+=y},r.prototype.v=function(){var I=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);I[0]=128;for(var y=1;y<I.length-8;++y)I[y]=0;var E=8*this.o;for(y=I.length-8;y<I.length;++y)I[y]=E&255,E/=256;for(this.u(I),I=Array(16),y=E=0;4>y;++y)for(var T=0;32>T;T+=8)I[E++]=this.g[y]>>>T&255;return I};function i(I,y){var E=a;return Object.prototype.hasOwnProperty.call(E,I)?E[I]:E[I]=y(I)}function o(I,y){this.h=y;for(var E=[],T=!0,A=I.length-1;0<=A;A--){var R=I[A]|0;T&&R==y||(E[A]=R,T=!1)}this.g=E}var a={};function l(I){return-128<=I&&128>I?i(I,function(y){return new o([y|0],0>y?-1:0)}):new o([I|0],0>I?-1:0)}function u(I){if(isNaN(I)||!isFinite(I))return f;if(0>I)return P(u(-I));for(var y=[],E=1,T=0;I>=E;T++)y[T]=I/E|0,E*=4294967296;return new o(y,0)}function d(I,y){if(I.length==0)throw Error("number format error: empty string");if(y=y||10,2>y||36<y)throw Error("radix out of range: "+y);if(I.charAt(0)=="-")return P(d(I.substring(1),y));if(0<=I.indexOf("-"))throw Error('number format error: interior "-" character');for(var E=u(Math.pow(y,8)),T=f,A=0;A<I.length;A+=8){var R=Math.min(8,I.length-A),v=parseInt(I.substring(A,A+R),y);8>R?(R=u(Math.pow(y,R)),T=T.j(R).add(u(v))):(T=T.j(E),T=T.add(u(v)))}return T}var f=l(0),_=l(1),g=l(16777216);n=o.prototype,n.m=function(){if(D(this))return-P(this).m();for(var I=0,y=1,E=0;E<this.g.length;E++){var T=this.i(E);I+=(0<=T?T:4294967296+T)*y,y*=4294967296}return I},n.toString=function(I){if(I=I||10,2>I||36<I)throw Error("radix out of range: "+I);if(w(this))return"0";if(D(this))return"-"+P(this).toString(I);for(var y=u(Math.pow(I,6)),E=this,T="";;){var A=j(E,y).g;E=B(E,A.j(y));var R=((0<E.g.length?E.g[0]:E.h)>>>0).toString(I);if(E=A,w(E))return R+T;for(;6>R.length;)R="0"+R;T=R+T}},n.i=function(I){return 0>I?0:I<this.g.length?this.g[I]:this.h};function w(I){if(I.h!=0)return!1;for(var y=0;y<I.g.length;y++)if(I.g[y]!=0)return!1;return!0}function D(I){return I.h==-1}n.l=function(I){return I=B(this,I),D(I)?-1:w(I)?0:1};function P(I){for(var y=I.g.length,E=[],T=0;T<y;T++)E[T]=~I.g[T];return new o(E,~I.h).add(_)}n.abs=function(){return D(this)?P(this):this},n.add=function(I){for(var y=Math.max(this.g.length,I.g.length),E=[],T=0,A=0;A<=y;A++){var R=T+(this.i(A)&65535)+(I.i(A)&65535),v=(R>>>16)+(this.i(A)>>>16)+(I.i(A)>>>16);T=v>>>16,R&=65535,v&=65535,E[A]=v<<16|R}return new o(E,E[E.length-1]&-2147483648?-1:0)};function B(I,y){return I.add(P(y))}n.j=function(I){if(w(this)||w(I))return f;if(D(this))return D(I)?P(this).j(P(I)):P(P(this).j(I));if(D(I))return P(this.j(P(I)));if(0>this.l(g)&&0>I.l(g))return u(this.m()*I.m());for(var y=this.g.length+I.g.length,E=[],T=0;T<2*y;T++)E[T]=0;for(T=0;T<this.g.length;T++)for(var A=0;A<I.g.length;A++){var R=this.i(T)>>>16,v=this.i(T)&65535,kt=I.i(A)>>>16,Cs=I.i(A)&65535;E[2*T+2*A]+=v*Cs,$(E,2*T+2*A),E[2*T+2*A+1]+=R*Cs,$(E,2*T+2*A+1),E[2*T+2*A+1]+=v*kt,$(E,2*T+2*A+1),E[2*T+2*A+2]+=R*kt,$(E,2*T+2*A+2)}for(T=0;T<y;T++)E[T]=E[2*T+1]<<16|E[2*T];for(T=y;T<2*y;T++)E[T]=0;return new o(E,0)};function $(I,y){for(;(I[y]&65535)!=I[y];)I[y+1]+=I[y]>>>16,I[y]&=65535,y++}function L(I,y){this.g=I,this.h=y}function j(I,y){if(w(y))throw Error("division by zero");if(w(I))return new L(f,f);if(D(I))return y=j(P(I),y),new L(P(y.g),P(y.h));if(D(y))return y=j(I,P(y)),new L(P(y.g),y.h);if(30<I.g.length){if(D(I)||D(y))throw Error("slowDivide_ only works with positive integers.");for(var E=_,T=y;0>=T.l(I);)E=Z(E),T=Z(T);var A=z(E,1),R=z(T,1);for(T=z(T,2),E=z(E,2);!w(T);){var v=R.add(T);0>=v.l(I)&&(A=A.add(E),R=v),T=z(T,1),E=z(E,1)}return y=B(I,A.j(y)),new L(A,y)}for(A=f;0<=I.l(y);){for(E=Math.max(1,Math.floor(I.m()/y.m())),T=Math.ceil(Math.log(E)/Math.LN2),T=48>=T?1:Math.pow(2,T-48),R=u(E),v=R.j(y);D(v)||0<v.l(I);)E-=T,R=u(E),v=R.j(y);w(R)&&(R=_),A=A.add(R),I=B(I,v)}return new L(A,I)}n.A=function(I){return j(this,I).h},n.and=function(I){for(var y=Math.max(this.g.length,I.g.length),E=[],T=0;T<y;T++)E[T]=this.i(T)&I.i(T);return new o(E,this.h&I.h)},n.or=function(I){for(var y=Math.max(this.g.length,I.g.length),E=[],T=0;T<y;T++)E[T]=this.i(T)|I.i(T);return new o(E,this.h|I.h)},n.xor=function(I){for(var y=Math.max(this.g.length,I.g.length),E=[],T=0;T<y;T++)E[T]=this.i(T)^I.i(T);return new o(E,this.h^I.h)};function Z(I){for(var y=I.g.length+1,E=[],T=0;T<y;T++)E[T]=I.i(T)<<1|I.i(T-1)>>>31;return new o(E,I.h)}function z(I,y){var E=y>>5;y%=32;for(var T=I.g.length-E,A=[],R=0;R<T;R++)A[R]=0<y?I.i(R+E)>>>y|I.i(R+E+1)<<32-y:I.i(R+E);return new o(A,I.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,dg=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=u,o.fromString=d,zn=o}).apply(typeof op<"u"?op:typeof self<"u"?self:typeof window<"u"?window:{});var Oo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var fg,ri,pg,Ko,kl,_g,mg,gg;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(c,h,p){return c==Array.prototype||c==Object.prototype||(c[h]=p.value),c};function t(c){c=[typeof globalThis=="object"&&globalThis,c,typeof window=="object"&&window,typeof self=="object"&&self,typeof Oo=="object"&&Oo];for(var h=0;h<c.length;++h){var p=c[h];if(p&&p.Math==Math)return p}throw Error("Cannot find global object")}var r=t(this);function s(c,h){if(h)e:{var p=r;c=c.split(".");for(var m=0;m<c.length-1;m++){var b=c[m];if(!(b in p))break e;p=p[b]}c=c[c.length-1],m=p[c],h=h(m),h!=m&&h!=null&&e(p,c,{configurable:!0,writable:!0,value:h})}}function i(c,h){c instanceof String&&(c+="");var p=0,m=!1,b={next:function(){if(!m&&p<c.length){var C=p++;return{value:h(C,c[C]),done:!1}}return m=!0,{done:!0,value:void 0}}};return b[Symbol.iterator]=function(){return b},b}s("Array.prototype.values",function(c){return c||function(){return i(this,function(h,p){return p})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},a=this||self;function l(c){var h=typeof c;return h=h!="object"?h:c?Array.isArray(c)?"array":h:"null",h=="array"||h=="object"&&typeof c.length=="number"}function u(c){var h=typeof c;return h=="object"&&c!=null||h=="function"}function d(c,h,p){return c.call.apply(c.bind,arguments)}function f(c,h,p){if(!c)throw Error();if(2<arguments.length){var m=Array.prototype.slice.call(arguments,2);return function(){var b=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(b,m),c.apply(h,b)}}return function(){return c.apply(h,arguments)}}function _(c,h,p){return _=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?d:f,_.apply(null,arguments)}function g(c,h){var p=Array.prototype.slice.call(arguments,1);return function(){var m=p.slice();return m.push.apply(m,arguments),c.apply(this,m)}}function w(c,h){function p(){}p.prototype=h.prototype,c.aa=h.prototype,c.prototype=new p,c.prototype.constructor=c,c.Qb=function(m,b,C){for(var V=Array(arguments.length-2),le=2;le<arguments.length;le++)V[le-2]=arguments[le];return h.prototype[b].apply(m,V)}}function D(c){const h=c.length;if(0<h){const p=Array(h);for(let m=0;m<h;m++)p[m]=c[m];return p}return[]}function P(c,h){for(let p=1;p<arguments.length;p++){const m=arguments[p];if(l(m)){const b=c.length||0,C=m.length||0;c.length=b+C;for(let V=0;V<C;V++)c[b+V]=m[V]}else c.push(m)}}class B{constructor(h,p){this.i=h,this.j=p,this.h=0,this.g=null}get(){let h;return 0<this.h?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function $(c){return/^[\s\xa0]*$/.test(c)}function L(){var c=a.navigator;return c&&(c=c.userAgent)?c:""}function j(c){return j[" "](c),c}j[" "]=function(){};var Z=L().indexOf("Gecko")!=-1&&!(L().toLowerCase().indexOf("webkit")!=-1&&L().indexOf("Edge")==-1)&&!(L().indexOf("Trident")!=-1||L().indexOf("MSIE")!=-1)&&L().indexOf("Edge")==-1;function z(c,h,p){for(const m in c)h.call(p,c[m],m,c)}function I(c,h){for(const p in c)h.call(void 0,c[p],p,c)}function y(c){const h={};for(const p in c)h[p]=c[p];return h}const E="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function T(c,h){let p,m;for(let b=1;b<arguments.length;b++){m=arguments[b];for(p in m)c[p]=m[p];for(let C=0;C<E.length;C++)p=E[C],Object.prototype.hasOwnProperty.call(m,p)&&(c[p]=m[p])}}function A(c){var h=1;c=c.split(":");const p=[];for(;0<h&&c.length;)p.push(c.shift()),h--;return c.length&&p.push(c.join(":")),p}function R(c){a.setTimeout(()=>{throw c},0)}function v(){var c=Pc;let h=null;return c.g&&(h=c.g,c.g=c.g.next,c.g||(c.h=null),h.next=null),h}class kt{constructor(){this.h=this.g=null}add(h,p){const m=Cs.get();m.set(h,p),this.h?this.h.next=m:this.g=m,this.h=m}}var Cs=new B(()=>new hI,c=>c.reset());class hI{constructor(){this.next=this.g=this.h=null}set(h,p){this.h=h,this.g=p,this.next=null}reset(){this.next=this.g=this.h=null}}let Ps,Ns=!1,Pc=new kt,Nd=()=>{const c=a.Promise.resolve(void 0);Ps=()=>{c.then(dI)}};var dI=()=>{for(var c;c=v();){try{c.h.call(c.g)}catch(p){R(p)}var h=Cs;h.j(c),100>h.h&&(h.h++,c.next=h.g,h.g=c)}Ns=!1};function Xt(){this.s=this.s,this.C=this.C}Xt.prototype.s=!1,Xt.prototype.ma=function(){this.s||(this.s=!0,this.N())},Xt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function qe(c,h){this.type=c,this.g=this.target=h,this.defaultPrevented=!1}qe.prototype.h=function(){this.defaultPrevented=!0};var fI=function(){if(!a.addEventListener||!Object.defineProperty)return!1;var c=!1,h=Object.defineProperty({},"passive",{get:function(){c=!0}});try{const p=()=>{};a.addEventListener("test",p,h),a.removeEventListener("test",p,h)}catch{}return c}();function Ds(c,h){if(qe.call(this,c?c.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,c){var p=this.type=c.type,m=c.changedTouches&&c.changedTouches.length?c.changedTouches[0]:null;if(this.target=c.target||c.srcElement,this.g=h,h=c.relatedTarget){if(Z){e:{try{j(h.nodeName);var b=!0;break e}catch{}b=!1}b||(h=null)}}else p=="mouseover"?h=c.fromElement:p=="mouseout"&&(h=c.toElement);this.relatedTarget=h,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0),this.button=c.button,this.key=c.key||"",this.ctrlKey=c.ctrlKey,this.altKey=c.altKey,this.shiftKey=c.shiftKey,this.metaKey=c.metaKey,this.pointerId=c.pointerId||0,this.pointerType=typeof c.pointerType=="string"?c.pointerType:pI[c.pointerType]||"",this.state=c.state,this.i=c,c.defaultPrevented&&Ds.aa.h.call(this)}}w(Ds,qe);var pI={2:"touch",3:"pen",4:"mouse"};Ds.prototype.h=function(){Ds.aa.h.call(this);var c=this.i;c.preventDefault?c.preventDefault():c.returnValue=!1};var po="closure_listenable_"+(1e6*Math.random()|0),_I=0;function mI(c,h,p,m,b){this.listener=c,this.proxy=null,this.src=h,this.type=p,this.capture=!!m,this.ha=b,this.key=++_I,this.da=this.fa=!1}function _o(c){c.da=!0,c.listener=null,c.proxy=null,c.src=null,c.ha=null}function mo(c){this.src=c,this.g={},this.h=0}mo.prototype.add=function(c,h,p,m,b){var C=c.toString();c=this.g[C],c||(c=this.g[C]=[],this.h++);var V=Dc(c,h,m,b);return-1<V?(h=c[V],p||(h.fa=!1)):(h=new mI(h,this.src,C,!!m,b),h.fa=p,c.push(h)),h};function Nc(c,h){var p=h.type;if(p in c.g){var m=c.g[p],b=Array.prototype.indexOf.call(m,h,void 0),C;(C=0<=b)&&Array.prototype.splice.call(m,b,1),C&&(_o(h),c.g[p].length==0&&(delete c.g[p],c.h--))}}function Dc(c,h,p,m){for(var b=0;b<c.length;++b){var C=c[b];if(!C.da&&C.listener==h&&C.capture==!!p&&C.ha==m)return b}return-1}var kc="closure_lm_"+(1e6*Math.random()|0),xc={};function Dd(c,h,p,m,b){if(Array.isArray(h)){for(var C=0;C<h.length;C++)Dd(c,h[C],p,m,b);return null}return p=Od(p),c&&c[po]?c.K(h,p,u(m)?!!m.capture:!1,b):gI(c,h,p,!1,m,b)}function gI(c,h,p,m,b,C){if(!h)throw Error("Invalid event type");var V=u(b)?!!b.capture:!!b,le=Vc(c);if(le||(c[kc]=le=new mo(c)),p=le.add(h,p,m,V,C),p.proxy)return p;if(m=yI(),p.proxy=m,m.src=c,m.listener=p,c.addEventListener)fI||(b=V),b===void 0&&(b=!1),c.addEventListener(h.toString(),m,b);else if(c.attachEvent)c.attachEvent(xd(h.toString()),m);else if(c.addListener&&c.removeListener)c.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return p}function yI(){function c(p){return h.call(c.src,c.listener,p)}const h=EI;return c}function kd(c,h,p,m,b){if(Array.isArray(h))for(var C=0;C<h.length;C++)kd(c,h[C],p,m,b);else m=u(m)?!!m.capture:!!m,p=Od(p),c&&c[po]?(c=c.i,h=String(h).toString(),h in c.g&&(C=c.g[h],p=Dc(C,p,m,b),-1<p&&(_o(C[p]),Array.prototype.splice.call(C,p,1),C.length==0&&(delete c.g[h],c.h--)))):c&&(c=Vc(c))&&(h=c.g[h.toString()],c=-1,h&&(c=Dc(h,p,m,b)),(p=-1<c?h[c]:null)&&Oc(p))}function Oc(c){if(typeof c!="number"&&c&&!c.da){var h=c.src;if(h&&h[po])Nc(h.i,c);else{var p=c.type,m=c.proxy;h.removeEventListener?h.removeEventListener(p,m,c.capture):h.detachEvent?h.detachEvent(xd(p),m):h.addListener&&h.removeListener&&h.removeListener(m),(p=Vc(h))?(Nc(p,c),p.h==0&&(p.src=null,h[kc]=null)):_o(c)}}}function xd(c){return c in xc?xc[c]:xc[c]="on"+c}function EI(c,h){if(c.da)c=!0;else{h=new Ds(h,this);var p=c.listener,m=c.ha||c.src;c.fa&&Oc(c),c=p.call(m,h)}return c}function Vc(c){return c=c[kc],c instanceof mo?c:null}var Mc="__closure_events_fn_"+(1e9*Math.random()>>>0);function Od(c){return typeof c=="function"?c:(c[Mc]||(c[Mc]=function(h){return c.handleEvent(h)}),c[Mc])}function je(){Xt.call(this),this.i=new mo(this),this.M=this,this.F=null}w(je,Xt),je.prototype[po]=!0,je.prototype.removeEventListener=function(c,h,p,m){kd(this,c,h,p,m)};function Qe(c,h){var p,m=c.F;if(m)for(p=[];m;m=m.F)p.push(m);if(c=c.M,m=h.type||h,typeof h=="string")h=new qe(h,c);else if(h instanceof qe)h.target=h.target||c;else{var b=h;h=new qe(m,c),T(h,b)}if(b=!0,p)for(var C=p.length-1;0<=C;C--){var V=h.g=p[C];b=go(V,m,!0,h)&&b}if(V=h.g=c,b=go(V,m,!0,h)&&b,b=go(V,m,!1,h)&&b,p)for(C=0;C<p.length;C++)V=h.g=p[C],b=go(V,m,!1,h)&&b}je.prototype.N=function(){if(je.aa.N.call(this),this.i){var c=this.i,h;for(h in c.g){for(var p=c.g[h],m=0;m<p.length;m++)_o(p[m]);delete c.g[h],c.h--}}this.F=null},je.prototype.K=function(c,h,p,m){return this.i.add(String(c),h,!1,p,m)},je.prototype.L=function(c,h,p,m){return this.i.add(String(c),h,!0,p,m)};function go(c,h,p,m){if(h=c.i.g[String(h)],!h)return!0;h=h.concat();for(var b=!0,C=0;C<h.length;++C){var V=h[C];if(V&&!V.da&&V.capture==p){var le=V.listener,Fe=V.ha||V.src;V.fa&&Nc(c.i,V),b=le.call(Fe,m)!==!1&&b}}return b&&!m.defaultPrevented}function Vd(c,h,p){if(typeof c=="function")p&&(c=_(c,p));else if(c&&typeof c.handleEvent=="function")c=_(c.handleEvent,c);else throw Error("Invalid listener argument");return 2147483647<Number(h)?-1:a.setTimeout(c,h||0)}function Md(c){c.g=Vd(()=>{c.g=null,c.i&&(c.i=!1,Md(c))},c.l);const h=c.h;c.h=null,c.m.apply(null,h)}class vI extends Xt{constructor(h,p){super(),this.m=h,this.l=p,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:Md(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ks(c){Xt.call(this),this.h=c,this.g={}}w(ks,Xt);var Ld=[];function Fd(c){z(c.g,function(h,p){this.g.hasOwnProperty(p)&&Oc(h)},c),c.g={}}ks.prototype.N=function(){ks.aa.N.call(this),Fd(this)},ks.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Lc=a.JSON.stringify,II=a.JSON.parse,TI=class{stringify(c){return a.JSON.stringify(c,void 0)}parse(c){return a.JSON.parse(c,void 0)}};function Fc(){}Fc.prototype.h=null;function Ud(c){return c.h||(c.h=c.i())}function Bd(){}var xs={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Uc(){qe.call(this,"d")}w(Uc,qe);function Bc(){qe.call(this,"c")}w(Bc,qe);var xn={},$d=null;function yo(){return $d=$d||new je}xn.La="serverreachability";function qd(c){qe.call(this,xn.La,c)}w(qd,qe);function Os(c){const h=yo();Qe(h,new qd(h))}xn.STAT_EVENT="statevent";function jd(c,h){qe.call(this,xn.STAT_EVENT,c),this.stat=h}w(jd,qe);function Ye(c){const h=yo();Qe(h,new jd(h,c))}xn.Ma="timingevent";function Wd(c,h){qe.call(this,xn.Ma,c),this.size=h}w(Wd,qe);function Vs(c,h){if(typeof c!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){c()},h)}function Ms(){this.g=!0}Ms.prototype.xa=function(){this.g=!1};function wI(c,h,p,m,b,C){c.info(function(){if(c.g)if(C)for(var V="",le=C.split("&"),Fe=0;Fe<le.length;Fe++){var re=le[Fe].split("=");if(1<re.length){var We=re[0];re=re[1];var Ge=We.split("_");V=2<=Ge.length&&Ge[1]=="type"?V+(We+"="+re+"&"):V+(We+"=redacted&")}}else V=null;else V=C;return"XMLHTTP REQ ("+m+") [attempt "+b+"]: "+h+`
`+p+`
`+V})}function AI(c,h,p,m,b,C,V){c.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+b+"]: "+h+`
`+p+`
`+C+" "+V})}function Sr(c,h,p,m){c.info(function(){return"XMLHTTP TEXT ("+h+"): "+SI(c,p)+(m?" "+m:"")})}function bI(c,h){c.info(function(){return"TIMEOUT: "+h})}Ms.prototype.info=function(){};function SI(c,h){if(!c.g)return h;if(!h)return null;try{var p=JSON.parse(h);if(p){for(c=0;c<p.length;c++)if(Array.isArray(p[c])){var m=p[c];if(!(2>m.length)){var b=m[1];if(Array.isArray(b)&&!(1>b.length)){var C=b[0];if(C!="noop"&&C!="stop"&&C!="close")for(var V=1;V<b.length;V++)b[V]=""}}}}return Lc(p)}catch{return h}}var Eo={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Gd={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},$c;function vo(){}w(vo,Fc),vo.prototype.g=function(){return new XMLHttpRequest},vo.prototype.i=function(){return{}},$c=new vo;function Zt(c,h,p,m){this.j=c,this.i=h,this.l=p,this.R=m||1,this.U=new ks(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Hd}function Hd(){this.i=null,this.g="",this.h=!1}var zd={},qc={};function jc(c,h,p){c.L=1,c.v=Ao(xt(h)),c.m=p,c.P=!0,Kd(c,null)}function Kd(c,h){c.F=Date.now(),Io(c),c.A=xt(c.v);var p=c.A,m=c.R;Array.isArray(m)||(m=[String(m)]),lf(p.i,"t",m),c.C=0,p=c.j.J,c.h=new Hd,c.g=Rf(c.j,p?h:null,!c.m),0<c.O&&(c.M=new vI(_(c.Y,c,c.g),c.O)),h=c.U,p=c.g,m=c.ca;var b="readystatechange";Array.isArray(b)||(b&&(Ld[0]=b.toString()),b=Ld);for(var C=0;C<b.length;C++){var V=Dd(p,b[C],m||h.handleEvent,!1,h.h||h);if(!V)break;h.g[V.key]=V}h=c.H?y(c.H):{},c.m?(c.u||(c.u="POST"),h["Content-Type"]="application/x-www-form-urlencoded",c.g.ea(c.A,c.u,c.m,h)):(c.u="GET",c.g.ea(c.A,c.u,null,h)),Os(),wI(c.i,c.u,c.A,c.l,c.R,c.m)}Zt.prototype.ca=function(c){c=c.target;const h=this.M;h&&Ot(c)==3?h.j():this.Y(c)},Zt.prototype.Y=function(c){try{if(c==this.g)e:{const Ge=Ot(this.g);var h=this.g.Ba();const Pr=this.g.Z();if(!(3>Ge)&&(Ge!=3||this.g&&(this.h.h||this.g.oa()||mf(this.g)))){this.J||Ge!=4||h==7||(h==8||0>=Pr?Os(3):Os(2)),Wc(this);var p=this.g.Z();this.X=p;t:if(Qd(this)){var m=mf(this.g);c="";var b=m.length,C=Ot(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){On(this),Ls(this);var V="";break t}this.h.i=new a.TextDecoder}for(h=0;h<b;h++)this.h.h=!0,c+=this.h.i.decode(m[h],{stream:!(C&&h==b-1)});m.length=0,this.h.g+=c,this.C=0,V=this.h.g}else V=this.g.oa();if(this.o=p==200,AI(this.i,this.u,this.A,this.l,this.R,Ge,p),this.o){if(this.T&&!this.K){t:{if(this.g){var le,Fe=this.g;if((le=Fe.g?Fe.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!$(le)){var re=le;break t}}re=null}if(p=re)Sr(this.i,this.l,p,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Gc(this,p);else{this.o=!1,this.s=3,Ye(12),On(this),Ls(this);break e}}if(this.P){p=!0;let _t;for(;!this.J&&this.C<V.length;)if(_t=RI(this,V),_t==qc){Ge==4&&(this.s=4,Ye(14),p=!1),Sr(this.i,this.l,null,"[Incomplete Response]");break}else if(_t==zd){this.s=4,Ye(15),Sr(this.i,this.l,V,"[Invalid Chunk]"),p=!1;break}else Sr(this.i,this.l,_t,null),Gc(this,_t);if(Qd(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Ge!=4||V.length!=0||this.h.h||(this.s=1,Ye(16),p=!1),this.o=this.o&&p,!p)Sr(this.i,this.l,V,"[Invalid Chunked Response]"),On(this),Ls(this);else if(0<V.length&&!this.W){this.W=!0;var We=this.j;We.g==this&&We.ba&&!We.M&&(We.j.info("Great, no buffering proxy detected. Bytes received: "+V.length),Jc(We),We.M=!0,Ye(11))}}else Sr(this.i,this.l,V,null),Gc(this,V);Ge==4&&On(this),this.o&&!this.J&&(Ge==4?wf(this.j,this):(this.o=!1,Io(this)))}else WI(this.g),p==400&&0<V.indexOf("Unknown SID")?(this.s=3,Ye(12)):(this.s=0,Ye(13)),On(this),Ls(this)}}}catch{}finally{}};function Qd(c){return c.g?c.u=="GET"&&c.L!=2&&c.j.Ca:!1}function RI(c,h){var p=c.C,m=h.indexOf(`
`,p);return m==-1?qc:(p=Number(h.substring(p,m)),isNaN(p)?zd:(m+=1,m+p>h.length?qc:(h=h.slice(m,m+p),c.C=m+p,h)))}Zt.prototype.cancel=function(){this.J=!0,On(this)};function Io(c){c.S=Date.now()+c.I,Yd(c,c.I)}function Yd(c,h){if(c.B!=null)throw Error("WatchDog timer not null");c.B=Vs(_(c.ba,c),h)}function Wc(c){c.B&&(a.clearTimeout(c.B),c.B=null)}Zt.prototype.ba=function(){this.B=null;const c=Date.now();0<=c-this.S?(bI(this.i,this.A),this.L!=2&&(Os(),Ye(17)),On(this),this.s=2,Ls(this)):Yd(this,this.S-c)};function Ls(c){c.j.G==0||c.J||wf(c.j,c)}function On(c){Wc(c);var h=c.M;h&&typeof h.ma=="function"&&h.ma(),c.M=null,Fd(c.U),c.g&&(h=c.g,c.g=null,h.abort(),h.ma())}function Gc(c,h){try{var p=c.j;if(p.G!=0&&(p.g==c||Hc(p.h,c))){if(!c.K&&Hc(p.h,c)&&p.G==3){try{var m=p.Da.g.parse(h)}catch{m=null}if(Array.isArray(m)&&m.length==3){var b=m;if(b[0]==0){e:if(!p.u){if(p.g)if(p.g.F+3e3<c.F)No(p),Co(p);else break e;Yc(p),Ye(18)}}else p.za=b[1],0<p.za-p.T&&37500>b[2]&&p.F&&p.v==0&&!p.C&&(p.C=Vs(_(p.Za,p),6e3));if(1>=Zd(p.h)&&p.ca){try{p.ca()}catch{}p.ca=void 0}}else Mn(p,11)}else if((c.K||p.g==c)&&No(p),!$(h))for(b=p.Da.g.parse(h),h=0;h<b.length;h++){let re=b[h];if(p.T=re[0],re=re[1],p.G==2)if(re[0]=="c"){p.K=re[1],p.ia=re[2];const We=re[3];We!=null&&(p.la=We,p.j.info("VER="+p.la));const Ge=re[4];Ge!=null&&(p.Aa=Ge,p.j.info("SVER="+p.Aa));const Pr=re[5];Pr!=null&&typeof Pr=="number"&&0<Pr&&(m=1.5*Pr,p.L=m,p.j.info("backChannelRequestTimeoutMs_="+m)),m=p;const _t=c.g;if(_t){const ko=_t.g?_t.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(ko){var C=m.h;C.g||ko.indexOf("spdy")==-1&&ko.indexOf("quic")==-1&&ko.indexOf("h2")==-1||(C.j=C.l,C.g=new Set,C.h&&(zc(C,C.h),C.h=null))}if(m.D){const Xc=_t.g?_t.g.getResponseHeader("X-HTTP-Session-Id"):null;Xc&&(m.ya=Xc,fe(m.I,m.D,Xc))}}p.G=3,p.l&&p.l.ua(),p.ba&&(p.R=Date.now()-c.F,p.j.info("Handshake RTT: "+p.R+"ms")),m=p;var V=c;if(m.qa=Sf(m,m.J?m.ia:null,m.W),V.K){ef(m.h,V);var le=V,Fe=m.L;Fe&&(le.I=Fe),le.B&&(Wc(le),Io(le)),m.g=V}else If(m);0<p.i.length&&Po(p)}else re[0]!="stop"&&re[0]!="close"||Mn(p,7);else p.G==3&&(re[0]=="stop"||re[0]=="close"?re[0]=="stop"?Mn(p,7):Qc(p):re[0]!="noop"&&p.l&&p.l.ta(re),p.v=0)}}Os(4)}catch{}}var CI=class{constructor(c,h){this.g=c,this.map=h}};function Jd(c){this.l=c||10,a.PerformanceNavigationTiming?(c=a.performance.getEntriesByType("navigation"),c=0<c.length&&(c[0].nextHopProtocol=="hq"||c[0].nextHopProtocol=="h2")):c=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=c?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Xd(c){return c.h?!0:c.g?c.g.size>=c.j:!1}function Zd(c){return c.h?1:c.g?c.g.size:0}function Hc(c,h){return c.h?c.h==h:c.g?c.g.has(h):!1}function zc(c,h){c.g?c.g.add(h):c.h=h}function ef(c,h){c.h&&c.h==h?c.h=null:c.g&&c.g.has(h)&&c.g.delete(h)}Jd.prototype.cancel=function(){if(this.i=tf(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const c of this.g.values())c.cancel();this.g.clear()}};function tf(c){if(c.h!=null)return c.i.concat(c.h.D);if(c.g!=null&&c.g.size!==0){let h=c.i;for(const p of c.g.values())h=h.concat(p.D);return h}return D(c.i)}function PI(c){if(c.V&&typeof c.V=="function")return c.V();if(typeof Map<"u"&&c instanceof Map||typeof Set<"u"&&c instanceof Set)return Array.from(c.values());if(typeof c=="string")return c.split("");if(l(c)){for(var h=[],p=c.length,m=0;m<p;m++)h.push(c[m]);return h}h=[],p=0;for(m in c)h[p++]=c[m];return h}function NI(c){if(c.na&&typeof c.na=="function")return c.na();if(!c.V||typeof c.V!="function"){if(typeof Map<"u"&&c instanceof Map)return Array.from(c.keys());if(!(typeof Set<"u"&&c instanceof Set)){if(l(c)||typeof c=="string"){var h=[];c=c.length;for(var p=0;p<c;p++)h.push(p);return h}h=[],p=0;for(const m in c)h[p++]=m;return h}}}function nf(c,h){if(c.forEach&&typeof c.forEach=="function")c.forEach(h,void 0);else if(l(c)||typeof c=="string")Array.prototype.forEach.call(c,h,void 0);else for(var p=NI(c),m=PI(c),b=m.length,C=0;C<b;C++)h.call(void 0,m[C],p&&p[C],c)}var rf=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function DI(c,h){if(c){c=c.split("&");for(var p=0;p<c.length;p++){var m=c[p].indexOf("="),b=null;if(0<=m){var C=c[p].substring(0,m);b=c[p].substring(m+1)}else C=c[p];h(C,b?decodeURIComponent(b.replace(/\+/g," ")):"")}}}function Vn(c){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,c instanceof Vn){this.h=c.h,To(this,c.j),this.o=c.o,this.g=c.g,wo(this,c.s),this.l=c.l;var h=c.i,p=new Bs;p.i=h.i,h.g&&(p.g=new Map(h.g),p.h=h.h),sf(this,p),this.m=c.m}else c&&(h=String(c).match(rf))?(this.h=!1,To(this,h[1]||"",!0),this.o=Fs(h[2]||""),this.g=Fs(h[3]||"",!0),wo(this,h[4]),this.l=Fs(h[5]||"",!0),sf(this,h[6]||"",!0),this.m=Fs(h[7]||"")):(this.h=!1,this.i=new Bs(null,this.h))}Vn.prototype.toString=function(){var c=[],h=this.j;h&&c.push(Us(h,of,!0),":");var p=this.g;return(p||h=="file")&&(c.push("//"),(h=this.o)&&c.push(Us(h,of,!0),"@"),c.push(encodeURIComponent(String(p)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),p=this.s,p!=null&&c.push(":",String(p))),(p=this.l)&&(this.g&&p.charAt(0)!="/"&&c.push("/"),c.push(Us(p,p.charAt(0)=="/"?OI:xI,!0))),(p=this.i.toString())&&c.push("?",p),(p=this.m)&&c.push("#",Us(p,MI)),c.join("")};function xt(c){return new Vn(c)}function To(c,h,p){c.j=p?Fs(h,!0):h,c.j&&(c.j=c.j.replace(/:$/,""))}function wo(c,h){if(h){if(h=Number(h),isNaN(h)||0>h)throw Error("Bad port number "+h);c.s=h}else c.s=null}function sf(c,h,p){h instanceof Bs?(c.i=h,LI(c.i,c.h)):(p||(h=Us(h,VI)),c.i=new Bs(h,c.h))}function fe(c,h,p){c.i.set(h,p)}function Ao(c){return fe(c,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),c}function Fs(c,h){return c?h?decodeURI(c.replace(/%25/g,"%2525")):decodeURIComponent(c):""}function Us(c,h,p){return typeof c=="string"?(c=encodeURI(c).replace(h,kI),p&&(c=c.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c):null}function kI(c){return c=c.charCodeAt(0),"%"+(c>>4&15).toString(16)+(c&15).toString(16)}var of=/[#\/\?@]/g,xI=/[#\?:]/g,OI=/[#\?]/g,VI=/[#\?@]/g,MI=/#/g;function Bs(c,h){this.h=this.g=null,this.i=c||null,this.j=!!h}function en(c){c.g||(c.g=new Map,c.h=0,c.i&&DI(c.i,function(h,p){c.add(decodeURIComponent(h.replace(/\+/g," ")),p)}))}n=Bs.prototype,n.add=function(c,h){en(this),this.i=null,c=Rr(this,c);var p=this.g.get(c);return p||this.g.set(c,p=[]),p.push(h),this.h+=1,this};function af(c,h){en(c),h=Rr(c,h),c.g.has(h)&&(c.i=null,c.h-=c.g.get(h).length,c.g.delete(h))}function cf(c,h){return en(c),h=Rr(c,h),c.g.has(h)}n.forEach=function(c,h){en(this),this.g.forEach(function(p,m){p.forEach(function(b){c.call(h,b,m,this)},this)},this)},n.na=function(){en(this);const c=Array.from(this.g.values()),h=Array.from(this.g.keys()),p=[];for(let m=0;m<h.length;m++){const b=c[m];for(let C=0;C<b.length;C++)p.push(h[m])}return p},n.V=function(c){en(this);let h=[];if(typeof c=="string")cf(this,c)&&(h=h.concat(this.g.get(Rr(this,c))));else{c=Array.from(this.g.values());for(let p=0;p<c.length;p++)h=h.concat(c[p])}return h},n.set=function(c,h){return en(this),this.i=null,c=Rr(this,c),cf(this,c)&&(this.h-=this.g.get(c).length),this.g.set(c,[h]),this.h+=1,this},n.get=function(c,h){return c?(c=this.V(c),0<c.length?String(c[0]):h):h};function lf(c,h,p){af(c,h),0<p.length&&(c.i=null,c.g.set(Rr(c,h),D(p)),c.h+=p.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const c=[],h=Array.from(this.g.keys());for(var p=0;p<h.length;p++){var m=h[p];const C=encodeURIComponent(String(m)),V=this.V(m);for(m=0;m<V.length;m++){var b=C;V[m]!==""&&(b+="="+encodeURIComponent(String(V[m]))),c.push(b)}}return this.i=c.join("&")};function Rr(c,h){return h=String(h),c.j&&(h=h.toLowerCase()),h}function LI(c,h){h&&!c.j&&(en(c),c.i=null,c.g.forEach(function(p,m){var b=m.toLowerCase();m!=b&&(af(this,m),lf(this,b,p))},c)),c.j=h}function FI(c,h){const p=new Ms;if(a.Image){const m=new Image;m.onload=g(tn,p,"TestLoadImage: loaded",!0,h,m),m.onerror=g(tn,p,"TestLoadImage: error",!1,h,m),m.onabort=g(tn,p,"TestLoadImage: abort",!1,h,m),m.ontimeout=g(tn,p,"TestLoadImage: timeout",!1,h,m),a.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=c}else h(!1)}function UI(c,h){const p=new Ms,m=new AbortController,b=setTimeout(()=>{m.abort(),tn(p,"TestPingServer: timeout",!1,h)},1e4);fetch(c,{signal:m.signal}).then(C=>{clearTimeout(b),C.ok?tn(p,"TestPingServer: ok",!0,h):tn(p,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(b),tn(p,"TestPingServer: error",!1,h)})}function tn(c,h,p,m,b){try{b&&(b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null),m(p)}catch{}}function BI(){this.g=new TI}function $I(c,h,p){const m=p||"";try{nf(c,function(b,C){let V=b;u(b)&&(V=Lc(b)),h.push(m+C+"="+encodeURIComponent(V))})}catch(b){throw h.push(m+"type="+encodeURIComponent("_badmap")),b}}function bo(c){this.l=c.Ub||null,this.j=c.eb||!1}w(bo,Fc),bo.prototype.g=function(){return new So(this.l,this.j)},bo.prototype.i=function(c){return function(){return c}}({});function So(c,h){je.call(this),this.D=c,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}w(So,je),n=So.prototype,n.open=function(c,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=c,this.A=h,this.readyState=1,qs(this)},n.send=function(c){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const h={headers:this.u,method:this.B,credentials:this.m,cache:void 0};c&&(h.body=c),(this.D||a).fetch(new Request(this.A,h)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,$s(this)),this.readyState=0},n.Sa=function(c){if(this.g&&(this.l=c,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=c.headers,this.readyState=2,qs(this)),this.g&&(this.readyState=3,qs(this),this.g)))if(this.responseType==="arraybuffer")c.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream<"u"&&"body"in c){if(this.j=c.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;uf(this)}else c.text().then(this.Ra.bind(this),this.ga.bind(this))};function uf(c){c.j.read().then(c.Pa.bind(c)).catch(c.ga.bind(c))}n.Pa=function(c){if(this.g){if(this.o&&c.value)this.response.push(c.value);else if(!this.o){var h=c.value?c.value:new Uint8Array(0);(h=this.v.decode(h,{stream:!c.done}))&&(this.response=this.responseText+=h)}c.done?$s(this):qs(this),this.readyState==3&&uf(this)}},n.Ra=function(c){this.g&&(this.response=this.responseText=c,$s(this))},n.Qa=function(c){this.g&&(this.response=c,$s(this))},n.ga=function(){this.g&&$s(this)};function $s(c){c.readyState=4,c.l=null,c.j=null,c.v=null,qs(c)}n.setRequestHeader=function(c,h){this.u.append(c,h)},n.getResponseHeader=function(c){return this.h&&this.h.get(c.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const c=[],h=this.h.entries();for(var p=h.next();!p.done;)p=p.value,c.push(p[0]+": "+p[1]),p=h.next();return c.join(`\r
`)};function qs(c){c.onreadystatechange&&c.onreadystatechange.call(c)}Object.defineProperty(So.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(c){this.m=c?"include":"same-origin"}});function hf(c){let h="";return z(c,function(p,m){h+=m,h+=":",h+=p,h+=`\r
`}),h}function Kc(c,h,p){e:{for(m in p){var m=!1;break e}m=!0}m||(p=hf(p),typeof c=="string"?p!=null&&encodeURIComponent(String(p)):fe(c,h,p))}function we(c){je.call(this),this.headers=new Map,this.o=c||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}w(we,je);var qI=/^https?$/i,jI=["POST","PUT"];n=we.prototype,n.Ha=function(c){this.J=c},n.ea=function(c,h,p,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+c);h=h?h.toUpperCase():"GET",this.D=c,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():$c.g(),this.v=this.o?Ud(this.o):Ud($c),this.g.onreadystatechange=_(this.Ea,this);try{this.B=!0,this.g.open(h,String(c),!0),this.B=!1}catch(C){df(this,C);return}if(c=p||"",p=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var b in m)p.set(b,m[b]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const C of m.keys())p.set(C,m.get(C));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(p.keys()).find(C=>C.toLowerCase()=="content-type"),b=a.FormData&&c instanceof a.FormData,!(0<=Array.prototype.indexOf.call(jI,h,void 0))||m||b||p.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[C,V]of p)this.g.setRequestHeader(C,V);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{_f(this),this.u=!0,this.g.send(c),this.u=!1}catch(C){df(this,C)}};function df(c,h){c.h=!1,c.g&&(c.j=!0,c.g.abort(),c.j=!1),c.l=h,c.m=5,ff(c),Ro(c)}function ff(c){c.A||(c.A=!0,Qe(c,"complete"),Qe(c,"error"))}n.abort=function(c){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=c||7,Qe(this,"complete"),Qe(this,"abort"),Ro(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ro(this,!0)),we.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?pf(this):this.bb())},n.bb=function(){pf(this)};function pf(c){if(c.h&&typeof o<"u"&&(!c.v[1]||Ot(c)!=4||c.Z()!=2)){if(c.u&&Ot(c)==4)Vd(c.Ea,0,c);else if(Qe(c,"readystatechange"),Ot(c)==4){c.h=!1;try{const V=c.Z();e:switch(V){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var p;if(!(p=h)){var m;if(m=V===0){var b=String(c.D).match(rf)[1]||null;!b&&a.self&&a.self.location&&(b=a.self.location.protocol.slice(0,-1)),m=!qI.test(b?b.toLowerCase():"")}p=m}if(p)Qe(c,"complete"),Qe(c,"success");else{c.m=6;try{var C=2<Ot(c)?c.g.statusText:""}catch{C=""}c.l=C+" ["+c.Z()+"]",ff(c)}}finally{Ro(c)}}}}function Ro(c,h){if(c.g){_f(c);const p=c.g,m=c.v[0]?()=>{}:null;c.g=null,c.v=null,h||Qe(c,"ready");try{p.onreadystatechange=m}catch{}}}function _f(c){c.I&&(a.clearTimeout(c.I),c.I=null)}n.isActive=function(){return!!this.g};function Ot(c){return c.g?c.g.readyState:0}n.Z=function(){try{return 2<Ot(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(c){if(this.g){var h=this.g.responseText;return c&&h.indexOf(c)==0&&(h=h.substring(c.length)),II(h)}};function mf(c){try{if(!c.g)return null;if("response"in c.g)return c.g.response;switch(c.H){case"":case"text":return c.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in c.g)return c.g.mozResponseArrayBuffer}return null}catch{return null}}function WI(c){const h={};c=(c.g&&2<=Ot(c)&&c.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<c.length;m++){if($(c[m]))continue;var p=A(c[m]);const b=p[0];if(p=p[1],typeof p!="string")continue;p=p.trim();const C=h[b]||[];h[b]=C,C.push(p)}I(h,function(m){return m.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function js(c,h,p){return p&&p.internalChannelParams&&p.internalChannelParams[c]||h}function gf(c){this.Aa=0,this.i=[],this.j=new Ms,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=js("failFast",!1,c),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=js("baseRetryDelayMs",5e3,c),this.cb=js("retryDelaySeedMs",1e4,c),this.Wa=js("forwardChannelMaxRetries",2,c),this.wa=js("forwardChannelRequestTimeoutMs",2e4,c),this.pa=c&&c.xmlHttpFactory||void 0,this.Xa=c&&c.Tb||void 0,this.Ca=c&&c.useFetchStreams||!1,this.L=void 0,this.J=c&&c.supportsCrossDomainXhr||!1,this.K="",this.h=new Jd(c&&c.concurrentRequestLimit),this.Da=new BI,this.P=c&&c.fastHandshake||!1,this.O=c&&c.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=c&&c.Rb||!1,c&&c.xa&&this.j.xa(),c&&c.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&c&&c.detectBufferingProxy||!1,this.ja=void 0,c&&c.longPollingTimeout&&0<c.longPollingTimeout&&(this.ja=c.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=gf.prototype,n.la=8,n.G=1,n.connect=function(c,h,p,m){Ye(0),this.W=c,this.H=h||{},p&&m!==void 0&&(this.H.OSID=p,this.H.OAID=m),this.F=this.X,this.I=Sf(this,null,this.W),Po(this)};function Qc(c){if(yf(c),c.G==3){var h=c.U++,p=xt(c.I);if(fe(p,"SID",c.K),fe(p,"RID",h),fe(p,"TYPE","terminate"),Ws(c,p),h=new Zt(c,c.j,h),h.L=2,h.v=Ao(xt(p)),p=!1,a.navigator&&a.navigator.sendBeacon)try{p=a.navigator.sendBeacon(h.v.toString(),"")}catch{}!p&&a.Image&&(new Image().src=h.v,p=!0),p||(h.g=Rf(h.j,null),h.g.ea(h.v)),h.F=Date.now(),Io(h)}bf(c)}function Co(c){c.g&&(Jc(c),c.g.cancel(),c.g=null)}function yf(c){Co(c),c.u&&(a.clearTimeout(c.u),c.u=null),No(c),c.h.cancel(),c.s&&(typeof c.s=="number"&&a.clearTimeout(c.s),c.s=null)}function Po(c){if(!Xd(c.h)&&!c.s){c.s=!0;var h=c.Ga;Ps||Nd(),Ns||(Ps(),Ns=!0),Pc.add(h,c),c.B=0}}function GI(c,h){return Zd(c.h)>=c.h.j-(c.s?1:0)?!1:c.s?(c.i=h.D.concat(c.i),!0):c.G==1||c.G==2||c.B>=(c.Va?0:c.Wa)?!1:(c.s=Vs(_(c.Ga,c,h),Af(c,c.B)),c.B++,!0)}n.Ga=function(c){if(this.s)if(this.s=null,this.G==1){if(!c){this.U=Math.floor(1e5*Math.random()),c=this.U++;const b=new Zt(this,this.j,c);let C=this.o;if(this.S&&(C?(C=y(C),T(C,this.S)):C=this.S),this.m!==null||this.O||(b.H=C,C=null),this.P)e:{for(var h=0,p=0;p<this.i.length;p++){t:{var m=this.i[p];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(h+=m,4096<h){h=p;break e}if(h===4096||p===this.i.length-1){h=p+1;break e}}h=1e3}else h=1e3;h=vf(this,b,h),p=xt(this.I),fe(p,"RID",c),fe(p,"CVER",22),this.D&&fe(p,"X-HTTP-Session-Id",this.D),Ws(this,p),C&&(this.O?h="headers="+encodeURIComponent(String(hf(C)))+"&"+h:this.m&&Kc(p,this.m,C)),zc(this.h,b),this.Ua&&fe(p,"TYPE","init"),this.P?(fe(p,"$req",h),fe(p,"SID","null"),b.T=!0,jc(b,p,null)):jc(b,p,h),this.G=2}}else this.G==3&&(c?Ef(this,c):this.i.length==0||Xd(this.h)||Ef(this))};function Ef(c,h){var p;h?p=h.l:p=c.U++;const m=xt(c.I);fe(m,"SID",c.K),fe(m,"RID",p),fe(m,"AID",c.T),Ws(c,m),c.m&&c.o&&Kc(m,c.m,c.o),p=new Zt(c,c.j,p,c.B+1),c.m===null&&(p.H=c.o),h&&(c.i=h.D.concat(c.i)),h=vf(c,p,1e3),p.I=Math.round(.5*c.wa)+Math.round(.5*c.wa*Math.random()),zc(c.h,p),jc(p,m,h)}function Ws(c,h){c.H&&z(c.H,function(p,m){fe(h,m,p)}),c.l&&nf({},function(p,m){fe(h,m,p)})}function vf(c,h,p){p=Math.min(c.i.length,p);var m=c.l?_(c.l.Na,c.l,c):null;e:{var b=c.i;let C=-1;for(;;){const V=["count="+p];C==-1?0<p?(C=b[0].g,V.push("ofs="+C)):C=0:V.push("ofs="+C);let le=!0;for(let Fe=0;Fe<p;Fe++){let re=b[Fe].g;const We=b[Fe].map;if(re-=C,0>re)C=Math.max(0,b[Fe].g-100),le=!1;else try{$I(We,V,"req"+re+"_")}catch{m&&m(We)}}if(le){m=V.join("&");break e}}}return c=c.i.splice(0,p),h.D=c,m}function If(c){if(!c.g&&!c.u){c.Y=1;var h=c.Fa;Ps||Nd(),Ns||(Ps(),Ns=!0),Pc.add(h,c),c.v=0}}function Yc(c){return c.g||c.u||3<=c.v?!1:(c.Y++,c.u=Vs(_(c.Fa,c),Af(c,c.v)),c.v++,!0)}n.Fa=function(){if(this.u=null,Tf(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var c=2*this.R;this.j.info("BP detection timer enabled: "+c),this.A=Vs(_(this.ab,this),c)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Ye(10),Co(this),Tf(this))};function Jc(c){c.A!=null&&(a.clearTimeout(c.A),c.A=null)}function Tf(c){c.g=new Zt(c,c.j,"rpc",c.Y),c.m===null&&(c.g.H=c.o),c.g.O=0;var h=xt(c.qa);fe(h,"RID","rpc"),fe(h,"SID",c.K),fe(h,"AID",c.T),fe(h,"CI",c.F?"0":"1"),!c.F&&c.ja&&fe(h,"TO",c.ja),fe(h,"TYPE","xmlhttp"),Ws(c,h),c.m&&c.o&&Kc(h,c.m,c.o),c.L&&(c.g.I=c.L);var p=c.g;c=c.ia,p.L=1,p.v=Ao(xt(h)),p.m=null,p.P=!0,Kd(p,c)}n.Za=function(){this.C!=null&&(this.C=null,Co(this),Yc(this),Ye(19))};function No(c){c.C!=null&&(a.clearTimeout(c.C),c.C=null)}function wf(c,h){var p=null;if(c.g==h){No(c),Jc(c),c.g=null;var m=2}else if(Hc(c.h,h))p=h.D,ef(c.h,h),m=1;else return;if(c.G!=0){if(h.o)if(m==1){p=h.m?h.m.length:0,h=Date.now()-h.F;var b=c.B;m=yo(),Qe(m,new Wd(m,p)),Po(c)}else If(c);else if(b=h.s,b==3||b==0&&0<h.X||!(m==1&&GI(c,h)||m==2&&Yc(c)))switch(p&&0<p.length&&(h=c.h,h.i=h.i.concat(p)),b){case 1:Mn(c,5);break;case 4:Mn(c,10);break;case 3:Mn(c,6);break;default:Mn(c,2)}}}function Af(c,h){let p=c.Ta+Math.floor(Math.random()*c.cb);return c.isActive()||(p*=2),p*h}function Mn(c,h){if(c.j.info("Error code "+h),h==2){var p=_(c.fb,c),m=c.Xa;const b=!m;m=new Vn(m||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||To(m,"https"),Ao(m),b?FI(m.toString(),p):UI(m.toString(),p)}else Ye(2);c.G=0,c.l&&c.l.sa(h),bf(c),yf(c)}n.fb=function(c){c?(this.j.info("Successfully pinged google.com"),Ye(2)):(this.j.info("Failed to ping google.com"),Ye(1))};function bf(c){if(c.G=0,c.ka=[],c.l){const h=tf(c.h);(h.length!=0||c.i.length!=0)&&(P(c.ka,h),P(c.ka,c.i),c.h.i.length=0,D(c.i),c.i.length=0),c.l.ra()}}function Sf(c,h,p){var m=p instanceof Vn?xt(p):new Vn(p);if(m.g!="")h&&(m.g=h+"."+m.g),wo(m,m.s);else{var b=a.location;m=b.protocol,h=h?h+"."+b.hostname:b.hostname,b=+b.port;var C=new Vn(null);m&&To(C,m),h&&(C.g=h),b&&wo(C,b),p&&(C.l=p),m=C}return p=c.D,h=c.ya,p&&h&&fe(m,p,h),fe(m,"VER",c.la),Ws(c,m),m}function Rf(c,h,p){if(h&&!c.J)throw Error("Can't create secondary domain capable XhrIo object.");return h=c.Ca&&!c.pa?new we(new bo({eb:p})):new we(c.pa),h.Ha(c.J),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Cf(){}n=Cf.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function Do(){}Do.prototype.g=function(c,h){return new at(c,h)};function at(c,h){je.call(this),this.g=new gf(h),this.l=c,this.h=h&&h.messageUrlParams||null,c=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(c?c["X-Client-Protocol"]="webchannel":c={"X-Client-Protocol":"webchannel"}),this.g.o=c,c=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(c?c["X-WebChannel-Content-Type"]=h.messageContentType:c={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.va&&(c?c["X-WebChannel-Client-Profile"]=h.va:c={"X-WebChannel-Client-Profile":h.va}),this.g.S=c,(c=h&&h.Sb)&&!$(c)&&(this.g.m=c),this.v=h&&h.supportsCrossDomainXhr||!1,this.u=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!$(h)&&(this.g.D=h,c=this.h,c!==null&&h in c&&(c=this.h,h in c&&delete c[h])),this.j=new Cr(this)}w(at,je),at.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},at.prototype.close=function(){Qc(this.g)},at.prototype.o=function(c){var h=this.g;if(typeof c=="string"){var p={};p.__data__=c,c=p}else this.u&&(p={},p.__data__=Lc(c),c=p);h.i.push(new CI(h.Ya++,c)),h.G==3&&Po(h)},at.prototype.N=function(){this.g.l=null,delete this.j,Qc(this.g),delete this.g,at.aa.N.call(this)};function Pf(c){Uc.call(this),c.__headers__&&(this.headers=c.__headers__,this.statusCode=c.__status__,delete c.__headers__,delete c.__status__);var h=c.__sm__;if(h){e:{for(const p in h){c=p;break e}c=void 0}(this.i=c)&&(c=this.i,h=h!==null&&c in h?h[c]:void 0),this.data=h}else this.data=c}w(Pf,Uc);function Nf(){Bc.call(this),this.status=1}w(Nf,Bc);function Cr(c){this.g=c}w(Cr,Cf),Cr.prototype.ua=function(){Qe(this.g,"a")},Cr.prototype.ta=function(c){Qe(this.g,new Pf(c))},Cr.prototype.sa=function(c){Qe(this.g,new Nf)},Cr.prototype.ra=function(){Qe(this.g,"b")},Do.prototype.createWebChannel=Do.prototype.g,at.prototype.send=at.prototype.o,at.prototype.open=at.prototype.m,at.prototype.close=at.prototype.close,gg=function(){return new Do},mg=function(){return yo()},_g=xn,kl={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Eo.NO_ERROR=0,Eo.TIMEOUT=8,Eo.HTTP_ERROR=6,Ko=Eo,Gd.COMPLETE="complete",pg=Gd,Bd.EventType=xs,xs.OPEN="a",xs.CLOSE="b",xs.ERROR="c",xs.MESSAGE="d",je.prototype.listen=je.prototype.K,ri=Bd,we.prototype.listenOnce=we.prototype.L,we.prototype.getLastError=we.prototype.Ka,we.prototype.getLastErrorCode=we.prototype.Ba,we.prototype.getStatus=we.prototype.Z,we.prototype.getResponseJson=we.prototype.Oa,we.prototype.getResponseText=we.prototype.oa,we.prototype.send=we.prototype.ea,we.prototype.setWithCredentials=we.prototype.Ha,fg=we}).apply(typeof Oo<"u"?Oo:typeof self<"u"?self:typeof window<"u"?window:{});const ap="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oe{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Oe.UNAUTHENTICATED=new Oe(null),Oe.GOOGLE_CREDENTIALS=new Oe("google-credentials-uid"),Oe.FIRST_PARTY=new Oe("first-party-uid"),Oe.MOCK_USER=new Oe("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let gs="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tr=new wu("@firebase/firestore");function Mr(){return tr.logLevel}function k(n,...e){if(tr.logLevel<=ee.DEBUG){const t=e.map(Vu);tr.debug(`Firestore (${gs}): ${n}`,...t)}}function Se(n,...e){if(tr.logLevel<=ee.ERROR){const t=e.map(Vu);tr.error(`Firestore (${gs}): ${n}`,...t)}}function Yr(n,...e){if(tr.logLevel<=ee.WARN){const t=e.map(Vu);tr.warn(`Firestore (${gs}): ${n}`,...t)}}function Vu(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function U(n="Unexpected state"){const e=`FIRESTORE (${gs}) INTERNAL ASSERTION FAILED: `+n;throw Se(e),new Error(e)}function q(n,e){n||U()}function F(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const N={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class O extends mr{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Et{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yg{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Vb{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Oe.UNAUTHENTICATED))}shutdown(){}}class Mb{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class Lb{constructor(e){this.t=e,this.currentUser=Oe.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){q(this.o===void 0);let r=this.i;const s=l=>this.i!==r?(r=this.i,t(l)):Promise.resolve();let i=new Et;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Et,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const l=i;e.enqueueRetryable(async()=>{await l.promise,await s(this.currentUser)})},a=l=>{k("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(l=>a(l)),setTimeout(()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?a(l):(k("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Et)}},0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(k("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(q(typeof r.accessToken=="string"),new yg(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return q(e===null||typeof e=="string"),new Oe(e)}}class Fb{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=Oe.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class Ub{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new Fb(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(Oe.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Bb{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class $b{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){q(this.o===void 0);const r=i=>{i.error!=null&&k("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.R;return this.R=i.token,k("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{k("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):k("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(q(typeof t.token=="string"),this.R=t.token,new Bb(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qb(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eg{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=qb(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%e.length))}return r}}function K(n,e){return n<e?-1:n>e?1:0}function Jr(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}function vg(n){return n+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ve{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new O(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new O(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new O(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new O(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return ve.fromMillis(Date.now())}static fromDate(e){return ve.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new ve(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?K(this.nanoseconds,e.nanoseconds):K(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W{constructor(e){this.timestamp=e}static fromTimestamp(e){return new W(e)}static min(){return new W(new ve(0,0))}static max(){return new W(new ve(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wi{constructor(e,t,r){t===void 0?t=0:t>e.length&&U(),r===void 0?r=e.length-t:r>e.length-t&&U(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return wi.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof wi?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=e.get(s),o=t.get(s);if(i<o)return-1;if(i>o)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class se extends wi{construct(e,t,r){return new se(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new O(N.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new se(t)}static emptyPath(){return new se([])}}const jb=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ye extends wi{construct(e,t,r){return new ye(e,t,r)}static isValidIdentifier(e){return jb.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ye.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new ye(["__name__"])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new O(N.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;s<e.length;){const a=e[s];if(a==="\\"){if(s+1===e.length)throw new O(N.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[s+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new O(N.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=l,s+=2}else a==="`"?(o=!o,s++):a!=="."||o?(r+=a,s++):(i(),s++)}if(i(),o)throw new O(N.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new ye(t)}static emptyPath(){return new ye([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M{constructor(e){this.path=e}static fromPath(e){return new M(se.fromString(e))}static fromName(e){return new M(se.fromString(e).popFirst(5))}static empty(){return new M(se.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&se.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return se.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new M(new se(e.slice()))}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class da{constructor(e,t,r,s){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=s}}function xl(n){return n.fields.find(e=>e.kind===2)}function Un(n){return n.fields.filter(e=>e.kind!==2)}da.UNKNOWN_ID=-1;class Qo{constructor(e,t){this.fieldPath=e,this.kind=t}}class Ai{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new Ai(0,ht.min())}}function Ig(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=W.fromTimestamp(r===1e9?new ve(t+1,0):new ve(t,r));return new ht(s,M.empty(),e)}function Tg(n){return new ht(n.readTime,n.key,-1)}class ht{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new ht(W.min(),M.empty(),-1)}static max(){return new ht(W.max(),M.empty(),-1)}}function Mu(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=M.comparator(n.documentKey,e.documentKey),t!==0?t:K(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wg="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Ag{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Cn(n){if(n.code!==N.FAILED_PRECONDITION||n.message!==wg)throw n;k("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class S{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&U(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new S((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof S?t:S.resolve(t)}catch(t){return S.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):S.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):S.reject(t)}static resolve(e){return new S((t,r)=>{t(e)})}static reject(e){return new S((t,r)=>{r(e)})}static waitFor(e){return new S((t,r)=>{let s=0,i=0,o=!1;e.forEach(a=>{++s,a.next(()=>{++i,o&&i===s&&t()},l=>r(l))}),o=!0,i===s&&t()})}static or(e){let t=S.resolve(!1);for(const r of e)t=t.next(s=>s?S.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new S((r,s)=>{const i=e.length,o=new Array(i);let a=0;for(let l=0;l<i;l++){const u=l;t(e[u]).next(d=>{o[u]=d,++a,a===i&&r(o)},d=>s(d))}})}static doWhile(e,t){return new S((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ka{constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.V=new Et,this.transaction.oncomplete=()=>{this.V.resolve()},this.transaction.onabort=()=>{t.error?this.V.reject(new li(e,t.error)):this.V.resolve()},this.transaction.onerror=r=>{const s=Lu(r.target.error);this.V.reject(new li(e,s))}}static open(e,t,r,s){try{return new Ka(t,e.transaction(s,r))}catch(i){throw new li(t,i)}}get m(){return this.V.promise}abort(e){e&&this.V.reject(e),this.aborted||(k("SimpleDb","Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}g(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new Gb(t)}}class yn{constructor(e,t,r){this.name=e,this.version=t,this.p=r,yn.S(Ne())===12.2&&Se("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}static delete(e){return k("SimpleDb","Removing database:",e),$n(window.indexedDB.deleteDatabase(e)).toPromise()}static D(){if(!Am())return!1;if(yn.v())return!0;const e=Ne(),t=yn.S(e),r=0<t&&t<10,s=bg(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||r||i)}static v(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)===null||e===void 0?void 0:e.C)==="YES"}static F(e,t){return e.store(t)}static S(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),r=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(r)}async M(e){return this.db||(k("SimpleDb","Opening database:",this.name),this.db=await new Promise((t,r)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const o=i.target.result;t(o)},s.onblocked=()=>{r(new li(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const o=i.target.error;o.name==="VersionError"?r(new O(N.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?r(new O(N.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):r(new li(e,o))},s.onupgradeneeded=i=>{k("SimpleDb",'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const o=i.target.result;this.p.O(o,s.transaction,i.oldVersion,this.version).next(()=>{k("SimpleDb","Database upgrade to version "+this.version+" complete")})}})),this.N&&(this.db.onversionchange=t=>this.N(t)),this.db}L(e){this.N=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,r,s){const i=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.M(e);const a=Ka.open(this.db,e,i?"readonly":"readwrite",r),l=s(a).next(u=>(a.g(),u)).catch(u=>(a.abort(u),S.reject(u))).toPromise();return l.catch(()=>{}),await a.m,l}catch(a){const l=a,u=l.name!=="FirebaseError"&&o<3;if(k("SimpleDb","Transaction failed with error:",l.message,"Retrying:",u),this.close(),!u)return Promise.reject(l)}}}close(){this.db&&this.db.close(),this.db=void 0}}function bg(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class Wb{constructor(e){this.B=e,this.k=!1,this.q=null}get isDone(){return this.k}get K(){return this.q}set cursor(e){this.B=e}done(){this.k=!0}$(e){this.q=e}delete(){return $n(this.B.delete())}}class li extends O{constructor(e,t){super(N.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Pn(n){return n.name==="IndexedDbTransactionError"}class Gb{constructor(e){this.store=e}put(e,t){let r;return t!==void 0?(k("SimpleDb","PUT",this.store.name,e,t),r=this.store.put(t,e)):(k("SimpleDb","PUT",this.store.name,"<auto-key>",e),r=this.store.put(e)),$n(r)}add(e){return k("SimpleDb","ADD",this.store.name,e,e),$n(this.store.add(e))}get(e){return $n(this.store.get(e)).next(t=>(t===void 0&&(t=null),k("SimpleDb","GET",this.store.name,e,t),t))}delete(e){return k("SimpleDb","DELETE",this.store.name,e),$n(this.store.delete(e))}count(){return k("SimpleDb","COUNT",this.store.name),$n(this.store.count())}U(e,t){const r=this.options(e,t),s=r.index?this.store.index(r.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(r.range);return new S((o,a)=>{i.onerror=l=>{a(l.target.error)},i.onsuccess=l=>{o(l.target.result)}})}{const i=this.cursor(r),o=[];return this.W(i,(a,l)=>{o.push(l)}).next(()=>o)}}G(e,t){const r=this.store.getAll(e,t===null?void 0:t);return new S((s,i)=>{r.onerror=o=>{i(o.target.error)},r.onsuccess=o=>{s(o.target.result)}})}j(e,t){k("SimpleDb","DELETE ALL",this.store.name);const r=this.options(e,t);r.H=!1;const s=this.cursor(r);return this.W(s,(i,o,a)=>a.delete())}J(e,t){let r;t?r=e:(r={},t=e);const s=this.cursor(r);return this.W(s,t)}Y(e){const t=this.cursor({});return new S((r,s)=>{t.onerror=i=>{const o=Lu(i.target.error);s(o)},t.onsuccess=i=>{const o=i.target.result;o?e(o.primaryKey,o.value).next(a=>{a?o.continue():r()}):r()}})}W(e,t){const r=[];return new S((s,i)=>{e.onerror=o=>{i(o.target.error)},e.onsuccess=o=>{const a=o.target.result;if(!a)return void s();const l=new Wb(a),u=t(a.primaryKey,a.value,l);if(u instanceof S){const d=u.catch(f=>(l.done(),S.reject(f)));r.push(d)}l.isDone?s():l.K===null?a.continue():a.continue(l.K)}}).next(()=>S.waitFor(r))}options(e,t){let r;return e!==void 0&&(typeof e=="string"?r=e:t=e),{index:r,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const r=this.store.index(e.index);return e.H?r.openKeyCursor(e.range,t):r.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function $n(n){return new S((e,t)=>{n.onsuccess=r=>{const s=r.target.result;e(s)},n.onerror=r=>{const s=Lu(r.target.error);t(s)}})}let cp=!1;function Lu(n){const e=yn.S(Ne());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(n.message.indexOf(t)>=0){const r=new O("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return cp||(cp=!0,setTimeout(()=>{throw r},0)),r}}return n}class Hb{constructor(e,t){this.asyncQueue=e,this.Z=t,this.task=null}start(){this.X(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}X(e){k("IndexBackfiller",`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,async()=>{this.task=null;try{k("IndexBackfiller",`Documents written: ${await this.Z.ee()}`)}catch(t){Pn(t)?k("IndexBackfiller","Ignoring IndexedDB error during index backfill: ",t):await Cn(t)}await this.X(6e4)})}}class zb{constructor(e,t){this.localStore=e,this.persistence=t}async ee(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",t=>this.te(t,e))}te(e,t){const r=new Set;let s=t,i=!0;return S.doWhile(()=>i===!0&&s>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(o=>{if(o!==null&&!r.has(o))return k("IndexBackfiller",`Processing collection: ${o}`),this.ne(e,o,s).next(a=>{s-=a,r.add(o)});i=!1})).next(()=>t-s)}ne(e,t,r){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next(s=>this.localStore.localDocuments.getNextDocuments(e,t,s,r).next(i=>{const o=i.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next(()=>this.re(s,i)).next(a=>(k("IndexBackfiller",`Updating offset: ${a}`),this.localStore.indexManager.updateCollectionGroup(e,t,a))).next(()=>o.size)}))}re(e,t){let r=e;return t.changes.forEach((s,i)=>{const o=Tg(i);Mu(o,r)>0&&(r=o)}),new ht(r.readTime,r.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rt{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}rt.oe=-1;function Qa(n){return n==null}function bi(n){return n===0&&1/n==-1/0}function Sg(n){return typeof n=="number"&&Number.isInteger(n)&&!bi(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xe(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=lp(e)),e=Kb(n.get(t),e);return lp(e)}function Kb(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case"":t+="";break;default:t+=i}}return t}function lp(n){return n+""}function wt(n){const e=n.length;if(q(e>=2),e===2)return q(n.charAt(0)===""&&n.charAt(1)===""),se.emptyPath();const t=e-2,r=[];let s="";for(let i=0;i<e;){const o=n.indexOf("",i);switch((o<0||o>t)&&U(),n.charAt(o+1)){case"":const a=n.substring(i,o);let l;s.length===0?l=a:(s+=a,l=s,s=""),r.push(l);break;case"":s+=n.substring(i,o),s+="\0";break;case"":s+=n.substring(i,o+1);break;default:U()}i=o+2}return new se(r)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const up=["userId","batchId"];/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yo(n,e){return[n,Xe(e)]}function Rg(n,e,t){return[n,Xe(e),t]}const Qb={},Yb=["prefixPath","collectionGroup","readTime","documentId"],Jb=["prefixPath","collectionGroup","documentId"],Xb=["collectionGroup","readTime","prefixPath","documentId"],Zb=["canonicalId","targetId"],eS=["targetId","path"],tS=["path","targetId"],nS=["collectionId","parent"],rS=["indexId","uid"],sS=["uid","sequenceNumber"],iS=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],oS=["indexId","uid","orderedDocumentKey"],aS=["userId","collectionPath","documentId"],cS=["userId","collectionPath","largestBatchId"],lS=["userId","collectionGroup","largestBatchId"],Cg=["mutationQueues","mutations","documentMutations","remoteDocuments","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries"],uS=[...Cg,"documentOverlays"],Pg=["mutationQueues","mutations","documentMutations","remoteDocumentsV14","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries","documentOverlays"],Ng=Pg,Fu=[...Ng,"indexConfiguration","indexState","indexEntries"],hS=Fu,dS=[...Fu,"globals"];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ol extends Ag{constructor(e,t){super(),this._e=e,this.currentSequenceNumber=t}}function De(n,e){const t=F(n);return yn.F(t._e,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hp(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function gr(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function fS(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function Dg(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ie=class Vl{constructor(e,t){this.comparator=e,this.root=t||En.EMPTY}insert(e,t){return new Vl(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,En.BLACK,null,null))}remove(e){return new Vl(this.comparator,this.root.remove(e,this.comparator).copy(null,null,En.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Vo(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Vo(this.root,e,this.comparator,!1)}getReverseIterator(){return new Vo(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Vo(this.root,e,this.comparator,!0)}},Vo=class{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},En=class Vt{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Vt.RED,this.left=s??Vt.EMPTY,this.right=i??Vt.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Vt(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Vt.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Vt.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Vt.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Vt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw U();const e=this.left.check();if(e!==this.right.check())throw U();return e+(this.isRed()?0:1)}};En.EMPTY=null,En.RED=!0,En.BLACK=!1;En.EMPTY=new class{constructor(){this.size=0}get key(){throw U()}get value(){throw U()}get color(){throw U()}get left(){throw U()}get right(){throw U()}copy(e,t,r,s,i){return this}insert(e,t,r){return new En(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ce{constructor(e){this.comparator=e,this.data=new Ie(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new dp(this.data.getIterator())}getIteratorFrom(e){return new dp(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof ce)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new ce(this.comparator);return t.data=e,t}}class dp{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function Nr(n){return n.hasNext()?n.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st{constructor(e){this.fields=e,e.sort(ye.comparator)}static empty(){return new st([])}unionWith(e){let t=new ce(ye.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new st(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Jr(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kg extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Re{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new kg("Invalid base64 string: "+i):i}}(e);return new Re(t)}static fromUint8Array(e){const t=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new Re(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return K(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Re.EMPTY_BYTE_STRING=new Re("");const pS=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function zt(n){if(q(!!n),typeof n=="string"){let e=0;const t=pS.exec(n);if(q(!!t),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ge(n.seconds),nanos:ge(n.nanos)}}function ge(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Tn(n){return typeof n=="string"?Re.fromBase64String(n):Re.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Uu(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function Bu(n){const e=n.mapValue.fields.__previous_value__;return Uu(e)?Bu(e):e}function Si(n){const e=zt(n.mapValue.fields.__local_write_time__.timestampValue);return new ve(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _S{constructor(e,t,r,s,i,o,a,l,u){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=l,this.useFetchStreams=u}}class nr{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new nr("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof nr&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fn={mapValue:{fields:{__type__:{stringValue:"__max__"}}}},Jo={nullValue:"NULL_VALUE"};function rr(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Uu(n)?4:xg(n)?9007199254740991:Ya(n)?10:11:U()}function Ct(n,e){if(n===e)return!0;const t=rr(n);if(t!==rr(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Si(n).isEqual(Si(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=zt(s.timestampValue),a=zt(i.timestampValue);return o.seconds===a.seconds&&o.nanos===a.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return Tn(s.bytesValue).isEqual(Tn(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return ge(s.geoPointValue.latitude)===ge(i.geoPointValue.latitude)&&ge(s.geoPointValue.longitude)===ge(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return ge(s.integerValue)===ge(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=ge(s.doubleValue),a=ge(i.doubleValue);return o===a?bi(o)===bi(a):isNaN(o)&&isNaN(a)}return!1}(n,e);case 9:return Jr(n.arrayValue.values||[],e.arrayValue.values||[],Ct);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},a=i.mapValue.fields||{};if(hp(o)!==hp(a))return!1;for(const l in o)if(o.hasOwnProperty(l)&&(a[l]===void 0||!Ct(o[l],a[l])))return!1;return!0}(n,e);default:return U()}}function Ri(n,e){return(n.values||[]).find(t=>Ct(t,e))!==void 0}function wn(n,e){if(n===e)return 0;const t=rr(n),r=rr(e);if(t!==r)return K(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return K(n.booleanValue,e.booleanValue);case 2:return function(i,o){const a=ge(i.integerValue||i.doubleValue),l=ge(o.integerValue||o.doubleValue);return a<l?-1:a>l?1:a===l?0:isNaN(a)?isNaN(l)?0:-1:1}(n,e);case 3:return fp(n.timestampValue,e.timestampValue);case 4:return fp(Si(n),Si(e));case 5:return K(n.stringValue,e.stringValue);case 6:return function(i,o){const a=Tn(i),l=Tn(o);return a.compareTo(l)}(n.bytesValue,e.bytesValue);case 7:return function(i,o){const a=i.split("/"),l=o.split("/");for(let u=0;u<a.length&&u<l.length;u++){const d=K(a[u],l[u]);if(d!==0)return d}return K(a.length,l.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,o){const a=K(ge(i.latitude),ge(o.latitude));return a!==0?a:K(ge(i.longitude),ge(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return pp(n.arrayValue,e.arrayValue);case 10:return function(i,o){var a,l,u,d;const f=i.fields||{},_=o.fields||{},g=(a=f.value)===null||a===void 0?void 0:a.arrayValue,w=(l=_.value)===null||l===void 0?void 0:l.arrayValue,D=K(((u=g==null?void 0:g.values)===null||u===void 0?void 0:u.length)||0,((d=w==null?void 0:w.values)===null||d===void 0?void 0:d.length)||0);return D!==0?D:pp(g,w)}(n.mapValue,e.mapValue);case 11:return function(i,o){if(i===fn.mapValue&&o===fn.mapValue)return 0;if(i===fn.mapValue)return 1;if(o===fn.mapValue)return-1;const a=i.fields||{},l=Object.keys(a),u=o.fields||{},d=Object.keys(u);l.sort(),d.sort();for(let f=0;f<l.length&&f<d.length;++f){const _=K(l[f],d[f]);if(_!==0)return _;const g=wn(a[l[f]],u[d[f]]);if(g!==0)return g}return K(l.length,d.length)}(n.mapValue,e.mapValue);default:throw U()}}function fp(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return K(n,e);const t=zt(n),r=zt(e),s=K(t.seconds,r.seconds);return s!==0?s:K(t.nanos,r.nanos)}function pp(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=wn(t[s],r[s]);if(i)return i}return K(t.length,r.length)}function Xr(n){return Ml(n)}function Ml(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=zt(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Tn(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return M.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=Ml(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${Ml(t.fields[o])}`;return s+"}"}(n.mapValue):U()}function Ci(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function Ll(n){return!!n&&"integerValue"in n}function Pi(n){return!!n&&"arrayValue"in n}function _p(n){return!!n&&"nullValue"in n}function mp(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Xo(n){return!!n&&"mapValue"in n}function Ya(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function ui(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return gr(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=ui(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=ui(n.arrayValue.values[t]);return e}return Object.assign({},n)}function xg(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}const Og={mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{}}}}};function mS(n){return"nullValue"in n?Jo:"booleanValue"in n?{booleanValue:!1}:"integerValue"in n||"doubleValue"in n?{doubleValue:NaN}:"timestampValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in n?{stringValue:""}:"bytesValue"in n?{bytesValue:""}:"referenceValue"in n?Ci(nr.empty(),M.empty()):"geoPointValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in n?{arrayValue:{}}:"mapValue"in n?Ya(n)?Og:{mapValue:{}}:U()}function gS(n){return"nullValue"in n?{booleanValue:!1}:"booleanValue"in n?{doubleValue:NaN}:"integerValue"in n||"doubleValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in n?{stringValue:""}:"stringValue"in n?{bytesValue:""}:"bytesValue"in n?Ci(nr.empty(),M.empty()):"referenceValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in n?{arrayValue:{}}:"arrayValue"in n?Og:"mapValue"in n?Ya(n)?{mapValue:{}}:fn:U()}function gp(n,e){const t=wn(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?-1:!n.inclusive&&e.inclusive?1:0}function yp(n,e){const t=wn(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?1:!n.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ze{constructor(e){this.value=e}static empty(){return new ze({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Xo(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=ui(t)}setAll(e){let t=ye.emptyPath(),r={},s=[];e.forEach((o,a)=>{if(!t.isImmediateParentOf(a)){const l=this.getFieldsMap(t);this.applyChanges(l,r,s),r={},s=[],t=a.popLast()}o?r[a.lastSegment()]=ui(o):s.push(a.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Xo(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Ct(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Xo(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){gr(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new ze(ui(this.value))}}function Vg(n){const e=[];return gr(n.fields,(t,r)=>{const s=new ye([t]);if(Xo(r)){const i=Vg(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)}),new st(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ae{constructor(e,t,r,s,i,o,a){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=a}static newInvalidDocument(e){return new Ae(e,0,W.min(),W.min(),W.min(),ze.empty(),0)}static newFoundDocument(e,t,r,s){return new Ae(e,1,t,W.min(),r,s,0)}static newNoDocument(e,t){return new Ae(e,2,t,W.min(),W.min(),ze.empty(),0)}static newUnknownDocument(e,t){return new Ae(e,3,t,W.min(),W.min(),ze.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(W.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ze.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ze.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=W.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ae&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ae(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zr{constructor(e,t){this.position=e,this.inclusive=t}}function Ep(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],o=n.position[s];if(i.field.isKeyField()?r=M.comparator(M.fromName(o.referenceValue),t.key):r=wn(o,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function vp(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Ct(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ni{constructor(e,t="asc"){this.field=e,this.dir=t}}function yS(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mg{}class te extends Mg{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new ES(e,t,r):t==="array-contains"?new TS(e,r):t==="in"?new qg(e,r):t==="not-in"?new wS(e,r):t==="array-contains-any"?new AS(e,r):new te(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new vS(e,r):new IS(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(wn(t,this.value)):t!==null&&rr(this.value)===rr(t)&&this.matchesComparison(wn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return U()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class oe extends Mg{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new oe(e,t)}matches(e){return es(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function es(n){return n.op==="and"}function Fl(n){return n.op==="or"}function $u(n){return Lg(n)&&es(n)}function Lg(n){for(const e of n.filters)if(e instanceof oe)return!1;return!0}function Ul(n){if(n instanceof te)return n.field.canonicalString()+n.op.toString()+Xr(n.value);if($u(n))return n.filters.map(e=>Ul(e)).join(",");{const e=n.filters.map(t=>Ul(t)).join(",");return`${n.op}(${e})`}}function Fg(n,e){return n instanceof te?function(r,s){return s instanceof te&&r.op===s.op&&r.field.isEqual(s.field)&&Ct(r.value,s.value)}(n,e):n instanceof oe?function(r,s){return s instanceof oe&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,o,a)=>i&&Fg(o,s.filters[a]),!0):!1}(n,e):void U()}function Ug(n,e){const t=n.filters.concat(e);return oe.create(t,n.op)}function Bg(n){return n instanceof te?function(t){return`${t.field.canonicalString()} ${t.op} ${Xr(t.value)}`}(n):n instanceof oe?function(t){return t.op.toString()+" {"+t.getFilters().map(Bg).join(" ,")+"}"}(n):"Filter"}class ES extends te{constructor(e,t,r){super(e,t,r),this.key=M.fromName(r.referenceValue)}matches(e){const t=M.comparator(e.key,this.key);return this.matchesComparison(t)}}class vS extends te{constructor(e,t){super(e,"in",t),this.keys=$g("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class IS extends te{constructor(e,t){super(e,"not-in",t),this.keys=$g("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function $g(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>M.fromName(r.referenceValue))}class TS extends te{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Pi(t)&&Ri(t.arrayValue,this.value)}}class qg extends te{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Ri(this.value.arrayValue,t)}}class wS extends te{constructor(e,t){super(e,"not-in",t)}matches(e){if(Ri(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Ri(this.value.arrayValue,t)}}class AS extends te{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Pi(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Ri(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bS{constructor(e,t=null,r=[],s=[],i=null,o=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=a,this.ue=null}}function Bl(n,e=null,t=[],r=[],s=null,i=null,o=null){return new bS(n,e,t,r,s,i,o)}function sr(n){const e=F(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Ul(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),Qa(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Xr(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Xr(r)).join(",")),e.ue=t}return e.ue}function Ki(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!yS(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Fg(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!vp(n.startAt,e.startAt)&&vp(n.endAt,e.endAt)}function fa(n){return M.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function pa(n,e){return n.filters.filter(t=>t instanceof te&&t.field.isEqual(e))}function Ip(n,e,t){let r=Jo,s=!0;for(const i of pa(n,e)){let o=Jo,a=!0;switch(i.op){case"<":case"<=":o=mS(i.value);break;case"==":case"in":case">=":o=i.value;break;case">":o=i.value,a=!1;break;case"!=":case"not-in":o=Jo}gp({value:r,inclusive:s},{value:o,inclusive:a})<0&&(r=o,s=a)}if(t!==null){for(let i=0;i<n.orderBy.length;++i)if(n.orderBy[i].field.isEqual(e)){const o=t.position[i];gp({value:r,inclusive:s},{value:o,inclusive:t.inclusive})<0&&(r=o,s=t.inclusive);break}}return{value:r,inclusive:s}}function Tp(n,e,t){let r=fn,s=!0;for(const i of pa(n,e)){let o=fn,a=!0;switch(i.op){case">=":case">":o=gS(i.value),a=!1;break;case"==":case"in":case"<=":o=i.value;break;case"<":o=i.value,a=!1;break;case"!=":case"not-in":o=fn}yp({value:r,inclusive:s},{value:o,inclusive:a})>0&&(r=o,s=a)}if(t!==null){for(let i=0;i<n.orderBy.length;++i)if(n.orderBy[i].field.isEqual(e)){const o=t.position[i];yp({value:r,inclusive:s},{value:o,inclusive:t.inclusive})>0&&(r=o,s=t.inclusive);break}}return{value:r,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yr{constructor(e,t=null,r=[],s=[],i=null,o="F",a=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=a,this.endAt=l,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function jg(n,e,t,r,s,i,o,a){return new yr(n,e,t,r,s,i,o,a)}function Qi(n){return new yr(n)}function wp(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Wg(n){return n.collectionGroup!==null}function hi(n){const e=F(n);if(e.ce===null){e.ce=[];const t=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let a=new ce(ye.comparator);return o.filters.forEach(l=>{l.getFlattenedFilters().forEach(u=>{u.isInequality()&&(a=a.add(u.field))})}),a})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.ce.push(new Ni(i,r))}),t.has(ye.keyField().canonicalString())||e.ce.push(new Ni(ye.keyField(),r))}return e.ce}function ut(n){const e=F(n);return e.le||(e.le=Gg(e,hi(n))),e.le}function SS(n){const e=F(n);return e.he||(e.he=Gg(e,n.explicitOrderBy)),e.he}function Gg(n,e){if(n.limitType==="F")return Bl(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Ni(s.field,i)});const t=n.endAt?new Zr(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Zr(n.startAt.position,n.startAt.inclusive):null;return Bl(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function $l(n,e){const t=n.filters.concat([e]);return new yr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function _a(n,e,t){return new yr(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Ja(n,e){return Ki(ut(n),ut(e))&&n.limitType===e.limitType}function Hg(n){return`${sr(ut(n))}|lt:${n.limitType}`}function Lr(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>Bg(s)).join(", ")}]`),Qa(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>Xr(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>Xr(s)).join(",")),`Target(${r})`}(ut(n))}; limitType=${n.limitType})`}function Yi(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):M.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of hi(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(o,a,l){const u=Ep(o,a,l);return o.inclusive?u<=0:u<0}(r.startAt,hi(r),s)||r.endAt&&!function(o,a,l){const u=Ep(o,a,l);return o.inclusive?u>=0:u>0}(r.endAt,hi(r),s))}(n,e)}function zg(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Kg(n){return(e,t)=>{let r=!1;for(const s of hi(n)){const i=RS(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function RS(n,e,t){const r=n.field.isKeyField()?M.comparator(e.key,t.key):function(i,o,a){const l=o.data.field(i),u=a.data.field(i);return l!==null&&u!==null?wn(l,u):U()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return U()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nn{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){gr(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return Dg(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CS=new Ie(M.comparator);function ct(){return CS}const Qg=new Ie(M.comparator);function si(...n){let e=Qg;for(const t of n)e=e.insert(t.key,t);return e}function Yg(n){let e=Qg;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function At(){return di()}function Jg(){return di()}function di(){return new Nn(n=>n.toString(),(n,e)=>n.isEqual(e))}const PS=new Ie(M.comparator),NS=new ce(M.comparator);function Q(...n){let e=NS;for(const t of n)e=e.add(t);return e}const DS=new ce(K);function qu(){return DS}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ju(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:bi(e)?"-0":e}}function Xg(n){return{integerValue:""+n}}function Zg(n,e){return Sg(e)?Xg(e):ju(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xa{constructor(){this._=void 0}}function kS(n,e,t){return n instanceof ts?function(s,i){const o={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Uu(i)&&(i=Bu(i)),i&&(o.fields.__previous_value__=i),{mapValue:o}}(t,e):n instanceof ir?ty(n,e):n instanceof or?ny(n,e):function(s,i){const o=ey(s,i),a=Ap(o)+Ap(s.Pe);return Ll(o)&&Ll(s.Pe)?Xg(a):ju(s.serializer,a)}(n,e)}function xS(n,e,t){return n instanceof ir?ty(n,e):n instanceof or?ny(n,e):t}function ey(n,e){return n instanceof ns?function(r){return Ll(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class ts extends Xa{}class ir extends Xa{constructor(e){super(),this.elements=e}}function ty(n,e){const t=ry(e);for(const r of n.elements)t.some(s=>Ct(s,r))||t.push(r);return{arrayValue:{values:t}}}class or extends Xa{constructor(e){super(),this.elements=e}}function ny(n,e){let t=ry(e);for(const r of n.elements)t=t.filter(s=>!Ct(s,r));return{arrayValue:{values:t}}}class ns extends Xa{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function Ap(n){return ge(n.integerValue||n.doubleValue)}function ry(n){return Pi(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ji{constructor(e,t){this.field=e,this.transform=t}}function OS(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof ir&&s instanceof ir||r instanceof or&&s instanceof or?Jr(r.elements,s.elements,Ct):r instanceof ns&&s instanceof ns?Ct(r.Pe,s.Pe):r instanceof ts&&s instanceof ts}(n.transform,e.transform)}class VS{constructor(e,t){this.version=e,this.transformResults=t}}class Pe{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Pe}static exists(e){return new Pe(void 0,e)}static updateTime(e){return new Pe(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Zo(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Za{}function sy(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Xi(n.key,Pe.none()):new ys(n.key,n.data,Pe.none());{const t=n.data,r=ze.empty();let s=new ce(ye.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new Jt(n.key,r,new st(s.toArray()),Pe.none())}}function MS(n,e,t){n instanceof ys?function(s,i,o){const a=s.value.clone(),l=Sp(s.fieldTransforms,i,o.transformResults);a.setAll(l),i.convertToFoundDocument(o.version,a).setHasCommittedMutations()}(n,e,t):n instanceof Jt?function(s,i,o){if(!Zo(s.precondition,i))return void i.convertToUnknownDocument(o.version);const a=Sp(s.fieldTransforms,i,o.transformResults),l=i.data;l.setAll(iy(s)),l.setAll(a),i.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(n,e,t):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function fi(n,e,t,r){return n instanceof ys?function(i,o,a,l){if(!Zo(i.precondition,o))return a;const u=i.value.clone(),d=Rp(i.fieldTransforms,l,o);return u.setAll(d),o.convertToFoundDocument(o.version,u).setHasLocalMutations(),null}(n,e,t,r):n instanceof Jt?function(i,o,a,l){if(!Zo(i.precondition,o))return a;const u=Rp(i.fieldTransforms,l,o),d=o.data;return d.setAll(iy(i)),d.setAll(u),o.convertToFoundDocument(o.version,d).setHasLocalMutations(),a===null?null:a.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(f=>f.field))}(n,e,t,r):function(i,o,a){return Zo(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):a}(n,e,t)}function LS(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=ey(r.transform,s||null);i!=null&&(t===null&&(t=ze.empty()),t.set(r.field,i))}return t||null}function bp(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Jr(r,s,(i,o)=>OS(i,o))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class ys extends Za{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Jt extends Za{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function iy(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function Sp(n,e,t){const r=new Map;q(n.length===t.length);for(let s=0;s<t.length;s++){const i=n[s],o=i.transform,a=e.data.field(i.field);r.set(i.field,xS(o,a,t[s]))}return r}function Rp(n,e,t){const r=new Map;for(const s of n){const i=s.transform,o=t.data.field(s.field);r.set(s.field,kS(i,o,e))}return r}class Xi extends Za{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class oy extends Za{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wu{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&MS(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=fi(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=fi(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Jg();return this.mutations.forEach(s=>{const i=e.get(s.key),o=i.overlayedDocument;let a=this.applyToLocalView(o,i.mutatedFields);a=t.has(s.key)?null:a;const l=sy(o,a);l!==null&&r.set(s.key,l),o.isValidDocument()||o.convertToNoDocument(W.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Q())}isEqual(e){return this.batchId===e.batchId&&Jr(this.mutations,e.mutations,(t,r)=>bp(t,r))&&Jr(this.baseMutations,e.baseMutations,(t,r)=>bp(t,r))}}class Gu{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){q(e.mutations.length===r.length);let s=function(){return PS}();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new Gu(e,t,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hu{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FS{constructor(e,t,r){this.alias=e,this.aggregateType=t,this.fieldPath=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class US{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ce,ne;function BS(n){switch(n){default:return U();case N.CANCELLED:case N.UNKNOWN:case N.DEADLINE_EXCEEDED:case N.RESOURCE_EXHAUSTED:case N.INTERNAL:case N.UNAVAILABLE:case N.UNAUTHENTICATED:return!1;case N.INVALID_ARGUMENT:case N.NOT_FOUND:case N.ALREADY_EXISTS:case N.PERMISSION_DENIED:case N.FAILED_PRECONDITION:case N.ABORTED:case N.OUT_OF_RANGE:case N.UNIMPLEMENTED:case N.DATA_LOSS:return!0}}function ay(n){if(n===void 0)return Se("GRPC error has no .code"),N.UNKNOWN;switch(n){case Ce.OK:return N.OK;case Ce.CANCELLED:return N.CANCELLED;case Ce.UNKNOWN:return N.UNKNOWN;case Ce.DEADLINE_EXCEEDED:return N.DEADLINE_EXCEEDED;case Ce.RESOURCE_EXHAUSTED:return N.RESOURCE_EXHAUSTED;case Ce.INTERNAL:return N.INTERNAL;case Ce.UNAVAILABLE:return N.UNAVAILABLE;case Ce.UNAUTHENTICATED:return N.UNAUTHENTICATED;case Ce.INVALID_ARGUMENT:return N.INVALID_ARGUMENT;case Ce.NOT_FOUND:return N.NOT_FOUND;case Ce.ALREADY_EXISTS:return N.ALREADY_EXISTS;case Ce.PERMISSION_DENIED:return N.PERMISSION_DENIED;case Ce.FAILED_PRECONDITION:return N.FAILED_PRECONDITION;case Ce.ABORTED:return N.ABORTED;case Ce.OUT_OF_RANGE:return N.OUT_OF_RANGE;case Ce.UNIMPLEMENTED:return N.UNIMPLEMENTED;case Ce.DATA_LOSS:return N.DATA_LOSS;default:return U()}}(ne=Ce||(Ce={}))[ne.OK=0]="OK",ne[ne.CANCELLED=1]="CANCELLED",ne[ne.UNKNOWN=2]="UNKNOWN",ne[ne.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ne[ne.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ne[ne.NOT_FOUND=5]="NOT_FOUND",ne[ne.ALREADY_EXISTS=6]="ALREADY_EXISTS",ne[ne.PERMISSION_DENIED=7]="PERMISSION_DENIED",ne[ne.UNAUTHENTICATED=16]="UNAUTHENTICATED",ne[ne.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ne[ne.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ne[ne.ABORTED=10]="ABORTED",ne[ne.OUT_OF_RANGE=11]="OUT_OF_RANGE",ne[ne.UNIMPLEMENTED=12]="UNIMPLEMENTED",ne[ne.INTERNAL=13]="INTERNAL",ne[ne.UNAVAILABLE=14]="UNAVAILABLE",ne[ne.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $S(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qS=new zn([4294967295,4294967295],0);function Cp(n){const e=$S().encode(n),t=new dg;return t.update(e),new Uint8Array(t.digest())}function Pp(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new zn([t,r],0),new zn([s,i],0)]}class zu{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new ii(`Invalid padding: ${t}`);if(r<0)throw new ii(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new ii(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new ii(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=zn.fromNumber(this.Ie)}Ee(e,t,r){let s=e.add(t.multiply(zn.fromNumber(r)));return s.compare(qS)===1&&(s=new zn([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=Cp(e),[r,s]=Pp(t);for(let i=0;i<this.hashCount;i++){const o=this.Ee(r,s,i);if(!this.de(o))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new zu(i,s,t);return r.forEach(a=>o.insert(a)),o}insert(e){if(this.Ie===0)return;const t=Cp(e),[r,s]=Pp(t);for(let i=0;i<this.hashCount;i++){const o=this.Ee(r,s,i);this.Ae(o)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class ii extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zi{constructor(e,t,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,eo.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Zi(W.min(),s,new Ie(K),ct(),Q())}}class eo{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new eo(r,t,Q(),Q(),Q())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ea{constructor(e,t,r,s){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=s}}class cy{constructor(e,t){this.targetId=e,this.me=t}}class ly{constructor(e,t,r=Re.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class Np{constructor(){this.fe=0,this.ge=kp(),this.pe=Re.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=Q(),t=Q(),r=Q();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:U()}}),new eo(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=kp()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,q(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class jS{constructor(e){this.Le=e,this.Be=new Map,this.ke=ct(),this.qe=Dp(),this.Qe=new Ie(K)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:U()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,s)=>{this.ze(s)&&t(s)})}He(e){const t=e.targetId,r=e.me.count,s=this.Je(t);if(s){const i=s.target;if(fa(i))if(r===0){const o=new M(i.path);this.Ue(t,o,Ae.newNoDocument(o,W.min()))}else q(r===1);else{const o=this.Ye(t);if(o!==r){const a=this.Ze(e),l=a?this.Xe(a,e,o):1;if(l!==0){this.je(t);const u=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,u)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let o,a;try{o=Tn(r).toUint8Array()}catch(l){if(l instanceof kg)return Yr("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{a=new zu(o,s,i)}catch(l){return Yr(l instanceof ii?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return a.Ie===0?null:a}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const o=this.Le.tt(),a=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(a)||(this.Ue(t,i,null),s++)}),s}rt(e){const t=new Map;this.Be.forEach((i,o)=>{const a=this.Je(o);if(a){if(i.current&&fa(a.target)){const l=new M(a.target.path);this.ke.get(l)!==null||this.it(o,l)||this.Ue(o,l,Ae.newNoDocument(l,e))}i.be&&(t.set(o,i.ve()),i.Ce())}});let r=Q();this.qe.forEach((i,o)=>{let a=!0;o.forEachWhile(l=>{const u=this.Je(l);return!u||u.purpose==="TargetPurposeLimboResolution"||(a=!1,!1)}),a&&(r=r.add(i))}),this.ke.forEach((i,o)=>o.setReadTime(e));const s=new Zi(e,t,this.Qe,this.ke,r);return this.ke=ct(),this.qe=Dp(),this.Qe=new Ie(K),s}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,t)?s.Fe(t,1):s.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new Np,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new ce(K),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||k("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Np),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function Dp(){return new Ie(M.comparator)}function kp(){return new Ie(M.comparator)}const WS={asc:"ASCENDING",desc:"DESCENDING"},GS={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},HS={and:"AND",or:"OR"};class zS{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function ql(n,e){return n.useProto3Json||Qa(e)?e:{value:e}}function rs(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function uy(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function KS(n,e){return rs(n,e.toTimestamp())}function Ze(n){return q(!!n),W.fromTimestamp(function(t){const r=zt(t);return new ve(r.seconds,r.nanos)}(n))}function Ku(n,e){return jl(n,e).canonicalString()}function jl(n,e){const t=function(s){return new se(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function hy(n){const e=se.fromString(n);return q(Ey(e)),e}function ma(n,e){return Ku(n.databaseId,e.path)}function Kn(n,e){const t=hy(e);if(t.get(1)!==n.databaseId.projectId)throw new O(N.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new O(N.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new M(py(t))}function dy(n,e){return Ku(n.databaseId,e)}function fy(n){const e=hy(n);return e.length===4?se.emptyPath():py(e)}function Wl(n){return new se(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function py(n){return q(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function xp(n,e,t){return{name:ma(n,e),fields:t.value.mapValue.fields}}function QS(n,e,t){const r=Kn(n,e.name),s=Ze(e.updateTime),i=e.createTime?Ze(e.createTime):W.min(),o=new ze({mapValue:{fields:e.fields}}),a=Ae.newFoundDocument(r,s,i,o);return t&&a.setHasCommittedMutations(),t?a.setHasCommittedMutations():a}function YS(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:U()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(u,d){return u.useProto3Json?(q(d===void 0||typeof d=="string"),Re.fromBase64String(d||"")):(q(d===void 0||d instanceof Buffer||d instanceof Uint8Array),Re.fromUint8Array(d||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&function(u){const d=u.code===void 0?N.UNKNOWN:ay(u.code);return new O(d,u.message||"")}(o);t=new ly(r,s,i,a||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Kn(n,r.document.name),i=Ze(r.document.updateTime),o=r.document.createTime?Ze(r.document.createTime):W.min(),a=new ze({mapValue:{fields:r.document.fields}}),l=Ae.newFoundDocument(s,i,o,a),u=r.targetIds||[],d=r.removedTargetIds||[];t=new ea(u,d,l.key,l)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Kn(n,r.document),i=r.readTime?Ze(r.readTime):W.min(),o=Ae.newNoDocument(s,i),a=r.removedTargetIds||[];t=new ea([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Kn(n,r.document),i=r.removedTargetIds||[];t=new ea([],i,s,null)}else{if(!("filter"in e))return U();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new US(s,i),a=r.targetId;t=new cy(a,o)}}return t}function ga(n,e){let t;if(e instanceof ys)t={update:xp(n,e.key,e.value)};else if(e instanceof Xi)t={delete:ma(n,e.key)};else if(e instanceof Jt)t={update:xp(n,e.key,e.data),updateMask:rR(e.fieldMask)};else{if(!(e instanceof oy))return U();t={verify:ma(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(i,o){const a=o.transform;if(a instanceof ts)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(a instanceof ir)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:a.elements}};if(a instanceof or)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:a.elements}};if(a instanceof ns)return{fieldPath:o.field.canonicalString(),increment:a.Pe};throw U()}(0,r))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:KS(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:U()}(n,e.precondition)),t}function Gl(n,e){const t=e.currentDocument?function(i){return i.updateTime!==void 0?Pe.updateTime(Ze(i.updateTime)):i.exists!==void 0?Pe.exists(i.exists):Pe.none()}(e.currentDocument):Pe.none(),r=e.updateTransforms?e.updateTransforms.map(s=>function(o,a){let l=null;if("setToServerValue"in a)q(a.setToServerValue==="REQUEST_TIME"),l=new ts;else if("appendMissingElements"in a){const d=a.appendMissingElements.values||[];l=new ir(d)}else if("removeAllFromArray"in a){const d=a.removeAllFromArray.values||[];l=new or(d)}else"increment"in a?l=new ns(o,a.increment):U();const u=ye.fromServerFormat(a.fieldPath);return new Ji(u,l)}(n,s)):[];if(e.update){e.update.name;const s=Kn(n,e.update.name),i=new ze({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=function(l){const u=l.fieldPaths||[];return new st(u.map(d=>ye.fromServerFormat(d)))}(e.updateMask);return new Jt(s,i,o,t,r)}return new ys(s,i,t,r)}if(e.delete){const s=Kn(n,e.delete);return new Xi(s,t)}if(e.verify){const s=Kn(n,e.verify);return new oy(s,t)}return U()}function JS(n,e){return n&&n.length>0?(q(e!==void 0),n.map(t=>function(s,i){let o=s.updateTime?Ze(s.updateTime):Ze(i);return o.isEqual(W.min())&&(o=Ze(i)),new VS(o,s.transformResults||[])}(t,e))):[]}function _y(n,e){return{documents:[dy(n,e.path)]}}function Qu(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=dy(n,s);const i=function(u){if(u.length!==0)return yy(oe.create(u,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const o=function(u){if(u.length!==0)return u.map(d=>function(_){return{field:un(_.field),direction:eR(_.dir)}}(d))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const a=ql(n,e.limit);return a!==null&&(t.structuredQuery.limit=a),e.startAt&&(t.structuredQuery.startAt=function(u){return{before:u.inclusive,values:u.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(u){return{before:!u.inclusive,values:u.position}}(e.endAt)),{_t:t,parent:s}}function XS(n,e,t,r){const{_t:s,parent:i}=Qu(n,e),o={},a=[];let l=0;return t.forEach(u=>{const d="aggregate_"+l++;o[d]=u.alias,u.aggregateType==="count"?a.push({alias:d,count:{}}):u.aggregateType==="avg"?a.push({alias:d,avg:{field:un(u.fieldPath)}}):u.aggregateType==="sum"&&a.push({alias:d,sum:{field:un(u.fieldPath)}})}),{request:{structuredAggregationQuery:{aggregations:a,structuredQuery:s.structuredQuery},parent:s.parent},ut:o,parent:i}}function my(n){let e=fy(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){q(r===1);const d=t.from[0];d.allDescendants?s=d.collectionId:e=e.child(d.collectionId)}let i=[];t.where&&(i=function(f){const _=gy(f);return _ instanceof oe&&$u(_)?_.getFilters():[_]}(t.where));let o=[];t.orderBy&&(o=function(f){return f.map(_=>function(w){return new Ni(Fr(w.field),function(P){switch(P){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(w.direction))}(_))}(t.orderBy));let a=null;t.limit&&(a=function(f){let _;return _=typeof f=="object"?f.value:f,Qa(_)?null:_}(t.limit));let l=null;t.startAt&&(l=function(f){const _=!!f.before,g=f.values||[];return new Zr(g,_)}(t.startAt));let u=null;return t.endAt&&(u=function(f){const _=!f.before,g=f.values||[];return new Zr(g,_)}(t.endAt)),jg(e,s,o,i,a,"F",l,u)}function ZS(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return U()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function gy(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Fr(t.unaryFilter.field);return te.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Fr(t.unaryFilter.field);return te.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Fr(t.unaryFilter.field);return te.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Fr(t.unaryFilter.field);return te.create(o,"!=",{nullValue:"NULL_VALUE"});default:return U()}}(n):n.fieldFilter!==void 0?function(t){return te.create(Fr(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return U()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return oe.create(t.compositeFilter.filters.map(r=>gy(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return U()}}(t.compositeFilter.op))}(n):U()}function eR(n){return WS[n]}function tR(n){return GS[n]}function nR(n){return HS[n]}function un(n){return{fieldPath:n.canonicalString()}}function Fr(n){return ye.fromServerFormat(n.fieldPath)}function yy(n){return n instanceof te?function(t){if(t.op==="=="){if(mp(t.value))return{unaryFilter:{field:un(t.field),op:"IS_NAN"}};if(_p(t.value))return{unaryFilter:{field:un(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(mp(t.value))return{unaryFilter:{field:un(t.field),op:"IS_NOT_NAN"}};if(_p(t.value))return{unaryFilter:{field:un(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:un(t.field),op:tR(t.op),value:t.value}}}(n):n instanceof oe?function(t){const r=t.getFilters().map(s=>yy(s));return r.length===1?r[0]:{compositeFilter:{op:nR(t.op),filters:r}}}(n):U()}function rR(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function Ey(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt{constructor(e,t,r,s,i=W.min(),o=W.min(),a=Re.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=a,this.expectedCount=l}withSequenceNumber(e){return new Bt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Bt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Bt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Bt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vy{constructor(e){this.ct=e}}function sR(n,e){let t;if(e.document)t=QS(n.ct,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const r=M.fromSegments(e.noDocument.path),s=cr(e.noDocument.readTime);t=Ae.newNoDocument(r,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return U();{const r=M.fromSegments(e.unknownDocument.path),s=cr(e.unknownDocument.version);t=Ae.newUnknownDocument(r,s)}}return e.readTime&&t.setReadTime(function(s){const i=new ve(s[0],s[1]);return W.fromTimestamp(i)}(e.readTime)),t}function Op(n,e){const t=e.key,r={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:ya(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())r.document=function(i,o){return{name:ma(i,o.key),fields:o.data.value.mapValue.fields,updateTime:rs(i,o.version.toTimestamp()),createTime:rs(i,o.createTime.toTimestamp())}}(n.ct,e);else if(e.isNoDocument())r.noDocument={path:t.path.toArray(),readTime:ar(e.version)};else{if(!e.isUnknownDocument())return U();r.unknownDocument={path:t.path.toArray(),version:ar(e.version)}}return r}function ya(n){const e=n.toTimestamp();return[e.seconds,e.nanoseconds]}function ar(n){const e=n.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function cr(n){const e=new ve(n.seconds,n.nanoseconds);return W.fromTimestamp(e)}function qn(n,e){const t=(e.baseMutations||[]).map(i=>Gl(n.ct,i));for(let i=0;i<e.mutations.length-1;++i){const o=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const a=e.mutations[i+1];o.updateTransforms=a.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const r=e.mutations.map(i=>Gl(n.ct,i)),s=ve.fromMillis(e.localWriteTimeMs);return new Wu(e.batchId,s,t,r)}function oi(n){const e=cr(n.readTime),t=n.lastLimboFreeSnapshotVersion!==void 0?cr(n.lastLimboFreeSnapshotVersion):W.min();let r;return r=function(i){return i.documents!==void 0}(n.query)?function(i){return q(i.documents.length===1),ut(Qi(fy(i.documents[0])))}(n.query):function(i){return ut(my(i))}(n.query),new Bt(r,n.targetId,"TargetPurposeListen",n.lastListenSequenceNumber,e,t,Re.fromBase64String(n.resumeToken))}function Iy(n,e){const t=ar(e.snapshotVersion),r=ar(e.lastLimboFreeSnapshotVersion);let s;s=fa(e.target)?_y(n.ct,e.target):Qu(n.ct,e.target)._t;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:sr(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:s}}function Ty(n){const e=my({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?_a(e,e.limit,"L"):e}function ol(n,e){return new Hu(e.largestBatchId,Gl(n.ct,e.overlayMutation))}function Vp(n,e){const t=e.path.lastSegment();return[n,Xe(e.path.popLast()),t]}function Mp(n,e,t,r){return{indexId:n,uid:e,sequenceNumber:t,readTime:ar(r.readTime),documentKey:Xe(r.documentKey.path),largestBatchId:r.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iR{getBundleMetadata(e,t){return Lp(e).get(t).next(r=>{if(r)return function(i){return{id:i.bundleId,createTime:cr(i.createTime),version:i.version}}(r)})}saveBundleMetadata(e,t){return Lp(e).put(function(s){return{bundleId:s.id,createTime:ar(Ze(s.createTime)),version:s.version}}(t))}getNamedQuery(e,t){return Fp(e).get(t).next(r=>{if(r)return function(i){return{name:i.name,query:Ty(i.bundledQuery),readTime:cr(i.readTime)}}(r)})}saveNamedQuery(e,t){return Fp(e).put(function(s){return{name:s.name,readTime:ar(Ze(s.readTime)),bundledQuery:s.bundledQuery}}(t))}}function Lp(n){return De(n,"bundles")}function Fp(n){return De(n,"namedQueries")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ec{constructor(e,t){this.serializer=e,this.userId=t}static lt(e,t){const r=t.uid||"";return new ec(e,r)}getOverlay(e,t){return Gs(e).get(Vp(this.userId,t)).next(r=>r?ol(this.serializer,r):null)}getOverlays(e,t){const r=At();return S.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){const s=[];return r.forEach((i,o)=>{const a=new Hu(t,o);s.push(this.ht(e,a))}),S.waitFor(s)}removeOverlaysForBatchId(e,t,r){const s=new Set;t.forEach(o=>s.add(Xe(o.getCollectionPath())));const i=[];return s.forEach(o=>{const a=IDBKeyRange.bound([this.userId,o,r],[this.userId,o,r+1],!1,!0);i.push(Gs(e).j("collectionPathOverlayIndex",a))}),S.waitFor(i)}getOverlaysForCollection(e,t,r){const s=At(),i=Xe(t),o=IDBKeyRange.bound([this.userId,i,r],[this.userId,i,Number.POSITIVE_INFINITY],!0);return Gs(e).U("collectionPathOverlayIndex",o).next(a=>{for(const l of a){const u=ol(this.serializer,l);s.set(u.getKey(),u)}return s})}getOverlaysForCollectionGroup(e,t,r,s){const i=At();let o;const a=IDBKeyRange.bound([this.userId,t,r],[this.userId,t,Number.POSITIVE_INFINITY],!0);return Gs(e).J({index:"collectionGroupOverlayIndex",range:a},(l,u,d)=>{const f=ol(this.serializer,u);i.size()<s||f.largestBatchId===o?(i.set(f.getKey(),f),o=f.largestBatchId):d.done()}).next(()=>i)}ht(e,t){return Gs(e).put(function(s,i,o){const[a,l,u]=Vp(i,o.mutation.key);return{userId:i,collectionPath:l,documentId:u,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:ga(s.ct,o.mutation)}}(this.serializer,this.userId,t))}}function Gs(n){return De(n,"documentOverlays")}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oR{Pt(e){return De(e,"globals")}getSessionToken(e){return this.Pt(e).get("sessionToken").next(t=>{const r=t==null?void 0:t.value;return r?Re.fromUint8Array(r):Re.EMPTY_BYTE_STRING})}setSessionToken(e,t){return this.Pt(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jn{constructor(){}It(e,t){this.Tt(e,t),t.Et()}Tt(e,t){if("nullValue"in e)this.dt(t,5);else if("booleanValue"in e)this.dt(t,10),t.At(e.booleanValue?1:0);else if("integerValue"in e)this.dt(t,15),t.At(ge(e.integerValue));else if("doubleValue"in e){const r=ge(e.doubleValue);isNaN(r)?this.dt(t,13):(this.dt(t,15),bi(r)?t.At(0):t.At(r))}else if("timestampValue"in e){let r=e.timestampValue;this.dt(t,20),typeof r=="string"&&(r=zt(r)),t.Rt(`${r.seconds||""}`),t.At(r.nanos||0)}else if("stringValue"in e)this.Vt(e.stringValue,t),this.ft(t);else if("bytesValue"in e)this.dt(t,30),t.gt(Tn(e.bytesValue)),this.ft(t);else if("referenceValue"in e)this.yt(e.referenceValue,t);else if("geoPointValue"in e){const r=e.geoPointValue;this.dt(t,45),t.At(r.latitude||0),t.At(r.longitude||0)}else"mapValue"in e?xg(e)?this.dt(t,Number.MAX_SAFE_INTEGER):Ya(e)?this.wt(e.mapValue,t):(this.St(e.mapValue,t),this.ft(t)):"arrayValue"in e?(this.bt(e.arrayValue,t),this.ft(t)):U()}Vt(e,t){this.dt(t,25),this.Dt(e,t)}Dt(e,t){t.Rt(e)}St(e,t){const r=e.fields||{};this.dt(t,55);for(const s of Object.keys(r))this.Vt(s,t),this.Tt(r[s],t)}wt(e,t){var r,s;const i=e.fields||{};this.dt(t,53);const o="value",a=((s=(r=i[o].arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.length)||0;this.dt(t,15),t.At(ge(a)),this.Vt(o,t),this.Tt(i[o],t)}bt(e,t){const r=e.values||[];this.dt(t,50);for(const s of r)this.Tt(s,t)}yt(e,t){this.dt(t,37),M.fromName(e).path.forEach(r=>{this.dt(t,60),this.Dt(r,t)})}dt(e,t){e.At(t)}ft(e){e.At(2)}}jn.vt=new jn;function aR(n){if(n===0)return 8;let e=0;return!(n>>4)&&(e+=4,n<<=4),!(n>>6)&&(e+=2,n<<=2),!(n>>7)&&(e+=1),e}function Up(n){const e=64-function(r){let s=0;for(let i=0;i<8;++i){const o=aR(255&r[i]);if(s+=o,o!==8)break}return s}(n);return Math.ceil(e/8)}class cR{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Ct(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Ft(r.value),r=t.next();this.Mt()}xt(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Ot(r.value),r=t.next();this.Nt()}Lt(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Ft(r);else if(r<2048)this.Ft(960|r>>>6),this.Ft(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Ft(480|r>>>12),this.Ft(128|63&r>>>6),this.Ft(128|63&r);else{const s=t.codePointAt(0);this.Ft(240|s>>>18),this.Ft(128|63&s>>>12),this.Ft(128|63&s>>>6),this.Ft(128|63&s)}}this.Mt()}Bt(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Ot(r);else if(r<2048)this.Ot(960|r>>>6),this.Ot(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Ot(480|r>>>12),this.Ot(128|63&r>>>6),this.Ot(128|63&r);else{const s=t.codePointAt(0);this.Ot(240|s>>>18),this.Ot(128|63&s>>>12),this.Ot(128|63&s>>>6),this.Ot(128|63&s)}}this.Nt()}kt(e){const t=this.qt(e),r=Up(t);this.Qt(1+r),this.buffer[this.position++]=255&r;for(let s=t.length-r;s<t.length;++s)this.buffer[this.position++]=255&t[s]}Kt(e){const t=this.qt(e),r=Up(t);this.Qt(1+r),this.buffer[this.position++]=~(255&r);for(let s=t.length-r;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}$t(){this.Ut(255),this.Ut(255)}Wt(){this.Gt(255),this.Gt(255)}reset(){this.position=0}seed(e){this.Qt(e.length),this.buffer.set(e,this.position),this.position+=e.length}zt(){return this.buffer.slice(0,this.position)}qt(e){const t=function(i){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,i,!1),new Uint8Array(o.buffer)}(e),r=(128&t[0])!=0;t[0]^=r?255:128;for(let s=1;s<t.length;++s)t[s]^=r?255:0;return t}Ft(e){const t=255&e;t===0?(this.Ut(0),this.Ut(255)):t===255?(this.Ut(255),this.Ut(0)):this.Ut(t)}Ot(e){const t=255&e;t===0?(this.Gt(0),this.Gt(255)):t===255?(this.Gt(255),this.Gt(0)):this.Gt(e)}Mt(){this.Ut(0),this.Ut(1)}Nt(){this.Gt(0),this.Gt(1)}Ut(e){this.Qt(1),this.buffer[this.position++]=e}Gt(e){this.Qt(1),this.buffer[this.position++]=~e}Qt(e){const t=e+this.position;if(t<=this.buffer.length)return;let r=2*this.buffer.length;r<t&&(r=t);const s=new Uint8Array(r);s.set(this.buffer),this.buffer=s}}class lR{constructor(e){this.jt=e}gt(e){this.jt.Ct(e)}Rt(e){this.jt.Lt(e)}At(e){this.jt.kt(e)}Et(){this.jt.$t()}}class uR{constructor(e){this.jt=e}gt(e){this.jt.xt(e)}Rt(e){this.jt.Bt(e)}At(e){this.jt.Kt(e)}Et(){this.jt.Wt()}}class Hs{constructor(){this.jt=new cR,this.Ht=new lR(this.jt),this.Jt=new uR(this.jt)}seed(e){this.jt.seed(e)}Yt(e){return e===0?this.Ht:this.Jt}zt(){return this.jt.zt()}reset(){this.jt.reset()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wn{constructor(e,t,r,s){this.indexId=e,this.documentKey=t,this.arrayValue=r,this.directionalValue=s}Zt(){const e=this.directionalValue.length,t=e===0||this.directionalValue[e-1]===255?e+1:e,r=new Uint8Array(t);return r.set(this.directionalValue,0),t!==e?r.set([0],this.directionalValue.length):++r[r.length-1],new Wn(this.indexId,this.documentKey,this.arrayValue,r)}}function rn(n,e){let t=n.indexId-e.indexId;return t!==0?t:(t=Bp(n.arrayValue,e.arrayValue),t!==0?t:(t=Bp(n.directionalValue,e.directionalValue),t!==0?t:M.comparator(n.documentKey,e.documentKey)))}function Bp(n,e){for(let t=0;t<n.length&&t<e.length;++t){const r=n[t]-e[t];if(r!==0)return r}return n.length-e.length}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $p{constructor(e){this.Xt=new ce((t,r)=>ye.comparator(t.field,r.field)),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.en=e.orderBy,this.tn=[];for(const t of e.filters){const r=t;r.isInequality()?this.Xt=this.Xt.add(r):this.tn.push(r)}}get nn(){return this.Xt.size>1}rn(e){if(q(e.collectionGroup===this.collectionId),this.nn)return!1;const t=xl(e);if(t!==void 0&&!this.sn(t))return!1;const r=Un(e);let s=new Set,i=0,o=0;for(;i<r.length&&this.sn(r[i]);++i)s=s.add(r[i].fieldPath.canonicalString());if(i===r.length)return!0;if(this.Xt.size>0){const a=this.Xt.getIterator().getNext();if(!s.has(a.field.canonicalString())){const l=r[i];if(!this.on(a,l)||!this._n(this.en[o++],l))return!1}++i}for(;i<r.length;++i){const a=r[i];if(o>=this.en.length||!this._n(this.en[o++],a))return!1}return!0}an(){if(this.nn)return null;let e=new ce(ye.comparator);const t=[];for(const r of this.tn)if(!r.field.isKeyField())if(r.op==="array-contains"||r.op==="array-contains-any")t.push(new Qo(r.field,2));else{if(e.has(r.field))continue;e=e.add(r.field),t.push(new Qo(r.field,0))}for(const r of this.en)r.field.isKeyField()||e.has(r.field)||(e=e.add(r.field),t.push(new Qo(r.field,r.dir==="asc"?0:1)));return new da(da.UNKNOWN_ID,this.collectionId,t,Ai.empty())}sn(e){for(const t of this.tn)if(this.on(t,e))return!0;return!1}on(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const r=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===r}_n(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wy(n){var e,t;if(q(n instanceof te||n instanceof oe),n instanceof te){if(n instanceof qg){const s=((t=(e=n.value.arrayValue)===null||e===void 0?void 0:e.values)===null||t===void 0?void 0:t.map(i=>te.create(n.field,"==",i)))||[];return oe.create(s,"or")}return n}const r=n.filters.map(s=>wy(s));return oe.create(r,n.op)}function hR(n){if(n.getFilters().length===0)return[];const e=Kl(wy(n));return q(Ay(e)),Hl(e)||zl(e)?[e]:e.getFilters()}function Hl(n){return n instanceof te}function zl(n){return n instanceof oe&&$u(n)}function Ay(n){return Hl(n)||zl(n)||function(t){if(t instanceof oe&&Fl(t)){for(const r of t.getFilters())if(!Hl(r)&&!zl(r))return!1;return!0}return!1}(n)}function Kl(n){if(q(n instanceof te||n instanceof oe),n instanceof te)return n;if(n.filters.length===1)return Kl(n.filters[0]);const e=n.filters.map(r=>Kl(r));let t=oe.create(e,n.op);return t=Ea(t),Ay(t)?t:(q(t instanceof oe),q(es(t)),q(t.filters.length>1),t.filters.reduce((r,s)=>Yu(r,s)))}function Yu(n,e){let t;return q(n instanceof te||n instanceof oe),q(e instanceof te||e instanceof oe),t=n instanceof te?e instanceof te?function(s,i){return oe.create([s,i],"and")}(n,e):qp(n,e):e instanceof te?qp(e,n):function(s,i){if(q(s.filters.length>0&&i.filters.length>0),es(s)&&es(i))return Ug(s,i.getFilters());const o=Fl(s)?s:i,a=Fl(s)?i:s,l=o.filters.map(u=>Yu(u,a));return oe.create(l,"or")}(n,e),Ea(t)}function qp(n,e){if(es(e))return Ug(e,n.getFilters());{const t=e.filters.map(r=>Yu(n,r));return oe.create(t,"or")}}function Ea(n){if(q(n instanceof te||n instanceof oe),n instanceof te)return n;const e=n.getFilters();if(e.length===1)return Ea(e[0]);if(Lg(n))return n;const t=e.map(s=>Ea(s)),r=[];return t.forEach(s=>{s instanceof te?r.push(s):s instanceof oe&&(s.op===n.op?r.push(...s.filters):r.push(s))}),r.length===1?r[0]:oe.create(r,n.op)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dR{constructor(){this.un=new Ju}addToCollectionParentIndex(e,t){return this.un.add(t),S.resolve()}getCollectionParents(e,t){return S.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return S.resolve()}deleteFieldIndex(e,t){return S.resolve()}deleteAllFieldIndexes(e){return S.resolve()}createTargetIndexes(e,t){return S.resolve()}getDocumentsMatchingTarget(e,t){return S.resolve(null)}getIndexType(e,t){return S.resolve(0)}getFieldIndexes(e,t){return S.resolve([])}getNextCollectionGroupToUpdate(e){return S.resolve(null)}getMinOffset(e,t){return S.resolve(ht.min())}getMinOffsetFromCollectionGroup(e,t){return S.resolve(ht.min())}updateCollectionGroup(e,t,r){return S.resolve()}updateIndexEntries(e,t){return S.resolve()}}class Ju{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new ce(se.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new ce(se.comparator)).toArray()}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mo=new Uint8Array(0);class fR{constructor(e,t){this.databaseId=t,this.cn=new Ju,this.ln=new Nn(r=>sr(r),(r,s)=>Ki(r,s)),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.cn.has(t)){const r=t.lastSegment(),s=t.popLast();e.addOnCommittedListener(()=>{this.cn.add(t)});const i={collectionId:r,parent:Xe(s)};return jp(e).put(i)}return S.resolve()}getCollectionParents(e,t){const r=[],s=IDBKeyRange.bound([t,""],[vg(t),""],!1,!0);return jp(e).U(s).next(i=>{for(const o of i){if(o.collectionId!==t)break;r.push(wt(o.parent))}return r})}addFieldIndex(e,t){const r=zs(e),s=function(a){return{indexId:a.indexId,collectionGroup:a.collectionGroup,fields:a.fields.map(l=>[l.fieldPath.canonicalString(),l.kind])}}(t);delete s.indexId;const i=r.add(s);if(t.indexState){const o=kr(e);return i.next(a=>{o.put(Mp(a,this.uid,t.indexState.sequenceNumber,t.indexState.offset))})}return i.next()}deleteFieldIndex(e,t){const r=zs(e),s=kr(e),i=Dr(e);return r.delete(t.indexId).next(()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))).next(()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))}deleteAllFieldIndexes(e){const t=zs(e),r=Dr(e),s=kr(e);return t.j().next(()=>r.j()).next(()=>s.j())}createTargetIndexes(e,t){return S.forEach(this.hn(t),r=>this.getIndexType(e,r).next(s=>{if(s===0||s===1){const i=new $p(r).an();if(i!=null)return this.addFieldIndex(e,i)}}))}getDocumentsMatchingTarget(e,t){const r=Dr(e);let s=!0;const i=new Map;return S.forEach(this.hn(t),o=>this.Pn(e,o).next(a=>{s&&(s=!!a),i.set(o,a)})).next(()=>{if(s){let o=Q();const a=[];return S.forEach(i,(l,u)=>{k("IndexedDbIndexManager",`Using index ${function(L){return`id=${L.indexId}|cg=${L.collectionGroup}|f=${L.fields.map(j=>`${j.fieldPath}:${j.kind}`).join(",")}`}(l)} to execute ${sr(t)}`);const d=function(L,j){const Z=xl(j);if(Z===void 0)return null;for(const z of pa(L,Z.fieldPath))switch(z.op){case"array-contains-any":return z.value.arrayValue.values||[];case"array-contains":return[z.value]}return null}(u,l),f=function(L,j){const Z=new Map;for(const z of Un(j))for(const I of pa(L,z.fieldPath))switch(I.op){case"==":case"in":Z.set(z.fieldPath.canonicalString(),I.value);break;case"not-in":case"!=":return Z.set(z.fieldPath.canonicalString(),I.value),Array.from(Z.values())}return null}(u,l),_=function(L,j){const Z=[];let z=!0;for(const I of Un(j)){const y=I.kind===0?Ip(L,I.fieldPath,L.startAt):Tp(L,I.fieldPath,L.startAt);Z.push(y.value),z&&(z=y.inclusive)}return new Zr(Z,z)}(u,l),g=function(L,j){const Z=[];let z=!0;for(const I of Un(j)){const y=I.kind===0?Tp(L,I.fieldPath,L.endAt):Ip(L,I.fieldPath,L.endAt);Z.push(y.value),z&&(z=y.inclusive)}return new Zr(Z,z)}(u,l),w=this.In(l,u,_),D=this.In(l,u,g),P=this.Tn(l,u,f),B=this.En(l.indexId,d,w,_.inclusive,D,g.inclusive,P);return S.forEach(B,$=>r.G($,t.limit).next(L=>{L.forEach(j=>{const Z=M.fromSegments(j.documentKey);o.has(Z)||(o=o.add(Z),a.push(Z))})}))}).next(()=>a)}return S.resolve(null)})}hn(e){let t=this.ln.get(e);return t||(e.filters.length===0?t=[e]:t=hR(oe.create(e.filters,"and")).map(r=>Bl(e.path,e.collectionGroup,e.orderBy,r.getFilters(),e.limit,e.startAt,e.endAt)),this.ln.set(e,t),t)}En(e,t,r,s,i,o,a){const l=(t!=null?t.length:1)*Math.max(r.length,i.length),u=l/(t!=null?t.length:1),d=[];for(let f=0;f<l;++f){const _=t?this.dn(t[f/u]):Mo,g=this.An(e,_,r[f%u],s),w=this.Rn(e,_,i[f%u],o),D=a.map(P=>this.An(e,_,P,!0));d.push(...this.createRange(g,w,D))}return d}An(e,t,r,s){const i=new Wn(e,M.empty(),t,r);return s?i:i.Zt()}Rn(e,t,r,s){const i=new Wn(e,M.empty(),t,r);return s?i.Zt():i}Pn(e,t){const r=new $p(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next(i=>{let o=null;for(const a of i)r.rn(a)&&(!o||a.fields.length>o.fields.length)&&(o=a);return o})}getIndexType(e,t){let r=2;const s=this.hn(t);return S.forEach(s,i=>this.Pn(e,i).next(o=>{o?r!==0&&o.fields.length<function(l){let u=new ce(ye.comparator),d=!1;for(const f of l.filters)for(const _ of f.getFlattenedFilters())_.field.isKeyField()||(_.op==="array-contains"||_.op==="array-contains-any"?d=!0:u=u.add(_.field));for(const f of l.orderBy)f.field.isKeyField()||(u=u.add(f.field));return u.size+(d?1:0)}(i)&&(r=1):r=0})).next(()=>function(o){return o.limit!==null}(t)&&s.length>1&&r===2?1:r)}Vn(e,t){const r=new Hs;for(const s of Un(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const o=r.Yt(s.kind);jn.vt.It(i,o)}return r.zt()}dn(e){const t=new Hs;return jn.vt.It(e,t.Yt(0)),t.zt()}mn(e,t){const r=new Hs;return jn.vt.It(Ci(this.databaseId,t),r.Yt(function(i){const o=Un(i);return o.length===0?0:o[o.length-1].kind}(e))),r.zt()}Tn(e,t,r){if(r===null)return[];let s=[];s.push(new Hs);let i=0;for(const o of Un(e)){const a=r[i++];for(const l of s)if(this.fn(t,o.fieldPath)&&Pi(a))s=this.gn(s,o,a);else{const u=l.Yt(o.kind);jn.vt.It(a,u)}}return this.pn(s)}In(e,t,r){return this.Tn(e,t,r.position)}pn(e){const t=[];for(let r=0;r<e.length;++r)t[r]=e[r].zt();return t}gn(e,t,r){const s=[...e],i=[];for(const o of r.arrayValue.values||[])for(const a of s){const l=new Hs;l.seed(a.zt()),jn.vt.It(o,l.Yt(t.kind)),i.push(l)}return i}fn(e,t){return!!e.filters.find(r=>r instanceof te&&r.field.isEqual(t)&&(r.op==="in"||r.op==="not-in"))}getFieldIndexes(e,t){const r=zs(e),s=kr(e);return(t?r.U("collectionGroupIndex",IDBKeyRange.bound(t,t)):r.U()).next(i=>{const o=[];return S.forEach(i,a=>s.get([a.indexId,this.uid]).next(l=>{o.push(function(d,f){const _=f?new Ai(f.sequenceNumber,new ht(cr(f.readTime),new M(wt(f.documentKey)),f.largestBatchId)):Ai.empty(),g=d.fields.map(([w,D])=>new Qo(ye.fromServerFormat(w),D));return new da(d.indexId,d.collectionGroup,g,_)}(a,l))})).next(()=>o)})}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next(t=>t.length===0?null:(t.sort((r,s)=>{const i=r.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:K(r.collectionGroup,s.collectionGroup)}),t[0].collectionGroup))}updateCollectionGroup(e,t,r){const s=zs(e),i=kr(e);return this.yn(e).next(o=>s.U("collectionGroupIndex",IDBKeyRange.bound(t,t)).next(a=>S.forEach(a,l=>i.put(Mp(l.indexId,this.uid,o,r)))))}updateIndexEntries(e,t){const r=new Map;return S.forEach(t,(s,i)=>{const o=r.get(s.collectionGroup);return(o?S.resolve(o):this.getFieldIndexes(e,s.collectionGroup)).next(a=>(r.set(s.collectionGroup,a),S.forEach(a,l=>this.wn(e,s,l).next(u=>{const d=this.Sn(i,l);return u.isEqual(d)?S.resolve():this.bn(e,i,l,u,d)}))))})}Dn(e,t,r,s){return Dr(e).put({indexId:s.indexId,uid:this.uid,arrayValue:s.arrayValue,directionalValue:s.directionalValue,orderedDocumentKey:this.mn(r,t.key),documentKey:t.key.path.toArray()})}vn(e,t,r,s){return Dr(e).delete([s.indexId,this.uid,s.arrayValue,s.directionalValue,this.mn(r,t.key),t.key.path.toArray()])}wn(e,t,r){const s=Dr(e);let i=new ce(rn);return s.J({index:"documentKeyIndex",range:IDBKeyRange.only([r.indexId,this.uid,this.mn(r,t)])},(o,a)=>{i=i.add(new Wn(r.indexId,t,a.arrayValue,a.directionalValue))}).next(()=>i)}Sn(e,t){let r=new ce(rn);const s=this.Vn(t,e);if(s==null)return r;const i=xl(t);if(i!=null){const o=e.data.field(i.fieldPath);if(Pi(o))for(const a of o.arrayValue.values||[])r=r.add(new Wn(t.indexId,e.key,this.dn(a),s))}else r=r.add(new Wn(t.indexId,e.key,Mo,s));return r}bn(e,t,r,s,i){k("IndexedDbIndexManager","Updating index entries for document '%s'",t.key);const o=[];return function(l,u,d,f,_){const g=l.getIterator(),w=u.getIterator();let D=Nr(g),P=Nr(w);for(;D||P;){let B=!1,$=!1;if(D&&P){const L=d(D,P);L<0?$=!0:L>0&&(B=!0)}else D!=null?$=!0:B=!0;B?(f(P),P=Nr(w)):$?(_(D),D=Nr(g)):(D=Nr(g),P=Nr(w))}}(s,i,rn,a=>{o.push(this.Dn(e,t,r,a))},a=>{o.push(this.vn(e,t,r,a))}),S.waitFor(o)}yn(e){let t=1;return kr(e).J({index:"sequenceNumberIndex",reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(r,s,i)=>{i.done(),t=s.sequenceNumber+1}).next(()=>t)}createRange(e,t,r){r=r.sort((o,a)=>rn(o,a)).filter((o,a,l)=>!a||rn(o,l[a-1])!==0);const s=[];s.push(e);for(const o of r){const a=rn(o,e),l=rn(o,t);if(a===0)s[0]=e.Zt();else if(a>0&&l<0)s.push(o),s.push(o.Zt());else if(l>0)break}s.push(t);const i=[];for(let o=0;o<s.length;o+=2){if(this.Cn(s[o],s[o+1]))return[];const a=[s[o].indexId,this.uid,s[o].arrayValue,s[o].directionalValue,Mo,[]],l=[s[o+1].indexId,this.uid,s[o+1].arrayValue,s[o+1].directionalValue,Mo,[]];i.push(IDBKeyRange.bound(a,l))}return i}Cn(e,t){return rn(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(Wp)}getMinOffset(e,t){return S.mapArray(this.hn(t),r=>this.Pn(e,r).next(s=>s||U())).next(Wp)}}function jp(n){return De(n,"collectionParents")}function Dr(n){return De(n,"indexEntries")}function zs(n){return De(n,"indexConfiguration")}function kr(n){return De(n,"indexState")}function Wp(n){q(n.length!==0);let e=n[0].indexState.offset,t=e.largestBatchId;for(let r=1;r<n.length;r++){const s=n[r].indexState.offset;Mu(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new ht(e.readTime,e.documentKey,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gp={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0};class tt{constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}static withCacheSize(e){return new tt(e,tt.DEFAULT_COLLECTION_PERCENTILE,tt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function by(n,e,t){const r=n.store("mutations"),s=n.store("documentMutations"),i=[],o=IDBKeyRange.only(t.batchId);let a=0;const l=r.J({range:o},(d,f,_)=>(a++,_.delete()));i.push(l.next(()=>{q(a===1)}));const u=[];for(const d of t.mutations){const f=Rg(e,d.key.path,t.batchId);i.push(s.delete(f)),u.push(d.key)}return S.waitFor(i).next(()=>u)}function va(n){if(!n)return 0;let e;if(n.document)e=n.document;else if(n.unknownDocument)e=n.unknownDocument;else{if(!n.noDocument)throw U();e=n.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */tt.DEFAULT_COLLECTION_PERCENTILE=10,tt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,tt.DEFAULT=new tt(41943040,tt.DEFAULT_COLLECTION_PERCENTILE,tt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),tt.DISABLED=new tt(-1,0,0);class tc{constructor(e,t,r,s){this.userId=e,this.serializer=t,this.indexManager=r,this.referenceDelegate=s,this.Fn={}}static lt(e,t,r,s){q(e.uid!=="");const i=e.isAuthenticated()?e.uid:"";return new tc(i,t,r,s)}checkEmpty(e){let t=!0;const r=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return sn(e).J({index:"userMutationsIndex",range:r},(s,i,o)=>{t=!1,o.done()}).next(()=>t)}addMutationBatch(e,t,r,s){const i=Ur(e),o=sn(e);return o.add({}).next(a=>{q(typeof a=="number");const l=new Wu(a,t,r,s),u=function(g,w,D){const P=D.baseMutations.map($=>ga(g.ct,$)),B=D.mutations.map($=>ga(g.ct,$));return{userId:w,batchId:D.batchId,localWriteTimeMs:D.localWriteTime.toMillis(),baseMutations:P,mutations:B}}(this.serializer,this.userId,l),d=[];let f=new ce((_,g)=>K(_.canonicalString(),g.canonicalString()));for(const _ of s){const g=Rg(this.userId,_.key.path,a);f=f.add(_.key.path.popLast()),d.push(o.put(u)),d.push(i.put(g,Qb))}return f.forEach(_=>{d.push(this.indexManager.addToCollectionParentIndex(e,_))}),e.addOnCommittedListener(()=>{this.Fn[a]=l.keys()}),S.waitFor(d).next(()=>l)})}lookupMutationBatch(e,t){return sn(e).get(t).next(r=>r?(q(r.userId===this.userId),qn(this.serializer,r)):null)}Mn(e,t){return this.Fn[t]?S.resolve(this.Fn[t]):this.lookupMutationBatch(e,t).next(r=>{if(r){const s=r.keys();return this.Fn[t]=s,s}return null})}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=IDBKeyRange.lowerBound([this.userId,r]);let i=null;return sn(e).J({index:"userMutationsIndex",range:s},(o,a,l)=>{a.userId===this.userId&&(q(a.batchId>=r),i=qn(this.serializer,a)),l.done()}).next(()=>i)}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let r=-1;return sn(e).J({index:"userMutationsIndex",range:t,reverse:!0},(s,i,o)=>{r=i.batchId,o.done()}).next(()=>r)}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,-1],[this.userId,Number.POSITIVE_INFINITY]);return sn(e).U("userMutationsIndex",t).next(r=>r.map(s=>qn(this.serializer,s)))}getAllMutationBatchesAffectingDocumentKey(e,t){const r=Yo(this.userId,t.path),s=IDBKeyRange.lowerBound(r),i=[];return Ur(e).J({range:s},(o,a,l)=>{const[u,d,f]=o,_=wt(d);if(u===this.userId&&t.path.isEqual(_))return sn(e).get(f).next(g=>{if(!g)throw U();q(g.userId===this.userId),i.push(qn(this.serializer,g))});l.done()}).next(()=>i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ce(K);const s=[];return t.forEach(i=>{const o=Yo(this.userId,i.path),a=IDBKeyRange.lowerBound(o),l=Ur(e).J({range:a},(u,d,f)=>{const[_,g,w]=u,D=wt(g);_===this.userId&&i.path.isEqual(D)?r=r.add(w):f.done()});s.push(l)}),S.waitFor(s).next(()=>this.xn(e,r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1,i=Yo(this.userId,r),o=IDBKeyRange.lowerBound(i);let a=new ce(K);return Ur(e).J({range:o},(l,u,d)=>{const[f,_,g]=l,w=wt(_);f===this.userId&&r.isPrefixOf(w)?w.length===s&&(a=a.add(g)):d.done()}).next(()=>this.xn(e,a))}xn(e,t){const r=[],s=[];return t.forEach(i=>{s.push(sn(e).get(i).next(o=>{if(o===null)throw U();q(o.userId===this.userId),r.push(qn(this.serializer,o))}))}),S.waitFor(s).next(()=>r)}removeMutationBatch(e,t){return by(e._e,this.userId,t).next(r=>(e.addOnCommittedListener(()=>{this.On(t.batchId)}),S.forEach(r,s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))}On(e){delete this.Fn[e]}performConsistencyCheck(e){return this.checkEmpty(e).next(t=>{if(!t)return S.resolve();const r=IDBKeyRange.lowerBound(function(o){return[o]}(this.userId)),s=[];return Ur(e).J({range:r},(i,o,a)=>{if(i[0]===this.userId){const l=wt(i[1]);s.push(l)}else a.done()}).next(()=>{q(s.length===0)})})}containsKey(e,t){return Sy(e,this.userId,t)}Nn(e){return Ry(e).get(this.userId).next(t=>t||{userId:this.userId,lastAcknowledgedBatchId:-1,lastStreamToken:""})}}function Sy(n,e,t){const r=Yo(e,t.path),s=r[1],i=IDBKeyRange.lowerBound(r);let o=!1;return Ur(n).J({range:i,H:!0},(a,l,u)=>{const[d,f,_]=a;d===e&&f===s&&(o=!0),u.done()}).next(()=>o)}function sn(n){return De(n,"mutations")}function Ur(n){return De(n,"documentMutations")}function Ry(n){return De(n,"mutationQueues")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lr{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new lr(0)}static kn(){return new lr(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pR{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.qn(e).next(t=>{const r=new lr(t.highestTargetId);return t.highestTargetId=r.next(),this.Qn(e,t).next(()=>t.highestTargetId)})}getLastRemoteSnapshotVersion(e){return this.qn(e).next(t=>W.fromTimestamp(new ve(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(e){return this.qn(e).next(t=>t.highestListenSequenceNumber)}setTargetsMetadata(e,t,r){return this.qn(e).next(s=>(s.highestListenSequenceNumber=t,r&&(s.lastRemoteSnapshotVersion=r.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.Qn(e,s)))}addTargetData(e,t){return this.Kn(e,t).next(()=>this.qn(e).next(r=>(r.targetCount+=1,this.$n(t,r),this.Qn(e,r))))}updateTargetData(e,t){return this.Kn(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next(()=>xr(e).delete(t.targetId)).next(()=>this.qn(e)).next(r=>(q(r.targetCount>0),r.targetCount-=1,this.Qn(e,r)))}removeTargets(e,t,r){let s=0;const i=[];return xr(e).J((o,a)=>{const l=oi(a);l.sequenceNumber<=t&&r.get(l.targetId)===null&&(s++,i.push(this.removeTargetData(e,l)))}).next(()=>S.waitFor(i)).next(()=>s)}forEachTarget(e,t){return xr(e).J((r,s)=>{const i=oi(s);t(i)})}qn(e){return Hp(e).get("targetGlobalKey").next(t=>(q(t!==null),t))}Qn(e,t){return Hp(e).put("targetGlobalKey",t)}Kn(e,t){return xr(e).put(Iy(this.serializer,t))}$n(e,t){let r=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,r=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,r=!0),r}getTargetCount(e){return this.qn(e).next(t=>t.targetCount)}getTargetData(e,t){const r=sr(t),s=IDBKeyRange.bound([r,Number.NEGATIVE_INFINITY],[r,Number.POSITIVE_INFINITY]);let i=null;return xr(e).J({range:s,index:"queryTargetsIndex"},(o,a,l)=>{const u=oi(a);Ki(t,u.target)&&(i=u,l.done())}).next(()=>i)}addMatchingKeys(e,t,r){const s=[],i=hn(e);return t.forEach(o=>{const a=Xe(o.path);s.push(i.put({targetId:r,path:a})),s.push(this.referenceDelegate.addReference(e,r,o))}),S.waitFor(s)}removeMatchingKeys(e,t,r){const s=hn(e);return S.forEach(t,i=>{const o=Xe(i.path);return S.waitFor([s.delete([r,o]),this.referenceDelegate.removeReference(e,r,i)])})}removeMatchingKeysForTargetId(e,t){const r=hn(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return r.delete(s)}getMatchingKeysForTargetId(e,t){const r=IDBKeyRange.bound([t],[t+1],!1,!0),s=hn(e);let i=Q();return s.J({range:r,H:!0},(o,a,l)=>{const u=wt(o[1]),d=new M(u);i=i.add(d)}).next(()=>i)}containsKey(e,t){const r=Xe(t.path),s=IDBKeyRange.bound([r],[vg(r)],!1,!0);let i=0;return hn(e).J({index:"documentTargetsIndex",H:!0,range:s},([o,a],l,u)=>{o!==0&&(i++,u.done())}).next(()=>i>0)}ot(e,t){return xr(e).get(t).next(r=>r?oi(r):null)}}function xr(n){return De(n,"targets")}function Hp(n){return De(n,"targetGlobal")}function hn(n){return De(n,"targetDocuments")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zp([n,e],[t,r]){const s=K(n,t);return s===0?K(e,r):s}class _R{constructor(e){this.Un=e,this.buffer=new ce(zp),this.Wn=0}Gn(){return++this.Wn}zn(e){const t=[e,this.Gn()];if(this.buffer.size<this.Un)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();zp(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class mR{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.jn=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Hn(6e4)}stop(){this.jn&&(this.jn.cancel(),this.jn=null)}get started(){return this.jn!==null}Hn(e){k("LruGarbageCollector",`Garbage collection scheduled in ${e}ms`),this.jn=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.jn=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Pn(t)?k("LruGarbageCollector","Ignoring IndexedDB error during garbage collection: ",t):await Cn(t)}await this.Hn(3e5)})}}class gR{constructor(e,t){this.Jn=e,this.params=t}calculateTargetCount(e,t){return this.Jn.Yn(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return S.resolve(rt.oe);const r=new _R(t);return this.Jn.forEachTarget(e,s=>r.zn(s.sequenceNumber)).next(()=>this.Jn.Zn(e,s=>r.zn(s))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.Jn.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.Jn.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(k("LruGarbageCollector","Garbage collection skipped; disabled"),S.resolve(Gp)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(k("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Gp):this.Xn(e,t))}getCacheSize(e){return this.Jn.getCacheSize(e)}Xn(e,t){let r,s,i,o,a,l,u;const d=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(f=>(f>this.params.maximumSequenceNumbersToCollect?(k("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${f}`),s=this.params.maximumSequenceNumbersToCollect):s=f,o=Date.now(),this.nthSequenceNumber(e,s))).next(f=>(r=f,a=Date.now(),this.removeTargets(e,r,t))).next(f=>(i=f,l=Date.now(),this.removeOrphanedDocuments(e,r))).next(f=>(u=Date.now(),Mr()<=ee.DEBUG&&k("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-d}ms
	Determined least recently used ${s} in `+(a-o)+`ms
	Removed ${i} targets in `+(l-a)+`ms
	Removed ${f} documents in `+(u-l)+`ms
Total Duration: ${u-d}ms`),S.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:f})))}}function yR(n,e){return new gR(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ER{constructor(e,t){this.db=e,this.garbageCollector=yR(this,t)}Yn(e){const t=this.er(e);return this.db.getTargetCache().getTargetCount(e).next(r=>t.next(s=>r+s))}er(e){let t=0;return this.Zn(e,r=>{t++}).next(()=>t)}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}Zn(e,t){return this.tr(e,(r,s)=>t(s))}addReference(e,t,r){return Lo(e,r)}removeReference(e,t,r){return Lo(e,r)}removeTargets(e,t,r){return this.db.getTargetCache().removeTargets(e,t,r)}markPotentiallyOrphaned(e,t){return Lo(e,t)}nr(e,t){return function(s,i){let o=!1;return Ry(s).Y(a=>Sy(s,a,i).next(l=>(l&&(o=!0),S.resolve(!l)))).next(()=>o)}(e,t)}removeOrphanedDocuments(e,t){const r=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.tr(e,(o,a)=>{if(a<=t){const l=this.nr(e,o).next(u=>{if(!u)return i++,r.getEntry(e,o).next(()=>(r.removeEntry(o,W.min()),hn(e).delete(function(f){return[0,Xe(f.path)]}(o))))});s.push(l)}}).next(()=>S.waitFor(s)).next(()=>r.apply(e)).next(()=>i)}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,r)}updateLimboDocument(e,t){return Lo(e,t)}tr(e,t){const r=hn(e);let s,i=rt.oe;return r.J({index:"documentTargetsIndex"},([o,a],{path:l,sequenceNumber:u})=>{o===0?(i!==rt.oe&&t(new M(wt(s)),i),i=u,s=l):i=rt.oe}).next(()=>{i!==rt.oe&&t(new M(wt(s)),i)})}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function Lo(n,e){return hn(n).put(function(r,s){return{targetId:0,path:Xe(r.path),sequenceNumber:s}}(e,n.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cy{constructor(){this.changes=new Nn(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Ae.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?S.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vR{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,r){return Ln(e).put(r)}removeEntry(e,t,r){return Ln(e).delete(function(i,o){const a=i.path.toArray();return[a.slice(0,a.length-2),a[a.length-2],ya(o),a[a.length-1]]}(t,r))}updateMetadata(e,t){return this.getMetadata(e).next(r=>(r.byteSize+=t,this.rr(e,r)))}getEntry(e,t){let r=Ae.newInvalidDocument(t);return Ln(e).J({index:"documentKeyIndex",range:IDBKeyRange.only(Ks(t))},(s,i)=>{r=this.ir(t,i)}).next(()=>r)}sr(e,t){let r={size:0,document:Ae.newInvalidDocument(t)};return Ln(e).J({index:"documentKeyIndex",range:IDBKeyRange.only(Ks(t))},(s,i)=>{r={document:this.ir(t,i),size:va(i)}}).next(()=>r)}getEntries(e,t){let r=ct();return this._r(e,t,(s,i)=>{const o=this.ir(s,i);r=r.insert(s,o)}).next(()=>r)}ar(e,t){let r=ct(),s=new Ie(M.comparator);return this._r(e,t,(i,o)=>{const a=this.ir(i,o);r=r.insert(i,a),s=s.insert(i,va(o))}).next(()=>({documents:r,ur:s}))}_r(e,t,r){if(t.isEmpty())return S.resolve();let s=new ce(Yp);t.forEach(l=>s=s.add(l));const i=IDBKeyRange.bound(Ks(s.first()),Ks(s.last())),o=s.getIterator();let a=o.getNext();return Ln(e).J({index:"documentKeyIndex",range:i},(l,u,d)=>{const f=M.fromSegments([...u.prefixPath,u.collectionGroup,u.documentId]);for(;a&&Yp(a,f)<0;)r(a,null),a=o.getNext();a&&a.isEqual(f)&&(r(a,u),a=o.hasNext()?o.getNext():null),a?d.$(Ks(a)):d.done()}).next(()=>{for(;a;)r(a,null),a=o.hasNext()?o.getNext():null})}getDocumentsMatchingQuery(e,t,r,s,i){const o=t.path,a=[o.popLast().toArray(),o.lastSegment(),ya(r.readTime),r.documentKey.path.isEmpty()?"":r.documentKey.path.lastSegment()],l=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return Ln(e).U(IDBKeyRange.bound(a,l,!0)).next(u=>{i==null||i.incrementDocumentReadCount(u.length);let d=ct();for(const f of u){const _=this.ir(M.fromSegments(f.prefixPath.concat(f.collectionGroup,f.documentId)),f);_.isFoundDocument()&&(Yi(t,_)||s.has(_.key))&&(d=d.insert(_.key,_))}return d})}getAllFromCollectionGroup(e,t,r,s){let i=ct();const o=Qp(t,r),a=Qp(t,ht.max());return Ln(e).J({index:"collectionGroupIndex",range:IDBKeyRange.bound(o,a,!0)},(l,u,d)=>{const f=this.ir(M.fromSegments(u.prefixPath.concat(u.collectionGroup,u.documentId)),u);i=i.insert(f.key,f),i.size===s&&d.done()}).next(()=>i)}newChangeBuffer(e){return new IR(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next(t=>t.byteSize)}getMetadata(e){return Kp(e).get("remoteDocumentGlobalKey").next(t=>(q(!!t),t))}rr(e,t){return Kp(e).put("remoteDocumentGlobalKey",t)}ir(e,t){if(t){const r=sR(this.serializer,t);if(!(r.isNoDocument()&&r.version.isEqual(W.min())))return r}return Ae.newInvalidDocument(e)}}function Py(n){return new vR(n)}class IR extends Cy{constructor(e,t){super(),this.cr=e,this.trackRemovals=t,this.lr=new Nn(r=>r.toString(),(r,s)=>r.isEqual(s))}applyChanges(e){const t=[];let r=0,s=new ce((i,o)=>K(i.canonicalString(),o.canonicalString()));return this.changes.forEach((i,o)=>{const a=this.lr.get(i);if(t.push(this.cr.removeEntry(e,i,a.readTime)),o.isValidDocument()){const l=Op(this.cr.serializer,o);s=s.add(i.path.popLast());const u=va(l);r+=u-a.size,t.push(this.cr.addEntry(e,i,l))}else if(r-=a.size,this.trackRemovals){const l=Op(this.cr.serializer,o.convertToNoDocument(W.min()));t.push(this.cr.addEntry(e,i,l))}}),s.forEach(i=>{t.push(this.cr.indexManager.addToCollectionParentIndex(e,i))}),t.push(this.cr.updateMetadata(e,r)),S.waitFor(t)}getFromCache(e,t){return this.cr.sr(e,t).next(r=>(this.lr.set(t,{size:r.size,readTime:r.document.readTime}),r.document))}getAllFromCache(e,t){return this.cr.ar(e,t).next(({documents:r,ur:s})=>(s.forEach((i,o)=>{this.lr.set(i,{size:o,readTime:r.get(i).readTime})}),r))}}function Kp(n){return De(n,"remoteDocumentGlobal")}function Ln(n){return De(n,"remoteDocumentsV14")}function Ks(n){const e=n.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Qp(n,e){const t=e.documentKey.path.toArray();return[n,ya(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Yp(n,e){const t=n.path.toArray(),r=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<r.length-2;++i)if(s=K(t[i],r[i]),s)return s;return s=K(t.length,r.length),s||(s=K(t[t.length-2],r[r.length-2]),s||K(t[t.length-1],r[r.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TR{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ny{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&fi(r.mutation,s,st.empty(),ve.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,Q()).next(()=>r))}getLocalViewOfDocuments(e,t,r=Q()){const s=At();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let o=si();return i.forEach((a,l)=>{o=o.insert(a,l.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const r=At();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,Q()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((o,a)=>{t.set(o,a)})})}computeViews(e,t,r,s){let i=ct();const o=di(),a=function(){return di()}();return t.forEach((l,u)=>{const d=r.get(u.key);s.has(u.key)&&(d===void 0||d.mutation instanceof Jt)?i=i.insert(u.key,u):d!==void 0?(o.set(u.key,d.mutation.getFieldMask()),fi(d.mutation,u,d.mutation.getFieldMask(),ve.now())):o.set(u.key,st.empty())}),this.recalculateAndSaveOverlays(e,i).next(l=>(l.forEach((u,d)=>o.set(u,d)),t.forEach((u,d)=>{var f;return a.set(u,new TR(d,(f=o.get(u))!==null&&f!==void 0?f:null))}),a))}recalculateAndSaveOverlays(e,t){const r=di();let s=new Ie((o,a)=>o-a),i=Q();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const a of o)a.keys().forEach(l=>{const u=t.get(l);if(u===null)return;let d=r.get(l)||st.empty();d=a.applyToLocalView(u,d),r.set(l,d);const f=(s.get(a.batchId)||Q()).add(l);s=s.insert(a.batchId,f)})}).next(()=>{const o=[],a=s.getReverseIterator();for(;a.hasNext();){const l=a.getNext(),u=l.key,d=l.value,f=Jg();d.forEach(_=>{if(!i.has(_)){const g=sy(t.get(_),r.get(_));g!==null&&f.set(_,g),i=i.add(_)}}),o.push(this.documentOverlayCache.saveOverlays(e,u,f))}return S.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(o){return M.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Wg(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):S.resolve(At());let a=-1,l=i;return o.next(u=>S.forEach(u,(d,f)=>(a<f.largestBatchId&&(a=f.largestBatchId),i.get(d)?S.resolve():this.remoteDocumentCache.getEntry(e,d).next(_=>{l=l.insert(d,_)}))).next(()=>this.populateOverlays(e,u,i)).next(()=>this.computeViews(e,l,u,Q())).next(d=>({batchId:a,changes:Yg(d)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new M(t)).next(r=>{let s=si();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let o=si();return this.indexManager.getCollectionParents(e,i).next(a=>S.forEach(a,l=>{const u=function(f,_){return new yr(_,null,f.explicitOrderBy.slice(),f.filters.slice(),f.limit,f.limitType,f.startAt,f.endAt)}(t,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,u,r,s).next(d=>{d.forEach((f,_)=>{o=o.insert(f,_)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(o=>{i.forEach((l,u)=>{const d=u.getKey();o.get(d)===null&&(o=o.insert(d,Ae.newInvalidDocument(d)))});let a=si();return o.forEach((l,u)=>{const d=i.get(l);d!==void 0&&fi(d.mutation,u,st.empty(),ve.now()),Yi(t,u)&&(a=a.insert(l,u))}),a})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wR{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return S.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:Ze(s.createTime)}}(t)),S.resolve()}getNamedQuery(e,t){return S.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(s){return{name:s.name,query:Ty(s.bundledQuery),readTime:Ze(s.readTime)}}(t)),S.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AR{constructor(){this.overlays=new Ie(M.comparator),this.Ir=new Map}getOverlay(e,t){return S.resolve(this.overlays.get(t))}getOverlays(e,t){const r=At();return S.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.ht(e,t,i)}),S.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),S.resolve()}getOverlaysForCollection(e,t,r){const s=At(),i=t.length+1,o=new M(t.child("")),a=this.overlays.getIteratorFrom(o);for(;a.hasNext();){const l=a.getNext().value,u=l.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===i&&l.largestBatchId>r&&s.set(l.getKey(),l)}return S.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new Ie((u,d)=>u-d);const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>r){let d=i.get(u.largestBatchId);d===null&&(d=At(),i=i.insert(u.largestBatchId,d)),d.set(u.getKey(),u)}}const a=At(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((u,d)=>a.set(u,d)),!(a.size()>=s)););return S.resolve(a)}ht(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new Hu(t,r));let i=this.Ir.get(t);i===void 0&&(i=Q(),this.Ir.set(t,i)),this.Ir.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bR{constructor(){this.sessionToken=Re.EMPTY_BYTE_STRING}getSessionToken(e){return S.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,S.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xu{constructor(){this.Tr=new ce(xe.Er),this.dr=new ce(xe.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new xe(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Vr(new xe(e,t))}mr(e,t){e.forEach(r=>this.removeReference(r,t))}gr(e){const t=new M(new se([])),r=new xe(t,e),s=new xe(t,e+1),i=[];return this.dr.forEachInRange([r,s],o=>{this.Vr(o),i.push(o.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new M(new se([])),r=new xe(t,e),s=new xe(t,e+1);let i=Q();return this.dr.forEachInRange([r,s],o=>{i=i.add(o.key)}),i}containsKey(e){const t=new xe(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class xe{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return M.comparator(e.key,t.key)||K(e.wr,t.wr)}static Ar(e,t){return K(e.wr,t.wr)||M.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class SR{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new ce(xe.Er)}checkEmpty(e){return S.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new Wu(i,t,r,s);this.mutationQueue.push(o);for(const a of s)this.br=this.br.add(new xe(a.key,i)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return S.resolve(o)}lookupMutationBatch(e,t){return S.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.vr(r),i=s<0?0:s;return S.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return S.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return S.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new xe(t,0),s=new xe(t,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],o=>{const a=this.Dr(o.wr);i.push(a)}),S.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ce(K);return t.forEach(s=>{const i=new xe(s,0),o=new xe(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,o],a=>{r=r.add(a.wr)})}),S.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;M.isDocumentKey(i)||(i=i.child(""));const o=new xe(new M(i),0);let a=new ce(K);return this.br.forEachWhile(l=>{const u=l.key.path;return!!r.isPrefixOf(u)&&(u.length===s&&(a=a.add(l.wr)),!0)},o),S.resolve(this.Cr(a))}Cr(e){const t=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){q(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return S.forEach(t.mutations,s=>{const i=new xe(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,t){const r=new xe(t,0),s=this.br.firstAfterOrEqual(r);return S.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,S.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RR{constructor(e){this.Mr=e,this.docs=function(){return new Ie(M.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,o=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return S.resolve(r?r.document.mutableCopy():Ae.newInvalidDocument(t))}getEntries(e,t){let r=ct();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Ae.newInvalidDocument(s))}),S.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let i=ct();const o=t.path,a=new M(o.child("")),l=this.docs.getIteratorFrom(a);for(;l.hasNext();){const{key:u,value:{document:d}}=l.getNext();if(!o.isPrefixOf(u.path))break;u.path.length>o.length+1||Mu(Tg(d),r)<=0||(s.has(d.key)||Yi(t,d))&&(i=i.insert(d.key,d.mutableCopy()))}return S.resolve(i)}getAllFromCollectionGroup(e,t,r,s){U()}Or(e,t){return S.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new CR(this)}getSize(e){return S.resolve(this.size)}}class CR extends Cy{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),S.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PR{constructor(e){this.persistence=e,this.Nr=new Nn(t=>sr(t),Ki),this.lastRemoteSnapshotVersion=W.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Xu,this.targetCount=0,this.kr=lr.Bn()}forEachTarget(e,t){return this.Nr.forEach((r,s)=>t(s)),S.resolve()}getLastRemoteSnapshotVersion(e){return S.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return S.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),S.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),S.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new lr(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,S.resolve()}updateTargetData(e,t){return this.Kn(t),S.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,S.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.Nr.forEach((o,a)=>{a.sequenceNumber<=t&&r.get(a.targetId)===null&&(this.Nr.delete(o),i.push(this.removeMatchingKeysForTargetId(e,a.targetId)),s++)}),S.waitFor(i).next(()=>s)}getTargetCount(e){return S.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return S.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),S.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(o=>{i.push(s.markPotentiallyOrphaned(e,o))}),S.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),S.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return S.resolve(r)}containsKey(e,t){return S.resolve(this.Br.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dy{constructor(e,t){this.qr={},this.overlays={},this.Qr=new rt(0),this.Kr=!1,this.Kr=!0,this.$r=new bR,this.referenceDelegate=e(this),this.Ur=new PR(this),this.indexManager=new dR,this.remoteDocumentCache=function(s){return new RR(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new vy(t),this.Gr=new wR(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new AR,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new SR(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){k("MemoryPersistence","Starting transaction:",e);const s=new NR(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,t){return S.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,t)))}}class NR extends Ag{constructor(e){super(),this.currentSequenceNumber=e}}class nc{constructor(e){this.persistence=e,this.Jr=new Xu,this.Yr=null}static Zr(e){return new nc(e)}get Xr(){if(this.Yr)return this.Yr;throw U()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),S.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),S.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),S.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return S.forEach(this.Xr,r=>{const s=M.fromPath(r);return this.ei(e,s).next(i=>{i||t.removeEntry(s,W.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return S.or([()=>S.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DR{constructor(e){this.serializer=e}O(e,t,r,s){const i=new Ka("createOrUpgrade",t);r<1&&s>=1&&(function(l){l.createObjectStore("owner")}(e),function(l){l.createObjectStore("mutationQueues",{keyPath:"userId"}),l.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",up,{unique:!0}),l.createObjectStore("documentMutations")}(e),Jp(e),function(l){l.createObjectStore("remoteDocuments")}(e));let o=S.resolve();return r<3&&s>=3&&(r!==0&&(function(l){l.deleteObjectStore("targetDocuments"),l.deleteObjectStore("targets"),l.deleteObjectStore("targetGlobal")}(e),Jp(e)),o=o.next(()=>function(l){const u=l.store("targetGlobal"),d={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:W.min().toTimestamp(),targetCount:0};return u.put("targetGlobalKey",d)}(i))),r<4&&s>=4&&(r!==0&&(o=o.next(()=>function(l,u){return u.store("mutations").U().next(d=>{l.deleteObjectStore("mutations"),l.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",up,{unique:!0});const f=u.store("mutations"),_=d.map(g=>f.put(g));return S.waitFor(_)})}(e,i))),o=o.next(()=>{(function(l){l.createObjectStore("clientMetadata",{keyPath:"clientId"})})(e)})),r<5&&s>=5&&(o=o.next(()=>this.ni(i))),r<6&&s>=6&&(o=o.next(()=>(function(l){l.createObjectStore("remoteDocumentGlobal")}(e),this.ri(i)))),r<7&&s>=7&&(o=o.next(()=>this.ii(i))),r<8&&s>=8&&(o=o.next(()=>this.si(e,i))),r<9&&s>=9&&(o=o.next(()=>{(function(l){l.objectStoreNames.contains("remoteDocumentChanges")&&l.deleteObjectStore("remoteDocumentChanges")})(e)})),r<10&&s>=10&&(o=o.next(()=>this.oi(i))),r<11&&s>=11&&(o=o.next(()=>{(function(l){l.createObjectStore("bundles",{keyPath:"bundleId"})})(e),function(l){l.createObjectStore("namedQueries",{keyPath:"name"})}(e)})),r<12&&s>=12&&(o=o.next(()=>{(function(l){const u=l.createObjectStore("documentOverlays",{keyPath:aS});u.createIndex("collectionPathOverlayIndex",cS,{unique:!1}),u.createIndex("collectionGroupOverlayIndex",lS,{unique:!1})})(e)})),r<13&&s>=13&&(o=o.next(()=>function(l){const u=l.createObjectStore("remoteDocumentsV14",{keyPath:Yb});u.createIndex("documentKeyIndex",Jb),u.createIndex("collectionGroupIndex",Xb)}(e)).next(()=>this._i(e,i)).next(()=>e.deleteObjectStore("remoteDocuments"))),r<14&&s>=14&&(o=o.next(()=>this.ai(e,i))),r<15&&s>=15&&(o=o.next(()=>function(l){l.createObjectStore("indexConfiguration",{keyPath:"indexId",autoIncrement:!0}).createIndex("collectionGroupIndex","collectionGroup",{unique:!1}),l.createObjectStore("indexState",{keyPath:rS}).createIndex("sequenceNumberIndex",sS,{unique:!1}),l.createObjectStore("indexEntries",{keyPath:iS}).createIndex("documentKeyIndex",oS,{unique:!1})}(e))),r<16&&s>=16&&(o=o.next(()=>{t.objectStore("indexState").clear()}).next(()=>{t.objectStore("indexEntries").clear()})),r<17&&s>=17&&(o=o.next(()=>{(function(l){l.createObjectStore("globals",{keyPath:"name"})})(e)})),o}ri(e){let t=0;return e.store("remoteDocuments").J((r,s)=>{t+=va(s)}).next(()=>{const r={byteSize:t};return e.store("remoteDocumentGlobal").put("remoteDocumentGlobalKey",r)})}ni(e){const t=e.store("mutationQueues"),r=e.store("mutations");return t.U().next(s=>S.forEach(s,i=>{const o=IDBKeyRange.bound([i.userId,-1],[i.userId,i.lastAcknowledgedBatchId]);return r.U("userMutationsIndex",o).next(a=>S.forEach(a,l=>{q(l.userId===i.userId);const u=qn(this.serializer,l);return by(e,i.userId,u).next(()=>{})}))}))}ii(e){const t=e.store("targetDocuments"),r=e.store("remoteDocuments");return e.store("targetGlobal").get("targetGlobalKey").next(s=>{const i=[];return r.J((o,a)=>{const l=new se(o),u=function(f){return[0,Xe(f)]}(l);i.push(t.get(u).next(d=>d?S.resolve():(f=>t.put({targetId:0,path:Xe(f),sequenceNumber:s.highestListenSequenceNumber}))(l)))}).next(()=>S.waitFor(i))})}si(e,t){e.createObjectStore("collectionParents",{keyPath:nS});const r=t.store("collectionParents"),s=new Ju,i=o=>{if(s.add(o)){const a=o.lastSegment(),l=o.popLast();return r.put({collectionId:a,parent:Xe(l)})}};return t.store("remoteDocuments").J({H:!0},(o,a)=>{const l=new se(o);return i(l.popLast())}).next(()=>t.store("documentMutations").J({H:!0},([o,a,l],u)=>{const d=wt(a);return i(d.popLast())}))}oi(e){const t=e.store("targets");return t.J((r,s)=>{const i=oi(s),o=Iy(this.serializer,i);return t.put(o)})}_i(e,t){const r=t.store("remoteDocuments"),s=[];return r.J((i,o)=>{const a=t.store("remoteDocumentsV14"),l=function(f){return f.document?new M(se.fromString(f.document.name).popFirst(5)):f.noDocument?M.fromSegments(f.noDocument.path):f.unknownDocument?M.fromSegments(f.unknownDocument.path):U()}(o).path.toArray(),u={prefixPath:l.slice(0,l.length-2),collectionGroup:l[l.length-2],documentId:l[l.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};s.push(a.put(u))}).next(()=>S.waitFor(s))}ai(e,t){const r=t.store("mutations"),s=Py(this.serializer),i=new Dy(nc.Zr,this.serializer.ct);return r.U().next(o=>{const a=new Map;return o.forEach(l=>{var u;let d=(u=a.get(l.userId))!==null&&u!==void 0?u:Q();qn(this.serializer,l).keys().forEach(f=>d=d.add(f)),a.set(l.userId,d)}),S.forEach(a,(l,u)=>{const d=new Oe(u),f=ec.lt(this.serializer,d),_=i.getIndexManager(d),g=tc.lt(d,this.serializer,_,i.referenceDelegate);return new Ny(s,g,f,_).recalculateAndSaveOverlaysForDocumentKeys(new Ol(t,rt.oe),l).next()})})}}function Jp(n){n.createObjectStore("targetDocuments",{keyPath:eS}).createIndex("documentTargetsIndex",tS,{unique:!0}),n.createObjectStore("targets",{keyPath:"targetId"}).createIndex("queryTargetsIndex",Zb,{unique:!0}),n.createObjectStore("targetGlobal")}const al="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.";class Zu{constructor(e,t,r,s,i,o,a,l,u,d,f=17){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=r,this.ui=i,this.window=o,this.document=a,this.ci=u,this.li=d,this.hi=f,this.Qr=null,this.Kr=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Pi=null,this.inForeground=!1,this.Ii=null,this.Ti=null,this.Ei=Number.NEGATIVE_INFINITY,this.di=_=>Promise.resolve(),!Zu.D())throw new O(N.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new ER(this,s),this.Ai=t+"main",this.serializer=new vy(l),this.Ri=new yn(this.Ai,this.hi,new DR(this.serializer)),this.$r=new oR,this.Ur=new pR(this.referenceDelegate,this.serializer),this.remoteDocumentCache=Py(this.serializer),this.Gr=new iR,this.window&&this.window.localStorage?this.Vi=this.window.localStorage:(this.Vi=null,d===!1&&Se("IndexedDbPersistence","LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.mi().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new O(N.FAILED_PRECONDITION,al);return this.fi(),this.gi(),this.pi(),this.runTransaction("getHighestListenSequenceNumber","readonly",e=>this.Ur.getHighestSequenceNumber(e))}).then(e=>{this.Qr=new rt(e,this.ci)}).then(()=>{this.Kr=!0}).catch(e=>(this.Ri&&this.Ri.close(),Promise.reject(e)))}yi(e){return this.di=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.Ri.L(async t=>{t.newVersion===null&&await e()})}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.ui.enqueueAndForget(async()=>{this.started&&await this.mi()}))}mi(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",e=>Fo(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.wi(e).next(t=>{t||(this.isPrimary=!1,this.ui.enqueueRetryable(()=>this.di(!1)))})}).next(()=>this.Si(e)).next(t=>this.isPrimary&&!t?this.bi(e).next(()=>!1):!!t&&this.Di(e).next(()=>!0))).catch(e=>{if(Pn(e))return k("IndexedDbPersistence","Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return k("IndexedDbPersistence","Releasing owner lease after error during lease refresh",e),!1}).then(e=>{this.isPrimary!==e&&this.ui.enqueueRetryable(()=>this.di(e)),this.isPrimary=e})}wi(e){return Qs(e).get("owner").next(t=>S.resolve(this.vi(t)))}Ci(e){return Fo(e).delete(this.clientId)}async Fi(){if(this.isPrimary&&!this.Mi(this.Ei,18e5)){this.Ei=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",t=>{const r=De(t,"clientMetadata");return r.U().next(s=>{const i=this.xi(s,18e5),o=s.filter(a=>i.indexOf(a)===-1);return S.forEach(o,a=>r.delete(a.clientId)).next(()=>o)})}).catch(()=>[]);if(this.Vi)for(const t of e)this.Vi.removeItem(this.Oi(t.clientId))}}pi(){this.Ti=this.ui.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.mi().then(()=>this.Fi()).then(()=>this.pi()))}vi(e){return!!e&&e.ownerId===this.clientId}Si(e){return this.li?S.resolve(!0):Qs(e).get("owner").next(t=>{if(t!==null&&this.Mi(t.leaseTimestampMs,5e3)&&!this.Ni(t.ownerId)){if(this.vi(t)&&this.networkEnabled)return!0;if(!this.vi(t)){if(!t.allowTabSynchronization)throw new O(N.FAILED_PRECONDITION,al);return!1}}return!(!this.networkEnabled||!this.inForeground)||Fo(e).U().next(r=>this.xi(r,5e3).find(s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,o=!this.inForeground&&s.inForeground,a=this.networkEnabled===s.networkEnabled;if(i||o&&a)return!0}return!1})===void 0)}).next(t=>(this.isPrimary!==t&&k("IndexedDbPersistence",`Client ${t?"is":"is not"} eligible for a primary lease.`),t))}async shutdown(){this.Kr=!1,this.Li(),this.Ti&&(this.Ti.cancel(),this.Ti=null),this.Bi(),this.ki(),await this.Ri.runTransaction("shutdown","readwrite",["owner","clientMetadata"],e=>{const t=new Ol(e,rt.oe);return this.bi(t).next(()=>this.Ci(t))}),this.Ri.close(),this.qi()}xi(e,t){return e.filter(r=>this.Mi(r.updateTimeMs,t)&&!this.Ni(r.clientId))}Qi(){return this.runTransaction("getActiveClients","readonly",e=>Fo(e).U().next(t=>this.xi(t,18e5).map(r=>r.clientId)))}get started(){return this.Kr}getGlobalsCache(){return this.$r}getMutationQueue(e,t){return tc.lt(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new fR(e,this.serializer.ct.databaseId)}getDocumentOverlayCache(e){return ec.lt(this.serializer,e)}getBundleCache(){return this.Gr}runTransaction(e,t,r){k("IndexedDbPersistence","Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=function(l){return l===17?dS:l===16?hS:l===15?Fu:l===14?Ng:l===13?Pg:l===12?uS:l===11?Cg:void U()}(this.hi);let o;return this.Ri.runTransaction(e,s,i,a=>(o=new Ol(a,this.Qr?this.Qr.next():rt.oe),t==="readwrite-primary"?this.wi(o).next(l=>!!l||this.Si(o)).next(l=>{if(!l)throw Se(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.ui.enqueueRetryable(()=>this.di(!1)),new O(N.FAILED_PRECONDITION,wg);return r(o)}).next(l=>this.Di(o).next(()=>l)):this.Ki(o).next(()=>r(o)))).then(a=>(o.raiseOnCommittedEvent(),a))}Ki(e){return Qs(e).get("owner").next(t=>{if(t!==null&&this.Mi(t.leaseTimestampMs,5e3)&&!this.Ni(t.ownerId)&&!this.vi(t)&&!(this.li||this.allowTabSynchronization&&t.allowTabSynchronization))throw new O(N.FAILED_PRECONDITION,al)})}Di(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return Qs(e).put("owner",t)}static D(){return yn.D()}bi(e){const t=Qs(e);return t.get("owner").next(r=>this.vi(r)?(k("IndexedDbPersistence","Releasing primary lease."),t.delete("owner")):S.resolve())}Mi(e,t){const r=Date.now();return!(e<r-t)&&(!(e>r)||(Se(`Detected an update time that is in the future: ${e} > ${r}`),!1))}fi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.Ii=()=>{this.ui.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.mi()))},this.document.addEventListener("visibilitychange",this.Ii),this.inForeground=this.document.visibilityState==="visible")}Bi(){this.Ii&&(this.document.removeEventListener("visibilitychange",this.Ii),this.Ii=null)}gi(){var e;typeof((e=this.window)===null||e===void 0?void 0:e.addEventListener)=="function"&&(this.Pi=()=>{this.Li();const t=/(?:Version|Mobile)\/1[456]/;wm()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.ui.enterRestrictedMode(!0),this.ui.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Pi))}ki(){this.Pi&&(this.window.removeEventListener("pagehide",this.Pi),this.Pi=null)}Ni(e){var t;try{const r=((t=this.Vi)===null||t===void 0?void 0:t.getItem(this.Oi(e)))!==null;return k("IndexedDbPersistence",`Client '${e}' ${r?"is":"is not"} zombied in LocalStorage`),r}catch(r){return Se("IndexedDbPersistence","Failed to get zombied client id.",r),!1}}Li(){if(this.Vi)try{this.Vi.setItem(this.Oi(this.clientId),String(Date.now()))}catch(e){Se("Failed to set zombie client id.",e)}}qi(){if(this.Vi)try{this.Vi.removeItem(this.Oi(this.clientId))}catch{}}Oi(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function Qs(n){return De(n,"owner")}function Fo(n){return De(n,"clientMetadata")}function ky(n,e){let t=n.projectId;return n.isDefaultDatabase||(t+="."+n.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eh{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=s}static Wi(e,t){let r=Q(),s=Q();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new eh(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kR{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xy{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return wm()?8:bg(Ne())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.Yi(e,t).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.Zi(e,t,s,r).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new kR;return this.Xi(e,t,o).next(a=>{if(i.result=a,this.zi)return this.es(e,t,o,a.size)})}).next(()=>i.result)}es(e,t,r,s){return r.documentReadCount<this.ji?(Mr()<=ee.DEBUG&&k("QueryEngine","SDK will not create cache indexes for query:",Lr(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),S.resolve()):(Mr()<=ee.DEBUG&&k("QueryEngine","Query:",Lr(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(Mr()<=ee.DEBUG&&k("QueryEngine","The SDK decides to create cache indexes for query:",Lr(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ut(t))):S.resolve())}Yi(e,t){if(wp(t))return S.resolve(null);let r=ut(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=_a(t,null,"F"),r=ut(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const o=Q(...i);return this.Ji.getDocuments(e,o).next(a=>this.indexManager.getMinOffset(e,r).next(l=>{const u=this.ts(t,a);return this.ns(t,u,o,l.readTime)?this.Yi(e,_a(t,null,"F")):this.rs(e,u,t,l)}))})))}Zi(e,t,r,s){return wp(t)||s.isEqual(W.min())?S.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const o=this.ts(t,i);return this.ns(t,o,r,s)?S.resolve(null):(Mr()<=ee.DEBUG&&k("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Lr(t)),this.rs(e,o,t,Ig(s,-1)).next(a=>a))})}ts(e,t){let r=new ce(Kg(e));return t.forEach((s,i)=>{Yi(e,i)&&(r=r.add(i))}),r}ns(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,t,r){return Mr()<=ee.DEBUG&&k("QueryEngine","Using full collection scan to execute query:",Lr(t)),this.Ji.getDocumentsMatchingQuery(e,t,ht.min(),r)}rs(e,t,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xR{constructor(e,t,r,s){this.persistence=e,this.ss=t,this.serializer=s,this.os=new Ie(K),this._s=new Nn(i=>sr(i),Ki),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new Ny(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function Oy(n,e,t,r){return new xR(n,e,t,r)}async function Vy(n,e){const t=F(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.ls(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const o=[],a=[];let l=Q();for(const u of s){o.push(u.batchId);for(const d of u.mutations)l=l.add(d.key)}for(const u of i){a.push(u.batchId);for(const d of u.mutations)l=l.add(d.key)}return t.localDocuments.getDocuments(r,l).next(u=>({hs:u,removedBatchIds:o,addedBatchIds:a}))})})}function OR(n,e){const t=F(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=t.cs.newChangeBuffer({trackRemovals:!0});return function(a,l,u,d){const f=u.batch,_=f.keys();let g=S.resolve();return _.forEach(w=>{g=g.next(()=>d.getEntry(l,w)).next(D=>{const P=u.docVersions.get(w);q(P!==null),D.version.compareTo(P)<0&&(f.applyToRemoteDocument(D,u),D.isValidDocument()&&(D.setReadTime(u.commitVersion),d.addEntry(D)))})}),g.next(()=>a.mutationQueue.removeMutationBatch(l,f))}(t,r,e,i).next(()=>i.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(a){let l=Q();for(let u=0;u<a.mutationResults.length;++u)a.mutationResults[u].transformResults.length>0&&(l=l.add(a.batch.mutations[u].key));return l}(e))).next(()=>t.localDocuments.getDocuments(r,s))})}function My(n){const e=F(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function VR(n,e){const t=F(n),r=e.snapshotVersion;let s=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=t.cs.newChangeBuffer({trackRemovals:!0});s=t.os;const a=[];e.targetChanges.forEach((d,f)=>{const _=s.get(f);if(!_)return;a.push(t.Ur.removeMatchingKeys(i,d.removedDocuments,f).next(()=>t.Ur.addMatchingKeys(i,d.addedDocuments,f)));let g=_.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(f)!==null?g=g.withResumeToken(Re.EMPTY_BYTE_STRING,W.min()).withLastLimboFreeSnapshotVersion(W.min()):d.resumeToken.approximateByteSize()>0&&(g=g.withResumeToken(d.resumeToken,r)),s=s.insert(f,g),function(D,P,B){return D.resumeToken.approximateByteSize()===0||P.snapshotVersion.toMicroseconds()-D.snapshotVersion.toMicroseconds()>=3e8?!0:B.addedDocuments.size+B.modifiedDocuments.size+B.removedDocuments.size>0}(_,g,d)&&a.push(t.Ur.updateTargetData(i,g))});let l=ct(),u=Q();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&a.push(t.persistence.referenceDelegate.updateLimboDocument(i,d))}),a.push(MR(i,o,e.documentUpdates).next(d=>{l=d.Ps,u=d.Is})),!r.isEqual(W.min())){const d=t.Ur.getLastRemoteSnapshotVersion(i).next(f=>t.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));a.push(d)}return S.waitFor(a).next(()=>o.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,l,u)).next(()=>l)}).then(i=>(t.os=s,i))}function MR(n,e,t){let r=Q(),s=Q();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let o=ct();return t.forEach((a,l)=>{const u=i.get(a);l.isFoundDocument()!==u.isFoundDocument()&&(s=s.add(a)),l.isNoDocument()&&l.version.isEqual(W.min())?(e.removeEntry(a,l.readTime),o=o.insert(a,l)):!u.isValidDocument()||l.version.compareTo(u.version)>0||l.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(l),o=o.insert(a,l)):k("LocalStore","Ignoring outdated watch update for ",a,". Current version:",u.version," Watch version:",l.version)}),{Ps:o,Is:s}})}function LR(n,e){const t=F(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function Ia(n,e){const t=F(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.Ur.getTargetData(r,e).next(i=>i?(s=i,S.resolve(s)):t.Ur.allocateTargetId(r).next(o=>(s=new Bt(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r})}async function ss(n,e,t){const r=F(n),s=r.os.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,o=>r.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!Pn(o))throw o;k("LocalStore",`Failed to update sequence numbers for target ${e}: ${o}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function Ql(n,e,t){const r=F(n);let s=W.min(),i=Q();return r.persistence.runTransaction("Execute query","readwrite",o=>function(l,u,d){const f=F(l),_=f._s.get(d);return _!==void 0?S.resolve(f.os.get(_)):f.Ur.getTargetData(u,d)}(r,o,ut(e)).next(a=>{if(a)return s=a.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(o,a.targetId).next(l=>{i=l})}).next(()=>r.ss.getDocumentsMatchingQuery(o,e,t?s:W.min(),t?i:Q())).next(a=>(Uy(r,zg(e),a),{documents:a,Ts:i})))}function Ly(n,e){const t=F(n),r=F(t.Ur),s=t.os.get(e);return s?Promise.resolve(s.target):t.persistence.runTransaction("Get target data","readonly",i=>r.ot(i,e).next(o=>o?o.target:null))}function Fy(n,e){const t=F(n),r=t.us.get(e)||W.min();return t.persistence.runTransaction("Get new document changes","readonly",s=>t.cs.getAllFromCollectionGroup(s,e,Ig(r,-1),Number.MAX_SAFE_INTEGER)).then(s=>(Uy(t,e,s),s))}function Uy(n,e,t){let r=n.us.get(e)||W.min();t.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),n.us.set(e,r)}function Xp(n,e){return`firestore_clients_${n}_${e}`}function Zp(n,e,t){let r=`firestore_mutations_${n}_${t}`;return e.isAuthenticated()&&(r+=`_${e.uid}`),r}function cl(n,e){return`firestore_targets_${n}_${e}`}class Ta{constructor(e,t,r,s){this.user=e,this.batchId=t,this.state=r,this.error=s}static Rs(e,t,r){const s=JSON.parse(r);let i,o=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return o&&s.error&&(o=typeof s.error.message=="string"&&typeof s.error.code=="string",o&&(i=new O(s.error.code,s.error.message))),o?new Ta(e,t,s.state,i):(Se("SharedClientState",`Failed to parse mutation state for ID '${t}': ${r}`),null)}Vs(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class pi{constructor(e,t,r){this.targetId=e,this.state=t,this.error=r}static Rs(e,t){const r=JSON.parse(t);let s,i=typeof r=="object"&&["not-current","current","rejected"].indexOf(r.state)!==-1&&(r.error===void 0||typeof r.error=="object");return i&&r.error&&(i=typeof r.error.message=="string"&&typeof r.error.code=="string",i&&(s=new O(r.error.code,r.error.message))),i?new pi(e,r.state,s):(Se("SharedClientState",`Failed to parse target state for ID '${e}': ${t}`),null)}Vs(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class wa{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Rs(e,t){const r=JSON.parse(t);let s=typeof r=="object"&&r.activeTargetIds instanceof Array,i=qu();for(let o=0;s&&o<r.activeTargetIds.length;++o)s=Sg(r.activeTargetIds[o]),i=i.add(r.activeTargetIds[o]);return s?new wa(e,i):(Se("SharedClientState",`Failed to parse client data for instance '${e}': ${t}`),null)}}class th{constructor(e,t){this.clientId=e,this.onlineState=t}static Rs(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new th(t.clientId,t.onlineState):(Se("SharedClientState",`Failed to parse online state: ${e}`),null)}}class Yl{constructor(){this.activeTargetIds=qu()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class ll{constructor(e,t,r,s,i){this.window=e,this.ui=t,this.persistenceKey=r,this.ps=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.ys=this.ws.bind(this),this.Ss=new Ie(K),this.started=!1,this.bs=[];const o=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.Ds=Xp(this.persistenceKey,this.ps),this.vs=function(l){return`firestore_sequence_number_${l}`}(this.persistenceKey),this.Ss=this.Ss.insert(this.ps,new Yl),this.Cs=new RegExp(`^firestore_clients_${o}_([^_]*)$`),this.Fs=new RegExp(`^firestore_mutations_${o}_(\\d+)(?:_(.*))?$`),this.Ms=new RegExp(`^firestore_targets_${o}_(\\d+)$`),this.xs=function(l){return`firestore_online_state_${l}`}(this.persistenceKey),this.Os=function(l){return`firestore_bundle_loaded_v2_${l}`}(this.persistenceKey),this.window.addEventListener("storage",this.ys)}static D(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.Qi();for(const r of e){if(r===this.ps)continue;const s=this.getItem(Xp(this.persistenceKey,r));if(s){const i=wa.Rs(r,s);i&&(this.Ss=this.Ss.insert(i.clientId,i))}}this.Ns();const t=this.storage.getItem(this.xs);if(t){const r=this.Ls(t);r&&this.Bs(r)}for(const r of this.bs)this.ws(r);this.bs=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(e){this.setItem(this.vs,JSON.stringify(e))}getAllActiveQueryTargets(){return this.ks(this.Ss)}isActiveQueryTarget(e){let t=!1;return this.Ss.forEach((r,s)=>{s.activeTargetIds.has(e)&&(t=!0)}),t}addPendingMutation(e){this.qs(e,"pending")}updateMutationState(e,t,r){this.qs(e,t,r),this.Qs(e)}addLocalQueryTarget(e,t=!0){let r="not-current";if(this.isActiveQueryTarget(e)){const s=this.storage.getItem(cl(this.persistenceKey,e));if(s){const i=pi.Rs(e,s);i&&(r=i.state)}}return t&&this.Ks.fs(e),this.Ns(),r}removeLocalQueryTarget(e){this.Ks.gs(e),this.Ns()}isLocalQueryTarget(e){return this.Ks.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(cl(this.persistenceKey,e))}updateQueryState(e,t,r){this.$s(e,t,r)}handleUserChange(e,t,r){t.forEach(s=>{this.Qs(s)}),this.currentUser=e,r.forEach(s=>{this.addPendingMutation(s)})}setOnlineState(e){this.Us(e)}notifyBundleLoaded(e){this.Ws(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.ys),this.removeItem(this.Ds),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return k("SharedClientState","READ",e,t),t}setItem(e,t){k("SharedClientState","SET",e,t),this.storage.setItem(e,t)}removeItem(e){k("SharedClientState","REMOVE",e),this.storage.removeItem(e)}ws(e){const t=e;if(t.storageArea===this.storage){if(k("SharedClientState","EVENT",t.key,t.newValue),t.key===this.Ds)return void Se("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.ui.enqueueRetryable(async()=>{if(this.started){if(t.key!==null){if(this.Cs.test(t.key)){if(t.newValue==null){const r=this.Gs(t.key);return this.zs(r,null)}{const r=this.js(t.key,t.newValue);if(r)return this.zs(r.clientId,r)}}else if(this.Fs.test(t.key)){if(t.newValue!==null){const r=this.Hs(t.key,t.newValue);if(r)return this.Js(r)}}else if(this.Ms.test(t.key)){if(t.newValue!==null){const r=this.Ys(t.key,t.newValue);if(r)return this.Zs(r)}}else if(t.key===this.xs){if(t.newValue!==null){const r=this.Ls(t.newValue);if(r)return this.Bs(r)}}else if(t.key===this.vs){const r=function(i){let o=rt.oe;if(i!=null)try{const a=JSON.parse(i);q(typeof a=="number"),o=a}catch(a){Se("SharedClientState","Failed to read sequence number from WebStorage",a)}return o}(t.newValue);r!==rt.oe&&this.sequenceNumberHandler(r)}else if(t.key===this.Os){const r=this.Xs(t.newValue);await Promise.all(r.map(s=>this.syncEngine.eo(s)))}}}else this.bs.push(t)})}}get Ks(){return this.Ss.get(this.ps)}Ns(){this.setItem(this.Ds,this.Ks.Vs())}qs(e,t,r){const s=new Ta(this.currentUser,e,t,r),i=Zp(this.persistenceKey,this.currentUser,e);this.setItem(i,s.Vs())}Qs(e){const t=Zp(this.persistenceKey,this.currentUser,e);this.removeItem(t)}Us(e){const t={clientId:this.ps,onlineState:e};this.storage.setItem(this.xs,JSON.stringify(t))}$s(e,t,r){const s=cl(this.persistenceKey,e),i=new pi(e,t,r);this.setItem(s,i.Vs())}Ws(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Os,t)}Gs(e){const t=this.Cs.exec(e);return t?t[1]:null}js(e,t){const r=this.Gs(e);return wa.Rs(r,t)}Hs(e,t){const r=this.Fs.exec(e),s=Number(r[1]),i=r[2]!==void 0?r[2]:null;return Ta.Rs(new Oe(i),s,t)}Ys(e,t){const r=this.Ms.exec(e),s=Number(r[1]);return pi.Rs(s,t)}Ls(e){return th.Rs(e)}Xs(e){return JSON.parse(e)}async Js(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.no(e.batchId,e.state,e.error);k("SharedClientState",`Ignoring mutation for non-active user ${e.user.uid}`)}Zs(e){return this.syncEngine.ro(e.targetId,e.state,e.error)}zs(e,t){const r=t?this.Ss.insert(e,t):this.Ss.remove(e),s=this.ks(this.Ss),i=this.ks(r),o=[],a=[];return i.forEach(l=>{s.has(l)||o.push(l)}),s.forEach(l=>{i.has(l)||a.push(l)}),this.syncEngine.io(o,a).then(()=>{this.Ss=r})}Bs(e){this.Ss.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}ks(e){let t=qu();return e.forEach((r,s)=>{t=t.unionWith(s.activeTargetIds)}),t}}class By{constructor(){this.so=new Yl,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Yl,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FR{_o(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class e_{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){k("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){k("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Uo=null;function ul(){return Uo===null?Uo=function(){return 268435456+Math.round(2147483648*Math.random())}():Uo++,"0x"+Uo.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const UR={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BR{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const He="WebChannelConnection";class $R extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(t,r,s,i,o){const a=ul(),l=this.xo(t,r.toUriEncodedString());k("RestConnection",`Sending RPC '${t}' ${a}:`,l,s);const u={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(u,i,o),this.No(t,l,u,s).then(d=>(k("RestConnection",`Received RPC '${t}' ${a}: `,d),d),d=>{throw Yr("RestConnection",`RPC '${t}' ${a} failed with error: `,d,"url: ",l,"request:",s),d})}Lo(t,r,s,i,o,a){return this.Mo(t,r,s,i,o)}Oo(t,r,s){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+gs}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,o)=>t[o]=i),s&&s.headers.forEach((i,o)=>t[o]=i)}xo(t,r){const s=UR[t];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,s){const i=ul();return new Promise((o,a)=>{const l=new fg;l.setWithCredentials(!0),l.listenOnce(pg.COMPLETE,()=>{try{switch(l.getLastErrorCode()){case Ko.NO_ERROR:const d=l.getResponseJson();k(He,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(d)),o(d);break;case Ko.TIMEOUT:k(He,`RPC '${e}' ${i} timed out`),a(new O(N.DEADLINE_EXCEEDED,"Request time out"));break;case Ko.HTTP_ERROR:const f=l.getStatus();if(k(He,`RPC '${e}' ${i} failed with status:`,f,"response text:",l.getResponseText()),f>0){let _=l.getResponseJson();Array.isArray(_)&&(_=_[0]);const g=_==null?void 0:_.error;if(g&&g.status&&g.message){const w=function(P){const B=P.toLowerCase().replace(/_/g,"-");return Object.values(N).indexOf(B)>=0?B:N.UNKNOWN}(g.status);a(new O(w,g.message))}else a(new O(N.UNKNOWN,"Server responded with status "+l.getStatus()))}else a(new O(N.UNAVAILABLE,"Connection failed."));break;default:U()}}finally{k(He,`RPC '${e}' ${i} completed.`)}});const u=JSON.stringify(s);k(He,`RPC '${e}' ${i} sending request:`,s),l.send(t,"POST",u,r,15)})}Bo(e,t,r){const s=ul(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=gg(),a=mg(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(l.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(l.useFetchStreams=!0),this.Oo(l.initMessageHeaders,t,r),l.encodeInitMessageHeaders=!0;const d=i.join("");k(He,`Creating RPC '${e}' stream ${s}: ${d}`,l);const f=o.createWebChannel(d,l);let _=!1,g=!1;const w=new BR({Io:P=>{g?k(He,`Not sending because RPC '${e}' stream ${s} is closed:`,P):(_||(k(He,`Opening RPC '${e}' stream ${s} transport.`),f.open(),_=!0),k(He,`RPC '${e}' stream ${s} sending:`,P),f.send(P))},To:()=>f.close()}),D=(P,B,$)=>{P.listen(B,L=>{try{$(L)}catch(j){setTimeout(()=>{throw j},0)}})};return D(f,ri.EventType.OPEN,()=>{g||(k(He,`RPC '${e}' stream ${s} transport opened.`),w.yo())}),D(f,ri.EventType.CLOSE,()=>{g||(g=!0,k(He,`RPC '${e}' stream ${s} transport closed`),w.So())}),D(f,ri.EventType.ERROR,P=>{g||(g=!0,Yr(He,`RPC '${e}' stream ${s} transport errored:`,P),w.So(new O(N.UNAVAILABLE,"The operation could not be completed")))}),D(f,ri.EventType.MESSAGE,P=>{var B;if(!g){const $=P.data[0];q(!!$);const L=$,j=L.error||((B=L[0])===null||B===void 0?void 0:B.error);if(j){k(He,`RPC '${e}' stream ${s} received error:`,j);const Z=j.status;let z=function(E){const T=Ce[E];if(T!==void 0)return ay(T)}(Z),I=j.message;z===void 0&&(z=N.INTERNAL,I="Unknown error status: "+Z+" with message "+j.message),g=!0,w.So(new O(z,I)),f.close()}else k(He,`RPC '${e}' stream ${s} received:`,$),w.bo($)}}),D(a,_g.STAT_EVENT,P=>{P.stat===kl.PROXY?k(He,`RPC '${e}' stream ${s} detected buffering proxy`):P.stat===kl.NOPROXY&&k(He,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{w.wo()},0),w}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $y(){return typeof window<"u"?window:null}function ta(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rc(n){return new zS(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qy{constructor(e,t,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,t-r);s>0&&k("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jy{constructor(e,t,r,s,i,o,a,l){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=a,this.listener=l,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new qy(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===N.RESOURCE_EXHAUSTED?(Se(t.toString()),Se("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===N.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===t&&this.P_(r,s)},r=>{e(()=>{const s=new O(N.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return k("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(k("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class qR extends jy{constructor(e,t,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=YS(this.serializer,e),r=function(i){if(!("targetChange"in i))return W.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?W.min():o.readTime?Ze(o.readTime):W.min()}(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=Wl(this.serializer),t.addTarget=function(i,o){let a;const l=o.target;if(a=fa(l)?{documents:_y(i,l)}:{query:Qu(i,l)._t},a.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){a.resumeToken=uy(i,o.resumeToken);const u=ql(i,o.expectedCount);u!==null&&(a.expectedCount=u)}else if(o.snapshotVersion.compareTo(W.min())>0){a.readTime=rs(i,o.snapshotVersion.toTimestamp());const u=ql(i,o.expectedCount);u!==null&&(a.expectedCount=u)}return a}(this.serializer,e);const r=ZS(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=Wl(this.serializer),t.removeTarget=e,this.a_(t)}}class jR extends jy{constructor(e,t,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return q(!!e.streamToken),this.lastStreamToken=e.streamToken,q(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){q(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=JS(e.writeResults,e.commitTime),r=Ze(e.commitTime);return this.listener.g_(r,t)}p_(){const e={};e.database=Wl(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>ga(this.serializer,r))};this.a_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WR extends class{}{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new O(N.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Mo(e,jl(t,r),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===N.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new O(N.UNKNOWN,i.toString())})}Lo(e,t,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.Lo(e,jl(t,r),s,o,a,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===N.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new O(N.UNKNOWN,o.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class GR{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Se(t),this.D_=!1):k("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HR{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(o=>{r.enqueueAndForget(async()=>{Er(this)&&(k("RemoteStore","Restarting streams for network reachability change."),await async function(l){const u=F(l);u.L_.add(4),await to(u),u.q_.set("Unknown"),u.L_.delete(4),await sc(u)}(this))})}),this.q_=new GR(r,s)}}async function sc(n){if(Er(n))for(const e of n.B_)await e(!0)}async function to(n){for(const e of n.B_)await e(!1)}function ic(n,e){const t=F(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),sh(t)?rh(t):vs(t).r_()&&nh(t,e))}function is(n,e){const t=F(n),r=vs(t);t.N_.delete(e),r.r_()&&Wy(t,e),t.N_.size===0&&(r.r_()?r.o_():Er(t)&&t.q_.set("Unknown"))}function nh(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(W.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}vs(n).A_(e)}function Wy(n,e){n.Q_.xe(e),vs(n).R_(e)}function rh(n){n.Q_=new jS({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),vs(n).start(),n.q_.v_()}function sh(n){return Er(n)&&!vs(n).n_()&&n.N_.size>0}function Er(n){return F(n).L_.size===0}function Gy(n){n.Q_=void 0}async function zR(n){n.q_.set("Online")}async function KR(n){n.N_.forEach((e,t)=>{nh(n,e)})}async function QR(n,e){Gy(n),sh(n)?(n.q_.M_(e),rh(n)):n.q_.set("Unknown")}async function YR(n,e,t){if(n.q_.set("Online"),e instanceof ly&&e.state===2&&e.cause)try{await async function(s,i){const o=i.cause;for(const a of i.targetIds)s.N_.has(a)&&(await s.remoteSyncer.rejectListen(a,o),s.N_.delete(a),s.Q_.removeTarget(a))}(n,e)}catch(r){k("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Aa(n,r)}else if(e instanceof ea?n.Q_.Ke(e):e instanceof cy?n.Q_.He(e):n.Q_.We(e),!t.isEqual(W.min()))try{const r=await My(n.localStore);t.compareTo(r)>=0&&await function(i,o){const a=i.Q_.rt(o);return a.targetChanges.forEach((l,u)=>{if(l.resumeToken.approximateByteSize()>0){const d=i.N_.get(u);d&&i.N_.set(u,d.withResumeToken(l.resumeToken,o))}}),a.targetMismatches.forEach((l,u)=>{const d=i.N_.get(l);if(!d)return;i.N_.set(l,d.withResumeToken(Re.EMPTY_BYTE_STRING,d.snapshotVersion)),Wy(i,l);const f=new Bt(d.target,l,u,d.sequenceNumber);nh(i,f)}),i.remoteSyncer.applyRemoteEvent(a)}(n,t)}catch(r){k("RemoteStore","Failed to raise snapshot:",r),await Aa(n,r)}}async function Aa(n,e,t){if(!Pn(e))throw e;n.L_.add(1),await to(n),n.q_.set("Offline"),t||(t=()=>My(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{k("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await sc(n)})}function Hy(n,e){return e().catch(t=>Aa(n,t,e))}async function Es(n){const e=F(n),t=An(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;JR(e);)try{const s=await LR(e.localStore,r);if(s===null){e.O_.length===0&&t.o_();break}r=s.batchId,XR(e,s)}catch(s){await Aa(e,s)}zy(e)&&Ky(e)}function JR(n){return Er(n)&&n.O_.length<10}function XR(n,e){n.O_.push(e);const t=An(n);t.r_()&&t.V_&&t.m_(e.mutations)}function zy(n){return Er(n)&&!An(n).n_()&&n.O_.length>0}function Ky(n){An(n).start()}async function ZR(n){An(n).p_()}async function eC(n){const e=An(n);for(const t of n.O_)e.m_(t.mutations)}async function tC(n,e,t){const r=n.O_.shift(),s=Gu.from(r,e,t);await Hy(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await Es(n)}async function nC(n,e){e&&An(n).V_&&await async function(r,s){if(function(o){return BS(o)&&o!==N.ABORTED}(s.code)){const i=r.O_.shift();An(r).s_(),await Hy(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Es(r)}}(n,e),zy(n)&&Ky(n)}async function t_(n,e){const t=F(n);t.asyncQueue.verifyOperationInProgress(),k("RemoteStore","RemoteStore received new credentials");const r=Er(t);t.L_.add(3),await to(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await sc(t)}async function Jl(n,e){const t=F(n);e?(t.L_.delete(2),await sc(t)):e||(t.L_.add(2),await to(t),t.q_.set("Unknown"))}function vs(n){return n.K_||(n.K_=function(t,r,s){const i=F(t);return i.w_(),new qR(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:zR.bind(null,n),Ro:KR.bind(null,n),mo:QR.bind(null,n),d_:YR.bind(null,n)}),n.B_.push(async e=>{e?(n.K_.s_(),sh(n)?rh(n):n.q_.set("Unknown")):(await n.K_.stop(),Gy(n))})),n.K_}function An(n){return n.U_||(n.U_=function(t,r,s){const i=F(t);return i.w_(),new jR(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:()=>Promise.resolve(),Ro:ZR.bind(null,n),mo:nC.bind(null,n),f_:eC.bind(null,n),g_:tC.bind(null,n)}),n.B_.push(async e=>{e?(n.U_.s_(),await Es(n)):(await n.U_.stop(),n.O_.length>0&&(k("RemoteStore",`Stopping write stream with ${n.O_.length} pending writes`),n.O_=[]))})),n.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ih{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Et,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const o=Date.now()+r,a=new ih(e,t,o,s,i);return a.start(r),a}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new O(N.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function oh(n,e){if(Se("AsyncQueue",`${e}: ${n}`),Pn(n))return new O(N.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wr{constructor(e){this.comparator=e?(t,r)=>e(t,r)||M.comparator(t.key,r.key):(t,r)=>M.comparator(t.key,r.key),this.keyedMap=si(),this.sortedSet=new Ie(this.comparator)}static emptySet(e){return new Wr(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Wr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Wr;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class n_{constructor(){this.W_=new Ie(M.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):U():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,r)=>{e.push(r)}),e}}class os{constructor(e,t,r,s,i,o,a,l,u){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=a,this.excludesMetadataChanges=l,this.hasCachedResults=u}static fromInitialDocuments(e,t,r,s,i){const o=[];return t.forEach(a=>{o.push({type:0,doc:a})}),new os(e,t,Wr.emptySet(t),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Ja(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rC{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class sC{constructor(){this.queries=r_(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const s=F(t),i=s.queries;s.queries=r_(),i.forEach((o,a)=>{for(const l of a.j_)l.onError(r)})})(this,new O(N.ABORTED,"Firestore shutting down"))}}function r_(){return new Nn(n=>Hg(n),Ja)}async function ah(n,e){const t=F(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new rC,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await t.onListen(s,!0);break;case 1:i.z_=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const a=oh(o,`Initialization of query '${Lr(e.query)}' failed`);return void e.onError(a)}t.queries.set(s,i),i.j_.push(e),e.Z_(t.onlineState),i.z_&&e.X_(i.z_)&&lh(t)}async function ch(n,e){const t=F(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const o=i.j_.indexOf(e);o>=0&&(i.j_.splice(o,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function iC(n,e){const t=F(n);let r=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const a of o.j_)a.X_(s)&&(r=!0);o.z_=s}}r&&lh(t)}function oC(n,e,t){const r=F(n),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(t);r.queries.delete(e)}function lh(n){n.Y_.forEach(e=>{e.next()})}var Xl,s_;(s_=Xl||(Xl={})).ea="default",s_.Cache="cache";class uh{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new os(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=os.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Xl.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qy{constructor(e){this.key=e}}class Yy{constructor(e){this.key=e}}class aC{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=Q(),this.mutatedKeys=Q(),this.Aa=Kg(e),this.Ra=new Wr(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new n_,s=t?t.Ra:this.Ra;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,a=!1;const l=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,u=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((d,f)=>{const _=s.get(d),g=Yi(this.query,f)?f:null,w=!!_&&this.mutatedKeys.has(_.key),D=!!g&&(g.hasLocalMutations||this.mutatedKeys.has(g.key)&&g.hasCommittedMutations);let P=!1;_&&g?_.data.isEqual(g.data)?w!==D&&(r.track({type:3,doc:g}),P=!0):this.ga(_,g)||(r.track({type:2,doc:g}),P=!0,(l&&this.Aa(g,l)>0||u&&this.Aa(g,u)<0)&&(a=!0)):!_&&g?(r.track({type:0,doc:g}),P=!0):_&&!g&&(r.track({type:1,doc:_}),P=!0,(l||u)&&(a=!0)),P&&(g?(o=o.add(g),i=D?i.add(d):i.delete(d)):(o=o.delete(d),i=i.delete(d)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const d=this.query.limitType==="F"?o.last():o.first();o=o.delete(d.key),i=i.delete(d.key),r.track({type:1,doc:d})}return{Ra:o,fa:r,ns:a,mutatedKeys:i}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const o=e.fa.G_();o.sort((d,f)=>function(g,w){const D=P=>{switch(P){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return U()}};return D(g)-D(w)}(d.type,f.type)||this.Aa(d.doc,f.doc)),this.pa(r),s=s!=null&&s;const a=t&&!s?this.ya():[],l=this.da.size===0&&this.current&&!s?1:0,u=l!==this.Ea;return this.Ea=l,o.length!==0||u?{snapshot:new os(this.query,e.Ra,i,o,e.mutatedKeys,l===0,u,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:a}:{wa:a}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new n_,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=Q(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const t=[];return e.forEach(r=>{this.da.has(r)||t.push(new Yy(r))}),this.da.forEach(r=>{e.has(r)||t.push(new Qy(r))}),t}ba(e){this.Ta=e.Ts,this.da=Q();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return os.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class cC{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class lC{constructor(e){this.key=e,this.va=!1}}class uC{constructor(e,t,r,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Ca={},this.Fa=new Nn(a=>Hg(a),Ja),this.Ma=new Map,this.xa=new Set,this.Oa=new Ie(M.comparator),this.Na=new Map,this.La=new Xu,this.Ba={},this.ka=new Map,this.qa=lr.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function hC(n,e,t=!0){const r=oc(n);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await Jy(r,e,t,!0),s}async function dC(n,e){const t=oc(n);await Jy(t,e,!0,!1)}async function Jy(n,e,t,r){const s=await Ia(n.localStore,ut(e)),i=s.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let a;return r&&(a=await hh(n,e,i,o==="current",s.resumeToken)),n.isPrimaryClient&&t&&ic(n.remoteStore,s),a}async function hh(n,e,t,r,s){n.Ka=(f,_,g)=>async function(D,P,B,$){let L=P.view.ma(B);L.ns&&(L=await Ql(D.localStore,P.query,!1).then(({documents:I})=>P.view.ma(I,L)));const j=$&&$.targetChanges.get(P.targetId),Z=$&&$.targetMismatches.get(P.targetId)!=null,z=P.view.applyChanges(L,D.isPrimaryClient,j,Z);return Zl(D,P.targetId,z.wa),z.snapshot}(n,f,_,g);const i=await Ql(n.localStore,e,!0),o=new aC(e,i.Ts),a=o.ma(i.documents),l=eo.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),u=o.applyChanges(a,n.isPrimaryClient,l);Zl(n,t,u.wa);const d=new cC(e,t,o);return n.Fa.set(e,d),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),u.snapshot}async function fC(n,e,t){const r=F(n),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(o=>!Ja(o,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await ss(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&is(r.remoteStore,s.targetId),as(r,s.targetId)}).catch(Cn)):(as(r,s.targetId),await ss(r.localStore,s.targetId,!0))}async function pC(n,e){const t=F(n),r=t.Fa.get(e),s=t.Ma.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),is(t.remoteStore,r.targetId))}async function _C(n,e,t){const r=_h(n);try{const s=await function(o,a){const l=F(o),u=ve.now(),d=a.reduce((g,w)=>g.add(w.key),Q());let f,_;return l.persistence.runTransaction("Locally write mutations","readwrite",g=>{let w=ct(),D=Q();return l.cs.getEntries(g,d).next(P=>{w=P,w.forEach((B,$)=>{$.isValidDocument()||(D=D.add(B))})}).next(()=>l.localDocuments.getOverlayedDocuments(g,w)).next(P=>{f=P;const B=[];for(const $ of a){const L=LS($,f.get($.key).overlayedDocument);L!=null&&B.push(new Jt($.key,L,Vg(L.value.mapValue),Pe.exists(!0)))}return l.mutationQueue.addMutationBatch(g,u,B,a)}).next(P=>{_=P;const B=P.applyToLocalDocumentSet(f,D);return l.documentOverlayCache.saveOverlays(g,P.batchId,B)})}).then(()=>({batchId:_.batchId,changes:Yg(f)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(o,a,l){let u=o.Ba[o.currentUser.toKey()];u||(u=new Ie(K)),u=u.insert(a,l),o.Ba[o.currentUser.toKey()]=u}(r,s.batchId,t),await Dn(r,s.changes),await Es(r.remoteStore)}catch(s){const i=oh(s,"Failed to persist write");t.reject(i)}}async function Xy(n,e){const t=F(n);try{const r=await VR(t.localStore,e);e.targetChanges.forEach((s,i)=>{const o=t.Na.get(i);o&&(q(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?o.va=!0:s.modifiedDocuments.size>0?q(o.va):s.removedDocuments.size>0&&(q(o.va),o.va=!1))}),await Dn(t,r,e)}catch(r){await Cn(r)}}function i_(n,e,t){const r=F(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Fa.forEach((i,o)=>{const a=o.view.Z_(e);a.snapshot&&s.push(a.snapshot)}),function(o,a){const l=F(o);l.onlineState=a;let u=!1;l.queries.forEach((d,f)=>{for(const _ of f.j_)_.Z_(a)&&(u=!0)}),u&&lh(l)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function mC(n,e,t){const r=F(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Na.get(e),i=s&&s.key;if(i){let o=new Ie(M.comparator);o=o.insert(i,Ae.newNoDocument(i,W.min()));const a=Q().add(i),l=new Zi(W.min(),new Map,new Ie(K),o,a);await Xy(r,l),r.Oa=r.Oa.remove(i),r.Na.delete(e),ph(r)}else await ss(r.localStore,e,!1).then(()=>as(r,e,t)).catch(Cn)}async function gC(n,e){const t=F(n),r=e.batch.batchId;try{const s=await OR(t.localStore,e);fh(t,r,null),dh(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Dn(t,s)}catch(s){await Cn(s)}}async function yC(n,e,t){const r=F(n);try{const s=await function(o,a){const l=F(o);return l.persistence.runTransaction("Reject batch","readwrite-primary",u=>{let d;return l.mutationQueue.lookupMutationBatch(u,a).next(f=>(q(f!==null),d=f.keys(),l.mutationQueue.removeMutationBatch(u,f))).next(()=>l.mutationQueue.performConsistencyCheck(u)).next(()=>l.documentOverlayCache.removeOverlaysForBatchId(u,d,a)).next(()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,d)).next(()=>l.localDocuments.getDocuments(u,d))})}(r.localStore,e);fh(r,e,t),dh(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Dn(r,s)}catch(s){await Cn(s)}}function dh(n,e){(n.ka.get(e)||[]).forEach(t=>{t.resolve()}),n.ka.delete(e)}function fh(n,e,t){const r=F(n);let s=r.Ba[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.Ba[r.currentUser.toKey()]=s}}function as(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach(r=>{n.La.containsKey(r)||Zy(n,r)})}function Zy(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(is(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),ph(n))}function Zl(n,e,t){for(const r of t)r instanceof Qy?(n.La.addReference(r.key,e),EC(n,r)):r instanceof Yy?(k("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||Zy(n,r.key)):U()}function EC(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(k("SyncEngine","New document in limbo: "+t),n.xa.add(r),ph(n))}function ph(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new M(se.fromString(e)),r=n.qa.next();n.Na.set(r,new lC(t)),n.Oa=n.Oa.insert(t,r),ic(n.remoteStore,new Bt(ut(Qi(t.path)),r,"TargetPurposeLimboResolution",rt.oe))}}async function Dn(n,e,t){const r=F(n),s=[],i=[],o=[];r.Fa.isEmpty()||(r.Fa.forEach((a,l)=>{o.push(r.Ka(l,e,t).then(u=>{var d;if((u||t)&&r.isPrimaryClient){const f=u?!u.fromCache:(d=t==null?void 0:t.targetChanges.get(l.targetId))===null||d===void 0?void 0:d.current;r.sharedClientState.updateQueryState(l.targetId,f?"current":"not-current")}if(u){s.push(u);const f=eh.Wi(l.targetId,u);i.push(f)}}))}),await Promise.all(o),r.Ca.d_(s),await async function(l,u){const d=F(l);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",f=>S.forEach(u,_=>S.forEach(_.$i,g=>d.persistence.referenceDelegate.addReference(f,_.targetId,g)).next(()=>S.forEach(_.Ui,g=>d.persistence.referenceDelegate.removeReference(f,_.targetId,g)))))}catch(f){if(!Pn(f))throw f;k("LocalStore","Failed to update sequence numbers: "+f)}for(const f of u){const _=f.targetId;if(!f.fromCache){const g=d.os.get(_),w=g.snapshotVersion,D=g.withLastLimboFreeSnapshotVersion(w);d.os=d.os.insert(_,D)}}}(r.localStore,i))}async function vC(n,e){const t=F(n);if(!t.currentUser.isEqual(e)){k("SyncEngine","User change. New user:",e.toKey());const r=await Vy(t.localStore,e);t.currentUser=e,function(i,o){i.ka.forEach(a=>{a.forEach(l=>{l.reject(new O(N.CANCELLED,o))})}),i.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Dn(t,r.hs)}}function IC(n,e){const t=F(n),r=t.Na.get(e);if(r&&r.va)return Q().add(r.key);{let s=Q();const i=t.Ma.get(e);if(!i)return s;for(const o of i){const a=t.Fa.get(o);s=s.unionWith(a.view.Va)}return s}}async function TC(n,e){const t=F(n),r=await Ql(t.localStore,e.query,!0),s=e.view.ba(r);return t.isPrimaryClient&&Zl(t,e.targetId,s.wa),s}async function wC(n,e){const t=F(n);return Fy(t.localStore,e).then(r=>Dn(t,r))}async function AC(n,e,t,r){const s=F(n),i=await function(a,l){const u=F(a),d=F(u.mutationQueue);return u.persistence.runTransaction("Lookup mutation documents","readonly",f=>d.Mn(f,l).next(_=>_?u.localDocuments.getDocuments(f,_):S.resolve(null)))}(s.localStore,e);i!==null?(t==="pending"?await Es(s.remoteStore):t==="acknowledged"||t==="rejected"?(fh(s,e,r||null),dh(s,e),function(a,l){F(F(a).mutationQueue).On(l)}(s.localStore,e)):U(),await Dn(s,i)):k("SyncEngine","Cannot apply mutation batch with id: "+e)}async function bC(n,e){const t=F(n);if(oc(t),_h(t),e===!0&&t.Qa!==!0){const r=t.sharedClientState.getAllActiveQueryTargets(),s=await o_(t,r.toArray());t.Qa=!0,await Jl(t.remoteStore,!0);for(const i of s)ic(t.remoteStore,i)}else if(e===!1&&t.Qa!==!1){const r=[];let s=Promise.resolve();t.Ma.forEach((i,o)=>{t.sharedClientState.isLocalQueryTarget(o)?r.push(o):s=s.then(()=>(as(t,o),ss(t.localStore,o,!0))),is(t.remoteStore,o)}),await s,await o_(t,r),function(o){const a=F(o);a.Na.forEach((l,u)=>{is(a.remoteStore,u)}),a.La.pr(),a.Na=new Map,a.Oa=new Ie(M.comparator)}(t),t.Qa=!1,await Jl(t.remoteStore,!1)}}async function o_(n,e,t){const r=F(n),s=[],i=[];for(const o of e){let a;const l=r.Ma.get(o);if(l&&l.length!==0){a=await Ia(r.localStore,ut(l[0]));for(const u of l){const d=r.Fa.get(u),f=await TC(r,d);f.snapshot&&i.push(f.snapshot)}}else{const u=await Ly(r.localStore,o);a=await Ia(r.localStore,u),await hh(r,eE(u),o,!1,a.resumeToken)}s.push(a)}return r.Ca.d_(i),s}function eE(n){return jg(n.path,n.collectionGroup,n.orderBy,n.filters,n.limit,"F",n.startAt,n.endAt)}function SC(n){return function(t){return F(F(t).persistence).Qi()}(F(n).localStore)}async function RC(n,e,t,r){const s=F(n);if(s.Qa)return void k("SyncEngine","Ignoring unexpected query state notification.");const i=s.Ma.get(e);if(i&&i.length>0)switch(t){case"current":case"not-current":{const o=await Fy(s.localStore,zg(i[0])),a=Zi.createSynthesizedRemoteEventForCurrentChange(e,t==="current",Re.EMPTY_BYTE_STRING);await Dn(s,o,a);break}case"rejected":await ss(s.localStore,e,!0),as(s,e,r);break;default:U()}}async function CC(n,e,t){const r=oc(n);if(r.Qa){for(const s of e){if(r.Ma.has(s)&&r.sharedClientState.isActiveQueryTarget(s)){k("SyncEngine","Adding an already active target "+s);continue}const i=await Ly(r.localStore,s),o=await Ia(r.localStore,i);await hh(r,eE(i),o.targetId,!1,o.resumeToken),ic(r.remoteStore,o)}for(const s of t)r.Ma.has(s)&&await ss(r.localStore,s,!1).then(()=>{is(r.remoteStore,s),as(r,s)}).catch(Cn)}}function oc(n){const e=F(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Xy.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=IC.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=mC.bind(null,e),e.Ca.d_=iC.bind(null,e.eventManager),e.Ca.$a=oC.bind(null,e.eventManager),e}function _h(n){const e=F(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=gC.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=yC.bind(null,e),e}class Di{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=rc(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return Oy(this.persistence,new xy,e.initialUser,this.serializer)}Ga(e){return new Dy(nc.Zr,this.serializer)}Wa(e){return new By}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Di.provider={build:()=>new Di};class tE extends Di{constructor(e,t,r){super(),this.Ja=e,this.cacheSizeBytes=t,this.forceOwnership=r,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Ja.initialize(this,e),await _h(this.Ja.syncEngine),await Es(this.Ja.remoteStore),await this.persistence.yi(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}za(e){return Oy(this.persistence,new xy,e.initialUser,this.serializer)}ja(e,t){const r=this.persistence.referenceDelegate.garbageCollector;return new mR(r,e.asyncQueue,t)}Ha(e,t){const r=new zb(t,this.persistence);return new Hb(e.asyncQueue,r)}Ga(e){const t=ky(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),r=this.cacheSizeBytes!==void 0?tt.withCacheSize(this.cacheSizeBytes):tt.DEFAULT;return new Zu(this.synchronizeTabs,t,e.clientId,r,e.asyncQueue,$y(),ta(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Wa(e){return new By}}class PC extends tE{constructor(e,t){super(e,t,!1),this.Ja=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.Ja.syncEngine;this.sharedClientState instanceof ll&&(this.sharedClientState.syncEngine={no:AC.bind(null,t),ro:RC.bind(null,t),io:CC.bind(null,t),Qi:SC.bind(null,t),eo:wC.bind(null,t)},await this.sharedClientState.start()),await this.persistence.yi(async r=>{await bC(this.Ja.syncEngine,r),this.gcScheduler&&(r&&!this.gcScheduler.started?this.gcScheduler.start():r||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(r&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():r||this.indexBackfillerScheduler.stop())})}Wa(e){const t=$y();if(!ll.D(t))throw new O(N.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const r=ky(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new ll(t,e.asyncQueue,r,e.clientId,e.initialUser)}}class ki{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>i_(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=vC.bind(null,this.syncEngine),await Jl(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new sC}()}createDatastore(e){const t=rc(e.databaseInfo.databaseId),r=function(i){return new $R(i)}(e.databaseInfo);return function(i,o,a,l){return new WR(i,o,a,l)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,o,a){return new HR(r,s,i,o,a)}(this.localStore,this.datastore,e.asyncQueue,t=>i_(this.syncEngine,t,0),function(){return e_.D()?new e_:new FR}())}createSyncEngine(e,t){return function(s,i,o,a,l,u,d){const f=new uC(s,i,o,a,l,u);return d&&(f.Qa=!0),f}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=F(s);k("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await to(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}ki.provider={build:()=>new ki};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mh{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):Se("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NC{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=Oe.UNAUTHENTICATED,this.clientId=Eg.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async o=>{k("FirestoreClient","Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(k("FirestoreClient","Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Et;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=oh(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function hl(n,e){n.asyncQueue.verifyOperationInProgress(),k("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await Vy(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function a_(n,e){n.asyncQueue.verifyOperationInProgress();const t=await DC(n);k("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>t_(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>t_(e.remoteStore,s)),n._onlineComponents=e}async function DC(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){k("FirestoreClient","Using user provided OfflineComponentProvider");try{await hl(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===N.FAILED_PRECONDITION||s.code===N.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;Yr("Error using user provided cache. Falling back to memory cache: "+t),await hl(n,new Di)}}else k("FirestoreClient","Using default OfflineComponentProvider"),await hl(n,new Di);return n._offlineComponents}async function gh(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(k("FirestoreClient","Using user provided OnlineComponentProvider"),await a_(n,n._uninitializedComponentsProvider._online)):(k("FirestoreClient","Using default OnlineComponentProvider"),await a_(n,new ki))),n._onlineComponents}function kC(n){return gh(n).then(e=>e.syncEngine)}function xC(n){return gh(n).then(e=>e.datastore)}async function ba(n){const e=await gh(n),t=e.eventManager;return t.onListen=hC.bind(null,e.syncEngine),t.onUnlisten=fC.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=dC.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=pC.bind(null,e.syncEngine),t}function OC(n,e,t={}){const r=new Et;return n.asyncQueue.enqueueAndForget(async()=>function(i,o,a,l,u){const d=new mh({next:_=>{d.Za(),o.enqueueAndForget(()=>ch(i,f));const g=_.docs.has(a);!g&&_.fromCache?u.reject(new O(N.UNAVAILABLE,"Failed to get document because the client is offline.")):g&&_.fromCache&&l&&l.source==="server"?u.reject(new O(N.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(_)},error:_=>u.reject(_)}),f=new uh(Qi(a.path),d,{includeMetadataChanges:!0,_a:!0});return ah(i,f)}(await ba(n),n.asyncQueue,e,t,r)),r.promise}function VC(n,e,t={}){const r=new Et;return n.asyncQueue.enqueueAndForget(async()=>function(i,o,a,l,u){const d=new mh({next:_=>{d.Za(),o.enqueueAndForget(()=>ch(i,f)),_.fromCache&&l.source==="server"?u.reject(new O(N.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(_)},error:_=>u.reject(_)}),f=new uh(a,d,{includeMetadataChanges:!0,_a:!0});return ah(i,f)}(await ba(n),n.asyncQueue,e,t,r)),r.promise}function MC(n,e,t){const r=new Et;return n.asyncQueue.enqueueAndForget(async()=>{try{const s=await xC(n);r.resolve(async function(o,a,l){var u;const d=F(o),{request:f,ut:_,parent:g}=XS(d.serializer,SS(a),l);d.connection.Fo||delete f.parent;const w=(await d.Lo("RunAggregationQuery",d.serializer.databaseId,g,f,1)).filter(P=>!!P.result);q(w.length===1);const D=(u=w[0].result)===null||u===void 0?void 0:u.aggregateFields;return Object.keys(D).reduce((P,B)=>(P[_[B]]=D[B],P),{})}(s,e,t))}catch(s){r.reject(s)}}),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nE(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c_=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yh(n,e,t){if(!t)throw new O(N.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function LC(n,e,t,r){if(e===!0&&r===!0)throw new O(N.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function l_(n){if(!M.isDocumentKey(n))throw new O(N.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function u_(n){if(M.isDocumentKey(n))throw new O(N.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function ac(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":U()}function Be(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new O(N.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ac(n);throw new O(N.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function FC(n,e){if(e<=0)throw new O(N.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class h_{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new O(N.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new O(N.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}LC("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=nE((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new O(N.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new O(N.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new O(N.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class no{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new h_({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new O(N.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new O(N.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new h_(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Vb;switch(r.type){case"firstParty":return new Ub(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new O(N.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=c_.get(t);r&&(k("ComponentProvider","Removing Datastore"),c_.delete(t),r.terminate())}(this),Promise.resolve()}}function UC(n,e,t,r={}){var s;const i=(n=Be(n,no))._getSettings(),o=`${e}:${t}`;if(i.host!=="firestore.googleapis.com"&&i.host!==o&&Yr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},i),{host:o,ssl:!1})),r.mockUserToken){let a,l;if(typeof r.mockUserToken=="string")a=r.mockUserToken,l=Oe.MOCK_USER;else{a=nT(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const u=r.mockUserToken.sub||r.mockUserToken.user_id;if(!u)throw new O(N.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");l=new Oe(u)}n._authCredentials=new Mb(new yg(a,l))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Nt(this.firestore,e,this._query)}}class Ke{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new vn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Ke(this.firestore,e,this._key)}}class vn extends Nt{constructor(e,t,r){super(e,t,Qi(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Ke(this.firestore,null,new M(e))}withConverter(e){return new vn(this.firestore,e,this._path)}}function PV(n,e,...t){if(n=_e(n),yh("collection","path",e),n instanceof no){const r=se.fromString(e,...t);return u_(r),new vn(n,null,r)}{if(!(n instanceof Ke||n instanceof vn))throw new O(N.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(se.fromString(e,...t));return u_(r),new vn(n.firestore,null,r)}}function NV(n,e){if(n=Be(n,no),yh("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new O(N.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new Nt(n,null,function(r){return new yr(se.emptyPath(),r)}(e))}function BC(n,e,...t){if(n=_e(n),arguments.length===1&&(e=Eg.newId()),yh("doc","path",e),n instanceof no){const r=se.fromString(e,...t);return l_(r),new Ke(n,null,new M(r))}{if(!(n instanceof Ke||n instanceof vn))throw new O(N.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(se.fromString(e,...t));return l_(r),new Ke(n.firestore,n instanceof vn?n.converter:null,new M(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class d_{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new qy(this,"async_queue_retry"),this.Vu=()=>{const r=ta();r&&k("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=ta();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=ta();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new Et;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Pn(e))throw e;k("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(o){let a=o.message||"";return o.stack&&(a=o.stack.includes(o.message)?o.stack:o.message+`
`+o.stack),a}(r);throw Se("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const s=ih.createAndSchedule(this,e,t,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&U()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}function f_(n){return function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1}(n,["next","error","complete"])}class It extends no{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new d_,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new d_(e),this._firestoreClient=void 0,await e}}}function DV(n,e,t){t||(t="(default)");const r=Wa(n,"firestore");if(r.isInitialized(t)){const s=r.getImmediate({identifier:t}),i=r.getOptions(t);if(Jn(i,e))return s;throw new O(N.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new O(N.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new O(N.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return r.initialize({options:e,instanceIdentifier:t})}function kV(n,e){const t=typeof n=="object"?n:Cm(),r=typeof n=="string"?n:"(default)",s=Wa(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=eT("firestore");i&&UC(s,...i)}return s}function Is(n){if(n._terminated)throw new O(N.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||$C(n),n._firestoreClient}function $C(n){var e,t,r;const s=n._freezeSettings(),i=function(a,l,u,d){return new _S(a,l,u,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,nE(d.experimentalLongPollingOptions),d.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new NC(n._authCredentials,n._appCheckCredentials,n._queue,i,n._componentsProvider&&function(a){const l=a==null?void 0:a._online.build();return{_offline:a==null?void 0:a._offline.build(l),_online:l}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qC{constructor(e="count",t){this._internalFieldPath=t,this.type="AggregateField",this.aggregateType=e}}class jC{constructor(e,t,r){this._userDataWriter=t,this._data=r,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cs{constructor(e){this._byteString=e}static fromBase64String(e){try{return new cs(Re.fromBase64String(e))}catch(t){throw new O(N.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new cs(Re.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ro{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new O(N.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ye(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vr{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eh{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new O(N.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new O(N.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return K(this._lat,e._lat)||K(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vh{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WC=/^__.*__$/;class GC{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Jt(e,this.data,this.fieldMask,t,this.fieldTransforms):new ys(e,this.data,t,this.fieldTransforms)}}class rE{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Jt(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function sE(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw U()}}class cc{constructor(e,t,r,s,i,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new cc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return Sa(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(sE(this.Cu)&&WC.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class HC{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||rc(e)}Qu(e,t,r,s=!1){return new cc({Cu:e,methodName:t,qu:r,path:ye.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function so(n){const e=n._freezeSettings(),t=rc(n._databaseId);return new HC(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Ih(n,e,t,r,s,i={}){const o=n.Qu(i.merge||i.mergeFields?2:0,e,t,s);Sh("Data must be an object, but it was:",o,r);const a=cE(r,o);let l,u;if(i.merge)l=new st(o.fieldMask),u=o.fieldTransforms;else if(i.mergeFields){const d=[];for(const f of i.mergeFields){const _=eu(e,f,t);if(!o.contains(_))throw new O(N.INVALID_ARGUMENT,`Field '${_}' is specified in your field mask but missing from your input data.`);uE(d,_)||d.push(_)}l=new st(d),u=o.fieldTransforms.filter(f=>l.covers(f.field))}else l=null,u=o.fieldTransforms;return new GC(new ze(a),l,u)}class io extends vr{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof io}}function iE(n,e,t){return new cc({Cu:3,qu:e.settings.qu,methodName:n._methodName,xu:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class Th extends vr{_toFieldTransform(e){return new Ji(e.path,new ts)}isEqual(e){return e instanceof Th}}class wh extends vr{constructor(e,t){super(e),this.Ku=t}_toFieldTransform(e){const t=iE(this,e,!0),r=this.Ku.map(i=>Ir(i,t)),s=new ir(r);return new Ji(e.path,s)}isEqual(e){return e instanceof wh&&Jn(this.Ku,e.Ku)}}class Ah extends vr{constructor(e,t){super(e),this.Ku=t}_toFieldTransform(e){const t=iE(this,e,!0),r=this.Ku.map(i=>Ir(i,t)),s=new or(r);return new Ji(e.path,s)}isEqual(e){return e instanceof Ah&&Jn(this.Ku,e.Ku)}}class bh extends vr{constructor(e,t){super(e),this.$u=t}_toFieldTransform(e){const t=new ns(e.serializer,Zg(e.serializer,this.$u));return new Ji(e.path,t)}isEqual(e){return e instanceof bh&&this.$u===e.$u}}function oE(n,e,t,r){const s=n.Qu(1,e,t);Sh("Data must be an object, but it was:",s,r);const i=[],o=ze.empty();gr(r,(l,u)=>{const d=Rh(e,l,t);u=_e(u);const f=s.Nu(d);if(u instanceof io)i.push(d);else{const _=Ir(u,f);_!=null&&(i.push(d),o.set(d,_))}});const a=new st(i);return new rE(o,a,s.fieldTransforms)}function aE(n,e,t,r,s,i){const o=n.Qu(1,e,t),a=[eu(e,r,t)],l=[s];if(i.length%2!=0)throw new O(N.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let _=0;_<i.length;_+=2)a.push(eu(e,i[_])),l.push(i[_+1]);const u=[],d=ze.empty();for(let _=a.length-1;_>=0;--_)if(!uE(u,a[_])){const g=a[_];let w=l[_];w=_e(w);const D=o.Nu(g);if(w instanceof io)u.push(g);else{const P=Ir(w,D);P!=null&&(u.push(g),d.set(g,P))}}const f=new st(u);return new rE(d,f,o.fieldTransforms)}function zC(n,e,t,r=!1){return Ir(t,n.Qu(r?4:3,e))}function Ir(n,e){if(lE(n=_e(n)))return Sh("Unsupported field value:",e,n),cE(n,e);if(n instanceof vr)return function(r,s){if(!sE(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let o=0;for(const a of r){let l=Ir(a,s.Lu(o));l==null&&(l={nullValue:"NULL_VALUE"}),i.push(l),o++}return{arrayValue:{values:i}}}(n,e)}return function(r,s){if((r=_e(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return Zg(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=ve.fromDate(r);return{timestampValue:rs(s.serializer,i)}}if(r instanceof ve){const i=new ve(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:rs(s.serializer,i)}}if(r instanceof Eh)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof cs)return{bytesValue:uy(s.serializer,r._byteString)};if(r instanceof Ke){const i=s.databaseId,o=r.firestore._databaseId;if(!o.isEqual(i))throw s.Bu(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Ku(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof vh)return function(o,a){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:o.toArray().map(l=>{if(typeof l!="number")throw a.Bu("VectorValues must only contain numeric values.");return ju(a.serializer,l)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${ac(r)}`)}(n,e)}function cE(n,e){const t={};return Dg(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):gr(n,(r,s)=>{const i=Ir(s,e.Mu(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function lE(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof ve||n instanceof Eh||n instanceof cs||n instanceof Ke||n instanceof vr||n instanceof vh)}function Sh(n,e,t){if(!lE(t)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(t)){const r=ac(t);throw r==="an object"?e.Bu(n+" a custom object"):e.Bu(n+" "+r)}}function eu(n,e,t){if((e=_e(e))instanceof ro)return e._internalPath;if(typeof e=="string")return Rh(n,e);throw Sa("Field path arguments must be of type string or ",n,!1,void 0,t)}const KC=new RegExp("[~\\*/\\[\\]]");function Rh(n,e,t){if(e.search(KC)>=0)throw Sa(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new ro(...e.split("."))._internalPath}catch{throw Sa(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Sa(n,e,t,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let a=`Function ${e}() called with invalid data`;t&&(a+=" (via `toFirestore()`)"),a+=". ";let l="";return(i||o)&&(l+=" (found",i&&(l+=` in field ${r}`),o&&(l+=` in document ${s}`),l+=")"),new O(N.INVALID_ARGUMENT,a+n+l)}function uE(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hE{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Ke(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new QC(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(lc("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class QC extends hE{data(){return super.data()}}function lc(n,e){return typeof e=="string"?Rh(n,e):e instanceof ro?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dE(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new O(N.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Ch{}let Ph=class extends Ch{};function OV(n,e,...t){let r=[];e instanceof Ch&&r.push(e),r=r.concat(t),function(i){const o=i.filter(l=>l instanceof Nh).length,a=i.filter(l=>l instanceof uc).length;if(o>1||o>0&&a>0)throw new O(N.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)n=s._apply(n);return n}class uc extends Ph{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new uc(e,t,r)}_apply(e){const t=this._parse(e);return fE(e._query,t),new Nt(e.firestore,e.converter,$l(e._query,t))}_parse(e){const t=so(e.firestore);return function(i,o,a,l,u,d,f){let _;if(u.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new O(N.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){__(f,d);const g=[];for(const w of f)g.push(p_(l,i,w));_={arrayValue:{values:g}}}else _=p_(l,i,f)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||__(f,d),_=zC(a,o,f,d==="in"||d==="not-in");return te.create(u,d,_)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function VV(n,e,t){const r=e,s=lc("where",n);return uc._create(s,r,t)}class Nh extends Ch{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Nh(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:oe.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(s,i){let o=s;const a=i.getFlattenedFilters();for(const l of a)fE(o,l),o=$l(o,l)}(e._query,t),new Nt(e.firestore,e.converter,$l(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Dh extends Ph{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Dh(e,t)}_apply(e){const t=function(s,i,o){if(s.startAt!==null)throw new O(N.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new O(N.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Ni(i,o)}(e._query,this._field,this._direction);return new Nt(e.firestore,e.converter,function(s,i){const o=s.explicitOrderBy.concat([i]);return new yr(s.path,s.collectionGroup,o,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,t))}}function MV(n,e="asc"){const t=e,r=lc("orderBy",n);return Dh._create(r,t)}class kh extends Ph{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new kh(e,t,r)}_apply(e){return new Nt(e.firestore,e.converter,_a(e._query,this._limit,this._limitType))}}function LV(n){return FC("limit",n),kh._create("limit",n,"F")}function p_(n,e,t){if(typeof(t=_e(t))=="string"){if(t==="")throw new O(N.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Wg(e)&&t.indexOf("/")!==-1)throw new O(N.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(se.fromString(t));if(!M.isDocumentKey(r))throw new O(N.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Ci(n,new M(r))}if(t instanceof Ke)return Ci(n,t._key);throw new O(N.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ac(t)}.`)}function __(n,e){if(!Array.isArray(n)||n.length===0)throw new O(N.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function fE(n,e){const t=function(s,i){for(const o of s)for(const a of o.getFlattenedFilters())if(i.indexOf(a.op)>=0)return a.op;return null}(n.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new O(N.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new O(N.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class YC{convertValue(e,t="none"){switch(rr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ge(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Tn(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw U()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return gr(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var t,r,s;const i=(s=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(o=>ge(o.doubleValue));return new vh(i)}convertGeoPoint(e){return new Eh(ge(e.latitude),ge(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Bu(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Si(e));default:return null}}convertTimestamp(e){const t=zt(e);return new ve(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=se.fromString(e);q(Ey(r));const s=new nr(r.get(1),r.get(3)),i=new M(r.popFirst(5));return s.isEqual(t)||Se(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xh(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}function JC(){return new qC("count")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ai{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class pE extends hE{constructor(e,t,r,s,i,o){super(e,t,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new na(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(lc("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class na extends pE{data(e={}){return super.data(e)}}class _E{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new ai(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new na(this._firestore,this._userDataWriter,r.key,r,new ai(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new O(N.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(a=>{const l=new na(s._firestore,s._userDataWriter,a.doc.key,a.doc,new ai(s._snapshot.mutatedKeys.has(a.doc.key),s._snapshot.fromCache),s.query.converter);return a.doc,{type:"added",doc:l,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(a=>i||a.type!==3).map(a=>{const l=new na(s._firestore,s._userDataWriter,a.doc.key,a.doc,new ai(s._snapshot.mutatedKeys.has(a.doc.key),s._snapshot.fromCache),s.query.converter);let u=-1,d=-1;return a.type!==0&&(u=o.indexOf(a.doc.key),o=o.delete(a.doc.key)),a.type!==1&&(o=o.add(a.doc),d=o.indexOf(a.doc.key)),{type:XC(a.type),doc:l,oldIndex:u,newIndex:d}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function XC(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return U()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function FV(n){n=Be(n,Ke);const e=Be(n.firestore,It);return OC(Is(e),n._key).then(t=>mE(e,n,t))}class hc extends YC{constructor(e){super(),this.firestore=e}convertBytes(e){return new cs(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ke(this.firestore,null,t)}}function UV(n){n=Be(n,Nt);const e=Be(n.firestore,It),t=Is(e),r=new hc(e);return dE(n._query),VC(t,n._query).then(s=>new _E(e,r,n,s))}function BV(n,e,t){n=Be(n,Ke);const r=Be(n.firestore,It),s=xh(n.converter,e,t);return oo(r,[Ih(so(r),"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,Pe.none())])}function $V(n,e,t,...r){n=Be(n,Ke);const s=Be(n.firestore,It),i=so(s);let o;return o=typeof(e=_e(e))=="string"||e instanceof ro?aE(i,"updateDoc",n._key,e,t,r):oE(i,"updateDoc",n._key,e),oo(s,[o.toMutation(n._key,Pe.exists(!0))])}function qV(n){return oo(Be(n.firestore,It),[new Xi(n._key,Pe.none())])}function jV(n,e){const t=Be(n.firestore,It),r=BC(n),s=xh(n.converter,e);return oo(t,[Ih(so(n.firestore),"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,Pe.exists(!1))]).then(()=>r)}function WV(n,...e){var t,r,s;n=_e(n);let i={includeMetadataChanges:!1,source:"default"},o=0;typeof e[o]!="object"||f_(e[o])||(i=e[o],o++);const a={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(f_(e[o])){const f=e[o];e[o]=(t=f.next)===null||t===void 0?void 0:t.bind(f),e[o+1]=(r=f.error)===null||r===void 0?void 0:r.bind(f),e[o+2]=(s=f.complete)===null||s===void 0?void 0:s.bind(f)}let l,u,d;if(n instanceof Ke)u=Be(n.firestore,It),d=Qi(n._key.path),l={next:f=>{e[o]&&e[o](mE(u,n,f))},error:e[o+1],complete:e[o+2]};else{const f=Be(n,Nt);u=Be(f.firestore,It),d=f._query;const _=new hc(u);l={next:g=>{e[o]&&e[o](new _E(u,_,f,g))},error:e[o+1],complete:e[o+2]},dE(n._query)}return function(_,g,w,D){const P=new mh(D),B=new uh(g,P,w);return _.asyncQueue.enqueueAndForget(async()=>ah(await ba(_),B)),()=>{P.Za(),_.asyncQueue.enqueueAndForget(async()=>ch(await ba(_),B))}}(Is(u),d,a,l)}function oo(n,e){return function(r,s){const i=new Et;return r.asyncQueue.enqueueAndForget(async()=>_C(await kC(r),s,i)),i.promise}(Is(n),e)}function mE(n,e,t){const r=t.docs.get(e._key),s=new hc(n);return new pE(n,s,e._key,r,new ai(t.hasPendingWrites,t.fromCache),e.converter)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GV(n){return ZC(n,{count:JC()})}function ZC(n,e){const t=Be(n.firestore,It),r=Is(t),s=fS(e,(i,o)=>new FS(o,i.aggregateType,i._internalFieldPath));return MC(r,n._query,s).then(i=>function(a,l,u){const d=new hc(a);return new jC(l,d,u)}(t,n,i))}class eP{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=rP(),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}function HV(n){return new eP(n)}class tP{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=ki.provider,this._offlineComponentProvider={build:t=>new tE(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}class nP{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=ki.provider,this._offlineComponentProvider={build:t=>new PC(t,e==null?void 0:e.cacheSizeBytes)}}}function rP(n){return new tP(void 0)}function zV(){return new nP}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sP{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=so(e)}set(e,t,r){this._verifyNotCommitted();const s=dl(e,this._firestore),i=xh(s.converter,t,r),o=Ih(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(o.toMutation(s._key,Pe.none())),this}update(e,t,r,...s){this._verifyNotCommitted();const i=dl(e,this._firestore);let o;return o=typeof(t=_e(t))=="string"||t instanceof ro?aE(this._dataReader,"WriteBatch.update",i._key,t,r,s):oE(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,Pe.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=dl(e,this._firestore);return this._mutations=this._mutations.concat(new Xi(t._key,Pe.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new O(N.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function dl(n,e){if((n=_e(n)).firestore!==e)throw new O(N.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function KV(){return new io("deleteField")}function QV(){return new Th("serverTimestamp")}function YV(...n){return new wh("arrayUnion",n)}function JV(...n){return new Ah("arrayRemove",n)}function XV(n){return new bh("increment",n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ZV(n){return Is(n=Be(n,It)),new sP(n,e=>oo(n,e))}(function(e,t=!0){(function(s){gs=s})(_s),Kr(new Xn("firestore",(r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),a=new It(new Lb(r.getProvider("auth-internal")),new $b(r.getProvider("app-check-internal")),function(u,d){if(!Object.prototype.hasOwnProperty.apply(u.options,["projectId"]))throw new O(N.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new nr(u.options.projectId,d)}(o,s),o);return i=Object.assign({useFetchStreams:t},i),a._setSettings(i),a},"PUBLIC").setMultipleInstances(!0)),gn(ap,"4.7.3",e),gn(ap,"4.7.3","esm2017")})();var iP="firebase",oP="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */gn(iP,oP,"app");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gE=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},aP=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],a=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},cP={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,a=o?n[s+1]:0,l=s+2<n.length,u=l?n[s+2]:0,d=i>>2,f=(i&3)<<4|a>>4;let _=(a&15)<<2|u>>6,g=u&63;l||(g=64,o||(_=64)),r.push(t[d],t[f],t[_],t[g])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(gE(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):aP(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],a=s<n.length?t[n.charAt(s)]:0;++s;const u=s<n.length?t[n.charAt(s)]:64;++s;const f=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||a==null||u==null||f==null)throw Error();const _=i<<2|a>>4;if(r.push(_),u!==64){const g=a<<4&240|u>>2;if(r.push(g),f!==64){const w=u<<6&192|f;r.push(w)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}},lP=function(n){const e=gE(n);return cP.encodeByteArray(e,!0)},yE=function(n){return lP(n).replace(/\./g,"")};function uP(){return typeof indexedDB=="object"}function hP(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dP="FirebaseError";let Oh=class EE extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=dP,Object.setPrototypeOf(this,EE.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,vE.prototype.create)}},vE=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?fP(i,r):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new Oh(s,a,r)}};function fP(n,e){return n.replace(pP,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const pP=/\{\$([^}]+)}/g;let tu=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var pe;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(pe||(pe={}));const _P={debug:pe.DEBUG,verbose:pe.VERBOSE,info:pe.INFO,warn:pe.WARN,error:pe.ERROR,silent:pe.SILENT},mP=pe.INFO,gP={[pe.DEBUG]:"log",[pe.VERBOSE]:"log",[pe.INFO]:"info",[pe.WARN]:"warn",[pe.ERROR]:"error"},yP=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=gP[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};let EP=class{constructor(e){this.name=e,this._logLevel=mP,this._logHandler=yP,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in pe))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?_P[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,pe.DEBUG,...e),this._logHandler(this,pe.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,pe.VERBOSE,...e),this._logHandler(this,pe.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,pe.INFO,...e),this._logHandler(this,pe.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,pe.WARN,...e),this._logHandler(this,pe.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,pe.ERROR,...e),this._logHandler(this,pe.ERROR,...e)}};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vP{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(IP(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function IP(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const nu="@firebase/app",m_="0.7.33";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ur=new EP("@firebase/app"),TP="@firebase/app-compat",wP="@firebase/analytics-compat",AP="@firebase/analytics",bP="@firebase/app-check-compat",SP="@firebase/app-check",RP="@firebase/auth",CP="@firebase/auth-compat",PP="@firebase/database",NP="@firebase/database-compat",DP="@firebase/functions",kP="@firebase/functions-compat",xP="@firebase/installations",OP="@firebase/installations-compat",VP="@firebase/messaging",MP="@firebase/messaging-compat",LP="@firebase/performance",FP="@firebase/performance-compat",UP="@firebase/remote-config",BP="@firebase/remote-config-compat",$P="@firebase/storage",qP="@firebase/storage-compat",jP="@firebase/firestore",WP="@firebase/firestore-compat",GP="firebase",HP="9.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zP="[DEFAULT]",KP={[nu]:"fire-core",[TP]:"fire-core-compat",[AP]:"fire-analytics",[wP]:"fire-analytics-compat",[SP]:"fire-app-check",[bP]:"fire-app-check-compat",[RP]:"fire-auth",[CP]:"fire-auth-compat",[PP]:"fire-rtdb",[NP]:"fire-rtdb-compat",[DP]:"fire-fn",[kP]:"fire-fn-compat",[xP]:"fire-iid",[OP]:"fire-iid-compat",[VP]:"fire-fcm",[MP]:"fire-fcm-compat",[LP]:"fire-perf",[FP]:"fire-perf-compat",[UP]:"fire-rc",[BP]:"fire-rc-compat",[$P]:"fire-gcs",[qP]:"fire-gcs-compat",[jP]:"fire-fst",[WP]:"fire-fst-compat","fire-js":"fire-js",[GP]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IE=new Map,g_=new Map;function QP(n,e){try{n.container.addComponent(e)}catch(t){ur.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function ls(n){const e=n.name;if(g_.has(e))return ur.debug(`There were multiple attempts to register component ${e}.`),!1;g_.set(e,n);for(const t of IE.values())QP(t,n);return!0}function Vh(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YP={"no-app":"No Firebase App '{$appName}' has been created - call Firebase App.initializeApp()","bad-app-name":"Illegal App name: '{$appName}","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}."},dc=new vE("app","Firebase",YP);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TE=HP;function Mh(n=zP){const e=IE.get(n);if(!e)throw dc.create("no-app",{appName:n});return e}function qt(n,e,t){var r;let s=(r=KP[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const i=s.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const a=[`Unable to register library "${s}" with version "${e}":`];i&&a.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&a.push("and"),o&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),ur.warn(a.join(" "));return}ls(new tu(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const JP="firebase-heartbeat-database",XP=1,xi="firebase-heartbeat-store";let fl=null;function wE(){return fl||(fl=HI(JP,XP,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(xi)}}}).catch(n=>{throw dc.create("idb-open",{originalErrorMessage:n.message})})),fl}async function ZP(n){var e;try{return(await wE()).transaction(xi).objectStore(xi).get(AE(n))}catch(t){if(t instanceof Oh)ur.warn(t.message);else{const r=dc.create("idb-get",{originalErrorMessage:(e=t)===null||e===void 0?void 0:e.message});ur.warn(r.message)}}}async function y_(n,e){var t;try{const s=(await wE()).transaction(xi,"readwrite");return await s.objectStore(xi).put(e,AE(n)),s.done}catch(r){if(r instanceof Oh)ur.warn(r.message);else{const s=dc.create("idb-set",{originalErrorMessage:(t=r)===null||t===void 0?void 0:t.message});ur.warn(s.message)}}}function AE(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const e0=1024,t0=30*24*60*60*1e3;class n0{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new s0(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){const t=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=E_();if(this._heartbeatsCache===null&&(this._heartbeatsCache=await this._heartbeatsCachePromise),!(this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(s=>s.date===r)))return this._heartbeatsCache.heartbeats.push({date:r,agent:t}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(s=>{const i=new Date(s.date).valueOf();return Date.now()-i<=t0}),this._storage.overwrite(this._heartbeatsCache)}async getHeartbeatsHeader(){if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache===null||this._heartbeatsCache.heartbeats.length===0)return"";const e=E_(),{heartbeatsToSend:t,unsentEntries:r}=r0(this._heartbeatsCache.heartbeats),s=yE(JSON.stringify({version:2,heartbeats:t}));return this._heartbeatsCache.lastSentHeartbeatDate=e,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}}function E_(){return new Date().toISOString().substring(0,10)}function r0(n,e=e0){const t=[];let r=n.slice();for(const s of n){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),v_(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),v_(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class s0{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return uP()?hP().then(()=>!0).catch(()=>!1):!1}async read(){return await this._canUseIndexedDBPromise?await ZP(this.app)||{heartbeats:[]}:{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return y_(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return y_(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function v_(n){return yE(JSON.stringify({version:2,heartbeats:n})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function i0(n){ls(new tu("platform-logger",e=>new vP(e),"PRIVATE")),ls(new tu("heartbeat",e=>new n0(e),"PRIVATE")),qt(nu,m_,n),qt(nu,m_,"esm2017"),qt("fire-js","")}i0("");var I_={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bE=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},o0=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],a=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},SE={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,a=o?n[s+1]:0,l=s+2<n.length,u=l?n[s+2]:0,d=i>>2,f=(i&3)<<4|a>>4;let _=(a&15)<<2|u>>6,g=u&63;l||(g=64,o||(_=64)),r.push(t[d],t[f],t[_],t[g])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(bE(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):o0(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],a=s<n.length?t[n.charAt(s)]:0;++s;const u=s<n.length?t[n.charAt(s)]:64;++s;const f=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||a==null||u==null||f==null)throw new a0;const _=i<<2|a>>4;if(r.push(_),u!==64){const g=a<<4&240|u>>2;if(r.push(g),f!==64){const w=u<<6&192|f;r.push(w)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let a0=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const c0=function(n){const e=bE(n);return SE.encodeByteArray(e,!0)},T_=function(n){return c0(n).replace(/\./g,"")},l0=function(n){try{return SE.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function u0(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const h0=()=>u0().__FIREBASE_DEFAULTS__,d0=()=>{if(typeof process>"u"||typeof I_>"u")return;const n=I_.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},f0=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&l0(n[1]);return e&&JSON.parse(e)},p0=()=>{try{return h0()||d0()||f0()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},_0=n=>{var e,t;return(t=(e=p0())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},m0=n=>{const e=_0(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function g0(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},n);return[T_(JSON.stringify(t)),T_(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const y0="FirebaseError";let RE=class CE extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=y0,Object.setPrototypeOf(this,CE.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,E0.prototype.create)}},E0=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?v0(i,r):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new RE(s,a,r)}};function v0(n,e){return n.replace(I0,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const I0=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ts(n){return n&&n._delegate?n._delegate:n}let T0=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PE="firebasestorage.googleapis.com",NE="storageBucket",w0=2*60*1e3,A0=10*60*1e3,b0=1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Te extends RE{constructor(e,t,r=0){super(pl(e),`Firebase Storage: ${t} (${pl(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,Te.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return pl(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var me;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(me||(me={}));function pl(n){return"storage/"+n}function Lh(){const n="An unknown error occurred, please check the error payload for server response.";return new Te(me.UNKNOWN,n)}function S0(n){return new Te(me.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function R0(n){return new Te(me.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function C0(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new Te(me.UNAUTHENTICATED,n)}function P0(){return new Te(me.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function N0(n){return new Te(me.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function DE(){return new Te(me.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function kE(){return new Te(me.CANCELED,"User canceled the upload/download.")}function D0(n){return new Te(me.INVALID_URL,"Invalid URL '"+n+"'.")}function k0(n){return new Te(me.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function x0(){return new Te(me.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+NE+"' property when initializing the app?")}function xE(){return new Te(me.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function O0(){return new Te(me.SERVER_FILE_WRONG_SIZE,"Server recorded incorrect upload file size, please retry the upload.")}function V0(){return new Te(me.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function M0(n){return new Te(me.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function ru(n){return new Te(me.INVALID_ARGUMENT,n)}function OE(){return new Te(me.APP_DELETED,"The Firebase app was deleted.")}function L0(n){return new Te(me.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function _i(n,e){return new Te(me.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function Ys(n){throw new Te(me.INTERNAL_ERROR,"Internal error: "+n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=lt.makeFromUrl(e,t)}catch{return new lt(e,"")}if(r.path==="")return r;throw k0(e)}static makeFromUrl(e,t){let r=null;const s="([A-Za-z0-9.\\-_]+)";function i(j){j.path.charAt(j.path.length-1)==="/"&&(j.path_=j.path_.slice(0,-1))}const o="(/(.*))?$",a=new RegExp("^gs://"+s+o,"i"),l={bucket:1,path:3};function u(j){j.path_=decodeURIComponent(j.path)}const d="v[A-Za-z0-9_]+",f=t.replace(/[.]/g,"\\."),_="(/([^?#]*).*)?$",g=new RegExp(`^https?://${f}/${d}/b/${s}/o${_}`,"i"),w={bucket:1,path:3},D=t===PE?"(?:storage.googleapis.com|storage.cloud.google.com)":t,P="([^?#]*)",B=new RegExp(`^https?://${D}/${s}/${P}`,"i"),L=[{regex:a,indices:l,postModify:i},{regex:g,indices:w,postModify:u},{regex:B,indices:{bucket:1,path:2},postModify:u}];for(let j=0;j<L.length;j++){const Z=L[j],z=Z.regex.exec(e);if(z){const I=z[Z.indices.bucket];let y=z[Z.indices.path];y||(y=""),r=new lt(I,y),Z.postModify(r);break}}if(r==null)throw D0(e);return r}}class F0{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function U0(n,e,t){let r=1,s=null,i=null,o=!1,a=0;function l(){return a===2}let u=!1;function d(...P){u||(u=!0,e.apply(null,P))}function f(P){s=setTimeout(()=>{s=null,n(g,l())},P)}function _(){i&&clearTimeout(i)}function g(P,...B){if(u){_();return}if(P){_(),d.call(null,P,...B);return}if(l()||o){_(),d.call(null,P,...B);return}r<64&&(r*=2);let L;a===1?(a=2,L=0):L=(r+Math.random())*1e3,f(L)}let w=!1;function D(P){w||(w=!0,_(),!u&&(s!==null?(P||(a=2),clearTimeout(s),f(0)):P||(a=1)))}return f(0),i=setTimeout(()=>{o=!0,D(!0)},t),D}function B0(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $0(n){return n!==void 0}function q0(n){return typeof n=="function"}function j0(n){return typeof n=="object"&&!Array.isArray(n)}function fc(n){return typeof n=="string"||n instanceof String}function w_(n){return Fh()&&n instanceof Blob}function Fh(){return typeof Blob<"u"}function A_(n,e,t,r){if(r<e)throw ru(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw ru(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ws(n,e,t){let r=e;return t==null&&(r=`https://${e}`),`${t}://${r}/v0${n}`}function VE(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const s=e(r)+"="+e(n[r]);t=t+s+"&"}return t=t.slice(0,-1),t}var Qn;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(Qn||(Qn={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ME(n,e){const t=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,i=e.indexOf(n)!==-1;return t||s||i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W0{constructor(e,t,r,s,i,o,a,l,u,d,f,_=!0){this.url_=e,this.method_=t,this.headers_=r,this.body_=s,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=a,this.errorCallback_=l,this.timeout_=u,this.progressCallback_=d,this.connectionFactory_=f,this.retry=_,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((g,w)=>{this.resolve_=g,this.reject_=w,this.start_()})}start_(){const e=(r,s)=>{if(s){r(!1,new Bo(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=a=>{const l=a.loaded,u=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,u)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const a=i.getErrorCode()===Qn.NO_ERROR,l=i.getStatus();if(!a||ME(l,this.additionalRetryCodes_)&&this.retry){const d=i.getErrorCode()===Qn.ABORT;r(!1,new Bo(!1,null,d));return}const u=this.successCodes_.indexOf(l)!==-1;r(!0,new Bo(u,i))})},t=(r,s)=>{const i=this.resolve_,o=this.reject_,a=s.connection;if(s.wasSuccessCode)try{const l=this.callback_(a,a.getResponse());$0(l)?i(l):i()}catch(l){o(l)}else if(a!==null){const l=Lh();l.serverResponse=a.getErrorText(),this.errorCallback_?o(this.errorCallback_(a,l)):o(l)}else if(s.canceled){const l=this.appDelete_?OE():kE();o(l)}else{const l=DE();o(l)}};this.canceled_?t(!1,new Bo(!1,null,!0)):this.backoffId_=U0(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&B0(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class Bo{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function G0(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function H0(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function z0(n,e){e&&(n["X-Firebase-GMPID"]=e)}function K0(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function Q0(n,e,t,r,s,i,o=!0){const a=VE(n.urlParams),l=n.url+a,u=Object.assign({},n.headers);return z0(u,e),G0(u,t),H0(u,i),K0(u,r),new W0(l,n.method,u,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,o)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Y0(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function J0(...n){const e=Y0();if(e!==void 0){const t=new e;for(let r=0;r<n.length;r++)t.append(n[r]);return t.getBlob()}else{if(Fh())return new Blob(n);throw new Te(me.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function X0(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Z0(n){if(typeof atob>"u")throw M0("base-64");return atob(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bt={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class _l{constructor(e,t){this.data=e,this.contentType=t||null}}function eN(n,e){switch(n){case bt.RAW:return new _l(LE(e));case bt.BASE64:case bt.BASE64URL:return new _l(FE(n,e));case bt.DATA_URL:return new _l(nN(e),rN(e))}throw Lh()}function LE(n){const e=[];for(let t=0;t<n.length;t++){let r=n.charCodeAt(t);if(r<=127)e.push(r);else if(r<=2047)e.push(192|r>>6,128|r&63);else if((r&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const i=r,o=n.charCodeAt(++t);r=65536|(i&1023)<<10|o&1023,e.push(240|r>>18,128|r>>12&63,128|r>>6&63,128|r&63)}else(r&64512)===56320?e.push(239,191,189):e.push(224|r>>12,128|r>>6&63,128|r&63)}return new Uint8Array(e)}function tN(n){let e;try{e=decodeURIComponent(n)}catch{throw _i(bt.DATA_URL,"Malformed data URL.")}return LE(e)}function FE(n,e){switch(n){case bt.BASE64:{const s=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(s||i)throw _i(n,"Invalid character '"+(s?"-":"_")+"' found: is it base64url encoded?");break}case bt.BASE64URL:{const s=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(s||i)throw _i(n,"Invalid character '"+(s?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=Z0(e)}catch(s){throw s.message.includes("polyfill")?s:_i(n,"Invalid character found")}const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}class UE{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw _i(bt.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const r=t[1]||null;r!=null&&(this.base64=sN(r,";base64"),this.contentType=this.base64?r.substring(0,r.length-7):r),this.rest=e.substring(e.indexOf(",")+1)}}function nN(n){const e=new UE(n);return e.base64?FE(bt.BASE64,e.rest):tN(e.rest)}function rN(n){return new UE(n).contentType}function sN(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(e,t){let r=0,s="";w_(e)?(this.data_=e,r=e.size,s=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),r=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),r=e.length),this.size_=r,this.type_=s}size(){return this.size_}type(){return this.type_}slice(e,t){if(w_(this.data_)){const r=this.data_,s=X0(r,e,t);return s===null?null:new Mt(s)}else{const r=new Uint8Array(this.data_.buffer,e,t-e);return new Mt(r,!0)}}static getBlob(...e){if(Fh()){const t=e.map(r=>r instanceof Mt?r.data_:r);return new Mt(J0.apply(null,t))}else{const t=e.map(o=>fc(o)?eN(bt.RAW,o).data:o.data_);let r=0;t.forEach(o=>{r+=o.byteLength});const s=new Uint8Array(r);let i=0;return t.forEach(o=>{for(let a=0;a<o.length;a++)s[i++]=o[a]}),new Mt(s,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BE(n){let e;try{e=JSON.parse(n)}catch{return null}return j0(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iN(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function oN(n,e){const t=e.split("/").filter(r=>r.length>0).join("/");return n.length===0?t:n+"/"+t}function $E(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function aN(n,e){return e}class Je{constructor(e,t,r,s){this.server=e,this.local=t||e,this.writable=!!r,this.xform=s||aN}}let $o=null;function cN(n){return!fc(n)||n.length<2?n:$E(n)}function Uh(){if($o)return $o;const n=[];n.push(new Je("bucket")),n.push(new Je("generation")),n.push(new Je("metageneration")),n.push(new Je("name","fullPath",!0));function e(i,o){return cN(o)}const t=new Je("name");t.xform=e,n.push(t);function r(i,o){return o!==void 0?Number(o):o}const s=new Je("size");return s.xform=r,n.push(s),n.push(new Je("timeCreated")),n.push(new Je("updated")),n.push(new Je("md5Hash",null,!0)),n.push(new Je("cacheControl",null,!0)),n.push(new Je("contentDisposition",null,!0)),n.push(new Je("contentEncoding",null,!0)),n.push(new Je("contentLanguage",null,!0)),n.push(new Je("contentType",null,!0)),n.push(new Je("metadata","customMetadata",!0)),$o=n,$o}function lN(n,e){function t(){const r=n.bucket,s=n.fullPath,i=new lt(r,s);return e._makeStorageReference(i)}Object.defineProperty(n,"ref",{get:t})}function uN(n,e,t){const r={};r.type="file";const s=t.length;for(let i=0;i<s;i++){const o=t[i];r[o.local]=o.xform(r,e[o.server])}return lN(r,n),r}function qE(n,e,t){const r=BE(e);return r===null?null:uN(n,r,t)}function hN(n,e,t,r){const s=BE(e);if(s===null||!fc(s.downloadTokens))return null;const i=s.downloadTokens;if(i.length===0)return null;const o=encodeURIComponent;return i.split(",").map(u=>{const d=n.bucket,f=n.fullPath,_="/b/"+o(d)+"/o/"+o(f),g=ws(_,t,r),w=VE({alt:"media",token:u});return g+w})[0]}function jE(n,e){const t={},r=e.length;for(let s=0;s<r;s++){const i=e[s];i.writable&&(t[i.server]=n[i.local])}return JSON.stringify(t)}class Tr{constructor(e,t,r,s){this.url=e,this.method=t,this.handler=r,this.timeout=s,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jt(n){if(!n)throw Lh()}function Bh(n,e){function t(r,s){const i=qE(n,s,e);return jt(i!==null),i}return t}function dN(n,e){function t(r,s){const i=qE(n,s,e);return jt(i!==null),hN(i,s,n.host,n._protocol)}return t}function ao(n){function e(t,r){let s;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?s=P0():s=C0():t.getStatus()===402?s=R0(n.bucket):t.getStatus()===403?s=N0(n.path):s=r,s.status=t.getStatus(),s.serverResponse=r.serverResponse,s}return e}function $h(n){const e=ao(n);function t(r,s){let i=e(r,s);return r.getStatus()===404&&(i=S0(n.path)),i.serverResponse=s.serverResponse,i}return t}function fN(n,e,t){const r=e.fullServerUrl(),s=ws(r,n.host,n._protocol),i="GET",o=n.maxOperationRetryTime,a=new Tr(s,i,Bh(n,t),o);return a.errorHandler=$h(e),a}function pN(n,e,t){const r=e.fullServerUrl(),s=ws(r,n.host,n._protocol),i="GET",o=n.maxOperationRetryTime,a=new Tr(s,i,dN(n,t),o);return a.errorHandler=$h(e),a}function _N(n,e){const t=e.fullServerUrl(),r=ws(t,n.host,n._protocol),s="DELETE",i=n.maxOperationRetryTime;function o(l,u){}const a=new Tr(r,s,o,i);return a.successCodes=[200,204],a.errorHandler=$h(e),a}function mN(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function WE(n,e,t){const r=Object.assign({},t);return r.fullPath=n.path,r.size=e.size(),r.contentType||(r.contentType=mN(null,e)),r}function GE(n,e,t,r,s){const i=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function a(){let L="";for(let j=0;j<2;j++)L=L+Math.random().toString().slice(2);return L}const l=a();o["Content-Type"]="multipart/related; boundary="+l;const u=WE(e,r,s),d=jE(u,t),f="--"+l+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+d+`\r
--`+l+`\r
Content-Type: `+u.contentType+`\r
\r
`,_=`\r
--`+l+"--",g=Mt.getBlob(f,r,_);if(g===null)throw xE();const w={name:u.fullPath},D=ws(i,n.host,n._protocol),P="POST",B=n.maxUploadRetryTime,$=new Tr(D,P,Bh(n,t),B);return $.urlParams=w,$.headers=o,$.body=g.uploadData(),$.errorHandler=ao(e),$}class Ra{constructor(e,t,r,s){this.current=e,this.total=t,this.finalized=!!r,this.metadata=s||null}}function qh(n,e){let t=null;try{t=n.getResponseHeader("X-Goog-Upload-Status")}catch{jt(!1)}return jt(!!t&&(e||["active"]).indexOf(t)!==-1),t}function gN(n,e,t,r,s){const i=e.bucketOnlyServerUrl(),o=WE(e,r,s),a={name:o.fullPath},l=ws(i,n.host,n._protocol),u="POST",d={"X-Goog-Upload-Protocol":"resumable","X-Goog-Upload-Command":"start","X-Goog-Upload-Header-Content-Length":`${r.size()}`,"X-Goog-Upload-Header-Content-Type":o.contentType,"Content-Type":"application/json; charset=utf-8"},f=jE(o,t),_=n.maxUploadRetryTime;function g(D){qh(D);let P;try{P=D.getResponseHeader("X-Goog-Upload-URL")}catch{jt(!1)}return jt(fc(P)),P}const w=new Tr(l,u,g,_);return w.urlParams=a,w.headers=d,w.body=f,w.errorHandler=ao(e),w}function yN(n,e,t,r){const s={"X-Goog-Upload-Command":"query"};function i(u){const d=qh(u,["active","final"]);let f=null;try{f=u.getResponseHeader("X-Goog-Upload-Size-Received")}catch{jt(!1)}f||jt(!1);const _=Number(f);return jt(!isNaN(_)),new Ra(_,r.size(),d==="final")}const o="POST",a=n.maxUploadRetryTime,l=new Tr(t,o,i,a);return l.headers=s,l.errorHandler=ao(e),l}const b_=256*1024;function EN(n,e,t,r,s,i,o,a){const l=new Ra(0,0);if(o?(l.current=o.current,l.total=o.total):(l.current=0,l.total=r.size()),r.size()!==l.total)throw O0();const u=l.total-l.current;let d=u;s>0&&(d=Math.min(d,s));const f=l.current,_=f+d;let g="";d===0?g="finalize":u===d?g="upload, finalize":g="upload";const w={"X-Goog-Upload-Command":g,"X-Goog-Upload-Offset":`${l.current}`},D=r.slice(f,_);if(D===null)throw xE();function P(j,Z){const z=qh(j,["active","final"]),I=l.current+d,y=r.size();let E;return z==="final"?E=Bh(e,i)(j,Z):E=null,new Ra(I,y,z==="final",E)}const B="POST",$=e.maxUploadRetryTime,L=new Tr(t,B,P,$);return L.headers=w,L.body=D.uploadData(),L.progressCallback=a||null,L.errorHandler=ao(n),L}const nt={RUNNING:"running",PAUSED:"paused",SUCCESS:"success",CANCELED:"canceled",ERROR:"error"};function ml(n){switch(n){case"running":case"pausing":case"canceling":return nt.RUNNING;case"paused":return nt.PAUSED;case"success":return nt.SUCCESS;case"canceled":return nt.CANCELED;case"error":return nt.ERROR;default:return nt.ERROR}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vN{constructor(e,t,r){if(q0(e)||t!=null||r!=null)this.next=e,this.error=t??void 0,this.complete=r??void 0;else{const i=e;this.next=i.next,this.error=i.error,this.complete=i.complete}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Or(n){return(...e)=>{Promise.resolve().then(()=>n(...e))}}class IN{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=Qn.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=Qn.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=Qn.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,r,s){if(this.sent_)throw Ys("cannot .send() more than once");if(this.sent_=!0,this.xhr_.open(t,e,!0),s!==void 0)for(const i in s)s.hasOwnProperty(i)&&this.xhr_.setRequestHeader(i,s[i].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw Ys("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw Ys("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw Ys("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw Ys("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class TN extends IN{initXhr(){this.xhr_.responseType="text"}}function dn(){return new TN}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wN{constructor(e,t,r=null){this._transferred=0,this._needToFetchStatus=!1,this._needToFetchMetadata=!1,this._observers=[],this._error=void 0,this._uploadUrl=void 0,this._request=void 0,this._chunkMultiplier=1,this._resolve=void 0,this._reject=void 0,this._ref=e,this._blob=t,this._metadata=r,this._mappings=Uh(),this._resumable=this._shouldDoResumable(this._blob),this._state="running",this._errorHandler=s=>{if(this._request=void 0,this._chunkMultiplier=1,s._codeEquals(me.CANCELED))this._needToFetchStatus=!0,this.completeTransitions_();else{const i=this.isExponentialBackoffExpired();if(ME(s.status,[]))if(i)s=DE();else{this.sleepTime=Math.max(this.sleepTime*2,b0),this._needToFetchStatus=!0,this.completeTransitions_();return}this._error=s,this._transition("error")}},this._metadataErrorHandler=s=>{this._request=void 0,s._codeEquals(me.CANCELED)?this.completeTransitions_():(this._error=s,this._transition("error"))},this.sleepTime=0,this.maxSleepTime=this._ref.storage.maxUploadRetryTime,this._promise=new Promise((s,i)=>{this._resolve=s,this._reject=i,this._start()}),this._promise.then(null,()=>{})}isExponentialBackoffExpired(){return this.sleepTime>this.maxSleepTime}_makeProgressCallback(){const e=this._transferred;return t=>this._updateProgress(e+t)}_shouldDoResumable(e){return e.size()>256*1024}_start(){this._state==="running"&&this._request===void 0&&(this._resumable?this._uploadUrl===void 0?this._createResumable():this._needToFetchStatus?this._fetchStatus():this._needToFetchMetadata?this._fetchMetadata():this.pendingTimeout=setTimeout(()=>{this.pendingTimeout=void 0,this._continueUpload()},this.sleepTime):this._oneShotUpload())}_resolveToken(e){Promise.all([this._ref.storage._getAuthToken(),this._ref.storage._getAppCheckToken()]).then(([t,r])=>{switch(this._state){case"running":e(t,r);break;case"canceling":this._transition("canceled");break;case"pausing":this._transition("paused");break}})}_createResumable(){this._resolveToken((e,t)=>{const r=gN(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),s=this._ref.storage._makeRequest(r,dn,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._uploadUrl=i,this._needToFetchStatus=!1,this.completeTransitions_()},this._errorHandler)})}_fetchStatus(){const e=this._uploadUrl;this._resolveToken((t,r)=>{const s=yN(this._ref.storage,this._ref._location,e,this._blob),i=this._ref.storage._makeRequest(s,dn,t,r);this._request=i,i.getPromise().then(o=>{o=o,this._request=void 0,this._updateProgress(o.current),this._needToFetchStatus=!1,o.finalized&&(this._needToFetchMetadata=!0),this.completeTransitions_()},this._errorHandler)})}_continueUpload(){const e=b_*this._chunkMultiplier,t=new Ra(this._transferred,this._blob.size()),r=this._uploadUrl;this._resolveToken((s,i)=>{let o;try{o=EN(this._ref._location,this._ref.storage,r,this._blob,e,this._mappings,t,this._makeProgressCallback())}catch(l){this._error=l,this._transition("error");return}const a=this._ref.storage._makeRequest(o,dn,s,i,!1);this._request=a,a.getPromise().then(l=>{this._increaseMultiplier(),this._request=void 0,this._updateProgress(l.current),l.finalized?(this._metadata=l.metadata,this._transition("success")):this.completeTransitions_()},this._errorHandler)})}_increaseMultiplier(){b_*this._chunkMultiplier*2<32*1024*1024&&(this._chunkMultiplier*=2)}_fetchMetadata(){this._resolveToken((e,t)=>{const r=fN(this._ref.storage,this._ref._location,this._mappings),s=this._ref.storage._makeRequest(r,dn,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._transition("success")},this._metadataErrorHandler)})}_oneShotUpload(){this._resolveToken((e,t)=>{const r=GE(this._ref.storage,this._ref._location,this._mappings,this._blob,this._metadata),s=this._ref.storage._makeRequest(r,dn,e,t);this._request=s,s.getPromise().then(i=>{this._request=void 0,this._metadata=i,this._updateProgress(this._blob.size()),this._transition("success")},this._errorHandler)})}_updateProgress(e){const t=this._transferred;this._transferred=e,this._transferred!==t&&this._notifyObservers()}_transition(e){if(this._state!==e)switch(e){case"canceling":case"pausing":this._state=e,this._request!==void 0?this._request.cancel():this.pendingTimeout&&(clearTimeout(this.pendingTimeout),this.pendingTimeout=void 0,this.completeTransitions_());break;case"running":const t=this._state==="paused";this._state=e,t&&(this._notifyObservers(),this._start());break;case"paused":this._state=e,this._notifyObservers();break;case"canceled":this._error=kE(),this._state=e,this._notifyObservers();break;case"error":this._state=e,this._notifyObservers();break;case"success":this._state=e,this._notifyObservers();break}}completeTransitions_(){switch(this._state){case"pausing":this._transition("paused");break;case"canceling":this._transition("canceled");break;case"running":this._start();break}}get snapshot(){const e=ml(this._state);return{bytesTransferred:this._transferred,totalBytes:this._blob.size(),state:e,metadata:this._metadata,task:this,ref:this._ref}}on(e,t,r,s){const i=new vN(t||void 0,r||void 0,s||void 0);return this._addObserver(i),()=>{this._removeObserver(i)}}then(e,t){return this._promise.then(e,t)}catch(e){return this.then(null,e)}_addObserver(e){this._observers.push(e),this._notifyObserver(e)}_removeObserver(e){const t=this._observers.indexOf(e);t!==-1&&this._observers.splice(t,1)}_notifyObservers(){this._finishPromise(),this._observers.slice().forEach(t=>{this._notifyObserver(t)})}_finishPromise(){if(this._resolve!==void 0){let e=!0;switch(ml(this._state)){case nt.SUCCESS:Or(this._resolve.bind(null,this.snapshot))();break;case nt.CANCELED:case nt.ERROR:const t=this._reject;Or(t.bind(null,this._error))();break;default:e=!1;break}e&&(this._resolve=void 0,this._reject=void 0)}}_notifyObserver(e){switch(ml(this._state)){case nt.RUNNING:case nt.PAUSED:e.next&&Or(e.next.bind(e,this.snapshot))();break;case nt.SUCCESS:e.complete&&Or(e.complete.bind(e))();break;case nt.CANCELED:case nt.ERROR:e.error&&Or(e.error.bind(e,this._error))();break;default:e.error&&Or(e.error.bind(e,this._error))()}}resume(){const e=this._state==="paused"||this._state==="pausing";return e&&this._transition("running"),e}pause(){const e=this._state==="running";return e&&this._transition("pausing"),e}cancel(){const e=this._state==="running"||this._state==="pausing";return e&&this._transition("canceling"),e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hr{constructor(e,t){this._service=e,t instanceof lt?this._location=t:this._location=lt.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new hr(e,t)}get root(){const e=new lt(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return $E(this._location.path)}get storage(){return this._service}get parent(){const e=iN(this._location.path);if(e===null)return null;const t=new lt(this._location.bucket,e);return new hr(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw L0(e)}}function AN(n,e,t){n._throwIfRoot("uploadBytes");const r=GE(n.storage,n._location,Uh(),new Mt(e,!0),t);return n.storage.makeRequestWithTokens(r,dn).then(s=>({metadata:s,ref:n}))}function bN(n,e,t){return n._throwIfRoot("uploadBytesResumable"),new wN(n,new Mt(e),t)}function SN(n){n._throwIfRoot("getDownloadURL");const e=pN(n.storage,n._location,Uh());return n.storage.makeRequestWithTokens(e,dn).then(t=>{if(t===null)throw V0();return t})}function RN(n){n._throwIfRoot("deleteObject");const e=_N(n.storage,n._location);return n.storage.makeRequestWithTokens(e,dn)}function CN(n,e){const t=oN(n._location.path,e),r=new lt(n._location.bucket,t);return new hr(n.storage,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function PN(n){return/^[A-Za-z]+:\/\//.test(n)}function NN(n,e){return new hr(n,e)}function HE(n,e){if(n instanceof jh){const t=n;if(t._bucket==null)throw x0();const r=new hr(t,t._bucket);return e!=null?HE(r,e):r}else return e!==void 0?CN(n,e):n}function DN(n,e){if(e&&PN(e)){if(n instanceof jh)return NN(n,e);throw ru("To use ref(service, url), the first argument must be a Storage instance.")}else return HE(n,e)}function S_(n,e){const t=e==null?void 0:e[NE];return t==null?null:lt.makeFromBucketSpec(t,n)}function kN(n,e,t,r={}){n.host=`${e}:${t}`,n._protocol="http";const{mockUserToken:s}=r;s&&(n._overrideAuthToken=typeof s=="string"?s:g0(s,n.app.options.projectId))}class jh{constructor(e,t,r,s,i){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=s,this._firebaseVersion=i,this._bucket=null,this._host=PE,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=w0,this._maxUploadRetryTime=A0,this._requests=new Set,s!=null?this._bucket=lt.makeFromBucketSpec(s,this._host):this._bucket=S_(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=lt.makeFromBucketSpec(this._url,e):this._bucket=S_(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){A_("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){A_("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new hr(this,e)}_makeRequest(e,t,r,s,i=!0){if(this._deleted)return new F0(OE());{const o=Q0(e,this._appId,r,s,t,this._firebaseVersion,i);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,s).getPromise()}}const R_="@firebase/storage",C_="0.13.2";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zE="storage";function oM(n,e,t){return n=Ts(n),AN(n,e,t)}function aM(n,e,t){return n=Ts(n),bN(n,e,t)}function cM(n){return n=Ts(n),SN(n)}function lM(n){return n=Ts(n),RN(n)}function uM(n,e){return n=Ts(n),DN(n,e)}function hM(n=Mh(),e){n=Ts(n);const r=Vh(n,zE).getImmediate({identifier:e}),s=m0("storage");return s&&xN(r,...s),r}function xN(n,e,t,r={}){kN(n,e,t,r)}function ON(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new jh(t,r,s,e,TE)}function VN(){ls(new T0(zE,ON,"PUBLIC").setMultipleInstances(!0)),qt(R_,C_,""),qt(R_,C_,"esm2017")}VN();var P_={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const KE={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const x=function(n,e){if(!n)throw As(e)},As=function(n){return new Error("Firebase Database ("+KE.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const QE=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},MN=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],a=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Wh={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,a=o?n[s+1]:0,l=s+2<n.length,u=l?n[s+2]:0,d=i>>2,f=(i&3)<<4|a>>4;let _=(a&15)<<2|u>>6,g=u&63;l||(g=64,o||(_=64)),r.push(t[d],t[f],t[_],t[g])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(QE(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):MN(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],a=s<n.length?t[n.charAt(s)]:0;++s;const u=s<n.length?t[n.charAt(s)]:64;++s;const f=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||a==null||u==null||f==null)throw new LN;const _=i<<2|a>>4;if(r.push(_),u!==64){const g=a<<4&240|u>>2;if(r.push(g),f!==64){const w=u<<6&192|f;r.push(w)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};let LN=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}};const YE=function(n){const e=QE(n);return Wh.encodeByteArray(e,!0)},N_=function(n){return YE(n).replace(/\./g,"")},su=function(n){try{return Wh.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function FN(n){return JE(void 0,n)}function JE(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!UN(t)||(n[t]=JE(n[t],e[t]));return n}function UN(n){return n!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BN(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $N=()=>BN().__FIREBASE_DEFAULTS__,qN=()=>{if(typeof process>"u"||typeof P_>"u")return;const n=P_.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},jN=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&su(n[1]);return e&&JSON.parse(e)},WN=()=>{try{return $N()||qN()||jN()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},GN=n=>{var e,t;return(t=(e=WN())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},HN=n=>{const e=GN(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pc{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zN(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},n);return[N_(JSON.stringify(t)),N_(JSON.stringify(o)),""].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function KN(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function XE(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(KN())}function QN(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function YN(){return KE.NODE_ADMIN===!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oi(n){return JSON.parse(n)}function Le(n){return JSON.stringify(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZE=function(n){let e={},t={},r={},s="";try{const i=n.split(".");e=Oi(su(i[0])||""),t=Oi(su(i[1])||""),s=i[2],r=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:r,signature:s}},JN=function(n){const e=ZE(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},XN=function(n){const e=ZE(n).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dt(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function us(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function D_(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function Ca(n,e,t){const r={};for(const s in n)Object.prototype.hasOwnProperty.call(n,s)&&(r[s]=e.call(t,n[s],s,n));return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ZN(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eD{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const r=this.W_;if(typeof e=="string")for(let f=0;f<16;f++)r[f]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let f=0;f<16;f++)r[f]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let f=16;f<80;f++){const _=r[f-3]^r[f-8]^r[f-14]^r[f-16];r[f]=(_<<1|_>>>31)&4294967295}let s=this.chain_[0],i=this.chain_[1],o=this.chain_[2],a=this.chain_[3],l=this.chain_[4],u,d;for(let f=0;f<80;f++){f<40?f<20?(u=a^i&(o^a),d=1518500249):(u=i^o^a,d=1859775393):f<60?(u=i&o|a&(i|o),d=2400959708):(u=i^o^a,d=3395469782);const _=(s<<5|s>>>27)+u+l+d+r[f]&4294967295;l=a,a=o,o=(i<<30|i>>>2)&4294967295,i=s,s=_}this.chain_[0]=this.chain_[0]+s&4294967295,this.chain_[1]=this.chain_[1]+i&4294967295,this.chain_[2]=this.chain_[2]+o&4294967295,this.chain_[3]=this.chain_[3]+a&4294967295,this.chain_[4]=this.chain_[4]+l&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const r=t-this.blockSize;let s=0;const i=this.buf_;let o=this.inbuf_;for(;s<t;){if(o===0)for(;s<=r;)this.compress_(e,s),s+=this.blockSize;if(typeof e=="string"){for(;s<t;)if(i[o]=e.charCodeAt(s),++o,++s,o===this.blockSize){this.compress_(i),o=0;break}}else for(;s<t;)if(i[o]=e[s],++o,++s,o===this.blockSize){this.compress_(i),o=0;break}}this.inbuf_=o,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let s=this.blockSize-1;s>=56;s--)this.buf_[s]=t&255,t/=256;this.compress_(this.buf_);let r=0;for(let s=0;s<5;s++)for(let i=24;i>=0;i-=8)e[r]=this.chain_[s]>>i&255,++r;return e}}function _c(n,e){return`${n} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tD=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);if(s>=55296&&s<=56319){const i=s-55296;r++,x(r<n.length,"Surrogate pair missing trail surrogate.");const o=n.charCodeAt(r)-56320;s=65536+(i<<10)+o}s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):s<65536?(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},mc=function(n){let e=0;for(let t=0;t<n.length;t++){const r=n.charCodeAt(t);r<128?e++:r<2048?e+=2:r>=55296&&r<=56319?(e+=4,t++):e+=3}return e};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wr(n){return n&&n._delegate?n._delegate:n}let nD=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var he;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(he||(he={}));const rD={debug:he.DEBUG,verbose:he.VERBOSE,info:he.INFO,warn:he.WARN,error:he.ERROR,silent:he.SILENT},sD=he.INFO,iD={[he.DEBUG]:"log",[he.VERBOSE]:"log",[he.INFO]:"info",[he.WARN]:"warn",[he.ERROR]:"error"},oD=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=iD[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class aD{constructor(e){this.name=e,this._logLevel=sD,this._logHandler=oD,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in he))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?rD[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,he.DEBUG,...e),this._logHandler(this,he.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,he.VERBOSE,...e),this._logHandler(this,he.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,he.INFO,...e),this._logHandler(this,he.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,he.WARN,...e),this._logHandler(this,he.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,he.ERROR,...e),this._logHandler(this,he.ERROR,...e)}}var k_={};const x_="@firebase/database",O_="1.0.8";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ev="";function cD(n){ev=n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lD{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),Le(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:Oi(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uD{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return Dt(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tv=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new lD(e)}}catch{}return new uD},Hn=tv("localStorage"),hD=tv("sessionStorage");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gr=new aD("@firebase/database"),dD=function(){let n=1;return function(){return n++}}(),nv=function(n){const e=tD(n),t=new eD;t.update(e);const r=t.digest();return Wh.encodeByteArray(r)},co=function(...n){let e="";for(let t=0;t<n.length;t++){const r=n[t];Array.isArray(r)||r&&typeof r=="object"&&typeof r.length=="number"?e+=co.apply(null,r):typeof r=="object"?e+=Le(r):e+=r,e+=" "}return e};let mi=null,V_=!0;const fD=function(n,e){x(!0,"Can't turn on custom loggers persistently."),Gr.logLevel=he.VERBOSE,mi=Gr.log.bind(Gr)},Ue=function(...n){if(V_===!0&&(V_=!1,mi===null&&hD.get("logging_enabled")===!0&&fD()),mi){const e=co.apply(null,n);mi(e)}},lo=function(n){return function(...e){Ue(n,...e)}},iu=function(...n){const e="FIREBASE INTERNAL ERROR: "+co(...n);Gr.error(e)},Kt=function(...n){const e=`FIREBASE FATAL ERROR: ${co(...n)}`;throw Gr.error(e),new Error(e)},et=function(...n){const e="FIREBASE WARNING: "+co(...n);Gr.warn(e)},pD=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&et("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},Gh=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},_D=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},dr="[MIN_NAME]",bn="[MAX_NAME]",Ar=function(n,e){if(n===e)return 0;if(n===dr||e===bn)return-1;if(e===dr||n===bn)return 1;{const t=M_(n),r=M_(e);return t!==null?r!==null?t-r===0?n.length-e.length:t-r:-1:r!==null?1:n<e?-1:1}},mD=function(n,e){return n===e?0:n<e?-1:1},Js=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+Le(e))},Hh=function(n){if(typeof n!="object"||n===null)return Le(n);const e=[];for(const r in n)e.push(r);e.sort();let t="{";for(let r=0;r<e.length;r++)r!==0&&(t+=","),t+=Le(e[r]),t+=":",t+=Hh(n[e[r]]);return t+="}",t},rv=function(n,e){const t=n.length;if(t<=e)return[n];const r=[];for(let s=0;s<t;s+=e)s+e>t?r.push(n.substring(s,t)):r.push(n.substring(s,s+e));return r};function $e(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const sv=function(n){x(!Gh(n),"Invalid JSON number");const e=11,t=52,r=(1<<e-1)-1;let s,i,o,a,l;n===0?(i=0,o=0,s=1/n===-1/0?1:0):(s=n<0,n=Math.abs(n),n>=Math.pow(2,1-r)?(a=Math.min(Math.floor(Math.log(n)/Math.LN2),r),i=a+r,o=Math.round(n*Math.pow(2,t-a)-Math.pow(2,t))):(i=0,o=Math.round(n/Math.pow(2,1-r-t))));const u=[];for(l=t;l;l-=1)u.push(o%2?1:0),o=Math.floor(o/2);for(l=e;l;l-=1)u.push(i%2?1:0),i=Math.floor(i/2);u.push(s?1:0),u.reverse();const d=u.join("");let f="";for(l=0;l<64;l+=8){let _=parseInt(d.substr(l,8),2).toString(16);_.length===1&&(_="0"+_),f=f+_}return f.toLowerCase()},gD=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},yD=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"};function ED(n,e){let t="Unknown Error";n==="too_big"?t="The data requested exceeds the maximum size that can be accessed with a single request.":n==="permission_denied"?t="Client doesn't have permission to access the desired data.":n==="unavailable"&&(t="The service is unavailable");const r=new Error(n+" at "+e._path.toString()+": "+t);return r.code=n.toUpperCase(),r}const vD=new RegExp("^-?(0*)\\d{1,10}$"),ID=-2147483648,TD=2147483647,M_=function(n){if(vD.test(n)){const e=Number(n);if(e>=ID&&e<=TD)return e}return null},bs=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw et("Exception was thrown by user callback.",t),e},Math.floor(0))}},wD=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},gi=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AD{constructor(e,t){this.appName_=e,this.appCheckProvider=t,this.appCheck=t==null?void 0:t.getImmediate({optional:!0}),this.appCheck||t==null||t.get().then(r=>this.appCheck=r)}getToken(e){return this.appCheck?this.appCheck.getToken(e):new Promise((t,r)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,r):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)===null||t===void 0||t.get().then(r=>r.addTokenListener(e))}notifyForInvalidToken(){et(`Provided AppCheck credentials for the app named "${this.appName_}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bD{constructor(e,t,r){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=r,this.auth_=null,this.auth_=r.getImmediate({optional:!0}),this.auth_||r.onInit(s=>this.auth_=s)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(Ue("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,r)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,r):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',et(e)}}class ra{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}ra.OWNER="owner";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zh="5",iv="v",ov="s",av="r",cv="f",lv=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,uv="ls",hv="p",ou="ac",dv="websocket",fv="long_polling";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pv{constructor(e,t,r,s,i=!1,o="",a=!1,l=!1){this.secure=t,this.namespace=r,this.webSocketOnly=s,this.nodeAdmin=i,this.persistenceKey=o,this.includeNamespaceInQueryParams=a,this.isUsingEmulator=l,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=Hn.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&Hn.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function SD(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function _v(n,e,t){x(typeof e=="string","typeof type must == string"),x(typeof t=="object","typeof params must == object");let r;if(e===dv)r=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===fv)r=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);SD(n)&&(t.ns=n.namespace);const s=[];return $e(t,(i,o)=>{s.push(i+"="+o)}),r+s.join("&")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RD{constructor(){this.counters_={}}incrementCounter(e,t=1){Dt(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return FN(this.counters_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gl={},yl={};function Kh(n){const e=n.toString();return gl[e]||(gl[e]=new RD),gl[e]}function CD(n,e){const t=n.toString();return yl[t]||(yl[t]=e()),yl[t]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PD{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const r=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let s=0;s<r.length;++s)r[s]&&bs(()=>{this.onMessage_(r[s])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L_="start",ND="close",DD="pLPCommand",kD="pRTLPCB",mv="id",gv="pw",yv="ser",xD="cb",OD="seg",VD="ts",MD="d",LD="dframe",Ev=1870,vv=30,FD=Ev-vv,UD=25e3,BD=3e4;class Br{constructor(e,t,r,s,i,o,a){this.connId=e,this.repoInfo=t,this.applicationId=r,this.appCheckToken=s,this.authToken=i,this.transportSessionId=o,this.lastSessionId=a,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=lo(e),this.stats_=Kh(t),this.urlFn=l=>(this.appCheckToken&&(l[ou]=this.appCheckToken),_v(t,fv,l))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new PD(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(BD)),_D(()=>{if(this.isClosed_)return;this.scriptTagHolder=new Qh((...i)=>{const[o,a,l,u,d]=i;if(this.incrementIncomingBytes_(i),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,o===L_)this.id=a,this.password=l;else if(o===ND)a?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(a,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+o)},(...i)=>{const[o,a]=i;this.incrementIncomingBytes_(i),this.myPacketOrderer.handleResponse(o,a)},()=>{this.onClosed_()},this.urlFn);const r={};r[L_]="t",r[yv]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(r[xD]=this.scriptTagHolder.uniqueCallbackIdentifier),r[iv]=zh,this.transportSessionId&&(r[ov]=this.transportSessionId),this.lastSessionId&&(r[uv]=this.lastSessionId),this.applicationId&&(r[hv]=this.applicationId),this.appCheckToken&&(r[ou]=this.appCheckToken),typeof location<"u"&&location.hostname&&lv.test(location.hostname)&&(r[av]=cv);const s=this.urlFn(r);this.log_("Connecting via long-poll to "+s),this.scriptTagHolder.addTag(s,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){Br.forceAllow_=!0}static forceDisallow(){Br.forceDisallow_=!0}static isAvailable(){return Br.forceAllow_?!0:!Br.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!gD()&&!yD()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=Le(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const r=YE(t),s=rv(r,FD);for(let i=0;i<s.length;i++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,s.length,s[i]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const r={};r[LD]="t",r[mv]=e,r[gv]=t,this.myDisconnFrame.src=this.urlFn(r),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=Le(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class Qh{constructor(e,t,r,s){this.onDisconnect=r,this.urlFn=s,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=dD(),window[DD+this.uniqueCallbackIdentifier]=e,window[kD+this.uniqueCallbackIdentifier]=t,this.myIFrame=Qh.createIFrame_();let i="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(i='<script>document.domain="'+document.domain+'";<\/script>');const o="<html><body>"+i+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(o),this.myIFrame.doc.close()}catch(a){Ue("frame writing exception"),a.stack&&Ue(a.stack),Ue(a)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||Ue("No IE domain setting required")}catch{const r=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+r+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[mv]=this.myID,e[gv]=this.myPW,e[yv]=this.currentSerial;let t=this.urlFn(e),r="",s=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+vv+r.length<=Ev;){const o=this.pendingSegs.shift();r=r+"&"+OD+s+"="+o.seg+"&"+VD+s+"="+o.ts+"&"+MD+s+"="+o.d,s++}return t=t+r,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,r){this.pendingSegs.push({seg:e,ts:t,d:r}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const r=()=>{this.outstandingRequests.delete(t),this.newRequest_()},s=setTimeout(r,Math.floor(UD)),i=()=>{clearTimeout(s),r()};this.addTag(e,i)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const r=this.myIFrame.doc.createElement("script");r.type="text/javascript",r.async=!0,r.src=e,r.onload=r.onreadystatechange=function(){const s=r.readyState;(!s||s==="loaded"||s==="complete")&&(r.onload=r.onreadystatechange=null,r.parentNode&&r.parentNode.removeChild(r),t())},r.onerror=()=>{Ue("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(r)}catch{}},Math.floor(1))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $D=16384,qD=45e3;let Pa=null;typeof MozWebSocket<"u"?Pa=MozWebSocket:typeof WebSocket<"u"&&(Pa=WebSocket);class mt{constructor(e,t,r,s,i,o,a){this.connId=e,this.applicationId=r,this.appCheckToken=s,this.authToken=i,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=lo(this.connId),this.stats_=Kh(t),this.connURL=mt.connectionURL_(t,o,a,s,r),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,r,s,i){const o={};return o[iv]=zh,typeof location<"u"&&location.hostname&&lv.test(location.hostname)&&(o[av]=cv),t&&(o[ov]=t),r&&(o[uv]=r),s&&(o[ou]=s),i&&(o[hv]=i),_v(e,dv,o)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,Hn.set("previous_websocket_failure",!0);try{let r;YN(),this.mySock=new Pa(this.connURL,[],r)}catch(r){this.log_("Error instantiating WebSocket.");const s=r.message||r.data;s&&this.log_(s),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=r=>{this.handleIncomingFrame(r)},this.mySock.onerror=r=>{this.log_("WebSocket error.  Closing connection.");const s=r.message||r.data;s&&this.log_(s),this.onClosed_()}}start(){}static forceDisallow(){mt.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,r=navigator.userAgent.match(t);r&&r.length>1&&parseFloat(r[1])<4.4&&(e=!0)}return!e&&Pa!==null&&!mt.forceDisallow_}static previouslyFailed(){return Hn.isInMemoryStorage||Hn.get("previous_websocket_failure")===!0}markConnectionHealthy(){Hn.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const r=Oi(t);this.onMessage(r)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(x(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const r=this.extractFrameCount_(t);r!==null&&this.appendFrame_(r)}}send(e){this.resetKeepAlive();const t=Le(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const r=rv(t,$D);r.length>1&&this.sendString_(String(r.length));for(let s=0;s<r.length;s++)this.sendString_(r[s])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(qD))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}mt.responsesRequiredToBeHealthy=2;mt.healthyTimeout=3e4;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vi{constructor(e){this.initTransports_(e)}static get ALL_TRANSPORTS(){return[Br,mt]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}initTransports_(e){const t=mt&&mt.isAvailable();let r=t&&!mt.previouslyFailed();if(e.webSocketOnly&&(t||et("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),r=!0),r)this.transports_=[mt];else{const s=this.transports_=[];for(const i of Vi.ALL_TRANSPORTS)i&&i.isAvailable()&&s.push(i);Vi.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}Vi.globalTransportInitialized_=!1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jD=6e4,WD=5e3,GD=10*1024,HD=100*1024,El="t",F_="d",zD="s",U_="r",KD="e",B_="o",$_="a",q_="n",j_="p",QD="h";class YD{constructor(e,t,r,s,i,o,a,l,u,d){this.id=e,this.repoInfo_=t,this.applicationId_=r,this.appCheckToken_=s,this.authToken_=i,this.onMessage_=o,this.onReady_=a,this.onDisconnect_=l,this.onKill_=u,this.lastSessionId=d,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=lo("c:"+this.id+":"),this.transportManager_=new Vi(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),r=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,r)},Math.floor(0));const s=e.healthyTimeout||0;s>0&&(this.healthyTimeout_=gi(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>HD?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>GD?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(s)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(El in e){const t=e[El];t===$_?this.upgradeIfSecondaryHealthy_():t===U_?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===B_&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=Js("t",e),r=Js("d",e);if(t==="c")this.onSecondaryControl_(r);else if(t==="d")this.pendingDataMessages.push(r);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:j_,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:$_,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:q_,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=Js("t",e),r=Js("d",e);t==="c"?this.onControl_(r):t==="d"&&this.onDataMessage_(r)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=Js(El,e);if(F_ in e){const r=e[F_];if(t===QD){const s=Object.assign({},r);this.repoInfo_.isUsingEmulator&&(s.h=this.repoInfo_.host),this.onHandshake_(s)}else if(t===q_){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let s=0;s<this.pendingDataMessages.length;++s)this.onDataMessage_(this.pendingDataMessages[s]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===zD?this.onConnectionShutdown_(r):t===U_?this.onReset_(r):t===KD?iu("Server Error: "+r):t===B_?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):iu("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,r=e.v,s=e.h;this.sessionId=e.s,this.repoInfo_.host=s,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),zh!==r&&et("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),r=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,r),gi(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(jD))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):gi(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(WD))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:j_,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(Hn.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iv{put(e,t,r,s){}merge(e,t,r,s){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,r){}onDisconnectMerge(e,t,r){}onDisconnectCancel(e,t){}reportStats(e){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tv{constructor(e){this.allowedEvents_=e,this.listeners_={},x(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const r=[...this.listeners_[e]];for(let s=0;s<r.length;s++)r[s].callback.apply(r[s].context,t)}}on(e,t,r){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:r});const s=this.getInitialEvent(e);s&&t.apply(r,s)}off(e,t,r){this.validateEventType_(e);const s=this.listeners_[e]||[];for(let i=0;i<s.length;i++)if(s[i].callback===t&&(!r||r===s[i].context)){s.splice(i,1);return}}validateEventType_(e){x(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Na extends Tv{constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!XE()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}static getInstance(){return new Na}getInitialEvent(e){return x(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const W_=32,G_=768;class ae{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let r=0;for(let s=0;s<this.pieces_.length;s++)this.pieces_[s].length>0&&(this.pieces_[r]=this.pieces_[s],r++);this.pieces_.length=r,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function ie(){return new ae("")}function Y(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function Sn(n){return n.pieces_.length-n.pieceNum_}function de(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new ae(n.pieces_,e)}function Yh(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function JD(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function Mi(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function wv(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new ae(e,0)}function be(n,e){const t=[];for(let r=n.pieceNum_;r<n.pieces_.length;r++)t.push(n.pieces_[r]);if(e instanceof ae)for(let r=e.pieceNum_;r<e.pieces_.length;r++)t.push(e.pieces_[r]);else{const r=e.split("/");for(let s=0;s<r.length;s++)r[s].length>0&&t.push(r[s])}return new ae(t,0)}function J(n){return n.pieceNum_>=n.pieces_.length}function it(n,e){const t=Y(n),r=Y(e);if(t===null)return e;if(t===r)return it(de(n),de(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function XD(n,e){const t=Mi(n,0),r=Mi(e,0);for(let s=0;s<t.length&&s<r.length;s++){const i=Ar(t[s],r[s]);if(i!==0)return i}return t.length===r.length?0:t.length<r.length?-1:1}function Jh(n,e){if(Sn(n)!==Sn(e))return!1;for(let t=n.pieceNum_,r=e.pieceNum_;t<=n.pieces_.length;t++,r++)if(n.pieces_[t]!==e.pieces_[r])return!1;return!0}function ft(n,e){let t=n.pieceNum_,r=e.pieceNum_;if(Sn(n)>Sn(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[r])return!1;++t,++r}return!0}class ZD{constructor(e,t){this.errorPrefix_=t,this.parts_=Mi(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let r=0;r<this.parts_.length;r++)this.byteLength_+=mc(this.parts_[r]);Av(this)}}function ek(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=mc(e),Av(n)}function tk(n){const e=n.parts_.pop();n.byteLength_-=mc(e),n.parts_.length>0&&(n.byteLength_-=1)}function Av(n){if(n.byteLength_>G_)throw new Error(n.errorPrefix_+"has a key path longer than "+G_+" bytes ("+n.byteLength_+").");if(n.parts_.length>W_)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+W_+") or object contains a cycle "+Bn(n))}function Bn(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xh extends Tv{constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const r=!document[e];r!==this.visible_&&(this.visible_=r,this.trigger("visible",r))},!1)}static getInstance(){return new Xh}getInitialEvent(e){return x(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xs=1e3,nk=60*5*1e3,H_=30*1e3,rk=1.3,sk=3e4,ik="server_kill",z_=3;class Wt extends Iv{constructor(e,t,r,s,i,o,a,l){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=r,this.onConnectStatus_=s,this.onServerInfoUpdate_=i,this.authTokenProvider_=o,this.appCheckTokenProvider_=a,this.authOverride_=l,this.id=Wt.nextPersistentConnectionId_++,this.log_=lo("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=Xs,this.maxReconnectDelay_=nk,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,l)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");Xh.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&Na.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,r){const s=++this.requestNumber_,i={r:s,a:e,b:t};this.log_(Le(i)),x(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(i),r&&(this.requestCBHash_[s]=r)}get(e){this.initConnection_();const t=new pc,s={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:o=>{const a=o.d;o.s==="ok"?t.resolve(a):t.reject(a)}};this.outstandingGets_.push(s),this.outstandingGetCount_++;const i=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(i),t.promise}listen(e,t,r,s){this.initConnection_();const i=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+i),this.listens.has(o)||this.listens.set(o,new Map),x(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),x(!this.listens.get(o).has(i),"listen() called twice for same path/queryId.");const a={onComplete:s,hashFn:t,query:e,tag:r};this.listens.get(o).set(i,a),this.connected_&&this.sendListen_(a)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,r=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(r)})}sendListen_(e){const t=e.query,r=t._path.toString(),s=t._queryIdentifier;this.log_("Listen on "+r+" for "+s);const i={p:r},o="q";e.tag&&(i.q=t._queryObject,i.t=e.tag),i.h=e.hashFn(),this.sendRequest(o,i,a=>{const l=a.d,u=a.s;Wt.warnOnListenWarnings_(l,t),(this.listens.get(r)&&this.listens.get(r).get(s))===e&&(this.log_("listen response",a),u!=="ok"&&this.removeListen_(r,s),e.onComplete&&e.onComplete(u,l))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&Dt(e,"w")){const r=us(e,"w");if(Array.isArray(r)&&~r.indexOf("no_index")){const s='".indexOn": "'+t._queryParams.getIndex().toString()+'"',i=t._path.toString();et(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${s} at ${i} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||XN(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=H_)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=JN(e)?"auth":"gauth",r={cred:e};this.authOverride_===null?r.noauth=!0:typeof this.authOverride_=="object"&&(r.authvar=this.authOverride_),this.sendRequest(t,r,s=>{const i=s.s,o=s.d||"error";this.authToken_===e&&(i==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(i,o))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,r=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,r)})}unlisten(e,t){const r=e._path.toString(),s=e._queryIdentifier;this.log_("Unlisten called for "+r+" "+s),x(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(r,s)&&this.connected_&&this.sendUnlisten_(r,s,e._queryObject,t)}sendUnlisten_(e,t,r,s){this.log_("Unlisten on "+e+" for "+t);const i={p:e},o="n";s&&(i.q=r,i.t=s),this.sendRequest(o,i)}onDisconnectPut(e,t,r){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,r):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:r})}onDisconnectMerge(e,t,r){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,r):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:r})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,r,s){const i={p:t,d:r};this.log_("onDisconnect "+e,i),this.sendRequest(e,i,o=>{s&&setTimeout(()=>{s(o.s,o.d)},Math.floor(0))})}put(e,t,r,s){this.putInternal("p",e,t,r,s)}merge(e,t,r,s){this.putInternal("m",e,t,r,s)}putInternal(e,t,r,s,i){this.initConnection_();const o={p:t,d:r};i!==void 0&&(o.h=i),this.outstandingPuts_.push({action:e,request:o,onComplete:s}),this.outstandingPutCount_++;const a=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(a):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,r=this.outstandingPuts_[e].request,s=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,r,i=>{this.log_(t+" response",i),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),s&&s(i.s,i.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,r=>{if(r.s!=="ok"){const i=r.d;this.log_("reportStats","Error sending stats: "+i)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+Le(e));const t=e.r,r=this.requestCBHash_[t];r&&(delete this.requestCBHash_[t],r(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):iu("Unrecognized action received from server: "+Le(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){x(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=Xs,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=Xs,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>sk&&(this.reconnectDelay_=Xs),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=new Date().getTime()-this.lastConnectionAttemptTime_;let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*rk)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),r=this.onRealtimeDisconnect_.bind(this),s=this.id+":"+Wt.nextConnectionId_++,i=this.lastSessionId;let o=!1,a=null;const l=function(){a?a.close():(o=!0,r())},u=function(f){x(a,"sendRequest call when we're not connected not allowed."),a.sendRequest(f)};this.realtime_={close:l,sendRequest:u};const d=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[f,_]=await Promise.all([this.authTokenProvider_.getToken(d),this.appCheckTokenProvider_.getToken(d)]);o?Ue("getToken() completed but was canceled"):(Ue("getToken() completed. Creating connection."),this.authToken_=f&&f.accessToken,this.appCheckToken_=_&&_.token,a=new YD(s,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,r,g=>{et(g+" ("+this.repoInfo_.toString()+")"),this.interrupt(ik)},i))}catch(f){this.log_("Failed to get token: "+f),o||(this.repoInfo_.nodeAdmin&&et(f),l())}}}interrupt(e){Ue("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){Ue("Resuming connection for reason: "+e),delete this.interruptReasons_[e],D_(this.interruptReasons_)&&(this.reconnectDelay_=Xs,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let r;t?r=t.map(i=>Hh(i)).join("$"):r="default";const s=this.removeListen_(e,r);s&&s.onComplete&&s.onComplete("permission_denied")}removeListen_(e,t){const r=new ae(e).toString();let s;if(this.listens.has(r)){const i=this.listens.get(r);s=i.get(t),i.delete(t),i.size===0&&this.listens.delete(r)}else s=void 0;return s}onAuthRevoked_(e,t){Ue("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=z_&&(this.reconnectDelay_=H_,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){Ue("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=z_&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+ev.replace(/\./g,"-")]=1,XE()?e["framework.cordova"]=1:QN()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=Na.getInstance().currentlyOnline();return D_(this.interruptReasons_)&&e}}Wt.nextPersistentConnectionId_=0;Wt.nextConnectionId_=0;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new X(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gc{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const r=new X(dr,e),s=new X(dr,t);return this.compare(r,s)!==0}minPost(){return X.MIN}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qo;class bv extends gc{static get __EMPTY_NODE(){return qo}static set __EMPTY_NODE(e){qo=e}compare(e,t){return Ar(e.name,t.name)}isDefinedOn(e){throw As("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return X.MIN}maxPost(){return new X(bn,qo)}makePost(e,t){return x(typeof e=="string","KeyIndex indexValue must always be a string."),new X(e,qo)}toString(){return".key"}}const Yn=new bv;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jo{constructor(e,t,r,s,i=null){this.isReverse_=s,this.resultGenerator_=i,this.nodeStack_=[];let o=1;for(;!e.isEmpty();)if(e=e,o=t?r(e.key,t):1,s&&(o*=-1),o<0)this.isReverse_?e=e.left:e=e.right;else if(o===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class Ve{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Ve.RED,this.left=s??ot.EMPTY_NODE,this.right=i??ot.EMPTY_NODE}copy(e,t,r,s,i){return new Ve(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return i<0?s=s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s=s.copy(null,t,null,null,null):s=s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp_()}removeMin_(){if(this.left.isEmpty())return ot.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let r,s;if(r=this,t(e,r.key)<0)!r.left.isEmpty()&&!r.left.isRed_()&&!r.left.left.isRed_()&&(r=r.moveRedLeft_()),r=r.copy(null,null,null,r.left.remove(e,t),null);else{if(r.left.isRed_()&&(r=r.rotateRight_()),!r.right.isEmpty()&&!r.right.isRed_()&&!r.right.left.isRed_()&&(r=r.moveRedRight_()),t(e,r.key)===0){if(r.right.isEmpty())return ot.EMPTY_NODE;s=r.right.min_(),r=r.copy(s.key,s.value,null,null,r.right.removeMin_())}r=r.copy(null,null,null,null,r.right.remove(e,t))}return r.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,Ve.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,Ve.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}Ve.RED=!0;Ve.BLACK=!1;class ok{copy(e,t,r,s,i){return this}insert(e,t,r){return new Ve(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class ot{constructor(e,t=ot.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new ot(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,Ve.BLACK,null,null))}remove(e){return new ot(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,Ve.BLACK,null,null))}get(e){let t,r=this.root_;for(;!r.isEmpty();){if(t=this.comparator_(e,r.key),t===0)return r.value;t<0?r=r.left:t>0&&(r=r.right)}return null}getPredecessorKey(e){let t,r=this.root_,s=null;for(;!r.isEmpty();)if(t=this.comparator_(e,r.key),t===0){if(r.left.isEmpty())return s?s.key:null;for(r=r.left;!r.right.isEmpty();)r=r.right;return r.key}else t<0?r=r.left:t>0&&(s=r,r=r.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new jo(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new jo(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new jo(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new jo(this.root_,null,this.comparator_,!0,e)}}ot.EMPTY_NODE=new ok;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ak(n,e){return Ar(n.name,e.name)}function Zh(n,e){return Ar(n,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let au;function ck(n){au=n}const Sv=function(n){return typeof n=="number"?"number:"+sv(n):"string:"+n},Rv=function(n){if(n.isLeafNode()){const e=n.val();x(typeof e=="string"||typeof e=="number"||typeof e=="object"&&Dt(e,".sv"),"Priority must be a string or number.")}else x(n===au||n.isEmpty(),"priority of unexpected type.");x(n===au||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let K_;class ke{constructor(e,t=ke.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,x(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),Rv(this.priorityNode_)}static set __childrenNodeConstructor(e){K_=e}static get __childrenNodeConstructor(){return K_}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new ke(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:ke.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return J(e)?this:Y(e)===".priority"?this.priorityNode_:ke.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:ke.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const r=Y(e);return r===null?t:t.isEmpty()&&r!==".priority"?this:(x(r!==".priority"||Sn(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(r,ke.__childrenNodeConstructor.EMPTY_NODE.updateChild(de(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+Sv(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=sv(this.value_):e+=this.value_,this.lazyHash_=nv(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===ke.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof ke.__childrenNodeConstructor?-1:(x(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,r=typeof this.value_,s=ke.VALUE_TYPE_ORDER.indexOf(t),i=ke.VALUE_TYPE_ORDER.indexOf(r);return x(s>=0,"Unknown leaf type: "+t),x(i>=0,"Unknown leaf type: "+r),s===i?r==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:i-s}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}ke.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Cv,Pv;function lk(n){Cv=n}function uk(n){Pv=n}class hk extends gc{compare(e,t){const r=e.node.getPriority(),s=t.node.getPriority(),i=r.compareTo(s);return i===0?Ar(e.name,t.name):i}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return X.MIN}maxPost(){return new X(bn,new ke("[PRIORITY-POST]",Pv))}makePost(e,t){const r=Cv(e);return new X(t,new ke("[PRIORITY-POST]",r))}toString(){return".priority"}}const Ee=new hk;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dk=Math.log(2);class fk{constructor(e){const t=i=>parseInt(Math.log(i)/dk,10),r=i=>parseInt(Array(i+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const s=r(this.count);this.bits_=e+1&s}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const Da=function(n,e,t,r){n.sort(e);const s=function(l,u){const d=u-l;let f,_;if(d===0)return null;if(d===1)return f=n[l],_=t?t(f):f,new Ve(_,f.node,Ve.BLACK,null,null);{const g=parseInt(d/2,10)+l,w=s(l,g),D=s(g+1,u);return f=n[g],_=t?t(f):f,new Ve(_,f.node,Ve.BLACK,w,D)}},i=function(l){let u=null,d=null,f=n.length;const _=function(w,D){const P=f-w,B=f;f-=w;const $=s(P+1,B),L=n[P],j=t?t(L):L;g(new Ve(j,L.node,D,null,$))},g=function(w){u?(u.left=w,u=w):(d=w,u=w)};for(let w=0;w<l.count;++w){const D=l.nextBitIsOne(),P=Math.pow(2,l.count-(w+1));D?_(P,Ve.BLACK):(_(P,Ve.BLACK),_(P,Ve.RED))}return d},o=new fk(n.length),a=i(o);return new ot(r||e,a)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let vl;const Vr={};class $t{constructor(e,t){this.indexes_=e,this.indexSet_=t}static get Default(){return x(Vr&&Ee,"ChildrenNode.ts has not been loaded"),vl=vl||new $t({".priority":Vr},{".priority":Ee}),vl}get(e){const t=us(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof ot?t:null}hasIndex(e){return Dt(this.indexSet_,e.toString())}addIndex(e,t){x(e!==Yn,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const r=[];let s=!1;const i=t.getIterator(X.Wrap);let o=i.getNext();for(;o;)s=s||e.isDefinedOn(o.node),r.push(o),o=i.getNext();let a;s?a=Da(r,e.getCompare()):a=Vr;const l=e.toString(),u=Object.assign({},this.indexSet_);u[l]=e;const d=Object.assign({},this.indexes_);return d[l]=a,new $t(d,u)}addToIndexes(e,t){const r=Ca(this.indexes_,(s,i)=>{const o=us(this.indexSet_,i);if(x(o,"Missing index implementation for "+i),s===Vr)if(o.isDefinedOn(e.node)){const a=[],l=t.getIterator(X.Wrap);let u=l.getNext();for(;u;)u.name!==e.name&&a.push(u),u=l.getNext();return a.push(e),Da(a,o.getCompare())}else return Vr;else{const a=t.get(e.name);let l=s;return a&&(l=l.remove(new X(e.name,a))),l.insert(e,e.node)}});return new $t(r,this.indexSet_)}removeFromIndexes(e,t){const r=Ca(this.indexes_,s=>{if(s===Vr)return s;{const i=t.get(e.name);return i?s.remove(new X(e.name,i)):s}});return new $t(r,this.indexSet_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Zs;class H{constructor(e,t,r){this.children_=e,this.priorityNode_=t,this.indexMap_=r,this.lazyHash_=null,this.priorityNode_&&Rv(this.priorityNode_),this.children_.isEmpty()&&x(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}static get EMPTY_NODE(){return Zs||(Zs=new H(new ot(Zh),null,$t.Default))}isLeafNode(){return!1}getPriority(){return this.priorityNode_||Zs}updatePriority(e){return this.children_.isEmpty()?this:new H(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?Zs:t}}getChild(e){const t=Y(e);return t===null?this:this.getImmediateChild(t).getChild(de(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(x(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const r=new X(e,t);let s,i;t.isEmpty()?(s=this.children_.remove(e),i=this.indexMap_.removeFromIndexes(r,this.children_)):(s=this.children_.insert(e,t),i=this.indexMap_.addToIndexes(r,this.children_));const o=s.isEmpty()?Zs:this.priorityNode_;return new H(s,o,i)}}updateChild(e,t){const r=Y(e);if(r===null)return t;{x(Y(e)!==".priority"||Sn(e)===1,".priority must be the last token in a path");const s=this.getImmediateChild(r).updateChild(de(e),t);return this.updateImmediateChild(r,s)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let r=0,s=0,i=!0;if(this.forEachChild(Ee,(o,a)=>{t[o]=a.val(e),r++,i&&H.INTEGER_REGEXP_.test(o)?s=Math.max(s,Number(o)):i=!1}),!e&&i&&s<2*r){const o=[];for(const a in t)o[a]=t[a];return o}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+Sv(this.getPriority().val())+":"),this.forEachChild(Ee,(t,r)=>{const s=r.hash();s!==""&&(e+=":"+t+":"+s)}),this.lazyHash_=e===""?"":nv(e)}return this.lazyHash_}getPredecessorChildName(e,t,r){const s=this.resolveIndex_(r);if(s){const i=s.getPredecessorKey(new X(e,t));return i?i.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const r=t.minKey();return r&&r.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new X(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const r=t.maxKey();return r&&r.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new X(t,this.children_.get(t)):null}forEachChild(e,t){const r=this.resolveIndex_(e);return r?r.inorderTraversal(s=>t(s.name,s.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const r=this.resolveIndex_(t);if(r)return r.getIteratorFrom(e,s=>s);{const s=this.children_.getIteratorFrom(e.name,X.Wrap);let i=s.peek();for(;i!=null&&t.compare(i,e)<0;)s.getNext(),i=s.peek();return s}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const r=this.resolveIndex_(t);if(r)return r.getReverseIteratorFrom(e,s=>s);{const s=this.children_.getReverseIteratorFrom(e.name,X.Wrap);let i=s.peek();for(;i!=null&&t.compare(i,e)>0;)s.getNext(),i=s.peek();return s}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===uo?-1:0}withIndex(e){if(e===Yn||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new H(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===Yn||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const r=this.getIterator(Ee),s=t.getIterator(Ee);let i=r.getNext(),o=s.getNext();for(;i&&o;){if(i.name!==o.name||!i.node.equals(o.node))return!1;i=r.getNext(),o=s.getNext()}return i===null&&o===null}else return!1;else return!1}}resolveIndex_(e){return e===Yn?null:this.indexMap_.get(e.toString())}}H.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class pk extends H{constructor(){super(new ot(Zh),H.EMPTY_NODE,$t.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return H.EMPTY_NODE}isEmpty(){return!1}}const uo=new pk;Object.defineProperties(X,{MIN:{value:new X(dr,H.EMPTY_NODE)},MAX:{value:new X(bn,uo)}});bv.__EMPTY_NODE=H.EMPTY_NODE;ke.__childrenNodeConstructor=H;ck(uo);uk(uo);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _k=!0;function Me(n,e=null){if(n===null)return H.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),x(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new ke(t,Me(e))}if(!(n instanceof Array)&&_k){const t=[];let r=!1;if($e(n,(o,a)=>{if(o.substring(0,1)!=="."){const l=Me(a);l.isEmpty()||(r=r||!l.getPriority().isEmpty(),t.push(new X(o,l)))}}),t.length===0)return H.EMPTY_NODE;const i=Da(t,ak,o=>o.name,Zh);if(r){const o=Da(t,Ee.getCompare());return new H(i,Me(e),new $t({".priority":o},{".priority":Ee}))}else return new H(i,Me(e),$t.Default)}else{let t=H.EMPTY_NODE;return $e(n,(r,s)=>{if(Dt(n,r)&&r.substring(0,1)!=="."){const i=Me(s);(i.isLeafNode()||!i.isEmpty())&&(t=t.updateImmediateChild(r,i))}}),t.updatePriority(Me(e))}}lk(Me);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ed extends gc{constructor(e){super(),this.indexPath_=e,x(!J(e)&&Y(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const r=this.extractChild(e.node),s=this.extractChild(t.node),i=r.compareTo(s);return i===0?Ar(e.name,t.name):i}makePost(e,t){const r=Me(e),s=H.EMPTY_NODE.updateChild(this.indexPath_,r);return new X(t,s)}maxPost(){const e=H.EMPTY_NODE.updateChild(this.indexPath_,uo);return new X(bn,e)}toString(){return Mi(this.indexPath_,0).join("/")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mk extends gc{compare(e,t){const r=e.node.compareTo(t.node);return r===0?Ar(e.name,t.name):r}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return X.MIN}maxPost(){return X.MAX}makePost(e,t){const r=Me(e);return new X(t,r)}toString(){return".value"}}const Nv=new mk;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dv(n){return{type:"value",snapshotNode:n}}function hs(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function Li(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function Fi(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function gk(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class td{constructor(e){this.index_=e}updateChild(e,t,r,s,i,o){x(e.isIndexed(this.index_),"A node must be indexed if only a child is updated");const a=e.getImmediateChild(t);return a.getChild(s).equals(r.getChild(s))&&a.isEmpty()===r.isEmpty()||(o!=null&&(r.isEmpty()?e.hasChild(t)?o.trackChildChange(Li(t,a)):x(e.isLeafNode(),"A child remove without an old child only makes sense on a leaf node"):a.isEmpty()?o.trackChildChange(hs(t,r)):o.trackChildChange(Fi(t,r,a))),e.isLeafNode()&&r.isEmpty())?e:e.updateImmediateChild(t,r).withIndex(this.index_)}updateFullNode(e,t,r){return r!=null&&(e.isLeafNode()||e.forEachChild(Ee,(s,i)=>{t.hasChild(s)||r.trackChildChange(Li(s,i))}),t.isLeafNode()||t.forEachChild(Ee,(s,i)=>{if(e.hasChild(s)){const o=e.getImmediateChild(s);o.equals(i)||r.trackChildChange(Fi(s,i,o))}else r.trackChildChange(hs(s,i))})),t.withIndex(this.index_)}updatePriority(e,t){return e.isEmpty()?H.EMPTY_NODE:e.updatePriority(t)}filtersNodes(){return!1}getIndexedFilter(){return this}getIndex(){return this.index_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ui{constructor(e){this.indexedFilter_=new td(e.getIndex()),this.index_=e.getIndex(),this.startPost_=Ui.getStartPost_(e),this.endPost_=Ui.getEndPost_(e),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}getStartPost(){return this.startPost_}getEndPost(){return this.endPost_}matches(e){const t=this.startIsInclusive_?this.index_.compare(this.getStartPost(),e)<=0:this.index_.compare(this.getStartPost(),e)<0,r=this.endIsInclusive_?this.index_.compare(e,this.getEndPost())<=0:this.index_.compare(e,this.getEndPost())<0;return t&&r}updateChild(e,t,r,s,i,o){return this.matches(new X(t,r))||(r=H.EMPTY_NODE),this.indexedFilter_.updateChild(e,t,r,s,i,o)}updateFullNode(e,t,r){t.isLeafNode()&&(t=H.EMPTY_NODE);let s=t.withIndex(this.index_);s=s.updatePriority(H.EMPTY_NODE);const i=this;return t.forEachChild(Ee,(o,a)=>{i.matches(new X(o,a))||(s=s.updateImmediateChild(o,H.EMPTY_NODE))}),this.indexedFilter_.updateFullNode(e,s,r)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.indexedFilter_}getIndex(){return this.index_}static getStartPost_(e){if(e.hasStart()){const t=e.getIndexStartName();return e.getIndex().makePost(e.getIndexStartValue(),t)}else return e.getIndex().minPost()}static getEndPost_(e){if(e.hasEnd()){const t=e.getIndexEndName();return e.getIndex().makePost(e.getIndexEndValue(),t)}else return e.getIndex().maxPost()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yk{constructor(e){this.withinDirectionalStart=t=>this.reverse_?this.withinEndPost(t):this.withinStartPost(t),this.withinDirectionalEnd=t=>this.reverse_?this.withinStartPost(t):this.withinEndPost(t),this.withinStartPost=t=>{const r=this.index_.compare(this.rangedFilter_.getStartPost(),t);return this.startIsInclusive_?r<=0:r<0},this.withinEndPost=t=>{const r=this.index_.compare(t,this.rangedFilter_.getEndPost());return this.endIsInclusive_?r<=0:r<0},this.rangedFilter_=new Ui(e),this.index_=e.getIndex(),this.limit_=e.getLimit(),this.reverse_=!e.isViewFromLeft(),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}updateChild(e,t,r,s,i,o){return this.rangedFilter_.matches(new X(t,r))||(r=H.EMPTY_NODE),e.getImmediateChild(t).equals(r)?e:e.numChildren()<this.limit_?this.rangedFilter_.getIndexedFilter().updateChild(e,t,r,s,i,o):this.fullLimitUpdateChild_(e,t,r,i,o)}updateFullNode(e,t,r){let s;if(t.isLeafNode()||t.isEmpty())s=H.EMPTY_NODE.withIndex(this.index_);else if(this.limit_*2<t.numChildren()&&t.isIndexed(this.index_)){s=H.EMPTY_NODE.withIndex(this.index_);let i;this.reverse_?i=t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(),this.index_):i=t.getIteratorFrom(this.rangedFilter_.getStartPost(),this.index_);let o=0;for(;i.hasNext()&&o<this.limit_;){const a=i.getNext();if(this.withinDirectionalStart(a))if(this.withinDirectionalEnd(a))s=s.updateImmediateChild(a.name,a.node),o++;else break;else continue}}else{s=t.withIndex(this.index_),s=s.updatePriority(H.EMPTY_NODE);let i;this.reverse_?i=s.getReverseIterator(this.index_):i=s.getIterator(this.index_);let o=0;for(;i.hasNext();){const a=i.getNext();o<this.limit_&&this.withinDirectionalStart(a)&&this.withinDirectionalEnd(a)?o++:s=s.updateImmediateChild(a.name,H.EMPTY_NODE)}}return this.rangedFilter_.getIndexedFilter().updateFullNode(e,s,r)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.rangedFilter_.getIndexedFilter()}getIndex(){return this.index_}fullLimitUpdateChild_(e,t,r,s,i){let o;if(this.reverse_){const f=this.index_.getCompare();o=(_,g)=>f(g,_)}else o=this.index_.getCompare();const a=e;x(a.numChildren()===this.limit_,"");const l=new X(t,r),u=this.reverse_?a.getFirstChild(this.index_):a.getLastChild(this.index_),d=this.rangedFilter_.matches(l);if(a.hasChild(t)){const f=a.getImmediateChild(t);let _=s.getChildAfterChild(this.index_,u,this.reverse_);for(;_!=null&&(_.name===t||a.hasChild(_.name));)_=s.getChildAfterChild(this.index_,_,this.reverse_);const g=_==null?1:o(_,l);if(d&&!r.isEmpty()&&g>=0)return i!=null&&i.trackChildChange(Fi(t,r,f)),a.updateImmediateChild(t,r);{i!=null&&i.trackChildChange(Li(t,f));const D=a.updateImmediateChild(t,H.EMPTY_NODE);return _!=null&&this.rangedFilter_.matches(_)?(i!=null&&i.trackChildChange(hs(_.name,_.node)),D.updateImmediateChild(_.name,_.node)):D}}else return r.isEmpty()?e:d&&o(u,l)>=0?(i!=null&&(i.trackChildChange(Li(u.name,u.node)),i.trackChildChange(hs(t,r))),a.updateImmediateChild(t,r).updateImmediateChild(u.name,H.EMPTY_NODE)):e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nd{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=Ee}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return x(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return x(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:dr}hasEnd(){return this.endSet_}getIndexEndValue(){return x(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return x(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:bn}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return x(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===Ee}copy(){const e=new nd;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function Ek(n){return n.loadsAllData()?new td(n.getIndex()):n.hasLimit()?new yk(n):new Ui(n)}function vk(n,e){const t=n.copy();return t.limitSet_=!0,t.limit_=e,t.viewFrom_="r",t}function Ik(n,e){const t=n.copy();return t.index_=e,t}function Q_(n){const e={};if(n.isDefault())return e;let t;if(n.index_===Ee?t="$priority":n.index_===Nv?t="$value":n.index_===Yn?t="$key":(x(n.index_ instanceof ed,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=Le(t),n.startSet_){const r=n.startAfterSet_?"startAfter":"startAt";e[r]=Le(n.indexStartValue_),n.startNameSet_&&(e[r]+=","+Le(n.indexStartName_))}if(n.endSet_){const r=n.endBeforeSet_?"endBefore":"endAt";e[r]=Le(n.indexEndValue_),n.endNameSet_&&(e[r]+=","+Le(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function Y_(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==Ee&&(e.i=n.index_.toString()),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ka extends Iv{constructor(e,t,r,s){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=r,this.appCheckTokenProvider_=s,this.log_=lo("p:rest:"),this.listens_={}}reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(x(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}listen(e,t,r,s){const i=e._path.toString();this.log_("Listen called for "+i+" "+e._queryIdentifier);const o=ka.getListenId_(e,r),a={};this.listens_[o]=a;const l=Q_(e._queryParams);this.restRequest_(i+".json",l,(u,d)=>{let f=d;if(u===404&&(f=null,u=null),u===null&&this.onDataUpdate_(i,f,!1,r),us(this.listens_,o)===a){let _;u?u===401?_="permission_denied":_="rest_error:"+u:_="ok",s(_,null)}})}unlisten(e,t){const r=ka.getListenId_(e,t);delete this.listens_[r]}get(e){const t=Q_(e._queryParams),r=e._path.toString(),s=new pc;return this.restRequest_(r+".json",t,(i,o)=>{let a=o;i===404&&(a=null,i=null),i===null?(this.onDataUpdate_(r,a,!1,null),s.resolve(a)):s.reject(new Error(a))}),s.promise}refreshAuthToken(e){}restRequest_(e,t={},r){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([s,i])=>{s&&s.accessToken&&(t.auth=s.accessToken),i&&i.token&&(t.ac=i.token);const o=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+ZN(t);this.log_("Sending REST request for "+o);const a=new XMLHttpRequest;a.onreadystatechange=()=>{if(r&&a.readyState===4){this.log_("REST Response for "+o+" received. status:",a.status,"response:",a.responseText);let l=null;if(a.status>=200&&a.status<300){try{l=Oi(a.responseText)}catch{et("Failed to parse JSON response for "+o+": "+a.responseText)}r(null,l)}else a.status!==401&&a.status!==404&&et("Got unsuccessful REST response for "+o+" Status: "+a.status),r(a.status);r=null}},a.open("GET",o,!0),a.send()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tk{constructor(){this.rootNode_=H.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xa(){return{value:null,children:new Map}}function kv(n,e,t){if(J(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const r=Y(e);n.children.has(r)||n.children.set(r,xa());const s=n.children.get(r);e=de(e),kv(s,e,t)}}function cu(n,e,t){n.value!==null?t(e,n.value):wk(n,(r,s)=>{const i=new ae(e.toString()+"/"+r);cu(s,i,t)})}function wk(n,e){n.children.forEach((t,r)=>{e(r,t)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ak{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t=Object.assign({},e);return this.last_&&$e(this.last_,(r,s)=>{t[r]=t[r]-s}),this.last_=e,t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const J_=10*1e3,bk=30*1e3,Sk=5*60*1e3;class Rk{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new Ak(e);const r=J_+(bk-J_)*Math.random();gi(this.reportStats_.bind(this),Math.floor(r))}reportStats_(){const e=this.statsListener_.get(),t={};let r=!1;$e(e,(s,i)=>{i>0&&Dt(this.statsToReport_,s)&&(t[s]=i,r=!0)}),r&&this.server_.reportStats(t),gi(this.reportStats_.bind(this),Math.floor(Math.random()*2*Sk))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var gt;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(gt||(gt={}));function rd(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function sd(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function id(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oa{constructor(e,t,r){this.path=e,this.affectedTree=t,this.revert=r,this.type=gt.ACK_USER_WRITE,this.source=rd()}operationForChild(e){if(J(this.path)){if(this.affectedTree.value!=null)return x(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new ae(e));return new Oa(ie(),t,this.revert)}}else return x(Y(this.path)===e,"operationForChild called for unrelated child."),new Oa(de(this.path),this.affectedTree,this.revert)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bi{constructor(e,t){this.source=e,this.path=t,this.type=gt.LISTEN_COMPLETE}operationForChild(e){return J(this.path)?new Bi(this.source,ie()):new Bi(this.source,de(this.path))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fr{constructor(e,t,r){this.source=e,this.path=t,this.snap=r,this.type=gt.OVERWRITE}operationForChild(e){return J(this.path)?new fr(this.source,ie(),this.snap.getImmediateChild(e)):new fr(this.source,de(this.path),this.snap)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(e,t,r){this.source=e,this.path=t,this.children=r,this.type=gt.MERGE}operationForChild(e){if(J(this.path)){const t=this.children.subtree(new ae(e));return t.isEmpty()?null:t.value?new fr(this.source,ie(),t.value):new ds(this.source,ie(),t)}else return x(Y(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new ds(this.source,de(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pr{constructor(e,t,r){this.node_=e,this.fullyInitialized_=t,this.filtered_=r}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(J(e))return this.isFullyInitialized()&&!this.filtered_;const t=Y(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ck{constructor(e){this.query_=e,this.index_=this.query_._queryParams.getIndex()}}function Pk(n,e,t,r){const s=[],i=[];return e.forEach(o=>{o.type==="child_changed"&&n.index_.indexedValueChanged(o.oldSnap,o.snapshotNode)&&i.push(gk(o.childName,o.snapshotNode))}),ei(n,s,"child_removed",e,r,t),ei(n,s,"child_added",e,r,t),ei(n,s,"child_moved",i,r,t),ei(n,s,"child_changed",e,r,t),ei(n,s,"value",e,r,t),s}function ei(n,e,t,r,s,i){const o=r.filter(a=>a.type===t);o.sort((a,l)=>Dk(n,a,l)),o.forEach(a=>{const l=Nk(n,a,i);s.forEach(u=>{u.respondsTo(a.type)&&e.push(u.createEvent(l,n.query_))})})}function Nk(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function Dk(n,e,t){if(e.childName==null||t.childName==null)throw As("Should only compare child_ events.");const r=new X(e.childName,e.snapshotNode),s=new X(t.childName,t.snapshotNode);return n.index_.compare(r,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yc(n,e){return{eventCache:n,serverCache:e}}function yi(n,e,t,r){return yc(new pr(e,t,r),n.serverCache)}function xv(n,e,t,r){return yc(n.eventCache,new pr(e,t,r))}function lu(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function _r(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Il;const kk=()=>(Il||(Il=new ot(mD)),Il);class ue{constructor(e,t=kk()){this.value=e,this.children=t}static fromObject(e){let t=new ue(null);return $e(e,(r,s)=>{t=t.set(new ae(r),s)}),t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:ie(),value:this.value};if(J(e))return null;{const r=Y(e),s=this.children.get(r);if(s!==null){const i=s.findRootMostMatchingPathAndValue(de(e),t);return i!=null?{path:be(new ae(r),i.path),value:i.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(J(e))return this;{const t=Y(e),r=this.children.get(t);return r!==null?r.subtree(de(e)):new ue(null)}}set(e,t){if(J(e))return new ue(t,this.children);{const r=Y(e),i=(this.children.get(r)||new ue(null)).set(de(e),t),o=this.children.insert(r,i);return new ue(this.value,o)}}remove(e){if(J(e))return this.children.isEmpty()?new ue(null):new ue(null,this.children);{const t=Y(e),r=this.children.get(t);if(r){const s=r.remove(de(e));let i;return s.isEmpty()?i=this.children.remove(t):i=this.children.insert(t,s),this.value===null&&i.isEmpty()?new ue(null):new ue(this.value,i)}else return this}}get(e){if(J(e))return this.value;{const t=Y(e),r=this.children.get(t);return r?r.get(de(e)):null}}setTree(e,t){if(J(e))return t;{const r=Y(e),i=(this.children.get(r)||new ue(null)).setTree(de(e),t);let o;return i.isEmpty()?o=this.children.remove(r):o=this.children.insert(r,i),new ue(this.value,o)}}fold(e){return this.fold_(ie(),e)}fold_(e,t){const r={};return this.children.inorderTraversal((s,i)=>{r[s]=i.fold_(be(e,s),t)}),t(e,this.value,r)}findOnPath(e,t){return this.findOnPath_(e,ie(),t)}findOnPath_(e,t,r){const s=this.value?r(t,this.value):!1;if(s)return s;if(J(e))return null;{const i=Y(e),o=this.children.get(i);return o?o.findOnPath_(de(e),be(t,i),r):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,ie(),t)}foreachOnPath_(e,t,r){if(J(e))return this;{this.value&&r(t,this.value);const s=Y(e),i=this.children.get(s);return i?i.foreachOnPath_(de(e),be(t,s),r):new ue(null)}}foreach(e){this.foreach_(ie(),e)}foreach_(e,t){this.children.inorderTraversal((r,s)=>{s.foreach_(be(e,r),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,r)=>{r.value&&e(t,r.value)})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(e){this.writeTree_=e}static empty(){return new vt(new ue(null))}}function Ei(n,e,t){if(J(e))return new vt(new ue(t));{const r=n.writeTree_.findRootMostValueAndPath(e);if(r!=null){const s=r.path;let i=r.value;const o=it(s,e);return i=i.updateChild(o,t),new vt(n.writeTree_.set(s,i))}else{const s=new ue(t),i=n.writeTree_.setTree(e,s);return new vt(i)}}}function uu(n,e,t){let r=n;return $e(t,(s,i)=>{r=Ei(r,be(e,s),i)}),r}function X_(n,e){if(J(e))return vt.empty();{const t=n.writeTree_.setTree(e,new ue(null));return new vt(t)}}function hu(n,e){return br(n,e)!=null}function br(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(it(t.path,e)):null}function Z_(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(Ee,(r,s)=>{e.push(new X(r,s))}):n.writeTree_.children.inorderTraversal((r,s)=>{s.value!=null&&e.push(new X(r,s.value))}),e}function In(n,e){if(J(e))return n;{const t=br(n,e);return t!=null?new vt(new ue(t)):new vt(n.writeTree_.subtree(e))}}function du(n){return n.writeTree_.isEmpty()}function fs(n,e){return Ov(ie(),n.writeTree_,e)}function Ov(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let r=null;return e.children.inorderTraversal((s,i)=>{s===".priority"?(x(i.value!==null,"Priority writes must always be leaf nodes"),r=i.value):t=Ov(be(n,s),i,t)}),!t.getChild(n).isEmpty()&&r!==null&&(t=t.updateChild(be(n,".priority"),r)),t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function od(n,e){return Fv(e,n)}function xk(n,e,t,r,s){x(r>n.lastWriteId,"Stacking an older write on top of newer ones"),s===void 0&&(s=!0),n.allWrites.push({path:e,snap:t,writeId:r,visible:s}),s&&(n.visibleWrites=Ei(n.visibleWrites,e,t)),n.lastWriteId=r}function Ok(n,e,t,r){x(r>n.lastWriteId,"Stacking an older merge on top of newer ones"),n.allWrites.push({path:e,children:t,writeId:r,visible:!0}),n.visibleWrites=uu(n.visibleWrites,e,t),n.lastWriteId=r}function Vk(n,e){for(let t=0;t<n.allWrites.length;t++){const r=n.allWrites[t];if(r.writeId===e)return r}return null}function Mk(n,e){const t=n.allWrites.findIndex(a=>a.writeId===e);x(t>=0,"removeWrite called with nonexistent writeId.");const r=n.allWrites[t];n.allWrites.splice(t,1);let s=r.visible,i=!1,o=n.allWrites.length-1;for(;s&&o>=0;){const a=n.allWrites[o];a.visible&&(o>=t&&Lk(a,r.path)?s=!1:ft(r.path,a.path)&&(i=!0)),o--}if(s){if(i)return Fk(n),!0;if(r.snap)n.visibleWrites=X_(n.visibleWrites,r.path);else{const a=r.children;$e(a,l=>{n.visibleWrites=X_(n.visibleWrites,be(r.path,l))})}return!0}else return!1}function Lk(n,e){if(n.snap)return ft(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&ft(be(n.path,t),e))return!0;return!1}function Fk(n){n.visibleWrites=Vv(n.allWrites,Uk,ie()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function Uk(n){return n.visible}function Vv(n,e,t){let r=vt.empty();for(let s=0;s<n.length;++s){const i=n[s];if(e(i)){const o=i.path;let a;if(i.snap)ft(t,o)?(a=it(t,o),r=Ei(r,a,i.snap)):ft(o,t)&&(a=it(o,t),r=Ei(r,ie(),i.snap.getChild(a)));else if(i.children){if(ft(t,o))a=it(t,o),r=uu(r,a,i.children);else if(ft(o,t))if(a=it(o,t),J(a))r=uu(r,ie(),i.children);else{const l=us(i.children,Y(a));if(l){const u=l.getChild(de(a));r=Ei(r,ie(),u)}}}else throw As("WriteRecord should have .snap or .children")}}return r}function Mv(n,e,t,r,s){if(!r&&!s){const i=br(n.visibleWrites,e);if(i!=null)return i;{const o=In(n.visibleWrites,e);if(du(o))return t;if(t==null&&!hu(o,ie()))return null;{const a=t||H.EMPTY_NODE;return fs(o,a)}}}else{const i=In(n.visibleWrites,e);if(!s&&du(i))return t;if(!s&&t==null&&!hu(i,ie()))return null;{const o=function(u){return(u.visible||s)&&(!r||!~r.indexOf(u.writeId))&&(ft(u.path,e)||ft(e,u.path))},a=Vv(n.allWrites,o,e),l=t||H.EMPTY_NODE;return fs(a,l)}}}function Bk(n,e,t){let r=H.EMPTY_NODE;const s=br(n.visibleWrites,e);if(s)return s.isLeafNode()||s.forEachChild(Ee,(i,o)=>{r=r.updateImmediateChild(i,o)}),r;if(t){const i=In(n.visibleWrites,e);return t.forEachChild(Ee,(o,a)=>{const l=fs(In(i,new ae(o)),a);r=r.updateImmediateChild(o,l)}),Z_(i).forEach(o=>{r=r.updateImmediateChild(o.name,o.node)}),r}else{const i=In(n.visibleWrites,e);return Z_(i).forEach(o=>{r=r.updateImmediateChild(o.name,o.node)}),r}}function $k(n,e,t,r,s){x(r||s,"Either existingEventSnap or existingServerSnap must exist");const i=be(e,t);if(hu(n.visibleWrites,i))return null;{const o=In(n.visibleWrites,i);return du(o)?s.getChild(t):fs(o,s.getChild(t))}}function qk(n,e,t,r){const s=be(e,t),i=br(n.visibleWrites,s);if(i!=null)return i;if(r.isCompleteForChild(t)){const o=In(n.visibleWrites,s);return fs(o,r.getNode().getImmediateChild(t))}else return null}function jk(n,e){return br(n.visibleWrites,e)}function Wk(n,e,t,r,s,i,o){let a;const l=In(n.visibleWrites,e),u=br(l,ie());if(u!=null)a=u;else if(t!=null)a=fs(l,t);else return[];if(a=a.withIndex(o),!a.isEmpty()&&!a.isLeafNode()){const d=[],f=o.getCompare(),_=i?a.getReverseIteratorFrom(r,o):a.getIteratorFrom(r,o);let g=_.getNext();for(;g&&d.length<s;)f(g,r)!==0&&d.push(g),g=_.getNext();return d}else return[]}function Gk(){return{visibleWrites:vt.empty(),allWrites:[],lastWriteId:-1}}function Va(n,e,t,r){return Mv(n.writeTree,n.treePath,e,t,r)}function ad(n,e){return Bk(n.writeTree,n.treePath,e)}function em(n,e,t,r){return $k(n.writeTree,n.treePath,e,t,r)}function Ma(n,e){return jk(n.writeTree,be(n.treePath,e))}function Hk(n,e,t,r,s,i){return Wk(n.writeTree,n.treePath,e,t,r,s,i)}function cd(n,e,t){return qk(n.writeTree,n.treePath,e,t)}function Lv(n,e){return Fv(be(n.treePath,e),n.writeTree)}function Fv(n,e){return{treePath:n,writeTree:e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zk{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,r=e.childName;x(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),x(r!==".priority","Only non-priority child changes can be tracked.");const s=this.changeMap.get(r);if(s){const i=s.type;if(t==="child_added"&&i==="child_removed")this.changeMap.set(r,Fi(r,e.snapshotNode,s.snapshotNode));else if(t==="child_removed"&&i==="child_added")this.changeMap.delete(r);else if(t==="child_removed"&&i==="child_changed")this.changeMap.set(r,Li(r,s.oldSnap));else if(t==="child_changed"&&i==="child_added")this.changeMap.set(r,hs(r,e.snapshotNode));else if(t==="child_changed"&&i==="child_changed")this.changeMap.set(r,Fi(r,e.snapshotNode,s.oldSnap));else throw As("Illegal combination of changes: "+e+" occurred after "+s)}else this.changeMap.set(r,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kk{getCompleteChild(e){return null}getChildAfterChild(e,t,r){return null}}const Uv=new Kk;class ld{constructor(e,t,r=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=r}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const r=this.optCompleteServerCache_!=null?new pr(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return cd(this.writes_,e,r)}}getChildAfterChild(e,t,r){const s=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:_r(this.viewCache_),i=Hk(this.writes_,s,t,1,r,e);return i.length===0?null:i[0]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qk(n){return{filter:n}}function Yk(n,e){x(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),x(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function Jk(n,e,t,r,s){const i=new zk;let o,a;if(t.type===gt.OVERWRITE){const u=t;u.source.fromUser?o=fu(n,e,u.path,u.snap,r,s,i):(x(u.source.fromServer,"Unknown source."),a=u.source.tagged||e.serverCache.isFiltered()&&!J(u.path),o=La(n,e,u.path,u.snap,r,s,a,i))}else if(t.type===gt.MERGE){const u=t;u.source.fromUser?o=Zk(n,e,u.path,u.children,r,s,i):(x(u.source.fromServer,"Unknown source."),a=u.source.tagged||e.serverCache.isFiltered(),o=pu(n,e,u.path,u.children,r,s,a,i))}else if(t.type===gt.ACK_USER_WRITE){const u=t;u.revert?o=nx(n,e,u.path,r,s,i):o=ex(n,e,u.path,u.affectedTree,r,s,i)}else if(t.type===gt.LISTEN_COMPLETE)o=tx(n,e,t.path,r,i);else throw As("Unknown operation type: "+t.type);const l=i.getChanges();return Xk(e,o,l),{viewCache:o,changes:l}}function Xk(n,e,t){const r=e.eventCache;if(r.isFullyInitialized()){const s=r.getNode().isLeafNode()||r.getNode().isEmpty(),i=lu(n);(t.length>0||!n.eventCache.isFullyInitialized()||s&&!r.getNode().equals(i)||!r.getNode().getPriority().equals(i.getPriority()))&&t.push(Dv(lu(e)))}}function Bv(n,e,t,r,s,i){const o=e.eventCache;if(Ma(r,t)!=null)return e;{let a,l;if(J(t))if(x(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const u=_r(e),d=u instanceof H?u:H.EMPTY_NODE,f=ad(r,d);a=n.filter.updateFullNode(e.eventCache.getNode(),f,i)}else{const u=Va(r,_r(e));a=n.filter.updateFullNode(e.eventCache.getNode(),u,i)}else{const u=Y(t);if(u===".priority"){x(Sn(t)===1,"Can't have a priority with additional path components");const d=o.getNode();l=e.serverCache.getNode();const f=em(r,t,d,l);f!=null?a=n.filter.updatePriority(d,f):a=o.getNode()}else{const d=de(t);let f;if(o.isCompleteForChild(u)){l=e.serverCache.getNode();const _=em(r,t,o.getNode(),l);_!=null?f=o.getNode().getImmediateChild(u).updateChild(d,_):f=o.getNode().getImmediateChild(u)}else f=cd(r,u,e.serverCache);f!=null?a=n.filter.updateChild(o.getNode(),u,f,d,s,i):a=o.getNode()}}return yi(e,a,o.isFullyInitialized()||J(t),n.filter.filtersNodes())}}function La(n,e,t,r,s,i,o,a){const l=e.serverCache;let u;const d=o?n.filter:n.filter.getIndexedFilter();if(J(t))u=d.updateFullNode(l.getNode(),r,null);else if(d.filtersNodes()&&!l.isFiltered()){const g=l.getNode().updateChild(t,r);u=d.updateFullNode(l.getNode(),g,null)}else{const g=Y(t);if(!l.isCompleteForPath(t)&&Sn(t)>1)return e;const w=de(t),P=l.getNode().getImmediateChild(g).updateChild(w,r);g===".priority"?u=d.updatePriority(l.getNode(),P):u=d.updateChild(l.getNode(),g,P,w,Uv,null)}const f=xv(e,u,l.isFullyInitialized()||J(t),d.filtersNodes()),_=new ld(s,f,i);return Bv(n,f,t,s,_,a)}function fu(n,e,t,r,s,i,o){const a=e.eventCache;let l,u;const d=new ld(s,e,i);if(J(t))u=n.filter.updateFullNode(e.eventCache.getNode(),r,o),l=yi(e,u,!0,n.filter.filtersNodes());else{const f=Y(t);if(f===".priority")u=n.filter.updatePriority(e.eventCache.getNode(),r),l=yi(e,u,a.isFullyInitialized(),a.isFiltered());else{const _=de(t),g=a.getNode().getImmediateChild(f);let w;if(J(_))w=r;else{const D=d.getCompleteChild(f);D!=null?Yh(_)===".priority"&&D.getChild(wv(_)).isEmpty()?w=D:w=D.updateChild(_,r):w=H.EMPTY_NODE}if(g.equals(w))l=e;else{const D=n.filter.updateChild(a.getNode(),f,w,_,d,o);l=yi(e,D,a.isFullyInitialized(),n.filter.filtersNodes())}}}return l}function tm(n,e){return n.eventCache.isCompleteForChild(e)}function Zk(n,e,t,r,s,i,o){let a=e;return r.foreach((l,u)=>{const d=be(t,l);tm(e,Y(d))&&(a=fu(n,a,d,u,s,i,o))}),r.foreach((l,u)=>{const d=be(t,l);tm(e,Y(d))||(a=fu(n,a,d,u,s,i,o))}),a}function nm(n,e,t){return t.foreach((r,s)=>{e=e.updateChild(r,s)}),e}function pu(n,e,t,r,s,i,o,a){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let l=e,u;J(t)?u=r:u=new ue(null).setTree(t,r);const d=e.serverCache.getNode();return u.children.inorderTraversal((f,_)=>{if(d.hasChild(f)){const g=e.serverCache.getNode().getImmediateChild(f),w=nm(n,g,_);l=La(n,l,new ae(f),w,s,i,o,a)}}),u.children.inorderTraversal((f,_)=>{const g=!e.serverCache.isCompleteForChild(f)&&_.value===null;if(!d.hasChild(f)&&!g){const w=e.serverCache.getNode().getImmediateChild(f),D=nm(n,w,_);l=La(n,l,new ae(f),D,s,i,o,a)}}),l}function ex(n,e,t,r,s,i,o){if(Ma(s,t)!=null)return e;const a=e.serverCache.isFiltered(),l=e.serverCache;if(r.value!=null){if(J(t)&&l.isFullyInitialized()||l.isCompleteForPath(t))return La(n,e,t,l.getNode().getChild(t),s,i,a,o);if(J(t)){let u=new ue(null);return l.getNode().forEachChild(Yn,(d,f)=>{u=u.set(new ae(d),f)}),pu(n,e,t,u,s,i,a,o)}else return e}else{let u=new ue(null);return r.foreach((d,f)=>{const _=be(t,d);l.isCompleteForPath(_)&&(u=u.set(d,l.getNode().getChild(_)))}),pu(n,e,t,u,s,i,a,o)}}function tx(n,e,t,r,s){const i=e.serverCache,o=xv(e,i.getNode(),i.isFullyInitialized()||J(t),i.isFiltered());return Bv(n,o,t,r,Uv,s)}function nx(n,e,t,r,s,i){let o;if(Ma(r,t)!=null)return e;{const a=new ld(r,e,s),l=e.eventCache.getNode();let u;if(J(t)||Y(t)===".priority"){let d;if(e.serverCache.isFullyInitialized())d=Va(r,_r(e));else{const f=e.serverCache.getNode();x(f instanceof H,"serverChildren would be complete if leaf node"),d=ad(r,f)}d=d,u=n.filter.updateFullNode(l,d,i)}else{const d=Y(t);let f=cd(r,d,e.serverCache);f==null&&e.serverCache.isCompleteForChild(d)&&(f=l.getImmediateChild(d)),f!=null?u=n.filter.updateChild(l,d,f,de(t),a,i):e.eventCache.getNode().hasChild(d)?u=n.filter.updateChild(l,d,H.EMPTY_NODE,de(t),a,i):u=l,u.isEmpty()&&e.serverCache.isFullyInitialized()&&(o=Va(r,_r(e)),o.isLeafNode()&&(u=n.filter.updateFullNode(u,o,i)))}return o=e.serverCache.isFullyInitialized()||Ma(r,ie())!=null,yi(e,u,o,n.filter.filtersNodes())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rx{constructor(e,t){this.query_=e,this.eventRegistrations_=[];const r=this.query_._queryParams,s=new td(r.getIndex()),i=Ek(r);this.processor_=Qk(i);const o=t.serverCache,a=t.eventCache,l=s.updateFullNode(H.EMPTY_NODE,o.getNode(),null),u=i.updateFullNode(H.EMPTY_NODE,a.getNode(),null),d=new pr(l,o.isFullyInitialized(),s.filtersNodes()),f=new pr(u,a.isFullyInitialized(),i.filtersNodes());this.viewCache_=yc(f,d),this.eventGenerator_=new Ck(this.query_)}get query(){return this.query_}}function sx(n){return n.viewCache_.serverCache.getNode()}function ix(n,e){const t=_r(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!J(e)&&!t.getImmediateChild(Y(e)).isEmpty())?t.getChild(e):null}function rm(n){return n.eventRegistrations_.length===0}function ox(n,e){n.eventRegistrations_.push(e)}function sm(n,e,t){const r=[];if(t){x(e==null,"A cancel should cancel all event registrations.");const s=n.query._path;n.eventRegistrations_.forEach(i=>{const o=i.createCancelEvent(t,s);o&&r.push(o)})}if(e){let s=[];for(let i=0;i<n.eventRegistrations_.length;++i){const o=n.eventRegistrations_[i];if(!o.matches(e))s.push(o);else if(e.hasAnyCallback()){s=s.concat(n.eventRegistrations_.slice(i+1));break}}n.eventRegistrations_=s}else n.eventRegistrations_=[];return r}function im(n,e,t,r){e.type===gt.MERGE&&e.source.queryId!==null&&(x(_r(n.viewCache_),"We should always have a full cache before handling merges"),x(lu(n.viewCache_),"Missing event cache, even though we have a server cache"));const s=n.viewCache_,i=Jk(n.processor_,s,e,t,r);return Yk(n.processor_,i.viewCache),x(i.viewCache.serverCache.isFullyInitialized()||!s.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=i.viewCache,$v(n,i.changes,i.viewCache.eventCache.getNode(),null)}function ax(n,e){const t=n.viewCache_.eventCache,r=[];return t.getNode().isLeafNode()||t.getNode().forEachChild(Ee,(i,o)=>{r.push(hs(i,o))}),t.isFullyInitialized()&&r.push(Dv(t.getNode())),$v(n,r,t.getNode(),e)}function $v(n,e,t,r){const s=r?[r]:n.eventRegistrations_;return Pk(n.eventGenerator_,e,t,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Fa;class cx{constructor(){this.views=new Map}}function lx(n){x(!Fa,"__referenceConstructor has already been defined"),Fa=n}function ux(){return x(Fa,"Reference.ts has not been loaded"),Fa}function hx(n){return n.views.size===0}function ud(n,e,t,r){const s=e.source.queryId;if(s!==null){const i=n.views.get(s);return x(i!=null,"SyncTree gave us an op for an invalid query."),im(i,e,t,r)}else{let i=[];for(const o of n.views.values())i=i.concat(im(o,e,t,r));return i}}function dx(n,e,t,r,s){const i=e._queryIdentifier,o=n.views.get(i);if(!o){let a=Va(t,s?r:null),l=!1;a?l=!0:r instanceof H?(a=ad(t,r),l=!1):(a=H.EMPTY_NODE,l=!1);const u=yc(new pr(a,l,!1),new pr(r,s,!1));return new rx(e,u)}return o}function fx(n,e,t,r,s,i){const o=dx(n,e,r,s,i);return n.views.has(e._queryIdentifier)||n.views.set(e._queryIdentifier,o),ox(o,t),ax(o,t)}function px(n,e,t,r){const s=e._queryIdentifier,i=[];let o=[];const a=Rn(n);if(s==="default")for(const[l,u]of n.views.entries())o=o.concat(sm(u,t,r)),rm(u)&&(n.views.delete(l),u.query._queryParams.loadsAllData()||i.push(u.query));else{const l=n.views.get(s);l&&(o=o.concat(sm(l,t,r)),rm(l)&&(n.views.delete(s),l.query._queryParams.loadsAllData()||i.push(l.query)))}return a&&!Rn(n)&&i.push(new(ux())(e._repo,e._path)),{removed:i,events:o}}function qv(n){const e=[];for(const t of n.views.values())t.query._queryParams.loadsAllData()||e.push(t);return e}function Hr(n,e){let t=null;for(const r of n.views.values())t=t||ix(r,e);return t}function jv(n,e){if(e._queryParams.loadsAllData())return Ec(n);{const r=e._queryIdentifier;return n.views.get(r)}}function Wv(n,e){return jv(n,e)!=null}function Rn(n){return Ec(n)!=null}function Ec(n){for(const e of n.views.values())if(e.query._queryParams.loadsAllData())return e;return null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ua;function _x(n){x(!Ua,"__referenceConstructor has already been defined"),Ua=n}function mx(){return x(Ua,"Reference.ts has not been loaded"),Ua}let gx=1;class om{constructor(e){this.listenProvider_=e,this.syncPointTree_=new ue(null),this.pendingWriteTree_=Gk(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function Gv(n,e,t,r,s){return xk(n.pendingWriteTree_,e,t,r,s),s?Ss(n,new fr(rd(),e,t)):[]}function yx(n,e,t,r){Ok(n.pendingWriteTree_,e,t,r);const s=ue.fromObject(t);return Ss(n,new ds(rd(),e,s))}function pn(n,e,t=!1){const r=Vk(n.pendingWriteTree_,e);if(Mk(n.pendingWriteTree_,e)){let i=new ue(null);return r.snap!=null?i=i.set(ie(),!0):$e(r.children,o=>{i=i.set(new ae(o),!0)}),Ss(n,new Oa(r.path,i,t))}else return[]}function vc(n,e,t){return Ss(n,new fr(sd(),e,t))}function Ex(n,e,t){const r=ue.fromObject(t);return Ss(n,new ds(sd(),e,r))}function vx(n,e){return Ss(n,new Bi(sd(),e))}function Ix(n,e,t){const r=dd(n,t);if(r){const s=fd(r),i=s.path,o=s.queryId,a=it(i,e),l=new Bi(id(o),a);return pd(n,i,l)}else return[]}function _u(n,e,t,r,s=!1){const i=e._path,o=n.syncPointTree_.get(i);let a=[];if(o&&(e._queryIdentifier==="default"||Wv(o,e))){const l=px(o,e,t,r);hx(o)&&(n.syncPointTree_=n.syncPointTree_.remove(i));const u=l.removed;if(a=l.events,!s){const d=u.findIndex(_=>_._queryParams.loadsAllData())!==-1,f=n.syncPointTree_.findOnPath(i,(_,g)=>Rn(g));if(d&&!f){const _=n.syncPointTree_.subtree(i);if(!_.isEmpty()){const g=Ax(_);for(let w=0;w<g.length;++w){const D=g[w],P=D.query,B=Kv(n,D);n.listenProvider_.startListening(vi(P),Ba(n,P),B.hashFn,B.onComplete)}}}!f&&u.length>0&&!r&&(d?n.listenProvider_.stopListening(vi(e),null):u.forEach(_=>{const g=n.queryToTagMap.get(Ic(_));n.listenProvider_.stopListening(vi(_),g)}))}bx(n,u)}return a}function Tx(n,e,t,r){const s=dd(n,r);if(s!=null){const i=fd(s),o=i.path,a=i.queryId,l=it(o,e),u=new fr(id(a),l,t);return pd(n,o,u)}else return[]}function wx(n,e,t,r){const s=dd(n,r);if(s){const i=fd(s),o=i.path,a=i.queryId,l=it(o,e),u=ue.fromObject(t),d=new ds(id(a),l,u);return pd(n,o,d)}else return[]}function am(n,e,t,r=!1){const s=e._path;let i=null,o=!1;n.syncPointTree_.foreachOnPath(s,(_,g)=>{const w=it(_,s);i=i||Hr(g,w),o=o||Rn(g)});let a=n.syncPointTree_.get(s);a?(o=o||Rn(a),i=i||Hr(a,ie())):(a=new cx,n.syncPointTree_=n.syncPointTree_.set(s,a));let l;i!=null?l=!0:(l=!1,i=H.EMPTY_NODE,n.syncPointTree_.subtree(s).foreachChild((g,w)=>{const D=Hr(w,ie());D&&(i=i.updateImmediateChild(g,D))}));const u=Wv(a,e);if(!u&&!e._queryParams.loadsAllData()){const _=Ic(e);x(!n.queryToTagMap.has(_),"View does not exist, but we have a tag");const g=Sx();n.queryToTagMap.set(_,g),n.tagToQueryMap.set(g,_)}const d=od(n.pendingWriteTree_,s);let f=fx(a,e,t,d,i,l);if(!u&&!o&&!r){const _=jv(a,e);f=f.concat(Rx(n,e,_))}return f}function hd(n,e,t){const s=n.pendingWriteTree_,i=n.syncPointTree_.findOnPath(e,(o,a)=>{const l=it(o,e),u=Hr(a,l);if(u)return u});return Mv(s,e,i,t,!0)}function Ss(n,e){return Hv(e,n.syncPointTree_,null,od(n.pendingWriteTree_,ie()))}function Hv(n,e,t,r){if(J(n.path))return zv(n,e,t,r);{const s=e.get(ie());t==null&&s!=null&&(t=Hr(s,ie()));let i=[];const o=Y(n.path),a=n.operationForChild(o),l=e.children.get(o);if(l&&a){const u=t?t.getImmediateChild(o):null,d=Lv(r,o);i=i.concat(Hv(a,l,u,d))}return s&&(i=i.concat(ud(s,n,r,t))),i}}function zv(n,e,t,r){const s=e.get(ie());t==null&&s!=null&&(t=Hr(s,ie()));let i=[];return e.children.inorderTraversal((o,a)=>{const l=t?t.getImmediateChild(o):null,u=Lv(r,o),d=n.operationForChild(o);d&&(i=i.concat(zv(d,a,l,u)))}),s&&(i=i.concat(ud(s,n,r,t))),i}function Kv(n,e){const t=e.query,r=Ba(n,t);return{hashFn:()=>(sx(e)||H.EMPTY_NODE).hash(),onComplete:s=>{if(s==="ok")return r?Ix(n,t._path,r):vx(n,t._path);{const i=ED(s,t);return _u(n,t,null,i)}}}}function Ba(n,e){const t=Ic(e);return n.queryToTagMap.get(t)}function Ic(n){return n._path.toString()+"$"+n._queryIdentifier}function dd(n,e){return n.tagToQueryMap.get(e)}function fd(n){const e=n.indexOf("$");return x(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new ae(n.substr(0,e))}}function pd(n,e,t){const r=n.syncPointTree_.get(e);x(r,"Missing sync point for query tag that we're tracking");const s=od(n.pendingWriteTree_,e);return ud(r,t,s,null)}function Ax(n){return n.fold((e,t,r)=>{if(t&&Rn(t))return[Ec(t)];{let s=[];return t&&(s=qv(t)),$e(r,(i,o)=>{s=s.concat(o)}),s}})}function vi(n){return n._queryParams.loadsAllData()&&!n._queryParams.isDefault()?new(mx())(n._repo,n._path):n}function bx(n,e){for(let t=0;t<e.length;++t){const r=e[t];if(!r._queryParams.loadsAllData()){const s=Ic(r),i=n.queryToTagMap.get(s);n.queryToTagMap.delete(s),n.tagToQueryMap.delete(i)}}}function Sx(){return gx++}function Rx(n,e,t){const r=e._path,s=Ba(n,e),i=Kv(n,t),o=n.listenProvider_.startListening(vi(e),s,i.hashFn,i.onComplete),a=n.syncPointTree_.subtree(r);if(s)x(!Rn(a.value),"If we're adding a query, it shouldn't be shadowed");else{const l=a.fold((u,d,f)=>{if(!J(u)&&d&&Rn(d))return[Ec(d).query];{let _=[];return d&&(_=_.concat(qv(d).map(g=>g.query))),$e(f,(g,w)=>{_=_.concat(w)}),_}});for(let u=0;u<l.length;++u){const d=l[u];n.listenProvider_.stopListening(vi(d),Ba(n,d))}}return o}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _d{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new _d(t)}node(){return this.node_}}class md{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=be(this.path_,e);return new md(this.syncTree_,t)}node(){return hd(this.syncTree_,this.path_)}}const Cx=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},cm=function(n,e,t){if(!n||typeof n!="object")return n;if(x(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return Px(n[".sv"],e,t);if(typeof n[".sv"]=="object")return Nx(n[".sv"],e);x(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},Px=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:x(!1,"Unexpected server value: "+n)}},Nx=function(n,e,t){n.hasOwnProperty("increment")||x(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const r=n.increment;typeof r!="number"&&x(!1,"Unexpected increment value: "+r);const s=e.node();if(x(s!==null&&typeof s<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!s.isLeafNode())return r;const o=s.getValue();return typeof o!="number"?r:o+r},Qv=function(n,e,t,r){return gd(e,new md(t,n),r)},Yv=function(n,e,t){return gd(n,new _d(e),t)};function gd(n,e,t){const r=n.getPriority().val(),s=cm(r,e.getImmediateChild(".priority"),t);let i;if(n.isLeafNode()){const o=n,a=cm(o.getValue(),e,t);return a!==o.getValue()||s!==o.getPriority().val()?new ke(a,Me(s)):n}else{const o=n;return i=o,s!==o.getPriority().val()&&(i=i.updatePriority(new ke(s))),o.forEachChild(Ee,(a,l)=>{const u=gd(l,e.getImmediateChild(a),t);u!==l&&(i=i.updateImmediateChild(a,u))}),i}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yd{constructor(e="",t=null,r={children:{},childCount:0}){this.name=e,this.parent=t,this.node=r}}function Ed(n,e){let t=e instanceof ae?e:new ae(e),r=n,s=Y(t);for(;s!==null;){const i=us(r.node.children,s)||{children:{},childCount:0};r=new yd(s,r,i),t=de(t),s=Y(t)}return r}function Rs(n){return n.node.value}function Jv(n,e){n.node.value=e,mu(n)}function Xv(n){return n.node.childCount>0}function Dx(n){return Rs(n)===void 0&&!Xv(n)}function Tc(n,e){$e(n.node.children,(t,r)=>{e(new yd(t,n,r))})}function Zv(n,e,t,r){t&&e(n),Tc(n,s=>{Zv(s,e,!0)})}function kx(n,e,t){let r=n.parent;for(;r!==null;){if(e(r))return!0;r=r.parent}return!1}function ho(n){return new ae(n.parent===null?n.name:ho(n.parent)+"/"+n.name)}function mu(n){n.parent!==null&&xx(n.parent,n.name,n)}function xx(n,e,t){const r=Dx(t),s=Dt(n.node.children,e);r&&s?(delete n.node.children[e],n.node.childCount--,mu(n)):!r&&!s&&(n.node.children[e]=t.node,n.node.childCount++,mu(n))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ox=/[\[\].#$\/\u0000-\u001F\u007F]/,Vx=/[\[\].#$\u0000-\u001F\u007F]/,Tl=10*1024*1024,vd=function(n){return typeof n=="string"&&n.length!==0&&!Ox.test(n)},eI=function(n){return typeof n=="string"&&n.length!==0&&!Vx.test(n)},Mx=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),eI(n)},gu=function(n){return n===null||typeof n=="string"||typeof n=="number"&&!Gh(n)||n&&typeof n=="object"&&Dt(n,".sv")},tI=function(n,e,t,r){r&&e===void 0||wc(_c(n,"value"),e,t)},wc=function(n,e,t){const r=t instanceof ae?new ZD(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+Bn(r));if(typeof e=="function")throw new Error(n+"contains a function "+Bn(r)+" with contents = "+e.toString());if(Gh(e))throw new Error(n+"contains "+e.toString()+" "+Bn(r));if(typeof e=="string"&&e.length>Tl/3&&mc(e)>Tl)throw new Error(n+"contains a string greater than "+Tl+" utf8 bytes "+Bn(r)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let s=!1,i=!1;if($e(e,(o,a)=>{if(o===".value")s=!0;else if(o!==".priority"&&o!==".sv"&&(i=!0,!vd(o)))throw new Error(n+" contains an invalid key ("+o+") "+Bn(r)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);ek(r,o),wc(n,a,r),tk(r)}),s&&i)throw new Error(n+' contains ".value" child '+Bn(r)+" in addition to actual children.")}},Lx=function(n,e){let t,r;for(t=0;t<e.length;t++){r=e[t];const i=Mi(r);for(let o=0;o<i.length;o++)if(!(i[o]===".priority"&&o===i.length-1)){if(!vd(i[o]))throw new Error(n+"contains an invalid key ("+i[o]+") in path "+r.toString()+`. Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`)}}e.sort(XD);let s=null;for(t=0;t<e.length;t++){if(r=e[t],s!==null&&ft(s,r))throw new Error(n+"contains a path "+s.toString()+" that is ancestor of another path "+r.toString());s=r}},Fx=function(n,e,t,r){const s=_c(n,"values");if(!(e&&typeof e=="object")||Array.isArray(e))throw new Error(s+" must be an object containing the children to replace.");const i=[];$e(e,(o,a)=>{const l=new ae(o);if(wc(s,a,be(t,l)),Yh(l)===".priority"&&!gu(a))throw new Error(s+"contains an invalid value for '"+l.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");i.push(l)}),Lx(s,i)},Id=function(n,e,t,r){if(!eI(t))throw new Error(_c(n,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},Ux=function(n,e,t,r){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),Id(n,e,t)},Td=function(n,e){if(Y(e)===".info")throw new Error(n+" failed = Can't modify data under /.info/")},Bx=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!vd(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!Mx(t))throw new Error(_c(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $x{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function Ac(n,e){let t=null;for(let r=0;r<e.length;r++){const s=e[r],i=s.getPath();t!==null&&!Jh(i,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:i}),t.events.push(s)}t&&n.eventLists_.push(t)}function nI(n,e,t){Ac(n,t),rI(n,r=>Jh(r,e))}function Tt(n,e,t){Ac(n,t),rI(n,r=>ft(r,e)||ft(e,r))}function rI(n,e){n.recursionDepth_++;let t=!0;for(let r=0;r<n.eventLists_.length;r++){const s=n.eventLists_[r];if(s){const i=s.path;e(i)?(qx(n.eventLists_[r]),n.eventLists_[r]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function qx(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const r=t.getEventRunner();mi&&Ue("event: "+t.toString()),bs(r)}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jx="repo_interrupt",Wx=25;class Gx{constructor(e,t,r,s){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=r,this.appCheckProvider_=s,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new $x,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=xa(),this.transactionQueueTree_=new yd,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function Hx(n,e,t){if(n.stats_=Kh(n.repoInfo_),n.forceRestClient_||wD())n.server_=new ka(n.repoInfo_,(r,s,i,o)=>{lm(n,r,s,i,o)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>um(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{Le(t)}catch(r){throw new Error("Invalid authOverride provided: "+r)}}n.persistentConnection_=new Wt(n.repoInfo_,e,(r,s,i,o)=>{lm(n,r,s,i,o)},r=>{um(n,r)},r=>{zx(n,r)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(r=>{n.server_.refreshAuthToken(r)}),n.appCheckProvider_.addTokenChangeListener(r=>{n.server_.refreshAppCheckToken(r.token)}),n.statsReporter_=CD(n.repoInfo_,()=>new Rk(n.stats_,n.server_)),n.infoData_=new Tk,n.infoSyncTree_=new om({startListening:(r,s,i,o)=>{let a=[];const l=n.infoData_.getNode(r._path);return l.isEmpty()||(a=vc(n.infoSyncTree_,r._path,l),setTimeout(()=>{o("ok")},0)),a},stopListening:()=>{}}),wd(n,"connected",!1),n.serverSyncTree_=new om({startListening:(r,s,i,o)=>(n.server_.listen(r,i,s,(a,l)=>{const u=o(a,l);Tt(n.eventQueue_,r._path,u)}),[]),stopListening:(r,s)=>{n.server_.unlisten(r,s)}})}function sI(n){const t=n.infoData_.getNode(new ae(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function bc(n){return Cx({timestamp:sI(n)})}function lm(n,e,t,r,s){n.dataUpdateCount++;const i=new ae(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let o=[];if(s)if(r){const l=Ca(t,u=>Me(u));o=wx(n.serverSyncTree_,i,l,s)}else{const l=Me(t);o=Tx(n.serverSyncTree_,i,l,s)}else if(r){const l=Ca(t,u=>Me(u));o=Ex(n.serverSyncTree_,i,l)}else{const l=Me(t);o=vc(n.serverSyncTree_,i,l)}let a=i;o.length>0&&(a=ps(n,i)),Tt(n.eventQueue_,a,o)}function um(n,e){wd(n,"connected",e),e===!1&&Yx(n)}function zx(n,e){$e(e,(t,r)=>{wd(n,t,r)})}function wd(n,e,t){const r=new ae("/.info/"+e),s=Me(t);n.infoData_.updateSnapshot(r,s);const i=vc(n.infoSyncTree_,r,s);Tt(n.eventQueue_,r,i)}function Ad(n){return n.nextWriteId_++}function Kx(n,e,t,r,s){Sc(n,"set",{path:e.toString(),value:t,priority:r});const i=bc(n),o=Me(t,r),a=hd(n.serverSyncTree_,e),l=Yv(o,a,i),u=Ad(n),d=Gv(n.serverSyncTree_,e,l,u,!0);Ac(n.eventQueue_,d),n.server_.put(e.toString(),o.val(!0),(_,g)=>{const w=_==="ok";w||et("set at "+e+" failed: "+_);const D=pn(n.serverSyncTree_,u,!w);Tt(n.eventQueue_,e,D),yu(n,s,_,g)});const f=Sd(n,e);ps(n,f),Tt(n.eventQueue_,f,[])}function Qx(n,e,t,r){Sc(n,"update",{path:e.toString(),value:t});let s=!0;const i=bc(n),o={};if($e(t,(a,l)=>{s=!1,o[a]=Qv(be(e,a),Me(l),n.serverSyncTree_,i)}),s)Ue("update() called with empty data.  Don't do anything."),yu(n,r,"ok",void 0);else{const a=Ad(n),l=yx(n.serverSyncTree_,e,o,a);Ac(n.eventQueue_,l),n.server_.merge(e.toString(),t,(u,d)=>{const f=u==="ok";f||et("update at "+e+" failed: "+u);const _=pn(n.serverSyncTree_,a,!f),g=_.length>0?ps(n,e):e;Tt(n.eventQueue_,g,_),yu(n,r,u,d)}),$e(t,u=>{const d=Sd(n,be(e,u));ps(n,d)}),Tt(n.eventQueue_,e,[])}}function Yx(n){Sc(n,"onDisconnectEvents");const e=bc(n),t=xa();cu(n.onDisconnect_,ie(),(s,i)=>{const o=Qv(s,i,n.serverSyncTree_,e);kv(t,s,o)});let r=[];cu(t,ie(),(s,i)=>{r=r.concat(vc(n.serverSyncTree_,s,i));const o=Sd(n,s);ps(n,o)}),n.onDisconnect_=xa(),Tt(n.eventQueue_,ie(),r)}function Jx(n,e,t){let r;Y(e._path)===".info"?r=am(n.infoSyncTree_,e,t):r=am(n.serverSyncTree_,e,t),nI(n.eventQueue_,e._path,r)}function Xx(n,e,t){let r;Y(e._path)===".info"?r=_u(n.infoSyncTree_,e,t):r=_u(n.serverSyncTree_,e,t),nI(n.eventQueue_,e._path,r)}function Zx(n){n.persistentConnection_&&n.persistentConnection_.interrupt(jx)}function Sc(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),Ue(t,...e)}function yu(n,e,t,r){e&&bs(()=>{if(t==="ok")e(null);else{const s=(t||"error").toUpperCase();let i=s;r&&(i+=": "+r);const o=new Error(i);o.code=s,e(o)}})}function iI(n,e,t){return hd(n.serverSyncTree_,e,t)||H.EMPTY_NODE}function bd(n,e=n.transactionQueueTree_){if(e||Rc(n,e),Rs(e)){const t=aI(n,e);x(t.length>0,"Sending zero length transaction queue"),t.every(s=>s.status===0)&&eO(n,ho(e),t)}else Xv(e)&&Tc(e,t=>{bd(n,t)})}function eO(n,e,t){const r=t.map(u=>u.currentWriteId),s=iI(n,e,r);let i=s;const o=s.hash();for(let u=0;u<t.length;u++){const d=t[u];x(d.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),d.status=1,d.retryCount++;const f=it(e,d.path);i=i.updateChild(f,d.currentOutputSnapshotRaw)}const a=i.val(!0),l=e;n.server_.put(l.toString(),a,u=>{Sc(n,"transaction put response",{path:l.toString(),status:u});let d=[];if(u==="ok"){const f=[];for(let _=0;_<t.length;_++)t[_].status=2,d=d.concat(pn(n.serverSyncTree_,t[_].currentWriteId)),t[_].onComplete&&f.push(()=>t[_].onComplete(null,!0,t[_].currentOutputSnapshotResolved)),t[_].unwatcher();Rc(n,Ed(n.transactionQueueTree_,e)),bd(n,n.transactionQueueTree_),Tt(n.eventQueue_,e,d);for(let _=0;_<f.length;_++)bs(f[_])}else{if(u==="datastale")for(let f=0;f<t.length;f++)t[f].status===3?t[f].status=4:t[f].status=0;else{et("transaction at "+l.toString()+" failed: "+u);for(let f=0;f<t.length;f++)t[f].status=4,t[f].abortReason=u}ps(n,e)}},o)}function ps(n,e){const t=oI(n,e),r=ho(t),s=aI(n,t);return tO(n,s,r),r}function tO(n,e,t){if(e.length===0)return;const r=[];let s=[];const o=e.filter(a=>a.status===0).map(a=>a.currentWriteId);for(let a=0;a<e.length;a++){const l=e[a],u=it(t,l.path);let d=!1,f;if(x(u!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),l.status===4)d=!0,f=l.abortReason,s=s.concat(pn(n.serverSyncTree_,l.currentWriteId,!0));else if(l.status===0)if(l.retryCount>=Wx)d=!0,f="maxretry",s=s.concat(pn(n.serverSyncTree_,l.currentWriteId,!0));else{const _=iI(n,l.path,o);l.currentInputSnapshot=_;const g=e[a].update(_.val());if(g!==void 0){wc("transaction failed: Data returned ",g,l.path);let w=Me(g);typeof g=="object"&&g!=null&&Dt(g,".priority")||(w=w.updatePriority(_.getPriority()));const P=l.currentWriteId,B=bc(n),$=Yv(w,_,B);l.currentOutputSnapshotRaw=w,l.currentOutputSnapshotResolved=$,l.currentWriteId=Ad(n),o.splice(o.indexOf(P),1),s=s.concat(Gv(n.serverSyncTree_,l.path,$,l.currentWriteId,l.applyLocally)),s=s.concat(pn(n.serverSyncTree_,P,!0))}else d=!0,f="nodata",s=s.concat(pn(n.serverSyncTree_,l.currentWriteId,!0))}Tt(n.eventQueue_,t,s),s=[],d&&(e[a].status=2,function(_){setTimeout(_,Math.floor(0))}(e[a].unwatcher),e[a].onComplete&&(f==="nodata"?r.push(()=>e[a].onComplete(null,!1,e[a].currentInputSnapshot)):r.push(()=>e[a].onComplete(new Error(f),!1,null))))}Rc(n,n.transactionQueueTree_);for(let a=0;a<r.length;a++)bs(r[a]);bd(n,n.transactionQueueTree_)}function oI(n,e){let t,r=n.transactionQueueTree_;for(t=Y(e);t!==null&&Rs(r)===void 0;)r=Ed(r,t),e=de(e),t=Y(e);return r}function aI(n,e){const t=[];return cI(n,e,t),t.sort((r,s)=>r.order-s.order),t}function cI(n,e,t){const r=Rs(e);if(r)for(let s=0;s<r.length;s++)t.push(r[s]);Tc(e,s=>{cI(n,s,t)})}function Rc(n,e){const t=Rs(e);if(t){let r=0;for(let s=0;s<t.length;s++)t[s].status!==2&&(t[r]=t[s],r++);t.length=r,Jv(e,t.length>0?t:void 0)}Tc(e,r=>{Rc(n,r)})}function Sd(n,e){const t=ho(oI(n,e)),r=Ed(n.transactionQueueTree_,e);return kx(r,s=>{wl(n,s)}),wl(n,r),Zv(r,s=>{wl(n,s)}),t}function wl(n,e){const t=Rs(e);if(t){const r=[];let s=[],i=-1;for(let o=0;o<t.length;o++)t[o].status===3||(t[o].status===1?(x(i===o-1,"All SENT items should be at beginning of queue."),i=o,t[o].status=3,t[o].abortReason="set"):(x(t[o].status===0,"Unexpected transaction status in abort"),t[o].unwatcher(),s=s.concat(pn(n.serverSyncTree_,t[o].currentWriteId,!0)),t[o].onComplete&&r.push(t[o].onComplete.bind(null,new Error("set"),!1,null))));i===-1?Jv(e,void 0):t.length=i+1,Tt(n.eventQueue_,ho(e),s);for(let o=0;o<r.length;o++)bs(r[o])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nO(n){let e="";const t=n.split("/");for(let r=0;r<t.length;r++)if(t[r].length>0){let s=t[r];try{s=decodeURIComponent(s.replace(/\+/g," "))}catch{}e+="/"+s}return e}function rO(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const r=t.split("=");r.length===2?e[decodeURIComponent(r[0])]=decodeURIComponent(r[1]):et(`Invalid query segment '${t}' in query '${n}'`)}return e}const hm=function(n,e){const t=sO(n),r=t.namespace;t.domain==="firebase.com"&&Kt(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!r||r==="undefined")&&t.domain!=="localhost"&&Kt("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||pD();const s=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new pv(t.host,t.secure,r,s,e,"",r!==t.subdomain),path:new ae(t.pathString)}},sO=function(n){let e="",t="",r="",s="",i="",o=!0,a="https",l=443;if(typeof n=="string"){let u=n.indexOf("//");u>=0&&(a=n.substring(0,u-1),n=n.substring(u+2));let d=n.indexOf("/");d===-1&&(d=n.length);let f=n.indexOf("?");f===-1&&(f=n.length),e=n.substring(0,Math.min(d,f)),d<f&&(s=nO(n.substring(d,f)));const _=rO(n.substring(Math.min(n.length,f)));u=e.indexOf(":"),u>=0?(o=a==="https"||a==="wss",l=parseInt(e.substring(u+1),10)):u=e.length;const g=e.slice(0,u);if(g.toLowerCase()==="localhost")t="localhost";else if(g.split(".").length<=2)t=g;else{const w=e.indexOf(".");r=e.substring(0,w).toLowerCase(),t=e.substring(w+1),i=r}"ns"in _&&(i=_.ns)}return{host:e,port:l,domain:t,subdomain:r,secure:o,scheme:a,pathString:s,namespace:i}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dm="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz",iO=function(){let n=0;const e=[];return function(t){const r=t===n;n=t;let s;const i=new Array(8);for(s=7;s>=0;s--)i[s]=dm.charAt(t%64),t=Math.floor(t/64);x(t===0,"Cannot push at time == 0");let o=i.join("");if(r){for(s=11;s>=0&&e[s]===63;s--)e[s]=0;e[s]++}else for(s=0;s<12;s++)e[s]=Math.floor(Math.random()*64);for(s=0;s<12;s++)o+=dm.charAt(e[s]);return x(o.length===20,"nextPushId: Length should be 20."),o}}();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oO{constructor(e,t,r,s){this.eventType=e,this.eventRegistration=t,this.snapshot=r,this.prevName=s}getPath(){const e=this.snapshot.ref;return this.eventType==="value"?e._path:e.parent._path}getEventType(){return this.eventType}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.getPath().toString()+":"+this.eventType+":"+Le(this.snapshot.exportVal())}}class aO{constructor(e,t,r){this.eventRegistration=e,this.error=t,this.path=r}getPath(){return this.path}getEventType(){return"cancel"}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.path.toString()+":cancel"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cO{constructor(e,t){this.snapshotCallback=e,this.cancelCallback=t}onValue(e,t){this.snapshotCallback.call(null,e,t)}onCancel(e){return x(this.hasCancelCallback,"Raising a cancel event on a listener with no cancel callback"),this.cancelCallback.call(null,e)}get hasCancelCallback(){return!!this.cancelCallback}matches(e){return this.snapshotCallback===e.snapshotCallback||this.snapshotCallback.userCallback!==void 0&&this.snapshotCallback.userCallback===e.snapshotCallback.userCallback&&this.snapshotCallback.context===e.snapshotCallback.context}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fo{constructor(e,t,r,s){this._repo=e,this._path=t,this._queryParams=r,this._orderByCalled=s}get key(){return J(this._path)?null:Yh(this._path)}get ref(){return new kn(this._repo,this._path)}get _queryIdentifier(){const e=Y_(this._queryParams),t=Hh(e);return t==="{}"?"default":t}get _queryObject(){return Y_(this._queryParams)}isEqual(e){if(e=wr(e),!(e instanceof fo))return!1;const t=this._repo===e._repo,r=Jh(this._path,e._path),s=this._queryIdentifier===e._queryIdentifier;return t&&r&&s}toJSON(){return this.toString()}toString(){return this._repo.toString()+JD(this._path)}}function lO(n,e){if(n._orderByCalled===!0)throw new Error(e+": You can't combine multiple orderBy calls.")}function uO(n){let e=null,t=null;if(n.hasStart()&&(e=n.getIndexStartValue()),n.hasEnd()&&(t=n.getIndexEndValue()),n.getIndex()===Yn){const r="Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().",s="Query: When ordering by key, the argument passed to startAt(), startAfter(), endAt(), endBefore(), or equalTo() must be a string.";if(n.hasStart()){if(n.getIndexStartName()!==dr)throw new Error(r);if(typeof e!="string")throw new Error(s)}if(n.hasEnd()){if(n.getIndexEndName()!==bn)throw new Error(r);if(typeof t!="string")throw new Error(s)}}else if(n.getIndex()===Ee){if(e!=null&&!gu(e)||t!=null&&!gu(t))throw new Error("Query: When ordering by priority, the first argument passed to startAt(), startAfter() endAt(), endBefore(), or equalTo() must be a valid priority value (null, a number, or a string).")}else if(x(n.getIndex()instanceof ed||n.getIndex()===Nv,"unknown index type."),e!=null&&typeof e=="object"||t!=null&&typeof t=="object")throw new Error("Query: First argument passed to startAt(), startAfter(), endAt(), endBefore(), or equalTo() cannot be an object.")}class kn extends fo{constructor(e,t){super(e,t,new nd,!1)}get parent(){const e=wv(this._path);return e===null?null:new kn(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}class $a{constructor(e,t,r){this._node=e,this.ref=t,this._index=r}get priority(){return this._node.getPriority().val()}get key(){return this.ref.key}get size(){return this._node.numChildren()}child(e){const t=new ae(e),r=$i(this.ref,e);return new $a(this._node.getChild(t),r,Ee)}exists(){return!this._node.isEmpty()}exportVal(){return this._node.val(!0)}forEach(e){return this._node.isLeafNode()?!1:!!this._node.forEachChild(this._index,(r,s)=>e(new $a(s,$i(this.ref,r),Ee)))}hasChild(e){const t=new ae(e);return!this._node.getChild(t).isEmpty()}hasChildren(){return this._node.isLeafNode()?!1:!this._node.isEmpty()}toJSON(){return this.exportVal()}val(){return this._node.val()}}function pM(n,e){return n=wr(n),n._checkNotDeleted("ref"),e!==void 0?$i(n._root,e):n._root}function $i(n,e){return n=wr(n),Y(n._path)===null?Ux("child","path",e):Id("child","path",e),new kn(n._repo,be(n._path,e))}function _M(n,e){n=wr(n),Td("push",n._path),tI("push",e,n._path,!0);const t=sI(n._repo),r=iO(t),s=$i(n,r),i=$i(n,r);let o;return o=Promise.resolve(i),s.then=o.then.bind(o),s.catch=o.then.bind(o,void 0),s}function mM(n){return Td("remove",n._path),hO(n,null)}function hO(n,e){n=wr(n),Td("set",n._path),tI("set",e,n._path,!1);const t=new pc;return Kx(n._repo,n._path,e,null,t.wrapCallback(()=>{})),t.promise}function gM(n,e){Fx("update",e,n._path);const t=new pc;return Qx(n._repo,n._path,e,t.wrapCallback(()=>{})),t.promise}class Rd{constructor(e){this.callbackContext=e}respondsTo(e){return e==="value"}createEvent(e,t){const r=t._queryParams.getIndex();return new oO("value",this,new $a(e.snapshotNode,new kn(t._repo,t._path),r))}getEventRunner(e){return e.getEventType()==="cancel"?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,null)}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new aO(this,e,t):null}matches(e){return e instanceof Rd?!e.callbackContext||!this.callbackContext?!0:e.callbackContext.matches(this.callbackContext):!1}hasAnyCallback(){return this.callbackContext!==null}}function dO(n,e,t,r,s){const i=new cO(t,void 0),o=new Rd(i);return Jx(n._repo,n,o),()=>Xx(n._repo,n,o)}function yM(n,e,t,r){return dO(n,"value",e)}class lI{}class fO extends lI{constructor(e){super(),this._limit=e,this.type="limitToLast"}_apply(e){if(e._queryParams.hasLimit())throw new Error("limitToLast: Limit was already set (by another call to limitToFirst or limitToLast).");return new fo(e._repo,e._path,vk(e._queryParams,this._limit),e._orderByCalled)}}function EM(n){if(Math.floor(n)!==n||n<=0)throw new Error("limitToLast: First argument must be a positive integer.");return new fO(n)}class pO extends lI{constructor(e){super(),this._path=e,this.type="orderByChild"}_apply(e){lO(e,"orderByChild");const t=new ae(this._path);if(J(t))throw new Error("orderByChild: cannot pass in empty path. Use orderByValue() instead.");const r=new ed(t),s=Ik(e._queryParams,r);return uO(s),new fo(e._repo,e._path,s,!0)}}function vM(n){return Id("orderByChild","path",n),new pO(n)}function IM(n,...e){let t=wr(n);for(const r of e)t=r._apply(t);return t}lx(kn);_x(kn);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _O="FIREBASE_DATABASE_EMULATOR_HOST",Eu={};let mO=!1;function gO(n,e,t,r){n.repoInfo_=new pv(`${e}:${t}`,!1,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0),r&&(n.authTokenProvider_=r)}function yO(n,e,t,r,s){let i=r||n.options.databaseURL;i===void 0&&(n.options.projectId||Kt("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),Ue("Using default host for project ",n.options.projectId),i=`${n.options.projectId}-default-rtdb.firebaseio.com`);let o=hm(i,s),a=o.repoInfo,l;typeof process<"u"&&k_&&(l=k_[_O]),l?(i=`http://${l}?ns=${a.namespace}`,o=hm(i,s),a=o.repoInfo):o.repoInfo.secure;const u=new bD(n.name,n.options,e);Bx("Invalid Firebase Database URL",o),J(o.path)||Kt("Database URL must point to the root of a Firebase Database (not including a child path).");const d=vO(a,n,u,new AD(n.name,t));return new IO(d,n)}function EO(n,e){const t=Eu[e];(!t||t[n.key]!==n)&&Kt(`Database ${e}(${n.repoInfo_}) has already been deleted.`),Zx(n),delete t[n.key]}function vO(n,e,t,r){let s=Eu[e.name];s||(s={},Eu[e.name]=s);let i=s[n.toURLString()];return i&&Kt("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),i=new Gx(n,mO,t,r),s[n.toURLString()]=i,i}class IO{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(Hx(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new kn(this._repo,ie())),this._rootInternal}_delete(){return this._rootInternal!==null&&(EO(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&Kt("Cannot call "+e+" on a deleted database.")}}function TM(n=Mh(),e){const t=Vh(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const r=HN("database");r&&TO(t,...r)}return t}function TO(n,e,t,r={}){n=wr(n),n._checkNotDeleted("useEmulator"),n._instanceStarted&&Kt("Cannot call useEmulator() after instance has already been initialized.");const s=n._repoInternal;let i;if(s.repoInfo_.nodeAdmin)r.mockUserToken&&Kt('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),i=new ra(ra.OWNER);else if(r.mockUserToken){const o=typeof r.mockUserToken=="string"?r.mockUserToken:zN(r.mockUserToken,n.app.options.projectId);i=new ra(o)}gO(s,e,t,i)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wO(n){cD(TE),ls(new nD("database",(e,{instanceIdentifier:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),i=e.getProvider("app-check-internal");return yO(r,s,i,t)},"PUBLIC").setMultipleInstances(!0)),qt(x_,O_,n),qt(x_,O_,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const AO={".sv":"timestamp"};function wM(){return AO}Wt.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)};Wt.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)};wO();var fm={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bO=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},SO=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],a=n[t++],l=((s&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(l>>10)),e[r++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},RO={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,a=o?n[s+1]:0,l=s+2<n.length,u=l?n[s+2]:0,d=i>>2,f=(i&3)<<4|a>>4;let _=(a&15)<<2|u>>6,g=u&63;l||(g=64,o||(_=64)),r.push(t[d],t[f],t[_],t[g])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(bO(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):SO(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],a=s<n.length?t[n.charAt(s)]:0;++s;const u=s<n.length?t[n.charAt(s)]:64;++s;const f=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||a==null||u==null||f==null)throw new CO;const _=i<<2|a>>4;if(r.push(_),u!==64){const g=a<<4&240|u>>2;if(r.push(g),f!==64){const w=u<<6&192|f;r.push(w)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class CO extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const PO=function(n){try{return RO.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function NO(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const DO=()=>NO().__FIREBASE_DEFAULTS__,kO=()=>{if(typeof process>"u"||typeof fm>"u")return;const n=fm.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},xO=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&PO(n[1]);return e&&JSON.parse(e)},OO=()=>{try{return DO()||kO()||xO()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},VO=n=>{var e,t;return(t=(e=OO())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},MO=n=>{const e=VO(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const LO="FirebaseError";class Cc extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=LO,Object.setPrototypeOf(this,Cc.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,FO.prototype.create)}}class FO{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?UO(i,r):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new Cc(s,a,r)}}function UO(n,e){return n.replace(BO,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const BO=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cd(n){return n&&n._delegate?n._delegate:n}class $O{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qO="type.googleapis.com/google.protobuf.Int64Value",jO="type.googleapis.com/google.protobuf.UInt64Value";function uI(n,e){const t={};for(const r in n)n.hasOwnProperty(r)&&(t[r]=e(n[r]));return t}function vu(n){if(n==null)return null;if(n instanceof Number&&(n=n.valueOf()),typeof n=="number"&&isFinite(n)||n===!0||n===!1||Object.prototype.toString.call(n)==="[object String]")return n;if(n instanceof Date)return n.toISOString();if(Array.isArray(n))return n.map(e=>vu(e));if(typeof n=="function"||typeof n=="object")return uI(n,e=>vu(e));throw new Error("Data cannot be encoded in JSON: "+n)}function qa(n){if(n==null)return n;if(n["@type"])switch(n["@type"]){case qO:case jO:{const e=Number(n.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+n);return e}default:throw new Error("Data cannot be decoded from JSON: "+n)}return Array.isArray(n)?n.map(e=>qa(e)):typeof n=="function"||typeof n=="object"?uI(n,e=>qa(e)):n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pd="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pm={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class zr extends Cc{constructor(e,t,r){super(`${Pd}/${e}`,t||""),this.details=r}}function WO(n){if(n>=200&&n<300)return"ok";switch(n){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function GO(n,e){let t=WO(n),r=t,s;try{const i=e&&e.error;if(i){const o=i.status;if(typeof o=="string"){if(!pm[o])return new zr("internal","internal");t=pm[o],r=o}const a=i.message;typeof a=="string"&&(r=a),s=i.details,s!==void 0&&(s=qa(s))}}catch{}return t==="ok"?null:new zr(t,r,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HO{constructor(e,t,r){this.auth=null,this.messaging=null,this.appCheck=null,this.auth=e.getImmediate({optional:!0}),this.messaging=t.getImmediate({optional:!0}),this.auth||e.get().then(s=>this.auth=s,()=>{}),this.messaging||t.get().then(s=>this.messaging=s,()=>{}),this.appCheck||r.get().then(s=>this.appCheck=s,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.appCheck){const t=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return t.error?null:t.token}return null}async getContext(e){const t=await this.getAuthToken(),r=await this.getMessagingToken(),s=await this.getAppCheckToken(e);return{authToken:t,messagingToken:r,appCheckToken:s}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Iu="us-central1";function zO(n){let e=null;return{promise:new Promise((t,r)=>{e=setTimeout(()=>{r(new zr("deadline-exceeded","deadline-exceeded"))},n)}),cancel:()=>{e&&clearTimeout(e)}}}class KO{constructor(e,t,r,s,i=Iu,o){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new HO(t,r,s),this.cancelAllRequests=new Promise(a=>{this.deleteService=()=>Promise.resolve(a())});try{const a=new URL(i);this.customDomain=a.origin+(a.pathname==="/"?"":a.pathname),this.region=Iu}catch{this.customDomain=null,this.region=i}}_delete(){return this.deleteService()}_url(e){const t=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}}function QO(n,e,t){n.emulatorOrigin=`http://${e}:${t}`}function YO(n,e,t){return r=>XO(n,e,r,{})}async function JO(n,e,t,r){t["Content-Type"]="application/json";let s;try{s=await r(n,{method:"POST",body:JSON.stringify(e),headers:t})}catch{return{status:0,json:null}}let i=null;try{i=await s.json()}catch{}return{status:s.status,json:i}}function XO(n,e,t,r){const s=n._url(e);return ZO(n,s,t,r)}async function ZO(n,e,t,r){t=vu(t);const s={data:t},i={},o=await n.contextProvider.getContext(r.limitedUseAppCheckTokens);o.authToken&&(i.Authorization="Bearer "+o.authToken),o.messagingToken&&(i["Firebase-Instance-ID-Token"]=o.messagingToken),o.appCheckToken!==null&&(i["X-Firebase-AppCheck"]=o.appCheckToken);const a=r.timeout||7e4,l=zO(a),u=await Promise.race([JO(e,s,i,n.fetchImpl),l.promise,n.cancelAllRequests]);if(l.cancel(),!u)throw new zr("cancelled","Firebase Functions instance was deleted.");const d=GO(u.status,u.json);if(d)throw d;if(!u.json)throw new zr("internal","Response is not valid JSON object.");let f=u.json.data;if(typeof f>"u"&&(f=u.json.result),typeof f>"u")throw new zr("internal","Response is missing data field.");return{data:qa(f)}}const _m="@firebase/functions",mm="0.11.8";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eV="auth-internal",tV="app-check-internal",nV="messaging-internal";function rV(n,e){const t=(r,{instanceIdentifier:s})=>{const i=r.getProvider("app").getImmediate(),o=r.getProvider(eV),a=r.getProvider(nV),l=r.getProvider(tV);return new KO(i,o,a,l,s,n)};ls(new $O(Pd,t,"PUBLIC").setMultipleInstances(!0)),qt(_m,mm,e),qt(_m,mm,"esm2017")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function AM(n=Mh(),e=Iu){const r=Vh(Cd(n),Pd).getImmediate({identifier:e}),s=MO("functions");return s&&sV(r,...s),r}function sV(n,e,t){QO(Cd(n),e,t)}function bM(n,e,t){return YO(Cd(n),e)}rV(fetch.bind(self));export{ve as $,vM as A,yM as B,BC as C,FV as D,PV as E,GV as F,$V as G,YV as H,WV as I,QV as J,jV as K,JV as L,MV as M,LV as N,qV as O,ZV as P,IV as Q,gV as R,an as S,wV as T,mV as U,BV as V,_V as W,XV as X,KV as Y,aM as Z,lM as _,AV as a,ms as a0,pV as a1,yV as a2,EV as a3,TV as a4,vV as a5,DV as b,zV as c,kV as d,hM as e,TM as f,Cm as g,cM as h,_w as i,NV as j,UV as k,_M as l,pM as m,hO as n,gM as o,HV as p,OV as q,uM as r,wM as s,mM as t,oM as u,AM as v,VV as w,bM as x,IM as y,EM as z};
