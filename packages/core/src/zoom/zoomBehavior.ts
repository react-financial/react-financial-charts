import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import { getCurrentItem } from "../utils/ChartDataUtil";
import { last } from "../utils/index";

export interface IZoomAnchorOptions<TData, TXAxis extends number | Date> {
    readonly plotData: TData[];
    readonly mouseXY: number[];
    readonly xAccessor: (data: TData) => TXAxis;
    readonly xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
}

export const mouseBasedZoomAnchor = <TData, TXAxis extends number | Date>(
    options: IZoomAnchorOptions<TData, TXAxis>,
) => {
    const { xScale, xAccessor, mouseXY, plotData } = options;
    const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
    return xAccessor(currentItem);
};

export const lastVisibleItemBasedZoomAnchor = <TData, TXAxis extends number | Date>(
    options: IZoomAnchorOptions<TData, TXAxis>,
) => {
    const { xAccessor, plotData } = options;
    const lastItem = last(plotData);
    return xAccessor(lastItem);
};

export const rightDomainBasedZoomAnchor = <TData, TXAxis extends number | Date>(
    options: IZoomAnchorOptions<TData, TXAxis>,
) => {
    const { xScale } = options;
    const [, end] = xScale.domain();
    return end;
};
