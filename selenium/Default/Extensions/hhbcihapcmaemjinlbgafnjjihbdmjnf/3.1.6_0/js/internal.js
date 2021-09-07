/*
 *  This file is part of Douga-Getter <https://www.douga-getter.com/>
 *  Due to restrictions of Google's terms, downloading videos from YouTube is disabled in this extension.
 */

'use strict';
document.addEventListener("DOMContentLoaded", function() {
  var filetype = initFiletype();
  var base62 = new BASE62;
  function ActionPage_clear() {
    ActionPage_setVideoTitle();
    ActionPage_setBadgeCount();
  }
  function ActionPage_setBadgeCount(n) {
    n = 0 | n;
    document.getElementById("badgeCount").innerHTML = n;
  }
  function ActionPage_setVideoTitle(s) {
    s = s || "";
    document.getElementById("videoTitle").innerHTML = escapeHtml(s);
  }
  function ActionPage_getVideoTitle() {
    return document.getElementById("videoTitle").innerHTML;
  }
  function ActionPage_setFileName(s) {
    document.getElementById("videoFileName").value = s;
  }
  function ActionPage_getFileName() {
    return document.getElementById("videoFileName").value;
  }
  function ActionPage_getItemTemplate() {
    return '<div class="item">' + document.getElementById("dg_item_template").innerHTML + "</div>";
  }
  function ActionPage_setDLIcon(itemNumber, type) {
    var o = document.querySelectorAll(".dg_item")[itemNumber];
    if (o) {
      o.querySelector(".dg_dlbutton").innerHTML = '<span class="fa fa-' + type + ' fa-2x" aria-hidden="true"></span>';
    }
  }
  function ActionPage_setVideoCaption(itemNumber, string, title) {
    var o = document.querySelectorAll(".dg_item")[itemNumber];
    if (o) {
      o.querySelector(".dg_f_bold").innerHTML = string;
      o.setAttribute("title", title);
    }
  }
  function ActionPage_setSuffix(s) {
    if (s != null) {
      document.getElementById("videoSuffix").value = s;
    }
  }
  function ActionPage_getSuffix() {
    var s = document.getElementById("videoSuffix").value;
    if (s.length == 0) {
      return null;
    }
    return s;
  }
  function ActionPage_setNoSimul(noSimul) {
    document.getElementById("noSimul").checked = noSimul;
  }
  function ActionPage_getNoSimul() {
    return document.getElementById("noSimul").checked;
  }
  function ActionPage_setNoReferer(noReferer) {
    document.getElementById("noReferer").checked = noReferer;
  }
  function ActionPage_getNoReferer() {
    return document.getElementById("noReferer").checked;
  }
  function ActionPage_setReferer(ref) {
    if (ref != null) {
      document.getElementById("referer").value = ref;
    }
    var valid = ref && ref.length > 0;
    document.getElementById("settingLink").innerHTML = "\u8a73\u7d30\u3092\u8868\u793a" + (valid ? "*" : "");
    if (valid) {
      document.getElementById("refererDetail").style.display = "";
    } else {
      document.getElementById("refererDetail").style.display = "none";
    }
  }
  function ActionPage_getReferer() {
    var ref = document.getElementById("referer").value;
    if (ref.length == 0) {
      return null;
    }
    return ref;
  }
  function System_loadSetting(siteId) {
    var setting = null;
    try {
      setting = localStorage[siteId] && JSON.parse(localStorage[siteId]);
    } catch (e) {
    }
    if (!setting) {
      setting = {noSimul:false, noReferer:false, referer:"", suffix:"", fileName:"", defaultFileNameRule:"title"};
    }
    return setting;
  }
  function System_saveSetting(siteId, setting) {
    if (setting) {
      localStorage[siteId] = JSON.stringify(setting);
    }
  }
  function System_resetSetting(siteId) {
    delete localStorage[siteId];
    return System_loadSetting(siteId);
  }
  function getFileSizeString(size) {
    if (size == null || size <= 0) {
      return "\u4e0d\u660e";
    }
    var sizes = ["Byte", "KB", "MB", "GB", "TB", "PB", "EB"];
    var idx = 1;
    for (; idx < sizes.length && size >= 1024; idx++) {
      size /= 1024;
    }
    idx--;
    var sizeExt = sizes[idx];
    if (idx < 3) {
      return Math.round(size) + sizeExt;
    } else {
      return Math.floor(size * 10) / 10 + sizeExt;
    }
  }
  function encodeDLQuery(tabId) {
    var cnt = 0;
    var s = "";
    for (var i = 0, len = list.length; i < len; i++) {
      var o = list[i];
      if (o.tabId == tabId) {
        cnt++;
        var contL = 0 | o.contentLength / 1024;
        var t = findFileType(o.contentType);
        var e = findFileExt(o.suffix);
        s += base62.encode(contL) + "," + (t != -1 ? base62.encode(t) : o.contentType) + "," + (e != -1 ? base62.encode(e) : o.suffix) + ",";
        if (cnt == 5) {
          break;
        }
      }
    }
    return btoa(base62.encode(tabId) + "," + base62.encode(cnt) + "," + s);
  }
  function decodeDLQuery(s) {
    var o = {};
    var b = atob(s);
    var v = b.split(",");
    o.tabId = base62.decode(v[0]);
    o.cnt = base62.decode(v[1]);
    o.src = [];
    for (var i = 2, len = 2 + o.cnt * 3; i < len;) {
      var params = {};
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
  function initFiletype() {
    var m = ["mp4|video/mp4", "mp4|video/mpeg4", "m4v|video/x-m4v", "mov|video/quicktime", "avi|video/avi", "wmv|video/x-ms-wmv", "asf|video/x-ms-asf", "mpg|video/mpg", "mpg|video/mpeg", "3gp|video/3gpp", "3g2|video/3gpp2", "mkv|video/x-matroska", "divx|video/divx", "webm|video/webm", "webm|audio/webm", "ogv|video/ogg", "ogx|video/ogg", "oga|audio/ogg", "ogx|audio/ogg", "flv|video/x-flv", "flv|video/flv", "mp3|audio/mp3", "mp3|audio/mpeg", "m4a|audio/mp4", "wav|audio/wave", "wav|audio/wav", "wav|audio/x-wav", 
    "wav|audio/x-pn-wav", "mid|audio/midi", "f4m|application/f4m", "m3u8|application/x-mpegURL", "ts|video/mpeg", "ts|video/mp2t", "mmf|application/x-smaf"];
    var type = [];
    for (var i = 0, len = m.length; i < len; i++) {
      var n = m[i].split("|");
      type[i] = {"ext":n[0], "mime":n[1]};
    }
    return type;
  }
  function initFileRegexp(f) {
    var regexp = "";
    for (var i = 0, len = f.length; i < len; i++) {
      regexp += f[i].ext;
      if (i + 1 < len) {
        regexp += "|";
      }
    }
    return regexp = new RegExp("^[^?]+?\\.(" + regexp + ")(\\?.*?)?$", "i");
  }
  function findFileType(type) {
    for (var i = 0, len = filetype.length; i < len; i++) {
      var f = filetype[i];
      if (f.mime == type) {
        return i;
      }
    }
    return -1;
  }
  function findFileExt(ext) {
    for (var i = 0, len = filetype.length; i < len; i++) {
      var f = filetype[i];
      if (f.ext == ext) {
        return i;
      }
    }
    return -1;
  }
  function BASE62() {
    var characterSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    this.encode = function(integer) {
      if (integer === 0) {
        return "0";
      }
      var s = "";
      while (integer > 0) {
        s = characterSet[integer % 62] + s;
        integer = Math.floor(integer / 62);
      }
      return s;
    };
    this.decode = function(base62String) {
      var val = 0, base62Chars = base62String.split("").reverse();
      base62Chars.forEach(function(character, index) {
        val += characterSet.indexOf(character) * Math.pow(62, index);
      });
      return val;
    };
  }
  function escapeHtml(content) {
    var TABLE_FOR_ESCAPE_HTML = {"&":"&amp;", '"':"&quot;", "<":"&lt;", ">":"&gt;"};
    return content.replace(/[&"<>]/g, function(match) {
      return TABLE_FOR_ESCAPE_HTML[match];
    });
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
  window._internal = true;
  var CMD_GET_SCRIPTS = "cmd_get_scripts";
  var CMD_SAVE_SCRIPTS = "cmd_save_scripts";
  var CMD_SETTING = "cmd_setting";
  var CMD_AUTH = "cmd_auth";
  var CMD_DELEGATE = "cmd_delegate";
  var CMD_GET_VIDEOLIST = "cmd_list";
  var CMD_UPDATE_TAB = "cmd_update_tab";
  var CMD_START_DOWNLOAD = "cmd_start_download";
  var CMD_CANCEL_DOWNLOAD = "cmd_cancel_download";
  var CMD_APPEND_VIDEOS = "cmd_append_videos";
  var CMD_GET_FRAME_ID = "cmd_get_frame_id";
  var CMD_FETCH = "cmd_fetch";
  var CMD_FRAME_TEST = "cmd_frame_test";
  var CMD_HIDE_ALL_VIDEOLIST = "cmd_hide_all_videolist";
  var CMD_OPEN_DOWNLOAD_PAGE = "cmd_open_download_page";
  var CMD_WATCH_HEADERS = "cmd_watch_headers";
  var CMD_WATCH = "cmd_watch";
  var WATCH_LIFETIME = 1E3 * 60;
  var NOTIFY_UPDATE_LIST = "notify_update_list";
  var NOTIFY_HIDE_ALL_VIDEOLIST = "notify_hide_all_videolist";
  var NOTIFY_DOWNLOAD_STARTED = "notify_download_started";
  var NOTIFY_DOWNLOAD_COMPLETED = "notify_download_completed";
  var NOTIFY_DOWNLOAD_FAILED = "notify_download_failed";
  var DELEGATED_CMD_READY = "delegated_cmd_ready";
  var DELEGATED_CMD_GET_TITLE = "delegated_cmd_get_title";
  var DELEGATED_CMD_INSERT = "delegated_cmd_insert";
  var WebExtensions = navigator.userAgent.includes("Chrome") ? chrome : browser;
  var actionOnce = "first";
  var extensionOption = null;
  document.getElementById("miscdom").setAttribute("ready", "true");
  (function() {
    var _curl = location.href.match(/[^#]+/)[0];
    if (actionOnce == _curl) {
      return;
    }
    actionOnce = _curl;
    var siteId = (location.href.match(/site=([^&#]+)/) || [])[1];
    var encodedQuery = (location.href.match(/q=([^&#]+)/) || [])[1];
    if (!siteId || !encodedQuery) {
      return;
    }
    var query = decodeDLQuery(encodedQuery);
    var parentId = query.tabId;
    if (parentId < 0) {
      return;
    }
    var isAS = location.href.includes("&as=");
    var myTab = null;
    var parentFavicon = null;
    var videoCount = 0;
    var deletedVideoCount = 0;
    var curEventHandler = {};
    var setEventListener = function(dom, name, func) {
      var eid = dom.getAttribute("eid");
      if (eid && curEventHandler[eid]) {
        dom.removeEventListener(name, curEventHandler[eid]);
      }
      if (!eid) {
        eid = "" + Math.floor(Math.random() * 1E7);
        dom.setAttribute("eid", eid);
      }
      curEventHandler[eid] = func;
      if (func) {
        dom.addEventListener(name, func);
      }
    };
    var pageTitle = "";
    function updateFileName() {
      var vdom = document.getElementById("videoFileName");
      var fn = "";
      if (setting.defaultFileNameRule == "title") {
        fn = "\u30da\u30fc\u30b8\u30bf\u30a4\u30c8\u30eb\u3092\u4f7f\u7528\u3057\u307e\u3059";
        vdom.setAttribute("placeholder", fn);
        vdom.setAttribute("readonly", true);
        vdom.setAttribute("title", fn);
      } else {
        if (setting.defaultFileNameRule == "url") {
          fn = "\u52d5\u753bURL\u306e\u30d5\u30a1\u30a4\u30eb\u540d\u3092\u4f7f\u7528\u3057\u307e\u3059";
          vdom.setAttribute("placeholder", fn);
          vdom.setAttribute("readonly", true);
          vdom.setAttribute("title", fn);
        }
      }
      ActionPage_setFileName(fn);
    }
    var setting = System_loadSetting(siteId);
    updateFileName();
    ActionPage_setSuffix(setting.suffix);
    ActionPage_setNoSimul(setting.noSimul);
    ActionPage_setNoReferer(setting.noReferer);
    ActionPage_setReferer(setting.referer);
    var saveSetting = function() {
      System_saveSetting(siteId, setting);
    };
    document.getElementById("changeFileNameButton").addEventListener("click", function() {
      setting.fileName = "";
      setting.defaultFileNameRule = setting.defaultFileNameRule == "title" ? "url" : "title";
      updateFileName();
      saveSetting();
    });
    document.getElementById("videoSuffix").addEventListener("change", function(evt) {
      setting.suffix = evt.target.value;
      saveSetting();
    });
    document.getElementById("noSimul").addEventListener("click", function() {
      setting.noSimul = ActionPage_getNoSimul();
      saveSetting();
    });
    document.getElementById("noReferer").addEventListener("click", function() {
      setting.noReferer = ActionPage_getNoReferer();
      if (setting.noReferer) {
        setting.referer = "";
        ActionPage_setReferer("");
      }
      saveSetting();
    });
    document.getElementById("settingLink").addEventListener("click", function() {
      var ref = document.getElementById("refererDetail");
      if (ref.ownerDocument.defaultView.getComputedStyle(ref, null).display === "none") {
        ref.style.display = "";
      } else {
        ref.style.display = "none";
      }
    });
    document.getElementById("referer").addEventListener("change", function(evt) {
      setting.referer = evt.target.value;
      setting.noReferer = false;
      ActionPage_setReferer(setting.referer);
      ActionPage_setNoReferer(setting.noReferer);
      saveSetting();
    });
    var notifyAnimation = throttle(function() {
      var target = document.getElementById("videoListContainer");
      target.style["-webkit-transition"] = "-webkit-box-shadow 0.5s ease";
      target.style["-webkit-box-shadow"] = "0px 0px 14px #ff4444";
      setTimeout(function() {
        target.style["-webkit-transition"] = "-webkit-box-shadow 5s ease";
        target.style["-webkit-box-shadow"] = "0px 0px 0px #fff";
      }, 500);
    }, 4E3);
    (function() {
      var _i = document.querySelectorAll(".dg_item_d");
      for (var i = 0, len = _i.length; i < len; i++) {
        _i[i].style.display = "none";
      }
    })();
    var m3u8Parser = function(body, id) {
      var list = [], suffixList = [], keyCount = 0, videoCount = 0;
      var result = id ? body : "";
      if (body.includes("#EXT-X-STREAM-INF")) {
        return {type:"root"};
      }
      var files = body.match(/#EXTINF:[^#]+/g);
      if (!files) {
        return {type:"error"};
      }
      var keys = body.match(/#EXT-X-KEY:[^#]+/g);
      if (keys) {
        for (var i = 0, len = keys.length; i < len; i++) {
          var key = keys[i].match(/URI="([^"]+)/);
          if (key) {
            keyCount++;
            list.push(key[1]);
            if (id) {
              result = result.replace(key[1], id + "." + ("" + (1E4 + keyCount)).substr(1) + ".key");
            }
            suffixList.push({n:keyCount, s:"key"});
          }
        }
      }
      for (var i = 0, len = files.length; i < len; i++) {
        var file = files[i].match(/\s+([^\s]+)/);
        if (file) {
          videoCount++;
          list.push(file[1]);
          if (id) {
            result = result.replace(file[1], id + "." + ("" + (1E4 + videoCount)).substr(1) + ".ts");
          }
          suffixList.push({n:videoCount, s:"ts"});
        }
      }
      return {type:"file", list:list, suffixList:suffixList, keyCount:keyCount, videoCount:videoCount, replacedM3U8:result};
    };
    WebExtensions.runtime.sendMessage({cmd:CMD_AUTH, params:{tabId:parentId}}, function(tabInfo) {
      if (tabInfo && tabInfo.url == location.href.match(/[^#]+/)[0]) {
        var link_status = document.getElementById("link_status");
        link_status.innerHTML = '<span class="fa fa-link fa-1x" aria-hidden="true" style="margin: 14px 0 0 10px;"></span>';
        link_status.setAttribute("title", "\u5143\u30da\u30fc\u30b8\u3068\u30ea\u30f3\u30af\u3057\u3066\u3044\u307e\u3059");
        myTab = tabInfo;
        var TS = {id:"", itemNum:0, isLoading:false, list:null, suffixList:null, keyCount:0, m3u8:null, size:0, baesUrl:null, current:0, parallel:0, guard_timer:0, guard_stat:false, guard_pendings:[], guard_focus:function() {
          TS.guard_stat = false;
          TS.guard_pendings.forEach(function(f) {
            f();
          });
          TS.guard_pendings = [];
          if (TS.guard_timer == 0) {
            TS.guard_timer = setTimeout(function() {
              TS.guard_disable();
            }, 2E3);
          }
        }, guard_blur:function() {
          TS.guard_stat = true;
          if (TS.guard_timer != 0) {
            clearTimeout(TS.guard_timer);
            TS.guard_timer = 0;
          }
        }, guard_enable:function() {
          TS.guard_stat = false;
          window.addEventListener("focus", TS.guard_focus);
          window.addEventListener("blur", TS.guard_blur);
          if (TS.guard_timer <= 0) {
            TS.guard_timer = setTimeout(function() {
              TS.guard_disable();
            }, 2E3);
          }
        }, guard_disable:function() {
          TS.guard_pendings.forEach(function(f) {
            f();
          });
          TS.guard_pendings = [];
          TS.guard_stat = false;
          TS.guard_timer = -1;
          window.removeEventListener("focus", TS.guard_focus);
          window.removeEventListener("blur", TS.guard_blur);
        }, next:function() {
          var parallel_max = TS.guard_timer == -1 ? Math.min(4, extensionOption && extensionOption.ts_parallel || 1) : 1;
          if (TS.parallel >= parallel_max) {
            parallel_max = TS.parallel + 1;
          }
          while (TS.parallel < parallel_max) {
            var fileName = TS.list.shift();
            if (!fileName) {
              break;
            }
            var suffix = TS.suffixList.shift();
            var reqUrl;
            if (fileName.match(/^https?:\/\//)) {
              reqUrl = fileName;
            } else {
              if (fileName[0] == "/") {
                reqUrl = (TS.baseUrl.match(/.+?:\/\/[^/]+/) || [""])[0] + fileName;
              } else {
                reqUrl = TS.baseUrl + fileName;
              }
            }
            TS.current++;
            TS.parallel++;
            var src = {number:TS.itemNum, url:reqUrl, suffix:suffix.s, index:suffix.n, filetype:"stream", filename:TS.id, dlOnly:true};
            download(src);
            if (TS.keyCount === TS.current && TS.guard_timer === -1) {
              TS.guard_enable();
            }
          }
        }, complete_ts:function(message) {
          if (TS.isLoading && message.request.filetype === "stream") {
            if (TS.list.length === 0 && TS.parallel === 1) {
              ActionPage_setVideoCaption(TS.itemNum, TS.size + '\u500b\u306eTS\u30d5\u30a1\u30a4\u30eb\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u304c\u5b8c\u4e86\u3057\u307e\u3057\u305f\u3002<a href="hls.html" target="_blank">\u518d\u751f\u30fb\u7d50\u5408\u65b9\u6cd5\u306b\u3064\u3044\u3066\u306f\u3053\u3061\u3089</a>', "");
              TS.guard_disable();
              TS.isLoading = false;
            } else {
              ActionPage_setVideoCaption(TS.itemNum, TS.size + "\u500b\u4e2d" + TS.current + "\u76ee\u306eTS\u30d5\u30a1\u30a4\u30eb\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3057\u307e\u3057\u305f\u3002", "");
              var _next = function() {
                TS.parallel--;
                TS.next();
              };
              if (TS.guard_stat) {
                TS.guard_pendings.push(_next);
              } else {
                _next();
              }
            }
          }
        }, complete_m3u8:function(message) {
          if (message.request.filetype === "index") {
            if (TS.isLoading) {
              return;
            }
            TS.id = (new Date).toLocaleString().replace(/\D/g, "-");
            var m3u8 = m3u8Parser(message.result, TS.id);
            if (m3u8.type === "root") {
              ActionPage_setVideoCaption(TS.itemNum, "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u304c\u5b8c\u4e86\u3057\u307e\u3057\u305f\uff08\u30a4\u30f3\u30c7\u30c3\u30af\u30b9\u30d5\u30a1\u30a4\u30eb\u306e\u30a4\u30f3\u30c7\u30c3\u30af\u30b9\u3067\u3057\u305f\uff09", "");
              return;
            }
            TS.itemNum = message.request.number;
            if (m3u8.type === "error") {
              ActionPage_setVideoCaption(TS.itemNum, "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u304c\u5b8c\u4e86\u3057\u307e\u3057\u305f\u3002", "");
              return;
            }
            TS.list = m3u8.list;
            TS.suffixList = m3u8.suffixList;
            TS.keyCount = m3u8.keyCount;
            TS.size = TS.list.length;
            TS.m3u8 = m3u8.replacedM3U8;
            TS.baseUrl = (message.request.url.match(/^([^\?]+\/)/) || [])[1];
            var keyfileDesc = m3u8.keyCount == 0 ? "" : "(+" + m3u8.keyCount + "\u500b\u306eKEY\u30d5\u30a1\u30a4\u30eb)";
            ActionPage_setVideoCaption(TS.itemNum, "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u304c\u5b8c\u4e86\u3057\u307e\u3057\u305f\u3002" + m3u8.videoCount + "\u500b\u306eTS\u30d5\u30a1\u30a4\u30eb" + keyfileDesc + "\u304c\u898b\u3064\u304b\u308a\u307e\u3057\u305f\u3002\u30af\u30ea\u30c3\u30af\u3067\u5168\u3066\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3057\u307e\u3059\u3002", "");
            var dg_item = document.querySelectorAll(".dg_item")[TS.itemNum];
            setEventListener(dg_item, "click", function(evt) {
              if (!TS.isLoading) {
                setEventListener(dg_item, "click", null);
                TS.guard_enable();
                TS.isLoading = true;
                TS.current = TS.parallel = 0;
                var src = {number:TS.itemNum, url:"data:application/octet-stream," + encodeURIComponent(TS.m3u8), suffix:"m3u8", filetype:"replaced_m3u8", filename:TS.id, dlOnly:true};
                download(src);
                setTimeout(function() {
                  TS.next();
                }, 1E3);
              }
            });
          }
        }, oncomplete:function(message) {
          TS.complete_m3u8(message);
          TS.complete_ts(message);
        }};
        WebExtensions.runtime.onMessage.addListener(function(message, sender, sendResponse) {
          if (message.cmd === NOTIFY_UPDATE_LIST) {
            if (message.video) {
              appendItem(message.video);
            } else {
              link_status.innerHTML = '<span class="fa fa-unlink fa-1x text-danger" aria-hidden="true" style="margin: 14px 0 0 10px;"></span>';
              link_status.setAttribute("title", "\u5143\u30da\u30fc\u30b8\u3068\u306e\u30ea\u30f3\u30af\u304c\u5207\u308c\u307e\u3057\u305f");
              parentId = -1;
              if (isAS) {
                ActionPage_setVideoTitle("\u5143\u30da\u30fc\u30b8\u3068\u306e\u30ea\u30f3\u30af\u304c\u5207\u308c\u307e\u3057\u305f");
              }
            }
          } else {
            if (message.cmd === NOTIFY_DOWNLOAD_STARTED) {
              if (message.request) {
                ActionPage_setDLIcon(message.request.number, "circle-o-notch fa-spin");
                ActionPage_setVideoCaption(message.request.number, "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u958b\u59cb\u3057\u307e\u3057\u305f\u3002", "");
              }
            } else {
              if (message.cmd === NOTIFY_DOWNLOAD_COMPLETED) {
                if (message.request) {
                  ActionPage_setDLIcon(message.request.number, "circle-o text-success");
                  ActionPage_setVideoCaption(message.request.number, "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u304c\u5b8c\u4e86\u3057\u307e\u3057\u305f\u3002", "");
                  TS.oncomplete(message);
                }
              } else {
                if (message.cmd === NOTIFY_DOWNLOAD_FAILED) {
                  if (message.request) {
                    ActionPage_setDLIcon(message.request.number, "ban text-danger");
                    ActionPage_setVideoCaption(message.request.number, "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002", "");
                  }
                } else {
                  if (message.cmd === NOTIFY_HIDE_ALL_VIDEOLIST) {
                    var item = document.querySelectorAll("#videoListContainer .item");
                    for (var i = 0, len = item.length; i < len; i++) {
                      item[i].style.display = "none";
                    }
                    deletedVideoCount = videoCount;
                  }
                }
              }
            }
          }
          sendResponse();
        });
        document.getElementById("videoTitle").addEventListener("click", function() {
          if (parentId == -1) {
            return;
          }
          WebExtensions.runtime.sendMessage({cmd:CMD_UPDATE_TAB, params:{tabId:parentId, properties:{active:true}}}, function() {
          });
        });
        var download = function(src) {
          var suffix = "." + (ActionPage_getSuffix() || src.suffix);
          if (TS.isLoading) {
            suffix = "." + src.suffix;
          }
          var filename = src.filename || (setting.defaultFileNameRule == "url" ? (src.url.match(/\/([^/]+?)(\?.*?)?$/) || [])[1] : pageTitle);
          if (!filename || filename.length == 0) {
            filename = "Untitled";
          }
          filename = filename.replace(/\.exe$/, "").replace(/\.dll$/, "");
          if (!filename.includes(suffix)) {
            filename = filename + suffix;
          }
          if (TS.isLoading) {
            if (src.suffix === "m3u8") {
              filename = src.filename + "-" + pageTitle + suffix;
            }
            if (src.index != null) {
              filename = filename.replace(suffix, "." + ("" + (1E4 + src.index)).substr(1) + suffix);
            }
          }
          var headers = {"user-agent":navigator.userAgent, "referer":ActionPage_getReferer() || myTab.rootTabUrl};
          if (ActionPage_getNoReferer()) {
            delete headers["referer"];
          }
          var params = {url:src.url, filename:filename, filetype:src.filetype, headers:headers, parentTabId:parentId, tabId:myTab.id, number:src.number};
          if (src.dlOnly) {
            params.dlOnly = true;
          }
          WebExtensions.runtime.sendMessage({cmd:CMD_START_DOWNLOAD, params:params}, function() {
            WebExtensions.runtime.sendMessage({cmd:CMD_DELEGATE, target:parentId, params:{cmd:DELEGATED_CMD_INSERT, url:src.url, multi:ActionPage_getNoSimul(), forceDirect:src.forceDirect, filename:params.filename}}, function(r) {
              if (r == -1) {
                ActionPage_setDLIcon(src.number, "unlink text-warning");
                ActionPage_setVideoCaption(src.number, "\u5143\u3068\u306a\u308b\u30a6\u30a3\u30f3\u30c9\u30a6\u304c\u9589\u3058\u3089\u308c\u3066\u3044\u307e\u3059\u3002", "");
              } else {
                ActionPage_setDLIcon(src.number, "spinner fa-spin attempting");
                setTimeout(function() {
                  var dg_item = document.querySelectorAll(".dg_item")[src.number];
                  if (dg_item && dg_item.querySelector(".dg_dlbutton").innerHTML.match(/attempting/)) {
                    ActionPage_setDLIcon(src.number, "question text-warning");
                    if (navigator.userAgent.includes("Chrome")) {
                      ActionPage_setVideoCaption(src.number, "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u958b\u59cb\u3067\u304d\u307e\u305b\u3093\u3002\u5143\u30da\u30fc\u30b8\u304c\u300c\u8907\u6570\u30d5\u30a1\u30a4\u30eb\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u300d\u306e\u8a31\u53ef\u3092\u6c42\u3081\u3066\u3044\u308b\u53ef\u80fd\u6027\u304c\u3042\u308a\u307e\u3059\u3002", "\u30af\u30ea\u30c3\u30af\u3067\u5143\u306e\u30da\u30fc\u30b8\u306b\u79fb\u52d5");
                      setEventListener(dg_item, "click", function() {
                        if (parentId == -1) {
                          return;
                        }
                        WebExtensions.runtime.sendMessage({cmd:CMD_UPDATE_TAB, params:{tabId:parentId, properties:{active:true}}}, function() {
                        });
                      });
                    } else {
                      if (true) {
                        ActionPage_setVideoCaption(src.number, "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u958b\u59cb\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002", "\u3059\u307f\u307e\u305b\u3093");
                        setEventListener(dg_item, "click", function() {
                        });
                      } else {
                        if (src.forceDirect) {
                          ActionPage_setVideoCaption(src.number, "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u958b\u59cb\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002", "\u3059\u307f\u307e\u305b\u3093");
                          setEventListener(dg_item, "click", function() {
                          });
                        } else {
                          ActionPage_setVideoCaption(src.number, "\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3092\u958b\u59cb\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002\u30af\u30ea\u30c3\u30af\u3067\uff08\u5225\u306e\u65b9\u6cd5\u3067\uff09\u30ea\u30c8\u30e9\u30a4\u3067\u304d\u307e\u3059\u3002", "\u30af\u30ea\u30c3\u30af\u3067\u30ea\u30c8\u30e9\u30a4");
                          setEventListener(dg_item, "click", function() {
                            if (parentId == -1) {
                              return;
                            }
                            src.forceDirect = true;
                            download(src);
                          });
                        }
                      }
                    }
                  }
                }, 5E3);
              }
            });
          });
        };
        var itemTemplate = ActionPage_getItemTemplate();
        var appendItem = function(src) {
          if (!src) {
            return;
          }
          videoCount++;
          src.number = videoCount;
          var isVideo = findFileExt(src.suffix) != -1 || findFileType(src.contentType) != -1 || src.contentLength > 1048576;
          var isVideoIndex = src.contentType.match(/mpegURL/i) || src.suffix.match(/^(m3u8|f4m)$/i);
          var isTS = src.contentType.match(/mp2t/i) || src.suffix.match(/^(ts|tsv|tsa)$/i);
          var videoCaption = "\u52d5\u753b\u3067\u306f\u306a\u3044\u304b\u3082\u3057\u308c\u307e\u305b\u3093";
          if (src.txt) {
            videoCaption = src.txt;
          } else {
            if (isVideoIndex) {
              videoCaption = "\u52d5\u753b\u306e\u30a4\u30f3\u30c7\u30c3\u30af\u30b9\u30d5\u30a1\u30a4\u30eb\u3067\u3059";
            } else {
              if (isTS) {
                videoCaption = "\u52d5\u753b\u306e\u53ef\u80fd\u6027\u304c\u9ad8\u3044\u3067\u3059\uff08\u5206\u5272\u3055\u308c\u3066\u3044\u307e\u3059\uff09";
              } else {
                if (isVideo) {
                  videoCaption = "\u52d5\u753b\u306e\u53ef\u80fd\u6027\u304c\u9ad8\u3044\u3067\u3059";
                }
              }
            }
          }
          var videoCaptionColor = src.txt ? "#000000" : isVideoIndex ? "#008080" : isVideo ? "#444444" : "#888888";
          videoCaption = '<font color= "' + videoCaptionColor + '">' + videoCaption + "</font>";
          var vUrlL = (src.url.match(/^https?:\/\/[^\/]+\/(.+)/) || [])[1] || "";
          var vUrlM = (vUrlL.match(/^[^?&#]+/) || [])[0] || "";
          var vUrlS = ((vUrlM.match(/[^\/]+$/) || [])[0] || "").replace("videoplayback", "video." + src.suffix);
          if (vUrlS.length === 0) {
            vUrlS = "video";
          }
          src.filetype = isVideoIndex ? "index" : isTS ? "stream" : "video";
          var item = itemTemplate.replace("$DG_FAVICONURL", '<img src="' + parentFavicon + '" width="16" height="16" class="dg_icon">').replace("$DG_VIDEOTITLE", vUrlL).replace("$DG_VIDEOURL", vUrlS).replace("$DG_VIDEOURL", vUrlS).replace("$DG_VIDEOCAPTION", "").replace("$DG_FILETYPE", src.contentType).replace("$DG_SUFFIX", src.suffix).replace("$DG_FILESIZE", isNaN(src.contentLength) ? src.contentLength : getFileSizeString(src.contentLength));
          document.getElementById("dg_item_template").parentNode.insertAdjacentHTML("beforeend", item);
          var dg_item = document.querySelectorAll(".dg_item")[src.number];
          setEventListener(dg_item, "click", function(evt) {
            download(src);
            setEventListener(dg_item, "click", null);
          });
          dg_item.style.opacity = 0;
          ActionPage_setVideoCaption(src.number, videoCaption, "\u30af\u30ea\u30c3\u30af\u3067\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9");
          ActionPage_setDLIcon(src.number, "download");
          setTimeout(function() {
            dg_item.style.opacity = 1;
          }, 100);
          dg_item.querySelector(".dg_url_text a").addEventListener("click", function(e) {
            e.preventDefault();
          });
          ActionPage_setBadgeCount(videoCount - deletedVideoCount);
          document.title = "+" + (videoCount - deletedVideoCount) + " / \u52d5\u753b\u30b2\u30c3\u30bf\u30fc";
          notifyAnimation();
        };
        var start = function() {
          WebExtensions.runtime.sendMessage({cmd:CMD_DELEGATE, target:parentId, params:{cmd:DELEGATED_CMD_GET_TITLE}}, function(_p) {
            pageTitle = _p.title;
            if (isAS) {
              parentFavicon = WebExtensions.runtime.getURL("images/noIcon.png");
              ActionPage_setVideoTitle("\u30af\u30ea\u30c3\u30af\u3067\u5143\u306e\u30da\u30fc\u30b8\u306b\u623b\u308a\u307e\u3059");
            } else {
              parentFavicon = _p.favicon;
              ActionPage_setVideoTitle(pageTitle);
            }
            updateFileName();
            document.title = "\u52d5\u753b\u30b2\u30c3\u30bf\u30fc";
            WebExtensions.runtime.sendMessage({cmd:CMD_GET_VIDEOLIST}, function(response) {
              if (parentId == -1) {
                return;
              }
              extensionOption = JSON.parse(response.option);
              var list = response.list;
              for (var i = 0, len = list.length; i < len; i++) {
                var video = list[i];
                if (video && video.tabId == parentId) {
                  appendItem(video);
                }
              }
            });
          });
        };
        var waitCount = 0;
        var wait = function() {
          WebExtensions.runtime.sendMessage({cmd:CMD_DELEGATE, target:parentId, params:{cmd:DELEGATED_CMD_READY}}, function(isReady) {
            if (isReady || waitCount > 20) {
              start();
            } else {
              waitCount++;
              setTimeout(function() {
                wait();
              }, 200);
            }
          });
        };
        wait();
      } else {
        ActionPage_drawCache();
      }
    });
    setTimeout(function() {
      if (document.getElementById("siteInfo").getAttribute("statuscode") == "404") {
        var domain = (myTab && myTab.rootTabUrl && myTab.rootTabUrl.match(/https?:\/\/([^\/]+)/) || [])[1];
        if (domain) {
          document.getElementById("siteInfo").setAttribute("domain", domain);
        }
      }
    }, 2E3);
  })();
  var currentFrontUrl = "first";
  var siteId = (location.href.match(/site=([^&#]+)/) || [])[1];
  function ActionPage_drawCache() {
    var _curl = location.href.match(/[^#]+/)[0];
    if (currentFrontUrl == _curl) {
      return;
    }
    currentFrontUrl = _curl;
    var encodedQuery = (location.href.match(/q=([^&#]+)/) || [])[1];
    if (!siteId || !encodedQuery) {
      return ActionPage_clear();
    }
    var query = decodeDLQuery(encodedQuery);
    if (!query.tabId) {
      return clear();
    }
    ActionPage_setVideoTitle("\uff08\u3053\u306e\u60c5\u5831\u306f\u3059\u3067\u306b\u53e4\u304f\u306a\u3063\u3066\u3044\u307e\u3059\u3002\u5b9f\u969b\u306e\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u306f\u3067\u304d\u307e\u305b\u3093\u3002\uff09");
    ActionPage_setBadgeCount(query.cnt);
    var itemTemplate = ActionPage_getItemTemplate();
    for (var i = 0, len = Math.min(6, query.cnt); i < len; i++) {
      var src = query.src[i];
      var isVideo = findFileExt(src.suffix) != -1 || findFileType(src.contentType) != -1 || src.contentLength > 1048576;
      var caption = isVideo ? "\u52d5\u753b\u306e\u53ef\u80fd\u6027\u304c\u9ad8\u3044\u3067\u3059" : "\u52d5\u753b\u3067\u306f\u306a\u3044\u304b\u3082\u3057\u308c\u307e\u305b\u3093";
      if (src.suffix == "ts") {
        caption = caption + "\uff08\u5206\u5272\u3055\u308c\u3066\u3044\u307e\u3059\uff09";
      }
      if (src.suffix == "m3u8") {
        caption = "\u52d5\u753b\u306e\u30a4\u30f3\u30c7\u30c3\u30af\u30b9\u30d5\u30a1\u30a4\u30eb\u3067\u3059";
      }
      var nstr = ["\u3072\u3068\u3064\u3081", "\u3075\u305f\u3064\u3081", "\u307f\u3063\u3064\u3081", "\u3088\u3063\u3064\u3081", "\u3044\u3064\u3064\u3081", "\u3080\u3063\u3064\u3081"];
      var vurl = nstr[i] + "\u306e\u52d5\u753b\u3067\u3059";
      var item = itemTemplate.replace("dg_item", "dg_item_d").replace("$DG_FAVICONURL", '<span class="fa fa-globe fa-1x dg_icon"></span>').replace("$DG_VIDEOURL", "#").replace("$DG_VIDEOURL", vurl).replace("$DG_VIDEOCAPTION", caption).replace("$DG_VIDEOTITLE", caption).replace("$DG_FILETYPE", src.contentType).replace("$DG_SUFFIX", src.suffix).replace("$DG_FILESIZE", isNaN(src.contentLength) ? src.contentLength : getFileSizeString(src.contentLength));
      document.getElementById("dg_item_template").parentNode.insertAdjacentHTML("beforeend", item);
      if (i == 0) {
        ActionPage_setFileName("\u30da\u30fc\u30b8\u30bf\u30a4\u30c8\u30eb\u3092\u4f7f\u7528\u3057\u307e\u3059");
      }
    }
  }
});

