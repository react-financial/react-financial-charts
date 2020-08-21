/* eslint-disable @typescript-eslint/no-unused-vars */
export const defaultFormatters = {
    yearFormat: "%Y",
    quarterFormat: "%b",
    monthFormat: "%b",
    weekFormat: "%e",
    dayFormat: "%e",
    hourFormat: "%H:%M",
    minuteFormat: "%H:%M",
    secondFormat: "%H:%M:%S",
    milliSecondFormat: "%H:%M:%S.%L",
};

export const levelDefinition = [
    /* 19 */ (d, date: Date, i: number) => d.startOfYear && date.getFullYear() % 12 === 0 && "yearFormat",
    /* 18 */ (d, date: Date, i: number) => d.startOfYear && date.getFullYear() % 4 === 0 && "yearFormat",
    /* 17 */ (d, date: Date, i: number) => d.startOfYear && date.getFullYear() % 2 === 0 && "yearFormat",
    /* 16 */ (d, date: Date, i: number) => d.startOfYear && "yearFormat",
    /* 15 */ (d, date: Date, i: number) => d.startOfQuarter && "quarterFormat",
    /* 14 */ (d, date: Date, i: number) => d.startOfMonth && "monthFormat",
    /* 13 */ (d, date: Date, i: number) => d.startOfWeek && "weekFormat",
    /* 12 */ (d, date: Date, i: number) => d.startOfDay && i % 2 === 0 && "dayFormat",
    /* 11 */ (d, date: Date, i: number) => d.startOfDay && "dayFormat",
    /* 10 */ (d, date: Date, i: number) => d.startOfHalfDay && "hourFormat", // 12h
    /*  9 */ (d, date: Date, i: number) => d.startOfQuarterDay && "hourFormat", // 6h
    /*  8 */ (d, date: Date, i: number) => d.startOfEighthOfADay && "hourFormat", // 3h
    /*  7 */ (d, date: Date, i: number) => d.startOfHour && date.getHours() % 2 === 0 && "hourFormat", // 2h -- REMOVE THIS
    /*  6 */ (d, date: Date, i: number) => d.startOfHour && "hourFormat", // 1h
    /*  5 */ (d, date: Date, i: number) => d.startOf30Minutes && "minuteFormat",
    /*  4 */ (d, date: Date, i: number) => d.startOf15Minutes && "minuteFormat",
    /*  3 */ (d, date: Date, i: number) => d.startOf5Minutes && "minuteFormat",
    /*  2 */ (d, date: Date, i: number) => d.startOfMinute && "minuteFormat",
    /*  1 */ (d, date: Date, i: number) => d.startOf30Seconds && "secondFormat",
    /*  0 */ (d, date: Date, i: number) => "secondFormat",
];
