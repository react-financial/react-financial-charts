import { getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";
import * as React from "react";

export interface CurrentCoordinateProps {
    readonly fillStyle?:
        | string
        | CanvasGradient
        | CanvasPattern
        | ((datum: any) => string | CanvasGradient | CanvasPattern);
    readonly r: number;
    readonly yAccessor: (item: any) => number;
}

export class CurrentCoordinate extends React.Component<CurrentCoordinateProps> {
    public static defaultProps = {
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

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const circle = this.getCircle(moreProps);
        if (circle === undefined) {
            return;
        }

        const { fillStyle, r } = this.props;

        const fillColor = fillStyle instanceof Function ? fillStyle(moreProps.currentItem) : fillStyle;
        if (fillColor !== undefined) {
            ctx.fillStyle = fillColor;
        }
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, r, 0, 2 * Math.PI, false);
        ctx.fill();
    };

    private readonly getCircle = (moreProps) => {
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
