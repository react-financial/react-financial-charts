import {
    getClosestItemIndexes,
    getStrokeDasharrayCanvas,
    strokeDashTypes,
    getAxisCanvas,
    getMouseCanvas,
    GenericChartComponent,
    MoreProps,
} from "@react-financial-charts/core";
import { line, CurveFactoryLineOnly, CurveFactory } from "d3-shape";
import * as React from "react";

export interface LineSeriesProps {
    readonly canvasClip?: (context: CanvasRenderingContext2D, moreProps: any) => void;
    /**
     * Wether to connect the line between undefined data points.
     */
    readonly connectNulls?: boolean;
    /**
     * A factory for a curve generator for the line.
     */
    readonly curve?: CurveFactory | CurveFactoryLineOnly;
    /**
     * Function to decide if a data point has been defined.
     */
    readonly defined?: (d: number | undefined) => boolean;
    /**
     * Whether to highlight the line when within the `hoverTolerance`.
     */
    readonly highlightOnHover?: boolean;
    /**
     * Width to increase the line to on hover.
     */
    readonly hoverStrokeWidth?: number;
    /**
     * The distance between the cursor and the closest point in the line.
     */
    readonly hoverTolerance?: number;
    /**
     * Click handler.
     */
    readonly onClick?: (e: React.MouseEvent, moreProps: any) => void;
    /**
     * Double click handler.
     */
    readonly onDoubleClick?: (e: React.MouseEvent, moreProps: any) => void;
    /**
     * Hover handler.
     */
    readonly onHover?: (e: React.MouseEvent, moreProps: any) => void;
    /**
     * Unhover handler.
     */
    readonly onUnHover?: (e: React.MouseEvent, moreProps: any) => void;
    /**
     * Context menu handler.
     */
    readonly onContextMenu?: (e: React.MouseEvent, moreProps: any) => void;
    /**
     * Color, gradient, or pattern to use for the stroke.
     */
    readonly strokeStyle?: string;
    /**
     * Stroke dash.
     */
    readonly strokeDasharray?: strokeDashTypes;
    /**
     * Stroke width.
     */
    readonly strokeWidth?: number;
    /**
     * Selector for data to plot.
     */
    readonly yAccessor: (data: any) => number | undefined;
}

/**
 * `LineSeries` component.
 */
export class LineSeries extends React.Component<LineSeriesProps> {
    public static defaultProps = {
        connectNulls: false,
        defined: (d: number | undefined) => d !== undefined && !isNaN(d),
        hoverStrokeWidth: 4,
        hoverTolerance: 6,
        highlightOnHover: false,
        strokeDasharray: "Solid",
        strokeStyle: "#2196f3",
        strokeWidth: 1,
    };

    public render() {
        const { highlightOnHover, onClick, onContextMenu, onDoubleClick, onHover, onUnHover, strokeDasharray } =
            this.props;

        const hoverProps =
            highlightOnHover || onHover || onUnHover
                ? {
                      isHover: this.isHover,
                      drawOn: ["mousemove", "pan"],
                      canvasToDraw: getMouseCanvas,
                  }
                : {
                      drawOn: ["pan"],
                      canvasToDraw: getAxisCanvas,
                  };

        const lineDash = getStrokeDasharrayCanvas(strokeDasharray);

        return (
            <GenericChartComponent
                canvasDraw={this.drawOnCanvas(lineDash)}
                onClickWhenHover={onClick}
                onDoubleClickWhenHover={onDoubleClick}
                onContextMenuWhenHover={onContextMenu}
                onHover={onHover}
                onUnHover={onUnHover}
                {...hoverProps}
            />
        );
    }

    private readonly drawOnCanvas = (lineDash?: number[]) => (ctx: CanvasRenderingContext2D, moreProps: MoreProps) => {
        const {
            connectNulls,
            yAccessor,
            hoverStrokeWidth = LineSeries.defaultProps.hoverStrokeWidth,
            defined = LineSeries.defaultProps.defined,
            curve,
            canvasClip,
            strokeStyle,
            strokeWidth = LineSeries.defaultProps.strokeWidth,
        } = this.props;

        const { xAccessor, xScale, chartConfig, plotData, hovering } = moreProps;
        if (!chartConfig) {
            console.warn("LineSeries received no chartConfig, is it inside of a Chart?");
            return;
        }
        const { yScale } = chartConfig;

        if (canvasClip !== undefined) {
            ctx.save();
            canvasClip(ctx, moreProps);
        }

        ctx.lineWidth = hovering ? hoverStrokeWidth : strokeWidth;

        if (strokeStyle !== undefined) {
            ctx.strokeStyle = strokeStyle;
        }

        if (lineDash !== undefined) {
            ctx.setLineDash(lineDash);
        }

        const dataSeries = line()
            .x((d) => Math.round(xScale(xAccessor(d))))
            .y((d) => Math.round(yScale(yAccessor(d)!)));

        if (curve !== undefined) {
            dataSeries.curve(curve);
        }

        if (!connectNulls) {
            dataSeries.defined((d) => defined(yAccessor(d)));
        }

        ctx.beginPath();
        dataSeries.context(ctx)(plotData);
        ctx.stroke();

        if (canvasClip !== undefined) {
            ctx.restore();
        }
    };

    private readonly isHover = (moreProps: any) => {
        const { highlightOnHover, yAccessor, hoverTolerance = LineSeries.defaultProps.hoverTolerance } = this.props;
        if (!highlightOnHover) {
            return false;
        }

        const {
            chartConfig: { yScale, origin },
            xAccessor,
            mouseXY,
            currentItem,
            xScale,
            plotData,
        } = moreProps;

        const [x, y] = mouseXY;
        const radius = hoverTolerance;

        const { left, right } = getClosestItemIndexes(plotData, xScale.invert(x), xAccessor);
        if (left === right) {
            const cy = yScale(yAccessor(currentItem)) + origin[1];
            const cx = xScale(xAccessor(currentItem)) + origin[0];

            const hovering1 = Math.pow(x - cx, 2) + Math.pow(y - cy, 2) < Math.pow(radius, 2);

            return hovering1;
        } else {
            const l = plotData[left];
            const r = plotData[right];
            const x1 = xScale(xAccessor(l)) + origin[0];
            const y1 = yScale(yAccessor(l)) + origin[1];
            const x2 = xScale(xAccessor(r)) + origin[0];
            const y2 = yScale(yAccessor(r)) + origin[1];

            // y = m * x + b
            const m /* slope */ = (y2 - y1) / (x2 - x1);
            const b /* y intercept */ = -1 * m * x1 + y1;

            const desiredY = Math.round(m * x + b);

            const hovering2 = y >= desiredY - radius && y <= desiredY + radius;

            return hovering2;
        }
    };
}
