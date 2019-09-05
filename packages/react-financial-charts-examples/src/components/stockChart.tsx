// @ts-ignore
import { format } from "d3-format";
import { scaleTime } from "d3-scale";
import { timeFormat } from "d3-time-format";
import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { CrossHairCursor, EdgeIndicator, MouseCoordinateX, MouseCoordinateY } from "react-financial-charts/lib/coordinates";
import { CandlestickSeries } from "react-financial-charts/lib/series";
import { last } from "react-financial-charts/lib/utils";
import { IOHLCData } from "../stores";
import withDimensions from "./withDimensions";

interface StockChartProps {
    readonly data: any[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class StockChart extends React.Component<StockChartProps> {
    public render() {

        const {
            data,
            height,
            ratio,
            width,
        } = this.props;

        const xAccessor = (d: IOHLCData) => d.time;

        const start = xAccessor(last(data));
        const end = xAccessor(data[0]);
        const xExtents = [start, end];

        const yExtents = [(d: IOHLCData) => [d.high, d.low]];

        return (
            <ChartCanvas
                height={height}
                ratio={ratio}
                width={width}
                margin={{ left: 32, right: 70, top: 32, bottom: 32 }}
                type="hybrid"
                data={data}
                displayXAccessor={xAccessor}
                seriesName="Data"
                xScale={scaleTime()}
                xAccessor={xAccessor}
                xExtents={xExtents}>
                <Chart id={1} yExtents={yExtents}>
                    <XAxis axisAt="bottom" orient="bottom" ticks={6} />
                    <YAxis axisAt="right" orient="right" ticks={5} />
                    <CandlestickSeries width={8} />
                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%H:%M")} />
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".5f")} />
                    <EdgeIndicator
                        itemType="last"
                        orient="right"
                        edgeAt="right"
                        displayFormat={format(".5f")}
                        yAccessor={(d: IOHLCData) => d.close} />
                    <CrossHairCursor />
                </Chart>
            </ChartCanvas>
        );
    }
}

export default withDimensions(StockChart);
