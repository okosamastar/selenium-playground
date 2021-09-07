/*
 *  This file is part of Douga-Getter <https://www.douga-getter.com/>
 *  Due to restrictions of Google's terms, downloading videos from YouTube is disabled in this extension.
 */

'use strict';
(function() {
  const _LOG_ = localStorage.log;
  const UA = navigator.userAgent;
  const WebExtensions = UA.includes("Chrome") ? chrome : browser;
  const manifest = WebExtensions.runtime.getManifest();
  const i18n = WebExtensions.i18n;
  const isEdge = UA.includes("Edge");
  const isFirefox = !isEdge && UA.includes("Firefox");
  const isChrome = !isEdge && UA.includes("Chrome");
  const chromeVersion = isChrome && Number((UA.match(/Chrome\/(\d+)/) || [])[1] || 0) || 0;
  const opt_extraInfoSpec = chromeVersion < 72 ? ["blocking", "requestHeaders"] : ["blocking", "requestHeaders", "extraHeaders"];
  const baseURL = "https://www.douga-getter.com/";
  const fileRegexp = initFileRegexp(filetype);
  const mimeToSuffix = filetypeMapper(filetype);
  const videoLists = {};
  const badge = [];
  const downloadRequest = {};
  const systemTabs = {};
  const ignoreTabs = {};
  const tabRelation = {};
  const tab2url = {};
  const actionButton = WebExtensions.browserAction;
  let contextMenus = WebExtensions.contextMenus;
  const sampleScripts = [];
  const LM_SCRIPTS_SIGNATURE = "loadmonkey_scripts";
  const SYSTEM_URL_REGEXP = new RegExp("^https?://(tokyoloader\\.com|www\\.douga-getter\\.com|www\\.fastestle\\.com)/");
  const DISABLE_DOWNLOADING_FROM_YOUTUBE_REGEXP = new RegExp("(^https?://www\\.youtube\\.com/|googlevideo\\.com.+(webm|range)|.gstatic.com/)");
  const FIND_SUFFIX_REGEXP = /^[^?]+?\.([0-9a-zA-Z]+?)(\?.*?)?$/i;
  const asyncRequest = {};
  const watchRequest = {};
  const savedRequestHeaders = {};
  const CMD_GET_SCRIPTS = "cmd_get_scripts";
  const CMD_SAVE_SCRIPTS = "cmd_save_scripts";
  const CMD_SETTING = "cmd_setting";
  const CMD_AUTH = "cmd_auth";
  const CMD_DELEGATE = "cmd_delegate";
  const CMD_GET_VIDEOLIST = "cmd_list";
  const CMD_UPDATE_TAB = "cmd_update_tab";
  const CMD_START_DOWNLOAD = "cmd_start_download";
  const CMD_CANCEL_DOWNLOAD = "cmd_cancel_download";
  const CMD_APPEND_VIDEOS = "cmd_append_videos";
  const CMD_GET_FRAME_ID = "cmd_get_frame_id";
  const CMD_FETCH = "cmd_fetch";
  const CMD_FRAME_TEST = "cmd_frame_test";
  const CMD_HIDE_ALL_VIDEOLIST = "cmd_hide_all_videolist";
  const CMD_OPEN_DOWNLOAD_PAGE = "cmd_open_download_page";
  const CMD_WATCH_HEADERS = "cmd_watch_headers";
  const CMD_WATCH = "cmd_watch";
  const WATCH_LIFETIME = 1000 * 60;
  const NOTIFY_UPDATE_LIST = "notify_update_list";
  const NOTIFY_HIDE_ALL_VIDEOLIST = "notify_hide_all_videolist";
  const NOTIFY_DOWNLOAD_STARTED = "notify_download_started";
  const NOTIFY_DOWNLOAD_COMPLETED = "notify_download_completed";
  const NOTIFY_DOWNLOAD_FAILED = "notify_download_failed";
  const DELEGATED_CMD_READY = "delegated_cmd_ready";
  const DELEGATED_CMD_GET_TITLE = "delegated_cmd_get_title";
  const DELEGATED_CMD_INSERT = "delegated_cmd_insert";
  if (isEdge) {
    const voidFunction = function() {
    };
    actionButton.setTitle = voidFunction;
  }
  console.log(...logGen(null, manifest.name + " " + manifest.version, "start"));
  let option = loadOption();
  let removedTabId = -1;
  clearMemoryCache();
  if (_LOG_) {
    console.log(...logGen(null, "Option", JSON.stringify(option)));
  }
  if (localStorage.counter === undefined) {
    localStorage.counter = localStorage.version ? 50 : 1;
  }
  localStorage.version = manifest.version;
  let mainScript = "";
  let mainCSS = "";
  let LMScripts = {};
  asyncLoad(WebExtensions.runtime.getURL("libs/crypto.js"), function(a) {
    asyncLoad(WebExtensions.runtime.getURL("js/api.js"), function(b) {
      mainScript = a + b;
    });
  });
  asyncLoad(WebExtensions.runtime.getURL("css/api.css"), function(a) {
    mainCSS = a;
  });
  LMScripts = loadScripts();
  loadSampleScripts();
  if (!manifest.permissions.includes("contextMenus")) {
    if (_LOG_) {
      console.log(...logGen(null, "Disable contextMenus", 'permission "contextMenus" not found'));
    }
    contextMenus = {create:function() {
    }, removeAll:function() {
    }};
  }
  WebExtensions.webRequest.onBeforeRequest.addListener(function(details) {
    const url = details.url;
    if (SYSTEM_URL_REGEXP.exec(url)) {
    } else {
      if (downloadRequest[getFlatUrl(url)]) {
      } else {
        deleteTab(details.tabId);
      }
    }
  }, {urls:["<all_urls>"], types:["main_frame"]}, []);
  WebExtensions.webRequest.onBeforeSendHeaders.addListener(function(details) {
    const url = details.url;
    const flatUrl = getFlatUrl(url);
    const downReq = downloadRequest[flatUrl];
    const asyncReq = asyncRequest[flatUrl];
    const watchReq = watchRequest[details.tabId];
    const requestHeaders = details.requestHeaders;
    const target = downReq || asyncReq;
    if (systemTabs[details.tabId]) {
    }
    const requestType = target ? target.cmd ? target.cmd : "downloading" : null;
    if (requestType) {
      if (!downReq) {
        target.requestId = details.requestId;
      }
      const headerKeys = headersNameToLowerCase(requestHeaders);
      for (const key in target.headers) {
        const value = target.headers[key];
        const idx = headerKeys.indexOf(key.toLowerCase());
        if (idx >= 0) {
          if (requestHeaders[idx].value !== value) {
            if (_LOG_) {
              console.log(...logGen(details.tabId, "onBeforeSendHeaders( " + requestType + " )", "Modify requestHeaders => " + key + " : " + value));
            }
            requestHeaders[idx].value = value;
          }
        } else {
          if (_LOG_) {
            console.log(...logGen(details.tabId, "onBeforeSendHeaders( " + requestType + " )", "Append requestHeaders => " + key + " : " + value));
          }
          requestHeaders.push({name:key, value});
        }
      }
      if (requestType === CMD_WATCH_HEADERS) {
        const request = {};
        for (let i = 0, len = requestHeaders.length; i < len; i++) {
          const h = requestHeaders[i];
          request[h.name.toLowerCase()] = h.value;
        }
        asyncReq.watchedHeaders = {request};
      }
      if (_LOG_) {
        console.log(...logGen(details.tabId, "onBeforeSendHeaders( " + requestType + " )", "RequestHeaders : " + JSON.stringify(requestHeaders)));
      }
    }
    if (watchReq && (!watchReq.frameId || watchReq.frameId === details.frameId)) {
      if (url.includes(watchReq.targetString)) {
        const headers = {};
        for (let i = 0, len = requestHeaders.length; i < len; i++) {
          const h = requestHeaders[i];
          headers[h.name] = h.value;
        }
        if (!watchReq.targetHeader || headers[watchReq.targetHeader]) {
          if (_LOG_) {
            console.log(...logGen(details.tabId, "onBeforeSendHeaders( watch )", "find headers : " + JSON.stringify(headers)));
          }
          watchReq.sendResponse({url, headers});
          delete watchRequest[details.tabId];
        }
      }
    }
    return {requestHeaders:requestHeaders};
  }, {urls:["<all_urls>"]}, opt_extraInfoSpec);
  WebExtensions.webRequest.onHeadersReceived.addListener(function(details) {
    const tabId = details.tabId;
    if (systemTabs[tabId] || ignoreTabs[tabId]) {
      return;
    }
    const downReq = downloadRequest[getFlatUrl(details.url)];
    if (downReq && downReq.dlOnly) {
      return;
    }
    const tabUrl = tab2url[details.tabId] || "";
    if (DISABLE_DOWNLOADING_FROM_YOUTUBE_REGEXP.exec(tabUrl) || DISABLE_DOWNLOADING_FROM_YOUTUBE_REGEXP.exec(details.url)) {
      return;
    }
    if (SYSTEM_URL_REGEXP.exec(tabUrl)) {
      return;
    }
    if (!videoLists[details.tabId]) {
      videoLists[details.tabId] = [];
    }
    const list = videoLists[details.tabId];
    for (let i = 0, cnt = list.length; i < cnt; i++) {
      if (list[i].url === details.url) {
        return;
      }
    }
    const statusCode = details.statusCode;
    if (statusCode < 200 || statusCode >= 300) {
      return;
    }
    const video = {rank:0, url:details.url, tabId:details.tabId};
    if (video.url.match(fileRegexp)) {
      video.rank = 1;
    }
    const suffix = FIND_SUFFIX_REGEXP.exec(video.url);
    if (suffix) {
      video.suffix = suffix[1].toLowerCase();
    }
    if (video.suffix === "dll" || video.suffix === "exe") {
      video.suffix = "xxx";
    }
    const responseHeaders = details.responseHeaders;
    const headerKeys = headersNameToLowerCase(responseHeaders);
    let idx = headerKeys.indexOf("content-type");
    if (idx >= 0) {
      const contentType = responseHeaders[idx].value;
      const suffix = mimeToSuffix[contentType];
      if (suffix) {
        video.rank = 2;
        video.suffix = suffix;
      }
      video.contentType = contentType;
    }
    idx = headerKeys.indexOf("content-length");
    if (idx >= 0) {
      const contentLength = Number(responseHeaders[idx].value) || 0;
      if (video.rank === 0 && option.pass_large && contentLength >= 10485760) {
        video.rank = 2;
      }
      video.contentLength = contentLength;
    }
    if (!video.contentLength) {
      if (!video.contentType) {
        return;
      }
      video.contentLength = 0;
    }
    if (video.contentType && !video.suffix) {
      video.suffix = (video.contentType.match(/[^/]+$/) || [])[0];
    }
    if (!video.suffix) {
      video.suffix = "unknown";
    }
    if (!video.contentType) {
      video.contentType = "unknown";
    }
    video.txt = null;
    const isVideoIndex = video.contentType.match(/mpegURL/i) || video.suffix.match(/^(m3u8|f4m)$/);
    const isTS = video.contentType.match(/mp2t/i) || video.suffix.match(/^(ts|tsv|tsa)$/);
    if (isTS && option.ignore_ts) {
      return;
    }
    if (!isVideoIndex && !isTS && option.ignore_small && (video.contentLength > 0 && video.contentLength < 2097152)) {
      return;
    }
    if (video.rank > 0) {
      appendVideo(video, true);
    }
  }, {urls:["<all_urls>"]}, ["responseHeaders"]);
  WebExtensions.webRequest.onHeadersReceived.addListener(function(details) {
    const responseHeaders = details.responseHeaders;
    const headerKeys = headersNameToLowerCase(responseHeaders);
    const statusCode = details.statusCode;
    const isRedirect = statusCode >= 300 && statusCode < 400;
    const flatUrl = getFlatUrl(details.url);
    const downReq = downloadRequest[flatUrl];
    const asyncReq = asyncRequest[flatUrl];
    const locationIdx = headerKeys.indexOf("location");
    if (isRedirect && locationIdx >= 0) {
      let redirectUrl = responseHeaders[locationIdx].value;
      const list = videoLists[details.tabId];
      if (list) {
        for (let i = 0, cnt = list.length; i < cnt; i++) {
          const v = list[i];
          if (v.url === details.url) {
            if (_LOG_) {
              console.log(...logGen(details.tabId, "onHeadersReceived", "videoList update : " + v.url.substr(0, 100) + " to " + redirectUrl.substr(0, 100)));
            }
            v.url = redirectUrl;
          }
        }
      }
      const newFlatUrl = getFlatUrl(redirectUrl);
      if (downReq) {
        if (_LOG_) {
          console.log(...logGen(details.tabId, "onHeadersReceived", "downloadRequest update : " + flatUrl.substr(0, 100) + " to " + newFlatUrl.substr(0, 100)));
        }
        delete downloadRequest[flatUrl];
        downReq.url = redirectUrl;
        downloadRequest[newFlatUrl] = downReq;
      }
      if (asyncReq) {
        if (_LOG_) {
          console.log(...logGen(details.tabId, "onHeadersReceived", "asyncReq[" + asyncReq.cmd + "] update : " + flatUrl.substr(0, 100) + " to " + newFlatUrl.substr(0, 100)));
        }
        delete asyncRequest[flatUrl];
        asyncReq.url = redirectUrl;
        asyncRequest[newFlatUrl] = asyncReq;
      }
      return;
    }
    if (asyncReq) {
      if (asyncReq.cmd === CMD_WATCH_HEADERS) {
        const res = {};
        for (let i = 0, len = headerKeys.length; i < len; i++) {
          res[headerKeys[i]] = responseHeaders[i].value;
        }
        if (!asyncReq.watchedHeaders) {
          asyncReq.watchedHeaders = {request:{}};
        }
        asyncReq.watchedHeaders.response = res;
        asyncReq.sendResponse(asyncReq.watchedHeaders);
        delete asyncRequest[flatUrl];
      }
    }
    if (downReq) {
      const setHeader = function(key, value) {
        const idx = headerKeys.indexOf(key.toLowerCase());
        if (idx >= 0) {
          responseHeaders[idx].value = value;
        } else {
          responseHeaders.push({name:key, value});
        }
      };
      if (downReq.filename) {
        let safeFileName = downReq.filename.replace(/^\./, "_").replace(/[\\\/:\*\?'"<>|]/g, "");
        const _tmp = safeFileName.match(/(.+)(\..+?)$/);
        if (_tmp) {
          safeFileName = _tmp[1].substr(0, 200) + _tmp[2];
        }
        const encodedFileName = encodeURIComponent(safeFileName);
        const attachmentValue = "attachment; filename*=UTF-8''" + encodedFileName;
        setHeader("Content-Disposition", attachmentValue);
        if (isFirefox && downReq.filetype === "stream") {
        } else {
          setHeader("Content-Type", "application/octet-stream");
        }
      }
      if (_LOG_) {
        console.log(...logGen(details.tabId, "onHeadersReceived( downloading )", "ResponseHeaders : " + JSON.stringify(responseHeaders)));
      }
      return {responseHeaders:responseHeaders};
    }
  }, {urls:["<all_urls>"]}, ["responseHeaders", "blocking"]);
  WebExtensions.webRequest.onResponseStarted.addListener(function(details) {
    if (details.type === "media") {
      return;
    }
    const downReq = downloadRequest[getFlatUrl(details.url)];
    if (downReq) {
      downReq.requestId = details.requestId;
      if (systemTabs[downReq.tabId]) {
        if (_LOG_) {
          console.log(...logGen(details.tabId, "onResponseStarted", "download started, URL : " + details.url));
        }
        WebExtensions.tabs.sendMessage(downReq.tabId, {cmd:NOTIFY_DOWNLOAD_STARTED, request:downReq}, handleError);
      }
    }
  }, {urls:["<all_urls>"]}, ["responseHeaders"]);
  WebExtensions.webRequest.onCompleted.addListener(function(details) {
    if (details.type === "media") {
      return;
    }
    const flatUrl = getFlatUrl(details.url);
    const downReq = downloadRequest[flatUrl];
    const asyncReq = asyncRequest[flatUrl];
    if (downReq && downReq.requestId === details.requestId) {
      if (systemTabs[downReq.tabId]) {
        if (_LOG_) {
          console.log(...logGen(details.tabId, "onCompleted", "download completed, URL : " + details.url));
        }
        if (details.url.includes(".m3u8")) {
          asyncLoad(details.url, function(txt) {
            WebExtensions.tabs.sendMessage(downReq.tabId, {cmd:NOTIFY_DOWNLOAD_COMPLETED, request:downReq, result:txt}, handleError);
          });
        } else {
          WebExtensions.tabs.sendMessage(downReq.tabId, {cmd:NOTIFY_DOWNLOAD_COMPLETED, request:downReq}, handleError);
        }
      }
      delete downloadRequest[flatUrl];
    }
    if (asyncReq && asyncReq.cmd === CMD_GET_FRAME_ID) {
      asyncReq.sendResponse(details.frameId);
      delete asyncRequest[flatUrl];
    }
  }, {urls:["<all_urls>"]}, ["responseHeaders"]);
  WebExtensions.webRequest.onErrorOccurred.addListener(function(details) {
    if (details.type === "media") {
      return;
    }
    const downReq = downloadRequest[getFlatUrl(details.url)];
    if (downReq) {
      if (downReq.requestId === details.requestId) {
        if (_LOG_) {
          console.log(...logGen(details.tabId, "onErrorOccurred", "download failed, URL : " + details.url));
        }
        if (systemTabs[downReq.tabId]) {
          WebExtensions.tabs.sendMessage(downReq.tabId, {cmd:NOTIFY_DOWNLOAD_FAILED, request:downReq}, handleError);
        }
        delete downloadRequest[getFlatUrl(details.url)];
      }
      if (downReq.requestId == null) {
        if (details.error === "NS_BINDING_ABORTED") {
          if (_LOG_) {
            console.log(...logGen(details.tabId, "onErrorOccurred", "NOTE : ignore NS_BINDING_ABORTED ( " + details.error + " , " + getFlatUrl(details.url) + " )"));
          }
        } else {
          delete downloadRequest[getFlatUrl(details.url)];
        }
      }
    }
  }, {urls:["<all_urls>"]});
  function clearMemoryCache() {
    const onFlushed = function() {
      if (_LOG_) {
        console.log(...logGen(null, "clearMemoryCache", "In-memory cache flushed"));
      }
    };
    const onError = function(error) {
      if (_LOG_) {
        console.log(...logGen(null, "clearMemoryCache", "Error: " + error));
      }
    };
    const flushingCache = WebExtensions.webRequest.handlerBehaviorChanged();
    if (flushingCache) {
      flushingCache.then(onFlushed, onError).catch(onError);
    }
  }
  let visibleFlag = false;
  function contextReload(tabId) {
    if (!visibleFlag) {
      const list = videoLists[tabId];
      if (list) {
        contextMenus.create({"title":i18n.getMessage("context_menu_found_video"), "contexts":["all"], "onclick":popupOpen});
        visibleFlag = true;
      }
    }
  }
  function contextClear() {
    contextMenus.removeAll();
    visibleFlag = false;
  }
  WebExtensions.tabs.onActivated.addListener(function(activeInfo) {
    if (handleError()) {
      return;
    }
    contextClear();
    if (activeInfo) {
      contextReload(activeInfo.tabId);
    }
  });
  WebExtensions.windows.onFocusChanged.addListener(function(WindowId) {
    WebExtensions.tabs.query({active:true}, function(tabs) {
      if (handleError()) {
        return;
      }
      const tab = tabs && tabs[0];
      contextClear();
      if (tab && tab.id >= 0) {
        contextReload(tab.id);
      }
    });
  });
  actionButton.onClicked.addListener(function(tab) {
    if (tab) {
      if (systemTabs[tab.id]) {
        WebExtensions.tabs.remove(tab.id, handleError);
      } else {
        openDownloadTab(tab);
      }
    }
  });
  function popupOpen() {
    WebExtensions.tabs.query({active:true}, function(tabs) {
      if (handleError()) {
        return;
      }
      const tab = tabs && tabs[0];
      if (tab) {
        if (systemTabs[tab.id]) {
          WebExtensions.tabs.remove(tab.id, handleError);
        } else {
          openDownloadTab(tab);
        }
      }
    });
  }
  function badgeReload(tabId) {
    actionButton.show ? actionButton.show(tabId) : actionButton.enable(tabId);
    const drawDefault = function() {
      actionButton.setTitle({tabId:tabId, title:i18n.getMessage("action_button_no_video")});
      actionButton.setIcon({tabId:tabId, path:"images/default_16px_normal.png"});
    };
    const drawClose = function() {
      actionButton.setTitle({tabId:tabId, title:i18n.getMessage("action_button_close_tab")});
      actionButton.setIcon({tabId:tabId, path:"images/default_16px_normal_rotate.png"});
    };
    const drawScripting = function() {
      actionButton.setTitle({tabId:tabId, title:"Open ScriptEditor"});
      actionButton.setIcon({tabId:tabId, path:"images/scripting_16px_normal.png"});
    };
    const url = tab2url[tabId];
    if (systemTabs[tabId]) {
      return drawClose();
    } else {
      if (!badge[tabId] || badge[tabId] == 0) {
        return drawDefault();
      }
    }
    const num = Math.min(Math.max(badge[tabId], 1), 6);
    actionButton.setIcon({tabId:tabId, path:"images/found_16px_normal_" + num + ".png"});
    actionButton.setTitle({tabId:tabId, title:i18n.getMessage("action_button_found_video")});
  }
  function appendVideo(video, reload) {
    const tabId = video.tabId;
    if (!videoLists[tabId]) {
      videoLists[tabId] = [];
    }
    const list = videoLists[tabId];
    list.push(video);
    if (!badge[tabId]) {
      badge[tabId] = 0;
    }
    if (badge[tabId] < 99) {
      badge[tabId]++;
    }
    if (reload) {
      if (tabId >= 0) {
        badgeReload(tabId);
      }
      WebExtensions.tabs.query({active:true}, function(tabs) {
        if (handleError()) {
          return;
        }
        const tab = tabs && tabs[0];
        if (tab && tab.id >= 0) {
          contextReload(tab.id);
          if (tabId < 0) {
            video.tabId = tab.id;
            badgeReload(video.tabId);
          }
        }
      });
    }
    if (tabRelation[tabId]) {
      WebExtensions.tabs.sendMessage(tabRelation[tabId].id, {cmd:NOTIFY_UPDATE_LIST, video:video}, handleError);
    }
  }
  function encodeDLQuery(tabId) {
    let cnt = 0;
    let s = "";
    const list = videoLists[tabId] || [];
    for (let i = 0, len = list.length; i < len; i++) {
      const o = list[i];
      const contL = 0 | o.contentLength / 1024;
      const t = findFileType(o.contentType);
      const e = findFileExt(o.suffix);
      s += base62.encode(contL) + "," + (t != -1 ? base62.encode(t) : o.contentType) + "," + (e != -1 ? base62.encode(e) : o.suffix) + ",";
      cnt++;
      if (cnt == 5) {
        break;
      }
    }
    return btoa(base62.encode(tabId) + "," + base62.encode(cnt) + "," + s);
  }
  function decodeDLQuery(s) {
    const o = {};
    const b = atob(s);
    const v = b.split(",");
    o.tabId = base62.decode(v[0]);
    o.cnt = base62.decode(v[1]);
    o.src = [];
    for (let i = 2, len = 2 + o.cnt * 3; i < len;) {
      const params = {};
      params.contentLength = base62.decode(v[i]) * 1024;
      i++;
      params.contentType = v[i].length >= 3 ? v[i] : filetype[base62.decode(v[i])].mime;
      i++;
      params.suffix = v[i].length >= 3 ? v[i] : filetype[base62.decode(v[i])].ext;
      i++;
      o.src.push(params);
    }
    return o;
  }
  function openDownloadTab(tab) {
    if (tab && tab.id >= 0) {
      const hash = toHash(tab.url);
      if (tab.url.startsWith("chrome://extensions/") || tab.url.startsWith("about:addons")) {
        WebExtensions.tabs.create({url:WebExtensions.runtime.getURL("script-list.html"), index:tab.index + 1, active:true});
      } else {
        if (!hash || SYSTEM_URL_REGEXP.exec(tab.url)) {
        } else {
          if (tabRelation[tab.id]) {
            WebExtensions.tabs.update(tabRelation[tab.id].id, {active:true}, handleError);
          } else {
            const q = encodeDLQuery(tab.id);
            let siteinfoURL = baseURL + "loader.html" + "?site=" + hash.h + "&q=" + q;
            if (false) {
              WebExtensions.tabs.create({url:siteinfoURL, index:tab.index + 1, active:true}, function(newTab) {
                if (handleError()) {
                  return;
                }
                tabRelation[tab.id] = newTab;
              });
            } else {
              WebExtensions.tabs.create({url:siteinfoURL, index:tab.index + 1, active:false}, function(newTab) {
                if (handleError()) {
                  return;
                }
                if (_LOG_) {
                  console.log(...logGen(tab.id, "openDownloadTab", "tabId relation : " + tab.id + " => " + newTab.id));
                }
                newTab.url = siteinfoURL;
                tabRelation[tab.id] = newTab;
                setTimeout(function() {
                  WebExtensions.tabs.update(tabRelation[tab.id].id, {active:true}, handleError);
                }, 250);
                systemTabs[newTab.id] = true;
                localStorage.counter = (Number(localStorage.counter) || 50) + 1;
              });
            }
          }
        }
      }
      const now = (new Date).getTime();
      if (now - option.last_access > 24 * 60 * 60 * 1000) {
        option.last_access = now;
        saveOption();
      }
    }
  }
  function deleteTab(tabId) {
    if (!tab2url[tabId]) {
      return;
    }
    let backTo = -1;
    delete videoLists[tabId];
    if (badge[tabId]) {
      delete badge[tabId];
    }
    contextClear();
    if (tabRelation[tabId]) {
      WebExtensions.tabs.sendMessage(tabRelation[tabId].id, {cmd:NOTIFY_UPDATE_LIST, video:null}, handleError);
      delete tabRelation[tabId];
    }
    for (let k in tabRelation) {
      if (tabRelation[k].id === tabId) {
        delete tabRelation[k];
        backTo = k;
        break;
      }
    }
    removedTabId = tabId;
    delete systemTabs[tabId];
    delete tab2url[tabId];
    delete ignoreTabs[tabId];
    return backTo;
  }
  WebExtensions.tabs.onUpdated.addListener(function(tabId, change, tab) {
    if (handleError()) {
      return;
    }
    if (change.status === "loading") {
      const url = tab.url;
      if (!url.startsWith("http")) {
        return;
      }
      if (_LOG_) {
        console.log(...logGen(tabId, "onUpdated", tab.url));
      }
      if (isFirefox) {
        if (getReversalTabRelationId(tabId)) {
          tabRelation[getReversalTabRelationId(tabId)] = tab;
        }
      }
      tab2url[tabId] = url;
      if (url.includes(baseURL)) {
        systemTabs[tabId] = true;
      }
      let match = null;
      for (const sid in LMScripts) {
        const script = LMScripts[sid];
        if (script.enabled && script.siteRE.exec(url)) {
          if (_LOG_) {
            console.log(...logGen(tabId, "onUpdated", 'Execute Script "' + sid + "(ver" + script.version + ')" to ' + url));
          }
          const opt = "this.option=" + JSON.stringify(option) + ";";
          WebExtensions.tabs.insertCSS(tabId, {code:mainCSS}, handleError);
          WebExtensions.tabs.executeScript(tabId, {code:wrapScript(opt + mainScript + script.script)}, handleError);
          match = sid;
        }
      }
      if (match) {
        ignoreTabs[tabId] = true;
      }
      badgeReload(tabId);
    }
  });
  WebExtensions.tabs.onRemoved.addListener(function(tabId) {
    if (handleError()) {
      return;
    }
    const rootId = parseInt(deleteTab(tabId));
    if (rootId >= 0) {
      WebExtensions.tabs.update(rootId, {active:true}, handleError);
    }
  });
  WebExtensions.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    const {cmd, params} = message;
    const tabId = sender.tab && sender.tab.id;
    if (_LOG_) {
      console.log(...logGen(tabId, "onMessage", JSON.stringify(message)));
    }
    if (cmd === CMD_DELEGATE) {
      const target = message.target;
      const r = tabRelation[target];
      if (r) {
        WebExtensions.tabs.sendMessage(target, params, function(result) {
          if (handleError()) {
            return;
          }
          sendResponse(result);
        });
        return true;
      } else {
        sendResponse(-1);
      }
    } else {
      if (cmd === CMD_APPEND_VIDEOS) {
        const {videos} = params;
        if (tabId && videos) {
          for (let i = 0, len = videos.length; i < len; i++) {
            const v = videos[i];
            v.rank = 1;
            v.tabId = tabId;
            if (v.txt === "alt_ts") {
              v.txt = i18n.getMessage("append_videos");
            } else {
              if (!v.txt) {
                v.txt = "\u30b9\u30af\u30ea\u30d7\u30c8\u306b\u3088\u3063\u3066\u751f\u6210\u3055\u308c\u305fURL\u3067\u3059";
              }
            }
            if (v.contentType) {
              const filetypeIdx = findFileType(v.contentType);
              v.suffix = filetypeIdx != -1 ? filetype[filetypeIdx].ext : (v.contentType.match(/[^\/]+$/) || [])[0] || "unknown";
            } else {
              v.contentType = "x";
              v.suffix = "x";
            }
            appendVideo(v, i == len - 1);
          }
        }
        sendResponse();
      } else {
        if (cmd === CMD_GET_VIDEOLIST) {
          const list = videoLists[getReversalTabRelationId(tabId)];
          sendResponse({list:list || [], option:localStorage.option, version:localStorage.version});
        } else {
          if (cmd === CMD_START_DOWNLOAD) {
            const {url} = params;
            downloadRequest[getFlatUrl(url)] = message.params;
            sendResponse();
          } else {
            if (cmd === CMD_CANCEL_DOWNLOAD) {
              const {url} = params;
              delete downloadRequest[getFlatUrl(url)];
              sendResponse();
            } else {
              if (cmd === CMD_SETTING) {
                const {operation, key, value} = params;
                if (operation === "get") {
                  sendResponse(option);
                } else {
                  if (operation === "set") {
                    option[key] = value;
                    saveOption();
                    sendResponse();
                  }
                }
              } else {
                if (cmd === CMD_UPDATE_TAB) {
                  const {tabId, properties} = params;
                  const r = tabRelation[tabId];
                  if (r) {
                    WebExtensions.tabs.update(tabId, properties, handleError);
                  }
                  sendResponse();
                } else {
                  if (cmd === CMD_AUTH) {
                    const {tabId} = params;
                    const r = tabRelation[tabId];
                    if (r) {
                      const tabInfo = {id:r.id, url:r.url, rootTabId:tabId, rootTabUrl:tab2url[tabId]};
                      sendResponse(tabInfo);
                    } else {
                      sendResponse();
                    }
                  } else {
                    if (cmd === CMD_WATCH_HEADERS) {
                      const {url, headers} = params;
                      asyncRequest[getFlatUrl(url)] = {cmd, url, headers, sendResponse};
                      return true;
                    } else {
                      if (cmd === CMD_WATCH) {
                        const {frameId, targetString, targetHeader} = params;
                        watchRequest[tabId] = {frameId, targetString, targetHeader, sendResponse};
                        setTimeout(function() {
                          delete watchRequest[tabId];
                        }, WATCH_LIFETIME);
                        return true;
                      } else {
                        if (cmd === CMD_GET_SCRIPTS) {
                          sendResponse(LMScripts);
                        } else {
                          if (cmd === CMD_SAVE_SCRIPTS) {
                            const err = restructScripts(message.scripts);
                            if (err) {
                              sendResponse({err});
                            } else {
                              LMScripts = message.scripts;
                              sendResponse({LMScripts});
                              saveScripts();
                            }
                          } else {
                            if (cmd === CMD_GET_FRAME_ID) {
                              const {url, headers} = params;
                              asyncRequest[getFlatUrl(url)] = {cmd, url, sendResponse};
                              return true;
                            } else {
                              if (cmd === CMD_FRAME_TEST) {
                                const {frameId, code} = params;
                                WebExtensions.tabs.executeScript(tabId, {code, frameId, runAt:"document_idle"}, function(results) {
                                  sendResponse(results);
                                });
                                return true;
                              } else {
                                if (cmd === CMD_HIDE_ALL_VIDEOLIST) {
                                  const tabId = sender.tab.id;
                                  if (tabRelation[tabId]) {
                                    WebExtensions.tabs.sendMessage(tabRelation[tabId].id, {cmd:NOTIFY_HIDE_ALL_VIDEOLIST}, handleError);
                                  }
                                  if (videoLists[tabId]) {
                                    delete videoLists[tabId];
                                  }
                                  if (badge[tabId]) {
                                    delete badge[tabId];
                                  }
                                  sendResponse();
                                } else {
                                  if (cmd === CMD_OPEN_DOWNLOAD_PAGE) {
                                    openDownloadTab(sender.tab);
                                    sendResponse();
                                  } else {
                                    if (cmd === CMD_FETCH) {
                                      const {url, method, headers, resultType} = params;
                                      const init = {method:method || "GET", mode:"cors", credentials:"include"};
                                      if (headers) {
                                        init.headers = new Headers(headers);
                                      }
                                      fetch(url, init).then(function(response) {
                                        return response[resultType || "text"]();
                                      }).then(function(text) {
                                        sendResponse(text);
                                      }).catch(function(error) {
                                        if (_LOG_) {
                                          console.log(...logGen(tabId, "onMessage( cmd_fetch )", "error " + error.message));
                                        }
                                      });
                                      return true;
                                    } else {
                                      if (_LOG_) {
                                        console.log(...logGen(tabId, "onMessage", "Command not defined : " + message.cmd));
                                      }
                                      sendResponse();
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  function getReversalTabRelationId(tabId) {
    for (let k in tabRelation) {
      if (tabRelation[k].id === tabId) {
        return k;
      }
    }
    return null;
  }
  function loadOption() {
    const i = localStorage.option;
    let o = {pass_large:true, ignore_small:true, ignore_ts:true, ts_parallel:1, show_icon_on_thumbnail:!baseURL.includes("douga-getter"), last_access:0, num:createNum(), one:createOne()};
    try {
      if (i) {
        o = Object.assign(o, JSON.parse(i));
      }
      localStorage.option = JSON.stringify(o);
    } catch (e) {
    }
    return o;
  }
  function saveOption() {
    localStorage.option = JSON.stringify(option);
  }
  function headersNameToLowerCase(headers) {
    const r = [];
    for (let i = 0, len = headers.length; i < len; i++) {
      r[i] = headers[i].name.toLowerCase();
    }
    return r;
  }
  function loadSampleScripts() {
    for (let i = 0, len = sampleScripts.length; i < len; i++) {
      asyncLoad(WebExtensions.runtime.getURL("samples/" + sampleScripts[i].replace(/,/g, ".") + ".js"), function(script) {
        const o = parseScript(script);
        if (o && (!LMScripts[o.id] || LMScripts[o.id].version < o.version)) {
          o.bundled = true;
          o.enabled = LMScripts[o.id] ? LMScripts[o.id].enabled : true;
          LMScripts[o.id] = o;
        }
      });
    }
  }
  function parseScript(script) {
    const id = (script.match(/@id\s+([\w,\+\-]+)/) || [])[1];
    const version = Number((script.match(/@version\s+(.+)/) || [])[1] || 0);
    const site = (script.match(/@match\s+(.+)/) || [])[1];
    const embedded = (script.match(/@embedded\s+(.+)/) || [])[1];
    if (site && site.match(/^https?:\/\//)) {
      const s = "(" + site.replace(/https?:\/\//g, "^https?://").replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\s/g, "").replace(/,/g, "|") + ")";
      const siteRE = new RegExp(s);
      return {id, version, siteRE, site, script, embedded};
    }
    return null;
  }
  function restructScripts(src) {
    for (const k in src) {
      const s = src[k];
      const o = parseScript(s.script);
      if (!o || o.id !== k) {
        return s.id;
      }
      o.bundled = sampleScripts.includes(k);
      o.enabled = s.enabled;
      src[k] = o;
    }
    return null;
  }
  function updateAllSitesRE(src) {
    let allRE = "^https?://(";
    for (const k in src) {
      const site = (src[k].script.match(/@match\s+(.+)/) || [])[1];
      allRE = allRE + "(" + site.replace(/https?:\/\//g, "").replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\s/g, "").replace(/,/g, "|") + ")" + "|";
    }
    allRE = allRE + ")";
    allSitesRE = new RegExp(allRE);
  }
  function wrapScript(s) {
    const scriptOptions = {};
    return "if(!window._once_){const scriptOptions=" + JSON.stringify(scriptOptions) + ";" + s + "}window._once_=true;";
  }
  function loadScripts() {
    const i = localStorage[LM_SCRIPTS_SIGNATURE];
    let o = {};
    try {
      if (i) {
        o = Object.assign(o, JSON.parse(i));
      }
      localStorage[LM_SCRIPTS_SIGNATURE] = JSON.stringify(o);
    } catch (e) {
    }
    restructScripts(o);
    return o;
  }
  function saveScripts() {
    localStorage[LM_SCRIPTS_SIGNATURE] = JSON.stringify(LMScripts);
  }
  function createNum() {
    return Math.floor(Math.random() * 1000);
  }
  function createOne() {
    const C = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const cl = C.length;
    let r = "";
    for (let i = 0; i < 8; i++) {
      r += C.charAt(Math.floor(Math.random() * cl));
    }
    return r;
  }
  function asyncLoad(url, callback) {
    const init = {method:"GET", mode:"cors", credentials:"include"};
    fetch(url, init).then(function(response) {
      return response.text();
    }).then(function(text) {
      if (callback) {
        callback(text);
      }
    }).catch(function(error) {
      if (_LOG_) {
        console.log(...logGen(null, "asyncLoad", "error " + error.message + " : " + url));
      }
    });
  }
  function logColor(tabId) {
    const _r = tabId % 64;
    return "color:#" + ((_r >> 4 & 3) << 22 | (_r >> 2 & 3) << 14 | (_r & 3) << 6 | 1048576).toString(16);
  }
  function logGen(tabId, eventName, message) {
    if (tabId) {
      return ["tabId %c" + tabId + "%c [" + eventName + "]%c " + message, logColor(tabId), "color:#f60b91", ""];
    } else {
      return ["%c%c[" + eventName + "]%c " + message, logColor(tabId), "color:#f60b91", ""];
    }
  }
  function toHash(u) {
    const m = u.match(/^https?:\/\/([^\/]+)(.+)/);
    if (m) {
      let j;
      let d = m[1];
      const l = d.length;
      let h = 0;
      let rh = 0;
      const p = m[2];
      let x = 4294967295;
      for (j = 0; j < l; j++) {
        h += d.charCodeAt(j) << j * 4;
        rh += d.charCodeAt(l - j - 1) << j * 4;
      }
      if (p.length >= 8) {
        x = h;
        for (j = 0; j < 8; j++) {
          x += p.charCodeAt(j) << j * 4;
        }
      }
      return {u:m[1], h:h.toString(16), rh:rh.toString(16), x:x.toString(16)};
    }
    return null;
  }
  function getFlatUrl(url) {
    return url.replace(/^https?:/, "").replace(/[^A-Za-z0-9]/g, "X");
  }
  function filetypeMapper(ft) {
    const ret = {};
    for (let i = 0, len = ft.length; i < len; i++) {
      ret[ft[i].mime] = ft[i].ext;
    }
    return ret;
  }
  function handleError() {
    if (WebExtensions.runtime.lastError) {
      if (_LOG_) {
        console.log(...logGen(null, "chrome.runtime.lastError", WebExtensions.runtime.lastError.message));
      }
      return true;
    }
    return false;
  }
})();

