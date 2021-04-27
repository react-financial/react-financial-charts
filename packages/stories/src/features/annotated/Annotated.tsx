import * as React from "react";
import {
    Annotate,
    ema,
    discontinuousTimeScaleProviderBuilder,
    CandlestickSeries,
    Chart,
    ChartCanvas,
    LabelAnnotation,
    SvgPathAnnotation,
    XAxis,
    YAxis,
    withDeviceRatio,
    withSize,
} from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps {
    readonly labelAnnotation?: boolean;
    readonly svgAnnotation?: boolean;
    readonly data: IOHLCData[];
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
}

class Annotated extends React.Component<ChartProps> {
    private readonly labelAnnotation = {
        text: "Monday",
        tooltip: "Go short",
        y: ({ yScale, datum }: any) => yScale(datum.high),
    };
    private readonly svgAnnotation = {
        fill: "#2196f3",
        path: () =>
            "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z",
        pathWidth: 12,
        pathHeight: 22,
        tooltip: "Svg Annotation",
        y: ({ yScale, datum }: any) => yScale(datum.high),
    };
    private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { data: initialData, height, ratio, width, labelAnnotation, svgAnnotation } = this.props;

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
                    <XAxis showGridLines />
                    <YAxis showGridLines />
                    <CandlestickSeries />
                    {labelAnnotation && (
                        <Annotate with={LabelAnnotation} usingProps={this.labelAnnotation} when={this.when} />
                    )}
                    {svgAnnotation && (
                        <Annotate with={SvgPathAnnotation} usingProps={this.svgAnnotation} when={this.when} />
                    )}
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly when = (data: IOHLCData) => {
        return data.date.getDay() === 1;
    };

    private readonly yExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(Annotated)));
