import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import * as React from "react";
import {
    getAxisCanvas,
    getStrokeDasharrayCanvas,
    GenericChartComponent,
    strokeDashTypes,
} from "@react-financial-charts/core";

export interface StraightLineProps {
    readonly lineDash?: strokeDashTypes | number[];
    readonly lineWidth?: number;
    readonly strokeStyle?: string;
    readonly type?: "vertical" | "horizontal";
    readonly yValue?: number;
    readonly xValue?: number;
}

export class StraightLine extends React.Component<StraightLineProps> {
    public static defaultProps = {
        lineWidth: 1,
        lineDash: "Solid",
        strokeStyle: "rgba(0, 0, 0, 0.5)",
        type: "horizontal",
    };

    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { type, strokeStyle, lineWidth, lineDash, yValue, xValue } = this.props;

        const {
            xScale,
            chartConfig: { yScale, width, height },
        } = moreProps;

        ctx.beginPath();

        if (strokeStyle !== undefined) {
            ctx.strokeStyle = strokeStyle;
        }
        if (lineWidth !== undefined) {
            ctx.lineWidth = lineWidth;
        }
        if (lineDash !== undefined) {
            if (typeof lineDash === "string") {
                ctx.setLineDash(getStrokeDasharrayCanvas(lineDash));
            } else {
                ctx.setLineDash(lineDash);
            }
        }

        const { x1, y1, x2, y2 } = this.getLineCoordinates(type, xScale, yScale, xValue, yValue, width, height);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    private readonly getLineCoordinates = (
        type: "horizontal" | "vertical" | undefined,
        xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
        yScale: ScaleContinuousNumeric<number, number>,
        xValue: number | undefined,
        yValue: number | undefined,
        width: number,
        height: number,
    ) => {
        return type === "horizontal"
            ? { x1: 0, y1: Math.round(yScale(yValue!)), x2: width, y2: Math.round(yScale(yValue!)) }
            : { x1: Math.round(xScale(xValue!)), y1: 0, x2: Math.round(xScale(xValue!)), y2: height };
    };
}
