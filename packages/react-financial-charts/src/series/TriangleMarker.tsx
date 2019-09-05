import * as React from "react";
import { functor, hexToRGBA } from "../utils";

interface TriangleProps {
    direction: "top" | "bottom" | "left" | "right" | "hide";
    stroke: string | any; // func
    fill: string | any;
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

export class Triangle extends React.Component<TriangleProps> {

    public static defaultProps = {
        direction: "top",
        stroke: "#4682B4",
        strokeWidth: 1,
        opacity: 0.5,
        fill: "#4682B4",
        className: "react-stockcharts-marker-triangle",
    };

    public static drawOnCanvas = (props, point, ctx) => {
        const { stroke, fill, opacity, strokeWidth } = props;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        if (fill !== "none") {
            ctx.fillStyle = hexToRGBA(fill, opacity);
        }
        Triangle.drawOnCanvasWithNoStateChange(props, point, ctx);
    }

    public static drawOnCanvasWithNoStateChange = (props, point, ctx) => {

        const { width } = props;
        const w = functor(width)(point.datum);
        const { x, y } = point;
        const { innerOpposite, innerHypotenuse } = getTrianglePoints(w);
        const rotationDeg = getRotationInDegrees(props, point);

        ctx.beginPath();
        ctx.moveTo(x, y - innerHypotenuse);
        ctx.lineTo(x + (w / 2), y + innerOpposite);
        ctx.lineTo(x - (w / 2), y + innerOpposite);
        ctx.stroke();

        // TODO: rotation does not work
        // example: https://gist.github.com/geoffb/6392450
        if (rotationDeg !== null && rotationDeg !== 0) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotationDeg * Math.PI / 180); // 45 degrees
            ctx.fill();
            ctx.restore();
        }
        ctx.fill();
    }

    public render() {

        const {
            className, strokeWidth,
            opacity, point, width,
        } = this.props;

        const rotation = getRotationInDegrees(this.props, point);
        if (rotation == null) {
            return null;
        }

        const fillColor = getFillColor(this.props);
        const strokeColor = getStrokeColor(this.props);

        const w = functor(width)(point.datum);
        const { x, y } = point;
        const { innerOpposite, innerHypotenuse } = getTrianglePoints(w);
        const points = `
		${x} ${y - innerHypotenuse},
		${x + (w / 2)} ${y + innerOpposite},
		${x - (w / 2)} ${y + innerOpposite}
	    `;

        return (
            <polygon
                className={className}
                points={points}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fillOpacity={opacity}
                fill={fillColor}
                transform={rotation !== 0 ? `rotate(${rotation}, ${x}, ${y})` : undefined}
            />
        );
    }
}

function getTrianglePoints(width) {
    const innerHypotenuse = (width / 2) * (1 / Math.cos(30 * Math.PI / 180));
    const innerOpposite = (width / 2) * (1 / Math.tan(60 * Math.PI / 180));
    return {
        innerOpposite,
        innerHypotenuse,
    };
}

function getFillColor(props) {
    const { fill, point } = props;

    return fill instanceof Function ? fill(point.datum) : fill;
}

function getStrokeColor(props) {
    const { stroke, point } = props;

    return stroke instanceof Function ? stroke(point.datum) : stroke;
}

function getRotationInDegrees(props, point) {
    const { direction } = props;
    const directionVal = direction instanceof Function ? direction(point.datum) : direction;
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
}
