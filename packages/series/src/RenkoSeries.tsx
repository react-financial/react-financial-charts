import * as React from "react";
import { isDefined, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";

interface RenkoSeriesProps {
    readonly classNames?: {
        up: string;
        down: string;
    };
    readonly stroke?: {
        up: string;
        down: string;
    };
    readonly fill?: {
        up: string;
        down: string;
        partial: string;
    };
    readonly yAccessor?: any; // func
    readonly clip?: boolean;
}

export class RenkoSeries extends React.Component<RenkoSeriesProps> {
    public static defaultProps = {
        classNames: {
            up: "up",
            down: "down",
        },
        stroke: {
            up: "none",
            down: "none",
        },
        fill: {
            up: "#26a69a",
            down: "#ef5350",
            partial: "#4682B4",
        },
        yAccessor: d => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
        clip: true,
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
        const {
            xAccessor,
            xScale,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        const renko = this.getRenko(plotData, xScale, xAccessor, yScale);

        renko.forEach(d => {
            ctx.beginPath();

            ctx.strokeStyle = d.stroke;
            ctx.fillStyle = d.fill;

            ctx.rect(d.x, d.y, d.width, d.height);
            ctx.closePath();
            ctx.fill();
        });
    };

    private readonly getRenko = (plotData, xScale, xAccessor, yScale) => {
        const { classNames, fill, yAccessor } = this.props;
        const width = xScale(xAccessor(plotData[plotData.length - 1])) - xScale(xAccessor(plotData[0]));

        const candleWidth = width / (plotData.length - 1);
        const candles = plotData
            .filter(d => isDefined(yAccessor(d).close))
            .map(d => {
                const ohlc = yAccessor(d);
                const x = xScale(xAccessor(d)) - 0.5 * candleWidth;
                const y = yScale(Math.max(ohlc.open, ohlc.close));
                const height = Math.abs(yScale(ohlc.open) - yScale(ohlc.close));
                const className = ohlc.open <= ohlc.close ? classNames?.up : classNames?.down;

                const svgfill = d.fullyFormed ? (ohlc.open <= ohlc.close ? fill?.up : fill?.down) : fill?.partial;

                return {
                    className,
                    fill: svgfill,
                    x,
                    y,
                    height,
                    width: candleWidth,
                };
            });
        return candles;
    };
}
