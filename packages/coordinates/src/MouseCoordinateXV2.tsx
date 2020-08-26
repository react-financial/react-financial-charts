import * as React from "react";
import { getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";

interface MouseCoordinateXV2Props {
    readonly at?: "bottom" | "top";
    readonly bg: {
        readonly fill: string | ((moreProps: any, ctx: CanvasRenderingContext2D) => string);
        readonly stroke: string | ((moreProps: any, ctx: CanvasRenderingContext2D) => string);
        readonly strokeWidth: number | ((moreProps: any) => number);
        readonly padding: {
            left: number;
            right: number;
            top: number;
            bottom: number;
        };
    };
    readonly drawCoordinate: (ctx: CanvasRenderingContext2D, shape: any, props: any, moreProps: any) => void;
    readonly displayFormat: (value: number) => string;
    readonly dx: number;
    readonly dy: number;
    readonly orient?: "bottom" | "top";
    readonly text: {
        readonly fontStyle: string;
        readonly fontWeight: string;
        readonly fontFamily: string;
        readonly fontSize: number;
        readonly fill: string | ((moreProps: any, ctx: CanvasRenderingContext2D) => string);
    };
    readonly xPosition: (props: MouseCoordinateXV2Props, moreProps: any) => number;
}

export class MouseCoordinateXV2 extends React.Component<MouseCoordinateXV2Props> {
    public static defaultProps = {
        xPosition: defaultXPosition,
        drawCoordinate: defaultDrawCoordinate,
        at: "bottom",
        orient: "bottom",
        text: {
            fontStyle: "",
            fontWeight: "",
            fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
            fontSize: 13,
            fill: "rgb(35, 35, 35)",
        },
        bg: {
            fill: "rgb(255, 255, 255)",
            stroke: "rgb(35, 35, 35)",
            strokeWidth: 1,
            padding: {
                left: 7,
                right: 7,
                top: 4,
                bottom: 4,
            },
        },
        dx: 7,
        dy: 7,
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
        const { show, currentItem } = moreProps;
        const { drawCoordinate } = this.props;

        if (show && currentItem != null) {
            const shape = getXCoordinateInfo(ctx, this.props, moreProps);

            drawCoordinate(ctx, shape, this.props, moreProps);
        }
    };
}

function defaultXPosition(props: MouseCoordinateXV2Props, moreProps: any) {
    const { currentItem, xAccessor } = moreProps;

    return xAccessor(currentItem);
}

function getXCoordinateInfo(ctx: CanvasRenderingContext2D, props: MouseCoordinateXV2Props, moreProps: any) {
    const { at, displayFormat, text, xPosition } = props;

    const xValue = xPosition(props, moreProps);

    const {
        xScale,
        chartConfig: { height },
    } = moreProps;

    ctx.font = `${text.fontStyle} ${text.fontWeight} ${text.fontSize}px ${text.fontFamily}`;

    const t = displayFormat(xValue);
    const textWidth = ctx.measureText(t).width;

    const y = at === "bottom" ? height : 0;
    const x = Math.round(xScale(xValue));

    return {
        x,
        y,
        textWidth,
        text: t,
    };
}

function defaultDrawCoordinate(
    ctx: CanvasRenderingContext2D,
    shape: any,
    props: MouseCoordinateXV2Props,
    moreProps: any,
) {
    const { x, y, textWidth, text } = shape;

    const {
        orient,
        dx,
        dy,
        bg: { padding, fill, stroke, strokeWidth },
        text: { fontSize, fill: textFill },
    } = props;

    ctx.textAlign = "center";

    const sign = orient === "top" ? -1 : 1;
    const halfWidth = Math.round(textWidth / 2 + padding.right);
    const height = Math.round(fontSize + padding.top + padding.bottom);

    ctx.strokeStyle = typeof stroke === "function" ? stroke(moreProps, ctx) : stroke;
    ctx.fillStyle = typeof fill === "function" ? fill(moreProps, ctx) : fill;
    ctx.lineWidth = typeof strokeWidth === "function" ? strokeWidth(moreProps) : strokeWidth;

    ctx.beginPath();

    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + sign * dy);
    ctx.lineTo(x + halfWidth, y + sign * dy);
    ctx.lineTo(x + halfWidth, y + sign * (dy + height));
    ctx.lineTo(x - halfWidth, y + sign * (dy + height));
    ctx.lineTo(x - halfWidth, y + sign * dy);
    ctx.lineTo(x - dx, y + sign * dy);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = typeof textFill === "function" ? textFill(moreProps, ctx) : textFill;

    ctx.textBaseline = orient === "top" ? "alphabetic" : "hanging";
    const pad = orient === "top" ? padding.bottom : padding.top;

    ctx.fillText(text, x, y + sign * (dy + pad + 2));
}
