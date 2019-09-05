import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";
import { getStrokeDasharray, hexToRGBA, strokeDashTypes } from "../utils";

interface StraightLineProps {
    className?: string;
    type?: "vertical" | "horizontal";
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: strokeDashTypes;
    opacity: number;
    yValue?: number;
    xValue?: number;
}

export class StraightLine extends React.Component<StraightLineProps> {

    public static defaultProps = {
        className: "line",
        type: "horizontal",
        stroke: "#000000",
        opacity: 0.5,
        strokeWidth: 1,
        strokeDasharray: "Solid",
    };

    public render() {
        return (
            <GenericChartComponent
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { width, height } = moreProps;
        const { xScale, chartConfig: { yScale } } = moreProps;

        const { className } = this.props;
        const { type, stroke, strokeWidth, opacity, strokeDasharray } = this.props;
        const { yValue, xValue } = this.props;

        const lineCoordinates = this.getLineCoordinates(type, xScale, yScale, xValue, yValue, width, height);

        return (
            <line
                className={className}
                strokeDasharray={getStrokeDasharray(strokeDasharray)}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                {...lineCoordinates}
            />
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { type, stroke, strokeWidth, opacity, strokeDasharray } = this.props;
        const { yValue, xValue } = this.props;
        const { xScale } = moreProps;
        const { chartConfig: { yScale, width, height } } = moreProps;

        ctx.beginPath();

        ctx.strokeStyle = hexToRGBA(stroke, opacity);
        ctx.lineWidth = strokeWidth;

        const { x1, y1, x2, y2 } = this.getLineCoordinates(type, xScale, yScale, xValue, yValue, width, height);

        ctx.setLineDash(getStrokeDasharray(strokeDasharray).split(","));
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    private readonly getLineCoordinates = (type, xScale, yScale, xValue, yValue, width, height) => {
        return type === "horizontal"
            ? { x1: 0, y1: Math.round(yScale(yValue)), x2: width, y2: Math.round(yScale(yValue)) }
            : { x1: Math.round(xScale(xValue)), y1: 0, x2: Math.round(xScale(xValue)), y2: height };
    }
}
