import {
    find,
    isDefined,
    isNotDefined,
    mapObject,
} from "../utils";

export function getValueFromOverride(override, index, key, defaultValue) {
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

export function saveNodeType(type) {
    return (node) => {
        // @ts-ignore
        if (isNotDefined(node) && isDefined(this.nodes[type])) {
            // @ts-ignore
            delete this.nodes[type];
        } else {
            // @ts-ignore
            this.nodes[type] = node;
        }
        // console.error(this.nodes)
    };
}
export function isHoverForInteractiveType(interactiveType) {
    return function (moreProps) { // this has to be function as it is bound to this

        // @ts-ignore
        if (isDefined(this.nodes)) {
            // @ts-ignore
            const selecedNodes = this.nodes
                .map((node) => node.isHover(moreProps));
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

export function isHover(moreProps) {
    // @ts-ignore
    const hovering = mapObject(this.nodes, (node) => node.isHover(moreProps))
        .reduce((a, b) => {
            return a || b;
        });
    return hovering;
}

function getMouseXY(moreProps, [ox, oy]) {
    if (Array.isArray(moreProps.mouseXY)) {
        const { mouseXY: [x, y] } = moreProps;
        const mouseXY = [
            x - ox,
            y - oy,
        ];
        return mouseXY;
    }
    return moreProps.mouseXY;
}

export function getMorePropsForChart(moreProps, chartId) {
    const { chartConfig: chartConfigList } = moreProps;
    const chartConfig = find(chartConfigList, (each) => each.id === chartId);

    const { origin } = chartConfig;
    const mouseXY = getMouseXY(moreProps, origin);
    return {
        ...moreProps,
        chartConfig,
        mouseXY,
    };
}

export function getSelected(interactives) {
    const selected = interactives
        .map((each) => {
            const objects = each.objects.filter((obj) => {
                return obj.selected;
            });
            return {
                ...each,
                objects,
            };
        })
        .filter((each) => each.objects.length > 0);
    return selected;
}
