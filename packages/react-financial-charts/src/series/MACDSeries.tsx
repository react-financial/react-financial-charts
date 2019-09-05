import * as React from "react";

import { BarSeries } from "./BarSeries";
import { LineSeries } from "./LineSeries";
import { StraightLine } from "./StraightLine";

interface MACDSeriesProps {
    className?: string;
    yAccessor?: any; // func
    opacity?: number;
    divergenceStroke?: boolean;
    zeroLineStroke?: string;
    zeroLineOpacity?: number;
    clip: boolean;
    stroke: {
        macd: string;
        signal: string;
    };
    fill: {
        divergence: string | any; // func
    };
    widthRatio?: number;
    width?: number | any; // func
}

export class MACDSeries extends React.Component<MACDSeriesProps> {

    public static defaultProps = {
        className: "react-stockcharts-macd-series",
        zeroLineStroke: "#000000",
        zeroLineOpacity: 0.3,
        opacity: 0.6,
        divergenceStroke: false,
        clip: true,
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
                    stroke={stroke.macd}
                    fill="none" />
                <LineSeries
                    yAccessor={this.yAccessorForSignal}
                    stroke={stroke.signal}
                    fill="none" />
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
