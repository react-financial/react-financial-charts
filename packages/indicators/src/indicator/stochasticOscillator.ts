import { merge, rebind } from "../utils";
import { sto } from "../calculator";
import { STOOptions } from "../calculator/sto";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "STO";

interface StochasticOscillatorIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): StochasticOscillatorIndicator;
    accessor(): any;
    accessor(x: any): StochasticOscillatorIndicator;
    stroke(): string | any;
    stroke(x: string | any): StochasticOscillatorIndicator;
    fill(): string | any;
    fill(x: string | any): StochasticOscillatorIndicator;
    echo(): any;
    echo(x: any): StochasticOscillatorIndicator;
    type(): string;
    type(x: string): StochasticOscillatorIndicator;
    merge(): any;
    merge(newMerge: any): StochasticOscillatorIndicator;
    options(): STOOptions;
    options(newOptions: STOOptions): StochasticOscillatorIndicator;
}

export default function () {
    const base = baseIndicator().type(ALGORITHM_TYPE);

    const underlyingAlgorithm = sto();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.sto = i;
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

    return indicator as StochasticOscillatorIndicator;
}
