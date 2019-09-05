import * as React from "react";
import { functor } from "../utils";

interface LabelAnnotationProps {
    readonly className?: string;
    readonly text?: string | any; // func
    readonly textAnchor?: string;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly opacity?: number;
    readonly rotate?: number;
    readonly onClick?: any; // func
    readonly xAccessor?: any; // func
    readonly xScale?: any; // func
    readonly yScale?: any; // func
    readonly datum?: object;
    readonly x?: number | any; // func
    readonly y?: number | any; // func
}

export class LabelAnnotation extends React.Component<LabelAnnotationProps> {

    public static defaultProps = {
        className: "react-stockcharts-labelannotation",
        textAnchor: "middle",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 12,
        fill: "#000000",
        opacity: 1,
        rotate: 0,
        x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
    };

    public render() {
        const { className, textAnchor, fontFamily, fontSize, opacity, rotate } = this.props;
        const { xAccessor, xScale, yScale } = this.props;

        const { xPos, yPos, fill, text, tooltip } = helper(this.props, xAccessor, xScale, yScale);

        return (<g className={className}>
            <title>{tooltip}</title>
            <text x={xPos} y={yPos}
                fontFamily={fontFamily} fontSize={fontSize}
                fill={fill}
                opacity={opacity}
                transform={`rotate(${rotate}, ${xPos}, ${yPos})`}
                onClick={this.handleClick}
                textAnchor={textAnchor}>{text}</text>
        </g>);
    }

    private readonly handleClick = (e) => {
        const { onClick } = this.props;

        if (onClick) {
            const { xScale, yScale, datum } = this.props;
            onClick({ xScale, yScale, datum }, e);
        }
    }
}

export const helper = (props, xAccessor, xScale, yScale) => {
    const { x, y, datum, fill, text, tooltip, plotData } = props;

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
