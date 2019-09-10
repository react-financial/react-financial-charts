import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas, getMouseCanvas } from "../GenericComponent";

import { colorToRGBA, first, isDefined, last } from "../utils";

interface SARSeriesProps {
    readonly className?: string;
    readonly fill?: {
        falling: string;
        rising: string;
    };
    readonly yAccessor: any; // func
    readonly opacity?: number;
    readonly onClick?: any; // func
    readonly onDoubleClick?: any; // func
    readonly onContextMenu?: any; // func
    readonly highlightOnHover?: boolean;
}

export class SARSeries extends React.Component<SARSeriesProps> {

    public static defaultProps = {
        className: "react-financial-charts-sar",
        fill: {
            falling: "#4682B4",
            rising: "#15EC2E",
        },
        highlightOnHover: true,
        opacity: 0.2,
    };

    public render() {
        const { highlightOnHover } = this.props;

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
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                onClickWhenHover={this.props.onClick}
                onDoubleClickWhenHover={this.props.onDoubleClick}
                onContextMenuWhenHover={this.props.onContextMenu}
                {...hoverProps}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const {
            className,
            yAccessor,
            fill = SARSeries.defaultProps.fill,
        } = this.props;
        const { xAccessor, plotData, xScale, chartConfig: { yScale } } = moreProps;

        return <g className={className}>
            {plotData
                .filter((each) => isDefined(yAccessor(each)))
                .map((each, idx) => {

                    const color = yAccessor(each) > each.close
                        ? fill.falling
                        : fill.rising;

                    return (
                        <circle
                            key={idx}
                            cx={xScale(xAccessor(each))}
                            cy={yScale(yAccessor(each))}
                            r={3}
                            fill={color} />
                    );
                })}
        </g>;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const {
            yAccessor,
            fill = SARSeries.defaultProps.fill,
            opacity,
        } = this.props;
        const { xAccessor, plotData, xScale, chartConfig: { yScale }, hovering } = moreProps;

        const width = xScale(xAccessor(last(plotData))) - xScale(xAccessor(first(plotData)));

        const d = (width / plotData.length) * 0.5 / 2;
        const radius = Math.min(2, Math.max(0.5, d)) + (hovering ? 2 : 0);

        plotData.forEach((each) => {
            const centerX = xScale(xAccessor(each));
            const centerY = yScale(yAccessor(each));
            const color = yAccessor(each) > each.close
                ? fill.falling
                : fill.rising;

            ctx.fillStyle = colorToRGBA(color, opacity);
            ctx.strokeStyle = color;

            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radius, radius, 0, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }

    private readonly isHover = (moreProps) => {
        const { mouseXY, currentItem, chartConfig: { yScale } } = moreProps;
        const { yAccessor } = this.props;
        const y = mouseXY[1];
        const currentY = yScale(yAccessor(currentItem));
        return y < currentY + 5 && y > currentY - 5;
    }
}
