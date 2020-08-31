import * as React from "react";
import { isDefined, noop } from "@react-financial-charts/core";
import { getXValue } from "@react-financial-charts/core/lib/utils/ChartDataUtil";
import { isHover, saveNodeType } from "../utils";
import { ChannelWithArea, ClickableCircle, HoverTextNearMouse } from "../components";

export interface EachEquidistantChannelProps {
    readonly startXY: number[];
    readonly endXY: number[];
    readonly dy?: number;
    readonly interactive: boolean;
    readonly selected: boolean;
    readonly hoverText: {
        readonly enable: boolean;
        readonly fontFamily: string;
        readonly fontSize: number;
        readonly fill: string;
        readonly text: string;
        readonly bgFill: string;
        readonly bgOpacity: number;
        readonly bgWidth: number | string;
        readonly bgHeight: number | string;
    };
    readonly appearance: {
        readonly stroke: string;
        readonly strokeWidth: number;
        readonly fill: string;
        readonly edgeStroke: string;
        readonly edgeFill: string;
        readonly edgeFill2: string;
        readonly edgeStrokeWidth: number;
        readonly r: number;
    };
    readonly index?: number;
    readonly onDrag: (e: React.MouseEvent, index: number | undefined, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
}

interface EachEquidistantChannelState {
    hover: boolean;
}

export class EachEquidistantChannel extends React.Component<EachEquidistantChannelProps, EachEquidistantChannelState> {
    public static defaultProps = {
        yDisplayFormat: (d: number) => d.toFixed(2),
        interactive: true,
        selected: false,
        onDrag: noop,
        hoverText: {
            enable: false,
        },
    };

    private dragStart: any;
    // @ts-ignore
    private isHover: any;
    private saveNodeType: any;

    public constructor(props: EachEquidistantChannelProps) {
        super(props);

        this.isHover = isHover.bind(this);
        this.saveNodeType = saveNodeType.bind(this);

        this.state = {
            hover: false,
        };
    }

    public render() {
        const { startXY, endXY, dy } = this.props;
        const { interactive, hoverText, appearance } = this.props;
        const { edgeFill, edgeFill2, stroke, strokeWidth, fill } = appearance;
        const { selected } = this.props;
        const { onDragComplete } = this.props;
        const { hover } = this.state;
        const { enable: hoverTextEnabled, ...restHoverTextProps } = hoverText;

        const hoverHandler = interactive ? { onHover: this.handleHover, onUnHover: this.handleHover } : {};

        const line1Edge =
            isDefined(startXY) && isDefined(endXY) ? (
                <g>
                    {this.getEdgeCircle({
                        xy: startXY,
                        dragHandler: this.handleLine1Edge1Drag,
                        cursor: "react-financial-charts-move-cursor",
                        fill: edgeFill,
                        edge: "line1edge1",
                    })}
                    {this.getEdgeCircle({
                        xy: endXY,
                        dragHandler: this.handleLine1Edge2Drag,
                        cursor: "react-financial-charts-move-cursor",
                        fill: edgeFill,
                        edge: "line1edge2",
                    })}
                </g>
            ) : null;
        const line2Edge =
            dy !== undefined && isDefined(dy) ? (
                <g>
                    {this.getEdgeCircle({
                        xy: [startXY[0], startXY[1] + dy],
                        dragHandler: this.handleChannelHeightChange,
                        cursor: "react-financial-charts-ns-resize-cursor",
                        fill: edgeFill2,
                        edge: "line2edge1",
                    })}
                    {this.getEdgeCircle({
                        xy: [endXY[0], endXY[1] + dy],
                        dragHandler: this.handleChannelHeightChange,
                        cursor: "react-financial-charts-ns-resize-cursor",
                        fill: edgeFill2,
                        edge: "line2edge2",
                    })}
                </g>
            ) : null;

        return (
            <g>
                <ChannelWithArea
                    ref={this.saveNodeType("channel")}
                    selected={selected || hover}
                    {...hoverHandler}
                    startXY={startXY}
                    endXY={endXY}
                    dy={dy}
                    strokeStyle={stroke}
                    strokeWidth={hover || selected ? strokeWidth + 1 : strokeWidth}
                    fillStyle={fill}
                    interactiveCursorClass="react-financial-charts-move-cursor"
                    onDragStart={this.handleDragStart}
                    onDrag={this.handleChannelDrag}
                    onDragComplete={onDragComplete}
                />
                {line1Edge}
                {line2Edge}
                <HoverTextNearMouse show={hoverTextEnabled && hover && !selected} {...restHoverTextProps} />
            </g>
        );
    }

    private readonly getEdgeCircle = ({ xy, dragHandler, cursor, fill, edge }: any) => {
        const { hover } = this.state;
        const { appearance } = this.props;
        const { edgeStroke, edgeStrokeWidth, r } = appearance;
        const { selected } = this.props;
        const { onDragComplete } = this.props;

        return (
            <ClickableCircle
                ref={this.saveNodeType(edge)}
                show={selected || hover}
                cx={xy[0]}
                cy={xy[1]}
                r={r}
                fillStyle={fill}
                strokeStyle={edgeStroke}
                strokeWidth={edgeStrokeWidth}
                interactiveCursorClass={cursor}
                onDragStart={this.handleDragStart}
                onDrag={dragHandler}
                onDragComplete={onDragComplete}
            />
        );
    };

    private readonly handleChannelHeightChange = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag } = this.props;

        const { startXY, endXY } = this.dragStart;

        const {
            chartConfig: { yScale },
        } = moreProps;
        const { startPos, mouseXY } = moreProps;

        const y2 = yScale(endXY[1]);

        const dy = startPos[1] - mouseXY[1];

        const newY2Value = yScale.invert(y2 - dy);

        const newDy = newY2Value - endXY[1] + this.dragStart.dy;

        onDrag(e, index, {
            startXY,
            endXY,
            dy: newDy,
        });
    };

    private readonly handleLine1Edge2Drag = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag } = this.props;
        const { endXY } = this.dragStart;

        const {
            startPos,
            mouseXY,
            xAccessor,
            xScale,
            fullData,
            chartConfig: { yScale },
        } = moreProps;

        const dx = startPos[0] - mouseXY[0];
        const dy = startPos[1] - mouseXY[1];

        const x1 = xScale(endXY[0]);
        const y1 = yScale(endXY[1]);

        const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
        const newY1Value = yScale.invert(y1 - dy);

        onDrag(e, index, {
            startXY: this.dragStart.startXY,
            endXY: [newX1Value, newY1Value],
            dy: this.dragStart.dy,
        });
    };

    private readonly handleLine1Edge1Drag = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag } = this.props;
        const { startXY } = this.dragStart;

        const {
            startPos,
            mouseXY,
            xAccessor,
            xScale,
            fullData,
            chartConfig: { yScale },
        } = moreProps;

        const dx = startPos[0] - mouseXY[0];
        const dy = startPos[1] - mouseXY[1];

        const x1 = xScale(startXY[0]);
        const y1 = yScale(startXY[1]);

        const newX1Value = getXValue(xScale, xAccessor, [x1 - dx, y1 - dy], fullData);
        const newY1Value = yScale.invert(y1 - dy);

        onDrag(e, index, {
            startXY: [newX1Value, newY1Value],
            endXY: this.dragStart.endXY,
            dy: this.dragStart.dy,
        });
    };

    private readonly handleChannelDrag = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag } = this.props;

        const { startXY, endXY } = this.dragStart;

        const {
            xScale,
            chartConfig: { yScale },
            xAccessor,
            fullData,
        } = moreProps;
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

        onDrag(e, index, {
            startXY: [newX1Value, newY1Value],
            endXY: [newX2Value, newY2Value],
            dy: this.dragStart.dy,
        });
    };

    private readonly handleDragStart = () => {
        const { startXY, endXY, dy } = this.props;

        this.dragStart = {
            startXY,
            endXY,
            dy,
        };
    };

    private readonly handleHover = (_: React.MouseEvent, moreProps: any) => {
        if (this.state.hover !== moreProps.hovering) {
            this.setState({
                hover: moreProps.hovering,
            });
        }
    };
}
