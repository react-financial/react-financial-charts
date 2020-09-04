import { path, slidingWindow } from "../utils";
import { ForceIndex as defaultOptions } from "./defaultOptionsForComputation";

export interface ForceIndexOptions {
    readonly sourcePath: string;
    readonly volumePath: string;
}

export default function () {
    let options = defaultOptions;

    const calculator = (data: any[]) => {
        const { sourcePath, volumePath } = options;

        const source = path(sourcePath);

        const volume = path(volumePath);

        const forceIndexCalulator = slidingWindow()
            .windowSize(2)
            .accumulator(([prev, curr]: any) => (source(curr) - source(prev)) * volume(curr));

        const forceIndex = forceIndexCalulator(data);

        return forceIndex;
    };

    calculator.undefinedLength = () => {
        return 2;
    };

    calculator.options = (newOptions?: ForceIndexOptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator;
}
