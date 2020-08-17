import { format } from "d3-format";
import * as React from "react";
import {
    first,
    functor,
    isDefined,
    getAxisCanvas,
    GenericChartComponent,
    last,
    noop,
    strokeDashTypes,
} from "@react-financial-charts/core";
import { drawOnCanvas } from "./EdgeCoordinateV3";

export interface EdgeIndicatorProps {
    readonly arrowWidth?: number;
    readonly displayFormat?: (n: number) => string;
    readonly edgeAt?: "left" | "right";
    readonly fill?: string | any; // func
    readonly fitToText?: boolean;
    readonly itemType: "first" | "last";
    readonly lineStroke?: string | any; // func
    readonly lineStrokeDasharray?: strokeDashTypes;
    readonly orient?: "left" | "right";
    readonly rectHeight?: number;
    readonly rectWidth?: number;
    readonly textFill?: string | any; // func
    readonly type?: "horizontal";
    readonly yAccessor?: any; // func
}

export class EdgeIndicator extends React.Component<EdgeIndicatorProps> {
    public static defaultProps = {
        type: "horizontal",
        fitToText: false,
        orient: "right",
        edgeAt: "right",
        textFill: "#FFFFFF",
        displayFormat: format(".2f"),
        yAxisPad: 0,
        rectHeight: 20,
        rectWidth: 50,
        arrowWidth: 0,
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 13,
        dx: 0,
        hideLine: false,
        fill: "#8a8a8a",
        opacity: 1,
        stroke: noop,
        strokeOpacity: 1,
        strokeWidth: 1,
        lineStroke: "#000000",
        lineOpacity: 1,
        lineStrokeDasharray: "ShortDot",
    };

    public render() {
        return (
            <GenericChartComponent
                edgeClip
                clip={false}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const edge = this.helper(this.props, moreProps);
        const props = {
            ...this.props,
            ...edge,
        };

        drawOnCanvas(ctx, props);
    };

    private readonly helper = (props, moreProps) => {
        const { itemType, yAccessor } = props;
        const { plotData } = moreProps;

        const item = itemType === "first" ? first(plotData, yAccessor) : last(plotData, yAccessor);

        const edge = isDefined(item) ? this.getEdge(props, moreProps, item) : null;

        return edge;
    };

    private readonly getEdge = (props, moreProps, item) => {
        const { type: edgeType, displayFormat, edgeAt, yAxisPad, orient, lineStroke } = props;

        const { yAccessor, fill, textFill, rectHeight, rectWidth, arrowWidth } = props;
        const { fontFamily, fontSize } = props;
        const { stroke } = props;

        const {
            xScale,
            chartConfig: { yScale },
            xAccessor,
            width,
        } = moreProps;

        const yValue = yAccessor(item);
        const xValue = xAccessor(item);

        const x1 = Math.round(xScale(xValue));
        const y1 = Math.round(yScale(yValue));

        const [left, right] = [0, width];
        const edgeX = edgeAt === "left" ? left - yAxisPad : right + yAxisPad;

        return {
            coordinate: displayFormat(yValue),
            show: true,
            type: edgeType,
            orient,
            edgeAt: edgeX,
            fill: functor(fill)(item),
            lineStroke: functor(lineStroke)(item),
            stroke: functor(stroke)(item),
            fontFamily,
            fontSize,
            textFill: functor(textFill)(item),
            rectHeight,
            rectWidth,
            arrowWidth,
            x1,
            y1,
            x2: right,
            y2: y1,
        };
    };
}
