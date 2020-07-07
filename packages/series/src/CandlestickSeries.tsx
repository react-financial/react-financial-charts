import { group } from "d3-array";
import * as React from "react";

import {
    colorToRGBA,
    functor,
    head,
    isDefined,
    getAxisCanvas,
    GenericChartComponent,
    plotDataLengthBarWidth,
} from "@react-financial-charts/core";

interface CandlestickSeriesProps {
    readonly candleClassName?: string;
    readonly candleStrokeWidth?: number;
    readonly className?: string;
    readonly classNames?: string | any; // func
    readonly clip?: boolean;
    readonly fill?: string | any; // func
    readonly opacity?: number;
    readonly stroke?: string | any; // func
    readonly wickClassName?: string;
    readonly wickStroke?: string | any; // func
    readonly width?: number | any; // func
    readonly widthRatio?: number;
    readonly yAccessor?: any; // func
}

export class CandlestickSeries extends React.Component<CandlestickSeriesProps> {
    public static defaultProps = {
        candleClassName: "react-financial-charts-candlestick-candle",
        candleStrokeWidth: 0.5,
        className: "react-financial-charts-candlestick",
        classNames: d => (d.close > d.open ? "up" : "down"),
        clip: true,
        fill: d => (d.close > d.open ? "#26a69a" : "#ef5350"),
        opacity: 1,
        stroke: d => (d.close > d.open ? "#26a69a" : "#ef5350"),
        wickClassName: "react-financial-charts-candlestick-wick",
        wickStroke: d => (d.close > d.open ? "#26a69a" : "#ef5350"),
        width: plotDataLengthBarWidth,
        widthRatio: 0.8,
        yAccessor: d => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
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

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { opacity, candleStrokeWidth = CandlestickSeries.defaultProps.candleStrokeWidth } = this.props;
        const {
            xScale,
            chartConfig: { yScale },
            plotData,
            xAccessor,
        } = moreProps;

        const candleData = this.getCandleData(this.props, xAccessor, xScale, yScale, plotData);

        const wickNest = group(candleData, d => d.wick.stroke);

        wickNest.forEach((values, key) => {
            ctx.strokeStyle = key;
            ctx.fillStyle = key;
            values.forEach(each => {
                const d = each.wick;

                ctx.fillRect(d.x - 0.5, d.y1, 1, d.y2 - d.y1);
                ctx.fillRect(d.x - 0.5, d.y3, 1, d.y4 - d.y3);
            });
        });

        const candleNest = group(
            candleData,
            d => d.stroke,
            // @ts-ignore
            d => d.fill,
        );

        candleNest.forEach((strokeValues, strokeKey) => {
            if (strokeKey !== "none") {
                // @ts-ignore
                ctx.strokeStyle = strokeKey;
                ctx.lineWidth = candleStrokeWidth;
            }
            strokeValues.forEach((values, key) => {
                const fillStyle =
                    head(values).width <= 1
                        ? key
                        : // @ts-ignore
                          colorToRGBA(key, opacity);
                // @ts-ignore
                ctx.fillStyle = fillStyle;

                values.forEach(d => {
                    if (d.width <= 1) {
                        ctx.fillRect(d.x - 0.5, d.y, 1, d.height);
                    } else if (d.height === 0) {
                        ctx.fillRect(d.x, d.y - 0.5, d.width, 1);
                    } else {
                        ctx.fillRect(d.x, d.y, d.width, d.height);
                        if (strokeKey !== "none") {
                            ctx.strokeRect(d.x, d.y, d.width, d.height);
                        }
                    }
                });
            });
        });
    };

    private readonly getCandleData = (props: CandlestickSeriesProps, xAccessor, xScale, yScale, plotData) => {
        const { wickStroke: wickStrokeProp } = props;
        const wickStroke = functor(wickStrokeProp);

        const { classNames, fill: fillProp, stroke: strokeProp, yAccessor } = props;
        const className = functor(classNames);

        const fill = functor(fillProp);
        const stroke = functor(strokeProp);

        const widthFunctor = functor(props.width);
        const width = widthFunctor(props, {
            xScale,
            xAccessor,
            plotData,
        });

        const trueOffset = 0.5 * width;
        const offset = trueOffset > 0.7 ? Math.round(trueOffset) : Math.floor(trueOffset);

        const candles: any[] = [];

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < plotData.length; i++) {
            const d = plotData[i];
            if (isDefined(yAccessor(d).close)) {
                const x = Math.round(xScale(xAccessor(d)));

                const ohlc = yAccessor(d);
                const y = Math.round(yScale(Math.max(ohlc.open, ohlc.close)));
                const height = Math.max(1, Math.round(Math.abs(yScale(ohlc.open) - yScale(ohlc.close))));

                candles.push({
                    // type: "line"
                    x: x - offset,
                    y,
                    wick: {
                        stroke: wickStroke(ohlc),
                        x,
                        y1: Math.round(yScale(ohlc.high)),
                        y2: y,
                        y3: y + height, // Math.round(yScale(Math.min(ohlc.open, ohlc.close))),
                        y4: Math.round(yScale(ohlc.low)),
                    },
                    height,
                    width: offset * 2,
                    className: className(ohlc),
                    fill: fill(ohlc),
                    stroke: stroke(ohlc),
                    direction: ohlc.close - ohlc.open,
                });
            }
        }

        return candles;
    };
}
