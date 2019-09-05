import * as PropTypes from "prop-types";
import * as React from "react";
import GenericComponent from "../GenericComponent";

import { functor, hexToRGBA, isDefined } from "../utils";
import { helper, LabelAnnotation } from "./LabelAnnotation";

interface LabelProps {
    readonly className?: string;
    readonly selectCanvas?: any; // func
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

export class Label extends React.Component<LabelProps> {

    public static defaultProps = {
        textAnchor: "middle",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 12,
        fill: "#000000",
        opacity: 1,
        rotate: 0,
        x: ({ xScale, xAccessor, datum }) => xScale(xAccessor(datum)),
        selectCanvas: (canvases) => canvases.bg,
    };

    public static contextTypes = {
        canvasOriginX: PropTypes.number,
        canvasOriginY: PropTypes.number,

        margin: PropTypes.object.isRequired,
        ratio: PropTypes.number.isRequired,
    };

    public render() {
        return (
            <GenericComponent
                canvasToDraw={this.props.selectCanvas}
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                drawOn={[]} />
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        drawOnCanvas2(ctx, this.props, this.context, moreProps);
    }

    private readonly renderSVG = (moreProps) => {
        const { chartConfig } = moreProps;

        return (
            <LabelAnnotation
                yScale={getYScale(chartConfig)} {...this.props}
                text={getText(this.props)} />
        );
    }
}

function getText(props) {
    return functor(props.text)(props);
}

function getYScale(chartConfig) {
    return Array.isArray(chartConfig) ? undefined : chartConfig.yScale;
}

function drawOnCanvas2(ctx, props, context, moreProps) {
    ctx.save();

    const { canvasOriginX, canvasOriginY, margin, ratio } = context;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);

    if (isDefined(canvasOriginX)) {
        ctx.translate(canvasOriginX, canvasOriginY);
    } else {
        ctx.translate(margin.left + (0.5 * ratio), margin.top + (0.5 * ratio));
    }

    drawOnCanvas(ctx, props, moreProps);

    ctx.restore();

}

function drawOnCanvas(ctx, props, moreProps) {
    const { textAnchor, fontFamily, fontSize, opacity, rotate } = props;
    const { xScale, chartConfig, xAccessor } = moreProps;

    const { xPos, yPos, fill, text } = helper(props, xAccessor, xScale, getYScale(chartConfig));

    const radians = (rotate / 180) * Math.PI;
    ctx.save();
    ctx.translate(xPos, yPos);
    ctx.rotate(radians);

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = hexToRGBA(fill, opacity);
    ctx.textAlign = textAnchor === "middle" ? "center" : textAnchor;

    ctx.beginPath();
    ctx.fillText(text, 0, 0);
    ctx.restore();
}
