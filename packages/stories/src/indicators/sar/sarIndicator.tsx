import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { sar } from "react-financial-charts/lib/indicator";
import { discontinuousTimeScaleProviderBuilder } from "react-financial-charts/lib/scale";
import { SARSeries } from "react-financial-charts/lib/series";
import { SingleValueTooltip } from "react-financial-charts/lib/tooltip";
import { withDeviceRatio } from "react-financial-charts/lib/utils";
import { IOHLCData, withOHLCData, withSize } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class SARIndicator extends React.Component<ChartProps> {

    private readonly margin = { left: 0, right: 40, top: 8, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder()
        .inputDateAccessor((d: IOHLCData) => d.date);

    public render() {

        const {
            data: initialData,
            height,
            ratio,
            width,
        } = this.props;

        const accelerationFactor = .02;
        const maxAccelerationFactor = .2;

        const calculator = sar()
            // @ts-ignore
            .options({
                accelerationFactor, maxAccelerationFactor,
            })
            .merge((d: any, c: any) => { d.sar = c; })
            .accessor((d: any) => d.sar);

        const calculatedData = calculator(initialData);

        const { margin, xScaleProvider } = this;

        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(calculatedData);

        const start = xAccessor(data[data.length - 1]);
        const end = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [start, end];

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
                xExtents={xExtents}>
                <Chart
                    id={1}
                    yExtents={(d) => [d.sar]}>
                    <XAxis ticks={6} />
                    <YAxis ticks={5} />

                    <SARSeries yAccessor={this.yAccessor} />

                    <SingleValueTooltip
                        yLabel={`SAR (${accelerationFactor}, ${maxAccelerationFactor})`}
                        yAccessor={this.yAccessor}
                        origin={[8, 8]} />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yAccessor = (data: any) => {
        return data.sar;
    }
}

export default withOHLCData()(withSize()(withDeviceRatio()(SARIndicator)));
