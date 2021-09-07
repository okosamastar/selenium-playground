const embed = (js, append = false, attributes = {}) => {
  var script = generate_script_tag(js, true);
  for(var name in attributes) {
    script.setAttribute(name, attributes[name]);
  }
  if(append) {
    document.head.appendChild(script);
  } else {
    document.head.insertBefore(script, document.head.firstElementChild);
  }
};

const generate_script_tag = (js, internal) => {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  if(internal) {
    script.setAttribute('src', chrome.extension.getURL(js));
  } else {
    script.setAttribute('src', js);
  }
  script.setAttribute('id', js.split('.')[0]);
  return script;
};

const enableInvolved = () => {
  embed('embedded-involved.js');
};

const enableSherpa = () => {
  chrome.extension.sendMessage({op: 'getSitekey', url: location.href}, (response) => {
    if(response.sitekey) {
      var script = generate_script_tag(response.publish_path, false);
      document.head.appendChild(script);
    };
  });
};

const checkSitekey = (sherpa, sitekeys) => {
  embed('embedded-check-sitekey.js', false, {
    sherpa: sherpa,
    sitekeys: sitekeys.join(',')
  });
};

const disableSherpa = () => {
};

const enableBuilding = () => {
  embed('embedded-building.js');
};

const disableBuilding = () => {
};

const enableConfirming = () => {
  embed('embedded-confirming.js');
};

const disableConfirming = () => {
};

const enableDummyAd = () => {
  embed('embedded-dummyad.js');
};

const disableDummyAd = () => {
};

const enableNativeAdCtrl = () => {
  chrome.extension.sendMessage({op: 'adminUrl'}, (response) => {
    embed('embedded-native-ad-ctrl.js', false, {
      admin_url: response.adminUrl,
      icon_ad_block: chrome.extension.getURL('/icons/icon_adblock.png')
    });
  });
};

const disableNativeAdCtrl = () => {
  embed('embedded-native-ad-ctrl-disable.js');
};

const enableDebug = () => {
  embed('embedded-debug.js');
  load_icon_style();
};

const enableDraft = () => {
  embed('embedded-draft.js');
};

const load_icon_style = () => {
  var icon_style = document.createElement('style');
  icon_style.textContent = `.sherpa-extension-menu-icon:before{ content: url(${chrome.extension.getURL('/icons/icon38.png')});width: 38px;height: 38px;display: inline-block;cursor: pointer;}` +
    `.sherpa-extension-close-icon:before{ content: "";background-image: url(${chrome.extension.getURL('/icons/close.png')});width: 12px;height: 12px;display: inline-block;cursor: pointer;background-size: contain;}` +
    `.sherpa-extension-trash-icon:before{ content: "";background-image: url(${chrome.extension.getURL('/icons/trash.png')});width: 14px;height: 14px;display: inline-block;background-size: contain;vertical-align: middle;}` +
    `.sherpa-extension-flash-icon:before{ content: "";background-image: url(${chrome.extension.getURL('/icons/flash.svg')});width: 14px;height: 14px;display: inline-block;background-size: contain;vertical-align: middle;}` +
    `.sherpa-extension-play-icon:before{ content: "";background-image: url(${chrome.extension.getURL('/icons/play.png')});width: 13px;height: 13px;display: inline-block;background-size: contain;vertical-align: bottom;}` +
    `.sherpa-extension-pause-icon:before{ content: "";background-image: url(${chrome.extension.getURL('/icons/pause.png')});width: 12px;height: 12px;display: inline-block;background-size: contain;vertical-align: bottom;}` +
    `.sherpa-extension-stop-icon:before{ content: "";background-image: url(${chrome.extension.getURL('/icons/stop.png')});width: 12px;height: 12px;display: inline-block;background-size: contain;vertical-align: bottom;}` +
    `.sherpa-extension-hand-up-icon:before{ content: "";background-image: url(${chrome.extension.getURL('/icons/hand-up.png')});width: 30px;height: 30px;display: inline-block;background-size: contain;}` +
    `.sherpa-extension-hand-up-click-icon:before{ content: "";background-image: url(${chrome.extension.getURL('/icons/hand-up-click.png')});width: 60px;height: 60px;display: inline-block;background-size: contain;-webkit-transition: width 200ms, height 200ms;transition: width 200ms, height 200ms;}` +
    `.sherpa-extension-hand-up-click-icon.sherpa-extension-click-animation:before{ width: 30px;height: 30px;}` +
    `.sherpa-extension-pencil-icon:before{ content: "";background-image: url(${chrome.extension.getURL('/icons/pencil.png')});width: 40px;height: 40px;display: inline-block;background-size: contain;-webkit-transition: width 200ms, height 200ms;transition: width 200ms, height 200ms;}` +
    `.sherpa-extension-pencil-icon.sherpa-extension-keyup-animation:before{ width: 30px;height: 30px;}`;
  document.head.append(icon_style);
};

const disableDebug = () => {
};

const disableDraft = () => {
};

const clearHeatmap = () => {
  embed('embedded-clear-heatmap.js', true);
};
const enableClickHeatmap = () => {
  embed('embedded-click-heatmap.js', true);
};
const enableMouseHeatmap = () => {
  embed('embedded-mouse-heatmap.js', true);
};
const enableScrollHeatmap = () => {
  embed('embedded-scroll-heatmap.js', true);
};

chrome.extension.sendMessage({op: 'checkStatus'}, (response) => {
  if( response.isEnable ) {
    enableSherpa();
  }
  embed('embedded-after-publish-js-run.js');
  checkSitekey(response.sherpa, response.sitekeys);
  if( response.isBuilding || response.isConfirming || response.isDummyAd || response.isEnable || response.isDebug || response.isDraft ) {
    enableInvolved();
  }
  if( response.isBuilding ) {
    enableBuilding();
  }
  if( response.isConfirming ) {
    enableConfirming();
  }
  if( response.isDummyAd ) {
    enableDummyAd();
  }
  if( response.isNativeAdCtrl ) {
    enableNativeAdCtrl();
  }
  if( response.isDebug ) {
    enableDebug();
  }
  if( response.isDraft ) {
    enableDraft();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.op == 'enableSherpa') {
    enableSherpa();
    sendResponse({});
  } else if (request.op == 'disableSherpa') {
    disableSherpa();
    sendResponse({});
  } else if (request.op == 'enableBuilding') {
    enableBuilding();
    sendResponse({});
  } else if (request.op == 'disableBuilding') {
    disableBuilding();
    sendResponse({});
  } else if (request.op == 'enableConfirming') {
    enableConfirming();
    sendResponse({});
  } else if (request.op == 'disableConfirming') {
    disableConfirming();
    sendResponse({});
  } else if (request.op == 'enableDummyAd') {
    enableDummyAd();
    sendResponse({});
  } else if (request.op == 'disableDummyAd') {
    disableDummyAd();
    sendResponse({});
  } else if (request.op == 'enableNativeAdCtrl') {
    enableNativeAdCtrl();
    sendResponse({});
  } else if (request.op == 'disableNativeAdCtrl') {
    disableNativeAdCtrl();
    sendResponse({});
  } else if (request.op == 'enableDebug') {
    enableDebug();
    sendResponse({});
  } else if (request.op == 'disableDebug') {
    disableDebug();
    sendResponse({});
  } else if (request.op == 'enableDraft') {
    enableDraft();
    sendResponse({});
  } else if (request.op == 'disableDraft') {
    disableDraft();
    sendResponse({});
  } else if (request.op == 'clearHeatmap') {
    clearHeatmap();
    sendResponse({});
  } else if (request.op == 'enableClickHeatmap') {
    enableClickHeatmap();
    sendResponse({});
  } else if (request.op == 'enableMouseHeatmap') {
    enableMouseHeatmap();
    sendResponse({});
  } else if (request.op == 'enableScrollHeatmap') {
    enableScrollHeatmap();
    sendResponse({});
  } else {
    sendResponse({});
  }
});
