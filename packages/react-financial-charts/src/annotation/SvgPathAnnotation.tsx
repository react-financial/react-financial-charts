import * as React from "react";
import { functor } from "../utils";

interface SvgPathAnnotationProps {
    readonly className?: string;
    readonly path: any; // func
    readonly onClick?: any; // func
    readonly xAccessor?: any; // func
    readonly xScale?: any; // func
    readonly yScale?: any; // func
    readonly datum?: object;
    readonly stroke?: string;
    readonly fill?: string;
    readonly opacity?: number;
}

export class SvgPathAnnotation extends React.Component<SvgPathAnnotationProps> {

    public static defaultProps = {
        className: "react-stockcharts-svgpathannotation",
        opacity: 1,
        x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
    };

    public render() {
        const { className, stroke, opacity } = this.props;

        const { xAccessor, xScale, yScale, path } = this.props;

        const { x, y, fill, tooltip } = helper(this.props, xAccessor, xScale, yScale);

        return (<g className={className} onClick={this.handleClick}>
            <title>{tooltip}</title>
            <path d={path({ x, y })} stroke={stroke} fill={fill} opacity={opacity} />
        </g>);
    }

    private readonly handleClick = (e: React.MouseEvent) => {
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

    const [xPos, yPos] = [xFunc({ xScale, xAccessor, datum, plotData }), yFunc({ yScale, datum, plotData })];

    return {
        x: xPos,
        y: yPos,
        fill: functor(fill)(datum),
        tooltip: functor(tooltip)(datum),
    };
}
