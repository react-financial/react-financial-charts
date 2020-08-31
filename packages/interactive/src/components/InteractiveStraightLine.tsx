import {
    getStrokeDasharrayCanvas,
    getMouseCanvas,
    GenericChartComponent,
    noop,
    strokeDashTypes,
} from "@react-financial-charts/core";
import * as React from "react";

export interface StraightLineProps {
    readonly x1Value: any;
    readonly x2Value: any;
    readonly y1Value: any;
    readonly y2Value: any;
    readonly interactiveCursorClass?: string;
    readonly strokeStyle: string;
    readonly strokeWidth?: number;
    readonly strokeDasharray?: strokeDashTypes;
    readonly type:
        | "XLINE" // extends from -Infinity to +Infinity
        | "RAY" // extends to +/-Infinity in one direction
        | "LINE"; // extends between the set bounds
    readonly onEdge1Drag?: any; // func
    readonly onEdge2Drag?: any; // func
    readonly onDragStart?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDrag?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onUnHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly defaultClassName?: string;
    readonly r?: number;
    readonly edgeFill?: string;
    readonly edgeStroke?: string;
    readonly edgeStrokeWidth?: number;
    readonly withEdge?: boolean;
    readonly tolerance?: number;
    readonly selected?: boolean;
}

export class InteractiveStraightLine extends React.Component<StraightLineProps> {
    public static defaultProps = {
        onEdge1Drag: noop,
        onEdge2Drag: noop,
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

    private readonly isHover = (moreProps: any) => {
        const { tolerance, onHover } = this.props;

        if (onHover !== undefined) {
            const { x1Value, x2Value, y1Value, y2Value, type } = this.props;
            const { mouseXY, xScale } = moreProps;
            const {
                chartConfig: { yScale },
            } = moreProps;

            const hovering = isHovering({
                x1Value,
                y1Value,
                x2Value,
                y2Value,
                mouseXY,
                type,
                tolerance,
                xScale,
                yScale,
            });

            return hovering;
        }
        return false;
    };

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const {
            strokeWidth = InteractiveStraightLine.defaultProps.strokeWidth,
            strokeDasharray,
            strokeStyle,
        } = this.props;
        const { x1, y1, x2, y2 } = helper(this.props, moreProps);

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeStyle;

        const lineDash = getStrokeDasharrayCanvas(strokeDasharray);

        ctx.setLineDash(lineDash);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };
}

export function isHovering2(start: any, end: any, [mouseX, mouseY]: any, tolerance: any) {
    const m = getSlope(start, end);

    if (m !== undefined) {
        const b = getYIntercept(m, end);
        const y = m * mouseX + b;
        return (
            mouseY < y + tolerance &&
            mouseY > y - tolerance &&
            mouseX > Math.min(start[0], end[0]) - tolerance &&
            mouseX < Math.max(start[0], end[0]) + tolerance
        );
    } else {
        return (
            mouseY >= Math.min(start[1], end[1]) &&
            mouseY <= Math.max(start[1], end[1]) &&
            mouseX < start[0] + tolerance &&
            mouseX > start[0] - tolerance
        );
    }
}

export function isHovering({ x1Value, y1Value, x2Value, y2Value, mouseXY, type, tolerance, xScale, yScale }: any) {
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

    if (m !== undefined) {
        const b = getYIntercept(m, end);
        const y = m * mouseX + b;

        return (
            mouseY < y + tolerance &&
            mouseY > y - tolerance &&
            mouseX > Math.min(start[0], end[0]) - tolerance &&
            mouseX < Math.max(start[0], end[0]) + tolerance
        );
    } else {
        return (
            mouseY >= Math.min(start[1], end[1]) &&
            mouseY <= Math.max(start[1], end[1]) &&
            mouseX < start[0] + tolerance &&
            mouseX > start[0] - tolerance
        );
    }
}

function helper(props: any, moreProps: any) {
    const { x1Value, x2Value, y1Value, y2Value, type } = props;

    const {
        xScale,
        chartConfig: { yScale },
    } = moreProps;

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
        x1,
        y1,
        x2,
        y2,
    };
}

export function getSlope(start: any, end: any) {
    const m /* slope */ = end[0] === start[0] ? undefined : (end[1] - start[1]) / (end[0] - start[0]);
    return m;
}
export function getYIntercept(m: any, end: any) {
    const b /* y intercept */ = -1 * m * end[0] + end[1];
    return b;
}

export function generateLine({ type, start, end, xScale, yScale }: any) {
    const m /* slope */ = getSlope(start, end);
    const b /* y intercept */ = getYIntercept(m, start);

    switch (type) {
        case "XLINE":
            return getXLineCoordinates({
                start,
                end,
                xScale,
                yScale,
                m,
                b,
            });
        case "RAY":
            return getRayCoordinates({
                start,
                end,
                xScale,
                yScale,
                m,
                b,
            });
        default:
        case "LINE":
            return getLineCoordinates({
                start,
                end,
            });
    }
}

function getXLineCoordinates({ start, end, xScale, yScale, m, b }: any) {
    const [xBegin, xFinish] = xScale.domain();
    const [yBegin, yFinish] = yScale.domain();

    if (end[0] === start[0]) {
        return {
            x1: end[0],
            y1: yBegin,
            x2: end[0],
            y2: yFinish,
        };
    }
    const [x1, x2] = end[0] > start[0] ? [xBegin, xFinish] : [xFinish, xBegin];

    return {
        x1,
        y1: m * x1 + b,
        x2,
        y2: m * x2 + b,
    };
}

function getRayCoordinates({ start, end, xScale, yScale, m, b }: any) {
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

    const x2 = end[0] > start[0] ? xFinish : xBegin;

    return {
        x1,
        y1: m * x1 + b,
        x2,
        y2: m * x2 + b,
    };
}

function getLineCoordinates({ start, end }: any) {
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
        x1,
        y1,
        x2,
        y2,
    };
}
