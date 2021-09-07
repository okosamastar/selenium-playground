const HTML5OutlineService = function () {
    const noHeadClass = 'no-headed';
    const sectionTagNameClass = 'tag-name';
    const additionalInfoClass = 'additional-info';
    const ariaLabelSpanClass = 'aria-label-span';
    const ariaLabelledBySpanClass = 'aria-labelled-span';
    const tooltipItemClass = 'tooltip-item';
    const tooltipErrorClass = 'tooltip-error';
    const sectionIdPrefix = 'headingsMap-';
    const elementWithNoHeading = 'element with no heading';
    const listTag = 'ul';
    const itemTag = 'li';
    const documentToCheck = window.document;
    const bodyElement = documentToCheck.body;

    const {
        getText,
        hiddenForA11y,
        getAriaLabel,
        getAriaLabelByIdRelatedContent,
        isVisibleForA11y,
        getHeadingInfo,
        dataElementIdAttrName,
        isElementNode,
        isSectioningRoot,
        isSectioningElement,
        isHeaderElement,
        isHgroupElement,
        getHeadings,
        hasHiddenAttribute,
        getAnchorFromElement,
        anchorClass,
        anchorTitle,
        getLastItem,
        getVisibilityClass
    } = utilsService();

    const {
        removeAnchorFromHref,
        generateStringSectionForMap,
        isHigherLevel
    } = commonFunctionalitiesService();

    return {
        HTML5Outline
    };

    function HTML5Outline(settings) {
        const showAriaLabelContent = settings.showAriaLabelContent || false;
        const showHiddenSections = settings.showHiddenSections;
        const getTextSettings = {showAriaLabelContent, showHiddenContent: showHiddenSections};
        const showAnchors = settings.showAnchors;
        let currentOutline;
        let currentSection;
        let stack;
        let idCounter = 0;

        const locationHref = removeAnchorFromHref(window.location.href);

        // https://html.spec.whatwg.org/multipage/sections.html#outlines
        const treeWalk = (root, onEnter, onExit) => {
            let node = root;
            start: while (node) {
                // The treeWalk goes through all nodes, including text
                // and comments. For that reason, avoiding them could
                // improve performance
                if(isElementNode(node)){
                    onEnter(node);
                    if (node.firstChild) {
                        node = node.firstChild;
                        continue start;
                    }
                }
                while (node) {
                    onExit(node);
                    if (node.nextSibling) {
                        node = node.nextSibling;
                        continue start;
                    }
                    node = node === root ? null : node.parentNode;
                }
            }
        };

        class Section {
            constructor(startingNode) {
                this.sections = [];
                this.startingNode = startingNode;
                this.attributes = {};
            }

            append(what) {
                what.container = this;
                this.sections.push(what);
            }
        }

        class Outline {
            constructor(outlineTargetNode, section) {
                this.startingNode = outlineTargetNode.node;
                this.sections = [section];
            }

            getLastSection() {
                return getLastItem(this.sections);
            }
        }

        class OutlineTarget {
            constructor(node) {
                this.node = node;
            }
        }

        return createOutline;

        function createOutline() {
            currentSection = null;
            stack = [];
            idCounter = 0;

            currentOutline = null;
            treeWalk(bodyElement, onEnterNode, onExitNode);

            return generateStringSectionForMap(asHTMLString(currentOutline.outline.sections));
        }

        function getTopOfStack() {
            return stack.length ? getLastItem(stack).node : '';
        }

        function onEnterNode(element) {
            const topOfStack = getTopOfStack();
            if ((isHeaderElement(topOfStack) || isHgroupElement(topOfStack))
                || (isElementNode(topOfStack) && hiddenForA11y(topOfStack) && !showHiddenSections)) {
                return;
            }

            const isHidden = hiddenForA11y(element);
            if (hasHiddenAttribute(element) || (isHidden && !showHiddenSections)) {
                stack.push({node: element});
                return;
            }

            if (isSectioningElement(element) || isSectioningRoot(element)) {
                if (currentOutline !== null) {
                    if (!currentSection.heading) {
                        currentSection.heading = {implied: true};
                    }
                    stack.push(currentOutline);
                }

                currentOutline = new OutlineTarget(element);

                if (isSectioningRoot(element)) {
                    currentOutline.parentSection = currentSection;
                }

                currentSection = new Section(element);
                currentSection.attributes.isVisible = !isHidden;
                currentOutline.outline = new Outline(currentOutline.node, currentSection);
                return;
            }

            if (isHeaderElement(element) || (settings.considerHgroup && isHgroupElement(element) && getHeadings(element, settings).length)) {
                if (!currentSection.heading) {
                    currentSection.heading = element;
                } else if (currentOutline.outline.getLastSection().heading.implied || !isHigherLevel(getHeadingInfo(element, settings).level, getHeadingInfo(currentOutline.outline.getLastSection().heading, settings).level)) {
                    const newSection = new Section(element);
                    newSection.attributes.isVisible = !isHidden;

                    currentOutline.outline.sections.push(newSection);
                    currentSection = newSection;
                    currentSection.heading = element;
                } else {
                    let abortSubsteps = false;

                    let candidateSection = currentSection;

                    do {
                        if (isHigherLevel(getHeadingInfo(element, settings).level, getHeadingInfo(candidateSection.heading, settings).level)) {
                            const newSection = new Section(element);
                            newSection.attributes.isVisible = !isHidden;

                            candidateSection.append(newSection);
                            currentSection = newSection;
                            currentSection.heading = element;
                            abortSubsteps = true;
                        }

                        candidateSection = candidateSection.container;
                    } while (!abortSubsteps);
                }

                stack.push({node: element});
            }
        }

        function onExitNode(element) {
            const topOfStack = getTopOfStack();
            if (topOfStack === element) {
                stack.pop();
            }

            if (isHeaderElement(topOfStack) || (hiddenForA11y(topOfStack) && !showHiddenSections)) {
                return;
            }

            if ((isSectioningElement(element) || isSectioningRoot(element)) && stack.length > 0 && !currentSection.heading) {
                currentSection.heading = {implied: true};
            }

            if (isSectioningElement(element) && stack.length > 0) {
                const targetBeingExited = currentOutline;

                currentOutline = stack.pop();
                currentSection = currentOutline.outline.getLastSection();
                targetBeingExited.outline.sections.forEach((section) => {
                    currentSection.append(section);
                })

                return;
            }

            if (isSectioningRoot(element) && stack.length > 0) {
                currentSection = currentOutline.parentSection;
                currentOutline = stack.pop();
                return;
            }

            if ((isSectioningElement(element) || isSectioningRoot(element)) && !currentSection.heading) {
                currentSection.heading = {implied: true};
            }
        }

        function getHeaderElementContent(element) {
            if (isHeaderElement(element)) {
                return getHeadingContent(element);
            }

            if (isHgroupElement(element)) {
                return getHgroupContent(element);
            }

            return {textContent: '', ariaLabelledBy: '', ariaLabel: ''};
        }

        function getHeadingContent(element) {
            const textContent = getText(element, isElementVisibleFn) || element.innerText || '';
            const ariaLabelledBy = getAriaLabelByIdRelatedContent(element);
            const ariaLabel = getAriaLabel(element, isElementVisibleFn);

            return {textContent, ariaLabelledBy, ariaLabel};
        }

        function getHgroupContent(element) {
            const hgroupContent = {
                textContent: '',
                ariaLabelledBy: '',
                ariaLabel: ''
            }
            getHeadings(element, settings).forEach((heading) => {
                const {textContent, ariaLabelledBy, ariaLabel} = getHeadingContent(heading.header);
                hgroupContent.textContent += textContent ? ` ${textContent}` : '';
                hgroupContent.ariaLabelledBy += ariaLabelledBy ? ` ${ariaLabelledBy}` : '';
                hgroupContent.ariaLabel += ariaLabel ? ` ${ariaLabel}` : '';
            });

            return hgroupContent;
        }

        function getSectionHeadingContent(heading) {
            if (heading.implied) {
                return {textContent: '', ariaLabelledBy: '', ariaLabel: ''};
            }

            const headerElementContent = getHeaderElementContent(heading);
            const textContent = headerElementContent.textContent;
            const ariaLabelledBy = getAriaLabelByIdRelatedContent(heading) || headerElementContent.ariaLabelledBy;
            const ariaLabel = getAriaLabel(heading, isElementVisibleFn) || headerElementContent.ariaLabel;

            return {textContent, ariaLabelledBy, ariaLabel};
        }

        function getAnchorFromSection(section) {
            if (section.heading.implied) {
                return '';
            }
            return getAnchorFromElement(section.heading);
        }

        function getSectionId(section, options) {
            if (!section.heading.implied) {
                return setAndGetElementId(section.startingNode);
            }

            const startingNode = section.startingNode;

            return setAndGetElementId(startingNode, ++options.idCounter);

            function setAndGetElementId(element) {
                let elementId = element.getAttribute(dataElementIdAttrName);

                if (elementId) {
                    element.setAttribute(dataElementIdAttrName, elementId);
                    return elementId;
                }

                elementId = sectionIdPrefix + ++idCounter;
                element.setAttribute(dataElementIdAttrName, elementId);

                return elementId
            }
        }

        function asHTMLString(sections, options) {
            if (!options) {
                options = {}
            }

            if (!sections.length) {
                return '';
            }

            if (typeof (options.idCounter) === 'undefined') {
                options.idCounter = 0;
            }

            const stringPortions = [];
            stringPortions.push(`<${listTag}>`);
            sections.forEach((section) => {
                const sectionId = getSectionId(section, options);
                const headingNode = section.heading;
                const headingNodeName = !headingNode.implied ? headingNode.tagName.toLowerCase() : 'no heading';
                const startingNode = section.startingNode;
                const headingContent = getSectionHeadingContent(headingNode);
                const {ariaLabelledBy, ariaLabel} = headingContent;
                const {isVisible} = section.attributes;

                let textContent = headingContent.textContent;

                let sectionNodeName = startingNode.tagName.toLowerCase();
                if (sectionNodeName === 'body') {
                    sectionNodeName = sectionNodeName.replace('body', 'document');
                }

                const sectionNameInfo = '<span class="' + sectionTagNameClass + ' ' + additionalInfoClass + '">[' + sectionNodeName + ']</span>'

                const hasContent = textContent || (showAriaLabelContent && (ariaLabelledBy || ariaLabel));

                let contentClass = '';
                if (!hasContent) {
                    contentClass = ` ${noHeadClass}`;
                    textContent = elementWithNoHeading;
                }
                const visibilityClass = getVisibilityClass(isVisible);
                let linkClass = `class="${visibilityClass}${contentClass}"`;

                let title = '';
                if (textContent) {
                    title = `title="${textContent.replace(/"/g, '\'')}"`;
                }

                const elementId = `${dataElementIdAttrName}="${sectionId}"`;
                const sectionRef = startingNode.getAttribute('id') || startingNode.getAttribute('name');
                let href = ''
                if (sectionRef) {
                    href = `href="${locationHref}#${sectionRef}"`;
                }else{
                    href = `tabindex="0"`;
                }

                let ariaLabelledBySpan = '';
                let ariaLabelSpan = '';
                if (showAriaLabelContent) {
                    if (ariaLabelledBy) {
                        ariaLabelledBySpan = `<span class="${ariaLabelledBySpanClass}"> [aria-labelledby: ${ariaLabelledBy}]</span>`;

                    }
                    if (ariaLabel) {
                        ariaLabelSpan = `<span class="${ariaLabelSpanClass}"> [aria-label: ${ariaLabel}]</span>`;
                    }
                }
                let anchorSpan = '';
                if (showAnchors) {
                    const sectionRef = getAnchorFromSection(section);
                    if (sectionRef) {
                        const href = locationHref + '#' + sectionRef;
                        anchorSpan = `<span data-anchor-id="${href}" class="${anchorClass}" title="${anchorTitle.replace(/"/g, '\'')}"></span>`;
                    }
                }

                let tooltipContent = `<span class="tooltip-reference-content" ${elementId}>`;
                tooltipContent += `<div class="${tooltipItemClass}">${textContent}</div>`;

                if(ariaLabel) {
                    tooltipContent += `<div class="${tooltipItemClass}">aria-label: ${ariaLabel}</div>`;
                }

                if(ariaLabelledBy) {
                    tooltipContent += `<div class="${tooltipItemClass}">aria-labelledby: ${ariaLabelledBy}</div>`;
                }

                tooltipContent += `<div class="${tooltipItemClass}">${i18n.generatedBy}: ${sectionNodeName}</div>`;
                if (hasContent && sectionNodeName !== headingNodeName) {
                    tooltipContent += `<div class="${tooltipItemClass}">${i18n.heading}: ${headingNodeName}</div>`;
                } else if(!hasContent){
                    tooltipContent += `<div class="${tooltipItemClass} ${tooltipErrorClass}">${i18n.errorNoHeadingSection}</div>`;
                }
                if(sectionRef){
                    tooltipContent += `<div class="${tooltipItemClass} ${anchorClass}">${i18n.anchor}: #${sectionRef}</div>`;
                }
                if(!isVisible){
                    tooltipContent += `<div class="${tooltipItemClass} ${visibilityClass}">${i18n.potentiallyHiddenPlural}</div>`;
                }
                tooltipContent += `</div>`;

                const linkText = sectionNameInfo + textContent + ariaLabelledBySpan + ariaLabelSpan + anchorSpan;
                const linkAttributes = `${elementId} ${title} ${linkClass} ${href}`;
                const nestedTree = asHTMLString(section.sections, options);
                const item = `<${itemTag}><a ${linkAttributes}>${linkText} ${tooltipContent}</a>${nestedTree}</${itemTag}>`;
                stringPortions.push(item);
            })
            stringPortions.push(`</${listTag}>`);

            return stringPortions.join('');
        }

        function isElementVisibleFn(element) {
            const showHiddenContent = getTextSettings.showHiddenContent;

            return showHiddenContent || isVisibleForA11y(element);
        }
    }
};