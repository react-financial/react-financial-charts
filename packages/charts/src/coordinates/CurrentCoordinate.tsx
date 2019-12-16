import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getMouseCanvas } from "../GenericComponent";
import { isNotDefined } from "../utils";

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
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const circle = this.helper(this.props, moreProps);
        if (!circle) {
            return null;
        }

        const fillColor = circle.fill instanceof Function ? circle.fill(moreProps.currentItem) : circle.fill;
        if (fillColor !== undefined) {
            ctx.fillStyle = fillColor;
        }
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    private readonly renderSVG = (moreProps) => {
        const { className } = this.props;

        const circle = this.helper(this.props, moreProps);
        if (!circle) {
            return null;
        }

        const fillColor = circle.fill instanceof Function ? circle.fill(moreProps.currentItem) : circle.fill;

        return (
            <circle className={className} cx={circle.x} cy={circle.y} r={circle.r} fill={fillColor} />
        );
    }

    private readonly helper = (props: CurrentCoordinateProps, moreProps) => {
        const { fill, yAccessor, r } = props;

        const { show, xScale, chartConfig: { yScale }, currentItem, xAccessor } = moreProps;

        if (!show || isNotDefined(currentItem)) {
            return undefined;
        }

        const xValue = xAccessor(currentItem);
        const yValue = yAccessor(currentItem);

        if (isNotDefined(yValue)) {
            return undefined;
        }

        const x = Math.round(xScale(xValue));
        const y = Math.round(yScale(yValue));

        return { x, y, r, fill };
    }
}
