import { GenericChartComponent, last } from "@react-financial-charts/core";
import { format } from "d3-format";
import * as React from "react";
import { layouts, SingleTooltip } from "./SingleTooltip";
import { ToolTipText } from "./ToolTipText";

export interface GroupTooltipProps {
    readonly className?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly displayFormat: (value: number) => string;
    readonly displayInit?: string;
    readonly displayValuesFor: (props: GroupTooltipProps, moreProps: any) => any;
    readonly layout: layouts;
    readonly onClick?: (event: React.MouseEvent, details: any) => void;
    readonly options: {
        labelFill?: string;
        yLabel: string;
        yAccessor: (data: any) => number;
        valueFill?: string;
        withShape?: boolean;
    }[];
    readonly origin: [number, number];
    readonly position?: "topRight" | "bottomLeft" | "bottomRight";
    readonly verticalSize?: number; // "verticalSize" only be used, if layout is "vertical", "verticalRows".
    readonly width?: number; // "width" only be used, if layout is "horizontal" or "horizontalRows".
}

export class GroupTooltip extends React.Component<GroupTooltipProps> {
    public static defaultProps = {
        className: "react-financial-charts-tooltip react-financial-charts-group-tooltip",
        layout: "horizontal",
        displayFormat: format(".2f"),
        displayInit: "",
        displayValuesFor: (_: any, props: any) => props.currentItem,
        origin: [0, 0],
        width: 60,
        verticalSize: 13,
    };

    public render() {
        return <GenericChartComponent clip={false} svgDraw={this.renderSVG} drawOn={["mousemove"]} />;
    }

    private readonly getPosition = (moreProps: any) => {
        const { position } = this.props;
        const { height, width } = moreProps.chartConfig;

        const dx = 20;
        const dy = 40;
        let textAnchor: string | undefined;
        let xyPos: (number | null)[] | null = null;

        if (position !== undefined) {
            switch (position) {
                case "topRight":
                    xyPos = [width - dx, null];
                    textAnchor = "end";
                    break;
                case "bottomLeft":
                    xyPos = [null, height - dy];
                    break;
                case "bottomRight":
                    xyPos = [width - dx, height - dy];
                    textAnchor = "end";
                    break;
                default:
                    xyPos = [null, null];
            }
        } else {
            xyPos = [null, null];
        }

        return { xyPos, textAnchor };
    };

    private readonly renderSVG = (moreProps: any) => {
        const { chartId, fullData } = moreProps;

        const {
            className,
            displayInit = GroupTooltip.defaultProps.displayInit,
            displayValuesFor,
            onClick,
            width = 60,
            verticalSize = 13,
            fontFamily,
            fontSize,
            fontWeight,
            layout,
            origin,
            displayFormat,
            options,
        } = this.props;

        const currentItem = displayValuesFor(this.props, moreProps) ?? last(fullData);

        const { xyPos, textAnchor } = this.getPosition(moreProps);

        const xPos = xyPos != null && xyPos[0] != null ? xyPos[0] : origin[0];
        const yPos = xyPos != null && xyPos[1] != null ? xyPos[1] : origin[1];

        const singleTooltip = options.map((each, idx) => {
            const yValue = currentItem && each.yAccessor(currentItem);
            const yDisplayValue = yValue ? displayFormat(yValue) : displayInit;

            const orig: () => [number, number] = () => {
                if (layout === "horizontal" || layout === "horizontalRows") {
                    return [width * idx, 0];
                }
                if (layout === "vertical") {
                    return [0, verticalSize * idx];
                }
                if (layout === "verticalRows") {
                    return [0, verticalSize * 2.3 * idx];
                }
                return [0, 0];
            };

            return (
                <SingleTooltip
                    key={idx}
                    layout={layout}
                    origin={orig()}
                    yLabel={each.yLabel}
                    yValue={yDisplayValue}
                    options={each}
                    forChart={chartId}
                    onClick={onClick}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    labelFill={each.labelFill}
                    valueFill={each.valueFill}
                    withShape={each.withShape}
                />
            );
        });

        return (
            <g transform={`translate(${xPos}, ${yPos})`} className={className} textAnchor={textAnchor}>
                {layout === "horizontalInline" ? (
                    <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                        {singleTooltip}
                    </ToolTipText>
                ) : (
                    singleTooltip
                )}
            </g>
        );
    };
}
