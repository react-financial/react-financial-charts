import * as React from "react";

import { hexToRGBA, identity, isNotDefined } from "../utils";

function tickTransform_svg_axisX(scale, tick) {
    return [Math.round(scale(tick)), 0];
}

function tickTransform_svg_axisY(scale, tick) {
    return [0, Math.round(scale(tick))];
}

interface TickProps {
    transform: number[];
    tickStroke?: string;
    tickStrokeOpacity?: number;
    textAnchor?: string;
    fontSize?: number;
    fontFamily?: string;
    x?: number;
    y?: number;
    x2?: number;
    y2?: number;
    dy?: string;
}

class Tick extends React.Component<TickProps> {

    public static drawOnCanvasStatic = (tick, ctx, result) => {
        const { scale, tickTransform, canvas_dy, x, y, x2, y2, format } = result;

        const origin = tickTransform(scale, tick);

        ctx.beginPath();

        ctx.moveTo(origin[0], origin[1]);
        ctx.lineTo(origin[0] + x2, origin[1] + y2);
        ctx.stroke();

        ctx.fillText(format(tick), origin[0] + x, origin[1] + y + canvas_dy);
    }

    public render() {
        const { transform, tickStroke, tickStrokeOpacity, textAnchor, fontSize, fontFamily } = this.props;
        const { x, y, x2, y2, dy } = this.props;
        return (
            <g className="tick" transform={`translate(${transform[0]}, ${transform[1]})`} >
                <line shapeRendering="crispEdges" opacity={tickStrokeOpacity} stroke={tickStroke} x2={x2} y2={y2} />
                <text
                    dy={dy} x={x} y={y}
                    fill={tickStroke}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    textAnchor={textAnchor}>
                    {this.props.children}
                </text>
            </g>
        );
    }
}

interface AxisTicksProps {
    orient: "top" | "bottom" | "left" | "right";
    innerTickSize?: number;
    tickFormat?: any; // func
    tickPadding?: number;
    ticks?: number[];
    tickValues?: number[];
    scale: any; // func
    tickStroke?: string;
    tickStrokeOpacity?: number;
}

// tslint:disable-next-line: max-classes-per-file
export class AxisTicks extends React.Component<AxisTicksProps> {

    public static defaultProps = {
        innerTickSize: 5,
        tickPadding: 6,
        ticks: [10],
        tickStroke: "#000",
        tickStrokeOpacity: 1,
    };

    public static drawOnCanvasStatic = (props, ctx, xScale, yScale) => {
        props = { ...AxisTicks.defaultProps, ...props };

        const { orient } = props;
        const xAxis = (orient === "bottom" || orient === "top");

        const result = AxisTicks.helper(props, xAxis ? xScale : yScale);

        const { tickStroke, tickStrokeOpacity, textAnchor, fontSize, fontFamily } = result;

        ctx.strokeStyle = hexToRGBA(tickStroke, tickStrokeOpacity);

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = tickStroke;
        ctx.textAlign = textAnchor === "middle" ? "center" : textAnchor;

        result.ticks.forEach((tick) => {
            Tick.drawOnCanvasStatic(tick, ctx, result);
        });
    }

    public static helper = (props, scale) => {
        const { orient, innerTickSize, tickFormat, tickPadding, fontSize, fontFamily } = props;
        const { ticks: tickArguments, tickValues, tickStroke, tickStrokeOpacity } = props;

        const ticks = isNotDefined(tickValues)
            ? (scale.ticks
                ? scale.ticks(...tickArguments)
                : scale.domain())
            : tickValues;

        const baseFormat = scale.tickFormat
            ? scale.tickFormat(...tickArguments)
            : identity;

        const format = isNotDefined(tickFormat)
            ? baseFormat
            : (d) => baseFormat(d) ? tickFormat(d) : "";

        const sign = orient === "top" || orient === "left" ? -1 : 1;
        const tickSpacing = Math.max(innerTickSize, 0) + tickPadding;

        let tickTransform;
        let x;
        let y;
        let x2;
        let y2;
        let dy;
        // tslint:disable-next-line: variable-name
        let canvas_dy;
        let textAnchor;

        if (orient === "bottom" || orient === "top") {
            tickTransform = tickTransform_svg_axisX;
            x2 = 0;
            y2 = sign * innerTickSize;
            x = 0;
            y = sign * tickSpacing;
            dy = sign < 0 ? "0em" : ".71em";
            canvas_dy = sign < 0 ? 0 : (fontSize * .71);
            textAnchor = "middle";
        } else {
            tickTransform = tickTransform_svg_axisY;
            x2 = sign * innerTickSize;
            y2 = 0;
            x = sign * tickSpacing;
            y = 0;
            dy = ".32em";
            canvas_dy = (fontSize * .32);
            textAnchor = sign < 0 ? "end" : "start";
        }
        return {
            ticks,
            scale,
            tickTransform,
            tickStroke, tickStrokeOpacity, dy, canvas_dy, x, y, x2, y2, textAnchor, fontSize, fontFamily, format,
        };
    }

    public render() {
        const result = AxisTicks.helper(this.props, this.props.scale);
        const {
            ticks,
            scale,
            tickTransform,
            tickStroke,
            tickStrokeOpacity,
            dy,
            x,
            y,
            x2,
            y2,
            textAnchor, fontSize, fontFamily, format } = result;

        return (
            <g>
                {ticks.map((tick, idx) => {
                    return (
                        <Tick key={idx} transform={tickTransform(scale, tick)}
                            tickStroke={tickStroke} tickStrokeOpacity={tickStrokeOpacity}
                            dy={dy} x={x} y={y}
                            x2={x2} y2={y2} textAnchor={textAnchor}
                            fontSize={fontSize} fontFamily={fontFamily}>{format(tick)}</Tick>
                    );
                })}
            </g>
        );
    }
}
