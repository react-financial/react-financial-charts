import { max } from "d3-array";
import { scaleLinear } from "d3-scale";
import * as React from "react";
import { Chart, ChartCanvas } from "@react-financial-charts/core";
import { XAxis, YAxis } from "@react-financial-charts/axes";
import { discontinuousTimeScaleProviderBuilder } from "@react-financial-charts/scales";
import { ScatterSeries, CircleMarker } from "@react-financial-charts/series";
import { withDeviceRatio, withSize } from "@react-financial-charts/utils";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class BasicScatterSeries extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { data: initialData, height, ratio, width } = this.props;

        const { data, xScale, xAccessor, displayXAccessor } = this.xScaleProvider(initialData);

        const maxX = xAccessor(data[data.length - 1]);
        const minX = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [minX, maxX];

        const maximium = max<IOHLCData, number>(data, (d) => d.volume);

        const radiusScale = scaleLinear().range([1, 40]).domain([0, maximium!]);

        const radius = (d: IOHLCData) => radiusScale(d.volume);

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
                    <ScatterSeries yAccessor={this.yAccessor} marker={CircleMarker} markerProps={{ r: radius }} />
                    <XAxis />
                    <YAxis />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yAccessor = (data: IOHLCData) => {
        return data.close;
    };

    private readonly yExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };
}

export default withOHLCData("MINUTES")(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(BasicScatterSeries)));
