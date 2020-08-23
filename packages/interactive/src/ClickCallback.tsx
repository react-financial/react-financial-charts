import * as React from "react";
import { getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";

interface ClickCallbackProps {
    readonly disablePan: boolean;
    readonly onMouseDown?: (e: React.MouseEvent<Element, MouseEvent>, moreProps: any) => void;
    readonly onClick?: (e: React.MouseEvent<Element, MouseEvent>, moreProps: any) => void;
    readonly onDoubleClick?: (e: React.MouseEvent<Element, MouseEvent>, moreProps: any) => void;
    readonly onContextMenu?: (e: React.MouseEvent<Element, MouseEvent>, moreProps: any) => void;
    readonly onMouseMove?: (e: React.MouseEvent<Element, MouseEvent>, moreProps: any) => void;
    readonly onPan?: (e: React.MouseEvent<Element, MouseEvent>, moreProps: any) => void;
    readonly onPanEnd?: (e: React.MouseEvent<Element, MouseEvent>, moreProps: any) => void;
}

export class ClickCallback extends React.Component<ClickCallbackProps> {
    public static defaultProps = {
        disablePan: false,
    };

    public render() {
        const { onMouseDown, onClick, onDoubleClick, onContextMenu, onMouseMove, onPan, onPanEnd } = this.props;

        return (
            <GenericChartComponent
                onMouseDown={onMouseDown}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                onContextMenu={onContextMenu}
                onMouseMove={onMouseMove}
                onPan={onPan}
                onPanEnd={onPanEnd}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan"]}
            />
        );
    }
}
