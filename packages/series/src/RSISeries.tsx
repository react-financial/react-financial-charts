import * as React from "react";
import { strokeDashTypes } from "@react-financial-charts/core";
import { LineSeries } from "./LineSeries";
import { StraightLine } from "./StraightLine";
import { SVGComponent } from "./SVGComponent";

export interface RSISeriesProps {
    readonly className?: string;
    readonly yAccessor: (data: any) => any;
    readonly strokeStyle?: {
        line: string;
        top: string;
        middle: string;
        bottom: string;
        outsideThreshold: string;
        insideThreshold: string;
    };
    readonly strokeDasharray?: {
        line: strokeDashTypes;
        top: strokeDashTypes;
        middle: strokeDashTypes;
        bottom: strokeDashTypes;
    };
    readonly strokeWidth?: {
        outsideThreshold: number;
        insideThreshold: number;
        top: number;
        middle: number;
        bottom: number;
    };
    readonly overSold?: number;
    readonly middle?: number;
    readonly overBought?: number;
}

/**
 * The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements.
 */
export class RSISeries extends React.Component<RSISeriesProps> {
    public static defaultProps = {
        className: "react-financial-charts-rsi-series",
        strokeStyle: {
            line: "#000000",
            top: "#B8C2CC",
            middle: "#8795A1",
            bottom: "#B8C2CC",
            outsideThreshold: "#b300b3",
            insideThreshold: "#ffccff",
        },
        strokeDasharray: {
            line: "Solid" as strokeDashTypes,
            top: "ShortDash" as strokeDashTypes,
            middle: "ShortDash" as strokeDashTypes,
            bottom: "ShortDash" as strokeDashTypes,
        },
        strokeWidth: {
            outsideThreshold: 1,
            insideThreshold: 1,
            top: 1,
            middle: 1,
            bottom: 1,
        },
        overSold: 70,
        middle: 50,
        overBought: 30,
    };

    private clipPathId1 = `rsi-clip-${String(Math.round(Math.random() * 10000 * 10000))}`;
    private clipPathId2 = `rsi-clip-${String(Math.round(Math.random() * 10000 * 10000))}`;

    public render() {
        const {
            className,
            strokeStyle = RSISeries.defaultProps.strokeStyle,
            strokeDasharray = RSISeries.defaultProps.strokeDasharray,
            strokeWidth = RSISeries.defaultProps.strokeWidth,
        } = this.props;
        const { yAccessor } = this.props;
        const { overSold, middle, overBought } = this.props;

        return (
            <g className={className}>
                <SVGComponent>{this.renderClip}</SVGComponent>
                <StraightLine
                    strokeStyle={strokeStyle.top}
                    yValue={overSold}
                    lineDash={strokeDasharray.top}
                    lineWidth={strokeWidth.top}
                />
                <StraightLine
                    strokeStyle={strokeStyle.middle}
                    yValue={middle}
                    lineDash={strokeDasharray.middle}
                    lineWidth={strokeWidth.middle}
                />
                <StraightLine
                    strokeStyle={strokeStyle.bottom}
                    yValue={overBought}
                    lineDash={strokeDasharray.bottom}
                    lineWidth={strokeWidth.bottom}
                />
                <LineSeries
                    canvasClip={this.topAndBottomClip}
                    yAccessor={yAccessor}
                    strokeStyle={strokeStyle.insideThreshold || strokeStyle.line}
                    strokeWidth={strokeWidth.insideThreshold}
                    strokeDasharray={strokeDasharray.line}
                />
                <LineSeries
                    canvasClip={this.mainClip}
                    yAccessor={yAccessor}
                    strokeStyle={strokeStyle.outsideThreshold || strokeStyle.line}
                    strokeWidth={strokeWidth.outsideThreshold}
                    strokeDasharray={strokeDasharray.line}
                />
            </g>
        );
    }

    private readonly renderClip = (moreProps: any) => {
        const { chartConfig } = moreProps;
        const { overSold, overBought } = this.props;
        const { yScale, width, height } = chartConfig;

        return (
            <defs>
                <clipPath id={this.clipPathId1}>
                    <rect x={0} y={yScale(overSold)} width={width} height={yScale(overBought) - yScale(overSold)} />
                </clipPath>
                <clipPath id={this.clipPathId2}>
                    <rect x={0} y={0} width={width} height={yScale(overSold)} />
                    <rect x={0} y={yScale(overBought)} width={width} height={height - yScale(overBought)} />
                </clipPath>
            </defs>
        );
    };

    private readonly mainClip = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { chartConfig } = moreProps;
        const { overSold, overBought } = this.props;
        const { yScale, width, height } = chartConfig;

        ctx.beginPath();
        ctx.rect(0, 0, width, yScale(overSold));
        ctx.rect(0, yScale(overBought), width, height - yScale(overBought));
        ctx.clip();
    };

    private readonly topAndBottomClip = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { chartConfig } = moreProps;
        const { overSold, overBought } = this.props;
        const { yScale, width } = chartConfig;

        ctx.beginPath();
        ctx.rect(0, yScale(overSold), width, yScale(overBought) - yScale(overSold));
        ctx.clip();
    };
}
