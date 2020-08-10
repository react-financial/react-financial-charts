import * as React from "react";
import {
    bollingerBand,
    BollingerSeries,
    BollingerBandTooltip,
    CandlestickSeries,
    discontinuousTimeScaleProviderBuilder,
    Chart,
    ChartCanvas,
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

class BollingerIndicator extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 40, top: 8, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { data: initialData, height, ratio, width } = this.props;

        const calculator = bollingerBand()
            .merge((d: any, c: any) => {
                d.bb = c;
            })
            .accessor((d: any) => d.bb);

        const calculatedData = calculator(initialData);

        const { data, xScale, xAccessor, displayXAccessor } = this.xScaleProvider(calculatedData);

        const start = xAccessor(data[data.length - 1]);
        const end = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [start, end];

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
                <Chart id={1} yExtents={this.yExtents}>
                    <XAxis />
                    <YAxis />

                    <CandlestickSeries />
                    <BollingerSeries />

                    <BollingerBandTooltip options={calculator.options()} />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yExtents = (data: any) => {
        return [data.bb.top, data.bb.bottom];
    };
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(BollingerIndicator)));
