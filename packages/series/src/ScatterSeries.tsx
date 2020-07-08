import { group } from "d3-array";
import * as React from "react";
import { colorToRGBA, functor, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";

interface ScatterSeriesProps {
    readonly className?: string;
    readonly yAccessor: (data: any) => number;
    readonly marker?: any; // func
    readonly markerProvider?: any; // func
    readonly markerProps?: object;
}

export class ScatterSeries extends React.Component<ScatterSeriesProps> {
    public static defaultProps = {
        className: "react-financial-charts-scatter",
    };

    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const points = this.getMarkers(moreProps);

        this.drawOnCanvasHelper(ctx, points);
    };

    private readonly getMarkers = (moreProps) => {
        const { yAccessor, markerProvider, markerProps } = this.props;
        let { marker: Marker } = this.props;
        const {
            xAccessor,
            xScale,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        if (!(markerProvider || Marker)) {
            throw new Error("required prop, either marker or markerProvider missing");
        }

        return plotData.map((d) => {
            if (markerProvider) {
                Marker = markerProvider(d);
            }

            const mProps = { ...Marker.defaultProps, ...markerProps };

            const fill = functor(mProps.fill);
            const stroke = functor(mProps.stroke);

            return {
                x: xScale(xAccessor(d)),
                y: yScale(yAccessor(d)),
                fill: colorToRGBA(fill(d), mProps.opacity),
                stroke: stroke(d),
                datum: d,
                marker: Marker,
            };
        });
    };

    private readonly drawOnCanvasHelper = (ctx: CanvasRenderingContext2D, points) => {
        const { markerProps } = this.props;

        const nest = group(
            points,
            // @ts-ignore
            (d) => d.fill,
            // @ts-ignore
            (d) => d.stroke,
        );

        nest.forEach((fillValues, fillKey) => {
            if (fillKey !== "none") {
                // @ts-ignore
                ctx.fillStyle = fillKey;
            }

            fillValues.forEach((strokeValues) => {
                // @ts-ignore
                strokeValues.forEach((point) => {
                    const { marker } = point;
                    marker.drawOnCanvas({ ...marker.defaultProps, ...markerProps, fill: fillKey }, point, ctx);
                });
            });
        });
    };
}
