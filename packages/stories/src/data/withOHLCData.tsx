import { tsvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";
import * as React from "react";
import { IOHLCData } from "./iOHLCData";

const parseDate = timeParse("%Y-%m-%d");

const parseData = () => {
    return (d: any) => {
        let date = parseDate(d.date);
        if (date === null) {
            date = new Date(Number(d.date));
        }

        d.date = new Date(date);
        d.open = +d.open;
        d.high = +d.high;
        d.low = +d.low;
        d.close = +d.close;
        d.volume = +d.volume;

        return d as IOHLCData;
    };
};

interface WithOHLCDataProps {
    readonly data: IOHLCData[];
}

interface WithOHLCState {
    data?: IOHLCData[];
    message: string;
}

export function withOHLCData(dataSet = "MSFT") {
    return <TProps extends WithOHLCDataProps>(OriginalComponent: React.ComponentClass<TProps>) => {
        return class WithOHLCData extends React.Component<Omit<TProps, "data">, WithOHLCState> {
            public constructor(props: Omit<TProps, "data">) {
                super(props);

                this.state = {
                    message: "Loading data...",
                };
            }

            public componentDidMount() {
                fetch(
                    `https://raw.githubusercontent.com/reactivemarkets/react-financial-charts/master/packages/stories/src/data/${dataSet}.tsv`,
                )
                    .then((response) => response.text())
                    .then((data) => tsvParse(data, parseData()))
                    .then((data) => {
                        this.setState({
                            data,
                        });
                    })
                    .catch(() => {
                        this.setState({
                            message: `Failed to fetch data.`,
                        });
                    });
            }

            public render() {
                const { data, message } = this.state;
                if (data === undefined) {
                    return <div className="center">{message}</div>;
                }

                return <OriginalComponent {...(this.props as TProps)} data={data} />;
            }
        };
    };
}
