import React from "react";
export { default as zipper } from "./zipper";
export { default as slidingWindow } from "./slidingWindow";
export * from "./closestItem";
export * from "./identity";
export * from "./noop";
export * from "./shallowEqual";
export { default as accumulatingWindow } from "./accumulatingWindow";
export * from "./barWidth";
export * from "./strokeDasharray";
export * from "./PureComponent";

export const sign = (x: any) => {
    // @ts-ignore
    return (x > 0) - (x < 0);
};

export const path = (loc = []) => {
    const key = Array.isArray(loc) ? loc : [loc];
    const length = key.length;

    return function (obj: any, defaultValue?: any) {
        if (length === 0) {
            return isDefined(obj) ? obj : defaultValue;
        }

        let index = 0;
        while (obj != null && index < length) {
            obj = obj[key[index++]];
        }
        return index === length ? obj : defaultValue;
    };
};

export const functor = (v: any) => {
    return typeof v === "function" ? v : () => v;
};

export function getClosestValue(inputValue: any, currentValue: any) {
    const values = Array.isArray(inputValue) ? inputValue : [inputValue];

    const diff = values
        .map((each) => each - currentValue)
        .reduce((diff1, diff2) => (Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2));
    return currentValue + diff;
}

export function d3Window(node: any) {
    const d3win =
        node && ((node.ownerDocument && node.ownerDocument.defaultView) || (node.document && node) || node.defaultView);
    return d3win;
}

export const MOUSEENTER = "mouseenter.interaction";
export const MOUSELEAVE = "mouseleave.interaction";
export const MOUSEMOVE = "mousemove.pan";
export const MOUSEUP = "mouseup.pan";
export const TOUCHMOVE = "touchmove.pan";
export const TOUCHEND = "touchend.pan touchcancel.pan";

export function getTouchProps(touch: any) {
    return {
        pageX: touch.pageX,
        pageY: touch.pageY,
        clientX: touch.clientX,
        clientY: touch.clientY,
    };
}

export function head(array: any[], accessor?: any) {
    if (accessor && array) {
        let value: any;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < array.length; i++) {
            value = array[i];
            if (isDefined(accessor(value))) {
                return value;
            }
        }

        return undefined;
    }

    return array ? array[0] : undefined;
}

export const first = head;

export function last(array: any[], accessor?: any) {
    if (accessor && array) {
        let value;
        for (let i = array.length - 1; i >= 0; i--) {
            value = array[i];
            if (isDefined(accessor(value))) {
                return value;
            }
        }
        return undefined;
    }
    const length = array ? array.length : 0;
    return length ? array[length - 1] : undefined;
}

export const isDefined = <T>(d: T): d is NonNullable<T> => {
    return d !== null && d !== undefined;
};

export function isNotDefined<T>(d: T) {
    return !isDefined(d);
}

export function isObject(d: any) {
    return isDefined(d) && typeof d === "object" && !Array.isArray(d);
}

export function touchPosition(touch: { clientX: number; clientY: number }, e: React.TouchEvent): [number, number] {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = touch.clientX - rect.left - container.clientLeft;
    const y = touch.clientY - rect.top - container.clientTop;
    return [Math.round(x), Math.round(y)];
}

export function mousePosition(
    e: React.MouseEvent,
    defaultRect?: { height: number; width: number; left: number; top: number },
): [number, number] {
    const container = e.currentTarget;
    const rect = defaultRect ?? container.getBoundingClientRect();
    const x = e.clientX - rect.left - container.clientLeft;
    const y = e.clientY - rect.top - container.clientTop;
    return [Math.round(x), Math.round(y)];
}

export function clearCanvas(canvasList: CanvasRenderingContext2D[], ratio: number) {
    canvasList.forEach((each) => {
        each.setTransform(1, 0, 0, 1, 0, 0);
        each.clearRect(-1, -1, each.canvas.width + 2, each.canvas.height + 2);
        each.scale(ratio, ratio);
    });
}

// copied from https://github.com/lodash/lodash/blob/master/mapObject.js
export function mapObject(object = {}, iteratee = (x: any) => x) {
    const props = Object.keys(object);
    const result = new Array(props.length);

    props.forEach((key, index) => {
        // @ts-ignore
        result[index] = iteratee(object[key], key, object);
    });
    return result;
}
