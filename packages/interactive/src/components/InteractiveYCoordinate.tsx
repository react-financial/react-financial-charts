import * as React from "react";
import { drawOnCanvas } from "@react-financial-charts/coordinates/lib/EdgeCoordinateV3";
import { getYCoordinate } from "@react-financial-charts/coordinates/lib/MouseCoordinateY";
import {
    getStrokeDasharrayCanvas,
    getMouseCanvas,
    GenericChartComponent,
    strokeDashTypes,
} from "@react-financial-charts/core";

export interface InteractiveYCoordinateProps {
    readonly bgFillStyle: string;
    readonly strokeStyle: string;
    readonly strokeWidth: number;
    readonly strokeDasharray: strokeDashTypes;
    readonly textFill: string;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly fontWeight: number | string;
    readonly fontStyle: string;
    readonly text: string;
    readonly edge: object;
    readonly textBox: {
        readonly closeIcon: any;
        readonly left: number;
        readonly height: number;
        readonly padding: any;
    };
    readonly yValue: number;
    readonly onDragStart?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDrag?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onUnHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly defaultClassName?: string;
    readonly interactiveCursorClass?: string;
    readonly tolerance: number;
    readonly selected: boolean;
    readonly hovering: boolean;
}

export class InteractiveYCoordinate extends React.Component<InteractiveYCoordinateProps> {
    public static defaultProps = {
        fontWeight: "normal", // standard dev
        strokeWidth: 1,
        tolerance: 4,
        selected: false,
        hovering: false,
    };

    private width = 0;

    public render() {
        const { interactiveCursorClass } = this.props;
        const { onHover, onUnHover } = this.props;
        const { onDragStart, onDrag, onDragComplete } = this.props;

        return (
            <GenericChartComponent
                clip={false}
                isHover={this.isHover}
                canvasToDraw={getMouseCanvas}
                canvasDraw={this.drawOnCanvas}
                interactiveCursorClass={interactiveCursorClass}
                enableDragOnHover
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragComplete={onDragComplete}
                onHover={onHover}
                onUnHover={onUnHover}
                drawOn={["mousemove", "mouseleave", "pan", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const {
            bgFillStyle,
            textFill,
            fontFamily,
            fontSize,
            fontStyle,
            fontWeight,
            strokeStyle,
            strokeWidth,
            strokeDasharray,
            text,
            textBox,
            edge,
            selected,
            hovering,
        } = this.props;

        const values = this.helper(moreProps);
        if (values == null) {
            return;
        }

        const { x1, x2, y, rect } = values;

        ctx.strokeStyle = strokeStyle;

        ctx.beginPath();
        if (selected || hovering) {
            ctx.lineWidth = strokeWidth + 1;
        } else {
            ctx.lineWidth = strokeWidth;
        }
        ctx.textBaseline = "middle";
        ctx.textAlign = "start";
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        this.width =
            textBox.padding.left +
            ctx.measureText(text).width +
            textBox.padding.right +
            textBox.closeIcon.padding.left +
            textBox.closeIcon.width +
            textBox.closeIcon.padding.right;

        ctx.setLineDash(getStrokeDasharrayCanvas(strokeDasharray));
        ctx.moveTo(x1, y);
        ctx.lineTo(rect.x, y);

        ctx.moveTo(rect.x + this.width, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        ctx.setLineDash([]);

        ctx.fillStyle = bgFillStyle;

        ctx.fillRect(rect.x, rect.y, this.width, rect.height);
        ctx.strokeRect(rect.x, rect.y, this.width, rect.height);

        ctx.fillStyle = textFill;

        ctx.beginPath();
        ctx.fillText(text, rect.x + 10, y);
        const newEdge = {
            ...edge,
            textFill,
            fontFamily,
            fontSize,
        };

        // @ts-ignore
        const yValue = edge.displayFormat(this.props.yValue);
        const yCoord = getYCoordinate(y, yValue, newEdge, moreProps);
        drawOnCanvas(ctx, yCoord);
    };

    private readonly isHover = (moreProps: any) => {
        const { onHover } = this.props;

        if (onHover !== undefined) {
            const values = this.helper(moreProps);
            if (values == null) {
                return false;
            }

            const { x1, x2, y, rect } = values;
            const {
                mouseXY: [mouseX, mouseY],
            } = moreProps;

            if (
                mouseX >= rect.x &&
                mouseX <= rect.x + this.width &&
                mouseY >= rect.y &&
                mouseY <= rect.y + rect.height
            ) {
                return true;
            }
            if (x1 <= mouseX && x2 >= mouseX && Math.abs(mouseY - y) < 4) {
                return true;
            }
        }
        return false;
    };

    private readonly helper = (moreProps: any) => {
        const { yValue, textBox } = this.props;

        const {
            chartConfig: { width, yScale, height },
        } = moreProps;

        const y = Math.round(yScale(yValue));

        if (y >= 0 && y <= height) {
            const rect = {
                x: textBox.left,
                y: y - textBox.height / 2,
                height: textBox.height,
            };
            return {
                x1: 0,
                x2: width,
                y,
                rect,
            };
        }
    };
}
