import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";
import { isDefined, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";

export interface RenkoSeriesProps {
    readonly clip?: boolean;
    readonly fill?: {
        up: string;
        down: string;
        partial: string;
    };
    readonly stroke?: {
        up: string;
        down: string;
    };
    readonly yAccessor?: (data: any) => any;
}

export class RenkoSeries extends React.Component<RenkoSeriesProps> {
    public static defaultProps = {
        clip: true,
        fill: {
            up: "#26a69a",
            down: "#ef5350",
            partial: "#4682B4",
        },
        stroke: {
            up: "none",
            down: "none",
        },
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
        const {
            xAccessor,
            xScale,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        const renko = this.getRenko(plotData, xScale, xAccessor, yScale);

        renko.forEach((d) => {
            const { fillStyle, strokeStyle } = d;
            ctx.beginPath();

            if (strokeStyle !== undefined) {
                ctx.strokeStyle = strokeStyle;
            }
            if (fillStyle !== undefined) {
                ctx.fillStyle = fillStyle;
            }

            ctx.rect(d.x, d.y, d.width, d.height);
            ctx.closePath();
            ctx.fill();
        });
    };

    private readonly getRenko = (
        plotData: any[],
        xScale: ScaleContinuousNumeric<number, number>,
        xAccessor: any,
        yScale: ScaleContinuousNumeric<number, number>,
    ) => {
        const { fill, stroke, yAccessor = RenkoSeries.defaultProps.yAccessor } = this.props;

        const width = xScale(xAccessor(plotData[plotData.length - 1])) - xScale(xAccessor(plotData[0]));

        const candleWidth = width / (plotData.length - 1);

        return plotData
            .filter((d) => isDefined(yAccessor(d).close))
            .map((d) => {
                const ohlc = yAccessor(d);
                const x = xScale(xAccessor(d)) - 0.5 * candleWidth;
                const y = yScale(Math.max(ohlc.open, ohlc.close));
                const height = Math.abs(yScale(ohlc.open) - yScale(ohlc.close));

                const fillStyle = d.fullyFormed ? (ohlc.open <= ohlc.close ? fill?.up : fill?.down) : fill?.partial;
                const strokeStyle = d.fullyFormed ? (ohlc.open <= ohlc.close ? stroke?.up : stroke?.down) : undefined;

                return {
                    fillStyle,
                    height,
                    strokeStyle,
                    width: candleWidth,
                    x,
                    y,
                };
            });
    };
}
