import * as React from "react";
import { Chart, ChartCanvas } from "@react-financial-charts/core";
import { XAxis, YAxis } from "@react-financial-charts/axes";
import { discontinuousTimeScaleProviderBuilder } from "@react-financial-charts/scales";
import { BarSeries, CandlestickSeries, VolumeProfileSeries } from "@react-financial-charts/series";
import { IOHLCData, withOHLCData } from "../../data";
import { withDeviceRatio, withSize } from "@react-financial-charts/utils";
import { change } from "@react-financial-charts/indicators";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class VolumeProfile extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { data: initialData, height, ratio, width } = this.props;

        const absoluteChange = change()(initialData);

        const { data, xScale, xAccessor, displayXAccessor } = this.xScaleProvider(absoluteChange);

        const gridHeight = height - this.margin.top - this.margin.bottom;
        const barChartHeight = gridHeight / 4;
        const barChartOrigin = (_: number, h: number) => [0, h - barChartHeight];
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
                displayXAccessor={displayXAccessor}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}
            >
                <Chart id={1} height={barChartHeight} origin={barChartOrigin} yExtents={this.barChartExtents}>
                    <BarSeries yAccessor={this.volumeSeries} />
                </Chart>
                <Chart id={2} yExtents={this.yExtents}>
                    <CandlestickSeries />
                    <VolumeProfileSeries />
                    <XAxis />
                    <YAxis />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly barChartExtents = (data: IOHLCData) => {
        return data.volume;
    };

    private readonly yExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };

    private readonly volumeSeries = (data: IOHLCData) => {
        return data.volume;
    };
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(VolumeProfile)));
