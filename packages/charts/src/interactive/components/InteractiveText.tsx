import * as React from "react";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

import { colorToRGBA, isDefined, noop } from "../../utils";

interface InteractiveTextProps {
    readonly bgFill: string;
    readonly bgOpacity: number;
    readonly bgStrokeWidth: number;
    readonly bgStroke: string;
    readonly textFill: string;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly fontWeight: number | string;
    readonly fontStyle: string;
    readonly text: string;
    readonly onDragStart: any; // func
    readonly onDrag: any; // func
    readonly onDragComplete: any; // func
    readonly onHover?: any; // func
    readonly onUnHover?: any; // func
    readonly position?: any;
    readonly defaultClassName?: string;
    readonly interactiveCursorClass?: string;
    readonly tolerance: number;
    readonly selected: boolean;
}

export class InteractiveText extends React.Component<InteractiveTextProps> {

    public static defaultProps = {
        onDragStart: noop,
        onDrag: noop,
        onDragComplete: noop,
        type: "SD", // standard dev
        fontWeight: "normal", // standard dev
        tolerance: 4,
        selected: false,
    };

    private calculateTextWidth = true;
    private textWidth;

    public UNSAFE_componentWillReceiveProps(nextProps) {
        this.calculateTextWidth = (
            nextProps.text !== this.props.text
            || nextProps.fontStyle !== this.props.fontStyle
            || nextProps.fontWeight !== this.props.fontWeight
            || nextProps.fontSize !== this.props.fontSize
            || nextProps.fontFamily !== this.props.fontFamily
        );
    }

    public render() {
        const { selected, interactiveCursorClass } = this.props;
        const { onHover, onUnHover } = this.props;
        const { onDragStart, onDrag, onDragComplete } = this.props;

        return (
            <GenericChartComponent
                isHover={this.isHover}
                svgDraw={this.renderSVG}
                canvasToDraw={getMouseCanvas}
                canvasDraw={this.drawOnCanvas}
                interactiveCursorClass={interactiveCursorClass}
                selected={selected}
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragComplete={onDragComplete}
                onHover={onHover}
                onUnHover={onUnHover}
                drawOn={["mousemove", "mouseleave", "pan", "drag"]}
            />
        );
    }

    private readonly isHover = (moreProps) => {
        const { onHover } = this.props;

        if (
            isDefined(onHover)
            && isDefined(this.textWidth)
            && !this.calculateTextWidth
        ) {
            const { rect } = this.helper(this.props, moreProps, this.textWidth);
            const { mouseXY: [x, y] } = moreProps;

            if (
                x >= rect.x
                && y >= rect.y
                && x <= rect.x + rect.width
                && y <= rect.y + rect.height
            ) {
                return true;
            }
        }
        return false;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const {
            bgFill,
            bgOpacity,
            bgStrokeWidth,
            bgStroke,
            textFill,
            fontFamily,
            fontSize,
            fontStyle,
            fontWeight,
            text,
        } = this.props;

        if (this.calculateTextWidth) {
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            const { width } = ctx.measureText(text);
            this.textWidth = width;
            this.calculateTextWidth = false;
        }

        const { selected } = this.props;

        const { x, y, rect } = this.helper(this.props, moreProps, this.textWidth);

        ctx.fillStyle = colorToRGBA(bgFill, bgOpacity);

        ctx.beginPath();
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

        if (selected) {
            ctx.strokeStyle = bgStroke;
            ctx.lineWidth = bgStrokeWidth;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        }

        ctx.fillStyle = textFill;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        ctx.beginPath();
        ctx.fillText(text, x, y);
    }

    private readonly renderSVG = () => {
        throw new Error("svg not implemented");
    }

    private readonly helper = (props, moreProps, textWidth) => {
        const { position, fontSize } = props;

        const { xScale, chartConfig: { yScale } } = moreProps;

        const [xValue, yValue] = position;
        const x = xScale(xValue);
        const y = yScale(yValue);

        const rect = {
            x: x - textWidth / 2 - fontSize,
            y: y - fontSize,
            width: textWidth + fontSize * 2,
            height: fontSize * 2,
        };

        return {
            x, y, rect,
        };
    }
}
