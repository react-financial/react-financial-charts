import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import * as React from "react";
import { BarSeries } from "./BarSeries";
import { LineSeries } from "./LineSeries";
import { StraightLine } from "./StraightLine";

export interface MACDSeriesProps {
    readonly className?: string;
    readonly clip?: boolean;
    readonly fillStyle?: {
        divergence: string;
    };
    readonly strokeStyle?: {
        macd: string;
        signal: string;
        zero: string;
    };
    readonly widthRatio?: number;
    readonly width?: number | ((props: { widthRatio: number }, moreProps: any) => number);
    readonly yAccessor: (data: any) => { divergence: number; signal: number; macd: number } | undefined;
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

    private readonly yAccessorForDivergenceBase = (
        xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
        yScale: ScaleContinuousNumeric<number, number>,
    ) => {
        return yScale(0);
    };

    private readonly yAccessorForDivergence = (d: any) => {
        const { yAccessor } = this.props;

        const dataItem = yAccessor(d);
        if (dataItem !== undefined) {
            return dataItem.divergence;
        }

        return undefined;
    };

    private readonly yAccessorForSignal = (d: any) => {
        const { yAccessor } = this.props;

        const dataItem = yAccessor(d);
        if (dataItem !== undefined) {
            return dataItem.signal;
        }

        return undefined;
    };

    private readonly yAccessorForMACD = (d: any) => {
        const { yAccessor } = this.props;

        const dataItem = yAccessor(d);
        if (dataItem !== undefined) {
            return dataItem.macd;
        }

        return undefined;
    };
}
