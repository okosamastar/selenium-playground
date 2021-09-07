const utilsService = function () {
    const chromeRuntime = chrome.runtime;
    const headingsMapPort = chromeRuntime.connect({name: 'port-from-cs'});
    const htmlDirectoryURL = chrome.extension.getURL('html/');
    const DEFAULT_DEBOUNCED_TIME = 500;
    const TOP_MARGIN_ON_SCROLLING_TO = 60;
    const collapsableClass = 'collapsable';
    const collapseTriggerClass = 'collapse-trigger';
    const collapseTriggerCollapsedClass = 'collapsed';
    const expandedClass = 'expanded';
    const untitledDocumentText = 'Untitled document';
    const dataElementIdAttrName = 'data-element-id';
    const dataAnchorIdAttrName = 'data-anchor-id';
    const headerIdPrefix = 'headingsMap-';
    const anchorClass = 'anchor-icon';
    const anchorTitle = 'Click the icon to copy the anchor URL to clipboard';
    const isHeaderElement = doesElementMatchWithPattern('^H[1-6]$', {attribute: 'role', value: 'heading'});
    const isHgroupElement = doesElementMatchWithPattern('^HGROUP$');
    const isSectioningRoot = doesElementMatchWithPattern('^BLOCKQUOTE$|^BODY$|^DETAILS$|^DIALOG$|^FIELDSET$|^FIGURE$|^TD$');
    const isSectioningElement = doesElementMatchWithPattern('^ARTICLE$|^ASIDE$|^NAV$|^SECTION$');
    const visibleClass = 'visible';
    const hiddenClass = 'hidden-head';
    const KEYS = {
        ENTER: 'Enter',
        UP_ARROW: 'ArrowUp',
        DOWN_ARROW: 'ArrowDown',
        ESCAPE: 'Escape'
    };

    let currentHighlightedElement;

    return {
        createElement,
        createTextNode,
        getText,
        debounceFn,
        addMutationObserver,
        hiddenForA11y,
        getAsyncContent,
        appendAsyncContent,
        attachStyles,
        getSettings,
        sendMessageToBackgroundScript,
        html2json,
        json2html,
        htmlString2json,
        addCollapseBehaviorToTree,
        highlightElement,
        cleanHighlighted,
        scrollToDocumentTop,
        removeDataElementIdAttributes,
        getTitleForDocument,
        areEqual,
        getAriaLabel,
        getAriaLabelByIdRelatedContent,
        isVisibleForA11y,
        setClipboard,
        getAnchorFromElement,
        anchorClass,
        anchorTitle,
        getHeadings,
        getHeadingLevel,
        getHeadingInfo,
        dataElementIdAttrName,
        dataAnchorIdAttrName,
        isElementNode,
        headerIdPrefix,
        hasHiddenAttribute,
        isSectioningRoot,
        isSectioningElement,
        isHeaderElement,
        isHgroupElement,
        getLastItem,
        getVisibilityClass,
        capitalizeFirstLetter,
        keyboardHandler,
        addIntersectionObserver,
        disconnectIntersectionObserver
    };

    function createElement(tagName, attributes = {}, childNodes = [], events = []) {
        let newElement = document.createElement(tagName);

        for (let propertyName in attributes) {
            newElement.setAttribute(propertyName, attributes[propertyName]);
        }

        childNodes = Array.isArray(childNodes) ? childNodes : [childNodes];
        for (let i = 0; i < childNodes.length; i++) {
            if (typeof childNodes[i] === 'string' || typeof childNodes[i] === 'number') {
                let textNode = createTextNode(childNodes[i]);
                newElement.appendChild(textNode);
            } else {
                newElement.appendChild(childNodes[i]);
            }
        }

        events = Array.isArray(events) ? events : [events];
        for (let i = 0; i < events.length; i++) {
            const {name, callback} = events[i];
            newElement.addEventListener(name, callback);
        }

        return newElement
    }

    function createTextNode(text) {
        return document.createTextNode(text);
    }

    function getText(element, isElementVisibleFn = false) {
        if (isTextNode(element)) {
            return element.nodeValue;
        }

        let isElementVisible;
        if (typeof isElementVisibleFn === 'function') {
            isElementVisible = isElementVisibleFn(element);
        } else {
            isElementVisible = isElementVisibleFn;
        }

        if (isElementWithAltText(element) && isElementVisible) {
            return (element.getAttribute('alt') || '');
        }

        const childNodes = element.childNodes;
        const childNodesLength = childNodes.length;
        let text = '';
        for (let i = 0; i < childNodesLength; i++) {
            const node = childNodes[i];
            if (!isCommentNode(node) && isElementVisible) {
                text += getText(childNodes[i], isElementVisibleFn);
            }
        }

        return text.replace(/\n/g, ' ').replace(/\t/g, ' ').replace(/\s+/gi, ' ');

        function isElementWithAltText(element) {
            let tagName = element.tagName.toLowerCase();

            return (tagName === 'img' && element.getAttribute('src').indexOf('moz-extension://') !== 0)
                || tagName === 'area'
                || (tagName === 'input' && element.getAttribute('type').toLowerCase() === 'image');
        }
    }

    function isTextNode(node) {
        return node.nodeType === 3;
    }

    function isCommentNode(node) {
        return node.nodeType === 8;
    }

    function debounceFn(functionToDebounce, shouldExecuteAtTheBeginning, millisecondsToWait) {
        let timeout;

        return function () {
            let context = this;
            let args = arguments;
            let later = function () {
                timeout = null;
                if (!shouldExecuteAtTheBeginning) {
                    functionToDebounce.apply(context, args);
                }
            };

            const callNow = shouldExecuteAtTheBeginning && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, millisecondsToWait || DEFAULT_DEBOUNCED_TIME);
            if (callNow) {
                functionToDebounce.apply(context, args);
            }
        };
    }

    function addMutationObserver(elementToObserve, config, callback) {
        // Create an observer instance
        let observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(elementToObserve, config);

        return observer;
    }

    function hasHiddenAttribute(element) {
        return element && element.tagName && element.hasAttribute("hidden");
    }

    function hiddenForA11y(element) {
        return isElementNode(element) && !shouldConsiderElementForA11y(element);
    }

    function shouldConsiderElementForA11y(element) {
        let shouldBeConsidered = isVisibleForA11y(element);
        if (shouldBeConsidered && element.parentNode.tagName && element.parentNode.tagName.toLowerCase() !== 'body') {
            shouldBeConsidered = shouldConsiderElementForA11y(element.parentNode);
        }

        return shouldBeConsidered;
    }

    function isVisibleForA11y(element) {
        if (!isElementNode(element) || isScriptStyleIframe(element)) {
            return false;
        }
        const getComputedStyle = document.defaultView.getComputedStyle(element, null);
        return !hasHiddenAttribute(element)
            && (!element.attributes["aria-hidden"] || element.attributes["aria-hidden"].value !== 'true')
            && getComputedStyle.getPropertyValue('display') !== 'none'
            && getComputedStyle.getPropertyValue('visibility') !== 'hidden';
    }

    function isElementNode(element) {
        return element && element.nodeType === 1 && !isScriptStyleIframe(element);
    }

    function isScriptStyleIframe(element) {
        const tagName = element.tagName.toLowerCase();

        return tagName === 'script' || tagName === 'style' || tagName === 'iframe' || tagName === 'noscript';
    }

    function isRolePresentation(element) {
        const elementRole = element && element.attributes && element.attributes.role;
        return elementRole && elementRole.value === 'presentation';
    }

    function hasValidRole(element, role) {
        const elementRole = element.attributes.role;
        return !elementRole || (elementRole && elementRole.value === role);
    }

    function getAsyncContent(fileToGet, callback) {
        let request = new XMLHttpRequest();

        let url = chrome.extension.getURL(fileToGet);
        request.open('GET', url, true);
        request.responseType = 'json';
        request.onload = function () {
            if (request.readyState === 4 && request.status === 200) {
                callback(request.response);
            }
        };
        request.onerror = function (e) {
        };
        request.send(null);
    }

    function appendAsyncContent(documentToGet, container, onLoadCallback = false) {
        let request = new XMLHttpRequest();

        let url = htmlDirectoryURL + documentToGet;
        request.open('GET', url, true);
        request.responseType = 'document';
        request.onload = function () {
            if (request.readyState === 4 && request.status === 200) {
                const returnedDOM = request.responseXML.documentElement.querySelector('.dialog-content');
                const asJson = html2json(returnedDOM); // required because weird behavior in FF

                container.appendChild(json2html(asJson));
                onLoadCallback && onLoadCallback(container);
            }
        };
        request.onerror = function (e) {
        };
        request.send(null);
    }

    function attachStyles(CSSFiles, container, onLoadCallback = false, baseURL = htmlDirectoryURL) {
        CSSFiles = Array.isArray(CSSFiles) ? CSSFiles : [CSSFiles];
        const CSSFilesLength = CSSFiles.length;
        let stylesLoadedCounter = 0;
        for (let i = 0; i < CSSFilesLength; i++) {
            const httpRequest = new XMLHttpRequest();
            let url = `${baseURL}${CSSFiles[i]}.css`;

            httpRequest.open('GET', url, true);
            httpRequest.onload = () => {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status === 200) {
                        const styles = httpRequest.responseText.replace(/url\(/g, `url(${baseURL}`);
                        const CSSText = createTextNode(styles);
                        const styleElement = createElement('style', {}, CSSText);

                        container.appendChild(styleElement);

                        stylesLoadedCounter++
                        // only once all the files were loaded, execute the callback
                        if (stylesLoadedCounter === CSSFilesLength) {
                            onLoadCallback && onLoadCallback();
                        }
                    }
                }
            };
            httpRequest.onerror = (e) => {
            };
            httpRequest.send(null);
        }
    }

    function getSettings(settingsKeys, callback) {
        // Chrome: chrome.storage.local.get uses a callback
        let savedSettings = chrome.storage.local.get(settingsKeys, callback);

        try {
            // FF: chrome.storage.local.get returns a promise
            // this try-catch prevents error in Chrome
            savedSettings.then(callback);
        } catch (err) {
        }
    }

    function sendMessageToBackgroundScript(message) {
        headingsMapPort.postMessage(message);
    }

    function textElem(element) {
        return {
            type: 'text',
            textContent: element.textContent
        };
    }

    function html2json(element) {
        return {
            type: 'element',
            tagName: element.tagName,
            attributes: mapAttributes(element.attributes),
            children: Array.from(element.childNodes, fromNode)
        };
    }

    function htmlString2json(htmlString) {
        const template = createElement('div')
        template.insertAdjacentHTML('beforeend', htmlString);

        return html2json(template.firstChild);
    }

    function json2html(jsonObject) {
        let htmlElement;
        const type = jsonObject.type;
        const tagName = jsonObject.tagName;
        const attributes = jsonObject.attributes;
        const children = jsonObject.children || [];
        const textContent = jsonObject.textContent;

        if (type === 'element') {
            htmlElement = createElement(tagName, attributes, children.map(json2html));
        } else {
            htmlElement = createTextNode(textContent);
        }

        return htmlElement;
    }

    function mapAttributes(attributes) {
        let mappedAttributes = {};

        for (let i = 0; i < attributes.length; i++) {
            mappedAttributes[attributes[i].name] = attributes[i].value;
        }
        return mappedAttributes;
    }

    function fromNode(e) {
        switch (e.nodeType) {
            case 3:
                return textElem(e);
            default:
                return html2json(e);
        }
    }

    function addCollapseBehaviorToTree(tree) {
        let treeLists = tree.querySelectorAll('.results ul ul, .results ol ol');
        let treeListsLength = treeLists.length;
        for (let i = 0; i < treeListsLength; i++) {
            let isListCollapsed = treeLists[i].style.display === 'none';
            let collapseTrigger = createElement('span', {
                'class': collapseTriggerClass + (!isListCollapsed ? '' : (' ' + collapseTriggerCollapsedClass)),
                'aria-label': i18n.collapseTreeNode
            });
            collapseTrigger.addEventListener('click', toggleListHandler);
            treeLists[i].parentNode.insertBefore(collapseTrigger, treeLists[i]);
            collapseTrigger.parentNode.classList.add(collapsableClass);
            let listToToggle = collapseTrigger.nextSibling;
            listToToggle.classList.add(expandedClass);
        }

        function toggleListHandler(event) {
            let collapseTrigger = event.target;
            let listToToggle = collapseTrigger.nextSibling;
            toggleList(listToToggle, collapseTrigger)
        }
    }

    function toggleList(list, collapser) {
        if (list.style.display === 'none') {
            list.style.display = 'block';
            list.classList.add(expandedClass);
            collapser.classList.remove(collapseTriggerCollapsedClass);
            collapser.setAttribute('aria-label', i18n.collapseTreeNode);
        } else {
            list.style.display = 'none';
            list.classList.remove(expandedClass);
            collapser.classList.add(collapseTriggerCollapsedClass);
            collapser.setAttribute('aria-label', i18n.expandTreeNode);
        }
    }

    function highlightElement(params) {
        let elementId = params.elementId;
        cleanHighlighted();

        currentHighlightedElement = window.document.querySelector(`*[${dataElementIdAttrName}=${elementId}]`);

        if (currentHighlightedElement) {
            scrollTo(currentHighlightedElement);
            if (params.highLightElement) {
                highlightElement(currentHighlightedElement);
            }
        }

        return currentHighlightedElement;

        // this function updates the style because if it updates the class value,
        // the mutationObserver detects a change
        function highlightElement(element) {
            if (!element) {
                return
            }
            element.setAttribute('data-headingsMap-highlight', 'true');
        }
    }

    function cleanHighlighted() {
        let highlightedElements = window.document.querySelectorAll('*[data-headingsMap-highlight]');

        highlightedElements.forEach(function (element) {
            element.removeAttribute('data-headingsMap-highlight');
        });
    }

    function scrollToDocumentTop() {
        scrollTo(window.document.body, {block: 'start'});
    }

    function scrollTo(element, options = {}) {
        element.scrollIntoView(options);

        const topPosition = getTopPosition(element) - TOP_MARGIN_ON_SCROLLING_TO;
        window.document.documentElement.scrollTop = topPosition;
        // for compatibility reasons, this is required as well
        window.document.body.scrollTop = topPosition;
    }

    function getTopPosition(element) {
        // distance of the current element relative to the top of the offsetParent node
        let topPosition = element.offsetTop;

        while (element.tagName.toLowerCase() !== 'body') {
            // reference to the object which is the closest positioned containing element
            element = element.offsetParent;

            if (element === null) {
                break;
            }

            topPosition += element.offsetTop;
        }

        return topPosition;
    }

    function removeDataElementIdAttributes() {
        let headingElements = document.querySelectorAll('*[data-element-id]');
        let headingElementsLength = headingElements.length;

        for (let i = 0; i < headingElementsLength; i++) {
            headingElements[i].removeAttribute('data-element-id');
        }
    }

    function getTitleForDocument(shouldShowLocationHref = false) {
        const documentToCheck = window.document;
        const titleElements = documentToCheck.querySelectorAll('title');
        const titleElement = titleElements.length ? documentToCheck.querySelectorAll('title')[0] : false;

        let titleText = titleElement ? titleElement.text : '';

        if (titleText.trim() === '') {
            const locationHref = window.location.href;
            titleText = !shouldShowLocationHref ? untitledDocumentText : locationHref;
        }

        return titleText;
    }

    function areEqual(objectA, objectB) {
        if (typeof (objectA) !== typeof (objectB)) {
            return false;
        }

        for (let key in objectA) {
            if (objectA.hasOwnProperty(key) !== objectB.hasOwnProperty(key)) {
                return false;
            }

            switch (typeof (objectA[key])) {
                case 'object':
                    if (!areEqual(objectA[key], objectB[key])) {
                        return false;
                    }
                    break;
                case 'function':
                    if (typeof (objectB[key]) === 'undefined'
                        || (objectA[key].toString() !== objectB[key].toString())) {
                        return false;
                    }
                    break;
                default:
                    if (objectA[key] !== objectB[key]) {
                        return false;
                    }
            }
        }

        for (let key in objectB) {
            if (typeof (objectA[key]) === 'undefined') {
                return false;
            }
        }
        return true;
    }

    function getHeadings(root, settings) {
        const {showHiddenHeaders} = settings;
        const HTMLHeadersQuerySelector = 'h1, h2, h3, h4, h5, h6';
        const ariaHeadersQuerySelector = '*[role=heading]';
        const querySelector = HTMLHeadersQuerySelector + ',' + ariaHeadersQuerySelector;
        const allHeadingElements = root.querySelectorAll(querySelector);
        const headingElements = [];
        allHeadingElements.forEach((header, index) => {
            header.setAttribute(dataElementIdAttrName, headerIdPrefix + index);

            if (hasValidRole(header, 'heading')) {
                const isVisible = !hiddenForA11y(header) && !hasHiddenAttribute(header);
                if (isVisible || showHiddenHeaders) {
                    const heading = {
                        header,
                        isVisible
                    }
                    headingElements.push(heading);
                }
            }
        });

        return headingElements;
    }

    function getHeadingInfo(element, settings) {
        const roleAttribute = element.attributes['role'];
        const tagName = element.tagName.toUpperCase();

        if (tagName !== 'HGROUP' || !settings.considerHgroup) {
            const level = getAriaLevel(element);
            return {level, tagName, ariaLevel: true, headingRole: roleAttribute && roleAttribute.value};
        } else {
            const hgroupHeaders = getHeadings(element, settings);
            const levels = [];
            hgroupHeaders.forEach((hgroupHeader) => {
                levels.push(getHeadingInfo(hgroupHeader.header, settings));
            });

            hgroupHeaders.sort(function (a, b) {
                return a.level - b.level;
            });

            return hgroupHeaders[0] || null;
        }
    }


    function getHeadingLevel(element, settings) {
        const tagName = element.tagName.toUpperCase();

        if (tagName !== 'HGROUP' || !settings.considerHgroup) {
            return getAriaLevel(element);
        } else {
            const hgroupHeaders = getHeadings(element, settings);
            const levels = [];
            hgroupHeaders.forEach((hgroupHeader) => {
                levels.push(getHeadingLevel(hgroupHeader.header, settings));
            });

            return levels.length ? Math.min(...levels) : null;
        }
    }

    function getAriaLevel(node) {
        const ariaLevelAttribute = node.attributes['aria-level'];
        const ariaLevelAttributeValue = ariaLevelAttribute && parseInt(ariaLevelAttribute.value);
        const isAriaLevelValid = ariaLevelAttributeValue >= 0;
        const tagName = node.tagName;
        const isHeaderTag = tagName && (new RegExp('^H[1-6]$', 'i')).test(tagName.toUpperCase());

        return isAriaLevelValid ? ariaLevelAttributeValue : (isHeaderTag ? parseInt(tagName.substr(1)) : 2);
    }

    function getAriaLabel(element) {
        return element.getAttribute('aria-label') || false;
    }

    function getAriaLabelByIdRelatedContent(element) {
        const ariaLabelledById = element.getAttribute('aria-labelledby');
        let extractedTextFromElements = '';
        if (ariaLabelledById) {
            const ariaLabelledByIdValues = ariaLabelledById.split(' ');
            ariaLabelledByIdValues.forEach((idValue, index) => {
                const ariaLabelledReferenceElement = window.document.getElementById(idValue);
                if (ariaLabelledReferenceElement) {
                    if (index) {
                        extractedTextFromElements += ' ';
                    }
                    extractedTextFromElements += getText(ariaLabelledReferenceElement, true);
                }
            });
        }

        return extractedTextFromElements;
    }

    function setClipboard(text) {
        try {
            navigator.clipboard.writeText(text);
        } catch (err) {
            const temp = createElement('input');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand("copy");
            temp.remove();
        }
    }

    function getAnchorFromElement(element) {
        let anchorRef = element.getAttribute('id') || element.getAttribute('name');

        if (!anchorRef) {
            const childNodes = element.children;
            const childNodesLength = childNodes.length;
            for (let i = 0; i < childNodesLength; i++) {
                anchorRef = getAnchorFromElement(childNodes[i]);
                if (anchorRef) {
                    break;
                }
            }
        }
        return anchorRef;
    }

    function doesElementMatchWithPattern(pattern, attributeObject) {
        return function (nodeElement) {
            if(isRolePresentation(nodeElement)){
                return false;
            }
            const doesMatchPattern = nodeElement && nodeElement.tagName && (new RegExp(pattern, 'i')).test(nodeElement.tagName.toUpperCase());

            if (!doesMatchPattern && attributeObject) {
                const {attribute, value} = attributeObject;
                return nodeElement && attribute && value && nodeElement.getAttribute && nodeElement.getAttribute(attribute) && nodeElement.getAttribute(attribute) === value;
            }

            return doesMatchPattern;
        }
    }

    function getLastItem(arrayOfItems) {
        return arrayOfItems[arrayOfItems.length - 1]
    }

    function getVisibilityClass(isVisible) {
        return isVisible ? visibleClass : hiddenClass;
    }

    function capitalizeFirstLetter(string) {
        return string[0].toUpperCase() + string.slice(1);
    }

    function keyboardHandler(callback, tooltip) {
        return (event) => {
            const keyCode = event.key;
            if (keyCode !== KEYS.DOWN_ARROW && keyCode !== KEYS.UP_ARROW && keyCode !== KEYS.ENTER && keyCode !== KEYS.ESCAPE) {
                return;
            }
            event.preventDefault();

            const target = event.target;
            const currentItem = target.closest('li');

            const isCollapsable = isCollapsableElement(currentItem);
            switch (keyCode) {
                case KEYS.DOWN_ARROW:
                    let nextItem = currentItem.nextSibling;
                    if (isCollapsable) {
                        const descendantList = currentItem.querySelector(`ul`)

                        nextItem = isExpanded(descendantList) ? descendantList.firstChild : currentItem.nextSibling;
                    }
                    if (!nextItem) {
                        let closestItem = currentItem.closest('li');
                        while (closestItem && closestItem.closest('li') && !nextItem) {
                            nextItem = closestItem.closest('li').nextSibling;
                            if (!nextItem) {
                                closestItem = closestItem.parentNode.closest('li');
                            }
                        }
                    }

                    nextItem && nextItem.querySelector('a').focus();
                    break;
                case KEYS.UP_ARROW:
                    let prevItem = currentItem.previousSibling;
                    let isPreviousExpanded;

                    while (prevItem && isCollapsableElement(prevItem) && isExpanded(prevItem.querySelector(`ul`))) {
                        prevItem = prevItem.querySelector(`ul`).lastChild;
                        if (isCollapsableElement(prevItem)) {
                            isPreviousExpanded = isExpanded(prevItem.querySelector(`ul`));
                            if (isPreviousExpanded) {
                                const descendantList = prevItem.querySelector(`ul.${expandedClass}:last-child`);
                                if (descendantList) {
                                    const items = descendantList.lastChild;
                                    const itemsLength = items.length;
                                    prevItem = itemsLength ? items[itemsLength - 1] : prevItem;
                                }
                            }
                        }
                    }
                    if (!prevItem) {
                        prevItem = currentItem.closest('ul').closest('li');
                    }
                    prevItem && prevItem.querySelector('a').focus();
                    break;
                case KEYS.ENTER:
                    callback && callback(event);

                    if (isCollapsable) {
                        const nestedList = currentItem.querySelector('ul');
                        const collapser = currentItem.querySelector('.collapse-trigger');

                        toggleList(nestedList, collapser)
                    }
                    break;
                case KEYS.ESCAPE:
                    tooltip && tooltip.hide()();
                    break;
                default:
                    return;
            }
        }
    }

    function isCollapsableElement(element) {
        return element.classList.contains(collapsableClass);
    }

    function isExpanded(element) {
        return element.classList.contains(expandedClass);
    }

    function addIntersectionObserver(elementsToObserve, callbackFn = () => {
    }) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                const elementId = entry.target.getAttribute('data-element-id');
                if (!elementId) {
                    observer.unobserve(entry.target);
                    return;
                }
                const isInViewport = entry.intersectionRatio > 0;
                const intersectionRatio = entry.intersectionRatio;
                callbackFn({elementId, isInViewport, intersectionRatio});

            }, {threshold: 1});
        });

        elementsToObserve.forEach((element) => {
            observer.observe(element);
        });

        return observer;
    }

    function disconnectIntersectionObserver(intersectionObserver) {
        intersectionObserver.disconnect();
    }
};