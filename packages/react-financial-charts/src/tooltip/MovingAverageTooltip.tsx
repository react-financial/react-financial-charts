
import { format } from "d3-format";
import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { default as defaultDisplayValuesFor } from "./displayValuesFor";

import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

import { functor } from "../utils";

interface SingleMAToolTipProps {
    origin: number[];
    color: string;
    displayName: string;
    value: string;
    onClick?: ((details: any, event: React.MouseEvent<SVGRectElement, MouseEvent>) => void);
    fontFamily?: string;
    textFill?: string;
    labelFill?: string;
    fontSize?: number;
    forChart: number | string;
    options: any;
}

export class SingleMAToolTip extends React.Component<SingleMAToolTipProps> {

    public render() {
        const { textFill, labelFill } = this.props;
        const translate = "translate(" + this.props.origin[0] + ", " + this.props.origin[1] + ")";
        return (
            <g transform={translate}>
                <line x1={0} y1={2} x2={0} y2={28} stroke={this.props.color} strokeWidth="4px" />
                <ToolTipText x={5} y={11}
                    fontFamily={this.props.fontFamily} fontSize={this.props.fontSize}>
                    <ToolTipTSpanLabel fill={labelFill}>{this.props.displayName}</ToolTipTSpanLabel>
                    <tspan x="5" dy="15" fill={textFill}>{this.props.value}</tspan>
                </ToolTipText>
                <rect
                    x={0}
                    y={0}
                    width={55}
                    height={30}
                    onClick={this.onClick}
                    fill="none"
                    stroke="none" />
            </g>
        );
    }

    private readonly onClick = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        const { onClick, forChart, options } = this.props;

        if (onClick !== undefined) {
            onClick({ chartId: forChart, ...options }, event);
        }
    }
}

interface MovingAverageTooltipProps {
    className?: string;
    displayFormat: any; // func
    origin: number[];
    displayValuesFor?: any; // func
    onClick?: ((event: React.MouseEvent<SVGRectElement, MouseEvent>) => void);
    textFill?: string;
    labelFill?: string;
    fontFamily?: string;
    fontSize?: number;
    width?: number;
    options: Array<{
        yAccessor: any; // func
        type: string;
        stroke: string;
        windowSize: number;
        echo: any;
    }>;
}

// tslint:disable-next-line: max-classes-per-file
export class MovingAverageTooltip extends React.Component<MovingAverageTooltipProps> {

    public static defaultProps = {
        className: "react-stockcharts-tooltip react-stockcharts-moving-average-tooltip",
        displayFormat: format(".2f"),
        displayValuesFor: defaultDisplayValuesFor,
        origin: [0, 10],
        width: 65,
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
        const { displayValuesFor } = this.props;

        const { chartId } = moreProps;
        const { chartConfig } = moreProps;

        const { className, onClick, width = 65, fontFamily, fontSize, textFill, labelFill } = this.props;
        const { origin: originProp, displayFormat, options } = this.props;
        const { chartConfig: { height } } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps);
        const config = chartConfig;

        const origin = functor(originProp);
        const [x, y] = origin(width, height);
        const [ox, oy] = config.origin;

        return (
            <g transform={`translate(${ox + x}, ${oy + y})`} className={className}>
                {options
                    .map((each, idx) => {
                        const yValue = currentItem && each.yAccessor(currentItem);

                        const tooltipLabel = `${each.type} (${each.windowSize})`;
                        const yDisplayValue = yValue ? displayFormat(yValue) : "n/a";
                        return (
                            <SingleMAToolTip
                                key={idx}
                                origin={[width * idx, 0]}
                                color={each.stroke}
                                displayName={tooltipLabel}
                                value={yDisplayValue}
                                options={each}
                                forChart={chartId}
                                onClick={onClick}
                                fontFamily={fontFamily}
                                fontSize={fontSize}
                                textFill={textFill}
                                labelFill={labelFill}
                            />
                        );
                    })}
            </g>
        );
    }
}
