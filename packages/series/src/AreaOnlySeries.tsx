import { first, functor, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { ScaleContinuousNumeric } from "d3-scale";
import { area, CurveFactory } from "d3-shape";
import * as React from "react";

export interface AreaOnlySeriesProps {
    /**
     * The base y value to draw the area to.
     */
    readonly base?:
        | number
        | ((yScale: ScaleContinuousNumeric<number, number>, d: [number, number], moreProps: any) => number | undefined);
    readonly canvasClip?: (context: CanvasRenderingContext2D, moreProps: any) => void;
    /**
     * The default accessor for defined returns not NaN, thus assumes that the input data is always a number.
     */
    readonly defined?: (data: number | undefined) => boolean;
    /**
     * Color, gradient, or pattern to use for fill.
     */
    readonly fillStyle?: string;
    /**
     * A factory for a curve generator for the area.
     */
    readonly curve?: CurveFactory;
    /**
     * Selector for data to plot.
     */
    readonly yAccessor: (data: any) => number | undefined;
}

export class AreaOnlySeries extends React.Component<AreaOnlySeriesProps> {
    public static defaultProps = {
        defined: (d: number | undefined) => d !== undefined && !isNaN(d),
        base: (yScale: ScaleContinuousNumeric<number, number>) => first(yScale.range()),
    };

    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const {
            fillStyle,
            curve,
            canvasClip,
            yAccessor,
            defined = AreaOnlySeries.defaultProps.defined,
            base,
        } = this.props;

        const {
            xScale,
            chartConfig: { yScale },
            plotData,
            xAccessor,
        } = moreProps;

        if (canvasClip !== undefined) {
            ctx.save();
            canvasClip(ctx, moreProps);
        }

        if (fillStyle !== undefined) {
            ctx.fillStyle = fillStyle;
        }

        ctx.beginPath();
        const newBase = functor(base);
        const areaSeries = area()
            .defined((d) => defined(yAccessor(d)))
            .x((d) => Math.round(xScale(xAccessor(d))))
            .y0((d) => newBase(yScale, d, moreProps))
            .y1((d) => Math.round(yScale(yAccessor(d))))
            .context(ctx);

        if (curve !== undefined) {
            areaSeries.curve(curve);
        }

        areaSeries(plotData);

        ctx.fill();

        if (canvasClip !== undefined) {
            ctx.restore();
        }
    };
}
