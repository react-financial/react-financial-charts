import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { CrossHairCursor, EdgeIndicator, MouseCoordinateX, MouseCoordinateY } from "react-financial-charts/lib/coordinates";
import { discontinuousTimeScaleProviderBuilder } from "react-financial-charts/lib/scale";
import { BarSeries, CandlestickSeries } from "react-financial-charts/lib/series";
import { OHLCTooltip } from "react-financial-charts/lib/tooltip";
import { withDeviceRatio } from "react-financial-charts/lib/utils";
import { IOHLCData, withOHLCData, withSize } from "../../data";

interface StockChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class StockChart extends React.Component<StockChartProps> {

    private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };
    private readonly pricesDisplayFormat = format(".2f");
    private readonly timeDisplayFormat = timeFormat("%d %b");
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder()
        .inputDateAccessor((d: IOHLCData) => d.date);

    public render() {

        const {
            data: initialData,
            height,
            ratio,
            width,
        } = this.props;

        const { margin, xScaleProvider } = this;

        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(initialData);

        const start = xAccessor(data[data.length - 1]);
        const end = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [start, end];

        const gridWidth = width - margin.left - margin.right;
        const gridHeight = height - margin.top - margin.bottom;
        const barChartHeight = gridHeight / 2;
        const barChartOrigin = (_: number, h: number) => [0, h - (gridHeight / 2)];

        return (
            <ChartCanvas
                height={height}
                ratio={ratio}
                width={width}
                margin={margin}
                type="hybrid"
                data={data}
                displayXAccessor={displayXAccessor}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}>
                <Chart
                    id={1}
                    yExtents={this.candleChartExtents}>
                    <XAxis
                        innerTickSize={-1 * gridHeight}
                        axisAt="bottom"
                        orient="bottom"
                        tickStroke="#e0e3eb"
                        ticks={6} />
                    <YAxis
                        innerTickSize={-1 * gridWidth}
                        axisAt="right"
                        orient="right"
                        tickFormat={this.pricesDisplayFormat}
                        tickStroke="#e0e3eb"
                        ticks={5} />
                    <OHLCTooltip origin={[8, 16]} />
                </Chart>
                <Chart
                    id={2}
                    height={barChartHeight}
                    origin={barChartOrigin}
                    yExtents={this.barChartExtents}>
                    <BarSeries
                        fill={this.openCloseColor}
                        yAccessor={this.yBarSeries} />
                </Chart>
                <Chart
                    id={3}
                    yExtents={this.candleChartExtents}>
                    <CandlestickSeries />
                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={this.timeDisplayFormat} />
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={this.pricesDisplayFormat} />
                    <EdgeIndicator
                        itemType="last"
                        orient="right"
                        edgeAt="right"
                        fill={this.openCloseColor}
                        lineStroke={this.openCloseColor}
                        displayFormat={this.pricesDisplayFormat}
                        yAccessor={this.yEdgeIndicator} />
                </Chart>
                <CrossHairCursor />
            </ChartCanvas>
        );
    }

    private readonly barChartExtents = (data: IOHLCData) => {
        return data.volume;
    }

    private readonly candleChartExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    }

    private readonly yBarSeries = (data: IOHLCData) => {
        return data.volume;
    }

    private readonly yEdgeIndicator = (data: IOHLCData) => {
        return data.close;
    }

    private readonly openCloseColor = (data: IOHLCData) => {
        return data.close > data.open ? "#26a69a" : "#ef5350";
    }
}

export default withOHLCData()(withSize()(withDeviceRatio()(StockChart)));
