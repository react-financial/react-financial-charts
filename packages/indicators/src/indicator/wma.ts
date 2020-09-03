import { merge, rebind } from "../utils";
import { wma } from "../calculator";
import { WMAOptions } from "../calculator/wma";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "WMA";

interface WMAIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): WMAIndicator;
    accessor(): any;
    accessor(x: any): WMAIndicator;
    stroke(): string | any;
    stroke(x: string | any): WMAIndicator;
    fill(): string | any;
    fill(x: string | any): WMAIndicator;
    echo(): any;
    echo(x: any): WMAIndicator;
    type(): string;
    type(x: string): WMAIndicator;
    merge(): any;
    merge(newMerge: any): WMAIndicator;
    options(): WMAOptions;
    options(newOptions: WMAOptions): WMAIndicator;
}

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d: any) => d.wma);

    const underlyingAlgorithm = wma();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.wma = i;
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

    return indicator as WMAIndicator;
}
