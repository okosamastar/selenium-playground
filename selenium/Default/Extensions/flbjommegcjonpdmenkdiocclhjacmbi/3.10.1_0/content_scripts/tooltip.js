const tooltipService = function () {
    const tooltipClass = 'tooltip';
    const tooltipContentClass = 'tooltip-content';
    const tooltipDistanceToMouse = 100;
    const tooltipDataSetPrefix = 'tooltip';
    const hiddenClass = 'hiddenTooltip';

    const {
        createElement,
        dataElementIdAttrName
    } = utilsService();

    class Tooltip {
        constructor(rootToAppendOn) {
            this._root = rootToAppendOn;
            const tooltip = generateTooltip(rootToAppendOn);
            this._tooltip = tooltip.tooltipElement;
            this._tooltipContent = tooltip.tooltipContent;
            this._arrow = tooltip.arrow;
            tooltip.tooltipDataSetPrefix = tooltipDataSetPrefix;
        }

        show(origin) {
            return (event) => {
                this.sendContentToOrigin(); // it sometimes keeps the previous content

                const tooltip = this._tooltip;
                const root = this._root;
                const tooltipContent = this._tooltipContent;
                const tooltipStyle = tooltip.style;
                const arrow = this._arrow;
                const arrowStyle = arrow.style;

                const tooltipContentReference = origin.querySelector('.tooltip-reference-content');
                tooltipContent.appendChild(tooltipContentReference);

                tooltipStyle.left = getTooltipHorizontalPosition(root, tooltip, event.clientX);
                const originClientRect = getClientRect(origin);
                const originTop = originClientRect.top;
                const originHeight = originClientRect.height;

                let topPosition = (originTop + originHeight / 2);
                tooltipStyle.top = topPosition + 'px';
                const tooltipClientRect = getClientRect(tooltip);
                let arrowTopPosition = (tooltipClientRect.height / 2) - (getClientRect(arrow).height / 1.5);
                arrowStyle.top = arrowTopPosition  + 'px';
                const bottomOverflow = tooltipClientRect.bottom - (window.innerHeight || document.documentElement.clientHeight);
                if(bottomOverflow > 0){
                    tooltipStyle.top = topPosition - bottomOverflow + 'px';
                    arrowStyle.top = arrowTopPosition + bottomOverflow + 'px';
                }

                tooltip.classList.remove(hiddenClass);
            }
        };

        follow() {
            return (event) => {
                this._tooltip.style.left = getTooltipHorizontalPosition(this._root, this._tooltip, event.clientX);
            }
        };

        hide() {
            return () => {
                this._tooltip.classList.add(hiddenClass);
                this.sendContentToOrigin();
            }
        };

        sendContentToOrigin() {
            const tooltipContentReferences = this._tooltipContent.querySelectorAll('.tooltip-reference-content');
            tooltipContentReferences.forEach((reference) => {
                const dataElementId = reference.getAttribute(dataElementIdAttrName);
                this._root.querySelector(`[${dataElementIdAttrName}=${dataElementId}]`).appendChild(reference);
            });
        }
    }

    return {
        Tooltip,
        tooltipDataSetPrefix
    };

    function generateTooltip(rootToAppendOn) {
        const arrow = createElement('span', {class: 'arrow'});
        const tooltipContent = createElement('div', {class: `${tooltipContentClass}`});
        const tooltipElement = createElement('div', {class: `${tooltipClass} ${hiddenClass}`}, [arrow, tooltipContent]);

        rootToAppendOn.appendChild(tooltipElement);

        return {arrow, tooltipElement, tooltipContent};
    }

    function getTooltipHorizontalPosition(root, tooltip, eventClientX) {
        const panelPosition = getPanelPosition(root);

        if (panelPosition === 'left') {
            return getLeftPosition(root, eventClientX) + 'px';
        }
        return getRightPosition(root, tooltip, eventClientX) + 'px';
    }

    function getPanelPosition(panel) {
        return panel.classList.contains('position-left') ? 'left' : 'right';
    }

    function getLeftPosition(elementRef, eventClientX) {
        const tooltipLeftFromMouse = eventClientX + tooltipDistanceToMouse;
        const elementRefRight = getClientRect(elementRef).right;
        return tooltipLeftFromMouse <= elementRefRight ? tooltipLeftFromMouse : elementRefRight;
    }

    function getRightPosition(elementRef, tooltip, eventClientX) {
        const elementRefLeft = getClientRect(elementRef).left;
        const tooltipWidth = getClientRect(tooltip).width;
        const mouseRelatedDisplacement = eventClientX - elementRefLeft - tooltipDistanceToMouse;

        return -tooltipWidth + (mouseRelatedDisplacement > 0 ? mouseRelatedDisplacement : 0);
    }

    function getClientRect(element) {
        return element.getBoundingClientRect();
    }

    function getBottomViewportDifference(element) {
        return getClientRect(element).bottom - (window.innerHeight || document.documentElement.clientHeight);
    }
};
