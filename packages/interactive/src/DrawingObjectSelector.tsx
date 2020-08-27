import * as React from "react";
import { head, isDefined, mapObject, GenericComponent, getMouseCanvas } from "@react-financial-charts/core";
import { getMorePropsForChart, getSelected } from "./utils";

interface DrawingObjectSelectorProps {
    readonly getInteractiveNodes: () => any[];
    readonly onSelect?: (e: React.MouseEvent, interactives: any[], moreProps: any) => void;
    readonly onDoubleClick?: (e: React.MouseEvent, item: any, moreProps: any) => void;
    readonly drawingObjectMap: any;
    readonly enabled: boolean;
}

export class DrawingObjectSelector extends React.Component<DrawingObjectSelectorProps> {
    public static defaultProps = {
        enabled: true,
    };

    public render() {
        return (
            <GenericComponent
                canvasToDraw={getMouseCanvas}
                onMouseDown={this.handleClick}
                onDoubleClick={this.handleDoubleClick}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly getInteraction = (moreProps: any) => {
        const { getInteractiveNodes, drawingObjectMap } = this.props;
        const interactiveNodes = getInteractiveNodes();
        const interactives = mapObject(interactiveNodes, (each) => {
            const key = drawingObjectMap[each.type];

            const valueArray = isDefined(key) ? each.node.props[key] : undefined;

            const valuePresent = isDefined(valueArray) && Array.isArray(valueArray) && valueArray.length > 0;
            if (valuePresent) {
                const morePropsForChart = getMorePropsForChart(moreProps, each.chartId);

                const objects = each.node.getSelectionState(morePropsForChart);

                return {
                    type: each.type,
                    chartId: each.chartId,
                    objects,
                };
            }
            return {
                type: each.type,
                chartId: each.chartId,
                objects: [],
            };
        });

        return interactives;
    };

    private readonly handleClick = (e: React.MouseEvent, moreProps: any) => {
        e.preventDefault();
        const { onSelect } = this.props;
        const { enabled } = this.props;
        if (!enabled) {
            return;
        }

        const interactives = this.getInteraction(moreProps);
        if (onSelect !== undefined) {
            onSelect(e, interactives, moreProps);
        }
    };

    private readonly handleDoubleClick = (e: React.MouseEvent, moreProps: any) => {
        e.preventDefault();
        const { onDoubleClick } = this.props;
        const { enabled } = this.props;
        if (!enabled) {
            return;
        }

        const interactives = this.getInteraction(moreProps);
        const allSelected = getSelected(interactives);

        if (allSelected.length > 0) {
            const selected = head(allSelected);
            const item = {
                type: selected.type,
                chartId: selected.chartId,
                object: head(selected.objects),
            };
            const morePropsForChart = getMorePropsForChart(moreProps, selected.chartId);
            if (onDoubleClick !== undefined) {
                onDoubleClick(e, item, morePropsForChart);
            }
        }
    };
}
