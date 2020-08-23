import { functor } from "@react-financial-charts/core";
import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";

export interface BarAnnotationProps {
    readonly className?: string;
    readonly path?: ({ x, y }: { x: number; y: number }) => string;
    readonly onClick?: (
        e: React.MouseEvent,
        data: {
            xScale?: ScaleContinuousNumeric<number, number>;
            yScale?: ScaleContinuousNumeric<number, number>;
            datum: any;
        },
    ) => void;
    readonly xAccessor?: (datum: any) => any;
    readonly xScale?: ScaleContinuousNumeric<number, number>;
    readonly yScale?: ScaleContinuousNumeric<number, number>;
    readonly datum?: object;
    readonly stroke?: string;
    readonly fill?: string | ((datum: any) => string);
    readonly opacity?: number;
    readonly plotData: any[];
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
    readonly tooltip?: string | ((datum: any) => string);
    readonly x?:
        | number
        | (({
              xScale,
              xAccessor,
              datum,
              plotData,
          }: {
              xScale: ScaleContinuousNumeric<number, number>;
              xAccessor: (datum: any) => any;
              datum: any;
              plotData: any[];
          }) => number);
    readonly y?:
        | number
        | (({
              yScale,
              datum,
              plotData,
          }: {
              yScale: ScaleContinuousNumeric<number, number>;
              datum: any;
              plotData: any[];
          }) => number);
}

export class BarAnnotation extends React.Component<BarAnnotationProps> {
    public static defaultProps = {
        className: "react-financial-charts-bar-annotation",
        opacity: 1,
        fill: "#000000",
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 10,
        textAnchor: "middle",
        textFill: "#000000",
        textOpacity: 1,
        textIconFill: "#000000",
        textIconFontSize: 10,
        x: ({
            xScale,
            xAccessor,
            datum,
        }: {
            xScale: ScaleContinuousNumeric<number, number>;
            xAccessor: any;
            datum: any;
        }) => xScale(xAccessor(datum)),
    };

    public render() {
        const {
            className,
            stroke,
            opacity,
            xAccessor,
            xScale,
            yScale,
            path,
            text,
            textXOffset,
            textYOffset,
            textAnchor,
            fontFamily,
            fontSize,
            textFill,
            textOpacity,
            textRotate,
            textIcon,
            textIconFontSize,
            textIconFill,
            textIconOpacity,
            textIconRotate,
            textIconXOffset,
            textIconYOffset,
        } = this.props;

        const { x, y, fill, tooltip } = this.helper(this.props, xAccessor, xScale, yScale);

        return (
            <g className={className} onClick={this.onClick}>
                {tooltip !== undefined ? <title>{tooltip}</title> : null}
                {text !== undefined ? (
                    <text
                        x={x}
                        y={y}
                        dx={textXOffset}
                        dy={textYOffset}
                        fontFamily={fontFamily}
                        fontSize={fontSize}
                        fill={textFill}
                        opacity={textOpacity}
                        transform={textRotate != undefined ? `rotate(${textRotate}, ${x}, ${y})` : undefined}
                        textAnchor={textAnchor}
                    >
                        {text}
                    </text>
                ) : null}
                {textIcon !== undefined ? (
                    <text
                        x={x}
                        y={y}
                        dx={textIconXOffset}
                        dy={textIconYOffset}
                        fontSize={textIconFontSize}
                        fill={textIconFill}
                        opacity={textIconOpacity}
                        transform={textIconRotate != undefined ? `rotate(${textIconRotate}, ${x}, ${y})` : undefined}
                        textAnchor={textAnchor}
                    >
                        {textIcon}
                    </text>
                ) : null}
                {path !== undefined ? <path d={path({ x, y })} stroke={stroke} fill={fill} opacity={opacity} /> : null}
            </g>
        );
    }

    private readonly onClick = (e: React.MouseEvent) => {
        const { onClick, xScale, yScale, datum } = this.props;
        if (onClick !== undefined) {
            onClick(e, { xScale, yScale, datum });
        }
    };

    private readonly helper = (props: BarAnnotationProps, xAccessor: any, xScale: any, yScale: any) => {
        const { x, y, datum, fill, tooltip, plotData } = props;

        const xFunc = functor(x);
        const yFunc = functor(y);

        const [xPos, yPos] = [xFunc({ xScale, xAccessor, datum, plotData }), yFunc({ yScale, datum, plotData })];

        return {
            x: xPos,
            y: yPos,
            fill: functor(fill)(datum),
            tooltip: functor(tooltip)(datum),
        };
    };
}
