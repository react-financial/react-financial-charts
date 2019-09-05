import * as PropTypes from "prop-types";
import * as React from "react";
import Axis from "./Axis";

interface XAxisProps {
    readonly axisAt: number | "top" | "bottom" | "middle";
    readonly orient: "top" | "bottom";
    readonly innerTickSize?: number;
    readonly outerTickSize?: number;
    readonly tickFormat?: any; // func
    readonly tickPadding?: number;
    readonly tickSize?: number;
    readonly ticks?: number;
    readonly tickValues?: number[];
    readonly showTicks?: boolean;
    readonly className?: string;
    readonly zoomEnabled?: boolean;
    readonly onContextMenu?: any; // func
    readonly onDoubleClick?: any; // func
    readonly getMouseDelta?: (startXY: number[], mouseXY: number[]) => number;
    readonly xZoomHeight?: number;
}

export class XAxis extends React.Component<XAxisProps> {

    public static defaultProps = {
        showTicks: true,
        showTickLabel: true,
        showDomain: true,
        className: "react-stockcharts-x-axis",
        ticks: 10,
        outerTickSize: 0,
        fill: "none",
        stroke: "#000000",
        strokeWidth: 1,
        opacity: 1,
        domainClassName: "react-stockcharts-axis-domain",
        innerTickSize: 5,
        tickPadding: 6,
        tickStroke: "#000000",
        tickStrokeOpacity: 1,
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 12,
        fontWeight: 400,
        xZoomHeight: 25,
        zoomEnabled: true,
        getMouseDelta: (startXY, mouseXY) => startXY[0] - mouseXY[0],
    };

    public static contextTypes = {
        chartConfig: PropTypes.object.isRequired,
        xAxisZoom: PropTypes.func.isRequired,
    };

    public render() {
        const {
            getMouseDelta = XAxis.defaultProps.getMouseDelta,
            zoomEnabled,
            ...rest
        } = this.props;

        const { ...moreProps } = helper(this.props, this.context);

        return (
            <Axis
                {...rest}
                {...moreProps}
                getMouseDelta
                zoomEnabled={this.props.zoomEnabled && zoomEnabled}
                axisZoomCallback={this.axisZoomCallback}
                zoomCursorClassName="react-stockcharts-ew-resize-cursor" />
        );
    }

    private readonly axisZoomCallback = (newXDomain) => {
        const { xAxisZoom } = this.context;

        xAxisZoom(newXDomain);
    }
}

function helper(props: XAxisProps, context) {
    const {
        axisAt,
        xZoomHeight = XAxis.defaultProps.xZoomHeight,
        orient,
    } = props;
    const { chartConfig: { width, height } } = context;

    let axisLocation;
    const x = 0;
    const w = width;
    const h = xZoomHeight;

    if (axisAt === "top") {
        axisLocation = 0;
    } else if (axisAt === "bottom") {
        axisLocation = height;
    } else if (axisAt === "middle") {
        axisLocation = (height) / 2;
    } else {
        axisLocation = axisAt;
    }

    const y = (orient === "top") ? -xZoomHeight : 0;

    return {
        transform: [0, axisLocation],
        range: [0, width],
        getScale: getXScale,
        bg: { x, y, h, w },
    };
}

function getXScale(moreProps) {
    const { xScale: scale, width } = moreProps;

    if (scale.invert) {
        const trueRange = [0, width];
        const trueDomain = trueRange.map(scale.invert);
        return scale.copy()
            .domain(trueDomain)
            .range(trueRange);
    }

    return scale;
}
