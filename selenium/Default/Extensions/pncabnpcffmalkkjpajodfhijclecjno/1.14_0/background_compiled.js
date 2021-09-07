(function(){/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
'use strict';var n,aa=function(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}},ba="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;a[b]=c.value;return a},ca=function(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");
},da=ca(this),p=function(a,b){if(b)a:{var c=da;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];if(!(e in c))break a;c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&ba(c,a,{configurable:!0,writable:!0,value:b})}};
p("Symbol",function(a){if(a)return a;var b=function(e,g){this.dc=e;ba(this,"description",{configurable:!0,writable:!0,value:g})};b.prototype.toString=function(){return this.dc};var c=0,d=function(e){if(this instanceof d)throw new TypeError("Symbol is not a constructor");return new b("jscomp_symbol_"+(e||"")+"_"+c++,e)};return d});
p("Symbol.iterator",function(a){if(a)return a;a=Symbol("Symbol.iterator");for(var b="Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "),c=0;c<b.length;c++){var d=da[b[c]];"function"===typeof d&&"function"!=typeof d.prototype[a]&&ba(d.prototype,a,{configurable:!0,writable:!0,value:function(){return ea(aa(this))}})}return a});
var ea=function(a){a={next:a};a[Symbol.iterator]=function(){return this};return a},q=function(a){var b="undefined"!=typeof Symbol&&Symbol.iterator&&a[Symbol.iterator];return b?b.call(a):{next:aa(a)}},fa=function(){this.ra=!1;this.ia=null;this.na=void 0;this.i=1;this.tb=this.ea=0;this.ka=null};fa.prototype.v=function(){if(this.ra)throw new TypeError("Generator is already running");this.ra=!0};fa.prototype.sa=function(a){this.na=a};fa.prototype.va=function(a){this.ka={jc:a,tc:!0};this.i=this.ea||this.tb};
fa.prototype.return=function(a){this.ka={return:a};this.i=this.tb};var r=function(a,b,c){a.i=c;return{value:b}},ha=function(a,b){a.i=b;a.ea=0},ia=function(a){a.ea=0;a.ka=null},ja=function(a){this.b=new fa;this.xc=a};ja.prototype.sa=function(a){this.b.v();if(this.b.ia)return ka(this,this.b.ia.next,a,this.b.sa);this.b.sa(a);return la(this)};var ma=function(a,b){a.b.v();var c=a.b.ia;if(c)return ka(a,"return"in c?c["return"]:function(d){return{value:d,done:!0}},b,a.b.return);a.b.return(b);return la(a)};
ja.prototype.va=function(a){this.b.v();if(this.b.ia)return ka(this,this.b.ia["throw"],a,this.b.sa);this.b.va(a);return la(this)};
var ka=function(a,b,c,d){try{var e=b.call(a.b.ia,c);if(!(e instanceof Object))throw new TypeError("Iterator result "+e+" is not an object");if(!e.done)return a.b.ra=!1,e;var g=e.value}catch(h){return a.b.ia=null,a.b.va(h),la(a)}a.b.ia=null;d.call(a.b,g);return la(a)},la=function(a){for(;a.b.i;)try{var b=a.xc(a.b);if(b)return a.b.ra=!1,{value:b.value,done:!1}}catch(c){a.b.na=void 0,a.b.va(c)}a.b.ra=!1;if(a.b.ka){b=a.b.ka;a.b.ka=null;if(b.tc)throw b.jc;return{value:b.return,done:!0}}return{value:void 0,
done:!0}},na=function(a){this.next=function(b){return a.sa(b)};this.throw=function(b){return a.va(b)};this.return=function(b){return ma(a,b)};this[Symbol.iterator]=function(){return this}},oa=function(a){function b(d){return a.next(d)}function c(d){return a.throw(d)}return new Promise(function(d,e){function g(h){h.done?d(h.value):Promise.resolve(h.value).then(b,c).then(g,e)}g(a.next())})},t=function(a){return oa(new na(new ja(a)))};
p("Promise",function(a){function b(){this.da=null}function c(h){return h instanceof e?h:new e(function(f){f(h)})}if(a)return a;b.prototype.rb=function(h){if(null==this.da){this.da=[];var f=this;this.sb(function(){f.kc()})}this.da.push(h)};var d=da.setTimeout;b.prototype.sb=function(h){d(h,0)};b.prototype.kc=function(){for(;this.da&&this.da.length;){var h=this.da;this.da=[];for(var f=0;f<h.length;++f){var k=h[f];h[f]=null;try{k()}catch(l){this.fc(l)}}}this.da=null};b.prototype.fc=function(h){this.sb(function(){throw h;
})};var e=function(h){this.ua=0;this.nb=void 0;this.la=[];var f=this.gb();try{h(f.resolve,f.reject)}catch(k){f.reject(k)}};e.prototype.gb=function(){function h(l){return function(m){k||(k=!0,l.call(f,m))}}var f=this,k=!1;return{resolve:h(this.zc),reject:h(this.mb)}};e.prototype.zc=function(h){if(h===this)this.mb(new TypeError("A Promise cannot resolve to itself"));else if(h instanceof e)this.ad(h);else{a:switch(typeof h){case "object":var f=null!=h;break a;case "function":f=!0;break a;default:f=!1}f?
this.yc(h):this.ub(h)}};e.prototype.yc=function(h){var f=void 0;try{f=h.then}catch(k){this.mb(k);return}"function"==typeof f?this.bd(f,h):this.ub(h)};e.prototype.mb=function(h){this.zb(2,h)};e.prototype.ub=function(h){this.zb(1,h)};e.prototype.zb=function(h,f){if(0!=this.ua)throw Error("Cannot settle("+h+", "+f+"): Promise already settled in state"+this.ua);this.ua=h;this.nb=f;this.lc()};e.prototype.lc=function(){if(null!=this.la){for(var h=0;h<this.la.length;++h)g.rb(this.la[h]);this.la=null}};var g=
new b;e.prototype.ad=function(h){var f=this.gb();h.ya(f.resolve,f.reject)};e.prototype.bd=function(h,f){var k=this.gb();try{h.call(f,k.resolve,k.reject)}catch(l){k.reject(l)}};e.prototype.then=function(h,f){function k(O,S){return"function"==typeof O?function(Na){try{l(O(Na))}catch(Oa){m(Oa)}}:S}var l,m,L=new e(function(O,S){l=O;m=S});this.ya(k(h,l),k(f,m));return L};e.prototype.catch=function(h){return this.then(void 0,h)};e.prototype.ya=function(h,f){function k(){switch(l.ua){case 1:h(l.nb);break;
case 2:f(l.nb);break;default:throw Error("Unexpected state: "+l.ua);}}var l=this;null==this.la?g.rb(k):this.la.push(k)};e.resolve=c;e.reject=function(h){return new e(function(f,k){k(h)})};e.race=function(h){return new e(function(f,k){for(var l=q(h),m=l.next();!m.done;m=l.next())c(m.value).ya(f,k)})};e.all=function(h){var f=q(h),k=f.next();return k.done?c([]):new e(function(l,m){function L(Na){return function(Oa){O[Na]=Oa;S--;0==S&&l(O)}}var O=[],S=0;do O.push(void 0),S++,c(k.value).ya(L(O.length-
1),m),k=f.next();while(!k.done)})};return e});p("Promise.prototype.finally",function(a){return a?a:function(b){return this.then(function(c){return Promise.resolve(b()).then(function(){return c})},function(c){return Promise.resolve(b()).then(function(){throw c;})})}});
p("String.prototype.startsWith",function(a){return a?a:function(b,c){if(null==this)throw new TypeError("The 'this' value for String.prototype.startsWith must not be null or undefined");if(b instanceof RegExp)throw new TypeError("First argument to String.prototype.startsWith must not be a regular expression");var d=this+"";b+="";var e=d.length,g=b.length;c=Math.max(0,Math.min(c|0,d.length));for(var h=0;h<g&&c<e;)if(d[c++]!=b[h++])return!1;return h>=g}});
var pa=function(a,b){a instanceof String&&(a+="");var c=0,d=!1,e={next:function(){if(!d&&c<a.length){var g=c++;return{value:b(g,a[g]),done:!1}}d=!0;return{done:!0,value:void 0}}};e[Symbol.iterator]=function(){return e};return e};p("Array.prototype.keys",function(a){return a?a:function(){return pa(this,function(b){return b})}});var u=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)};p("Object.values",function(a){return a?a:function(b){var c=[],d;for(d in b)u(b,d)&&c.push(b[d]);return c}});
p("WeakMap",function(a){function b(){}function c(k){var l=typeof k;return"object"===l&&null!==k||"function"===l}function d(k){if(!u(k,g)){var l=new b;ba(k,g,{value:l})}}function e(k){var l=Object[k];l&&(Object[k]=function(m){if(m instanceof b)return m;Object.isExtensible(m)&&d(m);return l(m)})}if(function(){if(!a||!Object.seal)return!1;try{var k=Object.seal({}),l=Object.seal({}),m=new a([[k,2],[l,3]]);if(2!=m.get(k)||3!=m.get(l))return!1;m.delete(k);m.set(l,4);return!m.has(k)&&4==m.get(l)}catch(L){return!1}}())return a;
var g="$jscomp_hidden_"+Math.random();e("freeze");e("preventExtensions");e("seal");var h=0,f=function(k){this.qa=(h+=Math.random()+1).toString();if(k){k=q(k);for(var l;!(l=k.next()).done;)l=l.value,this.set(l[0],l[1])}};f.prototype.set=function(k,l){if(!c(k))throw Error("Invalid WeakMap key");d(k);if(!u(k,g))throw Error("WeakMap key fail: "+k);k[g][this.qa]=l;return this};f.prototype.get=function(k){return c(k)&&u(k,g)?k[g][this.qa]:void 0};f.prototype.has=function(k){return c(k)&&u(k,g)&&u(k[g],
this.qa)};f.prototype.delete=function(k){return c(k)&&u(k,g)&&u(k[g],this.qa)?delete k[g][this.qa]:!1};return f});
p("Map",function(a){if(function(){if(!a||"function"!=typeof a||!a.prototype.entries||"function"!=typeof Object.seal)return!1;try{var f=Object.seal({x:4}),k=new a(q([[f,"s"]]));if("s"!=k.get(f)||1!=k.size||k.get({x:4})||k.set({x:4},"t")!=k||2!=k.size)return!1;var l=k.entries(),m=l.next();if(m.done||m.value[0]!=f||"s"!=m.value[1])return!1;m=l.next();return m.done||4!=m.value[0].x||"t"!=m.value[1]||!l.next().done?!1:!0}catch(L){return!1}}())return a;var b=new WeakMap,c=function(f){this.pa={};this.ca=
g();this.size=0;if(f){f=q(f);for(var k;!(k=f.next()).done;)k=k.value,this.set(k[0],k[1])}};c.prototype.set=function(f,k){f=0===f?0:f;var l=d(this,f);l.list||(l.list=this.pa[l.id]=[]);l.entry?l.entry.value=k:(l.entry={next:this.ca,previous:this.ca.previous,head:this.ca,key:f,value:k},l.list.push(l.entry),this.ca.previous.next=l.entry,this.ca.previous=l.entry,this.size++);return this};c.prototype.delete=function(f){f=d(this,f);return f.entry&&f.list?(f.list.splice(f.index,1),f.list.length||delete this.pa[f.id],
f.entry.previous.next=f.entry.next,f.entry.next.previous=f.entry.previous,f.entry.head=null,this.size--,!0):!1};c.prototype.clear=function(){this.pa={};this.ca=this.ca.previous=g();this.size=0};c.prototype.has=function(f){return!!d(this,f).entry};c.prototype.get=function(f){return(f=d(this,f).entry)&&f.value};c.prototype.entries=function(){return e(this,function(f){return[f.key,f.value]})};c.prototype.keys=function(){return e(this,function(f){return f.key})};c.prototype.values=function(){return e(this,
function(f){return f.value})};c.prototype.forEach=function(f,k){for(var l=this.entries(),m;!(m=l.next()).done;)m=m.value,f.call(k,m[1],m[0],this)};c.prototype[Symbol.iterator]=c.prototype.entries;var d=function(f,k){var l=k&&typeof k;"object"==l||"function"==l?b.has(k)?l=b.get(k):(l=""+ ++h,b.set(k,l)):l="p_"+k;var m=f.pa[l];if(m&&u(f.pa,l))for(f=0;f<m.length;f++){var L=m[f];if(k!==k&&L.key!==L.key||k===L.key)return{id:l,list:m,index:f,entry:L}}return{id:l,list:m,index:-1,entry:void 0}},e=function(f,
k){var l=f.ca;return ea(function(){if(l){for(;l.head!=f.ca;)l=l.previous;for(;l.next!=l.head;)return l=l.next,{done:!1,value:k(l)};l=null}return{done:!0,value:void 0}})},g=function(){var f={};return f.previous=f.next=f.head=f},h=0;return c});p("Object.entries",function(a){return a?a:function(b){var c=[],d;for(d in b)u(b,d)&&c.push([d,b[d]]);return c}});
p("Array.from",function(a){return a?a:function(b,c,d){c=null!=c?c:function(f){return f};var e=[],g="undefined"!=typeof Symbol&&Symbol.iterator&&b[Symbol.iterator];if("function"==typeof g){b=g.call(b);for(var h=0;!(g=b.next()).done;)e.push(c.call(d,g.value,h++))}else for(g=b.length,h=0;h<g;h++)e.push(c.call(d,b[h],h));return e}});
var qa=this||self,ra=function(a,b,c){return a.call.apply(a.bind,arguments)},sa=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}},ta=function(a,b,c){ta=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ra:sa;return ta.apply(null,arguments)},ua=
Date.now,v=function(a,b){function c(){}c.prototype=b.prototype;a.prototype=new c;a.prototype.constructor=a};var xa=function(a){var b=va;return wa(b).then(function(){return a()}).then(function(c){return c}).finally(function(){0<b.kb.length?b.kb.shift()():b.jb=!1})},wa=function(a){if(a.jb){var b,c=new Promise(function(d){b=d});a.kb.push(b);return c}a.jb=!0;return Promise.resolve()};var ya=Array.prototype.map?function(a,b){return Array.prototype.map.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=Array(c),e="string"===typeof a?a.split(""):a,g=0;g<c;g++)g in e&&(d[g]=b.call(void 0,e[g],g,a));return d},za=function(a,b,c){return 2>=arguments.length?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)};var w=function(a,b){this.wb=b===Aa?a:""};w.prototype.sc=!0;w.prototype.qc=function(){return this.wb.toString()};var Ba=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i,Aa={};var Ca=function(){this.fb=this.vc=null},Da=function(a,b){this.name=a;this.value=b};Da.prototype.toString=function(){return this.name};var Ea=new Da("OFF",Infinity),Fa=new Da("SEVERE",1E3),Ga=new Da("WARNING",900),Ha=new Da("CONFIG",700);Ca.prototype.getParent=function(){return this.vc};Ca.prototype.getChildren=function(){this.fb||(this.fb={});return this.fb};Ca.prototype.log=function(){};Ca.prototype.info=function(){};var Ia=null;function Ja(){var a=chrome.storage.local;return new Promise(function(b,c){a.clear(function(){chrome.runtime.lastError?c():b()})})}function Ka(a){var b=chrome.storage.local;return new Promise(function(c,d){b.get(a,function(e){chrome.runtime.lastError?d():c(e)})})}function La(a){var b=chrome.storage.local;return new Promise(function(c,d){b.set(a,function(){chrome.runtime.lastError?d():c()})})}
function Ma(a){var b=chrome.storage.local;return new Promise(function(c,d){b.remove(a,function(){chrome.runtime.lastError?d():c()})})};var va=new function(){this.jb=!1;this.kb=[]};function Pa(a,b){var c,d,e,g,h,f;return t(function(k){if(1==k.i){if(b._breached_credential_warning_states_)return k.return(!0);c={};d=q(a);for(e=d.next();!e.done;e=d.next())g=e.value,c[g]=b[g];h={};f=(h._breached_credential_warning_states_=c,h);k.ea=2;return r(k,La(f),4)}if(2!=k.i)return k.return(!0);ia(k);return k.return(!1)})}
function Qa(){return xa(function(){var a,b,c;return t(function(d){if(1==d.i)return r(d,Ka(void 0),2);if(3!=d.i)return a=d.na,b=Object.keys(a).filter(function(e){return!e.startsWith("_")}),0===b.length?d.return():r(d,Pa(b,a),3);c=d.na;if(!c)throw Error("Failed to store new partition.");return r(d,Ma(b),0)})})}function Ra(){return Ka("_breached_credential_warning_states_").then(function(a){return a._breached_credential_warning_states_||{}})}
function Sa(a){var b={};return La((b._breached_credential_warning_states_=a,b))}function Ta(a){return xa(function(){return Ra().then(function(b){if(!b[a])return 0;for(var c=0,d=q(Object.values(b[a])),e=d.next();!e.done;e=d.next())e=e.value,e.ignore||c++,e.ignore=!0;return Sa(b).then(function(){return c})})})}
function Ua(){return Ra().then(function(a){var b=new Map,c=!1;a=q(Object.entries(a));for(var d=a.next();!d.done;d=a.next()){var e=q(d.value);d=e.next().value;var g=e.next().value;e=0;g=q(Object.values(g));for(var h=g.next();!h.done;h=g.next())c=(h=h.value.ignore)||c,e+=h?0:1;0<e&&b.set(d,e)}return{rc:c,hc:b}})};var Va=new Map;function Wa(){var a=performance.now();Va.forEach(function(b,c){216E4<a-b.creationTime&&Va.delete(c)})};function Xa(a,b){var c=b&2147483648;c&&(a=~a+1>>>0,b=~b>>>0,0==a&&(b=b+1>>>0));a=4294967296*b+(a>>>0);return c?-a:a};var Ya=function(a,b,c){this.l=null;this.a=this.ja=this.v=0;this.ba=!1;a&&this.cb(a,b,c)},$a=function(a,b,c){if(Za.length){var d=Za.pop();a&&d.cb(a,b,c);return d}return new Ya(a,b,c)};n=Ya.prototype;n.clone=function(){return $a(this.l,this.v,this.ja-this.v)};n.clear=function(){this.l=null;this.a=this.ja=this.v=0;this.ba=!1};
n.cb=function(a,b,c){this.l=a.constructor===Uint8Array?a:a.constructor===ArrayBuffer?new Uint8Array(a):a.constructor===Array?new Uint8Array(a):a.constructor===String?ab(a):new Uint8Array(0);this.v=void 0!==b?b:0;this.ja=void 0!==c?this.v+c:this.l.length;this.a=this.v};n.setEnd=function(a){this.ja=a};n.reset=function(){this.a=this.v};n.ib=function(){return this.a};n.advance=function(a){this.a+=a};n.getError=function(){return this.ba||0>this.a||this.a>this.ja};
n.lb=function(a){for(var b=128,c=0,d=0,e=0;4>e&&128<=b;e++)b=this.l[this.a++],c|=(b&127)<<7*e;128<=b&&(b=this.l[this.a++],c|=(b&127)<<28,d|=(b&127)>>4);if(128<=b)for(e=0;5>e&&128<=b;e++)b=this.l[this.a++],d|=(b&127)<<7*e+3;if(128>b)return a(c>>>0,d>>>0);this.ba=!0};
var x=function(a){var b=a.l;var c=b[a.a+0];var d=c&127;if(128>c)return a.a+=1,d;c=b[a.a+1];d|=(c&127)<<7;if(128>c)return a.a+=2,d;c=b[a.a+2];d|=(c&127)<<14;if(128>c)return a.a+=3,d;c=b[a.a+3];d|=(c&127)<<21;if(128>c)return a.a+=4,d;c=b[a.a+4];d|=(c&15)<<28;if(128>c)return a.a+=5,d>>>0;a.a+=5;128<=b[a.a++]&&128<=b[a.a++]&&128<=b[a.a++]&&128<=b[a.a++]&&a.a++;return d};
Ya.prototype.bb=function(){var a=this.l[this.a+0],b=this.l[this.a+1],c=this.l[this.a+2],d=this.l[this.a+3];this.a+=4;return a<<0|b<<8|c<<16|d<<24};Ya.prototype.ab=function(){return!!this.l[this.a++]};Ya.prototype.xb=function(){return x(this)};
Ya.prototype.fa=function(a){var b=this.l,c=this.a,d=c+a,e=[];for(a="";c<d;){var g=b[c++];if(128>g)e.push(g);else if(192>g)continue;else if(224>g){var h=b[c++];e.push((g&31)<<6|h&63)}else if(240>g){h=b[c++];var f=b[c++];e.push((g&15)<<12|(h&63)<<6|f&63)}else if(248>g){h=b[c++];f=b[c++];var k=b[c++];g=(g&7)<<18|(h&63)<<12|(f&63)<<6|k&63;g-=65536;e.push((g>>10&1023)+55296,(g&1023)+56320)}8192<=e.length&&(a+=String.fromCharCode.apply(null,e),e.length=0)}if(8192>=e.length)e=String.fromCharCode.apply(null,
e);else{b="";for(d=0;d<e.length;d+=8192)b+=String.fromCharCode.apply(null,za(e,d,d+8192));e=b}this.a=c;return a+e};var Za=[];var y=function(a){this.f=$a(a,void 0,void 0);this.aa=this.j=-1;this.ba=!1};y.prototype.ib=function(){return this.f.ib()};var z=function(a){return 4==a.aa};y.prototype.getError=function(){return this.ba||this.f.getError()};y.prototype.cb=function(a,b,c){this.f.cb(a,b,c);this.aa=this.j=-1};y.prototype.reset=function(){this.f.reset();this.aa=this.j=-1};y.prototype.advance=function(a){this.f.advance(a)};
var A=function(a){var b=a.f;if(b.a==b.ja||a.getError())return!1;b=x(a.f);var c=b&7;if(0!=c&&5!=c&&1!=c&&2!=c&&3!=c&&4!=c)return a.ba=!0,!1;a.j=b>>>3;a.aa=c;return!0},B=function(a){switch(a.aa){case 0:if(0!=a.aa)B(a);else{for(a=a.f;a.l[a.a]&128;)a.a++;a.a++}break;case 1:1!=a.aa?B(a):a.f.advance(8);break;case 2:if(2!=a.aa)B(a);else{var b=x(a.f);a.f.advance(b)}break;case 5:5!=a.aa?B(a):a.f.advance(4);break;case 3:b=a.j;do{if(!A(a)){a.ba=!0;break}if(4==a.aa){a.j!=b&&(a.ba=!0);break}B(a)}while(1);break;
default:a.ba=!0}},C=function(a,b,c){var d=a.f.ja,e=x(a.f);e=a.f.ib()+e;a.f.setEnd(e);c(b,a);a.f.a=e;a.f.setEnd(d)};n=y.prototype;n.bb=function(){return x(this.f)};n.ab=function(){return!!x(this.f)};n.xb=function(){return this.f.lb(Xa)};n.fa=function(){var a=x(this.f);return this.f.fa(a)};n.lb=function(a){return this.f.lb(a)};var D=function(){this.h=[]};D.prototype.length=function(){return this.h.length};D.prototype.end=function(){var a=this.h;this.h=[];return a};var bb=function(a,b){for(;127<b;)a.h.push(b&127|128),b>>>=7;a.h.push(b)},cb=function(a,b){if(0<=b)bb(a,b);else{for(var c=0;9>c;c++)a.h.push(b&127|128),b>>=7;a.h.push(1)}};D.prototype.eb=function(a){this.h.push(a>>>0&255);this.h.push(a>>>8&255);this.h.push(a>>>16&255);this.h.push(a>>>24&255)};D.prototype.wa=function(a){this.h.push(a?1:0)};
D.prototype.cc=function(a){cb(this,a)};D.prototype.ha=function(a){for(var b=0;b<a.length;b++){var c=a.charCodeAt(b);if(128>c)this.h.push(c);else if(2048>c)this.h.push(c>>6|192),this.h.push(c&63|128);else if(65536>c)if(55296<=c&&56319>=c&&b+1<a.length){var d=a.charCodeAt(b+1);56320<=d&&57343>=d&&(c=1024*(c-55296)+d-56320+65536,this.h.push(c>>18|240),this.h.push(c>>12&63|128),this.h.push(c>>6&63|128),this.h.push(c&63|128),b++)}else this.h.push(c>>12|224),this.h.push(c>>6&63|128),this.h.push(c&63|128)}};var db=null,ab=function(a){var b=a.length,c=3*b/4;c%3?c=Math.floor(c):-1!="=.".indexOf(a[b-1])&&(c=-1!="=.".indexOf(a[b-2])?c-2:c-1);var d=new Uint8Array(c),e=0;eb(a,function(g){d[e++]=g});return d.subarray(0,e)},eb=function(a,b){function c(k){for(;d<a.length;){var l=a.charAt(d++),m=db[l];if(null!=m)return m;if(!/^[\s\xa0]*$/.test(l))throw Error("Unknown base64 encoding at char: "+l);}return k}fb();for(var d=0;;){var e=c(-1),g=c(0),h=c(64),f=c(64);if(64===f&&-1===e)break;b(e<<2|g>>4);64!=h&&(b(g<<
4&240|h>>2),64!=f&&b(h<<6&192|f))}},fb=function(){if(!db){db={};for(var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),b=["+/=","+/","-_=","-_.","-_"],c=0;5>c;c++)for(var d=a.concat(b[c].split("")),e=0;e<d.length;e++){var g=d[e];void 0===db[g]&&(db[g]=e)}}};var E=function(){this.xa=[];this.ga=0;this.o=new D},gb=function(a,b){bb(a.o,8*b+2);b=a.o.end();a.xa.push(b);a.ga+=b.length;b.push(a.ga);return b},hb=function(a,b){var c=b.pop();for(c=a.ga+a.o.length()-c;127<c;)b.push(c&127|128),c>>>=7,a.ga++;b.push(c);a.ga++};E.prototype.reset=function(){this.xa=[];this.o.end();this.ga=0};var F=function(a){for(var b=new Uint8Array(a.ga+a.o.length()),c=a.xa,d=c.length,e=0,g=0;g<d;g++){var h=c[g];b.set(h,e);e+=h.length}c=a.o.end();b.set(c,e);a.xa=[b];return b};
E.prototype.eb=function(a,b){null!=b&&null!=b&&(bb(this.o,8*a),cb(this.o,b))};E.prototype.wa=function(a,b){null!=b&&(bb(this.o,8*a),this.o.wa(b))};E.prototype.cc=function(a,b){null!=b&&(b=parseInt(b,10),bb(this.o,8*a),cb(this.o,b))};E.prototype.ha=function(a,b){null!=b&&(a=gb(this,a),this.o.ha(b),hb(this,a))};var G=function(a,b,c,d){null!=c&&(b=gb(a,b),d(c,a),hb(a,b))};var H=function(){},ib="function"==typeof Uint8Array,J=function(a,b,c,d){a.c=null;b||(b=[]);a.kd=void 0;a.oa=-1;a.m=b;a:{if(b=a.m.length){--b;var e=a.m[b];if(!(null===e||"object"!=typeof e||Array.isArray(e)||ib&&e instanceof Uint8Array)){a.ta=b-a.oa;a.s=e;break a}}a.ta=Number.MAX_VALUE}a.gd={};if(c)for(b=0;b<c.length;b++)e=c[b],e<a.ta?(e+=a.oa,a.m[e]=a.m[e]||jb):(kb(a),a.s[e]=a.s[e]||jb);if(d&&d.length)for(b=0;b<d.length;b++)I(a,d[b])},jb=[],kb=function(a){var b=a.ta+a.oa;a.m[b]||(a.s=a.m[b]={})},
K=function(a,b){if(b<a.ta){b+=a.oa;var c=a.m[b];return c===jb?a.m[b]=[]:c}if(a.s)return c=a.s[b],c===jb?a.s[b]=[]:c},M=function(a,b,c){b<a.ta?a.m[b+a.oa]=c:(kb(a),a.s[b]=c);return a},I=function(a,b){for(var c,d,e=0;e<b.length;e++){var g=b[e],h=K(a,g);null!=h&&(c=g,d=h,M(a,g,void 0))}return c?(M(a,c,d),c):0},N=function(a,b,c){a.c||(a.c={});if(!a.c[c]){var d=K(a,c);d&&(a.c[c]=new b(d))}return a.c[c]},mb=function(a){lb(a,P);var b=a.c[1];b==jb&&(b=a.c[1]=[]);return b},lb=function(a,b){a.c||(a.c={});if(!a.c[1]){for(var c=
K(a,1),d=[],e=0;e<c.length;e++)d[e]=new b(c[e]);a.c[1]=d}},Q=function(a,b,c,d){a.c||(a.c={});var e=d?d.m:d;a.c[b]=d;(c=I(a,c))&&c!==b&&void 0!==e&&(a.c&&c in a.c&&(a.c[c]=void 0),M(a,c,void 0));M(a,b,e)};H.prototype.toString=function(){return this.m.toString()};
H.prototype.getExtension=function(a){kb(this);this.c||(this.c={});var b=a.hd;return a.jd?a.uc()?(this.c[b]||(this.c[b]=ya(this.s[b]||[],function(c){return new a.ic(c)})),this.c[b]):this.s[b]=this.s[b]||[]:a.uc()?(!this.c[b]&&this.s[b]&&(this.c[b]=new a.ic(this.s[b])),this.c[b]):this.s[b]};H.prototype.clone=function(){return new this.constructor(nb(this.m))};
var nb=function(a){if(Array.isArray(a)){for(var b=Array(a.length),c=0;c<a.length;c++){var d=a[c];null!=d&&(b[c]="object"==typeof d?nb(d):d)}return b}if(ib&&a instanceof Uint8Array)return new Uint8Array(a);b={};for(c in a)d=a[c],null!=d&&(b[c]="object"==typeof d?nb(d):d);return b};var P=function(a){J(this,a,null,null)};v(P,H);var pb=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=b.fa();a.ma(c);break;case 2:c=b.bb();ob(a,c);break;default:B(b)}return a};P.prototype.g=function(){var a=new E;qb(this,a);return F(a)};var qb=function(a,b){var c=K(a,1);null!=c&&b.ha(1,c);c=K(a,2);null!=c&&b.eb(2,c)};P.prototype.ma=function(a){return M(this,1,a)};var ob=function(a,b){return M(a,2,b)};var rb=function(a){J(this,a,null,null)};v(rb,H);var sb=function(a,b){for(;A(b)&&!z(b);)B(b);return a};rb.prototype.g=function(){return F(new E)};var tb=function(){};var ub=function(a){J(this,a,null,null)};v(ub,H);var vb=function(a,b){for(;A(b)&&!z(b);)B(b);return a};ub.prototype.g=function(){return F(new E)};var wb=function(){};var xb=function(a){J(this,a,null,null)};v(xb,H);var yb=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=b.ab();a.pb(c);break;default:B(b)}return a};xb.prototype.g=function(){var a=new E;zb(this,a);return F(a)};var zb=function(a,b){a=K(a,1);null!=a&&b.wa(1,a)};xb.prototype.pb=function(a){M(this,1,a)};var R=function(a){J(this,a,null,Ab)};v(R,H);var Ab=[[1,2,3]];R.prototype.u=function(){return I(this,Ab[0])};var Bb=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=new ub;C(b,c,vb);Q(a,1,Ab[0],c);break;case 2:c=new xb;C(b,c,yb);Q(a,2,Ab[0],c);break;case 3:c=new rb;C(b,c,sb);Q(a,3,Ab[0],c);break;default:B(b)}return a};R.prototype.g=function(){var a=new E;Cb(this,a);return F(a)};
var Cb=function(a,b){var c=N(a,ub,1);null!=c&&G(b,1,c,wb);c=N(a,xb,2);null!=c&&G(b,2,c,zb);c=N(a,rb,3);null!=c&&G(b,3,c,tb)};var Db=function(a){J(this,a,null,null)};v(Db,H);var Eb=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=b.fa();M(a,1,c);break;case 2:c=b.fa();M(a,2,c);break;default:B(b)}return a};Db.prototype.g=function(){var a=new E;Fb(this,a);return F(a)};var Fb=function(a,b){var c=K(a,1);null!=c&&b.ha(1,c);c=K(a,2);null!=c&&b.ha(2,c)};var Gb=function(a){J(this,a,null,null)};v(Gb,H);var Hb=function(a,b){for(;A(b)&&!z(b);)B(b);return a};Gb.prototype.g=function(){return F(new E)};var Ib=function(){};var Jb=function(a){J(this,a,null,null)};v(Jb,H);var Kb=function(a,b){for(;A(b)&&!z(b);)B(b);return a};Jb.prototype.g=function(){return F(new E)};var Lb=function(){};var Mb=function(a){J(this,a,null,null)};v(Mb,H);var Nb=function(a,b){for(;A(b)&&!z(b);)B(b);return a};Mb.prototype.g=function(){return F(new E)};var Ob=function(){};var T=function(a){J(this,a,null,null)};v(T,H);var Pb=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=b.fa();a.ma(c);break;default:B(b)}return a};T.prototype.g=function(){var a=new E;Qb(this,a);return F(a)};var Qb=function(a,b){a=K(a,1);null!=a&&b.ha(1,a)};T.prototype.ma=function(a){return M(this,1,a)};var Rb=function(a){J(this,a,null,null)};v(Rb,H);var Sb=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=b.fa();a.ma(c);break;default:B(b)}return a};Rb.prototype.g=function(){var a=new E;Tb(this,a);return F(a)};var Tb=function(a,b){a=K(a,1);null!=a&&b.ha(1,a)};Rb.prototype.ma=function(a){return M(this,1,a)};var Ub=function(a){J(this,a,null,null)};v(Ub,H);var Vb=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=b.bb();M(a,1,c);break;default:B(b)}return a};Ub.prototype.g=function(){var a=new E;Wb(this,a);return F(a)};var Wb=function(a,b){a=K(a,1);null!=a&&b.eb(1,a)};var Yb=function(a){J(this,a,null,Xb)};v(Yb,H);var Xb=[[1,2]];Yb.prototype.u=function(){return I(this,Xb[0])};var Zb=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=new Rb;C(b,c,Sb);Q(a,1,Xb[0],c);break;case 2:c=new Ub;C(b,c,Vb);Q(a,2,Xb[0],c);break;default:B(b)}return a};Yb.prototype.g=function(){var a=new E;$b(this,a);return F(a)};var $b=function(a,b){var c=N(a,Rb,1);null!=c&&G(b,1,c,Tb);c=N(a,Ub,2);null!=c&&G(b,2,c,Wb)};var ac=function(a){J(this,a,null,U)};v(ac,H);var U=[[1,2,3,4,6,7,8]];n=ac.prototype;n.u=function(){return I(this,U[0])};n.g=function(){var a=new E;var b=N(this,Jb,1);null!=b&&G(a,1,b,Lb);b=N(this,T,2);null!=b&&G(a,2,b,Qb);b=N(this,Yb,3);null!=b&&G(a,3,b,$b);b=this.hb();null!=b&&G(a,4,b,Ib);b=N(this,Db,6);null!=b&&G(a,6,b,Fb);b=N(this,Mb,7);null!=b&&G(a,7,b,Ob);b=N(this,R,8);null!=b&&G(a,8,b,Cb);b=K(this,5);null!=b&&a.ha(5,b);return F(a)};n.hb=function(){return N(this,Gb,4)};
n.ob=function(a){Q(this,4,U[0],a)};n.getToken=function(){return K(this,5)};var bc=function(a){J(this,a,null,null)};v(bc,H);var cc=function(a,b){for(;A(b)&&!z(b);)B(b);return a};bc.prototype.g=function(){return F(new E)};var dc=function(){};var ec=function(a){J(this,a,null,null)};v(ec,H);var fc=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=b.ab();a.pb(c);break;default:B(b)}return a};ec.prototype.g=function(){var a=new E;gc(this,a);return F(a)};var gc=function(a,b){a=K(a,1);null!=a&&b.wa(1,a)};ec.prototype.pb=function(a){M(this,1,a)};var hc=function(a){J(this,a,null,null)};v(hc,H);var ic=function(a,b){for(;A(b)&&!z(b);)B(b);return a};hc.prototype.g=function(){return F(new E)};var jc=function(){};var lc=function(a){J(this,a,null,kc)};v(lc,H);var kc=[[1,2,3]];lc.prototype.u=function(){return I(this,kc[0])};var mc=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=new ec;C(b,c,fc);Q(a,1,kc[0],c);break;case 2:c=new hc;C(b,c,ic);Q(a,2,kc[0],c);break;case 3:c=new bc;C(b,c,cc);Q(a,3,kc[0],c);break;default:B(b)}return a};lc.prototype.g=function(){var a=new E;nc(this,a);return F(a)};
var nc=function(a,b){var c=N(a,ec,1);null!=c&&G(b,1,c,gc);c=N(a,hc,2);null!=c&&G(b,2,c,jc);c=N(a,bc,3);null!=c&&G(b,3,c,dc)};var oc=function(a){J(this,a,null,null)};v(oc,H);var pc=function(a,b){for(;A(b)&&!z(b);)B(b);return a};oc.prototype.g=function(){return F(new E)};var qc=function(){};var sc=function(a){J(this,a,rc,null)};v(sc,H);var rc=[1],tc=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=new P;C(b,c,pb);var d=a,e=c,g=P;lb(d,g);(c=d.c[1])||(c=d.c[1]=[]);e=e?e:new g;d=K(d,1);c.push(e);d.push(e.m);break;case 2:c=b.ab();M(a,2,c);break;default:B(b)}return a};sc.prototype.g=function(){var a=new E;uc(this,a);return F(a)};
var uc=function(a,b){var c=mb(a);if(0<c.length){var d=qb;if(null!=c)for(var e=0;e<c.length;e++){var g=gb(b,1);d(c[e],b);hb(b,g)}}c=K(a,2);null!=c&&b.wa(2,c)};var vc=function(a){J(this,a,null,null)};v(vc,H);var wc=function(a,b){for(;A(b)&&!z(b);)switch(b.j){case 1:var c=b.bb();M(a,1,c);break;default:B(b)}return a};vc.prototype.g=function(){var a=new E;xc(this,a);return F(a)};var xc=function(a,b){a=K(a,1);null!=a&&b.eb(1,a)};var yc=function(a){J(this,a,null,null)};v(yc,H);var zc=function(a,b){for(;A(b)&&!z(b);)B(b);return a};yc.prototype.g=function(){return F(new E)};var Ac=function(){};var Bc=function(a){J(this,a,null,null)};v(Bc,H);var Cc=function(a,b){for(;A(b)&&!z(b);)B(b);return a};Bc.prototype.g=function(){return F(new E)};var Dc=function(){};var W=function(a){J(this,a,null,V)};v(W,H);var V=[[1,2,4,5,6,7,8]];W.prototype.u=function(){return I(this,V[0])};W.prototype.g=function(){var a=new E;var b=N(this,sc,1);null!=b&&G(a,1,b,uc);b=N(this,yc,2);null!=b&&G(a,2,b,Ac);b=N(this,Bc,4);null!=b&&G(a,4,b,Dc);b=this.hb();null!=b&&G(a,5,b,Ib);b=N(this,oc,6);null!=b&&G(a,6,b,qc);b=N(this,vc,7);null!=b&&G(a,7,b,xc);b=N(this,lc,8);null!=b&&G(a,8,b,nc);b=K(this,3);null!=b&&a.cc(3,b);return F(a)};W.prototype.hb=function(){return N(this,Gb,5)};
W.prototype.ob=function(a){Q(this,5,V[0],a)};var X=function(a,b){return M(a,3,b)};var Ec;function Y(a,b){var c={};a=(c.protoMessage=Array.from(a.g()),c);b(a)}function Fc(a){var b,c,d;t(function(e){switch(e.i){case 1:return b=new W,c=new sc,e.ea=2,r(e,Ua(),4);case 4:d=e.na;d.hc.forEach(function(g,h){mb(c).push(ob((new P).ma(h),g))});M(c,2,d.rc);X(b,1);ha(e,3);break;case 2:ia(e),X(b,2);case 3:Q(b,1,V[0],c),Y(b,a),e.i=0}})}
function Gc(a){var b;t(function(c){switch(c.i){case 1:return b=new W,c.ea=2,r(c,Ja(),4);case 4:X(b,1);ha(c,3);break;case 2:ia(c),X(b,2);case 3:Y(b,a),c.i=0}})}function Hc(a,b){var c;t(function(d){if(1==d.i){c=new W;if(!K(a,1))return Y(X(c,2),b),d.return();d.ea=2;return r(d,Ta(K(a,1)||""),4)}if(2!=d.i)return Y(X(c,1),b),ha(d,0);ia(d);Y(X(c,2),b);d.i=0})}
function Ic(a,b,c,d){Jc(c,b,function(e){try{for(var g=new y(e.protoMessage),h=new W;A(g)&&!z(g);)switch(g.j){case 1:var f=new sc;C(g,f,tc);Q(h,1,V[0],f);break;case 2:f=new yc;C(g,f,zc);Q(h,2,V[0],f);break;case 4:f=new Bc;C(g,f,Cc);Q(h,4,V[0],f);break;case 5:f=new Gb;C(g,f,Hb);h.ob(f);break;case 6:f=new oc;C(g,f,pc);Q(h,6,V[0],f);break;case 7:f=new vc;C(g,f,wc);Q(h,7,V[0],f);break;case 8:f=new lc;C(g,f,mc);Q(h,8,V[0],f);break;case 3:f=g.xb();X(h,f);break;default:B(g)}}catch(k){return}1===K(h,3)?(e=
Va.get(a.getToken()||""))&&e.tabId===c&&Va.delete(a.getToken()||""):d(e)})}function Jc(a,b,c){chrome.tabs.sendMessage(a,b,function(d){c(d)})}function Kc(a,b){t(function(c){switch(a.u()){case 3:Gc(b);break;default:a.u(),Y(X(new W,2),b)}c.i=0})}
function Lc(a,b,c){try{for(var d=new y(a.protoMessage),e=new ac;A(d)&&!z(d);)switch(d.j){case 1:var g=new Jb;C(d,g,Kb);Q(e,1,U[0],g);break;case 2:g=new T;C(d,g,Pb);Q(e,2,U[0],g);break;case 3:g=new Yb;C(d,g,Zb);Q(e,3,U[0],g);break;case 4:g=new Gb;C(d,g,Hb);e.ob(g);break;case 6:g=new Db;C(d,g,Eb);Q(e,6,U[0],g);break;case 7:g=new Mb;C(d,g,Nb);Q(e,7,U[0],g);break;case 8:g=new R;C(d,g,Bb);Q(e,8,U[0],g);break;case 5:g=d.fa();M(e,5,g);break;default:B(d)}var h=e}catch(f){return Y(X(new W,2),c),!1}if(b.tab){if(6===
h.u())return Y(X(new W,2),c),!1;Wa();if(void 0===b.tab.id)return Y(X(new W,2),c),!1;b=b.tab.id;if(4===h.u())Ic(h,a,b,c);else if((a=Va.get(h.getToken()||""))&&a.tabId===b)if(N(h,T,2)&&K(N(h,T,2),1)!==a.domain)Y(X(new W,2),c);else switch(h.u()){case 2:Hc(N(h,T,2)||new T,c);break;default:h.u(),Y(X(new W,2),c)}else Y(X(new W,2),c)}else{if(!Ec||b.url!==Ec)return Y(X(new W,2),c),!1;a=h;switch(a.u()){case 1:Fc(c);break;case 2:Hc(N(a,T,2)||new T,c);break;case 8:Kc(N(a,R,8)||new R,c);break;default:a.u(),Y(X(new W,
2),c)}}return!0};var Mc=function(){this.yb=ua()},Nc=null;Mc.prototype.set=function(a){this.yb=a};Mc.prototype.reset=function(){this.set(ua())};Mc.prototype.get=function(){return this.yb};var Oc=function(a){this.wc=a||"";Nc||(Nc=new Mc);this.fd=Nc};n=Oc.prototype;n.qb=!0;n.ac=!0;n.dd=!0;n.cd=!0;n.bc=!1;n.ed=!1;
var Pc=function(a){a=new Date(a.pc());return Z(a.getFullYear()-2E3)+Z(a.getMonth()+1)+Z(a.getDate())+" "+Z(a.getHours())+":"+Z(a.getMinutes())+":"+Z(a.getSeconds())+"."+Z(Math.floor(a.getMilliseconds()/10))},Z=function(a){return 10>a?"0"+a:String(a)},Qc=function(a,b){a=(a.pc()-b)/1E3;b=a.toFixed(3);var c=0;if(1>a)c=2;else for(;100>a;)c++,a*=10;for(;0<c--;)b=" "+b;return b},Rc=function(a){Oc.call(this,a)};v(Rc,Oc);
var Sc=function(a,b){var c=[];c.push(a.wc," ");a.ac&&c.push("[",Pc(b),"] ");a.dd&&c.push("[",Qc(b,a.fd.get()),"s] ");a.cd&&c.push("[",b.oc(),"] ");a.ed&&c.push("[",Ea.name,"] ");c.push(b.getMessage());a.bc&&(b=b.nc())&&c.push("\n",b instanceof Error?b.message:b.toString());a.qb&&c.push("\n");return c.join("")};var Tc=function(){ta(this.ec,this);this.za=new Rc;this.za.ac=!1;this.za.bc=!1;this.vb=this.za.qb=!1;this.mc={}};Tc.prototype.ec=function(a){function b(g){if(g){if(g.value>=Fa.value)return"error";if(g.value>=Ga.value)return"warn";if(g.value>=Ha.value)return"log"}return"debug"}if(!this.mc[a.oc()]){var c=Sc(this.za,a),d=Uc;if(d){var e=b(Ea);Vc(d,e,c,a.nc())}}};var Uc=qa.console,Vc=function(a,b,c,d){if(a[b])a[b](c,d||"");else a.log(c,d||"")};Wc();
function Wc(){var a,b;t(function(c){switch(c.i){case 1:a=new Tc,1!=a.vb&&(Ia||(Ia=new Ca),a.vb=!0),chrome.runtime.onInstalled.addListener(function(){var d="turndown.html";d instanceof w||(d="object"==typeof d&&d.sc?d.qc():String(d),Ba.test(d)||(d="about:invalid#zClosurez"),d=new w(d,Aa));qa.open(d instanceof w&&d.constructor===w?d.wb:"type_error:SafeUrl","",void 0,void 0)}),b=Xc(0);case 2:return b?r(c,new Promise(function(d){chrome.browserAction.setIcon({path:"grey_disabled_shield_icon.svg"},d)}),
5):r(c,Xc(5E3),4);case 4:b=c.na;c.i=2;break;case 5:Ec=chrome.runtime.getURL("popup.html"),chrome.runtime.onMessage.addListener(Lc),c.i=0}})}function Xc(a){return t(function(b){if(1==b.i)return b.ea=2,r(b,(new Promise(function(c){setTimeout(c,a)})).then(function(){return Qa()}),4);if(2!=b.i)return b.return(!0);ia(b);return b.return(!1)})};}).call(this);