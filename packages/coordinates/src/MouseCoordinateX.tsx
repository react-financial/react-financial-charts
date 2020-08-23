import * as React from "react";
import { isNotDefined, getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { drawOnCanvas } from "./EdgeCoordinateV3";

export interface MouseCoordinateXProps {
    readonly at?: "bottom" | "top";
    readonly customX: (props: MouseCoordinateXProps, moreProps: any) => { x: number; coordinate: string };
    readonly displayFormat: (item: any) => string;
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

const defaultCustomX = (props: MouseCoordinateXProps, moreProps: any) => {
    const { xScale, xAccessor, currentItem, mouseXY } = moreProps;
    const { snapX } = props;
    const x = snapX ? xScale(xAccessor(currentItem)) : mouseXY[0];

    const { displayXAccessor } = moreProps;
    const { displayFormat } = props;
    const coordinate = snapX ? displayFormat(displayXAccessor(currentItem)) : displayFormat(xScale.invert(x));
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
                clip={false}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const props = this.helper(this.props, moreProps);
        if (props === null) {
            return;
        }

        drawOnCanvas(ctx, props);
    };

    private readonly helper = (props: MouseCoordinateXProps, moreProps: any) => {
        const {
            show,
            currentItem,
            chartConfig: { height },
        } = moreProps;

        if (isNotDefined(currentItem)) {
            return null;
        }

        const { customX, orient, at, rectRadius, rectWidth, rectHeight, stroke, strokeOpacity, strokeWidth } = props;
        const { fill, opacity, fitToText, fontFamily, fontSize, textFill } = props;

        const edgeAt = at === "bottom" ? height : 0;

        const { x, coordinate } = customX(props, moreProps);

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
            rectRadius,
            arrowWidth: 0,
            x1: x,
            x2: x,
            y1,
            y2,
        };

        return coordinateProps;
    };
}
