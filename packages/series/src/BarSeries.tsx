import {
    functor,
    head,
    getAxisCanvas,
    GenericChartComponent,
    plotDataLengthBarWidth,
} from "@react-financial-charts/core";
import { group } from "d3-array";
import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import * as React from "react";
import { drawOnCanvasHelper, identityStack } from "./StackedBarSeries";

interface IBar {
    readonly x: number;
    readonly y: number;
    readonly height: number;
    readonly width: number;
    readonly fillStyle: string;
}

export interface BarSeriesProps {
    readonly baseAt?:
        | number
        | ((
              xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
              yScale: ScaleContinuousNumeric<number, number>,
              d: [number, number],
              moreProps: any,
          ) => number);
    readonly clip?: boolean;
    readonly fillStyle?: string | ((data: any) => string);
    readonly strokeStyle?: string;
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
        fillStyle: "rgba(70, 130, 180, 0.5)",
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

            const { strokeStyle } = this.props;

            const nest = group(bars, (d: any) => d.fillStyle);

            nest.forEach((values, key) => {
                if (strokeStyle !== undefined) {
                    if (head(values).width > 1) {
                        ctx.strokeStyle = strokeStyle;
                    }
                }
                ctx.fillStyle = key;

                values.forEach((d) => {
                    if (d.width <= 1) {
                        ctx.fillRect(d.x - 0.5, d.y, 1, d.height);
                    } else {
                        ctx.fillRect(d.x + 0.5, d.y + 0.5, d.width, d.height);
                        if (strokeStyle !== undefined) {
                            ctx.strokeRect(d.x, d.y, d.width, d.height);
                        }
                    }
                });
            });
        }
    };

    private readonly getBars = (moreProps: {
        chartConfig: any;
        xAccessor: (data: any) => number | Date;
        xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
        plotData: any[];
    }) => {
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

        const offset = 0.5 * barWidth;

        return plotData
            .map((d) => {
                const yValue = yAccessor(d);
                if (yValue === undefined) {
                    return undefined;
                }

                const xValue = xAccessor(d);
                const x = xScale(xValue) - offset;

                let y = yScale(yValue);

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
            })
            .filter((d) => d !== undefined) as IBar[];
    };
}
