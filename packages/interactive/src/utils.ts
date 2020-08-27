import { isDefined, isNotDefined, mapObject } from "@react-financial-charts/core";

export function getValueFromOverride(override: any, index: any, key: any, defaultValue: any) {
    if (isDefined(override) && override.index === index) {
        return override[key];
    }
    return defaultValue;
}

export function terminate() {
    // @ts-ignore
    this.setState({
        current: null,
        override: null,
    });
}

export function saveNodeType(type: any) {
    return (node: any) => {
        // @ts-ignore
        if (isDefined(this.nodes)) {
            // @ts-ignore
            if (isNotDefined(node) && isDefined(this.nodes[type])) {
                // @ts-ignore
                delete this.nodes[type];
            } else {
                // @ts-ignore
                this.nodes[type] = node;
            }
        } else {
            // @ts-ignore
            this.nodes = [];
        }
    };
}
export function isHoverForInteractiveType(interactiveType: any) {
    return function (moreProps: any) {
        // this has to be function as it is bound to this

        // @ts-ignore
        if (isDefined(this.nodes)) {
            // @ts-ignore
            const selecedNodes = this.nodes.map((node) => node.isHover(moreProps));
            // @ts-ignore
            const interactive = this.props[interactiveType].map((t, idx) => {
                return {
                    ...t,
                    selected: selecedNodes[idx],
                };
            });
            return interactive;
        }
    };
}

export function isHover(moreProps: any) {
    // @ts-ignore
    const hovering = mapObject(this.nodes, (node) => node.isHover(moreProps)).reduce((a, b) => {
        return a || b;
    });
    return hovering;
}

function getMouseXY(moreProps: any, [ox, oy]: any) {
    if (Array.isArray(moreProps.mouseXY)) {
        const {
            mouseXY: [x, y],
        } = moreProps;
        const mouseXY = [x - ox, y - oy];
        return mouseXY;
    }
    return moreProps.mouseXY;
}

export function getMorePropsForChart(moreProps: any, chartId: any) {
    const { chartConfig: chartConfigList } = moreProps;
    const chartConfig = chartConfigList.find((each: any) => each.id === chartId);

    const { origin } = chartConfig;
    const mouseXY = getMouseXY(moreProps, origin);
    return {
        ...moreProps,
        chartConfig,
        mouseXY,
    };
}

export function getSelected(interactives: any) {
    const selected = interactives
        .map((each: any) => {
            const objects = each.objects.filter((obj: any) => {
                return obj.selected;
            });
            return {
                ...each,
                objects,
            };
        })
        .filter((each: any) => each.objects.length > 0);
    return selected;
}
