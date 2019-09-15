import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";
import { functor, strokeDashTypes } from "../utils";
import { drawOnCanvas, renderSVG } from "./EdgeCoordinateV3";

interface PriceCoordinateProps {
    readonly displayFormat: any; // func
    readonly yAxisPad?: number;
    readonly rectWidth?: number;
    readonly rectHeight?: number;
    readonly orient?: "bottom" | "top" | "left" | "right";
    readonly at?: "bottom" | "top" | "left" | "right";
    readonly price?: number;
    readonly dx?: number;
    readonly arrowWidth?: number;
    readonly opacity?: number;
    readonly lineOpacity?: number;
    readonly lineStroke?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fill?: string | any; // func
    readonly strokeDasharray?: strokeDashTypes;
    readonly stroke?: string;
    readonly strokeOpacity?: number;
    readonly strokeWidth?: number;
    readonly textFill?: string | any; // func
}

export class PriceCoordinate extends React.Component<PriceCoordinateProps> {

    public static defaultProps = {
        yAxisPad: 0,
        rectWidth: 50,
        rectHeight: 20,
        orient: "left",
        at: "left",
        price: 0,
        dx: 0,
        arrowWidth: 0,
        fill: "#BAB8b8",
        opacity: 1,
        lineOpacity: 0.2,
        lineStroke: "#000000",
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 13,
        textFill: "#FFFFFF",
        strokeOpacity: 1,
        strokeWidth: 1,
        strokeDasharray: "Solid",
    };

    public render() {
        return (
            <GenericChartComponent
                clip={false}
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const props = this.helper(this.props, moreProps);
        drawOnCanvas(ctx, props);
    }

    private readonly renderSVG = (moreProps) => {
        const props = this.helper(this.props, moreProps);
        return renderSVG(props);
    }

    private readonly helper = (props, moreProps) => {
        const { width } = moreProps;
        const { chartConfig: { yScale } } = moreProps;
        const [lowerYValue, upperYValue] = yScale.domain();

        const { price, stroke, strokeDasharray, strokeOpacity, strokeWidth } = props;
        const { orient, at, rectWidth, rectHeight, displayFormat, dx } = props;
        const { fill, opacity, fontFamily, fontSize, textFill, arrowWidth, lineOpacity, lineStroke } = props;

        const x1 = 0;
        const x2 = width;
        const edgeAt = (at === "right")
            ? width
            : 0;

        const type = "horizontal";

        const y = yScale(price);
        const show = (price <= upperYValue && price >= lowerYValue);

        const coordinate = displayFormat(yScale.invert(y));
        const hideLine = false;

        const coordinateProps = {
            coordinate,
            show,
            type,
            orient,
            edgeAt,
            hideLine,
            lineOpacity,
            lineStroke,
            lineStrokeDasharray: strokeDasharray,
            stroke,
            strokeOpacity,
            strokeWidth,
            fill: functor(fill)(price),
            textFill: functor(textFill)(price),
            opacity, fontFamily, fontSize,
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
}
