import { group } from "d3-array";
import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";

import { functor, isDefined } from "../utils";

interface OHLCSeriesProps {
    readonly className?: string;
    readonly classNames?: string | any; // func
    readonly clip?: boolean;
    readonly stroke?: string | any; // func
    readonly strokeWidth?: number;
    readonly yAccessor?: any; // func
}

export class OHLCSeries extends React.Component<OHLCSeriesProps> {

    public static defaultProps = {
        className: "react-financial-charts-ohlc",
        yAccessor: (d) => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
        classNames: (d) => isDefined(d.absoluteChange) ? (d.absoluteChange > 0 ? "up" : "down") : "firstbar",
        stroke: (d) => isDefined(d.absoluteChange) ? (d.absoluteChange > 0 ? "#26a69a" : "#ef5350") : "#000000",
        strokeWidth: 1,
        clip: true,
    };

    public render() {
        const { clip } = this.props;

        return (
            <GenericChartComponent
                svgDraw={this.renderSVG}
                canvasToDraw={getAxisCanvas}
                canvasDraw={this.drawOnCanvas}
                clip={clip}
                drawOn={["pan"]}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { className, yAccessor } = this.props;
        const { xAccessor } = moreProps;
        const { xScale, chartConfig: { yScale }, plotData } = moreProps;

        const barData = this.getOHLCBars(this.props, xAccessor, yAccessor, xScale, yScale, plotData);

        const { bars, strokeWidth } = barData;

        return (
            <g className={className}>
                {bars.map((d, idx) => <path key={idx}
                    className={d.className}
                    stroke={d.stroke}
                    strokeWidth={strokeWidth}
                    d={`M${d.openX1} ${d.openY} L${d.openX2} ${d.openY} M${d.x} ${d.y1} L${d.x} ${d.y2} M${d.closeX1} ${d.closeY} L${d.closeX2} ${d.closeY}`} />)}
            </g>
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { yAccessor } = this.props;
        const { xAccessor } = moreProps;
        const { xScale, chartConfig: { yScale }, plotData } = moreProps;

        const barData = this.getOHLCBars(this.props, xAccessor, yAccessor, xScale, yScale, plotData);

        this.drawBarDataOnCanvas(ctx, barData);
    }

    private readonly getOHLCBars = (props, xAccessor, yAccessor, xScale, yScale, plotData) => {
        const { classNames: classNamesProp, stroke: strokeProp, strokeWidth: strokeWidthProp } = props;

        const strokeFunc = functor(strokeProp);
        const classNameFunc = functor(classNamesProp);

        const width = xScale(xAccessor(plotData[plotData.length - 1]))
            - xScale(xAccessor(plotData[0]));

        const barWidth = Math.max(1, Math.round(width / (plotData.length - 1) / 2) - 1.5);

        const strokeWidth = Math.min(barWidth, strokeWidthProp);

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

    private readonly drawBarDataOnCanvas = (ctx: CanvasRenderingContext2D, barData) => {

        const { strokeWidth, bars } = barData;

        const wickNest = group(bars, (d: any) => d.stroke);

        ctx.lineWidth = strokeWidth;

        wickNest.forEach((values, key) => {
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
}
