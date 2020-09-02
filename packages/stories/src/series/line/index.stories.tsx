import { Story } from "@storybook/react";
import * as React from "react";
import { LineSeries, LineSeriesProps } from "../../../../series/src/LineSeries";
import { Daily, Intraday } from "./BasicLineSeries";

export default {
    component: LineSeries,
    title: "Visualization/Series/Line",
    argTypes: {
        strokeStyle: { control: "color" },
    },
};

const Template: Story<LineSeriesProps> = (args) => <Daily {...args} />;

export const daily = Template.bind({});

const IntradayTemplate: Story<LineSeriesProps> = (args) => <Intraday {...args} />;

export const intraday = IntradayTemplate.bind({});
