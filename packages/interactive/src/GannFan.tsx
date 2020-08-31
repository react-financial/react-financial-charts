import * as React from "react";
import { isDefined, isNotDefined, noop } from "@react-financial-charts/core";
import { HoverTextNearMouse, MouseLocationIndicator } from "./components";
import { isHoverForInteractiveType, saveNodeType, terminate } from "./utils";
import { EachGannFan } from "./wrapper";

export interface GannFanProps {
    readonly enabled: boolean;
    readonly onStart?: () => void;
    readonly onComplete: (e: React.MouseEvent, newfans: any[], moreProps: any) => void;
    readonly onSelect?: (e: React.MouseEvent, interactives: any[], moreProps: any) => void;
    readonly currentPositionStroke?: string;
    readonly currentPositionStrokeWidth?: number;
    readonly currentPositionOpacity?: number;
    readonly currentPositionRadius?: number;
    readonly appearance: {
        readonly stroke: string;
        readonly strokeOpacity: number;
        readonly fillOpacity: number;
        readonly strokeWidth: number;
        readonly edgeStroke: string;
        readonly edgeFill: string;
        readonly edgeStrokeWidth: number;
        readonly r: number;
        readonly fill: string[];
        readonly fontFamily: string;
        readonly fontSize: number;
        readonly fontFill: string;
    };
    readonly hoverText: object;
    readonly fans: any[];
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
            fill: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf"],
            fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
            fontSize: 12,
            fontFill: "#000000",
        },
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

    private mouseMoved: any;
    // @ts-ignore
    private getSelectionState: any;
    private saveNodeType: any;

    // @ts-ignore
    private terminate: any;

    public constructor(props: GannFanProps) {
        super(props);

        this.terminate = terminate.bind(this);
        this.saveNodeType = saveNodeType.bind(this);

        this.getSelectionState = isHoverForInteractiveType("fans").bind(this);

        this.state = {};
    }

    public render() {
        const {
            appearance,
            currentPositionOpacity,
            currentPositionRadius = GannFan.defaultProps.currentPositionRadius,
            currentPositionStroke,
            currentPositionStrokeWidth,
            enabled,
            fans,
            hoverText,
        } = this.props;

        const { current, override } = this.state;
        const overrideIndex = isDefined(override) ? override.index : null;

        const tempChannel =
            isDefined(current) && isDefined(current.endXY) ? (
                <EachGannFan interactive={false} {...current} appearance={appearance} hoverText={hoverText} />
            ) : null;

        return (
            <g>
                {fans.map((each, idx) => {
                    const eachAppearance = isDefined(each.appearance)
                        ? { ...appearance, ...each.appearance }
                        : appearance;

                    return (
                        <EachGannFan
                            key={idx}
                            ref={this.saveNodeType(idx)}
                            index={idx}
                            selected={each.selected}
                            {...(idx === overrideIndex ? override : each)}
                            appearance={eachAppearance}
                            hoverText={hoverText}
                            onDrag={this.handleDragFan}
                            onDragComplete={this.handleDragFanComplete}
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
                    onMouseMove={this.handleDrawFan}
                />
            </g>
        );
    }

    private readonly handleEnd = (e: React.MouseEvent, _: any, moreProps: any) => {
        const { current } = this.state;
        const { fans, appearance } = this.props;

        if (this.mouseMoved && isDefined(current) && isDefined(current.startXY)) {
            const newfans = [
                ...fans.map((d) => ({ ...d, selected: false })),
                { ...current, selected: true, appearance },
            ];
            this.setState(
                {
                    current: null,
                },
                () => {
                    const { onComplete } = this.props;
                    if (onComplete !== undefined) {
                        onComplete(e, newfans, moreProps);
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

    private readonly handleDrawFan = (_: React.MouseEvent, xyValue: any) => {
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
    };

    private readonly handleDragFanComplete = (e: React.MouseEvent, moreProps: any) => {
        const { override } = this.state;
        const { fans } = this.props;

        if (isDefined(override)) {
            const { index, ...rest } = override;
            const newfans = fans.map((each, idx) => (idx === index ? { ...each, ...rest, selected: true } : each));
            this.setState(
                {
                    override: null,
                },
                () => {
                    this.props.onComplete(e, newfans, moreProps);
                },
            );
        }
    };

    private readonly handleDragFan = (_: React.MouseEvent, index: number | undefined, newXYValue: any) => {
        this.setState({
            override: {
                index,
                ...newXYValue,
            },
        });
    };
}
