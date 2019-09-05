import { format } from "d3-format";
import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { default as defaultDisplayValuesFor } from "./displayValuesFor";

import { functor } from "../utils";

import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

interface StochasticTooltipProps {
    origin: number[] | any; // func
    className?: string;
    fontFamily?: string;
    fontSize?: number;
    labelFill?: string;
    onClick?: any; // func
    yAccessor: any; // func
    options: {
        windowSize: number;
        kWindowSize: number;
        dWindowSize: number;
    };
    appearance: {
        stroke: {
            dLine: string;
            kLine: string;
        },
    };
    displayFormat: any; // func
    displayValuesFor?: any; // func
    label: string;
}

export class StochasticTooltip extends React.Component<StochasticTooltipProps> {

    public static defaultProps = {
        displayFormat: format(".2f"),
        displayValuesFor: defaultDisplayValuesFor,
        origin: [0, 0],
        className: "react-stockcharts-tooltip",
        label: "STO",
    };

    public render() {
        return (
            <GenericChartComponent
                clip={false}
                svgDraw={this.renderSVG}
                drawOn={["mousemove"]}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { onClick, fontFamily, fontSize, yAccessor, displayFormat, label } = this.props;
        const { className, options, appearance, labelFill } = this.props;
        const { displayValuesFor } = this.props;
        const { chartConfig: { width, height } } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps);
        const { stroke } = appearance;
        const stochastic = currentItem && yAccessor(currentItem);

        const K = (stochastic && stochastic.K && displayFormat(stochastic.K)) || "n/a";
        const D = (stochastic && stochastic.D && displayFormat(stochastic.D)) || "n/a";

        const { origin: originProp } = this.props;
        const origin = functor(originProp);
        const [x, y] = origin(width, height);

        return (
            <g className={className} transform={`translate(${x}, ${y})`} onClick={onClick}>
                <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize}>
                    <ToolTipTSpanLabel fill={labelFill}>{`${label} %K(`}</ToolTipTSpanLabel>
                    <tspan fill={stroke.kLine}>{`${options.windowSize}, ${options.kWindowSize}`}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}>): </ToolTipTSpanLabel>
                    <tspan fill={stroke.kLine}>{K}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}> %D (</ToolTipTSpanLabel>
                    <tspan fill={stroke.dLine}>{options.dWindowSize}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}>): </ToolTipTSpanLabel>
                    <tspan fill={stroke.dLine}>{D}</tspan>
                </ToolTipText>
            </g>
        );
    }
}
