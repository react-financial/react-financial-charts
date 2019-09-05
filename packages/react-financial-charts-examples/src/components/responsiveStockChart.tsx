import * as React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import StockChart from "./stockChart";

export class ResponsiveStockChart extends React.Component {
    public render() {

        const data = [
            {
                close: 1.10294,
                high: 1.10301,
                low: 1.10286,
                open: 1.10291,
                time: new Date(1567715580000),
            },
            {
                close: 1.10292,
                high: 1.10297,
                low: 1.10287,
                open: 1.10294,
                time: new Date(1567715640000),
            },
            {
                close: 1.10291,
                high: 1.10299,
                low: 1.10285,
                open: 1.10293,
                time: new Date(1567715700000),
            },
            {
                close: 1.10292,
                high: 1.10296,
                low: 1.10282,
                open: 1.10291,
                time: new Date(1567715760000),
            },
            {
                close: 1.10293,
                high: 1.10298,
                low: 1.10288,
                open: 1.10288,
                time: new Date(1567715820000),
            },
            {
                close: 1.10289,
                high: 1.10294,
                low: 1.10286,
                open: 1.10288,
                time: new Date(1567715880000),
            },
            {
                close: 1.10293,
                high: 1.10295,
                low: 1.10283,
                open: 1.10288,
                time: new Date(1567715940000),
            },
            {
                close: 1.10288,
                high: 1.10299,
                low: 1.10287,
                open: 1.10293,
                time: new Date(1567716000000),
            },
            {
                close: 1.10292,
                high: 1.10302,
                low: 1.10286,
                open: 1.1029,
                time: new Date(1567716060000),
            },
            {
                close: 1.10295,
                high: 1.10295,
                low: 1.10282,
                open: 1.10293,
                time: new Date(1567716120000),
            },
            {
                close: 1.10286,
                high: 1.10298,
                low: 1.10283,
                open: 1.10297,
                time: new Date(1567716180000),
            },
            {
                close: 1.10294,
                high: 1.10296,
                low: 1.10286,
                open: 1.10289,
                time: new Date(1567716240000),
            },
            {
                close: 1.10289,
                high: 1.10296,
                low: 1.10284,
                open: 1.10294,
                time: new Date(1567716300000),
            },
            {
                close: 1.10285,
                high: 1.10302,
                low: 1.10285,
                open: 1.10289,
                time: new Date(1567716360000),
            },
            {
                close: 1.10281,
                high: 1.10285,
                low: 1.10281,
                open: 1.10284,
                time: new Date(1567716420000),
            },
        ];

        return (
            <div style={{ flex: "1 1 auto" }}>
                <AutoSizer>
                    {({ height, width }) => {
                        return (
                            <StockChart
                                data={data}
                                height={height}
                                width={width} />
                        );
                    }}
                </AutoSizer>
            </div>
        );
    }
}
