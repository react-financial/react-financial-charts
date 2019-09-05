import * as PropTypes from "prop-types";
import * as React from "react";
import GenericComponent, { getMouseCanvas } from "../GenericComponent";

import { getStrokeDasharray, hexToRGBA, isDefined, isNotDefined, strokeDashTypes } from "../utils";

interface CrossHairCursorProps {
    readonly className?: string;
    readonly opacity?: number;
    readonly snapX?: boolean;
    readonly stroke?: string;
    readonly strokeDasharray?: strokeDashTypes;
}

const defaultCustomX = (props: CrossHairCursorProps, moreProps) => {
    const { xScale, xAccessor, currentItem, mouseXY } = moreProps;
    const { snapX } = props;
    const x = snapX
        ? Math.round(xScale(xAccessor(currentItem)))
        : mouseXY[0];
    return x;
};

export class CrossHairCursor extends React.Component<CrossHairCursorProps> {

    public static defaultProps = {
        stroke: "#000000",
        opacity: 0.3,
        strokeDasharray: "ShortDash",
        snapX: true,
        customX: defaultCustomX,
    };

    public static contextTypes = {
        margin: PropTypes.object.isRequired,
        ratio: PropTypes.number.isRequired,
    };

    public render() {
        return (
            <GenericComponent
                svgDraw={this.renderSVG}
                clip={false}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan", "drag"]} />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { className } = this.props;
        const lines = this.helper(this.props, moreProps);

        if (lines === undefined) {
            return null;
        }

        return (
            <g className={`react-stockcharts-crosshair ${className}`}>
                {lines.map(({ strokeDasharray, ...rest }, idx) =>
                    <line
                        key={idx}
                        strokeDasharray={getStrokeDasharray(strokeDasharray)}
                        {...rest} />)}
            </g>
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const lines = this.helper(this.props, moreProps);

        if (lines !== undefined && isDefined(lines)) {

            const { margin, ratio } = this.context;
            const originX = 0.5 * ratio + margin.left;
            const originY = 0.5 * ratio + margin.top;

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(ratio, ratio);

            ctx.translate(originX, originY);

            lines.forEach((line) => {
                const dashArray = getStrokeDasharray(line.strokeDasharray)
                    .split(",")
                    .map((d) => +d);

                ctx.strokeStyle = hexToRGBA(line.stroke, line.opacity);
                ctx.setLineDash(dashArray);
                ctx.beginPath();
                ctx.moveTo(line.x1, line.y1);
                ctx.lineTo(line.x2, line.y2);
                ctx.stroke();
            });

            ctx.restore();
        }
    }

    private readonly helper = (props, moreProps) => {
        const {
            mouseXY, currentItem, show, height, width,
        } = moreProps;

        const { customX, stroke, opacity, strokeDasharray } = props;

        if (!show || isNotDefined(currentItem)) {
            return undefined;
        }

        const line1 = {
            x1: 0,
            x2: width,
            y1: mouseXY[1],
            y2: mouseXY[1],
            stroke, strokeDasharray, opacity,
        };
        const x = customX(props, moreProps);

        const line2 = {
            x1: x,
            x2: x,
            y1: 0,
            y2: height,
            stroke, strokeDasharray, opacity,
        };
        return [line1, line2];
    }
}
