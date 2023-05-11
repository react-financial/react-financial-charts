import { extent as d3Extent, max, min } from "d3-array";
import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import * as React from "react";
import { clearCanvas, functor, head, identity, isDefined, isNotDefined, last, shallowEqual } from "./utils";
import { IZoomAnchorOptions, mouseBasedZoomAnchor } from "./zoom";
import {
    ChartConfig,
    getChartConfigWithUpdatedYScales,
    getCurrentCharts,
    getCurrentItem,
    getNewChartConfig,
} from "./utils/ChartDataUtil";
import { EventCapture } from "./EventCapture";
import { CanvasContainer, ICanvasContexts } from "./CanvasContainer";
import evaluator from "./utils/evaluator";
import type { MoreProps } from "./MoreProps";

const CANDIDATES_FOR_RESET = ["seriesName"];

const shouldResetChart = (thisProps: any, nextProps: any) => {
    return !CANDIDATES_FOR_RESET.every((key) => {
        const result = shallowEqual(thisProps[key], nextProps[key]);
        return result;
    });
};

const getCursorStyle = () => {
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
    return <style type="text/css">{tooltipStyle}</style>;
};

export interface ChartCanvasContextType<TXAxis extends number | Date> {
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
    chartId: number | string;
    getCanvasContexts?: () => ICanvasContexts | undefined;
    xScale: Function;
    ratio: number;
    // Not sure if it should be optional
    xAccessor: (data: any) => TXAxis;
    displayXAccessor: (data: any) => TXAxis;
    xAxisZoom?: (newDomain: any) => void;
    yAxisZoom?: (chartId: string, newDomain: any) => void;
    redraw: () => void;
    plotData: any[];
    fullData: any[];
    chartConfigs: ChartConfig[];
    morePropsDecorator?: () => void;
    generateSubscriptionId?: () => number;
    getMutableState: () => {};
    amIOnTop: (id: string | number) => boolean;
    subscribe: (id: string | number, rest: any) => void;
    unsubscribe: (id: string | number) => void;
    setCursorClass: (className: string | null | undefined) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
export const chartCanvasContextDefaultValue: ChartCanvasContextType<number | Date> = {
    amIOnTop: () => false,
    chartConfigs: [],
    chartId: 0,
    ratio: 0,
    displayXAccessor: () => 0,
    fullData: [],
    getMutableState: () => ({}),
    height: 0,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    plotData: [],
    setCursorClass: noop,
    subscribe: noop,
    unsubscribe: noop,
    redraw: noop,
    width: 0,
    xAccessor: () => 0,
    xScale: noop,
};
export const ChartCanvasContext =
    React.createContext<ChartCanvasContextType<number | Date>>(chartCanvasContextDefaultValue);

const getDimensions = <TXAxis extends number | Date>(props: ChartCanvasProps<TXAxis>) => {
    const { margin, height, width } = props;
    return {
        height: height - margin.top - margin.bottom,
        width: width - margin.left - margin.right,
    };
};

const getXScaleDirection = (flipXScale?: boolean) => {
    return flipXScale ? -1 : 1;
};

const calculateFullData = <TXAxis extends number | Date>(props: ChartCanvasProps<TXAxis>) => {
    const {
        data: fullData,
        plotFull,
        xScale,
        clamp,
        pointsPerPxThreshold,
        flipXScale,
        xAccessor,
        displayXAccessor,
        minPointsPerPxThreshold,
    } = props;

    const useWholeData = plotFull !== undefined ? plotFull : xAccessor === identity;

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
        displayXAccessor: displayXAccessor ?? xAccessor,
        xScale: xScale.copy(),
        fullData,
        filterData,
    };
};

const resetChart = <TXAxis extends number | Date>(props: ChartCanvasProps<TXAxis>) => {
    const state = calculateState(props);

    const { xAccessor, displayXAccessor, fullData, plotData: initialPlotData, xScale } = state;

    const { postCalculator, children } = props;

    const plotData = postCalculator !== undefined ? postCalculator(initialPlotData) : initialPlotData;

    const dimensions = getDimensions(props);

    const chartConfigs = getChartConfigWithUpdatedYScales(
        getNewChartConfig(dimensions, children),
        { plotData, xAccessor, displayXAccessor, fullData },
        xScale.domain(),
    );

    return {
        ...state,
        xScale,
        plotData,
        chartConfigs,
    };
};

const updateChart = (
    newState: any,
    initialXScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
    props: any,
    lastItemWasVisible: boolean,
    initialChartConfig: any,
) => {
    const { fullData, xScale, xAccessor, displayXAccessor, filterData } = newState;

    const lastItem = last(fullData);
    const lastXItem = xAccessor(lastItem);
    const [start, end] = initialXScale.domain();

    const { postCalculator, children, padding, flipXScale, maintainPointsPerPixelOnResize } = props;

    const direction = getXScaleDirection(flipXScale);
    const dimensions = getDimensions(props);
    const updatedXScale = setXRange(xScale, dimensions, padding, direction);

    let initialPlotData;
    if (!lastItemWasVisible || end >= lastXItem) {
        // resize comes here...
        // get plotData between [start, end] and do not change the domain
        const [rangeStart, rangeEnd] = initialXScale.range();
        const [newRangeStart, newRangeEnd] = updatedXScale.range();
        const newDomainExtent =
            ((newRangeEnd - newRangeStart) / (rangeEnd - rangeStart)) * (end.valueOf() - start.valueOf());
        const newStart = maintainPointsPerPixelOnResize ? end.valueOf() - newDomainExtent : start;

        const lastItemX = initialXScale(lastXItem);

        const response = filterData(fullData, [newStart, end], xAccessor, updatedXScale, {
            fallbackStart: start,
            fallbackEnd: { lastItem, lastItemX },
        });
        initialPlotData = response.plotData;
        updatedXScale.domain(response.domain);
    } else if (lastItemWasVisible && end < lastXItem) {
        // this is when a new item is added and last item was visible
        // so slide over and show the new item also

        // get plotData between [xAccessor(l) - (end - start), xAccessor(l)] and DO change the domain
        const dx = initialXScale(lastXItem) - initialXScale.range()[1];
        const [newStart, newEnd] = initialXScale
            .range()
            .map((x) => x + dx)
            .map((x) => initialXScale.invert(x));

        const response = filterData(fullData, [newStart, newEnd], xAccessor, updatedXScale);
        initialPlotData = response.plotData;
        updatedXScale.domain(response.domain); // if last item was visible, then shift
    }

    const plotData = postCalculator(initialPlotData);

    const chartConfigs = getChartConfigWithUpdatedYScales(
        getNewChartConfig(dimensions, children, initialChartConfig),
        { plotData, xAccessor, displayXAccessor, fullData },
        updatedXScale.domain(),
    );

    return {
        xScale: updatedXScale,
        xAccessor,
        chartConfigs,
        plotData,
        fullData,
        filterData,
    };
};

const calculateState = <TXAxis extends number | Date>(props: ChartCanvasProps<TXAxis>) => {
    const { xAccessor: inputXAccessor, xExtents: xExtentsProp, data, padding, flipXScale } = props;

    const direction = getXScaleDirection(flipXScale);

    const dimensions = getDimensions(props);

    const extent =
        typeof xExtentsProp === "function"
            ? xExtentsProp(data)
            : (d3Extent<number | Date>(
                  xExtentsProp.map((d: any) => functor(d)).map((each: any) => each(data, inputXAccessor)),
              ) as [TXAxis, TXAxis]);

    const { xAccessor, displayXAccessor, xScale, fullData, filterData } = calculateFullData(props);

    const updatedXScale = setXRange(xScale, dimensions, padding, direction);

    const { plotData, domain } = filterData(fullData, extent, inputXAccessor, updatedXScale);

    return {
        plotData,
        xScale: updatedXScale.domain(domain),
        xAccessor,
        displayXAccessor,
        fullData,
        filterData,
    };
};

const setXRange = (xScale: any, dimensions: any, padding: any, direction = 1) => {
    if (xScale.rangeRoundPoints) {
        if (isNaN(padding)) {
            throw new Error("padding has to be a number for ordinal scale");
        }
        xScale.rangeRoundPoints([0, dimensions.width], padding);
    } else if (xScale.padding) {
        if (isNaN(padding)) {
            throw new Error("padding has to be a number for ordinal scale");
        }
        xScale.range([0, dimensions.width]);
        xScale.padding(padding / 2);
    } else {
        const { left, right } = isNaN(padding) ? padding : { left: padding, right: padding };
        if (direction > 0) {
            xScale.range([left, dimensions.width - right]);
        } else {
            xScale.range([dimensions.width - right, left]);
        }
    }
    return xScale;
};

const pinchCoordinates = (pinch: any) => {
    const { touch1Pos, touch2Pos } = pinch;

    return {
        topLeft: [Math.min(touch1Pos[0], touch2Pos[0]), Math.min(touch1Pos[1], touch2Pos[1])],
        bottomRight: [Math.max(touch1Pos[0], touch2Pos[0]), Math.max(touch1Pos[1], touch2Pos[1])],
    };
};

const isInteractionEnabled = (
    xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
    xAccessor: any,
    data: any,
) => {
    const interaction = !isNaN(xScale(xAccessor(head(data)))) && isDefined(xScale.invert);
    return interaction;
};

export interface ChartCanvasProps<TXAxis extends number | Date> {
    readonly clamp?:
        | boolean
        | ("left" | "right" | "both")
        | ((domain: [number, number], items: [number, number]) => [number, number]);
    readonly className?: string;
    readonly children?: React.ReactNode;
    readonly data: any[];
    readonly defaultFocus?: boolean;
    readonly disableInteraction?: boolean;
    readonly disablePan?: boolean;
    readonly disableZoom?: boolean;
    readonly displayXAccessor?: (data: any) => TXAxis;
    readonly flipXScale?: boolean;
    readonly height: number;
    readonly margin: {
        bottom: number;
        left: number;
        right: number;
        top: number;
    };
    readonly maintainPointsPerPixelOnResize?: boolean;
    readonly minPointsPerPxThreshold?: number;
    readonly mouseMoveEvent?: boolean;
    /**
     * Called when panning left past the first data point.
     */
    readonly onLoadAfter?: (start: TXAxis, end: TXAxis) => void;
    /**
     * Called when panning right past the last data point.
     */
    readonly onLoadBefore?: (start: TXAxis, end: TXAxis) => void;
    /**
     * Click event handler.
     */
    readonly onClick?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * Double click event handler.
     */
    readonly onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
    readonly padding?:
        | number
        | {
              bottom: number;
              left: number;
              right: number;
              top: number;
          };
    readonly plotFull?: boolean;
    readonly pointsPerPxThreshold?: number;
    readonly postCalculator?: (plotData: any[]) => any[];
    readonly ratio: number;
    readonly seriesName: string;
    readonly useCrossHairStyleCursor?: boolean;
    readonly width: number;
    readonly xAccessor: (data: any) => TXAxis;
    readonly xExtents: ((data: any[]) => [TXAxis, TXAxis]) | (((data: any[]) => TXAxis) | TXAxis)[];
    readonly xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
    readonly zIndex?: number;
    readonly zoomAnchor?: (options: IZoomAnchorOptions<any, TXAxis>) => TXAxis;
    readonly zoomMultiplier?: number;
}

interface ChartCanvasState<TXAxis extends number | Date> {
    lastProps?: ChartCanvasProps<TXAxis>;
    propIteration?: number;
    xAccessor: (data: any) => TXAxis;
    displayXAccessor?: any;
    filterData?: any;
    chartConfigs: ChartConfig[];
    plotData: any[];
    xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
    fullData: any[];
}

interface Subscription {
    id: string;
    getPanConditions: () => {
        draggable: boolean;
        panEnabled: boolean;
    };
    draw: (props: { trigger: string } | { force: boolean }) => void;
    listener: (type: string, newMoreProps: MoreProps | undefined, state: any, e: any) => void;
}

interface MutableState {
    mouseXY: [number, number];
    currentItem: any;
    currentCharts: string[];
}

export class ChartCanvas<TXAxis extends number | Date> extends React.Component<
    ChartCanvasProps<TXAxis>,
    ChartCanvasState<TXAxis>
> {
    public static defaultProps = {
        clamp: false,
        className: "react-financial-charts",
        defaultFocus: true,
        disablePan: false,
        disableInteraction: false,
        disableZoom: false,
        flipXScale: false,
        maintainPointsPerPixelOnResize: true,
        margin: { top: 0, right: 40, bottom: 40, left: 0 },
        minPointsPerPxThreshold: 1 / 100,
        mouseMoveEvent: true,
        postCalculator: identity,
        padding: 0,
        pointsPerPxThreshold: 2,
        useCrossHairStyleCursor: true,
        xAccessor: identity as (data: any) => any,
        xExtents: [min, max] as any[],
        zIndex: 1,
        zoomAnchor: mouseBasedZoomAnchor,
        zoomMultiplier: 1.1,
    };

    private readonly canvasContainerRef = React.createRef<CanvasContainer>();
    private readonly eventCaptureRef = React.createRef<EventCapture>();
    private finalPinch?: boolean;
    private lastSubscriptionId = 0;
    private mutableState: MutableState = { mouseXY: [0, 0], currentCharts: [], currentItem: null };
    private panInProgress = false;
    private prevMouseXY?: number[];
    private subscriptions: Subscription[] = [];
    private waitingForPinchZoomAnimationFrame?: boolean;
    private waitingForPanAnimationFrame?: boolean;
    private waitingForMouseMoveAnimationFrame?: boolean;

    // tslint:disable-next-line: variable-name
    private hackyWayToStopPanBeyondBounds__plotData?: any[] | null;
    // tslint:disable-next-line: variable-name
    private hackyWayToStopPanBeyondBounds__domain?: any[] | null;

    public constructor(props: ChartCanvasProps<TXAxis>) {
        super(props);
        this.state = resetChart(props);
    }

    public static getDerivedStateFromProps<TXAxis extends number | Date>(
        props: ChartCanvasProps<TXAxis>,
        state: ChartCanvasState<TXAxis>,
    ): ChartCanvasState<TXAxis> {
        const { chartConfigs: initialChartConfig, plotData, xAccessor, xScale } = state;
        const interaction = isInteractionEnabled(xScale, xAccessor, plotData);
        const shouldReset = shouldResetChart(state.lastProps || {}, props);
        let newState: ChartCanvasState<TXAxis>;
        if (!interaction || shouldReset || !shallowEqual(state.lastProps?.xExtents, props.xExtents)) {
            // do reset
            newState = resetChart(props);
        } else {
            const [start, end] = xScale.domain();
            const prevLastItem = last(state.fullData);

            const calculatedState = calculateFullData(props);
            const { xAccessor } = calculatedState;
            const previousX = xAccessor(prevLastItem);
            const lastItemWasVisible = previousX <= end && previousX >= start;

            newState = updateChart(calculatedState, xScale, props, lastItemWasVisible, initialChartConfig);
        }
        return {
            ...newState,
            lastProps: props,
            propIteration: (state.propIteration || 0) + 1,
        };
    }

    public getSnapshotBeforeUpdate(
        prevProps: Readonly<ChartCanvasProps<TXAxis>>,
        prevState: Readonly<ChartCanvasState<TXAxis>>,
    ) {
        // propIteration is incremented when the props change to differentiate between state updates
        // and prop updates
        if (prevState.propIteration !== this.state.propIteration && !this.panInProgress) {
            this.clearThreeCanvas();
        }
        return null;
    }

    public componentDidUpdate(prevProps: ChartCanvasProps<TXAxis>) {
        if (prevProps.data !== this.props.data) {
            this.triggerEvent("dataupdated", {
                chartConfigs: this.state.chartConfigs,
                xScale: this.state.xScale,
                plotData: this.state.plotData,
            });
        }
    }

    public getMutableState = () => {
        return this.mutableState;
    };

    public getCanvasContexts = () => {
        return this.canvasContainerRef.current?.getCanvasContexts();
    };

    public generateSubscriptionId = () => {
        this.lastSubscriptionId++;

        return this.lastSubscriptionId;
    };

    public clearBothCanvas() {
        const canvases = this.getCanvasContexts();
        if (canvases && canvases.axes && canvases.mouseCoord) {
            clearCanvas([canvases.axes, canvases.mouseCoord], this.props.ratio);
        }
    }

    public clearMouseCanvas() {
        const canvases = this.getCanvasContexts();
        if (canvases && canvases.mouseCoord) {
            clearCanvas([canvases.mouseCoord], this.props.ratio);
        }
    }

    public clearThreeCanvas() {
        const canvases = this.getCanvasContexts();
        if (canvases && canvases.axes && canvases.mouseCoord && canvases.bg) {
            clearCanvas([canvases.axes, canvases.mouseCoord, canvases.bg], this.props.ratio);
        }
    }

    public subscribe = (id: string | number, rest: any) => {
        const {
            getPanConditions = functor({
                draggable: false,
                panEnabled: true,
            }),
        } = rest;

        this.subscriptions = this.subscriptions.concat({
            id,
            ...rest,
            getPanConditions,
        });
    };

    public unsubscribe = (id: string | number) => {
        this.subscriptions = this.subscriptions.filter((each) => each.id !== id);
    };

    public getAllPanConditions = () => {
        return this.subscriptions.map((each) => each.getPanConditions());
    };

    public setCursorClass = (className: string | null | undefined) => {
        this.eventCaptureRef.current?.setCursorClass(className);
    };

    public amIOnTop = (id: string | number) => {
        const dragableComponents = this.subscriptions.filter((each) => each.getPanConditions().draggable);

        return dragableComponents.length > 0 && last(dragableComponents).id === id;
    };

    public handleContextMenu = (mouseXY: number[], e: React.MouseEvent) => {
        const { xAccessor, chartConfigs, plotData, xScale } = this.state;

        const currentCharts = getCurrentCharts(chartConfigs, mouseXY);

        const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);

        this.triggerEvent(
            "contextmenu",
            {
                mouseXY,
                currentItem,
                currentCharts,
            },
            e,
        );
    };

    public calculateStateForDomain = (newDomain: any) => {
        const {
            xAccessor,
            displayXAccessor,
            xScale: initialXScale,
            chartConfigs: initialChartConfig,
            plotData: initialPlotData,
        } = this.state;

        const { filterData, fullData } = this.state;
        const { postCalculator = ChartCanvas.defaultProps.postCalculator } = this.props;

        const { plotData: beforePlotData, domain } = filterData(fullData, newDomain, xAccessor, initialXScale, {
            currentPlotData: initialPlotData,
            currentDomain: initialXScale!.domain(),
        });

        const plotData = postCalculator(beforePlotData);

        const updatedScale = initialXScale.copy().domain(domain) as
            | ScaleContinuousNumeric<number, number>
            | ScaleTime<number, number>;

        const chartConfigs = getChartConfigWithUpdatedYScales(
            initialChartConfig,
            { plotData, xAccessor, displayXAccessor, fullData },
            updatedScale.domain(),
        );

        return {
            xScale: updatedScale,
            plotData,
            chartConfigs,
        };
    };

    public pinchZoomHelper = (initialPinch: any, finalPinch: any) => {
        const { xScale: initialPinchXScale } = initialPinch;

        const {
            xScale: initialXScale,
            chartConfigs: initialChartConfig,
            plotData: initialPlotData,
            xAccessor,
            displayXAccessor,
            filterData,
            fullData,
        } = this.state;
        const { postCalculator = ChartCanvas.defaultProps.postCalculator } = this.props;

        const { topLeft: iTL, bottomRight: iBR } = pinchCoordinates(initialPinch);
        const { topLeft: fTL, bottomRight: fBR } = pinchCoordinates(finalPinch);

        const e = initialPinchXScale.range()[1];

        const xDash = Math.round(-(iBR[0] * fTL[0] - iTL[0] * fBR[0]) / (iTL[0] - iBR[0]));
        const yDash = Math.round(
            e + ((e - iBR[0]) * (e - fTL[0]) - (e - iTL[0]) * (e - fBR[0])) / (e - iTL[0] - (e - iBR[0])),
        );

        const x = Math.round((-xDash * iTL[0]) / (-xDash + fTL[0]));
        const y = Math.round(e - ((yDash - e) * (e - iTL[0])) / (yDash + (e - fTL[0])));

        const newDomain = [x, y].map(initialPinchXScale.invert);

        const { plotData: beforePlotData, domain } = filterData(fullData, newDomain, xAccessor, initialPinchXScale, {
            currentPlotData: initialPlotData,
            currentDomain: initialXScale!.domain(),
        });

        const plotData = postCalculator(beforePlotData);

        const updatedScale = initialXScale!.copy().domain(domain) as
            | ScaleContinuousNumeric<number, number>
            | ScaleTime<number, number>;

        const mouseXY = finalPinch.touch1Pos;

        const chartConfigs = getChartConfigWithUpdatedYScales(
            initialChartConfig,
            { plotData, xAccessor, displayXAccessor, fullData },
            updatedScale.domain(),
        );

        const currentItem = getCurrentItem(updatedScale, xAccessor, mouseXY, plotData);

        return {
            chartConfigs,
            xScale: updatedScale,
            plotData,
            mouseXY,
            currentItem,
            xAccessor,
            fullData,
        };
    };

    public cancelDrag() {
        this.eventCaptureRef.current?.cancelDrag();
        this.triggerEvent("dragcancel");
    }

    public handlePinchZoom = (initialPinch: any, finalPinch: any, e: any) => {
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
    };

    public handlePinchZoomEnd = (initialPinch: any, e: any) => {
        const { xAccessor = ChartCanvas.defaultProps.xAccessor } = this.state;

        if (this.finalPinch) {
            const state = this.pinchZoomHelper(initialPinch, this.finalPinch);
            const { xScale, fullData } = state;
            this.triggerEvent("pinchzoom", state, e);

            this.finalPinch = undefined;

            this.clearThreeCanvas();
            const firstItem = head(fullData);
            const scale_start = head(xScale.domain());
            const data_start = xAccessor(firstItem);

            const lastItem = last(fullData);
            const scale_end = last(xScale.domain());
            const data_end = xAccessor(lastItem);

            const { onLoadAfter, onLoadBefore } = this.props;

            this.setState(state, () => {
                if (scale_start < data_start) {
                    if (onLoadBefore !== undefined) {
                        onLoadBefore(scale_start, data_start);
                    }
                }
                if (data_end < scale_end) {
                    if (onLoadAfter !== undefined) {
                        onLoadAfter(data_end, scale_end);
                    }
                }
            });
        }
    };

    public handleZoom = (zoomDirection: any, mouseXY: any, e: any) => {
        if (this.panInProgress) {
            return;
        }

        const { xAccessor, xScale: initialXScale, plotData: initialPlotData, fullData } = this.state;
        const {
            zoomMultiplier = ChartCanvas.defaultProps.zoomMultiplier,
            zoomAnchor = ChartCanvas.defaultProps.zoomAnchor,
        } = this.props;

        const item = zoomAnchor({
            xScale: initialXScale!,
            xAccessor: xAccessor!,
            mouseXY,
            plotData: initialPlotData,
        });

        const cx = initialXScale(item);
        const c = zoomDirection > 0 ? 1 * zoomMultiplier : 1 / zoomMultiplier;
        const newDomain = initialXScale!
            .range()
            .map((x) => cx + (x - cx) * c)
            .map((x) => initialXScale.invert(x));

        const { xScale, plotData, chartConfigs } = this.calculateStateForDomain(newDomain);

        const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
        const currentCharts = getCurrentCharts(chartConfigs, mouseXY);

        this.clearThreeCanvas();

        const firstItem = head(fullData);
        const scale_start = head(xScale.domain());
        const data_start = xAccessor!(firstItem);

        const lastItem = last(fullData);
        const scale_end = last(xScale.domain());
        const data_end = xAccessor!(lastItem);

        this.mutableState = {
            mouseXY,
            currentItem,
            currentCharts,
        };

        this.triggerEvent(
            "zoom",
            {
                xScale,
                plotData,
                chartConfigs,
                mouseXY,
                currentCharts,
                currentItem,
                show: true,
            },
            e,
        );

        const { onLoadAfter, onLoadBefore } = this.props;

        this.setState(
            {
                xScale,
                plotData,
                chartConfigs,
            },
            () => {
                if (scale_start < data_start) {
                    if (onLoadBefore !== undefined) {
                        onLoadBefore(scale_start, data_start);
                    }
                }
                if (data_end < scale_end) {
                    if (onLoadAfter !== undefined) {
                        onLoadAfter(data_end, scale_end);
                    }
                }
            },
        );
    };

    public xAxisZoom = (newDomain: any) => {
        const { xScale, plotData, chartConfigs } = this.calculateStateForDomain(newDomain);
        this.clearThreeCanvas();

        const { xAccessor, fullData } = this.state;
        const firstItem = head(fullData);
        const scale_start = head(xScale.domain());
        const data_start = xAccessor!(firstItem);

        const lastItem = last(fullData);
        const scale_end = last(xScale.domain());
        const data_end = xAccessor!(lastItem);

        const { onLoadAfter, onLoadBefore } = this.props;

        this.setState(
            {
                xScale,
                plotData,
                chartConfigs,
            },
            () => {
                if (scale_start < data_start) {
                    if (onLoadBefore !== undefined) {
                        onLoadBefore(scale_start, data_start);
                    }
                }
                if (data_end < scale_end) {
                    if (onLoadAfter !== undefined) {
                        onLoadAfter(data_end, scale_end);
                    }
                }
            },
        );
    };

    public yAxisZoom = (chartId: string, newDomain: any) => {
        this.clearThreeCanvas();
        const { chartConfigs: initialChartConfig } = this.state;
        const chartConfigs = initialChartConfig.map((each: any) => {
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
            chartConfigs,
        });
    };

    public triggerEvent(type: any, props?: any, e?: any) {
        this.subscriptions.forEach((each) => {
            const state = {
                ...this.state,
                subscriptions: this.subscriptions,
            };
            each.listener(type, props, state, e);
        });
    }

    public draw = (props: { trigger: string } | { force: boolean }) => {
        this.subscriptions.forEach((each) => {
            if (isDefined(each.draw)) {
                each.draw(props);
            }
        });
    };

    public redraw = () => {
        this.clearThreeCanvas();
        this.draw({ force: true });
    };

    public panHelper = (
        mouseXY: [number, number],
        initialXScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
        { dx, dy }: { dx: number; dy: number },
        chartsToPan: string[],
    ) => {
        const { xAccessor, displayXAccessor, chartConfigs: initialChartConfig, filterData, fullData } = this.state;
        const { postCalculator = ChartCanvas.defaultProps.postCalculator } = this.props;

        const newDomain = initialXScale
            .range()
            .map((x) => x - dx)
            .map((x) => initialXScale.invert(x));

        const { plotData: beforePlotData, domain } = filterData(fullData, newDomain, xAccessor, initialXScale, {
            currentPlotData: this.hackyWayToStopPanBeyondBounds__plotData,
            currentDomain: this.hackyWayToStopPanBeyondBounds__domain,
            ignoreThresholds: true,
        });

        const updatedScale = initialXScale.copy().domain(domain) as
            | ScaleContinuousNumeric<number, number>
            | ScaleTime<number, number>;

        const plotData = postCalculator(beforePlotData);

        const currentItem = getCurrentItem(updatedScale, xAccessor, mouseXY, plotData);

        const chartConfigs = getChartConfigWithUpdatedYScales(
            initialChartConfig,
            { plotData, xAccessor, displayXAccessor, fullData },
            updatedScale.domain(),
            dy,
            chartsToPan,
        );

        const currentCharts = getCurrentCharts(chartConfigs, mouseXY);

        return {
            xScale: updatedScale,
            plotData,
            chartConfigs,
            mouseXY,
            currentCharts,
            currentItem,
        };
    };

    public handlePan = (
        mousePosition: [number, number],
        panStartXScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
        dxdy: { dx: number; dy: number },
        chartsToPan: string[],
        e: React.MouseEvent,
    ) => {
        if (this.waitingForPanAnimationFrame) {
            return;
        }
        this.waitingForPanAnimationFrame = true;

        this.hackyWayToStopPanBeyondBounds__plotData =
            this.hackyWayToStopPanBeyondBounds__plotData ?? this.state.plotData;
        this.hackyWayToStopPanBeyondBounds__domain =
            this.hackyWayToStopPanBeyondBounds__domain ?? this.state.xScale!.domain();

        const newState = this.panHelper(mousePosition, panStartXScale, dxdy, chartsToPan);

        this.hackyWayToStopPanBeyondBounds__plotData = newState.plotData;
        this.hackyWayToStopPanBeyondBounds__domain = newState.xScale.domain();

        this.panInProgress = true;

        this.triggerEvent("pan", newState, e);

        this.mutableState = {
            mouseXY: newState.mouseXY,
            currentItem: newState.currentItem,
            currentCharts: newState.currentCharts,
        };
        requestAnimationFrame(() => {
            this.waitingForPanAnimationFrame = false;
            this.clearBothCanvas();
            this.draw({ trigger: "pan" });
        });
    };

    public handlePanEnd = (
        mousePosition: [number, number],
        panStartXScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
        dxdy: { dx: number; dy: number },
        chartsToPan: string[],
        e: React.MouseEvent | React.TouchEvent,
    ) => {
        const state = this.panHelper(mousePosition, panStartXScale, dxdy, chartsToPan);
        this.hackyWayToStopPanBeyondBounds__plotData = null;
        this.hackyWayToStopPanBeyondBounds__domain = null;

        this.panInProgress = false;

        const { xScale, plotData, chartConfigs } = state;

        this.triggerEvent("panend", state, e);

        requestAnimationFrame(() => {
            const { xAccessor, fullData } = this.state;

            const firstItem = head(fullData);
            const scale_start = head(xScale.domain());
            const data_start = xAccessor!(firstItem);

            const lastItem = last(fullData);
            const scale_end = last(xScale.domain());
            const data_end = xAccessor!(lastItem);

            const { onLoadAfter, onLoadBefore } = this.props;

            this.clearThreeCanvas();

            this.setState(
                {
                    xScale,
                    plotData,
                    chartConfigs,
                },
                () => {
                    if (scale_start < data_start) {
                        if (onLoadBefore !== undefined) {
                            onLoadBefore(scale_start, data_start);
                        }
                    }
                    if (data_end < scale_end) {
                        if (onLoadAfter !== undefined) {
                            onLoadAfter(data_end, scale_end);
                        }
                    }
                },
            );
        });
    };

    public handleMouseDown = (_: number[], __: string[], e: React.MouseEvent) => {
        this.triggerEvent("mousedown", this.mutableState, e);
    };

    public handleMouseEnter = (e: React.MouseEvent) => {
        this.triggerEvent(
            "mouseenter",
            {
                show: true,
            },
            e,
        );
    };

    public handleMouseMove = (mouseXY: [number, number], _: string, e: any) => {
        if (this.waitingForMouseMoveAnimationFrame) {
            return;
        }
        this.waitingForMouseMoveAnimationFrame = true;
        const { chartConfigs, plotData, xScale, xAccessor } = this.state;
        const currentCharts = getCurrentCharts(chartConfigs, mouseXY);
        const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
        this.triggerEvent(
            "mousemove",
            {
                show: true,
                mouseXY,
                // prevMouseXY is used in interactive components
                prevMouseXY: this.prevMouseXY,
                currentItem,
                currentCharts,
            },
            e,
        );
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
    };

    public handleMouseLeave = (e: any) => {
        this.triggerEvent("mouseleave", { show: false }, e);
        this.clearMouseCanvas();
        this.draw({ trigger: "mouseleave" });
    };

    public handleDragStart = ({ startPos }: any, e: any) => {
        this.triggerEvent("dragstart", { startPos }, e);
    };

    public handleDrag = (
        { startPos, mouseXY }: { startPos: [number, number]; mouseXY: [number, number] },
        e: React.MouseEvent,
    ) => {
        const { chartConfigs, plotData, xScale, xAccessor } = this.state;

        const currentCharts = getCurrentCharts(chartConfigs, mouseXY);
        const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);

        this.triggerEvent(
            "drag",
            {
                startPos,
                mouseXY,
                currentItem,
                currentCharts,
            },
            e,
        );

        this.mutableState = {
            mouseXY,
            currentItem,
            currentCharts,
        };

        requestAnimationFrame(() => {
            this.clearMouseCanvas();
            this.draw({ trigger: "drag" });
        });
    };

    public handleDragEnd = ({ mouseXY }: { mouseXY: number[] }, e: React.MouseEvent) => {
        this.triggerEvent("dragend", { mouseXY }, e);

        requestAnimationFrame(() => {
            this.clearMouseCanvas();
            this.draw({ trigger: "dragend" });
        });
    };

    public handleClick = (_: number[], e: React.MouseEvent) => {
        this.triggerEvent("click", this.mutableState, e);

        requestAnimationFrame(() => {
            this.clearMouseCanvas();
            this.draw({ trigger: "click" });
        });
    };

    public handleDoubleClick = (_: number[], e: React.MouseEvent) => {
        this.triggerEvent("dblclick", {}, e);
    };

    // TODO: Memoize this
    public getContextValues(): ChartCanvasContextType<TXAxis> {
        const dimensions = getDimensions(this.props);
        return {
            chartId: -1,
            fullData: this.state.fullData,
            plotData: this.state.plotData,
            width: dimensions.width,
            height: dimensions.height,
            chartConfigs: this.state.chartConfigs,
            xScale: this.state.xScale,
            xAccessor: this.state.xAccessor,
            displayXAccessor: this.state.displayXAccessor,
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

    public resetYDomain = (chartId?: string) => {
        const { chartConfigs } = this.state;
        let changed = false;
        const newChartConfig = chartConfigs.map((each: any) => {
            if (
                (isNotDefined(chartId) || each.id === chartId) &&
                !shallowEqual(each.yScale.domain(), each.realYDomain)
            ) {
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
                chartConfigs: newChartConfig,
            });
        }
    };

    public shouldComponentUpdate() {
        return !this.panInProgress;
    }

    public render() {
        const {
            disableInteraction,
            disablePan,
            disableZoom,
            useCrossHairStyleCursor,
            onClick,
            onDoubleClick,
            height,
            width,
            margin = ChartCanvas.defaultProps.margin,
            className,
            zIndex = ChartCanvas.defaultProps.zIndex,
            defaultFocus,
            ratio,
            mouseMoveEvent,
        } = this.props;

        const { plotData, xScale, xAccessor, chartConfigs } = this.state;

        const dimensions = getDimensions(this.props);

        const interaction = isInteractionEnabled(xScale, xAccessor, plotData);

        const cursorStyle = useCrossHairStyleCursor && interaction;

        const cursor = getCursorStyle();

        return (
            <ChartCanvasContext.Provider value={this.getContextValues()}>
                <div
                    style={{ position: "relative", width, height }}
                    className={className}
                    onClick={onClick}
                    onDoubleClick={onDoubleClick}
                >
                    <CanvasContainer
                        ref={this.canvasContainerRef}
                        ratio={ratio}
                        width={width}
                        height={height}
                        style={{ height, zIndex, width }}
                    />
                    <svg
                        className={className}
                        width={width}
                        height={height}
                        style={{ position: "absolute", zIndex: zIndex + 5 }}
                    >
                        {cursor}
                        <defs>
                            <clipPath id="chart-area-clip">
                                <rect x="0" y="0" width={dimensions.width} height={dimensions.height} />
                            </clipPath>
                            {chartConfigs.map((each: any, idx: number) => (
                                <clipPath key={idx} id={`chart-area-clip-${each.id}`}>
                                    <rect x="0" y="0" width={each.width} height={each.height} />
                                </clipPath>
                            ))}
                        </defs>
                        <g transform={`translate(${margin.left + 0.5}, ${margin.top + 0.5})`}>
                            <EventCapture
                                ref={this.eventCaptureRef}
                                useCrossHairStyleCursor={cursorStyle}
                                mouseMove={mouseMoveEvent && interaction}
                                zoom={!disableZoom && interaction}
                                pan={!disablePan && interaction}
                                width={dimensions.width}
                                height={dimensions.height}
                                chartConfig={chartConfigs}
                                xScale={xScale!}
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

                            <g className="react-financial-charts-avoid-interaction">{this.props.children}</g>
                        </g>
                    </svg>
                </div>
            </ChartCanvasContext.Provider>
        );
    }
}
