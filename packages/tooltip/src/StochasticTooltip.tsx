import { functor, GenericChartComponent } from "@react-financial-charts/core";
import { format } from "d3-format";
import * as React from "react";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

export interface StochasticTooltipProps {
    readonly origin: number[] | ((width: number, height: number) => [number, number]);
    readonly className?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly labelFill?: string;
    readonly onClick?: (event: React.MouseEvent) => void;
    readonly yAccessor: (currentItem: any) => { K: number; D: number };
    readonly options: {
        windowSize: number;
        kWindowSize: number;
        dWindowSize: number;
    };
    readonly appearance: {
        stroke: {
            dLine: string;
            kLine: string;
        };
    };
    readonly displayFormat: (value: number) => string;
    readonly displayInit?: string;
    readonly displayValuesFor?: (props: StochasticTooltipProps, moreProps: any) => any;
    readonly label: string;
}

export class StochasticTooltip extends React.Component<StochasticTooltipProps> {
    public static defaultProps = {
        className: "react-financial-charts-tooltip",
        displayFormat: format(".2f"),
        displayInit: "n/a",
        displayValuesFor: (_: any, props: any) => props.currentItem,
        label: "STO",
        origin: [0, 0],
    };

    public render() {
        return <GenericChartComponent clip={false} svgDraw={this.renderSVG} drawOn={["mousemove"]} />;
    }

    private readonly renderSVG = (moreProps: any) => {
        const {
            onClick,
            fontFamily,
            fontSize,
            fontWeight,
            yAccessor,
            displayFormat,
            origin: originProp,
            label,
            className,
            displayInit,
            displayValuesFor = StochasticTooltip.defaultProps.displayValuesFor,
            options,
            appearance,
            labelFill,
        } = this.props;
        const {
            chartConfig: { width, height },
            fullData,
        } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps) ?? fullData[fullData.length - 1];

        const stochastic = currentItem && yAccessor(currentItem);

        const K = (stochastic?.K && displayFormat(stochastic.K)) ?? displayInit;
        const D = (stochastic?.D && displayFormat(stochastic.D)) ?? displayInit;

        const origin = functor(originProp);

        const [x, y] = origin(width, height);

        const { stroke } = appearance;

        return (
            <g className={className} transform={`translate(${x}, ${y})`} onClick={onClick}>
                <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
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
    };
}
