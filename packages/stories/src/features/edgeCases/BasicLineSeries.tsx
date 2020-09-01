import * as React from "react";
import {
    Chart,
    ChartCanvas,
    XAxis,
    YAxis,
    discontinuousTimeScaleProviderBuilder,
    LineSeries,
    withDeviceRatio,
    withSize,
} from "react-financial-charts";
import { IOHLCData } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class BasicLineSeries extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { data: initialData, height, ratio, width } = this.props;

        const { data, xScale, xAccessor, displayXAccessor } = this.xScaleProvider(initialData);

        return (
            <ChartCanvas
                height={height}
                ratio={ratio}
                width={width}
                margin={this.margin}
                minPointsPerPxThreshold={0.0025}
                data={data}
                displayXAccessor={displayXAccessor}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
            >
                <Chart id={1} yExtents={this.yExtents}>
                    <LineSeries yAccessor={this.yAccessor} strokeWidth={3} />
                    <XAxis />
                    <YAxis />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yAccessor = (data: IOHLCData) => {
        return data.close;
    };

    private readonly yExtents = (data: IOHLCData) => {
        return [data.low, data.high];
    };
}

export default withSize({ style: { minHeight: 600 } })(withDeviceRatio()(BasicLineSeries));
