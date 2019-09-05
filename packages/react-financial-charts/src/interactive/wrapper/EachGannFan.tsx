import * as React from "react";

import { isDefined, noop } from "../../utils";
import { getXValue } from "../../utils/ChartDataUtil";
import { isHover, saveNodeType } from "../utils";

import { ClickableCircle } from "../components/ClickableCircle";
import { GannFan } from "../components/GannFan";
import { HoverTextNearMouse } from "../components/HoverTextNearMouse";

interface EachGannFanProps {
    startXY: number[];
    endXY: number[];
    dy?: number;
    interactive: boolean;
    selected: boolean;
    appearance: {
        stroke: string;
        strokeOpacity: number;
        fillOpacity: number;
        strokeWidth: number;
        edgeStroke: string;
        edgeFill: string;
        edgeStrokeWidth: number;
        r: number;
        fill: string[];
        fontFamily: string;
        fontSize: number;
        fontFill: string;
    };
    hoverText: {
        enable: boolean;
        fontFamily: string;
        fontSize: number;
        fill: string;
        text: string;
        bgFill: string;
        bgOpacity: number;
        bgWidth: number | string;
        bgHeight: number | string;
        selectedText: string;
    };
    index?: number;
    onDrag: any; // func
    onDragComplete: any; // func
}

interface EachGannFanState {
    hover: boolean;
}

export class EachGannFan extends React.Component<EachGannFanProps, EachGannFanState> {

    public static defaultProps = {
        yDisplayFormat: (d) => d.toFixed(2),
        interactive: true,
        selected: false,
        appearance: {
            stroke: "#000000",
            fillOpacity: 0.2,
            strokeOpacity: 1,
            strokeWidth: 1,
            edgeStroke: "#000000",
            edgeFill: "#FFFFFF",
            edgeStrokeWidth: 1,
            r: 5,
            fill: [
                "#1f77b4",
                "#ff7f0e",
                "#2ca02c",
                "#d62728",
                "#9467bd",
                "#8c564b",
                "#e377c2",
                "#7f7f7f",
            ],
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: 10,
            fontFill: "#000000",
        },
        onDrag: noop,
        onDragComplete: noop,
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: 18,
            bgWidth: 120,
            text: "Click to select object",
        },
    };

    // @ts-ignore
    private isHover;
    private dragStart;
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
        const { startXY, endXY } = this.props;
        const { interactive, appearance } = this.props;
        const {
            edgeFill,
            stroke, strokeWidth, strokeOpacity,
            fill, fillOpacity,
        } = appearance;
        const { fontFamily, fontSize, fontFill } = appearance;
        const { hoverText, selected } = this.props;
        const { onDragComplete } = this.props;
        const { hover } = this.state;
        const { enable: hoverTextEnabled, ...restHoverTextProps } = hoverText;

        const hoverHandler = interactive
            ? { onHover: this.handleHover, onUnHover: this.handleHover }
            : {};

        const line1Edge = isDefined(startXY) && isDefined(endXY)
            ? <g>
                {this.getEdgeCircle({
                    xy: startXY,
                    dragHandler: this.handleLine1Edge1Drag,
                    cursor: "react-stockcharts-move-cursor",
                    fill: edgeFill,
                    edge: "edge1",
                })}
                {this.getEdgeCircle({
                    xy: endXY,
                    dragHandler: this.handleLine1Edge2Drag,
                    cursor: "react-stockcharts-move-cursor",
                    fill: edgeFill,
                    edge: "edge2",
                })}
            </g>
            : null;

        return (
            <g>
                <GannFan
                    ref={this.saveNodeType("fan")}
                    selected={hover || selected}
                    {...hoverHandler}
                    startXY={startXY}
                    endXY={endXY}
                    stroke={stroke}
                    strokeWidth={(hover || selected) ? strokeWidth + 1 : strokeWidth}
                    fill={fill}
                    strokeOpacity={strokeOpacity}
                    fillOpacity={fillOpacity}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    fontFill={fontFill}
                    interactiveCursorClass="react-stockcharts-move-cursor"
                    onDragStart={this.handleDragStart}
                    onDrag={this.handleFanDrag}
                    onDragComplete={onDragComplete}
                />
                {line1Edge}
                <HoverTextNearMouse
                    show={hoverTextEnabled && hover && !selected}
                    {...restHoverTextProps} />
            </g>
        );
    }

    private readonly getEdgeCircle = ({ xy, dragHandler, cursor, fill, edge }) => {
        const { hover } = this.state;
        const { selected, appearance } = this.props;
        const { edgeStroke, edgeStrokeWidth, r } = appearance;
        const { onDragComplete } = this.props;

        return <ClickableCircle
            ref={this.saveNodeType(edge)}
            show={selected || hover}
            cx={xy[0]}
            cy={xy[1]}
            r={r}
            fill={fill}
            stroke={edgeStroke}
            strokeWidth={edgeStrokeWidth}
            interactiveCursorClass={cursor}
            onDragStart={this.handleDragStart}
            onDrag={dragHandler}
            onDragComplete={onDragComplete} />;
    }

    private readonly handleLine1Edge2Drag = (moreProps) => {
        const { index, onDrag } = this.props;
        const {
            endXY,
        } = this.dragStart;

        const {
            startPos, mouseXY, xAccessor,
            xScale, fullData,
            chartConfig: { yScale },
        } = moreProps;

        const dx = startPos[0] - mouseXY[0];
        const dy = startPos[1] - mouseXY[1];

        const x1 = xScale(endXY[0]);
        const y1 = yScale(endXY[1]);

        const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
        const newY1Value = yScale.invert(y1 - dy);

        onDrag(index, {
            startXY: this.dragStart.startXY,
            endXY: [newX1Value, newY1Value],
            dy: this.dragStart.dy,
        });
    }

    private readonly handleLine1Edge1Drag = (moreProps) => {
        const { index, onDrag } = this.props;
        const {
            startXY,
        } = this.dragStart;

        const {
            startPos, mouseXY, xAccessor,
            xScale, fullData,
            chartConfig: { yScale },
        } = moreProps;

        const dx = startPos[0] - mouseXY[0];
        const dy = startPos[1] - mouseXY[1];

        const x1 = xScale(startXY[0]);
        const y1 = yScale(startXY[1]);

        const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
        const newY1Value = yScale.invert(y1 - dy);

        onDrag(index, {
            startXY: [newX1Value, newY1Value],
            endXY: this.dragStart.endXY,
            dy: this.dragStart.dy,
        });
    }

    private readonly handleFanDrag = (moreProps) => {
        const { index, onDrag } = this.props;

        const {
            startXY, endXY,
        } = this.dragStart;

        const { xScale, chartConfig: { yScale }, xAccessor, fullData } = moreProps;
        const { startPos, mouseXY } = moreProps;

        const x1 = xScale(startXY[0]);
        const y1 = yScale(startXY[1]);
        const x2 = xScale(endXY[0]);
        const y2 = yScale(endXY[1]);

        const dx = startPos[0] - mouseXY[0];
        const dy = startPos[1] - mouseXY[1];

        const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
        const newY1Value = yScale.invert(y1 - dy);
        const newX2Value = getXValue(xScale, xAccessor, [x2 - dx, y2 - dy], fullData);
        const newY2Value = yScale.invert(y2 - dy);

        // const newDy = newY2Value - endXY[1] + this.dragStart.dy;

        onDrag(index, {
            startXY: [newX1Value, newY1Value],
            endXY: [newX2Value, newY2Value],
            dy: this.dragStart.dy,
        });
    }

    private readonly handleDragStart = () => {
        const {
            startXY, endXY, dy,
        } = this.props;

        this.dragStart = {
            startXY, endXY, dy,
        };
    }

    private readonly handleHover = (moreProps) => {
        if (this.state.hover !== moreProps.hovering) {
            this.setState({
                hover: moreProps.hovering,
            });
        }
    }
}
