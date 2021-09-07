const resizerService = function (resizer_class) {
    const RESIZER_WIDTH = 10;
    const panelPositionClassPrefix = 'position-';
    const {createElement} = utilsService();
    let initialXInResizer;
    let resizer;
    let resizerStyle;
    let minPanelWidth;
    let panelWidth;
    let previousSibling;
    let nextSibling;
    let panelPosition;
    let contextWidth;
    let panelToResize;
    let callbackFn;

    return {
        createResizer,
        removeResizer,
        updatePanelPosition,
        getCurrentWidth
    };

    function createResizer(resizingPanel, isLeftPosition, minWidth, callback) {
        resizer = createElement('div', {class: resizer_class});
        resizerStyle = resizer.style;

        panelToResize = resizingPanel;

        previousSibling = panelToResize;
        nextSibling = panelToResize.nextSibling;

        panelPosition = isLeftPosition ? 'left' : 'right';
        minPanelWidth = minWidth;
        callbackFn = callback;

        resizer.addEventListener('mousedown', attachResizeListeners);
        resizer.addEventListener('mouseup', detachResizeListeners);

        return resizer;
    }

    function updatePanelPosition(isLeftPosition) {
        panelWidth = getNumericValue(panelToResize.style.width);
        panelPosition = isLeftPosition ? 'left' : 'right';

        if (panelPosition === 'left') {
            resizer.style.left = (panelWidth - RESIZER_WIDTH) + 'px';
            resizer.style.right = 'initial';
            panelToResize.style.paddingLeft = 0;
            panelToResize.style.paddingRight = RESIZER_WIDTH + 'px';
            panelToResize.classList.add(panelPositionClassPrefix + panelPosition);
            panelToResize.classList.remove(`${panelPositionClassPrefix}right`);
        } else {
            resizer.style.left = 'initial';
            resizer.style.right = (panelWidth - RESIZER_WIDTH) + 'px';
            panelToResize.style.paddingLeft = RESIZER_WIDTH + 'px';
            panelToResize.style.paddingRight = 0;
            panelToResize.classList.add(panelPositionClassPrefix + panelPosition);
            panelToResize.classList.remove(`${panelPositionClassPrefix}left`);
        }
    }

    function removeResizer() {
        resizer.removeEventListener('mousedown', attachResizeListeners);
        resizer.removeEventListener('mouseup', detachResizeListeners);
        detachResizeListeners();

        delete resizer;
    }

    function attachResizeListeners(mouseDownEvent) {
        contextWidth = window.innerWidth;

        initialXInResizer = panelPosition === 'left' ? (mouseDownEvent.pageX - panelWidth) : mouseDownEvent.pageX;

        document.addEventListener('mousemove', dragResizer);
        document.addEventListener('mouseup', detachResizeListeners);

        panelToResize.addEventListener('mousemove', dragResizer);
        panelToResize.addEventListener('mouseup', detachResizeListeners);
    }

    function detachResizeListeners() {
        document.removeEventListener('mousemove', dragResizer);
        document.removeEventListener('mouseup', detachResizeListeners);

        panelToResize.removeEventListener('mousemove', dragResizer);
        panelToResize.removeEventListener('mouseup', detachResizeListeners);

        panelWidth = getNumericValue(panelToResize.style.width);
    }

    function dragResizer(dragEvent) {
        dragEvent.preventDefault();

        const updatedPanelWidth =  (panelPosition === 'left') ? (dragEvent.pageX - initialXInResizer) : panelWidth - dragEvent.pageX + initialXInResizer;

        if (contextWidth - updatedPanelWidth <= minPanelWidth || updatedPanelWidth <= minPanelWidth) {
            return;
        }

        panelToResize.style.width = updatedPanelWidth + 'px';

        resizerStyle[panelPosition] = (updatedPanelWidth - RESIZER_WIDTH) + 'px';
        resizerStyle[panelPosition === 'left' ? 'right' : 'left'] = 'auto';

        callbackFn && callbackFn(updatedPanelWidth, panelPosition);
    }

    function getCurrentWidth() {
        return getNumericValue(panelToResize.style.width);
    }

    function getNumericValue(value) {
        return parseInt(value.replace(/\D/g, ''));
    }
};
