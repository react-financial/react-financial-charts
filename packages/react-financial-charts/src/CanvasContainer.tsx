import * as React from "react";

import { isDefined } from "./utils";

interface CanvasContainerProps {
    readonly width: number;
    readonly height: number;
    readonly type: string;
    readonly zIndex?: number;
    readonly ratio: number;
}

class CanvasContainer extends React.Component<CanvasContainerProps> {

    private drawCanvas: any;

    public constructor(props: CanvasContainerProps) {
        super(props);
        this.setDrawCanvas = this.setDrawCanvas.bind(this);
        this.drawCanvas = {};
    }

    public setDrawCanvas(node) {
        if (isDefined(node)) {
            this.drawCanvas[node.id] = node.getContext("2d");
        } else {
            this.drawCanvas = {};
        }
    }

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
}

export default CanvasContainer;
