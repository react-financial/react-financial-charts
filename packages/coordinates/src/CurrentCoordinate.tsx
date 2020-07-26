import { getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";
import * as React from "react";

interface CurrentCoordinateProps {
    readonly className?: string;
    readonly fill?: string | ((dataItem: any) => string);
    readonly r: number;
    readonly yAccessor: (item: any) => number;
}

export class CurrentCoordinate extends React.Component<CurrentCoordinateProps> {
    public static defaultProps = {
        r: 3,
        className: "react-financial-charts-current-coordinate",
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
        const circle = this.getCircle(this.props, moreProps);
        if (circle === undefined) {
            return;
        }

        const fillColor = circle.fill instanceof Function ? circle.fill(moreProps.currentItem) : circle.fill;
        if (fillColor !== undefined) {
            ctx.fillStyle = fillColor;
        }
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI, false);
        ctx.fill();
    };

    private readonly getCircle = (props: CurrentCoordinateProps, moreProps) => {
        const { fill, yAccessor, r } = props;

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

        const xValue = xAccessor(currentItem);
        const yValue = yAccessor(currentItem);

        if (yValue === undefined) {
            return undefined;
        }

        const x = Math.round(xScale(xValue));
        const y = Math.round(yScale(yValue));

        return { x, y, r, fill };
    };
}
