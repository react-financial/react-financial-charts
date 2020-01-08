import * as PropTypes from "prop-types";
import * as React from "react";
import { strokeDashTypes } from "../utils";
import Axis from "./Axis";

interface YAxisProps {
    readonly axisAt?: number | "left" | "right" | "middle";
    readonly className?: string;
    readonly domainClassName?: string;
    readonly fill?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly getMouseDelta?: (startXY: number[], mouseXY: number[]) => number;
    readonly gridLinesStroke?: string;
    readonly gridLinesStrokeWidth?: number;
    readonly gridLinesStrokeDasharray?: strokeDashTypes;
    readonly innerTickSize?: number;
    readonly onContextMenu?: any; // func
    readonly onDoubleClick?: any; // func
    readonly orient?: "left" | "right";
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
    readonly yZoomWidth?: number;
    readonly zoomEnabled?: boolean;
    readonly zoomCursorClassName?: string;
}

export class YAxis extends React.Component<YAxisProps> {

    public static defaultProps = {
        axisAt: "right",
        className: "react-financial-charts-y-axis",
        domainClassName: "react-financial-charts-axis-domain",
        fill: "none",
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 12,
        fontWeight: 400,
        getMouseDelta: (startXY, mouseXY) => startXY[1] - mouseXY[1],
        gridLinesStroke: "#E2E4EC",
        gridLinesStrokeWidth: 1,
        innerTickSize: 4,
        outerTickSize: 0,
        opacity: 1,
        orient: "right",
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
        yZoomWidth: 40,
        zoomEnabled: true,
        zoomCursorClassName: "react-financial-charts-ns-resize-cursor",
    };

    public static contextTypes = {
        yAxisZoom: PropTypes.func.isRequired,
        chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        chartConfig: PropTypes.object.isRequired,
    };

    public render() {

        const {
            getMouseDelta = YAxis.defaultProps.getMouseDelta,
            outerTickSize = YAxis.defaultProps.outerTickSize,
            stroke = YAxis.defaultProps.stroke,
            strokeWidth = YAxis.defaultProps.strokeWidth,
            ...rest
        } = this.props;

        const { zoomEnabled, ...moreProps } = this.helper(this.props, this.context);

        return (
            <Axis
                {...rest}
                {...moreProps}
                edgeClip
                getMouseDelta={getMouseDelta}
                outerTickSize={outerTickSize}
                stroke={stroke}
                strokeWidth={strokeWidth}
                zoomEnabled={this.props.zoomEnabled && zoomEnabled}
                axisZoomCallback={this.axisZoomCallback} />
        );
    }

    private readonly axisZoomCallback = (newYDomain) => {
        const { chartId, yAxisZoom } = this.context;
        yAxisZoom(chartId, newYDomain);
    }

    private readonly helper = (props: YAxisProps, context) => {
        const {
            axisAt,
            ticks,
            yZoomWidth = YAxis.defaultProps.yZoomWidth,
            orient,
        } = props;
        const { chartConfig: { width, height } } = context;

        let axisLocation;
        const y = 0;
        const w = yZoomWidth;
        const h = height;

        switch (axisAt) {
            case "left":
                axisLocation = 0;
                break;
            case "right":
                axisLocation = width;
                break;
            case "middle":
                axisLocation = (width) / 2;
                break;
            default:
                axisLocation = axisAt;
        }

        const x = (orient === "left") ? -yZoomWidth : 0;

        return {
            transform: [axisLocation, 0],
            range: [0, height],
            getScale: this.getYScale,
            bg: { x, y, h, w },
            ticks: ticks ?? this.getYTicks(height),
            zoomEnabled: context.chartConfig.yPan,
        };
    }

    private readonly getYTicks = (height: number) => {

        if (height < 300) {
            return 2;
        }

        if (height < 500) {
            return 6;
        }

        return 8;
    }

    private readonly getYScale = (moreProps) => {
        const { yScale: scale, flipYScale, height } = moreProps.chartConfig;
        if (scale.invert) {
            const trueRange = flipYScale ? [0, height] : [height, 0];
            const trueDomain = trueRange.map(scale.invert);
            return scale
                .copy()
                .domain(trueDomain)
                .range(trueRange);
        }
        return scale;
    }
}
