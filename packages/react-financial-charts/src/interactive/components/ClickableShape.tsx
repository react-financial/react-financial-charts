import * as React from "react";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

import { hexToRGBA } from "../../utils";
import { isHovering2 } from "./StraightLine";

interface ClickableShapeProps {
    fontWeight: string;
    fontFamily: string;
    fontStyle: string;
    fontSize: number;
    stroke: string;
    strokeOpacity: number;
    strokeWidth: number;
    text: string;
    textBox: {
        closeIcon: any;
        left: number;
        padding: any;
    };
    hovering?: boolean;
    interactiveCursorClass?: string;
    show?: boolean;
    onHover?: any; // func
    onUnHover?: any; // func
    onClick?: any; // func
    yValue: number;
}

export class ClickableShape extends React.Component<ClickableShapeProps> {

    public static defaultProps = {
        show: false,
        fillOpacity: 1,
        strokeOpacity: 1,
        strokeWidth: 1,
    };

    private closeIcon;

    public render() {
        const { interactiveCursorClass } = this.props;
        const { show } = this.props;
        const { onHover, onUnHover, onClick } = this.props;

        if (!show) {
            return null;
        }

        return (
            <GenericChartComponent
                interactiveCursorClass={interactiveCursorClass}
                isHover={this.isHover}
                onClickWhenHover={onClick}
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                onHover={onHover}
                onUnHover={onUnHover}
                drawOn={["pan", "mousemove", "drag"]}
            />
        );
    }

    private readonly renderSVG = () => {
        throw new Error("svg not implemented");
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { stroke, strokeWidth, strokeOpacity, hovering, textBox } = this.props;

        const [x, y] = this.helper(this.props, moreProps, ctx);

        this.closeIcon = { x, y };
        ctx.beginPath();

        ctx.lineWidth = hovering ? strokeWidth + 1 : strokeWidth;
        ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);
        const halfWidth = textBox.closeIcon.width / 2;
        ctx.moveTo(x - halfWidth, y - halfWidth);
        ctx.lineTo(x + halfWidth, y + halfWidth);
        ctx.moveTo(x - halfWidth, y + halfWidth);
        ctx.lineTo(x + halfWidth, y - halfWidth);
        ctx.stroke();
    }

    private readonly isHover = (moreProps) => {
        const { mouseXY } = moreProps;
        if (this.closeIcon) {
            const { textBox } = this.props;
            const { x, y } = this.closeIcon;
            const halfWidth = textBox.closeIcon.width / 2;

            const start1 = [x - halfWidth, y - halfWidth];
            const end1 = [x + halfWidth, y + halfWidth];
            const start2 = [x - halfWidth, y + halfWidth];
            const end2 = [x + halfWidth, y - halfWidth];

            if (isHovering2(start1, end1, mouseXY, 3) || isHovering2(start2, end2, mouseXY, 3)) {
                return true;
            }
        }
        return false;
    }

    private readonly helper = (props: ClickableShapeProps, moreProps, ctx) => {
        const { yValue, text, textBox } = props;
        const { fontFamily, fontStyle, fontWeight, fontSize } = props;
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        const { chartConfig: { yScale } } = moreProps;

        const x = textBox.left
            + textBox.padding.left
            + ctx.measureText(text).width
            + textBox.padding.right
            + textBox.closeIcon.padding.left
            + textBox.closeIcon.width / 2;

        const y = yScale(yValue);

        return [x, y];
    }
}
