/*
 *  This file is part of Douga-Getter <https://www.douga-getter.com/>
 *  Due to restrictions of Google's terms, downloading videos from YouTube is disabled in this extension.
 */

'use strict';
(function() {
  const WebExtensions = navigator.userAgent.includes("Chrome") ? chrome : browser;
  const isFirefox = navigator.userAgent.includes("Firefox");
  const isEdge = false;
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
  let guardTimerId = 0;
  const MSG_ScriptEnabled = "\u30b9\u30af\u30ea\u30d7\u30c8\u304c\u6709\u52b9\u3067\u3059";
  const MSG_ScriptDisabled = "\u30b9\u30af\u30ea\u30d7\u30c8\u306f\u7121\u52b9\u3067\u3059";
  const scriptTitle = document.getElementById("script-id");
  const nav = document.getElementById("nav-script");
  const newButton = document.getElementById("new-script-button");
  const saveButton = document.getElementById("save-script-button");
  const removeButton = document.getElementById("remove-script-button");
  const scriptSwitch = document.getElementById("script-switch");
  const template = '<li class="nav-item"><a href="#" scriptid="$ID" style="opacity:$OPACITY">$ID</a></li>';
  const initialScriptTemplate = "// @id          $ID\n// @match       http://www.example.com/*\n// @version     $VERSION\n\n";
  let initialScript = null;
  let scripts = {};
  let modified = false;
  let currentId = (location.href.match(/sid=([^&#]+)/) || [])[1];
  const getId = function(s) {
    return (s.match(/@id\s+([\w,\+\-]+)/) || [])[1];
  };
  const getVersion = function(s) {
    return Number((s.match(/@version\s+(.+)/) || [])[1] || 0);
  };
  const getSite = function(s) {
    return (s.match(/@match\s+(.+)/) || [])[1];
  };
  WebExtensions.runtime.sendMessage({cmd:CMD_GET_SCRIPTS}, function(_s) {
    scripts = _s;
    init();
  });
  function init() {
    const sorted = [];
    for (const k in scripts) {
      sorted.push(k);
    }
    sorted.sort();
    const list = [];
    for (let i = 0, len = sorted.length; i < len; i++) {
      const s = scripts[sorted[i]];
      list.push(template.replace(/\$ID/g, escapeHTML(s.id)).replace("$OPACITY", s.enabled ? 1.0 : 0.3));
    }
    nav.innerHTML = list.join("");
    setTimeout(function() {
      if (list.length > 0) {
        const tmpId = currentId || sorted[0];
        const a = nav.querySelector('a[scriptid="' + escapeHTML(tmpId) + '"]');
        if (a) {
          a.click();
        }
      }
    }, 100);
  }
  const editor = ace.edit("editor");
  const editorSession = editor.getSession();
  editor.setTheme("ace/theme/chrome");
  editor.setFontSize(11);
  editor.setShowPrintMargin(false);
  editor.setHighlightGutterLine(false);
  editorSession.setMode("ace/mode/javascript");
  editorSession.setUseWrapMode(true);
  editorSession.setTabSize(2);
  editorSession.setUseSoftTabs(true);
  editorSession.setFoldStyle("manual");
  editor.$blockScrolling = Infinity;
  editor.on("change", function() {
    onEditorChanged();
    setTimeout(onEditorChanged, 1000);
  });
  const onEditorChanged = throttle(function(o) {
    if (guardTimerId > 0) {
      return;
    }
    const s = editor.getValue();
    let msg = "";
    let msgColor = null;
    let buttonType = "save";
    let buttonEnabled = false;
    if (s === "" && currentId) {
      msg = "\u3053\u306e\u30b9\u30af\u30ea\u30d7\u30c8 [ " + currentId + " ] \u3092\u524a\u9664\u3067\u304d\u307e\u3059";
      msgColor = "#5764c6";
      buttonType = "remove";
      buttonEnabled = true;
    } else {
      if (document.querySelector("#editor>div.ace_gutter div.ace_error")) {
        msg = "\u30a8\u30e9\u30fc\u3092\u4fee\u6b63\u3057\u3066\u304f\u3060\u3055\u3044";
      } else {
        const id = getId(s);
        const version = getVersion(s);
        const site = getSite(s);
        if (!id) {
          msg = "@id \u306f\u5fc5\u305a\u6307\u5b9a\u3059\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059";
        }
        if (!version) {
          msg = "@version \u306f\u5fc5\u305a0\u3088\u308a\u5927\u304d\u3044\u6570\u5024\u3092\u6307\u5b9a\u3059\u308b\u5fc5\u8981\u304c\u3042\u308a\u307e\u3059";
        } else {
          if (!site || !site.match(/^https?:\/\//)) {
            msg = "@site \u306f\u5fc5\u305ahttp\u304b\u3089\u59cb\u307e\u308b\u6709\u52b9\u306aURL\u3092\u6307\u5b9a\u3057\u3066\u304f\u3060\u3055\u3044";
          } else {
            if (scripts[id] && currentId != id) {
              msg = "\u3053\u306eID [ " + id + " ] \u306f\u3059\u3067\u306b\u5b58\u5728\u3057\u3066\u3044\u307e\u3059";
            } else {
              if (document.querySelector("#editor>div.ace_gutter div.ace_error")) {
                msg = "\u30a8\u30e9\u30fc\u3092\u4fee\u6b63\u3057\u3066\u304f\u3060\u3055\u3044";
              } else {
                if (initialScript !== s) {
                  buttonEnabled = true;
                  if (scripts[id] && scripts[id].bundled) {
                    if (scripts[id].version > version) {
                      msg = "@version\u306e\u5024\u304c\u5c0f\u3055\u3044\u305f\u3081\u3001\u30d6\u30e9\u30a6\u30b6\u3092\u518d\u8d77\u52d5\u3059\u308b\u3068\u521d\u671f\u72b6\u614b\u306b\u30ea\u30bb\u30c3\u30c8\u3055\u308c\u307e\u3059\u3002";
                    } else {
                      if (scripts[id].version === version) {
                        msg = "\u3053\u306e\u30b9\u30af\u30ea\u30d7\u30c8\u306f\u62e1\u5f35\u5185\u306b\u540c\u68b1\u3055\u308c\u305f\u30b5\u30f3\u30d7\u30eb\u306e\u305f\u3081\u3001\u30d6\u30e9\u30a6\u30b6\u518d\u8d77\u52d5\u6642\u306b\u65b0\u3057\u3044\u30b9\u30af\u30ea\u30d7\u30c8\u306b\u4e0a\u66f8\u304d\u3055\u308c\u308b\u53ef\u80fd\u6027\u304c\u3042\u308a\u307e\u3059\u3002<br>\u6c38\u7d9a\u7684\u306a\u5909\u66f4\u304c\u5fc5\u8981\u3067\u3042\u308c\u3070@version\u306e\u5024\u3092\u5927\u304d\u304f\u3057\u3066\u304f\u3060\u3055\u3044\u3002";
                      } else {
                        msgColor = "#97a4f6";
                        msg = "\u3053\u306e\u30b9\u30af\u30ea\u30d7\u30c8\u3078\u306e\u5909\u66f4\u306f\u6c38\u7d9a\u7684\u3067\u3059 @version > " + scripts[id].version + "";
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
    showButton(buttonType, buttonEnabled);
    showMessage(msg, msgColor);
  }, 300);
  nav.addEventListener("click", function(e) {
    const target = e.target;
    if (target.tagName === "A") {
      const prev = nav.querySelector('li[class*="active"]');
      const change = function() {
        if (prev) {
          prev.classList.remove("active");
        }
        target.parentNode.classList.add("active");
        target.blur();
        const scriptId = target.getAttribute("scriptid");
        if (scriptId) {
          const script = scripts[scriptId];
          scriptTitle.innerHTML = escapeHTML(scriptId);
          initialScript = script.script;
          modified = false;
          currentId = scriptId;
          guard(function() {
            switchScript(script.enabled);
          });
          editor.setValue(initialScript, 1);
          editorSession.setScrollTop(0);
        }
      };
      if (modified) {
      } else {
        change();
      }
    }
  });
  function guard(callback) {
    if (guardTimerId) {
      clearTimeout(guardTimerId);
    }
    guardTimerId = setTimeout(function() {
      guardTimerId = 0;
      if (callback) {
        callback();
      }
    }, 500);
  }
  newButton.addEventListener("click", function(e) {
    const prepare = function() {
      const tmpId = (new Date).toISOString().replace(/[^\d]/g, "").substr(4, 8) + "-new";
      const tmpVersion = (new Date).toISOString().replace(/[^\d]/g, "").substr(0, 8);
      scriptTitle.innerHTML = "( new script )";
      initialScript = initialScriptTemplate.replace("$ID", tmpId).replace("$VERSION", tmpVersion);
      modified = false;
      currentId = null;
      guard(function() {
        switchScript(true);
      });
      editor.setValue(initialScript, 1);
    };
    if (modified) {
    } else {
      prepare();
    }
  });
  scriptSwitch.addEventListener("click", function(e) {
    switchScript(scriptSwitch.checked);
    if (currentId) {
      const script = editor.getValue();
      if (!scriptSwitch.checked && scripts[currentId] && scripts[currentId].script !== script) {
        guard();
        editor.setValue(scripts[currentId].script);
      }
      save();
    }
  });
  saveButton.addEventListener("click", function(e) {
    save();
  });
  removeButton.addEventListener("click", function(e) {
    const script = editor.getValue();
    if (script === "" && currentId) {
      delete scripts[currentId];
      currentId = null;
      save();
    }
  });
  function save() {
    const script = editor.getValue();
    const id = getId(script);
    const version = getVersion(script);
    const site = getSite(script);
    const enabled = scriptSwitch.checked;
    if (enabled && currentId && id && version && currentId !== id) {
      showMessage("ID\u304c\u5909\u66f4\u3055\u308c\u307e\u3057\u305f", "#5764c6");
      delete scripts[currentId];
    }
    if (id && version && site && site.match(/^https?:\/\//)) {
      currentId = id;
      scripts[id] = {id, version, site, script, enabled};
    }
    WebExtensions.runtime.sendMessage({cmd:CMD_SAVE_SCRIPTS, scripts:scripts}, function(result) {
      if (result.err) {
        showMessage("\u30b9\u30af\u30ea\u30d7\u30c8\u306e\u4fdd\u5b58\u306b\u5931\u6557\u3057\u307e\u3057\u305f");
      } else {
        const newScripts = result.LMScripts;
        let diff = false;
        for (const k in newScripts) {
          diff |= !scripts[k];
        }
        for (const k in scripts) {
          diff |= !newScripts[k];
        }
        if (diff) {
          showMessage("\u30b9\u30af\u30ea\u30d7\u30c8\u306e\u4fdd\u5b58\u306b\u5931\u6557\u3057\u307e\u3057\u305f");
        } else {
          scripts = newScripts;
          init();
        }
      }
    });
  }
  function showMessage(msg, color) {
    const message = document.getElementById("message");
    message.style.color = color || "#f60b91";
    message.innerHTML = msg;
  }
  function showButton(type, enable) {
    const op = enable ? "remove" : "add";
    if (type === "remove") {
      saveButton.style.display = "none";
      removeButton.style.display = "inline";
      removeButton.classList[op]("disabled");
    } else {
      saveButton.style.display = "inline";
      removeButton.style.display = "none";
      saveButton.classList[op]("disabled");
    }
  }
  function switchScript(enable) {
    scriptSwitch.checked = enable;
    const scriptEnabled = document.getElementById("script-enabled");
    scriptEnabled.innerHTML = enable ? MSG_ScriptEnabled : MSG_ScriptDisabled;
    editor.setReadOnly(!enable);
    document.getElementById("editor").style.opacity = enable ? 1.0 : 0.3;
    if (currentId) {
      const a = nav.querySelector('a[scriptid="' + escapeHTML(currentId) + '"]');
      if (a) {
        a.style.opacity = enable ? 1.0 : 0.3;
      }
    }
  }
  function escapeHTML(string) {
    return string.replace(/[&'`"<>]/g, function(match) {
      return {"&":"&amp;", "'":"&#x27;", "`":"&#x60;", '"':"&quot;", "<":"&lt;", ">":"&gt;"}[match];
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
})();

