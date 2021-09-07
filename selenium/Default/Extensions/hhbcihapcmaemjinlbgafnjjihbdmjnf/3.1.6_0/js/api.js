/*
 *  This file is part of Douga-Getter <https://www.douga-getter.com/>
 *  Due to restrictions of Google's terms, downloading videos from YouTube is disabled in this extension.
 */

'use strict';
(function(globals) {
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
  const MODE_TOKYOLOADER = globals.option.show_icon_on_thumbnail;
  Object.assign(globals, {LM_Register, LM_Get, LM_Get_X, LM_Head, LM_AppendVideo, LM_AppendVideoSequence, LM_ModifyRequest, LM_WatchRequest, LM_TempFrame, LM_Message});
  const WebExtensions = navigator.userAgent.includes("Chrome") ? chrome : browser;
  const isFirefox = navigator.userAgent.includes("Firefox");
  const isEdge = false;
  const canFetchStream = isFirefox ? false : true;
  const SIGNATURE = "loadmonkey";
  let _callback = null;
  let _attached = {};
  let _icon = {};
  let _pendings = {};
  let _DEBUG_ = 0;
  function LM_Register(params) {
    const availableParams = ["videoId", "title", "icons", "bottomIcon", "option", "onClick", "debug"];
    for (const key in params) {
      if (!availableParams.includes(key)) {
        console.log(...logGen("LM_Register", 'error : invalid params "' + key + '"'));
        return;
      }
    }
    const videoIdFinder = params.videoId;
    const bottomIconParams = params.bottomIcon;
    const titleFinder = params.title;
    const iconsFinder = params.icons instanceof Array ? params.icons : [params.icons];
    const option = (params.option || []).map(function(o) {
      return o.trim().toLowerCase();
    });
    _DEBUG_ = params.debug;
    if (_DEBUG_) {
      console.log(...logGen("LM_Register", "params => " + JSON.stringify(params)));
    }
    if (_DEBUG_) {
      console.log(...logGen("LM_Register", "Option.show_icon_on_thumbnail => " + MODE_TOKYOLOADER));
    }
    const getVideoId = function(str) {
      if (videoIdFinder instanceof RegExp) {
        const r = videoIdFinder.exec(str);
        if (r) {
          for (let i = r.length - 1; 0 <= i; i--) {
            if (r[i]) {
              return r[i];
            }
          }
        }
      } else {
        if (videoIdFinder instanceof Function) {
          return videoIdFinder(str);
        }
      }
      return null;
    };
    if (MODE_TOKYOLOADER) {
      let checked = [];
      const f = function(refresh) {
        if (_DEBUG_) {
          console.log(...logGen("LM_Register", "\u30b5\u30e0\u30cd\u30a4\u30eb\u306b\u30a2\u30a4\u30b3\u30f3\u3092\u8868\u793a\u3057\u307e\u3059\uff08" + (refresh ? "\u30da\u30fc\u30b8\u304c\u30ea\u30d5\u30ec\u30c3\u30b7\u30e5\u3055\u308c\u305f\u305f\u3081" : "DOM\u304c\u5909\u66f4\u3055\u308c\u305f\u305f\u3081") + ")"));
        }
        if (refresh) {
          checked = [];
          _icon = {};
          _attached = {};
          _pendings = {};
        }
        const playingId = getVideoId(location.href);
        let bottomIcon = document.querySelector("." + SIGNATURE + "Bottom");
        if (bottomIcon && refresh) {
          document.body.removeChild(bottomIcon);
          bottomIcon = null;
        }
        const isPlayerPage = bottomIconParams ? bottomIconParams.query() : true;
        if (!bottomIcon && playingId && isPlayerPage) {
          const on = bottomIconParams ? bottomIconParams.on : "click";
          const icon = LM_GetIcon({id:playingId, type:"bottom", on});
          const insert_pos = document.body.firstChild;
          insert_pos.parentNode.insertBefore(icon.container, insert_pos);
        }
        const list = [];
        for (let i = 0, len = iconsFinder.length; i < len; i++) {
          const pos = iconsFinder[i];
          if (pos) {
            list.push({query:pos.query, putAt:function(target, icon) {
              pos.at = pos.at || 1;
              if (pos.at instanceof Function) {
                pos.at(target, icon);
              } else {
                if (typeof pos.at === "number") {
                  const n = pos.at, p = "parentNode";
                  let t = target;
                  t = n == 2 ? t[p] : n == 3 ? t[p][p] : n == 4 ? t[p][p][p] : n == 5 ? t[p][p][p][p] : t;
                  if (!t.parentNode.querySelector("." + SIGNATURE)) {
                    t.parentNode.style.position = "relative";
                    t.parentNode.insertBefore(icon.container, t);
                  }
                }
              }
              icon.button.style.margin = (pos.y || 0) + "px 0 0 " + (pos.x || 0) + "px";
            }, iconSize:pos.size || "small", zIndex:pos.z});
          }
        }
        for (let i = 0, len = list.length; i < len; i++) {
          const page = list[i];
          const o = extendedCSSSelectorAll(document, page.query);
          if (_DEBUG_) {
            console.log(...logGen("LM_Register", "\u6307\u5b9a\u3055\u308c\u305ficons(" + page.query + ")\u306b\u30de\u30c3\u30c1\u3059\u308ba\u30bf\u30b0\u304c" + o.length + "\u500b\u307f\u3064\u304b\u308a\u307e\u3057\u305f"));
          }
          for (let n = 0, cnt = o.length; n < cnt; n++) {
            const target = o[n];
            if (_DEBUG_ > 1) {
              console.log(...logGen("LM_Register", "match(" + (n + 1) + "/" + cnt + ")" + (checked.includes(target) ? "\u30c1\u30a7\u30c3\u30af\u6e08\u307f" : "") + " , " + target, checked.includes(target) ? "gray" : null));
            }
            if (!checked.includes(target)) {
              checked.push(target);
              const id = getVideoId(target.href);
              if (_DEBUG_) {
                console.log(...logGen("LM_Register", "id" + id));
              }
              if (id) {
                let title = "no-title";
                try {
                  title = titleFinder && titleFinder(target);
                } catch (e) {
                  console.log(...logGen("LM_Register", "\u30bf\u30a4\u30c8\u30eb\u691c\u51fa\u6642\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f title( " + titleFinder.toString() + " ) , " + e.message));
                }
                const icon = LM_GetIcon({id, type:page.iconSize, params:{zIndex:page.zIndex}, attached:{title}});
                page.putAt(target, icon);
                if (_DEBUG_) {
                  console.log(...logGen("LM_Register", "\u30a2\u30a4\u30b3\u30f3\u3092\u8ffd\u52a0\u3057\u307e\u3057\u305f " + target));
                }
              }
            }
          }
        }
      };
      interval(f);
      _callback = params.onClick;
    } else {
      const f = function(onUrlChanged) {
        if (!onUrlChanged) {
          return;
        }
        const id = getVideoId(location.href);
        if (!id) {
          return;
        }
        (async function() {
          delete _pendings[id];
          try {
            const delayedRequest = await _callback(id, _attached[id]);
          } catch (msg) {
            console.log(...logGen("onClick", "error, " + msg, "red"));
          }
          if (_pendings[id]) {
            WebExtensions.runtime.sendMessage({cmd:CMD_HIDE_ALL_VIDEOLIST, params:{}}, function(result) {
            });
            WebExtensions.runtime.sendMessage({cmd:CMD_APPEND_VIDEOS, params:{videos:_pendings[id]}}, function(result) {
            });
          }
        })();
      };
      interval(f);
      _callback = params.onClick;
    }
  }
  function LM_GetIcon(_prms) {
    const {id, type, params, attached, on} = _prms;
    const iconUrl = getIconUrl(type, "download");
    const width = type === "bottom" ? 144 : type === "large" ? 32 : 16;
    const height = type === "bottom" ? 48 : type === "large" ? 32 : 16;
    const postfix = type === "bottom" ? "Bottom" : "";
    let wrapTag = "a";
    if (params && params.wrapTag) {
      wrapTag = params.wrapTag;
    }
    const container = document.createElement(wrapTag);
    container.setAttribute("class", SIGNATURE + postfix);
    if (wrapTag === "a") {
      container.href = "javascript:void(0);";
    }
    if (params && params.zIndex) {
      container.style.zIndex = params.zIndex;
    }
    container.style.overflow = "visible";
    const progress = document.createElement("div");
    progress.setAttribute("class", SIGNATURE + "ProgressContainer" + postfix);
    progress.style.padding = "0 2px 0 2px";
    container.appendChild(progress);
    const message = document.createElement("div");
    message.style.display = "none";
    container.appendChild(message);
    const setMessage = function(msg, color, timeout) {
      message.innerHTML = '<font size="1" color="white"><p style="padding:2px 0 2px 0;background-color:' + color + ';text-align:center;opacity:0.5">' + msg + "</p></font>";
      message.style.display = "block";
      setTimeout(function() {
        message.style.display = "none";
      }, timeout);
    };
    const button = document.createElement("img");
    button.setAttribute("id", SIGNATURE + id);
    button.setAttribute("class", SIGNATURE + "Button" + postfix);
    button.style.width = width + "px";
    button.style.height = height + "px";
    button.setAttribute("src", getIconUrl(type, "download"));
    button.title = "\u30af\u30ea\u30c3\u30af\u3067\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30da\u30fc\u30b8\u3078";
    _attached[id] = attached || {};
    const preloadAndClick = function() {
      return Promise.all([new Promise(function(resolve, reject) {
        (async function() {
          if (_pendings[id]) {
            return resolve();
          } else {
            if (_callback) {
              try {
                const result = await _callback(id, _attached[id]);
                return resolve(result);
              } catch (msg) {
                return reject(msg);
              }
            } else {
              return reject("no click handler");
            }
          }
        })();
      }), new Promise(function(resolve, reject) {
        const f = function(evt) {
          evt.preventDefault();
          refreshIcon(id, "prepare", "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u6e96\u5099\u4e2d", 1, "noAction");
          resolve();
          button.removeEventListener(button.trigger || "click", f);
          delete button.once;
        };
        button.addEventListener(button.trigger || "click", f);
      })]);
    };
    const defaultAction = async function() {
      if (!button.once) {
        button.once = 1;
        try {
          const result = await preloadAndClick();
          const delayedRequest = result[0];
          if (delayedProcess(delayedRequest)) {
            return;
          }
          if (_pendings[id]) {
            WebExtensions.runtime.sendMessage({cmd:CMD_HIDE_ALL_VIDEOLIST, params:{}}, function(result) {
            });
            WebExtensions.runtime.sendMessage({cmd:CMD_APPEND_VIDEOS, params:{videos:_pendings[id]}}, function(result) {
            });
          }
          WebExtensions.runtime.sendMessage({cmd:CMD_OPEN_DOWNLOAD_PAGE, params:{}}, function(result) {
          });
          refreshIcon(id, "download", "\u30af\u30ea\u30c3\u30af\u3067\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30da\u30fc\u30b8\u3078", 1, "defaultAction");
        } catch (msg) {
          console.log(...logGen("onClick", "error, " + msg, "red"));
          refreshIcon(id, "download", "\u30b9\u30af\u30ea\u30d7\u30c8\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f\u3002\u30ed\u30b0\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002", 1, "defaultAction");
        }
      }
    };
    container.appendChild(button);
    container.addEventListener("mouseover", function(evt) {
      if (type === "small") {
        button.style.width = width * 2 + "px";
        button.style.height = height * 2 + "px";
      }
      button.style.opacity = "1";
    });
    container.addEventListener("mouseleave", function(evt) {
      if (type === "small") {
        button.style.width = width + "px";
        button.style.height = height + "px";
      }
      button.style.opacity = "0.6";
    });
    container.addEventListener("mouseover", defaultAction);
    button.defaultAction = button.currentAction = defaultAction;
    button.trigger = on;
    _icon[id] = {container, progress, button, type, setMessage};
    return _icon[id];
  }
  async function LM_Get(params) {
    let {url, method, headers, resultType} = params;
    return new Promise(function(resolve, reject) {
      url = createValidUrl(url);
      headers = createValidHeaders(headers);
      ModifyRequestHeaders(url, headers);
      const init = {method:method ? method : "GET", mode:"cors", credentials:"include"};
      fetch(url, init).then(function(response) {
        if (method === "HEAD") {
          const h = {};
          for (let pair of response.headers.entries()) {
            h[pair[0]] = pair[1];
          }
          return h;
        } else {
          return response[resultType || "text"]();
        }
      }).then(function(response) {
        resolve(response);
      }).catch(function(error) {
        reject(error);
      });
    });
  }
  async function LM_Get_X(params) {
    return new Promise(function(resolve, reject) {
      let {url, method, headers, resultType} = params;
      url = createValidUrl(url);
      ModifyRequestHeaders(url, headers);
      WebExtensions.runtime.sendMessage({cmd:CMD_FETCH, params}, function(response) {
        resolve(response);
      });
    });
  }
  async function LM_Head(params) {
    let {url, method, headers} = params;
    return new Promise(function(resolve, reject) {
      url = createValidUrl(url);
      headers = createValidHeaders(headers);
      if (method === "HEAD") {
        method = "GET";
      }
      ModifyRequestHeaders(url, headers, resolve);
      const init = {method:method ? method : "GET", mode:"cors", credentials:"include"};
      fetch(url, init).then(function(response) {
        response.body.cancel();
      }).catch(function(error) {
        reject();
      });
    });
  }
  async function LM_VideoHead(params) {
    let {url, headers} = params;
    return new Promise(function(resolve, reject) {
      if (url.startsWith("//")) {
        url = location.protocol + url;
      }
      const video = document.createElement("video");
      video.src = url;
      video.preload = "metadata";
      ModifyRequestHeaders(url, headers, function(res) {
        resolve(res);
        document.documentElement.removeChild(video);
      });
      document.documentElement.appendChild(video);
    });
  }
  async function LM_AppendVideo(params) {
    if (_DEBUG_) {
      console.log(...logGen("LM_AppendVideo", params));
    }
    params.urlType = "quality";
    return appendVideos(params);
  }
  async function LM_AppendVideoSequence(params) {
    if (_DEBUG_) {
      console.log(...logGen("LM_AppendVideoSequence", params));
    }
    params.urlType = "sequence";
    return appendVideos(params);
  }
  function LM_Message(params) {
    const {id, message, color, timeout} = params;
    const icon = _icon[id];
    if (icon) {
      icon.setMessage(message, color, timeout);
    }
  }
  function delayedProcess(delayedRequest) {
    if (delayedRequest) {
      if (delayedRequest.postProc) {
        if (_DEBUG_) {
          console.log(...logGen("onClick", "run postProc, ", delayedRequest.message));
        }
        return delayedRequest.postProc();
      }
    }
  }
  function appendVideos(params) {
    return new Promise(async function(resolve, reject) {
      let {id, urls, title, contentType, qualities, text, suffix, headers, urlType} = params;
      if (!id) {
        return reject("LM_Download error : no id");
      }
      if (!urls) {
        return reject("LM_Download error : no url(s)");
      }
      urls = urls instanceof Array ? urls : [urls];
      urls = (() => {
        const r = [];
        urls.forEach((n) => {
          if (n) {
            r.push(n);
          }
        });
        return r;
      })();
      if (urls.length === 0) {
        return reject("LM_Download error : no url(s)");
      }
      const videoLength = urls.length;
      qualities = qualities instanceof Array ? qualities : [qualities];
      if (!text) {
        text = "\u52d5\u753b\u304c\u307f\u3064\u304b\u308a\u307e\u3057\u305f";
        if (urlType === "quality") {
          if (videoLength > 1) {
            text = "\u753b\u8cea\u304c\u7570\u306a\u308b" + videoLength + "\u7a2e\u985e\u306e\u52d5\u753b\u304c\u3042\u308a\u307e\u3059";
          }
        } else {
          if (urlType === "sequence") {
            if (videoLength > 1) {
              text = "\u3053\u306e\u52d5\u753b\u306f" + videoLength + "\u500b\u306b\u5206\u5272\u3055\u308c\u3066\u3044\u307e\u3059";
            }
          }
        }
      }
      let cType = null;
      let cLength = null;
      const needHeader = !qualities[0];
      const videos = [];
      for (let i = 0, len = videoLength; i < len; i++) {
        const video = {tabId:null, rank:1, url:urls[i], contentType, filename:(title || "NoTitle").trim(), contentLength:qualities[i] || qualities[0], txt:text, suffix, headers};
        if (needHeader) {
          if (cType && cLength) {
            video.contentLength = cLength;
            video.contentType = cType;
          } else {
            let h = null;
            try {
              h = await LM_Head({url:video.url, method:"GET", headers});
            } catch (e) {
              try {
                h = await LM_VideoHead({url:video.url, headers});
              } catch (e2) {
                console.log(...logGen("LM_Download", "\u52d5\u753b\u306e\u30d8\u30c3\u30c0\u60c5\u5831\u3092\u53d6\u5f97\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f(Adblock\u304c\u5f71\u97ff\u3057\u3066\u3044\u308b\u53ef\u80fd\u6027\u3082\u3042\u308a\u307e\u3059), qualities\u30d1\u30e9\u30e1\u30fc\u30bf\u3092\u6307\u5b9a\u3059\u308b\u3053\u3068\u3067\u30d8\u30c3\u30c0\u53d6\u5f97\u3092\u56de\u907f\u3059\u308b\u3053\u3068\u304c\u3067\u304d\u307e\u3059"));
              }
            }
            if (h) {
              if (_DEBUG_) {
                console.log(...logGen("LM_Download", h));
              }
              video.contentLength = h.response["content-length"];
              video.contentType = contentType || h.response["content-type"];
              if (urlType === "sequence") {
                cLength = video.contentLength;
                cType = video.contentType;
              }
            }
          }
        }
        if (!video.contentType) {
          if (video.url.includes("flv")) {
            video.contentType = "video/flv";
          } else {
            video.contentType = "video/mp4";
          }
        }
        if (!video.contentLength) {
          video.contentLength = "?";
        }
        videos.push(video);
      }
      if (!_pendings[id]) {
        _pendings[id] = videos;
      } else {
        _pendings[id] = _pendings[id].concat(videos);
      }
      resolve();
    });
  }
  function createValidUrl(url) {
    if (url.startsWith("//")) {
      url = location.protocol + url;
    }
    return url;
  }
  function createValidHeaders(headers) {
    if (isFirefox) {
      if (!headers) {
        headers = {};
      }
      if (headers["Referer"] === undefined && headers["referer"] === undefined) {
        headers["Referer"] = location.href;
      }
      return headers;
    } else {
      return headers;
    }
  }
  function ModifyRequestHeaders(url, headers, callback) {
    if (headers || callback) {
      WebExtensions.runtime.sendMessage({cmd:CMD_WATCH_HEADERS, params:{url, headers}}, function(response) {
        if (callback) {
          callback(response);
        }
      });
    }
  }
  function LM_ModifyRequest(params) {
    const {url, headers} = params;
    return new Promise(function(resolve, reject) {
      ModifyRequestHeaders(url, headers, (response) => {
        resolve(response);
      });
    });
  }
  function LM_WatchRequest(params) {
    const {targetString, targetHeader, frameId} = params;
    return new Promise(function(resolve, reject) {
      WebExtensions.runtime.sendMessage({cmd:CMD_WATCH, params:{targetString, targetHeader, frameId}}, function(response) {
        resolve(response);
      });
    });
  }
  function LM_TempFrame(params) {
    let {url} = params;
    return new Promise(function(resolve, reject) {
      if (url.startsWith("//")) {
        url = location.protocol + url;
      }
      const frame = document.createElement("iframe");
      frame.src = url;
      frame.style = "border:1px solid;width:200px;height:200px";
      const headers = null;
      WebExtensions.runtime.sendMessage({cmd:CMD_GET_FRAME_ID, params:{url, headers}}, function(frameId) {
        const obj = {id:frameId, test:async function(code) {
          return new Promise(function(resolve, reject) {
            WebExtensions.runtime.sendMessage({cmd:CMD_FRAME_TEST, params:{frameId, code}}, function(response) {
              if (response && response[0]) {
                resolve(response[0]);
              } else {
                resolve(response);
              }
            });
          });
        }, window:frame.contentWindow, remove:function() {
          document.documentElement.removeChild(frame);
        }};
        resolve(obj);
      });
      document.documentElement.appendChild(frame);
    });
  }
  function interval(func) {
    if (!func) {
      return;
    }
    const f = throttle(func, 500);
    let prevUrl = "";
    let prevTextLen = 0;
    setInterval(function() {
      const url = location.href;
      const len = document.body.innerText.length;
      if (url !== prevUrl || len !== prevTextLen) {
        const refresh = url !== prevUrl;
        prevUrl = url;
        prevTextLen = len;
        f(refresh);
      }
    }, 100);
  }
  function extendedCSSSelectorAll(root, selector) {
    const selectors = selector.match(/[^,]+(:(has|not|contains)\(.+?\)|)/g);
    const normal = [];
    const has = [];
    const not = [];
    const contains = [];
    for (let i = 0, len = selectors.length; i < len; i++) {
      const s = selectors[i];
      if (s.includes(":has(")) {
        has.push(s);
      } else {
        if (s.includes(":not(")) {
          not.push(s);
        } else {
          if (s.includes(":contains(")) {
            contains.push(s);
          } else {
            normal.push(s);
          }
        }
      }
    }
    const resN = normal.length > 0 ? root.querySelectorAll(normal.join(",")) : [];
    const result = [];
    const check = {};
    for (let i = 0, len = resN.length; i < len; i++) {
      if (!resN[i].className.includes(SIGNATURE)) {
        result.push(resN[i]);
        check[resN[i]] = true;
      }
    }
    for (let i = 0, len = has.length; i < len; i++) {
      const s = has[i].match(/(.+?):has\(([^\)]+)/);
      if (s) {
        const tmp = root.querySelectorAll(s[1]);
        for (let n = 0, cnt = tmp.length; n < cnt; n++) {
          if (tmp[n].querySelector(s[2]) && !check[tmp[n]] && !tmp[n].className.includes(SIGNATURE)) {
            result.push(tmp[n]);
            check[tmp[n]] = true;
          }
        }
      }
    }
    for (let i = 0, len = not.length; i < len; i++) {
      const s = not[i].match(/(.+?):not\(([^\)]+)/);
      if (s) {
        const tmp = root.querySelectorAll(s[1]);
        for (let n = 0, cnt = tmp.length; n < cnt; n++) {
          if (!tmp[n].querySelector(s[2]) && !check[tmp[n]] && !tmp[n].className.includes(SIGNATURE)) {
            result.push(tmp[n]);
            check[tmp[n]] = true;
          }
        }
      }
    }
    for (let i = 0, len = contains.length; i < len; i++) {
      const s = contains[i].match(/(.+?):contains\(([^\)]+)/);
      if (s) {
        const tmp = root.querySelectorAll(s[1]);
        for (let n = 0, cnt = tmp.length; n < cnt; n++) {
          const contains = s[2].replace(/'|"/g, "");
          if (tmp[n].textContent && tmp[n].textContent.includes(contains)) {
            result.push(tmp[n]);
            check[tmp[n]] = true;
          }
        }
      }
    }
    return result;
  }
  function getIconUrl(type, stat) {
    const btm = type === "bottom" ? "_b" : "";
    const iconUrl = stat + btm;
    return chrome.runtime.getURL("images/loadmonkey/" + iconUrl + ".png");
  }
  function refreshIcon(id, stat, caption, opacity, action) {
    const icon = _icon[id];
    const button = icon.button;
    if (stat) {
      button.setAttribute("src", getIconUrl(icon.type, stat));
    }
    if (caption) {
      button.title = caption;
    }
    if (typeof opacity === "number") {
      button.style.opacity = "" + opacity;
    }
    if (action) {
      if (button.currentAction) {
        button.removeEventListener(button.trigger || "click", button.currentAction);
        button.currentAction = null;
      }
      if (action === "defaultAction") {
        action = button.defaultAction;
      }
      if (action instanceof Function) {
        button.addEventListener(button.trigger || "click", action);
        button.currentAction = action;
      }
    }
  }
  function logGen(eventName, message, color) {
    const msg = typeof message === "string" ? message : JSON.stringify(message);
    return ["DEBUG %c[" + eventName + "]%c " + msg, "color:#f60b91", color ? "color:" + color : ""];
  }
  function throttle(func, wait) {
    var ctx, args, rtn, timeoutID;
    var last = 0;
    return function throttled() {
      ctx = this;
      args = arguments;
      var delta = new Date - last;
      if (!timeoutID) {
        if (delta >= wait) {
          call();
        } else {
          timeoutID = setTimeout(call, wait - delta);
        }
      }
      return rtn;
    };
    function call() {
      timeoutID = 0;
      last = +new Date;
      rtn = func.apply(ctx, args);
      ctx = null;
      args = null;
    }
  }
  const contentTypes = {"video/mp4":"mp4", "video/mpeg4":"mp4", "video/x-m4v":"m4v", "video/quicktime":"mov", "video/avi":"avi", "video/x-ms-wmv":"wmv", "video/x-ms-asf":"asf", "video/mpg":"mpg", "video/mpeg":"ts", "video/3gpp":"3gp", "video/3gpp2":"3g2", "video/x-matroska":"mkv", "video/divx":"divx", "video/webm":"webm", "audio/webm":"webm", "video/ogg":"ogx", "audio/ogg":"ogx", "video/x-flv":"flv", "video/flv":"flv", "audio/mp3":"mp3", "audio/mpeg":"mp3", "audio/mp4":"m4a", "audio/wave":"wav", 
  "audio/wav":"wav", "audio/x-wav":"wav", "audio/x-pn-wav":"wav", "audio/midi":"mid", "application/f4m":"f4m", "application/x-mpegURL":"m3u8", "video/mp2t":"ts", "application/x-smaf":"mmf"};
})(this);

