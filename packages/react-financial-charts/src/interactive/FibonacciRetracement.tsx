import * as React from "react";

import { isDefined, isNotDefined, noop } from "../utils";
import { HoverTextNearMouse } from "./components/HoverTextNearMouse";
import { MouseLocationIndicator } from "./components/MouseLocationIndicator";
import {
    isHoverForInteractiveType,
    saveNodeType,
    terminate,
} from "./utils";
import { EachFibRetracement } from "./wrapper/EachFibRetracement";

interface FibonacciRetracementProps {
    enabled: boolean;
    width?: number;
    onStart?: any; // func
    onComplete?: any; // func
    onSelect?: any; // func
    type:
    "EXTEND" | // extends from -Infinity to +Infinity
    "RAY" | // extends to +/-Infinity in one direction
    "BOUND"; // extends between the set bounds
    hoverText: object;
    currentPositionStroke?: string;
    currentPositionStrokeWidth?: number;
    currentPositionOpacity?: number;
    currentPositionRadius?: number;
    retracements: any[];
    appearance: {
        stroke: string;
        strokeWidth: number;
        strokeOpacity: number;
        fontFamily: string;
        fontSize: number;
        fontFill: string;
        edgeStroke: string;
        edgeFill: string;
        nsEdgeFill: string;
        edgeStrokeWidth: number;
        r: number;
    };
}

interface FibonacciRetracementState {
    current?: any;
    override?: any;
}

export class FibonacciRetracement extends React.Component<FibonacciRetracementProps, FibonacciRetracementState> {

    public static defaultProps = {
        enabled: true,
        type: "RAY",
        retracements: [],
        onStart: noop,
        onComplete: noop,
        onSelect: noop,
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: "auto",
            bgWidth: "auto",
            text: "Click to select object",
            selectedText: "",
        },
        currentPositionStroke: "#000000",
        currentPositionOpacity: 1,
        currentPositionStrokeWidth: 3,
        currentPositionRadius: 4,
        appearance: {
            stroke: "#000000",
            strokeWidth: 1,
            strokeOpacity: 1,
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: 11,
            fontFill: "#000000",
            edgeStroke: "#000000",
            edgeFill: "#FFFFFF",
            nsEdgeFill: "#000000",
            edgeStrokeWidth: 1,
            r: 5,
        },
    };

    // @ts-ignore
    private getSelectionState;
    private mouseMoved;
    private saveNodeType;

    // @ts-ignore
    private terminate;

    constructor(props) {
        super(props);

        this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
        this.handleEdge2Drag = this.handleEdge2Drag.bind(this);

        this.terminate = terminate.bind(this);
        this.getSelectionState = isHoverForInteractiveType("retracements")
            .bind(this);

        this.saveNodeType = saveNodeType.bind(this);
        this.state = {};
    }

    public render() {
        const { current, override } = this.state;
        const { retracements } = this.props;

        const {
            appearance,
            type,
        } = this.props;
        const {
            currentPositionStroke,
            currentPositionOpacity,
            currentPositionStrokeWidth,
            currentPositionRadius,
        } = this.props;

        const { enabled, hoverText } = this.props;
        const overrideIndex = isDefined(override) ? override.index : null;
        const hoverTextWidthDefault = {
            ...FibonacciRetracement.defaultProps.hoverText,
            ...hoverText,
        };

        const currentRetracement = isDefined(current) && isDefined(current.x2)
            ? <EachFibRetracement
                interactive={false}
                type={type}
                appearance={appearance}
                hoverText={hoverTextWidthDefault}
                {...current}
            />
            : null;
        return (
            <g>
                {retracements.map((each, idx) => {
                    const eachAppearance = isDefined(each.appearance)
                        ? { ...appearance, ...each.appearance }
                        : appearance;

                    const eachHoverText = isDefined(each.hoverText)
                        ? { ...hoverTextWidthDefault, ...each.hoverText }
                        : hoverTextWidthDefault;

                    return (
                        <EachFibRetracement
                            key={idx}
                            ref={this.saveNodeType(idx)}
                            index={idx}
                            type={each.type}
                            selected={each.selected}
                            {...(idx === overrideIndex ? override : each)}
                            hoverText={eachHoverText}
                            appearance={eachAppearance}
                            onDrag={this.handleDrag}
                            onDragComplete={this.handleDragComplete}
                        />
                    );
                })}
                {currentRetracement}
                <MouseLocationIndicator
                    enabled={enabled}
                    snap={false}
                    r={currentPositionRadius}
                    stroke={currentPositionStroke}
                    opacity={currentPositionOpacity}
                    strokeWidth={currentPositionStrokeWidth}
                    onMouseDown={this.handleStart}
                    onClick={this.handleEnd}
                    onMouseMove={this.handleDrawRetracement}
                />
            </g>
        );
    }

    private readonly handleDrawRetracement = (xyValue) => {
        const { current } = this.state;
        if (isDefined(current) && isDefined(current.x1)) {
            this.mouseMoved = true;
            this.setState({
                current: {
                    ...current,
                    x2: xyValue[0],
                    y2: xyValue[1],
                },
            });
        }
    }

    private readonly handleEdge1Drag = (echo, newXYValue, origXYValue) => {
        const { retracements } = this.props;
        const { index } = echo;

        const dx = origXYValue.x1Value - newXYValue.x1Value;

        this.setState({
            override: {
                index,
                x1: retracements[index].x1 - dx,
                y1: retracements[index].y1,
                x2: retracements[index].x2,
                y2: retracements[index].y2,
            },
        });
    }

    private readonly handleDrag = (index, xy) => {
        this.setState({
            override: {
                index,
                ...xy,
            },
        });
    }

    private readonly handleEdge2Drag = (echo, newXYValue, origXYValue) => {
        const { retracements } = this.props;
        const { index } = echo;

        const dx = origXYValue.x2Value - newXYValue.x2Value;

        this.setState({
            override: {
                index,
                x1: retracements[index].x1,
                y1: retracements[index].y1,
                x2: retracements[index].x2 - dx,
                y2: retracements[index].y2,
            },
        });
    }

    private readonly handleDragComplete = (moreProps) => {
        const { retracements } = this.props;
        const { override } = this.state;
        if (isDefined(override)) {
            const { index, ...rest } = override;

            const newRetracements = retracements.map(
                (each, idx) =>
                    (idx === index
                        ? { ...each, ...rest, selected: true }
                        : each),
            );
            this.setState(
                {
                    override: null,
                },
                () => {
                    this.props.onComplete(newRetracements, moreProps);
                },
            );
        }
    }

    private readonly handleStart = (xyValue, moreProps) => {
        const { current } = this.state;
        if (isNotDefined(current) || isNotDefined(current.x1)) {
            this.mouseMoved = false;
            this.setState(
                {
                    current: {
                        x1: xyValue[0],
                        y1: xyValue[1],
                        x2: null,
                        y2: null,
                    },
                },
                () => {
                    this.props.onStart(moreProps);
                },
            );
        }
    }

    private readonly handleEnd = (xyValue, moreProps, e) => {
        const { retracements, appearance, type } = this.props;
        const { current } = this.state;

        if (this.mouseMoved && isDefined(current) && isDefined(current.x1)) {
            const newRetracements = retracements.concat({
                ...current,
                x2: xyValue[0],
                y2: xyValue[1],
                selected: true,
                appearance,
                type,
            });

            this.setState(
                {
                    current: null,
                },
                () => {
                    this.props.onComplete(newRetracements, moreProps, e);
                },
            );
        }
    }
}
