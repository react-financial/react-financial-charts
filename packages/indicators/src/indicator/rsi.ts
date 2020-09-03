import { merge, rebind } from "../utils";
import { rsi } from "../calculator";
import { RSIOptions } from "../calculator/rsi";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "RSI";

interface RSIIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): RSIIndicator;
    accessor(): any;
    accessor(x: any): RSIIndicator;
    stroke(): string | any;
    stroke(x: string | any): RSIIndicator;
    fill(): string | any;
    fill(x: string | any): RSIIndicator;
    echo(): any;
    echo(x: any): RSIIndicator;
    type(): string;
    type(x: string): RSIIndicator;
    merge(): any;
    merge(newMerge: any): RSIIndicator;
    options(): RSIOptions;
    options(newOptions: RSIOptions): RSIIndicator;
}

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d: any) => d.rsi);

    const underlyingAlgorithm = rsi();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.rsi = i;
        });

    const indicator = (data: any[], options = { merge: true }) => {
        if (options.merge) {
            if (!base.accessor()) {
                throw new Error(`Set an accessor to ${ALGORITHM_TYPE} before calculating`);
            }

            return mergedAlgorithm(data);
        }

        return underlyingAlgorithm(data);
    };

    rebind(indicator, base, "id", "accessor", "stroke", "fill", "echo", "type");
    rebind(indicator, underlyingAlgorithm, "options", "undefinedLength");
    rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");

    return indicator as RSIIndicator;
}
