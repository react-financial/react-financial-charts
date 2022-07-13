import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";
import { ChartCanvasContext, chartCanvasContextDefaultValue, ChartCanvasContextType } from "./ChartCanvas";
import type { ChartConfig } from "./utils/ChartDataUtil";

export type ChartContextType = Omit<ChartCanvasContextType<number | Date>, "chartConfig"> & {
    chartConfig: ChartConfig;
};
export const ChartContext = React.createContext<ChartContextType>({
    ...chartCanvasContextDefaultValue,
    // @ts-ignore
    chartConfig: {},
    chartId: 0,
});

export interface ChartProps {
    readonly flipYScale?: boolean;
    readonly height?: number;
    readonly id: number | string;
    readonly onContextMenu?: (event: React.MouseEvent, moreProps: any) => void;
    readonly onDoubleClick?: (event: React.MouseEvent, moreProps: any) => void;
    readonly origin?: number[] | ((width: number, height: number) => number[]);
    readonly padding?: number | { top: number; bottom: number };
    readonly yExtents?: number[] | ((data: any) => number) | ((data: any) => number[]);
    readonly yExtentsCalculator?: (options: {
        plotData: any[];
        xDomain: any;
        xAccessor: any;
        displayXAccessor: any;
        fullData: any[];
    }) => number[];
    readonly yPan?: boolean;
    readonly yPanEnabled?: boolean;
    readonly yScale?: ScaleContinuousNumeric<number, number>;
}

export const Chart = React.memo((props: React.PropsWithChildren<ChartProps>) => {
    const {
        // flipYScale = false,
        id = 0,
        // origin = [0, 0],
        // padding = 0,
        // yPan = true,
        // yPanEnabled = false,
        // yScale = scaleLinear(),
        onContextMenu,
        onDoubleClick,
    } = props;

    const chartCanvasContextValue = React.useContext(ChartCanvasContext);
    const { subscribe, unsubscribe, chartConfigs } = chartCanvasContextValue;

    const listener = React.useCallback(
        (type: string, moreProps: any, _: any, e: React.MouseEvent) => {
            switch (type) {
                case "contextmenu": {
                    if (onContextMenu === undefined) {
                        return;
                    }

                    const { currentCharts } = moreProps;
                    if (currentCharts.indexOf(id) > -1) {
                        onContextMenu(e, moreProps);
                    }

                    break;
                }
                case "dblclick": {
                    if (onDoubleClick === undefined) {
                        return;
                    }

                    const { currentCharts } = moreProps;
                    if (currentCharts.indexOf(id) > -1) {
                        onDoubleClick(e, moreProps);
                    }

                    break;
                }
            }
        },
        [onContextMenu, onDoubleClick, id],
    );

    React.useEffect(() => {
        subscribe(`chart_${id}`, {
            listener,
        });
        return () => unsubscribe(`chart_${id}`);
    }, [subscribe, unsubscribe, id, listener]);

    const config = chartConfigs.find(({ id }) => id === props.id)!;
    const contextValue = React.useMemo(() => {
        return {
            ...chartCanvasContextValue,
            chartId: id,
            chartConfig: config,
        };
    }, [id, config, chartCanvasContextValue]);

    const {
        origin: [x, y],
    } = config;

    return (
        <ChartContext.Provider value={contextValue}>
            <g transform={`translate(${x}, ${y})`} id={`chart_${id}`}>
                {props.children}
            </g>
        </ChartContext.Provider>
    );
});

Chart.displayName = "Chart";
