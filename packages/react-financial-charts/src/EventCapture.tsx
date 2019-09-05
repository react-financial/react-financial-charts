import { event as d3Event, mouse, select, touches } from "d3-selection";
import * as React from "react";

import {
    d3Window, getTouchProps, isDefined, MOUSEENTER,
    MOUSELEAVE,
    MOUSEMOVE, mousePosition,
    MOUSEUP, noop,
    TOUCHEND, TOUCHMOVE,
    touchPosition,
} from "./utils";
import { getCurrentCharts } from "./utils/ChartDataUtil";

interface EventCaptureProps {
    mouseMove: boolean;
    zoom: boolean;
    pan: boolean;
    panSpeedMultiplier: number;
    focus: boolean;
    useCrossHairStyleCursor?: boolean;
    width: number;
    height: number;
    chartConfig: Array<{ origin: number[], height: number }>;
    xAccessor: any; // func
    xScale: any; // func
    disableInteraction: boolean;
    getAllPanConditions: () => Array<{ panEnabled: boolean, draggable: boolean }>;
    onMouseMove?: (touchXY: number[], eventType: string, event: React.TouchEvent) => void;
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onZoom?: (zoomDir: 1 | -1, mouseXY: number[], event: React.WheelEvent) => void;
    onPinchZoom?: any; // func
    onPinchZoomEnd: any; // func
    onPan?: any; // func
    onPanEnd?: any; // func
    onDragStart?: (details: { startPos: number[] }, event: React.MouseEvent) => void;
    onDrag?: (details: { startPos: number[], mouseXY: number[] }, event: React.MouseEvent) => void;
    onDragComplete?: (details: { mouseXY: number[] }, event: React.MouseEvent) => void;
    onClick?: (mouseXY: number[], event: React.MouseEvent) => void;
    onDoubleClick?: (mouseXY: number[], event: React.MouseEvent) => void;
    onContextMenu?: (mouseXY: number[], event: React.MouseEvent) => void;
    onMouseDown?: (mouseXY: number[], currentCharts: any, event: React.MouseEvent) => void;
}

interface EventCaptureState {
    cursorOverrideClass?: string;
    dragInProgress?: boolean;
    dragStartPosition?: any;
    panInProgress: boolean;
    panStart?: any;
    pinchZoomStart?: any;
}

export class EventCapture extends React.Component<EventCaptureProps, EventCaptureState> {

    public static defaultProps = {
        mouseMove: false,
        zoom: false,
        pan: false,
        panSpeedMultiplier: 1,
        focus: false,
        onDragComplete: noop,
        disableInteraction: false,
    };

    private clicked?: boolean;
    private dx: number = 0;
    private dy: number = 0;
    private dragHappened?: boolean;
    private focus?: boolean;
    private lastNewPos?;
    private mouseInside: boolean;
    private mouseInteraction: boolean;
    private node;
    private panEndTimeout?;
    private panHappened?: boolean;

    constructor(props: EventCaptureProps) {
        super(props);

        this.handleEnter = this.handleEnter.bind(this);
        this.handleLeave = this.handleLeave.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handlePanEnd = this.handlePanEnd.bind(this);
        this.handlePan = this.handlePan.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handlePinchZoom = this.handlePinchZoom.bind(this);
        this.handlePinchZoomEnd = this.handlePinchZoomEnd.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleRightClick = this.handleRightClick.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.shouldPan = this.shouldPan.bind(this);
        this.canPan = this.canPan.bind(this);
        this.setCursorClass = this.setCursorClass.bind(this);
        this.saveNode = this.saveNode.bind(this);
        this.mouseInside = false;
        this.mouseInteraction = true;
        this.focus = props.focus;
        this.state = {
            panInProgress: false,
        };
    }

    public saveNode(node) {
        this.node = node;
    }

    public componentDidMount() {
        if (this.node) {
            select(this.node)
                .on(MOUSEENTER, this.handleEnter)
                .on(MOUSELEAVE, this.handleLeave);
        }
    }

    public componentDidUpdate() {
        this.componentDidMount();
    }

    public componentWillUnmount() {
        if (this.node) {
            select(this.node)
                .on(MOUSEENTER, null)
                .on(MOUSELEAVE, null);
            const win = d3Window(this.node);
            select(win)
                .on(MOUSEMOVE, null);
        }
    }

    public handleEnter() {
        const { onMouseEnter } = this.props;
        if (onMouseEnter === undefined) {
            return;
        }

        const e = d3Event;
        this.mouseInside = true;
        if (!this.state.panInProgress
            && !this.state.dragInProgress) {
            const win = d3Window(this.node);
            select(win)
                .on(MOUSEMOVE, this.handleMouseMove);
        }
        onMouseEnter(e);
    }

    public handleLeave(e: React.MouseEvent) {
        const { onMouseLeave } = this.props;
        if (onMouseLeave === undefined) {
            return;
        }

        this.mouseInside = false;
        if (!this.state.panInProgress
            && !this.state.dragInProgress) {
            const win = d3Window(this.node);
            select(win)
                .on(MOUSEMOVE, null);
        }
        onMouseLeave(e);
    }

    public handleWheel(e: React.WheelEvent) {
        const { zoom, onZoom } = this.props;
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
            if (this.shouldPan()) {
                // pan already in progress
                const {
                    panStartXScale,
                    chartsToPan,
                } = this.state.panStart;
                this.lastNewPos = mouseXY;
                this.panHappened = true;

                this.dx += e.deltaX;
                this.dy += e.deltaY;
                const dxdy = { dx: this.dx, dy: this.dy };

                this.props.onPan(mouseXY, panStartXScale, dxdy, chartsToPan, e);
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
            this.queuePanEnd();
        }
    }

    public queuePanEnd() {
        if (isDefined(this.panEndTimeout)) {
            clearTimeout(this.panEndTimeout);
        }
        this.panEndTimeout = setTimeout(() => {
            this.handlePanEnd();
        }, 100);
    }

    public handleMouseMove() {
        const e = d3Event;

        const { onMouseMove, mouseMove } = this.props;

        if (this.mouseInteraction &&
            mouseMove &&
            !this.state.panInProgress) {

            const newPos = mouse(this.node);

            if (onMouseMove !== undefined) {
                onMouseMove(newPos, "mouse", e);
            }
        }
    }

    public handleClick(e: React.MouseEvent) {
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
    }

    public handleRightClick(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        const { onContextMenu, onPanEnd } = this.props;

        const mouseXY = mousePosition(e, this.node.getBoundingClientRect());

        if (isDefined(this.state.panStart)) {
            const { panStartXScale, panOrigin, chartsToPan } = this.state.panStart;
            if (this.panHappened) {
                onPanEnd(mouseXY, panStartXScale, panOrigin, chartsToPan, e);
            }
            const win = d3Window(this.node);
            select(win)
                .on(MOUSEMOVE, null)
                .on(MOUSEUP, null);

            this.setState({
                panInProgress: false,
                panStart: null,
            });
        }

        if (onContextMenu !== undefined) {
            onContextMenu(mouseXY, e);
        }
    }

    public handleDrag() {
        const e = d3Event;
        if (this.props.onDrag) {
            this.dragHappened = true;
            const mouseXY = mouse(this.node);
            this.props.onDrag({
                startPos: this.state.dragStartPosition,
                mouseXY,
            }, e);
        }
    }

    public cancelDrag() {
        const win = d3Window(this.node);
        select(win)
            .on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null)
            .on(MOUSEUP, null);

        this.setState({
            dragInProgress: false,
        });
        this.mouseInteraction = true;
    }

    public handleDragEnd() {
        const e = d3Event;
        const mouseXY = mouse(this.node);

        const win = d3Window(this.node);
        select(win)
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
    }

    public canPan() {
        const { getAllPanConditions } = this.props;
        const { pan: initialPanEnabled } = this.props;

        const {
            panEnabled,
            draggable: somethingSelected,
        } = getAllPanConditions()
            .reduce((returnObj, a) => {
                return {
                    draggable: returnObj.draggable || a.draggable,
                    panEnabled: returnObj.panEnabled && a.panEnabled,
                };
            }, {
                draggable: false,
                panEnabled: initialPanEnabled,
            });

        return {
            panEnabled,
            somethingSelected,
        };
    }

    public handleMouseDown(e: React.MouseEvent) {
        if (e.button !== 0) {
            return;
        }
        const { xScale, chartConfig, onMouseDown } = this.props;

        this.panHappened = false;
        this.dragHappened = false;
        this.focus = true;

        if (!this.state.panInProgress
            && this.mouseInteraction
        ) {

            const mouseXY = mousePosition(e);
            const currentCharts = getCurrentCharts(chartConfig, mouseXY);
            const {
                panEnabled, somethingSelected,
            } = this.canPan();
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

                const win = d3Window(this.node);
                select(win)
                    .on(MOUSEMOVE, this.handlePan)
                    .on(MOUSEUP, this.handlePanEnd);

            } else if (somethingSelected) {
                this.setState({
                    panInProgress: false,
                    dragInProgress: true,
                    panStart: null,
                    dragStartPosition: mouseXY,
                });

                const { onDragStart } = this.props;

                if (onDragStart !== undefined) {
                    onDragStart({ startPos: mouseXY }, e);
                }

                const win = d3Window(this.node);
                select(win)
                    .on(MOUSEMOVE, this.handleDrag)
                    .on(MOUSEUP, this.handleDragEnd);
            }

            if (onMouseDown !== undefined) {
                onMouseDown(mouseXY, currentCharts, e);
            }
        }
        e.preventDefault();
    }

    public shouldPan() {
        const { pan: panEnabled, onPan } = this.props;
        return panEnabled
            && onPan
            && isDefined(this.state.panStart);
    }

    public handlePan() {
        const e = d3Event;

        if (this.shouldPan()) {
            this.panHappened = true;

            const { panStartXScale, panOrigin, chartsToPan } = this.state.panStart;

            const mouseXY = this.mouseInteraction
                ? mouse(this.node)
                : touches(this.node)[0];

            this.lastNewPos = mouseXY;
            const dx = mouseXY[0] - panOrigin[0];
            const dy = mouseXY[1] - panOrigin[1];

            this.dx = dx;
            this.dy = dy;

            this.props.onPan(
                mouseXY, panStartXScale, { dx, dy }, chartsToPan, e,
            );
        }
    }

    public handlePanEnd() {
        const e = d3Event;
        const { pan: panEnabled, onPanEnd } = this.props;

        if (isDefined(this.state.panStart)) {
            const { panStartXScale, chartsToPan } = this.state.panStart;

            const win = d3Window(this.node);
            select(win)
                .on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null)
                .on(MOUSEUP, null)
                .on(TOUCHMOVE, null)
                .on(TOUCHEND, null);

            if (this.panHappened
                // && !this.contextMenuClicked
                && panEnabled
                && onPanEnd) {
                const { dx, dy } = this;

                delete this.dx;
                delete this.dy;
                onPanEnd(this.lastNewPos, panStartXScale, { dx, dy }, chartsToPan, e);
            }

            this.setState({
                panInProgress: false,
                panStart: null,
            });
        }
    }

    public handleTouchMove(e: React.TouchEvent) {
        const { onMouseMove } = this.props;
        if (onMouseMove === undefined) {
            return;
        }

        const touchXY = touchPosition(getTouchProps(e.touches[0]), e);
        onMouseMove(touchXY, "touch", e);
    }

    public handleTouchStart(e: React.TouchEvent) {
        this.mouseInteraction = false;

        const { pan: panEnabled, chartConfig, onMouseMove } = this.props;
        const { xScale, onPanEnd } = this.props;

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

                const win = d3Window(this.node);
                select(win)
                    .on(TOUCHMOVE, this.handlePan, false)
                    .on(TOUCHEND, this.handlePanEnd, false);

            }
        } else if (e.touches.length === 2) {
            // pinch zoom begin
            // do nothing pinch zoom is handled in handleTouchMove
            const { panInProgress, panStart } = this.state;

            if (panInProgress && panEnabled && onPanEnd) {
                const { panStartXScale, panOrigin, chartsToPan } = panStart;

                const win = d3Window(this.node);
                select(win)
                    .on(MOUSEMOVE, this.mouseInside ? this.handleMouseMove : null)
                    .on(MOUSEUP, null)
                    .on(TOUCHMOVE, this.handlePinchZoom, false)
                    .on(TOUCHEND, this.handlePinchZoomEnd, false);

                const touch1Pos = touchPosition(getTouchProps(e.touches[0]), e);
                const touch2Pos = touchPosition(getTouchProps(e.touches[1]), e);

                if (this.panHappened
                    // && !this.contextMenuClicked
                    && panEnabled
                    && onPanEnd) {

                    onPanEnd(this.lastNewPos, panStartXScale, panOrigin, chartsToPan, e);
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
    }

    public handlePinchZoom() {
        const e = d3Event;
        const [touch1Pos, touch2Pos] = touches(this.node);
        const { xScale, zoom: zoomEnabled, onPinchZoom } = this.props;

        // eslint-disable-next-line no-unused-vars
        const { chartsToPan, ...initialPinch } = this.state.pinchZoomStart;

        if (zoomEnabled && onPinchZoom) {
            onPinchZoom(initialPinch, {
                touch1Pos,
                touch2Pos,
                xScale,
            }, e);
        }
    }

    public handlePinchZoomEnd() {
        const e = d3Event;

        const win = d3Window(this.node);
        select(win)
            .on(TOUCHMOVE, null)
            .on(TOUCHEND, null);

        const { zoom: zoomEnabled, onPinchZoomEnd } = this.props;

        // eslint-disable-next-line no-unused-vars
        const { chartsToPan, ...initialPinch } = this.state.pinchZoomStart;

        if (zoomEnabled && onPinchZoomEnd) {
            onPinchZoomEnd(initialPinch, e);
        }

        this.setState({
            pinchZoomStart: undefined,
        });
    }

    public setCursorClass(cursorOverrideClass) {
        if (cursorOverrideClass !== this.state.cursorOverrideClass) {
            this.setState({
                cursorOverrideClass,
            });
        }
    }

    public render() {
        const { height, width, disableInteraction, useCrossHairStyleCursor } = this.props;
        const className = this.state.cursorOverrideClass !== undefined
            ? this.state.cursorOverrideClass
            : !useCrossHairStyleCursor ? "" : this.state.panInProgress
                ? "react-stockcharts-grabbing-cursor"
                : "react-stockcharts-crosshair-cursor";

        const interactionProps = disableInteraction || {
            onWheel: this.handleWheel,
            onMouseDown: this.handleMouseDown,
            onClick: this.handleClick,
            onContextMenu: this.handleRightClick,
            onTouchStart: this.handleTouchStart,
            onTouchMove: this.handleTouchMove,
        };

        return (
            <rect
                ref={this.saveNode}
                className={className}
                width={width}
                height={height}
                style={{ opacity: 0 }}
                {...interactionProps}
            />
        );
    }
}
