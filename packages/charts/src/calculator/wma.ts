import { sum } from "d3-array";

import { slidingWindow } from "../utils";
import { WMA as defaultOptions } from "./defaultOptionsForComputation";

export default function () {

    let options = defaultOptions;

    const calculator = (data: any[]) => {
        const { windowSize, sourcePath } = options;

        const weight = windowSize * (windowSize + 1) / 2;

        const waverage = slidingWindow()
            .windowSize(windowSize)
            // @ts-ignore
            .sourcePath(sourcePath)
            .accumulator((values: number[]) => {
                const total = sum(values, (v, i) => {
                    return (i + 1) * v;
                });

                return total / weight;
            });

        return waverage(data);
    };

    calculator.undefinedLength = () => {
        const { windowSize } = options;

        return windowSize - 1;
    };

    calculator.options = (newOptions?: any) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator;
}
