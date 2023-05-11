import { timeSecond, timeMinute, timeHour, timeDay, timeWeek, timeMonth, timeYear } from "d3-time";
import { timeFormat as d3TimeFormat } from "d3-time-format";

const formatMillisecond = d3TimeFormat(".%L");
const formatSecond = d3TimeFormat(":%S");
const formatMinute = d3TimeFormat("%H:%M");
const formatHour = d3TimeFormat("%H:%M");
const formatDay = d3TimeFormat("%e");
const formatWeek = d3TimeFormat("%e");
const formatMonth = d3TimeFormat("%b");
const formatYear = d3TimeFormat("%Y");

export const timeFormat = (date: Date) => {
    return (
        timeSecond(date) < date
            ? formatMillisecond
            : timeMinute(date) < date
            ? formatSecond
            : timeHour(date) < date
            ? formatMinute
            : timeDay(date) < date
            ? formatHour
            : timeMonth(date) < date
            ? timeWeek(date) < date
                ? formatDay
                : formatWeek
            : timeYear(date) < date
            ? formatMonth
            : formatYear
    )(date);
};
