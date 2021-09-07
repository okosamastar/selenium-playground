// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/*
chrome.tabs.onSelectionChanged.addListener(function(tabId) {
  var js = 'chrome.tabs.executeScript(' + tabId + ', {file: "npdownload.js"});';

  setTimeout(function() { eval(js); }, 500);
});

function downloadURL (url)
{
	console.log("call downloadURL");
	
}
*/

var DMWindowId = undefined;
var DMTabId = undefined;
var DMURL = undefined;
var DMTabIndex = undefined;
var pageUrl = undefined;
var linkUrl = undefined;
var chromeFiltersActive = undefined;
var isClicking = false;
//var DMFullURL = undefined;
var DLTabID = undefined;

/* creating the context menu */
//var options = [["Download link by ASUS Download Master", ["link"], downloadLinkOnClick], ["Download all by ASUS Download Master", ["page","link"], downloadAllOnClick]];
var options = [["Download link by ASUS Download Master", ["link"], downloadLinkOnClick]];

for (var i = 0; i < options.length; i++)
{
	var id = chrome.contextMenus.create({"title": options[i][0], "contexts": options[i][1],
	                                    "onclick": options[i][2]});
	console.log("'" + options[i][0] + "' item:" + id);
}

function downloadLinkOnClick (info, tab)
{
	console.log("call downloadLinkOnClick");
	if(isClicking)
	{
		alert('Download Master is Working now!!');
		return;		
	}

	isClicking = true;
	
	DLTabID = tab.id;

	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, {action: 'createBubble', text: "Downloading..."});		
	});
	//Asusplugin.DownloadSingle(info.linkUrl);
	//setTimeout("changeToDMTab();",500);
	//changeToDMTab(); //for DM2 v.2030

/* //for test
  if(DMTabId != null){
    updateTab(DMTabId, DMURL+'task.asp?flag=9');
  }
*/

	pageUrl = info.pageUrl;
	linkUrl = info.linkUrl;
/*
	if(localStorage.url && localStorage.username && localStorage.password) {
		if(linkUrl.indexOf('magnet:') == 0 || linkUrl.indexOf('ed2k:') == 0 || linkUrl.indexOf('ftp:') == 0) {
			submitLinkUrl(linkUrl);
		} else {
			getContentType(linkUrl, 
				function(contentType) {
					if(contentType) {
						if(contentType.indexOf('application/x-bittorrent') >= 0) {
							submitTorrentFile(linkUrl);
						} else {
							submitLinkUrl(linkUrl);
						}
					} else {
						console.log('Failed to get content type!');
						
					}
				}, function() {
					if(confirm('Unable to detect the type of download automatically.\n\nWould you like to download it as URL?\n\nIf you choose "Cancel" it will be downloaded as torrent file')) {
						submitLinkUrl(info.linkUrl);
					} else {
						submitTorrentFile(info.linkUrl);
					}
				}
			);
		}
	} else {
		//alert('Please setup plugin parameters!');
		chrome.tabs.create({'url': 'chrome-extension://kjahdcjadampelfmhkbceiledefjfnga/options.html'});		
	}
*/
	if(!localStorage.url){
		localStorage.url = 'http://192.168.1.1:8081/downloadmaster';		
		//localStorage.url = '192.168.1.1';
		//localStorage.port = '8081';
		//DMFullURL = "http://" + localStorage.url + ":" + localStorage.port + "/downloadmaster";
		localStorage.username = 'admin';
		localStorage.password = 'admin';
	}
	//else
	//	DMFullURL = "http://" + localStorage.url + ":" + localStorage.port + "/downloadmaster";
	console.log(localStorage.url);
	if(linkUrl.indexOf('magnet:') == 0 || linkUrl.indexOf('ed2k:') == 0 || linkUrl.indexOf('ftp:') == 0){
		submitLinkUrl(linkUrl);
	} else {
		if(linkUrl.indexOf('thunder:') == 0){
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendMessage(DLTabID, {action: 'removeBubble'});
			});
			isClicking = false;
			alert('Download Master is not support this!');
		}
		else {			
			getContentType(linkUrl, 
				function(contentType) {
					if(contentType) {
						if(contentType.indexOf('application/x-bittorrent') >= 0) {
							submitTorrentFile(linkUrl);
						} else {
							submitLinkUrl(linkUrl);
						}
					} else {
						console.log('Failed to get content type!');					
					}
				}, function() {
					//console.log('downloadLinkOnClick():getContentType()-onFailure!');
					//if(confirm('Unable to detect the type of download automatically.\n\nWould you like to download it as URL?\n\nIf you choose "Cancel" it will be downloaded as torrent file')) {
						submitLinkUrl(info.linkUrl);
					//} else {
					//	submitTorrentFile(info.linkUrl);
					//}
				}
			);
		}
	}
	//changeToDMTab();
	//setupDoubleClick();
}

function getContentType(linkUrl, onSuccess, onFailure) {
	console.log("getContentType()", linkUrl);

	var request = new XMLHttpRequest();
	request.open("HEAD", linkUrl, true);

	request.timeout = 3000;

	request.onload = function (oEvent) {
		chromeFiltersActive = false;
		var contentType = request.getResponseHeader('Content-Type');
		if(request.status == 200 && contentType) {
			if (onSuccess) {
				onSuccess(contentType);
			}
		} else {
			if (onFailure) {
				onFailure(request.status, request.statusText);
			}
		}
	};

	request.onerror = function () {
		chrome.tabs.sendMessage(DLTabID, {action: 'removeBubble'});
		isClicking = false;
		alert('Download Master is not support this!');		
	};

	chromeFiltersActive = true;
	request.send(null);
}

/*
function downloadAllOnClick (info, tab)
{
	console.log("call downloadAllOnClick()");	
	//chrome.tabs.executeScript(null,	{file: "download_all.js", allFrames: true});
	if (info.frameUrl) {
		console.log("info.frameUrl true");
    chrome.tabs.executeScript(null,
      {code: 'npDownload.checkFrameByUrlAndDown("' + info.frameUrl + '");', allFrames: true})
  } else {
    console.log("info.frameUrl false");
    chrome.tabs.executeScript(null,
      {code: 'npDownload.sendDownloadAllCommandToMain();'})
  }
  //changeToDMTab(); //for DM2 v.2030
}
*/

function submitTorrentFile(linkUrl, fileName) {
	console.log('submitTorrentFile(linkUrl):', linkUrl);
	downloadTorrentFile(linkUrl, function (arrayBuffer, fileName) {
		console.log('Successfully downloaded torrent file with length:',  new Uint8Array(arrayBuffer).byteLength, "fileName:", fileName);

		uploadTorrent(arrayBuffer, fileName, function() {
			console.log('Successfully submitted torrent file to the Download Master:', linkUrl);
			//alert('Successfully submitted torrent file to the Download Master.');
			//chrome.tabs.create({'url': localStorage.url});
			chrome.tabs.sendMessage(DLTabID, {action: 'removeBubble'});
			changeToDMTab();			
		});
	});
}

function downloadTorrentFile(linkUrl, onSuccess, onFailure) {
	console.log("downloadFile()", linkUrl);

	var request = new XMLHttpRequest();
	request.open("GET", linkUrl, true);
	request.responseType = "arraybuffer";

	request.timeout = 3000;

	request.onload = function (oEvent) {
		chromeFiltersActive = false;
		var arrayBuffer = request.response;

		var fileName = extractFileName(request.getResponseHeader('Content-Disposition'));

		if(request.status == 200) {
			var contentType = request.getResponseHeader('Content-Type')
			if(contentType && contentType.indexOf('application/x-bittorrent') >=0) {
				if (onSuccess) {
					onSuccess(arrayBuffer, fileName);
				}
			} else {
				showError('Failed to download torrent file. Wrong response content type:' + contentType, request);
			}
		} else {
			showError('Failed to download torrent file.', request);
		}
	};

	request.onerror = function () {
		chrome.tabs.sendMessage(DLTabID, {action: 'removeBubble'});
		isClicking = false;	
	};
	
	chromeFiltersActive = true;
	request.send(null);
}

function extractFileName(contentDisposition) {
	if(contentDisposition) {
		var matchResult = /filename="(.*)"/g.exec(contentDisposition);
		if(matchResult) {
			return matchResult[1];
		}
	}
}

function uploadTorrent(arrayBuffer, fileName, onSuccess, onFailure) {
	var blob = new Blob([arrayBuffer], { type: "application/x-bittorrent"});
	
	var formData = new FormData();

	if(fileName) {
		formData.append("file", blob, fileName);
	} else {
		formData.append("file", blob, "file.torrent");
	}

	var request = new XMLHttpRequest();
	request.open("POST", localStorage.url + '/dm_uploadbt.cgi', true);
	//request.open("POST", DMFullURL + '/dm_uploadbt.cgi', true);
	request.setRequestHeader('Authorization', "Basic " + btoa(localStorage.username + ":" + localStorage.password));

	request.timeout = 3000;
	
	var errorMsgs = {
		ACK_FAIL : 'Failed to add the new download task.',
		BT_EXIST : 'The task already exists.',
		LIGHT_FULL : 'The http/ftp task list is full.',
		HEAVY_FULL : 'The BT task list is full.',
		NNTP_FULL : 'The NZB task list is full.',
		TOTAL_FULL : 'The task list is full.',
		DISK_FULL : 'There is not enough space to store the file.',
	};

	request.onload = function (oEvent) {
		if(request.status == 200 && request.responseText) {
			if(request.responseText.indexOf('BT_ACK_SUCESS') >= 0) {
				selectAllTorrentFiles(fileName, onSuccess);
				return;
			} else  if(request.responseText.indexOf('ACK_SUCESS') >= 0) {
				if (onSuccess) {
					onSuccess();
				}

				return;
			} else {
				for (var msgCode in errorMsgs) {
					if(request.responseText.indexOf(msgCode) >= 0) {
						console.error('Failed to submit task to the Download Master.\nError returned: ' + msgCode);
						alert('Failed to submit task to the Download Master.\nError returned: ' + errorMsgs[msgCode]);
						return;
					}
				}
			}
		}

		showError('Failed to submit torrent file.', request);
	};

	request.onerror = function () {
		chrome.tabs.sendMessage(DLTabID, {action: 'removeBubble'});
		isClicking = false;	
	};

	request.send(formData);
}

function selectAllTorrentFiles(fileName, onSuccess) {
	
	console.log('Torrent contains multiple files! Selecting all.');

	$.ajax({
		type: 'GET',
		url: localStorage.url + '/dm_uploadbt.cgi',
		//url: DMFullURL + '/dm_uploadbt.cgi',
		data: {
			filename: fileName,
			download_type: 'All',
		},
		success: function(data) {
			if (onSuccess) {
				onSuccess();
			}
		},
		error: function(request) {
			showError('Failed to select all torrent files.', request);
		},
		beforeSend : function(req) {
		    req.setRequestHeader('Authorization', "Basic " + btoa(localStorage.username + ":" + localStorage.password));
		},
		timeout: 3000,
	});
}

function submitLinkUrl(linkUrl) {
	console.log('submitLinkUrl(linkUrl):', linkUrl);

	$.ajax({
		type: 'GET',
		url: localStorage.url + '/dm_apply.cgi',
		//url: DMFullURL + '/dm_apply.cgi',
		data: {
			action_mode:'DM_ADD',
			download_type: 5,
			again: 'no',
			usb_dm_url: linkUrl
		},
		success: function(data) {
			console.log('Successfully submitted link to the Download Master.');
			//alert('Successfully submitted link to the Download Master.');
			//chrome.tabs.create({'url': localStorage.url});
			chrome.tabs.sendMessage(DLTabID, {action: 'removeBubble'});
			changeToDMTab();			
		},
		error: function(request) {
			showError('Failed to submit link.', request);
		},
		beforeSend : function(req) {
		    req.setRequestHeader('Authorization', "Basic " + btoa(localStorage.username + ":" + localStorage.password));
		},
		timeout: 3000,
	});

}

function showError(detailsText, request) {
	var text = null;
	//if(request.status == 401) {
	//	text = 'Failed to submit task to the Download Master. Please check username and password.\n\n' + detailsText;
	//} else {
	//	text = 'Failed to submit task to the Download Master.\n\n' + detailsText +'\nServer response:' + request.status + ' text:' + request.statusText;
	//}
/*
	if(request.status == 401) {
		text = 'Failed to submit task to the Download Master. Please check username and password.\n\n' + detailsText;
		if(confirm('Failed to submit task to the Download Master.\n\nWould you like to check username and password?')) {
			chrome.tabs.create({'url': 'chrome-extension://kjahdcjadampelfmhkbceiledefjfnga/options.html'});
		}
	} else {
		text = 'Failed to submit task to the Download Master.\n\n' + detailsText +'\nServer response:' + request.status + ' text:' + request.statusText;
		alert(text);
	}
*/
	text = 'Failed to submit task to the Download Master.\n\n' + detailsText +'\nServer response:' + request.status + ' text:' + request.statusText;
	//text = 'chrome-extension://kjahdcjadampelfmhkbceiledefjfnga/options.html?show=' + text;
	console.error(text);
	isClicking = false;
	chrome.tabs.sendMessage(DLTabID, {action: 'removeBubble'});
	//alert(text);
	//chrome.tabs.create({'url': text });	
	//chrome.tabs.create({'url': 'chrome-extension://kjahdcjadampelfmhkbceiledefjfnga/options.html?show=Failed' });
	chrome.tabs.create({'url': 'options.html?show=Failed' });
}

function searchDMTab() {
  console.log("function searchDMTab()");
  chrome.windows.getAll({ populate: true }, function(windowList) {
    for (var i = 0; i < windowList.length; i++) {
      for (var j = 0; j < windowList[i].tabs.length; j++) {
        //console.log("windowList[" + i + "].tabs[" + j + "].title= " + windowList[i].tabs[j].title);
        if(windowList[i].tabs[j].title.search("Download Master") == 0) {
        	DMWindowId = windowList[i].id;
        	DMTabId = windowList[i].tabs[j].id;
        	DMURL = windowList[i].tabs[j].url;
        	DMURL = DMURL.substring(0,DMURL.lastIndexOf('/')+1);
        	DMTabIndex = windowList[i].tabs[j].index;          
          //updateTab(windowList[i].tabs[j].id, windowList[i].tabs[j].url);
          break;
        }
      }
    }    
    if(DMTabId == null)	//0: no DMpage, 1: have DMpage
    {
		console.log('DMTabId == null');
		//Asusplugin.SetDMPage('0');		
    }
    else
    {
    	console.log('DMTabId != null');
    	//Asusplugin.SetDMPage('1');
    }
  });	
}

function changeToDMTab() {
  console.log("function changeToDMTab()");
  isClicking = false;
  searchDMTab();
  if(DMTabId != null){
    updateTab(DMTabId, DMURL);  	
  } else{
	  chrome.tabs.create({'url': localStorage.url});
	  //chrome.tabs.create({'url': DMFullURL});
  }
}

function updateTabData(id, url) {
  console.log("function updateTabData(id):" + id);
  var retval = {
    url: url,
    selected: true
  }
  return retval;
}

function updateTab(id, url){
  console.log("function updateTab(id):" + id);
  try {
    chrome.tabs.update(id, updateTabData(id, url));
  } catch (e) {
    //alert(e);
    console.log(e);
  }
}

//function requestErrorHandler(error,id,Durl){
function requestErrorHandler(error){
	switch(error){		
		case 'net::ERR_INTERNET_DISCONNECTED':
			alert('net::ERR_INTERNET_DISCONNECTED');
			break;		
		case 'net::ERR_CONNECTION_TIMED_OUT':
			alert('net::ERR_CONNECTION_TIMED_OUT');
			break;
		case 'net::ERR_NAME_NOT_RESOLVED':
			alert('net::ERR_NAME_NOT_RESOLVED');
			break;
		case 'net::ERR_NAME_RESOLUTION_FAILED':
			alert('net::ERR_NAME_RESOLUTION_FAILED');
			break;
		case 'net::ERR_EMPTY_RESPONSE':
			alert('net::ERR_EMPTY_RESPONSE');
			break;
		default:
			break;
	}
}

chrome.webRequest.onErrorOccurred.addListener(
	function(details) {
		/*
		if (isFailing == false){
			requestErrorHandler(details.error,details.id,details.url);
		}else{
			if (details.url.indexOf(appCheckErrorURL) == -1){
				requestErrorHandler(details.error,details.id,details.url);
			}
		}
		*/
		//console.log("onErrorOccurred.addListener:linkUrl=" + linkUrl);
		//console.log("onErrorOccurred.addListener:details.url=" + details.url);
		if(linkUrl == details.url)
		{
			isClicking = false;
			requestErrorHandler(details.error);
		}			
	}, {
		urls:["<all_urls>"]
	}
);

chrome.webRequest.onBeforeSendHeaders.addListener(
	function(details) {
	if(chromeFiltersActive && details.url == linkUrl) {
		console.log('Setting Referer request header to:', pageUrl);

		details.requestHeaders.push({
			name: 'Referer',
			value: pageUrl
		});
	}

	return {requestHeaders: details.requestHeaders};
	}, {
  		urls: ["<all_urls>"],
		types: ["xmlhttprequest"]
	},
	["blocking", "requestHeaders"]
);


chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
	if(chromeFiltersActive && details.url == linkUrl) {
		console.log('Deleting Set-Cookie response header');

		for (var i = 0; i < details.responseHeaders.length; ++i) {
			if (details.responseHeaders[i].name === 'Set-Cookie') {
				details.responseHeaders.splice(i, 1);
				break;
			}
		}
	}

	return {responseHeaders: details.responseHeaders};
	}, {
  		urls: ["<all_urls>"],
		types: ["xmlhttprequest"]
	},
	["blocking", "responseHeaders"]
);


chrome.extension.onConnect.addListener(
	function(port)
	{
		port.onMessage.addListener(
			function(msg)
			{
				console.log("Connection type: " + msg.type);
				if (msg.type == "setLinks")
				{
					var linksStr = "";
					var linksCount = "";
					var linksAry = msg.links;
					linksStr = linksAry.toString();
					linksCount = linksAry.length.toString();
					//console.log("linksAry.length: " + linksAry.length);
					//console.log(linksStr);					
				}
			}
		);
	}
);

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  console.log('tabs.onUpdated.addListener -- tab: ' + tabId + ', status: ' + props.status + ', url: ' + props.url);
  if(DMWindowId == null){
    searchDMTab();
    //console.log('tabs.onUpdated.addListener -- DMWindowId: ' + DMWindowId);
  }else{
    //msgofDM();
	console.log('tabs.onUpdated.addListener -- DMWindowId: ' + DMWindowId);
  }
  	
  /*{
    var msg = Asusplugin.IsDmMsg();
    console.log('tabs.onUpdated.addListener -- msg: ' + msg);
    if(msg)
    {
      //chrome.tabs.remove(tabId);
      console.log('tabs.onUpdated.addListener -- gotoDMTab, tabId: ' + tabId);
      gotoDMTab();
    }    
  }*/
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  console.log('windows.onFocusChanged.addListener -- window: ' + windowId);

});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  console.log('tabs.onSelectionChanged.addListener -- window: ' + props.windowId + ', tab: ' + tabId);
  if(DMWindowId == null){
    searchDMTab();
  }
});

chrome.tabs.onRemoved.addListener(function(tabId) {
  console.log('tabs.onRemoved.addListener -- tab: ' + tabId);
  if(tabId == DMTabId){
    DMWindowId = undefined;
    DMTabId = undefined;
    DMURL = undefined;
    DMTabIndex = undefined;
    //Asusplugin.SetDMPage('0');  
  }
});

chrome.tabs.onCreated.addListener(function(tab) {
  console.log('tabs.onCreated.addListener -- window: ' + tab.windowId + ', tab: ' + tab.id + ', title: ' + tab.title + ', index: ' + tab.index + ', url: ' + tab.url);
/*
  if(DMTabId != null){
    if(DMTabId != tab.id){
      var msg = Asusplugin.IsDmMsg();
      console.log('tabs.onCreated.addListener -- msg: ' + msg);
      if(msg == 1)
      {
        console.log('msg = true');
        chrome.tabs.remove(tab.id);
        //gotoDMTab();
        updateTab(DMTabId, DMURL);
      }
      else
      	console.log('msg = false');
    }
  }
*/
});

chrome.tabs.onActiveChanged.addListener(function(tabId, props) {
  console.log('tabs.onActiveChanged.addListener -- tabId: ' + tabId + ', window: ' + props.windowId);	
  //setupDoubleClick();
});

chrome.tabs.onAttached.addListener(function(tabId, props) {
  console.log('tabs.onAttached.addListener -- tabId: ' + tabId + ', window: ' + props.windowId);	
});

chrome.tabs.onHighlightChanged.addListener(function(props){
  console.log('tabs.onAttached.addListener -- window: ' + props.windowId);	
});