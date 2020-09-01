import { format } from "d3-format";
import { scaleTime, ScaleTime, ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";
import {
    Chart,
    ChartCanvas,
    XAxis,
    YAxis,
    CandlestickSeries,
    timeFormat,
    withDeviceRatio,
    withSize,
} from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
    readonly xScale?: ScaleTime<number, number>;
    readonly yScale?: ScaleContinuousNumeric<number, number>;
}

class Scales extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };

    public render() {
        const { data, height, ratio, width, xScale = scaleTime(), yScale } = this.props;

        const xAccessor = (d: IOHLCData) => d.date;
        const max = xAccessor(data[data.length - 1]);
        const min = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [min, max];

        return (
            <ChartCanvas
                height={height}
                ratio={ratio}
                width={width}
                margin={this.margin}
                data={data}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}
            >
                <Chart id={1} yExtents={this.yExtents} yScale={yScale}>
                    <CandlestickSeries />
                    <XAxis tickFormat={timeFormat} />
                    <YAxis tickFormat={format(".2f")} />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };
}

export const Daily = withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(Scales)));
