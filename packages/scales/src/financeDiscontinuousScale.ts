import { ascending } from "d3-array";
import { scaleLinear, InterpolatorFactory } from "d3-scale";
import { levelDefinition } from "./levels";

const MAX_LEVEL = levelDefinition.length - 1;

export default function financeDiscontinuousScale(index: any[], backingLinearScale = scaleLinear()) {
    if (index === undefined) {
        throw new Error("Use the discontinuousTimeScaleProvider to create financeDiscontinuousScale");
    }

    function scale(newScale: number) {
        return backingLinearScale(newScale);
    }
    scale.invert = (value: number) => {
        const inverted = backingLinearScale.invert(value);
        return Math.round(inverted * 10000) / 10000;
    };
    scale.domain = (newDomain?: number[]) => {
        if (newDomain === undefined) {
            return backingLinearScale.domain();
        }

        backingLinearScale.domain(newDomain);
        return scale;
    };
    scale.range = (range?: number[]) => {
        if (range === undefined) {
            return backingLinearScale.range();
        }

        backingLinearScale.range(range);
        return scale;
    };
    scale.rangeRound = (range: number[]) => {
        return backingLinearScale.rangeRound(range);
    };
    scale.clamp = (clamp?: boolean) => {
        if (clamp === undefined) {
            return backingLinearScale.clamp();
        }

        backingLinearScale.clamp(clamp);
        return scale;
    };
    scale.interpolate = (interpolate?: InterpolatorFactory<number, number>) => {
        if (interpolate === undefined) {
            return backingLinearScale.interpolate();
        }

        backingLinearScale.interpolate(interpolate);
        return scale;
    };
    scale.ticks = (m?: number) => {
        const backingTicks = backingLinearScale.ticks(m);
        const ticksMap = new Map<number, any[]>();

        const [domainStart, domainEnd] = backingLinearScale.domain();

        const dStart = Math.ceil(domainStart);
        const dHead = index[0]?.index;
        const start = Math.max(dStart, dHead) + Math.abs(dHead);
        const end = Math.min(Math.floor(domainEnd), index[index.length - 1]?.index) + Math.abs(dHead);

        const desiredTickCount = Math.ceil(((end - start) / (domainEnd - domainStart)) * backingTicks.length);

        for (let i = MAX_LEVEL; i >= 0; i--) {
            const ticksAtLevel = ticksMap.get(i);
            const temp = ticksAtLevel === undefined ? [] : ticksAtLevel.slice();

            for (let j = start; j <= end; j++) {
                if (index[j].level === i) {
                    temp.push(index[j]);
                }
            }

            ticksMap.set(i, temp);
        }

        let unsortedTicks: number[] = [];
        for (let k = MAX_LEVEL; k >= 0; k--) {
            const selectedTicks = ticksMap.get(k) ?? [];
            if (selectedTicks.length + unsortedTicks.length > desiredTickCount * 1.5) {
                break;
            }
            unsortedTicks = unsortedTicks.concat(selectedTicks.map((d) => d.index));
        }

        const ticks = unsortedTicks.sort(ascending);

        if (end - start > ticks.length) {
            const ticksSet = new Set(ticks);

            const d = Math.abs(index[0].index);

            // ignore ticks within this distance
            const distance = Math.ceil(
                (backingTicks.length > 0
                    ? (backingTicks[backingTicks.length - 1] - backingTicks[0]) / backingTicks.length / 4
                    : 1) * 1.5,
            );

            for (let i = 0; i < ticks.length - 1; i++) {
                for (let j = i + 1; j < ticks.length; j++) {
                    if (ticks[j] - ticks[i] <= distance) {
                        ticksSet.delete(index[ticks[i] + d].level >= index[ticks[j] + d].level ? ticks[j] : ticks[i]);
                    }
                }
            }

            // @ts-ignore
            const tickValues = [...ticksSet.values()].map((i) => parseInt(i, 10));

            return tickValues;
        }

        return ticks;
    };
    scale.tickFormat = () => {
        return function (x: any) {
            const d = Math.abs(index[0].index);
            const { format, date } = index[Math.floor(x + d)];
            return format(date);
        };
    };
    scale.value = (x: any) => {
        const d = Math.abs(index[0].index);
        const row = index[Math.floor(x + d)];
        if (row !== undefined) {
            const { date } = row;
            return date;
        }
    };
    scale.nice = (count?: number) => {
        backingLinearScale.nice(count);
        return scale;
    };
    scale.index = (x?: any[]) => {
        if (x === undefined) {
            return index;
        }
        index = x;
        return scale;
    };
    scale.copy = () => {
        return financeDiscontinuousScale(index, backingLinearScale.copy());
    };
    return scale;
}
