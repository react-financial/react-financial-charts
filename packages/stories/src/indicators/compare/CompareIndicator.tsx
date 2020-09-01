import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import * as React from "react";
import {
    Chart,
    ChartCanvas,
    CrossHairCursor,
    discontinuousTimeScaleProviderBuilder,
    compare,
    LineSeries,
    MouseCoordinateX,
    MouseCoordinateY,
    EdgeIndicator,
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
    readonly width: number;
    readonly ratio: number;
}

class CompareIndicator extends React.Component<ChartProps> {
    private readonly percentFormat = format(".0%");
    private readonly timeDisplayFormat = timeFormat("%d %b");
    private readonly margin = { left: 0, right: 40, top: 8, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { data: initialData, height, ratio, width } = this.props;

        const compareCalculator = compare()
            .options({
                basePath: "close",
                mainKeys: ["open", "high", "low", "close"],
                compareKeys: ["AAPLClose", "SP500Close", "GEClose"],
            })
            .accessor((d: any) => d.compare)
            .merge((d: any, c: any) => {
                d.compare = c;
            });

        const { data, xScale, xAccessor, displayXAccessor } = this.xScaleProvider(initialData);

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
                postCalculator={compareCalculator}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}
            >
                <Chart id={1} yExtents={this.yExtents}>
                    <XAxis />
                    <YAxis tickFormat={this.percentFormat} />
                    <MouseCoordinateX displayFormat={this.timeDisplayFormat} />
                    <MouseCoordinateY rectWidth={this.margin.right} displayFormat={this.percentFormat} />

                    <LineSeries yAccessor={(d) => d.compare.AAPLClose} strokeStyle="#ff7f0e" />
                    <LineSeries yAccessor={(d) => d.compare.SP500Close} strokeStyle="#2ca02c" />
                    <LineSeries yAccessor={(d) => d.compare.GEClose} strokeStyle="#2196f3" />

                    <EdgeIndicator
                        itemType="last"
                        orient="right"
                        edgeAt="right"
                        yAccessor={(d) => d.compare.AAPLClose}
                        fill="#ff7f0e"
                        lineStroke="#ff7f0e"
                        displayFormat={this.percentFormat}
                    />
                    <EdgeIndicator
                        itemType="last"
                        orient="right"
                        edgeAt="right"
                        yAccessor={(d) => d.compare.SP500Close}
                        fill="#2ca02c"
                        lineStroke="#2ca02c"
                        displayFormat={this.percentFormat}
                    />
                    <EdgeIndicator
                        itemType="last"
                        orient="right"
                        edgeAt="right"
                        fill="#2196f3"
                        lineStroke="#2196f3"
                        yAccessor={(d) => d.compare.GEClose}
                        displayFormat={this.percentFormat}
                    />

                    <SingleValueTooltip
                        yAccessor={(d) => d.AAPLClose}
                        yLabel="AAPL"
                        yDisplayFormat={format(".2f")}
                        valueFill="#ff7f0e"
                        origin={[8, 16]}
                    />
                    <SingleValueTooltip
                        yAccessor={(d) => d.SP500Close}
                        yLabel="S&P 500"
                        yDisplayFormat={format(".2f")}
                        valueFill="#2ca02c"
                        origin={[8, 32]}
                    />
                    <SingleValueTooltip
                        yAccessor={(d) => d.GEClose}
                        yLabel="GE"
                        yDisplayFormat={format(".2f")}
                        origin={[8, 48]}
                    />
                </Chart>
                <CrossHairCursor />
            </ChartCanvas>
        );
    }

    private readonly yExtents = (data: any) => {
        return data.compare;
    };
}

export default withOHLCData("comparison")(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(CompareIndicator)));
