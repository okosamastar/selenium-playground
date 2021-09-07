var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var events;
(function (events) {
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this.listeners = {};
        }
        EventDispatcher.prototype.dispatchEvent = function (event) {
            var e;
            var type;
            if (event instanceof Event) {
                type = event.type;
                e = event;
            }
            else {
                type = event;
                e = new Event(type);
            }
            if (this.listeners[type] != null) {
                e.currentTarget = this;
                for (var i = 0; i < this.listeners[type].length; i++) {
                    var listener = this.listeners[type][i];
                    try {
                        listener.handler(e);
                    }
                    catch (error) {
                        if (window.console) {
                            console.error(error.stack);
                        }
                    }
                }
            }
        };
        EventDispatcher.prototype.addEventListener = function (type, callback, priolity) {
            if (priolity === void 0) { priolity = 0; }
            if (this.listeners[type] == null) {
                this.listeners[type] = [];
            }
            this.listeners[type].push(new EventListener(type, callback, priolity));
            this.listeners[type].sort(function (listener1, listener2) {
                return listener2.priolity - listener1.priolity;
            });
        };
        EventDispatcher.prototype.removeEventListener = function (type, callback) {
            if (this.hasEventListener(type, callback)) {
                for (var i = 0; i < this.listeners[type].length; i++) {
                    var listener = this.listeners[type][i];
                    if (listener.equalCurrentListener(type, callback)) {
                        listener.handler = null;
                        this.listeners[type].splice(i, 1);
                        return;
                    }
                }
            }
        };
        EventDispatcher.prototype.clearEventListener = function () {
            this.listeners = {};
        };
        EventDispatcher.prototype.containEventListener = function (type) {
            if (this.listeners[type] == null)
                return false;
            return this.listeners[type].length > 0;
        };
        EventDispatcher.prototype.hasEventListener = function (type, callback) {
            if (this.listeners[type] == null)
                return false;
            for (var i = 0; i < this.listeners[type].length; i++) {
                var listener = this.listeners[type][i];
                if (listener.equalCurrentListener(type, callback)) {
                    return true;
                }
            }
            return false;
        };
        return EventDispatcher;
    }());
    events.EventDispatcher = EventDispatcher;
    var EventListener = (function () {
        function EventListener(type, handler, priolity) {
            if (type === void 0) { type = null; }
            if (handler === void 0) { handler = null; }
            if (priolity === void 0) { priolity = 0; }
            this.type = type;
            this.handler = handler;
            this.priolity = priolity;
        }
        EventListener.prototype.equalCurrentListener = function (type, handler) {
            if (this.type == type && this.handler == handler) {
                return true;
            }
            return false;
        };
        return EventListener;
    }());
    var Event = (function () {
        function Event(type, value) {
            if (type === void 0) { type = null; }
            if (value === void 0) { value = null; }
            this.type = type;
            this.value = value;
        }
        return Event;
    }());
    Event.COMPLETE = "complete";
    Event.CHANGE_PROPERTY = "changeProperty";
    events.Event = Event;
})(events || (events = {}));
var ReadyCheckModule;
(function (ReadyCheckModule) {
    var PopReadyCheck = (function (_super) {
        __extends(PopReadyCheck, _super);
        function PopReadyCheck(chrome) {
            var _this = _super.call(this) || this;
            var this_ = _this;
            _this.setIntervalID = setInterval(function () {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
                    chrome.tabs.sendMessage(tab[0].id, {
                        contetState: "AreYouReady?"
                    }, function (response) {
                        if (response.contetState == "OkGo!") {
                            clearInterval(this_.setIntervalID);
                            this_.dispatchEvent(new events.Event("ready"));
                        }
                    });
                });
            }, 10);
            return _this;
        }
        return PopReadyCheck;
    }(events.EventDispatcher));
    ReadyCheckModule.PopReadyCheck = PopReadyCheck;
})(ReadyCheckModule || (ReadyCheckModule = {}));
var PopReadyCheck = ReadyCheckModule.PopReadyCheck;
var PopUp = (function () {
    function PopUp() {
        this.pop_ready_check = new PopReadyCheck(chrome);
        this.int = new Int();
        var this_ = this;
        this.standby = true;
        this.pop_ready_check.addEventListener("ready", function () {
            if (this_.standby) {
                this_.standby = false;
                $(document).ready(function () {
                    this_.int.int();
                });
            }
        });
    }
    return PopUp;
}());
var Int = (function () {
    function Int() {
    }
    Int.prototype.int = function () {
        $("#Loading").fadeOut(200);
        chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
            chrome.tabs.sendMessage(tab[0].id, {
                fromPopUp: "Open!"
            }, function (response) {
                if (response.ContentsShowAlt) {
                    $("#Switch_Alt").addClass("close");
                }
                else {
                    $("#Switch_Alt").removeClass("close");
                }
                if (response.ContentsShowMeta) {
                    $("#Switch_Title").addClass("close");
                }
                else {
                    $("#Switch_Title").removeClass("close");
                }
            });
        });
        $("#Switch_Alt .switchBtn__ttl").html(chrome.i18n.getMessage("PopUp_ShowAltBtn"));
        $("#Switch_Title .switchBtn__ttl").html(chrome.i18n.getMessage("PopUp_ShowMetaBtn"));
        $("#Loading .loadingBlock__txt").html(chrome.i18n.getMessage("PopUp_Loading"));
        $("#Switch_Alt").on("click", function () {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
                chrome.tabs.sendMessage(tab[0].id, {
                    fromPopUp: "Alt"
                }, function (response) {
                    if (response.ContentsShowAlt == true) {
                        $("#Switch_Alt").addClass("close");
                    }
                    else {
                        $("#Switch_Alt").removeClass("close");
                    }
                });
            });
        });
        $("#Switch_Title").on("click", function () {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
                chrome.tabs.sendMessage(tab[0].id, {
                    fromPopUp: "Meta"
                }, function (response) {
                    if (response.ContentsShowMeta == true) {
                        $("#Switch_Title").addClass("close");
                    }
                    else {
                        $("#Switch_Title").removeClass("close");
                    }
                });
            });
        });
    };
    return Int;
}());
this.PopUp();
