const documentSelectorService = function () {
    const selectorOpenClass = 'open';
    const documentsSelectorWrapperId = 'document_selector_wrapper';
    const documentsSelectorLabelId = 'document_selector_label';
    const documentsSelectorId = 'document_selector';
    const documentSelectorTitleText = 'select the document to obtain its heading/sectioning structure';
    const documentSelectedId = 'document_selected';
    const listOfDocumentsId = 'list_of_documents';
    const listOfDocumentsSimpleClass = 'unique-document';
    const untitled_document = 'untitled document';
    const {
        createElement,
        createTextNode,
        getTitleForDocument,
        hiddenForA11y,
        attachStyles
    } = utilsService();

    return {
        createDocumentSelector
    };

    function createDocumentSelector(callbackFn, onOpenCallback = () => {
    }) {
        const styleElement = createElement('style', {});

        const selectedDocument = createElement('button', {'id': documentSelectedId});
        const listOfDocuments = createElement('ul', {'id': listOfDocumentsId});
        const documentsSelectorLabel = createElement('span', {
                'id': documentsSelectorLabelId
            },
            i18n.documents);
        const documentsSelectorCombo = createElement('div', {
                'id': documentsSelectorId,
                'title': documentSelectorTitleText
            },
            [selectedDocument, listOfDocuments]);
        const documentsSelector = createElement('div', {
                'id': documentsSelectorWrapperId,
                'class':listOfDocumentsSimpleClass
            },
            [styleElement, documentsSelectorLabel, documentsSelectorCombo]);
        attachStyles(['documentSelector'], documentsSelector, false, chrome.extension.getURL('modules/'));

        selectedDocument.onclick = toggle;
        documentsSelectorLabel.onclick = (event) => {
            toggle(event);
            selectedDocument.focus();
        };

        documentsSelector.updateListOfDocuments = (documents, activeFrameId) => {
            updateListOfDocuments(documents, activeFrameId, callbackFn)
        };
        documentsSelector.open = () => {
            documentsSelector.classList.add(selectorOpenClass);
        };
        documentsSelector.close = close;

        documentsSelector.keydown = (event) => {
            (event.which === 27) && event.target.close();
        };

        documentsSelector.setActiveDocumentId = setActiveDocumentId;

        return documentsSelector;

        function close() {
            documentsSelector.classList.remove(selectorOpenClass);
        }

        function toggle(event) {
            if (listOfDocuments.children.length === 1) {
                return;
            }
            event && event.stopPropagation();
            documentsSelector.classList.toggle(selectorOpenClass);
            onOpenCallback();
        }

        function updateListOfDocuments(documents, activeFrameId, callbackFn) {
            let documentsLength = documents.length;
            let defaultDocumentText;
            let activeDocumentExist;

            while (listOfDocuments.firstChild) {
                listOfDocuments.removeChild(listOfDocuments.firstChild);
            }

            for (let i = 0; i < documentsLength; i++) {
                const frame = documents[i];
                const iframe = window.document.querySelector('iframe[src="' + frame.url + '"]');

                if (iframe) {
                    const isVisible = !hiddenForA11y(iframe);

                    if (!isVisible) {
                        continue;
                    }
                }

                const frameId = frame.frameId;
                let title = frame.title;
                if (frameId === 0) {
                    if (title === undefined) {
                        title = getTitleForDocument(true);
                    }
                    defaultDocumentText = title || untitled_document;
                }
                let itemText = createTextNode(title);
                let item = createElement('li', {'data-frame-id': frameId}, itemText);
                item.onclick = () => {
                    callbackFn(frameId);
                    selectedDocument.textContent = title;
                    close();
                };

                if (activeFrameId === frameId) {
                    activeDocumentExist = true;
                    selectedDocument.textContent = title;
                }
                listOfDocuments.appendChild(item);
            }

            if (listOfDocuments.children.length === 1) {
                documentsSelector.classList.add(listOfDocumentsSimpleClass);
            } else {
                documentsSelector.classList.remove(listOfDocumentsSimpleClass);
            }

            if (listOfDocuments.children.length === 1 || !activeDocumentExist) {
                selectedDocument.textContent = defaultDocumentText || untitled_document;
            }
            if (!activeDocumentExist) {
                selectedDocument.textContent = defaultDocumentText || untitled_document;
                callbackFn(0);
            }
        }

        function setActiveDocumentId(activeFrameId) {
            const activeItem = listOfDocuments.querySelector(`li[data-frame-id="${activeFrameId}"]`);
            selectedDocument.textContent = activeItem.textContent;
        }
    }

};