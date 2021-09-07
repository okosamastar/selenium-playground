const commonFunctionalitiesService = function () {
    const treeRootClass = 'tree-root';

    const {
        createElement,
        getTitleForDocument
    } = utilsService();

    return {
        generateSectionForMap,
        removeAnchorFromHref,
        generateStringSectionForMap,
        isHigherLevel
    };

    function generateStringSectionForMap(htmlString) {
        const titleText = getTitleForDocument();
        return `<section aria-labelledby="outlineTab-button treemap-id" tabindex="-1" id="map-id"><h2 class="${treeRootClass}" id="treemap-id">${titleText}</h2>${htmlString}</section>`;
    }

    function generateSectionForMap() {
        const titleText = getTitleForDocument();
        const sectionHeader = createElement('h2', {'class': treeRootClass, 'id': 'treemap-id'}, titleText);

        return  createElement('section', {'tabindex': '-1', 'aria-labelledby':'headingsTab-button treemap-id', 'id': 'map-id'}, sectionHeader);
    }

    function removeAnchorFromHref(href) {
        return href.split('#')[0];
    }

    function isHigherLevel(headerLevel, headerLevelToCompareWith) {
        return -headerLevel < -headerLevelToCompareWith;
    }
};