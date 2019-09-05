
import { line as d3Line } from "d3-shape";
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas, getMouseCanvas } from "../GenericComponent";

import {
    getClosestItemIndexes,
    getStrokeDasharray,
    hexToRGBA,
    isDefined,
    strokeDashTypes,
} from "../utils";

interface LineSeriesProps {
    className?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    stroke?: string;
    hoverStrokeWidth?: number;
    fill?: string;
    defined?: any; // func
    hoverTolerance?: number;
    strokeDasharray?: strokeDashTypes;
    highlightOnHover?: boolean;
    onClick?: any; // func
    onDoubleClick?: any; // func
    onHover?: any; // func
    onUnHover?: any; // func
    onContextMenu?: any; // func
    yAccessor?: any; // func
    connectNulls?: boolean;
    interpolation?: any; // func
    canvasClip?: any; // func
    style?: React.CSSProperties;
}

export class LineSeries extends React.Component<LineSeriesProps> {

    public static defaultProps = {
        className: "line ",
        strokeWidth: 1,
        strokeOpacity: 1,
        hoverStrokeWidth: 4,
        fill: "none",
        stroke: "#4682B4",
        strokeDasharray: "Solid",
        defined: (d) => !isNaN(d),
        hoverTolerance: 6,
        highlightOnHover: false,
        connectNulls: false,
    };

    public render() {
        const { highlightOnHover, onHover, onUnHover } = this.props;
        const hoverProps = (highlightOnHover || onHover || onUnHover)
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
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                onClickWhenHover={this.props.onClick}
                onDoubleClickWhenHover={this.props.onDoubleClick}
                onContextMenuWhenHover={this.props.onContextMenu}
                onHover={this.props.onHover}
                onUnHover={this.props.onUnHover}
                {...hoverProps}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { yAccessor, stroke, strokeOpacity, strokeWidth, hoverStrokeWidth, defined, strokeDasharray } = this.props;
        const { connectNulls } = this.props;
        const { interpolation, style } = this.props;
        const { xAccessor, chartConfig } = moreProps;

        const { xScale, plotData, hovering } = moreProps;

        const { yScale } = chartConfig;
        const dataSeries = d3Line()
            .x((d) => Math.round(xScale(xAccessor(d))))
            .y((d) => Math.round(yScale(yAccessor(d))));

        if (isDefined(interpolation)) {
            dataSeries.curve(interpolation);
        }
        if (!connectNulls) {
            dataSeries.defined((d) => defined(yAccessor(d)));
        }

        const data = dataSeries(plotData);

        const { fill, className } = this.props;

        return (
            <path
                style={style}
                className={`${className} ${stroke ? "" : " line-stroke"}`}
                d={data}
                stroke={stroke}
                strokeOpacity={strokeOpacity}
                strokeWidth={hovering ? hoverStrokeWidth : strokeWidth}
                strokeDasharray={getStrokeDasharray(strokeDasharray)}
                fill={fill}
            />
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const {
            yAccessor,
            stroke,
            strokeOpacity,
            strokeWidth,
            hoverStrokeWidth,
            defined,
            strokeDasharray,
            interpolation,
            canvasClip,
        } = this.props;

        const { connectNulls } = this.props;

        const { xAccessor } = moreProps;
        const { xScale, chartConfig: { yScale }, plotData, hovering } = moreProps;

        if (canvasClip) {
            ctx.save();
            canvasClip(ctx, moreProps);
        }

        ctx.lineWidth = hovering ? hoverStrokeWidth : strokeWidth;

        ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
        ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));

        const dataSeries = d3Line()
            .x((d) => Math.round(xScale(xAccessor(d))))
            .y((d) => Math.round(yScale(yAccessor(d))));

        if (isDefined(interpolation)) {
            dataSeries.curve(interpolation);
        }
        if (!connectNulls) {
            dataSeries.defined((d) => defined(yAccessor(d)));
        }

        ctx.beginPath();
        dataSeries.context(ctx)(plotData);
        ctx.stroke();

        if (canvasClip) {
            ctx.restore();
        }
    }

    private readonly isHover = (moreProps) => {
        const { highlightOnHover, yAccessor, hoverTolerance = LineSeries.defaultProps.hoverTolerance } = this.props;

        if (!highlightOnHover) { return false; }

        const { mouseXY, currentItem, xScale, plotData } = moreProps;
        const { chartConfig: { yScale, origin } } = moreProps;

        const { xAccessor } = moreProps;

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
    }
}
