import { head, isDefined, isNotDefined, path } from "../utils";
import { Change as defaultOptions } from "./defaultOptionsForComputation";

export interface CompareOptions {
    readonly basePath: string;
    readonly compareKeys: string[];
    readonly mainKeys: string[];
    readonly sourcePath: string;
}

export default function () {
    let options: CompareOptions = defaultOptions;

    const calculator = (data: any[]) => {
        const { basePath, mainKeys, compareKeys } = options;

        // @ts-ignore
        const base = path(basePath);

        const first = head(data);
        const b = base(first);

        const firsts = {};

        const compareData = data.map((d) => {
            const result = {};

            mainKeys.forEach((key) => {
                if (typeof d[key] === "object") {
                    // @ts-ignore
                    result[key] = {};
                    Object.keys(d[key]).forEach((subkey) => {
                        // @ts-ignore
                        result[key][subkey] = (d[key][subkey] - b) / b;
                    });
                } else {
                    // @ts-ignore
                    result[key] = (d[key] - b) / b;
                }
            });

            compareKeys.forEach((key) => {
                if (isDefined(d[key]) && isNotDefined(firsts[key])) {
                    // @ts-ignore
                    firsts[key] = d[key];
                }
                if (isDefined(d[key]) && isDefined(firsts[key])) {
                    // @ts-ignore
                    result[key] = (d[key] - firsts[key]) / firsts[key];
                }
            });
            return result;
        });

        return compareData;
    };

    calculator.options = (newOptions?: CompareOptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator;
}
