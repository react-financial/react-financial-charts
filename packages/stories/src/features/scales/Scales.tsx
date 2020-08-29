import { format } from "d3-format";
import { timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear } from "d3-time";
import { timeFormat } from "d3-time-format";
import { scaleTime, ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";
import { Chart, ChartCanvas, XAxis, YAxis, CandlestickSeries, withDeviceRatio, withSize } from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

const formatMillisecond = timeFormat(".%L"),
    formatSecond = timeFormat(":%S"),
    formatMinute = timeFormat("%H:%M"),
    formatHour = timeFormat("%H:%M"),
    formatDay = timeFormat("%e"),
    formatWeek = timeFormat("%e"),
    formatMonth = timeFormat("%b"),
    formatYear = timeFormat("%Y");

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
    readonly yScale?: ScaleContinuousNumeric<number, number>;
}

class Scales extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };

    public render() {
        const { data, height, ratio, width, yScale } = this.props;

        const xAccessor = (d: IOHLCData) => d.date;
        const start = xAccessor(data[data.length - 1]);
        const end = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [start, end];
        const xScale = scaleTime();

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
                    <XAxis tickFormat={this.timeFormat} />
                    <YAxis tickFormat={format(".2f")} />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };

    private readonly timeFormat = (date: Date) => {
        return (timeSecond(date) < date
            ? formatMillisecond
            : timeMinute(date) < date
            ? formatSecond
            : timeHour(date) < date
            ? formatMinute
            : timeDay(date) < date
            ? formatHour
            : timeMonth(date) < date
            ? timeWeek(date) < date
                ? formatDay
                : formatWeek
            : timeYear(date) < date
            ? formatMonth
            : formatYear)(date);
    };
}

export const Daily = withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(Scales)));
