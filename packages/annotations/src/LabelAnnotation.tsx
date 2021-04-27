import { functor } from "@react-financial-charts/core";
import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";

export interface LabelAnnotationProps {
    readonly className?: string;
    readonly datum?: any;
    readonly fill?: string | ((datum: any) => string);
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly onClick?: (
        e: React.MouseEvent,
        data: {
            xScale?: ScaleContinuousNumeric<number, number>;
            yScale?: ScaleContinuousNumeric<number, number>;
            datum: any;
        },
    ) => void;
    readonly opacity?: number;
    readonly plotData: any[];
    readonly rotate?: number;
    readonly text?: string | ((datum: any) => string);
    readonly textAnchor?: string;
    readonly tooltip?: string | ((datum: any) => string);
    readonly xAccessor?: (datum: any) => any;
    readonly xScale?: ScaleContinuousNumeric<number, number>;
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
    readonly yScale?: ScaleContinuousNumeric<number, number>;
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

export class LabelAnnotation extends React.Component<LabelAnnotationProps> {
    public static defaultProps = {
        className: "react-financial-charts-label-annotation",
        textAnchor: "middle",
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 12,
        fill: "#000000",
        opacity: 1,
        rotate: 0,
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
        const { className, textAnchor, fontFamily, fontSize, opacity, rotate } = this.props;

        const { xPos, yPos, fill, text, tooltip } = this.helper();

        return (
            <g className={className}>
                <title>{tooltip}</title>
                <text
                    x={xPos}
                    y={yPos}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    fill={fill}
                    opacity={opacity}
                    transform={`rotate(${rotate}, ${xPos}, ${yPos})`}
                    onClick={this.handleClick}
                    textAnchor={textAnchor}
                >
                    {text}
                </text>
            </g>
        );
    }

    private readonly handleClick = (e: React.MouseEvent) => {
        const { onClick, xScale, yScale, datum } = this.props;
        if (onClick !== undefined) {
            onClick(e, { xScale, yScale, datum });
        }
    };

    private readonly helper = () => {
        const { x, y, datum, fill, text, tooltip, xAccessor, xScale, yScale, plotData } = this.props;

        const xFunc = functor(x);
        const yFunc = functor(y);

        const [xPos, yPos]: [number, number] = [
            xFunc({ xScale, xAccessor, datum, plotData }),
            yFunc({ yScale, datum, plotData }),
        ];

        return {
            xPos,
            yPos,
            text: functor(text)(datum),
            fill: functor(fill)(datum),
            tooltip: functor(tooltip)(datum),
        };
    };
}
