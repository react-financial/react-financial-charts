import * as React from "react";
import { first, hexToRGBA, last } from "../utils";

interface AxisLineProps {
    className?: string;
    shapeRendering?: string;
    orient: string;
    scale: any; // func
    outerTickSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    range: number[];
}

/*
function d3_scaleExtent(domain) {
	var start = domain[0], stop = domain[domain.length - 1];
	return start < stop ? [start, stop] : [stop, start];
}

function d3_scaleRange(scale) {
	return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
}
*/
export class AxisLine extends React.Component<AxisLineProps> {

    public static defaultProps = {
        className: "react-stockcharts-axis-line",
        shapeRendering: "crispEdges",
        fill: "none",
        stroke: "#000000",
        strokeWidth: 1,
        opacity: 1,
    };

    public static drawOnCanvasStatic = (props, ctx/* , xScale, yScale*/) => {
        props = { ...AxisLine.defaultProps, ...props };

        const { orient, outerTickSize, stroke, strokeWidth, opacity, range } = props;

        const sign = orient === "top" || orient === "left" ? -1 : 1;
        const xAxis = (orient === "bottom" || orient === "top");

        // var range = d3_scaleRange(xAxis ? xScale : yScale);

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = hexToRGBA(stroke, opacity);

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

    public render() {
        const {
            orient,
            outerTickSize = 0,
            fill,
            stroke,
            strokeWidth,
            className,
            shapeRendering,
            opacity,
            range,
        } = this.props;

        const sign = orient === "top" || orient === "left" ? -1 : 1;

        // var range = d3_scaleRange(scale);

        let d;

        if (orient === "bottom" || orient === "top") {
            d = "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize;
        } else {
            d = "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize;
        }

        return (
            <path
                className={className}
                shapeRendering={shapeRendering}
                d={d}
                fill={fill}
                opacity={opacity}
                stroke={stroke}
                strokeWidth={strokeWidth} >
            </path>
        );
    }
}
