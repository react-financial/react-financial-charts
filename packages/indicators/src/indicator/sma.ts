import { merge, rebind } from "../utils";
import { sma } from "../calculator";
import { SMAOptions } from "../calculator/sma";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "SMA";

interface SMAIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): SMAIndicator;
    accessor(): any;
    accessor(x: any): SMAIndicator;
    stroke(): string | any;
    stroke(x: string | any): SMAIndicator;
    fill(): string | any;
    fill(x: string | any): SMAIndicator;
    echo(): any;
    echo(x: any): SMAIndicator;
    type(): string;
    type(x: string): SMAIndicator;
    merge(): any;
    merge(newMerge: any): SMAIndicator;
    options(): SMAOptions;
    options(newOptions: SMAOptions): SMAIndicator;
}

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d: any) => d.sma);

    const underlyingAlgorithm = sma();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.sma = i;
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

    return indicator as SMAIndicator;
}
