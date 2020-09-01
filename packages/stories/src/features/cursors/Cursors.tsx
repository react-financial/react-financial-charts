import * as React from "react";
import {
    discontinuousTimeScaleProviderBuilder,
    LineSeries,
    Chart,
    ChartCanvas,
    CrossHairCursor,
    XAxis,
    YAxis,
    withDeviceRatio,
    withSize,
    Cursor,
    CursorProps,
    CurrentCoordinate,
} from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps extends CursorProps {
    readonly crosshair?: boolean;
    readonly data: IOHLCData[];
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
}

class Cursors extends React.Component<ChartProps> {
    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    public render() {
        const { crosshair, data: initialData, height, ratio, width, ...rest } = this.props;

        const { margin, xScaleProvider } = this;

        const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(initialData);

        const max = xAccessor(data[data.length - 1]);
        const min = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [min, max];

        const { customX, ...cursorProps } = rest;

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
                    <CurrentCoordinate yAccessor={this.yAccessor} />
                    <LineSeries yAccessor={this.yAccessor} />
                    <XAxis ticks={6} />
                    <YAxis ticks={5} />
                </Chart>
                {crosshair && <CrossHairCursor />}
                {!crosshair && <Cursor {...cursorProps} />}
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

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(Cursors)));
