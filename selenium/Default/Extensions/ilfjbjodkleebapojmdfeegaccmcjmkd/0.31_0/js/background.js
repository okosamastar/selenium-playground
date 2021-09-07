// creates a new tab when clicked
chrome.browserAction.onClicked.addListener(function(activeTab) {
  var myid = chrome.runtime.id
  if (activeTab.url !== 'chrome://newtab/') {
    chrome.tabs.create({ url: `chrome-extension://${myid}/index.html` })
  }
})
