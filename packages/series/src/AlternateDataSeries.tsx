import * as PropTypes from "prop-types";
import * as React from "react";

export interface AlternateDataSeriesProps<TData> {
    readonly data: TData[];
}

export class AlternateDataSeries<TData> extends React.Component<AlternateDataSeriesProps<TData>> {
    public static childContextTypes = {
        plotData: PropTypes.array,
    };

    public getChildContext() {
        const { data } = this.props;
        return {
            plotData: data,
        };
    }

    public render() {
        return this.props.children;
    }
}
