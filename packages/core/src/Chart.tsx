import { scaleLinear } from "d3-scale";
import * as PropTypes from "prop-types";
import * as React from "react";

import { find, PureComponent } from "./utils";

interface ChartProps {
    readonly flipYScale?: boolean;
    readonly height?: number;
    readonly id: number | string;
    readonly onContextMenu?: (props: any, event: React.MouseEvent) => void;
    readonly origin?: number[] | ((width: number, height: number) => number[]);
    readonly padding?: number | { top: number; bottom: number };
    readonly yExtents?: number[] | ((data: any) => number) | ((data: any) => number[]);
    readonly yExtentsCalculator?: any; // func
    readonly yPan?: boolean;
    readonly yPanEnabled?: boolean;
    readonly yScale?: any; // func
}

export class Chart extends PureComponent<ChartProps> {
    public static defaultProps = {
        flipYScale: false,
        id: 0,
        origin: [0, 0],
        padding: 0,
        yPan: true,
        yPanEnabled: false,
        yScale: scaleLinear(),
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

    public readonly listener = (type, moreProps, state, e) => {
        const { id, onContextMenu } = this.props;

        if (type === "contextmenu") {
            const { currentCharts } = moreProps;
            if (currentCharts.indexOf(id) > -1) {
                if (onContextMenu !== undefined) {
                    onContextMenu(moreProps, e);
                }
            }
        }
    };

    public readonly yScale = () => {
        const chartConfig = find(this.context.chartConfig, each => each.id === this.props.id);
        return chartConfig.yScale.copy();
    };

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
