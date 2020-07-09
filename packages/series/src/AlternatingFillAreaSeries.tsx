import { strokeDashTypes } from "@react-financial-charts/core";
import * as React from "react";

import { AreaSeries } from "./AreaSeries";
import { SVGComponent } from "./SVGComponent";
import { CurveFactory } from "d3-shape";

interface AlternatingFillAreaSeriesProps {
    readonly baseAt: number;
    readonly className?: string;
    readonly fillStyle?: {
        top: string | CanvasGradient | CanvasPattern;
        bottom: string | CanvasGradient | CanvasPattern;
    };
    readonly interpolation?: CurveFactory;
    readonly strokeStyle?: {
        top: string | CanvasGradient | CanvasPattern;
        bottom: string | CanvasGradient | CanvasPattern;
    };
    readonly strokeWidth?: {
        top: number;
        bottom: number;
    };
    readonly strokeDasharray?: {
        top: strokeDashTypes;
        bottom: strokeDashTypes;
    };
    readonly yAccessor: (data: any) => number;
}

export class AlternatingFillAreaSeries extends React.Component<AlternatingFillAreaSeriesProps> {
    public static defaultProps = {
        className: "react-financial-charts-alternating-area",
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
            className,
            yAccessor,
            interpolation,
            strokeStyle = AlternatingFillAreaSeries.defaultProps.strokeStyle,
            strokeWidth = AlternatingFillAreaSeries.defaultProps.strokeWidth,
            strokeDasharray = AlternatingFillAreaSeries.defaultProps.strokeDasharray,
            fillStyle = AlternatingFillAreaSeries.defaultProps.fillStyle,
        } = this.props;

        const style1 = { clipPath: `url(#${this.clipPathId1})` };
        const style2 = { clipPath: `url(#${this.clipPathId2})` };

        return (
            <g className={className}>
                <SVGComponent>{this.renderClip}</SVGComponent>
                <AreaSeries
                    style={style1}
                    canvasClip={this.topClip}
                    yAccessor={yAccessor}
                    interpolation={interpolation}
                    baseAt={this.baseAt}
                    fillStyle={fillStyle.top}
                    strokeStyle={strokeStyle.top}
                    strokeDasharray={strokeDasharray.top}
                    strokeWidth={strokeWidth.top}
                />
                <AreaSeries
                    style={style2}
                    canvasClip={this.bottomClip}
                    yAccessor={yAccessor}
                    interpolation={interpolation}
                    baseAt={this.baseAt}
                    fillStyle={fillStyle.bottom}
                    strokeStyle={strokeStyle.bottom}
                    strokeDasharray={strokeDasharray.bottom}
                    strokeWidth={strokeWidth.bottom}
                />
            </g>
        );
    }

    private readonly baseAt = (yScale) => {
        return yScale(this.props.baseAt);
    };

    private readonly renderClip = (moreProps) => {
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

    private readonly bottomClip = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { chartConfig } = moreProps;
        const { baseAt } = this.props;
        const { yScale, width, height } = chartConfig;

        ctx.beginPath();
        ctx.rect(0, yScale(baseAt), width, height - yScale(baseAt));
        ctx.clip();
    };

    private readonly topClip = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { chartConfig } = moreProps;
        const { baseAt } = this.props;
        const { yScale, width } = chartConfig;

        ctx.beginPath();
        ctx.rect(0, 0, width, yScale(baseAt));
        ctx.clip();
    };
}
