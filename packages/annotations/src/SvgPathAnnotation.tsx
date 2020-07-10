import * as React from "react";
import { functor } from "@react-financial-charts/core";

interface SvgPathAnnotationProps {
    readonly className?: string;
    readonly datum?: unknown;
    readonly fill?: string | ((datum: unknown) => string);
    readonly onClick?: (e: React.MouseEvent, data: { xScale: any; yScale: any; datum: unknown }) => void;
    readonly opacity?: number;
    readonly path: any; // func
    readonly plotData: unknown[];
    readonly stroke?: string;
    readonly tooltip?: string | ((datum: unknown) => string);
    readonly xAccessor?: any; // func
    readonly x?: number | any; // func
    readonly xScale?: any; // func
    readonly y?: number | any; // func
    readonly yScale?: any; // func
}

export class SvgPathAnnotation extends React.Component<SvgPathAnnotationProps> {
    public static defaultProps = {
        className: "react-financial-charts-svg-path-annotation",
        opacity: 1,
        x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
    };

    public render() {
        const { className, stroke, opacity, path } = this.props;

        const { x, y, fill, tooltip } = this.helper();

        return (
            <g className={className} onClick={this.handleClick}>
                <title>{tooltip}</title>
                <path d={path({ x, y })} stroke={stroke} fill={fill} opacity={opacity} />
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
        const { x, y, datum, fill, tooltip, xAccessor, xScale, yScale, plotData } = this.props;

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
