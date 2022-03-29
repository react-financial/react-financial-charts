import * as React from "react";
import { isDefined, isNotDefined, noop } from "@react-financial-charts/core";
import { HoverTextNearMouse, MouseLocationIndicator } from "./components";
import { isHoverForInteractiveType, saveNodeType, terminate } from "./utils";
import { EachFibRetracement } from "./wrapper";

interface FibonacciRetracementProps {
    readonly enabled: boolean;
    readonly width?: number;
    readonly onStart?: (moreProps: any) => void;
    readonly onComplete?: (e: React.MouseEvent, newRetracements: any[], moreProps: any) => void;
    readonly onSelect?: (e: React.MouseEvent, interactives: any[], moreProps: any) => void;
    readonly type:
        | "EXTEND" // extends from -Infinity to +Infinity
        | "RAY" // extends to +/-Infinity in one direction
        | "BOUND"; // extends between the set bounds
    readonly hoverText: object;
    readonly currentPositionStroke?: string;
    readonly currentPositionStrokeWidth?: number;
    readonly currentPositionOpacity?: number;
    readonly currentPositionRadius?: number;
    readonly retracements: any[];
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
            strokeStyle: "#000000",
            strokeWidth: 1,
            fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
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
    private getSelectionState: any;
    private mouseMoved: any;
    private saveNodeType: any;
    // @ts-ignore
    private terminate: any;

    public constructor(props: FibonacciRetracementProps) {
        super(props);

        this.handleEdge1Drag = this.handleEdge1Drag.bind(this);
        this.handleEdge2Drag = this.handleEdge2Drag.bind(this);

        this.terminate = terminate.bind(this);
        this.getSelectionState = isHoverForInteractiveType("retracements").bind(this);

        this.saveNodeType = saveNodeType.bind(this);
        this.state = {};
    }

    public render() {
        const { current, override } = this.state;

        const {
            appearance,
            currentPositionStroke,
            currentPositionOpacity,
            currentPositionStrokeWidth,
            currentPositionRadius = FibonacciRetracement.defaultProps.currentPositionRadius,
            retracements,
            type,
        } = this.props;

        const { enabled, hoverText } = this.props;
        const overrideIndex = isDefined(override) ? override.index : null;
        const hoverTextWidthDefault = {
            ...FibonacciRetracement.defaultProps.hoverText,
            ...hoverText,
        };

        const currentRetracement =
            isDefined(current) && isDefined(current.x2) ? (
                <EachFibRetracement
                    interactive={false}
                    type={type}
                    appearance={appearance}
                    hoverText={hoverTextWidthDefault}
                    {...current}
                />
            ) : null;
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

    private readonly handleDrawRetracement = (_: React.MouseEvent, xyValue: any) => {
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
    };

    private readonly handleEdge1Drag = (_: React.MouseEvent, echo: any, newXYValue: any, origXYValue: any) => {
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
    };

    private readonly handleDrag = (_: React.MouseEvent, index: any, xy: any) => {
        this.setState({
            override: {
                index,
                ...xy,
            },
        });
    };

    private readonly handleEdge2Drag = (_: React.MouseEvent, echo: any, newXYValue: any, origXYValue: any) => {
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
    };

    private readonly handleDragComplete = (e: React.MouseEvent, moreProps: any) => {
        const { retracements } = this.props;
        const { override } = this.state;
        if (isDefined(override)) {
            const { index, ...rest } = override;

            const newRetracements = retracements.map((each, idx) =>
                idx === index ? { ...each, ...rest, selected: true } : each,
            );
            this.setState(
                {
                    override: null,
                },
                () => {
                    const { onComplete } = this.props;
                    if (onComplete !== undefined) {
                        onComplete(e, newRetracements, moreProps);
                    }
                },
            );
        }
    };

    private readonly handleStart = (e: React.MouseEvent, xyValue: any, moreProps: any) => {
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
                    const { onStart } = this.props;
                    if (onStart !== undefined) {
                        onStart(moreProps);
                    }
                },
            );
        }
    };

    private readonly handleEnd = (e: React.MouseEvent, xyValue: any, moreProps: any) => {
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
                    const { onComplete } = this.props;
                    if (onComplete !== undefined) {
                        onComplete(e, newRetracements, moreProps);
                    }
                },
            );
        }
    };
}
