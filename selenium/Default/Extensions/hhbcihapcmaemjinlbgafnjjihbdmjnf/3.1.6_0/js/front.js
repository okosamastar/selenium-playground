/*
 *  This file is part of Douga-Getter <https://www.douga-getter.com/>
 *  Due to restrictions of Google's terms, downloading videos from YouTube is disabled in this extension.
 */

'use strict';
document.addEventListener("DOMContentLoaded", function(event) {
  const WebExtensions = navigator.userAgent.includes("Chrome") ? chrome : browser;
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
  WebExtensions.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.cmd === DELEGATED_CMD_READY) {
      sendResponse(true);
    } else {
      if (message.cmd === DELEGATED_CMD_GET_TITLE) {
        const favicon = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(location.origin);
        const titleObj = document.querySelector("title");
        var title = null;
        if (titleObj) {
          title = titleObj.textContent.replace(/^[\s\u3000]+|[\s\u3000]+$/g, "").replace(/[^\S\n\r]{2,}/, " ").replace(/[\r\n]/g, "").replace(/'/g, "");
          if (!title) {
            title = WebExtensions.i18n.getMessage("default_video_title");
          }
        }
        sendResponse({title, favicon});
      } else {
        if (message.cmd === DELEGATED_CMD_INSERT) {
          if (message.multi) {
            document.body.innerHTML = '<div style="text-align:center;font-size:12px"><br><p><img src="' + WebExtensions.runtime.getURL("image/icon.png") + '" width="16" height="16" />&nbsp;\u52d5\u753b\u30b2\u30c3\u30bf\u30fc</p><br><p>\u591a\u91cdDL\u56de\u907f\u306e\u305f\u3081\u306b\u8aad\u8fbc\u4e2d\u306e\u52d5\u753b\u3092\u505c\u6b62\u3057\u3066\u3044\u307e\u3059</p><p>\u518d\u5ea6\u30da\u30fc\u30b8\u306e\u5185\u5bb9\u3092\u8868\u793a\u3059\u308b\u5834\u5408\u306f<a href="#" id="dg_reload">\u66f4\u65b0\u30dc\u30bf\u30f3</a>\u3092\u30af\u30ea\u30c3\u30af\u3057\u3066\u304f\u3060\u3055\u3044</p></div>';
            setTimeout(function() {
              var o = document.getElementById("dg_reload");
              if (o) {
                o.addEventListener("click", function(evt) {
                  evt.preventDefault();
                  location.reload();
                });
              }
            }, 2000);
          }
          if (true) {
            var doc = document;
            var a = doc.createElement("a");
            a.download = message.filename;
            a.href = message.url;
            var mouseEvent = doc.createEvent("MouseEvent");
            mouseEvent.initEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(mouseEvent);
          } else {
            var iframe = document.createElement("iframe");
            iframe.frameBorder = "0";
            iframe.width = iframe.height = "1";
            iframe.sandbox.add.apply(iframe.sandbox, ["allow-same-origin"]);
            iframe.srcdoc = '<a id="dlink" download="' + message.filename + '" href="' + message.url + '" target="_self"></a>';
            iframe.onload = function() {
              var doc = iframe.contentWindow.document;
              doc.getElementById("dlink").click();
              setTimeout(function() {
                document.documentElement.removeChild(iframe);
              }, 1000);
            };
            document.documentElement.appendChild(iframe);
          }
          sendResponse();
        }
      }
    }
  });
  function toHash(u) {
    var m = u.match(/^https?:\/\/([^\/]+)(.+)/);
    if (m) {
      var j;
      var d = m[1];
      var l = d.length;
      var h = 0;
      var rh = 0;
      var p = m[2];
      var x = 4294967295;
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
  function sendAsPost(action, data) {
    var form = document.createElement("form");
    form.setAttribute("action", action);
    form.setAttribute("method", "post");
    form.style.display = "none";
    if (data !== undefined) {
      for (var paramName in data) {
        var input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", paramName);
        input.setAttribute("value", data[paramName]);
        form.appendChild(input);
      }
    }
    document.documentElement.appendChild(form);
    form.submit();
  }
});

