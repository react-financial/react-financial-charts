import * as React from "react";
import { colorToRGBA, functor } from "../utils";

interface SquareProps {
    readonly stroke?: string;
    readonly fill: string;
    readonly opacity: number;
    readonly point: {
        x: number,
        y: number,
        datum: any,
    };
    readonly className?: string;
    readonly strokeWidth?: number;
    readonly width: number | ((datum: any) => number);
}

export class Square extends React.Component<SquareProps> {

    public static defaultProps = {
        stroke: "#4682B4",
        strokeWidth: 1,
        opacity: 0.5,
        fill: "#4682B4",
        className: "react-financial-charts-marker-rect",
    };

    public static drawOnCanvas = (props: SquareProps, point, ctx: CanvasRenderingContext2D) => {
        const {
            stroke = Square.defaultProps.stroke,
            fill,
            opacity,
            strokeWidth = Square.defaultProps.strokeWidth,
        } = props;

        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        if (fill !== "none") {
            ctx.fillStyle = colorToRGBA(fill, opacity);
        }
        Square.drawOnCanvasWithNoStateChange(props, point, ctx);
    }

    public static drawOnCanvasWithNoStateChange = (props: SquareProps, point, ctx: CanvasRenderingContext2D) => {
        const { width } = props;
        const w = functor(width)(point.datum);
        const x = point.x - (w / 2);
        const y = point.y - (w / 2);
        ctx.beginPath();
        ctx.rect(x, y, w, w);
        ctx.stroke();
        ctx.fill();
    }

    public render() {
        const { className, stroke, strokeWidth, opacity, fill, point, width } = this.props;
        const w = functor(width)(point.datum);
        const x = point.x - (w / 2);
        const y = point.y - (w / 2);

        return (
            <rect
                className={className}
                x={x}
                y={y}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fillOpacity={opacity}
                fill={fill}
                width={w}
                height={w}
            />
        );
    }
}
