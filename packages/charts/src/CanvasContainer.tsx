import * as React from "react";

import { isDefined } from "./utils";

interface CanvasContainerProps {
    readonly height: number;
    readonly ratio: number;
    readonly type: string;
    readonly width: number;
    readonly zIndex?: number;
}

export class CanvasContainer extends React.Component<CanvasContainerProps> {

    private drawCanvas: any = {};

    public getCanvasContexts() {
        if (isDefined(this.drawCanvas.axes)) {
            return this.drawCanvas;
        }
    }

    public render() {
        const { height, width, type, zIndex, ratio } = this.props;
        if (type === "svg") {
            return null;
        }

        return (
            <div style={{ position: "absolute", zIndex }}>
                <canvas
                    id="bg"
                    ref={this.setDrawCanvas}
                    width={width * ratio}
                    height={height * ratio}
                    style={{ position: "absolute", width, height }} />
                <canvas
                    id="axes"
                    ref={this.setDrawCanvas}
                    width={width * ratio}
                    height={height * ratio}
                    style={{ position: "absolute", width, height }} />
                <canvas
                    id="mouseCoord"
                    ref={this.setDrawCanvas}
                    width={width * ratio}
                    height={height * ratio}
                    style={{ position: "absolute", width, height }} />
            </div>
        );
    }

    private readonly setDrawCanvas = (node: HTMLCanvasElement) => {
        if (isDefined(node)) {
            this.drawCanvas[node.id] = node.getContext("2d");
        } else {
            this.drawCanvas = {};
        }
    }
}
