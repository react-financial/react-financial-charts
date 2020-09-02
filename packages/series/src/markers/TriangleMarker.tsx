import * as React from "react";
import { functor } from "@react-financial-charts/core";

export interface TriangleProps {
    readonly className?: string;
    readonly direction?: "top" | "bottom" | "left" | "right" | "hide" | ((datum: any) => any);
    readonly fillStyle?: string | ((datum: any) => string);
    readonly point: {
        x: number;
        y: number;
        datum: any;
    };
    readonly strokeStyle?: string | ((datum: any) => string);
    readonly strokeWidth?: number;
    readonly width?: number | ((datum: any) => number);
}

export class Triangle extends React.Component<TriangleProps> {
    public static defaultProps = {
        direction: "top",
        fillStyle: "#4682B4",
        className: "react-financial-charts-marker-triangle",
    };

    public static drawOnCanvas = (
        props: TriangleProps,
        point: { x: number; y: number; datum: unknown },
        ctx: CanvasRenderingContext2D,
    ) => {
        const { fillStyle, strokeStyle, strokeWidth, width } = props;

        if (strokeStyle !== undefined) {
            ctx.strokeStyle = functor(strokeStyle)(point.datum);
        }
        if (strokeWidth !== undefined) {
            ctx.lineWidth = strokeWidth;
        }
        if (fillStyle !== undefined) {
            ctx.fillStyle = functor(fillStyle)(point.datum);
        }

        const w = functor(width)(point.datum);
        const { x, y } = point;
        const { innerOpposite, innerHypotenuse } = getTrianglePoints(w);
        const rotationDeg = getRotationInDegrees(props, point);

        ctx.beginPath();
        ctx.moveTo(x, y - innerHypotenuse);
        ctx.lineTo(x + w / 2, y + innerOpposite);
        ctx.lineTo(x - w / 2, y + innerOpposite);

        // TODO: rotation does not work
        // example: https://gist.github.com/geoffb/6392450
        if (rotationDeg !== null && rotationDeg !== 0) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((rotationDeg * Math.PI) / 180); // 45 degrees
            ctx.fill();
            ctx.restore();
        }
        ctx.fill();

        if (strokeStyle !== undefined) {
            ctx.stroke();
        }
    };

    public render() {
        const { className, fillStyle, strokeStyle, strokeWidth, point, width } = this.props;

        const rotation = getRotationInDegrees(this.props, point);
        if (rotation == null) {
            return null;
        }

        const fillColor = functor(fillStyle)(point.datum);
        const strokeColor = functor(strokeStyle)(point.datum);

        const w = functor(width)(point.datum);
        const { x, y } = point;
        const { innerOpposite, innerHypotenuse } = getTrianglePoints(w);
        const points = `
		${x} ${y - innerHypotenuse},
		${x + w / 2} ${y + innerOpposite},
		${x - w / 2} ${y + innerOpposite}
	    `;

        return (
            <polygon
                className={className}
                points={points}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill={fillColor}
                transform={rotation !== 0 ? `rotate(${rotation}, ${x}, ${y})` : undefined}
            />
        );
    }
}

const getTrianglePoints = (width: number) => {
    const innerHypotenuse = (width / 2) * (1 / Math.cos((30 * Math.PI) / 180));
    const innerOpposite = (width / 2) * (1 / Math.tan((60 * Math.PI) / 180));
    return {
        innerOpposite,
        innerHypotenuse,
    };
};

const getRotationInDegrees = (props: TriangleProps, point: any) => {
    const { direction = Triangle.defaultProps.direction } = props;

    const directionVal = functor(direction)(point.datum);
    if (directionVal === "hide") {
        return null;
    }

    let rotate = 0;
    switch (directionVal) {
        case "bottom":
            rotate = 180;
            break;
        case "left":
            rotate = -90;
            break;
        case "right":
            rotate = 90;
            break;
    }
    return rotate;
};
