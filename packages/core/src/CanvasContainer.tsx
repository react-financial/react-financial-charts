import * as React from "react";

interface CanvasContainerProps {
    readonly height: number;
    readonly ratio: number;
    readonly style?: React.CSSProperties;
    readonly width: number;
}

export class CanvasContainer extends React.PureComponent<CanvasContainerProps> {
    private readonly bgRef = React.createRef<HTMLCanvasElement>();
    private readonly axesRef = React.createRef<HTMLCanvasElement>();
    private readonly mouseRef = React.createRef<HTMLCanvasElement>();

    public getCanvasContexts() {
        return {
            bg: this.bgRef.current?.getContext("2d"),
            axes: this.axesRef.current?.getContext("2d"),
            mouseCoord: this.mouseRef.current?.getContext("2d"),
        };
    }

    public render() {
        const { height, ratio, style, width } = this.props;

        const adjustedWidth = width * ratio;
        const adjustedHeight = height * ratio;
        const canvasStyle: React.CSSProperties = { position: "absolute", width, height };

        return (
            <div style={{ ...style, position: "absolute" }}>
                <canvas ref={this.bgRef} width={adjustedWidth} height={adjustedHeight} style={canvasStyle} />
                <canvas ref={this.axesRef} width={adjustedWidth} height={adjustedHeight} style={canvasStyle} />
                <canvas ref={this.mouseRef} width={adjustedWidth} height={adjustedHeight} style={canvasStyle} />
            </div>
        );
    }
}
