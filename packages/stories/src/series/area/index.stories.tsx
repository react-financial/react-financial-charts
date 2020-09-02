import { Story } from "@storybook/react";
import * as React from "react";
import { AreaSeries, AreaSeriesProps } from "../../../../series/src/AreaSeries";
import { Daily, Intraday } from "./BasicAreaSeries";

export default {
    title: "Visualization/Series/Area",
    component: AreaSeries,
    argTypes: {
        fillStyle: { control: "color" },
        strokeStyle: { control: "color" },
    },
};

const Template: Story<AreaSeriesProps> = (args) => <Daily {...args} />;

export const daily = Template.bind({});

const IntradayTemplate: Story<AreaSeriesProps> = (args) => <Intraday {...args} />;

export const intraday = IntradayTemplate.bind({});
