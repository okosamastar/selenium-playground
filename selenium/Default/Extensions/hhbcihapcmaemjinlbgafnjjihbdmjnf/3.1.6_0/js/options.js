/*
 *  This file is part of Douga-Getter <https://www.douga-getter.com/>
 *  Due to restrictions of Google's terms, downloading videos from YouTube is disabled in this extension.
 */

'use strict';
(function() {
  const WebExtensions = navigator.userAgent.includes("Chrome") ? chrome : browser;
  const i18n = WebExtensions.i18n;
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
  let option = null;
  const checks = ["pass_large", "ignore_small", "ignore_ts", "show_icon_on_thumbnail"];
  const radios = ["ts_parallel"];
  const init = function() {
    if (option) {
      const parallelSetting = document.getElementById("ts-parallel-container");
      if (parallelSetting && navigator.userAgent.includes("Chrome")) {
        parallelSetting.style.display = "block";
      }
      checks.forEach(function(id) {
        if (option[id] != null) {
          const checkbox = document.getElementById(id);
          if (checkbox) {
            checkbox.checked = option[id];
          }
        }
      });
      radios.forEach(function(id) {
        if (option[id] != null) {
          const radio = document.querySelector('input[name="' + id + '"][value="' + option[id] + '"]');
          if (radio) {
            radio.checked = true;
          }
        }
      });
    }
  };
  WebExtensions.runtime.sendMessage({cmd:CMD_SETTING, params:{operation:"get"}}, function(result) {
    option = result;
    init();
  });
  const start = function() {
    init();
    checks.forEach(function(id) {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        checkbox.addEventListener("click", function(evt) {
          WebExtensions.runtime.sendMessage({cmd:CMD_SETTING, params:{operation:"set", key:id, value:checkbox.checked}});
        });
      }
    });
    radios.forEach(function(id) {
      const buttons = document.querySelectorAll('input[name="' + id + '"]');
      for (let i = 0, len = buttons.length; i < len; i++) {
        buttons[i].addEventListener("click", function(evt) {
          WebExtensions.runtime.sendMessage({cmd:CMD_SETTING, params:{operation:"set", key:id, value:parseInt(evt.target.value)}});
        });
      }
    });
  };
  document.addEventListener("DOMContentLoaded", start);
})();

