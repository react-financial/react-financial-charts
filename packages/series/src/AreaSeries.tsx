import { strokeDashTypes } from "@react-financial-charts/core";
import { ScaleContinuousNumeric } from "d3-scale";
import { CurveFactory } from "d3-shape";
import React, { Component } from "react";
import { AreaOnlySeries } from "./AreaOnlySeries";
import { LineSeries } from "./LineSeries";

interface AreaSeriesProps {
    readonly baseAt?:
        | number
        | ((yScale: ScaleContinuousNumeric<number, number>, d: [number, number], moreProps: any) => number);
    readonly canvasClip?: (context: CanvasRenderingContext2D, moreProps: any) => void;
    readonly className?: string;
    readonly fillStyle?: string | CanvasGradient | CanvasPattern;
    readonly interpolation?: CurveFactory;
    readonly strokeStyle?: string | CanvasGradient | CanvasPattern;
    readonly strokeDasharray?: strokeDashTypes;
    readonly strokeWidth?: number;
    readonly style?: React.CSSProperties;
    readonly yAccessor: (data: any) => number;
}

/**
 * `AreaSeries` component.
 */
export class AreaSeries extends Component<AreaSeriesProps> {
    public static defaultProps: Partial<AreaSeriesProps> = {
        className: "react-financial-charts-area",
        fillStyle: "rgba(33, 150, 243, 0.1)",
        strokeStyle: "#2196f3",
        strokeWidth: 3,
        strokeDasharray: "Solid",
    };

    public render() {
        const {
            baseAt,
            className,
            strokeStyle,
            strokeWidth,
            strokeDasharray,
            fillStyle,
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
                    fillStyle={fillStyle}
                    style={style}
                    canvasClip={canvasClip}
                />
                <LineSeries
                    yAccessor={yAccessor}
                    strokeStyle={strokeStyle}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    interpolation={interpolation}
                    style={style}
                    canvasClip={canvasClip}
                    highlightOnHover={false}
                />
            </g>
        );
    }
}
