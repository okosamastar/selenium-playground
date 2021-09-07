(function(){/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
'use strict';var n="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;a[b]=c.value;return a},aa=function(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");},ba=aa(this),p=function(a,b){if(b)a:{var c=ba;a=a.split(".");for(var d=
0;d<a.length-1;d++){var e=a[d];if(!(e in c))break a;c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&n(c,a,{configurable:!0,writable:!0,value:b})}};
p("String.prototype.endsWith",function(a){return a?a:function(b,c){if(null==this)throw new TypeError("The 'this' value for String.prototype.endsWith must not be null or undefined");if(b instanceof RegExp)throw new TypeError("First argument to String.prototype.endsWith must not be a regular expression");var d=this+"";b+="";void 0===c&&(c=d.length);c=Math.max(0,Math.min(c|0,d.length));for(var e=b.length;0<e&&0<c;)if(d[--c]!=b[--e])return!1;return 0>=e}});
var ca=function(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}};p("Symbol",function(a){if(a)return a;var b=function(e,f){this.qa=e;n(this,"description",{configurable:!0,writable:!0,value:f})};b.prototype.toString=function(){return this.qa};var c=0,d=function(e){if(this instanceof d)throw new TypeError("Symbol is not a constructor");return new b("jscomp_symbol_"+(e||"")+"_"+c++,e)};return d});
p("Symbol.iterator",function(a){if(a)return a;a=Symbol("Symbol.iterator");for(var b="Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "),c=0;c<b.length;c++){var d=ba[b[c]];"function"===typeof d&&"function"!=typeof d.prototype[a]&&n(d.prototype,a,{configurable:!0,writable:!0,value:function(){return da(ca(this))}})}return a});
var da=function(a){a={next:a};a[Symbol.iterator]=function(){return this};return a},ea=function(a,b){a instanceof String&&(a+="");var c=0,d=!1,e={next:function(){if(!d&&c<a.length){var f=c++;return{value:b(f,a[f]),done:!1}}d=!0;return{done:!0,value:void 0}}};e[Symbol.iterator]=function(){return e};return e};p("Array.prototype.keys",function(a){return a?a:function(){return ea(this,function(b){return b})}});
p("Array.from",function(a){return a?a:function(b,c,d){c=null!=c?c:function(h){return h};var e=[],f="undefined"!=typeof Symbol&&Symbol.iterator&&b[Symbol.iterator];if("function"==typeof f){b=f.call(b);for(var k=0;!(f=b.next()).done;)e.push(c.call(d,f.value,k++))}else for(f=b.length,k=0;k<f;k++)e.push(c.call(d,b[k],k));return e}});var q=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)};
p("WeakMap",function(a){function b(){}function c(g){var l=typeof g;return"object"===l&&null!==g||"function"===l}function d(g){if(!q(g,f)){var l=new b;n(g,f,{value:l})}}function e(g){var l=Object[g];l&&(Object[g]=function(m){if(m instanceof b)return m;Object.isExtensible(m)&&d(m);return l(m)})}if(function(){if(!a||!Object.seal)return!1;try{var g=Object.seal({}),l=Object.seal({}),m=new a([[g,2],[l,3]]);if(2!=m.get(g)||3!=m.get(l))return!1;m.delete(g);m.set(l,4);return!m.has(g)&&4==m.get(l)}catch(ja){return!1}}())return a;
var f="$jscomp_hidden_"+Math.random();e("freeze");e("preventExtensions");e("seal");var k=0,h=function(g){this.i=(k+=Math.random()+1).toString();if(g){var l="undefined"!=typeof Symbol&&Symbol.iterator&&g[Symbol.iterator];for(g=l?l.call(g):{next:ca(g)};!(l=g.next()).done;)l=l.value,this.set(l[0],l[1])}};h.prototype.set=function(g,l){if(!c(g))throw Error("Invalid WeakMap key");d(g);if(!q(g,f))throw Error("WeakMap key fail: "+g);g[f][this.i]=l;return this};h.prototype.get=function(g){return c(g)&&q(g,
f)?g[f][this.i]:void 0};h.prototype.has=function(g){return c(g)&&q(g,f)&&q(g[f],this.i)};h.prototype.delete=function(g){return c(g)&&q(g,f)&&q(g[f],this.i)?delete g[f][this.i]:!1};return h});
var t=this||self,fa=function(a,b,c){return a.call.apply(a.bind,arguments)},ha=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}},ia=function(a,b,c){ia=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?fa:ha;return ia.apply(null,arguments)},u=function(a,
b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}},ka=Date.now,la=function(a,b){function c(){}c.prototype=b.prototype;a.prototype=new c;a.prototype.constructor=a},ma=function(a){return a};var v=function(a){if(Error.captureStackTrace)Error.captureStackTrace(this,v);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))};la(v,Error);v.prototype.name="CustomError";var w=function(a,b){a=a.split("%s");for(var c="",d=a.length-1,e=0;e<d;e++)c+=a[e]+(e<b.length?b[e]:"%s");v.call(this,c+a[d])};la(w,v);w.prototype.name="AssertionError";var na=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if("string"===typeof a)return"string"!==typeof b||1!=b.length?-1:a.indexOf(b,0);for(var c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},x=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e="string"===typeof a?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},oa=Array.prototype.filter?function(a,b){return Array.prototype.filter.call(a,
b,void 0)}:function(a,b){for(var c=a.length,d=[],e=0,f="string"===typeof a?a.split(""):a,k=0;k<c;k++)if(k in f){var h=f[k];b.call(void 0,h,k,a)&&(d[e++]=h)}return d},pa=Array.prototype.map?function(a,b,c){return Array.prototype.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f="string"===typeof a?a.split(""):a,k=0;k<d;k++)k in f&&(e[k]=b.call(c,f[k],k,a));return e},qa=function(a){return Array.prototype.concat.apply([],arguments)},ra=function(a){var b=a.length;if(0<b){for(var c=Array(b),
d=0;d<b;d++)c[d]=a[d];return c}return[]},sa=function(a,b){return qa.apply([],pa(a,b,void 0))};var y=String.prototype.trim?function(a){return a.trim()}:function(a){return/^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]},z=function(a,b){return-1!=a.indexOf(b)},ta=function(a,b){return a<b?-1:a>b?1:0};var A;a:{var ua=t.navigator;if(ua){var va=ua.userAgent;if(va){A=va;break a}}A=""};var wa=function(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b},B=function(a){var b={},c;for(c in a)b[c]=a[c];return b};var xa=function(){return null};var ya;var C=function(a,b){this.oa=a===za&&b||"";this.ra=Aa};C.prototype.j=!0;C.prototype.f=function(){return this.oa};var Aa={},za={};var D=function(a,b){this.ka=b===Ba?a:""};D.prototype.j=!0;D.prototype.f=function(){return this.ka.toString()};
var E=function(a){return a instanceof D&&a.constructor===D?a.ka:"type_error:SafeUrl"},Ca=/^(?:audio\/(?:3gpp2|3gpp|aac|L16|midi|mp3|mp4|mpeg|oga|ogg|opus|x-m4a|x-matroska|x-wav|wav|webm)|font\/\w+|image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp|x-icon)|text\/csv|video\/(?:mpeg|mp4|ogg|webm|quicktime|x-matroska))(?:;\w+=(?:\w+|"[\w;,= ]+"))*$/i,Fa=/^data:(.*);base64,[a-z0-9+\/]+=*$/i,Ga=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i,Ia=function(a){if(!(a instanceof D))if(a="object"==typeof a&&a.j?a.f():
String(a),Ga.test(a))a=new D(a,Ba);else{a=String(a);a=a.replace(/(%0A|%0D)/g,"");var b=a.match(Fa);a=b&&Ca.test(b[1])?new D(a,Ba):null}return a||Ha},Ba={},Ha=new D("about:invalid#zClosurez",Ba);var G=function(a,b){this.ja=b===Ja?a:""};G.prototype.j=!0;G.prototype.f=function(){return this.ja};
var Ja={},Ka=new G("",Ja),Ra=function(a){if(a instanceof D)return'url("'+E(a).replace(/</g,"%3c").replace(/[\\"]/g,"\\$&")+'")';if(a instanceof C)a=a instanceof C&&a.constructor===C&&a.ra===Aa?a.oa:"type_error:Const";else{a=String(a);var b=a.replace(La,"$1").replace(La,"$1").replace(Ma,"url");if(Na.test(b)){if(b=!Oa.test(a)){for(var c=b=!0,d=0;d<a.length;d++){var e=a.charAt(d);"'"==e&&c?b=!b:'"'==e&&b&&(c=!c)}b=b&&c&&Pa(a)}a=b?Qa(a):"zClosurez"}else a="zClosurez"}if(/[{;}]/.test(a))throw new w("Value does not allow [{;}], got: %s.",
[a]);return a},Pa=function(a){for(var b=!0,c=/^[-_a-zA-Z0-9]$/,d=0;d<a.length;d++){var e=a.charAt(d);if("]"==e){if(b)return!1;b=!0}else if("["==e){if(!b)return!1;b=!1}else if(!b&&!c.test(e))return!1}return b},Na=/^[-,."'%_!# a-zA-Z0-9\[\]]+$/,Ma=/\b(url\([ \t\n]*)('[ -&(-\[\]-~]*'|"[ !#-\[\]-~]*"|[!#-&*-\[\]-~]*)([ \t\n]*\))/g,La=/\b(calc|cubic-bezier|fit-content|hsl|hsla|linear-gradient|matrix|minmax|repeat|rgb|rgba|(rotate|scale|translate)(X|Y|Z|3d)?)\([-+*/0-9a-z.%\[\], ]+\)/g,Oa=/\/\*/,Qa=function(a){return a.replace(Ma,
function(b,c,d,e){var f="";d=d.replace(/^(['"])(.*)\1$/,function(k,h,g){f=h;return g});b=Ia(d).f();return c+f+b+f+e})};var Sa={},H=function(a,b){this.ia=b===Sa?a:"";this.j=!0},Ta=function(a,b){if(z(a,"<"))throw Error("Selector does not allow '<', got: "+a);var c=a.replace(/('|")((?!\1)[^\r\n\f\\]|\\[\s\S])*\1/g,"");if(!/^[-_a-zA-Z0-9#.:* ,>+~[\]()=^$|]+$/.test(c))throw Error("Selector allows only [-_a-zA-Z0-9#.:* ,>+~[\\]()=^$|] and strings, got: "+a);a:{for(var d={"(":")","[":"]"},e=[],f=0;f<c.length;f++){var k=c[f];if(d[k])e.push(d[k]);else{b:{var h=void 0;for(h in d)if(d[h]==k){h=!0;break b}h=!1}if(h&&e.pop()!=
k){c=!1;break a}}}c=0==e.length}if(!c)throw Error("() and [] in selector must be balanced, got: "+a);if(!(b instanceof G)){c="";for(var g in b)if(Object.prototype.hasOwnProperty.call(b,g)){if(!/^[-_a-zA-Z0-9]+$/.test(g))throw Error("Name allows only [-_a-zA-Z0-9], got: "+g);d=b[g];null!=d&&(d=Array.isArray(d)?pa(d,Ra).join(" "):Ra(d),c+=g+":"+d+";")}b=c?new G(c,Ja):Ka}a=a+"{"+(b instanceof G&&b.constructor===G?b.ja:"type_error:SafeStyle").replace(/</g,"\\3C ")+"}";return new H(a,Sa)},Va=function(a){var b=
"",c=function(d){Array.isArray(d)?x(d,c):b+=Ua(d)};x(arguments,c);return new H(b,Sa)};H.prototype.f=function(){return this.ia};var Ua=function(a){return a instanceof H&&a.constructor===H?a.ia:"type_error:SafeStyleSheet"},Wa=new H("",Sa);var I=function(a,b,c){this.ha=c===Xa?a:""};I.prototype.j=!0;I.prototype.f=function(){return this.ha.toString()};var Ya=function(a){return a instanceof I&&a.constructor===I?a.ha:"type_error:SafeHtml"},Xa={},Za=new I(t.trustedTypes&&t.trustedTypes.emptyHTML||"",0,Xa);var $a=function(a){if(void 0===ya){var b=null;var c=t.trustedTypes;if(c&&c.createPolicy)try{b=c.createPolicy("goog#html",{createHTML:ma,createScript:ma,createScriptURL:ma})}catch(d){t.console&&t.console.error(d.message)}ya=b}a=(b=ya)?b.createHTML(a):a;return new I(a,null,Xa)};var ab=function(a){var b=!1,c;return function(){b||(c=a(),b=!0);return c}}(function(){var a=document.createElement("div"),b=document.createElement("div");b.appendChild(document.createElement("div"));a.appendChild(b);b=a.firstChild.firstChild;a.innerHTML=Ya(Za);return!b.parentElement}),bb=function(a,b){if(ab())for(;a.lastChild;)a.removeChild(a.lastChild);a.innerHTML=Ya(b)};var db=function(a,b){var c=cb;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)};var eb=z(A,"Opera"),J=z(A,"Trident")||z(A,"MSIE"),fb=z(A,"Edge"),gb=z(A,"Gecko")&&!(z(A.toLowerCase(),"webkit")&&!z(A,"Edge"))&&!(z(A,"Trident")||z(A,"MSIE"))&&!z(A,"Edge"),hb=z(A.toLowerCase(),"webkit")&&!z(A,"Edge"),ib=function(){var a=t.document;return a?a.documentMode:void 0},jb;
a:{var kb="",lb=function(){var a=A;if(gb)return/rv:([^\);]+)(\)|;)/.exec(a);if(fb)return/Edge\/([\d\.]+)/.exec(a);if(J)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(hb)return/WebKit\/(\S+)/.exec(a);if(eb)return/(?:Version)[ \/]?(\S+)/.exec(a)}();lb&&(kb=lb?lb[1]:"");if(J){var mb=ib();if(null!=mb&&mb>parseFloat(kb)){jb=String(mb);break a}}jb=kb}
var ob=jb,cb={},pb=function(a){return db(a,function(){for(var b=0,c=y(String(ob)).split("."),d=y(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var k=c[f]||"",h=d[f]||"";do{k=/(\d*)(\D*)(.*)/.exec(k)||["","","",""];h=/(\d*)(\D*)(.*)/.exec(h)||["","","",""];if(0==k[0].length&&0==h[0].length)break;b=ta(0==k[1].length?0:parseInt(k[1],10),0==h[1].length?0:parseInt(h[1],10))||ta(0==k[2].length,0==h[2].length)||ta(k[2],h[2]);k=k[3];h=h[3]}while(0==b)}return 0<=b})},qb;
if(t.document&&J){var rb=ib();qb=rb?rb:parseInt(ob,10)||void 0}else qb=void 0;var sb=qb;var K=function(a){var b=document;a=String(a);"application/xhtml+xml"===b.contentType&&(a=a.toLowerCase());return b.createElement(a)},tb=function(a){return a&&a.parentNode?a.parentNode.removeChild(a):null};function ub(){var a=K("object");a.setAttribute("type","image/svg+xml");a.setAttribute("data","blue_shield.svg");a.setAttribute("width",70);a.setAttribute("height",70);return a};var L={};
function vb(a){if(J&&!pb(9))return[0,0,0,0];var b=L.hasOwnProperty(a)?L[a]:null;if(b)return b;65536<Object.keys(L).length&&(L={});var c=[0,0,0,0];b=wb(a,/\\[0-9A-Fa-f]{6}\s?/g);b=wb(b,/\\[0-9A-Fa-f]{1,5}\s/g);b=wb(b,/\\./g);b=b.replace(/:not\(([^\)]*)\)/g,"     $1 ");b=b.replace(/{[^]*/gm,"");b=M(b,c,/(\[[^\]]+\])/g,2);b=M(b,c,/(#[^\#\s\+>~\.\[:]+)/g,1);b=M(b,c,/(\.[^\s\+>~\.\[:]+)/g,2);b=M(b,c,/(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi,3);b=M(b,c,/(:[\w-]+\([^\)]*\))/gi,2);
b=M(b,c,/(:[^\s\+>~\.\[:]+)/g,2);b=b.replace(/[\*\s\+>~]/g," ");b=b.replace(/[#\.]/g," ");M(b,c,/([^\s\+>~\.\[:]+)/g,3);b=c;return L[a]=b}function M(a,b,c,d){return a.replace(c,function(e){b[d]+=1;return Array(e.length+1).join(" ")})}function wb(a,b){return a.replace(b,function(c){return Array(c.length+1).join("A")})};var xb={rgb:!0,rgba:!0,alpha:!0,rect:!0,image:!0,"linear-gradient":!0,"radial-gradient":!0,"repeating-linear-gradient":!0,"repeating-radial-gradient":!0,"cubic-bezier":!0,matrix:!0,perspective:!0,rotate:!0,rotate3d:!0,rotatex:!0,rotatey:!0,steps:!0,rotatez:!0,scale:!0,scale3d:!0,scalex:!0,scaley:!0,scalez:!0,skew:!0,skewx:!0,skewy:!0,translate:!0,translate3d:!0,translatex:!0,translatey:!0,translatez:!0},yb=/[\n\f\r"'()*<>]/g,zb={"\n":"%0a","\f":"%0c","\r":"%0d",'"':"%22","'":"%27","(":"%28",")":"%29",
"*":"%2a","<":"%3c",">":"%3e"};function Ab(a){return zb[a]}
var Bb=function(a,b,c){b=y(b);if(""==b)return null;var d=String(b.substr(0,4)).toLowerCase();if(0==("url("<d?-1:"url("==d?0:1)){if(!b.endsWith(")")||1<(b?b.split("(").length-1:0)||1<(b?b.split(")").length-1:0)||!c)a=null;else{a:for(b=b.substring(4,b.length-1),d=0;2>d;d++){var e="\"'".charAt(d);if(b.charAt(0)==e&&b.charAt(b.length-1)==e){b=b.substring(1,b.length-1);break a}}a=c?(a=c(b,a))&&"about:invalid#zClosurez"!=E(a)?'url("'+E(a).replace(yb,Ab)+'")':null:null}return a}if(0<b.indexOf("(")){if(/"|'/.test(b))return null;
for(a=/([\-\w]+)\(/g;c=a.exec(b);)if(!(c[1].toLowerCase()in xb))return null}return b};function N(a,b){a=t[a];return a&&a.prototype?(b=Object.getOwnPropertyDescriptor(a.prototype,b))&&b.get||null:null}function O(a,b){return(a=t[a])&&a.prototype&&a.prototype[b]||null}
var Cb=N("Element","attributes")||N("Node","attributes"),Db=O("Element","hasAttribute"),Eb=O("Element","getAttribute"),Fb=O("Element","setAttribute"),Gb=O("Element","removeAttribute"),Hb=O("Element","getElementsByTagName"),Ib=O("Element","matches")||O("Element","msMatchesSelector"),Jb=N("Node","nodeName"),Kb=N("Node","nodeType"),Lb=N("Node","parentNode"),Mb=N("HTMLElement","style")||N("Element","style"),Nb=N("HTMLStyleElement","sheet"),Ob=O("CSSStyleDeclaration","getPropertyValue"),Pb=O("CSSStyleDeclaration",
"setProperty");function P(a,b,c,d){if(a)return a.apply(b);a=b[c];if(!d(a))throw Error("Clobbering detected");return a}function Q(a,b,c,d){if(a)return a.apply(b,d);if(J&&10>document.documentMode){if(!b[c].call)throw Error("IE Clobbering detected");}else if("function"!=typeof b[c])throw Error("Clobbering detected");return b[c].apply(b,d)}function Qb(a){return P(Cb,a,"attributes",function(b){return b instanceof NamedNodeMap})}
function Rb(a,b,c){try{Q(Fb,a,"setAttribute",[b,c])}catch(d){if(-1==d.message.indexOf("A security problem occurred"))throw d;}}function Sb(a){return P(Mb,a,"style",function(b){return b instanceof CSSStyleDeclaration})}function Tb(a){return P(Nb,a,"sheet",function(b){return b instanceof CSSStyleSheet})}function R(a){return P(Jb,a,"nodeName",function(b){return"string"==typeof b})}function Ub(a){return P(Kb,a,"nodeType",function(b){return"number"==typeof b})}
function S(a){return P(Lb,a,"parentNode",function(b){return!(b&&"string"==typeof b.name&&b.name&&"parentnode"==b.name.toLowerCase())})}function Vb(a,b){return Q(Ob,a,a.getPropertyValue?"getPropertyValue":"getAttribute",[b])||""}function Wb(a,b,c){Q(Pb,a,a.setProperty?"setProperty":"setAttribute",[b,c])};var Xb=J&&10>document.documentMode?null:/\s*([^\s'",]+[^'",]*(('([^'\r\n\f\\]|\\[^])*')|("([^"\r\n\f\\]|\\[^])*")|[^'",])*)/g,Yb={"-webkit-border-horizontal-spacing":!0,"-webkit-border-vertical-spacing":!0},ac=function(a,b,c){var d=[];a=Zb(ra(a.cssRules));x(a,function(e){if(b&&!/[a-zA-Z][\w-:\.]*/.test(b))throw Error("Invalid container id");if(!(b&&J&&10==document.documentMode&&/\\['"]/.test(e.selectorText))){var f=b?e.selectorText.replace(Xb,"#"+b+" $1"):e.selectorText;d.push(Ta(f,$b(e.style,c)))}});
return Va(d)},Zb=function(a){return oa(a,function(b){return b instanceof CSSStyleRule||b.type==CSSRule.STYLE_RULE})},cc=function(a,b,c){a=bc("<style>"+a+"</style>");return null==a||null==a.sheet?Wa:ac(a.sheet,void 0!=b?b:null,c)},bc=function(a){if(J&&!pb(10)||"function"!=typeof t.DOMParser)return null;a=$a("<html><head></head><body>"+a+"</body></html>");return(new DOMParser).parseFromString(Ya(a),"text/html").body.children[0]},$b=function(a,b){if(!a)return Ka;var c=document.createElement("div").style,
d=dc(a);x(d,function(e){var f=hb&&e in Yb?e:e.replace(/^-(?:apple|css|epub|khtml|moz|mso?|o|rim|wap|webkit|xv)-(?=[a-z])/i,"");0!=f.lastIndexOf("--",0)&&0!=f.lastIndexOf("var",0)&&(e=Vb(a,e),e=Bb(f,e,b),null!=e&&Wb(c,f,e))});return new G(c.cssText||"",Ja)},fc=function(a){var b=Array.from(Q(Hb,a,"getElementsByTagName",["STYLE"])),c=sa(b,function(e){return ra(Tb(e).cssRules)});c=Zb(c);c.sort(function(e,f){e=vb(e.selectorText);a:{f=vb(f.selectorText);for(var k=Math.min(e.length,f.length),h=0;h<k;h++){var g=
e[h];var l=f[h];g=g>l?1:g<l?-1:0;if(0!=g){e=g;break a}}e=e.length;f=f.length;e=e>f?1:e<f?-1:0}return-e});a=document.createTreeWalker(a,NodeFilter.SHOW_ELEMENT,null,!1);for(var d;d=a.nextNode();)x(c,function(e){Q(Ib,d,d.matches?"matches":"msMatchesSelector",[e.selectorText])&&e.style&&ec(d,e.style)});x(b,tb)},ec=function(a,b){var c=dc(a.style),d=dc(b);x(d,function(e){if(!(0<=c.indexOf(e))){var f=Vb(b,e);Wb(a.style,e,f)}})},dc=function(a){var b=typeof a;b="object"!=b?b:a?Array.isArray(a)?"array":b:
"null";"array"==b||"object"==b&&"number"==typeof a.length?a=ra(a):(a=wa(a),b=na(a,"cssText"),0<=b&&Array.prototype.splice.call(a,b,1));return a};var gc={"* ARIA-CHECKED":!0,"* ARIA-COLCOUNT":!0,"* ARIA-COLINDEX":!0,"* ARIA-CONTROLS":!0,"* ARIA-DESCRIBEDBY":!0,"* ARIA-DISABLED":!0,"* ARIA-EXPANDED":!0,"* ARIA-GOOG-EDITABLE":!0,"* ARIA-HASPOPUP":!0,"* ARIA-HIDDEN":!0,"* ARIA-LABEL":!0,"* ARIA-LABELLEDBY":!0,"* ARIA-MULTILINE":!0,"* ARIA-MULTISELECTABLE":!0,"* ARIA-ORIENTATION":!0,"* ARIA-PLACEHOLDER":!0,"* ARIA-READONLY":!0,"* ARIA-REQUIRED":!0,"* ARIA-ROLEDESCRIPTION":!0,"* ARIA-ROWCOUNT":!0,"* ARIA-ROWINDEX":!0,"* ARIA-SELECTED":!0,"* ABBR":!0,
"* ACCEPT":!0,"* ACCESSKEY":!0,"* ALIGN":!0,"* ALT":!0,"* AUTOCOMPLETE":!0,"* AXIS":!0,"* BGCOLOR":!0,"* BORDER":!0,"* CELLPADDING":!0,"* CELLSPACING":!0,"* CHAROFF":!0,"* CHAR":!0,"* CHECKED":!0,"* CLEAR":!0,"* COLOR":!0,"* COLSPAN":!0,"* COLS":!0,"* COMPACT":!0,"* COORDS":!0,"* DATETIME":!0,"* DIR":!0,"* DISABLED":!0,"* ENCTYPE":!0,"* FACE":!0,"* FRAME":!0,"* HEIGHT":!0,"* HREFLANG":!0,"* HSPACE":!0,"* ISMAP":!0,"* LABEL":!0,"* LANG":!0,"* MAX":!0,"* MAXLENGTH":!0,"* METHOD":!0,"* MULTIPLE":!0,
"* NOHREF":!0,"* NOSHADE":!0,"* NOWRAP":!0,"* OPEN":!0,"* READONLY":!0,"* REQUIRED":!0,"* REL":!0,"* REV":!0,"* ROLE":!0,"* ROWSPAN":!0,"* ROWS":!0,"* RULES":!0,"* SCOPE":!0,"* SELECTED":!0,"* SHAPE":!0,"* SIZE":!0,"* SPAN":!0,"* START":!0,"* SUMMARY":!0,"* TABINDEX":!0,"* TITLE":!0,"* TYPE":!0,"* VALIGN":!0,"* VALUE":!0,"* VSPACE":!0,"* WIDTH":!0},hc={"* USEMAP":!0,"* ACTION":!0,"* CITE":!0,"* HREF":!0,"* LONGDESC":!0,"* SRC":!0,"LINK HREF":!0,"* FOR":!0,"* HEADERS":!0,"* NAME":!0,"A TARGET":!0,
"* CLASS":!0,"* ID":!0,"* STYLE":!0};var ic="undefined"!=typeof WeakMap&&-1!=WeakMap.toString().indexOf("[native code]"),jc=0,kc=function(){this.ca=[];this.v=[];this.c="data-elementweakmap-index-"+jc++};kc.prototype.set=function(a,b){if(Q(Db,a,"hasAttribute",[this.c])){var c=parseInt(Q(Eb,a,"getAttribute",[this.c])||null,10);this.v[c]=b}else c=this.v.push(b)-1,Rb(a,this.c,c.toString()),this.ca.push(a);return this};
kc.prototype.get=function(a){if(Q(Db,a,"hasAttribute",[this.c]))return a=parseInt(Q(Eb,a,"getAttribute",[this.c])||null,10),this.v[a]};kc.prototype.clear=function(){this.ca.forEach(function(a){Q(Gb,a,"removeAttribute",[this.c])},this);this.ca=[];this.v=[]};var T=function(){this.aa=this.bb=null},U=function(a,b){this.name=a;this.value=b};U.prototype.toString=function(){return this.name};var lc=new U("OFF",Infinity),mc=new U("SEVERE",1E3),nc=new U("WARNING",900),oc=new U("CONFIG",700);T.prototype.getParent=function(){return this.bb};T.prototype.getChildren=function(){this.aa||(this.aa={});return this.aa};T.prototype.log=function(){};T.prototype.info=function(){};var pc=null;var qc;(qc=!J)||(qc=10<=Number(sb));var rc=qc,sc=!J||null==document.documentMode,tc=function(){};var uc={APPLET:!0,AUDIO:!0,BASE:!0,BGSOUND:!0,EMBED:!0,FORM:!0,IFRAME:!0,ISINDEX:!0,KEYGEN:!0,LAYER:!0,LINK:!0,META:!0,OBJECT:!0,SCRIPT:!0,SVG:!0,STYLE:!0,TEMPLATE:!0,VIDEO:!0};var vc={A:!0,ABBR:!0,ACRONYM:!0,ADDRESS:!0,AREA:!0,ARTICLE:!0,ASIDE:!0,B:!0,BDI:!0,BDO:!0,BIG:!0,BLOCKQUOTE:!0,BR:!0,BUTTON:!0,CAPTION:!0,CENTER:!0,CITE:!0,CODE:!0,COL:!0,COLGROUP:!0,DATA:!0,DATALIST:!0,DD:!0,DEL:!0,DETAILS:!0,DFN:!0,DIALOG:!0,DIR:!0,DIV:!0,DL:!0,DT:!0,EM:!0,FIELDSET:!0,FIGCAPTION:!0,FIGURE:!0,FONT:!0,FOOTER:!0,FORM:!0,H1:!0,H2:!0,H3:!0,H4:!0,H5:!0,H6:!0,HEADER:!0,HGROUP:!0,HR:!0,I:!0,IMG:!0,INPUT:!0,INS:!0,KBD:!0,LABEL:!0,LEGEND:!0,LI:!0,MAIN:!0,MAP:!0,MARK:!0,MENU:!0,METER:!0,NAV:!0,
NOSCRIPT:!0,OL:!0,OPTGROUP:!0,OPTION:!0,OUTPUT:!0,P:!0,PRE:!0,PROGRESS:!0,Q:!0,S:!0,SAMP:!0,SECTION:!0,SELECT:!0,SMALL:!0,SOURCE:!0,SPAN:!0,STRIKE:!0,STRONG:!0,STYLE:!0,SUB:!0,SUMMARY:!0,SUP:!0,TABLE:!0,TBODY:!0,TD:!0,TEXTAREA:!0,TFOOT:!0,TH:!0,THEAD:!0,TIME:!0,TR:!0,TT:!0,U:!0,UL:!0,VAR:!0,WBR:!0};var wc={"ANNOTATION-XML":!0,"COLOR-PROFILE":!0,"FONT-FACE":!0,"FONT-FACE-SRC":!0,"FONT-FACE-URI":!0,"FONT-FACE-FORMAT":!0,"FONT-FACE-NAME":!0,"MISSING-GLYPH":!0},Ac=function(a){a=a||new xc;yc(a);this.h=B(a.a);this.m=B(a.m);this.g=B(a.g);this.da=a.da;x(a.va,function(b){if(0!=b.lastIndexOf("data-",0))throw new w('Only "data-" attributes allowed, got: %s.',[b]);if(0==b.lastIndexOf("data-sanitizer-",0))throw new w('Attributes with "%s" prefix are not allowed, got: %s.',["data-sanitizer-",b]);this.h["* "+
b.toUpperCase()]=zc},this);x(a.ua,function(b){b=b.toUpperCase();if(!z(b,"-")||wc[b])throw new w("Only valid custom element tag names allowed, got: %s.",[b]);this.g[b]=!0},this);this.u=a.u;this.l=a.l;this.o=null;this.ba=a.ba};la(Ac,tc);
var Bc=function(a){return function(b,c){return(b=a(y(b),c))&&"about:invalid#zClosurez"!=E(b)?E(b):null}},xc=function(){this.a={};x([gc,hc],function(a){x(wa(a),function(b){this.a[b]=zc},this)},this);this.b={};this.va=[];this.ua=[];this.m=B(uc);this.g=B(vc);this.da=!1;this.jb=Ia;this.eb=this.pa=this.ab=this.u=xa;this.l=null;this.ga=this.ba=!1},Cc=function(a,b){return function(c,d,e,f){c=a(c,d,e,f);return null==c?null:b(c,d,e,f)}},V=function(a,b,c,d){a[c]&&!b[c]&&(a[c]=Cc(a[c],d))},yc=function(a){if(a.ga)throw Error("HtmlSanitizer.Builder.build() can only be used once.");
V(a.a,a.b,"* USEMAP",Dc);var b=Bc(a.jb);x(["* ACTION","* CITE","* HREF"],function(d){V(this.a,this.b,d,b)},a);var c=Bc(a.u);x(["* LONGDESC","* SRC","LINK HREF"],function(d){V(this.a,this.b,d,c)},a);x(["* FOR","* HEADERS","* NAME"],function(d){V(this.a,this.b,d,u(Ec,this.ab))},a);V(a.a,a.b,"A TARGET",u(Fc,["_blank","_self"]));V(a.a,a.b,"* CLASS",u(Gc,a.pa));V(a.a,a.b,"* ID",u(Hc,a.pa));V(a.a,a.b,"* STYLE",u(a.eb,c));a.ga=!0},Ic=function(a,b){a||(a="*");return(a+" "+b).toUpperCase()},zc=function(a){return y(a)},
Fc=function(a,b){b=y(b);return 0<=na(a,b.toLowerCase())?b:null},Dc=function(a){return(a=y(a))&&"#"==a.charAt(0)?a:null},Ec=function(a,b,c){return a(y(b),c)},Gc=function(a,b,c){b=b.split(/(?:\s+)/);for(var d=[],e=0;e<b.length;e++){var f=a(b[e],c);f&&d.push(f)}return 0==d.length?null:d.join(" ")},Hc=function(a,b,c){return a(y(b),c)};
Ac.prototype.createTextNode=function(a){var b=a.data;(a=S(a))&&"style"==R(a).toLowerCase()&&!("STYLE"in this.m)&&"STYLE"in this.g&&(b=Ua(cc(b,this.o,ia(function(c,d){return this.u(c,{kb:d})},this))));return document.createTextNode(b)};var Jc=function(){var a=chrome.i18n.getMessage("turndown_notice"),b=new xc;b=new Ac(b);var c=!("STYLE"in b.m)&&"STYLE"in b.g;c="*"==b.l&&c?"sanitizer-"+(Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^ka()).toString(36)):b.l;b.o=c;if(rc){c=a;if(rc){a=K("SPAN");b.o&&"*"==b.l&&(a.id=b.o);b.ba&&(c=bc("<div>"+c+"</div>"),fc(c),c=c.innerHTML);c=$a(c);var d=document.createElement("template");if(sc&&"content"in d)bb(d,c),d=d.content;else{var e=document.implementation.createHTMLDocument("x");
d=e.body;bb(e.body,c)}c=document.createTreeWalker(d,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,null,!1);for(d=ic?new WeakMap:new kc;e=c.nextNode();){c:{var f=b;var k=e;switch(Ub(k)){case 3:f=f.createTextNode(k);break c;case 1:if("TEMPLATE"==R(k).toUpperCase())f=null;else{var h=R(k).toUpperCase();if(h in f.m)var g=null;else f.g[h]?g=document.createElement(h):(g=K("SPAN"),f.da&&Rb(g,"data-sanitizer-original-tag",h.toLowerCase()));if(g){var l=g,m=Qb(k);if(null!=m)for(var ja=0;h=m[ja];ja++)if(h.specified){var r=
f;var X=k,Y=h,F=Y.name;if(0==F.lastIndexOf("data-sanitizer-",0))r=null;else{var nb=R(X);Y=Y.value;var Da={tagName:y(nb).toLowerCase(),attributeName:y(F).toLowerCase()},Ea={ta:void 0};"style"==Da.attributeName&&(Ea.ta=Sb(X));X=Ic(nb,F);X in r.h?(r=r.h[X],r=r(Y,Da,Ea)):(F=Ic(null,F),F in r.h?(r=r.h[F],r=r(Y,Da,Ea)):r=null)}null!==r&&Rb(l,h.name,r)}f=g}else f=null}break c;default:f=null}}if(f){if(1==Ub(f)&&d.set(e,f),e=S(e),k=!1,e)h=Ub(e),g=R(e).toLowerCase(),l=S(e),11!=h||l?"body"==g&&l&&(h=S(l))&&
!S(h)&&(k=!0):k=!0,h=null,k||!e?h=a:1==Ub(e)&&(h=d.get(e)),h.content&&(h=h.content),h.appendChild(f)}else for(f=e;e=f.firstChild;)f.removeChild(e)}d.clear&&d.clear();b=a}else b=K("SPAN");0<Qb(b).length&&(a=K("SPAN"),a.appendChild(b),b=a);b=(new XMLSerializer).serializeToString(b);b=b.slice(b.indexOf(">")+1,b.lastIndexOf("</"))}else b="";return $a(b)};function Kc(){var a=document.getElementById("turndown-banner-icon-tray"),b=ub();a.appendChild(b);document.getElementById("turndown-banner-title").textContent=chrome.i18n.getMessage("extension_name");document.getElementById("turndown-banner-subtitle-text").textContent=chrome.i18n.getMessage("turndown_subtitle");a=Jc();bb(document.getElementById("turndown-notice"),a);a=document.getElementById("turndown-close-button");a.textContent=chrome.i18n.getMessage("close_button");a.addEventListener("click",function(){window.close()});
a=document.getElementById("turndown-uninstall-button");a.textContent=chrome.i18n.getMessage("turndown_uninstall_button");a.addEventListener("click",function(){chrome.management.uninstallSelf({showConfirmDialog:!0})})};var Lc=function(){this.la=ka()},Mc=null;Lc.prototype.set=function(a){this.la=a};Lc.prototype.reset=function(){this.set(ka())};Lc.prototype.get=function(){return this.la};var W=function(a){this.cb=a||"";Mc||(Mc=new Lc);this.ib=Mc};W.prototype.ea=!0;W.prototype.ma=!0;W.prototype.gb=!0;W.prototype.fb=!0;W.prototype.na=!1;W.prototype.hb=!1;
var Nc=function(a){a=new Date(a.za());return Z(a.getFullYear()-2E3)+Z(a.getMonth()+1)+Z(a.getDate())+" "+Z(a.getHours())+":"+Z(a.getMinutes())+":"+Z(a.getSeconds())+"."+Z(Math.floor(a.getMilliseconds()/10))},Z=function(a){return 10>a?"0"+a:String(a)},Oc=function(a,b){a=(a.za()-b)/1E3;b=a.toFixed(3);var c=0;if(1>a)c=2;else for(;100>a;)c++,a*=10;for(;0<c--;)b=" "+b;return b},Pc=function(a){W.call(this,a)};la(Pc,W);
var Qc=function(a,b){var c=[];c.push(a.cb," ");a.ma&&c.push("[",Nc(b),"] ");a.gb&&c.push("[",Oc(b,a.ib.get()),"s] ");a.fb&&c.push("[",b.ya(),"] ");a.hb&&c.push("[",lc.name,"] ");c.push(b.getMessage());a.na&&(b=b.xa())&&c.push("\n",b instanceof Error?b.message:b.toString());a.ea&&c.push("\n");return c.join("")};var Rc=function(){ia(this.sa,this);this.s=new Pc;this.s.ma=!1;this.s.na=!1;this.fa=this.s.ea=!1;this.wa={}};Rc.prototype.sa=function(a){function b(f){if(f){if(f.value>=mc.value)return"error";if(f.value>=nc.value)return"warn";if(f.value>=oc.value)return"log"}return"debug"}if(!this.wa[a.ya()]){var c=Qc(this.s,a),d=Sc;if(d){var e=b(lc);Tc(d,e,c,a.xa())}}};var Sc=t.console,Tc=function(a,b,c,d){if(a[b])a[b](c,d||"");else a.log(c,d||"")};var Uc=new Rc;1!=Uc.fa&&(pc||(pc=new T),Uc.fa=!0);document.addEventListener("DOMContentLoaded",function(){Kc()});}).call(this);
