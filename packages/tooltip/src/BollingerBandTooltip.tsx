import { functor, GenericChartComponent, last } from "@react-financial-charts/core";
import { format } from "d3-format";
import * as React from "react";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

export interface BollingerBandTooltipProps {
    readonly className?: string;
    readonly displayFormat: (value: number) => string;
    readonly displayInit?: string;
    readonly displayValuesFor?: (props: BollingerBandTooltipProps, moreProps: any) => any;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly labelFill?: string;
    readonly labelFontWeight?: number;
    readonly onClick?: (event: React.MouseEvent) => void;
    readonly options: {
        movingAverageType: string;
        multiplier: number;
        sourcePath: string;
        windowSize: number;
    };
    readonly origin?: [number, number] | ((width: number, height: number) => [number, number]);
    readonly textFill?: string;
    readonly yAccessor?: (data: any) => { bottom: number; middle: number; top: number };
}

export class BollingerBandTooltip extends React.Component<BollingerBandTooltipProps> {
    public static defaultProps = {
        className: "react-financial-charts-tooltip react-financial-charts-bollingerband-tooltip",
        displayFormat: format(".2f"),
        displayValuesFor: (_: any, props: any) => props.currentItem,
        displayInit: "n/a",
        origin: [8, 8],
        yAccessor: (data: any) => data.bb,
    };

    public render() {
        return <GenericChartComponent clip={false} svgDraw={this.renderSVG} drawOn={["mousemove"]} />;
    }

    private readonly renderSVG = (moreProps: any) => {
        const {
            onClick,
            displayFormat,
            yAccessor = BollingerBandTooltip.defaultProps.yAccessor,
            options,
            origin: originProp,
            textFill,
            labelFill,
            labelFontWeight,
            className,
            displayValuesFor = BollingerBandTooltip.defaultProps.displayValuesFor,
            displayInit,
            fontFamily,
            fontSize,
            fontWeight,
        } = this.props;

        const {
            chartConfig: { width, height },
            fullData,
        } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps) ?? last(fullData);

        let top = displayInit;
        let middle = displayInit;
        let bottom = displayInit;

        if (currentItem !== undefined) {
            const item = yAccessor(currentItem);
            if (item !== undefined) {
                top = displayFormat(item.top);
                middle = displayFormat(item.middle);
                bottom = displayFormat(item.bottom);
            }
        }

        const origin = functor(originProp);
        const [x, y] = origin(width, height);

        const { sourcePath, windowSize, multiplier, movingAverageType } = options;
        const tooltipLabel = `BB(${sourcePath}, ${windowSize}, ${multiplier}, ${movingAverageType}): `;
        const tooltipValue = `${top}, ${middle}, ${bottom}`;

        return (
            <g transform={`translate(${x}, ${y})`} className={className} onClick={onClick}>
                <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight}>
                        {tooltipLabel}
                    </ToolTipTSpanLabel>
                    <tspan fill={textFill}>{tooltipValue}</tspan>
                </ToolTipText>
            </g>
        );
    };
}
