import { first, functor, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { area as d3Area, CurveFactory } from "d3-shape";
import * as React from "react";
import { ScaleContinuousNumeric } from "d3-scale";

interface AreaOnlySeriesProps {
    readonly base?:
        | number
        | ((yScale: ScaleContinuousNumeric<number, number>, d: [number, number], moreProps: any) => number);
    readonly canvasClip?: (context: CanvasRenderingContext2D, moreProps: any) => void;
    readonly className?: string;
    readonly defined?: any; // func
    readonly fillStyle?: string | CanvasGradient | CanvasPattern;
    readonly interpolation?: CurveFactory;
    readonly strokeStyle?: string | CanvasGradient | CanvasPattern;
    readonly style?: React.CSSProperties;
    readonly yAccessor: (data: any) => number;
}

export class AreaOnlySeries extends React.Component<AreaOnlySeriesProps> {
    public static defaultProps = {
        className: "line",
        defined: (d) => !isNaN(d),
        base: (yScale) => first(yScale.range()),
    };

    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { fillStyle, strokeStyle, interpolation, canvasClip, yAccessor, defined, base } = this.props;

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

        if (strokeStyle !== undefined) {
            ctx.strokeStyle = strokeStyle;
        }

        ctx.beginPath();
        const newBase = functor(base);
        const areaSeries = d3Area()
            .defined((d) => defined(yAccessor(d)))
            .x((d) => Math.round(xScale(xAccessor(d))))
            .y0((d) => newBase(yScale, d, moreProps))
            .y1((d) => Math.round(yScale(yAccessor(d))))
            .context(ctx);

        if (interpolation !== undefined) {
            areaSeries.curve(interpolation);
        }
        areaSeries(plotData);
        ctx.fill();

        if (canvasClip) {
            ctx.restore();
        }
    };
}
