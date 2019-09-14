import * as React from "react";

import { AreaOnlySeries } from "./AreaOnlySeries";
import { LineSeries } from "./LineSeries";

interface BollingerSeriesProps {
    readonly areaClassName?: string;
    readonly className?: string;
    readonly fill?: string;
    readonly opacity?: number;
    readonly stroke?: {
        top: string,
        middle: string,
        bottom: string,
    };
    readonly yAccessor?: any; // func
}

export class BollingerSeries extends React.Component<BollingerSeriesProps> {

    public static defaultProps = {
        areaClassName: "react-financial-charts-bollinger-band-series-area",
        className: "react-financial-charts-bollinger-band-series",
        fill: "#26a69a",
        opacity: 0.05,
        stroke: {
            top: "#26a69a",
            middle: "#812828",
            bottom: "#26a69a",
        },
        yAccessor: (data: any) => data.bb,
    };

    public render() {
        const {
            areaClassName,
            className,
            opacity,
            stroke = BollingerSeries.defaultProps.stroke,
            fill,
        } = this.props;

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
                    stroke="none"
                    fill={fill}
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
