import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getMouseCanvas } from "../GenericComponent";
import { drawOnCanvas, renderSVG } from "./EdgeCoordinateV3";

import { isNotDefined } from "../utils";

interface MouseCoordinateXProps {
    readonly displayFormat: any; // func
    readonly yAxisPad?: number;
    readonly rectWidth?: number;
    readonly rectHeight?: number;
    readonly orient?: "bottom" | "top" | "left" | "right";
    readonly at?: "bottom" | "top" | "left" | "right";
    readonly fill?: string;
    readonly opacity?: number;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly textFill?: string;
    readonly snapX?: boolean;
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
        yAxisPad: 0,
        rectWidth: 80,
        rectHeight: 20,
        strokeOpacity: 1,
        strokeWidth: 1,
        orient: "bottom",
        at: "bottom",
        fill: "#525252",
        opacity: 1,
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 13,
        textFill: "#FFFFFF",
        snapX: true,
        customX: defaultCustomX,
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

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const props = this.helper(this.props, moreProps);
        if (isNotDefined(props)) { return null; }

        drawOnCanvas(ctx, props);
    }

    private readonly renderSVG = (moreProps) => {
        const props = this.helper(this.props, moreProps);
        if (isNotDefined(props)) { return null; }

        return renderSVG(props);
    }

    private readonly helper = (props, moreProps) => {
        const { show, currentItem } = moreProps;
        const { chartConfig: { height } } = moreProps;

        if (isNotDefined(currentItem)) { return null; }

        const { customX } = props;

        const { orient, at } = props;
        const { stroke, strokeOpacity, strokeWidth } = props;
        const { rectRadius, rectWidth, rectHeight } = props;
        const { fill, opacity, fontFamily, fontSize, textFill } = props;

        const edgeAt = (at === "bottom")
            ? height
            : 0;

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
