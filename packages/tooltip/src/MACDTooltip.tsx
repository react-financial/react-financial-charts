import { functor, GenericChartComponent, last } from "@react-financial-charts/core";
import { format } from "d3-format";
import * as React from "react";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

export interface MACDTooltipProps {
    readonly origin: number[] | ((width: number, height: number) => [number, number]);
    readonly className?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly labelFill?: string;
    readonly labelFontWeight?: number;
    readonly onClick?: (event: React.MouseEvent) => void;
    readonly options: {
        slow: number;
        fast: number;
        signal: number;
    };
    readonly appearance: {
        strokeStyle: {
            macd: string;
            signal: string;
        };
        fillStyle: {
            divergence: string;
        };
    };
    readonly displayFormat: (value: number) => string;
    readonly displayInit?: string;
    readonly displayValuesFor: (props: MACDTooltipProps, moreProps: any) => any | undefined;
    readonly yAccessor: (data: any) => { macd: number; signal: number; divergence: number };
}

export class MACDTooltip extends React.Component<MACDTooltipProps> {
    public static defaultProps = {
        className: "react-financial-charts-tooltip",
        displayFormat: format(".2f"),
        displayInit: "n/a",
        displayValuesFor: (_: any, props: any) => props.currentItem,
        origin: [0, 0],
    };

    public render() {
        return <GenericChartComponent clip={false} svgDraw={this.renderSVG} drawOn={["mousemove"]} />;
    }

    private readonly renderSVG = (moreProps: any) => {
        const {
            onClick,
            displayInit,
            fontFamily,
            fontSize,
            fontWeight,
            displayValuesFor,
            displayFormat,
            className,
            yAccessor,
            options,
            origin: originProp,
            appearance,
            labelFill,
            labelFontWeight,
        } = this.props;

        const {
            chartConfig: { width, height },
            fullData,
        } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps) ?? last(fullData);

        const macdValue = currentItem && yAccessor(currentItem);

        const macd = (macdValue?.macd && displayFormat(macdValue.macd)) || displayInit;
        const signal = (macdValue?.signal && displayFormat(macdValue.signal)) || displayInit;
        const divergence = (macdValue?.divergence && displayFormat(macdValue.divergence)) || displayInit;

        const origin = functor(originProp);
        const [x, y] = origin(width, height);

        return (
            <g className={className} transform={`translate(${x}, ${y})`} onClick={onClick}>
                <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight}>
                        MACD (
                    </ToolTipTSpanLabel>
                    <tspan fill={appearance.strokeStyle.macd}>{options.slow}</tspan>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight}>
                        ,{" "}
                    </ToolTipTSpanLabel>
                    <tspan fill={appearance.strokeStyle.macd}>{options.fast}</tspan>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight}>
                        ):{" "}
                    </ToolTipTSpanLabel>
                    <tspan fill={appearance.strokeStyle.macd}>{macd}</tspan>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight}>
                        {" "}
                        Signal (
                    </ToolTipTSpanLabel>
                    <tspan fill={appearance.strokeStyle.signal}>{options.signal}</tspan>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight}>
                        ):{" "}
                    </ToolTipTSpanLabel>
                    <tspan fill={appearance.strokeStyle.signal}>{signal}</tspan>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight}>
                        {" "}
                        Divergence:{" "}
                    </ToolTipTSpanLabel>
                    <tspan fill={appearance.fillStyle.divergence}>{divergence}</tspan>
                </ToolTipText>
            </g>
        );
    };
}
