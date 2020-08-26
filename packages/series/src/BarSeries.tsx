import {
    functor,
    head,
    getAxisCanvas,
    GenericChartComponent,
    plotDataLengthBarWidth,
} from "@react-financial-charts/core";
import { group } from "d3-array";
import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";
import { drawOnCanvasHelper, identityStack } from "./StackedBarSeries";

export interface BarSeriesProps {
    readonly baseAt?:
        | number
        | ((
              xScale: ScaleContinuousNumeric<number, number>,
              yScale: ScaleContinuousNumeric<number, number>,
              d: [number, number],
              moreProps: any,
          ) => number);
    readonly clip?: boolean;
    readonly fillStyle?:
        | string
        | CanvasGradient
        | CanvasPattern
        | ((data: any) => string | CanvasGradient | CanvasPattern);
    readonly opacity?: number;
    readonly stroke?: boolean;
    readonly strokeStyle?: string | CanvasGradient | CanvasPattern;
    readonly swapScales?: boolean;
    readonly width?: number | ((props: { widthRatio: number }, moreProps: any) => number);
    readonly widthRatio?: number;
    readonly yAccessor: (data: any) => number | undefined;
}

/**
 * A `BarSeries` component.
 */
export class BarSeries extends React.Component<BarSeriesProps> {
    public static defaultProps = {
        baseAt: (
            xScale: ScaleContinuousNumeric<number, number>,
            yScale: ScaleContinuousNumeric<number, number> /* , d*/,
        ) => head(yScale.range()),
        clip: true,
        direction: "up",
        fillStyle: "rgba(70, 130, 180, 0.5)",
        stroke: false,
        swapScales: false,
        width: plotDataLengthBarWidth,
        widthRatio: 0.8,
    };

    public render() {
        const { clip } = this.props;

        return (
            <GenericChartComponent
                clip={clip}
                canvasToDraw={getAxisCanvas}
                canvasDraw={this.drawOnCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        if (this.props.swapScales) {
            const { xAccessor } = moreProps;

            drawOnCanvasHelper(ctx, this.props, moreProps, xAccessor, identityStack);
        } else {
            const bars = this.getBars(moreProps);

            const { stroke, strokeStyle } = this.props;

            const nest = group(bars, (d: any) => d.fillStyle);

            nest.forEach((values, key) => {
                if (head(values).width > 1) {
                    if (strokeStyle !== undefined) {
                        ctx.strokeStyle = strokeStyle;
                    }
                }
                ctx.fillStyle = key;

                values.forEach((d) => {
                    if (d.width <= 1) {
                        ctx.fillRect(d.x - 0.5, d.y, 1, d.height);
                    } else {
                        ctx.fillRect(d.x + 0.5, d.y + 0.5, d.width, d.height);
                        if (stroke) {
                            ctx.strokeRect(d.x, d.y, d.width, d.height);
                        }
                    }
                });
            });
        }
    };

    private readonly getBars = (moreProps: any) => {
        const { baseAt, fillStyle, width, yAccessor } = this.props;

        const {
            xScale,
            xAccessor,
            plotData,
            chartConfig: { yScale },
        } = moreProps;

        const getFill = functor(fillStyle);
        const getBase = functor(baseAt);
        const getWidth = functor(width);

        const barWidth = getWidth(this.props, {
            xScale,
            xAccessor,
            plotData,
        });

        const offset = Math.floor(0.5 * barWidth);

        return plotData
            .filter((d: any) => yAccessor(d) !== undefined)
            .map((d: any) => {
                const xValue = xAccessor(d);
                const yValue = yAccessor(d);
                let y = yScale(yValue);

                const x = Math.round(xScale(xValue)) - offset;

                let h = getBase(xScale, yScale, d) - yScale(yValue);
                if (h < 0) {
                    y = y + h;
                    h = -h;
                }

                return {
                    x,
                    y: Math.round(y),
                    height: Math.round(h),
                    width: offset * 2,
                    fillStyle: getFill(d),
                };
            });
    };
}
