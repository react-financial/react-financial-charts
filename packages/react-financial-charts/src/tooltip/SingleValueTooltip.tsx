
import { format } from "d3-format";
import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { default as defaultDisplayValuesFor } from "./displayValuesFor";

import { functor, identity, isDefined, noop } from "../utils";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

interface SingleValueTooltipProps {
    xDisplayFormat?: any; // func
    yDisplayFormat: any; // func
    xLabel?: string;
    yLabel: string;
    labelFill?: string;
    valueFill?: string;
    origin?: number[] | any; // func
    className?: string;
    fontFamily?: string;
    fontSize?: number;
    onClick?: ((event: React.MouseEvent<SVGGElement, MouseEvent>) => void);
    displayValuesFor?: any; // func
    xAccessor?: any; // func
    yAccessor?: any; // func
}

export class SingleValueTooltip extends React.Component<SingleValueTooltipProps> {

    public static defaultProps = {
        origin: [0, 0],
        labelFill: "#4682B4",
        valueFill: "#000000",
        yDisplayFormat: format(".2f"),
        displayValuesFor: defaultDisplayValuesFor,
        xAccessor: noop,
        yAccessor: identity,
        className: "react-stockcharts-tooltip",
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

        const { onClick, fontFamily, fontSize, labelFill, valueFill, className } = this.props;
        const { xDisplayFormat, yDisplayFormat, xLabel, yLabel, xAccessor, yAccessor } = this.props;
        const { displayValuesFor } = this.props;

        const { chartConfig: { width, height } } = moreProps;
        const currentItem = displayValuesFor(this.props, moreProps);

        const xDisplayValue = isDefined(currentItem) && isDefined(xAccessor(currentItem)) ? xDisplayFormat(xAccessor(currentItem)) : "n/a";
        const yDisplayValue = isDefined(currentItem) && isDefined(yAccessor(currentItem)) ? yDisplayFormat(yAccessor(currentItem)) : "n/a";

        const { origin: originProp } = this.props;
        const origin = functor(originProp);
        const [x, y] = origin(width, height);

        return (
            <g className={className} transform={`translate(${x}, ${y})`} onClick={onClick}>
                <ToolTipText
                    x={0}
                    y={0}
                    fontFamily={fontFamily}
                    fontSize={fontSize}>
                    {xLabel ? <ToolTipTSpanLabel x={0} dy="5" fill={labelFill}>{`${xLabel}: `}</ToolTipTSpanLabel> : null}
                    {xLabel ? <tspan fill={valueFill}>{`${xDisplayValue} `}</tspan> : null}
                    <ToolTipTSpanLabel fill={labelFill}>
                        {`${yLabel}: `}
                    </ToolTipTSpanLabel>
                    <tspan fill={valueFill} >
                        {yDisplayValue}
                    </tspan>
                </ToolTipText>
            </g>
        );
    }
}
