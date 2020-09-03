import { merge, rebind } from "../utils";
import { tma } from "../calculator";
import { TMAOptions } from "../calculator/tma";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "TMA";

interface TMAIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): TMAIndicator;
    accessor(): any;
    accessor(x: any): TMAIndicator;
    stroke(): string | any;
    stroke(x: string | any): TMAIndicator;
    fill(): string | any;
    fill(x: string | any): TMAIndicator;
    echo(): any;
    echo(x: any): TMAIndicator;
    type(): string;
    type(x: string): TMAIndicator;
    merge(): any;
    merge(newMerge: any): TMAIndicator;
    options(): TMAOptions;
    options(newOptions: TMAOptions): TMAIndicator;
}

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d: any) => d.tma);

    const underlyingAlgorithm = tma();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.tma = i;
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

    return indicator as TMAIndicator;
}
