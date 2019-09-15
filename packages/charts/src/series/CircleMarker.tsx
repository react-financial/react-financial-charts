import * as React from "react";

import { colorToRGBA, functor } from "../utils";

interface CircleProps {
    readonly className?: string;
    readonly fill?: string;
    readonly opacity?: number;
    readonly point: {
        x: number,
        y: number,
        datum: any,
    };
    readonly r: number | ((datum: any) => number);
    readonly stroke?: string;
    readonly strokeWidth?: number;
}

export class Circle extends React.Component<CircleProps> {

    public static defaultProps = {
        stroke: "#4682B4",
        strokeWidth: 1,
        opacity: 0.5,
        fill: "#4682B4",
        className: "react-financial-charts-marker-circle",
    };

    public static drawOnCanvas = (props: CircleProps, point, ctx: CanvasRenderingContext2D) => {

        const {
            stroke = Circle.defaultProps.stroke,
            fill = Circle.defaultProps.fill,
            opacity,
            strokeWidth = Circle.defaultProps.strokeWidth,
        } = props;

        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;

        if (fill !== "none") {
            ctx.fillStyle = colorToRGBA(fill, opacity);
        }

        Circle.drawOnCanvasWithNoStateChange(props, point, ctx);
    }

    public static drawOnCanvasWithNoStateChange = (props: CircleProps, point, ctx: CanvasRenderingContext2D) => {

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
