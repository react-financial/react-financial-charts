import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";
import { functor, isDefined, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { drawOnCanvas2, drawOnCanvasHelper, identityStack, StackedBarSeries } from "./StackedBarSeries";

export interface BarSeriesProps {
    readonly baseAt?:
        | number
        | ((yScale: ScaleContinuousNumeric<number, number>, d: [number, number], moreProps: any) => number);
    readonly className?: number | any; // func
    readonly clip?: boolean;
    readonly fillStyle?:
        | string
        | CanvasGradient
        | CanvasPattern
        | ((data: any) => string | CanvasGradient | CanvasPattern);
    readonly opacity?: number;
    readonly stroke?: boolean;
    readonly swapScales?: boolean;
    readonly width?: number | any; // func
    readonly yAccessor: any; // func
}

export class BarSeries extends React.Component<BarSeriesProps> {
    public static defaultProps = StackedBarSeries.defaultProps;

    public render() {
        const { clip } = this.props;

        return (
            <GenericChartComponent
                clip={clip}
                canvasToDraw={getAxisCanvas}
                canvasDraw={this.drawOnCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        if (this.props.swapScales) {
            const { xAccessor } = moreProps;

            drawOnCanvasHelper(ctx, this.props, moreProps, xAccessor, identityStack);
        } else {
            const bars = this.getBars(this.props, moreProps);

            drawOnCanvas2(this.props, ctx, bars);
        }
    };

    /*
        Initially, this program was using StackedBarSeries.getBars
        to benefit from code reuse and having a single place that
        contains the logic for drawing all types of bar charts
        simple, grouped, horizontal, but turnes out
        making it highly cuztimizable also made it slow for the
        most simple case, a regular bar chart.
        This function contains just the necessary logic
        to create bars
    */
    private readonly getBars = (props: BarSeriesProps, moreProps) => {
        const { baseAt, fillStyle, stroke, yAccessor } = props;
        const {
            xScale,
            xAccessor,
            plotData,
            chartConfig: { yScale },
        } = moreProps;

        const getFill = functor(fillStyle);
        const getBase = functor(baseAt);

        const widthFunctor = functor(props.width);

        const width = widthFunctor(props, {
            xScale,
            xAccessor,
            plotData,
        });

        const offset = Math.floor(0.5 * width);

        const bars = plotData
            .filter((d) => isDefined(yAccessor(d)))
            .map((d) => {
                const yValue = yAccessor(d);
                let y = yScale(yValue);

                const x = Math.round(xScale(xAccessor(d))) - offset;
                let h = getBase(xScale, yScale, d) - yScale(yValue);

                if (h < 0) {
                    y = y + h;
                    h = -h;
                }

                return {
                    // type: "line"
                    x,
                    y: Math.round(y),
                    height: Math.round(h),
                    width: offset * 2,
                    fillStyle: getFill(d, 0),
                    stroke: stroke ? getFill(d, 0) : "none",
                };
            });

        return bars;
    };
}
