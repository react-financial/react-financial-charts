import { nest } from "d3-collection";
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";

import {
    functor, head, hexToRGBA, isDefined, plotDataLengthBarWidth,
} from "../utils";

interface CandlestickSeriesProps {
    readonly className?: string;
    readonly wickClassName?: string;
    readonly candleClassName?: string;
    readonly candleStrokeWidth?: number | string;
    readonly widthRatio?: number;
    readonly width?: number | any; // func
    readonly classNames?: string | any; // func
    readonly fill?: string | any; // func
    readonly stroke?: string | any; // func
    readonly wickStroke?: string | any; // func
    readonly yAccessor?: any; // func
    readonly clip?: boolean;
    readonly opacity?: number;
}

export class CandlestickSeries extends React.Component<CandlestickSeriesProps> {

    public static defaultProps = {
        className: "react-stockcharts-candlestick",
        wickClassName: "react-stockcharts-candlestick-wick",
        candleClassName: "react-stockcharts-candlestick-candle",
        yAccessor: (d) => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
        classNames: (d) => d.close > d.open ? "up" : "down",
        width: plotDataLengthBarWidth,
        wickStroke: "#000000",
        fill: (d) => d.close > d.open ? "#6BA583" : "#FF0000",
        stroke: "#000000",
        candleStrokeWidth: 0.5,
        widthRatio: 0.8,
        opacity: 0.5,
        clip: true,
    };

    public render() {
        const { clip } = this.props;

        return (
            <GenericChartComponent
                clip={clip}
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        drawOnCanvas(ctx, this.props, moreProps);
    }

    private readonly renderSVG = (moreProps) => {
        const { className, wickClassName, candleClassName } = this.props;
        const { xScale, chartConfig: { yScale }, plotData, xAccessor } = moreProps;

        const candleData = getCandleData(this.props, xAccessor, xScale, yScale, plotData);

        return <g className={className}>
            <g className={wickClassName} key="wicks">
                {getWicksSVG(candleData)}
            </g>
            <g className={candleClassName} key="candles">
                {getCandlesSVG(this.props, candleData)}
            </g>
        </g>;
    }
}

function getWicksSVG(candleData) {

    const wicks = candleData
        .map((each, idx) => {
            const d = each.wick;
            return <path key={idx}
                className={each.className}
                stroke={d.stroke}
                d={`M${d.x},${d.y1} L${d.x},${d.y2} M${d.x},${d.y3} L${d.x},${d.y4}`} />;
        });

    return wicks;
}

function getCandlesSVG(props: CandlestickSeriesProps, candleData) {

    const { opacity, candleStrokeWidth } = props;

    const candles = candleData.map((d, idx) => {
        if (d.width <= 1) {
            return (
                <line className={d.className} key={idx}
                    x1={d.x} y1={d.y} x2={d.x} y2={d.y + d.height}
                    stroke={d.fill} />
            );
        } else if (d.height === 0) {
            return (
                <line key={idx}
                    x1={d.x} y1={d.y} x2={d.x + d.width} y2={d.y + d.height}
                    stroke={d.fill} />
            );
        }
        return (
            <rect key={idx} className={d.className}
                fillOpacity={opacity}
                x={d.x} y={d.y} width={d.width} height={d.height}
                fill={d.fill} stroke={d.stroke} strokeWidth={candleStrokeWidth} />
        );
    });
    return candles;
}

function drawOnCanvas(ctx, props: CandlestickSeriesProps, moreProps) {
    const { opacity, candleStrokeWidth } = props;
    const { xScale, chartConfig: { yScale }, plotData, xAccessor } = moreProps;

    const candleData = getCandleData(props, xAccessor, xScale, yScale, plotData);

    const wickNest = nest()
        .key((d) => d.wick.stroke)
        .entries(candleData);

    wickNest.forEach((outer) => {
        const { key, values } = outer;
        ctx.strokeStyle = key;
        ctx.fillStyle = key;
        values.forEach((each) => {

            const d = each.wick;

            ctx.fillRect(d.x - 0.5, d.y1, 1, d.y2 - d.y1);
            ctx.fillRect(d.x - 0.5, d.y3, 1, d.y4 - d.y3);
        });
    });

    const candleNest = nest()
        .key((d) => d.stroke)
        .key((d) => d.fill)
        .entries(candleData);

    candleNest.forEach((outer) => {
        const { key: strokeKey, values: strokeValues } = outer;
        if (strokeKey !== "none") {
            ctx.strokeStyle = strokeKey;
            ctx.lineWidth = candleStrokeWidth;
        }
        strokeValues.forEach((inner) => {
            const { key, values } = inner;
            const fillStyle = head(values).width <= 1
                ? key
                : hexToRGBA(key, opacity);
            ctx.fillStyle = fillStyle;

            values.forEach((d) => {
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
}

function getCandleData(props: CandlestickSeriesProps, xAccessor, xScale, yScale, plotData) {

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
    const offset = trueOffset > 0.7
        ? Math.round(trueOffset)
        : Math.floor(trueOffset);

    const candles: any[] = [];

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < plotData.length; i++) {
        const d = plotData[i];
        if (isDefined(yAccessor(d).close)) {
            const x = Math.round(xScale(xAccessor(d)));

            const ohlc = yAccessor(d);
            const y = Math.round(yScale(Math.max(ohlc.open, ohlc.close)));
            const height = Math.round(Math.abs(yScale(ohlc.open) - yScale(ohlc.close)));

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
                direction: (ohlc.close - ohlc.open),
            });
        }
    }

    return candles;
}
