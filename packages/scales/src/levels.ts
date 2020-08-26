/* eslint-disable @typescript-eslint/no-unused-vars */

export interface IFormatters {
    readonly yearFormat: string;
    readonly quarterFormat: string;
    readonly monthFormat: string;
    readonly weekFormat: string;
    readonly dayFormat: string;
    readonly hourFormat: string;
    readonly minuteFormat: string;
    readonly secondFormat: string;
    readonly milliSecondFormat: string;
}

export const defaultFormatters: IFormatters = {
    yearFormat: "%Y",
    quarterFormat: "%b",
    monthFormat: "%b",
    weekFormat: "%e",
    dayFormat: "%e",
    hourFormat: "%H:%M",
    minuteFormat: "%H:%M",
    secondFormat: "%H:%M:%S",
    milliSecondFormat: ".%L",
};

export const levelDefinition = [
    /* 22 */ (d: any, date: Date, i: number) => d.startOfYear && date.getFullYear() % 12 === 0 && "yearFormat",
    /* 21 */ (d: any, date: Date, i: number) => d.startOfYear && date.getFullYear() % 4 === 0 && "yearFormat",
    /* 20 */ (d: any, date: Date, i: number) => d.startOfYear && date.getFullYear() % 2 === 0 && "yearFormat",
    /* 19 */ (d: any, date: Date, i: number) => d.startOfYear && "yearFormat",
    /* 18 */ (d: any, date: Date, i: number) => d.startOfQuarter && "quarterFormat",
    /* 17 */ (d: any, date: Date, i: number) => d.startOfMonth && "monthFormat",
    /* 16 */ (d: any, date: Date, i: number) => d.startOfWeek && "weekFormat",
    /* 15 */ (d: any, date: Date, i: number) => d.startOfDay && i % 2 === 0 && "dayFormat",
    /* 14 */ (d: any, date: Date, i: number) => d.startOfDay && "dayFormat",
    /* 13 */ (d: any, date: Date, i: number) => d.startOfHalfDay && "hourFormat", // 12h
    /* 12 */ (d: any, date: Date, i: number) => d.startOfQuarterDay && "hourFormat", // 6h
    /* 11 */ (d: any, date: Date, i: number) => d.startOfEighthOfADay && "hourFormat", // 3h
    /* 10 */ (d: any, date: Date, i: number) => d.startOfHour && date.getHours() % 2 === 0 && "hourFormat", // 2h -- REMOVE THIS
    /* 9  */ (d: any, date: Date, i: number) => d.startOfHour && "hourFormat", // 1h
    /* 8  */ (d: any, date: Date, i: number) => d.startOf30Minutes && "minuteFormat",
    /* 7  */ (d: any, date: Date, i: number) => d.startOf15Minutes && "minuteFormat",
    /* 6  */ (d: any, date: Date, i: number) => d.startOf5Minutes && "minuteFormat",
    /* 5  */ (d: any, date: Date, i: number) => d.startOfMinute && "minuteFormat",
    /* 4  */ (d: any, date: Date, i: number) => d.startOf30Seconds && "secondFormat",
    /* 3  */ (d: any, date: Date, i: number) => d.startOf15Seconds && "secondFormat",
    /* 2  */ (d: any, date: Date, i: number) => d.startOf5Seconds && "secondFormat",
    /* 1  */ (d: any, date: Date, i: number) => d.startOfSecond && "secondFormat",
    /* 0  */ (d: any, date: Date, i: number) => "milliSecondFormat",
];
