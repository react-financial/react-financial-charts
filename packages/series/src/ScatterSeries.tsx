import { functor, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { group } from "d3-array";
import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import * as React from "react";

export interface ScatterSeriesProps {
    /**
     * A Marker to draw.
     */
    readonly marker?: any;
    /**
     * Given the data point return a Marker.
     */
    readonly markerProvider?: (datum: any) => any;
    /**
     * Props to pass to the marker.
     */
    readonly markerProps?: object;
    /**
     * Accessor for y value.
     */
    readonly yAccessor: (data: any) => number | undefined;
}

export class ScatterSeries extends React.Component<ScatterSeriesProps> {
    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const points = this.getMarkers(moreProps);

        const { markerProps } = this.props;

        const nest = group(
            points,
            (d) => d.fillStyle,
            (d) => d.strokeStyle,
        );

        nest.forEach((fillValues, fillKey) => {
            if (fillKey !== "none") {
                ctx.fillStyle = fillKey;
            }

            fillValues.forEach((strokeValues) => {
                strokeValues.forEach((point) => {
                    const { marker } = point;
                    marker.drawOnCanvas({ ...marker.defaultProps, ...markerProps, fillStyle: fillKey }, point, ctx);
                });
            });
        });
    };

    private readonly getMarkers = (moreProps: {
        xAccessor: (data: any) => number | Date;
        xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
        chartConfig: any;
        plotData: any[];
    }) => {
        const { yAccessor, markerProvider, markerProps } = this.props;

        const {
            xAccessor,
            xScale,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        let { marker: Marker } = this.props;
        if (!(markerProvider || Marker)) {
            throw new Error("required prop, either marker or markerProvider missing");
        }

        return plotData
            .map((d: any) => {
                const yValue = yAccessor(d);
                if (yValue === undefined) {
                    return undefined;
                }

                const xValue = xAccessor(d);

                if (markerProvider) {
                    Marker = markerProvider(d);
                }

                const mProps = { ...Marker.defaultProps, ...markerProps };

                const fill = functor(mProps.fillStyle);
                const stroke = functor(mProps.strokeStyle);

                return {
                    x: xScale(xValue),
                    y: yScale(yValue),
                    fillStyle: fill(d),
                    strokeStyle: stroke(d),
                    datum: d,
                    marker: Marker,
                };
            })
            .filter((marker) => marker !== undefined)
            .map((marker) => marker!);
    };
}
