(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.window = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

function init() {
  var client = require('browser/Client');
  var updateContainerHeight = require('common/effects/updateContainerHeight');
  var CommonMain = require('modules/common/src/CommonMain');
  var plugin = new CommonMain();
  plugin.setMessenger(client);
  plugin.addEventListener('ready', updateContainerHeight);
  plugin.init();

  window.addEventListener('resize', updateContainerHeight);
}

if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init, true);
}

},{"browser/Client":2,"common/effects/updateContainerHeight":57,"modules/common/src/CommonMain":101}],2:[function(require,module,exports){
'use strict';

var lib = require('../common/Lib');
var extend = require('extend');
var analyticsClient = require('../common/analytics/clientMixin');
var DeathQueue = require('./DeathQueue');
var ClientMessages = require('./ClientMessages');

var clientMessages = new ClientMessages();
var deathQueue = new DeathQueue();
var messageListeners = new Map();

analyticsClient(exports);

exports.getDisabledState = function (plugin, callback) {
  if (lib.isFunction(plugin)) {
    callback = plugin;
    plugin = 'core';
  } else {
    plugin = plugin || 'core';
  }

  exports.getConfigurationItem(plugin + '.disabled', false, callback);
};

exports.setDisabledState = function (plugin, value, callback) {
  if (lib.isFunction(value)) {
    callback = value;
    value = plugin;
    plugin = 'core';
  } else {
    plugin = plugin || 'core';
  }

  exports.setConfigurationItem(plugin + '.disabled', value, callback);
};

exports.toggleDisabledState = function (plugin, callback) {
  if (lib.isFunction(plugin)) {
    callback = plugin;
    plugin = 'core';
  } else {
    plugin = plugin || 'core';
  }

  exports.getDisabledState(plugin, function (value) {
    value = !value;
    exports.setDisabledState(plugin, value, callback);
  });
};

exports.getConfigurationItem = function (name, defaultValue, callback) {
  if (!name) {
    callback(defaultValue);
    return;
  }

  exports.sendMessage('sq.getConfigurationItem', name, callback);
};

exports.getConfiguration = function (callback) {
  exports.sendMessage('sq.getConfiguration', null, callback);
};

exports.getParameters = function (callback) {
  exports.sendMessage('sq.getParameters', null, callback);
};

exports.setParameters = function (data, callback) {
  exports.sendMessage('sq.setParameters', data, callback);
};

exports.setConfigurationItem = function (name, value, callback) {
  exports.sendMessage('sq.setConfigurationItem', {
    name: name,
    value: value
  }, callback);
};

exports.setConfiguration = function (data, callback) {
  exports.sendMessage('sq.setConfiguration', data, callback);
};

exports.hidePanel = function () {
  window.close();
};

exports.openTab = function (url, callback) {
  chrome.tabs.create({ url: url }, callback);
};

exports.openConfigurationWindow = function (panel, callback) {
  if (lib.isString(panel)) {
    exports.sendMessage('sq.openConfigurationWindow', { panel: panel }, callback);
  } else {
    exports.sendMessage('sq.openConfigurationWindow', panel);
  }
};

exports.closeConfigurationWindow = function (callback) {
  exports.sendMessage('sq.closeConfigurationWindow', callback);
};

exports.sendMessage = function (action, data, callback) {
  clientMessages.sendMessage(action, data, callback);
};

exports.addMessageListener = function (action, callback) {
  if (action === 'detach') {
    deathQueue.add(callback);
    return;
  }

  if (callback === undefined) {
    callback = defaultCallback;
  }

  messageListeners.set(callback, function (data, sender, sendResponse) {
    if (sender.tab || !data.hasOwnProperty('action') || !('timestamp' in data) || data.action !== action) {
      return;
    }

    return callback(data.payload, sendResponse);
  });

  chrome.runtime.onMessage.addListener(messageListeners.get(callback));
};

exports.removeMessageListener = function (action, callback) {
  if (messageListeners.has(callback)) {
    try {
      chrome.runtime.onMessage.removeListener(messageListeners.get(callback));
    } catch (e) {}

    messageListeners.delete(callback);
  }
};

exports.t = require('./clientTranslate');

exports.getAssetsUrl = function (callback) {
  callback(chrome.extension.getURL(''));
};

exports.getCurrentWindowUrl = function (callback) {
  if (lib.isFunction(callback)) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      if (tabs.length > 0) {
        callback(tabs[0].url, tabs[0].status, tabs[0].id);
        return;
      }

      callback('');
    });
  } else {
    return new Promise(function (resolve, reject) {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        if (tabs.length > 0) {
          resolve({ url: tabs[0].url, status: tabs[0].status, id: tabs[0].id });
          return;
        }

        reject('Not found');
      });
    });
  }
};

exports.decode = function (value) {
  return exports.entities.decode(value);
};

exports.entities = require('../common/utils/entities')();

deathQueue.setSendMessage(exports.sendMessage);

function defaultCallback(data, sendResponse) {
  return sendResponse(data);
}

},{"../common/Lib":7,"../common/analytics/clientMixin":10,"../common/utils/entities":92,"./ClientMessages":3,"./DeathQueue":4,"./clientTranslate":5,"extend":118}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isFunction = require('../common/lib/isFunction');

var ClientMessages = function () {
  function ClientMessages() {
    _classCallCheck(this, ClientMessages);

    this._port = chrome.runtime.connect();
    this._counter = 0;
    this._port.onMessage.addListener(this.onMessageListener.bind(this));
    this._innerListeners = new Map();
    this._listeners = new Map();
  }

  _createClass(ClientMessages, [{
    key: 'sendMessage',
    value: function sendMessage(action, data, callback) {
      if (isFunction(data)) {
        callback = data;
        data = {};
      }

      var message = {
        payload: {
          action: action,
          data: data
        },
        timestamp: new Date().getTime() + '.' + this.counter
      };

      if (callback !== undefined) {
        this._innerListeners.set(message.timestamp, callback);
      }

      this.port.postMessage(message);
    }
  }, {
    key: 'getResponseFunction',
    value: function getResponseFunction(message) {
      var _this = this;

      return function (response) {
        var answer = {
          timestamp: message.timestamp,
          payload: response
        };
        _this.port.postMessage(answer);
      };
    }
  }, {
    key: 'onMessageListener',
    value: function onMessageListener(message) {
      var _this2 = this;

      if (!message || typeof message !== 'object' || !'timestamp' in message) {
        return;
      }

      if ('action' in message) {
        if (this._listeners.has(message.action)) {
          this._listeners.get(message.action).forEach(function (process) {
            return process(message.payload, _this2.getResponseFunction(message));
          });
        }

        return;
      }

      if (!this._innerListeners.has(message.timestamp)) {
        return;
      }

      this._innerListeners.get(message.timestamp)(message.payload);
      this._innerListeners.delete(message.timestamp);
    }
  }, {
    key: 'addMessageListener',
    value: function addMessageListener(action, callback) {
      if (!this._listeners.has(action)) {
        this._listeners.set(action, []);
      }

      this._listeners.get(action).push(callback);
    }
  }, {
    key: 'removeMessageListener',
    value: function removeMessageListener(action, callback) {
      if (!this._listeners.has(action)) {
        return;
      }

      var index = this._listeners.get(action).indexOf(callback);
      if (index !== -1) {
        this._listeners.get(action).splice(index, 1);
      }
    }
  }, {
    key: 'port',
    get: function get() {
      return this._port;
    }
  }, {
    key: 'counter',
    get: function get() {
      this._counter++;
      if (this._counter > 2000000) {
        this._counter = 0;
      }

      return this._counter;
    }
  }]);

  return ClientMessages;
}();

module.exports = ClientMessages;

},{"../common/lib/isFunction":68}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DeathQueue = function () {
  function DeathQueue() {
    _classCallCheck(this, DeathQueue);

    this._callbacks = new Set();
    this._running = false;
    this._sendMessage = function () {};

    this.processAlive = this._checkAlive.bind(this);
  }

  _createClass(DeathQueue, [{
    key: 'add',
    value: function add(callback) {
      if (!this._callbacks.has(callback)) {
        this._callbacks.add(callback);
      }

      if (!this._running) {
        this.run();
      }
    }
  }, {
    key: 'run',
    value: function run() {
      this._running = true;
      this._checkAlive();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this._running = false;
    }
  }, {
    key: 'setSendMessage',
    value: function setSendMessage(callback) {
      this._sendMessage = callback;
    }
  }, {
    key: '_isAlive',
    value: function _isAlive() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this._sendMessage('sq.alive', function () {
          if (arguments.length === 0 && chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }
  }, {
    key: '_checkAlive',
    value: function _checkAlive() {
      var _this2 = this;

      if (this._running) {
        this._isAlive().then(function () {
          return setTimeout(_this2.processAlive, 1000);
        }).catch(function () {
          return _this2._processCallbacks();
        });
      }
    }
  }, {
    key: '_processCallbacks',
    value: function _processCallbacks() {
      this._running = false;
      this._callbacks.forEach(function (callback) {
        return callback();
      });
      this._callbacks.clear();
    }
  }]);

  return DeathQueue;
}();

module.exports = DeathQueue;

},{}],5:[function(require,module,exports){
'use strict';

var entities = require('../common/utils/entities')();

module.exports = function (messageId, setCallback) {
  setCallback(entities.decode(chrome.i18n.getMessage(messageId)));
};

},{"../common/utils/entities":92}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ignore = require('./lib/ignore');
var lib = require('./Lib');
var dom = require('./dom/main');
var extend = require('extend');
var entities = new (require('html-entities').AllHtmlEntities)();
var ErrorDisable = require('./basePlugin/ErrorDisable');
var normalizeNumber = require('./utils/normalizeNumber');

var BasePlugin = function () {
  function BasePlugin() {
    _classCallCheck(this, BasePlugin);

    this.name = null;
    this.parameters = {};
    this.configuration = {};
    this.match = [];
    this.except = [];

    this.urls = {};
    this.requestUrls = {};
    this.googleHl = null;
    this.googleGl = null;
    this._assetsUrl = '';
    this._uuid = null;
    this._searchQuery = '';

    this._requestParamListener = null;
    this._requestParamsAllListener = null;
    this._requestParamsColListener = null;
    this._requestParamsRowListener = null;
    this._showParameterSourceListener = null;

    this._bodyReadyRepeats = 0;
    this._bodyReadyTimer = null;
    this._isBodyReady = null;
    this._elements = new Set();
    this.entities = entities;

    this.processUpdateConfiguration = this.handleUpdateConfiguration.bind(this);
    this.processDone = this.handleDone.bind(this);
    this.processError = this.handleError.bind(this);
    this.processRender = this.render.bind(this);
  }

  _createClass(BasePlugin, [{
    key: '_processIsBodyReady',
    value: function _processIsBodyReady(resolve) {
      var _this = this;

      if (!document.body || document.body === null || document.body === undefined) {
        this._bodyReadyRepeats++;
        if (this._bodyReadyRepeats < this.MAX_BODY_WATING) {
          if (this._bodyReadyTimer !== null) {
            clearTimeout(this._bodyReadyTimer);
          }

          this._bodyReadyTimer = setTimeout(function () {
            return _this._processIsBodyReady(resolve);
          }, 100);
        } else {
          throw new Error('Body not ready in given time');
        }
      } else {
        resolve();
      }
    }
  }, {
    key: 'getAssetUrl',
    value: function getAssetUrl(url) {
      return this._assetsUrl + url;
    }
  }, {
    key: 'getUUID',
    value: function getUUID() {
      if (this._uuid === null) {
        this._uuid = lib.getUUID();
      }

      return this._uuid;
    }
  }, {
    key: 'checkMatch',
    value: function checkMatch() {
      try {
        if (!document || !document.location || !document.location.href) {
          return false;
        }
      } catch (ignore) {
        return false;
      }

      var url = document.location.href;
      var cleanUrl = lib.clearUri(url);
      var match = function match(regexp) {
        return url.match(new RegExp(regexp, 'i')) || cleanUrl.match(new RegExp(regexp, 'i'));
      };

      if (this.match.length > 0 && !this.match.some(match)) {
        return false;
      }

      return !(this.except.length > 0 && this.except.some(match));
    }
  }, {
    key: 'checkState',
    value: function checkState() {
      if (typeof this.configuration === 'undefined') {
        return false;
      }

      if ('disabled' in this.configuration && this.configuration.disabled === true) {
        return false;
      }

      return this.checkMatch();
    }
  }, {
    key: 'process',
    value: function process() {
      return true;
    }
  }, {
    key: 'init',
    value: function init() {
      var _this2 = this;

      this.getAssetsUrl().then(function (url) {
        _this2._assetsUrl = url;
        return _this2.getCoreState();
      }).then(function (response) {
        if (!('disabled' in response) || !response.disabled) {
          return _this2.getConfigurationBrunch();
        } else {
          throw new ErrorDisable('Core disabled');
        }
      }).then(function (response) {
        _this2.configuration = response;
        if (_this2.checkState()) {
          return _this2.getPluginParameters();
        } else {
          throw new ErrorDisable('Plugin disabled or not for this URL');
        }
      }).then(function (response) {
        _this2.parameters = response;
        _this2.process();
      }).catch(this.processError);

      this.addMessageListener('sq.updateConfiguration', this.processUpdateConfiguration);
      this.addMessageListener('detach', this.processDone);
    }
  }, {
    key: 'parseRelAttr',
    value: function parseRelAttr(rel, skipInnerCheck) {
      if (!rel) {
        return null;
      }

      var parts = rel.split(' ');
      if (parts.length !== 2) {
        return null;
      }

      parts[1] = parts[1].split('_');

      var result = {
        urlHash: parts[0],
        requestUrlHash: parts[1][0],
        paramId: parts[1][1]
      };

      if (skipInnerCheck !== true && result.requestUrlHash !== 'x' && !this.requestUrls.hasOwnProperty(result.requestUrlHash)) {
        return null;
      }

      return result;
    }
  }, {
    key: 'processRequestUrls',
    value: function processRequestUrls(requestUrls, forceRequest) {
      var _this3 = this;

      forceRequest = forceRequest || false;
      forceRequest = this.configuration.mode === lib.SEOQUAKE_MODE_BY_REQUEST && !forceRequest;

      var results = [];

      var _loop = function _loop(requestUrlHash) {
        if (!requestUrls.hasOwnProperty(requestUrlHash)) {
          return 'continue';
        }

        var renderParams = extend(true, {
          values: {},
          requestUrlHash: requestUrlHash
        }, requestUrls[requestUrlHash]);
        var request = { render: renderParams, onlyCache: forceRequest };
        var initialValue = forceRequest ? lib.SEOQUAKE_RESULT_QUESTION : lib.SEOQUAKE_RESULT_WAIT;
        renderParams.params.forEach(function (paramId) {
          return renderParams.values[paramId] = initialValue;
        });

        _this3.render(renderParams);

        results.push(_this3.sendMessage('sq.requestParameter', request).then(_this3.processRender));
      };

      for (var requestUrlHash in requestUrls) {
        var _ret = _loop(requestUrlHash);

        if (_ret === 'continue') continue;
      }

      return Promise.all(results);
    }
  }, {
    key: 'renderErrorValue',
    value: function renderErrorValue(button, href) {
      button.href = href;
      var result = false;
      var errorsCounter = dom.data(button, 'error-clicks');
      if (!errorsCounter) {
        errorsCounter = 1;
      }

      if (errorsCounter < 3) {
        button.addEventListener('click', this.requestParamListener, true);
        errorsCounter++;
      } else {
        button.addEventListener('click', this.showParameterSourceListener, true);
        result = true;
      }

      dom.data(button, 'error-clicks', errorsCounter);

      return result;
    }
  }, {
    key: 'renderValue',
    value: function renderValue(button, text) {
      var display = normalizeNumber(text);

      if (display.number !== null && display.shortValue !== text) {
        text = display.shortValue;
        dom.attr(button, 'title', display.value);
      }

      dom.text(button, text);
    }
  }, {
    key: 'render',
    value: function render(renderParams) {
      var _this4 = this;

      if (renderParams === undefined || typeof renderParams.requestUrlHash === 'undefined' || !renderParams.requestUrlHash) {
        return false;
      }

      var hash = renderParams.requestUrlHash;

      renderParams.params.forEach(function (paramId) {
        if (!(paramId in renderParams.values)) {
          return;
        }

        var selector = 'a[rel~="' + hash + '_' + paramId + '"]';
        var href = 'url-s' in _this4.requestUrls[hash] && paramId in _this4.requestUrls[hash]['url-s'] ? _this4.requestUrls[hash]['url-s'][paramId] : _this4.requestUrls[hash]['url-r'];
        var na = 'url-na' in _this4.requestUrls[hash] && paramId in _this4.requestUrls[hash]['url-na'] ? _this4.requestUrls[hash]['url-na'][paramId] : undefined;
        var links = dom.findAll(selector);

        links.forEach(function (link) {
          var text = _this4.entities.decode(renderParams.values[paramId]);
          dom.attr(link, 'data-value', _this4.entities.decode(renderParams.values[paramId]));
          link.removeEventListener('click', _this4.requestParamListener, true);

          switch (renderParams.values[paramId]) {
            case lib.SEOQUAKE_RESULT_NODATA:
              dom.text(link, text);
              link.href = na || href;
              link.style.color = '#2b94e1';
              link.addEventListener('click', _this4.showParameterSourceListener, true);
              break;

            case lib.SEOQUAKE_RESULT_ERROR:
              dom.text(link, text);
              _this4.renderErrorValue(link, href);
              link.style.color = 'red';
              break;

            case lib.SEOQUAKE_RESULT_QUESTION:
              dom.text(link, text);
              link.href = '#';
              link.style.color = '#2b94e1';
              link.addEventListener('click', _this4.requestParamListener, true);
              break;

            case lib.SEOQUAKE_RESULT_WAIT:
              dom.text(link, text);
              link.href = '#';
              link.style.color = '#2b94e1';
              break;

            case lib.SEOQUAKE_RESULT_YES:
            default:
              _this4.renderValue(link, text);
              link.href = href;
              link.style.color = '#2b94e1';
              link.addEventListener('click', _this4.showParameterSourceListener, true);
              break;
          }
        });
      });

      this.dispatchEvent('render', renderParams);

      return true;
    }
  }, {
    key: 'parseElement',
    value: function parseElement(element) {
      var textValue = void 0;

      if (dom.hasAttr(element, 'data-value')) {
        textValue = dom.attr(element, 'data-value');
      } else {
        textValue = dom.text(element);
      }

      if ([lib.SEOQUAKE_RESULT_WAIT, lib.SEOQUAKE_RESULT_QUESTION, lib.SEOQUAKE_RESULT_ERROR].indexOf(textValue) === -1) {
        return false;
      }

      if (!dom.hasAttr(element, 'rel')) {
        return false;
      }

      var rel = this.parseRelAttr(dom.attr(element, 'rel'));
      if (!rel) {
        return false;
      }

      return rel;
    }
  }, {
    key: 'requestParameterHandler',
    value: function requestParameterHandler(link) {
      var _this5 = this;

      var rel = this.parseElement(link);
      if (!rel) {
        return Promise.reject('Link contains wrong data or not SEOquake link');
      }

      var requestUrls = {};
      requestUrls[rel.requestUrlHash] = extend(true, {}, this.requestUrls[rel.requestUrlHash]);
      requestUrls[rel.requestUrlHash].params = [rel.paramId];
      this.registerEvent(this.name, 'requestParameterHandler', rel.paramId);

      return this.processRequestUrls(requestUrls, true).then(function () {
        return _this5.dispatchEvent('parameterReady', rel);
      });
    }
  }, {
    key: 'requestParameters',
    value: function requestParameters(paramsEls) {
      var requestUrls = {};

      for (var i = 0, l = paramsEls.length; i < l; i++) {
        var rel = this.parseElement(paramsEls[i]);
        if (!rel) {
          continue;
        }

        if (!(rel.requestUrlHash in requestUrls)) {
          requestUrls[rel.requestUrlHash] = extend(true, {}, this.requestUrls[rel.requestUrlHash]);
        }
      }

      return this.processRequestUrls(requestUrls, true);
    }
  }, {
    key: 'handleUpdateConfiguration',
    value: function handleUpdateConfiguration() {
      return false;
    }
  }, {
    key: 'handleDone',
    value: function handleDone() {
      this._elements.forEach(function (element) {
        return dom.removeElement(element);
      });
      this._elements.clear();
      this.requestUrls = {};
      return true;
    }
  }, {
    key: 'handleError',
    value: function handleError(reason) {
      if (typeof reason.name === 'undefined' || reason.name !== 'ErrorDisable') {
        ignore(reason);
      }
    }
  }, {
    key: 'isBodyReady',
    get: function get() {
      if (this._isBodyReady === null) {
        this._isBodyReady = new Promise(this._processIsBodyReady.bind(this));
      }

      return this._isBodyReady;
    }
  }, {
    key: 'UUID',
    get: function get() {
      return this.getUUID();
    }
  }, {
    key: 'searchQuery',
    get: function get() {
      return this._searchQuery;
    },
    set: function set(value) {
      this._searchQuery = value;
    }
  }, {
    key: 'requestParamListener',
    get: function get() {
      var _this6 = this;

      if (this._requestParamListener === null) {
        this._requestParamListener = function (event) {
          event.preventDefault();
          event.stopPropagation();
          _this6.requestParameterHandler(event.currentTarget);
        };
      }

      return this._requestParamListener;
    }
  }, {
    key: 'requestParamsAllListener',
    get: function get() {
      var _this7 = this;

      if (this._requestParamsAllListener === null) {
        this._requestParamsAllListener = function (event) {
          event.preventDefault();
          event.stopPropagation();

          _this7.registerEvent(_this7.name, 'requestAllParameters');
          return _this7.requestParameters(document.querySelectorAll('.seoquake-params-link')).then(function () {
            return _this7.dispatchEvent('parametersAllReady');
          });
        };
      }

      return this._requestParamsAllListener;
    }
  }, {
    key: 'requestParamsColListener',
    get: function get() {
      var _this8 = this;

      if (this._requestParamsColListener === null) {
        this._requestParamsColListener = function (event) {
          event.preventDefault();
          event.stopPropagation();

          var paramId = event.currentTarget.getAttribute('rel');
          var paramsEls = document.querySelectorAll('.seoquake-params-link[rel$="_' + paramId + '"]');
          _this8.registerEvent(_this8.name, 'requestColParameters', paramId);
          _this8.requestParameters(paramsEls).then(function () {
            return _this8.dispatchEvent('parametersColReady', paramId);
          });
        };
      }

      return this._requestParamsColListener;
    }
  }, {
    key: 'requestParamsRowListener',
    get: function get() {
      var _this9 = this;

      if (this._requestParamsRowListener === null) {
        this._requestParamsRowListener = function (event) {
          event.preventDefault();
          event.stopPropagation();

          var target = event.currentTarget;
          var paramsTable = target.parentNode;
          var paramsEls = paramsTable.querySelectorAll('.seoquake-params-link');
          _this9.registerEvent(_this9.name, 'requestRowParameters');
          return _this9.requestParameters(paramsEls).then(function () {
            return _this9.dispatchEvent('parametersRowReady', target);
          });
        };
      }

      return this._requestParamsRowListener;
    }
  }, {
    key: 'showParameterSourceListener',
    get: function get() {
      var _this10 = this;

      if (this._showParameterSourceListener === null) {
        this._showParameterSourceListener = function (event) {
          var parameterId = '';

          if (event.currentTarget.hasAttribute('rel')) {
            var rel = _this10.parseRelAttr(event.currentTarget.getAttribute('rel'), true);
            if (rel) {
              parameterId = rel.paramId;
            }
          }

          if (event.currentTarget.href.toString().match(/^view-source:/i) !== null) {
            event.preventDefault();
            event.stopPropagation();
            _this10._sendMessage('sq.openTab', event.currentTarget.href.toString()).catch(ignore);
          }

          _this10.registerEvent(_this10.name, 'showParameterSource', parameterId);
        };
      }

      return this._showParameterSourceListener;
    }
  }]);

  return BasePlugin;
}();

BasePlugin.prototype.MAX_BODY_WATING = 100;

require('./basePlugin/uiMixin')(BasePlugin.prototype);
require('./utils/messengerModuleMixin')(BasePlugin.prototype);
require('./utils/eventsMixin')(BasePlugin.prototype);

module.exports = BasePlugin;

},{"./Lib":7,"./basePlugin/ErrorDisable":11,"./basePlugin/uiMixin":12,"./dom/main":38,"./lib/ignore":64,"./utils/eventsMixin":93,"./utils/messengerModuleMixin":96,"./utils/normalizeNumber":98,"extend":118,"html-entities":119}],7:[function(require,module,exports){
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

},{"./googleChecksum":58,"./hex-md5":59,"./lib/arrayFrom":60,"./lib/containsText.js":61,"./lib/endsWith.js":62,"./lib/getUUID":63,"./lib/ip2long":65,"./lib/isArray":66,"./lib/isEmpty":67,"./lib/isObject":69,"./lib/isString":70,"./lib/parseArgs":71,"./lib/parseUri":72,"./lib/shortHash":73,"./lib/startsWith.js":74,"./lib/trimHash":75}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lib = require('./Lib');
var dom = require('./dom/main');
var dates = require('./utils/Date');
var BasePlugin = require('./BasePlugin');
var ParametersCounter = require('./serpPlugin/ParametersCounter');
var messengerTranslateMixin = require('./utils/messengerTranslateMixin');

var LinksListPlugin = function (_BasePlugin) {
  _inherits(LinksListPlugin, _BasePlugin);

  function LinksListPlugin() {
    _classCallCheck(this, LinksListPlugin);

    var _this = _possibleConstructorReturn(this, (LinksListPlugin.__proto__ || Object.getPrototypeOf(LinksListPlugin)).call(this));

    _this._parametersCounter = new ParametersCounter();
    return _this;
  }

  _createClass(LinksListPlugin, [{
    key: 'handleDone',
    value: function handleDone() {
      this._parametersCounter.clear();
      return _get(LinksListPlugin.prototype.__proto__ || Object.getPrototypeOf(LinksListPlugin.prototype), 'handleDone', this).call(this);
    }
  }, {
    key: 'getElements',
    value: function getElements(params) {
      return {
        container: null,
        items: []
      };
    }
  }, {
    key: 'putElements',
    value: function putElements(elements) {
      elements.items.forEach(function (item) {
        return elements.container.appendChild(item);
      });
    }
  }, {
    key: 'sortParams',
    value: function sortParams(params, type) {
      params.sort(function (a, b) {
        if (a.value < b.value) {
          return type === lib.SEOQUAKE_SORT_DESC ? 1 : -1;
        }

        if (a.value > b.value) {
          return type === lib.SEOQUAKE_SORT_DESC ? -1 : 1;
        }

        return 0;
      });

      return params;
    }
  }, {
    key: 'modifyParams',
    value: function modifyParams(params, type) {
      params.forEach(function (param) {
        if (type === lib.SEOQUAKE_TYPE_DATE) {
          param.value = param.value === null ? 0 : dates.parseDate(param.value);
        } else if (type === lib.SEOQUAKE_TYPE_IP) {
          param.value = param.value === null ? 0 : lib.ip2long(param.value);
        } else if (type === lib.SEOQUAKE_TYPE_INT) {
          param.value = param.value === null ? -1 : parseInt(param.value.replace(/,+/g, '').replace(/\.+/g, '').replace(/\s+/g, ''));
          if (isNaN(param.value)) {
            param.value = -1;
          }
        } else if (param.value === null) {
          param.value = '0';
        }
      });

      return params;
    }
  }, {
    key: 'sort',
    value: function sort(paramId, sortType) {
      var _this2 = this;

      var params = [];
      var paramEls = Array.from(document.querySelectorAll('.seoquake-params-link[rel$="_' + paramId + '"]'));

      paramEls.forEach(function (item) {
        var rel = _this2.parseRelAttr(item.getAttribute('rel'));
        if (rel === null) {
          return;
        }

        if (paramId === 'url') {
          rel.value = item.href.replace(/^https*:\/\//i, '');
        } else if (dom.hasAttr(item, 'data-value')) {
          rel.value = dom.attr(item, 'data-value').trim();
        } else {
          rel.value = dom.text(item).trim();
        }

        params.push(rel);
      });

      var paramsType = this.determineParamsType(params);
      params = this.modifyParams(params, paramsType);
      params = this.sortParams(params, sortType);

      var els = this.getElements(params);
      this.putElements(els);

      this.registerEvent(this.name, 'resultRowsSort', paramId);
    }
  }, {
    key: 'determineParamsType',
    value: function determineParamsType(params) {
      for (var i = 0, l = params.length; i < l; i++) {
        if (dates.parseDate(params[i].value)) {
          return lib.SEOQUAKE_TYPE_DATE;
        } else if (params[i].value.match(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/)) {
          return lib.SEOQUAKE_TYPE_IP;
        } else if (params[i].value.match(/^[0-9,\.\s]+$/)) {
          return lib.SEOQUAKE_TYPE_INT;
        }
      }

      return lib.SEOQUAKE_TYPE_STRING;
    }
  }, {
    key: 'parametersCounter',
    get: function get() {
      return this._parametersCounter;
    }
  }]);

  return LinksListPlugin;
}(BasePlugin);

messengerTranslateMixin(LinksListPlugin.prototype);

module.exports = LinksListPlugin;

},{"./BasePlugin":6,"./Lib":7,"./dom/main":38,"./serpPlugin/ParametersCounter":85,"./utils/Date":87,"./utils/messengerTranslateMixin":97}],9:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lib = require('./Lib');
var RenderObject = require('./utils/RenderObject').RenderObject;

var RequestUrlError = function (_Error) {
  _inherits(RequestUrlError, _Error);

  function RequestUrlError() {
    _classCallCheck(this, RequestUrlError);

    return _possibleConstructorReturn(this, (RequestUrlError.__proto__ || Object.getPrototypeOf(RequestUrlError)).apply(this, arguments));
  }

  return RequestUrlError;
}(Error);

var RequestUrlDataError = function (_RequestUrlError) {
  _inherits(RequestUrlDataError, _RequestUrlError);

  function RequestUrlDataError() {
    _classCallCheck(this, RequestUrlDataError);

    return _possibleConstructorReturn(this, (RequestUrlDataError.__proto__ || Object.getPrototypeOf(RequestUrlDataError)).apply(this, arguments));
  }

  return RequestUrlDataError;
}(RequestUrlError);

var RequestUrl = function () {
  function RequestUrl(owner, param, inputUri) {
    _classCallCheck(this, RequestUrl);

    if (lib.isEmpty(param)) {
      throw new RequestUrlDataError('Param cant be empty');
    }

    if (!param.hasOwnProperty('url-r')) {
      throw new RequestUrlDataError('Param should have field url-r');
    }

    this.owner = owner;
    this.input = inputUri;
    this.requestUrl = lib.createRequestUrl(param['url-r'], inputUri, this.owner.searchQuery);
    this.requestUrlHash = lib.shortHash(this.requestUrl);
  }

  _createClass(RequestUrl, [{
    key: 'addURLSource',
    value: function addURLSource(param) {
      if (!('urlSources' in this)) {
        this.urlSources = new Map();
      }

      this.urlSources.set(param.id, lib.createRequestUrl(param['url-s'], this.input, this.owner.searchQuery));
    }
  }, {
    key: 'addURLNa',
    value: function addURLNa(param) {
      if (!('urlNa' in this)) {
        this.urlNa = new Map();
      }

      this.urlNa.set(param.id, param['url-na']);
    }
  }, {
    key: 'addParamId',
    value: function addParamId(param) {
      if (!('params' in this)) {
        this.params = [];
      }

      if (this.params.indexOf(param.id) === -1) {
        this.params.push(param.id);
      }
    }
  }, {
    key: 'asRenderObject',
    value: function asRenderObject(onlyCache) {
      var result = new RenderObject(this.requestUrl);

      if ('params' in this) {
        result.params = this.params.slice();
        for (var i = 0, l = this.params.length; i < l; i++) {
          var paramId = this.params[i];
          if (onlyCache) {
            result.values[paramId] = lib.SEOQUAKE_RESULT_QUESTION;
          } else {
            result.values[paramId] = lib.SEOQUAKE_RESULT_WAIT;
          }
        }
      }

      if ('urlSource' in this) {
        result['url-s'] = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.urlSources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = _slicedToArray(_step.value, 2),
                key = _step$value[0],
                value = _step$value[1];

            result['url-s'][key] = value;
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
      }

      return result;
    }
  }, {
    key: 'getSourceUrl',
    value: function getSourceUrl(paramId) {
      if ('urlSources' in this && this.urlSources.has(paramId)) {
        return this.urlSources.get(paramId);
      }

      return this.requestUrl;
    }
  }, {
    key: 'getNaUrl',
    value: function getNaUrl(paramId) {
      if ('urlNa' in this && this.urlNa.has(paramId)) {
        return this.urlNa.get(paramId);
      }

      return undefined;
    }
  }, {
    key: 'owner',
    set: function set(value) {
      if (lib.isEmpty(value)) {
        throw new RequestUrlDataError('Owner cant be empty');
      }

      this._owner = value;
    },
    get: function get() {
      return this._owner;
    }
  }, {
    key: 'input',
    set: function set(value) {
      if (lib.isEmpty(value)) {
        throw new RequestUrlDataError('Input cant be empty');
      }

      this._input = value;
    },
    get: function get() {
      return this._input;
    }
  }]);

  return RequestUrl;
}();

exports.RequestUrl = RequestUrl;
exports.RequestUrlError = RequestUrlError;
exports.RequestUrlDataError = RequestUrlDataError;

},{"./Lib":7,"./utils/RenderObject":88}],10:[function(require,module,exports){
'use strict';

var isEmpty = require('../lib/isEmpty');

module.exports = function analyticsClientMixin(client) {
  client.registerEvent = function (category, action, label) {
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

    this.sendMessage('sq.analyticsEvent', data);
  };

  client.registerPage = function (page) {
    if (isEmpty(page)) {
      return;
    }

    this.sendMessage('sq.analyticsPage', { page: page });
  };
};

},{"../lib/isEmpty":67}],11:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ErrorDisable = function (_Error) {
  _inherits(ErrorDisable, _Error);

  function ErrorDisable(message, code) {
    _classCallCheck(this, ErrorDisable);

    var _this = _possibleConstructorReturn(this, (ErrorDisable.__proto__ || Object.getPrototypeOf(ErrorDisable)).call(this, message));

    _this._code = code;
    _this.name = 'ErrorDisable';
    return _this;
  }

  return ErrorDisable;
}(Error);

module.exports = ErrorDisable;

},{}],12:[function(require,module,exports){
'use strict';

var dom = require('../dom/main');
var lib = require('../Lib');

module.exports = function uiMixin(object) {
  object.createParameterCell = function (urlHash, param, serpItemPos) {
    serpItemPos = serpItemPos || null;

    var cell = dom('div');

    if ('icon' in param) {
      cell.appendChild(dom('IMG', { src: param.icon }));
    }

    if ('matches' in param) {
      cell.appendChild(document.createTextNode(param.title + ': '));
    }

    var link = dom('A', { className: 'seoquake-params-link', href: '', rel: '', target: '_blank' });

    if ('url-r' in param) {
      var requestUrl = lib.createRequestUrl(param['url-r'], this.urls[urlHash], this.searchQuery, serpItemPos);
      var requestUrlHash = lib.shortHash(requestUrl);
      if ('matches' in param) {
        if (!(requestUrlHash in this.requestUrls)) {
          this.requestUrls[requestUrlHash] = {
            params: [],
            'url-r': requestUrl
          };
        }

        if ('url-s' in param) {
          if (!('url-s' in this.requestUrls[requestUrlHash])) {
            this.requestUrls[requestUrlHash]['url-s'] = {};
          }

          if (serpItemPos) {
            this.requestUrls[requestUrlHash]['url-s'][param.id] = lib.createRequestUrl(param['url-s'], this.urls[urlHash], this.searchQuery, serpItemPos);
          } else {
            this.requestUrls[requestUrlHash]['url-s'][param.id] = lib.createRequestUrl(param['url-s'], this.urls[urlHash], this.searchQuery, null);
          }
        }

        if ('url-na' in param) {
          if (!('url-na' in this.requestUrls[requestUrlHash])) {
            this.requestUrls[requestUrlHash]['url-na'] = {};
          }

          this.requestUrls[requestUrlHash]['url-na'][param.id] = param['url-na'];
        }

        this.requestUrls[requestUrlHash].params.push(param.id);
        link.setAttribute('href', '#');
      } else {
        link.setAttribute('href', requestUrl);
        link.addEventListener('click', this.showParameterSourceListener, true);
      }

      link.setAttribute('rel', urlHash + ' ' + requestUrlHash + '_' + param.id);
    }

    if (!('matches' in param)) {
      link.appendChild(document.createTextNode(param.title));
    }

    cell.appendChild(link);
    return dom('TD', { className: 'seoquake-params-cell', title: param.name }, cell);
  };

  object._createParamsPanel = function (urlHash, rows, serped, nodeCounter, serpItemPos) {
    if ('rows' in this.configuration && this.configuration.rows > 0) {
      rows = this.configuration.rows;
    } else {
      rows = rows || 1;
    }

    var paramsTable = dom('TABLE');
    var paramsRow = dom('TR', { className: 'seoquake-params-row' });

    var paramsCount = lib.countFields(this.parameters);
    var paramsInRow = Math.ceil(paramsCount / rows);
    var counter = 0;

    for (var paramId in this.parameters) {
      if (!this.parameters.hasOwnProperty(paramId)) {
        continue;
      }

      if (serpItemPos) {
        paramsRow.appendChild(this.createParameterCell(urlHash, this.parameters[paramId], serpItemPos));
      } else {
        paramsRow.appendChild(this.createParameterCell(urlHash, this.parameters[paramId]));
      }

      counter++;

      if (counter % paramsInRow === 0 && counter !== paramsCount) {
        paramsTable.appendChild(paramsRow);
        paramsRow = dom('TR', { className: 'seoquake-params-row' });
        counter = 0;
      }
    }

    if (paramsRow.children.length > 0) {
      paramsTable.appendChild(paramsRow);
    }

    return dom('DIV', { className: 'seoquake-params-panel', style: 'overflow-x:auto!important;' }, paramsTable);
  };

  object.createParamsPanel = function (urlHash, rows, serped, nodeCounter, serpItemPos) {
    return this._createParamsPanel(urlHash, rows, serped, nodeCounter, serpItemPos);
  };
};

},{"../Lib":7,"../dom/main":38}],13:[function(require,module,exports){
'use strict';

module.exports = ['able', 'about', 'above', 'abroad', 'according', 'accordingly', 'across', 'actually', 'after', 'afterwards', 'again', 'against', 'ago', 'ahead', 'ain’t', 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'alongside', 'already', 'also', 'although', 'always', 'am', 'amid', 'amidst', 'among', 'amongst', 'an', 'and', 'another', 'any', 'anybody', 'anyhow', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'apart', 'appear', 'appreciate', 'appropriate', 'are', 'aren’t', 'around', 'as', 'aside', 'ask', 'asking', 'associated', 'at', 'available', 'away', 'awfully', 'back', 'backward', 'backwards', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'both', 'brief', 'but', 'by', 'came', 'can', 'cannot', 'cant', 'can’t', 'caption', 'cause', 'causes', 'certain', 'certainly', 'changes', 'clearly', 'c’mon', 'come', 'comes', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', 'couldn’t', 'course', 'currently', 'dare', 'daren’t', 'definitely', 'described', 'despite', 'does', 'doesn’t', 'doing', 'done', 'don’t', 'did', 'didn’t', 'different', 'directly', 'do', 'down', 'downwards', 'during', 'each', 'eight', 'eighty', 'either', 'else', 'elsewhere', 'end', 'ending', 'enough', 'entirely', 'especially', 'etc', 'even', 'ever', 'evermore', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'ex', 'exactly', 'example', 'except', 'fairly', 'far', 'farther', 'few', 'fewer', 'fifth', 'first', 'five', 'followed', 'following', 'follows', 'for', 'found', 'four', 'from', 'forever', 'former', 'formerly', 'forth', 'forward', 'further', 'furthermore', 'get', 'gets', 'getting', 'given', 'gives', 'go', 'gotten', 'greetings', 'goes', 'going', 'gone', 'got', 'had', 'hadn’t', 'half', 'happens', 'hardly', 'has', 'hasn’t', 'have', 'haven’t', 'having', 'he', 'he’d', 'he’ll', 'hello', 'help', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'here’s', 'hereupon', 'hers', 'herself', 'he’s', 'hi', 'him', 'himself', 'his', 'hither', 'hopefully', 'how', 'however', 'hudred', 'i’d', 'if', 'ignored', 'i’ll', 'i’m', 'immediate', 'in', 'inc.', 'indeed', 'indicate', 'indicated', 'indicates', 'inner', 'inside', 'instead', 'into', 'inward', 'is', 'isn’t', 'it', 'it’d', 'it’ll', 'its', 'it’s', 'itself', 'i’ve', 'just', 'keep', 'keeps', 'kept', 'know', 'known', 'knows', 'last', 'lately', 'later', 'latter', 'latterly', 'least', 'less', 'lest', 'let', 'let’s', 'like', 'liked', 'likely', 'likewise', 'little', 'look', 'looking', 'looks', 'low', 'lower', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', 'mayn’t', 'me', 'mean', 'meantime', 'meanwhile', 'merely', 'might', 'mine', 'minus', 'miss', 'more', 'moreover', 'most', 'mostly', 'mr', 'mrs', 'much', 'must', 'mustn’t', 'my', 'myself', 'name', 'namely', 'near', 'nearly', 'necessary', 'ne', 'needn’t', 'needs', 'neither', 'never', 'neverf', 'neverless', 'nevertheless', 'new', '  next', 'nine', 'ninety', 'no', 'nobody', 'non', 'none', 'nonetheless', 'nor', 'normally', 'not', 'nothing', 'notwithstanding', 'novel', 'now', 'nowhere', 'obviously', 'of', 'off', 'often', 'oh', 'ok', 'okay', 'old', 'on', 'once', 'one', 'ones', 'one’s', 'only', 'onto', 'opposite', 'or', 'other', 'others', 'otherwise', 'ought', 'oughtn’t', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'own', 'particular', 'particularly', 'past', 'per', 'perhaps', 'placed', 'please', 'plus', 'possible', 'presumably', 'probably', 'provided', 'provides', 'que', 'quite', 'rather', 'really', 'reasonably', 'recent', 'recently', 'regarding', 'regardless', 'regards', 'relatively', 'respectively', 'right', 'round', 'said', 'same', 'saw', 'say', 'saying', 'says', 'second', 'secondly', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'shall', 'shan’t', 'she', 'she’d', 'she’ll', 'she’s', 'should', 'shouldn’t', 'since', 'six', 'so', 'some', 'somebody', 'someday', 'somehow', 'someone', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'specified', 'specify', 'specifying', 'still', 'sub', 'such', 'sure', 'take', 'taken', 'taking', 'tell', 'tends', 'than', 'thank', 'thanks', 'thanx', 'that', 'that’ll', 'thats', 'that’s', 'that’ve', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'there’d', 'therefore', 'therein', 'there’ll', 'there’re', 'theres', 'there’s', 'thereupon', 'there’ve', 'these', 'they', 'they’d', 'they’ll', 'they’re', 'they’ve', 'thing', 'things', 'think', 'third', 'thirty', 'this', 'thorough', 'thoroughly', 'those', 'though', 'three', 'through', 'throughout', 'thru', 'thus', 'till', 'to', 'together', 'too', 'took', 'toward', 'towards', 'tried', 'tries', 'truly', 'try', 'trying', 'twice', 'two', 'under', 'underneath', 'undoing', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'up', 'upon', 'upwards', 'us', 'use', 'used', 'useful', 'uses', 'using', 'usually', 'value', 'various', 'versus', 'very', 'via', 'vs', 'vs.', 'want', 'wants', 'was', 'wasn’t', 'way', 'we', 'we’d', 'welcome', 'well', 'we’ll', 'went', 'were', 'we’re', 'weren’t', 'we’ve', 'what', 'whatever', 'what’ll', 'what’s', 'what’ve', 'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'where’s', 'whereupon', 'wherever', 'whether', 'which', 'whichever', 'while', 'whilst', 'whither', 'who', 'who’d', 'whoever', 'whole', 'who’ll', 'whom', 'whomever', 'who’s', 'whose', 'why', 'will', 'willing', 'wish', 'with', 'within', 'without', 'wonder', 'won’t', 'would', 'wouldn’t', 'yes', 'yet', 'you', 'you’d', 'you’ll', 'your', 'you’re', 'yours', 'yourself', 'yourselves', 'you’ve', 'zero'];

},{}],14:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var extend = require('extend');
var lib = require('../Lib');
var StopList = require('./StopList');

function sortWords(a, b) {
  if (a.count < b.count) {
    return 1;
  }

  if (a.count > b.count) {
    return -1;
  }

  return 0;
}

var Density = function () {
  function Density(text) {
    _classCallCheck(this, Density);

    text = text || '';
    this.text = Density.clearText(text);
    this._stopList = null;

    if (lib.isEmpty(this.text)) {
      this.words = [];
    } else {
      this.words = this.text.split(' ');
    }

    this._minRepetition = 2;
  }

  _createClass(Density, [{
    key: '_getKeywords',
    value: function _getKeywords(stopWordList) {
      var result = [{ words: new Map(), count: this.words.length }, { words: new Map(), count: 0 }, { words: new Map(), count: 0 }, { words: new Map(), count: 0 }];

      var word = '';

      for (var i = this.words.length - 1; i >= 0; i--) {
        var isStopword = false;

        for (var pos = -1; pos < 3; pos++) {
          if (pos === -1) {
            word = this.words[i];
          } else if (i > pos) {
            word = [this.words[i - (pos + 1)], word].join(' ');
          } else {
            continue;
          }

          isStopword = pos === -1 && (word.length <= 2 || stopWordList.indexOf(word) > -1) || !isNaN(word) || pos > -1 && (this.words[i - (pos + 1)].length <= 2 || stopWordList.indexOf(this.words[i - (pos + 1)]) > -1) && isStopword;

          if (!isStopword) {
            var prominence = (this.words.length - i) / this.words.length * 100;
            if (result[pos + 1].words.has(word)) {
              result[pos + 1].words.get(word).count++;
              result[pos + 1].words.get(word).prominence += prominence;
            } else {
              result[pos + 1].words.set(word, {
                word: word,
                density: 0,
                count: 1,
                prominence: prominence
              });
            }
          }
        }
      }

      for (var _i = 3; _i >= 0; _i--) {

        var arr = [];

        var wordsIter = result[_i].words.values();
        word = wordsIter.next();
        while (!word.done) {
          if (word.value.count >= this._minRepetition) {
            word.value.density = word.value.count / (result[0].count / (_i + 1)) * 100;
            word.value.prominence = word.value.prominence / word.value.count;
            arr.push(word.value);
          }

          word = wordsIter.next();
        }

        arr.sort(sortWords);

        result[_i].words = arr;
        if (_i !== 0) {
          result[_i].count = arr.length;
        }
      }

      return result;
    }
  }, {
    key: 'getKeywords',
    value: function getKeywords() {
      var _this = this;

      return this._stopList.stopList.then(function (list) {
        return _this._getKeywords(list);
      });
    }
  }, {
    key: 'stopList',
    set: function set(value) {
      this._stopList = value;
    },
    get: function get() {
      return this._stopList;
    }
  }], [{
    key: 'replace',
    value: function replace(match) {
      return Density.clearMap[match];
    }
  }, {
    key: 'clearText',
    value: function clearText(text) {
      text = lib.stripTags(text).replace(/\.(\s|$)/g, Density.replace);
      return lib.cleanString(text);
    }
  }]);

  return Density;
}();

Density.clearMap = {
  '\.\s': ' ',
  '\.$': ' ',
  '.': ' ',
  '&nbsp;': ' ',
  '&gt;': '>',
  '&lt;': '<'
};

module.exports = Density;

},{"../Lib":7,"./StopList":15,"extend":118}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var extend = require('extend');
var lib = require('../Lib');
var defaultStopList = require('../defaults/englishStopList');

var StopList = function () {
  function StopList(client) {
    _classCallCheck(this, StopList);

    this._defaultList = defaultStopList.slice();
    this._useDefault = true;
    this._excludeList = [];
    this._includeList = [];
    this._loadResult = null;
    this._resultList = null;

    this.processDataLoad = this.handleDataLoad.bind(this);

    if (client) {
      this.setMessenger(client);
    }
  }

  _createClass(StopList, [{
    key: 'load',
    value: function load() {
      if (this._loadResult === null) {
        this._loadResult = new Promise(this.processDataLoad);
      }

      return this._loadResult;
    }
  }, {
    key: 'loadData',
    value: function loadData() {
      return this.sendMessage('sq.loadValue', { key: 'stopList' });
    }
  }, {
    key: 'saveData',
    value: function saveData() {
      var data = {
        include: this._includeList,
        exclude: this._excludeList,
        useDefault: this._useDefault
      };

      this.sendMessage('sq.saveValue', { key: 'stopList', data: data });
    }
  }, {
    key: 'handleDataLoad',
    value: function handleDataLoad(resolve) {
      var _this = this;

      this.loadData().then(function (values) {
        if (lib.isObject(values)) {
          if ('include' in values) {
            _this._includeList = values.include;
          }

          if ('exclude' in values) {
            _this._excludeList = values.exclude;
          }

          if ('useDefault' in values) {
            _this._useDefault = values.useDefault;
          }

          resolve(_this.resultList);
        } else {
          resolve(_this._defaultList);
        }
      }).catch(function () {
        resolve(_this._defaultList);
      });
    }
  }, {
    key: 'stopList',
    get: function get() {
      return this.load();
    }
  }, {
    key: 'defaultList',
    get: function get() {
      return this._defaultList;
    }
  }, {
    key: 'useDefault',
    get: function get() {
      return this._useDefault;
    },
    set: function set(value) {
      this._useDefault = value;
    }
  }, {
    key: 'includeList',
    get: function get() {
      return this._includeList;
    }
  }, {
    key: 'includeText',
    get: function get() {
      return this._includeList.join('\n');
    },
    set: function set(value) {
      if (value === '') {
        this._includeList = [];
      } else {
        var lines = [];
        value.split(/[\n;,.]+/i).forEach(function (line) {
          return lines.push(line.trim());
        });
        if (lines.length > 0) {
          lines = lines.filter(function (line) {
            return !lib.isEmpty(line);
          });
        }

        this._includeList = lines;
      }
    }
  }, {
    key: 'excludeList',
    get: function get() {
      return this._excludeList;
    }
  }, {
    key: 'excludeText',
    get: function get() {
      return this._excludeList.join('\n');
    },
    set: function set(value) {
      if (value === '') {
        this._excludeList = [];
      } else {
        var lines = [];
        value.split(/[\n;,.]+/i).forEach(function (line) {
          return lines.push(line.trim());
        });
        if (lines.length > 0) {
          lines = lines.filter(function (line) {
            return !lib.isEmpty(line);
          });
        }

        this._excludeList = lines;
      }
    }
  }, {
    key: 'resultList',
    get: function get() {
      var _this2 = this;

      if (this._resultList === null) {
        this._resultList = [];
        if (this._useDefault) {
          this._resultList = this._resultList.concat(this._defaultList);
        }

        this._resultList = this._resultList.concat(this._includeList).filter(function (word) {
          return _this2._excludeList.indexOf(word) === -1;
        });
      }

      return this._resultList;
    }
  }]);

  return StopList;
}();

require('../utils/messengerMixin')(StopList.prototype);

module.exports = StopList;

},{"../Lib":7,"../defaults/englishStopList":13,"../utils/messengerMixin":95,"extend":118}],16:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var detectAmpPage = require('../page/diagnosis/detectAmpPage');

var AMPDocumentProcessor = function () {
  function AMPDocumentProcessor(text) {
    _classCallCheck(this, AMPDocumentProcessor);

    this._content = text;
    this._parser = new DOMParser();
    this._document = this._parser.parseFromString(this._content, 'text/html');
    this._isError = null;
    this._canonical = null;
    this._isAMP = null;
  }

  _createClass(AMPDocumentProcessor, [{
    key: 'isError',
    get: function get() {
      if (this._isError === null) {
        this._isError = this._document === null;

        if (!this._isError) {
          if (!this._document.firstChild) {
            this._isError = true;
          } else if (this._document.firstChild.nodeName === 'parsererror') {
            this._isError = true;
          }
        }
      }

      return this._isError;
    }
  }, {
    key: 'canonical',
    get: function get() {
      if (this._canonical === null) {
        if (this.isError) {
          this._canonical = '';
        } else {
          var link = this._document.querySelector('head > link[rel="canonical"]');
          if (link) {
            this._canonical = link.href.toString();
          } else {
            this._canonical = '';
          }
        }
      }

      return this._canonical;
    }
  }, {
    key: 'isAMP',
    get: function get() {
      if (this._isAMP === null) {
        if (this.isError) {
          this._isAMP = false;
        } else {
          this._isAMP = detectAmpPage(this._document);
        }
      }

      return this._isAMP;
    }
  }]);

  return AMPDocumentProcessor;
}();

module.exports = AMPDocumentProcessor;

},{"../page/diagnosis/detectAmpPage":80}],17:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var STATE = require('./DiagnosisStates');

var DiagnosisResult = require('./DiagnosisResult');
var DiagnosisGroup = require('./DiagnosisGroup');
var DiagnosisRuleSitemapXml = require('./rules/DiagnosisRuleSitemapXml');
var DiagnosisRuleCanonical = require('./rules/DiagnosisRuleCanonical');
var XHR = require('../utils/XHRProxyEx');
var AMPDocumentProcessor = require('./AMPDocumentProcessor');
var messengerMixin = require('../utils/messengerMixin');
var messengerTranslateMixin = require('../utils/messengerTranslateMixin');
var ignore = require('../lib/ignore');

var Diagnosis = function () {
  function Diagnosis(page) {
    _classCallCheck(this, Diagnosis);

    this._data = page || null;
    this.parametersWaiting = 0;
    this.result = {
      page: new DiagnosisGroup(this, ['description', 'flash', 'frames', 'headings', 'images', 'keywords', 'textToHtmlRatio', 'title', 'url', 'microformats', 'schemaorg', 'opengraph', 'twittercard', 'canonical']),
      compliance: new DiagnosisGroup(this, ['doctype', 'encoding', 'favicon', 'googleAnalitycs', 'language', 'robotsTxt', 'xmlSitemaps']),
      mobile: new DiagnosisGroup(this, ['ampVersion', 'viewport'])
    };
    this._robotsTxtContent = '';
    this._sitemapXmlUrl = '';
    this._handlers = {};
    this._events = {};

    this.AJAX_TIMEOUT = 30000;
  }

  _createClass(Diagnosis, [{
    key: '_newEventItem',
    value: function _newEventItem(name, callback, once) {
      once = once || false;
      return { name: name, callback: callback, once: once };
    }
  }, {
    key: '_addHandler',
    value: function _addHandler(event, callback, once) {
      this._handlers[event] = this._handlers[event] || [];
      this._handlers[event].push(this._newEventItem(event, callback, once));
    }
  }, {
    key: 'addEventListener',
    value: function addEventListener(event, callback, once) {
      var _this = this;

      once = once || false;
      if (event === 'ready' || event === 'parameterReady') {
        this._addHandler(event, callback, once);
        if (event in this._events) {
          this._events[event].forEach(function (data) {
            return _this._dispatchEvent(event, data);
          });
          delete this._events[event];
        }
      } else {
        var _event$split = event.split('.'),
            _event$split2 = _slicedToArray(_event$split, 2),
            group = _event$split2[0],
            rule = _event$split2[1];

        if (!(group in this.result) || !(rule in this.result[group])) {
          throw new Error('No such rule: ' + event);
        }

        this._addHandler(event, callback, once);
        if (this.result[group][rule].status !== STATE.STATE_PROCESSING) {
          callback(this.result[group][rule]);
        }
      }
    }
  }, {
    key: '_dispatchEvent',
    value: function _dispatchEvent(event, result) {
      if (event in this._handlers && this._handlers[event].length > 0) {
        this._handlers[event].forEach(function (handler) {
          return handler.callback(result);
        });
        this._handlers[event] = this._handlers[event].filter(function (item) {
          return !('once' in item && item.once);
        });
      } else {
        this._events[event] = this._events[event] || [];
        this._events[event].push({ data: result });
      }
    }
  }, {
    key: '_parameterReady',
    value: function _parameterReady(group, parameter, result) {
      var eventName = group + '.' + parameter;

      this.result[group][parameter] = result;
      this._dispatchEvent(eventName, result);
      this.parametersWaiting--;
      this._dispatchEvent('parameterReady', {
        parameter: eventName,
        data: this.result
      });
      if (this.parametersWaiting <= 0) {
        this._dispatchEvent('ready', this.result);
      }
    }
  }, {
    key: '_sendRequest',
    value: function _sendRequest(url, callback, timeout, timeoutCallback, type) {
      type = type || 'get';

      var xhr = this.createXHR();
      xhr.setCallback(callback);
      if (timeout !== undefined) {
        xhr.setTimeoutCallback(timeoutCallback);
        xhr.setTimeout(timeout);
      }

      xhr.send(url, type);
    }
  }, {
    key: '_sendRequestEx',
    value: function _sendRequestEx(url, timeout, type) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2._sendRequest(url, resolve, timeout, reject, type);
      });
    }
  }, {
    key: 'sendRequestEx',
    value: function sendRequestEx(url, timeout, type) {
      return this._sendRequestEx(url, timeout, type);
    }
  }, {
    key: 'createXHR',
    value: function createXHR() {
      var xhr = new XHR();
      xhr.setMessenger(this.getMessenger());
      return xhr;
    }
  }, {
    key: 'processData',
    value: function processData() {
      this.parametersWaiting = this.result.page.length + this.result.compliance.length;

      if (this._data === null) {
        this.result.page.setStatus(STATE.STATE_BAD, 'sqDiagnosis_data_unavailable');
        this.result.compliance.setStatus(STATE.STATE_BAD, 'sqDiagnosis_data_unavailable');
        this._dispatchEvent('ready', this.result);
        return;
      }

      this.processURL();
      this.processCanonical();
      this.processTitle();
      this.processMetaDescription();
      this.processMetaKeywords();
      this.processHeadings();
      this.processImages();
      this.processTextToHTMLRatio();
      this.processFrames();
      this.processFlash();
      this.processMicroformats();
      this.processSchemaorg();
      this.processOpengraph();
      this.processTwitterCard();

      this.processRobotsTxt();
      this.processXMLSitemaps();
      this.processMetaLanguageTag();
      this.processDocType();
      this.processEncoding();
      this.processGoogleAnalytics();
      this.processFavicon();

      this.processAmpVersion();
      this.processViewport();
    }
  }, {
    key: '_processDescription',
    value: function _processDescription(result) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        if (!(result instanceof DiagnosisResult)) {
          throw new Error('Argument should be DiagnosisResult instance');
        }

        _this3.t(result.description).then(function (message) {
          var regexp = new RegExp('{(' + Object.keys(result).join('|') + ')}', 'igm');
          result.description = message.replace(regexp, function (match, group1) {
            return result[group1];
          });
          resolve(result);
        }).catch(reject);
      });
    }
  }, {
    key: '_pageParameterReady',
    value: function _pageParameterReady(parameter, result) {
      var _this4 = this;

      return this._processDescription(result).then(function (localized) {
        return _this4._parameterReady('page', parameter, localized);
      });
    }
  }, {
    key: 'pageParameterReady',
    value: function pageParameterReady(parameter, result) {
      return this._pageParameterReady(parameter, result);
    }
  }, {
    key: '_complianceParameterReady',
    value: function _complianceParameterReady(parameter, result) {
      var _this5 = this;

      return this._processDescription(result).then(function (localized) {
        return _this5._parameterReady('compliance', parameter, localized);
      });
    }
  }, {
    key: 'complianceParameterReady',
    value: function complianceParameterReady(parameter, result) {
      return this._complianceParameterReady(parameter, result);
    }
  }, {
    key: '_mobileParameterReady',
    value: function _mobileParameterReady(parameter, result) {
      var _this6 = this;

      return this._processDescription(result).then(function (localized) {
        return _this6._parameterReady('mobile', parameter, localized);
      });
    }
  }, {
    key: 'processURL',
    value: function processURL() {
      var result = new DiagnosisResult({ len: 0, url: '', value: '',
        status: STATE.STATE_BAD,
        description: 'sqDiagnosis_internal_error'
      });

      if ('location' in this._data) {
        result.url = result.value = this._data.location.replace(/^(http(s)?:\/\/|file:\/\/\/)/gi, '');
        result.len = result.value.length;

        if (result.len > 200) {
          result.status = STATE.STATE_BAD;
          result.description = 'sqDiagnosis_url_bad';
        } else {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_url_good';
        }
      }

      this._pageParameterReady('url', result);
    }
  }, {
    key: 'processCanonical',
    value: function processCanonical() {
      var processor = new DiagnosisRuleCanonical(this);
      processor.run();
    }
  }, {
    key: 'processTitle',
    value: function processTitle() {
      var result = new DiagnosisResult({ len: 0, value: '',
        status: STATE.STATE_BAD,
        description: 'sqDiagnosis_internal_error'
      });

      if ('title' in this._data) {
        result.len = this._data.title.length;
        result.value = this._data.title;

        if (result.len < 10) {
          if (result.len < 5) {
            result.status = STATE.STATE_BAD;
            result.description = 'sqDiagnosis_title_bad_not_long';
          } else {
            result.status = STATE.STATE_AVERAGE;
            result.description = 'sqDiagnosis_title_average';
          }
        } else if (result.len > 70) {
          if (result.len < 101) {
            result.status = STATE.STATE_AVERAGE;
            result.description = 'sqDiagnosis_title_average';
          } else {
            result.status = STATE.STATE_BAD;
            result.description = 'sqDiagnosis_title_bad_not_short';
          }
        } else {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_title_good';
        }
      }

      this._pageParameterReady('title', result);
    }
  }, {
    key: 'processMetaDescription',
    value: function processMetaDescription() {
      var result = new DiagnosisResult({ len: 0, value: '',
        status: STATE.STATE_BAD,
        description: 'sqDiagnosis_internal_error'
      });

      if ('description' in this._data) {
        result.len = this._data.description.length;
        result.value = this._data.description;

        if (result.len < 160) {
          if (result.len < 20) {
            result.status = STATE.STATE_BAD;
            result.description = 'sqDiagnosis_meta_bad_not_long';
          } else {
            result.status = STATE.STATE_AVERAGE;
            result.description = 'sqDiagnosis_meta_average';
          }
        } else if (result.len > 300) {
          if (result.len < 320) {
            result.status = STATE.STATE_AVERAGE;
            result.description = 'sqDiagnosis_meta_average';
          } else {
            result.status = STATE.STATE_BAD;
            result.description = 'sqDiagnosis_meta_bad_not_short';
          }
        } else {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_meta_good';
        }
      }

      this._pageParameterReady('description', result);
    }
  }, {
    key: 'processMetaKeywords',
    value: function processMetaKeywords() {
      var result = new DiagnosisResult({ len: 0, value: '', cLen: 0,
        status: STATE.STATE_BAD,
        description: 'sqDiagnosis_internal_error'
      });

      if ('keywords' in this._data) {
        result.len = this._data.keywords.length;
        result.value = this._data.keywords;
        result.cLen = 0;

        if (!result.len) {
          result.status = STATE.STATE_BAD;
          result.description = 'sqDiagnosis_kwds_bad';
        } else {
          var badLen = result.len < 50 || result.len > 150;
          result.cLen = this._data.keywords.split(',').length;
          if (result.cLen < 5) {
            if (result.cLen < 3) {
              if (badLen) {
                result.status = STATE.STATE_BAD;
                result.description = 'sqDiagnosis_kwds_bad_more';
              } else {
                result.status = STATE.STATE_AVERAGE;
                result.description = 'sqDiagnosis_kwds_average_not_enough';
              }
            } else {
              result.status = STATE.STATE_AVERAGE;
              result.description = 'sqDiagnosis_kwds_average_too_short';
            }
          } else if (result.cLen > 10) {
            if (result.cLen > 15) {
              if (badLen) {
                result.status = STATE.STATE_BAD;
                result.description = 'sqDiagnosis_kwds_bad_too_many';
              } else {
                result.status = STATE.STATE_AVERAGE;
                result.description = 'sqDiagnosis_kwds_average_too_many';
              }
            } else {
              result.status = STATE.STATE_AVERAGE;
              result.description = 'sqDiagnosis_kwds_average_too_many';
            }
          } else {
            if (badLen) {
              result.status = STATE.STATE_AVERAGE;
              result.description = 'sqDiagnosis_kwds_average_too_long';
            } else {
              result.status = STATE.STATE_GOOD;
              result.description = 'sqDiagnosis_kwds_good';
            }
          }
        }
      }

      this._pageParameterReady('keywords', result);
    }
  }, {
    key: 'processHeadings',
    value: function processHeadings() {
      var result = new DiagnosisResult({ value: '', status: STATE.STATE_BAD, description: 'sqDiagnosis_internal_error' });

      if ('headings' in this._data) {
        result.value = this._data.headings;

        var h1s = this._data.headings.H1.count;
        var h2s = this._data.headings.H2.count;
        var h3s = this._data.headings.H3.count;
        var h4s = this._data.headings.H4.count;
        var h5s = this._data.headings.H5.count;
        var h6s = this._data.headings.H6.count;

        if (h1s && h2s && h3s) {
          if (h1s === 1) {
            result.status = STATE.STATE_GOOD;
            result.description = 'sqDiagnosis_headings_good';
          } else {
            result.status = STATE.STATE_AVERAGE;
            result.description = 'sqDiagnosis_headings_average';
          }
        } else if (h4s || h5s || h6s) {
          result.status = STATE.STATE_AVERAGE;
          result.description = 'sqDiagnosis_headings_average_one';
        } else {
          result.status = STATE.STATE_BAD;
          result.description = 'sqDiagnosis_headings_bad';
        }
      }

      this._pageParameterReady('headings', result);
    }
  }, {
    key: 'processImages',
    value: function processImages() {
      var result = new DiagnosisResult({ len: 0, alt: 0, withoutAlt: 0,
        status: STATE.STATE_BAD,
        description: 'sqDiagnosis_internal_error'
      });

      if ('images_count' in this._data && 'imgalts_count' in this._data) {
        result.status = STATE.STATE_GOOD;
        result.description = 'sqDiagnosis_images_good';
        result.len = this._data.images_count;
        result.alt = this._data.imgalts_count;
        result.withoutAlt = this._data.images_count - this._data.imgalts_count;

        if (result.len) {
          var dd = Math.round(result.alt / result.len * 100);
          if (dd < 70) {
            if (dd > 39) {
              result.status = STATE.STATE_AVERAGE;
              result.description = 'sqDiagnosis_images_average';
            } else {
              result.status = STATE.STATE_BAD;
              result.description = 'sqDiagnosis_images_bad';
            }
          }
        }
      }

      this._pageParameterReady('images', result);
    }
  }, {
    key: 'processTextToHTMLRatio',
    value: function processTextToHTMLRatio() {
      var result = new DiagnosisResult({ ratio: 0, status: STATE.STATE_BAD,
        description: 'sqDiagnosis_internal_error',
        description2: ''
      });

      if ('text_length' in this._data && 'page_length' in this._data) {
        result.status = STATE.STATE_GOOD;
        result.description = 'sqDiagnosis_ratio_good';
        result.ratio = Math.round(this._data.text_length / this._data.page_length * 100 * 100) / 100;

        if (result.ratio < 50) {
          if (result.ratio > 15) {
            result.status = STATE.STATE_AVERAGE;
            result.description = 'sqDiagnosis_ratio_average_one';
          } else {
            result.status = STATE.STATE_BAD;
            result.description = 'sqDiagnosis_ratio_bad_one';
          }
        }
      }

      this._pageParameterReady('textToHtmlRatio', result);
    }
  }, {
    key: 'processFrames',
    value: function processFrames() {
      var result = new DiagnosisResult({ iframes: 0, frames: 0, status: STATE.STATE_BAD, description: 'sqDiagnosis_internal_error' });

      if ('iframes_count' in this._data && 'frames_count' in this._data) {
        result.status = STATE.STATE_GOOD;
        result.description = 'sqDiagnosis_frames_good';
        result.iframes = this._data.iframes_count;
        result.frames = this._data.frames_count;

        if (this._data.frames_count) {
          result.status = STATE.STATE_AVERAGE;
          result.description = 'sqDiagnosis_frames_average';
          if (this._data.frames_count > 1 || this._data.iframes_count > 1) {
            result.status = STATE.STATE_BAD;
            result.description = 'sqDiagnosis_frames_bad';
          }
        } else {
          if (this._data.iframes_count > 0) {
            result.status = STATE.STATE_AVERAGE;
            result.description = 'sqDiagnosis_frames_exists';
          }
        }
      }

      this._pageParameterReady('frames', result);
    }
  }, {
    key: 'processFlash',
    value: function processFlash() {
      var result = new DiagnosisResult({ status: STATE.STATE_BAD, description: 'sqDiagnosis_internal_error' });

      if ('flash' in this._data && 'text_length' in this._data) {
        if (this._data.flash) {
          if (this._data.text_length > 50) {
            result.status = STATE.STATE_AVERAGE;
            result.description = 'sqDiagnosis_flash_average';
          } else {
            result.status = STATE.STATE_BAD;
            result.description = 'sqDiagnosis_flash_bad';
          }
        } else {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_flash_good';
        }
      }

      this._pageParameterReady('flash', result);
    }
  }, {
    key: 'processRobotsTxt',
    value: function processRobotsTxt() {
      var _this7 = this;

      var result = new DiagnosisResult({ url: '', value: '',
        status: STATE.STATE_BAD,
        description: 'sqDiagnosis_internal_error'
      });

      if (!('urlDetails' in this._data)) {
        this._complianceParameterReady('robotsTxt', result);
        return;
      }

      if (this._data.urlDetails.scheme === 'file') {
        result.status = STATE.STATE_AVERAGE;
        result.description = 'sqDiagnosis_unable2detect';
        this._complianceParameterReady('robotsTxt', result);
        return;
      }

      var robotsUrl = this._data.urlDetails.scheme + '://' + this._data.urlDetails.domain;
      if (this._data.urlDetails.port !== '') {
        robotsUrl += ':' + this._data.urlDetails.port;
      }

      robotsUrl += '/robots.txt';

      var answerCallback = function answerCallback(answer) {
        var result = new DiagnosisResult({ status: STATE.STATE_BAD, description: 'sqDiagnosis_robots_bad' });
        result.url = result.value = robotsUrl;
        if (answer.status === 200 && answer.responseText.match(/Allow|Disallow|Sitemap|User-agent/i)) {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_robots_good';
          _this7._robotsTxtContent = answer.responseText;
        }

        _this7._complianceParameterReady('robotsTxt', result);
      };

      var timeoutCallback = function timeoutCallback() {
        var result = new DiagnosisResult({ status: STATE.STATE_TIMEOUT, description: 'sqDiagnosis_unable2detect' });
        result.url = result.value = '';
        _this7._complianceParameterReady('robotsTxt', result);
      };

      this._sendRequest(robotsUrl, answerCallback, this.AJAX_TIMEOUT, timeoutCallback);
    }
  }, {
    key: 'processXMLSitemaps',
    value: function processXMLSitemaps() {
      var processor = new DiagnosisRuleSitemapXml(this);
      processor.run();
    }
  }, {
    key: 'processMetaLanguageTag',
    value: function processMetaLanguageTag() {
      var result = new DiagnosisResult({
        status: STATE.STATE_BAD,
        description: 'sqDiagnosis_lang_bad',
        langMess: ''
      });

      if (this._data.lang) {
        result.langMess = this._data.lang;
        result.status = STATE.STATE_GOOD;
        result.description = 'sqDiagnosis_lang_good';
      }

      if (this._data.meta_language_tag) {
        if (!this._data.lang) {
          result.langMess = this._data.meta_language_tag;
        }

        result.status = STATE.STATE_AVERAGE;
        result.description = 'sqDiagnosis_lang_average';
      }

      result.value = result.langMess;

      return this._complianceParameterReady('language', result);
    }
  }, {
    key: 'processDocType',
    value: function processDocType() {
      var result = new DiagnosisResult({ value: '', status: STATE.STATE_BAD, description: 'sqDiagnosis_internal_error' });

      if ('doctype' in this._data) {
        result.value = this._data.doctype;

        if (this._data.doctype === 'Undetected') {
          result.status = STATE.STATE_BAD;
          result.description = 'sqDiagnosis_doctype_bad';
        } else {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_doctype_good';
        }
      }

      return this._complianceParameterReady('doctype', result);
    }
  }, {
    key: 'processEncoding',
    value: function processEncoding() {
      var result = new DiagnosisResult({ value: '', status: STATE.STATE_BAD, description: 'sqDiagnosis_internal_error' });

      if ('charset' in this._data) {
        result.value = this._data.charset;

        if (this._data.charset === 'Not specified') {
          result.status = STATE.STATE_BAD;
          result.description = 'sqDiagnosis_charset_bad_one';
        } else {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_charset_good_one';
        }
      }

      return this._complianceParameterReady('encoding', result);
    }
  }, {
    key: 'processGoogleAnalytics',
    value: function processGoogleAnalytics() {
      if (this._data.isHTMLAMP) {
        var result = new DiagnosisResult({
          status: STATE.STATE_BAD,
          description: 'sqDiagnosis_ganal_amp_bad_one'
        });

        if (this._data.ganalytics_amp) {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_ganal_amp_good_one';
        }

        return this._complianceParameterReady('googleAnalitycs', result);
      } else {
        var _result = new DiagnosisResult({
          status: STATE.STATE_BAD,
          description: 'sqDiagnosis_ganal_bad_one'
        });

        if (this._data.ganalytics) {
          _result.status = STATE.STATE_GOOD;
          _result.description = 'sqDiagnosis_ganal_good_one';
        }

        return this._complianceParameterReady('googleAnalitycs', _result);
      }
    }
  }, {
    key: 'processMicroformats',
    value: function processMicroformats() {
      var result = new DiagnosisResult({
        status: STATE.STATE_AVERAGE,
        description: 'sqDiagnosis_microformats_average',
        codes: '',
        value: '',
        domain: encodeURIComponent(this._data.location)
      });

      if (this._data.microformats && this._data.microformats.length > 0) {
        var type = this._data.microformats.shift();

        if (type === 'microformatsWrong') {
          result.status = STATE.STATE_BAD;
          result.description = 'sqDiagnosis_microformats_bad';
        } else {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_microformats_good';
        }

        result.type = type;
        var value = new Map();
        this._data.microformats.forEach(function (code) {
          return value.has(code) ? value.set(code, value.get(code) + 1) : value.set(code, 1);
        });
        result.codes = [];
        value.forEach(function (count, code) {
          return result.codes.push(code + (count > 1 ? ' (' + count + ')' : ''));
        });
        result.value = result.codes.join(', ');
      }

      return this._pageParameterReady('microformats', result);
    }
  }, {
    key: 'processSchemaorg',
    value: function processSchemaorg() {
      var result = new DiagnosisResult({
        status: STATE.STATE_BAD,
        description: 'sqDiagnosis_schemaorg_bad',
        types: '',
        domain: encodeURIComponent(this._data.location)
      });

      if (this._data.schemaorg && this._data.schemaorg.length > 0) {
        result.types = this._data.schemaorg.join(', ');
        if (this._data.schemaorg[0] === '') {
          result.status = STATE.STATE_AVERAGE;
          result.description = 'sqDiagnosis_schemaorg_average';
        } else {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_schemaorg_good';
          result.value = result.types;
        }
      }

      return this._pageParameterReady('schemaorg', result);
    }
  }, {
    key: 'processOpengraph',
    value: function processOpengraph() {
      var result = new DiagnosisResult({
        status: STATE.STATE_AVERAGE,
        description: 'sqDiagnosis_opengraph_no',
        types: '',
        domain: encodeURIComponent(this._data.location),
        location: encodeURIComponent(this._data.location)
      });

      if (this._data.opengraph && this._data.opengraph.length > 0) {
        result.types = this._data.opengraph.join(', ');
        if (this._data.opengraph[0] === '') {
          result.status = STATE.STATE_AVERAGE;
          result.description = 'sqDiagnosis_opengraph_average';
        } else {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_opengraph_good';
          result.value = result.types;
        }
      }

      return this._pageParameterReady('opengraph', result);
    }
  }, {
    key: 'processTwitterCard',
    value: function processTwitterCard() {
      var result = new DiagnosisResult({
        status: STATE.STATE_AVERAGE,
        description: 'sqDiagnosis_twittercard_no',
        types: '',
        location: encodeURIComponent(this._data.location)
      });

      if (this._data.twittercard && this._data.twittercard.length == 2) {
        result.type = this._data.twittercard[0];
        result.id = this._data.twittercard[1];
        if (result.type === '') {
          result.status = STATE.STATE_AVERAGE;
          result.description = 'sqDiagnosis_twittercard_bad';
        } else {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_twittercard_good';
          if (result.id === '') {
            result.value = result.type;
          } else {
            result.value = result.type + ' - ' + result.id;
          }
        }
      }

      return this._pageParameterReady('twittercard', result);
    }
  }, {
    key: 'processFavicon',
    value: function processFavicon() {
      var _this8 = this;

      var result = new DiagnosisResult({ url: '', value: '',
        status: STATE.STATE_BAD,
        description: 'sqDiagnosis_internal_error'
      });

      if (!('urlDetails' in this._data)) {
        this._complianceParameterReady('favicon', result);
        return;
      }

      if (this._data.urlDetails.scheme === 'file') {
        result.status = STATE.STATE_AVERAGE;
        result.description = 'sqDiagnosis_unable2detect';
        this._complianceParameterReady('favicon', result);
        return;
      }

      var faviconUrl = '';
      if (this._data.faviconLink) {
        faviconUrl = this._data.faviconLink;
      } else {
        faviconUrl = this._data.urlDetails.scheme + '://' + this._data.urlDetails.domain;
        if (this._data.urlDetails.port !== '') {
          faviconUrl += ':' + this._data.urlDetails.port;
        }

        faviconUrl += '/favicon.ico';
      }

      if (faviconUrl.startsWith('data:')) {
        result.url = result.value = 'Inline image';
        result.status = STATE.STATE_GOOD;
        result.description = 'sqDiagnosis_favicon_good';
        this._complianceParameterReady('favicon', result);
      } else {
        var answerCallback = function answerCallback(answer) {
          var result = new DiagnosisResult({
            status: STATE.STATE_BAD,
            description: 'sqDiagnosis_favicon_bad',
            url: '', value: ''
          });

          if (answer.status === 200) {
            result.status = STATE.STATE_GOOD;
            result.description = 'sqDiagnosis_favicon_good';
            result.url = result.value = faviconUrl;
          }

          return _this8._complianceParameterReady('favicon', result);
        };

        var timeoutCallback = function timeoutCallback() {
          var result = new DiagnosisResult({ status: STATE.STATE_TIMEOUT, description: 'sqDiagnosis_timeoutreached' });
          result.url = result.value = '';
          return _this8._complianceParameterReady('favicon', result);
        };

        this._sendRequest(faviconUrl, answerCallback, this.AJAX_TIMEOUT, timeoutCallback);
      }
    }
  }, {
    key: 'processAmpVersion',
    value: function processAmpVersion() {
      var _this9 = this;

      var result = null;

      if (this._data.isHTMLAMP) {
        result = new DiagnosisResult({ status: STATE.STATE_AVERAGE, description: 'sqDiagnosis_ampVersion_ampPage' });
        if (this._data.canonicalLink !== '') {
          if (this._data.ampLink === this._data.canonicalLink) {
            result.status = STATE.STATE_GOOD;
            result.description = 'sqDiagnosis_ampVersion_ampPageSelf';
          } else {
            result.status = STATE.STATE_GOOD;
          }

          result.url = result.value = this._data.canonicalLink;
        }

        this._mobileParameterReady('ampVersion', result);
        return;
      }

      result = new DiagnosisResult({ status: STATE.STATE_AVERAGE, description: 'sqDiagnosis_ampVersion_no' });

      if (this._data.ampLink !== '') {
        result.description = 'sqDiagnosis_ampVersion_link';
        result.url = result.value = this._data.ampLink;

        this._sendRequestEx(result.url, this.AJAX_TIMEOUT).then(function (answer) {
          if (answer.status === 200) {
            var processor = new AMPDocumentProcessor(answer.responseText);
            if (processor.isError) {
              result.status = STATE.STATE_BAD;
              result.description = 'sqDiagnosis_ampVersion_notAvaialable';
            } else if (!processor.isAMP) {
              result.status = STATE.STATE_BAD;
              result.description = 'sqDiagnosis_ampVersion_notAmp';
            } else if (processor.canonical !== '') {
              if (processor.canonical === _this9._data.location) {
                result.status = STATE.STATE_GOOD;
                result.description = 'sqDiagnosis_ampVersion_ampGood';
              } else if (processor.canonical === result.url) {
                result.status = STATE.STATE_GOOD;
                result.description = 'sqDiagnosis_ampVersion_ampGood';
              } else {
                result.status = STATE.STATE_AVERAGE;
                result.description = 'sqDiagnosis_ampVersion_ampWrongCanonical';
              }
            } else {
              result.status = STATE.STATE_AVERAGE;
              result.description = 'sqDiagnosis_ampVersion_ampWrongNoCanonical';
            }
          } else {
            result.status = STATE.STATE_BAD;
            result.description = 'sqDiagnosis_ampVersion_notAvaialable';
          }

          _this9._mobileParameterReady('ampVersion', result);
        }).catch(function (reason) {
          return _this9._mobileParameterReady('ampVersion', result);
        });
      } else {
        this._mobileParameterReady('ampVersion', result);
      }
    }
  }, {
    key: 'processViewport',
    value: function processViewport() {
      var result = new DiagnosisResult({ value: '', status: STATE.STATE_BAD, description: 'sqDiagnosis_internal_error' });

      if ('viewport' in this._data) {
        var defaultViewports = ['width=device-width, initial-scale=1', 'width=device-width, initial-scale=1.0'];

        result.value = this._data.viewport;

        if (this._data.viewport === '') {
          result.status = STATE.STATE_BAD;
          result.description = 'sqDiagnosis_viewport_no';
        } else if (defaultViewports.indexOf(this._data.viewport) !== false) {
          result.status = STATE.STATE_GOOD;
          result.description = 'sqDiagnosis_viewport_default';
        } else {
          result.status = STATE.STATE_AVERAGE;
          result.description = 'sqDiagnosis_viewport_some';
        }
      }

      return this._mobileParameterReady('viewport', result);
    }
  }, {
    key: 'data',
    get: function get() {
      return this._data;
    }
  }, {
    key: 'robotsTxtContent',
    get: function get() {
      return this._robotsTxtContent;
    }
  }]);

  return Diagnosis;
}();

messengerMixin(Diagnosis.prototype);
messengerTranslateMixin(Diagnosis.prototype);

module.exports = Diagnosis;

},{"../lib/ignore":64,"../utils/XHRProxyEx":90,"../utils/messengerMixin":95,"../utils/messengerTranslateMixin":97,"./AMPDocumentProcessor":16,"./DiagnosisGroup":18,"./DiagnosisResult":19,"./DiagnosisStates":20,"./rules/DiagnosisRuleCanonical":22,"./rules/DiagnosisRuleSitemapXml":23}],18:[function(require,module,exports){
'use strict';

var STATE = require('./DiagnosisStates');
var DiagnosisResult = require('./DiagnosisResult');

module.exports = DiagnosisGroup;

function DiagnosisGroup(owner, rules) {
  this.owner = owner;
  this.rules = rules;
  this.length = 0;
  this.updateRules();
}

DiagnosisGroup.prototype.updateRules = function () {
  for (var i = 0; i < this.rules.length; i++) {
    var key = this.rules[i];
    if (key in this) {
      delete this[key];
    }

    this[key] = new DiagnosisResult();
    this.length++;
  }
};

DiagnosisGroup.prototype.get = function (key) {
  if (key in this && this[key] instanceof DiagnosisResult) {
    return this[key];
  }

  return undefined;
};

DiagnosisGroup.prototype.countReady = function () {
  var result = 0;
  for (var i = 0; i < this.rules.length; i++) {
    var key = this.rules[i];
    if (key in this && this[key] instanceof DiagnosisResult) {
      if (this[key].status !== STATE.STATE_PROCESSING) {
        result++;
      }
    }
  }

  return result;
};

DiagnosisGroup.prototype.countGood = function () {
  var result = 0;
  for (var i = 0; i < this.rules.length; i++) {
    var key = this.rules[i];
    if (key in this && this[key] instanceof DiagnosisResult) {
      if (this[key].status === STATE.STATE_GOOD) {
        result++;
      }
    }
  }

  return result;
};

DiagnosisGroup.prototype.countBad = function () {
  var result = 0;
  for (var i = 0; i < this.rules.length; i++) {
    var key = this.rules[i];
    if (key in this && this[key] instanceof DiagnosisResult) {
      if (this[key].status === STATE.STATE_BAD) {
        result++;
      }
    }
  }

  return result;
};

DiagnosisGroup.prototype.countAverage = function () {
  var result = 0;
  for (var i = 0; i < this.rules.length; i++) {
    var key = this.rules[i];
    if (key in this && this[key] instanceof DiagnosisResult) {
      if (this[key].status === STATE.STATE_AVERAGE) {
        result++;
      }
    }
  }

  return result;
};

DiagnosisGroup.prototype.setStatus = function (status, description) {
  for (var i = 0; i < this.rules.length; i++) {
    var key = this.rules[i];
    this[key].status = status;
    this[key].description = description;
  }
};

},{"./DiagnosisResult":19,"./DiagnosisStates":20}],19:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var STATE = require('./DiagnosisStates');

var DiagnosisResult = function DiagnosisResult(options) {
  _classCallCheck(this, DiagnosisResult);

  this.status = STATE.STATE_PROCESSING;
  this.description = '';

  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key];
    }
  }
};

module.exports = DiagnosisResult;

},{"./DiagnosisStates":20}],20:[function(require,module,exports){
'use strict';

module.exports = {
  STATE_GOOD: 'good',
  STATE_AVERAGE: 'average',
  STATE_BAD: 'bad',
  STATE_PROCESSING: 'processing',
  STATE_TIMEOUT: 'timeout'
};

},{}],21:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DiagnosisRule = function DiagnosisRule(diagnosis) {
  _classCallCheck(this, DiagnosisRule);

  this._diagnosis = diagnosis;
};

module.exports = DiagnosisRule;

},{}],22:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var STATE = require('../DiagnosisStates');
var DiagnosisResult = require('../DiagnosisResult');
var DiagnosisRule = require('./DiagnosisRule');

var DiagnosisRuleCanonical = function (_DiagnosisRule) {
  _inherits(DiagnosisRuleCanonical, _DiagnosisRule);

  function DiagnosisRuleCanonical(diagnosis) {
    _classCallCheck(this, DiagnosisRuleCanonical);

    var _this = _possibleConstructorReturn(this, (DiagnosisRuleCanonical.__proto__ || Object.getPrototypeOf(DiagnosisRuleCanonical)).call(this, diagnosis));

    _this._canonicalUrl = '';

    _this.processTimeout = _this.handleTimeout.bind(_this);
    _this.processCanonicalAnswer = _this.handleCanonicalAnswer.bind(_this);
    return _this;
  }

  _createClass(DiagnosisRuleCanonical, [{
    key: 'run',
    value: function run() {
      var result = new DiagnosisResult({ url: '', value: '',
        status: STATE.STATE_AVERAGE,
        description: 'sqDiagnosis_canonical_average'
      });

      if (!('canonicalLink' in this.diagnosis.data) || this.diagnosis.data.canonicalLink === '') {
        this.diagnosis.pageParameterReady('canonical', result);
        return;
      }

      this._canonicalUrl = this.diagnosis.data.canonicalLink;
      this._requestCanonicalURL();
    }
  }, {
    key: '_requestCanonicalURL',
    value: function _requestCanonicalURL() {
      this.diagnosis.sendRequestEx(this._canonicalUrl, DiagnosisRuleCanonical.AJAX_TIMEOUT, 'get').then(this.processCanonicalAnswer).catch(this.processTimeout);
    }
  }, {
    key: 'handleTimeout',
    value: function handleTimeout() {
      var result = new DiagnosisResult({ status: STATE.STATE_TIMEOUT, description: 'sqDiagnosis_unable2detect' });
      result.url = result.value = this._canonicalUrl;
      return this.diagnosis.pageParameterReady('canonical', result);
    }
  }, {
    key: 'handleCanonicalAnswer',
    value: function handleCanonicalAnswer(answer) {
      if (answer.status === 200) {
        var result = new DiagnosisResult({
          status: STATE.STATE_GOOD,
          description: 'sqDiagnosis_canonical_good',
          url: this._canonicalUrl,
          value: this._canonicalUrl
        });
        this.diagnosis.pageParameterReady('canonical', result);
      } else {
        var _result = new DiagnosisResult({
          status: STATE.STATE_BAD,
          description: 'sqDiagnosis_canonical_bad',
          url: this._canonicalUrl,
          value: this._canonicalUrl
        });
        this.diagnosis.pageParameterReady('canonical', _result);
      }
    }
  }, {
    key: 'diagnosis',
    get: function get() {
      return this._diagnosis;
    }
  }]);

  return DiagnosisRuleCanonical;
}(DiagnosisRule);

DiagnosisRuleCanonical.AJAX_TIMEOUT = 30000;

module.exports = DiagnosisRuleCanonical;

},{"../DiagnosisResult":19,"../DiagnosisStates":20,"./DiagnosisRule":21}],23:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var STATE = require('../DiagnosisStates');
var DiagnosisResult = require('../DiagnosisResult');
var DiagnosisRule = require('./DiagnosisRule');

var DiagnosisRuleSitemapXml = function (_DiagnosisRule) {
  _inherits(DiagnosisRuleSitemapXml, _DiagnosisRule);

  function DiagnosisRuleSitemapXml(diagnosis) {
    _classCallCheck(this, DiagnosisRuleSitemapXml);

    var _this = _possibleConstructorReturn(this, (DiagnosisRuleSitemapXml.__proto__ || Object.getPrototypeOf(DiagnosisRuleSitemapXml)).call(this, diagnosis));

    _this._sitemapXmlUrl = '';
    _this._sitemapIndexXmlUrl = '';
    _this._dontAskRobots = false;
    _this._headOnly = false;

    _this.processRobotsTxtReady = _this.handleRobotsTxtReady.bind(_this);
    _this.processTimeout = _this.handleTimeout.bind(_this);
    _this.processSitemapXMLAnswer = _this.handleSitemapXMLAnswer.bind(_this);
    _this.processSitemapIndexXMLAnswer = _this.handleSitemapIndexXMLAnswer.bind(_this);
    return _this;
  }

  _createClass(DiagnosisRuleSitemapXml, [{
    key: 'run',
    value: function run() {
      var result = new DiagnosisResult({ url: '', value: '',
        status: STATE.STATE_BAD,
        description: 'sqDiagnosis_internal_error'
      });

      if (!('urlDetails' in this.diagnosis.data)) {
        this.diagnosis.complianceParameterReady('xmlSitemaps', result);
        return;
      }

      if (this.diagnosis.data.urlDetails.scheme === 'file') {
        result.status = STATE.STATE_AVERAGE;
        result.description = 'sqDiagnosis_unable2detect';
        this.diagnosis.complianceParameterReady('xmlSitemaps', result);
        return;
      }

      this._sitemapXmlUrl = this.diagnosis.data.urlDetails.scheme + '://' + this.diagnosis.data.urlDetails.domain;

      if (this.diagnosis.data.urlDetails.port !== '') {
        this._sitemapXmlUrl += ':' + this.diagnosis.data.urlDetails.port;
      }

      this._sitemapIndexXmlUrl = this._sitemapXmlUrl;

      this._sitemapXmlUrl += '/sitemap.xml';
      this._sitemapIndexXmlUrl += '/sitemap_index.xml';

      this._requestSitemapXML();
    }
  }, {
    key: '_requestSitemapXML',
    value: function _requestSitemapXML() {
      this.diagnosis.sendRequestEx(this._sitemapXmlUrl, DiagnosisRuleSitemapXml.AJAX_TIMEOUT, this._headOnly ? 'head' : 'get').then(this.processSitemapXMLAnswer).catch(this.processTimeout);
    }
  }, {
    key: '_requestSitemapIndexXML',
    value: function _requestSitemapIndexXML() {
      this.diagnosis.sendRequestEx(this._sitemapIndexXmlUrl, DiagnosisRuleSitemapXml.AJAX_TIMEOUT, this._headOnly ? 'head' : 'get').then(this.processSitemapIndexXMLAnswer).catch(this.processTimeout);
    }
  }, {
    key: 'handleRobotsTxtReady',
    value: function handleRobotsTxtReady() {
      var urls = /^Sitemap: (.*)$/img.exec(this.diagnosis.robotsTxtContent);
      if (urls !== null && urls[1]) {
        this._sitemapXmlUrl = urls[1];
        this._dontAskRobots = true;
        this._headOnly = /\.gz$/i.test(urls[1]);
        this._requestSitemapXML();
      } else {
        this._requestSitemapIndexXML();
      }
    }
  }, {
    key: 'handleTimeout',
    value: function handleTimeout() {
      var result = new DiagnosisResult({ status: STATE.STATE_TIMEOUT, description: 'sqDiagnosis_unable2detect' });
      result.url = result.value = this._sitemapXmlUrl;
      return this.diagnosis.complianceParameterReady('xmlSitemaps', result);
    }
  }, {
    key: 'handleSitemapXMLAnswer',
    value: function handleSitemapXMLAnswer(answer) {
      if (answer.status === 200 && (this._headOnly || DiagnosisRuleSitemapXml.validateSitemapXML(answer.responseText))) {
        var result = new DiagnosisResult({
          status: STATE.STATE_GOOD,
          description: 'sqDiagnosis_sitemaps_good',
          url: this._sitemapXmlUrl,
          value: this._sitemapXmlUrl
        });
        this.diagnosis.complianceParameterReady('xmlSitemaps', result);
      } else if (!this._dontAskRobots) {
        this.diagnosis.addEventListener('compliance.robotsTxt', this.processRobotsTxtReady, true);
      } else {
        this._requestSitemapIndexXML();
      }
    }
  }, {
    key: 'handleSitemapIndexXMLAnswer',
    value: function handleSitemapIndexXMLAnswer(answer) {
      var result = new DiagnosisResult({ status: STATE.STATE_BAD, description: 'sqDiagnosis_sitemaps_bad' });
      result.url = result.value = '';
      if (answer.status === 200 && (this._headOnly || DiagnosisRuleSitemapXml.validateSitemapXML(answer.responseText))) {
        result.status = STATE.STATE_GOOD;
        result.description = 'sqDiagnosis_sitemaps_good';
        result.url = result.value = this._sitemapIndexXmlUrl;
        this.diagnosis.complianceParameterReady('xmlSitemaps', result);
      } else {
        this.diagnosis.complianceParameterReady('xmlSitemaps', result);
      }
    }
  }, {
    key: 'diagnosis',
    get: function get() {
      return this._diagnosis;
    }
  }], [{
    key: 'validateSitemapXML',
    value: function validateSitemapXML(text) {
      return text.match(/<\?xml version="1.0".+?\?>/i) || text.match(/<\?xml version='1.0'.+?\?>/i);
    }
  }]);

  return DiagnosisRuleSitemapXml;
}(DiagnosisRule);

DiagnosisRuleSitemapXml.AJAX_TIMEOUT = 30000;

module.exports = DiagnosisRuleSitemapXml;

},{"../DiagnosisResult":19,"../DiagnosisStates":20,"./DiagnosisRule":21}],24:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Chain = function () {
  function Chain(dom, element) {
    _classCallCheck(this, Chain);

    this._dom = dom;

    this._element = element;
  }

  _createClass(Chain, [{
    key: 'appendChild',
    value: function appendChild(child) {
      this._element.appendChild(child);
      return this;
    }
  }, {
    key: 'removeChild',
    value: function removeChild(child) {
      this._element.removeChild(child);
      return this;
    }
  }, {
    key: 'element',
    get: function get() {
      return this._element;
    }
  }]);

  return Chain;
}();

module.exports = Chain;

},{}],25:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dom = require('./main.js');
var isEmpty = require('../lib/isEmpty');

var CounterElement = function () {
  function CounterElement(selector, context) {
    _classCallCheck(this, CounterElement);

    if (isEmpty(selector)) {
      throw new Error('Argument selector could not be empty');
    }

    context = context || document;
    this._element = null;
    if (selector instanceof HTMLElement) {
      this._element = selector;
    } else {
      this._element = context.querySelector(selector);
    }

    this._counter = 0;
  }

  _createClass(CounterElement, [{
    key: 'inc',
    value: function inc(step) {
      step = step || 1;
      this._counter += step;
      this.show();
    }
  }, {
    key: 'show',
    value: function show() {
      if (this._element !== null) {
        dom.text(this._element, this._counter);
      }
    }
  }, {
    key: 'remove',
    value: function remove() {
      if (this._element !== null) {
        this._element.parentNode.removeChild(this._element);
        this._element = null;
        this._counter = 0;
      }
    }
  }, {
    key: 'counter',
    get: function get() {
      return this._counter;
    },
    set: function set(value) {
      this._counter = value;
      this.show();
    }
  }, {
    key: 'element',
    get: function get() {
      return this._element;
    }
  }]);

  return CounterElement;
}();

module.exports = CounterElement;

},{"../lib/isEmpty":67,"./main.js":38}],26:[function(require,module,exports){
'use strict';

function appendChild(parent, child) {
  if (child instanceof Array) {
    child.forEach(function (item) {
      return appendChild(parent, item);
    });
  } else if (child instanceof Node) {
    parent.appendChild(child);
  } else if (isFunction(child)) {
    appendChild(parent, child());
  } else if (child instanceof Promise) {
    var placeholder = document.createTextNode('');
    parent.appendChild(placeholder);
    child.then(function (msg) {
      return replaceChild(parent, placeholder, msg);
    });
  } else {
    parent.appendChild(document.createTextNode(child));
  }
}

function replaceChild(parent, what, child) {
  if (child instanceof Node) {
    parent.replaceChild(child, what);
  } else {
    var text = document.createTextNode(child);
    parent.replaceChild(text, what);
  }
}

function isFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
}

module.exports = {
  appendChild: appendChild,
  replaceChild: replaceChild
};

},{}],27:[function(require,module,exports){
'use strict';

module.exports = function appendText(element, text) {
  var newTextNode = document.createTextNode(text);
  element.appendChild(newTextNode);
};

},{}],28:[function(require,module,exports){
'use strict';

module.exports = function clearValue(element) {
  var form = document.createElement('form');
  var container = element.parentNode;
  container.replaceChild(form, element);
  form.appendChild(element);
  form.reset();
  container.replaceChild(element, form);
};

},{}],29:[function(require,module,exports){
'use strict';

var skipTags = ['script', 'meta', 'template'];

function correctZIndex(element, deep) {
  deep = deep || false;
  Array.from(element.children).forEach(function (child) {
    if (skipTags.indexOf(child.tagName) !== -1 || child.id === 'sqseobar2' || child.className.indexOf('sqmore-') !== -1 || child.className.indexOf('seoquake-') !== -1 || child.getAttribute('sq-z-fixed') === '1') {
      return;
    }

    var style = document.defaultView.getComputedStyle(child, null);
    if (style.zIndex !== 'auto') {
      try {
        var zIndex = parseInt(style.zIndex);
        if (zIndex - 100 > 0) {
          zIndex -= 100;
          child.style.zIndex = zIndex.toString();
          child.setAttribute('sq-z-fixed', '1');
        }
      } catch (ignore) {}
    }

    if (deep) {
      correctZIndex(child, deep);
    }
  });
}

module.exports = correctZIndex;

},{}],30:[function(require,module,exports){
'use strict';

var css = require('dom-element-css');

var _require = require('./_createElement'),
    appendChild = _require.appendChild,
    replaceChild = _require.replaceChild;

function isString(obj) {
  return typeof obj === 'string' || obj instanceof String;
}

function isFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
}

function createElement(tagName, attrs, content) {
  if (!tagName) {
    return null;
  }

  if (attrs === undefined) {
    attrs = {};
  }

  var element = document.createElement(tagName.toLowerCase());

  if (isString(attrs) || isFunction(attrs)) {
    content = attrs;
  } else {
    for (var attrName in attrs) {
      if (attrs.hasOwnProperty(attrName)) {
        if (attrName === 'className') {
          element.className = attrs[attrName];
        } else if (attrName === 'forId') {
          element.setAttribute('for', attrs[attrName]);
        } else if (attrName === 'style' && !isString(attrs[attrName])) {
          css(element, attrs[attrName]);
        } else {
          element.setAttribute(attrName, attrs[attrName]);
        }
      }
    }
  }

  if (content) {
    appendChild(element, content);
  }

  return element;
}

module.exports = createElement;

},{"./_createElement":26,"dom-element-css":113}],31:[function(require,module,exports){
'use strict';

module.exports = function emptyElement(anElem) {
  while (anElem.firstChild) {
    anElem.removeChild(anElem.firstChild);
  }

  return anElem;
};

},{}],32:[function(require,module,exports){
'use strict';

exports.parseTextNodes = function parseTextNodes(element) {
  var content = [];
  Array.from(element.childNodes).forEach(function (child) {
    var value = '';
    if (child.nodeType === Node.TEXT_NODE) {
      value = child.nodeValue.trim();
    } else if (child.hasChildNodes()) {
      value = parseTextNodes(child);
    }

    if (value !== '') {
      content.push(value);
    }
  });

  return content.join(' ');
};

},{}],33:[function(require,module,exports){
'use strict';

module.exports = function (elem, dontFixScroll) {
  if (!elem || !elem.ownerDocument) {
    return null;
  }

  dontFixScroll = dontFixScroll || false;

  var offsetParent = elem.offsetParent;
  var doc = elem.ownerDocument;
  var docElem = doc.documentElement;
  var body = doc.body;
  var defaultView = doc.defaultView;
  var prevComputedStyle = defaultView.getComputedStyle(elem, null);
  var top = elem.offsetTop;
  var left = elem.offsetLeft;

  while ((elem = elem.parentNode) && elem !== body && elem !== docElem) {
    if (prevComputedStyle.position === 'fixed') {
      break;
    }

    var computedStyle = defaultView.getComputedStyle(elem, null);
    top -= elem.scrollTop;
    left -= elem.scrollLeft;

    if (elem === offsetParent) {
      top += elem.offsetTop;
      left += elem.offsetLeft;

      top += parseFloat(computedStyle.borderTopWidth) || 0;
      left += parseFloat(computedStyle.borderLeftWidth) || 0;

      offsetParent = elem.offsetParent;
    }

    prevComputedStyle = computedStyle;
  }

  if (prevComputedStyle.position === 'relative' || prevComputedStyle.position === 'static') {
    top += body.offsetTop;
    left += body.offsetLeft;
  }

  if (prevComputedStyle.position === 'fixed' && !dontFixScroll) {
    top += Math.max(docElem.scrollTop, body.scrollTop);
    left += Math.max(docElem.scrollLeft, body.scrollLeft);
  }

  return { top: top, left: left };
};

},{}],34:[function(require,module,exports){
'use strict';

var toCamelCase = require('to-camel-case');

exports.hasAttribute = function hasAttribute(element, name) {
  name = toCamelCase(name === 'for' ? 'htmlFor' : name);
  return element.hasAttribute(name);
};

},{"to-camel-case":124}],35:[function(require,module,exports){
'use strict';

function hasClass(element, name) {
  return typeof element !== 'undefined' && typeof element.classList !== 'undefined' && element.classList.contains(name);
}

module.exports = hasClass;

},{}],36:[function(require,module,exports){
'use strict';

var bodyReadyPromise = null;
var bodyReadyRepeats = 0;
var MAX_BODY_WAITING = 10;

function processIsBodyReady(resolve, reject) {
  if (typeof document === 'undefined') {
    reject('NO_DOCUMENT');
    return;
  }

  if (window !== window.top) {
    reject('NOT_TOP');
    return;
  }

  if (!document.body || document.body === null || document.body === undefined) {
    bodyReadyRepeats++;
    if (bodyReadyRepeats < MAX_BODY_WAITING) {
      setTimeout(processIsBodyReady.bind(null, resolve, reject), 100);
    } else {
      reject('NO_BODY');
    }
  } else {
    resolve();
  }
}

function isBodyReady() {
  if (bodyReadyPromise === null) {
    bodyReadyPromise = new Promise(processIsBodyReady);
  }

  return bodyReadyPromise;
}

isBodyReady.reset = function () {
  bodyReadyPromise = null;
  bodyReadyRepeats = 0;
};

module.exports = isBodyReady;

},{}],37:[function(require,module,exports){
'use strict';

var isEmpty = require('../lib/isEmpty');

module.exports = function isChild(parent, child) {
  if (isEmpty(parent) || isEmpty(child)) {
    return false;
  }

  if (parent === child) {
    return true;
  }

  return Array.from(parent.childNodes).some(function (element) {
    return isChild(element, child);
  });
};

},{"../lib/isEmpty":67}],38:[function(require,module,exports){
'use strict';

var ignore = require('../lib/ignore');
var Chain = require('./Chain');
var domElement = require('dom-element');
var createElement = require('./createElement');
var parseMarkdown = require('./parseMarkdown');

createElement.attr = domElement.attr;
createElement.hasAttr = require('./hasAttribute').hasAttribute;
createElement.attrNS = domElement.attrNS;
createElement.prop = domElement.prop;
createElement.css = domElement.css;
createElement.type = domElement.type;
createElement.data = domElement.data;
createElement.value = domElement.value;
createElement.hasClass = require('./hasClass');
createElement.addClass = domElement.addClass;
createElement.removeClass = domElement.removeClass;
createElement.toggleClass = domElement.toggleClass;
createElement.createElement = createElement;
createElement.removeElement = require('./removeElement');
createElement.getOffset = require('./getOffset');
createElement.emptyElement = require('./emptyElement');
createElement.getText = require('./getElementText').parseTextNodes;
createElement.qualifyURL = require('./qualifyURL');
createElement.isChild = require('./isChild');
createElement.px = require('./pixelValue');
createElement.isBodyReady = require('./isBodyReady');
createElement.clearValue = require('./clearValue');
createElement.correctZIndex = require('./correctZIndex');

createElement.text = function (element, text) {
  if (arguments.length === 1) {
    return domElement.text(element);
  }

  if (Object.prototype.toString.call(text) === '[object Function]') {
    var result = text();
    if (result instanceof Promise) {
      text = result;
    } else {
      return domElement.text(element, result);
    }
  }

  if (text instanceof Promise) {
    text.then(function (msg) {
      return domElement.text(element, msg);
    }).catch(ignore);
  } else {
    return domElement.text(element, text);
  }
};

createElement.setText = require('./setText');
createElement.appendText = require('./appendText');
createElement.setContent = require('./setContent');

createElement.insertAfter = function (element, after) {
  if (after.nextElementSibling) {
    after.parentNode.insertBefore(element, after.nextElementSibling);
  } else {
    after.parentNode.appendChild(element);
  }
};

createElement.insertFirst = function (element, container) {
  if (container.firstElementChild) {
    container.insertBefore(element, container.firstElementChild);
  } else {
    container.appendChild(element);
  }
};

createElement.chain = function (element) {
  return new Chain(createElement, element);
};

createElement.find = function (selector) {
  return document.querySelector(selector);
};

createElement.findAll = function (selector) {
  return Array.from(document.querySelectorAll(selector));
};

createElement.parse = function (text, userConfig) {
  return parseMarkdown(createElement, text, userConfig);
};

module.exports = createElement;

},{"../lib/ignore":64,"./Chain":24,"./appendText":27,"./clearValue":28,"./correctZIndex":29,"./createElement":30,"./emptyElement":31,"./getElementText":32,"./getOffset":33,"./hasAttribute":34,"./hasClass":35,"./isBodyReady":36,"./isChild":37,"./parseMarkdown":39,"./pixelValue":40,"./qualifyURL":41,"./removeElement":42,"./setContent":43,"./setText":44,"dom-element":116}],39:[function(require,module,exports){
'use strict';

var extend = require('extend');

function parseMarkdown(dom, text, userConfig) {
  var config = userConfig !== undefined ? extend(true, {}, parseMarkdown.DEFAULT_CONFIG, userConfig) : parseMarkdown.DEFAULT_CONFIG;

  var container = document.createDocumentFragment();

  function processLinks(element, text) {
    var re = /\[(.+?)\]\((.+?)\)/;
    var elements = text.split(re);

    if (elements.length === 1) {
      dom.appendText(element, text);
      return element;
    }

    var isNextLink = false;
    var i = 0;
    while (i < elements.length) {
      var block = elements[i];

      if (isNextLink) {
        i++;
        element.appendChild(dom('a', { href: block, target: '_blank' }, elements[i]));
        isNextLink = false;
      } else {
        if (block !== '') {
          dom.appendText(element, block);
        }

        isNextLink = true;
      }

      i++;
    }

    return element;
  }

  function processBold(element, text) {
    var elements = text.split('*');

    if (elements.length === 1) {
      processLinks(element, text);
      return element;
    }

    var isNextBold = false;

    for (var i = 0; i < elements.length; i++) {
      var block = elements[i];

      if (isNextBold) {
        element.appendChild(processLinks(dom('b'), block));
        isNextBold = false;
      } else {
        if (block !== '') {
          processLinks(element, block);
        }

        isNextBold = true;
      }
    }

    return element;
  }

  function processLinebreak(element, text) {
    var lines = text.split('\n');
    lines.forEach(function (line, index) {
      processBold(element, line);
      if (index + 1 < lines.length) {
        element.appendChild(dom('br'));
      }
    });

    return element;
  }

  function processParagraphs(element, text) {
    var paragraphs = text.split('\n\n');
    paragraphs.forEach(function (content) {
      var headers = content.split('===');

      if (headers.length > 1) {
        element.appendChild(dom('h2', {}, headers[0]));
        if (headers[1] !== '') {
          element.appendChild(processLinebreak(dom('p'), headers[1]));
        }
      } else {
        element.appendChild(processLinebreak(dom('p'), content));
      }
    });
    return element;
  }

  if (config.lineBreak === 'p') {
    return processParagraphs(container, text);
  } else if (config.lineBreak === 'br') {
    return processLinebreak(container, text);
  } else {
    container.appendChild(document.createTextNode(text));
    return container;
  }
}

parseMarkdown.DEFAULT_CONFIG = {
  lineBreak: 'p'
};

module.exports = parseMarkdown;

},{"extend":118}],40:[function(require,module,exports){
'use strict';

module.exports = function pixelValue(value) {
  var result = 0;
  try {
    result = parseInt(value);

    if (isNaN(result)) {
      result = 0;
    }
  } catch (ignore) {
    result = 0;
  }

  return result;
};

},{}],41:[function(require,module,exports){
'use strict';

module.exports = function qualifyURL(url, returnNode) {
  var a = document.createElement('a');
  a.href = url;
  if (returnNode === true) {
    return a.cloneNode(false);
  } else {
    return a.cloneNode(false).href;
  }
};

},{}],42:[function(require,module,exports){
'use strict';

var isEmpty = require('../lib/isEmpty');

module.exports = function removeElement(element) {
  if (!(element instanceof Node)) {
    return;
  }

  if (isEmpty(element.parentNode)) {
    return;
  }

  element.parentNode.removeChild(element);
};

},{"../lib/isEmpty":67}],43:[function(require,module,exports){
'use strict';

var emptyElement = require('./emptyElement');

var _require = require('./_createElement'),
    appendChild = _require.appendChild,
    replaceChild = _require.replaceChild;

function setContent(element, content) {
  emptyElement(element);
  appendChild(element, content);
}

module.exports = setContent;

},{"./_createElement":26,"./emptyElement":31}],44:[function(require,module,exports){
'use strict';

module.exports = function setText(element, text) {
  if (text instanceof Promise) {
    text.then(function (msg) {
      return setText(element, msg);
    }).catch(function (reason) {
      return setText(element, reason);
    });
    return;
  }

  var textNode = null;
  var newTextNode = document.createTextNode(text);

  Array.from(element.childNodes).some(function (node) {
    return node.nodeType === Node.TEXT_NODE ? textNode = node : false;
  });

  if (textNode === null) {
    element.appendChild(newTextNode);
  } else {
    element.replaceChild(newTextNode, textNode);
  }
};

},{}],45:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dom = require('../dom/main');

var ColumnDisplay = function () {
  function ColumnDisplay(title, columns) {
    _classCallCheck(this, ColumnDisplay);

    this._title = title || '';
    this._columns = columns || 1;
    if (this._columns < 1) {
      throw new RangeError('Can not be less then 1 column');
    }

    this._element = null;
    this._header = null;
    this._table = null;
    this._items = [];
    this._ready = false;
    this.init();
  }

  _createClass(ColumnDisplay, [{
    key: 'init',
    value: function init() {
      if (this._ready) {
        throw new Error('This is already processed');
      }

      this._element = dom('div');
      this._header = dom('h3', this._title);
      this._table = dom('table');
      this._element.appendChild(this._header);
      this._element.appendChild(this._table);
      this._ready = true;
    }
  }, {
    key: 'sort',
    value: function sort(compareFunction) {
      this._items.sort(compareFunction);
      this.update();
    }
  }, {
    key: 'addItem',
    value: function addItem(item) {
      if (item instanceof Node) {
        this._items.push(item);
        this.update();
      } else {
        throw new TypeError('Item should be Node');
      }
    }
  }, {
    key: 'removeItem',
    value: function removeItem(item) {
      if (!(item instanceof Node)) {
        throw new TypeError('Item should be Node');
      }

      var index = this._items.indexOf(item);
      if (index !== -1) {
        this._items.splice(index, 1);
        this.update();
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      this._items = [];
      this.update();
    }
  }, {
    key: 'update',
    value: function update() {
      dom.emptyElement(this._table);
      if (this._items.length === 0) {
        return;
      }

      var row = this._table.insertRow(-1);
      var itemsInColumn = Math.ceil(this.length / this._columns);
      var column = row.insertCell(-1);
      var index = 0;
      this._items.forEach(function (item) {
        if (index >= itemsInColumn) {
          column = row.insertCell(-1);
          index = 0;
        }

        column.appendChild(item);
        index++;
      });
    }
  }, {
    key: 'remove',
    value: function remove() {
      dom.removeElement(this._table);
      dom.removeElement(this._header);
      dom.removeElement(this._element);
      delete this._element;
      delete this._title;
      delete this._columns;
      delete this._table;
      delete this._header;
      delete this._items;
    }
  }, {
    key: 'element',
    get: function get() {
      return this._element;
    }
  }, {
    key: 'title',
    set: function set(value) {
      this._title = value;
      dom.text(this._header, this._title);
    },
    get: function get() {
      return this._title;
    }
  }, {
    key: 'columns',
    get: function get() {
      return this._columns;
    },
    set: function set(value) {
      if (value < 1) {
        throw new Error('Can not be less then 1 column');
      }

      this._columns = value;
      this.update();
    }
  }, {
    key: 'length',
    get: function get() {
      return this._items.length;
    }
  }]);

  return ColumnDisplay;
}();

module.exports = ColumnDisplay;

},{"../dom/main":38}],46:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventsMixin = require('../utils/eventsMixin');
var extend = require('extend');

var Draggable = function () {
  function Draggable(element, config) {
    _classCallCheck(this, Draggable);

    this._config = extend(true, {}, Draggable.DEFAULT_CONFIG, config);
    this._element = element;
    this._state = Draggable.STATE_NONE;
    this._lastCoord = {
      left: 0,
      top: 0
    };

    this._processMouseDown = this._handleMouseDown.bind(this);
    this._processMouseUp = this._handleMouseUp.bind(this);
    this._processMouseMove = this._handleMouseMove.bind(this);

    this._element.addEventListener('mousedown', this._processMouseDown);
    this._element.addEventListener('mouseup', this._processMouseUp);
  }

  _createClass(Draggable, [{
    key: '_handleMouseDown',
    value: function _handleMouseDown(event) {
      if (this._state !== Draggable.STATE_NONE) {
        return;
      }

      this._state = Draggable.STATE_DOWN;

      var body = this._element.ownerDocument.body;
      body.addEventListener('mousemove', this._processMouseMove);
      body.addEventListener('mouseup', this._processMouseUp);

      this._lastCoord.left = event.screenX;
      this._lastCoord.top = event.screenY;

      this.dispatchEvent('down');
    }
  }, {
    key: '_handleMouseUp',
    value: function _handleMouseUp(event) {
      if (this._state === Draggable.STATE_NONE) {
        return;
      }

      this._state = Draggable.STATE_NONE;

      var body = this._element.ownerDocument.body;
      body.removeEventListener('mousemove', this._processMouseMove);
      body.removeEventListener('mouseup', this._processMouseUp);

      this._lastCoord.left = event.screenX;
      this._lastCoord.top = event.screenY;

      this.dispatchEvent('up');
    }
  }, {
    key: '_handleMouseMove',
    value: function _handleMouseMove(event) {
      if (this._state === Draggable.STATE_NONE) {
        return;
      }

      this._state = Draggable.STATE_MOVE;

      var delta = {
        left: this._lastCoord.left - event.screenX,
        top: this._lastCoord.top - event.screenY
      };

      this._lastCoord.left = event.screenX;
      this._lastCoord.top = event.screenY;

      this.dispatchEvent('move', delta);
    }
  }, {
    key: 'remove',
    value: function remove() {
      this._element.removeEventListener('mousedown', this._processMouseDown);
      this._element.removeEventListener('mouseup', this._processMouseUp);

      if (this._state !== Draggable.STATE_NONE) {
        var body = this._element.ownerDocument.body;
        body.removeEventListener('mousemove', this._processMouseMove);
        body.removeEventListener('mouseup', this._processMouseUp);
      }

      this._state = Draggable.STATE_NONE;

      this.dispatchEvent('up');
    }
  }]);

  return Draggable;
}();

Draggable.DEFAULT_CONFIG = {
  button: 0,
  mouseUpBody: true
};

Draggable.STATE_NONE = 0;
Draggable.STATE_DOWN = 1;
Draggable.STATE_MOVE = 2;

eventsMixin(Draggable.prototype);

module.exports = Draggable;

},{"../utils/eventsMixin":93,"extend":118}],47:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dom = require('../dom/main');
var extend = require('extend');
var getOffset = dom.getOffset;

var FloatPanel = function () {
  function FloatPanel(element, options) {
    _classCallCheck(this, FloatPanel);

    options = options || {};
    this.element = element;
    this.position = getOffset(element);
    this.size = {
      width: element.offsetWidth,
      height: element.offsetHeight
    };

    this.config = extend(true, {
      paddingTop: 10,
      stopOn: 0,
      fixOldPosition: true,
      zIndex: 100
    }, options);

    this.initialCSS = {
      position: dom.css(element, 'position'),
      width: dom.css(element, 'width'),
      height: dom.css(element, 'height'),
      top: dom.css(element, 'top'),
      'z-index': dom.css(element, 'z-index')
    };

    this.initialStyle = window.getComputedStyle(this.element);
    this.scrollEventListener = this.scrollEventHandler.bind(this);
    this.resizeEventListener = this.resizeEventHandler.bind(this);
    this.rootElement = element.ownerDocument;
    this.processResizeEvent = true;
    this.rootElement.addEventListener('scroll', this.scrollEventListener);
    window.addEventListener('resize', this.resizeEventListener);

    this.switchMediaToPrintListener = this.switchMediaToPrintHandler.bind(this);
    this.switchMediaToScreenListener = this.switchMediaToScreenHandler.bind(this);

    window.matchMedia('print').addListener(this.switchMediaToPrintListener);
    window.matchMedia('screen').addListener(this.switchMediaToScreenListener);

    this.state = FloatPanel.STATE_OVER;
    this.shadow = null;
  }

  _createClass(FloatPanel, [{
    key: '_setElementWidth',
    value: function _setElementWidth(value) {
      if (value === 'auto') {
        dom.css(this.element, 'width', value);
      } else if (value === undefined || value === null || value === 0) {
        dom.css(this.element, 'width', null);
      } else {
        dom.css(this.element, 'width', value + 'px');
      }
    }
  }, {
    key: 'switchMediaToPrintHandler',
    value: function switchMediaToPrintHandler(mql) {
      if (mql.matches) {
        this.processResizeEvent = false;
      }
    }
  }, {
    key: 'switchMediaToScreenHandler',
    value: function switchMediaToScreenHandler(mql) {
      if (mql.matches) {
        this.processResizeEvent = true;
      }
    }
  }, {
    key: 'resizeEventHandler',
    value: function resizeEventHandler(event) {
      if (!this.processResizeEvent) {
        return;
      }

      if (this.state !== FloatPanel.STATE_OVER) {
        if (this.config.fixOldPosition) {
          this.shadowUpdate();
        } else {
          this._setElementWidth('auto');
          this.size.width = this.element.offsetWidth;
          this._setElementWidth(this.size.width);
        }
      } else {
        this.size.width = this.element.offsetWidth;
      }
    }
  }, {
    key: 'scrollEventHandler',
    value: function scrollEventHandler() {
      var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      if (scrollTop > this.position.top - this.config.paddingTop - parseInt(this.initialStyle.marginTop)) {
        this.stateInside();
      } else if (this.config.stopOn > 0 && scrollTop + window.innerHeight > this.config.stopOn + this.size.height) {
        this.stateBellow();
      } else {
        this.stateOver();
      }
    }
  }, {
    key: 'shadowCreate',
    value: function shadowCreate() {
      if (this.shadow === null) {
        this.shadow = dom.createElement(this.element.nodeName, {
          className: 'float-element-shadow'
        });
        if (dom.css(this.element, 'display') === 'inline-block') {
          dom.css(this.shadow, 'display', 'inline-block');
        } else {
          dom.css(this.shadow, 'display', 'block');
        }

        this.element.parentElement.insertBefore(this.shadow, this.element);
        dom.css(this.shadow, 'width', this.size.width + 'px');
        dom.css(this.shadow, 'height', this.size.height + 'px');
        dom.css(this.shadow, 'margin-top', this.initialStyle.marginTop);
        dom.css(this.shadow, 'margin-right', this.initialStyle.marginRight);
        dom.css(this.shadow, 'margin-bottom', this.initialStyle.marginBottom);
        dom.css(this.shadow, 'margin-left', this.initialStyle.marginLeft);
      }
    }
  }, {
    key: 'shadowRemove',
    value: function shadowRemove() {
      dom.removeElement(this.shadow);
      this.shadow = null;
    }
  }, {
    key: 'shadowUpdate',
    value: function shadowUpdate() {
      dom.css(this.shadow, 'width', 'auto');
      this.size.width = this.shadow.offsetWidth;
      dom.css(this.shadow, 'width', this.size.width + 'px');
      this._setElementWidth(this.size.width);
    }
  }, {
    key: 'stateOver',
    value: function stateOver() {
      if (this.state === FloatPanel.STATE_OVER) {
        return;
      }

      dom.css(this.element, this.initialCSS);
      dom.removeClass(this.element, 'float-element');
      if (this.config.fixOldPosition && this.shadow !== null) {
        this.shadowRemove();
      }

      if (this.state !== FloatPanel.STATE_OVER) {
        this.dispatchEvent('over');
      }

      this.state = FloatPanel.STATE_OVER;
    }
  }, {
    key: 'stateInside',
    value: function stateInside() {
      if (this.state === FloatPanel.STATE_OVER) {
        if (this.config.fixOldPosition) {
          this.shadowCreate();
        }

        dom.addClass(this.element, 'float-element');
        dom.css(this.element, 'position', 'fixed');
        dom.css(this.element, 'top', this.config.paddingTop + 'px');
        this._setElementWidth(this.size.width);
        dom.css(this.element, 'z-index', this.config.zIndex);
        this.dispatchEvent('inside');
      }

      this.state = FloatPanel.STATE_INSIDE;
    }
  }, {
    key: 'stateBellow',
    value: function stateBellow() {
      this.dispatchEvent('bellow');
    }
  }, {
    key: 'remove',
    value: function remove() {
      this.rootElement.removeEventListener('scroll', this.scrollEventListener);
      window.removeEventListener('resize', this.resizeEventListener);
      window.matchMedia('print').removeListener(this.switchMediaToPrintListener);
      window.matchMedia('screen').removeListener(this.switchMediaToScreenListener);
      this.stateOver();
      this.element = null;
      this.rootElement = null;
      this.shadow = null;
      this.clearEvents();
      this.state = FloatPanel.STATE_DISABLED;
      this.size = null;
      this.position = null;
    }
  }, {
    key: 'paddingTop',
    set: function set(value) {
      this.config.paddingTop = value;
      this.scrollEventHandler();
    },
    get: function get() {
      return this.config.paddingTop;
    }
  }]);

  return FloatPanel;
}();

require('../utils/eventsMixin')(FloatPanel.prototype);

FloatPanel.STATE_DISABLED = 0;

FloatPanel.STATE_OVER = 1;

FloatPanel.STATE_INSIDE = 2;

FloatPanel.STATE_BELLOW = 3;

module.exports = FloatPanel;

},{"../dom/main":38,"../utils/eventsMixin":93,"extend":118}],48:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dom = require('../dom/main');
var extend = require('extend');

var HintBox = function () {
  function HintBox(element, config) {
    _classCallCheck(this, HintBox);

    this._owner = element;

    this._message = '';
    this._config = extend(true, {}, HintBox.DEFAULT_CONFIG, config);

    if (dom.hasAttr(this._owner, 'data-message')) {
      this._message = dom.attr(this._owner, 'data-message');
    } else if (this.config.message !== '') {
      this._message = this.config.message;
    }

    this.eventShowListener = this.eventShowHandler.bind(this);

    this.eventHideListener = this.eventHideHandler.bind(this);

    this._visible = false;

    this._element = null;

    this.event = this.config.event;
    this.deleteTimer = null;
  }

  _createClass(HintBox, [{
    key: '_removeCurrentListeners',
    value: function _removeCurrentListeners() {
      switch (this.config.event) {
        case 'click':
          this._owner.removeEventListener('click', this.eventShowListener);
          this._owner.removeEventListener('click', this.eventHideListener);
          break;
        case 'hover':
          this._owner.removeEventListener('mouseenter', this.eventShowListener);
          this._owner.removeEventListener('mouseleave', this.eventHideListener);
      }
    }
  }, {
    key: '_fillElementMessage',
    value: function _fillElementMessage() {
      if (this._message instanceof DocumentFragment) {
        var clone = this._message.cloneNode(true);
        dom.setContent(this._messageContainer, clone);
      } else {
        dom.setContent(this._messageContainer, this._message);
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      var _this = this;

      if (!this._visible || this._element === null || typeof this._element === 'undefined') {
        return;
      }

      dom.removeClass(this.element, 'seoquake-hintbox-visible');

      if (this.config.event === 'click') {
        this._owner.addEventListener('click', this.eventShowListener);
        this._owner.removeEventListener('click', this.eventHideListener);
        this._owner.ownerDocument.removeEventListener('click', this.eventHideListener);
      }

      this._visible = false;

      if (this.config.autoRemove) {
        this.deleteTimer = setTimeout(function () {
          return _this.removeHintElement();
        }, 100);
      }
    }
  }, {
    key: 'show',
    value: function show() {
      if (this._visible) {
        return;
      }

      this.reposition();

      if (this.config.event === 'click') {
        this._owner.removeEventListener('click', this.eventShowListener);
        this._owner.addEventListener('click', this.eventHideListener);
      }

      dom.css(this.element, 'visibility', 'visible');
      dom.addClass(this.element, 'seoquake-hintbox-visible');

      this._visible = true;
    }
  }, {
    key: 'reposition',
    value: function reposition() {
      var style = {
        position: 'absolute',
        visibility: 'hidden'
      };

      var _dom$getOffset = dom.getOffset(this._owner, this._config.positionFixed),
          top = _dom$getOffset.top,
          left = _dom$getOffset.left;

      var width = this._owner.offsetWidth;

      if (this._config.offset.left !== null) {
        left += this._config.offset.left;
      }

      if (this._config.offset.top !== null) {
        top += this._config.offset.top;
      }

      if (this.config.className.indexOf('seoquake-hintbox-bottom') !== -1) {
        top += this._owner.offsetHeight;
      }

      if (this.config.className.indexOf('seoquake-hintbox-side-') !== -1) {
        var leftSet = left;

        if (this.config.className.indexOf('seoquake-hintbox-side-right') !== -1) {
          leftSet += width + 5;
        }

        style.left = leftSet + 'px';
        style.top = top + 'px';

        dom.css(this.element, style);

        if (this.config.inline) {
          dom.css(this._messageContainer, {
            whiteSpace: 'nowrap',
            width: 'auto'
          });
        }

        if (this.config.className.indexOf('seoquake-hintbox-side-left') !== -1) {
          leftSet = left - this._messageContainer.offsetWidth;
          dom.css(this.element, 'left', leftSet + 'px');
        }

        if (leftSet + this._messageContainer.offsetWidth > document.body.clientWidth) {
          leftSet = left - this._messageContainer.offsetWidth;
          dom.css(this.element, 'left', leftSet + 'px');
          dom.addClass(this.element, 'seoquake-hintbox-side-left');
        }
      } else {
        var _leftSet = Math.min(left, left - (16 - width / 2));

        style.left = _leftSet + 'px';
        style.top = top + 'px';

        dom.css(this.element, style);

        if (this.config.inline) {
          dom.css(this._messageContainer, {
            whiteSpace: 'nowrap',
            width: 'auto'
          });
        }

        if (left + this._messageContainer.offsetWidth > document.body.clientWidth) {
          _leftSet = left - (this._messageContainer.offsetWidth - width) + 'px';
          dom.css(this.element, 'left', _leftSet);
          dom.addClass(this.element, 'seoquake-hintbox-right');
        }
      }
    }
  }, {
    key: 'eventShowHandler',
    value: function eventShowHandler(event) {
      event.stopPropagation();
      event.preventDefault();

      this.show();

      if (this.config.event === 'click') {
        var eventClone = new event.constructor(event.type, event);
        this._owner.ownerDocument.dispatchEvent(eventClone);
        this._owner.ownerDocument.addEventListener('click', this.eventHideListener, true);
      }
    }
  }, {
    key: 'eventHideHandler',
    value: function eventHideHandler(event) {
      event.stopPropagation();
      event.preventDefault();

      this.hide();
    }
  }, {
    key: 'removeHintElement',
    value: function removeHintElement() {
      this.deleteTimer = null;
      if (this._element === null) {
        return;
      }

      dom.removeElement(this._element);
      this._element = null;
    }
  }, {
    key: 'remove',
    value: function remove() {
      this.removeHintElement();
      this._removeCurrentListeners();
      this._owner = null;
    }
  }, {
    key: 'config',
    set: function set(value) {
      this._config = extend(true, {}, HintBox.DEFAULT_CONFIG, value);

      if (this._visible) {
        this.reposition();
      }
    },
    get: function get() {
      return extend(true, {}, this._config);
    }
  }, {
    key: 'deleteTimer',
    set: function set(value) {
      if (this._deleteTimer !== null) {
        clearTimeout(this._deleteTimer);
      }

      this._deleteTimer = value;
    },
    get: function get() {
      return this._deleteTimer;
    }
  }, {
    key: 'message',
    set: function set(value) {
      this._message = value;
      if (this._element !== null) {
        this._fillElementMessage();
      }
    },
    get: function get() {
      return this._message;
    }
  }, {
    key: 'event',
    set: function set(value) {
      this._removeCurrentListeners();

      switch (value) {
        case 'click':
          this._owner.addEventListener('click', this.eventShowListener);
          break;
        case 'hover':
          this._owner.addEventListener('mouseenter', this.eventShowListener);
          this._owner.addEventListener('mouseleave', this.eventHideListener);
      }
      this.config.event = value;
    }
  }, {
    key: 'element',
    get: function get() {
      this.deleteTimer = null;
      if (this._element === null) {
        this._element = dom('div', { className: this.config.className });
        this._messageContainer = dom('div', { className: this.config.innerClassName });
        this._element.appendChild(this._messageContainer);
        this._fillElementMessage();
        this._owner.ownerDocument.body.appendChild(this._element);
      }

      return this._element;
    }
  }]);

  return HintBox;
}();

HintBox.DEFAULT_CONFIG = {
  event: 'click',
  className: 'seoquake-hintbox',
  innerClassName: 'seoquake-hintbox-message',
  message: '',
  autoRemove: true,
  inline: false,
  positionFixed: false,
  offset: {
    left: null,
    top: null
  }
};

module.exports = HintBox;

},{"../dom/main":38,"extend":118}],49:[function(require,module,exports){
'use strict';

var dom = require('../dom/main');

module.exports = {
  HintDropdown: HintDropdown,
  defaultCallbackLoaded: false,
  closeAll: closeAll
};

function closeAll() {
  var tips = document.querySelectorAll('[data-role=tips].opened');
  for (var i = 0; i < tips.length; i++) {
    dom.removeClass(tips[i], 'opened');
  }
}

function HintDropdown(element) {
  this.container = element;
  this.openButton = element.querySelector('[data-role=open]');
  this.hintContainer = element.querySelector('[data-role=dropdown]');
  this.closeButton = element.querySelector('[data-role=close]');

  this.openButton.addEventListener('click', this.open.bind(this));
  this.closeButton.addEventListener('click', this.close.bind(this));
  this.hintContainer.querySelector('.content').addEventListener('click', function (e) {
    return e.stopPropagation();
  });
}

HintDropdown.prototype.open = function (e) {
  closeAll();
  if (!module.exports.defaultCallbackLoaded) {
    module.exports.defaultCallbackLoaded = true;
    document.body.addEventListener('click', closeAll);
  }

  dom.addClass(this.container, 'opened');
  e.stopPropagation();
  this.dispatchEvent('open');
};

HintDropdown.prototype.close = function (e) {
  e.stopPropagation();
  closeAll();
  this.dispatchEvent('close');
};

require('common/utils/eventsMixin')(HintDropdown.prototype);

},{"../dom/main":38,"common/utils/eventsMixin":93}],50:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IsEllipsisActive = function () {
  function IsEllipsisActive(element, config) {
    _classCallCheck(this, IsEllipsisActive);

    config = config || {};

    if (!(element instanceof HTMLElement)) {
      throw new Error('Element should be valid HTMLElement');
    }

    this.element = element;

    var extend = require('extend');
    this.config = extend(true, {
      watch: true
    }, config);
    require('common/utils/eventsMixin')(this);
    this._observer = null;
    this._watch = false;
    this.mutationListener = this.mutationHandler.bind(this);
    this.watch = this.config.watch;
    this.mutationHandler();
  }

  _createClass(IsEllipsisActive, [{
    key: 'mutationHandler',
    value: function mutationHandler(mutations) {
      if (!this._watch) {
        return;
      }

      if (this.active) {
        this.dispatchEvent('active', null, true);
      } else {
        this.dispatchEvent('inactive', null, true);
      }
    }
  }, {
    key: 'active',
    get: function get() {
      var result = false;
      var clone = this.element.cloneNode(true);
      clone.style.visibility = 'hidden';
      clone.style.position = 'fixed';
      clone.style.overflowX = 'visible';
      clone.style.width = 'auto';
      this.element.parentNode.insertBefore(clone, this.element);
      if (clone.offsetWidth > this.element.offsetWidth) {
        result = true;
      }

      return result;
    }
  }, {
    key: 'watch',
    set: function set(value) {
      if (value) {
        if (this._observer === null) {
          this._observer = new MutationObserver(this.mutationListener);
        }

        this._observer.observe(this.element, {
          characterData: true
        });
        this._watch = true;
      } else {
        if (this._watch) {
          if (this._observer !== null) {
            this._observer.disconnect();
          }
        }

        this._watch = false;
      }
    },
    get: function get() {
      return this.config.watch;
    }
  }]);

  return IsEllipsisActive;
}();

module.exports = IsEllipsisActive;

},{"common/utils/eventsMixin":93,"extend":118}],51:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventsMixin = require('../utils/eventsMixin');

var MenuHighlighter = function () {
  function MenuHighlighter(element) {
    var _this = this;

    _classCallCheck(this, MenuHighlighter);

    this.element = element;

    this.activeElement = document.createElement('div');
    this.activeElement.setAttribute('class', 'menu-highlight');
    this.element.appendChild(this.activeElement);
    this._clickListener = this.clickHandler.bind(this);
    this.element.addEventListener('click', this._clickListener);

    this._isReady = false;
    this._readyResolve = null;
    this._ready = new Promise(function (resolve) {
      _this._readyResolve = resolve;
    });

    this.highlight();

    this.processWindowResize = this.handleWindowResize.bind(this);
    window.addEventListener('resize', this.processWindowResize);
  }

  _createClass(MenuHighlighter, [{
    key: 'highlight',
    value: function highlight() {
      var activeItem = this.element.querySelector('a.active');
      var position = activeItem.offsetLeft;
      var width = activeItem.offsetWidth;
      this.activeElement.style.left = position + 'px';
      this.activeElement.style.width = width + 'px';
      this.dispatchEvent('switch', activeItem, true);

      if (!this._isReady) {
        this._isReady = true;
        this._readyResolve();
      }
    }
  }, {
    key: 'clickHandler',
    value: function clickHandler(e) {
      if (e.target.nodeName === 'A') {
        var rel = e.target.getAttribute('rel');
        if (rel !== '' && rel !== 'undefined' && rel !== null) {
          this.element.querySelector('a.active').setAttribute('class', '');
          e.target.setAttribute('class', 'active');
          this.highlight();
          this.dispatchEvent('click', e);
        }
      }
    }
  }, {
    key: 'clickElement',
    value: function clickElement(href) {
      var link = this.element.querySelector('a[href="' + href + '"]');
      if (link) {
        var clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true
        });
        link.dispatchEvent(clickEvent);
      }

      return link;
    }
  }, {
    key: 'handleWindowResize',
    value: function handleWindowResize() {
      this.highlight();
    }
  }, {
    key: 'ready',
    get: function get() {
      return this._ready;
    }
  }]);

  return MenuHighlighter;
}();

eventsMixin(MenuHighlighter.prototype);

module.exports = MenuHighlighter;

},{"../utils/eventsMixin":93}],52:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dom = require('../dom/main');
var extend = require('extend');
var overlayLib = require('./Overlay.js');
var ScrollBlock = require('./ScrollBlock');

var MessageWindow = function () {
  function MessageWindow(container, config) {
    _classCallCheck(this, MessageWindow);

    this._config = extend(true, {}, MessageWindow.DEFAULT_CONFIG, config);
    this._container = null;
    this._buttons = new Map();
    this._element = null;
    this._header = null;
    this._body = null;
    this._buttonsContainer = null;
    this.defaultWidth = this.config.width;
    this.defaultHeight = this.config.height;
    this.overlay = null;
    this._visible = false;
    this._scroll = null;
    if (container !== undefined) {
      this.container = container;
    } else {
      this.container = document.body;
    }

    if (!dom.hasClass(this.container, 'message-container')) {
      dom.addClass(this.container, 'message-container');
    }

    this._init = false;

    this.processWindowResize = this.handleWindowResize.bind(this);

    if (this.config.autoInit) {
      this.init();
    }
  }

  _createClass(MessageWindow, [{
    key: 'init',
    value: function init() {
      this._element = dom('div', { className: 'message message-super hidden' });
      this._header = dom('div', { className: 'message-header' }, '');
      this._element.appendChild(this._header);
      this._body = dom('div', { className: 'message-body' });
      this._element.appendChild(this._body);
      this._scroll = new ScrollBlock(this._body);
      this._body = this._scroll.container;
      this._buttonsContainer = dom('div', { className: 'message-buttons' });
      this._buttons.clear();

      this.element.appendChild(this.buttonsContainer);
      this.container.appendChild(this.element);
      window.addEventListener('resize', this.processWindowResize);
      this._init = true;
    }
  }, {
    key: 'addButton',
    value: function addButton(id, title, className) {
      className = className || 'sqbtn';

      if (this._buttons.has(id)) {
        return this._buttons.get(id);
      }

      var button = dom('button', { className: className }, title);

      this._buttons.set(id, button);
      this.buttonsContainer.appendChild(button);
      this.resize();
      return button;
    }
  }, {
    key: 'getButton',
    value: function getButton(id) {
      if (this._buttons.has(id)) {
        return this._buttons.get(id);
      }

      return null;
    }
  }, {
    key: 'resize',
    value: function resize() {
      if (!this._visible) {
        return;
      }

      var height = 500;
      var headerHeight = this.header.offsetHeight;
      var buttonsHeight = this.buttonsContainer.offsetHeight;
      var bodyHeight = Math.max(height - (headerHeight + buttonsHeight), 100);
      height = bodyHeight + headerHeight + buttonsHeight;

      if (height + this.element.offsetTop > window.innerHeight) {
        height = window.innerHeight;
        bodyHeight = Math.max(height - (headerHeight + buttonsHeight), 100);
        dom.css(this.element, 'top', 0 + 'px');
      } else {
        if (window.innerHeight > 500) {
          dom.css(this.element, 'top', (window.innerHeight - height) / 2 + 'px');
        } else {
          height = window.innerHeight;
          bodyHeight = Math.max(height - (headerHeight + buttonsHeight), 100);
          dom.css(this.element, 'top', 0 + 'px');
        }
      }

      if (this.element.offsetWidth > window.innerWidth) {
        dom.css(this.element, 'width', window.innerWidth + 'px');
        dom.css(this.element, 'left', 0 + 'px');
      } else {
        if (window.innerWidth > this.defaultWidth) {
          dom.css(this.element, 'width', this.defaultWidth + 'px');
          dom.css(this.element, 'left', (window.innerWidth - this.element.offsetWidth) / 2 + 'px');
        } else {
          dom.css(this.element, 'width', window.innerWidth + 'px');
          dom.css(this.element, 'left', 0 + 'px');
        }
      }

      dom.css(this.element, 'height', height + 'px');
      this._scroll.height = bodyHeight;
    }
  }, {
    key: 'setContent',
    value: function setContent(content) {
      dom.setContent(this.body, content);
      if (content instanceof Node) {
        if (content.offsetWidth > this.body.offsetWidth) {
          this.defaultWidth = content.offsetWidth + 20;
          this.resize();
        }
      }
    }
  }, {
    key: 'setTitle',
    value: function setTitle(title) {
      dom.text(this.header, title);
    }
  }, {
    key: 'show',
    value: function show() {
      var _this = this;

      if (this._visible) {
        return;
      }

      if (this._config.withOverlay) {
        overlayLib.showLoading(this.container, true);
      }

      dom.removeClass(this.element, 'hidden');
      this._visible = true;
      dom.css(this.element, 'opacity', '0');
      dom.css(this.element, 'top', '0px');
      dom.css(this.element, 'left', '0px');

      Array.from(this.body.children).forEach(function (item) {
        if (item instanceof Node && item.offsetWidth + 20 > _this.defaultWidth) {
          _this.defaultWidth = item.offsetWidth + 20;
        }
      });

      this.resize();
      dom.css(this.element, 'opacity', '1');
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (!this._visible) {
        return;
      }

      if (this._config.withOverlay) {
        overlayLib.hideLoading(this.container);
      }

      dom.addClass(this.element, 'hidden');
      this._visible = false;
    }
  }, {
    key: 'removeButtons',
    value: function removeButtons() {
      this._buttons.forEach(function (button) {
        return dom.removeElement(button);
      });
      this._buttons.clear();
    }
  }, {
    key: 'close',
    value: function close() {
      window.removeEventListener('resize', this._resizeListener);
      this._visible = true;
      this.hide();

      this._buttons.forEach(function (button) {
        return dom.removeElement(button);
      });
      this._buttons.clear();

      dom.removeElement(this.element);
      dom.removeClass(this.container, 'message-container');

      this._element = null;
      this._body = null;
      this._header = null;
      this._buttonsContainer = null;
    }
  }, {
    key: 'handleWindowResize',
    value: function handleWindowResize(event) {
      this.resize();
    }
  }, {
    key: 'element',
    get: function get() {
      return this._element;
    }
  }, {
    key: 'header',
    get: function get() {
      return this._header;
    }
  }, {
    key: 'body',
    get: function get() {
      return this._body;
    }
  }, {
    key: 'buttonsContainer',
    get: function get() {
      return this._buttonsContainer;
    }
  }, {
    key: 'config',
    get: function get() {
      return this._config;
    }
  }, {
    key: 'container',
    get: function get() {
      return this._container;
    },
    set: function set(element) {
      if (!(element instanceof Node)) {
        throw new TypeError('element should be DOM Node');
      }

      if (this._container !== null) {
        dom.removeClass(this._container, this._config.containerClassName);
      }

      this._container = element;

      if (!dom.hasClass(this._container, this._config.containerClassName)) {
        dom.addClass(this._container, this._config.containerClassName);
      }

      if (this._element !== null) {
        this._container.appendChild(this._element);
      }
    }
  }, {
    key: 'height',
    set: function set(value) {
      this.defaultHeight = value;
      this.resize();
    },
    get: function get() {
      return this.defaultHeight;
    }
  }]);

  return MessageWindow;
}();

MessageWindow.DEFAULT_CONFIG = {
  width: 600,
  height: 'auto',
  withOverlay: true,
  autoInit: true,
  containerClassName: 'message-container'
};

module.exports = MessageWindow;

},{"../dom/main":38,"./Overlay.js":53,"./ScrollBlock":54,"extend":118}],53:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dom = require('../dom/main');
var FloatPanel = require('./FloatPanel');

var Overlay = function () {
  function Overlay(element, config) {
    _classCallCheck(this, Overlay);

    config = require('extend')(true, {
      progress: 0,
      className: 'overlay',
      containerClassName: 'overlay-container',
      progressClassName: 'overlay-progress',
      floatTop: false,
      floatPadding: 0
    }, config);

    this._config = config;

    if (element !== undefined) {
      this.container = element;
    } else {
      this.container = document.querySelector('body');
    }

    if (!dom.hasClass(this.container, this._config.containerClassName)) {
      dom.addClass(this.container, this._config.containerClassName);
      this._element = null;
    } else {
      this._element = this.container.querySelector(this.classSelector);
      this._progressElement = this.container.querySelector(this.classSelector + ' > ' + this.progressClassSelector);
    }

    this._progress = 0;
    this._visible = false;
    this._float = null;

    this.init();
    this.progress = this._config.progress;
  }

  _createClass(Overlay, [{
    key: 'init',
    value: function init() {
      if (this._element !== null) {
        this._visible = !dom.hasClass(this._element, 'hidden');
        return;
      }

      this._element = dom('div', { className: this._config.className });
      dom.addClass(this._element, 'hidden');
      this.container.appendChild(this._element);

      this._progressElement = dom('div', { className: this._config.progressClassName });
      this._element.appendChild(this._progressElement);
    }
  }, {
    key: 'show',
    value: function show() {
      if (!this._visible) {
        dom.removeClass(this._element, 'hidden');
        this._visible = true;
      }
    }
  }, {
    key: 'hide',
    value: function hide() {
      if (this._visible) {
        dom.addClass(this._element, 'hidden');
        this._visible = false;
      }
    }
  }, {
    key: 'remove',
    value: function remove() {
      if (this._element !== null && this._element.parentNode) {
        dom.removeElement(this._element);
        dom.removeClass(this.container, this._config.containerClassName);
        this._element = null;
        this._progressElement = null;
        this._visible = false;
      }
    }
  }, {
    key: 'classSelector',
    get: function get() {
      return '.' + this._config.className.replace(' ', '.');
    }
  }, {
    key: 'progressClassSelector',
    get: function get() {
      return '.' + this._config.progressClassName.replace(' ', '.');
    }
  }, {
    key: 'progress',
    set: function set(value) {
      if (value <= 100 && value >= 0) {
        this._progress = value;
      }

      if (this.visible) {
        dom.css(this._progressElement, 'width', this._progress.toFixed(2) + '%');
      }
    },
    get: function get() {
      return this._progress;
    }
  }, {
    key: 'floatTop',
    set: function set(value) {
      if (this._element === null) {
        return;
      }

      if (value === true) {
        if (this._float === null) {
          this._float = new FloatPanel(this._progressElement);
        }
      } else {
        if (this._float !== null) {
          this._float.remove();
          this._float = null;
        }
      }
    },
    get: function get() {
      return this._float !== null;
    }
  }, {
    key: 'floatPadding',
    set: function set(value) {
      if (this.floatTop) {
        this._float.paddingTop = value;
      }
    },
    get: function get() {
      if (this.floatTop) {
        return this._float.paddingTop;
      }

      return 0;
    }
  }, {
    key: 'visible',
    set: function set(value) {
      if (value === true) {
        this.show();
      } else {
        this.hide();
      }
    },
    get: function get() {
      return this._visible;
    }
  }]);

  return Overlay;
}();

exports.Overlay = Overlay;
exports.showLoading = function (container, isSuper) {
  var config = isSuper ? { className: 'overlay overlay-super' } : {};
  var overlay = new Overlay(container, config);
  overlay.show();
};

exports.hideLoading = function (container) {
  var overlay = new Overlay(container);
  overlay.remove();
};

exports.progress = function (container, value) {
  var overlay = new Overlay(container);
  overlay.progress = value;
};

},{"../dom/main":38,"./FloatPanel":47,"extend":118}],54:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dom = require('../dom/main');
var extend = require('extend');
var ignore = require('../lib/ignore');
var Draggable = require('./Draggable');

var ScrollBlock = function () {
  function ScrollBlock(element, config) {
    _classCallCheck(this, ScrollBlock);

    if (!(element instanceof HTMLElement)) {
      throw new DOMError('element should be HTMLElement');
    }

    this._config = extend(true, {}, ScrollBlock.DEFAULT_CONFIG, config);
    this._element = element;
    this._scroll = null;
    this._container = null;
    this._bar = null;
    this._fadeTop = null;
    this._fadeBottom = null;
    this._observer = null;
    this._initialHeight = null;
    this._showScroll = false;
    this._isInit = false;

    this._barDrag = null;

    this._processElementChange = this._handleElementChange.bind(this);
    this._processElementMouseEnter = this._handleElementMouseEnter.bind(this);
    this._processElementMouseLeave = this._handleElementMouseLeave.bind(this);
    this._processElementMouseScroll = this._handleElementMouseScroll.bind(this);
    this._processDragMove = this._handleDragMove.bind(this);

    if (this._config.autoInit) {
      this.init();
    }
  }

  _createClass(ScrollBlock, [{
    key: 'init',
    value: function init() {
      var _this = this;

      if (dom.hasClass(this._element, this._config.classPrefix + 'content')) {
        this._container = this._element.querySelector('.' + this._config.classPrefix + 'container');
        this._scroll = this._element.querySelector('.' + this._config.classPrefix + 'scroll');
        this._bar = this._element.querySelector('.' + this._config.classPrefix + 'scroll-bar');
        this._initialHeight = dom.data(this._element, 'sqscrollheight');
      } else {
        dom.addClass(this._element, this._config.classPrefix + 'content');
        this._container = dom('div', { className: this._config.classPrefix + 'container' });
        Array.from(this._element.children).forEach(function (el) {
          return _this._container.appendChild(el);
        });
        this._element.appendChild(this._container);
        this._bar = dom('div', { className: this._config.classPrefix + 'scroll-bar' });
        this._scroll = dom('div', { className: this._config.classPrefix + 'scroll' }, this._bar);
        this._element.appendChild(this._scroll);
        this._initialHeight = this._element.offsetHeight;
        dom.data(this._element, 'sqscrollheight', this._initialHeight);
      }

      this._barDrag = new Draggable(this._bar);
      this._barDrag.addEventListener('down', function () {
        return dom.addClass(_this._element, _this._config.classPrefix + 'unselectable');
      });
      this._barDrag.addEventListener('move', this._processDragMove);
      this._barDrag.addEventListener('up', function () {
        return dom.removeClass(_this._element, _this._config.classPrefix + 'unselectable');
      });

      dom.css(this._element, 'height', this._initialHeight + 'px');
      this._element.addEventListener('mouseenter', this._processElementMouseEnter);
      this._element.addEventListener('mouseleave', this._processElementMouseLeave);
      this._element.addEventListener('wheel', this._processElementMouseScroll);

      this._observer = new MutationObserver(this._processElementChange);
      this._observer.observe(this._container, { childList: true, subtree: true });
      this._isInit = true;
    }
  }, {
    key: 'scroll',
    value: function scroll(delta) {
      var currentScroll = this._container.scrollTop;
      currentScroll = Math.min(currentScroll + delta, this._container.scrollHeight);
      this._container.scrollTop = currentScroll;
      this.renderScrollBar();
    }
  }, {
    key: 'scrollUp',
    value: function scrollUp() {
      this.scroll(-this._config.scrollStep);
    }
  }, {
    key: 'scrollDown',
    value: function scrollDown() {
      this.scroll(this._config.scrollStep);
    }
  }, {
    key: 'renderScrollBar',
    value: function renderScrollBar() {
      try {
        var contentHeight = this._container.scrollHeight;
        var containerHeight = this._container.clientHeight;
        if (contentHeight > containerHeight && containerHeight > 0 && contentHeight > 0) {
          this._showScroll = true;
          var style = window.getComputedStyle(this._bar);
          var barLength = containerHeight - dom.px(style.marginTop) - dom.px(style.marginBottom);
          var barHeight = Math.max(Math.round(containerHeight / contentHeight * barLength), dom.px(style.minHeight));
          var currentScroll = this._container.scrollTop;
          var barTop = Math.round(currentScroll / contentHeight * barLength);
          dom.css(this._bar, {
            height: barHeight + 'px',
            top: barTop + 'px'
          });
        } else {
          this._showScroll = false;
        }
      } catch (error) {
        ignore(error);
      }
    }
  }, {
    key: '_handleElementMouseEnter',
    value: function _handleElementMouseEnter(event) {
      if (!this._showScroll) {
        return;
      }

      dom.css(this._bar, 'visibility', 'visible');
    }
  }, {
    key: '_handleElementMouseLeave',
    value: function _handleElementMouseLeave(event) {
      dom.css(this._bar, 'visibility', 'hidden');
    }
  }, {
    key: '_handleElementChange',
    value: function _handleElementChange(mutations) {
      this.renderScrollBar();
    }
  }, {
    key: '_handleElementMouseScroll',
    value: function _handleElementMouseScroll(event) {
      if (!this._showScroll) {
        return;
      }

      if (event.deltaY > 0) {
        this.scrollDown();
      } else if (event.deltaY < 0) {
        this.scrollUp();
      }

      event.stopPropagation();
      event.preventDefault();
    }
  }, {
    key: '_handleDragMove',
    value: function _handleDragMove(delta) {
      try {
        var contentHeight = this._container.scrollHeight;
        var containerHeight = this._container.clientHeight;
        this.scroll(Math.round(-delta.top * contentHeight / containerHeight));
      } catch (error) {
        ignore(error);
      }
    }
  }, {
    key: 'remove',
    value: function remove() {
      var _this2 = this;

      if (!this._isInit) {
        return;
      }

      this._observer.disconnect();

      Array.from(this._container.children).forEach(function (el) {
        return _this2._element.appendChild(el);
      });

      this._element.removeEventListener('mouseenter', this._processElementMouseEnter);
      this._element.removeEventListener('mouseleave', this._processElementMouseLeave);

      dom.removeElement(this._container);
      this._container = null;

      this._barDrag.remove();
      dom.removeElement(this._bar);
      this._bar = null;
      dom.removeElement(this._scroll);
      this._scroll = null;

      dom.css(this._element, 'height', this._initialHeight + 'px');
      this._initialHeight = null;

      this._isInit = false;
    }
  }, {
    key: 'height',
    set: function set(value) {
      dom.css(this._element, 'height', value + 'px');
      this.renderScrollBar();
    },
    get: function get() {
      return parseInt(dom.css(this._element, 'height'));
    }
  }, {
    key: 'contentHeight',
    get: function get() {
      return this._container.scrollHeight;
    }
  }, {
    key: 'container',
    get: function get() {
      return this._container;
    }
  }]);

  return ScrollBlock;
}();

ScrollBlock.DEFAULT_CONFIG = {
  classPrefix: 'sqsll-',
  show: 'hover',
  scrollStep: 20,
  autoInit: true
};

module.exports = ScrollBlock;

},{"../dom/main":38,"../lib/ignore":64,"./Draggable":46,"extend":118}],55:[function(require,module,exports){
'use strict';

var dom = require('../dom/main');
var extend = require('extend');

module.exports = {
  SlidePanel: SlidePanel
};

function SlidePanel(element) {
  this.element = element;
  dom.addClass(this.element, 'slidePanel');
  this.currentHeight = element.offsetHeight;
  this.hideElement = element.querySelector('[data-role=close]');
  this.showElement = element.querySelector('[data-role=show]');
  this.hideHeight = element.getAttribute('data-hide') || 14;
  this.update();
  this.hideElement.addEventListener('click', this.hideClick.bind(this));
  this.showElement.addEventListener('click', this.showClick.bind(this));
}

SlidePanel.prototype.update = function () {
  if (this.currentHeight > this.hideHeight) {
    dom.addClass(this.element, 'hideContent');
  }
};

SlidePanel.prototype.showClick = function (e) {
  dom.removeClass(this.element, 'hideContent');
};

SlidePanel.prototype.hideClick = function (e) {
  dom.addClass(this.element, 'hideContent');
};

},{"../dom/main":38,"extend":118}],56:[function(require,module,exports){
'use strict';

var NormalizeColumnsMixin = {
  normalizeColumns: function normalizeColumns(columnsAvailable) {
    var columnsSorted = columnsAvailable.slice().sort(function (a, b) {
      return b.length - a.length;
    });
    switch (columnsAvailable.length) {
      case 3:
        if (!(columnsSorted[0].length === columnsSorted[1].length && columnsSorted[1].length === columnsSorted[2].length)) {
          columnsSorted[0].columns = 2;
        }

        break;
      case 2:
        if (columnsSorted[0].length >= columnsSorted[1].length * 2) {
          columnsSorted[0].columns = 3;
          columnsSorted[1].columns = 1;
        } else {
          columnsSorted[0].columns = 2;
          columnsSorted[1].columns = 2;
        }

        break;
      case 1:
        columnsAvailable[0].columns = Math.min(4, columnsAvailable[0].length);
        break;
    }

    return columnsAvailable;
  }
};

module.exports = function noramlizeColumnsMixin(obj) {
  obj.normalizeColumns = NormalizeColumnsMixin.normalizeColumns;
};

},{}],57:[function(require,module,exports){
'use strict';

var dom = require('../dom/main');

module.exports = function updateContainerHeight() {
  var header = document.querySelector('body > header');
  var main = document.querySelector('body > main');
  var footer = document.querySelector('body > footer');
  var headerFooterHeight = header.offsetHeight + footer.offsetHeight;
  dom.css(main, 'min-height', window.innerHeight - headerFooterHeight + 'px');
  var panel = document.querySelector('.panel-visible');
  if (panel && panel.offsetHeight < main.offsetHeight) {
    dom.css(panel, 'min-height', main.offsetHeight + 'px');
  }
};

},{"../dom/main":38}],58:[function(require,module,exports){
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

},{}],59:[function(require,module,exports){
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

},{}],60:[function(require,module,exports){
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

},{}],61:[function(require,module,exports){
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

},{"./isArray":66}],62:[function(require,module,exports){
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

},{}],63:[function(require,module,exports){
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
},{}],64:[function(require,module,exports){
'use strict';

module.exports = function ignore(reason) {
  console.log(reason);
};

},{}],65:[function(require,module,exports){
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

},{}],66:[function(require,module,exports){
'use strict';

module.exports = function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

},{}],67:[function(require,module,exports){
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

},{}],68:[function(require,module,exports){
'use strict';

module.exports = function isFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]';
};

},{}],69:[function(require,module,exports){
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

},{}],70:[function(require,module,exports){
'use strict';

module.exports = function isString(value) {
  return value instanceof String || typeof value === 'string';
};

},{}],71:[function(require,module,exports){
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

},{}],72:[function(require,module,exports){
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

},{"./isEmpty":67}],73:[function(require,module,exports){
'use strict';

var hexMd5 = require('../hex-md5');

module.exports = function shortHash(input) {
  return hexMd5(input).substr(0, 8);
};

},{"../hex-md5":59}],74:[function(require,module,exports){
'use strict';

module.exports = function startsWith(string, pattern) {
  if (string === undefined || string === null || !string.indexOf) {
    return false;
  }

  return string.indexOf(pattern) === 0;
};

},{}],75:[function(require,module,exports){
'use strict';

module.exports = function trimHash(url) {
  var result = url;
  var hashPosition = url.indexOf('#');
  if (hashPosition !== -1) {
    result = url.substring(0, hashPosition);
  }

  return result;
};

},{}],76:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BasePlugin = require('../BasePlugin');
var moduleMixin = require('./moduleMixin');
var quickTmixin = require('../utils/quickTmixin');
var messengerTranslateMixin = require('../utils/messengerTranslateMixin');

var BaseModule = function (_BasePlugin) {
  _inherits(BaseModule, _BasePlugin);

  function BaseModule() {
    _classCallCheck(this, BaseModule);

    return _possibleConstructorReturn(this, (BaseModule.__proto__ || Object.getPrototypeOf(BaseModule)).apply(this, arguments));
  }

  _createClass(BaseModule, [{
    key: 'findByRole',
    value: function findByRole(role) {
      return Array.from(this.container.querySelectorAll('[data-role="' + role + '"]'));
    }
  }]);

  return BaseModule;
}(BasePlugin);

quickTmixin(BaseModule.prototype);
moduleMixin(BaseModule.prototype);
messengerTranslateMixin(BaseModule.prototype);

module.exports = BaseModule;

},{"../BasePlugin":6,"../utils/messengerTranslateMixin":97,"../utils/quickTmixin":99,"./moduleMixin":78}],77:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lib = require('../Lib');
var dom = require('../dom/main');
var CreateFileName = require('../utils/CreateFilename');
var LinksListPlugin = require('../LinksListPlugin');
var RequestUrl = require('../RequestUrl.js').RequestUrl;
var ConfigureWindow = require('../parameters/ConfigureWindow');
var Overlay = require('../effects/Overlay').Overlay;
var moduleMixin = require('./moduleMixin');
var messengerTranslateMixin = require('../utils/messengerTranslateMixin');
var ignore = require('../lib/ignore');

var LinkInfoBase = function (_LinksListPlugin) {
  _inherits(LinkInfoBase, _LinksListPlugin);

  function LinkInfoBase(container) {
    _classCallCheck(this, LinkInfoBase);

    var _this = _possibleConstructorReturn(this, (LinkInfoBase.__proto__ || Object.getPrototypeOf(LinkInfoBase)).call(this));

    _this.parametersGrouped = {};
    _this.overlay = new Overlay(container);
    _this._buttonConfigure = container.querySelector('[data-role="button-configure"]');
    _this._buttonConfigure.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      _this.registerEvent(_this.name, 'addHideParameters');
      _this.processConfigure();
    });
    return _this;
  }

  _createClass(LinkInfoBase, [{
    key: 'processConfigure',
    value: function processConfigure() {
      var _this2 = this;

      var win = new ConfigureWindow(undefined, { module: this.name });
      win.setTranslateFunction(this.t.bind(this));
      win.init();
      win.addEventListener('setConfiguration', function (parameters) {
        _this2.registerEvent(_this2.name, 'setParametersConfiguration');
        _this2.setParameters(parameters).then(function () {
          return _this2.getPluginParameters();
        }).then(function (parameters) {
          _this2.parameters = parameters;
          _this2.overlay.show();
          _this2.processData();
        });
      });
      this.getParameters().then(function (parameters) {
        win.parameters = parameters;
        win.show();
      });
    }
  }, {
    key: 'allParametersReadyHandler',
    value: function allParametersReadyHandler() {
      if (this.configuration.mode === lib.SEOQUAKE_MODE_BY_REQUEST) {
        var requestButton = this.container.querySelector('[data-role="button-request"]');
        if (requestButton) {
          dom.attr(requestButton, 'disabled', true);
        }
      }

      this.overlay.hide();
    }
  }, {
    key: 'saveAsCSVHandler',
    value: function saveAsCSVHandler(event) {
      var _this3 = this;

      event.preventDefault();
      event.stopPropagation();

      var button = event.currentTarget;
      var filenameGenerator = new CreateFileName(this.getMessenger(), this.searchQuery + ' - ' + this.type);

      return filenameGenerator.filename.then(function (filename) {
        dom.attr(button, 'disabled', true);
        var data = [_this3.getHeadersLine().join(';'), _this3.getDataLines().join('\n')].join('\n');

        if ('chrome' === 'firefox') {
          return browser.downloads.download({
            filename: filename,
            url: URL.createObjectURL(new Blob([data], { type: 'text/plain' }))
          }).then(function () {
            _this3.registerEvent(_this3.name, 'saveResultToFile');
            dom.attr(button, 'disabled', null);
          }).catch(function (e) {
            return console.log(e);
          });
        } else {
          var url = window.URL || window.mozURL;
          var a = dom('a', {
            download: filename,
            target: '_blank',
            href: url.createObjectURL(new Blob([data], { type: 'text/plain' }))
          });
          if ('chrome' === 'safari') {
            a.href = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(data);
          } else {
            a.dataset.downloadurl = ['csv', a.download, a.href].join(':');
          }

          a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          _this3.registerEvent(_this3.name, 'saveResultToFile');
          dom.attr(button, 'disabled', null);
        }
      }).catch(function (e) {
        return console.log(e);
      });
    }
  }, {
    key: 'updateRowHeader',
    value: function updateRowHeader(paramIds) {
      if (!lib.isArray(paramIds)) {
        paramIds = [paramIds];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = paramIds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var paramId = _step.value;

          var headerCell = this.container.querySelector('th[rel="' + paramId + '"]');
          if (dom.hasClass(headerCell, 'getAll')) {
            var dataCells = Array.prototype.slice.call(this.container.querySelectorAll('td > a[rel$="_' + paramId + '"]'));
            var shouldUpdate = true;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = dataCells[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var cellElement = _step2.value;

                if ([lib.SEOQUAKE_RESULT_WAIT, lib.SEOQUAKE_RESULT_QUESTION, lib.SEOQUAKE_RESULT_ERROR].indexOf(dom.attr(cellElement, 'data-value')) !== -1) {
                  shouldUpdate = false;
                  break;
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

            if (shouldUpdate) {
              headerCell.removeEventListener('click', this.requestParameterColumnListener);
              headerCell.addEventListener('click', this.sortColumnListener);
              dom.removeClass(headerCell, 'getAll');
              dom.removeClass(headerCell, 'active');
              dom.addClass(headerCell, 'sortable');
            }
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
    }
  }, {
    key: 'createParameterCell',
    value: function createParameterCell(urlHash, param) {
      var cell = dom('TD', { className: 'seoquake-params-cell', title: param.name });
      var theHref = '';
      var theRel = '';

      if ('url-r' in param) {
        var requestUrl = new RequestUrl(this, param, this.urls[urlHash]);
        if ('matches' in param) {
          if (!this.requestUrlsMap.has(requestUrl.requestUrlHash)) {
            this.requestUrlsMap.set(requestUrl.requestUrlHash, requestUrl);
          } else {
            requestUrl = this.requestUrlsMap.get(requestUrl.requestUrlHash);
          }

          if ('url-s' in param) {
            requestUrl.addURLSource(param);
          }

          if ('url-na' in param) {
            requestUrl.addURLNa(param);
          }

          requestUrl.addParamId(param);
          theHref = '#';
        } else {
          theHref = requestUrl.requestUrl;
        }

        theRel = urlHash + ' ' + requestUrl.requestUrlHash + '_' + param.id;
      }

      var link = dom('A', { href: theHref, rel: theRel, target: '_blank' });

      if (!('matches' in param)) {
        dom.text(link, param.title);
        link.addEventListener('click', this.showParameterSourceListener, true);
      } else {
        dom.addClass(link, 'seoquake-params-link');
        this.totalParameters++;
      }

      cell.appendChild(link);
      return cell;
    }
  }, {
    key: '_renderLinks',
    value: function _renderLinks(paramId, value, href, links, updatedParameters, urlNa) {
      var parameterReady = false;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = links[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var link = _step3.value;

          dom.attr(link, 'data-value', value);

          switch (value) {

            case lib.SEOQUAKE_RESULT_NODATA:
              link.href = urlNa || href;
              link.removeEventListener('click', this.requestParameterListener, true);
              link.removeEventListener('click', this.preventDefaultListener, true);
              dom.text(link, 'n/a');
              updatedParameters.push(paramId);
              parameterReady = true;
              break;

            case lib.SEOQUAKE_RESULT_ERROR:
              link.href = href;
              link.style.color = 'red';
              var errorCounter = 0;
              if (dom.hasAttr(link, 'data-error-counter')) {
                errorCounter = dom.attr(link, 'data-error-counter');
                dom.attr(link, 'data-error-counter', errorCounter + 1);
              } else {
                errorCounter = 1;
                dom.attr(link, 'data-error-counter', 1);
              }

              link.removeEventListener('click', this.preventDefaultListener, true);
              link.removeEventListener('click', this.requestParameterListener, true);
              if (errorCounter < 2) {
                link.addEventListener('click', this.requestParameterListener, true);
                dom.attr(link, 'data-value', lib.SEOQUAKE_RESULT_QUESTION);
              } else {
                updatedParameters.push(paramId);
                parameterReady = true;
              }

              dom.text(link, 'error');
              break;

            case lib.SEOQUAKE_RESULT_QUESTION:
              link.href = '#';
              link.removeEventListener('click', this.preventDefaultListener, true);
              link.removeEventListener('click', this.requestParameterListener, true);
              link.addEventListener('click', this.requestParameterListener, true);
              dom.setContent(link, dom('i', { className: 'icon load' }));
              break;

            case lib.SEOQUAKE_RESULT_WAIT:
              link.href = '#';
              link.removeEventListener('click', this.requestParameterListener, true);
              link.addEventListener('click', this.preventDefaultListener, true);
              dom.addClass(link, 'active');
              dom.setContent(link, dom('i', { className: 'icon load' }));
              break;

            case lib.SEOQUAKE_RESULT_YES:
            default:
              link.href = href;
              link.removeEventListener('click', this.requestParameterListener, true);
              link.removeEventListener('click', this.preventDefaultListener, true);
              link.addEventListener('click', this.showParameterSourceListener, true);
              dom.text(link, this.entities.decode(value));
              updatedParameters.push(paramId);
              parameterReady = true;
              break;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      if (parameterReady) {
        this.readyParameters++;
      }
    }
  }, {
    key: 'getHeadersLine',
    value: function getHeadersLine() {
      var tpl = '"%s"';
      var line = [];

      line.push(tpl.replace('%s', '#'));
      line.push(tpl.replace('%s', 'Url'));
      if (this.showNoFollow) {
        line.push(tpl.replace('%s', 'No-follow'));
      }

      for (var groupId in this.parametersGrouped) {
        if (this.parametersGrouped.hasOwnProperty(groupId)) {
          for (var parameterId in this.parametersGrouped[groupId]) {
            if (this.parametersGrouped[groupId].hasOwnProperty(parameterId) && this.parameters.hasOwnProperty(parameterId)) {
              var parameter = this.parameters[parameterId];
              if (!parameter.hasOwnProperty('matches')) {
                continue;
              }

              line.push(tpl.replace('%s', parameter.name.replace(/"/g, '""')));
            }
          }
        }
      }

      return line;
    }
  }, {
    key: 'getDataLines',
    value: function getDataLines() {
      var _this4 = this;

      var tpl = '"%s"';
      var rows = Array.from(this.table.tBodies[0].rows);
      var data = [];
      var value = void 0;

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = rows[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var row = _step4.value;

          var line = [];
          line.push(dom.text(row.cells[0]));
          line.push(dom.attr(row.cells[1].querySelector('a'), 'href'));
          for (var i = 2; i < row.cells.length; i++) {
            var link = row.cells[i].querySelector('a.seoquake-params-link');
            if (link !== null) {
              line.push(dom.attr(link, 'data-value'));
            }
          }

          line.forEach(function (value, index, array) {
            return array[index] = tpl.replace('%s', _this4.entities.decode(value).replace(/"/g, '""'));
          });
          data.push(line.join(';'));
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return data;
    }
  }, {
    key: 'createParametersGroups',
    value: function createParametersGroups() {
      this.parametersGrouped = {
        page: {},
        domain: {},
        backlinks: {},
        other: {}
      };

      for (var paramId in this.parameters) {
        if (!this.parameters.hasOwnProperty(paramId)) {
          continue;
        }

        if (this.parametersGrouped.hasOwnProperty(this.parameters[paramId].type)) {
          this.parametersGrouped[this.parameters[paramId].type][paramId] = this.parameters[paramId];
        }
      }
    }
  }, {
    key: 'parseRelAttr',
    value: function parseRelAttr(rel, skipInnerCheck) {
      var reg = /^([0-9a-f]+) ([0-9a-fx]+)_([0-9a-f]+|url|nofollow)/i;
      var matches = rel.match(reg);
      if (matches === null) {
        return null;
      }

      var result = {
        urlHash: matches[1],
        requestUrlHash: matches[2],
        paramId: matches[3]
      };

      if (skipInnerCheck !== true) {
        if (result.requestUrlHash !== 'x' && !this.requestUrlsMap.has(result.requestUrlHash)) {
          return null;
        }
      }

      return result;
    }
  }, {
    key: 'createIndexHeadCell',
    value: function createIndexHeadCell() {
      var cell = dom('TH', { className: 'seoquake-params-header', rowspan: 2 }, '#');
      this.t('sqLinkinfo_header_index').then(function (text) {
        return dom.text(cell, text);
      }).catch(ignore);
      return cell;
    }
  }, {
    key: 'createURLHeadCell',
    value: function createURLHeadCell() {
      var cell = dom('TH', { className: 'seoquake-params-header sortable', rowspan: 2, rel: 'url' }, 'Url');
      this.t('sqLinkinfo_header_url').then(function (text) {
        return dom.text(cell, text);
      }).catch(ignore);
      return cell;
    }
  }, {
    key: 'createLinkHeadCell',
    value: function createLinkHeadCell(count) {
      var cell = dom('TH', { title: 'Parameters related to full link', colspan: count }, 'Link params');
      this.t('sqLinkinfo_header_link').then(function (text) {
        return dom.text(cell, text);
      }).catch(ignore);
      this.t('sqLinkinfo_header_link_title').then(function (text) {
        return dom.attr(cell, 'title', text);
      }).catch(ignore);
      return cell;
    }
  }, {
    key: 'createDomainHeadCell',
    value: function createDomainHeadCell(count) {
      var cell = dom('TH', { title: 'Parameters related to link domain', colspan: count }, 'Domain params');
      this.t('sqLinkinfo_header_domain').then(function (text) {
        return dom.text(cell, text);
      }).catch(ignore);
      this.t('sqLinkinfo_header_domain_title').then(function (text) {
        return dom.attr(cell, 'title', text);
      }).catch(ignore);
      return cell;
    }
  }, {
    key: 'createBacklinkHeadCell',
    value: function createBacklinkHeadCell(count) {
      var cell = dom('TH', { title: 'Parameters related to backlinks to current link', colspan: count }, 'Backlink params');
      this.t('sqLinkinfo_header_backlink').then(function (text) {
        return dom.text(cell, text);
      }).catch(ignore);
      this.t('sqLinkinfo_header_backlink_title').then(function (text) {
        return dom.attr(cell, 'title', text);
      }).catch(ignore);
      return cell;
    }
  }, {
    key: 'createOtherHeadCell',
    value: function createOtherHeadCell(count) {
      var cell = dom('TH', { title: 'Other parameters', colspan: count }, 'Other parameters');
      this.t('sqLinkinfo_header_other').then(function (text) {
        return dom.text(cell, text);
      }).catch(ignore);
      this.t('sqLinkinfo_header_other_title').then(function (text) {
        return dom.attr(cell, 'title', text);
      }).catch(ignore);
      return cell;
    }
  }, {
    key: 'createHeader',
    value: function createHeader() {
      var tHead = this.table.createTHead();
      dom.emptyElement(tHead);

      var row = tHead.insertRow(-1);
      row.appendChild(this.createIndexHeadCell());
      row.appendChild(this.createURLHeadCell());

      row.cells[1].addEventListener('click', this.sortColumnListener);

      var count = lib.countFields(this.parametersGrouped.page);
      if (this.showNoFollow) {
        count++;
      }

      if (count > 0) {
        row.appendChild(this.createLinkHeadCell(count));
      }

      count = lib.countFields(this.parametersGrouped.domain);
      if (count > 0) {
        row.appendChild(this.createDomainHeadCell(count));
      }

      count = lib.countFields(this.parametersGrouped.backlinks);
      if (count > 0) {
        row.appendChild(this.createBacklinkHeadCell(count));
      }

      count = lib.countFields(this.parametersGrouped.other);
      if (count > 0) {
        row.appendChild(this.createOtherHeadCell(count));
      }

      row = tHead.insertRow(-1);

      if (this.showNoFollow) {
        var cell = dom('TH', { title: 'No-follow', className: 'seoquake-params-header sortable', rel: 'nofollow' }, 'No-follow');
        cell.addEventListener('click', this.sortColumnListener);
        row.appendChild(cell);
      }

      for (var groupId in this.parametersGrouped) {
        if (!this.parametersGrouped.hasOwnProperty(groupId)) {
          continue;
        }

        for (var paramId in this.parametersGrouped[groupId]) {
          if (!this.parametersGrouped[groupId].hasOwnProperty(paramId)) {
            continue;
          }

          var parameter = this.parametersGrouped[groupId][paramId];
          var _cell = dom('TH', { className: 'seoquake-params-header', rel: paramId, title: parameter.title }, parameter.name);

          if (parameter.hasOwnProperty('matches')) {
            dom.addClass(_cell, 'getAll');
            _cell.addEventListener('click', this.requestParameterColumnListener, true);
          }

          row.appendChild(_cell);
        }
      }
    }
  }, {
    key: 'getElements',
    value: function getElements(params) {
      var elements = _get(LinkInfoBase.prototype.__proto__ || Object.getPrototypeOf(LinkInfoBase.prototype), 'getElements', this).call(this, params);

      for (var i = 0; i < params.length; i++) {
        var row = this.container.querySelector('tr[rel="' + params[i].urlHash + '"]');
        if (!row) {
          continue;
        }

        elements.items.push(row);
        var nextRow = row.nextElementSibling;
        while (nextRow && dom.hasAttr(nextRow, 'data-role') && dom.attr(nextRow, 'data-role') === 'otherLink') {
          elements.items.push(nextRow);
          nextRow = nextRow.nextElementSibling;
        }

        if (!elements.container) {
          elements.container = row.parentNode;
        }
      }

      return elements;
    }
  }]);

  return LinkInfoBase;
}(LinksListPlugin);

moduleMixin(LinkInfoBase.prototype);
messengerTranslateMixin(LinkInfoBase.prototype);

module.exports = LinkInfoBase;

},{"../Lib":7,"../LinksListPlugin":8,"../RequestUrl.js":9,"../dom/main":38,"../effects/Overlay":53,"../lib/ignore":64,"../parameters/ConfigureWindow":81,"../utils/CreateFilename":86,"../utils/messengerTranslateMixin":97,"./moduleMixin":78}],78:[function(require,module,exports){
'use strict';

var overlayLib = require('../effects/Overlay');
var dom = require('../dom/main');
var ErrorDisable = require('../basePlugin/ErrorDisable');
var MessageWindow = require('../effects/MessageWindow');

function moduleMixin(object) {
  object.init = function () {
    var _this = this;

    this.getConfigurationBrunch().then(function (configuration) {
      _this.configuration = configuration;
      return _this.getPluginParameters();
    }).then(function (parameters) {
      _this.parameters = parameters;
      _this.process();
    }).catch(function (reason) {
      return _this.processError(reason);
    });
  };

  object.showMessage = function (content, buttons) {
    var _this2 = this;

    overlayLib.showLoading();

    if (this._messageWindow) {
      this._messageWindow.close();
      this._messageWindow = null;
    }

    this._messageWindow = new MessageWindow();
    dom.text(this._messageWindow.body, content);

    if (buttons) {
      buttons.forEach(function (button) {
        var btn = _this2._messageWindow.addButton(button.id, button.value);
        if (button.callback) {
          btn.addEventListener('click', button.callback.bind(btn));
        }
      });
    }

    this._messageWindow.show();
  };

  object.closeMessage = function () {
    if (this._messageWindow) {
      this._messageWindow.close();
      this._messageWindow = null;
    }

    overlayLib.hideLoading();
  };

  object.closeWindow = function (event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    this._messenger.sendMessage('sq.moduleClose', { name: this.name, id: this.query.id });
  };
}

module.exports = moduleMixin;

},{"../basePlugin/ErrorDisable":11,"../dom/main":38,"../effects/MessageWindow":52,"../effects/Overlay":53}],79:[function(require,module,exports){
'use strict';

module.exports = function getFindIn(word, title, keywords, description, h1title) {
  var result = [];
  var regexp = new RegExp('(^\|[ \n\r\t.,\'"\+!?-]+)' + word + '([ \n\r\t.,\'"\+!?-]+\|$)');

  if (title && title.toLowerCase().search(regexp) > -1) {
    result.push('T');
  }

  if (description && description.toLowerCase().search(regexp) > -1) {
    result.push('D');
  }

  if (keywords && keywords.toLowerCase().search(regexp) > -1) {
    result.push('K');
  }

  if (h1title && h1title.toLowerCase().search(regexp) > -1) {
    result.push('H1');
  }

  return result;
};

},{}],80:[function(require,module,exports){
'use strict';

function detectAmpPage(doc) {
  try {
    if (doc.documentElement.tagName.toUpperCase() === 'HTML') {
      var flashAttr = doc.documentElement.attributes.getNamedItem('⚡');

      if (flashAttr !== null && flashAttr.name === '⚡') {
        return true;
      }

      var ampAttr = doc.documentElement.attributes.getNamedItem('amp');

      if (ampAttr !== null && ampAttr.name === 'amp') {
        return true;
      }
    }
  } catch (error) {
    return false;
  }

  return false;
}

module.exports = detectAmpPage;

},{}],81:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageWindow = require('../effects/MessageWindow');
var extend = require('extend');
var dom = require('../dom/main');
var ParametersCheckboxes = require('./ParametersCheckboxes');
var eventsMixin = require('../utils/eventsMixin');
var translateMixin = require('../utils/translateMixin');
var ignore = require('../lib/ignore');

var ConfigureWindow = function (_MessageWindow) {
  _inherits(ConfigureWindow, _MessageWindow);

  function ConfigureWindow(container, config) {
    _classCallCheck(this, ConfigureWindow);

    config = extend(true, {}, ConfigureWindow.DEFAULT_CONFIG, config);

    var _this = _possibleConstructorReturn(this, (ConfigureWindow.__proto__ || Object.getPrototypeOf(ConfigureWindow)).call(this, container, config));

    _this._parameters = null;
    _this._processSaveClick = _this._handleSaveClick.bind(_this);
    _this._processCancelClick = _this._handleCancelClick.bind(_this);
    return _this;
  }

  _createClass(ConfigureWindow, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      _get(ConfigureWindow.prototype.__proto__ || Object.getPrototypeOf(ConfigureWindow.prototype), 'init', this).call(this);
      this._parameters = new ParametersCheckboxes(this.config.module);
      this._parameters.setTranslateFunction(this.getTranslateFunction());
      this._parameters.init();
      this.setTitle('Add/hide parameters in report');
      this.T('title').then(function (text) {
        return _this2.setTitle(text);
      }).catch(ignore);

      this.setContent(this._parameters.element);

      this.addButton('save', 'Save', 'sqbtn sqbtn-small sqbtn-green').addEventListener('click', this._processSaveClick);
      this.T('save').then(function (text) {
        return dom.text(_this2.getButton('save'), text);
      }).catch(ignore);

      this.addButton('cancel', 'Cancel', 'sqbtn sqbtn-small sqbtn-transparent sqbtn-gray').addEventListener('click', this._processCancelClick);
      this.T('cancel').then(function (text) {
        return dom.text(_this2.getButton('cancel'), text);
      }).catch(ignore);
    }
  }, {
    key: 'T',
    value: function T(msg) {
      return this.t('sqCommon_parameters_configure_window_' + msg);
    }
  }, {
    key: 'close',
    value: function close() {
      _get(ConfigureWindow.prototype.__proto__ || Object.getPrototypeOf(ConfigureWindow.prototype), 'close', this).call(this);
      this._parameters = null;
    }
  }, {
    key: '_handleSaveClick',
    value: function _handleSaveClick(event) {
      event.preventDefault();
      this.dispatchEvent('setConfiguration', extend(true, {}, this._parameters.value));
      this.close();
    }
  }, {
    key: '_handleCancelClick',
    value: function _handleCancelClick(event) {
      event.preventDefault();
      this.close();
    }
  }, {
    key: 'parameters',
    set: function set(value) {
      this._parameters.value = value;
    },
    get: function get() {
      return this._parameters.value;
    }
  }]);

  return ConfigureWindow;
}(MessageWindow);

ConfigureWindow.DEFAULT_CONFIG = {
  width: 600,
  height: 500,
  withOverlay: true,
  autoInit: false,
  module: 'linkinfo'
};

eventsMixin(ConfigureWindow.prototype);
translateMixin(ConfigureWindow.prototype);

module.exports = ConfigureWindow;

},{"../dom/main":38,"../effects/MessageWindow":52,"../lib/ignore":64,"../utils/eventsMixin":93,"../utils/translateMixin":100,"./ParametersCheckboxes":83,"extend":118}],82:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dom = require('../dom/main');
var eventsMixin = require('../utils/eventsMixin');

var ParameterItemCheckbox = function () {
  function ParameterItemCheckbox(parameter) {
    _classCallCheck(this, ParameterItemCheckbox);

    this._parameter = parameter;
    this._element = null;
    this._checkbox = null;
    this.init();
  }

  _createClass(ParameterItemCheckbox, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var rand = Math.round(Math.random() * 1000) + 1000;
      var id = 'checkbox-' + rand + '-' + this._parameter.id;
      this._checkbox = dom('input', { type: 'checkbox', id: id });
      this._element = dom('div', { className: 'checkboxes' });
      this._element.appendChild(this._checkbox);
      this._element.appendChild(dom('label', { 'for': id }, this._parameter.name));
      this._checkbox.addEventListener('click', function () {
        return _this.dispatchEvent('select', _this._checkbox.checked);
      }, true);
    }
  }, {
    key: 'remove',
    value: function remove() {
      this.clearEvents();

      dom.removeElement(this._checkbox);
      dom.removeElement(this._element);

      this._checkbox = null;
      this._element = null;
      this._parameter = null;
    }
  }, {
    key: 'element',
    get: function get() {
      return this._element;
    }
  }, {
    key: 'checked',
    set: function set(value) {
      this._checkbox.checked = value;
    },
    get: function get() {
      return this._checkbox.checked;
    }
  }, {
    key: 'parameter',
    get: function get() {
      return this._parameter;
    }
  }]);

  return ParameterItemCheckbox;
}();

eventsMixin(ParameterItemCheckbox.prototype);

module.exports = ParameterItemCheckbox;

},{"../dom/main":38,"../utils/eventsMixin":93}],83:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ParametersList = require('./ParametersList');
var ColumnDisplay = require('../effects/ColumnDisplay');
var ParameterItemCheckbox = require('./ParameterItemCheckbox');
var dom = require('../dom/main');
var normalizeColumnsMixin = require('../effects/noramlizeColumnsMixin');
var translateMixin = require('../utils/translateMixin');
var ignore = require('../lib/ignore');

var ParametersCheckboxes = function (_ParametersList) {
  _inherits(ParametersCheckboxes, _ParametersList);

  function ParametersCheckboxes(module) {
    _classCallCheck(this, ParametersCheckboxes);

    var _this = _possibleConstructorReturn(this, (ParametersCheckboxes.__proto__ || Object.getPrototypeOf(ParametersCheckboxes)).call(this));

    _this.element = null;

    _this._module = module;

    _this._parametersElements = new Map([['page', new ColumnDisplay('Page', 1)], ['domain', new ColumnDisplay('Domain', 1)], ['backlinks', new ColumnDisplay('Backlinks', 1)], ['other', new ColumnDisplay('Other', 1)]]);
    _this._parametersItems = [];
    _this._changed = false;
    _this._isInit = false;
    return _this;
  }

  _createClass(ParametersCheckboxes, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      if (this._isInit) {
        return;
      }

      this._parametersElements.forEach(function (column, key) {
        return _this2.t('sqSeobar2_parameters_group_' + key).then(function (text) {
          return column.title = text;
        }).catch(ignore);
      });

      this._isInit = true;
    }
  }, {
    key: 'clearParametersElements',
    value: function clearParametersElements() {
      this._parametersElements.forEach(function (column) {
        return column.clear();
      });
      this._parametersItems.forEach(function (item) {
        return item.remove();
      });
      this._parametersItems = [];
    }
  }, {
    key: 'onChangeItem',
    value: function onChangeItem(checked) {
      this._changed = true;
      this.dispatchEvent('userUpdated');
    }
  }, {
    key: 'onValuesSet',
    value: function onValuesSet() {
      var _this3 = this;

      _get(ParametersCheckboxes.prototype.__proto__ || Object.getPrototypeOf(ParametersCheckboxes.prototype), 'onValuesSet', this).call(this);
      this.clearParametersElements();

      this._values.forEach(function (parameter) {
        var item = new ParameterItemCheckbox(parameter);
        item.checked = parameter.disabled.indexOf(_this3._module) === -1;
        item.addEventListener('select', function (checked) {
          return _this3.onChangeItem(checked);
        });
        _this3._parametersItems.push(item);
        if (_this3._parametersElements.has(parameter.type)) {
          _this3._parametersElements.get(parameter.type).addItem(item.element);
        }
      });

      dom.emptyElement(this.element);
      var row = this.element.insertRow(-1);
      var columnsAvailable = [];
      this._parametersElements.forEach(function (column) {
        return column.length > 0 ? columnsAvailable.push(column) : 0;
      });
      this.normalizeColumns(columnsAvailable).forEach(function (column) {
        return row.insertCell(-1).appendChild(column.element);
      });
    }
  }, {
    key: 'element',
    set: function set(value) {
      if (value === null) {
        this._element = dom('table', { className: 'parametersListContainer' });
      } else if (!(value instanceof HTMLTableElement)) {
        throw new Error('Value should be instance of HTMLElement');
      } else {
        this._element = value;
      }
    },
    get: function get() {
      if (this._element === null) {
        throw new Error('Top parameters container should be set or created before get');
      }

      return this._element;
    }
  }, {
    key: 'value',
    set: function set(value) {
      _set(ParametersCheckboxes.prototype.__proto__ || Object.getPrototypeOf(ParametersCheckboxes.prototype), 'value', value, this);
    },
    get: function get() {
      var _this4 = this;

      var result = {};
      this._parametersItems.forEach(function (item) {
        if (_this4._values.has(item.parameter.id)) {
          var parameter = _this4._values.get(item.parameter.id);
          var pos = parameter.disabled.indexOf(_this4._module);
          if (pos !== -1) {
            parameter.disabled.splice(pos, 1);
          }

          if (!item.checked) {
            parameter.disabled.push(_this4._module);
          }
        }
      });
      return _get(ParametersCheckboxes.prototype.__proto__ || Object.getPrototypeOf(ParametersCheckboxes.prototype), 'value', this);
    }
  }, {
    key: 'changed',
    get: function get() {
      return this._changed;
    }
  }]);

  return ParametersCheckboxes;
}(ParametersList);

normalizeColumnsMixin(ParametersCheckboxes.prototype);
translateMixin(ParametersCheckboxes.prototype);

module.exports = ParametersCheckboxes;

},{"../dom/main":38,"../effects/ColumnDisplay":45,"../effects/noramlizeColumnsMixin":56,"../lib/ignore":64,"../utils/translateMixin":100,"./ParameterItemCheckbox":82,"./ParametersList":84}],84:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventsMixin = require('../utils/eventsMixin');

var ParametersList = function () {
  function ParametersList() {
    _classCallCheck(this, ParametersList);

    this._values = new Map();
    this._element = null;
  }

  _createClass(ParametersList, [{
    key: 'onValuesSet',
    value: function onValuesSet() {
      this.dispatchEvent('setValues');
    }
  }, {
    key: 'value',
    set: function set(parameters) {
      this._values.clear();

      for (var key in parameters) {
        if (parameters.hasOwnProperty(key)) {
          this._values.set(key, parameters[key]);
        }
      }

      this.onValuesSet();
    },
    get: function get() {
      var result = {};
      this._values.forEach(function (value, key) {
        return result[key] = value;
      });
      return result;
    }
  }]);

  return ParametersList;
}();

eventsMixin(ParametersList.prototype);

module.exports = ParametersList;

},{"../utils/eventsMixin":93}],85:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ParametersCounter = function () {
  function ParametersCounter() {
    _classCallCheck(this, ParametersCounter);

    this._urlCounter = new Map();
    this._paramCounter = new Map();
    this._total = 0;
    this._done = 0;
  }

  _createClass(ParametersCounter, [{
    key: 'addCell',
    value: function addCell(rel) {
      if (this._urlCounter.has(rel.urlHash)) {
        this._urlCounter.get(rel.urlHash).total++;
      } else {
        this._urlCounter.set(rel.urlHash, {
          total: 1,
          done: 0
        });
      }

      if (this._paramCounter.has(rel.paramId)) {
        this._paramCounter.get(rel.paramId).total++;
      } else {
        this._paramCounter.set(rel.paramId, {
          total: 1,
          done: 0
        });
      }

      this._total++;
    }
  }, {
    key: 'cellDone',
    value: function cellDone(rel) {
      var urlHas = false;
      var paramHas = false;
      var urlDone = false;
      var paramDone = false;
      var allDone = false;

      if (this._urlCounter.has(rel.urlHash)) {
        var value = this._urlCounter.get(rel.urlHash);
        value.done++;
        urlDone = value.done >= value.total;
        urlHas = true;
      }

      if (this._paramCounter.has(rel.paramId)) {
        var _value = this._paramCounter.get(rel.paramId);
        _value.done++;
        paramDone = _value.done >= _value.total;
        paramHas = true;
      }

      if (urlHas || paramHas) {
        this._done++;
      }

      if (this._done >= this._total) {
        this.dispatchEvent('allDone');
      }

      if (paramDone) {
        this.dispatchEvent('paramDone', rel.paramId);
      }

      if (urlDone) {
        this.dispatchEvent('urlDone', rel.urlHash);
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      this._paramCounter.clear();
      this._urlCounter.clear();
      this._total = 0;
      this._done = 0;
      this.dispatchEvent('reset');
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.reset();
      this.clearEvents();
    }
  }, {
    key: 'total',
    get: function get() {
      return this._total;
    }
  }, {
    key: 'done',
    get: function get() {
      return this._done;
    }
  }]);

  return ParametersCounter;
}();

require('../utils/eventsMixin')(ParametersCounter.prototype);

module.exports = ParametersCounter;

},{"../utils/eventsMixin":93}],86:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sanitize = require('sanitize-filename');

var CreateFilename = function () {
  function CreateFilename(client, replace) {
    _classCallCheck(this, CreateFilename);

    this._client = client;
    this._replace = replace || 'data';
  }

  _createClass(CreateFilename, [{
    key: 'filenameTemplate',
    get: function get() {
      var _this = this;

      return new Promise(function (resolve) {
        setTimeout(function () {
          return resolve('%REPLACE%.csv');
        }, 1000);
        _this._client.getConfigurationItem('core.export_template', 0, function (value) {
          value = parseInt(value, 10);
          var result = '%REPLACE%.csv';
          switch (value) {
            case 1:
              result = '%REPLACE% - %DATE%.csv';
              break;
            case 2:
              result = '%REPLACE% - %DATE% - %TIME%.csv';
              break;
          }
          resolve(result);
        });
      });
    }
  }, {
    key: 'replace',
    get: function get() {
      return this._replace;
    },
    set: function set(value) {
      this._replace = value;
    }
  }, {
    key: 'filename',
    get: function get() {
      var _this2 = this;

      return this.filenameTemplate.then(function (filename) {
        var now = new Date();
        var replaces = {
          '%REPLACE%': sanitize(_this2._replace),
          '%DATE%': sanitize(now.toLocaleDateString(), { replacement: '_' }),
          '%TIME%': sanitize(now.toLocaleTimeString(), { replacement: '_' })
        };
        return filename.replace(/(%REPLACE%|%DATE%|%TIME%)/g, function (match, p1) {
          return replaces[p1];
        });
      });
    }
  }]);

  return CreateFilename;
}();

module.exports = CreateFilename;

},{"sanitize-filename":123}],87:[function(require,module,exports){
'use strict';

exports.SEOQUAKE_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

exports.SEOQUAKE_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

exports.isDate = function (value, format) {
    return exports.getDateFromFormat(value, format) !== 0;
};

exports.formatDate = function (date, format) {
    var day = addZero(date.getDate());
    var month = addZero(date.getMonth() + 1);
    var yearLong = addZero(date.getFullYear());
    var yearShort = addZero(date.getFullYear().toString().substring(3, 4));
    var year = format.indexOf("yyyy") > -1 ? yearLong : yearShort;
    var hour = addZero(date.getHours());
    var minute = addZero(date.getMinutes());
    var second = addZero(date.getSeconds());
    var dateString = format.replace(/dd/g, day).replace(/MM/g, month).replace(/y{1,4}/g, year);
    dateString = dateString.replace(/hh/g, hour).replace(/mm/g, minute).replace(/ss/g, second);
    return dateString;
};

function addZero(number) {
    return (number < 10 ? "0" : "") + number;
}

function isInteger(value) {
    return value.match(/^[\d]+$/);
}

function getInt(str, i, minlength, maxlength) {
    for (var x = maxlength; x >= minlength; x--) {
        var token = str.substring(i, i + x);
        if (token.length < minlength) {
            return null;
        }
        if (isInteger(token)) {
            return token;
        }
    }
    return null;
}

exports.getDateFromFormat = function (value, format) {
    var i_val = 0;
    var i_format = 0;
    var c = "";
    var token = "";
    var token2 = "";
    var x, y, i;

    var now = new Date();
    var year = now.getYear();
    var month = now.getMonth() + 1;
    var date = 1;
    var hh = now.getHours();
    var mm = now.getMinutes();
    var ss = now.getSeconds();
    var ampm = "";

    while (i_format < format.length) {
        c = format.charAt(i_format);
        token = "";
        while (format.charAt(i_format) === c && i_format < format.length) {
            token += format.charAt(i_format++);
        }

        if (token === "yyyy" || token === "yy" || token === "y") {
            if (token === "yyyy") {
                x = 4;y = 4;
            }
            if (token === "yy") {
                x = 2;y = 2;
            }
            if (token === "y") {
                x = 2;y = 4;
            }
            year = getInt(value, i_val, x, y);
            if (year === null) {
                return 0;
            }
            i_val += year.length;
            if (year.length === 2) {
                year = parseInt(year, 10) + (year > 70 ? 1900 : 2000);
            }
        } else if (token === "MMM" || token === "NNN") {
            month = 0;
            for (i = 0; i < exports.SEOQUAKE_MONTH_NAMES.length; i++) {
                var month_name = exports.SEOQUAKE_MONTH_NAMES[i];
                if (value.substring(i_val, i_val + month_name.length).toLowerCase() === month_name.toLowerCase()) {
                    if (token === "MMM" || token === "NNN" && i > 11) {
                        month = i + 1;
                        if (month > 12) {
                            month -= 12;
                        }
                        i_val += month_name.length;
                        break;
                    }
                }
            }
            if (month < 1 || month > 12) return 0;
        } else if (token === "EE" || token === "E") {
            for (i = 0; i < exports.SEOQUAKE_DAY_NAMES.length; i++) {
                var day_name = exports.SEOQUAKE_DAY_NAMES[i];
                if (value.substring(i_val, i_val + day_name.length).toLowerCase() == day_name.toLowerCase()) {
                    i_val += day_name.length;
                    break;
                }
            }
        } else if (token === "MM" || token === "M") {
            month = getInt(value, i_val, token.length, 2);
            if (month === null || month < 1 || month > 12) {
                return 0;
            }
            i_val += month.length;
        } else if (token === "dd" || token === "d") {
            date = getInt(value, i_val, token.length, 2);
            if (date === null || date < 1 || date > 31) {
                return 0;
            }
            i_val += date.length;
        } else if (token === "hh" || token === "h") {
            hh = getInt(value, i_val, token.length, 2);
            if (hh === null || hh < 1 || hh > 12) {
                return 0;
            }
            i_val += hh.length;
        } else if (token === "HH" || token === "H") {
            hh = getInt(value, i_val, token.length, 2);
            if (hh === null || hh < 0 || hh > 23) {
                return 0;
            }
            i_val += hh.length;
        } else if (token === "KK" || token === "K") {
            hh = getInt(value, i_val, token.length, 2);
            if (hh === null || hh < 0 || hh > 11) {
                return 0;
            }
            i_val += hh.length;
        } else if (token === "kk" || token === "k") {
            hh = getInt(value, i_val, token.length, 2);
            if (hh === null || hh < 1 || hh > 24) {
                return 0;
            }
            i_val += hh.length;
            hh--;
        } else if (token === "mm" || token === "m") {
            mm = getInt(value, i_val, token.length, 2);
            if (mm === null || mm < 0 || mm > 59) {
                return 0;
            }
            i_val += mm.length;
        } else if (token === "ss" || token === "s") {
            ss = getInt(value, i_val, token.length, 2);
            if (ss === null || ss < 0 || ss > 59) {
                return 0;
            }
            i_val += ss.length;
        } else if (token === "a") {
            if (value.substring(i_val, i_val + 2).toLowerCase() === "am") {
                ampm = "AM";
            } else if (value.substring(i_val, i_val + 2).toLowerCase() === "pm") {
                ampm = "PM";
            } else {
                return 0;
            }
            i_val += 2;
        } else {
            if (value.substring(i_val, i_val + token.length) !== token) {
                return 0;
            } else {
                i_val += token.length;
            }
        }
    }

    if (i_val !== value.length) {
        return 0;
    }

    if (month === 2) {
        if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
            if (date > 29) {
                return 0;
            }
        } else {
            if (date > 28) {
                return 0;
            }
        }
    }
    if ((month === 4 || month === 6 || month === 9 || month === 11) && date > 30) {
        return 0;
    }

    if (hh < 12 && ampm === "PM") {
        hh += 12;
    } else if (hh > 11 && ampm === "AM") {
        hh -= 12;
    }

    var newdate = new Date(year, month - 1, date, hh, mm, ss);
    return newdate.getTime();
};

exports.parseDate = function (value) {
    var preferEuro = arguments.length === 2 ? arguments[1] : false;
    var generalFormats = new Array("y-M-d", "MMM d, y", "MMM d,y", "y-MMM-d", "d-MMM-y", "MMM d", "d MMM y");
    var monthFirst = new Array("M/d/y", "M-d-y", "M.d.y", "MMM-d", "M/d", "M-d");
    var dateFirst = new Array("d/M/y", "d-M-y", "d.M.y", "d-MMM", "d/M", "d-M");
    var checkList = new Array(generalFormats, preferEuro ? dateFirst : monthFirst, preferEuro ? monthFirst : dateFirst);
    var d = null;
    for (var i = 0; i < checkList.length; i++) {
        var l = checkList[i];
        for (var j = 0; j < l.length; j++) {
            d = exports.getDateFromFormat(value, l[j]);
            if (d !== 0) {
                return d;
            }
        }
    }
    return null;
};

},{}],88:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var shortHash = require('../lib/shortHash');

var RenderObject = function () {
  function RenderObject(url) {
    _classCallCheck(this, RenderObject);

    this.values = {};
    this.requestUrlHash = '';
    this.params = [];
    this.urlRequest = url;
  }

  _createClass(RenderObject, [{
    key: 'addParam',
    value: function addParam(value) {
      value = value.toString();
      if (this.params.indexOf(value) === -1) {
        this.params.push(value);
      }
    }
  }, {
    key: 'setValue',
    value: function setValue(key, value) {
      this.values[key] = value;
    }
  }, {
    key: 'urlRequest',
    set: function set(value) {
      value = value || '';
      value = value.toString();
      this['url-r'] = value;
      this.requestUrlHash = shortHash(value);
    },
    get: function get() {
      return this['url-r'];
    }
  }]);

  return RenderObject;
}();

exports.RenderObject = RenderObject;

},{"../lib/shortHash":73}],89:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isEmpty = require('../lib/isEmpty');
var isString = require('../lib/isString');
var extend = require('extend');
var XHRProxyResult = require('./XHRProxyResult');
var isFunction = require('../lib/isFunction');
var uri = require('../lib/parseUri');
var args = require('../lib/parseArgs');

var XHRProxy = function () {
  function XHRProxy(client) {
    _classCallCheck(this, XHRProxy);

    if (client === undefined) {
      throw new Error('Client should be provided');
    }

    this._client = client;
    this._localTimeout = null;
    this._requestCanceled = null;
    this._callback = XHRProxy.nop;
    this._timeoutCallback = XHRProxy.nop;
    this._timeout = 30000;
    this._headers = [];
  }

  _createClass(XHRProxy, [{
    key: 'setCallback',
    value: function setCallback(value) {
      this.callback = value;
      return this;
    }
  }, {
    key: 'setTimeoutCallback',
    value: function setTimeoutCallback(value) {
      this.timeoutCallback = value;
      return this;
    }
  }, {
    key: 'setTimeout',
    value: function setTimeout(value) {
      this.timeout = value;
      return this;
    }
  }, {
    key: '_processAnswer',
    value: function _processAnswer(result) {
      if (this._localTimeout !== null) {
        clearTimeout(this._localTimeout);
        this._localTimeout = null;
      }

      if (!this._requestCanceled) {
        result = new XHRProxyResult(result);
        this.callback(result);
      }
    }
  }, {
    key: '_processTimeout',
    value: function _processTimeout() {
      this._requestCanceled = true;
      this.timeoutCallback();
    }
  }, {
    key: 'setHeader',
    value: function setHeader(header, value) {
      this._headers.push([header, value]);
    }
  }, {
    key: 'setRequestHeader',
    value: function setRequestHeader(header, value) {
      this.setHeader(header, value);
    }
  }, {
    key: 'send',
    value: function send(url, type, requestData) {
      var _this = this;

      type = type || 'get';
      requestData = requestData || null;

      if (requestData !== null && isString(requestData)) {
        requestData = args.parseArgs(requestData);
      }

      var urlObject = uri.parseUri(url);

      if (type === 'get' && requestData !== null) {
        var queryData = new Map();
        if (!isEmpty(urlObject, 'query')) {
          queryData = args.parseArgs(urlObject.query);
        }

        requestData.forEach(function (value, key) {
          return queryData.set(key, value);
        });
        urlObject.query = args.createArgs(queryData);
      }

      url = uri.createUri(urlObject);

      var data = {
        url: url,
        type: type
      };

      if (this._headers.length > 0) {
        data.headers = this._headers;
      }

      if (type === 'post' && requestData !== null) {
        data.data = args.createArgs(requestData);
      }

      this._client.sendMessage('sq.requestUrl', data, function (result) {
        return _this._processAnswer(result);
      });

      if (this._timeout !== null) {
        this._localTimeout = setTimeout(function () {
          return _this._processTimeout();
        }, this._timeout);
      }
    }
  }, {
    key: 'callback',
    set: function set(value) {
      if (value === null) {
        this._callback = XHRProxy.nop;
      } else if (isFunction(value)) {
        this._callback = value;
      } else {
        throw new Error('Value should be null or function');
      }
    },
    get: function get() {
      return this._callback;
    }
  }, {
    key: 'timeoutCallback',
    set: function set(value) {
      if (value === null) {
        this._timeoutCallback = XHRProxy.nop;
      } else if (isFunction(value)) {
        this._timeoutCallback = value;
      } else {
        throw new Error('Value should be null or function');
      }
    },
    get: function get() {
      return this._timeoutCallback;
    }
  }, {
    key: 'timeout',
    set: function set(value) {
      this._timeout = value;
    },
    get: function get() {
      return this._timeout;
    }
  }, {
    key: 'localTimeout',
    get: function get() {
      return this._localTimeout;
    }
  }, {
    key: 'requestCanceled',
    get: function get() {
      return this._requestCanceled;
    }
  }], [{
    key: 'nop',
    value: function nop() {}
  }]);

  return XHRProxy;
}();

module.exports = XHRProxy;

},{"../lib/isEmpty":67,"../lib/isFunction":68,"../lib/isString":70,"../lib/parseArgs":71,"../lib/parseUri":72,"./XHRProxyResult":91,"extend":118}],90:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isEmpty = require('../lib/isEmpty');
var isString = require('../lib/isString');
var uri = require('../lib/parseUri');
var XHRProxy = require('./XHRProxy');
var messengerMixin = require('./messengerMixin');
var args = require('../lib/parseArgs');

var XHRProxyEx = function (_XHRProxy) {
  _inherits(XHRProxyEx, _XHRProxy);

  function XHRProxyEx() {
    _classCallCheck(this, XHRProxyEx);

    return _possibleConstructorReturn(this, (XHRProxyEx.__proto__ || Object.getPrototypeOf(XHRProxyEx)).call(this, null));
  }

  _createClass(XHRProxyEx, [{
    key: 'send',
    value: function send(url, type, requestData) {
      var _this2 = this;

      type = type || 'get';
      requestData = requestData || null;

      if (requestData !== null && isString(requestData)) {
        requestData = args.parseArgs(requestData);
      }

      var urlObject = uri.parseUri(url);

      if (type === 'get' && requestData !== null) {
        var queryData = new Map();
        if (!isEmpty(urlObject, 'query')) {
          queryData = args.parseArgs(urlObject.query);
        }

        requestData.forEach(function (value, key) {
          return queryData.set(key, value);
        });
        urlObject.query = args.createArgs(queryData);
      }

      url = uri.createUri(urlObject);

      var data = {
        url: url,
        type: type
      };

      if (this._headers.length > 0) {
        data.headers = this._headers;
      }

      if (type === 'post' && requestData !== null) {
        data.data = args.createArgs(requestData);
      }

      this.sendMessage('sq.requestUrl', data).then(function (result) {
        return _this2._processAnswer(result);
      });

      if (this._timeout !== null) {
        this._localTimeout = setTimeout(function () {
          return _this2._processTimeout();
        }, this._timeout);
      }
    }
  }]);

  return XHRProxyEx;
}(XHRProxy);

messengerMixin(XHRProxyEx.prototype);

module.exports = XHRProxyEx;

},{"../lib/isEmpty":67,"../lib/isString":70,"../lib/parseArgs":71,"../lib/parseUri":72,"./XHRProxy":89,"./messengerMixin":95}],91:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var extend = require('extend');

var XHRProxyResult = function () {
  function XHRProxyResult(result) {
    _classCallCheck(this, XHRProxyResult);

    this.headers = '';
    extend(true, this, result);
  }

  _createClass(XHRProxyResult, [{
    key: 'getAllResponseHeaders',
    value: function getAllResponseHeaders() {
      return this.headers;
    }
  }, {
    key: 'getResponseHeader',
    value: function getResponseHeader(header) {
      var list = this.headers.split('\n');
      header = header.toLowerCase();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var line = _step.value;

          if (line.toLowerCase().startsWith(header)) {
            return line.substr(line.indexOf(':') + 2);
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

      return undefined;
    }
  }]);

  return XHRProxyResult;
}();

module.exports = XHRProxyResult;

},{"extend":118}],92:[function(require,module,exports){
'use strict';

var Entities = require('html-entities').AllHtmlEntities;

var entities = null;

module.exports = function () {
  if (entities === null) {
    entities = new Entities();
  }

  return entities;
};

},{"html-entities":119}],93:[function(require,module,exports){
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

},{"../lib/isFunction":68,"../lib/isString":70}],94:[function(require,module,exports){
'use strict';

var isEmpty = require('../lib/isEmpty');

module.exports = function messengerBaseMixin(object) {
  if (typeof object.sendMessage !== 'function') {
    object.sendMessage = function (message, data) {
      return this._sendMessage(message, data);
    };
  }

  if (typeof object._sendMessage !== 'function') {
    object._sendMessage = function (message, data) {
      var _this = this;

      if (!this._messenger) {
        return Promise.reject('No messenger provided');
      }

      return new Promise(function (resolve) {
        return _this._messenger.sendMessage(message, data, function (result) {
          return resolve(result);
        });
      });
    };
  }

  if (typeof object.setMessenger !== 'function') {
    object.setMessenger = function (messenger) {
      if (isEmpty(messenger)) {
        this._messenger = null;
        return;
      }

      this._messenger = messenger;
    };
  }

  if (typeof object.addMessageListener !== 'function') {
    object.addMessageListener = function (action, callback) {
      if (!this._messenger) {
        throw new Error('No messenger provided');
      }

      this._messenger.addMessageListener(action, callback);
    };
  }

  if (typeof object.removeMessageListener !== 'function') {
    object.removeMessageListener = function (action, callback) {
      if (!this._messenger) {
        throw new Error('No messenger provided');
      }

      this._messenger.removeMessageListener(action, callback);
    };
  }

  if (typeof object.getMessenger !== 'function') {
    object.getMessenger = function () {
      if (!this._messenger) {
        throw new Error('No messenger provided');
      }

      return this._messenger;
    };
  }
};

},{"../lib/isEmpty":67}],95:[function(require,module,exports){
'use strict';

var messengerBaseMixin = require('./messengerBaseMixin');

module.exports = function messengerMixin(object) {
  messengerBaseMixin(object);

  object.getConfiguration = function () {
    return this.sendMessage('sq.getConfiguration', null);
  };

  object.getAssetsUrl = function () {
    var _this = this;

    if (!this._messenger) {
      return Promise.reject('No messenger provided');
    }

    return new Promise(function (resolve) {
      return _this._messenger.getAssetsUrl(resolve);
    });
  };

  object.setConfiguration = function (configuration) {
    return this._sendMessage('sq.setConfiguration', configuration);
  };

  object.setConfigurationItem = function (name, value) {
    return this._sendMessage('sq.setConfigurationItem', { name: name, value: value });
  };

  object.getConfigurationItem = function (name) {
    return this._sendMessage('sq.getConfigurationItem', name);
  };

  object.updateConfiguration = function () {
    return this._sendMessage('sq.updateConfiguration');
  };

  object.getCoreState = function () {
    return this.sendMessage('sq.getCoreState', null);
  };

  object.getConfigurationBrunch = function () {
    return this.sendMessage('sq.getConfigurationBranch', null);
  };

  object.getPluginParameters = function () {
    return this.sendMessage('sq.getPluginParameters', null);
  };

  object.getParameters = function () {
    return this.sendMessage('sq.getParameters', null);
  };

  object.setParameters = function (value) {
    return this._sendMessage('sq.setParameters', value);
  };

  object.setDisabledState = function (plugin, value) {
    var _this2 = this;

    if (!this._messenger) {
      return Promise.reject('No messenger provided');
    }

    return new Promise(function (resolve) {
      return _this2._messenger.setDisabledState(plugin, value, resolve);
    });
  };

  object.registerEvent = function (category, action, label) {
    if (!this._messenger) {
      throw new Error('No messenger provided');
    }

    return this._messenger.registerEvent(category, action, label);
  };

  object.registerPage = function (page) {
    if (!this._messenger) {
      throw new Error('No messenger provided');
    }

    return this._messenger.registerPage(page);
  };
};

},{"./messengerBaseMixin":94}],96:[function(require,module,exports){
'use strict';

var messengerMixin = require('./messengerMixin');
var getUUID = require('../lib/getUUID');

module.exports = function messengerModuleMixin(object) {
  messengerMixin(object);

  object.sendMessage = function (message, data) {
    var _this = this;

    return new Promise(function (resolve) {
      if (!_this._messenger) {
        throw new Error('No messenger provided');
      }

      data = {
        payload: data,
        plugin: _this.name,
        sender: _this.getUUID()
      };

      _this._messenger.sendMessage(message, data, resolve);
    });
  };

  if (typeof object.getUUID !== 'function') {
    object.getUUID = function () {
      if (typeof this._uuid === 'undefined' || this._uuid === null) {
        this._uuid = getUUID();
      }

      return this._uuid;
    };
  }
};

},{"../lib/getUUID":63,"./messengerMixin":95}],97:[function(require,module,exports){
'use strict';

var messengerBaseMixin = require('./messengerBaseMixin');

module.exports = function messengerTranslateMixin(object) {
  messengerBaseMixin(object);

  if (typeof object.t !== 'function') {
    object.t = function (message) {
      var _this = this;

      if (!this._messenger) {
        throw new Error('No messenger provided');
      }

      if (!this._messenger.hasOwnProperty('t')) {
        throw new Error('Messenger without translate');
      }

      return new Promise(function (resolve, reject) {
        try {
          _this._messenger.t(message, resolve);
        } catch (reason) {
          reject(reason);
        }
      });
    };
  }
};

},{"./messengerBaseMixin":94}],98:[function(require,module,exports){
'use strict';

function normalizeNumber(value) {
  var input = String(value);
  var trimRegExp = new RegExp('^[' + normalizeNumber.SPACE_STRING + ']+|[' + normalizeNumber.SPACE_STRING + ']+$', 'ig');
  var normalized = input.replace(trimRegExp, '');

  var numberRegExp = new RegExp('[.,' + normalizeNumber.SPACE_STRING + ']', 'ig');
  var numberSource = normalized.replace(numberRegExp, '');
  var number = Number(numberSource);
  var shortValue = value;

  if (!isNaN(number) && String(number) === numberSource) {
    var num = number;
    shortValue = String(number);
    for (var i = normalizeNumber.NUMBER_SIZES.length - 1; i >= 0; i--) {
      var decimal = normalizeNumber.NUMBER_SIZES[i][1];
      var unit = normalizeNumber.NUMBER_SIZES[i][0];

      if (num <= -decimal || num >= decimal) {
        var digits = Math.max(0, normalizeNumber.DEFAULT_LENGTH - String(Math.round(num / decimal)).length);
        shortValue = Number(num / decimal).toLocaleString(undefined, { useGrouping: true, minimumFractionDigits: digits, maximumFractionDigits: digits }) + unit;
        break;
      }
    }
  } else {
    number = null;
  }

  return {
    value: normalized,
    number: number,
    shortValue: shortValue
  };
}

normalizeNumber.SPACE_STRING = ' \xA0\u1680\u180E\u2000-\u200B\u202F\u205F\uFEFF';
normalizeNumber.DEFAULT_LENGTH = 3;
normalizeNumber.NUMBER_SIZES = [['K', 1000], ['M', 1000000], ['B', 1000000000], ['T', 1000000000000], ['P', 1000000000000000]];

module.exports = normalizeNumber;

},{}],99:[function(require,module,exports){
'use strict';

var dom = require('../dom/main');
var ignore = require('../lib/ignore');

module.exports = function quickTmixin(object) {
  if (typeof object.T !== 'function') {

    object.T = function () {
      var all = false;
      var index = 0;
      if (typeof arguments[index] === 'boolean') {
        all = arguments[index];
        index++;
      }

      var role = arguments[index++];
      var code = arguments[index++];
      var tooltip = arguments[index];
      var elements = this.findByRole(role);

      if (!all) {
        elements.splice(1);
      }

      var translates = [this.t(code)];

      if (tooltip) {
        translates.push(this.t(tooltip));
      }

      Promise.all(translates).then(function (msgs) {
        elements.forEach(function (element) {
          dom.setText(element, msgs[0]);
          if (msgs.length > 0) {
            dom.attr(element, 'title', msgs[1]);
          }
        });
      }).catch(ignore);
    };
  }

  if (typeof object.T2 !== 'function') {

    object.T2 = function () {
      var all = false;
      var index = 0;
      if (typeof arguments[index] === 'boolean') {
        all = arguments[index];
        index++;
      }

      var role = arguments[index++];
      var code = arguments[index++];
      var tooltip = arguments[index++];
      var elements = this.findByRole(role);

      if (!all) {
        elements = elements.slice(0, 1);
      }

      var wait = [];
      wait.push(this.t(code));
      if (tooltip) {
        wait.push(this.t(tooltip));
      }

      Promise.all(wait).then(function (texts) {
        elements.forEach(function (element) {
          dom.setContent(element, dom.parse(texts[0]));

          if (tooltip) {
            dom.attr(element, 'title', texts[1]);
          }
        });
      }).catch(ignore);
    };
  }
};

},{"../dom/main":38,"../lib/ignore":64}],100:[function(require,module,exports){
'use strict';

var ignore = require('../lib/ignore');

function replaceTextPlaceholders(text, data) {
  if (data === undefined) {
    return text;
  }

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      var regexp = new RegExp('{' + key + '}', 'g');
      text = text.replace(regexp, data[key]);
    }
  }

  return text;
}

module.exports = function translateMixin(object) {
  object.t = function (message, data) {
    var _this = this;

    this.__tmInitTranslateCache();

    if (this.__tmTranslateCache.has(message)) {
      return Promise.resolve(replaceTextPlaceholders(this.__tmTranslateCache.get(message), data));
    }

    return this.getTranslateFunction()(message).then(function (text) {
      _this.__tmTranslateCache.set(message, text);
      return replaceTextPlaceholders(text, data);
    }).catch(ignore);
  };

  object.setTranslateFunction = function (handler) {
    this.__tmTranslateFunction = handler;
  };

  object.getTranslateFunction = function () {
    if (!this.hasOwnProperty('__tmTranslateFunction')) {
      this.__tmTranslateFunction = defaultTranslation;
    }

    return this.__tmTranslateFunction;
  };

  object.__tmInitTranslateCache = function () {
    if (!this.hasOwnProperty('__tmTranslateCache')) {
      this.__tmTranslateCache = new Map();
    }
  };
};

function defaultTranslation(message) {
  return Promise.resolve(message);
}

},{"../lib/ignore":64}],101:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MenuHighlight = require('../../../common/effects/MenuHighlight');
var MessageWindow = require('../../../common/effects/MessageWindow');
var FloatPanel = require('../../../common/effects/FloatPanel');
var lib = require('../../../common/Lib');
var dom = require('../../../common/dom/main');
var PageInfo = require('./PageInfo');
var Diagnosis = require('./Diagnosis');
var Linkinfo = require('./Linkinfo');
var Density = require('./Density');
var overlayLib = require('../../../common/effects/Overlay');
var IsEllipsisActive = require('../../../common/effects/IsEllipsisActive');
var HintBox = require('../../../common/effects/HintBox');
var DataSource = require('./DataSource');

var ignore = require('../../../common/lib/ignore');
var eventsMixin = require('../../../common/utils/eventsMixin');
var quickTmixin = require('../../../common/utils/quickTmixin');
var messengerModuleMixin = require('../../../common/utils/messengerModuleMixin');
var messengerTranslateMixin = require('../../../common/utils/messengerTranslateMixin');

var CommonMain = function () {
  function CommonMain() {
    _classCallCheck(this, CommonMain);

    this._menuRoot = null;
    this._panels = null;
    this._plugins = new Map([['pageinfo', null], ['diagnosis', null], ['internal', null], ['external', null], ['density', null], ['linkinfo', null]]);
    this._moduleName = 'common';
    this._args = null;
    this._menu = null;
    this._url = null;
    this._dataSource = null;

    this._processCloseModuleClick = this._handleCloseModuleClick.bind(this);
    this._processFatalError = this._handleFatalError.bind(this);
    this._processDensityClick = this._handleDensityClick.bind(this);
    this._processModuleDataReady = this._handleModuleDataReady.bind(this);
    this._processCompareButtonClick = this._handleCompareButtonClick.bind(this);
  }

  _createClass(CommonMain, [{
    key: 'init',
    value: function init() {
      overlayLib.showLoading();

      this.T(true, 'howto-link', 'sqCommon_howto_link');
      this.T(true, 'suggest-link', 'sqCommon_suggest_link');
      this.T('menu-pageinfo', 'sqCommon_menu_pageinfo');
      this.T('menu-diagnosis', 'sqCommon_menu_diagnosis');
      this.T('menu-internal', 'sqCommon_menu_internal');
      this.T('menu-external', 'sqCommon_menu_external');
      this.T('menu-density', 'sqCommon_menu_density');
      this.T('compare', 'sqCommon_menu_compare');
      this.T(true, 'feedback-1', 'sqFeedback_text_1');
      this.T(true, 'feedback-link', 'sqFeedback_link');
      this.T(true, 'feedback-2', 'sqFeedback_text_2');
      this.T(true, 'feedback-email', 'sqFeedback_email');

      this._menuRoot = document.querySelector('header .main-menu nav');
      this._panels = Array.from(document.querySelectorAll('main section'));
      this._args = lib.parseArgs(document.location.search.substr(1));

      this._dataSource = new DataSource(this._args.get('id'));
      this._dataSource.setMessenger(this.getMessenger());

      this._sendMessage('sq.moduleGetData', { name: this._moduleName, id: this._args.get('id') }).then(this._processModuleDataReady).catch(ignore);
    }
  }, {
    key: 'findByRole',
    value: function findByRole(role) {
      return Array.from(document.querySelectorAll('[data-role="' + role + '"]'));
    }
  }, {
    key: 'switchPage',
    value: function switchPage(tabName) {
      var panel = document.getElementById(tabName + '_block');

      this._panels.forEach(function (panel) {
        dom.css(panel, 'display', 'none');
        dom.removeClass(panel, 'panel-visible');
      });

      if (!panel) {
        return;
      }

      dom.css(panel, 'display', 'block');
      dom.addClass(panel, 'panel-visible');

      var main = document.querySelector('body > main');
      if (panel.offsetHeight < main.offsetHeight) {
        dom.css(panel, 'min-height', main.offsetHeight + 'px');
      }

      this.loadPanelData(tabName);
    }
  }, {
    key: 'createLinkinfoHTML',
    value: function createLinkinfoHTML(destination) {
      var dest = document.getElementById(destination);
      var source = document.querySelector('#linkinfo-template');
      var clone = document.importNode(source.content, true);
      dest.appendChild(clone);
    }
  }, {
    key: 'createPageInfo',
    value: function createPageInfo(block, data) {
      var _this = this;

      var panel = new PageInfo(block, data);
      panel.setMessenger(this.getMessenger());
      this._plugins.set('pageinfo', panel);
      panel.render();
      Array.from(block.querySelectorAll('[data-role="see-all-keywords"]')).forEach(function (link) {
        return link.addEventListener('click', _this._processDensityClick);
      });
    }
  }, {
    key: 'createDiagnosis',
    value: function createDiagnosis(block, data) {
      var panel = new Diagnosis(block, data);
      panel.setMessenger(this.getMessenger());
      panel.render();
      this._plugins.set('diagnosis', panel);
    }
  }, {
    key: 'createLinkinfo',
    value: function createLinkinfo(block, data, id) {
      this.createLinkinfoHTML(id + '_block');
      var panel = new Linkinfo(block, data, id);
      panel.setMessenger(this.getMessenger());
      panel.render();
      this._plugins.set(id, panel);
    }
  }, {
    key: 'createDensity',
    value: function createDensity(block, data) {
      var panel = new Density(block, data);
      panel.setMessenger(this.getMessenger());
      panel.render();
      this._plugins.set('density', panel);
    }
  }, {
    key: 'loadPanelData',
    value: function loadPanelData(tabName) {
      var _this2 = this;

      if (!this._plugins.has(tabName)) {
        return;
      }

      if (this._plugins.get(tabName) !== null) {
        return;
      }

      var block = document.getElementById(tabName + '_block');

      if (!block) {
        return;
      }

      overlayLib.showLoading(block);

      switch (tabName) {
        case 'pageinfo':
          this._dataSource.pageinfo.then(function (pageinfo) {
            return _this2.createPageInfo(block, pageinfo);
          }).catch(this._processFatalError);
          break;
        case 'diagnosis':
          this._dataSource.diagnosis.then(function (diagnosis) {
            return _this2.createDiagnosis(block, diagnosis);
          }).catch(this._processFatalError);
          break;
        case 'internal':
          this._dataSource.pageinfo.then(function (pageinfo) {
            return _this2.createLinkinfo(block, pageinfo, 'internal');
          }).catch(this._processFatalError);
          break;
        case 'external':
          this._dataSource.pageinfo.then(function (pageinfo) {
            return _this2.createLinkinfo(block, pageinfo, 'external');
          }).catch(this._processFatalError);
          break;
        case 'density':
          this._dataSource.pagedata.then(function (pageinfo) {
            return _this2.createDensity(block, pageinfo);
          }).catch(this._processFatalError);
          break;
      }
    }
  }, {
    key: 'initAfterLoad',
    value: function initAfterLoad() {
      var _this3 = this;

      this._menu = new MenuHighlight(this._menuRoot);
      this._menu.addEventListener('switch', function (link) {
        var arItems = link.getAttribute('href').split('#');
        var item = arItems.pop();
        _this3.switchPage(item);
      });

      this._menu.addEventListener('ready', function () {
        setTimeout(function () {
          dom.addClass(_this3._menu.activeElement, 'animate');
          _this3._menu.addEventListener('switch', function (link) {
            var arItems = link.getAttribute('href').split('#');
            var item = arItems.pop();
            _this3.registerEvent('common', 'switchModule', item);
          });
        }, 10);
      });

      new FloatPanel(this._menuRoot.parentNode, { paddingTop: 0 });

      var pageUrl = document.getElementById('page_url');
      var ellipsisActiveObserver = new IsEllipsisActive(pageUrl);
      var urlHint = null;
      ellipsisActiveObserver.addEventListener('active', function () {
        if (urlHint === null) {
          urlHint = new HintBox(pageUrl, {
            message: _this3._url,
            event: 'hover',
            className: 'seoquake-hintbox seoquake-hintbox-bottom seoquake-hintbox-wide seoquake-hintbox-wrap'
          });
        }
      });

      ellipsisActiveObserver.addEventListener('inactive', function () {
        if (urlHint !== null) {
          urlHint.remove();
          urlHint = null;
        }
      });

      overlayLib.hideLoading();

      this.dispatchEvent('ready');
    }
  }, {
    key: '_handleFatalError',
    value: function _handleFatalError(message) {
      var messageWindow = new MessageWindow();
      console.log(message);
      messageWindow.setContent(message);
      messageWindow.addButton('close-tab', 'Close').addEventListener('click', this._processCloseModuleClick);

      this.t('sqCommon_error_window_title').then(function (text) {
        return messageWindow.setTitle(text);
      }).catch(ignore);
      this.t('sqCommon_error_window_close').then(function (text) {
        return dom.text(messageWindow.getButton('close-tab'), text);
      }).catch(ignore);

      messageWindow.show();
    }
  }, {
    key: '_handleCloseModuleClick',
    value: function _handleCloseModuleClick(event) {
      event.stopPropagation();
      event.preventDefault();

      this._sendMessage('sq.moduleClose', { name: this._moduleName, id: this._args.get('id') });
    }
  }, {
    key: '_handleDensityClick',
    value: function _handleDensityClick(event) {
      if (event.target instanceof HTMLElement) {
        this.registerEvent('pageinfo', 'switchToDensity', dom.attr(event.target, 'rel'));
      }

      this._menu.clickElement('#density');
    }
  }, {
    key: '_handleModuleDataReady',
    value: function _handleModuleDataReady(dataUrl) {
      var hash = document.location.hash;
      this._url = dataUrl;
      dom.text(document.getElementById('page_url'), dataUrl);
      document.querySelector('button[data-role="compare"]').addEventListener('click', this._processCompareButtonClick);

      if (hash !== '') {
        hash = hash.substr(1);
        var link = this._menuRoot.querySelector('a[rel="' + hash + '"], a[data-rel*="' + hash + '"]');
        if (link) {
          dom.removeClass(this._menuRoot.querySelector('a.active'), 'active');
          dom.addClass(link, 'active');
        }
      }

      if (document.readyState === 'complete') {
        this.initAfterLoad();
      } else {
        window.addEventListener('load', this.initAfterLoad.bind(this), true);
      }
    }
  }, {
    key: '_handleCompareButtonClick',
    value: function _handleCompareButtonClick(event) {
      event.preventDefault();
      this._sendMessage('sq.moduleRun', { name: 'linkinfo', configuration: { url: this._url } });
    }
  }]);

  return CommonMain;
}();

quickTmixin(CommonMain.prototype);
eventsMixin(CommonMain.prototype);
messengerModuleMixin(CommonMain.prototype);
messengerTranslateMixin(CommonMain.prototype);

module.exports = CommonMain;

},{"../../../common/Lib":7,"../../../common/dom/main":38,"../../../common/effects/FloatPanel":47,"../../../common/effects/HintBox":48,"../../../common/effects/IsEllipsisActive":50,"../../../common/effects/MenuHighlight":51,"../../../common/effects/MessageWindow":52,"../../../common/effects/Overlay":53,"../../../common/lib/ignore":64,"../../../common/utils/eventsMixin":93,"../../../common/utils/messengerModuleMixin":96,"../../../common/utils/messengerTranslateMixin":97,"../../../common/utils/quickTmixin":99,"./DataSource":102,"./Density":103,"./Diagnosis":104,"./Linkinfo":105,"./PageInfo":106}],102:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var messengerMixin = require('../../../common/utils/messengerMixin');

var DataSource = function () {
  function DataSource(id) {
    _classCallCheck(this, DataSource);

    this._modulename = 'common';
    this._id = id;
    this._pageinfo = null;
    this._pagedata = null;
    this._diagnosis = null;
  }

  _createClass(DataSource, [{
    key: 'requestData',
    value: function requestData(command) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this._setTimeout(reject);

        _this.sendMessage('sq.moduleGetDataEx', {
          name: _this._modulename,
          id: _this._id,
          arguments: { command: command }
        }).then(function (pageData) {
          if (pageData !== null && pageData !== undefined) {
            resolve(pageData);
          } else {
            reject('Page data is not available. Looks like tab with page was closed.');
          }
        }).catch(reject);
      });
    }
  }, {
    key: '_setTimeout',
    value: function _setTimeout(reject) {
      setTimeout(function () {
        reject('Page data is not available. Looks like tab with page was closed.');
      }, 5000);
    }
  }, {
    key: 'pageinfo',
    get: function get() {
      if (this._pageinfo === null) {
        this._pageinfo = this.requestData('sq.requestPageInfo');
      }

      return this._pageinfo;
    }
  }, {
    key: 'diagnosis',
    get: function get() {
      if (this._diagnosis === null) {
        this._diagnosis = this.requestData('sq.requestPageDiagnosis');
      }

      return this._diagnosis;
    }
  }, {
    key: 'pagedata',
    get: function get() {
      if (this._pagedata === null) {
        this._pagedata = this.requestData('sq.requestPageData');
      }

      return this._pagedata;
    }
  }]);

  return DataSource;
}();

messengerMixin(DataSource.prototype);

module.exports = DataSource;

},{"../../../common/utils/messengerMixin":95}],103:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var overlayLib = require('../../../common/effects/Overlay.js');
var DensityPlugin = require('../../density/src/DensityPlugin.js');
var FloatPanel = require('../../../common/effects/FloatPanel.js');
var dom = require('../../../common/dom/main.js');
var messengerMixin = require('../../../common/utils/messengerMixin');

var Density = function () {
  function Density(container, pagedata) {
    _classCallCheck(this, Density);

    this.data = pagedata;
    this.container = container;
    this.pluginReadyHandler = this.pluginReady.bind(this);
  }

  _createClass(Density, [{
    key: 'pluginReady',
    value: function pluginReady() {
      var bookmarksPanel = this.container.querySelector('[data-role="bookmarks_panel"]');
      var topPanel = document.querySelector('header .main-menu');
      var bookmarksFloat = new FloatPanel(bookmarksPanel, {
        paddingTop: topPanel.offsetHeight
      });
      var filterFloat = new FloatPanel(this.container.querySelector('[data-role="filter_panel"]'), {
        paddingTop: topPanel.offsetHeight + bookmarksPanel.offsetHeight
      });

      filterFloat.addEventListener('inside', function () {
        dom.addClass(bookmarksPanel, 'float-bellow');
      });

      filterFloat.addEventListener('over', function () {
        dom.removeClass(bookmarksPanel, 'float-bellow');
      });

      if (document.location.hash !== '') {
        var hash = document.location.hash;
        if (['#word-1', '#word-2', '#word-3', '#word-4'].indexOf(hash) !== -1) {
          var element = this.container.querySelector('a[name="' + hash.substr(1) + '"]');

          var _dom$getOffset = dom.getOffset(element),
              top = _dom$getOffset.top;

          top -= document.querySelector('header div.main-menu').offsetHeight;
          element.ownerDocument.documentElement.scrollTop = top;
          element.ownerDocument.body.scrollTop = top;
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var plugin = new DensityPlugin(this.container);
      plugin.setMessenger(this.getMessenger());
      plugin.addEventListener('ready', this.pluginReadyHandler, true);

      plugin.showOverlay = function () {
        overlayLib.showLoading(_this.container);
      };

      plugin.hideOverlay = function () {
        overlayLib.hideLoading(_this.container);
      };

      plugin.progressOverlay = function (value) {
        overlayLib.progress(_this.container, value);
      };

      plugin.process = function () {
        return plugin.processPage(_this.data);
      };
      plugin.init();
    }
  }]);

  return Density;
}();

messengerMixin(Density.prototype);

module.exports = Density;

},{"../../../common/dom/main.js":38,"../../../common/effects/FloatPanel.js":47,"../../../common/effects/Overlay.js":53,"../../../common/utils/messengerMixin":95,"../../density/src/DensityPlugin.js":108}],104:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DiagnosisPlugin = require('../../diagnosis/src/DiagnosisPlugin');
var overlayLib = require('../../../common/effects/Overlay');
var messengerMixin = require('../../../common/utils/messengerMixin');

var Diagnosis = function () {
  function Diagnosis(container, pagedata) {
    _classCallCheck(this, Diagnosis);

    this.container = container;
    this.data = pagedata;
  }

  _createClass(Diagnosis, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var plugin = new DiagnosisPlugin(this.container);
      plugin.setMessenger(this.getMessenger());
      plugin.process = function () {
        plugin.processPageData(_this.data);
        overlayLib.hideLoading(_this.container);
      };

      plugin.init();

      this.container.querySelector('[data-role="audit-banner"]').addEventListener('click', function (e) {
        return _this.registerEvent(plugin.name, 'banner-click');
      });
      this.container.querySelector('[data-role="semrush-link"]').addEventListener('click', function (e) {
        return _this.registerEvent(plugin.name, 'semrush-click');
      });
    }
  }]);

  return Diagnosis;
}();

messengerMixin(Diagnosis.prototype);

module.exports = Diagnosis;

},{"../../../common/effects/Overlay":53,"../../../common/utils/messengerMixin":95,"../../diagnosis/src/DiagnosisPlugin":111}],105:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LinkInfoPlugin = require('../../linkinfo/src/LinkInfoPlugin');
var lib = require('../../../common/Lib');
var messengerMixin = require('../../../common/utils/messengerMixin');

var Linkinfo = function () {
  function Linkinfo(container, pagedata, type) {
    _classCallCheck(this, Linkinfo);

    this._data = pagedata;
    this._container = container;
    this._type = type;
  }

  _createClass(Linkinfo, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var plugin = new LinkInfoPlugin(this._container);
      plugin.name = this._type;
      plugin.setMessenger(this.getMessenger());
      plugin.process = function () {
        plugin.searchQuery = lib.parseUri(_this._data.location).domain;
        plugin.initFromPage(_this._data.linkInfo[_this._type]);
        var topPanel = document.querySelector('header .main-menu');
        plugin.overlay.floatTop = true;
        plugin.overlay.floatPadding = topPanel.offsetHeight;
      };

      plugin.init();
    }
  }]);

  return Linkinfo;
}();

messengerMixin(Linkinfo.prototype);

module.exports = Linkinfo;

},{"../../../common/Lib":7,"../../../common/utils/messengerMixin":95,"../../linkinfo/src/LinkInfoPlugin":112}],106:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PageInfoPlugin = require('./PageInfoPlugin');
var overlayLib = require('../../../common/effects/Overlay.js');
var messengerMixin = require('../../../common/utils/messengerMixin');

var PageInfo = function () {
  function PageInfo(container, pageinfo) {
    _classCallCheck(this, PageInfo);

    this.data = pageinfo;
    this.container = container;
  }

  _createClass(PageInfo, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var plugin = new PageInfoPlugin(this.container);
      plugin.setMessenger(this.getMessenger());
      plugin.process = function () {
        plugin.processPageData(_this.data);
        overlayLib.hideLoading(_this.container);
      };

      plugin.init();
    }
  }]);

  return PageInfo;
}();

messengerMixin(PageInfo.prototype);

module.exports = PageInfo;

},{"../../../common/effects/Overlay.js":53,"../../../common/utils/messengerMixin":95,"./PageInfoPlugin":107}],107:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var dom = require('../../../common/dom/main');
var BaseModule = require('../../../common/module/BaseModule');
var XHR = require('../../../common/utils/XHRProxy');
var Density = require('../../../common/density/Density');
var StopList = require('../../../common/density/StopList');
var HintBox = require('../../../common/effects/HintBox');
var lib = require('../../../common/Lib');
var getFindIn = require('../../../common/page/GetFindIn');
var normalizeNumber = require('../../../common/utils/normalizeNumber');
var ignore = require('../../../common/lib/ignore');

var PageInfoPlugin = function (_BaseModule) {
  _inherits(PageInfoPlugin, _BaseModule);

  function PageInfoPlugin(container) {
    _classCallCheck(this, PageInfoPlugin);

    var _this = _possibleConstructorReturn(this, (PageInfoPlugin.__proto__ || Object.getPrototypeOf(PageInfoPlugin)).call(this));

    container = container || document.body;
    _this.name = 'pageinfo';
    _this.searchQuery = 'pageinfo';
    _this.params = {};
    _this.query = {};
    _this.container = container;
    _this.parametersGroups = {
      'page-parameters': [0, 3, 34, 35, 36],
      'domain-parameters': [1, 20, 30, 31, 32, 37, 41, 42, 43, 108, 70, 50, 51, 53],
      'backlinks-parameters': [2, 15, 16, 17, 71],
      'other-parameters': []
    };
    return _this;
  }

  _createClass(PageInfoPlugin, [{
    key: 'init',
    value: function init() {
      this.T('title', 'sqPageinfo_title');
      this.T('title-basic', 'sqPageinfo_title_basic');
      this.T('title-title', 'sqPageinfo_title_title');
      this.T('page-title', 'sqPageinfo_page_title');
      this.T('title-keywords', 'sqPageinfo_title_keywords');
      this.T('page-meta-keywords', 'sqPageinfo_page_meta_keywords');
      this.T('title-description', 'sqPageinfo_title_description');
      this.T('page-meta-description', 'sqPageinfo_page_meta_description');
      this.T('title-internal', 'sqPageinfo_title_internal');
      this.T('page-links-internal', 'sqPageinfo_page_links_internal');
      this.T('title-external', 'sqPageinfo_title_external');
      this.T('page-links-external', 'sqPageinfo_page_links_external');
      this.T('title-server', 'sqPageinfo_title_server');
      this.T('page-server', 'sqPageinfo_page_server');
      this.T('link-print', 'sqPageinfo_link_print');
      this.T('title-parameters', 'sqPageinfo_title_parameters');
      this.T('title-page-parameters', 'sqPageinfo_title_page_parameters');
      this.T('title-domain-parameters', 'sqPageinfo_title_domain_parameters');
      this.T('title-backlinks-parameters', 'sqPageinfo_title_backlinks_parameters');
      this.T('title-other-parameters', 'sqPageinfo_title_other_parameters');
      this.T('other-parameters', 'sqPageinfo_other_parameters');
      this.T('title-keywords-density', 'sqPageinfo_title_keywords_density');
      this.T(true, 'see-all-keywords', 'sqPageinfo_see_all_keywords');
      this.T(true, 'keywords-keyword', 'sqPageinfo_keywords_keyword');
      this.T(true, 'keywords-foundin', 'sqPageinfo_keywords_foundin');
      this.T(true, 'keywords-repeats', 'sqPageinfo_keywords_repeats');
      this.T(true, 'keywords-density', 'sqPageinfo_keywords_density');
      this.T('total-words', 'sqPageinfo_total_words');
      this.T('total-2words', 'sqPageinfo_total_2words');
      this.T('total-3words', 'sqPageinfo_total_3words');
      this.T('total-4words', 'sqPageinfo_total_4words');

      _get(PageInfoPlugin.prototype.__proto__ || Object.getPrototypeOf(PageInfoPlugin.prototype), 'init', this).call(this);
    }
  }, {
    key: 'processPageData',
    value: function processPageData(page) {
      var _this2 = this;

      function clearContent(content) {
        return lib.cleanString(lib.stripTags(content)).replace(/\.\s/g, ' ');
      }

      dom.text(this.container.querySelector('[data-role="page-title"]'), page.title);
      dom.text(this.container.querySelector('[data-role="page-meta-keywords"]'), page.keywords);
      dom.text(this.container.querySelector('[data-role="page-meta-description"]'), page.description);
      dom.text(this.container.querySelector('[data-role="page-links-internal"]'), page.internal + ' (' + page.internal_nofollow + ' nofollow)');
      dom.text(this.container.querySelector('[data-role="page-links-external"]'), page.external + ' (' + page.external_nofollow + ' nofollow)');
      dom.text(this.container.querySelector('[data-role="page-server"]'), 'Loading...');

      var xhr = new XHR(this._messenger);
      xhr.setCallback(function (answer) {
        page.server = answer.getResponseHeader('Server');
        dom.text(_this2.container.querySelector('[data-role="page-server"]'), page.server);
      });

      xhr.send(page.location);

      this.processParams(page.location);
      this.processPageDensity(clearContent(page.content), page.title, page.keywords, page.description, page.h1title);

      this.container.querySelector('[data-role="link-print"]').addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        _this2._messenger.registerEvent(_this2.name, 'printClick');
        window.print();
      }, false);
    }
  }, {
    key: 'processParams',
    value: function processParams(pageUrl) {
      var parametersContainer = {
        'page-parameters': this.container.querySelector('[data-role="page-parameters"]'),
        'domain-parameters': this.container.querySelector('[data-role="domain-parameters"]'),
        'backlinks-parameters': this.container.querySelector('[data-role="backlinks-parameters"]'),
        'other-parameters': this.container.querySelector('[data-role="other-parameters"]')
      };

      for (var paramId in this.parameters) {
        if (!this.parameters.hasOwnProperty(paramId)) {
          continue;
        }

        var other = true;

        for (var k in this.parametersGroups) {
          if (!this.parametersGroups.hasOwnProperty(k)) {
            continue;
          }

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.parametersGroups[k][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var param = _step.value;

              if (parseInt(paramId) === parseInt(param)) {
                this.appendParameter(parametersContainer[k], param, pageUrl);
                other = false;
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
        }

        if (other) {
          var _param = this.parameters[paramId];
          var container = parametersContainer['other-parameters'];
          if (_param.hasOwnProperty('type')) {
            if (parametersContainer.hasOwnProperty(_param.type + '-parameters')) {
              container = parametersContainer[_param.type + '-parameters'];
            }
          }

          this.appendParameter(container, paramId, pageUrl);
        }
      }

      for (var elementKey in parametersContainer) {
        if (parametersContainer.hasOwnProperty(elementKey)) {
          var element = parametersContainer[elementKey];
          if (element.children.length === 0) {
            dom.css(element, 'display', 'none');
            dom.css(element.previousElementSibling, 'display', 'none');
          }
        }
      }

      this.processRequestUrls(this.requestUrls);
    }
  }, {
    key: 'renderValue',
    value: function renderValue(button, text) {
      var display = normalizeNumber(text);

      if (display.number !== null && display.shortValue !== text) {
        text = display.shortValue;
        new HintBox(button, { message: display.value, event: 'hover', inline: true });
      }

      dom.text(button, text);
    }
  }, {
    key: 'render',
    value: function render(renderParams) {
      var _this3 = this;

      if (!('requestUrlHash' in renderParams) || !renderParams.requestUrlHash) {
        return false;
      }

      var hash = renderParams.requestUrlHash;

      renderParams.params.forEach(function (paramId) {
        if (!(paramId in renderParams.values)) {
          return;
        }

        var value = renderParams.values[paramId];
        var selector = 'a[rel~="' + hash + '_' + paramId + '"]';
        var href = 'url-s' in _this3.requestUrls[hash] && paramId in _this3.requestUrls[hash]['url-s'] ? _this3.requestUrls[hash]['url-s'][paramId] : _this3.requestUrls[hash]['url-r'];

        var na = 'url-na' in _this3.requestUrls[hash] && paramId in _this3.requestUrls[hash]['url-na'] ? _this3.requestUrls[hash]['url-na'][paramId] : undefined;

        Array.from(_this3.container.querySelectorAll(selector)).forEach(function (link) {
          dom.attr(link, 'data-value', value);
          link.removeEventListener('click', _this3.requestParamListener, true);

          switch (renderParams.values[paramId]) {

            case lib.SEOQUAKE_RESULT_NODATA:
              link.href = na || href;
              dom.text(link, 'n/a');
              break;

            case lib.SEOQUAKE_RESULT_ERROR:
              dom.text(link, 'error');
              link.href = href;
              link.style.color = 'red';
              _this3.renderErrorValue(link, href);
              break;

            case lib.SEOQUAKE_RESULT_QUESTION:
              dom.text(link, value);
              link.href = '#';
              link.addEventListener('click', _this3.requestParamListener, true);
              break;

            case lib.SEOQUAKE_RESULT_WAIT:
              dom.text(link, value);
              link.href = '#';
              break;

            case lib.SEOQUAKE_RESULT_YES:
            default:
              link.href = href;
              link.addEventListener('click', _this3.showParameterSourceListener, true);
              _this3.renderValue(link, _this3.entities.decode(value));
              break;
          }
        });
      });

      this.dispatchEvent('render', renderParams);

      return true;
    }
  }, {
    key: 'appendParameter',
    value: function appendParameter(theTable, paramId, url) {
      var param = this.parameters[paramId];
      if (!param.hasOwnProperty('matches')) {
        return;
      }

      var urlHash = lib.shortHash(url);
      var container = dom('div', { className: 'sq-pageinfo-cell seoquake-params-cell', title: param.name });
      var parsedUrl = lib.parseUri(url);

      if ('icon' in param) {
        var src = param.icon;
        var icon = null;

        if (src.startsWith('//')) {
          src = 'http:' + src;
        }

        if (src.startsWith('http://') || src.startsWith('https://')) {
          icon = dom('img', { src: src });
        } else {
          icon = dom('span', { className: 'sqicn sqicn-' + src });
        }

        var circle = dom('span', { className: 'icn circle' });

        if (icon !== null) {
          circle.appendChild(icon);
        }

        container.appendChild(circle);
      }

      var theHref = '';
      var theRel = '';

      if ('url-r' in param) {
        var requestUrl = lib.createRequestUrl(param['url-r'], parsedUrl, this.searchQuery);
        var requestUrlHash = lib.shortHash(requestUrl);

        if (!(requestUrlHash in this.requestUrls)) {

          this.requestUrls[requestUrlHash] = {
            params: [],
            'url-r': requestUrl
          };
        }

        if ('url-s' in param) {
          if (!('url-s' in this.requestUrls[requestUrlHash])) {
            this.requestUrls[requestUrlHash]['url-s'] = {};
          }

          this.requestUrls[requestUrlHash]['url-s'][param.id] = lib.createRequestUrl(param['url-s'], parsedUrl, this.searchQuery);
        }

        if ('url-na' in param) {
          if (!this.requestUrls[requestUrlHash].hasOwnProperty('url-na')) {
            this.requestUrls[requestUrlHash]['url-na'] = {};
          }

          this.requestUrls[requestUrlHash]['url-na'][param.id] = param['url-na'];
        }

        this.requestUrls[requestUrlHash].params.push(param.id);
        theHref = '#';
        theRel = urlHash + ' ' + requestUrlHash + '_' + param.id;
      }

      var theLink = dom('a', { className: 'seoquake-params-link', href: theHref, rel: theRel, target: '_blank' });
      container.appendChild(dom('span', { className: 'description' }, param.title + ':'));
      container.appendChild(theLink);
      theTable.appendChild(container);
    }
  }, {
    key: '_createFindInCell',
    value: function _createFindInCell(foundIn) {
      var _this4 = this;

      var result = dom('td');
      foundIn.forEach(function (type) {
        var span = dom('span', { className: 'tooltiped' }, type);
        result.appendChild(span);
        _this4._messenger.t('sqDensity_type_' + type + '_hint', function (message) {
          return new HintBox(span, { event: 'hover', message: message });
        });
      });

      return result;
    }
  }, {
    key: 'processPageDensity',
    value: function processPageDensity(srcContent, srcTitle, srcKwds, srcDescr, srcH1Title) {
      var _this5 = this;

      function keywordLinkClickListener(event) {
        if (event.target.tagName === 'A') {
          this._messenger.registerEvent(this.name, 'keywordClick');
        }
      }

      var density = new Density(srcContent);
      density.stopList = new StopList(this._messenger);
      density.getKeywords().then(function (keywords) {
        for (var i = 0, kwl = keywords.length; i < kwl; i++) {

          dom.text(_this5.container.querySelector('[data-role="' + (i + 1) + '-word-count"]'), keywords[i].count);
          var table = _this5.container.querySelector('[data-role="' + (i + 1) + '-word-table"]');
          if (!table || !table.tBodies[0]) {
            continue;
          }

          for (var j = 0, l = Math.min(keywords[i].words.length, 10); j < l; j++) {
            var foundIn = getFindIn(keywords[i].words[j].word, srcTitle, srcDescr, srcKwds, srcH1Title);
            var row = table.tBodies[0].insertRow();
            dom.attr(row, 'rel', keywords[i].words[j].word);
            dom.attr(row, 'class', 'density-keywords-row');
            var cell = row.insertCell();
            dom.addClass(cell, 'border-right');
            cell.appendChild(dom('a', {
              href: 'https://www.semrush.com/search.php?q=' + encodeURI(keywords[i].words[j].word) + '&utm_source=seoquake&utm_medium=toolbar&utm_campaign=regular&ref=174537735',
              target: '_blank'
            }, keywords[i].words[j].word));
            row.appendChild(_this5._createFindInCell(foundIn));
            cell = row.insertCell();
            dom.text(cell, keywords[i].words[j].count);
            dom.attr(cell, 'class', 'right');
            cell = row.insertCell();
            dom.text(cell, keywords[i].words[j].density.toFixed(2) + '%');
            dom.attr(cell, 'class', 'right');
          }

          table.addEventListener('click', keywordLinkClickListener.bind(_this5));
        }
      }).catch(ignore);
    }
  }]);

  return PageInfoPlugin;
}(BaseModule);

module.exports = PageInfoPlugin;

},{"../../../common/Lib":7,"../../../common/density/Density":14,"../../../common/density/StopList":15,"../../../common/dom/main":38,"../../../common/effects/HintBox":48,"../../../common/lib/ignore":64,"../../../common/module/BaseModule":76,"../../../common/page/GetFindIn":79,"../../../common/utils/XHRProxy":89,"../../../common/utils/normalizeNumber":98}],108:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lib = require('../../../common/Lib');
var ignore = require('../../../common/lib/ignore');
var dom = require('../../../common/dom/main');
var BaseModule = require('../../../common/module/BaseModule');
var Density = require('../../../common/density/Density');
var StopList = require('../../../common/density/StopList');
var HintBox = require('../../../common/effects/HintBox');
var CreateFileName = require('../../../common/utils/CreateFilename');
var StopListWindow = require('./StopListWindow');
var TableSort = require('./ui/TableSort');

var DensityPlugin = function (_BaseModule) {
  _inherits(DensityPlugin, _BaseModule);

  function DensityPlugin(container) {
    _classCallCheck(this, DensityPlugin);

    var _this = _possibleConstructorReturn(this, (DensityPlugin.__proto__ || Object.getPrototypeOf(DensityPlugin)).call(this));

    container = container || null;

    _this.name = 'density';
    _this.container = container;
    _this.saveToFileListener = _this.saveToFileHandler.bind(_this);
    _this.configureListener = _this.configureHandler.bind(_this);

    _this.pageData = null;
    _this.keywords = [];
    _this.tableSorts = new Map();
    return _this;
  }

  _createClass(DensityPlugin, [{
    key: 'init',
    value: function init() {
      this.T('title', 'sqDensity_title');
      this.T('totalLinks', 'sqDensity_totalLinks');
      this.T('1-word-count', 'sqDensity_1_word_count');
      this.T('2-word-phrases', 'sqDensity_2_word_phrases');
      this.T('3-word-phrases', 'sqDensity_3_word_phrases');
      this.T('4-word-phrases', 'sqDensity_4_word_phrases');
      this.T('button-save', 'sqDensity_button_save');
      this.T('button-configure', 'sqDensity_button_configure');
      this.T('all-words-title', 'sqDensity_all_words_title');
      this.T(true, 'keywords-keyword', 'sqDensity_keywords_keyword');
      this.T(true, 'keywords-foundin', 'sqDensity_keywords_foundin');
      this.T(true, 'keywords-repeats', 'sqDensity_keywords_repeats');
      this.T(true, 'keywords-density', 'sqDensity_keywords_density');
      this.T(true, 'keywords-prominence', 'sqDensity_keywords_prominence');
      this.T('2-words-title', 'sqDensity_2_words_title');
      this.T('3-words-title', 'sqDensity_3_words_title');
      this.T('4-words-title', 'sqDensity_4_words_title');
      this.T('original-text', 'sqDensity_original_text');
      this.T('info-content', 'sqDensity_info_content');
      this.T('bookmarks-title', 'sqDensity_bookmarks_title');
      this.T('1word-link', 'sqDensity_1word_link');
      this.T('2word-link', 'sqDensity_2word_link');
      this.T('3word-link', 'sqDensity_3word_link');
      this.T('4word-link', 'sqDensity_4word_link');
      this.T('original-link', 'sqDensity_original_link');
      this.T('pageinfo-title', 'sqDensity_pageinfo_title');
      this.T('pageinfo-title-title', 'sqDensity_pageinfo_title_title');
      this.T('info-title', 'sqDensity_info_title');
      this.T('pageinfo-keywords-title', 'sqDensity_pageinfo_keywords_title');
      this.T('info-meta-keywords', 'sqDensity_info_meta_keywords');
      this.T('pageinfo-description-title', 'sqDensity_pageinfo_description_title');
      this.T('info-meta-description', 'sqDensity_info_meta_description');
      this.T('filter-title', 'sqDensity_filter_title');
      this.T('button-filter-apply', 'sqDensity_button_filter_apply');
      this.T('button-filter-reset', 'sqDensity_button_filter_reset');
      this.T('starts-with', 'sqDensity_starts_with');
      this.T('contains', 'sqDensity_contains');
      this.T('regexp', 'sqDensity_regexp');
      this.T('keywords-title', 'sqDensity_keywords_title');
      this.T('density-cloud', 'sqDensity_density_cloud');

      _get(DensityPlugin.prototype.__proto__ || Object.getPrototypeOf(DensityPlugin.prototype), 'init', this).call(this);
    }
  }, {
    key: 'showOverlay',
    value: function showOverlay() {}
  }, {
    key: 'hideOverlay',
    value: function hideOverlay() {}
  }, {
    key: 'progressOverlay',
    value: function progressOverlay() {}
  }, {
    key: 'process',
    value: function process() {
      throw new Error('Should be redifined');
    }
  }, {
    key: 'saveToFileHandler',
    value: function saveToFileHandler(event) {
      var _this2 = this;

      event.preventDefault();
      event.stopPropagation();

      return new Promise(function (resolve) {
        var button = event.currentTarget;

        if (_this2.pageData === null) {
          throw new Error('processPage should be called before save');
        }

        var filename = new CreateFileName(_this2._messenger, lib.parseUri(_this2.pageData.location).domain + ' - density');

        resolve(filename.filename.then(function (filename) {
          dom.attr(button, 'disabled', true);

          var data = [];
          _this2.keywords.forEach(function (keywords, index) {
            data.push(_this2.getHeadersLine().join(';'));

            var table = _this2.container.querySelector('[data-role="' + (index + 1) + '-word-table"]');
            if (!table || !table.tBodies[0]) {
              return;
            }

            data.push(_this2.getDataLines(table.tBodies[0].rows).join('\n'));
          });

          if ('chrome' === 'firefox') {
            return browser.downloads.download({
              filename: filename,
              url: URL.createObjectURL(new Blob([data], { type: 'text/plain' }))
            }).then(function () {
              _this2.registerEvent(_this2.name, 'saveResultToFile');
              dom.attr(button, 'disabled', null);
            }).catch(function (e) {
              return console.log(e);
            });
          } else {

            var url = window.webkitURL || window.URL || window.mozURL || window.msURL;
            var a = document.createElement('a');
            a.download = filename;
            if ('chrome' === 'safari') {
              a.href = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(data.join('\n'));
            } else {
              a.href = url.createObjectURL(new Blob([data.join('\n')], { type: 'text/plain' }));
              a.dataset.downloadurl = ['csv', a.download, a.href].join(':');
            }

            var clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true
            });
            a.dispatchEvent(clickEvent);

            _this2.registerEvent(_this2.name, 'saveResultToFile');
            dom.attr(button, 'disabled', null);
            return filename;
          }
        }));
      });
    }
  }, {
    key: 'configureHandler',
    value: function configureHandler(event) {
      var _this3 = this;

      event.preventDefault();
      var wind = new StopListWindow();
      wind.setMessenger(this._messenger);
      wind.init();
      wind.show();
      wind.addEventListener('save', function () {
        _this3.redraw();
      });
      this.registerEvent('density', 'configureStopList');
    }
  }, {
    key: 'getHeadersLine',
    value: function getHeadersLine() {
      return ['"Keyword"', '"Found in"', '"Repeats"', '"Density"', '"Prominence"'];
    }
  }, {
    key: 'getDataLines',
    value: function getDataLines(rows) {
      var tpl = '"%s"';
      var result = [];
      Array.from(rows).forEach(function (row) {
        var line = [];
        line.push(tpl.replace('%s', dom.text(row.cells[0])));
        line.push(tpl.replace('%s', dom.text(row.cells[1])));
        line.push(tpl.replace('%s', dom.text(row.cells[2])));
        line.push(tpl.replace('%s', dom.text(row.cells[3])));
        line.push(tpl.replace('%s', dom.text(row.cells[4])));

        result.push(line.join(';'));
      });

      return result;
    }
  }, {
    key: 'redraw',
    value: function redraw() {
      var _this4 = this;

      if (this.pageData === null) {
        return;
      }

      this.showOverlay();

      var density = new Density(this.pageData.content);
      density.stopList = new StopList(this._messenger);
      density.getKeywords().then(function (result) {
        _this4.keywords = result;
        if (_this4.container !== null) {
          _this4.processContent(_this4.pageData);
          dom.text(_this4.container.querySelector('[data-role="info-title"]'), _this4.pageData.title);
          dom.text(_this4.container.querySelector('[data-role="info-meta-keywords"]'), _this4.pageData.keywords);
          dom.text(_this4.container.querySelector('[data-role="info-meta-description"]'), _this4.pageData.description);
          dom.text(_this4.container.querySelector('[data-role="info-content"]'), _this4.pageData.content);
          _this4.container.querySelector('[data-role="button-filter-apply"]').addEventListener('click', _this4.applyFilter.bind(_this4));
          _this4.container.querySelector('[data-role="button-filter-reset"]').addEventListener('click', _this4.resetFilter.bind(_this4));
          _this4.container.querySelector('[data-role="form-filter"]').addEventListener('submit', _this4.applyFilter.bind(_this4));
          _this4.container.querySelector('[data-role="button-save"]').addEventListener('click', _this4.saveToFileListener);
          _this4.container.querySelector('[data-role="button-configure"]').addEventListener('click', _this4.configureListener);
          _this4.dispatchEvent('ready');
          _this4.hideOverlay();
        }
      }).catch(function (reason) {
        ignore(reason);
        _this4.dispatchEvent('ready');
        _this4.hideOverlay();
      });
    }
  }, {
    key: 'processPage',
    value: function processPage(page) {
      page.content = this.clearContent(page.content);
      this.pageData = page;
      this.redraw();
    }
  }, {
    key: 'fillCloud',
    value: function fillCloud(keywords) {
      var words = keywords[0].words.slice(0, keywords[0].words.length > 75 ? 75 : keywords[0].words.length);
      var cloud = this.container.querySelector('[data-role="density-cloud"]');
      var maxDensity = words[0].density;
      var minDensity = words[words.length - 1].density;
      var step = (maxDensity - minDensity) / 10;

      dom.emptyElement(cloud);
      for (var i = 0, wl = words.length; i < wl; i++) {
        var fontSize = step === 0 ? 10 : Math.floor((words[i].density - minDensity) / step + 10);
        cloud.appendChild(dom('a', { href: '#', style: 'font-size:' + fontSize + 'pt' }, words[i].word));
        cloud.appendChild(this.container.ownerDocument.createTextNode(' '));
      }

      cloud.addEventListener('click', this.applyFilter.bind(this), true);
    }
  }, {
    key: '_createFindInCell',
    value: function _createFindInCell(foundIn) {
      var _this5 = this;

      var result = dom('td');
      foundIn.forEach(function (type) {
        var span = dom('span', { className: 'tooltiped' }, type);
        result.appendChild(span);
        _this5.t('sqDensity_type_' + type + '_hint').then(function (message) {
          return new HintBox(span, { event: 'hover', message: message });
        }).catch(ignore);
      });

      return result;
    }
  }, {
    key: 'processContent',
    value: function processContent(page) {
      for (var i = 0, kwl = this.keywords.length; i < kwl; i++) {

        dom.text(this.container.querySelector('[data-role="' + (i + 1) + '-word-count"]'), this.keywords[i].count);

        var table = this.container.querySelector('[data-role="' + (i + 1) + '-word-table"]');
        if (!table || !table.tBodies[0]) {
          continue;
        }

        var tableSort = void 0;

        if (this.tableSorts.has(table)) {
          tableSort = this.tableSorts.get(table);
          tableSort.remove();
        } else {
          tableSort = new TableSort(table);
          this.tableSorts.set(table, tableSort);
        }

        dom.emptyElement(table.tBodies[0]);

        for (var j = 0, l = this.keywords[i].words.length; j < l; j++) {
          var foundIn = this.getFindIn(this.keywords[i].words[j].word, page.title, page.keywords, page.description, page.h1title);
          this.keywords[i].words[j].foundIn = foundIn;

          var row = table.tBodies[0].insertRow();
          dom.attr(row, 'rel', this.keywords[i].words[j].word);
          dom.attr(row, 'class', 'density-keywords-row');
          var cell = row.insertCell();
          dom.addClass(cell, 'border-right');
          cell.appendChild(dom('a', {
            href: 'https://www.semrush.com/search.php?q=' + encodeURI(this.keywords[i].words[j].word) + '&utm_source=seoquake&utm_medium=toolbar&utm_campaign=regular&ref=174537735',
            target: '_blank'
          }, this.keywords[i].words[j].word));
          row.appendChild(this._createFindInCell(foundIn));
          cell = row.insertCell();
          dom.text(cell, this.keywords[i].words[j].count);
          dom.attr(cell, 'class', 'right');
          cell = row.insertCell();
          dom.text(cell, this.keywords[i].words[j].density.toFixed(2) + '%');
          dom.attr(cell, 'class', 'right');
          cell = row.insertCell();
          dom.text(cell, this.keywords[i].words[j].prominence.toFixed(2) + '%');
          dom.attr(cell, 'class', 'right');
        }

        tableSort.addColumn(table.tHead.rows[0].cells[2]);
        tableSort.addColumn(table.tHead.rows[0].cells[3]);
        tableSort.addColumn(table.tHead.rows[0].cells[4]);

        table.addEventListener('click', DensityPlugin.keywordLinkClickListener.bind(this), true);
      }

      if (this.keywords[0].words.length > 0) {
        this.fillCloud(this.keywords);
      }
    }
  }, {
    key: 'clearContent',
    value: function clearContent(content) {
      return lib.cleanString(lib.stripTags(content)).replace(/\.+\s/g, ' ');
    }
  }, {
    key: 'applyFilter',
    value: function applyFilter(event) {
      event.preventDefault();
      event.stopPropagation();

      var value = void 0;

      if (event.target.tagName === 'A') {
        value = dom.text(event.target);
        dom.value(this.container.querySelector('[data-role="filter-value"]'), value);
        this.registerEvent('density', 'cloudWordClick');
      } else {
        value = dom.value(this.container.querySelector('[data-role="filter-value"]'));
        this.registerEvent('density', 'filterKeywords');
      }

      var typeEls = this.container.querySelectorAll('input[name="filter-type"]');
      for (var i = 0, l = typeEls.length; i < l; i++) {
        if (typeEls[i].checked) {
          this.filter(value, parseInt(typeEls[i].value));
          return;
        }
      }
    }
  }, {
    key: 'resetFilter',
    value: function resetFilter() {
      dom.value(this.container.querySelector('[data-role="filter-value"]'), '');
      this.container.querySelector('[name="filter-type"][value="0"]').checked = true;
      this.filter();
      this.registerEvent('density', 'clearFilter');
    }
  }, {
    key: 'filter',
    value: function filter(value, type) {
      var els = this.container.querySelectorAll('.density-keywords-row');
      var n = 0;

      type = parseInt(type);
      for (var i = els.length - 1; i >= 0; i--) {
        var word = els[i].getAttribute('rel');
        if (type === 0 && !lib.startsWith(word, value)) {
          els[i].style.display = 'none';
        } else if (type === 1 && word.indexOf(value) === -1) {
          els[i].style.display = 'none';
        } else if (type === 2 && !new RegExp(value).exec(word)) {
          els[i].style.display = 'none';
        } else {
          els[i].style.display = 'table-row';
          els[i].setAttribute('class', 'density-keywords-row ' + (n % 2 === 0 ? 'even' : 'odd'));
          n++;
        }
      }
    }
  }], [{
    key: 'keywordLinkClickListener',
    value: function keywordLinkClickListener(event) {
      if (event.target.tagName === 'A') {
        this.registerEvent('density', 'keywordClick');
      }
    }
  }]);

  return DensityPlugin;
}(BaseModule);

DensityPlugin.prototype.getFindIn = require('../../../common/page/GetFindIn');

module.exports = DensityPlugin;

},{"../../../common/Lib":7,"../../../common/density/Density":14,"../../../common/density/StopList":15,"../../../common/dom/main":38,"../../../common/effects/HintBox":48,"../../../common/lib/ignore":64,"../../../common/module/BaseModule":76,"../../../common/page/GetFindIn":79,"../../../common/utils/CreateFilename":86,"./StopListWindow":109,"./ui/TableSort":110}],109:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MessageWindow = require('../../../common/effects/MessageWindow');
var eventsMixin = require('../../../common/utils/eventsMixin');
var messengerMixin = require('../../../common/utils/messengerMixin');
var messengerTranslateMixin = require('../../../common/utils/messengerTranslateMixin');
var quickTmixin = require('../../../common/utils/quickTmixin');
var extend = require('extend');
var overlayLib = require('../../../common/effects/Overlay');
var StopList = require('../../../common/density/StopList');
var dom = require('../../../common/dom/main');
var ignore = require('../../../common/lib/ignore');

var StopListWindow = function (_MessageWindow) {
  _inherits(StopListWindow, _MessageWindow);

  function StopListWindow(container, config) {
    _classCallCheck(this, StopListWindow);

    config = extend(true, { autoInit: false }, config);

    var _this = _possibleConstructorReturn(this, (StopListWindow.__proto__ || Object.getPrototypeOf(StopListWindow)).call(this, container, config));

    _this._stopList = null;
    _this._useDefaultCheckbox = null;
    _this._includeTextbox = null;
    _this._excludeTextbox = null;
    return _this;
  }

  _createClass(StopListWindow, [{
    key: 'exportDefaultList',
    value: function exportDefaultList() {
      var data = this._stopList.defaultList.join('\n');
      var url = window.URL;
      var a = document.createElement('a');
      a.download = 'default-stop-list.txt';
      if ('chrome' === 'safari') {
        a.href = 'data:attachment/txt;charset=utf-8,' + encodeURIComponent(data);
      } else {
        a.href = url.createObjectURL(new Blob([data], { type: 'text/plain' }));
        a.dataset.downloadurl = ['txt', a.download, a.href].join(':');
      }

      var clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      a.dispatchEvent(clickEvent);
      this.registerEvent('stopListWindow', 'exportDefaultList');
    }
  }, {
    key: 'init',
    value: function init() {
      var _this2 = this;

      _get(StopListWindow.prototype.__proto__ || Object.getPrototypeOf(StopListWindow.prototype), 'init', this).call(this);

      this._stopList = new StopList();
      this._stopList.setMessenger(this._messenger);

      this.t('sqDensity_configure_title').then(function (msg) {
        return _this2.setTitle(msg);
      }).catch(ignore);

      this.addButton('save', 'Save', 'sqbtn sqbtn-small sqbtn-green').addEventListener('click', function (event) {
        return _this2.save();
      });
      this.addButton('close', 'Close', 'sqbtn sqbtn-small sqbtn-transparent sqbtn-gray').addEventListener('click', function (event) {
        return _this2.close();
      });

      this.t('sqDensity_configure_save').then(function (msg) {
        return dom.text(_this2.getButton('save'), msg);
      }).catch(ignore);
      this.t('sqDensity_configure_close').then(function (msg) {
        return dom.text(_this2.getButton('close'), msg);
      }).catch(ignore);

      var div = dom('div');
      var checkboxId = 'use-default-' + Math.random();

      var downloadDefaultListLink = dom('a', { href: '#list' }, 'stop-word list');
      downloadDefaultListLink.addEventListener('click', function (event) {
        event.preventDefault();
        _this2.exportDefaultList();
      });

      this.t('sqDensity_configure_default_link').then(function (msg) {
        return dom.text(downloadDefaultListLink, msg);
      }).catch(ignore);

      var label = dom('label', { forId: checkboxId }, ['Use default ', downloadDefaultListLink]);

      this._useDefaultCheckbox = dom('input', { type: 'checkbox', value: '1', id: checkboxId });
      div.appendChild(dom('div', { className: 'checkboxes' }, [this._useDefaultCheckbox, label]));

      this.t('sqDensity_configure_default_label').then(function (msg) {
        return dom.setText(label, msg);
      }).catch(ignore);

      var includeId = 'include-list-' + Math.random();
      var label2 = dom('label', { forId: includeId }, 'Use custom stop-word list');
      this._includeTextbox = dom('textarea', { id: includeId, placeholder: 'Enter words to exclude' });
      div.appendChild(dom('div', { className: 'textareas' }, [label2, this._includeTextbox]));

      this.t('sqDensity_configure_custom_list').then(function (msg) {
        return dom.setText(label2, msg);
      }).catch(ignore);
      this.t('sqDensity_configure_custom_list_placeholder').then(function (msg) {
        return dom.attr(_this2._includeTextbox, 'placeholder', msg);
      }).catch(ignore);

      var excludeId = 'exclude-list-' + Math.random();
      var label3 = dom('label', { forId: excludeId }, 'Use whitelist');
      this._excludeTextbox = dom('textarea', { id: excludeId, placeholder: 'Enter words to include' });
      div.appendChild(dom('div', { className: 'textareas' }, [label3, this._excludeTextbox]));

      this.t('sqDensity_configure_include_list').then(function (msg) {
        return dom.setText(label3, msg);
      }).catch(ignore);
      this.t('sqDensity_configure_include_list_placeholder').then(function (msg) {
        return dom.attr(_this2._excludeTextbox, 'placeholder', msg);
      }).catch(ignore);

      this.setContent(div);
    }
  }, {
    key: 'show',
    value: function show() {
      var _this3 = this;

      _get(StopListWindow.prototype.__proto__ || Object.getPrototypeOf(StopListWindow.prototype), 'show', this).call(this);

      var overlay = new overlayLib.Overlay(this.body);
      overlay.show();

      this._stopList.load().then(function () {
        _this3.useDefaultChecked = _this3._stopList.useDefault;
        _this3.includeText = _this3._stopList.includeText;
        _this3.excludeText = _this3._stopList.excludeText;
        overlay.hide();
      }).catch(function (reason) {
        console.log(reason);
        _this3.close();
      });
    }
  }, {
    key: 'close',
    value: function close() {
      this.dispatchEvent('cancel');
      _get(StopListWindow.prototype.__proto__ || Object.getPrototypeOf(StopListWindow.prototype), 'close', this).call(this);
    }
  }, {
    key: 'save',
    value: function save() {
      if (!this._init) {
        return;
      }

      this._stopList.useDefault = this._useDefaultCheckbox.checked;
      this._stopList.includeText = dom.value(this._includeTextbox);
      this._stopList.excludeText = dom.value(this._excludeTextbox);
      this._stopList.saveData();
      this.dispatchEvent('save');
      _get(StopListWindow.prototype.__proto__ || Object.getPrototypeOf(StopListWindow.prototype), 'close', this).call(this);
    }
  }, {
    key: 'useDefaultChecked',
    get: function get() {
      if (!this._init) {
        return true;
      }

      return dom.attr(this._useDefaultCheckbox, 'checked');
    },
    set: function set(value) {
      this._init && dom.attr(this._useDefaultCheckbox, 'checked', value === false ? null : true);
    }
  }, {
    key: 'includeText',
    get: function get() {
      if (!this._init) {
        return '';
      }

      return dom.value(this._includeTextbox);
    },
    set: function set(value) {
      this._init && dom.value(this._includeTextbox, value);
    }
  }, {
    key: 'excludeText',
    get: function get() {
      if (!this._init) {
        return '';
      }

      return dom.value(this._excludeTextbox);
    },
    set: function set(value) {
      this._init && dom.value(this._excludeTextbox, value);
    }
  }]);

  return StopListWindow;
}(MessageWindow);

eventsMixin(StopListWindow.prototype);
messengerMixin(StopListWindow.prototype);
messengerTranslateMixin(StopListWindow.prototype);
quickTmixin(StopListWindow.prototype);

module.exports = StopListWindow;

},{"../../../common/density/StopList":15,"../../../common/dom/main":38,"../../../common/effects/MessageWindow":52,"../../../common/effects/Overlay":53,"../../../common/lib/ignore":64,"../../../common/utils/eventsMixin":93,"../../../common/utils/messengerMixin":95,"../../../common/utils/messengerTranslateMixin":97,"../../../common/utils/quickTmixin":99,"extend":118}],110:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dom = require('../../../../common/dom/main');

var TableSort = function () {
  function TableSort(table) {
    _classCallCheck(this, TableSort);

    if (!(table instanceof Node)) {
      throw new Error('Should give table');
    }

    this._table = table;
    this._cols = new Map();

    this.processSortClick = this.handleSortClick.bind(this);
  }

  _createClass(TableSort, [{
    key: 'reSort',
    value: function reSort(sort, order) {
      var tbody = this._table.tBodies[0];
      var rows = Array.from(tbody.rows);
      rows.forEach(function (row) {
        return tbody.removeChild(row);
      });

      if (order === TableSort.DESC) {
        sort = TableSort.reverse(sort);
      }

      rows.sort(sort);
      rows.forEach(function (row) {
        return tbody.appendChild(row);
      });
    }
  }, {
    key: 'addColumn',
    value: function addColumn(th, compareCallback) {
      compareCallback = compareCallback || TableSort.createSortFloatASC(th);

      if (this._cols.has(th)) {
        var _col = this._cols.get(th);
        _col.sort = compareCallback;
        return;
      }

      var col = {
        order: TableSort.NONE,
        sort: compareCallback
      };

      this._cols.set(th, col);

      th.addEventListener('click', this.processSortClick, true);
      dom.addClass(th, 'sqts-sortable');
    }
  }, {
    key: 'remove',
    value: function remove() {
      var _this = this;

      this.clearCurrentColumnsState();
      this._cols.forEach(function (col, th) {
        th.removeEventListener('click', _this.processSortClick, true);
        dom.removeClass(th, 'sqts-sortable');
      });

      this._cols.clear();
    }
  }, {
    key: 'clearCurrentColumnsState',
    value: function clearCurrentColumnsState() {
      this._cols.forEach(function (col, th) {
        switch (col.order) {
          case TableSort.DESC:
            dom.removeClass(th, 'sqts-sortable_desc');
            break;
          default:
            dom.removeClass(th, 'sqts-sortable_asc');
            break;
        }
      });
    }
  }, {
    key: 'handleSortClick',
    value: function handleSortClick(event) {
      var th = event.currentTarget;
      if (!this._cols.has(th)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      this.clearCurrentColumnsState();

      var column = this._cols.get(th);

      switch (column.order) {
        case TableSort.ASC:
          column.order = TableSort.DESC;
          dom.addClass(th, 'sqts-sortable_desc');
          break;
        case TableSort.DESC:
          column.order = TableSort.ASC;
          dom.addClass(th, 'sqts-sortable_asc');
          break;
        default:
          column.order = TableSort.ASC;
          dom.addClass(th, 'sqts-sortable_asc');
          break;
      }

      this.reSort(column.sort, column.order);
    }
  }], [{
    key: 'createSortFloatASC',
    value: function createSortFloatASC(th) {
      var index = void 0;
      if (!th.parentNode) {
        index = 0;
      } else {
        index = Array.from(th.parentNode.cells).indexOf(th);
      }

      return function (rowA, rowB) {
        return TableSort.sortFloatASC(dom.text(rowA.cells[index]), dom.text(rowB.cells[index]));
      };
    }
  }, {
    key: 'sortFloatASC',
    value: function sortFloatASC(a, b) {
      var valueA = parseFloat(a);
      var valueB = parseFloat(b);
      return valueA - valueB;
    }
  }, {
    key: 'reverse',
    value: function reverse(sort) {
      return function (a, b) {
        return -sort(a, b);
      };
    }
  }]);

  return TableSort;
}();

TableSort.NONE = 0;
TableSort.ASC = 1;
TableSort.DESC = 2;

module.exports = TableSort;

},{"../../../../common/dom/main":38}],111:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var lib = require('../../../common/Lib');
var dom = require('../../../common/dom/main');
var BaseModule = require('../../../common/module/BaseModule');

var Diagnosis = require('../../../common/diagnosis/Diagnosis');
var DiagnosisResult = require('../../../common/diagnosis/DiagnosisResult');
var State = require('../../../common/diagnosis/DiagnosisStates');
var SlidePanel = require('../../../common/effects/SlidePanel').SlidePanel;
var hintDropdown = require('../../../common/effects/HintDropdown');
var CounterElement = require('../../../common/dom/CounterElement');

var DiagnosisPlugin = function (_BaseModule) {
  _inherits(DiagnosisPlugin, _BaseModule);

  function DiagnosisPlugin(container) {
    _classCallCheck(this, DiagnosisPlugin);

    var _this = _possibleConstructorReturn(this, (DiagnosisPlugin.__proto__ || Object.getPrototypeOf(DiagnosisPlugin)).call(this));

    _this.name = 'diagnosis';
    _this.AJAX_TIMEOUT = 20000;
    _this.container = container;
    _this.processResultEventListener = _this.processResultEvent.bind(_this);
    _this._counters = new Map();
    return _this;
  }

  _createClass(DiagnosisPlugin, [{
    key: 'init',
    value: function init() {
      this.T('title', 'sqDiagnosis_title');
      this.T('passed', 'sqDiagnosis_passed');
      this.T('success-counter', 'sqDiagnosis_success_counter');
      this.T('error', 'sqDiagnosis_error');
      this.T('error-counter', 'sqDiagnosis_error_counter');
      this.T('warning', 'sqDiagnosis_warning');
      this.T('warning-counter', 'sqDiagnosis_warning_counter');
      this.T('audit-banner', 'sqDiagnosis_audit_banner');
      this.T('semrush-provided', 'sqDiagnosis_semrush_provided');

      this.T('title-page-rules', 'sqDiagnosis_title_page_rules');
      this.T('title-mobile-rules', 'sqDiagnosis_title_mobile_rules');
      this.T('title-site-rules', 'sqDiagnosis_title_site_rules');

      this.T('message', 'sqDiagnosis_message');
      this.T('value', 'sqDiagnosis_value');
      this.T(true, 'open', 'sqDiagnosis_open');
      this.T(true, 'close', 'sqDiagnosis_close');
      this.T('show', 'sqDiagnosis_show');
      this.T('more-checks-text', 'sqDiagnosis_more_checks_text');
      this.T('more-checks-link', 'sqDiagnosis_more_checks_link');

      this.T('rule-url-title', 'sqDiagnosis_rule_url_title');
      this.T2('rule-url-tip', 'sqDiagnosis_rule_url_tip');

      this.T('rule-canonical-title', 'sqDiagnosis_rule_canonical_title');
      this.T2('rule-canonical-tip', 'sqDiagnosis_rule_canonical_tip');

      this.T('rule-title-title', 'sqDiagnosis_rule_title_title');
      this.T2('rule-title-tip', 'sqDiagnosis_rule_title_tip');

      this.T('rule-meta-title', 'sqDiagnosis_rule_meta_title');
      this.T2('rule-meta-tip', 'sqDiagnosis_rule_meta_tip');

      this.T('rule-keywords-title', 'sqDiagnosis_rule_keywords_title');
      this.T2('rule-keywords-tip', 'sqDiagnosis_rule_keywords_tip');

      this.T('rule-headings-title', 'sqDiagnosis_rule_headings_title');
      this.T2('rule-headings-tip', 'sqDiagnosis_rule_headings_tip');

      this.T('rule-images-title', 'sqDiagnosis_rule_images_title');
      this.T2('rule-images-tip', 'sqDiagnosis_rule_images_tip');

      this.T('rule-text2html-title', 'sqDiagnosis_rule_text2html_title');
      this.T2('rule-text2html-tip', 'sqDiagnosis_rule_text2html_tip');

      this.T('rule-frames-title', 'sqDiagnosis_rule_frames_title');
      this.T2('rule-frames-tip', 'sqDiagnosis_rule_frames_tip');

      this.T('rule-flash-title', 'sqDiagnosis_rule_flash_title');
      this.T2('rule-flash-tip', 'sqDiagnosis_rule_flash_tip');

      this.T('rule-amp-title', 'sqDiagnosis_rule_amp_title');
      this.T2('rule-amp-tip', 'sqDiagnosis_rule_amp_tip');

      this.T('rule-viewport-title', 'sqDiagnosis_rule_viewport_title');
      this.T2('rule-viewport-tip', 'sqDiagnosis_rule_viewport_tip');

      this.T('rule-robots-title', 'sqDiagnosis_rule_robots_title');
      this.T2('rule-robots-tip', 'sqDiagnosis_rule_robots_tip');

      this.T('rule-sitemap-title', 'sqDiagnosis_rule_sitemap_title');
      this.T2('rule-sitemap-tip', 'sqDiagnosis_rule_sitemap_tip');

      this.T('rule-language-title', 'sqDiagnosis_rule_language_title');
      this.T2('rule-language-tip', 'sqDiagnosis_rule_language_tip');

      this.T('rule-doctype-title', 'sqDiagnosis_rule_doctype_title');
      this.T2('rule-doctype-tip', 'sqDiagnosis_rule_doctype_tip');

      this.T('rule-encoding-title', 'sqDiagnosis_rule_encoding_title');
      this.T2('rule-encoding-tip', 'sqDiagnosis_rule_encoding_tip');

      this.T('rule-analytics-title', 'sqDiagnosis_rule_analytics_title');
      this.T2('rule-analytics-tip', 'sqDiagnosis_rule_analytics_tip');

      this.T('rule-microformats-title', 'sqDiagnosis_rule_microformats_title');
      this.T2('rule-microformats-tip', 'sqDiagnosis_rule_microformats_tip');

      this.T('rule-schemaorg-title', 'sqDiagnosis_rule_schemaorg_title');
      this.T2('rule-schemaorg-tip', 'sqDiagnosis_rule_schemaorg_tip');

      this.T('rule-opengraph-title', 'sqDiagnosis_rule_opengraph_title');
      this.T2('rule-opengraph-tip', 'sqDiagnosis_rule_opengraph_tip');

      this.T('rule-twittercard-title', 'sqDiagnosis_rule_twittercard_title');
      this.T2('rule-twittercard-tip', 'sqDiagnosis_rule_twittercard_tip');

      this.T('rule-favicon-title', 'sqDiagnosis_rule_favicon_title');
      this.T2('rule-favicon-tip', 'sqDiagnosis_rule_favicon_tip');

      this.T('howto-link', 'sqCommon_howto_link');
      this.T('suggest-link', 'sqCommon_suggest_link');

      _get(DiagnosisPlugin.prototype.__proto__ || Object.getPrototypeOf(DiagnosisPlugin.prototype), 'init', this).call(this);
    }
  }, {
    key: 'process',
    value: function process() {
      var _this2 = this;

      this.query = lib.parseArgs(document.location.search.substr(1));

      if (this.query.has('id')) {
        this._sendMessage('sq.moduleGetData', { name: 'diagnosis', id: this.query.get('id') }, function (data) {
          lib.isObject(data) ? _this2.processPageData(data) : _this2.dispatchEvent('no-data');
        });
      } else {
        this.query.set('id', '');
        this.dispatchEvent('no-data');
      }
    }
  }, {
    key: 'processResultEvent',
    value: function processResultEvent(result) {
      this.updateCounters(result);
      this.dispatchEvent('ready');
    }
  }, {
    key: 'getCounter',
    value: function getCounter(selector) {
      if (!this._counters.has(selector)) {
        this._counters.set(selector, new CounterElement(selector, this.container));
      }

      return this._counters.get(selector);
    }
  }, {
    key: 'updateCounters',
    value: function updateCounters(result) {
      result = result.data;
      if (!result) {
        return;
      }

      var successCounter = this.getCounter('[data-role=success-counter]');
      var warningCounter = this.getCounter('[data-role=warning-counter]');
      var dangerCounter = this.getCounter('[data-role=error-counter]');
      successCounter.counter = 0;
      warningCounter.counter = 0;
      dangerCounter.counter = 0;

      for (var group in result) {
        if (!result.hasOwnProperty(group)) {
          continue;
        }

        for (var rule in result[group]) {
          if (!result[group].hasOwnProperty(rule)) {
            continue;
          }

          if (!(result[group][rule] instanceof DiagnosisResult)) {
            continue;
          }

          if (rule === 'keywords') {
            continue;
          }

          if (result[group][rule].status === State.STATE_GOOD) {
            successCounter.inc();
          } else if (result[group][rule].status === State.STATE_AVERAGE) {
            warningCounter.inc();
          } else if (result[group][rule].status === State.STATE_BAD) {
            dangerCounter.inc();
          } else if (result[group][rule].status === State.STATE_TIMEOUT) {
            warningCounter.inc();
          }
        }
      }
    }
  }, {
    key: 'processPageData',
    value: function processPageData(page) {
      var _this3 = this;

      this.diagnosis = new Diagnosis(page);
      this.diagnosis.setMessenger(this.getMessenger());
      this.diagnosis.processData();
      this.diagnosis.addEventListener('parameterReady', this.updateCounters.bind(this));

      this.diagnosis.addEventListener('page.url', this.processDefault('[data-role=rule-url]'));
      this.diagnosis.addEventListener('page.canonical', this.processDefault('[data-role=rule-canonical]'));
      this.diagnosis.addEventListener('page.title', this.processDefault('[data-role=rule-title]'));
      this.diagnosis.addEventListener('page.description', this.processDefault('[data-role=rule-description]'));
      this.diagnosis.addEventListener('page.keywords', this.processKeywords.bind(this));
      this.diagnosis.addEventListener('page.headings', this.processHeadings.bind(this));
      this.diagnosis.addEventListener('page.images', this.processDefault('[data-role=rule-images]'));
      this.diagnosis.addEventListener('page.textToHtmlRatio', this.processDefault('[data-role=rule-ratio]'));
      this.diagnosis.addEventListener('page.frames', this.processDefault('[data-role=rule-frames]'));
      this.diagnosis.addEventListener('page.flash', this.processDefault('[data-role=rule-flash]'));
      this.diagnosis.addEventListener('page.microformats', this.processDefault('[data-role=rule-microformats]'));
      this.diagnosis.addEventListener('page.schemaorg', this.processDefault('[data-role=rule-schemaorg]'));
      this.diagnosis.addEventListener('page.opengraph', this.processDefault('[data-role=rule-opengraph]'));
      this.diagnosis.addEventListener('page.twittercard', this.processDefault('[data-role=rule-twittercard]'));

      this.diagnosis.addEventListener('mobile.ampVersion', this.processDefault('[data-role=rule-ampversion]'));
      this.diagnosis.addEventListener('mobile.viewport', this.processDefault('[data-role=rule-viewport]'));

      this.diagnosis.addEventListener('compliance.favicon', this.processDefault('[data-role=rule-favicon]'));
      this.diagnosis.addEventListener('compliance.robotsTxt', this.processDefault('[data-role=rule-robotstxt]'));
      this.diagnosis.addEventListener('compliance.xmlSitemaps', this.processDefault('[data-role=rule-sitemapxml]'));
      this.diagnosis.addEventListener('compliance.language', this.processDefault('[data-role=rule-language]'));
      this.diagnosis.addEventListener('compliance.doctype', this.processDefault('[data-role=rule-doctype]'));
      this.diagnosis.addEventListener('compliance.encoding', this.processDefault('[data-role=rule-encoding]'));
      this.diagnosis.addEventListener('compliance.googleAnalitycs', this.processDefault('[data-role=rule-googleanalytics]'));

      this.diagnosis.addEventListener('ready', this.processResultEventListener);

      var tips = this.container.querySelectorAll('div[data-role="tips"]');
      var registerHintOpen = function registerHintOpen() {
        _this3.registerEvent(_this3.name, 'hintOpen');
      };

      for (var i = 0; i < tips.length; i++) {
        var dropdown = new hintDropdown.HintDropdown(tips[i]);
        dropdown.addEventListener('open', registerHintOpen);
      }
    }
  }, {
    key: 'processDefault',
    value: function processDefault(selector) {
      var _this4 = this;

      return function (value) {
        var container = _this4.container.querySelector(selector);
        var messageNode = container.querySelector('[data-role=message]');
        var valueNode = container.querySelector('[data-role=value]');
        var iconNode = container.querySelector('.icon.cssload');

        dom.addClass(container, value.status);
        dom.setContent(messageNode, dom.parse(value.description));
        if (valueNode && value.hasOwnProperty('value')) {
          dom.text(valueNode, value.value);
        }

        dom.removeClass(iconNode, 'cssload');
      };
    }
  }, {
    key: 'processKeywords',
    value: function processKeywords(value) {
      var container = this.container.querySelector('[data-role=rule-keywords]');
      var messageNode = container.querySelector('[data-role=message]');
      var valueNode = container.querySelector('[data-role=value]');
      var iconNode = container.querySelector('.icon.cssload');

      dom.addClass(container, 'deprecated');
      dom.attr(iconNode, 'title', 'Rule is deprected and will be removed soon. Please, do not rely on it.');
      dom.text(messageNode, value.description);
      if (valueNode && value.hasOwnProperty('value')) {
        dom.text(valueNode, value.value);
      }

      dom.removeClass(iconNode, 'cssload');
    }
  }, {
    key: 'processHeadings',
    value: function processHeadings(headings) {
      var container = this.container.querySelector('[data-role=rule-headings]');
      var messageNode = container.querySelector('[data-role=message]');
      var valueNode = container.querySelector('[data-role=value]');
      var iconNode = container.querySelector('.icon.cssload');
      var headingsList = container.querySelector('[data-role=headings]');
      var message = [];

      for (var key in headings.value) {
        if (!headings.value.hasOwnProperty(key)) {
          continue;
        }

        message.push(key + ' (' + headings.value[key].count + ')');

        if (headings.value[key].count > 0) {
          for (var i = 0; i < headings.value[key].count; i++) {
            headingsList.appendChild(dom.createElement('li', {}, '<' + key + '>: ' + headings.value[key].values[i]));
          }
        }
      }

      dom.addClass(container, headings.status);
      dom.text(messageNode, headings.description);
      dom.text(valueNode, message.join(', '));
      dom.removeClass(iconNode, 'cssload');

      new SlidePanel(container.querySelector('[data-role=hide-overflow]'));
    }
  }]);

  return DiagnosisPlugin;
}(BaseModule);

module.exports = DiagnosisPlugin;

},{"../../../common/Lib":7,"../../../common/diagnosis/Diagnosis":17,"../../../common/diagnosis/DiagnosisResult":19,"../../../common/diagnosis/DiagnosisStates":20,"../../../common/dom/CounterElement":25,"../../../common/dom/main":38,"../../../common/effects/HintDropdown":49,"../../../common/effects/SlidePanel":55,"../../../common/module/BaseModule":76}],112:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ignore = require('../../../common/lib/ignore');
var lib = require('../../../common/Lib');
var dom = require('../../../common/dom/main');
var extend = require('extend');
var RequestUrl = require('../../../common/RequestUrl').RequestUrl;
var HintBox = require('../../../common/effects/HintBox');
var CounterElement = require('../../../common/dom/CounterElement');
var LinkInfoBase = require('../../../common/module/LinkInfoBase');
var quickTmixin = require('../../../common/utils/quickTmixin');

var OTHER_LINK = 'otherLink';

var LinkInfoPlugin = function (_LinkInfoBase) {
  _inherits(LinkInfoPlugin, _LinkInfoBase);

  function LinkInfoPlugin(container) {
    _classCallCheck(this, LinkInfoPlugin);

    var _this = _possibleConstructorReturn(this, (LinkInfoPlugin.__proto__ || Object.getPrototypeOf(LinkInfoPlugin)).call(this, container));

    _this.name = 'linkinfo';
    _this.query = {};
    _this.searchQuery = 'linkinfo';
    _this.MAX_URLS_LIMIT = 500;
    _this.links = [];
    _this.sourceLinks = [];
    _this.totalParameters = 0;
    _this.readyParameters = 0;
    _this.showNoFollow = true;
    _this.container = container;
    _this.type = 'Links';
    _this.table = container.querySelector('[data-role="linkinfo-table"]');
    _this.counters = new Map();
    _this.requestUrlsMap = new Map();

    _this.registerLinkClickListener = _this.registerLinkClick.bind(_this);
    _this.requestParameterColumnListener = _this.requestParameterColumnHandler.bind(_this);
    _this.sortColumnListener = _this.sortHandler.bind(_this);
    _this.requestParameterListener = _this.requestParameterHandler.bind(_this);
    _this.requestParametersAllListener = _this.requestParameterAllHandler.bind(_this);
    _this.filterClickListener = _this.filterClickHandler.bind(_this);
    _this.saveAsCSVListener = _this.saveAsCSVHandler.bind(_this);
    _this.createLinkRowThis = _this.createLinkRow.bind(_this);
    _this.readyListener = _this.readyHandler.bind(_this);

    _this.anchorText = '';

    _this.domElementsSelectorCache = new Map();

    _this.addEventListener('all-parameters-loaded', _this.allParametersReadyHandler.bind(_this));
    _this.preventDefaultListener = function (event) {
      event.stopPropagation();
      event.preventDefault();
    };
    return _this;
  }

  _createClass(LinkInfoPlugin, [{
    key: 'findByRole',
    value: function findByRole(role) {
      return Array.from(this.container.querySelectorAll('[data-role="' + role + '"]'));
    }
  }, {
    key: 'init',
    value: function init() {
      var _this2 = this;

      this.T(true, 'feedback-1', 'sqFeedback_text_1');
      this.T(true, 'feedback-link', 'sqFeedback_link');
      this.T(true, 'feedback-2', 'sqFeedback_text_2');
      this.T(true, 'feedback-email', 'sqFeedback_email');

      this.T('title', 'sqLinkinfo_' + this.name);
      this.T('totalLinks', 'sqLinkinfo_totalLinks');
      this.T('followLinks', 'sqLinkinfo_followLinks');
      this.T('noFollowLinks', 'sqLinkinfo_noFollowLinks');
      this.T('imagesLinks', 'sqLinkinfo_imagesLinks');
      this.T('textLinks', 'sqLinkinfo_textLinks');
      this.T('formLinks', 'sqLinkinfo_formLinks');
      this.T('frameLinks', 'sqLinkinfo_frameLinks');
      this.T('button-request', 'sqLinkinfo_button_request');
      this.T('button-save', 'sqLinkinfo_button_save');
      this.T('button-configure', 'sqLinkinfo_button_configure');

      this.t('sqLinkinfo_anchor').then(function (msg) {
        return _this2.anchorText = msg;
      }).catch(ignore);

      _get(LinkInfoPlugin.prototype.__proto__ || Object.getPrototypeOf(LinkInfoPlugin.prototype), 'init', this).call(this);
    }
  }, {
    key: 'process',
    value: function process() {
      throw new Error('Should be redifined');
    }
  }, {
    key: 'initFromPage',
    value: function initFromPage(linkInfo) {
      var _this3 = this;

      this.type = linkInfo.type;
      this.links = linkInfo.links;
      this.sourceLinks = linkInfo.links;

      this.overlay.show();

      this.counters.clear();
      this.counters.set('nofollow', new CounterElement('[data-role="nofollow-counter"]', this.container));
      this.counters.set('follow', new CounterElement('[data-role="follow-counter"]', this.container));
      this.counters.set('total', new CounterElement('[data-role="total-counter"]', this.container));
      this.counters.set('text', new CounterElement('[data-role="text-counter"]', this.container));
      this.counters.set('image', new CounterElement('[data-role="images-counter"]', this.container));
      this.counters.set('form', new CounterElement('[data-role="form-counter"]', this.container));
      this.counters.set('frame', new CounterElement('[data-role="frame-counter"]', this.container));

      Array.from(this.container.querySelectorAll('[data-role="filter"]')).forEach(function (button) {
        return button.addEventListener('click', _this3.filterClickListener);
      });

      var saveAsCSVButton = this.container.querySelector('[data-role="button-save"]');
      if (saveAsCSVButton) {
        saveAsCSVButton.addEventListener('click', this.saveAsCSVListener, true);
      }

      if (this.configuration.mode === lib.SEOQUAKE_MODE_BY_REQUEST) {
        var requestButton = this.container.querySelector('[data-role="button-request"]');
        dom.removeClass(requestButton, 'hidden');
        requestButton.addEventListener('click', this.requestParametersAllListener, true);
      }

      this.processData(true);
    }
  }, {
    key: 'readyHandler',
    value: function readyHandler() {
      this.overlay.hide();
      this.removeEventListener('ready', this.readyListener);
    }
  }, {
    key: 'processData',
    value: function processData(dontClearCounters) {
      dontClearCounters = dontClearCounters || false;
      if (!dontClearCounters) {
        this.counters.clear();
      }

      this.createParametersGroups();
      this.createHeader();
      dom.emptyElement(this.table.tBodies[0]);

      this.totalParameters = 0;
      this.readyParameters = 0;
      if (this.configuration.mode === lib.SEOQUAKE_MODE_BY_REQUEST) {
        var requestButton = this.container.querySelector('[data-role="button-request"]');
        dom.attr(requestButton, 'disabled', null);
      }

      this.requestUrlsMap.clear();
      this.domElementsSelectorCache.clear();
      this.addEventListener('ready', this.readyListener);
      this.createLinkRow(0);
    }
  }, {
    key: 'registerLinkClick',
    value: function registerLinkClick(event) {
      this.registerEvent(this.name, 'openLink');
    }
  }, {
    key: '_createLinkCountHint',
    value: function _createLinkCountHint(count) {
      var _this4 = this;

      var span = dom('span', { className: 'linkCount' });
      var msgId = 'sqLinkinfo_count_more';
      if (count === 1) {
        msgId = 'sqLinkinfo_count_one';
      }

      this.t(msgId).then(function (message) {
        return dom.text(span, message.replace('{count}', count));
      }).catch(ignore);
      this.t('sqLinkinfo_count_hint').then(function (message) {
        return new HintBox(span, { event: 'hover', message: message });
      }).catch(ignore);

      span.addEventListener('click', function (event) {
        var element = event.currentTarget;
        if (dom.hasClass(element, 'pressed')) {
          dom.removeClass(element, 'pressed');
          var parentRow = element.parentElement.parentElement;
          var nextRow = parentRow.nextElementSibling;
          while (nextRow && dom.hasAttr(nextRow, 'data-role') && dom.attr(nextRow, 'data-role') === OTHER_LINK) {
            dom.addClass(nextRow, 'row-hidden');
            nextRow = nextRow.nextElementSibling;
          }

          dom.attr(parentRow.firstChild, 'rowspan', 1);
          var parameterCells = Array.prototype.slice.call(parentRow.querySelectorAll('.seoquake-params-cell'));
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = parameterCells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var parameterCell = _step.value;

              dom.attr(parameterCell, 'rowspan', 1);
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
        } else {
          dom.addClass(element, 'pressed');
          var _parentRow = element.parentElement.parentElement;
          var _nextRow = _parentRow.nextElementSibling;
          var _count = 1;
          while (_nextRow && dom.hasAttr(_nextRow, 'data-role') && dom.attr(_nextRow, 'data-role') === OTHER_LINK) {
            dom.removeClass(_nextRow, 'row-hidden');
            _nextRow = _nextRow.nextElementSibling;
            _count++;
          }

          dom.attr(_parentRow.firstChild, 'rowspan', _count);
          var _parameterCells = Array.prototype.slice.call(_parentRow.querySelectorAll('.seoquake-params-cell'));
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = _parameterCells[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var _parameterCell = _step2.value;

              dom.attr(_parameterCell, 'rowspan', _count);
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

          _this4.registerEvent(_this4.name, 'showLinkAnchors');
        }
      });

      return span;
    }
  }, {
    key: '_createLinkCell',
    value: function _createLinkCell(link) {
      var type = dom('span', { className: 'linkType' }, link.type);
      var cell = dom('td', { className: 'border-right link-cell' }, type);

      this.t('sqLinkinfo_type_' + link.type).then(function (msg) {
        return dom.text(type, msg);
      }).catch(ignore);

      if (link.count > 1) {
        var badge = dom('span', { className: 'badge' }, link.count);
        cell.appendChild(badge);
        this.t('sqLinkinfo_badge_hint').then(function (message) {
          return new HintBox(badge, { event: 'hover', message: message });
        }).catch(ignore);
      }

      if (this.counters.has('total')) {
        this.counters.get('total').inc();
      }

      if (this.counters.has(link.type)) {
        this.counters.get(link.type).inc();
      }

      if (link.anchor !== null) {
        var anchor = dom('span', { className: 'linkAnchor' }, '');
        var text = lib.truncate(link.anchor);
        if (text === '') {
          this.t('sqLinkinfo_anchor_empty').then(function (msg) {
            return dom.text(anchor, msg);
          }).catch(ignore);
          dom.addClass(anchor, 'linkAnchor-empty');
        } else {
          dom.setContent(anchor, [this.anchorText, ' ', text]);
        }

        cell.appendChild(anchor);
      }

      return cell;
    }
  }, {
    key: '_createNoFollowCell',
    value: function _createNoFollowCell(link, urlHash, row) {
      var cell = dom('td', { rel: urlHash + ' x_nofollow' });
      var icon = dom('i', { className: 'icon seoquake-params-link', rel: urlHash + ' x_nofollow' });
      cell.appendChild(icon);
      if (link.nofollow) {
        dom.addClass(row, 'seoquake-nofollow-link');
        dom.attr(icon, 'data-value', 'Yes');
        if (this.counters.has('nofollow')) {
          this.counters.get('nofollow').inc();
        }
      } else {
        dom.attr(icon, 'data-value', 'No');
        if (this.counters.has('follow')) {
          this.counters.get('follow').inc();
        }
      }

      return cell;
    }
  }, {
    key: '_createLinkRowInternal',
    value: function _createLinkRowInternal(index) {
      var link = extend(true, {}, this.links[index]);
      var firstLink = null;
      var links = 1;
      var urlHash = lib.shortHash(link.href);
      var rowClass = 'odd';

      if (index % 2 == 0) {
        rowClass = 'even';
      }

      this.urls[urlHash] = lib.parseUri(link.href);

      links = link.other.length;
      firstLink = link.other.shift();

      var row = this.table.tBodies[0].insertRow(-1);
      row.setAttribute('rel', urlHash);
      dom.addClass(row, rowClass);

      var cell = row.insertCell(-1);
      dom.text(cell, index + 1);
      dom.attr(cell, 'rowspan', 1);

      var linkUrl = dom('A', {
        className: 'seoquake-params-link',
        href: link.href,
        rel: urlHash + ' x_url',
        target: '_blank'
      }, lib.truncate(link.href));
      linkUrl.addEventListener('click', this.registerLinkClickListener);
      cell = this._createLinkCell(firstLink);
      if (links > 1) {
        cell.appendChild(this._createLinkCountHint(links - 1));
      }

      cell.insertBefore(linkUrl, cell.firstChild);
      row.appendChild(cell);
      row.appendChild(this._createNoFollowCell(firstLink, urlHash, row));

      for (var groupId in this.parametersGrouped) {
        if (this.parametersGrouped.hasOwnProperty(groupId)) {
          var keys = Object.keys(this.parametersGrouped[groupId]);
          for (var i = 0; i < keys.length; i++) {
            var paramId = keys[i];
            if (this.parametersGrouped[groupId].hasOwnProperty(paramId)) {
              var parameterCell = row.appendChild(this.createParameterCell(urlHash, this.parametersGrouped[groupId][paramId]));
              if (i + 1 === keys.length) {
                dom.addClass(parameterCell, 'border-right');
              }

              dom.attr(parameterCell, 'rowspan', 1);
            }
          }
        }
      }

      if (links > 1) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = link.other[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var linkOther = _step3.value;

            row = this.table.tBodies[0].insertRow(-1);
            dom.addClass(row, rowClass);
            dom.addClass(row, 'row-hidden');
            dom.attr(row, 'data-role', OTHER_LINK);
            row.appendChild(this._createLinkCell(linkOther));
            row.appendChild(this._createNoFollowCell(linkOther, urlHash, row));
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    }
  }, {
    key: 'createLinkRow',
    value: function createLinkRow(index) {
      var _this5 = this;

      var count = LinkInfoPlugin.RENDER_STEP;

      if (index + count >= this.links.length) {
        count = this.links.length - index;
      }

      for (var i = 0; i < count; i++) {
        this._createLinkRowInternal(index + i);
      }

      index = index + count;
      if (index < this.links.length) {
        this.overlay.progress = index / this.links.length * 50;
        setTimeout(this.createLinkRowThis, LinkInfoPlugin.RENDER_DELAY, index);
      } else {
        this.processRequestUrls(this.requestUrlsMap).then(function () {
          return _this5.dispatchEvent('ready');
        });
      }
    }
  }, {
    key: 'sortHandler',
    value: function sortHandler(event) {
      this.preventDefaultListener(event);
      var params = [];
      var headerElement = event.currentTarget;

      var paramId = dom.attr(headerElement, 'rel');
      var sortType = dom.hasAttr(headerElement, 'data-next-sort') ? dom.attr(headerElement, 'data-next-sort') : lib.SEOQUAKE_SORT_ASC;
      var paramEls = Array.from(this.container.querySelectorAll('.seoquake-params-link[rel$="_' + paramId + '"]'));

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = paramEls[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var element = _step4.value;

          var rel = this.parseRelAttr(dom.attr(element, 'rel'));
          if (paramId === 'url') {
            rel.value = element.href.replace(/^https*:\/\//i, '');
          } else if (paramId === 'nofollow') {
            rel.value = dom.attr(element, 'data-value');
          } else {
            rel.value = lib.trim(dom.text(element));
          }

          params.push(rel);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var paramsType = this.determineParamsType(params);
      params = this.modifyParams(params, paramsType);
      params = this.sortParams(params, sortType);

      var els = this.getElements(params);
      this.putElements(els);

      var currentSortElements = Array.from(this.container.querySelectorAll('th.sortAsc, th.sortDesc'));
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = currentSortElements[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _element = _step5.value;

          dom.removeClass(_element, 'sortAsc');
          dom.removeClass(_element, 'sortDesc');
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      if (sortType === lib.SEOQUAKE_SORT_ASC) {
        dom.removeClass(headerElement, 'sortDesc');
        dom.addClass(headerElement, 'sortAsc');
        dom.attr(headerElement, 'data-next-sort', lib.SEOQUAKE_SORT_DESC);
      } else {
        dom.removeClass(headerElement, 'sortAsc');
        dom.addClass(headerElement, 'sortDesc');
        dom.attr(headerElement, 'data-next-sort', lib.SEOQUAKE_SORT_ASC);
      }

      this.registerEvent(this.name, 'resultRowsSort', paramId);
    }
  }, {
    key: 'processRequestUrls',
    value: function processRequestUrls(requestUrls, forceRequest) {
      var iterator = requestUrls.entries();
      var render = this.render.bind(this);
      var sendRequest = this.sendMessage.bind(this);
      var onlyCache = this.configuration.mode === lib.SEOQUAKE_MODE_BY_REQUEST && !forceRequest;
      var processed = 0;
      var localOverlay = this.overlay;

      return new Promise(function (resolve) {
        function processPart() {
          var index = 0;
          var item = void 0;
          do {
            item = iterator.next();
            index++;
            if (item.value) {
              var renderParams = item.value[1].asRenderObject(onlyCache);

              render(renderParams);

              sendRequest('sq.requestParameter', { render: renderParams, onlyCache: onlyCache }).then(function (result) {
                return render(result);
              });
            }
          } while (index < LinkInfoPlugin.RENDER_STEP && !item.done);
          processed += index;

          localOverlay.progress = processed / requestUrls.size * 50 + 50;
          if (!item.done) {
            setTimeout(processPart, LinkInfoPlugin.RENDER_DELAY, this);
          } else {
            resolve();
          }
        }

        processPart();
      });
    }
  }, {
    key: 'requestParameters',
    value: function requestParameters(paramsEls) {
      var requestUrls = new Map();

      for (var i = 0, l = paramsEls.length; i < l; i++) {
        var rel = this.parseElement(paramsEls[i]);
        if (!rel) {
          continue;
        }

        if (!requestUrls.has(rel.requestUrlHash)) {
          requestUrls.set(rel.requestUrlHash, this.requestUrlsMap.get(rel.requestUrlHash));
        }
      }

      return this.processRequestUrls(requestUrls, true);
    }
  }, {
    key: 'requestParameterAllHandler',
    value: function requestParameterAllHandler(event) {
      this.preventDefaultListener(event);

      var button = event.currentTarget;
      dom.attr(button, 'disabled', true);
      var paramsEls = this.container.querySelectorAll('.seoquake-params-link');
      this.requestParameters(paramsEls);
      this.registerEvent(this.name, 'requestAllParameters');
    }
  }, {
    key: 'requestParameterColumnHandler',
    value: function requestParameterColumnHandler(event) {
      this.preventDefaultListener(event);
      var headerCell = event.currentTarget;
      var paramId = headerCell.getAttribute('rel');
      var paramsEls = this.container.querySelectorAll('.seoquake-params-link[rel$="_' + paramId + '"]');
      headerCell.removeEventListener('click', this.requestParameterColumnListener);
      dom.addClass(headerCell, 'active');
      this.requestParameters(paramsEls);
      this.registerEvent(this.name, 'requestColParameters', paramId);
    }
  }, {
    key: 'requestParameterHandler',
    value: function requestParameterHandler(event) {
      var element = event.currentTarget;
      var rel = this.parseElement(element);
      if (!rel) {
        return;
      }

      this.preventDefaultListener(event);

      dom.addClass(element, 'active');

      var requestUrls = new Map();
      requestUrls.set(rel.requestUrlHash, this.requestUrlsMap.get(rel.requestUrlHash));
      this.processRequestUrls(requestUrls, true);

      this.registerEvent(this.name, 'requestParameterHandler', rel.paramId);
    }
  }, {
    key: 'render',
    value: function render(renderParams) {
      if (!('requestUrlHash' in renderParams) || !renderParams.requestUrlHash) {
        return false;
      }

      var hash = renderParams.requestUrlHash;
      var updatedParameters = [];

      for (var i = 0, l = renderParams.params.length; i < l; i++) {
        var paramId = renderParams.params[i];

        if (!(paramId in renderParams.values)) {
          continue;
        }

        var selector = 'a[rel~="' + hash + '_' + paramId + '"]';
        var href = '';
        var na = void 0;
        if (this.requestUrlsMap.has(hash)) {
          href = this.requestUrlsMap.get(hash).getSourceUrl(paramId);
          na = this.requestUrlsMap.get(hash).getNaUrl(paramId);
        }

        var links = void 0;
        if (this.domElementsSelectorCache.has(selector)) {
          links = this.domElementsSelectorCache.get(selector);
        } else {
          links = Array.prototype.slice.call(this.container.querySelectorAll(selector));
          this.domElementsSelectorCache.set(selector, links);
        }

        this._renderLinks(paramId, renderParams.values[paramId], href, links, updatedParameters, na);
      }

      if (updatedParameters.length > 0) {
        this.updateRowHeader(updatedParameters);
      }

      if (this.readyParameters >= this.totalParameters) {
        this.dispatchEvent('all-parameters-loaded');
      }

      return true;
    }
  }, {
    key: 'getHeadersLine',
    value: function getHeadersLine() {
      var tpl = '"%s"';
      var line = [];

      line.push(tpl.replace('%s', '#'));
      line.push(tpl.replace('%s', 'Url'));
      line.push(tpl.replace('%s', 'Type'));
      line.push(tpl.replace('%s', 'Anchor'));
      line.push(tpl.replace('%s', 'No-follow'));

      for (var groupId in this.parametersGrouped) {
        if (this.parametersGrouped.hasOwnProperty(groupId)) {
          for (var parameterId in this.parametersGrouped[groupId]) {
            if (this.parametersGrouped[groupId].hasOwnProperty(parameterId) && this.parameters.hasOwnProperty(parameterId)) {
              var parameter = this.parameters[parameterId];
              if (!parameter.hasOwnProperty('matches')) {
                continue;
              }

              line.push(tpl.replace('%s', parameter.name.replace(/"/g, '""')));
            }
          }
        }
      }

      return line;
    }
  }, {
    key: 'getDataLines',
    value: function getDataLines() {
      var _this6 = this;

      var tpl = '"%s"';
      var rows = Array.from(this.table.tBodies[0].rows);
      var data = [];
      var value = void 0;
      var replacer = new RegExp('^' + this.anchorText + ' ');

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = rows[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var row = _step6.value;

          var line = [];
          if (dom.hasAttr(row, 'data-role') && dom.attr(row, 'data-role') === OTHER_LINK) {
            line.push('');
            line.push('');
            line.push(dom.text(row.cells[0].querySelector('span.linkType')));
            var anchor = row.cells[0].querySelector('span.linkAnchor');
            if (anchor !== null) {
              if (dom.hasClass(anchor, 'linkAnchor-empty')) {
                line.push('');
              } else {
                line.push(dom.text(anchor).replace(replacer, ''));
              }
            } else {
              line.push('');
            }

            line.push(dom.attr(row.cells[1].querySelector('i'), 'data-value'));
          } else {
            line.push(dom.text(row.cells[0]));
            line.push(dom.attr(row.cells[1].querySelector('a'), 'href'));
            line.push(dom.text(row.cells[1].querySelector('span.linkType')));
            var _anchor = row.cells[1].querySelector('span.linkAnchor');
            if (_anchor !== null) {
              if (dom.hasClass(_anchor, 'linkAnchor-empty')) {
                line.push('');
              } else {
                line.push(dom.text(_anchor).replace(replacer, ''));
              }
            } else {
              line.push('');
            }

            line.push(dom.attr(row.cells[2].querySelector('i'), 'data-value'));
            for (var i = 3; i < row.cells.length; i++) {
              var link = row.cells[i].querySelector('a.seoquake-params-link');
              if (link !== null) {
                line.push(dom.attr(link, 'data-value'));
              }
            }
          }

          line.forEach(function (value, index, array) {
            return array[index] = tpl.replace('%s', _this6.entities.decode(value).replace(/"/g, '""'));
          });
          data.push(line.join(';'));
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return data;
    }
  }, {
    key: 'filter',
    value: function filter(type) {
      this.overlay.show();

      switch (type) {
        case 'nofollow':
          this.filterProcess(function (item) {
            return item.nofollow === true;
          });
          break;
        case 'follow':
          this.filterProcess(function (item) {
            return item.nofollow !== true;
          });
          break;
        case 'image':
          this.filterProcess(function (item) {
            return item.type === 'image';
          });
          break;
        case 'text':
          this.filterProcess(function (item) {
            return item.type === 'text';
          });
          break;
        case 'form':
          this.filterProcess(function (item) {
            return item.type === 'form';
          });
          break;
        case 'frame':
          this.filterProcess(function (item) {
            return item.type === 'frame';
          });
          break;
        case 'total':
        default:
          this.removeFilter();
      }
      this.processData();
    }
  }, {
    key: 'filterClickHandler',
    value: function filterClickHandler(event) {
      event.preventDefault();
      this.switchFilterInterfaceTo(event.currentTarget);
      this.filter(event.currentTarget.getAttribute('data-filter'));
    }
  }, {
    key: 'switchFilterInterfaceTo',
    value: function switchFilterInterfaceTo(element) {
      var button = this.container.querySelector('[data-role="filter"].sqbtn-pressed');
      if (button) {
        dom.removeClass(button, 'sqbtn-pressed');
      }

      dom.addClass(element, 'sqbtn-pressed');
    }
  }, {
    key: 'removeFilter',
    value: function removeFilter() {
      this.links = this.sourceLinks.slice();
      this.switchFilterInterfaceTo(this.container.querySelector('[data-filter="total"]'));
    }
  }, {
    key: 'filterProcess',
    value: function filterProcess(callback) {
      this.links = [];
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.sourceLinks[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var link = _step7.value;

          var found = false;
          var item = extend(true, {}, link);
          item.other = [];
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = link.other[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var subLink = _step8.value;

              if (callback(subLink)) {
                item.other.push(extend(true, {}, subLink));
                found = true;
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }

          if (found) {
            this.links.push(item);
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  }]);

  return LinkInfoPlugin;
}(LinkInfoBase);

LinkInfoPlugin.RENDER_STEP = 30;
LinkInfoPlugin.RENDER_DELAY = 10;

quickTmixin(LinkInfoPlugin.prototype);

module.exports = LinkInfoPlugin;

},{"../../../common/Lib":7,"../../../common/RequestUrl":9,"../../../common/dom/CounterElement":25,"../../../common/dom/main":38,"../../../common/effects/HintBox":48,"../../../common/lib/ignore":64,"../../../common/module/LinkInfoBase":77,"../../../common/utils/quickTmixin":99,"extend":118}],113:[function(require,module,exports){
var toCamelCase = require('to-camel-case');

/**
 * Gets/Sets a DOM element property.
 *
 * @param  Object        element A DOM element.
 * @param  String|Object name    The name of a property or an object of values to set.
 * @param  String        value   The value of the property to set, or none to get the current
 *                               property value.
 * @return String                The current/new property value.
 */
function css(element, name, value) {
  if (typeof name === 'object') {
    var style = name;
    for (name in style) {
      css(element, name, style[name]);
    }
    return style;
  }
  var attribute = toCamelCase((name === 'float') ? 'cssFloat' : name);
  if (arguments.length === 3) {
    element.style[name] = value || "";
    return value;
  }
  return element.style[name];
}

module.exports = css;

},{"to-camel-case":114}],114:[function(require,module,exports){

var toSpace = require('to-space-case');


/**
 * Expose `toCamelCase`.
 */

module.exports = toCamelCase;


/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */


function toCamelCase (string) {
  return toSpace(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase();
  });
}
},{"to-space-case":128}],115:[function(require,module,exports){
/**
 * DOM element value Getter/Setter.
 */

/**
 * Gets/sets DOM element value.
 *
 * @param  Object element A DOM element
 * @param  Object val     The value to set or none to get the current value.
 * @return mixed          The new/current DOM element value.
 */
function value(element, val) {
  if (arguments.length === 1) {
    return get(element);
  }
  return set(element, val);
}

/**
 * Returns the type of a DOM element.
 *
 * @param  Object element A DOM element.
 * @return String         The DOM element type.
 */
value.type = function(element) {
  var name = element.nodeName.toLowerCase();
  if (name !== "input") {
    if (name === "select" && element.multiple) {
      return "select-multiple";
    }
    return name;
  }
  var type = element.getAttribute('type');
  if (!type) {
    return "text";
  }
  return type.toLowerCase();
}

/**
 * Gets DOM element value.
 *
 * @param  Object element A DOM element
 * @return mixed          The DOM element value
 */
function get(element) {
  var name = value.type(element);
  switch (name) {
    case "checkbox":
    case "radio":
      if (!element.checked) {
        return false;
      }
      var val = element.getAttribute('value');
      return val == null ? true : val;
    case "select":
    case "select-multiple":
      var options = element.options;
      var values = [];
      for (var i = 0, len = options.length; i < len; i++) {
        if (options[i].selected) {
          values.push(options[i].value);
        }
      }
      return name === "select-multiple" ? values : values[0];
    default:
      return element.value;
  }
}

/**
 * Sets a DOM element value.
 *
 * @param  Object element A DOM element
 * @param  Object val     The value to set.
 * @return mixed          The new DOM element value.
 */
function set(element, val) {
  var name = value.type(element);
  switch (name) {
    case "checkbox":
    case "radio":
      return element.checked = val ? true : false;
    case "select":
    case "select-multiple":
      var found;
      var options = element.options;
      var values = Array.isArray(val) ? val : [val];
      for (var i = 0, leni = options.length; i < leni; i++) {
        found = 0;
        for (var j = 0, lenj = values.length; j < lenj; j++) {
          found |= values[j] === options[i].value;
        }
        options[i].selected = (found === 1);
      }
      if (name === "select") {
        return val;
      }
      return Array.isArray(val) ? val: [val];
    default:
      return element.value = val;
  }
}

module.exports = value;

},{}],116:[function(require,module,exports){
var domElementValue = require('dom-element-value');
var domElementCss = require('dom-element-css');
var toCamelCase = require('to-camel-case');

/**
 * DOM element manipulation functions.
 */

/**
 * Gets/Sets a DOM element attribute (accept dashed attribute).
 *
 * @param  Object element A DOM element.
 * @param  String name    The name of an attribute.
 * @param  String value   The value of the attribute to set, `undefined` to remove it or none
 *                        to get the current attribute value.
 * @return String         The current/new attribute value or `undefined` when removed.
 */
function attr(element, name, value) {
  name = toCamelCase(name === 'for' ? 'htmlFor' : name);
  if (arguments.length === 2) {
    return element.getAttribute(name);
  }
  if (value == null) {
    return element.removeAttribute(name);
  }
  element.setAttribute(name, value);
  return value;
}

/**
 * Gets/Sets a DOM element attribute with a specified namespace (accept dashed attribute).
 *
 * @param  Object element A DOM element.
 * @param  String name    The name of an attribute.
 * @param  String value   The value of the attribute to set, `undefined` to remove it or none
 *                        to get the current attribute value.
 * @return String         The current/new attribute value or `undefined` when removed.
 */
function attrNS(element, ns, name, value) {
  name = toCamelCase(name);
  if (arguments.length === 3) {
    return element.getAttributeNS(ns, name);
  }
  if (value == null) {
    return element.removeAttributeNS(ns, name);
  }
  element.setAttributeNS(ns, name, value);
  return value;
}

/**
 * Gets/Sets a DOM element property.
 *
 * @param  Object element A DOM element.
 * @param  String name    The name of a property.
 * @param  String value   The value of the property to set, or none to get the current
 *                        property value.
 * @return String         The current/new property value.
 */
function prop(element, name, value){
  if (arguments.length === 2) {
    return element[name];
  }
  return element[name] = value;
}

/**
 * Gets/Sets a DOM element attribute.
 *
 * @param  Object element A DOM element.
 * @param  String name    The name of an attribute.
 * @param  String value   The value of the attribute to set, `null` to remove it or none
 *                        to get the current attribute value.
 * @return String         The current/new attribute value or `undefined` when removed.
 */
function data(element, name, value) {
  if (arguments.length === 3) {
    return attr(element, "data-" + name, value);
  }
  return attr(element, "data-" + name);
}

/**
 * Gets/Sets a DOM element text content.
 *
 * @param  Object element A DOM element.
 * @param  String value   The text value to set or none to get the current text content value.
 * @return String         The current/new text content.
 */
function text(element, value) {
  var text = (element.textContent !== undefined ? 'textContent' : 'innerText')

  if (arguments.length === 1) {
    return element[text];
  }
  return element[text] = value
}

/**
 * Checks if an element has a class.
 *
 * @param  Object  element A DOM element.
 * @param  String  name    A class name.
 * @return Boolean         Returns `true` if the element has the `name` class, `false` otherwise.
 */
function hasClass(element, name) {
  return element.classList.contains(name);
}

/**
 * Adds a class to an element.
 *
 * @param  Object  element A DOM element.
 * @param  String  name    The class to add.
 */
function addClass(element, name) {
  element.classList.add(name);
}

/**
 * Removes a class from an element.
 *
 * @param  Object  element A DOM element.
 * @param  String  name    The class to remove.
 */
function removeClass(element, name) {
  element.classList.remove(name);
}

/**
 * Toggles a class.
 *
 * @param  Object  element A DOM element.
 * @param  String  name    The class to toggle.
 */
function toggleClass(element, name) {
  var fn = hasClass(element, name) ? removeClass : addClass;
  fn(element, name);
}

module.exports = {
  attr: attr,
  attrNS: attrNS,
  prop: prop,
  css: domElementCss,
  type: domElementValue.type,
  data: data,
  text: text,
  value: domElementValue,
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass
};

},{"dom-element-css":113,"dom-element-value":115,"to-camel-case":117}],117:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"dup":114,"to-space-case":128}],118:[function(require,module,exports){
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


},{}],119:[function(require,module,exports){
module.exports = {
  XmlEntities: require('./lib/xml-entities.js'),
  Html4Entities: require('./lib/html4-entities.js'),
  Html5Entities: require('./lib/html5-entities.js'),
  AllHtmlEntities: require('./lib/html5-entities.js')
};

},{"./lib/html4-entities.js":120,"./lib/html5-entities.js":121,"./lib/xml-entities.js":122}],120:[function(require,module,exports){
var HTML_ALPHA = ['apos', 'nbsp', 'iexcl', 'cent', 'pound', 'curren', 'yen', 'brvbar', 'sect', 'uml', 'copy', 'ordf', 'laquo', 'not', 'shy', 'reg', 'macr', 'deg', 'plusmn', 'sup2', 'sup3', 'acute', 'micro', 'para', 'middot', 'cedil', 'sup1', 'ordm', 'raquo', 'frac14', 'frac12', 'frac34', 'iquest', 'Agrave', 'Aacute', 'Acirc', 'Atilde', 'Auml', 'Aring', 'Aelig', 'Ccedil', 'Egrave', 'Eacute', 'Ecirc', 'Euml', 'Igrave', 'Iacute', 'Icirc', 'Iuml', 'ETH', 'Ntilde', 'Ograve', 'Oacute', 'Ocirc', 'Otilde', 'Ouml', 'times', 'Oslash', 'Ugrave', 'Uacute', 'Ucirc', 'Uuml', 'Yacute', 'THORN', 'szlig', 'agrave', 'aacute', 'acirc', 'atilde', 'auml', 'aring', 'aelig', 'ccedil', 'egrave', 'eacute', 'ecirc', 'euml', 'igrave', 'iacute', 'icirc', 'iuml', 'eth', 'ntilde', 'ograve', 'oacute', 'ocirc', 'otilde', 'ouml', 'divide', 'Oslash', 'ugrave', 'uacute', 'ucirc', 'uuml', 'yacute', 'thorn', 'yuml', 'quot', 'amp', 'lt', 'gt', 'oelig', 'oelig', 'scaron', 'scaron', 'yuml', 'circ', 'tilde', 'ensp', 'emsp', 'thinsp', 'zwnj', 'zwj', 'lrm', 'rlm', 'ndash', 'mdash', 'lsquo', 'rsquo', 'sbquo', 'ldquo', 'rdquo', 'bdquo', 'dagger', 'dagger', 'permil', 'lsaquo', 'rsaquo', 'euro', 'fnof', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigmaf', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'thetasym', 'upsih', 'piv', 'bull', 'hellip', 'prime', 'prime', 'oline', 'frasl', 'weierp', 'image', 'real', 'trade', 'alefsym', 'larr', 'uarr', 'rarr', 'darr', 'harr', 'crarr', 'larr', 'uarr', 'rarr', 'darr', 'harr', 'forall', 'part', 'exist', 'empty', 'nabla', 'isin', 'notin', 'ni', 'prod', 'sum', 'minus', 'lowast', 'radic', 'prop', 'infin', 'ang', 'and', 'or', 'cap', 'cup', 'int', 'there4', 'sim', 'cong', 'asymp', 'ne', 'equiv', 'le', 'ge', 'sub', 'sup', 'nsub', 'sube', 'supe', 'oplus', 'otimes', 'perp', 'sdot', 'lceil', 'rceil', 'lfloor', 'rfloor', 'lang', 'rang', 'loz', 'spades', 'clubs', 'hearts', 'diams'];
var HTML_CODES = [39, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 34, 38, 60, 62, 338, 339, 352, 353, 376, 710, 732, 8194, 8195, 8201, 8204, 8205, 8206, 8207, 8211, 8212, 8216, 8217, 8218, 8220, 8221, 8222, 8224, 8225, 8240, 8249, 8250, 8364, 402, 913, 914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926, 927, 928, 929, 931, 932, 933, 934, 935, 936, 937, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 977, 978, 982, 8226, 8230, 8242, 8243, 8254, 8260, 8472, 8465, 8476, 8482, 8501, 8592, 8593, 8594, 8595, 8596, 8629, 8656, 8657, 8658, 8659, 8660, 8704, 8706, 8707, 8709, 8711, 8712, 8713, 8715, 8719, 8721, 8722, 8727, 8730, 8733, 8734, 8736, 8743, 8744, 8745, 8746, 8747, 8756, 8764, 8773, 8776, 8800, 8801, 8804, 8805, 8834, 8835, 8836, 8838, 8839, 8853, 8855, 8869, 8901, 8968, 8969, 8970, 8971, 9001, 9002, 9674, 9824, 9827, 9829, 9830];

var alphaIndex = {};
var numIndex = {};

var i = 0;
var length = HTML_ALPHA.length;
while (i < length) {
    var a = HTML_ALPHA[i];
    var c = HTML_CODES[i];
    alphaIndex[a] = String.fromCharCode(c);
    numIndex[c] = a;
    i++;
}

/**
 * @constructor
 */
function Html4Entities() {}

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.prototype.decode = function(str) {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/&(#?[\w\d]+);?/g, function(s, entity) {
        var chr;
        if (entity.charAt(0) === "#") {
            var code = entity.charAt(1).toLowerCase() === 'x' ?
                parseInt(entity.substr(2), 16) :
                parseInt(entity.substr(1));

            if (!(isNaN(code) || code < -32768 || code > 65535)) {
                chr = String.fromCharCode(code);
            }
        } else {
            chr = alphaIndex[entity];
        }
        return chr || s;
    });
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.decode = function(str) {
    return new Html4Entities().decode(str);
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.prototype.encode = function(str) {
    var strLength = str.length;
    if (strLength === 0) {
        return '';
    }
    var result = '';
    var i = 0;
    while (i < strLength) {
        var alpha = numIndex[str.charCodeAt(i)];
        result += alpha ? "&" + alpha + ";" : str.charAt(i);
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.encode = function(str) {
    return new Html4Entities().encode(str);
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.prototype.encodeNonUTF = function(str) {
    var strLength = str.length;
    if (strLength === 0) {
        return '';
    }
    var result = '';
    var i = 0;
    while (i < strLength) {
        var cc = str.charCodeAt(i);
        var alpha = numIndex[cc];
        if (alpha) {
            result += "&" + alpha + ";";
        } else if (cc < 32 || cc > 126) {
            result += "&#" + cc + ";";
        } else {
            result += str.charAt(i);
        }
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.encodeNonUTF = function(str) {
    return new Html4Entities().encodeNonUTF(str);
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.prototype.encodeNonASCII = function(str) {
    var strLength = str.length;
    if (strLength === 0) {
        return '';
    }
    var result = '';
    var i = 0;
    while (i < strLength) {
        var c = str.charCodeAt(i);
        if (c <= 255) {
            result += str[i++];
            continue;
        }
        result += '&#' + c + ';';
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
Html4Entities.encodeNonASCII = function(str) {
    return new Html4Entities().encodeNonASCII(str);
};

module.exports = Html4Entities;

},{}],121:[function(require,module,exports){
var ENTITIES = [['Aacute', [193]], ['aacute', [225]], ['Abreve', [258]], ['abreve', [259]], ['ac', [8766]], ['acd', [8767]], ['acE', [8766, 819]], ['Acirc', [194]], ['acirc', [226]], ['acute', [180]], ['Acy', [1040]], ['acy', [1072]], ['AElig', [198]], ['aelig', [230]], ['af', [8289]], ['Afr', [120068]], ['afr', [120094]], ['Agrave', [192]], ['agrave', [224]], ['alefsym', [8501]], ['aleph', [8501]], ['Alpha', [913]], ['alpha', [945]], ['Amacr', [256]], ['amacr', [257]], ['amalg', [10815]], ['amp', [38]], ['AMP', [38]], ['andand', [10837]], ['And', [10835]], ['and', [8743]], ['andd', [10844]], ['andslope', [10840]], ['andv', [10842]], ['ang', [8736]], ['ange', [10660]], ['angle', [8736]], ['angmsdaa', [10664]], ['angmsdab', [10665]], ['angmsdac', [10666]], ['angmsdad', [10667]], ['angmsdae', [10668]], ['angmsdaf', [10669]], ['angmsdag', [10670]], ['angmsdah', [10671]], ['angmsd', [8737]], ['angrt', [8735]], ['angrtvb', [8894]], ['angrtvbd', [10653]], ['angsph', [8738]], ['angst', [197]], ['angzarr', [9084]], ['Aogon', [260]], ['aogon', [261]], ['Aopf', [120120]], ['aopf', [120146]], ['apacir', [10863]], ['ap', [8776]], ['apE', [10864]], ['ape', [8778]], ['apid', [8779]], ['apos', [39]], ['ApplyFunction', [8289]], ['approx', [8776]], ['approxeq', [8778]], ['Aring', [197]], ['aring', [229]], ['Ascr', [119964]], ['ascr', [119990]], ['Assign', [8788]], ['ast', [42]], ['asymp', [8776]], ['asympeq', [8781]], ['Atilde', [195]], ['atilde', [227]], ['Auml', [196]], ['auml', [228]], ['awconint', [8755]], ['awint', [10769]], ['backcong', [8780]], ['backepsilon', [1014]], ['backprime', [8245]], ['backsim', [8765]], ['backsimeq', [8909]], ['Backslash', [8726]], ['Barv', [10983]], ['barvee', [8893]], ['barwed', [8965]], ['Barwed', [8966]], ['barwedge', [8965]], ['bbrk', [9141]], ['bbrktbrk', [9142]], ['bcong', [8780]], ['Bcy', [1041]], ['bcy', [1073]], ['bdquo', [8222]], ['becaus', [8757]], ['because', [8757]], ['Because', [8757]], ['bemptyv', [10672]], ['bepsi', [1014]], ['bernou', [8492]], ['Bernoullis', [8492]], ['Beta', [914]], ['beta', [946]], ['beth', [8502]], ['between', [8812]], ['Bfr', [120069]], ['bfr', [120095]], ['bigcap', [8898]], ['bigcirc', [9711]], ['bigcup', [8899]], ['bigodot', [10752]], ['bigoplus', [10753]], ['bigotimes', [10754]], ['bigsqcup', [10758]], ['bigstar', [9733]], ['bigtriangledown', [9661]], ['bigtriangleup', [9651]], ['biguplus', [10756]], ['bigvee', [8897]], ['bigwedge', [8896]], ['bkarow', [10509]], ['blacklozenge', [10731]], ['blacksquare', [9642]], ['blacktriangle', [9652]], ['blacktriangledown', [9662]], ['blacktriangleleft', [9666]], ['blacktriangleright', [9656]], ['blank', [9251]], ['blk12', [9618]], ['blk14', [9617]], ['blk34', [9619]], ['block', [9608]], ['bne', [61, 8421]], ['bnequiv', [8801, 8421]], ['bNot', [10989]], ['bnot', [8976]], ['Bopf', [120121]], ['bopf', [120147]], ['bot', [8869]], ['bottom', [8869]], ['bowtie', [8904]], ['boxbox', [10697]], ['boxdl', [9488]], ['boxdL', [9557]], ['boxDl', [9558]], ['boxDL', [9559]], ['boxdr', [9484]], ['boxdR', [9554]], ['boxDr', [9555]], ['boxDR', [9556]], ['boxh', [9472]], ['boxH', [9552]], ['boxhd', [9516]], ['boxHd', [9572]], ['boxhD', [9573]], ['boxHD', [9574]], ['boxhu', [9524]], ['boxHu', [9575]], ['boxhU', [9576]], ['boxHU', [9577]], ['boxminus', [8863]], ['boxplus', [8862]], ['boxtimes', [8864]], ['boxul', [9496]], ['boxuL', [9563]], ['boxUl', [9564]], ['boxUL', [9565]], ['boxur', [9492]], ['boxuR', [9560]], ['boxUr', [9561]], ['boxUR', [9562]], ['boxv', [9474]], ['boxV', [9553]], ['boxvh', [9532]], ['boxvH', [9578]], ['boxVh', [9579]], ['boxVH', [9580]], ['boxvl', [9508]], ['boxvL', [9569]], ['boxVl', [9570]], ['boxVL', [9571]], ['boxvr', [9500]], ['boxvR', [9566]], ['boxVr', [9567]], ['boxVR', [9568]], ['bprime', [8245]], ['breve', [728]], ['Breve', [728]], ['brvbar', [166]], ['bscr', [119991]], ['Bscr', [8492]], ['bsemi', [8271]], ['bsim', [8765]], ['bsime', [8909]], ['bsolb', [10693]], ['bsol', [92]], ['bsolhsub', [10184]], ['bull', [8226]], ['bullet', [8226]], ['bump', [8782]], ['bumpE', [10926]], ['bumpe', [8783]], ['Bumpeq', [8782]], ['bumpeq', [8783]], ['Cacute', [262]], ['cacute', [263]], ['capand', [10820]], ['capbrcup', [10825]], ['capcap', [10827]], ['cap', [8745]], ['Cap', [8914]], ['capcup', [10823]], ['capdot', [10816]], ['CapitalDifferentialD', [8517]], ['caps', [8745, 65024]], ['caret', [8257]], ['caron', [711]], ['Cayleys', [8493]], ['ccaps', [10829]], ['Ccaron', [268]], ['ccaron', [269]], ['Ccedil', [199]], ['ccedil', [231]], ['Ccirc', [264]], ['ccirc', [265]], ['Cconint', [8752]], ['ccups', [10828]], ['ccupssm', [10832]], ['Cdot', [266]], ['cdot', [267]], ['cedil', [184]], ['Cedilla', [184]], ['cemptyv', [10674]], ['cent', [162]], ['centerdot', [183]], ['CenterDot', [183]], ['cfr', [120096]], ['Cfr', [8493]], ['CHcy', [1063]], ['chcy', [1095]], ['check', [10003]], ['checkmark', [10003]], ['Chi', [935]], ['chi', [967]], ['circ', [710]], ['circeq', [8791]], ['circlearrowleft', [8634]], ['circlearrowright', [8635]], ['circledast', [8859]], ['circledcirc', [8858]], ['circleddash', [8861]], ['CircleDot', [8857]], ['circledR', [174]], ['circledS', [9416]], ['CircleMinus', [8854]], ['CirclePlus', [8853]], ['CircleTimes', [8855]], ['cir', [9675]], ['cirE', [10691]], ['cire', [8791]], ['cirfnint', [10768]], ['cirmid', [10991]], ['cirscir', [10690]], ['ClockwiseContourIntegral', [8754]], ['CloseCurlyDoubleQuote', [8221]], ['CloseCurlyQuote', [8217]], ['clubs', [9827]], ['clubsuit', [9827]], ['colon', [58]], ['Colon', [8759]], ['Colone', [10868]], ['colone', [8788]], ['coloneq', [8788]], ['comma', [44]], ['commat', [64]], ['comp', [8705]], ['compfn', [8728]], ['complement', [8705]], ['complexes', [8450]], ['cong', [8773]], ['congdot', [10861]], ['Congruent', [8801]], ['conint', [8750]], ['Conint', [8751]], ['ContourIntegral', [8750]], ['copf', [120148]], ['Copf', [8450]], ['coprod', [8720]], ['Coproduct', [8720]], ['copy', [169]], ['COPY', [169]], ['copysr', [8471]], ['CounterClockwiseContourIntegral', [8755]], ['crarr', [8629]], ['cross', [10007]], ['Cross', [10799]], ['Cscr', [119966]], ['cscr', [119992]], ['csub', [10959]], ['csube', [10961]], ['csup', [10960]], ['csupe', [10962]], ['ctdot', [8943]], ['cudarrl', [10552]], ['cudarrr', [10549]], ['cuepr', [8926]], ['cuesc', [8927]], ['cularr', [8630]], ['cularrp', [10557]], ['cupbrcap', [10824]], ['cupcap', [10822]], ['CupCap', [8781]], ['cup', [8746]], ['Cup', [8915]], ['cupcup', [10826]], ['cupdot', [8845]], ['cupor', [10821]], ['cups', [8746, 65024]], ['curarr', [8631]], ['curarrm', [10556]], ['curlyeqprec', [8926]], ['curlyeqsucc', [8927]], ['curlyvee', [8910]], ['curlywedge', [8911]], ['curren', [164]], ['curvearrowleft', [8630]], ['curvearrowright', [8631]], ['cuvee', [8910]], ['cuwed', [8911]], ['cwconint', [8754]], ['cwint', [8753]], ['cylcty', [9005]], ['dagger', [8224]], ['Dagger', [8225]], ['daleth', [8504]], ['darr', [8595]], ['Darr', [8609]], ['dArr', [8659]], ['dash', [8208]], ['Dashv', [10980]], ['dashv', [8867]], ['dbkarow', [10511]], ['dblac', [733]], ['Dcaron', [270]], ['dcaron', [271]], ['Dcy', [1044]], ['dcy', [1076]], ['ddagger', [8225]], ['ddarr', [8650]], ['DD', [8517]], ['dd', [8518]], ['DDotrahd', [10513]], ['ddotseq', [10871]], ['deg', [176]], ['Del', [8711]], ['Delta', [916]], ['delta', [948]], ['demptyv', [10673]], ['dfisht', [10623]], ['Dfr', [120071]], ['dfr', [120097]], ['dHar', [10597]], ['dharl', [8643]], ['dharr', [8642]], ['DiacriticalAcute', [180]], ['DiacriticalDot', [729]], ['DiacriticalDoubleAcute', [733]], ['DiacriticalGrave', [96]], ['DiacriticalTilde', [732]], ['diam', [8900]], ['diamond', [8900]], ['Diamond', [8900]], ['diamondsuit', [9830]], ['diams', [9830]], ['die', [168]], ['DifferentialD', [8518]], ['digamma', [989]], ['disin', [8946]], ['div', [247]], ['divide', [247]], ['divideontimes', [8903]], ['divonx', [8903]], ['DJcy', [1026]], ['djcy', [1106]], ['dlcorn', [8990]], ['dlcrop', [8973]], ['dollar', [36]], ['Dopf', [120123]], ['dopf', [120149]], ['Dot', [168]], ['dot', [729]], ['DotDot', [8412]], ['doteq', [8784]], ['doteqdot', [8785]], ['DotEqual', [8784]], ['dotminus', [8760]], ['dotplus', [8724]], ['dotsquare', [8865]], ['doublebarwedge', [8966]], ['DoubleContourIntegral', [8751]], ['DoubleDot', [168]], ['DoubleDownArrow', [8659]], ['DoubleLeftArrow', [8656]], ['DoubleLeftRightArrow', [8660]], ['DoubleLeftTee', [10980]], ['DoubleLongLeftArrow', [10232]], ['DoubleLongLeftRightArrow', [10234]], ['DoubleLongRightArrow', [10233]], ['DoubleRightArrow', [8658]], ['DoubleRightTee', [8872]], ['DoubleUpArrow', [8657]], ['DoubleUpDownArrow', [8661]], ['DoubleVerticalBar', [8741]], ['DownArrowBar', [10515]], ['downarrow', [8595]], ['DownArrow', [8595]], ['Downarrow', [8659]], ['DownArrowUpArrow', [8693]], ['DownBreve', [785]], ['downdownarrows', [8650]], ['downharpoonleft', [8643]], ['downharpoonright', [8642]], ['DownLeftRightVector', [10576]], ['DownLeftTeeVector', [10590]], ['DownLeftVectorBar', [10582]], ['DownLeftVector', [8637]], ['DownRightTeeVector', [10591]], ['DownRightVectorBar', [10583]], ['DownRightVector', [8641]], ['DownTeeArrow', [8615]], ['DownTee', [8868]], ['drbkarow', [10512]], ['drcorn', [8991]], ['drcrop', [8972]], ['Dscr', [119967]], ['dscr', [119993]], ['DScy', [1029]], ['dscy', [1109]], ['dsol', [10742]], ['Dstrok', [272]], ['dstrok', [273]], ['dtdot', [8945]], ['dtri', [9663]], ['dtrif', [9662]], ['duarr', [8693]], ['duhar', [10607]], ['dwangle', [10662]], ['DZcy', [1039]], ['dzcy', [1119]], ['dzigrarr', [10239]], ['Eacute', [201]], ['eacute', [233]], ['easter', [10862]], ['Ecaron', [282]], ['ecaron', [283]], ['Ecirc', [202]], ['ecirc', [234]], ['ecir', [8790]], ['ecolon', [8789]], ['Ecy', [1069]], ['ecy', [1101]], ['eDDot', [10871]], ['Edot', [278]], ['edot', [279]], ['eDot', [8785]], ['ee', [8519]], ['efDot', [8786]], ['Efr', [120072]], ['efr', [120098]], ['eg', [10906]], ['Egrave', [200]], ['egrave', [232]], ['egs', [10902]], ['egsdot', [10904]], ['el', [10905]], ['Element', [8712]], ['elinters', [9191]], ['ell', [8467]], ['els', [10901]], ['elsdot', [10903]], ['Emacr', [274]], ['emacr', [275]], ['empty', [8709]], ['emptyset', [8709]], ['EmptySmallSquare', [9723]], ['emptyv', [8709]], ['EmptyVerySmallSquare', [9643]], ['emsp13', [8196]], ['emsp14', [8197]], ['emsp', [8195]], ['ENG', [330]], ['eng', [331]], ['ensp', [8194]], ['Eogon', [280]], ['eogon', [281]], ['Eopf', [120124]], ['eopf', [120150]], ['epar', [8917]], ['eparsl', [10723]], ['eplus', [10865]], ['epsi', [949]], ['Epsilon', [917]], ['epsilon', [949]], ['epsiv', [1013]], ['eqcirc', [8790]], ['eqcolon', [8789]], ['eqsim', [8770]], ['eqslantgtr', [10902]], ['eqslantless', [10901]], ['Equal', [10869]], ['equals', [61]], ['EqualTilde', [8770]], ['equest', [8799]], ['Equilibrium', [8652]], ['equiv', [8801]], ['equivDD', [10872]], ['eqvparsl', [10725]], ['erarr', [10609]], ['erDot', [8787]], ['escr', [8495]], ['Escr', [8496]], ['esdot', [8784]], ['Esim', [10867]], ['esim', [8770]], ['Eta', [919]], ['eta', [951]], ['ETH', [208]], ['eth', [240]], ['Euml', [203]], ['euml', [235]], ['euro', [8364]], ['excl', [33]], ['exist', [8707]], ['Exists', [8707]], ['expectation', [8496]], ['exponentiale', [8519]], ['ExponentialE', [8519]], ['fallingdotseq', [8786]], ['Fcy', [1060]], ['fcy', [1092]], ['female', [9792]], ['ffilig', [64259]], ['fflig', [64256]], ['ffllig', [64260]], ['Ffr', [120073]], ['ffr', [120099]], ['filig', [64257]], ['FilledSmallSquare', [9724]], ['FilledVerySmallSquare', [9642]], ['fjlig', [102, 106]], ['flat', [9837]], ['fllig', [64258]], ['fltns', [9649]], ['fnof', [402]], ['Fopf', [120125]], ['fopf', [120151]], ['forall', [8704]], ['ForAll', [8704]], ['fork', [8916]], ['forkv', [10969]], ['Fouriertrf', [8497]], ['fpartint', [10765]], ['frac12', [189]], ['frac13', [8531]], ['frac14', [188]], ['frac15', [8533]], ['frac16', [8537]], ['frac18', [8539]], ['frac23', [8532]], ['frac25', [8534]], ['frac34', [190]], ['frac35', [8535]], ['frac38', [8540]], ['frac45', [8536]], ['frac56', [8538]], ['frac58', [8541]], ['frac78', [8542]], ['frasl', [8260]], ['frown', [8994]], ['fscr', [119995]], ['Fscr', [8497]], ['gacute', [501]], ['Gamma', [915]], ['gamma', [947]], ['Gammad', [988]], ['gammad', [989]], ['gap', [10886]], ['Gbreve', [286]], ['gbreve', [287]], ['Gcedil', [290]], ['Gcirc', [284]], ['gcirc', [285]], ['Gcy', [1043]], ['gcy', [1075]], ['Gdot', [288]], ['gdot', [289]], ['ge', [8805]], ['gE', [8807]], ['gEl', [10892]], ['gel', [8923]], ['geq', [8805]], ['geqq', [8807]], ['geqslant', [10878]], ['gescc', [10921]], ['ges', [10878]], ['gesdot', [10880]], ['gesdoto', [10882]], ['gesdotol', [10884]], ['gesl', [8923, 65024]], ['gesles', [10900]], ['Gfr', [120074]], ['gfr', [120100]], ['gg', [8811]], ['Gg', [8921]], ['ggg', [8921]], ['gimel', [8503]], ['GJcy', [1027]], ['gjcy', [1107]], ['gla', [10917]], ['gl', [8823]], ['glE', [10898]], ['glj', [10916]], ['gnap', [10890]], ['gnapprox', [10890]], ['gne', [10888]], ['gnE', [8809]], ['gneq', [10888]], ['gneqq', [8809]], ['gnsim', [8935]], ['Gopf', [120126]], ['gopf', [120152]], ['grave', [96]], ['GreaterEqual', [8805]], ['GreaterEqualLess', [8923]], ['GreaterFullEqual', [8807]], ['GreaterGreater', [10914]], ['GreaterLess', [8823]], ['GreaterSlantEqual', [10878]], ['GreaterTilde', [8819]], ['Gscr', [119970]], ['gscr', [8458]], ['gsim', [8819]], ['gsime', [10894]], ['gsiml', [10896]], ['gtcc', [10919]], ['gtcir', [10874]], ['gt', [62]], ['GT', [62]], ['Gt', [8811]], ['gtdot', [8919]], ['gtlPar', [10645]], ['gtquest', [10876]], ['gtrapprox', [10886]], ['gtrarr', [10616]], ['gtrdot', [8919]], ['gtreqless', [8923]], ['gtreqqless', [10892]], ['gtrless', [8823]], ['gtrsim', [8819]], ['gvertneqq', [8809, 65024]], ['gvnE', [8809, 65024]], ['Hacek', [711]], ['hairsp', [8202]], ['half', [189]], ['hamilt', [8459]], ['HARDcy', [1066]], ['hardcy', [1098]], ['harrcir', [10568]], ['harr', [8596]], ['hArr', [8660]], ['harrw', [8621]], ['Hat', [94]], ['hbar', [8463]], ['Hcirc', [292]], ['hcirc', [293]], ['hearts', [9829]], ['heartsuit', [9829]], ['hellip', [8230]], ['hercon', [8889]], ['hfr', [120101]], ['Hfr', [8460]], ['HilbertSpace', [8459]], ['hksearow', [10533]], ['hkswarow', [10534]], ['hoarr', [8703]], ['homtht', [8763]], ['hookleftarrow', [8617]], ['hookrightarrow', [8618]], ['hopf', [120153]], ['Hopf', [8461]], ['horbar', [8213]], ['HorizontalLine', [9472]], ['hscr', [119997]], ['Hscr', [8459]], ['hslash', [8463]], ['Hstrok', [294]], ['hstrok', [295]], ['HumpDownHump', [8782]], ['HumpEqual', [8783]], ['hybull', [8259]], ['hyphen', [8208]], ['Iacute', [205]], ['iacute', [237]], ['ic', [8291]], ['Icirc', [206]], ['icirc', [238]], ['Icy', [1048]], ['icy', [1080]], ['Idot', [304]], ['IEcy', [1045]], ['iecy', [1077]], ['iexcl', [161]], ['iff', [8660]], ['ifr', [120102]], ['Ifr', [8465]], ['Igrave', [204]], ['igrave', [236]], ['ii', [8520]], ['iiiint', [10764]], ['iiint', [8749]], ['iinfin', [10716]], ['iiota', [8489]], ['IJlig', [306]], ['ijlig', [307]], ['Imacr', [298]], ['imacr', [299]], ['image', [8465]], ['ImaginaryI', [8520]], ['imagline', [8464]], ['imagpart', [8465]], ['imath', [305]], ['Im', [8465]], ['imof', [8887]], ['imped', [437]], ['Implies', [8658]], ['incare', [8453]], ['in', [8712]], ['infin', [8734]], ['infintie', [10717]], ['inodot', [305]], ['intcal', [8890]], ['int', [8747]], ['Int', [8748]], ['integers', [8484]], ['Integral', [8747]], ['intercal', [8890]], ['Intersection', [8898]], ['intlarhk', [10775]], ['intprod', [10812]], ['InvisibleComma', [8291]], ['InvisibleTimes', [8290]], ['IOcy', [1025]], ['iocy', [1105]], ['Iogon', [302]], ['iogon', [303]], ['Iopf', [120128]], ['iopf', [120154]], ['Iota', [921]], ['iota', [953]], ['iprod', [10812]], ['iquest', [191]], ['iscr', [119998]], ['Iscr', [8464]], ['isin', [8712]], ['isindot', [8949]], ['isinE', [8953]], ['isins', [8948]], ['isinsv', [8947]], ['isinv', [8712]], ['it', [8290]], ['Itilde', [296]], ['itilde', [297]], ['Iukcy', [1030]], ['iukcy', [1110]], ['Iuml', [207]], ['iuml', [239]], ['Jcirc', [308]], ['jcirc', [309]], ['Jcy', [1049]], ['jcy', [1081]], ['Jfr', [120077]], ['jfr', [120103]], ['jmath', [567]], ['Jopf', [120129]], ['jopf', [120155]], ['Jscr', [119973]], ['jscr', [119999]], ['Jsercy', [1032]], ['jsercy', [1112]], ['Jukcy', [1028]], ['jukcy', [1108]], ['Kappa', [922]], ['kappa', [954]], ['kappav', [1008]], ['Kcedil', [310]], ['kcedil', [311]], ['Kcy', [1050]], ['kcy', [1082]], ['Kfr', [120078]], ['kfr', [120104]], ['kgreen', [312]], ['KHcy', [1061]], ['khcy', [1093]], ['KJcy', [1036]], ['kjcy', [1116]], ['Kopf', [120130]], ['kopf', [120156]], ['Kscr', [119974]], ['kscr', [120000]], ['lAarr', [8666]], ['Lacute', [313]], ['lacute', [314]], ['laemptyv', [10676]], ['lagran', [8466]], ['Lambda', [923]], ['lambda', [955]], ['lang', [10216]], ['Lang', [10218]], ['langd', [10641]], ['langle', [10216]], ['lap', [10885]], ['Laplacetrf', [8466]], ['laquo', [171]], ['larrb', [8676]], ['larrbfs', [10527]], ['larr', [8592]], ['Larr', [8606]], ['lArr', [8656]], ['larrfs', [10525]], ['larrhk', [8617]], ['larrlp', [8619]], ['larrpl', [10553]], ['larrsim', [10611]], ['larrtl', [8610]], ['latail', [10521]], ['lAtail', [10523]], ['lat', [10923]], ['late', [10925]], ['lates', [10925, 65024]], ['lbarr', [10508]], ['lBarr', [10510]], ['lbbrk', [10098]], ['lbrace', [123]], ['lbrack', [91]], ['lbrke', [10635]], ['lbrksld', [10639]], ['lbrkslu', [10637]], ['Lcaron', [317]], ['lcaron', [318]], ['Lcedil', [315]], ['lcedil', [316]], ['lceil', [8968]], ['lcub', [123]], ['Lcy', [1051]], ['lcy', [1083]], ['ldca', [10550]], ['ldquo', [8220]], ['ldquor', [8222]], ['ldrdhar', [10599]], ['ldrushar', [10571]], ['ldsh', [8626]], ['le', [8804]], ['lE', [8806]], ['LeftAngleBracket', [10216]], ['LeftArrowBar', [8676]], ['leftarrow', [8592]], ['LeftArrow', [8592]], ['Leftarrow', [8656]], ['LeftArrowRightArrow', [8646]], ['leftarrowtail', [8610]], ['LeftCeiling', [8968]], ['LeftDoubleBracket', [10214]], ['LeftDownTeeVector', [10593]], ['LeftDownVectorBar', [10585]], ['LeftDownVector', [8643]], ['LeftFloor', [8970]], ['leftharpoondown', [8637]], ['leftharpoonup', [8636]], ['leftleftarrows', [8647]], ['leftrightarrow', [8596]], ['LeftRightArrow', [8596]], ['Leftrightarrow', [8660]], ['leftrightarrows', [8646]], ['leftrightharpoons', [8651]], ['leftrightsquigarrow', [8621]], ['LeftRightVector', [10574]], ['LeftTeeArrow', [8612]], ['LeftTee', [8867]], ['LeftTeeVector', [10586]], ['leftthreetimes', [8907]], ['LeftTriangleBar', [10703]], ['LeftTriangle', [8882]], ['LeftTriangleEqual', [8884]], ['LeftUpDownVector', [10577]], ['LeftUpTeeVector', [10592]], ['LeftUpVectorBar', [10584]], ['LeftUpVector', [8639]], ['LeftVectorBar', [10578]], ['LeftVector', [8636]], ['lEg', [10891]], ['leg', [8922]], ['leq', [8804]], ['leqq', [8806]], ['leqslant', [10877]], ['lescc', [10920]], ['les', [10877]], ['lesdot', [10879]], ['lesdoto', [10881]], ['lesdotor', [10883]], ['lesg', [8922, 65024]], ['lesges', [10899]], ['lessapprox', [10885]], ['lessdot', [8918]], ['lesseqgtr', [8922]], ['lesseqqgtr', [10891]], ['LessEqualGreater', [8922]], ['LessFullEqual', [8806]], ['LessGreater', [8822]], ['lessgtr', [8822]], ['LessLess', [10913]], ['lesssim', [8818]], ['LessSlantEqual', [10877]], ['LessTilde', [8818]], ['lfisht', [10620]], ['lfloor', [8970]], ['Lfr', [120079]], ['lfr', [120105]], ['lg', [8822]], ['lgE', [10897]], ['lHar', [10594]], ['lhard', [8637]], ['lharu', [8636]], ['lharul', [10602]], ['lhblk', [9604]], ['LJcy', [1033]], ['ljcy', [1113]], ['llarr', [8647]], ['ll', [8810]], ['Ll', [8920]], ['llcorner', [8990]], ['Lleftarrow', [8666]], ['llhard', [10603]], ['lltri', [9722]], ['Lmidot', [319]], ['lmidot', [320]], ['lmoustache', [9136]], ['lmoust', [9136]], ['lnap', [10889]], ['lnapprox', [10889]], ['lne', [10887]], ['lnE', [8808]], ['lneq', [10887]], ['lneqq', [8808]], ['lnsim', [8934]], ['loang', [10220]], ['loarr', [8701]], ['lobrk', [10214]], ['longleftarrow', [10229]], ['LongLeftArrow', [10229]], ['Longleftarrow', [10232]], ['longleftrightarrow', [10231]], ['LongLeftRightArrow', [10231]], ['Longleftrightarrow', [10234]], ['longmapsto', [10236]], ['longrightarrow', [10230]], ['LongRightArrow', [10230]], ['Longrightarrow', [10233]], ['looparrowleft', [8619]], ['looparrowright', [8620]], ['lopar', [10629]], ['Lopf', [120131]], ['lopf', [120157]], ['loplus', [10797]], ['lotimes', [10804]], ['lowast', [8727]], ['lowbar', [95]], ['LowerLeftArrow', [8601]], ['LowerRightArrow', [8600]], ['loz', [9674]], ['lozenge', [9674]], ['lozf', [10731]], ['lpar', [40]], ['lparlt', [10643]], ['lrarr', [8646]], ['lrcorner', [8991]], ['lrhar', [8651]], ['lrhard', [10605]], ['lrm', [8206]], ['lrtri', [8895]], ['lsaquo', [8249]], ['lscr', [120001]], ['Lscr', [8466]], ['lsh', [8624]], ['Lsh', [8624]], ['lsim', [8818]], ['lsime', [10893]], ['lsimg', [10895]], ['lsqb', [91]], ['lsquo', [8216]], ['lsquor', [8218]], ['Lstrok', [321]], ['lstrok', [322]], ['ltcc', [10918]], ['ltcir', [10873]], ['lt', [60]], ['LT', [60]], ['Lt', [8810]], ['ltdot', [8918]], ['lthree', [8907]], ['ltimes', [8905]], ['ltlarr', [10614]], ['ltquest', [10875]], ['ltri', [9667]], ['ltrie', [8884]], ['ltrif', [9666]], ['ltrPar', [10646]], ['lurdshar', [10570]], ['luruhar', [10598]], ['lvertneqq', [8808, 65024]], ['lvnE', [8808, 65024]], ['macr', [175]], ['male', [9794]], ['malt', [10016]], ['maltese', [10016]], ['Map', [10501]], ['map', [8614]], ['mapsto', [8614]], ['mapstodown', [8615]], ['mapstoleft', [8612]], ['mapstoup', [8613]], ['marker', [9646]], ['mcomma', [10793]], ['Mcy', [1052]], ['mcy', [1084]], ['mdash', [8212]], ['mDDot', [8762]], ['measuredangle', [8737]], ['MediumSpace', [8287]], ['Mellintrf', [8499]], ['Mfr', [120080]], ['mfr', [120106]], ['mho', [8487]], ['micro', [181]], ['midast', [42]], ['midcir', [10992]], ['mid', [8739]], ['middot', [183]], ['minusb', [8863]], ['minus', [8722]], ['minusd', [8760]], ['minusdu', [10794]], ['MinusPlus', [8723]], ['mlcp', [10971]], ['mldr', [8230]], ['mnplus', [8723]], ['models', [8871]], ['Mopf', [120132]], ['mopf', [120158]], ['mp', [8723]], ['mscr', [120002]], ['Mscr', [8499]], ['mstpos', [8766]], ['Mu', [924]], ['mu', [956]], ['multimap', [8888]], ['mumap', [8888]], ['nabla', [8711]], ['Nacute', [323]], ['nacute', [324]], ['nang', [8736, 8402]], ['nap', [8777]], ['napE', [10864, 824]], ['napid', [8779, 824]], ['napos', [329]], ['napprox', [8777]], ['natural', [9838]], ['naturals', [8469]], ['natur', [9838]], ['nbsp', [160]], ['nbump', [8782, 824]], ['nbumpe', [8783, 824]], ['ncap', [10819]], ['Ncaron', [327]], ['ncaron', [328]], ['Ncedil', [325]], ['ncedil', [326]], ['ncong', [8775]], ['ncongdot', [10861, 824]], ['ncup', [10818]], ['Ncy', [1053]], ['ncy', [1085]], ['ndash', [8211]], ['nearhk', [10532]], ['nearr', [8599]], ['neArr', [8663]], ['nearrow', [8599]], ['ne', [8800]], ['nedot', [8784, 824]], ['NegativeMediumSpace', [8203]], ['NegativeThickSpace', [8203]], ['NegativeThinSpace', [8203]], ['NegativeVeryThinSpace', [8203]], ['nequiv', [8802]], ['nesear', [10536]], ['nesim', [8770, 824]], ['NestedGreaterGreater', [8811]], ['NestedLessLess', [8810]], ['nexist', [8708]], ['nexists', [8708]], ['Nfr', [120081]], ['nfr', [120107]], ['ngE', [8807, 824]], ['nge', [8817]], ['ngeq', [8817]], ['ngeqq', [8807, 824]], ['ngeqslant', [10878, 824]], ['nges', [10878, 824]], ['nGg', [8921, 824]], ['ngsim', [8821]], ['nGt', [8811, 8402]], ['ngt', [8815]], ['ngtr', [8815]], ['nGtv', [8811, 824]], ['nharr', [8622]], ['nhArr', [8654]], ['nhpar', [10994]], ['ni', [8715]], ['nis', [8956]], ['nisd', [8954]], ['niv', [8715]], ['NJcy', [1034]], ['njcy', [1114]], ['nlarr', [8602]], ['nlArr', [8653]], ['nldr', [8229]], ['nlE', [8806, 824]], ['nle', [8816]], ['nleftarrow', [8602]], ['nLeftarrow', [8653]], ['nleftrightarrow', [8622]], ['nLeftrightarrow', [8654]], ['nleq', [8816]], ['nleqq', [8806, 824]], ['nleqslant', [10877, 824]], ['nles', [10877, 824]], ['nless', [8814]], ['nLl', [8920, 824]], ['nlsim', [8820]], ['nLt', [8810, 8402]], ['nlt', [8814]], ['nltri', [8938]], ['nltrie', [8940]], ['nLtv', [8810, 824]], ['nmid', [8740]], ['NoBreak', [8288]], ['NonBreakingSpace', [160]], ['nopf', [120159]], ['Nopf', [8469]], ['Not', [10988]], ['not', [172]], ['NotCongruent', [8802]], ['NotCupCap', [8813]], ['NotDoubleVerticalBar', [8742]], ['NotElement', [8713]], ['NotEqual', [8800]], ['NotEqualTilde', [8770, 824]], ['NotExists', [8708]], ['NotGreater', [8815]], ['NotGreaterEqual', [8817]], ['NotGreaterFullEqual', [8807, 824]], ['NotGreaterGreater', [8811, 824]], ['NotGreaterLess', [8825]], ['NotGreaterSlantEqual', [10878, 824]], ['NotGreaterTilde', [8821]], ['NotHumpDownHump', [8782, 824]], ['NotHumpEqual', [8783, 824]], ['notin', [8713]], ['notindot', [8949, 824]], ['notinE', [8953, 824]], ['notinva', [8713]], ['notinvb', [8951]], ['notinvc', [8950]], ['NotLeftTriangleBar', [10703, 824]], ['NotLeftTriangle', [8938]], ['NotLeftTriangleEqual', [8940]], ['NotLess', [8814]], ['NotLessEqual', [8816]], ['NotLessGreater', [8824]], ['NotLessLess', [8810, 824]], ['NotLessSlantEqual', [10877, 824]], ['NotLessTilde', [8820]], ['NotNestedGreaterGreater', [10914, 824]], ['NotNestedLessLess', [10913, 824]], ['notni', [8716]], ['notniva', [8716]], ['notnivb', [8958]], ['notnivc', [8957]], ['NotPrecedes', [8832]], ['NotPrecedesEqual', [10927, 824]], ['NotPrecedesSlantEqual', [8928]], ['NotReverseElement', [8716]], ['NotRightTriangleBar', [10704, 824]], ['NotRightTriangle', [8939]], ['NotRightTriangleEqual', [8941]], ['NotSquareSubset', [8847, 824]], ['NotSquareSubsetEqual', [8930]], ['NotSquareSuperset', [8848, 824]], ['NotSquareSupersetEqual', [8931]], ['NotSubset', [8834, 8402]], ['NotSubsetEqual', [8840]], ['NotSucceeds', [8833]], ['NotSucceedsEqual', [10928, 824]], ['NotSucceedsSlantEqual', [8929]], ['NotSucceedsTilde', [8831, 824]], ['NotSuperset', [8835, 8402]], ['NotSupersetEqual', [8841]], ['NotTilde', [8769]], ['NotTildeEqual', [8772]], ['NotTildeFullEqual', [8775]], ['NotTildeTilde', [8777]], ['NotVerticalBar', [8740]], ['nparallel', [8742]], ['npar', [8742]], ['nparsl', [11005, 8421]], ['npart', [8706, 824]], ['npolint', [10772]], ['npr', [8832]], ['nprcue', [8928]], ['nprec', [8832]], ['npreceq', [10927, 824]], ['npre', [10927, 824]], ['nrarrc', [10547, 824]], ['nrarr', [8603]], ['nrArr', [8655]], ['nrarrw', [8605, 824]], ['nrightarrow', [8603]], ['nRightarrow', [8655]], ['nrtri', [8939]], ['nrtrie', [8941]], ['nsc', [8833]], ['nsccue', [8929]], ['nsce', [10928, 824]], ['Nscr', [119977]], ['nscr', [120003]], ['nshortmid', [8740]], ['nshortparallel', [8742]], ['nsim', [8769]], ['nsime', [8772]], ['nsimeq', [8772]], ['nsmid', [8740]], ['nspar', [8742]], ['nsqsube', [8930]], ['nsqsupe', [8931]], ['nsub', [8836]], ['nsubE', [10949, 824]], ['nsube', [8840]], ['nsubset', [8834, 8402]], ['nsubseteq', [8840]], ['nsubseteqq', [10949, 824]], ['nsucc', [8833]], ['nsucceq', [10928, 824]], ['nsup', [8837]], ['nsupE', [10950, 824]], ['nsupe', [8841]], ['nsupset', [8835, 8402]], ['nsupseteq', [8841]], ['nsupseteqq', [10950, 824]], ['ntgl', [8825]], ['Ntilde', [209]], ['ntilde', [241]], ['ntlg', [8824]], ['ntriangleleft', [8938]], ['ntrianglelefteq', [8940]], ['ntriangleright', [8939]], ['ntrianglerighteq', [8941]], ['Nu', [925]], ['nu', [957]], ['num', [35]], ['numero', [8470]], ['numsp', [8199]], ['nvap', [8781, 8402]], ['nvdash', [8876]], ['nvDash', [8877]], ['nVdash', [8878]], ['nVDash', [8879]], ['nvge', [8805, 8402]], ['nvgt', [62, 8402]], ['nvHarr', [10500]], ['nvinfin', [10718]], ['nvlArr', [10498]], ['nvle', [8804, 8402]], ['nvlt', [60, 8402]], ['nvltrie', [8884, 8402]], ['nvrArr', [10499]], ['nvrtrie', [8885, 8402]], ['nvsim', [8764, 8402]], ['nwarhk', [10531]], ['nwarr', [8598]], ['nwArr', [8662]], ['nwarrow', [8598]], ['nwnear', [10535]], ['Oacute', [211]], ['oacute', [243]], ['oast', [8859]], ['Ocirc', [212]], ['ocirc', [244]], ['ocir', [8858]], ['Ocy', [1054]], ['ocy', [1086]], ['odash', [8861]], ['Odblac', [336]], ['odblac', [337]], ['odiv', [10808]], ['odot', [8857]], ['odsold', [10684]], ['OElig', [338]], ['oelig', [339]], ['ofcir', [10687]], ['Ofr', [120082]], ['ofr', [120108]], ['ogon', [731]], ['Ograve', [210]], ['ograve', [242]], ['ogt', [10689]], ['ohbar', [10677]], ['ohm', [937]], ['oint', [8750]], ['olarr', [8634]], ['olcir', [10686]], ['olcross', [10683]], ['oline', [8254]], ['olt', [10688]], ['Omacr', [332]], ['omacr', [333]], ['Omega', [937]], ['omega', [969]], ['Omicron', [927]], ['omicron', [959]], ['omid', [10678]], ['ominus', [8854]], ['Oopf', [120134]], ['oopf', [120160]], ['opar', [10679]], ['OpenCurlyDoubleQuote', [8220]], ['OpenCurlyQuote', [8216]], ['operp', [10681]], ['oplus', [8853]], ['orarr', [8635]], ['Or', [10836]], ['or', [8744]], ['ord', [10845]], ['order', [8500]], ['orderof', [8500]], ['ordf', [170]], ['ordm', [186]], ['origof', [8886]], ['oror', [10838]], ['orslope', [10839]], ['orv', [10843]], ['oS', [9416]], ['Oscr', [119978]], ['oscr', [8500]], ['Oslash', [216]], ['oslash', [248]], ['osol', [8856]], ['Otilde', [213]], ['otilde', [245]], ['otimesas', [10806]], ['Otimes', [10807]], ['otimes', [8855]], ['Ouml', [214]], ['ouml', [246]], ['ovbar', [9021]], ['OverBar', [8254]], ['OverBrace', [9182]], ['OverBracket', [9140]], ['OverParenthesis', [9180]], ['para', [182]], ['parallel', [8741]], ['par', [8741]], ['parsim', [10995]], ['parsl', [11005]], ['part', [8706]], ['PartialD', [8706]], ['Pcy', [1055]], ['pcy', [1087]], ['percnt', [37]], ['period', [46]], ['permil', [8240]], ['perp', [8869]], ['pertenk', [8241]], ['Pfr', [120083]], ['pfr', [120109]], ['Phi', [934]], ['phi', [966]], ['phiv', [981]], ['phmmat', [8499]], ['phone', [9742]], ['Pi', [928]], ['pi', [960]], ['pitchfork', [8916]], ['piv', [982]], ['planck', [8463]], ['planckh', [8462]], ['plankv', [8463]], ['plusacir', [10787]], ['plusb', [8862]], ['pluscir', [10786]], ['plus', [43]], ['plusdo', [8724]], ['plusdu', [10789]], ['pluse', [10866]], ['PlusMinus', [177]], ['plusmn', [177]], ['plussim', [10790]], ['plustwo', [10791]], ['pm', [177]], ['Poincareplane', [8460]], ['pointint', [10773]], ['popf', [120161]], ['Popf', [8473]], ['pound', [163]], ['prap', [10935]], ['Pr', [10939]], ['pr', [8826]], ['prcue', [8828]], ['precapprox', [10935]], ['prec', [8826]], ['preccurlyeq', [8828]], ['Precedes', [8826]], ['PrecedesEqual', [10927]], ['PrecedesSlantEqual', [8828]], ['PrecedesTilde', [8830]], ['preceq', [10927]], ['precnapprox', [10937]], ['precneqq', [10933]], ['precnsim', [8936]], ['pre', [10927]], ['prE', [10931]], ['precsim', [8830]], ['prime', [8242]], ['Prime', [8243]], ['primes', [8473]], ['prnap', [10937]], ['prnE', [10933]], ['prnsim', [8936]], ['prod', [8719]], ['Product', [8719]], ['profalar', [9006]], ['profline', [8978]], ['profsurf', [8979]], ['prop', [8733]], ['Proportional', [8733]], ['Proportion', [8759]], ['propto', [8733]], ['prsim', [8830]], ['prurel', [8880]], ['Pscr', [119979]], ['pscr', [120005]], ['Psi', [936]], ['psi', [968]], ['puncsp', [8200]], ['Qfr', [120084]], ['qfr', [120110]], ['qint', [10764]], ['qopf', [120162]], ['Qopf', [8474]], ['qprime', [8279]], ['Qscr', [119980]], ['qscr', [120006]], ['quaternions', [8461]], ['quatint', [10774]], ['quest', [63]], ['questeq', [8799]], ['quot', [34]], ['QUOT', [34]], ['rAarr', [8667]], ['race', [8765, 817]], ['Racute', [340]], ['racute', [341]], ['radic', [8730]], ['raemptyv', [10675]], ['rang', [10217]], ['Rang', [10219]], ['rangd', [10642]], ['range', [10661]], ['rangle', [10217]], ['raquo', [187]], ['rarrap', [10613]], ['rarrb', [8677]], ['rarrbfs', [10528]], ['rarrc', [10547]], ['rarr', [8594]], ['Rarr', [8608]], ['rArr', [8658]], ['rarrfs', [10526]], ['rarrhk', [8618]], ['rarrlp', [8620]], ['rarrpl', [10565]], ['rarrsim', [10612]], ['Rarrtl', [10518]], ['rarrtl', [8611]], ['rarrw', [8605]], ['ratail', [10522]], ['rAtail', [10524]], ['ratio', [8758]], ['rationals', [8474]], ['rbarr', [10509]], ['rBarr', [10511]], ['RBarr', [10512]], ['rbbrk', [10099]], ['rbrace', [125]], ['rbrack', [93]], ['rbrke', [10636]], ['rbrksld', [10638]], ['rbrkslu', [10640]], ['Rcaron', [344]], ['rcaron', [345]], ['Rcedil', [342]], ['rcedil', [343]], ['rceil', [8969]], ['rcub', [125]], ['Rcy', [1056]], ['rcy', [1088]], ['rdca', [10551]], ['rdldhar', [10601]], ['rdquo', [8221]], ['rdquor', [8221]], ['rdsh', [8627]], ['real', [8476]], ['realine', [8475]], ['realpart', [8476]], ['reals', [8477]], ['Re', [8476]], ['rect', [9645]], ['reg', [174]], ['REG', [174]], ['ReverseElement', [8715]], ['ReverseEquilibrium', [8651]], ['ReverseUpEquilibrium', [10607]], ['rfisht', [10621]], ['rfloor', [8971]], ['rfr', [120111]], ['Rfr', [8476]], ['rHar', [10596]], ['rhard', [8641]], ['rharu', [8640]], ['rharul', [10604]], ['Rho', [929]], ['rho', [961]], ['rhov', [1009]], ['RightAngleBracket', [10217]], ['RightArrowBar', [8677]], ['rightarrow', [8594]], ['RightArrow', [8594]], ['Rightarrow', [8658]], ['RightArrowLeftArrow', [8644]], ['rightarrowtail', [8611]], ['RightCeiling', [8969]], ['RightDoubleBracket', [10215]], ['RightDownTeeVector', [10589]], ['RightDownVectorBar', [10581]], ['RightDownVector', [8642]], ['RightFloor', [8971]], ['rightharpoondown', [8641]], ['rightharpoonup', [8640]], ['rightleftarrows', [8644]], ['rightleftharpoons', [8652]], ['rightrightarrows', [8649]], ['rightsquigarrow', [8605]], ['RightTeeArrow', [8614]], ['RightTee', [8866]], ['RightTeeVector', [10587]], ['rightthreetimes', [8908]], ['RightTriangleBar', [10704]], ['RightTriangle', [8883]], ['RightTriangleEqual', [8885]], ['RightUpDownVector', [10575]], ['RightUpTeeVector', [10588]], ['RightUpVectorBar', [10580]], ['RightUpVector', [8638]], ['RightVectorBar', [10579]], ['RightVector', [8640]], ['ring', [730]], ['risingdotseq', [8787]], ['rlarr', [8644]], ['rlhar', [8652]], ['rlm', [8207]], ['rmoustache', [9137]], ['rmoust', [9137]], ['rnmid', [10990]], ['roang', [10221]], ['roarr', [8702]], ['robrk', [10215]], ['ropar', [10630]], ['ropf', [120163]], ['Ropf', [8477]], ['roplus', [10798]], ['rotimes', [10805]], ['RoundImplies', [10608]], ['rpar', [41]], ['rpargt', [10644]], ['rppolint', [10770]], ['rrarr', [8649]], ['Rrightarrow', [8667]], ['rsaquo', [8250]], ['rscr', [120007]], ['Rscr', [8475]], ['rsh', [8625]], ['Rsh', [8625]], ['rsqb', [93]], ['rsquo', [8217]], ['rsquor', [8217]], ['rthree', [8908]], ['rtimes', [8906]], ['rtri', [9657]], ['rtrie', [8885]], ['rtrif', [9656]], ['rtriltri', [10702]], ['RuleDelayed', [10740]], ['ruluhar', [10600]], ['rx', [8478]], ['Sacute', [346]], ['sacute', [347]], ['sbquo', [8218]], ['scap', [10936]], ['Scaron', [352]], ['scaron', [353]], ['Sc', [10940]], ['sc', [8827]], ['sccue', [8829]], ['sce', [10928]], ['scE', [10932]], ['Scedil', [350]], ['scedil', [351]], ['Scirc', [348]], ['scirc', [349]], ['scnap', [10938]], ['scnE', [10934]], ['scnsim', [8937]], ['scpolint', [10771]], ['scsim', [8831]], ['Scy', [1057]], ['scy', [1089]], ['sdotb', [8865]], ['sdot', [8901]], ['sdote', [10854]], ['searhk', [10533]], ['searr', [8600]], ['seArr', [8664]], ['searrow', [8600]], ['sect', [167]], ['semi', [59]], ['seswar', [10537]], ['setminus', [8726]], ['setmn', [8726]], ['sext', [10038]], ['Sfr', [120086]], ['sfr', [120112]], ['sfrown', [8994]], ['sharp', [9839]], ['SHCHcy', [1065]], ['shchcy', [1097]], ['SHcy', [1064]], ['shcy', [1096]], ['ShortDownArrow', [8595]], ['ShortLeftArrow', [8592]], ['shortmid', [8739]], ['shortparallel', [8741]], ['ShortRightArrow', [8594]], ['ShortUpArrow', [8593]], ['shy', [173]], ['Sigma', [931]], ['sigma', [963]], ['sigmaf', [962]], ['sigmav', [962]], ['sim', [8764]], ['simdot', [10858]], ['sime', [8771]], ['simeq', [8771]], ['simg', [10910]], ['simgE', [10912]], ['siml', [10909]], ['simlE', [10911]], ['simne', [8774]], ['simplus', [10788]], ['simrarr', [10610]], ['slarr', [8592]], ['SmallCircle', [8728]], ['smallsetminus', [8726]], ['smashp', [10803]], ['smeparsl', [10724]], ['smid', [8739]], ['smile', [8995]], ['smt', [10922]], ['smte', [10924]], ['smtes', [10924, 65024]], ['SOFTcy', [1068]], ['softcy', [1100]], ['solbar', [9023]], ['solb', [10692]], ['sol', [47]], ['Sopf', [120138]], ['sopf', [120164]], ['spades', [9824]], ['spadesuit', [9824]], ['spar', [8741]], ['sqcap', [8851]], ['sqcaps', [8851, 65024]], ['sqcup', [8852]], ['sqcups', [8852, 65024]], ['Sqrt', [8730]], ['sqsub', [8847]], ['sqsube', [8849]], ['sqsubset', [8847]], ['sqsubseteq', [8849]], ['sqsup', [8848]], ['sqsupe', [8850]], ['sqsupset', [8848]], ['sqsupseteq', [8850]], ['square', [9633]], ['Square', [9633]], ['SquareIntersection', [8851]], ['SquareSubset', [8847]], ['SquareSubsetEqual', [8849]], ['SquareSuperset', [8848]], ['SquareSupersetEqual', [8850]], ['SquareUnion', [8852]], ['squarf', [9642]], ['squ', [9633]], ['squf', [9642]], ['srarr', [8594]], ['Sscr', [119982]], ['sscr', [120008]], ['ssetmn', [8726]], ['ssmile', [8995]], ['sstarf', [8902]], ['Star', [8902]], ['star', [9734]], ['starf', [9733]], ['straightepsilon', [1013]], ['straightphi', [981]], ['strns', [175]], ['sub', [8834]], ['Sub', [8912]], ['subdot', [10941]], ['subE', [10949]], ['sube', [8838]], ['subedot', [10947]], ['submult', [10945]], ['subnE', [10955]], ['subne', [8842]], ['subplus', [10943]], ['subrarr', [10617]], ['subset', [8834]], ['Subset', [8912]], ['subseteq', [8838]], ['subseteqq', [10949]], ['SubsetEqual', [8838]], ['subsetneq', [8842]], ['subsetneqq', [10955]], ['subsim', [10951]], ['subsub', [10965]], ['subsup', [10963]], ['succapprox', [10936]], ['succ', [8827]], ['succcurlyeq', [8829]], ['Succeeds', [8827]], ['SucceedsEqual', [10928]], ['SucceedsSlantEqual', [8829]], ['SucceedsTilde', [8831]], ['succeq', [10928]], ['succnapprox', [10938]], ['succneqq', [10934]], ['succnsim', [8937]], ['succsim', [8831]], ['SuchThat', [8715]], ['sum', [8721]], ['Sum', [8721]], ['sung', [9834]], ['sup1', [185]], ['sup2', [178]], ['sup3', [179]], ['sup', [8835]], ['Sup', [8913]], ['supdot', [10942]], ['supdsub', [10968]], ['supE', [10950]], ['supe', [8839]], ['supedot', [10948]], ['Superset', [8835]], ['SupersetEqual', [8839]], ['suphsol', [10185]], ['suphsub', [10967]], ['suplarr', [10619]], ['supmult', [10946]], ['supnE', [10956]], ['supne', [8843]], ['supplus', [10944]], ['supset', [8835]], ['Supset', [8913]], ['supseteq', [8839]], ['supseteqq', [10950]], ['supsetneq', [8843]], ['supsetneqq', [10956]], ['supsim', [10952]], ['supsub', [10964]], ['supsup', [10966]], ['swarhk', [10534]], ['swarr', [8601]], ['swArr', [8665]], ['swarrow', [8601]], ['swnwar', [10538]], ['szlig', [223]], ['Tab', [9]], ['target', [8982]], ['Tau', [932]], ['tau', [964]], ['tbrk', [9140]], ['Tcaron', [356]], ['tcaron', [357]], ['Tcedil', [354]], ['tcedil', [355]], ['Tcy', [1058]], ['tcy', [1090]], ['tdot', [8411]], ['telrec', [8981]], ['Tfr', [120087]], ['tfr', [120113]], ['there4', [8756]], ['therefore', [8756]], ['Therefore', [8756]], ['Theta', [920]], ['theta', [952]], ['thetasym', [977]], ['thetav', [977]], ['thickapprox', [8776]], ['thicksim', [8764]], ['ThickSpace', [8287, 8202]], ['ThinSpace', [8201]], ['thinsp', [8201]], ['thkap', [8776]], ['thksim', [8764]], ['THORN', [222]], ['thorn', [254]], ['tilde', [732]], ['Tilde', [8764]], ['TildeEqual', [8771]], ['TildeFullEqual', [8773]], ['TildeTilde', [8776]], ['timesbar', [10801]], ['timesb', [8864]], ['times', [215]], ['timesd', [10800]], ['tint', [8749]], ['toea', [10536]], ['topbot', [9014]], ['topcir', [10993]], ['top', [8868]], ['Topf', [120139]], ['topf', [120165]], ['topfork', [10970]], ['tosa', [10537]], ['tprime', [8244]], ['trade', [8482]], ['TRADE', [8482]], ['triangle', [9653]], ['triangledown', [9663]], ['triangleleft', [9667]], ['trianglelefteq', [8884]], ['triangleq', [8796]], ['triangleright', [9657]], ['trianglerighteq', [8885]], ['tridot', [9708]], ['trie', [8796]], ['triminus', [10810]], ['TripleDot', [8411]], ['triplus', [10809]], ['trisb', [10701]], ['tritime', [10811]], ['trpezium', [9186]], ['Tscr', [119983]], ['tscr', [120009]], ['TScy', [1062]], ['tscy', [1094]], ['TSHcy', [1035]], ['tshcy', [1115]], ['Tstrok', [358]], ['tstrok', [359]], ['twixt', [8812]], ['twoheadleftarrow', [8606]], ['twoheadrightarrow', [8608]], ['Uacute', [218]], ['uacute', [250]], ['uarr', [8593]], ['Uarr', [8607]], ['uArr', [8657]], ['Uarrocir', [10569]], ['Ubrcy', [1038]], ['ubrcy', [1118]], ['Ubreve', [364]], ['ubreve', [365]], ['Ucirc', [219]], ['ucirc', [251]], ['Ucy', [1059]], ['ucy', [1091]], ['udarr', [8645]], ['Udblac', [368]], ['udblac', [369]], ['udhar', [10606]], ['ufisht', [10622]], ['Ufr', [120088]], ['ufr', [120114]], ['Ugrave', [217]], ['ugrave', [249]], ['uHar', [10595]], ['uharl', [8639]], ['uharr', [8638]], ['uhblk', [9600]], ['ulcorn', [8988]], ['ulcorner', [8988]], ['ulcrop', [8975]], ['ultri', [9720]], ['Umacr', [362]], ['umacr', [363]], ['uml', [168]], ['UnderBar', [95]], ['UnderBrace', [9183]], ['UnderBracket', [9141]], ['UnderParenthesis', [9181]], ['Union', [8899]], ['UnionPlus', [8846]], ['Uogon', [370]], ['uogon', [371]], ['Uopf', [120140]], ['uopf', [120166]], ['UpArrowBar', [10514]], ['uparrow', [8593]], ['UpArrow', [8593]], ['Uparrow', [8657]], ['UpArrowDownArrow', [8645]], ['updownarrow', [8597]], ['UpDownArrow', [8597]], ['Updownarrow', [8661]], ['UpEquilibrium', [10606]], ['upharpoonleft', [8639]], ['upharpoonright', [8638]], ['uplus', [8846]], ['UpperLeftArrow', [8598]], ['UpperRightArrow', [8599]], ['upsi', [965]], ['Upsi', [978]], ['upsih', [978]], ['Upsilon', [933]], ['upsilon', [965]], ['UpTeeArrow', [8613]], ['UpTee', [8869]], ['upuparrows', [8648]], ['urcorn', [8989]], ['urcorner', [8989]], ['urcrop', [8974]], ['Uring', [366]], ['uring', [367]], ['urtri', [9721]], ['Uscr', [119984]], ['uscr', [120010]], ['utdot', [8944]], ['Utilde', [360]], ['utilde', [361]], ['utri', [9653]], ['utrif', [9652]], ['uuarr', [8648]], ['Uuml', [220]], ['uuml', [252]], ['uwangle', [10663]], ['vangrt', [10652]], ['varepsilon', [1013]], ['varkappa', [1008]], ['varnothing', [8709]], ['varphi', [981]], ['varpi', [982]], ['varpropto', [8733]], ['varr', [8597]], ['vArr', [8661]], ['varrho', [1009]], ['varsigma', [962]], ['varsubsetneq', [8842, 65024]], ['varsubsetneqq', [10955, 65024]], ['varsupsetneq', [8843, 65024]], ['varsupsetneqq', [10956, 65024]], ['vartheta', [977]], ['vartriangleleft', [8882]], ['vartriangleright', [8883]], ['vBar', [10984]], ['Vbar', [10987]], ['vBarv', [10985]], ['Vcy', [1042]], ['vcy', [1074]], ['vdash', [8866]], ['vDash', [8872]], ['Vdash', [8873]], ['VDash', [8875]], ['Vdashl', [10982]], ['veebar', [8891]], ['vee', [8744]], ['Vee', [8897]], ['veeeq', [8794]], ['vellip', [8942]], ['verbar', [124]], ['Verbar', [8214]], ['vert', [124]], ['Vert', [8214]], ['VerticalBar', [8739]], ['VerticalLine', [124]], ['VerticalSeparator', [10072]], ['VerticalTilde', [8768]], ['VeryThinSpace', [8202]], ['Vfr', [120089]], ['vfr', [120115]], ['vltri', [8882]], ['vnsub', [8834, 8402]], ['vnsup', [8835, 8402]], ['Vopf', [120141]], ['vopf', [120167]], ['vprop', [8733]], ['vrtri', [8883]], ['Vscr', [119985]], ['vscr', [120011]], ['vsubnE', [10955, 65024]], ['vsubne', [8842, 65024]], ['vsupnE', [10956, 65024]], ['vsupne', [8843, 65024]], ['Vvdash', [8874]], ['vzigzag', [10650]], ['Wcirc', [372]], ['wcirc', [373]], ['wedbar', [10847]], ['wedge', [8743]], ['Wedge', [8896]], ['wedgeq', [8793]], ['weierp', [8472]], ['Wfr', [120090]], ['wfr', [120116]], ['Wopf', [120142]], ['wopf', [120168]], ['wp', [8472]], ['wr', [8768]], ['wreath', [8768]], ['Wscr', [119986]], ['wscr', [120012]], ['xcap', [8898]], ['xcirc', [9711]], ['xcup', [8899]], ['xdtri', [9661]], ['Xfr', [120091]], ['xfr', [120117]], ['xharr', [10231]], ['xhArr', [10234]], ['Xi', [926]], ['xi', [958]], ['xlarr', [10229]], ['xlArr', [10232]], ['xmap', [10236]], ['xnis', [8955]], ['xodot', [10752]], ['Xopf', [120143]], ['xopf', [120169]], ['xoplus', [10753]], ['xotime', [10754]], ['xrarr', [10230]], ['xrArr', [10233]], ['Xscr', [119987]], ['xscr', [120013]], ['xsqcup', [10758]], ['xuplus', [10756]], ['xutri', [9651]], ['xvee', [8897]], ['xwedge', [8896]], ['Yacute', [221]], ['yacute', [253]], ['YAcy', [1071]], ['yacy', [1103]], ['Ycirc', [374]], ['ycirc', [375]], ['Ycy', [1067]], ['ycy', [1099]], ['yen', [165]], ['Yfr', [120092]], ['yfr', [120118]], ['YIcy', [1031]], ['yicy', [1111]], ['Yopf', [120144]], ['yopf', [120170]], ['Yscr', [119988]], ['yscr', [120014]], ['YUcy', [1070]], ['yucy', [1102]], ['yuml', [255]], ['Yuml', [376]], ['Zacute', [377]], ['zacute', [378]], ['Zcaron', [381]], ['zcaron', [382]], ['Zcy', [1047]], ['zcy', [1079]], ['Zdot', [379]], ['zdot', [380]], ['zeetrf', [8488]], ['ZeroWidthSpace', [8203]], ['Zeta', [918]], ['zeta', [950]], ['zfr', [120119]], ['Zfr', [8488]], ['ZHcy', [1046]], ['zhcy', [1078]], ['zigrarr', [8669]], ['zopf', [120171]], ['Zopf', [8484]], ['Zscr', [119989]], ['zscr', [120015]], ['zwj', [8205]], ['zwnj', [8204]]];

var alphaIndex = {};
var charIndex = {};

createIndexes(alphaIndex, charIndex);

/**
 * @constructor
 */
function Html5Entities() {}

/**
 * @param {String} str
 * @returns {String}
 */
Html5Entities.prototype.decode = function(str) {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/&(#?[\w\d]+);?/g, function(s, entity) {
        var chr;
        if (entity.charAt(0) === "#") {
            var code = entity.charAt(1) === 'x' ?
                parseInt(entity.substr(2).toLowerCase(), 16) :
                parseInt(entity.substr(1));

            if (!(isNaN(code) || code < -32768 || code > 65535)) {
                chr = String.fromCharCode(code);
            }
        } else {
            chr = alphaIndex[entity];
        }
        return chr || s;
    });
};

/**
 * @param {String} str
 * @returns {String}
 */
 Html5Entities.decode = function(str) {
    return new Html5Entities().decode(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
Html5Entities.prototype.encode = function(str) {
    var strLength = str.length;
    if (strLength === 0) {
        return '';
    }
    var result = '';
    var i = 0;
    while (i < strLength) {
        var charInfo = charIndex[str.charCodeAt(i)];
        if (charInfo) {
            var alpha = charInfo[str.charCodeAt(i + 1)];
            if (alpha) {
                i++;
            } else {
                alpha = charInfo[''];
            }
            if (alpha) {
                result += "&" + alpha + ";";
                i++;
                continue;
            }
        }
        result += str.charAt(i);
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
 Html5Entities.encode = function(str) {
    return new Html5Entities().encode(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
Html5Entities.prototype.encodeNonUTF = function(str) {
    var strLength = str.length;
    if (strLength === 0) {
        return '';
    }
    var result = '';
    var i = 0;
    while (i < strLength) {
        var c = str.charCodeAt(i);
        var charInfo = charIndex[c];
        if (charInfo) {
            var alpha = charInfo[str.charCodeAt(i + 1)];
            if (alpha) {
                i++;
            } else {
                alpha = charInfo[''];
            }
            if (alpha) {
                result += "&" + alpha + ";";
                i++;
                continue;
            }
        }
        if (c < 32 || c > 126) {
            result += '&#' + c + ';';
        } else {
            result += str.charAt(i);
        }
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
 Html5Entities.encodeNonUTF = function(str) {
    return new Html5Entities().encodeNonUTF(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
Html5Entities.prototype.encodeNonASCII = function(str) {
    var strLength = str.length;
    if (strLength === 0) {
        return '';
    }
    var result = '';
    var i = 0;
    while (i < strLength) {
        var c = str.charCodeAt(i);
        if (c <= 255) {
            result += str[i++];
            continue;
        }
        result += '&#' + c + ';';
        i++
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
 Html5Entities.encodeNonASCII = function(str) {
    return new Html5Entities().encodeNonASCII(str);
 };

/**
 * @param {Object} alphaIndex Passed by reference.
 * @param {Object} charIndex Passed by reference.
 */
function createIndexes(alphaIndex, charIndex) {
    var i = ENTITIES.length;
    var _results = [];
    while (i--) {
        var e = ENTITIES[i];
        var alpha = e[0];
        var chars = e[1];
        var chr = chars[0];
        var addChar = (chr < 32 || chr > 126) || chr === 62 || chr === 60 || chr === 38 || chr === 34 || chr === 39;
        var charInfo;
        if (addChar) {
            charInfo = charIndex[chr] = charIndex[chr] || {};
        }
        if (chars[1]) {
            var chr2 = chars[1];
            alphaIndex[alpha] = String.fromCharCode(chr) + String.fromCharCode(chr2);
            _results.push(addChar && (charInfo[chr2] = alpha));
        } else {
            alphaIndex[alpha] = String.fromCharCode(chr);
            _results.push(addChar && (charInfo[''] = alpha));
        }
    }
}

module.exports = Html5Entities;

},{}],122:[function(require,module,exports){
var ALPHA_INDEX = {
    '&lt': '<',
    '&gt': '>',
    '&quot': '"',
    '&apos': '\'',
    '&amp': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': '\'',
    '&amp;': '&'
};

var CHAR_INDEX = {
    60: 'lt',
    62: 'gt',
    34: 'quot',
    39: 'apos',
    38: 'amp'
};

var CHAR_S_INDEX = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&apos;',
    '&': '&amp;'
};

/**
 * @constructor
 */
function XmlEntities() {}

/**
 * @param {String} str
 * @returns {String}
 */
XmlEntities.prototype.encode = function(str) {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/<|>|"|'|&/g, function(s) {
        return CHAR_S_INDEX[s];
    });
};

/**
 * @param {String} str
 * @returns {String}
 */
 XmlEntities.encode = function(str) {
    return new XmlEntities().encode(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
XmlEntities.prototype.decode = function(str) {
    if (str.length === 0) {
        return '';
    }
    return str.replace(/&#?[0-9a-zA-Z]+;?/g, function(s) {
        if (s.charAt(1) === '#') {
            var code = s.charAt(2).toLowerCase() === 'x' ?
                parseInt(s.substr(3), 16) :
                parseInt(s.substr(2));

            if (isNaN(code) || code < -32768 || code > 65535) {
                return '';
            }
            return String.fromCharCode(code);
        }
        return ALPHA_INDEX[s] || s;
    });
};

/**
 * @param {String} str
 * @returns {String}
 */
 XmlEntities.decode = function(str) {
    return new XmlEntities().decode(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
XmlEntities.prototype.encodeNonUTF = function(str) {
    var strLength = str.length;
    if (strLength === 0) {
        return '';
    }
    var result = '';
    var i = 0;
    while (i < strLength) {
        var c = str.charCodeAt(i);
        var alpha = CHAR_INDEX[c];
        if (alpha) {
            result += "&" + alpha + ";";
            i++;
            continue;
        }
        if (c < 32 || c > 126) {
            result += '&#' + c + ';';
        } else {
            result += str.charAt(i);
        }
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
 XmlEntities.encodeNonUTF = function(str) {
    return new XmlEntities().encodeNonUTF(str);
 };

/**
 * @param {String} str
 * @returns {String}
 */
XmlEntities.prototype.encodeNonASCII = function(str) {
    var strLenght = str.length;
    if (strLenght === 0) {
        return '';
    }
    var result = '';
    var i = 0;
    while (i < strLenght) {
        var c = str.charCodeAt(i);
        if (c <= 255) {
            result += str[i++];
            continue;
        }
        result += '&#' + c + ';';
        i++;
    }
    return result;
};

/**
 * @param {String} str
 * @returns {String}
 */
 XmlEntities.encodeNonASCII = function(str) {
    return new XmlEntities().encodeNonASCII(str);
 };

module.exports = XmlEntities;

},{}],123:[function(require,module,exports){
/*jshint node:true*/
'use strict';

/**
 * Replaces characters in strings that are illegal/unsafe for filenames.
 * Unsafe characters are either removed or replaced by a substitute set
 * in the optional `options` object.
 *
 * Illegal Characters on Various Operating Systems
 * / ? < > \ : * | "
 * https://kb.acronis.com/content/39790
 *
 * Unicode Control codes
 * C0 0x00-0x1f & C1 (0x80-0x9f)
 * http://en.wikipedia.org/wiki/C0_and_C1_control_codes
 *
 * Reserved filenames on Unix-based systems (".", "..")
 * Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
 * "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
 * "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
 * "LPT9") case-insesitively and with or without filename extensions.
 *
 * Capped at 255 characters in length.
 * http://unix.stackexchange.com/questions/32795/what-is-the-maximum-allowed-filename-and-folder-size-with-ecryptfs
 *
 * @param  {String} input   Original filename
 * @param  {Object} options {replacement: String}
 * @return {String}         Sanitized filename
 */

var truncate = require("truncate-utf8-bytes");

var illegalRe = /[\/\?<>\\:\*\|":]/g;
var controlRe = /[\x00-\x1f\x80-\x9f]/g;
var reservedRe = /^\.+$/;
var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
var windowsTrailingRe = /[\. ]+$/;

function sanitize(input, replacement) {
  var sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
  return truncate(sanitized, 255);
}

module.exports = function (input, options) {
  var replacement = (options && options.replacement) || '';
  var output = sanitize(input, replacement);
  if (replacement === '') {
    return output;
  }
  return sanitize(output, '');
};

},{"truncate-utf8-bytes":129}],124:[function(require,module,exports){

var space = require('to-space-case')

/**
 * Export.
 */

module.exports = toCamelCase

/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */

function toCamelCase(string) {
  return space(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase()
  })
}

},{"to-space-case":126}],125:[function(require,module,exports){

/**
 * Export.
 */

module.exports = toNoCase

/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/
var hasSeparator = /(_|-|\.|:)/
var hasCamel = /([a-z][A-Z]|[A-Z][a-z])/

/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase(string) {
  if (hasSpace.test(string)) return string.toLowerCase()
  if (hasSeparator.test(string)) return (unseparate(string) || string).toLowerCase()
  if (hasCamel.test(string)) return uncamelize(string).toLowerCase()
  return string.toLowerCase()
}

/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g

/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate(string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : ''
  })
}

/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g

/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize(string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ')
  })
}

},{}],126:[function(require,module,exports){

var clean = require('to-no-case')

/**
 * Export.
 */

module.exports = toSpaceCase

/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */

function toSpaceCase(string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : ''
  }).trim()
}

},{"to-no-case":125}],127:[function(require,module,exports){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
},{}],128:[function(require,module,exports){

var clean = require('to-no-case');


/**
 * Expose `toSpaceCase`.
 */

module.exports = toSpaceCase;


/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */


function toSpaceCase (string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : '';
  });
}
},{"to-no-case":127}],129:[function(require,module,exports){
'use strict';

var truncate = require("./lib/truncate");
var getLength = require("utf8-byte-length/browser");
module.exports = truncate.bind(null, getLength);

},{"./lib/truncate":130,"utf8-byte-length/browser":131}],130:[function(require,module,exports){
'use strict';

function isHighSurrogate(codePoint) {
  return codePoint >= 0xd800 && codePoint <= 0xdbff;
}

function isLowSurrogate(codePoint) {
  return codePoint >= 0xdc00 && codePoint <= 0xdfff;
}

// Truncate string by size in bytes
module.exports = function truncate(getLength, string, byteLength) {
  if (typeof string !== "string") {
    throw new Error("Input must be string");
  }

  var charLength = string.length;
  var curByteLength = 0;
  var codePoint;
  var segment;

  for (var i = 0; i < charLength; i += 1) {
    codePoint = string.charCodeAt(i);
    segment = string[i];

    if (isHighSurrogate(codePoint) && isLowSurrogate(string.charCodeAt(i + 1))) {
      i += 1;
      segment += string[i];
    }

    curByteLength += getLength(segment);

    if (curByteLength === byteLength) {
      return string.slice(0, i + 1);
    }
    else if (curByteLength > byteLength) {
      return string.slice(0, i - segment.length + 1);
    }
  }

  return string;
};


},{}],131:[function(require,module,exports){
'use strict';

function isHighSurrogate(codePoint) {
  return codePoint >= 0xd800 && codePoint <= 0xdbff;
}

function isLowSurrogate(codePoint) {
  return codePoint >= 0xdc00 && codePoint <= 0xdfff;
}

// Truncate string by size in bytes
module.exports = function getByteLength(string) {
  if (typeof string !== "string") {
    throw new Error("Input must be string");
  }

  var charLength = string.length;
  var byteLength = 0;
  var codePoint = null;
  var prevCodePoint = null;
  for (var i = 0; i < charLength; i++) {
    codePoint = string.charCodeAt(i);
    // handle 4-byte non-BMP chars
    // low surrogate
    if (isLowSurrogate(codePoint)) {
      // when parsing previous hi-surrogate, 3 is added to byteLength
      if (prevCodePoint != null && isHighSurrogate(prevCodePoint)) {
        byteLength += 1;
      }
      else {
        byteLength += 3;
      }
    }
    else if (codePoint <= 0x7f ) {
      byteLength += 1;
    }
    else if (codePoint >= 0x80 && codePoint <= 0x7ff) {
      byteLength += 2;
    }
    else if (codePoint >= 0x800 && codePoint <= 0xffff) {
      byteLength += 3;
    }
    prevCodePoint = codePoint;
  }

  return byteLength;
};

},{}]},{},[1])(1)
});
