import { functor, GenericChartComponent, last, MoreProps } from "@react-financial-charts/core";
import { format } from "d3-format";
import * as React from "react";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

export interface SingleMAToolTipProps {
    readonly color: string;
    readonly displayName: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly forChart: number | string;
    readonly labelFill?: string;
    readonly labelFontWeight?: number;
    readonly onClick?: (event: React.MouseEvent<SVGRectElement, MouseEvent>, details: any) => void;
    readonly options: any;
    readonly origin: [number, number];
    readonly textFill?: string;
    readonly value: string;
}

export class SingleMAToolTip extends React.Component<SingleMAToolTipProps> {
    public render() {
        const { color, displayName, fontSize, fontFamily, fontWeight, textFill, labelFill, labelFontWeight, value } =
            this.props;

        const translate = "translate(" + this.props.origin[0] + ", " + this.props.origin[1] + ")";

        return (
            <g transform={translate}>
                <line x1={0} y1={2} x2={0} y2={28} stroke={color} strokeWidth={4} />
                <ToolTipText x={5} y={11} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight}>
                        {displayName}
                    </ToolTipTSpanLabel>
                    <tspan x={5} dy={15} fill={textFill}>
                        {value}
                    </tspan>
                </ToolTipText>
                <rect x={0} y={0} width={55} height={30} onClick={this.onClick} fill="none" stroke="none" />
            </g>
        );
    }

    private readonly onClick = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        const { onClick, forChart, options } = this.props;
        if (onClick !== undefined) {
            onClick(event, { chartId: forChart, ...options });
        }
    };
}

interface MovingAverageTooltipProps {
    readonly className?: string;
    readonly displayFormat: (value: number) => string;
    readonly origin: number[];
    readonly displayInit?: string;
    readonly displayValuesFor?: (props: MovingAverageTooltipProps, moreProps: any) => any;
    readonly onClick?: (event: React.MouseEvent<SVGRectElement, MouseEvent>) => void;
    readonly textFill?: string;
    readonly labelFill?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly width?: number;
    readonly options: {
        yAccessor: (data: any) => number;
        type: string;
        stroke: string;
        windowSize: number;
    }[];
}

// tslint:disable-next-line: max-classes-per-file
export class MovingAverageTooltip extends React.Component<MovingAverageTooltipProps> {
    public static defaultProps = {
        className: "react-financial-charts-tooltip react-financial-charts-moving-average-tooltip",
        displayFormat: format(".2f"),
        displayInit: "n/a",
        displayValuesFor: (_: any, props: any) => props.currentItem,
        origin: [0, 10],
        width: 65,
    };

    public render() {
        return <GenericChartComponent clip={false} svgDraw={this.renderSVG} drawOn={["mousemove"]} />;
    }

    private readonly renderSVG = (moreProps: MoreProps) => {
        const { chartId, chartConfig, chartConfig: { height = 0 } = {}, fullData } = moreProps;

        const {
            className,
            displayInit = MovingAverageTooltip.defaultProps.displayInit,
            onClick,
            width = 65,
            fontFamily,
            fontSize,
            fontWeight,
            textFill,
            labelFill,
            origin: originProp,
            displayFormat,
            displayValuesFor = MovingAverageTooltip.defaultProps.displayValuesFor,
            options,
        } = this.props;

        const currentItem = displayValuesFor(this.props, moreProps) ?? last(fullData);

        const config = chartConfig!;

        const origin = functor(originProp);
        const [x, y] = origin(width, height);
        const [ox, oy] = config.origin;

        return (
            <g transform={`translate(${ox + x}, ${oy + y})`} className={className}>
                {options.map((each, idx) => {
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
                            fontWeight={fontWeight}
                            textFill={textFill}
                            labelFill={labelFill}
                        />
                    );
                })}
            </g>
        );
    };
}
