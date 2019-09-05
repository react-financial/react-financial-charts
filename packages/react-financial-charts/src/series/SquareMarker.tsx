import * as React from "react";
import { functor, hexToRGBA } from "../utils";

interface SquareProps {
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
    width: number | any; // func
}

export class Square extends React.Component<SquareProps> {

    public static defaultProps = {
        stroke: "#4682B4",
        strokeWidth: 1,
        opacity: 0.5,
        fill: "#4682B4",
        className: "react-stockcharts-marker-rect",
    };

    public static drawOnCanvas = (props, point, ctx) => {
        const { stroke, fill, opacity, strokeWidth } = props;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        if (fill !== "none") {
            ctx.fillStyle = hexToRGBA(fill, opacity);
        }
        Square.drawOnCanvasWithNoStateChange(props, point, ctx);
    }

    public static drawOnCanvasWithNoStateChange = (props, point, ctx) => {
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
        const {
            className, stroke, strokeWidth,
            opacity, fill, point, width,
        } = this.props;
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
