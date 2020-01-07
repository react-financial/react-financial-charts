import { format } from "d3-format";
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { default as defaultDisplayValuesFor } from "./displayValuesFor";

import { functor } from "../utils";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

interface MACDTooltipProps {
    readonly origin: number[] | any; // func
    readonly className?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly labelFill?: string;
    readonly yAccessor: any; // func
    readonly options: {
        slow: number;
        fast: number;
        signal: number;
    };
    readonly appearance: {
        stroke: {
            macd: string,
            signal: string,
        },
        fill: {
            divergence: string,
        },
    };
    readonly displayFormat: any; // func
    readonly displayInit?: string;
    readonly displayValuesFor: any; // func
    readonly onClick?: any; // func
}

export class MACDTooltip extends React.Component<MACDTooltipProps> {

    public static defaultProps = {
        className: "react-financial-charts-tooltip",
        displayFormat: format(".2f"),
        displayInit: "n/a",
        displayValuesFor: defaultDisplayValuesFor,
        origin: [0, 0],
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
        const { onClick, displayInit, fontFamily, fontSize, displayFormat, className } = this.props;
        const { yAccessor, options, appearance, labelFill } = this.props;
        const { displayValuesFor } = this.props;

        const { chartConfig: { width, height } } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps);
        const macdValue = currentItem && yAccessor(currentItem);

        const macd = (macdValue && macdValue.macd && displayFormat(macdValue.macd)) || displayInit;
        const signal = (macdValue && macdValue.signal && displayFormat(macdValue.signal)) || displayInit;
        const divergence = (macdValue && macdValue.divergence && displayFormat(macdValue.divergence)) || displayInit;

        const { origin: originProp } = this.props;
        const origin = functor(originProp);
        const [x, y] = origin(width, height);

        return (
            <g className={className} transform={`translate(${x}, ${y})`} onClick={onClick}>
                <ToolTipText x={0} y={0}
                    fontFamily={fontFamily} fontSize={fontSize}>
                    <ToolTipTSpanLabel fill={labelFill}>MACD (</ToolTipTSpanLabel>
                    <tspan fill={appearance.stroke.macd}>{options.slow}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}>, </ToolTipTSpanLabel>
                    <tspan fill={appearance.stroke.macd}>{options.fast}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}>): </ToolTipTSpanLabel>
                    <tspan fill={appearance.stroke.macd}>{macd}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}> Signal (</ToolTipTSpanLabel>
                    <tspan fill={appearance.stroke.signal}>{options.signal}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}>): </ToolTipTSpanLabel>
                    <tspan fill={appearance.stroke.signal}>{signal}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}> Divergence: </ToolTipTSpanLabel>
                    <tspan fill={appearance.fill.divergence}>{divergence}</tspan>
                </ToolTipText>
            </g>
        );
    }
}
