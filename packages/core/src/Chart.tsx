import { scaleLinear } from "d3-scale";
import * as PropTypes from "prop-types";
import * as React from "react";

import { find, PureComponent } from "./utils";

interface ChartProps {
    readonly height?: number;
    readonly origin?: number[] | ((width: number, height: number) => number[]);
    readonly id: number | string;
    readonly yExtents?: number[] | ((data: any) => number | number[]);
    readonly yExtentsCalculator?: any; // func
    readonly onContextMenu?: (props: any, event: React.MouseEvent) => void;
    readonly yScale?: any; // func
    readonly flipYScale?: boolean;
    readonly padding?: number | { top: number; bottom: number };
}

export class Chart extends PureComponent<ChartProps> {
    public static defaultProps = {
        id: 0,
        origin: [0, 0],
        padding: 0,
        yScale: scaleLinear(),
        flipYScale: false,
        yPan: true,
        yPanEnabled: false,
    };

    public static contextTypes = {
        chartConfig: PropTypes.array,
        subscribe: PropTypes.func.isRequired,
        unsubscribe: PropTypes.func.isRequired,
    };

    public static childContextTypes = {
        chartConfig: PropTypes.object.isRequired,
        chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    };

    constructor(props: ChartProps, context) {
        super(props, context);

        this.yScale = this.yScale.bind(this);
        this.listener = this.listener.bind(this);
    }

    public componentDidMount() {
        const { id } = this.props;
        const { subscribe } = this.context;

        subscribe(`chart_${id}`, {
            listener: this.listener,
        });
    }

    public componentWillUnmount() {
        const { id } = this.props;
        const { unsubscribe } = this.context;

        unsubscribe(`chart_${id}`);
    }

    public listener(type, moreProps, state, e) {
        const { id, onContextMenu } = this.props;

        if (type === "contextmenu") {
            const { currentCharts } = moreProps;
            if (currentCharts.indexOf(id) > -1) {
                if (onContextMenu !== undefined) {
                    onContextMenu(moreProps, e);
                }
            }
        }
    }

    public yScale() {
        const chartConfig = find(this.context.chartConfig, each => each.id === this.props.id);
        return chartConfig.yScale.copy();
    }

    public getChildContext() {
        const { id: chartId } = this.props;

        const chartConfig = find(this.context.chartConfig, each => each.id === chartId);

        return {
            chartId,
            chartConfig,
        };
    }

    public render() {
        const { origin } = find(this.context.chartConfig, each => each.id === this.props.id);
        const [x, y] = origin;

        return <g transform={`translate(${x}, ${y})`}>{this.props.children}</g>;
    }
}
