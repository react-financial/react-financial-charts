import { strokeDashTypes } from "@react-financial-charts/core";
import { ScaleContinuousNumeric } from "d3-scale";
import { CurveFactory } from "d3-shape";
import * as React from "react";
import { AreaSeries } from "./AreaSeries";
import { SVGComponent } from "./SVGComponent";

export interface AlternatingFillAreaSeriesProps {
    readonly baseAt: number;
    /**
     * Wether to connect the area between undefined data points.
     */
    readonly connectNulls?: boolean;
    /**
     * Color, gradient, or pattern to use for fill.
     */
    readonly fillStyle?: {
        top: string;
        bottom: string;
    };
    /**
     * A factory for a curve generator for the area and line.
     */
    readonly curve?: CurveFactory;
    /**
     * Color, gradient, or pattern to use for the stroke.
     */
    readonly strokeStyle?: {
        top: string;
        bottom: string;
    };
    /**
     * Stroke dash.
     */
    readonly strokeDasharray?: {
        top: strokeDashTypes;
        bottom: strokeDashTypes;
    };
    /**
     * Stroke width.
     */
    readonly strokeWidth?: {
        top: number;
        bottom: number;
    };
    /**
     * Selector for data to plot.
     */
    readonly yAccessor: (data: any) => number | undefined;
}

/**
 * `AlternatingFillAreaSeries` component is similar to a `AreaSeries` but with different colors above and below the base.
 */
export class AlternatingFillAreaSeries extends React.Component<AlternatingFillAreaSeriesProps> {
    public static defaultProps = {
        connectNulls: false,
        fillStyle: {
            top: "rgba(38, 166, 154, 0.1)",
            bottom: "rgba(239, 83, 80, 0.1)",
        },
        strokeStyle: {
            top: "#26a69a",
            bottom: "#ef5350",
        },
        strokeWidth: {
            top: 2,
            bottom: 2,
        },
        strokeDasharray: {
            top: "Solid" as strokeDashTypes,
            bottom: "Solid" as strokeDashTypes,
        },
    };

    private clipPathId1 = `alternating-area-clip-${String(Math.round(Math.random() * 10000 * 10000))}`;
    private clipPathId2 = `alternating-area-clip-${String(Math.round(Math.random() * 10000 * 10000))}`;

    public render() {
        const {
            connectNulls,
            yAccessor,
            curve,
            strokeStyle = AlternatingFillAreaSeries.defaultProps.strokeStyle,
            strokeWidth = AlternatingFillAreaSeries.defaultProps.strokeWidth,
            strokeDasharray = AlternatingFillAreaSeries.defaultProps.strokeDasharray,
            fillStyle = AlternatingFillAreaSeries.defaultProps.fillStyle,
        } = this.props;

        return (
            <g>
                <SVGComponent>{this.renderClip}</SVGComponent>
                <AreaSeries
                    canvasClip={this.topClip}
                    connectNulls={connectNulls}
                    yAccessor={yAccessor}
                    curve={curve}
                    baseAt={this.baseAt}
                    fillStyle={fillStyle.top}
                    strokeStyle={strokeStyle.top}
                    strokeDasharray={strokeDasharray.top}
                    strokeWidth={strokeWidth.top}
                />
                <AreaSeries
                    canvasClip={this.bottomClip}
                    connectNulls={connectNulls}
                    yAccessor={yAccessor}
                    curve={curve}
                    baseAt={this.baseAt}
                    fillStyle={fillStyle.bottom}
                    strokeStyle={strokeStyle.bottom}
                    strokeDasharray={strokeDasharray.bottom}
                    strokeWidth={strokeWidth.bottom}
                />
            </g>
        );
    }

    private readonly baseAt = (yScale: ScaleContinuousNumeric<number, number>) => {
        return yScale(this.props.baseAt);
    };

    private readonly renderClip = (moreProps: any) => {
        const { chartConfig } = moreProps;
        const { baseAt } = this.props;
        const { yScale, width, height } = chartConfig;

        return (
            <defs>
                <clipPath id={this.clipPathId1}>
                    <rect x={0} y={0} width={width} height={yScale(baseAt)} />
                </clipPath>
                <clipPath id={this.clipPathId2}>
                    <rect x={0} y={yScale(baseAt)} width={width} height={height - yScale(baseAt)} />
                </clipPath>
            </defs>
        );
    };

    private readonly bottomClip = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { chartConfig } = moreProps;
        const { baseAt } = this.props;
        const { yScale, width, height } = chartConfig;

        ctx.beginPath();
        ctx.rect(0, yScale(baseAt), width, height - yScale(baseAt));
        ctx.clip();
    };

    private readonly topClip = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { chartConfig } = moreProps;
        const { baseAt } = this.props;
        const { yScale, width } = chartConfig;

        ctx.beginPath();
        ctx.rect(0, 0, width, yScale(baseAt));
        ctx.clip();
    };
}
