import { identity, merge, slidingWindow } from "../utils";

export interface Algorithm {
    (data: any[]): any;
    accumulator(): any;
    accumulator(accumulator: any): Algorithm;
    merge(): any;
    merge(merge: any): Algorithm;
    windowSize(): number;
    windowSize(windowSize: number): Algorithm;
}

export default function () {

    let windowSize = 1;
    let accumulator = identity;
    let mergeAs = identity;

    const algorithm = (data: any[]) => {

        const defaultAlgorithm = slidingWindow()
            .windowSize(windowSize)
            .accumulator(accumulator);

        const calculator = merge()
            .algorithm(defaultAlgorithm)
            .merge(mergeAs);

        const newData = calculator(data);

        return newData;
    };

    algorithm.accumulator = (newAccumulator?: any) => {
        if (newAccumulator === undefined) {
            return accumulator;
        }

        accumulator = newAccumulator;

        return algorithm;
    };

    algorithm.merge = (newMerge?: any) => {
        if (merge === undefined) {
            return mergeAs;
        }

        mergeAs = newMerge;

        return algorithm;
    };

    algorithm.windowSize = (newWindowSize?: number) => {
        if (newWindowSize === undefined) {
            return windowSize;
        }

        windowSize = newWindowSize;

        return algorithm;
    };

    return algorithm as Algorithm;
}
