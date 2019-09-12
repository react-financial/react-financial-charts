import * as React from "react";

import { strokeDashTypes } from "../utils";
import { OverlayBarSeries } from "./OverlayBarSeries";
import { StraightLine } from "./StraightLine";

interface ElderRaySeriesProps {
    readonly bearPowerFill?: string;
    readonly bullPowerFill?: string;
    readonly className?: string;
    readonly clip?: boolean;
    readonly stroke?: boolean;
    readonly strokeOpacity?: number;
    readonly straightLineStroke?: string;
    readonly straightLineOpacity?: number;
    readonly straightLineStrokeDasharray?: strokeDashTypes;
    readonly widthRatio?: number;
    readonly yAccessor: (data: any) => { bearPower: number, bullPower: number };
}

export class ElderRaySeries extends React.Component<ElderRaySeriesProps> {

    public static defaultProps = {
        bearPowerFill: "#ef5350",
        bullPowerFill: "#26a69a",
        className: "react-financial-charts-elderray-series",
        clip: true,
        opacity: 0.7,
        stroke: true,
        strokeOpacity: 0.7,
        straightLineStroke: "#000000",
        straightLineStrokeDasharray: "Dash",
        straightLineOpacity: 0.7,
        widthRatio: 0.8,
    };

    public render() {
        const {
            className,
            clip,
            stroke,
            strokeOpacity,
            straightLineStroke,
            straightLineStrokeDasharray,
            straightLineOpacity,
            widthRatio,
        } = this.props;

        return (
            <g className={className}>
                <OverlayBarSeries
                    baseAt={this.yAccessorForBarBase}
                    className="react-financial-charts-elderray-bar"
                    stroke={stroke}
                    fill={this.fillForEachBar}
                    opacity={strokeOpacity}
                    widthRatio={widthRatio}
                    clip={clip}
                    yAccessor={[this.yAccessorBullTop, this.yAccessorBearTop, this.yAccessorBullBottom, this.yAccessorBearBottom]} />
                <StraightLine
                    className="react-financial-charts-elderray-straight-line"
                    yValue={0}
                    stroke={straightLineStroke}
                    strokeDasharray={straightLineStrokeDasharray}
                    opacity={straightLineOpacity} />
            </g>
        );
    }

    private readonly yAccessorBullTop = (d: any) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && (yAccessor(d).bullPower > 0 ? yAccessor(d).bullPower : undefined);
    }

    private readonly yAccessorBearTop = (d: any) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && (yAccessor(d).bearPower > 0 ? yAccessor(d).bearPower : undefined);
    }

    private readonly yAccessorBullBottom = (d: any) => {
        const { yAccessor } = this.props;
        return yAccessor(d) && (yAccessor(d).bullPower < 0 ? 0 : undefined);
    }

    private readonly yAccessorBearBottom = (d: any) => {
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
