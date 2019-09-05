import * as PropTypes from "prop-types";
import * as React from "react";

import { format } from "d3-format";
import { isDefined, noop, strokeDashTypes } from "../utils";

import { HoverTextNearMouse } from "./components/HoverTextNearMouse";
import {
    getValueFromOverride,
    isHoverForInteractiveType,
    saveNodeType,
    terminate,
} from "./utils";
import { EachInteractiveYCoordinate } from "./wrapper/EachInteractiveYCoordinate";

interface InteractiveYCoordinateProps {
    onChoosePosition: any; // func
    onDragComplete: any; // func
    onSelect?: any; // func
    onDelete?: any; // func
    defaultPriceCoordinate: {
        bgFill: string;
        bgOpacity: number;
        stroke: string;
        strokeDasharray: strokeDashTypes;
        strokeOpacity: number;
        strokeWidth: number;
        textFill: string;
        fontFamily: string;
        fontWeight: string;
        fontStyle: string;
        fontSize: number;
        text: string;
        textBox: {
            height: number;
            left: number;
            padding: {
                left: number;
                right: number;
            };
            closeIcon: {
                padding: {
                    left: number;
                    right: number;
                };
                width: number;
            };
        };
        edge: {
            stroke: string;
            strokeOpacity: number;
            strokeWidth: number;
            fill: string;
            fillOpacity: number;
        };
    };
    hoverText: object;
    yCoordinateList: any[];
    enabled: boolean;
}

interface InteractiveYCoordinateState {
    current?: any;
    override?: any;
}

export class InteractiveYCoordinate extends React.Component<InteractiveYCoordinateProps, InteractiveYCoordinateState> {

    public static defaultProps = {
        onChoosePosition: noop,
        onDragComplete: noop,
        onSelect: noop,
        onDelete: noop,
        defaultPriceCoordinate: {
            bgFill: "#FFFFFF",
            bgOpacity: 1,

            stroke: "#6574CD",
            strokeOpacity: 1,
            strokeDasharray: "ShortDash2",
            strokeWidth: 1,

            textFill: "#6574CD",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: 12,
            fontStyle: "normal",
            fontWeight: "normal",
            text: "Alert",
            textBox: {
                height: 24,
                left: 20,
                padding: { left: 10, right: 5 },
                closeIcon: {
                    padding: { left: 5, right: 8 },
                    width: 8,
                },
            },
            edge: {
                stroke: "#6574CD",
                strokeOpacity: 1,
                strokeWidth: 1,

                fill: "#FFFFFF",
                fillOpacity: 1,
                orient: "right",
                at: "right",
                arrowWidth: 10,
                dx: 0,
                rectWidth: 50,
                rectHeight: 20,
                displayFormat: format(".2f"),
            },
        },
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: 18,
            bgWidth: 175,
            text: "Click and drag the edge circles",
        },
        yCoordinateList: [],
    };

    public static contextTypes = {
        subscribe: PropTypes.func.isRequired,
        unsubscribe: PropTypes.func.isRequired,
        generateSubscriptionId: PropTypes.func.isRequired,
        chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    };

    // @ts-ignore
    private getSelectionState;
    private saveNodeType;

    // @ts-ignore
    private terminate;

    constructor(props) {
        super(props);

        this.terminate = terminate.bind(this);

        this.saveNodeType = saveNodeType.bind(this);
        this.getSelectionState = isHoverForInteractiveType("yCoordinateList")
            .bind(this);

        this.state = {};
    }

    public render() {
        const { yCoordinateList } = this.props;
        const { override } = this.state;
        return (
            <g>
                {yCoordinateList.map((each, idx) => {
                    const props = each;
                    return (
                        <EachInteractiveYCoordinate key={each.id}
                            ref={this.saveNodeType(idx)}
                            index={idx}
                            {...props}
                            selected={each.selected}
                            yValue={getValueFromOverride(override, idx, "yValue", each.yValue)}
                            onDelete={this.handleDelete}
                            onDrag={this.handleDrag}
                            onDragComplete={this.handleDragComplete}
                            edgeInteractiveCursor="react-stockcharts-move-cursor"
                        />
                    );
                })}
            </g>
        );
    }

    private readonly handleDelete = (index, moreProps) => {
        const { onDelete, yCoordinateList } = this.props;

        onDelete(yCoordinateList[index], moreProps);
    }

    private readonly handleDragComplete = (moreProps) => {
        const { override } = this.state;
        if (isDefined(override)) {
            const { yCoordinateList } = this.props;
            const newAlertList = yCoordinateList
                .map((each, idx) => {
                    const selected = (idx === override.index);
                    return selected
                        ? {
                            ...each,
                            yValue: override.yValue,
                            selected,
                        }
                        : {
                            ...each,
                            selected,
                        };
                });
            const draggedAlert = newAlertList[override.index];
            this.setState({
                override: null,
            }, () => {
                this.props.onDragComplete(newAlertList, moreProps, draggedAlert);
            });
        }
    }

    private readonly handleDrag = (index, yValue) => {
        this.setState({
            override: {
                index,
                yValue,
            },
        });
    }
}
