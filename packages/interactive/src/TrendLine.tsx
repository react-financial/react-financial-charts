import * as React from "react";
import { isDefined, isNotDefined, noop, strokeDashTypes } from "@react-financial-charts/core";
import { getValueFromOverride, isHoverForInteractiveType, saveNodeType, terminate } from "./utils";
import { HoverTextNearMouse, MouseLocationIndicator, InteractiveStraightLine } from "./components";
import { EachTrendLine } from "./wrapper";

export interface TrendLineProps {
    readonly snap: boolean;
    readonly enabled: boolean;
    readonly snapTo?: (datum: any) => number | number[];
    readonly shouldDisableSnap?: (e: React.MouseEvent) => boolean;
    readonly onStart: (e: React.MouseEvent, moreProps: any) => void;
    readonly onComplete?: (e: React.MouseEvent, newTrends: any[], moreProps: any) => void;
    readonly onSelect?: (e: React.MouseEvent, interactives: any[], moreProps: any) => void;
    readonly currentPositionStroke?: string;
    readonly currentPositionStrokeWidth?: number;
    readonly currentPositionstrokeOpacity?: number;
    readonly currentPositionRadius?: number;
    readonly type:
        | "XLINE" // extends from -Infinity to +Infinity
        | "RAY" // extends to +/-Infinity in one direction
        | "LINE"; // extends between the set bounds
    readonly hoverText: object;
    readonly trends: any[];
    readonly appearance: {
        readonly strokeStyle: string;
        readonly strokeWidth: number;
        readonly strokeDasharray: strokeDashTypes;
        readonly edgeStrokeWidth: number;
        readonly edgeFill: string;
        readonly edgeStroke: string;
    };
}

interface TrendLineState {
    current?: any;
    override?: any;
    trends?: any;
}

export class TrendLine extends React.Component<TrendLineProps, TrendLineState> {
    public static defaultProps = {
        type: "XLINE",
        onStart: noop,
        onSelect: noop,
        currentPositionStroke: "#000000",
        currentPositionstrokeOpacity: 1,
        currentPositionStrokeWidth: 3,
        currentPositionRadius: 0,
        shouldDisableSnap: (e: React.MouseEvent) => e.button === 2 || e.shiftKey,
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: "auto",
            bgWidth: "auto",
            text: "Click to select object",
            selectedText: "",
        },
        trends: [],
        appearance: {
            strokeStyle: "#000000",
            strokeWidth: 1,
            strokeDasharray: "Solid",
            edgeStrokeWidth: 1,
            edgeFill: "#FFFFFF",
            edgeStroke: "#000000",
            r: 6,
        },
    };

    // @ts-ignore
    private getSelectionState: any;
    private mouseMoved: any;
    private saveNodeType: any;
    // @ts-ignore
    private terminate: any;

    public constructor(props: TrendLineProps) {
        super(props);

        this.terminate = terminate.bind(this);
        this.saveNodeType = saveNodeType.bind(this);

        this.getSelectionState = isHoverForInteractiveType("trends").bind(this);

        this.state = {};
    }

    public render() {
        const {
            appearance,
            currentPositionstrokeOpacity,
            currentPositionRadius = TrendLine.defaultProps.currentPositionRadius,
            currentPositionStroke,
            currentPositionStrokeWidth,
            enabled,
            hoverText,
            shouldDisableSnap,
            snap,
            snapTo,
            trends,
            type,
        } = this.props;

        const { current, override } = this.state;

        const tempLine =
            isDefined(current) && isDefined(current.end) ? (
                <InteractiveStraightLine
                    type={type}
                    x1Value={current.start[0]}
                    y1Value={current.start[1]}
                    x2Value={current.end[0]}
                    y2Value={current.end[1]}
                    strokeStyle={appearance.strokeStyle}
                    strokeWidth={appearance.strokeWidth}
                />
            ) : null;

        return (
            <g>
                {trends.map((each, idx) => {
                    const eachAppearance = isDefined(each.appearance)
                        ? { ...appearance, ...each.appearance }
                        : appearance;

                    const hoverTextWithDefault = {
                        ...TrendLine.defaultProps.hoverText,
                        ...hoverText,
                    };

                    return (
                        <EachTrendLine
                            key={idx}
                            ref={this.saveNodeType(idx)}
                            index={idx}
                            type={each.type}
                            selected={each.selected}
                            x1Value={getValueFromOverride(override, idx, "x1Value", each.start[0])}
                            y1Value={getValueFromOverride(override, idx, "y1Value", each.start[1])}
                            x2Value={getValueFromOverride(override, idx, "x2Value", each.end[0])}
                            y2Value={getValueFromOverride(override, idx, "y2Value", each.end[1])}
                            strokeStyle={eachAppearance.strokeStyle}
                            strokeWidth={eachAppearance.strokeWidth}
                            strokeOpacity={eachAppearance.strokeOpacity}
                            strokeDasharray={eachAppearance.strokeDasharray}
                            edgeStroke={eachAppearance.edgeStroke}
                            edgeFill={eachAppearance.edgeFill}
                            edgeStrokeWidth={eachAppearance.edgeStrokeWidth}
                            r={eachAppearance.r}
                            hoverText={hoverTextWithDefault}
                            onDrag={this.handleDragLine}
                            onDragComplete={this.handleDragLineComplete}
                            edgeInteractiveCursor="react-financial-charts-move-cursor"
                            lineInteractiveCursor="react-financial-charts-move-cursor"
                        />
                    );
                })}
                {tempLine}
                <MouseLocationIndicator
                    enabled={enabled}
                    snap={snap}
                    shouldDisableSnap={shouldDisableSnap}
                    snapTo={snapTo}
                    r={currentPositionRadius}
                    stroke={currentPositionStroke}
                    opacity={currentPositionstrokeOpacity}
                    strokeWidth={currentPositionStrokeWidth}
                    onMouseDown={this.handleStart}
                    onClick={this.handleEnd}
                    onMouseMove={this.handleDrawLine}
                />
            </g>
        );
    }

    private readonly handleEnd = (e: React.MouseEvent, xyValue: any, moreProps: any) => {
        const { current } = this.state;
        const { trends, appearance, type } = this.props;

        if (this.mouseMoved && isDefined(current) && isDefined(current.start)) {
            const newTrends = [
                ...trends.map((d) => ({ ...d, selected: false })),
                {
                    start: current.start,
                    end: xyValue,
                    selected: true,
                    appearance,
                    type,
                },
            ];
            this.setState(
                {
                    current: null,
                    trends: newTrends,
                },
                () => {
                    const { onComplete } = this.props;
                    if (onComplete !== undefined) {
                        onComplete(e, newTrends, moreProps);
                    }
                },
            );
        }
    };

    private readonly handleStart = (e: React.MouseEvent, xyValue: any, moreProps: any) => {
        const { current } = this.state;

        if (isNotDefined(current) || isNotDefined(current.start)) {
            this.mouseMoved = false;

            this.setState(
                {
                    current: {
                        start: xyValue,
                        end: null,
                    },
                },
                () => {
                    const { onStart } = this.props;
                    if (onStart !== undefined) {
                        onStart(e, moreProps);
                    }
                },
            );
        }
    };

    private readonly handleDrawLine = (_: React.MouseEvent, xyValue: any) => {
        const { current } = this.state;
        if (isDefined(current) && isDefined(current.start)) {
            this.mouseMoved = true;
            this.setState({
                current: {
                    start: current.start,
                    end: xyValue,
                },
            });
        }
    };

    private readonly handleDragLineComplete = (e: React.MouseEvent, moreProps: any) => {
        const { override } = this.state;
        if (isDefined(override)) {
            const { trends } = this.props;
            const newTrends = trends.map((each, idx) =>
                idx === override.index
                    ? {
                          ...each,
                          start: [override.x1Value, override.y1Value],
                          end: [override.x2Value, override.y2Value],
                          selected: true,
                      }
                    : {
                          ...each,
                          selected: false,
                      },
            );

            this.setState(
                {
                    override: null,
                },
                () => {
                    const { onComplete } = this.props;
                    if (onComplete !== undefined) {
                        onComplete(e, newTrends, moreProps);
                    }
                },
            );
        }
    };

    private readonly handleDragLine = (_: React.MouseEvent, index: number | undefined, newXYValue: any) => {
        this.setState({
            override: {
                index,
                ...newXYValue,
            },
        });
    };
}
