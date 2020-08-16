import { scaleLinear, ScaleContinuousNumeric } from "d3-scale";
import * as PropTypes from "prop-types";
import * as React from "react";

import { PureComponent } from "./utils";

export interface ChartProps {
    readonly flipYScale?: boolean;
    readonly height?: number;
    readonly id: number | string;
    readonly onContextMenu?: (event: React.MouseEvent, props: any) => void;
    readonly onDoubleClick?: (event: React.MouseEvent, props: any) => void;
    readonly origin?: number[] | ((width: number, height: number) => number[]);
    readonly padding?: number | { top: number; bottom: number };
    readonly yExtents?: number[] | ((data: any) => number) | ((data: any) => number[]);
    readonly yExtentsCalculator?: any; // func
    readonly yPan?: boolean;
    readonly yPanEnabled?: boolean;
    readonly yScale?: ScaleContinuousNumeric<number, number>;
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

    public getChildContext() {
        const { id: chartId } = this.props;

        const chartConfig = this.context.chartConfig.find((each) => each.id === chartId);

        return {
            chartId,
            chartConfig,
        };
    }

    public render() {
        const { origin } = this.context.chartConfig.find((each) => each.id === this.props.id);

        const [x, y] = origin;

        return <g transform={`translate(${x}, ${y})`}>{this.props.children}</g>;
    }

    private readonly listener = (type: string, moreProps, state, e) => {
        const { id, onContextMenu, onDoubleClick } = this.props;

        switch (type) {
            case "contextmenu": {
                if (onContextMenu !== undefined) {
                    const { currentCharts } = moreProps;
                    if (currentCharts.indexOf(id) > -1) {
                        onContextMenu(e, moreProps);
                    }
                }
                break;
            }
            case "dblclick": {
                if (onDoubleClick !== undefined) {
                    const { currentCharts } = moreProps;
                    if (currentCharts.indexOf(id) > -1) {
                        onDoubleClick(e, moreProps);
                    }
                }
                break;
            }
        }
    };
}
