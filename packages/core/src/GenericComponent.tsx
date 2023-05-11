/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { functor, identity } from "./utils";
import { ICanvasContexts } from "./CanvasContainer";
import { ChartCanvasContext } from "./ChartCanvas";

const aliases: Record<string, string> = {
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
    zoom: "zoom",
};

interface GenericComponentProps {
    readonly svgDraw?: (moreProps: any) => React.ReactNode;
    readonly canvasDraw?: (ctx: CanvasRenderingContext2D, moreProps: any) => void;
    readonly canvasToDraw?: (contexts: ICanvasContexts) => CanvasRenderingContext2D | undefined;
    readonly clip?: boolean;
    readonly disablePan?: boolean;
    readonly drawOn: string[];
    readonly edgeClip?: boolean;
    readonly enableDragOnHover?: boolean;
    readonly interactiveCursorClass?: string;
    readonly isHover?: (moreProps: any, e: React.MouseEvent) => boolean;
    readonly onClick?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onClickWhenHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onClickOutside?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onPan?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onPanEnd?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDragStart?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDrag?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDoubleClick?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDoubleClickWhenHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onContextMenu?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onContextMenuWhenHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onMouseMove?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onMouseDown?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onUnHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly selected?: boolean;
}

interface GenericComponentState {
    updateCount: number;
}

export class GenericComponent extends React.Component<GenericComponentProps, GenericComponentState> {
    public static defaultProps = {
        svgDraw: functor(null),
        draw: [],
        canvasToDraw: (contexts: ICanvasContexts) => contexts.mouseCoord,
        clip: true,
        edgeClip: false,
        selected: false,
        disablePan: false,
        enableDragOnHover: false,
    };

    public declare context: React.ContextType<typeof ChartCanvasContext>;

    public moreProps: any = {};

    private dragInProgress = false;
    private evaluationInProgress = false;
    private iSetTheCursorClass = false;
    private readonly subscriberId: number;

    public constructor(props: GenericComponentProps, context: any) {
        super(props, context);
        this.drawOnCanvas = this.drawOnCanvas.bind(this);
        this.getMoreProps = this.getMoreProps.bind(this);
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

        this.subscriberId = generateSubscriptionId();

        this.state = {
            updateCount: 0,
        };
    }

    public updateMoreProps(moreProps: any) {
        Object.keys(moreProps).forEach((key) => {
            this.moreProps[key] = moreProps[key];
        });
    }

    public shouldTypeProceed(type: string, moreProps: any) {
        return true;
    }

    public preEvaluate(type: string, moreProps: any, e: any) {
        /// empty
    }

    public listener = (type: string, moreProps: any, state: any, e: any) => {
        if (moreProps !== undefined) {
            this.updateMoreProps(moreProps);
        }
        this.evaluationInProgress = true;
        this.evaluateType(type, e);
        this.evaluationInProgress = false;
    };

    public evaluateType(type: string, e: any) {
        // @ts-ignore
        const newType = aliases[type] || type;
        const proceed = this.props.drawOn.indexOf(newType) > -1;
        if (!proceed) {
            return;
        }

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

                if (this.props.onUnHover) {
                    this.props.onUnHover(e, this.getMoreProps());
                }
                break;
            }
            case "contextmenu": {
                if (this.props.onContextMenu) {
                    this.props.onContextMenu(e, this.getMoreProps());
                }
                if (this.moreProps.hovering && this.props.onContextMenuWhenHover) {
                    this.props.onContextMenuWhenHover(e, this.getMoreProps());
                }
                break;
            }
            case "mousedown": {
                if (this.props.onMouseDown) {
                    this.props.onMouseDown(e, this.getMoreProps());
                }
                break;
            }
            case "click": {
                const { onClick, onClickOutside, onClickWhenHover } = this.props;
                const moreProps = this.getMoreProps();
                if (moreProps.hovering && onClickWhenHover !== undefined) {
                    onClickWhenHover(e, moreProps);
                } else if (onClickOutside !== undefined) {
                    onClickOutside(e, moreProps);
                }

                if (onClick !== undefined) {
                    onClick(e, moreProps);
                }
                break;
            }
            case "mousemove": {
                const prevHover = this.moreProps.hovering;
                this.moreProps.hovering = this.isHover(e);

                const { amIOnTop, setCursorClass } = this.context;

                if (
                    this.moreProps.hovering &&
                    !this.props.selected &&
                    /* && !prevHover */
                    amIOnTop(this.subscriberId) &&
                    this.props.onHover !== undefined
                ) {
                    setCursorClass("react-financial-charts-pointer-cursor");
                    this.iSetTheCursorClass = true;
                } else if (this.moreProps.hovering && this.props.selected && amIOnTop(this.subscriberId)) {
                    setCursorClass(this.props.interactiveCursorClass);
                    this.iSetTheCursorClass = true;
                } else if (prevHover && !this.moreProps.hovering && this.iSetTheCursorClass) {
                    this.iSetTheCursorClass = false;
                    setCursorClass(null);
                }
                const moreProps = this.getMoreProps();

                if (this.moreProps.hovering && !prevHover) {
                    if (this.props.onHover) {
                        this.props.onHover(e, moreProps);
                    }
                }
                if (prevHover && !this.moreProps.hovering) {
                    if (this.props.onUnHover) {
                        this.props.onUnHover(e, moreProps);
                    }
                }

                if (this.props.onMouseMove) {
                    this.props.onMouseMove(e, moreProps);
                }
                break;
            }
            case "dblclick": {
                const moreProps = this.getMoreProps();

                if (this.props.onDoubleClick) {
                    this.props.onDoubleClick(e, moreProps);
                }
                if (this.moreProps.hovering && this.props.onDoubleClickWhenHover) {
                    this.props.onDoubleClickWhenHover(e, moreProps);
                }
                break;
            }
            case "pan": {
                this.moreProps.hovering = false;
                if (this.props.onPan) {
                    this.props.onPan(e, this.getMoreProps());
                }
                break;
            }
            case "panend": {
                if (this.props.onPanEnd) {
                    this.props.onPanEnd(e, this.getMoreProps());
                }
                break;
            }
            case "dragstart": {
                if (this.getPanConditions().draggable) {
                    const { amIOnTop } = this.context;
                    if (amIOnTop(this.subscriberId)) {
                        this.dragInProgress = true;
                        if (this.props.onDragStart !== undefined) {
                            this.props.onDragStart(e, this.getMoreProps());
                        }
                    }
                }
                break;
            }
            case "drag": {
                if (this.dragInProgress && this.props.onDrag) {
                    this.props.onDrag(e, this.getMoreProps());
                }
                break;
            }
            case "dragend": {
                if (this.dragInProgress && this.props.onDragComplete) {
                    this.props.onDragComplete(e, this.getMoreProps());
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

    public isHover(e: React.MouseEvent) {
        const { isHover } = this.props;
        if (isHover === undefined) {
            return false;
        }

        return isHover(this.getMoreProps(), e);
    }

    public getPanConditions() {
        const draggable =
            !!(this.props.selected && this.moreProps.hovering) ||
            (this.props.enableDragOnHover && this.moreProps.hovering);

        return {
            draggable,
            panEnabled: !this.props.disablePan,
        };
    }

    public draw({ trigger, force = false }: { force: boolean; trigger: string }) {
        const type = aliases[trigger] || trigger;
        const proceed = this.props.drawOn.indexOf(type) > -1;

        if (proceed || this.props.selected /* this is to draw as soon as you select */ || force) {
            const { canvasDraw } = this.props;
            if (canvasDraw === undefined) {
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

        subscribe(this.subscriberId, {
            chartId,
            clip,
            edgeClip,
            listener: this.listener,
            draw: this.draw,
            getPanConditions: this.getPanConditions,
        });

        this.UNSAFE_componentWillReceiveProps(this.props, this.context);
    }

    public componentWillUnmount() {
        const { unsubscribe } = this.context;
        unsubscribe(this.subscriberId);
        if (this.iSetTheCursorClass) {
            const { setCursorClass } = this.context;
            setCursorClass(null);
        }
    }

    public componentDidMount() {
        this.componentDidUpdate(this.props);
    }

    public componentDidUpdate(prevProps: GenericComponentProps) {
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
        if (canvasDraw !== undefined && !this.evaluationInProgress) {
            this.updateMoreProps(this.moreProps);
            this.drawOnCanvas();
        }
    }

    public UNSAFE_componentWillReceiveProps(nextProps: GenericComponentProps, nextContext: any) {
        const { xScale, plotData, chartConfig, getMutableState } = nextContext;

        this.moreProps = {
            ...this.moreProps,
            ...getMutableState(),
            /*
			^ this is so
			mouseXY, currentCharts, currentItem are available to
			newly created components like MouseHoverText which
			is created right after a new interactive object is drawn
			*/
            xScale,
            plotData,
            chartConfig,
        };
    }

    public getMoreProps() {
        const { xScale, plotData, chartConfigs, morePropsDecorator, xAccessor, displayXAccessor, width, height } =
            this.context;

        const { chartId, fullData } = this.context;

        const moreProps = {
            xScale,
            plotData,
            chartConfigs,
            xAccessor,
            displayXAccessor,
            width,
            height,
            chartId,
            fullData,
            ...this.moreProps,
        };

        return (morePropsDecorator || identity)(moreProps);
    }

    public preCanvasDraw(ctx: CanvasRenderingContext2D, moreProps: any) {
        // do nothing
    }

    public postCanvasDraw(ctx: CanvasRenderingContext2D, moreProps: any) {
        // empty
    }

    public drawOnCanvas() {
        const { canvasDraw, canvasToDraw } = this.props;
        if (canvasDraw === undefined || canvasToDraw === undefined) {
            return;
        }

        const { getCanvasContexts } = this.context;

        const moreProps = this.getMoreProps();

        const contexts = getCanvasContexts!()!;

        const ctx = canvasToDraw(contexts);
        if (ctx !== undefined) {
            this.preCanvasDraw(ctx, moreProps);
            canvasDraw(ctx, moreProps);
            this.postCanvasDraw(ctx, moreProps);
        }
    }

    public render() {
        const { canvasDraw, clip, svgDraw } = this.props;
        if (canvasDraw !== undefined || svgDraw === undefined) {
            return null;
        }

        const { chartId } = this.context;

        const suffix = chartId !== undefined ? "-" + chartId : "";

        const style = clip ? { clipPath: `url(#chart-area-clip${suffix})` } : undefined;

        return <g style={style}>{svgDraw(this.getMoreProps())}</g>;
    }
}

GenericComponent.contextType = ChartCanvasContext;

export const getAxisCanvas = (contexts: ICanvasContexts) => {
    return contexts.axes;
};

export const getMouseCanvas = (contexts: ICanvasContexts) => {
    return contexts.mouseCoord;
};
