import { getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { first, last } from "@react-financial-charts/core";
import * as React from "react";

export interface SelectedCandlestickProps {
    readonly background?: {
        fillStyle?: string;
    };
    readonly selection: {
        selectedCandlestick: any;
        previousCanvasImage: any;
        clickEventInProgress: boolean;
    };
}

export class SelectedCandlestick extends React.Component<SelectedCandlestickProps> {
    public static defaultProps = {
        background: {
            fillStyle: "rgba(89, 200, 134, 0.1)",
        },
    };

    public render() {
        return (
            <GenericChartComponent
                onClick={this.onClick}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["click"]}
            />
        );
    }

    private readonly onClick = (e: React.MouseEvent, moreProps: any) => {
        this.props.selection.selectedCandlestick = moreProps.currentItem;
        // drawOnCanvas method is also fired on 'pan' event therefore need to record that a click
        // is in progress
        this.props.selection.clickEventInProgress = true;
    };

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        if (this.props.selection.clickEventInProgress && this.props.selection.previousCanvasImage) {
            ctx.putImageData(this.props.selection.previousCanvasImage, 0, 0);
        }

        this.props.selection.previousCanvasImage = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.width);

        const { height } = moreProps;
        if (this.props.selection.selectedCandlestick) {
            moreProps.currentItem = this.props.selection.selectedCandlestick;
        } else {
            return;
        }

        const pointer = this.helper(ctx, moreProps);

        if (pointer === undefined) {
            return;
        }

        const { background } = this.props;
        const { centerX, pointWidth } = pointer;

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (background?.fillStyle !== undefined) {
            ctx.fillStyle = background.fillStyle;
        }
        ctx.beginPath();
        ctx.rect(centerX - pointWidth / 2, 0, pointWidth, height);
        ctx.fill();
        this.props.selection.clickEventInProgress = false;
    };

    private readonly helper = (ctx: CanvasRenderingContext2D, moreProps: any): any => {
        const { show, xScale, currentItem, plotData, xAccessor } = moreProps;

        if (!show || currentItem === undefined) {
            return;
        }

        const xValue = xAccessor(currentItem);
        if (xValue === undefined) {
            return;
        }

        const centerX = xScale(xValue);
        const pointWidth =
            Math.abs(xScale(xAccessor(last(plotData))) - xScale(xAccessor(first(plotData)))) / (plotData.length - 1);

        return { centerX, pointWidth };
    };
}
