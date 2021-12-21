import { Story } from "@storybook/react";
import * as React from "react";
import { YAxis, YAxisProps } from "../../../../axes/src/YAxis.js";
import AxisExample from "./Axis.js";

export default {
    component: YAxis,
    title: "Features/Axis",
    argTypes: {
        axisAt: {
            control: {
                type: "select",
                options: ["left", "right", "middle"],
            },
        },
        gridLinesStrokeStyle: { control: "color" },
        strokeStyle: { control: "color" },
        tickLabelFill: { control: "color" },
        tickStrokeStyle: { control: "color" },
    },
};

const Template: Story<YAxisProps> = (args) => <AxisExample {...args} />;

export const yAxis = Template.bind({});
