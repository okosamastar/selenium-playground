(()=>{"use strict";var e,t={88010:(e,t,a)=>{a(53890);var n=a(25779),l=(a(74128),a(12028)),r=(a(5827),a(51368)),i=(a(12496),a(69713)),o=(a(57539),a(9676)),s=(a(75127),a(82530)),c=(a(61241),a(16317)),d=a(67294),h=a(73935),u=a(1870),p=(a(69754),a(27484),a(9669),a(40705),a(28374),a(85893));var g=function(e){return chrome.i18n.getMessage(e)};function v(e){document.getElementById(e)&&document.getElementById(e).remove()}function f(e,t){this.type=e,this.data=t,this.exec()}f.prototype={constructor:f,exec:function(){try{"changeCssText"===this.type?(this.cssTextBefore=this.data.element.style.cssText,this.data.element.style.cssText=this.cssTextBefore+";"+function(e){var t="";for(var a in e)t+=a.replace(/([a-zA-Z](?=[A-Z]))/g,"$1-").toLowerCase()+":"+e[a]+" !important;";return t}(this.data.cssObj)):"addStyle"===this.type?(e=this.data.id,t=this.data.css,a=document.head,(n=document.createElement("style")).setAttribute("type","text/css"),n.setAttribute("id",e),n.appendChild(document.createTextNode(t)),a.appendChild(n)):"changeAttr"===this.type&&(this.attrValueBefore=this.data.element[this.data.attrName],this.data.element[this.data.attrName]=this.data.attrValue)}catch(e){}var e,t,a,n},undo:function(){try{"changeCssText"===this.type?this.data.element.style.cssText=this.cssTextBefore:"addStyle"===this.type?v(this.data.id):"changeAttr"===this.type&&(this.data.element[this.data.attrName]=this.attrValueBefore)}catch(e){}}};var m;m=0;function x(e){return(x="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function y(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function b(e,t){for(var a=0;a<t.length;a++){var n=t[a];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function S(e,t){return(S=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function j(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var a,n=_(e);if(t){var l=_(this).constructor;a=Reflect.construct(n,arguments,l)}else a=n.apply(this,arguments);return k(this,a)}}function k(e,t){return!t||"object"!==x(t)&&"function"!=typeof t?C(e):t}function C(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _(e){return(_=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var w=c.Z.Option,O=s.ZP.Group,Z="0123456789abcdefghijklmnopqstuvwxyz".toUpperCase().split(""),A=JSON.parse(localStorage.msObj),N=["slack","trello","asana","github","jira","gmail"],P=function(e){return(0,p.jsxs)("div",{className:"shortcut-section",children:[(0,p.jsx)("div",{className:"shortcut-title",children:(0,p.jsx)(o.Z,{checked:e.checked,value:e.id,onChange:e.handleCheckBoxChange,children:e.name})}),(0,p.jsxs)("div",{className:"shortcut-option",children:["Ctrl + Shift + ",(0,p.jsx)(c.Z,{size:"small",defaultValue:e.dValue,onChange:e.handleSelectChange.bind(null,e.id),children:e.optionArray.map((function(t){return(0,p.jsx)(w,{value:t,disabled:-1!==e.disableKey.indexOf(t),children:t},t)}))})]})]})},R=function(e){return(0,p.jsxs)("div",{className:"section",children:[(0,p.jsx)("div",{className:"section-title",children:e.title}),(0,p.jsx)("div",{className:"section-content",children:e.children})]})},B=function(e){var t=e.desc?"hasDesc":"";return(0,p.jsxs)("div",{className:"section-option horizontal ".concat(t),children:[(0,p.jsxs)("div",{className:"label",children:[e.label,(0,p.jsx)("div",{className:"desc",children:e.desc})]}),(0,p.jsx)("div",{className:"action-area",children:e.children}),(0,p.jsx)("div",{className:"more",children:e.more})]})},T=function(e){return(0,p.jsxs)("div",{className:"section-option vertical",children:[(0,p.jsx)("div",{className:"label",children:e.label}),(0,p.jsx)("div",{className:"action-area",children:e.children})]})},E=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&S(e,t)}(h,e);var t,a,c,d=j(h);function h(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,h),(t=d.call(this,e)).state={initDone:!1,format:localStorage.format,delaySec:localStorage.delay_sec,desktopDelaySec:localStorage.desktop_delay_sec,countdown:localStorage.record_countdown,isGmailBtn:"true"===localStorage["gmail-btn"],isGoogleDriveShare:"true"===localStorage["is-google-drive-share"],isDarkMode:"true"===localStorage["dark-mode"],isSkipAnnotate:"true"===localStorage["skip-annotate"],isResizeForRetina:"true"===localStorage["resize-for-retina"],isSaveAs:"true"===localStorage["save-as"],visible:A.visible.enable,selected:A.selected.enable,entire:A.entire.enable,visibleKey:A.visible.key,selectedKey:A.selected.key,entireKey:A.entire.key,removePrintWatermark:"true"===localStorage["remove-print-watermark"],downloadDirectory:localStorage.download_directory||"",popupTab:localStorage.popupTab||"screenshot",isAddUrl:"true"===localStorage["add-url"],expandLink:"true"===localStorage["expand-link"],slackExpandLink:"true"===localStorage["expand-link-slack"],trelloExpandLink:"true"===localStorage["expand-link-trello"],asanaExpandLink:"true"===localStorage["expand-link-asana"],githubExpandLink:"true"===localStorage["expand-link-github"],jiraExpandLink:"true"===localStorage["expand-link-jira"],gmailExpandLink:"true"===localStorage["expand-link-gmail"],afterCaptureAction:void 0!==localStorage["after-capture-action"]?localStorage["after-capture-action"]:"true"===localStorage["skip-annotate"]?"skipEntireCapture":"annotate",allowRemindMic:"true"===localStorage["allow-remind-mic"]},t.handleRadioChange=t.handleRadioChange.bind(C(t)),t.handleCheckBoxChange=t.handleCheckBoxChange.bind(C(t)),t.handleSwitchChange=t.handleSwitchChange.bind(C(t)),t.handleSelectChange=t.handleSelectChange.bind(C(t)),t.handleInputChange=t.handleInputChange.bind(C(t)),t.handleCountdownChange=t.handleCountdownChange.bind(C(t)),t}return t=h,(a=[{key:"handleSelectChange",value:function(e,t){if("visible"===e||"selected"===e||"entire"===e){A[e].key=t;var a="".concat(e,"Key");this.setState(y({},a,t)),localStorage.msObj=JSON.stringify(A)}}},{key:"handleRadioChange",value:function(e){var t=e.target.name;"format"===t?(this.setState({format:e.target.value}),localStorage.format=e.target.value):"delay_sec"===t?(this.setState({delaySec:e.target.value}),localStorage.delay_sec=e.target.value):"desktop_delay_sec"===t?(this.setState({desktopDelaySec:e.target.value}),localStorage.desktop_delay_sec=e.target.value):"popupTab"===t?(this.setState({popupTab:e.target.value}),localStorage.popupTab=e.target.value):"afterCaptureAction"===t&&(this.setState({afterCaptureAction:e.target.value}),localStorage["after-capture-action"]=e.target.value)}},{key:"handleInputChange",value:function(e,t){var a=t.target.value;this.setState(y({},e,a)),localStorage.download_directory=a}},{key:"handleSwitchChange",value:function(e,t){var a=t.target.value;"gmailBtn"===a?(localStorage["gmail-btn"]=e,this.setState({isGmailBtn:e})):"visible"===a||"selected"===a||"entire"===a?(A[a].enable=e,this.setState(y({},a,e)),localStorage.msObj=JSON.stringify(A)):"darkMode"===a?(localStorage["dark-mode"]=e,this.setState({isDarkMode:e})):"removePrintWatermark"===a?(localStorage["remove-print-watermark"]=e,this.setState({removePrintWatermark:e})):"googleDriveShare"===a?(localStorage["is-google-drive-share"]=e,this.setState({isGoogleDriveShare:e})):"skipAnnotate"===a?(localStorage["skip-annotate"]=e,this.setState({isSkipAnnotate:e})):"saveAs"===a?(localStorage["save-as"]=e,this.setState({isSaveAs:e})):"resizeForRetina"===a?(localStorage["resize-for-retina"]=e,this.setState({isResizeForRetina:e})):"addUrl"===a?(localStorage["add-url"]=e,this.setState({isAddUrl:e})):"expandLink"===a?(localStorage["expand-link"]=e,this.setState({expandLink:e})):"allowRemindMic"===a&&(localStorage["allow-remind-mic"]=e,this.setState({allowRemindMic:e}))}},{key:"handleCheckBoxChange",value:function(e){var t=e.target.value,a=e.target.checked;if("visible"===t||"selected"===t||"entire"===t)A[t].enable=a,this.setState(y({},t,a)),localStorage.msObj=JSON.stringify(A);else if(/expand-link-/.test(t)){var n=t.match(/expand-link-(.*)/)[1];this.setState(y({},"".concat(n,"ExpandLink"),a)),localStorage[t]=a}}},{key:"handleCountdownChange",value:function(e){e=""===e?0:Math.floor(e),this.setState({countdown:e}),localStorage.record_countdown=e}},{key:"render",value:function(){var e=this,t=this.state,a=t.format,c=t.delaySec,d=t.desktopDelaySec,h=t.countdown,v=t.isGmailBtn,f=t.visible,m=t.selected,x=t.entire,y=t.visibleKey,b=t.selectedKey,S=t.entireKey,j=t.downloadDirectory,k=t.isDarkMode,C=(t.isSkipAnnotate,t.isGoogleDriveShare),_=t.isSaveAs,w=t.isResizeForRetina,A=t.popupTab,E=t.isAddUrl,D=t.expandLink,L=t.afterCaptureAction,K=t.allowRemindMic,M=(this.props.intl,[{id:"visible",name:g("c_s_visible"),checked:f,dValue:y,disableKey:[b,S],optionArray:Z},{id:"selected",name:g("c_s_selected"),checked:m,dValue:b,disableKey:[y,S],optionArray:Z},{id:"entire",name:g("c_s_fullpage"),checked:x,dValue:S,disableKey:[b,y],optionArray:Z}]);return p.Fragment,i.Z,u.Z,(0,p.jsxs)("div",{className:"main",children:[(0,p.jsx)("div",{className:"top",children:(0,p.jsx)("div",{className:"logo",children:(0,p.jsx)("a",{href:"https://www.awesomescreenshot.com"})})}),(0,p.jsxs)("div",{className:"options-container",children:[(0,p.jsxs)(R,{title:g("c_section_title"),children:[(0,p.jsx)(T,{label:g("c_s_title"),children:M.map((function(t){return(0,p.jsx)(P,{name:t.name,id:t.id,checked:t.checked,dValue:t.dValue,disableKey:t.disableKey,optionArray:t.optionArray,handleCheckBoxChange:e.handleCheckBoxChange,handleSelectChange:e.handleSelectChange},t.name)}))}),(0,p.jsx)(B,{label:g("v_delay"),children:(0,p.jsxs)(O,{name:"delay_sec",value:c,onChange:this.handleRadioChange,children:[(0,p.jsx)(s.ZP,{value:"3",children:"3s"}),(0,p.jsx)(s.ZP,{value:"5",children:"5s"})]})}),(0,p.jsx)(B,{label:g("d_delay"),children:(0,p.jsxs)(O,{name:"desktop_delay_sec",value:d,onChange:this.handleRadioChange,children:[(0,p.jsx)(s.ZP,{value:"0",children:g("d_delay_never")}),(0,p.jsx)(s.ZP,{value:"3",children:"3s"}),(0,p.jsx)(s.ZP,{value:"5",children:"5s"}),(0,p.jsx)(s.ZP,{value:"10",children:"10s"})]})}),(0,p.jsx)(B,{label:g("s_a"),children:(0,p.jsxs)(O,{name:"afterCaptureAction",value:L,onChange:this.handleRadioChange,children:[(0,p.jsx)(s.ZP,{value:"annotate",children:g("s_a_n")}),(0,p.jsx)(s.ZP,{value:"skipAnnotate",children:g("s_a_a")}),(0,p.jsx)(s.ZP,{value:"skipEntireCapture",children:g("s_a_o")})]})})]}),(0,p.jsxs)(R,{title:g("r_section_title"),children:[(0,p.jsxs)(B,{label:g("r_c"),desc:g("r_c_desc"),children:[(0,p.jsx)(r.Z,{min:0,step:1,style:{width:"64px"},value:h,onChange:this.handleCountdownChange})," ","s"]}),(0,p.jsx)(B,{label:g("r_r_mic"),children:(0,p.jsx)(l.Z,{value:"allowRemindMic",checked:K,onChange:this.handleSwitchChange})})]}),(0,p.jsxs)(R,{title:g("s_section_title"),children:[(0,p.jsx)(B,{label:g("d_a"),children:(0,p.jsxs)(O,{value:a,name:"format",onChange:this.handleRadioChange,children:[(0,p.jsx)(s.ZP,{value:"png",children:"PNG"}),(0,p.jsx)(s.ZP,{value:"jpg",children:"JPG"})]})}),(0,p.jsx)(B,{label:g("get_link_google"),children:(0,p.jsx)(l.Z,{value:"googleDriveShare",checked:C,onChange:this.handleSwitchChange})}),(0,p.jsx)(B,{label:g("save_as"),desc:g("save_as_desc"),more:(0,p.jsx)(p.Fragment,{children:(0,p.jsx)(i.Z,{trigger:["focus"],title:"Only letters, numbers, dashes, underscores, and slashes are allowable.  Invalid characters will be removed.",placement:"top",children:(0,p.jsx)(n.Z,{defaultValue:j,onChange:this.handleInputChange.bind(null,"downloadDirectory"),placeholder:"e.g., AwesomeScreenshot",addonBefore:"Downloads/"})})}),children:(0,p.jsx)(l.Z,{value:"saveAs",checked:_,onChange:this.handleSwitchChange})}),(0,p.jsx)(B,{label:g("add_info"),children:(0,p.jsx)(l.Z,{value:"addUrl",checked:E,onChange:this.handleSwitchChange})})]}),(0,p.jsxs)(R,{title:g("m_section_title"),children:[(0,p.jsx)(B,{label:g("default_tab_title"),children:(0,p.jsxs)(O,{value:A,name:"popupTab",onChange:this.handleRadioChange,children:[(0,p.jsx)(s.ZP,{value:"screenshot",children:g("default_tab_c")}),(0,p.jsx)(s.ZP,{value:"record",children:g("default_tab_r")})]})}),(0,p.jsx)(B,{label:g("dark_mode"),children:(0,p.jsx)(l.Z,{value:"darkMode",checked:k,onChange:this.handleSwitchChange})}),(0,p.jsx)(B,{label:g("gmail_icon"),children:(0,p.jsx)(l.Z,{value:"gmailBtn",checked:v,onChange:this.handleSwitchChange})}),(0,p.jsx)(B,{label:g("resize_retina"),children:(0,p.jsx)(l.Z,{value:"resizeForRetina",checked:w,onChange:this.handleSwitchChange})}),(0,p.jsx)(B,{label:g("play_video"),desc:g("play_video_desc"),more:(0,p.jsx)(p.Fragment,{children:D&&(0,p.jsx)("div",{className:"link-expanding-support",children:N.map((function(t){return(0,p.jsx)("div",{className:"support-item ".concat(t),children:(0,p.jsx)(o.Z,{checked:e.state["".concat(t,"ExpandLink")],value:"expand-link-".concat(t),onChange:e.handleCheckBoxChange,children:(0,p.jsx)("div",{className:"support-item-inner ".concat(t)})})},t)}))})}),children:(0,p.jsx)(l.Z,{value:"expandLink",checked:D,onChange:this.handleSwitchChange})})]})]})]})}}])&&b(t.prototype,a),c&&b(t,c),h}(d.Component);h.render((0,p.jsx)(E,{}),document.getElementById("option-page"))}},a={};function n(e){var l=a[e];if(void 0!==l)return l.exports;var r=a[e]={exports:{}};return t[e].call(r.exports,r,r.exports,n),r.exports}n.m=t,e=[],n.O=(t,a,l,r)=>{if(!a){var i=1/0;for(d=0;d<e.length;d++){for(var[a,l,r]=e[d],o=!0,s=0;s<a.length;s++)(!1&r||i>=r)&&Object.keys(n.O).every((e=>n.O[e](a[s])))?a.splice(s--,1):(o=!1,r<i&&(i=r));if(o){e.splice(d--,1);var c=l();void 0!==c&&(t=c)}}return t}r=r||0;for(var d=e.length;d>0&&e[d-1][2]>r;d--)e[d]=e[d-1];e[d]=[a,l,r]},n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var a in t)n.o(t,a)&&!n.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:t[a]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e={728:0};n.O.j=t=>0===e[t];var t=(t,a)=>{var l,r,[i,o,s]=a,c=0;for(l in o)n.o(o,l)&&(n.m[l]=o[l]);if(s)var d=s(n);for(t&&t(a);c<i.length;c++)r=i[c],n.o(e,r)&&e[r]&&e[r][0](),e[i[c]]=0;return n.O(d)},a=self.webpackChunkawesomescreenshot_front=self.webpackChunkawesomescreenshot_front||[];a.forEach(t.bind(null,0)),a.push=t.bind(null,a.push.bind(a))})(),n.O(void 0,[186,91,116,247,347,509,159,242,111],(()=>n(33505)));var l=n.O(void 0,[186,91,116,247,347,509,159,242,111],(()=>n(88010)));l=n.O(l)})();