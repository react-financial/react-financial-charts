import { format } from "d3-format";
import * as React from "react";
import {
    atr,
    discontinuousTimeScaleProviderBuilder,
    Chart,
    ChartCanvas,
    LineSeries,
    SingleValueTooltip,
    XAxis,
    YAxis,
    withDeviceRatio,
    withSize,
} from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
}

class ATRIndicator extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { data: initialData, height, ratio, width } = this.props;

        const atr14 = atr()
            .options({ windowSize: 14 })
            .merge((d: any, c: any) => {
                d.atr14 = c;
            })
            .accessor((d: any) => d.atr14);

        const calculatedData = atr14(initialData);

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
                <Chart id={1} yExtents={atr14.accessor()}>
                    <XAxis ticks={6} />
                    <YAxis ticks={2} />

                    <LineSeries yAccessor={atr14.accessor()} strokeStyle={atr14.stroke()} />

                    <SingleValueTooltip
                        yAccessor={atr14.accessor()}
                        yLabel={`ATR (${atr14.options().windowSize})`}
                        yDisplayFormat={format(".2f")}
                        labelFill={atr14.stroke()}
                        origin={[8, 16]}
                    />
                </Chart>
            </ChartCanvas>
        );
    }
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(ATRIndicator)));
