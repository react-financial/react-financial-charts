import * as React from "react";

import { BarSeries } from "./BarSeries";
import { LineSeries } from "./LineSeries";
import { StraightLine } from "./StraightLine";

export interface MACDSeriesProps {
    readonly className?: string;
    readonly clip?: boolean;
    readonly divergenceStroke?: boolean;
    readonly fillStyle?: {
        divergence: string | CanvasGradient | CanvasPattern;
    };
    readonly strokeStyle?: {
        macd: string | CanvasGradient | CanvasPattern;
        signal: string | CanvasGradient | CanvasPattern;
        zero: string | CanvasGradient | CanvasPattern;
    };
    readonly widthRatio?: number;
    readonly width?: number | any; // func
    readonly yAccessor?: any; // func
    readonly zeroLineStroke?: string;
    readonly zeroLineOpacity?: number;
}

/**
 * The MACD turns two trend-following indicators, moving averages, into a momentum oscillator by subtracting the longer moving average from the shorter one.
 */
export class MACDSeries extends React.Component<MACDSeriesProps> {
    public static defaultProps = {
        className: "react-financial-charts-macd-series",
        clip: true,
        divergenceStroke: false,
        fillStyle: {
            divergence: "rgba(70, 130, 180, 0.6)",
        },
        strokeStyle: {
            macd: "#0093FF",
            signal: "#D84315",
            zero: "rgba(0, 0, 0, 0.3)",
        },
        widthRatio: 0.5,
        width: BarSeries.defaultProps.width,
    };

    public render() {
        const {
            className,
            clip,
            fillStyle = MACDSeries.defaultProps.fillStyle,
            divergenceStroke,
            strokeStyle = MACDSeries.defaultProps.strokeStyle,
            widthRatio,
            width,
        } = this.props;

        return (
            <g className={className}>
                <BarSeries
                    baseAt={this.yAccessorForDivergenceBase}
                    width={width}
                    widthRatio={widthRatio}
                    stroke={divergenceStroke}
                    fillStyle={fillStyle.divergence}
                    clip={clip}
                    yAccessor={this.yAccessorForDivergence}
                />
                <LineSeries yAccessor={this.yAccessorForMACD} strokeStyle={strokeStyle.macd} />
                <LineSeries yAccessor={this.yAccessorForSignal} strokeStyle={strokeStyle.signal} />
                <StraightLine strokeStyle={strokeStyle.zero} yValue={0} />
            </g>
        );
    }

    private readonly yAccessorForDivergenceBase = (xScale, yScale) => {
        return yScale(0);
    };

    private readonly yAccessorForDivergence = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && yAccessor(d).divergence;
    };

    private readonly yAccessorForSignal = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && yAccessor(d).signal;
    };

    private readonly yAccessorForMACD = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && yAccessor(d).macd;
    };
}
