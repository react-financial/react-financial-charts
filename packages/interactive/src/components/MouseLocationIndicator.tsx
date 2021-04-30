import {
    functor,
    getClosestValue,
    getMouseCanvas,
    GenericChartComponent,
    isDefined,
    noop,
    shallowEqual,
} from "@react-financial-charts/core";
import * as React from "react";
import { getXValue } from "@react-financial-charts/core/lib/utils/ChartDataUtil";

export interface MouseLocationIndicatorProps {
    readonly enabled: boolean;
    readonly snap: boolean;
    readonly shouldDisableSnap: (e: React.MouseEvent) => boolean;
    readonly snapTo?: (datum: any) => number | number[];
    readonly onMouseMove: (e: React.MouseEvent, xyValue: number[], moreProps: any) => void;
    readonly onMouseDown: (e: React.MouseEvent, xyValue: number[], moreProps: any) => void;
    readonly onClick: (e: React.MouseEvent, xyValue: number[], moreProps: any) => void;
    readonly r: number;
    readonly stroke: string;
    readonly strokeWidth: number;
    readonly opacity: number;
    readonly disablePan: boolean;
}

export class MouseLocationIndicator extends React.Component<MouseLocationIndicatorProps> {
    public static defaultProps = {
        onMouseMove: noop,
        onMouseDown: noop,
        onClick: noop,
        shouldDisableSnap: functor(false),
        stroke: "#000000",
        strokeWidth: 1,
        opacity: 1,
        disablePan: true,
    };

    private mutableState: any = {};

    public render() {
        const { enabled, disablePan } = this.props;

        return (
            <GenericChartComponent
                onMouseDown={this.handleMouseDown}
                onClick={this.handleClick}
                onMouseMove={this.handleMousePosChange}
                onPan={this.handleMousePosChange}
                disablePan={enabled && disablePan}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan"]}
            />
        );
    }

    private readonly xy = (e: React.MouseEvent, moreProps: any) => {
        const { xAccessor, plotData } = moreProps;
        const {
            mouseXY,
            currentItem,
            xScale,
            chartConfig: { yScale },
        } = moreProps;
        const { enabled, snap, shouldDisableSnap, snapTo } = this.props;

        if (enabled && isDefined(currentItem) && isDefined(e)) {
            const xValue =
                snap && !shouldDisableSnap(e)
                    ? xAccessor(currentItem)
                    : getXValue(xScale, xAccessor, mouseXY, plotData);
            const yValue =
                snap && snapTo !== undefined && !shouldDisableSnap(e)
                    ? getClosestValue(snapTo(currentItem), yScale.invert(mouseXY[1]))
                    : yScale.invert(mouseXY[1]);

            const x = xScale(xValue);
            const y = yScale(yValue);

            return { xValue, yValue, x, y };
        }
    };

    private readonly handleClick = (e: React.MouseEvent, moreProps: any) => {
        const pos = this.xy(e, moreProps);
        if (pos !== undefined && isDefined(pos)) {
            const { xValue, yValue, x, y } = pos;
            this.mutableState = { x, y };
            this.props.onClick(e, [xValue, yValue], moreProps);
        }
    };

    private readonly handleMouseDown = (e: React.MouseEvent, moreProps: any) => {
        const pos = this.xy(e, moreProps);
        if (pos !== undefined && isDefined(pos)) {
            const { xValue, yValue, x, y } = pos;
            this.mutableState = { x, y };
            this.props.onMouseDown(e, [xValue, yValue], moreProps);
        }
    };

    private readonly handleMousePosChange = (e: React.MouseEvent, moreProps: any) => {
        if (!shallowEqual(moreProps.mousXY, moreProps.prevMouseXY)) {
            const pos = this.xy(e, moreProps);
            if (pos !== undefined && isDefined(pos)) {
                const { xValue, yValue, x, y } = pos;
                this.mutableState = { x, y };
                this.props.onMouseMove(e, [xValue, yValue], moreProps);
            }
        }
    };

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { enabled, r, stroke, strokeWidth } = this.props;
        const { x, y } = this.mutableState;
        const { show } = moreProps;
        if (enabled && show && isDefined(x)) {
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = stroke;
            ctx.moveTo(x, y);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            ctx.stroke();
        }
    };
}
