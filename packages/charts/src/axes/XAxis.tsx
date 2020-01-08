import * as PropTypes from "prop-types";
import * as React from "react";
import { strokeDashTypes } from "../utils";
import Axis from "./Axis";

interface XAxisProps {
    readonly axisAt?: number | "top" | "bottom" | "middle";
    readonly className?: string;
    readonly domainClassName?: string;
    readonly fill?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly getMouseDelta?: (startXY: [number, number], mouseXY: [number, number]) => number;
    readonly gridLinesStroke?: string;
    readonly gridLinesStrokeWidth?: number;
    readonly gridLinesStrokeDasharray?: strokeDashTypes;
    readonly innerTickSize?: number;
    readonly onContextMenu?: any; // func
    readonly onDoubleClick?: any; // func
    readonly orient?: "top" | "bottom";
    readonly outerTickSize?: number;
    readonly showDomain?: boolean;
    readonly showGridLines?: boolean;
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
        gridLinesStroke: "#E2E4EC",
        gridLinesStrokeWidth: 1,
        opacity: 1,
        orient: "bottom",
        outerTickSize: 0,
        innerTickSize: 4,
        showDomain: true,
        showGridLines: false,
        showTicks: true,
        showTickLabel: true,
        stroke: "#000000",
        strokeWidth: 1,
        strokeOpacity: 1,
        tickPadding: 4,
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
            showTicks,
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
                showTicks={showTicks}
                stroke={stroke}
                strokeWidth={strokeWidth}
                zoomEnabled={zoomEnabled && showTicks}
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
            ticks,
        } = props;
        const { chartConfig: { width, height } } = context;

        let axisLocation;
        const x = 0;
        const w = width;
        const h = xZoomHeight;

        switch (axisAt) {
            case "top":
                axisLocation = 0;
                break;
            case "bottom":
                axisLocation = height;
                break;
            case "middle":
                axisLocation = (height) / 2;
                break;
            default:
                axisLocation = axisAt;
        }

        const y = (orient === "top") ? -xZoomHeight : 0;

        return {
            transform: [0, axisLocation],
            range: [0, width],
            getScale: this.getXScale,
            bg: { x, y, h, w },
            ticks: ticks ?? this.getXTicks(width),
        };
    }

    private readonly getXTicks = (width: number) => {

        if (width < 400) {
            return 2;
        }

        if (width < 500) {
            return 6;
        }

        return 8;
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
