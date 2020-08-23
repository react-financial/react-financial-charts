import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";
import { isDefined, isNotDefined, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";

export interface PointAndFigureSeriesProps {
    readonly className?: string;
    readonly clip?: boolean;
    readonly fill?: {
        up: string;
        down: string;
    };
    readonly stroke?: {
        up: string;
        down: string;
    };
    readonly strokeWidth?: number;
}

export class PointAndFigureSeries extends React.Component<PointAndFigureSeriesProps> {
    public static defaultProps = {
        className: "react-financial-charts-point-and-figure",
        strokeWidth: 1,
        stroke: {
            up: "#6BA583",
            down: "#FF0000",
        },
        fill: {
            up: "none",
            down: "none",
        },
        clip: true,
    };

    public render() {
        const { clip } = this.props;

        return (
            <GenericChartComponent
                clip={clip}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const {
            xAccessor,
            xScale,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        const columns = this.getColumns(xScale, xAccessor, yScale, plotData);

        this.drawOnCanvasPrivate(ctx, this.props, columns);
    };

    private readonly getColumns = (
        xScale: ScaleContinuousNumeric<number, number>,
        xAccessor: any,
        yScale: ScaleContinuousNumeric<number, number>,
        plotData: any[],
    ) => {
        const width = xScale(xAccessor(plotData[plotData.length - 1])) - xScale(xAccessor(plotData[0]));

        const columnWidth = width / (plotData.length - 1);

        let anyBox;
        let j = 0;
        while (isNotDefined(anyBox)) {
            if (isDefined(plotData[j].close)) {
                anyBox = plotData[j].boxes[0];
            } else {
                break;
            }
            j++;
        }

        const boxHeight = Math.abs(yScale(anyBox.open) - yScale(anyBox.close));

        const columns = plotData
            .filter((d) => isDefined(d.close))
            .map((d) => {
                const boxes = d.boxes.map((box: any) => ({
                    columnWidth,
                    boxHeight,
                    open: yScale(box.open),
                    close: yScale(box.close),
                }));

                const xOffset = xScale(xAccessor(d)) - columnWidth / 2;
                return {
                    boxes,
                    direction: d.direction,
                    offset: [xOffset, 0],
                };
            });
        return columns;
    };

    private readonly drawOnCanvasPrivate = (ctx: CanvasRenderingContext2D, props: any, columns: any[]) => {
        const { stroke, fill, strokeWidth } = props;

        ctx.lineWidth = strokeWidth;

        columns.forEach((col) => {
            const [offsetX, offsetY] = col.offset;
            col.boxes.forEach((box: any) => {
                if (col.direction > 0) {
                    ctx.fillStyle = fill.up;
                    ctx.strokeStyle = stroke.up;

                    ctx.beginPath();

                    ctx.moveTo(offsetX, offsetY + box.open);
                    ctx.lineTo(offsetX + box.columnWidth, offsetY + box.close);
                    ctx.moveTo(offsetX, offsetY + box.close);
                    ctx.lineTo(offsetX + box.columnWidth, offsetY + box.open);

                    ctx.stroke();
                } else {
                    ctx.fillStyle = fill.down;
                    ctx.strokeStyle = stroke.down;

                    ctx.beginPath();

                    const [x, y] = [offsetX + box.columnWidth / 2, offsetY + box.open + box.boxHeight / 2];
                    const [rx, ry] = [box.columnWidth / 2, box.boxHeight / 2];

                    ctx.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
                    ctx.stroke();
                }
            });
        });

        ctx.stroke();
    };
}
