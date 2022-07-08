import * as React from "react";
import {
    getStrokeDasharrayCanvas,
    strokeDashTypes,
    GenericComponent,
    getMouseCanvas,
    ChartCanvasContext,
} from "@react-financial-charts/core";

const defaultCustomX = (props: CrossHairCursorProps, moreProps: any) => {
    const { xScale, xAccessor, currentItem, mouseXY } = moreProps;
    const { snapX } = props;
    const x = snapX ? Math.round(xScale(xAccessor(currentItem))) : mouseXY[0] + 0.5;
    return x;
};

export interface CrossHairCursorProps {
    readonly customX?: (props: CrossHairCursorProps, moreProps: any) => number;
    readonly snapX?: boolean;
    readonly strokeStyle?: string;
    readonly strokeDasharray?: strokeDashTypes;
    readonly strokeWidth?: number;
}

export class CrossHairCursor extends React.Component<CrossHairCursorProps> {
    public static defaultProps = {
        customX: defaultCustomX,
        snapX: true,
        strokeStyle: "rgba(55, 71, 79, 0.8)",
        strokeDasharray: "Dash",
        strokeWidth: 1,
    };

    public static contextType = ChartCanvasContext;

    public render() {
        return (
            <GenericComponent
                clip={false}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const lines = this.getLines(this.props, moreProps);
        if (lines === undefined) {
            return;
        }

        const { margin, ratio } = this.context;

        const originX = 0.5 * ratio + margin.left;
        const originY = 0.5 * ratio + margin.top;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);
        ctx.translate(originX, originY);

        lines.forEach((line) => {
            const dashArray = getStrokeDasharrayCanvas(line.strokeDasharray);

            ctx.strokeStyle = line.strokeStyle;
            ctx.lineWidth = line.strokeWidth;
            ctx.setLineDash(dashArray);
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        });

        ctx.restore();
    };

    private readonly getLines = (props: CrossHairCursorProps, moreProps: any) => {
        const { mouseXY, currentItem, show, height, width } = moreProps;

        const {
            customX = CrossHairCursor.defaultProps.customX,
            strokeStyle = CrossHairCursor.defaultProps.strokeStyle,
            strokeDasharray,
            strokeWidth = CrossHairCursor.defaultProps.strokeWidth,
        } = props;

        if (!show || currentItem === undefined) {
            return undefined;
        }

        const line1 = {
            x1: 0,
            x2: width,
            y1: mouseXY[1] + 0.5,
            y2: mouseXY[1] + 0.5,
            strokeStyle,
            strokeDasharray,
            strokeWidth,
        };

        const x = customX(props, moreProps);

        const line2 = {
            x1: x,
            x2: x,
            y1: 0,
            y2: height,
            strokeStyle,
            strokeDasharray,
            strokeWidth,
        };

        return [line1, line2];
    };
}
