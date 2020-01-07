
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getMouseCanvas } from "../GenericComponent";
import { drawOnCanvas, renderSVG } from "./EdgeCoordinateV3";

import { isNotDefined } from "../utils";

interface MouseCoordinateYProps {
    readonly arrowWidth?: number;
    readonly at?: "left" | "right";
    readonly displayFormat: any; // func
    readonly dx?: number;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fill?: string;
    readonly fitToText?: boolean;
    readonly opacity?: number;
    readonly orient?: "left" | "right";
    readonly rectWidth?: number;
    readonly rectHeight?: number;
    readonly strokeOpacity?: number;
    readonly strokeWidth?: number;
    readonly textFill?: string;
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
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const props = this.helper(this.props, moreProps);
        if (isNotDefined(props)) {
            return null;
        }

        return renderSVG(props);
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const props = this.helper(this.props, moreProps);
        if (isNotDefined(props)) {
            return null;
        }

        drawOnCanvas(ctx, props);
    }

    private readonly helper = (props: MouseCoordinateYProps, moreProps) => {
        const { chartId, currentCharts, mouseXY, show } = moreProps;

        if (!show) {
            return null;
        }

        if (isNotDefined(mouseXY)) {
            return null;
        }

        if (currentCharts.indexOf(chartId) < 0) {
            return null;
        }

        const y = mouseXY[1];
        const { chartConfig: { yScale } } = moreProps;
        const { displayFormat } = props;

        const coordinate = displayFormat(yScale.invert(y));

        return getYCoordinate(y, coordinate, props, moreProps);
    }
}

export function getYCoordinate(y, displayValue, props, moreProps) {
    const { width } = moreProps;

    const { orient, at, rectWidth, rectHeight, dx } = props;
    const { fill, opacity, fitToText, fontFamily, fontSize, textFill, arrowWidth } = props;
    const { stroke, strokeOpacity, strokeWidth } = props;

    const x1 = 0;
    const x2 = width;
    const edgeAt = (at === "right") ? width : 0;

    const type = "horizontal";
    const hideLine = true;

    const coordinateProps = {
        coordinate: displayValue,
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
