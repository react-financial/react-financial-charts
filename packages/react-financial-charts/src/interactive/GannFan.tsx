import * as React from "react";

import { isDefined, isNotDefined, noop } from "../utils";
import { HoverTextNearMouse } from "./components/HoverTextNearMouse";
import { MouseLocationIndicator } from "./components/MouseLocationIndicator";
import {
    isHoverForInteractiveType,
    saveNodeType,
    terminate,
} from "./utils";
import { EachGannFan } from "./wrapper/EachGannFan";

interface GannFanProps {
    enabled: boolean;
    onStart: any; // func
    onComplete: any; // func
    onSelect?: any; // func
    currentPositionStroke?: string;
    currentPositionStrokeWidth?: number;
    currentPositionOpacity?: number;
    currentPositionRadius?: number;
    appearance: {
        stroke: string;
        strokeOpacity: number;
        fillOpacity: number;
        strokeWidth: number;
        edgeStroke: string;
        edgeFill: string;
        edgeStrokeWidth: number;
        r: number;
        fill: string[],
        fontFamily: string;
        fontSize: number;
        fontFill: string;
    };
    hoverText: object;
    fans: any[];
}

interface GannFanState {
    current?: any;
    override?: any;
}

export class GannFan extends React.Component<GannFanProps, GannFanState> {

    public static defaultProps = {
        appearance: {
            stroke: "#000000",
            fillOpacity: 0.2,
            strokeOpacity: 1,
            strokeWidth: 1,
            edgeStroke: "#000000",
            edgeFill: "#FFFFFF",
            edgeStrokeWidth: 1,
            r: 5,
            fill: [
                "#e41a1c",
                "#377eb8",
                "#4daf4a",
                "#984ea3",
                "#ff7f00",
                "#ffff33",
                "#a65628",
                "#f781bf",
            ],
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: 12,
            fontFill: "#000000",
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
            bgHeight: 18,
            bgWidth: 120,
            text: "Click to select object",
        },
        fans: [],
    };

    private mouseMoved;
    // @ts-ignore
    private getSelectionState;
    private saveNodeType;

    // @ts-ignore
    private terminate;

    public constructor(props) {
        super(props);

        this.terminate = terminate.bind(this);
        this.saveNodeType = saveNodeType.bind(this);

        this.getSelectionState = isHoverForInteractiveType("fans")
            .bind(this);

        this.state = {};
    }

    public render() {
        const { enabled, appearance } = this.props;
        const { currentPositionRadius, currentPositionStroke } = this.props;
        const { currentPositionOpacity, currentPositionStrokeWidth } = this.props;
        const { hoverText, fans } = this.props;
        const { current, override } = this.state;
        const overrideIndex = isDefined(override) ? override.index : null;

        const tempChannel = isDefined(current) && isDefined(current.endXY)
            ? <EachGannFan
                interactive={false}
                {...current}
                appearance={appearance}
                hoverText={hoverText}
            />
            : null;

        return (
            <g>
                {fans.map((each, idx) => {
                    const eachAppearance = isDefined(each.appearance)
                        ? { ...appearance, ...each.appearance }
                        : appearance;

                    return <EachGannFan key={idx}
                        ref={this.saveNodeType(idx)}
                        index={idx}
                        selected={each.selected}
                        {...(idx === overrideIndex ? override : each)}
                        appearance={eachAppearance}
                        hoverText={hoverText}
                        onDrag={this.handleDragFan}
                        onDragComplete={this.handleDragFanComplete}
                    />;
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
                    onMouseMove={this.handleDrawFan}
                />
            </g>
        );
    }

    private readonly handleEnd = (xyValyue, moreProps, e) => {
        const { current } = this.state;
        const { fans, appearance } = this.props;

        if (this.mouseMoved
            && isDefined(current)
            && isDefined(current.startXY)
        ) {
            const newfans = [
                ...fans.map((d) => ({ ...d, selected: false })),
                { ...current, selected: true, appearance },
            ];
            this.setState({
                current: null,
            }, () => {
                this.props.onComplete(newfans, moreProps, e);
            });
        }
    }

    private readonly handleStart = (xyValue) => {
        const { current } = this.state;

        if (isNotDefined(current) || isNotDefined(current.startXY)) {
            this.mouseMoved = false;

            this.setState({
                current: {
                    startXY: xyValue,
                    endXY: null,
                },
            }, () => {
                this.props.onStart();
            });
        }
    }

    private readonly handleDrawFan = (xyValue) => {
        const { current } = this.state;

        if (isDefined(current) && isDefined(current.startXY)) {
            this.mouseMoved = true;

            this.setState({
                current: {
                    startXY: current.startXY,
                    endXY: xyValue,
                },
            });
        }
    }

    private readonly handleDragFanComplete = (moreProps) => {
        const { override } = this.state;
        const { fans } = this.props;

        if (isDefined(override)) {
            const { index, ...rest } = override;
            const newfans = fans
                .map((each, idx) => idx === index
                    ? { ...each, ...rest, selected: true }
                    : each);
            this.setState({
                override: null,
            }, () => {
                this.props.onComplete(newfans, moreProps);
            });
        }
    }

    private readonly handleDragFan = (index, newXYValue) => {
        this.setState({
            override: {
                index,
                ...newXYValue,
            },
        });
    }
}
