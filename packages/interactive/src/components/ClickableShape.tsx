import * as React from "react";
import { getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { isHovering2 } from "./InteractiveStraightLine";

export interface ClickableShapeProps {
    readonly fontWeight: string;
    readonly fontFamily: string;
    readonly fontStyle: string;
    readonly fontSize: number;
    readonly strokeStyle: string;
    readonly strokeWidth: number;
    readonly text: string;
    readonly textBox: {
        readonly closeIcon: any;
        readonly left: number;
        readonly padding: any;
    };
    readonly hovering?: boolean;
    readonly interactiveCursorClass?: string;
    readonly show?: boolean;
    readonly onHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onUnHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onClick?: (e: React.MouseEvent, moreProps: any) => void;
    readonly yValue: number;
}

export class ClickableShape extends React.Component<ClickableShapeProps> {
    public static defaultProps = {
        show: false,
        strokeWidth: 1,
    };

    private closeIcon: any;

    public render() {
        const { interactiveCursorClass, onHover, onUnHover, onClick, show } = this.props;

        if (!show) {
            return null;
        }

        return (
            <GenericChartComponent
                interactiveCursorClass={interactiveCursorClass}
                isHover={this.isHover}
                onClickWhenHover={onClick}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                onHover={onHover}
                onUnHover={onUnHover}
                drawOn={["pan", "mousemove", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { strokeStyle, strokeWidth, hovering, textBox } = this.props;

        const [x, y] = this.helper(this.props, moreProps, ctx);

        this.closeIcon = { x, y };
        ctx.beginPath();

        ctx.lineWidth = hovering ? strokeWidth + 1 : strokeWidth;
        ctx.strokeStyle = strokeStyle;
        const halfWidth = textBox.closeIcon.width / 2;
        ctx.moveTo(x - halfWidth, y - halfWidth);
        ctx.lineTo(x + halfWidth, y + halfWidth);
        ctx.moveTo(x - halfWidth, y + halfWidth);
        ctx.lineTo(x + halfWidth, y - halfWidth);
        ctx.stroke();
    };

    private readonly isHover = (moreProps: any) => {
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
    };

    private readonly helper = (props: ClickableShapeProps, moreProps: any, ctx: CanvasRenderingContext2D) => {
        const { yValue, text, textBox } = props;
        const { fontFamily, fontStyle, fontWeight, fontSize } = props;
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        const {
            chartConfig: { yScale },
        } = moreProps;

        const x =
            textBox.left +
            textBox.padding.left +
            ctx.measureText(text).width +
            textBox.padding.right +
            textBox.closeIcon.padding.left +
            textBox.closeIcon.width / 2;

        const y = yScale(yValue);

        return [x, y];
    };
}
