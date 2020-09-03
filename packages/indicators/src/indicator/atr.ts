import { atr } from "../calculator";
import { merge, rebind } from "../utils";
import { ATROptions } from "../calculator/atr";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "ATR";

interface ATRIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): ATRIndicator;
    accessor(): any;
    accessor(x: any): ATRIndicator;
    stroke(): string | any;
    stroke(x: string | any): ATRIndicator;
    fill(): string | any;
    fill(x: string | any): ATRIndicator;
    echo(): any;
    echo(x: any): ATRIndicator;
    type(): string;
    type(x: string): ATRIndicator;
    merge(): any;
    merge(newMerge: any): ATRIndicator;
    options(): ATROptions;
    options(newOptions: ATROptions): ATRIndicator;
    skipUndefined(): boolean;
    skipUndefined(newSkipUndefined: boolean): ATRIndicator;
}

export default function () {
    const base = baseIndicator().type(ALGORITHM_TYPE);

    const underlyingAlgorithm = atr();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.atr = i;
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
    rebind(indicator, underlyingAlgorithm, "options");
    rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");

    return indicator as ATRIndicator;
}
