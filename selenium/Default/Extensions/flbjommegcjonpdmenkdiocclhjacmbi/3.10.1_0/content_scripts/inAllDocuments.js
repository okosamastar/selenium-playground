(function () {
    const chromeRuntime = chrome.runtime;
    const mutationObserverParams = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'src']
    };
    const body = window.document.body;

    let bodyMutationEndingObserver;

    try {
        const {
            sendMessageToBackgroundScript,
            html2json,
            htmlString2json,
            highlightElement,
            scrollToDocumentTop,
            removeDataElementIdAttributes,
            addMutationObserver,
            debounceFn,
            getTitleForDocument,
            cleanHighlighted
        } = utilsService();

        const widgetActions = {
            getDocumentStructure,
            highlightElementInFrame: highlightElement,
            scrollFrameDocumentToTop: scrollToDocumentTop,
            connectMutationObserver,
            disconnectMutationObserver,
            getDocumentTitle,
            closeWidget
        };

        const analysisToDo = Object.assign(HTML5OutlineService(), headingsMapService())

        chromeRuntime.onMessage.addListener((message, sender, sendResponse) => {
            let action = message.action;
            let params = message.params;

            widgetActions[action] && widgetActions[action](params, sendResponse);
        });

        function getDocumentStructure(params) {
            removeDataElementIdAttributes();
            cleanHighlighted();
            const settings = params.settings;
            const frameId = params.frameId;
            const analysis = params.analysis;
            const analysisResult = analysisToDo[analysis](settings)();

            let headingsStructure;

            if(analysis !== 'HTML5Outline'){
                headingsStructure = html2json(analysisResult);
            }else{
                headingsStructure = htmlString2json(analysisResult);
            }

            sendMessageToBackgroundScript({
                action: 'showResultsFromFrame',
                params: {frameId, analysis, headingsStructure}
            });
        }

        function connectMutationObserver(params) {
            const onEndingDOMChangeCallback = () => {
                getDocumentStructure(params);
                sendMessageToBackgroundScript('getDocumentList');
            };

            disconnectMutationObserver();
            bodyMutationEndingObserver = addMutationObserver(body, mutationObserverParams, debounceFn(onEndingDOMChangeCallback, false));
        }

        function disconnectMutationObserver() {
            bodyMutationEndingObserver && bodyMutationEndingObserver.disconnect();
        }

        function getDocumentTitle(params, sendResponse) {
            const documentTitle = getTitleForDocument(params.withHref);

            sendResponse({documentTitle});
        }

        function closeWidget() {
            removeDataElementIdAttributes();
            cleanHighlighted();
            disconnectMutationObserver();
        }
    } catch (err) {
    }
})();