import { extent as d3Extent, max, min } from "d3-array";
import * as PropTypes from "prop-types";
import * as React from "react";

import {
    clearCanvas,
    functor,
    head,
    identity,
    isDefined,
    isNotDefined,
    last,
    noop,
    shallowEqual,
} from "./utils";

import {
    // @ts-ignore
    lastVisibleItemBasedZoomAnchor,
    mouseBasedZoomAnchor,
    // @ts-ignore
    rightDomainBasedZoomAnchor,
} from "./utils/zoomBehavior";

import { getChartConfigWithUpdatedYScales, getCurrentCharts, getCurrentItem, getNewChartConfig } from "./utils/ChartDataUtil";

import { EventCapture } from "./EventCapture";

import { CanvasContainer } from "./CanvasContainer";
import evaluator from "./scale/evaluator";

const CANDIDATES_FOR_RESET = [
    "seriesName",
];

function shouldResetChart(thisProps, nextProps) {
    return !CANDIDATES_FOR_RESET.every((key) => {
        const result = shallowEqual(thisProps[key], nextProps[key]);
        // console.log(key, result);
        return result;
    });
}

function getCursorStyle() {
    const tooltipStyle = `
	.react-financial-charts-grabbing-cursor {
		pointer-events: all;
		cursor: -moz-grabbing;
		cursor: -webkit-grabbing;
		cursor: grabbing;
	}
	.react-financial-charts-crosshair-cursor {
		pointer-events: all;
		cursor: crosshair;
	}
	.react-financial-charts-tooltip-hover {
		pointer-events: all;
		cursor: pointer;
	}
	.react-financial-charts-avoid-interaction {
		pointer-events: none;
	}
	.react-financial-charts-enable-interaction {
		pointer-events: all;
	}
	.react-financial-charts-tooltip {
		pointer-events: all;
		cursor: pointer;
	}
	.react-financial-charts-default-cursor {
		cursor: default;
	}
	.react-financial-charts-move-cursor {
		cursor: move;
	}
	.react-financial-charts-pointer-cursor {
		cursor: pointer;
	}
	.react-financial-charts-ns-resize-cursor {
		cursor: ns-resize;
	}
	.react-financial-charts-ew-resize-cursor {
		cursor: ew-resize;
	}`;
    return (<style type="text/css">{tooltipStyle}</style>);
}

function getDimensions(props) {
    return {
        height: props.height - props.margin.top - props.margin.bottom,
        width: props.width - props.margin.left - props.margin.right,
    };
}

function getXScaleDirection(flipXScale) {
    return flipXScale ? -1 : 1;
}

function calculateFullData(props) {
    const { data: fullData, plotFull, xScale, clamp, pointsPerPxThreshold, flipXScale } = props;
    const { xAccessor, displayXAccessor, minPointsPerPxThreshold } = props;

    const useWholeData = isDefined(plotFull)
        ? plotFull
        : xAccessor === identity;

    const { filterData } = evaluator({
        xScale,
        useWholeData,
        clamp,
        pointsPerPxThreshold,
        minPointsPerPxThreshold,
        flipXScale,
    });

    return {
        xAccessor,
        displayXAccessor: displayXAccessor || xAccessor,
        xScale: xScale.copy(),
        fullData,
        filterData,
    };
}
function resetChart(props, firstCalculation = false) {

    const state = calculateState(props);
    const { xAccessor, displayXAccessor, fullData } = state;
    const { plotData: initialPlotData, xScale } = state;
    const { postCalculator, children } = props;

    const plotData = postCalculator(initialPlotData);

    const dimensions = getDimensions(props);

    // @ts-ignore
    const chartConfig = getChartConfigWithUpdatedYScales(
        getNewChartConfig(dimensions, children),
        { plotData, xAccessor, displayXAccessor, fullData },
        xScale.domain(),
    );

    return {
        ...state,
        xScale,
        plotData,
        chartConfig,
    };
}

function updateChart(
    newState,
    initialXScale,
    props,
    lastItemWasVisible,
    initialChartConfig,
) {

    const { fullData, xScale, xAccessor, displayXAccessor, filterData } = newState;

    const lastItem = last(fullData);
    const [start, end] = initialXScale.domain();

    const { postCalculator, children, padding, flipXScale } = props;
    const { maintainPointsPerPixelOnResize } = props;
    const direction = getXScaleDirection(flipXScale);
    const dimensions = getDimensions(props);

    const updatedXScale = setXRange(xScale, dimensions, padding, direction);

    // console.log("lastItemWasVisible =", lastItemWasVisible, end, xAccessor(lastItem), end >= xAccessor(lastItem));
    let initialPlotData;
    if (!lastItemWasVisible || end >= xAccessor(lastItem)) {
        // resize comes here...
        // get plotData between [start, end] and do not change the domain
        const [rangeStart, rangeEnd] = initialXScale.range();
        const [newRangeStart, newRangeEnd] = updatedXScale.range();
        const newDomainExtent = ((newRangeEnd - newRangeStart) / (rangeEnd - rangeStart)) * (end - start);
        const newStart = maintainPointsPerPixelOnResize
            ? end - newDomainExtent
            : start;

        const lastItemX = initialXScale(xAccessor(lastItem));
        // console.log("pointsPerPixel => ", newStart, start, end, updatedXScale(end));
        const response = filterData(
            fullData, [newStart, end], xAccessor, updatedXScale,
            { fallbackStart: start, fallbackEnd: { lastItem, lastItemX } },
        );
        initialPlotData = response.plotData;
        updatedXScale.domain(response.domain);
        // console.log("HERE!!!!!", start, end);
    } else if (lastItemWasVisible
        && end < xAccessor(lastItem)) {
        // this is when a new item is added and last item was visible
        // so slide over and show the new item also

        // get plotData between [xAccessor(l) - (end - start), xAccessor(l)] and DO change the domain
        const dx = initialXScale(xAccessor(lastItem)) - initialXScale.range()[1];
        const [newStart, newEnd] = initialXScale.range().map((x) => x + dx).map(initialXScale.invert);

        const response = filterData(fullData, [newStart, newEnd], xAccessor, updatedXScale);
        initialPlotData = response.plotData;
        updatedXScale.domain(response.domain);		// if last item was visible, then shift
    }
    // plotData = getDataOfLength(fullData, showingInterval, plotData.length)
    const plotData = postCalculator(initialPlotData);

    // @ts-ignore
    const chartConfig = getChartConfigWithUpdatedYScales(
        getNewChartConfig(dimensions, children, initialChartConfig),
        { plotData, xAccessor, displayXAccessor, fullData },
        updatedXScale.domain(),
    );

    return {
        xScale: updatedXScale,
        xAccessor,
        chartConfig,
        plotData,
        fullData,
        filterData,
    };
}

function calculateState(props) {

    const {
        xAccessor: inputXAccesor, xExtents: xExtentsProp, data, padding, flipXScale,
    } = props;

    if (process.env.NODE_ENV !== "production" && isDefined(props.xScale.invert)) {
        for (let i = 1; i < data.length; i++) {
            const prev = data[i - 1];
            const curr = data[i];
            if (inputXAccesor(prev) > inputXAccesor(curr)) {
                throw new Error("'data' is not sorted on 'xAccessor', send 'data' sorted in ascending order of 'xAccessor'");
            }
        }
    }

    const direction = getXScaleDirection(flipXScale);
    const dimensions = getDimensions(props);

    const extent = typeof xExtentsProp === "function"
        ? xExtentsProp(data)
        : d3Extent(xExtentsProp.map((d) => functor(d)).map((each) => each(data, inputXAccesor)));

    const { xAccessor, displayXAccessor, xScale, fullData, filterData } = calculateFullData(props);
    const updatedXScale = setXRange(xScale, dimensions, padding, direction);

    const { plotData, domain } = filterData(fullData, extent, inputXAccesor, updatedXScale);

    if (process.env.NODE_ENV !== "production" && plotData.length <= 1) {
        throw new Error(`Showing ${plotData.length} datapoints, review the 'xExtents' prop of ChartCanvas`);
    }
    return {
        plotData,
        xScale: updatedXScale.domain(domain),
        xAccessor,
        displayXAccessor,
        fullData,
        filterData,
    };
}

function setXRange(xScale, dimensions, padding, direction = 1) {
    if (xScale.rangeRoundPoints) {
        if (isNaN(padding)) { throw new Error("padding has to be a number for ordinal scale"); }
        xScale.rangeRoundPoints([0, dimensions.width], padding);
    } else if (xScale.padding) {
        if (isNaN(padding)) { throw new Error("padding has to be a number for ordinal scale"); }
        xScale.range([0, dimensions.width]);
        xScale.padding(padding / 2);
    } else {
        const { left, right } = isNaN(padding)
            ? padding
            : { left: padding, right: padding };
        if (direction > 0) {
            xScale.range([left, dimensions.width - right]);
        } else {
            xScale.range([dimensions.width - right, left]);
        }
    }
    return xScale;
}

function pinchCoordinates(pinch) {
    const { touch1Pos, touch2Pos } = pinch;

    return {
        topLeft: [Math.min(touch1Pos[0], touch2Pos[0]), Math.min(touch1Pos[1], touch2Pos[1])],
        bottomRight: [Math.max(touch1Pos[0], touch2Pos[0]), Math.max(touch1Pos[1], touch2Pos[1])],
    };
}

function isInteractionEnabled(xScale, xAccessor, data) {
    const interaction = !isNaN(xScale(xAccessor(head(data)))) && isDefined(xScale.invert);
    return interaction;
}

interface ChartCanvasProps {
    readonly width: number;
    readonly height: number;
    readonly margin?: {
        bottom: number;
        left: number;
        right: number;
        top: number;
    };
    readonly ratio: number;
    readonly type?: "svg" | "hybrid";
    readonly pointsPerPxThreshold?: number;
    readonly minPointsPerPxThreshold?: number;
    readonly data: any[];
    readonly xAccessor?: any; // func
    readonly xExtents?: any[] | any; // func
    readonly zoomAnchor?: any; // func
    readonly className?: string;
    readonly seriesName: string;
    readonly zIndex?: number;
    readonly xScale: any; // func
    readonly postCalculator?: any; // func
    readonly flipXScale?: boolean;
    readonly useCrossHairStyleCursor?: boolean;
    readonly padding?: number | {
        bottom: number;
        left: number;
        right: number;
        top: number;
    };
    readonly defaultFocus?: boolean;
    readonly zoomMultiplier?: number;
    readonly onLoadMore?: any; // func
    readonly displayXAccessor: any; // func
    readonly mouseMoveEvent?: boolean;
    readonly panEvent?: boolean;
    readonly clamp?: string | boolean | any; // func
    readonly zoomEvent?: boolean;
    readonly onSelect?: any; // func
    readonly maintainPointsPerPixelOnResize?: boolean;
    readonly disableInteraction?: boolean;
}

interface ChartCanvasState {
    xAccessor?: any;
    displayXAccessor?: any;
    filterData?: any;
    chartConfig?: any;
    plotData?: any;
    xScale?: any;
}

export class ChartCanvas extends React.Component<ChartCanvasProps, ChartCanvasState> {

    public static defaultProps = {
        margin: { top: 0, right: 40, bottom: 40, left: 0 },
        type: "hybrid",
        pointsPerPxThreshold: 2,
        minPointsPerPxThreshold: 1 / 100,
        className: "react-financial-charts",
        zIndex: 1,
        xExtents: [min, max] as any[],
        postCalculator: identity,
        padding: 0,
        xAccessor: identity,
        flipXScale: false,
        useCrossHairStyleCursor: true,
        defaultFocus: true,
        onLoadMore: noop,
        onSelect: noop,
        mouseMoveEvent: true,
        panEvent: true,
        zoomEvent: true,
        zoomMultiplier: 1.1,
        clamp: false,
        zoomAnchor: mouseBasedZoomAnchor,
        maintainPointsPerPixelOnResize: true,
        disableInteraction: false,
    };

    public static childContextTypes = {
        plotData: PropTypes.array,
        fullData: PropTypes.array,
        chartConfig: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
                origin: PropTypes.arrayOf(PropTypes.number).isRequired,
                padding: PropTypes.oneOfType([
                    PropTypes.number,
                    PropTypes.shape({
                        top: PropTypes.number,
                        bottom: PropTypes.number,
                    }),
                ]),
                yExtents: PropTypes.arrayOf(PropTypes.func),
                yExtentsProvider: PropTypes.func,
                yScale: PropTypes.func.isRequired,
                mouseCoordinates: PropTypes.shape({
                    at: PropTypes.string,
                    format: PropTypes.func,
                }),
                width: PropTypes.number.isRequired,
                height: PropTypes.number.isRequired,
            }),
        ).isRequired,
        xScale: PropTypes.func.isRequired,
        xAccessor: PropTypes.func.isRequired,
        displayXAccessor: PropTypes.func.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        chartCanvasType: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
        margin: PropTypes.object.isRequired,
        ratio: PropTypes.number.isRequired,
        getCanvasContexts: PropTypes.func,
        xAxisZoom: PropTypes.func,
        yAxisZoom: PropTypes.func,
        amIOnTop: PropTypes.func,
        redraw: PropTypes.func,
        subscribe: PropTypes.func,
        unsubscribe: PropTypes.func,
        setCursorClass: PropTypes.func,
        generateSubscriptionId: PropTypes.func,
        getMutableState: PropTypes.func,
    };

    public static ohlcv = (d) => ({ date: d.date, open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume });

    private canvasContainerNode;
    private eventCaptureNode;
    private finalPinch?: boolean;
    private fullData;
    private lastSubscriptionId;
    private mutableState;
    private panInProgress: boolean;
    private prevMouseXY;
    private subscriptions;
    private waitingForPinchZoomAnimationFrame?: boolean;
    private waitingForPanAnimationFrame?: boolean;
    private waitingForMouseMoveAnimationFrame?: boolean;

    // tslint:disable-next-line: variable-name
    private hackyWayToStopPanBeyondBounds__plotData;
    // tslint:disable-next-line: variable-name
    private hackyWayToStopPanBeyondBounds__domain;

    constructor(props: ChartCanvasProps) {
        super(props);

        this.getDataInfo = this.getDataInfo.bind(this);
        this.getCanvasContexts = this.getCanvasContexts.bind(this);

        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleZoom = this.handleZoom.bind(this);
        this.handlePinchZoom = this.handlePinchZoom.bind(this);
        this.handlePinchZoomEnd = this.handlePinchZoomEnd.bind(this);
        this.handlePan = this.handlePan.bind(this);
        this.handlePanEnd = this.handlePanEnd.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);

        this.panHelper = this.panHelper.bind(this);
        this.pinchZoomHelper = this.pinchZoomHelper.bind(this);
        this.xAxisZoom = this.xAxisZoom.bind(this);
        this.yAxisZoom = this.yAxisZoom.bind(this);
        this.resetYDomain = this.resetYDomain.bind(this);
        this.calculateStateForDomain = this.calculateStateForDomain.bind(this);
        this.generateSubscriptionId = this.generateSubscriptionId.bind(this);
        this.draw = this.draw.bind(this);
        this.redraw = this.redraw.bind(this);
        this.getAllPanConditions = this.getAllPanConditions.bind(this);

        this.subscriptions = [];
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.amIOnTop = this.amIOnTop.bind(this);
        this.saveEventCaptureNode = this.saveEventCaptureNode.bind(this);
        this.saveCanvasContainerNode = this.saveCanvasContainerNode.bind(this);
        this.setCursorClass = this.setCursorClass.bind(this);
        this.getMutableState = this.getMutableState.bind(this);

        this.panInProgress = false;
        this.state = {};
        this.mutableState = {};
        this.lastSubscriptionId = 0;

        const { fullData, ...state } = resetChart(props, true);
        this.state = state;
        this.fullData = fullData;
    }

    public saveEventCaptureNode(node) {
        this.eventCaptureNode = node;
    }

    public saveCanvasContainerNode(node) {
        this.canvasContainerNode = node;
    }

    public getMutableState() {
        return this.mutableState;
    }

    public getDataInfo() {
        return {
            ...this.state,
            fullData: this.fullData,
        };
    }

    public getCanvasContexts() {
        if (this.canvasContainerNode) {
            return this.canvasContainerNode.getCanvasContexts();
        }
    }

    public generateSubscriptionId() {
        this.lastSubscriptionId++;
        return this.lastSubscriptionId;
    }

    public clearBothCanvas() {
        const canvases = this.getCanvasContexts();
        if (canvases && canvases.axes) {
            clearCanvas([
                canvases.axes,
                canvases.mouseCoord,
            ], this.props.ratio);
        }
    }

    public clearMouseCanvas() {
        const canvases = this.getCanvasContexts();
        if (canvases && canvases.mouseCoord) {
            clearCanvas([
                canvases.mouseCoord,
            ], this.props.ratio);
        }
    }

    public clearThreeCanvas() {
        const canvases = this.getCanvasContexts();
        if (canvases && canvases.axes) {
            clearCanvas([
                canvases.axes,
                canvases.mouseCoord,
                canvases.bg,
            ], this.props.ratio);
        }
    }

    public subscribe(id, rest) {
        const { getPanConditions = functor({
            draggable: false,
            panEnabled: true,
        }) } = rest;
        this.subscriptions = this.subscriptions.concat({
            id,
            ...rest,
            getPanConditions,
        });
    }

    public unsubscribe(id) {
        this.subscriptions = this.subscriptions.filter((each) => each.id !== id);
    }

    public getAllPanConditions() {
        return this.subscriptions
            .map((each) => each.getPanConditions());
    }

    public setCursorClass(className) {
        if (this.eventCaptureNode != null) {
            this.eventCaptureNode.setCursorClass(className);
        }
    }

    public amIOnTop(id) {
        const dragableComponents = this.subscriptions
            .filter((each) => each.getPanConditions().draggable);

        return dragableComponents.length > 0
            && last(dragableComponents).id === id;
    }

    public handleContextMenu(mouseXY, e) {
        const { xAccessor, chartConfig, plotData, xScale } = this.state;

        const currentCharts = getCurrentCharts(chartConfig, mouseXY);
        const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);

        this.triggerEvent("contextmenu", {
            mouseXY,
            currentItem,
            currentCharts,
        }, e);
    }

    public calculateStateForDomain(newDomain) {
        const {
            xAccessor,
            displayXAccessor,
            xScale: initialXScale,
            chartConfig: initialChartConfig,
            plotData: initialPlotData,
        } = this.state;

        const { filterData } = this.state;
        const { fullData } = this;
        const { postCalculator } = this.props;

        const { plotData: beforePlotData, domain } = filterData(
            fullData,
            newDomain,
            xAccessor,
            initialXScale,
            {
                currentPlotData: initialPlotData,
                currentDomain: initialXScale.domain(),
            },
        );

        const plotData = postCalculator(beforePlotData);
        const updatedScale = initialXScale.copy().domain(domain);

        // @ts-ignore
        const chartConfig = getChartConfigWithUpdatedYScales(
            initialChartConfig,
            { plotData, xAccessor, displayXAccessor, fullData },
            updatedScale.domain(),
        );

        return {
            xScale: updatedScale,
            plotData,
            chartConfig,
        };
    }

    public pinchZoomHelper(initialPinch, finalPinch) {
        const { xScale: initialPinchXScale } = initialPinch;

        const {
            xScale: initialXScale,
            chartConfig: initialChartConfig,
            plotData: initialPlotData,
            xAccessor,
            displayXAccessor,
        } = this.state;
        const { filterData } = this.state;
        const { fullData } = this;
        const { postCalculator } = this.props;

        const { topLeft: iTL, bottomRight: iBR } = pinchCoordinates(initialPinch);
        const { topLeft: fTL, bottomRight: fBR } = pinchCoordinates(finalPinch);

        const e = initialPinchXScale.range()[1];

        const xDash = Math.round(-(iBR[0] * fTL[0] - iTL[0] * fBR[0]) / (iTL[0] - iBR[0]));
        const yDash = Math.round(e + ((e - iBR[0]) * (e - fTL[0]) - (e - iTL[0]) * (e - fBR[0])) / ((e - iTL[0]) - (e - iBR[0])));

        const x = Math.round(-xDash * iTL[0] / (-xDash + fTL[0]));
        const y = Math.round(e - (yDash - e) * (e - iTL[0]) / (yDash + (e - fTL[0])));

        const newDomain = [x, y].map(initialPinchXScale.invert);
        // var domainR = initial.right + right;

        const { plotData: beforePlotData, domain } = filterData(
            fullData,
            newDomain,
            xAccessor,
            initialPinchXScale,
            {
                currentPlotData: initialPlotData,
                currentDomain: initialXScale.domain(),
            },
        );

        const plotData = postCalculator(beforePlotData);
        const updatedScale = initialXScale.copy().domain(domain);

        const mouseXY = finalPinch.touch1Pos;

        // @ts-ignore
        const chartConfig = getChartConfigWithUpdatedYScales(
            initialChartConfig,
            { plotData, xAccessor, displayXAccessor, fullData },
            updatedScale.domain(),
        );
        const currentItem = getCurrentItem(updatedScale, xAccessor, mouseXY, plotData);

        return {
            chartConfig,
            xScale: updatedScale,
            plotData,
            mouseXY,
            currentItem,
        };
    }

    public cancelDrag() {
        this.eventCaptureNode.cancelDrag();
        this.triggerEvent("dragcancel");
    }

    public handlePinchZoom(initialPinch, finalPinch, e) {
        if (!this.waitingForPinchZoomAnimationFrame) {
            this.waitingForPinchZoomAnimationFrame = true;
            const state = this.pinchZoomHelper(initialPinch, finalPinch);

            this.triggerEvent("pinchzoom", state, e);

            this.finalPinch = finalPinch;

            requestAnimationFrame(() => {
                this.clearBothCanvas();
                this.draw({ trigger: "pinchzoom" });
                this.waitingForPinchZoomAnimationFrame = false;
            });
        }
    }

    public handlePinchZoomEnd(initialPinch, e) {
        const { xAccessor } = this.state;

        if (this.finalPinch) {
            const state = this.pinchZoomHelper(initialPinch, this.finalPinch);
            const { xScale } = state;
            this.triggerEvent("pinchzoom", state, e);

            this.finalPinch = undefined;

            this.clearThreeCanvas();

            const { fullData } = this;
            const firstItem = head(fullData);

            const start = head(xScale.domain());
            const end = xAccessor(firstItem);
            const { onLoadMore } = this.props;

            this.setState(state, () => {
                if (start < end) {
                    onLoadMore(start, end);
                }
            });
        }
    }

    public handleZoom(zoomDirection, mouseXY, e) {
        if (this.panInProgress) {
            return;
        }

        const { xAccessor, xScale: initialXScale, plotData: initialPlotData } = this.state;
        const {
            zoomMultiplier = ChartCanvas.defaultProps.zoomMultiplier,
            zoomAnchor,
        } = this.props;
        const { fullData } = this;
        const item = zoomAnchor({
            xScale: initialXScale,
            xAccessor,
            mouseXY,
            plotData: initialPlotData,
            fullData,
        });

        const cx = initialXScale(item);
        const c = zoomDirection > 0 ? 1 * zoomMultiplier : 1 / zoomMultiplier;
        const newDomain = initialXScale.range().map((x) => cx + (x - cx) * c).map(initialXScale.invert);

        const { xScale, plotData, chartConfig } = this.calculateStateForDomain(newDomain);

        const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
        const currentCharts = getCurrentCharts(chartConfig, mouseXY);

        this.clearThreeCanvas();

        const firstItem = head(fullData);

        const start = head(xScale.domain());
        const end = xAccessor(firstItem);
        const { onLoadMore } = this.props;

        this.mutableState = {
            mouseXY,
            currentItem,
            currentCharts,
        };

        this.triggerEvent("zoom", {
            xScale,
            plotData,
            chartConfig,
            mouseXY,
            currentCharts,
            currentItem,
            show: true,
        }, e);

        this.setState({
            xScale,
            plotData,
            chartConfig,
        }, () => {
            if (start < end) {
                onLoadMore(start, end);
            }
        });
    }

    public xAxisZoom(newDomain) {
        const { xScale, plotData, chartConfig } = this.calculateStateForDomain(newDomain);
        this.clearThreeCanvas();

        const { xAccessor } = this.state;
        const { fullData } = this;
        const firstItem = head(fullData);
        const start = head(xScale.domain());
        const end = xAccessor(firstItem);
        const { onLoadMore } = this.props;

        this.setState({
            xScale,
            plotData,
            chartConfig,
        }, () => {
            if (start < end) { onLoadMore(start, end); }
        });
    }

    public yAxisZoom(chartId, newDomain) {
        this.clearThreeCanvas();
        const { chartConfig: initialChartConfig } = this.state;
        const chartConfig = initialChartConfig
            .map((each) => {
                if (each.id === chartId) {
                    const { yScale } = each;
                    return {
                        ...each,
                        yScale: yScale.copy().domain(newDomain),
                        yPanEnabled: true,
                    };
                } else {
                    return each;
                }
            });

        this.setState({
            chartConfig,
        });
    }

    public triggerEvent(type, props?, e?) {

        this.subscriptions.forEach((each) => {
            const state = {
                ...this.state,
                fullData: this.fullData,
                subscriptions: this.subscriptions,
            };
            each.listener(type, props, state, e);
        });
    }

    public draw(props) {
        this.subscriptions.forEach((each) => {
            if (isDefined(each.draw)) {
                each.draw(props);
            }
        });
    }

    public redraw() {
        this.clearThreeCanvas();
        this.draw({ force: true });
    }

    public panHelper(mouseXY, initialXScale, { dx, dy }, chartsToPan) {
        const { xAccessor, displayXAccessor, chartConfig: initialChartConfig } = this.state;
        const { filterData } = this.state;
        const { fullData } = this;
        const { postCalculator } = this.props;

        if (isNotDefined(initialXScale.invert)) {
            throw new Error("xScale provided does not have an invert() method."
                + "You are likely using an ordinal scale. This scale does not support zoom, pan");
        }

        const newDomain = initialXScale.range().map((x) => x - dx).map(initialXScale.invert);

        const { plotData: beforePlotData, domain } = filterData(
            fullData,
            newDomain,
            xAccessor,
            initialXScale,
            {
                currentPlotData: this.hackyWayToStopPanBeyondBounds__plotData,
                currentDomain: this.hackyWayToStopPanBeyondBounds__domain,
            },
        );

        const updatedScale = initialXScale.copy().domain(domain);
        const plotData = postCalculator(beforePlotData);

        const currentItem = getCurrentItem(updatedScale, xAccessor, mouseXY, plotData);
        const chartConfig = getChartConfigWithUpdatedYScales(
            initialChartConfig,
            { plotData, xAccessor, displayXAccessor, fullData },
            updatedScale.domain(),
            dy,
            chartsToPan,
        );
        const currentCharts = getCurrentCharts(chartConfig, mouseXY);

        return {
            xScale: updatedScale,
            plotData,
            chartConfig,
            mouseXY,
            currentCharts,
            currentItem,
        };
    }

    public handlePan(mousePosition, panStartXScale, dxdy, chartsToPan, e) {
        if (!this.waitingForPanAnimationFrame) {
            this.waitingForPanAnimationFrame = true;

            this.hackyWayToStopPanBeyondBounds__plotData = this.hackyWayToStopPanBeyondBounds__plotData || this.state.plotData;
            this.hackyWayToStopPanBeyondBounds__domain = this.hackyWayToStopPanBeyondBounds__domain || this.state.xScale.domain();

            const state = this.panHelper(mousePosition, panStartXScale, dxdy, chartsToPan);

            this.hackyWayToStopPanBeyondBounds__plotData = state.plotData;
            this.hackyWayToStopPanBeyondBounds__domain = state.xScale.domain();

            this.panInProgress = true;

            this.triggerEvent("pan", state, e);

            this.mutableState = {
                mouseXY: state.mouseXY,
                currentItem: state.currentItem,
                currentCharts: state.currentCharts,
            };
            requestAnimationFrame(() => {
                this.waitingForPanAnimationFrame = false;
                this.clearBothCanvas();
                this.draw({ trigger: "pan" });
            });
        }
    }

    public handlePanEnd(mousePosition, panStartXScale, dxdy, chartsToPan, e) {
        const state = this.panHelper(mousePosition, panStartXScale, dxdy, chartsToPan);
        this.hackyWayToStopPanBeyondBounds__plotData = null;
        this.hackyWayToStopPanBeyondBounds__domain = null;

        this.panInProgress = false;

        const {
            xScale,
            plotData,
            chartConfig,
        } = state;

        this.triggerEvent("panend", state, e);

        requestAnimationFrame(() => {
            const { xAccessor } = this.state;
            const { fullData } = this;

            const firstItem = head(fullData);
            const start = head(xScale.domain());
            const end = xAccessor(firstItem);

            const { onLoadMore } = this.props;

            this.clearThreeCanvas();

            this.setState({
                xScale,
                plotData,
                chartConfig,
            }, () => {
                if (start < end) { onLoadMore(start, end); }
            });
        });
    }

    public handleMouseDown(mousePosition, currentCharts, e) {
        this.triggerEvent("mousedown", this.mutableState, e);
    }

    public handleMouseEnter(e) {
        this.triggerEvent("mouseenter", {
            show: true,
        }, e);
    }

    public handleMouseMove(mouseXY, inputType, e) {
        if (!this.waitingForMouseMoveAnimationFrame) {
            this.waitingForMouseMoveAnimationFrame = true;

            const { chartConfig, plotData, xScale, xAccessor } = this.state;
            const currentCharts = getCurrentCharts(chartConfig, mouseXY);
            const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
            this.triggerEvent("mousemove", {
                show: true,
                mouseXY,
                // prevMouseXY is used in interactive components
                prevMouseXY: this.prevMouseXY,
                currentItem,
                currentCharts,
            }, e);

            this.prevMouseXY = mouseXY;
            this.mutableState = {
                mouseXY,
                currentItem,
                currentCharts,
            };

            requestAnimationFrame(() => {
                this.clearMouseCanvas();
                this.draw({ trigger: "mousemove" });
                this.waitingForMouseMoveAnimationFrame = false;
            });
        }
    }

    public handleMouseLeave(e) {
        this.triggerEvent("mouseleave", { show: false }, e);
        this.clearMouseCanvas();
        this.draw({ trigger: "mouseleave" });
    }

    public handleDragStart({ startPos }, e) {
        this.triggerEvent("dragstart", { startPos }, e);
    }

    public handleDrag({ startPos, mouseXY }, e) {
        const { chartConfig, plotData, xScale, xAccessor } = this.state;
        const currentCharts = getCurrentCharts(chartConfig, mouseXY);
        const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);

        this.triggerEvent("drag", {
            startPos,
            mouseXY,
            currentItem,
            currentCharts,
        }, e);

        this.mutableState = {
            mouseXY,
            currentItem,
            currentCharts,
        };

        requestAnimationFrame(() => {
            this.clearMouseCanvas();
            this.draw({ trigger: "drag" });
        });
    }

    public handleDragEnd({ mouseXY }, e) {
        this.triggerEvent("dragend", { mouseXY }, e);

        requestAnimationFrame(() => {
            this.clearMouseCanvas();
            this.draw({ trigger: "dragend" });
        });
    }

    public handleClick(mousePosition, e) {
        this.triggerEvent("click", this.mutableState, e);

        requestAnimationFrame(() => {
            this.clearMouseCanvas();
            this.draw({ trigger: "click" });
        });
    }

    public handleDoubleClick(mousePosition, e) {
        this.triggerEvent("dblclick", {}, e);
    }

    public getChildContext() {
        const dimensions = getDimensions(this.props);
        return {
            fullData: this.fullData,
            plotData: this.state.plotData,
            width: dimensions.width,
            height: dimensions.height,
            chartConfig: this.state.chartConfig,
            xScale: this.state.xScale,
            xAccessor: this.state.xAccessor,
            displayXAccessor: this.state.displayXAccessor,
            chartCanvasType: this.props.type,
            margin: this.props.margin,
            ratio: this.props.ratio,
            xAxisZoom: this.xAxisZoom,
            yAxisZoom: this.yAxisZoom,
            getCanvasContexts: this.getCanvasContexts,
            redraw: this.redraw,
            subscribe: this.subscribe,
            unsubscribe: this.unsubscribe,
            generateSubscriptionId: this.generateSubscriptionId,
            getMutableState: this.getMutableState,
            amIOnTop: this.amIOnTop,
            setCursorClass: this.setCursorClass,
        };
    }

    public UNSAFE_componentWillReceiveProps(nextProps) {
        const reset = shouldResetChart(this.props, nextProps);

        const interaction = isInteractionEnabled(this.state.xScale, this.state.xAccessor, this.state.plotData);
        const { chartConfig: initialChartConfig } = this.state;

        let newState;
        if (!interaction || reset || !shallowEqual(this.props.xExtents, nextProps.xExtents)) {
            // do reset
            newState = resetChart(nextProps);
            this.mutableState = {};
        } else {

            const [start, end] = this.state.xScale.domain();
            const prevLastItem = last(this.fullData);

            const calculatedState = calculateFullData(nextProps);
            const { xAccessor } = calculatedState;
            const lastItemWasVisible = xAccessor(prevLastItem) <= end && xAccessor(prevLastItem) >= start;

            newState = updateChart(
                calculatedState,
                this.state.xScale,
                nextProps,
                lastItemWasVisible,
                initialChartConfig,
            );
        }

        const { fullData, ...state } = newState;

        if (!this.panInProgress) {
            this.clearThreeCanvas();

            this.setState(state);
        }
        this.fullData = fullData;
    }

    public resetYDomain(chartId) {
        const { chartConfig } = this.state;
        let changed = false;
        const newChartConfig = chartConfig
            .map((each) => {
                if ((isNotDefined(chartId) || each.id === chartId)
                    && !shallowEqual(each.yScale.domain(), each.realYDomain)) {
                    changed = true;
                    return {
                        ...each,
                        yScale: each.yScale.domain(each.realYDomain),
                        yPanEnabled: false,
                    };
                }
                return each;
            });

        if (changed) {
            this.clearThreeCanvas();
            this.setState({
                chartConfig: newChartConfig,
            });
        }
    }

    public shouldComponentUpdate() {
        return !this.panInProgress;
    }

    public render() {

        const {
            type = ChartCanvas.defaultProps.type,
            useCrossHairStyleCursor,
            onSelect,
            height,
            width,
            margin = ChartCanvas.defaultProps.margin,
            className,
            zIndex = ChartCanvas.defaultProps.zIndex,
            defaultFocus,
            ratio,
            mouseMoveEvent,
            panEvent,
            zoomEvent,
            disableInteraction,
        } = this.props;

        const { plotData, xScale, xAccessor, chartConfig } = this.state;
        const dimensions = getDimensions(this.props);

        const interaction = isInteractionEnabled(xScale, xAccessor, plotData);

        const cursorStyle = useCrossHairStyleCursor && interaction;
        const cursor = getCursorStyle();
        return (
            <div style={{ position: "relative", width, height }} className={className} onClick={onSelect}>
                <CanvasContainer
                    ref={this.saveCanvasContainerNode}
                    type={type}
                    ratio={ratio}
                    width={width}
                    height={height}
                    zIndex={zIndex} />
                <svg className={className} width={width} height={height} style={{ position: "absolute", zIndex: (zIndex + 5) }}>
                    {cursor}
                    <defs>
                        <clipPath id="chart-area-clip">
                            <rect x="0" y="0" width={dimensions.width} height={dimensions.height} />
                        </clipPath>
                        {chartConfig
                            .map((each, idx) => <clipPath key={idx} id={`chart-area-clip-${each.id}`}>
                                <rect x="0" y="0" width={each.width} height={each.height} />
                            </clipPath>)}
                    </defs>
                    <g transform={`translate(${margin.left + 0.5}, ${margin.top + 0.5})`}>
                        <EventCapture
                            ref={this.saveEventCaptureNode}
                            useCrossHairStyleCursor={cursorStyle}
                            mouseMove={mouseMoveEvent && interaction}
                            zoom={zoomEvent && interaction}
                            pan={panEvent && interaction}
                            width={dimensions.width}
                            height={dimensions.height}
                            chartConfig={chartConfig}
                            xScale={xScale}
                            xAccessor={xAccessor}
                            focus={defaultFocus}
                            disableInteraction={disableInteraction}
                            getAllPanConditions={this.getAllPanConditions}
                            onContextMenu={this.handleContextMenu}
                            onClick={this.handleClick}
                            onDoubleClick={this.handleDoubleClick}
                            onMouseDown={this.handleMouseDown}
                            onMouseMove={this.handleMouseMove}
                            onMouseEnter={this.handleMouseEnter}
                            onMouseLeave={this.handleMouseLeave}
                            onDragStart={this.handleDragStart}
                            onDrag={this.handleDrag}
                            onDragComplete={this.handleDragEnd}
                            onZoom={this.handleZoom}
                            onPinchZoom={this.handlePinchZoom}
                            onPinchZoomEnd={this.handlePinchZoomEnd}
                            onPan={this.handlePan}
                            onPanEnd={this.handlePanEnd}
                        />

                        <g className="react-financial-charts-avoid-interaction">
                            {this.props.children}
                        </g>
                    </g>
                </svg>
            </div>
        );
    }
}
