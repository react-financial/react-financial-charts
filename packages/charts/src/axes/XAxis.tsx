import * as PropTypes from "prop-types";
import * as React from "react";
import { strokeDashTypes } from "../utils";
import Axis from "./Axis";

interface XAxisProps {
    readonly axisAt?: number | "top" | "bottom" | "middle";
    readonly className?: string;
    readonly domainClassName?: string;
    readonly fill?: string;
    readonly flexTicks?: boolean;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly getMouseDelta?: (startXY: [number, number], mouseXY: [number, number]) => number;
    readonly innerTickSize?: number;
    readonly onContextMenu?: any; // func
    readonly onDoubleClick?: any; // func
    readonly orient?: "top" | "bottom";
    readonly outerTickSize?: number;
    readonly showDomain?: boolean;
    readonly showTicks?: boolean;
    readonly showTickLabel?: boolean;
    readonly stroke?: string;
    readonly strokeOpacity?: number;
    readonly strokeWidth?: number;
    readonly tickFormat?: (data: any) => string;
    readonly tickPadding?: number;
    readonly tickSize?: number;
    readonly tickLabelFill?: string;
    readonly ticks?: number;
    readonly tickStroke?: string;
    readonly tickStrokeOpacity?: number;
    readonly tickStrokeWidth?: number;
    readonly tickStrokeDasharray?: strokeDashTypes;
    readonly tickValues?: number[];
    readonly xZoomHeight?: number;
    readonly zoomEnabled?: boolean;
    readonly zoomCursorClassName?: string;
}

export class XAxis extends React.Component<XAxisProps> {

    public static defaultProps = {
        axisAt: "bottom",
        className: "react-financial-charts-x-axis",
        domainClassName: "react-financial-charts-axis-domain",
        fill: "none",
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 12,
        fontWeight: 400,
        getMouseDelta: (startXY: [number, number], mouseXY: [number, number]) => startXY[0] - mouseXY[0],
        opacity: 1,
        orient: "bottom",
        outerTickSize: 0,
        innerTickSize: 5,
        showTicks: true,
        showTickLabel: true,
        showDomain: true,
        stroke: "#000000",
        strokeWidth: 1,
        strokeOpacity: 1,
        ticks: 10,
        tickPadding: 6,
        tickLabelFill: "#000000",
        tickStroke: "#000000",
        tickStrokeOpacity: 1,
        xZoomHeight: 25,
        zoomEnabled: true,
        zoomCursorClassName: "react-financial-charts-ew-resize-cursor",
    };

    public static contextTypes = {
        chartConfig: PropTypes.object.isRequired,
        xAxisZoom: PropTypes.func.isRequired,
    };

    public render() {
        const {
            getMouseDelta = XAxis.defaultProps.getMouseDelta,
            outerTickSize = XAxis.defaultProps.outerTickSize,
            stroke = XAxis.defaultProps.stroke,
            strokeWidth = XAxis.defaultProps.strokeWidth,
            zoomEnabled,
            ...rest
        } = this.props;

        const { ...moreProps } = this.helper(this.props, this.context);

        return (
            <Axis
                {...rest}
                {...moreProps}
                getMouseDelta={getMouseDelta}
                outerTickSize={outerTickSize}
                stroke={stroke}
                strokeWidth={strokeWidth}
                zoomEnabled={this.props.zoomEnabled && zoomEnabled}
                axisZoomCallback={this.axisZoomCallback} />
        );
    }

    private readonly axisZoomCallback = (newXDomain) => {
        const { xAxisZoom } = this.context;

        xAxisZoom(newXDomain);
    }

    private readonly helper = (props: XAxisProps, context) => {
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
            getScale: this.getXScale,
            bg: { x, y, h, w },
        };
    }

    private readonly getXScale = (moreProps) => {
        const { xScale: scale, width } = moreProps;

        if (scale.invert) {
            const trueRange = [0, width];
            const trueDomain = trueRange.map(scale.invert);
            return scale
                .copy()
                .domain(trueDomain)
                .range(trueRange);
        }

        return scale;
    }
}
