import * as React from "react";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

import {
    getStrokeDasharray,
    hexToRGBA,
    isDefined,
    noop,
    strokeDashTypes,
} from "../../utils";

interface StraightLineProps {
    x1Value: any;
    x2Value: any;
    y1Value: any;
    y2Value: any;

    interactiveCursorClass?: string;
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    strokeDasharray: strokeDashTypes;
    type:
    "XLINE" | // extends from -Infinity to +Infinity
    "RAY" | // extends to +/-Infinity in one direction
    "LINE"; // extends between the set bounds

    onEdge1Drag: any; // func
    onEdge2Drag: any; // func
    onDragStart: any; // func
    onDrag: any; // func
    onDragComplete: any; // func
    onHover?: any; // func
    onUnHover?: any; // func
    defaultClassName?: string;
    r: number;
    edgeFill: string;
    edgeStroke: string;
    edgeStrokeWidth: number;
    withEdge: boolean;
    children: any; // func
    tolerance: number;
    selected: boolean;
}

class StraightLine extends React.Component<StraightLineProps> {

    public static defaultProps = {
        onEdge1Drag: noop,
        onEdge2Drag: noop,
        onDragStart: noop,
        onDrag: noop,
        onDragComplete: noop,
        edgeStrokeWidth: 3,
        edgeStroke: "#000000",
        edgeFill: "#FFFFFF",
        r: 10,
        withEdge: false,
        strokeWidth: 1,
        strokeDasharray: "Solid",
        children: noop,
        tolerance: 7,
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
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly isHover = (moreProps) => {
        const { tolerance, onHover } = this.props;

        if (isDefined(onHover)) {
            const { x1Value, x2Value, y1Value, y2Value, type } = this.props;
            const { mouseXY, xScale } = moreProps;
            const { chartConfig: { yScale } } = moreProps;

            const hovering = isHovering({
                x1Value, y1Value,
                x2Value, y2Value,
                mouseXY,
                type,
                tolerance,
                xScale,
                yScale,
            });

            return hovering;
        }
        return false;
    }

    private readonly renderSVG = (moreProps) => {
        const { stroke, strokeWidth, strokeOpacity, strokeDasharray } = this.props;

        const lineWidth = strokeWidth;

        const { x1, y1, x2, y2 } = helper(this.props, moreProps);
        return (
            <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={stroke} strokeWidth={lineWidth}
                strokeDasharray={getStrokeDasharray(strokeDasharray)}
                strokeOpacity={strokeOpacity} />
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { stroke, strokeWidth, strokeOpacity, strokeDasharray } = this.props;
        const { x1, y1, x2, y2 } = helper(this.props, moreProps);

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
        ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

export function isHovering2(start, end, [mouseX, mouseY], tolerance) {
    const m = getSlope(start, end);

    if (m !== undefined && isDefined(m)) {
        const b = getYIntercept(m, end);
        const y = m * mouseX + b;
        return (mouseY < y + tolerance)
            && mouseY > (y - tolerance)
            && mouseX > Math.min(start[0], end[0]) - tolerance
            && mouseX < Math.max(start[0], end[0]) + tolerance;
    } else {
        return mouseY >= Math.min(start[1], end[1])
            && mouseY <= Math.max(start[1], end[1])
            && mouseX < start[0] + tolerance
            && mouseX > start[0] - tolerance;
    }
}

export function isHovering({
    x1Value, y1Value,
    x2Value, y2Value,
    mouseXY,
    type,
    tolerance,
    xScale,
    yScale,
}) {

    const line = generateLine({
        type,
        start: [x1Value, y1Value],
        end: [x2Value, y2Value],
        xScale,
        yScale,
    });

    const start = [xScale(line.x1), yScale(line.y1)];
    const end = [xScale(line.x2), yScale(line.y2)];

    const m = getSlope(start, end);
    const [mouseX, mouseY] = mouseXY;

    if (m !== undefined && isDefined(m)) {
        const b = getYIntercept(m, end);
        const y = m * mouseX + b;

        return mouseY < (y + tolerance)
            && mouseY > (y - tolerance)
            && mouseX > Math.min(start[0], end[0]) - tolerance
            && mouseX < Math.max(start[0], end[0]) + tolerance;
    } else {
        return mouseY >= Math.min(start[1], end[1])
            && mouseY <= Math.max(start[1], end[1])
            && mouseX < start[0] + tolerance
            && mouseX > start[0] - tolerance;
    }
}

function helper(props, moreProps) {
    const { x1Value, x2Value, y1Value, y2Value, type } = props;

    const { xScale, chartConfig: { yScale } } = moreProps;

    const modLine = generateLine({
        type,
        start: [x1Value, y1Value],
        end: [x2Value, y2Value],
        xScale,
        yScale,
    });

    const x1 = xScale(modLine.x1);
    const y1 = yScale(modLine.y1);
    const x2 = xScale(modLine.x2);
    const y2 = yScale(modLine.y2);

    return {
        x1, y1, x2, y2,
    };
}

export function getSlope(start, end) {
    const m /* slope */ = end[0] === start[0]
        ? undefined
        : (end[1] - start[1]) / (end[0] - start[0]);
    return m;
}
export function getYIntercept(m, end) {
    const b /* y intercept */ = -1 * m * end[0] + end[1];
    return b;
}

export function generateLine({
    type, start, end, xScale, yScale,
}) {
    const m /* slope */ = getSlope(start, end);
    // console.log(end[0] - start[0], m)
    const b /* y intercept */ = getYIntercept(m, start);

    switch (type) {
        case "XLINE":
            return getXLineCoordinates({
                start, end, xScale, yScale, m, b,
            });
        case "RAY":
            return getRayCoordinates({
                start, end, xScale, yScale, m, b,
            });
        default:
        case "LINE":
            return getLineCoordinates({
                start, end,
            });
    }
}

function getXLineCoordinates({
    start, end, xScale, yScale, m, b,
}) {
    const [xBegin, xFinish] = xScale.domain();
    const [yBegin, yFinish] = yScale.domain();

    if (end[0] === start[0]) {
        return {
            x1: end[0], y1: yBegin,
            x2: end[0], y2: yFinish,
        };
    }
    const [x1, x2] = end[0] > start[0]
        ? [xBegin, xFinish]
        : [xFinish, xBegin];

    return {
        x1, y1: m * x1 + b,
        x2, y2: m * x2 + b,
    };
}

function getRayCoordinates({
    start, end, xScale, yScale, m, b,
}) {
    const [xBegin, xFinish] = xScale.domain();
    const [yBegin, yFinish] = yScale.domain();

    const x1 = start[0];
    if (end[0] === start[0]) {
        return {
            x1,
            y1: start[1],
            x2: x1,
            y2: end[1] > start[1] ? yFinish : yBegin,
        };
    }

    const x2 = end[0] > start[0]
        ? xFinish
        : xBegin;

    return {
        x1, y1: m * x1 + b,
        x2, y2: m * x2 + b,
    };
}

function getLineCoordinates({
    start, end,
}) {

    const [x1, y1] = start;
    const [x2, y2] = end;
    if (end[0] === start[0]) {
        return {
            x1,
            y1: start[1],
            x2: x1,
            y2: end[1],
        };
    }

    return {
        x1, y1,
        x2, y2,
    };
}

export default StraightLine;
