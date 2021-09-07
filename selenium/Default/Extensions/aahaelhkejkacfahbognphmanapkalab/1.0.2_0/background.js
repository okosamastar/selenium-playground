chrome.browserAction.onClicked.addListener(function(tab) {
    var url = 'https://developers.facebook.com/tools/debug/og/object?q=' + encodeURIComponent(tab.url);
    chrome.tabs.create({
      url: url
    });
});
chrome.contextMenus.create({
    "title": "OGPを確認",
    "type": "normal",
    "contexts": ["all"],
    "onclick": function(info) {
        var url = 'https://developers.facebook.com/tools/debug/og/object?q=' + encodeURIComponent(info.pageUrl);
        chrome.tabs.create({
            url: url
        });
    }
});