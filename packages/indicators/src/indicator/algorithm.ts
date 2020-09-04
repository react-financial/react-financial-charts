import { identity, merge, slidingWindow } from "../utils";

export interface Algorithm {
    (data: any[]): any;
    accumulator(): any;
    accumulator(newAccumulator: any): Algorithm;
    windowSize(): number;
    windowSize(windowSize: number): Algorithm;
    merge(): any;
    merge(newMerge: any): Algorithm;
}

export default function () {
    let windowSize = 1;
    let accumulator = identity;
    let mergeAs = identity;

    function algorithm(data: any[]) {
        const defaultAlgorithm = slidingWindow().windowSize(windowSize).accumulator(accumulator);

        const calculator = merge().algorithm(defaultAlgorithm).merge(mergeAs);

        const newData = calculator(data);

        return newData;
    }

    algorithm.accumulator = (newAccumulator?: any) => {
        if (newAccumulator === undefined) {
            return accumulator;
        }
        accumulator = newAccumulator;
        return algorithm;
    };

    algorithm.windowSize = (newWindowSize?: number) => {
        if (newWindowSize === undefined) {
            return windowSize;
        }
        windowSize = newWindowSize;
        return algorithm;
    };

    algorithm.merge = (newMerge?: any) => {
        if (newMerge === undefined) {
            return mergeAs;
        }
        mergeAs = newMerge;
        return algorithm;
    };

    return algorithm as Algorithm;
}
