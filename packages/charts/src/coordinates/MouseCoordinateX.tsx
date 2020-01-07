import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getMouseCanvas } from "../GenericComponent";
import { drawOnCanvas, renderSVG } from "./EdgeCoordinateV3";

import { isNotDefined } from "../utils";

interface MouseCoordinateXProps {
    readonly at?: "bottom" | "top";
    readonly customX: any; // func
    readonly displayFormat: any; // func
    readonly fill?: string;
    readonly fitToText?: boolean;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly opacity?: number;
    readonly orient?: "bottom" | "top";
    readonly rectRadius?: number;
    readonly rectWidth?: number;
    readonly rectHeight?: number;
    readonly snapX?: boolean;
    readonly stroke?: string;
    readonly strokeOpacity?: number;
    readonly strokeWidth?: number;
    readonly textFill?: string;
    readonly yAxisPad?: number;
}

const defaultCustomX = (props: MouseCoordinateXProps, moreProps) => {
    const { xScale, xAccessor, currentItem, mouseXY } = moreProps;
    const { snapX } = props;
    const x = snapX
        ? xScale(xAccessor(currentItem))
        : mouseXY[0];

    const { displayXAccessor } = moreProps;
    const { displayFormat } = props;
    const coordinate = snapX
        ? displayFormat(displayXAccessor(currentItem))
        : displayFormat(xScale.invert(x));
    return { x, coordinate };
};

export class MouseCoordinateX extends React.Component<MouseCoordinateXProps> {

    public static defaultProps = {
        at: "bottom",
        customX: defaultCustomX,
        fill: "#4C525E",
        fitToText: true,
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 13,
        opacity: 1,
        orient: "bottom",
        rectWidth: 80,
        rectHeight: 20,
        snapX: true,
        strokeOpacity: 1,
        strokeWidth: 1,
        textFill: "#FFFFFF",
        yAxisPad: 0,
    };

    public render() {
        return (
            <GenericChartComponent
                svgDraw={this.renderSVG}
                clip={false}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const props = this.helper(this.props, moreProps);
        if (isNotDefined(props)) {
            return null;
        }

        drawOnCanvas(ctx, props);
    }

    private readonly renderSVG = (moreProps) => {
        const props = this.helper(this.props, moreProps);
        if (isNotDefined(props)) {
            return null;
        }

        return renderSVG(props);
    }

    private readonly helper = (props: MouseCoordinateXProps, moreProps) => {
        const { show, currentItem } = moreProps;
        const { chartConfig: { height } } = moreProps;

        if (isNotDefined(currentItem)) { return null; }

        const { customX, orient, at } = props;
        const { stroke, strokeOpacity, strokeWidth } = props;
        const { rectRadius, rectWidth, rectHeight } = props;
        const { fill, opacity, fitToText, fontFamily, fontSize, textFill } = props;

        const edgeAt = (at === "bottom") ? height : 0;

        const {
            x,
            coordinate,
        } = customX(props, moreProps);

        const type = "vertical";
        const y1 = 0;
        const y2 = height;
        const hideLine = true;

        const coordinateProps = {
            coordinate,
            fitToText,
            show,
            type,
            orient,
            edgeAt,
            hideLine,
            fill, opacity, fontFamily, fontSize, textFill,
            stroke, strokeOpacity, strokeWidth,
            rectWidth,
            rectHeight,
            rectRadius,
            arrowWidth: 0,
            x1: x,
            x2: x,
            y1,
            y2,
        };
        return coordinateProps;
    }
}
