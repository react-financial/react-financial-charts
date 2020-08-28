import { group, merge } from "d3-array";
import { ScaleContinuousNumeric } from "d3-scale";
import { stack as d3Stack } from "d3-shape";
import * as React from "react";
import {
    functor,
    head,
    identity,
    getAxisCanvas,
    GenericChartComponent,
    plotDataLengthBarWidth,
} from "@react-financial-charts/core";

export interface StackedBarSeriesProps {
    readonly baseAt?:
        | number
        | ((
              xScale: ScaleContinuousNumeric<number, number>,
              yScale: ScaleContinuousNumeric<number, number>,
              d: [number, number],
              moreProps: any,
          ) => number);
    readonly clip?: boolean;
    readonly direction?: "up" | "down";
    readonly fillStyle?: string | ((data: any, y: number) => string);
    readonly spaceBetweenBar?: number;
    readonly stroke?: boolean;
    readonly swapScales?: boolean;
    readonly yAccessor: ((data: any) => number | undefined) | ((d: any) => number)[];
    readonly width?: number | ((props: StackedBarSeriesProps, moreProps: any) => number);
    readonly widthRatio?: number;
}

export class StackedBarSeries extends React.Component<StackedBarSeriesProps> {
    public static defaultProps = {
        baseAt: (xScale: ScaleContinuousNumeric<number, number>, yScale: ScaleContinuousNumeric<number, number>) =>
            head(yScale.range()),
        direction: "up",
        stroke: false,
        fillStyle: "rgba(70, 130, 180, 0.5)",
        width: plotDataLengthBarWidth,
        widthRatio: 0.8,
        clip: true,
        swapScales: false,
    };

    public render() {
        const { clip } = this.props;

        return (
            <GenericChartComponent
                clip={clip}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { xAccessor } = moreProps;

        drawOnCanvasHelper(ctx, this.props, moreProps, xAccessor, d3Stack);
    };
}

export function identityStack() {
    let keys: any[] = [];
    function stack(data: any) {
        const response = keys.map((key, i) => {
            const arrays = data.map((d: any) => {
                const array = [0, d[key]];

                // @ts-ignore
                array.data = d;
                return array;
            });
            arrays.key = key;
            arrays.index = i;
            return arrays;
        });
        return response;
    }
    stack.keys = function (x: any) {
        if (!arguments.length) {
            return keys;
        }
        keys = x;
        return stack;
    };
    return stack;
}

export function drawOnCanvasHelper(
    ctx: CanvasRenderingContext2D,
    props: any,
    moreProps: any,
    xAccessor: any,
    stackFn: any,
    defaultPostAction = identity,
    postRotateAction = rotateXY,
) {
    const {
        xScale,
        chartConfig: { yScale },
        plotData,
    } = moreProps;

    const bars = doStuff(props, xAccessor, plotData, xScale, yScale, stackFn, postRotateAction, defaultPostAction);

    drawOnCanvas2(props, ctx, bars);
}

function convertToArray(item: any) {
    return Array.isArray(item) ? item : [item];
}

const doStuff = (
    props: StackedBarSeriesProps,
    xAccessor: any,
    plotData: any[],
    xScale: any,
    yScale: any,
    stackFn: any,
    postRotateAction: any,
    defaultPostAction: any,
) => {
    const { yAccessor, swapScales } = props;

    const modifiedYAccessor = swapScales ? convertToArray(xAccessor) : convertToArray(yAccessor);
    const modifiedXAccessor = swapScales ? yAccessor : xAccessor;

    const modifiedXScale = swapScales ? yScale : xScale;
    const modifiedYScale = swapScales ? xScale : yScale;

    const postProcessor = swapScales ? postRotateAction : defaultPostAction;

    const bars = getBars(
        props,
        modifiedXAccessor,
        modifiedYAccessor,
        modifiedXScale,
        modifiedYScale,
        plotData,
        stackFn,
        postProcessor,
    );

    return bars;
};

export const rotateXY = (array: any[]) =>
    array.map((each) => {
        return {
            ...each,
            x: each.y,
            y: each.x,
            height: each.width,
            width: each.height,
        };
    });

export const drawOnCanvas2 = (props: { stroke?: boolean }, ctx: CanvasRenderingContext2D, bars: any) => {
    const { stroke } = props;

    const nest = group(bars, (d: any) => d.fillStyle);

    nest.forEach((values, key) => {
        if (head(values).width > 1) {
            if (key !== undefined) {
                ctx.strokeStyle = key;
            }
        }
        ctx.fillStyle = key;

        values.forEach((d) => {
            if (d.width <= 1) {
                ctx.fillRect(d.x - 0.5, d.y, 1, d.height);
            } else {
                ctx.fillRect(d.x + 0.5, d.y + 0.5, d.width, d.height);
                if (stroke) {
                    ctx.strokeRect(d.x, d.y, d.width, d.height);
                }
            }
        });
    });
};

export function getBars(
    props: StackedBarSeriesProps,
    xAccessor: any,
    yAccessor: any,
    xScale: any,
    yScale: any,
    plotData: any[],
    stack = identityStack,
    after = identity,
) {
    const { baseAt, fillStyle, stroke, spaceBetweenBar = 0 } = props;

    const getFill = functor(fillStyle);
    const getBase = functor(baseAt);

    const widthFunctor = functor(props.width);
    const width = widthFunctor(props, {
        xScale,
        xAccessor,
        plotData,
    });

    const barWidth = Math.round(width);

    const eachBarWidth = (barWidth - spaceBetweenBar * (yAccessor.length - 1)) / yAccessor.length;

    const offset = barWidth === 1 ? 0 : 0.5 * width;

    const ds = plotData.map((each) => {
        const d = {
            appearance: {},
            x: xAccessor(each),
        };
        yAccessor.forEach((eachYAccessor: any, i: number) => {
            const key = `y${i}`;
            // @ts-ignore
            d[key] = eachYAccessor(each);
            const appearance = {
                stroke: stroke ? getFill(each, i) : "none",
                fillStyle: getFill(each, i),
            };
            // @ts-ignore
            d.appearance[key] = appearance;
        });
        return d;
    });

    const keys = yAccessor.map((_: any, i: number) => `y${i}`);

    // @ts-ignore
    const data = stack().keys(keys)(ds);

    const newData = data.map((each: any, i: number) => {
        const key = each.key;
        return each.map((d: any) => {
            const array = [d[0], d[1]];

            // @ts-ignore
            array.data = {
                x: d.data.x,
                i,
                appearance: d.data.appearance[key],
            };
            return array;
        });
    });

    const bars = merge<any>(newData)
        .map((d) => {
            let y = yScale(d[1]);
            let h = getBase(xScale, yScale, d.data) - yScale(d[1] - d[0]);
            if (h < 0) {
                y = y + h;
                h = -h;
            }

            return {
                ...d.data.appearance,
                x: Math.round(xScale(d.data.x) - width / 2),
                y,
                groupOffset: Math.round(offset - (d.data.i > 0 ? (eachBarWidth + spaceBetweenBar) * d.data.i : 0)),
                groupWidth: Math.round(eachBarWidth),
                offset: Math.round(offset),
                height: h,
                width: barWidth,
            };
        })
        .filter((bar) => !isNaN(bar.y));

    return after(bars);
}
