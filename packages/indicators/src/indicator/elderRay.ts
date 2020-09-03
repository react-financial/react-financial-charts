import { elderRay } from "../calculator";
import { merge, rebind } from "../utils";
import { ElderRayOptions } from "../calculator/elderRay";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "ElderRay";

interface ElderRayIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): ElderRayIndicator;
    accessor(): any;
    accessor(x: any): ElderRayIndicator;
    stroke(): string | any;
    stroke(x: string | any): ElderRayIndicator;
    fill(): string | any;
    fill(x: string | any): ElderRayIndicator;
    echo(): any;
    echo(x: any): ElderRayIndicator;
    type(): string;
    type(x: string): ElderRayIndicator;
    merge(): any;
    merge(newMerge: any): ElderRayIndicator;
    options(): ElderRayOptions;
    options(newOptions: ElderRayOptions): ElderRayIndicator;
}

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d: any) => d.elderRay);

    const underlyingAlgorithm = elderRay();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.elderRay = i;
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

    return indicator as ElderRayIndicator;
}
