import * as React from "react";

import OverlayBarSeries from "./OverlayBarSeries";
import { StraightLine } from "./StraightLine";

interface ElderRaySeriesProps {
    className?: string;
    yAccessor: any; // func
    opacity?: number;
    stroke?: boolean;
    bullPowerFill?: string;
    bearPowerFill?: string;
    straightLineStroke?: string;
    straightLineOpacity?: number;
    widthRatio?: number;
    clip: boolean;
}

export class ElderRaySeries extends React.Component<ElderRaySeriesProps> {

    public static defaultProps = {
        className: "react-stockcharts-elderray-series",
        straightLineStroke: "#000000",
        straightLineOpacity: 0.3,
        opacity: 0.5,
        stroke: true,
        bullPowerFill: "#6BA583",
        bearPowerFill: "#FF0000",
        widthRatio: 0.8,
        clip: true,
    };

    public render() {
        const { className, opacity, stroke,
            straightLineStroke,
            straightLineOpacity,
            widthRatio,
        } = this.props;
        const { clip } = this.props;

        return (
            <g className={className}>
                <OverlayBarSeries
                    baseAt={this.yAccessorForBarBase}
                    className="react-stockcharts-elderray-bar"
                    stroke={stroke}
                    fill={this.fillForEachBar}
                    opacity={opacity}
                    widthRatio={widthRatio}
                    clip={clip}
                    yAccessor={[this.yAccessorBullTop, this.yAccessorBearTop, this.yAccessorBullBottom, this.yAccessorBearBottom]} />
                <StraightLine
                    className="react-stockcharts-elderray-straight-line"
                    yValue={0}
                    stroke={straightLineStroke}
                    opacity={straightLineOpacity} />
            </g>
        );
    }

    private readonly yAccessorBullTop = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && (yAccessor(d).bullPower > 0 ? yAccessor(d).bullPower : undefined);
    }

    private readonly yAccessorBearTop = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && (yAccessor(d).bearPower > 0 ? yAccessor(d).bearPower : undefined);
    }

    private readonly yAccessorBullBottom = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && (yAccessor(d).bullPower < 0 ? 0 : undefined);
    }

    private readonly yAccessorBearBottom = (d) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && (yAccessor(d).bullPower < 0
            || yAccessor(d).bullPower * yAccessor(d).bearPower < 0 // bullPower is +ve and bearPower is -ve
            ? Math.min(0, yAccessor(d).bullPower) : undefined);
    }

    private readonly yAccessorForBarBase = (xScale, yScale, d) => {
        const { yAccessor } = this.props;
        const y = yAccessor(d) && Math.min(yAccessor(d).bearPower, 0);
        return yScale(y);
    }

    private readonly fillForEachBar = (d, yAccessorNumber) => {
        const { bullPowerFill, bearPowerFill } = this.props;
        return yAccessorNumber % 2 === 0 ? bullPowerFill : bearPowerFill;
    }
}
