(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.window = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var browser = require('browser/Browser');
var isNewInstall = browser.isNewInstall();
var lib = require('common/Lib');
var ignore = require('common/lib/ignore');
var Modules = require('common/Modules');

var Analytics = require('common/analytics/Analytics');
var extend = require('extend');
var Counter = require('common/utils/Counter.js');
var createRequestQueue = require('common/utils/RequestQueue');
var simpleStorage = require('common/storage/simpleStorage');
var OAuthQueue = require('common/oauth/OAuthQueue');
var SemrushClient = require('common/semrush/SemrushClient');

var Parameters = require('common/parameters/Parameters');
var ParametersSource = require('common/parameters/ParametersCache');

var configuration = require('common/Configuration').createStorage(browser);
var parameters = require('common/Parameters').createStorage(browser);
var mainMenu = browser.createMainPanel();
var modules = new Modules();
var dataSource = new ParametersSource({}, parameters, createRequestQueue);
var menuRoot = browser.createContextMenuItem('SEOquake');
var readyDocuments = new Map();
var oauth = new OAuthQueue(browser);
var semrushClient = new SemrushClient(browser, oauth, configuration);

var messagesDispatcher = {
  'sq.getConfigurationItem': function sqGetConfigurationItem(data, callback, sender) {
    callback(configuration.get(data));
  },

  'sq.getConfigurationBranch': function sqGetConfigurationBranch(data, callback, sender) {
    if ('plugin' in data) {
      callback(configuration.getBranch(data.plugin));
    } else {
      callback(configuration.getBranch('core'));
    }
  },

  'sq.getConfiguration': function sqGetConfiguration(data, callback, sender) {
    callback(configuration.getAll());
  },

  'sq.setConfigurationItem': function sqSetConfigurationItem(data, callback, sender) {
    configuration.set(data.name, data.value);
    configuration.save();
    callback(configuration.get(data.name));
  },

  'sq.setConfiguration': function sqSetConfiguration(data, callback, sender) {
    configuration.set(data);
    configuration.save();
    callback(configuration.getAll());
  },

  'sq.resetConfiguration': function sqResetConfiguration(data, callback, sender) {
    configuration.restoreDefaultValues();
    parameters.restoreDefaultValues();
    callback();
  },

  'sq.updateConfiguration': function sqUpdateConfiguration(data, callback, sender) {
    browser.sendMessageToAllTabs('sq.updateConfiguration', configuration.getAll(), callback, sender);
  },

  'sq.isDefaultConfiguration': function sqIsDefaultConfiguration(data, callback, sender) {
    callback(configuration.isDefault && parameters.isDefault);
  },

  'sq.getParameters': function sqGetParameters(data, callback, sender) {
    callback(parameters.getAll());
  },

  'sq.getPluginParameters': function sqGetPluginParameters(data, callback, sender) {
    callback(parameters.getPluginParameters(data.plugin));
  },

  'sq.setParameters': function sqSetParameters(data, callback, sender) {
    parameters.set(data);
    parameters.save();
    callback(parameters.getAll());
  },

  'sq.deleteParameter': function sqDeleteParameter(data, callback, sender) {
    if (lib.isObject(data) && data.hasOwnProperty('id')) {
      parameters.deleteBranch(data.id);
    }

    callback(parameters.save());
  },

  'sq.restoreModifiedParameters': function sqRestoreModifiedParameters(data, callback, sender) {
    parameters.restoreModified();
    callback(parameters.getAll());
  },

  'sq.restoreDeletedParameters': function sqRestoreDeletedParameters(data, callback, sender) {
    parameters.restoreDeleted();
    callback(parameters.getAll());
  },

  'sq.deleteCustomParameters': function sqDeleteCustomParameters(data, callback, sender) {
    parameters.deleteCustom();
    callback(parameters.getAll());
  },

  'sq.disableParameter': function sqDisableParameter(data, callback, sender) {
    parameters.disableParameter(data.id, data.plugin);
    callback(parameters.getAll());
  },

  'sq.enableParameter': function sqEnableParameter(data, callback, sender) {
    parameters.enableParameter(data.id, data.plugin);
    callback(parameters.getAll());
  },

  'sq.moduleRun': function sqModuleRun(data, callback, sender) {
    try {
      var module = modules.runModule(data.name, data.configuration);
      callback({
        id: module.id,
        name: module.name
      });
    } catch (e) {
      console.log(e);
      callback(null);
    }
  },

  'sq.moduleClose': function sqModuleClose(data, callback, sender) {
    try {
      modules.closeModule(data.name, data.id);
    } catch (e) {
      console.log(e);
    }

    callback();
  },

  'sq.moduleGetData': function sqModuleGetData(data, callback, sender) {
    try {
      callback(modules.getData(data.name, data.id));
    } catch (e) {
      console.log(e);
      callback(null);
    }
  },

  'sq.moduleGetDataEx': function sqModuleGetDataEx(data, callback, sender) {
    try {
      modules.getDataEx(data.name, data.id, callback, data.arguments);
    } catch (e) {
      console.log(e);
      callback(null);
    }
  },

  'sq.openConfigurationWindow': function sqOpenConfigurationWindow(data, callback, sender) {
    var panel = '';

    if (data && 'panel' in data) {
      panel = '#' + data.panel;
    }

    browser.openConfigurationWindow(panel);

    callback();
  },

  'sq.closeConfigurationWindow': function sqCloseConfigurationWindow(empty, callback, sender) {
    browser.closeConfigurationWindow();
    callback();
  },

  'sq.clearCache': function sqClearCache(empty, callback, sender) {
    semrushClient.clearCache();
    parametersMethods.clearCache(empty, callback, sender);
  },

  'sq.getCurrentTabUrl': function sqGetCurrentTabUrl(data, callback, sender) {
    browser.getCurrentTabUrl(callback);
  },

  'sq.getCoreState': function sqGetCoreState(data, callback, sender) {
    callback({
      disabled: configuration.get('core.disabled')
    });
  },

  'sq.hidePanel': function sqHidePanel(data, callback, sender) {
    mainMenu.hide();
    callback();
  },

  'sq.openTab': function sqOpenTab(url, callback, sender) {
    browser.openTab(url);
    callback();
  },

  'sq.closeTab': function sqCloseTab(url, callback, sender) {
    browser.closeTab(sender);
    callback();
  },

  'sq.t': function sqT(data, callback, sender) {
    if (data.hasOwnProperty('messageId')) {
      callback(browser.t(data.messageId));
    } else {
      callback('Message not found');
    }
  },

  'sq.showMainMenu': function sqShowMainMenu(empty, callback, sender) {
    mainMenu.show();
    callback();
  },

  'sq.documentReady': function sqDocumentReady(empty, callback, sender) {
    if (sender === undefined) {
      callback();
      return;
    }

    if (readyDocuments.has(sender)) {
      readyDocuments.get(sender).inc();
    } else {
      readyDocuments.set(sender, new Counter(1));
    }

    callback();
  },

  'sq.documentClosed': function sqDocumentClosed(empty, callback, sender) {
    if (readyDocuments.has(sender)) {
      readyDocuments.delete(sender);
    }

    callback();
  },

  'sq.isDocumentReady': function sqIsDocumentReady(data, callback, sender) {
    if ('id' in data) {
      if (readyDocuments.has(data.id)) {
        callback('YES');
        return;
      }
    }

    callback('NO');
  },

  'sq.alive': function sqAlive(data, callback, sender) {
    callback('YES');
  },

  'sq.requestUrl': function sqRequestUrl(data, callback, sender) {
    data = extend(true, {
      url: '',
      type: 'get'
    }, data);
    var xhr = browser.createXHR();
    xhr.open(data.type, data.url);

    if (data.hasOwnProperty('headers')) {
      data.headers.forEach(function (item) {
        return xhr.setRequestHeader(item[0], item[1]);
      });
    }

    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        try {
          callback({
            readyState: this.readyState,
            status: this.status,
            responseText: this.responseText,
            headers: this.getAllResponseHeaders()
          });
        } catch (error) {}
      }
    };

    if ('data' in data) {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send(data.data);
    } else {
      xhr.send();
    }
  },

  'sq.semrushRequest': function sqSemrushRequest(data, callback, sender) {
    try {
      semrushClient.process(data, callback);
    } catch (e) {
      try {
        callback(e);
      } catch (ignore) {}
    }
  },

  'sq.oauthStart': function sqOauthStart(data, callback, sender) {
    callback(oauth.addRequest(data));
  },

  'sq.oauthCode': function sqOauthCode(data, callback, sender) {
    var result = oauth.processRequest(data);
    if (result) {
      browser.sendMessageToConfigurationTab('sq.oauthReady', result, function (result) {
        callback(result);
      }, sender);
    } else {
      callback(false);
    }
  },

  'sq.oauthError': function sqOauthError(data, callback, sender) {
    var result = oauth.processError(data);
    if (result) {
      browser.sendMessageToConfigurationTab('sq.oauthReady', result, function (result) {
        callback(result);
      }, sender);
    } else {
      callback(false);
    }
  }
};

simpleStorage(messagesDispatcher, browser);

var analyticsConfiguration = {
  'ga-id': 'UA-3071592-17',
  url: 'https://www.google-analytics.com/collect'
};

var analytics = new Analytics(messagesDispatcher, analyticsConfiguration);
var parametersMethods = new Parameters(messagesDispatcher, dataSource);

function afterConfigurationChanged() {
  dataSource.setConfig('delay', this.get('core.request_delay'));
  dataSource.setConfig('useCache', this.get('core.use_cache'));
  mainMenu.setIconStatus(this.get('core.disabled'));
  analytics.setConfig('disabled', this.get('advanced.disable_ga'));
}

configuration.onReady(afterConfigurationChanged);
configuration.onAfterSave(afterConfigurationChanged);

mainMenu.dispatcher = messagesDispatcher;
browser.registerContentScripts(messagesDispatcher);
browser.registerAnalytics(analytics);

menuRoot.addChild(browser.createContextMenuItem(browser.t('menuItemPageinfo'), function () {
  modules.runModule('common');
  browser.registerEvent('pageinfo', 'context-menu');
})).addChild(browser.createContextMenuItem(browser.t('menuItemDiagnosis'), function () {
  modules.runModule('common', { which: 'diagnosis' });
  browser.registerEvent('diagnosis', 'context-menu');
})).addChild(browser.createContextMenuItem(browser.t('menuItemDensity'), function () {
  modules.runModule('common', { which: 'density' });
  browser.registerEvent('density', 'context-menu');
})).addChild(browser.createContextMenuItem(browser.t('menuItemLinkInfo'), function () {
  browser.getCurrentTabUrl().then(function (tabData) {
    return modules.runModule('linkinfo', { url: tabData[0] });
  }).catch(function (reason) {
    return modules.runModule('linkinfo');
  });
  browser.registerEvent('linkinfo', 'context-menu');
})).addSeparator().addChild(browser.createContextMenuItem(browser.t('menuItemOptions'), function () {
  browser.openConfigurationWindow();
  browser.registerEvent('preferences', 'context-menu');
}));

try {
  if (typeof window !== 'undefined' && window.hasOwnProperty('screen') && window.hasOwnProperty('navigator')) {
    analytics.analyticsReady(screen.width + 'x' + screen.height, screen.colorDepth + '-bits', navigator.language);
  } else {
    analytics.analyticsReady();
  }
} catch (e) {}

setTimeout(function () {
  semrushClient.requestRefreshToken(function () {
    return null;
  });
});

},{"browser/Browser":2,"common/Configuration":6,"common/Lib":7,"common/Modules":9,"common/Parameters":10,"common/analytics/Analytics":11,"common/lib/ignore":23,"common/oauth/OAuthQueue":37,"common/parameters/Parameters":38,"common/parameters/ParametersCache":39,"common/semrush/SemrushClient":41,"common/storage/simpleStorage":44,"common/utils/Counter.js":45,"common/utils/RequestQueue":47,"extend":53}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lib = require('../common/Lib');
var ignore = require('../common/lib/ignore');
var Browser = require('../common/browserBase/Browser');
var extend = require('extend');

var _require = require('./MainPanel'),
    MainPanel = _require.MainPanel,
    _createMainPanel = _require.createMainPanel;

var Tab = require('../common/browserBase/Tab');

var clientMatches = [/^http(s)?:\/\//i];

var clientExcludeMatches = [/^http(s)?:\/\/.*\.facebook\.(com|net)\/.*/i, /^http(s)?:\/\/.*\.fbcdn\.(com|net)\/.*/i, /^http(s)?:\/\/.*\.akamaihd\.(com|net)\/.*/i, /^http(s)?:\/\/.*\.virtualearth\.(com|net)\/.*/i, /^http(s)?:\/\/.*\.youtube\.(com|net)\/.*/i, /^http(s)?:\/\/.*addons.opera\.com\/.*/i];

var gscMatches = [/^https:\/\/www\.google\.com\/webmasters\/tools\/external-links\?.*/i, /^https:\/\/www\.google\.com\/webmasters\/tools\/external-links-domain\?.*/i, /^https:\/\/www\.google\.com\/webmasters\/tools\/search-analytics\?.*/i, /^https:\/\/www\.google\.com\/webmasters\/tools\/dashboard\?.*/i];

var gscExcludeMatches = [];

var messageIndex = 0;
var instance = void 0;

function nop() {}

function defaultCallback(data, callbackResult) {
  callbackResult(data);
}

function sendAnswer(action, data, callbackResult) {
  var _this = this;

  if (this.tab || this.tab === null) {
    setTimeout(function () {
      _this.port.emit('sq.answer.' + action + '.' + data.timestamp, callbackResult);
    }, 5);
  } else {
    throw new Error('Tab already closed', Browser.SEOQ_ERROR_TAB_CLOSED);
  }
}

function _loadContentCss(tab) {
  var scriptConfig = {
    allFrames: false,
    file: 'plugins.css'
  };

  if (clientMatches.every(function (regexp) {
    return regexp.test(tab.url);
  }) && !clientExcludeMatches.some(function (regexp) {
    return regexp.test(tab.url);
  })) {
    return new Promise(function (resolve) {
      return chrome.tabs.insertCSS(tab.getIdentifier(), scriptConfig, resolve);
    });
  } else {
    return Promise.reject('No match');
  }
}

function _loadContentScripts(tab) {
  var scriptConfig = {
    allFrames: false,
    file: 'data/plugins.js'
  };

  if (clientMatches.every(function (regexp) {
    return regexp.test(tab.url);
  }) && !clientExcludeMatches.some(function (regexp) {
    return regexp.test(tab.url);
  })) {
    return new Promise(function (resolve) {
      return chrome.tabs.executeScript(tab.getIdentifier(), scriptConfig, resolve);
    }).then(function () {
      return _loadContentCss(tab);
    }).catch(ignore);
  } else {
    return Promise.reject('No match');
  }
}

function _sendMessage(tab, data) {
  return new Promise(function (resolve, reject) {
    chrome.tabs.sendMessage(tab.getIdentifier(), data, function (result) {
      if (result === undefined && chrome.runtime.lastError) {
        if (chrome.runtime.lastError.message === 'Could not establish connection. Receiving end does not exist.') {
          _loadContentScripts(tab).then(function () {
            return chrome.tabs.sendMessage(tab.getIdentifier(), data, resolve);
          }).catch(reject);
        } else {
          resolve();
        }
      } else {
        resolve(result);
      }
    });
  });
}

var ChromeBrowser = function (_Browser) {
  _inherits(ChromeBrowser, _Browser);

  function ChromeBrowser() {
    _classCallCheck(this, ChromeBrowser);

    var _this2 = _possibleConstructorReturn(this, (ChromeBrowser.__proto__ || Object.getPrototypeOf(ChromeBrowser)).call(this));

    chrome.runtime.setUninstallURL('https://www.seoquake.com/review/uninstall.php?t=1');
    return _this2;
  }

  _createClass(ChromeBrowser, [{
    key: 'isNewInstall',
    value: function isNewInstall() {
      var version = localStorage.getItem('version');
      return Promise.resolve(version === null || version === undefined);
    }
  }, {
    key: 'getUserUniqId',
    value: function getUserUniqId() {
      var uuid = localStorage.getItem('uuid');
      if (!uuid) {
        uuid = lib.getUUID();
        localStorage.setItem('uuid', uuid);
      }

      return uuid;
    }
  }, {
    key: 'createMainPanel',
    value: function createMainPanel() {
      return _createMainPanel(null, null);
    }
  }, {
    key: 'getConfigValue',
    value: function getConfigValue(configKey, defaultValue) {
      var value = localStorage.getItem(configKey);
      if (value === undefined) {
        return defaultValue;
      }

      try {
        value = JSON.parse(value);
      } catch (e) {
        value = defaultValue;
      }

      return value;
    }
  }, {
    key: 'setConfigValue',
    value: function setConfigValue(configKey, value) {
      localStorage.setItem(configKey, JSON.stringify(value));
      chrome.storage.local.set(_defineProperty({}, configKey, JSON.stringify(value)));
    }
  }, {
    key: 'loadConfiguration',
    value: function loadConfiguration(defaultValues, storageKey, callback) {
      var _this3 = this;

      var configuration = this.getConfigValue(storageKey);
      callback(defaultValues, configuration, function (values) {
        return _this3.setConfigValue(storageKey, values);
      });
    }
  }, {
    key: 'loadCoreConfiguration',
    value: function loadCoreConfiguration(callback) {
      var version = this.getConfigValue('version');
      if (version === null || version === undefined) {
        localStorage.setItem('installDate', JSON.stringify(new Date()));
      }

      localStorage.setItem('version', this.version);

      this.loadConfiguration(require('../common/defaults/configuration'), 'configuration', callback);
    }
  }, {
    key: 'loadParametersConfiguration',
    value: function loadParametersConfiguration(callback) {
      this.loadConfiguration(require('../common/defaults/parameters'), 'parameters', callback);
    }
  }, {
    key: 'addMessageListener',
    value: function addMessageListener(action, callback) {
      var _this4 = this;

      if (callback === undefined) {
        callback = defaultCallback;
      }

      this.port.on(action, function (data) {
        if (!('timestamp' in data)) {
          return;
        }

        callback(data.payload, sendAnswer.bind(_this4, action, data));
      });
    }
  }, {
    key: 'sendMessageToTab',
    value: function sendMessageToTab(tab, action, messageData, callback) {
      if (lib.isFunction(messageData)) {
        callback = messageData;
        messageData = {};
      }

      var data = {
        action: action,
        payload: messageData,
        timestamp: new Date().getTime() + '.' + messageIndex++ };

      if (callback === undefined) {
        return _sendMessage(tab, data);
      } else {
        _sendMessage(tab, data).then(function (result) {
          return callback(result);
        }).catch(callback.bind(this));
      }
    }
  }, {
    key: 'openTab',
    value: function openTab(url) {
      chrome.tabs.create({ url: url });
    }
  }, {
    key: 'closeTab',
    value: function closeTab(id) {
      chrome.tabs.remove(id);
    }
  }, {
    key: 'openModuleTab',
    value: function openModuleTab(page, params, newWindow) {
      newWindow = newWindow || false;

      chrome.windows.getAll({ populate: true }, function (windows) {
        var preferencesOpened = false;
        var modulePageUrl = chrome.extension.getURL(page);

        if (params !== undefined) {
          if (params.startsWith('#')) {
            modulePageUrl += params;
          } else {
            modulePageUrl += '?' + params;
          }
        }

        windows.forEach(function (windowItem) {
          windowItem.tabs.forEach(function (tab) {
            if (lib.trimHash(tab.url) === lib.trimHash(modulePageUrl)) {
              var options = {
                active: true
              };

              if (modulePageUrl !== tab.url) {
                options.url = modulePageUrl;
              }

              chrome.tabs.update(tab.id, options);
              chrome.windows.update(windowItem.id, { focused: true });
              preferencesOpened = true;
            }
          });
        });

        if (!preferencesOpened) {
          if (newWindow) {
            chrome.windows.create({ url: modulePageUrl });
          } else {
            chrome.tabs.create({ url: modulePageUrl });
          }
        }
      });
    }
  }, {
    key: 'closeModuleTab',
    value: function closeModuleTab(page, params) {
      var modulePageUrl = chrome.extension.getURL(page);
      if (params !== undefined) {
        modulePageUrl += '?' + params;
      }

      chrome.windows.getAll({ populate: true }, function (windows) {
        windows.forEach(function (windowItem) {
          windowItem.tabs.forEach(function (tab) {
            if (lib.trimHash(tab.url) === modulePageUrl) {
              chrome.tabs.remove(tab.id);
            }
          });
        });
      });
    }
  }, {
    key: 't',
    value: function t(messageId) {
      return chrome.i18n.getMessage(messageId);
    }
  }, {
    key: 'registerContentScripts',
    value: function registerContentScripts(messagesDispatcher) {
      var _this5 = this;

      function portConnect(port) {
        function portMessage(message) {
          if (!lib.isObject(message)) {
            return;
          }

          if (!message.hasOwnProperty('payload') || !message.payload.hasOwnProperty('action')) {
            return;
          }

          if (messagesDispatcher.hasOwnProperty(message.payload.action)) {
            var tabId = 0;
            if (port.sender && port.sender.hasOwnProperty('tab') && port.sender.tab.id) {
              tabId = port.sender.tab.id;
            }

            messagesDispatcher[message.payload.action](message.payload.data, function (response) {
              var answer = {
                timestamp: message.timestamp,
                payload: response
              };
              try {
                port.postMessage(answer);
              } catch (error) {
                if (error && 'message' in error && error.message === 'Attempting to use a disconnected port object') {
                  throw new Error('no_port');
                }
              }
            }, tabId);
          }
        }

        function portDisconnect() {
          port.onMessage.removeListener(portMessage);
          port.onDisconnect.removeListener(portDisconnect);
        }

        port.onMessage.addListener(portMessage);
        port.onDisconnect.addListener(portDisconnect);
      }

      chrome.runtime.onConnect.addListener(portConnect);

      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
          _loadContentScripts(new Tab(_this5, tab)).catch(nop);
        });
      });

      chrome.tabs.onRemoved.addListener(function (tabId) {
        messagesDispatcher['sq.requestCancel']({}, nop, tabId);
        messagesDispatcher['sq.documentClosed']({}, nop, tabId);
      });

      chrome.tabs.onUpdated.addListener(function (tabId, updateInfo) {
        if ('status' in updateInfo && (updateInfo.status === 'loading' || 'url' in updateInfo)) {
          messagesDispatcher['sq.documentClosed']({}, nop, tabId);
        }
      });
    }
  }]);

  return ChromeBrowser;
}(Browser);

ChromeBrowser.prototype.createContextMenuItem = require('./ContextMenu');

instance = new ChromeBrowser();
module.exports = instance;

},{"../common/Lib":7,"../common/browserBase/Browser":13,"../common/browserBase/Tab":14,"../common/defaults/configuration":15,"../common/defaults/parameters":16,"../common/lib/ignore":23,"./ContextMenu":3,"./MainPanel":4,"extend":53}],3:[function(require,module,exports){
'use strict';

var lib = require('../common/Lib');

module.exports = function (label, icon, context, handler) {
  return new ContextMenu(label, icon, context, handler);
};

function ContextMenu(label, icon, context, handler) {
  this.options = {
    title: 'menu',
    contexts: ['page']
  };

  if (lib.isFunction(icon)) {
    handler = icon;
    icon = undefined;
    context = undefined;
  }

  if (lib.isFunction(context)) {
    handler = context;
    context = undefined;
  }

  if (handler !== undefined) {
    this.options.onclick = handler;
  }

  if (label !== undefined) {
    this.options.title = label;
  }

  this.id = chrome.contextMenus.create(this.options);
}

ContextMenu.prototype.addChild = function (item) {
  chrome.contextMenus.update(item.id, { parentId: this.id });
  return this;
};

ContextMenu.prototype.addSeparator = function () {
  chrome.contextMenus.create({ type: 'separator', parentId: this.id });
  return this;
};

},{"../common/Lib":7}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MainPanel = function () {
  function MainPanel(browser, buttonObject) {
    _classCallCheck(this, MainPanel);

    this._browser = browser;
    this._button = buttonObject;
    this._panel = null;
    this._dispatcher = {};
  }

  _createClass(MainPanel, [{
    key: 'on',
    value: function on(action, callback) {
      this._dispatcher[action] = callback;
      if (this.panel !== null) {
        this._browser.addMessageListener.call(this.panel, action, callback);
      }

      return this;
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (this.panel === null) {
        return this;
      }

      this.panel.hide();
      return this;
    }
  }, {
    key: 'show',
    value: function show() {
      if (this.panel === null) {
        return this;
      }

      this.panel.show();
      return this;
    }
  }, {
    key: 'updatePanelDispatcher',
    value: function updatePanelDispatcher() {
      if (this.panel === null) {
        return this;
      }

      for (var ii in this._dispatcher) {
        if (this._dispatcher.hasOwnProperty(ii)) {
          this._browser.addMessageListener.call(this.panel, ii, this._dispatcher[ii]);
        }
      }

      return this;
    }
  }, {
    key: 'setIconStatus',
    value: function setIconStatus(disabled) {
      if (!disabled) {
        chrome.browserAction.setIcon({
          path: {
            19: 'static/icon19.png',
            38: 'static/icon38.png'
          }
        });
      } else {
        chrome.browserAction.setIcon({
          path: {
            19: 'static/icon-disabled19.png',
            38: 'static/icon-disabled38.png'
          }
        });
      }
    }
  }, {
    key: 'panel',
    get: function get() {
      return this._panel;
    },
    set: function set(value) {
      this._panel = value;
      this.updatePanelDispatcher();
    }
  }, {
    key: 'button',
    get: function get() {
      return this._button;
    },
    set: function set(value) {
      this._button = value;
    }
  }, {
    key: 'dispatcher',
    set: function set(events) {
      this._dispatcher = events;
      this.updatePanelDispatcher();
    }
  }]);

  return MainPanel;
}();

function createMainPanel(browser, buttonObject) {
  return new MainPanel(browser, buttonObject);
}

module.exports = {
  MainPanel: MainPanel,
  createMainPanel: createMainPanel
};

},{}],5:[function(require,module,exports){
'use strict';

var Tab = require('../common/browserBase/Tab');

function nop() {}

exports.getCurrentTab = function (browser, callback, fail) {
  if (fail === undefined) {
    fail = nop;
  }

  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function (tabs) {
    if (tabs.length > 0) {
      callback(new Tab(browser, tabs[0]));
    } else {
      fail();
    }
  });
};

exports.getCurrentTabEx = function (browser) {
  return new Promise(function (resolve, reject) {
    chrome.tabs.query({
      currentWindow: true,
      active: true
    }, function (tabs) {
      if (tabs.length > 0) {
        resolve(new Tab(browser, tabs[0]));
      } else {
        reject('Not found');
      }
    });
  });
};

exports.getAllTabs = function (browser, skip) {
  return new Promise(function (resolve) {
    chrome.tabs.query({}, function (tabs) {
      var result = [];
      tabs.forEach(function (tab) {
        if (skip && skip === tab.id) {
          return;
        }

        result.push(new Tab(browser, tab));
      });
      resolve(result);
    });
  });
};

exports.getConfigurationTab = function getConfigurationTab(browser) {
  return new Promise(function (resolve) {
    chrome.tabs.query({ url: chrome.extension.getURL('options.html') }, function (tabs) {
      if (tabs.length === 0) {
        throw new Error('No configuration tabs open');
      }

      resolve(new Tab(browser, tabs[0]));
    });
  });
};

},{"../common/browserBase/Tab":14}],6:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lib = require('./Lib');
var extend = require('extend');

var ParameterTypeError = function (_Error) {
  _inherits(ParameterTypeError, _Error);

  function ParameterTypeError() {
    _classCallCheck(this, ParameterTypeError);

    return _possibleConstructorReturn(this, (ParameterTypeError.__proto__ || Object.getPrototypeOf(ParameterTypeError)).apply(this, arguments));
  }

  return ParameterTypeError;
}(Error);

var ConfigurationStorage = function () {
  function ConfigurationStorage(defaultValues) {
    _classCallCheck(this, ConfigurationStorage);

    if (!lib.isEmpty(defaultValues) && lib.isObject(defaultValues)) {
      this.values = extend(true, {}, defaultValues);
      this.defaultValues = extend(true, {}, defaultValues);
    } else {
      this.values = {};
      this.defaultValues = {};
    }

    this.saveCallback = null;
    this.isReady = false;
  }

  _createClass(ConfigurationStorage, [{
    key: 'setValues',
    value: function setValues(values) {
      if (!lib.isObject(values)) {
        throw new ParameterTypeError('Argument values should be object');
      }

      extend(true, this.values, values);
    }
  }, {
    key: 'setDefaultValues',
    value: function setDefaultValues(values) {
      if (!lib.isObject(values)) {
        throw new ParameterTypeError('Argument values should be object');
      }

      this.defaultValues = extend(true, {}, values);
    }
  }, {
    key: 'restoreDefaultValues',
    value: function restoreDefaultValues() {
      var oldValues = this.values;
      this.values = extend(true, {}, this.defaultValues);
      if ('sq_experiment' in oldValues) {
        this.values.sq_experiment = oldValues.sq_experiment;
      }

      if ('integration' in oldValues) {
        this.values.integration = oldValues.integration;
      }

      if ('core' in oldValues) {
        if ('changelog_shown' in oldValues.core) {
          this.values.core.changelog_shown = oldValues.core.changelog_shown;
        }
      }

      this.save();
    }
  }, {
    key: 'restoreModified',
    value: function restoreModified() {
      for (var key in this.defaultValues) {
        if (this.defaultValues.hasOwnProperty(key) && this.values.hasOwnProperty(key)) {
          for (var subKey in this.defaultValues[key]) {
            if (this.defaultValues[key].hasOwnProperty(subKey) && this.values[key].hasOwnProperty(subKey) && !lib.valuesCompare(this.values[key][subKey], this.defaultValues[key][subKey])) {
              this.values[key][subKey] = this.defaultValues[key][subKey];
            }
          }
        }
      }

      this.save();
    }
  }, {
    key: 'restoreDeleted',
    value: function restoreDeleted() {
      for (var key in this.defaultValues) {
        if (this.defaultValues.hasOwnProperty(key) && this.values.hasOwnProperty(key)) {
          for (var subKey in this.defaultValues[key]) {
            if (this.defaultValues[key].hasOwnProperty(subKey) && !this.values[key].hasOwnProperty(subKey)) {
              this.values[key][subKey] = this.defaultValues[key][subKey];
            }
          }
        } else {
          this.values[key] = extend(true, {}, this.defaultValues[key]);
        }
      }

      this.save();
    }
  }, {
    key: 'get',
    value: function get(name, defaultValue) {
      if (!lib.isString(name)) {
        throw new ParameterTypeError('Argument name should be string');
      }

      var arName = name.split('.');

      if (arName.length === 1) {
        if (this.values.hasOwnProperty(name)) {
          return this.values[name];
        }
      } else {
        if (this.values.hasOwnProperty(arName[0])) {
          if (this.values[arName[0]].hasOwnProperty(arName[1])) {
            return this.values[arName[0]][arName[1]];
          }
        }
      }

      return defaultValue;
    }
  }, {
    key: 'has',
    value: function has(name) {
      if (!lib.isString(name)) {
        throw new ParameterTypeError('Argument name should be string');
      }

      var _name$split = name.split('.'),
          _name$split2 = _slicedToArray(_name$split, 2),
          branch = _name$split2[0],
          key = _name$split2[1];

      if (key === undefined) {
        if (this.values.hasOwnProperty(branch)) {
          return true;
        }
      } else {
        if (this.values.hasOwnProperty(branch)) {
          if (this.values[branch].hasOwnProperty(key)) {
            return true;
          }
        }
      }

      return false;
    }
  }, {
    key: 'remove',
    value: function remove(name) {
      if (!lib.isString(name)) {
        throw new ParameterTypeError('Argument name should be string');
      }

      var arName = name.split('.');

      if (arName.length === 1) {
        if (this.values.hasOwnProperty(name)) {
          delete this.values[name];
          return true;
        }
      } else {
        if (this.values.hasOwnProperty(arName[0])) {
          if (this.values[arName[0]].hasOwnProperty(arName[1])) {
            delete this.values[arName[0]][arName[1]];
            return true;
          }
        }
      }

      return false;
    }
  }, {
    key: 'setOne',
    value: function setOne(name, value) {
      if (!lib.isString(name)) {
        throw new ParameterTypeError('Argument name should be string');
      }

      var arName = name.split('.');
      if (arName.length === 1) {
        if (lib.isObject(this.values[name]) && lib.isObject(value)) {
          this.values[name] = extend(false, this.values[name], value);
        } else {
          this.values[name] = value;
        }
      } else {
        if (!this.values.hasOwnProperty(arName[0])) {
          this.values[arName[0]] = {};
        }

        this.values[arName[0]][arName[1]] = value;
      }

      return value;
    }
  }, {
    key: 'set',
    value: function set(name, value) {
      if (lib.isObject(name)) {
        for (var key in name) {
          if (name.hasOwnProperty(key)) {
            this.setOne(key, name[key]);
          }
        }

        return true;
      } else {
        return this.setOne(name, value);
      }
    }
  }, {
    key: 'getBranch',
    value: function getBranch(name) {
      var result = {};

      if (this.values.hasOwnProperty(name)) {
        return this.values[name];
      }

      return result;
    }
  }, {
    key: 'deleteBranch',
    value: function deleteBranch(name) {
      if (this.values.hasOwnProperty(name)) {
        delete this.values[name];
      }
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      return extend(true, {}, this.values);
    }
  }, {
    key: 'save',
    value: function save() {
      if (lib.isFunction(this.saveCallback)) {
        this.saveCallback(this.values);
      }

      this.dispatchEvent('afterSave', true);
    }
  }, {
    key: 'onReady',
    value: function onReady(callback) {
      if (this.isReady) {
        callback.call(this);
      } else {
        this.addEventListener('ready', callback.bind(this));
      }
    }
  }, {
    key: 'onAfterSave',
    value: function onAfterSave(callback) {
      this.addEventListener('afterSave', callback.bind(this));
    }
  }, {
    key: 'ready',
    value: function ready(defaultValues, values, saveCallback) {
      var localValues = extend(true, {}, defaultValues);
      try {
        if (lib.isObject(values)) {
          for (var key in values) {
            if (values.hasOwnProperty(key)) {
              if (localValues.hasOwnProperty(key)) {
                extend(false, localValues[key], values[key]);
              } else {
                localValues[key] = values[key];
              }
            }
          }
        }
      } catch (ignore) {
        localValues = extend(true, {}, defaultValues);
      }

      this.setValues(localValues);
      this.setDefaultValues(defaultValues);
      this.saveCallback = saveCallback;
      this.isReady = true;
      this.dispatchEvent('ready', true);
    }
  }, {
    key: 'isBranchDefault',
    value: function isBranchDefault(branch) {
      var defaultKeys = void 0;
      var valuesKeys = void 0;
      try {
        defaultKeys = Object.keys(this.defaultValues[branch]).sort();
        valuesKeys = Object.keys(this.values[branch]).sort();
      } catch (e) {
        return false;
      }

      if (branch === 'core') {
        if (valuesKeys.indexOf('changelog_shown') !== -1) {
          valuesKeys.splice(valuesKeys.indexOf('changelog_shown'), 1);
        }
      }

      if (defaultKeys.length !== valuesKeys.length) {
        return false;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = defaultKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          if (valuesKeys.indexOf(key) === -1) {
            return false;
          }

          var defaultValue = this.defaultValues[branch][key];
          var value = this.values[branch][key];

          if (defaultValue !== value) {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return true;
    }
  }, {
    key: 'isDefault',
    get: function get() {
      var defaultKeys = Object.keys(this.defaultValues).sort();
      var valuesKeys = Object.keys(this.values).sort();

      if (valuesKeys.indexOf('sq_experiment') !== -1) {
        valuesKeys.splice(valuesKeys.indexOf('sq_experiment'), 1);
      }

      if (valuesKeys.indexOf('integration') !== -1) {
        valuesKeys.splice(valuesKeys.indexOf('integration'), 1);
      }

      if (defaultKeys.length !== valuesKeys.length) {
        return false;
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = defaultKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var key = _step2.value;

          if (valuesKeys.indexOf(key) === -1) {
            return false;
          }

          var defaultValue = this.defaultValues[key];
          var value = this.values[key];

          if (defaultValue === value) {
            continue;
          }

          if (lib.isObject(defaultValue) && lib.isObject(value)) {
            if (!this.isBranchDefault(key)) {
              return false;
            }
          } else {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return true;
    }
  }]);

  return ConfigurationStorage;
}();

require('./utils/eventsMixin')(ConfigurationStorage.prototype);

function createStorage(browser) {
  var storage = new ConfigurationStorage();
  browser.loadCoreConfiguration(storage.ready.bind(storage));
  return storage;
}

exports.ConfigurationStorage = ConfigurationStorage;
exports.createStorage = createStorage;
exports.ParameterTypeError = ParameterTypeError;

},{"./Lib":7,"./utils/eventsMixin":48,"extend":53}],7:[function(require,module,exports){
'use strict';

var hexMd5 = require('./hex-md5');
var getGoogleChecksum = require('./googleChecksum');
var startsWith = require('./lib/startsWith.js');
var containsText = require('./lib/containsText.js');
var endsWith = require('./lib/endsWith.js');

exports.SEOQUAKE_MODE_ON_LOAD = 0;
exports.SEOQUAKE_MODE_BY_REQUEST = 1;

exports.SEOQUAKE_RESULT_ERROR = 'error';
exports.SEOQUAKE_RESULT_NO = 'no';
exports.SEOQUAKE_RESULT_NODATA = 'n/a';
exports.SEOQUAKE_RESULT_CAPTCHA = 'captcha';
exports.SEOQUAKE_RESULT_QUESTION = '?';
exports.SEOQUAKE_RESULT_WAIT = 'wait...';
exports.SEOQUAKE_RESULT_YES = 'yes';

exports.SEOQUAKE_SORT_ASC = 'asc';
exports.SEOQUAKE_SORT_DESC = 'desc';

exports.SEOQUAKE_TYPE_DATE = 1;
exports.SEOQUAKE_TYPE_INT = 2;
exports.SEOQUAKE_TYPE_STRING = 4;
exports.SEOQUAKE_TYPE_IP = 8;

exports.SEOQUAKE_ADBLOCK_URL = 'https://www.seoquake.com/seoadv.html?ver={seoquake_version}';

exports.SEOQUAKE_CSV_DELIMITER = ';';
exports.SEOQUAKE_MAX_HIGHLIGHT_SITES = 50;

exports.SEOQUAKE_PARAM_DELETE = 'deleted';
exports.SEOQUAKE_PARAM_FULLY_DELETE = 'fully_deleted';
exports.SEOQUAKE_PARAM_CUSTOM = 'custom';
exports.SEOQUAKE_PARAM_MODIFIED = 'modified';

exports.isEmpty = require('./lib/isEmpty');

exports.isFunction = function (obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};

exports.isArray = require('./lib/isArray');

exports.isObject = require('./lib/isObject');

exports.isString = require('./lib/isString');

exports.$A = require('./lib/arrayFrom').$A;

exports.startsWith = startsWith;

exports.containsText = containsText;

exports.endsWith = endsWith;

exports.trim = function (string) {
  string = string || '';
  return string.trim();
};

exports.trimHash = require('./lib/trimHash');

exports.cleanString = function (string) {
  string = string.replace(/([,;!\+=#@\^&~\$\/:\?\(\)\[\]\\"\*\|•·“”<>%\{\}])/ig, ' ');
  string = string.replace(/'+/g, '\'').replace(/(\s'|'(\s|$))/g, ' ');
  string = string.replace(/([\n\t\r]+)/g, ' ').replace(/([ \u00A0]{2,})/g, ' ');
  string = exports.trim(string.toLocaleLowerCase());
  return string;
};

exports.stripTags = function (string) {
  string = string.replace(/&[#0-9a-z]+;/ig, ' ');
  return string.replace(/<\/?[^>]+>/gi, ' ');
};

exports.normalizeString = function (string, bLeaveCase) {
  string = string.replace(/([\.;\+=#@\^&~\$\/:\?'\(\)\[\]\\"\*\|•·“”<>%\{\}])/ig, ' ').replace(/([\-]+)/ig, ' ');
  string = string.replace(/([\n\t\r]+)/g, ' ').replace(/([ ]{2,})/g, ' ');
  if (!bLeaveCase) {
    string = string.toLocaleLowerCase();
  }

  return string;
};

exports.sanitizeString = function (string, bLeaveCase) {
  return exports.normalizeString(exports.stripTags(string), bLeaveCase);
};

exports.stripScripts = function (string) {
  return string.replace(new RegExp('(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)', 'img'), '');
};

exports.truncate = function (string, length, replace) {
  length = length || 80;
  replace = replace || '...';
  var curLength = length - replace.length;
  if (string.length - replace.length > length) {
    string = string.substr(0, curLength) + replace;
  }

  return string;
};

exports.valuesCompare = function (a, b) {
  if (exports.isArray(a) && exports.isArray(b)) {
    return exports.arraysCompare(a, b);
  } else {
    return a == b;
  }
};

exports.arraysCompare = function (a, b) {
  var i = void 0;
  var l = void 0;

  if (a.length !== b.length) {
    return false;
  } else {
    for (i = 0, l = a.length; i < l; i++) {
      if (b.indexOf(a[i]) === -1) {
        return false;
      }
    }
  }

  return true;
};

exports.parseUri = require('./lib/parseUri').parseUri;
exports.clearUri = require('./lib/parseUri').clearUri;
exports.parseArgs = require('./lib/parseArgs').parseArgs;

exports.shortHash = require('./lib/shortHash');

exports.createRequestUrl = function (template, uri, searchQuery, uPos) {
  return template.replace(/{([^{}]+)}/ig, function (match, tag) {
    var i = void 0;
    var l = void 0;
    var value = void 0;
    var searchQueryTmp = void 0;

    tag = tag.split('|');
    tag[0] = exports.trim(tag[0]);

    if (tag[0] in uri) {

      value = uri[tag[0]];

      for (i = 1, l = tag.length; i < l; i++) {
        if (exports.trim(tag[i]) === 'encode') {
          value = value.replace(/\/\/(.+:.+@)/i, '//');
          value = encodeURIComponent(value);
        } else if (exports.trim(tag[i]) === 'trimrslash') {
          if (exports.endsWith(value, '/')) {
            value = value.substring(0, value.length - 1);
          }
        } else if (exports.trim(tag[i]) === 'md5') {
          value = hexMd5(value);
        }
      }

      return value;
    } else if (tag[0].match(/^\d+$/)) {
      return '';
    } else {
      switch (tag[0]) {
        case 'keyword':
          if (searchQuery) {
            searchQueryTmp = searchQuery;
            for (i = 1, l = tag.length; i < l; i++) {
              if (exports.trim(tag[i]) === 'encode') {
                searchQueryTmp = encodeURIComponent(searchQuery);
              }
            }

            return searchQueryTmp;
          } else {
            return '';
          }

        case 'pos':
          if (uPos && uPos !== null) {
            uri.u_pos = uPos;
            return uri.u_pos;
          } else {
            return '0';
          }

        case 'localip':
        case 'installdate':
          return '';
        case 'gchecksum':
          return getGoogleChecksum('info:' + uri.url);
        default:
          return match;
      }
    }
  });
};

exports.countFields = function (object) {
  var result = 0;

  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      result++;
    }
  }

  return result;
};

exports.hex_md5 = hexMd5;

exports.getVarValueFromURL = function (url, varName) {
  return exports.parseArgs(url).get(varName);
};

exports.ip2long = require('./lib/ip2long');

exports.getUUID = require('./lib/getUUID');

},{"./googleChecksum":17,"./hex-md5":18,"./lib/arrayFrom":19,"./lib/containsText.js":20,"./lib/endsWith.js":21,"./lib/getUUID":22,"./lib/ip2long":24,"./lib/isArray":25,"./lib/isEmpty":26,"./lib/isObject":28,"./lib/isString":30,"./lib/parseArgs":31,"./lib/parseUri":32,"./lib/shortHash":33,"./lib/startsWith.js":34,"./lib/trimHash":35}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var hexMd5 = require('./hex-md5');

var Module = function () {
  function Module(ModulesList, config) {
    _classCallCheck(this, Module);

    this.modulesList = ModulesList;

    if (this.name === undefined) {
      this.name = 'module';
    }

    this.id = this.getId();
  }

  _createClass(Module, [{
    key: 'run',
    value: function run() {}
  }, {
    key: 'close',
    value: function close() {}
  }, {
    key: 'getData',
    value: function getData() {}
  }, {
    key: 'getId',
    value: function getId(reset) {
      if (reset) {
        this.id = undefined;
      }

      if (this.id !== undefined) {
        return this.id;
      }

      return hexMd5(this.name + new Date().getTime() + Math.random());
    }
  }]);

  return Module;
}();

module.exports = Module;

},{"./hex-md5":18}],9:[function(require,module,exports){
'use strict';

var browser = require('browser/Browser');

module.exports = Modules;

function Modules() {
  this.modules = {
    linkinfo: require('modules/SQLinkinfo'),
    common: require('modules/SQCommon'),
    panel: require('modules/SQPanel'),
    serptool: require('modules/SQSERPTool')
  };

  this.modulesCache = {};
}

Modules.prototype.findModule = function (name, id) {
  if (!this.modulesCache.hasOwnProperty(name)) {
    throw new Error('Module ' + name + ' not availabe');
  }

  if (!this.modulesCache[name].hasOwnProperty(id)) {
    throw new Error('Module ' + name + ' do not have copy with ID ' + id);
  }

  return this.modulesCache[name][id];
};

Modules.prototype.loadModule = function (name, configuration) {
  if (!this.modules.hasOwnProperty(name)) {
    throw new Error('Module not available');
  }

  if (!this.modulesCache.hasOwnProperty(name)) {
    this.modulesCache[name] = {};
  }

  var module = new this.modules[name](this, configuration);
  this.modulesCache[name][module.id] = module;
  return module;
};

Modules.prototype.runModule = function (name, configuration) {
  var module = this.loadModule(name, configuration);
  module.run();
  return module;
};

Modules.prototype.closeModule = function (name, id) {
  try {
    this.findModule(name, id).close();
    delete this.modulesCache[name][id];
  } catch (error) {
    browser.closeModuleTab(name + '.html', 'id=' + id);
  }
};

Modules.prototype.getData = function (name, id) {
  return this.findModule(name, id).getData();
};

Modules.prototype.getDataEx = function (name, id, callback, args) {
  var module = this.findModule(name, id);
  if ('getDataEx' in module) {
    module.getDataEx(callback, args);
  } else {
    throw new Error('Module ' + name + ' cant use getDataEx');
  }
};

},{"browser/Browser":2,"modules/SQCommon":49,"modules/SQLinkinfo":50,"modules/SQPanel":51,"modules/SQSERPTool":52}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lib = require('./Lib');
var extend = require('extend');
var configuration = require('./Configuration');
var ConfigurationStorage = configuration.ConfigurationStorage;
var ParameterTypeError = configuration.ParameterTypeError;
var isParameterDeleted = require('./lib/isParameterDeleted');

var ParametersStorage = function (_ConfigurationStorage) {
  _inherits(ParametersStorage, _ConfigurationStorage);

  function ParametersStorage(defaultValues) {
    _classCallCheck(this, ParametersStorage);

    return _possibleConstructorReturn(this, (ParametersStorage.__proto__ || Object.getPrototypeOf(ParametersStorage)).call(this, defaultValues));
  }

  _createClass(ParametersStorage, [{
    key: 'restoreDeleted',
    value: function restoreDeleted() {
      for (var key in this.defaultValues) {
        if (!this.defaultValues.hasOwnProperty(key)) {
          continue;
        }

        if (this.values.hasOwnProperty(key)) {
          if (isParameterDeleted(this.values[key], false)) {
            delete this.values[key].state;
          }
        } else {
          this.values[key] = this.defaultValues[key];
        }
      }

      this.save();
    }
  }, {
    key: 'setOne',
    value: function setOne(name, value) {
      if (!lib.isString(name)) {
        throw new ParameterTypeError('Argument name should be string');
      }

      if (name.indexOf('.') === -1) {
        if (!lib.isObject(value) || !value.hasOwnProperty('name') || !value.hasOwnProperty('title')) {
          throw new NotAParameterException();
        }
      }

      var arName = name.split('.');
      if (arName.length === 1) {
        if (lib.isObject(this.values[name]) && lib.isObject(value)) {
          this.values[name] = extend(false, this.values[name], value);
          if (this.values[name].hasOwnProperty('state') && !value.hasOwnProperty('state')) {
            delete this.values[name].state;
          }
        } else {
          this.values[name] = value;
        }
      } else {
        if (!this.values.hasOwnProperty(arName[0])) {
          this.values[arName[0]] = {};
        }

        this.values[arName[0]][arName[1]] = value;
      }

      return value;
    }
  }, {
    key: 'deleteCustom',
    value: function deleteCustom() {
      var newValues = {};

      for (var key in this.values) {
        if (!this.values.hasOwnProperty(key)) {
          continue;
        }

        if (!this.values[key].hasOwnProperty('state') || this.values[key].state !== lib.SEOQUAKE_PARAM_CUSTOM) {
          newValues[key] = this.values[key];
        }
      }

      this.values = newValues;
      this.save();
    }
  }, {
    key: 'deleteBranch',
    value: function deleteBranch(name) {
      if (!this.values.hasOwnProperty(name)) {
        return;
      }

      if (this.values[name].state === lib.SEOQUAKE_PARAM_CUSTOM) {
        configuration.ConfigurationStorage.prototype.deleteBranch.call(this, name);
      } else {
        this.values[name].state = lib.SEOQUAKE_PARAM_DELETE;
      }
    }
  }, {
    key: 'getPluginParameters',
    value: function getPluginParameters(plugin) {
      plugin = plugin || '';

      var result = {};

      for (var paramId in this.values) {
        if (!this.values.hasOwnProperty(paramId)) {
          continue;
        }

        if (isParameterDeleted(this.values[paramId])) {
          continue;
        }

        if ('disabled' in this.values[paramId] && this.values[paramId].disabled.indexOf(plugin) >= 0) {
          continue;
        }

        result[paramId] = this.values[paramId];
        result[paramId].id = paramId;
      }

      return result;
    }
  }, {
    key: 'disableParameter',
    value: function disableParameter(id, plugin) {
      if (!this.values.hasOwnProperty(id)) {
        return;
      }

      if (this.values[id].disabled.indexOf(plugin) !== -1) {
        return;
      }

      this.values[id].disabled.push(plugin);
    }
  }, {
    key: 'enableParameter',
    value: function enableParameter(id, plugin) {
      if (!this.values.hasOwnProperty(id)) {
        return;
      }

      var index = this.values[id].disabled.indexOf(plugin);

      if (index === -1) {
        return;
      }

      this.values[id].disabled.splice(index, 1);
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      return this.getPluginParameters();
    }
  }, {
    key: 'updateDefault',
    value: function updateDefault(parameters) {
      if (!lib.isObject(parameters)) {
        return false;
      }

      for (var key in parameters) {
        if (!parameters.hasOwnProperty(key)) {
          continue;
        }

        this.defaultValues[key] = extend(true, {}, parameters[key]);

        if (!this.values.hasOwnProperty(key)) {
          this.values[key] = extend(true, {}, parameters[key]);
        } else {
          if (!('state' in this.values[key]) || this.values[key].state === lib.SEOQUAKE_PARAM_DELETE) {
            ParametersStorage.fillParameterFromParameter(this.values[key], parameters[key]);
          }
        }
      }

      for (var _key in this.values) {
        if (!this.values.hasOwnProperty(_key)) {
          continue;
        }

        if (this.values[_key].hasOwnProperty('state') && this.values[_key].state === lib.SEOQUAKE_PARAM_CUSTOM) {
          continue;
        }

        if (!parameters.hasOwnProperty(_key) && (!('state' in this.values[_key]) || this.values[_key].state !== lib.SEOQUAKE_PARAM_MODIFIED)) {
          this.values[_key].state = lib.SEOQUAKE_PARAM_FULLY_DELETE;
        }
      }

      return true;
    }
  }, {
    key: 'restorePackageParameters',
    value: function restorePackageParameters() {
      for (var key in this.defaultValues) {
        if (!this.defaultValues.hasOwnProperty(key)) {
          continue;
        }

        if (isParameterDeleted(this.defaultValues[key], true)) {
          delete this.defaultValues[key].state;
        }
      }

      this.updateDefault(this.defaultValues);
    }
  }, {
    key: 'isBranchDefault',
    value: function isBranchDefault(branch) {
      var defaultKeys = void 0;
      var valuesKeys = void 0;
      try {
        defaultKeys = Object.keys(this.defaultValues[branch]).sort();
        valuesKeys = Object.keys(this.values[branch]).sort();
      } catch (e) {
        return false;
      }

      valuesKeys.splice(valuesKeys.indexOf('id'), 1);

      if (defaultKeys.length !== valuesKeys.length) {
        return false;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = defaultKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          if (valuesKeys.indexOf(key) === -1) {
            return false;
          }

          var defaultValue = this.defaultValues[branch][key];
          var value = this.values[branch][key];

          if (!lib.valuesCompare(defaultValue, value)) {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return true;
    }
  }], [{
    key: 'fillParameterFromParameter',
    value: function fillParameterFromParameter(destination, source) {
      if (source.hasOwnProperty('title')) {
        destination.title = source.title;
      }

      if (source.hasOwnProperty('name')) {
        destination.name = source.name;
      }

      if (source.hasOwnProperty('icon')) {
        destination.icon = source.icon;
      }

      if (source.hasOwnProperty('url-s')) {
        destination['url-s'] = source['url-s'];
      } else if (destination.hasOwnProperty('url-s')) {
        delete destination['url-s'];
      }

      if (source.hasOwnProperty('url-r')) {
        destination['url-r'] = source['url-r'];
      } else if (destination.hasOwnProperty('url-r')) {
        delete destination['url-r'];
      }

      if (source.hasOwnProperty('url-na')) {
        destination['url-na'] = source['url-na'];
      } else if (destination.hasOwnProperty('url-na')) {
        delete destination['url-na'];
      }

      if (source.hasOwnProperty('matches')) {
        destination.matches = source.matches;
      } else if (destination.hasOwnProperty('matches')) {
        delete destination.matches;
      }
    }
  }]);

  return ParametersStorage;
}(ConfigurationStorage);

var NotAParameterException = function (_Error) {
  _inherits(NotAParameterException, _Error);

  function NotAParameterException() {
    _classCallCheck(this, NotAParameterException);

    return _possibleConstructorReturn(this, (NotAParameterException.__proto__ || Object.getPrototypeOf(NotAParameterException)).apply(this, arguments));
  }

  return NotAParameterException;
}(Error);

function createStorage(browser) {
  var storage = new ParametersStorage();
  browser.loadParametersConfiguration(storage.ready.bind(storage));
  return storage;
}

exports.createStorage = createStorage;

exports.ParametersStorage = ParametersStorage;
exports.NotAParameterException = NotAParameterException;
exports.TYPE_DOMAIN = 'domain';
exports.TYPE_PAGE = 'page';
exports.TYPE_OTHER = 'other';

},{"./Configuration":6,"./Lib":7,"./lib/isParameterDeleted":29,"extend":53}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var browser = require('browser/Browser');
var extend = require('extend');
var isFunction = require('../lib/isFunction');
var isString = require('../lib/isString');
var isEmpty = require('../lib/isEmpty');
var getUUID = require('../lib/getUUID');

var Analytics = function () {
  function Analytics(messagesDispatcher, config) {
    _classCallCheck(this, Analytics);

    messagesDispatcher['sq.analyticsEvent'] = this.analyticsEvent.bind(this);
    messagesDispatcher['sq.analyticsPage'] = this.analyticsPage.bind(this);

    this.config = extend(true, {
      'ga-id': 'UA-3071592-17',
      url: 'https://ssl.google-analytics.com/collect',
      bqurl: 'https://www.seoquake.com/collect',
      disabled: false
    }, config);

    this._sessionId = null;

    this.queue = [];
    this._uuid = '';
    this.initUUID();
  }

  _createClass(Analytics, [{
    key: 'initUUID',
    value: function initUUID() {
      var _this = this;

      var result = browser.getUserUniqId();
      if (result instanceof Promise) {
        result.then(function (value) {
          _this._uuid = value;
          _this.queue.forEach(function (data) {
            return _this.sendRequest(data);
          });
          _this.queue = [];
        });
      } else {
        this._uuid = result;
      }
    }
  }, {
    key: 'setConfig',
    value: function setConfig(key, value) {
      if (!isString(key)) {
        throw new Error('Key should be string');
      }

      if (value === undefined) {
        throw new Error('Value should be set');
      }

      this.config[key] = value;
    }
  }, {
    key: 'sendRequest',
    value: function sendRequest(data) {
      if (!isString(data)) {
        throw new Error('Data should be string');
      }

      if (this._uuid === '') {
        this.queue.push(data);
        return;
      }

      var xhr = browser.createXHR();
      xhr.open('POST', this.config.url, true);
      var request = 'v=1&tid=' + this.config['ga-id'] + '&cid=' + this._uuid + '&' + data;
      request += '&cs=' + encodeURIComponent('3.9.5') + '&cm=chrome&ds=' + encodeURIComponent('3.9.5');
      var z = Date.now() + Math.random();
      request += '&z=' + encodeURIComponent(z);
      xhr.send(request);

      this.sendBQRequest(data);
    }
  }, {
    key: 'sendBQRequest',
    value: function sendBQRequest(data) {
      if (!isString(data)) {
        throw new Error('Data should be string');
      }

      var xhr = browser.createXHR();
      xhr.open('POST', this.config.bqurl, true);
      xhr.setRequestHeader('Content-Type', 'text/plain; charset=UTF-8');
      var request = 'v=1&tid=' + this.config['ga-id'] + '&cid=' + this._uuid + '&sid=' + this.sessionId + '&' + data;
      request += '&cs=' + encodeURIComponent('3.9.5') + '&cm=chrome&ds=' + encodeURIComponent('3.9.5');
      var z = Date.now() + Math.random();
      request += '&z=' + encodeURIComponent(z);
      xhr.send(request);
    }
  }, {
    key: 'analyticsEvent',
    value: function analyticsEvent(data, callback) {
      if (this.config.disabled || isEmpty(data)) {
        return;
      }

      var request = 't=event';

      if (data.hasOwnProperty('action')) {
        request += '&ea=' + encodeURIComponent(data.action);
      } else {
        return;
      }

      if (data.hasOwnProperty('category')) {
        request += '&ec=' + encodeURIComponent(data.category);
      } else {
        return;
      }

      if (data.hasOwnProperty('label')) {
        request += '&el=' + encodeURIComponent(data.label);
      }

      this.sendRequest(request);

      if (isFunction(callback)) {
        callback();
      }
    }
  }, {
    key: 'analyticsPage',
    value: function analyticsPage(data, callback) {
      if (this.config.disabled || isEmpty(data)) {
        return;
      }

      var request = 't=pageview';

      if (data.hasOwnProperty('page')) {
        request += '&dp=' + encodeURIComponent(data.page);
      } else {
        return;
      }

      this.sendRequest(request);

      if (isFunction(callback)) {
        callback();
      }
    }
  }, {
    key: 'analyticsReady',
    value: function analyticsReady(screenResolution, screenColors, lang) {
      var request = 't=pageview&dp=background';

      if (screenResolution) {
        request += '&sr=' + encodeURIComponent(screenResolution);
      }

      if (screenColors) {
        request += '&sd=' + encodeURIComponent(screenColors);
      }

      if (lang) {
        request += '&ul=' + encodeURIComponent(lang);
      }

      this.sendRequest(request);
    }
  }, {
    key: 'sessionId',
    get: function get() {
      if (this._sessionId === null) {
        this._sessionId = getUUID();
      }

      return this._sessionId;
    }
  }]);

  return Analytics;
}();

module.exports = Analytics;

},{"../lib/getUUID":22,"../lib/isEmpty":26,"../lib/isFunction":27,"../lib/isString":30,"browser/Browser":2,"extend":53}],12:[function(require,module,exports){
'use strict';

var isEmpty = require('../lib/isEmpty');

module.exports = function analyticsBrowserMixin(analytics) {
  this.registerEvent = function registerEvent(category, action, label) {
    if (isEmpty(category) || isEmpty(action)) {
      return;
    }

    var data = {
      category: category,
      action: action
    };
    if (label) {
      data.label = label;
    }

    analytics.analyticsEvent(data);
  };

  this.registerPage = function registerPage(page) {
    if (isEmpty(page)) {
      return;
    }

    analytics.analyticsPage({ page: page });
  };
};

},{"../lib/isEmpty":26}],13:[function(require,module,exports){
'use strict';

var analyticsBrowserMixin = require('../analytics/browserMixin');
var isFunction = require('../lib/isFunction');
var Tab = require('browser/Tab');

module.exports = Browser;

function Browser() {
  this.version = '3.9.5';
  this.registerAnalytics = analyticsBrowserMixin;
}

Browser.SEOQ_ERROR_TAB_CLOSED = 1;

Browser.prototype.createXHR = function () {
  return new XMLHttpRequest();
};

Browser.prototype.setTimeout = function () {
  setTimeout.apply(window, arguments);
};

Browser.prototype.getUserUniqId = function () {
  throw new Error('Should be implemented');
};

Browser.prototype.createMainPanel = function () {
  throw new Error('Should be implemented');
};

Browser.prototype.getConfigValue = function (configKey, defaultValue) {
  throw new Error('Should be implemented');
};

Browser.prototype.setConfigValue = function (configKey, value) {
  throw new Error('Should be implemented');
};

Browser.prototype.loadConfiguration = function (defaultSource, storageKey, callback) {
  throw new Error('Should be implemented');
};

Browser.prototype.loadCoreConfiguration = function (callback) {
  throw new Error('Should be implemented');
};

Browser.prototype.loadParametersConfiguration = function (callback) {
  throw new Error('Should be implemeneted');
};

Browser.prototype.addMessageListener = function (action, callback) {
  throw new Error('Should be implemented');
};

Browser.prototype.sendMessageToTab = function (tab, action, messageData, callback) {
  throw new Error('Should be implemented');
};

Browser.prototype.sendMessageToAllTabs = function (action, messageData, callback, sender) {
  var _this = this;

  Tab.getAllTabs(this).then(function (tabs) {
    var messages = [];
    tabs.forEach(function (tab) {
      return messages.push(_this.sendMessageToTab(tab, action, messageData));
    });
    return Promise.all(messages);
  }).then(function (result) {
    return callback();
  }).catch(function (reason) {
    return callback(reason);
  });
};

Browser.prototype.sendMessageToConfigurationTab = function sendMessageToConfigurationTab(action, messageData, callback, sender) {
  var _this2 = this;

  Tab.getConfigurationTab(this).then(function (tab) {
    return _this2.sendMessageToTab(tab, action, messageData, callback);
  }).catch(function (reason) {
    return callback(reason);
  });
};

Browser.prototype.sendMessageToCurrentTab = function (action, messageData, callback) {
  var _this3 = this;

  Tab.getCurrentTabEx(this).then(function (tab) {
    return _this3.sendMessageToTab(tab, action, messageData, callback);
  }).catch(function (reason) {
    return callback();
  });
};

Browser.prototype.getCurrentTabUrl = function (callback) {
  if (isFunction(callback)) {
    Tab.getCurrentTab(this, function (tab) {
      return callback([tab.url, tab.status, tab.id]);
    }, function () {
      return callback(['', '', 0]);
    });
  } else {
    return Tab.getCurrentTabEx(this).then(function (tab) {
      return Promise.resolve([tab.url, tab.status, tab.id]);
    }).catch(function (reason) {
      return Promise.reject(reason);
    });
  }
};

Browser.prototype.openTab = function (url) {
  throw new Error('Should be implemented');
};

Browser.prototype.closeTab = function (sender) {
  throw new Error('Should be implemented');
};

Browser.prototype.openModuleTab = function (page, params, newWindow) {
  throw new Error('Should be implemented');
};

Browser.prototype.closeModuleTab = function (page, params) {
  throw new Error('Should be implemented');
};

Browser.prototype.openConfigurationWindow = function (panel) {
  panel = panel || '';
  this.openModuleTab('options.html' + panel);
};

Browser.prototype.closeConfigurationWindow = function () {
  this.closeModuleTab('options.html');
};

Browser.prototype.t = function (messageId) {
  throw new Error('Should be implemented');
};

Browser.prototype.registerContentScripts = function (messagesDispatcher) {
  throw new Error('Should be implemented');
};

Browser.prototype.versionCompare = require('../lib/versionCompare');

Browser.prototype.createContextMenuItem = function () {
  throw new Error('Should be implemented');
};

},{"../analytics/browserMixin":12,"../lib/isFunction":27,"../lib/versionCompare":36,"browser/Tab":5}],14:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tab = function () {
  function Tab(browser, source) {
    _classCallCheck(this, Tab);

    this._source = source;
    this._browser = browser;
  }

  _createClass(Tab, [{
    key: 'getIdentifier',
    value: function getIdentifier() {
      return this._source.id;
    }
  }, {
    key: 'getUrl',
    value: function getUrl() {
      return this._source.url;
    }
  }, {
    key: 'getStatus',
    value: function getStatus() {
      return this._source.readyState || this._source.status;
    }
  }, {
    key: 'asSource',
    value: function asSource() {
      return this._source;
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(action, messageData, callback) {
      this._browser.sendMessageToTab(this, action, messageData, callback);
    }
  }, {
    key: 'id',
    get: function get() {
      return this.getIdentifier();
    }
  }, {
    key: 'url',
    get: function get() {
      return this.getUrl();
    }
  }, {
    key: 'status',
    get: function get() {
      return this.getStatus();
    }
  }, {
    key: 'source',
    get: function get() {
      return this.asSource();
    }
  }]);

  return Tab;
}();

module.exports = Tab;

},{}],15:[function(require,module,exports){
'use strict';

module.exports = {
  core: {
    disabled: false,
    use_cache: true,
    request_delay: 500,
    disable_serps_pos_numbers: false,
    disable_highlight_sites: false,
    highlight_sites: 'example.com',
    highlight_sites_color: '#b6d7a8',
    export_template: 0,
    onboarding_semrush_panel: true
  },
  seobar: {
    disabled: false,
    mode: 0,
    style: 'horizontal-inpage',
    position: 'top',
    color: 'white',
    pinned: false,
    open_minimized: false,
    https: true,
    matches: '',
    excludes: '^http://localhost\n^http://127(\\.\\d){3}\n\\.(pdf|jpe?g|png|csv|docx?|txt|js|css|bmp|rtf|tiff|gif|mp3|ogg|mkv|avi|mp4|yaml|xml)(\\?.*)?$\n',
    robotsLink: false,
    sitemapLink: false,
    densityLink: true,
    linkinfoLink: true,
    diagnosisLink: true,
    pageinfoLink: true,
    siteauditLink: true
  },
  google: {
    disabled: false,
    mode: 0,
    show_hlgl: true,
    show_keyword_difficulty: true,
    onboarding_keyword_difficulty: true,
    google_hl: 'none',
    google_gl: 'none',
    show_semrush_panel: true
  },
  yahoo: {
    disabled: false,
    mode: 0,
    show_semrush_panel: true
  },
  bing: {
    disabled: false,
    mode: 0,
    show_semrush_panel: true
  },
  yandex: {
    disabled: false,
    mode: 0,
    show_semrush_panel: true
  },
  linkinfo: {
    mode: 1
  },
  internal: {
    mode: 1
  },
  external: {
    mode: 1
  },
  nofollow: {
    disabled: true
  },
  semrush: {
    disabled: false,
    limit: 20,
    mode: 0,
    show_semrush_panel: true
  },
  advanced: {
    disabled: true,
    disable_ga: false
  },
  panel: {
    mode: 0,
    last_tip: 0,
    quiz1: true
  }
};

},{}],16:[function(require,module,exports){
'use strict';

module.exports = {
  1: {
    name: 'Google index',
    title: 'I',
    icon: 'google',
    'url-r': 'https://www.google.com/search?hl=en&safe=off&q=site%3A{domain|encode}&btnG=Search&gws_rd=cr',
    matches: ['<div id="extabar">.*?About ([0-9,]+) results<nobr>', '<div id="extabar">.*?([0-9,]+) results<nobr>', '<div id="extabar">.*?About ([0-9,]+) result<nobr>', '<div id="extabar">.*?([0-9,]+) result<nobr>'],
    disabled: ['internal', 'google', 'yahoo', 'bing', 'yandex', 'semrush'],
    type: 'domain'
  },
  3: {
    name: 'Google cachedate',
    title: 'Cached',
    icon: 'google',
    'url-r': 'https://webcache.googleusercontent.com/search?hl=en&gl=en&ie=UTF-8&oe=UTF-8&q=cache:{url|encode}',
    matches: ['as it appeared on ([0-9]{1,2} [a-z]{3} [0-9]{4}) [0-9]{2}:[0-9]{2}:[0-9]{2} GMT\\.', 'Your search - <b>[^<]+</b> - did (not match) any documents.'],
    disabled: ['seobar', 'google', 'yahoo', 'bing', 'yandex', 'linkinfo', 'semrush', 'external'],
    type: 'page'
  },
  10: {
    name: 'Yahoo index',
    title: 'I',
    icon: 'yahoo',
    'url-r': 'https://search.yahoo.com/search?p=.&vs={clean_domain|encode}',
    matches: ['<span id=\"resultCount\">([^<]+)<\/span>', '<span[^<]*>([\\d,]+) result(s)?<\/span>'],
    disabled: ['seobar', 'google', 'yahoo', 'bing', 'yandex', 'linkinfo', 'semrush', 'internal', 'external'],
    type: 'domain'
  },
  15: {
    name: 'SEMrush backlinks',
    title: 'L',
    icon: 'semrush',
    'url-r': 'https://bl.publicapi.semrush.com/?url={url|encode}&ref=sq',
    'url-s': 'https://www.semrush.com/analytics/backlinks/backlinks/?q={url|encode}&searchType=url?utm_source=seoquake&utm_medium=toolbar&utm_campaign=params&ref=174537735',
    matches: ['<links>(\\d+)<\/links>'],
    disabled: [],
    type: 'backlinks'
  },
  16: {
    name: 'SEMrush subdomain backlinks',
    title: 'LD',
    icon: 'semrush',
    'url-r': 'https://bl.publicapi.semrush.com/?url={scheme}%3A%2F%2F{domain|encode}%2F&ref=sq',
    'url-s': 'https://www.semrush.com/analytics/backlinks/backlinks/{domain|encode}:domain?utm_source=seoquake&utm_medium=toolbar&utm_campaign=params&ref=174537735',
    matches: ['<links_hostname>(\\d+)<\/links_hostname>'],
    disabled: ['internal'],
    type: 'backlinks'
  },
  17: {
    name: 'SEMrush root domain backlinks',
    title: 'LRD',
    icon: 'semrush',
    'url-r': 'https://bl.publicapi.semrush.com/?url={scheme}%3A%2F%2F{domain|encode}%2F&ref=sq',
    'url-s': 'https://www.semrush.com/analytics/backlinks/backlinks/{domain|encode}:root_domain?utm_source=seoquake&utm_medium=toolbar&utm_campaign=params&ref=174537735',
    matches: ['<links_domain>(\\d+)<\/links_domain>'],
    disabled: ['seobar', 'google', 'yahoo', 'bing', 'yandex', 'linkinfo', 'semrush', 'internal', 'external'],
    type: 'backlinks'
  },

  20: {
    name: 'Bing index',
    title: 'I',
    icon: 'bing',
    'url-r': 'https://www.bing.com/search?q=site%3A{domain|encode}&FORM=QBRE',
    matches: ['\"sb_count\">[^0-9<]*([0-9,\\. &#;]+)[^<]*<\/span>'],
    disabled: ['internal'],
    type: 'domain'
  },
  31: {
    name: 'Alexa rank',
    title: 'Rank',
    icon: 'alexa',
    'url-r': 'https://xml.alexa.com/data?cli=10&dat=nsa&ver=quirk-searchstatus&url={domain|encode}',
    'url-s': 'https://www.alexa.com/siteinfo/{domain}',
    matches: ['<POPULARITY URL=".+"? TEXT="(\\d+)"'],
    disabled: ['internal'],
    type: 'domain'
  },
  35: {
    name: 'Facebook likes',
    title: 'l',
    icon: 'facebook',
    'url-r': 'https://www.facebook.com/v2.5/plugins/like.php?layout=button_count&href={url|encode}',
    matches: ['<span class="pluginCountTextDisconnected">([^>]+)<\/span>', '<div class="connect_widget_button_count_count">([^>]+)<\/div>', '<span class="_5n6h _2pih" id="u_0_2">([^>]+)<\/span>'],
    disabled: ['google', 'yahoo', 'bing', 'yandex', 'linkinfo', 'semrush', 'external'],
    type: 'page'
  },
  37: {
    name: 'Whois',
    title: 'whois',
    icon: 'user',
    'url-r': 'https://whois.domaintools.com/{domain}?utm_source=seoquake&utm_medium=seoquake&utm_campaign=seoquake&ref=174537735',
    disabled: ['internal'],
    type: 'domain'
  },
  38: {
    name: 'Page source',
    title: 'source',
    icon: 'source',
    'url-r': 'view-source:{url}',
    disabled: ['linkinfo', 'internal', 'external'],
    type: 'page'
  },
  41: {
    name: 'SEMrush Rank',
    title: 'Rank',
    icon: 'semrush',
    'url-r': 'https://seoquake.publicapi.semrush.com/info.php?url={scheme}%3A%2F%2F{domain|encode}%2F',
    'url-s': 'https://www.semrush.com/info/{domain|encode}?ref=174537735&utm_source=seoquake&utm_medium=toolbar&utm_campaign=params',
    matches: ['<rank>(\\d+)<\/rank>'],
    disabled: ['internal'],
    type: 'domain'
  },
  42: {
    name: 'SEMrush SE Traffic',
    title: 'Traffic',
    icon: 'semrush',
    'url-r': 'https://seoquake.publicapi.semrush.com/info.php?url={scheme}%3A%2F%2F{domain|encode}%2F',
    'url-s': 'https://www.semrush.com/info/{domain|encode}?ref=174537735&utm_source=seoquake&utm_medium=toolbar&utm_campaign=params',
    matches: ['<traffic>(\\d+)<\/traffic>'],
    disabled: ['seobar', 'google', 'yahoo', 'bing', 'yandex', 'linkinfo', 'semrush', 'internal', 'external'],
    type: 'domain'
  },
  43: {
    name: 'SEMrush SE Traffic price',
    title: 'Costs',
    icon: 'semrush',
    'url-r': 'https://seoquake.publicapi.semrush.com/info.php?url={scheme}%3A%2F%2F{domain|encode}%2F',
    'url-s': 'https://www.semrush.com/info/{domain|encode}?ref=174537735&utm_source=seoquake&utm_medium=toolbar&utm_campaign=params',
    matches: ['<costs>(\\d+)<\/costs>'],
    disabled: ['seobar', 'google', 'yahoo', 'bing', 'yandex', 'linkinfo', 'semrush', 'internal', 'external'],
    type: 'domain'
  },
  45: {
    name: 'SEMrush advertiser display ads',
    title: 'Adv Disp Ads',
    icon: 'semrush',
    'url-r': 'https://da.publicapi.semrush.com/adv/?q={topdomain}',
    'url-s': 'https://www.semrush.com/analytics/da/creatives/{topdomain}?platformName=asAdvertiser&ref=174537735&utm_source=seoquake&utm_medium=serpoverlay&utm_campaign=display_advertising',
    matches: ['(\\d+)'],
    disabled: ['linkinfo', 'semrush', 'internal', 'external'],
    type: 'domain'
  },
  46: {
    name: 'SEMrush publisher display ads',
    title: 'Pub Disp Ads',
    icon: 'semrush',
    'url-r': 'https://da.publicapi.semrush.com/pub/?q={topdomain}',
    'url-s': 'https://www.semrush.com/analytics/da/creatives/{topdomain}?platformName=asPublisher&ref=174537735&utm_source=seoquake&utm_medium=serpoverlay&utm_campaign=display_advertising',
    matches: ['(\\d+)'],
    disabled: ['linkinfo', 'semrush', 'internal', 'external'],
    type: 'domain'
  },
  50: {
    name: 'Yandex IKS',
    title: 'IKS',
    icon: 'yandex',
    'url-r': 'https://webmaster.yandex.ru/sqi/?host={domain|encode}',
    matches: ['ИКС: ([\\W\\d]*)\\<\\/div>'],
    disabled: ['seobar', 'google', 'yahoo', 'bing', 'linkinfo', 'semrush', 'internal', 'external'],
    type: 'domain'
  },
  51: {
    name: 'Yandex index',
    title: 'I',
    icon: 'yandex',
    'url-r': 'https://www.yandex.ru/search/?text=host%3A{domain|encode}',
    matches: ['<strong class="b-head-logo__text">[^<]+<br\/*>(\\d+)([^<]+)<\/strong>', '"found":"\\&mdash;\\&nbsp;(\\d+)(.тыс\\.|млн)?.ответ', '"found":"—\\\\n(\\d+)(.тыс\\.|.млн)?.ответ', '<div class="serp-adv__found">[^<]+ (\\d+)(.тыс\\.|.млн)?.результ', '<div class=serp-adv__found>[^<]+ (\\d+)(.тыс\\.|.млн)?.результ'],
    disabled: ['seobar', 'google', 'yahoo', 'bing', 'linkinfo', 'semrush', 'internal', 'external'],
    type: 'domain'
  },
  60: {
    name: 'Pinterest Pin count',
    title: 'PIN',
    icon: 'pinterest',
    'url-r': 'https://api.pinterest.com/v1/urls/count.json?callback=r&url={url|encode}',
    matches: ['"count":\\s*(\\d+)'],
    disabled: ['google', 'yahoo', 'bing', 'yandex', 'linkinfo', 'semrush', 'internal', 'external'],
    type: 'page'
  },
  70: {
    name: 'Baidu index',
    title: 'I',
    icon: 'baidu',
    'url-r': 'https://www.baidu.com/s?wd=site%3A{domain|encode}&cl=3',
    matches: ['<span class="nums"[^>]*>.+?([0-9,]+).+?<\/span>', '<div class=".*site_tip_icon".*?<b>.+?(\\d+).+?</b>', '<p class=".*?op_site_box_title.*?".*?<span>.*?<b[^>]+>([\\d,]+)</b>', '<b style="color:#333">([\\d,]+)</b>', '<div class="c-span21 c-span-last"><p><b>.+?([0-9,]+).+?</b></p>'],
    disabled: ['seobar', 'google', 'yahoo', 'bing', 'yandex', 'linkinfo', 'semrush', 'internal', 'external'],
    type: 'domain'
  }
};

},{}],17:[function(require,module,exports){
'use strict';

module.exports = function googleChecksum(url) {
  function c32to8bit(arr32) {
    var arr8 = [];
    var i = void 0;
    var bitOrder = void 0;

    for (i = 0; i < arr32.length; i++) {
      for (bitOrder = i * 4; bitOrder <= i * 4 + 3; bitOrder++) {
        arr8[bitOrder] = arr32[i] & 255;
        arr32[i] = zeroFill(arr32[i], 8);
      }
    }

    return arr8;
  }

  function strord(string) {
    var result = [];
    var i = void 0;

    for (i = 0; i < string.length; i++) {
      result[i] = string[i].charCodeAt(0);
    }

    return result;
  }

  function googleChecksum(url) {
    var init = 0xE6359A60;
    var length = url.length;
    var a = 0x9E3779B9;
    var b = 0x9E3779B9;
    var c = 0xE6359A60;
    var k = 0;
    var len = length;
    var mixo = [];

    function mix(a, b, c) {
      a -= b;
      a -= c;
      a ^= zeroFill(c, 13);
      b -= c;
      b -= a;
      b ^= a << 8;
      c -= a;
      c -= b;
      c ^= zeroFill(b, 13);
      a -= b;
      a -= c;
      a ^= zeroFill(c, 12);
      b -= c;
      b -= a;
      b ^= a << 16;
      c -= a;
      c -= b;
      c ^= zeroFill(b, 5);
      a -= b;
      a -= c;
      a ^= zeroFill(c, 3);
      b -= c;
      b -= a;
      b ^= a << 10;
      c -= a;
      c -= b;
      c ^= zeroFill(b, 15);
      return [a, b, c];
    }

    while (len >= 12) {
      a += url[k] + (url[k + 1] << 8) + (url[k + 2] << 16) + (url[k + 3] << 24);
      b += url[k + 4] + (url[k + 5] << 8) + (url[k + 6] << 16) + (url[k + 7] << 24);
      c += url[k + 8] + (url[k + 9] << 8) + (url[k + 10] << 16) + (url[k + 11] << 24);
      mixo = mix(a, b, c);
      a = mixo[0];
      b = mixo[1];
      c = mixo[2];
      k += 12;
      len -= 12;
    }

    c += length;
    switch (len) {
      case 11:
        c += url[k + 10] << 24;

      case 10:
        c += url[k + 9] << 16;

      case 9:
        c += url[k + 8] << 8;

      case 8:
        b += url[k + 7] << 24;

      case 7:
        b += url[k + 6] << 16;

      case 6:
        b += url[k + 5] << 8;

      case 5:
        b += url[k + 4];

      case 4:
        a += url[k + 3] << 24;

      case 3:
        a += url[k + 2] << 16;

      case 2:
        a += url[k + 1] << 8;

      case 1:
        a += url[k];
    }

    mixo = mix(a, b, c);

    return mixo[2] < 0 ? 0x100000000 + mixo[2] : mixo[2];
  }

  function myfmod(x, y) {
    var i = Math.floor(x / y);
    return x - i * y;
  }

  function zeroFill(a, b) {
    var z = hexdec(80000000);

    if (z & a) {
      a = a >> 1;
      a &= ~z;
      a |= 0x40000000;
      a = a >> b - 1;
    } else {
      a = a >> b;
    }

    return a;
  }

  function hexdec(str) {
    return parseInt(str, 16);
  }

  function newGoogleChecksum(checksum) {
    var prbuf = [];
    var i = void 0;

    checksum = checksum / 7 << 2 | myfmod(checksum, 13) & 7;

    prbuf[0] = checksum;
    for (i = 1; i < 20; i++) {
      prbuf[i] = prbuf[i - 1] - 9;
    }

    checksum = googleChecksum(c32to8bit(prbuf), 80);

    return checksum;
  }

  return '6' + newGoogleChecksum(googleChecksum(strord(url)));
};

},{}],18:[function(require,module,exports){
'use strict';

module.exports = function (string) {
  return hex_md5(string);
};

var hexcase = 0;function hex_md5(a) {
  return rstr2hex(rstr_md5(str2rstr_utf8(a)));
}function hex_hmac_md5(a, b) {
  return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(b)));
}function md5_vm_test() {
  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
}function rstr_md5(a) {
  return binl2rstr(binl_md5(rstr2binl(a), a.length * 8));
}function rstr_hmac_md5(c, f) {
  var e = rstr2binl(c);if (e.length > 16) {
    e = binl_md5(e, c.length * 8);
  }var a = Array(16),
      d = Array(16);for (var b = 0; b < 16; b++) {
    a[b] = e[b] ^ 909522486;d[b] = e[b] ^ 1549556828;
  }var g = binl_md5(a.concat(rstr2binl(f)), 512 + f.length * 8);return binl2rstr(binl_md5(d.concat(g), 512 + 128));
}function rstr2hex(c) {
  try {
    hexcase;
  } catch (g) {
    hexcase = 0;
  }var f = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";var b = "";var a;for (var d = 0; d < c.length; d++) {
    a = c.charCodeAt(d);b += f.charAt(a >>> 4 & 15) + f.charAt(a & 15);
  }return b;
}function str2rstr_utf8(c) {
  var b = "";var d = -1;var a, e;while (++d < c.length) {
    a = c.charCodeAt(d);e = d + 1 < c.length ? c.charCodeAt(d + 1) : 0;if (55296 <= a && a <= 56319 && 56320 <= e && e <= 57343) {
      a = 65536 + ((a & 1023) << 10) + (e & 1023);d++;
    }if (a <= 127) {
      b += String.fromCharCode(a);
    } else {
      if (a <= 2047) {
        b += String.fromCharCode(192 | a >>> 6 & 31, 128 | a & 63);
      } else {
        if (a <= 65535) {
          b += String.fromCharCode(224 | a >>> 12 & 15, 128 | a >>> 6 & 63, 128 | a & 63);
        } else {
          if (a <= 2097151) {
            b += String.fromCharCode(240 | a >>> 18 & 7, 128 | a >>> 12 & 63, 128 | a >>> 6 & 63, 128 | a & 63);
          }
        }
      }
    }
  }return b;
}function rstr2binl(b) {
  var a = Array(b.length >> 2);for (var c = 0; c < a.length; c++) {
    a[c] = 0;
  }for (var c = 0; c < b.length * 8; c += 8) {
    a[c >> 5] |= (b.charCodeAt(c / 8) & 255) << c % 32;
  }return a;
}function binl2rstr(b) {
  var a = "";for (var c = 0; c < b.length * 32; c += 8) {
    a += String.fromCharCode(b[c >> 5] >>> c % 32 & 255);
  }return a;
}function binl_md5(p, k) {
  p[k >> 5] |= 128 << k % 32;p[(k + 64 >>> 9 << 4) + 14] = k;var o = 1732584193;var n = -271733879;var m = -1732584194;var l = 271733878;for (var g = 0; g < p.length; g += 16) {
    var j = o;var h = n;var f = m;var e = l;o = md5_ff(o, n, m, l, p[g + 0], 7, -680876936);l = md5_ff(l, o, n, m, p[g + 1], 12, -389564586);m = md5_ff(m, l, o, n, p[g + 2], 17, 606105819);n = md5_ff(n, m, l, o, p[g + 3], 22, -1044525330);o = md5_ff(o, n, m, l, p[g + 4], 7, -176418897);l = md5_ff(l, o, n, m, p[g + 5], 12, 1200080426);m = md5_ff(m, l, o, n, p[g + 6], 17, -1473231341);n = md5_ff(n, m, l, o, p[g + 7], 22, -45705983);o = md5_ff(o, n, m, l, p[g + 8], 7, 1770035416);l = md5_ff(l, o, n, m, p[g + 9], 12, -1958414417);m = md5_ff(m, l, o, n, p[g + 10], 17, -42063);n = md5_ff(n, m, l, o, p[g + 11], 22, -1990404162);o = md5_ff(o, n, m, l, p[g + 12], 7, 1804603682);l = md5_ff(l, o, n, m, p[g + 13], 12, -40341101);m = md5_ff(m, l, o, n, p[g + 14], 17, -1502002290);n = md5_ff(n, m, l, o, p[g + 15], 22, 1236535329);o = md5_gg(o, n, m, l, p[g + 1], 5, -165796510);l = md5_gg(l, o, n, m, p[g + 6], 9, -1069501632);m = md5_gg(m, l, o, n, p[g + 11], 14, 643717713);n = md5_gg(n, m, l, o, p[g + 0], 20, -373897302);o = md5_gg(o, n, m, l, p[g + 5], 5, -701558691);l = md5_gg(l, o, n, m, p[g + 10], 9, 38016083);m = md5_gg(m, l, o, n, p[g + 15], 14, -660478335);n = md5_gg(n, m, l, o, p[g + 4], 20, -405537848);o = md5_gg(o, n, m, l, p[g + 9], 5, 568446438);l = md5_gg(l, o, n, m, p[g + 14], 9, -1019803690);m = md5_gg(m, l, o, n, p[g + 3], 14, -187363961);n = md5_gg(n, m, l, o, p[g + 8], 20, 1163531501);o = md5_gg(o, n, m, l, p[g + 13], 5, -1444681467);l = md5_gg(l, o, n, m, p[g + 2], 9, -51403784);m = md5_gg(m, l, o, n, p[g + 7], 14, 1735328473);n = md5_gg(n, m, l, o, p[g + 12], 20, -1926607734);o = md5_hh(o, n, m, l, p[g + 5], 4, -378558);l = md5_hh(l, o, n, m, p[g + 8], 11, -2022574463);m = md5_hh(m, l, o, n, p[g + 11], 16, 1839030562);n = md5_hh(n, m, l, o, p[g + 14], 23, -35309556);o = md5_hh(o, n, m, l, p[g + 1], 4, -1530992060);l = md5_hh(l, o, n, m, p[g + 4], 11, 1272893353);m = md5_hh(m, l, o, n, p[g + 7], 16, -155497632);n = md5_hh(n, m, l, o, p[g + 10], 23, -1094730640);o = md5_hh(o, n, m, l, p[g + 13], 4, 681279174);l = md5_hh(l, o, n, m, p[g + 0], 11, -358537222);m = md5_hh(m, l, o, n, p[g + 3], 16, -722521979);n = md5_hh(n, m, l, o, p[g + 6], 23, 76029189);o = md5_hh(o, n, m, l, p[g + 9], 4, -640364487);l = md5_hh(l, o, n, m, p[g + 12], 11, -421815835);m = md5_hh(m, l, o, n, p[g + 15], 16, 530742520);n = md5_hh(n, m, l, o, p[g + 2], 23, -995338651);o = md5_ii(o, n, m, l, p[g + 0], 6, -198630844);l = md5_ii(l, o, n, m, p[g + 7], 10, 1126891415);m = md5_ii(m, l, o, n, p[g + 14], 15, -1416354905);n = md5_ii(n, m, l, o, p[g + 5], 21, -57434055);o = md5_ii(o, n, m, l, p[g + 12], 6, 1700485571);l = md5_ii(l, o, n, m, p[g + 3], 10, -1894986606);m = md5_ii(m, l, o, n, p[g + 10], 15, -1051523);n = md5_ii(n, m, l, o, p[g + 1], 21, -2054922799);o = md5_ii(o, n, m, l, p[g + 8], 6, 1873313359);l = md5_ii(l, o, n, m, p[g + 15], 10, -30611744);m = md5_ii(m, l, o, n, p[g + 6], 15, -1560198380);n = md5_ii(n, m, l, o, p[g + 13], 21, 1309151649);o = md5_ii(o, n, m, l, p[g + 4], 6, -145523070);l = md5_ii(l, o, n, m, p[g + 11], 10, -1120210379);m = md5_ii(m, l, o, n, p[g + 2], 15, 718787259);n = md5_ii(n, m, l, o, p[g + 9], 21, -343485551);o = safe_add(o, j);n = safe_add(n, h);m = safe_add(m, f);l = safe_add(l, e);
  }return Array(o, n, m, l);
}function md5_cmn(h, e, d, c, g, f) {
  return safe_add(bit_rol(safe_add(safe_add(e, h), safe_add(c, f)), g), d);
}function md5_ff(g, f, k, j, e, i, h) {
  return md5_cmn(f & k | ~f & j, g, f, e, i, h);
}function md5_gg(g, f, k, j, e, i, h) {
  return md5_cmn(f & j | k & ~j, g, f, e, i, h);
}function md5_hh(g, f, k, j, e, i, h) {
  return md5_cmn(f ^ k ^ j, g, f, e, i, h);
}function md5_ii(g, f, k, j, e, i, h) {
  return md5_cmn(k ^ (f | ~j), g, f, e, i, h);
}function safe_add(a, d) {
  var c = (a & 65535) + (d & 65535);var b = (a >> 16) + (d >> 16) + (c >> 16);return b << 16 | c & 65535;
}function bit_rol(a, b) {
  return a << b | a >>> 32 - b;
};

},{}],19:[function(require,module,exports){
'use strict';

exports.$A = function (iterable) {

  var results = [];
  if (!iterable) {
    return results;
  } else if (iterable.toArray) {
    return iterable.toArray();
  } else if (iterable.length) {
    for (var i = 0, l = iterable.length; i < l; i++) {
      results.push(iterable[i]);
    }
  } else {
    for (var key in iterable) {
      if (iterable.hasOwnProperty(key)) {
        results.push(iterable[key]);
      }
    }
  }

  return results;
};

if (!Array.from) {
  Array.from = exports.$A;
}

},{}],20:[function(require,module,exports){
'use strict';

var isArray = require('./isArray');

module.exports = function containsText(string, pattern) {
  if (string === undefined || string === null || !string.indexOf) {
    return false;
  }

  if (isArray(pattern)) {
    return pattern.some(function (pat) {
      return string.indexOf(pat) !== -1;
    });
  }

  return string.indexOf(pattern) !== -1;
};

},{"./isArray":25}],21:[function(require,module,exports){
'use strict';

module.exports = function endsWith(string, pattern) {
  if (string === undefined || string === null || !string.indexOf) {
    return false;
  }

  if (pattern === undefined || pattern === null || !pattern.indexOf) {
    return false;
  }

  var d = string.length - pattern.length;
  return d >= 0 && string.lastIndexOf(pattern) === d;
};

},{}],22:[function(require,module,exports){
(function (global){(function (){
'use strict';

module.exports = function getUUID() {
  var d = new Date().getTime();

  if (global.performance && typeof global.performance.now === 'function') {
    d += performance.now();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],23:[function(require,module,exports){
'use strict';

module.exports = function ignore(reason) {
  console.log(reason);
};

},{}],24:[function(require,module,exports){
'use strict';

module.exports = function ip2long(ip) {
  var ips = ip.split('.');
  var iplong = void 0;

  if (ips.length !== 4) {
    return null;
  }

  iplong = ips[0] * Math.pow(256, 3) + ips[1] * Math.pow(256, 2) + ips[2] * Math.pow(256, 1) + ips[3] * Math.pow(256, 0);

  return iplong;
};

},{}],25:[function(require,module,exports){
'use strict';

module.exports = function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

},{}],26:[function(require,module,exports){
'use strict';

module.exports = function isEmpty(value, key) {
  if (key !== undefined && typeof value === 'object') {
    if (isEmpty(value)) {
      return true;
    }

    if (!value.hasOwnProperty(key) && !(key in value)) {
      return true;
    }

    value = value[key];
  }

  if (value === null || value === undefined || value === '') {
    return true;
  }

  if (value.hasOwnProperty('length')) {
    return value.length === 0;
  }

  try {
    if (value instanceof Node) {
      return false;
    }
  } catch (e) {}

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
};

},{}],27:[function(require,module,exports){
'use strict';

module.exports = function isFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};

},{}],28:[function(require,module,exports){
'use strict';

module.exports = function isObject(obj) {
  var key;

  if (!obj || Object.prototype.toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval) {
    return false;
  }

  if (obj.constructor && !hasOwnProperty.call(obj, 'constructor') && !hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
    return false;
  }

  for (key in obj) {}


  return key === undefined || hasOwnProperty.call(obj, key);
};

},{}],29:[function(require,module,exports){
'use strict';

module.exports = function isParameterDeleted(parameter, checkFully) {
  if (parameter === undefined || parameter === null) {
    return true;
  }

  if (!parameter.hasOwnProperty('state')) {
    return false;
  }

  if (checkFully === true) {
    return parameter.state === 'fully_deleted';
  } else if (checkFully === false) {
    return parameter.state === 'deleted';
  }

  return parameter.state === 'deleted' || parameter.state === 'fully_deleted';
};

},{}],30:[function(require,module,exports){
'use strict';

module.exports = function isString(value) {
  return value instanceof String || typeof value === 'string';
};

},{}],31:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function parseArgs(str) {
  var result = new Map();

  if (str === '' || str === undefined || str === null) {
    return result;
  }

  str = str.replace(/^(\?|#)/, '');

  if (str === '') {
    return result;
  }

  var args = str.split('&');

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var element = _step.value;

      if (element.indexOf('=') !== -1) {
        var _element$split = element.split('='),
            _element$split2 = _slicedToArray(_element$split, 2),
            key = _element$split2[0],
            value = _element$split2[1];

        result.set(decodeURIComponent(key), decodeURIComponent(value));
      } else {
        result.set(element, null);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return result;
}

function createArgs(args) {
  if (!(args instanceof Map)) {
    throw new Error('args should be instance of Map');
  }

  var result = [];
  args.forEach(function (value, key) {
    return result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
  });
  return result.join('&');
}

exports.parseArgs = parseArgs;
exports.createArgs = createArgs;

},{}],32:[function(require,module,exports){
'use strict';

var isEmpty = require('./isEmpty');

function parseUri(string) {
  var o = void 0;
  var m = void 0;
  var uri = {};
  var l = void 0;
  var i = void 0;
  var match = void 0;
  var p = void 0;

  if (string.indexOf('@') >= 0) {
    string = string.split('//');
    if (string[1].indexOf('/') > 0) {
      string[1] = string[1].substr(0, string[1].indexOf('/')) + string[1].substr(string[1].indexOf('/')).replace('@', '%40');
    }

    string = string[0] + '//' + string[1];
  }

  o = parseUri.options;
  m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(string);
  i = o.key.length;

  while (i--) {
    uri[o.key[i]] = m[i] || '';
  }

  uri.cache = 'https://webcache.googleusercontent.com/search?hl=en&ie=UTF-8&oe=UTF-8&q=cache:' + uri.url;
  uri.clean_domain = uri.domain.replace(/^www\./, '');

  uri.query = '?' + uri.query;

  match = uri.domain.match(/^.+\.{1}([a-z0-9\-]+\.{1}[a-z]+)$/i);
  uri.topdomain = match ? match[1] : uri.domain;

  uri.is_subdomain = uri.clean_domain !== uri.topdomain;

  p = uri.domain.split('.');
  p = p.reverse();
  for (i = 0, l = p.length; i < l; i++) {
    uri[(i + 1).toString()] = p[i];
  }

  if (isEmpty(uri, 'path')) {
    uri.path = '/';
  }

  return uri;
}

parseUri.options = {
  strictMode: false,
  key: ['url', 'scheme', 'authority', 'userInfo', 'user', 'password', 'domain', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'],
  q: {
    name: 'queryKey',
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

function createUri(uriObject) {
  var result = uriObject.scheme + '://';

  if (!isEmpty(uriObject, 'user') || !isEmpty(uriObject, 'password')) {
    if (!isEmpty(uriObject, 'user')) {
      result += uriObject.user;
    }

    if (!isEmpty(uriObject, 'password')) {
      result += ':' + uriObject.password;
    }

    result += '@';
  }

  result += uriObject.domain;

  if (!isEmpty(uriObject, 'port')) {
    result += ':' + uriObject.port;
  }

  result += uriObject.path;

  if (!isEmpty(uriObject, 'query')) {
    var queryText = uriObject.query.replace(/^\?/, '');
    if (!isEmpty(queryText)) {
      result += '?' + queryText;
    }
  }

  if (!isEmpty(uriObject, 'anchor')) {
    result += '#' + uriObject.anchor;
  }

  return result;
}

function clearUri(uriString) {
  var uriObject = parseUri(uriString);
  uriObject.path = decodeURIComponent(uriObject.path.replace('+', ' '));
  return createUri(uriObject);
}

exports.parseUri = parseUri;
exports.createUri = createUri;
exports.clearUri = clearUri;

},{"./isEmpty":26}],33:[function(require,module,exports){
'use strict';

var hexMd5 = require('../hex-md5');

module.exports = function shortHash(input) {
  return hexMd5(input).substr(0, 8);
};

},{"../hex-md5":18}],34:[function(require,module,exports){
'use strict';

module.exports = function startsWith(string, pattern) {
  if (string === undefined || string === null || !string.indexOf) {
    return false;
  }

  return string.indexOf(pattern) === 0;
};

},{}],35:[function(require,module,exports){
'use strict';

module.exports = function trimHash(url) {
  var result = url;
  var hashPosition = url.indexOf('#');
  if (hashPosition !== -1) {
    result = url.substring(0, hashPosition);
  }

  return result;
};

},{}],36:[function(require,module,exports){
'use strict';

var isEmpty = require('./isEmpty');

module.exports = function versionCompare(oldVersion, newVersion) {
  if (oldVersion === newVersion) {
    return 0;
  }

  if (isEmpty(oldVersion) && !isEmpty(newVersion)) {
    return 1;
  }

  oldVersion = oldVersion.split('.');
  newVersion = newVersion.split('.');
  while (newVersion.length < oldVersion.length) {
    newVersion.push('0');
  }

  for (var i = 0; i < newVersion.length; i++) {
    if (oldVersion.length <= i) {
      return 1;
    }

    if (parseInt(newVersion[i]) > parseInt(oldVersion[i])) {
      return 1;
    }
  }

  return -1;
};

},{"./isEmpty":26}],37:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getUUID = require('../lib/getUUID');

var OAuthQueue = function () {
  function OAuthQueue(browser) {
    _classCallCheck(this, OAuthQueue);

    this._browser = null;
    this._requests = new Map();
    this.browser = browser;
  }

  _createClass(OAuthQueue, [{
    key: 'addRequest',
    value: function addRequest(url) {
      var id = getUUID();
      url += '&state=' + encodeURIComponent(id);
      var request = {
        url: url,
        id: id
      };
      this._requests.set(id, request);
      this._browser.openTab(url);
      return id;
    }
  }, {
    key: 'processRequest',
    value: function processRequest(data) {
      if ('state' in data) {
        if (!this._requests.has(data.state)) {
          return false;
        }

        this._requests.get(data.state).code = data.code;
        return this._requests.get(data.state);
      } else {
        return false;
      }
    }
  }, {
    key: 'processError',
    value: function processError(data) {
      if ('state' in data) {
        if (!this._requests.has(data.state)) {
          return false;
        }

        this._requests.get(data.state).error = data.error;
        return this._requests.get(data.state);
      } else {
        return false;
      }
    }
  }, {
    key: 'getCode',
    value: function getCode(id) {
      if (this._requests.has(id)) {
        var result = this._requests.get(id).code;
        this._requests.delete(id);
        return result;
      }

      return '';
    }
  }, {
    key: 'browser',
    get: function get() {
      return this._browser;
    },
    set: function set(value) {
      this._browser = value;
    }
  }]);

  return OAuthQueue;
}();

module.exports = OAuthQueue;

},{"../lib/getUUID":22}],38:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ignore = require('../lib/ignore');

var Parameters = function () {
  function Parameters(messagesDispatcher, dataSource) {
    _classCallCheck(this, Parameters);

    this._dataSource = dataSource;

    messagesDispatcher['sq.requestParameter'] = this.requestParameter.bind(this);
    messagesDispatcher['sq.requestPluginCancel'] = this.requestPluginCancel.bind(this);
    messagesDispatcher['sq.requestCancel'] = this.requestCancel.bind(this);
  }

  _createClass(Parameters, [{
    key: 'requestParameter',
    value: function requestParameter(request, callback, sender) {
      var _this = this;

      try {
        if (!('payload' in request)) {
          throw new Error('Wrong request');
        }

        var onlyCache = false;

        if ('onlyCache' in request.payload) {
          onlyCache = request.payload.onlyCache;
        }

        var senderId = '';

        if ('sender' in request) {
          senderId = request.sender;
        }

        this._dataSource.requestParameter(request.payload.render, onlyCache, sender, senderId).then(callback).catch(function (e) {
          if (e && e.message && e.message === 'no_port') {
            if (senderId !== '') {
              _this._dataSource.requestPluginCancel(senderId);
            }
          } else {
            console.log('Error on requestParameter: ', e);
          }
        });
      } catch (e) {
        callback({
          error: e.message
        });
      }
    }
  }, {
    key: 'requestPluginCancel',
    value: function requestPluginCancel(request, callback, sender) {
      try {
        if (!('sender' in request)) {
          throw new Error('Wrong request');
        }

        this._dataSource.requestPluginCancel(request.sender);
      } catch (e) {
        callback({
          error: e.message
        });
      }
    }
  }, {
    key: 'requestCancel',
    value: function requestCancel(request, callback, sender) {
      try {
        this._dataSource.requestCancel(sender);
        callback();
      } catch (e) {
        callback({
          error: e.message
        });
      }
    }
  }, {
    key: 'clearCache',
    value: function clearCache(request, callback, sender) {
      this._dataSource.clearCache();
      callback();
    }
  }]);

  return Parameters;
}();

module.exports = Parameters;

},{"../lib/ignore":23}],39:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var extend = require('extend');
var lib = require('../Lib');
var RequestObject = require('../utils/RequestObject').RequestObject;

var ParametersCache = function () {
  function ParametersCache(config, parameters, queueConstructor) {
    _classCallCheck(this, ParametersCache);

    this._createQueue = queueConstructor;
    this.queues = new Map();
    this.cache = {};
    this.parameters = parameters;
    this.config = extend(true, {
      useCache: true,
      delay: 500
    }, config);
  }

  _createClass(ParametersCache, [{
    key: 'setConfig',
    value: function setConfig(key, value) {
      this.config[key] = value;
    }
  }, {
    key: '_checkCache',
    value: function _checkCache(renderObject) {
      if (this.config.useCache === false) {
        return true;
      }

      var doRequest = false;

      for (var i = 0; i < renderObject.params.length; i++) {
        var value = this.getFromCache(renderObject.requestUrlHash, renderObject.params[i]);
        if (value !== null) {
          renderObject.values[renderObject.params[i]] = value;
        } else {
          doRequest = true;
        }
      }

      return doRequest;
    }
  }, {
    key: 'requestParameter',
    value: function requestParameter(renderObject, onlyCache, sender, senderId) {
      var _this = this;

      senderId = senderId || '';

      var doRequest = this._checkCache(renderObject);

      if (onlyCache === true || !doRequest) {
        return Promise.resolve(renderObject);
      } else {
        return new Promise(function (resolve) {
          return _this.requestData(renderObject, sender, senderId, resolve);
        });
      }
    }
  }, {
    key: 'requestData',
    value: function requestData(renderObject, sender, senderId, readyCallback) {
      var _this2 = this;

      var serviceDomainHash = lib.shortHash(lib.parseUri(renderObject['url-r']).domain);

      var request = new RequestObject(renderObject, sender, readyCallback);
      request.senderId = senderId;
      request.errorCallback = this.processError.bind(this);
      request.processCallback = this.processData.bind(this);
      request.beforeQueryCallback = function (requestObject) {
        return _this2._checkCache(requestObject.renderObject);
      };
      request.queueId = serviceDomainHash;

      var queue = void 0;

      if (!this.queues.has(serviceDomainHash)) {
        queue = this._createQueue(this.config.delay);
        this.queues.set(serviceDomainHash, queue);
      } else {
        queue = this.queues.get(serviceDomainHash);
      }

      queue.delay = this.config.delay;
      queue.push(request);
    }
  }, {
    key: 'requestCancel',
    value: function requestCancel(sender) {
      this.queues.forEach(function (queue) {
        return queue.clearQueue(function (requestObject) {
          return requestObject.sender !== sender;
        });
      });
    }
  }, {
    key: 'requestPluginCancel',
    value: function requestPluginCancel(sender) {
      this.queues.forEach(function (queue) {
        return queue.clearQueue(function (requestObject) {
          return requestObject.senderId !== sender;
        });
      });
    }
  }, {
    key: 'processData',
    value: function processData(responseText, requestObject) {
      var result = void 0;

      for (var i = 0; i < requestObject.renderObject.params.length; i++) {
        var parameterId = requestObject.renderObject.params[i];
        try {
          var value = ParametersCache.parseParam(responseText, this.parameters.get(parameterId).matches);

          if (value.length === 2) {
            var val = '' + value[1];
            if (val.substr(1, 4) === 'тыс.') {
              result = value[0] + '000';
            } else if (val.substr(1, 3) === 'млн') {
              result = value[0] + '000000';
            } else if (isNaN(parseInt(val))) {
              result = value[0];
            } else {
              result = value.join('|');
            }
          } else {
            result = value.join('|');
          }
        } catch (e) {
          result = lib.SEOQUAKE_RESULT_ERROR;
        }

        this.setCache(requestObject.renderObject.requestUrlHash, parameterId, result);
        requestObject.renderObject.values[parameterId] = result;
      }
    }
  }, {
    key: 'processError',
    value: function processError(errorText, requestObject) {
      var render = requestObject.renderObject;
      render.params.forEach(function (paramId) {
        return render.values[paramId] = lib.SEOQUAKE_RESULT_ERROR;
      });

      if (this.queues.has(requestObject.queueId)) {
        requestObject.state = 'processingError';

        if (errorText !== 'Attempting to use a disconnected port object') {
          this.queues.get(requestObject.queueId).refuse();
        } else if (requestObject.sender) {
          this.queues.get(requestObject.queueId).clearQueue(function (item) {
            return item.sender !== requestObject.sender;
          });
        }
      }
    }
  }, {
    key: 'getFromCache',
    value: function getFromCache(requestUrlHash, parameterIndex) {
      if (this.config.useCache === false) {
        return null;
      }

      if (!this.cache.hasOwnProperty(requestUrlHash)) {
        return null;
      }

      if (!this.cache[requestUrlHash].hasOwnProperty(parameterIndex)) {
        return null;
      }

      return this.cache[requestUrlHash][parameterIndex];
    }
  }, {
    key: 'setCache',
    value: function setCache(requestUrlHash, parameterIndex, value) {
      if (this.config.useCache === false) {
        return;
      }

      if ([lib.SEOQUAKE_RESULT_NODATA, lib.SEOQUAKE_RESULT_ERROR].indexOf(value) !== -1) {
        return;
      }

      if (!(requestUrlHash in this.cache)) {
        this.cache[requestUrlHash] = {};
      }

      this.cache[requestUrlHash][parameterIndex] = value;
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this.cache = {};
    }
  }, {
    key: 'length',
    get: function get() {
      var result = 0;
      this.queues.forEach(function (queue) {
        return result += queue.length;
      });
      return result;
    }
  }], [{
    key: 'parseParam',
    value: function parseParam(content, matches) {
      for (var i = 0, l = matches.length; i < l; i++) {
        var foo = new RegExp(matches[i], 'i').exec(content);
        if (foo && foo.length > 1) {
          return foo.slice(1);
        }
      }

      return [lib.SEOQUAKE_RESULT_NODATA];
    }
  }]);

  return ParametersCache;
}();

module.exports = ParametersCache;

},{"../Lib":7,"../utils/RequestObject":46,"extend":53}],40:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SemrushBacklinksCache = function () {
  function SemrushBacklinksCache() {
    _classCallCheck(this, SemrushBacklinksCache);

    this._data = {
      root_domain: new Map(),
      domain: new Map(),
      url: new Map()
    };
  }

  _createClass(SemrushBacklinksCache, [{
    key: 'add',
    value: function add(type, target, data) {
      if (typeof this._data[type] === 'undefined') {
        return;
      }

      this._data[type].set(target, data);
    }
  }, {
    key: 'has',
    value: function has(type, target) {
      if (typeof this._data[type] === 'undefined') {
        return false;
      }

      return this._data[type].has(target);
    }
  }, {
    key: 'get',
    value: function get(type, target) {
      if (typeof this._data[type] === 'undefined') {
        return null;
      }

      return this._data[type].get(target);
    }
  }, {
    key: 'clear',
    value: function clear() {
      this._data.root_domain.clear();
      this._data.domain.clear();
      this._data.url.clear();
    }
  }]);

  return SemrushBacklinksCache;
}();

module.exports = SemrushBacklinksCache;

},{}],41:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SemrushRequestQueue = require('./SemrushRequestQueue');
var SemrushBacklinksCache = require('./SemrushBacklinksCache');
var SemrushNotesCache = require('./SemrushNotesCache');
var isEmpty = require('../lib/isEmpty');
var isArray = require('../lib/isArray');
var isObject = require('../lib/isObject');
var args = require('../lib/parseArgs');
var extend = require('extend');

var SemrushClient = function () {
  function SemrushClient(browser, unused, configuration) {
    _classCallCheck(this, SemrushClient);

    this._browser = browser;
    this._configuration = configuration;
    this._queue = new SemrushRequestQueue(this._browser, 1000);
    this._token = '';
    this._projects = null;
    this._projectsLastUpdate = null;
    this._backlinksCache = new SemrushBacklinksCache();
    this._displayAdvertisingCache = new Map();
    this._trafficAnalyticsCache = new Map();
    this._notesCache = new SemrushNotesCache();

    this.processConfigurationReady = this.handleConfigurationReady.bind(this);
    this._configuration.onReady(this.processConfigurationReady);
  }

  _createClass(SemrushClient, [{
    key: '_clearData',
    value: function _clearData(sendEvent) {
      sendEvent = sendEvent || false;

      if (sendEvent) {
        this._browser.registerEvent('options', 'OAuth refresh token expired');
      }

      this._token = '';
      this._projects = null;
      this._projectsLastUpdate = null;
      this._backlinksCache.clear();
      this._displayAdvertisingCache.clear();
      this._trafficAnalyticsCache.clear();
      this._notesCache.clear();
      this._configuration.set('integration.semrush_token', '');
      this._configuration.set('integration.semrush_refresh_token', '');
      this._configuration.remove('integration.semrush_projects');
      this._configuration.save();
    }
  }, {
    key: 'resultError',
    value: function resultError(error) {
      return { error: error };
    }
  }, {
    key: 'resultData',
    value: function resultData(data) {
      return { data: data };
    }
  }, {
    key: '_getProcessAnswer',
    value: function _getProcessAnswer(callback) {
      var _this = this;

      return function (text) {
        try {
          callback(_this.resultData(JSON.parse(text)));
        } catch (e) {
          callback(_this.resultError(e));
        }
      };
    }
  }, {
    key: '_getProcessNotesAnswer',
    value: function _getProcessNotesAnswer(callback, from, to) {
      var _this2 = this;

      return function (answer) {
        try {
          var result = JSON.parse(answer);
          if (result.status && result.status === 200 && result.data) {
            callback(_this2.resultData(_this2._notesCache.set(from, to, result.data)));
          } else if (result.error) {
            callback(_this2.resultError(result.error));
          } else {
            callback(_this2.resultError(result.status));
          }
        } catch (error) {
          if (error instanceof Error) {
            callback(_this2.resultError(error.message));
          } else {
            callback(_this2.resultError(error));
          }
        }
      };
    }
  }, {
    key: '_getProcessReject',
    value: function _getProcessReject(callback, repeat) {
      var _this3 = this;

      return function (reason, responseText) {
        try {
          var response = JSON.parse(responseText);
          if (!isEmpty(response, 'error') && response.error === 'access_denied') {
            return _this3.requestRefreshToken(function (result) {
              return 'data' in result ? repeat() : callback(result);
            });
          }
        } catch (ignore) {}

        callback(_this3.resultError(reason));
      };
    }
  }, {
    key: '_processTask',
    value: function _processTask(task) {
      if (task.url() === SemrushClient.URL_PROJECTS + '?access_token=' + this._token) {
        var answer = this.resultData(this.projects);
        answer.skip = true;
        task.callback(answer);
        return false;
      }

      return true;
    }
  }, {
    key: '_getProcessGetProjectsResult',
    value: function _getProcessGetProjectsResult(callback) {
      var _this4 = this;

      return function (result) {
        if ('data' in result && !('skip' in result)) {
          _this4.projects = result.data;
          _this4._projectsLastUpdate = new Date();
          _this4._configuration.set('integration.semrush_projects', _this4._projects);
          _this4._configuration.save();
          _this4._queue.clearQueue(function (task) {
            return _this4._processTask(task);
          });
        }

        if ('skip' in result) {
          delete result.skip;
        }

        callback(result);
      };
    }
  }, {
    key: '_getPageAuditReject',
    value: function _getPageAuditReject(projectId, callback, repeat) {
      var _this5 = this;

      return function (reason, responseText) {
        try {
          var response = JSON.parse(responseText);
          if (!isEmpty(response, 'error') && response.error === 'access_denied') {
            return _this5.requestRefreshToken(function (result) {
              return 'data' in result ? repeat() : callback(result);
            });
          } else if (!isEmpty(response, 'status') && response.status === 403 && !isEmpty(response, 'error') && response.error === 'Forbidden') {
            return _this5._queue.unshift(_this5._createGetProjectsListRequest(_this5._getProcessGetProjectsResult(function (result) {
              if ('data' in result && 'projects' in result.data) {
                if (result.data.projects.length > 0) {
                  if (result.data.projects.some(function (project) {
                    return project.project_id === projectId;
                  })) {
                    repeat();
                  }
                }
              }

              callback(_this5.resultError(result));
            })));
          }
        } catch (ignore) {}

        callback(_this5.resultError(reason));
      };
    }
  }, {
    key: 'requestGetToken',
    value: function requestGetToken(callback, code) {
      var _this6 = this;

      var data = new Map([['client_id', SemrushClient.CLIENT_ID], ['client_secret', SemrushClient.CLIENT_SECRET], ['grant_type', 'authorization_code'], ['code', code], ['redirect_uri', SemrushClient.REDIRECT_URL]]);

      this._queue.push({
        url: SemrushClient.TOKEN_URL,
        type: 'post',
        data: args.createArgs(data),
        resolve: function resolve(text) {
          try {
            var answer = _this6._updateTokens(text);
            callback(_this6.resultData(answer));
          } catch (e) {
            callback(_this6.resultError(e));
          }
        },

        reject: function reject(reason) {
          return callback(_this6.resultError(reason));
        }
      });
    }
  }, {
    key: 'requestRefreshToken',
    value: function requestRefreshToken(callback) {
      var _this7 = this;

      var refreshToken = this._configuration.get('integration.semrush_refresh_token');
      if (refreshToken === '' || refreshToken === null || refreshToken === undefined) {
        return callback(this.resultError('Not avaiable'));
      }

      var data = new Map([['client_id', SemrushClient.CLIENT_ID], ['client_secret', SemrushClient.CLIENT_SECRET], ['grant_type', 'refresh_token'], ['refresh_token', refreshToken]]);

      this._queue.unshift({
        url: SemrushClient.TOKEN_URL,
        type: 'post',
        data: args.createArgs(data),
        resolve: function resolve(text) {
          try {
            var answer = _this7._updateTokens(text);
            callback(_this7.resultData(answer));
          } catch (ignore) {
            _this7._clearData(true);
            callback(_this7.resultError('No token provided'));
          }
        },

        reject: function reject(reason, text) {
          try {
            var response = JSON.parse(text);
            if (!isEmpty(response, 'error')) {
              switch (response.error) {
                case 'invalid_request':
                  _this7._clearData(true);
                  break;
              }
            }
          } catch (ignore) {}

          if (_this7._token === '') {
            callback(_this7.resultError('No token provided'));
          } else {
            callback(_this7.resultError(reason));
          }
        }
      });
    }
  }, {
    key: 'requestGetUser',
    value: function requestGetUser(callback) {
      var _this8 = this;

      this._queue.push({
        url: function url() {
          return SemrushClient.URL_ACCOUNT + '?access_token=' + _this8._token;
        },
        type: 'get',
        resolve: this._getProcessAnswer(callback),
        reject: this._getProcessReject(callback, function () {
          return _this8.requestGetUser(callback);
        })
      });
    }
  }, {
    key: 'requestGetBillingData',
    value: function requestGetBillingData(callback) {
      var _this9 = this;

      this._queue.push({
        url: function url() {
          return SemrushClient.URL_BILLING + '?access_token=' + _this9._token;
        },
        type: 'get',
        resolve: this._getProcessAnswer(callback),
        reject: this._getProcessReject(callback, function () {
          return _this9.requestGetBillingData(callback);
        })
      });
    }
  }, {
    key: '_createGetProjectsListRequest',
    value: function _createGetProjectsListRequest(callback) {
      var _this10 = this;

      return {
        url: function url() {
          return SemrushClient.URL_PROJECTS + '?access_token=' + _this10._token;
        },
        type: 'get',
        callback: callback,
        resolve: this._getProcessAnswer(callback),
        reject: this._getProcessReject(callback, function () {
          return _this10.requestGetProjectsList(callback);
        })
      };
    }
  }, {
    key: 'requestGetProjectsList',
    value: function requestGetProjectsList(callback) {
      this._queue.push(this._createGetProjectsListRequest(callback));
    }
  }, {
    key: 'requestGetPageAudit',
    value: function requestGetPageAudit(callback, project, page) {
      var _this11 = this;

      this._queue.push({
        url: function url() {
          return SemrushClient.URL_AUDIT + '/' + project + '/pages?filter=' + encodeURIComponent(page) + '&access_token=' + _this11._token;
        },
        type: 'get',
        resolve: this._getProcessAnswer(callback),
        reject: this._getPageAuditReject(project, callback, function () {
          return _this11.requestGetPageAudit(callback, project, page);
        })
      });
    }
  }, {
    key: 'requestBacklinks',
    value: function requestBacklinks(callback, type, target) {
      var _this12 = this;

      var _resolve = this._getProcessAnswer(callback);

      if (this._backlinksCache.has(type, target)) {
        _resolve(this._backlinksCache.get(type, target));
        return;
      }

      this._queue.push({
        url: function url() {
          return SemrushClient.URL_BACKLINKS + '?target_type=' + encodeURIComponent(type) + '&target=' + encodeURIComponent(target) + '&access_token=' + _this12._token;
        },
        type: 'get',
        resolve: function resolve(answer) {
          _this12._backlinksCache.add(type, target, answer);
          _resolve(answer);
        },

        reject: this._getProcessReject(callback, function () {
          return _this12.requestBacklinks(callback, type, target);
        })
      });
    }
  }, {
    key: 'requestDisplayAdvertising',
    value: function requestDisplayAdvertising(callback, q) {
      var _this13 = this;

      var _resolve2 = this._getProcessAnswer(callback);

      if (this._displayAdvertisingCache.has(q)) {
        _resolve2(this._displayAdvertisingCache.get(q));
        return;
      }

      this._queue.push({
        url: function url() {
          return SemrushClient.URL_DISPLAY_ADVERTISING + '?q=' + encodeURIComponent(q) + '&access_token=' + _this13._token;
        },
        type: 'get',
        resolve: function resolve(answer) {
          _this13._displayAdvertisingCache.set(q, answer);
          _resolve2(answer);
        },

        reject: this._getProcessReject(callback, function () {
          return _this13.requestDisplayAdvertising(callback, q);
        })
      });
    }
  }, {
    key: 'requestRevoke',
    value: function requestRevoke() {
      this._queue.push({
        url: SemrushClient.URL_REVOKE + '?access_token=' + this._token,
        type: 'post',
        resolve: noop,
        reject: noop
      });
    }
  }, {
    key: 'requestLogout',
    value: function requestLogout() {
      this.requestRevoke();
      this._clearData(false);
    }
  }, {
    key: 'requestTrafficAnalytics',
    value: function requestTrafficAnalytics(callback, q, s) {
      var _this14 = this;

      var _resolve3 = this._getProcessAnswer(callback);

      if (this._trafficAnalyticsCache.has(q)) {
        _resolve3(this._trafficAnalyticsCache.get(q));
        return;
      }

      this._queue.push({
        url: function url() {
          return SemrushClient.URL_TRAFFIC_ANALYTICS + '/summary?target=' + encodeURIComponent(q) + (s ? '&target_type=' + s : '') + '&access_token=' + _this14._token;
        },
        type: 'get',
        resolve: function resolve(answer) {
          var data = JSON.stringify({ data: JSON.parse(answer), status: 200 });
          _this14._trafficAnalyticsCache.set(q, data);
          _resolve3(data);
        },

        reject: this._getProcessReject(callback, function () {
          return _this14.requestTrafficAnalytics(callback, q);
        })
      });
    }
  }, {
    key: 'requestNotes',
    value: function requestNotes(callback, from, to) {
      var _this15 = this;

      if (this._notesCache.has(from, to)) {
        callback(this.resultData(this._notesCache.get(from, to)));
        return;
      }

      var task = {
        url: function url() {
          return SemrushClient.URL_NOTES + '?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to) + '&access_token=' + _this15._token;
        },
        type: 'get',
        resolve: this._getProcessNotesAnswer(callback, from, to),
        reject: this._getProcessReject(callback, function () {
          return _this15.requestNotes(callback, from, to);
        })
      };

      this._queue.push(task);
    }
  }, {
    key: 'process',
    value: function process(request, callback) {
      if (isEmpty(request, 'action')) {
        return callback(this.resultError('No action provided'));
      }

      var _processGetProjectsResult = this._getProcessGetProjectsResult(callback);

      switch (request.action) {
        case 'getToken':
          if (isEmpty(request, 'code')) {
            return callback(this.resultError('No required field provided'));
          }

          this.requestGetToken(callback, request.code);
          break;

        case 'isConnected':
          if (this._token === '') {
            return callback(this.resultError('No token provided'));
          }

          callback(this.resultData(true));

          break;

        case 'getUser':
          if (this._token === '') {
            return callback(this.resultError('No token provided'));
          }

          this.requestGetUser(callback);

          break;

        case 'getBillingData':
          if (this._token === '') {
            return callback(this.resultError('No token provided'));
          }

          this.requestGetBillingData(callback);

          break;

        case 'getCachedProjectsList':
          if (this._token === '') {
            return callback(this.resultError('No token provided'));
          }

          if (this._projects !== null) {
            return callback(this.resultData(this._projects));
          } else {
            this.requestGetProjectsList(_processGetProjectsResult);
          }

          break;

        case 'getProjectsList':
          if (this._token === '') {
            return callback(this.resultError('No token provided'));
          }

          if (this._projectsLastUpdate !== null && this._projects !== null) {
            var now = new Date();
            if (now.getTime() - this._projectsLastUpdate.getTime() < SemrushClient.PROJECTS_UPDATE_TIMEOUT) {
              return callback(this.resultData(this._projects));
            }
          }

          this.requestGetProjectsList(_processGetProjectsResult);

          break;

        case 'getPageAudit':
          if (this._token === '') {
            return callback(this.resultError('No token provided'));
          }

          if (isEmpty(request, 'project')) {
            return callback(this.resultError('No required field provided'));
          }

          if (isEmpty(request, 'page')) {
            return callback(this.resultError('No required field provided'));
          }

          this.requestGetPageAudit(callback, request.project, request.page);

          break;

        case 'getBacklinks':
          if (this._token === '') {
            return callback(this.resultError('No token provided'));
          }

          if (isEmpty(request, 'type')) {
            return callback(this.resultError('No required field provided'));
          }

          if (isEmpty(request, 'target')) {
            return callback(this.resultError('No required field provided'));
          }

          this.requestBacklinks(callback, request.type, request.target);

          break;

        case 'getDisplayAdvertising':
          if (isEmpty(request, 'q')) {
            return callback(this.resultError('No required field provided'));
          }

          this.requestDisplayAdvertising(callback, request.q);

          break;

        case 'getTrafficAnalytics':
          if (this._token === '') {
            return callback(this.resultError('No token provided'));
          }

          if (isEmpty(request, 'q')) {
            return callback(this.resultError('No required field provided'));
          }

          this.requestTrafficAnalytics(callback, request.q, request.s);

          break;

        case 'getNotesList':
          if (this._token === '') {
            return callback(this.resultError('No token provided'));
          }

          if (isEmpty(request, 'from') || isEmpty(request, 'to')) {
            return callback(this.resultError('No required field provided'));
          }

          this.requestNotes(callback, request.from, request.to);

          break;

        case 'logout':
          this.requestLogout();
          return callback(true);

        default:
          return callback(this.resultError('Action not available'));
      }
    }
  }, {
    key: 'clearCache',
    value: function clearCache() {
      this._backlinksCache.clear();
      this._displayAdvertisingCache.clear();
      this._trafficAnalyticsCache.clear();
      this._notesCache.clear();
    }
  }, {
    key: '_updateTokens',
    value: function _updateTokens(text) {
      var _this16 = this;

      var answer = JSON.parse(text);
      this._token = answer.access_token;
      this._configuration.set('integration.semrush_token', answer.access_token);
      this._configuration.set('integration.semrush_refresh_token', answer.refresh_token);
      this._configuration.save();

      if (answer.expires_in) {
        clearTimeout(this._refreshTokenTimeoutId);
        this._refreshTokenTimeoutId = setTimeout(function () {
          _this16.requestRefreshToken(function () {
            return null;
          });
        }, answer.expires_in * 1000 / 2);
      }

      return answer;
    }
  }, {
    key: 'handleConfigurationReady',
    value: function handleConfigurationReady() {
      this._token = this._configuration.get('integration.semrush_token', '');
      if (this._configuration.has('integration.semrush_projects')) {
        try {
          this.projects = JSON.parse(this._configuration.get('integration.semrush_projects'));
        } catch (ignore) {}
      }
    }
  }, {
    key: 'projects',
    set: function set(value) {
      if (isObject(value) && value.hasOwnProperty('projects') && isArray(value.projects) && typeof value.limits === 'object') {
        this._projects = extend(true, {}, value);
      }
    },
    get: function get() {
      return this._projects;
    }
  }]);

  return SemrushClient;
}();

SemrushClient.PROJECTS_UPDATE_TIMEOUT = 300000;
SemrushClient.SERVER_URL = 'https://oauth.semrush.com';
SemrushClient.CLIENT_ID = 'seoquake';
SemrushClient.CLIENT_SECRET = 'd41d8cd98f00b204e9800998ecf8427e';
SemrushClient.REDIRECT_URL = 'https://oauth.semrush.com/oauth2/success';
SemrushClient.AUTH_URL = SemrushClient.SERVER_URL + '/oauth2/authorize?response_type=code' + '&client_id=' + SemrushClient.CLIENT_ID + '&redirect_uri=' + encodeURIComponent(SemrushClient.REDIRECT_URL);
SemrushClient.TOKEN_URL = SemrushClient.SERVER_URL + '/oauth2/access_token';

SemrushClient.API_SERVER_URL = 'https://oauth.semrush.com';
SemrushClient.URL_ACCOUNT = SemrushClient.API_SERVER_URL + '/api/v1/user';
SemrushClient.URL_BILLING = SemrushClient.API_SERVER_URL + '/api/v1/billing';
SemrushClient.URL_PROJECTS = SemrushClient.API_SERVER_URL + '/api/v1/projects';
SemrushClient.URL_AUDIT = SemrushClient.API_SERVER_URL + '/api/v1/siteaudit';
SemrushClient.URL_BACKLINKS = SemrushClient.API_SERVER_URL + '/api/v1/backlinks';
SemrushClient.URL_DISPLAY_ADVERTISING = SemrushClient.API_SERVER_URL + '/api/v1/da';
SemrushClient.URL_REVOKE = SemrushClient.API_SERVER_URL + '/api/v1/revoke';
SemrushClient.URL_TRAFFIC_ANALYTICS = SemrushClient.API_SERVER_URL + '/api/v1/ta/v2';
SemrushClient.URL_NOTES = SemrushClient.API_SERVER_URL + '/api/v1/notes';

function noop() {}

module.exports = SemrushClient;

},{"../lib/isArray":25,"../lib/isEmpty":26,"../lib/isObject":28,"../lib/parseArgs":31,"./SemrushBacklinksCache":40,"./SemrushNotesCache":42,"./SemrushRequestQueue":43,"extend":53}],42:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var extend = require('extend');
var isString = require('../lib/isString');

var SemrushNotesCache = function () {
  function SemrushNotesCache() {
    _classCallCheck(this, SemrushNotesCache);

    this._notes = new Map();
    this._minDate = null;
    this._maxDate = null;
  }

  _createClass(SemrushNotesCache, [{
    key: 'clear',
    value: function clear() {
      this._notes.clear();
      this._minDate = null;
      this._maxDate = null;
    }
  }, {
    key: 'get',
    value: function get(from, to) {
      if (!this.has(from, to)) {
        return [];
      }

      var fromDate = new Date(from);
      var toDate = new Date(to);
      var result = [];

      this._notes.forEach(function (item) {
        var itemDate = new Date(item.datetime);
        if (itemDate >= fromDate && itemDate <= toDate) {
          result.push(extend(true, {}, item));
        }
      });

      return result;
    }
  }, {
    key: 'has',
    value: function has(from, to) {
      if (this._minDate === null && this._maxDate === null) {
        return false;
      }

      var fromDate = new Date(from);
      var toDate = new Date(to);
      fromDate.setHours(0, 0, 0, 1);
      toDate.setHours(23, 59, 59, 998);

      if (fromDate.toString() === 'Invalid Date' || toDate.toString() === 'Invalid Date') {
        return false;
      }

      return this._minDate < fromDate && this._maxDate > toDate;
    }
  }, {
    key: 'set',
    value: function set(from, to, data) {
      var _this = this;

      var fromDate = new Date(from);
      var toDate = new Date(to);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
      var result = [];

      if (fromDate.toString() !== 'Invalid Date' && (this._minDate === null || fromDate < this._minDate)) {
        this._minDate = fromDate;
      }

      if (toDate.toString() !== 'Invalid Date' && (this._maxDate === null || toDate > this._maxDate)) {
        this._maxDate = toDate;
      }

      data.forEach(function (item) {
        var newItem = SemrushNotesCache.convertData(item);
        if (!_this._notes.has(newItem.id)) {
          _this._notes.set(newItem.id, newItem);
          result.push(newItem);
        } else {
          result.push(_this._notes.get(newItem.id));
        }
      });

      return result;
    }
  }], [{
    key: 'convertData',
    value: function convertData(data) {
      var result = {
        id: data.id
      };

      if (typeof data.title !== 'undefined') {
        result.title = isString(data.title) ? data.title : data.title[0].value;
      } else {
        result.title = null;
      }

      if (typeof data.note !== 'undefined') {
        result.note = isString(data.note) ? data.note : data.note[0].value;
      } else {
        result.note = null;
      }

      if (typeof data.datetime !== 'undefined') {
        result.datetime = isString(data.datetime) ? date.datetime : data.datetime[0].value;
      } else {
        result.datetime = new Date().toISOString();
      }

      if (typeof data.databases !== 'undefined') {
        result.databases = isString(data.databases) ? data.databases : data.databases[0].value;
      } else {
        result.databases = null;
      }

      if (typeof data.categories !== 'undefined') {
        result.category = isString(data.categories) ? data.categories : data.categories[0].value;
      } else {
        result.category = null;
      }

      if (typeof data.links !== 'undefined') {
        result.link = isString(data.links) ? data.links : data.links[0].value;
      } else {
        result.link = null;
      }

      return result;
    }
  }]);

  return SemrushNotesCache;
}();

module.exports = SemrushNotesCache;

},{"../lib/isString":30,"extend":53}],43:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var extend = require('extend');
var isFunction = require('../lib/isFunction');

var SemrushRequestQueue = function () {
  function SemrushRequestQueue(browser, delay) {
    _classCallCheck(this, SemrushRequestQueue);

    this._browser = browser;
    this._delay = 0;
    this.delay = delay || 1000;
    this.running = false;
    this.refusing = false;
    this.created = new Date();
    this._items = [];
  }

  _createClass(SemrushRequestQueue, [{
    key: 'push',
    value: function push() {
      this._items.push(arguments[0]);
      if (this._items.length > 0 && !this.running) {
        this.shift();
      }
    }
  }, {
    key: 'unshift',
    value: function unshift() {
      this._items.unshift(arguments[0]);
      if (this._items.length > 0 && !this.running) {
        this.shift();
      }
    }
  }, {
    key: 'shift',
    value: function shift() {
      var _this = this;

      if (this._items.length === 0) {
        this.running = false;
        return null;
      }

      if (this.running || this.refusing) {
        return null;
      }

      var task = this._items.shift();
      if (task) {
        this.running = true;
        this.doRequest(task, function () {
          _this._browser.setTimeout(function () {
            _this.running = false;
            _this.shift();
          }, _this.delay);
        });
      }

      return task;
    }
  }, {
    key: 'refuse',
    value: function refuse() {
      if (this.refusing) {
        return false;
      }

      this.refusing = true;
      try {
        this._items.forEach(function (item) {
          return item.reject('Queue refused');
        });
      } catch (ignore) {}

      this._items = [];
      this.refusing = false;
      this.running = false;
      return true;
    }
  }, {
    key: 'clearQueue',
    value: function clearQueue(filter) {
      if (this.refusing) {
        return false;
      }

      this.refusing = true;

      try {
        this._items = this._items.filter(function (item) {
          return filter(item);
        });
      } catch (ignore) {}

      this.refusing = false;
      return true;
    }
  }, {
    key: 'doRequest',
    value: function doRequest(requestObject, queueCallback) {
      requestObject = extend(true, {
        url: '',
        resolve: nop,
        reject: nop,
        type: 'get'
      }, requestObject);

      var xhr = this._browser.createXHR();
      var url = void 0;

      if (isFunction(requestObject.url)) {
        url = requestObject.url();
      } else {
        url = requestObject.url;
      }

      xhr.open(requestObject.type, url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) {
          return;
        }

        try {
          if (xhr.status && xhr.responseText !== null) {
            if (xhr.status === 401) {
              requestObject.reject('Not authorized', JSON.stringify({ error: 'access_denied' }));
            } else if (xhr.status !== 200) {
              requestObject.reject('Wrong answer from server', xhr.responseText);
            } else {
              requestObject.resolve(xhr.responseText);
            }
          } else {
            requestObject.reject('No response', '');
          }
        } catch (e) {
          if (!(e instanceof Error && e.message === 'no_port')) {
            requestObject.reject(e.message, '');
          }
        }

        queueCallback();
      };

      if (requestObject.hasOwnProperty('data')) {
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(requestObject.data);
      } else {
        xhr.send();
      }
    }
  }, {
    key: 'delay',
    set: function set(value) {
      this._delay = value;
    },
    get: function get() {
      return this._delay;
    }
  }]);

  return SemrushRequestQueue;
}();

function nop() {}

module.exports = SemrushRequestQueue;

},{"../lib/isFunction":27,"extend":53}],44:[function(require,module,exports){
'use strict';

function isPromise(result) {
  return result && 'then' in result && typeof result.then === 'function';
}

module.exports = function simpleStorage(messageDispatcher, browser) {
  messageDispatcher._browser = browser;

  messageDispatcher['sq.loadValue'] = function (data, callback, sender) {
    if ('key' in data) {
      var result = browser.getConfigValue(data.key);
      if (isPromise(result)) {
        result.then(callback);
      } else {
        callback(result);
      }
    } else {
      callback(null);
    }
  };

  messageDispatcher['sq.saveValue'] = function (data, callback, sender) {
    if ('key' in data && 'data' in data) {
      var result = browser.setConfigValue(data.key, data.data);
      if (isPromise(result)) {
        result.then(callback);
      } else {
        callback(result);
      }
    } else {
      callback(null);
    }
  };
};

},{}],45:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Counter = function () {
  function Counter(start) {
    _classCallCheck(this, Counter);

    start = start || 0;
    this.value = start;
  }

  _createClass(Counter, [{
    key: 'inc',
    value: function inc(step) {
      step = step || 1;
      this.value += step;
    }
  }, {
    key: 'get',
    value: function get() {
      return this.value;
    }
  }]);

  return Counter;
}();

module.exports = Counter;

},{}],46:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function nop() {
  return true;
}

var RequestObject = function () {
  function RequestObject(renderObject, sender, readyCallback) {
    _classCallCheck(this, RequestObject);

    this.renderObject = renderObject;
    this.readyCallback = readyCallback;
    this._beforeQueryCallback = nop;
    this.processCallback = nop;
    this.errorCallback = nop;
    this.queueId = null;
    this.state = '';
    this.sender = sender;
    this.senderId = '';
  }

  _createClass(RequestObject, [{
    key: 'beforeQueryCallback',
    get: function get() {
      return this._beforeQueryCallback;
    },
    set: function set(callback) {
      this._beforeQueryCallback = callback;
    }
  }]);

  return RequestObject;
}();

exports.RequestObject = RequestObject;

},{}],47:[function(require,module,exports){
'use strict';

var browser = require('browser/Browser');

module.exports = function (delay) {
  delay = delay || 500;
  return new RequestQueue(delay);
};

function RequestQueue(delay) {
  this.running = false;
  this.delay = delay;
  this.refusing = false;
  this.created = new Date();
  this.shift = this.shift.bind(this);
}

RequestQueue.prototype = Object.create(Array.prototype);
RequestQueue.prototype.constructor = RequestQueue;

RequestQueue.prototype.push = function () {
  Array.prototype.push.apply(this, arguments);
  if (this.length > 0 && !this.running) {
    this.shift();
  }
};

RequestQueue.prototype.shift = function () {
  var _this = this;

  if (this.length === 0) {
    this.running = false;
    return null;
  }

  if (this.running || this.refusing) {
    return null;
  }

  var task = Array.prototype.shift.apply(this, arguments);
  if (task) {
    this.running = true;
    browser.setTimeout(doRequest, this.delay, task, function () {
      _this.running = false;
      browser.setTimeout(_this.shift, 0);
    });
  }

  return task;
};

RequestQueue.prototype.refuse = function () {
  if (this.refusing) {
    return false;
  }

  this.refusing = true;
  try {
    for (var index = 0; index < this.length; index++) {
      var requestObject = this[index];
      if (requestObject.state !== 'processingError') {
        requestObject.errorCallback('Queue refused', requestObject);
        requestObject.readyCallback(requestObject.renderObject);
      }
    }
  } catch (ignore) {}

  Array.prototype.splice.call(this, 0, this.length);
  this.refusing = false;
  this.running = false;
  return true;
};

RequestQueue.prototype.clearQueue = function (filter) {
  var newElements = [];

  if (this.refusing) {
    return false;
  }

  this.refusing = true;

  try {
    for (var index = 0; index < this.length; index++) {
      var element = this[index];
      if (filter(element)) {
        newElements.push(element);
      } else {
        if (element.state !== 'processingError') {
          element.errorCallback('Queue cleared', element);
          element.readyCallback(element.renderObject);
        }
      }
    }
  } catch (ignore) {}

  Array.prototype.splice.call(this, 0, this.length);

  for (var _index = 0; _index < newElements.length; _index++) {
    this.push(newElements[_index]);
  }

  this.refusing = false;
  return true;
};

function doRequest(requestObject, queueCallback) {
  if (requestObject.beforeQueryCallback(requestObject) !== true) {
    try {
      requestObject.readyCallback(requestObject.renderObject);
    } catch (e) {
      requestObject.errorCallback(e.message, requestObject);
    }

    queueCallback();
    return;
  }

  var xhr = browser.createXHR();
  xhr.open('GET', requestObject.renderObject['url-r'], true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      try {
        if (xhr.status && xhr.responseText !== null) {
          if (xhr.status !== 200) {
            throw new Error('Wrong answer from server');
          }

          requestObject.processCallback(xhr.responseText, requestObject);
        } else {
          throw new Error('No response');
        }
      } catch (e) {
        requestObject.errorCallback(e.message, requestObject);
      }

      try {
        requestObject.readyCallback(requestObject.renderObject);
      } catch (e) {
        requestObject.errorCallback(e.message, requestObject);
      }

      queueCallback();
    }
  };

  xhr.send();
}

},{"browser/Browser":2}],48:[function(require,module,exports){
'use strict';

var isString = require('../lib/isString');
var isFunction = require('../lib/isFunction');

var EventsMixin = {
  _initHandlers: function _initHandlers() {
    if (!this.hasOwnProperty('_eventHandlers')) {
      this._eventHandlers = new Map();
    }

    if (!this.hasOwnProperty('_eventPromises')) {
      this._eventPromises = new Map();
    }
  },

  addEventListener: function addEventListener(event, callback, once) {
    if (!isString(event)) {
      throw new Error('Argument event should be string');
    }

    if (!isFunction(callback)) {
      throw new Error('Argument callback should be function');
    }

    this._initHandlers();

    if (!this._eventHandlers.has(event)) {
      this._eventHandlers.set(event, []);
    }

    if (once) {
      callback._eventCalledOnce = true;
    }

    this._eventHandlers.get(event).push(callback);

    if (this._eventPromises.has(event)) {
      this._eventPromises.get(event).forEach(function (value) {
        return callback(value);
      });
      this._eventPromises.delete(event);
    }
  },

  removeEventListener: function removeEventListener(event, callback) {
    if (!isString(event)) {
      throw new Error('Argument event should be string');
    }

    if (!isFunction(callback)) {
      throw new Error('Argument callback should be function');
    }

    this._initHandlers();

    if (!this._eventHandlers.has(event)) {
      return;
    }

    var i = this._eventHandlers.get(event).indexOf(callback);
    if (i === -1) {
      return;
    }

    this._eventHandlers.get(event).splice(i, 1);
  },

  hasEventListener: function hasEventListener(event) {
    if (!isString(event)) {
      throw new Error('Argument event should be string');
    }

    this._initHandlers();

    return this._eventHandlers.has(event) && this._eventHandlers.get(event).length > 0;
  },

  dispatchEvent: function dispatchEvent(event, data, promise) {
    if (!isString(event)) {
      throw new Error('Argument event should be string');
    }

    this._initHandlers();

    promise = promise || false;
    data = data === undefined ? null : data;
    if (!this._eventHandlers.has(event)) {
      if (promise) {
        if (!this._eventPromises.has(event)) {
          this._eventPromises.set(event, []);
        }

        this._eventPromises.get(event).push(data);
      }

      return;
    }

    this._eventHandlers.get(event).forEach(function (callback) {
      return callback(data);
    });

    if (this._eventHandlers.has(event)) {
      this._eventHandlers.set(event, this._eventHandlers.get(event).filter(function (callback) {
        return !callback.hasOwnProperty('_eventCalledOnce');
      }));
    }
  },

  clearEvents: function clearEvents() {
    this._initHandlers();
    this._eventHandlers.clear();
    this._eventPromises.clear();
  }
};

module.exports = function eventsMixin(obj) {
  for (var method in EventsMixin) {
    if (EventsMixin.hasOwnProperty(method)) {
      obj[method] = EventsMixin[method];
    }
  }
};

},{"../lib/isFunction":27,"../lib/isString":30}],49:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Module = require('common/Module');
var browser = require('browser/Browser');
var tabs = require('browser/Tab');

var SQCommon = function (_Module) {
  _inherits(SQCommon, _Module);

  function SQCommon(modulesList, config) {
    _classCallCheck(this, SQCommon);

    var _this = _possibleConstructorReturn(this, (SQCommon.__proto__ || Object.getPrototypeOf(SQCommon)).call(this, modulesList, config));

    _this.name = 'common';
    _this.cache = null;
    _this.tab = null;
    _this.tabLoadedListeners = [];
    _this.type = 'pageinfo';

    if (config && 'which' in config) {
      _this.type = config.which;
    }

    _this.id = _this.getId(true);
    return _this;
  }

  _createClass(SQCommon, [{
    key: 'run',
    value: function run() {
      var _this2 = this;

      tabs.getCurrentTabEx(browser).then(function (tab) {
        _this2.tab = tab;
        _this2.cache = tab.getUrl();

        _this2.tabLoadedListeners.forEach(function (callback) {
          return callback();
        });

        var params = 'id=' + _this2.id;
        if (_this2.type !== 'pageinfo') {
          params += '#' + _this2.type;
        }

        browser.openModuleTab('common.html', params);
      }).catch(function (reason) {
        return console.log(reason);
      });
    }
  }, {
    key: 'close',
    value: function close() {
      delete this.tab;
      browser.closeModuleTab('common.html', 'id=' + this.id);
    }
  }, {
    key: 'getData',
    value: function getData() {
      return this.cache;
    }
  }, {
    key: 'getDataEx',
    value: function getDataEx(readyCallback, args) {
      if (this.tab === null) {
        this.tabLoadedListeners.push(this.getDataEx.bind(this, readyCallback, args));
      } else {
        this.tab.sendMessage(args.command, null, function (pageData) {
          return readyCallback(pageData);
        });
      }
    }
  }]);

  return SQCommon;
}(Module);

module.exports = SQCommon;

},{"browser/Browser":2,"browser/Tab":5,"common/Module":8}],50:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Module = require('common/Module');
var lib = require('common/Lib');
var browser = require('browser/Browser');

var SQLinkinfo = function (_Module) {
  _inherits(SQLinkinfo, _Module);

  function SQLinkinfo(ModulesList, config) {
    _classCallCheck(this, SQLinkinfo);

    var _this = _possibleConstructorReturn(this, (SQLinkinfo.__proto__ || Object.getPrototypeOf(SQLinkinfo)).call(this, ModulesList, config));

    _this.name = 'linkinfo';
    _this.urlSet = '';
    _this.id = _this.getId(true);

    if (lib.isObject(config) && 'url' in config) {
      _this.urlSet = config.url + '\n';
    }
    return _this;
  }

  _createClass(SQLinkinfo, [{
    key: 'run',
    value: function run() {
      browser.openModuleTab('linkinfo.html', 'id=' + this.id);
    }
  }, {
    key: 'close',
    value: function close() {
      browser.closeModuleTab('linkinfo.html', 'id=' + this.id);
    }
  }, {
    key: 'getData',
    value: function getData() {
      return this.urlSet;
    }
  }]);

  return SQLinkinfo;
}(Module);

module.exports = SQLinkinfo;

},{"browser/Browser":2,"common/Lib":7,"common/Module":8}],51:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Module = require('common/Module');
var browser = require('browser/Browser');

var SQPanel = function (_Module) {
  _inherits(SQPanel, _Module);

  function SQPanel(modulesList, config) {
    _classCallCheck(this, SQPanel);

    var _this = _possibleConstructorReturn(this, (SQPanel.__proto__ || Object.getPrototypeOf(SQPanel)).call(this, modulesList, config));

    _this.name = 'panel';
    _this.id = _this.getId(true);
    return _this;
  }

  _createClass(SQPanel, [{
    key: 'getDataEx',
    value: function getDataEx(readyCallback, args) {
      browser.sendMessageToCurrentTab(args.command, null, function (pageData) {
        return readyCallback(pageData);
      });
    }
  }]);

  return SQPanel;
}(Module);

module.exports = SQPanel;

},{"browser/Browser":2,"common/Module":8}],52:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Module = require('common/Module');
var browser = require('browser/Browser');

var SQSERPTool = function (_Module) {
  _inherits(SQSERPTool, _Module);

  function SQSERPTool(modulesList, config) {
    _classCallCheck(this, SQSERPTool);

    var _this = _possibleConstructorReturn(this, (SQSERPTool.__proto__ || Object.getPrototypeOf(SQSERPTool)).call(this, modulesList, config));

    _this.name = 'serptool';
    _this.data = config;
    _this.id = _this.getId(true);
    return _this;
  }

  _createClass(SQSERPTool, [{
    key: 'run',
    value: function run() {
      browser.openModuleTab('serptool.html', 'id=' + this.id);
    }
  }, {
    key: 'close',
    value: function close() {
      browser.closeModuleTab('serptool.html', 'id=' + this.id);
    }
  }, {
    key: 'getData',
    value: function getData() {
      return this.data;
    }
  }]);

  return SQSERPTool;
}(Module);

module.exports = SQSERPTool;

},{"browser/Browser":2,"common/Module":8}],53:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}]},{},[1])(1)
});
