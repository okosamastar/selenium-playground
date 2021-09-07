const skeletonScript = {file: 'content_scripts/skeleton.js', allFrames: false};
const headingsMap = {file: 'content_scripts/algorithms/headingsMap.js', allFrames: true};
const HTML5Outline = {file: 'content_scripts/algorithms/HTML5Outline.js', allFrames: true};
const commonFunctionalities = {file: 'content_scripts/algorithms/commonFunctionalities.js', allFrames: true};
const resizerScript = {file: 'content_scripts/resizer.js', allFrames: false};
const utilsScript = {file: 'content_scripts/utils.js', allFrames: true};
const tooltipScript = {file: 'content_scripts/tooltip.js', allFrames: false};
const inAllDocumentsScript = {file: 'content_scripts/inAllDocuments.js', allFrames: true};
const documentSelector = {file: 'modules/documentSelector.js', allFrames: false};
const inDocumentStyles = {file: 'content_scripts/inDocumentStyles.css', allFrames: true};
const contentScripts = [utilsScript, tooltipScript, commonFunctionalities, headingsMap, HTML5Outline, resizerScript, documentSelector, skeletonScript, inAllDocumentsScript];
const cssToInject = [inDocumentStyles];
const actions = {
    toggle: (tabId, params, options) => sendActionToContentScript(tabId, 'toggle', params, options),
    update: (tabId, params, options) => sendActionToContentScript(tabId, 'update', params, options),
    getDocumentList,
    getHeadingsMapFromFrame,
    showResultsFromFrame,
    highlightElementInFrame,
    disconnectMutationObservers,
    scrollFrameDocumentToTop,
    closeWidget,
    initialize
};

// open/close when clicking the toolbar button
chrome.browserAction.onClicked.addListener(executeFunctionInContentScripts);

function executeFunctionInContentScripts(tab) {
    const tabId = tab.id;

    const functionToExecute = toggleHeadingsMap;
    const contentToInject = {
        contentScripts,
        cssToInject
    };
    sendMessageToContentScript(tabId, {execute: true}, {frameId: 0}, (responseMessage) => {
        // contentScript returns responseMessage when was executed once, so if it was not executed,
        // it will execute all scripts and toggle the panel. Next time will only require to execute the toggle
        // because there will be a response
        responseMessage ? functionToExecute(tabId)() : injectScriptsAndExecuteCallback(tabId, contentToInject, functionToExecute);
    });
}

const URLBlackList = [
    'about:blank',
    'apis.google.com',
    'accounts.google.com/o/oauth',
    'doubleclick.net',
    'staticxx.facebook.com',
    'platform.twitter.com/widgets/widget_iframe',
    'platform.twitter.com/widgets/follow_button'
];

function getDocumentList(tabId) {
    chrome.webNavigation.getAllFrames(
        {tabId},
        function (details) {
            let documents = [];
            for (let i = 0; i < details.length; i++) {
                if (!isInBlackList(details[i].url)) {
                    let {frameId, url, parentFrameId, errorOccurred} = details[i];
                    !errorOccurred && documents.push({url, frameId, parentFrameId});
                }
            }
            documents.sort(function (a, b) {
                return a.frameId - b.frameId;
            });

            const documentsLength = documents.length;
            let documentsCounter = 0;

            for (let i = 0; i < documentsLength; i++) {
                sendActionToContentScript(tabId, 'getDocumentTitle', {withHref: true}, {frameId: documents[i].frameId}, (responseMessage) => {
                    documentsCounter++;
                    if (responseMessage.documentTitle) {
                        documents[i].title = responseMessage.documentTitle;
                    }

                    if (documentsCounter === documentsLength) {
                        sendActionToContentScript(tabId, 'updateListOfDocuments', {documents}, {frameId: 0})
                    }
                })
            }
        }
    );
}

function isInBlackList(urlToCheck) {
    const URLBlackListLength = URLBlackList.length;

    for (let i = 0; i < URLBlackListLength; i++) {
        if (urlToCheck.indexOf(URLBlackList[i]) >= 0) {
            return true;
        }
    }
    return false;
}

function getHeadingsMapFromFrame(tabId, params) {
    const frameId = params.frameId;

    disconnectMutationObservers(tabId, () => {
        sendActionToContentScript(tabId, 'connectMutationObserver', params, {frameId}, () => {
            sendActionToContentScript(tabId, 'getDocumentStructure', params, {frameId});
        });
    });
}

function showResultsFromFrame(tabId, params) {
    sendActionToContentScript(tabId, 'showResultsFromFrame', params, {frameId: 0});
}

function highlightElementInFrame(tabId, params) {
    const frameId = params.frameId;

    sendActionToContentScript(tabId, 'highlightElementInFrame', params, {frameId});
}

function scrollFrameDocumentToTop(tabId, params) {
    const frameId = params.frameId;

    sendActionToContentScript(tabId, 'scrollFrameDocumentToTop', params, {frameId});
}

function disconnectMutationObservers(tabId, callback) {
    sendActionToContentScript(tabId, 'disconnectMutationObserver', {}, {}, callback);
}

function closeWidget(tabId) {
    sendActionToContentScript(tabId, 'closeWidget', {}, {});
}

function toggleHeadingsMap(tabId) {
    return () => {
        actions.toggle(tabId);
    }
}

function injectScriptsAndExecuteCallback(tabId, contentToInject, callback) {
    // listen for messages from the tab
    if (!chrome.runtime.onConnect.hasListener(messageReceiver)) {
        chrome.runtime.onConnect.addListener(messageReceiver);
    }

    const scripts = contentToInject.contentScripts;
    const css = contentToInject.cssToInject;

    scripts && executeScripts(tabId, scripts, callback(tabId));
    css && insertCSS(tabId, css);

    function executeScripts(tabId, injectDetailsArray, lastCallback) {
        let callback = lastCallback;

        for (let i = injectDetailsArray.length - 1; i >= 0; --i) {
            callback = getCallback(tabId, injectDetailsArray[i], callback);
        }

        callback && callback();

        function getCallback(tabId, injectDetails, innerCallback) {
            return () => {
                chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
            };
        }
    }

    function insertCSS(tabId, cssToInject) {
        for (let i = cssToInject.length - 1; i >= 0; --i) {
            chrome.tabs.insertCSS(cssToInject[i]);
        }
    }
}

function sendActionToContentScript(tabId, action, params = {}, options = {}, callback) {
    let message = {action, params};

    sendMessageToContentScript(tabId, message, options, callback);
}

function sendMessageToContentScript(tabId, message, options, callback) {
    chrome.tabs.sendMessage(tabId, message, options, callback);
}

function messageReceiver(portFromCS) {
    portFromCS.onMessage.addListener((message, objectFromSender) => {
        const sender = objectFromSender.sender;
        const tabId = sender.tab.id;

        if (!message.action) {
            actions[message] && actions[message](tabId);
        } else {
            actions[message.action] && actions[message.action](tabId, message.params);
        }
    });
}

function initialize(tabId, params) {
//    const keys = typeof params.keys === 'string' ? [params.keys] : params.keys;
//    const translations = {};
//    keys.forEach(key => {
//        translations[key] = chrome.i18n.getMessage(key);
//    })
    const browserLanguage = getLanguage();
    sendActionToContentScript(tabId, 'initializeWidget', {browserLanguage: browserLanguage}, {frameId: 0});
}

function getLanguage() {
    return chrome.i18n.getUILanguage();
}