import { merge } from "d3-array";

import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";

import { first, functor, isDefined, isNotDefined, plotDataLengthBarWidth } from "../utils";
import { drawOnCanvas2, getBarsSVG2 } from "./StackedBarSeries";

interface OverlayBarSeriesProps {
    readonly baseAt?: number | any; // func
    readonly direction?: "up" | "down";
    readonly stroke?: boolean;
    readonly width?: any;
    readonly widthRatio?: number;
    readonly opacity?: number;
    readonly fill?: string | any; // func
    readonly className?: string | any; // func
    readonly xAccessor?: any; // func
    readonly yAccessor?: any[]; // func
    readonly xScale?: any; // func
    readonly yScale?: any; // func
    readonly plotData?: number[];
    readonly clip?: boolean;
}

export class OverlayBarSeries extends React.Component<OverlayBarSeriesProps> {

    public static defaultProps = {
        baseAt: (xScale, yScale/* , d*/) => first(yScale.range()),
        direction: "up",
        className: "bar",
        stroke: false,
        fill: "#4682B4",
        opacity: 1,
        widthRatio: 0.5,
        width: plotDataLengthBarWidth,
        clip: true,
    };

    public render() {
        const { clip } = this.props;

        return (
            <GenericChartComponent
                svgDraw={this.renderSVG}
                canvasToDraw={getAxisCanvas}
                canvasDraw={this.drawOnCanvas}
                clip={clip}
                drawOn={["pan"]}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { yAccessor } = this.props;

        const bars = this.getBars(moreProps, yAccessor);
        return (
            <g className="react-financial-charts-bar-series">
                {getBarsSVG2(this.props, bars)}
            </g>
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { yAccessor } = this.props;
        const bars = this.getBars(moreProps, yAccessor);

        drawOnCanvas2(this.props, ctx, bars);
    }

    private readonly getBars = (moreProps, yAccessor) => {
        const { xScale, xAccessor, chartConfig: { yScale }, plotData } = moreProps;
        const { baseAt, className, fill, stroke } = this.props;

        const getClassName = functor(className);
        const getFill = functor(fill);
        const getBase = functor(baseAt);
        const widthFunctor = functor(this.props.width);

        const width = widthFunctor(this.props, moreProps);
        const offset = Math.floor(0.5 * width);

        const bars = plotData
            .map((d) => {
                const innerBars = yAccessor.map((eachYAccessor, i) => {
                    const yValue = eachYAccessor(d);
                    if (isNotDefined(yValue)) { return undefined; }

                    const xValue = xAccessor(d);
                    const x = Math.round(xScale(xValue)) - offset;
                    const y = yScale(yValue);
                    return {
                        width: offset * 2,
                        x,
                        y,
                        className: getClassName(d, i),
                        stroke: stroke ? getFill(d, i) : "none",
                        fill: getFill(d, i),
                        i,
                    };
                }).filter((yValue) => isDefined(yValue));

                let b = getBase(xScale, yScale, d);
                let h;
                for (let i = innerBars.length - 1; i >= 0; i--) {
                    h = b - innerBars[i].y;
                    if (h < 0) {
                        innerBars[i].y = b;
                        h = -1 * h;
                    }
                    innerBars[i].height = h;
                    b = innerBars[i].y;
                }
                return innerBars;
            });

        return merge(bars);
    }
}
