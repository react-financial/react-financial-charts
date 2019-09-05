import * as React from "react";
import { render } from "react-dom";
import { ResponsiveStockChart } from "./components";

const app = (
    <ResponsiveStockChart />
);

const containerElement = document.getElementById("app");

render(app, containerElement);
