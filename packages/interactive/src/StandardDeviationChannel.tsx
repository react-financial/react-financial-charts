import * as React from "react";
import { isDefined, isNotDefined } from "@react-financial-charts/core";
import { getValueFromOverride, isHoverForInteractiveType, saveNodeType, terminate } from "./utils";
import { HoverTextNearMouse, MouseLocationIndicator } from "./components";
import { EachLinearRegressionChannel } from "./wrapper";

export interface StandardDeviationChannelProps {
    readonly enabled: boolean;
    readonly snapTo?: (datum: any) => number;
    readonly onStart?: () => void;
    readonly onComplete?: (e: React.MouseEvent, newChannels: any, moreProps: any) => void;
    readonly onSelect?: (e: React.MouseEvent, interactives: any[], moreProps: any) => void;
    readonly currentPositionStroke?: string;
    readonly currentPositionStrokeWidth?: number;
    readonly currentPositionOpacity?: number;
    readonly currentPositionRadius?: number;
    readonly appearance: {
        readonly stroke?: string;
        readonly strokeOpacity?: number;
        readonly strokeWidth?: number;
        readonly fill?: string;
        readonly fillOpacity?: number;
        readonly edgeStrokeWidth?: number;
        readonly edgeStroke?: string;
        readonly edgeFill?: string;
        readonly r?: number;
    };
    readonly hoverText: object;
    readonly channels: any[];
}

interface StandardDeviationChannelState {
    current?: any;
    override?: any;
}

export class StandardDeviationChannel extends React.Component<
    StandardDeviationChannelProps,
    StandardDeviationChannelState
> {
    public static defaultProps = {
        snapTo: (d: any) => d.close,
        appearance: {
            stroke: "#000000",
            fillOpacity: 0.2,
            strokeOpacity: 1,
            strokeWidth: 1,
            fill: "#8AAFE2",
            edgeStrokeWidth: 2,
            edgeStroke: "#000000",
            edgeFill: "#FFFFFF",
            r: 5,
        },
        currentPositionStroke: "#000000",
        currentPositionOpacity: 1,
        currentPositionStrokeWidth: 3,
        currentPositionRadius: 4,
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: "auto",
            bgWidth: "auto",
            text: "Click and drag the edge circles",
            selectedText: "",
        },
        channels: [],
    };

    // @ts-ignore
    private getSelectionState: any;
    private mouseMoved: any;
    private saveNodeType: any;

    // @ts-ignore
    private terminate: any;

    public constructor(props: StandardDeviationChannelProps) {
        super(props);

        this.terminate = terminate.bind(this);
        this.saveNodeType = saveNodeType.bind(this);
        this.getSelectionState = isHoverForInteractiveType("channels").bind(this);

        this.state = {};
    }

    public render() {
        const {
            appearance,
            channels,
            currentPositionOpacity,
            currentPositionRadius = StandardDeviationChannel.defaultProps.currentPositionRadius,
            currentPositionStroke,
            currentPositionStrokeWidth,
            enabled,
            hoverText,
            snapTo,
        } = this.props;
        const { current, override } = this.state;

        const eachDefaultAppearance = {
            ...StandardDeviationChannel.defaultProps.appearance,
            ...appearance,
        };

        const hoverTextDefault = {
            ...StandardDeviationChannel.defaultProps.hoverText,
            ...hoverText,
        };

        const tempLine =
            isDefined(current) && isDefined(current.end) ? (
                <EachLinearRegressionChannel
                    interactive={false}
                    x1Value={current.start[0]}
                    x2Value={current.end[0]}
                    appearance={eachDefaultAppearance}
                    hoverText={hoverTextDefault}
                />
            ) : null;

        return (
            <g>
                {channels.map((each, idx) => {
                    const eachAppearance = isDefined(each.appearance)
                        ? { ...eachDefaultAppearance, ...each.appearance }
                        : eachDefaultAppearance;

                    const eachHoverText = isDefined(each.hoverText)
                        ? { ...hoverTextDefault, ...each.hoverText }
                        : hoverTextDefault;

                    return (
                        <EachLinearRegressionChannel
                            key={idx}
                            ref={this.saveNodeType(idx)}
                            index={idx}
                            selected={each.selected}
                            x1Value={getValueFromOverride(override, idx, "x1Value", each.start[0])}
                            x2Value={getValueFromOverride(override, idx, "x2Value", each.end[0])}
                            appearance={eachAppearance}
                            snapTo={snapTo}
                            hoverText={eachHoverText}
                            onDrag={this.handleDragLine}
                            onDragComplete={this.handleDragLineComplete}
                            edgeInteractiveCursor="react-financial-charts-move-cursor"
                        />
                    );
                })}
                {tempLine}
                <MouseLocationIndicator
                    enabled={enabled}
                    snap
                    snapTo={snapTo}
                    r={currentPositionRadius}
                    stroke={currentPositionStroke}
                    opacity={currentPositionOpacity}
                    strokeWidth={currentPositionStrokeWidth}
                    onMouseDown={this.handleStart}
                    onClick={this.handleEnd}
                    onMouseMove={this.handleDrawLine}
                />
            </g>
        );
    }

    private handleEnd = (e: React.MouseEvent, xyValue: any, moreProps: any) => {
        const { current } = this.state;
        const { appearance, channels } = this.props;

        if (this.mouseMoved && isDefined(current) && isDefined(current.start)) {
            const newChannels = [
                ...channels.map((d) => ({ ...d, selected: false })),
                {
                    start: current.start,
                    end: xyValue,
                    selected: true,
                    appearance,
                },
            ];

            this.setState(
                {
                    current: null,
                },
                () => {
                    const { onComplete } = this.props;
                    if (onComplete !== undefined) {
                        onComplete(e, newChannels, moreProps);
                    }
                },
            );
        }
    };

    private readonly handleStart = (_: React.MouseEvent, xyValue: any) => {
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
                        onStart();
                    }
                },
            );
        }
    };

    private readonly handleDrawLine = (e: React.MouseEvent, xyValue: any) => {
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
        const { channels } = this.props;
        if (isDefined(override)) {
            const newChannels = channels.map((each, idx) =>
                idx === override.index
                    ? {
                          ...each,
                          start: [override.x1Value, override.y1Value],
                          end: [override.x2Value, override.y2Value],
                          selected: true,
                      }
                    : each,
            );
            this.setState(
                {
                    override: null,
                },
                () => {
                    const { onComplete } = this.props;
                    if (onComplete !== undefined) {
                        onComplete(e, newChannels, moreProps);
                    }
                },
            );
        }
    };

    private readonly handleDragLine = (e: React.MouseEvent, index: number | undefined, newXYValue: any) => {
        this.setState({
            override: {
                index,
                ...newXYValue,
            },
        });
    };
}
