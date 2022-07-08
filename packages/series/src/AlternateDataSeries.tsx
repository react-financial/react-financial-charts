import * as React from "react";
import { ChartCanvasContext } from "@react-financial-charts/core";

export interface AlternateDataSeriesProps<TData> {
    readonly data: TData[];
}

export const AlternateDataSeries = <TData,>({
    data,
    children,
}: React.PropsWithChildren<AlternateDataSeriesProps<TData>>) => {
    const context = React.useContext(ChartCanvasContext);
    const contextValue = React.useMemo(() => {
        const { plotData, xAccessor } = context;

        const startDate = xAccessor(plotData[0]);
        const endDate = xAccessor(plotData[plotData.length - 1]);

        return {
            ...context,
            plotData: data.filter((d) => {
                const date = xAccessor(d);
                return date > startDate && date < endDate;
            }),
        };
    }, [data, context]);

    return <ChartCanvasContext.Provider value={contextValue}>{children}</ChartCanvasContext.Provider>;
};
