import * as React from "react";

import { LineSeries } from "./LineSeries";
import { StraightLine } from "./StraightLine";

export interface StochasticSeriesProps {
    readonly className?: string;
    readonly overBought?: number;
    readonly overSold?: number;
    readonly middle?: number;
    readonly strokeStyle?: {
        top: string;
        middle: string;
        bottom: string;
        dLine: string;
        kLine: string;
    };
    readonly yAccessor: (data: any) => { K: number; D: number };
}

/**
 * The Stochastic Oscillator is a momentum indicator that shows the location of the close relative to the high-low range over a set number of periods.
 */
export class StochasticSeries extends React.Component<StochasticSeriesProps> {
    public static defaultProps = {
        className: "react-financial-charts-stochastic-series",
        strokeStyle: {
            top: "rgba(150, 75, 0, 0.3)",
            middle: "rgba(0, 0, 0, 0.3)",
            bottom: "rgba(150, 75, 0, 0.3)",
            dLine: "#EA2BFF",
            kLine: "#74D400",
        },
        overSold: 80,
        middle: 50,
        overBought: 20,
    };

    public render() {
        const {
            className,
            strokeStyle = StochasticSeries.defaultProps.strokeStyle,
            overSold,
            middle,
            overBought,
        } = this.props;

        return (
            <g className={className}>
                <LineSeries yAccessor={this.yAccessorForD} strokeStyle={strokeStyle.dLine} />
                <LineSeries yAccessor={this.yAccessorForK} strokeStyle={strokeStyle.kLine} />
                <StraightLine strokeStyle={strokeStyle.top} yValue={overSold} />
                <StraightLine strokeStyle={strokeStyle.middle} yValue={middle} />
                <StraightLine strokeStyle={strokeStyle.bottom} yValue={overBought} />
            </g>
        );
    }

    private readonly yAccessorForK = (d: any) => {
        const { yAccessor } = this.props;

        return yAccessor(d) && yAccessor(d).K;
    };

    private readonly yAccessorForD = (d: any) => {
        const { yAccessor } = this.props;

        return yAccessor(d) && yAccessor(d).D;
    };
}
