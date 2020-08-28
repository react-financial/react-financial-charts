import { getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import * as React from "react";
import { drawOnCanvasHelper, identityStack, StackedBarSeries } from "./StackedBarSeries";

export interface GroupedBarSeriesProps {
    readonly baseAt:
        | number
        | ((
              xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
              yScale: ScaleContinuousNumeric<number, number>,
              datum: any,
          ) => number);
    readonly direction: "up" | "down";
    readonly fillStyle?: string | ((data: any) => string);
    readonly spaceBetweenBar?: number;
    readonly stroke: boolean;
    readonly widthRatio?: number;
    readonly yAccessor: ((data: any) => number | undefined) | ((d: any) => number)[];
}

export class GroupedBarSeries extends React.Component<GroupedBarSeriesProps> {
    public static defaultProps = {
        ...StackedBarSeries.defaultProps,
        spaceBetweenBar: 5,
        widthRatio: 0.8,
    };

    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { xAccessor } = moreProps;

        drawOnCanvasHelper(ctx, this.props, moreProps, xAccessor, identityStack, this.postProcessor);
    };

    private readonly postProcessor = (array: any[]) => {
        return array.map((each) => {
            return {
                ...each,
                x: each.x + each.offset - each.groupOffset,
                width: each.groupWidth,
            };
        });
    };
}
