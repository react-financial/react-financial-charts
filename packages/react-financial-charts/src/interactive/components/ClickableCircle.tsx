import * as React from "react";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";
import { hexToRGBA, isDefined, noop } from "../../utils";

interface ClickableCircleProps {
    readonly xyProvider?: any; // func
    readonly onDragStart: any; // func
    readonly onDrag: any; // func
    readonly onDragComplete: any; // func
    readonly strokeWidth: number;
    readonly stroke: string;
    readonly fill: string;
    readonly r: number;
    readonly cx?: number;
    readonly cy?: number;
    readonly className: string;
    readonly show: boolean;
    readonly strokeOpacity: number;
    readonly fillOpacity: number;
    readonly interactiveCursorClass?: string;
}

export class ClickableCircle extends React.Component<ClickableCircleProps> {

    public static defaultProps = {
        className: "react-stockcharts-interactive-line-edge",
        onDragStart: noop,
        onDrag: noop,
        onDragComplete: noop,
        onMove: noop,
        show: false,
        fillOpacity: 1,
        strokeOpacity: 1,
    };

    public render() {
        const { interactiveCursorClass } = this.props;
        const { show } = this.props;
        const { onDragStart, onDrag, onDragComplete } = this.props;

        if (!show) {
            return null;
        }

        return (
            <GenericChartComponent
                interactiveCursorClass={interactiveCursorClass}
                selected
                isHover={this.isHover}
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragComplete={onDragComplete}
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["pan", "mousemove", "drag"]}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { stroke, strokeWidth, fill } = this.props;
        const { fillOpacity, strokeOpacity } = this.props;
        const { r } = this.props;

        const [x, y] = this.helper(this.props, moreProps);

        return (
            <circle
                cx={x} cy={y} r={r}
                strokeWidth={strokeWidth}
                stroke={stroke}
                strokeOpacity={strokeOpacity}
                fill={fill}
                fillOpacity={fillOpacity}
            />
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { stroke, strokeWidth, fill } = this.props;
        const { fillOpacity, strokeOpacity } = this.props;
        const { r } = this.props;

        const [x, y] = this.helper(this.props, moreProps);

        ctx.lineWidth = strokeWidth;
        ctx.fillStyle = hexToRGBA(fill, fillOpacity);
        ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    }

    private readonly isHover = (moreProps) => {
        const { mouseXY } = moreProps;
        const r = this.props.r + 7;
        const [x, y] = this.helper(this.props, moreProps);

        const [mx, my] = mouseXY;
        const hover = (x - r) < mx && mx < (x + r)
            && (y - r) < my && my < (y + r);

        return hover;
    }

    private readonly helper = (props, moreProps) => {
        const { xyProvider, cx, cy } = props;

        if (isDefined(xyProvider)) {
            return xyProvider(moreProps);
        }

        const { xScale, chartConfig: { yScale } } = moreProps;

        const x = xScale(cx);
        const y = yScale(cy);
        return [x, y];
    }
}
