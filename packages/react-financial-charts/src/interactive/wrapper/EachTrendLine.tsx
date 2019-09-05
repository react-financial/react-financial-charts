import * as React from "react";

import { ascending as d3Ascending } from "d3-array";
import { noop, strokeDashTypes } from "../../utils";
import { getXValue } from "../../utils/ChartDataUtil";
import { isHover, saveNodeType } from "../utils";

import { ClickableCircle } from "../components/ClickableCircle";
import { HoverTextNearMouse } from "../components/HoverTextNearMouse";
import StraightLine from "../components/StraightLine";

interface EachTrendLineProps {
    x1Value: any;
    x2Value: any;
    y1Value: any;
    y2Value: any;
    index?: number;
    type: "XLINE" | // extends from -Infinity to +Infinity
    "RAY" | // extends to +/-Infinity in one direction
    "LINE"; // extends between the set bounds
    onDrag: any; // func
    onEdge1Drag: any; // func
    onEdge2Drag: any; // func
    onDragComplete: any; // func
    onSelect: any; // func
    onUnSelect: any; // func
    r: number;
    strokeOpacity: number;
    defaultClassName?: string;
    selected?: boolean;
    stroke: string;
    strokeWidth: number;
    strokeDasharray: strokeDashTypes;
    edgeStrokeWidth: number;
    edgeStroke: string;
    edgeInteractiveCursor: string;
    lineInteractiveCursor: string;
    edgeFill: string;
    hoverText: {
        enable: boolean;
        fontFamily: string;
        fontSize: number;
        fill: string;
        text: string;
        selectedText: string;
        bgFill: string;
        bgOpacity: number;
        bgWidth: number | string;
        bgHeight: number | string;
    };
}

interface EachTrendLineState {
    anchor?: string;
    hover?: any;
}

export class EachTrendLine extends React.Component<EachTrendLineProps, EachTrendLineState> {

    public static defaultProps = {
        onDrag: noop,
        onEdge1Drag: noop,
        onEdge2Drag: noop,
        onDragComplete: noop,
        onSelect: noop,
        onUnSelect: noop,
        selected: false,
        edgeStroke: "#000000",
        edgeFill: "#FFFFFF",
        edgeStrokeWidth: 2,
        r: 5,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeDasharray: "Solid",
        hoverText: {
            enable: false,
        },
    };

    private dragStart;
    // @ts-ignore
    private isHover;
    private saveNodeType;

    constructor(props) {
        super(props);

        this.isHover = isHover.bind(this);
        this.saveNodeType = saveNodeType.bind(this);

        this.state = {
            hover: false,
        };
    }

    public render() {
        const {
            x1Value,
            y1Value,
            x2Value,
            y2Value,
            type,
            stroke,
            strokeWidth,
            strokeOpacity,
            strokeDasharray,
            r,
            edgeStrokeWidth,
            edgeFill,
            edgeStroke,
            edgeInteractiveCursor,
            lineInteractiveCursor,
            hoverText,
            selected,

            onDragComplete,
        } = this.props;

        const {
            enable: hoverTextEnabled,
            selectedText: hoverTextSelected,
            text: hoverTextUnselected,
            ...restHoverTextProps
        } = hoverText;

        const { hover, anchor } = this.state;

        return <g>
            <StraightLine
                ref={this.saveNodeType("line")}
                selected={selected || hover}
                onHover={this.handleHover}
                onUnHover={this.handleHover}
                x1Value={x1Value}
                y1Value={y1Value}
                x2Value={x2Value}
                y2Value={y2Value}
                type={type}
                stroke={stroke}
                strokeWidth={(hover || selected) ? strokeWidth + 1 : strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={strokeDasharray}
                interactiveCursorClass={lineInteractiveCursor}
                onDragStart={this.handleLineDragStart}
                onDrag={this.handleLineDrag}
                onDragComplete={onDragComplete} />
            <ClickableCircle
                ref={this.saveNodeType("edge1")}
                show={selected || hover}
                cx={x1Value}
                cy={y1Value}
                r={r}
                fill={edgeFill}
                stroke={anchor === "edge1" ? stroke : edgeStroke}
                strokeWidth={edgeStrokeWidth}
                strokeOpacity={1}
                interactiveCursorClass={edgeInteractiveCursor}
                onDragStart={this.handleEdge1DragStart}
                onDrag={this.handleEdge1Drag}
                onDragComplete={this.handleDragComplete} />
            <ClickableCircle
                ref={this.saveNodeType("edge2")}
                show={selected || hover}
                cx={x2Value}
                cy={y2Value}
                r={r}
                fill={edgeFill}
                stroke={anchor === "edge2" ? stroke : edgeStroke}
                strokeWidth={edgeStrokeWidth}
                strokeOpacity={1}
                interactiveCursorClass={edgeInteractiveCursor}
                onDragStart={this.handleEdge2DragStart}
                onDrag={this.handleEdge2Drag}
                onDragComplete={this.handleDragComplete} />
            <HoverTextNearMouse
                show={hoverTextEnabled && hover}
                {...restHoverTextProps}
                text={selected ? hoverTextSelected : hoverTextUnselected}
            />
        </g>;
    }

    private readonly handleHover = (moreProps) => {
        if (this.state.hover !== moreProps.hovering) {
            this.setState({
                hover: moreProps.hovering,
            });
        }
    }

    private readonly handleEdge2Drag = (moreProps) => {
        const { index, onDrag } = this.props;
        const {
            x1Value, y1Value,
        } = this.props;

        const [x2Value, y2Value] = getNewXY(moreProps);

        onDrag(index, {
            x1Value,
            y1Value,
            x2Value,
            y2Value,
        });
    }

    private readonly handleEdge1Drag = (moreProps) => {
        const { index, onDrag } = this.props;
        const {
            x2Value, y2Value,
        } = this.props;

        const [x1Value, y1Value] = getNewXY(moreProps);

        onDrag(index, {
            x1Value,
            y1Value,
            x2Value,
            y2Value,
        });
    }

    private readonly handleDragComplete = (...rest) => {
        this.setState({
            anchor: undefined,
        });
        this.props.onDragComplete(...rest);
    }

    private readonly handleEdge2DragStart = () => {
        this.setState({
            anchor: "edge1",
        });
    }

    private readonly handleEdge1DragStart = () => {
        this.setState({
            anchor: "edge2",
        });
    }

    private readonly handleLineDrag = (moreProps) => {
        const { index, onDrag } = this.props;

        const {
            x1Value, y1Value,
            x2Value, y2Value,
        } = this.dragStart;

        const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
        const { startPos, mouseXY } = moreProps;

        const x1 = xScale(x1Value);
        const y1 = yScale(y1Value);
        const x2 = xScale(x2Value);
        const y2 = yScale(y2Value);

        const dx = startPos[0] - mouseXY[0];
        const dy = startPos[1] - mouseXY[1];

        const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
        const newY1Value = yScale.invert(y1 - dy);
        const newX2Value = getXValue(xScale, xAccessor, [x2 - dx, y2 - dy], fullData);
        const newY2Value = yScale.invert(y2 - dy);

        onDrag(index, {
            x1Value: newX1Value,
            y1Value: newY1Value,
            x2Value: newX2Value,
            y2Value: newY2Value,
        });
    }

    private readonly handleLineDragStart = () => {
        const {
            x1Value, y1Value,
            x2Value, y2Value,
        } = this.props;

        this.dragStart = {
            x1Value, y1Value,
            x2Value, y2Value,
        };
    }
}

export function getNewXY(moreProps) {
    const { xScale, chartConfig: { yScale }, xAccessor, plotData, mouseXY } = moreProps;
    const mouseY = mouseXY[1];

    const x = getXValue(xScale, xAccessor, mouseXY, plotData);

    const [small, big] = yScale.domain().slice().sort(d3Ascending);
    const y = yScale.invert(mouseY);
    const newY = Math.min(Math.max(y, small), big);

    return [x, newY];
}
