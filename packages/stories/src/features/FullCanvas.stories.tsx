import * as React from "react";
import StockChart, { IntradayStockChart } from "./stockChart";

export default {
    component: StockChart,
    title: "Features|Full Screen",
};

export const daily = () => <StockChart />;

export const intraDay = () => <IntradayStockChart dateTimeFormat="%H:%M" />;
