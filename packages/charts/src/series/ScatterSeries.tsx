import { group } from "d3-array";
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";

import { colorToRGBA, functor } from "../utils";

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
        return (
            <GenericChartComponent
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { className, markerProps } = this.props;
        const { xAccessor } = moreProps;

        const points = this.helper(this.props, moreProps, xAccessor);

        return (
            <g className={className}>
                {points.map((point, idx) => {
                    const { marker: Marker } = point;
                    return <Marker key={idx} {...markerProps} point={point} />;
                })}
            </g>
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { xAccessor } = moreProps;

        const points = this.helper(this.props, moreProps, xAccessor);

        this.drawOnCanvasHelper(ctx, this.props, points);
    }

    private readonly helper = (props: ScatterSeriesProps, moreProps, xAccessor) => {
        const { yAccessor, markerProvider, markerProps } = props;
        let { marker: Marker } = props;
        const { xScale, chartConfig: { yScale }, plotData } = moreProps;

        if (!(markerProvider || Marker)) {
            throw new Error("required prop, either marker or markerProvider missing");
        }

        return plotData.map((d) => {

            if (markerProvider) { Marker = markerProvider(d); }

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
    }

    private readonly drawOnCanvasHelper = (ctx: CanvasRenderingContext2D, props: ScatterSeriesProps, points) => {

        const { markerProps } = props;

        // @ts-ignore
        const nest = group(points, (d) => d.fill, (d) => d.stroke);

        nest.forEach((fillValues, fillKey) => {

            if (fillKey !== "none") {
                ctx.fillStyle = fillKey;
            }

            fillValues.forEach((strokeValues) => {

                strokeValues.forEach((point) => {
                    const { marker } = point;
                    marker.drawOnCanvas({ ...marker.defaultProps, ...markerProps, fill: fillKey }, point, ctx);
                });
            });
        });
    }
}
