import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { noop } from "../utils";

let i = 0;
const overlayColors = scaleOrdinal<number, string>(schemeCategory10);

export interface BaseIndicator {
    (): () => void;
    id(): number;
    id(x: number): BaseIndicator;
    accessor(): any;
    accessor(x: any): BaseIndicator;
    stroke(): string | any;
    stroke(x: string | any): BaseIndicator;
    fill(): string | any;
    fill(x: string | any): BaseIndicator;
    echo(): any;
    echo(x: any): BaseIndicator;
    type(): string;
    type(x: string): BaseIndicator;
}

export default function () {

    let id = i++;
    let accessor: any;
    let stroke: string | any;
    let fill: string | any;
    let echo: any;
    let type: string;

    const baseIndicator = () => noop;

    baseIndicator.id = (newId?: number) => {
        if (newId === undefined) {
            return id;
        }

        id = newId;

        return baseIndicator;
    };

    baseIndicator.accessor = (newAccessor?: any) => {
        if (newAccessor === undefined) {
            return accessor;
        }

        accessor = newAccessor;

        return baseIndicator;
    };

    baseIndicator.stroke = (newStroke?: string | any) => {
        if (newStroke === undefined) {
            return !stroke ? stroke = overlayColors(id) : stroke;
        }

        stroke = newStroke;

        return baseIndicator;
    };

    baseIndicator.fill = (newFill?: string | any) => {
        if (newFill === undefined) {
            return !fill ? fill = overlayColors(id) : fill;
        }

        fill = newFill;

        return baseIndicator;
    };

    baseIndicator.echo = (newEcho?: any) => {
        if (newEcho === undefined) {
            return echo;
        }

        echo = newEcho;

        return baseIndicator;
    };

    baseIndicator.type = (newType?: string) => {
        if (newType === undefined) {
            return type;
        }

        type = newType;

        return baseIndicator;
    };

    return baseIndicator as BaseIndicator;
}
