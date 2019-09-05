import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";
import { drawOnCanvasHelper, identityStack, StackedBarSeries, svgHelper } from "./StackedBarSeries";

interface GroupedBarSeriesProps {
    baseAt: number | any; // func
    direction: "up" | "down";
    stroke: boolean;
    widthRatio: number;
    opacity: number;
    fill: string | any; // func
    className: string | any; // func
    yAccessor: any[]; // func
}

export class GroupedBarSeries extends React.Component<GroupedBarSeriesProps> {

    public static defaultProps = {
        ...StackedBarSeries.defaultProps,
        widthRatio: 0.8,
        spaceBetweenBar: 5,
    };

    public render() {
        return (
            <GenericChartComponent
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { xAccessor } = moreProps;

        drawOnCanvasHelper(ctx, this.props, moreProps, xAccessor, identityStack, this.postProcessor);
    }

    private readonly renderSVG = (moreProps) => {
        const { xAccessor } = moreProps;

        return (
            <g className="react-stockcharts-grouped-bar-series">
                {svgHelper(this.props, moreProps, xAccessor, identityStack, this.postProcessor)}
            </g>
        );
    }

    private readonly postProcessor = (array) => {
        return array.map((each) => {
            return {
                ...each,
                x: each.x + each.offset - each.groupOffset,
                width: each.groupWidth,
            };
        });
    }
}
