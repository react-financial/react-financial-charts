import * as React from "react";

import { BarSeries } from "./BarSeries";
import { LineSeries } from "./LineSeries";
import { StraightLine } from "./StraightLine";

interface MACDSeriesProps {
    readonly className?: string;
    readonly clip?: boolean;
    readonly divergenceStroke?: boolean;
    readonly fill?: {
        divergence: string | any; // func
    };
    readonly opacity?: number;
    readonly stroke?: {
        macd: string;
        signal: string;
    };
    readonly widthRatio?: number;
    readonly width?: number | any; // func
    readonly yAccessor?: any; // func
    readonly zeroLineStroke?: string;
    readonly zeroLineOpacity?: number;
}

export class MACDSeries extends React.Component<MACDSeriesProps> {

    public static defaultProps = {
        className: "react-financial-charts-macd-series",
        clip: true,
        divergenceStroke: false,
        fill: {
            divergence: "#4682B4",
        },
        opacity: 0.6,
        stroke: {
            macd: "#0093FF",
            signal: "#D84315",
        },
        widthRatio: 0.5,
        width: BarSeries.defaultProps.width,
        zeroLineStroke: "#000000",
        zeroLineOpacity: 0.3,
    };

    public render() {
        const {
            className,
            clip,
            fill = MACDSeries.defaultProps.fill,
            opacity,
            divergenceStroke,
            stroke = MACDSeries.defaultProps.stroke,
            widthRatio,
            width,
            zeroLineStroke,
            zeroLineOpacity,
        } = this.props;

        return (
            <g className={className}>
                <BarSeries
                    baseAt={this.yAccessorForDivergenceBase}
                    className="macd-divergence"
                    width={width}
                    widthRatio={widthRatio}
                    stroke={divergenceStroke}
                    fill={fill.divergence}
                    opacity={opacity}
                    clip={clip}
                    yAccessor={this.yAccessorForDivergence} />
                <LineSeries
                    yAccessor={this.yAccessorForMACD}
                    stroke={stroke.macd} />
                <LineSeries
                    yAccessor={this.yAccessorForSignal}
                    stroke={stroke.signal} />
                <StraightLine
                    stroke={zeroLineStroke}
                    opacity={zeroLineOpacity}
                    yValue={0} />
            </g>
        );
    }

    private readonly yAccessorForDivergenceBase = (xScale, yScale) => {
        return yScale(0);
    }

    private readonly yAccessorForDivergence = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && yAccessor(d).divergence;
    }

    private readonly yAccessorForSignal = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && yAccessor(d).signal;
    }

    private readonly yAccessorForMACD = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && yAccessor(d).macd;
    }
}
