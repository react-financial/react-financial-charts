import { nest } from "d3-collection";
import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";

import { functor, isDefined } from "../utils";

interface OHLCSeriesProps {
    className?: string;
    classNames: string | any; // func
    stroke: string | any; // func
    yAccessor: any; // func
    clip: boolean;
}

export class OHLCSeries extends React.Component<OHLCSeriesProps> {

    public static defaultProps = {
        className: "react-stockcharts-ohlc",
        yAccessor: (d) => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
        classNames: (d) => isDefined(d.absoluteChange) ? (d.absoluteChange > 0 ? "up" : "down") : "firstbar",
        stroke: (d) => isDefined(d.absoluteChange) ? (d.absoluteChange > 0 ? "#6BA583" : "#FF0000") : "#000000",
        clip: true,
    };

    public render() {
        const { clip } = this.props;

        return <GenericChartComponent
            svgDraw={this.renderSVG}
            canvasToDraw={getAxisCanvas}
            canvasDraw={this.drawOnCanvas}
            clip={clip}
            drawOn={["pan"]}
        />;
    }

    private readonly renderSVG = (moreProps) => {
        const { className, yAccessor } = this.props;
        const { xAccessor } = moreProps;
        const { xScale, chartConfig: { yScale }, plotData } = moreProps;

        const barData = getOHLCBars(this.props, xAccessor, yAccessor, xScale, yScale, plotData);

        const { strokeWidth, bars } = barData;

        return <g className={className}>
            {bars.map((d, idx) => <path key={idx}
                className={d.className} stroke={d.stroke} strokeWidth={strokeWidth}
                d={`M${d.openX1} ${d.openY} L${d.openX2} ${d.openY} M${d.x} ${d.y1} L${d.x} ${d.y2} M${d.closeX1} ${d.closeY} L${d.closeX2} ${d.closeY}`} />)}
        </g>;
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { yAccessor } = this.props;
        const { xAccessor } = moreProps;
        const { xScale, chartConfig: { yScale }, plotData } = moreProps;

        const barData = getOHLCBars(this.props, xAccessor, yAccessor, xScale, yScale, plotData);
        drawOnCanvas(ctx, barData);
    }
}

function drawOnCanvas(ctx, barData) {

    const { strokeWidth, bars } = barData;

    const wickNest = nest()
        .key((d) => d.stroke)
        .entries(bars);

    ctx.lineWidth = strokeWidth;

    wickNest.forEach((outer) => {
        const { key, values } = outer;
        ctx.strokeStyle = key;
        values.forEach((d) => {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y1);
            ctx.lineTo(d.x, d.y2);

            ctx.moveTo(d.openX1, d.openY);
            ctx.lineTo(d.openX2, d.openY);

            ctx.moveTo(d.closeX1, d.closeY);
            ctx.lineTo(d.closeX2, d.closeY);

            ctx.stroke();
        });
    });
}

function getOHLCBars(props, xAccessor, yAccessor, xScale, yScale, plotData) {
    const { classNames: classNamesProp, stroke: strokeProp } = props;

    const strokeFunc = functor(strokeProp);
    const classNameFunc = functor(classNamesProp);

    const width = xScale(xAccessor(plotData[plotData.length - 1]))
        - xScale(xAccessor(plotData[0]));

    const barWidth = Math.max(1, Math.round(width / (plotData.length - 1) / 2) - 1.5);
    const strokeWidth = Math.min(barWidth, 6);

    const bars = plotData
        .filter((d) => isDefined(yAccessor(d).close))
        .map((d) => {
            const ohlc = yAccessor(d);
            const x = Math.round(xScale(xAccessor(d)));
            const y1 = yScale(ohlc.high);
            const y2 = yScale(ohlc.low);
            const openX1 = x - barWidth;
            const openX2 = x + strokeWidth / 2;
            const openY = yScale(ohlc.open);
            const closeX1 = x - strokeWidth / 2;
            const closeX2 = x + barWidth;
            const closeY = yScale(ohlc.close);
            const className = classNameFunc(d);
            const stroke = strokeFunc(d);

            return { x, y1, y2, openX1, openX2, openY, closeX1, closeX2, closeY, stroke, className };
        });
    return { barWidth, strokeWidth, bars };
}
