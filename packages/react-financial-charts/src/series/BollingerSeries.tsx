import * as React from "react";

import { AreaOnlySeries } from "./AreaOnlySeries";
import { LineSeries } from "./LineSeries";

interface BollingerSeriesProps {
    yAccessor: any; // func
    className?: string;
    areaClassName?: string;
    opacity?: number;
    type?: string;
    stroke: {
        top: string,
        middle: string,
        bottom: string,
    };
    fill: string;
}

export class BollingerSeries extends React.Component<BollingerSeriesProps> {

    public static defaultProps = {
        className: "react-stockcharts-bollinger-band-series",
        areaClassName: "react-stockcharts-bollinger-band-series-area",
        opacity: 0.2,
    };

    public render() {
        const { areaClassName, className, opacity } = this.props;
        const { stroke, fill } = this.props;

        return (
            <g className={className}>
                <LineSeries
                    yAccessor={this.yAccessorForTop}
                    stroke={stroke.top}
                    fill="none" />
                <LineSeries
                    yAccessor={this.yAccessorForMiddle}
                    stroke={stroke.middle}
                    fill="none" />
                <LineSeries
                    yAccessor={this.yAccessorForBottom}
                    stroke={stroke.bottom}
                    fill="none" />
                <AreaOnlySeries
                    className={areaClassName}
                    yAccessor={this.yAccessorForTop}
                    base={this.yAccessorForScalledBottom}
                    stroke="none" fill={fill}
                    opacity={opacity} />
            </g>
        );
    }

    private readonly yAccessorForScalledBottom = (scale, d) => {
        const { yAccessor } = this.props;
        return scale(yAccessor(d) && yAccessor(d).bottom);
    }

    private readonly yAccessorForBottom = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && yAccessor(d).bottom;
    }

    private readonly yAccessorForMiddle = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && yAccessor(d).middle;
    }

    private readonly yAccessorForTop = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && yAccessor(d).top;
    }
}
