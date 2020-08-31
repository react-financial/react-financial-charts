import * as React from "react";
import { isDefined, noop } from "@react-financial-charts/core";
import { getXValue } from "@react-financial-charts/core/lib/utils/ChartDataUtil";
import { isHover, saveNodeType } from "../utils";
import { ClickableCircle, GannFan, HoverTextNearMouse } from "../components";

export interface EachGannFanProps {
    readonly startXY: number[];
    readonly endXY: number[];
    readonly dy?: number;
    readonly interactive: boolean;
    readonly selected: boolean;
    readonly appearance: {
        readonly stroke: string;
        readonly strokeWidth: number;
        readonly edgeStroke: string;
        readonly edgeFill: string;
        readonly edgeStrokeWidth: number;
        readonly r: number;
        readonly fill: Array<string>;
        readonly fontFamily: string;
        readonly fontSize: number;
        readonly fontFill: string;
    };
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

interface EachGannFanState {
    hover: boolean;
}

export class EachGannFan extends React.Component<EachGannFanProps, EachGannFanState> {
    public static defaultProps = {
        yDisplayFormat: (d: number) => d.toFixed(2),
        interactive: true,
        selected: false,
        appearance: {
            stroke: "#000000",
            strokeWidth: 1,
            edgeStroke: "#000000",
            edgeFill: "#FFFFFF",
            edgeStrokeWidth: 1,
            r: 5,
            fill: [
                "rgba(31, 119, 180, 0.2)",
                "rgba(255, 126, 14, 0.2)",
                "rgba(44, 160, 44, 0.2)",
                "rgba(214, 39, 39, 0.2)",
                "rgba(148, 103, 189, 0.2)",
                "rgba(140, 86, 75, 0.2)",
                "rgba(227, 119, 194, 0.2)",
                "rgba(127, 127, 127, 0.2)",
            ],
            fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
            fontSize: 10,
            fontFill: "#000000",
        },
        onDrag: noop,
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: 18,
            bgWidth: 120,
            text: "Click to select object",
        },
    };

    // @ts-ignore
    private isHover: any;
    private dragStart: any;
    private saveNodeType: any;

    public constructor(props: EachGannFanProps) {
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
        const { edgeFill, stroke, strokeWidth, fill } = appearance;
        const { fontFamily, fontSize, fontFill } = appearance;
        const { hoverText, selected } = this.props;
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
                        edge: "edge1",
                    })}
                    {this.getEdgeCircle({
                        xy: endXY,
                        dragHandler: this.handleLine1Edge2Drag,
                        cursor: "react-financial-charts-move-cursor",
                        fill: edgeFill,
                        edge: "edge2",
                    })}
                </g>
            ) : null;

        return (
            <g>
                <GannFan
                    ref={this.saveNodeType("fan")}
                    selected={hover || selected}
                    {...hoverHandler}
                    startXY={startXY}
                    endXY={endXY}
                    strokeStyle={stroke}
                    strokeWidth={hover || selected ? strokeWidth + 1 : strokeWidth}
                    fillStyle={fill}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    fontFill={fontFill}
                    interactiveCursorClass="react-financial-charts-move-cursor"
                    onDragStart={this.handleDragStart}
                    onDrag={this.handleFanDrag}
                    onDragComplete={onDragComplete}
                />
                {line1Edge}
                <HoverTextNearMouse show={hoverTextEnabled && hover && !selected} {...restHoverTextProps} />
            </g>
        );
    }

    private readonly getEdgeCircle = ({ xy, dragHandler, cursor, fill, edge }: any) => {
        const { hover } = this.state;
        const { selected, appearance } = this.props;
        const { edgeStroke, edgeStrokeWidth, r } = appearance;
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

    private readonly handleFanDrag = (e: React.MouseEvent, moreProps: any) => {
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

        // const newDy = newY2Value - endXY[1] + this.dragStart.dy;

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

    private readonly handleHover = (moreProps: any) => {
        if (this.state.hover !== moreProps.hovering) {
            this.setState({
                hover: moreProps.hovering,
            });
        }
    };
}
