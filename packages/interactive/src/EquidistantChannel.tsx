import * as React from "react";
import { isDefined, isNotDefined, noop } from "@react-financial-charts/core";
import { HoverTextNearMouse, MouseLocationIndicator } from "./components";
import { getSlope, getYIntercept } from "./components/InteractiveStraightLine";
import { isHoverForInteractiveType, saveNodeType, terminate } from "./utils";
import { EachEquidistantChannel } from "./wrapper";

interface EquidistantChannelProps {
    readonly enabled: boolean;
    readonly onStart: () => void;
    readonly onComplete: (e: React.MouseEvent, newChannels: any[], moreProps: any) => void;
    readonly onSelect: (e: React.MouseEvent, interactives: any[], moreProps: any) => void;
    readonly currentPositionStroke?: string;
    readonly currentPositionStrokeWidth?: number;
    readonly currentPositionOpacity?: number;
    readonly currentPositionRadius?: number;
    readonly hoverText: object;
    readonly channels: any[];
    readonly appearance: {
        readonly stroke: string;
        readonly strokeOpacity: number;
        readonly strokeWidth: number;
        readonly fill: string;
        readonly fillOpacity: number;
        readonly edgeStroke: string;
        readonly edgeFill: string;
        readonly edgeFill2: string;
        readonly edgeStrokeWidth: number;
        readonly r: number;
    };
}

interface EquidistantChannelState {
    current?: any;
    override?: any;
}

export class EquidistantChannel extends React.Component<EquidistantChannelProps, EquidistantChannelState> {
    public static defaultProps = {
        onSelect: noop,
        currentPositionStroke: "#000000",
        currentPositionOpacity: 1,
        currentPositionStrokeWidth: 3,
        currentPositionRadius: 4,
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: 18,
            bgWidth: 120,
            text: "Click to select object",
        },
        channels: [],
        appearance: {
            stroke: "#000000",
            strokeOpacity: 1,
            strokeWidth: 1,
            fill: "#8AAFE2",
            fillOpacity: 0.7,
            edgeStroke: "#000000",
            edgeFill: "#FFFFFF",
            edgeFill2: "#250B98",
            edgeStrokeWidth: 1,
            r: 5,
        },
    };

    // @ts-ignore
    private terminate: () => void;
    private saveNodeType: any;
    // @ts-ignore
    private getSelectionState: any;
    private mouseMoved: any;

    public constructor(props: EquidistantChannelProps) {
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
            currentPositionRadius = EquidistantChannel.defaultProps.currentPositionRadius,
            currentPositionStroke,
            currentPositionStrokeWidth,
            enabled,
            hoverText,
        } = this.props;

        const { current, override } = this.state;

        const overrideIndex = isDefined(override) ? override.index : null;

        const tempChannel =
            isDefined(current) && isDefined(current.endXY) ? (
                <EachEquidistantChannel
                    interactive={false}
                    {...current}
                    appearance={appearance}
                    hoverText={hoverText}
                />
            ) : null;

        return (
            <g>
                {channels.map((each, idx) => {
                    const eachAppearance = isDefined(each.appearance)
                        ? { ...appearance, ...each.appearance }
                        : appearance;

                    return (
                        <EachEquidistantChannel
                            key={idx}
                            ref={this.saveNodeType(idx)}
                            index={idx}
                            selected={each.selected}
                            hoverText={hoverText}
                            {...(idx === overrideIndex ? override : each)}
                            appearance={eachAppearance}
                            onDrag={this.handleDragChannel}
                            onDragComplete={this.handleDragChannelComplete}
                        />
                    );
                })}
                {tempChannel}
                <MouseLocationIndicator
                    enabled={enabled}
                    snap={false}
                    r={currentPositionRadius}
                    stroke={currentPositionStroke}
                    opacity={currentPositionOpacity}
                    strokeWidth={currentPositionStrokeWidth}
                    onMouseDown={this.handleStart}
                    onClick={this.handleEnd}
                    onMouseMove={this.handleDrawChannel}
                />
            </g>
        );
    }

    private readonly handleDragChannel = (_: React.MouseEvent, index: any, newXYValue: any) => {
        this.setState({
            override: {
                index,
                ...newXYValue,
            },
        });
    };

    private readonly handleDragChannelComplete = (e: React.MouseEvent, moreProps: any) => {
        const { override } = this.state;
        const { channels } = this.props;

        if (isDefined(override)) {
            const { index, ...rest } = override;
            const newChannels = channels.map((each, idx) =>
                idx === index ? { ...each, ...rest, selected: true } : each,
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

    private readonly handleStart = (_: React.MouseEvent, xyValue: any) => {
        const { current } = this.state;

        if (isNotDefined(current) || isNotDefined(current.startXY)) {
            this.mouseMoved = false;
            this.setState(
                {
                    current: {
                        startXY: xyValue,
                        endXY: null,
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

    private readonly handleEnd = (e: React.MouseEvent, _: any, moreProps: any) => {
        const { current } = this.state;
        const { channels, appearance } = this.props;

        if (this.mouseMoved && isDefined(current) && isDefined(current.startXY)) {
            if (isNotDefined(current.dy)) {
                this.setState({
                    current: {
                        ...current,
                        dy: 0,
                    },
                });
            } else {
                const newChannels = [
                    ...channels.map((d) => ({ ...d, selected: false })),
                    {
                        ...current,
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
        }
    };

    private readonly handleDrawChannel = (_: React.MouseEvent, xyValue: any) => {
        const { current } = this.state;

        if (isDefined(current) && isDefined(current.startXY)) {
            this.mouseMoved = true;
            if (isNotDefined(current.dy)) {
                this.setState({
                    current: {
                        startXY: current.startXY,
                        endXY: xyValue,
                    },
                });
            } else {
                const m = getSlope(current.startXY, current.endXY);
                const b = getYIntercept(m, current.endXY);

                // @ts-ignore
                const y = m * xyValue[0] + b;
                const dy = xyValue[1] - y;

                this.setState({
                    current: {
                        ...current,
                        dy,
                    },
                });
            }
        }
    };
}
