import { ChartContext, strokeDashTypes } from "@react-financial-charts/core";
import * as React from "react";
import { Axis } from "./Axis";

export interface XAxisProps<T extends number | Date> {
    readonly axisAt?: number | "top" | "bottom" | "middle";
    readonly className?: string;
    readonly domainClassName?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly getMouseDelta?: (startXY: [number, number], mouseXY: [number, number]) => number;
    readonly gridLinesStrokeStyle?: string;
    readonly gridLinesStrokeWidth?: number;
    readonly gridLinesStrokeDasharray?: strokeDashTypes;
    readonly innerTickSize?: number;
    readonly onContextMenu?: (e: React.MouseEvent, mousePosition: [number, number]) => void;
    readonly onDoubleClick?: (e: React.MouseEvent, mousePosition: [number, number]) => void;
    readonly orient?: "top" | "bottom";
    readonly outerTickSize?: number;
    readonly showDomain?: boolean;
    readonly showGridLines?: boolean;
    readonly showTicks?: boolean;
    readonly showTickLabel?: boolean;
    readonly strokeStyle?: string;
    readonly strokeWidth?: number;
    readonly tickFormat?: (value: T) => string;
    readonly tickPadding?: number;
    readonly tickSize?: number;
    readonly tickLabelFill?: string;
    readonly ticks?: number;
    readonly tickStrokeStyle?: string;
    readonly tickStrokeWidth?: number;
    readonly tickStrokeDasharray?: strokeDashTypes;
    readonly tickValues?: number[];
    readonly xZoomHeight?: number;
    readonly zoomEnabled?: boolean;
    readonly zoomCursorClassName?: string;
}

export class XAxis<T extends number | Date> extends React.Component<XAxisProps<T>> {
    public static defaultProps = {
        axisAt: "bottom",
        className: "react-financial-charts-x-axis",
        domainClassName: "react-financial-charts-axis-domain",
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 12,
        fontWeight: 400,
        getMouseDelta: (startXY: [number, number], mouseXY: [number, number]) => startXY[0] - mouseXY[0],
        gridLinesStrokeStyle: "#E2E4EC",
        gridLinesStrokeWidth: 1,
        orient: "bottom",
        outerTickSize: 0,
        innerTickSize: 4,
        showDomain: true,
        showGridLines: false,
        showTicks: true,
        showTickLabel: true,
        strokeStyle: "#000000",
        strokeWidth: 1,
        tickPadding: 4,
        tickLabelFill: "#000000",
        tickStrokeStyle: "#000000",
        xZoomHeight: 25,
        zoomEnabled: true,
        zoomCursorClassName: "react-financial-charts-ew-resize-cursor",
    };

    public static contextType = ChartContext;

    public render() {
        const {
            getMouseDelta = XAxis.defaultProps.getMouseDelta,
            outerTickSize = XAxis.defaultProps.outerTickSize,
            showTicks,
            strokeStyle = XAxis.defaultProps.strokeStyle,
            strokeWidth = XAxis.defaultProps.strokeWidth,
            zoomEnabled,
            ...rest
        } = this.props;

        const { ...moreProps } = this.helper();

        return (
            <Axis
                {...rest}
                {...moreProps}
                getMouseDelta={getMouseDelta}
                outerTickSize={outerTickSize}
                showTicks={showTicks}
                strokeStyle={strokeStyle}
                strokeWidth={strokeWidth}
                zoomEnabled={zoomEnabled && showTicks}
                axisZoomCallback={this.axisZoomCallback}
            />
        );
    }

    private readonly axisZoomCallback = (newXDomain: number[]) => {
        const { xAxisZoom } = this.context;

        xAxisZoom(newXDomain);
    };

    private readonly helper = () => {
        const { axisAt, xZoomHeight = XAxis.defaultProps.xZoomHeight, orient, ticks } = this.props;
        const {
            chartConfig: { width, height },
        } = this.context;

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
                axisLocation = height / 2;
                break;
            default:
                axisLocation = axisAt;
        }

        const y = orient === "top" ? -xZoomHeight : 0;

        return {
            transform: [0, axisLocation],
            range: [0, width],
            getScale: this.getXScale,
            bg: { x, y, h, w },
            ticks: ticks ?? this.getXTicks(width),
        };
    };

    private readonly getXTicks = (width: number) => {
        if (width < 400) {
            return 2;
        }

        if (width < 500) {
            return 6;
        }

        return 8;
    };

    private readonly getXScale = (moreProps: any) => {
        const { xScale: scale, width } = moreProps;

        if (scale.invert) {
            const trueRange = [0, width];
            const trueDomain = trueRange.map(scale.invert);
            return scale.copy().domain(trueDomain).range(trueRange);
        }

        return scale;
    };
}
