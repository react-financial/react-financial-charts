import * as React from "react";
import { functor } from "../utils";

interface BarAnnotationProps {
    readonly className?: string;
    readonly path?: any; // func
    readonly onClick?: any; // func
    readonly xAccessor?: any; // func
    readonly xScale?: any; // func
    readonly yScale?: any; // func
    readonly datum?: object;
    readonly stroke?: string;
    readonly fill?: string;
    readonly opacity?: number;
    readonly text?: string;
    readonly textAnchor?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly textOpacity?: number;
    readonly textFill?: string;
    readonly textRotate?: number;
    readonly textXOffset?: number;
    readonly textYOffset?: number;
    readonly textIcon?: string;
    readonly textIconFontSize?: number;
    readonly textIconOpacity?: number;
    readonly textIconFill?: string;
    readonly textIconRotate?: number;
    readonly textIconXOffset?: number;
    readonly textIconYOffset?: number;
    readonly textIconAnchor?: string;
}

export class BarAnnotation extends React.Component<BarAnnotationProps> {

    public static defaultProps = {
        className: "react-stockcharts-bar-annotation",
        opacity: 1,
        fill: "#000000",
        textAnchor: "middle",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 10,
        textFill: "#000000",
        textOpacity: 1,
        textIconFill: "#000000",
        textIconFontSize: 10,
        x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
    };

    public render() {
        const { className, stroke, opacity } = this.props;
        const { xAccessor, xScale, yScale, path } = this.props;
        const {
            text,
            textXOffset,
            textYOffset,
            textAnchor,
            fontFamily,
            fontSize,
            textFill,
            textOpacity,
            textRotate,
        } = this.props;

        const { x, y, fill, tooltip } = helper(
            this.props,
            xAccessor,
            xScale,
            yScale,
        );

        const {
            textIcon,
            textIconFontSize,
            textIconFill,
            textIconOpacity,
            textIconRotate,
            textIconXOffset,
            textIconYOffset,
        } = this.props;

        return (
            <g className={className} onClick={this.onClick}>
                {tooltip != null ? <title>{tooltip}</title> : null}
                {text != null ? (
                    <text
                        x={x}
                        y={y}
                        dx={textXOffset}
                        dy={textYOffset}
                        fontFamily={fontFamily}
                        fontSize={fontSize}
                        fill={textFill}
                        opacity={textOpacity}
                        transform={
                            textRotate != null
                                ? `rotate(${textRotate}, ${x}, ${y})`
                                : undefined
                        }
                        textAnchor={textAnchor}
                    >
                        {text}
                    </text>
                ) : null}
                {textIcon != null ? (
                    <text
                        x={x}
                        y={y}
                        dx={textIconXOffset}
                        dy={textIconYOffset}
                        fontSize={textIconFontSize}
                        fill={textIconFill}
                        opacity={textIconOpacity}
                        transform={
                            textIconRotate != null
                                ? `rotate(${textIconRotate}, ${x}, ${y})`
                                : undefined
                        }
                        textAnchor={textAnchor}>
                        {textIcon}
                    </text>
                ) : null}
                {path != null ? (
                    <path
                        d={path({ x, y })}
                        stroke={stroke}
                        fill={fill}
                        opacity={opacity}
                    />
                ) : null}
            </g>
        );
    }

    private readonly onClick = (e: React.MouseEvent) => {
        const { onClick } = this.props;

        if (onClick) {
            const { xScale, yScale, datum } = this.props;
            onClick({ xScale, yScale, datum }, e);
        }
    }
}

function helper(props, xAccessor, xScale, yScale) {
    const { x, y, datum, fill, tooltip, plotData } = props;

    const xFunc = functor(x);
    const yFunc = functor(y);

    const [xPos, yPos] = [
        xFunc({ xScale, xAccessor, datum, plotData }),
        yFunc({ yScale, datum, plotData }),
    ];

    return {
        x: xPos,
        y: yPos,
        fill: functor(fill)(datum),
        tooltip: functor(tooltip)(datum),
    };
}
