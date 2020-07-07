import * as React from "react";

import { getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { drawOnCanvasHelper, identityStack, StackedBarSeries } from "./StackedBarSeries";

interface GroupedBarSeriesProps {
    readonly baseAt: number | any; // func
    readonly className: string | any; // func
    readonly direction: "up" | "down";
    readonly fill: string | any; // func
    readonly opacity: number;
    readonly spaceBetweenBar?: number;
    readonly stroke: boolean;
    readonly widthRatio?: number;
    readonly yAccessor: any[]; // func
}

export class GroupedBarSeries extends React.Component<GroupedBarSeriesProps> {
    public static defaultProps = {
        ...StackedBarSeries.defaultProps,
        widthRatio: 0.8,
        spaceBetweenBar: 5,
    };

    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { xAccessor } = moreProps;

        drawOnCanvasHelper(ctx, this.props, moreProps, xAccessor, identityStack, this.postProcessor);
    };

    private readonly postProcessor = (array: any[]) => {
        return array.map(each => {
            return {
                ...each,
                x: each.x + each.offset - each.groupOffset,
                width: each.groupWidth,
            };
        });
    };
}
