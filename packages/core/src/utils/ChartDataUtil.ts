import { extent } from "d3-array";
import { ScaleContinuousNumeric, scaleLinear, ScaleTime } from "d3-scale";
import flattenDeep from "lodash.flattendeep";
import * as React from "react";
import type { ChartProps } from "../Chart";

import { functor, getClosestItem, isNotDefined, isObject, last, mapObject, shallowEqual, zipper } from "./index";

export interface ChartConfig {
    id: number | string;
    // readonly origin: number[] | ((width: number, height: number) => number[]);
    readonly origin: number[];
    readonly padding: number | { top: number; bottom: number };
    readonly originalYExtentsProp?: number[] | ((data: any) => number) | ((data: any) => number[]);
    readonly yExtents?: number[] | ((data: any) => number) | ((data: any) => number[]);
    readonly yExtentsCalculator?: (options: {
        plotData: any[];
        xDomain: any;
        xAccessor: any;
        displayXAccessor: any;
        fullData: any[];
    }) => number[];
    readonly flipYScale?: boolean;
    readonly yScale: ScaleContinuousNumeric<number, number>;
    readonly yPan: boolean;
    readonly yPanEnabled: boolean;
    readonly realYDomain?: number[];
    readonly width: number;
    readonly height: number;
    mouseCoordinates?: { at: string; format: () => unknown };
}

export const ChartDefaultConfig = {
    flipYScale: false,
    id: 0,
    origin: [0, 0],
    padding: 0,
    yPan: true,
    yPanEnabled: false,
    yScale: scaleLinear(),
};

export function getChartOrigin(origin: any, contextWidth: number, contextHeight: number) {
    const originCoordinates = typeof origin === "function" ? origin(contextWidth, contextHeight) : origin;

    return originCoordinates;
}

export function getDimensions({ width, height }: any, chartProps: any) {
    const chartHeight = chartProps.height || height;

    return {
        availableHeight: height,
        width,
        height: chartHeight,
    };
}

function values(func: any) {
    return (d: any) => {
        const obj = func(d);
        if (isObject(obj)) {
            return mapObject(obj);
        }
        return obj;
    };
}

function isArraySize2AndNumber(yExtentsProp: any): yExtentsProp is [number, number] {
    if (Array.isArray(yExtentsProp) && yExtentsProp.length === 2) {
        const [a, b] = yExtentsProp;
        return typeof a === "number" && typeof b === "number";
    }

    return false;
}

const isChartProps = (props: ChartProps | any | undefined): props is ChartProps => {
    if (props === undefined) {
        return false;
    }

    const chartProps = props as ChartProps;
    if (chartProps.id === undefined) {
        return false;
    }

    return true;
};

export function getNewChartConfig(innerDimension: any, children: any, existingChartConfig: ChartConfig[] = []) {
    return React.Children.map(children, (each): ChartConfig | undefined => {
        if (!each || !isChartProps(each.props)) {
            return undefined;
        }
        const chartProps = {
            ...ChartDefaultConfig,
            ...(each.props as ChartProps),
        };

        const {
            id,
            origin,
            padding,
            yExtents: yExtentsProp,
            yScale: yScaleProp = ChartDefaultConfig.yScale,
            flipYScale,
            yExtentsCalculator,
        } = chartProps;

        const yScale = yScaleProp.copy();
        const { width, height, availableHeight } = getDimensions(innerDimension, chartProps);

        const { yPan } = chartProps;
        let { yPanEnabled } = chartProps;
        const yExtents = yExtentsProp
            ? (Array.isArray(yExtentsProp) ? yExtentsProp : [yExtentsProp]).map(functor)
            : undefined;

        const prevChartConfig = existingChartConfig.find((d) => d.id === id);

        if (isArraySize2AndNumber(yExtentsProp)) {
            if (
                !!prevChartConfig &&
                prevChartConfig.yPan &&
                prevChartConfig.yPanEnabled &&
                yPan &&
                yPanEnabled &&
                shallowEqual(prevChartConfig.originalYExtentsProp, yExtentsProp)
            ) {
                yScale.domain(prevChartConfig.yScale.domain());
            } else {
                const [a, b] = yExtentsProp;
                yScale.domain([a, b]);
            }
        } else if (!!prevChartConfig && prevChartConfig.yPanEnabled) {
            if (isArraySize2AndNumber(prevChartConfig.originalYExtentsProp)) {
                // do nothing
            } else {
                yScale.domain(prevChartConfig.yScale.domain());
                yPanEnabled = true;
            }
        }

        return {
            id,
            origin: functor(origin)(width, availableHeight),
            padding,
            originalYExtentsProp: yExtentsProp,
            yExtents,
            yExtentsCalculator,
            flipYScale,
            yScale,
            yPan,
            yPanEnabled,
            width,
            height,
        };
    }).filter((each: any) => each !== undefined);
}

export function getCurrentCharts(chartConfig: ChartConfig[], mouseXY: number[]) {
    const currentCharts = chartConfig
        .filter((eachConfig) => {
            const top = eachConfig.origin[1];
            const bottom = top + eachConfig.height;
            return mouseXY[1] > top && mouseXY[1] < bottom;
        })
        .map((config: any) => config.id);

    return currentCharts;
}

function setRange(scale: any, height: number, padding: any, flipYScale: any) {
    if (scale.rangeRoundPoints || isNotDefined(scale.invert)) {
        if (isNaN(padding)) {
            throw new Error("padding has to be a number for ordinal scale");
        }
        if (scale.rangeRoundPoints) {
            scale.rangeRoundPoints(flipYScale ? [0, height] : [height, 0], padding);
        }
        if (scale.rangeRound) {
            scale.range(flipYScale ? [0, height] : [height, 0]).padding(padding);
        }
    } else {
        const { top, bottom } = isNaN(padding) ? padding : { top: padding, bottom: padding };

        scale.range(flipYScale ? [top, height - bottom] : [height - bottom, top]);
    }
    return scale;
}

function yDomainFromYExtents(yExtents: any, yScale: any, plotData: any[]) {
    const yValues = yExtents.map((eachExtent: any) => plotData.map(values(eachExtent)));

    const allYValues: number[] = flattenDeep(yValues);

    const realYDomain = yScale.invert ? (extent(allYValues) as [number, number]) : [...new Set(allYValues).values()];

    return realYDomain;
}

export function getChartConfigWithUpdatedYScales(
    chartConfig: ChartConfig[],
    { plotData, xAccessor, displayXAccessor, fullData }: any,
    xDomain: any,
    dy?: number,
    chartsToPan?: (string | number)[],
): ChartConfig[] {
    const yDomains = chartConfig.map(({ yExtentsCalculator, yExtents, yScale }) => {
        const realYDomain = yExtentsCalculator
            ? yExtentsCalculator({ plotData, xDomain, xAccessor, displayXAccessor, fullData })
            : yDomainFromYExtents(yExtents, yScale, plotData);

        const yDomainDY =
            dy !== undefined
                ? yScale
                      .range()
                      .map((each: any) => each - dy)
                      .map(yScale.invert)
                : yScale.domain();
        return {
            realYDomain,
            yDomainDY,
            prevYDomain: yScale.domain(),
        };
    });

    const combine = zipper().combine(
        (config: ChartConfig, { realYDomain, yDomainDY, prevYDomain }: (typeof yDomains)[number]): ChartConfig => {
            const { id, padding, height, yScale, yPan, flipYScale, yPanEnabled = false } = config;

            const another = chartsToPan !== undefined ? chartsToPan.indexOf(id) > -1 : true;
            const domain = yPan && yPanEnabled ? (another ? yDomainDY : prevYDomain) : realYDomain;

            const newYScale = setRange(yScale.copy().domain(domain), height, padding, flipYScale);

            return {
                ...config,
                yScale: newYScale,
                realYDomain,
            };
        },
    );

    const updatedChartConfig = combine(chartConfig, yDomains) as ChartConfig[];

    return updatedChartConfig;
}

export function getCurrentItem(
    xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
    xAccessor: any,
    mouseXY: number[],
    plotData: any[],
) {
    let xValue: number | Date;
    let item: any;
    if (xScale.invert) {
        xValue = xScale.invert(mouseXY[0]);
        item = getClosestItem(plotData, xValue, xAccessor);
    } else {
        const dr = xScale
            .range()
            .map((d, idx) => ({ x: Math.abs(d - mouseXY[0]), idx }))
            .reduce((a, b) => (a.x < b.x ? a : b));

        item = dr !== undefined ? plotData[dr.idx] : plotData[0];
    }
    return item;
}

export function getXValue(
    xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
    xAccessor: any,
    mouseXY: number[],
    plotData: any[],
) {
    let xValue: number | Date;
    let item: any;
    if (xScale.invert) {
        xValue = xScale.invert(mouseXY[0]);
        if (xValue > xAccessor(last(plotData))) {
            return Math.round(xValue.valueOf());
        } else {
            item = getClosestItem(plotData, xValue, xAccessor);
        }
    } else {
        const dr = xScale
            .range()
            .map((d, idx) => ({ x: Math.abs(d - mouseXY[0]), idx }))
            .reduce((a, b) => (a.x < b.x ? a : b));

        item = dr !== undefined ? plotData[dr.idx] : plotData[0];
    }
    return xAccessor(item);
}
