import * as React from "react";

import { strokeDashTypes } from "../utils";
import { AreaOnlySeries } from "./AreaOnlySeries";
import { LineSeries } from "./LineSeries";

interface AreaSeriesProps {
    stroke?: string;
    strokeWidth?: number;
    canvasGradient?: any; // func
    fill: string;
    strokeOpacity: number;
    opacity: number;
    className?: string;
    yAccessor: any; // func
    baseAt?: any; // func
    interpolation?: any; // func
    canvasClip?: any; // func
    style: React.CSSProperties;
    strokeDasharray: strokeDashTypes;
}

export class AreaSeries extends React.Component<AreaSeriesProps> {

    public static defaultProps = {
        stroke: "#4682B4",
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeDasharray: "Solid",
        opacity: 0.5,
        fill: "#4682B4",
        className: "react-stockcharts-area",
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
