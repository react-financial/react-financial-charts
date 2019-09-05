import { curveStepBefore, line } from "d3-shape";
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";
import { isDefined, isNotDefined } from "../utils";

interface KagiSeriesProps {
    readonly className?: string;
    readonly stroke?: {
        yang: string;
        yin: string;
    };
    readonly fill?: {
        yang: string;
        yin: string;
    };
    readonly strokeWidth: number;
}

export class KagiSeries extends React.Component<KagiSeriesProps> {

    public static defaultProps = {
        className: "react-stockcharts-kagi",
        strokeWidth: 2,
        stroke: {
            yang: "#6BA583",
            yin: "#E60000",
        },
        fill: {
            yang: "none",
            yin: "none",
        },
        currentValueStroke: "#000000",
    };

    public render() {
        return (
            <GenericChartComponent
                svgDraw={this.renderSVG}
                canvasToDraw={getAxisCanvas}
                canvasDraw={this.drawOnCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { xAccessor, xScale, chartConfig: { yScale }, plotData } = moreProps;

        const {
            className,
            stroke = KagiSeries.defaultProps.stroke,
            fill = KagiSeries.defaultProps.fill,
            strokeWidth,
        } = this.props;

        const paths = helper(plotData, xAccessor)
            .map((each, i) => {
                const dataSeries = line()
                    .x((item) => xScale(item[0]))
                    .y((item) => yScale(item[1]))
                    .curve(curveStepBefore);

                dataSeries(each.plot);

                return (
                    <path
                        key={i}
                        d={dataSeries(each.plot)}
                        className={each.type}
                        stroke={stroke[each.type]}
                        fill={fill[each.type]}
                        strokeWidth={strokeWidth} />
                );
            });
        return (
            <g className={className}>
                {paths}
            </g>
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { xAccessor } = moreProps;

        drawOnCanvas(ctx, this.props, moreProps, xAccessor);
    }
}

function drawOnCanvas(ctx, props, moreProps, xAccessor) {
    const { stroke, strokeWidth, currentValueStroke } = props;
    const { xScale, chartConfig: { yScale }, plotData } = moreProps;

    const paths = helper(plotData, xAccessor);

    let begin = true;

    paths.forEach((each) => {
        ctx.strokeStyle = stroke[each.type];
        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        let prevX;
        each.plot.forEach((d) => {
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
    ctx.strokeStyle = currentValueStroke;
    ctx.moveTo(x - 10, y2);
    ctx.lineTo(x, y2);
    ctx.stroke();
}

function helper(plotData, xAccessor) {
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

        if (isNotDefined(d.close)) { continue; }
        if (isNotDefined(kagi.type)) { kagi.type = d.startAs; }
        if (isNotDefined(kagi.plot)) { kagi.plot = []; }

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
}
