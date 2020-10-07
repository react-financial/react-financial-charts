import { slidingWindow, zipper } from "@react-financial-charts/core";
import { timeFormat, timeFormatDefaultLocale } from "d3-time-format";
import financeDiscontinuousScale from "./financeDiscontinuousScale";
import { defaultFormatters, levelDefinition, IFormatters } from "./levels";

const evaluateLevel = (row: any, date: Date, i: number, formatters: IFormatters) => {
    return levelDefinition
        .map((eachLevel, idx) => {
            return {
                level: levelDefinition.length - idx - 1,

                // @ts-ignore
                format: formatters[eachLevel(row, date, i)],
            };
        })
        .find((level) => !!level.format);
};

const discontinuousIndexCalculator = slidingWindow()
    .windowSize(2)
    .undefinedValue(
        (d: Date, idx: number, { initialIndex, formatters }: { initialIndex: number; formatters: IFormatters }) => {
            const i = initialIndex;
            const row = {
                date: d.getTime(),
                startOfSecond: false,
                startOf5Seconds: false,
                startOf15Seconds: false,
                startOf30Seconds: false,
                startOfMinute: false,
                startOf5Minutes: false,
                startOf15Minutes: false,
                startOf30Minutes: false,
                startOfHour: false,
                startOfEighthOfADay: false,
                startOfQuarterDay: false,
                startOfHalfDay: false,
                startOfDay: true,
                startOfWeek: false,
                startOfMonth: false,
                startOfQuarter: false,
                startOfYear: false,
            };

            const level = evaluateLevel(row, d, i, formatters);

            return { ...row, index: i, ...level };
        },
    );

const discontinuousIndexCalculatorLocalTime = discontinuousIndexCalculator.accumulator(
    (
        [prevDate, nowDate]: [Date, Date],
        i: number,
        idx: number,
        { initialIndex, formatters }: { initialIndex: number; formatters: IFormatters },
    ) => {
        const nowSeconds = nowDate.getSeconds();
        const nowMinutes = nowDate.getMinutes();
        const nowHours = nowDate.getHours();
        const nowDay = nowDate.getDay();
        const nowMonth = nowDate.getMonth();

        const startOfSecond = nowSeconds !== prevDate.getSeconds();
        const startOf5Seconds = startOfSecond && nowSeconds % 5 === 0;
        const startOf15Seconds = startOfSecond && nowSeconds % 15 === 0;
        const startOf30Seconds = startOfSecond && nowSeconds % 30 === 0;

        const startOfMinute = nowMinutes !== prevDate.getMinutes();
        const startOf5Minutes = startOfMinute && nowMinutes % 5 <= prevDate.getMinutes() % 5;
        const startOf15Minutes = startOfMinute && nowMinutes % 15 <= prevDate.getMinutes() % 15;
        const startOf30Minutes = startOfMinute && nowMinutes % 30 <= prevDate.getMinutes() % 30;

        const startOfHour = nowHours !== prevDate.getHours();

        const startOfEighthOfADay = startOfHour && nowHours % 3 === 0;
        const startOfQuarterDay = startOfHour && nowHours % 6 === 0;
        const startOfHalfDay = startOfHour && nowHours % 12 === 0;

        const startOfDay = nowDay !== prevDate.getDay();
        // According to ISO calendar
        // Sunday = 0, Monday = 1, ... Saturday = 6
        // day of week of today < day of week of yesterday then today is start of week
        const startOfWeek = nowDay < prevDate.getDay();
        // month of today != month of yesterday then today is start of month
        const startOfMonth = nowMonth !== prevDate.getMonth();
        // if start of month and month % 3 === 0 then it is start of quarter
        const startOfQuarter = startOfMonth && nowMonth % 3 <= prevDate.getMonth() % 3;
        // year of today != year of yesterday then today is start of year
        const startOfYear = nowDate.getFullYear() !== prevDate.getFullYear();

        const row = {
            date: nowDate.getTime(),
            startOfSecond,
            startOf5Seconds,
            startOf15Seconds,
            startOf30Seconds,
            startOfMinute,
            startOf5Minutes,
            startOf15Minutes,
            startOf30Minutes,
            startOfHour,
            startOfEighthOfADay,
            startOfQuarterDay,
            startOfHalfDay,
            startOfDay,
            startOfWeek,
            startOfMonth,
            startOfQuarter,
            startOfYear,
        };

        const level = evaluateLevel(row, nowDate, i, formatters);

        return { ...row, index: i + initialIndex, ...level };
    },
);

function createIndex(realDateAccessor: any, inputDateAccessor: any, initialIndex: number, formatters: IFormatters) {
    return function (data: any[]) {
        const dateAccessor = realDateAccessor(inputDateAccessor);

        const calculate = discontinuousIndexCalculatorLocalTime.source(dateAccessor).misc({ initialIndex, formatters });

        const index = calculate(data).map((each) => {
            const { format } = each;
            return {
                index: each.index,
                level: each.level,
                date: new Date(each.date),
                format: timeFormat(format),
            };
        });

        return { index };
    };
}

export interface DiscontinuousTimeScaleProviderBuilder {
    (data: any[]): {
        data: any[];
        xScale: any;
        xAccessor: (data: any) => number;
        displayXAccessor: (data: any) => number;
    };
    initialIndex(): any;
    initialIndex(x: any): DiscontinuousTimeScaleProviderBuilder;
    inputDateAccessor(): any;
    inputDateAccessor(accessor: (data: any) => Date): DiscontinuousTimeScaleProviderBuilder;
    indexAccessor(): any;
    indexAccessor(x: any): DiscontinuousTimeScaleProviderBuilder;
    indexMutator(): any;
    indexMutator(x: any): DiscontinuousTimeScaleProviderBuilder;
    withIndex(): any;
    withIndex(x: any): DiscontinuousTimeScaleProviderBuilder;
    utc(): DiscontinuousTimeScaleProviderBuilder;
    setLocale(locale?: any, formatters?: IFormatters): DiscontinuousTimeScaleProviderBuilder;
    indexCalculator(): any;
}

export function discontinuousTimeScaleProviderBuilder() {
    let initialIndex = 0;
    let realDateAccessor = (d: any) => d;
    let inputDateAccessor = (d: any) => d.date;
    let indexAccessor = (d: any) => d.idx;
    let indexMutator = (d: any, idx: any) => ({ ...d, idx });
    let withIndex: any;

    let currentFormatters = defaultFormatters;

    const discontinuousTimeScaleProvider = function (data: any[]) {
        let index = withIndex;

        if (index === undefined) {
            const response = createIndex(realDateAccessor, inputDateAccessor, initialIndex, currentFormatters)(data);

            index = response.index;
        }

        const inputIndex = index;

        const xScale = financeDiscontinuousScale(inputIndex);

        const mergedData = zipper().combine(indexMutator);

        const finalData = mergedData(data, inputIndex);

        return {
            data: finalData,
            xScale,
            xAccessor: (d: any) => d && indexAccessor(d)?.index,
            displayXAccessor: realDateAccessor(inputDateAccessor),
        };
    };

    discontinuousTimeScaleProvider.initialIndex = function (x: any) {
        if (!arguments.length) {
            return initialIndex;
        }
        initialIndex = x;
        return discontinuousTimeScaleProvider;
    };
    discontinuousTimeScaleProvider.inputDateAccessor = function (x: any) {
        if (!arguments.length) {
            return inputDateAccessor;
        }
        inputDateAccessor = x;
        return discontinuousTimeScaleProvider;
    };
    discontinuousTimeScaleProvider.indexAccessor = function (x: any) {
        if (!arguments.length) {
            return indexAccessor;
        }
        indexAccessor = x;
        return discontinuousTimeScaleProvider;
    };
    discontinuousTimeScaleProvider.indexMutator = function (x: any) {
        if (!arguments.length) {
            return indexMutator;
        }
        indexMutator = x;
        return discontinuousTimeScaleProvider;
    };
    discontinuousTimeScaleProvider.withIndex = function (x: any) {
        if (!arguments.length) {
            return withIndex;
        }
        withIndex = x;
        return discontinuousTimeScaleProvider;
    };
    discontinuousTimeScaleProvider.utc = () => {
        realDateAccessor = (dateAccessor) => (d: any) => {
            const date = dateAccessor(d);
            // The getTimezoneOffset() method returns the time-zone offset from UTC, in minutes, for the current locale.
            const offsetInMillis = date.getTimezoneOffset() * 60 * 1000;
            return new Date(date.getTime() + offsetInMillis);
        };

        return discontinuousTimeScaleProvider;
    };
    discontinuousTimeScaleProvider.setLocale = (locale?: any, formatters?: IFormatters) => {
        if (locale !== undefined) {
            timeFormatDefaultLocale(locale);
        }
        if (formatters !== undefined) {
            currentFormatters = formatters;
        }

        return discontinuousTimeScaleProvider;
    };

    discontinuousTimeScaleProvider.indexCalculator = function () {
        return createIndex(realDateAccessor, inputDateAccessor, initialIndex, currentFormatters);
    };

    return discontinuousTimeScaleProvider as DiscontinuousTimeScaleProviderBuilder;
}

export default discontinuousTimeScaleProviderBuilder();
