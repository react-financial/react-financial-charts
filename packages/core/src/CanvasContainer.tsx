import * as React from "react";

interface CanvasContainerProps {
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
    readonly zIndex?: number;
}

export class CanvasContainer extends React.Component<CanvasContainerProps> {
    private drawCanvas: { [key: string]: CanvasRenderingContext2D } = {};

    public getCanvasContexts() {
        return this.drawCanvas;
    }

    public render() {
        const { height, width, zIndex, ratio } = this.props;

        const adjustedWidth = width * ratio;
        const adjustedHeight = height * ratio;
        const style: React.CSSProperties = { position: "absolute", width, height };

        return (
            <div style={{ position: "absolute", zIndex }}>
                <canvas id="bg" ref={this.setDrawCanvas} width={adjustedWidth} height={adjustedHeight} style={style} />
                <canvas
                    id="axes"
                    ref={this.setDrawCanvas}
                    width={adjustedWidth}
                    height={adjustedHeight}
                    style={style}
                />
                <canvas
                    id="mouseCoord"
                    ref={this.setDrawCanvas}
                    width={adjustedWidth}
                    height={adjustedHeight}
                    style={style}
                />
            </div>
        );
    }

    private readonly setDrawCanvas = (node: HTMLCanvasElement | null) => {
        const context = node?.getContext("2d");
        if (context !== null && context !== undefined) {
            this.drawCanvas[node!.id] = context;
        }
    };
}
