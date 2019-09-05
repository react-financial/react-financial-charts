import * as PropTypes from "prop-types";
import * as React from "react";

import {
    functor,
    identity,
    isDefined,
    isNotDefined,
    noop,
} from "./utils";

const aliases = {
    mouseleave: "mousemove", // to draw interactive after mouse exit
    panend: "pan",
    pinchzoom: "pan",
    mousedown: "mousemove",
    click: "mousemove",
    contextmenu: "mousemove",
    dblclick: "mousemove",
    dragstart: "drag",
    dragend: "drag",
    dragcancel: "drag",
};

interface GenericComponentProps {
    svgDraw: any; // func
    canvasDraw?: any; // func
    drawOn: any[];
    clip?: boolean;
    edgeClip?: boolean;
    interactiveCursorClass?: string;
    selected?: boolean;
    enableDragOnHover?: boolean;
    disablePan?: boolean;
    canvasToDraw: any; // func
    isHover?: any; // func
    onClick?: any; // func
    onClickWhenHover?: any; // func
    onClickOutside?: any; // func
    onPan?: any; // func
    onPanEnd?: any; // func
    onDragStart?: any; // func
    onDrag?: any; // func
    onDragComplete?: any; // func
    onDoubleClick?: any; // func
    onDoubleClickWhenHover?: any; // func
    onContextMenu?: any; // func
    onContextMenuWhenHover?: any; // func
    onMouseMove?: any; // func
    onMouseDown?: any; // func
    onHover?: any; // func
    onUnHover?: any; // func
    debug?: any; // func
}

interface GenericComponentState {
    updateCount: number;
}

class GenericComponent extends React.Component<GenericComponentProps, GenericComponentState> {

    public static defaultProps = {
        svgDraw: functor(null),
        draw: [],
        canvasToDraw: (contexts) => contexts.mouseCoord,
        clip: true,
        edgeClip: false,
        selected: false,
        disablePan: false,
        enableDragOnHover: false,
        onClickWhenHover: noop,
        onClickOutside: noop,
        onDragStart: noop,
        onMouseMove: noop,
        onMouseDown: noop,
        debug: noop,
    };

    public static contextTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        margin: PropTypes.object.isRequired,
        chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        getCanvasContexts: PropTypes.func,
        chartCanvasType: PropTypes.string,
        xScale: PropTypes.func.isRequired,
        xAccessor: PropTypes.func.isRequired,
        displayXAccessor: PropTypes.func.isRequired,
        plotData: PropTypes.array.isRequired,
        fullData: PropTypes.array.isRequired,
        chartConfig: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object,
        ]).isRequired,
        morePropsDecorator: PropTypes.func,
        generateSubscriptionId: PropTypes.func,
        getMutableState: PropTypes.func.isRequired,
        amIOnTop: PropTypes.func.isRequired,
        subscribe: PropTypes.func.isRequired,
        unsubscribe: PropTypes.func.isRequired,
        setCursorClass: PropTypes.func.isRequired,
    };

    public moreProps;

    private dragInProgress;
    private evaluationInProgress;
    private iSetTheCursorClass;
    private suscriberId;

    public constructor(props, context) {
        super(props, context);
        this.drawOnCanvas = this.drawOnCanvas.bind(this);
        this.getMoreProps = this.getMoreProps.bind(this);
        this.listener = this.listener.bind(this);
        this.draw = this.draw.bind(this);
        this.updateMoreProps = this.updateMoreProps.bind(this);
        this.evaluateType = this.evaluateType.bind(this);
        this.isHover = this.isHover.bind(this);
        this.preCanvasDraw = this.preCanvasDraw.bind(this);
        this.postCanvasDraw = this.postCanvasDraw.bind(this);
        this.getPanConditions = this.getPanConditions.bind(this);
        this.shouldTypeProceed = this.shouldTypeProceed.bind(this);
        this.preEvaluate = this.preEvaluate.bind(this);

        const { generateSubscriptionId } = context;
        this.suscriberId = generateSubscriptionId();

        this.moreProps = {};

        this.state = {
            updateCount: 0,
        };
    }

    public updateMoreProps(moreProps) {
        Object.keys(moreProps).forEach((key) => {
            this.moreProps[key] = moreProps[key];
        });
    }

    public shouldTypeProceed(type, moreProps) {
        return true;
    }

    public preEvaluate() {
        /// empty
    }

    public listener(type, moreProps, state, e) {
        if (isDefined(moreProps)) {
            this.updateMoreProps(moreProps);
        }
        this.evaluationInProgress = true;
        this.evaluateType(type, e);
        this.evaluationInProgress = false;
    }

    public evaluateType(type, e) {
        const newType = aliases[type] || type;
        const proceed = this.props.drawOn.indexOf(newType) > -1;

        if (!proceed) {
            return;
        }

        // @ts-ignore
        this.preEvaluate(type, this.moreProps, e);

        if (!this.shouldTypeProceed(type, this.moreProps)) {
            return;
        }

        switch (type) {
            case "zoom":
            case "mouseenter":
                // DO NOT DRAW FOR THESE EVENTS
                break;
            case "mouseleave": {
                this.moreProps.hovering = false;
                const moreProps = this.getMoreProps();

                if (this.props.onUnHover) {
                    this.props.onUnHover(moreProps, e);
                }
                break;
            }
            case "contextmenu": {
                if (this.props.onContextMenu) {
                    this.props.onContextMenu(this.getMoreProps(), e);
                }
                if (
                    this.moreProps.hovering
                    && this.props.onContextMenuWhenHover
                ) {
                    this.props.onContextMenuWhenHover(this.getMoreProps(), e);
                }
                break;
            }
            case "mousedown": {
                if (this.props.onMouseDown) {
                    this.props.onMouseDown(this.getMoreProps(), e);
                }
                break;
            }
            case "click": {
                const moreProps = this.getMoreProps();
                if (this.moreProps.hovering) {
                    this.props.onClickWhenHover(moreProps, e);
                } else {
                    this.props.onClickOutside(moreProps, e);
                }
                if (this.props.onClick) {
                    this.props.onClick(moreProps, e);
                }
                break;
            }
            case "mousemove": {

                const prevHover = this.moreProps.hovering;
                this.moreProps.hovering = this.isHover(e);

                const { amIOnTop, setCursorClass } = this.context;

                if (this.moreProps.hovering
                    && !this.props.selected
                    /* && !prevHover */
                    && amIOnTop(this.suscriberId)
                    && isDefined(this.props.onHover)) {
                    setCursorClass("react-stockcharts-pointer-cursor");
                    this.iSetTheCursorClass = true;
                } else if (this.moreProps.hovering
                    && this.props.selected
                    && amIOnTop(this.suscriberId)) {
                    setCursorClass(this.props.interactiveCursorClass);
                    this.iSetTheCursorClass = true;
                } else if (prevHover
                    && !this.moreProps.hovering
                    && this.iSetTheCursorClass) {
                    this.iSetTheCursorClass = false;
                    setCursorClass(null);
                }
                const moreProps = this.getMoreProps();

                if (this.moreProps.hovering && !prevHover) {
                    if (this.props.onHover) {
                        this.props.onHover(moreProps, e);
                    }
                }
                if (prevHover && !this.moreProps.hovering) {
                    if (this.props.onUnHover) {
                        this.props.onUnHover(moreProps, e);
                    }
                }

                if (this.props.onMouseMove) {
                    this.props.onMouseMove(moreProps, e);
                }
                break;
            }
            case "dblclick": {
                const moreProps = this.getMoreProps();

                if (this.props.onDoubleClick) {
                    this.props.onDoubleClick(moreProps, e);
                }
                if (
                    this.moreProps.hovering
                    && this.props.onDoubleClickWhenHover
                ) {
                    this.props.onDoubleClickWhenHover(moreProps, e);
                }
                break;
            }
            case "pan": {
                this.moreProps.hovering = false;
                if (this.props.onPan) {
                    this.props.onPan(this.getMoreProps(), e);
                }
                break;
            }
            case "panend": {
                if (this.props.onPanEnd) {
                    this.props.onPanEnd(this.getMoreProps(), e);
                }
                break;
            }
            case "dragstart": {
                if (this.getPanConditions().draggable) {
                    const { amIOnTop } = this.context;
                    if (amIOnTop(this.suscriberId)) {
                        this.dragInProgress = true;
                        this.props.onDragStart(this.getMoreProps(), e);
                    }
                }
                break;
            }
            case "drag": {
                if (this.dragInProgress && this.props.onDrag) {
                    this.props.onDrag(this.getMoreProps(), e);
                }
                break;
            }
            case "dragend": {
                if (this.dragInProgress && this.props.onDragComplete) {
                    this.props.onDragComplete(this.getMoreProps(), e);
                }
                this.dragInProgress = false;
                break;
            }
            case "dragcancel": {
                if (this.dragInProgress || this.iSetTheCursorClass) {
                    const { setCursorClass } = this.context;
                    setCursorClass(null);
                }
                break;
            }
        }
    }

    public isHover(e) {
        return isDefined(this.props.isHover)
            ? this.props.isHover(this.getMoreProps(), e)
            : false;
    }

    public getPanConditions() {
        const draggable = (
            !!(this.props.selected && this.moreProps.hovering)
            || (this.props.enableDragOnHover && this.moreProps.hovering)
        );

        return {
            draggable,
            panEnabled: !this.props.disablePan,
        };
    }

    // @ts-ignore
    public draw({ trigger, force } = { force: false }) {
        const type = aliases[trigger] || trigger;
        const proceed = this.props.drawOn.indexOf(type) > -1;

        if (proceed
            || this.props.selected /* this is to draw as soon as you select */
            || force
        ) {
            const { chartCanvasType } = this.context;
            const { canvasDraw } = this.props;

            if (isNotDefined(canvasDraw) || chartCanvasType === "svg") {
                const { updateCount } = this.state;
                this.setState({
                    updateCount: updateCount + 1,
                });
            } else {
                this.drawOnCanvas();
            }
        }
    }

    public UNSAFE_componentWillMount() {
        const { subscribe, chartId } = this.context;
        const { clip, edgeClip } = this.props;

        subscribe(this.suscriberId,
            {
                chartId, clip, edgeClip,
                listener: this.listener,
                draw: this.draw,
                getPanConditions: this.getPanConditions,
            },
        );
        this.UNSAFE_componentWillReceiveProps(this.props, this.context);
    }

    public componentWillUnmount() {
        const { unsubscribe } = this.context;
        unsubscribe(this.suscriberId);
        if (this.iSetTheCursorClass) {
            const { setCursorClass } = this.context;
            setCursorClass(null);
        }
    }

    public componentDidMount() {
        this.componentDidUpdate(this.props);
    }

    public componentDidUpdate(prevProps) {
        const { chartCanvasType } = this.context;
        const { canvasDraw, selected, interactiveCursorClass } = this.props;

        if (prevProps.selected !== selected) {
            const { setCursorClass } = this.context;
            if (selected && this.moreProps.hovering) {
                this.iSetTheCursorClass = true;
                setCursorClass(interactiveCursorClass);
            } else {
                this.iSetTheCursorClass = false;
                setCursorClass(null);
            }
        }
        if (isDefined(canvasDraw)
            && !this.evaluationInProgress
            && chartCanvasType !== "svg") {

            this.updateMoreProps(this.moreProps);
            this.drawOnCanvas();
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        const { xScale, plotData, chartConfig, getMutableState } = nextContext;

        this.props.debug(nextContext);
        this.moreProps = {
            ...this.moreProps,
            ...getMutableState(),
            /*
			^ this is so
			mouseXY, currentCharts, currentItem are available to
			newly created components like MouseHoverText which
			is created right after a new interactive object is drawn
			*/
            xScale, plotData, chartConfig,
        };
    }

    public getMoreProps() {
        const {
            xScale,
            plotData,
            chartConfig,
            morePropsDecorator,
            xAccessor,
            displayXAccessor,
            width,
            height,
        } = this.context;

        const { chartId, fullData } = this.context;

        const moreProps = {
            xScale, plotData, chartConfig,
            xAccessor, displayXAccessor,
            width, height,
            chartId,
            fullData,
            ...this.moreProps,
        };

        return (morePropsDecorator || identity)(moreProps);
    }

    public preCanvasDraw(ctx, moreProps) {
        // do nothing
    }

    public postCanvasDraw(ctx, moreProps) {
        // empty
    }

    public drawOnCanvas() {
        const { canvasDraw, canvasToDraw } = this.props;
        const { getCanvasContexts } = this.context;

        const moreProps = this.getMoreProps();

        const ctx = canvasToDraw(getCanvasContexts());

        this.preCanvasDraw(ctx, moreProps);
        canvasDraw(ctx, moreProps);
        this.postCanvasDraw(ctx, moreProps);
    }

    public render() {
        const { chartCanvasType, chartId } = this.context;
        const { canvasDraw, clip, svgDraw } = this.props;

        if (isDefined(canvasDraw) && chartCanvasType !== "svg") {
            return null;
        }

        const suffix = isDefined(chartId) ? "-" + chartId : "";

        const style = clip ? { clipPath: `url(#chart-area-clip${suffix})` } : undefined;

        return (
            <g style={style}>
                {svgDraw(this.getMoreProps())}
            </g>
        );
    }
}

export default GenericComponent;

export function getAxisCanvas(contexts) {
    return contexts.axes;
}

export function getMouseCanvas(contexts) {
    return contexts.mouseCoord;
}
