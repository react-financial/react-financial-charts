import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import * as React from "react";
import {
    ema,
    discontinuousTimeScaleProviderBuilder,
    CandlestickSeries,
    LineSeries,
    Chart,
    ChartCanvas,
    XAxis,
    YAxis,
    OHLCTooltip,
    HoverTooltip,
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

class Tooltips extends React.Component<ChartProps> {
    private readonly dateFormat = timeFormat("%Y-%m-%d");
    private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };
    private readonly numberFormat = format(".2f");
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

        const calculatedData = ema12(initialData);

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
                <Chart id={1} yExtents={this.yExtents}>
                    <XAxis />
                    <YAxis />
                    <CandlestickSeries />
                    <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()} />

                    <OHLCTooltip origin={[8, 16]} textFill={(d) => (d.close > d.open ? "#26a69a" : "#ef5350")} />
                    <HoverTooltip
                        yAccessor={ema12.accessor()}
                        tooltip={{
                            content: ({ currentItem, xAccessor }) => ({
                                x: this.dateFormat(xAccessor(currentItem)),
                                y: [
                                    {
                                        label: "open",
                                        value: currentItem.open && this.numberFormat(currentItem.open),
                                    },
                                    {
                                        label: "high",
                                        value: currentItem.high && this.numberFormat(currentItem.high),
                                    },
                                    {
                                        label: "low",
                                        value: currentItem.low && this.numberFormat(currentItem.low),
                                    },
                                    {
                                        label: "close",
                                        value: currentItem.close && this.numberFormat(currentItem.close),
                                    },
                                ],
                            }),
                        }}
                    />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(Tooltips)));
