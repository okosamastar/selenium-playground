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
var MetaViewModule;
(function (MetaViewModule) {
    var MetaView = (function (_super) {
        __extends(MetaView, _super);
        function MetaView() {
            return _super.call(this) || this;
        }
        MetaView.prototype.show = function () {
            var this_ = this;
            this.dispatchEvent(new events.Event("show", true));
            $("html").addClass('TitleView_012345_show');
            this.ObjMetaViewWrapBlock = $("<div id='TitleView_012345' class='TitleView012345_Box'></div>");
            $("body").append(this.ObjMetaViewWrapBlock);
            this.ObjMetaViewBlock = $("<div class='TitleView012345_Objs'></div>");
            $(this.ObjMetaViewWrapBlock).append(this.ObjMetaViewBlock);
            this.ObjMetaViewContent = $("<div id='TitleView_Contents_012345' class='TitleView012345_Contents'></div>");
            this.ObjMetaViewBlock.append(this.ObjMetaViewContent);
            this.ObjMetaViewContent.append("<h3 class='TitleView012345_Contents__ttl'>Title: " + $("head title").text() + "</h3>");
            this.ObjMetaViewContent.append("<hr class='TitleView012345_Contents__hr'>");
            this.ObjMetaViewContent.append("<h3 class='TitleView012345_Contents__ttl'>Meta:</h3>");
            $("head meta").each(function () {
                var meta = "";
                var imgis = 0;
                var img = "";
                var imgpath = "";
                for (var j = 0; j < $(this).context.attributes.length; j++) {
                    var name = $(this).context.attributes[j].nodeName;
                    var val = $(this).context.attributes[j].nodeValue;
                    var _val = $(this).context.attributes[j].nodeValue;
                    if (0 <= val.indexOf("http")) {
                        _val = "<a class='TitleView012345_Contents__metas__a' href='" + val.toString() + "' target='_blank'>" + val.toString() + "</a>";
                    }
                    if (0 <= val.toLowerCase().indexOf("image")) {
                        imgis++;
                    }
                    if (0 <= val.toLowerCase().indexOf("http")) {
                        imgis++;
                        imgpath = val;
                    }
                    meta += name + ' = &quot;<span class="TitleView012345_Contents__metas__span">' + _val + '</span>&quot; ';
                    if (2 <= imgis) {
                        img = "<div class='TitleView012345_Contents__metas__img'><a class='TitleView012345_Contents__metas__a' href=" + imgpath + " target='_blank'><img src=" + imgpath + " width=150 ></a></div>";
                    }
                }
                ;
                if (2 <= imgis) {
                    meta += img;
                }
                this_.ObjMetaViewContent.append("<div class='TitleView012345_Contents__metas'>" + meta + "</div>");
            });
            this.ObjMetaViewBlock.prepend("<div id='TitleView_closebtn_head_012345' class='TitleView012345_HeadCloseBtn'><img src='" + chrome.runtime.getURL("images/close_w.svg") + "' width='45'></div>");
            this.ObjMetaViewBlock.append("<div id='TitleView_closebtn_012345' class='TitleView012345_CloseBtn'><img src='" + chrome.runtime.getURL("images/close_w.svg") + "' width='45'><div class='TitleView012345_CloseBtn_txt'> CLOSE</div></div>");
            var titleview_012345_time;
            this.ObjMetaViewWrapBlock.css({ "top": -this.ObjMetaViewWrapBlock.outerHeight() - 100 });
            this.ObjMetaViewWrapBlock.addClass("transition_mode");
            titleview_012345_time = setTimeout(function () {
                this_.ObjMetaViewWrapBlock.css({ "top": 0 }).one('webkitTransitionEnd', function () {
                    $(this).addClass("active");
                    $("#TitleView_closebtn_head_012345, #TitleView_closebtn_012345").addClass("active");
                });
                this_.fResizeTitleView();
            }, 200);
            $("#TitleView_closebtn_012345, #TitleView_closebtn_head_012345, html").on("click", function (e) {
                $("#TitleView_closebtn_head_012345, #TitleView_closebtn_012345").removeClass("active");
                this_.close();
            });
            this.ObjMetaViewWrapBlock.on("click", function (e) {
                e.stopPropagation();
            });
            var resizeTime = 0;
            $(window).on('resize.TitleView_012345', function (event) {
                if (resizeTime !== 0) {
                    clearTimeout(resizeTime);
                }
                resizeTime = setTimeout(function () {
                    this_.fResizeTitleView();
                }, 200);
            });
        };
        MetaView.prototype.fResizeTitleView = function () {
        };
        MetaView.prototype.close = function () {
            var this_ = this;
            if (this.ObjMetaViewWrapBlock.hasClass("active")) {
                this.dispatchEvent(new events.Event("show", false));
                this.ObjMetaViewWrapBlock.css({ top: -this.ObjMetaViewWrapBlock.height() - 20 }).one('webkitTransitionEnd', function () {
                    this_.ObjMetaViewWrapBlock.remove();
                    $(window).off('resize.TitleView_012345');
                    $("html").removeClass('TitleView_012345_show');
                });
            }
        };
        return MetaView;
    }(events.EventDispatcher));
    MetaViewModule.MetaView = MetaView;
})(MetaViewModule || (MetaViewModule = {}));
var AltViewModule;
(function (AltViewModule) {
    var AltView = (function (_super) {
        __extends(AltView, _super);
        function AltView() {
            var _this = _super.call(this) || this;
            _this.ObjAltViewBlock = {};
            _this.ObjAltViewContent = {};
            _this.AltTitleView_012345 = {};
            _this.checkbox = {};
            _this.alt_nashi = 0;
            _this.title_nashi = 0;
            _this.show = function () {
                var this_ = _this;
                _this.getOptions();
                _this.showMove();
            };
            _this.getOptions = function () {
                var this_ = _this;
                var defaults = {
                    alt_checkbox: true,
                    title_checkbox: false,
                    size_checkbox: true,
                    path_checkbox: false,
                    extension_checkbox: false,
                    console_checkbox: true,
                    noAltList_checkbox: true,
                    altFukidashiClose_checkbox: true
                };
                chrome.storage.sync.get(defaults, function (items) {
                    this_.checkbox = items;
                });
            };
            _this.showMove = function () {
                var this_ = _this;
                var checkbox = _this.checkbox;
                _this.dispatchEvent(new events.Event("show", true));
                _this.ObjAltViewBlock = null;
                _this.ObjAltViewBlock = $("<div id='AltView_012345'></div>");
                $("body").append(_this.ObjAltViewBlock);
                _this.ObjAltViewContent = null;
                _this.ObjAltViewContent = $("<div id='AltView_wrap'></div>");
                _this.ObjAltViewBlock.append(_this.ObjAltViewContent);
                _this.AltTitleView_012345.AltData = [];
                $("img").each(function (index, element) {
                    var obj = this_.getImgTagData(index, $(element));
                    this_.AltTitleView_012345.AltData.push(obj);
                });
                _this.noAltCount(_this.AltTitleView_012345.AltData);
                for (var i = 0; i < _this.AltTitleView_012345.AltData.length; i++) {
                    var TipData = "";
                    TipData += _this.addCloseBtn(_this.AltTitleView_012345.AltData[i]);
                    if (checkbox.alt_checkbox && checkbox.title_checkbox) {
                        TipData += _this.addAltTitle(_this.AltTitleView_012345.AltData[i], true, true);
                    }
                    else if (checkbox.alt_checkbox) {
                        TipData += _this.addAltTitle(_this.AltTitleView_012345.AltData[i], true, false);
                    }
                    else if (checkbox.title_checkbox) {
                        TipData += _this.addAltTitle(_this.AltTitleView_012345.AltData[i], false, true);
                    }
                    if (checkbox.size_checkbox) {
                        TipData += _this.addImgSize(_this.AltTitleView_012345.AltData[i]);
                        TipData += _this.addImgNaturalSize(_this.AltTitleView_012345.AltData[i]);
                    }
                    if (checkbox.path_checkbox) {
                        TipData += _this.addImgSrc(_this.AltTitleView_012345.AltData[i]);
                    }
                    if (checkbox.extension_checkbox) {
                    }
                    var tipObj = _this.addTooltip(_this.AltTitleView_012345.AltData[i], TipData);
                    if (checkbox.alt_checkbox || checkbox.title_checkbox || checkbox.size_checkbox || checkbox.path_checkbox || checkbox.extension_checkbox) {
                        $("#AltView_wrap").append(tipObj);
                    }
                }
                _this.fukidashiCSS();
                $("#AltView_wrap div.Tip").mouseover(function () {
                    var thisObj = $(this);
                    var id = thisObj.attr("data");
                    this_.AltTitleView_012345.AltData[id].img_path.addClass('AltView_012345_Tip_show');
                    thisObj.css("z-index", 99999);
                    $("#AltView_wrap div.Tip").not(thisObj).hide();
                    thisObj.show();
                });
                $("#AltView_wrap div.Tip").mouseout(function () {
                    var thisObj = $(this);
                    var id = thisObj.attr("data");
                    this_.AltTitleView_012345.AltData[id].img_path.removeClass('AltView_012345_Tip_show');
                    thisObj.css("z-index", 99998);
                    $("#AltView_wrap div.Tip").show();
                });
                $("#AltView_wrap div.Tip .closeBtn").on("click.Tip", function () {
                    var thisObj = $(this);
                    var id = thisObj.attr("data");
                    var imgObj = this_.AltTitleView_012345.AltData[id].img_path;
                    imgObj.removeClass('AltView_012345_Tip_show');
                    imgObj.removeAttr('alt_view_tip');
                    this_.ImageAction(imgObj, false);
                    $("#alt_view_tip_" + id).remove();
                    $(this).off("click.Tip");
                    $("#AltView_wrap div.Tip").show();
                });
                if (checkbox.console_checkbox) {
                    _this.noAltShowConsoleLog();
                    _this.noTitleShowConsoleLog();
                }
                _this.addNoAltList(checkbox.noAltList_checkbox, checkbox.alt_checkbox, checkbox.title_checkbox, checkbox.altFukidashiClose_checkbox);
                _this.fResizeTitleView();
            };
            var this_ = _this;
            _this.Alt_Fukidashi_txt = chrome.i18n.getMessage("Alt_Fukidashi_txt");
            _this.Alt_List_txt1 = chrome.i18n.getMessage("Alt_List_txt1");
            _this.Alt_List_txt2 = chrome.i18n.getMessage("Alt_List_txt2");
            _this.Alt_List_txt3 = chrome.i18n.getMessage("Alt_List_txt3");
            _this.Alt_List_txt4 = chrome.i18n.getMessage("Alt_List_txt4");
            _this.Alt_List_txt5 = chrome.i18n.getMessage("Alt_List_txt5");
            _this.Alt_List_txt6 = chrome.i18n.getMessage("Alt_List_txt6");
            _this.Alt_List_txt7 = chrome.i18n.getMessage("Alt_List_txt7");
            _this.getOptions();
            return _this;
        }
        AltView.prototype.addTooltip = function (data, tipData) {
            var Tip = $("<div id='alt_view_tip_" + data.id + "' class='Tip Tip-" + data.id + "' data='" + data.id + "'><div class='txt'>" + tipData + "</div></div>");
            if (data.width != data.width_natural && data.width_attr != data.width_natural) {
                Tip.find(".w").removeClass("set").addClass("noset");
            }
            if (data.height != data.height_natural && data.height_attr != data.height_natural) {
                Tip.find(".h").removeClass("set").addClass("noset");
            }
            if (!data.alt && !data.title) {
                Tip.addClass("no-set");
            }
            Tip.css({ "top": data.top, "left": data.left, "max-width": data.width < 200 ? 200 : data.width, "display": "none" });
            Tip.find(".fuki").css("margin-left", 10);
            data.fpath = Tip;
            return Tip;
        };
        AltView.prototype.addAltTitle = function (data, showAlt, showTitle) {
            var _tipData = "";
            if (showAlt && showTitle && data.alt == data.title && data.alt != null && data.title != null) {
                _tipData += "<div class='txt__line'><span class='txt__lineHead'>Alt,Title</span><div class='txt__lineBody'><span class='at'>" + data.alt + "</span></div></div>";
            }
            else {
                var altTxt = "";
                var altNoSet = "";
                if (showAlt) {
                    if (data.alt) {
                        altTxt = data.alt;
                        altNoSet = "";
                    }
                    else {
                        altTxt = this.Alt_Fukidashi_txt;
                        altNoSet = "noset";
                    }
                }
                var titleTxt = "";
                var titleNoSet = "";
                if (showTitle) {
                    if (data.title) {
                        titleTxt = data.title;
                        titleNoSet = "";
                    }
                    else {
                        titleTxt = this.Alt_Fukidashi_txt;
                        titleNoSet = "noset";
                    }
                }
                if (showAlt && showTitle && data.alt != data.title) {
                    altNoSet = "noset";
                    titleNoSet = "noset";
                }
                if (showAlt) {
                    _tipData += "<div class='txt__line'><span class='txt__lineHead'>Alt</span><div class='txt__lineBody'><span class='at " + altNoSet + "'>" + altTxt + "</span></div></div>";
                }
                if (showTitle) {
                    _tipData += "<div class='txt__line'><span class='txt__lineHead'>Title</span><div class='txt__lineBody'><span class='at " + titleNoSet + "'>" + titleTxt + "</span></div></div>";
                }
            }
            return _tipData;
        };
        AltView.prototype.addCloseBtn = function (data) {
            return '<div class="closeBtn" data="' + data.id + '"><img src="' + chrome.runtime.getURL("images/close.svg") + '" alt="CloseBtn" width="8"></div>';
        };
        AltView.prototype.addImgSize = function (data) {
            var _tipData = "<div class='txt__line'>" + "<span class='txt__lineHead'>ImgSize</span><div class='txt__lineBody'>";
            if (data.width_attr && data.height_attr) {
                _tipData += "<span class='at w'>" + data.width_attr + "</span><span class='x'>x</span><span class='at h'>" + data.height_attr + "</span><span class='px'>px</span>";
            }
            else {
                if (!data.width_attr && !data.height_attr) {
                    _tipData += "<span class='at noset'>" + this.Alt_Fukidashi_txt + "</span>";
                }
                else {
                    if (data.width_attr) {
                        _tipData += "<span class='at w'>" + data.width_attr + "</span><span class='x'>x</span>";
                    }
                    else {
                        _tipData += "<span class='at noset'>" + this.Alt_Fukidashi_txt + "</span><span class='x'>x</span>";
                    }
                    if (data.height_attr) {
                        _tipData += "<span class='at h'>" + data.height_attr + "</span><span class='px'>px</span>";
                    }
                    else {
                        _tipData += "<span class='at noset'>" + this.Alt_Fukidashi_txt + "</span>";
                    }
                }
            }
            _tipData += "</div></div>";
            return _tipData;
        };
        AltView.prototype.addImgNaturalSize = function (data) {
            var _tipData = "<div class='txt__line'>" + "<span class='txt__lineHead'>Natural</span><div class='txt__lineBody'>";
            if (data.width != data.width_natural || data.height != data.height_natural || (!data.width_attr && !data.height_attr)) {
                _tipData += "<span class='set'>" + data.width_natural + "</span><span class='x'>x</span><span class='set'>" + data.height_natural + "</span><span class='px'>px</span></div></div>";
                return _tipData;
            }
            else {
                return "";
            }
        };
        AltView.prototype.addImgSrc = function (data) {
            var _tipData = "<div class='txt__line'>" + "<span class='txt__lineHead'>Src</span><div class='txt__lineBody'>";
            _tipData += "<a href='" + data.src + "' target='_blank'>" + data.src + "</a></span></div></div>";
            return _tipData;
        };
        AltView.prototype.addImgExtension = function (data) {
            var _tipData = "<div class='txt__line'>" + "<span class='txt__lineHead'>Extension</span><div class='txt__lineBody'>";
            if (data.extension) {
                _tipData += "<span class='exten'>" + data.extension + "</span></div></div>";
            }
            else {
                _tipData += "<span class='noset'> ? </span></div></div>";
            }
            return _tipData;
        };
        AltView.prototype.noAltCount = function (data) {
            var _alt_nashi = 0;
            var _title_nashi = 0;
            for (var i = 0; i < data.length; i++) {
                if (!data[i].alt) {
                    _alt_nashi++;
                }
                if (!data[i].title) {
                    _title_nashi++;
                }
            }
            this.alt_nashi = _alt_nashi;
            this.title_nashi = _title_nashi;
        };
        AltView.prototype.noAltShowConsoleLog = function () {
            console.log("%cAlt & Meta viewer", 'padding:0.3em 1em; background: #f87a00; color:white; font-size: 11px;');
            console.log("Alt なし : %c" + this.alt_nashi + "%c 個", 'font-size: 10px; font-weight: bold;', '');
        };
        AltView.prototype.noTitleShowConsoleLog = function () {
            console.log("Title なし : %c" + this.title_nashi + "%c 個", 'font-size: 10px; font-weight: bold;', '');
        };
        AltView.prototype.addNoAltList = function (altlistbtn, alt_show, title_show, closebtn) {
            var this_ = this;
            var noCountVal = 0;
            var ulObj = $("<ul class='altViewNoAltUlBlock'></ul>");
            for (var i = 0; i < this.AltTitleView_012345.AltData.length; i++) {
                var listObj;
                if (alt_show && !title_show) {
                    if (!this.AltTitleView_012345.AltData[i].alt) {
                        listObj = this.addNoAltListObj(this.AltTitleView_012345.AltData[i]);
                        noCountVal++;
                    }
                }
                else if (title_show && !alt_show) {
                    if (!this.AltTitleView_012345.AltData[i].title) {
                        listObj = this.addNoAltListObj(this.AltTitleView_012345.AltData[i]);
                        noCountVal++;
                    }
                }
                else if (alt_show && title_show) {
                    if (!this.AltTitleView_012345.AltData[i].alt || !this.AltTitleView_012345.AltData[i].title) {
                        listObj = this.addNoAltListObj(this.AltTitleView_012345.AltData[i]);
                        noCountVal++;
                    }
                }
                ulObj.append(listObj);
            }
            var ListTabTxt = "";
            var ListTabOrder = this.Alt_List_txt1;
            if (0 < noCountVal) {
                if (alt_show && !title_show) {
                    ListTabTxt = this.Alt_List_txt2;
                }
                else if (title_show && !alt_show) {
                    ListTabTxt = this.Alt_List_txt3;
                }
                else if (alt_show && title_show) {
                    ListTabTxt = this.Alt_List_txt4;
                }
            }
            else {
                if (alt_show && !title_show) {
                    ListTabTxt = this.Alt_List_txt5;
                }
                else if (title_show && !alt_show) {
                    ListTabTxt = this.Alt_List_txt6;
                }
                else if (alt_show && title_show) {
                    ListTabTxt = this.Alt_List_txt7;
                }
            }
            if (0 < noCountVal) {
                $("html").prepend("<div id='AltView_NoAlt_Wrap' class='load'>" +
                    "<div id='AltView_NoAlt_Result_Wrap'></div>" +
                    "<a href='#' id='AltView_NoAlt_head_closeAltBtn'>" +
                    "<img src='" + chrome.runtime.getURL("images/close_w.svg") + "' alt='CloseBtn' width='35'>" +
                    "</a>" +
                    "<a href='#' class='altViewNoAltHeadCloseBtn'>" +
                    "<img class='arrow' src='" + chrome.runtime.getURL("images/arrow.svg") + "' alt='' width='35'>" +
                    "<p class='altViewNoAltHeadCloseBtn__txt'>" + ListTabTxt + "<span>" + noCountVal + "</span>" + ListTabOrder + "</p></a>" +
                    "</div>");
                $(".altViewNoAltHeadCloseBtn").on("click", function (e) {
                    e.preventDefault();
                    $("#AltView_NoAlt_Wrap").toggleClass("active");
                });
                $("body").on("click", function (e) {
                    $("#AltView_NoAlt_Wrap").removeClass("active");
                });
            }
            else {
                $("html").prepend("<div id='AltView_NoAlt_Wrap' class='load'>" +
                    "<div id='AltView_NoAlt_Result_Wrap'></div>" +
                    "<a href='#' id='AltView_NoAlt_head_closeAltBtn'>" +
                    "<img src='" + chrome.runtime.getURL("images/close_w.svg") + "' alt='CloseBtn' width='35'>" +
                    "</a>" +
                    "<a href='#' class='altViewNoAltHeadCloseBtn altViewNoAltHeadCloseBtn-perfect'>" +
                    "<p class='altViewNoAltHeadCloseBtn__txt'>" + ListTabTxt + "</p></a>" +
                    "</div>");
                $(".altViewNoAltHeadCloseBtn").on("click", function (e) {
                    e.preventDefault();
                    $(this).css("margin-top", -50);
                });
            }
            $("#AltView_NoAlt_Result_Wrap").append(ulObj);
            setTimeout(function () { $("#AltView_NoAlt_Wrap").removeClass("load"); }, 500);
            $("#AltView_NoAlt_head_closeAltBtn").on("click", function (e) {
                e.preventDefault();
                this_.close();
            });
            if (!altlistbtn || (!alt_show && !title_show)) {
                $(".altViewNoAltHeadCloseBtn").remove();
            }
            if (!closebtn) {
                $("#AltView_NoAlt_head_closeAltBtn").remove();
            }
        };
        AltView.prototype.addNoAltListObj = function (obj) {
            var listobj = $("<li class='altViewNoAltUlBlock__list'><a href='#' class='altViewNoAltUlBlock__img'><img src='" + obj.src + "' width='100'></a></li>");
            var top_ = obj.img_path.offset().top;
            listobj.on("click", function (e) {
                e.preventDefault();
                $(window).scrollTop(top_ - 200);
            });
            listobj.on("mouseout", function () {
                obj.img_path.removeClass('AltView_012345_Tip_show');
                $("#AltView_wrap div.Tip").show();
            });
            listobj.on("mouseover", function () {
                obj.img_path.addClass('AltView_012345_Tip_show');
                $("#AltView_wrap div.Tip").not($("#alt_view_tip_" + obj.id)).hide();
                $("#alt_view_tip_" + obj.id).show();
            });
            return listobj;
        };
        ;
        AltView.prototype.getImgTagData = function (index, element) {
            var style = null;
            if (element.attr("style")) {
                style = element.attr("style");
            }
            var top = element.offset().top;
            var left = element.offset().left;
            var src = element.attr("src");
            var extension = null;
            var alt = null;
            if (element.attr("alt")) {
                alt = element.attr("alt");
            }
            var title = null;
            if (element.attr("title")) {
                title = element.attr("title");
            }
            var width = element.width();
            var height = element.height();
            var width_attr = null;
            var height_attr = null;
            if (element.attr("width")) {
                width_attr = parseInt(element.attr("width"));
            }
            if (element.attr("height")) {
                height_attr = parseInt(element.attr("height"));
            }
            element.css({ "width": "auto", "height": "auto" });
            var width_natural = element.width();
            var height_natural = element.height();
            if (style) {
                element.attr("style", style);
            }
            else {
                element.removeAttr("style");
            }
            element.attr("alt_view_tip", index);
            this.ImageAction(element, true);
            var imgTagData = {
                id: index,
                style: style,
                src: src,
                img_path: element,
                extension: extension,
                top: top,
                left: left,
                alt: alt,
                title: title,
                width: width,
                height: height,
                width_attr: width_attr,
                height_attr: height_attr,
                width_natural: width_natural,
                height_natural: height_natural
            };
            return imgTagData;
        };
        AltView.prototype.fResizeTitleView = function () {
            var this_ = this;
            $(window).on("resize.AltTitleView_012345", function () {
                for (var i = 0; i < this_.AltTitleView_012345.AltData.length; i++) {
                    this_.AltTitleView_012345.AltData[i].fpath.css("top", this_.AltTitleView_012345.AltData[i].img_path.offset().top);
                    this_.AltTitleView_012345.AltData[i].fpath.css("left", this_.AltTitleView_012345.AltData[i].img_path.offset().left);
                }
                this_.fukidashiCSS();
            });
        };
        AltView.prototype.fukidashiCSS = function () {
            var this_ = this;
            setTimeout(function () {
                $(".Tip").each(function () {
                    var id = $(this).attr("data");
                    $(this).find(".fuki-top").remove();
                    $(this).find(".fuki-bottom").remove();
                    $(this).show();
                    var top = this_.AltTitleView_012345.AltData[id].top;
                    var height = $(this).outerHeight();
                    if (top - height < 0) {
                        var _height = this_.AltTitleView_012345.AltData[id].top + this_.AltTitleView_012345.AltData[id].height;
                        $(this).css("top", (_height));
                        $(this).prepend("<div class='fuki-top'></div>");
                    }
                    else {
                        $(this).css("top", (top - height - 7));
                        $(this).append("<div class='fuki-bottom'></div>");
                    }
                });
            }, 300);
        };
        AltView.prototype.close = function () {
            if (0 < $("#AltView_012345").length) {
                $("#AltView_wrap div.Tip .closeBtn").off("click.Tip");
                $("#AltView_012345").remove();
                $("#AltView_NoAlt_Wrap").remove();
                $("img").removeAttr("alt_view_tip");
                this.ImageAction($("img"), false);
                $(window).off("resize.AltTitleView_012345");
                this.dispatchEvent(new events.Event("show", false));
            }
        };
        AltView.prototype.ImageAction = function (target, add) {
            if (add) {
                target.on("mouseover.AltTitleView_012345", this.ImageOver);
                target.on("mouseout.AltTitleView_012345", this.ImageOut);
            }
            else {
                target.off("mouseover.AltTitleView_012345", this.ImageOver);
                target.off("mouseout.AltTitleView_012345", this.ImageOut);
            }
        };
        AltView.prototype.ImageOver = function () {
            var path = $(this);
            $("#AltView_wrap div.Tip").hide();
            var id = path.attr("alt_view_tip");
            $("#alt_view_tip_" + id).show();
            path.addClass('AltView_012345_Tip_show');
        };
        AltView.prototype.ImageOut = function () {
            var path = $(this);
            $("#AltView_wrap div.Tip").show();
            path.removeClass('AltView_012345_Tip_show');
        };
        return AltView;
    }(events.EventDispatcher));
    AltViewModule.AltView = AltView;
})(AltViewModule || (AltViewModule = {}));
var MetaView = MetaViewModule.MetaView;
var AltView = AltViewModule.AltView;
var ContentScript = (function () {
    function ContentScript() {
        this.meta_view = new MetaView();
        this.alt_view = new AltView();
        this.showAlt = false;
        this.showMeta = false;
        chrome.runtime.onMessage.addListener(function (anymessage, sender, sendResponse) {
            if (anymessage.contetState == "AreYouReady?") {
                sendResponse({
                    contetState: "OkGo!"
                });
            }
            if (anymessage.fromPopUp == "Alt") {
                if (!this.showAlt) {
                    this.alt_view.show();
                }
                else {
                    this.alt_view.close();
                }
            }
            if (anymessage.fromPopUp == "Meta") {
                if (!this.showMeta) {
                    this.meta_view.show();
                }
                else {
                    this.meta_view.close();
                }
            }
            if (anymessage.fromPopUp == "Open!" || anymessage.fromPopUp == "Alt" || anymessage.fromPopUp == "Meta") {
                sendResponse({
                    ContentsShowAlt: this.showAlt,
                    ContentsShowMeta: this.showMeta
                });
            }
            return true;
        });
        var AltTitleView_012345 = {};
        var _this = this;
        this.alt_view.addEventListener("show", function (e) {
            if (e.value) {
                _this.showAlt = true;
            }
            else {
                _this.showAlt = false;
            }
        });
        this.meta_view.addEventListener("show", function (e) {
            if (e.value) {
                _this.showMeta = true;
            }
            else {
                _this.showMeta = false;
            }
        });
    }
    return ContentScript;
}());
this.ContentScript();
