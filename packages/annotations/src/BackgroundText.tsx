import * as PropTypes from "prop-types";
import * as React from "react";

interface BackgroundTextProps {
    readonly x: number;
    readonly y: number;
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fillStyle?: string | CanvasGradient | CanvasPattern;
    readonly strokeStyle?: string | CanvasGradient | CanvasPattern;
    readonly textAlign?: CanvasTextAlign;
    readonly children: (interval: number) => string;
}

export class BackgroundText extends React.PureComponent<BackgroundTextProps> {
    public static defaultProps = {
        fillStyle: "transparent",
        strokeStyle: "#dcdcdc",
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 12,
        textAlign: "center",
    };

    public static contextTypes = {
        interval: PropTypes.string.isRequired,
        getCanvasContexts: PropTypes.func,
    };

    public componentDidMount() {
        const contexts = this.context?.getCanvasContexts();
        if (contexts) {
            this.drawOnCanvas(contexts.bg, this.context);
        }
    }

    public componentDidUpdate() {
        this.componentDidMount();
    }

    public render() {
        return null;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, { interval }) => {
        const { children, x, y, fillStyle, strokeStyle, fontFamily, fontSize, textAlign } = this.props;

        const text = children(interval);

        ctx.clearRect(-1, -1, ctx.canvas.width + 2, ctx.canvas.height + 2);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(0.5, 0.5);

        if (fontFamily !== undefined) {
            ctx.font = `${fontSize}px ${fontFamily}`;
        }
        if (fillStyle !== undefined) {
            ctx.fillStyle = fillStyle;
        }
        if (strokeStyle !== undefined) {
            ctx.strokeStyle = strokeStyle;
        }
        if (textAlign !== undefined) {
            ctx.textAlign = textAlign;
        }

        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        ctx.restore();
    };
}
