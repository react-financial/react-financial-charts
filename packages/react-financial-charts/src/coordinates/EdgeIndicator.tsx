import { format } from "d3-format";
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";
import { drawOnCanvas, renderSVG } from "./EdgeCoordinateV3";

import { first, functor, isDefined, last, noop, strokeDashTypes } from "../utils";

interface EdgeIndicatorProps {
    yAccessor?: any; // func
    type?: "horizontal";
    className?: string;
    fill?: string | any; // func
    lineStroke?: string | any; // func
    textFill?: string | any; // func
    itemType: "first" | "last";
    orient?: "left" | "right";
    edgeAt?: "left" | "right";
    displayFormat?: any; // func
    rectHeight?: number;
    rectWidth?: number;
    arrowWidth?: number;
    lineStrokeDasharray?: strokeDashTypes;
}

export class EdgeIndicator extends React.Component<EdgeIndicatorProps> {

    public static defaultProps = {
        className: "react-stockcharts-edgeindicator",
        type: "horizontal",
        orient: "left",
        edgeAt: "left",
        textFill: "#FFFFFF",
        displayFormat: format(".2f"),
        yAxisPad: 0,
        rectHeight: 20,
        rectWidth: 50,
        arrowWidth: 10,
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 13,
        dx: 0,
        hideLine: false,
        fill: "#8a8a8a",
        opacity: 1,
        stroke: noop,
        strokeOpacity: 1,
        strokeWidth: 3,
        lineStroke: "#000000",
        lineOpacity: 0.3,
        lineStrokeDasharray: "ShortDash",
    };

    public render() {
        return <GenericChartComponent
            edgeClip
            clip={false}
            svgDraw={this.renderSVG}
            canvasDraw={this.drawOnCanvas}
            canvasToDraw={getAxisCanvas}
            drawOn={["pan"]}
        />;
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const edge = this.helper(this.props, moreProps);
        const props = {
            ...this.props,
            ...edge,
        };
        drawOnCanvas(ctx, props);
    }

    private readonly renderSVG = (moreProps) => {
        const edge = this.helper(this.props, moreProps);
        const props = {
            ...this.props,
            ...edge,
        };
        return renderSVG(props);
    }

    private readonly helper = (props, moreProps) => {
        const { itemType, yAccessor } = props;
        const { plotData } = moreProps;

        const item = itemType === "first"
            ? first(plotData, yAccessor)
            : last(plotData, yAccessor);

        const edge = isDefined(item)
            ? this.getEdge(props, moreProps, item)
            : null;

        return edge;
    }

    private readonly getEdge = (props, moreProps, item) => {
        const { type: edgeType, displayFormat, edgeAt, yAxisPad, orient, lineStroke } = props;

        const { yAccessor, fill, textFill, rectHeight, rectWidth, arrowWidth } = props;
        const { fontFamily, fontSize } = props;
        const { stroke } = props;

        const { xScale, chartConfig: { yScale }, xAccessor, width } = moreProps;

        const yValue = yAccessor(item);
        const xValue = xAccessor(item);

        const x1 = Math.round(xScale(xValue));
        const y1 = Math.round(yScale(yValue));

        const [left, right] = [0, width];
        const edgeX = edgeAt === "left"
            ? left - yAxisPad
            : right + yAxisPad;

        return {
            coordinate: displayFormat(yValue),
            show: true,
            type: edgeType,
            orient,
            edgeAt: edgeX,
            fill: functor(fill)(item),
            lineStroke: functor(lineStroke)(item),
            stroke: functor(stroke)(item),
            fontFamily, fontSize,
            textFill: functor(textFill)(item),
            rectHeight, rectWidth, arrowWidth,
            x1,
            y1,
            x2: right,
            y2: y1,
        };
    }
}
