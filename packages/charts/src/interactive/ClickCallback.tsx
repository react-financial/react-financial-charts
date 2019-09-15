import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";
import { getMouseCanvas } from "../GenericComponent";
import { noop } from "../utils";

interface ClickCallbackProps {
    readonly disablePan: boolean;
    readonly onMouseDown?: any; // func
    readonly onClick?: any; // func
    readonly onDoubleClick?: any; // func
    readonly onContextMenu?: any; // func
    readonly onMouseMove?: any; // func
    readonly onPan?: any; // func
    readonly onPanEnd?: any; // func
}

export class ClickCallback extends React.Component<ClickCallbackProps> {

    public static defaultProps = {
        disablePan: false,
    };

    public render() {
        const {
            onMouseDown,
            onClick,
            onDoubleClick,
            onContextMenu,
            onMouseMove,
            onPan,
            onPanEnd,
        } = this.props;

        return (
            <GenericChartComponent
                onMouseDown={onMouseDown}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                onContextMenu={onContextMenu}
                onMouseMove={onMouseMove}
                onPan={onPan}
                onPanEnd={onPanEnd}
                svgDraw={noop}
                canvasDraw={noop}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan"]}
            />
        );
    }
}
