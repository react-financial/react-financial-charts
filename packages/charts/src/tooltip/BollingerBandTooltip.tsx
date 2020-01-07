import { format } from "d3-format";
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { functor, isDefined } from "../utils";

import { default as defaultDisplayValuesFor } from "./displayValuesFor";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

interface BollingerBandTooltipProps {
    readonly className?: string;
    readonly displayFormat: any; // Func
    readonly displayInit?: string;
    readonly displayValuesFor?: any; // Func
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly labelFill?: string;
    readonly onClick?: any; // Func
    readonly options: {
        movingAverageType: string;
        multiplier: number;
        sourcePath: string;
        windowSize: number;
    };
    readonly origin?: number[];
    readonly textFill?: string;
    readonly yAccessor?: any; // Func
}

export class BollingerBandTooltip extends React.Component<BollingerBandTooltipProps> {

    public static defaultProps = {
        className: "react-financial-charts-tooltip react-financial-charts-bollingerband-tooltip",
        displayFormat: format(".2f"),
        displayValuesFor: defaultDisplayValuesFor,
        displayInit: "n/a",
        origin: [8, 8],
        yAccessor: (data: any) => data.bb,
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
        const { onClick, displayFormat, yAccessor, options, textFill, labelFill } = this.props;
        const { className, displayValuesFor, displayInit, fontFamily, fontSize } = this.props;

        const { chartConfig: { width, height } } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps);

        let top = displayInit;
        let middle = displayInit;
        let bottom = displayInit;

        if (isDefined(currentItem) && isDefined(yAccessor(currentItem))) {
            const item = yAccessor(currentItem);
            top = displayFormat(item.top);
            middle = displayFormat(item.middle);
            bottom = displayFormat(item.bottom);
        }

        const { origin: originProp } = this.props;
        const origin = functor(originProp);
        const [x, y] = origin(width, height);

        const { sourcePath, windowSize, multiplier, movingAverageType } = options;
        const tooltipLabel = `BB(${sourcePath}, ${windowSize}, ${multiplier}, ${movingAverageType}): `;
        const tooltipValue = `${top}, ${middle}, ${bottom}`;

        return (
            <g transform={`translate(${x}, ${y})`}
                className={className}
                onClick={onClick}>
                <ToolTipText
                    x={0}
                    y={0}
                    fontFamily={fontFamily}
                    fontSize={fontSize}>
                    <ToolTipTSpanLabel fill={labelFill}>
                        {tooltipLabel}
                    </ToolTipTSpanLabel>
                    <tspan fill={textFill}>
                        {tooltipValue}
                    </tspan>
                </ToolTipText>
            </g>
        );
    }
}
