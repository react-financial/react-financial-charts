import { ascending, descending, histogram as d3Histogram, max, merge, sum, zip } from "d3-array";
import { nest } from "d3-collection";
import { scaleLinear } from "d3-scale";
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";

import { accumulatingWindow, functor, head, hexToRGBA, identity, last } from "../utils";

interface VolumeProfileSeriesProps {
    className?: string;
    opacity?: number;
    showSessionBackground?: boolean;
    sessionBackGround?: string;
    sessionBackGroundOpacity?: number;
}

export class VolumeProfileSeries extends React.Component<VolumeProfileSeriesProps> {

    public static defaultProps = {
        className: "line ",
        bins: 20,
        opacity: 0.5,
        maxProfileWidthPercent: 50,
        fill: ({ type }) => type === "up" ? "#6BA583" : "#FF0000",
        stroke: "#FFFFFF",
        showSessionBackground: false,
        sessionBackGround: "#4682B4",
        sessionBackGroundOpacity: 0.3,
        source: (d) => d.close,
        volume: (d) => d.volume,
        absoluteChange: (d) => d.absoluteChange,
        bySession: false,
        sessionStart: ({ d, i, plotData }) => i > 0 && plotData[i - 1].date.getMonth() !== d.date.getMonth(),
        orient: "left",
        partialStartOK: true,
        partialEndOK: true,
    };

    public render() {
        return (
            <GenericChartComponent
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getAxisCanvas}
                drawOn={["pan"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { xAccessor, width } = moreProps;
        const { rects, sessionBg } = this.helper(this.props, moreProps, xAccessor, width);

        this.drawOnCanvasContext(ctx, this.props, rects, sessionBg);
    }

    private readonly renderSVG = (moreProps) => {
        const { className, opacity } = this.props;
        const { showSessionBackground, sessionBackGround, sessionBackGroundOpacity } = this.props;

        const { xAccessor, width } = moreProps;
        const { rects, sessionBg } = this.helper(this.props, moreProps, xAccessor, width);

        const sessionBgSvg = showSessionBackground
            ? sessionBg.map((d, idx) => <rect key={idx} {...d} opacity={sessionBackGroundOpacity} fill={sessionBackGround} />)
            : null;

        return (
            <g className={className}>
                {sessionBgSvg}
                {rects.map((d, i) => <g key={i}>
                    <rect x={d.x} y={d.y}
                        width={d.w1} height={d.height}
                        fill={d.fill1} stroke={d.stroke1} fillOpacity={opacity} />
                    <rect x={d.x + d.w1} y={d.y}
                        width={d.w2} height={d.height}
                        fill={d.fill2} stroke={d.stroke2} fillOpacity={opacity} />
                </g>)}
            </g>
        );
    }

    private readonly drawOnCanvasContext = (ctx, props, rects, sessionBg) => {
        const { opacity, sessionBackGround, sessionBackGroundOpacity, showSessionBackground } = props;

        if (showSessionBackground) {
            ctx.fillStyle = hexToRGBA(sessionBackGround, sessionBackGroundOpacity);

            sessionBg.forEach((each) => {
                const { x, y, height, width } = each;

                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.closePath();
                ctx.fill();
            });
        }

        rects.forEach((each) => {
            const { x, y, height, w1, w2, stroke1, stroke2, fill1, fill2 } = each;

            if (w1 > 0) {
                ctx.fillStyle = hexToRGBA(fill1, opacity);
                if (stroke1 !== "none") { ctx.strokeStyle = stroke1; }

                ctx.beginPath();
                ctx.rect(x, y, w1, height);
                ctx.closePath();
                ctx.fill();

                if (stroke1 !== "none") { ctx.stroke(); }
            }

            if (w2 > 0) {
                ctx.fillStyle = hexToRGBA(fill2, opacity);
                if (stroke2 !== "none") { ctx.strokeStyle = stroke2; }

                ctx.beginPath();
                ctx.rect(x + w1, y, w2, height);
                ctx.closePath();
                ctx.fill();

                if (stroke2 !== "none") { ctx.stroke(); }
            }
        });
    }

    private readonly helper = (props, moreProps, xAccessor, width) => {
        const { xScale: realXScale, chartConfig: { yScale }, plotData } = moreProps;

        const { sessionStart, bySession, partialStartOK, partialEndOK } = props;

        const { bins, maxProfileWidthPercent, source, volume, absoluteChange, orient, fill, stroke } = props;

        const sessionBuilder = accumulatingWindow()
            .discardTillStart(!partialStartOK)
            // @ts-ignore
            .discardTillEnd(!partialEndOK)
            .accumulateTill((d, i) => {
                return sessionStart({ d, i, ...moreProps });
            })
            .accumulator(identity);

        const dx = plotData.length > 1 ? realXScale(xAccessor(plotData[1])) - realXScale(xAccessor(head(plotData))) : 0;

        const sessions = bySession ? sessionBuilder(plotData) : [plotData];

        const allRects = sessions.map((session) => {

            const begin = bySession ? realXScale(xAccessor(head(session))) : 0;
            const finish = bySession ? realXScale(xAccessor(last(session))) : width;
            const sessionWidth = finish - begin + dx;

            const histogram2 = d3Histogram()
                .value(source)
                .thresholds(bins);

            const rollup = nest()
                .key((d) => d.direction)
                .sortKeys(orient === "right" ? descending : ascending)
                .rollup((leaves) => sum(leaves, (d) => d.volume));

            const values = histogram2(session);

            const volumeInBins = values
                .map((arr) => arr.map((d) => {
                    return absoluteChange(d) > 0 ? { direction: "up", volume: volume(d) } : { direction: "down", volume: volume(d) };
                }))
                .map((arr) => rollup.entries(arr));

            const volumeValues = volumeInBins
                .map((each) => sum(each.map((d) => d.value)));

            const base = (xScaleD) => head(xScaleD.range());

            const [start, end] = orient === "right"
                ? [begin, begin + sessionWidth * maxProfileWidthPercent / 100]
                : [finish, finish - sessionWidth * (100 - maxProfileWidthPercent) / 100];

            const xScale = scaleLinear()
                .domain([0, max(volumeValues)])
                .range([start, end]);

            const totalVolumes = volumeInBins.map((volumes) => {

                const totalVolume = sum(volumes, (d) => d.value);
                const totalVolumeX = xScale(totalVolume);
                const widthLocal = base(xScale) - totalVolumeX;
                const x = widthLocal < 0 ? totalVolumeX + widthLocal : totalVolumeX;

                const ws = volumes.map((d) => {
                    return {
                        type: d.key,
                        width: d.value * Math.abs(widthLocal) / totalVolume,
                    };
                });

                return { x, ws, totalVolumeX };
            });

            const rects = zip(values, totalVolumes)
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
            rects: merge(allRects.map((d) => d.rects)),
            sessionBg: allRects.map((d) => d.sessionBg),
        };
    }
}
