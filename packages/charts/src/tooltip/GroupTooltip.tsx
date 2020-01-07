import { format } from "d3-format";
import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { default as defaultDisplayValuesFor } from "./displayValuesFor";
import { layouts, SingleTooltip } from "./SingleTooltip";
import { ToolTipText } from "./ToolTipText";

interface GroupTooltipProps {
    readonly className?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly displayFormat: any; // func
    readonly displayInit?: string;
    readonly displayValuesFor: any; // func
    readonly labelFill?: string;
    readonly layout: layouts;
    readonly onClick?: ((event: React.MouseEvent<SVGGElement, MouseEvent>) => void);
    readonly options: Array<{
        labelFill?: string;
        yLabel: string | any; // func
        yAccessor: any;
        valueFill?: string;
        withShape?: boolean;
    }>;
    readonly origin: number[];
    readonly position: "topRight" | "bottomLeft" | "bottomRight";
    readonly valueFill?: string;
    readonly verticalSize?: number;  // "verticalSize" only be used, if layout is "vertical", "verticalRows".
    readonly width?: number; // "width" only be used, if layout is "horizontal" or "horizontalRows".
    readonly withShape: boolean; // "withShape" is ignored, if layout is "horizontalInline" or "vertical".
    readonly yAccessor: any; // func
}

export class GroupTooltip extends React.Component<GroupTooltipProps> {

    public static defaultProps = {
        className: "react-financial-charts-tooltip react-financial-charts-group-tooltip",
        layout: "horizontal",
        displayFormat: format(".2f"),
        displayInit: "n/a",
        displayValuesFor: defaultDisplayValuesFor,
        origin: [0, 0],
        width: 60,
        verticalSize: 13,
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

    private readonly getPosition = (moreProps) => {
        const { position } = this.props;
        const { height, width } = moreProps.chartConfig;

        const dx = 20;
        const dy = 40;
        let textAnchor: string | undefined;
        let xyPos: Array<number | null> | null = null;

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
    }

    private readonly renderSVG = (moreProps) => {

        const { displayValuesFor } = this.props;
        const { chartId } = moreProps;

        const { className, displayInit, onClick, width = 60, verticalSize = 13, fontFamily, fontSize, layout } = this.props;
        const { origin, displayFormat, options } = this.props;
        const currentItem = displayValuesFor(this.props, moreProps);
        const { xyPos, textAnchor } = this.getPosition(moreProps);

        const xPos = xyPos != null && xyPos[0] != null ? xyPos[0] : origin[0];
        const yPos = xyPos != null && xyPos[1] != null ? xyPos[1] : origin[1];

        const singleTooltip = options.map((each, idx) => {

            const yValue = currentItem && each.yAccessor(currentItem);
            const yDisplayValue = yValue ? displayFormat(yValue) : displayInit;

            const orig = () => {
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
                {layout === "horizontalInline"
                    ? <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize}>{singleTooltip}</ToolTipText>
                    : singleTooltip
                }
            </g>
        );
    }
}
