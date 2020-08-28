import * as React from "react";

import { getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";

export interface ClickableCircleProps {
    readonly onDragStart?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDrag?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly strokeWidth: number;
    readonly strokeStyle: string;
    readonly fillStyle: string;
    readonly r: number;
    readonly cx?: number;
    readonly cy?: number;
    readonly className: string;
    readonly show: boolean;
    readonly interactiveCursorClass?: string;
    readonly xyProvider?: (moreProps: any) => number[];
}

export class ClickableCircle extends React.Component<ClickableCircleProps> {
    public static defaultProps = {
        className: "react-financial-charts-interactive-line-edge",
        show: false,
    };

    public render() {
        const { interactiveCursorClass, onDragStart, onDrag, onDragComplete, show } = this.props;

        if (!show) {
            return null;
        }

        return (
            <GenericChartComponent
                interactiveCursorClass={interactiveCursorClass}
                selected
                isHover={this.isHover}
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragComplete={onDragComplete}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["pan", "mousemove", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { strokeStyle, strokeWidth, fillStyle, r } = this.props;

        ctx.lineWidth = strokeWidth;
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;

        const [x, y] = this.helper(moreProps);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    };

    private readonly isHover = (moreProps: any) => {
        const { mouseXY } = moreProps;
        const r = this.props.r + 7;
        const [x, y] = this.helper(moreProps);

        const [mx, my] = mouseXY;
        const hover = x - r < mx && mx < x + r && y - r < my && my < y + r;

        return hover;
    };

    private readonly helper = (moreProps: any) => {
        const { xyProvider, cx, cy } = this.props;

        if (xyProvider !== undefined) {
            return xyProvider(moreProps);
        }

        const {
            xScale,
            chartConfig: { yScale },
        } = moreProps;

        const x = xScale(cx);
        const y = yScale(cy);
        return [x, y];
    };
}
