import { functor, getAxisCanvas, GenericChartComponent, plotDataLengthBarWidth } from "@react-financial-charts/core";
import { group } from "d3-array";
import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import * as React from "react";

export interface ICandle {
    readonly x: number;
    readonly y: number;
    readonly height: number;
    readonly fill: string;
    readonly stroke: string;
    readonly direction: number;
    readonly width: number;
    readonly wick: {
        readonly stroke: string;
        readonly x: number;
        readonly y1: number;
        readonly y2: number;
        readonly y3: number;
        readonly y4: number;
    };
}

export interface CandlestickSeriesProps {
    readonly candleStrokeWidth?: number;
    readonly clip?: boolean;
    readonly fill?: string | ((data: any) => string);
    readonly stroke?: string | ((data: any) => string);
    readonly wickStroke?: string | ((data: any) => string);
    readonly width?: number | ((props: CandlestickSeriesProps, moreProps: any) => number);
    readonly widthRatio?: number;
    readonly yAccessor: (data: any) => { open: number; high: number; low: number; close: number } | undefined;
}

export class CandlestickSeries extends React.Component<CandlestickSeriesProps> {
    public static defaultProps = {
        candleStrokeWidth: 0.5,
        clip: true,
        fill: (d: any) => (d.close > d.open ? "#26a69a" : "#ef5350"),
        stroke: "none",
        wickStroke: (d: any) => (d.close > d.open ? "#26a69a" : "#ef5350"),
        width: plotDataLengthBarWidth,
        widthRatio: 0.8,
        yAccessor: (d: any) => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
    };

    public render() {
        const { clip } = this.props;

        return (
            <GenericChartComponent
                clip={clip}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { candleStrokeWidth = CandlestickSeries.defaultProps.candleStrokeWidth } = this.props;
        const {
            xScale,
            chartConfig: { yScale },
            plotData,
            xAccessor,
        } = moreProps;

        const candleData = this.getCandleData(xAccessor, xScale, yScale, plotData);

        const wickNest = group(candleData, (d) => d.wick.stroke);

        wickNest.forEach((values, key) => {
            ctx.fillStyle = key;
            values.forEach((each) => {
                const d = each.wick;

                ctx.fillRect(d.x - 0.5, d.y1, 1, d.y2 - d.y1);
                ctx.fillRect(d.x - 0.5, d.y3, 1, d.y4 - d.y3);
            });
        });

        const candleNest = group(
            candleData,
            (d) => d.stroke,
            // @ts-ignore typings are incorrect for d3-array
            (d) => d.fill,
        );

        candleNest.forEach((strokeValues, strokeKey) => {
            if (strokeKey !== "none") {
                // @ts-ignore
                ctx.strokeStyle = strokeKey;
                ctx.lineWidth = candleStrokeWidth;
            }
            strokeValues.forEach((values, key) => {
                // @ts-ignore
                ctx.fillStyle = key;

                // @ts-ignore
                values.forEach((d) => {
                    if (d.width <= 1) {
                        ctx.fillRect(d.x - 0.5, d.y, 1, d.height);
                    } else if (d.height === 0) {
                        ctx.fillRect(d.x - 0.5, d.y, d.width, 1);
                    } else {
                        ctx.fillRect(d.x - 0.5, d.y, d.width, d.height);
                        if (strokeKey !== "none") {
                            ctx.strokeRect(d.x, d.y, d.width, d.height);
                        }
                    }
                });
            });
        });
    };

    private readonly getCandleData = (
        xAccessor: (data: any) => number | Date,
        xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
        yScale: ScaleContinuousNumeric<number, number>,
        plotData: any[],
    ) => {
        const { fill: fillProp, stroke: strokeProp, yAccessor, wickStroke: wickStrokeProp } = this.props;

        const fill = functor(fillProp);
        const stroke = functor(strokeProp);
        const wickStroke = functor(wickStrokeProp);
        const widthFunctor = functor(this.props.width);
        const width = widthFunctor(this.props, {
            xScale,
            xAccessor,
            plotData,
        });

        const offset = 0.5 * width;

        return plotData
            .filter((d) => {
                const ohlc = yAccessor(d);
                if (ohlc === undefined) {
                    return false;
                }

                return true;
            })
            .map((d) => {
                const ohlc = yAccessor(d);
                if (ohlc === undefined) {
                    return undefined;
                }

                const xValue = xAccessor(d);
                const x = xScale(xValue);
                const y = Math.round(yScale(Math.max(ohlc.open, ohlc.close)));
                const height = Math.max(1, Math.round(Math.abs(yScale(ohlc.open) - yScale(ohlc.close))));

                return {
                    x: x - offset,
                    y,
                    wick: {
                        stroke: wickStroke(ohlc),
                        x,
                        y1: Math.round(yScale(ohlc.high)),
                        y2: y,
                        y3: y + height,
                        y4: Math.round(yScale(ohlc.low)),
                    },
                    height,
                    width: offset * 2,
                    fill: fill(ohlc),
                    stroke: stroke(ohlc),
                    direction: ohlc.close - ohlc.open,
                };
            })
            .filter((d) => d !== undefined) as ICandle[];
    };
}
