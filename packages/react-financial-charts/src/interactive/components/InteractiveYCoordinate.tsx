import * as React from "react";

import { drawOnCanvas } from "../../coordinates/EdgeCoordinateV3";
import { getYCoordinate } from "../../coordinates/MouseCoordinateY";
import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";
import { getStrokeDasharrayCanvas, hexToRGBA, isDefined, noop } from "../../utils";

interface InteractiveYCoordinateProps {
    bgFill: string;
    bgOpacity: number;
    stroke: string;
    strokeWidth: number;
    strokeOpacity: number;
    strokeDasharray: string;
    textFill: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number | string;
    fontStyle: string;
    text: string;
    edge: object;
    textBox: {
        closeIcon: any;
        padding: any;
    };
    yValue: number;
    onDragStart: any; // func
    onDrag: any; // func
    onDragComplete: any; // func
    onHover?: any; // func
    onUnHover?: any; // func
    defaultClassName?: string;
    interactiveCursorClass?: string;
    tolerance: number;
    selected: boolean;
    hovering: boolean;
}

export class InteractiveYCoordinate extends React.Component<InteractiveYCoordinateProps> {

    public static defaultProps = {
        onDragStart: noop,
        onDrag: noop,
        onDragComplete: noop,
        fontWeight: "normal", // standard dev
        strokeWidth: 1,
        tolerance: 4,
        selected: false,
        hovering: false,
    };

    private width;

    public render() {
        const { interactiveCursorClass } = this.props;
        const { onHover, onUnHover } = this.props;
        const { onDragStart, onDrag, onDragComplete } = this.props;

        return (
            <GenericChartComponent
                clip={false}
                isHover={this.isHover}
                svgDraw={this.renderSVG}
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

    private readonly renderSVG = () => {
        throw new Error("svg not implemented");
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const {
            bgFill,
            bgOpacity,

            textFill,
            fontFamily,
            fontSize,

            fontStyle,
            fontWeight,
            stroke,
            strokeWidth,
            strokeOpacity,
            strokeDasharray,
            text,
            textBox,
            edge,
        } = this.props;

        const { selected, hovering } = this.props;

        const values = helper(this.props, moreProps);
        if (values == null) { return; }

        const { x1, x2, y, rect } = values;

        ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);

        ctx.beginPath();
        if (selected || hovering) {
            ctx.lineWidth = strokeWidth + 1;
        } else {
            ctx.lineWidth = strokeWidth;
        }
        ctx.textBaseline = "middle";
        ctx.textAlign = "start";
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        this.width = textBox.padding.left
            + ctx.measureText(text).width
            + textBox.padding.right
            + textBox.closeIcon.padding.left
            + textBox.closeIcon.width
            + textBox.closeIcon.padding.right;

        ctx.setLineDash(getStrokeDasharrayCanvas(strokeDasharray));
        ctx.moveTo(x1, y);
        ctx.lineTo(rect.x, y);

        ctx.moveTo(rect.x + this.width, y);
        ctx.lineTo(x2, y);
        ctx.stroke();

        ctx.setLineDash([]);

        ctx.fillStyle = hexToRGBA(bgFill, bgOpacity);

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
            opacity: bgOpacity,
        };

        // @ts-ignore
        const yValue = edge.displayFormat(this.props.yValue);
        const yCoord = getYCoordinate(y, yValue, newEdge, moreProps);
        drawOnCanvas(ctx, yCoord);
    }

    private readonly isHover = (moreProps) => {
        const { onHover } = this.props;

        if (isDefined(onHover)) {
            const values = helper(this.props, moreProps);
            if (values == null) { return false; }

            const { x1, x2, y, rect } = values;
            const { mouseXY: [mouseX, mouseY] } = moreProps;

            if (
                mouseX >= rect.x
                && mouseX <= rect.x + this.width
                && mouseY >= rect.y
                && mouseY <= rect.y + rect.height
            ) {
                return true;
            }
            if (
                x1 <= mouseX
                && x2 >= mouseX
                && Math.abs(mouseY - y) < 4
            ) {
                return true;
            }
        }
        return false;
    }
}

function helper(props, moreProps) {
    const { yValue, textBox } = props;

    const { chartConfig: { width, yScale, height } } = moreProps;

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
}
