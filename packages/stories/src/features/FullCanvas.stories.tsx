import * as React from "react";
import StockChart, { MinutesStockChart, SecondsStockChart } from "./StockChart";

export default {
    component: StockChart,
    title: "Features/Full Screen",
};

export const daily = () => <StockChart />;

export const minutes = () => <MinutesStockChart dateTimeFormat="%H:%M" />;

export const seconds = () => <SecondsStockChart dateTimeFormat="%H:%M:%S" />;
