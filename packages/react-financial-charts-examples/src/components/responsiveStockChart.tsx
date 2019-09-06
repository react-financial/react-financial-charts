import { tsvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";
import * as React from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { IOHLCData } from "../stores";
import StockChart from "./stockChart";

const parseDate = timeParse("%Y-%m-%d");

function parseData(parse) {
    return function (d) {
        d.date = parse(d.date);
        d.open = +d.open;
        d.high = +d.high;
        d.low = +d.low;
        d.close = +d.close;
        d.volume = +d.volume;

        return d;
    };
}

interface ResponsiveStockChartState {
    data?: IOHLCData[];
}

export class ResponsiveStockChart extends React.Component<{}, ResponsiveStockChartState> {

    public componentDidMount() {
        fetch("https://cdn.rawgit.com/rrag/react-stockcharts/master/docs/data/MSFT.tsv")
            .then((response) => response.text())
            .then((data) => tsvParse(data, parseData(parseDate)))
            .then((data) => {
                this.setState({
                    data,
                });
            })
            .catch((error) => {
                // tslint:disable-next-line: no-console
                console.error(error);
            });
    }

    public render() {

        if (this.state == null) {
            return <div>Loading...</div>;
        }

        return (
            <div style={{ flex: "1 1 auto" }}>
                <AutoSizer>
                    {({ height, width }) => {
                        return (
                            <StockChart
                                data={this.state.data}
                                height={height}
                                width={width} />
                        );
                    }}
                </AutoSizer>
            </div>
        );
    }
}
