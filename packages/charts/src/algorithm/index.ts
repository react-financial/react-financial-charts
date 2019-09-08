// tslint:disable: only-arrow-functions space-before-function-paren

import { identity, merge, slidingWindow } from "../utils";

export default function () {

    let windowSize = 1;
    let accumulator = identity;
    let mergeAs = identity;

    function algorithm(data: any) {

        const defaultAlgorithm = slidingWindow()
            .windowSize(windowSize)
            // @ts-ignore
            .accumulator(accumulator);

        const calculator = merge()
            .algorithm(defaultAlgorithm)
            // @ts-ignore
            .merge(mergeAs);

        const newData = calculator(data);

        return newData;
    }

    algorithm.accumulator = function (x: any) {
        if (!arguments.length) {
            return accumulator;
        }
        accumulator = x;
        return algorithm;
    };

    algorithm.windowSize = function (x: any) {
        if (!arguments.length) {
            return windowSize;
        }
        windowSize = x;
        return algorithm;
    };

    algorithm.merge = function (x: any) {
        if (!arguments.length) {
            return mergeAs;
        }
        mergeAs = x;
        return algorithm;
    };

    return algorithm;
}
