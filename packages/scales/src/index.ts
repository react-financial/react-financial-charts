import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
export {
    default as discontinuousTimeScaleProvider,
    discontinuousTimeScaleProviderBuilder,
} from "./discontinuousTimeScaleProvider.js";
export { default as financeDiscontinuousScale } from "./financeDiscontinuousScale.js";
export * from "./timeFormat.js";

export const defaultScaleProvider = <TData, TXAxis extends number | Date>(
    xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>,
) => {
    return (data: TData[], xAccessor: (data: TData) => TXAxis) => ({
        data,
        xScale,
        xAccessor,
        displayXAccessor: xAccessor,
    });
};
