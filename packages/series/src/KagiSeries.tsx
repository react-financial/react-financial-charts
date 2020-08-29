import * as React from "react";
import { isDefined, isNotDefined, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";

export interface KagiSeriesProps {
    /**
     * Current value stroke
     */
    readonly currentValueStroke?: string;
    /**
     * Fill values.
     */
    readonly fill: {
        yang: string;
        yin: string;
    };
    /**
     * Stroke values.
     */
    readonly stroke: {
        yang: string;
        yin: string;
    };
    /**
     * Stroke width.
     */
    readonly strokeWidth?: number;
}

/**
 * `KagiSeries` tracks price movement mostly independantly of time.
 */
export class KagiSeries extends React.Component<KagiSeriesProps> {
    public static defaultProps = {
        currentValueStroke: "#000000",
        fill: {
            yang: "none",
            yin: "none",
        },
        stroke: {
            yang: "#26a69a",
            yin: "#ef5350",
        },
        strokeWidth: 2,
    };

    public render() {
        return <GenericChartComponent canvasToDraw={getAxisCanvas} canvasDraw={this.drawOnCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { stroke, strokeWidth, currentValueStroke } = this.props;
        const {
            xAccessor,
            xScale,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        const paths = this.helper(plotData, xAccessor);

        let begin = true;

        paths.forEach((each) => {
            // @ts-ignore
            ctx.strokeStyle = stroke[each.type];
            if (strokeWidth !== undefined) {
                ctx.lineWidth = strokeWidth;
            }

            ctx.beginPath();
            let prevX: any;
            each.plot.forEach((d: any) => {
                const [x1, y] = [xScale(d[0]), yScale(d[1])];
                if (begin) {
                    ctx.moveTo(x1, y);
                    begin = false;
                } else {
                    if (isDefined(prevX)) {
                        ctx.lineTo(prevX, y);
                    }
                    ctx.lineTo(x1, y);
                }
                prevX = x1;
            });
            ctx.stroke();
        });

        const lastPlot = paths[paths.length - 1].plot;
        const last = lastPlot[lastPlot.length - 1];
        ctx.beginPath();
        ctx.lineWidth = 1;

        const [x, y1, y2] = [xScale(last[0]), yScale(last[2]), yScale(last[3])];
        ctx.moveTo(x, y1);
        ctx.lineTo(x + 10, y1);
        ctx.stroke();

        ctx.beginPath();
        if (currentValueStroke !== undefined) {
            ctx.strokeStyle = currentValueStroke;
        }
        ctx.moveTo(x - 10, y2);
        ctx.lineTo(x, y2);
        ctx.stroke();
    };

    private readonly helper = (plotData: any[], xAccessor: any) => {
        const kagiLine: any[] = [];
        let kagi: {
            added?: boolean;
            plot?: any;
            type?: any;
        } = {};
        let d = plotData[0];
        let idx = xAccessor(d);

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < plotData.length; i++) {
            d = plotData[i];

            if (isNotDefined(d.close)) {
                continue;
            }
            if (isNotDefined(kagi.type)) {
                kagi.type = d.startAs;
            }
            if (isNotDefined(kagi.plot)) {
                kagi.plot = [];
            }

            idx = xAccessor(d);
            kagi.plot.push([idx, d.open]);

            if (isDefined(d.changeTo)) {
                kagi.plot.push([idx, d.changePoint]);
                kagi.added = true;
                kagiLine.push(kagi);

                kagi = {
                    type: d.changeTo,
                    plot: [],
                    added: false,
                };
                kagi.plot.push([idx, d.changePoint]);
            }
        }

        if (!kagi.added) {
            kagi.plot.push([idx, d.close, d.current, d.reverseAt]);
            kagiLine.push(kagi);
        }

        return kagiLine;
    };
}
