import { strokeDashTypes } from "@react-financial-charts/core";
import { ScaleContinuousNumeric } from "d3-scale";
import { CurveFactory } from "d3-shape";
import React, { Component } from "react";
import { AreaOnlySeries } from "./AreaOnlySeries";
import { LineSeries } from "./LineSeries";

export interface AreaSeriesProps {
    /**
     * The base y value to draw the area to.
     */
    readonly baseAt?:
        | number
        | ((yScale: ScaleContinuousNumeric<number, number>, d: [number, number], moreProps: any) => number);
    readonly canvasClip?: (context: CanvasRenderingContext2D, moreProps: any) => void;
    readonly className?: string;
    /**
     * Color, gradient, or pattern to use for fill.
     */
    readonly fillStyle?: string;
    /**
     * A factory for a curve generator for the area and line.
     */
    readonly curve?: CurveFactory;
    /**
     * Color, gradient, or pattern to use for the stroke.
     */
    readonly strokeStyle?: string;
    /**
     * Stroke dash.
     */
    readonly strokeDasharray?: strokeDashTypes;
    /**
     * Stroke width.
     */
    readonly strokeWidth?: number;
    /**
     * Selector for data to plot.
     */
    readonly yAccessor: (data: any) => number | undefined;
}

/**
 * `AreaSeries` component is similar to a `LineSeries` but with the area between the line and base filled.
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
            curve,
            canvasClip,
            yAccessor,
        } = this.props;

        return (
            <g className={className}>
                <AreaOnlySeries
                    yAccessor={yAccessor}
                    curve={curve}
                    base={baseAt}
                    fillStyle={fillStyle}
                    canvasClip={canvasClip}
                />
                <LineSeries
                    yAccessor={yAccessor}
                    strokeStyle={strokeStyle}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    curve={curve}
                    canvasClip={canvasClip}
                    highlightOnHover={false}
                />
            </g>
        );
    }
}
