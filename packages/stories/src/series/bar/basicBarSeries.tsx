import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { discontinuousTimeScaleProviderBuilder } from "react-financial-charts/lib/scale";
import { BarSeries } from "react-financial-charts/lib/series";
import { withDeviceRatio } from "react-financial-charts/lib/utils";
import { IOHLCData, withOHLCData, withSize } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class BasicBarSeries extends React.Component<ChartProps> {

    private readonly margin = { left: 0, right: 90, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder()
        .inputDateAccessor((d: IOHLCData) => d.date);

    public render() {

        const {
            data: initialData,
            height,
            ratio,
            width,
        } = this.props;

        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = this.xScaleProvider(initialData);

        const start = xAccessor(data[data.length - 1]);
        const end = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [start, end];

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
                xExtents={xExtents}>
                <Chart
                    id={1}
                    yExtents={this.yExtents}>
                    <BarSeries yAccessor={this.yAccessor} />
                    <XAxis />
                    <YAxis />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yAccessor = (data: IOHLCData) => {
        return data.volume;
    }

    private readonly yExtents = (data: IOHLCData) => {
        return data.volume;
    }
}

export const Daily = withOHLCData()(withSize()(withDeviceRatio()(BasicBarSeries)));

export const Intraday = withOHLCData("MSFT_INTRA_DAY")(withSize()(withDeviceRatio()(BasicBarSeries)));
