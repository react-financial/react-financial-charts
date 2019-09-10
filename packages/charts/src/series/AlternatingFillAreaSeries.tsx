import * as React from "react";

import { strokeDashTypes } from "../utils";
import { AreaSeries } from "./AreaSeries";
import { SVGComponent } from "./SVGComponent";

interface AlternatingFillAreaSeriesProps {
    stroke?: {
        top: string;
        bottom: string;
    };
    strokeWidth?: {
        top: number;
        bottom: number;
    };
    strokeOpacity?: {
        top: number;
        bottom: number;
    };
    fill?: {
        top: string;
        bottom: string;
    };
    fillOpacity?: {
        top: number,
        bottom: number,
    };
    strokeDasharray?: {
        top: strokeDashTypes;
        bottom: strokeDashTypes;
    };
    className?: string;
    yAccessor: (data: any) => number;
    baseAt: number;
    interpolation?: any; // func
}

export class AlternatingFillAreaSeries extends React.Component<AlternatingFillAreaSeriesProps> {

    public static defaultProps = {
        stroke: {
            top: "#26a69a",
            bottom: "#ef5350",
        },
        strokeWidth: {
            top: 2,
            bottom: 2,
        },
        strokeOpacity: {
            top: 1,
            bottom: 1,
        },
        fill: {
            top: "#26a69a",
            bottom: "#ef5350",
        },
        fillOpacity: {
            top: 0.1,
            bottom: 0.1,
        },
        strokeDasharray: {
            top: "Solid" as strokeDashTypes,
            bottom: "Solid" as strokeDashTypes,
        },
        className: "react-financial-charts-alternating-area",
    };

    private clipPathId1 = `alternating-area-clip-${String(Math.round(Math.random() * 10000 * 10000))}`;
    private clipPathId2 = `alternating-area-clip-${String(Math.round(Math.random() * 10000 * 10000))}`;

    public render() {
        const {
            className,
            yAccessor,
            interpolation,
            stroke = AlternatingFillAreaSeries.defaultProps.stroke,
            strokeWidth = AlternatingFillAreaSeries.defaultProps.strokeWidth,
            strokeOpacity = AlternatingFillAreaSeries.defaultProps.strokeOpacity,
            strokeDasharray = AlternatingFillAreaSeries.defaultProps.strokeDasharray,
            fill = AlternatingFillAreaSeries.defaultProps.fill,
            fillOpacity = AlternatingFillAreaSeries.defaultProps.fillOpacity,
        } = this.props;

        const style1 = { clipPath: `url(#${this.clipPathId1})` };
        const style2 = { clipPath: `url(#${this.clipPathId2})` };

        return (
            <g className={className}>
                <SVGComponent>
                    {this.renderClip}
                </SVGComponent>
                <AreaSeries
                    style={style1}
                    canvasClip={this.topClip}
                    yAccessor={yAccessor}
                    interpolation={interpolation}
                    baseAt={this.baseAt}
                    fill={fill.top}
                    opacity={fillOpacity.top}
                    stroke={stroke.top}
                    strokeOpacity={strokeOpacity.top}
                    strokeDasharray={strokeDasharray.top}
                    strokeWidth={strokeWidth.top}
                />
                <AreaSeries
                    style={style2}
                    canvasClip={this.bottomClip}
                    yAccessor={yAccessor}
                    interpolation={interpolation}
                    baseAt={this.baseAt}
                    fill={fill.bottom}
                    opacity={fillOpacity.bottom}
                    stroke={stroke.bottom}
                    strokeOpacity={strokeOpacity.bottom}
                    strokeDasharray={strokeDasharray.bottom}
                    strokeWidth={strokeWidth.bottom}
                />
            </g>
        );
    }

    private readonly baseAt = (yScale) => {
        return yScale(this.props.baseAt);
    }

    private readonly renderClip = (moreProps) => {
        const { chartConfig } = moreProps;
        const { baseAt } = this.props;
        const { yScale, width, height } = chartConfig;

        return (
            <defs>
                <clipPath id={this.clipPathId1}>
                    <rect
                        x={0}
                        y={0}
                        width={width}
                        height={yScale(baseAt)}
                    />
                </clipPath>
                <clipPath id={this.clipPathId2}>
                    <rect
                        x={0}
                        y={yScale(baseAt)}
                        width={width}
                        height={height - yScale(baseAt)}
                    />
                </clipPath>
            </defs>
        );
    }

    private readonly bottomClip = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { chartConfig } = moreProps;
        const { baseAt } = this.props;
        const { yScale, width, height } = chartConfig;

        ctx.beginPath();
        ctx.rect(
            0,
            yScale(baseAt),
            width,
            height - yScale(baseAt),
        );
        ctx.clip();
    }

    private readonly topClip = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { chartConfig } = moreProps;
        const { baseAt } = this.props;
        const { yScale, width } = chartConfig;

        ctx.beginPath();
        ctx.rect(
            0,
            0,
            width,
            yScale(baseAt),
        );
        ctx.clip();
    }
}
