import { slidingWindow } from "../utils";
import { Change as defaultOptions } from "./defaultOptionsForComputation";

export interface ChangeOptions {
    readonly sourcePath: string;
    readonly basePath: string;
    readonly mainKeys: string[];
    readonly compareKeys: string[];
}

interface ChangeCalculator {
    (data: any[]): any;
    undefinedLength(): number;
    options(): ChangeOptions;
    options(newOptions: ChangeOptions): ChangeCalculator;
}

export default function () {
    let options: ChangeOptions = defaultOptions;

    const calculator = (data: any[]) => {
        const { sourcePath } = options;

        const algo = slidingWindow()
            .windowSize(2)
            .sourcePath(sourcePath)
            .accumulator(([prev, curr]: any) => {
                const absoluteChange = curr - prev;
                const percentChange = (absoluteChange * 100) / prev;
                return { absoluteChange, percentChange };
            });

        const newData = algo(data);

        return newData;
    };

    calculator.undefinedLength = () => {
        return 1;
    };

    calculator.options = (newOptions?: ChangeOptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator as ChangeCalculator;
}
