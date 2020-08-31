import { getCurrentItem } from "@react-financial-charts/core/lib/utils/ChartDataUtil";
import * as React from "react";
import { isHover, saveNodeType } from "../utils";
import { HoverTextNearMouse, ClickableCircle } from "../components";
import {
    edge1Provider,
    edge2Provider,
    LinearRegressionChannelWithArea,
} from "../components/LinearRegressionChannelWithArea";

export interface EachLinearRegressionChannelProps {
    readonly defaultClassName?: string;
    readonly x1Value: any;
    readonly x2Value: any;
    readonly index?: number;
    readonly appearance: {
        readonly stroke: string;
        readonly strokeWidth: number;
        readonly fill: string;
        readonly edgeStrokeWidth: number;
        readonly edgeStroke: string;
        readonly edgeFill: string;
        readonly r: number;
    };
    readonly edgeInteractiveCursor?: string;
    readonly onDrag?: (e: React.MouseEvent, index: number | undefined, x1y1: { x1Value: any; x2Value: any }) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly snapTo?: (datum: any) => number;
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
        readonly selectedText: string;
    };
}

interface EachLinearRegressionChannelState {
    hover: boolean;
}

export class EachLinearRegressionChannel extends React.Component<
    EachLinearRegressionChannelProps,
    EachLinearRegressionChannelState
> {
    public static defaultProps = {
        appearance: {
            stroke: "#000000",
            strokeWidth: 1,
            fill: "rgba(138, 175, 226, 0.7)",
            edgeStrokeWidth: 2,
            edgeStroke: "#000000",
            edgeFill: "#FFFFFF",
            r: 5,
        },
        interactive: true,
        selected: false,
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: 18,
            bgWidth: 175,
            text: "Click and drag the edge circles",
        },
    };

    // @ts-ignore
    private isHover: any;
    private saveNodeType: any;

    public constructor(props: EachLinearRegressionChannelProps) {
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
            x2Value,
            appearance,
            edgeInteractiveCursor,
            hoverText,
            interactive,
            selected,
            onDragComplete,
        } = this.props;
        const { stroke, strokeWidth, fill, r, edgeStrokeWidth, edgeFill, edgeStroke } = appearance;
        const { hover } = this.state;

        const hoverHandler = interactive ? { onHover: this.handleHover, onUnHover: this.handleHover } : {};

        const {
            enable: hoverTextEnabled,
            selectedText: hoverTextSelected,
            text: hoverTextUnselected,
            ...restHoverTextProps
        } = hoverText;

        return (
            <g>
                <LinearRegressionChannelWithArea
                    ref={this.saveNodeType("area")}
                    selected={selected || hover}
                    {...hoverHandler}
                    x1Value={x1Value}
                    x2Value={x2Value}
                    fillStyle={fill}
                    strokeStyle={stroke}
                    strokeWidth={hover || selected ? strokeWidth + 1 : strokeWidth}
                />
                <ClickableCircle
                    ref={this.saveNodeType("edge1")}
                    show={selected || hover}
                    xyProvider={edge1Provider(this.props)}
                    r={r}
                    fillStyle={edgeFill}
                    strokeStyle={edgeStroke}
                    strokeWidth={edgeStrokeWidth}
                    interactiveCursorClass={edgeInteractiveCursor}
                    onDrag={this.handleEdge1Drag}
                    onDragComplete={onDragComplete}
                />
                <ClickableCircle
                    ref={this.saveNodeType("edge2")}
                    show={selected || hover}
                    xyProvider={edge2Provider(this.props)}
                    r={r}
                    fillStyle={edgeFill}
                    strokeStyle={edgeStroke}
                    strokeWidth={edgeStrokeWidth}
                    interactiveCursorClass={edgeInteractiveCursor}
                    onDrag={this.handleEdge2Drag}
                    onDragComplete={onDragComplete}
                />
                <HoverTextNearMouse
                    show={hoverTextEnabled && hover}
                    {...restHoverTextProps}
                    text={selected ? hoverTextSelected : hoverTextUnselected}
                />
            </g>
        );
    }

    private readonly handleHover = (_: React.MouseEvent, moreProps: any) => {
        if (this.state.hover !== moreProps.hovering) {
            this.setState({
                hover: moreProps.hovering,
            });
        }
    };

    private readonly handleEdge2Drag = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag, snapTo, x1Value } = this.props;
        if (onDrag === undefined) {
            return;
        }

        const [x2Value] = getNewXY(moreProps, snapTo);

        onDrag(e, index, {
            x1Value,
            x2Value,
        });
    };

    private readonly handleEdge1Drag = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag, snapTo, x2Value } = this.props;
        if (onDrag === undefined) {
            return;
        }

        const [x1Value] = getNewXY(moreProps, snapTo);

        onDrag(e, index, {
            x1Value,
            x2Value,
        });
    };
}

export function getNewXY(moreProps: any, snapTo: any) {
    const { xScale, xAccessor, plotData, mouseXY } = moreProps;

    const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
    const x = xAccessor(currentItem);
    const y = snapTo(currentItem);

    return [x, y];
}
