import * as React from "react";
import { getMouseCanvas, GenericChartComponent, isNotDefined } from "@react-financial-charts/core";
import { drawOnCanvas } from "./EdgeCoordinateV3";

export interface MouseCoordinateYProps {
    readonly arrowWidth?: number;
    readonly at?: "left" | "right";
    readonly displayFormat: (value: number) => string;
    readonly dx?: number;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fill?: string;
    readonly fitToText?: boolean;
    readonly opacity?: number;
    readonly orient?: "left" | "right";
    readonly rectWidth?: number;
    readonly rectHeight?: number;
    readonly stroke?: string;
    readonly strokeOpacity?: number;
    readonly strokeWidth?: number;
    readonly textFill?: string;
    readonly yAccessor?: (data: any) => number | undefined;
    readonly yAxisPad?: number;
}

export class MouseCoordinateY extends React.Component<MouseCoordinateYProps> {
    public static defaultProps = {
        arrowWidth: 0,
        at: "right",
        dx: 0,
        fill: "#4C525E",
        fitToText: false,
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 13,
        opacity: 1,
        orient: "right",
        rectWidth: 50,
        rectHeight: 20,
        strokeOpacity: 1,
        strokeWidth: 1,
        textFill: "#FFFFFF",
        yAxisPad: 0,
    };

    public render() {
        return (
            <GenericChartComponent
                clip={false}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const props = this.helper(this.props, moreProps);
        if (props === undefined) {
            return;
        }

        drawOnCanvas(ctx, props);
    };

    private readonly helper = (props: MouseCoordinateYProps, moreProps: any) => {
        const {
            chartConfig: { yScale },
            chartId,
            currentItem,
            currentCharts,
            mouseXY,
            show,
        } = moreProps;

        if (!show) {
            return undefined;
        }

        if (isNotDefined(mouseXY)) {
            return undefined;
        }

        if (currentCharts.indexOf(chartId) < 0) {
            return undefined;
        }

        const { displayFormat, yAccessor } = props;

        if (yAccessor && !currentItem) {
            return undefined;
        }

        const y = yAccessor ? yScale(yAccessor(currentItem)) : mouseXY[1];

        const coordinate = displayFormat(yScale.invert(y));

        return getYCoordinate(y, coordinate, props, moreProps);
    };
}

export function getYCoordinate(y: number, coordinate: string, props: any, moreProps: any) {
    const { width } = moreProps;

    const { orient, at, rectWidth, rectHeight, dx, stroke, strokeOpacity, strokeWidth } = props;
    const { fill, opacity, fitToText, fontFamily, fontSize, textFill, arrowWidth } = props;

    const x1 = 0;
    const x2 = width;
    const edgeAt = at === "right" ? width : 0;

    const type = "horizontal";
    const hideLine = true;

    const coordinateProps = {
        coordinate,
        show: true,
        fitToText,
        type,
        orient,
        edgeAt,
        hideLine,
        fill,
        opacity,
        fontFamily,
        fontSize,
        textFill,
        stroke,
        strokeOpacity,
        strokeWidth,
        rectWidth,
        rectHeight,
        arrowWidth,
        dx,
        x1,
        x2,
        y1: y,
        y2: y,
    };

    return coordinateProps;
}
