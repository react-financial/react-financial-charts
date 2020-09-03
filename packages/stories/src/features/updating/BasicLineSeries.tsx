import { scaleTime } from "d3-scale";
import * as React from "react";
import {
    CandlestickSeries,
    Chart,
    ChartCanvas,
    CrossHairCursor,
    timeFormat,
    withDeviceRatio,
    withSize,
    XAxis,
    YAxis,
} from "react-financial-charts";
import { IOHLCData, withUpdatingData, withOHLCData } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class BasicLineSeries extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 56, top: 0, bottom: 24 };
    private readonly padding = { left: 0, right: 32, top: 0, bottom: 0 };

    public render() {
        const { data, height, ratio, width } = this.props;

        const xScale = scaleTime();
        const xAccessor = (d: IOHLCData) => d.date;

        return (
            <ChartCanvas
                height={height}
                ratio={ratio}
                width={width}
                margin={this.margin}
                padding={this.padding}
                data={data}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
            >
                <Chart id={1} yExtentsCalculator={this.yExtentsCalculator}>
                    <CandlestickSeries />
                    <XAxis tickFormat={timeFormat} />
                    <YAxis />
                </Chart>
                <CrossHairCursor snapX={false} />
            </ChartCanvas>
        );
    }

    private readonly yExtentsCalculator = ({ plotData }: { plotData: IOHLCData[] }) => {
        let min: number | undefined;
        let max: number | undefined;
        for (const { low, high } of plotData) {
            if (min === undefined) {
                min = low;
            }
            if (max === undefined) {
                max = high;
            }

            if (low !== undefined) {
                if (min! > low) {
                    min = low;
                }
            }

            if (high !== undefined) {
                if (max! < high) {
                    max = high;
                }
            }
        }

        if (min === undefined) {
            min = 0;
        }

        if (max === undefined) {
            max = 0;
        }

        const padding = (max - min) * 0.1;

        return [min - padding, max + padding * 2];
    };
}

export const Updating = withOHLCData("SECONDS")(
    withUpdatingData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(BasicLineSeries))),
);
