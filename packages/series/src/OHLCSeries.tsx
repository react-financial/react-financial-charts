import { group } from "d3-array";
import * as React from "react";
import { functor, isDefined, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";

interface IOHLC {
    readonly close?: number;
    readonly high?: number;
    readonly low?: number;
    readonly open?: number;
}

export interface OHLCSeriesProps {
    readonly clip?: boolean;
    readonly stroke?: string | ((datum: any) => string);
    readonly strokeWidth?: number;
    readonly yAccessor: (datum: any) => IOHLC;
}

export class OHLCSeries extends React.Component<OHLCSeriesProps> {
    public static defaultProps = {
        yAccessor: (d: any) => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
        classNames: (d: any) => (isDefined(d.absoluteChange) ? (d.absoluteChange > 0 ? "up" : "down") : "firstbar"),
        stroke: (d: any) => (isDefined(d.absoluteChange) ? (d.absoluteChange > 0 ? "#26a69a" : "#ef5350") : "#000000"),
        strokeWidth: 1,
        clip: true,
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
        const {
            xAccessor,
            xScale,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        const barData = this.getOHLCBars(this.props, xAccessor, xScale, yScale, plotData);

        this.drawBarDataOnCanvas(ctx, barData);
    };

    private readonly getOHLCBars = (
        props: OHLCSeriesProps,
        xAccessor: any,
        xScale: any,
        yScale: any,
        plotData: any,
    ) => {
        const { stroke: strokeProp, strokeWidth: strokeWidthProp = 1, yAccessor } = props;

        const strokeFunc = functor(strokeProp);

        const width = xScale(xAccessor(plotData[plotData.length - 1])) - xScale(xAccessor(plotData[0]));

        const barWidth = Math.max(1, Math.round(width / (plotData.length - 1) / 2) - 1.5);

        const strokeWidth = Math.min(barWidth, strokeWidthProp);

        const bars = plotData
            .filter((d: any) => yAccessor(d).close !== undefined)
            .map((d: any) => {
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
                const stroke = strokeFunc(d);

                return { x, y1, y2, openX1, openX2, openY, closeX1, closeX2, closeY, stroke };
            });

        return { barWidth, strokeWidth, bars };
    };

    private readonly drawBarDataOnCanvas = (ctx: CanvasRenderingContext2D, barData: any) => {
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
    };
}
