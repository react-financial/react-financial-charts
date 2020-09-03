import { merge, rebind } from "../utils";
import { ema } from "../calculator";
import { EMAOptions } from "../calculator/ema";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "EMA";

interface EMAIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): EMAIndicator;
    accessor(): any;
    accessor(x: any): EMAIndicator;
    stroke(): string | any;
    stroke(x: string | any): EMAIndicator;
    fill(): string | any;
    fill(x: string | any): EMAIndicator;
    echo(): any;
    echo(x: any): EMAIndicator;
    type(): string;
    type(x: string): EMAIndicator;
    merge(): any;
    merge(newMerge: any): EMAIndicator;
    options(): EMAOptions;
    options(newOptions: EMAOptions): EMAIndicator;
}

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d: any) => d.ema);

    const underlyingAlgorithm = ema();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.ema = i;
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

    return indicator as EMAIndicator;
}
