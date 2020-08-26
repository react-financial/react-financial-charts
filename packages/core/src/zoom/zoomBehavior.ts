import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import { getCurrentItem } from "../utils/ChartDataUtil";
import { last } from "../utils/index";

export interface IZoomAnchorOptions<T> {
    readonly plotData: T[];
    readonly mouseXY: number[];
    readonly xAccessor: (data: T) => number | Date;
    readonly xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
}

export const mouseBasedZoomAnchor = <T>({ xScale, xAccessor, mouseXY, plotData }: IZoomAnchorOptions<T>) => {
    const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
    return xAccessor(currentItem);
};

export const lastVisibleItemBasedZoomAnchor = <T>({ xAccessor, plotData }: IZoomAnchorOptions<T>) => {
    const lastItem = last(plotData);
    return xAccessor(lastItem);
};

export const rightDomainBasedZoomAnchor = <T>({ xScale }: IZoomAnchorOptions<T>) => {
    const [, end] = xScale.domain();
    return end;
};
