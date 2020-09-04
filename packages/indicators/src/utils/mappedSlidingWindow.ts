import { functor } from "./functor";
import { identity } from "./identity";

interface MappedSlidingWindow {
    (data: any[]): any;
    accumulator(): any;
    accumulator(x: any): MappedSlidingWindow;
    skipInitial(): number;
    skipInitial(x: number): MappedSlidingWindow;
    source(): any;
    source(x: any): MappedSlidingWindow;
    undefinedValue(): any;
    undefinedValue(x: any): MappedSlidingWindow;
    windowSize(): number;
    windowSize(x: number): MappedSlidingWindow;
}

export default function () {
    let undefinedValue: any;
    let windowSize = 10;
    let accumulator = () => {
        /** Do Nothing */
    };
    let source = identity;
    let skipInitial = 0;

    const mappedSlidingWindow = function (data: any[]) {
        // @ts-ignore
        const size = functor(windowSize).apply(this, arguments);
        const windowData: any[] = [];
        let accumulatorIdx = 0;
        const undef = functor(undefinedValue);
        const result: any[] = [];
        data.forEach(function (d, i) {
            let mapped;
            if (i < skipInitial + size - 1) {
                mapped = undef(d, i);
                result.push(mapped);
                windowData.push(mapped);
                return;
            }
            if (i >= skipInitial + size) {
                windowData.shift();
            }
            // @ts-ignore
            windowData.push(source(d, i));

            // @ts-ignore
            mapped = accumulator(windowData, i, accumulatorIdx++);
            result.push(mapped);
            windowData.pop();
            windowData.push(mapped);
            return;
        });
        return result;
    };

    mappedSlidingWindow.undefinedValue = function (x: any) {
        if (!arguments.length) {
            return undefinedValue;
        }
        undefinedValue = x;
        return mappedSlidingWindow;
    };
    mappedSlidingWindow.windowSize = function (x: number) {
        if (!arguments.length) {
            return windowSize;
        }
        windowSize = x;
        return mappedSlidingWindow;
    };
    mappedSlidingWindow.accumulator = function (x: any) {
        if (!arguments.length) {
            return accumulator;
        }
        accumulator = x;
        return mappedSlidingWindow;
    };
    mappedSlidingWindow.skipInitial = function (x: number) {
        if (!arguments.length) {
            return skipInitial;
        }
        skipInitial = x;
        return mappedSlidingWindow;
    };
    mappedSlidingWindow.source = function (x: any) {
        if (!arguments.length) {
            return source;
        }
        source = x;
        return mappedSlidingWindow;
    };

    return mappedSlidingWindow as MappedSlidingWindow;
}
