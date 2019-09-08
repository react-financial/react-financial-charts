import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";

import { isDefined } from "../utils";

interface RenkoSeriesProps {
    classNames?: {
        up: string,
        down: string,
    };
    stroke: {
        up: string,
        down: string,
    };
    fill: {
        up: string,
        down: string,
        partial: string,
    };
    yAccessor: any; // func
    clip: boolean;
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
            up: "#6BA583",
            down: "#E60000",
            partial: "#4682B4",
        },
        yAccessor: (d) => ({ open: d.open, high: d.high, low: d.low, close: d.close }),
        clip: true,
    };

    public render() {
        const { clip } = this.props;

        return <GenericChartComponent
            clip={clip}
            svgDraw={this.renderSVG}
            canvasDraw={this.drawOnCanvas}
            canvasToDraw={getAxisCanvas}
            drawOn={["pan"]}
        />;
    }

    private readonly renderSVG = (moreProps) => {
        const { xAccessor } = moreProps;
        const { xScale, chartConfig: { yScale }, plotData } = moreProps;

        const { yAccessor } = this.props;

        const candles = getRenko(this.props, plotData, xScale, xAccessor, yScale, yAccessor)
            .map((each, idx) => (<rect key={idx} className={each.className}
                fill={each.fill}
                x={each.x}
                y={each.y}
                width={each.width}
                height={each.height} />));

        return (
            <g>
                <g className="candle">
                    {candles}
                </g>
            </g>
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { xAccessor } = moreProps;
        const { xScale, chartConfig: { yScale }, plotData } = moreProps;

        const { yAccessor } = this.props;

        const candles = getRenko(this.props, plotData, xScale, xAccessor, yScale, yAccessor);

        drawOnCanvas(ctx, candles);
    }
}

function drawOnCanvas(ctx, renko) {
    renko.forEach((d) => {
        ctx.beginPath();

        ctx.strokeStyle = d.stroke;
        ctx.fillStyle = d.fill;

        ctx.rect(d.x, d.y, d.width, d.height);
        ctx.closePath();
        ctx.fill();
    });
}

function getRenko(props, plotData, xScale, xAccessor, yScale, yAccessor) {
    const { classNames, fill } = props;
    const width = xScale(xAccessor(plotData[plotData.length - 1]))
        - xScale(xAccessor(plotData[0]));

    const candleWidth = (width / (plotData.length - 1));
    const candles = plotData
        .filter((d) => isDefined(yAccessor(d).close))
        .map((d) => {
            const ohlc = yAccessor(d);
            const x = xScale(xAccessor(d)) - 0.5 * candleWidth;
            const y = yScale(Math.max(ohlc.open, ohlc.close));
            const height = Math.abs(yScale(ohlc.open) - yScale(ohlc.close));
            const className = (ohlc.open <= ohlc.close) ? classNames.up : classNames.down;

            const svgfill = d.fullyFormed
                ? (ohlc.open <= ohlc.close ? fill.up : fill.down)
                : fill.partial;

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
}
