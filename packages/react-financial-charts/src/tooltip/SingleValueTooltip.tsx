
import { format } from "d3-format";
import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { default as defaultDisplayValuesFor } from "./displayValuesFor";

import { functor, identity, isDefined, noop } from "../utils";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

interface SingleValueTooltipProps {
    readonly xDisplayFormat?: any; // func
    readonly yDisplayFormat: any; // func
    readonly xInitDisplay?: string;
    readonly yInitDisplay?: string;
    readonly xLabel?: string;
    readonly yLabel: string;
    readonly labelFill?: string;
    readonly valueFill?: string;
    readonly origin?: number[] | any; // func
    readonly className?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly onClick?: ((event: React.MouseEvent<SVGGElement, MouseEvent>) => void);
    readonly displayValuesFor?: any; // func
    readonly xAccessor?: (d: any) => any;
    readonly yAccessor?: (d: any) => any;
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
        xInitDisplay: "n/a",
        yInitDisplay: "n/a",
        className: "react-financial-charts-tooltip",
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
        const { xDisplayFormat, yDisplayFormat, xLabel, yLabel, xAccessor, yAccessor, xInitDisplay, yInitDisplay } = this.props;
        const { displayValuesFor } = this.props;

        const { chartConfig: { width, height } } = moreProps;
        const currentItem = displayValuesFor(this.props, moreProps);

        const xDisplayValue = isDefined(currentItem) && isDefined(xAccessor!(currentItem)) ?
            xDisplayFormat(xAccessor!(currentItem)) : xInitDisplay;
        const yDisplayValue = isDefined(currentItem) && isDefined(yAccessor!(currentItem)) ?
            yDisplayFormat(yAccessor!(currentItem)) : yInitDisplay;

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
