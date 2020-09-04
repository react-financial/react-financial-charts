import { mean } from "d3-array";
import { slidingWindow } from "../utils";
import { SMA as defaultOptions } from "./defaultOptionsForComputation";

export interface SMAOptions {
    readonly sourcePath?: string;
    readonly windowSize: number;
}

export default function () {
    let options = defaultOptions;

    const calculator = (data: any[]) => {
        const { windowSize, sourcePath } = options;

        const average = slidingWindow()
            .windowSize(windowSize)
            .sourcePath(sourcePath)
            .accumulator((values: any[]) => mean(values));

        return average(data);
    };

    calculator.undefinedLength = () => {
        const { windowSize } = options;

        return windowSize - 1;
    };

    calculator.options = (newOptions?: SMAOptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator;
}
