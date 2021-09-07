(()=>{var e,t={31808:(e,t,r)=>{"use strict";r.d(t,{fk:()=>a});var n,o=r(98924),i=function(){return(0,o.Z)()&&window.document.documentElement},a=function(){if(!i())return!1;if(void 0!==n)return n;var e=document.createElement("div");return e.style.display="flex",e.style.flexDirection="column",e.style.rowGap="1px",e.appendChild(document.createElement("div")),e.appendChild(document.createElement("div")),document.body.appendChild(e),n=1===e.scrollHeight,document.body.removeChild(e),n}},49134:(e,t,r)=>{"use strict";r.d(t,{w6:()=>v});var n,o=r(22122),i=r(67294),a=r(63017),l=r(6077),s=r(56982),u=r(99710),c=r(77667),f=r(86032),d=r(97647),p=r(55026),m=r(38648),h=["getTargetContainer","getPopupContainer","renderEmpty","pageHeader","input","form"];function y(){return n||"ant"}var v=function(){return{getPrefixCls:function(e,t){return t||(e?"".concat(y(),"-").concat(e):y())},getRootPrefixCls:function(e,t){return e||(n||(t&&t.includes("-")?t.replace(/^(.*)-[^-]*$/,"$1"):y()))}}},b=function(e){var t=e.children,r=e.csp,n=e.autoInsertSpaceInButton,c=e.form,p=e.locale,m=e.componentSize,y=e.direction,v=e.space,b=e.virtual,g=e.dropdownMatchSelectWidth,w=e.legacyLocale,x=e.parentContext,j=e.iconPrefixCls,S=i.useCallback((function(t,r){var n=e.prefixCls;if(r)return r;var o=n||x.getPrefixCls("");return t?"".concat(o,"-").concat(t):o}),[x.getPrefixCls,e.prefixCls]),O=(0,o.Z)((0,o.Z)({},x),{csp:r,autoInsertSpaceInButton:n,locale:p||w,direction:y,space:v,virtual:b,dropdownMatchSelectWidth:g,getPrefixCls:S});h.forEach((function(t){var r=e[t];r&&(O[t]=r)}));var P=(0,s.Z)((function(){return O}),O,(function(e,t){var r=Object.keys(e),n=Object.keys(t);return r.length!==n.length||r.some((function(r){return e[r]!==t[r]}))})),C=i.useMemo((function(){return{prefixCls:j,csp:r}}),[j]),_=t,k={};return p&&p.Form&&p.Form.defaultValidateMessages&&(k=p.Form.defaultValidateMessages),c&&c.validateMessages&&(k=(0,o.Z)((0,o.Z)({},k),c.validateMessages)),Object.keys(k).length>0&&(_=i.createElement(l.RV,{validateMessages:k},t)),p&&(_=i.createElement(u.Z,{locale:p,_ANT_MARK__:u.s},_)),j&&(_=i.createElement(a.Z.Provider,{value:C},_)),m&&(_=i.createElement(d.q,{size:m},_)),i.createElement(f.E_.Provider,{value:P},_)},g=function(e){return i.useEffect((function(){e.direction&&(p.ZP.config({rtl:"rtl"===e.direction}),m.Z.config({rtl:"rtl"===e.direction}))}),[e.direction]),i.createElement(c.Z,null,(function(t,r,n){return i.createElement(f.C,null,(function(t){return i.createElement(b,(0,o.Z)({parentContext:t,legacyLocale:n},e))}))}))};g.ConfigContext=f.E_,g.SizeContext=d.Z,g.config=function(e){void 0!==e.prefixCls&&(n=e.prefixCls)}},83008:(e,t,r)=>{"use strict";r.d(t,{f:()=>a});var n=r(22122),o=r(66805),i=(0,n.Z)({},o.Z.Modal);function a(e){i=e?(0,n.Z)((0,n.Z)({},i),e):(0,n.Z)({},o.Z.Modal)}},9669:(e,t,r)=>{e.exports=r(51609)},72408:(e,t,r)=>{"use strict";var n=r(27418),o="function"==typeof Symbol&&Symbol.for,i=o?Symbol.for("react.element"):60103,a=o?Symbol.for("react.portal"):60106,l=o?Symbol.for("react.fragment"):60107,s=o?Symbol.for("react.strict_mode"):60108,u=o?Symbol.for("react.profiler"):60114,c=o?Symbol.for("react.provider"):60109,f=o?Symbol.for("react.context"):60110,d=o?Symbol.for("react.forward_ref"):60112,p=o?Symbol.for("react.suspense"):60113,m=o?Symbol.for("react.memo"):60115,h=o?Symbol.for("react.lazy"):60116,y="function"==typeof Symbol&&Symbol.iterator;function v(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,r=1;r<arguments.length;r++)t+="&args[]="+encodeURIComponent(arguments[r]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var b={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},g={};function w(e,t,r){this.props=e,this.context=t,this.refs=g,this.updater=r||b}function x(){}function j(e,t,r){this.props=e,this.context=t,this.refs=g,this.updater=r||b}w.prototype.isReactComponent={},w.prototype.setState=function(e,t){if("object"!=typeof e&&"function"!=typeof e&&null!=e)throw Error(v(85));this.updater.enqueueSetState(this,e,t,"setState")},w.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")},x.prototype=w.prototype;var S=j.prototype=new x;S.constructor=j,n(S,w.prototype),S.isPureReactComponent=!0;var O={current:null},P=Object.prototype.hasOwnProperty,C={key:!0,ref:!0,__self:!0,__source:!0};function _(e,t,r){var n,o={},a=null,l=null;if(null!=t)for(n in void 0!==t.ref&&(l=t.ref),void 0!==t.key&&(a=""+t.key),t)P.call(t,n)&&!C.hasOwnProperty(n)&&(o[n]=t[n]);var s=arguments.length-2;if(1===s)o.children=r;else if(1<s){for(var u=Array(s),c=0;c<s;c++)u[c]=arguments[c+2];o.children=u}if(e&&e.defaultProps)for(n in s=e.defaultProps)void 0===o[n]&&(o[n]=s[n]);return{$$typeof:i,type:e,key:a,ref:l,props:o,_owner:O.current}}function k(e){return"object"==typeof e&&null!==e&&e.$$typeof===i}var Z=/\/+/g,E=[];function R(e,t,r,n){if(E.length){var o=E.pop();return o.result=e,o.keyPrefix=t,o.func=r,o.context=n,o.count=0,o}return{result:e,keyPrefix:t,func:r,context:n,count:0}}function I(e){e.result=null,e.keyPrefix=null,e.func=null,e.context=null,e.count=0,10>E.length&&E.push(e)}function N(e,t,r,n){var o=typeof e;"undefined"!==o&&"boolean"!==o||(e=null);var l=!1;if(null===e)l=!0;else switch(o){case"string":case"number":l=!0;break;case"object":switch(e.$$typeof){case i:case a:l=!0}}if(l)return r(n,e,""===t?"."+B(e,0):t),1;if(l=0,t=""===t?".":t+":",Array.isArray(e))for(var s=0;s<e.length;s++){var u=t+B(o=e[s],s);l+=N(o,u,r,n)}else if(null===e||"object"!=typeof e?u=null:u="function"==typeof(u=y&&e[y]||e["@@iterator"])?u:null,"function"==typeof u)for(e=u.call(e),s=0;!(o=e.next()).done;)l+=N(o=o.value,u=t+B(o,s++),r,n);else if("object"===o)throw r=""+e,Error(v(31,"[object Object]"===r?"object with keys {"+Object.keys(e).join(", ")+"}":r,""));return l}function $(e,t,r){return null==e?0:N(e,"",t,r)}function B(e,t){return"object"==typeof e&&null!==e&&null!=e.key?function(e){var t={"=":"=0",":":"=2"};return"$"+(""+e).replace(/[=:]/g,(function(e){return t[e]}))}(e.key):t.toString(36)}function q(e,t){e.func.call(e.context,t,e.count++)}function A(e,t,r){var n=e.result,o=e.keyPrefix;e=e.func.call(e.context,t,e.count++),Array.isArray(e)?M(e,n,r,(function(e){return e})):null!=e&&(k(e)&&(e=function(e,t){return{$$typeof:i,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}(e,o+(!e.key||t&&t.key===e.key?"":(""+e.key).replace(Z,"$&/")+"/")+r)),n.push(e))}function M(e,t,r,n,o){var i="";null!=r&&(i=(""+r).replace(Z,"$&/")+"/"),$(e,A,t=R(t,i,n,o)),I(t)}var U={current:null};function F(){var e=U.current;if(null===e)throw Error(v(321));return e}var T={ReactCurrentDispatcher:U,ReactCurrentBatchConfig:{suspense:null},ReactCurrentOwner:O,IsSomeRendererActing:{current:!1},assign:n};t.Children={map:function(e,t,r){if(null==e)return e;var n=[];return M(e,n,null,t,r),n},forEach:function(e,t,r){if(null==e)return e;$(e,q,t=R(null,null,t,r)),I(t)},count:function(e){return $(e,(function(){return null}),null)},toArray:function(e){var t=[];return M(e,t,null,(function(e){return e})),t},only:function(e){if(!k(e))throw Error(v(143));return e}},t.Component=w,t.Fragment=l,t.Profiler=u,t.PureComponent=j,t.StrictMode=s,t.Suspense=p,t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=T,t.cloneElement=function(e,t,r){if(null==e)throw Error(v(267,e));var o=n({},e.props),a=e.key,l=e.ref,s=e._owner;if(null!=t){if(void 0!==t.ref&&(l=t.ref,s=O.current),void 0!==t.key&&(a=""+t.key),e.type&&e.type.defaultProps)var u=e.type.defaultProps;for(c in t)P.call(t,c)&&!C.hasOwnProperty(c)&&(o[c]=void 0===t[c]&&void 0!==u?u[c]:t[c])}var c=arguments.length-2;if(1===c)o.children=r;else if(1<c){u=Array(c);for(var f=0;f<c;f++)u[f]=arguments[f+2];o.children=u}return{$$typeof:i,type:e.type,key:a,ref:l,props:o,_owner:s}},t.createContext=function(e,t){return void 0===t&&(t=null),(e={$$typeof:f,_calculateChangedBits:t,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null}).Provider={$$typeof:c,_context:e},e.Consumer=e},t.createElement=_,t.createFactory=function(e){var t=_.bind(null,e);return t.type=e,t},t.createRef=function(){return{current:null}},t.forwardRef=function(e){return{$$typeof:d,render:e}},t.isValidElement=k,t.lazy=function(e){return{$$typeof:h,_ctor:e,_status:-1,_result:null}},t.memo=function(e,t){return{$$typeof:m,type:e,compare:void 0===t?null:t}},t.useCallback=function(e,t){return F().useCallback(e,t)},t.useContext=function(e,t){return F().useContext(e,t)},t.useDebugValue=function(){},t.useEffect=function(e,t){return F().useEffect(e,t)},t.useImperativeHandle=function(e,t,r){return F().useImperativeHandle(e,t,r)},t.useLayoutEffect=function(e,t){return F().useLayoutEffect(e,t)},t.useMemo=function(e,t){return F().useMemo(e,t)},t.useReducer=function(e,t,r){return F().useReducer(e,t,r)},t.useRef=function(e){return F().useRef(e)},t.useState=function(e){return F().useState(e)},t.version="16.14.0"},67294:(e,t,r)=>{"use strict";e.exports=r(72408)},85893:(e,t,r)=>{"use strict";e.exports=r(75251)},90475:(e,t,r)=>{"use strict";r(57539);var n=r(9676),o=(r(12496),r(69713)),i=(r(53890),r(25779)),a=(r(84968),r(90071)),l=(r(45186),r(71577)),s=(r(69754),r(55026)),u=(r(61241),r(16317)),c=r(67294),f=r(73935),d=r(38819),p=r(1870),m=r(31795),h=r.n(m),y=r(9669),v="https://www.awesomescreenshot.com/api/v1",b=["/premium/stripe/create_plan","/premium/stripe/change_plan","/folder/create","/folder/add_items","/folder/change_name","/trash/throw_into","/image/change_title","/video/update_title","/trash/restore","/trash/delete","/image/upload"],g=r.n(y)().create({baseURL:v});g.interceptors.request.use((function(e){return e}),(function(e){return s.ZP.error("Network error, Request timeout!"),Promise.reject()})),g.interceptors.response.use((function(e){if(e&&e.data&&1===e.data.code)return Promise.resolve(e.data.data);if(e.data.code,e.data.msg){if(-1!==b.indexOf(e.config.url))return Promise.reject(e.data.msg);if(s.ZP.error(e.data.msg),"/pricing"!==window.location.pathname)return Promise.reject(e.data.msg)}}),(function(e){if(e.response){var t=e.response.status;s.ZP.error("Network error! Error Code "+t)}return Promise.reject(e)}));var w=r(85893);function x(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function j(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?x(Object(r),!0).forEach((function(t){S(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):x(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function S(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function O(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==r)return;var n,o,i=[],a=!0,l=!1;try{for(r=r.call(e);!(a=(n=r.next()).done)&&(i.push(n.value),!t||i.length!==t);a=!0);}catch(e){l=!0,o=e}finally{try{a||null==r.return||r.return()}finally{if(l)throw o}}return i}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return P(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return P(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function P(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var C=u.Z.Option;function _(e){var t=O((0,c.useState)(!1),2),r=t[0],f=t[1],m=O((0,c.useState)(!1),2),y=m[0],v=m[1],b=O((0,c.useState)("Screenshot Bug"),2),x=b[0],S=b[1],P={"Screenshot Bug":{name:"Bug Report-Screenshot",title:{label:"Bug Summary",tip:"Let us know what went wrong in a few words."},detail:{label:"Bug Details",tip:"Please describe in detail what went wrong, any actions you took, and error messages you got."}},"Video Bug":{name:"Bug Report-Screenshot",title:{label:"Bug Summary",tip:"Let us know what went wrong in a few words."},detail:{label:"Bug Details",tip:"Please describe in detail what went wrong, any actions you took, and error messages you got."}},"Feature Request":{name:"Feature Request",title:{label:"Title",tip:"What's your request about?"},detail:{label:"Description",tip:"Please provide a detailed description of new feature you want."}},"Other Issue":{name:"Other Issue",title:{label:"Title"},detail:{label:"Description",tip:"Let us know your thoughts on Awesome Screenshot. Any questions, comments or suggestions are welcome."}}};return(0,w.jsxs)("div",{className:"main",children:[(0,w.jsx)("div",{className:"top",children:(0,w.jsx)("div",{className:"logo",children:(0,w.jsx)("a",{href:"https://www.awesomescreenshot.com"})})}),(0,w.jsx)("div",{className:"options-container",children:y?(0,w.jsxs)("div",{className:"sent-message",children:[(0,w.jsx)("div",{children:(0,w.jsx)(d.Z,{})}),(0,w.jsx)("div",{className:"title",children:"Thank you"}),(0,w.jsx)("div",{className:"content",children:"The form was submitted successfully. We will contact you shortly."}),(0,w.jsx)(l.Z,{type:"primary",onClick:function(){v(!1)},children:"Submit another issue"})]}):(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)("div",{className:"main-title",children:"Send Feedback"}),(0,w.jsxs)("div",{className:"title-tip",children:["Please fill out the form below to submit an issue."," "]}),(0,w.jsxs)(a.Z,{onFinish:function(e){var t={};t["Extension Version"]=chrome.runtime.getManifest().version,localStorage.last_info&&(t=j(j({},t),JSON.parse(localStorage.last_info))),t.Browser||(t.Browser=h().name+" "+h().version),t.OS||(t.OS=h().os.toString()),t["Screen Size"]||(t["Screen Size"]=window.screen.width+"x"+window.screen.height),e.webUrl&&(t["Web URL"]=e.webUrl),e.screenshotVideoUrl&&(t["Screenshot/video URL"]=e.screenshotVideoUrl);var r=!0===e.isSendInfo||void 0===e.isSendInfo?function(e,t){var r="";for(var n in r+=e+"<br/><br/><br/><hr>",t)r+="<b>"+n+"</b>: "+t[n]+"<br/>";return r}(e.content,t):e.content,n={email:e.email,name:e.name,subject:"[".concat(e.type,"] ").concat(e.title),content:r};f(!0),v(!0),function(e){return g({method:"POST",url:"/common/contact_us",data:e})}(n).then((function(e){f(!1),v(!0)})).catch((function(e){f(!1),s.ZP.error("Submission failed. Please retry or copy summary and details to send an email to care@awesomescreenshot.com.")}))},children:[(0,w.jsx)("div",{className:"label required",children:"Issue Type"}),(0,w.jsx)(a.Z.Item,{name:"type",initialValue:x,rules:[{required:!0}],children:(0,w.jsx)(u.Z,{onChange:function(e){S(e)},children:["Screenshot Bug","Video Bug","Feature Request","Other Issue"].map((function(e){return(0,w.jsx)(C,{value:e,children:e},e)}))})}),(0,w.jsx)("div",{className:"label required",children:P[x].title.label}),(0,w.jsx)("div",{className:"label-tip",children:P[x].title.tip}),(0,w.jsx)(a.Z.Item,{name:"title",rules:[{required:!0}],children:(0,w.jsx)(i.Z,{})}),"Screenshot Bug"===x&&(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)("div",{className:"label",children:"Web URL"}),(0,w.jsx)("div",{className:"label-tip",children:"Include the url of page you had trouble capture to help us debug much faster."}),(0,w.jsx)(a.Z.Item,{name:"webUrl",children:(0,w.jsx)(i.Z,{})})]}),(0,w.jsx)("div",{className:"label required",children:P[x].detail.label}),(0,w.jsx)("div",{className:"label-tip",children:P[x].detail.tip}),(0,w.jsx)(a.Z.Item,{name:"content",rules:[{required:!0}],children:(0,w.jsx)(i.Z.TextArea,{autoSize:{minRows:3}})}),("Screenshot Bug"===x||"Video Bug"===x)&&(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)("div",{className:"label",children:"Screenshot/video URL"}),(0,w.jsx)("div",{className:"label-tip",children:"Don't feel like writing? Record a video tell us what's go on or send us a snapshot. If a picture is worth a thousand words, then a video is worth a million."}),(0,w.jsx)(a.Z.Item,{name:"screenshotVideoUrl",children:(0,w.jsx)(i.Z,{})})]}),(0,w.jsx)("div",{className:"label required",children:"Your Email Address"}),(0,w.jsx)("div",{className:"label-tip",children:"Enter an email address to receive updates on the issue."}),(0,w.jsx)(a.Z.Item,{name:"email",rules:[{required:!0}],children:(0,w.jsx)(i.Z,{type:"email"})}),(0,w.jsx)("div",{className:"label",children:"Your Name"}),(0,w.jsx)("div",{className:"label-tip",children:"Only for email correspondence."}),(0,w.jsx)(a.Z.Item,{name:"name",children:(0,w.jsx)(i.Z,{})}),(0,w.jsx)(a.Z.Item,{name:"isSendInfo",valuePropName:"checked",initialValue:!0,children:(0,w.jsxs)(n.Z,{children:["Include OS and browser info to help developers debug errors"," ",(0,w.jsx)(o.Z,{title:"Specifically, version number of your OS, browser, extension, and screen size will be included. ",children:(0,w.jsx)(p.Z,{})})]})}),(0,w.jsx)(a.Z.Item,{children:(0,w.jsx)(l.Z,{type:"primary",htmlType:"submit",loading:r,size:"large",block:!0,children:"Submit"})})]})]})})]})}f.render((0,w.jsx)(_,{}),document.getElementById("feedback-page"))}},r={};function n(e){var o=r[e];if(void 0!==o)return o.exports;var i=r[e]={id:e,loaded:!1,exports:{}};return t[e].call(i.exports,i,i.exports,n),i.loaded=!0,i.exports}n.m=t,e=[],n.O=(t,r,o,i)=>{if(!r){var a=1/0;for(c=0;c<e.length;c++){for(var[r,o,i]=e[c],l=!0,s=0;s<r.length;s++)(!1&i||a>=i)&&Object.keys(n.O).every((e=>n.O[e](r[s])))?r.splice(s--,1):(l=!1,i<a&&(a=i));if(l){e.splice(c--,1);var u=o();void 0!==u&&(t=u)}}return t}i=i||0;for(var c=e.length;c>0&&e[c-1][2]>i;c--)e[c]=e[c-1];e[c]=[r,o,i]},n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.nmd=e=>(e.paths=[],e.children||(e.children=[]),e),(()=>{var e={656:0};n.O.j=t=>0===e[t];var t=(t,r)=>{var o,i,[a,l,s]=r,u=0;for(o in l)n.o(l,o)&&(n.m[o]=l[o]);if(s)var c=s(n);for(t&&t(r);u<a.length;u++)i=a[u],n.o(e,i)&&e[i]&&e[i][0](),e[a[u]]=0;return n.O(c)},r=self.webpackChunkawesomescreenshot_front=self.webpackChunkawesomescreenshot_front||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))})(),n.O(void 0,[186,377,91,116,347,509,163,473,242],(()=>n(33505)));var o=n.O(void 0,[186,377,91,116,347,509,163,473,242],(()=>n(90475)));o=n.O(o)})();