import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { ema } from "react-financial-charts/lib/indicator";
import { discontinuousTimeScaleProviderBuilder } from "react-financial-charts/lib/scale";
import { LineSeries } from "react-financial-charts/lib/series";
import { MovingAverageTooltip } from "react-financial-charts/lib/tooltip";
import { withDeviceRatio } from "react-financial-charts/lib/utils";
import { IOHLCData, withOHLCData, withSize } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class EMAIndicator extends React.Component<ChartProps> {

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

        const ema12 = ema()
            // @ts-ignore
            .id(1)
            .options({ windowSize: 12 })
            .merge((d: any, c: any) => { d.ema12 = c; })
            .accessor((d: any) => d.ema12);

        const ema26 = ema()
            // @ts-ignore
            .id(2)
            .options({ windowSize: 26 })
            .merge((d: any, c: any) => { d.ema26 = c; })
            .accessor((d: any) => d.ema26);

        const calculatedData = ema26(ema12(initialData));

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
                    yExtents={[0, 100]}>
                    <XAxis ticks={6} />
                    <YAxis ticks={5} />

                    <LineSeries yAccessor={ema26.accessor()} stroke={ema26.stroke()} />
                    <LineSeries yAccessor={ema12.accessor()} stroke={ema12.stroke()} />

                    <MovingAverageTooltip
                        origin={[8, 0]}
                        options={[
                            {
                                yAccessor: ema26.accessor(),
                                type: "EMA",
                                stroke: ema26.stroke(),
                                windowSize: ema26.options().windowSize,
                            },
                            {
                                yAccessor: ema12.accessor(),
                                type: "EMA",
                                stroke: ema12.stroke(),
                                windowSize: ema12.options().windowSize,
                            },
                        ]}
                    />
                </Chart>
            </ChartCanvas>
        );
    }
}

export default withOHLCData()(withSize()(withDeviceRatio()(EMAIndicator)));
