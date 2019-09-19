import { format } from "d3-format";
import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { ema, forceIndex } from "react-financial-charts/lib/indicator";
import { discontinuousTimeScaleProviderBuilder } from "react-financial-charts/lib/scale";
import {
    LineSeries,
    StraightLine,
} from "react-financial-charts/lib/series";
import {
    SingleValueTooltip,
} from "react-financial-charts/lib/tooltip";
import { withDeviceRatio } from "react-financial-charts/lib/utils";
import { IOHLCData, withOHLCData, withSize } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class ForceIndicator extends React.Component<ChartProps> {

    private readonly margin = { left: 0, right: 48, top: 8, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder()
        .inputDateAccessor((d: IOHLCData) => d.date);

    public render() {

        const {
            data: initialData,
            height,
            ratio,
            width,
        } = this.props;

        const fi = forceIndex()
            // @ts-ignore
            .merge((d: any, c: any) => { d.fi = c; })
            .accessor((d: any) => d.fi);

        const fiEMA13 = ema()
            // @ts-ignore
            .id(1)
            .options({ windowSize: 13, sourcePath: "fi" })
            .merge((d: any, c: any) => { d.fiEMA13 = c; })
            .accessor((d: any) => d.fiEMA13);

        const calculatedData = fiEMA13(fi(initialData));

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
                    yExtents={fiEMA13.accessor()}>
                    <XAxis ticks={6} />
                    <YAxis ticks={4} tickFormat={format(".2s")} />

                    <LineSeries yAccessor={fiEMA13.accessor()} />
                    <StraightLine yValue={0} strokeDasharray="ShortDash2" />

                    <SingleValueTooltip
                        yAccessor={fiEMA13.accessor()}
                        yLabel="ForceIndex (13)"
                        yDisplayFormat={format(".4s")}
                        origin={[8, 8]}
                    />
                </Chart>
            </ChartCanvas>
        );
    }
}

export default withOHLCData()(withSize()(withDeviceRatio()(ForceIndicator)));
