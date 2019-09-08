import { bisector } from "d3-array";
import identity from "./identity";
import noop from "./noop";

export { default as rebind } from "./rebind";
export { default as zipper } from "./zipper";
export { default as merge } from "./merge";
export { default as slidingWindow } from "./slidingWindow";
export { default as identity } from "./identity";
export { default as noop } from "./noop";
export { default as shallowEqual } from "./shallowEqual";
export { default as mappedSlidingWindow } from "./mappedSlidingWindow";
export { default as accumulatingWindow } from "./accumulatingWindow";

export * from "./barWidth";
export * from "./colors";
export * from "./strokeDasharray";
export * from "./withDeviceRatio";

export function getLogger(prefix) {
    let logger = noop;
    if (process.env.NODE_ENV !== "production") {
        logger = require("debug")("react-financial-charts:" + prefix);
    }
    return logger;
}

export function sign(x) {
    // @ts-ignore
    return (x > 0) - (x < 0);
}

export const yes = () => true;

export function path(loc = []) {
    const key = Array.isArray(loc) ? loc : [loc];
    const length = key.length;

    return function (obj, defaultValue?) {
        if (length === 0) { return isDefined(obj) ? obj : defaultValue; }

        let index = 0;
        while (obj != null && index < length) {
            obj = obj[key[index++]];
        }
        return (index === length) ? obj : defaultValue;
    };
}

export function functor(v) {
    return typeof v === "function" ? v : () => v;
}

export function createVerticalLinearGradient(stops) {
    return function (moreProps, ctx) {
        const { chartConfig: { height } } = moreProps;

        const grd = ctx.createLinearGradient(0, height, 0, 0);
        stops.forEach((each) => {
            grd.addColorStop(each.stop, each.color);
        });

        return grd;
    };
}

export function getClosestItemIndexes2(array, value, accessor) {
    let left = bisector(accessor).left(array, value);
    left = Math.max(left - 1, 0);
    let right = Math.min(left + 1, array.length - 1);

    const item = accessor(array[left]);
    if (item >= value && item <= value) { right = left; }

    return { left, right };
}

export function getClosestValue(inputValue, currentValue) {
    const values = isArray(inputValue) ? inputValue : [inputValue];

    const diff = values
        .map((each) => each - currentValue)
        .reduce((diff1, diff2) => Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2);
    return currentValue + diff;
}

// @ts-ignore
export function find(list, predicate, context = this) {
    for (let i = 0; i < list.length; ++i) {
        if (predicate.call(context, list[i], i, list)) {
            return list[i];
        }
    }
    return undefined;
}

export function d3Window(node) {
    const d3win = node
        && (node.ownerDocument && node.ownerDocument.defaultView
            || node.document && node
            || node.defaultView);
    return d3win;
}

export const MOUSEENTER = "mouseenter.interaction";
export const MOUSELEAVE = "mouseleave.interaction";
export const MOUSEMOVE = "mousemove.pan";
export const MOUSEUP = "mouseup.pan";
export const TOUCHMOVE = "touchmove.pan";
export const TOUCHEND = "touchend.pan touchcancel.pan";

export function getTouchProps(touch) {
    if (!touch) { return {}; }
    return {
        pageX: touch.pageX,
        pageY: touch.pageY,
        clientX: touch.clientX,
        clientY: touch.clientY,
    };
}

export function getClosestItemIndexes(array, value, accessor) {
    let lo = 0;
    let hi = array.length - 1;
    while (hi - lo > 1) {
        const mid = Math.round((lo + hi) / 2);
        if (accessor(array[mid]) <= value) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    // for Date object === does not work, so using the <= in combination with >=
    // the same code works for both dates and numbers
    if (accessor(array[lo]).valueOf() === value.valueOf()) { hi = lo; }
    if (accessor(array[hi]).valueOf() === value.valueOf()) { lo = hi; }

    if (accessor(array[lo]) < value && accessor(array[hi]) < value) { lo = hi; }
    if (accessor(array[lo]) > value && accessor(array[hi]) > value) { hi = lo; }

    return { left: lo, right: hi };
}

export function getClosestItem(array, value, accessor) {
    const { left, right } = getClosestItemIndexes(array, value, accessor);

    if (left === right) {
        return array[left];
    }

    const closest = (Math.abs(accessor(array[left]) - value) < Math.abs(accessor(array[right]) - value))
        ? array[left]
        : array[right];

    return closest;
}

export function head(array, accessor?) {
    if (accessor && array) {
        let value;
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

export function tail(array, accessor) {
    if (accessor && array) {
        return array.map(accessor).slice(1);
    }
    return array ? array.slice(1) : undefined;
}

export const first = head;

export function last(array, accessor?) {
    if (accessor && array) {
        let value;
        for (let i = array.length - 1; i >= 0; i--) {
            value = array[i];
            if (isDefined(accessor(value))) { return value; }
        }
        return undefined;
    }
    const length = array ? array.length : 0;
    return length ? array[length - 1] : undefined;
}

export const isDefined = <T>(d: T) => {
    return d !== null && d !== undefined;
};

export function isNotDefined(d) {
    return !isDefined(d);
}

export function isObject(d) {
    return isDefined(d) && typeof d === "object" && !Array.isArray(d);
}

export const isArray = Array.isArray;

export function touchPosition(touch, e) {
    const container = e.target;
    const rect = container.getBoundingClientRect();
    const x = touch.clientX - rect.left - container.clientLeft;
    const y = touch.clientY - rect.top - container.clientTop;
    const xy = [Math.round(x), Math.round(y)];
    return xy;
}

export function mousePosition(e: React.MouseEvent, defaultRect?) {
    const container = e.currentTarget;
    const rect = defaultRect || container.getBoundingClientRect();
    const x = e.clientX - rect.left - container.clientLeft;
    const y = e.clientY - rect.top - container.clientTop;
    const xy = [Math.round(x), Math.round(y)];
    return xy;
}

export function clearCanvas(canvasList, ratio) {
    canvasList.forEach((each) => {
        each.setTransform(1, 0, 0, 1, 0, 0);
        each.clearRect(-1, -1, each.canvas.width + 2, each.canvas.height + 2);
        each.scale(ratio, ratio);
    });
}

export function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

export function toObject(array, iteratee = identity) {
    return array.reduce((returnObj, a) => {
        const [key, value] = iteratee(a);
        return {
            ...returnObj,
            [key]: value,
        };
    }, {});
}

// copied from https://github.com/lodash/lodash/blob/master/mapValue.js
export function mapValue(object, iteratee) {
    object = Object(object);
    const result = {};

    Object.keys(object).forEach((key) => {
        const mappedValue = iteratee(object[key], key, object);

        if (isDefined(mappedValue)) {
            result[key] = mappedValue;
        }
    });
    return result;
}

// copied from https://github.com/lodash/lodash/blob/master/mapObject.js
export function mapObject(object = {}, iteratee = identity) {
    const props = Object.keys(object);
    const result = new Array(props.length);

    props.forEach((key, index) => {
        // @ts-ignore
        result[index] = iteratee(object[key], key, object);
    });
    return result;
}

export function replaceAtIndex(array, index, value) {
    if (isDefined(array) && array.length > index) {
        return array.slice(0, index)
            .concat(value)
            .concat(array.slice(index + 1));
    }
    return array;
}

// copied from https://github.com/lodash/lodash/blob/master/forOwn.js
export function forOwn(obj, iteratee) {
    const object = Object(obj);
    Object.keys(object)
        .forEach((key) => iteratee(object[key], key, object));
}
