"use strict";(self.webpackChunkawesomescreenshot_front=self.webpackChunkawesomescreenshot_front||[]).push([[242],{92138:(n,e,t)=>{t.d(e,{R_:()=>f});var r=t(86500),o=t(64811),a=[{index:7,opacity:.15},{index:6,opacity:.25},{index:5,opacity:.3},{index:5,opacity:.45},{index:5,opacity:.65},{index:5,opacity:.85},{index:4,opacity:.9},{index:3,opacity:.95},{index:2,opacity:.97},{index:1,opacity:.98}];function i(n){var e=n.r,t=n.g,o=n.b,a=(0,r.py)(e,t,o);return{h:360*a.h,s:a.s,v:a.v}}function c(n){var e=n.r,t=n.g,o=n.b;return"#".concat((0,r.vq)(e,t,o,!1))}function l(n,e,t){var r=t/100;return{r:(e.r-n.r)*r+n.r,g:(e.g-n.g)*r+n.g,b:(e.b-n.b)*r+n.b}}function s(n,e,t){var r;return(r=Math.round(n.h)>=60&&Math.round(n.h)<=240?t?Math.round(n.h)-2*e:Math.round(n.h)+2*e:t?Math.round(n.h)+2*e:Math.round(n.h)-2*e)<0?r+=360:r>=360&&(r-=360),r}function u(n,e,t){return 0===n.h&&0===n.s?n.s:((r=t?n.s-.16*e:4===e?n.s+.16:n.s+.05*e)>1&&(r=1),t&&5===e&&r>.1&&(r=.1),r<.06&&(r=.06),Number(r.toFixed(2)));var r}function d(n,e,t){var r;return(r=t?n.v+.05*e:n.v-.15*e)>1&&(r=1),Number(r.toFixed(2))}function f(n){for(var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=[],r=(0,o.uA)(n),f=5;f>0;f-=1){var p=i(r),g=c((0,o.uA)({h:s(p,f,!0),s:u(p,f,!0),v:d(p,f,!0)}));t.push(g)}t.push(c(r));for(var h=1;h<=4;h+=1){var y=i(r),m=c((0,o.uA)({h:s(y,h),s:u(y,h),v:d(y,h)}));t.push(m)}return"dark"===e.theme?a.map((function(n){var r=n.index,a=n.opacity;return c(l((0,o.uA)(e.backgroundColor||"#141414"),(0,o.uA)(t[r]),100*a))})):t}var p={red:"#F5222D",volcano:"#FA541C",orange:"#FA8C16",gold:"#FAAD14",yellow:"#FADB14",lime:"#A0D911",green:"#52C41A",cyan:"#13C2C2",blue:"#1890FF",geekblue:"#2F54EB",purple:"#722ED1",magenta:"#EB2F96",grey:"#666666"},g={},h={};Object.keys(p).forEach((function(n){g[n]=f(p[n]),g[n].primary=g[n][5],h[n]=f(p[n],{theme:"dark",backgroundColor:"#141414"}),h[n].primary=h[n][5]}));g.red,g.volcano,g.gold,g.orange,g.yellow,g.lime,g.green,g.cyan,g.blue,g.geekblue,g.purple,g.magenta,g.grey},41755:(n,e,t)=>{t.d(e,{Kp:()=>u,r:()=>d,R_:()=>p,pw:()=>g,H9:()=>h,C3:()=>m});var r=t(28991),o=t(90484),a=t(92138),i=t(67294),c=t(80334),l=t(44958),s=t(63017);function u(n,e){(0,c.ZP)(n,"[@ant-design/icons] ".concat(e))}function d(n){return"object"===(0,o.Z)(n)&&"string"==typeof n.name&&"string"==typeof n.theme&&("object"===(0,o.Z)(n.icon)||"function"==typeof n.icon)}function f(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return Object.keys(n).reduce((function(e,t){var r=n[t];switch(t){case"class":e.className=r,delete e.class;break;default:e[t]=r}return e}),{})}function p(n,e,t){return t?i.createElement(n.tag,(0,r.Z)((0,r.Z)({key:e},f(n.attrs)),t),(n.children||[]).map((function(t,r){return p(t,"".concat(e,"-").concat(n.tag,"-").concat(r))}))):i.createElement(n.tag,(0,r.Z)({key:e},f(n.attrs)),(n.children||[]).map((function(t,r){return p(t,"".concat(e,"-").concat(n.tag,"-").concat(r))})))}function g(n){return(0,a.R_)(n)[0]}function h(n){return n?Array.isArray(n)?n:[n]:[]}var y="\n.anticon {\n  display: inline-block;\n  color: inherit;\n  font-style: normal;\n  line-height: 0;\n  text-align: center;\n  text-transform: none;\n  vertical-align: -0.125em;\n  text-rendering: optimizeLegibility;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n.anticon > * {\n  line-height: 1;\n}\n\n.anticon svg {\n  display: inline-block;\n}\n\n.anticon::before {\n  display: none;\n}\n\n.anticon .anticon-icon {\n  display: block;\n}\n\n.anticon[tabindex] {\n  cursor: pointer;\n}\n\n.anticon-spin::before,\n.anticon-spin {\n  display: inline-block;\n  -webkit-animation: loadingCircle 1s infinite linear;\n  animation: loadingCircle 1s infinite linear;\n}\n\n@-webkit-keyframes loadingCircle {\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes loadingCircle {\n  100% {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n",m=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:y,e=(0,i.useContext)(s.Z),t=e.csp;(0,i.useEffect)((function(){(0,l.h)(n,"@ant-design-icons",{prepend:!0,csp:t})}),[])}},98787:(n,e,t)=>{t.d(e,{Y:()=>o});var r=t(93355),o=((0,r.b)("success","processing","error","default","warning"),(0,r.b)("pink","red","yellow","orange","cyan","green","blue","purple","geekblue","magenta","volcano","gold","lime"))},97447:(n,e,t)=>{t.d(e,{Z:()=>O});var r=t(22122),o=t(96156),a=t(28481),i=t(90484),c=t(67294),l=t(94184),s=t.n(l),u=t(98423),d=t(48786),f=t(86032),p=t(21790),g=t(93355),h=t(21687),y=t(97647),m=t(44942),b=t(96159),v=function(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(null!=n&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(n);o<r.length;o++)e.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(n,r[o])&&(t[r[o]]=n[r[o]])}return t},k=/^[\u4e00-\u9fa5]{2}$/,x=k.test.bind(k);function C(n){return"text"===n||"link"===n}function Z(n,e){if(null!=n){var t,r=e?" ":"";return"string"!=typeof n&&"number"!=typeof n&&"string"==typeof n.type&&x(n.props.children)?(0,b.Tm)(n,{children:n.props.children.split("").join(r)}):"string"==typeof n?x(n)?c.createElement("span",null,n.split("").join(r)):c.createElement("span",null,n):(t=n,c.isValidElement(t)&&t.type===c.Fragment?c.createElement("span",null,n):n)}}(0,g.b)("default","primary","ghost","dashed","link","text"),(0,g.b)("circle","round"),(0,g.b)("submit","button","reset");var _=function(n,e){var t,l,d=n.loading,g=void 0!==d&&d,b=n.prefixCls,k=n.type,_=n.danger,E=n.shape,O=n.size,w=n.className,A=n.children,T=n.icon,F=n.ghost,j=void 0!==F&&F,B=n.block,D=void 0!==B&&B,N=n.htmlType,L=void 0===N?"button":N,R=v(n,["loading","prefixCls","type","danger","shape","size","className","children","icon","ghost","block","htmlType"]),S=c.useContext(y.Z),M=c.useState(!!g),P=(0,a.Z)(M,2),z=P[0],G=P[1],H=c.useState(!1),I=(0,a.Z)(H,2),K=I[0],V=I[1],q=c.useContext(f.E_),U=q.getPrefixCls,Y=q.autoInsertSpaceInButton,$=q.direction,J=e||c.createRef(),Q=c.useRef(),W=function(){return 1===c.Children.count(A)&&!T&&!C(k)};l="object"===(0,i.Z)(g)&&g.delay?g.delay||!0:!!g,c.useEffect((function(){clearTimeout(Q.current),"number"==typeof l?Q.current=window.setTimeout((function(){G(l)}),l):G(l)}),[l]),c.useEffect((function(){if(J&&J.current&&!1!==Y){var n=J.current.textContent;W()&&x(n)?K||V(!0):K&&V(!1)}}),[J]);var X=function(e){var t,r=n.onClick,o=n.disabled;z||o?e.preventDefault():null===(t=r)||void 0===t||t(e)};(0,h.Z)(!("string"==typeof T&&T.length>2),"Button","`icon` is using ReactNode instead of string naming in v4. Please check `".concat(T,"` at https://ant.design/components/icon")),(0,h.Z)(!(j&&C(k)),"Button","`link` or `text` button can't be a `ghost` button.");var nn=U("btn",b),en=!1!==Y,tn="";switch(O||S){case"large":tn="lg";break;case"small":tn="sm"}var rn=z?"loading":T,on=s()(nn,(t={},(0,o.Z)(t,"".concat(nn,"-").concat(k),k),(0,o.Z)(t,"".concat(nn,"-").concat(E),E),(0,o.Z)(t,"".concat(nn,"-").concat(tn),tn),(0,o.Z)(t,"".concat(nn,"-icon-only"),!A&&0!==A&&!!rn),(0,o.Z)(t,"".concat(nn,"-background-ghost"),j&&!C(k)),(0,o.Z)(t,"".concat(nn,"-loading"),z),(0,o.Z)(t,"".concat(nn,"-two-chinese-chars"),K&&en),(0,o.Z)(t,"".concat(nn,"-block"),D),(0,o.Z)(t,"".concat(nn,"-dangerous"),!!_),(0,o.Z)(t,"".concat(nn,"-rtl"),"rtl"===$),t),w),an=T&&!z?T:c.createElement(m.Z,{existIcon:!!T,prefixCls:nn,loading:!!z}),cn=A||0===A?function(n,e){var t=!1,r=[];return c.Children.forEach(n,(function(n){var e=(0,i.Z)(n),o="string"===e||"number"===e;if(t&&o){var a=r.length-1,c=r[a];r[a]="".concat(c).concat(n)}else r.push(n);t=o})),c.Children.map(r,(function(n){return Z(n,e)}))}(A,W()&&en):null,ln=(0,u.Z)(R,["navigate"]);if(void 0!==ln.href)return c.createElement("a",(0,r.Z)({},ln,{className:on,onClick:X,ref:J}),an,cn);var sn=c.createElement("button",(0,r.Z)({},R,{type:L,className:on,onClick:X,ref:J}),an,cn);return C(k)?sn:c.createElement(p.Z,null,sn)},E=c.forwardRef(_);E.displayName="Button",E.Group=d.Z,E.__ANT_BUTTON=!0;const O=E},73935:(n,e,t)=>{!function n(){if("undefined"!=typeof __REACT_DEVTOOLS_GLOBAL_HOOK__&&"function"==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE)try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n)}catch(n){}}(),n.exports=t(64448)}}]);