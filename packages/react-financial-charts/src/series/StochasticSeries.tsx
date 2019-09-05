import * as React from "react";

import { LineSeries } from "./LineSeries";
import { StraightLine } from "./StraightLine";

interface StochasticSeriesProps {
    className?: string;
    yAccessor: any; // func
    stroke: {
        top: string;
        middle: string;
        bottom: string;
        dLine: string;
        kLine: string;
    };
    overSold: number;
    middle: number;
    overBought: number;
    refLineOpacity: number;
}

export class StochasticSeries extends React.Component<StochasticSeriesProps> {

    public static defaultProps = {
        className: "react-stockcharts-stochastic-series",
        stroke: {
            top: "#964B00",
            middle: "#000000",
            bottom: "#964B00",
            dLine: "#EA2BFF",
            kLine: "#74D400",
        },
        overSold: 80,
        middle: 50,
        overBought: 20,
        refLineOpacity: 0.3,
    };

    public render() {
        const { className, stroke, refLineOpacity } = this.props;
        const { overSold, middle, overBought } = this.props;
        return (
            <g className={className}>
                <LineSeries
                    yAccessor={this.yAccessorForD}
                    stroke={stroke.dLine}
                    fill="none" />
                <LineSeries
                    yAccessor={this.yAccessorForK}
                    stroke={stroke.kLine}
                    fill="none" />
                <StraightLine
                    stroke={stroke.top}
                    opacity={refLineOpacity}
                    yValue={overSold} />
                <StraightLine
                    stroke={stroke.middle}
                    opacity={refLineOpacity}
                    yValue={middle} />
                <StraightLine
                    stroke={stroke.bottom}
                    opacity={refLineOpacity}
                    yValue={overBought} />
            </g>
        );
    }

    private readonly yAccessorForK = (d) => {
        const { yAccessor } = this.props;

        return yAccessor(d) && yAccessor(d).K;
    }

    private readonly yAccessorForD = (d) => {
        const { yAccessor } = this.props;

        return yAccessor(d) && yAccessor(d).D;
    }
}
