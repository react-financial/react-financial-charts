import { nest as d3Nest } from "d3-collection";
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";

import { functor, hexToRGBA } from "../utils";

interface ScatterSeriesProps {
    className?: string;
    yAccessor: any; // func
    marker?: any; // func
    markerProvider?: any; // func
    markerProps?: object;
}

export class ScatterSeries extends React.Component<ScatterSeriesProps> {

    public static defaultProps = {
        className: "react-stockcharts-scatter",
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

        return <g className={className}>
            {points.map((point, idx) => {
                const { marker: Marker } = point;
                return <Marker key={idx} {...markerProps} point={point} />;
            })}
        </g>;
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { xAccessor } = moreProps;

        const points = this.helper(this.props, moreProps, xAccessor);

        this.drawOnCanvasHelper(ctx, this.props, points);
    }

    private readonly helper = (props, moreProps, xAccessor) => {
        const { yAccessor, markerProvider, markerProps } = props;
        let { marker: Marker } = props;
        const { xScale, chartConfig: { yScale }, plotData } = moreProps;

        if (!(markerProvider || Marker)) { throw new Error("required prop, either marker or markerProvider missing"); }

        return plotData.map((d) => {

            if (markerProvider) { Marker = markerProvider(d); }

            const mProps = { ...Marker.defaultProps, ...markerProps };

            const fill = functor(mProps.fill);
            const stroke = functor(mProps.stroke);

            return {
                x: xScale(xAccessor(d)),
                y: yScale(yAccessor(d)),
                fill: hexToRGBA(fill(d), mProps.opacity),
                stroke: stroke(d),
                datum: d,
                marker: Marker,
            };
        });
    }

    private readonly drawOnCanvasHelper = (ctx, props, points) => {

        const { markerProps } = props;

        const nest = d3Nest()
            .key((d) => d.fill)
            .key((d) => d.stroke)
            .entries(points);

        nest.forEach((fillGroup) => {
            const { key: fillKey, values: fillValues } = fillGroup;

            if (fillKey !== "none") {
                ctx.fillStyle = fillKey;
            }

            fillValues.forEach((strokeGroup) => {
                const { values: strokeValues } = strokeGroup;

                strokeValues.forEach((point) => {
                    const { marker } = point;
                    marker.drawOnCanvas({ ...marker.defaultProps, ...markerProps, fill: fillKey }, point, ctx);
                });
            });
        });
    }
}
