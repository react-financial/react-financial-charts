import { merge, rebind } from "../utils";
import { compare } from "../calculator";
import { CompareOptions } from "../calculator/compare";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "Compare";

interface CompareIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): CompareIndicator;
    accessor(): any;
    accessor(x: any): CompareIndicator;
    stroke(): string | any;
    stroke(x: string | any): CompareIndicator;
    fill(): string | any;
    fill(x: string | any): CompareIndicator;
    echo(): any;
    echo(x: any): CompareIndicator;
    type(): string;
    type(x: string): CompareIndicator;
    merge(): any;
    merge(newMerge: any): CompareIndicator;
    options(): CompareOptions;
    options(newOptions: CompareOptions): CompareIndicator;
}

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d: any) => d.compare);

    const underlyingAlgorithm = compare();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.compare = i;
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
    rebind(indicator, mergedAlgorithm, "merge");

    return indicator as CompareIndicator;
}
