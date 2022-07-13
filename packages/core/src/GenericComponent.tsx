/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
    ForwardedRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { ICanvasContexts } from "./CanvasContainer";
import { ChartCanvasContext } from "./ChartCanvas";
import { useEvent } from "./useEvent";
import { ChartConfig } from "./utils/ChartDataUtil";
import { ChartContext } from "./Chart";
import { ScaleContinuousNumeric } from "d3-scale";

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

export interface GenericComponentProps {
    readonly svgDraw?: (moreProps: any) => React.ReactNode;
    readonly canvasDraw?: (ctx: CanvasRenderingContext2D, moreProps: MoreProps) => void;
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
    readonly shouldTypeProceed?: (type: string, moreProps: MoreProps) => boolean;
    readonly preCanvasDraw?: (ctx: CanvasRenderingContext2D, moreProps: MoreProps) => void;
    readonly postCanvasDraw?: (ctx: CanvasRenderingContext2D, moreProps: MoreProps) => void;
    readonly updateMoreProps?: (newMoreProps: Partial<MoreProps> | undefined, moreProps: MoreProps) => void;
    readonly getMoreProps?: (moreProps: MoreProps) => Partial<MoreProps>;
}

export interface MoreProps {
    chartId: string | number;
    hovering: boolean;
    currentCharts: (string | number)[];
    startPos?: [number, number];
    mouseXY?: [number, number];
    chartConfigs: ChartConfig[];
    chartConfig?: ChartConfig;
    fullData: any[];
    plotData: any[];
    xAccessor: (datum: any) => any;
    xScale: Function;
    yScale?: ScaleContinuousNumeric<number, number>;
}

export interface GenericComponentRef {
    getMoreProps: () => MoreProps;
}

export const GenericComponent = React.memo(
    React.forwardRef((props: GenericComponentProps, ref: ForwardedRef<GenericComponentRef>) => {
        const context = useContext(ChartCanvasContext);
        const { chartId } = useContext(ChartContext);
        const subscriberId = useMemo(() => context.generateSubscriptionId?.() || 0, []);
        const [, setUpdateCount] = useState(0);
        const { subscribe, unsubscribe } = context;
        const {
            clip = true,
            edgeClip = false,
            canvasToDraw = (contexts: ICanvasContexts) => contexts.mouseCoord,
        } = props;
        const moreProps = React.useRef<MoreProps>({
            chartId: context.chartId,
            hovering: false,
            currentCharts: [],
            chartConfigs: context.chartConfigs,
            fullData: context.fullData,
            plotData: context.plotData,
            xScale: context.xScale,
            xAccessor: context.xAccessor,
        });
        const dragInProgressRef = useRef(false);
        const evaluationInProgressRef = useRef(false);
        const iSetTheCursorClassRef = useRef(false);

        const updateMoreProps = useCallback(
            (newMoreProps: Partial<MoreProps> | undefined, moreProps: MoreProps) => {
                Object.assign(moreProps, newMoreProps || {});
                props.updateMoreProps?.(newMoreProps, moreProps);
            },
            [props.updateMoreProps],
        );

        const getMoreProps = useCallback(() => {
            const { chartConfigs, xAccessor, displayXAccessor, width, height, fullData } = context;

            const otherMoreProps = props.getMoreProps?.(moreProps.current);

            return {
                displayXAccessor,
                width,
                height,
                ...moreProps.current,
                fullData,
                chartConfigs,
                xAccessor,
                ...otherMoreProps,
            };
        }, [context, props.getMoreProps]);

        useImperativeHandle(
            ref,
            () => ({
                getMoreProps,
            }),
            [getMoreProps],
        );

        const isHover = useCallback(
            (e: React.MouseEvent) => {
                if (props.isHover === undefined) {
                    return false;
                }

                return props.isHover(getMoreProps(), e);
            },
            [props.isHover, getMoreProps],
        );

        const preCanvasDraw = useCallback(
            (ctx: CanvasRenderingContext2D, moreProps: MoreProps) => {
                props.preCanvasDraw?.(ctx, moreProps);
            },
            [props.preCanvasDraw],
        );

        const postCanvasDraw = useCallback(
            (ctx: CanvasRenderingContext2D, moreProps: MoreProps) => {
                props.postCanvasDraw?.(ctx, moreProps);
            },
            [props.postCanvasDraw],
        );

        const evaluateType = useEvent((type: string, e: any) => {
            const newType = aliases[type] || type;
            const proceed = props.drawOn.includes(newType);
            if (!proceed) {
                return;
            }

            if (props.shouldTypeProceed && !props.shouldTypeProceed(type, moreProps.current)) {
                return;
            }

            switch (type) {
                case "zoom":
                case "mouseenter":
                    // DO NOT DRAW FOR THESE EVENTS
                    break;
                case "mouseleave": {
                    moreProps.current.hovering = false;

                    if (props.onUnHover) {
                        props.onUnHover(e, getMoreProps());
                    }
                    break;
                }
                case "contextmenu": {
                    if (props.onContextMenu) {
                        props.onContextMenu(e, getMoreProps());
                    }
                    if (moreProps.current.hovering && props.onContextMenuWhenHover) {
                        props.onContextMenuWhenHover(e, getMoreProps());
                    }
                    break;
                }
                case "mousedown": {
                    if (props.onMouseDown) {
                        props.onMouseDown(e, getMoreProps());
                    }
                    break;
                }
                case "click": {
                    const { onClick, onClickOutside, onClickWhenHover } = props;
                    const moreProps = getMoreProps();
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
                    const prevHover = moreProps.current.hovering;
                    moreProps.current.hovering = isHover(e);

                    const { amIOnTop, setCursorClass } = context;

                    if (
                        moreProps.current.hovering &&
                        !props.selected &&
                        /* && !prevHover */
                        amIOnTop(subscriberId) &&
                        props.onHover !== undefined
                    ) {
                        setCursorClass("react-financial-charts-pointer-cursor");
                        iSetTheCursorClassRef.current = true;
                    } else if (moreProps.current.hovering && props.selected && amIOnTop(subscriberId)) {
                        setCursorClass(props.interactiveCursorClass);
                        iSetTheCursorClassRef.current = true;
                    } else if (prevHover && !moreProps.current.hovering && iSetTheCursorClassRef.current) {
                        iSetTheCursorClassRef.current = false;
                        setCursorClass(null);
                    }
                    const morePropsSub = getMoreProps();

                    if (moreProps.current.hovering && !prevHover) {
                        if (props.onHover) {
                            props.onHover(e, morePropsSub);
                        }
                    }
                    if (prevHover && !moreProps.current.hovering) {
                        if (props.onUnHover) {
                            props.onUnHover(e, morePropsSub);
                        }
                    }

                    if (props.onMouseMove) {
                        props.onMouseMove(e, morePropsSub);
                    }
                    break;
                }
                case "dblclick": {
                    const morePropsSub = getMoreProps();

                    if (props.onDoubleClick) {
                        props.onDoubleClick(e, morePropsSub);
                    }
                    if (moreProps.current.hovering && props.onDoubleClickWhenHover) {
                        props.onDoubleClickWhenHover(e, morePropsSub);
                    }
                    break;
                }
                case "pan": {
                    moreProps.current.hovering = false;
                    if (props.onPan) {
                        props.onPan(e, getMoreProps());
                    }
                    break;
                }
                case "panend": {
                    if (props.onPanEnd) {
                        props.onPanEnd(e, getMoreProps());
                    }
                    break;
                }
                case "dragstart": {
                    if (getPanConditions().draggable) {
                        const { amIOnTop } = context;
                        if (amIOnTop(subscriberId)) {
                            dragInProgressRef.current = true;
                            if (props.onDragStart !== undefined) {
                                props.onDragStart(e, getMoreProps());
                            }
                        }
                    }
                    break;
                }
                case "drag": {
                    if (dragInProgressRef.current && props.onDrag) {
                        props.onDrag(e, getMoreProps());
                    }
                    break;
                }
                case "dragend": {
                    if (dragInProgressRef.current && props.onDragComplete) {
                        props.onDragComplete(e, getMoreProps());
                    }
                    dragInProgressRef.current = false;
                    break;
                }
                case "dragcancel": {
                    if (dragInProgressRef.current || iSetTheCursorClassRef.current) {
                        const { setCursorClass } = context;
                        setCursorClass(null);
                    }
                    break;
                }
            }
        });

        const listener = useEvent((type: string, newMoreProps: MoreProps | undefined, state: any, e: any) => {
            if (newMoreProps) {
                updateMoreProps(newMoreProps, moreProps.current);
            }
            evaluationInProgressRef.current = true;
            evaluateType(type, e);
            evaluationInProgressRef.current = false;
        });

        const drawOnCanvas = useCallback(() => {
            const { canvasDraw } = props;
            if (canvasDraw === undefined || canvasToDraw === undefined) {
                return;
            }

            const moreProps = getMoreProps();

            const contexts = context.getCanvasContexts?.();

            if (contexts === undefined) {
                return;
            }

            const ctx = canvasToDraw(contexts);
            if (ctx !== undefined) {
                preCanvasDraw(ctx, moreProps);
                canvasDraw(ctx, moreProps);
                postCanvasDraw(ctx, moreProps);
            }
        }, [canvasToDraw, props.canvasDraw, context.getCanvasContexts, preCanvasDraw, postCanvasDraw, getMoreProps]);

        const draw = useEvent(({ trigger, force = false }: { force: boolean; trigger: string }) => {
            const type = aliases[trigger] || trigger;
            const proceed = props.drawOn.indexOf(type) > -1;

            if (proceed || props.selected /* this is to draw as soon as you select */ || force) {
                const { canvasDraw } = props;
                if (canvasDraw === undefined) {
                    setUpdateCount((u) => u + 1);
                } else {
                    drawOnCanvas();
                }
            }
        });
        const getPanConditions = useEvent(() => {
            const draggable =
                (props.selected && moreProps.current.hovering) ||
                (props.enableDragOnHover && moreProps.current.hovering);

            return {
                draggable: !!draggable,
                panEnabled: !props.disablePan,
            };
        });

        useEffect(() => {
            const { setCursorClass } = context;
            if (props.selected && moreProps.current.hovering) {
                iSetTheCursorClassRef.current = true;
                setCursorClass(props.interactiveCursorClass);
            } else {
                iSetTheCursorClassRef.current = false;
                setCursorClass(null);
            }
        }, [props.selected]);

        useEffect(() => {
            if (props.canvasDraw !== undefined && !evaluationInProgressRef.current) {
                updateMoreProps(undefined, moreProps.current);
                drawOnCanvas();
            }
        });

        useEffect(() => {
            subscribe(subscriberId, {
                chartId,
                clip,
                edgeClip,
                listener,
                draw,
                getPanConditions,
            });
            return () => {
                unsubscribe(subscriberId);
                if (iSetTheCursorClassRef.current) {
                    context.setCursorClass(null);
                }
            };
        }, [chartId, subscriberId, edgeClip, clip]);

        const { canvasDraw, svgDraw } = props;
        if (canvasDraw !== undefined || svgDraw === undefined) {
            return null;
        }

        const suffix = chartId !== undefined ? "-" + chartId : "";

        const style = clip ? { clipPath: `url(#chart-area-clip${suffix})` } : undefined;

        return <g style={style}>{svgDraw(getMoreProps())}</g>;
    }),
);

export const getAxisCanvas = (contexts: ICanvasContexts) => {
    return contexts.axes;
};

export const getMouseCanvas = (contexts: ICanvasContexts) => {
    return contexts.mouseCoord;
};
