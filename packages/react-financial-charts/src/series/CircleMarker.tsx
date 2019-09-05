import * as React from "react";

import { functor, hexToRGBA } from "../utils";

interface CircleProps {
    stroke?: string;
    fill: string;
    opacity: number;
    point: {
        x: number,
        y: number,
        datum: any,
    };
    className?: string;
    strokeWidth?: number;
    r: number | any; // func
}

export class Circle extends React.Component<CircleProps> {

    public static defaultProps = {
        stroke: "#4682B4",
        strokeWidth: 1,
        opacity: 0.5,
        fill: "#4682B4",
        className: "react-stockcharts-marker-circle",
    };

    public static drawOnCanvas = (props, point, ctx) => {

        const { stroke, fill, opacity, strokeWidth } = props;

        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;

        if (fill !== "none") {
            ctx.fillStyle = hexToRGBA(fill, opacity);
        }

        Circle.drawOnCanvasWithNoStateChange(props, point, ctx);
    }

    public static drawOnCanvasWithNoStateChange = (props, point, ctx) => {

        const { r } = props;
        const radius = functor(r)(point.datum);

        ctx.moveTo(point.x, point.y);
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.fill();
    }

    public render() {
        const { className, stroke, strokeWidth, opacity, fill, point, r } = this.props;
        const radius = functor(r)(point.datum);
        return (
            <circle
                className={className}
                cx={point.x}
                cy={point.y}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fillOpacity={opacity}
                fill={fill}
                r={radius} />
        );
    }
}
