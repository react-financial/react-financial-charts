import * as React from "react";
import {
    discontinuousTimeScaleProviderBuilder,
    CandlestickSeries,
    Chart,
    ChartCanvas,
    XAxis,
    YAxis,
    withDeviceRatio,
    withSize,
    IZoomAnchorOptions,
} from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps {
    readonly clamp?: boolean;
    readonly data: IOHLCData[];
    readonly disableInteraction?: boolean;
    readonly disablePan?: boolean;
    readonly disableZoom?: boolean;
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
    readonly zoomAnchor?: (options: IZoomAnchorOptions<any>) => number | Date;
}

class Interaction extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const {
            clamp,
            data: initialData,
            disablePan = false,
            disableZoom = false,
            disableInteraction,
            height,
            ratio,
            width,
            zoomAnchor,
        } = this.props;

        const { margin, xScaleProvider } = this;

        const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(initialData);

        const max = xAccessor(data[data.length - 1]);
        const min = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [min, max];

        return (
            <ChartCanvas
                clamp={clamp}
                height={height}
                ratio={ratio}
                width={width}
                margin={margin}
                data={data}
                disableInteraction={disableInteraction}
                disablePan={disablePan}
                disableZoom={disableZoom}
                displayXAccessor={displayXAccessor}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}
                zoomAnchor={zoomAnchor}
            >
                <Chart id={1} yExtents={this.yExtents}>
                    <CandlestickSeries />
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

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(Interaction)));
