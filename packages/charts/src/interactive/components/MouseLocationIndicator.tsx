import * as React from "react";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

import { functor, getClosestValue, isDefined, noop, shallowEqual } from "../../utils";
import { getXValue } from "../../utils/ChartDataUtil";

interface MouseLocationIndicatorProps {
    enabled: boolean;
    snap: boolean;
    shouldDisableSnap: any; // func;
    snapTo?: any; // func;
    onMouseMove: any; // func;
    onMouseDown: any; // func;
    onClick: any; // func;
    r?: number;
    stroke: string;
    strokeWidth: number;
    opacity: number;
    disablePan: boolean;
}

export class MouseLocationIndicator extends React.Component<MouseLocationIndicatorProps> {

    public static defaultProps = {
        onMouseMove: noop,
        onMouseDown: noop,
        onClick: noop,
        shouldDisableSnap: functor(false),
        stroke: "#000000",
        strokeWidth: 1,
        opacity: 1,
        disablePan: true,
    };

    private mutableState;

    constructor(props) {
        super(props);
        this.renderSVG = this.renderSVG.bind(this);
        this.drawOnCanvas = this.drawOnCanvas.bind(this);

        this.handleMousePosChange = this.handleMousePosChange.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.xy = this.xy.bind(this);

        this.mutableState = {};
    }

    public render() {
        const { enabled, disablePan } = this.props;

        return (
            <GenericChartComponent
                onMouseDown={this.handleMouseDown}
                onClick={this.handleClick}
                onMouseMove={this.handleMousePosChange}
                onPan={this.handleMousePosChange}
                disablePan={enabled && disablePan}
                svgDraw={this.renderSVG}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan"]}
            />
        );
    }

    private readonly xy = (moreProps, e) => {
        const { xAccessor, plotData } = moreProps;
        const { mouseXY, currentItem, xScale, chartConfig: { yScale } } = moreProps;
        const { enabled, snap, shouldDisableSnap, snapTo } = this.props;

        if (enabled && isDefined(currentItem) && isDefined(e)) {
            const xValue = snap && !shouldDisableSnap(e)
                ? xAccessor(currentItem)
                : getXValue(xScale, xAccessor, mouseXY, plotData);
            const yValue = snap && !shouldDisableSnap(e)
                ? getClosestValue(snapTo(currentItem), yScale.invert(mouseXY[1]))
                : yScale.invert(mouseXY[1]);

            const x = xScale(xValue);
            const y = yScale(yValue);

            return { xValue, yValue, x, y };
        }
    }

    private readonly handleClick = (moreProps, e) => {
        const pos = this.xy(moreProps, e);
        if (pos !== undefined && isDefined(pos)) {
            const { xValue, yValue, x, y } = pos;
            this.mutableState = { x, y };
            this.props.onClick([xValue, yValue], moreProps, e);
        }
    }

    private readonly handleMouseDown = (moreProps, e) => {
        const pos = this.xy(moreProps, e);
        if (pos !== undefined && isDefined(pos)) {
            const { xValue, yValue, x, y } = pos;
            this.mutableState = { x, y };
            this.props.onMouseDown([xValue, yValue], moreProps, e);
        }
    }

    private readonly handleMousePosChange = (moreProps, e) => {
        if (!shallowEqual(moreProps.mousXY, moreProps.prevMouseXY)) {
            const pos = this.xy(moreProps, e);
            if (pos !== undefined && isDefined(pos)) {
                const { xValue, yValue, x, y } = pos;
                this.mutableState = { x, y };
                this.props.onMouseMove([xValue, yValue], e);
            }
        }
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const { enabled, r, stroke, strokeWidth } = this.props;
        const { x, y } = this.mutableState;
        const { show } = moreProps;
        if (enabled && show && isDefined(x)) {
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = stroke;
            ctx.moveTo(x, y);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI, false);
            ctx.stroke();
        }
    }

    private readonly renderSVG = (moreProps) => {
        const { enabled, r, stroke, strokeWidth, opacity } = this.props;
        const { x, y } = this.mutableState;
        const { show } = moreProps;

        return enabled && show && isDefined(x)
            ? <circle
                cx={x}
                cy={y}
                r={r}
                stroke={stroke}
                opacity={opacity}
                fill="none"
                strokeWidth={strokeWidth} />
            : null;
    }
}
