const ADMIN_URLS = {
  development: 'http://localhost:5000',
  staging: 'https://admin-stg.gacraft.jp',
  production: 'https://admin.gacraft.jp'
};

const sherpaLoginKey = 'sherpa-login1';

var getEnv = (done) => {
  var env = localStorage.getItem('sherpa-env') || 'production';
  return env;
};

var setEnv = (env) => {
  localStorage.setItem('sherpa-env', env);
  localStorage.setItem(sherpaLoginKey, '');
};

var adminUrl = () => {
  return ADMIN_URLS[getEnv()];
};


const xhrRequest = (url, done) => {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if(xhr.readyState == 4) {
      if( xhr.status == 200){
        return done(null, xhr.response);
      }
      return done('Failure', {});
    }
  };
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.send();
};

var getLogin = (done) => {
  var login = localStorage.getItem(sherpaLoginKey);
  if(login) {
    var loginResult = JSON.parse(login);
    if(loginResult.expireTime >= new Date().getTime()) {
      return done(null, loginResult);
    }
  }
  xhrRequest(`${adminUrl()}/logincheck`, (err, loginResult) => {
    if(err || !loginResult) {
      localStorage.setItem(sherpaLoginKey, '');
      return done(err, {});
    }
    loginResult.expireTime = new Date().getTime() + 3600000;
    localStorage.setItem(sherpaLoginKey, JSON.stringify(loginResult));
    done(err, loginResult);
  });
};

var getSherpaStatus = () => {
  return localStorage.getItem('sherpa-enable') == 'true';
};

var setSherpaStatus = (isEnable) => {
  setBadge(isEnable);
  localStorage.setItem('sherpa-enable', isEnable);
};

var getBuildingStatus = () => {
  return localStorage.getItem('building-enable') == 'true';
};

var setBuildingStatus = (isBuilding) => {
  localStorage.setItem('building-enable', isBuilding);
};

var getConfirmingStatus = () => {
  return localStorage.getItem('confirming-enable') == 'true';
};

var setConfirmingStatus = (isConfirming) => {
  localStorage.setItem('confirming-enable', isConfirming);
};

var getDummyAdStatus = () => {
  return localStorage.getItem('dummyAd-enable') == 'true';
};

var setDummyAdStatus = (isDummyAd) => {
  localStorage.setItem('dummyAd-enable', isDummyAd);
};

var getNativeAdCtrlStatus = () => {
  return localStorage.getItem('native-ad-ctrl-enable') == 'true';
};

var setNativeAdCtrlStatus = (isNativeAdCtrl) => {
  localStorage.setItem('native-ad-ctrl-enable', isNativeAdCtrl);
};

var getDebugStatus = () => {
  return localStorage.getItem('debug-enable') == 'true';
};

var setDebugStatus = (isDebug) => {
  localStorage.setItem('debug-enable', isDebug);
};

var getDraftStatus = () => {
  return localStorage.getItem('draft-enable') == 'true';
};

var setDraftStatus = (isDraft) => {
  localStorage.setItem('draft-enable', isDraft);
};

const setBadge = (isEnable) => {
  if(isEnable) {
    chrome.browserAction.setBadgeText({text:'有効'});
  } else {
    chrome.browserAction.setBadgeText({text:''});
  }
};

chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  if (request.op == 'getSitekey') {
    xhrRequest(`${adminUrl()}/sitekeyjs?url=${encodeURIComponent(request.url)}`, (err, json) => {
      if(err) {
        sendResponse({});
      } else {
        sendResponse(json);
      }
    });
    return true;
  } else if (request.op == 'adminUrl') {
    sendResponse({
      adminUrl: adminUrl()
    });
    return true;
  } else if (request.op == 'checkStatus') {
    removeMenu();
    getLogin((err, loginResult) => {
      if (loginResult.login) {
        createMenu();
        var isEnable = getSherpaStatus();
        var isBuilding = getBuildingStatus();
        var isConfirming = getConfirmingStatus();
        var isDummyAd = getDummyAdStatus();
        var isNativeAdCtrl = getNativeAdCtrlStatus();
        var isDebug = getDebugStatus();
        var isDraft = getDraftStatus();
        setBadge(isEnable);

        sendResponse({
          isEnable: isEnable,
          isBuilding: isBuilding,
          isConfirming: isConfirming,
          isDummyAd: isDummyAd,
          isNativeAdCtrl: isNativeAdCtrl,
          isDebug: (isDebug && loginResult.sherpa),
          isDraft: (isDraft && loginResult.sherpa),
          sitekeys: loginResult.sitekeys,
          sherpa: loginResult.sherpa
        });
      } else {
        sendResponse({
          isEnable: false,
          isBuilding: false,
          isConfirming: false,
          isDummyAd: false,
          isNativeAdCtrl: false,
          isDebug: false,
          isDraft: false,
          sitekeys: [],
          sherpa: false
        });
      }
    });
    return true;
  }
  return false;
});

const removeMenu = () => {
  try {
    chrome.contextMenus.remove('sherpa-menu-clear');
    chrome.contextMenus.remove('sherpa-menu-click');
    chrome.contextMenus.remove('sherpa-menu-mouse');
    chrome.contextMenus.remove('sherpa-menu-scroll');
  } catch(e) {
  }
};

const createMenu = () => {
  chrome.contextMenus.create({
    id: 'sherpa-menu-clear',
	  title: 'Clear heatmap',
	  type: 'radio',
	  contexts: ['all']
  });
  chrome.contextMenus.create({
    id: 'sherpa-menu-click',
	  title: 'Click heatmap',
	  type: 'radio',
	  contexts: ['all']
  });
  chrome.contextMenus.create({
    id: 'sherpa-menu-mouse',
	  title: 'Mouse heatmap',
	  type: 'radio',
	  contexts: ['all']
  });
  chrome.contextMenus.create({
    id: 'sherpa-menu-scroll',
	  title: 'Scroll heatmap',
	  type: 'radio',
	  contexts: ['all']
  });
}

chrome.runtime.onInstalled.addListener(() => {
  getLogin((err, loginResult) => {
    if(loginResult.login) {
      createMenu();
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  var op = null;
  if(info.menuItemId == 'sherpa-menu-clear') {
    op = 'clearHeatmap';
  } else if(info.menuItemId == 'sherpa-menu-click') {
    op = 'enableClickHeatmap';
  } else if(info.menuItemId == 'sherpa-menu-mouse') {
    op = 'enableMouseHeatmap';
  } else if(info.menuItemId == 'sherpa-menu-scroll') {
    op = 'enableScrollHeatmap';
  }
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tab.id,
      {
        op: op
      },
      (response) => {
      });
  });
});
