import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import { pointer, pointers, select } from "d3-selection";
import * as React from "react";

import {
    d3Window,
    getTouchProps,
    MOUSEENTER,
    MOUSELEAVE,
    MOUSEMOVE,
    mousePosition,
    MOUSEUP,
    TOUCHEND,
    TOUCHMOVE,
    touchPosition,
} from "./utils";
import { ChartConfig, getCurrentCharts } from "./utils/ChartDataUtil";

interface EventCaptureProps {
    readonly mouseMove: boolean;
    readonly zoom: boolean;
    readonly pan: boolean;
    readonly panSpeedMultiplier: number;
    readonly focus: boolean;
    readonly useCrossHairStyleCursor?: boolean;
    readonly width: number;
    readonly height: number;
    readonly chartConfig: ChartConfig[];
    readonly xAccessor: any; // func
    readonly xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
    readonly disableInteraction: boolean;
    readonly getAllPanConditions: () => { panEnabled: boolean; draggable: boolean }[];
    readonly onClick?: (mouseXY: number[], event: React.MouseEvent) => void;
    readonly onContextMenu?: (mouseXY: number[], event: React.MouseEvent) => void;
    readonly onDoubleClick?: (mouseXY: number[], event: React.MouseEvent) => void;
    readonly onDragStart?: (details: { startPos: number[] }, event: React.MouseEvent) => void;
    readonly onDrag?: (
        details: { startPos: [number, number]; mouseXY: [number, number] },
        event: React.MouseEvent,
    ) => void;
    readonly onDragComplete?: (details: { mouseXY: number[] }, event: React.MouseEvent) => void;
    readonly onMouseDown?: (mouseXY: [number, number], currentCharts: string[], event: React.MouseEvent) => void;
    readonly onMouseMove?: (
        touchXY: [number, number],
        eventType: string,
        event: React.MouseEvent | React.TouchEvent,
    ) => void;
    readonly onMouseEnter?: (event: React.MouseEvent) => void;
    readonly onMouseLeave?: (event: React.MouseEvent) => void;
    readonly onPinchZoom?: (
        initialPinch: {
            readonly xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
            readonly touch1Pos: [number, number];
            readonly touch2Pos: [number, number];
            readonly range: number[];
        },
        currentPinch: {
            readonly xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
            readonly touch1Pos: [number, number];
            readonly touch2Pos: [number, number];
        },
        e: React.TouchEvent,
    ) => void;
    readonly onPinchZoomEnd?: (
        initialPinch: {
            readonly xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
            readonly touch1Pos: [number, number];
            readonly touch2Pos: [number, number];
            readonly range: number[];
        },
        e: React.TouchEvent,
    ) => void;
    readonly onPan?: (
        mouseXY: [number, number],
        panStartXScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
        panOrigin: { dx: number; dy: number },
        chartsToPan: string[],
        e: React.MouseEvent,
    ) => void;
    readonly onPanEnd?: (
        mouseXY: [number, number],
        panStartXScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
        panOrigin: { dx: number; dy: number },
        chartsToPan: string[],
        e: React.MouseEvent | React.TouchEvent,
    ) => void;
    readonly onZoom?: (zoomDir: 1 | -1, mouseXY: number[], event: React.WheelEvent) => void;
}

interface EventCaptureState {
    cursorOverrideClass?: string;
    dragInProgress?: boolean;
    dragStartPosition?: [number, number];
    panInProgress: boolean;
    panStart?: {
        panStartXScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
        panOrigin: number[];
        chartsToPan: string[];
    };
    pinchZoomStart?: {
        xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
        touch1Pos: [number, number];
        touch2Pos: [number, number];
        range: number[];
        chartsToPan: string[];
    };
}

export class EventCapture extends React.Component<EventCaptureProps, EventCaptureState> {
    public static defaultProps = {
        mouseMove: false,
        zoom: false,
        pan: false,
        panSpeedMultiplier: 1,
        focus: false,
        disableInteraction: false,
    };

    private clicked?: boolean;
    private dx?: number = 0;
    private dy?: number = 0;
    private dragHappened?: boolean;
    private focus?: boolean;
    private lastNewPos?: [number, number];
    private mouseInside = false;
    private mouseInteraction = true;
    private panEndTimeout?: number;
    private panHappened?: boolean;
    private readonly ref = React.createRef<SVGRectElement>();

    public constructor(props: EventCaptureProps) {
        super(props);

        this.focus = props.focus;
        this.state = {
            panInProgress: false,
        };
    }

    public componentDidMount() {
        const { disableInteraction } = this.props;

        const { current } = this.ref;
        if (current === null) {
            return;
        }

        if (!disableInteraction) {
            // @ts-ignore
            select(current).on(MOUSEENTER, this.handleEnter).on(MOUSELEAVE, this.handleLeave);

            // @ts-ignore
            current.addEventListener("wheel", this.handleWheel, { passive: false });
        }
    }

    public componentDidUpdate() {
        this.componentDidMount();
    }

    public componentWillUnmount() {
        const { disableInteraction } = this.props;

        const { current } = this.ref;
        if (current === null) {
            return;
        }

        if (!disableInteraction) {
            select(current).on(MOUSEENTER, null).on(MOUSELEAVE, null);
            const win = d3Window(current);
            select(win).on(MOUSEMOVE, null);

            // @ts-ignore
            current.removeEventListener("wheel", this.handleWheel, { passive: false });
        }
    }

    public readonly handleEnter = (e: any) => {
        const { onMouseEnter } = this.props;
        if (onMouseEnter === undefined) {
            return;
        }

        this.mouseInside = true;
        if (!this.state.panInProgress && !this.state.dragInProgress) {
            const win = d3Window(this.ref.current);
            select(win).on(MOUSEMOVE, this.handleMouseMove);
        }
        onMouseEnter(e);
    };

    public handleLeave = (e: React.MouseEvent) => {
        const { onMouseLeave } = this.props;
        if (onMouseLeave === undefined) {
            return;
        }

        this.mouseInside = false;
        if (!this.state.panInProgress && !this.state.dragInProgress) {
            const win = d3Window(this.ref.current);
            select(win).on(MOUSEMOVE, null);
        }
        onMouseLeave(e);
    };

    public handleWheel = (e: React.WheelEvent) => {
        const { pan, onPan, zoom, onZoom } = this.props;

        if (!pan && !zoom) {
            return;
        }

        const { panInProgress } = this.state;

        const yZoom = Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 0;
        const mouseXY = mousePosition(e);
        e.preventDefault();

        if (zoom && this.focus && yZoom && !panInProgress) {
            const zoomDir = e.deltaY > 0 ? 1 : -1;

            if (onZoom !== undefined) {
                onZoom(zoomDir, mouseXY, e);
            }
        } else if (this.focus) {
            if (this.shouldPan() && this.state.panStart !== undefined) {
                // pan already in progress
                const { panStartXScale, chartsToPan } = this.state.panStart;
                this.lastNewPos = mouseXY;
                this.panHappened = true;

                if (this.dx === undefined) {
                    this.dx = 0;
                }
                if (this.dy === undefined) {
                    this.dy = 0;
                }

                this.dx -= e.deltaX;
                this.dy += e.deltaY;
                const dxdy = { dx: this.dx, dy: this.dy };

                if (onPan !== undefined) {
                    onPan(mouseXY, panStartXScale, dxdy, chartsToPan, e);
                }
            } else {
                const { xScale, chartConfig } = this.props;
                const currentCharts = getCurrentCharts(chartConfig, mouseXY);

                this.dx = 0;
                this.dy = 0;
                this.setState({
                    panInProgress: true,
                    panStart: {
                        panStartXScale: xScale,
                        panOrigin: mouseXY,
                        chartsToPan: currentCharts,
                    },
                });
            }
            this.queuePanEnd(e);
        }
    };

    public queuePanEnd(e: any) {
        if (this.panEndTimeout !== undefined) {
            window.clearTimeout(this.panEndTimeout);
        }
        this.panEndTimeout = window.setTimeout(() => {
            this.handlePanEnd(e);
        }, 100);
    }

    public handleMouseMove = (e: any) => {
        const { onMouseMove, mouseMove } = this.props;
        if (onMouseMove === undefined) {
            return;
        }

        if (this.mouseInteraction && mouseMove && !this.state.panInProgress) {
            const newPos = pointer(e, this.ref.current);

            onMouseMove(newPos, "mouse", e);
        }
    };

    public handleClick = (e: React.MouseEvent) => {
        const mouseXY = mousePosition(e);
        const { onClick, onDoubleClick } = this.props;

        if (!this.panHappened && !this.dragHappened) {
            if (this.clicked && onDoubleClick !== undefined) {
                onDoubleClick(mouseXY, e);
                this.clicked = false;
            } else if (onClick !== undefined) {
                onClick(mouseXY, e);
                this.clicked = true;
                setTimeout(() => {
                    if (this.clicked) {
                        this.clicked = false;
                    }
                }, 400);
            }
        }
    };

    public handleRightClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const { onContextMenu, onPanEnd } = this.props;

        const mouseXY = mousePosition(e, this.ref.current!.getBoundingClientRect());

        if (this.state.panStart !== undefined) {
            const {
                panStartXScale,
                panOrigin: [dx, dy],
                chartsToPan,
            } = this.state.panStart;

            if (this.panHappened && onPanEnd !== undefined) {
                onPanEnd(mouseXY, panStartXScale, { dx, dy }, chartsToPan, e);
            }
            const win = d3Window(this.ref.current);
            select(win).on(MOUSEMOVE, null).on(MOUSEUP, null);

            this.setState({
                panInProgress: false,
                panStart: undefined,
            });
        }

        if (onContextMenu !== undefined) {
            onContextMenu(mouseXY, e);
        }
    };

    public handleDrag = (e: any) => {
        const { onDrag } = this.props;
        if (onDrag === undefined) {
            return;
        }

        this.dragHappened = true;

        const { dragStartPosition } = this.state;
        if (dragStartPosition === undefined) {
            return;
        }

        const mouseXY = pointer(e, this.ref.current);

        onDrag(
            {
                startPos: dragStartPosition,
                mouseXY,
            },
            e,
        );
    };

    public cancelDrag() {
        const win = d3Window(this.ref.current);
        select(win)
            // @ts-ignore
            .on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null)
            .on(MOUSEUP, null);

        this.setState({
            dragInProgress: false,
        });
        this.mouseInteraction = true;
    }

    public handleDragEnd = (e: any) => {
        const mouseXY = pointer(e, this.ref.current);

        const win = d3Window(this.ref.current);
        select(win)
            // @ts-ignore
            .on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null)
            .on(MOUSEUP, null);

        if (this.dragHappened) {
            const { onDragComplete } = this.props;
            if (onDragComplete !== undefined) {
                onDragComplete({ mouseXY }, e);
            }
        }

        this.setState({
            dragInProgress: false,
        });
        this.mouseInteraction = true;
    };

    public canPan = () => {
        const { getAllPanConditions } = this.props;
        const { pan: initialPanEnabled } = this.props;

        const { panEnabled, draggable: somethingSelected } = getAllPanConditions().reduce(
            (returnObj, a) => {
                return {
                    draggable: returnObj.draggable || a.draggable,
                    panEnabled: returnObj.panEnabled && a.panEnabled,
                };
            },
            {
                draggable: false,
                panEnabled: initialPanEnabled,
            },
        );

        return {
            panEnabled,
            somethingSelected,
        };
    };

    public handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) {
            return;
        }
        const { xScale, chartConfig, onMouseDown } = this.props;

        this.panHappened = false;
        this.dragHappened = false;
        this.focus = true;

        if (!this.state.panInProgress && this.mouseInteraction) {
            const mouseXY = mousePosition(e);
            const currentCharts = getCurrentCharts(chartConfig, mouseXY);
            const { panEnabled, somethingSelected } = this.canPan();
            const pan = panEnabled && !somethingSelected;

            if (pan) {
                this.setState({
                    panInProgress: pan,
                    panStart: {
                        panStartXScale: xScale,
                        panOrigin: mouseXY,
                        chartsToPan: currentCharts,
                    },
                });

                const win = d3Window(this.ref.current);
                select(win).on(MOUSEMOVE, this.handlePan).on(MOUSEUP, this.handlePanEnd);
            } else if (somethingSelected) {
                this.setState({
                    panInProgress: false,
                    dragInProgress: true,
                    panStart: undefined,
                    dragStartPosition: mouseXY,
                });

                const { onDragStart } = this.props;

                if (onDragStart !== undefined) {
                    onDragStart({ startPos: mouseXY }, e);
                }

                const win = d3Window(this.ref.current);
                select(win).on(MOUSEMOVE, this.handleDrag).on(MOUSEUP, this.handleDragEnd);
            }

            if (onMouseDown !== undefined) {
                onMouseDown(mouseXY, currentCharts, e);
            }
        }
        e.preventDefault();
    };

    public shouldPan = () => {
        const { pan: panEnabled, onPan } = this.props;
        return panEnabled && onPan && this.state.panStart !== undefined;
    };

    public handlePan = (e: any) => {
        if (this.shouldPan() && this.state.panStart !== undefined) {
            this.panHappened = true;

            const { panStartXScale, panOrigin, chartsToPan } = this.state.panStart;

            let dx;
            let dy;
            let mouseXY;
            if (this.mouseInteraction) {
                mouseXY = pointer(e, this.ref.current);
                this.lastNewPos = mouseXY;
                dx = mouseXY[0] - panOrigin[0];
                dy = mouseXY[1] - panOrigin[1];
            } else {
                mouseXY = pointers(e, this.ref.current)[0];
                this.lastNewPos = mouseXY;
                dx = panOrigin[0] - mouseXY[0];
                dy = panOrigin[1] - mouseXY[1];
            }

            this.dx = dx;
            this.dy = dy;

            const { onPan } = this.props;
            if (onPan !== undefined) {
                onPan(mouseXY, panStartXScale, { dx, dy }, chartsToPan, e);
            }
        }
    };

    public handlePanEnd = (e: any) => {
        const { pan: panEnabled, onPanEnd } = this.props;

        if (this.state.panStart !== undefined) {
            const { panStartXScale, chartsToPan } = this.state.panStart;

            const win = d3Window(this.ref.current);
            select(win)
                // @ts-ignore
                .on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null)
                .on(MOUSEUP, null)
                .on(TOUCHMOVE, null)
                .on(TOUCHEND, null);

            if (this.panHappened && panEnabled && onPanEnd) {
                const { dx = 0, dy = 0 } = this;

                delete this.dx;
                delete this.dy;
                if (this.lastNewPos !== undefined) {
                    onPanEnd(this.lastNewPos, panStartXScale, { dx, dy }, chartsToPan, e);
                }
            }

            this.setState({
                panInProgress: false,
                panStart: undefined,
            });
        }
    };

    public handleTouchMove = (e: React.TouchEvent) => {
        const { onMouseMove } = this.props;
        if (onMouseMove === undefined) {
            return;
        }

        const touch = getTouchProps(e.touches[0]);
        const touchXY = touchPosition(touch, e);
        onMouseMove(touchXY, "touch", e);
    };

    public handleTouchStart = (e: React.TouchEvent) => {
        this.mouseInteraction = false;

        const { pan: panEnabled, chartConfig, onMouseMove, xScale, onPanEnd } = this.props;

        if (e.touches.length === 1) {
            this.panHappened = false;
            const touchXY = touchPosition(getTouchProps(e.touches[0]), e);
            if (onMouseMove !== undefined) {
                onMouseMove(touchXY, "touch", e);
            }

            if (panEnabled) {
                const currentCharts = getCurrentCharts(chartConfig, touchXY);

                this.setState({
                    panInProgress: true,
                    panStart: {
                        panStartXScale: xScale,
                        panOrigin: touchXY,
                        chartsToPan: currentCharts,
                    },
                });

                const win = d3Window(this.ref.current);
                select(win).on(TOUCHMOVE, this.handlePan, false).on(TOUCHEND, this.handlePanEnd, false);
            }
        } else if (e.touches.length === 2) {
            // pinch zoom begin
            // do nothing pinch zoom is handled in handleTouchMove
            const { panInProgress, panStart } = this.state;

            if (panInProgress && panEnabled && onPanEnd && panStart !== undefined) {
                const {
                    panStartXScale,
                    panOrigin: [dx, dy],
                    chartsToPan,
                } = panStart;

                const win = d3Window(this.ref.current);
                select(win)
                    // @ts-ignore
                    .on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null)
                    .on(MOUSEUP, null)
                    .on(TOUCHMOVE, this.handlePinchZoom, false)
                    .on(TOUCHEND, this.handlePinchZoomEnd, false);

                const touch1Pos = touchPosition(getTouchProps(e.touches[0]), e);
                const touch2Pos = touchPosition(getTouchProps(e.touches[1]), e);

                if (this.panHappened && panEnabled && onPanEnd && this.lastNewPos !== undefined) {
                    onPanEnd(this.lastNewPos, panStartXScale, { dx, dy }, chartsToPan, e);
                }

                this.setState({
                    panInProgress: false,
                    pinchZoomStart: {
                        xScale,
                        touch1Pos,
                        touch2Pos,
                        range: xScale.range(),
                        chartsToPan,
                    },
                });
            }
        }
    };

    public handlePinchZoom = (e: any) => {
        const { pinchZoomStart } = this.state;
        if (pinchZoomStart === undefined) {
            return;
        }

        const { xScale, zoom: zoomEnabled, onPinchZoom } = this.props;
        if (!zoomEnabled || onPinchZoom === undefined) {
            return;
        }

        const [touch1Pos, touch2Pos] = pointers(this.ref.current!);

        const { chartsToPan, ...initialPinch } = pinchZoomStart;

        onPinchZoom(
            initialPinch,
            {
                touch1Pos,
                touch2Pos,
                xScale,
            },
            e,
        );
    };

    public handlePinchZoomEnd = (e: any) => {
        const win = d3Window(this.ref.current);
        select(win).on(TOUCHMOVE, null).on(TOUCHEND, null);

        const { pinchZoomStart } = this.state;
        if (pinchZoomStart === undefined) {
            return;
        }

        const { chartsToPan, ...initialPinch } = pinchZoomStart;

        const { zoom: zoomEnabled, onPinchZoomEnd } = this.props;
        if (zoomEnabled && onPinchZoomEnd) {
            onPinchZoomEnd(initialPinch, e);
        }

        this.setState({
            pinchZoomStart: undefined,
        });
    };

    public setCursorClass = (cursorOverrideClass: string | undefined | null) => {
        if (cursorOverrideClass !== this.state.cursorOverrideClass) {
            this.setState({
                cursorOverrideClass: cursorOverrideClass === null ? undefined : cursorOverrideClass,
            });
        }
    };

    public render() {
        const { height, width, disableInteraction, useCrossHairStyleCursor } = this.props;

        const className = disableInteraction
            ? undefined
            : this.state.cursorOverrideClass !== undefined
            ? this.state.cursorOverrideClass
            : !useCrossHairStyleCursor
            ? undefined
            : this.state.panInProgress
            ? "react-financial-charts-grabbing-cursor"
            : "react-financial-charts-crosshair-cursor";

        const interactionProps = disableInteraction
            ? undefined
            : {
                  onMouseDown: this.handleMouseDown,
                  onClick: this.handleClick,
                  onContextMenu: this.handleRightClick,
                  onTouchStart: this.handleTouchStart,
                  onTouchMove: this.handleTouchMove,
              };

        return (
            <rect
                ref={this.ref}
                className={className}
                width={width}
                height={height}
                style={{ opacity: 0 }}
                {...interactionProps}
            />
        );
    }
}
