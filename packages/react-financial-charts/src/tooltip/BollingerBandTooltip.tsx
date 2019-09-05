import { format } from "d3-format";
import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { default as defaultDisplayValuesFor } from "./displayValuesFor";

import { functor, isDefined } from "../utils";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

interface BollingerBandTooltipProps {
    className?: string;
    yAccessor: any; // func
    displayValuesFor?: any; // func
    displayFormat: any; // func
    origin: number[];
    onClick?: any; // func
    options: {
        sourcePath: string;
        windowSize: number;
        multiplier: number;
        movingAverageType: string;
    };
    textFill?: string;
    labelFill?: string;
    fontFamily?: string;
    fontSize?: number;
}

export class BollingerBandTooltip extends React.Component<BollingerBandTooltipProps> {

    public static defaultProps = {
        className: "react-stockcharts-tooltip react-stockcharts-bollingerband-tooltip",
        displayFormat: format(".2f"),
        displayValuesFor: defaultDisplayValuesFor,
        origin: [0, 10],
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
        const { displayValuesFor } = this.props;

        const { chartConfig: { width, height } } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps);

        let top;
        let middle;
        let bottom;
        top = middle = bottom = "n/a";

        if (isDefined(currentItem)
            && isDefined(yAccessor(currentItem))) {
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
                className={this.props.className} onClick={onClick}>
                <ToolTipText x={0} y={0}
                    fontFamily={this.props.fontFamily} fontSize={this.props.fontSize}>
                    <ToolTipTSpanLabel fill={labelFill}>{tooltipLabel}</ToolTipTSpanLabel>
                    <tspan fill={textFill}>{tooltipValue}</tspan>
                </ToolTipText>
            </g>
        );
    }
}
