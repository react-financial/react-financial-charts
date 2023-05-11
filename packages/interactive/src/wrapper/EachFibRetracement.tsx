import * as React from "react";
import { head, last, noop } from "@react-financial-charts/core";
import { getXValue } from "@react-financial-charts/core/lib/utils/ChartDataUtil";
import { isHover, saveNodeType } from "../utils";
import { ClickableCircle, HoverTextNearMouse, InteractiveStraightLine, generateLine, Text } from "../components";
import { getNewXY } from "./EachTrendLine";

export interface EachFibRetracementProps {
    readonly x1: any;
    readonly x2: any;
    readonly y1: number;
    readonly y2: number;
    readonly yDisplayFormat: (value: number) => string;
    readonly type: string;
    readonly selected: boolean;
    readonly appearance: {
        readonly strokeStyle: string;
        readonly strokeWidth: number;
        readonly fontFamily: string;
        readonly fontSize: number;
        readonly fontFill: string;
        readonly edgeStroke: string;
        readonly edgeFill: string;
        readonly nsEdgeFill: string;
        readonly edgeStrokeWidth: number;
        readonly r: number;
    };
    readonly interactive: boolean;
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
        readonly selectedText: string;
    };
    readonly index?: number;
    readonly onDrag: (e: React.MouseEvent, index: number | undefined, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
}

interface EachFibRetracementState {
    hover: boolean;
}

export class EachFibRetracement extends React.Component<EachFibRetracementProps, EachFibRetracementState> {
    public static defaultProps = {
        yDisplayFormat: (d: number) => d.toFixed(2),
        interactive: true,
        appearance: {
            strokeStyle: "#000000",
            strokeWidth: 1,
            fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
            fontSize: 10,
            fontFill: "#000000",
            edgeStroke: "#000000",
            edgeFill: "#FFFFFF",
            nsEdgeFill: "#000000",
            edgeStrokeWidth: 1,
            r: 5,
        },
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

    public constructor(props: EachFibRetracementProps) {
        super(props);

        this.isHover = isHover.bind(this);
        this.saveNodeType = saveNodeType.bind(this);

        this.state = {
            hover: false,
        };
    }

    public render() {
        const { x1, x2, y1, y2 } = this.props;
        const { interactive, yDisplayFormat, type, appearance } = this.props;
        const { strokeStyle, strokeWidth } = appearance;
        const { fontFamily, fontSize, fontFill } = appearance;
        const { edgeStroke, edgeFill, nsEdgeFill, edgeStrokeWidth, r } = appearance;
        const { hoverText, selected } = this.props;
        const { hover } = this.state;
        const { onDragComplete } = this.props;
        const lines = helper({ x1, x2, y1, y2 });

        const {
            enable: hoverTextEnabled,
            selectedText: hoverTextSelected,
            text: hoverTextUnselected,
            ...restHoverTextProps
        } = hoverText;

        const lineType = type === "EXTEND" ? "XLINE" : type === "BOUND" ? "LINE" : "RAY";
        const dir = head(lines).y1 > last(lines).y1 ? 3 : -1.3;

        return (
            <g>
                {lines.map((line, j) => {
                    const text = `${yDisplayFormat(line.y)} (${line.percent.toFixed(2)}%)`;

                    const xyProvider = ({ xScale, chartConfig }: any) => {
                        const { yScale } = chartConfig;
                        const {
                            x1: lineX1,
                            y1: lineY1,
                            x2: lineX2,
                        } = generateLine({
                            type: lineType,
                            start: [line.x1, line.y],
                            end: [line.x2, line.y],
                            xScale,
                            yScale,
                        });

                        const x = xScale(Math.min(lineX1, lineX2)) + 10;
                        const y = yScale(lineY1) + dir * 4;
                        return [x, y];
                    };

                    const firstOrLast = j === 0 || j === lines.length - 1;

                    const interactiveCursorClass = firstOrLast
                        ? "react-financial-charts-ns-resize-cursor"
                        : "react-financial-charts-move-cursor";

                    const interactiveEdgeCursorClass = firstOrLast
                        ? "react-financial-charts-ns-resize-cursor"
                        : "react-financial-charts-ew-resize-cursor";

                    const dragHandler =
                        j === 0
                            ? this.handleLineNSResizeTop
                            : j === lines.length - 1
                            ? this.handleLineNSResizeBottom
                            : this.handleLineMove;

                    const edge1DragHandler =
                        j === 0
                            ? this.handleLineNSResizeTop
                            : j === lines.length - 1
                            ? this.handleLineNSResizeBottom
                            : this.handleEdge1Drag;
                    const edge2DragHandler =
                        j === 0
                            ? this.handleLineNSResizeTop
                            : j === lines.length - 1
                            ? this.handleLineNSResizeBottom
                            : this.handleEdge2Drag;

                    const hoverHandler = interactive ? { onHover: this.handleHover, onUnHover: this.handleHover } : {};
                    return (
                        <g key={j}>
                            <InteractiveStraightLine
                                ref={this.saveNodeType(`line_${j}`)}
                                selected={selected || hover}
                                {...hoverHandler}
                                type={lineType}
                                x1Value={line.x1}
                                y1Value={line.y}
                                x2Value={line.x2}
                                y2Value={line.y}
                                strokeStyle={strokeStyle}
                                strokeWidth={hover || selected ? strokeWidth + 1 : strokeWidth}
                                interactiveCursorClass={interactiveCursorClass}
                                onDragStart={this.handleLineDragStart}
                                onDrag={dragHandler}
                                onDragComplete={onDragComplete}
                            />
                            <Text
                                selected={selected}
                                xyProvider={xyProvider}
                                fontFamily={fontFamily}
                                fontSize={fontSize}
                                fillStyle={fontFill}
                            >
                                {text}
                            </Text>
                            <ClickableCircle
                                ref={this.saveNodeType("edge1")}
                                show={selected || hover}
                                cx={line.x1}
                                cy={line.y}
                                r={r}
                                fillStyle={firstOrLast ? nsEdgeFill : edgeFill}
                                strokeStyle={edgeStroke}
                                strokeWidth={edgeStrokeWidth}
                                interactiveCursorClass={interactiveEdgeCursorClass}
                                onDrag={edge1DragHandler}
                                onDragComplete={onDragComplete}
                            />
                            <ClickableCircle
                                ref={this.saveNodeType("edge2")}
                                show={selected || hover}
                                cx={line.x2}
                                cy={line.y}
                                r={r}
                                fillStyle={firstOrLast ? nsEdgeFill : edgeFill}
                                strokeStyle={edgeStroke}
                                strokeWidth={edgeStrokeWidth}
                                interactiveCursorClass={interactiveEdgeCursorClass}
                                onDrag={edge2DragHandler}
                                onDragComplete={onDragComplete}
                            />
                        </g>
                    );
                })}
                <HoverTextNearMouse
                    show={hoverTextEnabled && hover}
                    {...restHoverTextProps}
                    text={selected ? hoverTextSelected : hoverTextUnselected}
                />
            </g>
        );
    }

    private readonly handleEdge2Drag = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag, x1, y1, y2 } = this.props;

        const [x2] = getNewXY(moreProps);

        onDrag(e, index, {
            x1,
            y1,
            x2,
            y2,
        });
    };

    private readonly handleEdge1Drag = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag, y1, x2, y2 } = this.props;

        const [x1] = getNewXY(moreProps);

        onDrag(e, index, {
            x1,
            y1,
            x2,
            y2,
        });
    };

    private readonly handleLineNSResizeBottom = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag, x1, y1, x2 } = this.props;

        const [, y2] = getNewXY(moreProps);

        onDrag(e, index, {
            x1,
            y1,
            x2,
            y2,
        });
    };

    private readonly handleLineNSResizeTop = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag, x1, x2, y2 } = this.props;

        const [, y1] = getNewXY(moreProps);

        onDrag(e, index, {
            x1,
            y1,
            x2,
            y2,
        });
    };

    private readonly handleLineMove = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag } = this.props;

        const { x1: x1Value, y1: y1Value, x2: x2Value, y2: y2Value } = this.dragStart;

        const {
            xScale,
            chartConfig: { yScale },
            xAccessor,
            fullData,
        } = moreProps;
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

        onDrag(e, index, {
            x1: newX1Value,
            y1: newY1Value,
            x2: newX2Value,
            y2: newY2Value,
        });
    };

    private readonly handleLineDragStart = () => {
        const { x1, y1, x2, y2 } = this.props;

        this.dragStart = {
            x1,
            y1,
            x2,
            y2,
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

function helper({ x1, y1, x2, y2 }: any) {
    const dy = y2 - y1;
    const retracements = [100, 61.8, 50, 38.2, 23.6, 0].map((each) => ({
        percent: each,
        x1,
        x2,
        y: y2 - (each / 100) * dy,
    }));

    return retracements;
}
