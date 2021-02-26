import { ascending, descending, histogram as d3Histogram, max, merge, rollup, sum, zip } from "d3-array";
import { scaleLinear } from "d3-scale";
import * as React from "react";
import {
    accumulatingWindow,
    functor,
    head,
    identity,
    getAxisCanvas,
    GenericChartComponent,
    last,
} from "@react-financial-charts/core";

export interface VolumeProfileSeriesProps {
    readonly absoluteChange: (datum: any) => number;
    readonly bins: number;
    readonly bySession?: boolean;
    readonly fill?: (widthType: { type: "up" | "down"; width: number }) => string;
    readonly maxProfileWidthPercent: number;
    readonly orient?: "left" | "right";
    readonly partialStartOK?: boolean;
    readonly partialEndOK?: boolean;
    readonly sessionBackGround?: string;
    readonly sessionStart: ({ d, i, plotData }: any) => boolean;
    readonly showSessionBackground?: boolean;
    readonly source: (d: number, i: number, data: ArrayLike<number>) => number;
    readonly stroke?: string;
    readonly volume: (datum: any) => number;
}

export class VolumeProfileSeries extends React.Component<VolumeProfileSeriesProps> {
    public static defaultProps = {
        absoluteChange: (d: any) => d.absoluteChange,
        bins: 20,
        bySession: false,
        fill: ({ type }: { type: "up" | "down"; width: number }) =>
            type === "up" ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)",
        maxProfileWidthPercent: 50,
        orient: "left",
        partialStartOK: true,
        partialEndOK: true,
        sessionBackGround: "rgba(70, 130, 180, 0.3)",
        sessionStart: ({ d, i, plotData }: any) => i > 0 && plotData[i - 1].date.getMonth() !== d.date.getMonth(),
        showSessionBackground: false,
        source: (d: any) => d.close,
        stroke: "#FFFFFF",
        volume: (d: any) => d.volume,
    };

    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { xAccessor, width } = moreProps;

        const { rects, sessionBg } = this.helper(this.props, moreProps, xAccessor, width);

        this.drawOnCanvasContext(ctx, rects, sessionBg);
    };

    private readonly drawOnCanvasContext = (ctx: CanvasRenderingContext2D, rects: any[], sessionBg: any[]) => {
        const { sessionBackGround, showSessionBackground } = this.props;

        if (showSessionBackground) {
            if (sessionBackGround !== undefined) {
                ctx.fillStyle = sessionBackGround;
            }

            sessionBg.forEach((each: any) => {
                const { x, y, height, width } = each;

                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.closePath();
                ctx.fill();
            });
        }

        rects.forEach((each: any) => {
            const { x, y, height, w1, w2, stroke1, stroke2, fill1, fill2 } = each;

            if (w1 > 0) {
                ctx.fillStyle = fill1;
                if (stroke1 !== "none") {
                    ctx.strokeStyle = stroke1;
                }

                ctx.beginPath();
                ctx.rect(x, y, w1, height);
                ctx.closePath();
                ctx.fill();

                if (stroke1 !== "none") {
                    ctx.stroke();
                }
            }

            if (w2 > 0) {
                ctx.fillStyle = fill2;
                if (stroke2 !== "none") {
                    ctx.strokeStyle = stroke2;
                }

                ctx.beginPath();
                ctx.rect(x + w1, y, w2, height);
                ctx.closePath();
                ctx.fill();

                if (stroke2 !== "none") {
                    ctx.stroke();
                }
            }
        });
    };

    private readonly helper = (props: VolumeProfileSeriesProps, moreProps: any, xAccessor: any, width: number) => {
        const {
            xScale: realXScale,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        const {
            sessionStart,
            bySession,
            partialStartOK,
            partialEndOK,
            bins,
            maxProfileWidthPercent,
            source,
            volume,
            absoluteChange,
            orient,
            fill,
            stroke,
        } = props;

        const sessionBuilder = accumulatingWindow()
            .discardTillStart(!partialStartOK)
            .discardTillEnd(!partialEndOK)
            .accumulateTill((d: any, i: any) => {
                return sessionStart({ d, i, ...moreProps });
            })
            .accumulator(identity);

        const dx = plotData.length > 1 ? realXScale(xAccessor(plotData[1])) - realXScale(xAccessor(head(plotData))) : 0;

        const sessions = bySession ? sessionBuilder(plotData) : [plotData];

        const allRects = sessions.map((session: any) => {
            const begin = bySession ? realXScale(xAccessor(head(session))) : 0;
            const finish = bySession ? realXScale(xAccessor(last(session))) : width;
            const sessionWidth = finish - begin + dx;

            const histogram2 = d3Histogram().value(source).thresholds(bins);

            const rolledup = (data: any[]) => {
                const sortFunction = orient === "right" ? descending : ascending;

                const sortedData = data.sort((a, b) => sortFunction(a.direction, b.direction));

                return rollup(
                    sortedData,
                    (leaves) => sum<any>(leaves, (d) => d.volume),
                    (d) => d.direction,
                );
            };

            const values = histogram2(session);

            const volumeInBins = values
                .map((arr) =>
                    arr.map((d) => {
                        return absoluteChange(d) > 0
                            ? { direction: "up", volume: volume(d) }
                            : { direction: "down", volume: volume(d) };
                    }),
                )
                .map((arr) => Array.from(rolledup(arr)));

            const volumeValues = volumeInBins.map((each) => sum(each.map((d) => d[1])));

            const base = (xScaleD: any) => head(xScaleD.range());

            const [start, end] =
                orient === "right"
                    ? [begin, begin + (sessionWidth * maxProfileWidthPercent) / 100]
                    : [finish, finish - (sessionWidth * (100 - maxProfileWidthPercent)) / 100];

            const xScale = scaleLinear()
                .domain([0, max(volumeValues)!])
                .range([start, end]);

            const totalVolumes = volumeInBins.map((volumes) => {
                const totalVolume = sum<any>(volumes, (d) => d[1]);
                const totalVolumeX = xScale(totalVolume);
                const widthLocal = base(xScale) - totalVolumeX;
                const x = widthLocal < 0 ? totalVolumeX + widthLocal : totalVolumeX;

                const ws = volumes.map((d) => {
                    return {
                        type: d[0],
                        width: (d[1] * Math.abs(widthLocal)) / totalVolume,
                    };
                });

                return { x, ws, totalVolumeX };
            });

            // @ts-ignore
            const rects = zip(values, totalVolumes)
                // @ts-ignore
                .map(([d, { x, ws }]) => {
                    const w1 = ws[0] || { type: "up", width: 0 };
                    const w2 = ws[1] || { type: "down", width: 0 };

                    return {
                        y: yScale(d.x1),
                        height: yScale(d.x1) - yScale(d.x0),
                        x,
                        width,
                        w1: w1.width,
                        w2: w2.width,
                        stroke1: functor(stroke)(w1),
                        stroke2: functor(stroke)(w2),
                        fill1: functor(fill)(w1),
                        fill2: functor(fill)(w2),
                    };
                });

            const sessionBg = {
                x: begin,
                y: last(rects).y,
                height: head(rects).y - last(rects).y + head(rects).height,
                width: sessionWidth,
            };

            return { rects, sessionBg };
        });

        return {
            rects: merge<any>(allRects.map((d: any) => d.rects)),
            sessionBg: allRects.map((d: any) => d.sessionBg),
        };
    };
}
