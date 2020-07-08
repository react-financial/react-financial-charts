import * as React from "react";

interface CanvasContainerProps {
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
    readonly zIndex?: number;
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
        const { height, width, zIndex, ratio } = this.props;

        const adjustedWidth = width * ratio;
        const adjustedHeight = height * ratio;
        const style: React.CSSProperties = { position: "absolute", width, height };

        return (
            <div style={{ position: "absolute", zIndex }}>
                <canvas ref={this.bgRef} width={adjustedWidth} height={adjustedHeight} style={style} />
                <canvas ref={this.axesRef} width={adjustedWidth} height={adjustedHeight} style={style} />
                <canvas ref={this.mouseRef} width={adjustedWidth} height={adjustedHeight} style={style} />
            </div>
        );
    }
}
