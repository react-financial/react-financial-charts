import * as React from "react";
import {
    strokeDashTypes,
} from "../utils";
import { LineSeries } from "./LineSeries";
import { StraightLine } from "./StraightLine";
import { SVGComponent } from "./SVGComponent";

interface RSISeriesProps {
    className?: string;
    yAccessor: any; // func
    stroke: {
        line: strokeDashTypes;
        top: string;
        middle: string;
        bottom: string;
        outsideThreshold: string;
        insideThreshold: string;
    };
    opacity: {
        top: number;
        middle: number;
        bottom: number;
    };
    strokeDasharray: {
        line: strokeDashTypes;
        top: strokeDashTypes;
        middle: strokeDashTypes;
        bottom: strokeDashTypes;
    };
    strokeWidth: {
        outsideThreshold: number;
        insideThreshold: number;
        top: number;
        middle: number;
        bottom: number;
    };
    overSold: number;
    middle: number;
    overBought: number;
}

export class RSISeries extends React.Component<RSISeriesProps> {

    public static defaultProps = {
        className: "react-stockcharts-rsi-series",
        stroke: {
            line: "#000000",
            top: "#B8C2CC",
            middle: "#8795A1",
            bottom: "#B8C2CC",
            outsideThreshold: "#b300b3",
            insideThreshold: "#ffccff",
        },
        opacity: {
            top: 1,
            middle: 1,
            bottom: 1,
        },
        strokeDasharray: {
            line: "Solid",
            top: "ShortDash",
            middle: "ShortDash",
            bottom: "ShortDash",
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

    private clipPathId1: string;
    private clipPathId2: string;

    constructor(props) {
        super(props);

        const id1 = String(Math.round(Math.random() * 10000 * 10000));
        this.clipPathId1 = `rsi-clip-${id1}`;

        const id2 = String(Math.round(Math.random() * 10000 * 10000));
        this.clipPathId2 = `rsi-clip-${id2}`;
    }

    public render() {
        const { className, stroke, opacity, strokeDasharray, strokeWidth } = this.props;
        const { yAccessor } = this.props;
        const { overSold, middle, overBought } = this.props;

        const style1 = { clipPath: `url(#${this.clipPathId1})` };
        const style2 = { clipPath: `url(#${this.clipPathId2})` };

        return (
            <g className={className}>
                <SVGComponent>
                    {this.renderClip}
                </SVGComponent>
                <StraightLine
                    stroke={stroke.top}
                    opacity={opacity.top}
                    yValue={overSold}
                    strokeDasharray={strokeDasharray.top}
                    strokeWidth={strokeWidth.top}
                />
                <StraightLine
                    stroke={stroke.middle}
                    opacity={opacity.middle}
                    yValue={middle}
                    strokeDasharray={strokeDasharray.middle}
                    strokeWidth={strokeWidth.middle}
                />
                <StraightLine
                    stroke={stroke.bottom}
                    opacity={opacity.bottom}
                    yValue={overBought}
                    strokeDasharray={strokeDasharray.bottom}
                    strokeWidth={strokeWidth.bottom}
                />
                <LineSeries
                    style={style1}
                    canvasClip={this.topAndBottomClip}
                    className={className}
                    yAccessor={yAccessor}
                    stroke={stroke.insideThreshold || stroke.line}
                    strokeWidth={strokeWidth.insideThreshold}
                    strokeDasharray={strokeDasharray.line}
                />
                <LineSeries
                    style={style2}
                    canvasClip={this.mainClip}
                    className={className}
                    yAccessor={yAccessor}
                    stroke={stroke.outsideThreshold || stroke.line}
                    strokeWidth={strokeWidth.outsideThreshold}
                    strokeDasharray={strokeDasharray.line}
                />
            </g>
        );
    }

    private readonly renderClip = (moreProps) => {
        const { chartConfig } = moreProps;
        const { overSold, overBought } = this.props;
        const { yScale, width, height } = chartConfig;

        return (
            <defs>
                <clipPath id={this.clipPathId1}>
                    <rect
                        x={0}
                        y={yScale(overSold)}
                        width={width}
                        height={yScale(overBought) - yScale(overSold)}
                    />
                </clipPath>
                <clipPath id={this.clipPathId2}>
                    <rect
                        x={0}
                        y={0}
                        width={width}
                        height={yScale(overSold)}
                    />
                    <rect
                        x={0}
                        y={yScale(overBought)}
                        width={width}
                        height={height - yScale(overBought)}
                    />
                </clipPath>
            </defs>
        );
    }

    private readonly mainClip = (ctx, moreProps) => {
        const { chartConfig } = moreProps;
        const { overSold, overBought } = this.props;
        const { yScale, width, height } = chartConfig;

        ctx.beginPath();
        ctx.rect(
            0,
            0,
            width,
            yScale(overSold),
        );
        ctx.rect(
            0,
            yScale(overBought),
            width,
            height - yScale(overBought),
        );
        ctx.clip();
    }

    private readonly topAndBottomClip = (ctx, moreProps) => {
        const { chartConfig } = moreProps;
        const { overSold, overBought } = this.props;
        const { yScale, width } = chartConfig;

        ctx.beginPath();
        ctx.rect(
            0,
            yScale(overSold),
            width,
            yScale(overBought) - yScale(overSold),
        );
        ctx.clip();
    }
}
