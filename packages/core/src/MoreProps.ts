import { ScaleContinuousNumeric } from "d3-scale";
import type { ChartConfig } from "./utils/ChartDataUtil";

export interface MoreProps {
    chartId: string | number;
    hovering: boolean;
    currentCharts: (string | number)[];
    startPos?: [number, number];
    mouseXY?: [number, number];
    chartConfigs: ChartConfig[];
    chartConfig?: ChartConfig;
    fullData: any[];
    plotData: any[];
    xAccessor: (datum: any) => any;
    xScale: Function;
    yScale?: ScaleContinuousNumeric<number, number>;
}
