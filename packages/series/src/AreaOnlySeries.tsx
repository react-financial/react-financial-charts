import { colorToRGBA, first, functor, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { area as d3Area } from "d3-shape";
import * as React from "react";

interface AreaOnlySeriesProps {
    readonly base?: number | ((yScale: any, d: [number, number], moreProps: any) => number);
    readonly canvasClip?: any; // func
    readonly canvasGradient?: any; // func
    readonly className?: string;
    readonly defined?: any; // func
    readonly fill?: string;
    readonly opacity?: number;
    readonly interpolation?: any; // func
    readonly stroke?: string;
    readonly style?: React.CSSProperties;
    readonly yAccessor: (data: any) => number;
}

export class AreaOnlySeries extends React.Component<AreaOnlySeriesProps> {
    public static defaultProps = {
        className: "line",
        fill: "none",
        opacity: 1,
        defined: (d) => !isNaN(d),
        base: (yScale /* , d, moreProps */) => first(yScale.range()),
    };

    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const {
            fill = AreaOnlySeries.defaultProps.fill,
            stroke,
            opacity,
            interpolation,
            canvasClip,
            yAccessor,
            defined,
            base,
            canvasGradient,
        } = this.props;

        const {
            xScale,
            chartConfig: { yScale },
            plotData,
            xAccessor,
        } = moreProps;

        if (canvasClip) {
            ctx.save();
            canvasClip(ctx, moreProps);
        }

        if (canvasGradient != null) {
            ctx.fillStyle = canvasGradient(moreProps, ctx);
        } else {
            ctx.fillStyle = colorToRGBA(fill, opacity);
        }

        if (stroke !== undefined) {
            ctx.strokeStyle = stroke;
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
