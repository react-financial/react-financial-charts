import * as PropTypes from "prop-types";
import * as React from "react";
import { colorToRGBA, GenericComponent } from "@react-financial-charts/core";
import { helper } from "./LabelAnnotation";

interface LabelProps {
    readonly className?: string;
    readonly selectCanvas?: any; // func
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly opacity?: number;
    readonly rotate?: number;
    readonly onClick?: any; // func
    readonly text?: string | any; // func
    readonly textAlign?: CanvasTextAlign;
    readonly x?: number | any; // func
    readonly xAccessor?: any; // func
    readonly xScale?: any; // func
    readonly y?: number | any; // func
    readonly yScale?: any; // func
    readonly datum?: object;
}

export class Label extends React.Component<LabelProps> {
    public static defaultProps = {
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
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
        const { selectCanvas } = this.props;

        return <GenericComponent canvasToDraw={selectCanvas} canvasDraw={this.drawOnCanvas} drawOn={[]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        ctx.save();

        const { textAlign = "center", fontFamily, fontSize, opacity, rotate = 0 } = this.props;

        const { canvasOriginX, canvasOriginY, margin, ratio } = this.context;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);

        if (canvasOriginX !== undefined) {
            ctx.translate(canvasOriginX, canvasOriginY);
        } else {
            ctx.translate(margin.left + 0.5 * ratio, margin.top + 0.5 * ratio);
        }

        const { xScale, chartConfig, xAccessor } = moreProps;

        const yScale = Array.isArray(chartConfig) ? undefined : chartConfig.yScale;

        const { xPos, yPos, fill, text } = helper(this.props, xAccessor, xScale, yScale);

        const radians = (rotate / 180) * Math.PI;

        ctx.save();
        ctx.translate(xPos, yPos);
        ctx.rotate(radians);

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = colorToRGBA(fill, opacity);
        ctx.textAlign = textAlign;

        ctx.beginPath();
        ctx.fillText(text, 0, 0);
        ctx.restore();
    };
}
