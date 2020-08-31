import { deviation, sum, zip } from "d3-array";
import * as React from "react";
import { getClosestItemIndexes, getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { isHovering2 } from "./InteractiveStraightLine";

export interface LinearRegressionChannelWithAreaProps {
    readonly x1Value: any;
    readonly x2Value: any;
    readonly type:
        | "SD" // standard deviation channel
        | "Raff"; // Raff Regression Channel
    readonly interactiveCursorClass?: string;
    readonly strokeStyle: string;
    readonly strokeWidth: number;
    readonly fillStyle: string;
    readonly onDragStart?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDrag?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onUnHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly defaultClassName?: string;
    readonly tolerance: number;
    readonly selected: boolean;
}

export class LinearRegressionChannelWithArea extends React.Component<LinearRegressionChannelWithAreaProps> {
    public static defaultProps = {
        type: "SD", // standard dev
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
        const { x1, y1, x2, y2, dy } = helper(this.props, moreProps);

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;

        ctx.beginPath();
        ctx.moveTo(x1, y1 - dy);
        ctx.lineTo(x2, y2 - dy);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2 + dy);
        ctx.lineTo(x1, y1 + dy);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x1, y1 - dy);
        ctx.lineTo(x2, y2 - dy);
        ctx.lineTo(x2, y2 + dy);
        ctx.lineTo(x1, y1 + dy);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    };

    private readonly isHover = (moreProps: any) => {
        const { tolerance, onHover } = this.props;

        if (onHover !== undefined) {
            const { mouseXY } = moreProps;

            const { x1, y1, x2, y2, dy } = helper(this.props, moreProps);
            const yDiffs = [-dy, 0, dy];

            const hovering = yDiffs.reduce(
                (result, diff) => result || isHovering2([x1, y1 + diff], [x2, y2 + diff], mouseXY, tolerance),
                false,
            );
            return hovering;
        }
        return false;
    };
}

export function edge1Provider(props: any) {
    return function (moreProps: any) {
        const { x1, y1 } = helper(props, moreProps);
        return [x1, y1];
    };
}

export function edge2Provider(props: any) {
    return function (moreProps: any) {
        const { x2, y2 } = helper(props, moreProps);
        return [x2, y2];
    };
}

function helper(props: any, moreProps: any) {
    const { x1Value, x2Value, type } = props;

    const {
        xScale,
        chartConfig: { yScale },
        fullData,
    } = moreProps;
    const { xAccessor } = moreProps;

    const { left } = getClosestItemIndexes(fullData, x1Value, xAccessor);
    const { right } = getClosestItemIndexes(fullData, x2Value, xAccessor);

    const startIndex = Math.min(left, right);
    const endIndex = Math.max(left, right) + 1;

    const array = fullData.slice(startIndex, endIndex);

    const xs = array.map((d: any) => xAccessor(d).valueOf());
    const ys = array.map((d: any) => d.close);
    const n = array.length;

    const xys = zip<number>(xs, ys).map((d) => {
        return d[0] * d[1];
    });
    const xSquareds = xs.map((x: any) => Math.pow(x, 2));

    const b = (n * sum(xys) - sum(xs) * sum(ys)) / (n * sum(xSquareds) - Math.pow(sum(xs), 2));
    const a = (sum(ys) - b * sum(xs)) / n;

    const newy1 = a + b * x1Value;
    const newy2 = a + b * x2Value;

    const x1 = xScale(x1Value);
    const y1 = yScale(newy1);
    const x2 = xScale(x2Value);
    const y2 = yScale(newy2);

    const stdDev = type === "SD" ? deviation<any>(array, (d) => d.close) : 0;

    const dy = yScale(newy1 - stdDev!) - y1;

    return {
        x1,
        y1,
        x2,
        y2,
        dy,
    };
}
