import { merge } from "d3-array";
import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import * as React from "react";
import {
    first,
    functor,
    getAxisCanvas,
    GenericChartComponent,
    plotDataLengthBarWidth,
} from "@react-financial-charts/core";
import { drawOnCanvas2 } from "./StackedBarSeries";

export interface OverlayBarSeriesProps {
    readonly baseAt?:
        | number
        | ((
              xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
              yScale: ScaleContinuousNumeric<number, number>,
              datum: any,
          ) => number);
    readonly direction?: "up" | "down";
    readonly stroke?: boolean;
    readonly width?: any;
    readonly widthRatio?: number;
    readonly fillStyle?: string | ((data: any, y: number) => string);
    readonly yAccessor: ((datum: any) => number | undefined)[];
    readonly xScale?: ScaleContinuousNumeric<number, number>;
    readonly yScale?: ScaleContinuousNumeric<number, number>;
    readonly plotData?: number[];
    readonly clip?: boolean;
}

export class OverlayBarSeries extends React.Component<OverlayBarSeriesProps> {
    public static defaultProps = {
        baseAt: (xScale: ScaleContinuousNumeric<number, number>, yScale: ScaleContinuousNumeric<number, number>) =>
            first(yScale.range()),
        clip: true,
        direction: "up",
        stroke: false,
        fillStyle: "#4682B4",
        widthRatio: 0.5,
        width: plotDataLengthBarWidth,
    };

    public render() {
        const { clip } = this.props;

        return (
            <GenericChartComponent
                canvasToDraw={getAxisCanvas}
                canvasDraw={this.drawOnCanvas}
                clip={clip}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const bars = this.getBars(moreProps);

        drawOnCanvas2(this.props, ctx, bars);
    };

    private readonly getBars = (moreProps: any) => {
        const {
            xScale,
            xAccessor,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        const { baseAt, fillStyle, stroke, yAccessor } = this.props;

        const getFill = functor(fillStyle);
        const getBase = functor(baseAt);
        const widthFunctor = functor(this.props.width);

        const width = widthFunctor(this.props, moreProps);
        const offset = Math.floor(0.5 * width);

        const bars = plotData.map((d: any) => {
            const innerBars = yAccessor
                .map((eachYAccessor: any, i: number) => {
                    const yValue = eachYAccessor(d);
                    if (yValue === undefined) {
                        return undefined;
                    }

                    const xValue = xAccessor(d);
                    const x = Math.round(xScale(xValue)) - offset;
                    const y = yScale(yValue);

                    return {
                        height: 0,
                        width: offset * 2,
                        x,
                        y,
                        stroke: stroke ? getFill(d, i) : "none",
                        fillStyle: getFill(d, i),
                        i,
                    };
                })
                .filter((yValue: any) => yValue !== undefined);

            let b = getBase(xScale, yScale, d);
            let h;
            for (let i = innerBars.length - 1; i >= 0; i--) {
                h = b - innerBars[i]!.y;
                if (h < 0) {
                    innerBars[i]!.y = b;
                    h = -1 * h;
                }
                innerBars[i]!.height = h;
                b = innerBars[i]!.y;
            }
            return innerBars;
        });

        return merge(bars);
    };
}
