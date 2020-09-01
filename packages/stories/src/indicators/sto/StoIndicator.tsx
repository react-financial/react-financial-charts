import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import * as React from "react";
import {
    Chart,
    ChartCanvas,
    CrossHairCursor,
    discontinuousTimeScaleProviderBuilder,
    MouseCoordinateX,
    MouseCoordinateY,
    stochasticOscillator,
    StochasticSeries,
    StochasticTooltip,
    withDeviceRatio,
    withSize,
    XAxis,
    YAxis,
} from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class StoIndicator extends React.Component<ChartProps> {
    private readonly displayFormat = format(".2f");
    private readonly timeDisplayFormat = timeFormat("%d %b");
    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { data: initialData, height, ratio, width } = this.props;

        const slowSTO = stochasticOscillator()
            .options({ windowSize: 14, kWindowSize: 3, dWindowSize: 3 })
            .merge((d: any, c: any) => {
                d.slowSTO = c;
            })
            .accessor((d: any) => d.slowSTO);
        const fastSTO = stochasticOscillator()
            .options({ windowSize: 14, kWindowSize: 1, dWindowSize: 3 })
            .merge((d: any, c: any) => {
                d.fastSTO = c;
            })
            .accessor((d: any) => d.fastSTO);
        const fullSTO = stochasticOscillator()
            .options({ windowSize: 14, kWindowSize: 3, dWindowSize: 4 })
            .merge((d: any, c: any) => {
                d.fullSTO = c;
            })
            .accessor((d: any) => d.fullSTO);

        const calculatedData = slowSTO(fastSTO(fullSTO(initialData)));

        const { margin, xScaleProvider } = this;

        const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData);

        const min = xAccessor(data[data.length - 1]);
        const max = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [min, max];

        const gridHeight = height - margin.top - margin.bottom;

        const stoHeight = gridHeight / 3;

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
                <Chart id={1} height={stoHeight} origin={(_, h) => [0, h - 3 * stoHeight]} yExtents={[0, 100]}>
                    <XAxis axisAt="bottom" orient="bottom" showGridLines showTickLabel={false} outerTickSize={0} />
                    <YAxis axisAt="right" orient="right" tickValues={[20, 50, 80]} />
                    <MouseCoordinateY rectWidth={this.margin.right} displayFormat={this.displayFormat} />
                    <StochasticSeries yAccessor={(d) => d.slowSTO} />
                    <StochasticTooltip
                        origin={[8, 16]}
                        yAccessor={(d) => d.slowSTO}
                        options={slowSTO.options()}
                        appearance={{ stroke: StochasticSeries.defaultProps.strokeStyle }}
                        label="Slow STO"
                    />
                </Chart>
                <Chart id={2} height={stoHeight} origin={(_, h) => [0, h - 2 * stoHeight]} yExtents={[0, 100]}>
                    <XAxis axisAt="bottom" orient="bottom" showGridLines showTickLabel={false} outerTickSize={0} />
                    <YAxis axisAt="right" orient="right" tickValues={[20, 50, 80]} />
                    <MouseCoordinateY rectWidth={this.margin.right} displayFormat={this.displayFormat} />
                    <StochasticSeries yAccessor={(d) => d.fastSTO} />
                    <StochasticTooltip
                        origin={[8, 16]}
                        yAccessor={(d) => d.slowSTO}
                        options={slowSTO.options()}
                        appearance={{ stroke: StochasticSeries.defaultProps.strokeStyle }}
                        label="Fast STO"
                    />
                </Chart>
                <Chart id={3} height={stoHeight} origin={(_, h) => [0, h - stoHeight]} yExtents={[0, 100]}>
                    <XAxis axisAt="bottom" orient="bottom" showGridLines />
                    <YAxis axisAt="right" orient="right" tickValues={[20, 50, 80]} />
                    <MouseCoordinateX displayFormat={this.timeDisplayFormat} />
                    <MouseCoordinateY rectWidth={this.margin.right} displayFormat={this.displayFormat} />
                    <StochasticSeries yAccessor={(d) => d.fullSTO} />
                    <StochasticTooltip
                        origin={[8, 16]}
                        yAccessor={(d) => d.slowSTO}
                        options={slowSTO.options()}
                        appearance={{ stroke: StochasticSeries.defaultProps.strokeStyle }}
                        label="Full STO"
                    />
                </Chart>
                <CrossHairCursor />
            </ChartCanvas>
        );
    }
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(StoIndicator)));
