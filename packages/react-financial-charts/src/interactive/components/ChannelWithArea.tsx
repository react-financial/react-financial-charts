import { path as d3Path } from "d3-path";
import * as React from "react";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";
import { generateLine, isHovering } from "./StraightLine";

import { hexToRGBA, isDefined, isNotDefined, noop } from "../../utils";

interface ChannelWithAreaProps {
    startXY?: number[];
    endXY?: number[];
    dy?: number;
    interactiveCursorClass?: string;
    stroke: string;
    strokeWidth: number;
    fill: string;
    fillOpacity: number;
    strokeOpacity: number;
    type:
    "XLINE" | // extends from -Infinity to +Infinity
    "RAY" | // extends to +/-Infinity in one direction
    "LINE"; // extends between the set bounds
    onDragStart: any; // func
    onDrag: any; // func
    onDragComplete: any; // func
    onHover?: any; // func
    onUnHover?: any; // func
    defaultClassName?: string;
    tolerance: number;
    selected: boolean;
}

export class ChannelWithArea extends React.Component<ChannelWithAreaProps> {

    public static defaultProps = {
        onDragStart: noop,
        onDrag: noop,
        onDragComplete: noop,
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
                svgDraw={this.renderSVG}
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

    private readonly renderSVG = (moreProps) => {
        const { stroke, strokeWidth, fillOpacity, fill, strokeOpacity } = this.props;
        const { line1, line2 } = helper(this.props, moreProps);

        if (line1 !== undefined) {
            const { x1, y1, x2, y2 } = line1;
            const line = line2 !== undefined
                ? <line
                    strokeWidth={strokeWidth}
                    stroke={stroke}
                    strokeOpacity={strokeOpacity}
                    x1={x1}
                    y1={line2.y1}
                    x2={x2}
                    y2={line2.y2}
                />
                : null;
            const area = isDefined(line2)
                ? <path
                    fill={fill}
                    fillOpacity={fillOpacity}
                    d={getPath(line1, line2)}
                />
                : null;

            return (
                <g>
                    <line
                        strokeWidth={strokeWidth}
                        stroke={stroke}
                        strokeOpacity={strokeOpacity}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                    />
                    {line}
                    {area}
                </g>
            );
        }
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { stroke, strokeWidth, fillOpacity, strokeOpacity, fill } = this.props;
        const { line1, line2 } = helper(this.props, moreProps);

        if (line1 !== undefined) {
            const { x1, y1, x2, y2 } = line1;

            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            if (line2 !== undefined) {
                const {
                    y1: line2Y1,
                    y2: line2Y2,
                } = line2;

                ctx.beginPath();
                ctx.moveTo(x1, line2Y1);
                ctx.lineTo(x2, line2Y2);
                ctx.stroke();

                ctx.fillStyle = hexToRGBA(fill, fillOpacity);
                ctx.beginPath();
                ctx.moveTo(x1, y1);

                ctx.lineTo(x2, y2);
                ctx.lineTo(x2, line2Y2);
                ctx.lineTo(x1, line2Y1);

                ctx.closePath();
                ctx.fill();
            }
        }
    }

    private readonly isHover = (moreProps) => {
        const { tolerance, onHover } = this.props;

        if (isDefined(onHover)) {

            const { line1, line2 } = helper(this.props, moreProps);

            if (line1 !== undefined && line2 !== undefined) {
                const { mouseXY, xScale, chartConfig: { yScale } } = moreProps;

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
    }
}

function getPath(line1, line2) {
    const ctx = d3Path();
    ctx.moveTo(line1.x1, line1.y1);
    ctx.lineTo(line1.x2, line1.y2);
    ctx.lineTo(line1.x2, line2.y2);
    ctx.lineTo(line1.x1, line2.y1);

    ctx.closePath();
    return ctx.toString();
}

function getLines(props: ChannelWithAreaProps, moreProps) {
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

function helper(props: ChannelWithAreaProps, moreProps) {
    const lines = getLines(props, moreProps);
    const { xScale, chartConfig: { yScale } } = moreProps;

    const line1 = lines.line1 !== undefined
        ? {
            x1: xScale(lines.line1.x1),
            y1: yScale(lines.line1.y1),
            x2: xScale(lines.line1.x2),
            y2: yScale(lines.line1.y2),
        }
        : undefined;

    const line2 = lines.line2 !== undefined
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
