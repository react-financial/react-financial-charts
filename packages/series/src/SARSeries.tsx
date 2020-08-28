import * as React from "react";
import { first, getAxisCanvas, getMouseCanvas, GenericChartComponent, last } from "@react-financial-charts/core";

export interface SARSeriesProps {
    readonly fillStyle?: {
        falling: string;
        rising: string;
    };
    readonly highlightOnHover?: boolean;
    readonly onClick?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDoubleClick?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onContextMenu?: (e: React.MouseEvent, moreProps: any) => void;
    readonly yAccessor: (datum: any) => number;
}

/**
 * SAR stands for 'stop and reverse'.
 * The indicator is below prices as they're rising and above
 * prices as they're falling. In this regard, the indicator
 * stops and reverses when the price trend reverses and breaks above or below the indicator.
 */
export class SARSeries extends React.Component<SARSeriesProps> {
    public static defaultProps = {
        fillStyle: {
            falling: "#4682B4",
            rising: "#15EC2E",
        },
        highlightOnHover: true,
    };

    public render() {
        const { highlightOnHover, onClick, onDoubleClick, onContextMenu } = this.props;

        const hoverProps = highlightOnHover
            ? {
                  isHover: this.isHover,
                  drawOn: ["mousemove", "pan"],
                  canvasToDraw: getMouseCanvas,
              }
            : {
                  drawOn: ["pan"],
                  canvasToDraw: getAxisCanvas,
              };

        return (
            <GenericChartComponent
                canvasDraw={this.drawOnCanvas}
                onClickWhenHover={onClick}
                onDoubleClickWhenHover={onDoubleClick}
                onContextMenuWhenHover={onContextMenu}
                {...hoverProps}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { yAccessor, fillStyle = SARSeries.defaultProps.fillStyle } = this.props;
        const {
            xAccessor,
            plotData,
            xScale,
            chartConfig: { yScale },
            hovering,
        } = moreProps;

        const width = xScale(xAccessor(last(plotData))) - xScale(xAccessor(first(plotData)));

        const d = ((width / plotData.length) * 0.5) / 2;
        const radius = Math.min(2, Math.max(0.5, d)) + (hovering ? 2 : 0);

        plotData.forEach((each: any) => {
            const centerX = xScale(xAccessor(each));
            const centerY = yScale(yAccessor(each));
            const color = yAccessor(each) > each.close ? fillStyle.falling : fillStyle.rising;

            ctx.fillStyle = color;
            ctx.strokeStyle = color;

            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radius, radius, 0, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    };

    private readonly isHover = (moreProps: any) => {
        const {
            mouseXY,
            currentItem,
            chartConfig: { yScale },
        } = moreProps;
        const { yAccessor } = this.props;
        const y = mouseXY[1];
        const currentY = yScale(yAccessor(currentItem));
        return y < currentY + 5 && y > currentY - 5;
    };
}
