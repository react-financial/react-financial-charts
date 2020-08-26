import { functor, isDefined, GenericChartComponent } from "@react-financial-charts/core";
import { format } from "d3-format";
import * as React from "react";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

export interface RSITooltipProps {
    readonly className?: string;
    readonly displayFormat: (value: number) => string;
    readonly displayInit?: string;
    readonly displayValuesFor: (props: RSITooltipProps, moreProps: any) => any;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly labelFill?: string;
    readonly labelFontWeight?: number;
    readonly onClick?: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
    readonly origin: number[] | ((width: number, height: number) => number[]);
    readonly options: {
        windowSize: number;
    };
    readonly textFill?: string;
    readonly yAccessor: (data: any) => number | undefined;
}

export class RSITooltip extends React.Component<RSITooltipProps> {
    public static defaultProps = {
        displayFormat: format(".2f"),
        displayInit: "n/a",
        displayValuesFor: (_: RSITooltipProps, props: any) => props.currentItem,
        origin: [0, 0],
        className: "react-financial-charts-tooltip",
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
            yAccessor,
            displayFormat,
            className,
            options,
            labelFill,
            labelFontWeight,
            textFill,
            displayValuesFor,
        } = this.props;

        const {
            chartConfig: { width, height },
        } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps);
        const rsi = isDefined(currentItem) && yAccessor(currentItem);
        const value = (rsi && displayFormat(rsi)) || displayInit;

        const { origin: originProp } = this.props;
        const origin = functor(originProp);
        const [x, y] = origin(width, height);

        const tooltipLabel = `RSI (${options.windowSize}): `;
        return (
            <g className={className} transform={`translate(${x}, ${y})`} onClick={onClick}>
                <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight}>
                        {tooltipLabel}
                    </ToolTipTSpanLabel>
                    <tspan fill={textFill}>{value}</tspan>
                </ToolTipText>
            </g>
        );
    };
}
