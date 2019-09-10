import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { rsi } from "react-financial-charts/lib/indicator";
import { discontinuousTimeScaleProviderBuilder } from "react-financial-charts/lib/scale";
import { RSISeries } from "react-financial-charts/lib/series";
import { RSITooltip } from "react-financial-charts/lib/tooltip";
import { withDeviceRatio } from "react-financial-charts/lib/utils";
import { IOHLCData, withOHLCData, withSize } from "../../data";

interface RSIIndicatorProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class RSIIndicator extends React.Component<RSIIndicatorProps> {

    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder()
        .inputDateAccessor((d: IOHLCData) => d.date);

    public render() {

        const {
            data: initialData,
            height,
            ratio,
            width,
        } = this.props;

        const calculator = rsi()
            // @ts-ignore
            .options({ windowSize: 14 })
            .merge((d: any, c: any) => { d.rsi = c; })
            .accessor((d: any) => d.rsi);

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
                    yExtents={[0, 100]}>
                    <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        ticks={6} />
                    <YAxis
                        axisAt="right"
                        orient="right"
                        tickValues={[30, 50, 70]} />

                    <RSISeries yAccessor={(d: any) => d.rsi} />

                    <RSITooltip
                        origin={[8, 16]}
                        yAccessor={(d: any) => d.rsi}
                        options={calculator.options()} />
                </Chart>
            </ChartCanvas>
        );
    }
}

export default withOHLCData()(withSize()(withDeviceRatio()(RSIIndicator)));
