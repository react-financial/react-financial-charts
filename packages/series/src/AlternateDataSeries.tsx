import * as PropTypes from "prop-types";
import * as React from "react";

export interface AlternateDataSeriesProps<TData> {
    readonly data: TData[];
}

export class AlternateDataSeries<TData> extends React.Component<AlternateDataSeriesProps<TData>> {
    public static contextTypes = {
        plotData: PropTypes.array,
        xAccessor: PropTypes.func.isRequired,
    };

    public static childContextTypes = {
        plotData: PropTypes.array,
    };

    public getChildContext() {
        const { data } = this.props;
        const { plotData, xAccessor } = this.context;

        const startDate = xAccessor(plotData[0]);
        const endDate = xAccessor(plotData[plotData.length - 1]);

        return {
            plotData: data.filter((d) => {
                const date = xAccessor(d);
                return date > startDate && date < endDate;
            }),
        };
    }

    public render() {
        return this.props.children;
    }
}
