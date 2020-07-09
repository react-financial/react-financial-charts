import { functor } from "@react-financial-charts/core";
import * as React from "react";

interface CircleMarkerProps {
    readonly className?: string;
    readonly fillStyle?: string;
    readonly opacity?: number;
    readonly point: {
        x: number;
        y: number;
        datum: unknown;
    };
    readonly r: number | ((datum: unknown) => number);
    readonly strokeStyle?: string;
    readonly strokeWidth?: number;
}

export class CircleMarker extends React.Component<CircleMarkerProps> {
    public static defaultProps = {
        strokeStyle: "#4682B4",
        strokeWidth: 1,
        opacity: 0.5,
        fillStyle: "#4682B4",
        className: "react-financial-charts-marker-circle",
    };

    public static drawOnCanvas = (
        props: CircleMarkerProps,
        point: { x: number; y: number; datum: unknown },
        ctx: CanvasRenderingContext2D,
    ) => {
        const { strokeStyle, fillStyle, r, strokeWidth } = props;

        if (strokeStyle !== undefined) {
            ctx.strokeStyle = strokeStyle;
        }
        if (strokeWidth !== undefined) {
            ctx.lineWidth = strokeWidth;
        }
        if (fillStyle !== undefined) {
            ctx.fillStyle = fillStyle;
        }

        const radius = functor(r)(point.datum);

        ctx.moveTo(point.x, point.y);
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.fill();
    };

    public render() {
        const { className, strokeStyle, strokeWidth, opacity, fillStyle, point, r } = this.props;
        const radius = functor(r)(point.datum);

        return (
            <circle
                className={className}
                cx={point.x}
                cy={point.y}
                stroke={strokeStyle}
                strokeWidth={strokeWidth}
                fillOpacity={opacity}
                fill={fillStyle}
                r={radius}
            />
        );
    }
}
