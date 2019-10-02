import { path, slidingWindow } from "../utils";
import { ForceIndex as defaultOptions } from "./defaultOptionsForComputation";

export default function () {

    let options = defaultOptions;

    const calculator = (data: any[]) => {
        const { sourcePath, volumePath } = options;

        // @ts-ignore
        const source = path(sourcePath);

        // @ts-ignore
        const volume = path(volumePath);

        const forceIndexCalulator = slidingWindow()
            .windowSize(2)
            // @ts-ignore
            .accumulator(([prev, curr]) => (source(curr) - source(prev)) * volume(curr));

        const forceIndex = forceIndexCalulator(data);

        return forceIndex;
    };

    calculator.undefinedLength = () => {
        return 2;
    };

    calculator.options = (newOptions?: { sourcePath: string, volumePath: string }) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator;
}
