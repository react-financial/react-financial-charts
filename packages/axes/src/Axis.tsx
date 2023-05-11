import {
    first,
    GenericChartComponent,
    getAxisCanvas,
    getStrokeDasharrayCanvas,
    last,
    strokeDashTypes,
} from "@react-financial-charts/core";
import { range as d3Range, zip } from "d3-array";
import { forceCollide, forceSimulation, forceX } from "d3-force";
import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";
import { AxisZoomCapture } from "./AxisZoomCapture";

interface AxisProps {
    readonly axisZoomCallback?: (domain: number[]) => void;
    readonly bg: {
        h: number;
        x: number;
        w: number;
        y: number;
    };
    readonly className?: string;
    readonly domainClassName?: string;
    readonly edgeClip: boolean;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly getMouseDelta: (startXY: [number, number], mouseXY: [number, number]) => number;
    readonly getScale: (moreProps: any) => ScaleContinuousNumeric<number, number>;
    readonly innerTickSize?: number;
    readonly inverted?: boolean;
    readonly onContextMenu?: (e: React.MouseEvent, mousePosition: [number, number]) => void;
    readonly onDoubleClick?: (e: React.MouseEvent, mousePosition: [number, number]) => void;
    readonly orient?: "top" | "left" | "right" | "bottom";
    readonly outerTickSize: number;
    readonly range: number[];
    readonly showDomain?: boolean;
    readonly showGridLines?: boolean;
    readonly showTicks?: boolean;
    readonly showTickLabel?: boolean;
    readonly strokeStyle: string;
    readonly strokeWidth: number;
    readonly tickFormat?: (data: any) => string;
    readonly tickPadding?: number;
    readonly tickSize?: number;
    readonly ticks?: number;
    readonly tickLabelFill?: string;
    readonly tickStrokeStyle?: string;
    readonly tickStrokeWidth?: number;
    readonly tickStrokeDasharray?: strokeDashTypes;
    readonly tickValues?: number[] | ((domain: number[]) => number[]);
    readonly tickInterval?: number;
    readonly tickIntervalFunction?: (min: number, max: number, tickInterval: number) => number[];
    readonly transform: number[];
    readonly zoomEnabled?: boolean;
    readonly zoomCursorClassName?: string;
}

interface Tick {
    value: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    labelX: number;
    labelY: number;
}

export class Axis extends React.Component<AxisProps> {
    public static defaultProps = {
        edgeClip: false,
        zoomEnabled: false,
        zoomCursorClassName: "",
    };

    private readonly chartRef = React.createRef<GenericChartComponent>();

    public render() {
        const {
            bg,
            axisZoomCallback,
            className,
            zoomCursorClassName,
            zoomEnabled,
            getScale,
            inverted,
            transform,
            getMouseDelta,
            edgeClip,
            onContextMenu,
            onDoubleClick,
        } = this.props;

        const zoomCapture = zoomEnabled ? (
            <AxisZoomCapture
                bg={bg}
                getScale={getScale}
                getMoreProps={this.getMoreProps}
                getMouseDelta={getMouseDelta}
                axisZoomCallback={axisZoomCallback}
                className={className}
                zoomCursorClassName={zoomCursorClassName}
                inverted={inverted}
                onContextMenu={onContextMenu}
                onDoubleClick={onDoubleClick}
            />
        ) : null;

        return (
            <g transform={`translate(${transform[0]}, ${transform[1]})`}>
                {zoomCapture}
                <GenericChartComponent
                    ref={this.chartRef}
                    canvasToDraw={getAxisCanvas}
                    clip={false}
                    edgeClip={edgeClip}
                    canvasDraw={this.drawOnCanvas}
                    drawOn={["pan"]}
                />
            </g>
        );
    }

    private readonly getMoreProps = () => {
        return this.chartRef.current!.getMoreProps();
    };

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const { showDomain, showGridLines, showTickLabel, showTicks, transform, range, getScale, tickLabelFill } =
            this.props;

        ctx.save();
        ctx.translate(transform[0], transform[1]);

        const scale = getScale(moreProps);
        const tickProps = tickHelper(this.props, scale);
        if (showTicks) {
            drawTicks(ctx, tickProps);
        }

        if (showGridLines) {
            tickProps.ticks.forEach((tick) => {
                drawGridLine(ctx, tick, tickProps, moreProps);
            });
        }

        if (showTickLabel) {
            const { fontFamily, fontSize, fontWeight, textAnchor } = tickProps;

            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
            if (tickLabelFill !== undefined) {
                ctx.fillStyle = tickLabelFill;
            }
            ctx.textAlign = textAnchor === "middle" ? "center" : (textAnchor as CanvasTextAlign);
            tickProps.ticks.forEach((tick: any) => {
                drawEachTickLabel(ctx, tick, tickProps);
            });
        }

        if (showDomain) {
            drawAxisLine(ctx, this.props, range);
        }

        ctx.restore();
    };
}

const tickHelper = (props: AxisProps, scale: ScaleContinuousNumeric<number, number>) => {
    const {
        orient,
        innerTickSize = 4,
        tickFormat,
        tickPadding = 4,
        tickLabelFill,
        tickStrokeWidth,
        tickStrokeDasharray,
        fontSize = 12,
        fontFamily,
        fontWeight,
        showTicks,
        showTickLabel,
        ticks: tickArguments,
        tickValues: tickValuesProp,
        tickStrokeStyle,
        tickInterval,
        tickIntervalFunction,
        ...rest
    } = props;

    let tickValues: number[];
    if (tickValuesProp !== undefined) {
        if (typeof tickValuesProp === "function") {
            tickValues = tickValuesProp(scale.domain());
        } else {
            tickValues = tickValuesProp;
        }
    } else if (tickInterval !== undefined) {
        const [min, max] = scale.domain();
        const baseTickValues = d3Range(min, max, (max - min) / tickInterval);

        tickValues = tickIntervalFunction ? tickIntervalFunction(min, max, tickInterval) : baseTickValues;
    } else if (scale.ticks !== undefined) {
        tickValues = scale.ticks(tickArguments);
    } else {
        tickValues = scale.domain();
    }

    const format = tickFormat === undefined ? scale.tickFormat(tickArguments) : (d: any) => tickFormat(d) || "";

    const sign = orient === "top" || orient === "left" ? -1 : 1;
    const tickSpacing = Math.max(innerTickSize, 0) + tickPadding;

    let ticks: Tick[];
    let dy;
    // tslint:disable-next-line: variable-name
    let canvas_dy;
    let textAnchor;

    if (orient === "bottom" || orient === "top") {
        dy = sign < 0 ? "0em" : ".71em";
        canvas_dy = sign < 0 ? 0 : fontSize * 0.71;
        textAnchor = "middle";

        const y2 = sign * innerTickSize;
        const labelY = sign * tickSpacing;

        ticks = tickValues.map((d) => {
            const x = Math.round(scale(d));
            return {
                value: d,
                x1: x,
                y1: 0,
                x2: x,
                y2,
                labelX: x,
                labelY,
            };
        });

        if (showTicks) {
            const nodes = ticks.map((d) => ({ id: d.value, value: d.value, fy: d.y2, origX: d.x1 }));

            const simulation = forceSimulation(nodes)
                .force("x", forceX<any>((d) => d.origX).strength(1))
                .force("collide", forceCollide(22))
                .stop();

            for (let i = 0; i < 100; ++i) {
                simulation.tick();
            }

            // @ts-ignore
            ticks = zip(ticks, nodes).map((d) => {
                const a: any = d[0];
                const b: any = d[1];

                if (Math.abs(b.x - b.origX) > 0.01) {
                    return {
                        ...a,
                        x2: b.x,
                        labelX: b.x,
                    };
                }
                return a;
            });
        }
    } else {
        ticks = tickValues.map((d) => {
            const y = Math.round(scale(d));
            const x2 = sign * innerTickSize;
            const labelX = sign * tickSpacing;
            return {
                value: d,
                x1: 0,
                y1: y,
                x2,
                y2: y,
                labelX,
                labelY: y,
            };
        });

        dy = ".32em";
        canvas_dy = fontSize * 0.32;
        textAnchor = sign < 0 ? "end" : "start";
    }

    return {
        orient,
        ticks,
        scale,
        tickStrokeStyle,
        tickLabelFill: tickLabelFill || tickStrokeStyle,
        tickStrokeWidth,
        tickStrokeDasharray,
        dy,
        canvas_dy,
        textAnchor,
        fontSize,
        fontFamily,
        fontWeight,
        format,
        showTickLabel,
        ...rest,
    };
};

const drawAxisLine = (ctx: CanvasRenderingContext2D, props: AxisProps, range: any) => {
    const { orient, outerTickSize, strokeStyle, strokeWidth } = props;

    const sign = orient === "top" || orient === "left" ? -1 : 1;
    const xAxis = orient === "bottom" || orient === "top";

    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeStyle;

    ctx.beginPath();

    const firstPoint = first(range);
    const lastPoint = last(range);
    const tickSize = sign * outerTickSize;
    if (xAxis) {
        ctx.moveTo(firstPoint, tickSize);
        ctx.lineTo(firstPoint, 0);
        ctx.lineTo(lastPoint, 0);
        ctx.lineTo(lastPoint, tickSize);
    } else {
        ctx.moveTo(tickSize, firstPoint);
        ctx.lineTo(0, firstPoint);
        ctx.lineTo(0, lastPoint);
        ctx.lineTo(tickSize, lastPoint);
    }

    ctx.stroke();
};

const drawTicks = (ctx: CanvasRenderingContext2D, result: any) => {
    const { ticks, tickStrokeStyle } = result;

    if (tickStrokeStyle !== undefined) {
        ctx.strokeStyle = tickStrokeStyle;
        ctx.fillStyle = tickStrokeStyle;
    }

    ticks.forEach((tick: any) => {
        drawEachTick(ctx, tick, result);
    });
};

const drawGridLine = (ctx: CanvasRenderingContext2D, tick: Tick, result: any, moreProps: any) => {
    const { orient, gridLinesStrokeWidth, gridLinesStrokeStyle, gridLinesStrokeDasharray } = result;

    const { chartConfig } = moreProps;

    const { height, width } = chartConfig;

    if (gridLinesStrokeStyle !== undefined) {
        ctx.strokeStyle = gridLinesStrokeStyle;
    }
    ctx.beginPath();

    const sign = orient === "top" || orient === "left" ? 1 : -1;

    switch (orient) {
        case "top":
        case "bottom":
            ctx.moveTo(tick.x1, 0);
            ctx.lineTo(tick.x2, sign * height);
            break;
        default:
            ctx.moveTo(0, tick.y1);
            ctx.lineTo(sign * width, tick.y2);
            break;
    }
    ctx.lineWidth = gridLinesStrokeWidth;

    const lineDash = getStrokeDasharrayCanvas(gridLinesStrokeDasharray);

    ctx.setLineDash(lineDash);
    ctx.stroke();
};

const drawEachTick = (ctx: CanvasRenderingContext2D, tick: any, result: any) => {
    const { tickStrokeWidth, tickStrokeDasharray } = result;

    ctx.beginPath();

    ctx.moveTo(tick.x1, tick.y1);
    ctx.lineTo(tick.x2, tick.y2);
    ctx.lineWidth = tickStrokeWidth;

    const lineDash = getStrokeDasharrayCanvas(tickStrokeDasharray);

    ctx.setLineDash(lineDash);
    ctx.stroke();
};

const drawEachTickLabel = (ctx: CanvasRenderingContext2D, tick: any, result: any) => {
    const { canvas_dy, format } = result;

    const text = format(tick.value);

    ctx.beginPath();

    ctx.fillText(text, tick.labelX, tick.labelY + canvas_dy);
};
