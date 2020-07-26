import {
    getClosestItemIndexes,
    getStrokeDasharrayCanvas,
    strokeDashTypes,
    getAxisCanvas,
    getMouseCanvas,
    GenericChartComponent,
} from "@react-financial-charts/core";
import { line as d3Line, CurveFactoryLineOnly, CurveFactory } from "d3-shape";
import * as React from "react";

interface LineSeriesProps {
    readonly canvasClip?: (context: CanvasRenderingContext2D, moreProps: any) => void;
    readonly className?: string;
    readonly connectNulls?: boolean;
    readonly defined?: any; // func
    readonly highlightOnHover?: boolean;
    readonly hoverStrokeWidth?: number;
    readonly hoverTolerance?: number;
    readonly interpolation?: CurveFactory | CurveFactoryLineOnly;
    readonly onClick?: any; // func
    readonly onDoubleClick?: any; // func
    readonly onHover?: any; // func
    readonly onUnHover?: any; // func
    readonly onContextMenu?: any; // func
    readonly strokeStyle?: string | CanvasGradient | CanvasPattern;
    readonly strokeDasharray?: strokeDashTypes;
    readonly strokeWidth?: number;
    readonly style?: React.CSSProperties;
    readonly yAccessor: (data: any) => number;
}

export class LineSeries extends React.Component<LineSeriesProps> {
    public static defaultProps = {
        className: "line",
        strokeStyle: "#2196f3",
        strokeWidth: 1,
        hoverStrokeWidth: 4,
        strokeDasharray: "Solid",
        defined: (d) => !isNaN(d),
        hoverTolerance: 6,
        highlightOnHover: false,
        connectNulls: false,
    };

    public render() {
        const { highlightOnHover, onClick, onContextMenu, onDoubleClick, onHover, onUnHover } = this.props;
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

        return (
            <GenericChartComponent
                canvasDraw={this.drawOnCanvas}
                onClickWhenHover={onClick}
                onDoubleClickWhenHover={onDoubleClick}
                onContextMenuWhenHover={onContextMenu}
                onHover={onHover}
                onUnHover={onUnHover}
                {...hoverProps}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const {
            connectNulls,
            yAccessor,
            strokeStyle,
            strokeWidth = LineSeries.defaultProps.strokeWidth,
            hoverStrokeWidth = LineSeries.defaultProps.hoverStrokeWidth,
            defined,
            strokeDasharray,
            interpolation,
            canvasClip,
        } = this.props;

        const {
            xAccessor,
            xScale,
            chartConfig: { yScale },
            plotData,
            hovering,
        } = moreProps;

        if (canvasClip !== undefined) {
            ctx.save();
            canvasClip(ctx, moreProps);
        }

        ctx.lineWidth = hovering ? hoverStrokeWidth : strokeWidth;

        if (strokeStyle !== undefined) {
            ctx.strokeStyle = strokeStyle;
        }

        const lineDash = getStrokeDasharrayCanvas(strokeDasharray);

        ctx.setLineDash(lineDash);

        const dataSeries = d3Line()
            .x((d) => Math.round(xScale(xAccessor(d))))
            .y((d) => Math.round(yScale(yAccessor(d))));

        if (interpolation !== undefined) {
            dataSeries.curve(interpolation);
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

    private readonly isHover = (moreProps) => {
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
