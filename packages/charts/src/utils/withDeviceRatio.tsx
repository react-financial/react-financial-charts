import * as React from "react";

export interface WithRatioProps {
    readonly ratio: number;
}

export interface WithRatioState {
    ratio: number;
}

export function withDeviceRatio() {
    return <TProps extends WithRatioProps>(OriginalComponent: React.ComponentClass<TProps>) => {
        return class WithRatio extends React.Component<Omit<TProps, "ratio">, WithRatioState> {
            public canvasRef = React.createRef<HTMLCanvasElement>();

            public componentDidMount() {
                const { current } = this.canvasRef;
                if (current === null) {
                    this.setState({
                        ratio: 1,
                    });
                } else {
                    const context: any = current.getContext("2d");

                    const { devicePixelRatio } = window;

                    const backingStoreRatio = context.webkitBackingStorePixelRatio ||
                        context.mozBackingStorePixelRatio ||
                        context.msBackingStorePixelRatio ||
                        context.oBackingStorePixelRatio ||
                        context.backingStorePixelRatio || 1;

                    this.setState({
                        ratio: devicePixelRatio / backingStoreRatio,
                    });
                }
            }

            public render() {

                const state = this.state;
                if (state !== null) {
                    return (
                        <OriginalComponent
                            {...this.props as TProps}
                            ratio={state.ratio} />
                    );
                }

                return (
                    <canvas ref={this.canvasRef} />
                );
            }
        };
    };
}
