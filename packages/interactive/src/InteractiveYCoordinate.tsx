import { format } from "d3-format";
import * as React from "react";
import { ChartContext, isDefined, strokeDashTypes } from "@react-financial-charts/core";
import { HoverTextNearMouse } from "./components";
import { getValueFromOverride, isHoverForInteractiveType, saveNodeType, terminate } from "./utils";
import { EachInteractiveYCoordinate } from "./wrapper";

interface InteractiveYCoordinateProps {
    readonly onChoosePosition: (e: React.MouseEvent, newText: any, moreProps: any) => void;
    readonly onDragComplete: (e: React.MouseEvent, newAlertList: any[], moreProps: any, draggedAlert: any) => void;
    readonly onSelect?: (e: React.MouseEvent, interactives: any[], moreProps: any) => void;
    readonly onDelete?: (e: React.MouseEvent, yCoordinate: any, moreProps: any) => void;
    readonly defaultPriceCoordinate: {
        readonly bgFill: string;
        readonly bgOpacity: number;
        readonly stroke: string;
        readonly strokeDasharray: strokeDashTypes;
        readonly strokeOpacity: number;
        readonly strokeWidth: number;
        readonly textFill: string;
        readonly fontFamily: string;
        readonly fontWeight: string;
        readonly fontStyle: string;
        readonly fontSize: number;
        readonly text: string;
        readonly textBox: {
            readonly height: number;
            readonly left: number;
            readonly padding: {
                left: number;
                right: number;
            };
            readonly closeIcon: {
                padding: {
                    left: number;
                    right: number;
                };
                width: number;
            };
        };
        readonly edge: {
            readonly stroke: string;
            readonly strokeOpacity: number;
            readonly strokeWidth: number;
            readonly fill: string;
            readonly fillOpacity: number;
        };
    };
    readonly hoverText: object;
    readonly yCoordinateList: any[];
    readonly enabled: boolean;
}

interface InteractiveYCoordinateState {
    current?: any;
    override?: any;
}

export class InteractiveYCoordinate extends React.Component<InteractiveYCoordinateProps, InteractiveYCoordinateState> {
    public static defaultProps = {
        defaultPriceCoordinate: {
            bgFill: "#FFFFFF",
            bgOpacity: 1,
            stroke: "#6574CD",
            strokeOpacity: 1,
            strokeDasharray: "ShortDash2",
            strokeWidth: 1,
            textFill: "#6574CD",
            fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
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

    public static contextType = ChartContext;

    // @ts-ignore
    private getSelectionState: any;
    private saveNodeType: any;
    // @ts-ignore
    private terminate: any;

    public constructor(props: InteractiveYCoordinateProps) {
        super(props);

        this.terminate = terminate.bind(this);
        this.saveNodeType = saveNodeType.bind(this);
        this.getSelectionState = isHoverForInteractiveType("yCoordinateList").bind(this);

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
                        <EachInteractiveYCoordinate
                            key={each.id}
                            ref={this.saveNodeType(idx)}
                            index={idx}
                            {...props}
                            selected={each.selected}
                            yValue={getValueFromOverride(override, idx, "yValue", each.yValue)}
                            onDelete={this.handleDelete}
                            onDrag={this.handleDrag}
                            onDragComplete={this.handleDragComplete}
                            edgeInteractiveCursor="react-financial-charts-move-cursor"
                        />
                    );
                })}
            </g>
        );
    }

    private readonly handleDelete = (e: React.MouseEvent, index: number | undefined, moreProps: any) => {
        const { onDelete, yCoordinateList } = this.props;
        if (onDelete !== undefined && index !== undefined) {
            onDelete(e, yCoordinateList[index], moreProps);
        }
    };

    private readonly handleDragComplete = (e: React.MouseEvent, moreProps: any) => {
        const { override } = this.state;
        if (isDefined(override)) {
            const { yCoordinateList } = this.props;
            const newAlertList = yCoordinateList.map((each, idx) => {
                const selected = idx === override.index;
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
            this.setState(
                {
                    override: null,
                },
                () => {
                    const { onDragComplete } = this.props;
                    if (onDragComplete !== undefined) {
                        onDragComplete(e, newAlertList, moreProps, draggedAlert);
                    }
                },
            );
        }
    };

    private readonly handleDrag = (_: React.MouseEvent, index: any, yValue: any) => {
        this.setState({
            override: {
                index,
                yValue,
            },
        });
    };
}
