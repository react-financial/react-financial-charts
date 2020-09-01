import * as React from "react";
import {
    discontinuousTimeScaleProviderBuilder,
    CandlestickSeries,
    Chart,
    ChartCanvas,
    XAxis,
    YAxis,
    YAxisProps,
    withDeviceRatio,
    withSize,
} from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps extends Partial<YAxisProps> {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
}

class AxisExample extends React.Component<ChartProps> {
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { axisAt = "right", data: initialData, height, ratio, width, ...rest } = this.props;

        const margin = {
            bottom: 24,
            left: axisAt === "left" ? 48 : 0,
            right: axisAt === "right" ? 48 : 0,
            top: 0,
        };

        const { data, xScale, xAccessor, displayXAccessor } = this.xScaleProvider(initialData);

        const max = xAccessor(data[data.length - 1]);
        const min = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [min, max];

        return (
            <ChartCanvas
                height={height}
                ratio={ratio}
                width={width}
                margin={margin}
                data={data}
                displayXAccessor={displayXAccessor}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}
            >
                <Chart id={1} yExtents={this.yExtents}>
                    <XAxis />
                    <YAxis axisAt={axisAt} {...rest} />
                    <CandlestickSeries />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(AxisExample)));
