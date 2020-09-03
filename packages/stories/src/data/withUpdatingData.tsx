import * as React from "react";
import { IOHLCData } from "./iOHLCData";

interface WithOHLCDataProps {
    readonly data: IOHLCData[];
}

interface WithOHLCState {
    data: IOHLCData[];
    length: number;
}

export function withUpdatingData(initialLength = 120, interval = 1_000) {
    return <TProps extends WithOHLCDataProps>(OriginalComponent: React.ComponentClass<TProps>) => {
        return class WithOHLCData extends React.Component<TProps, WithOHLCState> {
            public interval?: number;

            public constructor(props: TProps) {
                super(props);

                this.state = {
                    data: props.data.slice(0, initialLength),
                    length: initialLength,
                };
            }

            public componentDidMount() {
                this.interval = window.setInterval(() => {
                    const { data } = this.props;
                    const { length } = this.state;

                    if (length < data.length) {
                        this.setState({
                            data: data.slice(0, length + 1),
                            length: length + 1,
                        });
                    } else {
                        window.clearInterval(this.interval);
                    }
                }, interval);
            }

            public componentWillUnmount() {
                window.clearInterval(this.interval);
            }

            public render() {
                const { data } = this.state;

                return <OriginalComponent {...(this.props as TProps)} data={data} />;
            }
        };
    };
}
