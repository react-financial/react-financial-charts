
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getMouseCanvas } from "../GenericComponent";
import { drawOnCanvas, renderSVG } from "./EdgeCoordinateV3";

import { isNotDefined } from "../utils";

interface MouseCoordinateYProps {
    displayFormat: any; // func
    yAxisPad?: number;
    rectWidth?: number;
    rectHeight?: number;
    orient?: "bottom" | "top" | "left" | "right";
    at?: "bottom" | "top" | "left" | "right";
    dx?: number;
    fill?: string;
    opacity?: number;
    fontFamily?: string;
    fontSize?: number;
    textFill?: string;
}

export class MouseCoordinateY extends React.Component<MouseCoordinateYProps> {

    public static defaultProps = {
        yAxisPad: 0,
        rectWidth: 50,
        rectHeight: 20,
        orient: "left",
        at: "left",
        dx: 0,
        arrowWidth: 10,
        fill: "#525252",
        opacity: 1,
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 13,
        textFill: "#FFFFFF",
        strokeOpacity: 1,
        strokeWidth: 1,
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
        if (isNotDefined(props)) { return null; }

        return renderSVG(props);
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const props = this.helper(this.props, moreProps);
        if (isNotDefined(props)) { return null; }

        drawOnCanvas(ctx, props);
    }

    private readonly helper = (props, moreProps) => {
        const { chartId } = moreProps;
        const { currentCharts, mouseXY } = moreProps;

        if (isNotDefined(mouseXY)) { return null; }
        if (currentCharts.indexOf(chartId) < 0) { return null; }

        const { show } = moreProps;
        if (!show) { return null; }

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
    const { fill, opacity, fontFamily, fontSize, textFill, arrowWidth } = props;
    const { stroke, strokeOpacity, strokeWidth } = props;

    const x1 = 0;
    const x2 = width;
    const edgeAt = (at === "right")
        ? width
        : 0;

    const type = "horizontal";
    const hideLine = true;

    const coordinateProps = {
        coordinate: displayValue,
        show: true,
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
