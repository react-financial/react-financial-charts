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
     * Wether to connect the area between undefined data points.
     */
    readonly connectNulls?: boolean;
    /**
     * A factory for a curve generator for the area.
     */
    readonly curve?: CurveFactory;
    /**
     * The default accessor for defined returns not NaN, thus assumes that the input data is always a number.
     */
    readonly defined?: (data: number | undefined) => boolean;
    /**
     * Color, gradient, or pattern to use for fill.
     */
    readonly fillStyle?:
        | string
        | ((context: CanvasRenderingContext2D, moreProps: any) => string | CanvasGradient | CanvasPattern);
    /**
     * Selector for data to plot.
     */
    readonly yAccessor: (data: any) => number | undefined;
}

/**
 * `AreaOnlySeries` component.
 */
export class AreaOnlySeries extends React.Component<AreaOnlySeriesProps> {
    public static defaultProps = {
        connectNulls: false,
        defined: (d: number | undefined) => d !== undefined && !isNaN(d),
        base: (yScale: ScaleContinuousNumeric<number, number>) => first(yScale.range()),
    };

    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const {
            connectNulls,
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
            if (typeof fillStyle === "string") {
                ctx.fillStyle = fillStyle;
            } else {
                ctx.fillStyle = fillStyle(ctx, moreProps);
            }
        }

        const newBase = functor(base);

        const areaSeries = area()
            .x((d) => Math.round(xScale(xAccessor(d))))
            .y0((d) => newBase(yScale, d, moreProps))
            .y1((d) => Math.round(yScale(yAccessor(d))));

        if (curve !== undefined) {
            areaSeries.curve(curve);
        }

        if (!connectNulls) {
            areaSeries.defined((d) => defined(yAccessor(d)));
        }

        ctx.beginPath();
        areaSeries.context(ctx)(plotData);
        ctx.fill();

        if (canvasClip !== undefined) {
            ctx.restore();
        }
    };
}
