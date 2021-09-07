var Options = (function () {
    function Options() {
        var this_ = this;
        this.getStorageVal();
        $("[type=checkbox]").on("change", function () {
            this_.changeVal();
        });
        $(".version").append(chrome.runtime.getManifest().version);
        $("[for='alt_checkbox']").html(chrome.i18n.getMessage("Option_LabelAlt"));
        $("[for='title_checkbox']").html(chrome.i18n.getMessage("Option_LabelTitle"));
        $("[for='size_checkbox']").html(chrome.i18n.getMessage("Option_LabelSize"));
        $("[for='path_checkbox']").html(chrome.i18n.getMessage("Option_LabelPath"));
        $("[for='console_checkbox']").html(chrome.i18n.getMessage("Option_LabelConsole"));
        $("[for='noAltList_checkbox']").html(chrome.i18n.getMessage("Option_LabelNoAltList"));
        $("[for='altFukidashiClose_checkbox']").html(chrome.i18n.getMessage("Option_LabelFukidashiClose"));
    }
    Options.prototype.getStorageVal = function () {
        var this_;
        var items;
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
            for (var name in items) {
                $("#" + name).prop("checked", items[name]);
            }
        });
    };
    Options.prototype.changeVal = function () {
        var formOptions = {
            alt_checkbox: $("#alt_checkbox").prop("checked"),
            title_checkbox: $("#title_checkbox").prop("checked"),
            size_checkbox: $("#size_checkbox").prop("checked"),
            path_checkbox: $("#path_checkbox").prop("checked"),
            extension_checkbox: $("#extension_checkbox").prop("checked"),
            console_checkbox: $("#console_checkbox").prop("checked"),
            noAltList_checkbox: $("#noAltList_checkbox").prop("checked"),
            altFukidashiClose_checkbox: $("#altFukidashiClose_checkbox").prop("checked")
        };
        chrome.storage.sync.set(formOptions, function () {
        });
    };
    return Options;
}());
var option_instans = new Options();
