import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { macd } from "react-financial-charts/lib/indicator";
import { discontinuousTimeScaleProviderBuilder } from "react-financial-charts/lib/scale";
import { MACDSeries } from "react-financial-charts/lib/series";
import { MACDTooltip } from "react-financial-charts/lib/tooltip";
import { withDeviceRatio } from "react-financial-charts/lib/utils";
import { IOHLCData, withOHLCData, withSize } from "../../data";

interface MACDIndicatorProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class MACDIndicator extends React.Component<MACDIndicatorProps> {

    private readonly macdAppearance = {
        stroke: {
            macd: "#FF0000",
            signal: "#00F300",
        },
        fill: {
            divergence: "#4682B4",
        },
    };
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

        const calculator = macd()
            // @ts-ignore
            .options({
                fast: 12,
                slow: 26,
                signal: 9,
            })
            .merge((d: any, c: any) => { d.macd = c; })
            .accessor((d: any) => d.macd);

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
                    yExtents={calculator.accessor()}>
                    <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        ticks={6} />
                    <YAxis
                        axisAt="right"
                        orient="right"
                        ticks={2} />

                    <MACDSeries
                        yAccessor={this.yAccessor}
                        {...this.macdAppearance} />

                    <MACDTooltip
                        origin={[8, 16]}
                        appearance={this.macdAppearance}
                        options={calculator.options()}
                        yAccessor={this.yAccessor} />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yAccessor = (data: any) => {
        return data.macd;
    }
}

export default withOHLCData()(withSize()(withDeviceRatio()(MACDIndicator)));
