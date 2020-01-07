import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { rsi } from "react-financial-charts/lib/indicator";
import { discontinuousTimeScaleProviderBuilder } from "react-financial-charts/lib/scale";
import { RSISeries } from "react-financial-charts/lib/series";
import { RSITooltip } from "react-financial-charts/lib/tooltip";
import { withDeviceRatio } from "react-financial-charts/lib/utils";
import { IOHLCData, withOHLCData, withSize } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class RSIIndicator extends React.Component<ChartProps> {

    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder()
        .inputDateAccessor((d: IOHLCData) => d.date);

    private readonly rsiCalculator = rsi()
        .options({ windowSize: 14 })
        .merge((d: any, c: any) => { d.rsi = c; })
        .accessor((d: any) => d.rsi);

    public render() {

        const {
            data: initialData,
            height,
            ratio,
            width,
        } = this.props;

        const calculatedData = this.rsiCalculator(initialData);

        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = this.xScaleProvider(calculatedData);

        const start = xAccessor(data[data.length - 1]);
        const end = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [start, end];

        const yAccessor = this.rsiCalculator.accessor();

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
                    yExtents={[0, 100]}>
                    <XAxis />
                    <YAxis tickValues={[30, 50, 70]} />

                    <RSISeries yAccessor={yAccessor} />

                    <RSITooltip
                        origin={[8, 16]}
                        yAccessor={yAccessor}
                        options={this.rsiCalculator.options()} />
                </Chart>
            </ChartCanvas>
        );
    }
}

export default withOHLCData()(withSize()(withDeviceRatio()(RSIIndicator)));
