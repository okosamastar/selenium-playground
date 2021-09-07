function onClickHandler(info, tab) {
  chrome.windows.create({"url":tab.url, "incognito":!tab.incognito, "focused": true, "state": "maximized"});
}

// for toolbar button
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.windows.create({"url":tab.url, "incognito": !tab.incognito, "focused": true, "state": "maximized"});
});


chrome.contextMenus.onClicked.addListener(onClickHandler);


// first run

chrome.runtime.onInstalled.addListener(function(details) {
  // setting up context menu entries
  chrome.contextMenus.create({"title": "Incognito This Tab", "contexts":["page"], "id": "incogthistab"});

  if (details.reason == "install") {
        chrome.tabs.create({ "url": "https://browsernative.com/incognito-chrome/"});
  }
});
