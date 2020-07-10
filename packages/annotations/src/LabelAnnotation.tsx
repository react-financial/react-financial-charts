import * as React from "react";
import { functor } from "@react-financial-charts/core";

interface LabelAnnotationProps {
    readonly className?: string;
    readonly datum?: unknown;
    readonly fill?: string | ((datum: unknown) => string);
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly onClick?: (e: React.MouseEvent, data: { xScale: any; yScale: any; datum: unknown }) => void;
    readonly opacity?: number;
    readonly plotData: unknown[];
    readonly rotate?: number;
    readonly text?: string | ((datum: unknown) => string);
    readonly textAnchor?: string;
    readonly tooltip?: string | ((datum: unknown) => string);
    readonly xAccessor?: any; // func
    readonly xScale?: any; // func
    readonly x?: number | any; // func
    readonly yScale?: any; // func
    readonly y?: number | any; // func
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
        x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
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

        const [xPos, yPos] = [xFunc({ xScale, xAccessor, datum, plotData }), yFunc({ yScale, datum, plotData })];

        return {
            xPos,
            yPos,
            text: functor(text)(datum),
            fill: functor(fill)(datum),
            tooltip: functor(tooltip)(datum),
        };
    };
}
