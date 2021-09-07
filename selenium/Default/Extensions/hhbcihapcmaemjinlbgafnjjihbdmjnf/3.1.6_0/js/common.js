/*
 *  This file is part of Douga-Getter <https://www.douga-getter.com/>
 *  Due to restrictions of Google's terms, downloading videos from YouTube is disabled in this extension.
 */

'use strict';
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
;
