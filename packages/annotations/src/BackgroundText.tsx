import * as PropTypes from "prop-types";
import * as React from "react";

interface BackgroundTextProps {
    readonly x: number;
    readonly y: number;
    readonly font?: string;
    readonly fillStyle?: string | CanvasGradient | CanvasPattern;
    readonly strokeStyle?: string | CanvasGradient | CanvasPattern;
    readonly textAlign?: CanvasTextAlign;
    readonly children: (interval: number) => string;
}

export class BackgroundText extends React.PureComponent<BackgroundTextProps> {
    public static defaultProps = {
        opacity: 0.3,
        fillStyle: "transparent",
        strokeStyle: "#dcdcdc",
        font: "12px -apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
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
        const { children, x, y, fillStyle, strokeStyle, font, textAlign } = this.props;

        const text = children(interval);

        ctx.clearRect(-1, -1, ctx.canvas.width + 2, ctx.canvas.height + 2);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(0.5, 0.5);

        ctx.font = font!;
        ctx.fillStyle = fillStyle!;
        ctx.strokeStyle = strokeStyle!;
        ctx.textAlign = textAlign!;

        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        ctx.restore();
    };
}
