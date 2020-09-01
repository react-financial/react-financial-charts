import { max, min } from "d3-array";
import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import { getClosestItemIndexes, head, isDefined, isNotDefined, last } from "../utils";

function getNewEnd<T, TAccessor extends number | Date>(
    fallbackEnd: { lastItem: T; lastItemX: TAccessor },
    xAccessor: (item: T) => TAccessor,
    initialXScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
    start: any,
) {
    const { lastItem, lastItemX } = fallbackEnd;

    const lastItemXValue = xAccessor(lastItem);

    const [rangeStart, rangeEnd] = initialXScale.range();

    const newEnd =
        ((rangeEnd - rangeStart) / (lastItemX.valueOf() - rangeStart)) * (lastItemXValue.valueOf() - start.valueOf()) +
        start.valueOf();

    return newEnd;
}

function extentsWrapper<TDomain extends number | Date>(
    useWholeData: boolean,
    clamp:
        | boolean
        | "left"
        | "right"
        | "both"
        | ((domain: [TDomain, TDomain], headTail: [TDomain, TDomain]) => [TDomain, TDomain]),
    pointsPerPxThreshold: number,
    minPointsPerPxThreshold: number,
    flipXScale: boolean,
) {
    function filterData<T>(
        data: T[],
        inputDomain: [TDomain, TDomain],
        xAccessor: (item: T) => TDomain,
        initialXScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
        { currentPlotData, currentDomain, fallbackStart, fallbackEnd, ignoreThresholds = false }: any = {},
    ) {
        if (useWholeData) {
            return { plotData: data, domain: inputDomain };
        }

        let left: TDomain = head(inputDomain);
        let right: TDomain = last(inputDomain);
        let clampedDomain = inputDomain;

        let filteredData = getFilteredResponse(data, left, right, xAccessor);
        if (filteredData.length === 1 && fallbackStart !== undefined) {
            left = fallbackStart;
            right = getNewEnd(fallbackEnd, xAccessor, initialXScale, left);

            clampedDomain = [left, right];
            filteredData = getFilteredResponse(data, left, right, xAccessor);
        }

        if (typeof clamp === "function") {
            clampedDomain = clamp(clampedDomain, [xAccessor(head(data)), xAccessor(last(data))]);
        } else {
            if (clamp === "left" || clamp === "both" || clamp === true) {
                clampedDomain = [max([left, xAccessor(head(data))])!, clampedDomain[1]];
            }

            if (clamp === "right" || clamp === "both" || clamp === true) {
                clampedDomain = [clampedDomain[0], min([right, xAccessor(last(data))])!];
            }
        }

        if (clampedDomain !== inputDomain) {
            filteredData = getFilteredResponse(data, clampedDomain[0], clampedDomain[1], xAccessor);
        }

        const realInputDomain = clampedDomain;

        const xScale = initialXScale.copy().domain(realInputDomain) as
            | ScaleContinuousNumeric<number, number>
            | ScaleTime<number, number>;

        let width = Math.floor(xScale(xAccessor(last(filteredData))) - xScale(xAccessor(head(filteredData))));

        // prevent negative width when flipXScale
        if (flipXScale && width < 0) {
            width = width * -1;
        }

        let plotData: T[];
        let domain: [number | Date, number | Date];

        const chartWidth = last(xScale.range()) - head(xScale.range());

        if (
            (ignoreThresholds && filteredData.length > 1) ||
            canShowTheseManyPeriods(width, filteredData.length, pointsPerPxThreshold, minPointsPerPxThreshold)
        ) {
            plotData = filteredData;
            domain = realInputDomain;
        } else {
            if (chartWidth > showMaxThreshold(width, pointsPerPxThreshold) && isDefined(fallbackEnd)) {
                plotData = filteredData;
                const newEnd = getNewEnd(fallbackEnd, xAccessor, initialXScale, head(realInputDomain));
                domain = [head(realInputDomain), newEnd];
            } else {
                plotData =
                    currentPlotData ?? filteredData.slice(filteredData.length - showMax(width, pointsPerPxThreshold));
                domain = currentDomain ?? [xAccessor(head(plotData)), xAccessor(last(plotData))];
            }
        }
        return { plotData, domain };
    }
    return { filterData };
}

function canShowTheseManyPeriods(width: number, arrayLength: number, maxThreshold: number, minThreshold: number) {
    const widthAdjustedMinThreshold = showMinThreshold(width, minThreshold);
    const widthAdjustedMaxTheshold = showMaxThreshold(width, maxThreshold);
    return arrayLength >= widthAdjustedMinThreshold && arrayLength < widthAdjustedMaxTheshold;
}

function showMinThreshold(width: number, threshold: number) {
    return Math.max(1, Math.ceil(width * threshold));
}

function showMaxThreshold(width: number, threshold: number) {
    return Math.floor(width * threshold);
}

function showMax(width: number, threshold: number) {
    return Math.floor(showMaxThreshold(width, threshold) * 0.97);
}

function getFilteredResponse<T, TAccessor extends number | Date>(
    data: T[],
    left: TAccessor,
    right: TAccessor,
    xAccessor: (item: T) => TAccessor,
) {
    const newLeftIndex = getClosestItemIndexes(data, left, xAccessor).left;
    const newRightIndex = getClosestItemIndexes(data, right, xAccessor).right;

    const filteredData = data.slice(newLeftIndex, newRightIndex + 1);

    return filteredData;
}

export default function ({
    xScale,
    useWholeData,
    clamp,
    pointsPerPxThreshold,
    minPointsPerPxThreshold,
    flipXScale,
}: any) {
    return extentsWrapper(
        useWholeData || isNotDefined(xScale.invert),
        clamp,
        pointsPerPxThreshold,
        minPointsPerPxThreshold,
        flipXScale,
    );
}
