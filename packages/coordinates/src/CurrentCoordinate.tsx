import { getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";
import * as React from "react";

export interface CurrentCoordinateProps {
    /**
     * Fill style for the circle.
     */
    readonly fillStyle?: string | ((datum: any) => string);
    /**
     * The radius to draw the circle
     */
    readonly r: number;
    /**
     * Stroke of the circle
     */
    readonly strokeStyle?: string | ((datum: any) => string);
    /**
     * Y accessor to use for the circle.
     */
    readonly yAccessor: (item: any) => number;
}

/**
 * Draws a circle at the current x location of radius `r`.
 */
export class CurrentCoordinate extends React.Component<CurrentCoordinateProps> {
    public static defaultProps = {
        fillStyle: "#2196f3",
        r: 3,
    };

    public render() {
        return (
            <GenericChartComponent
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const circle = this.getCircle(moreProps);
        if (circle === undefined) {
            return;
        }

        const { fillStyle, r, strokeStyle } = this.props;

        const fillColor = fillStyle instanceof Function ? fillStyle(moreProps.currentItem) : fillStyle;
        if (fillColor !== undefined) {
            ctx.fillStyle = fillColor;
        }

        const strokeColor = strokeStyle instanceof Function ? strokeStyle(moreProps.currentItem) : strokeStyle;
        if (strokeColor !== undefined) {
            ctx.strokeStyle = strokeColor;
        }

        ctx.beginPath();
        ctx.arc(circle.x, circle.y, r, 0, 2 * Math.PI, false);
        ctx.fill();
        if (strokeColor !== undefined) {
            ctx.stroke();
        }
    };

    private readonly getCircle = (moreProps: any) => {
        const {
            show,
            xScale,
            chartConfig: { yScale },
            currentItem,
            xAccessor,
        } = moreProps;

        if (!show || currentItem === undefined) {
            return undefined;
        }

        const { yAccessor } = this.props;

        const xValue = xAccessor(currentItem);
        const yValue = yAccessor(currentItem);

        if (yValue === undefined) {
            return undefined;
        }

        const x = Math.round(xScale(xValue));
        const y = Math.round(yScale(yValue));

        return { x, y };
    };
}
