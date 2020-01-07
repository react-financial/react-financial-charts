
import { format } from "d3-format";
import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { default as defaultDisplayValuesFor } from "./displayValuesFor";

import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

import { functor } from "../utils";

interface SingleMAToolTipProps {
    readonly color: string;
    readonly displayName: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly forChart: number | string;
    readonly labelFill?: string;
    readonly onClick?: ((details: any, event: React.MouseEvent<SVGRectElement, MouseEvent>) => void);
    readonly options: any;
    readonly origin: number[];
    readonly textFill?: string;
    readonly value: string;
}

export class SingleMAToolTip extends React.Component<SingleMAToolTipProps> {

    public render() {
        const { color, displayName, fontSize, fontFamily, textFill, labelFill, value } = this.props;
        const translate = "translate(" + this.props.origin[0] + ", " + this.props.origin[1] + ")";
        return (
            <g transform={translate}>
                <line x1={0} y1={2} x2={0} y2={28} stroke={color} strokeWidth={4} />
                <ToolTipText
                    x={5}
                    y={11}
                    fontFamily={fontFamily}
                    fontSize={fontSize}>
                    <ToolTipTSpanLabel fill={labelFill}>
                        {displayName}
                    </ToolTipTSpanLabel>
                    <tspan x={5} dy={15} fill={textFill}>
                        {value}
                    </tspan>
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
    readonly className?: string;
    readonly displayFormat: any; // func
    readonly origin: number[];
    readonly displayInit?: string;
    readonly displayValuesFor?: any; // func
    readonly onClick?: ((event: React.MouseEvent<SVGRectElement, MouseEvent>) => void);
    readonly textFill?: string;
    readonly labelFill?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly width?: number;
    readonly options: Array<{
        yAccessor: any; // func
        type: string;
        stroke: string;
        windowSize: number;
        echo?: any;
    }>;
}

// tslint:disable-next-line: max-classes-per-file
export class MovingAverageTooltip extends React.Component<MovingAverageTooltipProps> {

    public static defaultProps = {
        className: "react-financial-charts-tooltip react-financial-charts-moving-average-tooltip",
        displayFormat: format(".2f"),
        displayInit: "n/a",
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
        const { chartId, chartConfig, chartConfig: { height } } = moreProps;

        const { className, displayInit, onClick, width = 65, fontFamily, fontSize, textFill, labelFill } = this.props;
        const { origin: originProp, displayFormat, displayValuesFor, options } = this.props;

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
                        const yDisplayValue = yValue ? displayFormat(yValue) : displayInit;
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
