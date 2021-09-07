let i18n = {};
let language = '';
let browserLanguage = '';
let defaultLanguage = 'en';

(function () {
    const chromeRuntime = chrome.runtime;
    const baseURL = chrome.extension.getURL('html/');
    const SETTING_PROPERTIES = {
        showHeadLevels: {defaultValue: true, cssClass: 'show-head-levels'},
        showHeadError: {defaultValue: true, cssClass: 'show-error'},
        showHeadErrorH1: {defaultValue: true, cssClass: 'show-head-error-h1'},
        showOutLevels: {defaultValue: true, cssClass: 'show-out-levels'},
        showOutElem: {defaultValue: true, cssClass: 'show-section'},
        darkTheme: {defaultValue: true, cssClass: 'dark-theme'},
        isOutlineTestActive: {defaultValue: false, cssClass: 'is-outline-test-active'},
        showHiddenHeaders: {defaultValue: false, cssClass: 'show-hidden-headers'},
        showHiddenSections: {defaultValue: false, cssClass: 'show-hidden-sections'},
        showAriaLabelContent: {defaultValue: false, cssClass: 'show-aria-label-content'},
        showAnchors: {defaultValue: true, cssClass: 'show-anchors'},
        position: {defaultValue: 'left'},
        leftPosition: {defaultValue: true},
        savePanelWidthOnResize: {defaultValue: false},
        initialPanelWidth: {defaultValue: 350},
        widgetVersion: {},
        highLightElements: {defaultValue: true},
        normalWrap: {defaultValue: false, cssClass: 'normal-wrap'},
        considerHgroup: {defaultValue: true},
        showTooltip: {defaultValue: false},
        viewportIndicator: {defaultValue: false},
        language: {defaultValue: 'en'}
    };

    const languages = [{code: 'es', description: 'español'}, {code: 'en', description: 'english'}];

    const MIN_WIDGET_WIDTH = 200;
    const INITIAL_WIDGET_WIDTH = 350;
    const extensionTitleId = 'extension_title';
    const tabs = [
        {tabId: 'headingsTab', tabTex: 'headersTab', analysis: 'headingsMap', width: '48%'},
        {tabId: 'outlineTab', tabTex: 'outlineTab', analysis: 'HTML5Outline', width: '48%'}
    ];

    const defaultTabIndex = 0;
    const headingsMapActiveAttribute = 'data-headings-map-active';
    const headingsMapWidgetId = 'headingsMapPanel';
    const headingsMapWrapperId = 'headingsMapWrapper';
    const utilsBarId = 'utilsId';
    const menuId = 'main-menu';
    const menuListId = 'main-menu-list';
    const menuButtonId = 'menu-link';
    const refreshLinkId = 'headingsMap_refresh';
    const settingsLinkId = 'headingsMap_settings';
    const releaseNotesLinkId = 'headingsMap_release_notes';
    const helpLinkId = 'help';
    const privacyPolicyLinkId = 'headingsMap_privacy_policy';
    const contributeLinkId = 'contribute';
    const closeLinkClass = 'headingsMap_closer';
    const tabPanelsContainerClass = 'tabs-container';
    const tabLinksId = 'tabLinksId';
    const slidingDialogId = 'sliding_dialog_panel';
    const settingsId = 'settings_form';
    const helpPanelId = 'help_panel';
    const contributePanelId = 'contribute_panel';
    const privacyPolicyPanelId = 'privacy_policy';
    const releaseNotesId = 'release_notes';
    const darkThemeClass = 'dark-theme';
    const activeStatusClass = 'active';
    const spinnerClass = 'spinner';
    const resultsPanelClass = 'panel-results';
    const resultsClass = 'results';
    const customScrollbarClass = 'custom-scrollbar';
    const resultsContainerClass = customScrollbarClass;
    const dialogWrapperClass = 'dialog ' + customScrollbarClass;
    const actionButtonClass = 'action-button';
    const tabClass = 'tab-button';
    const menuItemClass = 'menu-item';
    const dialogActiveClass = 'dialog-active';
    const newsActiveClass = 'news-active';
    const RESIZER_CLASS = 'headingsMap-resizer';
    const headingsMapBodyClass = 'headingsMap-body';
    const visibilityLegendClass = 'visibility-legend';
    const counterClass = 'counter';
    const visibleElementsCounterClass = 'visibleElementsCounter';
    const hiddenElementsCounterClass = 'hiddenElementsCounter';
    const activeElementClass = 'active-element';
    const body = document.body;
    const bodyStyle = body.style;
    const bodyParent = body.parentNode;
    const initialMarginLeft = body.style.marginLeft;

    let shadowRoot;
    let forceResultsLoad = true;
    let menu;
    let documentsSelector;
    let spinner;
    let activeTab;
    let widgetPanel;
    let headingsMapBody;
    let dialogContainer;
    let resizer;
    let activeFrameId;
    let widgetVersion;
    let counterLegend;
    let activeNews = false;

    let bodyStyleAttribute;
    let bodyPosition;
    let bodyWidth;
    let bodyMarginLeft;
    let bodyMarginRight;

    let settings = SETTING_PROPERTIES;
    let withSpinner = true;
    let previousResult = {};

    let tooltip;

    let dataHeadingsMapActiveObserver;
    let intersectionObserver;

    const widgetActions = {
        'toggle': toggleWidget,
        'update': refresh,
        updateListOfDocuments,
        showResultsFromFrame,
        openWidget,
        initializeWidget
    };

    const {
        createResizer,
        removeResizer,
        updatePanelPosition,
        getCurrentWidth
    } = resizerService(RESIZER_CLASS);

    const {
        createDocumentSelector
    } = documentSelectorService();

    const {
        createElement,
        createTextNode,
        getAsyncContent,
        appendAsyncContent,
        attachStyles,
        getSettings,
        sendMessageToBackgroundScript,
        json2html,
        addCollapseBehaviorToTree,
        areEqual,
        addMutationObserver,
        setClipboard,
        dataElementIdAttrName,
        anchorClass,
        dataAnchorIdAttrName,
        capitalizeFirstLetter,
        getVisibilityClass,
        keyboardHandler,
        addIntersectionObserver,
        disconnectIntersectionObserver
    } = utilsService();

    const {
        Tooltip,
        tooltipDataSetPrefix
    } = tooltipService();

    chromeRuntime.onMessage.addListener((message, sender, sendResponse) => {
        sendResponse('executed'); // the content of the response is not important in this case specific line
        let defaultSettings = {};
        let messageAction = message.action;
        let messageParams = message.params;

        if (messageAction === 'test') {
            return;
        }

        for (let key in SETTING_PROPERTIES) {
            defaultSettings[key] = SETTING_PROPERTIES[key].defaultValue;
        }

        const settingsKeys = Object.keys(SETTING_PROPERTIES);
        getSettings(settingsKeys, executeWidgetAction);

        function executeWidgetAction(savedSettings) {
            settings = Object.assign({}, defaultSettings, savedSettings);

            const isOutlineTestActive = settings.isOutlineTestActive;

            activeTab = (!isOutlineTestActive && localStorage['headingsMap_selectedTab'] === 'outlineTab'
                || !localStorage['headingsMap_selectedTab']) ? tabs[defaultTabIndex].tabId : localStorage['headingsMap_selectedTab'];
            localStorage['headingsMap_selectedTab'] = activeTab;

            widgetActions[messageAction] && widgetActions[messageAction](messageParams);
        }
    });

    function initializeWidget(params) {
        setTranslations(params, (translations) => {
            setTranslationKeys(translations);
            openWidget();
        });
    }

    function setTranslations(params, callback) {
        browserLanguage = params.browserLanguage;
        language = settings.language || browserLanguage;
        const isValid = !!languages.find((lang) => lang.code === language);
        if (!isValid) {
            language = defaultLanguage;
        }
        getAsyncContent(`_locales/${language}/messages.json`, callback);
    }

    function setTranslationKeys(translations) {
        Object.entries(translations).forEach(([key, value]) => {
            i18n[key] = value.message;
        });
    }

    function initialize() {
        sendMessageToBackgroundScript({
            action: 'initialize',
            params: {}
        });
    }

    function updateListOfDocuments(params) {
        documentsSelector.updateListOfDocuments(params.documents, activeFrameId);
    }

    function requestAnalysisForFrameId(frameId, settings, activeTab) {
        const analysis = tabs.filter(tab => {
            return tab.tabId === activeTab;
        })[0].analysis;

        sendMessageToBackgroundScript({
            action: 'getHeadingsMapFromFrame',
            params: {frameId: frameId, settings, analysis}
        });
    }

    function showResultsFromFrame(params) {
        activeFrameId = params.frameId;
        const analysis = params.analysis;
        const headingsStructure = params.headingsStructure;
        if (!forceResultsLoad && areEqual(headingsStructure, previousResult)) {
            return;
        }

        const results = json2html(headingsStructure);
        previousResult = params.headingsStructure;

        const tabId = tabs.filter(tab => {
            return tab.analysis === analysis;
        })[0].tabId;
        const panel = headingsMapBody.querySelector('*[data-panel-id=' + tabId + ']');

        removePreviousResults();

        panel.appendChild(results);

        addCollapseBehaviorToTree(results);

        let sectionHeader = results.querySelector('h2');
        sectionHeader.onclick = () => {
            sendMessageToBackgroundScript({action: 'scrollFrameDocumentToTop', params: {frameId: activeFrameId}});
        };

        const linksInTree = results.querySelectorAll('a');
        const visibilityClassValue = getVisibilityClass(true);
        const visibleCounter = results.querySelectorAll(`a.${visibilityClassValue}`).length;
        const hiddenCounter = linksInTree.length - visibleCounter;

        setLinksBehaviors(settings);
        let anchorsInTree = results.querySelectorAll(`.${anchorClass}`);
        let anchorsInTreeLength = anchorsInTree.length;
        for (let i = 0; i < anchorsInTreeLength; i++) {
            const href = anchorsInTree[i].getAttribute(dataAnchorIdAttrName);
            anchorsInTree[i].addEventListener('click', (clickEvent) => {
                setClipboard(href);
                clickEvent.stopPropagation();
                clickEvent.preventDefault();
            }, false);
        }

        counterLegend.updateCounters(visibleCounter, hiddenCounter);

        forceResultsLoad = false;

        if (intersectionObserver) {
            disconnectIntersectionObserver(intersectionObserver);
        }
        if (settings.viewportIndicator) {
            const headingsToObserve = document.querySelectorAll(`*[${dataElementIdAttrName}]`);
            intersectionObserver = addIntersectionObserver(headingsToObserve, callbackFn);
        }
    }

    function callbackFn(intersectionData) {
        const {elementId, isInViewport, intersectionRatio} = intersectionData;
        const elementInTree = headingsMapBody.querySelector(`*[${dataElementIdAttrName}=${elementId}]`);
        if (!elementInTree) {
            return;
        }
        if (isInViewport) {
            elementInTree.classList.add(activeElementClass);
            return
        }
        elementInTree.classList.remove(activeElementClass);
    }

    function setLinksBehaviors() {
        const linksInTree = headingsMapBody.querySelectorAll('.panel-results li a');
        const showTooltip = settings.showTooltip;

        const linksInTreeLength = linksInTree.length;
        for (let i = 0; i < linksInTreeLength; i++) {
            const link = linksInTree[i];

            // The function is executed when updated settings so the links
            // could already have the onclick already defined
            if (!link.onclick) {
                link.onclick = (event) => {
                    event.preventDefault();
                };
            }

            if (!link.onfocus) {
                link.onfocus = onFocusHandler;
            }

            if (!link.onblur) {
                link.onblur = tooltip.hide(link);
            }

            link.onkeydown = keyboardHandler(highlightElementInFrame, tooltip);

            if (showTooltip) {
                link.onmouseover = tooltip.show(link);
                link.onmousemove = tooltip.follow(link);
                link.onmouseout = tooltip.hide(link);
                const elementsWithTitle = link.querySelectorAll('*[title]');
                [...elementsWithTitle, link].forEach((element) => {
                    if (element.getAttribute('title')) {
                        element.setAttribute(`data-${tooltipDataSetPrefix}`, element.getAttribute('title'));
                        element.removeAttribute('title');
                    }
                })
            } else {
                link.onmouseover = () => {
                };
                link.onmousemove = () => {
                };
                link.onmouseout = () => {
                };
                const elementsWithTitle = link.querySelectorAll(`*[data-${tooltipDataSetPrefix}]`);
                [...elementsWithTitle, link].forEach((element) => {
                    if (element.getAttribute(`data-${tooltipDataSetPrefix}`)) {
                        element.setAttribute('title', element.getAttribute(`data-${tooltipDataSetPrefix}`));
                        element.removeAttribute(`data-${tooltipDataSetPrefix}`);
                    }
                })
                link.removeAttribute('aria-labelledby')
            }
        }
    }

    function onFocusHandler(event) {
        const showTooltip = settings.showTooltip;
        highlightElementInFrame(event);
        if (showTooltip) {
            tooltip.show(event.target)(event);
        }
    }

    function highlightElementInFrame(event) {
        const target = event.target;
        const elementId = target.getAttribute(dataElementIdAttrName) || target.parentNode.getAttribute(dataElementIdAttrName);
        const highLightElement = settings.highLightElements;
        event.preventDefault();

        sendMessageToBackgroundScript({
            action: 'highlightElementInFrame',
            params: {frameId: activeFrameId, elementId, highLightElement}
        });
    }

    function getResultsCurrentFrame(analysis) {
        sendMessageToBackgroundScript({
            action: 'getHeadingsMapFromFrame',
            params: {frameId: activeFrameId, settings, analysis}
        });
    }

    function switchTab(panelToShow) {
        if (withSpinner) {
            spinner.classList.add(activeStatusClass);
        }
        let analysis = tabs[defaultTabIndex].analysis;

        tabs.forEach((tab) => {
            const tabId = tab.tabId;
            const tabLink = headingsMapBody.querySelector('*[data-tab-id=' + tabId + ']');
            const tabPanel = headingsMapBody.querySelector('*[data-panel-id=' + tabId + ']');

            if (tab.tabId === panelToShow) {
                tabLink.classList.add(activeStatusClass);
                tabPanel.classList.add(activeStatusClass);
                tabLink.setAttribute('tabindex', '0');
                tabLink.setAttribute('aria-selected', 'true');
                analysis = tab.analysis;
            } else {
                tabLink.classList.remove(activeStatusClass);
                tabPanel.classList.remove(activeStatusClass);
                tabLink.setAttribute('tabindex', '-1');
                tabLink.setAttribute('aria-selected', 'false');
            }
            headingsMapBody.setAttribute('data-active', `${panelToShow}`)
        });

        activeTab = panelToShow;
        localStorage['headingsMap_selectedTab'] = panelToShow;

        setTimeout(function () {
            getResultsCurrentFrame(analysis);
            spinner.classList.remove(activeStatusClass);
            withSpinner = true;
        }, 0);
    }

    function openWidget() {
        widgetPanel = createWidgetPanel();

        sendMessageToBackgroundScript('getDocumentList');
        previousResult = {};

        // there are websites that work as SPA and the attribute disappears, so if the widget is open,
        // when the change happens, it checks it and recovers it if needed
        dataHeadingsMapActiveObserver = addMutationObserver(bodyParent, {
            childList: false,
            subtree: false,
            attributes: true,
            attributeFilter: [headingsMapActiveAttribute]
        }, resetAttribute);

        function resetAttribute() {
            const dataHeadingsMapActive = bodyParent.getAttribute(headingsMapActiveAttribute);

            if (dataHeadingsMapActive !== 'true') {
                bodyParent.setAttribute(headingsMapActiveAttribute, 'true');
            }
        }
    }

    function closeWidget() {
        previousResult = {};
        sendMessageToBackgroundScript('closeWidget');

        let widget = document.getElementById(headingsMapWidgetId);
        let widgetParent = widget.parentNode;

        widgetParent.removeChild(widget);
        body.style.marginLeft = initialMarginLeft;
        widgetParent.removeAttribute(headingsMapActiveAttribute);
        removeResizer();
        recoverBodyStyles();

        dataHeadingsMapActiveObserver && dataHeadingsMapActiveObserver.disconnect();
        if (intersectionObserver) {
            disconnectIntersectionObserver(intersectionObserver);
        }
    }

    function toggleWidget() {
        let isItOpen = document.getElementById(headingsMapWidgetId);

        if (!isItOpen) {
            activeFrameId = 0;
            initialize();
        } else {
            closeWidget();
        }
    }

    function setBodyStyles() {
        bodyStyleAttribute = body.getAttribute('style');
        bodyPosition = window.getComputedStyle(body, null).getPropertyValue('position');
        bodyWidth = window.getComputedStyle(body, null).getPropertyValue('width');
        bodyMarginLeft = window.getComputedStyle(body, null).getPropertyValue('margin-left');
        bodyMarginRight = window.getComputedStyle(body, null).getPropertyValue('margin-right');

        body.style.position = 'relative';
        body.style.width = 'auto';
    }

    function recoverBodyStyles() {
        body.style.position = bodyPosition;
        body.style.width = bodyWidth;
        body.style.marginLeft = bodyMarginLeft;
        body.style.marginRight = bodyMarginRight;

        if (bodyStyleAttribute) {
            body.setAttribute('style', bodyStyleAttribute);
        } else {
            body.removeAttribute('style');
        }
    }

    function createWidgetPanel() {
        setBodyStyles();
        let widgetPanel = createElement('headings-map', {
            'id': headingsMapWidgetId,
            'dir': 'rtl'
        });
        shadowRoot = widgetPanel.attachShadow({mode: 'closed'});

        const panelWidth = settings.savePanelWidthOnResize ? (settings.initialPanelWidth || INITIAL_WIDGET_WIDTH) : INITIAL_WIDGET_WIDTH;

        headingsMapBody = createElement('div', {class: headingsMapBodyClass});

        headingsMapBody.style.width = panelWidth + 'px';
        if (settings.leftPosition) {
            headingsMapBody.style.left = '0';
            body.style.marginLeft = panelWidth + 'px';
        } else {
            headingsMapBody.style.right = '0';
            body.style.marginRight = panelWidth + 'px';
        }

        bodyParent.insertBefore(widgetPanel, body);
        bodyParent.setAttribute(headingsMapActiveAttribute, 'true');

        shadowRoot.appendChild(headingsMapBody)
        headingsMapBody.addEventListener('keydown', (keydownEvent) => {
            const key = keydownEvent.key;
            if (key === 'Escape') {
                closeDialogPanel();
            }
        });

        const mainWrapper = createElement('div', {'id': headingsMapWrapperId});
        headingsMapBody.appendChild(mainWrapper);

        for (let optionId in settings) {
            updateBodyParentTagClassFromSettings(optionId, settings[optionId]);
        }

        const {title, utilsBar, tabPanels, dialogWrapper, documentsSelectorCombo} = generateMainStructure();

        documentsSelector = documentsSelectorCombo;

        dialogContainer = dialogWrapper;

        headingsMapBody.addEventListener('click', () => {
            menu.close();
            documentsSelector.close();
        });

        headingsMapBody.addEventListener('keydown', (keydownEvent) => {
            const key = keydownEvent.key;
            if (key === 'Escape') {
                menu.close();
                documentsSelector.close();
            }
        });

        spinner = createElement('div', {'class': spinnerClass + ' ' + activeStatusClass});

        attachStyles(['css/basicStyles', 'themes/bright/theme', 'themes/dark/theme', 'css/scrollBars', 'css/tooltip'], headingsMapBody, appendAllElements, baseURL);

        resizer = createResizer(headingsMapBody, settings.leftPosition, MIN_WIDGET_WIDTH, (width, position) => {
            bodyStyle[`margin${capitalizeFirstLetter(position)}`] = width + 'px';
            bodyStyle[position === 'left' ? 'marginRight' : 'marginLeft'] = 'auto';

            if (settings.savePanelWidthOnResize) {
                save('initialPanelWidth', width);
            }
        });

        tooltip = new Tooltip(headingsMapBody);

        function appendAllElements() {
            mainWrapper.appendChild(title);
            mainWrapper.appendChild(utilsBar);
            mainWrapper.appendChild(documentsSelector);
            mainWrapper.appendChild(tabPanels);
            mainWrapper.appendChild(spinner);
            headingsMapBody.appendChild(resizer);
            headingsMapBody.appendChild(dialogContainer);
            updatePanelPosition(settings.leftPosition);
            refresh();
            return widgetPanel;
        }

        function generateMainStructure() {
            let titleText = createTextNode(i18n.extensionName);
            let title = createElement('h1', {'id': extensionTitleId}, titleText);

            let utilsBar = createElement('div', {'id': utilsBarId});

            const menuItems = [
                {id: helpLinkId, label: i18n.helpLabel, 'class': actionButtonClass, callback: openHelpPanel},
                {
                    id: settingsLinkId,
                    label: i18n.settingsMenuLink,
                    'class': actionButtonClass,
                    callback: openSettingsPanel
                },
                //{id: refreshLinkId, label: i18n.refreshResultsMenuLink, 'class': actionButtonClass, callback: refresh},
                {
                    id: releaseNotesLinkId,
                    label: i18n.releaseNotesMenuLink,
                    'class': actionButtonClass,
                    callback: openReleaseNotesPanel
                },
                {
                    id: privacyPolicyLinkId,
                    label: i18n.privacyPolicyMenuLink,
                    'class': actionButtonClass,
                    callback: openPrivacyPolicyPanel
                },
                {
                    id: contributeLinkId,
                    label: i18n.contributeMenuLink,
                    'class': actionButtonClass,
                    callback: openContributionPanel
                },
            ];
            menu = createMenu(menuItems);
            utilsBar.appendChild(menu);

            const closeLink = createElement('button', {
                'class': closeLinkClass + ' ' + actionButtonClass,
                'aria-label': i18n.closeButtonAriaLabel
            });
            closeLink.onclick = closeWidget;
            utilsBar.appendChild(closeLink);

            const tabPanels = createTabPanels();
            const dialogWrapper = createElement('div', {'id': slidingDialogId, 'class': dialogWrapperClass});

            const closingPanelButton = createElement('button', {
                'class': 'headingsMap_closer dialog-closer',
                'title': i18n.closeButton
            });

            closingPanelButton.onclick = closeDialogPanel;

            dialogWrapper.appendChild(closingPanelButton);

            createSettingsPanel(dialogWrapper);
            createHelpPanel(dialogWrapper);
            createReleaseNotesPanel(dialogWrapper);
            createPrivacyPolicyPanel(dialogWrapper);
            createContributionPanel(dialogWrapper);

            let documentsSelectorCombo = createDocumentSelector(documentSelection, onOpenCallback);

            return {
                title,
                utilsBar,
                tabPanels,
                dialogWrapper,
                documentsSelectorCombo
            };

            function createTabPanels() {
                const panels = createElement('div', {'class': tabPanelsContainerClass});
                let tabLinks = createElement('div', {
                    'id': tabLinksId,
                    'role': 'tablist',
                    'aria-label': i18n.analysisAriaLabel
                });
                const tabPanels = createElement('div', {'class': resultsContainerClass + ' ' + resultsPanelClass});

                tabs.forEach((tab) => {
                    const tabLink = createTab(tab);
                    tabLinks.appendChild(tabLink);

                    const panel = createElement('div', {
                        'data-panel-id': tab.tabId,
                        'class': resultsClass,
                        'role': 'tabpanel',
                        'aria-labelledby': tab.tabId + '-tab-button'
                    });
                    tabPanels.appendChild(panel);
                });

                panels.appendChild(tabLinks);
                panels.appendChild(tabPanels);

                counterLegend = generateVisibilityLegend();
                panels.appendChild(counterLegend);

                return panels;

                function createTab(tab) {
                    const tabTex = i18n[tab.tabTex];
                    const tabId = tab.tabId;
                    const tabWidth = tab.width;
                    let textNode = createTextNode(tabTex);
                    let tabButton = createElement('button', {
                        'data-tab-id': tabId,
                        'aria-selected': 'false',
                        'aria-controls': tabId,
                        'role': 'tab',
                        'id': tabId + '-tab-button',
                        'class': actionButtonClass + ' ' + tabClass,
                        'style': 'width:' + tabWidth
                    });

                    tabButton.onclick = () => {
                        forceResultsLoad = true;
                        switchTab(tabId);
                    };
                    tabButton.addEventListener('keydown', (keydownEvent) => {
                        const key = keydownEvent.key;
                        const tabButton = keydownEvent.target;
                        const tabButtons = tabButton.parentNode.querySelectorAll('button[role=tab]');

                        switch (key) {
                            case 'ArrowLeft':
                                keydownEvent.preventDefault();
                                const prevTabButton = tabButton.previousSibling;
                                if (prevTabButton && prevTabButton.getAttribute('role') === 'tab') {
                                    prevTabButton.focus();
                                } else {
                                    tabButtons[tabButtons.length - 1].focus();
                                }
                                break;
                            case 'ArrowRight':
                                keydownEvent.preventDefault();
                                const nextTabButton = tabButton.nextSibling;
                                if (nextTabButton && nextTabButton.getAttribute('role') === 'tab') {
                                    nextTabButton.focus();
                                } else {
                                    tabButtons[0].focus();
                                }
                                break;
                            default:
                                break;
                        }
                    });

                    tabButton.appendChild(textNode);

                    return tabButton;
                }
            }

            function documentSelection(frameId) {
                if (activeFrameId === frameId) {
                    return;
                }

                requestAnalysisForFrameId(frameId, settings, activeTab);
                activeFrameId = frameId;
            }

            function onOpenCallback() {
                menu.close()
            }

            function createMenu(items) {
                const menu = createElement('div', {'id': menuId});
                const menuButton = createElement('button', {
                    'id': menuButtonId,
                    'aria-label': i18n.menuAriaLabel,
                    'aria-haspopup': 'true',
                    'aria-expanded': 'false',
                    'aria-controls': menuListId
                });
                const menuList = createElement('ul', {
                    'id': menuListId,
                    'role': 'menu',
                    'tabindex': '-1',
                    'aria-labelledby': menuButtonId
                });
                const itemsLength = items.length;
                for (let i = 0; i < itemsLength; i++) {
                    let itemText = createTextNode(items[i].label);
                    let menuItem = createElement('li', {
                        'id': items[i].id,
                        'role': 'menuitem',
                        'tabindex': '-1',
                        'class': items[i].class + ' ' + menuItemClass
                    }, itemText);
                    menuItem.onclick = () => {
                        items[i].callback();
                        menuList.classList.remove(activeStatusClass);
                    };
                    menuItem.addEventListener('keydown', (keydownEvent) => {
                        const key = keydownEvent.key;
                        const menuItem = keydownEvent.target;
                        const menuItems = menuItem.parentNode.querySelectorAll('[role=menuitem]');

                        switch (key) {
                            case 'ArrowDown':
                                keydownEvent.preventDefault();
                                const nextMenuItem = menuItem.nextSibling;
                                if (nextMenuItem && nextMenuItem.getAttribute('role') === 'menuitem') {
                                    nextMenuItem.focus()
                                } else {
                                    menuItems[0].focus();
                                }
                                break;
                            case 'ArrowUp':
                                keydownEvent.preventDefault();
                                const previousMenuItem = menuItem.previousSibling;
                                if (previousMenuItem && previousMenuItem.getAttribute('role') === 'menuitem') {
                                    previousMenuItem.focus()
                                } else {
                                    menuItems[menuItems.length - 1].focus();
                                }
                                break;
                            case 'Tab':
                                menu.close();
                                break;
                            case 'Enter':
                                items[i].callback();
                                menuList.classList.remove(activeStatusClass);
                                break;
                            default:
                                break;
                        }
                    });
                    menuList.appendChild(menuItem);
                }

                menu.appendChild(menuButton);
                menu.appendChild(menuList);

                menuButton.onclick = (clickEvent) => {
                    clickEvent.stopPropagation();
                    if (!isMenuOpen()) {
                        menuList.classList.add(activeStatusClass);
                        menuButton.setAttribute('aria-expanded', 'true');
                        menuList.firstChild.focus();
                    } else {
                        menuList.classList.remove(activeStatusClass);
                        menuButton.setAttribute('aria-expanded', 'false');
                    }
                    documentsSelector.close();
                };

                menu.close = () => {
                    if (isMenuOpen()) {
                        menuList.classList.remove(activeStatusClass);
                        menu.setAttribute('aria-expanded', 'false');
                        menuButton.focus();
                    }
                };

                return menu;

                function isMenuOpen() {
                    return menuList.classList.contains(activeStatusClass);
                }
            }

            function createSettingsPanel(settingsContainer) {
                appendAsyncContent(`configuration/${language}.html`, settingsContainer, initializeSettings);

                return settingsContainer;

                function initializeSettings(settingsContainer) {
                    const select = settingsContainer.getElementsByTagName('select');
                    const selectLength = select.length;
                    const input = settingsContainer.getElementsByTagName('input');
                    const inputLength = input.length;

                    setLanguagesSelector(settingsContainer, languages);
                    setInitialValues(settings);

                    for (let i = 0; i < selectLength; i++) {
                        select[i].onchange = function () {
                            saveOption(this);
                        };
                    }

                    for (let i = 0; i < inputLength; i++) {
                        input[i].oninput = function () {
                            const inputValue = (this.type === 'checkbox' ? this.checked : this.value) + '';
                            saveOption(this, inputValue);
                        };
                    }

                    setTimeout(() => {
                        const conditionalFields = settingsContainer.querySelectorAll('*[callback~=disableFields]');
                        conditionalFields.forEach((field) => {
                            disableFieldsByCondition(field)
                        });
                    }, 1000);

                    function setLanguagesSelector(container, languages) {
                        const languageSelector = container.querySelector('#language');

                        languages.forEach((language) => {
                            const option = createElement('option', {
                                value: language.code,
                                lang: language.code
                            }, language.description);
                            languageSelector.appendChild(option);
                        })
                    }

                    function setInitialValues(values) {
                        for (let key in values) {
                            const fieldToUpdate = settingsContainer.querySelector(`#${key}`);
                            if (fieldToUpdate) {
                                if (fieldToUpdate.type === 'checkbox') {
                                    fieldToUpdate.checked = values[key];
                                } else {
                                    fieldToUpdate.value = values[key];
                                }
                            }
                        }
                    }
                }
            }

            function createHelpPanel(helpContainer) {
                appendAsyncContent(`help/${language}.html`, helpContainer);

                return helpContainer;
            }

            function createContributionPanel(contributionContainer) {
                appendAsyncContent(`contribute/${language}.html`, contributionContainer);

                return contributionContainer;
            }

            function createReleaseNotesPanel(releaseNotesContainer) {
                appendAsyncContent('releaseNotes.html', releaseNotesContainer, checkNews);

                return releaseNotesContainer;

                function checkNews() {
                    widgetVersion = releaseNotesContainer.querySelector('#' + releaseNotesId + ' dt:first-child').getAttribute('data-version');

                    if (widgetVersion !== settings.widgetVersion) {
                        activeNews = true;
                        updateBodyParentTagClass(newsActiveClass, true);
                    }
                }
            }

            function createPrivacyPolicyPanel(privacyPolicyContainer) {
                appendAsyncContent(`privacyPolicy/${language}.html`, privacyPolicyContainer);

                return privacyPolicyContainer;
            }
        }
    }

    function openSettingsPanel() {
        openDialogPanel(settingsId);
    }

    function openHelpPanel() {
        openDialogPanel(helpPanelId);
    }

    function openContributionPanel() {
        openDialogPanel(contributePanelId);
    }

    function openPrivacyPolicyPanel() {
        openDialogPanel(privacyPolicyPanelId);
    }

    function openReleaseNotesPanel() {
        openDialogPanel(releaseNotesId);
        dialogContainer._callback = () => {
            if (activeNews) {
                save('widgetVersion', widgetVersion);
                updateBodyParentTagClass(newsActiveClass, false);
                activeNews = false;
            }
        };
    }

    function openDialogPanel(panelId) {
        headingsMapBody.classList.add(dialogActiveClass);
        const panel = dialogContainer.querySelector('#' + panelId);
        panel.classList.add('active');
        panel.focus();
    }

    function closeDialogPanel() {
        dialogContainer.querySelector('.active') && dialogContainer.querySelector('.active').classList.remove('active');
        headingsMapBody.classList.remove(dialogActiveClass);
        if (dialogContainer._callback) {
            dialogContainer._callback();
            dialogContainer._callback = undefined;
        }
        menu.querySelector('#' + menuButtonId).focus()
    }

    function refresh() {
        sendMessageToBackgroundScript('getDocumentList');
        setTheme();
        const isOutlineTestActive = settings.isOutlineTestActive;

        forceResultsLoad = true;

        // in case the outline panel changes its status, the panel to show could require to be changed
        const activeTab = (!isOutlineTestActive && localStorage['headingsMap_selectedTab'] === 'outlineTab'
            || !localStorage['headingsMap_selectedTab']) ? tabs[defaultTabIndex].tabId : localStorage['headingsMap_selectedTab'];

        switchTab(activeTab);
    }

    function refreshTab() {
        removePreviousResults();
        refresh();
    }

    function removePreviousResults() {
        const panelResults = headingsMapBody.querySelectorAll('.' + resultsPanelClass + ' > .' + resultsClass);
        panelResults.forEach((panel) => {
            while (panel.firstChild) {
                panel.removeChild(panel.firstChild);
            }
        });
    }

    function setTheme() {
        if (settings.darkTheme) {
            headingsMapBody.classList.add(darkThemeClass);
        } else {
            headingsMapBody.classList.remove(darkThemeClass);
        }
    }

    function updateBodyParentTagClassFromSettings(propertyKey, active) {
        if (!SETTING_PROPERTIES[propertyKey] || !SETTING_PROPERTIES[propertyKey].cssClass) {
            return;
        }

        updateBodyParentTagClass(SETTING_PROPERTIES[propertyKey].cssClass, active);
    }

    function updateBodyParentTagClass(className, active) {
        if (active) {
            headingsMapBody.classList.add(className);
        } else {
            headingsMapBody.classList.remove(className);
        }
    }

    function updateWidgetPosition() {
        updatePanelPosition(settings.leftPosition);

        if (settings.leftPosition) {
            bodyStyle.marginLeft = bodyStyle.marginRight;
            bodyStyle.marginRight = 'auto';
            headingsMapBody.style.left = '0';
            headingsMapBody.style.right = 'auto';
        } else {
            bodyStyle.marginRight = bodyStyle.marginLeft;
            bodyStyle.marginLeft = 'auto';
            headingsMapBody.style.right = '0';
            headingsMapBody.style.left = 'auto';
        }
    }

    function updateInitialPanelWidth() {
        save('initialPanelWidth', getCurrentWidth());
    }

    function saveOption(el, fieldValue) {
        const optionId = el.getAttribute('id');
        const callbackActions = el.getAttribute('callback');
        const optionValue = fieldValue || el.children[el.selectedIndex].value;
        const actions = {
            setTheme,
            refresh,
            updateWidgetPosition,
            disableFields,
            updateInitialPanelWidth,
            setLinksBehaviors
        };
        const isBoolean = optionValue === true || optionValue === 'true' || optionValue === false || optionValue === 'false';
        const value = isBoolean ? (optionValue === true || optionValue === 'true') : optionValue;

        save(optionId, value);

        const callbacks = callbackActions && callbackActions.split(' ');
        const callbacksLength = callbacks ? callbacks.length : 0;
        for (let i = 0; i < callbacksLength; i++) {
            if (actions[callbacks[i]]) {
                actions[callbacks[i]]();
            }
        }

        function disableFields() {
            disableFieldsByCondition(el);
        }
    }

    function disableFieldsByCondition(field) {
        const value = field.type === 'checkbox' ? field.checked : field.value === 'true';
        const relatedFieldsAttribute = field.getAttribute('related-fields');
        const relatedFields = relatedFieldsAttribute && relatedFieldsAttribute.split(' ');
        const relatedFieldsLength = relatedFields.length;

        for (let i = 0; i < relatedFieldsLength; i++) {
            const relatedField = headingsMapBody.querySelector(`[name=${relatedFields[i]}]`);
            if (value) {
                relatedField.removeAttribute('disabled');
            } else {
                relatedField.setAttribute('disabled', 'disabled');
            }
        }
    }

    function save(optionId, value) {
        const option = {};

        settings[optionId] = value;
        option[optionId] = value;
        chrome.storage.local.set(option);

        updateBodyParentTagClassFromSettings(optionId, value)
    }

    function generateVisibilityLegend() {
        const counterA = createElement('span', {class: counterClass});
        const visibleElementsCounter = createElement('span', {class: visibleElementsCounterClass}, [counterA, i18n.visible]);
        const counterB = createElement('span', {class: counterClass});
        const hiddenElementsCounter = createElement('span', {class: hiddenElementsCounterClass}, [counterB, i18n.potentiallyHiddenPlural]);
        const visibilityLegend = createElement('div', {
            class: visibilityLegendClass
        }, [visibleElementsCounter, hiddenElementsCounter]);

        visibilityLegend.updateCounters = updateCounters;

        return visibilityLegend;

        function updateCounters(visibleCount, hiddenCount) {
            const visibleCounterNode = this.querySelector(`.${visibleElementsCounterClass} .${counterClass}`);
            visibleCounterNode.textContent = `${visibleCount} `;
            const hiddenCounterNode = this.querySelector(`.${hiddenElementsCounterClass} .${counterClass}`);
            hiddenCounterNode.textContent = `${hiddenCount} `;
        }
    }
})();