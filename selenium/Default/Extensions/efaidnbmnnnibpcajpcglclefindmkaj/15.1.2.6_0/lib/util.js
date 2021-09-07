/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property laws,
* including trade secret and or copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
define(["jquery"],(function(e){"use strict";let n={cs:"cs-CZ",da:"da-DK",de:"de-DE",en:"en-US",en_GB:"en-GB",en_US:"en-US",es:"es-ES",fi:"fi-FI",fr:"fr-FR",it:"it-IT",ja:"ja-JP",ko:"ko-KR",nb:"nb-NO",nl:"nl-NL",pl:"pl-PL",pt_BR:"pt-BR",ru:"ru-RU",sv:"sv-SE",tr:"tr-TR",zh_TW:"zh-TW"};return{NMHConnStatus:!0,extend:e.extend.bind(e),getFrictionlessLocale:function(e){return n[e]||null},setNMHConnectionStatus:function(e){this.NMHConnStatus=e},getNMHConnectionStatus:function(){return this.NMHConnStatus},isFF:function(){return!1},isChrome:function(){return!0},stackDelimiter:function(){return"\n"},Deferred:e.Deferred.bind(e),each:e.each.bind(e),ajax:e.ajax.bind(e),ajaxError:function(n){e(document).ajaxError(n)},param:e.param.bind(e),newBlob:function(e){return new Blob(e)},newFormData:function(){return new FormData},newXHR:function(){return new XMLHttpRequest},createTab:function(e,n){return n?chrome.tabs.create({url:e,active:!0},n):chrome.tabs.create({url:e,active:!0})},isDevEnv:function(){var n=e.Deferred();return chrome.management.getSelf((function(e){n.resolve("development"===e.installType)})),n.promise()},closeWindow:function(e){chrome.windows.remove(e.id)},getTranslation:function(e,n){return n?chrome.i18n.getMessage(e,n):chrome.i18n.getMessage(e)},sendMessage:function(e,n){chrome.tabs.sendMessage(e.tabId,e)},consoleLog:function(e){SETTINGS.DEBUG_MODE&&console.log(e)},consoleLogDir:function(e){SETTINGS.DEBUG_MODE&&console.dir(e)},consoleError:function(e){SETTINGS.DEBUG_MODE&&console.error(e)},setCookie:function(e,n,t){try{localStorage.setItem(e,n)}catch(e){}},showFrictionlessMenu:function(e){return!(!SETTINGS.IS_READER&&!SETTINGS.TEST_MODE)||!(!e||!SETTINGS.FRICTIONLESS_ENABLED||0!=e.version&&(1!=e.version||0!=this.NMHConnStatus)&&e.version!=SETTINGS.READER_VER)},getCookie:function(e){try{return localStorage.getItem(e)||""}catch(e){return""}},atob16:function(e){var n,t=atob(e),r=[];for(n=0;n<t.length;n+=2)r.push(String.fromCharCode(t.charCodeAt(n)+256*t.charCodeAt(n+1)));return r.join("")}}}));