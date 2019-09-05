import * as React from "react";

import { isDefined, isNotDefined, noop, strokeDashTypes } from "../utils";

import {
    getValueFromOverride,
    isHoverForInteractiveType,
    saveNodeType,
    terminate,
} from "./utils";

import { HoverTextNearMouse } from "./components/HoverTextNearMouse";
import { MouseLocationIndicator } from "./components/MouseLocationIndicator";
import StraightLine from "./components/StraightLine";
import { EachTrendLine } from "./wrapper/EachTrendLine";

interface TrendLineProps {
    snap: boolean;
    enabled: boolean;
    snapTo?: any; // func
    shouldDisableSnap: any; // func
    onStart: any; // func
    onComplete: any; // func
    onSelect?: any; // func
    currentPositionStroke?: string;
    currentPositionStrokeWidth?: number;
    currentPositionstrokeOpacity?: number;
    currentPositionRadius?: number;
    type:
    "XLINE" | // extends from -Infinity to +Infinity
    "RAY" | // extends to +/-Infinity in one direction
    "LINE"; // extends between the set bounds
    hoverText: object;
    trends: any[];
    appearance: {
        stroke: string;
        strokeOpacity: number;
        strokeWidth: number;
        strokeDasharray: strokeDashTypes;
        edgeStrokeWidth: number;
        edgeFill: string;
        edgeStroke: string;
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
        onComplete: noop,
        onSelect: noop,
        currentPositionStroke: "#000000",
        currentPositionstrokeOpacity: 1,
        currentPositionStrokeWidth: 3,
        currentPositionRadius: 0,
        shouldDisableSnap: (e) => (e.button === 2 || e.shiftKey),
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
            stroke: "#000000",
            strokeOpacity: 1,
            strokeWidth: 1,
            strokeDasharray: "Solid",
            edgeStrokeWidth: 1,
            edgeFill: "#FFFFFF",
            edgeStroke: "#000000",
            r: 6,
        },
    };

    // @ts-ignore
    private getSelectionState;
    private mouseMoved;
    private saveNodeType;
    // @ts-ignore
    private terminate;

    public constructor(props: TrendLineProps) {
        super(props);

        this.terminate = terminate.bind(this);
        this.saveNodeType = saveNodeType.bind(this);

        this.getSelectionState = isHoverForInteractiveType("trends")
            .bind(this);

        this.state = {
        };
    }

    public render() {
        const { appearance } = this.props;
        const { enabled, snap, shouldDisableSnap, snapTo, type } = this.props;
        const { currentPositionRadius, currentPositionStroke } = this.props;
        const { currentPositionstrokeOpacity, currentPositionStrokeWidth } = this.props;
        const { hoverText, trends } = this.props;
        const { current, override } = this.state;

        const tempLine = isDefined(current) && isDefined(current.end)
            ? <StraightLine
                type={type}
                x1Value={current.start[0]}
                y1Value={current.start[1]}
                x2Value={current.end[0]}
                y2Value={current.end[1]}
                stroke={appearance.stroke}
                strokeWidth={appearance.strokeWidth}
                strokeOpacity={appearance.strokeOpacity} />
            : null;

        return <g>
            {trends.map((each, idx) => {
                const eachAppearance = isDefined(each.appearance)
                    ? { ...appearance, ...each.appearance }
                    : appearance;

                const hoverTextWithDefault = {
                    ...TrendLine.defaultProps.hoverText,
                    ...hoverText,
                };

                return <EachTrendLine key={idx}
                    ref={this.saveNodeType(idx)}
                    index={idx}
                    type={each.type}
                    selected={each.selected}
                    x1Value={getValueFromOverride(override, idx, "x1Value", each.start[0])}
                    y1Value={getValueFromOverride(override, idx, "y1Value", each.start[1])}
                    x2Value={getValueFromOverride(override, idx, "x2Value", each.end[0])}
                    y2Value={getValueFromOverride(override, idx, "y2Value", each.end[1])}
                    stroke={eachAppearance.stroke}
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
                    edgeInteractiveCursor="react-stockcharts-move-cursor"
                    lineInteractiveCursor="react-stockcharts-move-cursor"
                />;
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
        </g>;
    }

    private readonly handleEnd = (xyValue, moreProps, e) => {
        const { current } = this.state;
        const { trends, appearance, type } = this.props;

        if (this.mouseMoved
            && isDefined(current)
            && isDefined(current.start)
        ) {
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
            this.setState({
                current: null,
                trends: newTrends,
            }, () => {
                this.props.onComplete(newTrends, moreProps, e);
            });
        }
    }

    private readonly handleStart = (xyValue, moreProps, e) => {
        const { current } = this.state;

        if (isNotDefined(current) || isNotDefined(current.start)) {
            this.mouseMoved = false;

            this.setState({
                current: {
                    start: xyValue,
                    end: null,
                },
            }, () => {
                this.props.onStart(moreProps, e);
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
        if (isDefined(override)) {
            const { trends } = this.props;
            const newTrends = trends
                .map((each, idx) => idx === override.index
                    ? {
                        ...each,
                        start: [override.x1Value, override.y1Value],
                        end: [override.x2Value, override.y2Value],
                        selected: true,
                    }
                    : {
                        ...each,
                        selected: false,
                    });

            this.setState({
                override: null,
            }, () => {
                this.props.onComplete(newTrends, moreProps);
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
