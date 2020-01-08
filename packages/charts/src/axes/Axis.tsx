import { range as d3Range, zip } from "d3-array";
import { forceCollide, forceSimulation, forceX } from "d3-force";
import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getAxisCanvas } from "../GenericComponent";
import { AxisZoomCapture } from "./AxisZoomCapture";

import { colorToRGBA, first, getStrokeDasharray, getStrokeDasharrayCanvas, identity, isDefined, isNotDefined, last, strokeDashTypes } from "../utils";

interface AxisProps {
    readonly axisZoomCallback?: any; // func
    readonly bg: {
        h: number;
        x: number;
        w: number;
        y: number;
    };
    readonly className?: string;
    readonly domainClassName?: string;
    readonly edgeClip: boolean;
    readonly fill?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: number;
    readonly getMouseDelta: any; // func
    readonly getScale: any; // func
    readonly innerTickSize?: number;
    readonly inverted?: boolean;
    readonly onContextMenu?: any; // func
    readonly onDoubleClick?: any; // func
    readonly orient?: "top" | "left" | "right" | "bottom";
    readonly outerTickSize: number;
    readonly range: number[];
    readonly showDomain?: boolean;
    readonly showTicks?: boolean;
    readonly showTickLabel?: boolean;
    readonly stroke: string;
    readonly strokeOpacity?: number;
    readonly strokeWidth: number;
    readonly tickFormat?: (data: any) => string;
    readonly tickPadding?: number;
    readonly tickSize?: number;
    readonly ticks?: number;
    readonly tickLabelFill?: string;
    readonly tickStroke?: string;
    readonly tickStrokeOpacity?: number;
    readonly tickStrokeWidth?: number;
    readonly tickStrokeDasharray?: strokeDashTypes;
    readonly tickValues?: number[] | any; // func
    readonly tickInterval?: number;
    readonly tickIntervalFunction?: any; // func
    readonly transform: number[];
    readonly zoomEnabled?: boolean;
    readonly zoomCursorClassName?: string;
}

class Axis extends React.Component<AxisProps> {

    public static defaultProps = {
        edgeClip: false,
        zoomEnabled: false,
        zoomCursorClassName: "",
    };

    private readonly chartRef = React.createRef<GenericChartComponent>();

    public render() {
        const {
            bg, axisZoomCallback, className,
            zoomCursorClassName, zoomEnabled, getScale,
            inverted, transform, getMouseDelta,
            edgeClip, onContextMenu, onDoubleClick,
        } = this.props;

        const zoomCapture = zoomEnabled
            ? <AxisZoomCapture
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
            : null;

        return (
            <g transform={`translate(${transform[0]}, ${transform[1]})`}>
                {zoomCapture}
                <GenericChartComponent
                    ref={this.chartRef}
                    canvasToDraw={getAxisCanvas}
                    clip={false}
                    edgeClip={edgeClip}
                    svgDraw={this.renderSVG}
                    canvasDraw={this.drawOnCanvas}
                    drawOn={["pan"]}
                />
            </g>
        );
    }

    private readonly getMoreProps = () => {
        return this.chartRef.current!.getMoreProps();
    }

    private readonly renderSVG = (moreProps) => {
        const { className, showDomain, showTicks, range, getScale } = this.props;

        const scale = getScale(moreProps);
        const ticks = showTicks ? axisTicksSVG(this.props, scale) : null;
        const domain = showDomain ? axisLineSVG(this.props, range) : null;

        return (
            <g className={className}>
                {ticks}
                {domain}
            </g>
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { showDomain, showTicks, transform, range, getScale } = this.props;

        ctx.save();
        ctx.translate(transform[0], transform[1]);

        if (showTicks) {
            const scale = getScale(moreProps);
            const tickProps = tickHelper(this.props, scale);
            drawTicks(ctx, tickProps, moreProps);
        }

        if (showDomain) {
            drawAxisLine(ctx, this.props, range);
        }

        ctx.restore();
    }
}

function tickHelper(props, scale) {
    const {
        orient,
        innerTickSize,
        tickFormat,
        tickPadding,
        tickLabelFill,
        tickStrokeWidth,
        tickStrokeDasharray,
        fontSize,
        fontFamily,
        fontWeight,
        showTicks,
        showTickLabel,
        ticks: tickArguments,
        tickValues: tickValuesProp,
        tickStroke,
        tickStrokeOpacity,
        tickInterval,
        tickIntervalFunction,
        ...rest
    } = props;

    let tickValues;
    if (isDefined(tickValuesProp)) {
        if (typeof tickValuesProp === "function") {
            tickValues = tickValuesProp(scale.domain());
        } else {
            tickValues = tickValuesProp;
        }
    } else if (isDefined(tickInterval)) {
        const [min, max] = scale.domain();
        const baseTickValues = d3Range(min, max, (max - min) / tickInterval);

        tickValues = tickIntervalFunction
            ? tickIntervalFunction(min, max, tickInterval)
            : baseTickValues;
    } else if (isDefined(scale.ticks)) {
        tickValues = scale.ticks(tickArguments);
    } else {
        tickValues = scale.domain();
    }

    const baseFormat = scale.tickFormat
        ? scale.tickFormat(tickArguments)
        : identity;

    const format = isNotDefined(tickFormat)
        ? baseFormat
        : (d: any) => tickFormat(d) || "";

    const sign = orient === "top" || orient === "left" ? -1 : 1;
    const tickSpacing = Math.max(innerTickSize, 0) + tickPadding;

    let ticks;
    let dy;
    // tslint:disable-next-line: variable-name
    let canvas_dy;
    let textAnchor;

    if (orient === "bottom" || orient === "top") {
        dy = sign < 0 ? "0em" : ".71em";
        canvas_dy = sign < 0 ? 0 : (fontSize * .71);
        textAnchor = "middle";

        ticks = tickValues.map((d) => {
            const x = Math.round(scale(d));
            return {
                value: d,
                x1: x,
                y1: 0,
                x2: x,
                y2: sign * innerTickSize,
                labelX: x,
                labelY: sign * tickSpacing,
            };
        });

        if (showTicks) {

            const nodes = ticks.map((d) => ({ id: d.value, value: d.value, fy: d.y2, origX: d.x1 }));

            const simulation = forceSimulation(nodes)
                .force("x", forceX<any>((d) => d.origX).strength(1))
                .force("collide", forceCollide(22))
                .stop();

            for (let i = 0; i < 100; ++i) { simulation.tick(); }

            ticks = zip(ticks, nodes)
                .map((d) => {
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
            return {
                value: d,
                x1: 0,
                y1: y,
                x2: sign * innerTickSize,
                y2: y,
                labelX: sign * tickSpacing,
                labelY: y,
            };
        });

        dy = ".32em";
        canvas_dy = (fontSize * .32);
        textAnchor = sign < 0 ? "end" : "start";
    }

    return {
        orient,
        ticks,
        scale,
        tickStroke,
        tickLabelFill: (tickLabelFill || tickStroke),
        tickStrokeOpacity,
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
}

function axisLineSVG(props: AxisProps, range) {
    const { domainClassName, orient, outerTickSize, fill, stroke, strokeWidth, strokeOpacity } = props;

    const sign = orient === "top" || orient === "left" ? -1 : 1;

    let d;

    if (orient === "bottom" || orient === "top") {
        d = "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize;
    } else {
        d = "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize;
    }

    return (
        <path
            className={domainClassName}
            d={d}
            fill={fill}
            opacity={strokeOpacity}
            stroke={stroke}
            strokeWidth={strokeWidth} >
        </path>
    );
}

function drawAxisLine(ctx: CanvasRenderingContext2D, props: AxisProps, range) {

    const { orient, outerTickSize, stroke, strokeWidth, strokeOpacity } = props;

    const sign = orient === "top" || orient === "left" ? -1 : 1;
    const xAxis = orient === "bottom" || orient === "top";

    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = colorToRGBA(stroke, strokeOpacity);

    ctx.beginPath();

    if (xAxis) {
        ctx.moveTo(first(range), sign * outerTickSize);
        ctx.lineTo(first(range), 0);
        ctx.lineTo(last(range), 0);
        ctx.lineTo(last(range), sign * outerTickSize);
    } else {
        ctx.moveTo(sign * outerTickSize, first(range));
        ctx.lineTo(0, first(range));
        ctx.lineTo(0, last(range));
        ctx.lineTo(sign * outerTickSize, last(range));
    }

    ctx.stroke();
}

interface TickProps {
    readonly children: string;
    readonly dy: string;
    readonly fontSize?: number;
    readonly fontFamily?: string;
    readonly fontWeight?: number | string;
    readonly labelX: number;
    readonly labelY: number;
    readonly textAnchor?: string;
    readonly tickStroke?: string;
    readonly tickLabelFill?: string;
    readonly tickStrokeWidth?: number;
    readonly tickStrokeOpacity?: number;
    readonly tickStrokeDasharray?: strokeDashTypes;
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
}

function Tick(props: TickProps) {
    const {
        tickLabelFill,
        tickStroke,
        tickStrokeOpacity,
        tickStrokeDasharray,
        tickStrokeWidth,
        textAnchor,
        fontSize,
        fontFamily,
        fontWeight,
        x1,
        y1,
        x2,
        y2,
        labelX,
        labelY,
        dy,
    } = props;

    return (
        <g className="tick">
            <line
                shapeRendering="crispEdges"
                opacity={tickStrokeOpacity}
                stroke={tickStroke}
                strokeWidth={tickStrokeWidth}
                strokeDasharray={getStrokeDasharray(tickStrokeDasharray)}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2} />
            <text
                dy={dy}
                x={labelX}
                y={labelY}
                fill={tickLabelFill}
                fontSize={fontSize}
                fontWeight={fontWeight}
                fontFamily={fontFamily}
                textAnchor={textAnchor}>
                {props.children}
            </text>
        </g>
    );
}

function axisTicksSVG(props, scale) {
    const result = tickHelper(props, scale);

    const { tickLabelFill, tickStroke, tickStrokeOpacity, tickStrokeWidth, tickStrokeDasharray, textAnchor } = result;
    const { fontSize, fontFamily, fontWeight, ticks, format, dy } = result;

    return (
        <g>
            {ticks.map((tick, idx) => {
                return (
                    <Tick key={idx}
                        tickStroke={tickStroke}
                        tickLabelFill={tickLabelFill}
                        tickStrokeWidth={tickStrokeWidth}
                        tickStrokeOpacity={tickStrokeOpacity}
                        tickStrokeDasharray={tickStrokeDasharray}
                        dy={dy}
                        x1={tick.x1} y1={tick.y1}
                        x2={tick.x2} y2={tick.y2}
                        labelX={tick.labelX} labelY={tick.labelY}
                        textAnchor={textAnchor}
                        fontSize={fontSize}
                        fontWeight={fontWeight}
                        fontFamily={fontFamily}>{format(tick.value)}</Tick>
                );
            })}
        </g>
    );
}

function drawTicks(ctx: CanvasRenderingContext2D, result, moreProps) {

    const { showGridLines, tickStroke, tickStrokeOpacity, tickLabelFill } = result;
    const { textAnchor, fontSize, fontFamily, fontWeight, ticks, showTickLabel } = result;

    ctx.strokeStyle = colorToRGBA(tickStroke, tickStrokeOpacity);

    ctx.fillStyle = tickStroke;

    ticks.forEach((tick) => {
        drawEachTick(ctx, tick, result);
    });

    if (showGridLines) {
        ticks.forEach((tick) => {
            drawGridLine(ctx, tick, result, moreProps);
        });
    }

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = tickLabelFill;
    ctx.textAlign = textAnchor === "middle" ? "center" : textAnchor;

    if (showTickLabel) {
        ticks.forEach((tick) => {
            drawEachTickLabel(ctx, tick, result);
        });
    }
}

function drawGridLine(ctx: CanvasRenderingContext2D, tick, result, moreProps) {
    const { orient, gridLinesStrokeWidth, gridLinesStroke, gridLinesStrokeDasharray } = result;

    const { chartConfig } = moreProps;

    const { height, width } = chartConfig;

    ctx.strokeStyle = colorToRGBA(gridLinesStroke);
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
}

function drawEachTick(ctx: CanvasRenderingContext2D, tick, result) {
    const { tickStrokeWidth, tickStrokeDasharray } = result;

    ctx.beginPath();

    ctx.moveTo(tick.x1, tick.y1);
    ctx.lineTo(tick.x2, tick.y2);
    ctx.lineWidth = tickStrokeWidth;

    const lineDash = getStrokeDasharrayCanvas(tickStrokeDasharray);

    ctx.setLineDash(lineDash);
    ctx.stroke();
}

function drawEachTickLabel(ctx: CanvasRenderingContext2D, tick, result) {
    const { canvas_dy, format } = result;

    const text = format(tick.value);

    ctx.beginPath();

    ctx.fillText(text, tick.labelX, tick.labelY + canvas_dy);
}

export default Axis;
