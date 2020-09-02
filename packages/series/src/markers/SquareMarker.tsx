import * as React from "react";
import { functor } from "@react-financial-charts/core";

export interface SquareProps {
    readonly className?: string;
    readonly fillStyle?: string;
    readonly point: {
        x: number;
        y: number;
        datum: any;
    };
    readonly strokeStyle?: string;
    readonly strokeWidth?: number;
    readonly width: number | ((datum: any) => number);
}

export class Square extends React.Component<SquareProps> {
    public static defaultProps = {
        fillStyle: "#4682B4",
        className: "react-financial-charts-marker-rect",
    };

    public static drawOnCanvas = (
        props: SquareProps,
        point: { x: number; y: number; datum: unknown },
        ctx: CanvasRenderingContext2D,
    ) => {
        const { strokeStyle, fillStyle, strokeWidth, width } = props;

        if (strokeStyle !== undefined) {
            ctx.strokeStyle = strokeStyle;
        }
        if (strokeWidth !== undefined) {
            ctx.lineWidth = strokeWidth;
        }
        if (fillStyle !== undefined) {
            ctx.fillStyle = fillStyle;
        }

        const w = functor(width)(point.datum);
        const x = point.x - w / 2;
        const y = point.y - w / 2;
        ctx.beginPath();
        ctx.rect(x, y, w, w);
        ctx.fill();

        if (strokeStyle !== undefined) {
            ctx.stroke();
        }
    };

    public render() {
        const { className, strokeStyle, strokeWidth, fillStyle, point, width } = this.props;
        const w = functor(width)(point.datum);
        const x = point.x - w / 2;
        const y = point.y - w / 2;

        return (
            <rect
                className={className}
                x={x}
                y={y}
                stroke={strokeStyle}
                strokeWidth={strokeWidth}
                fill={fillStyle}
                width={w}
                height={w}
            />
        );
    }
}
