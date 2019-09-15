import * as PropTypes from "prop-types";
import * as React from "react";

import { colorToRGBA, isDefined } from "../utils";
import { PureComponent } from "../utils/PureComponent";

interface BackgroundTextProps {
    readonly x: number;
    readonly y: number;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly opacity?: number;
    readonly strokeOpacity?: number;
    readonly textAnchor?: string;
    readonly children: (interval: number) => string;
}

class BackgroundText extends PureComponent<BackgroundTextProps> {

    public static defaultProps = {
        opacity: 0.3,
        fill: "#9E7523",
        stroke: "#9E7523",
        strokeOpacity: 1,
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 12,
        textAnchor: "middle",
    };

    public static contextTypes = {
        interval: PropTypes.string.isRequired,
        getCanvasContexts: PropTypes.func,
        chartCanvasType: PropTypes.string,
    };

    public componentDidMount() {
        if (this.context.chartCanvasType !== "svg" && isDefined(this.context.getCanvasContexts)) {
            const contexts = this.context.getCanvasContexts();
            if (contexts) {
                this.drawOnCanvas(contexts.bg, this.props, this.context, this.props.children);
            }
        }
    }

    public componentDidUpdate() {
        this.componentDidMount();
    }

    public render() {
        const { chartCanvasType, interval } = this.context;

        if (chartCanvasType !== "svg") {
            return null;
        }

        const { x, y, fill, opacity, stroke, strokeOpacity, fontFamily, fontSize, textAnchor } = this.props;

        const props = { x, y, fill, opacity, stroke, strokeOpacity, fontFamily, fontSize, textAnchor };

        return (
            <text {...props}>
                {this.props.children(interval)}
            </text>
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, props, { interval }, getText) => {
        ctx.clearRect(-1, -1, ctx.canvas.width + 2, ctx.canvas.height + 2);
        ctx.save();

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(0.5, 0.5);

        const { x, y, fill, opacity, stroke, strokeOpacity, fontFamily, fontSize, textAnchor } = props;

        const text = getText(interval);

        ctx.strokeStyle = colorToRGBA(stroke, strokeOpacity);

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = colorToRGBA(fill, opacity);
        ctx.textAlign = textAnchor === "middle" ? "center" : textAnchor;

        if (stroke !== "none") {
            ctx.strokeText(text, x, y);
        }

        ctx.fillText(text, x, y);

        ctx.restore();
    }
}

export default BackgroundText;
