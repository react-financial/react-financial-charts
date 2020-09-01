import { format } from "d3-format";
import * as React from "react";
import {
    discontinuousTimeScaleProviderBuilder,
    CandlestickSeries,
    Chart,
    ChartCanvas,
    MouseCoordinateY,
    XAxis,
    YAxis,
    withDeviceRatio,
    withSize,
} from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps {
    readonly arrowWidth?: number;
    readonly data: IOHLCData[];
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
}

class Coordinates extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );
    private readonly pricesDisplayFormat = format(".2f");

    public render() {
        const { arrowWidth, data: initialData, height, ratio, width } = this.props;

        const { margin, xScaleProvider } = this;

        const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(initialData);

        const max = xAccessor(data[data.length - 1]);
        const min = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [min, max];

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
                xExtents={xExtents}
            >
                <Chart id={1} yExtents={this.yExtents}>
                    <CandlestickSeries />
                    <MouseCoordinateY arrowWidth={arrowWidth} displayFormat={this.pricesDisplayFormat} />
                    <XAxis ticks={6} />
                    <YAxis ticks={5} />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(Coordinates)));
