import { functor, GenericChartComponent, last } from "@react-financial-charts/core";
import { format } from "d3-format";
import * as React from "react";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

const displayTextsDefault = {
    o: "O: ",
    h: " H: ",
    l: " L: ",
    c: " C: ",
    na: "n/a",
};

export interface OHLCTooltipProps {
    readonly accessor?: (data: any) => any;
    readonly className?: string;
    readonly changeFormat?: (n: number | { valueOf(): number }) => string;
    readonly displayTexts?: {
        o: string;
        h: string;
        l: string;
        c: string;
        na: string;
    };
    readonly displayValuesFor?: (props: OHLCTooltipProps, moreProps: any) => any;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly labelFill?: string;
    readonly labelFontWeight?: number;
    readonly ohlcFormat?: (n: number | { valueOf(): number }) => string;
    readonly onClick?: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
    readonly origin?: [number, number] | ((width: number, height: number) => [number, number]);
    readonly percentFormat?: (n: number | { valueOf(): number }) => string;
    readonly textFill?: string | ((item: any) => string);
}

export class OHLCTooltip extends React.Component<OHLCTooltipProps> {
    public static defaultProps = {
        accessor: (d: unknown) => d,
        changeFormat: format("+.2f"),
        className: "react-financial-charts-tooltip-hover",
        displayTexts: displayTextsDefault,
        displayValuesFor: (_: any, props: any) => props.currentItem,
        fontFamily: "-apple-system, system-ui, 'Helvetica Neue', Ubuntu, sans-serif",
        ohlcFormat: format(".2f"),
        origin: [0, 0],
        percentFormat: format("+.2%"),
    };

    public render() {
        return <GenericChartComponent clip={false} svgDraw={this.renderSVG} drawOn={["mousemove"]} />;
    }

    private readonly renderSVG = (moreProps: any) => {
        const {
            accessor,
            changeFormat = OHLCTooltip.defaultProps.changeFormat,
            className,
            displayTexts = OHLCTooltip.defaultProps.displayTexts,
            displayValuesFor = OHLCTooltip.defaultProps.displayValuesFor,
            fontFamily,
            fontSize,
            fontWeight,
            labelFill,
            labelFontWeight,
            ohlcFormat = OHLCTooltip.defaultProps.ohlcFormat,
            onClick,
            percentFormat = OHLCTooltip.defaultProps.percentFormat,
            textFill,
        } = this.props;

        const {
            chartConfig: { width, height },
            fullData,
        } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps) ?? last(fullData);

        let open: string = displayTexts.na;
        let high: string = displayTexts.na;
        let low: string = displayTexts.na;
        let close: string = displayTexts.na;
        let change: string = displayTexts.na;

        if (currentItem !== undefined && accessor !== undefined) {
            const item = accessor(currentItem);
            if (item !== undefined) {
                open = ohlcFormat(item.open);
                high = ohlcFormat(item.high);
                low = ohlcFormat(item.low);
                close = ohlcFormat(item.close);
                change = `${changeFormat(item.close - item.open)} (${percentFormat(
                    (item.close - item.open) / item.open,
                )})`;
            }
        }

        const { origin: originProp } = this.props;
        const [x, y] = functor(originProp)(width, height);
        const valueFill = functor(textFill)(currentItem);

        return (
            <g className={className} transform={`translate(${x}, ${y})`} onClick={onClick}>
                <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight} key="label_O">
                        {displayTexts.o}
                    </ToolTipTSpanLabel>
                    <tspan key="value_O" fill={valueFill}>
                        {open}
                    </tspan>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight} key="label_H">
                        {displayTexts.h}
                    </ToolTipTSpanLabel>
                    <tspan key="value_H" fill={valueFill}>
                        {high}
                    </tspan>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight} key="label_L">
                        {displayTexts.l}
                    </ToolTipTSpanLabel>
                    <tspan key="value_L" fill={valueFill}>
                        {low}
                    </tspan>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight} key="label_C">
                        {displayTexts.c}
                    </ToolTipTSpanLabel>
                    <tspan key="value_C" fill={valueFill}>
                        {close}
                    </tspan>
                    <tspan key="value_Change" fill={valueFill}>
                        {` ${change}`}
                    </tspan>
                </ToolTipText>
            </g>
        );
    };
}
