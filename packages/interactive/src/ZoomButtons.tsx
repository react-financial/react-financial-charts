import { ChartContext, last } from "@react-financial-charts/core";
import { interpolateNumber } from "d3-interpolate";
import * as React from "react";

export interface ZoomButtonsProps {
    readonly fill: string;
    readonly fillOpacity: number;
    readonly heightFromBase: number;
    readonly onReset?: () => void;
    readonly r: number;
    readonly stroke: string;
    readonly strokeWidth: number;
    readonly textFill: string;
    readonly zoomMultiplier: number;
}

export class ZoomButtons extends React.Component<ZoomButtonsProps> {
    public static defaultProps = {
        fill: "#ffffff",
        fillOpacity: 0.75,
        heightFromBase: 32,
        r: 16,
        stroke: "#e0e3eb",
        strokeWidth: 1,
        textFill: "#000000",
        zoomMultiplier: 1.5,
    };

    public static contextType = ChartContext;

    private interval?: number;

    public render() {
        const { chartConfig } = this.context;

        const { width, height } = chartConfig;

        const { heightFromBase, r, fill, fillOpacity, onReset, stroke, strokeWidth, textFill } = this.props;

        const centerX = Math.round(width / 2);
        const y = height - heightFromBase;

        const zoomOutX = centerX - 16 - r * 2;
        const zoomInX = centerX - 8;
        const resetX = centerX + 16 + r * 2;

        return (
            <g className="react-financial-charts-zoom-buttons">
                <circle
                    className="react-financial-charts-button"
                    cx={zoomOutX - r / 2}
                    cy={y + r / 2}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    r={r}
                />
                <g transform={`translate (${zoomOutX - 20}, ${y - 8 + r / 4})`}>
                    <path d="M19,13H5V11H19V13Z" fill={textFill} />
                </g>
                <circle
                    className="react-financial-charts-button"
                    cx={zoomInX - r / 2}
                    cy={y + r / 2}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    r={r}
                />
                <g transform={`translate (${zoomInX - 20}, ${y - 8 + r / 4})`}>
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" fill={textFill} />
                </g>
                <circle
                    className="react-financial-charts-button"
                    cx={resetX - r / 2}
                    cy={y + r / 2}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    r={r}
                />
                <g transform={`translate (${resetX - r}, ${y - 4 + r / 4})`}>
                    <path
                        d="M2.35 2.35A7.958 7.958 0 018 0a8 8 0 110 16c-3.73 0-6.84-2.55-7.73-6h2.08c.82 2.33 3.04 4 5.65 4A6 6 0 108 2c-1.66 0-3.14.69-4.22 1.78L7 7H0V0l2.35 2.35z"
                        fill={textFill}
                    />
                </g>
                <circle
                    className="react-financial-charts-enable-interaction out"
                    onClick={this.handleZoomOut}
                    cx={zoomOutX - r / 2}
                    cy={y + r / 2}
                    r={r}
                    fill="none"
                />
                <circle
                    className="react-financial-charts-enable-interaction in"
                    onClick={this.handleZoomIn}
                    cx={zoomInX - r / 2}
                    cy={y + r / 2}
                    r={r}
                    fill="none"
                />
                <circle
                    className="react-financial-charts-enable-interaction reset"
                    onClick={onReset}
                    cx={resetX - r / 2}
                    cy={y + r / 2}
                    r={r}
                    fill="none"
                />
            </g>
        );
    }

    private readonly handleZoomIn = () => {
        if (this.interval) {
            return;
        }

        this.zoom(-1);
    };

    private readonly handleZoomOut = () => {
        if (this.interval) {
            return;
        }

        this.zoom(1);
    };

    private readonly zoom = (direction: number) => {
        const { xAxisZoom, xScale, plotData, xAccessor } = this.context;

        const cx = xScale(xAccessor(last(plotData)));

        const { zoomMultiplier } = this.props;

        const c = direction > 0 ? 1 * zoomMultiplier : 1 / zoomMultiplier;

        const [start, end] = xScale.domain();
        const [newStart, newEnd] = xScale
            .range()
            .map((x: number) => cx + (x - cx) * c)
            .map(xScale.invert);

        const left = interpolateNumber(start, newStart);
        const right = interpolateNumber(end, newEnd);

        const foo = [0.25, 0.3, 0.5, 0.6, 0.75, 1].map((i) => {
            return [left(i), right(i)];
        });

        this.interval = window.setInterval(() => {
            xAxisZoom(foo.shift());
            if (foo.length === 0) {
                clearInterval(this.interval);
                delete this.interval;
            }
        }, 10);
    };
}
