import * as React from "react";

import { isDefined, isNotDefined, noop } from "../utils";

import {
    getValueFromOverride,
    isHoverForInteractiveType,
    saveNodeType,
    terminate,
} from "./utils";

import { HoverTextNearMouse } from "./components/HoverTextNearMouse";
import { MouseLocationIndicator } from "./components/MouseLocationIndicator";
import { EachLinearRegressionChannel } from "./wrapper/EachLinearRegressionChannel";

interface StandardDeviationChannelProps {
    enabled: boolean;
    snapTo?: any; // func
    onStart?: any; // func
    onComplete: any; // func
    onSelect?: any; // func
    currentPositionStroke?: string;
    currentPositionStrokeWidth?: number;
    currentPositionOpacity?: number;
    currentPositionRadius?: number;
    appearance: {
        stroke?: string;
        strokeOpacity?: number;
        strokeWidth?: number;
        fill?: string;
        fillOpacity?: number;
        edgeStrokeWidth?: number;
        edgeStroke?: string;
        edgeFill?: string;
        r?: number;
    };
    hoverText: object;
    channels: any[];
}

interface StandardDeviationChannelState {
    current?: any;
    override?: any;
}

export class StandardDeviationChannel extends React.Component<StandardDeviationChannelProps, StandardDeviationChannelState> {

    public static defaultProps = {
        snapTo: (d) => d.close,
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
        onStart: noop,
        onComplete: noop,
        onSelect: noop,
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
    private getSelectionState;
    private mouseMoved;
    private saveNodeType;

    // @ts-ignore
    private terminate;

    public constructor(props) {
        super(props);

        this.terminate = terminate.bind(this);
        this.saveNodeType = saveNodeType.bind(this);

        this.getSelectionState = isHoverForInteractiveType("channels")
            .bind(this);

        this.state = {};
    }

    public render() {
        const { appearance } = this.props;
        const { enabled, snapTo } = this.props;
        const { currentPositionRadius, currentPositionStroke } = this.props;
        const { currentPositionOpacity, currentPositionStrokeWidth } = this.props;
        const { hoverText, channels } = this.props;
        const { current, override } = this.state;

        const eachDefaultAppearance = {
            ...StandardDeviationChannel.defaultProps.appearance,
            ...appearance,
        };

        const hoverTextDefault = {
            ...StandardDeviationChannel.defaultProps.hoverText,
            ...hoverText,
        };

        const tempLine = isDefined(current) && isDefined(current.end)
            ? <EachLinearRegressionChannel
                interactive={false}
                x1Value={current.start[0]}
                x2Value={current.end[0]}
                appearance={eachDefaultAppearance}
                hoverText={hoverTextDefault}
            />
            : null;

        return <g>
            {channels.map((each, idx) => {
                const eachAppearance = isDefined(each.appearance)
                    ? { ...eachDefaultAppearance, ...each.appearance }
                    : eachDefaultAppearance;

                const eachHoverText = isDefined(each.hoverText)
                    ? { ...hoverTextDefault, ...each.hoverText }
                    : hoverTextDefault;

                return <EachLinearRegressionChannel key={idx}
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
                    edgeInteractiveCursor="react-stockcharts-move-cursor"
                />;
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
        </g>;
    }

    private handleEnd = (xyValue, moreProps, e) => {
        const { current } = this.state;
        const { appearance, channels } = this.props;

        if (this.mouseMoved
            && isDefined(current)
            && isDefined(current.start)
        ) {
            const newChannels = [
                ...channels.map((d) => ({ ...d, selected: false })),
                {
                    start: current.start,
                    end: xyValue,
                    selected: true,
                    appearance,
                },
            ];

            this.setState({
                current: null,
            }, () => {
                this.props.onComplete(newChannels, moreProps, e);
            });
        }
    }

    private readonly handleStart = (xyValue) => {
        const { current } = this.state;

        if (isNotDefined(current) || isNotDefined(current.start)) {
            this.mouseMoved = false;

            this.setState({
                current: {
                    start: xyValue,
                    end: null,
                },
            }, () => {
                this.props.onStart();
            });
        }
    }

    private readonly handleDrawLine = (xyValue) => {
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
    }

    private readonly handleDragLineComplete = (moreProps) => {
        const { override } = this.state;
        const { channels } = this.props;
        if (isDefined(override)) {

            const newChannels = channels
                .map((each, idx) => idx === override.index
                    ? {
                        ...each,
                        start: [override.x1Value, override.y1Value],
                        end: [override.x2Value, override.y2Value],
                        selected: true,
                    }
                    : each);
            this.setState({
                override: null,
            }, () => {
                this.props.onComplete(newChannels, moreProps);
            });
        }
    }

    private readonly handleDragLine = (index, newXYValue) => {
        this.setState({
            override: {
                index,
                ...newXYValue,
            },
        });
    }
}
