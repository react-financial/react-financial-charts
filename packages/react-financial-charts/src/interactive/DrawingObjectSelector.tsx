import * as React from "react";
import { head, isDefined, mapObject, noop } from "../utils";
import { getMorePropsForChart, getSelected } from "./utils";

import GenericComponent, { getMouseCanvas } from "../GenericComponent";

interface DrawingObjectSelectorProps {
    readonly getInteractiveNodes: any; // func
    readonly onSelect: any; // func
    readonly onDoubleClick: any; // func
    readonly drawingObjectMap: object;
    readonly enabled: boolean;
}

export class DrawingObjectSelector extends React.Component<DrawingObjectSelectorProps> {

    public static defaultProps = {
        enabled: true,
        onDoubleClick: noop,
    };

    public render() {
        return (
            <GenericComponent
                svgDraw={noop}
                canvasToDraw={getMouseCanvas}
                canvasDraw={noop}
                onMouseDown={this.handleClick}
                onDoubleClick={this.handleDoubleClick}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly getInteraction = (moreProps) => {
        const { getInteractiveNodes, drawingObjectMap } = this.props;
        const interactiveNodes = getInteractiveNodes();
        const interactives = mapObject(interactiveNodes, (each) => {
            const key = drawingObjectMap[each.type];

            const valueArray = isDefined(key)
                ? each.node.props[key]
                : undefined;

            const valuePresent = isDefined(valueArray)
                && Array.isArray(valueArray)
                && valueArray.length > 0;
            if (valuePresent) {
                // console.log("Value present for ", each.type, each.chartId);
                const morePropsForChart = getMorePropsForChart(
                    moreProps, each.chartId,
                );

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
    }

    private readonly handleClick = (moreProps, e) => {
        e.preventDefault();
        const { onSelect } = this.props;
        const { enabled } = this.props;
        if (!enabled) { return; }

        const interactives = this.getInteraction(moreProps);

        onSelect(interactives, moreProps);
    }

    private readonly handleDoubleClick = (moreProps, e) => {
        e.preventDefault();
        const { onDoubleClick } = this.props;
        const { enabled } = this.props;
        if (!enabled) { return; }

        const interactives = this.getInteraction(moreProps);
        const allSelected = getSelected(interactives);

        if (allSelected.length > 0) {
            const selected = head(allSelected);
            const item = {
                type: selected.type,
                chartId: selected.chartId,
                object: head(selected.objects),
            };
            const morePropsForChart = getMorePropsForChart(
                moreProps, selected.chartId,
            );
            onDoubleClick(item, morePropsForChart);
        }
    }
}
