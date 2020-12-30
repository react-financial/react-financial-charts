import {
    d3Window,
    first,
    getTouchProps,
    last,
    MOUSEMOVE,
    mousePosition,
    MOUSEUP,
    sign,
    TOUCHEND,
    TOUCHMOVE,
    touchPosition,
} from "@react-financial-charts/core";
import { mean } from "d3-array";
import { ScaleContinuousNumeric } from "d3-scale";
import { select, pointer } from "d3-selection";
import * as React from "react";

export interface AxisZoomCaptureProps {
    readonly axisZoomCallback?: (domain: number[]) => void;
    readonly bg: {
        h: number;
        x: number;
        w: number;
        y: number;
    };
    readonly className?: string;
    readonly getMoreProps: () => any;
    readonly getScale: (moreProps: any) => ScaleContinuousNumeric<number, number>;
    readonly getMouseDelta: (startXY: [number, number], mouseXY: [number, number]) => number;
    readonly innerTickSize?: number;
    readonly inverted?: boolean;
    readonly onDoubleClick?: (e: React.MouseEvent, mousePosition: [number, number]) => void;
    readonly onContextMenu?: (e: React.MouseEvent, mousePosition: [number, number]) => void;
    readonly outerTickSize?: number;
    readonly showDomain?: boolean;
    readonly showTicks?: boolean;
    readonly tickFormat?: (datum: number) => string;
    readonly tickPadding?: number;
    readonly tickSize?: number;
    readonly ticks?: number;
    readonly tickValues?: number[];
    readonly zoomCursorClassName?: string;
}

interface AxisZoomCaptureState {
    startPosition: { startScale: ScaleContinuousNumeric<number, number>; startXY: [number, number] } | null;
}

export class AxisZoomCapture extends React.Component<AxisZoomCaptureProps, AxisZoomCaptureState> {
    private readonly ref = React.createRef<SVGRectElement>();
    private clicked = false;
    private dragHappened = false;

    public constructor(props: AxisZoomCaptureProps) {
        super(props);

        this.state = {
            startPosition: null,
        };
    }

    public render() {
        const { bg, className, zoomCursorClassName } = this.props;

        const cursor =
            this.state.startPosition !== null ? zoomCursorClassName : "react-financial-charts-default-cursor";

        return (
            <rect
                className={`react-financial-charts-enable-interaction ${cursor} ${className}`}
                ref={this.ref}
                x={bg.x}
                y={bg.y}
                opacity={0}
                height={bg.h}
                width={bg.w}
                onContextMenu={this.handleRightClick}
                onMouseDown={this.handleDragStartMouse}
                onTouchStart={this.handleDragStartTouch}
            />
        );
    }

    private readonly handleDragEnd = (e: any) => {
        const container = this.ref.current;
        if (container === null) {
            return;
        }

        if (!this.dragHappened) {
            if (this.clicked) {
                const mouseXY = pointer(e, container);
                const { onDoubleClick } = this.props;
                if (onDoubleClick !== undefined) {
                    onDoubleClick(e, mouseXY);
                }
            } else {
                this.clicked = true;
                setTimeout(() => {
                    this.clicked = false;
                }, 300);
            }
        }

        select(d3Window(container)).on(MOUSEMOVE, null).on(MOUSEUP, null).on(TOUCHMOVE, null).on(TOUCHEND, null);

        this.setState({
            startPosition: null,
        });
    };

    private readonly handleDrag = (e: any) => {
        const container = this.ref.current;
        if (container === null) {
            return;
        }
        this.dragHappened = true;

        const { getMouseDelta, inverted = true } = this.props;

        const { startPosition } = this.state;
        if (startPosition !== null) {
            const { startScale } = startPosition;
            const { startXY } = startPosition;

            const mouseXY = pointer(e, container);

            const diff = getMouseDelta(startXY, mouseXY);

            const center = mean(startScale.range());
            if (center === undefined) {
                return;
            }

            const tempRange = startScale
                .range()
                .map((d) => (inverted ? d - sign(d - center) * diff : d + sign(d - center) * diff));

            const newDomain = tempRange.map(startScale.invert);

            if (
                sign(last(startScale.range()) - first(startScale.range())) === sign(last(tempRange) - first(tempRange))
            ) {
                const { axisZoomCallback } = this.props;
                if (axisZoomCallback !== undefined) {
                    axisZoomCallback(newDomain);
                }
            }
        }
    };

    private readonly handleDragStartTouch = (event: React.TouchEvent<SVGRectElement>) => {
        const container = this.ref.current;
        if (container === null) {
            return;
        }

        this.dragHappened = false;

        const { getScale, getMoreProps } = this.props;
        const allProps = getMoreProps();
        const startScale = getScale(allProps);

        if (event.touches.length === 1 && startScale.invert !== undefined) {
            select(d3Window(container)).on(TOUCHMOVE, this.handleDrag).on(TOUCHEND, this.handleDragEnd);

            const startXY = touchPosition(getTouchProps(event.touches[0]), event);

            this.setState({
                startPosition: {
                    startScale,
                    startXY,
                },
            });
        }
    };

    private readonly handleDragStartMouse = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        event.preventDefault();

        const container = this.ref.current;
        if (container === null) {
            return;
        }

        this.dragHappened = false;

        const { getScale, getMoreProps } = this.props;
        const allProps = getMoreProps();
        const startScale = getScale(allProps);

        if (startScale.invert !== undefined) {
            select(d3Window(container)).on(MOUSEMOVE, this.handleDrag, false).on(MOUSEUP, this.handleDragEnd, false);

            const startXY = mousePosition(event);

            this.setState({
                startPosition: {
                    startXY,
                    startScale,
                },
            });
        }
    };

    private readonly handleRightClick = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        event.stopPropagation();
        event.preventDefault();

        const container = this.ref.current;
        if (container === null) {
            return;
        }

        const { onContextMenu } = this.props;
        if (onContextMenu === undefined) {
            return;
        }

        const defaultRect = container.getBoundingClientRect();
        const mouseXY = mousePosition(event, defaultRect);

        select(d3Window(container)).on(MOUSEMOVE, null).on(MOUSEUP, null);

        this.setState({
            startPosition: null,
        });

        onContextMenu(event, mouseXY);
    };
}
