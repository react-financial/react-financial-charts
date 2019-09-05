import * as PropTypes from "prop-types";
import * as React from "react";
import Axis from "./Axis";

interface YAxisProps {
    readonly axisAt: number | "left" | "right" | "middle";
    readonly orient: "left" | "right";
    readonly innerTickSize?: number;
    readonly outerTickSize?: number;
    readonly tickFormat?: any; // func
    readonly tickPadding?: number;
    readonly tickSize?: number;
    readonly ticks?: number;
    readonly yZoomWidth?: number;
    readonly tickValues?: number[];
    readonly showTicks?: boolean;
    readonly className?: string;
    readonly zoomEnabled?: boolean;
    readonly onContextMenu?: any; // func
    readonly onDoubleClick?: any; // func
    readonly getMouseDelta?: (startXY: number[], mouseXY: number[]) => number;
}

export class YAxis extends React.Component<YAxisProps> {

    public static defaultProps = {
        showTicks: true,
        showTickLabel: true,
        showDomain: true,
        className: "react-stockcharts-y-axis",
        ticks: 10,
        outerTickSize: 0,
        domainClassName: "react-stockcharts-axis-domain",
        fill: "none",
        stroke: "#000000",
        strokeWidth: 1,
        opacity: 1,
        innerTickSize: 5,
        tickPadding: 6,
        tickStroke: "#000000",
        tickStrokeOpacity: 1,
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 12,
        fontWeight: 400,
        yZoomWidth: 40,
        zoomEnabled: true,
        getMouseDelta: (startXY, mouseXY) => startXY[1] - mouseXY[1],
    };

    public static contextTypes = {
        yAxisZoom: PropTypes.func.isRequired,
        chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        chartConfig: PropTypes.object.isRequired,
    };

    public render() {

        const {
            getMouseDelta = YAxis.defaultProps.getMouseDelta,
            ...rest
        } = this.props;

        const { zoomEnabled, ...moreProps } = helper(this.props, this.context);

        return (
            <Axis
                {...rest}
                {...moreProps}
                getMouseDelta
                zoomEnabled={this.props.zoomEnabled && zoomEnabled}
                edgeClip
                axisZoomCallback={this.axisZoomCallback}
                zoomCursorClassName="react-stockcharts-ns-resize-cursor" />
        );
    }

    private readonly axisZoomCallback = (newYDomain) => {
        const { chartId, yAxisZoom } = this.context;
        yAxisZoom(chartId, newYDomain);
    }
}

function helper(props: YAxisProps, context) {
    const {
        axisAt,
        yZoomWidth = YAxis.defaultProps.yZoomWidth,
        orient,
    } = props;
    const { chartConfig: { width, height } } = context;

    let axisLocation;
    const y = 0;
    const w = yZoomWidth;
    const h = height;

    if (axisAt === "left") {
        axisLocation = 0;
    } else if (axisAt === "right") {
        axisLocation = width;
    } else if (axisAt === "middle") {
        axisLocation = (width) / 2;
    } else {
        axisLocation = axisAt;
    }

    const x = (orient === "left") ? -yZoomWidth : 0;

    return {
        transform: [axisLocation, 0],
        range: [0, height],
        getScale: getYScale,
        bg: { x, y, h, w },
        zoomEnabled: context.chartConfig.yPan,
    };
}

function getYScale(moreProps) {
    const { yScale: scale, flipYScale, height } = moreProps.chartConfig;
    if (scale.invert) {
        const trueRange = flipYScale ? [0, height] : [height, 0];
        const trueDomain = trueRange.map(scale.invert);
        return scale.copy()
            .domain(trueDomain)
            .range(trueRange);
    }
    return scale;
}
