import * as React from "react";

import { BarSeries } from "./BarSeries";
import { LineSeries } from "./LineSeries";
import { StraightLine } from "./StraightLine";

interface MACDSeriesProps {
    readonly className?: string;
    readonly yAccessor?: any; // func
    readonly opacity?: number;
    readonly divergenceStroke?: boolean;
    readonly zeroLineStroke?: string;
    readonly zeroLineOpacity?: number;
    readonly clip?: boolean;
    readonly stroke: {
        macd: string;
        signal: string;
    };
    readonly fill: {
        divergence: string | any; // func
    };
    readonly widthRatio?: number;
    readonly width?: number | any; // func
}

export class MACDSeries extends React.Component<MACDSeriesProps> {

    public static defaultProps = {
        className: "react-financial-charts-macd-series",
        fill: {
            divergence: "#4682B4",
        },
        zeroLineStroke: "#000000",
        zeroLineOpacity: 0.3,
        opacity: 0.6,
        divergenceStroke: false,
        clip: true,
        stroke: {
            macd: "#0093FF",
            signal: "#D84315",
        },
        widthRatio: 0.5,
        width: BarSeries.defaultProps.width,
    };

    public render() {
        const { className, opacity, divergenceStroke, widthRatio, width } = this.props;
        const { stroke, fill } = this.props;

        const { clip } = this.props;
        const { zeroLineStroke, zeroLineOpacity } = this.props;

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
