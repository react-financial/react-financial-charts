import { merge, rebind } from "../utils";
import { forceIndex } from "../calculator";
import { ForceIndexOptions } from "../calculator/forceIndex";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "ForceIndex";

interface ForceIndexIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): ForceIndexIndicator;
    accessor(): any;
    accessor(x: any): ForceIndexIndicator;
    stroke(): string | any;
    stroke(x: string | any): ForceIndexIndicator;
    fill(): string | any;
    fill(x: string | any): ForceIndexIndicator;
    echo(): any;
    echo(x: any): ForceIndexIndicator;
    type(): string;
    type(x: string): ForceIndexIndicator;
    merge(): any;
    merge(newMerge: any): ForceIndexIndicator;
    options(): ForceIndexOptions;
    options(newOptions: ForceIndexOptions): ForceIndexIndicator;
}

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d: any) => d.forceIndex);

    const underlyingAlgorithm = forceIndex();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.forceIndex = i;
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

    return indicator as ForceIndexIndicator;
}
