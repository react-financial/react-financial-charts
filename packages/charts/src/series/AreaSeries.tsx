import * as React from "react";

import { strokeDashTypes } from "../utils";
import { AreaOnlySeries } from "./AreaOnlySeries";
import { LineSeries } from "./LineSeries";

interface AreaSeriesProps {
    readonly stroke?: string;
    readonly strokeWidth?: number;
    readonly canvasGradient?: any; // func
    readonly fill?: string;
    readonly strokeOpacity?: number;
    readonly opacity?: number;
    readonly className?: string;
    readonly yAccessor: (data: any) => number;
    readonly baseAt?: number | ((yScale: any, d: [number, number], moreProps: any) => number);
    readonly interpolation?: any; // func
    readonly canvasClip?: any; // func
    readonly style?: React.CSSProperties;
    readonly strokeDasharray?: strokeDashTypes;
}

export class AreaSeries extends React.Component<AreaSeriesProps> {

    public static defaultProps = {
        stroke: "#2196f3",
        strokeWidth: 3,
        strokeOpacity: 1,
        strokeDasharray: "Solid",
        opacity: 0.1,
        fill: "#2196f3",
        className: "react-financial-charts-area",
    };

    public render() {
        const {
            baseAt,
            className,
            opacity,
            stroke,
            strokeWidth,
            strokeOpacity,
            strokeDasharray,
            canvasGradient,
            fill,
            interpolation,
            style,
            canvasClip,
            yAccessor,
        } = this.props;

        return (
            <g className={className}>
                <AreaOnlySeries
                    yAccessor={yAccessor}
                    interpolation={interpolation}
                    base={baseAt}
                    canvasGradient={canvasGradient}
                    fill={fill}
                    opacity={opacity}
                    style={style}
                    canvasClip={canvasClip}
                    stroke="none"
                />
                <LineSeries
                    yAccessor={yAccessor}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeOpacity={strokeOpacity}
                    strokeDasharray={strokeDasharray}
                    interpolation={interpolation}
                    style={style}
                    canvasClip={canvasClip}
                    fill="none"
                    highlightOnHover={false}
                />
            </g>
        );
    }
}
