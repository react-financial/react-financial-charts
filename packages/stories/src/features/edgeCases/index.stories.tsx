import React, { useEffect, useState } from "react";
import BasicLineSeries from "./BasicLineSeries";

export default {
    title: "Features/EdgeCases",
};

export const noData = () => <BasicLineSeries data={[]} />;

export const singleDataPoint = () => (
    <BasicLineSeries data={[{ close: 120, open: 120, high: 140, low: 100, date: new Date(), volume: 1_000_000 }]} />
);

export const twoDataPoint = () => (
    <BasicLineSeries
        data={[
            { close: 120, open: 120, high: 140, low: 100, date: new Date(2020, 7, 8, 10, 0, 0, 0), volume: 1_000_000 },
            { close: 140, open: 120, high: 140, low: 100, date: new Date(2020, 7, 8, 10, 1, 0, 0), volume: 1_000_000 },
        ]}
    />
);

export const threeDataPoint = () => (
    <BasicLineSeries
        data={[
            { close: 120, open: 120, high: 140, low: 100, date: new Date(2020, 7, 8, 10, 0, 0, 0), volume: 1_000_000 },
            { close: 140, open: 120, high: 150, low: 100, date: new Date(2020, 7, 8, 10, 1, 0, 0), volume: 1_000_000 },
            { close: 120, open: 120, high: 140, low: 100, date: new Date(2020, 7, 8, 10, 2, 0, 0), volume: 1_000_000 },
        ]}
    />
);

export const emptyThenThreeAsync = () => {
    const [data, setData] = useState<any[]>([]);
    useEffect(() => {
        const timeout = setTimeout(() => {
            console.log("Set data");
            setData([
                {
                    close: 120,
                    open: 120,
                    high: 140,
                    low: 100,
                    date: new Date(2020, 7, 8, 10, 0, 0, 0),
                    volume: 1_000_000,
                },
                {
                    close: 140,
                    open: 120,
                    high: 150,
                    low: 100,
                    date: new Date(2020, 7, 8, 10, 1, 0, 0),
                    volume: 1_000_000,
                },
                {
                    close: 120,
                    open: 120,
                    high: 140,
                    low: 100,
                    date: new Date(2020, 7, 8, 10, 2, 0, 0),
                    volume: 1_000_000,
                },
            ]);
        }, 1000);
        return () => clearTimeout(timeout);
    }, []);
    return <BasicLineSeries data={data} />;
};
