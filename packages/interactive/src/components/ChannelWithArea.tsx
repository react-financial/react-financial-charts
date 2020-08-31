import * as React from "react";
import { isDefined, isNotDefined, getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { generateLine, isHovering } from "./InteractiveStraightLine";

export interface ChannelWithAreaProps {
    readonly startXY?: number[];
    readonly endXY?: number[];
    readonly dy?: number;
    readonly interactiveCursorClass?: string;
    readonly strokeStyle: string;
    readonly strokeWidth: number;
    readonly fillStyle: string;
    readonly type:
        | "XLINE" // extends from -Infinity to +Infinity
        | "RAY" // extends to +/-Infinity in one direction
        | "LINE"; // extends between the set bounds
    readonly onDragStart?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDrag?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onUnHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly defaultClassName?: string;
    readonly tolerance: number;
    readonly selected: boolean;
}

export class ChannelWithArea extends React.Component<ChannelWithAreaProps> {
    public static defaultProps = {
        type: "LINE",
        strokeWidth: 1,
        tolerance: 4,
        selected: false,
    };

    public render() {
        const { selected, interactiveCursorClass } = this.props;
        const { onDragStart, onDrag, onDragComplete, onHover, onUnHover } = this.props;

        return (
            <GenericChartComponent
                isHover={this.isHover}
                canvasToDraw={getMouseCanvas}
                canvasDraw={this.drawOnCanvas}
                interactiveCursorClass={interactiveCursorClass}
                selected={selected}
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragComplete={onDragComplete}
                onHover={onHover}
                onUnHover={onUnHover}
                drawOn={["mousemove", "mouseleave", "pan", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { strokeStyle, strokeWidth, fillStyle } = this.props;
        const { line1, line2 } = helper(this.props, moreProps);

        if (line1 !== undefined) {
            const { x1, y1, x2, y2 } = line1;

            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = strokeStyle;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            if (line2 !== undefined) {
                const { y1: line2Y1, y2: line2Y2 } = line2;

                ctx.beginPath();
                ctx.moveTo(x1, line2Y1);
                ctx.lineTo(x2, line2Y2);
                ctx.stroke();

                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                ctx.moveTo(x1, y1);

                ctx.lineTo(x2, y2);
                ctx.lineTo(x2, line2Y2);
                ctx.lineTo(x1, line2Y1);

                ctx.closePath();
                ctx.fill();
            }
        }
    };

    private readonly isHover = (moreProps: any) => {
        const { tolerance, onHover } = this.props;

        if (onHover !== undefined) {
            const { line1, line2 } = helper(this.props, moreProps);

            if (line1 !== undefined && line2 !== undefined) {
                const {
                    mouseXY,
                    xScale,
                    chartConfig: { yScale },
                } = moreProps;

                const line1Hovering = isHovering({
                    x1Value: line1.x1,
                    y1Value: line1.y1,
                    x2Value: line1.x2,
                    y2Value: line1.y2,
                    type: "LINE",
                    mouseXY,
                    tolerance,
                    xScale,
                    yScale,
                });

                const line2Hovering = isHovering({
                    x1Value: line2.x1,
                    y1Value: line2.y1,
                    x2Value: line2.x2,
                    y2Value: line2.y2,
                    type: "LINE",
                    mouseXY,
                    tolerance,
                    xScale,
                    yScale,
                });

                return line1Hovering || line2Hovering;
            }
        }
        return false;
    };
}

function getLines(props: ChannelWithAreaProps, moreProps: any) {
    const { startXY, endXY, dy, type } = props;
    const { xScale } = moreProps;

    if (isNotDefined(startXY) || isNotDefined(endXY)) {
        return {};
    }

    const line1 = generateLine({
        type,
        start: startXY,
        end: endXY,
        xScale,
        yScale: undefined,
    });

    const line2 = isDefined(dy)
        ? {
              ...line1,
              y1: line1.y1 + dy,
              y2: line1.y2 + dy,
          }
        : undefined;

    return {
        line1,
        line2,
    };
}

function helper(props: ChannelWithAreaProps, moreProps: any) {
    const lines = getLines(props, moreProps);
    const {
        xScale,
        chartConfig: { yScale },
    } = moreProps;

    const line1 =
        lines.line1 !== undefined
            ? {
                  x1: xScale(lines.line1.x1),
                  y1: yScale(lines.line1.y1),
                  x2: xScale(lines.line1.x2),
                  y2: yScale(lines.line1.y2),
              }
            : undefined;

    const line2 =
        lines.line2 !== undefined
            ? {
                  x1: line1!.x1,
                  y1: yScale(lines.line2.y1),
                  x2: line1!.x2,
                  y2: yScale(lines.line2.y2),
              }
            : undefined;

    return {
        lines,
        line1,
        line2,
    };
}
