import * as React from "react";
import { Chart, ChartCanvas } from "@react-financial-charts/core";
import { XAxis, YAxis } from "@react-financial-charts/axes";
import { ema } from "@react-financial-charts/indicators";
import { discontinuousTimeScaleProviderBuilder } from "@react-financial-charts/scales";
import { LineSeries } from "@react-financial-charts/series";
import { MovingAverageTooltip } from "@react-financial-charts/tooltip";
import { IOHLCData, withOHLCData } from "../../data";
import { withDeviceRatio, withSize } from "@react-financial-charts/utils";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class EMAIndicator extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 40, top: 8, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { data: initialData, height, ratio, width } = this.props;

        const ema12 = ema()
            .id(1)
            .options({ windowSize: 12 })
            .merge((d: any, c: any) => {
                d.ema12 = c;
            })
            .accessor((d: any) => d.ema12);

        const ema26 = ema()
            .id(2)
            .options({ windowSize: 26 })
            .merge((d: any, c: any) => {
                d.ema26 = c;
            })
            .accessor((d: any) => d.ema26);

        const calculatedData = ema26(ema12(initialData));

        const { data, xScale, xAccessor, displayXAccessor } = this.xScaleProvider(calculatedData);

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
                <Chart id={1} yExtents={[0, 100]}>
                    <XAxis ticks={6} />
                    <YAxis ticks={5} />

                    <LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()} />
                    <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()} />

                    <MovingAverageTooltip
                        origin={[8, 0]}
                        options={[
                            {
                                stroke: ema26.stroke(),
                                type: "EMA",
                                windowSize: ema26.options().windowSize,
                                yAccessor: ema26.accessor(),
                            },
                            {
                                stroke: ema12.stroke(),
                                type: "EMA",
                                windowSize: ema12.options().windowSize,
                                yAccessor: ema12.accessor(),
                            },
                        ]}
                    />
                </Chart>
            </ChartCanvas>
        );
    }
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(EMAIndicator)));
