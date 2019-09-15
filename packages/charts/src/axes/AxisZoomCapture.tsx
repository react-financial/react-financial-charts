import { mean } from "d3-array";
import { event as d3Event, mouse, select, touches } from "d3-selection";
import * as React from "react";

import {
    d3Window,
    first,
    getTouchProps,
    isDefined,
    last,
    MOUSEMOVE,
    mousePosition,
    MOUSEUP,
    noop,
    sign,
    TOUCHEND,
    TOUCHMOVE,
    touchPosition,
} from "../utils";

interface AxisZoomCaptureProps {
    readonly innerTickSize?: number;
    readonly outerTickSize?: number;
    readonly tickFormat?: any; // func
    readonly tickPadding?: number;
    readonly tickSize?: number;
    readonly ticks?: number;
    readonly tickValues?: number[];
    readonly showDomain?: boolean;
    readonly showTicks?: boolean;
    readonly className?: string;
    readonly axisZoomCallback?: any; // func
    readonly inverted?: boolean;
    readonly bg: {
        h: number;
        x: number;
        w: number;
        y: number;
    };
    readonly zoomCursorClassName?: string;
    readonly getMoreProps: any; // func
    readonly getScale: any; // func
    readonly getMouseDelta: any; // func
    readonly onDoubleClick: any; // func
    readonly onContextMenu: any; // func
}

interface AxisZoomCaptureState {
    startPosition: any | null;
}

export class AxisZoomCapture extends React.Component<AxisZoomCaptureProps, AxisZoomCaptureState> {

    public static defaultProps = {
        onDoubleClick: noop,
        onContextMenu: noop,
        inverted: true,
    };

    private node;
    private mouseInteraction;
    private clicked;
    private dragHappened;

    public constructor(props) {
        super(props);
        this.state = {
            startPosition: null,
        };
    }

    public render() {
        const { bg, className, zoomCursorClassName } = this.props;

        const cursor = isDefined(this.state.startPosition)
            ? zoomCursorClassName
            : "react-financial-charts-default-cursor";

        return (
            <rect
                className={`react-financial-charts-enable-interaction ${cursor} ${className}`}
                ref={this.saveNode}
                x={bg.x} y={bg.y} opacity={0} height={bg.h} width={bg.w}
                onContextMenu={this.handleRightClick}
                onMouseDown={this.handleDragStartMouse}
                onTouchStart={this.handleDragStartTouch}
            />
        );
    }

    private readonly handleDragEnd = () => {

        if (!this.dragHappened) {
            if (this.clicked) {
                const e = d3Event;
                const mouseXY = this.mouseInteraction
                    ? mouse(this.node)
                    : touches(this.node)[0];
                const { onDoubleClick } = this.props;

                onDoubleClick(mouseXY, e);
            } else {
                this.clicked = true;
                setTimeout(() => {
                    this.clicked = false;
                }, 300);
            }
        }

        select(d3Window(this.node))
            .on(MOUSEMOVE, null)
            .on(MOUSEUP, null)
            .on(TOUCHMOVE, null)
            .on(TOUCHEND, null);

        this.setState({
            startPosition: null,
        });
    }

    private readonly handleDrag = () => {
        const { startPosition } = this.state;
        const { getMouseDelta, inverted } = this.props;

        this.dragHappened = true;
        if (isDefined(startPosition)) {
            const { startScale } = startPosition;
            const { startXY } = startPosition;

            const mouseXY = this.mouseInteraction
                ? mouse(this.node)
                : touches(this.node)[0];

            const diff = getMouseDelta(startXY, mouseXY);

            const center = mean(startScale.range());
            if (center === undefined) {
                return;
            }

            const tempRange = startScale
                .range()
                .map((d) => inverted ? d - sign(d - center) * diff : d + sign(d - center) * diff);

            const newDomain = tempRange.map(startScale.invert);

            if (sign(last(startScale.range()) - first(startScale.range())) === sign(last(tempRange) - first(tempRange))) {

                const { axisZoomCallback } = this.props;
                axisZoomCallback(newDomain);
            }
        }
    }

    private readonly handleDragStartTouch = (e) => {
        this.mouseInteraction = false;

        const { getScale, getMoreProps } = this.props;
        const startScale = getScale(getMoreProps());
        this.dragHappened = false;

        if (e.touches.length === 1 && startScale.invert) {
            select(d3Window(this.node))
                .on(TOUCHMOVE, this.handleDrag)
                .on(TOUCHEND, this.handleDragEnd);

            const startXY = touchPosition(getTouchProps(e.touches[0]), e);

            this.setState({
                startPosition: {
                    startXY,
                    startScale,
                },
            });
        }
    }

    private readonly handleDragStartMouse = (e) => {
        this.mouseInteraction = true;

        const { getScale, getMoreProps } = this.props;
        const startScale = getScale(getMoreProps());
        this.dragHappened = false;

        if (startScale.invert) {
            select(d3Window(this.node))
                .on(MOUSEMOVE, this.handleDrag, false)
                .on(MOUSEUP, this.handleDragEnd, false);

            const startXY = mousePosition(e);

            this.setState({
                startPosition: {
                    startXY,
                    startScale,
                },
            });
        }
        e.preventDefault();
    }

    private readonly handleRightClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        const { onContextMenu } = this.props;

        const mouseXY = mousePosition(e, this.node.getBoundingClientRect());

        select(d3Window(this.node))
            .on(MOUSEMOVE, null)
            .on(MOUSEUP, null);
        this.setState({
            startPosition: null,
        });

        onContextMenu(mouseXY, e);
    }

    private readonly saveNode = (node) => {
        this.node = node;
    }
}
