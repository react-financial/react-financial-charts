import * as React from "react";

import { noop } from "../../utils";
import { getCurrentItem } from "../../utils/ChartDataUtil";
import { isHover, saveNodeType } from "../utils";

import { HoverTextNearMouse } from "../components/HoverTextNearMouse";
import {
    edge1Provider,
    edge2Provider,
    LinearRegressionChannelWithArea,
} from "../components/LinearRegressionChannelWithArea";

import { ClickableCircle } from "../components/ClickableCircle";

interface EachLinearRegressionChannelProps {
    defaultClassName?: string;
    x1Value: any;
    x2Value: any;
    index?: number;
    appearance: {
        stroke: string;
        fillOpacity: number;
        strokeOpacity: number;
        strokeWidth: number;
        fill: string;
        edgeStrokeWidth: number;
        edgeStroke: string;
        edgeFill: string;
        r: number;
    };
    edgeInteractiveCursor?: string;
    onDrag: any; // func
    onDragComplete: any; // func
    snapTo?: any; // func
    interactive: boolean;
    selected: boolean;
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
}

interface EachLinearRegressionChannelState {
    hover: boolean;
}

export class EachLinearRegressionChannel extends React.Component<EachLinearRegressionChannelProps, EachLinearRegressionChannelState> {

    public static defaultProps = {
        onDrag: noop,
        onDragComplete: noop,
        appearance: {
            stroke: "#000000",
            fillOpacity: 0.7,
            strokeOpacity: 1,
            strokeWidth: 1,
            fill: "#8AAFE2",
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
            x2Value,
            appearance,
            edgeInteractiveCursor,
            hoverText,
            interactive,
            selected,
            onDragComplete,
        } = this.props;
        const {
            stroke,
            strokeWidth,
            strokeOpacity,
            fill,
            fillOpacity,
            r,
            edgeStrokeWidth,
            edgeFill,
            edgeStroke,
        } = appearance;
        const { hover } = this.state;

        const hoverHandler = interactive
            ? { onHover: this.handleHover, onUnHover: this.handleHover }
            : {};

        const {
            enable: hoverTextEnabled,
            selectedText: hoverTextSelected,
            text: hoverTextUnselected,
            ...restHoverTextProps
        } = hoverText;

        return <g>
            <LinearRegressionChannelWithArea
                ref={this.saveNodeType("area")}
                selected={selected || hover}
                {...hoverHandler}

                x1Value={x1Value}
                x2Value={x2Value}
                fill={fill}
                stroke={stroke}
                strokeWidth={(hover || selected) ? strokeWidth + 1 : strokeWidth}
                strokeOpacity={strokeOpacity}
                fillOpacity={fillOpacity} />
            <ClickableCircle
                ref={this.saveNodeType("edge1")}
                show={selected || hover}
                xyProvider={edge1Provider(this.props)}
                r={r}
                fill={edgeFill}
                stroke={edgeStroke}
                strokeWidth={edgeStrokeWidth}
                interactiveCursorClass={edgeInteractiveCursor}
                onDrag={this.handleEdge1Drag}
                onDragComplete={onDragComplete} />
            <ClickableCircle
                ref={this.saveNodeType("edge2")}
                show={selected || hover}
                xyProvider={edge2Provider(this.props)}
                r={r}
                fill={edgeFill}
                stroke={edgeStroke}
                strokeWidth={edgeStrokeWidth}
                interactiveCursorClass={edgeInteractiveCursor}
                onDrag={this.handleEdge2Drag}
                onDragComplete={onDragComplete} />
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
        const { index, onDrag, snapTo } = this.props;
        const {
            x1Value,
        } = this.props;

        const [x2Value] = getNewXY(moreProps, snapTo);

        onDrag(index, {
            x1Value,
            x2Value,
        });
    }

    private readonly handleEdge1Drag = (moreProps) => {
        const { index, onDrag, snapTo } = this.props;
        const {
            x2Value,
        } = this.props;

        const [x1Value] = getNewXY(moreProps, snapTo);

        onDrag(index, {
            x1Value,
            x2Value,
        });
    }
}

export function getNewXY(moreProps, snapTo) {
    const { xScale, xAccessor, plotData, mouseXY } = moreProps;

    const currentItem = getCurrentItem(xScale, xAccessor, mouseXY, plotData);
    const x = xAccessor(currentItem);
    const y = snapTo(currentItem);

    return [x, y];
}
